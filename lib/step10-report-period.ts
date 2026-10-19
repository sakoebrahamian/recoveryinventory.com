import { todayIso } from "@/lib/inventory";

export type ReportPeriodMode = "today" | "day" | "week" | "month" | "year" | "range";
export type ReportPeriod = { mode: ReportPeriodMode; from: string; through: string };
export type ReportBounds = { from: string; through: string; mode: ReportPeriodMode };

function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function reportBounds(period: ReportPeriod, selectedDay: string, today = todayIso()): ReportBounds | null {
  if (!validDay(selectedDay) || !validDay(today)) return null;
  let from = selectedDay;
  let through = selectedDay;
  if (period.mode === "today") {
    from = today;
    through = today;
  } else if (period.mode === "range") {
    from = period.from;
    through = period.through;
  } else if (period.mode === "week") {
    const monday = new Date(`${selectedDay}T12:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    from = isoDay(monday);
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    through = isoDay(sunday);
  } else if (period.mode === "month") {
    from = `${selectedDay.slice(0, 7)}-01`;
    const [year, month] = selectedDay.split("-").map(Number);
    through = isoDay(new Date(Date.UTC(year, month, 0, 12)));
  } else if (period.mode === "year") {
    from = `${selectedDay.slice(0, 4)}-01-01`;
    through = `${selectedDay.slice(0, 4)}-12-31`;
  }
  if (!validDay(from) || !validDay(through) || from > through || from > today) return null;
  return { from, through: through > today ? today : through, mode: period.mode };
}

export function defaultReportPeriod(day: string): ReportPeriod {
  return { mode: "day", from: day, through: day };
}

/** Compare calendar periods at the same point; custom ranges use the same number of days. */
export function comparisonReportBounds(bounds: ReportBounds): ReportBounds {
  const start = new Date(`${bounds.from}T12:00:00Z`);
  const end = new Date(`${bounds.through}T12:00:00Z`);
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (bounds.mode === "month") {
    const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1, 12));
    const last = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 0, 12));
    const currentLast = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 12));
    const through = end.getTime() === currentLast.getTime() ? last : new Date(first.getTime() + (Math.min(days, last.getUTCDate()) - 1) * 86_400_000);
    return { mode: "month", from: isoDay(first), through: isoDay(through) };
  }
  if (bounds.mode === "year") {
    const year = start.getUTCFullYear() - 1;
    const lastDay = new Date(Date.UTC(year, end.getUTCMonth() + 1, 0, 12)).getUTCDate();
    return { mode: "year", from: `${year}-01-01`, through: isoDay(new Date(Date.UTC(year, end.getUTCMonth(), Math.min(end.getUTCDate(), lastDay), 12))) };
  }
  const offset = bounds.mode === "week" ? 7 : days;
  return { mode: bounds.mode, from: isoDay(new Date(start.getTime() - offset * 86_400_000)), through: isoDay(new Date(end.getTime() - offset * 86_400_000)) };
}
