import { env } from "cloudflare:workers";
import { jsonError, requireAccount } from "@/lib/auth";
import { hashPassword, validatePassword, validateUsername, verifyPassword } from "@/lib/password-auth";

type PasswordRow = {
  username: string;
  username_display: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    const body = await request.json() as {
      username?: unknown;
      password?: unknown;
      currentPassword?: unknown;
    };
    const usernameResult = validateUsername(body.username);
    if (!usernameResult.value) {
      return Response.json({ error: usernameResult.error }, { status: 400 });
    }

    const existing = await env.DB.prepare(
      `SELECT username, username_display, password_hash
       FROM password_accounts WHERE user_id = ? LIMIT 1`,
    ).bind(account.id).first<PasswordRow>();
    const requestedPassword = typeof body.password === "string" ? body.password : "";
    const passwordResult = requestedPassword
      ? validatePassword(requestedPassword, [account.alias, account.email ?? "", usernameResult.value.display])
      : { value: undefined, error: undefined };
    if (requestedPassword && !passwordResult.value) {
      return Response.json({ error: passwordResult.error }, { status: 400 });
    }
    if (!existing && !passwordResult.value) {
      return Response.json({ error: "Enter a password with at least 15 characters." }, { status: 400 });
    }
    if (existing) {
      const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
      if (!currentPassword || !await verifyPassword(currentPassword, existing.password_hash)) {
        return Response.json({ error: "Your current password was not recognized." }, { status: 401 });
      }
    }

    const usernameOwner = await env.DB.prepare(
      "SELECT user_id FROM password_accounts WHERE username = ? LIMIT 1",
    ).bind(usernameResult.value.normalized).first<{ user_id: string }>();
    if (usernameOwner && usernameOwner.user_id !== account.id) {
      return Response.json({ error: "That username is already in use. Choose another one." }, { status: 409 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (existing) {
      const passwordHash = passwordResult.value
        ? await hashPassword(passwordResult.value)
        : existing.password_hash;
      await env.DB.prepare(
        `UPDATE password_accounts
         SET username = ?, username_display = ?, password_hash = ?,
         failed_attempts = 0, last_failed_at = NULL, locked_until = NULL, updated_at = ?
         WHERE user_id = ?`,
      ).bind(
        usernameResult.value.normalized,
        usernameResult.value.display,
        passwordHash,
        now,
        account.id,
      ).run();
    } else {
      const passwordHash = await hashPassword(passwordResult.value!);
      await env.DB.prepare(
        `INSERT INTO password_accounts
         (user_id, username, username_display, password_hash, failed_attempts,
          last_failed_at, locked_until, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, NULL, NULL, ?, ?)`,
      ).bind(
        account.id,
        usernameResult.value.normalized,
        usernameResult.value.display,
        passwordHash,
        now,
        now,
      ).run();
    }

    return Response.json({
      ok: true,
      username: usernameResult.value.display,
      hasPasswordLogin: true,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE constraint failed: password_accounts.username")) {
      return Response.json({ error: "That username is already in use. Choose another one." }, { status: 409 });
    }
    return jsonError(error);
  }
}
