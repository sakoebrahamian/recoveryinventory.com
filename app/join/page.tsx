"use client";

import { Check, KeyRound, LockKeyhole, Mail, RefreshCw } from "lucide-react";
import { JoinForm } from "@/components/recovery/join-form";
import { AnalyticsFeatureGuide } from "@/components/recovery/analytics-feature-guide";
import { InventoryGuideNotice } from "@/components/recovery/inventory-guide-promo";
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
          <h1>{t("Create your free Recovery Inventory account.", "حساب رایگان Recovery Inventory خود را بسازید.")}</h1>
          <p>{t("Save up to 30 daily Step 10 entries in your first 30 days. No card and no automatic payment. Your entries stay in this account when you upgrade, and remain readable and exportable after the 30-day free period.", "در ۳۰ روز اول تا ۳۰ ترازنامه روزانه گام ۱۰ ذخیره کنید. بدون کارت و بدون پرداخت خودکار. هنگام ارتقا، نوشته‌ها در همین حساب می‌مانند و پس از دوره رایگان ۳۰ روزه نیز قابل خواندن و خروجی گرفتن هستند.")}</p>
          <p>{t("Create an anonymous account with a private alias, username, and password, or choose verified email access. Anonymous members also receive a recovery code and must copy or download it before continuing.", "یک حساب ناشناس با نام مستعار، نام کاربری و رمز عبور خصوصی بسازید، یا ورود با ایمیل تأییدشده را انتخاب کنید. اعضای ناشناس همچنین یک کد بازیابی دریافت می‌کنند و باید پیش از ادامه آن را کپی یا دانلود کنند.")}</p>
          <div className="auth-steps">
            <div className="auth-step"><strong><KeyRound size={18} /></strong><div><strong>{t("Anonymous account", "حساب ناشناس")}</strong><span>{t("No real name or email required. Use a username and password, then copy or download your recovery code.", "نام واقعی یا ایمیل لازم نیست. از نام کاربری و رمز عبور استفاده کنید و سپس کد بازیابی خود را کپی یا دانلود کنید.")}</span></div></div>
            <div className="auth-step"><strong><Mail size={18} /></strong><div><strong>{t("Email account", "حساب ایمیلی")}</strong><span>{t("Sign in and recover access using one-time email codes.", "با کدهای یک‌بارمصرف ایمیلی وارد شوید و دسترسی را بازیابی کنید.")}</span></div></div>
            <div className="auth-step"><strong>03</strong><div><strong>{t("Start free; upgrade whenever you choose", "رایگان شروع کنید؛ هر زمان خواستید ارتقا دهید")}</strong><span><RefreshCw size={13} /> {t("Optional subscription: $4.99 monthly or $25 yearly. Your free entries stay in the same account.", "اشتراک اختیاری: ماهانه ۴٫۹۹ دلار یا سالانه ۲۵ دلار. نوشته‌های رایگان در همان حساب می‌مانند.")}</span></div></div>
          </div>
          <InventoryGuideNotice />
          <p className="privacy-inline"><Check size={15} /> {t("Existing anonymous and email members can add username-and-password access without losing inventories, analytics, or website subscription progress.", "اعضای ناشناس و ایمیلی موجود می‌توانند بدون از دست دادن ترازنامه‌ها، تحلیل‌ها یا پیشرفت اشتراک وب‌سایت، ورود با نام کاربری و رمز عبور را اضافه کنند.")}</p>
          <p className="privacy-inline"><Check size={15} /> {t("Website subscription includes 39 Step 10 questions across 24 principles, separate follow-up answers, principle labels, matching inventory charts, weekly writing examples, a Sponsor summary, and a Full journal export. Share your report only when you choose.", "اشتراک وب‌سایت شامل ۳۹ پرسش گام ۱۰ درباره ۲۴ اصل، پاسخ‌های جداگانه برای پرسش‌های تکمیلی، نمایش اصل هر پرسش، نمودارهای هماهنگ ترازنامه، نمونه نوشته‌های هفتگی، «خلاصه برای حامی» و خروجی «دفتر کامل» است. گزارش خود را فقط با انتخاب خودتان به اشتراک بگذارید.")}</p>
        </div>
        <JoinForm />
      </section>
      <AnalyticsFeatureGuide compact />
      <SiteFooter />
    </main>
  );
}
