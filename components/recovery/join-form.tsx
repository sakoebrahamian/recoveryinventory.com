"use client";

import * as React from "react";
import { ArrowLeft, CheckCircle2, Copy, Download, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useLanguage } from "./language-provider";

type JoinMethod = "anonymous" | "email";

export function JoinForm() {
  const { language, t } = useLanguage();
  const [method, setMethod] = React.useState<JoinMethod>("anonymous");
  const [alias, setAlias] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [recoveryCode, setRecoveryCode] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [challengeId, setChallengeId] = React.useState("");
  const [maskedEmail, setMaskedEmail] = React.useState("");
  const [emailCode, setEmailCode] = React.useState("");
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [promotionCode, setPromotionCode] = React.useState("");
  const [billingError, setBillingError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function chooseMethod(next: JoinMethod) {
    setMethod(next);
    setMessage("");
    setChallengeId("");
    setEmailCode("");
  }

  async function createAnonymousAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alias, language }),
      });
      const result = await response.json() as { recoveryCode?: string; error?: string };
      if (!response.ok || !result.recoveryCode) throw new Error(result.error || t("Could not create the account.", "حساب ایجاد نشد."));
      setRecoveryCode(result.recoveryCode);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  async function startEmailSignup(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/email/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ purpose: "signup", alias, email, language }),
      });
      const result = await response.json() as { challengeId?: string; maskedEmail?: string; error?: string };
      if (!response.ok || !result.challengeId) throw new Error(result.error || t("The verification email could not be sent.", "ایمیل تأیید ارسال نشد."));
      setChallengeId(result.challengeId);
      setMaskedEmail(result.maskedEmail || email);
      setMessage(t("We sent a six-digit code to your email.", "یک کد شش‌رقمی به ایمیل شما فرستادیم."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailSignup(event: React.FormEvent) {
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
      setEmailVerified(true);
      setMessage(t("Your email account is ready.", "حساب ایمیلی شما آماده است."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(recoveryCode);
    setMessage(t("Recovery code copied.", "کد بازیابی کپی شد."));
  }

  function downloadCode() {
    const content = `${t("Recovery Inventory account recovery code", "کد بازیابی حساب Recovery Inventory")}\n\n${recoveryCode}\n\n${t("Keep this private. Recovery Inventory cannot replace a lost code.", "این کد را خصوصی نگه دارید. Recovery Inventory نمی‌تواند کد گمشده را جایگزین کند.")}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "recovery-inventory-code.txt";
    link.click();
    URL.revokeObjectURL(url);
    setMessage(t("Recovery code downloaded.", "کد بازیابی دانلود شد."));
  }

  async function beginCheckout() {
    setBusy(true);
    setBillingError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ promotionCode: promotionCode.trim() || undefined }),
      });
      const result = await response.json() as { url?: string; activated?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error || t("Checkout is not available yet.", "پرداخت هنوز در دسترس نیست."));
      if (result.activated) {
        // Native navigation avoids the production Vinext client-router interception error.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/app");
        return;
      }
      if (!result.url) throw new Error(t("Checkout is not available yet.", "پرداخت هنوز در دسترس نیست."));
      window.location.assign(result.url);
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  function activationControls(disabled = false) {
    return (
      <>
        <div className="promotion-code-field join-promotion-code">
          <label htmlFor="join-promotion-code">{t("Promotion code (optional)", "کد تخفیف (اختیاری)")}</label>
          <input id="join-promotion-code" className="form-input" value={promotionCode} onChange={(event) => setPromotionCode(event.target.value)} autoComplete="off" placeholder={t("Enter code", "کد را وارد کنید")} />
          <p>{t("Enter a 100%-off forever code here to activate without payment or billing details. Other discounts open secure Stripe checkout for the remaining balance.", "برای فعال‌سازی بدون پرداخت یا اطلاعات صورتحساب، کد تخفیف دائمی ۱۰۰٪ را اینجا وارد کنید. تخفیف‌های دیگر برای پرداخت مبلغ باقی‌مانده، پرداخت امن Stripe را باز می‌کنند.")}</p>
        </div>
        {billingError && <p className="form-error" role="alert">{billingError}</p>}
        <button className="button button-primary button-full" type="button" onClick={beginCheckout} disabled={disabled || busy}><ShieldCheck size={18} />{busy ? (promotionCode.trim() ? t("Applying code…", "در حال اعمال کد…") : t("Opening secure checkout…", "در حال باز کردن پرداخت امن…")) : t("Activate membership", "فعال‌سازی عضویت")}</button>
      </>
    );
  }

  const accountCreated = Boolean(recoveryCode || emailVerified);

  return (
    <div className="account-card dashboard-card">
      {!accountCreated && (
        <>
          <div className="account-card-header">
            <h2>{t("Choose how to create your account", "روش ایجاد حساب را انتخاب کنید")}</h2>
            <p>{t("Both options include the same private membership features.", "هر دو گزینه شامل همان امکانات خصوصی عضویت هستند.")}</p>
          </div>
          <div className="account-method-picker" role="tablist" aria-label={t("Account type", "نوع حساب")}>
            <button type="button" role="tab" aria-selected={method === "anonymous"} className={method === "anonymous" ? "is-active" : ""} onClick={() => chooseMethod("anonymous")}>
              <KeyRound size={20} /><span><strong>{t("Anonymous account", "حساب ناشناس")}</strong><small>{t("Alias + recovery code", "نام مستعار و کد بازیابی")}</small></span>
            </button>
            <button type="button" role="tab" aria-selected={method === "email"} className={method === "email" ? "is-active" : ""} onClick={() => chooseMethod("email")}>
              <Mail size={20} /><span><strong>{t("Email account", "حساب ایمیلی")}</strong><small>{t("Email verification codes", "کدهای تأیید ایمیلی")}</small></span>
            </button>
          </div>
          <div className="price-inline"><strong>$25</strong><span>{t("per year · auto-renews", "در سال · تمدید خودکار")}</span></div>
        </>
      )}

      {!accountCreated && method === "anonymous" && (
        <>
          <form className="form-stack" onSubmit={createAnonymousAccount}>
            <div className="form-field">
              <label htmlFor="anonymous-alias">{t("Choose a private alias", "یک نام مستعار خصوصی انتخاب کنید")}</label>
              <input id="anonymous-alias" className="form-input" value={alias} onChange={(event) => setAlias(event.target.value)} minLength={2} maxLength={40} autoComplete="off" placeholder={t("Example: Quiet River", "مثال: رود آرام")} required />
            </div>
            {message && <p className="form-error" role="alert">{message}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>
              <KeyRound size={18} />{busy ? t("Creating…", "در حال ایجاد…") : t("Create anonymous account", "ایجاد حساب ناشناس")}
            </button>
          </form>
          <p className="fine-print">{t("No name or email is required. You must save the recovery code shown next.", "نام یا ایمیل لازم نیست. باید کد بازیابی مرحله بعد را ذخیره کنید.")}</p>
        </>
      )}

      {!accountCreated && method === "email" && !challengeId && (
        <>
          <form className="form-stack" onSubmit={startEmailSignup}>
            <div className="form-field">
              <label htmlFor="email-name">{t("Your name or display name", "نام یا نام نمایشی شما")}</label>
              <div className="input-with-icon"><UserRound size={17} /><input id="email-name" className="form-input" value={alias} onChange={(event) => setAlias(event.target.value)} minLength={2} maxLength={40} autoComplete="name" required /></div>
            </div>
            <div className="form-field">
              <label htmlFor="join-email">{t("Email address", "آدرس ایمیل")}</label>
              <div className="input-with-icon"><Mail size={17} /><input id="join-email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>
            </div>
            {message && <p className="form-error" role="alert">{message}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>
              <Mail size={18} />{busy ? t("Sending…", "در حال ارسال…") : t("Send verification code", "ارسال کد تأیید")}
            </button>
          </form>
          <p className="fine-print">{t("No password is needed. We will email a short-lived code whenever you sign in.", "نیازی به رمز عبور نیست. هر بار ورود، یک کد کوتاه‌مدت برایتان ایمیل می‌کنیم.")}</p>
        </>
      )}

      {!accountCreated && method === "email" && challengeId && (
        <>
          <div className="account-card-header">
            <h2>{t("Check your email", "ایمیل خود را بررسی کنید")}</h2>
            <p>{t("Enter the code sent to this address:", "کد ارسال‌شده به این نشانی را وارد کنید:")} <span dir="ltr">{maskedEmail}</span></p>
          </div>
          <form className="form-stack" onSubmit={verifyEmailSignup}>
            <div className="form-field">
              <label htmlFor="join-email-code">{t("Six-digit verification code", "کد تأیید شش‌رقمی")}</label>
              <input id="join-email-code" className="form-input email-code-input" value={emailCode} onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required dir="ltr" />
            </div>
            {message && <p className={message.includes("sent") || message.includes("Enviamos") || message.includes("فرستادیم") ? "form-success" : "form-error"} role="status">{message}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy || emailCode.length !== 6}>
              <ShieldCheck size={18} />{busy ? t("Verifying…", "در حال تأیید…") : t("Verify and create account", "تأیید و ایجاد حساب")}
            </button>
            <button className="text-button" type="button" onClick={() => { setChallengeId(""); setEmailCode(""); setMessage(""); }}><ArrowLeft size={15} />{t("Use a different email", "استفاده از ایمیل دیگر")}</button>
          </form>
        </>
      )}

      {recoveryCode && (
        <>
          <div className="account-card-header">
            <h2>{t("Save this code now", "همین حالا این کد را ذخیره کنید")}</h2>
            <p>{t("It is the only way back into a fully anonymous account on a new device.", "این تنها راه ورود دوباره به حساب کاملاً ناشناس در دستگاه جدید است.")}</p>
          </div>
          <div className="recovery-code-box">
            <span>{t("Your private recovery code", "کد بازیابی خصوصی شما")}</span>
            <p className="recovery-code" dir="ltr">{recoveryCode}</p>
            <div className="recovery-actions">
              <button className="button button-small button-outline" type="button" onClick={copyCode}><Copy size={15} />{t("Copy", "کپی")}</button>
              <button className="button button-small button-outline" type="button" onClick={downloadCode}><Download size={15} />{t("Download", "دانلود")}</button>
            </div>
          </div>
          <label className="confirmation-check"><input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} /><span>{t("I saved my recovery code somewhere private.", "کد بازیابی را در جایی خصوصی ذخیره کردم.")}</span></label>
          {message && <p className={message.includes("copied") || message.includes("download") || message.includes("copiad") || message.includes("descargad") || message.includes("کپی") || message.includes("دانلود") ? "form-success" : "form-error"}>{message}</p>}
          {activationControls(!saved)}
          <p className="fine-print"><ShieldCheck size={14} /> {t("You can add an email later without losing your inventories or membership.", "بعداً می‌توانید بدون از دست دادن ترازنامه‌ها یا عضویت، ایمیل اضافه کنید.")}</p>
        </>
      )}

      {emailVerified && (
        <>
          <div className="account-card-header success-heading">
            <CheckCircle2 size={30} />
            <h2>{t("Your email account is ready", "حساب ایمیلی شما آماده است")}</h2>
            <p>{t("Your verified email will be used for secure sign-in codes and account recovery.", "ایمیل تأییدشده شما برای کدهای ورود امن و بازیابی حساب استفاده می‌شود.")}</p>
          </div>
          {message && <p className="form-success">{message}</p>}
          {activationControls()}
        </>
      )}

      {!accountCreated && <p className="auth-switch">{t("Already have an account?", "از قبل حساب دارید؟")} <a href="/recover">{t("Log in", "ورود")}</a></p>}
    </div>
  );
}
