"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";

const samples = [
  { id: "patience", names: { en: "Patience", es: "Paciencia", fa: "صبر" }, practiced: [8, 12, 10, 16, 15, 19] },
  { id: "acceptance", names: { en: "Acceptance", es: "Aceptación", fa: "پذیرش" }, practiced: [9, 11, 10, 14, 16, 17] },
  { id: "honesty", names: { en: "Honesty", es: "Honestidad", fa: "صداقت" }, practiced: [13, 15, 16, 18, 18, 22] },
] as const;
const recorded = [18, 20, 19, 23, 22, 25];
const copy = {
  en: {
    eyebrow: "Illustrative example · six months",
    title: "See what repeats beyond a single day.",
    intro: "One difficult evening does not tell the whole story. Reviewing several months can help you notice recurring concerns and choose a more specific conversation with your sponsor.",
    label: "Choose a principle in the illustrative example",
    caption: "Illustrative six-month answers, not a member’s results or a prediction. Bars show the percentage of recorded Practiced or Needs attention answers marked Practiced.",
    month: "Month", answers: "Practiced / answered", percent: "Practiced",
    question: "A question to bring to your sponsor",
    reflection: "What was happening in the months when {principle} needed more attention? Which response could I practice next time?",
    meaning: "The bars describe recorded answers. Practiced percentages count only Practiced and Needs attention; unrecorded days and Didn’t come up today are excluded. A rising bar is not a recovery score, and change does not have to follow a straight line.",
    demo: "Explore the interactive analytics demo",
  },
  es: {
    eyebrow: "Ejemplo ilustrativo · seis meses",
    title: "Observa lo que se repite más allá de un solo día.",
    intro: "Una noche difícil no cuenta toda la historia. Revisar varios meses puede ayudarte a notar preocupaciones repetidas y preparar una conversación más concreta con tu padrino o madrina.",
    label: "Elige un principio en el ejemplo ilustrativo",
    caption: "Respuestas ilustrativas de seis meses; no son resultados de un miembro ni una predicción. Las barras muestran el porcentaje de respuestas Practicado entre Practicado y Necesita atención.",
    month: "Mes", answers: "Practicado / respondido", percent: "Practicado",
    question: "Una pregunta para tu padrino o madrina",
    reflection: "¿Qué ocurría en los meses en que {principle} necesitaba más atención? ¿Qué respuesta podría practicar la próxima vez?",
    meaning: "Las barras describen respuestas registradas. El porcentaje solo cuenta Practicado y Necesita atención; excluye días sin registro y No se presentó hoy. Una barra más alta no es una calificación de recuperación, y el cambio no tiene que ser lineal.",
    demo: "Explorar el análisis interactivo de muestra",
  },
  fa: {
    eyebrow: "مثال فرضی · شش ماه",
    title: "فراتر از یک روز، تکرارها را ببینید.",
    intro: "یک شب دشوار تمام داستان نیست. مرور چند ماه می‌تواند به دیدن نگرانی‌های تکرارشونده و آماده کردن گفت‌وگویی مشخص‌تر با راهنما کمک کند.",
    label: "یک اصل را در مثال فرضی انتخاب کنید",
    caption: "پاسخ‌های فرضی شش‌ماهه؛ نه نتیجه یک عضو و نه پیش‌بینی آینده. نوارها درصد پاسخ‌های «تمرین کردم» از میان «تمرین کردم» و «نیازمند توجه» را نشان می‌دهند.",
    month: "ماه", answers: "تمرین کردم / پاسخ دادم", percent: "تمرین کردم",
    question: "پرسشی برای گفت‌وگو با راهنما",
    reflection: "در ماه‌هایی که {principle} به توجه بیشتری نیاز داشت چه اتفاقی می‌افتاد؟ دفعه بعد چه پاسخی را می‌توانم تمرین کنم؟",
    meaning: "نوارها پاسخ‌های ثبت‌شده را توصیف می‌کنند. درصد فقط پاسخ‌های «تمرین کردم» و «نیازمند توجه» را حساب می‌کند؛ روزهای بدون ثبت و «امروز پیش نیامد» کنار گذاشته می‌شوند. نوار بالاتر نمره بهبودی نیست و تغییر همیشه مسیر مستقیمی ندارد.",
    demo: "مشاهده نمونه تعاملی تحلیل",
  },
};

export function PatternHistoryExample() {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>("patience");
  const sample = samples.find(item => item.id === selected) ?? samples[0];
  const text = copy[language];
  const number = new Intl.NumberFormat(language === "fa" ? "fa-IR" : language);
  return <section className="ri-section pattern-history-example" aria-labelledby="pattern-history-title">
    <div className="ri-section-heading"><span>{text.eyebrow}</span><h2 id="pattern-history-title">{text.title}</h2><p>{text.intro}</p></div>
    <div className="pattern-history-panel">
      <div className="pattern-history-controls" role="group" aria-label={text.label}>{samples.map(item => <button type="button" key={item.id} aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}>{item.names[language]}</button>)}</div>
      <table className="pattern-history-table">
        <caption>{sample.names[language]} · {text.caption}</caption>
        <thead><tr><th scope="col">{text.month}</th><th scope="col">{text.answers}</th><th scope="col">{text.percent}</th></tr></thead>
        <tbody>{sample.practiced.map((count, index) => {
          const percent = Math.round(count / recorded[index] * 100);
          return <tr key={index}><th scope="row">{number.format(index + 1)}</th><td><bdi>{number.format(count)} / {number.format(recorded[index])}</bdi></td><td><div className="pattern-history-bar"><span aria-hidden="true"><i style={{ width: `${percent}%` }} /></span><strong>{number.format(percent)}{language === "fa" ? "٪" : "%"}</strong></div></td></tr>;
        })}</tbody>
      </table>
      <p className="pattern-history-meaning">{text.meaning}</p>
      <aside className="pattern-history-reflection"><h3>{text.question}</h3><p>{text.reflection.replace("{principle}", sample.names[language])}</p></aside>
      <a className="text-link" href={`/demo?step=analytics&lang=${language}`}>{text.demo}</a>
    </div>
  </section>;
}
