import { env } from "cloudflare:workers";
import { getAccount, hasActiveMembership, isAnalyticsOwner, jsonError } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const account = await getAccount(request);
    if (!account) return Response.json({ error: "Not signed in." }, { status: 401 });
    return Response.json({
      alias: account.alias,
      email: account.email,
      hasEmailLogin: Boolean(account.email && account.emailVerifiedAt),
      username: account.username,
      hasPasswordLogin: Boolean(account.username),
      subscriptionStatus: account.subscriptionStatus,
      currentPeriodEnd: account.currentPeriodEnd,
      membershipActive: hasActiveMembership(account),
      inventoryGuideAvailable: hasActiveMembership(account) && Boolean(env.OPENAI_API_KEY?.trim()),
      hasBillingProfile: Boolean(account.stripeCustomerId),
      analyticsOwner: isAnalyticsOwner(account),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
