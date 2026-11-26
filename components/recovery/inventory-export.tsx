"use client";

import { dateTimeFormat } from "@/lib/languages";

import { localizedText } from "@/lib/localization";

import { isRtlLanguage, languageLocale } from "@/lib/languages";

import * as React from "react";
import { createPortal } from "react-dom";
import { BarChart3, BookOpen, Check, Copy, FileDown, FileText, LayoutGrid, Lock, RefreshCw, Share2, X } from "lucide-react";
import { formatDisplayDate, principleCategories, step10QuestionsForPayload, principleQuestion, questionPrincipleName, questionWithPrinciple, reflectionPrincipleNames, step4Types, todayIso } from "@/lib/inventory";
import { reflectionFields, type PrincipleAnalytics, type Step10AnalyticsData } from "@/lib/step10-analytics";
import { formatStep10SponsorReport, step10ReflectionLabel } from "@/lib/step10-report";
import { copyStep10Report, shareStep10Report } from "@/lib/step10-share";
import { openPrintPreview } from "@/lib/print-preview";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance, originalFrameworkGuidance } from "@/lib/recovery-guidance";
import { practiceForPrinciple } from "@/lib/step10-practices";
import { Step10PeriodComparison } from "./step10-analytics-detail";
import { Step10PatternVisual } from "./step10-pattern-visual";
import { Step10WrittenInsights } from "./step10-written-insights";
import { Step10WeeklyInsights } from "./step10-weekly-insights";
import { useLanguage } from "./language-provider";
import type { Step10Data } from "./step10-inventory";
import type { Step4Data, Step4Entry } from "./step4-inventory";
import { ReportPeriodPicker } from "./report-period-picker";
import { DateRangePicker } from "./date-range-picker";
import { Step10ReportChart } from "./step10-report-chart";
import { Step10PatternSummary } from "./step10-pattern-summary";
import { useReportAnalytics } from "./use-report-analytics";
import { reportBounds, type ReportBounds, type ReportPeriod } from "@/lib/step10-report-period";

export type InventoryRecord = {
  id: string;
  type: "step10" | "step4";
  date: string;
  payload: Step10Data | Step4Data;
  updatedAt: number;
};

export type InventoryExportHandle = {
  open: (options?: { type?: "step10" | "step4"; format?: ExportFormat; day?: string }) => void;
  close: () => void;
};

type ExportScope = "today" | "day" | "week" | "range" | "month" | "year";
type ExportFormat = "summary" | "archive" | "chart" | "pattern";

type InventoryExportProps = {
  records: InventoryRecord[];
  selectedDate: string;
  year: number;
  reportPeriod: ReportPeriod;
  refreshKey: number;
};

const subscribeToDom = () => () => undefined;
const getClientDomSnapshot = () => true;
const getServerDomSnapshot = () => false;

function shiftDays(date: string, days: number) {
  const value = new Date(date + "T12:00:00Z");
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function firstDayOfYear(year: number) {
  return `${String(year).padStart(4, "0")}-01-01`;
}

function lastDayOfYear(year: number) {
  return `${String(year).padStart(4, "0")}-12-31`;
}

function step4Labels(type: string, t: (en: string, fa: string) => string) {
  if (type === "fear") return {
    subject: t("What I am afraid of", "آنچه از آن می‌ترسم"),
    event: t("Story or belief underneath it", "داستان یا باور پشت آن"),
    effect: t("Effect on my choices", "تأثیر بر انتخاب‌هایم"),
    myPart: t("What I do when it appears", "رفتار من هنگام ظاهر شدن آن"),
    nextAction: t("Grounded action", "اقدام واقع‌بینانه"),
  };
  if (type === "relationship") return {
    subject: t("Person or relationship", "فرد یا رابطه"),
    event: t("Pattern or harm", "الگو یا آسیب"),
    effect: t("Who or what was affected", "فرد یا چیزی که تحت تأثیر قرار گرفت"),
    myPart: t("My responsibility", "مسئولیت من"),
    nextAction: t("Repair, amends, or boundary", "جبران، عذرخواهی یا مرز"),
  };
  if (type === "strength") return {
    subject: t("Strength or positive quality", "نقطه قوت یا ویژگی مثبت"),
    event: t("Where I saw it in action", "جایی که آن را در عمل دیدم"),
    effect: t("What it supported", "آنچه از آن حمایت کرد"),
    myPart: t("Choice that helped it appear", "انتخابی که به ظهور آن کمک کرد"),
    nextAction: t("How I can practice it again", "چگونه دوباره آن را تمرین کنم"),
  };
  return {
    subject: t("Person, institution, or situation", "فرد، نهاد یا موقعیت"),
    event: t("What happened", "آنچه اتفاق افتاد"),
    effect: t("What part of me was affected", "بخشی از من که تحت تأثیر قرار گرفت"),
    myPart: t("My part or repeating pattern", "سهم یا الگوی تکراری من"),
    nextAction: t("Principle or action to practice", "اصل یا اقدامی برای تمرین"),
  };
}

function Step10Print({ data }: { data: Step10Data }) {
  const { language, t } = useLanguage();
  const answered = step10QuestionsForPayload(data).filter((principle) => Boolean(data.states?.[principle.id]));

  return (
    <>
      {answered.length > 0 ? principleCategories.map((category) => {
        const matching = answered.filter((principle) => principle.category === category.id);
        if (!matching.length) return null;
        return (
          <section className="inventory-print-section" key={category.id}>
            <h3>{localizedText(category, language)}</h3>
            <div className="inventory-print-principles">
              {matching.map((principle) => {
                const state = data.states[principle.id];
                const attentionNote = state === "attention" ? data.attentionNotes?.[principle.id]?.trim() : "";
                const stateLabel = state === "practiced"
                  ? t("Practiced", "تمرین کردم")
                  : state === "attention"
                    ? t("Needs attention", "نیازمند توجه")
                    : t("Didn’t come up today", "امروز پیش نیامد");
                return (
                  <div className="inventory-print-principle" key={principle.id}>
                    <span className={`inventory-print-state is-${state}`}>{stateLabel}</span>
                    <strong>{principleQuestion(principle.id, language)}</strong>
                    <span className="question-principle">{t("Principle", "اصل")}: {questionPrincipleName(principle.id, language)}</span>
                    {attentionNote && (
                      <div className="inventory-print-attention-note">
                        <strong>{t("What happened today that needs attention?", "امروز چه اتفاقی افتاد که نیاز به توجه دارد؟")}</strong>
                        <p>{attentionNote}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      }) : (
        <p className="inventory-print-empty">{t("No question responses were recorded.", "هیچ پاسخی برای پرسش‌ها ثبت نشده است.")}</p>
      )}

      <section className="inventory-print-section">
        <h3>{t("Daily reflection", "بازتاب روزانه")}</h3>
        <div className="inventory-print-reflections">
          {reflectionFields.map((field) => (
            <div key={field}>
              <strong>{step10ReflectionLabel(field, t)}</strong>
              <small className="question-principle">{t("Related principles", "اصول مرتبط")}: {reflectionPrincipleNames(field, language)}</small>
              <p>{data[field]?.trim() || "—"}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Step4EntryPrint({ entry, index }: { entry: Step4Entry; index: number }) {
  const { t } = useLanguage();
  const labels = step4Labels(entry.type, t);
  const fields = [
    [labels.event, entry.event],
    [labels.effect, entry.effect],
    [labels.myPart, entry.myPart],
    [labels.nextAction, entry.nextAction],
  ] as const;

  return (
    <article className="inventory-print-step4-entry">
      <div className="inventory-print-entry-title"><span>{index + 1}</span><h4>{entry.subject || "—"}</h4></div>
      <dl>
        {fields.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value?.trim() || "—"}</dd></div>
        ))}
      </dl>
    </article>
  );
}

function Step4Print({ data }: { data: Step4Data }) {
  const { language, t } = useLanguage();
  if (!data.entries?.length) return <p className="inventory-print-empty">{t("No Step 4 entries were recorded.", "هیچ موردی برای گام چهارم ثبت نشده است.")}</p>;

  return (
    <>
      {step4Types.map((type) => {
        const matching = data.entries.filter((entry) => entry.type === type.id);
        if (!matching.length) return null;
        return (
          <section className="inventory-print-section" key={type.id}>
            <h3>{localizedText(type, language)}</h3>
            <p className="inventory-print-description">{localizedText({ en: type.descriptionEn, es: type.descriptionEs, fa: type.descriptionFa }, language)}</p>
            <div className="inventory-print-step4-list">
              {matching.map((entry, index) => <Step4EntryPrint entry={entry} index={index} key={entry.id} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function Step10AnalyticsPrint({ analytics, bounds, scopeLabel, brief = false }: { analytics: Step10AnalyticsData; bounds: ReportBounds; scopeLabel: string; brief?: boolean }) {
  const { language, t } = useLanguage();
  const locale = languageLocale(language);
  const monthLocale = language === "fa" ? "fa-IR-u-ca-gregory" : locale;
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const principleName = (item: PrincipleAnalytics) => questionWithPrinciple(item.id, language);
  const insights = summarizeStep10Insights(analytics);
  const latestHighlight = analytics.written.reflections.find((item) => item.field === "highlights")?.excerpts[0];
  const latestConcern = analytics.written.reflections.find((item) => item.field === "attention")?.excerpts[0];
  const daily = bounds.mode === "day" || bounds.mode === "today";
  const fromDate = formatDisplayDate(bounds.from, language);
  const throughDate = formatDisplayDate(bounds.through, language);

  return (
    <section className={`inventory-print-analytics${brief ? " is-summary" : ""}`}>
      <header>
        <p>{t("PRIVATE PATTERN SUMMARY", "خلاصه خصوصی الگوها")}</p>
        <h2>{t("Step 10 analytics", "تحلیل گام ۱۰")}</h2>
        <span>{t("Analytics period", "بازه تحلیل")}: {fromDate}{bounds.from !== bounds.through && <> – {throughDate}</>}</span>
        <small>{brief
          ? t("Counts and an inventory chart for the chosen period. Individual inventory pages are not included.", "شمارش‌ها و نمودار ترازنامه برای بازه انتخاب‌شده. صفحه‌های ترازنامه روزانه در این خلاصه نیستند.")
          : <>{t("Inventory pages selected", "صفحه‌های ترازنامه انتخاب‌شده")}: {scopeLabel}. {t("Analytics count saved Step 10 entries in those dates.", "تحلیل، ترازنامه‌های ذخیره‌شده گام ۱۰ را در همین تاریخ‌ها می‌شمارد.")}</>}</small>
      </header>

      {analytics.totalEntries === 0 ? (
        <p className="inventory-print-empty">{t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد.")}</p>
      ) : (
        <>
          <dl className="inventory-print-analytics-stats">
            <div><dt>{t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}</dt><dd>{number(analytics.totalEntries)}</dd></div>
            <div><dt>{t("Practiced share", "سهم تمرین‌شده")}</dt><dd>{number(analytics.practiceRate)}%</dd></div>
            <div><dt>{t("Practiced", "تمرین کردم")}</dt><dd>{number(analytics.totalPracticed)}</dd></div>
            <div><dt>{t("Needs attention", "نیازمند توجه")}</dt><dd>{number(analytics.totalAttention)}</dd></div>
            <div><dt>{t("Didn’t come up today", "امروز پیش نیامد")}</dt><dd>{number(analytics.totalNA)}</dd></div>
          </dl>
          <Step10ReportChart analytics={analytics} bounds={bounds} />
          {daily && <section className="inventory-print-analytics-block inventory-print-interpretation">
            <h3>{t("Where you practiced", "جاهایی که تمرین کردید")}</h3>
            <p>{analytics.principles.filter((item) => item.practiced).map(principleName).join(" · ") || "—"}</p>
            <h3>{t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید")}</h3>
            {analytics.principles.filter((item) => item.attention).length ? <ul>{analytics.principles.filter((item) => item.attention).map((item) => {
              const guide = practiceForPrinciple(item.id, language);
              return <li key={item.id}><strong>{principleName(item)}</strong>{guide && <> — {t("Principles to discuss", "اصولی برای گفت‌وگو")}: {guide.primary} + {guide.companion}. {t("Possible practice to discuss", "تمرین پیشنهادی برای گفت‌وگو")}: {guide.action}</>}</li>;
            })}</ul> : <p>—</p>}
          </section>}

          {!daily && <Step10PatternVisual analytics={analytics} bounds={bounds} print />}
          <Step10PeriodComparison analytics={analytics} bounds={bounds} />

          {!daily && <section className="inventory-print-analytics-block inventory-print-interpretation">
            <h3>{t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند")}</h3>
            <p>{t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; Didn’t come up today and unanswered questions do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «امروز پیش نیامد» و پاسخ‌های خالی محاسبه نمی‌شوند.")}</p>
            <div>
              {([
                [t("Where you are doing well", "جاهایی که خوب پیش می‌روید"), insights.strengths, "practiced", insights.enoughHistory
                  ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
                  : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")],
                [t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید"), insights.focus, "attention", insights.enoughHistory
                  ? t("Among questions answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان پرسش‌هایی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
                  : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")],
              ] as const).map(([heading, items, countKey, empty]) => (
                <div key={countKey}>
                  <h4>{heading}</h4>
                  {items.length ? <ul>{items.map((item) => (
                    <li key={item.id}><strong>{principleName(item)}</strong> — {number(item[countKey])} {t("of", "از")} {number(item.answered)} {countKey === "practiced"
                      ? t("recorded answers marked Practiced", "پاسخ ثبت‌شده با برچسب «تمرین کردم»")
                      : t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»")}</li>
                  ))}</ul> : <p>{empty}</p>}
                  {!brief && (countKey === "practiced" ? latestHighlight : latestConcern) && <p className="inventory-print-interpretation-quote"><strong>{countKey === "practiced" ? t("Recent words about what went well", "نوشته اخیر درباره آنچه خوب پیش رفت") : t("Recent words about what needs attention", "نوشته اخیر درباره آنچه نیازمند توجه است")}</strong> — {formatDisplayDate((countKey === "practiced" ? latestHighlight : latestConcern)!.date, language)}: “{(countKey === "practiced" ? latestHighlight : latestConcern)!.text}”</p>}
                </div>
              ))}
            </div>
          </section>}

          {!daily && (brief ? <Step10WeeklyInsights analytics={analytics} print /> : <Step10WrittenInsights analytics={analytics} print />)}

          <aside className="inventory-print-sponsor-note">
            <h3>{t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}</h3>
            <p>{sponsorGuidance(t)}</p>
            <p>{originalFrameworkGuidance(t)}</p>
          </aside>

          {!brief && !daily && <><div className="inventory-print-analytics-insights">
            {([
              [t("Practiced most often", "بیشترین تمرین"), analytics.topPracticed, "practiced", t("practiced", "تمرین‌شده")],
              [t("Recurring focus", "تمرکز تکرارشونده"), analytics.topAttention, "attention", t("needs attention", "نیازمند توجه")],
            ] as const).map(([heading, items, countKey, countLabel]) => (
              <section className="inventory-print-analytics-block" key={countKey}>
                <h3>{heading}</h3>
                {items.length ? <ol>{items.map((item) => <li key={item.id}><span>{principleName(item)}</span><strong>{number(item[countKey])} {countLabel}</strong></li>)}</ol>
                  : <p>{t("No pattern yet", "هنوز الگویی وجود ندارد")}</p>}
              </section>
            ))}
          </div>

          <section className="inventory-print-analytics-block">
            <h3>{t("Practice by area", "تمرین بر اساس حوزه")}</h3>
            <ul className="inventory-print-analytics-areas">
              {analytics.categories.map((category) => (
                <li key={category.id}>
                  <strong>{(() => { const item = principleCategories.find((item) => item.id === category.id); return item ? localizedText(item, language) : category.id; })()}</strong>
                  <span>{number(category.practiceRate)}% · {number(category.answered)} {t("scored selections", "انتخاب امتیازدار")}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="inventory-print-analytics-block">
            <h3>{t("Activity over time", "فعالیت در طول زمان")}</h3>
            <p>{t("Months with saved Step 10 inventories in the selected period.", "ماه‌های دارای ترازنامه ذخیره‌شده گام ۱۰ در بازه انتخاب‌شده.")}</p>
            <table className="inventory-print-analytics-months">
              <thead><tr><th>{t("Month", "ماه")}</th><th>{t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}</th><th>{t("Practiced", "تمرین کردم")}</th><th>{t("Needs attention", "نیازمند توجه")}</th><th>{t("Practiced share", "سهم تمرین‌شده")}</th></tr></thead>
              <tbody>{analytics.allMonths.map((month) => (
                <tr key={month.month}>
                  <th>{dateTimeFormat(monthLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month.month}-01T12:00:00Z`))}</th>
                  <td>{number(month.entries)}</td><td>{number(month.practiced)}</td><td>{number(month.attention)}</td><td>{number(month.practiceRate)}%</td>
                </tr>
              ))}</tbody>
            </table>
          </section>
          </>}
        </>
      )}
      <footer>{t("This private summary counts saved Step 10 choices in the selected period. Writing appears only for longer periods, as selected excerpts rather than a full transcript. It does not interpret every nuance of your words, analyze Step 4, or provide a diagnosis or clinical assessment.", "این خلاصه خصوصی انتخاب‌های ذخیره‌شده گام ۱۰ را در بازه انتخاب‌شده می‌شمارد. نوشته‌ها فقط برای بازه‌های طولانی‌تر و به‌صورت نمونه‌های منتخب نمایش داده می‌شوند، نه رونویسی کامل. همه ظرافت‌های نوشته‌های شما را تفسیر نمی‌کند، گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی ارائه نمی‌دهد.")} {t("Future-dated inventories are not included.", "ترازنامه‌های دارای تاریخ آینده محاسبه نمی‌شوند.")}</footer>
    </section>
  );
}

function PrintDocument({ records, scopeLabel, analytics, bounds, format }: { records: InventoryRecord[]; scopeLabel: string; analytics: Step10AnalyticsData | null; bounds: ReportBounds | null; format: ExportFormat }) {
  const { language, t } = useLanguage();
  const sorted = React.useMemo(() => [...records].sort((left, right) => {
    const dateOrder = left.date.localeCompare(right.date);
    if (dateOrder !== 0) return dateOrder;
    return left.type === right.type ? 0 : left.type === "step10" ? -1 : 1;
  }), [records]);

  return (
    <div className="inventory-print-root" aria-hidden="true" dir={isRtlLanguage(language) ? "rtl" : "ltr"}>
      <header className="inventory-print-cover">
        <p>{format === "summary" ? t("PRIVATE SPONSOR SUMMARY", "خلاصه خصوصی برای حامی") : format === "chart" ? t("PRIVATE PRINCIPLE CHART", "نمودار خصوصی اصول") : t("PRIVATE INVENTORY EXPORT", "خروجی خصوصی ترازنامه")}</p>
        <h1>{t("Recovery Inventory", "ترازنامه بهبودی")}</h1>
        <div><span>{scopeLabel}</span><span>{format === "summary" || format === "chart" ? `${analytics?.totalEntries ?? 0} ${t("saved Step 10 inventories", "ترازنامه ذخیره‌شده گام ۱۰")}` : `${new Intl.NumberFormat(language).format(sorted.length)} ${t("saved inventories", "ترازنامه ذخیره‌شده")}`}</span></div>
      </header>

      {format === "summary" || format === "chart" ? null : sorted.length === 0 ? (
        <section className="inventory-print-no-records"><h2>{t("No saved inventories in this selection", "هیچ ترازنامه ذخیره‌شده‌ای در این انتخاب وجود ندارد")}</h2></section>
      ) : sorted.map((record, index) => (
        <article className="inventory-print-record" key={record.id}>
          <header className="inventory-print-record-header">
            <span className="inventory-print-step">{record.type === "step10" ? "10" : "4"}</span>
            <div>
              <p>{record.type === "step10" ? t("STEP 10", "گام ۱۰") : t("STEP 4", "گام ۴")}</p>
              <h2>{record.type === "step10" ? t("Daily inventory", "ترازنامه روزانه") : t("Personal inventory", "ترازنامه شخصی")}</h2>
              <time>{formatDisplayDate(record.date, language)}</time>
            </div>
          </header>
          {record.type === "step10"
            ? <Step10Print data={record.payload as Step10Data} />
            : <Step4Print data={record.payload as Step4Data} />}
          <footer className="inventory-print-footer"><span>{t("Recovery Inventory", "ترازنامه بهبودی")}</span><span>{index + 1} / {sorted.length}</span></footer>
        </article>
      ))}
      {analytics && bounds && (format === "chart"
        ? <section className="inventory-print-chart-only"><Step10ReportChart analytics={analytics} bounds={bounds} /></section>
        : <Step10AnalyticsPrint analytics={analytics} bounds={bounds} scopeLabel={scopeLabel} brief={format === "summary"} />)}
    </div>
  );
}

export const InventoryExport = React.forwardRef<InventoryExportHandle, InventoryExportProps>(function InventoryExport(
  { records, selectedDate, year, reportPeriod, refreshKey },
  ref,
) {
  const { language, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState<ExportFormat>("summary");
  const [exportPeriod, setExportPeriod] = React.useState(reportPeriod);
  const [reportDay, setReportDay] = React.useState(selectedDate);
  const [scope, setScope] = React.useState<ExportScope>("day");
  const [day, setDay] = React.useState(selectedDate);
  const [rangeStart, setRangeStart] = React.useState(selectedDate);
  const [rangeEnd, setRangeEnd] = React.useState(selectedDate);
  const [month, setMonth] = React.useState(selectedDate.slice(0, 7));
  const [includeStep10, setIncludeStep10] = React.useState(true);
  const [includeStep4, setIncludeStep4] = React.useState(true);
  const [includeAnalytics, setIncludeAnalytics] = React.useState(true);
  const [shareMessage, setShareMessage] = React.useState("");
  const [todayRecordsResult, setTodayRecordsResult] = React.useState<{ key: string; records: InventoryRecord[]; error: string }>({ key: "", records: [], error: "" });
  const [todayRetry, setTodayRetry] = React.useState(0);
  const panelRef = React.useRef<HTMLElement>(null);
  const returnTo = React.useRef<{ trigger: HTMLElement | null; scrollY: number } | null>(null);
  const clearPrint = React.useRef<(() => void) | null>(null);
  const canUseDom = React.useSyncExternalStore(
    subscribeToDom,
    getClientDomSnapshot,
    getServerDomSnapshot,
  );

  React.useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const header = panel.closest(".member-page")?.querySelector(".member-header");
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    panel.focus({ preventScroll: true });
    window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - headerHeight - 16, behavior: "instant" });
  }, [open]);

  React.useEffect(() => () => clearPrint.current?.(), []);

  const closeExport = React.useCallback((restorePosition = true) => {
    const previous = returnTo.current;
    returnTo.current = null;
    clearPrint.current?.();
    clearPrint.current = null;
    setOpen(false);
    if (restorePosition && previous) {
      window.requestAnimationFrame(() => {
        const trigger = previous.trigger;
        const target = trigger?.getClientRects().length ? trigger : document.querySelector<HTMLElement>('button[aria-controls="step10-mobile-menu"]');
        target?.focus({ preventScroll: true });
        window.scrollTo({ top: previous.scrollY, behavior: "instant" });
      });
    }
  }, []);

  React.useImperativeHandle(ref, () => ({
    open: (options) => {
      const nextFormat = options?.format ?? (options?.type === "step4" ? "archive" : "summary");
      const nextScope = nextFormat === "archive" && options?.type === "step10" ? reportPeriod.mode : "day";
      const nextDay = nextScope === "today" ? todayIso() : options?.day ?? selectedDate;
      const trigger = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
      returnTo.current ??= { trigger, scrollY: window.scrollY };
      setFormat(nextFormat);
      setExportPeriod(reportPeriod);
      setReportDay(options?.day ?? selectedDate);
      setScope(nextScope);
      setDay(nextDay);
      setRangeStart(nextScope === "range" ? reportPeriod.from : nextDay);
      setRangeEnd(nextScope === "range" ? reportPeriod.through : nextDay);
      setMonth(nextDay.slice(0, 7));
      setIncludeStep10(options?.type ? options.type === "step10" : true);
      setIncludeStep4(options?.type ? options.type === "step4" : true);
      setIncludeAnalytics(true);
      setOpen(true);
    },
    close: () => closeExport(false),
  }), [closeExport, reportPeriod, selectedDate]);

  const needsTodayRecords = open && format === "archive" && scope === "today" && year !== Number(todayIso().slice(0, 4));
  const todayRecordsKey = `${todayIso()}:${refreshKey}:${todayRetry}`;
  React.useEffect(() => {
    if (!needsTodayRecords) return;
    const controller = new AbortController();
    async function loadToday() {
      try {
        const date = todayIso();
        const response = await fetch(`/api/inventories?year=${date.slice(0, 4)}&type=step10`, { cache: "no-store", signal: controller.signal });
        const result = await response.json() as { inventories?: InventoryRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Today’s inventory could not load.");
        if (!controller.signal.aborted) setTodayRecordsResult({ key: todayRecordsKey, records: (result.inventories ?? []).filter((record) => record.date === date), error: "" });
      } catch {
        if (!controller.signal.aborted) setTodayRecordsResult({ key: todayRecordsKey, records: [], error: "Today’s inventory could not load." });
      }
    }
    void loadToday();
    return () => controller.abort();
  }, [needsTodayRecords, todayRecordsKey]);
  const todayRecordsReady = !needsTodayRecords || todayRecordsResult.key === todayRecordsKey;

  const archivePeriod: ReportPeriod = {
    mode: scope,
    from: rangeStart <= rangeEnd ? rangeStart : rangeEnd,
    through: rangeStart <= rangeEnd ? rangeEnd : rangeStart,
  };
  const archiveDay = scope === "today" ? todayIso() : scope === "month" ? `${month}-01` : scope === "year" ? firstDayOfYear(year) : day;
  const rawBounds = reportBounds(format === "archive" ? archivePeriod : exportPeriod, format === "archive" ? archiveDay : reportDay);
  const archiveFrom = rawBounds && scope !== "today" && rawBounds.from < firstDayOfYear(year) ? firstDayOfYear(year) : rawBounds?.from;
  const archiveThrough = rawBounds && scope !== "today" && rawBounds.through > lastDayOfYear(year) ? lastDayOfYear(year) : rawBounds?.through;
  const bounds = rawBounds && format === "archive"
    ? archiveFrom && archiveThrough && archiveFrom <= archiveThrough ? { ...rawBounds, from: archiveFrom, through: archiveThrough } : null
    : rawBounds;
  const scoped = useReportAnalytics(bounds, open && Boolean(bounds) && (format !== "archive" || (includeAnalytics && includeStep10)), refreshKey);

  const filteredRecords = (() => {
    const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
    return (needsTodayRecords ? todayRecordsReady ? todayRecordsResult.records : [] : records).filter((record) => {
      const includedType = (record.type === "step10" && includeStep10) || (record.type === "step4" && includeStep4);
      if (!includedType) return false;
      if (scope === "today") return record.date === todayIso();
      if (scope === "day") return record.date === day;
      if (scope === "week") return Boolean(bounds && record.date >= bounds.from && record.date <= bounds.through);
      if (scope === "range") return record.date >= start && record.date <= end;
      if (scope === "month") return record.date.startsWith(`${month}-`);
      return record.date.startsWith(`${String(year).padStart(4, "0")}-`);
    });
  })();

  const scopeLabel = (() => {
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (scope === "today") return formatDisplayDate(todayIso(), language);
    if (scope === "day") return validDate(day) ? formatDisplayDate(day, language) : t("Choose a day", "یک روز انتخاب کنید");
    if (scope === "week") return bounds ? `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}` : t("Choose a valid date range ending today or earlier.", "بازه تاریخی معتبری انتخاب کنید که تا امروز یا پیش از آن پایان یابد.");
    if (scope === "range") {
      const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
      const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
      if (!validDate(start) || !validDate(end)) return t("Choose a complete date range", "یک بازه تاریخ کامل انتخاب کنید");
      return start === end ? formatDisplayDate(start, language) : `${formatDisplayDate(start, language)} – ${formatDisplayDate(end, language)}`;
    }
    if (scope === "month") {
      if (!/^\d{4}-\d{2}$/.test(month)) return t("Choose a month", "یک ماه انتخاب کنید");
      const [monthYear, monthNumber] = month.split("-").map(Number);
      return dateTimeFormat(languageLocale(language), { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(monthYear, monthNumber - 1, 1)));
    }
    return new Intl.NumberFormat(languageLocale(language), { useGrouping: false }).format(year);
  })();

  const dateCount = new Set(filteredRecords.map((record) => record.date)).size;
  const wantsAnalytics = format !== "archive" || (includeAnalytics && includeStep10 && filteredRecords.some((record) => record.type === "step10"));
  const currentAnalytics = scoped.analytics;
  const canPrint = format !== "archive"
    ? Boolean(bounds && currentAnalytics && currentAnalytics.totalEntries > 0 && !scoped.loading)
    : todayRecordsReady && (!needsTodayRecords || !todayRecordsResult.error) && filteredRecords.length > 0 && (includeStep10 || includeStep4) && Boolean(bounds) && (!wantsAnalytics || Boolean(currentAnalytics && !scoped.loading));
  const printLabel = format !== "archive"
    ? bounds ? bounds.from === bounds.through ? formatDisplayDate(bounds.from, language) : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}` : t("Choose a valid date range ending today or earlier.", "بازه تاریخی معتبری انتخاب کنید که تا امروز یا پیش از آن پایان یابد.")
    : scopeLabel;

  function toggleType(type: "step10" | "step4", checked: boolean) {
    if (type === "step10") {
      if (!checked && !includeStep4) return;
      setIncludeStep10(checked);
      return;
    }
    if (!checked && !includeStep10) return;
    setIncludeStep4(checked);
  }

  function printExport() {
    if (!canPrint) return;
    clearPrint.current = openPrintPreview("inventory-export-page", `${t("Recovery Inventory", "ترازنامه بهبودی")} - ${printLabel}`, closeExport);
  }

  const today = todayIso();
  const quickPeriods: [string, ReportPeriod][] = [
    [t("Last 30 days", "۳۰ روز گذشته"), { mode: "range", from: shiftDays(today, -29), through: today }],
    [t("This week", "این هفته"), { mode: "week", from: today, through: today }],
    [t("This month", "این ماه"), { mode: "month", from: today, through: today }],
  ];
  const isQuick = (period: ReportPeriod) => exportPeriod.mode === period.mode
    && (period.mode === "range" ? exportPeriod.from === period.from && exportPeriod.through === period.through : reportDay === today);
  function chooseQuick(period: ReportPeriod) {
    setExportPeriod(period);
    setReportDay(today);
    setShareMessage("");
  }
  const formatCards: [ExportFormat, React.ReactNode, string, string][] = [
    ["summary", <FileText size={20} aria-hidden="true" key="summary" />, t("Sponsor summary", "خلاصه برای حامی"), t("Counts, chart, and patterns. Best to share.", "شمارش‌ها، نمودار و الگوها. بهترین گزینه برای اشتراک.")],
    ["pattern", <LayoutGrid size={20} aria-hidden="true" key="pattern" />, t("Pattern map", "نقشه الگوها"), t("Color-coded answers by day.", "پاسخ‌ها با رنگ برای هر روز.")],
    ["chart", <BarChart3 size={20} aria-hidden="true" key="chart" />, t("Chart only", "فقط نمودار"), t("One picture of your answers.", "یک تصویر از پاسخ‌های شما.")],
    ["archive", <BookOpen size={20} aria-hidden="true" key="archive" />, t("Full journal", "دفتر کامل"), t("Every entry with your writing.", "همه نوشته‌ها همراه با متن کامل شما.")],
  ];
  const privateWriting = t("No written reflections or notes", "بدون بازتاب‌ها یا یادداشت‌های نوشته‌شده");
  const included: [boolean, string][] = format === "summary" ? [
    [true, t("Answer counts and the inventory chart", "شمارش پاسخ‌ها و نمودار ترازنامه")],
    [true, t("Patterns, trends, and what changed", "الگوها، روندها و آنچه تغییر کرد")],
    [true, t("Short excerpts of your weekly writing for periods longer than a day", "بخش‌های کوتاهی از نوشته‌های هفتگی شما برای بازه‌های بیش از یک روز")],
  ] : format === "chart" ? [
    [true, t("The inventory chart for these dates", "نمودار ترازنامه برای این تاریخ‌ها")],
    [false, privateWriting],
  ] : format === "pattern" ? [
    [true, t("Color-coded answers for every principle and day", "پاسخ‌های رنگی برای هر اصل و هر روز")],
    [false, privateWriting],
  ] : [
    [true, t("Every saved inventory with your full writing", "همه ترازنامه‌های ذخیره‌شده همراه با نوشته‌های کامل شما")],
    [includeAnalytics && includeStep10, t("Step 10 analytics for the same dates", "تحلیل گام ۱۰ برای همان تاریخ‌ها")],
  ];
  const shareInventory = (records.find((record) => record.type === "step10" && record.date === reportDay)
    ?? [...records].reverse().find((record) => record.type === "step10"))?.payload as Step10Data | undefined;
  const reportText = format === "summary" && shareInventory && bounds && currentAnalytics && currentAnalytics.totalEntries > 0 && !scoped.loading
    ? formatStep10SponsorReport(shareInventory, currentAnalytics, bounds, language, t)
    : "";

  async function shareReport() {
    if (!reportText || !currentAnalytics || !bounds) return;
    try {
      const result = await shareStep10Report(reportText, currentAnalytics, bounds, language, t);
      setShareMessage(result === "image" ? t("Share menu opened with the chart image and full report.", "منوی اشتراک با تصویر نمودار و گزارش کامل باز شد.")
        : result === "rich-copy" ? t("Full report and visual chart copied. Paste into a rich-text app to see the chart.", "گزارش کامل و نمودار تصویری کپی شد. برای دیدن نمودار آن را در برنامه‌ای با پشتیبانی از متن غنی جای‌گذاری کنید.")
          : t("Full report shared or copied with a text chart. Use Print / PDF for a visual chart.", "گزارش کامل با نمودار متنی به اشتراک گذاشته یا کپی شد. برای نمودار تصویری از چاپ / PDF استفاده کنید."));
    } catch (error) {
      if ((error as Error).name !== "AbortError") setShareMessage(t("Sharing was not available. Try copying the report.", "اشتراک در دسترس نبود. گزارش را کپی کنید."));
    }
  }

  async function copyReport() {
    if (!reportText || !currentAnalytics || !bounds) return;
    try {
      const copied = await copyStep10Report(reportText, currentAnalytics, bounds, language, t);
      setShareMessage(copied === "rich" ? t("Full inventory, period analytics, and visual chart copied.", "ترازنامه کامل، تحلیل بازه و نمودار تصویری کپی شد.") : t("Full inventory and analytics copied with a text chart.", "ترازنامه کامل و تحلیل همراه با نمودار متنی کپی شد."));
    } catch {
      setShareMessage(t("Copy was not available. Try Share.", "کپی در دسترس نبود. از اشتراک استفاده کنید."));
    }
  }

  return (
    <>
      {open && (
        <section className="inventory-export-panel" ref={panelRef} tabIndex={-1} aria-labelledby="inventory-export-title" onKeyDown={(event) => {
          if (event.key !== "Escape" || event.defaultPrevented) return;
          event.stopPropagation();
          closeExport();
        }}>
          <div className="inventory-export-header">
            <div className="inventory-export-icon"><Share2 size={21} /></div>
            <div><h3 id="inventory-export-title">{t("Share and export", "اشتراک و خروجی")}</h3><p>{t("Choose what to make and which dates. The preview shows what will be shared.", "انتخاب کنید چه چیزی و برای کدام تاریخ‌ها ساخته شود. پیش‌نمایش نشان می‌دهد چه چیزی به اشتراک گذاشته می‌شود.")}</p></div>
            <button className="button button-outline button-small inventory-export-close" type="button" onClick={() => closeExport()}><X size={16} aria-hidden="true" />{t("Close", "بستن")}</button>
          </div>

          <div className="inventory-export-layout">
            <div className="inventory-export-steps">
              <fieldset className="inventory-export-fieldset">
                <legend>{t("1. What do you want to make?", "۱. چه چیزی می‌خواهید بسازید؟")}</legend>
                <div className="inventory-export-format-cards" role="radiogroup">
                  {formatCards.map(([value, icon, label, hint]) => (
                    <label key={value} className={format === value ? "is-selected" : ""}><input type="radio" name="export-format" checked={format === value} onChange={() => { setFormat(value); setShareMessage(""); }} />{icon}<span><strong>{label}</strong><small>{hint}</small></span></label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="inventory-export-fieldset">
                <legend>{t("2. Which dates?", "۲. کدام تاریخ‌ها؟")}</legend>
                {format !== "archive" && <>
                  <div className="inventory-export-quick-dates">{quickPeriods.map(([label, period]) => <button key={label} type="button" className={isQuick(period) ? "button button-small is-selected" : "button button-outline button-small"} aria-pressed={isQuick(period)} onClick={() => chooseQuick(period)}>{label}</button>)}</div>
                  <ReportPeriodPicker period={exportPeriod} onChange={(next) => { setExportPeriod(next); setShareMessage(""); }} selectedDay={reportDay} id="export-report-period" />
                </>}
                {format === "archive" && <>
            <div className="inventory-export-scope" role="radiogroup">
              {([
                ["today", t("Today", "امروز")],
                ["day", t("One day", "یک روز")],
                ["week", t("Calendar week", "هفته تقویمی")],
                ["range", t("Date range", "بازه تاریخ")],
                ["month", t("Month", "ماه")],
                ["year", t("Year", "سال")],
              ] as const).map(([value, label]) => (
                <label className={scope === value ? "is-selected" : ""} key={value}><input type="radio" name="export-scope" value={value} checked={scope === value} onChange={() => setScope(value)} /><span>{label}</span></label>
              ))}
            </div>
            <div className="inventory-export-date-fields">
              {(scope === "day" || scope === "week") && <label><span>{t("Day", "روز")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={day} onChange={(event) => setDay(event.target.value)} /></label>}
              {scope === "range" && <div className="inventory-export-range"><span>{t("Date range", "بازه تاریخ")}</span><DateRangePicker id="export-archive-range" from={rangeStart} through={rangeEnd} min={firstDayOfYear(year)} max={lastDayOfYear(year)} onChange={(range) => { setRangeStart(range.from); setRangeEnd(range.through); }} /></div>}
              {scope === "month" && <label><span>{t("Month", "ماه")}</span><input type="month" min={`${year}-01`} max={`${year}-12`} value={month} onChange={(event) => setMonth(event.target.value)} /></label>}
              {scope === "year" && <div className="inventory-export-year"><span>{t("Calendar year", "سال تقویم")}</span><strong>{new Intl.NumberFormat(languageLocale(language), { useGrouping: false }).format(year)}</strong></div>}
            </div>
                </>}
              </fieldset>

          {format === "archive" && <fieldset className="inventory-export-fieldset">
            <legend>{t("Include", "شامل")}</legend>
            <div className="inventory-export-types">
              <label className={includeStep10 ? "is-selected" : ""}><input type="checkbox" checked={includeStep10} onChange={(event) => toggleType("step10", event.target.checked)} /><span><b>10</b>{t("Daily inventories", "ترازنامه‌های روزانه")}</span></label>
              <label className={includeStep4 ? "is-selected" : ""}><input type="checkbox" checked={includeStep4} onChange={(event) => toggleType("step4", event.target.checked)} /><span><b>4</b>{t("Personal inventories", "ترازنامه‌های شخصی")}</span></label>
            </div>
          </fieldset>}

              <fieldset className="inventory-export-fieldset">
                <legend>{t("3. What's included", "۳. چه چیزی شامل است")}</legend>
                <ul className="inventory-export-included">{included.map(([on, text]) => <li key={text} className={on ? "is-included" : "is-private"}>{on ? <Check size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}<span>{text}</span></li>)}</ul>
          {(format !== "archive" || includeStep10) && <div className="inventory-export-analytics-option">
            {format === "archive" && <label><input type="checkbox" checked={includeAnalytics} onChange={(event) => setIncludeAnalytics(event.target.checked)} /><span><strong>{t("Include Step 10 analytics for selected dates", "افزودن تحلیل گام ۱۰ برای تاریخ‌های انتخاب‌شده")}</strong><small>{t("The inventory chart and counts use the same dates as this export.", "نمودار ترازنامه و شمارش‌ها از همان تاریخ‌های این خروجی استفاده می‌کنند.")}</small></span></label>}
            {wantsAnalytics && (!currentAnalytics || scoped.loading) && <div className="inventory-export-analytics-status" role="status">
              <span>{scoped.loading ? t("Preparing your analytics…", "در حال آماده‌سازی تحلیل شما…") : t("Analytics are unavailable or need refreshing before this PDF can be printed.", "تحلیل در دسترس نیست یا پیش از چاپ PDF باید تازه‌سازی شود.")}</span>
              {!scoped.loading && <button className="button button-outline button-small" type="button" onClick={scoped.retry}><RefreshCw size={15} />{t("Try again", "تلاش دوباره")}</button>}
              {scoped.error && <small>{scoped.error}</small>}
            </div>}
          </div>}
              </fieldset>
            </div>

            <div className="inventory-export-preview">
              <h4>{t("Preview", "پیش‌نمایش")}</h4>
              {format === "pattern" ? (bounds && currentAnalytics && canPrint ? (
            <Step10PatternSummary analytics={currentAnalytics} bounds={bounds} view="map" onPrintClosed={closeExport} />
          ) : !scoped.loading && currentAnalytics && (
            <p role="status">{t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد.")}</p>
              )) : <>
                {format === "chart" && canPrint && <p className="export-page-badge">{t("{count} page", "{count} صفحه").replace("{count}", new Intl.NumberFormat(languageLocale(language)).format(1))}</p>}
          {format !== "pattern" && bounds && currentAnalytics && wantsAnalytics && currentAnalytics.totalEntries > 0 && (
            <div className="inventory-export-chart-preview" aria-label={t("Preview inventory chart", "پیش‌نمایش نمودار ترازنامه")}>
              <Step10ReportChart analytics={currentAnalytics} bounds={bounds} />
            </div>
          )}
                <div className="inventory-export-summary">
            {needsTodayRecords && !todayRecordsReady && <p role="status">{t("Loading today's saved inventory…", "در حال بارگذاری ترازنامه ذخیره‌شده امروز…")}</p>}
            {needsTodayRecords && todayRecordsReady && todayRecordsResult.error && <p role="alert">{t("Today's inventory could not load. Please try again.", "ترازنامه امروز بارگذاری نشد. لطفاً دوباره تلاش کنید.")} <button className="button button-outline button-small" type="button" onClick={() => setTodayRetry((value) => value + 1)}>{t("Try again", "تلاش دوباره")}</button></p>}
            <div><strong>{format !== "archive" ? currentAnalytics?.totalEntries ?? 0 : filteredRecords.length}</strong><span>{t(format !== "archive" ? "saved Step 10 inventories" : filteredRecords.length === 1 ? "saved inventory" : "saved inventories", format !== "archive" ? "ترازنامه ذخیره‌شده گام ۱۰" : "ترازنامه ذخیره‌شده")}</span></div>
            <div><strong>{format !== "archive" ? currentAnalytics?.totalPracticed ?? 0 : dateCount}</strong><span>{format !== "archive" ? t("Practiced choices", "انتخاب‌های تمرین‌شده") : t(dateCount === 1 ? "date" : "dates", "تاریخ")}</span></div>
            <p>{canPrint ? printLabel : format === "summary" ? t("Save a Step 10 inventory to create a sponsor summary.", "برای ساخت خلاصه حامی، ترازنامه گام ۱۰ را ذخیره کنید.") : format === "chart" ? t("Save a Step 10 inventory in this period to export its chart.", "برای خروجی گرفتن از نمودار، ترازنامه گام ۱۰ را در این بازه ذخیره کنید.") : t("No saved inventories match this selection.", "هیچ ترازنامه ذخیره‌شده‌ای با این انتخاب مطابقت ندارد.")}</p>
                </div>
                <div className="export-action-bar">
                  <button className="button button-primary" type="button" onClick={printExport} disabled={!canPrint}><FileDown size={17} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
                  {reportText && <button className="button button-outline" type="button" onClick={() => void shareReport()}><Share2 size={16} />{t("Share", "اشتراک")}</button>}
                  {reportText && <button className="button button-outline" type="button" onClick={() => void copyReport()}><Copy size={16} />{t("Copy as text", "کپی به‌صورت متن")}</button>}
                </div>
                {reportText && shareInventory && <p className="inventory-export-note">{t("Share and Copy as text also include your full inventory for", "اشتراک و کپی به‌صورت متن، ترازنامه کامل شما را نیز شامل می‌شود برای")} {formatDisplayDate(shareInventory.date, language)}.</p>}
                {shareMessage && <p className="inventory-export-message" role="status">{shareMessage}</p>}
              </>}
            </div>
          </div>
        </section>
      )}

      {canUseDom && open && canPrint && format !== "pattern"
        ? createPortal(
          <PrintDocument records={format === "archive" ? filteredRecords : []} scopeLabel={printLabel} analytics={open && wantsAnalytics && canPrint ? currentAnalytics : null} bounds={bounds} format={format} />,
          document.body,
        )
        : null}
    </>
  );
});
