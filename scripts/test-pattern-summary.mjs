import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";

const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const [summary, model, inventory, { spanishTranslations }] = await Promise.all([
    "/lib/step10-pattern-summary.ts", "/lib/step10-analytics.ts", "/lib/inventory.ts", "/lib/translations-es.ts",
  ].map((file) => server.ssrLoadModule(file)));
  const bounds = { mode: "range", from: "2026-09-20", through: "2026-10-19" };
  const records = Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.UTC(2026, 8, 20 + index)).toISOString().slice(0, 10),
    payload: { questionSetVersion: inventory.step10QuestionSetVersion, states: Object.fromEntries(inventory.step10Questions.map((q, i) => [q.id, (index + i) % 13 === 0 ? "na" : (index + i) % 5 < 3 ? "practiced" : "attention"])), gratitude: "PRIVATE_REFLECTION_MUST_STAY_OUT", attentionNotes: { honesty: "PRIVATE_NOTE_MUST_STAY_OUT" } },
  })).filter((_, index) => index !== 12);
  const analytics = model.calculateStep10PeriodAnalytics(records, bounds);
  const snapshot = JSON.stringify(analytics);
  // Deliberately add an out-of-range record: the sheet must scope its own source days.
  const outside = model.calculateStep10PeriodAnalytics([{ date: "2026-08-01", payload: { states: { honesty: "attention" } } }], { mode: "day", from: "2026-08-01", through: "2026-08-01" }).days[0];
  const data = summary.patternSummaryData({ ...analytics, days: [outside, ...analytics.days] }, bounds);
  assert.equal(data.savedDays, 29);
  assert.equal(data.calendarDays, 30);
  assert.equal(data.rows.length, 24);
  assert.equal(data.timeline.length, 30);
  assert.equal(data.timeline[12].savedDays, 0);
  assert.equal(Object.values(data.totals).reduce((sum, value) => sum + value, 0), 29 * 39);
  assert.equal(data.totals.practiced, analytics.totalPracticed);
  assert.equal(data.totals.attention, analytics.totalAttention);
  assert.ok(data.timeline.every((point) => point.from >= bounds.from && point.through <= bounds.through));
  const legacy = model.calculateStep10PeriodAnalytics([{ date: bounds.from, payload: { states: { honesty: "na" } } }], bounds);
  const legacyData = summary.patternSummaryData(legacy, bounds);
  assert.equal(legacyData.totals.na, 1);
  assert.equal(legacyData.totals.unanswered, 23, "an older inventory must not acquire unanswered follow-ups");
  assert.equal(legacyData.strengths.length, 0);
  assert.equal(legacyData.focus.length, 0);
  const empty = summary.patternSummaryData({ ...analytics, days: [] }, bounds);
  assert.deepEqual(empty.totals, { practiced: 0, attention: 0, na: 0, unanswered: 0 });
  assert.equal(empty.focus.length, 0);
  assert.equal(empty.strengths.length, 0);
  const longBounds = { mode: "range", from: "2010-01-01", through: "2026-10-19" };
  const longData = summary.patternSummaryData(analytics, longBounds);
  assert.ok(longData.timeline.length <= 48, "the timeline must stay legible on one page for very long ranges");
  assert.equal(longData.timeline[0].from, longBounds.from);
  assert.equal(longData.timeline.at(-1).through, longBounds.through);
  const mapBounds = { ...bounds, from: "2026-08-19" };
  const render = process.argv.includes("--render-fixtures");
  const sharpPackage = render ? fs.readdirSync("node_modules/.pnpm").find((name) => name.startsWith("sharp@")) : null;
  const sharp = render ? createRequire(import.meta.url)(path.resolve("node_modules/.pnpm", sharpPackage, "node_modules/sharp")) : null;
  if (render) fs.mkdirSync("tmp/pdfs", { recursive: true });
  for (const language of ["en", "es", "fa"]) {
    const t = (en, fa) => language === "fa" ? fa : language === "es" ? spanishTranslations[en] ?? en : en;
    const svg = summary.step10PatternSummarySvg(analytics, bounds, language, t, true);
    assert.ok(svg.includes(t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها")));
    assert.ok(svg.includes(t("Sample data", "داده نمونه")));
    assert.ok(!svg.includes("PRIVATE_"));
    for (const principle of inventory.principles) assert.ok(svg.includes(principle[language]), `missing ${principle.id} in ${language}`);
    const maps = summary.step10PatternMapSvgs({ ...analytics, days: [outside, ...analytics.days] }, mapBounds, language, t, true);
    assert.equal(maps.length, 3, "a 62-day map fits on three landscape sheets");
    assert.equal(summary.step10PatternMapSvgs(analytics, bounds, language, t).length, 1);
    for (const sheet of maps) {
      assert.ok(sheet.includes(t("Pattern map", "نقشه الگوها")));
      assert.ok(!sheet.includes("PRIVATE_"), "the map must never include written journal content");
      assert.ok(sheet.includes(t("No saved inventory", "بدون ترازنامه ذخیره‌شده")));
      for (const principle of inventory.principles) assert.ok(sheet.includes(principle[language]));
    }
    assert.ok(maps[0].includes(inventory.formatDisplayDate(mapBounds.from, language)));
    assert.ok(maps.at(-1).includes(inventory.formatDisplayDate(mapBounds.through, language)));
    assert.equal(JSON.stringify(analytics), snapshot, "exports must not change saved analytics");
    if (render) {
      fs.writeFileSync(`tmp/pdfs/pattern-summary-${language}.svg`, svg);
      const jpeg = await sharp(Buffer.from(svg)).resize(3200, 2264).jpeg({ quality: 95 }).toBuffer();
      const pdf = summary.patternSummaryPdf(jpeg, 3200, 2264);
      fs.writeFileSync(`tmp/pdfs/pattern-summary-${language}.pdf`, pdf);
      const ascii = new TextDecoder().decode(pdf);
      assert.equal((ascii.match(/\/Type \/Page\s/g) ?? []).length, 1);
      const start = Number(ascii.match(/startxref\n(\d+)/)[1]);
      assert.equal(new TextDecoder().decode(pdf.slice(start, start + 4)), "xref");
      const images = await Promise.all(maps.map((sheet) => sharp(Buffer.from(sheet)).resize(3200, 2264).jpeg({ quality: 95 }).toBuffer()));
      const mapPdf = summary.patternSummaryPdf(images, 3200, 2264);
      fs.writeFileSync(`tmp/pdfs/pattern-map-${language}.pdf`, mapPdf);
      const mapText = new TextDecoder().decode(mapPdf);
      assert.equal((mapText.match(/\/Type \/Page\s/g) ?? []).length, images.length);
      assert.equal(mapText.match(/\/MediaBox \[0 0 842 595\]/g)?.length, images.length);
      const mapXref = Number(mapText.match(/startxref\n(\d+)/)[1]);
      assert.equal(new TextDecoder().decode(mapPdf.slice(mapXref, mapXref + 4)), "xref");
    }
  }
  console.log(`Pattern report checks passed: 24 principles, scoped dates, missing days, legacy questions, counts-only privacy, and long ranges${render ? ", plus one-page summary and multi-page map PDFs" : ""}.`);
} finally { await server.close(); }
