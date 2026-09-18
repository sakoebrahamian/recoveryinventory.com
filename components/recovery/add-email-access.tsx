"use client";

import * as React from "react";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";

export function AddEmailAccess({
  email,
  onConnected,
}: {
  email: string | null;
  onConnected: (email: string) => void;
}) {
  const { language, t } = useLanguage();
  const [address, setAddress] = React.useState("");
  const [challengeId, setChallengeId] = React.useState("");
  const [maskedEmail, setMaskedEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/email/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose: "add_email", email: address, language }),
      });
      const result = await response.json() as { challengeId?: string; maskedEmail?: string; error?: string };
      if (!response.ok || !result.challengeId) throw new Error(result.error || t("The verification email could not be sent.", "ایمیل تأیید ارسال نشد."));
      setChallengeId(result.challengeId);
      setMaskedEmail(result.maskedEmail || address);
      setMessage(t("We sent a six-digit code.", "یک کد شش‌رقمی فرستادیم."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/email/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId, code }),
      });
      const result = await response.json() as { email?: string; error?: string };
      if (!response.ok || !result.email) throw new Error(result.error || t("That code was not recognized.", "این کد شناخته نشد."));
      onConnected(result.email);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  if (email) {
    return (
      <section className="dashboard-card account-access-card">
        <div className="account-access-title"><CheckCircle2 size={19} /><div><h3>{t("Email login active", "ورود ایمیلی فعال است")}</h3><p>{email}</p></div></div>
        <p className="fine-print">{t("You can sign in with an emailed code. If this began as an anonymous account, your original recovery code still works too.", "می‌توانید با کدی که به ایمیل فرستاده می‌شود وارد شوید. اگر این حساب ابتدا ناشناس بوده، کد بازیابی اصلی همچنان کار می‌کند.")}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-card account-access-card">
      <div className="account-access-title"><Mail size={19} /><div><h3>{t("Add email account recovery", "افزودن بازیابی حساب با ایمیل")}</h3><p>{t("Keep this same account and all its progress.", "همین حساب و تمام پیشرفت خود را نگه دارید.")}</p></div></div>
      {!challengeId ? (
        <form className="compact-email-form" onSubmit={sendCode}>
          <label htmlFor="connect-email">{t("Email address", "آدرس ایمیل")}</label>
          <input id="connect-email" className="form-input" type="email" value={address} onChange={(event) => setAddress(event.target.value)} autoComplete="email" required />
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-outline button-full" type="submit" disabled={busy}><Mail size={16} />{busy ? t("Sending…", "در حال ارسال…") : t("Send verification code", "ارسال کد تأیید")}</button>
        </form>
      ) : (
        <form className="compact-email-form" onSubmit={verifyCode}>
          <p>{t("Enter the code sent to this address:", "کد ارسال‌شده به این نشانی را وارد کنید:")} <span dir="ltr">{maskedEmail}</span></p>
          <label htmlFor="connect-email-code">{t("Six-digit code", "کد شش‌رقمی")}</label>
          <input id="connect-email-code" className="form-input email-code-input" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required dir="ltr" />
          {message && <p className={message.includes("sent") || message.includes("Enviamos") || message.includes("فرستادیم") ? "form-success" : "form-error"} role="status">{message}</p>}
          <button className="button button-outline button-full" type="submit" disabled={busy || code.length !== 6}><ShieldCheck size={16} />{busy ? t("Verifying…", "در حال تأیید…") : t("Verify and connect", "تأیید و اتصال")}</button>
          <button className="text-button" type="button" onClick={() => { setChallengeId(""); setCode(""); setMessage(""); }}><ArrowLeft size={14} />{t("Use a different email", "استفاده از ایمیل دیگر")}</button>
        </form>
      )}
      <p className="fine-print">{t("Adding email changes only how you log in. Your inventories, analytics, membership, and billing stay attached to this account.", "افزودن ایمیل فقط روش ورود را تغییر می‌دهد. ترازنامه‌ها، تحلیل‌ها، عضویت و پرداخت شما به همین حساب متصل می‌مانند.")}</p>
    </section>
  );
}
