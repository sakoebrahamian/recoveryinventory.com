import { env } from "cloudflare:workers";
import { sha256 } from "./server-crypto";

export type EmailPurpose = "signup" | "login" | "add_email";

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string): boolean {
  return email.length >= 5
    && email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(3, Math.min(8, local.length - visible.length)))}@${domain}`;
}

export function createEmailCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => String(byte % 10)).join("");
}

export async function hashEmailCode(challengeId: string, code: string): Promise<string> {
  const secret = env.DATA_ENCRYPTION_KEY;
  if (!secret) throw new Error("DATA_ENCRYPTION_KEY is not configured.");
  return sha256(`recovery-inventory-email-code-v1:${secret}:${challengeId}:${code}`);
}

function emailCopy(language: string, code: string, purpose: EmailPurpose) {
  const isFarsi = language === "fa";
  const isSpanish = language === "es";
  const action = purpose === "signup"
    ? (isFarsi ? "تأیید و ایجاد حساب" : isSpanish ? "verificar y crear tu cuenta" : "verify and create your account")
    : purpose === "add_email"
      ? (isFarsi ? "افزودن ایمیل به حساب" : isSpanish ? "añadir acceso por correo electrónico a tu cuenta" : "add email access to your account")
      : (isFarsi ? "ورود به حساب" : isSpanish ? "iniciar sesión en tu cuenta" : "sign in to your account");
  const subject = isFarsi
    ? "کد تأیید Recovery Inventory"
    : isSpanish
      ? "Tu código de verificación de Recovery Inventory"
      : "Your Recovery Inventory verification code";
  const heading = isFarsi ? "کد تأیید شما" : isSpanish ? "Tu código de verificación" : "Your verification code";
  const instruction = isFarsi
    ? `برای ${action} این کد را وارد کنید.`
    : isSpanish
      ? `Introduce este código para ${action}.`
      : `Enter this code to ${action}.`;
  const expiry = isFarsi
    ? "این کد تا ۱۰ دقیقه معتبر است و فقط یک بار قابل استفاده است."
    : isSpanish
      ? "Este código vence en 10 minutos y solo puede usarse una vez."
      : "This code expires in 10 minutes and can be used only once.";
  const warning = isFarsi
    ? "اگر شما این درخواست را نداده‌اید، می‌توانید این پیام را نادیده بگیرید."
    : isSpanish
      ? "Si no solicitaste este código, puedes ignorar este correo con tranquilidad."
      : "If you did not request this code, you can safely ignore this email.";

  return {
    subject,
    text: `${heading}\n\n${instruction}\n\n${code}\n\n${expiry}\n\n${warning}`,
    html: `<!doctype html><html lang="${isFarsi ? "fa" : isSpanish ? "es" : "en"}" dir="${isFarsi ? "rtl" : "ltr"}"><body style="margin:0;background:#f6f3ec;color:#173f39;font-family:Arial,sans-serif"><div style="max-width:560px;margin:0 auto;padding:40px 20px"><div style="background:#ffffff;border:1px solid #d9e1db;border-radius:20px;padding:32px"><p style="margin:0 0 8px;color:#cc654c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Recovery Inventory</p><h1 style="margin:0 0 18px;font-size:27px">${heading}</h1><p style="margin:0 0 22px;line-height:1.6;color:#526b67">${instruction}</p><div style="margin:0 0 22px;padding:18px;text-align:center;background:#edf5ef;border-radius:14px;font-size:34px;font-weight:700;letter-spacing:8px;color:#173f39" dir="ltr">${code}</div><p style="margin:0 0 12px;line-height:1.6;color:#526b67">${expiry}</p><p style="margin:0;line-height:1.6;color:#71837f;font-size:13px">${warning}</p></div></div></body></html>`,
  };
}

export async function sendEmailCode(
  email: string,
  code: string,
  language: string,
  purpose: EmailPurpose,
): Promise<void> {
  if (!env.EMAIL) throw new Error("Cloudflare Email Sending is not configured.");
  const copy = emailCopy(language, code, purpose);
  await env.EMAIL.send({
    to: email,
    from: {
      name: "Recovery Inventory",
      email: env.EMAIL_FROM_ADDRESS?.trim() || "login@recoveryinventory.com",
    },
    replyTo: env.EMAIL_REPLY_TO?.trim() || "support@recoveryinventory.com",
    subject: copy.subject,
    text: copy.text,
    html: copy.html,
  });
}
