"use client";

import * as React from "react";
import { BarChart3, BookOpenText, MoonStar } from "lucide-react";
import { Step10Analytics } from "./step10-analytics";
import { Step10Inventory, createDemoStep10Data, type Step10Data } from "./step10-inventory";
import { Step4Inventory } from "./step4-inventory";
import { RecoveryLearningCenter } from "./recovery-learning-center";
import { useLanguage } from "./language-provider";
import { recordSiteAction } from "@/lib/site-analytics";
import type { SiteAnalyticsAction } from "@/lib/site-analytics-config";
import { defaultReportPeriod } from "@/lib/step10-report-period";
import { todayIso } from "@/lib/inventory";

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export function DemoWorkspace() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = React.useState<"10" | "4" | "analytics" | "learning">("10");
  const [demoDraft, setDemoDraft] = React.useState<Step10Data>(() => createDemoStep10Data(t));
  const [reportPeriod, setReportPeriod] = React.useState(() => defaultReportPeriod(todayIso()));

  const chooseStep = React.useCallback((next: "10" | "4" | "analytics" | "learning") => {
    const actions: Record<typeof next, SiteAnalyticsAction> = {
      "10": "demo_step10",
      "4": "demo_step4",
      analytics: "demo_analytics",
      learning: "demo_learning",
    };
    setActiveStep(next);
    recordSiteAction(actions[next]);
  }, []);

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("step");
    if (query === "4" || query === "10" || query === "analytics" || query === "learning") {
      const timer = window.setTimeout(() => chooseStep(query), 0);
      return () => window.clearTimeout(timer);
    }
  }, [chooseStep]);

  React.useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "open_inventory_demo",
        title: "Open inventory demo",
        description: "Open the Step 10, Step 4, Step 10 analytics, or recovery learning demo on this page.",
        inputSchema: {
          type: "object",
          properties: { step: { type: "string", enum: ["10", "4", "analytics", "learning"] } },
          required: ["step"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = input as { step?: string };
          if (value.step !== "10" && value.step !== "4" && value.step !== "analytics" && value.step !== "learning") throw new Error("step must be 10, 4, analytics, or learning");
          chooseStep(value.step);
          window.requestAnimationFrame(() => document.querySelector("[data-inventory]")?.scrollIntoView({ behavior: "smooth", block: "start" }));
          return { opened: `step_${value.step}` };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // The page works normally when WebMCP is unavailable.
    }
    return () => lifecycle.abort();
  }, [chooseStep]);

  return (
    <div className="workspace-shell">
      <div className="workspace-tabs" role="tablist" aria-label={t("Choose an inventory", "انتخاب ترازنامه")}>
        <button className={`workspace-tab${activeStep === "10" ? " is-active" : ""}`} type="button" onClick={() => chooseStep("10")} role="tab" aria-selected={activeStep === "10"}>
          <MoonStar size={17} />{t("Step 10 nightly", "گام ۱۰ شبانه")}
        </button>
        <button className={`workspace-tab${activeStep === "4" ? " is-active" : ""}`} type="button" onClick={() => chooseStep("4")} role="tab" aria-selected={activeStep === "4"}>
          <BookOpenText size={17} />{t("Step 4 inventory", "ترازنامه گام ۴")}
        </button>
        <button className={`workspace-tab${activeStep === "analytics" ? " is-active" : ""}`} type="button" onClick={() => chooseStep("analytics")} role="tab" aria-selected={activeStep === "analytics"}>
          <BarChart3 size={17} />{t("Step 10 analytics", "تحلیل گام ۱۰")}
        </button>
        <button className={`workspace-tab${activeStep === "learning" ? " is-active" : ""}`} type="button" onClick={() => chooseStep("learning")} role="tab" aria-selected={activeStep === "learning"}>
          <BookOpenText size={17} />{t("Learning center", "مرکز آموزش")}
        </button>
      </div>
      {activeStep === "analytics" && <section className="demo-report-choices" aria-labelledby="demo-report-choices-title">
        <div>
          <h2 id="demo-report-choices-title">{t("Member report choices", "گزینه‌های گزارش اعضا")}</h2>
          <p>{t("Explore the sample chart below. Members can export three PDF formats:", "نمودار نمونه را در پایین ببینید. اعضا می‌توانند از سه قالب PDF خروجی بگیرند:")}</p>
        </div>
        <div className="demo-report-choice-grid">
          <article><h3>{t("Sponsor summary", "خلاصه برای حامی")}</h3><p>{t("Selected-day counts and an inventory chart by default; choose a week, month, year, or custom range for a broader report.", "شمارش‌ها و نمودار ترازنامه به‌طور پیش‌فرض برای روز انتخاب‌شده‌اند؛ برای گزارشی گسترده‌تر هفته، ماه، سال یا بازه دلخواه را انتخاب کنید.")}</p></article>
          <article><h3>{t("Chart only", "فقط نمودار")}</h3><p>{t("A printable inventory chart for one day or a chosen range, without inventory pages or written reflections.", "نمودار ترازنامه قابل چاپ برای یک روز یا بازه انتخاب‌شده، بدون صفحه ترازنامه یا بازتاب‌های نوشته‌شده.")}</p></article>
          <article><h3>{t("Full journal", "دفتر کامل")}</h3><p>{t("Complete daily entries for selected dates, with an option to include analytics and an inventory chart for those same dates.", "نوشته‌های کامل روزانه برای تاریخ‌های انتخاب‌شده، همراه با گزینه افزودن تحلیل و نمودار ترازنامه برای همان تاریخ‌ها.")}</p></article>
        </div>
      </section>}
      {activeStep === "10" ? <Step10Inventory demo initialData={demoDraft} onChange={setDemoDraft} onOpenLearning={() => chooseStep("learning")} reportPeriod={reportPeriod} onReportPeriodChange={setReportPeriod} /> : activeStep === "4" ? <Step4Inventory demo onOpenLearning={() => chooseStep("learning")} /> : activeStep === "analytics" ? <Step10Analytics demo reportInventory={demoDraft} reportPeriod={reportPeriod} onReportPeriodChange={setReportPeriod} /> : <RecoveryLearningCenter demo />}
    </div>
  );
}
