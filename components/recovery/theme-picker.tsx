"use client";

import * as React from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { journalThemes } from "@/lib/journal-themes";
import type { Language } from "@/lib/languages";
import { translateForLanguage, useLanguage } from "./language-provider";
import { useTheme } from "./theme-provider";

export function ThemePicker({ language: override }: { language?: Language }) {
  const { language } = useLanguage();
  const { theme, chooseTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const container = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();
  const t = (english: string, farsi: string) => translateForLanguage(override ?? language, english, farsi);
  const current = journalThemes.find(item => item.id === theme)!;
  React.useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return <div className="theme-picker" ref={container} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
  }}>
    <button className="theme-picker-trigger" type="button" ref={trigger} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={id} title={t(current.label, current.fa)}>
      <Palette size={17} aria-hidden="true" /><span>{t("Color theme", "رنگ‌بندی")}</span><ChevronDown size={14} aria-hidden="true" />
    </button>
    {open && <div className="theme-picker-panel" id={id} role="group" aria-label={t("Choose your colors", "رنگ‌های دلخواه خود را انتخاب کنید")}>
      <strong>{t("Choose your colors", "رنگ‌های دلخواه خود را انتخاب کنید")}</strong>
      <p>{t("Saved on this browser.", "در این مرورگر ذخیره می‌شود.")}</p>
      <div className="theme-picker-grid">{journalThemes.map(item => <button type="button" key={item.id} className="theme-choice" aria-pressed={theme === item.id} onClick={() => {
        chooseTheme(item.id); setOpen(false); trigger.current?.focus();
      }}>
        <span className="theme-choice-swatches" aria-hidden="true"><i style={{ background: item.ink }} /><i style={{ background: item.tint }} /><i style={{ background: item.paper }} /></span>
        <span>{t(item.label, item.fa)}</span>{theme === item.id && <Check size={16} aria-hidden="true" />}
      </button>)}</div>
    </div>}
  </div>;
}
