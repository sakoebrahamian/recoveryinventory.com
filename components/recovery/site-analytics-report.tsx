"use client";

import { dateTimeFormat, isRtlLanguage, languageLocale, languageNames, supportedLanguage, type Language } from "@/lib/languages";
import { expandLocalizedRecord, translateForLanguage } from "@/lib/localization";
import { SITE_ANALYTICS_RECENT_HOURS, type SiteAnalyticsReportData, type SiteAnalyticsTotals } from "@/lib/site-analytics-report";
import * as React from "react";
import { ArrowLeft, BarChart3, Eye, Info, MousePointerClick, RefreshCw, ShieldCheck, UserPlus, Users, WalletCards, X } from "lucide-react";
import { LanguageAvailability } from "./language-availability";
import { BrandMark } from "./brand-mark";
import { SiteFooter } from "./site-footer";
import { LanguageToggle, useLanguage } from "./language-provider";
import { ThemePicker } from "./theme-picker";

const COPY = expandLocalizedRecord({
  en: {
    eyebrow: "Owner-only report",
    title: "Website audience",
    intro: "Anonymous totals for public page visits, signups, and subscriptions.",
    viewUsernames: "View usernames",
    usernamesTitle: "Registered usernames",
    usernamesLoading: "Loading usernames…",
    usernamesFailed: "Could not load usernames. Please try again.",
    usernamesEmpty: "No registered usernames yet.",
    back: "Back to private workspace",
    refresh: "Refresh",
    loading: "Opening the private report…",
    denied: "This report is available only to the verified owner account.",
    failed: "The report could not be loaded. Please try again.",
    last24: "Last 24 hours",
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
    activations: "Subscriptions activated",
    trend: "Daily public activity",
    trendHelp: "Page views by each visitor’s local calendar day.",
    hourlyTrend: "Hourly public activity",
    hourlyHelp: "Page views by hour in your device’s time zone.",
    hourlyStarted: "Hourly reporting began {time}. Earlier activity in this window is unavailable.",
    hourlyUnavailable: "Hourly reporting was unavailable during this time.",
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
    detailHelp: "Select a total, chart bar, or row to see its breakdown.",
    entriesHelp: "One entry is counted per browser tab session. A returning visitor can count more than once.",
    languageSelected: "{language} selected",
    close: "Close",
  },
  es: {
    eyebrow: "Informe solo para la propietaria",
    title: "Audiencia del sitio web",
    intro: "Totales anónimos de visitas a páginas públicas, registros y suscripciones.",
    viewUsernames: "Ver nombres de usuario",
    usernamesTitle: "Nombres de usuario registrados",
    usernamesLoading: "Cargando nombres de usuario…",
    usernamesFailed: "No se pudieron cargar los nombres de usuario. Inténtalo de nuevo.",
    usernamesEmpty: "Todavía no hay nombres de usuario registrados.",
    back: "Volver al espacio privado",
    refresh: "Actualizar",
    loading: "Abriendo el informe privado…",
    denied: "Este informe está disponible solo para la cuenta verificada de la propietaria.",
    failed: "No se pudo cargar el informe. Inténtalo de nuevo.",
    last24: "Últimas 24 horas",
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
    activations: "Suscripciones activadas",
    trend: "Actividad pública diaria",
    trendHelp: "Vistas de página según el día local de cada visitante.",
    hourlyTrend: "Actividad pública por hora",
    hourlyHelp: "Vistas de página por hora en la zona horaria de tu dispositivo.",
    hourlyStarted: "El informe por hora comenzó el {time}. La actividad anterior de este período no está disponible.",
    hourlyUnavailable: "El informe por hora no estaba disponible en este intervalo.",
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
    detailHelp: "Selecciona un total, una barra del gráfico o una fila para ver su desglose.",
    entriesHelp: "Se cuenta una entrada por sesión de pestaña del navegador. Una persona que regresa puede contar más de una vez.",
    languageSelected: "Se seleccionó {language}",
    close: "Cerrar",
  },
  fa: {
    eyebrow: "گزارش ویژه مالک",
    title: "مخاطبان وب‌سایت",
    intro: "آمار ناشناس بازدید از صفحه‌های عمومی، ثبت‌نام‌ها و اشتراک‌ها.",
    viewUsernames: "مشاهده نام‌های کاربری",
    usernamesTitle: "نام‌های کاربری ثبت‌شده",
    usernamesLoading: "در حال بارگذاری نام‌های کاربری…",
    usernamesFailed: "نام‌های کاربری بارگذاری نشدند. لطفاً دوباره تلاش کنید.",
    usernamesEmpty: "هنوز نام کاربری ثبت نشده است.",
    back: "بازگشت به فضای خصوصی",
    refresh: "تازه‌سازی",
    loading: "در حال باز کردن گزارش خصوصی…",
    denied: "این گزارش فقط برای حساب تأییدشده مالک در دسترس است.",
    failed: "گزارش بارگذاری نشد. لطفاً دوباره تلاش کنید.",
    last24: "۲۴ ساعت گذشته",
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
    activations: "اشتراک‌های فعال‌شده",
    trend: "فعالیت روزانه عمومی",
    trendHelp: "بازدید صفحه بر پایه روز محلی هر بازدیدکننده.",
    hourlyTrend: "فعالیت ساعتی عمومی",
    hourlyHelp: "بازدید صفحه‌ها به تفکیک ساعت و بر اساس منطقه زمانی دستگاه شما.",
    hourlyStarted: "گزارش ساعتی از {time} آغاز شد. اطلاعات فعالیت پیش از آن در این بازه در دسترس نیست.",
    hourlyUnavailable: "گزارش ساعتی برای این زمان در دسترس نیست.",
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
    detailHelp: "برای دیدن جزئیات، یک آمار کلی، میله نمودار یا ردیف را انتخاب کنید.",
    entriesHelp: "برای هر نشست در یک زبانه مرورگر یک ورود ثبت می‌شود. بازدیدکننده‌ای که دوباره برمی‌گردد ممکن است بیش از یک بار شمرده شود.",
    languageSelected: "زبان {language} انتخاب شد",
    close: "بستن",
  },
});

const LABELS: Record<Language, Record<string, string>> = expandLocalizedRecord({
  en: {
    home: "Home", demo: "Demo", join: "Join", recover: "Log in", privacy: "Privacy", terms: "Terms", learn_hub: "Learning center", learn_step10: "Step 10 guide", learn_step4: "Step 4 guide", learn_honesty: "Honesty guide",
    en: "English", es: "Spanish", fa: "Farsi",
    direct: "Direct", google: "Google", bing: "Bing", facebook: "Facebook", instagram: "Instagram", reddit: "Reddit", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", newsletter: "Newsletter", recovery_partner: "Recovery partner", other: "Other",
    demo_open: "Demo opened", join_open: "Join page opened", membership_view: "Subscription viewed", learn_open: "Learning guide opened", demo_step10: "Step 10 demo opened", demo_step4: "Step 4 demo opened", demo_analytics: "Demo analytics opened", demo_learning: "Demo learning center opened", account_created: "Account created", checkout_started: "Checkout started", membership_activated: "Membership activated", language_en: "English selected", language_es: "Spanish selected", language_fa: "Farsi selected",
  },
  es: {
    home: "Inicio", demo: "Demostración", join: "Registro", recover: "Acceso", privacy: "Privacidad", terms: "Términos", learn_hub: "Centro de aprendizaje", learn_step10: "Guía del Paso 10", learn_step4: "Guía del Paso 4", learn_honesty: "Guía de honestidad",
    en: "Inglés", es: "Español", fa: "Farsi",
    direct: "Directo", google: "Google", bing: "Bing", facebook: "Facebook", instagram: "Instagram", reddit: "Reddit", youtube: "YouTube", linkedin: "LinkedIn", tiktok: "TikTok", newsletter: "Boletín", recovery_partner: "Colaborador de recuperación", other: "Otro",
    demo_open: "Demostración abierta", join_open: "Registro abierto", membership_view: "Suscripción vista", learn_open: "Guía abierta", demo_step10: "Demo del Paso 10", demo_step4: "Demo del Paso 4", demo_analytics: "Análisis de demo", demo_learning: "Centro de aprendizaje de demo", account_created: "Cuenta creada", checkout_started: "Pago iniciado", membership_activated: "Membresía activada", language_en: "Inglés seleccionado", language_es: "Español seleccionado", language_fa: "Farsi seleccionado",
  },
  fa: {
    home: "خانه", demo: "نمونه", join: "عضویت", recover: "ورود", privacy: "حریم خصوصی", terms: "شرایط", learn_hub: "مرکز آموزش", learn_step10: "راهنمای گام ۱۰", learn_step4: "راهنمای گام ۴", learn_honesty: "راهنمای صداقت",
    en: "انگلیسی", es: "اسپانیایی", fa: "فارسی",
    direct: "مستقیم", google: "گوگل", bing: "بینگ", facebook: "فیسبوک", instagram: "اینستاگرام", reddit: "ردیت", youtube: "یوتیوب", linkedin: "لینکدین", tiktok: "تیک‌تاک", newsletter: "خبرنامه", recovery_partner: "همکار بهبودی", other: "سایر",
    demo_open: "نمونه باز شد", join_open: "صفحه اشتراک باز شد", membership_view: "اشتراک دیده شد", learn_open: "راهنما باز شد", demo_step10: "نمونه گام ۱۰", demo_step4: "نمونه گام ۴", demo_analytics: "تحلیل نمونه", demo_learning: "آموزش نمونه", account_created: "حساب ساخته شد", checkout_started: "پرداخت آغاز شد", membership_activated: "عضویت فعال شد", language_en: "انگلیسی انتخاب شد", language_es: "اسپانیایی انتخاب شد", language_fa: "فارسی انتخاب شد",
  },
});

function localDay(): string {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

function ranked(values: Record<string, number>) {
  return Object.entries(values).filter(([, count]) => count > 0).sort((left, right) => right[1] - left[1]);
}

const STATS = [
  { key: "pageViews", icon: Eye },
  { key: "entries", icon: MousePointerClick },
  { key: "demoVisits", icon: BarChart3 },
  { key: "joinVisits", icon: UserPlus },
  { key: "accounts", icon: UserPlus },
  { key: "checkouts", icon: WalletCards },
  { key: "activations", icon: ShieldCheck },
] as const;

type Detail = {
  title: string;
  total?: number;
  description?: string;
  group?: string;
  rows?: Array<readonly [label: string, count: number]>;
};

type TrendBar = {
  id: string;
  title: string;
  tick: string;
  available: boolean;
  totals: SiteAnalyticsTotals;
};

function SiteAnalyticsTrend({
  bars, title, unavailable, formatNumber, pageViews, rtl, select,
}: {
  bars: TrendBar[];
  title: string;
  unavailable: string;
  formatNumber: (count: number) => string;
  pageViews: string;
  rtl: boolean;
  select: (bar: TrendBar) => void;
}) {
  const [focusIndex, setFocusIndex] = React.useState(0);
  const maximum = Math.max(1, ...bars.map((bar) => bar.totals.pageViews));
  const ticks = [...new Set(Array.from({ length: 5 }, (_, index) => Math.round(index * (bars.length - 1) / 4)))];

  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    switch (event.key) {
      case "ArrowLeft": nextIndex = index + (rtl ? 1 : -1); break;
      case "ArrowRight": nextIndex = index + (rtl ? -1 : 1); break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = bars.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const buttons = event.currentTarget.parentElement?.querySelectorAll("button");
    buttons?.[Math.max(0, Math.min(bars.length - 1, nextIndex))]?.focus();
  }

  return (
    <div className="site-report-chart-scroll">
      <div style={{ minWidth: `${Math.max(400, bars.length * 12)}px` }}>
        <div className="site-report-chart" role="group" aria-label={title}>
          {bars.map((bar, index) => {
            const count = bar.totals.pageViews;
            const label = `${bar.title} · ${bar.available ? `${formatNumber(count)} ${pageViews}` : unavailable}`;
            return (
              <button
                key={bar.id}
                className="site-report-chart-day"
                type="button"
                aria-haspopup="dialog"
                aria-label={label}
                title={label}
                tabIndex={index === focusIndex ? 0 : -1}
                data-empty={count === 0}
                data-unavailable={!bar.available}
                onFocus={() => setFocusIndex(index)}
                onKeyDown={(event) => moveFocus(event, index)}
                onClick={() => select(bar)}
              >
                <i aria-hidden="true" style={{ height: `${Math.max(1, count / maximum * 100)}%` }} />
              </button>
            );
          })}
        </div>
        <div className="site-report-chart-axis" aria-hidden="true">
          {ticks.map((index) => <span key={index}>{bars[index].tick}</span>)}
        </div>
      </div>
    </div>
  );
}

type UsernamesResult = { usernames: string[] } | { error: "denied" | "usernamesFailed" };

function SiteAnalyticsUsernames({ copy }: { copy: (typeof COPY)["en"] }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const title = React.useId();
  const [open, setOpen] = React.useState(false);
  const [result, setResult] = React.useState<UsernamesResult | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    async function loadUsernames() {
      try {
        const response = await fetch("/api/site-analytics/usernames", { cache: "no-store", signal: controller.signal });
        if (response.status === 401 || response.status === 403) {
          if (!controller.signal.aborted) setResult({ error: "denied" });
          return;
        }
        if (!response.ok) throw new Error("Username list request failed.");
        const data = await response.json() as { usernames: string[] };
        if (!controller.signal.aborted) setResult(data);
      } catch {
        if (!controller.signal.aborted) setResult({ error: "usernamesFailed" });
      }
    }

    void loadUsernames();
    return () => controller.abort();
  }, [open]);

  const usernames = result && "usernames" in result ? result.usernames : null;

  return (
    <>
      <button className="button button-outline" type="button" aria-haspopup="dialog" onClick={() => {
        dialog.current?.showModal();
        setOpen(true);
      }}><Users size={16} aria-hidden="true" />{copy.viewUsernames}</button>
      <dialog ref={dialog} className="site-report-detail" aria-labelledby={title} onClose={() => {
        setOpen(false);
        setResult(null);
      }} onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className="site-report-detail-content">
          <div className="site-report-detail-heading">
            <h2 id={title}>{copy.usernamesTitle}</h2>
            <button type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} aria-hidden="true" /></button>
          </div>
          {open && !result && <p className="site-report-empty" role="status">{copy.usernamesLoading}</p>}
          {open && result && "error" in result && <p className="site-report-error" role="alert">{copy[result.error]}</p>}
          {open && usernames && (usernames.length === 0 ? (
            <p className="site-report-empty" role="status">{copy.usernamesEmpty}</p>
          ) : (
            <ul className="site-report-username-list" role="list">
              {usernames.map((username) => <li key={username}><bdi>{username}</bdi></li>)}
            </ul>
          ))}
        </div>
      </dialog>
    </>
  );
}

export function SiteAnalyticsReport() {
  const { language } = useLanguage();
  const copy = COPY[language];
  const labels = LABELS[language];
  const [range, setRange] = React.useState(30);
  const [report, setReport] = React.useState<SiteAnalyticsReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [refreshVersion, setRefreshVersion] = React.useState(0);
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const dialog = React.useRef<HTMLDialogElement>(null);
  const detailTitle = React.useId();

  React.useEffect(() => {
    const controller = new AbortController();
    const query = range === SITE_ANALYTICS_RECENT_HOURS ? `hours=${range}` : `days=${range}&through=${localDay()}`;

    fetch(`/api/site-analytics/report?${query}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json() as SiteAnalyticsReportData & { error?: string };
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? copy.denied
            : result.error ? translateForLanguage(language, result.error, copy.failed) : copy.failed);
        }
        if (!controller.signal.aborted) {
          setReport(result);
          setError("");
        }
      })
      .catch((caught: unknown) => {
        if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : copy.failed);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [copy.denied, copy.failed, language, range, refreshVersion]);

  React.useEffect(() => {
    if (detail && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [detail]);

  function chooseRange(nextRange: number) {
    if (nextRange === range) return;
    setLoading(true);
    setError("");
    setReport(null);
    setRange(nextRange);
  }

  function refreshReport() {
    setLoading(true);
    setError("");
    setRefreshVersion((value) => value + 1);
  }

  const formats = React.useMemo(() => {
    const locale = languageLocale(language);
    return {
      day: dateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }),
      fullDay: dateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }),
      time: dateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }),
      dateTime: dateTimeFormat(locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }),
      number: new Intl.NumberFormat(locale),
      percent: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1, minimumFractionDigits: 1 }),
    };
  }, [language]);

  const formatDay = (day: string, year = false) => (year ? formats.fullDay : formats.day).format(new Date(`${day}T12:00:00Z`));
  const formatTime = (time: string) => formats.dateTime.format(new Date(time));

  function labelFor(label: string): string {
    if (labels[label]) return labels[label];
    const code = supportedLanguage(label);
    if (code) return languageNames[code];
    const selected = label.startsWith("language_") ? supportedLanguage(label.slice("language_".length)) : null;
    return selected ? copy.languageSelected.replace("{language}", languageNames[selected]) : label;
  }

  function showBreakdown(title: string, total: number, group: string, values: Record<string, number>, description?: string) {
    setDetail({ title, total, group, description, rows: ranked(values).map(([label, count]) => [labelFor(label), count]) });
  }

  function showChartDetail(bar: TrendBar) {
    setDetail(bar.available
      ? { title: bar.title, rows: STATS.map(({ key }) => [copy[key], bar.totals[key]]) }
      : { title: bar.title, description: copy.hourlyUnavailable });
  }

  const hourly = report && "hourly" in report ? report : null;
  const chartTitle = hourly ? copy.hourlyTrend : copy.trend;
  const bars = hourly
    ? hourly.hourly.map((period): TrendBar => ({
        id: period.from,
        title: `${formatTime(period.from)} – ${formatTime(period.through)}`,
        tick: formats.time.format(new Date(period.from)),
        available: period.through > hourly.range.collectedFrom,
        totals: period,
      }))
    : report && "daily" in report
      ? report.daily.map((period): TrendBar => ({
          id: period.day,
          title: formatDay(period.day, true),
          tick: formatDay(period.day),
          available: true,
          totals: period,
        }))
      : [];
  const coverageNote = hourly && hourly.range.collectedFrom > hourly.range.from
    ? copy.hourlyStarted.replace("{time}", formatTime(hourly.range.collectedFrom))
    : undefined;
  const visibleSources = report
    ? Object.keys(report.sources)
      .filter((source) => report.sources[source] > 0 || Object.values(report.actionSources).some((counts) => counts[source] > 0))
      .sort((left, right) => report.sources[right] - report.sources[left])
    : [];

  const cardBreakdowns = report && {
    pageViews: { group: copy.pages, values: report.pages },
    entries: { group: copy.source, values: report.sources, description: copy.entriesHelp },
    demoVisits: { group: copy.languages, values: report.pageLanguages.demo },
    joinVisits: { group: copy.languages, values: report.pageLanguages.join },
    accounts: { group: copy.source, values: report.actionSources.account_created },
    checkouts: { group: copy.source, values: report.actionSources.checkout_started },
    activations: { group: copy.source, values: report.actionSources.membership_activated },
  };

  const breakdownLists = report && [
    {
      title: copy.pages,
      values: report.pages,
      select: (page: string, count: number) => showBreakdown(labelFor(page), count, copy.languages, report.pageLanguages[page]),
    },
    {
      title: copy.languages,
      values: report.languages,
      select: (code: string, count: number) => showBreakdown(labelFor(code), count, copy.pages, Object.fromEntries(
        Object.entries(report.pageLanguages).map(([page, counts]) => [page, counts[code]]),
      )),
    },
    {
      title: copy.actions,
      values: report.actions,
      select: (action: string, count: number) => showBreakdown(labelFor(action), count, copy.source, report.actionSources[action]),
    },
  ];

  return (
    <main className="member-page site-analytics-page">
      <header className="member-header">
        <div className="member-topbar"><BrandMark /><div className="member-header-actions"><LanguageToggle /><ThemePicker /></div></div><LanguageAvailability />
      </header>
      <div className="site-report-shell">
        <a className="site-report-back" href="/app"><ArrowLeft size={16} />{copy.back}</a>
        <div className="site-report-heading">
          <div><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.intro}</p></div>
          <div className="dashboard-heading-actions">
            {report && !error && <SiteAnalyticsUsernames copy={copy} />}
            <button className="button button-outline" type="button" onClick={refreshReport} disabled={loading}><RefreshCw size={16} />{copy.refresh}</button>
          </div>
        </div>
        <div className="site-report-ranges" role="group" aria-label={copy.title}>
          {([[SITE_ANALYTICS_RECENT_HOURS, copy.last24], [7, copy.days7], [30, copy.days30], [90, copy.days90], [395, copy.months13]] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={range === value} onClick={() => chooseRange(value)}>{label}</button>
          ))}
        </div>

        {loading && !report ? (
          <div className="loading-panel" role="status"><div><div className="spinner" /><p>{copy.loading}</p></div></div>
        ) : error ? (
          <div className="site-report-error" role="alert">{error}</div>
        ) : report && cardBreakdowns && breakdownLists && (
          <div aria-busy={loading}>
            <div className="site-report-meta">
              <p>{hourly ? `${formatTime(hourly.range.from)} – ${formatTime(hourly.range.through)}` : `${formatDay(report.range.from, true)} – ${formatDay(report.range.through, true)}`}</p>
              <p>{copy.detailHelp}</p>
            </div>
            {coverageNote && <p className="site-report-coverage"><Info size={17} aria-hidden="true" />{coverageNote}</p>}

            <section className="site-report-stats" aria-label={copy.title}>
              {STATS.map(({ key, icon: Icon }) => {
                const item = cardBreakdowns[key];
                const description = "description" in item ? item.description : undefined;
                return (
                  <button key={key} type="button" aria-haspopup="dialog" onClick={() => showBreakdown(copy[key], report.totals[key], item.group, item.values, description)}>
                    <Icon size={19} aria-hidden="true" />
                    <Info className="site-report-card-info" size={16} aria-hidden="true" />
                    <strong>{formats.number.format(report.totals[key])}</strong>
                    <span>{copy[key]}</span>
                  </button>
                );
              })}
            </section>

            <section className="dashboard-card site-report-trend">
              <div className="site-report-section-heading">
                <div><h2>{chartTitle}</h2><p>{hourly ? copy.hourlyHelp : copy.trendHelp}</p></div>
              </div>
              {report.totals.pageViews === 0 && <p className="site-report-empty">{copy.noData}</p>}
              <SiteAnalyticsTrend key={report.range.from} bars={bars} title={chartTitle} unavailable={copy.hourlyUnavailable} formatNumber={formats.number.format} pageViews={copy.pageViews} rtl={isRtlLanguage(language)} select={showChartDetail} />
            </section>

            <div className="site-report-breakdowns">
              {breakdownLists.map(({ title, values, select }) => {
                const rows = ranked(values);
                return (
                  <section className="dashboard-card site-report-list" key={title}>
                    <h2>{title}</h2>
                    {rows.length === 0 ? <p className="site-report-empty">{copy.noData}</p> : (
                      <ol>{rows.map(([label, count]) => (
                        <li key={label}>
                          <button type="button" aria-haspopup="dialog" onClick={() => select(label, count)}>
                            <span>{labelFor(label)}</span>
                            <strong>{formats.number.format(count)}</strong>
                            <Info size={15} aria-hidden="true" />
                          </button>
                        </li>
                      ))}</ol>
                    )}
                  </section>
                );
              })}
            </div>

            <section className="dashboard-card site-report-sources">
              <div className="site-report-section-heading"><div><h2>{copy.sourceQuality}</h2><p>{copy.sourceHelp}</p></div></div>
              {visibleSources.length === 0 ? <p className="site-report-empty">{copy.noData}</p> : (
                <div className="site-report-table-scroll">
                  <table>
                    <thead><tr><th scope="col">{copy.source}</th><th scope="col">{copy.visits}</th><th scope="col">{copy.demo}</th><th scope="col">{copy.created}</th><th scope="col">{copy.active}</th><th scope="col">{copy.rate}</th></tr></thead>
                    <tbody>{visibleSources.map((source) => {
                      const entries = report.sources[source];
                      const activations = report.actionSources.membership_activated[source];
                      const trackedActions = Object.fromEntries(Object.entries(report.actionSources).map(([action, counts]) => [action, counts[source]]));
                      return (
                        <tr key={source}>
                          <th scope="row">
                            <button type="button" aria-haspopup="dialog" onClick={() => setDetail({
                              title: labelFor(source),
                              rows: [[copy.entries, entries], ...ranked(trackedActions).map(([action, count]) => [labelFor(action), count] as const)],
                            })}>{labelFor(source)}<Info size={15} aria-hidden="true" /></button>
                          </th>
                          <td>{formats.number.format(entries)}</td>
                          <td>{formats.number.format(report.actionSources.demo_open[source])}</td>
                          <td>{formats.number.format(report.actionSources.account_created[source])}</td>
                          <td>{formats.number.format(activations)}</td>
                          <td>{entries > 0 ? formats.percent.format(activations / entries) : "—"}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
            </section>

            <aside className="site-report-privacy"><ShieldCheck size={21} aria-hidden="true" /><div><strong>{copy.privateNote}</strong><p>{copy.privateText}</p></div></aside>
          </div>
        )}
      </div>

      <dialog ref={dialog} className="site-report-detail" aria-labelledby={detailTitle} onClose={() => setDetail(null)} onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        {detail && (
          <div className="site-report-detail-content">
            <div className="site-report-detail-heading">
              <h2 id={detailTitle}>{detail.title}</h2>
              <button type="button" aria-label={copy.close} onClick={() => dialog.current?.close()}><X size={21} aria-hidden="true" /></button>
            </div>
            {detail.total !== undefined && <p className="site-report-detail-total">{formats.number.format(detail.total)}</p>}
            {detail.description && <p className="site-report-detail-description">{detail.description}</p>}
            {detail.group && <h3>{detail.group}</h3>}
            {detail.rows && (detail.rows.length === 0 ? <p className="site-report-empty">{copy.noData}</p> : (
              <dl>{detail.rows.map(([label, count]) => <div key={label}><dt>{label}</dt><dd>{formats.number.format(count)}</dd></div>)}</dl>
            ))}
          </div>
        )}
      </dialog>
      <SiteFooter />
    </main>
  );
}
