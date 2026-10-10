import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = await readFile(new URL("../lib/billing-client.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { BillingTimeoutError, requestBilling } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const originalFetch = globalThis.fetch;
let calls;
function mockFetch(handler) {
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return handler(url, options);
  };
}

try {
  mockFetch(() => Response.json({ activated: true }));
  assert.deepEqual(await requestBilling("checkout", "  sample-code  ", 100), {
    ok: true, result: { activated: true },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/billing/checkout");
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].options.body), { promotionCode: "sample-code" });

  mockFetch(() => Response.json({ url: "https://checkout.stripe.com/example" }));
  assert.equal((await requestBilling("checkout", " ", 100)).result.url, "https://checkout.stripe.com/example");
  assert.deepEqual(JSON.parse(calls[0].options.body), {});

  mockFetch(() => Response.json({ url: "https://billing.stripe.com/example" }));
  await requestBilling("portal", "ignored-code", 100);
  assert.equal(calls[0].url, "/api/billing/portal");
  assert.equal(calls[0].options.body, undefined);

  mockFetch(() => Response.json({ error: "This account already has an active membership." }, { status: 409 }));
  assert.deepEqual(await requestBilling("checkout", "sample-code", 100), {
    ok: false, result: { error: "This account already has an active membership." },
  });
  assert.equal(calls.length, 1, "Billing errors must not trigger an automatic retry");

  const networkError = new TypeError("Connection interrupted");
  mockFetch(() => { throw networkError; });
  await assert.rejects(requestBilling("checkout", undefined, 100), (error) => error === networkError);
  assert.equal(calls.length, 1);

  mockFetch(() => new Promise(() => {}));
  await assert.rejects(requestBilling("checkout", "sample-code", 10), BillingTimeoutError);
  assert.equal(calls[0].options.signal.aborted, true);
  assert.equal(calls.length, 1, "A timeout must not retry a request that the server may have completed");

  mockFetch(() => ({ ok: true, json: () => new Promise(() => {}) }));
  await assert.rejects(requestBilling("checkout", undefined, 10), BillingTimeoutError);
  assert.equal(calls[0].options.signal.aborted, true, "The response body must also have a deadline");

  mockFetch(() => Response.json({ activated: true }));
  await requestBilling("checkout", undefined, 10);
  const completedSignal = calls[0].options.signal;
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(completedSignal.aborted, false, "Successful requests must clear the timeout");

  console.log("Billing client checks passed: activation, checkout, portal, server errors, network failures, request and body timeouts, and timer cleanup.");
} finally {
  globalThis.fetch = originalFetch;
}
