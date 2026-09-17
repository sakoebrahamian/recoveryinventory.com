"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, CreditCard, Download, KeyRound, ShieldCheck } from "lucide-react";
import { useLanguage } from "./language-provider";

export function JoinForm() {
  const { language, t } = useLanguage();
  const [alias, setAlias] = React.useState("");
  const [recoveryCode, setRecoveryCode] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function createAccount(event: React.FormEvent) {
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
    setMessage("");
    try {
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || t("Checkout is not available yet.", "پرداخت هنوز در دسترس نیست."));
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  return (
    <div className="account-card dashboard-card">
      {!recoveryCode ? (
        <>
          <div className="account-card-header">
            <h2>{t("Create your private account", "حساب خصوصی خود را بسازید")}</h2>
            <p>{t("No name or email address is needed here.", "اینجا به نام یا ایمیل نیاز نیست.")}</p>
          </div>
          <div className="price-inline"><strong>$25</strong><span>{t("per year · auto-renews", "در سال · تمدید خودکار")}</span></div>
          <form className="form-stack" onSubmit={createAccount}>
            <div className="form-field">
              <label htmlFor="alias">{t("Choose a private alias", "یک نام مستعار خصوصی انتخاب کنید")}</label>
              <input
                id="alias"
                className="form-input"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                minLength={2}
                maxLength={40}
                autoComplete="off"
                placeholder={t("Example: Quiet River", "مثال: رود آرام")}
                required
              />
            </div>
            {message && <p className="form-error" role="alert">{message}</p>}
            <button className="button button-primary button-full" type="submit" disabled={busy}>
              <KeyRound size={18} />{busy ? t("Creating…", "در حال ایجاد…") : t("Create account", "ایجاد حساب")}
            </button>
          </form>
          <p className="fine-print">
            {t("Next, you will receive a one-time recovery code. Payment is handled securely by Stripe, which may request billing information.", "سپس یک کد بازیابی یک‌بار نمایش داده می‌شود. پرداخت به‌صورت امن توسط Stripe انجام می‌شود و ممکن است اطلاعات صورتحساب را درخواست کند.")}
          </p>
          <p className="auth-switch">{t("Already have a recovery code?", "از قبل کد بازیابی دارید؟")} <Link href="/recover">{t("Open my account", "ورود به حساب")}</Link></p>
        </>
      ) : (
        <>
          <div className="account-card-header">
            <h2>{t("Save this code now", "همین حالا این کد را ذخیره کنید")}</h2>
            <p>{t("It is the only way back into your account on a new device.", "این تنها راه ورود دوباره به حساب در دستگاه جدید است.")}</p>
          </div>
          <div className="recovery-code-box">
            <span>{t("Your private recovery code", "کد بازیابی خصوصی شما")}</span>
            <p className="recovery-code" dir="ltr">{recoveryCode}</p>
            <div className="recovery-actions">
              <button className="button button-small button-outline" type="button" onClick={copyCode}><Copy size={15} />{t("Copy", "کپی")}</button>
              <button className="button button-small button-outline" type="button" onClick={downloadCode}><Download size={15} />{t("Download", "دانلود")}</button>
            </div>
          </div>
          <label className="confirmation-check">
            <input type="checkbox" checked={saved} onChange={(event) => setSaved(event.target.checked)} />
            <span>{t("I saved my recovery code somewhere private.", "کد بازیابی را در جایی خصوصی ذخیره کردم.")}</span>
          </label>
          {message && <p className={message.includes("copied") || message.includes("download") || message.includes("کپی") || message.includes("دانلود") ? "form-success" : "form-error"}>{message}</p>}
          <button className="button button-primary button-full" type="button" onClick={beginCheckout} disabled={!saved || busy}>
            <CreditCard size={18} />{busy ? t("Opening secure checkout…", "در حال باز کردن پرداخت امن…") : t("Continue to secure payment", "ادامه به پرداخت امن")}
          </button>
          <p className="fine-print"><ShieldCheck size={14} /> {t("$25 yearly, auto-renewing. Cancel any time through the billing portal.", "سالانه ۲۵ دلار با تمدید خودکار. هر زمان از طریق پنل پرداخت لغو کنید.")}</p>
        </>
      )}
    </div>
  );
}
