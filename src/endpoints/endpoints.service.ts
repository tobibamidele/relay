import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { eq } from "drizzle-orm";

@Injectable()
export class EndpointsService {
    constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async findEndpointsByProjectID(projectId: string) {
    const result = await this.db
      .select()
      .from(schema.endpoints)
      .where(eq(schema.endpoints.projectId, projectId))

    return result;
  }

  async createEndpoint(projectId: string, url: string, events: string[], enabled: boolean) {
    const result = await this.db
      .insert(schema.endpoints)
      .values({
        projectId,
        url,
        events,
        enabled,
      }).returning();

    return result[0].enabled;
  }
}
