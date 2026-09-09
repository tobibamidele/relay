import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable('projects', {
    id: text('id').primaryKey().$defaultFn(() => "proj_" + createId()),
    name: text('name').notNull(),
    createdAt: text('created_at')
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text('updated_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey().$defaultFn(() => "api_key_" + createId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: "cascade"} ),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  lastUsedAt: text('last_used_at')
    .default(sql`(CURRENT_TIMESTAMP)`),
  revokedAt: text('revoked_at'),
})

export const endpoints = sqliteTable('endpoints', {
  id: text('id').primaryKey().$defaultFn(() => "endp_" + createId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: "cascade" }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  url: text('url').notNull(),
  events: text('events', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})
