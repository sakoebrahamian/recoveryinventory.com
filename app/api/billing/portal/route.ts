import { jsonError, requireAccount } from "@/lib/auth";
import { appOrigin, stripeRequest } from "@/lib/stripe";

type PortalSession = { url: string };

export async function POST(request: Request) {
  try {
    const account = await requireAccount(request);
    if (!account.stripeCustomerId) {
      return Response.json({ error: "No billing profile is connected to this account." }, { status: 400 });
    }
    const session = await stripeRequest<PortalSession>("/billing_portal/sessions", {
      customer: account.stripeCustomerId,
      return_url: `${appOrigin(request)}/app`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    return jsonError(error);
  }
}
