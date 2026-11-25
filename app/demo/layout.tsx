import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Interactive Demo",
  description:
    "Preview Step 4 workbooks, Step 10 daily inventories, personal analytics, and a sample chat with Serenity, the AI reflection guide.",
  path: "/demo",
});

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

