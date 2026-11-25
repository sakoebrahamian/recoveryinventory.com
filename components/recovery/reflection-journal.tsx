"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { LockKeyhole, Save } from "lucide-react";
import { formatDisplayDate } from "@/lib/inventory";
import { isIsoCalendarDate } from "@/lib/free-account";
import { localizedPath } from "@/lib/languages";
import { reflectionLabels, reflectionText, type ReflectionMessage } from "@/lib/reflection-copy";
import {
  morningPractices, parseReflection, reflectionFieldLimit, reflectionFields, reflectionSlugs, trackedPatterns,
  type ReflectionEntry, type ReflectionField, type ReflectionKind, type ReflectionPayload,
} from "@/lib/reflection-journals";
import { useLanguage } from "./language-provider";

type Props = {
  kind: ReflectionKind;
  initialDate: string;
  onDirtyChange: (dirty: boolean) => void;
};

export function ReflectionJournal({ kind, initialDate, onDirtyChange }: Props) {
  const { language, t } = useLanguage();
  const text = (key: ReflectionMessage) => reflectionText(language, key);
  const fieldId = useId();
  const [entries, setEntries] = useState<ReflectionEntry[] | null>(null);
  const [date, setDate] = useState(initialDate);
  const [draft, setDraft] = useState<ReflectionPayload>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [status, setStatus] = useState<"saved" | "required" | "failed" | "membership" | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/reflections?kind=" + kind, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error();
        const result = await response.json() as { entries: ReflectionEntry[] };
        if (controller.signal.aborted) return;
        setEntries(result.entries);
        setDraft(result.entries.find((entry) => entry.date === initialDate)?.payload ?? {});
      } catch {
        if (!controller.signal.aborted) setReadFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [kind, initialDate, loadAttempt]);

  function setField(field: ReflectionField, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setDirty(true);
    onDirtyChange(true);
    setStatus(null);
  }

  function selectDate(next: string) {
    if (!isIsoCalendarDate(next) || next === date) return;
    if (dirty && !window.confirm(text("unsaved"))) return;
    setDate(next);
    setDraft(entries?.find((entry) => entry.date === next)?.payload ?? {});
    setDirty(false);
    onDirtyChange(false);
    setStatus(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const payload = parseReflection(kind, draft);
    if (!payload) {
      setStatus("required");
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, date, payload }),
      });
      if (!mounted.current) return;
      if (response.status === 403) {
        setStatus("membership");
        return;
      }
      if (!response.ok) throw new Error();
      const { entry } = await response.json() as { entry: ReflectionEntry };
      if (!mounted.current) return;
      setDraft(entry.payload);
      setEntries((previous) => [entry, ...(previous ?? []).filter((row) => row.date !== date)]
        .sort((a, b) => b.date.localeCompare(a.date)));
      setDirty(false);
      onDirtyChange(false);
      setStatus("saved");
    } catch {
      if (mounted.current) setStatus("failed");
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  const copy = reflectionLabels[kind];
  const patterns = kind === "step67" ? trackedPatterns(entries ?? []) : [];
  const number = new Intl.NumberFormat(language);

  return (
    <section className="dashboard-card ri-reflection-journal" aria-labelledby={fieldId + "-title"}>
      <header className="ri-reflection-heading">
        <div>
          <span className="public-learning-eyebrow">{text(copy.label)}</span>
          <h3 id={fieldId + "-title"}>{text(kind)}</h3>
          <p>{text(copy.intro)}</p>
        </div>
        <a className="text-link" href={localizedPath(language, "/learn/" + reflectionSlugs[kind])}>{t("Read guide", "مطالعه راهنما")}</a>
      </header>
      {readFailed ? (
        <div role="alert">
          <p>{text("readError")}</p>
          <button className="button button-outline" type="button" onClick={() => { setReadFailed(false); setLoadAttempt((value) => value + 1); }}>{t("Please try again.", "لطفاً دوباره تلاش کنید.")}</button>
        </div>
      ) : entries === null ? (
        <p role="status">{t("Loading inventories…", "در حال بارگذاری ترازنامه‌ها…")}</p>
      ) : (
        <form onSubmit={save}>
          <fieldset className="ri-reflection-fields" disabled={saving}>
            <div className="ri-reflection-dates">
              <label className="form-field">
                <span>{t("Inventory date", "تاریخ ترازنامه")}</span>
                <input className="form-input" type="date" value={date} onChange={(event) => selectDate(event.target.value)} />
              </label>
              {entries.length > 0 && <label className="form-field">
                <span>{text("savedDates")}</span>
                <select className="form-input" value={entries.some((entry) => entry.date === date) ? date : ""} onChange={(event) => selectDate(event.target.value)}>
                  <option value="" disabled>{text("savedDates")}</option>
                  {entries.map((entry) => <option key={entry.date} value={entry.date}>{formatDisplayDate(entry.date, language)}</option>)}
                </select>
              </label>}
            </div>
            {reflectionFields[kind].map((field) => {
              const id = fieldId + "-" + field;
              const value = draft[field] ?? "";
              return (
                <div className="form-field" key={field}>
                  <label htmlFor={id}>{text(field)}</label>
                  {field === "willingness" && <small>{t("Willingness", "تمایل")}</small>}
                  {field === "humility" && <small>{t("Humility", "فروتنی")}</small>}
                  {field === "responsibility" && <small>{t("Making things right", "جبران خسارت")}</small>}
                  {field === "intention" && <small>{t("Faith", "ایمان")} · {t("Mindfulness", "ذهن‌آگاهی")}</small>}
                  {field === "practice" ? (
                    <select id={id} className="form-input" value={value} onChange={(event) => setField(field, event.target.value)}>
                      <option value="">—</option>
                      {morningPractices.map((practice) => <option key={practice} value={practice}>{text(practice)}</option>)}
                    </select>
                  ) : field === "initials" || field === "pattern" ? (
                    <input id={id} className="form-input" dir="auto" maxLength={reflectionFieldLimit(field)} value={value} onChange={(event) => setField(field, event.target.value)} />
                  ) : (
                    <textarea id={id} className="form-textarea" dir="auto" rows={3} maxLength={reflectionFieldLimit(field)} value={value} onChange={(event) => setField(field, event.target.value)} aria-describedby={field === "humility" ? id + "-help" : undefined} />
                  )}
                  {field === "humility" && <small id={id + "-help"}>{text("higherPower")}</small>}
                </div>
              );
            })}
            <div className="ri-reflection-actions">
              <button className="button button-primary" type="submit"><Save size={17} aria-hidden="true" />{saving ? t("Saving…", "در حال ذخیره…") : t("Save inventory", "ذخیره ترازنامه")}</button>
            </div>
          </fieldset>
          {status && <p className={status === "saved" ? "form-success" : "form-error"} role="status">
            {status === "saved" ? t("Inventory saved privately.", "ترازنامه به‌صورت خصوصی ذخیره شد.")
              : status === "required" ? text("writeFirst")
              : status === "membership" ? text("paidJournals")
              : t("Could not save. Please try again.", "ذخیره انجام نشد. دوباره تلاش کنید.")}
          </p>}
        </form>
      )}
      {patterns.length > 0 && (
        <section className="ri-reflection-patterns" aria-labelledby={fieldId + "-patterns"}>
          <h4 id={fieldId + "-patterns"}>{text("tracked")}</h4>
          <ul>
            {patterns.map(({ name, count }) => <li key={name}>
              <button className="button button-outline" type="button" disabled={saving} onClick={() => setField("pattern", name)}><bdi>{name}</bdi><span>{number.format(count)}</span></button>
            </li>)}
          </ul>
        </section>
      )}
    </section>
  );
}

export function MorningIntention({ date, onOpen }: { date: string; onOpen: () => void }) {
  const { language } = useLanguage();
  const [entry, setEntry] = useState<ReflectionEntry | null>(null);
  useEffect(() => {
    if (!isIsoCalendarDate(date)) return;
    const controller = new AbortController();
    void fetch("/api/reflections?kind=step11&date=" + date, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { entries: ReflectionEntry[] } : null)
      .then((result) => { if (!controller.signal.aborted) setEntry(result?.entries[0] ?? null); })
      .catch(() => {});
    return () => controller.abort();
  }, [date]);
  if (entry?.date !== date || !entry.payload.intention) return null;
  return (
    <aside className="ri-morning-intention">
      <div><strong><LockKeyhole size={15} aria-hidden="true" />{reflectionText(language, "morningIntention")}</strong><p dir="auto">{entry.payload.intention}</p></div>
      <button className="button button-outline" type="button" onClick={onOpen}>{reflectionText(language, "step11")}</button>
    </aside>
  );
}
