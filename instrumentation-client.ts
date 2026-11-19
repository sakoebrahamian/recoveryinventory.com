import { analytics } from "@heycatch/sdk";
import { startMarketingAnalytics } from "./lib/heycatch-runtime";

// Static browser-entry import, with init held until public-route consent permits it.
// Private routes never initialize the SDK or attach account identities.
startMarketingAnalytics(analytics, window);
