/** Appearance is a browser preference, independent of language, account access and journal data. */
export const journalThemes = [
  { id: "sage", label: "Original sage", fa: "سبز مریم‌گلی اصلی", ink: "#173f3a", paper: "#f6f2ea", surface: "#fffdf9", tint: "#dce9df", accent: "#a84d33", muted: "#53685f", border: "#9bab9f" },
  { id: "ocean", label: "Ocean blue", fa: "آبی اقیانوسی", ink: "#153f61", paper: "#eef5fb", surface: "#fbfdff", tint: "#dcebf7", accent: "#17617c", muted: "#4c6377", border: "#94adbf" },
  { id: "lavender", label: "Lavender", fa: "اسطوخودوسی", ink: "#483562", paper: "#f5f1fb", surface: "#fefcff", tint: "#e9e0f4", accent: "#70459b", muted: "#685a78", border: "#b1a0c2" },
  { id: "rose", label: "Soft rose", fa: "صورتی ملایم", ink: "#6a3048", paper: "#fcf1f5", surface: "#fffcfd", tint: "#f4dfe8", accent: "#a33762", muted: "#795866", border: "#c2a0af" },
  { id: "forest", label: "Forest green", fa: "سبز جنگلی", ink: "#244c32", paper: "#f0f6ee", surface: "#fcfefa", tint: "#dfebd8", accent: "#3b6b31", muted: "#52664f", border: "#9aaf91" },
  { id: "sky", label: "Clear sky", fa: "آسمان روشن", ink: "#17475a", paper: "#eff9fc", surface: "#fcfeff", tint: "#d9f0f6", accent: "#176579", muted: "#506c76", border: "#94b4be" },
  { id: "amber", label: "Warm amber", fa: "کهربایی گرم", ink: "#634318", paper: "#fcf6e9", surface: "#fffdf7", tint: "#f4e6c4", accent: "#865518", muted: "#776442", border: "#bba87f" },
  { id: "plum", label: "Deep plum", fa: "آلویی تیره", ink: "#59345d", paper: "#f8f0f8", surface: "#fffcff", tint: "#eddfef", accent: "#85458a", muted: "#715b73", border: "#b9a0bb" },
  { id: "terracotta", label: "Terracotta", fa: "سفالی", ink: "#653b2b", paper: "#fcf2ec", surface: "#fffcfa", tint: "#f3e1d6", accent: "#a44d2c", muted: "#785f52", border: "#c0a596" },
  { id: "slate", label: "Slate gray", fa: "خاکستری سنگی", ink: "#334454", paper: "#f1f4f7", surface: "#fcfdff", tint: "#e0e7ee", accent: "#4b6076", muted: "#596978", border: "#a0adb9" },
] as const;

export type JournalTheme = (typeof journalThemes)[number]["id"];
export const themePreferenceKey = "ri-color-theme";
export function supportedTheme(value: unknown): JournalTheme {
  return journalThemes.find(theme => theme.id === value)?.id ?? "sage";
}

// Keep the original design unchanged until a visitor chooses another palette.
export const journalThemeStyles = journalThemes.filter(theme => theme.id !== "sage").map(theme => {
  const rgb = theme.ink.slice(1).match(/.{2}/g)!.map(hex => parseInt(hex, 16)).join(" ");
  return `:root[data-ri-theme="${theme.id}"]{--theme-ink:${theme.ink};--theme-ink-deep:color-mix(in srgb,${theme.ink} 82%,#000);--theme-ink-rgb:${rgb};--theme-paper:${theme.paper};--theme-surface:${theme.surface};--theme-tint:${theme.tint};--theme-accent:${theme.accent};--theme-muted:${theme.muted};--theme-border:${theme.border};--theme-soft:color-mix(in srgb,${theme.tint} 45%,${theme.surface});--theme-sage:color-mix(in srgb,${theme.ink} 45%,${theme.tint});--theme-bright:color-mix(in srgb,${theme.tint} 85%,#fff)}`;
}).join("\n");

/** Run before the page paints, so a saved preference does not flash back to sage. */
export const journalThemeBootstrap = `(()=>{try{const t=localStorage.getItem(${JSON.stringify(themePreferenceKey)});document.documentElement.dataset.riTheme=${JSON.stringify(journalThemes.map(theme => theme.id))}.includes(t)?t:"sage"}catch{document.documentElement.dataset.riTheme="sage"}})();`;
