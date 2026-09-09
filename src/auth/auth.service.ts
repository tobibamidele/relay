import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import * as schema from '../database/schema.js';
import { DRIZZLE } from '../database/database.provider.js';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle<typeof schema>>,
  ) {}

  // TODO: Update last used at
  async findActiveProjectByAPIKey(key: string): Promise<{ name: string, id: string } | null> {
    const hashedKey = createHash('sha256').update(key).digest('hex');
    const storedKeyRecord = await this.db.select()
      .from(schema.apiKeys)
      .where(
        and(
          eq(schema.apiKeys.keyHash, hashedKey),
          isNull(schema.apiKeys.revokedAt),
        )
      );

    const storedKey = storedKeyRecord[0];
    if (!storedKey) {
      return null;
    }

    const projectRecord = await this.db.select()
      .from(schema.projects)
      .where(eq(schema.projects.id, storedKey.projectId));

    const project = projectRecord[0];
    if (!project) {
      return null;
    }

    return {
      name: project.name,
      id: project.id,
    }
  }
}

