"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

import { BrandMark } from "./brand-mark";
import { LanguageToggle, useLanguage } from "./language-provider";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { t } = useLanguage();

  return (
    <header className={`site-header${transparent ? " is-transparent" : ""}`}>
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label={t("Primary navigation", "ناوبری اصلی")}>
          <a href="/demo">{t("Try the demo", "مشاهده نسخه آزمایشی")}</a>
          <a href="/#inventories">{t("Inventories", "ترازنامه‌ها")}</a>
          <a href="/#membership">{t("Membership", "عضویت")}</a>
          <a href="/privacy">{t("Privacy", "حریم خصوصی")}</a>
        </nav>
        <div className="header-actions">
          <LanguageToggle compact />
          <a href="/recover" className="button button-small button-outline header-login">
            {t("Member login", "ورود اعضا")}
          </a>
          <a href="/join" className="button button-small button-primary header-join">
            {t("Join anonymously", "عضویت ناشناس")}
          </a>
        </div>
      </div>
    </header>
  );
}
