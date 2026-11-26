"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { dateTimeFormat, languageLocale } from "@/lib/languages";
import { useLanguage } from "./language-provider";

type Range = { from: string; through: string };

const DAY = 86_400_000;
const toDate = (value: string) => new Date(`${value}T12:00:00Z`);
const toIso = (date: Date) => date.toISOString().slice(0, 10);
const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(toDate(value).getTime()) && toIso(toDate(value)) === value;
const addDays = (value: string, days: number) => toIso(new Date(toDate(value).getTime() + days * DAY));
const monthStart = (value: string) => `${value.slice(0, 7)}-01`;
function addMonths(month: string, count: number) {
  const date = toDate(month);
  return toIso(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1, 12)));
}
const daysBetween = (from: string, through: string) => Math.round((toDate(through).getTime() - toDate(from).getTime()) / DAY) + 1;

/** One calendar for a whole date range: the first click sets the start, the second sets the end. */
export function DateRangePicker({ from, through, onChange, min, max, id }: {
  from: string;
  through: string;
  onChange: (range: Range) => void;
  min?: string;
  max?: string;
  id: string;
}) {
  const { language, t } = useLanguage();
  const dialog = React.useRef<HTMLDialogElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const grid = React.useRef<HTMLDivElement>(null);
  const [start, setStart] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [focus, setFocus] = React.useState(through || from);
  const [view, setView] = React.useState(monthStart(through || from || max || toIso(new Date())));
  const locale = languageLocale(language, true);
  const number = new Intl.NumberFormat(languageLocale(language));
  const valid = isDay(from) && isDay(through) && from <= through;
  const allowed = (day: string) => (!min || day >= min) && (!max || day <= max);

  function open() {
    const end = isDay(through) ? through : max ?? toIso(new Date());
    const first = isDay(from) && from.slice(0, 7) !== end.slice(0, 7) ? monthStart(from) : addMonths(monthStart(end), -1);
    setView(daysBetween(first, end) > 62 ? addMonths(monthStart(end), -1) : first);
    setStart(null);
    setHover(null);
    setFocus(isDay(from) ? from : end);
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
  }

  function pick(day: string) {
    if (!allowed(day)) return;
    if (!start || day < start) {
      setStart(day);
      setFocus(day);
      return;
    }
    onChange({ from: start, through: day });
    setStart(null);
    close();
  }

  React.useEffect(() => {
    if (!dialog.current?.open) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${focus}"]`)?.focus();
  }, [focus, view]);

  function moveFocus(event: React.KeyboardEvent, day: string) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const steps: Record<string, number> = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7 };
    let next: string | null = null;
    if (event.key in steps) next = addDays(day, steps[event.key]);
    else if (event.key === "PageUp") next = addMonths(day, -1).slice(0, 8) + day.slice(8);
    else if (event.key === "PageDown") next = addMonths(day, 1).slice(0, 8) + day.slice(8);
    if (!next) return;
    event.preventDefault();
    if (!isDay(next)) next = addDays(addMonths(monthStart(next.slice(0, 7) + "-01"), 1), -1);
    if (!allowed(next)) return;
    const lastShown = addDays(addMonths(view, 2), -1);
    if (next < view) setView(monthStart(next));
    else if (next > lastShown) setView(addMonths(monthStart(next), -1));
    setFocus(next);
  }

  const days = valid ? daysBetween(from, through) : 0;
  const label = (day: string, options: Intl.DateTimeFormatOptions) => dateTimeFormat(locale, { timeZone: "UTC", ...options }).format(toDate(day));
  const summary = valid
    ? `${label(from, { month: "short", day: "numeric", ...(from.slice(0, 4) !== through.slice(0, 4) ? { year: "numeric" } : {}) })} – ${label(through, { month: "short", day: "numeric", year: "numeric" })}`
    : t("Choose dates", "انتخاب تاریخ‌ها");
  const dayCount = (count: number) => (count === 1 ? t("{count} day", "{count} روز") : t("{count} days", "{count} روز")).replace("{count}", number.format(count));
  const previewEnd = start && hover && hover >= start ? hover : null;
  const weekdays = Array.from({ length: 7 }, (_, i) => label(addDays("2024-01-01", i), { weekday: "narrow" }));
  const titleId = `${id}-title`;

  function month(offset: number) {
    const first = addMonths(view, offset);
    const lead = (toDate(first).getUTCDay() + 6) % 7;
    const total = daysBetween(first, addDays(addMonths(first, 1), -1));
    return (
      <div className="date-range-month" key={first}>
        <h3>{label(first, { month: "long", year: "numeric" })}</h3>
        <div className="date-range-weekdays" aria-hidden="true">{weekdays.map((name, i) => <span key={i}>{name}</span>)}</div>
        <div className="date-range-days" role="group" aria-label={label(first, { month: "long", year: "numeric" })}>
          {Array.from({ length: lead }, (_, i) => <span key={`blank-${i}`} />)}
          {Array.from({ length: total }, (_, i) => {
            const day = addDays(first, i);
            const rangeFrom = start ?? (valid ? from : null);
            const rangeTo = start ? previewEnd ?? start : valid ? through : null;
            const isEdge = day === rangeFrom || day === rangeTo;
            const inside = rangeFrom && rangeTo && day > rangeFrom && day < rangeTo;
            const classes = ["date-range-day", isEdge && "is-edge", inside && "is-inside", day === rangeFrom && "is-start", day === rangeTo && "is-end", day === toIso(new Date()) && "is-today"].filter(Boolean).join(" ");
            return (
              <button
                key={day}
                type="button"
                className={classes}
                data-day={day}
                disabled={!allowed(day)}
                tabIndex={day === focus ? 0 : -1}
                aria-pressed={Boolean(isEdge)}
                aria-label={label(day, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                onClick={() => pick(day)}
                onMouseEnter={() => setHover(day)}
                onFocus={() => { setHover(day); setFocus(day); }}
                onKeyDown={(event) => moveFocus(event, day)}
              >
                {number.format(Number(day.slice(8)))}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="date-range-picker">
      <button ref={trigger} id={id} type="button" className="date-range-trigger" aria-haspopup="dialog" onClick={open}>
        <CalendarDays size={17} aria-hidden="true" />
        <span>{summary}</span>
        {valid && <small>{dayCount(days)}</small>}
      </button>
      <dialog ref={dialog} className="date-range-dialog" aria-labelledby={titleId}
        onClose={() => { setStart(null); setHover(null); trigger.current?.focus(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="date-range-content">
          <div className="date-range-heading">
            <h2 id={titleId}>{t("Choose dates", "انتخاب تاریخ‌ها")}</h2>
            <button type="button" className="date-range-close" aria-label={t("Close", "بستن")} onClick={close}><X size={20} aria-hidden="true" /></button>
          </div>
          <p className="date-range-step" role="status">
            {start
              ? `${t("Choose the last day", "روز پایانی را انتخاب کنید")} · ${label(start, { month: "short", day: "numeric" })} – …`
              : t("Choose the first day", "روز آغاز را انتخاب کنید")}
          </p>
          <div className="date-range-nav">
            <button type="button" aria-label={t("Previous month", "ماه قبل")} disabled={Boolean(min) && view <= monthStart(min!)} onClick={() => setView(addMonths(view, -1))}><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" aria-label={t("Next month", "ماه بعد")} disabled={Boolean(max) && view >= monthStart(max!)} onClick={() => setView(addMonths(view, 1))}><ChevronRight size={18} aria-hidden="true" /></button>
          </div>
          <div className="date-range-months" ref={grid} onMouseLeave={() => setHover(null)}>
            {month(0)}
            {month(1)}
          </div>
        </div>
      </dialog>
    </div>
  );
}
