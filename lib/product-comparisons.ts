import type { Language } from "./inventory";
import { subscriptionPricing } from "./subscription-plans";

type Copy = Record<Language, string>;
const text = (en: string, es: string, fa: string): Copy => ({ en, es, fa });
const monthly = (subscriptionPricing.monthly / 100).toFixed(2);
const yearly = (subscriptionPricing.yearly / 100).toFixed(0);

export const comparisonReviewedDate = "2026-11-19";
export const comparisonUi = {
  title: text("Compare your inventory options", "Compara tus opciones de inventario", "روش‌های نوشتن ترازنامه را مقایسه کنید"),
  intro: text("Choose the tools that fit your writing, your budget, and the way you work with your sponsor.", "Elige las herramientas que se adapten a tu escritura, tu presupuesto y tu trabajo con tu padrino o madrina.", "ابزاری را انتخاب کنید که با نوشتن، بودجه و روش کارتان با راهنما هماهنگ باشد."),
  eyebrow: text("A practical comparison", "Una comparación práctica", "یک مقایسه کاربردی"),
  read: text("Read the comparison", "Leer la comparación", "خواندن مقایسه"),
  back: text("All comparisons", "Todas las comparaciones", "همه مقایسه‌ها"),
  area: text("What matters to you", "Lo que te importa", "آنچه برای شما مهم است"),
  table: text("Compare the approach", "Compara el enfoque", "مقایسه روش‌ها"),
  chooseUs: text("When Recovery Inventory may fit", "Cuándo puede servirte Recovery Inventory", "چه زمانی Recovery Inventory مناسب است"),
  chooseOther: text("When the other option may fit", "Cuándo puede servirte la otra opción", "چه زمانی گزینه دیگر مناسب است"),
  sourceHeading: text("Sources and review date", "Fuentes y fecha de revisión", "منابع و تاریخ بررسی"),
  reviewed: text("Reviewed November 19, 2026", "Revisado el 19 de noviembre de 2026", "بررسی‌شده در ۱۹ نوامبر ۲۰۲۶"),
  sourceNote: text("Competitor details come from the linked official pages, not hands-on testing. Prices and features may change; check the provider’s current terms. An unlisted feature is not assumed to be absent.", "Los datos de otros servicios provienen de las páginas oficiales enlazadas, no de pruebas de uso. Los precios y las funciones pueden cambiar; consulta las condiciones actuales del proveedor. No suponemos que una función no mencionada esté ausente.", "اطلاعات سرویس‌های دیگر از صفحات رسمی پیوندشده گرفته شده، نه از آزمایش عملی آن‌ها. قیمت‌ها و امکانات ممکن است تغییر کنند؛ شرایط فعلی ارائه‌دهنده را بررسی کنید. ذکر نشدن یک قابلیت به معنی نبودن آن نیست."),
  disclosure: text("Written by Recovery Inventory. No affiliation or endorsement by the other providers is implied.", "Escrito por Recovery Inventory. No implica afiliación ni respaldo de los otros proveedores.", "نوشته‌شده توسط Recovery Inventory؛ به معنی وابستگی یا تأیید از سوی ارائه‌دهندگان دیگر نیست."),
  demo: text("Try the free demo", "Probar la demostración gratuita", "مشاهده نسخه آزمایشی رایگان"),
  plans: text("See membership plans", "Ver planes de suscripción", "مشاهده طرح‌های اشتراک"),
  demoNote: text("No account or card needed. Demo entries are not saved; live AI guidance requires membership.", "No necesitas cuenta ni tarjeta. Las entradas de prueba no se guardan; la guía de IA en vivo requiere suscripción.", "نیازی به حساب یا کارت نیست. نوشته‌های آزمایشی ذخیره نمی‌شوند؛ راهنمای هوش مصنوعی زنده به اشتراک نیاز دارد."),
  related: text("Keep comparing", "Sigue comparando", "ادامه مقایسه"),
} as const;

const labels = {
  focus: text("Writing and step work", "Escritura y trabajo de Pasos", "نوشتن و کار کردن قدم‌ها"),
  patterns: text("Reviewing patterns", "Revisión de patrones", "مرور الگوها"),
  sharing: text("Sponsor conversations", "Conversaciones con tu padrino o madrina", "گفت‌وگو با راهنما"),
  access: text("Where you use it", "Dónde lo usas", "محل استفاده"),
  language: text("Languages", "Idiomas", "زبان‌ها"),
  free: text("Trying it free", "Probar gratis", "امتحان رایگان"),
  price: text("Price", "Precio", "قیمت"),
};

const ours = {
  focus: text("Step 10: 39 questions across 24 principles. Step 4: six editable workbook sections. This is Recovery Inventory’s own reflection framework.", "Paso 10: 39 preguntas sobre 24 principios. Paso 4: seis secciones editables. Es el marco de reflexión propio de Recovery Inventory.", "گام ۱۰: ۳۹ پرسش درباره ۲۴ اصل. گام ۴: شش بخش قابل ویرایش. این چارچوب تأمل اختصاصی Recovery Inventory است."),
  patterns: text("Date-filtered Step 10 charts, a pattern map, and saved reflections you can revisit alongside your answers.", "Gráficos del Paso 10 por fechas, un mapa de patrones y reflexiones guardadas para revisar junto con tus respuestas.", "نمودارهای گام ۱۰ بر اساس تاریخ، نقشه الگوها و نوشته‌های ذخیره‌شده برای مرور در کنار پاسخ‌ها."),
  sharing: text("Choose individual notes and principles for a sponsor report. Preview, copy, or export a PDF; the reader does not need an account.", "Elige notas y principios para un informe. Revisa, copia o exporta un PDF; quien lo lea no necesita cuenta.", "اصول و یادداشت‌های دلخواه را برای گزارش راهنما انتخاب کنید. پیش‌نمایش، کپی یا خروجی PDF؛ خواننده به حساب نیاز ندارد."),
  access: text("A web app for a phone, tablet, or computer browser. No app-store installation is needed. An internet connection is required.", "Una aplicación web para el navegador del teléfono, tableta u ordenador. No requiere instalación desde una tienda. Necesita conexión a internet.", "وب‌اپ در مرورگر تلفن، تبلت یا رایانه؛ بدون نصب از فروشگاه برنامه. اتصال اینترنت لازم است."),
  language: text("English, Spanish, and Farsi, including right-to-left Farsi. Anonymous username accounts or verified email access.", "Inglés, español y farsi, con escritura de derecha a izquierda. Cuentas con usuario anónimo o correo verificado.", "انگلیسی، اسپانیایی و فارسی با نوشتار راست‌به‌چپ. حساب با نام کاربری ناشناس یا ایمیل تأییدشده."),
  free: comparisonUi.demoNote,
  price: text(`$${monthly} USD monthly or $${yearly} USD yearly, with the same features. Recurring billing until canceled.`, `$${monthly} USD al mes o $${yearly} USD al año, con las mismas funciones. Renovación automática hasta cancelar.`, `${monthly} دلار آمریکا ماهانه یا ${yearly} دلار آمریکا سالانه با امکانات یکسان؛ تمدید خودکار تا زمان لغو.`),
};

export type ProductComparison = {
  slug: string;
  name: Copy;
  title: Copy;
  description: Copy;
  intro: Copy;
  ourFit: Copy;
  otherFit: Copy;
  rows: { label: Copy; ours: Copy; other: Copy }[];
  sources: { label: Copy; url: string }[];
};

export const productComparisons: ProductComparison[] = [
  {
    slug: "12steps-online",
    name: text("12 Steps Online", "12 Steps Online", "12 Steps Online"),
    title: text("Recovery Inventory vs 12 Steps Online", "Recovery Inventory frente a 12 Steps Online", "مقایسه Recovery Inventory و 12 Steps Online"),
    description: text("Compare Recovery Inventory and 12steps.io for structured inventory, journals, pattern review, free access, and pricing.", "Compara Recovery Inventory y 12steps.io: inventarios, diarios, revisión de patrones, acceso gratuito y precios.", "مقایسه Recovery Inventory و 12steps.io برای ترازنامه ساختارمند، روزانه‌نویسی، مرور الگوها، دسترسی رایگان و قیمت."),
    intro: text("Both services let you write recovery reflections in a browser. Recovery Inventory focuses on Step 10 patterns and reusable Step 4 workbooks; 12 Steps Online supports written work across all Twelve Steps and multiple fellowships.", "Ambos servicios permiten escribir reflexiones en un navegador. Recovery Inventory se centra en patrones del Paso 10 y cuadernos reutilizables del Paso 4; 12 Steps Online ofrece trabajo escrito de los Doce Pasos para varias comunidades.", "هر دو سرویس امکان نوشتن تأملات بهبودی در مرورگر را می‌دهند. Recovery Inventory بر الگوهای گام ۱۰ و دفترهای قابل استفاده مجدد گام ۴ تمرکز دارد؛ 12 Steps Online نوشتن برای هر دوازده قدم در انجمن‌های مختلف را ارائه می‌کند."),
    ourFit: text("You want a consistent daily inventory, a clearer view across recorded days, and selected notes to bring to your sponsor. You prefer to explore a demo without first opening an account.", "Quieres un inventario diario constante, una visión de varios días y notas elegidas para tu padrino o madrina. Prefieres explorar una demostración sin crear cuenta.", "ترازنامه روزانه منظم، دید روشن‌تر در میان روزهای ثبت‌شده و یادداشت‌های منتخب برای راهنما می‌خواهید و ترجیح می‌دهید بدون ساخت حساب نمونه را امتحان کنید."),
    otherFit: text("You want one place for written work across all Twelve Steps and multiple fellowships, with a time-limited trial on a new account.", "Buscas un lugar para trabajar por escrito los Doce Pasos de varias comunidades, con una prueba temporal en una cuenta nueva.", "محلی برای نوشتن درباره هر دوازده قدم در انجمن‌های مختلف می‌خواهید، با دوره آزمایشی محدود برای حساب جدید."),
    rows: [
      { label: labels.focus, ours: ours.focus, other: text("Written questions for all Twelve Steps, multiple fellowships, daily journals, and multiple rounds of step work.", "Preguntas escritas de los Doce Pasos, varias comunidades, diarios y varias rondas de trabajo.", "پرسش‌های نوشتاری برای هر دوازده قدم، انجمن‌های مختلف، روزانه‌نویسی و دوره‌های متعدد کار کردن قدم‌ها.") },
      { label: labels.patterns, ours: ours.patterns, other: text("Its site describes analytics, reporting, journal progress, and completion tracking within a step or section.", "Su sitio describe análisis, informes, seguimiento del diario y progreso dentro de cada Paso o sección.", "سایت آن تحلیل، گزارش‌گیری، پیگیری روزانه‌نویسی و میزان تکمیل هر قدم یا بخش را شرح می‌دهد.") },
      { label: labels.access, ours: ours.access, other: text("Its site describes browser access on computers and mobile devices.", "Su sitio describe acceso desde navegadores de ordenadores y dispositivos móviles.", "سایت آن دسترسی با مرورگر رایانه و دستگاه‌های همراه را شرح می‌دهد.") },
      { label: labels.free, ours: ours.free, other: text("A 14-day trial for a new account, followed by a subscription for continued access.", "Prueba de 14 días con una cuenta nueva; después se necesita suscripción para continuar.", "دوره آزمایشی ۱۴ روزه برای حساب جدید؛ پس از آن ادامه دسترسی به اشتراک نیاز دارد.") },
      { label: labels.price, ours: ours.price, other: text("The pricing page lists $3.99 monthly or $39.99 yearly. Confirm currency and current terms at checkout.", "La página indica $3.99 al mes o $39.99 al año. Confirma moneda y condiciones al pagar.", "صفحه قیمت، ماهانه $3.99 یا سالانه $39.99 را نشان می‌دهد. نوع ارز و شرایط فعلی را هنگام پرداخت بررسی کنید.") },
    ],
    sources: [{ label: text("12 Steps Online: features and pricing", "12 Steps Online: funciones y precios", "12 Steps Online: امکانات و قیمت"), url: "https://12steps.io/index.php" }, { label: text("12 Steps Online: trial terms", "12 Steps Online: condiciones de prueba", "12 Steps Online: شرایط دوره آزمایشی"), url: "https://12steps.io/terms-conditions" }],
  },
  {
    slug: "innerascent",
    name: text("InnerAscent", "InnerAscent", "InnerAscent"),
    title: text("Recovery Inventory vs InnerAscent", "Recovery Inventory frente a InnerAscent", "مقایسه Recovery Inventory و InnerAscent"),
    description: text("Compare a focused browser-based Step 4 and Step 10 journal with InnerAscent’s mobile recovery companion, free core tools, and Premium plan.", "Compara un diario web de los Pasos 4 y 10 con la aplicación móvil InnerAscent, sus herramientas gratuitas y su plan Premium.", "مقایسه دفتر گام‌های ۴ و ۱۰ در مرورگر با برنامه همراه InnerAscent، ابزارهای پایه رایگان و طرح پریمیوم آن."),
    intro: text("Recovery Inventory is a focused web journal for Step 10, Step 4, and sponsor-ready pattern reports. InnerAscent is a broader mobile companion with step work, meetings, a clean-time counter, and sponsor tools.", "Recovery Inventory es un diario web centrado en los Pasos 10 y 4 y en informes de patrones. InnerAscent es una aplicación móvil más amplia con Pasos, reuniones, contador de tiempo limpio y herramientas de apadrinamiento.", "Recovery Inventory دفتر وب متمرکز بر گام‌های ۱۰ و ۴ و گزارش الگوها برای راهنماست. InnerAscent برنامه همراه گسترده‌تری با کار کردن قدم‌ها، جلسات، شمارش زمان پاکی و ابزارهای راهنماست."),
    ourFit: text("You mainly want structured inventory and a readable pattern history, and you want to work in the same browser-based journal on a phone or computer. You want to send a selected report without requiring your sponsor to join an app.", "Buscas principalmente inventarios estructurados e historial de patrones y quieres usar el mismo diario web en teléfono u ordenador. Quieres enviar un informe elegido sin que tu padrino o madrina se registre en una aplicación.", "بیشتر به ترازنامه ساختارمند و سابقه روشن الگوها نیاز دارید و می‌خواهید در تلفن یا رایانه از همان دفتر وب استفاده کنید. می‌خواهید گزارش منتخب را بدون نیاز راهنما به عضویت در برنامه بفرستید."),
    otherFit: text("You want a native phone app that also includes meetings, a clean-time counter, offline core tools, and an in-app sponsor connection. You want a full-feature trial and core tools that remain free afterward.", "Prefieres una aplicación móvil con reuniones, contador de tiempo limpio, herramientas básicas sin conexión y vínculo con tu padrino o madrina. Buscas una prueba completa y herramientas básicas gratuitas después.", "برنامه تلفن با جلسات، شمارش زمان پاکی، ابزارهای پایه آفلاین و ارتباط درون‌برنامه‌ای با راهنما می‌خواهید. دوره آزمایشی کامل و ابزارهای پایه رایگان پس از آن برایتان مهم است."),
    rows: [
      { label: labels.focus, ours: ours.focus, other: text("Twelve Steps writing, gratitude journal, meeting finder, clean-time counter, and optional AI reflection.", "Escritura de los Doce Pasos, diario de gratitud, búsqueda de reuniones, contador de tiempo limpio y reflexión con IA opcional.", "نوشتن برای دوازده قدم، دفتر قدردانی، جست‌وجوی جلسات، شمارش زمان پاکی و تأمل اختیاری با هوش مصنوعی.") },
      { label: labels.sharing, ours: ours.sharing, other: text("Sponsor Hub uses invites and consent-based shared notes and sponsor messages.", "Sponsor Hub usa invitaciones, notas compartidas con consentimiento y mensajes de apadrinamiento.", "Sponsor Hub از دعوت، یادداشت‌های مشترک با رضایت و پیام‌های راهنما استفاده می‌کند.") },
      { label: labels.access, ours: ours.access, other: text("Native iOS and Android apps. Its site states there is no web app; core tools support offline use.", "Aplicaciones nativas para iOS y Android. Su sitio indica que no hay aplicación web; las herramientas básicas funcionan sin conexión.", "برنامه بومی iOS و اندروید. سایت آن می‌گوید وب‌اپ ندارد؛ ابزارهای پایه امکان استفاده آفلاین دارند.") },
      { label: labels.language, ours: ours.language, other: text("Its FAQ lists nine languages, including English, Spanish, and Persian, with right-to-left support.", "Sus preguntas frecuentes enumeran nueve idiomas, incluidos inglés, español y persa, con escritura de derecha a izquierda.", "پرسش‌های متداول آن نُه زبان، از جمله انگلیسی، اسپانیایی و فارسی، با پشتیبانی راست‌به‌چپ را ذکر می‌کند.") },
      { label: labels.free, ours: ours.free, other: text("30 days of full access. Core tools remain free afterward; AI, sync, voice journaling, advanced analytics, and meditation require Premium.", "30 días de acceso completo. Después, las herramientas básicas siguen gratis; IA, sincronización, voz, análisis avanzado y meditación requieren Premium.", "۳۰ روز دسترسی کامل. پس از آن ابزارهای پایه رایگان می‌مانند؛ هوش مصنوعی، همگام‌سازی، نوشتن با صدا، تحلیل پیشرفته و مراقبه به پریمیوم نیاز دارند.") },
      { label: labels.price, ours: ours.price, other: text("The current homepage lists Premium at $4.99 USD monthly. Store pricing varies by country; confirm available plans in your store.", "La página principal actual indica Premium a $4.99 USD al mes. El precio varía por país; confirma los planes en tu tienda.", "صفحه اصلی فعلی، پریمیوم را ماهانه ۴٫۹۹ دلار آمریکا اعلام می‌کند. قیمت فروشگاه بسته به کشور فرق دارد؛ طرح‌های موجود را در فروشگاه خود بررسی کنید.") },
    ],
    sources: [{ label: text("InnerAscent: features, platforms, trial, and pricing", "InnerAscent: funciones, plataformas, prueba y precios", "InnerAscent: امکانات، سیستم‌ها، دوره آزمایشی و قیمت"), url: "https://innerascent.app/" }, { label: text("InnerAscent: languages and sponsor sharing", "InnerAscent: idiomas y apadrinamiento", "InnerAscent: زبان‌ها و اشتراک‌گذاری با راهنما"), url: "https://innerascent.app/faq" }],
  },
  {
    slug: "pen-and-paper",
    name: text("Pen and paper", "Papel y bolígrafo", "قلم و کاغذ"),
    title: text("Recovery Inventory vs pen and paper", "Recovery Inventory frente a papel y bolígrafo", "مقایسه Recovery Inventory و قلم و کاغذ"),
    description: text("Compare a paper recovery journal with a structured digital inventory for writing, reviewing patterns, privacy, and sponsor conversations.", "Compara un diario en papel con un inventario digital para escribir, revisar patrones, cuidar tu privacidad y conversar con tu padrino o madrina.", "مقایسه دفتر بهبودی کاغذی با ترازنامه دیجیتال برای نوشتن، مرور الگوها، حریم خصوصی و گفت‌وگو با راهنما."),
    intro: text("A notebook can be enough. Recovery Inventory adds structure and date-based pattern views when rereading pages no longer gives you the overview you want. You can also use both.", "Una libreta puede ser suficiente. Recovery Inventory añade estructura y vistas por fechas cuando releer páginas ya no te da la perspectiva que buscas. También puedes usar ambos.", "یک دفتر ممکن است کافی باشد. وقتی بازخوانی صفحه‌ها دیگر تصویر کلی دلخواه را نمی‌دهد، Recovery Inventory ساختار و مرور الگوها بر اساس تاریخ را اضافه می‌کند. می‌توانید از هر دو استفاده کنید."),
    ourFit: text("You want the same questions each day, an easier way to compare recorded periods, and a focused sponsor summary instead of searching through pages. You are comfortable keeping a private online account.", "Quieres las mismas preguntas cada día, comparar períodos y preparar un resumen sin buscar entre páginas. Te resulta cómodo mantener una cuenta privada en línea.", "هر روز پرسش‌های یکسان، مقایسه آسان‌تر دوره‌ها و خلاصه منتخب برای راهنما می‌خواهید، بدون جست‌وجو میان صفحه‌ها. با حساب خصوصی آنلاین راحت هستید."),
    otherFit: text("Handwriting helps you reflect, you want to write without a device or internet, or you prefer not to store personal writing online. Your sponsor may already have a paper format that works for you.", "Escribir a mano te ayuda, prefieres escribir sin dispositivo ni internet o no guardar textos personales en línea. Quizá ya tienes un formato en papel que funciona con tu padrino o madrina.", "دست‌نویسی به تأملتان کمک می‌کند، بدون دستگاه یا اینترنت می‌نویسید یا نمی‌خواهید نوشته‌های شخصی آنلاین باشند. شاید از قبل قالب کاغذی مناسبی با راهنما دارید."),
    rows: [
      { label: labels.focus, ours: ours.focus, other: text("Write in your own format or use the questions and worksheets you agree on with your sponsor.", "Escribe con tu propio formato o con las preguntas y hojas acordadas con tu padrino o madrina.", "با قالب دلخواه یا پرسش‌ها و برگه‌هایی که با راهنما توافق کرده‌اید بنویسید.") },
      { label: labels.patterns, ours: ours.patterns, other: text("Reread entries, mark repeated themes, and keep any counts or charts yourself.", "Relee entradas, marca temas repetidos y lleva tus propios recuentos o gráficos.", "نوشته‌ها را دوباره بخوانید، موضوعات تکراری را علامت بزنید و شمارش یا نمودار را خودتان تهیه کنید.") },
      { label: labels.sharing, ours: ours.sharing, other: text("Bring selected pages, read passages aloud, or make copies. You decide which writing to share.", "Lleva páginas elegidas, lee fragmentos o haz copias. Tú decides qué compartir.", "صفحات منتخب را ببرید، بخش‌هایی را بخوانید یا کپی تهیه کنید. خودتان تصمیم می‌گیرید چه چیزی را به اشتراک بگذارید.") },
      { label: labels.access, ours: ours.access, other: text("Works without a device, power, an account, or an internet connection. Keep and protect the physical notebook yourself.", "Funciona sin dispositivo, electricidad, cuenta ni internet. Tú guardas y proteges la libreta física.", "بدون دستگاه، برق، حساب یا اینترنت قابل استفاده است. نگهداری و حفاظت از دفتر فیزیکی با خودتان است.") },
      { label: labels.price, ours: ours.price, other: text("No software subscription. Costs depend on the notebook, printing, and supplies you choose.", "Sin suscripción de software. El costo depende de la libreta, impresiones y materiales que elijas.", "بدون اشتراک نرم‌افزار؛ هزینه به دفتر، چاپ و لوازمی که انتخاب می‌کنید بستگی دارد.") },
    ],
    sources: [],
  },
];

export function comparisonBasePath(language: Language): `/${string}` {
  return language === "en" ? "/vs" : `/${language}/vs`;
}

export function comparisonPath(language: Language, slug?: string): `/${string}` {
  return slug ? `${comparisonBasePath(language)}/${slug}` : comparisonBasePath(language);
}

export function comparisonLanguageRoutes(slug?: string) {
  return { en: comparisonPath("en", slug), es: comparisonPath("es", slug), fa: comparisonPath("fa", slug) };
}

export function findProductComparison(slug: string) {
  return productComparisons.find((comparison) => comparison.slug === slug);
}
