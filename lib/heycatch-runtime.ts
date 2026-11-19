import type { analytics as sdkAnalytics } from "@heycatch/sdk";
import { MARKETING_CHOICE_EVENT, MARKETING_CHOICE_KEY, browserRequestsPrivacy, marketingChoice, marketingPath, readMarketingChoice, sanitizeMarketingEvent, type MarketingChoice } from "./heycatch-policy";

type AnalyticsPort = Pick<typeof sdkAnalytics, "init" | "optInCapturing" | "optOutCapturing">;

/** No backend identity/payment hooks: this integration measures consented public visits only. */
export function startMarketingAnalytics(analytics: AnalyticsPort, browser: Window & typeof globalThis) {
  let initialized = false;
  let capturing = false;
  let memoryChoice: MarketingChoice | null = null;
  try { memoryChoice = readMarketingChoice(browser.localStorage); } catch { /* Storage can be blocked. */ }
  function enabled() {
    return memoryChoice === "allowed" && !browserRequestsPrivacy(browser)
      && ["recoveryinventory.com", "www.recoveryinventory.com"].includes(browser.location.hostname)
      && browser.location.protocol === "https:" && marketingPath(browser.location.pathname) !== null;
  }
  function apply() {
    if (enabled()) {
      if (!initialized) {
        analytics.init({
          projectKey: "hck_pk_1wzH29ea6iDOypVDZ2wQ2e3Kl0P-2glO",
          install: { framework: "nextjs", frameworkVersion: "16", agent: "codex" },
          site: "landing",
          collectIp: false,
          respectDnt: true,
          optOutCapturingByDefault: true,
          persistence: "sessionStorage",
          requestBatching: false,
          maskAllText: true,
          maskAllElementAttributes: true,
          beforeSend: event => sanitizeMarketingEvent(event, { href: browser.location.href, referrer: browser.document.referrer, enabled: enabled() }),
        });
        initialized = true;
      }
      if (!capturing) { capturing = true; analytics.optInCapturing(); }
    } else if (capturing) { capturing = false; analytics.optOutCapturing(); }
  }
  function consent(event: Event) {
    const detail = (event as CustomEvent).detail;
    if (detail === null || marketingChoice(detail)) memoryChoice = marketingChoice(detail);
    apply();
  }
  function storage(event: StorageEvent) {
    if (event.key === MARKETING_CHOICE_KEY || event.key === null) { memoryChoice = marketingChoice(event.newValue); apply(); }
  }
  browser.addEventListener(MARKETING_CHOICE_EVENT, consent);
  browser.addEventListener("storage", storage);
  browser.addEventListener("pageshow", apply);
  apply();
  return () => {
    browser.removeEventListener(MARKETING_CHOICE_EVENT, consent);
    browser.removeEventListener("storage", storage);
    browser.removeEventListener("pageshow", apply);
    if (capturing) { capturing = false; analytics.optOutCapturing(); }
  };
}
