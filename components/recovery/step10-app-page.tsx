
import { isRtlLanguage } from "@/lib/languages";
import type { Language } from "@/lib/inventory";
import { findLearningTopic, learningTopicPath } from "@/lib/public-learning";
import { step10AppCopy, step10AppRoutes } from "@/lib/step10-app-content";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Step10InventoryTemplate } from "./step10-inventory-template";

export function Step10AppPage({ language }: { language: Language }) {
  const copy = step10AppCopy[language];
  const template = findLearningTopic("step-10-daily-inventory")?.copy[language].inventoryTemplate;
  return <main className="inner-page public-learning-page" lang={language} dir={isRtlLanguage(language) ? "rtl" : "ltr"}>
    <SiteHeader language={language} languageRoutes={step10AppRoutes} />
    <section className="public-learning-hero"><div className="public-learning-hero-copy">
      <span className="public-learning-eyebrow">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p>
      <div className="step10-app-actions"><a className="button button-primary" href={`/demo?step=10&lang=${language}`}>{copy.demo}</a><a className="button button-outline" href={`/join?lang=${language}`}>{copy.join}</a></div>
    </div></section>
    <article className="step10-app-content"><p>{copy.lead}</p>
      <section><h2>{copy.questionsTitle}</h2><p>{copy.questions}</p></section>
      <section><h2>{copy.historyTitle}</h2><p>{copy.history}</p></section>
      {template && <Step10InventoryTemplate language={language} template={template} />}
      <section><h2>{copy.freeTitle}</h2><p>{copy.free}</p><a className="button button-primary" href={`/join?lang=${language}`}>{copy.join}</a></section>
      <section><h2>{copy.scopeTitle}</h2><p>{copy.scope}</p></section>
      <nav className="step10-app-actions" aria-label={copy.guide}><a href={learningTopicPath(language,"step-10-daily-inventory")}>{copy.guide}</a><a href={learningTopicPath(language,"step-4-personal-inventory")}>{copy.related}</a></nav>
    </article><SiteFooter language={language} />
  </main>;
}
