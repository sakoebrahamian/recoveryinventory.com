import { env } from "cloudflare:workers";
import { getAccount, hasActiveMembership } from "@/lib/auth";
import {
  generateInventoryGuideReply,
  InventoryGuideProviderError,
  readInventoryGuideRequest,
  reserveInventoryGuideRequest,
} from "@/lib/inventory-guide-server";

const headers = { "cache-control": "no-store" };

function guideError(error: string, status: number, reference?: string) {
  return Response.json({ error, ...(reference ? { reference } : {}) }, { status, headers });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const sameOrigin = origin === new URL(request.url).origin
    || ((origin === null || origin === "null") && request.headers.get("sec-fetch-site") === "same-origin");
  if (!sameOrigin) return guideError("invalid_request", 403);

  let stage = "AI-SESSION";
  try {
    const account = await getAccount(request);
    if (!account) return guideError("sign_in", 401);
    if (!hasActiveMembership(account)) return guideError("membership_required", 403);

    const apiKey = env.OPENAI_API_KEY?.trim();
    if (!apiKey) return guideError("unavailable", 503, "AI-KEY");

    const input = await readInventoryGuideRequest(request);
    if (!input) return guideError("invalid_request", 400);
    stage = "AI-USAGE";
    if (!await reserveInventoryGuideRequest(env.DB, account.id)) return guideError("limit_reached", 429);

    stage = "AI-CONNECT";
    const reply = await generateInventoryGuideReply(input, apiKey);
    return Response.json({ reply }, { headers });
  } catch (error) {
    // Journal text, provider error bodies and credentials must stay out of Worker logs.
    const failure = error instanceof InventoryGuideProviderError ? error : null;
    const reference = failure?.reference ?? stage;
    console.warn("Inventory guide request failed", { reference, status: failure?.status, requestId: failure?.requestId });
    return guideError("unavailable", 503, reference);
  }
}
