import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductComparisonPage } from "@/components/recovery/product-comparison-pages";
import { comparisonLanguageRoutes, comparisonPath, findProductComparison, productComparisons } from "@/lib/product-comparisons";
import { createPublicPageMetadata } from "@/lib/site-metadata";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return productComparisons.map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comparison = findProductComparison(slug);
  if (!comparison) return { title: "Comparison", robots: { index: false, follow: false } };
  const routes = comparisonLanguageRoutes(slug);
  return createPublicPageMetadata({ title: comparison.title.en, description: comparison.description.en, path: comparisonPath("en", slug), languages: { ...routes, "x-default": routes.en } });
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const comparison = findProductComparison(slug);
  if (!comparison) notFound();
  return <ProductComparisonPage language="en" comparison={comparison} />;
}
