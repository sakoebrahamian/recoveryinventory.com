import { env } from "cloudflare:workers";
import { signatureBytes, utf8 } from "./server-crypto";

const STRIPE_API = "https://api.stripe.com/v1";

function secret(name: "STRIPE_SECRET_KEY" | "STRIPE_PRICE_ID" | "STRIPE_WEBHOOK_SECRET"): string {
  const value = env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export async function stripeRequest<T>(path: string, values?: Record<string, string>): Promise<T> {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: values ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${secret("STRIPE_SECRET_KEY")}`,
      ...(values ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: values ? new URLSearchParams(values) : undefined,
  });
  const body = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(body.error?.message ?? "Stripe request failed.");
  return body;
}

export function stripePriceId(): string {
  return secret("STRIPE_PRICE_ID");
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
