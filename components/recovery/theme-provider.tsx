"use client";

import * as React from "react";
import { supportedTheme, themePreferenceKey, type JournalTheme } from "@/lib/journal-themes";

const ThemeContext = React.createContext<{ theme: JournalTheme; chooseTheme: (theme: JournalTheme) => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<JournalTheme>("sage");
  const apply = React.useCallback((next: JournalTheme) => {
    document.documentElement.dataset.riTheme = next;
    setTheme(next);
  }, []);
  React.useEffect(() => {
    apply(supportedTheme(document.documentElement.dataset.riTheme));
    function sync(event: StorageEvent) {
      if (event.key === themePreferenceKey || event.key === null) apply(supportedTheme(event.newValue));
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [apply]);
  const chooseTheme = React.useCallback((next: JournalTheme) => {
    const choice = supportedTheme(next);
    apply(choice);
    try { window.localStorage.setItem(themePreferenceKey, choice); }
    catch { /* The active page still changes when browser storage is unavailable. */ }
  }, [apply]);
  const value = React.useMemo(() => ({ theme, chooseTheme }), [theme, chooseTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
