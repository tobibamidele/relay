import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { and, eq, isNull, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { UpdateEndpointDto } from "./dto/update-endpoint-dto.js";

@Injectable()
export class EndpointsService {
    constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async findEndpointsByProjectID(projectId: string) {
    const result = await this.db
      .select()
      .from(schema.endpoints)
      .where(
        and(
          eq(schema.endpoints.projectId, projectId),
          isNull(schema.endpoints.deletedAt),
        )
      )

    return result;
  }

  async findEndpointsByEndpointID(id: string, projectId: string) {
    const [result] = await this.db
      .select()
      .from(schema.endpoints)
      .where(
        and(
          eq(schema.endpoints.id, id),
          eq(schema.endpoints.projectId, projectId),
          isNull(schema.endpoints.deletedAt),
        )
      )

    return result;
  }

  // TODO: Don't store raw secret in the database
  async createEndpoint(projectId: string, url: string, events: string[], enabled: boolean) {
    const secret = randomBytes(12).toString("base64")
    const [result] = await this.db
      .insert(schema.endpoints)
      .values({
        projectId,
        url,
        secret,
        events,
        enabled,
      }).returning({
        id: schema.endpoints.id,
        url: schema.endpoints.url,
        events: schema.endpoints.events,
        enabled: schema.endpoints.enabled,
        createdAt: schema.endpoints.createdAt
      });

    return result; 
  }

  async deleteEndpointByID(id: string, projectId: string) {
    return await this.db
      .update(schema.endpoints)
      .set({
        deletedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(
        and(
          eq(schema.endpoints.id, id),
          eq(schema.endpoints.projectId, projectId)
        )
      );
  }

  async updateEndpointByID(id: string, projectId: string, data: UpdateEndpointDto) {
    try {
    const [updatedEndpoint] = await this.db
      .update(schema.endpoints)
      .set({ // no mass-assignment
        url: data.url,
        events: data.events,
        enabled: data.enabled,
      })
      .where(
        and(
          eq(schema.endpoints.id, id),
          eq(schema.endpoints.projectId, projectId)
        )
      )
      .returning();

      if (!updatedEndpoint) {
        throw new BadRequestException('bad request')
      }
      return updatedEndpoint;
    } catch (e) {
      throw new BadRequestException('bad request')
    }
  }
}
