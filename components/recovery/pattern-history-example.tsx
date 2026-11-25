"use client";

import { useState } from "react";
import { dateTimeFormat, languageLocale } from "@/lib/languages";
import { step10QuestionSetVersion, type PrincipleState } from "@/lib/inventory";
import { calculateStep10PeriodAnalytics } from "@/lib/step10-analytics";
import { reflectionEntries } from "@/lib/step10-detail";
import { formatStep10FocusedReport } from "@/lib/step10-report";
import { reflectionText } from "@/lib/reflection-copy";
import type { ReportBounds } from "@/lib/step10-report-period";
import { useLanguage } from "./language-provider";
import { MemberTestimonial } from "./member-testimonials";

const week = [
  { date: "2026-11-16", state: "na" },
  { date: "2026-11-17", state: "attention" },
  { date: "2026-11-18", state: "practiced" },
  { date: "2026-11-19", state: "na" },
  { date: "2026-11-20", state: "attention" },
  { date: "2026-11-21", state: "practiced" },
  { date: "2026-11-22", state: "na" },
] as const;
const bounds: ReportBounds = { mode: "week", from: week[0].date, through: week[6].date };

export function PatternHistoryExample() {
  const { language, t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const weekdays = dateTimeFormat(languageLocale(language, true), { weekday: "short", timeZone: "UTC" });
  const status: Record<PrincipleState, string> = {
    practiced: t("Practiced", "تمرین کردم"),
    attention: t("Needs attention", "نیاز به توجه"),
    na: t("Didn’t come up today", "امروز پیش نیامد"),
  };
  const analytics = calculateStep10PeriodAnalytics(week.map(({ date, state }) => ({
    date,
    payload: {
      questionSetVersion: step10QuestionSetVersion,
      states: { patience: state },
      attentionNotes: date === "2026-11-17" ? { patience: t("I became impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد بی‌صبر شدم.") } : {},
      highlights: date === "2026-11-21" ? reflectionText(language, "secondNote") : "",
    },
  })), bounds);
  const notes = reflectionEntries(analytics);
  const report = formatStep10FocusedReport(analytics, bounds, ["patience"], selected, language, t, true);

  return (
    <section className="ri-section pattern-history-example" aria-labelledby="pattern-history-title">
      <div className="ri-section-heading">
        <h2 id="pattern-history-title">{reflectionText(language, "weekTitle")}</h2>
        <p>{reflectionText(language, "weekSummary")}</p>
      </div>
      <div className="pattern-history-layout">
        <div className="pattern-history-panel">
          <h3>{reflectionText(language, "weekCaption")}</h3>
          <ol className="ri-sample-week">
            {week.map(({ date, state }) => (
              <li key={date} className={"ri-sample-day is-" + state}>
                <strong>{weekdays.format(new Date(date + "T12:00:00Z"))}</strong>
                <span>{status[state]}</span>
              </li>
            ))}
          </ol>
          <p className="ri-sample-action">“{reflectionText(language, "weekAction")}”</p>
          <details className="ri-sponsor-example">
            <summary>{reflectionText(language, "previewSponsor")}</summary>
            <p>{reflectionText(language, "chooseSample")}</p>
            <div className="ri-sponsor-samples">
              {notes.map((note) => (
                <label key={note.id}>
                  <input type="checkbox" checked={selected.includes(note.id)} onChange={(event) => {
                    const checked = event.target.checked;
                    setSelected((current) => checked ? [...current, note.id] : current.filter((id) => id !== note.id));
                  }} />
                  <span>{note.text}</span>
                </label>
              ))}
            </div>
            <pre className="ri-sponsor-preview" aria-label={reflectionText(language, "previewSponsor")}>{report}</pre>
          </details>
          <a className="text-link pattern-history-demo" href={"/demo?step=analytics&lang=" + language}>
            {t("Explore the interactive analytics demo", "مشاهده نمونه تعاملی تحلیل")}
          </a>
        </div>
        <MemberTestimonial memberId="nancy" />
      </div>
    </section>
  );
}
