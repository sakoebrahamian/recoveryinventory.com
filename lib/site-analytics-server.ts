import { env } from "cloudflare:workers";

const CREATE_SITE_ANALYTICS_TABLE = `CREATE TABLE IF NOT EXISTS site_analytics_daily (
  day TEXT NOT NULL,
  metric TEXT NOT NULL,
  label TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, metric, label)
)`;

let tableReady = false;

export async function ensureSiteAnalyticsTable(): Promise<void> {
  if (tableReady) return;
  await env.DB.prepare(CREATE_SITE_ANALYTICS_TABLE).run();
  tableReady = true;
}

export function analyticsDatabase(): D1Database {
  return env.DB;
}
