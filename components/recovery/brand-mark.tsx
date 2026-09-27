"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation avoids a production client-router interception issue. */

import { useLanguage } from "./language-provider";

export function BrandMark({ linked = true }: { linked?: boolean }) {
  const { language } = useLanguage();
  const homeLabel = language === "fa"
    ? "صفحه اصلی Recovery Inventory"
    : language === "es"
      ? "Inicio de Recovery Inventory"
      : "Recovery Inventory home";
  const mark = (
    <span className="brand-lockup">
      <svg className="brand-logo-icon" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
        <rect x="8" y="8" width="145" height="145" rx="34" fill="#071c2b" />
        <path d="M31 117 V46 H72 Q94 46 94 66 Q94 85 71 86 H31 M65 86 L97 117" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M119 47 V118" stroke="#21bda8" strokeWidth="12" strokeLinecap="round" />
        <circle cx="119" cy="31" r="6" fill="#21bda8" />
      </svg>
      <span className="brand-words">
        <strong>RECOVERY</strong>
        <span>Inventory</span>
      </span>
    </span>
  );

  return linked ? <a href="/" aria-label={homeLabel}>{mark}</a> : mark;
}
