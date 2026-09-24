import type { Metadata } from "next";
import { SiteAnalyticsReport } from "@/components/recovery/site-analytics-report";

export const metadata: Metadata = {
  title: "Website Audience Report",
  robots: { index: false, follow: false },
};

export default function SiteAnalyticsPage() {
  return <SiteAnalyticsReport />;
}

