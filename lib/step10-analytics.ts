import { principles, type PrincipleState } from "@/lib/inventory";

type Step10AnalyticsPayload = {
  states?: Record<string, PrincipleState | undefined>;
  attentionNotes?: Record<string, string | undefined>;
  highlights?: string;
  attention?: string;
  patternAction?: string;
  familyContext?: string;
  amends?: string;
  tomorrow?: string;
  gratitude?: string;
};

export const reflectionFields = ["highlights", "attention", "patternAction", "familyContext", "amends", "tomorrow", "gratitude"] as const;
export type ReflectionField = typeof reflectionFields[number];

export type WrittenExcerpt = { date: string; text: string; attentionPrincipleIds: string[] };
export type WrittenReflection = { field: ReflectionField; count: number; excerpts: WrittenExcerpt[] };
export type WrittenPrinciple = { id: string; count: number; excerpts: WrittenExcerpt[] };
export type WrittenAnalytics = { reflections: WrittenReflection[]; principles: WrittenPrinciple[] };

export type Step10AnalyticsRecord = {
  date: string;
  payload: unknown;
};

export type PrincipleAnalytics = {
  id: string;
  practiced: number;
  attention: number;
  answered: number;
  practiceRate: number;
};

export type CategoryAnalytics = PrincipleAnalytics;

export type MonthlyAnalytics = {
  month: string;
  entries: number;
  practiced: number;
  attention: number;
  practiceRate: number;
};

export type Step10AnalyticsData = {
  through: string;
  totalEntries: number;
  firstEntryDate: string | null;
  lastEntryDate: string | null;
  totalPracticed: number;
  totalAttention: number;
  totalNA: number;
  totalAnswered: number;
  practiceRate: number;
  recentEntries: number;
  recentPracticeRate: number | null;
  previousPracticeRate: number | null;
  recentChange: number | null;
  currentStreak: number;
  longestStreak: number;
  principles: PrincipleAnalytics[];
  topPracticed: PrincipleAnalytics[];
  topAttention: PrincipleAnalytics[];
  categories: CategoryAnalytics[];
  months: MonthlyAnalytics[];
  allMonths: MonthlyAnalytics[];
  written: WrittenAnalytics;
};

const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const dayMilliseconds = 86_400_000;

function roundRate(practiced: number, answered: number): number {
  return answered > 0 ? Math.round((practiced / answered) * 100) : 0;
}

function payloadStates(payload: unknown): Record<string, PrincipleState | undefined> {
  if (!payload || typeof payload !== "object") return {};
  const states = (payload as Step10AnalyticsPayload).states;
  return states && typeof states === "object" ? states : {};
}

function payloadContent(payload: unknown): Step10AnalyticsPayload {
  return payload && typeof payload === "object" ? payload as Step10AnalyticsPayload : {};
}

function excerpt(date: string, value: unknown, attentionPrincipleIds: string[]): WrittenExcerpt | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  return { date, text: trimmed.length > 500 ? `${trimmed.slice(0, 499).trimEnd()}…` : trimmed, attentionPrincipleIds };
}

function writtenAnalytics(records: Step10AnalyticsRecord[]): WrittenAnalytics {
  const reflections = reflectionFields.map((field) => ({ field, count: 0, excerpts: [] as WrittenExcerpt[] }));
  const principleNotes = principles.map(({ id }) => ({ id, count: 0, excerpts: [] as WrittenExcerpt[] }));

  // Counts span the complete saved history; only the two most recent excerpts per field are returned.
  // Text is grouped by the member's own field and principle selection, without guessing its meaning.
  for (const record of records) {
    const content = payloadContent(record.payload);
    const states = payloadStates(record.payload);
    const attentionPrincipleIds = principles.filter(({ id }) => states[id] === "attention").map(({ id }) => id);
    for (const summary of reflections) {
      const sample = excerpt(record.date, content[summary.field], attentionPrincipleIds);
      if (sample) {
        summary.count += 1;
        summary.excerpts = [sample, ...summary.excerpts].slice(0, 2);
      }
    }
    const notes = content.attentionNotes;
    for (const summary of principleNotes) {
      if (states[summary.id] !== "attention") continue;
      const sample = excerpt(record.date, notes && typeof notes === "object" ? notes[summary.id] : undefined, [summary.id]);
      if (sample) {
        summary.count += 1;
        summary.excerpts = [sample, ...summary.excerpts].slice(0, 2);
      }
    }
  }
  return {
    reflections,
    principles: principleNotes.filter(({ count }) => count > 0)
      .sort((left, right) => right.count - left.count || left.id.localeCompare(right.id)),
  };
}

function rateForRecords(records: Step10AnalyticsRecord[]): number | null {
  let practiced = 0;
  let answered = 0;
  for (const record of records) {
    const states = payloadStates(record.payload);
    for (const principle of principles) {
      const state = states[principle.id];
      if (state === "practiced") {
        practiced += 1;
        answered += 1;
      } else if (state === "attention") {
        answered += 1;
      }
    }
  }
  return answered > 0 ? roundRate(practiced, answered) : null;
}

function streaks(dates: string[], through: string): { currentStreak: number; longestStreak: number } {
  const days = [...new Set(dates)]
    .map((date) => Math.floor(Date.parse(`${date}T00:00:00Z`) / dayMilliseconds))
    .sort((left, right) => left - right);
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (days[index] === days[index - 1] + 1) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 1;
    }
  }

  const throughDay = Math.floor(Date.parse(`${through}T00:00:00Z`) / dayMilliseconds);
  const latestDay = days.at(-1) ?? throughDay;
  if (throughDay - latestDay > 1) return { currentStreak: 0, longestStreak };

  let currentStreak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (days[index] === days[index - 1] + 1) currentStreak += 1;
    else break;
  }
  return { currentStreak, longestStreak };
}

export function calculateStep10Analytics(
  sourceRecords: Step10AnalyticsRecord[],
  through: string,
): Step10AnalyticsData {
  const records = sourceRecords
    .filter((record) => validDatePattern.test(record.date) && record.date <= through)
    .sort((left, right) => left.date.localeCompare(right.date));

  const principleTotals = new Map<string, { practiced: number; attention: number }>();
  const categoryTotals = new Map<string, { practiced: number; attention: number }>();
  const monthTotals = new Map<string, { entries: number; practiced: number; attention: number }>();
  for (const principle of principles) {
    principleTotals.set(principle.id, { practiced: 0, attention: 0 });
    if (!categoryTotals.has(principle.category)) categoryTotals.set(principle.category, { practiced: 0, attention: 0 });
  }

  let totalPracticed = 0;
  let totalAttention = 0;
  let totalNA = 0;

  for (const record of records) {
    const month = record.date.slice(0, 7);
    const monthTotal = monthTotals.get(month) ?? { entries: 0, practiced: 0, attention: 0 };
    monthTotal.entries += 1;
    const states = payloadStates(record.payload);

    for (const principle of principles) {
      const state = states[principle.id];
      if (state === "na") {
        totalNA += 1;
        continue;
      }
      if (state !== "practiced" && state !== "attention") continue;

      const principleTotal = principleTotals.get(principle.id)!;
      const categoryTotal = categoryTotals.get(principle.category)!;
      if (state === "practiced") {
        totalPracticed += 1;
        principleTotal.practiced += 1;
        categoryTotal.practiced += 1;
        monthTotal.practiced += 1;
      } else {
        totalAttention += 1;
        principleTotal.attention += 1;
        categoryTotal.attention += 1;
        monthTotal.attention += 1;
      }
    }
    monthTotals.set(month, monthTotal);
  }

  const principleResults = principles.map((principle): PrincipleAnalytics => {
    const total = principleTotals.get(principle.id)!;
    const answered = total.practiced + total.attention;
    return {
      id: principle.id,
      practiced: total.practiced,
      attention: total.attention,
      answered,
      practiceRate: roundRate(total.practiced, answered),
    };
  });
  const recent = records.slice(-7);
  const previous = records.slice(Math.max(0, records.length - 14), Math.max(0, records.length - 7));
  const recentPracticeRate = rateForRecords(recent);
  const previousPracticeRate = rateForRecords(previous);
  const { currentStreak, longestStreak } = streaks(records.map((record) => record.date), through);
  const totalAnswered = totalPracticed + totalAttention;
  const allMonths = [...monthTotals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, total]): MonthlyAnalytics => {
      const answered = total.practiced + total.attention;
      return { month, ...total, practiceRate: roundRate(total.practiced, answered) };
    });

  return {
    through,
    totalEntries: records.length,
    firstEntryDate: records.at(0)?.date ?? null,
    lastEntryDate: records.at(-1)?.date ?? null,
    totalPracticed,
    totalAttention,
    totalNA,
    totalAnswered,
    practiceRate: roundRate(totalPracticed, totalAnswered),
    recentEntries: recent.length,
    recentPracticeRate,
    previousPracticeRate,
    recentChange: recentPracticeRate !== null && previousPracticeRate !== null
      ? recentPracticeRate - previousPracticeRate
      : null,
    currentStreak,
    longestStreak,
    principles: principleResults,
    topPracticed: principleResults
      .filter((result) => result.practiced > 0)
      .sort((left, right) => right.practiced - left.practiced || right.practiceRate - left.practiceRate || left.id.localeCompare(right.id))
      .slice(0, 3),
    topAttention: principleResults
      .filter((result) => result.attention > 0)
      .sort((left, right) => right.attention - left.attention || left.practiceRate - right.practiceRate || left.id.localeCompare(right.id))
      .slice(0, 3),
    categories: ["inner", "relationships", "recovery"].map((id): CategoryAnalytics => {
      const total = categoryTotals.get(id) ?? { practiced: 0, attention: 0 };
      const answered = total.practiced + total.attention;
      return { id, ...total, answered, practiceRate: roundRate(total.practiced, answered) };
    }),
    months: allMonths.slice(-8),
    allMonths,
    written: writtenAnalytics(records),
  };
}
