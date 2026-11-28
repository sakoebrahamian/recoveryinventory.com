import { env } from "cloudflare:workers";
import { isAnalyticsOwner, jsonError, requireAccount } from "@/lib/auth";

export async function GET(request: Request) {
  const headers = { "cache-control": "private, no-store" };

  try {
    const account = await requireAccount(request);
    if (!isAnalyticsOwner(account)) {
      return Response.json({ error: "Owner access is required." }, { status: 403, headers });
    }

    const { results } = await env.DB.prepare(
      "SELECT username_display FROM password_accounts ORDER BY username",
    ).all<{ username_display: string }>();

    return Response.json({ usernames: results.map((row) => row.username_display) }, { headers });
  } catch (error) {
    const response = jsonError(error);
    response.headers.set("cache-control", headers["cache-control"]);
    return response;
  }
}
