"use client";

import { localizedPath } from "@/lib/languages";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

import * as React from "react";
import type { Language } from "@/lib/inventory";
import { LanguageAvailability } from "./language-availability";
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
          <a href="/demo">{t("Try the demo", "مشاهده نسخه آزمایشی")}</a>
          <a href={learnHref}>{t("Learn", "یادگیری")}</a>
          <a href={aboutLanguageRoutes[language]}>{t("Why I built this", "چرا این سایت را ساختم")}</a>
          <a href="/#inventories">{t("Inventories", "ترازنامه‌ها")}</a>
          <a href="/#ai-guide">{t("AI Guide", "راهنمای هوش مصنوعی")}</a>
          <a href="/#membership">{t("Subscription", "اشتراک")}</a>
          <a href="/privacy">{t("Privacy", "حریم خصوصی")}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle languageOverride={languageOverride} languageRoutes={languageRoutes} />
          <ThemePicker language={language} />
          <a href="/recover" className="button button-small button-outline header-login">
            {t("Log in", "ورود")}
          </a>
          <a href="/join" className="button button-small button-primary header-join">
            {t("Create account", "ایجاد حساب")}
          </a>
        </div>
      </div>
      <LanguageAvailability language={language} />
    </header>
  );
}
