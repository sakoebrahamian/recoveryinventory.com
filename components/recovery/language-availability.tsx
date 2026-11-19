"use client";

import { Globe2 } from "lucide-react";
import { languages, languageNames, type Language } from "@/lib/languages";
import { translateForLanguage, useLanguage } from "./language-provider";

export function LanguageAvailability({ language: override }: { language?: Language }) {
  const { language: selected } = useLanguage();
  const language = override ?? selected;
  return <details className="language-availability">
    <summary><Globe2 size={16} aria-hidden="true" />{translateForLanguage(language, "Available in 10 languages", "در دسترس به ۱۰ زبان")}</summary>
    <ul>{languages.map(value => <li key={value} lang={value} dir="auto">{languageNames[value]}</li>)}</ul>
  </details>;
}
