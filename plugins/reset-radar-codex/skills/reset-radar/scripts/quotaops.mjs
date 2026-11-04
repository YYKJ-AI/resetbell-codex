#!/usr/bin/env node

const DEFAULT_BASE_URL = "https://resetbell.dev";
const PROVIDERS = new Set(["codex", "claude", "kimi", "deepseek"]);
const ALLOWED_OPTIONS = {
  snapshot: new Set(),
  updates: new Set(["provider", "limit", "cursor", "view"]),
  monitoring: new Set(["provider"]),
  forecasts: new Set(["provider", "days"]),
};
const usage = `Usage:
  quotaops snapshot
  quotaops updates [--provider codex|claude|kimi|deepseek] [--limit 1-100] [--cursor CURSOR] [--view all]
  quotaops monitoring [--provider codex|claude|kimi|deepseek]
  quotaops forecasts [--provider codex|claude|kimi|deepseek] [--days 7|30|90|365]

Environment:
  QUOTAOPS_BASE_URL  API origin (default: ${DEFAULT_BASE_URL})
`;

function parseArgs(argv) {
  const command = argv[0];
  if (!["snapshot", "updates", "monitoring", "forecasts"].includes(command)) {
    throw new Error(`Unknown command: ${command || "(missing)"}\n${usage}`);
  }
  const options = {};
  for (let i = 1; i < argv.length; i += 2) {
    const key = argv[i];
    if (!key.startsWith("--") || i + 1 >= argv.length || !ALLOWED_OPTIONS[command].has(key.slice(2)) ||
      Object.hasOwn(options, key.slice(2))) throw new Error(usage);
    options[key.slice(2)] = argv[i + 1];
  }
  return { command, options };
}

function endpoint({ command, options }) {
  const params = new URLSearchParams();
  if (options.provider) {
    if (!PROVIDERS.has(options.provider)) {
      throw new Error("provider must be codex, claude, kimi, or deepseek");
    }
    params.set("provider", options.provider);
  }
  if (options.limit) {
    const limit = Number(options.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error("limit must be an integer from 1 to 100");
    }
    params.set("limit", String(limit));
  }
  if (options.cursor) params.set("cursor", options.cursor);
  if (options.view) params.set("view", options.view);
  if (options.days) {
    if (!["7", "30", "90", "365"].includes(options.days)) {
      throw new Error("days must be 7, 30, 90, or 365");
    }
    params.set("days", options.days);
  }
  const paths = { snapshot: "/api/v1/native/snapshot", updates: "/api/v1/updates", monitoring: "/api/v1/monitoring", forecasts: "/api/v1/forecasts" };
  const query = params.toString();
  return `${paths[command]}${query ? `?${query}` : ""}`;
}

async function main() {
  const input = parseArgs(process.argv.slice(2));
  const base = new URL(process.env.QUOTAOPS_BASE_URL || DEFAULT_BASE_URL);
  if (base.protocol !== "https:" && base.hostname !== "127.0.0.1" && base.hostname !== "localhost") {
    throw new Error("QUOTAOPS_BASE_URL must use HTTPS, except for localhost");
  }
  const response = await fetch(new URL(endpoint(input), base), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text();
  let json;
  try {
    json = JSON.parse(body);
  } catch {
    throw new Error(`HTTP ${response.status}: invalid JSON response`);
  }
  if (response.ok && input.command === "monitoring" && !input.options.provider && json.data?.sources) {
    json.data.sources = json.data.sources.filter(source => PROVIDERS.has(source.provider));
    json.data.posts = json.data.sources.reduce((count, source) => count + source.posts, 0);
    json.data.polling = json.data.sources.some(source => source.last_poll_at &&
      Date.now() - Date.parse(source.last_poll_at) < 180_000 &&
      !["disabled", "paused", "blocked"].includes(source.phase));
  }
  process.stdout.write(`${JSON.stringify(json, null, 2)}\n`);
  if (!response.ok) process.exitCode = 1;
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
