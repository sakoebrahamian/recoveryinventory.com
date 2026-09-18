declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    EMAIL: SendEmail;
    BUCKET?: R2Bucket;
    DATA_ENCRYPTION_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_PRICE_ID?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    APP_ORIGIN?: string;
    EMAIL_FROM_ADDRESS?: string;
    EMAIL_REPLY_TO?: string;
  }
}
