"use client";

import * as React from "react";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";

type LoginMethod = "email" | "recovery";

export function RecoverForm() {
  const { language, t } = useLanguage();
  const [method, setMethod] = React.useState<LoginMethod>("email");
  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [challengeId, setChallengeId] = React.useState("");
  const [maskedEmail, setMaskedEmail] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function chooseMethod(next: LoginMethod) {
    setMethod(next);
    setMessage("");
    setChallengeId("");
    setEmailCode("");
  }

  async function submitRecoveryCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/recover", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ recoveryCode: code }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || t("That code was not recognized.", "این کد شناخته نشد."));
      // Native navigation avoids the production Vinext client-router interception error.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/app");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  async function startEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/email/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose: "login", email, language }),
      });
      const result = await response.json() as { challengeId?: string; maskedEmail?: string; error?: string };
      if (!response.ok || !result.challengeId) throw new Error(result.error || t("The sign-in email could not be sent.", "ایمیل ورود ارسال نشد."));
      setChallengeId(result.challengeId);
      setMaskedEmail(result.maskedEmail || email);
      setMessage(t("We sent a six-digit sign-in code.", "یک کد ورود شش‌رقمی فرستادیم."));
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/email/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId, code: emailCode }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || t("That code was not recognized.", "این کد شناخته نشد."));
      // Native navigation avoids the production Vinext client-router interception error.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/app");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  return (
    <div className="account-card dashboard-card">
      <div className="account-card-header">
        <h2>{t("Log in to your account", "ورود به حساب")}</h2>
        <p>{t("Choose the same method you used when creating your account.", "همان روشی را انتخاب کنید که هنگام ایجاد حساب استفاده کردید.")}</p>
      </div>
      <div className="account-method-picker login-method-picker" role="tablist" aria-label={t("Login method", "روش ورود")}>
        <button type="button" role="tab" aria-selected={method === "email"} className={method === "email" ? "is-active" : ""} onClick={() => chooseMethod("email")}><Mail size={19} /><span><strong>{t("Email", "ایمیل")}</strong><small>{t("Receive a code", "دریافت کد")}</small></span></button>
        <button type="button" role="tab" aria-selected={method === "recovery"} className={method === "recovery" ? "is-active" : ""} onClick={() => chooseMethod("recovery")}><KeyRound size={19} /><span><strong>{t("Recovery code", "کد بازیابی")}</strong><small>{t("Anonymous accounts", "حساب‌های ناشناس")}</small></span></button>
      </div>

      {method === "email" && !challengeId && (
        <form className="form-stack" onSubmit={startEmailLogin}>
          <div className="form-field">
            <label htmlFor="login-email">{t("Email address", "آدرس ایمیل")}</label>
            <div className="input-with-icon"><Mail size={17} /><input id="login-email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-primary button-full" type="submit" disabled={busy}><Mail size={18} />{busy ? t("Sending…", "در حال ارسال…") : t("Send sign-in code", "ارسال کد ورود")}</button>
          <p className="fine-print">{t("We send a one-time code. No password is stored.", "یک کد یک‌بارمصرف می‌فرستیم. هیچ رمز عبوری ذخیره نمی‌شود.")}</p>
        </form>
      )}

      {method === "email" && challengeId && (
        <form className="form-stack" onSubmit={verifyEmailLogin}>
          <div className="account-card-header compact-heading">
            <h3>{t("Check your email", "ایمیل خود را بررسی کنید")}</h3>
            <p>{t("Enter the code sent to this address:", "کد ارسال‌شده به این نشانی را وارد کنید:")} <span dir="ltr">{maskedEmail}</span></p>
          </div>
          <div className="form-field">
            <label htmlFor="login-email-code">{t("Six-digit sign-in code", "کد ورود شش‌رقمی")}</label>
            <input id="login-email-code" className="form-input email-code-input" value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required dir="ltr" />
          </div>
          {message && <p className={message.includes("sent") || message.includes("Enviamos") || message.includes("فرستادیم") ? "form-success" : "form-error"} role="status">{message}</p>}
          <button className="button button-primary button-full" type="submit" disabled={busy || emailCode.length !== 6}><ShieldCheck size={18} />{busy ? t("Opening…", "در حال ورود…") : t("Verify and log in", "تأیید و ورود")}</button>
          <button className="text-button" type="button" onClick={() => { setChallengeId(""); setEmailCode(""); setMessage(""); }}><ArrowLeft size={15} />{t("Use a different email", "استفاده از ایمیل دیگر")}</button>
        </form>
      )}

      {method === "recovery" && (
        <>
          <form className="form-stack" onSubmit={submitRecoveryCode}>
            <div className="form-field">
              <label htmlFor="recovery-code">{t("Private recovery code", "کد بازیابی خصوصی")}</label>
              <textarea id="recovery-code" className="form-textarea code-entry" value={code} onChange={(event) => setCode(event.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} placeholder="RI-••••-••••-••••-••••-••••-••••-••••-••••" required dir="ltr" />
            </div>
            {message && <p className="form-error" role="alert">{message}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy}><KeyRound size={18} />{busy ? t("Opening…", "در حال ورود…") : t("Open my account", "ورود به حساب")}</button>
          </form>
          <p className="fine-print">{t("A fully anonymous account cannot be recovered if its code is lost. You can add an email after logging in without losing any saved work.", "اگر کد یک حساب کاملاً ناشناس گم شود، بازیابی آن ممکن نیست. پس از ورود می‌توانید بدون از دست دادن مطالب ذخیره‌شده، ایمیل اضافه کنید.")}</p>
        </>
      )}

      <p className="auth-switch">{t("Need an account?", "به حساب نیاز دارید؟")} <a href="/join">{t("See both signup options", "مشاهده هر دو روش عضویت")}</a></p>
    </div>
  );
}
