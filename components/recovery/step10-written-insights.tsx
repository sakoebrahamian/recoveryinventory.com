"use client";

import { formatDisplayDate, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData, WrittenExcerpt } from "@/lib/step10-analytics";
import { step10ReflectionLabel, writtenFocusPrinciples } from "@/lib/step10-report";
import { practiceForPrinciple } from "@/lib/step10-practices";
import { useLanguage } from "./language-provider";

function Excerpts({ excerpts, language, t, showSelections = false }: {
  excerpts: WrittenExcerpt[];
  language: Language;
  t: (english: string, farsi: string) => string;
  showSelections?: boolean;
}) {
  if (!excerpts.length) return <p className="analytics-written-empty">{t("No written reflection saved yet.", "هنوز بازتابی نوشته و ذخیره نشده است.")}</p>;
  return <ul className="analytics-written-excerpts">{excerpts.map((item, index) => (
    <li key={`${item.date}-${index}`}>
      <time>{formatDisplayDate(item.date, language)}</time>
      <blockquote dir="auto">{item.text}</blockquote>
      {showSelections && item.attentionPrincipleIds.length > 0 && (
        <small>{t("Marked Needs attention that day", "اصولی که آن روز نیازمند توجه ثبت شدند")}: {item.attentionPrincipleIds.map((id) => practiceForPrinciple(id, language)?.primary ?? id).join(", ")}</small>
      )}
    </li>
  ))}</ul>;
}

export function Step10WrittenInsights({ analytics, print = false }: { analytics: Step10AnalyticsData; print?: boolean }) {
  const { language, t } = useLanguage();
  const focus = writtenFocusPrinciples(analytics);
  const written = analytics.written;
  const hasWriting = written.reflections.some((item) => item.count > 0) || written.principles.length > 0;

  return (
    <section className={`analytics-written${print ? " analytics-written-print inventory-print-analytics-block" : ""}`}>
      <h3>{t("What you wrote over time", "آنچه در طول زمان نوشته‌اید")}</h3>
      <p>{t("Counts cover all saved Step 10 entries through today. The dated words below are the two most recent excerpts for each field, not a full transcript. They stay in the language you wrote them.", "شمارش‌ها همه نوشته‌های ذخیره‌شده گام ۱۰ تا امروز را در بر می‌گیرند. متن‌های تاریخ‌دار زیر دو نمونه اخیر از هر بخش هستند، نه رونویسی کامل. زبان نوشته‌های شما حفظ می‌شود.")}</p>
      {!hasWriting && <p>{t("No written reflections have been saved yet. Add details to an inventory, save it, and return here.", "هنوز بازتاب نوشته‌شده‌ای ذخیره نشده است. جزئیات را به ترازنامه اضافه و ذخیره کنید و سپس به اینجا برگردید.")}</p>}
      <div className="analytics-written-reflections">
        {written.reflections.map((item) => (
          <article key={item.field} className="analytics-written-card">
            <h4>{step10ReflectionLabel(item.field, t)}</h4>
            <span>{item.count} {t("days with writing", "روز دارای نوشته")}</span>
            <Excerpts excerpts={item.excerpts} language={language} t={t} showSelections={item.field === "attention" || item.field === "patternAction" || item.field === "familyContext" || item.field === "amends"} />
          </article>
        ))}
      </div>
      <h3>{t("Principles to discuss and practice", "اصولی برای گفت‌وگو و تمرین")}</h3>
      <p>{t("The suggestions follow the principles you marked Needs attention. They are starting points to discuss with a sponsor, not interpretations of your words.", "این پیشنهادها بر اساس اصولی هستند که «نیازمند توجه» انتخاب کرده‌اید. آن‌ها نقطه شروع گفت‌وگو با حامی‌اند، نه تفسیر نوشته‌های شما.")}</p>
      {focus.length ? <div className="analytics-written-principles">{focus.map((item) => {
        const practice = practiceForPrinciple(item.id, language);
        const notes = written.principles.find((entry) => entry.id === item.id);
        return <article key={item.id} className="analytics-written-card analytics-written-focus">
          <h4>{practice?.primary ?? item.id}</h4>
          <span>{item.attention} {t("times marked Needs attention", "بار نیازمند توجه ثبت شده")} · {notes?.count ?? 0} {t("written explanations", "توضیح نوشته‌شده")}</span>
          {practice && <p><strong>{t("Principles to discuss", "اصولی برای گفت‌وگو")}:</strong> {practice.primary} + {practice.companion}<br /><strong>{t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}:</strong> {practice.action}</p>}
          {notes?.excerpts.length ? <Excerpts excerpts={notes.excerpts} language={language} t={t} /> : <p className="analytics-written-empty">{t("No written explanation saved for this principle yet.", "هنوز توضیحی برای این اصل ذخیره نشده است.")}</p>}
        </article>;
      })}</div> : <p>{t("No principles marked Needs attention yet.", "هنوز هیچ اصلی نیازمند توجه ثبت نشده است.")}</p>}
    </section>
  );
}
