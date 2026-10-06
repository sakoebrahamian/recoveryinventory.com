"use client";

import { principles, principleQuestion } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";
import { useLanguage } from "./language-provider";

export function Step10ReportChart({ analytics, bounds }: { analytics: Step10AnalyticsData; bounds: ReportBounds }) {
  const { language, t } = useLanguage();
  const daily = bounds.mode === "day" || bounds.mode === "today";
  const total = analytics.totalEntries * principles.length;
  const unanswered = Math.max(0, total - analytics.totalPracticed - analytics.totalAttention - analytics.totalNA);
  const groups = [
    { label: t("Practiced", "تمرین کردم"), count: analytics.totalPracticed, kind: "practiced" },
    { label: t("Needs attention", "نیازمند توجه"), count: analytics.totalAttention, kind: "attention" },
    { label: t("N/A", "کاربرد ندارد"), count: analytics.totalNA, kind: "na" },
    { label: t("Not answered", "پاسخ داده نشده"), count: unanswered, kind: "unanswered" },
  ] as const;
  return (
    <section className="step10-report-chart" aria-label={t("Visual summary by inventory question", "خلاصه تصویری بر اساس پرسش ترازنامه")}>
      <h3>{t("Daily questions at a glance", "پرسش‌های روزانه در یک نگاه")}</h3>
      {analytics.totalEntries === 0 ? <p>{t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد.")}</p> : <>
      <div className="step10-report-chart-total" role="img" aria-label={groups.map((group) => `${group.label}: ${group.count}`).join("; ")}>
        {groups.map((group) => group.count > 0 && <span key={group.kind} className={`is-${group.kind}`} style={{ width: `${total ? group.count / total * 100 : 0}%` }} />)}
      </div>
      <div className="step10-report-chart-legend">{groups.map((group) => <span key={group.kind} className={`is-${group.kind}`}>{group.label} <strong>{group.count}</strong></span>)}</div>
      <p>{daily
        ? t("One day shows the recorded choice for each question. It is not a trend.", "یک روز انتخاب ثبت‌شده هر پرسش را نشان می‌دهد، نه یک روند را.")
        : t("Each bar shows Practiced, Needs attention, N/A, and unanswered across saved days. N/A and unanswered do not affect the Practiced percentage.", "هر نوار «تمرین کردم»، «نیازمند توجه»، «کاربرد ندارد» و پاسخ‌های خالی را در روزهای ذخیره‌شده نشان می‌دهد. «کاربرد ندارد» و پاسخ‌های خالی بر درصد «تمرین کردم» تأثیری ندارند.")}</p>
      <div className="step10-report-chart-rows">
        {analytics.principles.map((item) => {
          const name = principleQuestion(item.id, language);
          const state = item.practiced ? "practiced" : item.attention ? "attention" : item.na ? "na" : "unanswered";
          return <div className={`step10-report-chart-row${daily ? " is-daily" : ""}`} key={item.id}>
            <strong>{name}</strong>
            <div className="step10-report-chart-bar" role="img" aria-label={daily
              ? `${name}: ${groups.find((group) => group.kind === state)?.label}`
              : `${name}: ${item.practiced} ${t("Practiced", "تمرین کردم")}, ${item.attention} ${t("Needs attention", "نیازمند توجه")}, ${item.na} ${t("N/A", "کاربرد ندارد")}, ${item.unanswered} ${t("Not answered", "پاسخ داده نشده")}`}>
              {groups.map((group) => {
                const count = item[group.kind];
                return count > 0 && <span key={group.kind} className={`is-${group.kind}`} style={{ width: `${count / analytics.totalEntries * 100}%` }} />;
              })}
            </div>
            {daily
              ? <span className={`step10-report-chart-state is-${state}`}>{groups.find((group) => group.kind === state)?.label}</span>
              : <span className="step10-report-chart-count">{item.practiced}/{item.answered} {t("Practiced", "تمرین کردم")}{item.na ? ` · ${item.na} ${t("N/A", "کاربرد ندارد")}` : ""}</span>}
          </div>;
        })}
      </div>
      </>}
    </section>
  );
}
