import type { MetadataRoute } from "next";
import type { Language } from "@/lib/inventory";
import {
  learningLanguageRoutes,
  publicLearningTopics,
} from "@/lib/public-learning";
import { SITE_URL } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/demo`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const languages: Language[] = ["en", "es", "fa"];
  const hubRoutes = learningLanguageRoutes();
  const learningPages: MetadataRoute.Sitemap = languages.flatMap((language) => [
    {
      url: `${SITE_URL}${hubRoutes[language]}`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
      alternates: {
        languages: {
          en: `${SITE_URL}${hubRoutes.en}`,
          es: `${SITE_URL}${hubRoutes.es}`,
          fa: `${SITE_URL}${hubRoutes.fa}`,
          "x-default": `${SITE_URL}${hubRoutes.en}`,
        },
      },
    },
    ...publicLearningTopics.map((topic) => {
      const routes = learningLanguageRoutes(topic.slug);
      return {
        url: `${SITE_URL}${routes[language]}`,
        changeFrequency: "monthly" as const,
        priority: 0.65,
        alternates: {
          languages: {
            en: `${SITE_URL}${routes.en}`,
            es: `${SITE_URL}${routes.es}`,
            fa: `${SITE_URL}${routes.fa}`,
            "x-default": `${SITE_URL}${routes.en}`,
          },
        },
      };
    }),
  ]);

  return [...corePages, ...learningPages];
}
