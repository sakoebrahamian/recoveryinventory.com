-- Aggregate-only website analytics. This table contains no visitor, account,
-- inventory, referrer URL, IP address, or other identifying fields.
CREATE TABLE IF NOT EXISTS site_analytics_daily (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (day, metric, label)
);
