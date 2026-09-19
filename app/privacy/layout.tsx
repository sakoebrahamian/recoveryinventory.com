import { createPublicPageMetadata } from "@/lib/site-metadata";

export const metadata = createPublicPageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how Recovery Inventory protects anonymous and email-based accounts, encrypted inventory content, and membership information.",
  path: "/privacy",
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

