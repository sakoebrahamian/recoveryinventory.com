import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Miniflare } = createRequire(require.resolve("wrangler/package.json"))("miniflare");
const { build } = createRequire(require.resolve("vite/package.json"))("esbuild");
const now = Date.parse("2026-11-22T00:37:20Z") / 1_000;
const day = "2026-11-22";
const owner = "owner@example.test";

const bundle = await build({
  stdin: {
    resolveDir: process.cwd(),
    sourcefile: "site-analytics-worker-test.ts",
    loader: "ts",
    contents: `
      import { POST } from "./app/api/site-analytics/route";
      import { GET } from "./app/api/site-analytics/report/route";
      import { GET as getUsernames } from "./app/api/site-analytics/usernames/route";
      const RealDate = Date;
      let now = ${now} * 1_000;
      globalThis.Date = class extends RealDate {
        constructor(value = now) { super(value); }
        static now() { return now; }
      } as DateConstructor;

      export default {
        fetch(request: Request) {
          now = (${now} + Number(request.headers.get("x-test-elapsed") ?? 0)) * 1_000;
          if (request.method === "POST") return POST(request);
          if (new URL(request.url).pathname === "/api/site-analytics/usernames") return getUsernames(request);
          return GET(request);
        },
      };
    `,
  },
  bundle: true,
  write: false,
  format: "esm",
  external: ["cloudflare:workers"],
});

const runtime = new Miniflare({
  cf: false,
  host: "127.0.0.1",
  compatibilityDate: "2025-04-01",
  modules: true,
  script: bundle.outputFiles[0].text,
  bindings: { ANALYTICS_ADMIN_EMAIL: owner },
  d1Databases: ["DB"],
});

try {
  const database = await runtime.getD1Database("DB");
  const schema = readFileSync("cloudflare-d1-setup.sql", "utf8");
  await database.batch(schema.split(";").map((statement) => statement.trim()).filter(Boolean).map((statement) => database.prepare(statement)));
  // Start with the tables an existing installation had before the hourly rollout.
  await database.batch(["site_analytics_collection", "site_analytics_recent"].map((table) => database.prepare(`DROP TABLE ${table}`)));
  await database.batch(["owner", "member"].flatMap((id) => [
    database.prepare("INSERT INTO users (id, alias, recovery_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, id, `recovery-${id}`, now, now),
    database.prepare("INSERT INTO email_accounts (user_id, email, verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind(id, `${id}@example.test`, now, now, now),
    database.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind(createHash("sha256").update(`test-session-${id}`).digest("base64url"), id, now + 3_600, now),
  ]));
  await database.prepare("INSERT INTO site_analytics_daily (day, metric, label, count) VALUES ('2026-11-21', 'page', 'home', 7)").run();

  const get = (params, account = "owner", elapsed = 0) => runtime.dispatchFetch(`https://analytics.test/api/site-analytics/report?${params}`, {
    headers: { ...(account ? { cookie: `ri_session=test-session-${account}` } : {}), "x-test-elapsed": String(elapsed) },
  });
  const usernames = (account = "owner") => runtime.dispatchFetch("https://analytics.test/api/site-analytics/usernames", {
    headers: account ? { cookie: `ri_session=test-session-${account}` } : {},
  });
  const post = (events, headers = {}) => runtime.dispatchFetch("https://analytics.test/api/site-analytics", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0", ...headers },
    body: JSON.stringify({ day, events }),
  });

  assert.equal((await get("hours=24", null)).status, 401);
  assert.equal((await get("hours=24", "member")).status, 403);

  assert.deepEqual(await (await usernames()).json(), { usernames: [] });
  await database.batch([
    database.prepare("INSERT INTO users (id, alias, recovery_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
      .bind("anonymous", "Private alias", "recovery-anonymous", now, now),
    ...[
      ["member", "zebraring", "ZebraRing"],
      ["anonymous", "bluebird", "BlueBird"],
    ].map(([id, username, display]) => database.prepare(
      "INSERT INTO password_accounts (user_id, username, username_display, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    ).bind(id, username, display, "test-password-hash", now, now)),
  ]);
  assert.equal((await usernames(null)).status, 401);
  assert.equal((await usernames("member")).status, 403);
  await database.prepare("UPDATE email_accounts SET verified_at = 0 WHERE user_id = 'owner'").run();
  assert.equal((await usernames()).status, 403);
  await database.prepare("UPDATE email_accounts SET verified_at = ? WHERE user_id = 'owner'").bind(now).run();

  const usernameResponse = await usernames();
  assert.equal(usernameResponse.status, 200);
  assert.equal(usernameResponse.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(await usernameResponse.json(), { usernames: ["BlueBird", "ZebraRing"] });

  const dailyResponse = await get(`days=7&through=${day}`);
  assert.equal(dailyResponse.status, 200);
  assert.equal(dailyResponse.headers.get("cache-control"), "private, no-store");
  const daily = await dailyResponse.json();
  assert.equal(Object.hasOwn(daily, "usernames"), false);
  assert.equal(daily.daily.length, 7);
  assert.equal(daily.totals.pageViews, 7);

  const beforeHourlyData = await (await get("hours=24")).json();
  assert.equal(beforeHourlyData.totals.pageViews, 0, "Historical daily totals can't be used as hourly data");

  const cutoff = now - 24 * 3_600;
  const captureStart = cutoff - 3_600;
  await database.prepare("UPDATE site_analytics_collection SET recent_started_at = ? WHERE id = 1").bind(captureStart).run();
  await database.batch([
    [cutoff - 1, "page", "home", 50],
    [cutoff, "page", "home", 1],
    [cutoff + 1, "page", "home", 2],
    [now - 1, "page", "join", 3],
    [now - 1, "language", "es", 3],
    [now - 1, "page_language", "join:es", 3],
    [now - 1, "entry_source", "google", 2],
    [now - 1, "action", "checkout_started", 1],
    [now - 1, "action_source", "checkout_started:google", 1],
    [now, "page", "home", 4],
  ].map((event) => database.prepare("INSERT INTO site_analytics_recent (recorded_at, metric, label, count) VALUES (?, ?, ?, ?)").bind(...event)));
  const hourly = await (await get("hours=24")).json();
  assert.equal(new Date(hourly.range.through) - new Date(hourly.range.from), 24 * 3_600_000);
  assert.equal(hourly.range.collectedFrom, new Date(captureStart * 1_000).toISOString());
  assert.equal(hourly.hourly.length, 25);
  assert.equal(hourly.hourly[0].from, hourly.range.from);
  assert.equal(hourly.hourly[0].pageViews, 3);
  assert.equal(hourly.hourly.at(-1).through, hourly.range.through);
  assert.equal(hourly.hourly.at(-1).checkouts, 1);
  assert.equal(hourly.hourly.reduce((sum, hour) => sum + hour.pageViews, 0), hourly.totals.pageViews);
  assert.equal(hourly.totals.pageViews, 6);
  assert.equal(hourly.totals.entries, 2);
  assert.equal(hourly.pageLanguages.join.es, 3);
  assert.equal(hourly.actionSources.checkout_started.google, 1);

  await database.prepare("INSERT INTO site_analytics_recent (recorded_at, metric, label, count) VALUES (?, 'page', 'demo', 70)")
    .bind(now - 48 * 3_600 - 1).run();
  const events = [
    { metric: "page", label: "demo" },
    { metric: "language", label: "fr" },
    { metric: "page_language", label: "demo:fr" },
  ];
  assert.equal((await post([null])).status, 400);
  assert.equal((await post(events, { "sec-gpc": "1" })).status, 204);
  assert.equal((await post(events)).status, 204);

  const updatedHourly = await (await get("hours=24", "owner", 1)).json();
  assert.equal(updatedHourly.totals.pageViews, 10);
  assert.equal(updatedHourly.totals.demoVisits, 1);
  assert.equal(updatedHourly.languages.fr, 1);
  assert.equal(updatedHourly.pageLanguages.demo.fr, 1);
  assert.equal(await database.prepare("SELECT COUNT(*) AS count FROM site_analytics_recent WHERE recorded_at < ?").bind(now - 48 * 3_600).first("count"), 0);
  const updatedDaily = await (await get(`days=30&through=${day}`)).json();
  assert.equal(updatedDaily.totals.pageViews, 8);
  assert.equal(updatedDaily.pageLanguages.demo.fr, 1);

  console.log("Owner analytics checks passed: authorization, registered usernames, rolling boundaries, partial hours, daily history, breakdowns, retention and GPC.");
} finally {
  await runtime.dispose();
}
