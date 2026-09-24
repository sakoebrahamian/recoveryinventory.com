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

export function translateForLanguage(language: Language, english: string, farsi: string) {
  return language === "fa"
    ? farsi
    : language === "es"
      ? spanishTranslations[english] ?? english
      : english;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore(
    React.useCallback((onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("ri-language-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("ri-language-change", onChange);
      };
    }, []),
    React.useCallback(() => {
      const saved = window.localStorage.getItem("ri-language");
      return saved === "fa" || saved === "es" ? saved : "en";
    }, []),
    React.useCallback(() => "en" as Language, []),
  );

  React.useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = React.useCallback((next: Language) => {
    window.localStorage.setItem("ri-language", next);
    window.dispatchEvent(new Event("ri-language-change"));
  }, []);

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
    if (next !== language) recordSiteAction(`language_${next}`);
    setLanguage(next);
    const nextRoute = languageRoutes?.[next];
    if (nextRoute) window.location.assign(nextRoute);
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
