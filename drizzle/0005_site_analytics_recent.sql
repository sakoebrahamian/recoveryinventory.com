CREATE TABLE `site_analytics_collection` (
	`id` integer PRIMARY KEY NOT NULL,
	`recent_started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_analytics_recent` (
	`recorded_at` integer NOT NULL,
	`metric` text NOT NULL,
	`label` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`recorded_at`, `metric`, `label`)
);
