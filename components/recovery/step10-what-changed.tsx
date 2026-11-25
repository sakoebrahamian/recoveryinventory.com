"use client";

import * as React from "react";
import { questionWithPrinciple } from "@/lib/inventory";
import type { Step10AnalyticsData } from "@/lib/step10-analytics";
import { buildStep10Trends } from "@/lib/step10-trends";
import { changeRows, fillTemplate } from "@/lib/step10-visuals";
import { HowWeCountLink } from "./step10-how-we-count";
import { statusLabel } from "./step10-trend-insights";
import { useLanguage } from "./language-provider";

const collapsedRows = 8;

export function Step10WhatChanged({ analytics }: { analytics: Step10AnalyticsData }) {
  const { language, t } = useLanguage();
  const [showAll, setShowAll] = React.useState(false);
  const trends = React.useMemo(() => buildStep10Trends(analytics.days), [analytics.days]);
  const rows = React.useMemo(() => changeRows(trends.questions), [trends]);
  const visible = showAll ? rows : rows.slice(0, collapsedRows);

  return <section className="analytics-what-changed analytics-panel" aria-labelledby="analytics-what-changed-title">
    <h3 id="analytics-what-changed-title">{t("What changed", "چه چیزی تغییر کرد")}</h3>
    <p>{t("Each row compares the first half of the selected dates with the second half. The biggest changes are listed first.", "هر ردیف نیمه اول تاریخ‌های انتخاب‌شده را با نیمه دوم مقایسه می‌کند. بزرگ‌ترین تغییرها اول آمده‌اند.")} <HowWeCountLink /></p>
    {!trends.halves || !rows.length ? <p className="trend-note">{t("Save inventories on more days to see how your answers change over this period.", "برای دیدن تغییر پاسخ‌هایتان در این بازه، در روزهای بیشتری ترازنامه ذخیره کنید.")}</p> : <>
      <ul className="change-legend" aria-hidden="true">
        <li><i className="change-dot is-earlier" />{t("First half", "نیمه اول")}</li>
        <li><i className="change-dot is-recent" />{t("Second half", "نیمه دوم")}</li>
      </ul>
      <ol className="change-rows">{visible.map((item) => {
        const earlier = item.earlier.rate ?? 0;
        const recent = item.recent.rate ?? 0;
        const comparison = fillTemplate(t("First half {earlier}% → second half {recent}% Practiced", "نیمه اول {earlier}% ← نیمه دوم {recent}% تمرین کردم"), { earlier, recent });
        const direction = recent > earlier ? "is-up" : recent < earlier ? "is-down" : "is-flat";
        return <li key={item.id} className={`change-row ${direction}`}>
          <div className="change-label">
            <strong>{questionWithPrinciple(item.id, language)}</strong>
            {item.status !== "unclear" && <span className={`trend-chip is-${item.status}`}>{statusLabel(item.status, t)}</span>}
          </div>
          <div className="change-track" role="img" aria-label={comparison}>
            <i className="change-span" style={{ insetInlineStart: `${Math.min(earlier, recent)}%`, width: `${Math.abs(recent - earlier)}%` }} />
            <i className="change-dot is-earlier" style={{ insetInlineStart: `${earlier}%` }} />
            <i className="change-dot is-recent" style={{ insetInlineStart: `${recent}%` }} />
          </div>
          <small>{comparison}</small>
        </li>;
      })}</ol>
      {rows.length > collapsedRows && <button type="button" className="button button-outline button-small" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>{showAll ? t("Show fewer questions", "نمایش پرسش‌های کمتر") : fillTemplate(t("Show all {count} questions", "نمایش هر {count} پرسش"), { count: rows.length })}</button>}
    </>}
  </section>;
}
