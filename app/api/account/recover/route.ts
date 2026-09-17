import { env } from "cloudflare:workers";
import { createSession, jsonError } from "@/lib/auth";
import { normalizeRecoveryCode, sha256 } from "@/lib/server-crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { recoveryCode?: unknown };
    const rawCode = typeof body.recoveryCode === "string" ? body.recoveryCode : "";
    const normalized = normalizeRecoveryCode(rawCode);
    if (!/^RI-(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/.test(normalized)) {
      return Response.json({ error: "That recovery code is not valid." }, { status: 401 });
    }
    const hash = await sha256(normalized);
    const account = await env.DB.prepare(
      "SELECT id, alias FROM users WHERE recovery_hash = ? LIMIT 1",
    ).bind(hash).first<{ id: string; alias: string }>();
    if (!account) return Response.json({ error: "That recovery code was not recognized." }, { status: 401 });

    const session = await createSession(account.id);
    return Response.json(
      { alias: account.alias },
      { headers: { "set-cookie": session.cookie, "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
