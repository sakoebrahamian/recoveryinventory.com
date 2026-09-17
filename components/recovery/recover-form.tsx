"use client";

import * as React from "react";
import { KeyRound } from "lucide-react";
import { useLanguage } from "./language-provider";

export function RecoverForm() {
  const { t } = useLanguage();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
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
      setError(caught instanceof Error ? caught.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
      setBusy(false);
    }
  }

  return (
    <div className="account-card dashboard-card">
      <div className="account-card-header">
        <h2>{t("Open your account", "ورود به حساب")}</h2>
        <p>{t("Enter the private recovery code you saved.", "کد بازیابی خصوصی ذخیره‌شده را وارد کنید.")}</p>
      </div>
      <form className="form-stack" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="recovery-code">{t("Recovery code", "کد بازیابی")}</label>
          <textarea
            id="recovery-code"
            className="form-textarea code-entry"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="RI-••••-••••-••••-••••-••••-••••-••••-••••"
            required
            dir="ltr"
          />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary button-full" type="submit" disabled={busy}>
          <KeyRound size={18} />{busy ? t("Opening…", "در حال ورود…") : t("Open my account", "ورود به حساب")}
        </button>
      </form>
      <p className="fine-print">{t("For your privacy, there is no email reset. If the code is lost, the account cannot be recovered.", "برای حفظ حریم خصوصی، بازیابی با ایمیل وجود ندارد. اگر کد گم شود، حساب قابل بازیابی نیست.")}</p>
      <p className="auth-switch">{t("Need a new account?", "به حساب جدید نیاز دارید؟")} <a href="/join">{t("Join anonymously", "عضویت ناشناس")}</a></p>
    </div>
  );
}
