import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const ts = createRequire(import.meta.url)("typescript");
const state = globalThis.__subscriptionBillingTest = {
  env: { STRIPE_SECRET_KEY: "sk_test_fixture", STRIPE_PRICE_ID: "price_year", STRIPE_WEBHOOK_SECRET: "whsec_fixture" },
  account: { id: "user_fixture", preferredLanguage: "en", subscriptionStatus: "inactive" },
  queries: [], requests: [], duplicate: false,
};
state.env.DB = {
  prepare(sql) {
    return { bind(...values) {
      return {
        async first() { return state.duplicate ? { id: "event_fixture" } : null; },
        async run() { state.queries.push({ sql, values }); return { success: true }; },
      };
    } };
  },
};
const data = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const envModule = data("export const env = globalThis.__subscriptionBillingTest.env;");
const authModule = data(`
  export const requireAccount = async () => globalThis.__subscriptionBillingTest.account;
  export const hasActiveMembership = (account) => account.subscriptionStatus === "active";
  export const jsonError = (error) => error instanceof Response ? error : Response.json({error: error.message}, {status: 500});
`);
async function load(path, imports = {}) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  let code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  for (const [name, url] of Object.entries(imports)) code = code.replaceAll(`from "${name}"`, `from "${url}"`);
  return data(code);
}
const languagesUrl = await load("lib/languages.ts");
const plansUrl = await load("lib/subscription-plans.ts");
const cryptoUrl = await load("lib/server-crypto.ts", { "cloudflare:workers": envModule });
const stripeUrl = await load("lib/stripe.ts", { "cloudflare:workers": envModule, "./server-crypto": cryptoUrl, "./subscription-plans": plansUrl });
const routeImports = { "@/lib/languages": languagesUrl, "cloudflare:workers": envModule, "@/lib/auth": authModule, "@/lib/stripe": stripeUrl, "@/lib/subscription-plans": plansUrl };
const { POST: checkout } = await import(await load("app/api/billing/checkout/route.ts", routeImports));
const { POST: webhook } = await import(await load("app/api/billing/webhook/route.ts", routeImports));
const { yearlySavings, yearlySavingsPercent } = await import(plansUrl);
assert.equal(yearlySavings, 3488);
assert.equal(yearlySavingsPercent, 58);

const basePrice = { active: true, currency: "usd", product: "prod_fixture" };
const yearly = { ...basePrice, id: "price_year", unit_amount: 2500, recurring: { interval: "year", interval_count: 1, usage_type: "licensed" } };
let monthly = { ...basePrice, id: "price_month", unit_amount: 499, recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } };
let currentSubscription = { id: "sub_fixture", customer: "cus_fixture", status: "active", metadata: { user_id: "user_fixture" }, items: { data: [{ current_period_end: 1800000000 }] } };
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
let warnings = [];
globalThis.fetch = async (url, options = {}) => {
  const path = new URL(url).pathname.replace("/v1", "");
  const values = Object.fromEntries(new URLSearchParams(options.body));
  state.requests.push({ path, url, values, options });
  if (path === "/prices/price_year") return Response.json(yearly);
  if (path === "/prices") return Response.json({ data: [monthly] });
  if (path === "/checkout/sessions") return Response.json({ url: "https://checkout.stripe.com/fixture" });
  if (path === "/promotion_codes") return Response.json({ data: [{ id: "promo_fixture", code: "FREE", active: true, coupon: { id: "coupon_fixture", valid: true, duration: "forever", percent_off: 100 } }] });
  if (path === "/customers") return Response.json({ id: "cus_fixture" });
  if (path === "/subscriptions" || path === "/subscriptions/sub_fixture") return Response.json(currentSubscription);
  if (path === "/invoice_payments") return Response.json({ data: [{ id: "ip_fixture", invoice: "in_fixture" }], has_more: false });
  if (path === "/invoices/in_fixture") return Response.json({ id: "in_fixture", parent: { type: "subscription_details", subscription_details: { subscription: "sub_fixture" } } });
  throw new Error(`Unexpected Stripe request: ${path}`);
};
console.warn = (...values) => warnings.push(values);
const request = (body) => new Request("https://recoveryinventory.com/api/billing/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
function reset() { state.requests = []; state.queries = []; warnings = []; state.duplicate = false; }
async function sendEvent(type, object, validSignature = true) {
  const raw = JSON.stringify({ id: "evt_fixture", type, data: { object } });
  const timestamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(state.env.STRIPE_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = Buffer.from(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${raw}`))).toString("hex");
  return webhook(new Request("https://recoveryinventory.com/api/billing/webhook", { method: "POST", body: raw, headers: { "stripe-signature": `t=${timestamp},v1=${validSignature ? signature : "0".repeat(64)}` } }));
}

try {
  for (const plan of ["monthly", "yearly", undefined]) {
    reset();
    assert.equal((await checkout(request({ plan, language: "es" }))).status, 200);
    const session = state.requests.find((r) => r.path === "/checkout/sessions").values;
    assert.equal(session["line_items[0][price]"], plan === "monthly" ? "price_month" : "price_year");
    assert.equal(session.locale, "es");
    assert.equal(session.mode, "subscription");
    assert.match(session.cancel_url, new RegExp(`plan=${plan ?? "yearly"}$`));
    assert.equal(session["subscription_data[metadata][billing_plan]"], plan ?? "yearly");
  }
  for (const [language, locale] of [["fr", "fr"], ["pt-br", "pt-BR"], ["ar", "auto"], ["de", "de"], ["hy", "auto"], ["it", "it"], ["el", "el"], ["fa", "auto"]]) {
    reset();
    assert.equal((await checkout(request({ plan: "monthly", language }))).status, 200);
    assert.equal(state.requests.find((item) => item.path === "/checkout/sessions").values.locale, locale);
  }
  reset();
  assert.equal((await checkout(request({ plan: "monthly", language: "fa", promotionCode: "FREE" }))).status, 200);
  assert.equal(state.requests.find((r) => r.path === "/subscriptions").values["items[0][price]"], "price_month");
  assert.equal(state.requests.some((r) => r.path === "/checkout/sessions"), false);

  for (const invalid of [null, "weekly", "price_attacker", { price: "price_attacker" }]) {
    reset();
    assert.equal((await checkout(request({ plan: invalid }))).status, 400);
    assert.equal(state.requests.length, 0, "Reject arbitrary prices before contacting Stripe");
  }
  reset();
  assert.equal((await checkout(request(null))).status, 400);
  state.account.subscriptionStatus = "active";
  assert.equal((await checkout(request({ plan: "monthly" }))).status, 409);
  state.account.subscriptionStatus = "inactive";
  for (const changes of [{ unit_amount: 500 }, { currency: "eur" }, { product: "prod_other" }, { active: false }, { recurring: { ...monthly.recurring, interval: "year" } }, { recurring: { ...monthly.recurring, interval_count: 3 } }]) {
    reset();
    const saved = monthly;
    monthly = { ...monthly, ...changes };
    assert.equal((await checkout(request({ plan: "monthly" }))).status, 500);
    assert.equal(state.requests.some((r) => r.path === "/checkout/sessions"), false);
    monthly = saved;
  }

  for (const type of ["checkout.session.completed", "checkout.session.async_payment_succeeded"]) {
    reset();
    assert.equal((await sendEvent(type, { subscription: "sub_fixture", customer: "cus_fixture", client_reference_id: "user_fixture", payment_status: "paid" })).status, 200);
    assert.ok(state.queries.some((q) => q.values.includes(1800000000)), "Use Stripe subscription-item period end for either billing interval");
  }
  reset();
  assert.equal((await sendEvent("checkout.session.completed", { payment_status: "unpaid", subscription: "sub_fixture" })).status, 200);
  assert.equal(state.queries.length, 0, "Unpaid checkout must not grant access");
  for (const [type, status] of [["invoice.paid", "active"], ["invoice.payment_failed", "past_due"], ["customer.subscription.deleted", "canceled"]]) {
    reset();
    currentSubscription = { ...currentSubscription, status };
    const object = type.startsWith("invoice") ? { parent: { type: "subscription_details", subscription_details: { subscription: "sub_fixture" } } } : { id: "sub_fixture" };
    assert.equal((await sendEvent(type, object)).status, 200);
    assert.ok(state.queries.some((q) => q.values.includes(status)), `Reconcile ${type} with current Stripe status`);
  }
  for (const type of ["charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created"]) {
    reset();
    assert.equal((await sendEvent(type, { id: "risk_fixture", payment_intent: "pi_fixture" })).status, 200);
    assert.ok(state.requests.some((r) => r.path === "/invoice_payments"));
    assert.equal(warnings.length, 1);
    assert.ok(state.queries.some((q) => q.sql.includes("billing_events")));
  }
  reset();
  assert.equal((await sendEvent("invoice.paid", {}, false)).status, 400);
  assert.equal(state.queries.length, 0);
  state.duplicate = true;
  assert.equal((await (await sendEvent("invoice.paid", {})).json()).duplicate, true);
  assert.equal(state.requests.length, 0);
  console.log("Subscription billing checks passed: ten-language checkout mapping, both plans, correct amounts/currency/interval/product, legacy default, promotions, invalid input, active-member guard, signed paid/unpaid checkout, renewals, failed payments, cancellation, risk reconciliation, and duplicate events.");
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
  delete globalThis.__subscriptionBillingTest;
}
