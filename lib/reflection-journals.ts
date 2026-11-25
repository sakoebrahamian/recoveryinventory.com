import { principles } from "./inventory";
import type { Language } from "./languages";

export const reflectionKinds = ["step67", "step89", "step11"] as const;
export type ReflectionKind = (typeof reflectionKinds)[number];

export const morningPractices = ["prayer", "meditation", "quiet"] as const;

export const reflectionPatternLabels = {
  defensiveness: {
    en: "Defensiveness", es: "Ponerme a la defensiva", fa: "حالت دفاعی", fr: "Être sur la défensive",
    "pt-BR": "Ficar na defensiva", ar: "اتخاذ موقف دفاعي", de: "In die Defensive gehen",
    hy: "Պաշտպանողական արձագանք", it: "Mettermi sulla difensiva", el: "Αμυντική στάση",
  },
  impatience: {
    en: "Impatience", es: "Impaciencia", fa: "بی‌صبری", fr: "Impatience",
    "pt-BR": "Impaciência", ar: "نفاد الصبر", de: "Ungeduld",
    hy: "Անհամբերություն", it: "Impazienza", el: "Ανυπομονησία",
  },
  avoidance: {
    en: "Avoiding a conversation", es: "Evitar una conversación", fa: "دوری از گفت‌وگو", fr: "Éviter une conversation",
    "pt-BR": "Evitar uma conversa", ar: "تجنّب محادثة", de: "Einem Gespräch ausweichen",
    hy: "Զրույցից խուսափելը", it: "Evitare una conversazione", el: "Αποφυγή μιας συζήτησης",
  },
} as const satisfies Record<string, Record<Language, string>>;
export type ReflectionPattern = keyof typeof reflectionPatternLabels;

export const reflectionChoices = {
  patternChoice: Object.keys(reflectionPatternLabels) as ReflectionPattern[],
  readiness: ["noticing", "open", "ready"],
  support: ["higher-power", "sponsor", "trusted-person"],
  principle: principles.map(({ id }) => id),
  focus: ["responsibility", "boundaries", "sponsor-conversation", "changing-behavior"],
} as const;
export type ReflectionChoiceField = keyof typeof reflectionChoices;

const reflectionChoiceFields = {
  step67: ["patternChoice", "readiness", "support", "principle"],
  step89: ["focus"],
  step11: [],
} as const satisfies Record<ReflectionKind, readonly ReflectionChoiceField[]>;

export const reflectionFields = {
  step67: ["pattern", "willingness", "humility"],
  step89: ["initials", "responsibility", "boundaries", "sponsor"],
  step11: ["practice", "intention"],
} as const satisfies Record<ReflectionKind, readonly string[]>;

export type ReflectionField = (typeof reflectionFields)[ReflectionKind][number] | ReflectionChoiceField;
export type ReflectionPayload = Partial<Record<ReflectionField, string>>;
export type ReflectionEntry = { date: string; payload: ReflectionPayload };

export const reflectionSlugs: Record<ReflectionKind, string> = {
  step67: "working-with-recurring-patterns",
  step89: "preparing-for-amends",
  step11: "morning-reflection-habit",
};
export const resourceSlug = "fellowship-resources";

export function isReflectionKind(value: unknown): value is ReflectionKind {
  return (reflectionKinds as readonly unknown[]).includes(value);
}

export function reflectionFieldLimit(field: ReflectionField) {
  if (field === "initials") return 32;
  if (field === "pattern") return 120;
  return 3000;
}

export function parseReflection(kind: ReflectionKind, input: unknown): ReflectionPayload | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const values = input as Record<string, unknown>;
  const payload: ReflectionPayload = {};
  for (const field of reflectionFields[kind]) {
    const value = values[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > reflectionFieldLimit(field)) return null;
    const trimmed = value.trim();
    if (field === "practice" && trimmed && !(morningPractices as readonly string[]).includes(trimmed)) return null;
    if (trimmed) payload[field] = trimmed;
  }
  for (const field of reflectionChoiceFields[kind]) {
    const value = values[field];
    if (value === undefined || value === "") continue;
    if (typeof value !== "string" || !(reflectionChoices[field] as readonly string[]).includes(value)) return null;
    payload[field] = value;
  }
  if (kind === "step67" && !payload.pattern && !payload.patternChoice) return null;
  if (payload.patternChoice) delete payload.pattern;
  if (kind === "step11" && !payload.intention) return null;
  return Object.keys(payload).length ? payload : null;
}

function normalizePattern(value: string) {
  return value.trim().normalize("NFKC").toLowerCase().replace(/\s+/gu, " ");
}

const patternAliases = new Map(reflectionChoices.patternChoice.flatMap((id) =>
  Object.values(reflectionPatternLabels[id]).map((label) => [normalizePattern(label), id] as const)));

export function entryPattern(payload: ReflectionPayload) {
  const preset = reflectionChoices.patternChoice.find((id) => id === payload.patternChoice);
  if (preset) return { key: preset, preset, name: reflectionPatternLabels[preset].en };
  const name = payload.pattern?.trim();
  if (!name) return null;
  const normalized = normalizePattern(name);
  const matched = patternAliases.get(normalized);
  return { key: matched ?? "custom:" + normalized, preset: matched, name };
}

export function trackedPatterns(entries: readonly ReflectionEntry[]) {
  const tracked = new Map<string, NonNullable<ReturnType<typeof entryPattern>> & { count: number }>();
  for (const entry of entries) {
    const pattern = entryPattern(entry.payload);
    if (!pattern) continue;
    const existing = tracked.get(pattern.key);
    if (existing) existing.count += 1;
    else tracked.set(pattern.key, { ...pattern, count: 1 });
  }
  return [...tracked.values()].sort((a, b) => b.count - a.count);
}

export type ReflectionPeriod = "all" | "30" | "90";

export function reflectionEntriesInPeriod(entries: readonly ReflectionEntry[], period: ReflectionPeriod, today: string) {
  if (period === "all") return entries;
  const first = new Date(today + "T12:00:00Z");
  first.setUTCDate(first.getUTCDate() - (Number(period) - 1));
  const from = first.toISOString().slice(0, 10);
  return entries.filter(({ date }) => from <= date && date <= today);
}

export function reflectionChoiceCounts(entries: readonly ReflectionEntry[], field: "readiness" | "support" | "principle") {
  const counts = new Map<string, number>();
  for (const { payload } of entries) {
    const choice = payload[field];
    if (choice && (reflectionChoices[field] as readonly string[]).includes(choice)) counts.set(choice, (counts.get(choice) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}
