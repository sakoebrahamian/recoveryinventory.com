"use client";

import { SiteFooter } from "@/components/recovery/site-footer";
import { SiteHeader } from "@/components/recovery/site-header";
import { useLanguage } from "@/components/recovery/language-provider";

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <main className="inner-page">
      <SiteHeader />
      <article className="legal-shell">
        <h1>{t("Terms of use", "شرایط استفاده")}</h1>
        <p>{t("Last updated September 17, 2026", "آخرین به‌روزرسانی: ۱۷ سپتامبر ۲۰۲۶")}</p>
        <div className="legal-card dashboard-card">
          <section><h2>{t("Purpose of the service", "هدف سرویس")}</h2><p>{t("Recovery Inventory is a private self-reflection and journaling tool. It is not treatment, medical or mental-health advice, crisis support, or a substitute for professional care.", "Recovery Inventory ابزاری خصوصی برای خوداندیشی و یادداشت‌نویسی است. این ابزار درمان، توصیه پزشکی یا سلامت روان، پشتیبانی بحران یا جایگزین مراقبت حرفه‌ای نیست.")}</p></section>
          <section><h2>{t("Independent service", "سرویس مستقل")}</h2><p>{t("Recovery Inventory is not affiliated with or endorsed by Alcoholics Anonymous, Narcotics Anonymous, AAWS, NAWS, or any other twelve-step fellowship. References to Step 4 and Step 10 describe general recovery practices; the prompts are original to this service.", "Recovery Inventory وابسته یا مورد تأیید انجمن الکلی‌های گمنام، معتادان گمنام، AAWS، NAWS یا هیچ انجمن دوازده‌قدمی دیگری نیست. اشاره به گام ۴ و گام ۱۰ برای توصیف شیوه‌های عمومی بهبودی است و پرسش‌ها برای این سرویس نوشته شده‌اند.")}</p></section>
          <section><h2>{t("Membership and renewal", "عضویت و تمدید")}</h2><p>{t("Membership costs $25 per year and automatically renews each year until canceled. You may cancel at any time in the billing portal; cancellation normally takes effect at the end of the current paid period. Except where required by law, completed payments are non-refundable.", "هزینه عضویت سالانه ۲۵ دلار است و تا زمان لغو، هر سال به‌طور خودکار تمدید می‌شود. می‌توانید هر زمان در پنل پرداخت لغو کنید؛ لغو معمولاً در پایان دوره پرداخت‌شده جاری اعمال می‌شود. به‌جز موارد الزامی قانونی، پرداخت‌های تکمیل‌شده قابل بازپرداخت نیستند.")}</p></section>
          <section><h2>{t("Account responsibility", "مسئولیت حساب")}</h2><p>{t("You are responsible for keeping your recovery code private and for activity through your session. We cannot restore access if the code is lost. Do not share a recovery code with a sponsor or anyone else; use the separate share or print controls for an inventory.", "شما مسئول حفظ محرمانگی کد بازیابی و فعالیت‌های نشست خود هستید. اگر کد گم شود، نمی‌توانیم دسترسی را بازگردانیم. کد بازیابی را با حامی یا شخص دیگری به اشتراک نگذارید؛ برای ترازنامه از کنترل‌های جداگانه اشتراک یا چاپ استفاده کنید.")}</p></section>
          <section><h2>{t("Acceptable use", "استفاده قابل قبول")}</h2><p>{t("Do not use the service to harm others, break the law, interfere with security, or attempt unauthorized access. We may restrict service when reasonably necessary to protect users or the platform.", "از سرویس برای آسیب به دیگران، نقض قانون، اختلال در امنیت یا تلاش برای دسترسی غیرمجاز استفاده نکنید. در صورت لزوم برای حفاظت از کاربران یا پلتفرم، ممکن است دسترسی محدود شود.")}</p></section>
          <section><h2>{t("Availability and liability", "دسترسی‌پذیری و مسئولیت")}</h2><p>{t("The service is provided on an as-available basis. Keep copies of any material you cannot afford to lose. To the extent allowed by law, Recovery Inventory is not liable for indirect or consequential loss arising from use or unavailability of the service.", "سرویس بر اساس میزان دسترسی ارائه می‌شود. از مطالبی که نمی‌توانید از دست بدهید نسخه پشتیبان نگه دارید. تا حد مجاز قانون، Recovery Inventory مسئول زیان‌های غیرمستقیم یا تبعی ناشی از استفاده یا عدم دسترسی به سرویس نیست.")}</p></section>
          <section><h2>{t("Contact", "تماس")}</h2><p>{t("Questions about these terms: support@recoveryinventory.com", "پرسش درباره این شرایط: support@recoveryinventory.com")}</p></section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
