"use client";

import { dateTimeFormat } from "@/lib/languages";

import { expandLocalizedRecord } from "@/lib/localization";
import { memberFeedback, memberFeedbackIds } from "@/lib/member-feedback";

import { useLanguage } from "./language-provider";

// Snapshot reviewed 2026-11-19: six distinct users supplied feedback with
// publication permission. This counts contributors, not live subscriptions or inventories.
const reviewedOn = "2026-11-19";
export function EarlyCommunityProof() {
  const { language, t } = useLanguage();
  const copy = expandLocalizedRecord({
    en: { users: "early users have shared feedback", date: "Updated", feedback: "Read their feedback" },
    es: { users: "usuarios iniciales han compartido comentarios", date: "Actualizado", feedback: "Leer sus comentarios" },
    fa: { users: "کاربر اولیه بازخورد داده‌اند", date: "به‌روزرسانی", feedback: "خواندن بازخورد آن‌ها" },
  })[language];
  const date = dateTimeFormat(language === "fa" ? "fa-IR-u-ca-gregory" : language, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${reviewedOn}T12:00:00Z`));
  return <aside className="ri-early-community" aria-label={t("Early community", "جامعه اولیه")}>
    <div className="ri-community-initials" aria-hidden="true">
      {memberFeedbackIds.map(id => {
        const initials = memberFeedback[id].name.split(/\s+/).slice(0, 2).map(word => word[0]).join("");
        return <span key={id}>{initials}</span>;
      })}
    </div>
    <strong>{new Intl.NumberFormat(language).format(memberFeedbackIds.length)} {copy.users}</strong>
    <span>{copy.date}: <time dateTime={reviewedOn}>{date}</time></span>
    <a href="#member-feedback">{copy.feedback}</a>
  </aside>;
}
