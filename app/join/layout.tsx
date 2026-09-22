import { createPrivatePageMetadata } from "@/lib/site-metadata";

export const metadata = createPrivatePageMetadata({
  title: "Create an Account",
  description:
    "Choose an anonymous username-and-password account with a separate recovery code, or verified email access for a private Recovery Inventory membership.",
  path: "/join",
});

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
