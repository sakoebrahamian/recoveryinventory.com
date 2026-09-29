"use client";

import { formatDisplayDate, todayIso } from "@/lib/inventory";
import { reportBounds, type ReportPeriod, type ReportPeriodMode } from "@/lib/step10-report-period";
import { useLanguage } from "./language-provider";

export function ReportPeriodPicker({ period, onChange, selectedDay, id }: {
  period: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
  selectedDay: string;
  id: string;
}) {
  const { language, t } = useLanguage();
  const bounds = reportBounds(period, selectedDay);
  const modes: [ReportPeriodMode, string][] = [
    ["day", t("Selected day", "روز انتخاب‌شده")],
    ["week", t("Calendar week", "هفته تقویمی")],
    ["month", t("Calendar month", "ماه تقویمی")],
    ["year", t("Calendar year", "سال تقویمی")],
    ["range", t("Custom date range", "بازه دلخواه تاریخ")],
  ];

  return (
    <div className="report-period-picker">
      <label htmlFor={id}>{t("Analytics period", "بازه تحلیل")}</label>
      <select id={id} value={period.mode} onChange={(event) => onChange({ ...period, mode: event.target.value as ReportPeriodMode })}>
        {modes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
      {period.mode === "range" && (
        <div className="report-period-dates">
          <label>{t("From", "از")}<input type="date" value={period.from} max={todayIso()} onChange={(event) => onChange({ ...period, from: event.target.value })} /></label>
          <label>{t("Through", "تا")}<input type="date" value={period.through} max={todayIso()} onChange={(event) => onChange({ ...period, through: event.target.value })} /></label>
        </div>
      )}
      <small role="status">{bounds
        ? bounds.from === bounds.through
          ? formatDisplayDate(bounds.from, language)
          : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`
        : t("Choose a valid date range ending today or earlier.", "بازه تاریخی معتبری انتخاب کنید که تا امروز یا پیش از آن پایان یابد.")}</small>
    </div>
  );
}
