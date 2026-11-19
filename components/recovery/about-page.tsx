import { ShieldCheck } from "lucide-react";
import { aboutCopy, aboutLanguageRoutes } from "@/lib/about-content";
import type { Language } from "@/lib/inventory";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ExternalMentions } from "./external-mentions";

export function AboutPage({ language }: { language: Language }) {
  const copy = aboutCopy[language];

  return (
    <main className="about-page" lang={language} dir={language === "fa" ? "rtl" : "ltr"}>
      <SiteHeader language={language} languageRoutes={aboutLanguageRoutes} />
      <article className="about-story">
        <header className="about-story-header">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p className="about-story-description">{copy.description}</p>
          <p className="about-story-byline">{copy.byline}</p>
          <p className="about-story-anonymity"><ShieldCheck size={19} aria-hidden="true" />{copy.anonymity}</p>
          <nav className="about-story-languages" aria-label={copy.languageLabel}>
            <a href={aboutLanguageRoutes.en} hrefLang="en" lang="en" aria-current={language === "en" ? "page" : undefined}>English</a>
            <a href={aboutLanguageRoutes.es} hrefLang="es" lang="es" aria-current={language === "es" ? "page" : undefined}>Español</a>
            <a href={aboutLanguageRoutes.fa} hrefLang="fa" lang="fa" aria-current={language === "fa" ? "page" : undefined}>فارسی</a>
          </nav>
        </header>
        <div className="about-story-body">
          {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ExternalMentions language={language} />
        <footer className="about-story-contact">
          <h2>{copy.contactHeading}</h2>
          <p>{copy.contactText}</p>
          <div className="about-story-actions">
            <a href="mailto:support@recoveryinventory.com" className="button button-outline">{copy.contactLabel}</a>
            <a href={`/demo?lang=${language}`} className="button button-primary">{copy.demoLabel}</a>
          </div>
        </footer>
      </article>
      <SiteFooter language={language} />
    </main>
  );
}
