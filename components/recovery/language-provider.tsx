"use client";

import * as React from "react";
import type { Language } from "@/lib/inventory";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (english: string, farsi: string) => string;
};

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
      return saved === "fa" ? "fa" : "en";
    }, []),
    React.useCallback(() => "en" as Language, []),
  );

  React.useEffect(() => {
    document.documentElement.lang = language === "fa" ? "fa" : "en";
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    window.localStorage.setItem("ri-language", language);
  }, [language]);

  const setLanguage = React.useCallback((next: Language) => {
    window.localStorage.setItem("ri-language", next);
    window.dispatchEvent(new Event("ri-language-change"));
  }, []);

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t: (english: string, farsi: string) =>
        language === "fa" ? farsi : english,
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

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const next = language === "en" ? "fa" : "en";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      className="language-toggle"
      aria-label={language === "en" ? "Switch to Farsi" : "تغییر زبان به انگلیسی"}
    >
      <span aria-hidden="true">{language === "en" ? "فا" : "EN"}</span>
      {!compact && (
        <span>{language === "en" ? "فارسی" : "English"}</span>
      )}
    </button>
  );
}
