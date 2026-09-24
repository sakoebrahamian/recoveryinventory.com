"use client";

import * as React from "react";
import { ArrowLeft, BarChart3, Eye, MousePointerClick, RefreshCw, ShieldCheck, UserPlus, WalletCards } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { LanguageToggle, useLanguage } from "./language-provider";
import type { Language } from "@/lib/inventory";

type Report = {
  range: { days: number; from: string; through: string };
  totals: {
    pageViews: number;
    entries: number;
    demoVisits: number;
    joinVisits: number;
    accounts: number;
    checkouts: number;
    activations: number;
  };
  pages: Record<string, number>;
  languages: Record<string, number>;
  sources: Record<string, number>;
  actions: Record<string, number>;
  actionSources: Record<string, Record<string, number>>;
  daily: Array<{ day: string; pageViews: number; entries: number; accounts: number; activations: number }>;
};

const COPY = {
  en: {
    eyebrow: "Owner-only report",
    title: "Website audience",
    intro: "Anonymous totals from public pages only. Member activity, account details, inventories, and notes are never included.",
    back: "Back to private workspace",
    refresh: "Refresh",
    loading: "Opening the private report…",
    denied: "This report is available only to the verified owner account.",
    failed: "The report could not be loaded. Please try again.",
    days7: "7 days",
    days30: "30 days",
    days90: "90 days",
    months13: "13 months",
    pageViews: "Public page views",
    entries: "Anonymous entries",
    demoVisits: "Demo visits",
    joinVisits: "Join-page visits",
    accounts: "Accounts created",
    checkouts: "Checkouts started",
    activations: "Memberships activated",
    trend: "Daily public activity",
    trendHelp: "Page views by each visitor’s local calendar day.",
    pages: "Public pages",
    languages: "Languages viewed",
    actions: "Important actions",
    sourceQuality: "Referral results",
    sourceHelp: "Only broad source categories are kept. Full referring links and search terms are never stored.",
    source: "Source",
    visits: "Entries",
    demo: "Demo",
    created: "Accounts",
    active: "Activated",
    rate: "Activation rate",
    noData: "No activity has been counted for this period yet.",
    privateNote: "Privacy guardrails",
    privateText: "No cookies, visitor IDs, IP addresses, precise locations, advertising pixels, or member-workspace tracking. Global Privacy Control and Do Not Track are respected. Totals are kept for up to 13 months.",
    through: "Through",
  },
  es: {
    eyebrow: "Informe solo para la propietaria",
    title: "Audiencia del sitio web",
    intro: "Totales anónimos solo de las páginas públicas. Nunca se incluyen la actividad de miembros, los datos de cuentas, los inventarios ni las notas.",
    back: "Volver al espacio privado",
    refresh: "Actualizar",
    loading: "Abriendo el informe privado…",
    denied: "Este informe está disponible solo para la cuenta verificada de la propietaria.",
    failed: "No se pudo cargar el informe. Inténtalo de nuevo.",
    days7: "7 días",
    days30: "30 días",
    days90: "90 días",
    months13: "13 meses",
    pageViews: "Vistas de páginas públicas",
    entries: "Entradas anónimas",
    demoVisits: "Visitas a la demostración",
    joinVisits: "Visitas a la página de registro",
    accounts: "Cuentas creadas",
    checkouts: "Pagos iniciados",
    activations: "Membresías activadas",
    trend: "Actividad pública diaria",
    trendHelp: "Vistas de página según el día local de cada visitante.",
    pages: "Páginas públicas",
    languages: "Idiomas vistos",
    actions: "Acciones importantes",
    sourceQuality: "Resultados por referencia",
    sourceHelp: "Solo se guardan categorías generales. Nunca se almacenan enlaces de referencia completos ni términos de búsqueda.",
    source: "Origen",
    visits: "Entradas",
    demo: "Demo",
    created: "Cuentas",
    active: "Activadas",
    rate: "Tasa de activación",
    noData: "Todavía no hay actividad contada para este período.",
    privateNote: "Protecciones de privacidad",
    privateText: "Sin cookies, identificadores de visitantes, direcciones IP, ubicación precisa, píxeles publicitarios ni seguimiento del espacio privado. Se respetan Global Privacy Control y Do Not Track. Los totales se conservan hasta 13 meses.",
    through: "Hasta",
  },
  fa: {
    eyebrow: "گزارش ویژه مالک",
    title: "مخاطبان وب‌سایت",
    intro: "فقط مجموع‌های ناشناس از صفحه‌های عمومی. فعالیت اعضا، اطلاعات حساب، ترازنامه‌ها و یادداشت‌ها هرگز در این گزارش نیستند.",
    back: "بازگشت به فضای خصوصی",
    refresh: "تازه‌سازی",
    loading: "در حال باز کردن گزارش خصوصی…",
    denied: "این گزارش فقط برای حساب تأییدشده مالک در دسترس است.",
    failed: "گزارش بارگذاری نشد. لطفاً دوباره تلاش کنید.",
    days7: "۷ روز",
    days30: "۳۰ روز",
    days90: "۹۰ روز",
    months13: "۱۳ ماه",
    pageViews: "بازدید صفحه‌های عمومی",
    entries: "ورودهای ناشناس",
    demoVisits: "بازدید نمونه",
    joinVisits: "بازدید صفحه عضویت",
    accounts: "حساب‌های ساخته‌شده",
    checkouts: "پرداخت‌های آغازشده",
    activations: "عضویت‌های فعال‌شده",
    trend: "فعالیت روزانه عمومی",
    trendHelp: "بازدید صفحه بر پایه روز محلی هر بازدیدکننده.",
    pages: "صفحه‌های عمومی",
    languages: "زبان‌های دیده‌شده",
    actions: "کارهای مهم",
    sourceQuality: "نتایج منبع ارجاع",
    sourceHelp: "فقط دسته‌های کلی منبع نگهداری می‌شوند. نشانی کامل ارجاع و عبارت‌های جست‌وجو هرگز ذخیره نمی‌شوند.",
    source: "منبع",
    visits: "ورودها",
    demo: "نمونه",
    created: "حساب‌ها",
    active: "فعال‌شده",
    rate: "نرخ فعال‌سازی",
    noData: "هنوز فعالیتی برای این بازه ثبت نشده است.",
    privateNote: "محافظت‌های حریم خصوصی",
    privateText: "بدون کوکی، شناسه بازدیدکننده، نشانی IP، مکان دقیق، پیکسل تبلیغاتی یا ردیابی فضای خصوصی اعضا. درخواست‌های Global Privacy Control و Do Not Track رعایت می‌شوند. مجموع‌ها حداکثر ۱۳ ماه نگهداری می‌شوند.",
    through: "تا",
  },
} as const;

const LABELS: Record<Language, Record<string, string>> = {
  en: {
    home: "Home", demo: "Demo", join: "Join", recover: "Log in", privacy: "Privacy", terms: "Terms", learn_hub: "Learning center", learn_step10: "Step 10 guide", learn_step4: "Step 4 guide", learn_honesty: "Honesty guide",
    en: "English", es: "Spanish", fa: "Farsi",
    direct: "Direct", google: "Google", bing: "Bing", facebook: "Facebook", instagram: "Instagram", reddit: "Reddit", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", newsletter: "Newsletter", recovery_partner: "Recovery partner", other: "Other",
    demo_open: "Demo opened", join_open: "Join page opened", membership_view: "Membership viewed", learn_open: "Learning guide opened", demo_step10: "Step 10 demo opened", demo_step4: "Step 4 demo opened", demo_analytics: "Demo analytics opened", demo_learning: "Demo learning center opened", account_created: "Account created", checkout_started: "Checkout started", membership_activated: "Membership activated", language_en: "English selected", language_es: "Spanish selected", language_fa: "Farsi selected",
  },
  es: {
    home: "Inicio", demo: "Demostración", join: "Registro", recover: "Acceso", privacy: "Privacidad", terms: "Términos", learn_hub: "Centro de aprendizaje", learn_step10: "Guía del Paso 10", learn_step4: "Guía del Paso 4", learn_honesty: "Guía de honestidad",
    en: "Inglés", es: "Español", fa: "Farsi",
    direct: "Directo", google: "Google", bing: "Bing", facebook: "Facebook", instagram: "Instagram", reddit: "Reddit", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", newsletter: "Boletín", recovery_partner: "Colaborador de recuperación", other: "Otro",
    demo_open: "Demostración abierta", join_open: "Registro abierto", membership_view: "Membresía vista", learn_open: "Guía abierta", demo_step10: "Demo del Paso 10", demo_step4: "Demo del Paso 4", demo_analytics: "Análisis de demo", demo_learning: "Centro de aprendizaje de demo", account_created: "Cuenta creada", checkout_started: "Pago iniciado", membership_activated: "Membresía activada", language_en: "Inglés seleccionado", language_es: "Español seleccionado", language_fa: "Farsi seleccionado",
  },
  fa: {
    home: "خانه", demo: "نمونه", join: "عضویت", recover: "ورود", privacy: "حریم خصوصی", terms: "شرایط", learn_hub: "مرکز آموزش", learn_step10: "راهنمای گام ۱۰", learn_step4: "راهنمای گام ۴", learn_honesty: "راهنمای صداقت",
    en: "انگلیسی", es: "اسپانیایی", fa: "فارسی",
    direct: "مستقیم", google: "گوگل", bing: "بینگ", facebook: "فیسبوک", instagram: "اینستاگرام", reddit: "ردیت", youtube: "یوتیوب", linkedin: "لینکدین", tiktok: "تیک‌تاک", newsletter: "خبرنامه", recovery_partner: "همکار بهبودی", other: "سایر",
    demo_open: "نمونه باز شد", join_open: "صفحه عضویت باز شد", membership_view: "عضویت دیده شد", learn_open: "راهنما باز شد", demo_step10: "نمونه گام ۱۰", demo_step4: "نمونه گام ۴", demo_analytics: "تحلیل نمونه", demo_learning: "آموزش نمونه", account_created: "حساب ساخته شد", checkout_started: "پرداخت آغاز شد", membership_activated: "عضویت فعال شد", language_en: "انگلیسی انتخاب شد", language_es: "اسپانیایی انتخاب شد", language_fa: "فارسی انتخاب شد",
  },
};

function localDay(): string {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function ranked(values: Record<string, number>) {
  return Object.entries(values).filter(([, count]) => count > 0).sort((left, right) => right[1] - left[1]);
}

function formatDay(day: string, language: Language) {
  return new Intl.DateTimeFormat(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
}

export function SiteAnalyticsReport() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const labels = LABELS[language];
  const [days, setDays] = React.useState(30);
  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [refreshVersion, setRefreshVersion] = React.useState(0);

  React.useEffect(() => {
    let stopped = false;
    fetch(`/api/site-analytics/report?days=${days}&through=${localDay()}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as Report & { error?: string };
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? copy.denied : result.error || copy.failed);
        if (!stopped) setReport(result);
      })
      .catch((caught: unknown) => {
        if (!stopped) setError(caught instanceof Error ? caught.message : copy.failed);
      })
      .finally(() => { if (!stopped) setLoading(false); });
    return () => { stopped = true; };
  }, [copy.denied, copy.failed, days, refreshVersion]);

  function chooseRange(nextDays: number) {
    if (nextDays === days) return;
    setLoading(true);
    setError("");
    setDays(nextDays);
  }

  function refreshReport() {
    setLoading(true);
    setError("");
    setRefreshVersion((value) => value + 1);
  }

  const maximumViews = Math.max(1, ...(report?.daily.map((item) => item.pageViews) ?? [0]));
  const visibleSources = report
    ? Object.keys(report.sources).filter((source) => {
        const actionSources = report.actionSources;
        return report.sources[source] > 0
          || (actionSources.demo_open?.[source] ?? 0) > 0
          || (actionSources.account_created?.[source] ?? 0) > 0
          || (actionSources.membership_activated?.[source] ?? 0) > 0;
      }).sort((left, right) => report.sources[right] - report.sources[left])
    : [];

  const statCards = report ? [
    { label: copy.pageViews, value: report.totals.pageViews, icon: Eye },
    { label: copy.entries, value: report.totals.entries, icon: MousePointerClick },
    { label: copy.demoVisits, value: report.totals.demoVisits, icon: BarChart3 },
    { label: copy.joinVisits, value: report.totals.joinVisits, icon: UserPlus },
    { label: copy.accounts, value: report.totals.accounts, icon: UserPlus },
    { label: copy.checkouts, value: report.totals.checkouts, icon: WalletCards },
    { label: copy.activations, value: report.totals.activations, icon: ShieldCheck },
  ] : [];

  return (
    <main className="member-page site-analytics-page">
      <header className="member-header">
        <div className="member-topbar"><BrandMark /><LanguageToggle /></div>
      </header>
      <div className="site-report-shell">
        <a className="site-report-back" href="/app"><ArrowLeft size={16} />{copy.back}</a>
        <div className="site-report-heading">
          <div><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div>
          <button className="button button-outline" type="button" onClick={refreshReport} disabled={loading}><RefreshCw size={16} />{copy.refresh}</button>
        </div>
        <div className="site-report-ranges" role="group" aria-label={copy.title}>
          {([[7, copy.days7], [30, copy.days30], [90, copy.days90], [395, copy.months13]] as const).map(([value, label]) => (
            <button key={value} type="button" className={days === value ? "is-active" : ""} onClick={() => chooseRange(value)}>{label}</button>
          ))}
        </div>

        {loading && !report ? <div className="loading-panel"><div><div className="spinner" /><p>{copy.loading}</p></div></div> : error ? <div className="site-report-error" role="alert">{error}</div> : report && (
          <>
            <p className="site-report-through">{copy.through} {formatDay(report.range.through, language)}</p>
            <section className="site-report-stats" aria-label={copy.title}>
              {statCards.map(({ label, value, icon: Icon }) => <article key={label}><Icon size={18} /><strong>{value.toLocaleString(language === "fa" ? "fa-IR" : language === "es" ? "es-US" : "en-US")}</strong><span>{label}</span></article>)}
            </section>

            <section className="dashboard-card site-report-trend">
              <div className="site-report-section-heading"><div><h2>{copy.trend}</h2><p>{copy.trendHelp}</p></div></div>
              {report.totals.pageViews === 0 ? <p className="site-report-empty">{copy.noData}</p> : (
                <div className="site-report-chart-scroll">
                  <div className="site-report-chart" style={{ minWidth: `${Math.max(560, report.daily.length * 8)}px` }}>
                    {report.daily.map((item) => (
                      <div className="site-report-chart-day" key={item.day} title={`${formatDay(item.day, language)}: ${item.pageViews}`}>
                        <i style={{ height: `${Math.max(item.pageViews > 0 ? 4 : 0, (item.pageViews / maximumViews) * 100)}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="site-report-breakdowns">
              {([[copy.pages, report.pages], [copy.languages, report.languages], [copy.actions, report.actions]] as const).map(([title, values]) => (
                <section className="dashboard-card site-report-list" key={title}>
                  <h2>{title}</h2>
                  {ranked(values).length === 0 ? <p className="site-report-empty">{copy.noData}</p> : <ol>{ranked(values).map(([label, count]) => <li key={label}><span>{labels[label] ?? label}</span><strong>{count.toLocaleString()}</strong></li>)}</ol>}
                </section>
              ))}
            </div>

            <section className="dashboard-card site-report-sources">
              <div className="site-report-section-heading"><div><h2>{copy.sourceQuality}</h2><p>{copy.sourceHelp}</p></div></div>
              {visibleSources.length === 0 ? <p className="site-report-empty">{copy.noData}</p> : (
                <div className="site-report-table-scroll"><table><thead><tr><th>{copy.source}</th><th>{copy.visits}</th><th>{copy.demo}</th><th>{copy.created}</th><th>{copy.active}</th><th>{copy.rate}</th></tr></thead><tbody>
                  {visibleSources.map((source) => {
                    const entries = report.sources[source];
                    const activations = report.actionSources.membership_activated?.[source] ?? 0;
                    return <tr key={source}><th>{labels[source] ?? source}</th><td>{entries}</td><td>{report.actionSources.demo_open?.[source] ?? 0}</td><td>{report.actionSources.account_created?.[source] ?? 0}</td><td>{activations}</td><td>{entries > 0 ? `${((activations / entries) * 100).toFixed(1)}%` : "—"}</td></tr>;
                  })}
                </tbody></table></div>
              )}
            </section>

            <aside className="site-report-privacy"><ShieldCheck size={21} /><div><strong>{copy.privateNote}</strong><p>{copy.privateText}</p></div></aside>
          </>
        )}
      </div>
    </main>
  );
}
