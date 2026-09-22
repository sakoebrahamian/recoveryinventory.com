import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { todayIso } from "@/lib/inventory";
import { decryptJson } from "@/lib/server-crypto";
import { calculateStep10Analytics, type Step10AnalyticsRecord } from "@/lib/step10-analytics";

type AnalyticsInventoryRow = {
  entry_date: string;
  encrypted_payload: string;
};

function isIsoCalendarDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export async function GET(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!hasActiveMembership(account)) {
      return Response.json({ error: "An active membership is required to view analytics." }, { status: 403 });
    }

    const requestedThrough = new URL(request.url).searchParams.get("through");
    const through = isIsoCalendarDate(requestedThrough) ? requestedThrough : todayIso();
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
