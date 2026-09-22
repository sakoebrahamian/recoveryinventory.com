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
        <p>{t("Explore a detailed Step 4 workbook you can build over time, see how Step 10 patterns are summarized, and follow the learning path from character defects to shortcomings, corrective principles, and recovery actions. Demo entries are not saved to an account.", "یک دفتر کامل گام چهارم را که می‌توان به‌مرور تکمیل کرد بررسی کنید، ببینید الگوهای گام دهم چگونه خلاصه می‌شوند و مسیر آموزش را از نقص‌های شخصیتی تا کمبودهای رفتاری، اصول اصلاحی و اقدام‌های بهبودی دنبال کنید. موارد آزمایشی در حساب ذخیره نمی‌شوند.")}</p>
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
