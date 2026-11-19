"use client";

import { dateTimeFormat } from "@/lib/languages";

import { isRtlLanguage, languageLocale } from "@/lib/languages";

import * as React from "react";
import { Sparkles } from "lucide-react";
import type { Language } from "@/lib/inventory";
import {
  inventoryGuideAllowance,
  inventoryGuideHistoryLimit,
  inventoryGuideNoteLimit,
  inventoryGuideTopics,
  type InventoryGuideMessage,
  type InventoryGuideStep,
} from "@/lib/inventory-guide";
import { translateForLanguage } from "./language-provider";

type GuideMode = "chat" | "guided";
type GuideTranslation = (english: string, farsi: string) => string;
type GuideScope = { step: InventoryGuideStep; language: Language };

export function InventoryGuide({ step, date, language }: { step: InventoryGuideStep | null; date: string; language: Language }) {
  const t: GuideTranslation = (english, farsi) => translateForLanguage(language, english, farsi);
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<GuideMode>("chat");
  const panelId = React.useId();
  const scope = `${step}-${date}-${open}`;

  return (
    <div className="inventory-guide" hidden={step === null} lang={language} dir={isRtlLanguage(language) ? "rtl" : "ltr"}>
      <button
        type="button"
        className="button button-outline button-small"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <Sparkles size={16} aria-hidden="true" />
        {open ? t("Close AI guide", "بستن راهنمای هوش مصنوعی") : t("Help me reflect with AI", "کمک هوش مصنوعی برای تأمل")}
      </button>
      <div id={panelId} className="inventory-guide-panel" hidden={!open}>
        <div className="inventory-guide-modes" role="group" aria-label={t("AI guide mode", "روش استفاده از راهنمای هوش مصنوعی")}>
          <button type="button" aria-pressed={mode === "chat"} onClick={() => setMode("chat")}>{t("Chat", "گفت‌وگو")}</button>
          <button type="button" aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>{t("Guided Questions", "پرسش‌های هدایت‌شده")}</button>
        </div>
        <p className="inventory-guide-privacy mt-2 max-w-3xl">
          {inventoryGuideAllowance(language, t)}{" "}
          {t("The daily allowance resets at midnight UTC. Some failed requests count toward the limit.", "سهمیه روزانه در نیمه‌شب به وقت UTC بازنشانی می‌شود. برخی درخواست‌های ناموفق هم از سهمیه کم می‌شوند.")}
        </p>
        <div hidden={mode !== "chat"}>
          <InventoryGuideConversation step={step ?? "step10"} language={language} scope={scope} mode="chat" t={t} />
        </div>
        <div hidden={mode !== "guided"}>
          <InventoryGuideConversation step={step ?? "step10"} language={language} scope={scope} mode="guided" t={t} />
        </div>
      </div>
    </div>
  );
}

type GuideInput = GuideScope & (
  { topic: string; note: string } | { message: string; history: InventoryGuideMessage[]; topic?: string }
);
type GuideIssue = {
  kind: "limit" | "unavailable" | "sign_in" | "membership_required" | "invalid_request";
  reference?: string;
  limit?: "daily" | "monthly";
  resetAt?: number;
};

async function requestGuideReply(input: GuideInput, signal: AbortSignal): Promise<{ reply: string } | { issue: GuideIssue }> {
  try {
    const response = await fetch("/api/inventory-guide", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...input, consent: true }),
      signal,
    });
    const result = await response.json().catch(() => null) as {
      reply?: unknown;
      error?: unknown;
      reference?: unknown;
      limit?: unknown;
      resetAt?: unknown;
    } | null;
    if (response.status === 429) {
      const limit = result?.limit === "daily" || result?.limit === "monthly" ? result.limit : undefined;
      const resetAt = typeof result?.resetAt === "string" ? Date.parse(result.resetAt) : NaN;
      return { issue: { kind: "limit", limit, resetAt: Number.isFinite(resetAt) ? resetAt : undefined } };
    }
    if (!response.ok) {
      const reference = typeof result?.reference === "string" && /^AI-[A-Z]{2,12}$/.test(result.reference)
        ? result.reference : undefined;
      const kind = response.status === 401 ? "sign_in"
        : result?.error === "membership_required" ? "membership_required"
        : result?.error === "invalid_request" ? "invalid_request" : "unavailable";
      return { issue: { kind, reference } };
    }
    if (typeof result?.reply === "string" && result.reply.trim()) return { reply: result.reply };
  } catch {
    // The caller discards canceled requests.
  }
  return { issue: { kind: "unavailable" } };
}

function GuideIssueNotice({ issue, language, t }: { issue: GuideIssue | null; language: Language; t: GuideTranslation }) {
  if (!issue) return null;

  const limitCopy = {
    daily: t("You’ve reached your daily limit for the AI guide.", "به سقف روزانه استفاده از راهنمای هوش مصنوعی رسیده‌اید."),
    monthly: t("The AI guide has reached the site’s monthly limit.", "راهنمای هوش مصنوعی به سقف ماهانه سایت رسیده است."),
  };
  const copy = {
    limit: issue.limit ? limitCopy[issue.limit] : t("The AI guide has reached a usage limit. You can keep writing and try the guide again later.", "راهنمای هوش مصنوعی به سقف استفاده رسیده است. می‌توانید به نوشتن ادامه دهید و بعداً دوباره راهنما را امتحان کنید."),
    unavailable: t("The AI guide couldn’t reply. Try again in a moment.", "راهنمای هوش مصنوعی نتوانست پاسخ دهد. کمی بعد دوباره تلاش کنید."),
    sign_in: t("Please sign in again to use the AI guide.", "برای استفاده از راهنمای هوش مصنوعی، دوباره وارد حساب شوید."),
    membership_required: t("An active membership is needed to use the AI guide.", "برای استفاده از راهنمای هوش مصنوعی به عضویت فعال نیاز دارید."),
    invalid_request: t("Refresh the page and try again.", "صفحه را تازه کنید و دوباره تلاش کنید."),
  };
  const resetTime = issue.resetAt === undefined ? null
    : dateTimeFormat(languageLocale(language), { dateStyle: "medium", timeStyle: "short" }).format(issue.resetAt);
  return (
    <p className="inventory-guide-issue" role="status">
      {copy[issue.kind]}
      {resetTime && <small>{t("Try again after {time}.", "پس از {time} دوباره امتحان کنید.").replace("{time}", resetTime)}</small>}
      {issue.reference && <small>{t("Error reference", "کد پیگیری خطا")} <b dir="ltr">{issue.reference}</b></small>}
    </p>
  );
}

type GuideConversation = {
  scope: string;
  topic?: string;
  draft: string;
  history: InventoryGuideMessage[];
  busy: boolean;
  issue: GuideIssue | null;
};

function startConversation(scope: string, topic?: string): GuideConversation {
  return { scope, topic, draft: "", history: [], busy: false, issue: null };
}

function InventoryGuideConversation({ step, language, scope, mode, t }: GuideScope & { scope: string; mode: GuideMode; t: GuideTranslation }) {
  const id = React.useId();
  const guided = mode === "guided";
  const topics = guided ? inventoryGuideTopics(step, language) : [];
  const [conversation, setConversation] = React.useState(() => startConversation(scope, topics[0]?.id));
  if (conversation.scope !== scope) setConversation(startConversation(scope, topics[0]?.id));
  const { topic, draft, history, busy, issue } = conversation;
  const pending = React.useRef<AbortController | null>(null);
  React.useLayoutEffect(() => () => {
    pending.current?.abort();
    pending.current = null;
  }, [scope]);
  const firstGuidedQuestion = topic !== undefined && history.length === 0;
  const starter = step === "step4"
    ? t("What is one experience or pattern you’d like to explore?", "دوست دارید کدام تجربه یا الگو را بررسی کنید؟")
    : t("What moment from today would you like to reflect on?", "دوست دارید به کدام لحظه از امروز فکر کنید؟");
  const messages: InventoryGuideMessage[] = guided ? history : [{ role: "guide", text: starter }, ...history];
  const earlier = messages.slice(0, -2);
  const recent = messages.slice(-2);
  const messageLabel = firstGuidedQuestion
    ? t("A short note (optional)", "یادداشت کوتاه (اختیاری)")
    : guided ? t("Reply to the guide", "پاسخ به راهنما") : t("Your message", "پیام شما");
  const privacy = firstGuidedQuestion
    ? t("When you select Send to AI, OpenAI receives the topic, language, and text in this box. You can leave it blank. Avoid names and identifying details.", "با انتخاب «ارسال به هوش مصنوعی»، موضوع، زبان و متن این کادر به OpenAI فرستاده می‌شود. می‌توانید کادر را خالی بگذارید. از نوشتن نام و اطلاعات هویتی خودداری کنید.")
    : guided
      ? t("When you select Send to AI, OpenAI receives your reply, topic, recent messages, and language. Avoid names and identifying details.", "با انتخاب «ارسال به هوش مصنوعی»، پاسخ، موضوع، پیام‌های اخیر و زبان شما به OpenAI فرستاده می‌شود. از نوشتن نام و اطلاعات هویتی خودداری کنید.")
      : t("When you select Send to AI, OpenAI receives your message, recent chat messages, and your language. Avoid names and identifying details.", "با انتخاب «ارسال به هوش مصنوعی»، پیام شما، پیام‌های اخیر گفت‌وگو و زبان شما به OpenAI فرستاده می‌شود. از نوشتن نام و اطلاعات هویتی خودداری کنید.");

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (pending.current || (!firstGuidedQuestion && !message)) return;

    const controller = new AbortController();
    pending.current = controller;
    setConversation({ ...conversation, busy: true, issue: null });
    const result = await requestGuideReply(firstGuidedQuestion
      ? { step, language, topic, note: message }
      : { step, language, topic, message, history: history.slice(-inventoryGuideHistoryLimit) }, controller.signal);
    if (pending.current !== controller) return;
    pending.current = null;

    if ("issue" in result) {
      setConversation({ ...conversation, busy: false, issue: result.issue });
      return;
    }
    const turn: InventoryGuideMessage[] = [];
    if (message) turn.push({ role: "member", text: message });
    turn.push({ role: "guide", text: result.reply });
    setConversation({ ...conversation, draft: "", history: [...history, ...turn], busy: false, issue: null });
  }

  function selectTopic(next: string) {
    setConversation({ ...conversation, topic: next, draft: history.length ? "" : draft, history: [], issue: null });
  }

  function renderMessage(entry: InventoryGuideMessage, index: number) {
    return (
      <div className={"inventory-guide-message " + entry.role} key={index}>
        <strong>{entry.role === "guide" ? t("Guide", "راهنما") : t("You", "شما")}</strong>
        <p dir="auto">{entry.text}</p>
      </div>
    );
  }

  return (
    <form className="inventory-guide-form" onSubmit={sendMessage} aria-busy={busy}>
      {guided && (
        <label className="form-field" htmlFor={id + "-topic"}>
          <span>{t("What would you like to reflect on?", "دوست دارید درباره چه چیزی تأمل کنید؟")}</span>
          <select id={id + "-topic"} className="form-input" value={topic} disabled={busy} onChange={(event) => selectTopic(event.target.value)}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </label>
      )}
      {earlier.length > 0 && (
        <details className="inventory-guide-history">
          <summary>{t("Earlier messages", "پیام‌های قبلی")}</summary>
          <div className="inventory-guide-thread">{earlier.map(renderMessage)}</div>
        </details>
      )}
      <div className={recent.length ? "inventory-guide-thread" : "sr-only"} role="log" aria-label={t("Reflection chat", "گفت‌وگوی تأمل")}>
        {recent.map((entry, index) => renderMessage(entry, earlier.length + index))}
      </div>
      <label className="form-field" htmlFor={id + "-message"}>
        <span>{messageLabel}</span>
        <textarea
          id={id + "-message"}
          className="form-textarea"
          rows={3}
          maxLength={inventoryGuideNoteLimit}
          value={draft}
          disabled={busy}
          onChange={(event) => setConversation({ ...conversation, draft: event.target.value })}
          aria-describedby={id + "-privacy"}
        />
      </label>
      <p id={id + "-privacy"} className="inventory-guide-privacy">
        {privacy}{" "}
        <a href="/privacy#ai-inventory-guide" target="_blank" rel="noopener noreferrer">{t("Privacy policy", "سیاست حریم خصوصی")}</a>
      </p>
      <div>
        <button className="button button-primary button-small" type="submit" disabled={busy || (!firstGuidedQuestion && !draft.trim())}>
          {busy ? t("Preparing a question…", "در حال آماده کردن پرسش…") : t("Send to AI", "ارسال به هوش مصنوعی")}
        </button>
      </div>
      <GuideIssueNotice issue={issue} language={language} t={t} />
    </form>
  );
}
