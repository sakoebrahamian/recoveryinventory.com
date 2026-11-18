import { env } from "cloudflare:workers";
import { getAccount, hasActiveMembership } from "@/lib/auth";
import {
  generateInventoryGuideReply,
  readInventoryGuideRequest,
  reserveInventoryGuideRequest,
} from "@/lib/inventory-guide-server";

const headers = { "cache-control": "no-store" };

function guideError(error: string, status: number) {
  return Response.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return guideError("invalid_request", 403);

  try {
    const account = await getAccount(request);
    if (!account) return guideError("sign_in", 401);
    if (!hasActiveMembership(account)) return guideError("membership_required", 403);

    const apiKey = env.OPENAI_API_KEY?.trim();
    if (!apiKey) return guideError("unavailable", 503);

    const input = await readInventoryGuideRequest(request);
    if (!input) return guideError("invalid_request", 400);
    if (!await reserveInventoryGuideRequest(env.DB, account.id)) return guideError("limit_reached", 429);

    const reply = await generateInventoryGuideReply(input, apiKey);
    return Response.json({ reply }, { headers });
  } catch {
    // Journal text, provider error bodies and credentials must stay out of Worker logs.
    return guideError("unavailable", 503);
  }
}
