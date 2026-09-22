"use client";

import * as React from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLanguage } from "./language-provider";
import { translatePasswordError } from "./password-error";

type LoginMethod = "password" | "email" | "recovery";

export function RecoverForm() {
  const { language, t } = useLanguage();
  const [method, setMethod] = React.useState<LoginMethod>("password");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
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

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/password/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(translatePasswordError(t, result.error, "Username or password was not recognized.", "نام کاربری یا رمز عبور شناخته نشد."));
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
        <p>{t("Use your username and password, an emailed code, or your private recovery code.", "از نام کاربری و رمز عبور، کد ایمیلی یا کد بازیابی خصوصی خود استفاده کنید.")}</p>
      </div>
      <div className="account-method-picker login-method-picker" role="tablist" aria-label={t("Login method", "روش ورود")}>
        <button type="button" role="tab" aria-selected={method === "password"} className={method === "password" ? "is-active" : ""} onClick={() => chooseMethod("password")}><UserRound size={19} /><span><strong>{t("Username", "نام کاربری")}</strong><small>{t("Username and password", "نام کاربری و رمز عبور")}</small></span></button>
        <button type="button" role="tab" aria-selected={method === "email"} className={method === "email" ? "is-active" : ""} onClick={() => chooseMethod("email")}><Mail size={19} /><span><strong>{t("Email", "ایمیل")}</strong><small>{t("Receive a code", "دریافت کد")}</small></span></button>
        <button type="button" role="tab" aria-selected={method === "recovery"} className={method === "recovery" ? "is-active" : ""} onClick={() => chooseMethod("recovery")}><KeyRound size={19} /><span><strong>{t("Recovery code", "کد بازیابی")}</strong><small>{t("Anonymous accounts", "حساب‌های ناشناس")}</small></span></button>
      </div>

      {method === "password" && (
        <form className="form-stack" onSubmit={submitPassword}>
          <div className="form-field">
            <label htmlFor="login-username">{t("Username", "نام کاربری")}</label>
            <input id="login-username" className="form-input" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required dir="ltr" />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">{t("Password", "رمز عبور")}</label>
            <div className="password-input-wrap">
              <input id="login-password" className="form-input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t("Hide password", "پنهان کردن رمز عبور") : t("Show password", "نمایش رمز عبور")}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-primary button-full" type="submit" disabled={busy}><KeyRound size={18} />{busy ? t("Opening…", "در حال ورود…") : t("Log in", "ورود")}</button>
          <p className="fine-print">{t("Anonymous accounts can use a private username and password without adding a name or email. Keep the downloaded recovery code as a separate backup login.", "حساب‌های ناشناس می‌توانند بدون افزودن نام یا ایمیل از نام کاربری و رمز عبور خصوصی استفاده کنند. کد بازیابی دانلودشده را به‌عنوان ورود پشتیبان جداگانه نگه دارید.")}</p>
        </form>
      )}

      {method === "email" && !challengeId && (
        <form className="form-stack" onSubmit={startEmailLogin}>
          <div className="form-field">
            <label htmlFor="login-email">{t("Email address", "آدرس ایمیل")}</label>
            <div className="input-with-icon"><Mail size={17} /><input id="login-email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
          </div>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button className="button button-primary button-full" type="submit" disabled={busy}><Mail size={18} />{busy ? t("Sending…", "در حال ارسال…") : t("Send sign-in code", "ارسال کد ورود")}</button>
          <p className="fine-print">{t("We send a one-time code. You can add username-and-password access to the same account after signing in.", "یک کد یک‌بارمصرف می‌فرستیم. پس از ورود می‌توانید دسترسی با نام کاربری و رمز عبور را به همین حساب اضافه کنید.")}</p>
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
          <p className="fine-print">{t("The recovery code is an independent backup login for an anonymous account. Even when you use a username and password, keep the code copied or downloaded in a private place.", "کد بازیابی یک ورود پشتیبان مستقل برای حساب ناشناس است. حتی هنگام استفاده از نام کاربری و رمز عبور، کد را کپی یا دانلود کرده و در جایی خصوصی نگه دارید.")}</p>
        </>
      )}

      <p className="auth-switch">{t("Need an account?", "به حساب نیاز دارید؟")} <a href="/join">{t("See both signup options", "مشاهده هر دو روش عضویت")}</a></p>
    </div>
  );
}
