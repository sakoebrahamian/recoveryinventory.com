import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  Compass,
  KeyRound,
  MoonStar,
  NotebookPen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Language } from "@/lib/inventory";
import {
  learningBasePath,
  learningHubCopy,
  learningLanguageRoutes,
  learningTopicPath,
  publicLearningTopics,
  type PublicLearningTopic,
} from "@/lib/public-learning";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const articleUi: Record<Language, {
  back: string;
  pathway: string;
  continue: string;
  privateTools: string;
  privateToolsText: string;
  demo: string;
  join: string;
  safety: string;
}> = {
  en: {
    back: "Learning center",
    pathway: "A practical pathway",
    continue: "Continue learning",
    privateTools: "Put the ideas into practice",
    privateToolsText: "Preview the private Step 10, Step 4, analytics, and member learning tools before joining.",
    demo: "Try the demo",
    join: "View membership",
    safety: "Independent educational material · Not professional or crisis care",
  },
  es: {
    back: "Centro de aprendizaje",
    pathway: "Un camino práctico",
    continue: "Continuar aprendiendo",
    privateTools: "Pon las ideas en práctica",
    privateToolsText: "Prueba las herramientas privadas del Paso 10, Paso 4, análisis y aprendizaje para miembros antes de unirte.",
    demo: "Probar la demostración",
    join: "Ver membresía",
    safety: "Material educativo independiente · No es atención profesional ni apoyo para crisis",
  },
  fa: {
    back: "مرکز آموزش",
    pathway: "یک مسیر عملی",
    continue: "ادامه یادگیری",
    privateTools: "مفاهیم را تمرین کنید",
    privateToolsText: "پیش از عضویت، ابزارهای خصوصی گام دهم، گام چهارم، تحلیل و آموزش اعضا را امتحان کنید.",
    demo: "مشاهده نسخه آزمایشی",
    join: "مشاهده عضویت",
    safety: "محتوای آموزشی مستقل · نه مراقبت حرفه‌ای یا پشتیبانی بحران",
  },
};

function DirectionalArrow({ language }: { language: Language }) {
  return language === "fa" ? <ArrowLeft size={17} /> : <ArrowRight size={17} />;
}

function TopicIcon({ topic }: { topic: PublicLearningTopic }) {
  if (topic.id === "step10") return <MoonStar size={25} />;
  if (topic.id === "step4") return <NotebookPen size={25} />;
  return <Compass size={25} />;
}

function LanguageLinks({ language, slug }: { language: Language; slug?: string }) {
  const routes = learningLanguageRoutes(slug);
  const label = learningHubCopy[language].languageLabel;
  return (
    <nav className="public-learning-languages" aria-label={label}>
      <span>{label}</span>
      <div>
        <a href={routes.en} hrefLang="en" aria-current={language === "en" ? "page" : undefined}>English</a>
        <a href={routes.es} hrefLang="es" aria-current={language === "es" ? "page" : undefined}>Español</a>
        <a href={routes.fa} hrefLang="fa" aria-current={language === "fa" ? "page" : undefined}>فارسی</a>
      </div>
    </nav>
  );
}

export function PublicLearningHub({ language }: { language: Language }) {
  const copy = learningHubCopy[language];
  const languageRoutes = learningLanguageRoutes();
  const dir = language === "fa" ? "rtl" : "ltr";

  return (
    <main className="inner-page public-learning-page" lang={language} dir={dir}>
      <SiteHeader language={language} languageRoutes={languageRoutes} />
      <section className="public-learning-hero">
        <div className="public-learning-hero-mark" aria-hidden="true"><BookOpenText size={30} /></div>
        <div className="public-learning-hero-copy">
          <span className="public-learning-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <LanguageLinks language={language} />
        </div>
      </section>

      <section className="public-learning-library" aria-labelledby="learning-library-title">
        <header>
          <span><Sparkles size={16} /> {copy.libraryLabel}</span>
          <h2 id="learning-library-title">{copy.sectionTitle}</h2>
          <p>{copy.sectionIntro}</p>
        </header>
        <div className="public-learning-card-grid">
          {publicLearningTopics.map((topic, index) => {
            const topicCopy = topic.copy[language];
            return (
              <article className={`public-learning-card public-learning-card-${topic.id}`} key={topic.id}>
                <div className="public-learning-card-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div aria-hidden="true"><TopicIcon topic={topic} /></div>
                </div>
                <small>{topicCopy.eyebrow}</small>
                <h3>{topicCopy.title}</h3>
                <p>{topicCopy.summary}</p>
                <a href={learningTopicPath(language, topic.slug)}>
                  {copy.readGuide}<DirectionalArrow language={language} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="public-learning-cta">
        <div><ShieldCheck size={25} /></div>
        <section>
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaText}</p>
        </section>
        <nav aria-label={copy.ctaTitle}>
          <a className="button button-outline" href="/demo">{copy.demoLabel}</a>
          <a className="button button-primary" href="/join">{copy.joinLabel}</a>
        </nav>
      </section>

      <p className="public-learning-safety"><ShieldCheck size={16} /> {copy.safetyNote}</p>
      <SiteFooter language={language} />
    </main>
  );
}

export function PublicLearningArticlePage({
  language,
  topic,
}: {
  language: Language;
  topic: PublicLearningTopic;
}) {
  const copy = topic.copy[language];
  const ui = articleUi[language];
  const languageRoutes = learningLanguageRoutes(topic.slug);
  const dir = language === "fa" ? "rtl" : "ltr";
  const relatedTopics = publicLearningTopics.filter((candidate) => candidate.id !== topic.id);

  return (
    <main className="inner-page public-learning-page" lang={language} dir={dir}>
      <SiteHeader language={language} languageRoutes={languageRoutes} />

      <article className="public-learning-article">
        <header className={`public-learning-article-hero public-learning-article-${topic.id}`}>
          <a className="public-learning-back" href={learningBasePath(language)}>
            {language === "fa" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}{ui.back}
          </a>
          <span className="public-learning-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.lead}</p>
          <LanguageLinks language={language} slug={topic.slug} />
        </header>

        <div className="public-learning-article-layout">
          <div className="public-learning-article-body">
            <section className="public-learning-context">
              <h2>{copy.contextTitle}</h2>
              {copy.contextParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>

            <section className="public-learning-pathway" aria-labelledby="learning-pathway-title">
              <span><Compass size={17} /> {ui.pathway}</span>
              <h2 id="learning-pathway-title">{copy.stagesTitle}</h2>
              <p>{copy.stagesIntro}</p>
              <div className="public-learning-stage-list">
                {copy.stages.map((stage) => (
                  <article key={stage.title}>
                    <div className="public-learning-stage-number">{stage.label}</div>
                    <div>
                      <h3>{stage.title}</h3>
                      <p>{stage.description}</p>
                      <ul>{stage.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="public-learning-practice">
              <h2>{copy.practiceTitle}</h2>
              <ul>{copy.practices.map((practice) => <li key={practice}><Check size={17} />{practice}</li>)}</ul>
            </section>

            <aside className="public-learning-reflection">
              <Sparkles size={24} />
              <div><h2>{copy.reflectionTitle}</h2><p>{copy.reflection}</p></div>
            </aside>

            <section className="public-learning-closing">
              <h2>{copy.closingTitle}</h2>
              <p>{copy.closing}</p>
            </section>
          </div>

          <aside className="public-learning-article-sidebar">
            <section className="public-learning-tool-card">
              <div><KeyRound size={22} /></div>
              <h2>{ui.privateTools}</h2>
              <p>{ui.privateToolsText}</p>
              <a className="button button-primary" href="/demo">{ui.demo}</a>
              <a className="button button-outline" href="/join">{ui.join}</a>
            </section>
            <section className="public-learning-related">
              <span>{ui.continue}</span>
              {relatedTopics.map((related) => (
                <a href={learningTopicPath(language, related.slug)} key={related.id}>
                  <TopicIcon topic={related} />
                  <span><small>{related.copy[language].eyebrow}</small><strong>{related.copy[language].title}</strong></span>
                  <DirectionalArrow language={language} />
                </a>
              ))}
            </section>
            <p className="public-learning-sidebar-safety"><ShieldCheck size={15} />{ui.safety}</p>
          </aside>
        </div>
      </article>

      <SiteFooter language={language} />
    </main>
  );
}
