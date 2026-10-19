import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const [period, model, detail, reports, translations, inventory] = await Promise.all([
    "/lib/step10-report-period.ts", "/lib/step10-analytics.ts", "/lib/step10-detail.ts", "/lib/step10-report.ts", "/lib/translations-es.ts", "/lib/inventory.ts",
  ].map((file) => server.ssrLoadModule(file)));
  const checkPrevious = (bounds, expected) => assert.deepEqual(period.comparisonReportBounds(bounds), { ...bounds, ...expected });
  checkPrevious({ mode: "month", from: "2026-10-01", through: "2026-10-19" }, { from: "2026-09-01", through: "2026-09-19" });
  checkPrevious({ mode: "month", from: "2026-10-01", through: "2026-10-31" }, { from: "2026-09-01", through: "2026-09-30" });
  checkPrevious({ mode: "month", from: "2024-02-01", through: "2024-02-29" }, { from: "2024-01-01", through: "2024-01-31" });
  checkPrevious({ mode: "week", from: "2026-10-19", through: "2026-10-21" }, { from: "2026-10-12", through: "2026-10-14" });
  checkPrevious({ mode: "year", from: "2024-01-01", through: "2024-02-29" }, { from: "2023-01-01", through: "2023-02-28" });
  checkPrevious({ mode: "range", from: "2026-11-01", through: "2026-11-03" }, { from: "2026-10-29", through: "2026-10-31" });
  checkPrevious({ mode: "day", from: "2026-01-01", through: "2026-01-01" }, { from: "2025-12-31", through: "2025-12-31" });
  assert.equal(period.reportBounds({ mode: "range", from: "2026-10-20", through: "2026-10-19" }, "2026-10-19", "2026-10-19"), null);
  const make = (date, states, extra = {}) => ({ date, payload: { questionSetVersion: inventory.step10QuestionSetVersion, states, ...extra } });
  const records = [
    make("2026-09-01", { honesty: "practiced", patience: "attention" }, { gratitude: "PREVIOUS_PRIVATE_WORDS" }),
    make("2026-09-20", { honesty: "attention" }),
    make("2026-10-01", { honesty: "practiced", "honesty-motives": "attention", patience: "na" }, { gratitude: "INCLUDE_THIS_NOTE", tomorrow: "DO_NOT_INCLUDE_THIS_NOTE", attentionNotes: { "honesty-motives": "PRIVATE_QUESTION_NOTE" } }),
    { date: "2026-10-05", payload: { states: { honesty: "attention" }, gratitude: "OLDER_INVENTORY_NOTE" } },
    make("2026-10-20", { honesty: "practiced" }, { gratitude: "FUTURE_PRIVATE_WORDS" }),
  ];
  const snapshot = JSON.stringify(records);
  const bounds = { mode: "month", from: "2026-10-01", through: "2026-10-19" };
  const analytics = model.calculateStep10PeriodAnalytics(records, bounds);
  assert.equal(JSON.stringify(records), snapshot, "reading analytics must not mutate saved entries");
  assert.equal(analytics.totalEntries, 2);
  assert.equal(analytics.comparison.totalEntries, 1, "previous partial month must exclude later September entries");
  assert.equal(analytics.comparison.practiceRate, 50);
  assert.deepEqual(analytics.days.map((day) => day.date), ["2026-10-01", "2026-10-05"]);
  assert.equal(analytics.practiceRate, 33);
  assert.equal(analytics.totalNA, 1);
  assert.ok(analytics.weekly.every((week) => week.start >= bounds.from && week.end <= bounds.through));
  assert.equal(detail.answerForDay(analytics.days[1], "honesty-motives"), "not-included");
  assert.deepEqual(detail.countQuestionDays(analytics.days, ["honesty-motives"]), { practiced: 0, attention: 1, na: 0, unanswered: 0, answered: 1, rate: 0 });
  assert.deepEqual(detail.countQuestionDays(analytics.days, ["patience"]), { practiced: 0, attention: 0, na: 1, unanswered: 1, answered: 0, rate: null });
  const empty = model.calculateStep10PeriodAnalytics(records, { mode: "range", from: "2026-10-10", through: "2026-10-12" });
  assert.equal(empty.totalEntries, 0);
  assert.equal(empty.days.length, 0);
  const weeks = detail.step10Trends(analytics.days, bounds, ["honesty-motives"], "week");
  assert.equal(weeks.reduce((sum, row) => sum + row.attention, 0), 1);
  assert.equal(weeks.reduce((sum, row) => sum + row.unanswered, 0), 0);
  assert.ok(weeks.some((row) => row.savedDays === 0 && row.rate === null), "missing days must not become negative or zero-percent answers");
  assert.ok(detail.reflectionEntries(analytics).every((row) => !/PREVIOUS|FUTURE/.test(row.text)));
  for (const language of ["en", "es", "fa"]) {
    const t = (en, fa) => language === "fa" ? fa : language === "es" ? translations.spanishTranslations[en] ?? en : en;
    const noWriting = reports.formatStep10FocusedReport(analytics, bounds, ["honesty"], [], language, t);
    assert.ok(!/INCLUDE_THIS_NOTE|DO_NOT_INCLUDE_THIS_NOTE|PRIVATE_QUESTION_NOTE|OLDER_INVENTORY_NOTE/.test(noWriting));
    const selected = reports.formatStep10FocusedReport(analytics, bounds, ["honesty"], ["2026-10-01:gratitude"], language, t);
    assert.ok(selected.includes("INCLUDE_THIS_NOTE"));
    assert.ok(!/DO_NOT_INCLUDE_THIS_NOTE|PRIVATE_QUESTION_NOTE|OLDER_INVENTORY_NOTE|PREVIOUS_PRIVATE_WORDS|FUTURE_PRIVATE_WORDS/.test(selected));
    assert.ok(selected.includes(t("Didn’t come up today", "امروز پیش نیامد")));
    assert.ok(!selected.includes("N/A"));
    const normal = reports.formatStep10ReportAnalytics(analytics, bounds, language, t);
    assert.ok(normal.includes(t("Previous period", "بازه پیشین")));
    assert.ok(normal.includes("33%"));
  }
  const missing = new Set();
  const scan = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!/\.tsx?$/.test(file) || file.endsWith("translations-es.ts")) continue;
      const source = fs.readFileSync(file, "utf8");
      assert.ok(!/\bN\/A\b|کاربرد ندارد|No aplica/.test(source), `old response label remains in ${file}`);
      const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
      const walk = (node) => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t" && ts.isStringLiteral(node.arguments[0]) && !translations.spanishTranslations[node.arguments[0].text]) missing.add(node.arguments[0].text);
        ts.forEachChild(node, walk);
      };
      walk(tree);
    }
  };
  ["app", "components/recovery", "lib"].forEach(scan);
  assert.deepEqual([...missing], [], "every literal interface string must have a Spanish translation");
  const [{ LanguageProvider }, { AnalyticsFeatureGuide }, { Step10AnalyticsDetail, Step10PeriodComparison }] = await Promise.all([
    server.ssrLoadModule("/components/recovery/language-provider.tsx"),
    server.ssrLoadModule("/components/recovery/analytics-feature-guide.tsx"),
    server.ssrLoadModule("/components/recovery/step10-analytics-detail.tsx"),
  ]);
  for (const [language, expected] of [["en", "Didn’t come up today"], ["es", "No se presentó hoy"], ["fa", "امروز پیش نیامد"]]) {
    const html = renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(AnalyticsFeatureGuide, { language })));
    assert.ok(html.includes(expected));
    assert.ok(html.includes(`lang="${language}"`));
    assert.equal((html.match(/<article>/g) ?? []).length, 6);
  }
  const memberHtml = renderToStaticMarkup(React.createElement(LanguageProvider, null,
    React.createElement(Step10PeriodComparison, { analytics, bounds }),
    React.createElement(Step10AnalyticsDetail, { analytics, bounds })));
  assert.ok(memberHtml.includes("Recorded-day calendar"));
  assert.ok(memberHtml.includes("Your reflection history"));
  assert.ok(memberHtml.includes("INCLUDE_THIS_NOTE"));
  assert.ok(!memberHtml.includes("PREVIOUS_PRIVATE_WORDS"));
  console.log("Detailed analytics checks passed: calendar comparisons, partial and leap periods, scoped history, older questions, missing data, selected-note privacy, localized reports, and complete Spanish interface coverage.");
} finally { await server.close(); }
