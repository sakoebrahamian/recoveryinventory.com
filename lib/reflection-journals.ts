export const reflectionKinds = ["step67", "step89", "step11"] as const;
export type ReflectionKind = (typeof reflectionKinds)[number];

export const morningPractices = ["prayer", "meditation", "quiet"] as const;

export const reflectionFields = {
  step67: ["pattern", "willingness", "humility"],
  step89: ["initials", "responsibility", "boundaries", "sponsor"],
  step11: ["practice", "intention"],
} as const satisfies Record<ReflectionKind, readonly string[]>;

export type ReflectionField = (typeof reflectionFields)[ReflectionKind][number];
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
  if (kind === "step67" && !payload.pattern) return null;
  if (kind === "step11" && !payload.intention) return null;
  return Object.keys(payload).length ? payload : null;
}

export function trackedPatterns(entries: readonly ReflectionEntry[]) {
  const tracked = new Map<string, { name: string; count: number }>();
  for (const entry of entries) {
    const name = entry.payload.pattern?.trim();
    if (!name) continue;
    const key = name.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ");
    const existing = tracked.get(key);
    if (existing) existing.count += 1;
    else tracked.set(key, { name, count: 1 });
  }
  return [...tracked.values()].sort((a, b) => b.count - a.count);
}
