import { env } from "cloudflare:workers";

const CREATE_SITE_ANALYTICS_TABLE = `CREATE TABLE IF NOT EXISTS site_analytics_daily (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, metric, label)
)`;

const CREATE_RECENT_TABLE = `CREATE TABLE IF NOT EXISTS site_analytics_recent (
  recorded_at INTEGER NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (recorded_at, metric, label)
)`;

const CREATE_COLLECTION_TABLE = `CREATE TABLE IF NOT EXISTS site_analytics_collection (
  id INTEGER PRIMARY KEY,
  recent_started_at INTEGER NOT NULL
)`;

let tablesReady = false;

export async function ensureSiteAnalyticsTables(): Promise<void> {
  if (tablesReady) return;
  await env.DB.batch([
    env.DB.prepare(CREATE_SITE_ANALYTICS_TABLE),
    env.DB.prepare(CREATE_RECENT_TABLE),
    env.DB.prepare(CREATE_COLLECTION_TABLE),
    env.DB.prepare(`INSERT OR IGNORE INTO site_analytics_collection (id, recent_started_at) VALUES (1, unixepoch())`),
  ]);
  tablesReady = true;
}

export function analyticsDatabase(): D1Database {
  return env.DB;
}
