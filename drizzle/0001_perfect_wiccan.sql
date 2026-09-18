CREATE TABLE `email_accounts` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`verified_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_accounts_email_idx` ON `email_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `email_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`purpose` text NOT NULL,
	`user_id` text,
	`alias` text,
	`preferred_language` text DEFAULT 'en' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `email_challenges_email_created_idx` ON `email_challenges` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `email_challenges_expiry_idx` ON `email_challenges` (`expires_at`);--> statement-breakpoint
CREATE INDEX `email_challenges_user_idx` ON `email_challenges` (`user_id`);