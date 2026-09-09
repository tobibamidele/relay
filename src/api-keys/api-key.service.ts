import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import * as crypto from "crypto";
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from "../database/schema.js";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class APIKeyService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  /// Only generate a raw api key text, nothing else
  generateAPIKey() {
    return "rk_live_" + crypto.randomBytes(12).toString("hex");
  }

  async listKeysByProjectID(projectId: string) {
    return await this.db.query.apiKeys.findMany({
      where: (apiKeys, { eq }) => eq(apiKeys.projectId, projectId),
      columns: {
        keyHash: false, // remove keyHash from response
      }
    })
  }

  async createAPIKey(name: string, projectId: string): Promise<{ id: string, name: string, createdAt: string, apiKey: string }> {
    const rawAPIKey = this.generateAPIKey();
    const [newKey] = await this.db.insert(schema.apiKeys)
      .values({
        projectId: projectId,
        name: name,
        keyHash: crypto.createHash("sha256").update(rawAPIKey).digest("hex"),
      }).returning({
        id: schema.apiKeys.id,
        name: schema.apiKeys.name,
        createdAt: schema.apiKeys.createdAt,
      })

    return { 
      id: newKey.id,
      name: newKey.name,
      createdAt: newKey.createdAt,
      apiKey: rawAPIKey,
    }
  }

  async revokeAPIKey(keyId: string, projectId: string) {
    const [revokedKey] = await this.db.update(schema.apiKeys)
      .set({ 
        revokedAt: sql`(CURRENT_TIMESTAMP)`
      })
      .where(
        and(
          eq(schema.apiKeys.id, keyId),
          eq(schema.apiKeys.projectId, projectId)
        )
      ).returning();

    if (!revokedKey) {
      throw new NotFoundException('API Key not found or already revoked');
    }

    return revokedKey;
  }
}
