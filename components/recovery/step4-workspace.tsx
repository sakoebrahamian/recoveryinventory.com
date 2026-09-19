"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { BookOpenText, CheckCircle2, Clock3, Plus } from "lucide-react";
import { formatDisplayDate, step4Types, todayIso } from "@/lib/inventory";
import { Step4Inventory, type Step4Data, type Step4Entry } from "./step4-inventory";
import { useLanguage } from "./language-provider";

type Step4WorkbookRecord = {
  id: string;
  payload: Partial<Step4Data>;
  createdAt: number;
  updatedAt: number;
};

type Step4WorkspaceProps = {
  onOpenLearning: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

const subscribeToDom = () => () => undefined;
const getClientDomSnapshot = () => true;
const getServerDomSnapshot = () => false;

function workbookTitle(record: Step4WorkbookRecord, fallback: string) {
  return record.payload.title?.trim() || fallback;
}

function Step4PrintDocument({ data }: { data: Step4Data | null }) {
  const { language, t } = useLanguage();
  if (!data) return <div className="inventory-print-root" aria-hidden="true" />;

  const reviewFields = [
    [t("Purpose for this inventory", "هدف این ترازنامه"), data.intention],
    [t("Patterns I can now see", "الگوهایی که اکنون می‌بینم"), data.patternsSummary],
    [t("Strengths and assets I want to keep building", "توانایی‌ها و دارایی‌هایی که می‌خواهم تقویت کنم"), data.strengthsSummary],
    [t("Principles I will practice", "اصولی که تمرین خواهم کرد"), data.principlesPlan],
    [t("Support and guidance I need", "حمایت و راهنمایی مورد نیاز"), data.supportPlan],
    [t("Additional private notes", "یادداشت‌های خصوصی بیشتر"), data.notes],
  ] as const;

  const entryFields = (entry: Step4Entry) => [
    [t("What happened or what pattern appeared", "آنچه اتفاق افتاد یا الگویی که ظاهر شد"), entry.event],
    [t("Effect or consequences", "تأثیر یا پیامدها"), entry.effect],
    [t("Feelings", "احساسات"), entry.feelings],
    [t("My responsibility", "مسئولیت من"), entry.myPart],
    [t("Character defects", "نقص‌های شخصیتی"), entry.defects],
    [t("Shortcomings", "کمبودهای رفتاری"), entry.shortcomings],
    [t("Corrective principles", "اصول اصلاحی"), entry.principles],
    [t("Recovery action", "اقدام بهبودی"), entry.nextAction],
  ] as const;

  return (
    <div className="inventory-print-root" aria-hidden="true" dir={language === "fa" ? "rtl" : "ltr"}>
      <header className="inventory-print-cover">
        <p>{t("PRIVATE STEP 4 WORKBOOK", "دفتر خصوصی گام چهارم")}</p>
        <h1>{data.title}</h1>
        <div><span>{formatDisplayDate(data.startedDate, language)}</span><span>{data.status === "complete" ? t("Complete", "کامل") : t("In progress", "در حال انجام")}</span></div>
      </header>

      <article className="inventory-print-record">
        <header className="inventory-print-record-header"><span className="inventory-print-step">4</span><div><p>{t("STEP 4", "گام ۴")}</p><h2>{t("Searching personal inventory", "ترازنامه شخصی جست‌وجوگرانه")}</h2><time>{formatDisplayDate(data.startedDate, language)}</time></div></header>
        {step4Types.map((type) => {
          const matching = data.entries.filter((entry) => entry.type === type.id);
          if (!matching.length) return null;
          return (
            <section className="inventory-print-section" key={type.id}>
              <h3>{language === "fa" ? type.fa : language === "es" ? type.es : type.en}</h3>
              <p className="inventory-print-description">{language === "fa" ? type.descriptionFa : language === "es" ? type.descriptionEs : type.descriptionEn}</p>
              <div className="inventory-print-step4-list">{matching.map((entry, index) => <article className="inventory-print-step4-entry" key={entry.id}><div className="inventory-print-entry-title"><span>{index + 1}</span><h4>{entry.subject || "—"}</h4></div><dl>{entryFields(entry).map(([label, value]) => value?.trim() ? <div key={label}><dt>{label}</dt><dd>{value}</dd></div> : null)}</dl></article>)}</div>
            </section>
          );
        })}
        <section className="inventory-print-section"><h3>{t("Review and recovery direction", "مرور و مسیر بهبودی")}</h3><div className="inventory-print-reflections">{reviewFields.map(([label, value]) => <div key={label}><strong>{label}</strong><p>{value?.trim() || "—"}</p></div>)}</div></section>
        <footer className="inventory-print-footer"><span>{t("Recovery Inventory", "ترازنامه بهبودی")}</span><span>{t("Private Step 4 workbook", "دفتر خصوصی گام چهارم")}</span></footer>
      </article>
    </div>
  );
}

export function Step4Workspace({ onOpenLearning, onDirtyChange }: Step4WorkspaceProps) {
  const { language, t } = useLanguage();
  const [workbooks, setWorkbooks] = React.useState<Step4WorkbookRecord[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>("new");
  const [newDraft, setNewDraft] = React.useState<Partial<Step4Data>>({ startedDate: todayIso() });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [dirty, setDirty] = React.useState(false);
  const [draftVersion, setDraftVersion] = React.useState(0);
  const [printData, setPrintData] = React.useState<Step4Data | null>(null);
  const canUseDom = React.useSyncExternalStore(subscribeToDom, getClientDomSnapshot, getServerDomSnapshot);

  React.useEffect(() => {
    return () => document.documentElement.classList.remove("inventory-export-page");
  }, []);

  React.useEffect(() => {
    let stopped = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/step4-workbooks", { cache: "no-store" });
        const result = await response.json() as { workbooks?: Step4WorkbookRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || t("Could not load Step 4 inventories.", "ترازنامه‌های گام چهارم بارگذاری نشد."));
        if (stopped) return;
        const next = result.workbooks ?? [];
        setWorkbooks(next);
        if (next.length) setSelectedId(next[0].id);
      } catch (loadError) {
        if (!stopped) setError(loadError instanceof Error ? loadError.message : t("Could not load Step 4 inventories.", "ترازنامه‌های گام چهارم بارگذاری نشد."));
      } finally {
        if (!stopped) setLoading(false);
      }
    }
    void load();
    return () => { stopped = true; };
  }, [t]);

  React.useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);

  React.useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const selected = workbooks.find((record) => record.id === selectedId);
  const activeData = selected?.payload ?? newDraft;

  function confirmLeaveDraft() {
    return !dirty || window.confirm(t("You have unsaved Step 4 changes. Continue without saving them?", "تغییرات ذخیره‌نشده گام چهارم دارید. بدون ذخیره ادامه می‌دهید؟"));
  }

  function selectWorkbook(id: string) {
    if (id === selectedId || !confirmLeaveDraft()) return;
    setSelectedId(id);
    setDirty(false);
  }

  function startNewWorkbook() {
    if (!confirmLeaveDraft()) return;
    const number = workbooks.length + 1;
    setNewDraft({
      version: 2,
      title: `${t("My Step 4 inventory", "ترازنامه گام چهارم من")} ${number}`,
      status: "in_progress",
      startedDate: todayIso(),
      entries: [],
    });
    setSelectedId("new");
    setDirty(false);
    setDraftVersion((value) => value + 1);
    window.requestAnimationFrame(() => document.querySelector(".step4-workbook-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function saveWorkbook(payload: Step4Data) {
    const response = await fetch("/api/step4-workbooks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: selectedId === "new" ? undefined : selectedId, payload }),
    });
    const result = await response.json() as { id?: string; createdAt?: number; updatedAt?: number; error?: string };
    if (!response.ok || !result.id) throw new Error(result.error || t("Could not save this Step 4 inventory.", "این ترازنامه گام چهارم ذخیره نشد."));
    const now = Math.floor(Date.now() / 1000);
    const saved: Step4WorkbookRecord = {
      id: result.id,
      payload,
      createdAt: selected?.createdAt ?? result.createdAt ?? now,
      updatedAt: result.updatedAt ?? now,
    };
    setWorkbooks((current) => [saved, ...current.filter((record) => record.id !== result.id)].sort((left, right) => right.updatedAt - left.updatedAt));
    setSelectedId(result.id);
    setDirty(false);
  }

  function printWorkbook(data: Step4Data) {
    setPrintData(data);
    const originalTitle = document.title;
    document.title = `${data.title} - ${t("Recovery Inventory", "ترازنامه بهبودی")}`;
    document.documentElement.classList.add("inventory-export-page");
    const restore = () => {
      document.title = originalTitle;
      document.documentElement.classList.remove("inventory-export-page");
    };
    window.addEventListener("afterprint", restore, { once: true });
    window.setTimeout(() => window.print(), 50);
  }

  const dateLabel = (timestamp: number) => new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(timestamp * 1000));

  if (loading) return <div className="step4-workbook-loading"><div className="spinner" /><p>{t("Opening your Step 4 workbooks…", "در حال باز کردن دفترهای گام چهارم…")}</p></div>;
  if (error) return <div className="step4-workbook-error"><BookOpenText size={24} /><h3>{t("Step 4 workbooks are unavailable", "دفترهای گام چهارم در دسترس نیستند")}</h3><p>{error}</p></div>;

  return (
    <>
      <section className="step4-workbook-library" aria-labelledby="step4-library-title">
        <div className="step4-library-heading"><div><span>{t("Not tied to the daily calendar", "مستقل از تقویم روزانه")}</span><h2 id="step4-library-title">{t("My Step 4 workbooks", "دفترهای گام چهارم من")}</h2><p>{t("Build one inventory over time, return to revise it, or begin a separate inventory whenever you choose.", "یک ترازنامه را به‌مرور تکمیل و ویرایش کنید یا هر زمان خواستید ترازنامه جداگانه‌ای آغاز کنید.")}</p></div><button className="button button-primary" type="button" onClick={startNewWorkbook}><Plus size={17} />{t("Start a new Step 4 inventory", "شروع ترازنامه جدید گام چهارم")}</button></div>
        <div className="step4-workbook-list" role="list">
          {selectedId === "new" && <button className="step4-workbook-card is-active" type="button" role="listitem"><span className="step4-workbook-card-icon"><BookOpenText size={18} /></span><span><strong>{newDraft.title || t("New Step 4 inventory", "ترازنامه جدید گام چهارم")}</strong><small><Clock3 size={13} />{t("Not saved yet", "هنوز ذخیره نشده")}</small></span></button>}
          {workbooks.map((record, index) => {
            const fallback = `${t("Step 4 inventory", "ترازنامه گام چهارم")} ${workbooks.length - index}`;
            const entries = Array.isArray(record.payload.entries) ? record.payload.entries.length : 0;
            const complete = record.payload.status === "complete";
            return <button className={`step4-workbook-card${selectedId === record.id ? " is-active" : ""}`} type="button" role="listitem" key={record.id} onClick={() => selectWorkbook(record.id)}><span className="step4-workbook-card-icon">{complete ? <CheckCircle2 size={18} /> : <BookOpenText size={18} />}</span><span><strong>{workbookTitle(record, fallback)}</strong><small><Clock3 size={13} />{t("Edited", "ویرایش")}: {dateLabel(record.updatedAt)} · {entries} {t("entries", "مورد")}</small></span><em>{complete ? t("Complete", "کامل") : t("In progress", "در حال انجام")}</em></button>;
          })}
        </div>
      </section>

      <Step4Inventory key={`${selectedId}-${draftVersion}`} initialData={activeData} onSave={saveWorkbook} onExport={printWorkbook} onOpenLearning={onOpenLearning} onDirtyChange={setDirty} />
      {canUseDom ? createPortal(<Step4PrintDocument data={printData} />, document.body) : null}
    </>
  );
}
