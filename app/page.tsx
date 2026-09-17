"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileDown,
  Globe2,
  LockKeyhole,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { SiteFooter } from "@/components/recovery/site-footer";
import { useLanguage } from "@/components/recovery/language-provider";

const week = [0, 1, 2, 3, 4, 5, 6];

export default function Home() {
  const { language, t } = useLanguage();
  const arrowClass = language === "fa" ? "rotate-180" : "";

  return (
    <main className="landing-page">
      <SiteHeader transparent />

      <section className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow">
            <ShieldCheck size={16} />
            {t("Private by design", "طراحی‌شده برای حفظ حریم خصوصی")}
          </div>
          <h1>
            {t(
              "A quiet place to take an honest look at today.",
              "فضایی آرام برای نگاهی صادقانه به امروز."
            )}
          </h1>
          <p className="hero-lead">
            {t(
              "Guided Step 10 and Step 4 inventories that help you notice patterns, practice principles, and keep moving forward—one day at a time.",
              "راهنمای گام دهم و گام چهارم برای دیدن الگوها، تمرین اصول و ادامه مسیر، فقط برای امروز."
            )}
          </p>
          <div className="hero-actions">
            <Link href="/demo" className="button button-primary button-large">
              {t("Try the interactive demo", "نسخه آزمایشی را امتحان کنید")}
              <ArrowRight className={arrowClass} size={18} />
            </Link>
            <Link href="/join" className="button button-secondary button-large">
              {t("Join for $25/year", "عضویت سالانه ۲۵ دلار")}
            </Link>
          </div>
          <div className="hero-assurances">
            <span><Check size={15} />{t("No public profile", "بدون پروفایل عمومی")}</span>
            <span><Check size={15} />{t("Cancel anytime", "لغو در هر زمان")}</span>
            <span><Check size={15} />{t("English + Farsi", "انگلیسی و فارسی")}</span>
          </div>
        </div>

        <div className="hero-product" aria-label={t("Inventory preview", "پیش‌نمایش ترازنامه")}>
          <div className="product-orbit orbit-one" aria-hidden="true" />
          <div className="product-orbit orbit-two" aria-hidden="true" />
          <div className="preview-window">
            <div className="preview-topbar">
              <div>
                <span className="preview-kicker">{t("Tonight", "امشب")}</span>
                <strong>{t("Daily inventory", "ترازنامه روزانه")}</strong>
              </div>
              <span className="privacy-pill"><LockKeyhole size={13} />{t("Private", "خصوصی")}</span>
            </div>
            <div className="preview-date-row">
              <div className="preview-score">
                <span>18</span><small>/24</small>
              </div>
              <div>
                <strong>{t("Principles practiced", "اصول تمرین‌شده")}</strong>
                <p>{t("A thoughtful day with room to grow.", "روزی آگاهانه، با فرصت برای رشد.")}</p>
              </div>
            </div>
            <div className="principle-preview-list">
              {[
                [t("Honesty", "صداقت"), 92],
                [t("Patience", "صبر"), 68],
                [t("Healthy boundaries", "مرزهای سالم"), 76],
                [t("Gratitude", "قدردانی"), 86],
              ].map(([label, score]) => (
                <div className="principle-preview" key={String(label)}>
                  <div><span>{label}</span><small>{score}%</small></div>
                  <div className="mini-track"><i style={{ width: `${score}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="preview-calendar">
              <div className="calendar-heading">
                <span>{t("September", "سپتامبر")}</span>
                <span>{t("21-day rhythm", "روند ۲۱ روزه")}</span>
              </div>
              <div className="calendar-dots" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, index) => (
                  <i
                    key={index}
                    className={index < 21 && ![4, 11, 17].includes(index) ? "complete" : index < 21 ? "soft" : ""}
                  />
                ))}
              </div>
              <div className="calendar-week" aria-hidden="true">
                {week.map((day) => <span key={day} />)}
              </div>
            </div>
          </div>
          <div className="floating-note">
            <Sparkles size={17} />
            <div><strong>{t("A gentle next step", "قدم بعدی آرام")}</strong><span>{t("Pause before responding.", "پیش از پاسخ دادن مکث کن.")}</span></div>
          </div>
        </div>
      </section>

      <section className="trust-band" aria-label={t("Privacy and access features", "ویژگی‌های حریم خصوصی و دسترسی")}>
        {[
          [LockKeyhole, t("Pseudonymous account", "حساب با نام مستعار")],
          [CalendarDays, t("Year-by-year history", "سابقه سال‌به‌سال")],
          [Globe2, t("English and Farsi", "انگلیسی و فارسی")],
          [FileDown, t("Print or save as PDF", "چاپ یا ذخیره PDF")],
        ].map(([Icon, label]) => {
          const FeatureIcon = Icon as typeof LockKeyhole;
          return <div key={String(label)}><FeatureIcon size={20} /><span>{label as string}</span></div>;
        })}
      </section>

      <section className="section-shell intro-section" id="inventories">
        <div className="section-heading centered-heading">
          <span>{t("Two guided practices", "دو تمرین هدایت‌شده")}</span>
          <h2>{t("Reflect clearly without starting from a blank page.", "بدون روبه‌رو شدن با صفحه خالی، روشن و دقیق تأمل کنید.")}</h2>
          <p>{t("Each inventory uses original, plain-language prompts. Nothing is shared unless you choose to share it.", "هر ترازنامه از پرسش‌های ساده و اختصاصی استفاده می‌کند. هیچ‌چیز بدون انتخاب شما به اشتراک گذاشته نمی‌شود.")}</p>
        </div>

        <div className="inventory-feature-grid">
          <article className="inventory-feature step-ten-card">
            <div className="feature-number">10</div>
            <div className="feature-copy">
              <span className="feature-label">{t("Nightly practice", "تمرین شبانه")}</span>
              <h3>{t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم")}</h3>
              <p>{t("Review 24 recovery principles, name what needs attention, and choose one next right action.", "۲۴ اصل بهبودی را مرور کنید، موارد نیازمند توجه را مشخص کنید و یک اقدام درست بعدی را انتخاب کنید.")}</p>
              <ul>
                <li><Check size={16} />{t("24 major principles", "۲۴ اصل مهم")}</li>
                <li><Check size={16} />{t("Daily notes and gratitude", "یادداشت روزانه و قدردانی")}</li>
                <li><Check size={16} />{t("Yearly calendar view", "نمای تقویم سالانه")}</li>
              </ul>
              <Link href="/demo?step=10">{t("Try Step 10", "آزمایش گام دهم")}<ArrowRight className={arrowClass} size={17} /></Link>
            </div>
          </article>

          <article className="inventory-feature step-four-card">
            <div className="feature-number">4</div>
            <div className="feature-copy">
              <span className="feature-label">{t("Deeper reflection", "تأمل عمیق‌تر")}</span>
              <h3>{t("Step 4 Personal Inventory", "ترازنامه شخصی گام چهارم")}</h3>
              <p>{t("Organize resentments, fears, relationship patterns, harms, and strengths in a clear working guide.", "رنجش‌ها، ترس‌ها، الگوهای رابطه، آسیب‌ها و نقاط قوت را در یک راهنمای روشن مرتب کنید.")}</p>
              <ul>
                <li><Check size={16} />{t("Four focused sections", "چهار بخش متمرکز")}</li>
                <li><Check size={16} />{t("Editable entries", "موارد قابل ویرایش")}</li>
                <li><Check size={16} />{t("Sponsor-ready export", "خروجی آماده برای حامی")}</li>
              </ul>
              <Link href="/demo?step=4">{t("Try Step 4", "آزمایش گام چهارم")}<ArrowRight className={arrowClass} size={17} /></Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section-shell privacy-section">
        <div className="privacy-panel">
          <div className="privacy-icon"><LockKeyhole size={28} /></div>
          <div className="privacy-copy">
            <span>{t("Anonymous where it matters", "ناشناس، در جایی که اهمیت دارد")}</span>
            <h2>{t("Your recovery is personal. Your account can be, too.", "بهبودی شما شخصی است. حساب شما هم می‌تواند شخصی بماند.")}</h2>
            <p>{t("Choose an alias instead of using your real name. You receive a private recovery code instead of signing in with email. Your inventory is never public.", "به جای نام واقعی، یک نام مستعار انتخاب کنید. به جای ورود با ایمیل، یک کد بازیابی خصوصی دریافت می‌کنید. ترازنامه شما هرگز عمومی نیست.")}</p>
          </div>
          <div className="privacy-facts">
            <div><strong>01</strong><span>{t("Choose an alias", "انتخاب نام مستعار")}</span></div>
            <div><strong>02</strong><span>{t("Save your recovery code", "ذخیره کد بازیابی")}</span></div>
            <div><strong>03</strong><span>{t("Write privately", "نوشتن خصوصی")}</span></div>
          </div>
        </div>
      </section>

      <section className="section-shell membership-section" id="membership">
        <div className="membership-copy">
          <span className="section-kicker">{t("One simple membership", "یک عضویت ساده")}</span>
          <h2>{t("A full year of private reflection for less than 50¢ a week.", "یک سال کامل تأمل خصوصی، کمتر از ۵۰ سنت در هفته.")}</h2>
          <p>{t("Use both inventories as often as you need. Your subscription renews once a year and can be canceled at any time through the secure billing portal.", "هر دو ترازنامه را هر زمان که نیاز دارید استفاده کنید. اشتراک سالی یک‌بار تمدید می‌شود و هر زمان می‌توانید آن را از طریق بخش امن پرداخت لغو کنید.")}</p>
          <div className="membership-benefits">
            <span><NotebookPen size={18} />{t("Unlimited Step 10 and Step 4 entries", "تعداد نامحدود ترازنامه گام ۱۰ و ۴")}</span>
            <span><Users size={18} />{t("Share, print, or save for your sponsor", "اشتراک، چاپ یا ذخیره برای حامی")}</span>
            <span><CalendarDays size={18} />{t("Ongoing yearly history", "سابقه سالانه بدون محدودیت")}</span>
          </div>
        </div>
        <div className="price-card">
          <span className="price-label">{t("Annual membership", "عضویت سالانه")}</span>
          <div className="price"><strong>$25</strong><span>{t("per year", "در سال")}</span></div>
          <p>{t("Automatically renews yearly until canceled.", "تا زمان لغو، هر سال به‌طور خودکار تمدید می‌شود.")}</p>
          <Link href="/join" className="button button-primary button-large button-full">
            {t("Create an anonymous account", "ایجاد حساب ناشناس")}
            <ArrowRight className={arrowClass} size={18} />
          </Link>
          <small>{t("Secure payment processing. Cancel anytime.", "پرداخت امن. امکان لغو در هر زمان.")}</small>
        </div>
      </section>

      <section className="section-shell faq-section">
        <div className="section-heading">
          <span>{t("Good to know", "خوب است بدانید")}</span>
          <h2>{t("Straight answers about privacy and membership.", "پاسخ‌های روشن درباره حریم خصوصی و عضویت.")}</h2>
        </div>
        <div className="faq-grid">
          <article><h3>{t("Is it completely anonymous?", "آیا کاملاً ناشناس است؟")}</h3><p>{t("Recovery Inventory does not require your real name or email for sign-in. Stripe processes your payment and may collect billing information required to complete it.", "Recovery Inventory برای ورود به نام واقعی یا ایمیل شما نیاز ندارد. Stripe پرداخت را پردازش می‌کند و ممکن است اطلاعات لازم برای پرداخت را دریافت کند.")}</p></article>
          <article><h3>{t("How do I return to my account?", "چگونه دوباره وارد حساب شوم؟")}</h3><p>{t("You receive a private recovery code when you create your account. Keep it somewhere safe; it replaces an email-based password reset.", "هنگام ایجاد حساب یک کد بازیابی خصوصی دریافت می‌کنید. آن را در جای امن نگه دارید؛ این کد جایگزین بازیابی رمز از طریق ایمیل است.")}</p></article>
          <article><h3>{t("Can I cancel at any time?", "آیا هر زمان می‌توانم لغو کنم؟")}</h3><p>{t("Yes. Open Membership inside your account and choose Manage billing. Your access continues through the paid period.", "بله. در حساب خود بخش عضویت را باز کرده و مدیریت پرداخت را انتخاب کنید. دسترسی شما تا پایان دوره پرداخت‌شده ادامه دارد.")}</p></article>
          <article><h3>{t("Can I share an inventory?", "آیا می‌توانم ترازنامه را به اشتراک بگذارم؟")}</h3><p>{t("Yes. You can use your device’s share menu, copy a private summary, or print and save the inventory as a PDF for your sponsor.", "بله. می‌توانید از منوی اشتراک دستگاه استفاده کنید، خلاصه را کپی کنید یا ترازنامه را چاپ و به صورت PDF برای حامی ذخیره کنید.")}</p></article>
        </div>
      </section>

      <section className="final-cta">
        <div>
          <span>{t("Begin with a demo", "با نسخه آزمایشی شروع کنید")}</span>
          <h2>{t("Take five quiet minutes for yourself.", "پنج دقیقه آرام برای خودتان وقت بگذارید.")}</h2>
        </div>
        <Link href="/demo" className="button button-light button-large">
          {t("Open the inventory demo", "باز کردن نسخه آزمایشی")}
          <ArrowRight className={arrowClass} size={18} />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
