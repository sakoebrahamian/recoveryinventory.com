export const SITE_ANALYTICS_HOUR_SECONDS = 3_600;
export const SITE_ANALYTICS_RECENT_HOURS = 24;

export type SiteAnalyticsTotals = {
  pageViews: number;
  entries: number;
  demoVisits: number;
  joinVisits: number;
  accounts: number;
  checkouts: number;
  activations: number;
};

type Counts = Record<string, number>;

export type SiteAnalyticsReportData = {
  totals: SiteAnalyticsTotals;
  pages: Counts;
  languages: Counts;
  sources: Counts;
  actions: Counts;
  pageLanguages: Record<string, Counts>;
  actionSources: Record<string, Counts>;
} & (
  | {
    range: { days: number; from: string; through: string };
    daily: Array<SiteAnalyticsTotals & { day: string }>;
  }
  | {
    range: { hours: number; from: string; through: string; collectedFrom: string };
    hourly: Array<SiteAnalyticsTotals & { from: string; through: string }>;
  }
);
