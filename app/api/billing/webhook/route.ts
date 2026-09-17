import { env } from "cloudflare:workers";
import { jsonError } from "@/lib/auth";
import { stripeRequest, verifyStripeSignature } from "@/lib/stripe";

type StripeReference = string | { id: string } | null;
type StripeSubscription = {
  id: string;
  customer: StripeReference;
  status: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  metadata?: { user_id?: string };
  items?: { data?: Array<{ current_period_end?: number }> };
};
type CheckoutSession = {
  id: string;
  client_reference_id?: string | null;
  customer?: StripeReference;
  subscription?: StripeReference;
  metadata?: { user_id?: string };
};
type StripeEvent = {
  id: string;
  type: string;
  data: { object: CheckoutSession | StripeSubscription };
};

function referenceId(value: StripeReference | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function periodEnd(subscription: StripeSubscription): number | null {
  return subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end ?? null;
}

async function applySubscription(subscription: StripeSubscription, fallbackUserId?: string | null) {
  const customerId = referenceId(subscription.customer);
  const userId = subscription.metadata?.user_id || fallbackUserId || null;
  const now = Math.floor(Date.now() / 1000);
  if (userId) {
    await env.DB.prepare(
      `UPDATE users SET stripe_customer_id = COALESCE(?, stripe_customer_id),
       stripe_subscription_id = ?, subscription_status = ?, current_period_end = ?, updated_at = ?
       WHERE id = ?`,
    ).bind(customerId, subscription.id, subscription.status, periodEnd(subscription), now, userId).run();
  } else if (customerId) {
    await env.DB.prepare(
      `UPDATE users SET stripe_subscription_id = ?, subscription_status = ?,
       current_period_end = ?, updated_at = ? WHERE stripe_customer_id = ?`,
    ).bind(subscription.id, subscription.status, periodEnd(subscription), now, customerId).run();
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const valid = await verifyStripeSignature(rawBody, request.headers.get("stripe-signature"));
    if (!valid) return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
    const event = JSON.parse(rawBody) as StripeEvent;
    const alreadyProcessed = await env.DB.prepare("SELECT id FROM billing_events WHERE id = ? LIMIT 1")
      .bind(event.id).first<{ id: string }>();
    if (alreadyProcessed) return Response.json({ received: true, duplicate: true });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as CheckoutSession;
      const subscriptionId = referenceId(session.subscription);
      const userId = session.client_reference_id || session.metadata?.user_id || null;
      const customerId = referenceId(session.customer);
      if (userId && customerId) {
        await env.DB.prepare("UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
          .bind(customerId, Math.floor(Date.now() / 1000), userId).run();
      }
      if (subscriptionId) {
        const subscription = await stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
        await applySubscription(subscription, userId);
      }
    }

    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      await applySubscription(event.data.object as StripeSubscription);
    }
    await env.DB.prepare(
      "INSERT OR IGNORE INTO billing_events (id, event_type, created_at) VALUES (?, ?, ?)",
    ).bind(event.id, event.type, Math.floor(Date.now() / 1000)).run();
    return Response.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
