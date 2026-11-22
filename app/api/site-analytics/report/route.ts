import { isAnalyticsOwner, jsonError, requireAccount } from "@/lib/auth";
import {
  SITE_ANALYTICS_ACTIONS,
  SITE_ANALYTICS_LANGUAGES,
  SITE_ANALYTICS_PAGES,
  SITE_ANALYTICS_SOURCES,
} from "@/lib/site-analytics-config";
import {
  SITE_ANALYTICS_HOUR_SECONDS,
  SITE_ANALYTICS_RECENT_HOURS,
  type SiteAnalyticsReportData,
  type SiteAnalyticsTotals,
} from "@/lib/site-analytics-report";
import { analyticsDatabase, ensureSiteAnalyticsTables } from "@/lib/site-analytics-server";

type AnalyticsRow = {
  bucket: string | number;
  metric: string;
  label: string;
  count: number;
};

const ALLOWED_RANGES = new Set([7, 30, 90, 395]);
const HOUR = SITE_ANALYTICS_HOUR_SECONDS;
const HOURS = SITE_ANALYTICS_RECENT_HOURS;

function utcDayOffset(day: string, offset: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function currentThroughDay(candidate: string | null, now: Date): string {
  const today = now.toISOString().slice(0, 10);
  return [utcDayOffset(today, -1), today, utcDayOffset(today, 1)].find((day) => day === candidate) ?? today;
}

function isoTime(seconds: number): string {
  return new Date(seconds * 1_000).toISOString();
}

function counted(labels: readonly string[]): Record<string, number> {
  return Object.fromEntries(labels.map((label) => [label, 0]));
}

function emptyTotals(): SiteAnalyticsTotals {
  return { pageViews: 0, entries: 0, demoVisits: 0, joinVisits: 0, accounts: 0, checkouts: 0, activations: 0 };
}

function breakdowns(rows: AnalyticsRow[]) {
  const pages = counted(SITE_ANALYTICS_PAGES);
  const languages = counted(SITE_ANALYTICS_LANGUAGES);
  const sources = counted(SITE_ANALYTICS_SOURCES);
  const actions = counted(SITE_ANALYTICS_ACTIONS);
  const pageLanguages = Object.fromEntries(SITE_ANALYTICS_PAGES.map((page) => [page, counted(SITE_ANALYTICS_LANGUAGES)]));
  const actionSources = Object.fromEntries(SITE_ANALYTICS_ACTIONS.map((action) => [action, counted(SITE_ANALYTICS_SOURCES)]));
  const buckets = new Map<AnalyticsRow["bucket"], SiteAnalyticsTotals>();
  const totals = emptyTotals();

  for (const { bucket, metric, label, count } of rows) {
    let period = buckets.get(bucket);
    if (!period) {
      period = emptyTotals();
      buckets.set(bucket, period);
    }

    if (metric === "page" && Object.hasOwn(pages, label)) {
      pages[label] += count;
      period.pageViews += count;
      if (label === "demo") period.demoVisits += count;
      if (label === "join") period.joinVisits += count;
    } else if (metric === "entry_source" && Object.hasOwn(sources, label)) {
      sources[label] += count;
      period.entries += count;
    } else if (metric === "language" && Object.hasOwn(languages, label)) {
      languages[label] += count;
    } else if (metric === "action" && Object.hasOwn(actions, label)) {
      actions[label] += count;
      if (label === "account_created") period.accounts += count;
      if (label === "checkout_started") period.checkouts += count;
      if (label === "membership_activated") period.activations += count;
    } else if (metric === "page_language" || metric === "action_source") {
      const [primary, secondary] = label.split(":");
      const group = metric === "page_language" ? pageLanguages : actionSources;
      if (Object.hasOwn(group, primary) && Object.hasOwn(group[primary], secondary)) group[primary][secondary] += count;
    }
  }

  const totalKeys = Object.keys(totals) as Array<keyof SiteAnalyticsTotals>;
  for (const period of buckets.values()) {
    for (const key of totalKeys) totals[key] += period[key];
  }

  return { buckets, totals, pages, languages, sources, actions, pageLanguages, actionSources };
}

async function reportLast24Hours(now: Date): Promise<SiteAnalyticsReportData> {
  // Use the server's receipt time so visitor time zones do not affect the rolling window.
  const through = Math.floor(now.getTime() / 1_000);
  const from = through - HOURS * HOUR;
  const firstHour = Math.floor(from / HOUR) * HOUR;
  const database = analyticsDatabase();
  const [result, collection] = await Promise.all([
    database.prepare(
      `SELECT recorded_at - (recorded_at % ${HOUR}) AS bucket, metric, label, SUM(count) AS count
       FROM site_analytics_recent
       WHERE recorded_at >= ? AND recorded_at < ?
       GROUP BY bucket, metric, label`,
    ).bind(from, through).all<AnalyticsRow>(),
    database.prepare("SELECT recent_started_at FROM site_analytics_collection WHERE id = 1").first<number>("recent_started_at"),
  ]);
  const { buckets, ...tallies } = breakdowns(result.results);
  const hourly = Array.from({ length: Math.ceil((through - firstHour) / HOUR) }, (_, index) => {
    const hour = firstHour + index * HOUR;
    return {
      from: isoTime(Math.max(from, hour)),
      through: isoTime(Math.min(through, hour + HOUR)),
      ...(buckets.get(hour) ?? emptyTotals()),
    };
  });

  return {
    range: { hours: HOURS, from: isoTime(from), through: isoTime(through), collectedFrom: isoTime(collection ?? through) },
    hourly,
    ...tallies,
  };
}

async function reportByDay(url: URL, now: Date): Promise<SiteAnalyticsReportData> {
  const requestedDays = Number(url.searchParams.get("days") ?? "30");
  const days = ALLOWED_RANGES.has(requestedDays) ? requestedDays : 30;
  const through = currentThroughDay(url.searchParams.get("through"), now);
  const from = utcDayOffset(through, -(days - 1));
  const result = await analyticsDatabase().prepare(
    `SELECT day AS bucket, metric, label, count
     FROM site_analytics_daily
     WHERE day >= ? AND day <= ?`,
  ).bind(from, through).all<AnalyticsRow>();
  const { buckets, ...tallies } = breakdowns(result.results);
  const daily = Array.from({ length: days }, (_, index) => {
    const day = utcDayOffset(from, index);
    return { day, ...(buckets.get(day) ?? emptyTotals()) };
  });

  return { range: { days, from, through }, daily, ...tallies };
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!isAnalyticsOwner(account)) return Response.json({ error: "Owner access is required." }, { status: 403 });

    await ensureSiteAnalyticsTables();
    const now = new Date();
    const url = new URL(request.url);
    const report = url.searchParams.get("hours") === String(HOURS)
      ? await reportLast24Hours(now)
      : await reportByDay(url, now);

    return Response.json(report, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
