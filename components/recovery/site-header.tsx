"use client";

import { localizedPath } from "@/lib/languages";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

import * as React from "react";
import type { Language } from "@/lib/inventory";
import { ThemePicker } from "./theme-picker";
import { BrandMark } from "./brand-mark";
import { aboutLanguageRoutes } from "@/lib/about-content";
import {
  LanguageToggle,
  type LanguageRouteMap,
  translateForLanguage,
  useLanguage,
} from "./language-provider";

export function SiteHeader({
  transparent = false,
  language: languageOverride,
  languageRoutes,
}: {
  transparent?: boolean;
  language?: Language;
  languageRoutes?: LanguageRouteMap;
}) {
  const { language: contextLanguage, setLanguage, t: contextTranslate } = useLanguage();
  const language = languageOverride ?? contextLanguage;
  const t = languageOverride
    ? (english: string, farsi: string) => translateForLanguage(language, english, farsi)
    : contextTranslate;
  const learnHref = localizedPath(language, "/learn");

  React.useEffect(() => {
    if (languageOverride && contextLanguage !== languageOverride) void setLanguage(languageOverride).catch(() => {});
  }, [contextLanguage, languageOverride, setLanguage]);

  return (
    <header className={`site-header${transparent ? " is-transparent" : ""}`}>
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label={t("Primary navigation", "ناوبری اصلی")}>
          <a href="/demo">{t("Demo", "نسخه آزمایشی")}</a>
          <a href={learnHref}>{t("Learn", "یادگیری")}</a>
          <a href="/#membership">{t("Pricing", "قیمت‌ها")}</a>
          <a href={aboutLanguageRoutes[language]}>{t("About", "درباره ما")}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle languageOverride={languageOverride} languageRoutes={languageRoutes} />
          <ThemePicker language={language} />
          <a href="/recover" className="button button-small button-outline header-login">
            {t("Log in", "ورود")}
          </a>
        </div>
      </div>
    </header>
  );
}
