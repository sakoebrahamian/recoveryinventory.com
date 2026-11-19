import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { decryptJson, encryptJson } from "@/lib/server-crypto";
import { freeAccountWindow, FREE_STEP10_ENTRIES, FREE_STEP10_INSERT, isIsoCalendarDate } from "@/lib/free-account";

type InventoryRow = {
  id: string;
  type: "step10" | "step4";
  entry_date: string;
  encrypted_payload: string;
  updated_at: number;
};

function validType(value: unknown): value is "step10" | "step4" {
  return value === "step10" || value === "step4";
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    const url = new URL(request.url);
    let type = url.searchParams.get("type");
    const year = url.searchParams.get("year");
    if (type && !validType(type)) return Response.json({ error: "Invalid inventory type." }, { status: 400 });
    if (!year || !/^\d{4}$/.test(year)) return Response.json({ error: "A four-digit year is required." }, { status: 400 });
    if (!hasActiveMembership(account)) {
      if (type === "step4") return Response.json({ error: "An active membership is required for Step 4 workbooks." }, { status: 403 });
      type = "step10";
    }

    const query = type
      ? env.DB.prepare(
          `SELECT id, type, entry_date, encrypted_payload, updated_at FROM inventories
           WHERE user_id = ? AND type = ? AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date`,
        ).bind(account.id, type, `${year}-01-01`, `${year}-12-31`)
      : env.DB.prepare(
          `SELECT id, type, entry_date, encrypted_payload, updated_at FROM inventories
           WHERE user_id = ? AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date`,
        ).bind(account.id, `${year}-01-01`, `${year}-12-31`);
    const result = await query.all<InventoryRow>();
    const inventories = await Promise.all((result.results ?? []).map(async (row) => ({
      id: row.id,
      type: row.type,
      date: row.entry_date,
      payload: await decryptJson<unknown>(row.encrypted_payload),
      updatedAt: row.updated_at,
    })));
    return Response.json({ inventories }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    const paid = hasActiveMembership(account);
    const body = await request.json() as { type?: unknown; date?: unknown; payload?: unknown };
    if (!validType(body.type) || !isIsoCalendarDate(body.date)) {
      return Response.json({ error: "Inventory type or date is invalid." }, { status: 400 });
    }
    if (!paid && (body.type !== "step10" || !freeAccountWindow(account.createdAt).active)) {
      return Response.json({ error: "Your free week is over or this tool requires membership. You can still read and export your saved Step 10 entries. Subscribe to save more.", code: "subscription_required" }, { status: 403 });
    }
    const latestLocalDay = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    if (!paid && body.date > latestLocalDay) return Response.json({ error: "Choose today or an earlier date." }, { status: 400 });
    const serialized = JSON.stringify(body.payload);
    if (!body.payload || serialized.length > 200_000) {
      return Response.json({ error: "Inventory content is empty or too large." }, { status: 400 });
    }
    const encrypted = await encryptJson(body.payload);
    const now = Math.floor(Date.now() / 1000);
    const id = crypto.randomUUID();
    if (!paid) {
      const result = await env.DB.prepare(FREE_STEP10_INSERT).bind(id, account.id, body.date, encrypted, now, now, account.id, account.id, body.date).run();
      if (Number(result.meta?.changes ?? 0) === 0) return Response.json({ error: `Your free account includes ${FREE_STEP10_ENTRIES} daily Step 10 entries. You can edit those dates during your free week or subscribe to add more.`, code: "free_entry_limit" }, { status: 403 });
      return Response.json({ ok: true, date: body.date, type: body.type });
    }
    await env.DB.prepare(
      `INSERT INTO inventories
       (id, user_id, type, entry_date, encrypted_payload, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, type, entry_date) DO UPDATE SET
       encrypted_payload = excluded.encrypted_payload, updated_at = excluded.updated_at`,
    ).bind(id, account.id, body.type, body.date, encrypted, now, now).run();
    return Response.json({ ok: true, date: body.date, type: body.type });
  } catch (error) {
    return jsonError(error);
  }
}
