import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { and, eq } from "drizzle-orm";

@Injectable()
export class EventsService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async getEventsByProjectID(projectId: string) {
    return this.db.query.events.findMany({
      where: (events, { eq }) => eq(events.projectId, projectId),
    });
  }

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
}
