import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey().$defaultFn(() => "proj_" + createId()),
    name: text('name').notNull(),
    apiKey: text('api_key').notNull().unique(),
    createdAt: text('created_at')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text('updated_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})
