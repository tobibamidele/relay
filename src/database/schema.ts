import { createId } from "@paralleldrive/cuid2";
import { create } from "domain";
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
  secret: text('secret').notNull(),
  events: text('events', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  deletedAt: text('deleted_at')
})

export const events = sqliteTable('events', {
  id: text('id').primaryKey().$defaultFn(() => "evt_" + createId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text('type').notNull(),
  data: text('data', { mode: "json" }).notNull(),
  idempotencyKey: text('idempotency_key'),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export const deliveryStatusEnum = ['pending', 'processing', 'retrying', 'failed', 'delivered', 'dead_letter'] as const;

export const deliveries = sqliteTable('deliveries', {
  id: text('id').primaryKey().$defaultFn(() => "dlv_" + createId()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: "cascade"} ),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: "no action" }),
  endpointId: text('endpoint_id').notNull().references(() => endpoints.id, { onDelete: "no action"}),
  status: text('status', { enum: deliveryStatusEnum }).default('pending').notNull(),
  attemptCount: integer('attempt_count').notNull(),
  lastAttemptAt: text('last_attempt_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  nextAttemptAt: text('next_attempt_at'),
  completedAt: text('completed_at'),
  lastStatusCode: integer('last_status_code'),
  lastError: text('last_error'),
  createdAt: text('created_at')
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

// Infer TS Type for the field
export type DeliveryStatus = (typeof deliveryStatusEnum)[number];
