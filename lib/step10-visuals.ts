import { step10QuestionsForPayload } from "@/lib/inventory";
import type { AnalyticsDay } from "@/lib/step10-analytics";
import type { QuestionTrend } from "@/lib/step10-trends";

export type DailyNote = { field: "highlights" | "amends"; text: string };
export type DailyPracticePoint = {
  date: string;
  weekday: number;
  saved: boolean;
  practiced: number;
  answered: number;
  rate: number | null;
  average: number | null;
  note: DailyNote | null;
};

/** Plain, explainable rules for the on-page charts. They describe answers; they never grade recovery. */
export const visualRules = {
  averageWindow: 7,
  averageMinDays: 3,
  maxDailyPoints: 400,
  noteLength: 280,
} as const;

const dayMilliseconds = 86_400_000;

/** Replaces {name} placeholders. Translations keep the same placeholders as the English text. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * dayMilliseconds).toISOString().slice(0, 10);
}

function shorten(text: string): string {
  return text.length > visualRules.noteLength ? `${text.slice(0, visualRules.noteLength - 1).trimEnd()}…` : text;
}

/** Practiced and Needs attention answers on one saved day. Didn’t come up today and unanswered questions are left out. */
export function dayAnswers(day: AnalyticsDay): { practiced: number; answered: number } {
  let practiced = 0;
  let answered = 0;
  for (const id of day.questionIds) {
    const state = day.states[id];
    if (state === "practiced") { practiced += 1; answered += 1; }
    else if (state === "attention") answered += 1;
  }
  return { practiced, answered };
}

export function practiceRate(practiced: number, answered: number): number | null {
  return answered ? Math.round((practiced / answered) * 100) : null;
}

/** One point per calendar day in the selected dates, with a trailing 7-day average of saved answers. */
export function dailyPracticeSeries(days: AnalyticsDay[], bounds: { from: string; through: string }): DailyPracticePoint[] {
  if (!bounds.from || !bounds.through || bounds.from > bounds.through) return [];
  const byDate = new Map(days.map((day) => [day.date, day]));
  const earliest = addDays(bounds.through, -(visualRules.maxDailyPoints - 1));
  const points: DailyPracticePoint[] = [];
  for (let date = bounds.from > earliest ? bounds.from : earliest; date <= bounds.through; date = addDays(date, 1)) {
    const day = byDate.get(date);
    const { practiced, answered } = day ? dayAnswers(day) : { practiced: 0, answered: 0 };
    const highlight = day?.reflections.highlights?.trim();
    const amends = day?.reflections.amends?.trim();
    points.push({
      date,
      weekday: new Date(`${date}T12:00:00Z`).getUTCDay(),
      saved: Boolean(day),
      practiced,
      answered,
      rate: practiceRate(practiced, answered),
      average: null,
      note: highlight ? { field: "highlights", text: shorten(highlight) } : amends ? { field: "amends", text: shorten(amends) } : null,
    });
  }
  for (let index = 0; index < points.length; index += 1) {
    let practiced = 0;
    let answered = 0;
    let counted = 0;
    for (let back = Math.max(0, index - visualRules.averageWindow + 1); back <= index; back += 1) {
      if (!points[back].answered) continue;
      practiced += points[back].practiced;
      answered += points[back].answered;
      counted += 1;
    }
    points[index].average = counted >= visualRules.averageMinDays ? practiceRate(practiced, answered) : null;
  }
  return points;
}

/** Practiced share for each saved day, used to tint calendars. */
export function practiceRateByDate(days: AnalyticsDay[]): Record<string, number | null> {
  return Object.fromEntries(days.map((day) => {
    const { practiced, answered } = dayAnswers(day);
    return [day.date, practiceRate(practiced, answered)];
  }));
}

/** Practiced share for one saved Step 10 payload, used to tint the workspace calendar. */
export function payloadPracticeRate(payload: unknown): number | null {
  const states = payload && typeof payload === "object" ? (payload as { states?: unknown }).states : undefined;
  if (!states || typeof states !== "object") return null;
  const answers = states as Record<string, unknown>;
  let practiced = 0;
  let answered = 0;
  for (const { id } of step10QuestionsForPayload(payload)) {
    if (answers[id] === "practiced") { practiced += 1; answered += 1; }
    else if (answers[id] === "attention") answered += 1;
  }
  return practiceRate(practiced, answered);
}

/** 0 = no answered questions; 1–4 = light to dark green by Practiced share. */
export function tintLevel(rate: number | null | undefined): 0 | 1 | 2 | 3 | 4 {
  if (rate === null || rate === undefined) return 0;
  if (rate < 50) return 1;
  if (rate < 70) return 2;
  if (rate < 85) return 3;
  return 4;
}

/** Questions that can be compared across both halves, largest movement first. */
export function changeRows(questions: QuestionTrend[]): QuestionTrend[] {
  return questions
    .filter((item) => item.change !== null && item.earlier.rate !== null && item.recent.rate !== null)
    .sort((left, right) => Math.abs(right.change ?? 0) - Math.abs(left.change ?? 0) || (right.change ?? 0) - (left.change ?? 0) || left.id.localeCompare(right.id));
}
