import { PublicLearningHub } from "@/components/recovery/public-learning-pages";
import { learningHubCopy, learningLanguageRoutes } from "@/lib/public-learning";
import { createPublicPageMetadata } from "@/lib/site-metadata";

const routes = learningLanguageRoutes();

export const metadata = createPublicPageMetadata({
  title: "Centro de aprendizaje para la recuperación",
  description: learningHubCopy.es.description,
  path: "/es/learn",
  languages: { ...routes, "x-default": routes.en },
});

export default function SpanishLearningHubPage() {
  return <PublicLearningHub language="es" />;
}
