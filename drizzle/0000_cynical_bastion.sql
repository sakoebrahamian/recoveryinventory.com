CREATE TABLE `billing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`entry_date` text NOT NULL,
	`encrypted_payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventories_user_type_date_idx` ON `inventories` (`user_id`,`type`,`entry_date`);--> statement-breakpoint
CREATE INDEX `inventories_user_date_idx` ON `inventories` (`user_id`,`entry_date`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expiry_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`alias` text NOT NULL,
	`recovery_hash` text NOT NULL,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`subscription_status` text DEFAULT 'inactive' NOT NULL,
	`current_period_end` integer,
	`preferred_language` text DEFAULT 'en' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_recovery_hash_idx` ON `users` (`recovery_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_stripe_customer_idx` ON `users` (`stripe_customer_id`);