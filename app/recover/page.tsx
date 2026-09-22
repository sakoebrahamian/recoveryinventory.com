"use client";

import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { RecoverForm } from "@/components/recovery/recover-form";
import { SiteFooter } from "@/components/recovery/site-footer";
import { SiteHeader } from "@/components/recovery/site-header";
import { useLanguage } from "@/components/recovery/language-provider";

export default function RecoverPage() {
  const { t } = useLanguage();
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="auth-shell recover-shell">
        <div className="auth-copy">
          <span className="eyebrow dark-eyebrow"><ShieldCheck size={14} /> {t("Private access", "دسترسی خصوصی")}</span>
          <h1>{t("Welcome back.", "خوش آمدید.")}</h1>
          <p>{t("Log in with a username and password, a one-time code sent to your verified email, or the private recovery code from an anonymous account.", "با نام کاربری و رمز عبور، کد یک‌بارمصرف ارسال‌شده به ایمیل تأییدشده یا کد بازیابی خصوصی حساب ناشناس وارد شوید.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><UserRound size={18} /></strong><div><strong>{t("Username and password", "نام کاربری و رمز عبور")}</strong><span>{t("Available to anonymous members without requiring a real name or email.", "برای اعضای ناشناس بدون نیاز به نام واقعی یا ایمیل در دسترس است.")}</span></div></div>
            <div className="auth-step"><strong><Mail size={18} /></strong><div><strong>{t("Email account", "حساب ایمیلی")}</strong><span>{t("No password to remember. Request a fresh code when needed.", "رمزی برای به‌خاطر سپردن نیست. هر زمان لازم بود کد تازه بگیرید.")}</span></div></div>
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Recovery code", "کد بازیابی")}</strong><span>{t("Anonymous members should keep this backup key copied or downloaded.", "اعضای ناشناس باید این کلید پشتیبان را کپی یا دانلود و نگهداری کنند.")}</span></div></div>
          </div>
        </div>
        <RecoverForm />
      </section>
      <SiteFooter />
    </main>
  );
}
