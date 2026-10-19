"use client";

import type { Language } from "@/lib/inventory";
import { useLanguage } from "./language-provider";

const copy = {
  en: {
    title: "Understand your patterns, one recorded day at a time.",
    intro: "Member analytics brings your saved Step 10 answers and writing together. Choose a day, week, month, year, or custom range; every summary follows those dates.",
    features: [
      ["See patterns at a glance", "Choose Last 30 days or any date range. Green and orange principle bars show recorded strengths and recurring concerns. A pattern map shows how answers repeat across days; select a square to inspect its answers."],
      ["Explore all 24 principles", "Open a principle to review its main question, independent follow-ups, dated answers, and notes. Follow selected principles in weekly or monthly trends."],
      ["Find a recorded day", "Use the marked-day calendar to inspect daily counts and reopen an inventory. Days without an entry are never treated as negative answers."],
      ["Read your own words", "Filter and search your saved reflections about gratitude, relationships, amends, concerns, and next actions. Original writing stays in its original language."],
      ["Choose what to share", "Build a focused sponsor report with selected principles and individual notes. Preview it, copy it, or print a PDF. No notes are selected automatically."],
      ["Keep the meaning clear", "Practiced percentages count only Practiced and Needs attention answers. This is a description of your answers, not a recovery grade."],
    ],
    label: "Didn’t come up today",
    explanation: "Choose this when you did not encounter the situation or have an opportunity to practice it that day. It is separate from an unanswered question and does not change your Practiced percentage.",
    sample: "Illustrative example · five recorded answers in each period",
    principle: "Principle", previous: "Previous period", selected: "Selected period",
    names: ["Patience", "Acceptance", "Honesty"],
    footnote: "4/5 means four Practiced answers out of five Practiced or Needs attention answers. Follow-ups have separate answers. Older inventories keep their original question set.",
    demo: "Explore sample member analytics", compact: "How member analytics works",
  },
  es: {
    title: "Comprende tus patrones, un día registrado a la vez.",
    intro: "El análisis para miembros reúne tus respuestas y textos guardados del Paso 10. Elige un día, semana, mes, año o intervalo personalizado; todos los resúmenes siguen esas fechas.",
    features: [
      ["Observa tus patrones de un vistazo", "Elige los últimos 30 días o cualquier intervalo. Las barras verdes y naranjas muestran fortalezas registradas y preocupaciones repetidas por principio. Un mapa muestra cómo se repiten las respuestas a lo largo de los días; selecciona un cuadro para revisarlas."],
      ["Explora los 24 principios", "Abre un principio para revisar su pregunta principal, seguimientos independientes, respuestas fechadas y notas. Sigue principios elegidos en tendencias semanales o mensuales."],
      ["Encuentra un día registrado", "Usa el calendario de días marcados para revisar los totales diarios y volver a abrir un inventario. Los días sin entrada nunca se consideran respuestas negativas."],
      ["Lee tus propias palabras", "Filtra y busca tus reflexiones guardadas sobre gratitud, relaciones, reparaciones, preocupaciones y próximas acciones. Tus textos conservan su idioma original."],
      ["Elige qué compartir", "Prepara un informe enfocado para tu padrino o madrina con principios y notas individuales elegidos. Revisa la vista previa, cópialo o imprime un PDF. Ninguna nota se selecciona automáticamente."],
      ["Entiende cada resultado", "Los porcentajes de Practicado solo cuentan respuestas Practicado y Necesita atención. Describen tus respuestas; no son una calificación de recuperación."],
    ],
    label: "No se presentó hoy",
    explanation: "Elige esta opción cuando no te encontraste con esa situación o no tuviste oportunidad de practicarla ese día. Es distinta de una pregunta sin responder y no cambia tu porcentaje de Practicado.",
    sample: "Ejemplo ilustrativo · cinco respuestas registradas en cada período",
    principle: "Principio", previous: "Período anterior", selected: "Período elegido",
    names: ["Paciencia", "Aceptación", "Honestidad"],
    footnote: "4/5 significa cuatro respuestas Practicado entre cinco respuestas Practicado o Necesita atención. Los seguimientos tienen respuestas separadas. Los inventarios antiguos conservan sus preguntas originales.",
    demo: "Explorar el análisis de muestra para miembros", compact: "Cómo funciona el análisis para miembros",
  },
  fa: {
    title: "الگوهای خود را، روز به روز، بهتر بشناسید.",
    intro: "تحلیل اعضا پاسخ‌ها و نوشته‌های ذخیره‌شده گام ۱۰ را کنار هم قرار می‌دهد. یک روز، هفته، ماه، سال یا بازه دلخواه انتخاب کنید؛ همه خلاصه‌ها از همان تاریخ‌ها پیروی می‌کنند.",
    features: [
      ["الگوها را در یک نگاه ببینید", "۳۰ روز گذشته یا هر بازه‌ای را انتخاب کنید. نوارهای سبز و نارنجی نقاط قوت ثبت‌شده و نگرانی‌های تکرارشونده هر اصل را نشان می‌دهند. نقشه الگوها تکرار پاسخ‌ها در روزها را نشان می‌دهد؛ برای بررسی پاسخ‌ها، یک خانه را انتخاب کنید."],
      ["هر ۲۴ اصل را بررسی کنید", "هر اصل را باز کنید و پرسش اصلی، پاسخ‌های جداگانه تکمیلی، پاسخ‌های تاریخ‌دار و یادداشت‌ها را ببینید. روند هفتگی یا ماهانه اصول مورد نظر را دنبال کنید."],
      ["روز ثبت‌شده را پیدا کنید", "با تقویم روزهای علامت‌دار، شمارش‌های روزانه را ببینید و ترازنامه را دوباره باز کنید. روز بدون نوشته هرگز پاسخ منفی محسوب نمی‌شود."],
      ["نوشته‌های خود را بخوانید", "نوشته‌های ذخیره‌شده درباره قدردانی، روابط، جبران، نگرانی‌ها و اقدام‌های بعدی را فیلتر و جست‌وجو کنید. زبان اصلی نوشته‌های شما حفظ می‌شود."],
      ["آنچه به اشتراک می‌گذارید انتخاب کنید", "گزارش منتخب حامی را با اصول و یادداشت‌های دلخواه بسازید. پیش‌نمایش را بررسی کنید، کپی کنید یا PDF بگیرید. هیچ یادداشتی خودکار انتخاب نمی‌شود."],
      ["معنای نتیجه‌ها را بدانید", "درصد تمرین فقط پاسخ‌های «تمرین کردم» و «نیازمند توجه» را حساب می‌کند. این توصیف پاسخ‌های شماست، نه نمره بهبودی."],
    ],
    label: "امروز پیش نیامد",
    explanation: "وقتی آن روز با این موقعیت روبه‌رو نشدید یا فرصتی برای تمرین آن نداشتید، این گزینه را انتخاب کنید. این گزینه با پرسش بی‌پاسخ فرق دارد و درصد «تمرین کردم» را تغییر نمی‌دهد.",
    sample: "مثال فرضی · پنج پاسخ ثبت‌شده در هر بازه",
    principle: "اصل", previous: "بازه پیشین", selected: "بازه انتخاب‌شده",
    names: ["صبر", "پذیرش", "صداقت"],
    footnote: "۴/۵ یعنی چهار پاسخ «تمرین کردم» از پنج پاسخ «تمرین کردم» یا «نیازمند توجه». پرسش‌های تکمیلی پاسخ‌های جداگانه دارند. ترازنامه‌های قدیمی مجموعه پرسش‌های اصلی خود را حفظ می‌کنند.",
    demo: "مشاهده نمونه تحلیل اعضا", compact: "تحلیل اعضا چگونه کار می‌کند",
  },
} as const;

export function AnalyticsFeatureGuide({ language: explicitLanguage, compact = false }: { language?: Language; compact?: boolean }) {
  const { language: currentLanguage } = useLanguage();
  const language = explicitLanguage ?? currentLanguage;
  const text = copy[language];
  const content = <>
    <h2>{text.title}</h2><p>{text.intro}</p>
    <div className="analytics-public-features">{text.features.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
    <aside className="analytics-public-label"><strong>{text.label}</strong><p>{text.explanation}</p></aside>
    <div className="analytics-table-scroll"><table className="analytics-data-table"><caption>{text.sample}</caption><thead><tr><th>{text.principle}</th><th>{text.previous}</th><th>{text.selected}</th></tr></thead><tbody>{text.names.map((name, index) => <tr key={name}><th scope="row">{name}</th><td>{["3/5 · 60%", "2/5 · 40%", "4/5 · 80%"][index]}</td><td>{["4/5 · 80%", "3/5 · 60%", "4/5 · 80%"][index]}</td></tr>)}</tbody></table></div><p>{text.footnote}</p><a href="/demo?step=analytics" className="button button-primary">{text.demo}</a>
  </>;
  return <section className="analytics-public-guide" lang={language} dir={language === "fa" ? "rtl" : "ltr"}>{compact ? <details><summary>{text.compact}</summary>{content}</details> : content}</section>;
}
