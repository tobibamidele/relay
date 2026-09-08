import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as schema from '../database/schema.js';
import { DRIZZLE } from '../database/database.provider.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  async findProjectByAPIKey(key: string): Promise<{ name: string, id: string } | null> {
    const hashedKey = createHash('sha256').update(key).digest('hex');
    const result = await this.db.select()
      .from(schema.projects)
      .where(eq(schema.projects.apiKey, hashedKey));

    const project = result[0];
    if (!project) {
      return null;
    }

    return {
      name: project.name,
      id: project.id,
    };
  }
}

