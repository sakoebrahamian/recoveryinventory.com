import { env } from "cloudflare:workers";
import { createSession, jsonError } from "@/lib/auth";
import { createRecoveryCode, sha256 } from "@/lib/server-crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { alias?: unknown; language?: unknown };
    const alias = typeof body.alias === "string" ? body.alias.trim().replace(/[\u0000-\u001f]/g, "") : "";
    const language = body.language === "fa" || body.language === "es" ? body.language : "en";
    if (alias.length < 2 || alias.length > 40) {
      return Response.json({ error: "Choose an alias between 2 and 40 characters." }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const recoveryCode = createRecoveryCode();
    const recoveryHash = await sha256(recoveryCode);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      `INSERT INTO users
       (id, alias, recovery_hash, subscription_status, preferred_language, created_at, updated_at)
       VALUES (?, ?, ?, 'inactive', ?, ?, ?)`,
    ).bind(userId, alias, recoveryHash, language, now, now).run();

    const session = await createSession(userId);
    return Response.json(
      { alias, recoveryCode, membershipActive: false },
      { status: 201, headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
