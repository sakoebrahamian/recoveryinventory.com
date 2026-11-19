"use client";
import * as React from "react";
import { MemberDashboard } from "@/components/recovery/member-dashboard";
import { InventoryGuide } from "@/components/recovery/inventory-guide";
import { LanguageToggle, useLanguage } from "@/components/recovery/language-provider";

export default function LanguageQA() {
  const { language, t } = useLanguage();
  const [memberView, setMemberView] = React.useState(false);
  const [mockReady, setMockReady] = React.useState(false);
  const [step, setStep] = React.useState<"step4" | "step10">("step10");
  const [requests, setRequests] = React.useState<Array<{ language: string; step: string; message?: string; topic?: string; history?: unknown[] }>>([]);
  const [status, setStatus] = React.useState(200);
  const mock = React.useRef({ language, t, status });
  mock.current = { language, t, status };
  React.useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input, options) => {
      const url = String(input);
      if (url === "/api/account/me") return Response.json({ alias: "Synthetic member", email: null, hasEmailLogin: false, username: "synthetic-member", hasPasswordLogin: true, subscriptionStatus: "active", currentPeriodEnd: 1900000000, membershipActive: true, step10CanSave: true, freeWeekActive: false, freeWeekEndsAt: 1900000000, freeEntriesUsed: 0, freeEntriesLimit: 30, inventoryGuideAvailable: true, hasBillingProfile: false, analyticsOwner: false });
      if (url.startsWith("/api/inventories?")) return Response.json({ inventories: [] });
      if (url === "/api/step4-workbooks") return Response.json({ workbooks: [] });
      if (url !== "/api/inventory-guide") return url.startsWith("/api/") ? Response.json({ error: "Synthetic test route only" }, { status: 400 }) : original(input, options);
      const body = JSON.parse(String(options?.body));
      setRequests(current => [...current, body]);
      return mock.current.status === 429
        ? Response.json({ error: "limit_reached", limit: "daily", resetAt: "2026-11-20T00:00:00.000Z" }, { status: 429 })
        : Response.json({ reply: mock.current.t("What helped you slow down and listen today?", "امروز چه چیزی به شما کمک کرد آرام‌تر شوید و گوش بدهید؟") });
    };
    setMockReady(true);
    return () => { window.fetch = original; };
  }, []);
  return <main style={{ maxWidth: 800, padding: 24, margin: "auto" }}><h1>Synthetic AI language test</h1><p>This development-only harness never calls the AI provider.</p><LanguageToggle /><label><input type="checkbox" checked={memberView} onChange={event=>setMemberView(event.target.checked)} />Preview member workspace</label><label>Test step<select aria-label="Test step" value={step} onChange={event=>setStep(event.target.value as typeof step)}><option value="step10">Step 10</option><option value="step4">Step 4</option></select></label><label>Test response<select aria-label="Test response" value={status} onChange={event=>setStatus(Number(event.target.value))}><option value={200}>Success</option><option value={429}>Daily limit</option></select></label>{mockReady && (memberView ? <MemberDashboard /> : <InventoryGuide step={step} date="2026-11-19" language={language} />)}<h2>Recorded synthetic requests</h2><pre id="qa-requests">{JSON.stringify(requests,null,2)}</pre></main>;
}
