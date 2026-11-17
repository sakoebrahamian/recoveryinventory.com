import { env } from "cloudflare:workers";
import { signatureBytes, utf8 } from "./server-crypto";
import { subscriptionPricing, type BillingPlan } from "./subscription-plans";

const STRIPE_API = "https://api.stripe.com/v1";

function secret(name: "STRIPE_SECRET_KEY" | "STRIPE_PRICE_ID" | "STRIPE_WEBHOOK_SECRET"): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function stripeRequest<T>(
  path: string,
  values?: Record<string, string>,
  options?: { idempotencyKey?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret("STRIPE_SECRET_KEY")}`,
  };
  if (values) headers["content-type"] = "application/x-www-form-urlencoded";
  if (options?.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: values ? "POST" : "GET",
    headers,
    body: values ? new URLSearchParams(values) : undefined,
  });
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message ?? "Stripe request failed.");
  return body;
}

type StripePrice = {
  id: string;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  product: string | { id: string };
  recurring: { interval: string; interval_count: number; usage_type: string } | null;
};

function validatePrice(price: StripePrice, plan: BillingPlan): void {
  const interval = plan === "monthly" ? "month" : "year";
  if (!price.active || price.currency !== "usd" || price.unit_amount !== subscriptionPricing[plan]
    || price.recurring?.interval !== interval || price.recurring.interval_count !== 1
    || price.recurring.usage_type !== "licensed") {
    throw new Error(`The ${plan} subscription price is not configured correctly.`);
  }
}

export async function stripePriceId(plan: BillingPlan = "yearly"): Promise<string> {
  const yearly = await stripeRequest<StripePrice>(`/prices/${encodeURIComponent(secret("STRIPE_PRICE_ID"))}`);
  validatePrice(yearly, "yearly");
  if (plan === "yearly") return yearly.id;

  const configured = env.STRIPE_MONTHLY_PRICE_ID?.trim();
  const monthly = configured
    ? await stripeRequest<StripePrice>(`/prices/${encodeURIComponent(configured)}`)
    : (await stripeRequest<{ data: StripePrice[] }>(`/prices?${new URLSearchParams({
      "lookup_keys[]": subscriptionPricing.monthlyLookupKey, active: "true", limit: "1",
    })}`)).data[0];
  if (!monthly) throw new Error("The monthly subscription price is not configured.");
  validatePrice(monthly, "monthly");
  const productId = (price: StripePrice) => typeof price.product === "string" ? price.product : price.product.id;
  if (productId(monthly) !== productId(yearly)) {
    throw new Error("The monthly and yearly prices must belong to the same website subscription.");
  }
  return monthly.id;
}

export function appOrigin(request: Request): string {
  const configured = env.APP_ORIGIN?.trim().replace(/\/$/, "");
  return configured || new URL(request.url).origin;
}

export async function verifyStripeSignature(rawBody: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  const pieces = header.split(",").map((piece) => piece.trim().split("="));
  const timestamp = pieces.find(([key]) => key === "t")?.[1];
  const signatures = pieces.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !signatures.length) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    utf8(secret("STRIPE_WEBHOOK_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signed = utf8(`${timestamp}.${rawBody}`);
  for (const signature of signatures) {
    if (!/^[a-f0-9]{64}$/i.test(signature)) continue;
    if (await crypto.subtle.verify("HMAC", key, signatureBytes(signature), signed)) return true;
  }
  return false;
}
