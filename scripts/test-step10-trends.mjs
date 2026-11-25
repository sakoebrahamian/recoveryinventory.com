import assert from "node:assert/strict";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const [trends, inventory] = await Promise.all(["/lib/step10-trends.ts", "/lib/inventory.ts"].map((file) => server.ssrLoadModule(file)));
  const ids = inventory.step10Questions.map(({ id }) => id);
  const familyDays = [4, 7, 11, 17, 25, 29];
  // 30 days from Tuesday, October 27, 2026. Index 6, 13, 20 and 27 are Mondays.
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, 27 + index, 12)).toISOString().slice(0, 10);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const states = Object.fromEntries(ids.map((id) => [id, "practiced"]));
    states.forgiveness = index < 17 ? "attention" : "practiced";
    states["compassion-self-care"] = index % 3 === 0 ? "practiced" : "attention";
    states.gratitude = index === 3 ? "attention" : "practiced";
    states["patience-pausing"] = weekday === 1 || index % 5 === 0 ? "attention" : "practiced";
    states["boundaries-saying-no"] = familyDays.includes(index) ? "attention" : "practiced";
    states.courage = index < 15 ? "practiced" : "attention";
    states.service = weekday === 0 || weekday === 6 ? "practiced" : "na";
    return { date, questionIds: ids, states, notes: {}, reflections: familyDays.includes(index) ? { familyContext: "A family member's drinking affected today." } : {} };
  });
  const snapshot = JSON.stringify(days);
  const result = trends.buildStep10Trends(days);
  assert.equal(JSON.stringify(days), snapshot, "trends must not mutate analytics days");
  const status = (id) => result.questions.find((item) => item.id === id).status;

  assert.equal(result.halves.earlierFrom, "2026-10-27");
  assert.equal(result.halves.earlierThrough, "2026-11-10");
  assert.equal(result.halves.recentFrom, "2026-11-11");
  assert.equal(result.halves.recentThrough, "2026-11-25");
  assert.equal(result.halves.earlierDays, 15);
  assert.equal(result.halves.recentDays, 15);

  assert.equal(status("forgiveness"), "improving", "a resolved resentment must not stay labeled as a recurring problem");
  assert.equal(result.questions.find((item) => item.id === "forgiveness").streak, 13);
  assert.equal(result.improving[0].id, "forgiveness");
  assert.equal(status("compassion-self-care"), "focus");
  assert.equal(status("courage"), "slipping");
  assert.equal(result.focus[0].id, "courage", "slipping questions are listed before ongoing focus");
  assert.ok(result.focus.some((item) => item.id === "compassion-self-care"));
  assert.equal(status("gratitude"), "strength");
  assert.equal(result.strengths.length, 3);
  assert.ok(result.strengths.every((item) => item.status === "strength"));
  assert.equal(result.questions.find((item) => item.id === "service").overall.answered, 8, "Didn’t come up today answers never count as practiced or needs attention");
  assert.ok(result.improving.length <= 3 && result.focus.length <= 3 && result.strengths.length <= 3);

  const family = result.observations.find((item) => item.kind === "family");
  assert.deepEqual(family && [family.id, family.count, family.total, family.otherCount, family.otherTotal], ["boundaries-saying-no", 6, 6, 0, 24]);
  const monday = result.observations.find((item) => item.kind === "weekday" && item.id === "patience-pausing");
  assert.ok(monday, "a weekday that repeatedly needs attention is reported");
  assert.equal(monday.weekday, 1);
  assert.ok(result.observations.length <= 3);
  assert.ok(result.observations.every((item) => item.difference >= trends.trendRules.pattern));

  const short = trends.buildStep10Trends(days.slice(0, 4));
  assert.equal(short.halves, null, "fewer than three saved days in a half cannot be compared");
  assert.equal(short.observations.length, 0);
  assert.ok(short.questions.every((item) => item.status === "unclear"));
  assert.equal(trends.buildStep10Trends([]).halves, null);

  const older = trends.countAnswers([{ date: "2026-10-01", questionIds: ["honesty"], states: { honesty: "practiced", "honesty-motives": "attention" }, notes: {}, reflections: {} }], ["honesty-motives"]);
  assert.deepEqual(older, { practiced: 0, attention: 0, answered: 0, rate: null }, "questions missing from older inventories are not counted");
  console.log("Trend checks passed: halves, improving/slipping/focus/strength rules, streaks, weekday and family-writing patterns, small samples, and older inventories.");
} finally { await server.close(); }
