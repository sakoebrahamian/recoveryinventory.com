import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const configPath = resolve("dist/server/wrangler.json");
const requiredNames = ["APP_ORIGIN", "DATA_ENCRYPTION_KEY"];
const optionalNames = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PRICE_ID",
  "STRIPE_WEBHOOK_SECRET",
];

const missingNames = requiredNames.filter((name) => !process.env[name]?.trim());
if (missingNames.length > 0) {
  throw new Error(
    `Missing required Cloudflare build secret${missingNames.length === 1 ? "" : "s"}: ${missingNames.join(", ")}`,
  );
}

const secretNames = [...requiredNames, ...optionalNames].filter(
  (name) => process.env[name]?.trim(),
);
const secrets = Object.fromEntries(
  secretNames.map((name) => [name, process.env[name]]),
);

if (process.argv.includes("--dry-run")) {
  console.log(`Cloudflare runtime secrets ready: ${secretNames.join(", ")}`);
  process.exit(0);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "recovery-inventory-deploy-"));
const secretsPath = join(temporaryDirectory, "runtime-secrets.json");

try {
  await writeFile(secretsPath, JSON.stringify(secrets), { mode: 0o600 });
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "deploy",
      "--config",
      configPath,
      "--secrets-file",
      secretsPath,
    ],
    { stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
