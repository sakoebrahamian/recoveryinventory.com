/** Appearance is a browser preference, independent of language, account access and journal data. */
type ThemePattern = "diagonal" | "arcs" | "ripples";
type ThemeMode = "light" | "dark";

export const journalThemes = [
  {
    id: "sage", mode: "light", pattern: "ripples", label: "Original sage", fa: "سبز مریم‌گلی اصلی",
    ink: "#173f3a", paper: "#f6f2ea", surface: "#fffdf9", tint: "#dce9df",
    accent: "#a84d33", muted: "#53685f", border: "#9bab9f", highlight: "#a8c7a1",
  },
  {
    id: "sky", mode: "light", pattern: "ripples", label: "Clear sky", fa: "آسمان روشن",
    ink: "#17475a", paper: "#eff9fc", surface: "#fcfeff", tint: "#d9f0f6",
    accent: "#176579", muted: "#506c76", border: "#94b4be", highlight: "#7cbfdf",
  },
  {
    id: "jade", mode: "light", pattern: "arcs", label: "Jade mist", fa: "مه یشمی",
    ink: "#184640", paper: "#eef8f3", surface: "#fbfefa", tint: "#d8eee4",
    accent: "#206c56", muted: "#4c645d", border: "#96b6a8", highlight: "#76b89b",
  },
  {
    id: "lavender", mode: "light", pattern: "arcs", label: "Lavender", fa: "اسطوخودوسی",
    ink: "#483562", paper: "#f5f1fb", surface: "#fefcff", tint: "#e9e0f4",
    accent: "#70459b", muted: "#685a78", border: "#b1a0c2", highlight: "#af93e0",
  },
  {
    id: "peach", mode: "light", pattern: "arcs", label: "Peach glow", fa: "درخشش هلویی",
    ink: "#663a36", paper: "#fff4ed", surface: "#fffdfa", tint: "#f8e1d4",
    accent: "#9e493d", muted: "#77564e", border: "#c7a195", highlight: "#efab85",
  },
  {
    id: "rose", mode: "light", pattern: "arcs", label: "Soft rose", fa: "صورتی ملایم",
    ink: "#6a3048", paper: "#fcf1f5", surface: "#fffcfd", tint: "#f4dfe8",
    accent: "#a33762", muted: "#795866", border: "#c2a0af", highlight: "#d78ba7",
  },
  {
    id: "terracotta", mode: "light", pattern: "ripples", label: "Terracotta", fa: "سفالی",
    ink: "#653b2b", paper: "#fcf2ec", surface: "#fffcfa", tint: "#f3e1d6",
    accent: "#a44d2c", muted: "#785f52", border: "#c0a596", highlight: "#dc916e",
  },
  {
    id: "amber", mode: "light", pattern: "ripples", label: "Warm amber", fa: "کهربایی گرم",
    ink: "#634318", paper: "#fcf6e9", surface: "#fffdf7", tint: "#f4e6c4",
    accent: "#865518", muted: "#776442", border: "#bba87f", highlight: "#e3a843",
  },
  {
    id: "indigo", mode: "dark", pattern: "diagonal", label: "Midnight indigo", fa: "نیلی نیمه‌شب",
    ink: "#e6e4fc", paper: "#100f26", surface: "#1a1937", tint: "#272549",
    accent: "#b3a8f5", muted: "#b1aed3", border: "#46446f", highlight: "#7d7bd6",
  },
  {
    id: "plum", mode: "dark", pattern: "arcs", label: "Deep plum", fa: "آلویی تیره",
    ink: "#f6e6f6", paper: "#1b1120", surface: "#25192b", tint: "#35253b",
    accent: "#dea3e3", muted: "#c7aec9", border: "#5a445f", highlight: "#cf8ca6",
  },
  {
    id: "forest", mode: "dark", pattern: "diagonal", label: "Forest green", fa: "سبز جنگلی",
    ink: "#e2efdd", paper: "#0e1912", surface: "#16241a", tint: "#203225",
    accent: "#9bd08a", muted: "#abc1a6", border: "#3c5442", highlight: "#7fa35a",
  },
  {
    id: "ocean", mode: "dark", pattern: "diagonal", label: "Ocean blue", fa: "آبی اقیانوسی",
    ink: "#deedf9", paper: "#0a1623", surface: "#112032", tint: "#1a2d44",
    accent: "#76c8e4", muted: "#a6bdcf", border: "#324c67", highlight: "#4b9db8",
  },
  {
    id: "slate", mode: "dark", pattern: "diagonal", label: "Slate gray", fa: "خاکستری سنگی",
    ink: "#e5ebf1", paper: "#13171c", surface: "#1c2229", tint: "#272f38",
    accent: "#a7c0d8", muted: "#adb9c5", border: "#414c59", highlight: "#92abbf",
  },
  {
    id: "copper", mode: "dark", pattern: "diagonal", label: "Canyon copper", fa: "مسی دره",
    ink: "#f6e7db", paper: "#1a110d", surface: "#251914", tint: "#35251d",
    accent: "#e8a274", muted: "#c8b0a0", border: "#5b4336", highlight: "#cb8a51",
  },
  {
    id: "aurora", mode: "dark", pattern: "ripples", label: "Aurora teal", fa: "سبزآبی شفق",
    ink: "#def4f0", paper: "#0c191b", surface: "#132527", tint: "#1c3336",
    accent: "#bda5f3", muted: "#a6c3c0", border: "#36524f", highlight: "#b9a0e5",
  },
] as const satisfies readonly { id: string; mode: ThemeMode; pattern: ThemePattern; label: string; fa: string; ink: string; paper: string; surface: string; tint: string; accent: string; muted: string; border: string; highlight: string }[];

export type JournalTheme = (typeof journalThemes)[number]["id"];
export const themePreferenceKey = "ri-color-theme";
export function supportedTheme(value: unknown): JournalTheme {
  return journalThemes.find(theme => theme.id === value)?.id ?? "sage";
}
export function isDarkTheme(id: JournalTheme) {
  return journalThemes.find(theme => theme.id === id)?.mode === "dark";
}

const channels = (hex: string) => hex.slice(1).match(/.{2}/g)!.map(part => parseInt(part, 16));
/** Mix two hex colours; used for the dark "contrast panels" (heroes, footers) in dark themes. */
function mix(a: string, b: string, amount: number) {
  const [x, y] = [channels(a), channels(b)];
  return "#" + x.map((value, i) => Math.round(value * amount + y[i] * (1 - amount)).toString(16).padStart(2, "0")).join("");
}

export const journalThemeStyles = journalThemes.map(theme => {
  const rgb = channels(theme.ink).join(" ");
  const dark = theme.mode === "dark";
  const panel = mix(theme.accent, theme.paper, .2);
  const panelVars = dark ? `
    --theme-panel: ${panel};
    --theme-panel-deep: ${mix(theme.accent, theme.paper, .12)};
    --theme-panel-rgb: ${channels(panel).join(" ")};
    --theme-on-panel: ${theme.ink};` : "";
  return `:root[data-ri-theme="${theme.id}"] {${panelVars}
    color-scheme: ${theme.mode};
    --theme-ink: ${theme.ink};
    --theme-ink-deep: color-mix(in srgb, ${theme.ink} 82%, ${dark ? "#fff" : "#000"});
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
    --theme-bright: ${dark ? `color-mix(in srgb, ${theme.highlight} 45%, ${theme.ink})` : `color-mix(in srgb, ${theme.tint} 85%, #fff)`};
    --theme-pattern: var(--journal-pattern-${theme.pattern});
    --theme-curve: var(--journal-curve-${theme.pattern});
  }`;
}).join("\n");

const darkThemeIds = journalThemes.filter(theme => theme.mode === "dark").map(theme => theme.id);

/** Run before the page paints, so a saved preference does not flash back to sage. */
export const journalThemeBootstrap = `(()=>{const d=document.documentElement;let t="sage";try{const s=localStorage.getItem(${JSON.stringify(themePreferenceKey)});if(${JSON.stringify(journalThemes.map(theme => theme.id))}.includes(s))t=s}catch{}d.dataset.riTheme=t;if(${JSON.stringify(darkThemeIds)}.includes(t))d.dataset.riDark="";else delete d.dataset.riDark})();`;
