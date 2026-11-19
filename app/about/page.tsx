import { AboutPage } from "@/components/recovery/about-page";
import { aboutCopy, aboutLanguageRoutes } from "@/lib/about-content";
import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: aboutCopy.en.title,
  description: aboutCopy.en.description,
  path: "/about",
  languages: { ...aboutLanguageRoutes, "x-default": aboutLanguageRoutes.en },
});

export default function Page() {
  return <AboutPage language="en" />;
}
