import { createPrivatePageMetadata } from "@/lib/site-metadata";

export const metadata = createPrivatePageMetadata({
  title: "Member Login",
  description:
    "Access Recovery Inventory using a username and password, one-time email code, or anonymous account recovery code.",
  path: "/recover",
});

export default function RecoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
