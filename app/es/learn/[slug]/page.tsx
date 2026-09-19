import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLearningArticlePage } from "@/components/recovery/public-learning-pages";
import {
  findLearningTopic,
  learningLanguageRoutes,
  learningTopicPath,
  publicLearningTopics,
} from "@/lib/public-learning";
import { createPublicPageMetadata } from "@/lib/site-metadata";

type LearningArticleProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return publicLearningTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: LearningArticleProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = findLearningTopic(slug);
  if (!topic) return { title: "Tema de aprendizaje", robots: { index: false, follow: false } };
  const routes = learningLanguageRoutes(slug);
  return createPublicPageMetadata({
    title: topic.copy.es.title,
    description: topic.copy.es.description,
    path: learningTopicPath("es", slug),
    languages: { ...routes, "x-default": routes.en },
  });
}

export default async function SpanishLearningArticle({ params }: LearningArticleProps) {
  const { slug } = await params;
  const topic = findLearningTopic(slug);
  if (!topic) notFound();
  return <PublicLearningArticlePage language="es" topic={topic} />;
}
