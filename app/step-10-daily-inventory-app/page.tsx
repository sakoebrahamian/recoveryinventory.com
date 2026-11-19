import { Step10AppPage } from "@/components/recovery/step10-app-page";
import { step10AppCopy, step10AppRoutes } from "@/lib/step10-app-content";
import { createPublicPageMetadata } from "@/lib/site-metadata";
export const metadata = createPublicPageMetadata({ title: step10AppCopy.en.title, description: step10AppCopy.en.description, path: step10AppRoutes.en, languages: { ...step10AppRoutes, "x-default": step10AppRoutes.en } });
export default function Page() { return <Step10AppPage language="en" />; }
