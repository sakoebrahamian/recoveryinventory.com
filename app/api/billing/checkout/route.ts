import { hasActiveMembership, jsonError, requireAccount } from "@/lib/auth";
import { appOrigin, stripePriceId, stripeRequest } from "@/lib/stripe";

type CheckoutSession = { url: string | null };

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    if (hasActiveMembership(account)) {
      return Response.json({ error: "This account already has an active membership." }, { status: 409 });
    }
    const origin = appOrigin(request);
    const values: Record<string, string> = {
      mode: "subscription",
      allow_promotion_codes: "true",
      "line_items[0][price]": stripePriceId(),
      "line_items[0][quantity]": "1",
      client_reference_id: account.id,
      "metadata[user_id]": account.id,
      "subscription_data[metadata][user_id]": account.id,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancelled`,
    };
    if (account.stripeCustomerId) values.customer = account.stripeCustomerId;
    const session = await stripeRequest<CheckoutSession>("/checkout/sessions", values);
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return Response.json({ url: session.url });
  } catch (error) {
    return jsonError(error);
  }
}
