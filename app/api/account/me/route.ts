import { getAccount, hasActiveMembership, jsonError } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const account = await getAccount(request);
    if (!account) return Response.json({ error: "Not signed in." }, { status: 401 });
    return Response.json({
      alias: account.alias,
      email: account.email,
      hasEmailLogin: Boolean(account.email && account.emailVerifiedAt),
      subscriptionStatus: account.subscriptionStatus,
      currentPeriodEnd: account.currentPeriodEnd,
      membershipActive: hasActiveMembership(account),
      hasBillingProfile: Boolean(account.stripeCustomerId),
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
