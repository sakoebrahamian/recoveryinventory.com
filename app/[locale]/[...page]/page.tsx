import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LocaleBoundary } from "@/components/recovery/language-provider";
import { AboutPage } from "@/components/recovery/about-page";
import { PublicLearningHub, PublicLearningArticlePage } from "@/components/recovery/public-learning-pages";
import { ComparisonHub, ProductComparisonPage } from "@/components/recovery/product-comparison-pages";
import { Step10AppPage } from "@/components/recovery/step10-app-page";
import { aboutCopy, aboutLanguageRoutes } from "@/lib/about-content";
import { learningHubCopy, learningLanguageRoutes, findLearningTopic, publicLearningTopics } from "@/lib/public-learning";
import { comparisonUi, comparisonLanguageRoutes, findProductComparison, productComparisons } from "@/lib/product-comparisons";
import { step10AppCopy, step10AppRoutes } from "@/lib/step10-app-content";
import { addedLanguages, supportedLanguage, localizedPath } from "@/lib/languages";
import { loadTranslations } from "@/lib/localization";
import { createPublicPageMetadata } from "@/lib/site-metadata";

type Props = { params: Promise<{ locale: string; page: string[] }> };
export function generateStaticParams() {
  const pages = ["about", "learn", ...publicLearningTopics.map((topic) => `learn/${topic.slug}`), "vs", ...productComparisons.map((item) => `vs/${item.slug}`), "step-10-daily-inventory-app"];
  return addedLanguages.flatMap((language) => pages.map((page) => ({ locale: language.toLowerCase(), page: page.split("/") })));
}
async function resolve(params: Props["params"]) {
  const { locale, page } = await params;
  const language = supportedLanguage(locale);
  if (!language || !(addedLanguages as readonly string[]).includes(language)) notFound();
  const dictionary = await loadTranslations(language);
  const path = page.join("/");
  const topic = page[0] === "learn" && page.length === 2 ? findLearningTopic(page[1]) : undefined;
  const comparison = page[0] === "vs" && page.length === 2 ? findProductComparison(page[1]) : undefined;
  const copy = path === "about" ? aboutCopy[language] : path === "learn" ? learningHubCopy[language] : topic ? topic.copy[language]
    : path === "vs" ? { title: comparisonUi.title[language], description: comparisonUi.intro[language] }
    : comparison ? { title: comparison.title[language], description: comparison.description[language] }
    : path === "step-10-daily-inventory-app" ? step10AppCopy[language] : undefined;
  if (!copy) notFound();
  const routes = path === "about" ? aboutLanguageRoutes : page[0] === "learn" ? learningLanguageRoutes(topic?.slug)
    : page[0] === "vs" ? comparisonLanguageRoutes(comparison?.slug) : step10AppRoutes;
  return { language, dictionary, path, topic, comparison, copy, routes };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { language, path, copy, routes } = await resolve(params);
  return createPublicPageMetadata({ title: copy.title, description: copy.description, path: localizedPath(language, `/${path}`), languages: { ...routes, "x-default": routes.en } });
}
export default async function Page({ params }: Props) {
  const { language, dictionary, path, topic, comparison } = await resolve(params);
  const content = path === "about" ? <AboutPage language={language} /> : path === "learn" ? <PublicLearningHub language={language} />
    : topic ? <PublicLearningArticlePage language={language} topic={topic} /> : path === "vs" ? <ComparisonHub language={language} />
    : comparison ? <ProductComparisonPage language={language} comparison={comparison} /> : <Step10AppPage language={language} />;
  return <LocaleBoundary language={language} dictionary={dictionary}>{content}</LocaleBoundary>;
}
