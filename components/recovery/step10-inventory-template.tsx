"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Language } from "@/lib/inventory";
import type { LearningInventoryTemplate } from "@/lib/public-learning";

export function Step10InventoryTemplate({
  template,
  language,
}: {
  template: LearningInventoryTemplate;
  language: Language;
}) {
  const [message, setMessage] = useState("");

  async function copyTemplate() {
    const text = template.rows.map(({ prompt }) => prompt).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setMessage(template.copied);
    } catch {
      setMessage(template.copyUnavailable);
    }
  }

  return (
    <section className="public-learning-practice public-learning-template" aria-labelledby="step10-template-title">
      <h2 id="step10-template-title">{template.title}</h2>
      <ul>
        {template.rows.map(({ prompt }) => (
          <li key={prompt}><Check size={17} aria-hidden="true" />{prompt}</li>
        ))}
      </ul>
      <div className="public-learning-template-actions">
        <button className="button button-outline" type="button" onClick={copyTemplate}>
          <Copy size={17} aria-hidden="true" />{template.copyLabel}
        </button>
        <span role="status">{message}</span>
      </div>

      <h3>{template.exampleTitle}</h3>
      <dl>
        {template.rows.map(({ prompt, example }) => (
          <div key={prompt}>
            <dt>{prompt}</dt>
            <dd>{example}</dd>
          </div>
        ))}
      </dl>
      <a className="button button-primary" href={`/demo?step=10&lang=${language}`}>
        {template.demoLabel}
      </a>
    </section>
  );
}
