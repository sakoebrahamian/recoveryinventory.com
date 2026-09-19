import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Terms of Use",
  description:
    "Review the membership, acceptable-use, account responsibility, and independent-service terms for Recovery Inventory.",
  path: "/terms",
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

