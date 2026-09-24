"use client";

import * as React from "react";
import { BarChart3, BookOpenText, MoonStar } from "lucide-react";
import { Step10Analytics } from "./step10-analytics";
import { Step10Inventory } from "./step10-inventory";
import { Step4Inventory } from "./step4-inventory";
import { RecoveryLearningCenter } from "./recovery-learning-center";
import { useLanguage } from "./language-provider";
import { recordSiteAction } from "@/lib/site-analytics";
import type { SiteAnalyticsAction } from "@/lib/site-analytics-config";

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
      {activeStep === "10" ? <Step10Inventory demo onOpenLearning={() => chooseStep("learning")} /> : activeStep === "4" ? <Step4Inventory demo onOpenLearning={() => chooseStep("learning")} /> : activeStep === "analytics" ? <Step10Analytics demo /> : <RecoveryLearningCenter demo />}
    </div>
  );
}
