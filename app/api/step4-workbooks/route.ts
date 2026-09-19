import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { decryptJson, encryptJson } from "@/lib/server-crypto";

type Step4WorkbookRow = {
  id: string;
  encrypted_payload: string;
  created_at: number;
  updated_at: number;
};

function validPayload(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) {
      return Response.json({ error: "An active membership is required to access Step 4 inventories." }, { status: 403 });
    }

    const result = await env.DB.prepare(
      `SELECT id, encrypted_payload, created_at, updated_at
       FROM step4_workbooks WHERE user_id = ? ORDER BY updated_at DESC`,
    ).bind(account.id).all<Step4WorkbookRow>();

    const workbooks = await Promise.all((result.results ?? []).map(async (row) => ({
      id: row.id,
      payload: await decryptJson<Record<string, unknown>>(row.encrypted_payload),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));

    return Response.json({ workbooks }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) {
      return Response.json({ error: "An active membership is required to save Step 4 inventories." }, { status: 403 });
    }

    const body = await request.json() as { id?: unknown; payload?: unknown };
    if ((body.id !== undefined && typeof body.id !== "string") || !validPayload(body.payload)) {
      return Response.json({ error: "Step 4 inventory data is invalid." }, { status: 400 });
    }

    const serialized = JSON.stringify(body.payload);
    if (serialized.length > 300_000) {
      return Response.json({ error: "This Step 4 inventory is too large to save." }, { status: 400 });
    }

    const encrypted = await encryptJson(body.payload);
    const now = Math.floor(Date.now() / 1000);
    const id = typeof body.id === "string" && body.id ? body.id : crypto.randomUUID();

    if (body.id) {
      const result = await env.DB.prepare(
        `UPDATE step4_workbooks SET encrypted_payload = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
      ).bind(encrypted, now, id, account.id).run();
      if (!result.meta.changes) {
        return Response.json({ error: "Step 4 inventory was not found." }, { status: 404 });
      }
    } else {
      await env.DB.prepare(
        `INSERT INTO step4_workbooks
         (id, user_id, encrypted_payload, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
      ).bind(id, account.id, encrypted, now, now).run();
    }

    return Response.json({ id, createdAt: now, updatedAt: now });
  } catch (error) {
    return jsonError(error);
  }
}
