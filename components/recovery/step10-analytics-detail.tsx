"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { formatDisplayDate, principles, step10Questions, principleQuestion, type Language } from "@/lib/inventory";
import { reflectionFields, type Step10AnalyticsData, type ReflectionField } from "@/lib/step10-analytics";
import { answerForDay, countQuestionDays, questionIdsForPrinciples, reflectionEntries, step10Trends } from "@/lib/step10-detail";
import { formatStep10FocusedReport, step10ReflectionLabel } from "@/lib/step10-report";
import type { ReportBounds } from "@/lib/step10-report-period";
import { useLanguage } from "./language-provider";

type Translate = (english: string, farsi: string) => string;

function stateLabel(state: string, t: Translate) {
  return state === "practiced" ? t("Practiced", "تمرین کردم") : state === "attention" ? t("Needs attention", "نیازمند توجه") : state === "na" ? t("Didn’t come up today", "امروز پیش نیامد") : state === "not-included" ? t("Question not included in this older inventory", "این پرسش در ترازنامه قدیمی وجود نداشت") : t("Not answered", "پاسخ داده نشده");
}

function dateRange(bounds: { from: string; through: string }, language: Language) {
  return bounds.from === bounds.through ? formatDisplayDate(bounds.from, language) : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`;
}

export function Step10PeriodComparison({ analytics, bounds }: { analytics: Step10AnalyticsData; bounds: ReportBounds }) {
  const { language, t } = useLanguage();
  const previous = analytics.comparison;
  const rate = analytics.totalAnswered ? analytics.practiceRate : null;
  const change = rate !== null && previous?.practiceRate !== null && previous?.practiceRate !== undefined ? rate - previous.practiceRate : null;
  return <section className="analytics-comparison analytics-panel">
    <h3>{t("Compared with the previous period", "مقایسه با بازه پیشین")}</h3>
    <p>{t("Calendar weeks, months, and years compare with the previous calendar period. An unfinished period compares with the same portion of the previous period. Custom ranges compare with the preceding range of equal length.", "هفته‌ها، ماه‌ها و سال‌های تقویمی با بازه تقویمی پیشین مقایسه می‌شوند. بازه ناتمام با همان بخش از بازه پیشین مقایسه می‌شود. بازه دلخواه با بازه قبلیِ هم‌اندازه مقایسه می‌شود.")}</p>
    <div className="analytics-comparison-grid">
      <article><h4>{t("Selected period", "بازه انتخاب‌شده")}</h4><time>{dateRange(bounds, language)}</time><strong>{rate === null ? "—" : `${rate}%`}</strong><span>{analytics.totalPracticed}/{analytics.totalAnswered} {t("answers marked Practiced", "پاسخ با برچسب تمرین کردم")}</span><small>{analytics.totalEntries} {t("saved days", "روز ذخیره‌شده")}</small></article>
      <article><h4>{t("Previous period", "بازه پیشین")}</h4><time>{previous ? dateRange(previous.bounds, language) : "—"}</time><strong>{previous?.practiceRate === null || previous?.practiceRate === undefined ? "—" : `${previous.practiceRate}%`}</strong><span>{previous?.totalPracticed ?? 0}/{previous?.totalAnswered ?? 0} {t("answers marked Practiced", "پاسخ با برچسب تمرین کردم")}</span><small>{previous?.totalEntries ?? 0} {t("saved days", "روز ذخیره‌شده")}</small></article>
      <article><h4>{t("Change in recorded answers", "تغییر پاسخ‌های ثبت‌شده")}</h4><strong>{change === null ? "—" : `${change > 0 ? "+" : ""}${change}`}</strong><span>{change === null ? t("Not enough answered questions to compare", "پرسش‌های پاسخ‌داده‌شده برای مقایسه کافی نیست") : t("percentage points", "واحد درصد")}</span></article>
    </div>
    <p>{t("Percentages use Practiced and Needs attention answers only. Days without an inventory, unanswered questions, and Didn’t come up today are excluded. Recorded days and question availability can differ; this is not a recovery grade.", "درصدها فقط از پاسخ‌های «تمرین کردم» و «نیازمند توجه» محاسبه می‌شوند. روزهای بدون ترازنامه، پاسخ‌های خالی و «امروز پیش نیامد» کنار گذاشته می‌شوند. تعداد روزهای ثبت‌شده و پرسش‌های موجود ممکن است متفاوت باشد؛ این نمره بهبودی نیست.")}</p>
    {(analytics.totalEntries < 3 || (previous?.totalEntries ?? 0) < 3) && <p className="analytics-data-note">{t("One or both periods have fewer than three saved days. Treat the comparison as a small sample, not a repeated pattern.", "یک یا هر دو بازه کمتر از سه روز ذخیره‌شده دارند. این مقایسه را نمونه‌ای کوچک بدانید، نه یک الگوی تکرارشونده.")}</p>}
  </section>;
}

const subscribe = () => () => undefined;

export function Step10AnalyticsDetail({ analytics, bounds, demo = false, onOpenDate }: {
  analytics: Step10AnalyticsData;
  bounds: ReportBounds;
  demo?: boolean;
  onOpenDate?: (date: string) => void;
}) {
  const { language, t } = useLanguage();
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState("");
  const [interval, setInterval] = React.useState<"week" | "month">("week");
  const [month, setMonth] = React.useState(bounds.from.slice(0, 7));
  const [selectedDay, setSelectedDay] = React.useState(analytics.days.at(-1)?.date ?? bounds.from);
  const [field, setField] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [visible, setVisible] = React.useState(20);
  const [selectedNotes, setSelectedNotes] = React.useState<string[]>([]);
  const [preview, setPreview] = React.useState(false);
  const [copyMessage, setCopyMessage] = React.useState("");
  const domReady = React.useSyncExternalStore(subscribe, () => true, () => false);
  const questions = questionIdsForPrinciples(chosen);
  const allWriting = React.useMemo(() => reflectionEntries(analytics), [analytics]);
  const writing = allWriting.filter((item) => (field === "all" || item.field === field) && (!query.trim() || item.text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) && (!item.questionId || questions.includes(item.questionId)));
  const trends = step10Trends(analytics.days, bounds, questions, interval);
  const report = formatStep10FocusedReport(analytics, bounds, chosen, selectedNotes, language, t, demo);
  const togglePrinciple = (id: string) => { setChosen((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); setPreview(false); };
  const toggleNote = (id: string) => { setSelectedNotes((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); setPreview(false); };
  const moveMonth = (offset: number) => { const value = new Date(`${month}-01T12:00:00Z`); value.setUTCMonth(value.getUTCMonth() + offset); setMonth(value.toISOString().slice(0, 7)); };
  const monthDate = new Date(`${month}-01T12:00:00Z`);
  const lastDay = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const firstWeekday = (monthDate.getUTCDay() + 6) % 7;
  const currentDay = analytics.days.find((item) => item.date === selectedDay);
  const dayAction = (date: string) => onOpenDate && <button type="button" className="button button-outline button-small" onClick={() => onOpenDate(date)}>{t("Open this inventory", "باز کردن این ترازنامه")}</button>;
  const locale = language === "fa" ? "fa-IR-u-ca-gregory" : language === "es" ? "es-US" : "en-US";

  async function copyReport() {
    try { await navigator.clipboard.writeText(report); setCopyMessage(t("Selected report copied.", "گزارش انتخاب‌شده کپی شد.")); }
    catch { setCopyMessage(t("Copy was unavailable. Select the preview text to copy it.", "کپی در دسترس نبود. متن پیش‌نمایش را برای کپی انتخاب کنید.")); }
  }
  function printReport() {
    const title = document.title;
    document.title = t("Focused sponsor report", "گزارش منتخب برای حامی");
    document.documentElement.classList.add("focused-export-page");
    const restore = () => { document.documentElement.classList.remove("focused-export-page"); document.title = title; };
    window.addEventListener("afterprint", restore, { once: true });
    try { window.print(); } catch { restore(); }
  }

  return <div className="analytics-deep-dive">
    <section className="analytics-panel">
      <h3>{t("Explore your principles", "بررسی اصول شما")}</h3>
      <p>{t("Choose principles to follow in the trend and detailed history. With none selected, all 24 are included. Main questions and follow-ups keep their own answers.", "اصول مورد نظر را برای بررسی روند و سابقه جزئی انتخاب کنید. اگر هیچ اصلی انتخاب نشود، هر ۲۴ اصل نمایش داده می‌شوند. پرسش‌های اصلی و تکمیلی پاسخ‌های جداگانه دارند.")}</p>
      <details className="analytics-principle-chooser"><summary>{t("Choose principles", "انتخاب اصول")} ({chosen.length || principles.length})</summary><fieldset><legend>{t("Principles to follow", "اصول مورد نظر")}</legend><div className="analytics-checkbox-grid">{principles.map((item) => <label key={item.id}><input type="checkbox" checked={chosen.includes(item.id)} onChange={() => togglePrinciple(item.id)} />{item[language]}</label>)}</div><button type="button" className="button button-outline button-small" onClick={() => { setChosen([]); setPreview(false); }}>{t("Show all principles", "نمایش همه اصول")}</button></fieldset></details>
      <div className="analytics-filter-row"><label>{t("Group trend by", "گروه‌بندی روند بر اساس")}<select value={interval} onChange={(event) => setInterval(event.target.value as "week" | "month")}><option value="week">{t("Calendar week", "هفته تقویمی")}</option><option value="month">{t("Calendar month", "ماه تقویمی")}</option></select></label></div>
      <div className="analytics-table-scroll"><table className="analytics-data-table"><caption>{t("Trend for selected principles", "روند اصول انتخاب‌شده")}</caption><thead><tr><th>{t("Period", "بازه")}</th><th>{t("Saved days", "روزهای ذخیره‌شده")}</th><th>{t("Practiced", "تمرین کردم")}</th><th>{t("Needs attention", "نیازمند توجه")}</th><th>{t("Didn’t come up today", "امروز پیش نیامد")}</th><th>{t("Not answered", "پاسخ داده نشده")}</th><th>{t("Practiced share", "سهم تمرین‌شده")}</th></tr></thead><tbody>{trends.map((item) => <tr key={item.from}><th scope="row">{dateRange(item, language)}</th><td>{item.savedDays}</td><td>{item.practiced}</td><td>{item.attention}</td><td>{item.na}</td><td>{item.unanswered}</td><td><span className="analytics-mini-bar" aria-hidden="true"><i style={{ width: `${item.rate ?? 0}%` }} /></span>{item.rate === null ? "—" : `${item.rate}%`} <small>({item.practiced}/{item.answered})</small></td></tr>)}</tbody></table></div>
      <p>{t("Counts are question answers, not numbers of principles or days. A dash means there were no Practiced or Needs attention answers.", "شمارش‌ها تعداد پاسخ‌های پرسش‌ها هستند، نه تعداد اصول یا روزها. خط تیره یعنی هیچ پاسخ «تمرین کردم» یا «نیازمند توجه» ثبت نشده است.")}</p>
      <div className="analytics-principle-details">{principles.filter((item) => !chosen.length || chosen.includes(item.id)).map((principle) => <details key={principle.id} open={expanded === principle.id} onToggle={(event) => { if (event.currentTarget.open) setExpanded(principle.id); else setExpanded((value) => value === principle.id ? "" : value); }}>
        <summary>{principle[language]} <span>{t("Questions, answers, and notes", "پرسش‌ها، پاسخ‌ها و یادداشت‌ها")}</span></summary>
        {expanded === principle.id && step10Questions.filter((item) => item.principleId === principle.id).map((question) => {
          const totals = countQuestionDays(analytics.days, [question.id]);
          const previous = analytics.comparison?.principles.find((item) => item.id === question.id);
          return <article className="analytics-question-history" key={question.id}>
            <h4>{question[language]}</h4>{question.followUp && <small>{t("Follow-up question", "پرسش تکمیلی")}</small>}
            <p>{totals.practiced}/{totals.answered} {t("answers marked Practiced", "پاسخ با برچسب تمرین کردم")} · {totals.attention} {t("Needs attention", "نیازمند توجه")} · {totals.na} {t("Didn’t come up today", "امروز پیش نیامد")} · {totals.unanswered} {t("Not answered", "پاسخ داده نشده")}</p>
            <p>{t("Previous period", "بازه پیشین")}: {previous?.answered ? `${previous.practiced}/${previous.answered} (${previous.practiceRate}%)` : "—"}</p>
            <details><summary>{t("View dated answers", "نمایش پاسخ‌های تاریخ‌دار")}</summary><ul className="analytics-answer-history">{[...analytics.days].reverse().map((day) => <li key={day.date}><time>{formatDisplayDate(day.date, language)}</time><span className={`analytics-answer-state is-${answerForDay(day, question.id)}`}>{stateLabel(answerForDay(day, question.id), t)}</span>{day.states[question.id] === "attention" && day.notes[question.id] && <blockquote dir="auto">{day.notes[question.id]}</blockquote>}{dayAction(day.date)}</li>)}</ul></details>
          </article>;
        })}
      </details>)}</div>
    </section>

    <section className="analytics-panel">
      <h3>{t("Recorded-day calendar", "تقویم روزهای ثبت‌شده")}</h3><p>{t("A marked day has a saved inventory. An unmarked day means no inventory was saved, not a negative answer.", "روز علامت‌دار ترازنامه ذخیره‌شده دارد. روز بدون علامت یعنی ترازنامه‌ای ذخیره نشده، نه اینکه پاسخ منفی بوده است.")}</p>
      <div className="analytics-calendar-layout"><div><div className="analytics-calendar-heading"><button type="button" className="button button-outline button-small" disabled={month <= bounds.from.slice(0, 7)} onClick={() => moveMonth(-1)}>{t("Previous month", "ماه پیشین")}</button><strong>{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(monthDate)}</strong><button type="button" className="button button-outline button-small" disabled={month >= bounds.through.slice(0, 7)} onClick={() => moveMonth(1)}>{t("Next month", "ماه بعد")}</button></div>
        <div className="analytics-calendar-weekdays">{Array.from({ length: 7 }, (_, index) => <span key={index}>{new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 9, 19 + index)))}</span>)}</div>
        <div className="analytics-calendar-grid">{Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: lastDay }, (_, index) => {
          const date = `${month}-${String(index + 1).padStart(2, "0")}`;
          const saved = analytics.days.some((item) => item.date === date);
          return <button type="button" key={date} disabled={date < bounds.from || date > bounds.through} aria-pressed={selectedDay === date} className={`${saved ? "has-inventory" : ""}${selectedDay === date ? " is-selected" : ""}`} aria-label={`${formatDisplayDate(date, language)}: ${saved ? t("Saved inventory", "ترازنامه ذخیره‌شده") : t("No saved inventory", "بدون ترازنامه ذخیره‌شده")}`} onClick={() => setSelectedDay(date)}>{index + 1}{saved && <span aria-hidden="true">●</span>}</button>;
        })}</div></div>
        <article className="analytics-calendar-day"><h4>{formatDisplayDate(selectedDay, language)}</h4>{currentDay ? <><p>{t("Saved inventory", "ترازنامه ذخیره‌شده")}</p>{dayAction(selectedDay)}<dl>{(["practiced", "attention", "na", "unanswered"] as const).map((state) => <div key={state}><dt>{stateLabel(state, t)}</dt><dd>{currentDay.questionIds.filter((id) => answerForDay(currentDay, id) === state).length}</dd></div>)}</dl></> : <p>{t("No saved inventory", "بدون ترازنامه ذخیره‌شده")}</p>}</article>
      </div>
    </section>

    <section className="analytics-panel">
      <h3>{t("Your reflection history", "سابقه نوشته‌های شما")}</h3><p>{t("Browse your own saved words within the selected dates. Select individual notes below to include in your focused sponsor report. Nothing is selected automatically.", "نوشته‌های ذخیره‌شده خود را در تاریخ‌های انتخاب‌شده مرور کنید. یادداشت‌های دلخواه را برای گزارش منتخب حامی انتخاب کنید. هیچ یادداشتی خودکار انتخاب نمی‌شود.")}</p>
      <div className="analytics-filter-row"><label>{t("Reflection type", "نوع نوشته")}<select value={field} onChange={(event) => { setField(event.target.value); setVisible(20); }}><option value="all">{t("All reflections and notes", "همه نوشته‌ها و یادداشت‌ها")}</option>{reflectionFields.map((key) => <option key={key} value={key}>{step10ReflectionLabel(key, t)}</option>)}<option value="note">{t("Question notes", "یادداشت‌های پرسش‌ها")}</option></select></label><label>{t("Search your writing", "جست‌وجو در نوشته‌ها")}<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(20); }} /></label></div>
      <p aria-live="polite">{writing.length} {t("matching notes", "یادداشت منطبق")}</p><div className="analytics-reflection-history">{writing.slice(0, visible).map((item) => <article key={item.id}><time>{formatDisplayDate(item.date, language)}</time><h4>{item.questionId ? principleQuestion(item.questionId, language) : step10ReflectionLabel(item.field as ReflectionField, t)}</h4><blockquote dir="auto">{item.text}</blockquote><div className="analytics-note-actions"><label><input type="checkbox" checked={selectedNotes.includes(item.id)} onChange={() => toggleNote(item.id)} />{t("Include this note in report", "افزودن این یادداشت به گزارش")}</label>{dayAction(item.date)}</div></article>)}</div>
      {!writing.length && <p>{t("No saved writing matches these filters.", "هیچ نوشته ذخیره‌شده‌ای با این فیلترها منطبق نیست.")}</p>}{writing.length > visible && <button type="button" className="button button-outline" onClick={() => setVisible((value) => value + 20)}>{t("Show more notes", "نمایش یادداشت‌های بیشتر")}</button>}
    </section>

    <section className="analytics-panel analytics-focused-report"><h3>{t("Focused sponsor report", "گزارش منتخب برای حامی")}</h3><p>{t("Includes the selected dates, comparisons for your chosen principles, and only the notes you select. Preview it before copying or saving a PDF. No individual inventory pages are included.", "شامل تاریخ‌های انتخاب‌شده، مقایسه اصول مورد نظر و فقط یادداشت‌هایی است که انتخاب می‌کنید. پیش از کپی یا ذخیره PDF آن را بررسی کنید. صفحه‌های ترازنامه روزانه در این گزارش نیستند.")}</p><p>{chosen.length || principles.length} {t("principles included", "اصل در گزارش")} · {selectedNotes.length} {t("notes selected", "یادداشت انتخاب‌شده")}</p><button type="button" className="button button-primary" disabled={!analytics.totalEntries} onClick={() => setPreview(true)}>{t("Preview selected report", "پیش‌نمایش گزارش منتخب")}</button>{preview && <><label className="analytics-report-text">{t("Report preview", "پیش‌نمایش گزارش")}<textarea readOnly value={report} rows={16} dir="auto" /></label><div className="analytics-report-actions"><button type="button" className="button button-outline" onClick={() => void copyReport()}>{t("Copy selected report", "کپی گزارش منتخب")}</button><button type="button" className="button button-outline" onClick={printReport}>{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button></div><p role="status">{copyMessage}</p></>}
    </section>
    {domReady && createPortal(<div className="focused-print-root" dir={language === "fa" ? "rtl" : "ltr"} lang={language}><pre>{report}</pre></div>, document.body)}
  </div>;
}
