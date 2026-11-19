import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

assert.equal(fs.existsSync("app/language-qa-sandbox"), false, "The synthetic member/AI test route must never ship");
const sourceKeys = JSON.parse(fs.readFileSync("scripts/localization-source-keys.json", "utf8"));
const newLanguages = ["fr", "pt-BR", "ar", "de", "hy", "it", "el"];
const placeholders = text => [...text.matchAll(/\{[A-Za-z][A-Za-z0-9]*\}/g)].map(match => match[0]).sort();
for (const language of newLanguages) {
  const dictionary = JSON.parse(fs.readFileSync(`lib/locales/${language}.json`, "utf8"));
  assert.deepEqual(sourceKeys.filter(key => !Object.hasOwn(dictionary, key)), [], `${language}: missing source keys`);
  for (const [key, value] of Object.entries(dictionary)) {
    assert.equal(typeof value, "string");
    assert.ok(value.trim(), `${language}: empty translation for ${key}`);
    assert.deepEqual(placeholders(value), placeholders(key), `${language}: changed placeholders in ${key}`);
    assert.ok(!/\b(?:TODO|TRANSLATE_ME)\b/.test(value), `${language}: unfinished translation`);
    for (const price of key.match(/\$\d+(?:\.\d+)?/g) ?? []) assert.ok(value.includes(price), `${language}: changed price ${price}`);
  }
}
const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const [localization, inventory, languageModel, guide, learning, about, comparisons, sitemap, reports, analytics, pattern, metadata] = await Promise.all([
    "/lib/localization.ts", "/lib/inventory.ts", "/lib/languages.ts", "/lib/inventory-guide.ts", "/lib/public-learning.ts", "/lib/about-content.ts", "/lib/product-comparisons.ts", "/app/sitemap.ts", "/lib/step10-report.ts", "/lib/step10-analytics.ts", "/lib/step10-pattern-summary.ts", "/lib/site-metadata.ts",
  ].map(file => server.ssrLoadModule(file)));
  assert.equal(languageModel.languages.length, 10);
  assert.equal(languageModel.supportedLanguage("pt-br"), "pt-BR");
  assert.equal(languageModel.supportedLanguage("xx"), null);
  const original = { en: "Honesty", es: "Honestidad", fa: "صداقت" };
  for (const language of languageModel.languages) {
    await localization.loadTranslations(language);
    const t = (en, fa) => localization.translateForLanguage(language, en, fa);
    assert.equal(languageModel.isRtlLanguage(language), ["fa", "ar"].includes(language));
    assert.ok(inventory.formatDisplayDate("2026-11-19", language));
    const questions = inventory.step10Questions.map(item => inventory.principleQuestion(item.id, language));
    assert.equal(questions.length, 39);
    assert.ok(questions.every(Boolean));
    assert.equal(guide.inventoryGuideTopics("step4", language).length, 7);
    assert.equal(guide.inventoryGuideTopics("step10", language).length, 40);
    assert.equal(localization.localizedText(original, language), language === "en" || language === "es" || language === "fa" ? original[language] : t("Honesty"));
    if (newLanguages.includes(language)) {
      assert.ok(questions.every((label, index) => label !== inventory.step10Questions[index].en), `${language}: untranslated inventory question`);
      assert.notEqual(about.aboutCopy[language].title, about.aboutCopy.en.title);
      assert.notEqual(learning.learningHubCopy[language].title, learning.learningHubCopy.en.title);
      assert.notEqual(comparisons.comparisonUi.title[language], comparisons.comparisonUi.title.en);
      for (const topic of learning.publicLearningTopics) assert.notEqual(topic.copy[language].title, topic.copy.en.title);
    }
    const bounds = { mode: "day", from: "2026-11-19", through: "2026-11-19" };
    const record = { date: bounds.from, payload: { questionSetVersion: 2, states: { honesty: "attention" }, attentionNotes: { honesty: "USER_WRITING_MUST_STAY_ORIGINAL" }, gratitude: "PRIVATE_UNSELECTED_NOTE" } };
    const data = analytics.calculateStep10PeriodAnalytics([record], bounds);
    const report = reports.formatStep10FocusedReport(data, bounds, ["honesty"], [`${bounds.from}:note:honesty`], language, t);
    assert.ok(report.includes("USER_WRITING_MUST_STAY_ORIGINAL"));
    assert.ok(!report.includes("PRIVATE_UNSELECTED_NOTE"));
    const svg = pattern.step10PatternSummarySvg(data, bounds, language, t);
    assert.ok(svg.includes(t("One-page pattern summary", "خلاصه یک‌صفحه‌ای الگوها")));
    if (svg) assert.ok(svg.includes('direction="' + (languageModel.isRtlLanguage(language) ? "rtl" : "ltr") + '"'));
    const currency = new Intl.NumberFormat(languageModel.languageLocale(language), { style: "currency", currency: "USD" }).format(25);
    assert.ok(currency);
  }
  // Exercise the Armenian fallback used by browsers with incomplete ICU locale data.
  const NativeDateTimeFormat = Intl.DateTimeFormat;
  try {
    Intl.DateTimeFormat = class extends NativeDateTimeFormat {
      constructor(locale, options) { super(String(locale).startsWith("hy") ? "en-US" : locale, options); }
    };
    const date = new Date("2026-11-19T16:00:00Z");
    assert.equal(languageModel.dateTimeFormat("hy-AM", { month: "long", timeZone: "UTC" }).format(date), "նոյեմբեր");
    assert.equal(languageModel.dateTimeFormat("hy-AM", { weekday: "narrow", timeZone: "UTC" }).format(date), "Հնգ");
    const timestamp = languageModel.dateTimeFormat("hy-AM", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date);
    assert.ok(timestamp.includes("նոյ")); assert.ok(!timestamp.includes("Nov"));
  } finally { Intl.DateTimeFormat = NativeDateTimeFormat; }
  const [{ LanguageProvider }, { LanguageAvailability }] = await Promise.all(["/components/recovery/language-provider.tsx", "/components/recovery/language-availability.tsx"].map(file => server.ssrLoadModule(file)));
  for (const language of languageModel.languages) {
    const notice = renderToStaticMarkup(React.createElement(LanguageProvider, null, React.createElement(LanguageAvailability, { language })));
    assert.equal((notice.match(/<li /g) ?? []).length, 10);
    assert.ok(notice.includes(localization.translateForLanguage(language, "Available in 10 languages", "در دسترس به ۱۰ زبان")));
  }
  const pages = sitemap.default();
  assert.equal(pages.length, 104);
  assert.equal(new Set(pages.map(item => item.url)).size, pages.length);
  for (const language of newLanguages) {
    assert.ok(pages.some(item => item.url.endsWith(`/${language.toLowerCase()}/learn/step-10-daily-inventory`)));
  }
  for (const item of pages.filter(item => item.alternates)) assert.equal(Object.keys(item.alternates.languages).length, 11);
  assert.deepEqual(metadata.RECOVERY_APP_STRUCTURED_DATA.inLanguage, languageModel.languages);
  // Translation keys introduced by interactive UI changes must be complete too.
  const missing = Object.fromEntries(newLanguages.map(language => [language, new Set()]));
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!/\.tsx?$/.test(file) || /translations-es/.test(file)) continue;
      const tree = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
      function walk(node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t" && ts.isStringLiteral(node.arguments[0])) {
          const key = node.arguments[0].text;
          for (const language of newLanguages) if (localization.translateForLanguage(language, key) === key && !["Recovery Inventory", "RecoveryInventory.com", "Website", "Download PNG"].includes(key)) {
            const dictionary = JSON.parse(fs.readFileSync(`lib/locales/${language}.json`, "utf8"));
            if (!Object.hasOwn(dictionary, key)) missing[language].add(key);
          }
        }
        ts.forEachChild(node, walk);
      }
      walk(tree);
    }
  }
  scan("app"); scan("components"); scan("lib");
  for (const language of newLanguages) assert.deepEqual([...missing[language]], [], `${language}: missing runtime keys`);
  console.log("10-language checks passed: source coverage, placeholders, prices, 39 questions, learning, report selection, RTL, dates/currency, 104 sitemap URLs and hreflang.");
} finally { await server.close(); }
