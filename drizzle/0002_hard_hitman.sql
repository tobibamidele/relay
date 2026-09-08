ALTER TABLE `projects` ADD `created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL;