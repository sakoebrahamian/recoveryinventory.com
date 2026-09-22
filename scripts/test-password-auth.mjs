import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import { createServer } from "vite";

const now = Math.floor(Date.now() / 1000);
const sha256 = (value) => createHash("sha256").update(value).digest("base64url");
const state = {
  users: new Map([
    ["existing-anonymous", { id: "existing-anonymous", alias: "Quiet River", recovery_hash: "anon-recovery", stripe_customer_id: "cus_anon", subscription_status: "active", current_period_end: now + 100000, preferred_language: "en" }],
    ["existing-email", { id: "existing-email", alias: "Email Member", recovery_hash: "email-recovery", stripe_customer_id: "cus_email", subscription_status: "active", current_period_end: now + 100000, preferred_language: "es" }],
  ]),
  emails: new Map([
    ["existing-email", { user_id: "existing-email", email: "member@example.test", verified_at: now }],
  ]),
  passwords: new Map(),
  sessions: new Map([
    [sha256("anon-session-token"), { id: sha256("anon-session-token"), user_id: "existing-anonymous", expires_at: now + 3600, created_at: now }],
    [sha256("email-session-token"), { id: sha256("email-session-token"), user_id: "existing-email", expires_at: now + 3600, created_at: now }],
  ]),
  inventories: [
    { id: "anon-step10", user_id: "existing-anonymous", payload: "encrypted-a" },
    { id: "email-step10", user_id: "existing-email", payload: "encrypted-b" },
  ],
  workbooks: [
    { id: "anon-step4", user_id: "existing-anonymous", payload: "encrypted-c" },
    { id: "email-step4", user_id: "existing-email", payload: "encrypted-d" },
  ],
};

const savedDataBefore = JSON.stringify({ inventories: state.inventories, workbooks: state.workbooks });

class Statement {
  constructor(sql) {
    this.sql = sql.replace(/\s+/g, " ").trim();
    this.args = [];
  }

  bind(...args) {
    this.args = args;
    return this;
  }

  async first() {
    const query = this.sql;
    if (query.includes("FROM sessions s") && query.includes("JOIN users u")) {
      const [id, cutoff] = this.args;
      const session = state.sessions.get(id);
      if (!session || session.expires_at <= cutoff) return null;
      const user = state.users.get(session.user_id);
      const email = state.emails.get(user.id);
      const password = state.passwords.get(user.id);
      return {
        ...user,
        email: email?.email ?? null,
        email_verified_at: email?.verified_at ?? null,
        username_display: password?.username_display ?? null,
      };
    }
    if (query.includes("FROM users WHERE recovery_hash = ?")) {
      const user = [...state.users.values()].find((item) => item.recovery_hash === this.args[0]);
      return user ? { id: user.id, alias: user.alias } : null;
    }
    if (query.includes("FROM password_accounts WHERE user_id = ?")) {
      const row = state.passwords.get(this.args[0]);
      return row ? { ...row } : null;
    }
    if (query.includes("FROM password_accounts WHERE username = ?")) {
      const row = [...state.passwords.values()].find((item) => item.username === this.args[0]);
      if (!row) return null;
      return query.includes("password_hash") ? { ...row } : { user_id: row.user_id };
    }
    throw new Error(`Unhandled first query: ${query}`);
  }

  async run() {
    const query = this.sql;
    if (query.startsWith("INSERT INTO sessions")) {
      const [id, user_id, expires_at, created_at] = this.args;
      state.sessions.set(id, { id, user_id, expires_at, created_at });
      return { meta: { changes: 1 } };
    }
    if (query.startsWith("INSERT INTO password_accounts")) {
      const [user_id, username, username_display, password_hash, created_at, updated_at] = this.args;
      if ([...state.passwords.values()].some((item) => item.username === username)) {
        throw new Error("UNIQUE constraint failed: password_accounts.username");
      }
      state.passwords.set(user_id, {
        user_id,
        username,
        username_display,
        password_hash,
        failed_attempts: 0,
        last_failed_at: null,
        locked_until: null,
        created_at,
        updated_at,
      });
      return { meta: { changes: 1 } };
    }
    if (query.startsWith("UPDATE password_accounts") && query.includes("SET username = ?")) {
      const [username, username_display, password_hash, updated_at, user_id] = this.args;
      const current = state.passwords.get(user_id);
      state.passwords.set(user_id, {
        ...current,
        username,
        username_display,
        password_hash,
        failed_attempts: 0,
        last_failed_at: null,
        locked_until: null,
        updated_at,
      });
      return { meta: { changes: 1 } };
    }
    if (query.startsWith("UPDATE password_accounts") && query.includes("SET failed_attempts = ?")) {
      const [failed_attempts, last_failed_at, locked_until, updated_at, user_id] = this.args;
      Object.assign(state.passwords.get(user_id), { failed_attempts, last_failed_at, locked_until, updated_at });
      return { meta: { changes: 1 } };
    }
    if (query.startsWith("UPDATE password_accounts") && query.includes("SET failed_attempts = 0")) {
      const [updated_at, user_id] = this.args;
      Object.assign(state.passwords.get(user_id), {
        failed_attempts: 0,
        last_failed_at: null,
        locked_until: null,
        updated_at,
      });
      return { meta: { changes: 1 } };
    }
    if (query.startsWith("INSERT INTO users")) {
      const [id, alias, recovery_hash, preferred_language] = this.args;
      state.users.set(id, {
        id,
        alias,
        recovery_hash,
        stripe_customer_id: null,
        subscription_status: "inactive",
        current_period_end: null,
        preferred_language,
      });
      return { meta: { changes: 1 } };
    }
    throw new Error(`Unhandled run query: ${query}`);
  }
}

globalThis.__TEST_ENV__ = {
  DB: {
    prepare(sql) {
      return new Statement(sql);
    },
    async batch(statements) {
      return Promise.all(statements.map((statement) => statement.run()));
    },
  },
};

const server = await createServer({
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  resolve: { alias: { "@": path.resolve(".") } },
  plugins: [{
    name: "test-cloudflare-workers",
    enforce: "pre",
    resolveId(id) {
      if (id === "cloudflare:workers") return "\0test-cloudflare-workers";
    },
    load(id) {
      if (id === "\0test-cloudflare-workers") return "export const env = globalThis.__TEST_ENV__";
    },
  }],
});

function postRequest(url, body, token) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { cookie: `ri_session=${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

try {
  const passwordRoute = await server.ssrLoadModule("/app/api/account/password/route.ts");
  const loginRoute = await server.ssrLoadModule("/app/api/account/password/login/route.ts");
  const meRoute = await server.ssrLoadModule("/app/api/account/me/route.ts");
  const createRoute = await server.ssrLoadModule("/app/api/account/create/route.ts");
  const recoverRoute = await server.ssrLoadModule("/app/api/account/recover/route.ts");

  let response = await passwordRoute.POST(postRequest(
    "http://test/api/account/password",
    { username: "Quiet.River", password: "private anonymous passphrase 2026" },
    "anon-session-token",
  ));
  assert.equal(response.status, 200);
  assert.equal(state.passwords.get("existing-anonymous").username, "quiet.river");

  response = await passwordRoute.POST(postRequest(
    "http://test/api/account/password",
    { username: "Quiet.River", password: "another private passphrase 2026" },
    "email-session-token",
  ));
  assert.equal(response.status, 409, "duplicate usernames must be rejected");

  response = await passwordRoute.POST(postRequest(
    "http://test/api/account/password",
    { username: "Email.Member", password: "private email member passphrase 2026" },
    "email-session-token",
  ));
  assert.equal(response.status, 200);
  assert.equal(state.passwords.get("existing-email").user_id, "existing-email");
  assert.equal(
    JSON.stringify({ inventories: state.inventories, workbooks: state.workbooks }),
    savedDataBefore,
    "saved data ownership changed during conversion",
  );

  response = await loginRoute.POST(postRequest(
    "http://test/api/account/password/login",
    { username: "Quiet.River", password: "wrong private password phrase" },
  ));
  assert.equal(response.status, 401);
  assert.equal(state.passwords.get("existing-anonymous").failed_attempts, 1);

  response = await loginRoute.POST(postRequest(
    "http://test/api/account/password/login",
    { username: "Quiet.River", password: "private anonymous passphrase 2026" },
  ));
  assert.equal(response.status, 200);
  assert.equal(state.passwords.get("existing-anonymous").failed_attempts, 0);
  const loginCookie = response.headers.get("set-cookie");
  assert.match(loginCookie, /ri_session=/);

  response = await meRoute.GET(new Request("http://test/api/account/me", {
    headers: { cookie: loginCookie.split(";")[0] },
  }));
  const account = await response.json();
  assert.equal(account.username, "Quiet.River");
  assert.equal(account.membershipActive, true);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await loginRoute.POST(postRequest(
      "http://test/api/account/password/login",
      { username: "Quiet.River", password: `incorrect private phrase ${attempt}` },
    ));
    assert.equal(response.status, 401);
  }
  assert.ok(state.passwords.get("existing-anonymous").locked_until > now);
  response = await loginRoute.POST(postRequest(
    "http://test/api/account/password/login",
    { username: "Quiet.River", password: "private anonymous passphrase 2026" },
  ));
  assert.equal(response.status, 401, "a temporarily locked account must reject even a correct password");

  response = await createRoute.POST(postRequest(
    "http://test/api/account/create",
    { alias: "New Moon", username: "New.Moon", password: "new anonymous private phrase 2026", language: "fa" },
  ));
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.match(created.recoveryCode, /^RI-(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
  const newPasswordAccount = [...state.passwords.values()].find((row) => row.username === "new.moon");
  assert.ok(newPasswordAccount);
  assert.equal(state.users.get(newPasswordAccount.user_id).preferred_language, "fa");

  response = await recoverRoute.POST(postRequest(
    "http://test/api/account/recover",
    { recoveryCode: created.recoveryCode },
  ));
  assert.equal(response.status, 200, "the required recovery code must remain a working backup login");

  console.log("Password account integration checks passed:");
  console.log("- existing anonymous and email accounts retained their account IDs and saved data");
  console.log("- username uniqueness, failed-attempt tracking, login, and session creation work");
  console.log("- repeated failed logins trigger the temporary account lock");
  console.log("- anonymous signup creates username/password plus a working recovery code");
} finally {
  await server.close();
}
