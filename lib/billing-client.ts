export type BillingPath = "checkout" | "portal";

export type BillingResult = {
  url?: string;
  activated?: boolean;
  error?: string;
};

export class BillingTimeoutError extends Error {
  constructor() {
    super("The billing request timed out.");
    this.name = "BillingTimeoutError";
  }
}

// A timeout does not prove that the server stopped processing the request.
// Callers must let members check their status before trying billing again.
export async function requestBilling(
  path: BillingPath,
  promotionCode?: string,
  timeoutMs = 30_000,
): Promise<{ ok: boolean; result: BillingResult }> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new BillingTimeoutError());
      controller.abort();
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(`/api/billing/${path}`, {
          method: "POST",
          signal: controller.signal,
          ...(path === "checkout" ? {
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ promotionCode: promotionCode?.trim() || undefined }),
          } : {}),
        });
        const result = await response.json() as BillingResult;
        return { ok: response.ok, result };
      })(),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
