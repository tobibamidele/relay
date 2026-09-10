import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { GetDeliveriesDto } from "./dto/get-deliveries-dto.js";
import { and, eq } from "drizzle-orm";
import { SendDeliveryDto } from "./dto/send-delivery-dto.js";

@Injectable()
export class DeliveryService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async getDeliveryByID(id: string, projectId: string) {
    const result = await this.db.query.deliveries.findFirst({
      where: (delivery, {and, eq}) => { 
        and(
          eq(delivery.id, id),
          eq(delivery.projectId, projectId),
        )
      },
      columns: {
        projectId: false,
      }
    });

    return result;
  }

  async findAll(projectId: string, query: GetDeliveriesDto) {
    const { status, eventId, endpointId } = query;

    const conditions = [];
    conditions.push(eq(schema.deliveries.projectId, projectId))

    if (status) {
      conditions.push(eq(schema.deliveries.status, status))
    }

    if (eventId) {
      conditions.push(eq(schema.deliveries.eventId, eventId))
    }

    if (endpointId) {
      conditions.push(eq(schema.deliveries.endpointId, endpointId))
    }

    const deliveries = await this.db
      .select()
      .from(schema.deliveries)
      .where(conditions.length > 0 ? and(...conditions): undefined)
      .orderBy(schema.deliveries.createdAt, schema.deliveries.id)

    return deliveries;
  }

  async processDeliveries(data: SendDeliveryDto): Promise<boolean> {
    // make the request to each endpoint
    // Create delivery record
    data.endpointIds.forEach(async (epId) => {
      const result = await this.db
        .insert(schema.deliveries)
        .values({
          projectId: data.projectId,
          eventId: data.eventId,
          endpointId: epId,
          attemptCount: 1,
        })
    })

    return true;
  }
}
