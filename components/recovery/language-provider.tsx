"use client";

import * as React from "react";
import type { Language } from "@/lib/inventory";
import { spanishTranslations } from "@/lib/translations-es";
import { recordSiteAction } from "@/lib/site-analytics";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (english: string, farsi: string) => string;
};

export type LanguageRouteMap = Partial<Record<Language, string>>;

const languagePreferenceKey = "ri-language";

function supportedLanguage(value: string | null): Language | null {
  return value === "en" || value === "es" || value === "fa" ? value : null;
}

function readStoredLanguage(): Language | null {
  try {
    return supportedLanguage(window.localStorage.getItem(languagePreferenceKey));
  } catch {
    return null;
  }
}

export function translateForLanguage(language: Language, english: string, farsi: string) {
  return language === "fa"
    ? farsi
    : language === "es"
      ? spanishTranslations[english] ?? english
      : english;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setCurrentLanguage] = React.useState<Language>("en");

  const setLanguage = React.useCallback((next: Language) => {
    setCurrentLanguage(next);
    try {
      window.localStorage.setItem(languagePreferenceKey, next);
    } catch {
      // The active page still supports language changes when storage is unavailable.
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const { pathname, search } = window.location;
      const requested = pathname === "/demo" || pathname === "/join"
        ? supportedLanguage(new URLSearchParams(search).get("lang"))
        : null;

      if (requested) setLanguage(requested);
      else {
        const stored = readStoredLanguage();
        if (stored) setCurrentLanguage(stored);
      }
    }, 0);

    function syncStoredLanguage(event: StorageEvent) {
      if (event.key === languagePreferenceKey || event.key === null) {
        setCurrentLanguage(readStoredLanguage() ?? "en");
      }
    }

    window.addEventListener("storage", syncStoredLanguage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", syncStoredLanguage);
    };
  }, [setLanguage]);

  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t: (english: string, farsi: string) => translateForLanguage(language, english, farsi),
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

export function LanguageToggle({
  compact = false,
  languageOverride,
  languageRoutes,
}: {
  compact?: boolean;
  languageOverride?: Language;
  languageRoutes?: LanguageRouteMap;
}) {
  const { language: contextLanguage, setLanguage } = useLanguage();
  const language = languageOverride ?? contextLanguage;

  const chooseLanguage = (next: Language) => {
    setLanguage(next);
    const nextRoute = languageRoutes?.[next];
    if (nextRoute) window.location.assign(nextRoute);
    if (next !== language) recordSiteAction(`language_${next}`);
  };

  return (
    <label className={`language-toggle${compact ? " is-compact" : ""}`}>
      <select
        value={language}
        onChange={(event) => chooseLanguage(event.target.value as Language)}
        aria-label={language === "fa" ? "انتخاب زبان" : language === "es" ? "Seleccionar idioma" : "Choose language"}
      >
        <option value="en">English</option>
        <option value="fa">فارسی</option>
        <option value="es">Español</option>
      </select>
    </label>
  );
}
