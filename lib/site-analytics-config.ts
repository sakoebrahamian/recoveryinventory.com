export const SITE_ANALYTICS_PAGES = [
  "home",
  "demo",
  "join",
  "recover",
  "privacy",
  "terms",
  "learn_hub",
  "learn_step10",
  "learn_step4",
  "learn_honesty",
] as const;

export const SITE_ANALYTICS_LANGUAGES = ["en", "es", "fa"] as const;

export const SITE_ANALYTICS_SOURCES = [
  "direct",
  "google",
  "bing",
  "facebook",
  "instagram",
  "reddit",
  "youtube",
  "linkedin",
  "tiktok",
  "newsletter",
  "recovery_partner",
  "other",
] as const;

export const SITE_ANALYTICS_ACTIONS = [
  "demo_open",
  "join_open",
  "membership_view",
  "learn_open",
  "demo_step10",
  "demo_step4",
  "demo_analytics",
  "demo_learning",
  "account_created",
  "checkout_started",
  "membership_activated",
  "language_en",
  "language_es",
  "language_fa",
] as const;

export type SiteAnalyticsPage = (typeof SITE_ANALYTICS_PAGES)[number];
export type SiteAnalyticsLanguage = (typeof SITE_ANALYTICS_LANGUAGES)[number];
export type SiteAnalyticsSource = (typeof SITE_ANALYTICS_SOURCES)[number];
export type SiteAnalyticsAction = (typeof SITE_ANALYTICS_ACTIONS)[number];

export function isSiteAnalyticsPage(value: unknown): value is SiteAnalyticsPage {
  return typeof value === "string" && (SITE_ANALYTICS_PAGES as readonly string[]).includes(value);
}

export function isSiteAnalyticsLanguage(value: unknown): value is SiteAnalyticsLanguage {
  return typeof value === "string" && (SITE_ANALYTICS_LANGUAGES as readonly string[]).includes(value);
}

export function isSiteAnalyticsSource(value: unknown): value is SiteAnalyticsSource {
  return typeof value === "string" && (SITE_ANALYTICS_SOURCES as readonly string[]).includes(value);
}

export function isSiteAnalyticsAction(value: unknown): value is SiteAnalyticsAction {
  return typeof value === "string" && (SITE_ANALYTICS_ACTIONS as readonly string[]).includes(value);
}

