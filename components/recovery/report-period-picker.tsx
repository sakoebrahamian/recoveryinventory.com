"use client";

import { formatDisplayDate, todayIso } from "@/lib/inventory";
import { reportBounds, type ReportPeriod, type ReportPeriodMode } from "@/lib/step10-report-period";
import { DateRangePicker } from "./date-range-picker";
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
    ["today", t("Today", "امروز")],
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
        <DateRangePicker id={`${id}-range`} from={period.from} through={period.through} max={todayIso()} onChange={(range) => onChange({ ...period, ...range })} />
      )}
      <small role="status">{bounds
        ? bounds.from === bounds.through
          ? formatDisplayDate(bounds.from, language)
          : `${formatDisplayDate(bounds.from, language)} – ${formatDisplayDate(bounds.through, language)}`
        : t("Choose a valid date range ending today or earlier.", "بازه تاریخی معتبری انتخاب کنید که تا امروز یا پیش از آن پایان یابد.")}</small>
    </div>
  );
}
