"use client";

import { dateTimeFormat, languageLocale } from "@/lib/languages";
import { localizedText } from "@/lib/localization";

import * as React from "react";
import { formatDisplayDate, principleQuestion, principles, questionWithPrinciple } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import { buildStep10Trends, type PatternObservation, type QuestionTrend, type TrendStatus } from "@/lib/step10-trends";
import { useLanguage } from "./language-provider";

type Translate = (english: string, farsi: string) => string;

function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export function statusLabel(status: TrendStatus, t: Translate) {
  if (status === "improving") return t("Improving", "رو به بهبود");
  if (status === "slipping") return t("Slipping", "رو به افت");
  if (status === "focus") return t("Ongoing focus", "تمرکز ادامه‌دار");
  if (status === "strength") return t("Steady strength", "نقطه قوت پایدار");
  return t("No clear pattern yet", "هنوز الگوی روشنی نیست");
}

function weekdayName(weekday: number, locale: string) {
  // November 1, 2026 is a Sunday, so adding the weekday index gives that day of the week.
  return dateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 10, 1 + weekday, 12)));
}

function observationText(item: PatternObservation, question: string, weekday: string, t: Translate) {
  const values = { question, weekday, count: item.count, total: item.total, otherCount: item.otherCount, otherTotal: item.otherTotal };
  // The weekday starts this sentence, so capitalize it even in languages that write weekdays in lowercase.
  if (item.kind === "weekday") return fillTemplate(t("{weekday}: “{question}” needed attention {count} of {total} times, compared with {otherCount} of {otherTotal} on other days.", "{weekday}: «{question}» {count} بار از {total} بار نیازمند توجه بود، در مقایسه با {otherCount} از {otherTotal} در روزهای دیگر."), { ...values, weekday: weekday.charAt(0).toLocaleUpperCase() + weekday.slice(1) });
  if (item.kind === "weekdays") return fillTemplate(t("Weekdays: “{question}” needed attention {count} of {total} times, compared with {otherCount} of {otherTotal} on weekends.", "روزهای کاری: «{question}» {count} بار از {total} بار نیازمند توجه بود، در مقایسه با {otherCount} از {otherTotal} در آخر هفته‌ها."), values);
  if (item.kind === "weekend") return fillTemplate(t("Weekends: “{question}” needed attention {count} of {total} times, compared with {otherCount} of {otherTotal} on weekdays.", "آخر هفته‌ها: «{question}» {count} بار از {total} بار نیازمند توجه بود، در مقایسه با {otherCount} از {otherTotal} در روزهای کاری."), values);
  return fillTemplate(t("Days you wrote about a family member's drinking or substance use: “{question}” needed attention {count} of {total} times, compared with {otherCount} of {otherTotal} on other days.", "روزهایی که درباره مصرف الکل یا مواد یکی از اعضای خانواده نوشتید: «{question}» {count} بار از {total} بار نیازمند توجه بود، در مقایسه با {otherCount} از {otherTotal} در روزهای دیگر."), values);
}

export function Step10TrendInsights({ analytics }: { analytics: Step10AnalyticsData }) {
  const { language, t } = useLanguage();
  const trends = React.useMemo(() => buildStep10Trends(analytics.days), [analytics.days]);
  const locale = languageLocale(language, true);
  const principleName = (id: string) => {
    const item = principles.find((principle) => principle.id === id);
    return item ? localizedText(item, language) : id;
  };
  const question = (id: string) => principleQuestion(id, language);
  const weekday = (index?: number) => (index === undefined ? "" : weekdayName(index, locale));
  const describe = (item: PatternObservation) => observationText(item, question(item.id), weekday(item.weekday), t);

  const summary: string[] = [];
  const halves = trends.halves;
  if (halves && halves.earlier.rate !== null && halves.recent.rate !== null) {
    summary.push(fillTemplate(t("Your Practiced share went from {earlier}% in the first half of this period to {recent}% in the second half.", "سهم «تمرین کردم» شما از {earlier}% در نیمه اول این بازه به {recent}% در نیمه دوم رسید."), { earlier: halves.earlier.rate, recent: halves.recent.rate }));
  }
  const topImproving = trends.improving[0];
  if (topImproving) summary.push(fillTemplate(t("Biggest improvement: “{question}”.", "بیشترین پیشرفت: «{question}»."), { question: question(topImproving.id) }));
  const topFocus = trends.focus[0];
  if (topFocus) {
    summary.push(topFocus.status === "slipping"
      ? fillTemplate(t("Slipping lately: “{question}”, from {earlier}% to {recent}% Practiced.", "اخیراً رو به افت: «{question}»، از {earlier}% به {recent}% تمرین کردم."), { question: question(topFocus.id), earlier: topFocus.earlier.rate ?? 0, recent: topFocus.recent.rate ?? 0 })
      : fillTemplate(t("Still a focus: “{question}”, which needed attention {count} of {total} times.", "همچنان در کانون توجه: «{question}» که {count} بار از {total} بار نیازمند توجه بود."), { question: question(topFocus.id), count: topFocus.overall.attention, total: topFocus.overall.answered }));
  }
  const topPattern = trends.observations[0];
  if (topPattern) summary.push(describe(topPattern));

  const sponsorQuestions: string[] = [];
  if (topImproving) sponsorQuestions.push(fillTemplate(t("What helped me with {principle} lately, and how can I keep it going?", "اخیراً چه چیزی در {principle} به من کمک کرد و چطور می‌توانم آن را ادامه دهم؟"), { principle: principleName(topImproving.principleId) }));
  if (topFocus) sponsorQuestions.push(fillTemplate(t("What could I try next with {principle}?", "در {principle} قدم بعدی را چه چیزی می‌توانم امتحان کنم؟"), { principle: principleName(topFocus.principleId) }));
  const dayPattern = trends.observations.find((item) => item.kind === "weekday");
  if (dayPattern) sponsorQuestions.push(fillTemplate(t("What makes {weekday} harder, and how can I prepare for it?", "چه چیزی {weekday} را دشوارتر می‌کند و چطور می‌توانم برایش آماده شوم؟"), { weekday: weekday(dayPattern.weekday) }));
  if (trends.observations.some((item) => item.kind === "family")) sponsorQuestions.push(t("How can I keep my boundaries on days affected by someone else's drinking?", "چطور می‌توانم در روزهایی که مصرف الکل دیگری بر من اثر می‌گذارد، مرزهایم را حفظ کنم؟"));

  const latestHighlight = analytics.written.reflections.find((item) => item.field === "highlights")?.excerpts[0];
  const latestConcern = analytics.written.reflections.find((item) => item.field === "attention")?.excerpts[0];

  const trendItem = (item: QuestionTrend) => <li key={item.id}>
    <strong>{questionWithPrinciple(item.id, language)}</strong>
    <span className={`trend-chip is-${item.status}`}>{statusLabel(item.status, t)}</span>
    {item.earlier.rate !== null && item.recent.rate !== null && <span>{fillTemplate(t("First half {earlier}% → second half {recent}% Practiced", "نیمه اول {earlier}% ← نیمه دوم {recent}% تمرین کردم"), { earlier: item.earlier.rate, recent: item.recent.rate })}</span>}
    {item.streak >= 5 && <span>{fillTemplate(t("Practiced {count} times in a row", "{count} بار پشت سر هم تمرین کردم"), { count: item.streak })}</span>}
  </li>;
  const trendList = (title: string, description: string, items: QuestionTrend[], tone: string) => <article className={`analytics-interpretation-card ${tone}`}>
    <h4>{title}</h4>
    <p>{description}</p>
    {items.length ? <ul>{items.map(trendItem)}</ul> : <p className="analytics-interpretation-empty">{t("Nothing here yet for this period.", "هنوز موردی برای این بازه نیست.")}</p>}
  </article>;

  return (
    <section className="trend-insights" aria-labelledby="trend-summary-title">
      <article className="trend-summary">
        <h3 id="trend-summary-title">{t("This period at a glance", "این بازه در یک نگاه")}</h3>
        {summary.length ? <ul>{summary.map((line) => <li key={line}>{line}</li>)}</ul> : <p className="trend-note">{t("Save inventories on more days to see how your answers change over this period.", "برای دیدن تغییر پاسخ‌هایتان در این بازه، در روزهای بیشتری ترازنامه ذخیره کنید.")}</p>}
        {sponsorQuestions.length > 0 && <>
          <h4>{t("Questions to bring to your sponsor", "پرسش‌هایی برای گفت‌وگو با حامی")}</h4>
          <ul>{sponsorQuestions.map((line) => <li key={line}>{line}</li>)}</ul>
        </>}
        {latestHighlight && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what went well", "نوشته اخیر درباره آنچه خوب پیش رفت")}</strong><time>{formatDisplayDate(latestHighlight.date, language)}</time><blockquote dir="auto">{latestHighlight.text}</blockquote></div>}
        {latestConcern && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what needs attention", "نوشته اخیر درباره آنچه نیازمند توجه است")}</strong><time>{formatDisplayDate(latestConcern.date, language)}</time><blockquote dir="auto">{latestConcern.text}</blockquote></div>}
        <p className="trend-note">{t("These are observations from your own answers, not causes or a recovery grade.", "این‌ها مشاهداتی از پاسخ‌های خود شماست، نه علت‌ها یا نمره بهبودی.")}</p>
      </article>
      <div className="analytics-interpretation-grid trend-grid">
        {trendList(t("Most improved", "بیشترین پیشرفت"), t("Practiced share rose at least 25 points from the first half of this period to the second half.", "سهم «تمرین کردم» از نیمه اول این بازه تا نیمه دوم دست‌کم ۲۵ واحد بالا رفت."), trends.improving, "is-strength")}
        {trendList(t("Ongoing focus", "تمرکز ادامه‌دار"), t("Needed attention at least half the time in both halves of this period, or dropped 25 points or more.", "در هر دو نیمه این بازه دست‌کم در نیمی از موارد نیازمند توجه بود، یا ۲۵ واحد یا بیشتر افت کرد."), trends.focus, "is-focus")}
        {trendList(t("Steady strengths", "نقاط قوت پایدار"), t("Practiced at least 75% of the time in both halves of this period.", "در هر دو نیمه این بازه دست‌کم در ۷۵٪ موارد تمرین شد."), trends.strengths, "is-strength")}
      </div>
      {trends.observations.length > 0 && <article className="trend-patterns">
        <h3>{t("When patterns show up", "الگوها چه زمانی دیده می‌شوند")}</h3>
        <p>{t("Repeated differences by day of the week or by what you wrote about.", "تفاوت‌های تکرارشونده بر اساس روز هفته یا موضوعی که درباره‌اش نوشتید.")}</p>
        <ul>{trends.observations.map((item) => <li key={`${item.kind}:${item.id}:${item.weekday ?? ""}`}>{describe(item)}</li>)}</ul>
      </article>}
    </section>
  );
}
