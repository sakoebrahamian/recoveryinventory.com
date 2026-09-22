import { env } from "cloudflare:workers";
import { createSession, jsonError } from "@/lib/auth";
import { createRecoveryCode, sha256 } from "@/lib/server-crypto";
import { hashPassword, validatePassword, validateUsername } from "@/lib/password-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { alias?: unknown; language?: unknown; username?: unknown; password?: unknown };
    const alias = typeof body.alias === "string" ? body.alias.trim().replace(/[\u0000-\u001f]/g, "") : "";
    const language = body.language === "fa" || body.language === "es" ? body.language : "en";
    if (alias.length < 2 || alias.length > 40) {
      return Response.json({ error: "Choose an alias between 2 and 40 characters." }, { status: 400 });
    }
    const usernameResult = validateUsername(body.username);
    if (!usernameResult.value) {
      return Response.json({ error: usernameResult.error }, { status: 400 });
    }
    const passwordResult = validatePassword(body.password, [alias, usernameResult.value.display]);
    if (!passwordResult.value) {
      return Response.json({ error: passwordResult.error }, { status: 400 });
    }

    const existingUsername = await env.DB.prepare(
      "SELECT user_id FROM password_accounts WHERE username = ? LIMIT 1",
    ).bind(usernameResult.value.normalized).first();
    if (existingUsername) {
      return Response.json({ error: "That username is already in use. Choose another one." }, { status: 409 });
    }

    const userId = crypto.randomUUID();
    const recoveryCode = createRecoveryCode();
    const recoveryHash = await sha256(recoveryCode);
    const passwordHash = await hashPassword(passwordResult.value);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO users
         (id, alias, recovery_hash, subscription_status, preferred_language, created_at, updated_at)
         VALUES (?, ?, ?, 'inactive', ?, ?, ?)`,
      ).bind(userId, alias, recoveryHash, language, now, now),
      env.DB.prepare(
        `INSERT INTO password_accounts
         (user_id, username, username_display, password_hash, failed_attempts,
          last_failed_at, locked_until, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, NULL, NULL, ?, ?)`,
      ).bind(
        userId,
        usernameResult.value.normalized,
        usernameResult.value.display,
        passwordHash,
        now,
        now,
      ),
    ]);

    const session = await createSession(userId);
    return Response.json(
      { alias, username: usernameResult.value.display, recoveryCode, membershipActive: false },
      { status: 201, headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE constraint failed: password_accounts.username")) {
      return Response.json({ error: "That username is already in use. Choose another one." }, { status: 409 });
    }
    return jsonError(error);
  }
}
