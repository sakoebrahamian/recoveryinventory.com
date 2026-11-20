"use client";

import * as React from "react";
import { Check, Palette, X } from "lucide-react";
import { journalThemeGroups, journalThemes, type JournalThemeGroup } from "@/lib/journal-themes";
import type { Language } from "@/lib/languages";
import { translateForLanguage, useLanguage } from "./language-provider";
import { useTheme } from "./theme-provider";

export function ThemePicker({ language: override }: { language?: Language }) {
  const { language } = useLanguage();
  const { theme, chooseTheme } = useTheme();
  const t = (english: string, farsi: string) => translateForLanguage(override ?? language, english, farsi);
  const current = journalThemes.find(item => item.id === theme)!;
  const [group, setGroup] = React.useState<JournalThemeGroup>(current.group);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  return (
    <div className="theme-picker">
      <button className="theme-picker-trigger" type="button" aria-haspopup="dialog" title={t(current.label, current.fa)} onClick={() => {
        setGroup(current.group);
        dialog.current?.showModal();
      }}>
        <Palette size={17} aria-hidden="true" />
        <span>{t("Color theme", "رنگ‌بندی")}</span>
      </button>
      <dialog ref={dialog} className="theme-picker-panel" aria-labelledby={titleId} onClick={event => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className="theme-picker-content">
          <div className="theme-picker-heading">
            <h2 id={titleId}>{t("Choose your colors", "رنگ‌های دلخواه خود را انتخاب کنید")}</h2>
            <button className="theme-picker-close" type="button" aria-label={t("Close", "بستن")} onClick={() => dialog.current?.close()}>
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <p>{t("Anyone can choose any theme.", "همه می‌توانند هر رنگ‌بندی را انتخاب کنند.")}</p>
          <div className="theme-picker-groups" role="group" aria-label={t("Theme collections", "مجموعه‌های رنگ‌بندی")}>
            {journalThemeGroups.map(collection => (
              <button type="button" key={collection.id} aria-pressed={collection.id === group} onClick={() => setGroup(collection.id)}>
                {t(collection.label, collection.fa)}
              </button>
            ))}
          </div>
          <div className="theme-picker-grid">
            {journalThemes.filter(item => item.group === group).map(item => (
              <button type="button" key={item.id} className="theme-choice" aria-pressed={theme === item.id} onClick={() => {
                chooseTheme(item.id);
                dialog.current?.close();
              }}>
                <span className="theme-choice-art" data-group={item.group} aria-hidden="true" style={{
                  "--preview-ink": item.ink,
                  "--preview-accent": item.accent,
                  "--preview-tint": item.tint,
                  "--preview-surface": item.surface,
                  "--preview-highlight": item.highlight,
                } as React.CSSProperties}>
                  <span className="theme-choice-paper"><i /><i /><i /></span>
                </span>
                <span className="theme-choice-label">{t(item.label, item.fa)}</span>
                {theme === item.id && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <p className="theme-picker-storage">{t("Saved on this browser.", "در این مرورگر ذخیره می‌شود.")}</p>
        </div>
      </dialog>
    </div>
  );
}
