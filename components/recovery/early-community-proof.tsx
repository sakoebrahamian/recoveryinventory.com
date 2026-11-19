"use client";

import { dateTimeFormat } from "@/lib/languages";

import { expandLocalizedRecord } from "@/lib/localization";

import { useLanguage } from "./language-provider";

// Snapshot reviewed 2026-11-19: six distinct users supplied feedback with
// publication permission. This counts contributors, not live subscriptions or inventories.
const snapshot = { users: 6, date: "2026-11-19" } as const;
export function EarlyCommunityProof() {
  const { language, t } = useLanguage();
  const copy = expandLocalizedRecord({
    en: { users: "early users have shared feedback", date: "Updated", feedback: "Read their feedback" },
    es: { users: "usuarios iniciales han compartido comentarios", date: "Actualizado", feedback: "Leer sus comentarios" },
    fa: { users: "کاربر اولیه بازخورد داده‌اند", date: "به‌روزرسانی", feedback: "خواندن بازخورد آن‌ها" },
  })[language];
  const date = dateTimeFormat(language === "fa" ? "fa-IR-u-ca-gregory" : language, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${snapshot.date}T12:00:00Z`));
  return <aside className="ri-early-community" aria-label={t("Early community", "جامعه اولیه")}>
    <strong>{new Intl.NumberFormat(language).format(snapshot.users)} {copy.users}</strong><span>{copy.date}: <time dateTime={snapshot.date}>{date}</time></span><a href="#member-feedback">{copy.feedback}</a>
  </aside>;
}
