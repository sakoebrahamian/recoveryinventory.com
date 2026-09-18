import { env } from "cloudflare:workers";
import { hasActiveMembership, jsonError, requireAccount, type Account } from "@/lib/auth";
import { appOrigin, stripePriceId, stripeRequest } from "@/lib/stripe";

type CheckoutSession = { url: string | null };
type StripeReference = string | { id: string } | null;
type PromotionCode = {
  id: string;
  active: boolean;
  code: string;
  customer?: StripeReference;
  promotion?: { type: string; coupon?: string };
  coupon?: string | StripeCoupon;
};
type StripeCoupon = {
  id: string;
  duration: string;
  percent_off: number | null;
  valid: boolean;
};
type StripeList<T> = { data: T[] };
type StripeCustomer = { id: string };
type StripeSubscription = {
  id: string;
  customer: StripeReference;
  status: string;
  current_period_end?: number;
  items?: { data?: Array<{ current_period_end?: number }> };
};

function referenceId(value: StripeReference | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function subscriptionPeriodEnd(subscription: StripeSubscription): number | null {
  return subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end ?? null;
}

async function promotionDetails(code: string): Promise<{ promotion: PromotionCode; coupon: StripeCoupon }> {
  const query = new URLSearchParams({ active: "true", code, limit: "10" });
  const list = await stripeRequest<StripeList<PromotionCode>>(`/promotion_codes?${query.toString()}`);
  const promotion = list.data.find((item) => item.code.toLowerCase() === code.toLowerCase());
  if (!promotion) {
    throw Response.json({ error: "That promotion code is not active or could not be found." }, { status: 400 });
  }

  const inlineCoupon = typeof promotion.coupon === "object" ? promotion.coupon : null;
  const couponId = promotion.promotion?.coupon
    ?? (typeof promotion.coupon === "string" ? promotion.coupon : inlineCoupon?.id);
  if (!couponId) {
    throw Response.json({ error: "That promotion code cannot be used for this membership." }, { status: 400 });
  }
  const coupon = inlineCoupon ?? await stripeRequest<StripeCoupon>(`/coupons/${encodeURIComponent(couponId)}`);
  if (!coupon.valid) {
    throw Response.json({ error: "That promotion code is no longer valid." }, { status: 400 });
  }
  return { promotion, coupon };
}

async function customerForAccount(account: Account): Promise<string> {
  if (account.stripeCustomerId) return account.stripeCustomerId;
  const values: Record<string, string> = {
    "metadata[user_id]": account.id,
    description: `Recovery Inventory member ${account.id}`,
  };
  if (account.email) values.email = account.email;
  const customer = await stripeRequest<StripeCustomer>("/customers", values, {
    idempotencyKey: `ri-customer-${account.id}`,
  });
  await env.DB.prepare("UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?")
    .bind(customer.id, Math.floor(Date.now() / 1000), account.id).run();
  return customer.id;
}

async function activateFreePromotion(account: Account, promotion: PromotionCode): Promise<Response> {
  const restrictedCustomer = referenceId(promotion.customer);
  if (restrictedCustomer && restrictedCustomer !== account.stripeCustomerId) {
    throw Response.json({ error: "That promotion code is not available for this account." }, { status: 400 });
  }

  const customerId = await customerForAccount(account);
  let subscription: StripeSubscription;
  try {
    subscription = await stripeRequest<StripeSubscription>("/subscriptions", {
      customer: customerId,
      "items[0][price]": stripePriceId(),
      "discounts[0][promotion_code]": promotion.id,
      payment_behavior: "error_if_incomplete",
      "metadata[user_id]": account.id,
    }, {
      idempotencyKey: `ri-free-${account.id}-${promotion.id}-${account.subscriptionStatus}-${account.currentPeriodEnd ?? 0}`,
    });
  } catch (error) {
    console.error("Free promotion activation failed", error instanceof Error ? error.message : "Unknown error");
    throw Response.json({ error: "That promotion code could not be applied to this membership." }, { status: 400 });
  }

  if (subscription.status !== "active" && subscription.status !== "trialing") {
    throw Response.json({ error: "That promotion code did not fully cover this membership." }, { status: 400 });
  }
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `UPDATE users SET stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = ?,
     current_period_end = ?, updated_at = ? WHERE id = ?`,
  ).bind(customerId, subscription.id, subscription.status, subscriptionPeriodEnd(subscription), now, account.id).run();
  return Response.json({ activated: true });
}

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    if (hasActiveMembership(account)) {
      return Response.json({ error: "This account already has an active membership." }, { status: 409 });
    }
    const body = await request.json().catch(() => ({})) as { promotionCode?: unknown };
    const promotionCode = typeof body.promotionCode === "string" ? body.promotionCode.trim() : "";
    if (promotionCode.length > 100) {
      return Response.json({ error: "That promotion code is too long." }, { status: 400 });
    }
    const discount = promotionCode ? await promotionDetails(promotionCode) : null;
    if (discount?.coupon.percent_off === 100 && discount.coupon.duration === "forever") {
      return await activateFreePromotion(account, discount.promotion);
    }

    const origin = appOrigin(request);
    const values: Record<string, string> = {
      mode: "subscription",
      payment_method_collection: "if_required",
      "line_items[0][price]": stripePriceId(),
      "line_items[0][quantity]": "1",
      client_reference_id: account.id,
      "metadata[user_id]": account.id,
      "subscription_data[metadata][user_id]": account.id,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancelled`,
    };
    if (discount) values["discounts[0][promotion_code]"] = discount.promotion.id;
    else values.allow_promotion_codes = "true";
    if (account.stripeCustomerId) values.customer = account.stripeCustomerId;
    else if (account.email) values.customer_email = account.email;
    const session = await stripeRequest<CheckoutSession>("/checkout/sessions", values);
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return Response.json({ url: session.url });
  } catch (error) {
    return jsonError(error);
  }
}
