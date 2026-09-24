import {
  isSiteAnalyticsAction,
  isSiteAnalyticsLanguage,
  isSiteAnalyticsPage,
  isSiteAnalyticsSource,
} from "@/lib/site-analytics-config";
import { analyticsDatabase, ensureSiteAnalyticsTable } from "@/lib/site-analytics-server";

type SubmittedEvent = { metric?: unknown; label?: unknown };

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|preview|headless|lighthouse|pagespeed/i;
const METRICS = new Set(["page", "language", "page_language", "entry_source", "action", "action_source"]);

function validDay(day: unknown): day is string {
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const now = new Date();
  const allowed = new Set([-1, 0, 1].map((offset) => {
    const value = new Date(now);
    value.setUTCDate(value.getUTCDate() + offset);
    return value.toISOString().slice(0, 10);
  }));
  return allowed.has(day);
}

function validEvent(event: SubmittedEvent): event is { metric: string; label: string } {
  if (typeof event.metric !== "string" || !METRICS.has(event.metric) || typeof event.label !== "string") return false;
  if (event.metric === "page") return isSiteAnalyticsPage(event.label);
  if (event.metric === "language") return isSiteAnalyticsLanguage(event.label);
  if (event.metric === "entry_source") return isSiteAnalyticsSource(event.label);
  if (event.metric === "action") return isSiteAnalyticsAction(event.label);
  if (event.metric === "page_language") {
    const [page, language, extra] = event.label.split(":");
    return !extra && isSiteAnalyticsPage(page) && isSiteAnalyticsLanguage(language);
  }
  if (event.metric === "action_source") {
    const [action, source, extra] = event.label.split(":");
    return !extra && isSiteAnalyticsAction(action) && isSiteAnalyticsSource(source);
  }
  return false;
}

function privacyOrAutomationRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent") ?? "";
  const purpose = `${request.headers.get("purpose") ?? ""} ${request.headers.get("sec-purpose") ?? ""}`;
  return request.headers.get("sec-gpc") === "1"
    || request.headers.get("dnt") === "1"
    || BOT_PATTERN.test(userAgent)
    || /prefetch/i.test(purpose);
}

export async function POST(request: Request) {
  if (privacyOrAutomationRequest(request)) return new Response(null, { status: 204 });

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site" && fetchSite !== "none") {
    return Response.json({ error: "Invalid request." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2048) return Response.json({ error: "Request too large." }, { status: 413 });

  let body: { day?: unknown; events?: unknown };
  try {
    body = await request.json() as { day?: unknown; events?: unknown };
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!validDay(body.day) || !Array.isArray(body.events) || body.events.length < 1 || body.events.length > 6) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const events = body.events as SubmittedEvent[];
  if (!events.every(validEvent)) return Response.json({ error: "Invalid request." }, { status: 400 });

  await ensureSiteAnalyticsTable();
  const database = analyticsDatabase();
  const retentionStart = new Date();
  retentionStart.setUTCMonth(retentionStart.getUTCMonth() - 13);
  const statements = events.map((event) => database.prepare(
    `INSERT INTO site_analytics_daily (day, metric, label, count)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(day, metric, label) DO UPDATE SET count = count + 1`,
  ).bind(body.day, event.metric, event.label));
  statements.push(database.prepare("DELETE FROM site_analytics_daily WHERE day < ?").bind(retentionStart.toISOString().slice(0, 10)));
  await database.batch(statements);

  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}

