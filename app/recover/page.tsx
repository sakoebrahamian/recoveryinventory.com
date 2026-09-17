"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
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
          <span className="eyebrow dark-eyebrow"><KeyRound size={14} /> {t("Private access", "دسترسی خصوصی")}</span>
          <h1>{t("Welcome back.", "خوش آمدید.")}</h1>
          <p>{t("Your recovery code works in place of an email address and password. It is checked securely and is never stored in readable form.", "کد بازیابی شما جای ایمیل و رمز عبور را می‌گیرد. این کد به‌صورت امن بررسی می‌شود و هرگز به شکل خوانا ذخیره نمی‌شود.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><ShieldCheck size={18} /></strong><div><strong>{t("No identity profile", "بدون پروفایل هویتی")}</strong><span>{t("Your alias is the only profile label.", "نام مستعار تنها برچسب پروفایل شماست.")}</span></div></div>
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Your code is the key", "کد شما کلید ورود است")}</strong><span>{t("Keep it somewhere private and dependable.", "آن را در جایی خصوصی و مطمئن نگه دارید.")}</span></div></div>
          </div>
        </div>
        <RecoverForm />
      </section>
      <SiteFooter />
    </main>
  );
}
