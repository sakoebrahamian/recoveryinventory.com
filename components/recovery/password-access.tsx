"use client";

import * as React from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useLanguage } from "./language-provider";
import { translatePasswordError } from "./password-error";

export function PasswordAccess({
  username,
  onConfigured,
}: {
  username: string | null;
  onConfigured: (username: string) => void;
}) {
  const { t } = useLanguage();
  const [editing, setEditing] = React.useState(!username);
  const [usernameDraft, setUsernameDraft] = React.useState(username ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function saveCredentials(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmation) {
      setSuccess(false);
      setMessage(t("The passwords do not match.", "رمزهای عبور یکسان نیستند."));
      return;
    }
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: usernameDraft,
          password: password || undefined,
          currentPassword: currentPassword || undefined,
        }),
      });
      const result = await response.json() as { username?: string; error?: string };
      if (!response.ok || !result.username) throw new Error(translatePasswordError(t, result.error, "Could not save username and password.", "نام کاربری و رمز عبور ذخیره نشد."));
      onConfigured(result.username);
      setUsernameDraft(result.username);
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setEditing(false);
      setSuccess(true);
      setMessage(t("Username and password login is ready. Your saved data stayed in this account.", "ورود با نام کاربری و رمز عبور آماده است. داده‌های ذخیره‌شده شما در همین حساب باقی ماند."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Please try again.", "لطفاً دوباره تلاش کنید."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-card account-access-card password-access-card">
      <div className="account-access-title">
        {username ? <CheckCircle2 size={19} /> : <KeyRound size={19} />}
        <div>
          <h3>{username ? t("Username and password active", "نام کاربری و رمز عبور فعال است") : t("Add username and password", "افزودن نام کاربری و رمز عبور")}</h3>
          <p>{username ? <span dir="ltr">@{username}</span> : t("Keep this account and every saved inventory.", "همین حساب و تمام ترازنامه‌های ذخیره‌شده را نگه دارید.")}</p>
        </div>
      </div>

      {username && !editing ? (
        <button className="button button-outline button-full" type="button" onClick={() => { setEditing(true); setMessage(""); setSuccess(false); }}><KeyRound size={16} />{t("Change login details", "تغییر اطلاعات ورود")}</button>
      ) : (
        <form className="compact-password-form" onSubmit={saveCredentials}>
          <div className="form-field">
            <label htmlFor={`account-username-${username ? "change" : "add"}`}>{t("Username", "نام کاربری")}</label>
            <input id={`account-username-${username ? "change" : "add"}`} className="form-input" value={usernameDraft} onChange={(event) => setUsernameDraft(event.target.value)} minLength={3} maxLength={32} autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required dir="ltr" />
          </div>
          {username && <div className="form-field"><label htmlFor="account-current-password">{t("Current password", "رمز عبور فعلی")}</label><input id="account-current-password" className="form-input" type={showPassword ? "text" : "password"} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></div>}
          <div className="form-field">
            <label htmlFor="account-new-password">{username ? t("New password (optional)", "رمز عبور جدید (اختیاری)") : t("Create a password", "یک رمز عبور بسازید")}</label>
            <div className="password-input-wrap">
              <input id="account-new-password" className="form-input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={password.length > 0 || !username ? 15 : undefined} maxLength={128} autoComplete="new-password" required={!username} />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? t("Hide password", "پنهان کردن رمز عبور") : t("Show password", "نمایش رمز عبور")}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <p className="field-help">{username ? t("Leave blank to keep the current password. New passwords need at least 15 characters.", "برای نگه داشتن رمز فعلی، خالی بگذارید. رمز جدید باید حداقل ۱۵ نویسه داشته باشد.") : t("Use at least 15 characters. Spaces are allowed.", "حداقل از ۱۵ نویسه استفاده کنید. فاصله مجاز است.")}</p>
          </div>
          <div className="form-field"><label htmlFor="account-confirm-password">{t("Confirm new password", "تکرار رمز عبور جدید")}</label><input id="account-confirm-password" className="form-input" type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={password ? 15 : undefined} maxLength={128} autoComplete="new-password" required={Boolean(password) || !username} /></div>
          {message && <p className={success ? "form-success" : "form-error"} role={success ? "status" : "alert"}>{message}</p>}
          <button className="button button-outline button-full" type="submit" disabled={busy}><KeyRound size={16} />{busy ? t("Saving…", "در حال ذخیره…") : username ? t("Save login changes", "ذخیره تغییرات ورود") : t("Add username and password", "افزودن نام کاربری و رمز عبور")}</button>
          {username && <button className="text-button" type="button" onClick={() => { setEditing(false); setUsernameDraft(username); setCurrentPassword(""); setPassword(""); setConfirmation(""); setMessage(""); }}>{t("Cancel", "لغو")}</button>}
        </form>
      )}

      {!editing && message && <p className={success ? "form-success" : "form-error"} role={success ? "status" : "alert"}>{message}</p>}
      <p className="fine-print">{t("This adds another secure way to enter the same account. It does not copy, move, or erase inventories, analytics, membership, or billing. Anonymous members should also keep their recovery code copied or downloaded in a private place.", "این یک راه امن دیگر برای ورود به همان حساب اضافه می‌کند. ترازنامه‌ها، تحلیل‌ها، عضویت یا پرداخت را کپی، منتقل یا پاک نمی‌کند. اعضای ناشناس باید کد بازیابی خود را نیز کپی یا دانلود کرده و در جایی خصوصی نگه دارند.")}</p>
    </section>
  );
}
