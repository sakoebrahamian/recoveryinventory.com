import { env } from "cloudflare:workers";
import { randomToken, sha256 } from "./server-crypto";

export const SESSION_COOKIE = "ri_session";
const SESSION_SECONDS = 60 * 60 * 24 * 365;

export type Account = {
  id: string;
  alias: string;
  stripeCustomerId: string | null;
  subscriptionStatus: string;
  currentPeriodEnd: number | null;
  preferredLanguage: string;
};

type UserRow = {
  id: string;
  alias: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  current_period_end: number | null;
  preferred_language: string;
};

function cookieValue(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function createSession(userId: string): Promise<{ token: string; cookie: string }> {
  const token = randomToken();
  const id = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_SECONDS;
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).bind(id, userId, expiresAt, now).run();
  return {
    token,
    cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_SECONDS}`,
  };
}

export function expiredSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function sessionHash(request: Request): Promise<string | null> {
  const token = cookieValue(request, SESSION_COOKIE);
  return token ? sha256(token) : null;
}

export async function getAccount(request: Request): Promise<Account | null> {
  const id = await sessionHash(request);
  if (!id) return null;
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `SELECT u.id, u.alias, u.stripe_customer_id, u.subscription_status,
      u.current_period_end, u.preferred_language
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ? LIMIT 1`,
  ).bind(id, now).first<UserRow>();
  if (!row) return null;
  return {
    id: row.id,
    alias: row.alias,
    stripeCustomerId: row.stripe_customer_id,
    subscriptionStatus: row.subscription_status,
    currentPeriodEnd: row.current_period_end,
    preferredLanguage: row.preferred_language,
  };
}

export async function requireAccount(request: Request): Promise<Account> {
  const account = await getAccount(request);
  if (!account) throw new Response(JSON.stringify({ error: "Please sign in with your recovery code." }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
  return account;
}

export function hasActiveMembership(account: Account): boolean {
  return account.subscriptionStatus === "active" || account.subscriptionStatus === "trialing";
}

export function jsonError(error: unknown): Response {
  if (error instanceof Response) return error;
  console.error("Request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
