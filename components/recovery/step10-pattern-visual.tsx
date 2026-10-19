"use client";

import * as React from "react";
import { formatDisplayDate, principles, step10Questions, type Language } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";
import { buildStep10Patterns, type PatternCell, type PatternTone, type PrinciplePattern } from "@/lib/step10-patterns";
import { useLanguage } from "./language-provider";

type Translate = (en: string, fa: string) => string;
const symbols: Record<PatternTone, string> = { practiced: "+", attention: "!", mixed: "±", na: "–", unanswered: "?", "no-entry": "·", "not-included": "×" };
function toneLabel(tone: PatternTone, t: Translate) {
  const labels: Record<PatternTone, string> = {
    practiced: t("Practiced answers only", "فقط پاسخ‌های تمرین کردم"),
    attention: t("Needs attention answers only", "فقط پاسخ‌های نیازمند توجه"),
    mixed: t("Mixed Practiced and Needs attention", "ترکیب تمرین کردم و نیازمند توجه"),
    na: t("Didn’t come up today", "امروز پیش نیامد"),
    unanswered: t("Not answered", "پاسخ داده نشده"),
    "no-entry": t("No saved inventory", "بدون ترازنامه ذخیره‌شده"),
    "not-included": t("Question not included in this older inventory", "این پرسش در ترازنامه قدیمی وجود نداشت"),
  };
  return labels[tone];
}
function rangeLabel(cell: { from: string; through: string }, language: Language) {
  return cell.from === cell.through ? formatDisplayDate(cell.from, language) : `${formatDisplayDate(cell.from, language)} – ${formatDisplayDate(cell.through, language)}`;
}

export function Step10PatternVisual({ analytics, bounds, onOpenDate, print = false }: { analytics: Step10AnalyticsData; bounds: ReportBounds; onOpenDate?: (date: string) => void; print?: boolean }) {
  const { language, t } = useLanguage();
  const [view, setView] = React.useState<"overview" | "map">("overview");
  const [sort, setSort] = React.useState<"attention" | "practiced" | "principle">("attention");
  const [showAll, setShowAll] = React.useState(false);
  const [selected, setSelected] = React.useState<{ id: string; index: number } | null>(null);
  const data = React.useMemo(() => buildStep10Patterns(analytics, bounds), [analytics, bounds.from, bounds.through]);
  const bucketLabels = React.useMemo(() => data.buckets.map((bucket) => rangeLabel(bucket, language)), [data.buckets, language]);
  const headingDate = new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { ...(data.interval === "month" ? { year: "2-digit" as const } : { day: "numeric" as const }), month: "short", timeZone: "UTC" });
  const name = (id: string) => principles.find((item) => item.id === id)?.[language] ?? id;
  const ordered = [...data.rows].sort((a, b) => sort === "principle" ? name(a.id).localeCompare(name(b.id), language) : b[sort] - a[sort] || b.scoredDays - a.scoredDays || name(a.id).localeCompare(name(b.id), language));
  const selectedRow = selected ? data.rows.find((row) => row.id === selected.id) : undefined;
  const selectedCell = selectedRow && selected ? selectedRow.cells[selected.index] : undefined;
  const selectionTitle = (row: PrinciplePattern, cell: PatternCell, index: number) => `${name(row.id)} · ${bucketLabels[index]} · ${toneLabel(cell.tone, t)} · ${t("Practiced", "تمرین کردم")}: ${cell.practiced}, ${t("Needs attention", "نیازمند توجه")}: ${cell.attention}, ${t("Didn’t come up today", "امروز پیش نیامد")}: ${cell.na}, ${t("Not answered", "پاسخ داده نشده")}: ${cell.unanswered}`;
  const miniList = (rows: PrinciplePattern[], kind: "practiced" | "attention") => rows.length ? <ul>{rows.map((row) => <li key={row.id}><strong>{name(row.id)}</strong><span>{row[kind]}/{row.answered} {kind === "practiced" ? t("answers marked Practiced", "پاسخ با برچسب تمرین کردم") : t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»")}</span><small>{row.scoredDays} {t("days with answered questions", "روز دارای پرسش‌های پاسخ‌داده‌شده")}</small></li>)}</ul> : <p>{data.rows.some((row) => row.scoredDays >= 3) ? kind === "attention" ? t("No recurring Needs attention pattern in this period.", "در این بازه الگوی تکرارشونده‌ای از «نیازمند توجه» وجود ندارد.") : t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.") : t("More recorded days are needed to identify a repeated pattern.", "برای شناسایی الگوی تکرارشونده، روزهای ثبت‌شده بیشتری لازم است.")}</p>;
  function moveCell(event: React.KeyboardEvent<HTMLButtonElement>, id: string, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let row = data.rows.findIndex((item) => item.id === id);
    let column = index;
    if (event.key === "ArrowUp") row -= 1;
    if (event.key === "ArrowDown") row += 1;
    if (event.key === "ArrowLeft") column += language === "fa" ? 1 : -1;
    if (event.key === "ArrowRight") column += language === "fa" ? -1 : 1;
    if (event.key === "Home") column = 0;
    if (event.key === "End") column = data.buckets.length - 1;
    row = Math.max(0, Math.min(data.rows.length - 1, row));
    column = Math.max(0, Math.min(data.buckets.length - 1, column));
    setSelected({ id: data.rows[row].id, index: column });
    event.currentTarget.closest("table")?.querySelectorAll("tbody tr")[row]?.querySelectorAll("button")[column]?.focus();
  }
  const bars = <div className="pattern-principle-bars">{(showAll || print ? ordered : ordered.slice(0, 8)).map((row) => {
    const total = row.answered + row.na + row.unanswered;
    return <div className="pattern-principle-bar-row" key={row.id}>
      <strong>{name(row.id)}</strong><div className="pattern-stacked-bar" role="img" aria-label={`${name(row.id)}: ${row.practiced} ${t("Practiced", "تمرین کردم")}, ${row.attention} ${t("Needs attention", "نیازمند توجه")}, ${row.na} ${t("Didn’t come up today", "امروز پیش نیامد")}, ${row.unanswered} ${t("Not answered", "پاسخ داده نشده")}`}>
        {(["practiced", "attention", "na", "unanswered"] as const).map((kind) => row[kind] > 0 && <span key={kind} className={`pattern-tone-${kind}`} style={{ width: `${row[kind] / total * 100}%` }}>{row[kind]}</span>)}
      </div><small>{row.practiced}/{row.answered} {t("Practiced", "تمرین کردم")}{!row.answered && <span> · {t("No answered opportunities", "بدون فرصت پاسخ‌داده‌شده")}</span>}</small>
    </div>;
  })}</div>;
  const map = (view === "map" || print) ? <>
    <p>{data.interval === "day" ? t("Each square is one principle on one day. Look across a row for repeated colors. Select a square to inspect the actual answers.", "هر خانه یک اصل در یک روز است. تکرار رنگ‌ها را در هر ردیف ببینید. برای بررسی پاسخ‌های واقعی، یک خانه را انتخاب کنید.") : data.interval === "week" ? t("For longer ranges, each square groups one calendar week. Select a square to see its dates and answers.", "برای بازه‌های طولانی‌تر، هر خانه یک هفته تقویمی را نشان می‌دهد. برای دیدن تاریخ‌ها و پاسخ‌ها، یک خانه را انتخاب کنید.") : t("For ranges longer than a year, each square groups one calendar month. Select a square to see its dates and answers.", "برای بازه‌های طولانی‌تر از یک سال، هر خانه یک ماه تقویمی را نشان می‌دهد. برای دیدن تاریخ‌ها و پاسخ‌ها، یک خانه را انتخاب کنید.")}</p>
    {!print && <p className="pattern-method-note">{t("Keyboard: use arrow keys to move between squares; Home and End move to the first and last date.", "صفحه‌کلید: با کلیدهای جهت‌نما بین خانه‌ها حرکت کنید؛ Home و End به نخستین و آخرین تاریخ می‌روند.")}</p>}
    <div className="pattern-map-scroll" tabIndex={0} role="region" aria-label={t("Scrollable pattern map", "نقشه الگوهای قابل پیمایش")}><table className="pattern-map"><caption>{t("Patterns across the selected dates", "الگوها در تاریخ‌های انتخاب‌شده")}</caption><thead><tr><th>{t("Principle", "اصل")}</th>{data.buckets.map((bucket, index) => <th key={bucket.from} title={bucketLabels[index]}><span>{headingDate.format(new Date(`${bucket.from}T12:00:00Z`))}</span></th>)}</tr></thead><tbody>{data.rows.map((row) => <tr key={row.id}><th scope="row">{name(row.id)}</th>{row.cells.map((cell, index) => <td key={cell.from}>{print ? <span className={`pattern-square pattern-tone-${cell.tone}`} title={selectionTitle(row, cell, index)}>{symbols[cell.tone]}</span> : <button type="button" className={`pattern-square pattern-tone-${cell.tone}`} title={selectionTitle(row, cell, index)} aria-label={selectionTitle(row, cell, index)} aria-pressed={selected?.id === row.id && selected.index === index} tabIndex={selected ? selected.id === row.id && selected.index === index ? 0 : -1 : row.id === data.rows[0].id && index === 0 ? 0 : -1} onKeyDown={(event) => moveCell(event, row.id, index)} onClick={() => setSelected({ id: row.id, index })}>{symbols[cell.tone]}</button>}</td>)}</tr>)}</tbody></table></div>
    {!print && selectedCell && selectedRow && <article className="pattern-cell-detail" aria-live="polite"><h4>{name(selectedRow.id)} · {rangeLabel(selectedCell, language)}</h4><p>{toneLabel(selectedCell.tone, t)}</p><p>{t("Practiced", "تمرین کردم")}: {selectedCell.practiced} · {t("Needs attention", "نیازمند توجه")}: {selectedCell.attention} · {t("Didn’t come up today", "امروز پیش نیامد")}: {selectedCell.na} · {t("Not answered", "پاسخ داده نشده")}: {selectedCell.unanswered}</p>{analytics.days.filter((day) => day.date >= selectedCell.from && day.date <= selectedCell.through).map((day) => <div className="pattern-evidence-day" key={day.date}><strong>{formatDisplayDate(day.date, language)}</strong><ul>{step10Questions.filter((question) => question.principleId === selectedRow.id && day.questionIds.includes(question.id)).map((question) => <li key={question.id}><span>{question[language]}</span><strong>{day.states[question.id] === "practiced" ? t("Practiced", "تمرین کردم") : day.states[question.id] === "attention" ? t("Needs attention", "نیازمند توجه") : day.states[question.id] === "na" ? t("Didn’t come up today", "امروز پیش نیامد") : t("Not answered", "پاسخ داده نشده")}</strong>{day.states[question.id] === "attention" && day.notes[question.id] && <blockquote dir="auto">{day.notes[question.id]}</blockquote>}</li>)}</ul>{onOpenDate && <button type="button" className="button button-outline button-small" onClick={() => onOpenDate(day.date)}>{t("Open this inventory", "باز کردن این ترازنامه")}</button>}</div>)}</article>}
  </> : null;
  return <section className={`analytics-pattern-visual${print ? " pattern-visual-print" : ""}`} aria-label={t("Visual pattern overview", "نمای تصویری الگوها")}>
    <h3>{t("Your patterns at a glance", "الگوهای شما در یک نگاه")}</h3><p>{t("See what you practice consistently and where Needs attention repeats. These visuals use the same selected dates as your detailed information.", "ببینید چه اصولی را پیوسته تمرین می‌کنید و کجا «نیازمند توجه» تکرار می‌شود. این نمودارها از همان تاریخ‌های انتخاب‌شده در اطلاعات جزئی استفاده می‌کنند.")}</p>
    <div className="pattern-summary-grid"><article className="pattern-summary-strength"><h4>{t("Consistent practice", "تمرین پیوسته")}</h4>{miniList(data.strengths, "practiced")}</article><article className="pattern-summary-focus"><h4>{t("Recurring needs for attention", "نیازهای تکرارشونده به توجه")}</h4>{miniList(data.focus, "attention")}</article></div>
    <p className="pattern-method-note">{t("These lists require answers on at least three different saved days. Consistent practice means more Practiced answers; recurring attention means at least half were Needs attention. Main and follow-up questions count separately. This is not a recovery grade.", "این فهرست‌ها به پاسخ در دست‌کم سه روز ذخیره‌شده متفاوت نیاز دارند. تمرین پیوسته یعنی پاسخ‌های «تمرین کردم» بیشترند؛ توجه تکرارشونده یعنی دست‌کم نیمی از پاسخ‌ها «نیازمند توجه» هستند. پرسش‌های اصلی و تکمیلی جداگانه شمرده می‌شوند. این نمره بهبودی نیست.")}</p>
    {!print && <div className="pattern-view-tabs" role="tablist" aria-label={t("Choose a pattern view", "انتخاب نمای الگوها")}><button id="pattern-overview-tab" type="button" role="tab" aria-selected={view === "overview"} aria-controls="pattern-overview-panel" onClick={() => setView("overview")}>{t("Principle overview", "نمای کلی اصول")}</button><button id="pattern-map-tab" type="button" role="tab" aria-selected={view === "map"} aria-controls="pattern-map-panel" onClick={() => setView("map")}>{t("Pattern map", "نقشه الگوها")}</button></div>}
    <div className="pattern-legend">{(["practiced", "attention", "mixed", "na", "unanswered", "no-entry"] as const).map((tone) => <span key={tone}><i className={`pattern-square pattern-tone-${tone}`} aria-hidden="true">{symbols[tone]}</i>{tone === "practiced" ? t("Practiced", "تمرین کردم") : tone === "attention" ? t("Needs attention", "نیازمند توجه") : toneLabel(tone, t)}</span>)}</div>
    <p className="pattern-method-note">{t("Green and orange summarize answered questions only. Didn’t come up today, unanswered questions, and missing inventories stay separate. Mixed means both Practiced and Needs attention were recorded in that square.", "سبز و نارنجی فقط پرسش‌های پاسخ‌داده‌شده را خلاصه می‌کنند. «امروز پیش نیامد»، پرسش‌های بی‌پاسخ و روزهای بدون ترازنامه جدا می‌مانند. ترکیبی یعنی در آن خانه هم «تمرین کردم» و هم «نیازمند توجه» ثبت شده است.")}</p>
    {(view === "overview" || print) && <div id={print ? undefined : "pattern-overview-panel"} role={print ? undefined : "tabpanel"} aria-labelledby={print ? undefined : "pattern-overview-tab"}>{!print && <label className="pattern-sort">{t("Sort principles by", "مرتب‌سازی اصول بر اساس")}<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="attention">{t("Needs attention most often", "بیشترین پاسخ نیازمند توجه")}</option><option value="practiced">{t("Practiced most often", "بیشترین تمرین")}</option><option value="principle">{t("Principle name", "نام اصل")}</option></select></label>}{bars}{!print && <button type="button" className="button button-outline button-small" onClick={() => setShowAll((value) => !value)}>{showAll ? t("Show fewer principles", "نمایش اصول کمتر") : t("Show all 24 principles", "نمایش هر ۲۴ اصل")}</button>}</div>}
    {(view === "map" || print) && <div id={print ? undefined : "pattern-map-panel"} role={print ? undefined : "tabpanel"} aria-labelledby={print ? undefined : "pattern-map-tab"}>{map}</div>}
  </section>;
}
