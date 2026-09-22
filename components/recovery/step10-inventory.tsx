"use client";

import * as React from "react";
import { BookOpenText, Check, Copy, FileDown, RotateCcw, Save, Share2 } from "lucide-react";
import {
  formatDisplayDate,
  principleCategories,
  principles,
  type PrincipleState,
  todayIso,
} from "@/lib/inventory";
import { useLanguage } from "./language-provider";

type Step10Data = {
  date: string;
  mood: string;
  states: Record<string, PrincipleState | undefined>;
  attentionNotes: Record<string, string | undefined>;
  highlights: string;
  attention: string;
  amends: string;
  tomorrow: string;
  gratitude: string;
};

type Step10InventoryProps = {
  demo?: boolean;
  initialData?: Partial<Step10Data>;
  onSave?: (data: Step10Data) => Promise<void> | void;
  onExport?: () => void;
  onOpenLearning?: () => void;
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
  boundaries: "practiced",
  integrity: "practiced",
  gratitude: "practiced",
  mindfulness: "practiced",
};

export function Step10Inventory({ demo = false, initialData, onSave, onExport, onOpenLearning }: Step10InventoryProps) {
  const { language, t } = useLanguage();
  const [data, setData] = React.useState<Step10Data>({
    date: initialData?.date ?? todayIso(),
    mood: initialData?.mood ?? "steady",
    states: initialData?.states ?? (demo ? demoStates : {}),
    attentionNotes: initialData?.attentionNotes ?? (demo ? {
      patience: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم."),
    } : {}),
    highlights: initialData?.highlights ?? (demo ? t("I paused before answering a difficult message and asked for help when I needed it.", "پیش از پاسخ به یک پیام دشوار مکث کردم و وقتی نیاز داشتم کمک خواستم.") : ""),
    attention: initialData?.attention ?? (demo ? t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم.") : ""),
    amends: initialData?.amends ?? "",
    tomorrow: initialData?.tomorrow ?? (demo ? t("Pause, breathe, and listen before responding.", "پیش از پاسخ دادن مکث کنم، نفس بکشم و گوش بدهم.") : ""),
    gratitude: initialData?.gratitude ?? (demo ? t("A clear conversation and a quiet walk.", "یک گفت‌وگوی روشن و یک پیاده‌روی آرام.") : ""),
  });
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

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

  function summaryText() {
    const practiced = principles
      .filter((principle) => data.states[principle.id] === "practiced")
      .map((principle) => language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en)
      .join(", ");
    const attention = principles
      .filter((principle) => data.states[principle.id] === "attention")
      .map((principle) => language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en)
      .join(", ");
    const attentionDetails = principles.flatMap((principle) => {
      if (data.states[principle.id] !== "attention") return [];
      const note = data.attentionNotes[principle.id]?.trim();
      if (!note) return [];
      const name = language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en;
      return [`- ${name}: ${note}`];
    });

    return [
      t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم"),
      formatDisplayDate(data.date, language),
      "",
      `${t("Principles practiced", "اصول تمرین‌شده")}: ${practiced || "—"}`,
      `${t("Needs attention", "نیازمند توجه")}: ${attention || "—"}`,
      ...(attentionDetails.length > 0 ? [`${t("Attention details", "توضیحات موارد نیازمند توجه")}:`, ...attentionDetails] : []),
      `${t("What went well", "موارد خوب امروز")}: ${data.highlights || "—"}`,
      `${t("What needs attention", "موارد نیازمند توجه")}: ${data.attention || "—"}`,
      `${t("Amends or apology", "جبران یا عذرخواهی")}: ${data.amends || "—"}`,
      `${t("Tomorrow's action", "اقدام فردا")}: ${data.tomorrow || "—"}`,
      `${t("Gratitude", "قدردانی")}: ${data.gratitude || "—"}`,
    ].join("\n");
  }

  async function shareInventory() {
    const text = summaryText();
    try {
      if (navigator.share) {
        await navigator.share({ title: t("My Step 10 Inventory", "ترازنامه گام دهم من"), text });
        setMessage(t("Share menu opened.", "منوی اشتراک باز شد."));
      } else {
        await navigator.clipboard.writeText(text);
        setMessage(t("Private summary copied.", "خلاصه خصوصی کپی شد."));
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessage(t("Sharing was not available. Try Print / PDF.", "اشتراک در دسترس نبود. از چاپ یا PDF استفاده کنید."));
      }
    }
  }

  async function copyInventory() {
    await navigator.clipboard.writeText(summaryText());
    setMessage(t("Private summary copied.", "خلاصه خصوصی کپی شد."));
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
      amends: "",
      tomorrow: "",
      gratitude: "",
    });
    setMessage("");
  }

  return (
    <div className="inventory-layout" data-inventory="step10">
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
          <div className="sidebar-actions">
            <button className="button button-primary" type="button" onClick={saveInventory} disabled={saving}>
              <Save size={17} />{saving ? t("Saving…", "در حال ذخیره…") : t("Save inventory", "ذخیره ترازنامه")}
            </button>
            <button className="button button-outline" type="button" onClick={shareInventory}><Share2 size={17} />{t("Share with sponsor", "اشتراک با حامی")}</button>
            <button className="button button-outline" type="button" onClick={copyInventory}><Copy size={17} />{t("Copy private summary", "کپی خلاصه خصوصی")}</button>
            <button className="button button-outline" type="button" onClick={onExport ?? (() => window.print())}><FileDown size={17} />{t(onExport ? "Export saved inventory" : "Print / Save PDF", onExport ? "خروجی از ترازنامه ذخیره‌شده" : "چاپ / ذخیره PDF")}</button>
            <button className="button button-danger" type="button" onClick={resetInventory}><RotateCcw size={17} />{t("Clear this page", "پاک کردن صفحه")}</button>
          </div>
          {message && <p className="toast-note" role="status"><Check size={14} /> {message}</p>}
        </section>
      </aside>
    </div>
  );
}

export type { Step10Data };
