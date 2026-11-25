"use client";

import { useState } from "react";
import { todayIso } from "@/lib/inventory";
import type { Language } from "@/lib/languages";
import { reflectionChoiceText, reflectionText, type ReflectionMessage } from "@/lib/reflection-copy";
import {
  entryPattern, reflectionChoiceCounts, reflectionChoices, reflectionEntriesInPeriod, trackedPatterns,
  type ReflectionChoiceField, type ReflectionEntry, type ReflectionPayload, type ReflectionPeriod,
} from "@/lib/reflection-journals";
import { useLanguage } from "./language-provider";

type ChoiceInputsProps = {
  kind: "step67" | "step89";
  draft: ReflectionPayload;
  entries: readonly ReflectionEntry[];
  onChange: (fields: ReflectionPayload) => void;
};

export function ReflectionChoiceInputs({ kind, draft, entries, onChange }: ChoiceInputsProps) {
  const { language } = useLanguage();
  const text = (key: ReflectionMessage) => reflectionText(language, key);
  const fields: Exclude<ReflectionChoiceField, "patternChoice">[] = kind === "step67" ? ["readiness", "support", "principle"] : ["focus"];
  const pastPatterns = kind === "step67" ? trackedPatterns(entries).filter(({ preset }) => !preset) : [];
  const currentPattern = entryPattern(draft)?.key ?? "";
  const selectedPattern = draft.patternChoice || (pastPatterns.some(({ key }) => key === currentPattern) ? currentPattern : "");

  return (
    <div className="ri-reflection-choices">
      {kind === "step67" && (
        <label className="form-field">
          <span>{text("choosePattern")}</span>
          <select className="form-input" value={selectedPattern} onChange={(event) => {
            const value = event.target.value;
            const past = pastPatterns.find(({ key }) => key === value);
            onChange(past ? { patternChoice: "", pattern: past.name } : { patternChoice: value });
          }}>
            <option value="">—</option>
            <optgroup label={text("suggestedPatterns")}>
              {reflectionChoices.patternChoice.map((id) => <option key={id} value={id}>{reflectionChoiceText(language, "patternChoice", id)}</option>)}
            </optgroup>
            {pastPatterns.length > 0 && <optgroup label={text("savedPatterns")}>
              {pastPatterns.map(({ key, name }) => <option key={key} value={key}>{name}</option>)}
            </optgroup>}
          </select>
        </label>
      )}
      {fields.map((field) => (
        <label className="form-field" key={field}>
          <span>{text(field)}</span>
          <select className="form-input" value={draft[field] ?? ""} onChange={(event) => onChange({ [field]: event.target.value })}>
            <option value="">—</option>
            {reflectionChoices[field].map((id) => <option key={id} value={id}>{reflectionChoiceText(language, field, id)}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}

const summaryFields = [
  { field: "readiness", label: "readinessCounts" },
  { field: "support", label: "supportCounts" },
  { field: "principle", label: "principleCounts" },
] as const;

function PatternLabel({ pattern, language }: { pattern: NonNullable<ReturnType<typeof entryPattern>>; language: Language }) {
  return <bdi>{pattern.preset ? reflectionChoiceText(language, "patternChoice", pattern.preset) : pattern.name}</bdi>;
}

export function ReflectionChoiceAnalytics({ entries, id }: { entries: readonly ReflectionEntry[]; id: string }) {
  const { language, t } = useLanguage();
  const text = (key: ReflectionMessage) => reflectionText(language, key);
  const [period, setPeriod] = useState<ReflectionPeriod>("all");
  const [patternKey, setPatternKey] = useState("");
  const dated = reflectionEntriesInPeriod(entries, period, todayIso());
  const patterns = trackedPatterns(dated);
  const selected = patterns.find(({ key }) => key === patternKey);
  const filtered = selected ? dated.filter(({ payload }) => entryPattern(payload)?.key === selected.key) : dated;
  const number = new Intl.NumberFormat(language);

  return (
    <section id={id} className="ri-reflection-patterns ri-reflection-analytics" aria-labelledby={id + "-title"}>
      <header>
        <h4 id={id + "-title"}>{text("patternAnalytics")}</h4>
        <div className="ri-reflection-dates">
          <label className="form-field">
            <span>{t("Selected period", "بازه انتخاب‌شده")}</span>
            <select className="form-input" value={period} onChange={(event) => setPeriod(event.target.value as ReflectionPeriod)}>
              <option value="all">{text("allDates")}</option>
              <option value="30">{text("last30")}</option>
              <option value="90">{text("last90")}</option>
            </select>
          </label>
          <label className="form-field">
            <span>{text("filterPattern")}</span>
            <select className="form-input" value={selected?.key ?? ""} onChange={(event) => setPatternKey(event.target.value)}>
              <option value="">{text("allPatterns")}</option>
              {patterns.map((pattern) => <option key={pattern.key} value={pattern.key}>
                {pattern.preset ? reflectionChoiceText(language, "patternChoice", pattern.preset) : pattern.name}
              </option>)}
            </select>
          </label>
        </div>
      </header>
      {patterns.length > 0 && (
        <div className="ri-pattern-counts">
          <h5>{text("tracked")}</h5>
          <ul>
            {patterns.map((pattern) => <li key={pattern.key}>
              <PatternLabel pattern={pattern} language={language} />
              <strong>{number.format(pattern.count)}</strong>
            </li>)}
          </ul>
        </div>
      )}
      <p role="status">{text("periodCount").replace("{count}", number.format(filtered.length))}</p>
      {filtered.length > 0 && (
        <div className="ri-reflection-counts">
          {summaryFields.map(({ field, label }) => {
            const counts = reflectionChoiceCounts(filtered, field);
            return (
              <section key={field}>
                <h5>{text(label)}</h5>
                {counts.length > 0 ? <ul>
                  {counts.map(([choice, count]) => <li key={choice}>
                    <span>{reflectionChoiceText(language, field, choice)}</span>
                    <strong>{number.format(count)}</strong>
                    <meter min={0} max={filtered.length} value={count} aria-hidden="true" />
                  </li>)}
                </ul> : <p>{text("noChoices")}</p>}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
