"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircle, Minus, Sparkles } from "lucide-react";
import { inventoryGuideSteps, type InventoryGuideStep } from "@/lib/inventory-guide";
import { isRtlLanguage } from "@/lib/languages";
import { reflectionText } from "@/lib/reflection-copy";
import { SerenityConversation } from "./inventory-guide";
import { useLanguage } from "./language-provider";

type JournalScope = { step: InventoryGuideStep; date: string };
type Access = "visitor" | "free" | "member" | "unavailable";

const SerenityJournalContext = React.createContext<React.Dispatch<React.SetStateAction<JournalScope | null>> | null>(null);

export function useSerenityJournal(step: InventoryGuideStep | null, date: string) {
  const setJournal = React.useContext(SerenityJournalContext);
  React.useLayoutEffect(() => {
    if (!step || !setJournal) return;
    const journal = { step, date };
    setJournal(journal);
    return () => setJournal((current) => current === journal ? null : current);
  }, [step, date, setJournal]);
}

export function SerenityProvider({ children, notice }: { children: React.ReactNode; notice: React.ReactNode }) {
  const [journal, setJournal] = React.useState<JournalScope | null>(null);
  return (
    <SerenityJournalContext.Provider value={setJournal}>
      {children}
      <SerenityWidget journal={journal} notice={notice} />
    </SerenityJournalContext.Provider>
  );
}

async function getAccess(signal: AbortSignal): Promise<Access> {
  try {
    const response = await fetch("/api/account/me", { cache: "no-store", signal });
    if (response.status === 401) return "visitor";
    if (response.ok) {
      const account = await response.json() as { membershipActive?: boolean; inventoryGuideAvailable?: boolean };
      if (account.membershipActive === false) return "free";
      if (account.membershipActive && account.inventoryGuideAvailable) return "member";
    }
  } catch {
    // The example is still available if the account check fails.
  }
  return "unavailable";
}

function SerenityWidget({ journal, notice }: { journal: JournalScope | null; notice: React.ReactNode }) {
  const { language, t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const [access, setAccess] = React.useState<Access | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [selectedStep, setSelectedStep] = React.useState<InventoryGuideStep>("step10");
  const tools = React.useRef<HTMLDivElement>(null);
  const launcher = React.useRef<HTMLButtonElement>(null);
  const minimize = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();
  const step = journal?.step ?? selectedStep;
  const stepLabels: Record<InventoryGuideStep, string> = {
    step4: t("Step 4", "گام ۴"),
    step10: t("Step 10", "گام ۱۰"),
    step67: reflectionText(language, "step67Label"),
    step89: reflectionText(language, "step89Label"),
  };

  const launch = React.useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#ai-guide") launch();
    }
    const frame = window.requestAnimationFrame(openFromHash);
    window.addEventListener("hashchange", openFromHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromHash);
    };
  }, [launch]);

  React.useEffect(() => {
    if (!hasOpened) return;
    const controller = new AbortController();
    void getAccess(controller.signal).then((next) => {
      if (!controller.signal.aborted) setAccess(next);
    });
    return () => controller.abort();
  }, [hasOpened, attempt]);

  React.useLayoutEffect(() => {
    if (!hasOpened) return;
    (open ? minimize.current : launcher.current)?.focus({ preventScroll: true });
  }, [open, hasOpened]);

  React.useEffect(() => {
    const viewport = window.visualViewport;
    const container = tools.current;
    if (!open || !viewport || !container) return;
    function position() {
      if (!viewport || !container) return;
      const height = document.documentElement.clientHeight;
      const inset = viewport.scale === 1
        ? Math.max(0, height - viewport.height - viewport.offsetTop) : 0;
      container.style.setProperty("--serenity-viewport-height", `${height}px`);
      container.style.setProperty("--serenity-keyboard-inset", `${inset}px`);
    }
    position();
    viewport.addEventListener("resize", position);
    viewport.addEventListener("scroll", position);
    return () => {
      viewport.removeEventListener("resize", position);
      viewport.removeEventListener("scroll", position);
      container.style.removeProperty("--serenity-viewport-height");
      container.style.removeProperty("--serenity-keyboard-inset");
    };
  }, [open]);

  return (
    <div className="site-floating-tools" ref={tools}>
      {notice}
      <div className="serenity-widget ph-no-capture" dir={isRtlLanguage(language) ? "rtl" : "ltr"} lang={language}>
        <button
          className="button button-primary serenity-launcher"
          type="button"
          ref={launcher}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
          onClick={launch}
          hidden={open}
        >
          <MessageCircle size={19} aria-hidden="true" />
          {t("Chat With Serenity", "گفت‌وگو با Serenity")}
        </button>
        <section
          id={panelId}
          className="serenity-panel"
          role="dialog"
          aria-labelledby={panelId + "-title"}
          hidden={!open}
          onKeyDown={(event) => {
            if (event.defaultPrevented || event.key !== "Escape") return;
            event.stopPropagation();
            setOpen(false);
          }}
        >
          <header className="serenity-header">
            <h2 id={panelId + "-title"}><Sparkles size={18} aria-hidden="true" /><bdi>Serenity</bdi></h2>
            <button type="button" ref={minimize} className="serenity-minimize" aria-label={t("Minimize Serenity", "کوچک کردن Serenity")} onClick={() => setOpen(false)}>
              <Minus size={20} aria-hidden="true" />
            </button>
          </header>
          {hasOpened && (
            <div className="serenity-content">
              {access === null ? <p role="status">{t("Opening Serenity…", "در حال باز کردن Serenity…")}</p> : access === "member" ? (
                <>
                  {journal ? <p className="serenity-journal">{stepLabels[step]}</p> : (
                    <label className="form-field serenity-journal-picker">
                      <span>{t("Choose a journal", "انتخاب دفتر")}</span>
                      <select className="form-input" value={selectedStep} onChange={(event) => setSelectedStep(event.target.value as InventoryGuideStep)}>
                        {inventoryGuideSteps.map((option) => <option key={option} value={option}>{stepLabels[option]}</option>)}
                      </select>
                    </label>
                  )}
                  <SerenityConversation key={`${step}:${journal?.date ?? ""}`} step={step} language={language} />
                </>
              ) : (
                <SerenityExample
                  access={access}
                  step={step}
                  onNavigate={() => setOpen(false)}
                  onRetry={() => { setAccess(null); setAttempt((current) => current + 1); }}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SerenityExample({ access, step, onNavigate, onRetry }: {
  access: Exclude<Access, "member">;
  step: InventoryGuideStep;
  onNavigate: () => void;
  onRetry: () => void;
}) {
  const { t } = useLanguage();
  const [showExample, setShowExample] = React.useState(false);
  const example = step === "step4" ? {
    note: t("I still feel hurt after a disagreement with a friend.", "بعد از اختلاف با یکی از دوستانم هنوز احساس رنجش می‌کنم."),
    question: t("What part of that disagreement still feels unresolved?", "کدام بخش از آن اختلاف هنوز برایتان حل‌نشده به نظر می‌رسد؟"),
  } : {
    note: t("I got impatient when plans changed.", "وقتی برنامه‌ها تغییر کرد، بی‌صبر شدم."),
    question: t("What might help you pause the next time a plan changes?", "دفعه بعد که برنامه‌ای تغییر می‌کند، چه چیزی می‌تواند به شما کمک کند کمی مکث کنید؟"),
  };

  return (
    <div className="serenity-example">
      <div className="inventory-guide-thread" role="log" aria-label={t("Sample conversation", "گفت‌وگوی نمونه")}>
        <div className="inventory-guide-message">
          <strong><bdi>Serenity</bdi></strong>
          <p>{t("Hi, I’m Serenity.", "سلام، من Serenity هستم.")} {t("What would you like to reflect on today?", "دوست دارید امروز درباره چه چیزی تأمل کنید؟")}</p>
        </div>
        {showExample && <>
          <div className="inventory-guide-message member"><strong>{t("Sample note", "یادداشت نمونه")}</strong><p>{example.note}</p></div>
          <div className="inventory-guide-message"><strong><bdi>Serenity</bdi></strong><p>{example.question}</p></div>
        </>}
      </div>
      <div className="serenity-example-actions">
        <button type="button" className="button button-outline button-small" aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>
          {showExample ? t("Hide example", "پنهان کردن نمونه") : t("Try an example", "امتحان یک نمونه")}
        </button>
      </div>
      {access === "unavailable" ? (
        <>
          <p role="status">{t("Serenity is temporarily unavailable.", "Serenity به‌طور موقت در دسترس نیست.")}</p>
          <button type="button" className="text-link" onClick={onRetry}>{t("Please try again.", "لطفاً دوباره تلاش کنید.")}</button>
        </>
      ) : (
        <>
          <p>{t("Serenity’s live chat is included with membership.", "گفت‌وگوی زنده با Serenity همراه با اشتراک است.")}</p>
          <div className="serenity-example-actions">
            {access === "visitor" && <Link className="text-link" href="/recover" onClick={onNavigate}>{t("Log in", "ورود")}</Link>}
            <Link className="text-link" href="/#membership" onClick={onNavigate}>{t("See membership plans", "مشاهده طرح‌های عضویت")}</Link>
          </div>
        </>
      )}
    </div>
  );
}
