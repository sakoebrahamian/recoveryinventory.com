"use client";

import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { LanguageToggle, useLanguage } from "./language-provider";

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const { t } = useLanguage();

  return (
    <header className={`site-header${transparent ? " is-transparent" : ""}`}>
      <div className="site-header-inner">
        <BrandMark />
        <nav className="desktop-nav" aria-label={t("Primary navigation", "ناوبری اصلی")}>
          <Link href="/demo">{t("Try the demo", "مشاهده نسخه آزمایشی")}</Link>
          <Link href="/#membership">{t("Membership", "عضویت")}</Link>
          <Link href="/privacy">{t("Privacy", "حریم خصوصی")}</Link>
        </nav>
        <div className="header-actions">
          <LanguageToggle compact />
          <Link href="/join" className="button button-small button-primary">
            {t("Join anonymously", "عضویت ناشناس")}
          </Link>
        </div>
      </div>
    </header>
  );
}
