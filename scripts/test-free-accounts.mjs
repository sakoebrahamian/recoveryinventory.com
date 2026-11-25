import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "vite";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync("cloudflare-d1-setup.sql", "utf8"));
sqlite.exec(readFileSync("cloudflare-d1-step4-setup.sql", "utf8"));
sqlite.exec(readFileSync("cloudflare-d1-reflections-setup.sql", "utf8"));
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
  const [signup, inventories, me, analytics, workbooks, guide, access, reflections, reflectionModel] = await Promise.all([
    server.ssrLoadModule("/app/api/account/create/route.ts"), server.ssrLoadModule("/app/api/inventories/route.ts"), server.ssrLoadModule("/app/api/account/me/route.ts"),
    server.ssrLoadModule("/app/api/analytics/step10/route.ts"), server.ssrLoadModule("/app/api/step4-workbooks/route.ts"), server.ssrLoadModule("/app/api/inventory-guide/route.ts"), server.ssrLoadModule("/lib/free-account.ts"),
    server.ssrLoadModule("/app/api/reflections/route.ts"), server.ssrLoadModule("/lib/reflection-journals.ts"),
  ]);
  const now = Math.floor(Date.now() / 1000);
  assert.equal(access.FREE_STEP10_DAYS, 30);
  assert.equal(access.FREE_STEP10_ENTRIES, 30);
  assert.equal(access.freeAccountWindow(now, now).active, true);
  assert.equal(access.freeAccountWindow(now, now + 30 * 86400 - 1).active, true);
  assert.equal(access.freeAccountWindow(now, now + 30 * 86400).active, false);
  assert.equal(access.freeAccountWindow(undefined, now).active, false);
  assert.equal(access.freeAccountWindow(now + 1, now).active, false);
  const date = offset => { const day = new Date(); day.setUTCDate(day.getUTCDate() - offset); return day.toISOString().slice(0, 10); };
  const year = date(0).slice(0, 4);
  const years = [...new Set([year, date(30).slice(0, 4)])];
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
  assert.equal((await reflections.GET(get("/api/reflections?kind=step11", first.cookie))).status, 403);
  assert.equal((await reflections.POST(post("/api/reflections", { kind: "step11", date: date(0), payload: { intention: "Private test" } }, first.cookie))).status, 403);
  assert.equal((await guide.POST(post("/api/inventory-guide", { step: "step10", consent: true, message: "A synthetic reflection" }, first.cookie))).status, 403);
  sqlite.prepare("UPDATE users SET created_at = ? WHERE id = ?").run(now - 8 * 86400, first.id);
  const extendedAccount = await (await me.GET(get("/api/account/me", first.cookie))).json();
  assert.equal(extendedAccount.step10CanSave, true, "An existing eight-day-old free account receives the longer period");
  assert.equal(extendedAccount.freeWeekEndsAt, now + 22 * 86400);
  assert.equal(extendedAccount.freeEntriesLimit, 30);
  for (let index = 0; index < 30; index++) assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(index), payload: payload(date(index)) }, first.cookie))).status, 200);
  const over = await inventories.POST(post("/api/inventories", { type: "step10", date: date(30), payload: payload(date(30)) }, first.cookie));
  assert.equal(over.status, 403); assert.equal((await over.json()).code, "free_entry_limit");
  const quickCheckIn = { ...payload(date(0), "Edited synthetic note"), states: {}, attention: "Quick concern", tomorrow: "Quick next action" };
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(0), payload: quickCheckIn }, first.cookie))).status, 200);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM inventories WHERE user_id = ?").get(first.id).n, 30);
  assert.ok(!sqlite.prepare("SELECT encrypted_payload FROM inventories WHERE user_id = ? LIMIT 1").get(first.id).encrypted_payload.includes("Synthetic"));
  const list = await savedInventories(first.cookie);
  assert.equal(list.length, 30); assert.ok(list.some(item => item.payload.highlights === "Edited synthetic note"));
  assert.deepEqual(list.find(item => item.date === date(0)).payload, quickCheckIn);
  const report = await analytics.GET(get(`/api/analytics/step10?from=${date(29)}&through=${date(0)}&mode=range`, first.cookie));
  assert.equal(report.status, 200); assert.equal((await report.json()).analytics.totalEntries, 30);
  sqlite.prepare("UPDATE users SET created_at = ? WHERE id = ?").run(now - 31 * 86400, first.id);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(0), createdAt: now, payload: payload(date(0)) }, first.cookie))).status, 403);
  assert.equal((await inventories.GET(get(`/api/inventories?year=${year}`, first.cookie))).status, 200);
  assert.equal((await analytics.GET(get(`/api/analytics/step10?through=${date(0)}`, first.cookie))).status, 200);
  account = await (await me.GET(get("/api/account/me", first.cookie))).json(); assert.equal(account.step10CanSave, false);
  sqlite.prepare("UPDATE users SET subscription_status = 'active' WHERE id = ?").run(first.id);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(30), payload: payload(date(30)) }, first.cookie))).status, 200);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step4", date: date(0), payload: { note: "Paid-only synthetic workbook" } }, first.cookie))).status, 200);
  const journalPayloads = {
    step67: { pattern: "Defensiveness", willingness: "Pause before replying", humility: "Ask someone for help" },
    step89: { initials: "J.", responsibility: "Listen more carefully", boundaries: "Give space", sponsor: "Ask about the next step" },
    step11: { practice: "quiet", intention: "Listen before replying" },
  };
  for (const [kind, body] of Object.entries(journalPayloads)) {
    const saved = await reflections.POST(post("/api/reflections", { kind, date: date(0), payload: body }, first.cookie));
    assert.equal(saved.status, 200);
    assert.deepEqual((await saved.json()).entry, { date: date(0), payload: body });
    const read = await reflections.GET(get(`/api/reflections?kind=${kind}&date=${date(0)}`, first.cookie));
    assert.deepEqual((await read.json()).entries, [{ date: date(0), payload: body }]);
    const stored = sqlite.prepare("SELECT encrypted_payload FROM reflection_journals WHERE user_id = ? AND kind = ?").get(first.id, kind);
    assert.ok(!stored.encrypted_payload.includes(Object.values(body).at(-1)));
  }
  assert.equal((await reflections.POST(post("/api/reflections", { kind: "step11", date: date(0), payload: { practice: "unknown", intention: "Rejected" } }, first.cookie))).status, 400);
  const edited = await reflections.POST(post("/api/reflections", { kind: "step11", date: date(0), payload: { intention: "Listen again" } }, first.cookie));
  assert.equal(edited.status, 200);
  const morning = await reflections.GET(get("/api/reflections?kind=step11", first.cookie));
  assert.deepEqual((await morning.json()).entries, [{ date: date(0), payload: { intention: "Listen again" } }]);
  assert.ok((await savedInventories(first.cookie)).every(item => item.type === "step10" || item.type === "step4"));
  assert.deepEqual(reflectionModel.trackedPatterns([{ payload: { pattern: "Defensiveness" } }, { payload: { pattern: "  defensiveness " } }]), [{ name: "Defensiveness", count: 2 }]);
  sqlite.prepare("UPDATE users SET subscription_status = 'canceled' WHERE id = ?").run(first.id);
  const retained = await savedInventories(first.cookie); assert.equal(retained.length, 31); assert.ok(retained.every(item => item.type === "step10"));
  assert.equal((await inventories.GET(get(`/api/inventories?year=${year}&type=step4`, first.cookie))).status, 403);
  const second = await create("FreeTestTwo");
  const secondList = await (await inventories.GET(get(`/api/inventories?year=${year}`, second.cookie))).json(); assert.equal(secondList.inventories.length, 0);
  sqlite.prepare("UPDATE users SET subscription_status = 'active' WHERE id = ?").run(second.id);
  const isolatedJournal = await reflections.GET(get("/api/reflections?kind=step11", second.cookie));
  assert.deepEqual((await isolatedJournal.json()).entries, []);
  sqlite.prepare("UPDATE users SET subscription_status = 'inactive' WHERE id = ?").run(second.id);
  for (let index = 0; index < 29; index++) assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: date(index), payload: payload(date(index)) }, second.cookie))).status, 200);
  const competing = await Promise.all([29, 30].map(index => inventories.POST(post("/api/inventories", { type: "step10", date: date(index), user_id: first.id, payload: payload(date(index)) }, second.cookie))));
  assert.deepEqual(competing.map(response => response.status).sort(), [200, 403]);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM inventories WHERE user_id = ?").get(second.id).n, 30);
  assert.equal((await inventories.POST(post("/api/inventories", { type: "step10", date: "2026-02-30", payload: payload("2026-02-30") }, second.cookie))).status, 400);
  console.log("Account integration checks passed: free Step 10 check-ins, 30-day expiry, atomic 30-date cap, retained entries, paid upgrades, and encrypted and account-scoped private journals.");
} finally { await server.close(); sqlite.close(); delete globalThis.__RI_FREE_TEST_ENV__; }
