CREATE TABLE `deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`endpoint_id` text NOT NULL,
	`status` text NOT NULL,
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
