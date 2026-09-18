"use client";

import { KeyRound, Mail, ShieldCheck } from "lucide-react";
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
          <p>{t("Log in with a one-time code sent to your verified email, or use the private recovery code from an anonymous account.", "با کد یک‌بارمصرفی که به ایمیل تأییدشده شما فرستاده می‌شود وارد شوید، یا از کد بازیابی خصوصی حساب ناشناس استفاده کنید.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><Mail size={18} /></strong><div><strong>{t("Email account", "حساب ایمیلی")}</strong><span>{t("No password to remember. Request a fresh code when needed.", "رمزی برای به‌خاطر سپردن نیست. هر زمان لازم بود کد تازه بگیرید.")}</span></div></div>
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Anonymous account", "حساب ناشناس")}</strong><span>{t("Your saved recovery code remains your private key.", "کد بازیابی ذخیره‌شده شما همچنان کلید خصوصی شماست.")}</span></div></div>
          </div>
        </div>
        <RecoverForm />
      </section>
      <SiteFooter />
    </main>
  );
}
