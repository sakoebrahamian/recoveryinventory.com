import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { todayIso } from "@/lib/inventory";
import { decryptJson } from "@/lib/server-crypto";
import { calculateStep10Analytics, type Step10AnalyticsRecord } from "@/lib/step10-analytics";

type AnalyticsInventoryRow = {
  entry_date: string;
  encrypted_payload: string;
};

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) {
      return Response.json({ error: "An active membership is required to view analytics." }, { status: 403 });
    }

    const through = todayIso();
    const result = await env.DB.prepare(
      `SELECT entry_date, encrypted_payload FROM inventories
       WHERE user_id = ? AND type = 'step10' AND entry_date <= ? ORDER BY entry_date`,
    ).bind(account.id, through).all<AnalyticsInventoryRow>();

    const records: Step10AnalyticsRecord[] = [];
    for (const row of result.results ?? []) {
      try {
        records.push({
          date: row.entry_date,
          payload: await decryptJson<unknown>(row.encrypted_payload),
        });
      } catch {
        // A damaged entry should not prevent the rest of a member's history from being summarized.
      }
    }

    return Response.json(
      { analytics: calculateStep10Analytics(records, through) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return jsonError(error);
  }
}
