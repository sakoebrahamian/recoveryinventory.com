"use client";

import { expandLocalizedRecord } from "@/lib/localization";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { MemberTestimonial } from "./member-testimonials";

const samples = [
  { id: "patience", names: expandLocalizedRecord({ en: "Patience", es: "Paciencia", fa: "صبر" }), practiced: [8, 12, 10, 16, 15, 19] },
  { id: "acceptance", names: expandLocalizedRecord({ en: "Acceptance", es: "Aceptación", fa: "پذیرش" }), practiced: [9, 11, 10, 14, 16, 17] },
  { id: "honesty", names: expandLocalizedRecord({ en: "Honesty", es: "Honestidad", fa: "صداقت" }), practiced: [13, 15, 16, 18, 18, 22] },
] as const;
const recorded = [18, 20, 19, 23, 22, 25];
const copy = expandLocalizedRecord({
  en: {
    eyebrow: "Illustrative example · six months",
    title: "See what repeats beyond a single day.",
    intro: "Look back at your Step 10 entries to see what you’ve been practicing and what needs attention.",
    label: "Choose a principle in the illustrative example",
    month: "Month", answers: "Practiced / answered", percent: "Practiced",
    demo: "Explore the interactive analytics demo",
  },
  es: {
    eyebrow: "Ejemplo ilustrativo · seis meses",
    title: "Observa lo que se repite más allá de un solo día.",
    intro: "Revisa tus entradas del Paso 10 para ver qué has estado practicando y qué necesita atención.",
    label: "Elige un principio en el ejemplo ilustrativo",
    month: "Mes", answers: "Practicado / respondido", percent: "Practicado",
    demo: "Explorar el análisis interactivo de muestra",
  },
  fa: {
    eyebrow: "مثال فرضی · شش ماه",
    title: "فراتر از یک روز، تکرارها را ببینید.",
    intro: "نوشته‌های گام ۱۰ را مرور کنید تا ببینید چه چیزهایی را تمرین کرده‌اید و چه چیزهایی به توجه نیاز دارند.",
    label: "یک اصل را در مثال فرضی انتخاب کنید",
    month: "ماه", answers: "تمرین کردم / پاسخ دادم", percent: "تمرین کردم",
    demo: "مشاهده نمونه تعاملی تحلیل",
  },
});

export function PatternHistoryExample() {
  const { language } = useLanguage();
  const [selected, setSelected] = useState<string>("patience");
  const sample = samples.find(item => item.id === selected) ?? samples[0];
  const text = copy[language];
  const number = new Intl.NumberFormat(language === "fa" ? "fa-IR" : language);
  return <section className="ri-section pattern-history-example" aria-labelledby="pattern-history-title">
    <div className="ri-section-heading"><h2 id="pattern-history-title">{text.title}</h2><p>{text.intro}</p></div>
    <div className="pattern-history-layout">
      <div className="pattern-history-panel">
        <div className="pattern-history-controls" role="group" aria-label={text.label}>
          {samples.map(item => (
            <button type="button" key={item.id} aria-pressed={item.id === selected} onClick={() => setSelected(item.id)}>
              {item.names[language]}
            </button>
          ))}
        </div>
        <table className="pattern-history-table">
          <caption>{sample.names[language]} · {text.eyebrow}</caption>
          <thead><tr><th scope="col">{text.month}</th><th scope="col">{text.answers}</th><th scope="col">{text.percent}</th></tr></thead>
          <tbody>{sample.practiced.map((count, index) => {
            const percent = Math.round(count / recorded[index] * 100);
            return (
              <tr key={index}>
                <th scope="row">{number.format(index + 1)}</th>
                <td><bdi>{number.format(count)} / {number.format(recorded[index])}</bdi></td>
                <td>
                  <div className="pattern-history-bar">
                    <span aria-hidden="true"><i style={{ width: `${percent}%` }} /></span>
                    <strong>{number.format(percent)}{language === "fa" ? "٪" : "%"}</strong>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
        <a className="text-link pattern-history-demo" href={`/demo?step=analytics&lang=${language}`}>{text.demo}</a>
      </div>
      <MemberTestimonial memberId="nancy" />
    </div>
  </section>;
}
