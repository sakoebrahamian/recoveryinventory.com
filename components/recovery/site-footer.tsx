"use client";

import { localizedPath } from "@/lib/languages";

import type { Language } from "@/lib/inventory";
import { aboutLanguageRoutes } from "@/lib/about-content";
import { comparisonBasePath } from "@/lib/product-comparisons";
import { BrandMark } from "./brand-mark";
import { translateForLanguage, useLanguage } from "./language-provider";
import { independenceDisclosure, sponsorGuidance, originalFrameworkGuidance } from "@/lib/recovery-guidance";
import { reflectionText } from "@/lib/reflection-copy";
import { resourceSlug } from "@/lib/reflection-journals";

export function SiteFooter({ language: languageOverride }: { language?: Language }) {
  const { language: contextLanguage, t: contextTranslate } = useLanguage();
  const language = languageOverride ?? contextLanguage;
  const t = languageOverride
    ? (english: string, farsi: string) => translateForLanguage(language, english, farsi)
    : contextTranslate;
  const learnHref = localizedPath(language, "/learn");
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <BrandMark />
          <p className="footer-note">
            {t(
              "A private reflection tool for people practicing recovery principles.",
              "ابزاری خصوصی برای تأمل افرادی که اصول بهبودی را تمرین می‌کنند."
            )}
          </p>
        </div>
        <div className="footer-links">
          <a href="/demo">{t("Demo", "نسخه آزمایشی")}</a>
          <a href={learnHref}>{t("Learn", "یادگیری")}</a>
          <a href={localizedPath(language, "/learn/" + resourceSlug)}>{reflectionText(language, "fellowshipResources")}</a>
          <a href={aboutLanguageRoutes[language]}>{t("About", "درباره ما")}</a>
          <a href={comparisonBasePath(language)}>{t("Compare options", "مقایسه گزینه‌ها")}</a>
          <a href="/#ai-guide">{t("AI Inventory Guide", "راهنمای ترازنامه با هوش مصنوعی")}</a>
          <a href="/join">{t("Subscription", "اشتراک")}</a>
          <a href="/privacy">{t("Privacy", "حریم خصوصی")}</a>
          <a href="/privacy#analytics-choices">{t("Analytics choices", "انتخاب‌های آمارگیری")}</a>
          <a href="/terms">{t("Terms", "شرایط استفاده")}</a>
        </div>
      </div>
      <aside className="footer-guidance">
        <strong>{t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}</strong>
        <p>{sponsorGuidance(t)}</p>
        <p>{originalFrameworkGuidance(t)}</p>
      </aside>
      <div className="footer-legal">
        <p>{independenceDisclosure(t)}</p>
        <span>© {new Date().getFullYear()} RecoveryInventory.com</span>
      </div>
    </footer>
  );
}
