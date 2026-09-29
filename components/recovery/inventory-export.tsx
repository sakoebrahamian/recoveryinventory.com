"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarRange, FileDown, RefreshCw, X } from "lucide-react";
import { formatDisplayDate, principleCategories, principles, step4Types } from "@/lib/inventory";
import type { PrincipleAnalytics, Step10AnalyticsData } from "@/lib/step10-analytics";
import { describeStep10Pattern } from "@/lib/step10-report";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance } from "@/lib/recovery-guidance";
import { practiceForPrinciple } from "@/lib/step10-practices";
import { Step10WrittenInsights } from "./step10-written-insights";
import { Step10WeeklyInsights } from "./step10-weekly-insights";
import { useLanguage } from "./language-provider";
import type { Step10Data } from "./step10-inventory";
import type { Step4Data, Step4Entry } from "./step4-inventory";
import { ReportPeriodPicker } from "./report-period-picker";
import { Step10ReportChart } from "./step10-report-chart";
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
  open: (options?: { type?: "step10" | "step4" }) => void;
};

type ExportScope = "day" | "week" | "range" | "month" | "year";
type ExportFormat = "summary" | "archive";

type InventoryExportProps = {
  records: InventoryRecord[];
  selectedDate: string;
  year: number;
  reportPeriod: ReportPeriod;
  onReportPeriodChange: (period: ReportPeriod) => void;
  refreshKey: number;
};

const subscribeToDom = () => () => undefined;
const getClientDomSnapshot = () => true;
const getServerDomSnapshot = () => false;

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
  const answered = principles.filter((principle) => Boolean(data.states?.[principle.id]));
  const reflectionFields = [
    [t("Where I lived my principles", "جایی که بر اساس اصولم زندگی کردم"), data.highlights],
    [t("Where I still need to work", "جایی که هنوز نیاز به کار دارم"), data.attention],
    ...(data.patternAction?.trim() ? [[t("Pattern and response", "الگو و واکنش"), data.patternAction] as const] : []),
    ...(data.familyContext?.trim() ? [[t("Family impact and what I could control", "تأثیر بر خانواده و آنچه در اختیار من بود"), data.familyContext] as const] : []),
    [t("Apology or amends", "عذرخواهی یا جبران"), data.amends],
    [t("One action for tomorrow", "یک اقدام برای فردا"), data.tomorrow],
    [t("Gratitude", "قدردانی"), data.gratitude],
  ] as const;

  return (
    <>
      {answered.length > 0 ? principleCategories.map((category) => {
        const matching = answered.filter((principle) => principle.category === category.id);
        if (!matching.length) return null;
        return (
          <section className="inventory-print-section" key={category.id}>
            <h3>{language === "fa" ? category.fa : language === "es" ? category.es : category.en}</h3>
            <div className="inventory-print-principles">
              {matching.map((principle) => {
                const state = data.states[principle.id];
                const attentionNote = state === "attention" ? data.attentionNotes?.[principle.id]?.trim() : "";
                const stateLabel = state === "practiced"
                  ? t("Practiced", "تمرین کردم")
                  : state === "attention"
                    ? t("Needs attention", "نیازمند توجه")
                    : t("Not applicable", "کاربرد ندارد");
                return (
                  <div className="inventory-print-principle" key={principle.id}>
                    <span className={`inventory-print-state is-${state}`}>{stateLabel}</span>
                    <strong>{language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en}</strong>
                    <p>{language === "fa" ? principle.promptFa : language === "es" ? principle.promptEs : principle.promptEn}</p>
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
        <p className="inventory-print-empty">{t("No principle responses were recorded.", "هیچ پاسخی برای اصول ثبت نشده است.")}</p>
      )}

      <section className="inventory-print-section">
        <h3>{t("Daily reflection", "بازتاب روزانه")}</h3>
        <div className="inventory-print-reflections">
          {reflectionFields.map(([label, value]) => (
            <div key={label}>
              <strong>{label}</strong>
              <p>{value?.trim() || "—"}</p>
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
            <h3>{language === "fa" ? type.fa : language === "es" ? type.es : type.en}</h3>
            <p className="inventory-print-description">{language === "fa" ? type.descriptionFa : language === "es" ? type.descriptionEs : type.descriptionEn}</p>
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
  const locale = language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US";
  const monthLocale = language === "fa" ? "fa-IR-u-ca-gregory" : locale;
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const principleName = (item: PrincipleAnalytics) => principles.find((principle) => principle.id === item.id)?.[language] ?? item.id;
  const insights = summarizeStep10Insights(analytics);
  const latestHighlight = analytics.written.reflections.find((item) => item.field === "highlights")?.excerpts[0];
  const latestConcern = analytics.written.reflections.find((item) => item.field === "attention")?.excerpts[0];
  const daily = bounds.mode === "day";
  const fromDate = formatDisplayDate(bounds.from, language);
  const throughDate = formatDisplayDate(bounds.through, language);

  return (
    <section className={`inventory-print-analytics${brief ? " is-summary" : ""}`}>
      <header>
        <p>{t("PRIVATE PATTERN SUMMARY", "خلاصه خصوصی الگوها")}</p>
        <h2>{t("Step 10 analytics", "تحلیل گام ۱۰")}</h2>
        <span>{t("Analytics period", "بازه تحلیل")}: {fromDate}{bounds.from !== bounds.through && <> – {throughDate}</>}</span>
        <small>{brief
          ? t("Counts and a principle chart for the chosen period. Individual inventory pages are not included.", "شمارش‌ها و نمودار اصول برای بازه انتخاب‌شده. صفحه‌های ترازنامه روزانه در این خلاصه نیستند.")
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
            <div><dt>{t("Not applicable", "کاربرد ندارد")}</dt><dd>{number(analytics.totalNA)}</dd></div>
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

          {!daily && <section className="inventory-print-analytics-block">
            <h3>{t("Your current pattern", "الگوی فعلی شما")}</h3>
            <p>{describeStep10Pattern(analytics, t)}</p>
            <p>{t("Last seven vs. previous seven", "هفت مورد اخیر در برابر هفت مورد پیشین")}: {analytics.recentChange === null
              ? t("Not enough history yet", "هنوز سابقه کافی نیست")
              : `${analytics.recentChange > 0 ? "+" : ""}${number(analytics.recentChange)} ${t("percentage points", "واحد درصد")}`}</p>
          </section>}

          {!daily && <section className="inventory-print-analytics-block inventory-print-interpretation">
            <h3>{t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند")}</h3>
            <p>{t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; N/A and unanswered principles do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «کاربرد ندارد» و پاسخ‌های خالی محاسبه نمی‌شوند.")}</p>
            <div>
              {([
                [t("Where you are doing well", "جاهایی که خوب پیش می‌روید"), insights.strengths, "practiced", insights.enoughHistory
                  ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
                  : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")],
                [t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید"), insights.focus, "attention", insights.enoughHistory
                  ? t("Among principles answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان اصولی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
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
                  <strong>{principleCategories.find((item) => item.id === category.id)?.[language] ?? category.id}</strong>
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
                  <th>{new Intl.DateTimeFormat(monthLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month.month}-01T12:00:00Z`))}</th>
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
    <div className="inventory-print-root" aria-hidden="true" dir={language === "fa" ? "rtl" : "ltr"}>
      <header className="inventory-print-cover">
        <p>{format === "summary" ? t("PRIVATE SPONSOR SUMMARY", "خلاصه خصوصی برای حامی") : t("PRIVATE INVENTORY EXPORT", "خروجی خصوصی ترازنامه")}</p>
        <h1>{t("Recovery Inventory", "ترازنامه بهبودی")}</h1>
        <div><span>{scopeLabel}</span><span>{format === "summary" ? `${analytics?.totalEntries ?? 0} ${t("saved Step 10 inventories", "ترازنامه ذخیره‌شده گام ۱۰")}` : language === "es" ? `${sorted.length} ${sorted.length === 1 ? "inventario guardado" : "inventarios guardados"}` : t(`${sorted.length} saved ${sorted.length === 1 ? "inventory" : "inventories"}`, `${sorted.length} ترازنامه ذخیره‌شده`)}</span></div>
      </header>

      {format === "summary" ? null : sorted.length === 0 ? (
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
      {analytics && bounds && <Step10AnalyticsPrint analytics={analytics} bounds={bounds} scopeLabel={scopeLabel} brief={format === "summary"} />}
    </div>
  );
}

export const InventoryExport = React.forwardRef<InventoryExportHandle, InventoryExportProps>(function InventoryExport(
  { records, selectedDate, year, reportPeriod, onReportPeriodChange, refreshKey },
  ref,
) {
  const { language, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState<ExportFormat>("summary");
  const [scope, setScope] = React.useState<ExportScope>("day");
  const [day, setDay] = React.useState(selectedDate);
  const [rangeStart, setRangeStart] = React.useState(selectedDate);
  const [rangeEnd, setRangeEnd] = React.useState(selectedDate);
  const [month, setMonth] = React.useState(selectedDate.slice(0, 7));
  const [includeStep10, setIncludeStep10] = React.useState(true);
  const [includeStep4, setIncludeStep4] = React.useState(true);
  const [includeAnalytics, setIncludeAnalytics] = React.useState(true);
  const panelRef = React.useRef<HTMLElement>(null);
  const canUseDom = React.useSyncExternalStore(
    subscribeToDom,
    getClientDomSnapshot,
    getServerDomSnapshot,
  );

  React.useEffect(() => {
    document.documentElement.classList.add("inventory-export-page");
    return () => document.documentElement.classList.remove("inventory-export-page");
  }, []);

  React.useImperativeHandle(ref, () => ({
    open: (options) => {
      setFormat(options?.type === "step4" ? "archive" : "summary");
      setScope("day");
      setDay(selectedDate);
      setRangeStart(selectedDate);
      setRangeEnd(selectedDate);
      setMonth(selectedDate.slice(0, 7));
      setIncludeStep10(options?.type ? options.type === "step10" : true);
      setIncludeStep4(options?.type ? options.type === "step4" : true);
      setIncludeAnalytics(true);
      setOpen(true);
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    },
  }), [selectedDate]);

  const archivePeriod: ReportPeriod = {
    mode: scope,
    from: rangeStart <= rangeEnd ? rangeStart : rangeEnd,
    through: rangeStart <= rangeEnd ? rangeEnd : rangeStart,
  };
  const archiveDay = scope === "month" ? `${month}-01` : scope === "year" ? firstDayOfYear(year) : day;
  const rawBounds = reportBounds(format === "summary" ? reportPeriod : archivePeriod, format === "summary" ? selectedDate : archiveDay);
  const archiveFrom = rawBounds && rawBounds.from < firstDayOfYear(year) ? firstDayOfYear(year) : rawBounds?.from;
  const archiveThrough = rawBounds && rawBounds.through > lastDayOfYear(year) ? lastDayOfYear(year) : rawBounds?.through;
  const bounds = rawBounds && format === "archive"
    ? archiveFrom && archiveThrough && archiveFrom <= archiveThrough ? { ...rawBounds, from: archiveFrom, through: archiveThrough } : null
    : rawBounds;
  const scoped = useReportAnalytics(bounds, open && Boolean(bounds) && (format === "summary" || (includeAnalytics && includeStep10)), refreshKey);

  const filteredRecords = (() => {
    const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
    return records.filter((record) => {
      const includedType = (record.type === "step10" && includeStep10) || (record.type === "step4" && includeStep4);
      if (!includedType) return false;
      if (scope === "day") return record.date === day;
      if (scope === "week") return Boolean(bounds && record.date >= bounds.from && record.date <= bounds.through);
      if (scope === "range") return record.date >= start && record.date <= end;
      if (scope === "month") return record.date.startsWith(`${month}-`);
      return record.date.startsWith(`${String(year).padStart(4, "0")}-`);
    });
  })();

  const scopeLabel = (() => {
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
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
      return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(monthYear, monthNumber - 1, 1)));
    }
    return new Intl.NumberFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { useGrouping: false }).format(year);
  })();

  const dateCount = new Set(filteredRecords.map((record) => record.date)).size;
  const wantsAnalytics = format === "summary" || (includeAnalytics && includeStep10 && filteredRecords.some((record) => record.type === "step10"));
  const currentAnalytics = scoped.analytics;
  const canPrint = format === "summary"
    ? Boolean(bounds && currentAnalytics && currentAnalytics.totalEntries > 0 && !scoped.loading)
    : filteredRecords.length > 0 && (includeStep10 || includeStep4) && Boolean(bounds) && (!wantsAnalytics || Boolean(currentAnalytics && !scoped.loading));
  const printLabel = format === "summary"
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
    const originalTitle = document.title;
    document.title = `${t("Recovery Inventory", "ترازنامه بهبودی")} - ${printLabel}`;
    const restoreTitle = () => { document.title = originalTitle; };
    window.addEventListener("afterprint", restoreTitle, { once: true });
    window.print();
  }

  return (
    <>
      {open && (
        <section className="inventory-export-panel" ref={panelRef} aria-labelledby="inventory-export-title">
          <div className="inventory-export-header">
            <div className="inventory-export-icon"><CalendarRange size={21} /></div>
            <div><h3 id="inventory-export-title">{t("Export saved inventories", "خروجی گرفتن از ترازنامه‌های ذخیره‌شده")}</h3><p>{t("Choose exactly what should appear in the printout or PDF.", "دقیقاً انتخاب کنید چه چیزی در نسخه چاپی یا PDF نمایش داده شود.")}</p></div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label={t("Close export options", "بستن گزینه‌های خروجی")}><X size={18} /></button>
          </div>

          <fieldset className="inventory-export-fieldset">
            <legend>{t("Report format", "قالب گزارش")}</legend>
            <div className="inventory-export-scope inventory-export-format" role="radiogroup">
              <label className={format === "summary" ? "is-selected" : ""}><input type="radio" name="export-format" checked={format === "summary"} onChange={() => setFormat("summary")} /><span>{t("Sponsor summary", "خلاصه برای حامی")}</span></label>
              <label className={format === "archive" ? "is-selected" : ""}><input type="radio" name="export-format" checked={format === "archive"} onChange={() => setFormat("archive")} /><span>{t("Full journal", "دفتر کامل")}</span></label>
            </div>
            <p className="inventory-export-format-help">{format === "summary"
              ? t("Counts and principle chart for the selected day by default. Choose a week, month, year, or custom range for a broader sponsor summary without individual daily pages.", "شمارش‌ها و نمودار اصول به‌طور پیش‌فرض برای روز انتخاب‌شده‌اند. برای خلاصه گسترده‌تر حامی بدون صفحه‌های روزانه، هفته، ماه، سال یا بازه دلخواه را انتخاب کنید.")
              : t("Print every saved inventory in the selected dates, with complete daily writing. You can include Step 10 analytics for those same dates.", "همه ترازنامه‌های ذخیره‌شده در تاریخ‌های انتخابی را با نوشته‌های کامل روزانه چاپ کنید. می‌توانید تحلیل گام ۱۰ را برای همان تاریخ‌ها اضافه کنید.")}</p>
          </fieldset>

          {format === "summary" && <ReportPeriodPicker period={reportPeriod} onChange={onReportPeriodChange} selectedDay={selectedDate} id="export-report-period" />}

          {format === "archive" && <fieldset className="inventory-export-fieldset">
            <legend>{t("Date selection", "انتخاب تاریخ")}</legend>
            <div className="inventory-export-scope" role="radiogroup">
              {([
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
              {scope === "range" && <><label><span>{t("From", "از")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} /></label><label><span>{t("Through", "تا")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} /></label></>}
              {scope === "month" && <label><span>{t("Month", "ماه")}</span><input type="month" min={`${year}-01`} max={`${year}-12`} value={month} onChange={(event) => setMonth(event.target.value)} /></label>}
              {scope === "year" && <div className="inventory-export-year"><span>{t("Calendar year", "سال تقویم")}</span><strong>{new Intl.NumberFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { useGrouping: false }).format(year)}</strong></div>}
            </div>
          </fieldset>}

          {format === "archive" && <fieldset className="inventory-export-fieldset">
            <legend>{t("Include", "شامل")}</legend>
            <div className="inventory-export-types">
              <label className={includeStep10 ? "is-selected" : ""}><input type="checkbox" checked={includeStep10} onChange={(event) => toggleType("step10", event.target.checked)} /><span><b>10</b>{t("Daily inventories", "ترازنامه‌های روزانه")}</span></label>
              <label className={includeStep4 ? "is-selected" : ""}><input type="checkbox" checked={includeStep4} onChange={(event) => toggleType("step4", event.target.checked)} /><span><b>4</b>{t("Personal inventories", "ترازنامه‌های شخصی")}</span></label>
            </div>
          </fieldset>}

          {(format === "summary" || includeStep10) && <div className="inventory-export-analytics-option">
            {format === "archive" && <label><input type="checkbox" checked={includeAnalytics} onChange={(event) => setIncludeAnalytics(event.target.checked)} /><span><strong>{t("Include Step 10 analytics for selected dates", "افزودن تحلیل گام ۱۰ برای تاریخ‌های انتخاب‌شده")}</strong><small>{t("The principle chart and counts use the same dates as this export.", "نمودار اصول و شمارش‌ها از همان تاریخ‌های این خروجی استفاده می‌کنند.")}</small></span></label>}
            {wantsAnalytics && (!currentAnalytics || scoped.loading) && <div className="inventory-export-analytics-status" role="status">
              <span>{scoped.loading ? t("Preparing your analytics…", "در حال آماده‌سازی تحلیل شما…") : t("Analytics are unavailable or need refreshing before this PDF can be printed.", "تحلیل در دسترس نیست یا پیش از چاپ PDF باید تازه‌سازی شود.")}</span>
              {!scoped.loading && <button className="button button-outline button-small" type="button" onClick={scoped.retry}><RefreshCw size={15} />{t("Try again", "تلاش دوباره")}</button>}
              {scoped.error && <small>{scoped.error}</small>}
            </div>}
          </div>}

          <div className="inventory-export-summary">
            <div><strong>{format === "summary" ? currentAnalytics?.totalEntries ?? 0 : filteredRecords.length}</strong><span>{t(format === "summary" ? "saved Step 10 inventories" : filteredRecords.length === 1 ? "saved inventory" : "saved inventories", format === "summary" ? "ترازنامه ذخیره‌شده گام ۱۰" : "ترازنامه ذخیره‌شده")}</span></div>
            <div><strong>{format === "summary" ? currentAnalytics?.totalPracticed ?? 0 : dateCount}</strong><span>{format === "summary" ? t("Practiced choices", "انتخاب‌های تمرین‌شده") : t(dateCount === 1 ? "date" : "dates", "تاریخ")}</span></div>
            <p>{canPrint ? printLabel : format === "summary" ? t("Save a Step 10 inventory to create a sponsor summary.", "برای ساخت خلاصه حامی، ترازنامه گام ۱۰ را ذخیره کنید.") : t("No saved inventories match this selection.", "هیچ ترازنامه ذخیره‌شده‌ای با این انتخاب مطابقت ندارد.")}</p>
            <button className="button button-primary" type="button" onClick={printExport} disabled={!canPrint}><FileDown size={17} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
          </div>
        </section>
      )}

      {canUseDom
        ? createPortal(
          <PrintDocument records={format === "summary" ? [] : filteredRecords} scopeLabel={printLabel} analytics={open && wantsAnalytics && canPrint ? currentAnalytics : null} bounds={bounds} format={format} />,
          document.body,
        )
        : null}
    </>
  );
});
