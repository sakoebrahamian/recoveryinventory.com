"use client";

import * as React from "react";
import { BookOpenText, Check, Copy, FileDown, Pencil, Plus, Save, Share2, Trash2, X } from "lucide-react";
import { formatDisplayDate, step4Types, todayIso } from "@/lib/inventory";
import { useLanguage } from "./language-provider";

type Step4Entry = {
  id: string;
  type: string;
  subject: string;
  event: string;
  effect: string;
  feelings: string;
  myPart: string;
  defects: string;
  shortcomings: string;
  principles: string;
  nextAction: string;
};

type Step4Data = {
  version: 2;
  title: string;
  status: "in_progress" | "complete";
  startedDate: string;
  entries: Step4Entry[];
  intention: string;
  patternsSummary: string;
  strengthsSummary: string;
  principlesPlan: string;
  supportPlan: string;
  notes: string;
  date?: string;
};

type Step4InventoryProps = {
  demo?: boolean;
  initialData?: Partial<Step4Data> & { date?: string; entries?: Array<Partial<Step4Entry> & Pick<Step4Entry, "id" | "type">> };
  onSave?: (data: Step4Data) => Promise<void> | void;
  onExport?: (data: Step4Data) => void;
  onOpenLearning?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

type EntryDraft = Omit<Step4Entry, "id" | "type">;

const emptyDraft = (): EntryDraft => ({ subject: "", event: "", effect: "", feelings: "", myPart: "", defects: "", shortcomings: "", principles: "", nextAction: "" });

function normalizeEntry(entry: Partial<Step4Entry> & Pick<Step4Entry, "id" | "type">): Step4Entry {
  return {
    id: entry.id,
    type: entry.type,
    subject: entry.subject ?? "",
    event: entry.event ?? "",
    effect: entry.effect ?? "",
    feelings: entry.feelings ?? "",
    myPart: entry.myPart ?? "",
    defects: entry.defects ?? "",
    shortcomings: entry.shortcomings ?? "",
    principles: entry.principles ?? "",
    nextAction: entry.nextAction ?? "",
  };
}

function demoEntries(t: (english: string, farsi: string) => string): Step4Entry[] {
  return [
    {
      id: "sample-1",
      type: "resentment",
      subject: t("A family conversation", "یک گفت‌وگوی خانوادگی"),
      event: t("The subject changed before I finished speaking, and I felt dismissed.", "پیش از تمام شدن حرفم موضوع عوض شد و احساس کردم نادیده گرفته شدم."),
      effect: t("Self-esteem, security, and closeness.", "عزت نفس، امنیت و صمیمیت."),
      feelings: t("Hurt, anger, and embarrassment.", "رنج، خشم و شرمندگی."),
      myPart: t("I assumed the other person’s intention and withdrew instead of speaking clearly.", "قصد طرف مقابل را فرض کردم و به جای صحبت روشن، کنار کشیدم."),
      defects: t("Resentment and fear.", "رنجش و ترس."),
      shortcomings: t("Rumination, withdrawal, and expecting the other person to read my mind.", "نشخوار فکری، کناره‌گیری و انتظار برای اینکه دیگری ذهنم را بخواند."),
      principles: t("Honesty, courage, and healthy boundaries.", "صداقت، شجاعت و مرزهای سالم."),
      nextAction: t("Ask for a calm conversation, describe my experience, and listen to theirs.", "یک گفت‌وگوی آرام بخواهم، تجربه خود را توضیح دهم و به تجربه او گوش دهم."),
    },
    {
      id: "sample-2",
      type: "pattern",
      subject: t("Avoiding difficult conversations", "دوری از گفت‌وگوهای دشوار"),
      event: t("I delay speaking until frustration has already built up.", "صحبت را آن‌قدر به تأخیر می‌اندازم تا ناامیدی جمع شود."),
      effect: t("Confusion, distance, and preventable resentment.", "سردرگمی، فاصله و رنجش قابل پیشگیری."),
      feelings: t("Fear and anxiety.", "ترس و اضطراب."),
      myPart: t("I choose temporary comfort instead of timely honesty.", "راحتی موقت را به جای صداقت به‌موقع انتخاب می‌کنم."),
      defects: t("Fear and people-pleasing.", "ترس و راضی نگه داشتن دیگران."),
      shortcomings: t("Avoidance, false agreement, and weak boundaries.", "اجتناب، موافقت غیرصادقانه و مرزهای ضعیف."),
      principles: t("Courage, honesty, and respect.", "شجاعت، صداقت و احترام."),
      nextAction: t("Use one clear sentence early and ask for support when needed.", "زودتر یک جمله روشن بگویم و در صورت نیاز حمایت بخواهم."),
    },
  ];
}

function initialWorkbook(initialData: Step4InventoryProps["initialData"], demo: boolean, t: (english: string, farsi: string) => string): Step4Data {
  const startedDate = initialData?.startedDate ?? initialData?.date ?? todayIso();
  return {
    version: 2,
    title: initialData?.title ?? (demo ? t("My Step 4 working inventory", "ترازنامه کاری گام چهارم من") : t("My Step 4 inventory", "ترازنامه گام چهارم من")),
    status: initialData?.status === "complete" ? "complete" : "in_progress",
    startedDate,
    entries: initialData?.entries?.map(normalizeEntry) ?? (demo ? demoEntries(t) : []),
    intention: initialData?.intention ?? (demo ? t("To look honestly at repeating patterns without attacking myself or anyone else.", "برای نگاه صادقانه به الگوهای تکراری بدون حمله به خود یا دیگری.") : ""),
    patternsSummary: initialData?.patternsSummary ?? "",
    strengthsSummary: initialData?.strengthsSummary ?? "",
    principlesPlan: initialData?.principlesPlan ?? "",
    supportPlan: initialData?.supportPlan ?? "",
    notes: initialData?.notes ?? "",
    date: initialData?.date,
  };
}

export function Step4Inventory({ demo = false, initialData, onSave, onExport, onOpenLearning, onDirtyChange }: Step4InventoryProps) {
  const { language, t } = useLanguage();
  const [data, setData] = React.useState<Step4Data>(() => initialWorkbook(initialData, demo, t));
  const [activeType, setActiveType] = React.useState("resentment");
  const [draft, setDraft] = React.useState<EntryDraft>(emptyDraft());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const markDirty = React.useCallback(() => {
    setDirty(true);
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const selectedType = step4Types.find((type) => type.id === activeType) ?? step4Types[0];
  const visibleEntries = data.entries.filter((entry) => entry.type === activeType);

  const labelsForType = React.useCallback((type: string) => {
    const shared = {
      feelings: t("What feelings came up?", "چه احساساتی ایجاد شد؟"),
      defects: t("What character defects were present?", "چه نقص‌های شخصیتی وجود داشت؟"),
      shortcomings: t("What specific shortcomings or behaviors came from those defects?", "چه کمبودها یا رفتارهای مشخصی از آن نقص‌ها به وجود آمد؟"),
      principles: t("What principles can counter those defects?", "چه اصولی می‌توانند با آن نقص‌ها مقابله کنند؟"),
    };
    if (type === "fear") return {
      subject: t("What am I afraid of?", "از چه چیزی می‌ترسم؟"),
      event: t("What facts, memories, or beliefs sit underneath this fear?", "چه واقعیت‌ها، خاطره‌ها یا باورهایی پشت این ترس هستند؟"),
      effect: t("How does this fear affect my choices, relationships, or recovery?", "این ترس چگونه بر انتخاب‌ها، روابط یا بهبودی من اثر می‌گذارد؟"),
      ...shared,
      myPart: t("How do I respond through avoidance, control, isolation, or defensiveness?", "چگونه با اجتناب، کنترل، انزوا یا دفاعی شدن پاسخ می‌دهم؟"),
      nextAction: t("What careful, courageous action can I take?", "چه اقدام سنجیده و شجاعانه‌ای می‌توانم انجام دهم؟"),
    };
    if (type === "relationship") return {
      subject: t("Person, relationship, or conduct pattern", "فرد، رابطه یا الگوی رفتاری"),
      event: t("What happened, including relevant facts, motives, honesty, consent, and boundaries?", "چه اتفاقی افتاد، با توجه به واقعیت‌ها، انگیزه‌ها، صداقت، رضایت و مرزها؟"),
      effect: t("How were trust, dignity, safety, or closeness affected?", "اعتماد، کرامت، ایمنی یا صمیمیت چگونه تحت تأثیر قرار گرفت؟"),
      ...shared,
      myPart: t("What was my responsibility, without taking responsibility for someone else?", "مسئولیت من چه بود، بدون اینکه مسئولیت دیگری را به دوش بگیرم؟"),
      nextAction: t("What healthier ideal, boundary, or behavior will guide me?", "چه الگوی سالم‌تر، مرز یا رفتاری راهنمای من خواهد بود؟"),
    };
    if (type === "harm") return {
      subject: t("Person, group, or area of life affected", "فرد، گروه یا بخشی از زندگی که آسیب دید"),
      event: t("What did I do or fail to do? Describe the facts without minimizing or exaggerating.", "چه کاری انجام دادم یا انجام ندادم؟ واقعیت‌ها را بدون کوچک یا بزرگ کردن توضیح دهید."),
      effect: t("What was the likely impact on them, me, or others?", "تأثیر احتمالی بر آنها، من یا دیگران چه بود؟"),
      ...shared,
      myPart: t("What responsibility is mine to acknowledge?", "کدام مسئولیت متعلق به من است که باید بپذیرم؟"),
      nextAction: t("What guidance, changed behavior, or safe repair should I discuss with a trusted person?", "چه راهنمایی، تغییر رفتار یا جبران امنی را باید با فردی قابل اعتماد بررسی کنم؟"),
    };
    if (type === "pattern") return {
      subject: t("Character defect or recurring pattern", "نقص شخصیتی یا الگوی تکراری"),
      event: t("What situations trigger it, and what examples show the pattern?", "چه موقعیت‌هایی آن را فعال می‌کنند و چه نمونه‌هایی این الگو را نشان می‌دهند؟"),
      effect: t("What consequences does it create in recovery, relationships, work, or self-respect?", "چه پیامدهایی در بهبودی، روابط، کار یا عزت نفس ایجاد می‌کند؟"),
      ...shared,
      myPart: t("How do I feed, excuse, hide, or repeat this pattern?", "چگونه این الگو را تقویت، توجیه، پنهان یا تکرار می‌کنم؟"),
      nextAction: t("How will I live the corrective principles in specific actions?", "چگونه اصول اصلاحی را در اقدامات مشخص زندگی خواهم کرد؟"),
    };
    if (type === "strength") return {
      subject: t("Strength, asset, or positive quality", "توانایی، دارایی یا ویژگی مثبت"),
      event: t("Where have I seen this quality in action?", "کجا این ویژگی را در عمل دیده‌ام؟"),
      effect: t("How has it supported recovery, relationships, or well-being?", "چگونه از بهبودی، روابط یا سلامت حمایت کرده است؟"),
      feelings: t("What do I feel when I recognize this strength?", "وقتی این توانایی را می‌بینم چه احساسی دارم؟"),
      myPart: t("What choices helped this strength grow?", "چه انتخاب‌هایی به رشد این توانایی کمک کردند؟"),
      defects: t("What fear or defect sometimes blocks this strength?", "چه ترس یا نقصی گاهی این توانایی را مسدود می‌کند؟"),
      shortcomings: t("What behavior tells me I have moved away from this strength?", "چه رفتاری نشان می‌دهد از این توانایی فاصله گرفته‌ام؟"),
      principles: t("What principle does this strength express?", "این توانایی بیانگر چه اصلی است؟"),
      nextAction: t("How can I practice this strength again?", "چگونه می‌توانم دوباره این توانایی را تمرین کنم؟"),
    };
    return {
      subject: t("Person, institution, principle, or situation", "فرد، نهاد، اصل یا موقعیت"),
      event: t("What happened? Describe the facts and the expectation that was not met.", "چه اتفاقی افتاد؟ واقعیت‌ها و انتظاری را که برآورده نشد توضیح دهید."),
      effect: t("What areas were affected: self-esteem, security, ambitions, relationships, or finances?", "چه بخش‌هایی تحت تأثیر قرار گرفت: عزت نفس، امنیت، خواسته‌ها، روابط یا امور مالی؟"),
      ...shared,
      myPart: t("What was my part, motive, expectation, or repeating response?", "سهم، انگیزه، انتظار یا پاسخ تکراری من چه بود؟"),
      nextAction: t("What principle, boundary, or action can guide my response?", "چه اصل، مرز یا اقدامی می‌تواند پاسخ من را هدایت کند؟"),
    };
  }, [t]);
  const labels = React.useMemo(() => labelsForType(activeType), [activeType, labelsForType]);

  function updateData<K extends keyof Step4Data>(key: K, value: Step4Data[K]) {
    setData((current) => ({ ...current, [key]: value }));
    markDirty();
  }

  function updateDraft(key: keyof EntryDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    markDirty();
  }

  function saveEntry() {
    if (!draft.subject.trim()) {
      setMessage(t("Add a subject before saving this entry.", "پیش از ذخیره، موضوع را وارد کنید."));
      return;
    }
    setData((current) => ({
      ...current,
      entries: editingId
        ? current.entries.map((entry) => entry.id === editingId ? { id: editingId, type: activeType, ...draft } : entry)
        : [...current.entries, { id: crypto.randomUUID(), type: activeType, ...draft }],
    }));
    setDraft(emptyDraft());
    setEditingId(null);
    markDirty();
    setMessage(editingId ? t("Entry updated.", "مورد به‌روزرسانی شد.") : t("Entry added to this inventory.", "مورد به این ترازنامه اضافه شد."));
  }

  function editEntry(entry: Step4Entry) {
    setActiveType(entry.type);
    setDraft({ subject: entry.subject, event: entry.event, effect: entry.effect, feelings: entry.feelings, myPart: entry.myPart, defects: entry.defects, shortcomings: entry.shortcomings, principles: entry.principles, nextAction: entry.nextAction });
    setEditingId(entry.id);
    setMessage(t("Editing this entry. Save the entry when your changes are complete.", "در حال ویرایش این مورد هستید. پس از پایان تغییرات، مورد را ذخیره کنید."));
    window.requestAnimationFrame(() => document.querySelector(".step4-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function cancelEdit() {
    setDraft(emptyDraft());
    setEditingId(null);
    setMessage("");
  }

  function removeEntry(id: string) {
    setData((current) => ({ ...current, entries: current.entries.filter((entry) => entry.id !== id) }));
    if (editingId === id) cancelEdit();
    markDirty();
  }

  function summaryText() {
    const lines = [t("Step 4 Personal Inventory", "ترازنامه شخصی گام چهارم"), data.title, `${t("Started", "آغاز")}: ${formatDisplayDate(data.startedDate, language)}`, `${t("Status", "وضعیت")}: ${data.status === "complete" ? t("Complete", "کامل") : t("In progress", "در حال انجام")}`, ""];
    if (data.intention) lines.push(`${t("Purpose for this inventory", "هدف این ترازنامه")}: ${data.intention}`, "");
    for (const type of step4Types) {
      const matching = data.entries.filter((entry) => entry.type === type.id);
      if (!matching.length) continue;
      lines.push(language === "fa" ? type.fa : language === "es" ? type.es : type.en);
      matching.forEach((entry, index) => {
        const entryLabels = labelsForType(entry.type);
        lines.push(`${index + 1}. ${entry.subject}`);
        const fields: Array<[string, string]> = [[entryLabels.event, entry.event], [entryLabels.effect, entry.effect], [entryLabels.feelings, entry.feelings], [entryLabels.myPart, entry.myPart], [entryLabels.defects, entry.defects], [entryLabels.shortcomings, entry.shortcomings], [entryLabels.principles, entry.principles], [entryLabels.nextAction, entry.nextAction]];
        fields.forEach(([label, value]) => { if (value) lines.push(`   ${label}: ${value}`); });
      });
      lines.push("");
    }
    const reviewFields: Array<[string, string]> = [[t("Patterns I can now see", "الگوهایی که اکنون می‌بینم"), data.patternsSummary], [t("Strengths and assets I want to keep building", "توانایی‌ها و دارایی‌هایی که می‌خواهم تقویت کنم"), data.strengthsSummary], [t("Principles I will practice", "اصولی که تمرین خواهم کرد"), data.principlesPlan], [t("Support and guidance I need", "حمایت و راهنمایی مورد نیاز"), data.supportPlan], [t("Additional private notes", "یادداشت‌های خصوصی بیشتر"), data.notes]];
    reviewFields.forEach(([label, value]) => { if (value) lines.push(`${label}: ${value}`); });
    return lines.join("\n");
  }

  async function shareInventory() {
    const summary = summaryText();
    try {
      if (navigator.share) {
        await navigator.share({ title: data.title, text: summary });
        setMessage(t("Share menu opened.", "منوی اشتراک باز شد."));
      } else {
        await navigator.clipboard.writeText(summary);
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
      await onSave(data);
      setDirty(false);
      onDirtyChange?.(false);
      setMessage(t("Step 4 inventory saved privately.", "ترازنامه گام چهارم به‌صورت خصوصی ذخیره شد."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Could not save. Please try again.", "ذخیره انجام نشد. دوباره تلاش کنید."));
    } finally {
      setSaving(false);
    }
  }

  const sectionCount = new Set(data.entries.map((entry) => entry.type)).size;

  return (
    <div className="inventory-layout step4-workbook-editor" data-inventory="step4">
      <section className="inventory-main">
        <header className="inventory-header step4-workbook-header">
          <div className="inventory-title-block"><span className="step-badge">4</span><div><h2>{t("Searching personal inventory", "ترازنامه شخصی جست‌وجوگرانه")}</h2><p>{t("Work at your own pace. Save, return, revise, and ask for trusted guidance when needed.", "با سرعت خود پیش بروید. ذخیره کنید، بازگردید، ویرایش کنید و در صورت نیاز راهنمایی قابل اعتماد بخواهید.")}</p></div></div>
          <label className="step4-status-select"><span>{t("Workbook status", "وضعیت دفتر کار")}</span><select value={data.status} onChange={(event) => updateData("status", event.target.value as Step4Data["status"])}><option value="in_progress">{t("In progress", "در حال انجام")}</option><option value="complete">{t("Complete", "کامل")}</option></select></label>
        </header>

        <div className="inventory-content">
          <section className="step4-workbook-intro">
            <label className="form-field full" htmlFor="step4-title"><span>{t("Inventory name", "نام ترازنامه")}</span><input id="step4-title" className="form-input" value={data.title} onChange={(event) => updateData("title", event.target.value)} maxLength={100} /></label>
            <label className="form-field full" htmlFor="step4-intention"><span>{t("What is my purpose for completing this inventory?", "هدف من از تکمیل این ترازنامه چیست؟")}</span><textarea id="step4-intention" className="form-textarea" value={data.intention} onChange={(event) => updateData("intention", event.target.value)} /></label>
          </section>

          <div className="step4-type-tabs" role="tablist" aria-label={t("Inventory sections", "بخش‌های ترازنامه")}>{step4Types.map((type) => <button key={type.id} type="button" className={activeType === type.id ? "is-active" : ""} onClick={() => { setActiveType(type.id); cancelEdit(); }}>{language === "fa" ? type.fa : language === "es" ? type.es : type.en}<span> ({data.entries.filter((entry) => entry.type === type.id).length})</span></button>)}</div>

          <div className="step4-section-guide"><div><strong>{language === "fa" ? selectedType.fa : language === "es" ? selectedType.es : selectedType.en}</strong><p>{language === "fa" ? selectedType.descriptionFa : language === "es" ? selectedType.descriptionEs : selectedType.descriptionEn}</p></div>{onOpenLearning && <button className="button button-outline button-small" type="button" onClick={onOpenLearning}><BookOpenText size={16} />{t("Learn about defects and principles", "یادگیری درباره نقص‌ها و اصول")}</button>}</div>

          <section className={`step4-form${editingId ? " is-editing" : ""}`}>
            <div className="step4-form-heading"><div><span>{editingId ? t("Editing saved entry", "ویرایش مورد ذخیره‌شده") : t("New entry", "مورد جدید")}</span><h3>{editingId ? t("Update this entry", "به‌روزرسانی این مورد") : t("Add a detailed entry", "افزودن مورد کامل")}</h3></div>{editingId && <button className="button button-quiet button-small" type="button" onClick={cancelEdit}><X size={15} />{t("Cancel edit", "لغو ویرایش")}</button>}</div>
            <div className="prompt-grid">{(Object.keys(labels) as Array<keyof EntryDraft>).map((key) => <div className={`form-field${key !== "subject" ? " full" : ""}`} key={key}><label htmlFor={`step4-${key}`}>{labels[key]}</label>{key === "subject" ? <input id={`step4-${key}`} className="form-input" value={draft[key]} onChange={(event) => updateDraft(key, event.target.value)} /> : <textarea id={`step4-${key}`} className="form-textarea" value={draft[key]} onChange={(event) => updateDraft(key, event.target.value)} />}</div>)}</div>
            <button className="button button-primary" type="button" onClick={saveEntry}><Plus size={17} />{editingId ? t("Save entry changes", "ذخیره تغییرات مورد") : t("Add to inventory", "افزودن به ترازنامه")}</button>
          </section>

          <section className="step4-entry-list" aria-live="polite">{visibleEntries.length === 0 ? <div className="step4-description">{t("No entries in this section yet. Add one when you are ready.", "هنوز موردی در این بخش ثبت نشده است. هر زمان آماده بودید یک مورد اضافه کنید.")}</div> : visibleEntries.map((entry) => <article className="step4-entry step4-entry-detailed" key={entry.id}><div><strong>{entry.subject}</strong><p>{entry.event}</p>{entry.defects && <p><b>{t("Character defects", "نقص‌های شخصیتی")}:</b> {entry.defects}</p>}{entry.shortcomings && <p><b>{t("Shortcomings", "کمبودهای رفتاری")}:</b> {entry.shortcomings}</p>}{entry.principles && <p><b>{t("Corrective principles", "اصول اصلاحی")}:</b> {entry.principles}</p>}{entry.nextAction && <p><b>{t("Recovery action", "اقدام بهبودی")}:</b> {entry.nextAction}</p>}</div><div className="step4-entry-actions"><button type="button" className="icon-button" onClick={() => editEntry(entry)} aria-label={t("Edit entry", "ویرایش مورد")}><Pencil size={16} /></button><button type="button" className="icon-button" onClick={() => removeEntry(entry.id)} aria-label={t("Delete entry", "حذف مورد")}><Trash2 size={16} /></button></div></article>)}</section>

          <section className="step4-review-section">
            <div className="step4-review-heading"><span>{t("Bring the inventory together", "جمع‌بندی ترازنامه")}</span><h3>{t("Patterns, assets, and recovery direction", "الگوها، توانایی‌ها و مسیر بهبودی")}</h3><p>{t("Complete this review as themes become clearer. You can return and revise it at any time.", "با روشن‌تر شدن موضوع‌ها این مرور را تکمیل کنید. هر زمان می‌توانید بازگردید و آن را ویرایش کنید.")}</p></div>
            <div className="prompt-grid">{([["patternsSummary", t("What repeating patterns or character defects can I now see?", "اکنون چه الگوهای تکراری یا نقص‌های شخصیتی را می‌بینم؟")], ["strengthsSummary", t("What strengths, assets, and healthy choices do I want to keep building?", "چه توانایی‌ها، دارایی‌ها و انتخاب‌های سالمی را می‌خواهم تقویت کنم؟")], ["principlesPlan", t("Which corrective principles will I practice, and what will that look like?", "کدام اصول اصلاحی را تمرین خواهم کرد و این کار چگونه خواهد بود؟")], ["supportPlan", t("What support, sponsor guidance, or professional help may be useful?", "چه حمایت، راهنمایی حامی یا کمک حرفه‌ای می‌تواند مفید باشد؟")], ["notes", t("Additional private notes", "یادداشت‌های خصوصی بیشتر")]] as const).map(([key, label]) => <label className="form-field full" key={key} htmlFor={`step4-review-${key}`}><span>{label}</span><textarea id={`step4-review-${key}`} className="form-textarea" value={data[key]} onChange={(event) => updateData(key, event.target.value)} /></label>)}</div>
          </section>
        </div>
      </section>

      <aside className="inventory-sidebar">
        <section className="inventory-sidebar-card"><h3>{t("Workbook overview", "نمای کلی دفتر کار")}</h3><p>{t("Started", "آغاز")}: {formatDisplayDate(data.startedDate, language)}</p><div className="summary-stats"><div className="summary-stat"><strong>{data.entries.length}</strong><span>{t("Total entries", "کل موارد")}</span></div><div className="summary-stat"><strong>{sectionCount}</strong><span>{t("Sections used", "بخش‌های استفاده‌شده")}</span></div></div><span className={`step4-workbook-status is-${data.status}`}>{data.status === "complete" ? t("Marked complete", "کامل‌شده") : t("Work in progress", "در حال انجام")}</span></section>
        <section className="inventory-sidebar-card"><h3>{t("Keep or share", "ذخیره یا اشتراک")}</h3><p>{t("Save before opening another workbook or leaving this page. Share only when you feel ready.", "پیش از باز کردن دفتر دیگر یا ترک صفحه ذخیره کنید. فقط زمانی که آماده هستید به اشتراک بگذارید.")}</p><div className="sidebar-actions"><button className="button button-primary" type="button" onClick={saveInventory} disabled={saving}><Save size={17} />{saving ? t("Saving…", "در حال ذخیره…") : t("Save Step 4 inventory", "ذخیره ترازنامه گام چهارم")}</button><button className="button button-outline" type="button" onClick={shareInventory}><Share2 size={17} />{t("Share with sponsor", "اشتراک با حامی")}</button><button className="button button-outline" type="button" onClick={async () => { await navigator.clipboard.writeText(summaryText()); setMessage(t("Private summary copied.", "خلاصه خصوصی کپی شد.")); }}><Copy size={17} />{t("Copy private summary", "کپی خلاصه خصوصی")}</button><button className="button button-outline" type="button" onClick={() => onExport?.(data)} disabled={!onExport}><FileDown size={17} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button></div>{dirty && <p className="step4-unsaved-note">{t("You have unsaved changes.", "تغییرات ذخیره‌نشده دارید.")}</p>}{message && <p className="toast-note" role="status"><Check size={14} /> {message}</p>}</section>
      </aside>
    </div>
  );
}

export type { Step4Data, Step4Entry };
