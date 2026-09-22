"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarRange, FileDown, X } from "lucide-react";
import { formatDisplayDate, principleCategories, principles, step4Types } from "@/lib/inventory";
import { useLanguage } from "./language-provider";
import type { Step10Data } from "./step10-inventory";
import type { Step4Data, Step4Entry } from "./step4-inventory";

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

type ExportScope = "day" | "range" | "month" | "year";

type InventoryExportProps = {
  records: InventoryRecord[];
  selectedDate: string;
  year: number;
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

function PrintDocument({ records, scopeLabel }: { records: InventoryRecord[]; scopeLabel: string }) {
  const { language, t } = useLanguage();
  const sorted = React.useMemo(() => [...records].sort((left, right) => {
    const dateOrder = left.date.localeCompare(right.date);
    if (dateOrder !== 0) return dateOrder;
    return left.type === right.type ? 0 : left.type === "step10" ? -1 : 1;
  }), [records]);

  return (
    <div className="inventory-print-root" aria-hidden="true" dir={language === "fa" ? "rtl" : "ltr"}>
      <header className="inventory-print-cover">
        <p>{t("PRIVATE INVENTORY EXPORT", "خروجی خصوصی ترازنامه")}</p>
        <h1>{t("Recovery Inventory", "ترازنامه بهبودی")}</h1>
        <div><span>{scopeLabel}</span><span>{language === "es" ? `${sorted.length} ${sorted.length === 1 ? "inventario guardado" : "inventarios guardados"}` : t(`${sorted.length} saved ${sorted.length === 1 ? "inventory" : "inventories"}`, `${sorted.length} ترازنامه ذخیره‌شده`)}</span></div>
      </header>

      {sorted.length === 0 ? (
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
    </div>
  );
}

export const InventoryExport = React.forwardRef<InventoryExportHandle, InventoryExportProps>(function InventoryExport(
  { records, selectedDate, year },
  ref,
) {
  const { language, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [scope, setScope] = React.useState<ExportScope>("day");
  const [day, setDay] = React.useState(selectedDate);
  const [rangeStart, setRangeStart] = React.useState(selectedDate);
  const [rangeEnd, setRangeEnd] = React.useState(selectedDate);
  const [month, setMonth] = React.useState(selectedDate.slice(0, 7));
  const [includeStep10, setIncludeStep10] = React.useState(true);
  const [includeStep4, setIncludeStep4] = React.useState(true);
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
      setScope("day");
      setDay(selectedDate);
      setRangeStart(selectedDate);
      setRangeEnd(selectedDate);
      setMonth(selectedDate.slice(0, 7));
      setIncludeStep10(options?.type ? options.type === "step10" : true);
      setIncludeStep4(options?.type ? options.type === "step4" : true);
      setOpen(true);
      window.setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    },
  }), [selectedDate]);

  const filteredRecords = React.useMemo(() => {
    const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
    return records.filter((record) => {
      const includedType = (record.type === "step10" && includeStep10) || (record.type === "step4" && includeStep4);
      if (!includedType) return false;
      if (scope === "day") return record.date === day;
      if (scope === "range") return record.date >= start && record.date <= end;
      if (scope === "month") return record.date.startsWith(`${month}-`);
      return record.date.startsWith(`${String(year).padStart(4, "0")}-`);
    });
  }, [day, includeStep10, includeStep4, month, rangeEnd, rangeStart, records, scope, year]);

  const scopeLabel = React.useMemo(() => {
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (scope === "day") return validDate(day) ? formatDisplayDate(day, language) : t("Choose a day", "یک روز انتخاب کنید");
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
  }, [day, language, month, rangeEnd, rangeStart, scope, t, year]);

  const dateCount = new Set(filteredRecords.map((record) => record.date)).size;
  const canPrint = filteredRecords.length > 0 && (includeStep10 || includeStep4);

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
    document.title = `${t("Recovery Inventory", "ترازنامه بهبودی")} - ${scopeLabel}`;
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
            <legend>{t("Date selection", "انتخاب تاریخ")}</legend>
            <div className="inventory-export-scope" role="radiogroup">
              {([
                ["day", t("One day", "یک روز")],
                ["range", t("Date range", "بازه تاریخ")],
                ["month", t("Month", "ماه")],
                ["year", t("Year", "سال")],
              ] as const).map(([value, label]) => (
                <label className={scope === value ? "is-selected" : ""} key={value}><input type="radio" name="export-scope" value={value} checked={scope === value} onChange={() => setScope(value)} /><span>{label}</span></label>
              ))}
            </div>
            <div className="inventory-export-date-fields">
              {scope === "day" && <label><span>{t("Day", "روز")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={day} onChange={(event) => setDay(event.target.value)} /></label>}
              {scope === "range" && <><label><span>{t("From", "از")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} /></label><label><span>{t("Through", "تا")}</span><input type="date" min={firstDayOfYear(year)} max={lastDayOfYear(year)} value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} /></label></>}
              {scope === "month" && <label><span>{t("Month", "ماه")}</span><input type="month" min={`${year}-01`} max={`${year}-12`} value={month} onChange={(event) => setMonth(event.target.value)} /></label>}
              {scope === "year" && <div className="inventory-export-year"><span>{t("Calendar year", "سال تقویم")}</span><strong>{new Intl.NumberFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", { useGrouping: false }).format(year)}</strong></div>}
            </div>
          </fieldset>

          <fieldset className="inventory-export-fieldset">
            <legend>{t("Include", "شامل")}</legend>
            <div className="inventory-export-types">
              <label className={includeStep10 ? "is-selected" : ""}><input type="checkbox" checked={includeStep10} onChange={(event) => toggleType("step10", event.target.checked)} /><span><b>10</b>{t("Daily inventories", "ترازنامه‌های روزانه")}</span></label>
              <label className={includeStep4 ? "is-selected" : ""}><input type="checkbox" checked={includeStep4} onChange={(event) => toggleType("step4", event.target.checked)} /><span><b>4</b>{t("Personal inventories", "ترازنامه‌های شخصی")}</span></label>
            </div>
          </fieldset>

          <div className="inventory-export-summary">
            <div><strong>{filteredRecords.length}</strong><span>{t(filteredRecords.length === 1 ? "saved inventory" : "saved inventories", "ترازنامه ذخیره‌شده")}</span></div>
            <div><strong>{dateCount}</strong><span>{t(dateCount === 1 ? "date" : "dates", "تاریخ")}</span></div>
            <p>{canPrint ? scopeLabel : t("No saved inventories match this selection.", "هیچ ترازنامه ذخیره‌شده‌ای با این انتخاب مطابقت ندارد.")}</p>
            <button className="button button-primary" type="button" onClick={printExport} disabled={!canPrint}><FileDown size={17} />{t("Print / Save PDF", "چاپ / ذخیره PDF")}</button>
          </div>
        </section>
      )}

      {canUseDom
        ? createPortal(
          <PrintDocument records={filteredRecords} scopeLabel={scopeLabel} />,
          document.body,
        )
        : null}
    </>
  );
});
