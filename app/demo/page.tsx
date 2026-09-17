"use client";

import Link from "next/link";
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
        <h1>{t("Try both inventories before you join.", "پیش از عضویت، هر دو ترازنامه را امتحان کنید.")}</h1>
        <p>{t("Use the sample information, change any field, and test the print and sharing tools. Demo entries are not saved to an account.", "از اطلاعات نمونه استفاده کنید، هر بخشی را تغییر دهید و ابزار چاپ و اشتراک را امتحان کنید. موارد آزمایشی در حساب ذخیره نمی‌شوند.")}</p>
      </section>
      <div className="demo-banner">
        <div><ShieldCheck size={18} /><span>{t("Demo mode: your changes stay on this page and disappear when it closes.", "حالت آزمایشی: تغییرات فقط در همین صفحه می‌مانند و پس از بستن آن حذف می‌شوند.")}</span></div>
        <Link className="text-link" href="/join">{t("Save privately with membership", "ذخیره خصوصی با عضویت")}<ArrowRight className={language === "fa" ? "rotate-180" : ""} size={16} /></Link>
      </div>
      <DemoWorkspace />
      <SiteFooter />
    </main>
  );
}
