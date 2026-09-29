"use client";

import * as React from "react";
import { BarChart3, BookOpenText, Copy, FileDown, MoreHorizontal, RotateCcw, Save, Share2 } from "lucide-react";
import {
  formatDisplayDate,
  principleCategories,
  principles,
  type PrincipleState,
  todayIso,
} from "@/lib/inventory";
import { calculateStep10Analytics } from "@/lib/step10-analytics";
import { formatStep10SponsorReport } from "@/lib/step10-report";
import { copyStep10Report, shareStep10Report } from "@/lib/step10-share";
import { defaultReportPeriod, reportBounds, type ReportPeriod } from "@/lib/step10-report-period";
import { useLanguage } from "./language-provider";
import { ReportPeriodPicker } from "./report-period-picker";
import { Step10ReportChart } from "./step10-report-chart";
import { createDemoAnalytics } from "./step10-analytics";
import { useReportAnalytics } from "./use-report-analytics";

type Step10Data = {
  date: string;
  mood: string;
  states: Record<string, PrincipleState | undefined>;
  attentionNotes: Record<string, string | undefined>;
  highlights: string;
  attention: string;
  patternAction: string;
  familyContext: string;
  amends: string;
  tomorrow: string;
  gratitude: string;
};

type Step10InventoryProps = {
  demo?: boolean;
  initialData?: Partial<Step10Data>;
  onSave?: (data: Step10Data) => Promise<void> | void;
  onExport?: () => void;
  onExportChart?: () => void;
  onOpenLearning?: () => void;
  onChange?: (data: Step10Data) => void;
  reportPeriod?: ReportPeriod;
  onReportPeriodChange?: (period: ReportPeriod) => void;
  refreshKey?: number;
};

const demoStates: Record<string, PrincipleState> = {
  honesty: "practiced",
  "open-mindedness": "practiced",
  willingness: "practiced",
  humility: "attention",
  responsibility: "practiced",
  acceptance: "attention",
  patience: "attention",
  courage: "practiced",
  kindness: "practiced",
  boundaries: "na",
  integrity: "practiced",
  gratitude: "practiced",
  mindfulness: "practiced",
};

export function createDemoStep10Data(t: (english: string, farsi: string) => string): Step10Data {
  return {
    date: todayIso(),
    mood: "steady",
    states: { ...demoStates },
    attentionNotes: { patience: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم.") },
    highlights: t("I paused before answering a difficult message and asked for help when I needed it.", "پیش از پاسخ به یک پیام دشوار مکث کردم و وقتی نیاز داشتم کمک خواستم."),
    attention: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم."),
    patternAction: "",
    familyContext: "",
    amends: "",
    tomorrow: t("Pause, breathe, and listen before responding.", "پیش از پاسخ دادن مکث کنم، نفس بکشم و گوش بدهم."),
    gratitude: t("A clear conversation and a quiet walk.", "یک گفت‌وگوی روشن و یک پیاده‌روی آرام."),
  };
}

export function Step10Inventory({ demo = false, initialData, onSave, onExport, onExportChart, onOpenLearning, onChange, reportPeriod, onReportPeriodChange, refreshKey = 0 }: Step10InventoryProps) {
  const { language, t } = useLanguage();
  const [data, setData] = React.useState<Step10Data>(() => {
    const sample = demo ? createDemoStep10Data(t) : null;
    return {
      date: initialData?.date ?? sample?.date ?? todayIso(),
      mood: initialData?.mood ?? "steady",
      states: initialData?.states ?? sample?.states ?? {},
      attentionNotes: initialData?.attentionNotes ?? sample?.attentionNotes ?? {},
      highlights: initialData?.highlights ?? sample?.highlights ?? "",
      attention: initialData?.attention ?? sample?.attention ?? "",
      patternAction: initialData?.patternAction ?? "",
      familyContext: initialData?.familyContext ?? "",
      amends: initialData?.amends ?? "",
      tomorrow: initialData?.tomorrow ?? sample?.tomorrow ?? "",
      gratitude: initialData?.gratitude ?? sample?.gratitude ?? "",
    };
  });
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = React.useState(false);
  const [chartOpen, setChartOpen] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [localReportPeriod, setLocalReportPeriod] = React.useState<ReportPeriod>(() => defaultReportPeriod(initialData?.date ?? todayIso()));
  const mobileActionsRef = React.useRef<HTMLDivElement>(null);
  const mobileActionsButtonRef = React.useRef<HTMLButtonElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<HTMLDetailsElement>(null);
  const period = reportPeriod ?? localReportPeriod;
  const setPeriod = onReportPeriodChange ?? setLocalReportPeriod;
  const choosePeriod = (next: ReportPeriod) => { setPeriod(next); setChartOpen(true); };
  const bounds = reportBounds(period, data.date);
  const draftDay = period.mode === "day" || (period.mode === "today" && data.date === bounds?.from);
  const rangeReport = useReportAnalytics(bounds, !demo && !draftDay, refreshKey);
  const reportAnalytics = bounds
    ? draftDay
      ? calculateStep10Analytics([{ date: data.date, payload: data }], bounds.through, bounds.from)
      : demo ? createDemoAnalytics(data, t, bounds.from, bounds.through) : rangeReport.analytics
    : null;

  React.useEffect(() => { onChange?.(data); }, [data, onChange]);

  React.useEffect(() => {
    if (!mobileActionsOpen) return;
    mobileMenuRef.current?.querySelector("button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileActionsOpen(false);
        mobileActionsButtonRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!mobileActionsRef.current?.contains(event.target as Node)) setMobileActionsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileActionsOpen]);

  const counts = React.useMemo(() => {
    const values = Object.values(data.states);
    return {
      answered: values.filter(Boolean).length,
      practiced: values.filter((value) => value === "practiced").length,
      attention: values.filter((value) => value === "attention").length,
    };
  }, [data.states]);

  function setPrinciple(id: string, state: PrincipleState) {
    setData((current) => {
      const attentionNotes = { ...current.attentionNotes };
      if (state !== "attention") delete attentionNotes[id];
      return {
        ...current,
        states: { ...current.states, [id]: state },
        attentionNotes,
      };
    });
  }

  function setAttentionNote(id: string, value: string) {
    setData((current) => ({
      ...current,
      attentionNotes: { ...current.attentionNotes, [id]: value },
    }));
  }

  function updateField<K extends keyof Step10Data>(key: K, value: Step10Data[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  async function shareInventory() {
    if (!bounds || !reportAnalytics) {
      setMessage(rangeReport.error
        ? t("Analytics could not load. Try again before sharing.", "تحلیل بارگذاری نشد. پیش از اشتراک دوباره تلاش کنید.")
        : t("Analytics are loading. Try again in a moment.", "تحلیل در حال بارگذاری است. کمی بعد دوباره تلاش کنید."));
      return;
    }
    const text = formatStep10SponsorReport(data, reportAnalytics, bounds, language, t, demo);
    try {
      const result = await shareStep10Report(text, reportAnalytics, bounds, language, t);
      setMessage(result === "image" ? t("Share menu opened with the chart image and full report.", "منوی اشتراک با تصویر نمودار و گزارش کامل باز شد.")
        : result === "rich-copy" ? t("Full report and visual chart copied. Paste into a rich-text app to see the chart.", "گزارش کامل و نمودار تصویری کپی شد. برای دیدن نمودار آن را در برنامه‌ای با پشتیبانی از متن غنی جای‌گذاری کنید.")
          : t("Full report shared or copied with a text chart. Use Print / PDF for a visual chart.", "گزارش کامل با نمودار متنی به اشتراک گذاشته یا کپی شد. برای نمودار تصویری از چاپ / PDF استفاده کنید."));
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        try {
          const copied = await copyStep10Report(text, reportAnalytics, bounds, language, t);
          setMessage(copied === "rich" ? t("Sharing was unavailable; full report and visual chart copied.", "اشتراک در دسترس نبود؛ گزارش کامل و نمودار تصویری کپی شد.") : t("Sharing was unavailable, so the full report was copied with a text chart.", "اشتراک در دسترس نبود؛ گزارش کامل با نمودار متنی کپی شد."));
        } catch {
          setMessage(t("Sharing was not available. Try Print / PDF.", "اشتراک در دسترس نبود. از چاپ یا PDF استفاده کنید."));
        }
      }
    }
  }

  async function copyInventory() {
    if (!bounds || !reportAnalytics) {
      setMessage(t("Choose a valid analytics period and wait for the report to load.", "بازه تحلیل معتبری انتخاب کنید و منتظر بارگذاری گزارش بمانید."));
      return;
    }
    try {
      const text = formatStep10SponsorReport(data, reportAnalytics, bounds, language, t, demo);
      const copied = await copyStep10Report(text, reportAnalytics, bounds, language, t);
      setMessage(copied === "rich" ? t("Full inventory, period analytics, and visual chart copied.", "ترازنامه کامل، تحلیل بازه و نمودار تصویری کپی شد.") : t("Full inventory and analytics copied with a text chart.", "ترازنامه کامل و تحلیل همراه با نمودار متنی کپی شد."));
    } catch {
      setMessage(t("Copy was not available. Try Share or Print / PDF.", "کپی در دسترس نبود. از اشتراک یا چاپ / PDF استفاده کنید."));
    }
  }

  async function saveInventory() {
    if (!onSave) {
      setMessage(t("Demo complete. Join to save this inventory privately.", "نسخه آزمایشی کامل شد. برای ذخیره خصوصی عضو شوید."));
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await onSave(data);
      setMessage(t("Inventory saved privately.", "ترازنامه به‌صورت خصوصی ذخیره شد."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Could not save. Please try again.", "ذخیره انجام نشد. دوباره تلاش کنید."));
    } finally {
      setSaving(false);
    }
  }

  function resetInventory() {
    setData({
      date: todayIso(),
      mood: "steady",
      states: {},
      attentionNotes: {},
      highlights: "",
      attention: "",
      patternAction: "",
      familyContext: "",
      amends: "",
      tomorrow: "",
      gratitude: "",
    });
    setMessage("");
  }

  function viewChart() {
    setChartOpen(true);
    setMobileActionsOpen(false);
    window.requestAnimationFrame(() => chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div
      className="inventory-layout"
      data-inventory="step10"
      onFocusCapture={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          setEditing(true);
          setMobileActionsOpen(false);
        }
      }}
      onBlurCapture={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) setEditing(false);
      }}
    >
      <section className="inventory-main">
        <header className="inventory-header">
          <div className="inventory-title-block">
            <span className="step-badge">10</span>
            <div>
              <h2>{t("Daily inventory", "ترازنامه روزانه")}</h2>
              <p>{t("Notice. Own it. Choose the next right action.", "ببینید، بپذیرید و اقدام درست بعدی را انتخاب کنید.")}</p>
            </div>
          </div>
          <input
            className="date-input"
            type="date"
            value={data.date}
            onChange={(event) => updateField("date", event.target.value)}
            aria-label={t("Inventory date", "تاریخ ترازنامه")}
          />
        </header>

        <div className="inventory-content">
          <div className="inventory-intro-row">
            <div>
              <h3>{t("How did you practice these principles today?", "امروز چگونه این اصول را تمرین کردید؟")}</h3>
              <p>{t("Choose what fits. There is no score to earn.", "گزینه مناسب را انتخاب کنید. اینجا نمره‌ای در کار نیست.")}</p>
            </div>
            <div className="inventory-intro-actions">
              {onOpenLearning && <button className="button button-outline button-small" type="button" onClick={onOpenLearning}><BookOpenText size={16} />{t("Learn these principles", "یادگیری این اصول")}</button>}
              <div className="progress-ring" aria-label={`${counts.answered} of 24 answered`}>
                {counts.answered}/24
              </div>
            </div>
          </div>

          {principleCategories.map((category) => (
            <section className="principle-category" key={category.id}>
              <div className="principle-category-heading">
                {language === "fa" ? category.fa : language === "es" ? category.es : category.en}
              </div>
              <div className="principle-grid">
                {principles.filter((principle) => principle.category === category.id).map((principle) => {
                  const state = data.states[principle.id];
                  return (
                    <article className={`principle-card${state ? ` is-${state}` : ""}`} key={principle.id}>
                      <div className="principle-name">
                        <strong>{language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en}</strong>
                        <span>{language === "fa" ? principle.promptFa : language === "es" ? principle.promptEs : principle.promptEn}</span>
                      </div>
                      <div className="state-picker" role="group" aria-label={language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en}>
                        <button className="practiced" type="button" aria-pressed={state === "practiced"} onClick={() => setPrinciple(principle.id, "practiced")}>
                          {t("Practiced", "تمرین کردم")}
                        </button>
                        <button className="attention" type="button" aria-pressed={state === "attention"} onClick={() => setPrinciple(principle.id, "attention")}>
                          {t("Needs attention", "نیاز به توجه")}
                        </button>
                        <button className="na" type="button" aria-pressed={state === "na"} onClick={() => setPrinciple(principle.id, "na")} aria-label={t("Not applicable", "کاربرد ندارد")}>
                          {language === "en" ? "N/A" : t("Not applicable", "کاربرد ندارد")}
                        </button>
                      </div>
                      {state === "attention" && (
                        <div className="principle-attention-note">
                          <label htmlFor={`attention-note-${principle.id}`}>
                            {t("What happened today that needs attention?", "امروز چه اتفاقی افتاد که نیاز به توجه دارد؟")}
                          </label>
                          <textarea
                            id={`attention-note-${principle.id}`}
                            className="form-textarea"
                            value={data.attentionNotes[principle.id] ?? ""}
                            onChange={(event) => setAttentionNote(principle.id, event.target.value)}
                            placeholder={t("Briefly describe the issue for this principle.", "موضوع مربوط به این اصل را کوتاه توضیح دهید.")}
                            rows={3}
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          <section className="reflection-prompts">
            <h3>{t("Close the day with clarity", "روز را با روشنی به پایان برسانید")}</h3>
            <div className="prompt-grid">
              <div className="form-field">
                <label htmlFor="step10-highlights">{t("Where did I live my principles?", "کجا بر اساس اصولم زندگی کردم؟")}</label>
                <textarea id="step10-highlights" className="form-textarea" value={data.highlights} onChange={(event) => updateField("highlights", event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="step10-attention">{t("Where do I still need to work?", "کجا هنوز نیاز به کار دارم؟")}</label>
                <textarea id="step10-attention" className="form-textarea" value={data.attention} onChange={(event) => updateField("attention", event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="step10-pattern-action">{t("What character pattern, including self-pity, did I notice, and how did I work on it?", "چه الگوی رفتاری، از جمله ترحم به خود، را دیدم و چگونه روی آن کار کردم؟")}</label>
                <textarea id="step10-pattern-action" className="form-textarea" value={data.patternAction} onChange={(event) => updateField("patternAction", event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="step10-family-context">{t("If another person's drinking or substance use affected me or my family today, what happened and what could I control?", "اگر مصرف الکل یا موادِ فرد دیگری امروز بر من یا خانواده‌ام اثر گذاشت، چه اتفاقی افتاد و چه چیزی در اختیار من بود؟")}</label>
                <textarea id="step10-family-context" className="form-textarea" value={data.familyContext} onChange={(event) => updateField("familyContext", event.target.value)} />
                <small>{t("Optional. If another person's behavior felt unpredictable, focus on your choices and what was outside your control.", "اختیاری است. اگر رفتار فرد دیگری پیش‌بینی‌ناپذیر بود، به انتخاب‌های خود و آنچه خارج از اختیار شما بود توجه کنید.")}</small>
              </div>
              <div className="form-field">
                <label htmlFor="step10-amends">{t("Do I owe an apology or amends?", "آیا به کسی عذرخواهی یا جبران بدهکارم؟")}</label>
                <textarea id="step10-amends" className="form-textarea" value={data.amends} onChange={(event) => updateField("amends", event.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="step10-tomorrow">{t("One action for tomorrow", "یک اقدام برای فردا")}</label>
                <textarea id="step10-tomorrow" className="form-textarea" value={data.tomorrow} onChange={(event) => updateField("tomorrow", event.target.value)} />
              </div>
              <div className="form-field full">
                <label htmlFor="step10-gratitude">{t("What am I grateful for?", "برای چه چیزی سپاسگزارم؟")}</label>
                <textarea id="step10-gratitude" className="form-textarea" value={data.gratitude} onChange={(event) => updateField("gratitude", event.target.value)} />
              </div>
            </div>
          </section>
        </div>
      </section>

      <aside className="inventory-sidebar">
        <section className="inventory-sidebar-card">
          <h3>{t("Selected day at a glance", "نگاهی به روز انتخاب‌شده")}</h3>
          <p>{formatDisplayDate(data.date, language)}</p>
          <div className="summary-stats">
            <div className="summary-stat"><strong>{counts.practiced}</strong><span>{t("Practiced", "تمرین‌شده")}</span></div>
            <div className="summary-stat"><strong>{counts.attention}</strong><span>{t("Needs attention", "نیازمند توجه")}</span></div>
          </div>
        </section>
        <section className="inventory-sidebar-card">
          <h3>{t("Keep or share", "ذخیره یا اشتراک")}</h3>
          <p>{t("Nothing leaves this page unless you choose an action.", "هیچ‌چیز بدون انتخاب شما از این صفحه خارج نمی‌شود.")}</p>
          <p>{t("Share and Copy include this full inventory and a chart. Choose Today, the selected day, a week, month, year, or custom range for the chart and analytics.", "اشتراک و کپی، این ترازنامه کامل و نمودار را در بر می‌گیرند. برای نمودار و تحلیل، امروز، روز انتخاب‌شده، هفته، ماه، سال یا بازه دلخواه را انتخاب کنید.")}</p>
          <ReportPeriodPicker period={period} onChange={choosePeriod} selectedDay={data.date} id="step10-report-period" />
          <p>{t("Ask your sponsor or someone with time in recovery to help you understand the patterns and choose the next step together.", "از حامی یا فردی باتجربه در بهبودی بخواهید در فهم الگوها و انتخاب گام بعدی همراه شما باشد.")}</p>
          {!demo && !draftDay && <p>{t("This period counts saved entries only. Save today's changes first if you want them counted.", "این بازه فقط نوشته‌های ذخیره‌شده را می‌شمارد. اگر می‌خواهید تغییرات امروز محاسبه شوند، ابتدا آن‌ها را ذخیره کنید.")}</p>}
          {rangeReport.loading && <p>{t("Preparing analytics for sharing…", "در حال آماده‌سازی تحلیل برای اشتراک…")}</p>}
          {bounds && reportAnalytics && <details className="step10-report-preview" ref={chartRef} open={chartOpen} onToggle={(event) => setChartOpen(event.currentTarget.open)}><summary>{t("Preview principle chart", "پیش‌نمایش نمودار اصول")}</summary><Step10ReportChart analytics={reportAnalytics} bounds={bounds} /></details>}
          <div className="sidebar-actions">
            <button className="button button-primary" type="button" onClick={saveInventory} disabled={saving}>
              <Save size={17} />{saving ? t("Saving…", "در حال ذخیره…") : t("Save inventory", "ذخیره ترازنامه")}
            </button>
            <button className="button button-outline" type="button" onClick={shareInventory}><Share2 size={17} />{t("Share with sponsor", "اشتراک با حامی")}</button>
            {rangeReport.error && <button className="button button-outline" type="button" onClick={rangeReport.retry}><Share2 size={17} />{t("Retry analytics", "تلاش دوباره برای تحلیل")}</button>}
            <button className="button button-outline" type="button" onClick={copyInventory}><Copy size={17} />{t("Copy full inventory", "کپی ترازنامه کامل")}</button>
            <button className="button button-outline" type="button" onClick={onExport ?? (() => window.print())}><FileDown size={17} />{t(onExport ? "Export saved inventory" : "Print / Save PDF", onExport ? "خروجی از ترازنامه ذخیره‌شده" : "چاپ / ذخیره PDF")}</button>
            {onExportChart && <button className="button button-outline" type="button" onClick={onExportChart}><FileDown size={17} />{t("Export chart only", "خروجی فقط نمودار")}</button>}
            <button className="button button-danger" type="button" onClick={resetInventory}><RotateCcw size={17} />{t("Clear this page", "پاک کردن صفحه")}</button>
          </div>
          {message && <p className="toast-note step10-desktop-message" role="status">{message}</p>}
        </section>
      </aside>

      <div className={`step10-mobile-actions${editing ? " is-editing" : ""}`} ref={mobileActionsRef}>
        {message && <p className="step10-mobile-message" role="status">{message}</p>}
        <div className="step10-mobile-menu" id="step10-mobile-menu" ref={mobileMenuRef} hidden={!mobileActionsOpen} role="group" aria-label={t("Inventory actions", "گزینه‌های ترازنامه")}>
          <ReportPeriodPicker period={period} onChange={choosePeriod} selectedDay={data.date} id="step10-report-period-mobile" />
          <button className="button button-outline" type="button" onClick={viewChart}><BarChart3 size={17} />{t("View principle chart", "مشاهده نمودار اصول")}</button>
          <button className="button button-outline" type="button" onClick={() => { setMobileActionsOpen(false); void shareInventory(); }}><Share2 size={17} />{t("Share with sponsor", "اشتراک با حامی")}</button>
          {rangeReport.error && <button className="button button-outline" type="button" onClick={() => { setMobileActionsOpen(false); rangeReport.retry(); }}><Share2 size={17} />{t("Retry analytics", "تلاش دوباره برای تحلیل")}</button>}
          <button className="button button-outline" type="button" onClick={() => { setMobileActionsOpen(false); void copyInventory(); }}><Copy size={17} />{t("Copy full inventory", "کپی ترازنامه کامل")}</button>
          <button className="button button-outline" type="button" onClick={() => { setMobileActionsOpen(false); (onExport ?? (() => window.print()))(); }}><FileDown size={17} />{t(onExport ? "Export saved inventory" : "Print / Save PDF", onExport ? "خروجی از ترازنامه ذخیره‌شده" : "چاپ / ذخیره PDF")}</button>
          {onExportChart && <button className="button button-outline" type="button" onClick={() => { setMobileActionsOpen(false); onExportChart(); }}><FileDown size={17} />{t("Export chart only", "خروجی فقط نمودار")}</button>}
          <button className="button button-danger" type="button" onClick={() => { setMobileActionsOpen(false); resetInventory(); }}><RotateCcw size={17} />{t("Clear this page", "پاک کردن صفحه")}</button>
        </div>
        <div className="step10-mobile-bar">
          <button className="button button-primary" type="button" onClick={() => { setMobileActionsOpen(false); void saveInventory(); }} disabled={saving}>
            <Save size={17} />{saving ? t("Saving…", "در حال ذخیره…") : t("Save inventory", "ذخیره ترازنامه")}
          </button>
          <button className="button button-outline" type="button" ref={mobileActionsButtonRef} aria-controls="step10-mobile-menu" aria-expanded={mobileActionsOpen} onClick={() => setMobileActionsOpen((open) => !open)}>
            <MoreHorizontal size={18} />{t("More actions", "گزینه‌های بیشتر")}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Step10Data };
