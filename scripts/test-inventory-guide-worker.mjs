import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { promisify } from "node:util";

const require = createRequire(import.meta.url);
const { Miniflare } = createRequire(require.resolve("wrangler/package.json"))("miniflare");
const { build } = createRequire(require.resolve("vite/package.json"))("esbuild");
const bundle = await build({
  stdin: {
    resolveDir: process.cwd(),
    sourcefile: "inventory-guide-worker-test.ts",
    loader: "ts",
    contents: `
      import { generateInventoryGuideReply } from "./lib/inventory-guide-server.ts";

      export default {
        async fetch() {
          try {
            const reply = await generateInventoryGuideReply(
              { step: "step10", language: "en", message: "I paused before replying.", history: [], consent: true },
              "test-only-key",
            );
            return Response.json({ reply });
          } catch (error) {
            return Response.json({ reference: error.reference, upstreamStatus: error.status }, { status: 503 });
          }
        },
      };
    `,
  },
  bundle: true,
  write: false,
  format: "esm",
  external: ["cloudflare:workers"],
  plugins: [{
    name: "quota-schema",
    setup(bundler) {
      bundler.onResolve({ filter: /[.]sql[?]raw$/ }, ({ path, resolveDir }) =>
        ({ path: resolve(resolveDir, path.split("?")[0]), namespace: "sql" }));
      bundler.onLoad({ filter: /.*/, namespace: "sql" }, ({ path }) =>
        ({ contents: readFileSync(path, "utf8"), loader: "text" }));
    },
  }],
});

const outgoing = [];
let sendRedirect = false;
const runtime = new Miniflare({
  cf: false,
  host: "127.0.0.1",
  modules: true,
  script: bundle.outputFiles[0].text,
  outboundService: async (request) => {
    outgoing.push(request.url);
    assert.equal(request.headers.get("authorization"), "Bearer test-only-key");
    const payload = await request.json();
    assert.equal(payload.store, false);
    assert.equal(JSON.parse(payload.input).latest_message, "I paused before replying.");
    if (sendRedirect) return Response.redirect("https://example.invalid/", 307);

    return Response.json({
      status: "completed",
      output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: "What helped you pause?" }] }],
    });
  },
});

try {
  const url = await runtime.ready;
  const ask = async () => {
    const { stdout } = await promisify(execFile)("curl", ["-sS", "--noproxy", "127.0.0.1", "--max-time", "8", String(url)]);
    return JSON.parse(stdout);
  };

  assert.deepEqual(await ask(), { reply: "What helped you pause?" });
  sendRedirect = true;
  assert.deepEqual(await ask(), { reference: "AI-CONNECT", upstreamStatus: 307 });
  assert.deepEqual(outgoing, [
    "https://api.openai.com/v1/responses",
    "https://api.openai.com/v1/responses",
  ]);
  console.log("Worker runtime accepted the AI request and kept the credential off redirects.");
} finally {
  await runtime.dispose();
}
