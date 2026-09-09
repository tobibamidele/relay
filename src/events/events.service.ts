import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { and, eq, lt, or } from "drizzle-orm";
import { GetEventsDto } from "./dto/get-events-dto.js";

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
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
        createdAt: schema.events.createdAt,
      });

    return result
  }
}
