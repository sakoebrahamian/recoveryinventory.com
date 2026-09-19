import { createPrivatePageMetadata } from "@/lib/site-metadata";

export const metadata = createPrivatePageMetadata({
  title: "Private Member Workspace",
  description: "Private Recovery Inventory member workspace.",
  path: "/app",
});

export default function MemberAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}

