CREATE TABLE `site_analytics_daily` (
	`day` text NOT NULL,
	`metric` text NOT NULL,
	`label` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `metric`, `label`)
);
