"use client";

import * as React from "react";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";

export function useReportAnalytics(bounds: ReportBounds | null, enabled: boolean, refreshKey = 0) {
  const from = bounds?.from ?? "";
  const through = bounds?.through ?? "";
  const [result, setResult] = React.useState<{ key: string; analytics: Step10AnalyticsData | null; error: string }>({ key: "", analytics: null, error: "" });
  const [retry, setRetry] = React.useState(0);
  const key = `${from}:${through}:${refreshKey}:${retry}`;

  React.useEffect(() => {
    if (!enabled || !from || !through) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/analytics/step10?from=${encodeURIComponent(from)}&through=${encodeURIComponent(through)}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json() as { analytics?: Step10AnalyticsData; error?: string };
        if (!response.ok || !data.analytics) throw new Error(data.error || "Analytics unavailable");
        if (!controller.signal.aborted) setResult({ key, analytics: data.analytics, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key, analytics: null, error: error instanceof Error ? error.message : "Analytics unavailable" });
      }
    }
    void load();
    return () => controller.abort();
  }, [enabled, from, key, through, refreshKey, retry]);

  return {
    analytics: enabled && result.key === key ? result.analytics : null,
    loading: enabled && Boolean(from && through) && result.key !== key,
    error: enabled && result.key === key ? result.error : "",
    retry: () => setRetry((value) => value + 1),
  };
}
