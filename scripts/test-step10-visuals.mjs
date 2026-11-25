import assert from "node:assert/strict";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const [visuals, trends, detail] = await Promise.all(["/lib/step10-visuals.ts", "/lib/step10-trends.ts", "/lib/step10-detail.ts"].map((file) => server.ssrLoadModule(file)));
  const ids = ["honesty", "honesty-motives", "patience", "gratitude"];
  const day = (date, states, reflections = {}) => ({ date, questionIds: ids, states, notes: {}, reflections });
  // Saved days in a 10-day range from Monday, November 16, 2026. November 18 and 21 have no inventory.
  const days = [
    day("2026-11-16", { honesty: "practiced", "honesty-motives": "attention", patience: "attention", gratitude: "practiced" }),
    day("2026-11-17", { honesty: "practiced", "honesty-motives": "practiced", patience: "attention", gratitude: "na" }, { highlights: "  I paused before answering.  " }),
    day("2026-11-19", { honesty: "practiced", "honesty-motives": "practiced", patience: "practiced", gratitude: "practiced" }, { amends: "Apologize for my tone." }),
    day("2026-11-20", { honesty: "na", "honesty-motives": "na", patience: "na", gratitude: "na" }),
    day("2026-11-22", { honesty: "practiced", "honesty-motives": "practiced", patience: "practiced" }),
    day("2026-11-23", { honesty: "attention", "honesty-motives": "practiced", patience: "practiced", gratitude: "practiced" }, { highlights: "x".repeat(400) }),
  ];
  const snapshot = JSON.stringify(days);
  const series = visuals.dailyPracticeSeries(days, { from: "2026-11-16", through: "2026-11-25" });
  assert.equal(JSON.stringify(days), snapshot, "chart helpers must not mutate analytics days");
  assert.equal(series.length, 10, "one point for every calendar day, including days without an inventory");
  const point = (date) => series.find((item) => item.date === date);
  assert.deepEqual([point("2026-11-16").practiced, point("2026-11-16").answered, point("2026-11-16").rate], [2, 4, 50]);
  assert.equal(point("2026-11-17").rate, 67, "Didn’t come up today is left out of the daily share");
  assert.equal(point("2026-11-18").saved, false);
  assert.equal(point("2026-11-18").rate, null);
  assert.equal(point("2026-11-20").saved, true);
  assert.equal(point("2026-11-20").rate, null, "a day with only Didn’t come up today has no share");
  assert.equal(point("2026-11-22").answered, 3, "an unanswered question does not count");
  assert.equal(point("2026-11-16").weekday, 1);
  assert.equal(point("2026-11-21").weekday, 6);

  assert.equal(point("2026-11-16").average, null, "the 7-day average needs at least 3 answered days");
  assert.equal(point("2026-11-17").average, null);
  assert.equal(point("2026-11-19").average, 73, "average pools answers: (2+2+4)/(4+3+4)");
  assert.equal(point("2026-11-23").average, 86, "only the 7 days up to the date are included: Nov 17–23, (2+4+3+3)/(3+4+3+4)");
  assert.equal(point("2026-11-25").average, 91, "Nov 19–25 has three answered days");

  assert.deepEqual(point("2026-11-17").note, { field: "highlights", text: "I paused before answering." });
  assert.deepEqual(point("2026-11-19").note, { field: "amends", text: "Apologize for my tone." });
  assert.equal(point("2026-11-16").note, null);
  assert.equal(point("2026-11-23").note.text.length, visuals.visualRules.noteLength, "long writing is shortened for the chart");

  assert.deepEqual(visuals.dailyPracticeSeries(days, { from: "2026-11-25", through: "2026-11-16" }), []);
  const long = visuals.dailyPracticeSeries([], { from: "2024-01-01", through: "2026-11-25" });
  assert.equal(long.length, visuals.visualRules.maxDailyPoints, "very long ranges keep the most recent days");
  assert.equal(long.at(-1).date, "2026-11-25");

  const rates = visuals.practiceRateByDate(days);
  assert.equal(rates["2026-11-19"], 100);
  assert.equal(rates["2026-11-20"], null);
  assert.ok(!("2026-11-18" in rates), "days without an inventory have no calendar tint");
  assert.deepEqual([null, 0, 49, 50, 69, 70, 84, 85, 100].map(visuals.tintLevel), [0, 1, 1, 2, 2, 3, 3, 4, 4]);

  const sample = Array.from({ length: 12 }, (_, index) => day(new Date(Date.UTC(2026, 10, 1 + index, 12)).toISOString().slice(0, 10), {
    honesty: index < 6 ? "attention" : "practiced",
    "honesty-motives": index < 6 ? "practiced" : "attention",
    patience: "practiced",
    gratitude: index % 2 ? "practiced" : "attention",
  }));
  const rows = visuals.changeRows(trends.buildStep10Trends(sample).questions);
  assert.deepEqual(rows.slice(0, 2).map((item) => [item.id, item.change]), [["honesty", 100], ["honesty-motives", -100]], "largest changes first, rises before equal drops");
  assert.ok(rows.every((item, index) => index === 0 || Math.abs(rows[index - 1].change) >= Math.abs(item.change)));
  assert.ok(rows.every((item) => item.earlier.rate !== null && item.recent.rate !== null));

  const daily = detail.step10Trends(days, { mode: "range", from: "2026-11-16", through: "2026-11-20" }, ids, "day");
  assert.equal(daily.length, 5, "the Day option has one row per date");
  assert.deepEqual(daily.map((item) => [item.from, item.through, item.savedDays]), [["2026-11-16", "2026-11-16", 1], ["2026-11-17", "2026-11-17", 1], ["2026-11-18", "2026-11-18", 0], ["2026-11-19", "2026-11-19", 1], ["2026-11-20", "2026-11-20", 1]]);
  assert.equal(visuals.fillTemplate("{a} of {b} {missing}", { a: 2, b: 3 }), "2 of 3 {missing}");
  assert.equal(visuals.payloadPracticeRate({ states: { honesty: "practiced", patience: "attention", gratitude: "na" } }), 50, "workspace calendar share ignores Didn’t come up today");
  assert.equal(visuals.payloadPracticeRate(null), null, "an empty payload has no calendar tint");
  console.log("Visual checks passed: daily share, 7-day average, writing markers, long ranges, calendar tint, what-changed order, and the Day trend option.");
} finally { await server.close(); }
