"use client";

import { SiteFooter } from "@/components/recovery/site-footer";
import { SiteHeader } from "@/components/recovery/site-header";
import { useLanguage } from "@/components/recovery/language-provider";

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <main className="inner-page">
      <SiteHeader />
      <article className="legal-shell">
        <h1>{t("Privacy policy", "سیاست حریم خصوصی")}</h1>
        <p>{t("Last updated September 17, 2026", "آخرین به‌روزرسانی: ۱۷ سپتامبر ۲۰۲۶")}</p>
        <div className="legal-card dashboard-card">
          <section><h2>{t("Privacy is part of the product", "حریم خصوصی بخشی از محصول است")}</h2><p>{t("Recovery Inventory lets you use an alias and recovery code instead of giving us your name or email address. Your inventory content is encrypted before it is stored.", "Recovery Inventory به شما اجازه می‌دهد به‌جای ارائه نام یا ایمیل، از نام مستعار و کد بازیابی استفاده کنید. محتوای ترازنامه پیش از ذخیره شدن رمزگذاری می‌شود.")}</p></section>
          <section><h2>{t("Information we process", "اطلاعاتی که پردازش می‌کنیم")}</h2><ul><li>{t("The alias you choose and a one-way hash of your recovery code.", "نام مستعار انتخابی شما و نسخه هش‌شده یک‌طرفه کد بازیابی.")}</li><li>{t("Encrypted Step 4 and Step 10 entries, dates, and basic account settings.", "مطالب رمزگذاری‌شده گام ۴ و گام ۱۰، تاریخ‌ها و تنظیمات پایه حساب.")}</li><li>{t("Subscription status and Stripe customer identifiers—not full card details.", "وضعیت عضویت و شناسه‌های مشتری Stripe — نه اطلاعات کامل کارت.")}</li><li>{t("Limited technical and security logs provided by our hosting service.", "گزارش‌های فنی و امنیتی محدود که توسط سرویس میزبانی ارائه می‌شود.")}</li></ul></section>
          <section><h2>{t("Payments", "پرداخت‌ها")}</h2><p>{t("Stripe processes payments and may request an email address, billing address, or other information required to complete a transaction. Stripe handles that information under its own privacy policy. Recovery Inventory does not receive your full card number.", "Stripe پرداخت‌ها را پردازش می‌کند و ممکن است ایمیل، آدرس صورتحساب یا اطلاعات دیگری را که برای تکمیل تراکنش لازم است درخواست کند. Stripe این اطلاعات را مطابق سیاست حریم خصوصی خود مدیریت می‌کند. Recovery Inventory شماره کامل کارت شما را دریافت نمی‌کند.")}</p></section>
          <section><h2>{t("How information is used", "نحوه استفاده از اطلاعات")}</h2><p>{t("We use information only to operate the journal, protect accounts, provide support, process memberships, and comply with law. We do not sell inventory content or use it for advertising.", "ما اطلاعات را فقط برای اجرای دفتر، محافظت از حساب‌ها، ارائه پشتیبانی، پردازش عضویت و رعایت قانون استفاده می‌کنیم. محتوای ترازنامه را نمی‌فروشیم و برای تبلیغات استفاده نمی‌کنیم.")}</p></section>
          <section><h2>{t("Your choices", "انتخاب‌های شما")}</h2><p>{t("You decide whether to share, print, or export an inventory. You can manage or cancel your subscription through the Stripe billing portal. To request deletion of an account and its inventories, contact support@recoveryinventory.com from the billing email used with Stripe and include the account alias. Never send your recovery code by email.", "شما تصمیم می‌گیرید که آیا ترازنامه را به اشتراک بگذارید، چاپ یا صادر کنید. می‌توانید عضویت را از طریق پنل پرداخت Stripe مدیریت یا لغو کنید. برای درخواست حذف حساب و ترازنامه‌ها، از ایمیل صورتحساب استفاده‌شده در Stripe به support@recoveryinventory.com پیام دهید و نام مستعار حساب را ذکر کنید. هرگز کد بازیابی خود را با ایمیل ارسال نکنید.")}</p></section>
          <section><h2>{t("Security and limits", "امنیت و محدودیت‌ها")}</h2><p>{t("We use encryption in transit, encrypted inventory storage, hashed recovery codes, and restricted session cookies. No online service can promise absolute security. If you lose your recovery code, we cannot reset it by email.", "ما از رمزگذاری هنگام انتقال، ذخیره‌سازی رمزگذاری‌شده ترازنامه، کدهای بازیابی هش‌شده و کوکی‌های نشست محدود استفاده می‌کنیم. هیچ سرویس آنلاین نمی‌تواند امنیت مطلق را تضمین کند. اگر کد بازیابی را گم کنید، امکان بازنشانی آن با ایمیل وجود ندارد.")}</p></section>
          <section><h2>{t("Contact", "تماس")}</h2><p>{t("Privacy questions: support@recoveryinventory.com", "پرسش‌های مربوط به حریم خصوصی: support@recoveryinventory.com")}</p></section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
