"use client";

import * as React from "react";
import { Check, Copy, FileDown, Plus, RotateCcw, Save, Share2, Trash2 } from "lucide-react";
import { formatDisplayDate, step4Types, todayIso } from "@/lib/inventory";
import { useLanguage } from "./language-provider";

type Step4Entry = {
  id: string;
  type: string;
  subject: string;
  event: string;
  effect: string;
  myPart: string;
  nextAction: string;
};

type Step4Data = {
  date: string;
  entries: Step4Entry[];
};

type Step4InventoryProps = {
  demo?: boolean;
  initialData?: Partial<Step4Data>;
  onSave?: (data: Step4Data) => Promise<void> | void;
};

const emptyDraft = () => ({ subject: "", event: "", effect: "", myPart: "", nextAction: "" });

export function Step4Inventory({ demo = false, initialData, onSave }: Step4InventoryProps) {
  const { language, t } = useLanguage();
  const [date, setDate] = React.useState(initialData?.date ?? todayIso());
  const [activeType, setActiveType] = React.useState("resentment");
  const [draft, setDraft] = React.useState(emptyDraft());
  const [entries, setEntries] = React.useState<Step4Entry[]>(
    initialData?.entries ?? (demo ? [
      {
        id: "sample-1",
        type: "resentment",
        subject: t("A family conversation", "یک گفت‌وگوی خانوادگی"),
        event: t("I felt dismissed when the subject changed before I finished.", "وقتی قبل از تمام شدن حرفم موضوع عوض شد، احساس کردم نادیده گرفته شدم."),
        effect: t("Self-esteem and closeness", "عزت نفس و صمیمیت"),
        myPart: t("I assumed intent and withdrew instead of speaking clearly.", "قصد طرف مقابل را فرض کردم و به جای صحبت روشن، کنار کشیدم."),
        nextAction: t("Ask for a calm conversation and listen, too.", "یک گفت‌وگوی آرام درخواست کنم و خودم هم گوش بدهم."),
      },
      {
        id: "sample-2",
        type: "strength",
        subject: t("Asking for support", "درخواست حمایت"),
        event: t("I called someone before the situation became overwhelming.", "پیش از آنکه شرایط طاقت‌فرسا شود با کسی تماس گرفتم."),
        effect: t("Recovery and connection", "بهبودی و ارتباط"),
        myPart: t("I chose honesty and willingness.", "صداقت و تمایل را انتخاب کردم."),
        nextAction: t("Keep reaching out early.", "همچنان زودتر درخواست کمک کنم."),
      },
    ] : [])
  );
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const selectedType = step4Types.find((type) => type.id === activeType) ?? step4Types[0];
  const visibleEntries = entries.filter((entry) => entry.type === activeType);

  const labelsForType = React.useCallback((type: string) => {
    if (type === "fear") return {
      subject: t("What am I afraid of?", "از چه چیزی می‌ترسم؟"),
      event: t("What story or belief sits underneath it?", "چه داستان یا باوری پشت آن است؟"),
      effect: t("How does this fear affect my choices?", "این ترس چگونه بر انتخاب‌هایم اثر می‌گذارد؟"),
      myPart: t("What do I do when this fear appears?", "وقتی این ترس ظاهر می‌شود چه می‌کنم؟"),
      nextAction: t("A grounded action I can take", "یک اقدام واقع‌بینانه که می‌توانم انجام دهم"),
    };
    if (type === "relationship") return {
      subject: t("Person or relationship", "فرد یا رابطه"),
      event: t("What pattern or harm occurred?", "چه الگو یا آسیبی رخ داد؟"),
      effect: t("Who or what was affected?", "چه کسی یا چه چیزی تحت تأثیر قرار گرفت؟"),
      myPart: t("What is my responsibility?", "مسئولیت من چیست؟"),
      nextAction: t("Repair, amends, or boundary to consider", "جبران، عذرخواهی یا مرزی که باید بررسی شود"),
    };
    if (type === "strength") return {
      subject: t("Strength or positive quality", "نقطه قوت یا ویژگی مثبت"),
      event: t("Where did I see it in action?", "کجا آن را در عمل دیدم؟"),
      effect: t("What did it support?", "از چه چیزی حمایت کرد؟"),
      myPart: t("What choice helped this strength appear?", "چه انتخابی به ظهور این نقطه قوت کمک کرد؟"),
      nextAction: t("How can I practice it again?", "چگونه می‌توانم دوباره آن را تمرین کنم؟"),
    };
    return {
      subject: t("Person, institution, or situation", "فرد، نهاد یا موقعیت"),
      event: t("What happened?", "چه اتفاقی افتاد؟"),
      effect: t("What part of me was affected?", "کدام بخش از من تحت تأثیر قرار گرفت؟"),
      myPart: t("What was my part or repeating pattern?", "سهم یا الگوی تکراری من چه بود؟"),
      nextAction: t("Principle or action to practice", "اصل یا اقدامی برای تمرین"),
    };
  }, [t]);
  const labels = React.useMemo(() => labelsForType(activeType), [activeType, labelsForType]);

  function addEntry() {
    if (!draft.subject.trim()) {
      setMessage(t("Add a subject before saving this entry.", "پیش از ذخیره، موضوع را وارد کنید."));
      return;
    }
    setEntries((current) => [
      ...current,
      { id: crypto.randomUUID(), type: activeType, ...draft },
    ]);
    setDraft(emptyDraft());
    setMessage(t("Entry added to this inventory.", "مورد به این ترازنامه اضافه شد."));
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function summaryText() {
    const lines = [
      t("Step 4 Personal Inventory", "ترازنامه شخصی گام چهارم"),
      formatDisplayDate(date, language),
      "",
    ];
    for (const type of step4Types) {
      const matching = entries.filter((entry) => entry.type === type.id);
      if (!matching.length) continue;
      lines.push(language === "fa" ? type.fa : type.en);
      matching.forEach((entry, index) => {
        const entryLabels = labelsForType(entry.type);
        lines.push(`${index + 1}. ${entry.subject}`);
        if (entry.event) lines.push(`   ${entryLabels.event}: ${entry.event}`);
        if (entry.effect) lines.push(`   ${entryLabels.effect}: ${entry.effect}`);
        if (entry.myPart) lines.push(`   ${entryLabels.myPart}: ${entry.myPart}`);
        if (entry.nextAction) lines.push(`   ${entryLabels.nextAction}: ${entry.nextAction}`);
      });
      lines.push("");
    }
    return lines.join("\n");
  }

  async function shareInventory() {
    const text = summaryText();
    try {
      if (navigator.share) {
        await navigator.share({ title: t("My Step 4 Inventory", "ترازنامه گام چهارم من"), text });
        setMessage(t("Share menu opened.", "منوی اشتراک باز شد."));
      } else {
        await navigator.clipboard.writeText(text);
        setMessage(t("Private summary copied.", "خلاصه خصوصی کپی شد."));
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setMessage(t("Sharing was not available. Try Print / PDF.", "اشتراک در دسترس نبود. از چاپ یا PDF استفاده کنید."));
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
      await onSave({ date, entries });
      setMessage(t("Inventory saved privately.", "ترازنامه به‌صورت خصوصی ذخیره شد."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Could not save. Please try again.", "ذخیره انجام نشد. دوباره تلاش کنید."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="inventory-layout" data-inventory="step4">
      <section className="inventory-main">
        <header className="inventory-header">
          <div className="inventory-title-block">
            <span className="step-badge">4</span>
            <div>
              <h2>{t("Personal inventory", "ترازنامه شخصی")}</h2>
              <p>{t("Be searching and gentle. Progress does not require perfection.", "دقیق و مهربان باشید. پیشرفت به کمال نیاز ندارد.")}</p>
            </div>
          </div>
          <input className="date-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label={t("Inventory date", "تاریخ ترازنامه")} />
        </header>
        <div className="inventory-content">
          <div className="step4-type-tabs" role="tablist" aria-label={t("Inventory sections", "بخش‌های ترازنامه")}>
            {step4Types.map((type) => (
              <button key={type.id} type="button" className={activeType === type.id ? "is-active" : ""} onClick={() => { setActiveType(type.id); setMessage(""); }}>
                {language === "fa" ? type.fa : type.en}
                <span> ({entries.filter((entry) => entry.type === type.id).length})</span>
              </button>
            ))}
          </div>
          <p className="step4-description">{language === "fa" ? selectedType.descriptionFa : selectedType.descriptionEn}</p>
          <section className="step4-form">
            <h3>{t("Add an entry", "افزودن مورد")}</h3>
            <div className="prompt-grid">
              {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
                <div className={`form-field${key !== "subject" ? " full" : ""}`} key={key}>
                  <label htmlFor={`step4-${key}`}>{labels[key]}</label>
                  {key === "subject" ? (
                    <input id={`step4-${key}`} className="form-input" value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} />
                  ) : (
                    <textarea id={`step4-${key}`} className="form-textarea" value={draft[key]} onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <button className="button button-primary" type="button" onClick={addEntry}><Plus size={17} />{t("Add to inventory", "افزودن به ترازنامه")}</button>
          </section>

          <section className="step4-entry-list" aria-live="polite">
            {visibleEntries.length === 0 ? (
              <div className="step4-description">{t("No entries in this section yet.", "هنوز موردی در این بخش ثبت نشده است.")}</div>
            ) : visibleEntries.map((entry) => (
              <article className="step4-entry" key={entry.id}>
                <div>
                  <strong>{entry.subject}</strong>
                  <p>{entry.event}</p>
                  {entry.nextAction && <p><b>{t("Next action", "اقدام بعدی")}:</b> {entry.nextAction}</p>}
                </div>
                <button type="button" className="icon-button" onClick={() => removeEntry(entry.id)} aria-label={t("Delete entry", "حذف مورد")}><Trash2 size={16} /></button>
              </article>
            ))}
          </section>
        </div>
      </section>

      <aside className="inventory-sidebar">
        <section className="inventory-sidebar-card">
          <h3>{t("Inventory overview", "نمای کلی ترازنامه")}</h3>
          <p>{formatDisplayDate(date, language)}</p>
          <div className="summary-stats">
            <div className="summary-stat"><strong>{entries.length}</strong><span>{t("Total entries", "کل موارد")}</span></div>
            <div className="summary-stat"><strong>{new Set(entries.map((entry) => entry.type)).size}</strong><span>{t("Sections used", "بخش‌های استفاده‌شده")}</span></div>
          </div>
        </section>
        <section className="inventory-sidebar-card">
          <h3>{t("Keep or share", "ذخیره یا اشتراک")}</h3>
          <p>{t("Review with your sponsor only when you feel ready.", "فقط زمانی که آماده هستید با حامی خود مرور کنید.")}</p>
          <div className="sidebar-actions">
            <button className="button button-primary" type="button" onClick={saveInventory} disabled={saving}><Save size={17} />{saving ? t("Saving…", "در حال ذخیره…") : t("Save inventory", "ذخیره ترازنامه")}</button>
            <button className="button button-outline" type="button" onClick={shareInventory}><Share2 size={17} />{t("Share with sponsor", "اشتراک با حامی")}</button>
            <button className="button button-outline" type="button" onClick={async () => { await navigator.clipboard.writeText(summaryText()); setMessage(t("Private summary copied.", "خلاصه خصوصی کپی شد.")); }}><Copy size={17} />{t("Copy private summary", "کپی خلاصه خصوصی")}</button>
            <button className="button button-outline" type="button" onClick={() => window.print()}><FileDown size={17} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
            <button className="button button-danger" type="button" onClick={() => { setEntries([]); setDraft(emptyDraft()); setMessage(""); }}><RotateCcw size={17} />{t("Clear this inventory", "پاک کردن ترازنامه")}</button>
          </div>
          {message && <p className="toast-note" role="status"><Check size={14} /> {message}</p>}
        </section>
      </aside>
    </div>
  );
}

export type { Step4Data, Step4Entry };
