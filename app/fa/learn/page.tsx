import { PublicLearningHub } from "@/components/recovery/public-learning-pages";
import { learningHubCopy, learningLanguageRoutes } from "@/lib/public-learning";
import { createPublicPageMetadata } from "@/lib/site-metadata";

const routes = learningLanguageRoutes();

export const metadata = createPublicPageMetadata({
  title: "مرکز آموزش بهبودی",
  description: learningHubCopy.fa.description,
  path: "/fa/learn",
  languages: { ...routes, "x-default": routes.en },
});

export default function FarsiLearningHubPage() {
  return <PublicLearningHub language="fa" />;
}
