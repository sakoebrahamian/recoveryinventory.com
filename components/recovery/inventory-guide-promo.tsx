"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import type { Language } from "@/lib/inventory";
import { inventoryGuideAllowance } from "@/lib/inventory-guide";
import { translateForLanguage, useLanguage } from "./language-provider";

export function InventoryGuideShowcase() {
  const { language, t } = useLanguage();

  return (
    <section id="ai-guide" className="ri-section ri-ai-guide-showcase" aria-labelledby="ri-ai-guide-title">
      <div className="ri-ai-guide-copy">
        <span className="ri-section-label"><Sparkles size={16} aria-hidden="true" />{t("Included with membership", "همراه با اشتراک")}</span>
        <h2 id="ri-ai-guide-title">{t("AI Inventory Guide", "راهنمای ترازنامه با هوش مصنوعی")}</h2>
        <p>{t("Use the optional AI guide when you want help putting a reflection into words. Close your day with Step 10, or explore a Step 4 resentment, fear, or relationship, one question at a time.", "هر زمان برای بیان تأملاتتان کمک می‌خواهید، از راهنمای اختیاری هوش مصنوعی استفاده کنید. روزتان را با گام ۱۰ مرور کنید یا رنجش، ترس یا رابطه‌ای را در گام ۴، هر بار با یک پرسش، بررسی کنید.")}</p>
        <p>{t("Your sponsor and fellowship remain your guides for step work. AI is a writing aid, not a sponsor or a group.", "راهنما و انجمن شما همچنان راهنمای کار کردن قدم‌ها هستند. هوش مصنوعی کمک‌نویس است، نه اسپانسر یا گروه.")}</p>
        <p>{t("Available in all 10 site languages. You choose what to send to AI.", "به هر ۱۰ زبان سایت در دسترس است. خودتان انتخاب می‌کنید چه چیزی برای هوش مصنوعی بفرستید.")}</p>
        <p>{inventoryGuideAllowance(language, t)}</p>
        <div className="ri-ai-guide-actions">
          <a className="text-link" href="#membership">{t("See membership plans", "مشاهده طرح‌های عضویت")}</a>
          <a className="text-link" href="/app">{t("Open member workspace", "باز کردن فضای اعضا")}</a>
        </div>
      </div>
      <InventoryGuideMockChat />
    </section>
  );
}

function InventoryGuideMockChat() {
  const { t } = useLanguage();
  const [step, setStep] = useState<4 | 10>(10);
  const examples = step === 4 ? [
    {
      note: t("I still feel hurt after a disagreement with a friend.", "بعد از اختلاف با یکی از دوستانم هنوز احساس رنجش می‌کنم."),
      question: t("What part of that disagreement still feels unresolved?", "کدام بخش از آن اختلاف هنوز برایتان حل‌نشده به نظر می‌رسد؟"),
    },
    {
      note: t("I’m afraid to ask for help because I might be judged.", "می‌ترسم کمک بخواهم چون ممکن است قضاوتم کنند."),
      question: t("Who has earned enough of your trust for a small first conversation?", "به چه کسی آن‌قدر اعتماد دارید که بتوانید گفت‌وگوی کوتاهی را با او شروع کنید؟"),
    },
  ] : [
    {
      note: t("I got impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد، بی‌صبر شدم."),
      question: t("What might help you pause the next time a plan changes?", "دفعه بعد که برنامه‌ای تغییر می‌کند، چه چیزی می‌تواند به شما کمک کند کمی مکث کنید؟"),
    },
    {
      note: t("I paused and listened during a difficult conversation.", "در یک گفت‌وگوی دشوار مکث کردم و گوش دادم."),
      question: t("What helped you slow down and listen today?", "امروز چه چیزی کمک کرد با آرامش بیشتری گوش بدهید؟"),
    },
  ];

  return (
    <figure className="ri-ai-guide-example">
      <figcaption>{t("Sample conversation", "گفت‌وگوی نمونه")}</figcaption>
      <div className="ri-ai-guide-example-options" role="group" aria-label={t("Choose an example step", "انتخاب گام برای نمونه")}>
        <button className={step === 4 ? "is-active" : ""} type="button" aria-pressed={step === 4} onClick={() => setStep(4)}>{t("Step 4", "گام ۴")}</button>
        <button className={step === 10 ? "is-active" : ""} type="button" aria-pressed={step === 10} onClick={() => setStep(10)}>{t("Step 10", "گام ۱۰")}</button>
      </div>
      <div className="ri-ai-guide-example-list" aria-live="polite">
        {examples.map(({ note, question }) => (
          <div className="ri-ai-guide-example-exchange" key={note}>
            <p><strong>{t("Sample note", "یادداشت نمونه")}</strong>{note}</p>
            <p><strong>{t("Guide question", "پرسش راهنما")}</strong>{question}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function InventoryGuideNotice({ language, mockChat = false }: { language?: Language; mockChat?: boolean }) {
  const { language: contextLanguage, t: contextTranslate } = useLanguage();
  const t = language
    ? (english: string, farsi: string) => translateForLanguage(language, english, farsi)
    : contextTranslate;

  return (
    <aside className="inventory-guide-notice">
      <Sparkles size={20} aria-hidden="true" />
      <div>
        <strong>{t("AI Inventory Guide", "راهنمای ترازنامه با هوش مصنوعی")}</strong>
        <p>{t("Monthly and yearly memberships include optional AI chat and guided questions for Step 4 and Step 10.", "اشتراک‌های ماهانه و سالانه شامل گفت‌وگوی اختیاری با هوش مصنوعی و پرسش‌های هدایت‌شده برای گام ۴ و گام ۱۰ هستند.")}</p>
        <p>{inventoryGuideAllowance(language ?? contextLanguage, t)}</p>
      </div>
      {mockChat ? (
        <details className="inventory-guide-notice-example">
          <summary>{t("See the AI guide examples", "مشاهده نمونه‌های راهنمای هوش مصنوعی")}</summary>
          <InventoryGuideMockChat />
        </details>
      ) : (
        <a className="text-link" href="/#ai-guide">{t("See the AI guide examples", "مشاهده نمونه‌های راهنمای هوش مصنوعی")}</a>
      )}
    </aside>
  );
}
