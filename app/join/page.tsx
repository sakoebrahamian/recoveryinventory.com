"use client";

import { Check, KeyRound, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { JoinForm } from "@/components/recovery/join-form";
import { SiteFooter } from "@/components/recovery/site-footer";
import { SiteHeader } from "@/components/recovery/site-header";
import { useLanguage } from "@/components/recovery/language-provider";

export default function JoinPage() {
  const { t } = useLanguage();
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="auth-shell">
        <div className="auth-copy">
          <span className="eyebrow dark-eyebrow"><LockKeyhole size={14} /> {t("Two private ways to join", "دو روش خصوصی برای عضویت")}</span>
          <h1>{t("Choose the account that feels right for you.", "حسابی را انتخاب کنید که برای شما مناسب‌تر است.")}</h1>
          <p>{t("Use an anonymous alias and recovery code, or create an email account with easy account recovery. Both receive the same private membership features.", "از نام مستعار و کد بازیابی ناشناس استفاده کنید، یا یک حساب ایمیلی با بازیابی آسان بسازید. هر دو همان امکانات خصوصی عضویت را دریافت می‌کنند.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Anonymous account", "حساب ناشناس")}</strong><span>{t("No name or email required. Save your private recovery code.", "نام یا ایمیل لازم نیست. کد بازیابی خصوصی خود را ذخیره کنید.")}</span></div></div>
            <div className="auth-step"><strong><Mail size={18} /></strong><div><strong>{t("Email account", "حساب ایمیلی")}</strong><span>{t("Sign in and recover access using one-time email codes.", "با کدهای یک‌بارمصرف ایمیلی وارد شوید و دسترسی را بازیابی کنید.")}</span></div></div>
            <div className="auth-step"><strong>03</strong><div><strong>{t("Subscribe securely", "اشتراک امن")}</strong><span><RefreshCw size={13} /> {t("$25 yearly; cancel any time.", "سالانه ۲۵ دلار؛ هر زمان لغو کنید.")}</span></div></div>
          </div>
          <p className="privacy-inline"><Check size={15} /> {t("An anonymous member can add email later without losing inventories, analytics, or membership progress.", "عضو ناشناس می‌تواند بعداً بدون از دست دادن ترازنامه‌ها، تحلیل‌ها یا پیشرفت عضویت، ایمیل اضافه کند.")}</p>
        </div>
        <JoinForm />
      </section>
      <SiteFooter />
    </main>
  );
}
