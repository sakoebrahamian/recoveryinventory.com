import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createServer } from "vite";

function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}
const server = await createServer({ configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const { journalThemes, supportedTheme, journalThemeBootstrap, themePreferenceKey } = await server.ssrLoadModule("/lib/journal-themes.ts");
  assert.equal(journalThemes.length, 10);
  assert.equal(new Set(journalThemes.map(theme => theme.id)).size, 10);
  assert.equal(supportedTheme("unexpected-value"), "sage");
  for (const theme of journalThemes) {
    for (const background of [theme.paper, theme.surface, theme.tint]) {
      assert.ok(contrast(theme.ink, background) >= 4.5, `${theme.id}: main text contrast`);
    }
    assert.ok(contrast(theme.muted, theme.paper) >= 4.5, `${theme.id}: secondary text contrast`);
    assert.ok(contrast(theme.muted, theme.surface) >= 4.5, `${theme.id}: card secondary text contrast`);
    assert.ok(contrast(theme.ink, "#ffffff") >= 4.5, `${theme.id}: primary button contrast`);
    assert.ok(contrast(theme.accent, "#ffffff") >= 4.5, `${theme.id}: accent contrast`);
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: key => key === themePreferenceKey ? theme.id : null } });
    assert.equal(document.documentElement.dataset.riTheme, theme.id, `${theme.id}: restored before paint`);
    for (const language of ["es", "fr", "pt-BR", "ar", "de", "hy", "it", "el"]) {
      const dictionary = language === "es" ? (await server.ssrLoadModule("/lib/translations-es.ts")).spanishTranslations : JSON.parse(fs.readFileSync(`lib/locales/${language}.json`, "utf8"));
      assert.ok(dictionary[theme.label], `${language}: missing theme label`);
      for (const key of ["Color theme", "Choose your colors", "Saved on this browser."]) assert.ok(dictionary[key], `${language}: missing chooser copy`);
    }
  }
  for (const stored of [null, "invalid", "<script>"]) {
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: () => stored } });
    assert.equal(document.documentElement.dataset.riTheme, "sage");
  }
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: () => { throw new Error("Storage blocked"); } } });
  assert.equal(document.documentElement.dataset.riTheme, "sage");
  console.log("10 themes passed: text/button contrast, saved preference restoration, invalid/blocked storage fallback, and all language labels.");
} finally { await server.close(); }
