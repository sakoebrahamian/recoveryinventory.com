"use client";

import * as React from "react";
import type { Language } from "@/lib/inventory";
import { languages, languageNames, supportedLanguage, isRtlLanguage } from "@/lib/languages";
import { loadTranslations, installTranslations, translateForLanguage, type TranslationDictionary } from "@/lib/localization";
export { translateForLanguage } from "@/lib/localization";
import { recordSiteAction } from "@/lib/site-analytics";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  loading: boolean;
  ready: boolean;
  languageError: boolean;
  t: (english: string, farsi: string) => string;
};

export type LanguageRouteMap = Partial<Record<Language, string>>;

const languagePreferenceKey = "ri-language";

function readStoredLanguage(): Language | null {
  try {
    return supportedLanguage(window.localStorage.getItem(languagePreferenceKey));
  } catch {
    return null;
  }
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setCurrentLanguage] = React.useState<Language>("en");

  const [ready, setReady] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [languageError, setLanguageError] = React.useState(false);
  const request = React.useRef(0);
  const setLanguage = React.useCallback(async (next: Language) => {
    const currentRequest = ++request.current;
    setLoading(true);
    setLanguageError(false);
    try { await loadTranslations(next); }
    catch (error) {
      if (request.current === currentRequest) { setLoading(false); setLanguageError(true); }
      throw error;
    }
    if (request.current !== currentRequest) return;
    setCurrentLanguage(next);
    setReady(true);
    setLoading(false);
    try {
      window.localStorage.setItem(languagePreferenceKey, next);
    } catch {
      // The active page still supports language changes when storage is unavailable.
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const { pathname, search } = window.location;
      const requested = supportedLanguage(pathname.split("/")[1]) ?? supportedLanguage(new URLSearchParams(search).get("lang"));

      if (requested) void setLanguage(requested).catch(() => {});
      else {
        const stored = readStoredLanguage();
        if (stored) void setLanguage(stored).catch(() => {});
        else setReady(true);
      }
    }, 0);

    function syncStoredLanguage(event: StorageEvent) {
      if (event.key === languagePreferenceKey || event.key === null) {
        void setLanguage(readStoredLanguage() ?? "en").catch(() => {});
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
    document.documentElement.dir = isRtlLanguage(language) ? "rtl" : "ltr";
  }, [language]);

  const t = React.useCallback((english: string, farsi: string) => translateForLanguage(language, english, farsi), [language]);
  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      loading,
      ready,
      languageError,
      t,
    }),
    [language, setLanguage, loading, languageError, ready, t]
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
  const { language: contextLanguage, setLanguage, loading, languageError, ready } = useLanguage();
  const language = languageOverride ?? contextLanguage;

  const chooseLanguage = async (next: Language) => {
    try { await setLanguage(next); } catch { return; }
    const nextRoute = languageRoutes?.[next];
    if (nextRoute) window.location.assign(nextRoute);
    if (next !== language) recordSiteAction(`language_${next}`);
  };

  return (
    <label className={`language-toggle${compact ? " is-compact" : ""}`}>
      <select
        value={language}
        onChange={(event) => { void chooseLanguage(event.target.value as Language); }}
        disabled={loading || !ready}
        aria-busy={loading || !ready}
        aria-label={translateForLanguage(language, "Choose language", "انتخاب زبان")}
      >
        {languages.map((value) => <option key={value} value={value} lang={value}>{languageNames[value]}</option>)}
      </select>
      {languageError && <small role="alert">{translateForLanguage(language, "Something went wrong. Please try again.", "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.")}</small>}
    </label>
  );
}


/** Server-localized public pages hydrate with only their own dictionary. */
export function LocaleBoundary({ language, dictionary, children }: { language: Language; dictionary: TranslationDictionary; children: React.ReactNode }) {
  installTranslations(language, dictionary);
  const parent = useLanguage();
  React.useEffect(() => { void parent.setLanguage(language).catch(() => {}); }, [language, parent.setLanguage]);
  const value = { ...parent, language, ready: true, t: (english: string, farsi: string) => translateForLanguage(language, english, farsi) };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
