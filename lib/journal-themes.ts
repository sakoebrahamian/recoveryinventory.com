/** Appearance is a browser preference, independent of language, account access and journal data. */
type ThemePattern = "diagonal" | "arcs" | "ripples";

export const journalThemes = [
  {
    id: "sage", pattern: "ripples", label: "Original sage", fa: "سبز مریم‌گلی اصلی",
    ink: "#173f3a", paper: "#f6f2ea", surface: "#fffdf9", tint: "#dce9df",
    accent: "#a84d33", muted: "#53685f", border: "#9bab9f", highlight: "#a8c7a1",
  },
  {
    id: "aurora", pattern: "ripples", label: "Aurora teal", fa: "سبزآبی شفق",
    ink: "#214852", paper: "#edf7f5", surface: "#fbfefd", tint: "#d8eee9",
    accent: "#654284", muted: "#4b6269", border: "#97b2b2", highlight: "#b9a0e5",
  },
  {
    id: "copper", pattern: "diagonal", label: "Canyon copper", fa: "مسی دره",
    ink: "#4d332b", paper: "#f6f0e9", surface: "#fffdf9", tint: "#eddfcf",
    accent: "#8a4629", muted: "#69584e", border: "#b5a190", highlight: "#cb8a51",
  },
  {
    id: "sky", pattern: "ripples", label: "Clear sky", fa: "آسمان روشن",
    ink: "#17475a", paper: "#eff9fc", surface: "#fcfeff", tint: "#d9f0f6",
    accent: "#176579", muted: "#506c76", border: "#94b4be", highlight: "#7cbfdf",
  },
  {
    id: "plum", pattern: "arcs", label: "Deep plum", fa: "آلویی تیره",
    ink: "#59345d", paper: "#f8f0f8", surface: "#fffcff", tint: "#eddfef",
    accent: "#85458a", muted: "#715b73", border: "#b9a0bb", highlight: "#cf8ca6",
  },
  {
    id: "forest", pattern: "diagonal", label: "Forest green", fa: "سبز جنگلی",
    ink: "#244c32", paper: "#f0f6ee", surface: "#fcfefa", tint: "#dfebd8",
    accent: "#3b6b31", muted: "#52664f", border: "#9aaf91", highlight: "#789955",
  },
  {
    id: "jade", pattern: "arcs", label: "Jade mist", fa: "مه یشمی",
    ink: "#184640", paper: "#eef8f3", surface: "#fbfefa", tint: "#d8eee4",
    accent: "#206c56", muted: "#4c645d", border: "#96b6a8", highlight: "#76b89b",
  },
  {
    id: "lavender", pattern: "arcs", label: "Lavender", fa: "اسطوخودوسی",
    ink: "#483562", paper: "#f5f1fb", surface: "#fefcff", tint: "#e9e0f4",
    accent: "#70459b", muted: "#685a78", border: "#b1a0c2", highlight: "#af93e0",
  },
  {
    id: "indigo", pattern: "diagonal", label: "Midnight indigo", fa: "نیلی نیمه‌شب",
    ink: "#282650", paper: "#f0effa", surface: "#fdfcff", tint: "#e2dff6",
    accent: "#51418a", muted: "#575572", border: "#a2a0c0", highlight: "#7776cb",
  },
  {
    id: "ocean", pattern: "diagonal", label: "Ocean blue", fa: "آبی اقیانوسی",
    ink: "#153f61", paper: "#eef5fb", surface: "#fbfdff", tint: "#dcebf7",
    accent: "#17617c", muted: "#4c6377", border: "#94adbf", highlight: "#4b9db8",
  },
  {
    id: "peach", pattern: "arcs", label: "Peach glow", fa: "درخشش هلویی",
    ink: "#663a36", paper: "#fff4ed", surface: "#fffdfa", tint: "#f8e1d4",
    accent: "#9e493d", muted: "#77564e", border: "#c7a195", highlight: "#efab85",
  },
  {
    id: "slate", pattern: "diagonal", label: "Slate gray", fa: "خاکستری سنگی",
    ink: "#334454", paper: "#f1f4f7", surface: "#fcfdff", tint: "#e0e7ee",
    accent: "#4b6076", muted: "#596978", border: "#a0adb9", highlight: "#92abbf",
  },
  {
    id: "rose", pattern: "arcs", label: "Soft rose", fa: "صورتی ملایم",
    ink: "#6a3048", paper: "#fcf1f5", surface: "#fffcfd", tint: "#f4dfe8",
    accent: "#a33762", muted: "#795866", border: "#c2a0af", highlight: "#d78ba7",
  },
  {
    id: "terracotta", pattern: "ripples", label: "Terracotta", fa: "سفالی",
    ink: "#653b2b", paper: "#fcf2ec", surface: "#fffcfa", tint: "#f3e1d6",
    accent: "#a44d2c", muted: "#785f52", border: "#c0a596", highlight: "#dc916e",
  },
  {
    id: "amber", pattern: "ripples", label: "Warm amber", fa: "کهربایی گرم",
    ink: "#634318", paper: "#fcf6e9", surface: "#fffdf7", tint: "#f4e6c4",
    accent: "#865518", muted: "#776442", border: "#bba87f", highlight: "#e3a843",
  },
] as const satisfies readonly { id: string; pattern: ThemePattern; label: string; fa: string; ink: string; paper: string; surface: string; tint: string; accent: string; muted: string; border: string; highlight: string }[];

export type JournalTheme = (typeof journalThemes)[number]["id"];
export const themePreferenceKey = "ri-color-theme";
export function supportedTheme(value: unknown): JournalTheme {
  return journalThemes.find(theme => theme.id === value)?.id ?? "sage";
}

export const journalThemeStyles = journalThemes.map(theme => {
  const rgb = theme.ink.slice(1).match(/.{2}/g)!.map(hex => parseInt(hex, 16)).join(" ");
  return `:root[data-ri-theme="${theme.id}"] {
    --theme-ink: ${theme.ink};
    --theme-ink-deep: color-mix(in srgb, ${theme.ink} 82%, #000);
    --theme-ink-rgb: ${rgb};
    --theme-paper: ${theme.paper};
    --theme-surface: ${theme.surface};
    --theme-tint: ${theme.tint};
    --theme-accent: ${theme.accent};
    --theme-muted: ${theme.muted};
    --theme-border: ${theme.border};
    --theme-highlight: ${theme.highlight};
    --theme-soft: color-mix(in srgb, ${theme.tint} 45%, ${theme.surface});
    --theme-sage: color-mix(in srgb, ${theme.ink} 45%, ${theme.tint});
    --theme-bright: color-mix(in srgb, ${theme.tint} 85%, #fff);
    --theme-pattern: var(--journal-pattern-${theme.pattern});
    --theme-curve: var(--journal-curve-${theme.pattern});
  }`;
}).join("\n");

/** Run before the page paints, so a saved preference does not flash back to sage. */
export const journalThemeBootstrap = `(()=>{try{const t=localStorage.getItem(${JSON.stringify(themePreferenceKey)});document.documentElement.dataset.riTheme=${JSON.stringify(journalThemes.map(theme => theme.id))}.includes(t)?t:"sage"}catch{document.documentElement.dataset.riTheme="sage"}})();`;
