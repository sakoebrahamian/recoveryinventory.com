import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createServer } from "vite";

const sqlite = new DatabaseSync(":memory:");
for (const filename of [
  "cloudflare-d1-setup.sql",
  "cloudflare-d1-email-setup.sql",
  "cloudflare-d1-password-setup.sql",
  "cloudflare-d1-inventory-guide-setup.sql",
]) {
  sqlite.exec(readFileSync(filename, "utf8"));
}
const db = {
  prepare(sql) {
    const statement = sqlite.prepare(sql);
    return {
      bind(...values) {
        const bindings = sql.includes("?1") ? [Object.fromEntries(values.map((value, index) => ["?" + (index + 1), value]))] : values;
        return {
          first: async () => statement.get(...bindings) ?? null,
          run: () => ({ success: true, meta: { changes: statement.run(...bindings).changes } }),
        };
      },
    };
  },
  async batch(statements) {
    sqlite.exec("BEGIN IMMEDIATE");
    try {
      const results = statements.map((statement) => statement.run());
      sqlite.exec("COMMIT");
      return results;
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  },
};
globalThis.inventoryGuideTestEnv = { DB: db, OPENAI_API_KEY: "only-a-test-key" };

const server = await createServer({
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { "@": path.resolve(".") } },
  plugins: [{
    name: "inventory-guide-test-bindings",
    resolveId: (id) => id === "cloudflare:workers" ? "\0inventory-guide-test-bindings" : null,
    load: (id) => id === "\0inventory-guide-test-bindings" ? "export const env = globalThis.inventoryGuideTestEnv;" : null,
  }],
});
const realFetch = globalThis.fetch;

try {
  const [{ POST }, { sha256 }] = await Promise.all([
    server.ssrLoadModule("/app/api/inventory-guide/route.ts"),
    server.ssrLoadModule("/lib/server-crypto.ts"),
  ]);
  for (const [id, subscription] of [["member-a", "active"], ["member-b", "trialing"], ["inactive", "inactive"]]) {
    sqlite.prepare("INSERT INTO users (id, alias, recovery_hash, subscription_status, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)")
      .run(id, "Private alias " + id, "hash-" + id, subscription);
    sqlite.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, 0)")
      .run(await sha256(id), id, Math.floor(Date.now() / 1000) + 3600);
  }

  const sent = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    assert.equal(options.headers.authorization, "Bearer only-a-test-key");
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    assert.equal(request.model, "gpt-6-luna");
    assert.equal(request.max_output_tokens, 220);
    assert.doesNotMatch(options.body, /member-a|member-b|Private alias/);
    sent.push(request);
    return Response.json({
      status: "completed",
      output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "What would help you pause next time?" }] }],
    });
  };

  const origin = "https://test.recoveryinventory.com";
  const input = { step: "step4", topic: "fear", language: "fa", note: "یک یادداشت آزمایشی", consent: true };
  const ask = (body, id, site = origin) => POST(new Request(origin + "/api/inventory-guide", {
    method: "POST",
    headers: { origin: site, cookie: id ? "ri_session=" + id : "", "content-type": "application/json" },
    body: JSON.stringify(body),
  }));

  assert.equal((await ask(input)).status, 401);
  assert.equal((await ask(input, "inactive")).status, 403);
  assert.equal((await ask(input, "member-a", "https://outside.example")).status, 403);
  assert.equal((await ask({ ...input, consent: false }, "member-a")).status, 400);
  assert.equal((await ask({ ...input, savedInventories: ["Private workbook text"] }, "member-a")).status, 400);
  assert.equal((await ask({ ...input, step: "step10" }, "member-a")).status, 400);
  assert.equal((await ask({ ...input, note: "a".repeat(6000) }, "member-a")).status, 400);
  assert.equal(sent.length, 0);

  const result = await ask(input, "member-a");
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal((await result.json()).reply, "What would help you pause next time?");
  assert.match(sent[0].instructions, /Reply in Persian/);
  assert.deepEqual(JSON.parse(sent[0].input), { step: "Step 4", topic: "ترس", reflection: input.note });

  sqlite.prepare("UPDATE inventory_guide_usage SET request_count = 9 WHERE bucket LIKE 'day:%'").run();
  const nearDailyLimit = await Promise.all([ask(input, "member-a"), ask(input, "member-a")]);
  assert.deepEqual(nearDailyLimit.map((response) => response.status).sort(), [200, 429]);
  assert.equal(sqlite.prepare("SELECT request_count FROM inventory_guide_usage WHERE bucket LIKE 'month:%'").get().request_count, 2);

  sqlite.prepare("UPDATE inventory_guide_usage SET request_count = 4999 WHERE bucket LIKE 'month:%'").run();
  const step10 = { ...input, step: "step10", topic: "honesty", language: "es", note: "" };
  assert.equal((await ask(step10, "member-b")).status, 200);
  assert.equal((await ask({ ...step10, language: "en" }, "member-b")).status, 429);
  assert.equal(sent.length, 3);
  assert.match(sent[2].instructions, /Reply in Spanish/);
  assert.equal(JSON.parse(sent[2].input).step, "Step 10");
  assert.equal(JSON.parse(sent[2].input).reflection, "");
  assert.equal(sqlite.prepare("SELECT request_count FROM inventory_guide_usage WHERE bucket LIKE 'month:%'").get().request_count, 5000);

  console.log("Inventory guide checks passed (membership, consent, permitted data, reply, and both request caps).");
} finally {
  globalThis.fetch = realFetch;
  delete globalThis.inventoryGuideTestEnv;
  await server.close();
  sqlite.close();
}
