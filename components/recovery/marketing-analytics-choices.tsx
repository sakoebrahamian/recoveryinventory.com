"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MARKETING_CHOICE_EVENT, MARKETING_CHOICE_KEY, browserRequestsPrivacy, marketingChoice, marketingPath, readMarketingChoice, type MarketingChoice } from "@/lib/heycatch-policy";
import { useLanguage } from "./language-provider";

function useMarketingChoice() {
  const pathname = usePathname();
  const [choice, setChoice] = React.useState<MarketingChoice | null>(null);
  const [ready, setReady] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  React.useEffect(() => {
    let stored: MarketingChoice | null = null;
    try { stored = readMarketingChoice(window.localStorage); } catch { /* Optional storage. */ }
    setChoice(stored); setBlocked(browserRequestsPrivacy(window)); setReady(true);
    window.dispatchEvent(new CustomEvent(MARKETING_CHOICE_EVENT, { detail: stored }));
    function changed(event: Event) {
      if (event instanceof StorageEvent) {
        if (event.key !== MARKETING_CHOICE_KEY && event.key !== null) return;
        setChoice(marketingChoice(event.newValue));
      } else setChoice(marketingChoice((event as CustomEvent).detail));
      setBlocked(browserRequestsPrivacy(window));
    }
    window.addEventListener(MARKETING_CHOICE_EVENT, changed);
    window.addEventListener("storage", changed);
    return () => { window.removeEventListener(MARKETING_CHOICE_EVENT, changed); window.removeEventListener("storage", changed); };
  }, [pathname]);
  function choose(next: MarketingChoice) {
    setChoice(next);
    try { window.localStorage.setItem(MARKETING_CHOICE_KEY, next); } catch { /* Choice still applies on this page. */ }
    window.dispatchEvent(new CustomEvent(MARKETING_CHOICE_EVENT, { detail: next }));
  }
  return { choice, ready, blocked, choose, pathname };
}

export function MarketingAnalyticsNotice() {
  const { t } = useLanguage();
  const { choice, ready, blocked, choose, pathname } = useMarketingChoice();
  if (!ready || blocked || choice !== null || !pathname || !marketingPath(pathname) || pathname === "/privacy") return null;
  return <aside className="marketing-analytics-notice" aria-label={t("Optional website analytics", "آمار اختیاری وب‌سایت")}>
    <strong>{t("Optional website analytics", "آمار اختیاری وب‌سایت")}</strong>
    <p>{t("Allow HeyCatch to measure public-page visits and clicks using random browser identifiers? Private journals, account forms and AI conversations are excluded.", "آیا اجازه می‌دهید HeyCatch بازدید و کلیک صفحه‌های عمومی را با شناسه‌های تصادفی مرورگر بررسی کند؟ دفترهای خصوصی، فرم‌های حساب و گفت‌وگوهای هوش مصنوعی شامل نمی‌شوند.")}</p>
    <div><button className="button button-primary button-small" type="button" onClick={() => choose("allowed")}>{t("Allow analytics", "اجازه آمارگیری")}</button><button className="button button-outline button-small" type="button" onClick={() => choose("declined")}>{t("No thanks", "نه، ممنون")}</button><a href="/privacy#analytics-choices">{t("Analytics choices", "انتخاب‌های آمارگیری")}</a></div>
  </aside>;
}

export function MarketingAnalyticsChoices() {
  const { t } = useLanguage();
  const { choice, ready, blocked, choose } = useMarketingChoice();
  return <div className="marketing-analytics-settings">
    <p>{t("Your choice applies in this browser. You can change it here at any time.", "انتخاب شما در این مرورگر اعمال می‌شود. هر زمان می‌توانید آن را اینجا تغییر دهید.")}</p>
    <p role="status">{blocked ? t("Analytics are off because your browser requests privacy.", "آمارگیری خاموش است زیرا مرورگر شما حفظ حریم خصوصی را درخواست کرده است.") : choice === "allowed" ? t("Optional analytics: on", "آمار اختیاری: روشن") : t("Optional analytics: off", "آمار اختیاری: خاموش")}</p>
    <div><button className="button button-primary" type="button" disabled={!ready || blocked || choice === "allowed"} onClick={() => choose("allowed")}>{t("Allow analytics", "اجازه آمارگیری")}</button><button className="button button-outline" type="button" disabled={!ready || choice === "declined"} onClick={() => choose("declined")}>{t("Turn off analytics", "خاموش کردن آمارگیری")}</button></div>
  </div>;
}
