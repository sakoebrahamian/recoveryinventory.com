import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { isIsoCalendarDate } from "@/lib/free-account";
import { isReflectionKind, parseReflection, type ReflectionPayload } from "@/lib/reflection-journals";
import { decryptJson, encryptJson } from "@/lib/server-crypto";

const noStore = { headers: { "cache-control": "no-store" } };
type ReflectionRow = { entry_date: string; encrypted_payload: string };

function membershipRequired() {
  return Response.json({ code: "subscription_required" }, { ...noStore, status: 403 });
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) return membershipRequired();
    const search = new URL(request.url).searchParams;
    const kind = search.get("kind");
    const date = search.get("date");
    if (!isReflectionKind(kind) || (date !== null && !isIsoCalendarDate(date))) {
      return Response.json({ code: "invalid_reflection" }, { ...noStore, status: 400 });
    }
    const query = date
      ? env.DB.prepare("SELECT entry_date, encrypted_payload FROM reflection_journals WHERE user_id = ? AND kind = ? AND entry_date = ?").bind(account.id, kind, date)
      : env.DB.prepare("SELECT entry_date, encrypted_payload FROM reflection_journals WHERE user_id = ? AND kind = ? ORDER BY entry_date DESC").bind(account.id, kind);
    const result = await query.all<ReflectionRow>();
    const entries = await Promise.all((result.results ?? []).map(async (row) => ({
      date: row.entry_date,
      payload: await decryptJson<ReflectionPayload>(row.encrypted_payload),
    })));
    return Response.json({ entries }, noStore);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) return membershipRequired();
    const body = await request.json().catch(() => null) as { kind?: unknown; date?: unknown; payload?: unknown } | null;
    if (!body || !isReflectionKind(body.kind) || !isIsoCalendarDate(body.date)) {
      return Response.json({ code: "invalid_reflection" }, { ...noStore, status: 400 });
    }
    const payload = parseReflection(body.kind, body.payload);
    if (!payload) return Response.json({ code: "invalid_reflection" }, { ...noStore, status: 400 });

    const encrypted = await encryptJson(payload);
    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      "INSERT INTO reflection_journals (user_id, kind, entry_date, encrypted_payload, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(user_id, kind, entry_date) DO UPDATE SET encrypted_payload = excluded.encrypted_payload, updated_at = excluded.updated_at",
    ).bind(account.id, body.kind, body.date, encrypted, now, now).run();
    return Response.json({ entry: { date: body.date, payload } }, noStore);
  } catch (error) {
    return jsonError(error);
  }
}
