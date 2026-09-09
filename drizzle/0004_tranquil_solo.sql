PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`url` text NOT NULL,
	`events` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_endpoints`("id", "project_id", "enabled", "url", "events", "created_at") SELECT "id", "project_id", "enabled", "url", "events", "created_at" FROM `endpoints`;--> statement-breakpoint
DROP TABLE `endpoints`;--> statement-breakpoint
ALTER TABLE `__new_endpoints` RENAME TO `endpoints`;--> statement-breakpoint
PRAGMA foreign_keys=ON;