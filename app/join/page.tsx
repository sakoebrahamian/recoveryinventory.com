"use client";

import { Check, LockKeyhole, RefreshCw } from "lucide-react";
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
          <span className="eyebrow dark-eyebrow"><LockKeyhole size={14} /> {t("Anonymous by design", "ناشناس از ابتدا")}</span>
          <h1>{t("One private place for honest inventory.", "یک فضای خصوصی برای ترازنامه‌ای صادقانه.")}</h1>
          <p>{t("Create an account without giving Recovery Inventory your name or email. Your private recovery code becomes your key.", "بدون ارائه نام یا ایمیل به Recovery Inventory حساب بسازید. کد بازیابی خصوصی شما کلید ورودتان خواهد بود.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong>01</strong><div><strong>{t("Choose an alias", "یک نام مستعار انتخاب کنید")}</strong><span>{t("No identifying profile is required.", "پروفایل هویتی لازم نیست.")}</span></div></div>
            <div className="auth-step"><strong>02</strong><div><strong>{t("Save your recovery code", "کد بازیابی خود را ذخیره کنید")}</strong><span>{t("We cannot replace it if it is lost.", "اگر گم شود نمی‌توانیم جایگزینش کنیم.")}</span></div></div>
            <div className="auth-step"><strong>03</strong><div><strong>{t("Subscribe securely", "اشتراک امن")}</strong><span><RefreshCw size={13} /> {t("$25 yearly; cancel any time.", "سالانه ۲۵ دلار؛ هر زمان لغو کنید.")}</span></div></div>
          </div>
          <p className="privacy-inline"><Check size={15} /> {t("Your inventory is encrypted before it is stored.", "ترازنامه شما پیش از ذخیره شدن رمزگذاری می‌شود.")}</p>
        </div>
        <JoinForm />
      </section>
      <SiteFooter />
    </main>
  );
}
