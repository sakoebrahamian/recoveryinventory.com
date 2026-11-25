"use client";
import * as React from "react";
import { MemberDashboard } from "@/components/recovery/member-dashboard";
import { useSerenityJournal } from "@/components/recovery/serenity";
import { LanguageToggle, useLanguage } from "@/components/recovery/language-provider";
import { ThemePicker } from "@/components/recovery/theme-picker";
import { inventoryGuideSteps, type InventoryGuideStep } from "@/lib/inventory-guide";

export default function LanguageQA() {
  const { t } = useLanguage();
  const [memberView, setMemberView] = React.useState(false);
  const [mockReady, setMockReady] = React.useState(false);
  const [step, setStep] = React.useState<InventoryGuideStep | "none">("step10");
  const [requests, setRequests] = React.useState<Array<{ language: string; step: string; message?: string; topic?: string; history?: unknown[] }>>([]);
  const [status, setStatus] = React.useState(200);
  const mock = React.useRef({ t, status });
  mock.current = { t, status };
  useSerenityJournal(mockReady && !memberView && step !== "none" ? step : null, "2026-11-19");
  React.useEffect(() => {
    const original = window.fetch;
    const access = new URLSearchParams(window.location.search).get("access");
    window.fetch = async (input, options) => {
      const url = String(input);
      if (url === "/api/account/me") {
        if (access === "guest") return Response.json({}, { status: 401 });
        if (access === "error") return Response.json({}, { status: 503 });
        const member = access !== "free";
        return Response.json({
          alias: "Synthetic member", email: null, hasEmailLogin: false, username: "synthetic-member",
          hasPasswordLogin: true, subscriptionStatus: member ? "active" : "free", currentPeriodEnd: 1900000000,
          membershipActive: member, step10CanSave: true, freeWeekActive: !member, freeWeekEndsAt: 1900000000,
          freeEntriesUsed: 0, freeEntriesLimit: 30, inventoryGuideAvailable: member, hasBillingProfile: false, analyticsOwner: false,
        });
      }
      if (url.startsWith("/api/inventories?")) return Response.json({ inventories: [] });
      if (url.startsWith("/api/reflections?")) return Response.json({ entries: [] });
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
  return (
    <main style={{ maxWidth: 800, padding: 24, margin: "auto" }}>
      <h1>Synthetic AI language test</h1>
      <p>This development-only harness never calls the AI provider.</p>
      <LanguageToggle />
      <ThemePicker />
      <label><input type="checkbox" checked={memberView} onChange={(event) => setMemberView(event.target.checked)} />Preview member workspace</label>
      <label>
        Test step
        <select aria-label="Test step" value={step} onChange={(event) => setStep(event.target.value as typeof step)}>
          <option value="none">No journal context</option>
          {inventoryGuideSteps.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
      </label>
      <label>
        Test response
        <select aria-label="Test response" value={status} onChange={(event) => setStatus(Number(event.target.value))}>
          <option value={200}>Success</option>
          <option value={429}>Daily limit</option>
        </select>
      </label>
      {mockReady && memberView && <MemberDashboard />}
      <h2>Recorded synthetic requests</h2>
      <pre id="qa-requests" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(requests, null, 2)}</pre>
    </main>
  );
}
