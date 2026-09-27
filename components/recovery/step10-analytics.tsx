"use client";

import * as React from "react";
import { BarChart3, CalendarCheck2, Copy, Flame, RefreshCw, Share2, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound } from "lucide-react";
import { formatDisplayDate, principleCategories, principles, todayIso } from "@/lib/inventory";
import { calculateStep10Analytics, type PrincipleAnalytics, type Step10AnalyticsData, type Step10AnalyticsRecord } from "@/lib/step10-analytics";
import { describeStep10Pattern, formatStep10SponsorReport } from "@/lib/step10-report";
import { summarizeStep10Insights } from "@/lib/step10-insights";
import { sponsorGuidance } from "@/lib/recovery-guidance";
import { useLanguage } from "./language-provider";
import type { Step10Data } from "./step10-inventory";
import { Step10WrittenInsights } from "./step10-written-insights";

type Step10AnalyticsProps = {
  demo?: boolean;
  refreshKey?: number;
  onOpenStep10?: () => void;
  reportInventory?: Step10Data | null;
};

function dateBefore(isoDate: string, days: number): string {
  const value = new Date(`${isoDate}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

export function createDemoAnalytics(draft?: Step10Data, t: (english: string, farsi: string) => string = (english) => english): Step10AnalyticsData {
  const through = todayIso();
  const offsets = [20, 19, 18, 17, 15, 14, 13, 12, 11, 9, 8, 7, 5, 4, 3, 2, 1, 0];
  const records: Step10AnalyticsRecord[] = offsets.map((offset, entryIndex) => {
    const states = Object.fromEntries(principles.map((principle, principleIndex) => {
      const seed = entryIndex + principleIndex * 2;
      if (seed % 17 === 0) return [principle.id, "na"];
      if (principleIndex < 4) return [principle.id, seed % 7 === 0 ? "attention" : "practiced"];
      if (principleIndex >= 6 && principleIndex <= 9) return [principle.id, seed % 3 === 0 ? "practiced" : "attention"];
      return [principle.id, seed % 5 < 3 ? "practiced" : "attention"];
    }));
    const date = dateBefore(through, offset);
    if (offset === 0 && draft) return { date, payload: { ...draft, date } };
    const reflection = entryIndex === 10 || entryIndex === 14;
    return { date, payload: {
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
  return calculateStep10Analytics(records, through);
}

export function Step10Analytics({ demo = false, refreshKey = 0, onOpenStep10, reportInventory }: Step10AnalyticsProps) {
  const { language, t } = useLanguage();
  const [savedAnalytics, setAnalytics] = React.useState<Step10AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(!demo);
  const [error, setError] = React.useState("");
  const [shareMessage, setShareMessage] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);
  const locale = language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US";

  const analytics = React.useMemo(() => demo ? createDemoAnalytics(reportInventory ?? undefined, t) : savedAnalytics, [demo, reportInventory, t, savedAnalytics]);

  React.useEffect(() => {
    if (demo) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/analytics/step10?through=${encodeURIComponent(todayIso())}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json() as { analytics?: Step10AnalyticsData; error?: string };
        if (!response.ok || !result.analytics) {
          throw new Error(result.error || t("We could not load your analytics.", "نتوانستیم تحلیل شما را بارگذاری کنیم."));
        }
        setAnalytics(result.analytics);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : t("We could not load your analytics.", "نتوانستیم تحلیل شما را بارگذاری کنیم."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [demo, refreshKey, attempt, t]);

  const principleName = React.useCallback((item: PrincipleAnalytics) => {
    const principle = principles.find((candidate) => candidate.id === item.id);
    return principle?.[language] ?? item.id;
  }, [language]);

  async function shareCombinedReport() {
    if (!analytics || !reportInventory) return;
    const text = formatStep10SponsorReport(reportInventory, analytics, language, t, demo);
    try {
      if (navigator.share) {
        await navigator.share({ title: t("My Step 10 inventory and analytics", "ترازنامه و تحلیل گام دهم من"), text });
        setShareMessage(t("Share menu opened.", "منوی اشتراک باز شد."));
      } else {
        await navigator.clipboard.writeText(text);
        setShareMessage(t("Inventory and analytics copied.", "ترازنامه و تحلیل کپی شد."));
      }
    } catch (shareError) {
      if ((shareError as Error).name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(text);
          setShareMessage(t("Sharing was unavailable, so the full report was copied.", "اشتراک در دسترس نبود؛ گزارش کامل کپی شد."));
        } catch {
          setShareMessage(t("Sharing was not available. Try copying the report.", "اشتراک در دسترس نبود. گزارش را کپی کنید."));
        }
      }
    }
  }

  async function copyCombinedReport() {
    if (!analytics || !reportInventory) return;
    try {
      await navigator.clipboard.writeText(formatStep10SponsorReport(reportInventory, analytics, language, t, demo));
      setShareMessage(t("Inventory and analytics copied.", "ترازنامه و تحلیل کپی شد."));
    } catch {
      setShareMessage(t("Copy was not available. Try Share.", "کپی در دسترس نبود. از اشتراک استفاده کنید."));
    }
  }

  if (loading) {
    return (
      <section className="analytics-shell analytics-loading" data-inventory="analytics" aria-live="polite">
        <div className="analytics-spinner" aria-hidden="true"><BarChart3 size={25} /></div>
        <p>{t("Refreshing your analytics…", "در حال به‌روزرسانی تحلیل شما…")}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="analytics-shell analytics-empty" data-inventory="analytics" role="alert">
        <div className="analytics-empty-icon"><BarChart3 size={25} /></div>
        <h3>{t("We could not load your analytics.", "نتوانستیم تحلیل شما را بارگذاری کنیم.")}</h3>
        <p>{error}</p>
        <button className="button button-outline" type="button" onClick={() => setAttempt((value) => value + 1)}>
          <RefreshCw size={16} />{t("Try again", "تلاش دوباره")}
        </button>
      </section>
    );
  }

  if (!analytics || analytics.totalEntries === 0) {
    return (
      <section className="analytics-shell analytics-empty" data-inventory="analytics">
        <div className="analytics-empty-icon"><Sparkles size={25} /></div>
        <span className="analytics-eyebrow">{t("Step 10 analytics", "تحلیل گام ۱۰")}</span>
        <h3>{t("Your analytics will grow with your practice.", "تحلیل شما همراه با تمرینتان شکل می‌گیرد.")}</h3>
        <p>{t("Save your first Step 10 inventory to begin seeing patterns across time.", "اولین ترازنامه گام ۱۰ خود را ذخیره کنید تا الگوها را در طول زمان ببینید.")}</p>
        {onOpenStep10 && <button className="button button-primary" type="button" onClick={onOpenStep10}>{t("Open Step 10", "باز کردن گام ۱۰")}</button>}
      </section>
    );
  }

  const change = analytics.recentChange;
  const changeTone = change === null || Math.abs(change) < 5 ? "steady" : change > 0 ? "up" : "care";
  const currentPattern = describeStep10Pattern(analytics, t);
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
          <p>{t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} {formatDisplayDate(analytics.through, language)}</p>
        </div>
        <div className="analytics-header-actions">
          {demo && <span className="analytics-sample-badge">{t("Sample data", "داده نمونه")}</span>}
          {reportInventory ? (
            <>
              <div className="analytics-share-actions">
                <button className="button button-primary" type="button" onClick={() => void shareCombinedReport()}><Share2 size={16} />{t("Share with sponsor", "اشتراک با حامی")}</button>
                <button className="button button-outline" type="button" onClick={() => void copyCombinedReport()}><Copy size={16} />{t("Copy inventory and analytics", "کپی ترازنامه و تحلیل")}</button>
              </div>
              <p className="analytics-share-context">{t("Includes the inventory for", "شامل ترازنامه روز")} {formatDisplayDate(reportInventory.date, language)}</p>
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

      <div className="analytics-kpis">
        <article>
          <span><Target size={18} />{t("Practiced share", "سهم تمرین‌شده")}</span>
          <strong>{analytics.practiceRate}%</strong>
          <small>{t("of scored selections", "از انتخاب‌های امتیازدار")}</small>
        </article>
        <article>
          <span><CalendarCheck2 size={18} />{t("Saved inventories", "ترازنامه‌های ذخیره‌شده")}</span>
          <strong>{analytics.totalEntries}</strong>
          <small>{t("through today", "تا امروز")}</small>
        </article>
        <article>
          <span><Flame size={18} />{t("Current streak", "روند پیوسته فعلی")}</span>
          <strong>{analytics.currentStreak}</strong>
          <small>{t("days", "روز")}</small>
        </article>
      </div>

      <article className={`analytics-pattern analytics-pattern-${changeTone}`}>
        <div className="analytics-pattern-icon"><TrendingUp size={22} /></div>
        <div>
          <span>{t("Your current pattern", "الگوی فعلی شما")}</span>
          <p>{currentPattern}</p>
        </div>
        <div className="analytics-change">
          <strong>{change === null ? "—" : `${change > 0 ? "+" : ""}${change}`}</strong>
          <span>{change === null ? t("Not enough history yet", "هنوز سابقه کافی نیست") : t("percentage points", "واحد درصد")}</span>
          <small>{t("Last seven vs. previous seven", "هفت مورد اخیر در برابر هفت مورد پیشین")}</small>
        </div>
      </article>

      <section className="analytics-interpretation" aria-labelledby="analytics-interpretation-title">
        <div className="analytics-interpretation-heading">
          <h3 id="analytics-interpretation-title">{t("What your inventories show", "ترازنامه‌های شما چه نشان می‌دهند")}</h3>
          <p>{t("These patterns describe your recorded choices, not your worth or a recovery score. We look for repeated answers on at least three days; N/A and unanswered principles do not count.", "این الگوها انتخاب‌های ثبت‌شده شما را توصیف می‌کنند، نه ارزش شما یا نمره بهبودی‌تان را. ما پاسخ‌های تکرارشده در دست‌کم سه روز را بررسی می‌کنیم؛ گزینه «کاربرد ندارد» و پاسخ‌های خالی محاسبه نمی‌شوند.")}</p>
        </div>
        <div className="analytics-interpretation-grid">
          <article className="analytics-interpretation-card is-strength">
            <h4>{t("Where you are doing well", "جاهایی که خوب پیش می‌روید")}</h4>
            <p>{t("You chose Practiced more often than Needs attention for these principles.", "برای این اصول، «تمرین کردم» را بیشتر از «نیازمند توجه» انتخاب کرده‌اید.")}</p>
            {insights.strengths.length ? <ul>{insights.strengths.map((item) => (
              <li key={item.id}><strong>{principleName(item)}</strong><span>{item.practiced} {t("of", "از")} {item.answered} {t("recorded answers marked Practiced", "پاسخ ثبت‌شده با برچسب «تمرین کردم»")}</span></li>
            ))}</ul> : <p className="analytics-interpretation-empty">{insights.enoughHistory
              ? t("No repeated Practiced pattern is clear yet. Review your entries with your sponsor.", "هنوز الگوی روشنی از «تمرین کردم» دیده نمی‌شود. نوشته‌هایتان را با حامی مرور کنید.")
              : t("Save more inventories to see a repeated pattern. Discuss what you have recorded with your sponsor.", "برای دیدن الگوی تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. موارد ثبت‌شده را با حامی در میان بگذارید.")}</p>}
            {latestHighlight && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what went well", "نوشته اخیر درباره آنچه خوب پیش رفت")}</strong><time>{formatDisplayDate(latestHighlight.date, language)}</time><blockquote dir="auto">{latestHighlight.text}</blockquote></div>}
          </article>
          <article className="analytics-interpretation-card is-focus">
            <h4>{t("Where to ask for help", "جاهایی که می‌توانید کمک بخواهید")}</h4>
            <p>{t("These principles were marked Needs attention at least half of the recorded times.", "این اصول دست‌کم در نیمی از پاسخ‌های ثبت‌شده با «نیازمند توجه» مشخص شده‌اند.")}</p>
            {insights.focus.length ? <ul>{insights.focus.map((item) => (
              <li key={item.id}><strong>{principleName(item)}</strong><span>{item.attention} {t("of", "از")} {item.answered} {t("recorded answers marked Needs attention", "پاسخ ثبت‌شده با برچسب «نیازمند توجه»")}</span></li>
            ))}</ul> : <p className="analytics-interpretation-empty">{insights.enoughHistory
              ? t("Among principles answered on at least three days, none was marked Needs attention at least half the time. Bring any concerns to your sponsor anyway.", "در میان اصولی که در دست‌کم سه روز به آن‌ها پاسخ داده‌اید، هیچ‌کدام دست‌کم در نیمی از موارد «نیازمند توجه» نبوده‌اند. با این حال نگرانی‌های خود را با حامی در میان بگذارید.")
              : t("Save more inventories before looking for a recurring focus. Your sponsor can still help with today's concerns.", "پیش از جست‌وجوی تمرکز تکرارشونده، ترازنامه‌های بیشتری ذخیره کنید. حامی همچنان می‌تواند درباره نگرانی‌های امروز کمک کند.")}</p>}
            {latestConcern && <div className="analytics-interpretation-quote"><strong>{t("Recent words about what needs attention", "نوشته اخیر درباره آنچه نیازمند توجه است")}</strong><time>{formatDisplayDate(latestConcern.date, language)}</time><blockquote dir="auto">{latestConcern.text}</blockquote></div>}
          </article>
        </div>
      </section>

      <Step10WrittenInsights analytics={analytics} />

      <aside className="analytics-sponsor-note">
        <UsersRound size={23} aria-hidden="true" />
        <div><h3>{t("Review this with your sponsor", "این گزارش را با حامی مرور کنید")}</h3><p>{sponsorGuidance(t)}</p></div>
      </aside>

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
                  <div><strong>{definition?.[language] ?? category.id}</strong><span>{category.practiceRate}%</span></div>
                  <div className="analytics-progress" role="progressbar" aria-label={definition?.[language] ?? category.id} aria-valuemin={0} aria-valuemax={100} aria-valuenow={category.practiceRate}>
                    <i style={{ width: `${category.practiceRate}%` }} />
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
        <div><strong>{t("Private and non-clinical", "خصوصی و غیرپزشکی")}</strong><p>{t("This private summary organizes saved Step 10 selections and written reflections by field and selected principle. It does not interpret every nuance of your words, analyze Step 4, or provide a diagnosis or clinical assessment.", "این خلاصه خصوصی، انتخاب‌ها و بازتاب‌های نوشته‌شده ذخیره‌شده گام ۱۰ را بر اساس بخش و اصل انتخابی مرتب می‌کند. همه ظرافت‌های نوشته‌های شما را تفسیر نمی‌کند، گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی ارائه نمی‌دهد.")} {t("Future-dated inventories are not included.", "ترازنامه‌های دارای تاریخ آینده محاسبه نمی‌شوند.")}</p></div>
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
