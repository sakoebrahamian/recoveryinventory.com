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
          <p>{t("Create an anonymous account with a private alias, username, and password, or choose verified email access. Anonymous members also receive a recovery code and must copy or download it before continuing.", "یک حساب ناشناس با نام مستعار، نام کاربری و رمز عبور خصوصی بسازید، یا ورود با ایمیل تأییدشده را انتخاب کنید. اعضای ناشناس همچنین یک کد بازیابی دریافت می‌کنند و باید پیش از ادامه آن را کپی یا دانلود کنند.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Anonymous account", "حساب ناشناس")}</strong><span>{t("No real name or email required. Use a username and password, then copy or download your recovery code.", "نام واقعی یا ایمیل لازم نیست. از نام کاربری و رمز عبور استفاده کنید و سپس کد بازیابی خود را کپی یا دانلود کنید.")}</span></div></div>
            <div className="auth-step"><strong><Mail size={18} /></strong><div><strong>{t("Email account", "حساب ایمیلی")}</strong><span>{t("Sign in and recover access using one-time email codes.", "با کدهای یک‌بارمصرف ایمیلی وارد شوید و دسترسی را بازیابی کنید.")}</span></div></div>
            <div className="auth-step"><strong>03</strong><div><strong>{t("Subscribe securely", "اشتراک امن")}</strong><span><RefreshCw size={13} /> {t("$25 yearly; cancel any time.", "سالانه ۲۵ دلار؛ هر زمان لغو کنید.")}</span></div></div>
          </div>
          <p className="privacy-inline"><Check size={15} /> {t("Existing anonymous and email members can add username-and-password access without losing inventories, analytics, or membership progress.", "اعضای ناشناس و ایمیلی موجود می‌توانند بدون از دست دادن ترازنامه‌ها، تحلیل‌ها یا پیشرفت عضویت، ورود با نام کاربری و رمز عبور را اضافه کنند.")}</p>
        </div>
        <JoinForm />
      </section>
      <SiteFooter />
    </main>
  );
}
