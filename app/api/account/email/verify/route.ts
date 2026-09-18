import { env } from "cloudflare:workers";
import { createSession, getAccount, jsonError } from "@/lib/auth";
import { hashEmailCode, type EmailPurpose } from "@/lib/email-auth";
import { randomToken, sha256 } from "@/lib/server-crypto";

type ChallengeRow = {
  id: string;
  email: string;
  code_hash: string;
  purpose: EmailPurpose;
  user_id: string | null;
  alias: string | null;
  preferred_language: string;
  attempts: number;
  expires_at: number;
  consumed_at: number | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { challengeId?: unknown; code?: unknown };
    const challengeId = typeof body.challengeId === "string" ? body.challengeId.trim() : "";
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
    if (!challengeId || !/^\d{6}$/.test(code)) {
      return Response.json({ error: "Enter the six-digit code from your email." }, { status: 400 });
    }

    const challenge = await env.DB.prepare(
      `SELECT id, email, code_hash, purpose, user_id, alias, preferred_language,
       attempts, expires_at, consumed_at
       FROM email_challenges WHERE id = ? LIMIT 1`,
    ).bind(challengeId).first<ChallengeRow>();
    const now = Math.floor(Date.now() / 1000);
    if (!challenge || challenge.consumed_at || challenge.expires_at <= now || challenge.attempts >= 5) {
      return Response.json({ error: "This code is no longer valid. Request a new one." }, { status: 401 });
    }

    const codeHash = await hashEmailCode(challenge.id, code);
    if (codeHash !== challenge.code_hash) {
      await env.DB.prepare("UPDATE email_challenges SET attempts = attempts + 1 WHERE id = ?")
        .bind(challenge.id).run();
      return Response.json({ error: "That code was not recognized." }, { status: 401 });
    }

    const claimed = await env.DB.prepare(
      "UPDATE email_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL",
    ).bind(now, challenge.id).run();
    if ((claimed.meta.changes ?? 0) !== 1) {
      return Response.json({ error: "This code has already been used." }, { status: 409 });
    }

    if (challenge.purpose === "login") {
      if (!challenge.user_id) {
        return Response.json({ error: "No account was found for this email. Create an account first." }, { status: 404 });
      }
      const session = await createSession(challenge.user_id);
      return Response.json(
        { ok: true, purpose: challenge.purpose },
        { headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
      );
    }

    if (challenge.purpose === "signup") {
      const existing = await env.DB.prepare(
        "SELECT user_id FROM email_accounts WHERE email = ? LIMIT 1",
      ).bind(challenge.email).first<{ user_id: string }>();
      if (existing) {
        return Response.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
      }
      const userId = crypto.randomUUID();
      const recoveryHash = await sha256(`email-only:${randomToken()}`);
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO users
           (id, alias, recovery_hash, subscription_status, preferred_language, created_at, updated_at)
           VALUES (?, ?, ?, 'inactive', ?, ?, ?)`,
        ).bind(
          userId,
          challenge.alias || "Member",
          recoveryHash,
          challenge.preferred_language,
          now,
          now,
        ),
        env.DB.prepare(
          `INSERT INTO email_accounts (user_id, email, verified_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
        ).bind(userId, challenge.email, now, now, now),
      ]);
      const session = await createSession(userId);
      return Response.json(
        { ok: true, purpose: challenge.purpose, email: challenge.email },
        { status: 201, headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
      );
    }

    const account = await getAccount(request);
    if (!account || !challenge.user_id || challenge.user_id !== account.id) {
      return Response.json({ error: "Please sign in again before connecting this email." }, { status: 401 });
    }
    const existing = await env.DB.prepare(
      "SELECT user_id FROM email_accounts WHERE email = ? LIMIT 1",
    ).bind(challenge.email).first<{ user_id: string }>();
    if (existing && existing.user_id !== account.id) {
      return Response.json({ error: "This email is already connected to another account." }, { status: 409 });
    }
    await env.DB.prepare(
      `INSERT INTO email_accounts (user_id, email, verified_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET email = excluded.email,
       verified_at = excluded.verified_at, updated_at = excluded.updated_at`,
    ).bind(account.id, challenge.email, now, now, now).run();
    return Response.json(
      { ok: true, purpose: challenge.purpose, email: challenge.email },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
