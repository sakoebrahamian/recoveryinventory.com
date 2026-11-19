import { AboutPage } from "@/components/recovery/about-page";
import { aboutCopy, aboutLanguageRoutes } from "@/lib/about-content";
import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: aboutCopy.es.title,
  description: aboutCopy.es.description,
  path: "/es/about",
  languages: { ...aboutLanguageRoutes, "x-default": aboutLanguageRoutes.en },
});

export default function Page() {
  return <AboutPage language="es" />;
}
