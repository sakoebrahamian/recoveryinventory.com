"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
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
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { originalFrameworkGuidance, subscriptionGuidance } from "@/lib/recovery-guidance";
import { AnalyticsFeatureGuide } from "@/components/recovery/analytics-feature-guide";
import { SiteFooter } from "@/components/recovery/site-footer";
import { useLanguage } from "@/components/recovery/language-provider";
import { questionWithPrinciple, step10Questions } from "@/lib/inventory";

type PreviewMode = "step10" | "step4";

export default function Home() {
  const { language, t } = useLanguage();
  const [previewMode, setPreviewMode] = useState<PreviewMode>("step10");
  const arrowClass = language === "fa" ? "rotate-180" : "";

  const faqs = [
    {
      question: t("How do the Step 10 questions work?", "پرسش‌های گام دهم چگونه کار می‌کنند؟"),
      answer: t(
        "The 39 questions explore 24 recovery principles through everyday behavior. Each question shows its principle and has its own Practiced, Needs attention, or Didn’t come up today answer, including follow-ups. Charts, sharing, and PDF exports include these separate answers.",
        "۳۹ پرسش، ۲۴ اصل بهبودی را در رفتار روزمره بررسی می‌کنند. هر پرسش اصل مربوط به خود و پاسخ جداگانه «تمرین کردم»، «نیازمند توجه» یا «امروز پیش نیامد» دارد، از جمله پرسش‌های تکمیلی. نمودارها، گزارش‌های اشتراک‌گذاری‌شده و خروجی PDF این پاسخ‌های جداگانه را نشان می‌دهند."
      ),
    },
    {
      question: t("Can I use a username and password while staying anonymous?", "آیا می‌توانم در حالت ناشناس از نام کاربری و رمز عبور استفاده کنم؟"),
      answer: t(
        "Yes. An anonymous account uses a private alias, username, and password without asking for your real name or email. You will also receive a recovery code and must copy or download it as a separate backup key. Email members can add username-and-password access later without losing progress.",
        "بله. حساب ناشناس بدون درخواست نام واقعی یا ایمیل، از نام مستعار، نام کاربری و رمز عبور خصوصی استفاده می‌کند. همچنین یک کد بازیابی دریافت می‌کنید و باید آن را به‌عنوان کلید پشتیبان جداگانه کپی یا دانلود کنید. اعضای ایمیلی می‌توانند بعداً بدون از دست دادن پیشرفت، ورود با نام کاربری و رمز عبور را اضافه کنند."
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
      question: t("Will I lose my progress if I add email later?", "اگر بعداً ایمیل اضافه کنم، پیشرفتم از بین می‌رود؟"),
      answer: t("No. Email is added to the same account. Your Step 10 and Step 4 inventories, analytics, website subscription, and billing connection remain in place.", "خیر. ایمیل به همان حساب اضافه می‌شود. ترازنامه‌های گام ۱۰ و ۴، تحلیل‌ها، اشتراک وب‌سایت و اتصال پرداخت شما حفظ می‌شوند."),
    },
    {
      question: t("Is Step 4 a daily inventory?", "آیا گام چهارم یک ترازنامه روزانه است؟"),
      answer: t("No. Our workbook for Step 4 reflection can be developed over time, saved, revisited, and edited. Marking the writing complete records the workbook’s status; review the work with your sponsor and follow your fellowship’s guidance.", "خیر. دفتر ما برای تأمل در گام چهارم را می‌توان به‌مرور نوشت، ذخیره، مرور و ویرایش کرد. علامت تکمیل نوشتن، وضعیت دفتر را ثبت می‌کند؛ نوشته‌ها را با حامی خود مرور کنید و از راهنمایی انجمن خود پیروی کنید."),
    },
    {
      question: t("Can I cancel at any time?", "آیا هر زمان می‌توانم لغو کنم؟"),
      answer: t("Yes. Open Subscription inside your account and choose Manage or cancel. Your access continues through the period you already paid for.", "بله. در حساب خود بخش اشتراک را باز کرده و «مدیریت یا لغو» را انتخاب کنید. دسترسی شما تا پایان دوره‌ای که پرداخت کرده‌اید ادامه دارد."),
    },
    {
      question: t("Can I share an inventory with my sponsor?", "آیا می‌توانم ترازنامه را با حامی خود به اشتراک بگذارم؟"),
      answer: t(
        "Yes. Share or copy the selected day's complete Step 10 inventory with a chart and analytics for Today, that day, a calendar week, month, year, or custom date range. Print a full journal with a chart, a sponsor summary, or just the chart as a PDF for the chosen dates. Review it with your sponsor or someone with time in recovery. Sharing is always your choice.",
        "بله. ترازنامه کامل روز انتخاب‌شده گام ۱۰ را همراه با نمودار و تحلیل برای امروز، همان روز، هفته، ماه، سال تقویمی یا بازه دلخواه تاریخ به اشتراک بگذارید یا کپی کنید. برای تاریخ‌های انتخاب‌شده، دفتر کامل همراه با نمودار، خلاصه حامی یا فقط نمودار را به‌صورت PDF چاپ کنید. آن را با حامی یا فردی باتجربه در بهبودی مرور کنید. اشتراک‌گذاری همیشه انتخاب شماست."
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
              {t("Choose my account", "انتخاب حساب من")}
              <span aria-hidden="true">{t("Anonymous username or email", "نام کاربری ناشناس یا ایمیل")}</span>
            </a>
          </div>
          <div className="ri-hero-trust" aria-label={t("Website subscription highlights", "ویژگی‌های اشتراک وب‌سایت")}>
            <span><ShieldCheck size={17} />{t("Anonymous username or email account", "حساب با نام کاربری ناشناس یا ایمیل")}</span>
            <span><Globe2 size={17} />{t("English + Farsi + Spanish", "انگلیسی، فارسی و اسپانیایی")}</span>
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
            <div><strong>{t("Your choice", "انتخاب شما")}</strong><span>{t("Username, email, or recovery-code access", "ورود با نام کاربری، ایمیل یا کد بازیابی")}</span></div>
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
            <a href="/demo?step=10">{t("Try Step 10", "آزمایش گام دهم")}<ArrowRight className={arrowClass} size={17} /></a>
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

      <section className="ri-section ri-learning-showcase" id="learning">
        <div className="ri-learning-copy">
          <span className="ri-section-label"><BookOpenText size={16} />{t("Recovery learning center", "مرکز آموزش بهبودی")}</span>
          <h2>{t("See the whole path from pattern to principle.", "تمام مسیر از الگو تا اصل را ببینید.")}</h2>
          <p>{t("Explore patterns, related behaviors, and principles for personal reflection using Recovery Inventory’s original guides and suggested actions.", "با راهنماهای اصلی و اقدام‌های پیشنهادی Recovery Inventory، الگوها، رفتارهای مرتبط و اصول تأمل شخصی را بررسی کنید.")}</p>
          <p>{originalFrameworkGuidance(t)}</p>
          <div className="ri-learning-points">
            <span><Check size={16} />{t("Explanations of patterns and related behaviors", "توضیح الگوها و رفتارهای مرتبط")}</span>
            <span><Check size={16} />{t("The 24 principles used in this journal, with examples and reflection questions", "۲۴ اصل به‌کاررفته در این دفتر، همراه با مثال‌ها و پرسش‌های تأمل")}</span>
            <span><Check size={16} />{t("Recovery paths you can apply to real situations", "مسیرهای بهبودی قابل اجرا در موقعیت‌های واقعی")}</span>
          </div>
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

      <AnalyticsFeatureGuide />

      <section className="ri-section ri-how">
        <div className="ri-section-heading ri-heading-light">
          <span>{t("Quietly simple", "ساده و آرام")}</span>
          <h2>{t("Your private practice in three steps.", "تمرین خصوصی شما در سه گام.")}</h2>
        </div>
        <div className="ri-how-grid">
          {[
            [KeyRound, "01", t("Choose how to join", "روش عضویت را انتخاب کنید"), t("Stay anonymous with a private username and password, and save the recovery code you receive. Or choose verified email access.", "با نام کاربری و رمز عبور خصوصی ناشناس بمانید و کد بازیابی دریافتی را ذخیره کنید. یا ورود با ایمیل تأییدشده را انتخاب کنید.")],
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
          <p>{t("No public profile. Email is optional. Your inventories are stored privately and are not shared unless you decide to share them.", "بدون پروفایل عمومی. ایمیل اختیاری است. ترازنامه‌های شما خصوصی نگهداری می‌شوند و فقط با تصمیم شما به اشتراک گذاشته می‌شوند.")}</p>
          <div className="ri-privacy-points">
            <span><Check size={16} />{t("Anonymous username and password, plus a recovery code", "نام کاربری و رمز عبور ناشناس، همراه با کد بازیابی")}</span>
            <span><Check size={16} />{t("Add email later without losing progress", "افزودن ایمیل در آینده بدون از دست دادن پیشرفت")}</span>
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
          <span>{t("One clear website subscription", "یک اشتراک وب‌سایت روشن")}</span>
          <h2>{t("A full year of reflection for less than 50¢ a week.", "یک سال کامل تأمل، کمتر از ۵۰ سنت در هفته.")}</h2>
          <p>{t("Daily Step 10, reusable Step 4 workbooks, the learning center, your ongoing history, and every sharing option are included. No confusing plans or upgrades.", "گام دهم روزانه، دفترهای قابل استفاده گام چهارم، مرکز آموزش، سابقه مداوم و همه گزینه‌های اشتراک‌گذاری شامل می‌شوند. بدون طرح‌ها یا ارتقاهای گیج‌کننده.")}</p>
          <div className="ri-included">
            <span><NotebookPen size={18} />{t("Daily Step 10 and multiple editable Step 4 workbooks", "گام دهم روزانه و چندین دفتر قابل ویرایش گام چهارم")}</span>
            <span><CalendarDays size={18} />{t("Continuous year-by-year calendar", "تقویم پیوسته سال‌به‌سال")}</span>
            <span><BarChart3 size={18} />{t("Detailed Step 10 analytics for selected dates", "تحلیل کامل گام ۱۰ برای تاریخ‌های انتخاب‌شده")}</span>
            <span><BookOpenText size={18} />{t("Patterns, behaviors, and principles learning center", "مرکز آموزش الگوها، رفتارها و اصول")}</span>
            <span><FileDown size={18} />{t("Share a selected day; export a Sponsor summary, Full journal, or Chart only PDF", "اشتراک روز انتخاب‌شده؛ خروجی PDF «خلاصه برای حامی»، «دفتر کامل» یا «فقط نمودار»")}</span>
            <span><ShieldCheck size={18} />{t("Anonymous username or verified email account", "حساب با نام کاربری ناشناس یا ایمیل تأییدشده")}</span>
          </div>
        </div>
        <div className="ri-price-card">
          <p className="fine-print">{subscriptionGuidance(t)}</p>
          <div className="ri-price-top"><span>{t("Annual website subscription", "اشتراک وب‌سایت سالانه")}</span><span>{t("Best value", "بهترین ارزش")}</span></div>
          <div className="ri-price"><strong>$25</strong><span>/{t("year", "سال")}</span></div>
          <p>{t("Renews annually until canceled.", "تا زمان لغو، سالانه تمدید می‌شود.")}</p>
          <a href="/join" className="button button-primary button-large button-full">
            {t("Choose my account type", "انتخاب نوع حساب من")}
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
