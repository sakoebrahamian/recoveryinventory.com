"use client";

import { dateTimeFormat, isRtlLanguage, languageLocale } from "@/lib/languages";

import * as React from "react";
import { formatDisplayDate } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import type { ReportBounds } from "@/lib/step10-report-period";
import { step10ReflectionLabel } from "@/lib/step10-report";
import { dailyPracticeSeries, fillTemplate, type DailyPracticePoint } from "@/lib/step10-visuals";
import { HowWeCountLink } from "./step10-how-we-count";
import { useLanguage } from "./language-provider";

const width = 720;
const height = 250;
const padStart = 40;
const padEnd = 14;
const padTop = 22;
const padBottom = 30;
const plotWidth = width - padStart - padEnd;
const plotHeight = height - padTop - padBottom;
const detailedLimit = 120;

export function Step10HeroChart({ analytics, bounds }: { analytics: Step10AnalyticsData; bounds: ReportBounds }) {
  const { language, t } = useLanguage();
  const rtl = isRtlLanguage(language);
  const locale = languageLocale(language, true);
  const points = React.useMemo(() => dailyPracticeSeries(analytics.days, bounds), [analytics.days, bounds.from, bounds.through]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const answeredDays = points.filter((point) => point.rate !== null);
  const detailed = points.length <= detailedLimit;
  const axisDate = dateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });

  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const xFor = (index: number) => {
    const offset = points.length > 1 ? index * step : plotWidth / 2;
    return rtl ? width - padStart - offset : padStart + offset;
  };
  const yFor = (rate: number) => padTop + plotHeight - (rate / 100) * plotHeight;
  const labelX = rtl ? width - padStart + 8 : padStart - 8;
  const labelAnchor = rtl ? "start" : "end";

  const averagePath = points.reduce((path, point, index) => {
    if (point.average === null) return path;
    const previous = index > 0 ? points[index - 1].average : null;
    return `${path}${previous === null ? "M" : "L"}${xFor(index).toFixed(1)},${yFor(point.average).toFixed(1)} `;
  }, "").trim();

  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const dayTitle = (point: DailyPracticePoint) => point.rate === null
    ? `${formatDisplayDate(point.date, language)}: ${point.saved ? t("No Practiced or Needs attention answers", "بدون پاسخ «تمرین کردم» یا «نیازمند توجه»") : t("No saved inventory", "بدون ترازنامه ذخیره‌شده")}`
    : fillTemplate(t("{date}: {rate}% Practiced ({practiced} of {answered} answers)", "{date}: {rate}% تمرین کردم ({practiced} از {answered} پاسخ)"), { date: formatDisplayDate(point.date, language), rate: point.rate, practiced: point.practiced, answered: point.answered });
  const chosen = points.find((point) => point.date === selected && point.note);
  const latestAverage = [...points].reverse().find((point) => point.average !== null)?.average ?? null;
  const summary = fillTemplate(t("Practiced share for {count} saved days. Latest 7-day average: {average}.", "سهم «تمرین کردم» برای {count} روز ذخیره‌شده. آخرین میانگین ۷ روزه: {average}."), { count: answeredDays.length, average: latestAverage === null ? "—" : `${latestAverage}%` });

  function chooseNote(event: React.KeyboardEvent<SVGGElement>, date: string) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setSelected((value) => (value === date ? null : date));
  }

  return <section className="analytics-hero-chart analytics-panel" aria-labelledby="analytics-hero-title">
    <div className="analytics-hero-heading">
      <div>
        <h3 id="analytics-hero-title">{t("Practiced share over time", "سهم «تمرین کردم» در طول زمان")}</h3>
        <p>{t("Each dot is one saved day. The line is the 7-day average, so one hard day doesn’t hide the overall direction.", "هر نقطه یک روز ذخیره‌شده است. خط، میانگین ۷ روزه است تا یک روز سخت جهت کلی را پنهان نکند.")} <HowWeCountLink /></p>
      </div>
      {latestAverage !== null && <strong className="analytics-hero-latest"><span>{latestAverage}%</span><small>{t("Latest 7-day average", "آخرین میانگین ۷ روزه")}</small></strong>}
    </div>
    {answeredDays.length < 2 ? <p className="trend-note">{t("Save inventories on more days to see how your answers change over this period.", "برای دیدن تغییر پاسخ‌هایتان در این بازه، در روزهای بیشتری ترازنامه ذخیره کنید.")}</p> : <>
      <div className="analytics-hero-frame">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary} className="analytics-hero-svg">
          {detailed && points.map((point, index) => (point.weekday === 0 || point.weekday === 6) && <rect key={`weekend-${point.date}`} className="hero-weekend" x={xFor(index) - Math.max(step, 6) / 2} y={padTop} width={Math.max(step, 6)} height={plotHeight} />)}
          {[0, 25, 50, 75, 100].map((rate) => <g key={rate}>
            <line className={rate % 50 === 0 ? "hero-grid is-major" : "hero-grid"} x1={rtl ? padEnd : padStart} x2={rtl ? width - padStart : width - padEnd} y1={yFor(rate)} y2={yFor(rate)} />
            {rate % 50 === 0 && <text className="hero-axis" x={labelX} y={yFor(rate) + 4} textAnchor={labelAnchor}>{rate}%</text>}
          </g>)}
          {points.map((point, index) => index % labelEvery === 0 && <text key={`label-${point.date}`} className="hero-axis" x={xFor(index)} y={height - 8} textAnchor="middle">{axisDate.format(new Date(`${point.date}T12:00:00Z`))}</text>)}
          {detailed && points.map((point, index) => point.rate !== null && <circle key={`dot-${point.date}`} className={point.rate >= 50 ? "hero-dot" : "hero-dot is-low"} cx={xFor(index)} cy={yFor(point.rate)} r={3.6}><title>{dayTitle(point)}</title></circle>)}
          {averagePath && <path className="hero-average" d={averagePath} />}
          {detailed && points.map((point, index) => point.note && <g key={`note-${point.date}`} className={`hero-note${selected === point.date ? " is-selected" : ""}`} role="button" tabIndex={0} aria-pressed={selected === point.date} aria-label={`${formatDisplayDate(point.date, language)}: ${t("Read what you wrote", "خواندن آنچه نوشتید")}`} onClick={() => setSelected((value) => (value === point.date ? null : point.date))} onKeyDown={(event) => chooseNote(event, point.date)}>
            <title>{`${formatDisplayDate(point.date, language)} · ${step10ReflectionLabel(point.note.field, t)}`}</title>
            <circle cx={xFor(index)} cy={padTop - 9} r={9} className="hero-note-hit" />
            <path d={`M${xFor(index)},${padTop - 15} l5,6 l-5,6 l-5,-6 z`} />
          </g>)}
        </svg>
      </div>
      <ul className="analytics-hero-legend" aria-hidden="true">
        <li><i className="legend-dot" />{t("One saved day", "یک روز ذخیره‌شده")}</li>
        <li><i className="legend-line" />{t("7-day average", "میانگین ۷ روزه")}</li>
        {detailed && <li><i className="legend-weekend" />{t("Weekend", "آخر هفته")}</li>}
        {detailed && points.some((point) => point.note) && <li><i className="legend-note" />{t("Day with writing — select to read", "روز دارای نوشته — برای خواندن انتخاب کنید")}</li>}
      </ul>
      {chosen?.note && <article className="analytics-hero-note" aria-live="polite">
        <time dateTime={chosen.date}>{formatDisplayDate(chosen.date, language)}</time>
        <strong>{step10ReflectionLabel(chosen.note.field, t)}</strong>
        <blockquote dir="auto">{chosen.note.text}</blockquote>
      </article>}
      <details className="analytics-hero-table">
        <summary>{t("Show as table", "نمایش به صورت جدول")}</summary>
        <div className="analytics-table-scroll"><table className="analytics-data-table">
          <caption>{t("Practiced share over time", "سهم «تمرین کردم» در طول زمان")}</caption>
          <thead><tr><th>{t("Date", "تاریخ")}</th><th>{t("Practiced share", "سهم تمرین‌شده")}</th><th>{t("7-day average", "میانگین ۷ روزه")}</th></tr></thead>
          <tbody>{points.filter((point) => point.saved).map((point) => <tr key={point.date}><th scope="row">{formatDisplayDate(point.date, language)}</th><td>{point.rate === null ? "—" : `${point.rate}% (${point.practiced}/${point.answered})`}</td><td>{point.average === null ? "—" : `${point.average}%`}</td></tr>)}</tbody>
        </table></div>
      </details>
    </>}
  </section>;
}
