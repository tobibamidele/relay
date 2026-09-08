import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from './schema.js';
import { ConfigService } from "@nestjs/config";

export const DRIZZLE = 'DRIZZLE_CONNECTION';

export const drizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const dbUrl = configService.get<string>("DATABASE_URL");
    const sqlite = new Database(dbUrl);
    return drizzle(sqlite, { schema });
  }
}
