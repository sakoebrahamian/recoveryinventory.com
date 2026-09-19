# RecoveryInventory.com — GitHub and Cloudflare setup

This guide is written for the repository:

`https://github.com/sakoebrahamian/recoveryinventory.com`

The website code is complete, but payments and private saved inventories cannot work until you connect your own Cloudflare D1 database and Stripe account. No password or secret belongs in GitHub.

## What you will need

- Your GitHub account
- Your Cloudflare account and the `recoveryinventory.com` domain
- A Stripe account
- Cloudflare Email Sending enabled for `recoveryinventory.com`
- A password manager or another secure place for one encryption key
- A working address such as `support@recoveryinventory.com`

You do **not** need Cloudflare WARP.

## 1. Put the source in GitHub

If the files have already been pushed to your repository, skip this section.

1. Download and unzip the source package.
2. Open your GitHub repository in a browser.
3. Select **Add file → Upload files**.
4. Drag the **contents** of the unzipped project into the upload area. Do not upload the ZIP itself and do not put everything inside an extra folder.
5. Commit the upload to the `main` branch.

The repository may be public or private. Public source is safe only because all real secrets are kept in Cloudflare and are excluded from the repository.

## 2. Create the Cloudflare D1 database

1. In Cloudflare, open **Storage & databases → D1 SQL database**.
2. Select **Create database**.
3. Name it `recovery-inventory`.
4. Open the new database and copy its **Database ID**. Keep this tab open.
5. Open the database **Console**.
6. Open the project file `cloudflare-d1-setup.sql`, copy all of it, paste it into the D1 Console, and run it once.

The script is safe to run again because it uses `IF NOT EXISTS`.

Optional command-line method:

```bash
pnpm exec wrangler d1 execute recovery-inventory --remote --file cloudflare-d1-setup.sql
```

## 3. Connect GitHub to Cloudflare Workers

1. In Cloudflare, open **Workers & Pages**.
2. Select **Create application** and choose the option to import or connect a Git repository.
3. Authorize the **Cloudflare Workers & Pages** GitHub app.
4. For the safest permission setting, choose **Only select repositories** and select only `recoveryinventory.com`.
5. Choose `sakoebrahamian/recoveryinventory.com` and the `main` branch.
6. Use these build settings:

| Setting | Value |
|---|---|
| Project/root directory | `/` or leave blank |
| Production branch | `main` |
| Build command | `pnpm build` |
| Deploy command | `pnpm run deploy:cloudflare` |
| Non-production deploy | `pnpm exec wrangler versions upload --config dist/server/wrangler.json` |

7. Add these **build variables** before retrying the build:

| Variable | Value |
|---|---|
| `CLOUDFLARE_D1_DATABASE_ID` | The Database ID copied in Step 2 |
| `CLOUDFLARE_D1_DATABASE_NAME` | `recovery-inventory` |
| `NODE_VERSION` | `22.16.0` |

The custom deployment command also transfers selected encrypted build secrets into the live Worker without writing their values to GitHub or build logs.

It also applies the idempotent email-account table setup before deploying the Worker. This preserves all existing anonymous accounts and inventories.

If Cloudflare starts the first build before it lets you add variables, let that build finish, open **Settings → Build**, add the variables, and select **Retry deployment**.

After a successful deployment, open the Worker’s **Settings → Bindings** and confirm there is a D1 binding named exactly `DB` connected to `recovery-inventory`.

Cloudflare’s Git integration will automatically rebuild and deploy after future pushes to `main`.

## 4. Generate the inventory encryption key

1. Download the repository or source ZIP to your computer.
2. Open `tools/generate-encryption-key.html` by double-clicking it. It works locally in your browser and sends nothing online.
3. Select **Generate a new key** and copy the result.
4. Save the key in your password manager.

This key is extremely important:

- Never put it in GitHub, email, chat, or website code.
- Do not casually replace or rotate it after launch.
- If it is lost, previously saved inventories cannot be decrypted.

## 5. Add the first Cloudflare runtime values

Open the Worker’s **Settings → Variables and Secrets** build section. Add:

| Name | Type | Value |
|---|---|---|
| `DATA_ENCRYPTION_KEY` | Secret/encrypted | The key created in Step 4 |
| `APP_ORIGIN` | Variable | `https://recoveryinventory.com` |

Save the changes, then retry the build. The `pnpm run deploy:cloudflare` command securely uploads both values as Worker runtime secrets. At this point anonymous account creation and encrypted database storage are configured, but paid activation still needs Stripe.

## 6. Configure Cloudflare Email Sending

1. In Cloudflare, open **Compute → Email Service → Email Sending**.
2. Select **Onboard Domain** and choose `recoveryinventory.com`.
3. Allow Cloudflare to add and verify the required DNS records.
4. Confirm that the domain shows as active.

The project deploys a native Worker binding named `EMAIL`. It sends requested verification and login codes from `login@recoveryinventory.com`, with replies directed to `support@recoveryinventory.com`. The binding does not require an API key in the repository or browser.

The email service is used only for transactional account messages. Existing incoming forwarding to Gmail remains separate and can continue working.

## 7. Configure Stripe in test mode first

Keep Stripe in **test mode** until the entire checklist at the end works.

### Create the yearly price

1. In Stripe, create a product named `Recovery Inventory Annual Membership`.
2. Add a recurring price of **$25 USD every year**.
3. Copy the Price ID beginning with `price_`.
4. Copy your test secret API key beginning with `sk_test_`.

### Configure the customer billing portal

In Stripe’s Customer Portal settings:

- allow customers to update their payment method;
- allow customers to view invoices;
- allow customers to cancel subscriptions;
- set cancellation to the end of the paid billing period unless you want a different policy.

### Create the webhook

1. In Stripe, add a webhook endpoint:

   `https://recoveryinventory.com/api/billing/webhook`

2. Subscribe it to these events:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

3. Copy the webhook signing secret beginning with `whsec_`.

### Add the Stripe secrets to Cloudflare

In the Worker’s **Settings → Variables and Secrets** build section, add each as an encrypted secret:

| Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | Your `sk_test_...` key |
| `STRIPE_PRICE_ID` | Your yearly `price_...` ID |
| `STRIPE_WEBHOOK_SECRET` | Your endpoint’s `whsec_...` secret |

Save the changes and retry the build. The deployment command transfers the values to the live Worker.

## 8. Connect recoveryinventory.com

1. Open your Worker in **Workers & Pages**.
2. Go to **Settings → Domains & Routes**.
3. Select **Add → Custom Domain**.
4. Enter `recoveryinventory.com` and confirm.
5. Optionally add `www.recoveryinventory.com` as a second custom domain.

Cloudflare creates the DNS record and certificate. You do not need to install a certificate manually.

If the hostname already has an A, AAAA, or CNAME record from an earlier attempt, remove the conflicting record before adding the Worker custom domain.

## 9. Test the complete experience

Use an incognito/private browser window and complete these checks:

- The landing page opens on desktop and phone.
- The language button switches the full interface among English, Farsi, and Spanish.
- The Step 10, reusable Step 4 workbook, analytics, and recovery learning demos work without an account.
- The create-account page clearly offers anonymous and verified-email account choices.
- Anonymous signup asks only for an alias, and its recovery code downloads or copies successfully.
- Email signup sends a six-digit verification code and creates the account after verification.
- After either account type is created, the promotion-code field appears before the membership activation button; users never need to enter Checkout and return to find it.
- Email login sends a new one-time code and opens the correct member account.
- An anonymous member can add a verified email from the member page and keep the same inventories, subscription, and history.
- Closing Stripe Checkout without payment leaves all Step 10, Step 4, analytics, learning, share, copy, and export tools locked.
- Stripe Checkout opens with the $25 yearly test subscription.
- A partial-discount promotion code entered on the member page opens Stripe Checkout and requires payment for the remaining balance.
- A 100%-off **forever** promotion code entered on the member page activates membership without opening Checkout or requesting payment and billing details.
- Stripe test card `4242 4242 4242 4242`, any future expiration, and any CVC completes checkout.
- The account changes to **Membership active** after the webhook arrives.
- A Step 10 inventory saves, appears on the yearly calendar, and still appears after signing out and recovering the account.
- A Step 4 workbook saves independently from the daily calendar, can be reopened and edited, and can be marked complete.
- A second Step 4 workbook can be created without replacing the first, and previously saved date-based Step 4 data appears as workbooks after deployment.
- Step 4 warns before leaving or switching workbooks with unsaved changes; Step 10 reminds the member to save before changing dates.
- The learning center explains character defects, related shortcomings, corrective principles, and recovery actions in English, Farsi, and Spanish.
- Share/copy, print, and Save as PDF work.
- **Manage or cancel** opens the Stripe billing portal.
- A canceled subscription remains active through the paid test period and later becomes inactive through Stripe’s webhook.

In Stripe, review **Developers → Webhooks → Recent deliveries**. Every delivery should return an HTTP `200` response.

## 10. Switch from test payments to live payments

Only after testing:

1. Activate your Stripe account and complete Stripe’s identity/business requirements.
2. Create the same $25/year product in **live mode**.
3. Create a new live webhook endpoint with the same URL and events.
4. Replace the three Cloudflare Stripe secrets with the live `sk_live_...`, live `price_...`, and live `whsec_...` values.
5. Deploy and make one real purchase, then refund it from Stripe if appropriate.

Test-mode and live-mode IDs are different. Do not mix them.

## 11. Before announcing the site

- Set up forwarding for `support@recoveryinventory.com`; the privacy and terms pages use that address.
- Have the privacy policy, terms, cancellation language, and tax obligations reviewed for your business and location.
- Store the encryption key and Stripe recovery information in a secure password manager.
- Turn on two-factor authentication for GitHub, Cloudflare, and Stripe.
- Export or back up D1 periodically and learn Cloudflare’s recovery options.
- Consider Cloudflare Turnstile or rate-limiting rules if automated account creation becomes a problem.

## Expected costs

- Your domain renews annually at the registrar’s listed price.
- GitHub can host this repository without a separate hosting bill.
- Cloudflare Workers and D1 can begin on free allowances; charges can occur if you exceed current limits or choose a paid plan.
- Stripe charges payment-processing fees on successful transactions. Optional Stripe products can add fees.
- The code itself does not create a $25/month Cloudflare charge.

Always check the current Cloudflare and Stripe pricing pages before launch because limits and fees can change.

## Troubleshooting

### Build says the D1 database ID is invalid

Confirm `CLOUDFLARE_D1_DATABASE_ID` is a **build variable**, not only a Worker runtime variable, then retry the build.

### Joining returns “Something went wrong”

Confirm the D1 schema was run, the binding is named `DB`, and `DATA_ENCRYPTION_KEY` exists.

### Checkout does not open

Confirm all three Stripe values are from the same mode—either all test or all live—and that the Price is recurring yearly.

### Payment succeeds but membership stays inactive

Check Stripe’s webhook delivery log. Confirm the endpoint URL, event list, and `STRIPE_WEBHOOK_SECRET` match that exact endpoint.

### Saved inventories can no longer be opened

Do not generate a replacement encryption key. Restore the original `DATA_ENCRYPTION_KEY` from your password manager.

## Official references

- Cloudflare Git integration: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/
- Cloudflare Workers Builds configuration: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Cloudflare D1: https://developers.cloudflare.com/d1/get-started/
- Cloudflare Email Service: https://developers.cloudflare.com/email-service/get-started/send-emails/
- Cloudflare Worker secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Custom Domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Stripe Checkout subscriptions: https://docs.stripe.com/payments/checkout/build-subscriptions
- Stripe Customer Portal: https://docs.stripe.com/customer-management/integrate-customer-portal
- Stripe webhooks: https://docs.stripe.com/webhooks
