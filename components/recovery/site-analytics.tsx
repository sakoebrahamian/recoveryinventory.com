"use client";

import * as React from "react";
import { useLanguage } from "./language-provider";
import { analyticsLanguage, recordSiteAction, recordSitePage } from "@/lib/site-analytics";
import type { SiteAnalyticsAction, SiteAnalyticsPage } from "@/lib/site-analytics-config";

function pageFromPath(pathname: string): SiteAnalyticsPage | null {
  const normalized = pathname.replace(/^\/(es|fa)(?=\/learn(?:\/|$))/, "").replace(/\/$/, "") || "/";
  if (normalized === "/") return "home";
  if (normalized === "/demo") return "demo";
  if (normalized === "/join") return "join";
  if (normalized === "/recover") return "recover";
  if (normalized === "/privacy") return "privacy";
  if (normalized === "/terms") return "terms";
  if (normalized === "/learn") return "learn_hub";
  if (normalized === "/learn/step-10-daily-inventory") return "learn_step10";
  if (normalized === "/learn/step-4-personal-inventory") return "learn_step4";
  if (normalized === "/learn/dishonesty-to-honesty") return "learn_honesty";
  return null;
}

function actionFromLink(url: URL): SiteAnalyticsAction | null {
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === "/demo") return "demo_open";
  if (url.pathname === "/join") return "join_open";
  if ((url.pathname === "/" || url.pathname === "") && url.hash === "#membership") return "membership_view";
  if (/^\/(?:es\/|fa\/)?learn(?:\/|$)/.test(url.pathname)) return "learn_open";
  return null;
}

export function SiteAnalytics() {
  const { language } = useLanguage();

  React.useEffect(() => {
    const page = pageFromPath(window.location.pathname);
    const routeLanguage = window.location.pathname.startsWith("/fa/learn")
      ? "fa"
      : window.location.pathname.startsWith("/es/learn")
        ? "es"
        : analyticsLanguage(language);
    if (page) recordSitePage(page, routeLanguage);
  }, [language]);

  React.useEffect(() => {
    function recordLink(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      try {
        const action = actionFromLink(new URL(anchor.href, window.location.href));
        if (action) recordSiteAction(action);
      } catch {
        // Invalid links are ignored without affecting navigation.
      }
    }
    document.addEventListener("click", recordLink, { capture: true });
    return () => document.removeEventListener("click", recordLink, { capture: true });
  }, []);

  return null;
}
