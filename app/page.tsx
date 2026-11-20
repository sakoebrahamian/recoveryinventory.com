"use client";

import { isRtlLanguage } from "@/lib/languages";

import { useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  ChevronDown,
  Globe2,
  LockKeyhole,
  NotebookPen,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { subscriptionGuidance } from "@/lib/recovery-guidance";
import { InventoryGuideShowcase } from "@/components/recovery/inventory-guide-promo";
import { SiteFooter } from "@/components/recovery/site-footer";
import { useLanguage } from "@/components/recovery/language-provider";
import { questionWithPrinciple, step10Questions } from "@/lib/inventory";
import { SubscriptionPlanPicker } from "@/components/recovery/subscription-plans";
import type { BillingPlan } from "@/lib/subscription-plans";
import { aboutCopy, aboutLanguageRoutes } from "@/lib/about-content";
import { RECOVERY_APP_STRUCTURED_DATA } from "@/lib/site-metadata";
import { MemberTestimonials } from "@/components/recovery/member-testimonials";
import { PatternHistoryExample } from "@/components/recovery/pattern-history-example";
import { ExternalMentions } from "@/components/recovery/external-mentions";
import { step10AppCopy, step10AppRoutes } from "@/lib/step10-app-content";

type PreviewMode = "step10" | "step4";

export default function Home() {
  const { language, t } = useLanguage();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("step10");
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("yearly");
  const arrowClass = isRtlLanguage(language) ? "rotate-180" : "";
  const founder = aboutCopy[language];
  const signupHref = `/join?lang=${language}`;
  const demoHref = `/demo?lang=${language}`;
  const freeMonthLabel = t("Start my free month", "شروع ماه رایگان من");
  const demoLabel = t("Explore the free demo", "مشاهده نسخه آزمایشی رایگان");
  const trialNote = t("30 days of Step 10. No card or automatic charge.", "۳۰ روز گام ۱۰. بدون کارت یا برداشت خودکار.");
  const heroSteps = t("Step 4 and Step 10", "گام‌های ۴ و ۱۰").replace(/(\S) (?=\p{Number})/gu, "$1\u00a0");

  const faqs = [
    {
      question: t("Who is this journal for?", "این دفتر برای چه کسانی است؟"),
      answer: t("Built for members working Step 4 and Step 10 with a sponsor or someone experienced in recovery. If you are new to recovery, start with your home group and a sponsor first. This journal supports your writing and conversations; it is not treatment or emergency support.", "برای اعضایی ساخته شده که گام‌های ۴ و ۱۰ را با راهنما یا فردی باتجربه در بهبودی کار می‌کنند. اگر تازه وارد بهبودی شده‌اید، ابتدا از گروه خانگی و یک راهنما شروع کنید. این دفتر به نوشتن و گفت‌وگوی شما کمک می‌کند؛ درمان یا پشتیبانی اضطراری نیست."),
    },
    {
      question: t("What can I try in the free demo?", "در نسخه آزمایشی رایگان چه چیزهایی را می‌توانم امتحان کنم؟"),
      answer: t(
        "Explore Step 10, Step 4, sample charts, and the learning tools without creating an account. Demo entries are not saved to an account. The live AI guide is included with membership; its public examples show the kind of questions it can ask.",
        "بدون ساخت حساب، گام ۱۰، گام ۴، نمودارهای نمونه و ابزارهای آموزشی را بررسی کنید. نوشته‌های نسخه آزمایشی در حسابی ذخیره نمی‌شوند. استفاده از راهنمای هوش مصنوعی همراه با اشتراک است؛ نمونه‌های عمومی، نوع پرسش‌هایی را که می‌تواند بپرسد نشان می‌دهند."
      ),
    },
    {
      question: t("Can my sponsor read a report without an account?", "آیا راهنمای من می‌تواند بدون حساب گزارش را بخواند؟"),
      answer: t(
        "Yes. You can choose principles and individual notes for a focused sponsor report, review the preview, and export or copy it. Your sponsor does not need an account to read the report you send. Nothing is sent automatically; agree together on what is helpful to share.",
        "بله. می‌توانید اصول و یادداشت‌های جداگانه را برای گزارش منتخب راهنما انتخاب کنید، پیش‌نمایش را مرور کنید و خروجی بگیرید یا آن را کپی کنید. راهنمای شما برای خواندن گزارشی که می‌فرستید به حساب نیاز ندارد. هیچ‌چیز خودکار فرستاده نمی‌شود؛ با هم درباره آنچه اشتراک‌گذاری‌اش مفید است توافق کنید."
      ),
    },
    {
      question: t("How do the Step 10 questions work?", "پرسش‌های گام دهم چگونه کار می‌کنند؟"),
      answer: t(
        "The 39 questions explore 24 recovery principles through everyday behavior. Each question shows its principle and has its own Practiced, Needs attention, or Didn’t come up today answer, including follow-ups. Charts, sharing, and PDF exports include these separate answers.",
        "۳۹ پرسش، ۲۴ اصل بهبودی را در رفتار روزمره بررسی می‌کنند. هر پرسش اصل مربوط به خود و پاسخ جداگانه «تمرین کردم»، «نیازمند توجه» یا «امروز پیش نیامد» دارد، از جمله پرسش‌های تکمیلی. نمودارها، گزارش‌های اشتراک‌گذاری‌شده و خروجی PDF این پاسخ‌های جداگانه را نشان می‌دهند."
      ),
    },
    {
      question: t("What if I lose my recovery code?", "اگر کد بازیابی‌ام را گم کنم چه می‌شود؟"),
      answer: t(
        "You can still sign in with your username and password, but the recovery code is your independent backup access. Copy or download it when the anonymous account is created and keep it private. You may also add verified email access later without losing progress.",
        "هنوز می‌توانید با نام کاربری و رمز عبور وارد شوید، اما کد بازیابی دسترسی پشتیبان مستقل شماست. هنگام ایجاد حساب ناشناس آن را کپی یا دانلود کرده و خصوصی نگه دارید. همچنین می‌توانید بعداً بدون از دست دادن پیشرفت، ورود با ایمیل تأییدشده را اضافه کنید."
      ),
    },
    {
      question: t("What happens after the free month?", "بعد از ماه رایگان چه می‌شود؟"),
      answer: t("You can still read and export your saved Step 10 entries. Upgrade the same account anytime to keep saving entries and use Step 4 and the AI guide.", "همچنان می‌توانید نوشته‌های ذخیره‌شده گام ۱۰ را بخوانید و از آن‌ها خروجی بگیرید. برای ادامه ذخیره نوشته‌ها و استفاده از گام ۴ و راهنمای هوش مصنوعی، هر زمان خواستید همین حساب را ارتقا دهید."),
    },
    {
      question: t("Can I cancel at any time?", "آیا هر زمان می‌توانم لغو کنم؟"),
      answer: t("Yes. Open Subscription inside your account and choose Manage or cancel. Your access continues through the period you already paid for.", "بله. در حساب خود بخش اشتراک را باز کرده و «مدیریت یا لغو» را انتخاب کنید. دسترسی شما تا پایان دوره‌ای که پرداخت کرده‌اید ادامه دارد."),
    },
  ];

  return (
    <main className="landing-page landing-v2">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(RECOVERY_APP_STRUCTURED_DATA).replace(/</g, "\\u003c") }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage", "@id": "https://recoveryinventory.com/#faq", inLanguage: language,
        mainEntity: faqs.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      }).replace(/</g, "\\u003c") }} />

      <section className="ri-hero">
        <div className="ri-hero-shape ri-hero-shape-one" aria-hidden="true" />
        <div className="ri-hero-shape ri-hero-shape-two" aria-hidden="true" />

        <div className="ri-hero-copy">
          <div className="ri-eyebrow">
            <span className="ri-eyebrow-dot" aria-hidden="true" />
            {t("For members of AA, NA and other twelve-step fellowships", "برای اعضای AA، NA و دیگر انجمن‌های دوازده‌قدمی")}
          </div>
          <h1>
            {t("A private journal for ", "دفتر خصوصی برای ")}
            <em>{heroSteps}.</em>
          </h1>
          <p>
            {t(
              "Notice your patterns, one honest evening at a time. Bring a reflection from your Step 10 journal or Step 4 workbook to your next conversation with your sponsor.",
              "هر شب با صداقت به خودتان نگاه کنید و الگوهایتان را بشناسید. تأملی از دفتر گام ۱۰ یا دفتر کار گام ۴ خود برای گفت‌وگوی بعدی با راهنمایتان آماده کنید."
            )}
          </p>
          <div className="ri-hero-actions">
            <a href={signupHref} className="button button-primary button-large ri-free-month-cta">
              <CalendarDays size={18} aria-hidden="true" />{freeMonthLabel}
            </a>
            <a href={demoHref} className="button button-outline button-large">{demoLabel}</a>
          </div>
          <p className="ri-hero-demo-note">{trialNote}</p>
        </div>

        <figure className="ri-hero-figure" aria-describedby="hero-preview-description">
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
                    <div className="ri-score-ring"><strong>18</strong><span>/{step10Questions.length}</span></div>
                    <div>
                      <span>{t("Questions marked Practiced", "پرسش‌های با پاسخ تمرین کردم")}</span>
                      <strong>{t("A thoughtful day", "روزی آگاهانه")}</strong>
                      <p>{t("There is progress here—and room to grow.", "در اینجا پیشرفت هست و جا برای رشد.")}</p>
                    </div>
                  </div>
                  <div className="ri-principle-list">
                    {[
                      [questionWithPrinciple("honesty", language), t("Practiced", "تمرین شد"), "good"],
                      [questionWithPrinciple("patience", language), t("Needs attention", "نیازمند توجه"), "care"],
                      [questionWithPrinciple("boundaries", language), t("Practiced", "تمرین شد"), "good"],
                      [questionWithPrinciple("gratitude", language), t("Practiced", "تمرین شد"), "good"],
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

            <a href={`/demo?step=${previewMode === "step10" ? "10" : "4"}&lang=${language}`} className="ri-preview-link">
              {t("Open this demo", "باز کردن این نسخه آزمایشی")}
              <ArrowRight className={arrowClass} size={16} />
            </a>
          </div>
          </div>
          <figcaption id="hero-preview-description" className="ri-preview-description">{previewMode === "step10" ? t("Illustrative Step 10 preview: 18 of 39 questions marked Practiced. Honesty and Gratitude are Practiced; Patience needs attention. Switch tabs to preview Step 4.", "پیش‌نمایش فرضی گام ۱۰: ۱۸ پرسش از ۳۹ پرسش با پاسخ «تمرین کردم». صداقت و قدردانی تمرین شده‌اند؛ صبر نیازمند توجه است. برای پیش‌نمایش گام ۴ زبانه را تغییر دهید.") : t("Illustrative Step 4 workbook preview with sections for resentments, fears, relationship patterns, and strengths. The displayed counts are sample data.", "پیش‌نمایش فرضی دفتر گام ۴ با بخش‌های رنجش‌ها، ترس‌ها، الگوهای رابطه و نقاط قوت. شمارش‌های نمایش‌داده‌شده نمونه هستند.")}</figcaption>
        </figure>
      </section>

      <aside className="ri-founder-note" aria-label={founder.eyebrow}>
        <strong>{founder.eyebrow}</strong>
        <blockquote>{founder.excerpt}</blockquote>
        <a href={aboutLanguageRoutes[language]} className="text-link">{founder.storyLink}</a>
      </aside>

      <section className="ri-section ri-practices" id="inventories">
        <div className="ri-section-heading">
          <span>{t("Two practices, one private place", "دو تمرین، یک فضای خصوصی")}</span>
          <h2>{t("Start where you are.", "از همین‌جایی که هستید شروع کنید.")}</h2>
          <p>{t("Guided prompts give your reflection structure without telling you what to feel or what to write.", "پرسش‌های هدایت‌شده به تأمل شما ساختار می‌دهند، بدون اینکه بگویند چه احساسی داشته باشید یا چه بنویسید.")}</p>
        </div>

        <div className="ri-practice-grid">
          <article className="ri-practice-card ri-practice-ten">
            <div className="ri-practice-topline"><span>{t("Daily reflection", "تأمل روزانه")}</span><b>10</b></div>
            <div className="ri-practice-visual" aria-hidden="true">
              <div className="ri-mini-calendar">
                {Array.from({ length: 28 }).map((_, index) => <i key={index} className={index < 19 ? "is-filled" : ""} />)}
              </div>
            </div>
            <h3>{t("Step 10 Daily Inventory", "ترازنامه روزانه گام دهم")}</h3>
            <p>{t("Reflect on 39 daily questions across 24 principles, answer follow-ups separately, and choose your next helpful action.", "به ۳۹ پرسش روزانه درباره ۲۴ اصل فکر کنید، پرسش‌های تکمیلی را جداگانه پاسخ دهید و اقدام مفید بعدی را انتخاب کنید.")}</p>
            <ul>
              <li><Check size={16} />{t("Daily questions, gratitude, and notes", "پرسش‌های روزانه، قدردانی و یادداشت‌ها")}</li>
              <li><Check size={16} />{t("A calendar that continues every year", "تقویمی که هر سال ادامه دارد")}</li>
              <li><Check size={16} />{t("Private analytics across your Step 10 history", "تحلیل خصوصی در سراسر سابقه گام ۱۰ شما")}</li>
            </ul>
            <div className="ri-practice-links">
              <a href="/demo?step=10">{t("Try Step 10", "آزمایش گام دهم")}<ArrowRight className={arrowClass} size={17} aria-hidden="true" /></a>
              <a href={step10AppRoutes[language]}>{step10AppCopy[language].title}<ArrowRight className={arrowClass} size={16} aria-hidden="true" /></a>
            </div>
          </article>

          <article className="ri-practice-card ri-practice-four">
            <div className="ri-practice-topline"><span>{t("Deeper reflection", "تأمل عمیق‌تر")}</span><b>4</b></div>
            <div className="ri-practice-visual ri-stack-visual" aria-hidden="true">
              <i /><i /><i />
              <span><NotebookPen size={25} /></span>
            </div>
            <h3>{t("Our workbook for Step 4 reflection", "دفتر ما برای تأمل در گام چهارم")}</h3>
            <p>{t("Build a detailed workbook over time. Return to edit it, mark the writing complete, or begin a separate workbook when useful. Review the work with your sponsor.", "دفتر کار را به‌مرور بنویسید. برای ویرایش بازگردید، نوشتن را تکمیل‌شده علامت بزنید یا در صورت نیاز دفتر جداگانه‌ای آغاز کنید. نوشته‌ها را با حامی خود مرور کنید.")}</p>
            <ul>
              <li><Check size={16} />{t("Six detailed, editable sections—not a daily entry", "شش بخش کامل و قابل ویرایش؛ نه یک نوشته روزانه")}</li>
              <li><Check size={16} />{t("Multiple reusable Step 4 workbooks", "چندین دفتر قابل استفاده گام چهارم")}</li>
              <li><Check size={16} />{t("A sponsor-ready private summary", "خلاصه خصوصی آماده برای حامی")}</li>
            </ul>
            <a href="/demo?step=4">{t("Try Step 4", "آزمایش گام چهارم")}<ArrowRight className={arrowClass} size={17} /></a>
          </article>
        </div>
      </section>

      <InventoryGuideShowcase />

      <section className="ri-section ri-learning-showcase" id="learning">
        <div className="ri-learning-copy">
          <span className="ri-section-label"><BookOpenText size={16} />{t("Recovery learning center", "مرکز آموزش بهبودی")}</span>
          <h2>{t("See the whole path from pattern to principle.", "تمام مسیر از الگو تا اصل را ببینید.")}</h2>
          <p>{t("Explore patterns, related behaviors, and principles for personal reflection using Recovery Inventory’s original guides and suggested actions.", "با راهنماهای اصلی و اقدام‌های پیشنهادی Recovery Inventory، الگوها، رفتارهای مرتبط و اصول تأمل شخصی را بررسی کنید.")}</p>
          <a href="/demo?step=learning" className="button button-primary">
            {t("Explore the learning demo", "مشاهده نسخه آزمایشی آموزش")}
            <ArrowRight className={arrowClass} size={17} />
          </a>
        </div>
        <div className="ri-learning-preview" aria-label={t("Example recovery learning path", "نمونه مسیر آموزش بهبودی")}>
          <div className="ri-learning-preview-head"><span>{t("Example", "نمونه")}</span><strong>{t("Dishonesty", "عدم صداقت")}</strong></div>
          <div className="ri-learning-preview-flow">
            <article><span>1</span><div><small>{t("Pattern / character defect", "الگو / نقص شخصیتی")}</small><strong>{t("Dishonesty", "عدم صداقت")}</strong><p>{t("Hiding, changing, or avoiding the truth.", "پنهان کردن، تغییر دادن یا دوری از حقیقت.")}</p></div></article>
            <Route size={18} aria-hidden="true" />
            <article><span>2</span><div><small>{t("Behavioral examples", "نمونه‌های رفتاری")}</small><strong>{t("Lying · Omission · Denial", "دروغ · حذف حقیقت · انکار")}</strong><p>{t("Examples of how this pattern may appear in behavior.", "نمونه‌هایی از چگونگی بروز این الگو در رفتار.")}</p></div></article>
            <Route size={18} aria-hidden="true" />
            <article><span>3</span><div><small>{t("Principles to practice", "اصول قابل تمرین")}</small><strong>{t("Honesty · Integrity · Courage", "صداقت · درستکاری · شجاعت")}</strong><p>{t("A practical route toward a different response.", "مسیری عملی به سوی پاسخی متفاوت.")}</p></div></article>
          </div>
        </div>
      </section>

      <PatternHistoryExample />

      <section className="ri-section ri-privacy">
        <div className="ri-privacy-copy">
          <span className="ri-section-label"><ShieldCheck size={16} />{t("Privacy without friction", "حریم خصوصی بدون پیچیدگی")}</span>
          <h2>{t("Personal reflection should stay personal.", "تأمل شخصی باید شخصی بماند.")}</h2>
          <p>{t("No public profile. Email is optional. Your inventories are stored privately and are not shared unless you decide to share them.", "بدون پروفایل عمومی. ایمیل اختیاری است. ترازنامه‌های شما خصوصی نگهداری می‌شوند و فقط با تصمیم شما به اشتراک گذاشته می‌شوند.")}</p>
          <div className="ri-privacy-points">
            <span><Check size={16} />{t("Anonymous username and password, plus a recovery code", "نام کاربری و رمز عبور ناشناس، همراه با کد بازیابی")}</span>
            <span><Check size={16} />{t("Add email later without losing progress", "افزودن ایمیل در آینده بدون از دست دادن پیشرفت")}</span>
            <span><Check size={16} />{t("Keep it private, or prepare a summary for your sponsor.", "آن را خصوصی نگه دارید یا خلاصه‌ای برای حامی خود آماده کنید.")}</span>
          </div>
        </div>
        <a href="/privacy" className="ri-privacy-card">
          <span className="ri-lock-orbit"><LockKeyhole size={30} aria-hidden="true" /></span>
          <strong>{t("Privacy", "حریم خصوصی")}</strong>
        </a>
      </section>

      <section className="ri-section ri-membership" id="membership">
        <div className="ri-membership-copy">
          <span>{t("One website subscription, two ways to pay", "یک اشتراک وب‌سایت، دو روش پرداخت")}</span>
          <h2>{t("A full year of reflection for less than 50¢ a week.", "یک سال کامل تأمل، کمتر از ۵۰ سنت در هفته.")}</h2>
          <p>{t("Daily Step 10, reusable Step 4 workbooks, the learning center, your ongoing history, and every sharing option are included in both monthly and yearly subscriptions.", "گام دهم روزانه، دفترهای قابل استفاده گام چهارم، مرکز آموزش، سابقه مداوم و همه گزینه‌های اشتراک‌گذاری در هر دو اشتراک ماهانه و سالانه گنجانده شده‌اند.")}</p>
        </div>
        <div className="ri-price-card">
          <p className="fine-print">{subscriptionGuidance(t)}</p>
          <SubscriptionPlanPicker value={billingPlan} onChange={setBillingPlan} />
          <a href={`/join?lang=${language}&plan=${billingPlan}`} className="button button-primary button-large button-full">
            {t("Choose my account type", "انتخاب نوع حساب من")}
            <ArrowRight className={arrowClass} size={18} />
          </a>
          <small><LockKeyhole size={13} />{t("Secure payment · Cancel anytime", "پرداخت امن · لغو در هر زمان")}</small>
          <div className="ri-purchase-notes">
            <p>{t("Payments are non-refundable except where required by law.", "پرداخت‌ها به‌جز موارد الزامی قانونی قابل بازپرداخت نیستند.")} <a href="/terms">{t("Read payment terms", "مطالعه شرایط پرداخت")}</a></p>
          </div>
        </div>
      </section>

      <MemberTestimonials />
      <ExternalMentions />

      <section className="ri-section ri-faq" id="faq">
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
          <h2>{t("Begin with one honest check-in.", "با یک مرور صادقانه شروع کنید.")}</h2>
          <p>{trialNote}</p>
        </div>
        <div className="ri-final-actions">
          <a href={signupHref} className="button button-primary button-large ri-free-month-cta">
            <CalendarDays size={18} aria-hidden="true" />{freeMonthLabel}
          </a>
          <a href={demoHref} className="button button-outline button-large">{demoLabel}</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
