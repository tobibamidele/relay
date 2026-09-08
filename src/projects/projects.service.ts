import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from '../database/schema.js';
import { eq } from "drizzle-orm";

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async createProject(name: string): Promise<{ id: string, name: string, apiKey: string }> {
    const apiKey = "rk_live_" + crypto.randomBytes(12).toString("hex");
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    const [result] = await this.db.insert(schema.projects).values({
      name,
      apiKey: hashedKey,
    }).returning();

    return { 
      id: result.id,
      name: result.name,
      apiKey,
    }
  }

  async findByID(id: string) {
    const [result] = await this.db.select().from(schema.projects).where(eq(schema.projects.id, id));
    const { apiKey, ...safeResult } = result;
    return safeResult;
  }
}
