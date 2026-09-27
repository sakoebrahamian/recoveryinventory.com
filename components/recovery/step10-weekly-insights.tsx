"use client";

import { formatDisplayDate, principles } from "@/lib/inventory";
import type { Step10AnalyticsData, WrittenExcerpt, WrittenWeek } from "@/lib/step10-analytics";
import { practiceForPrinciple } from "@/lib/step10-practices";
import { useLanguage } from "./language-provider";

export function Step10WeeklyInsights({ analytics, print = false }: { analytics: Step10AnalyticsData; print?: boolean }) {
  const { language, t } = useLanguage();
  const name = (id: string) => principles.find((item) => item.id === id)?.[language] ?? id;
  const sample = (label: string, item: WrittenExcerpt | null, principleId?: string) => item && (
    <div className="analytics-weekly-sample">
      <strong>{label}{principleId ? ` · ${name(principleId)}` : ""}</strong>
      <time>{formatDisplayDate(item.date, language)}</time>
      <blockquote dir="auto">{item.text}</blockquote>
    </div>
  );
  const top = (items: WrittenWeek["strengths"]) => items.length
    ? items.map(({ id, count }) => `${name(id)} (${count})`).join(", ")
    : t("None marked", "هیچ موردی ثبت نشده");

  return (
    <section className={`analytics-weekly${print ? " analytics-weekly-print inventory-print-analytics-block" : ""}`}>
      <h3>{t("Recent weekly writing", "نوشته‌های هفتگی اخیر")}</h3>
      <p>{t("Last four calendar weeks (Monday–Sunday), including this week. Weeks without saved entries are omitted. These are selected examples in your own words, not an interpretation or a full transcript.", "چهار هفته تقویمی اخیر (دوشنبه تا یکشنبه)، شامل این هفته. هفته‌های بدون نوشته ذخیره‌شده نمایش داده نمی‌شوند. این‌ها نمونه‌هایی از نوشته‌های خودتان هستند، نه تفسیر یا رونویسی کامل.")}</p>
      {analytics.weekly.length ? <div className="analytics-weekly-list">{analytics.weekly.map((week) => {
        const guide = week.focus[0] ? practiceForPrinciple(week.focus[0].id, language) : null;
        return <article key={week.start} className="analytics-weekly-card">
          <h4>{formatDisplayDate(week.start, language)} – {formatDisplayDate(week.end, language)}</h4>
          <span>{week.entries} {t("saved days", "روز ذخیره‌شده")}</span>
          <p><strong>{t("Most marked Practiced", "بیشترین تمرین‌شده")}:</strong> {top(week.strengths)}</p>
          <p><strong>{t("Most marked Needs attention", "بیشترین نیازمند توجه")}:</strong> {top(week.focus)}</p>
          {sample(t("Example of what went well", "نمونه‌ای از آنچه خوب پیش رفت"), week.highlight)}
          {sample(t("Example of a concern", "نمونه‌ای از نگرانی"), week.concern, week.concern?.principleId)}
          {sample(t("Next action you wrote", "اقدام بعدی که نوشته‌اید"), week.nextAction)}
          {guide && <p><strong>{t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}:</strong> {guide.primary} + {guide.companion} — {guide.action}</p>}
        </article>;
      })}</div> : <p>{t("No saved entries in these four weeks.", "در این چهار هفته نوشته ذخیره‌شده‌ای وجود ندارد.")}</p>}
    </section>
  );
}
