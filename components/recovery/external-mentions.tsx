"use client";

import type { Language } from "@/lib/inventory";
import { externalMentions } from "@/lib/external-mentions";
import { useLanguage } from "./language-provider";

export function ExternalMentions({ language: explicitLanguage }: { language?: Language }) {
  const { language: currentLanguage } = useLanguage();
  const language = explicitLanguage ?? currentLanguage;
  if (externalMentions.length === 0) return null;
  const title = { en: "Elsewhere about Recovery Inventory", es: "Recovery Inventory en otros medios", fa: "Recovery Inventory در رسانه‌های دیگر" }[language];
  return <aside className="external-mentions" aria-label={title}><h2>{title}</h2><ul>{externalMentions.map(mention => <li key={mention.url}><a href={mention.url} rel="noopener noreferrer"><bdi>{mention.publisher}</bdi>: {mention.title}</a><time dateTime={mention.published}>{new Intl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${mention.published}T12:00:00Z`))}</time></li>)}</ul></aside>;
}
