"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  FileDown,
  Fingerprint,
  Globe2,
  HeartHandshake,
  KeyRound,
  LockKeyhole,
  MoonStar,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { SiteFooter } from "@/components/recovery/site-footer";
import { useLanguage } from "@/components/recovery/language-provider";

type PreviewMode = "step10" | "step4";

export default function Home() {
  const { language, t } = useLanguage();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("step10");
  const arrowClass = language === "fa" ? "rotate-180" : "";

  const faqs = [
    {
      question: t("Can I stay anonymous?", "آیا می‌توانم ناشناس بمانم؟"),
      answer: t(
        "Yes. You can use an alias and sign in with a private recovery code instead of an email address. Stripe may collect the billing details it needs to process payment.",
        "بله. می‌توانید از نام مستعار استفاده کنید و به جای ایمیل با کد بازیابی خصوصی وارد شوید. Stripe ممکن است اطلاعات لازم برای پردازش پرداخت را دریافت کند."
      ),
    },
    {
      question: t("What if I lose my recovery code?", "اگر کد بازیابی‌ام را گم کنم چه می‌شود؟"),
      answer: t(
        "Because no email is attached to your account, the code cannot be emailed back to you. Save or print it when your account is created and keep it somewhere private.",
        "چون ایمیلی به حساب شما متصل نیست، کد را نمی‌توان برایتان ایمیل کرد. هنگام ایجاد حساب آن را ذخیره یا چاپ کنید و در جایی امن نگه دارید."
      ),
    },
    {
      question: t("Can I cancel at any time?", "آیا هر زمان می‌توانم لغو کنم؟"),
      answer: t(
        "Yes. Open Membership inside your account and choose Manage billing. Your access continues through the period you already paid for.",
        "بله. در حساب خود بخش عضویت را باز کرده و مدیریت پرداخت را انتخاب کنید. دسترسی شما تا پایان دوره‌ای که پرداخت کرده‌اید ادامه دارد."
      ),
    },
    {
      question: t("Can I share an inventory with my sponsor?", "آیا می‌توانم ترازنامه را با حامی خود به اشتراک بگذارم؟"),
      answer: t(
        "Yes. You choose when to share. Use your device’s share menu, copy a private summary, or print and save a PDF.",
        "بله. زمان اشتراک‌گذاری را خودتان انتخاب می‌کنید. از منوی اشتراک دستگاه استفاده کنید، خلاصه خصوصی را کپی کنید یا فایل PDF ذخیره کنید."
      ),
    },
  ];

  return (
    <main className="landing-page landing-v2">
      <SiteHeader />

      <section className="ri-hero">
        <div className="ri-hero-shape ri-hero-shape-one" aria-hidden="true" />
        <div className="ri-hero-shape ri-hero-shape-two" aria-hidden="true" />

        <div className="ri-hero-copy">
          <div className="ri-eyebrow">
            <span className="ri-eyebrow-dot" aria-hidden="true" />
            {t("Private recovery reflection", "تأمل خصوصی در مسیر بهبودی")}
          </div>
          <h1>
            {t("Make space for an ", "فضایی برای یک ")}
            <em>{t("honest look", "نگاه صادقانه")}</em>
            {t(" at today.", " به امروز بسازید.")}
          </h1>
          <p>
            {t(
              "A calm, guided home for Step 10 and Step 4 inventories—designed to help you notice patterns, practice principles, and move forward one day at a time.",
              "فضایی آرام و هدایت‌شده برای ترازنامه‌های گام دهم و گام چهارم؛ برای دیدن الگوها، تمرین اصول و ادامه مسیر، فقط برای امروز."
            )}
          </p>
          <div className="ri-hero-actions">
            <a href="/demo" className="button button-primary button-large">
              {t("Explore the free demo", "مشاهده نسخه آزمایشی رایگان")}
              <ArrowRight className={arrowClass} size={18} />
            </a>
            <a href="/join" className="ri-text-cta">
              {t("Join anonymously", "عضویت ناشناس")}
              <span aria-hidden="true">$25/{t("year", "سال")}</span>
            </a>
          </div>
          <div className="ri-hero-trust" aria-label={t("Membership highlights", "ویژگی‌های عضویت")}>
            <span><ShieldCheck size={17} />{t("No email required", "بدون نیاز به ایمیل")}</span>
            <span><Globe2 size={17} />{t("English + Farsi", "انگلیسی و فارسی")}</span>
            <span><CalendarDays size={17} />{t("Your history, year by year", "سابقه شما، سال‌به‌سال")}</span>
          </div>
        </div>

        <div className="ri-hero-demo">
          <div className="ri-demo-aura" aria-hidden="true" />
          <div className="ri-preview-shell">
            <div className="ri-preview-header">
              <div>
                <span>{t("Private workspace", "فضای کاری خصوصی")}</span>
                <strong>{t("Tonight’s reflection", "تأمل امشب")}</strong>
              </div>
              <span className="ri-private-badge"><LockKeyhole size={13} />{t("Only you", "فقط شما")}</span>
            </div>

            <div className="ri-preview-switch" role="tablist" aria-label={t("Choose inventory preview", "انتخاب پیش‌نمایش ترازنامه")}>
              <button
                type="button"
                role="tab"
                aria-selected={previewMode === "step10"}
                className={previewMode === "step10" ? "is-active" : ""}
                onClick={() => setPreviewMode("step10")}
              >
                <span>10</span>{t("Daily", "روزانه")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={previewMode === "step4"}
                className={previewMode === "step4" ? "is-active" : ""}
                onClick={() => setPreviewMode("step4")}
              >
                <span>4</span>{t("Personal", "شخصی")}
              </button>
            </div>

            <div className="ri-preview-body" key={previewMode}>
              {previewMode === "step10" ? (
                <>
                  <div className="ri-preview-summary">
                    <div className="ri-score-ring"><strong>18</strong><span>/24</span></div>
                    <div>
                      <span>{t("Principles practiced", "اصول تمرین‌شده")}</span>
                      <strong>{t("A thoughtful day", "روزی آگاهانه")}</strong>
                      <p>{t("There is progress here—and room to grow.", "در اینجا پیشرفت هست و جا برای رشد.")}</p>
                    </div>
                  </div>
                  <div className="ri-principle-list">
                    {[
                      [t("Honesty", "صداقت"), t("Practiced", "تمرین شد"), "good"],
                      [t("Patience", "صبر"), t("Needs attention", "نیازمند توجه"), "care"],
                      [t("Healthy boundaries", "مرزهای سالم"), t("Practiced", "تمرین شد"), "good"],
                      [t("Gratitude", "قدردانی"), t("Practiced", "تمرین شد"), "good"],
                    ].map(([label, status, tone]) => (
                      <div key={label}>
                        <span className={`ri-status-dot ${tone}`} aria-hidden="true" />
                        <strong>{label}</strong>
                        <small>{status}</small>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="ri-step4-title">
                    <span><NotebookPen size={17} />{t("A clear working guide", "راهنمای کاری روشن")}</span>
                    <strong>{t("What am I ready to understand?", "آماده‌ام چه چیزی را درک کنم؟")}</strong>
                  </div>
                  <div className="ri-step4-list">
                    {[
                      [t("Resentments", "رنجش‌ها"), "03"],
                      [t("Fears", "ترس‌ها"), "02"],
                      [t("Relationship patterns", "الگوهای رابطه"), "04"],
                      [t("Strengths", "نقاط قوت"), "06"],
                    ].map(([label, count], index) => (
                      <div key={label}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{label}</strong>
                        <small>{count}</small>
                      </div>
                    ))}
                  </div>
                  <div className="ri-step4-note"><Sparkles size={15} />{t("One honest entry at a time.", "هر بار، یک نوشته صادقانه.")}</div>
                </>
              )}
            </div>

            <a href={`/demo?step=${previewMode === "step10" ? "10" : "4"}`} className="ri-preview-link">
              {t("Open this demo", "باز کردن این نسخه آزمایشی")}
              <ArrowRight className={arrowClass} size={16} />
            </a>
          </div>
          <div className="ri-floating-card ri-floating-streak">
            <MoonStar size={18} />
            <div><strong>21 {t("days", "روز")}</strong><span>{t("A gentle rhythm", "یک روند آرام")}</span></div>
          </div>
          <div className="ri-floating-card ri-floating-secure">
            <Fingerprint size={18} />
            <div><strong>{t("Anonymous", "ناشناس")}</strong><span>{t("Recovery-code access", "ورود با کد بازیابی")}</span></div>
          </div>
        </div>
      </section>

      <section className="ri-trust-strip" aria-label={t("Product features", "ویژگی‌های محصول")}>
        {[
          [LockKeyhole, t("Private by design", "طراحی‌شده برای حریم خصوصی")],
          [CalendarDays, t("Unlimited yearly history", "سابقه سالانه نامحدود")],
          [FileDown, t("Share, print, or save PDF", "اشتراک، چاپ یا ذخیره PDF")],
          [HeartHandshake, t("Made for sponsor conversations", "مناسب گفت‌وگو با حامی")],
        ].map(([Icon, label]) => {
          const FeatureIcon = Icon as typeof LockKeyhole;
          return <div key={String(label)}><FeatureIcon size={20} /><span>{label as string}</span></div>;
        })}
      </section>

      <section className="ri-section ri-practices" id="inventories">
        <div className="ri-section-heading">
          <span>{t("Two practices, one private place", "دو تمرین، یک فضای خصوصی")}</span>
          <h2>{t("Start where you are.", "از همین‌جایی که هستید شروع کنید.")}</h2>
          <p>{t("Guided prompts give your reflection structure without telling you what to feel or what to write.", "پرسش‌های هدایت‌شده به تأمل شما ساختار می‌دهند، بدون اینکه بگویند چه احساسی داشته باشید یا چه بنویسید.")}</p>
        </div>

        <div className="ri-practice-grid">
          <article className="ri-practice-card ri-practice-ten">
            <div className="ri-practice-topline"><span>{t("Nightly check-in", "مرور شبانه")}</span><b>10</b></div>
            <div className="ri-practice-visual" aria-hidden="true">
              <div className="ri-mini-calendar">
                {Array.from({ length: 28 }).map((_, index) => <i key={index} className={index < 19 ? "is-filled" : ""} />)}
              </div>
            </div>
            <h3>{t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم")}</h3>
            <p>{t("Review 24 major principles, notice what needs attention, and choose the next right action.", "۲۴ اصل مهم را مرور کنید، موارد نیازمند توجه را ببینید و اقدام درست بعدی را انتخاب کنید.")}</p>
            <ul>
              <li><Check size={16} />{t("Principles, gratitude, and notes", "اصول، قدردانی و یادداشت‌ها")}</li>
              <li><Check size={16} />{t("A calendar that continues every year", "تقویمی که هر سال ادامه دارد")}</li>
            </ul>
            <a href="/demo?step=10">{t("Try Step 10", "آزمایش گام دهم")}<ArrowRight className={arrowClass} size={17} /></a>
          </article>

          <article className="ri-practice-card ri-practice-four">
            <div className="ri-practice-topline"><span>{t("Deeper reflection", "تأمل عمیق‌تر")}</span><b>4</b></div>
            <div className="ri-practice-visual ri-stack-visual" aria-hidden="true">
              <i /><i /><i />
              <span><NotebookPen size={25} /></span>
            </div>
            <h3>{t("Step 4 Personal Inventory", "ترازنامه شخصی گام چهارم")}</h3>
            <p>{t("Organize resentments, fears, relationship patterns, harms, and strengths in a clear working guide.", "رنجش‌ها، ترس‌ها، الگوهای رابطه، آسیب‌ها و نقاط قوت را در یک راهنمای روشن مرتب کنید.")}</p>
            <ul>
              <li><Check size={16} />{t("Focused, editable sections", "بخش‌های متمرکز و قابل ویرایش")}</li>
              <li><Check size={16} />{t("A sponsor-ready private summary", "خلاصه خصوصی آماده برای حامی")}</li>
            </ul>
            <a href="/demo?step=4">{t("Try Step 4", "آزمایش گام چهارم")}<ArrowRight className={arrowClass} size={17} /></a>
          </article>
        </div>
      </section>

      <section className="ri-section ri-how">
        <div className="ri-section-heading ri-heading-light">
          <span>{t("Quietly simple", "ساده و آرام")}</span>
          <h2>{t("Your private practice in three steps.", "تمرین خصوصی شما در سه گام.")}</h2>
        </div>
        <div className="ri-how-grid">
          {[
            [KeyRound, "01", t("Create without email", "ایجاد حساب بدون ایمیل"), t("Choose an alias and receive a private recovery code.", "یک نام مستعار انتخاب کنید و کد بازیابی خصوصی بگیرید.")],
            [NotebookPen, "02", t("Reflect at your pace", "با سرعت خودتان تأمل کنید"), t("Use Step 10 nightly or open Step 4 whenever you are ready.", "گام دهم را شبانه انجام دهید یا هر زمان آماده بودید گام چهارم را باز کنید.")],
            [Users, "03", t("Share only by choice", "فقط با انتخاب خود به اشتراک بگذارید"), t("Keep it private, or prepare a summary for your sponsor.", "آن را خصوصی نگه دارید یا خلاصه‌ای برای حامی خود آماده کنید.")],
          ].map(([Icon, number, title, copy]) => {
            const StepIcon = Icon as typeof KeyRound;
            return (
              <article key={String(number)}>
                <div><StepIcon size={21} /><span>{number as string}</span></div>
                <h3>{title as string}</h3>
                <p>{copy as string}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ri-section ri-privacy">
        <div className="ri-privacy-copy">
          <span className="ri-section-label"><ShieldCheck size={16} />{t("Privacy without friction", "حریم خصوصی بدون پیچیدگی")}</span>
          <h2>{t("Personal reflection should stay personal.", "تأمل شخصی باید شخصی بماند.")}</h2>
          <p>{t("No public profile. No email required to sign in. Your inventories are stored privately and are not shared unless you decide to share them.", "بدون پروفایل عمومی. بدون نیاز به ایمیل برای ورود. ترازنامه‌های شما خصوصی نگهداری می‌شوند و فقط با تصمیم شما به اشتراک گذاشته می‌شوند.")}</p>
          <div className="ri-privacy-points">
            <span><Check size={16} />{t("Use an alias", "استفاده از نام مستعار")}</span>
            <span><Check size={16} />{t("Access with a recovery code", "ورود با کد بازیابی")}</span>
            <span><Check size={16} />{t("You control every export", "کنترل کامل هر خروجی")}</span>
          </div>
        </div>
        <div className="ri-privacy-card">
          <div className="ri-lock-orbit"><LockKeyhole size={30} /></div>
          <span>{t("Your private workspace", "فضای کاری خصوصی شما")}</span>
          <strong>{t("Nothing is public.", "هیچ‌چیز عمومی نیست.")}</strong>
          <p>{t("Your entries are for you until you choose otherwise.", "نوشته‌های شما برای خودتان است، مگر اینکه خودتان انتخاب دیگری کنید.")}</p>
        </div>
      </section>

      <section className="ri-section ri-membership" id="membership">
        <div className="ri-membership-copy">
          <span>{t("One clear membership", "یک عضویت روشن")}</span>
          <h2>{t("A full year of reflection for less than 50¢ a week.", "یک سال کامل تأمل، کمتر از ۵۰ سنت در هفته.")}</h2>
          <p>{t("Both inventories, your ongoing history, and every sharing option are included. No confusing plans or upgrades.", "هر دو ترازنامه، سابقه مداوم و همه گزینه‌های اشتراک‌گذاری شامل می‌شوند. بدون طرح‌ها یا ارتقاهای گیج‌کننده.")}</p>
          <div className="ri-included">
            <span><NotebookPen size={18} />{t("Unlimited Step 10 and Step 4 entries", "ترازنامه نامحدود گام ۱۰ و ۴")}</span>
            <span><CalendarDays size={18} />{t("Continuous year-by-year calendar", "تقویم پیوسته سال‌به‌سال")}</span>
            <span><FileDown size={18} />{t("Share, print, and PDF export", "اشتراک، چاپ و خروجی PDF")}</span>
          </div>
        </div>
        <div className="ri-price-card">
          <div className="ri-price-top"><span>{t("Annual membership", "عضویت سالانه")}</span><span>{t("Best value", "بهترین ارزش")}</span></div>
          <div className="ri-price"><strong>$25</strong><span>/{t("year", "سال")}</span></div>
          <p>{t("Renews annually until canceled.", "تا زمان لغو، سالانه تمدید می‌شود.")}</p>
          <a href="/join" className="button button-primary button-large button-full">
            {t("Create my private account", "ایجاد حساب خصوصی من")}
            <ArrowRight className={arrowClass} size={18} />
          </a>
          <small><LockKeyhole size={13} />{t("Secure payment · Cancel anytime", "پرداخت امن · لغو در هر زمان")}</small>
        </div>
      </section>

      <section className="ri-section ri-faq">
        <div className="ri-section-heading">
          <span>{t("Good to know", "خوب است بدانید")}</span>
          <h2>{t("Clear answers, before you begin.", "پاسخ‌های روشن، پیش از شروع.")}</h2>
        </div>
        <div className="ri-faq-list">
          {faqs.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary><span>{item.question}</span><ChevronDown size={19} /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ri-final-cta">
        <div className="ri-final-glow" aria-hidden="true" />
        <div>
          <span><Sparkles size={16} />{t("A few quiet minutes can change the tone of tomorrow.", "چند دقیقه آرام می‌تواند حال‌وهوای فردا را تغییر دهد.")}</span>
          <h2>{t("Begin with one honest check-in.", "با یک مرور صادقانه شروع کنید.")}</h2>
        </div>
        <a href="/demo" className="button button-light button-large">
          {t("Open the free demo", "باز کردن نسخه آزمایشی رایگان")}
          <ArrowRight className={arrowClass} size={18} />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
