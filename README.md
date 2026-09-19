# RecoveryInventory.com

An English, Farsi, and Spanish recovery inventory website built for Cloudflare Workers.

## Included

- Public landing page
- Interactive Step 10 demo with 24 major principles
- Reusable Step 4 workbooks with six detailed, editable sections
- Recovery learning center connecting defects, shortcomings, corrective principles, and practical actions
- A choice of anonymous accounts or verified email accounts
- One-time email sign-in codes with no stored passwords
- In-place conversion from anonymous to email access without moving member data
- $25/year Stripe subscription flow with automatic renewal and self-service cancellation
- Encrypted private inventory storage in Cloudflare D1
- An ongoing year-by-year calendar
- Sponsor sharing, copying, printing, and Save as PDF
- Responsive English, Farsi, and Spanish interfaces with left-to-right and right-to-left layouts
- Privacy policy, terms, and independence disclaimer

## Before launch

The source contains no live credentials. Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) to:

1. upload the project to GitHub;
2. connect the repository to Cloudflare Workers Builds;
3. create and initialize the D1 database;
4. add the encryption and Stripe secrets;
5. connect `recoveryinventory.com`;
6. test Stripe in test mode before accepting live payments.

Never commit a Stripe secret key, webhook secret, or data-encryption key to GitHub.

## Local checks

Requirements: Node.js 22.13 or newer and pnpm 11.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm lint
```

Production deploys use the generated `dist/server/wrangler.json` file.

## Architecture

- Next.js-compatible App Router on Vinext
- Cloudflare Workers runtime
- Cloudflare D1 database
- AES-256-GCM encryption for inventory payloads
- SHA-256 hashes for recovery codes and session tokens
- Short-lived, hashed email verification codes with request and attempt limits
- Stripe Checkout, webhooks, and Customer Portal
- Cloudflare Email Service through a native Worker binding

Recovery Inventory is independent and is not affiliated with or endorsed by Alcoholics Anonymous, Narcotics Anonymous, AAWS, or NAWS.
