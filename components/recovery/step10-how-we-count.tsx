"use client";

import type * as React from "react";
import { Info } from "lucide-react";
import { useLanguage } from "./language-provider";

export const howWeCountId = "analytics-how-we-count";

/** Opens the single "How we count" panel and moves to it, instead of repeating the rules in every section. */
export function HowWeCountLink() {
  const { t } = useLanguage();
  function open(event: React.MouseEvent<HTMLAnchorElement>) {
    const panel = document.getElementById(howWeCountId);
    if (!(panel instanceof HTMLDetailsElement)) return;
    event.preventDefault();
    panel.open = true;
    panel.scrollIntoView({ block: "start" });
    panel.querySelector("summary")?.focus();
  }
  return <a className="how-we-count-link" href={`#${howWeCountId}`} onClick={open}>{t("How we count", "چگونه می‌شماریم")}</a>;
}

export function Step10HowWeCount() {
  const { t } = useLanguage();
  return <details id={howWeCountId} className="analytics-how-we-count">
    <summary><Info size={18} aria-hidden="true" />{t("How we count", "چگونه می‌شماریم")}</summary>
    <ul>
      <li>{t("Practiced share = Practiced answers ÷ (Practiced + Needs attention answers).", "سهم «تمرین کردم» = پاسخ‌های «تمرین کردم» ÷ (پاسخ‌های «تمرین کردم» + «نیازمند توجه»).")}</li>
      <li>{t("Didn’t come up today, unanswered questions, and days without a saved inventory are left out of every percentage.", "«امروز پیش نیامد»، پرسش‌های بی‌پاسخ و روزهای بدون ترازنامه ذخیره‌شده از همه درصدها کنار گذاشته می‌شوند.")}</li>
      <li>{t("Main questions and follow-up questions are counted separately, so one principle can have two answers on the same day.", "پرسش‌های اصلی و تکمیلی جداگانه شمرده می‌شوند، بنابراین یک اصل می‌تواند در یک روز دو پاسخ داشته باشد.")}</li>
      <li>{t("First half and second half split the selected dates into two equal parts. A question needs at least 3 answers in each half before it gets a trend label.", "نیمه اول و نیمه دوم، تاریخ‌های انتخاب‌شده را به دو بخش برابر تقسیم می‌کنند. هر پرسش پیش از گرفتن برچسب روند، در هر نیمه دست‌کم به ۳ پاسخ نیاز دارد.")}</li>
      <li>{t("The 7-day average combines the answers saved in the 7 days up to each date, and needs at least 3 saved days.", "میانگین ۷ روزه پاسخ‌های ذخیره‌شده در ۷ روز منتهی به هر تاریخ را با هم حساب می‌کند و دست‌کم به ۳ روز ذخیره‌شده نیاز دارد.")}</li>
      <li>{t("These counts describe your own answers. They are not a recovery grade or a diagnosis.", "این شمارش‌ها پاسخ‌های خود شما را توصیف می‌کنند. نمره بهبودی یا تشخیص نیستند.")}</li>
    </ul>
  </details>;
}
