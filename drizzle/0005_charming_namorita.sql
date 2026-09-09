CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`last_used_at` text DEFAULT (CURRENT_TIMESTAMP),
	`revoked_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
DROP INDEX `projects_api_key_unique`;--> statement-breakpoint
ALTER TABLE `projects` DROP COLUMN `api_key`;