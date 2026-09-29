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
