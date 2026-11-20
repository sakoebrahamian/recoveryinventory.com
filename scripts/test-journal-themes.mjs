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
  const { journalThemes, supportedTheme, journalThemeBootstrap, journalThemeStyles, themePreferenceKey } = await server.ssrLoadModule("/lib/journal-themes.ts");
  assert.equal(journalThemes.length, 15);
  assert.equal(new Set(journalThemes.map(theme => theme.id)).size, 15);
  const artworkCss = fs.readFileSync("app/journal-theme-art.css", "utf8");
  const artwork = new Set();
  for (const theme of ["sage", "ocean", "lavender", "rose", "forest", "sky", "amber", "plum", "terracotta", "slate"]) {
    assert.equal(supportedTheme(theme), theme, `${theme}: saved preferences remain valid`);
  }
  assert.equal(supportedTheme("unexpected-value"), "sage");
  for (const theme of journalThemes) {
    for (const background of [theme.paper, theme.surface, theme.tint]) {
      assert.ok(contrast(theme.ink, background) >= 4.5, `${theme.id}: main text contrast`);
    }
    assert.ok(contrast(theme.muted, theme.paper) >= 4.5, `${theme.id}: secondary text contrast`);
    assert.ok(contrast(theme.muted, theme.surface) >= 4.5, `${theme.id}: card secondary text contrast`);
    assert.ok(contrast(theme.ink, "#ffffff") >= 4.5, `${theme.id}: primary button contrast`);
    assert.ok(contrast(theme.accent, theme.paper) >= 4.5, `${theme.id}: accent text contrast`);
    const themeRule = journalThemeStyles.split(`:root[data-ri-theme="${theme.id}"]`)[1].split("}")[0];
    assert.ok(themeRule.includes(`--theme-pattern: var(--journal-pattern-${theme.pattern})`), `${theme.id}: missing hero pattern`);
    const artworkSelector = `:is(html[data-ri-theme="${theme.id}"], .theme-choice-art[data-theme-art="${theme.id}"]) {`;
    const artworkRule = artworkCss.split(artworkSelector)[1]?.split("}")[0] ?? "";
    assert.match(artworkRule, /--journal-art:\s+.*gradient/s, `${theme.id}: missing background artwork`);
    artwork.add(artworkRule);
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: key => key === themePreferenceKey ? theme.id : null } });
    assert.equal(document.documentElement.dataset.riTheme, theme.id, `${theme.id}: restored before paint`);
  }
  assert.equal(artwork.size, journalThemes.length, "Each theme has a distinct background");
  for (const language of ["es", "fr", "pt-BR", "ar", "de", "hy", "it", "el"]) {
    const dictionary = language === "es" ? (await server.ssrLoadModule("/lib/translations-es.ts")).spanishTranslations : JSON.parse(fs.readFileSync(`lib/locales/${language}.json`, "utf8"));
    const keys = [
      "Color theme", "Choose your colors", "Saved on this browser.", "Close",
      ...journalThemes.map(theme => theme.label),
    ];
    for (const key of keys) assert.ok(dictionary[key], `${language}: missing theme chooser copy for ${key}`);
  }
  for (const stored of [null, "invalid", "<script>"]) {
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: () => stored } });
    assert.equal(document.documentElement.dataset.riTheme, "sage");
  }
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(journalThemeBootstrap, { document, localStorage: { getItem: () => { throw new Error("Storage blocked"); } } });
  assert.equal(document.documentElement.dataset.riTheme, "sage");
  console.log("15 themes passed: unique background artwork, text/button contrast, saved preference restoration, fallback, and localized labels.");
} finally { await server.close(); }
