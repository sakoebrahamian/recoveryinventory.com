"use client";

import type { Language } from "@/lib/inventory";
import {
  isSiteAnalyticsSource,
  type SiteAnalyticsAction,
  type SiteAnalyticsLanguage,
  type SiteAnalyticsPage,
  type SiteAnalyticsSource,
} from "@/lib/site-analytics-config";

type SiteAnalyticsEvent = {
  metric: "page" | "language" | "page_language" | "entry_source" | "action" | "action_source";
  label: string;
};

const SOURCE_KEY = "ri-analytics-source";
const ENTRY_KEY = "ri-analytics-entry-recorded";

function privacySignalEnabled(): boolean {
  if (typeof navigator === "undefined") return true;
  const browserNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
  const browserWindow = window as Window & { doNotTrack?: string };
  return browserNavigator.globalPrivacyControl === true
    || navigator.doNotTrack === "1"
    || browserWindow.doNotTrack === "1"
    || navigator.webdriver === true;
}

function localDay(): string {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function categorizedSourceFromHost(hostname: string): SiteAnalyticsSource {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (host === "google.com" || host.endsWith(".google.com")) return "google";
  if (host === "bing.com" || host.endsWith(".bing.com")) return "bing";
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com") return "facebook";
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "reddit.com" || host.endsWith(".reddit.com")) return "reddit";
  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "youtube";
  if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "linkedin";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  return "other";
}

function sourceFromPage(): SiteAnalyticsSource {
  const stored = window.sessionStorage.getItem(SOURCE_KEY);
  if (isSiteAnalyticsSource(stored)) return stored;

  const taggedSource = new URLSearchParams(window.location.search).get("src")?.toLowerCase();
  let source: SiteAnalyticsSource;
  if (isSiteAnalyticsSource(taggedSource) && taggedSource !== "direct") {
    source = taggedSource;
  } else if (!document.referrer) {
    source = "direct";
  } else {
    try {
      const referrer = new URL(document.referrer);
      source = referrer.origin === window.location.origin ? "direct" : categorizedSourceFromHost(referrer.hostname);
    } catch {
      source = "other";
    }
  }
  window.sessionStorage.setItem(SOURCE_KEY, source);
  return source;
}

function sendEvents(events: SiteAnalyticsEvent[]): void {
  if (typeof window === "undefined" || events.length === 0 || privacySignalEnabled()) return;
  const body = JSON.stringify({ day: localDay(), events });
  void fetch("/api/site-analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    credentials: "same-origin",
    keepalive: true,
  }).catch(() => undefined);
}

export function recordSitePage(page: SiteAnalyticsPage, language: SiteAnalyticsLanguage): void {
  if (typeof window === "undefined" || privacySignalEnabled()) return;
  const source = sourceFromPage();
  const events: SiteAnalyticsEvent[] = [
    { metric: "page", label: page },
    { metric: "language", label: language },
    { metric: "page_language", label: `${page}:${language}` },
  ];
  if (window.sessionStorage.getItem(ENTRY_KEY) !== "1") {
    events.push({ metric: "entry_source", label: source });
    window.sessionStorage.setItem(ENTRY_KEY, "1");
  }
  sendEvents(events);
}

export function recordSiteAction(action: SiteAnalyticsAction): void {
  if (typeof window === "undefined" || privacySignalEnabled()) return;
  const source = sourceFromPage();
  sendEvents([
    { metric: "action", label: action },
    { metric: "action_source", label: `${action}:${source}` },
  ]);
}

export function analyticsLanguage(language: Language): SiteAnalyticsLanguage {
  return language === "fa" || language === "es" ? language : "en";
}
