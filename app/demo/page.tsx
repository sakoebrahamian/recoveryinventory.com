"use client";

import { isRtlLanguage } from "@/lib/languages";

import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/recovery/site-header";
import { AnalyticsFeatureGuide } from "@/components/recovery/analytics-feature-guide";
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
        <p>{t("Try 39 Step 10 questions across 24 principles, with separate follow-up answers and a principle label for every question. Explore a detailed Step 4 workbook you can build over time and learn how recovery principles guide practical actions. Demo entries are not saved to an account.", "۳۹ پرسش گام دهم درباره ۲۴ اصل را با پاسخ‌های جداگانه برای پرسش‌های تکمیلی و نمایش اصل هر پرسش امتحان کنید. دفتر کامل گام چهارم را به‌مرور بررسی کنید و یاد بگیرید اصول بهبودی چگونه اقدام‌های عملی را هدایت می‌کنند. موارد آزمایشی در حساب ذخیره نمی‌شوند.")}</p>
        <p>{t("Preview, print, or share the pattern map for the selected dates. It shows saved answers with colors and symbols.", "نقشه الگوها را برای تاریخ‌های انتخاب‌شده پیش‌نمایش، چاپ یا به اشتراک بگذارید. پاسخ‌های ذخیره‌شده با رنگ و نشانه نمایش داده می‌شوند.")}</p>
      </section>
      <div className="demo-banner">
        <div><ShieldCheck size={18} /><span>{t("Demo mode: your changes stay on this page and disappear when it closes.", "حالت آزمایشی: تغییرات فقط در همین صفحه می‌مانند و پس از بستن آن حذف می‌شوند.")}</span></div>
        <a className="text-link" href="/join">{t("Create an anonymous username or email account", "ایجاد حساب ناشناس با نام کاربری یا حساب ایمیلی")}<ArrowRight className={isRtlLanguage(language) ? "rotate-180" : ""} size={16} /></a>
      </div>
      <DemoWorkspace />
      <AnalyticsFeatureGuide compact />
      <SiteFooter />
    </main>
  );
}
