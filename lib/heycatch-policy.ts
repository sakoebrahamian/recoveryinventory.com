import { reflectionSlugs, resourceSlug } from "@/lib/reflection-journals";

/** Only known, public marketing routes may participate. New routes default to private. */
export const MARKETING_CHOICE_KEY = "ri-marketing-analytics-v1";
export const MARKETING_CHOICE_EVENT = "ri-marketing-analytics-change";
export type MarketingChoice = "allowed" | "declined";
const publicPaths = new Set([
  "/", "/about", "/privacy", "/terms", "/learn", "/vs", "/step-10-daily-inventory-app",
  "/learn/step-10-daily-inventory", "/learn/step-4-personal-inventory", "/learn/dishonesty-to-honesty",
  ...[...Object.values(reflectionSlugs), resourceSlug].map((slug) => "/learn/" + slug),
  "/vs/12steps-online", "/vs/innerascent", "/vs/pen-and-paper",
]);
const locales = new Set(["es", "fa", "fr", "pt-br", "ar", "de", "hy", "it", "el"]);
export function marketingPath(pathname: string): string | null {
  if (typeof pathname !== "string" || !pathname.startsWith("/") || /[%\\?#]/.test(pathname)) return null;
  const path = pathname.replace(/\/$/, "") || "/";
  const segments = path.split("/");
  const normalized = locales.has(segments[1]) ? "/" + segments.slice(2).join("/") : path;
  // Localized home/legal routes are not part of the site; do not allow unknown lookalikes.
  if (locales.has(segments[1]) && ["/", "/privacy", "/terms"].includes(normalized)) return null;
  return publicPaths.has(normalized) ? path : null;
}
export function marketingChoice(value: unknown): MarketingChoice | null {
  return value === "allowed" || value === "declined" ? value : null;
}
export function readMarketingChoice(storage: Pick<Storage, "getItem">): MarketingChoice | null {
  try { return marketingChoice(storage.getItem(MARKETING_CHOICE_KEY)); } catch { return null; }
}
export function browserRequestsPrivacy(browser: { navigator: Navigator; doNotTrack?: string }) {
  const navigator = browser.navigator as Navigator & { globalPrivacyControl?: boolean };
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || browser.doNotTrack === "1";
}

type CapturedEvent = { event: string; properties: Record<string, unknown>; [key: string]: unknown };
export type MarketingEventContext = { href: string; referrer: string; enabled: boolean };
const eventNames = new Set(["$pageview", "$pageleave", "$autocapture", "$rageclick", "$opt_in"]);
const identifiers = ["distinct_id", "$device_id", "$session_id", "$window_id"];
const eventUuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const sourceNames = new Set(["google", "bing", "facebook", "instagram", "reddit", "youtube", "linkedin", "tiktok", "newsletter", "recovery_partner", "heycatch"]);
const elementTags = new Set(["a", "button", "div", "span", "svg", "path", "li", "ul", "nav", "header", "section", "article", "main", "footer", "summary", "details", "strong", "em", "p"]);

/** An allowlist, rather than redaction, keeps future SDK properties from leaking private values. */
export function sanitizeMarketingEvent(event: CapturedEvent | null, context: MarketingEventContext): CapturedEvent | null {
  if (!event || !context.enabled || !eventNames.has(event.event)) return null;
  let current: URL;
  try { current = new URL(context.href); } catch { return null; }
  const path = marketingPath(current.pathname);
  if (!path || !["https:"].includes(current.protocol) || !["recoveryinventory.com", "www.recoveryinventory.com"].includes(current.hostname)) return null;
  const original = event.properties;
  // A queued event from an excluded route stays excluded, even after a later navigation.
  for (const field of ["$current_url", "$pathname"]) {
    const value = original[field];
    if (value !== undefined) {
      if (typeof value !== "string") return null;
      try { const url = new URL(value, current.origin); if (url.origin !== current.origin || !marketingPath(url.pathname)) return null; }
      catch { return null; }
    }
  }
  if (event.event === "$autocapture" && original.$event_type !== "click") return null;
  const properties: Record<string, unknown> = {
    $current_url: current.origin + path,
    $pathname: path,
    $host: current.host,
    $process_person_profile: false,
  };
  for (const key of identifiers) {
    const value = original[key];
    if (typeof value === "string" && /^(?:\$device:)?[a-f0-9-]{16,80}$/i.test(value)) properties[key] = value;
  }
  for (const key of ["$screen_width", "$screen_height", "$viewport_width", "$viewport_height"]) {
    const value = original[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 20000) properties[key] = Math.round(value);
  }
  const source = current.searchParams.get("utm_source")?.toLowerCase();
  if (source && sourceNames.has(source)) properties.utm_source = source;
  const campaign = current.searchParams.get("utm_campaign");
  if (source === "heycatch" && campaign && /^[a-z0-9]$/.test(campaign)) properties.utm_campaign = campaign;
  // Broad referrer attribution only; no referring path, search term, token or query string.
  try {
    const referrer = new URL(context.referrer);
    const host = referrer.hostname.replace(/^www\./, "");
    const known = ["google.com", "bing.com", "facebook.com", "instagram.com", "reddit.com", "youtube.com", "youtu.be", "linkedin.com", "tiktok.com"];
    const matched = known.find(domain => host === domain || host.endsWith("." + domain));
    if (referrer.origin !== current.origin && matched) {
      properties.$referrer = "https://" + matched + "/";
      properties.$referring_domain = matched;
    }
  } catch { /* Direct visits have no referrer. */ }
  if (event.event === "$autocapture") {
    properties.$event_type = "click";
    if (Array.isArray(original.$elements)) properties.$elements = original.$elements.slice(0, 20).flatMap(item => {
      if (!item || typeof item !== "object" || !elementTags.has(item.tag_name)) return [];
      return [{ tag_name: item.tag_name }];
    });
  }
  // Preserve the SDK's per-event identifier and capture time for delivery.
  const clean: CapturedEvent = { event: event.event, properties };
  if (typeof event.uuid === "string" && eventUuid.test(event.uuid)) clean.uuid = event.uuid;
  if (event.timestamp instanceof Date && Number.isFinite(event.timestamp.getTime())) {
    clean.timestamp = new Date(event.timestamp.getTime());
  }
  return clean;
}
