"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import type { Language } from "@/lib/inventory";
import {
  inventoryGuideHistoryLimit,
  inventoryGuideNoteLimit,
  inventoryGuideTopics,
  type InventoryGuideMessage,
  type InventoryGuideStep,
} from "@/lib/inventory-guide";
import { useLanguage } from "./language-provider";

export function InventoryGuide({ step }: { step: InventoryGuideStep }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"chat" | "guided">("chat");
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
      {open && (
        <div id={panelId} className="inventory-guide-panel">
          <div className="inventory-guide-modes" role="group" aria-label={t("AI guide mode", "روش استفاده از راهنمای هوش مصنوعی")}>
            <button type="button" aria-pressed={mode === "chat"} onClick={() => setMode("chat")}>{t("Chat", "گفت‌وگو")}</button>
            <button type="button" aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>{t("Guided Questions", "پرسش‌های هدایت‌شده")}</button>
          </div>
          <div hidden={mode !== "chat"}><InventoryGuideChat step={step} /></div>
          <div hidden={mode !== "guided"}><InventoryGuideForm step={step} /></div>
        </div>
      )}
    </div>
  );
}

type GuideInput = { step: InventoryGuideStep; language: Language } & (
  { topic: string; note: string } | { message: string; history: InventoryGuideMessage[] }
);
type GuideIssue = { kind: "limit" | "unavailable" | "sign_in" | "membership_required" | "invalid_request"; reference?: string };

function useGuideRequest() {
  const [issue, setIssue] = React.useState<GuideIssue | null>(null);
  const [busy, setBusy] = React.useState(false);
  const pending = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => pending.current?.abort(), []);

  async function send(input: GuideInput): Promise<string | null> {
    if (pending.current) return null;

    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setIssue(null);
    try {
      const response = await fetch("/api/inventory-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...input, consent: true }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null) as { reply?: unknown; error?: unknown; reference?: unknown } | null;
      if (controller.signal.aborted) return null;
      if (!response.ok) {
        const reference = typeof result?.reference === "string" && /^AI-[A-Z]{2,12}$/.test(result.reference)
          ? result.reference : undefined;
        const kind = response.status === 429 ? "limit"
          : response.status === 401 ? "sign_in"
          : result?.error === "membership_required" ? "membership_required"
          : result?.error === "invalid_request" ? "invalid_request" : "unavailable";
        setIssue({ kind, reference });
        return null;
      }
      if (typeof result?.reply !== "string" || !result.reply.trim()) throw new Error("Guide reply missing");
      return result.reply;
    } catch {
      if (!controller.signal.aborted) setIssue({ kind: "unavailable" });
      return null;
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return { busy, issue, send, clearIssue: () => setIssue(null) };
}

function GuideIssueNotice({ issue }: { issue: GuideIssue | null }) {
  const { t } = useLanguage();
  if (!issue) return null;

  const copy = {
    limit: t("The AI guide has reached a usage limit. You can keep writing and try the guide again later.", "راهنمای هوش مصنوعی به سقف استفاده رسیده است. می‌توانید به نوشتن ادامه دهید و بعداً دوباره راهنما را امتحان کنید."),
    unavailable: t("The AI guide couldn’t reply. Try again in a moment.", "راهنمای هوش مصنوعی نتوانست پاسخ دهد. کمی بعد دوباره تلاش کنید."),
    sign_in: t("Please sign in again to use the AI guide.", "برای استفاده از راهنمای هوش مصنوعی، دوباره وارد حساب شوید."),
    membership_required: t("An active membership is needed to use the AI guide.", "برای استفاده از راهنمای هوش مصنوعی به عضویت فعال نیاز دارید."),
    invalid_request: t("Refresh the page and try again.", "صفحه را تازه کنید و دوباره تلاش کنید."),
  };
  return (
    <p className="inventory-guide-issue" role="status">
      {copy[issue.kind]}
      {issue.reference && <small>{t("Error reference", "کد پیگیری خطا")} <b dir="ltr">{issue.reference}</b></small>}
    </p>
  );
}

function GuidePrivacyLink() {
  const { t } = useLanguage();
  return <a href="/privacy#ai-inventory-guide" target="_blank" rel="noopener noreferrer">{t("Privacy policy", "سیاست حریم خصوصی")}</a>;
}

function InventoryGuideForm({ step }: { step: InventoryGuideStep }) {
  const { language, t } = useLanguage();
  const id = React.useId();
  const topics = inventoryGuideTopics(step, language);
  const [topic, setTopic] = React.useState(() => topics[0].id);
  const [note, setNote] = React.useState("");
  const [reply, setReply] = React.useState("");
  const { busy, issue, send, clearIssue } = useGuideRequest();

  async function askGuide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setReply("");
    const question = await send({ step, language, topic, note });
    if (question) setReply(question);
  }

  return (
    <form className="inventory-guide-form" onSubmit={askGuide} aria-busy={busy}>
      <label className="form-field" htmlFor={id + "-topic"}>
        <span>{t("What would you like to reflect on?", "دوست دارید درباره چه چیزی تأمل کنید؟")}</span>
        <select
          id={id + "-topic"}
          className="form-input"
          value={topic}
          disabled={busy}
          onChange={(event) => { setTopic(event.target.value); setReply(""); clearIssue(); }}
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
        <GuidePrivacyLink />
      </p>
      <div>
        <button className="button button-primary button-small" type="submit" disabled={busy}>
          {busy ? t("Preparing a question…", "در حال آماده کردن پرسش…") : t("Send to AI", "ارسال به هوش مصنوعی")}
        </button>
      </div>
      <div role="status">
        {reply && <p dir="auto" className="inventory-guide-reply">{reply}</p>}
      </div>
      <GuideIssueNotice issue={issue} />
    </form>
  );
}

function InventoryGuideChat({ step }: { step: InventoryGuideStep }) {
  const { language, t } = useLanguage();
  const id = React.useId();
  const [draft, setDraft] = React.useState("");
  const [history, setHistory] = React.useState<InventoryGuideMessage[]>([]);
  const { busy, issue, send } = useGuideRequest();
  const thread = React.useRef<HTMLDivElement>(null);
  const starter = step === "step4"
    ? t("What is one experience or pattern you’d like to explore?", "دوست دارید کدام تجربه یا الگو را بررسی کنید؟")
    : t("What moment from today would you like to reflect on?", "دوست دارید به کدام لحظه از امروز فکر کنید؟");
  const guideLabel = t("Guide", "راهنما");
  const memberLabel = t("You", "شما");

  React.useEffect(() => {
    if (thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [history.length]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (busy || !message) return;
    const answer = await send({ step, language, message, history: history.slice(-inventoryGuideHistoryLimit) });
    if (!answer) return;
    setHistory((previous) => [...previous, { role: "member", text: message }, { role: "guide", text: answer }]);
    setDraft("");
  }

  return (
    <form className="inventory-guide-form" onSubmit={sendMessage} aria-busy={busy}>
      <div className="inventory-guide-thread" role="log" aria-label={t("Reflection chat", "گفت‌وگوی تأمل")} ref={thread}>
        <div className="inventory-guide-message guide"><strong>{guideLabel}</strong><p dir="auto">{starter}</p></div>
        {history.map((entry, index) => (
          <div className={"inventory-guide-message " + entry.role} key={index}>
            <strong>{entry.role === "guide" ? guideLabel : memberLabel}</strong><p dir="auto">{entry.text}</p>
          </div>
        ))}
      </div>
      <label className="form-field" htmlFor={id + "-message"}>
        <span>{t("Your message", "پیام شما")}</span>
        <textarea
          id={id + "-message"}
          className="form-textarea"
          rows={3}
          maxLength={inventoryGuideNoteLimit}
          value={draft}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          aria-describedby={id + "-privacy"}
        />
      </label>
      <p id={id + "-privacy"} className="inventory-guide-privacy">
        {t("When you select Send to AI, OpenAI receives your message, recent chat messages, and your language. Avoid names and identifying details.", "با انتخاب «ارسال به هوش مصنوعی»، پیام شما، پیام‌های اخیر گفت‌وگو و زبان شما به OpenAI فرستاده می‌شود. از نوشتن نام و اطلاعات هویتی خودداری کنید.")}{" "}
        <GuidePrivacyLink />
      </p>
      <div>
        <button className="button button-primary button-small" type="submit" disabled={busy || !draft.trim()}>
          {busy ? t("Preparing a question…", "در حال آماده کردن پرسش…") : t("Send to AI", "ارسال به هوش مصنوعی")}
        </button>
      </div>
      <GuideIssueNotice issue={issue} />
    </form>
  );
}
