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
  payment_status?: string;
};
type StripeInvoice = {
  id: string;
  subscription?: StripeReference;
  parent?: { type: string; subscription_details?: { subscription?: StripeReference } };
};
type StripeRiskObject = {
  id: string;
  charge?: StripeReference;
  payment_intent?: StripeReference;
  invoice?: StripeReference;
};
type StripeEvent = {
  id: string;
  type: string;
  data: { object: CheckoutSession | StripeSubscription | StripeInvoice | StripeRiskObject };
};

function referenceId(value: StripeReference | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function periodEnd(subscription: StripeSubscription): number | null {
  return subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end ?? null;
}

function invoiceSubscriptionId(invoice: StripeInvoice): string | null {
  return referenceId(invoice.parent?.type === "subscription_details"
    ? invoice.parent.subscription_details?.subscription : invoice.subscription);
}

async function refreshSubscription(id: string, fallbackUserId?: string | null) {
  const subscription = await stripeRequest<StripeSubscription>(`/subscriptions/${encodeURIComponent(id)}`);
  await applySubscription(subscription, fallbackUserId);
}

// Risk notifications are reconciled and recorded for owner review. They do not
// cancel a customer's subscription or issue a refund automatically.
async function reconcileRiskEvent(event: StripeEvent) {
  const object = event.data.object as StripeRiskObject;
  let paymentIntentId = referenceId(object.payment_intent);
  let legacyInvoiceId = referenceId(object.invoice);
  if (!paymentIntentId && referenceId(object.charge)) {
    const charge = await stripeRequest<StripeRiskObject>(`/charges/${encodeURIComponent(referenceId(object.charge)!)}`);
    paymentIntentId = referenceId(charge.payment_intent);
    legacyInvoiceId = referenceId(charge.invoice);
  }
  const invoiceIds = new Set<string>(legacyInvoiceId ? [legacyInvoiceId] : []);
  if (paymentIntentId) {
    let startingAfter: string | undefined;
    for (;;) {
      const query = new URLSearchParams({
        "payment[type]": "payment_intent", "payment[payment_intent]": paymentIntentId, status: "paid", limit: "100",
      });
      if (startingAfter) query.set("starting_after", startingAfter);
      const page = await stripeRequest<{ data: Array<{ id: string; invoice: StripeReference }>; has_more: boolean }>(`/invoice_payments?${query}`);
      for (const payment of page.data) {
        const invoiceId = referenceId(payment.invoice);
        if (invoiceId) invoiceIds.add(invoiceId);
      }
      if (!page.has_more || !page.data.length) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
  }
  const subscriptionIds = new Set<string>();
  for (const id of invoiceIds) {
    const invoice = await stripeRequest<StripeInvoice>(`/invoices/${encodeURIComponent(id)}`);
    const subscriptionId = invoiceSubscriptionId(invoice);
    if (subscriptionId) subscriptionIds.add(subscriptionId);
  }
  for (const id of subscriptionIds) await refreshSubscription(id);
  console.warn("Subscription billing event requires review", { eventId: event.id, type: event.type, subscriptionIds: [...subscriptionIds] });
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

    if (["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      const session = event.data.object as CheckoutSession;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return Response.json({ received: true, awaitingPayment: true });
      }
      const subscriptionId = referenceId(session.subscription);
      const userId = session.client_reference_id || session.metadata?.user_id || null;
      const customerId = referenceId(session.customer);
      if (userId && customerId) {
        await env.DB.prepare("UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
          .bind(customerId, Math.floor(Date.now() / 1000), userId).run();
      }
      if (subscriptionId) {
        await refreshSubscription(subscriptionId, userId);
      }
    }

    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      await refreshSubscription((event.data.object as StripeSubscription).id);
    }
    if (["invoice.paid", "invoice.payment_failed"].includes(event.type)) {
      const subscriptionId = invoiceSubscriptionId(event.data.object as StripeInvoice);
      if (subscriptionId) await refreshSubscription(subscriptionId);
    }
    if (["charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created"].includes(event.type)) {
      await reconcileRiskEvent(event);
    }
    await env.DB.prepare(
      "INSERT OR IGNORE INTO billing_events (id, event_type, created_at) VALUES (?, ?, ?)",
    ).bind(event.id, event.type, Math.floor(Date.now() / 1000)).run();
    return Response.json({ received: true });
  } catch (error) {
    return jsonError(error);
  }
}
