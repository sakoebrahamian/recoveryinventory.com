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
  if (!topic) return { title: "موضوع آموزشی", robots: { index: false, follow: false } };
  const routes = learningLanguageRoutes(slug);
  return createPublicPageMetadata({
    title: topic.copy.fa.title,
    description: topic.copy.fa.description,
    path: learningTopicPath("fa", slug),
    languages: { ...routes, "x-default": routes.en },
  });
}

export default async function FarsiLearningArticle({ params }: LearningArticleProps) {
  const { slug } = await params;
  const topic = findLearningTopic(slug);
  if (!topic) notFound();
  return <PublicLearningArticlePage language="fa" topic={topic} />;
}
