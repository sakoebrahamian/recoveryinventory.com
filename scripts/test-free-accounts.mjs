import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "vite";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync("cloudflare-d1-setup.sql", "utf8"));
sqlite.exec(readFileSync("cloudflare-d1-step4-setup.sql", "utf8"));
class Statement {
  constructor(sql, args = []) { this.sql = sql; this.args = args; }
  bind(...args) { return new Statement(this.sql, args); }
  async first() { return sqlite.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: sqlite.prepare(this.sql).all(...this.args) }; }
  async run() { const result = sqlite.prepare(this.sql).run(...this.args); return { meta: { changes: Number(result.changes) } }; }
}
globalThis.__RI_FREE_TEST_ENV__ = {
  DATA_ENCRYPTION_KEY: Buffer.alloc(32, 19).toString("base64url"),
  DB: { prepare: sql => new Statement(sql), async batch(statements) { sqlite.exec("BEGIN"); try { const result = []; for (const statement of statements) result.push(await statement.run()); sqlite.exec("COMMIT"); return result; } catch (error) { sqlite.exec("ROLLBACK"); throw error; } } },
};
const server = await createServer({
  configFile: false, appType: "custom", server: { middlewareMode: true, hmr: false, watch: null }, resolve: { alias: { "@": path.resolve(".") } },
  plugins: [{ name: "free-account-test-env", enforce: "pre", resolveId(id) { if (id === "cloudflare:workers") return "\0free-account-test-env"; }, load(id) { if (id === "\0free-account-test-env") return "export const env = globalThis.__RI_FREE_TEST_ENV__"; } }],
});
const root = "https://recoveryinventory.com";
const get = (url, cookie) => new Request(root + url, { headers: cookie ? { cookie } : {} });
const post = (url, body, cookie) => new Request(root + url, { method: "POST", headers: { "content-type": "application/json", origin: root, ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });
try {
  const [signup, inventories, me, analytics, workbooks, guide, access] = await Promise.all([
    server.ssrLoadModule("/app/api/account/create/route.ts"), server.ssrLoadModule("/app/api/inventories/route.ts"), server.ssrLoadModule("/app/api/account/me/route.ts"),
    server.ssrLoadModule("/app/api/analytics/step10/route.ts"), server.ssrLoadModule("/app/api/step4-workbooks/route.ts"), server.ssrLoadModule("/app/api/inventory-guide/route.ts"), server.ssrLoadModule("/lib/free-account.ts"),
  ]);
  const now = Math.floor(Date.now() / 1000);
  assert.equal(access.freeAccountWindow(now, now).active, true);
  assert.equal(access.freeAccountWindow(now, now + 7 * 86400 - 1).active, true);
  assert.equal(access.freeAccountWindow(now, now + 7 * 86400).active, false);
  assert.equal(access.freeAccountWindow(undefined, now).active, false);
  assert.equal(access.freeAccountWindow(now + 1, now).active, false);
  const date = offset => { const day = new Date(); day.setUTCDate(day.getUTCDate() - offset); return day.toISOString().slice(0, 10); };
  const year = date(0).slice(0, 4);
  const years = [...new Set([year, date(7).slice(0, 4)])];
  async function savedInventories(cookie) {
    const responses = await Promise.all(years.map(async value => {
      const response = await inventories.GET(get(`/api/inventories?year=${value}`, cookie));
      assert.equal(response.status, 200);
      return (await response.json()).inventories;
    }));
    return responses.flat();
  }
  const payload = (day, note = "Synthetic free-account note") => ({ questionSetVersion: 2, date: day, mood: "steady", states: { honesty: "practiced", patience: "attention" }, attentionNotes: {}, highlights: note, attention: "", patternAction: "", familyContext: "", amends: "", tomorrow: "", gratitude: "" });
  async function create(name) {
    const response = await signup.POST(post("/api/account/create", { alias: name, username: name.toLowerCase(), password: "Test-only-resilient-93!", language: "en", createdAt: 1 }));
    assert.equal(response.status, 201);
    const cookie = response.headers.get("set-cookie").split(";")[0];
    const user = sqlite.prepare("SELECT id, created_at, subscription_status, stripe_customer_id FROM users WHERE alias = ?").get(name);
    assert.ok(user.created_at >= now && user.subscription_status === "inactive" && user.stripe_customer_id === null);
    return { cookie, id: user.id };
  }
  const first = await create("FreeTestOne");
  assert.equal((await inventories.GET(get(`/api/inventories?year=${year}`))).status, 401);
  assert.equal((await me.GET(get("/api/account/me", first.cookie))).status, 200);
  let account = await (await me.GET(get("/api/account/me", first.cookie))).json();
  assert.equal(account.membershipActive, false); assert.equal(account.step10CanSave, true); assert.equal(account.inventoryGuideAvailable, false);
  assert.equal((await workbooks.GET(get("/api/step4-workbooks", first.cookie))).status, 403);
  assert.equal((await guide.POST(post("/api/inventory-guide", { step: "step10", consent: true, message: "A synthetic reflection" }, first.cookie))).status, 403);
  for (let index = 0; index < 7; index++) assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(index), payload: payload(date(index)) }, first.cookie))).status, 200);
  const over = await inventories.POST(post("/api/inventories", { type: "step10", date: date(7), payload: payload(date(7)) }, first.cookie));
  assert.equal(over.status, 403); assert.equal((await over.json()).code, "free_entry_limit");
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(0), payload: payload(date(0), "Edited synthetic note") }, first.cookie))).status, 200);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM inventories WHERE user_id = ?").get(first.id).n, 7);
  assert.ok(!sqlite.prepare("SELECT encrypted_payload FROM inventories WHERE user_id = ? LIMIT 1").get(first.id).encrypted_payload.includes("Synthetic"));
  const list = await savedInventories(first.cookie);
  assert.equal(list.length, 7); assert.ok(list.some(item => item.payload.highlights === "Edited synthetic note"));
  const report = await analytics.GET(get(`/api/analytics/step10?from=${date(6)}&through=${date(0)}&mode=range`, first.cookie));
  assert.equal(report.status, 200); assert.equal((await report.json()).analytics.totalEntries, 7);
  sqlite.prepare("UPDATE users SET created_at = ? WHERE id = ?").run(now - 8 * 86400, first.id);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(0), createdAt: now, payload: payload(date(0)) }, first.cookie))).status, 403);
  assert.equal((await inventories.GET(get(`/api/inventories?year=${year}`, first.cookie))).status, 200);
  assert.equal((await analytics.GET(get(`/api/analytics/step10?through=${date(0)}`, first.cookie))).status, 200);
  account = await (await me.GET(get("/api/account/me", first.cookie))).json(); assert.equal(account.step10CanSave, false);
  sqlite.prepare("UPDATE users SET subscription_status = 'active' WHERE id = ?").run(first.id);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(7), payload: payload(date(7)) }, first.cookie))).status, 200);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step4", date: date(0), payload: { note: "Paid-only synthetic workbook" } }, first.cookie))).status, 200);
  sqlite.prepare("UPDATE users SET subscription_status = 'canceled' WHERE id = ?").run(first.id);
  const retained = await savedInventories(first.cookie); assert.equal(retained.length, 8); assert.ok(retained.every(item => item.type === "step10"));
  assert.equal((await inventories.GET(get(`/api/inventories?year=${year}&type=step4`, first.cookie))).status, 403);
  const second = await create("FreeTestTwo");
  const secondList = await (await inventories.GET(get(`/api/inventories?year=${year}`, second.cookie))).json(); assert.equal(secondList.inventories.length, 0);
  for (let index = 0; index < 6; index++) assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(index), payload: payload(date(index)) }, second.cookie))).status, 200);
  const competing = await Promise.all([6, 7].map(index => inventories.POST(post("/api/inventories", { type: "step10", date: date(index), user_id: first.id, payload: payload(date(index)) }, second.cookie))));
  assert.deepEqual(competing.map(response => response.status).sort(), [200, 403]);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM inventories WHERE user_id = ?").get(second.id).n, 7);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: "2026-02-30", payload: payload("2026-02-30") }, second.cookie))).status, 400);
  console.log("Free-account integration checks passed: real signup without Stripe, seven-day expiry, atomic seven-date cap, edits, encrypted storage, retained read/export data, private analytics, account isolation, paid upgrade continuity, and paid-only Step 4/AI gates.");
} finally { await server.close(); sqlite.close(); delete globalThis.__RI_FREE_TEST_ENV__; }
