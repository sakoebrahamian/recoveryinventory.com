"use client";

import * as React from "react";
import { BarChart3, CalendarCheck2, Copy, FileDown, Flame, RefreshCw, Share2, ShieldCheck, Target, UsersRound } from "lucide-react";
import { formatDisplayDate, principleCategories, step10Questions, step10QuestionSetVersion, questionWithPrinciple, todayIso } from "@/lib/inventory";
import { calculateStep10Analytics, calculateStep10PeriodAnalytics, type PrincipleAnalytics, type Step10AnalyticsData, type Step10AnalyticsRecord } from "@/lib/step10-analytics";
import { formatStep10SponsorReport } from "@/lib/step10-report";
import { copyStep10Report, shareStep10Report } from "@/lib/step10-share";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { Step10AnalyticsDetail, Step10PeriodComparison } from "./step10-analytics-detail";
import { sponsorGuidance } from "@/lib/recovery-guidance";
import { useLanguage } from "./language-provider";
import type { Step10Data } from "./step10-inventory";
import { Step10PatternSummary } from "./step10-pattern-summary";
import { Step10PatternVisual } from "./step10-pattern-visual";
import { Step10WeeklyInsights } from "./step10-weekly-insights";
import { ReportPeriodPicker } from "./report-period-picker";
import { Step10ReportChart } from "./step10-report-chart";
import { useReportAnalytics } from "./use-report-analytics";
import { defaultReportPeriod, reportBounds, type ReportPeriod, type ReportPeriodMode } from "@/lib/step10-report-period";

type Step10AnalyticsProps = {
  demo?: boolean;
  selectedDay?: string;
  onOpenDate?: (date: string) => void;
  refreshKey?: number;
  onOpenStep10?: () => void;
  reportInventory?: Step10Data | null;
  reportPeriod?: ReportPeriod;
  onReportPeriodChange?: (period: ReportPeriod) => void;
  onExportChart?: (day: string) => void;
};

function dateBefore(isoDate: string, days: number): string {
  const value = new Date(`${isoDate}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

export function createDemoAnalytics(draft?: Step10Data, t: (english: string, farsi: string) => string = (english) => english, from?: string, through = todayIso(), mode: ReportPeriodMode = "range"): Step10AnalyticsData {
  const offsets = Array.from({ length: 180 }, (_, index) => 179 - index).filter((offset) => offset % 6 !== 3);
  const records: Step10AnalyticsRecord[] = offsets.map((offset, entryIndex) => {
    const states = Object.fromEntries(step10Questions.map((principle, principleIndex) => {
      const seed = entryIndex + principleIndex * 2;
      if (seed % 17 === 0) return [principle.id, "na"];
      if (principleIndex < 4) return [principle.id, seed % 7 === 0 ? "attention" : "practiced"];
      if (principleIndex >= 6 && principleIndex <= 9) return [principle.id, seed % 3 === 0 ? "practiced" : "attention"];
      return [principle.id, seed % 5 < 3 ? "practiced" : "attention"];
    }));
    const date = dateBefore(todayIso(), offset);
    const reflection = entryIndex % 5 === 0;
    return { date, payload: {
      questionSetVersion: step10QuestionSetVersion,
      states,
      ...(reflection ? {
        attentionNotes: {
          ...(states.patience === "attention" ? { patience: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم.") } : {}),
          ...(states.acceptance === "attention" ? { acceptance: t("I worried about an outcome I could not control.", "نگران نتیجه‌ای بودم که در اختیارم نبود.") } : {}),
        },
        highlights: t("I paused before answering a difficult message and asked for help when I needed it.", "پیش از پاسخ به یک پیام دشوار مکث کردم و وقتی نیاز داشتم کمک خواستم."),
        attention: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم."),
        patternAction: t("I noticed I was trying to control the outcome and took a pause.", "متوجه شدم می‌خواهم نتیجه را کنترل کنم و مکث کردم."),
        familyContext: t("I listened to a family member and focused on my own response.", "به یکی از اعضای خانواده گوش دادم و بر پاسخ خودم تمرکز کردم."),
        amends: t("I can acknowledge that my tone was sharp.", "می‌توانم بپذیرم که لحنم تند بود."),
        tomorrow: t("Pause, breathe, and listen before responding.", "پیش از پاسخ دادن مکث کنم، نفس بکشم و گوش بدهم."),
        gratitude: t("A clear conversation and a quiet walk.", "یک گفت‌وگوی روشن و یک پیاده‌روی آرام."),
      } : {}),
    } };
  });
  const sampleRecords = draft && draft.date <= todayIso()
    ? [...records.filter((record) => record.date !== draft.date), { date: draft.date, payload: draft }]
    : records;
  return from ? calculateStep10PeriodAnalytics(sampleRecords, { from, through, mode }) : calculateStep10Analytics(sampleRecords, through);
}

export function Step10Analytics({ demo = false, selectedDay, onOpenDate, refreshKey = 0, onOpenStep10, reportInventory, reportPeriod, onReportPeriodChange, onExportChart }: Step10AnalyticsProps) {
  const { language, t } = useLanguage();
  const [shareMessage, setShareMessage] = React.useState("");
  const [chartOpen, setChartOpen] = React.useState(false);
  const anchorDay = selectedDay ?? reportInventory?.date ?? todayIso();
  const [localReportPeriod, setLocalReportPeriod] = React.useState<ReportPeriod>(() => ({ ...defaultReportPeriod(anchorDay), mode: "month" }));
  const period = reportPeriod ?? localReportPeriod;
  const setPeriod = onReportPeriodChange ?? setLocalReportPeriod;
  const choosePeriod = (next: ReportPeriod) => { setPeriod(next); setShareMessage(""); };
  const bounds = reportBounds(period, anchorDay);
  const scoped = useReportAnalytics(bounds, !demo && Boolean(bounds), refreshKey);
  const reportAnalytics = React.useMemo(() => demo && bounds ? createDemoAnalytics(reportInventory ?? undefined, t, bounds.from, bounds.through, bounds.mode) : scoped.analytics, [demo, reportInventory, t, bounds?.from, bounds?.through, bounds?.mode, scoped.analytics]);
  const analytics = reportAnalytics;
  const loading = !demo && scoped.loading;
  const error = scoped.error;
  const draftDay = false;
  const locale = language === "fa" ? "fa-IR-u-ca-gregory" : language === "es" ? "es-US" : "en-US";

  const principleName = React.useCallback((item: PrincipleAnalytics) => {
    return questionWithPrinciple(item.id, language);
  }, [language]);

  async function shareCombinedReport() {
    if (!reportAnalytics || !reportInventory || !bounds) { setShareMessage(t("Choose a valid analytics period and wait for the report to load.", "بازه تحلیل معتبری انتخاب کنید و منتظر بارگذاری گزارش بمانید.")); return; }
    const text = formatStep10SponsorReport(reportInventory, reportAnalytics, bounds, language, t, demo);
    try {
      const result = await shareStep10Report(text, reportAnalytics, bounds, language, t);
      setShareMessage(result === "image" ? t("Share menu opened with the chart image and full report.", "منوی اشتراک با تصویر نمودار و گزارش کامل باز شد.")
        : result === "rich-copy" ? t("Full report and visual chart copied. Paste into a rich-text app to see the chart.", "گزارش کامل و نمودار تصویری کپی شد. برای دیدن نمودار آن را در برنامه‌ای با پشتیبانی از متن غنی جای‌گذاری کنید.")
          : t("Full report shared or copied with a text chart. Use Print / PDF for a visual chart.", "گزارش کامل با نمودار متنی به اشتراک گذاشته یا کپی شد. برای نمودار تصویری از چاپ / PDF استفاده کنید."));
    } catch (shareError) {
      if ((shareError as Error).name !== "AbortError") {
        try {
          const copied = await copyStep10Report(text, reportAnalytics, bounds, language, t);
          setShareMessage(copied === "rich" ? t("Sharing was unavailable; full report and visual chart copied.", "اشتراک در دسترس نبود؛ گزارش کامل و نمودار تصویری کپی شد.") : t("Sharing was unavailable, so the full report was copied with a text chart.", "اشتراک در دسترس نبود؛ گزارش کامل با نمودار متنی کپی شد."));
        } catch {
          setShareMessage(t("Sharing was not available. Try copying the report.", "اشتراک در دسترس نبود. گزارش را کپی کنید."));
        }
      }
    }
  }

  async function copyCombinedReport() {
    if (!reportAnalytics || !reportInventory || !bounds) { setShareMessage(t("Choose a valid analytics period and wait for the report to load.", "بازه تحلیل معتبری انتخاب کنید و منتظر بارگذاری گزارش بمانید.")); return; }
    try {
      const text = formatStep10SponsorReport(reportInventory, reportAnalytics, bounds, language, t, demo);
      const copied = await copyStep10Report(text, reportAnalytics, bounds, language, t);
      setShareMessage(copied === "rich" ? t("Full inventory, period analytics, and visual chart copied.", "ترازنامه کامل، تحلیل بازه و نمودار تصویری کپی شد.") : t("Full inventory and analytics copied with a text chart.", "ترازنامه کامل و تحلیل همراه با نمودار متنی کپی شد."));
    } catch {
      setShareMessage(t("Copy was not available. Try Share.", "کپی در دسترس نبود. از اشتراک استفاده کنید."));
    }
  }

  const controls = <ReportPeriodPicker period={period} onChange={choosePeriod} selectedDay={anchorDay} id="analytics-report-period" />;
  if (!bounds || loading || error || !analytics) return <section className="analytics-shell analytics-empty" data-inventory="analytics">
    <h2>{t("Step 10 analytics", "تحلیل گام ۱۰")}</h2>{controls}
    <p role={error ? "alert" : "status"}>{error ? t("We could not load your analytics.", "نتوانستیم تحلیل شما را بارگذاری کنیم.") : loading ? t("Refreshing your analytics…", "در حال به‌روزرسانی تحلیل شما…") : t("Choose a valid date range ending today or earlier.", "بازه تاریخی معتبری انتخاب کنید که تا امروز یا پیش از آن پایان یابد.")}</p>
    {error && <button className="button button-outline" type="button" onClick={scoped.retry}>{t("Try again", "تلاش دوباره")}</button>}
  </section>;

  const insights = summarizeStep10Insights(analytics);
  const latestHighlight = analytics.written.reflections.find((item) => item.field === "highlights")?.excerpts[0];
  const latestConcern = analytics.written.reflections.find((item) => item.field === "attention")?.excerpts[0];
  const maxMonthlyEntries = Math.max(...analytics.months.map((month) => month.entries), 1);

  return (
    <section className="analytics-shell" data-inventory="analytics">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow"><BarChart3 size={15} />{t("Private pattern summary", "خلاصه خصوصی الگوها")}</span>
          <h2>{t("Step 10 analytics", "تحلیل گام ۱۰")}</h2>
          <p>{t("Every summary below follows the selected dates and saved inventories only.", "همه خلاصه‌های زیر فقط از تاریخ‌های انتخاب‌شده و ترازنامه‌های ذخیره‌شده استفاده می‌کنند.")}</p>
        </div>
        <div className="analytics-header-actions">
          {controls}<button type="button" className="button button-outline button-small" onClick={() => choosePeriod({ mode: "range", from: dateBefore(todayIso(), 29), through: todayIso() })}>{t("Last 30 days", "۳۰ روز گذشته")}</button>{demo && <span className="analytics-sample-badge">{t("Sample data", "داده نمونه")}</span>}
          {reportInventory ? (
            <>

              {!draftDay && !demo && <p className="analytics-share-context">{t("Range analytics count saved entries only. Save changes before sharing if you want them counted.", "تحلیل بازه فقط نوشته‌های ذخیره‌شده را می‌شمارد. اگر می‌خواهید تغییرات محاسبه شوند، پیش از اشتراک ذخیره کنید.")}</p>}
              {scoped.loading && <p className="analytics-share-context">{t("Preparing analytics for sharing…", "در حال آماده‌سازی تحلیل برای اشتراک…")}</p>}
              {scoped.error && <button className="button button-outline button-small" type="button" onClick={scoped.retry}><RefreshCw size={16} />{t("Retry analytics", "تلاش دوباره برای تحلیل")}</button>}
              <div className="analytics-share-actions">
                <button className="button button-primary" type="button" onClick={() => void shareCombinedReport()}><Share2 size={16} />{t("Share with sponsor", "اشتراک با حامی")}</button>
                <button className="button button-outline" type="button" onClick={() => void copyCombinedReport()}><Copy size={16} />{t("Copy inventory and analytics", "کپی ترازنامه و تحلیل")}</button>
                {onExportChart && <button className="button button-outline" type="button" onClick={() => onExportChart(reportInventory.date)}><FileDown size={16} />{t("Export chart only", "خروجی فقط نمودار")}</button>}
              </div>
              <p className="analytics-share-context">{t("Includes the inventory for", "شامل ترازنامه روز")} {formatDisplayDate(reportInventory.date, language)}. {t("The chart and analytics use the chosen period.", "نمودار و تحلیل از بازه انتخاب‌شده استفاده می‌کنند.")}</p>
            </>
          ) : (
            <>
              <p className="analytics-share-context">{t("Choose a saved Step 10 day to share it with analytics.", "برای اشتراک همراه با تحلیل، یک روز ذخیره‌شده گام دهم را انتخاب کنید.")}</p>
              {onOpenStep10 && <button className="button button-outline button-small" type="button" onClick={onOpenStep10}>{t("Open Step 10", "باز کردن گام ۱۰")}</button>}
            </>
          )}
          {shareMessage && <p className="analytics-share-message" role="status">{shareMessage}</p>}
        </div>
      </header>

      {bounds && reportAnalytics && <div className="analytics-report-preview">
        <details className="step10-report-preview" open={chartOpen} onToggle={(event) => setChartOpen(event.currentTarget.open)}><summary>{t("Preview inventory chart", "پیش‌نمایش نمودار ترازنامه")}</summary><Step10ReportChart analytics={reportAnalytics} bounds={bounds} /></details>
      </div>}

      <div className="analytics-kpis">
        <article>
          <span><Target size={18} />{t("Practiced share", "سهم تمرین‌شده")}</span>
          <strong>{analytics.totalAnswered ? `${analytics.practiceRate}%` : "—"}</strong>
          <small>{analytics.totalPracticed}/{analytics.totalAnswered} {t("answers marked Practiced", "پاسخ با برچسب تمرین کردم")}</small>
        </article>
        <article>
          <span><CalendarCheck2 size={18} />{t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}</span>
          <strong>{analytics.totalEntries}</strong>
          <small>{t("in selected period", "در بازه انتخاب‌شده")}</small>
        </article>
        <article>
          <span><Flame size={18} />{t("Days with writing", "روزهای دارای نوشته")}</span>
          <strong>{analytics.days.filter((day) => Object.keys(day.reflections).length > 0 || day.questionIds.some((id) => day.states[id] === "attention" && day.notes[id]?.trim())).length}</strong>
          <small>{t("days", "روز")}</small>
        </article>
      </div>

      <Step10PatternSummary key={`summary:${bounds.from}:${bounds.through}`} analytics={analytics} bounds={bounds} demo={demo} />
      <Step10PatternVisual key={`patterns:${bounds.from}:${bounds.through}`} analytics={analytics} bounds={bounds} onOpenDate={onOpenDate} />
      <Step10PeriodComparison analytics={analytics} bounds={bounds} />
      {!analytics.totalEntries && <p className="analytics-data-note">{t("No saved Step 10 inventories in this period.", "هیچ ترازنامه ذخیره‌شده گام ۱۰ در این بازه وجود ندارد.")}</p>}

      <section className="analytics-interpretation" aria-labelledby="analytics-interpretation-title">
        <div className="analytics-interpretation-heading">
          <h3 id="analytics-interpretation-title">{t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند")}</h3>
          <p>{t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; Didn’t come up today and unanswered questions do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «امروز پیش نیامد» و پاسخ‌های خالی محاسبه نمی‌شوند.")}</p>
        </div>
        <div className="analytics-interpretation-grid">
          <article className="analytics-interpretation-card is-strength">
            <h4>{t("Where you are doing well", "جاهایی که خوب پیش می‌روید")}</h4>
            <p>{t("You chose Practiced more often than Needs attention for these questions.", "برای این پرسش‌ها، «تمرین کردم» را بیشتر از «نیازمند توجه» انتخاب کرده‌اید.")}</p>
            {insights.strengths.length ? <ul>{insights.strengths.map((item) => (
              <li key={item.id}><strong>{principleName(item)}</strong><span>{item.practiced} {t("of", "از")} {item.answered} {t("recorded answers marked Practiced", "پاسخ ثبت‌شده با برچسب «تمرین کردم»")}</span></li>
            ))}</ul> : <p className="analytics-interpretation-empty">{insights.enoughHistory
              ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
              : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")}</p>}
            {latestHighlight && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what went well", "نوشته اخیر درباره آنچه خوب پیش رفت")}</strong><time>{formatDisplayDate(latestHighlight.date, language)}</time><blockquote dir="auto">{latestHighlight.text}</blockquote></div>}
          </article>
          <article className="analytics-interpretation-card is-focus">
            <h4>{t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید")}</h4>
            <p>{t("These questions were marked Needs attention at least half of the recorded times.", "این پرسش‌ها دست‌کم در نیمی از پاسخ‌های ثبت‌شده با «نیازمند توجه» مشخص شده‌اند.")}</p>
            {insights.focus.length ? <ul>{insights.focus.map((item) => (
              <li key={item.id}><strong>{principleName(item)}</strong><span>{item.attention} {t("of", "از")} {item.answered} {t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»")}</span></li>
            ))}</ul> : <p className="analytics-interpretation-empty">{insights.enoughHistory
              ? t("Among questions answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان پرسش‌هایی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
              : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")}</p>}
            {latestConcern && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what needs attention", "نوشته اخیر درباره آنچه نیازمند توجه است")}</strong><time>{formatDisplayDate(latestConcern.date, language)}</time><blockquote dir="auto">{latestConcern.text}</blockquote></div>}
          </article>
        </div>
      </section>

      <details className="analytics-weekly-details">
        <summary>{t("View recent weekly writing", "نمایش نوشته‌های هفتگی اخیر")} <span>({analytics.weekly.length})</span></summary>
        <Step10WeeklyInsights analytics={analytics} />
      </details>

      <aside className="analytics-sponsor-note">
        <UsersRound size={23} aria-hidden="true" />
        <div><h3>{t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}</h3><p>{sponsorGuidance(t)}</p></div>
      </aside>

      <Step10AnalyticsDetail key={`${bounds.from}:${bounds.through}:${bounds.mode}`} analytics={analytics} bounds={bounds} demo={demo} onOpenDate={onOpenDate} />

      <div className="analytics-insight-grid">
        <AnalyticsPrincipleList
          title={t("Practiced most often", "بیشترین تمرین")}
          description={t("Based on the number of saved entries marked Practiced.", "بر اساس تعداد نوشته‌های ذخیره‌شده با برچسب تمرین‌شده.")}
          items={analytics.topPracticed}
          getName={principleName}
          countLabel={t("practiced", "تمرین‌شده")}
          tone="good"
          emptyLabel={t("No pattern yet", "هنوز الگویی وجود ندارد")}
        />
        <AnalyticsPrincipleList
          title={t("Recurring focus", "تمرکز تکرارشونده")}
          description={t("Based on the number of saved entries marked Needs attention.", "بر اساس تعداد نوشته‌های ذخیره‌شده با برچسب نیازمند توجه.")}
          items={analytics.topAttention}
          getName={principleName}
          countLabel={t("needs attention", "نیازمند توجه")}
          tone="care"
          emptyLabel={t("No pattern yet", "هنوز الگویی وجود ندارد")}
        />
      </div>

      <div className="analytics-detail-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-heading">
            <div><h3>{t("Practice by area", "تمرین بر اساس حوزه")}</h3><p>{t("Practiced as a share of Practiced and Needs attention selections.", "سهم تمرین‌شده از مجموع انتخاب‌های تمرین‌شده و نیازمند توجه.")}</p></div>
          </div>
          <div className="analytics-category-list">
            {analytics.categories.map((category) => {
              const definition = principleCategories.find((candidate) => candidate.id === category.id);
              return (
                <div key={category.id}>
                  <div><strong>{definition?.[language] ?? category.id}</strong><span>{category.answered ? `${category.practiceRate}%` : "—"}</span></div>
                  <div className="analytics-progress" role="progressbar" aria-label={definition?.[language] ?? category.id} aria-valuemin={0} aria-valuemax={100} aria-valuenow={category.practiceRate}>
                    <i style={{ width: `${category.answered ? `${category.practiceRate}%` : "—"}` }} />
                  </div>
                  <small>{category.answered} {t("scored selections", "انتخاب امتیازدار")}</small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="analytics-panel analytics-activity-panel">
          <div className="analytics-panel-heading"><div><h3>{t("Activity over time", "فعالیت در طول زمان")}</h3><p>{t("Saved Step 10 inventories by month.", "ترازنامه‌های ذخیره‌شده گام ۱۰ بر اساس ماه.")}</p></div></div>
          <div className="analytics-months">
            {analytics.months.map((month) => {
              const monthLabel = new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${month.month}-01T12:00:00Z`));
              const height = Math.max(12, Math.round((month.entries / maxMonthlyEntries) * 100));
              return (
                <div key={month.month} title={`${monthLabel}: ${month.entries}`}>
                  <span>{month.entries}</span>
                  <div><i style={{ height: `${height}%` }} /></div>
                  <small>{monthLabel}</small>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <footer className="analytics-privacy-note">
        <ShieldCheck size={20} />
        <div><strong>{t("Private and non-clinical", "خصوصی و غیرپزشکی")}</strong><p>{t("This private summary counts saved Step 10 selections within the selected dates and shows your own writing. It does not interpret every nuance of your words, analyze Step 4, or provide a diagnosis or clinical assessment.", "این خلاصه خصوصی انتخاب‌های ذخیره‌شده گام ۱۰ در تاریخ‌های انتخاب‌شده و نوشته‌های خودتان را نشان می‌دهد. همه ظرافت‌های نوشته‌های شما را تفسیر نمی‌کند، گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی ارائه نمی‌دهد.")} {t("Future-dated inventories are not included.", "ترازنامه‌های دارای تاریخ آینده محاسبه نمی‌شوند.")}</p></div>
      </footer>
    </section>
  );
}

function AnalyticsPrincipleList({
  title,
  description,
  items,
  getName,
  countLabel,
  tone,
  emptyLabel,
}: {
  title: string;
  description: string;
  items: PrincipleAnalytics[];
  getName: (item: PrincipleAnalytics) => string;
  countLabel: string;
  tone: "good" | "care";
  emptyLabel: string;
}) {
  return (
    <article className={`analytics-panel analytics-principles analytics-principles-${tone}`}>
      <div className="analytics-panel-heading"><div><h3>{title}</h3><p>{description}</p></div></div>
      {items.length > 0 ? (
        <ol>
          {items.map((item, index) => (
            <li key={item.id}>
              <span>{index + 1}</span>
              <div><strong>{getName(item)}</strong><small>{item[tone === "good" ? "practiced" : "attention"]} {countLabel}</small></div>
              <b>{tone === "good" ? item.practiceRate : 100 - item.practiceRate}%</b>
            </li>
          ))}
        </ol>
      ) : <p className="analytics-no-pattern">{emptyLabel}</p>}
    </article>
  );
}
