"use client";

import { BrandMark } from "./brand-mark";
import { useLanguage } from "./language-provider";

export function SiteFooter() {
  const { t } = useLanguage();
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
          <a href="/join">{t("Membership", "عضویت")}</a>
          <a href="/privacy">{t("Privacy", "حریم خصوصی")}</a>
          <a href="/terms">{t("Terms", "شرایط استفاده")}</a>
        </div>
      </div>
      <div className="footer-legal">
        <p>
          {t(
            "Recovery Inventory is an independent tool and is not affiliated with or endorsed by Alcoholics Anonymous, Narcotics Anonymous, AAWS, or NAWS. It is not a substitute for professional care.",
            "Recovery Inventory ابزاری مستقل است و وابسته یا مورد تأیید انجمن الکلی‌های گمنام، معتادان گمنام، AAWS یا NAWS نیست. این ابزار جایگزین مراقبت حرفه‌ای نیست."
          )}
        </p>
        <span>© {new Date().getFullYear()} RecoveryInventory.com</span>
      </div>
    </footer>
  );
}
