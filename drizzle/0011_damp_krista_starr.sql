PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`endpoint_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempt_count` integer NOT NULL,
	`last_attempt_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`next_attempt_at` text,
	`completed_at` text,
	`last_status_code` integer,
	`lastError` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`endpoint_id`) REFERENCES `endpoints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_deliveries`("id", "event_id", "endpoint_id", "status", "attempt_count", "last_attempt_at", "next_attempt_at", "completed_at", "last_status_code", "lastError", "created_at") SELECT "id", "event_id", "endpoint_id", "status", "attempt_count", "last_attempt_at", "next_attempt_at", "completed_at", "last_status_code", "lastError", "created_at" FROM `deliveries`;--> statement-breakpoint
DROP TABLE `deliveries`;--> statement-breakpoint
ALTER TABLE `__new_deliveries` RENAME TO `deliveries`;--> statement-breakpoint
PRAGMA foreign_keys=ON;