import { principles, step10Questions, type PrincipleState } from "@/lib/inventory";
import { reflectionFields, type AnalyticsDay, type Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";

export type AnswerTotals = { practiced: number; attention: number; na: number; unanswered: number; answered: number; rate: number | null };
export type TrendPoint = AnswerTotals & { from: string; through: string; savedDays: number };
export type ReflectionEntry = { id: string; date: string; field: string; text: string; questionId?: string };

export function countQuestionDays(days: AnalyticsDay[], questionIds: string[]): AnswerTotals {
  const counts = { practiced: 0, attention: 0, na: 0, unanswered: 0 };
  for (const day of days) for (const id of questionIds) {
    if (!day.questionIds.includes(id)) continue;
    const state = day.states[id];
    if (state === "practiced" || state === "attention" || state === "na") counts[state] += 1;
    else counts.unanswered += 1;
  }
  const answered = counts.practiced + counts.attention;
  return { ...counts, answered, rate: answered ? Math.round(counts.practiced / answered * 100) : null };
}

export function questionIdsForPrinciples(ids: string[]) {
  const selected = ids.length ? ids : principles.map(({ id }) => id);
  return step10Questions.filter((question) => selected.includes(question.principleId)).map(({ id }) => id);
}

export function step10Trends(days: AnalyticsDay[], bounds: ReportBounds, questionIds: string[], interval: "week" | "month"): TrendPoint[] {
  const result: TrendPoint[] = [];
  const cursor = new Date(`${bounds.from}T12:00:00Z`);
  if (interval === "week") cursor.setUTCDate(cursor.getUTCDate() - (cursor.getUTCDay() + 6) % 7);
  else cursor.setUTCDate(1);
  while (cursor.toISOString().slice(0, 10) <= bounds.through) {
    const start = cursor.toISOString().slice(0, 10);
    const end = new Date(cursor);
    if (interval === "week") { end.setUTCDate(end.getUTCDate() + 6); cursor.setUTCDate(cursor.getUTCDate() + 7); }
    else { end.setUTCMonth(end.getUTCMonth() + 1, 0); cursor.setUTCMonth(cursor.getUTCMonth() + 1, 1); }
    const from = start < bounds.from ? bounds.from : start;
    const last = end.toISOString().slice(0, 10);
    const through = last > bounds.through ? bounds.through : last;
    const saved = days.filter((day) => day.date >= from && day.date <= through);
    result.push({ from, through, savedDays: saved.length, ...countQuestionDays(saved, questionIds) });
  }
  return result;
}

export function reflectionEntries(analytics: Step10AnalyticsData): ReflectionEntry[] {
  return analytics.days.flatMap((day) => [
    ...reflectionFields.flatMap((field) => day.reflections[field]?.trim() ? [{ id: `${day.date}:${field}`, date: day.date, field, text: day.reflections[field]! }] : []),
    ...day.questionIds.flatMap((id) => day.states[id] === "attention" && day.notes[id]?.trim() ? [{ id: `${day.date}:note:${id}`, date: day.date, field: "note", questionId: id, text: day.notes[id]! }] : []),
  ]).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function answerForDay(day: AnalyticsDay, id: string): PrincipleState | "unanswered" | "not-included" {
  if (!day.questionIds.includes(id)) return "not-included";
  return day.states[id] ?? "unanswered";
}
