import { env } from "cloudflare:workers";
import { expiredSessionCookie, jsonError, sessionHash } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const id = await sessionHash(request);
    if (id) await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(id).run();
    return Response.json(
      { ok: true },
      { headers: { "set-cookie": expiredSessionCookie(), "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
