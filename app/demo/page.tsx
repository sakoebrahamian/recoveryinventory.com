"use client";

import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { SiteFooter } from "@/components/recovery/site-footer";
import { DemoWorkspace } from "@/components/recovery/demo-workspace";
import { useLanguage } from "@/components/recovery/language-provider";

export default function DemoPage() {
  const { language, t } = useLanguage();
  return (
    <main className="inner-page">
      <SiteHeader />
      <section className="page-hero compact">
        <div className="eyebrow"><Eye size={16} />{t("Interactive preview", "پیش‌نمایش تعاملی")}</div>
        <h1>{t("Try daily Step 10, a reusable Step 4 workbook, analytics, and the learning center.", "گام دهم روزانه، دفتر قابل ویرایش گام چهارم، تحلیل‌ها و مرکز آموزش را امتحان کنید.")}</h1>
        <p>{t("Try 24 Step 10 questions with supporting prompts and matching chart labels. Explore a detailed Step 4 workbook you can build over time and learn how recovery principles guide practical actions. Demo entries are not saved to an account.", "۲۴ پرسش گام دهم را همراه با پرسش‌های تکمیلی و برچسب‌های یکسان در نمودار امتحان کنید. دفتر کامل گام چهارم را به‌مرور بررسی کنید و یاد بگیرید اصول بهبودی چگونه اقدام‌های عملی را هدایت می‌کنند. موارد آزمایشی در حساب ذخیره نمی‌شوند.")}</p>
        <p>{t("Choose Today, the selected day, a calendar week, month, year, or custom date range for the inventory chart. Share or copy the full inventory with that chart and analytics. Members can print a Full journal, Sponsor summary, or Chart only PDF for the chosen dates. Review the report with a sponsor or someone with time in recovery for guidance.", "برای نمودار ترازنامه، امروز، روز انتخاب‌شده، هفته، ماه، سال تقویمی یا بازه دلخواه تاریخ را انتخاب کنید. ترازنامه کامل را همراه با نمودار و تحلیل به اشتراک بگذارید یا کپی کنید. اعضا می‌توانند برای تاریخ‌های انتخاب‌شده «دفتر کامل»، «خلاصه برای حامی» یا «فقط نمودار» را به‌صورت PDF چاپ کنند. برای راهنمایی، گزارش را با حامی یا فردی باتجربه در بهبودی مرور کنید.")}</p>
      </section>
      <div className="demo-banner">
        <div><ShieldCheck size={18} /><span>{t("Demo mode: your changes stay on this page and disappear when it closes.", "حالت آزمایشی: تغییرات فقط در همین صفحه می‌مانند و پس از بستن آن حذف می‌شوند.")}</span></div>
        <a className="text-link" href="/join">{t("Create an anonymous username or email account", "ایجاد حساب ناشناس با نام کاربری یا حساب ایمیلی")}<ArrowRight className={language === "fa" ? "rotate-180" : ""} size={16} /></a>
      </div>
      <DemoWorkspace />
      <SiteFooter />
    </main>
  );
}
