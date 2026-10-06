import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Interactive Demo",
  description:
    "Preview 39 Step 10 daily questions across 24 principles, separate follow-up answers, principle labels, and matching charts, a reusable Step 4 workbook, personal analytics, and recovery learning guides.",
  path: "/demo",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

