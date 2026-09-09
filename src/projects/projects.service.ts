import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { DRIZZLE } from "../database/database.provider.js";
import * as schema from '../database/schema.js';
import { eq } from "drizzle-orm";
import { APIKeyService } from "../api-keys/api-key.service.js";

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
    private readonly apiKeyService: APIKeyService,
  ) {}

  async createProject(name: string): Promise<{ id: string, name: string, createdAt: string, apiKey: string }> {
    const apiKey = this.apiKeyService.generateAPIKey()
    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

    const [createdProject] = await this.db.insert(schema.projects).values({ name }).returning();
    if (!createdProject) {
      throw new Error('Failed to create project')
    }

    this.db.insert(schema.apiKeys)
      .values({
        projectId: createdProject.id,
        name: 'Default API Key',
        keyHash: hashedKey,
      }).run()

    return {
      id: createdProject.id,
      name: createdProject.name,
      createdAt: createdProject.createdAt,
      apiKey: apiKey,
    }
  }

  async findByID(id: string) {
    const [result] = await this.db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return result;
  }
}
