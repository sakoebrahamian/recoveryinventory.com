import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Interactive Demo",
  description:
    "Preview Step 4 workbooks, Step 10 daily inventories, personal analytics, and see how the AI Inventory Guide helps members reflect one question at a time.",
  path: "/demo",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

