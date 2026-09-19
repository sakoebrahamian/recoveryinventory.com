import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Interactive Demo",
  description:
    "Preview the private Step 10 inventory, reusable Step 4 workbook, personal analytics, and recovery principles learning center.",
  path: "/demo",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

