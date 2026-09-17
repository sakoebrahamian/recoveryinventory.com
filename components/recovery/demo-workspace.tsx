"use client";

import * as React from "react";
import { BookOpenText, MoonStar } from "lucide-react";
import { Step10Inventory } from "./step10-inventory";
import { Step4Inventory } from "./step4-inventory";
import { useLanguage } from "./language-provider";

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export function DemoWorkspace() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = React.useState<"10" | "4">("10");

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("step");
    if (query === "4" || query === "10") {
      const timer = window.setTimeout(() => setActiveStep(query), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name: "open_inventory_demo",
        title: "Open inventory demo",
        description: "Open either the Step 10 or Step 4 interactive inventory demo on this page.",
        inputSchema: {
          type: "object",
          properties: { step: { type: "string", enum: ["10", "4"] } },
          required: ["step"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = input as { step?: string };
          if (value.step !== "10" && value.step !== "4") throw new Error("step must be 10 or 4");
          setActiveStep(value.step);
          window.requestAnimationFrame(() => document.querySelector("[data-inventory]")?.scrollIntoView({ behavior: "smooth", block: "start" }));
          return { opened: `step_${value.step}` };
        },
      }, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // The page works normally when WebMCP is unavailable.
    }
    return () => lifecycle.abort();
  }, []);

  return (
    <div className="workspace-shell">
      <div className="workspace-tabs" role="tablist" aria-label={t("Choose an inventory", "انتخاب ترازنامه")}>
        <button className={`workspace-tab${activeStep === "10" ? " is-active" : ""}`} type="button" onClick={() => setActiveStep("10")} role="tab" aria-selected={activeStep === "10"}>
          <MoonStar size={17} />{t("Step 10 nightly", "گام ۱۰ شبانه")}
        </button>
        <button className={`workspace-tab${activeStep === "4" ? " is-active" : ""}`} type="button" onClick={() => setActiveStep("4")} role="tab" aria-selected={activeStep === "4"}>
          <BookOpenText size={17} />{t("Step 4 inventory", "ترازنامه گام ۴")}
        </button>
      </div>
      {activeStep === "10" ? <Step10Inventory demo /> : <Step4Inventory demo />}
    </div>
  );
}
