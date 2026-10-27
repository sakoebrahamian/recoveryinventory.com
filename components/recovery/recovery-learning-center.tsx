"use client";

import * as React from "react";
import { ArrowRight, BookOpenText, Check, ChevronDown, Compass, Search, Sparkles } from "lucide-react";
import { principleCategories, principles, principleQuestion, principleFollowUpQuestions } from "@/lib/inventory";
import { characterDefects, localized, principleGuides } from "@/lib/recovery-learning";
import { originalFrameworkGuidance } from "@/lib/recovery-guidance";
import { useLanguage } from "./language-provider";

type LearningView = "defects" | "principles";

type RecoveryLearningCenterProps = {
  demo?: boolean;
  initialView?: LearningView;
};

export function RecoveryLearningCenter({ demo = false, initialView = "defects" }: RecoveryLearningCenterProps) {
  const { language, t } = useLanguage();
  const [view, setView] = React.useState<LearningView>(initialView);
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase(language === "fa" ? "fa-IR" : language === "es" ? "es" : "en");

  const principleById = React.useMemo(() => new Map(principles.map((principle) => [principle.id, principle])), []);
  const guideById = React.useMemo(() => new Map(principleGuides.map((guide) => [guide.id, guide])), []);

  const visibleDefects = React.useMemo(() => characterDefects.filter((defect) => {
    if (!normalizedQuery) return true;
    const searchable = [
      localized(defect.name, language),
      localized(defect.definition, language),
      ...defect.shortcomings.flatMap((item) => [localized(item.name, language), localized(item.explanation, language)]),
      ...defect.principleIds.map((id) => {
        const principle = principleById.get(id);
        return principle ? (language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en) : "";
      }),
    ].join(" ").toLocaleLowerCase(language === "fa" ? "fa-IR" : language === "es" ? "es" : "en");
    return searchable.includes(normalizedQuery);
  }), [language, normalizedQuery, principleById]);

  const visiblePrinciples = React.useMemo(() => principles.filter((principle) => {
    if (!normalizedQuery) return true;
    const guide = guideById.get(principle.id);
    const searchable = [
      language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en,
      language === "fa" ? principle.promptFa : language === "es" ? principle.promptEs : principle.promptEn,
      guide ? localized(guide.definition, language) : "",
      ...(guide?.practices.map((practice) => localized(practice, language)) ?? []),
    ].join(" ").toLocaleLowerCase(language === "fa" ? "fa-IR" : language === "es" ? "es" : "en");
    return searchable.includes(normalizedQuery);
  }), [guideById, language, normalizedQuery]);

  return (
    <section className="learning-center" data-learning-center>
      <header className="learning-hero">
        <div className="learning-hero-icon"><BookOpenText size={28} /></div>
        <div>
          <span>{demo ? t("Interactive learning preview", "پیش‌نمایش تعاملی آموزش") : t("Member learning center", "مرکز آموزش اعضا")}</span>
          <h2>{t("Understand the pattern—and practice a different response.", "الگو را بشناسید و پاسخی متفاوت را تمرین کنید.")}</h2>
          <p>{t("Explore patterns, examples of behavior, principles to practice, and suggested actions for personal reflection.", "الگوها، نمونه‌های رفتاری، اصول قابل تمرین و اقدام‌های پیشنهادی برای تأمل شخصی را بررسی کنید.")}</p>
        </div>
      </header>

      <p className="learning-safety-note">{originalFrameworkGuidance(t)}</p>

      <div className="learning-map" aria-label={t("Learning path", "مسیر یادگیری")}>
        <span><b>1</b>{t("Pattern / character defect", "الگو / نقص شخصیتی")}</span>
        <ArrowRight size={17} aria-hidden="true" />
        <span><b>2</b>{t("Related behaviors", "رفتارهای مرتبط")}</span>
        <ArrowRight size={17} aria-hidden="true" />
        <span><b>3</b>{t("Principles to practice", "اصول قابل تمرین")}</span>
        <ArrowRight size={17} aria-hidden="true" />
        <span><b>4</b>{t("Suggested actions", "اقدام‌های پیشنهادی")}</span>
      </div>

      <div className="learning-toolbar">
        <div className="learning-tabs" role="tablist" aria-label={t("Choose a learning library", "انتخاب کتابخانه آموزشی")}>
          <button className={view === "defects" ? "is-active" : ""} type="button" role="tab" aria-selected={view === "defects"} onClick={() => setView("defects")}>
            <Compass size={17} />{t("Defects & recovery paths", "نقص‌ها و مسیرهای بهبودی")}
          </button>
          <button className={view === "principles" ? "is-active" : ""} type="button" role="tab" aria-selected={view === "principles"} onClick={() => setView("principles")}>
            <Sparkles size={17} />{t("Principles for personal reflection", "اصول برای تأمل شخصی")}
          </button>
        </div>
        <label className="learning-search">
          <Search size={17} />
          <span className="sr-only">{t("Search the learning center", "جست‌وجو در مرکز آموزش")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search a pattern, behavior, or principle", "جست‌وجوی الگو، رفتار یا اصل")} />
        </label>
      </div>

      {view === "defects" ? (
        <div className="learning-defect-list">
          {visibleDefects.map((defect, index) => (
            <details className="learning-defect-card" key={defect.id} open={!normalizedQuery && index === 0}>
              <summary>
                <span><small>{t("Pattern / character defect", "الگو / نقص شخصیتی")}</small><strong>{localized(defect.name, language)}</strong></span>
                <ChevronDown size={20} />
              </summary>
              <div className="learning-defect-body">
                <section className="learning-definition">
                  <span>{t("What it means", "معنای آن")}</span>
                  <p>{localized(defect.definition, language)}</p>
                </section>

                <section>
                  <div className="learning-section-title"><span>2</span><div><h3>{t("Examples of related behaviors", "نمونه‌هایی از رفتارهای مرتبط")}</h3><p>{t("These examples show how this pattern may appear in everyday actions and reactions.", "این نمونه‌ها نشان می‌دهند این الگو چگونه ممکن است در رفتارها و واکنش‌های روزمره ظاهر شود.")}</p></div></div>
                  <div className="shortcoming-grid">
                    {defect.shortcomings.map((item) => (
                      <article key={localized(item.name, language)}><strong>{localized(item.name, language)}</strong><p>{localized(item.explanation, language)}</p></article>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="learning-section-title"><span>3</span><div><h3>{t("Principles to practice with this pattern", "اصول قابل تمرین در برابر این الگو")}</h3><p>{t("Open any principle to learn what it means and how to practice it.", "هر اصل را باز کنید تا معنای آن و روش تمرینش را بیاموزید.")}</p></div></div>
                  <div className="learning-principle-links">
                    {defect.principleIds.map((id) => {
                      const principle = principleById.get(id);
                      if (!principle) return null;
                      return <button type="button" key={id} onClick={() => { setView("principles"); setQuery(language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en); window.requestAnimationFrame(() => document.querySelector("[data-learning-center]")?.scrollIntoView({ behavior: "smooth", block: "start" })); }}>{language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en}<ArrowRight size={14} /></button>;
                    })}
                  </div>
                </section>

                <section>
                  <div className="learning-section-title"><span>4</span><div><h3>{t("Suggested actions for reflection", "اقدام‌های پیشنهادی برای تأمل")}</h3><p>{t("Small, repeated actions help turn a principle into a lived response.", "اقدام‌های کوچک و تکرارشونده کمک می‌کنند یک اصل به رفتاری عملی تبدیل شود.")}</p></div></div>
                  <ol className="recovery-path-list">
                    {defect.recoveryPath.map((step, stepIndex) => <li key={localized(step, language)}><span>{stepIndex + 1}</span><p>{localized(step, language)}</p></li>)}
                  </ol>
                </section>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="learning-principle-groups">
          {principleCategories.map((category) => {
            const group = visiblePrinciples.filter((principle) => principle.category === category.id);
            if (!group.length) return null;
            return (
              <section key={category.id}>
                <div className="learning-group-title"><span>{language === "fa" ? category.fa : language === "es" ? category.es : category.en}</span><b>{group.length}</b></div>
                <div className="learning-principle-grid">
                  {group.map((principle) => {
                    const guide = guideById.get(principle.id);
                    if (!guide) return null;
                    const name = language === "fa" ? principle.fa : language === "es" ? principle.es : principle.en;
                    const prompt = principleQuestion(principle.id, language);
                    return (
                      <details className="learning-principle-card" key={principle.id} open={Boolean(normalizedQuery)}>
                        <summary><span><strong>{name}</strong><small>{prompt}</small></span><ChevronDown size={18} /></summary>
                        <div>
                          <p className="principle-definition">{localized(guide.definition, language)}</p>
                          {principleFollowUpQuestions(principle.id, language).map((question) => <p key={question}>{question}</p>)}
                          <h4>{t("Ways to practice", "راه‌های تمرین")}</h4>
                          <ul>{guide.practices.map((practice) => <li key={localized(practice, language)}><Check size={15} />{localized(practice, language)}</li>)}</ul>
                          <div className="principle-reflection"><Sparkles size={16} /><span><b>{t("Reflection", "تأمل")}</b>{localized(guide.reflection, language)}</span></div>
                        </div>
                      </details>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {((view === "defects" && !visibleDefects.length) || (view === "principles" && !visiblePrinciples.length)) && (
        <div className="learning-empty"><Search size={23} /><h3>{t("No matching learning topic", "موضوع آموزشی مطابقی پیدا نشد")}</h3><p>{t("Try a different pattern, behavior, or principle.", "الگو، رفتار یا اصل دیگری را جست‌وجو کنید.")}</p></div>
      )}

      <p className="learning-safety-note">{t(
        "This educational guide supports personal reflection. It is not a diagnosis, therapy, or a substitute for professional care or trusted recovery guidance.",
        "این راهنمای آموزشی برای تأمل شخصی است و تشخیص، درمان یا جایگزین مراقبت حرفه‌ای یا راهنمایی قابل اعتماد در بهبودی نیست."
      )}</p>
    </section>
  );
}
