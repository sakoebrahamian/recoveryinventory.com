import type { PrincipleAnalytics, Step10AnalyticsData } from "@/lib/step10-analytics";

export type Step10Insights = {
  enoughHistory: boolean;
  strengths: PrincipleAnalytics[];
  focus: PrincipleAnalytics[];
};

export function summarizeStep10Insights(analytics: Step10AnalyticsData): Step10Insights {
  const enoughHistory = analytics.totalEntries >= 3;
  if (!enoughHistory) return { enoughHistory, strengths: [], focus: [] };

  const strengths = analytics.principles
    .filter((item) => item.answered >= 3 && item.practiced >= 2 && item.practiceRate >= 60 && item.practiced > item.attention)
    .sort((left, right) => right.practiceRate - left.practiceRate || right.practiced - left.practiced || left.id.localeCompare(right.id))
    .slice(0, 3);
  const focus = analytics.principles
    .filter((item) => item.answered >= 3 && item.attention >= 2 && item.attention >= item.practiced)
    .sort((left, right) => left.practiceRate - right.practiceRate || right.attention - left.attention || left.id.localeCompare(right.id))
    .slice(0, 3);

  return { enoughHistory, strengths, focus };
}
