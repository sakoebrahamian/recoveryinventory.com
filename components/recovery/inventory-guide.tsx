"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  inventoryGuideNoteLimit,
  inventoryGuideTopics,
  type InventoryGuideStep,
} from "@/lib/inventory-guide";
import { useLanguage } from "./language-provider";

export function InventoryGuide({ step }: { step: InventoryGuideStep }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();

  return (
    <div className="inventory-guide">
      <button
        type="button"
        className="button button-outline button-small"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(!open)}
      >
        <Sparkles size={16} aria-hidden="true" />
        {open ? t("Close AI guide", "بستن راهنمای هوش مصنوعی") : t("Help me reflect with AI", "کمک هوش مصنوعی برای تأمل")}
      </button>
      {open && <InventoryGuideForm id={panelId} step={step} />}
    </div>
  );
}

function InventoryGuideForm({ id, step }: { id: string; step: InventoryGuideStep }) {
  const { language, t } = useLanguage();
  const topics = inventoryGuideTopics(step, language);
  const [topic, setTopic] = React.useState(() => topics[0].id);
  const [note, setNote] = React.useState("");
  const [reply, setReply] = React.useState("");
  const [error, setError] = React.useState<"limit" | "unavailable" | null>(null);
  const [busy, setBusy] = React.useState(false);
  const pending = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => pending.current?.abort(), []);

  async function askGuide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;

    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError(null);
    setReply("");
    try {
      const response = await fetch("/api/inventory-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ step, language, topic, note, consent: true }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (response.status === 429) {
        setError("limit");
        return;
      }
      if (!response.ok) throw new Error("Guide unavailable");
      const result = await response.json() as { reply?: string };
      if (controller.signal.aborted) return;
      if (typeof result.reply !== "string" || !result.reply.trim()) throw new Error("Guide reply missing");
      setReply(result.reply);
    } catch {
      if (!controller.signal.aborted) setError("unavailable");
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <form id={id} className="inventory-guide-form" onSubmit={askGuide} aria-busy={busy}>
      <label className="form-field" htmlFor={id + "-topic"}>
        <span>{t("What would you like to reflect on?", "دوست دارید درباره چه چیزی تأمل کنید؟")}</span>
        <select
          id={id + "-topic"}
          className="form-input"
          value={topic}
          disabled={busy}
          onChange={(event) => { setTopic(event.target.value); setReply(""); setError(null); }}
        >
          {topics.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <label className="form-field" htmlFor={id + "-note"}>
        <span>{t("A short note (optional)", "یادداشت کوتاه (اختیاری)")}</span>
        <textarea
          id={id + "-note"}
          className="form-textarea"
          rows={3}
          maxLength={inventoryGuideNoteLimit}
          value={note}
          disabled={busy}
          onChange={(event) => setNote(event.target.value)}
          aria-describedby={id + "-privacy"}
        />
      </label>
      <p id={id + "-privacy"} className="inventory-guide-privacy">
        {t("When you select Send to AI, OpenAI receives the topic, language, and text in this box. You can leave it blank. Avoid names and identifying details.", "با انتخاب «ارسال به هوش مصنوعی»، موضوع، زبان و متن این کادر به OpenAI فرستاده می‌شود. می‌توانید کادر را خالی بگذارید. از نوشتن نام و اطلاعات هویتی خودداری کنید.")}{" "}
        <a href="/privacy#ai-inventory-guide" target="_blank" rel="noopener noreferrer">{t("Privacy policy", "سیاست حریم خصوصی")}</a>
      </p>
      <div>
        <button className="button button-primary button-small" type="submit" disabled={busy}>
          {busy ? t("Preparing a question…", "در حال آماده کردن پرسش…") : t("Send to AI", "ارسال به هوش مصنوعی")}
        </button>
      </div>
      <div role="status">
        {reply && <p dir="auto" className="inventory-guide-reply">{reply}</p>}
        {error === "limit" && <p>{t("The AI guide has reached a usage limit. You can keep writing and try the guide again later.", "راهنمای هوش مصنوعی به سقف استفاده رسیده است. می‌توانید به نوشتن ادامه دهید و بعداً دوباره راهنما را امتحان کنید.")}</p>}
        {error === "unavailable" && <p>{t("The AI guide is unavailable right now. You can keep writing in your inventory.", "راهنمای هوش مصنوعی در حال حاضر در دسترس نیست. می‌توانید به نوشتن ترازنامه خود ادامه دهید.")}</p>}
      </div>
    </form>
  );
}
