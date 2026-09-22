"use client";

import * as React from "react";
import { BarChart3, CalendarCheck2, Flame, RefreshCw, ShieldCheck, Sparkles, Target, TrendingUp } from "lucide-react";
import { formatDisplayDate, principleCategories, principles, todayIso } from "@/lib/inventory";
import { calculateStep10Analytics, type PrincipleAnalytics, type Step10AnalyticsData, type Step10AnalyticsRecord } from "@/lib/step10-analytics";
import { useLanguage } from "./language-provider";

type Step10AnalyticsProps = {
  demo?: boolean;
  refreshKey?: number;
  onOpenStep10?: () => void;
};

function dateBefore(isoDate: string, days: number): string {
  const value = new Date(`${isoDate}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function createDemoAnalytics(): Step10AnalyticsData {
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
    return { date: dateBefore(through, offset), payload: { states } };
  });
  return calculateStep10Analytics(records, through);
}

export function Step10Analytics({ demo = false, refreshKey = 0, onOpenStep10 }: Step10AnalyticsProps) {
  const { language, t } = useLanguage();
  const [analytics, setAnalytics] = React.useState<Step10AnalyticsData | null>(() => demo ? createDemoAnalytics() : null);
  const [loading, setLoading] = React.useState(!demo);
  const [error, setError] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);
  const locale = language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US";

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
  const currentPattern = analytics.totalEntries < 3
    ? t("Save at least three Step 10 inventories to make your patterns clearer.", "برای روشن‌تر شدن الگوها، دست‌کم سه ترازنامه گام ۱۰ ذخیره کنید.")
    : change !== null && change >= 5
      ? t("Your recent entries show a stronger practiced pattern than the preceding entries.", "نوشته‌های اخیر شما نسبت به نوشته‌های پیشین، الگوی تمرین‌شده قوی‌تری نشان می‌دهند.")
      : change !== null && change <= -5
        ? t("Your recent entries show more recurring areas for attention than the preceding entries.", "نوشته‌های اخیر شما نسبت به نوشته‌های پیشین، موارد تکرارشونده بیشتری برای توجه نشان می‌دهند.")
        : t("Your recent balance is steady compared with the preceding entries.", "تعادل اخیر شما در مقایسه با نوشته‌های پیشین ثابت است.");
  const maxMonthlyEntries = Math.max(...analytics.months.map((month) => month.entries), 1);

  return (
    <section className="analytics-shell" data-inventory="analytics">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow"><BarChart3 size={15} />{t("Private pattern summary", "خلاصه خصوصی الگوها")}</span>
          <h2>{t("Step 10 analytics", "تحلیل گام ۱۰")}</h2>
          <p>{t("All saved Step 10 inventories through", "همه ترازنامه‌های ذخیره‌شده گام ۱۰ تا")} {formatDisplayDate(analytics.through, language)}</p>
        </div>
        {demo && <span className="analytics-sample-badge">{t("Sample data", "داده نمونه")}</span>}
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
        <div><strong>{t("Private and non-clinical", "خصوصی و غیرپزشکی")}</strong><p>{t("This summary uses only the principle selections in your saved Step 10 inventories. It does not analyze Step 4, and it is not a diagnosis or clinical assessment.", "این خلاصه فقط از انتخاب‌های اصول در ترازنامه‌های ذخیره‌شده گام ۱۰ شما استفاده می‌کند. گام ۴ را تحلیل نمی‌کند و تشخیص یا ارزیابی بالینی نیست.")} {t("Future-dated inventories are not included.", "ترازنامه‌های دارای تاریخ آینده محاسبه نمی‌شوند.")}</p></div>
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
