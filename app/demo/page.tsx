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
        <h1>{t("Try both inventories—and preview Step 10 analytics.", "هر دو ترازنامه را امتحان کنید و پیش‌نمایش تحلیل گام ۱۰ را ببینید.")}</h1>
        <p>{t("Use the sample information, test the print and sharing tools, then open Analytics to see how saved Step 10 patterns are summarized. Demo entries are not saved to an account.", "از اطلاعات نمونه استفاده کنید، ابزار چاپ و اشتراک را امتحان کنید و سپس تحلیل را باز کنید تا ببینید الگوهای ذخیره‌شده گام ۱۰ چگونه خلاصه می‌شوند. موارد آزمایشی در حساب ذخیره نمی‌شوند.")}</p>
      </section>
      <div className="demo-banner">
        <div><ShieldCheck size={18} /><span>{t("Demo mode: your changes stay on this page and disappear when it closes.", "حالت آزمایشی: تغییرات فقط در همین صفحه می‌مانند و پس از بستن آن حذف می‌شوند.")}</span></div>
        <a className="text-link" href="/join">{t("Save privately with membership", "ذخیره خصوصی با عضویت")}<ArrowRight className={language === "fa" ? "rotate-180" : ""} size={16} /></a>
      </div>
      <DemoWorkspace />
      <SiteFooter />
    </main>
  );
}
