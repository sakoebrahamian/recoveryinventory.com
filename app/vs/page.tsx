import { ComparisonHub } from "@/components/recovery/product-comparison-pages";
import { comparisonLanguageRoutes, comparisonPath, comparisonUi } from "@/lib/product-comparisons";
import { createPublicPageMetadata } from "@/lib/site-metadata";

const routes = comparisonLanguageRoutes();
export const metadata = createPublicPageMetadata({ title: comparisonUi.title.en, description: comparisonUi.intro.en, path: comparisonPath("en"), languages: { ...routes, "x-default": routes.en } });
export default function Page() { return <ComparisonHub language="en" />; }
