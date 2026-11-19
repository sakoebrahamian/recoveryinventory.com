import { env } from "cloudflare:workers";
import { getAccount, hasActiveMembership, isAnalyticsOwner, jsonError } from "@/lib/auth";
import { freeAccountWindow, FREE_STEP10_ENTRIES } from "@/lib/free-account";

export async function GET(request: Request) {
  try {
    const account = await getAccount(request);
    if (!account) return Response.json({ error: "Not signed in." }, { status: 401 });
    const freeWeek = freeAccountWindow(account.createdAt);
    const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM inventories WHERE user_id = ? AND type = 'step10'").bind(account.id).first<{ count: number }>();
    return Response.json({
      alias: account.alias,
      email: account.email,
      hasEmailLogin: Boolean(account.email && account.emailVerifiedAt),
      username: account.username,
      hasPasswordLogin: Boolean(account.username),
      subscriptionStatus: account.subscriptionStatus,
      currentPeriodEnd: account.currentPeriodEnd,
      membershipActive: hasActiveMembership(account),
      step10CanSave: hasActiveMembership(account) || freeWeek.active,
      freeWeekActive: !hasActiveMembership(account) && freeWeek.active,
      freeWeekEndsAt: freeWeek.endsAt,
      freeEntriesLimit: FREE_STEP10_ENTRIES,
      freeEntriesUsed: Math.min(FREE_STEP10_ENTRIES, Number(count?.count ?? 0)),
      inventoryGuideAvailable: hasActiveMembership(account) && Boolean(env.OPENAI_API_KEY?.trim()),
      hasBillingProfile: Boolean(account.stripeCustomerId),
      analyticsOwner: isAnalyticsOwner(account),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
