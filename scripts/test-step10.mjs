import assert from "node:assert/strict";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { "@": path.resolve(".") } },
});

try {
  const [inventory, analyticsModule, reports, sharing, practices, translations] = await Promise.all([
    server.ssrLoadModule("/lib/inventory.ts"),
    server.ssrLoadModule("/lib/step10-analytics.ts"),
    server.ssrLoadModule("/lib/step10-report.ts"),
    server.ssrLoadModule("/lib/step10-share.ts"),
    server.ssrLoadModule("/lib/step10-practices.ts"),
    server.ssrLoadModule("/lib/translations-es.ts"),
  ]);
  const { principles, step10Questions, step10QuestionsForPayload, questionWithPrinciple, step10QuestionSetVersion } = inventory;
  const { calculateStep10Analytics } = analyticsModule;
  const total = (analytics) => analytics.principles.reduce((sum, item) => sum + item.practiced + item.attention + item.na + item.unanswered, 0);
  const blank = {
    date: "2026-10-05", mood: "steady", states: {}, attentionNotes: {},
    highlights: "", attention: "", patternAction: "", familyContext: "", amends: "", tomorrow: "", gratitude: "",
  };
  assert.equal(principles.length, 24);
  assert.equal(step10Questions.length, 39);
  assert.equal(new Set(step10Questions.map((item) => item.id)).size, 39);
  assert.deepEqual(step10Questions.filter((item) => !item.followUp).map((item) => item.id), principles.map((item) => item.id));

  const legacy = {
    ...blank, date: "2026-10-04",
    states: Object.fromEntries(principles.map((item, index) => [item.id, index === 0 ? "attention" : "practiced"])),
    attentionNotes: { honesty: "Original saved note" },
  };
  const originalSnapshot = JSON.stringify(legacy);
  const oldAnalytics = calculateStep10Analytics([{ date: legacy.date, payload: legacy }], legacy.date);
  assert.equal(total(oldAnalytics), 24, "historical inventories must not acquire missing follow-up answers");
  assert.equal(oldAnalytics.principles.length, 24);
  assert.equal(oldAnalytics.totalPracticed, 23);
  assert.equal(oldAnalytics.written.principles[0].excerpts[0].text, "Original saved note");
  assert.equal(JSON.stringify(legacy), originalSnapshot, "analytics must not modify saved data");

  const expanded = JSON.parse(JSON.stringify({
    ...blank, questionSetVersion: step10QuestionSetVersion,
    states: { honesty: "practiced", "honesty-motives": "attention", "mindfulness-feelings": "na" },
    attentionNotes: { "honesty-motives": "Separate follow-up note" },
  }));
  const current = calculateStep10Analytics([{ date: expanded.date, payload: expanded }], expanded.date);
  assert.equal(total(current), 39);
  assert.equal(current.totalPracticed, 1);
  assert.equal(current.totalAttention, 1);
  assert.equal(current.totalNA, 1);
  assert.equal(current.practiceRate, 50);
  assert.equal(current.principles.find((item) => item.id === "honesty").practiced, 1);
  assert.equal(current.principles.find((item) => item.id === "honesty-motives").attention, 1);
  assert.equal(current.principles.reduce((sum, item) => sum + item.unanswered, 0), 36);
  assert.equal(current.categories.find((item) => item.id === "inner").answered, 2);
  assert.equal(current.written.principles[0].id, "honesty-motives");
  assert.equal(current.written.principles[0].excerpts[0].text, "Separate follow-up note");
  assert.equal(current.weekly[0].focus[0].id, "honesty-motives");
  assert.equal(current.weekly[0].concern.principleId, "honesty-motives");
  assert.equal(step10QuestionsForPayload({ states: { "honesty-motives": "attention" } }).length, 39);

  const mixed = calculateStep10Analytics([
    { date: legacy.date, payload: legacy },
    { date: expanded.date, payload: expanded },
    { date: "2026-10-06", payload: expanded },
  ], expanded.date, legacy.date);
  assert.equal(mixed.totalEntries, 2, "future entries must stay excluded");
  assert.equal(total(mixed), 63, "mixed history must count 24 old and 39 new questions");
  assert.equal(mixed.principles.find((item) => item.id === "honesty-motives").unanswered, 0);
  assert.equal(mixed.principles.find((item) => item.id === "honesty-motives").answered, 1);
  assert.equal(mixed.principles.find((item) => item.id === "willingness-accepting-help").unanswered, 1);
  assert.equal(mixed.allMonths[0].practiced, mixed.totalPracticed);
  assert.equal(mixed.allMonths[0].attention, mixed.totalAttention);
  assert.equal(total(calculateStep10Analytics([{ date: expanded.date, payload: { ...blank, questionSetVersion: 2 } }], expanded.date)), 39);

  const bounds = { mode: "day", from: expanded.date, through: expanded.date };
  for (const language of ["en", "fa", "es"]) {
    const t = (english, farsi) => language === "fa" ? farsi : language === "es" ? translations.spanishTranslations[english] ?? english : english;
    const report = reports.formatStep10SponsorReport(expanded, current, bounds, language, t);
    const oldReport = reports.formatStep10Inventory(legacy, language, t);
    const rich = sharing.step10RichReport(report, current, bounds, language, t);
    assert.equal((rich.match(/<tr>/g) ?? []).length, 39);
    assert.equal((report.match(/^\d+\. /gm) ?? []).length, 39);
    assert.equal((oldReport.match(/^\d+\. /gm) ?? []).length, 24);
    assert.ok(report.includes("Separate follow-up note"));
    assert.ok(oldReport.includes("Original saved note"));
    for (const question of step10Questions) {
      const principle = principles.find((item) => item.id === question.principleId);
      assert.ok(principle, `missing principle for ${question.id}`);
      assert.ok(question[language].length > 10);
      assert.ok(report.includes(questionWithPrinciple(question.id, language)));
      assert.ok(rich.includes(`${t("Principle", "اصل")}: ${principle[language]}`));
      assert.equal(practices.practiceForPrinciple(question.id, language).primary, principle[language]);
    }
    const mixedRich = sharing.step10RichReport("", mixed, { ...bounds, mode: "range", from: legacy.date }, language, t);
    const followUpRow = mixedRich.split("<tr>").find((row) => row.includes(step10Questions.find((item) => item.id === "honesty-motives")[language]));
    assert.ok(followUpRow.includes("width:100%;background:#cc7955"), "a follow-up answered in one eligible entry must fill its bar");
  }
  assert.equal(translations.spanishTranslations.Principle, "Principio");
  assert.equal(translations.spanishTranslations["Follow-up question"], "Pregunta de seguimiento");
  console.log("Step 10 regression checks passed: independent answers and notes, old and mixed history, weekly/monthly totals, localized reports, chart denominators, and principle associations.");
} finally {
  await server.close();
}
