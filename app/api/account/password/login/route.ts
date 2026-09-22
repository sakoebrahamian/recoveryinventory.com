import { env } from "cloudflare:workers";
import { createSession, jsonError } from "@/lib/auth";
import { consumePasswordHashWork, validateUsername, verifyPassword } from "@/lib/password-auth";

const ATTEMPT_WINDOW_SECONDS = 15 * 60;
const LOCK_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;
const LOGIN_ERROR = "Username or password was not recognized. After repeated attempts, wait 15 minutes and try again.";

type PasswordRow = {
  user_id: string;
  password_hash: string;
  failed_attempts: number;
  last_failed_at: number | null;
  locked_until: number | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: unknown; password?: unknown };
    const usernameResult = validateUsername(body.username);
    const password = typeof body.password === "string" ? body.password : "";
    if (!usernameResult.value || !password) {
      await consumePasswordHashWork(password || "invalid login attempt");
      return Response.json({ error: LOGIN_ERROR }, { status: 401 });
    }

    const row = await env.DB.prepare(
      `SELECT user_id, password_hash, failed_attempts, last_failed_at, locked_until
       FROM password_accounts WHERE username = ? LIMIT 1`,
    ).bind(usernameResult.value.normalized).first<PasswordRow>();
    if (!row) {
      await consumePasswordHashWork(password);
      return Response.json({ error: LOGIN_ERROR }, { status: 401 });
    }

    const now = Math.floor(Date.now() / 1000);
    const passwordMatches = await verifyPassword(password, row.password_hash);
    if ((row.locked_until ?? 0) > now) {
      return Response.json({ error: LOGIN_ERROR }, { status: 401 });
    }
    if (!passwordMatches) {
      const withinWindow = row.last_failed_at !== null && row.last_failed_at > now - ATTEMPT_WINDOW_SECONDS;
      const attempts = withinWindow ? row.failed_attempts + 1 : 1;
      const lockedUntil = attempts >= MAX_ATTEMPTS ? now + LOCK_SECONDS : null;
      await env.DB.prepare(
        `UPDATE password_accounts
         SET failed_attempts = ?, last_failed_at = ?, locked_until = ?, updated_at = ?
         WHERE user_id = ?`,
      ).bind(attempts, now, lockedUntil, now, row.user_id).run();
      return Response.json({ error: LOGIN_ERROR }, { status: 401 });
    }

    await env.DB.prepare(
      `UPDATE password_accounts
       SET failed_attempts = 0, last_failed_at = NULL, locked_until = NULL, updated_at = ?
       WHERE user_id = ?`,
    ).bind(now, row.user_id).run();
    const session = await createSession(row.user_id);
    return Response.json(
      { ok: true },
      { headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
