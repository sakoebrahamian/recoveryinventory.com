CREATE TABLE `reflection_journals` (
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`entry_date` text NOT NULL,
	`encrypted_payload` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `kind`, `entry_date`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "reflection_journals_kind" CHECK("reflection_journals"."kind" IN ('step67', 'step89', 'step11'))
);
