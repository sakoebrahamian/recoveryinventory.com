import { PublicLearningHub } from "@/components/recovery/public-learning-pages";
import { learningHubCopy, learningLanguageRoutes } from "@/lib/public-learning";
import { createPublicPageMetadata } from "@/lib/site-metadata";

const routes = learningLanguageRoutes();

export const metadata = createPublicPageMetadata({
  title: "Recovery Learning Center",
  description: learningHubCopy.en.description,
  path: "/learn",
  languages: { ...routes, "x-default": routes.en },
});

export default function LearningHubPage() {
  return <PublicLearningHub language="en" />;
}
