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
        <p>{t("Last updated September 18, 2026", "آخرین به‌روزرسانی: ۱۸ سپتامبر ۲۰۲۶")}</p>
        <div className="legal-card dashboard-card">
          <section><h2>{t("Privacy is part of the product", "حریم خصوصی بخشی از محصول است")}</h2><p>{t("Recovery Inventory lets you choose a fully anonymous account using an alias and recovery code, or an email account using one-time verification codes. Your inventory content is encrypted before it is stored.", "Recovery Inventory به شما اجازه می‌دهد یک حساب کاملاً ناشناس با نام مستعار و کد بازیابی، یا یک حساب ایمیلی با کدهای تأیید یک‌بارمصرف انتخاب کنید. محتوای ترازنامه پیش از ذخیره شدن رمزگذاری می‌شود.")}</p></section>
          <section><h2>{t("Information we process", "اطلاعاتی که پردازش می‌کنیم")}</h2><ul><li>{t("Your alias or display name, and your email address only if you choose email access or add it later.", "نام مستعار یا نام نمایشی شما، و فقط در صورت انتخاب ورود ایمیلی یا افزودن آن در آینده، آدرس ایمیل شما.")}</li><li>{t("A one-way hash of an anonymous recovery code, plus short-lived hashed email verification codes when email access is used.", "نسخه هش‌شده یک‌طرفه کد بازیابی ناشناس، و هنگام استفاده از ورود ایمیلی، کدهای تأیید هش‌شده و کوتاه‌مدت.")}</li><li>{t("Encrypted Step 4 and Step 10 entries, dates, and basic account settings.", "مطالب رمزگذاری‌شده گام ۴ و گام ۱۰، تاریخ‌ها و تنظیمات پایه حساب.")}</li><li>{t("Subscription status and Stripe customer identifiers—not full card details.", "وضعیت عضویت و شناسه‌های مشتری Stripe — نه اطلاعات کامل کارت.")}</li><li>{t("Limited technical and security logs provided by our hosting service.", "گزارش‌های فنی و امنیتی محدود که توسط سرویس میزبانی ارائه می‌شود.")}</li></ul></section>
          <section><h2>{t("Payments", "پرداخت‌ها")}</h2><p>{t("Stripe processes payments and may request an email address, billing address, or other information required to complete a transaction. Stripe handles that information under its own privacy policy. Recovery Inventory does not receive your full card number.", "Stripe پرداخت‌ها را پردازش می‌کند و ممکن است ایمیل، آدرس صورتحساب یا اطلاعات دیگری را که برای تکمیل تراکنش لازم است درخواست کند. Stripe این اطلاعات را مطابق سیاست حریم خصوصی خود مدیریت می‌کند. Recovery Inventory شماره کامل کارت شما را دریافت نمی‌کند.")}</p></section>
          <section><h2>{t("How information is used", "نحوه استفاده از اطلاعات")}</h2><p>{t("We use information only to operate the journal, protect accounts, send requested sign-in or verification messages, provide support, process memberships, and comply with law. We do not sell inventory content or use it for advertising.", "ما اطلاعات را فقط برای اجرای دفتر، محافظت از حساب‌ها، ارسال پیام‌های درخواستی ورود یا تأیید، ارائه پشتیبانی، پردازش عضویت و رعایت قانون استفاده می‌کنیم. محتوای ترازنامه را نمی‌فروشیم و برای تبلیغات استفاده نمی‌کنیم.")}</p></section>
          <section><h2>{t("Your choices", "انتخاب‌های شما")}</h2><p>{t("You may stay fully anonymous or add verified email access to the same account later. Adding email does not move or copy your inventory; it keeps the same account and progress. You decide whether to share, print, or export an inventory. You can manage or cancel your subscription through the Stripe billing portal.", "می‌توانید کاملاً ناشناس بمانید یا بعداً ورود با ایمیل تأییدشده را به همان حساب اضافه کنید. افزودن ایمیل ترازنامه شما را منتقل یا کپی نمی‌کند؛ همان حساب و پیشرفت حفظ می‌شود. شما تصمیم می‌گیرید که ترازنامه را به اشتراک بگذارید، چاپ یا صادر کنید. می‌توانید عضویت را از طریق پنل پرداخت Stripe مدیریت یا لغو کنید.")}</p></section>
          <section><h2>{t("Security and limits", "امنیت و محدودیت‌ها")}</h2><p>{t("We use encryption in transit, encrypted inventory storage, hashed recovery and verification codes, restricted session cookies, short code expiration, and attempt limits. No online service can promise absolute security. A fully anonymous account cannot be recovered if its recovery code is lost; members who add verified email access can request a new sign-in code.", "ما از رمزگذاری هنگام انتقال، ذخیره‌سازی رمزگذاری‌شده ترازنامه، کدهای بازیابی و تأیید هش‌شده، کوکی‌های نشست محدود، زمان انقضای کوتاه کد و محدودیت تلاش استفاده می‌کنیم. هیچ سرویس آنلاین نمی‌تواند امنیت مطلق را تضمین کند. اگر کد بازیابی حساب کاملاً ناشناس گم شود، حساب قابل بازیابی نیست؛ اعضایی که ایمیل تأییدشده اضافه می‌کنند می‌توانند کد ورود جدید درخواست کنند.")}</p></section>
          <section><h2>{t("Contact", "تماس")}</h2><p>{t("Privacy questions: support@recoveryinventory.com", "پرسش‌های مربوط به حریم خصوصی: support@recoveryinventory.com")}</p></section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
