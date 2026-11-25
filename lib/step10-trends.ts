import { step10Questions } from "@/lib/inventory";
import type { AnalyticsDay } from "@/lib/step10-analytics";

export type TrendStatus = "improving" | "slipping" | "focus" | "strength" | "unclear";
export type AnswerSplit = { practiced: number; attention: number; answered: number; rate: number | null };
export type QuestionTrend = {
  id: string;
  principleId: string;
  overall: AnswerSplit;
  earlier: AnswerSplit;
  recent: AnswerSplit;
  change: number | null;
  status: TrendStatus;
  streak: number;
};
export type PatternKind = "weekday" | "weekdays" | "weekend" | "family";
export type PatternObservation = {
  id: string;
  kind: PatternKind;
  weekday?: number;
  count: number;
  total: number;
  otherCount: number;
  otherTotal: number;
  difference: number;
};
export type TrendHalves = {
  earlierFrom: string;
  earlierThrough: string;
  recentFrom: string;
  recentThrough: string;
  earlierDays: number;
  recentDays: number;
  earlier: AnswerSplit;
  recent: AnswerSplit;
};
export type Step10Trends = {
  halves: TrendHalves | null;
  questions: QuestionTrend[];
  improving: QuestionTrend[];
  focus: QuestionTrend[];
  strengths: QuestionTrend[];
  observations: PatternObservation[];
};

/** Every threshold is a plain, explainable rule. Patterns describe answers; they never claim a cause. */
export const trendRules = {
  minAnswers: 3,
  minWeekdayAnswers: 4,
  change: 25,
  improvingFloor: 70,
  strength: 75,
  focus: 50,
  pattern: 30,
  listSize: 3,
  observations: 3,
} as const;

const dayMilliseconds = 86_400_000;

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * dayMilliseconds).toISOString().slice(0, 10);
}

function spanDays(from: string, through: string): number {
  return Math.round((Date.parse(`${through}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / dayMilliseconds) + 1;
}

function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function countAnswers(days: AnalyticsDay[], ids: string[]): AnswerSplit {
  let practiced = 0;
  let attention = 0;
  for (const day of days) {
    for (const id of ids) {
      if (!day.questionIds.includes(id)) continue;
      const state = day.states[id];
      if (state === "practiced") practiced += 1;
      else if (state === "attention") attention += 1;
    }
  }
  const answered = practiced + attention;
  return { practiced, attention, answered, rate: answered ? Math.round((practiced / answered) * 100) : null };
}

export function trendStatus(earlier: AnswerSplit, recent: AnswerSplit): { status: TrendStatus; change: number | null } {
  if (earlier.rate === null || recent.rate === null || earlier.answered < trendRules.minAnswers || recent.answered < trendRules.minAnswers) {
    return { status: "unclear", change: null };
  }
  const change = recent.rate - earlier.rate;
  if (change >= trendRules.change && recent.rate >= trendRules.improvingFloor) return { status: "improving", change };
  if (change <= -trendRules.change) return { status: "slipping", change };
  if (earlier.rate <= 100 - trendRules.focus && recent.rate <= 100 - trendRules.focus) return { status: "focus", change };
  if (earlier.rate >= trendRules.strength && recent.rate >= trendRules.strength) return { status: "strength", change };
  return { status: "unclear", change };
}

/** Consecutive most recent recorded answers marked Practiced. Didn’t come up today and missing days are skipped. */
export function practicedStreak(days: AnalyticsDay[], id: string): number {
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    const day = days[index];
    if (!day.questionIds.includes(id)) continue;
    const state = day.states[id];
    if (state === "attention") break;
    if (state === "practiced") streak += 1;
  }
  return streak;
}

function observe(days: AnalyticsDay[], id: string, kind: PatternKind, inGroup: (day: AnalyticsDay) => boolean, weekday?: number): PatternObservation | null {
  const group = countAnswers(days.filter(inGroup), [id]);
  const other = countAnswers(days.filter((day) => !inGroup(day)), [id]);
  const minimum = kind === "weekday" ? trendRules.minWeekdayAnswers : trendRules.minAnswers;
  if (group.answered < minimum || other.answered < trendRules.minAnswers || group.attention < trendRules.minAnswers) return null;
  const difference = Math.round((group.attention / group.answered) * 100 - (other.attention / other.answered) * 100);
  if (difference < trendRules.pattern) return null;
  return { id, kind, weekday, count: group.attention, total: group.answered, otherCount: other.attention, otherTotal: other.answered, difference };
}

function strongest(observations: (PatternObservation | null)[]): PatternObservation | null {
  return observations
    .filter((item): item is PatternObservation => item !== null)
    .sort((left, right) => right.difference - left.difference || right.count - left.count)[0] ?? null;
}

export function buildStep10Trends(sourceDays: AnalyticsDay[]): Step10Trends {
  const days = [...sourceDays].sort((left, right) => left.date.localeCompare(right.date));
  const first = days.at(0)?.date;
  const last = days.at(-1)?.date;
  const span = first && last ? spanDays(first, last) : 0;
  const earlierThrough = first && span >= 2 ? addDays(first, Math.floor(span / 2) - 1) : null;
  const earlierDays = earlierThrough ? days.filter((day) => day.date <= earlierThrough) : [];
  const recentDays = earlierThrough ? days.filter((day) => day.date > earlierThrough) : [];
  const allIds = step10Questions.map(({ id }) => id);
  const halves: TrendHalves | null = first && last && earlierThrough && earlierDays.length >= trendRules.minAnswers && recentDays.length >= trendRules.minAnswers ? {
    earlierFrom: first,
    earlierThrough,
    recentFrom: addDays(earlierThrough, 1),
    recentThrough: last,
    earlierDays: earlierDays.length,
    recentDays: recentDays.length,
    earlier: countAnswers(earlierDays, allIds),
    recent: countAnswers(recentDays, allIds),
  } : null;

  const questions = step10Questions.map(({ id, principleId }): QuestionTrend => {
    const earlier = countAnswers(earlierDays, [id]);
    const recent = countAnswers(recentDays, [id]);
    const { status, change } = trendStatus(earlier, recent);
    return { id, principleId, overall: countAnswers(days, [id]), earlier, recent, change, status, streak: practicedStreak(days, id) };
  });

  const improving = questions.filter((item) => item.status === "improving")
    .sort((left, right) => (right.change ?? 0) - (left.change ?? 0) || right.streak - left.streak)
    .slice(0, trendRules.listSize);
  const slipping = questions.filter((item) => item.status === "slipping")
    .sort((left, right) => (left.change ?? 0) - (right.change ?? 0));
  const ongoing = questions.filter((item) => item.status === "focus")
    .sort((left, right) => (left.overall.rate ?? 0) - (right.overall.rate ?? 0) || right.overall.attention - left.overall.attention);
  const strengths = questions.filter((item) => item.status === "strength")
    .sort((left, right) => (right.overall.rate ?? 0) - (left.overall.rate ?? 0) || right.overall.answered - left.overall.answered)
    .slice(0, trendRules.listSize);

  const isWeekend = (day: AnalyticsDay) => [0, 6].includes(weekdayOf(day.date));
  const hasFamilyWriting = (day: AnalyticsDay) => Boolean(day.reflections.familyContext?.trim());
  const observations = days.length < trendRules.minAnswers * 2 ? [] : allIds.map((id) => strongest([
    ...[0, 1, 2, 3, 4, 5, 6].map((weekday) => observe(days, id, "weekday", (day) => weekdayOf(day.date) === weekday, weekday)),
    observe(days, id, "weekdays", (day) => !isWeekend(day)),
    observe(days, id, "weekend", isWeekend),
    observe(days, id, "family", hasFamilyWriting),
  ])).filter((item): item is PatternObservation => item !== null)
    .sort((left, right) => right.difference - left.difference || right.count - left.count)
    .slice(0, trendRules.observations);

  return { halves, questions, improving, focus: [...slipping, ...ongoing].slice(0, trendRules.listSize), strengths, observations };
}
