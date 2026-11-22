-- Aggregate-only website analytics. This table contains no visitor, account,
-- inventory, referrer URL, IP address, or other identifying fields.
CREATE TABLE IF NOT EXISTS site_analytics_daily (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (day, metric, label)
);

-- Recent counts by server receipt time, with no visitor identifiers.
CREATE TABLE IF NOT EXISTS site_analytics_recent (
  recorded_at INTEGER NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY (recorded_at, metric, label)
);

CREATE TABLE IF NOT EXISTS site_analytics_collection (
  id INTEGER PRIMARY KEY,
  recent_started_at INTEGER NOT NULL
);
