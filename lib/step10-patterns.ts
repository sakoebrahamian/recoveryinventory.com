import { principles, step10Questions } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import { countQuestionDays, step10Trends, type AnswerTotals } from "@/lib/step10-detail";
import type { ReportBounds } from "@/lib/step10-report-period";

export type PatternTone = "practiced" | "attention" | "mixed" | "na" | "unanswered" | "no-entry" | "not-included";
export type PatternCell = AnswerTotals & { from: string; through: string; savedDays: number; tone: PatternTone };
export type PrinciplePattern = AnswerTotals & { id: string; scoredDays: number; cells: PatternCell[] };

export const patternSymbols: Record<PatternTone, string> = {
  practiced: "+", attention: "!", mixed: "±", na: "–", unanswered: "?", "no-entry": "·", "not-included": "×",
};

export function patternToneLabel(tone: PatternTone, t: (en: string, fa: string) => string) {
  const labels: Record<PatternTone, string> = {
    practiced: t("Practiced answers only", "فقط پاسخ‌های تمرین کردم"),
    attention: t("Needs attention answers only", "فقط پاسخ‌های نیازمند توجه"),
    mixed: t("Mixed Practiced and Needs attention", "ترکیب تمرین کردم و نیازمند توجه"),
    na: t("Didn’t come up today", "امروز پیش نیامد"),
    unanswered: t("Not answered", "پاسخ داده نشده"),
    "no-entry": t("No saved inventory", "بدون ترازنامه ذخیره‌شده"),
    "not-included": t("Question not included in this older inventory", "این پرسش در ترازنامه قدیمی وجود نداشت"),
  };
  return labels[tone];
}

export function patternTone(counts: AnswerTotals, savedDays: number): PatternTone {
  if (!savedDays) return "no-entry";
  if (counts.practiced && counts.attention) return "mixed";
  if (counts.practiced) return "practiced";
  if (counts.attention) return "attention";
  if (counts.na) return "na";
  if (counts.unanswered) return "unanswered";
  return "not-included";
}

export function buildStep10Patterns(analytics: Step10AnalyticsData, bounds: ReportBounds) {
  const span = Math.round((Date.parse(`${bounds.through}T12:00:00Z`) - Date.parse(`${bounds.from}T12:00:00Z`)) / 86_400_000) + 1;
  const interval = span <= 62 ? "day" : span <= 366 ? "week" : "month";
  const buckets = interval === "day"
    ? Array.from({ length: span }, (_, index) => { const date = new Date(Date.parse(`${bounds.from}T12:00:00Z`) + index * 86_400_000).toISOString().slice(0, 10); return { from: date, through: date }; })
    : step10Trends([], bounds, [], interval).map(({ from, through }) => ({ from, through }));
  const rows: PrinciplePattern[] = principles.map((principle) => {
    const ids = step10Questions.filter((question) => question.principleId === principle.id).map(({ id }) => id);
    const totals = countQuestionDays(analytics.days, ids);
    return {
      id: principle.id,
      ...totals,
      scoredDays: analytics.days.filter((day) => ids.some((id) => day.states[id] === "practiced" || day.states[id] === "attention")).length,
      cells: buckets.map((bucket) => {
        const days = analytics.days.filter((day) => day.date >= bucket.from && day.date <= bucket.through);
        const counts = countQuestionDays(days, ids);
        return { ...bucket, ...counts, savedDays: days.length, tone: patternTone(counts, days.length) };
      }),
    };
  });
  return {
    interval,
    buckets,
    rows,
    strengths: rows.filter((row) => row.scoredDays >= 3 && row.practiced > row.attention)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0) || b.scoredDays - a.scoredDays || a.id.localeCompare(b.id)).slice(0, 3),
    focus: rows.filter((row) => row.scoredDays >= 3 && row.attention >= row.practiced && row.attention > 0)
      .sort((a, b) => (a.rate ?? 100) - (b.rate ?? 100) || b.scoredDays - a.scoredDays || a.id.localeCompare(b.id)).slice(0, 3),
  };
}
