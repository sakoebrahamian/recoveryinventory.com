import type { Language } from "@/lib/inventory";
import { comparisonLanguageRoutes, comparisonPath, comparisonReviewedDate, comparisonUi, productComparisons, type ProductComparison } from "@/lib/product-comparisons";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

function ComparisonTitle({ text }: { text: string }) {
  return <>{text.split(/(Recovery Inventory|12 Steps Online|InnerAscent)/g).map((part, index) => /^(Recovery Inventory|12 Steps Online|InnerAscent)$/.test(part) ? <bdi className="comparison-product-name" key={index}>{part}</bdi> : part)}</>;
}

function LanguageLinks({ language, slug }: { language: Language; slug?: string }) {
  const routes = comparisonLanguageRoutes(slug);
  return <nav className="about-story-languages" aria-label={language === "fa" ? "انتخاب زبان" : language === "es" ? "Seleccionar idioma" : "Choose language"}>
    <a href={routes.en} lang="en" hrefLang="en" aria-current={language === "en" ? "page" : undefined}>English</a>
    <a href={routes.es} lang="es" hrefLang="es" aria-current={language === "es" ? "page" : undefined}>Español</a>
    <a href={routes.fa} lang="fa" hrefLang="fa" aria-current={language === "fa" ? "page" : undefined}>فارسی</a>
  </nav>;
}

export function ComparisonLinks({ language, exclude, headingLevel = 3 }: { language: Language; exclude?: string; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className="comparison-link-grid">{productComparisons.filter(item => item.slug !== exclude).map(item => <article key={item.slug}>
    <Heading><a href={comparisonPath(language, item.slug)}><ComparisonTitle text={item.title[language]} /></a></Heading>
    <p>{item.description[language]}</p>
  </article>)}</div>;
}

export function ComparisonHub({ language }: { language: Language }) {
  const ui = comparisonUi;
  return <main className="inner-page comparison-page" lang={language} dir={language === "fa" ? "rtl" : "ltr"}>
    <SiteHeader language={language} languageRoutes={comparisonLanguageRoutes()} />
    <article className="comparison-shell">
      <header className="comparison-header"><span className="eyebrow">{ui.eyebrow[language]}</span><h1>{ui.title[language]}</h1><p>{ui.intro[language]}</p><LanguageLinks language={language} /></header>
      <ComparisonLinks language={language} headingLevel={2} />
      <p className="comparison-disclosure">{ui.disclosure[language]}</p>
    </article>
    <SiteFooter language={language} />
  </main>;
}

export function ProductComparisonPage({ language, comparison }: { language: Language; comparison: ProductComparison }) {
  const ui = comparisonUi;
  return <main className="inner-page comparison-page" lang={language} dir={language === "fa" ? "rtl" : "ltr"}>
    <SiteHeader language={language} languageRoutes={comparisonLanguageRoutes(comparison.slug)} />
    <article className="comparison-shell">
      <a className="text-link" href={comparisonPath(language)}>{ui.back[language]}</a>
      <header className="comparison-header"><span className="eyebrow">{ui.eyebrow[language]}</span><h1><ComparisonTitle text={comparison.title[language]} /></h1><p>{comparison.intro[language]}</p><LanguageLinks language={language} slug={comparison.slug} /></header>
      <section aria-labelledby="comparison-table-heading">
        <h2 id="comparison-table-heading">{ui.table[language]}</h2>
        <div className="comparison-rows" role="table" aria-label={comparison.title[language]}>
          <div className="comparison-column-head" role="row"><div role="columnheader">{ui.area[language]}</div><div role="columnheader"><bdi>Recovery Inventory</bdi></div><div role="columnheader"><bdi>{comparison.name[language]}</bdi></div></div>
          {comparison.rows.map(row => <div className="comparison-row" role="row" key={row.label.en}>
            <h3 role="rowheader">{row.label[language]}</h3>
            <div role="cell"><span className="comparison-mobile-label" aria-hidden="true"><bdi>Recovery Inventory</bdi></span><p>{row.ours[language]}</p></div>
            <div role="cell"><span className="comparison-mobile-label" aria-hidden="true"><bdi>{comparison.name[language]}</bdi></span><p>{row.other[language]}</p></div>
          </div>)}
        </div>
      </section>
      <div className="comparison-fit-grid"><section><h2>{ui.chooseUs[language]}</h2><p>{comparison.ourFit[language]}</p></section><section><h2>{ui.chooseOther[language]}</h2><p>{comparison.otherFit[language]}</p></section></div>
      <aside className="comparison-sources"><h2>{ui.sourceHeading[language]}</h2><time dateTime={comparisonReviewedDate}>{ui.reviewed[language]}</time>
        {comparison.sources.length > 0 && <><p>{ui.sourceNote[language]}</p><ul>{comparison.sources.map(source => <li key={source.url}><a href={source.url} hrefLang="en" rel="noopener noreferrer">{source.label[language]}</a></li>)}</ul></>}
        <p>{ui.disclosure[language]}</p>
      </aside>
      <section className="comparison-cta"><h2>{ui.demo[language]}</h2><p>{ui.demoNote[language]}</p><div className="about-story-actions"><a className="button button-primary" href={`/demo?lang=${language}`}>{ui.demo[language]}</a><a className="button button-outline" href="/#membership">{ui.plans[language]}</a></div></section>
      <section><h2>{ui.related[language]}</h2><ComparisonLinks language={language} exclude={comparison.slug} /></section>
    </article>
    <SiteFooter language={language} />
  </main>;
}
