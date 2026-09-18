import { env } from "cloudflare:workers";
import { getAccount, jsonError } from "@/lib/auth";
import {
  createEmailCode,
  hashEmailCode,
  isValidEmail,
  maskEmail,
  normalizeEmail,
  sendEmailCode,
  type EmailPurpose,
} from "@/lib/email-auth";

const CHALLENGE_SECONDS = 10 * 60;
const MAX_CODES_PER_HOUR = 5;

function cleanAlias(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f]/g, "") : "";
}

function validPurpose(value: unknown): value is EmailPurpose {
  return value === "signup" || value === "login" || value === "add_email";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      email?: unknown;
      alias?: unknown;
      language?: unknown;
      purpose?: unknown;
    };
    const email = normalizeEmail(body.email);
    const alias = cleanAlias(body.alias);
    const language = body.language === "fa" || body.language === "es" ? body.language : "en";
    if (!validPurpose(body.purpose)) {
      return Response.json({ error: "Choose a valid account action." }, { status: 400 });
    }
    const purpose = body.purpose;
    if (!isValidEmail(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (purpose === "signup" && (alias.length < 2 || alias.length > 40)) {
      return Response.json({ error: "Enter a name or display name between 2 and 40 characters." }, { status: 400 });
    }

    const currentAccount = purpose === "add_email" ? await getAccount(request) : null;
    if (purpose === "add_email" && !currentAccount) {
      return Response.json({ error: "Please sign in before adding an email." }, { status: 401 });
    }

    const existing = await env.DB.prepare(
      "SELECT user_id FROM email_accounts WHERE email = ? LIMIT 1",
    ).bind(email).first<{ user_id: string }>();
    if (purpose === "signup" && existing) {
      return Response.json({ error: "An account with this email already exists. Log in instead." }, { status: 409 });
    }
    if (purpose === "add_email" && existing) {
      const error = existing.user_id === currentAccount?.id
        ? "This email is already connected to your account."
        : "This email is already connected to another account.";
      return Response.json({ error }, { status: 409 });
    }

    const now = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      "DELETE FROM email_challenges WHERE expires_at < ? OR (consumed_at IS NOT NULL AND created_at < ?)",
    ).bind(now - 86400, now - 86400).run();
    const recent = await env.DB.prepare(
      `SELECT COUNT(*) AS count, MAX(created_at) AS latest
       FROM email_challenges WHERE email = ? AND created_at > ?`,
    ).bind(email, now - 3600).first<{ count: number; latest: number | null }>();
    if ((recent?.count ?? 0) >= MAX_CODES_PER_HOUR) {
      return Response.json({ error: "Too many codes were requested. Please wait and try again." }, { status: 429 });
    }
    if (recent?.latest && now - recent.latest < 60) {
      return Response.json({ error: "Please wait one minute before requesting another code." }, { status: 429 });
    }

    const challengeId = crypto.randomUUID();
    const code = createEmailCode();
    const codeHash = await hashEmailCode(challengeId, code);
    const userId = purpose === "add_email" ? currentAccount?.id ?? null : existing?.user_id ?? null;
    await env.DB.prepare(
      `INSERT INTO email_challenges
       (id, email, code_hash, purpose, user_id, alias, preferred_language,
        attempts, expires_at, consumed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, NULL, ?)`,
    ).bind(
      challengeId,
      email,
      codeHash,
      purpose,
      userId,
      purpose === "signup" ? alias : null,
      language,
      now + CHALLENGE_SECONDS,
      now,
    ).run();

    try {
      await sendEmailCode(email, code, language, purpose);
    } catch (error) {
      await env.DB.prepare("DELETE FROM email_challenges WHERE id = ?").bind(challengeId).run();
      console.error("Email code delivery failed", error instanceof Error ? error.message : "Unknown error");
      return Response.json({ error: "The email could not be sent. Please try again." }, { status: 503 });
    }

    return Response.json({
      challengeId,
      maskedEmail: maskEmail(email),
      expiresIn: CHALLENGE_SECONDS,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}
