import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Interactive Demo",
  description:
    "Preview 24 Step 10 daily questions with supporting prompts and matching charts, a reusable Step 4 workbook, personal analytics, and recovery learning guides.",
  path: "/demo",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

