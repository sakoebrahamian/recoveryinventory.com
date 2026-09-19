"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

import * as React from "react";
import type { Language } from "@/lib/inventory";
import { BrandMark } from "./brand-mark";
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
  const learnHref = language === "es" ? "/es/learn" : language === "fa" ? "/fa/learn" : "/learn";

  React.useEffect(() => {
    if (languageOverride && contextLanguage !== languageOverride) setLanguage(languageOverride);
  }, [contextLanguage, languageOverride, setLanguage]);

  return (
    <header className={`site-header${transparent ? " is-transparent" : ""}`}>
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label={t("Primary navigation", "ناوبری اصلی")}>
          <a href="/demo">{t("Try the demo", "مشاهده نسخه آزمایشی")}</a>
          <a href={learnHref}>{t("Learn", "یادگیری")}</a>
          <a href="/#inventories">{t("Inventories", "ترازنامه‌ها")}</a>
          <a href="/#membership">{t("Membership", "عضویت")}</a>
          <a href="/privacy">{t("Privacy", "حریم خصوصی")}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle languageOverride={languageOverride} languageRoutes={languageRoutes} />
          <a href="/recover" className="button button-small button-outline header-login">
            {t("Log in", "ورود")}
          </a>
          <a href="/join" className="button button-small button-primary header-join">
            {t("Create account", "ایجاد حساب")}
          </a>
        </div>
      </div>
    </header>
  );
}
