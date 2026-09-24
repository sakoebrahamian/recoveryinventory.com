import { isAnalyticsOwner, jsonError, requireAccount } from "@/lib/auth";
import {
  SITE_ANALYTICS_ACTIONS,
  SITE_ANALYTICS_LANGUAGES,
  SITE_ANALYTICS_PAGES,
  SITE_ANALYTICS_SOURCES,
} from "@/lib/site-analytics-config";
import { analyticsDatabase, ensureSiteAnalyticsTable } from "@/lib/site-analytics-server";

type AnalyticsRow = {
  day: string;
  metric: string;
  label: string;
  count: number;
};

const ALLOWED_RANGES = new Set([7, 30, 90, 395]);

function utcDayOffset(day: string, offset: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function currentThroughDay(candidate: string | null): string {
  const today = new Date().toISOString().slice(0, 10);
  if (!candidate || !/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return today;
  return Math.abs(new Date(`${candidate}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) <= 86_400_000
    ? candidate
    : today;
}

function counted(labels: readonly string[]) {
  return Object.fromEntries(labels.map((label) => [label, 0])) as Record<string, number>;
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!isAnalyticsOwner(account)) return Response.json({ error: "Owner access is required." }, { status: 403 });

    const url = new URL(request.url);
    const requestedDays = Number(url.searchParams.get("days") ?? "30");
    const days = ALLOWED_RANGES.has(requestedDays) ? requestedDays : 30;
    const through = currentThroughDay(url.searchParams.get("through"));
    const from = utcDayOffset(through, -(days - 1));

    await ensureSiteAnalyticsTable();
    const result = await analyticsDatabase().prepare(
      `SELECT day, metric, label, count
       FROM site_analytics_daily
       WHERE day >= ? AND day <= ?
       ORDER BY day ASC`,
    ).bind(from, through).all<AnalyticsRow>();
    const rows = result.results ?? [];

    const pages = counted(SITE_ANALYTICS_PAGES);
    const languages = counted(SITE_ANALYTICS_LANGUAGES);
    const sources = counted(SITE_ANALYTICS_SOURCES);
    const actions = counted(SITE_ANALYTICS_ACTIONS);
    const actionSources: Record<string, Record<string, number>> = Object.fromEntries(
      SITE_ANALYTICS_ACTIONS.map((action) => [action, counted(SITE_ANALYTICS_SOURCES)]),
    );
    const daily = Array.from({ length: days }, (_, index) => ({
      day: utcDayOffset(from, index),
      pageViews: 0,
      entries: 0,
      accounts: 0,
      activations: 0,
    }));
    const dailyByDay = new Map(daily.map((item) => [item.day, item]));

    for (const row of rows) {
      const count = Number(row.count) || 0;
      if (row.metric === "page" && row.label in pages) pages[row.label] += count;
      if (row.metric === "language" && row.label in languages) languages[row.label] += count;
      if (row.metric === "entry_source" && row.label in sources) sources[row.label] += count;
      if (row.metric === "action" && row.label in actions) actions[row.label] += count;
      if (row.metric === "action_source") {
        const [action, source] = row.label.split(":");
        if (action in actionSources && source in actionSources[action]) actionSources[action][source] += count;
      }
      const day = dailyByDay.get(row.day);
      if (!day) continue;
      if (row.metric === "page") day.pageViews += count;
      if (row.metric === "entry_source") day.entries += count;
      if (row.metric === "action" && row.label === "account_created") day.accounts += count;
      if (row.metric === "action" && row.label === "membership_activated") day.activations += count;
    }

    return Response.json({
      range: { days, from, through },
      totals: {
        pageViews: Object.values(pages).reduce((sum, count) => sum + count, 0),
        entries: Object.values(sources).reduce((sum, count) => sum + count, 0),
        demoVisits: pages.demo,
        joinVisits: pages.join,
        accounts: actions.account_created,
        checkouts: actions.checkout_started,
        activations: actions.membership_activated,
      },
      pages,
      languages,
      sources,
      actions,
      actionSources,
      daily,
    }, { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

