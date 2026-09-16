import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { and, eq, isNull, lt, or, sql } from "drizzle-orm";
import { GetEventsDto } from "./dto/get-events-dto.js";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SendDeliveryDto } from "../deliveries/dto/send-delivery-dto.js";

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
    @InjectQueue('delivery-queue') private readonly deliveryQueue: Queue,
  ) {}

  async getEventByID(id: string, projectId: string) {
    const [result] = await this.db.select()
      .from(schema.events)
      .where(
        and(
          eq(schema.events.id, id),
          eq(schema.events.projectId, projectId)
        )
      )

    return result
  }

  async findAll(projectId: string, query: GetEventsDto) {
    const { type, limit, cursor } = query;

    const conditions = [];

    if (type) {
      conditions.push(eq(schema.events.type, type))
    }

    // Cursor is the base64 string of createdAt & id
    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const [createdAtIso, id] = decoded.split('|');

      conditions.push(
        or(
          lt(schema.events.createdAt, createdAtIso),
          and(
            eq(schema.events.createdAt, createdAtIso),
            eq(schema.events.projectId, projectId),
            lt(schema.events.id, id),
          )
        )
      );
    }

    // Fetch limit + 1 items to check for next page
    const events = await this.db
      .select()
      .from(schema.events)
      .where(conditions.length > 0 ? and(...conditions): undefined)
      .orderBy(schema.events.createdAt, schema.events.id) // DESC order assumming newest first
      .limit(limit + 1)

    const hasNextPage = events.length > limit;
    const data = hasNextPage ? events.slice(0, limit) : events;

    // Generate next cursor if a next page exists
    let nextCursor: string | null = null;
    if (hasNextPage) {
      const lastItem = data[data.length - 1]
      const cursorPayload = `${lastItem.createdAt.toString()}|${lastItem.id}`
      nextCursor = Buffer.from(cursorPayload).toString('base64');
    }

    return {
      data,
      pagination: {
        nextCursor
      },
    };
  }


  async createEvent(projectId: string, type: string, data: Record<string, any>, idempotencyKey?: string) {
    const [result] = await this.db
      .insert(schema.events)
      .values({
        projectId: projectId,
        type: type,
        data: data,
        idempotencyKey: idempotencyKey,
      }).returning({
        id: schema.events.id,
        type: schema.events.type,
        data: schema.events.data,
        idempotencyKey: schema.events.idempotencyKey,
        createdAt: schema.events.createdAt,
      });


    // Query active endpoints matching projectId and subscribe event type
    const targetEndpoints = await this.db
      .select({
        id: schema.endpoints.id,
        url: schema.endpoints.url,
        secret: schema.endpoints.secret,
      })
      .from(schema.endpoints)
      .where(
        and(
          eq(schema.endpoints.projectId, projectId),
          eq(schema.endpoints.enabled, true),
          isNull(schema.endpoints.deletedAt),
          sql`EXISTS(
            SELECT 1
            FROM json_each(${schema.endpoints.events})
            WHERE json_each.value = ${result.type}
          )`
        )
      );

    if (targetEndpoints.length === 0) {
      return result;
    }

    const sendEventDto: SendDeliveryDto = {
      projectId: projectId,
      eventId: result.id,
      type: result.type,
      endpoints: targetEndpoints.map((ep) => ({ id: ep.id, url: ep.url, secret: ep.secret })),
      idempotencyKey: result.idempotencyKey,
      data: result.data as Record<string, any>,
    }


    await this.deliveryQueue.add('send-event', sendEventDto);

    return result
  }
}
