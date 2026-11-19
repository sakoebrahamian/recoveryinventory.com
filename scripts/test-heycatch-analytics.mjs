import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const server = await createServer({ configFile: false, cacheDir: ".sites-runtime/heycatch-test-cache", appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } } });
try {
  const policy = await server.ssrLoadModule("/lib/heycatch-policy.ts");
  const { startMarketingAnalytics } = await server.ssrLoadModule("/lib/heycatch-runtime.ts");
  const { default: sitemap } = await server.ssrLoadModule("/app/sitemap.ts");
  for (const page of sitemap()) {
    const url = new URL(page.url);
    assert.equal(!!policy.marketingPath(url.pathname), url.pathname !== "/demo", url.pathname);
  }
  const excluded = ["/app", "/app/site-analytics", "/app/anything", "/join", "/recover", "/demo", "/api/account/me", "/api/inventories", "/fr/app", "/fr/join", "/unknown", "/about%2f..%2fapp", "/about?token=secret", "/about\\app", "/el/unknown"];
  for (const pathname of excluded) assert.equal(policy.marketingPath(pathname), null, pathname);
  assert.equal(policy.marketingChoice("yes"), null);
  assert.equal(policy.readMarketingChoice({ getItem() { throw new Error("Storage blocked"); } }), null);

  const identifier = "01969b11-c171-77ac-a3ed-8aaf11d234ed";
  const event = { event: "$pageview", properties: { distinct_id: identifier, $device_id: identifier, $session_id: identifier, $window_id: identifier, $current_url: "https://recoveryinventory.com/?email=PRIVATE_EMAIL#PRIVATE_FRAGMENT", $pathname: "/", $screen_width: 375, $screen_height: 812, email: "PRIVATE_EMAIL", name: "PRIVATE_NAME", user_id: "PRIVATE_USER_ID", journal: "PRIVATE_JOURNAL", history: ["PRIVATE_AI_HISTORY"], $set: { email: "PRIVATE_EMAIL" }, $set_once: { $initial_current_url: "PRIVATE_URL" }, $elements_chain: "PRIVATE_ELEMENT_TEXT", unknownFutureSdkField: { note: "PRIVATE_NOTE" } }, $set: { name: "PRIVATE_NAME" } };
  const context = { href: "https://recoveryinventory.com/?utm_source=heycatch&utm_campaign=x&token=PRIVATE_TOKEN#PRIVATE_FRAGMENT", referrer: "https://youtube.com/watch?v=PRIVATE_SEARCH", enabled: true };
  const clean = policy.sanitizeMarketingEvent(event, context);
  assert.equal(clean.properties.distinct_id, identifier);
  assert.equal(clean.properties.$current_url, "https://recoveryinventory.com/");
  assert.equal(clean.properties.utm_source, "heycatch"); assert.equal(clean.properties.utm_campaign, "x");
  assert.equal(clean.properties.$referrer, "https://youtube.com/");
  assert.equal(clean.properties.$process_person_profile, false);
  assert.ok(!JSON.stringify(clean).includes("PRIVATE_"), "No raw queries, hashes, names, input text, account data or future SDK fields may pass");
  assert.equal(policy.sanitizeMarketingEvent(event, { ...context, enabled: false }), null);
  assert.equal(policy.sanitizeMarketingEvent({ ...event, event: "$identify" }, context), null);
  assert.equal(policy.sanitizeMarketingEvent({ ...event, properties: { ...event.properties, $current_url: "https://recoveryinventory.com/app" } }, context), null);
  assert.equal(policy.sanitizeMarketingEvent({ ...event, properties: { ...event.properties, $pathname: "/join" } }, context), null);
  assert.equal(policy.sanitizeMarketingEvent({ ...event, properties: { ...event.properties, $current_url: "https://other.example/" } }, context), null);
  assert.equal(policy.sanitizeMarketingEvent({ ...event, event: "$autocapture", properties: { ...event.properties, $event_type: "submit" } }, context), null);
  const click = policy.sanitizeMarketingEvent({ event: "$autocapture", properties: { $event_type: "click", $elements: [{ tag_name: "a", attr__href: "/recover?token=PRIVATE_TOKEN", $el_text: "PRIVATE_TEXT", attr__id: "PRIVATE_ID" }, { tag_name: "input", attr__value: "PRIVATE_INPUT" }] } }, context);
  assert.deepEqual(click.properties.$elements, [{ tag_name: "a" }]);
  assert.ok(!JSON.stringify(click).includes("PRIVATE_"));
  const excludedUrls = excluded.filter(pathname => !pathname.includes("?"));
  for (const pathname of excludedUrls) assert.equal(policy.sanitizeMarketingEvent(event, { ...context, href: "https://recoveryinventory.com" + pathname }), null, pathname);
  assert.ok(!JSON.stringify(policy.sanitizeMarketingEvent(event, { ...context, href: "https://recoveryinventory.com/about?token=PRIVATE_TOKEN" })).includes("PRIVATE_"));

  function setup({ choice = null, pathname = "/", privacy = {}, storageBlocked = false, origin = "https://recoveryinventory.com" } = {}) {
    const browser = new EventTarget();
    Object.assign(browser, { location: new URL(pathname, origin), navigator: privacy, document: { referrer: "" } });
    Object.defineProperty(browser, "localStorage", { get() { if (storageBlocked) throw new Error("Storage blocked"); return { getItem: () => choice }; } });
    const calls = [];
    const sdk = { init(config) { calls.push(["init", config]); }, optInCapturing() { calls.push(["in"]); }, optOutCapturing() { calls.push(["out"]); } };
    const stop = startMarketingAnalytics(sdk, browser);
    const change = value => browser.dispatchEvent(new CustomEvent(policy.MARKETING_CHOICE_EVENT, { detail: value }));
    const stored = value => { const event = new Event("storage"); Object.assign(event, { key: policy.MARKETING_CHOICE_KEY, newValue: value }); browser.dispatchEvent(event); };
    return { calls, browser, stop, change, stored };
  }
  for (const choice of [null, "declined", "invalid"]) { const test = setup({ choice }); assert.equal(test.calls.length, 0); test.stop(); }
  for (const pathname of excludedUrls) { const test = setup({ choice: "allowed", pathname }); assert.equal(test.calls.length, 0, `SDK must not initialize on ${pathname}`); test.stop(); }
  for (const privacy of [{ globalPrivacyControl: true }, { doNotTrack: "1" }]) { const test = setup({ choice: "allowed", privacy }); assert.equal(test.calls.length, 0); test.change("allowed"); assert.equal(test.calls.length, 0); test.stop(); }
  const development = setup({ choice: "allowed", origin: "http://127.0.0.1:4173" }); assert.equal(development.calls.length, 0); development.stop();
  const active = setup(); active.change("allowed");
  assert.deepEqual(active.calls.map(call => call[0]), ["init", "in"]);
  const config = active.calls[0][1];
  assert.equal(config.collectIp, false); assert.equal(config.optOutCapturingByDefault, true); assert.equal(config.respectDnt, true);
  assert.equal(config.persistence, "sessionStorage"); assert.equal(config.maskAllText, true); assert.equal(config.maskAllElementAttributes, true);
  assert.equal(config.requestBatching, false); assert.equal(config.site, "landing");
  active.change("allowed"); assert.equal(active.calls.length, 2, "No duplicate init or pageview on repeated consent");
  assert.ok(config.beforeSend(event));
  active.browser.location = new URL("https://recoveryinventory.com/app");
  assert.equal(config.beforeSend(event), null, "SPA route transitions close the event gate immediately");
  active.browser.dispatchEvent(new CustomEvent(policy.MARKETING_CHOICE_EVENT, { detail: "allowed" }));
  assert.equal(active.calls.at(-1)[0], "out");
  active.browser.location = new URL("https://recoveryinventory.com/about"); active.change("allowed");
  assert.equal(active.calls.filter(call => call[0] === "init").length, 1);
  active.stored("declined"); assert.equal(active.calls.at(-1)[0], "out"); assert.equal(config.beforeSend(event), null);
  active.stop();
  const blocked = setup({ storageBlocked: true }); assert.equal(blocked.calls.length, 0); blocked.change("allowed"); assert.equal(blocked.calls[0][0], "init"); blocked.stop();
  const source = fs.readFileSync("instrumentation-client.ts", "utf8");
  assert.ok(source.includes('import { analytics } from "@heycatch/sdk"'));
  assert.ok(!source.includes("setIdentity"));
  assert.ok(!fs.existsSync("app/marketing-qa"), "Temporary browser fixture must not ship");
  console.log("HeyCatch privacy checks passed: 103 public URLs, excluded routes, opt-in/decline, GPC/DNT, storage failure, private-route transitions, URL/PII/property filtering and consent withdrawal.");
} finally { await server.close(); }
