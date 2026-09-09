import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";

@Injectable()
export class APIKeyService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async listKeysByProjectID(projectId: string) {
    return await this.db.query.apiKeys.findMany({
      where: (apiKeys, { eq }) => eq(apiKeys.projectId, projectId),
      columns: {
        keyHash: false, // remove keyHash from response
      }
    })
  }
}
