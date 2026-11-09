#!/usr/bin/env node
// Google autocomplete lookups for keyword research. Node 18+, no dependencies.
//
//   node scripts/autocomplete.mjs "seed one" "seed two"
//   node scripts/autocomplete.mjs "codex" "opencode" --modifiers "remote control,scheduled tasks,telegram"
//   node scripts/autocomplete.mjs "claude code 定时任务" --hl zh-CN
//
// Options:
//   --modifiers a,b,c   also look up "<seed> <modifier>" for every seed and modifier
//   --hl <lang>         interface language for suggestions (default: en)
//   --gl <country>      country for suggestions, e.g. us, gb, cn (default: none)
//   --delay <ms>        pause between requests, plus up to 50% jitter (default: 1000, minimum: 500)
//   --json              print one JSON array at the end instead of the text report
//
// Requests go out one at a time. A query "self-completes" when Google suggests the query itself,
// which is evidence that people search it. Autocomplete shows that demand exists, not how much.
// If Google answers with anything other than JSON (a captcha or block page), the script stops:
// wait before running it again instead of retrying.
//
// Behind a proxy: Node's fetch ignores HTTPS_PROXY unless you set NODE_USE_ENV_PROXY=1 (Node 22.21+, 24.5+).

const ENDPOINT = "https://suggestqueries.google.com/complete/search";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0";

const USAGE = `Usage: node scripts/autocomplete.mjs "seed one" ["seed two" ...] [options]

Options:
  --modifiers a,b,c   also look up "<seed> <modifier>" combinations
  --hl <lang>         suggestion language (default: en)
  --gl <country>      suggestion country, e.g. us (default: none)
  --delay <ms>        pause between requests (default: 1000, minimum: 500)
  --json              print a JSON array instead of the text report`;

class RateLimited extends Error {}

function parseArgs(argv) {
  const opts = { seeds: [], modifiers: [], hl: "en", gl: "", delay: 1000, json: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      opts.help = true;
      continue;
    }
    const match = arg.match(/^--([a-z]+)(?:=(.*))?$/);
    if (!match) {
      opts.seeds.push(arg);
      continue;
    }
    const [, key, inline] = match;
    if (key === "json") {
      opts.json = true;
      continue;
    }
    if (!["modifiers", "hl", "gl", "delay"].includes(key)) {
      throw new Error(`Unknown option --${key}`);
    }
    const value = inline ?? argv[++i];
    if (value === undefined || value.startsWith("--")) throw new Error(`--${key} needs a value`);
    if (key === "modifiers") {
      opts.modifiers.push(...value.split(",").map((m) => m.trim()).filter(Boolean));
    } else if (key === "delay") {
      const ms = Number(value);
      if (!Number.isFinite(ms)) throw new Error("--delay must be a number of milliseconds");
      opts.delay = ms;
    } else {
      opts[key] = value;
    }
  }
  return opts;
}

const normalize = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

function buildQueries(seeds, modifiers) {
  const seen = new Set();
  const queries = [];
  for (const seed of seeds) {
    for (const q of [seed, ...modifiers.map((m) => `${seed} ${m}`)]) {
      const key = normalize(q);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      queries.push(q.trim());
    }
  }
  return queries;
}

async function suggest(query, { hl, gl }) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("client", "firefox");
  url.searchParams.set("hl", hl);
  if (gl) url.searchParams.set("gl", gl);
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("oe", "UTF-8");
  url.searchParams.set("q", query);

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json, text/javascript, */*;q=0.1",
      "Accept-Language": `${hl},en;q=0.8`,
    },
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new RateLimited(`HTTP ${res.status}, got ${res.headers.get("content-type") || "no content type"}`);
  }
  if (!Array.isArray(data) || !Array.isArray(data[1])) {
    throw new RateLimited(`HTTP ${res.status}, unexpected JSON shape`);
  }
  return data[1].filter((s) => typeof s === "string");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function printResult({ query, selfCompletes, suggestions }) {
  const tag = selfCompletes ? "self-completes" : "does not self-complete";
  const count = suggestions.length ? `${suggestions.length} suggestions` : "no suggestions";
  console.log(`\n"${query}"  [${tag}, ${count}]`);
  for (const s of suggestions) console.log(`  ${s}`);
}

function printSummary(results, total) {
  const self = results.filter((r) => r.selfCompletes);
  const empty = results.filter((r) => r.suggestions.length === 0);
  console.log(`\nSummary: ${results.length}/${total} queries looked up, ${self.length} self-complete, ${empty.length} with no suggestions`);
  if (self.length) {
    console.log("Self-complete:");
    for (const r of self) console.log(`  ${r.query}`);
  }
  if (empty.length) {
    console.log("No suggestions:");
    for (const r of empty) console.log(`  ${r.query}`);
  }
}

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`${err.message}\n\n${USAGE}`);
    process.exit(1);
  }
  if (opts.help || opts.seeds.length === 0) {
    console.log(USAGE);
    process.exit(opts.help ? 0 : 1);
  }
  if (opts.delay < 500) {
    console.error("--delay below 500 ms is not allowed; using 500.");
    opts.delay = 500;
  }

  const queries = buildQueries(opts.seeds, opts.modifiers);
  if (queries.length > 50) {
    const minutes = Math.ceil((queries.length * opts.delay * 1.25) / 60000);
    console.error(`${queries.length} queries, about ${minutes} min at this delay. Ctrl+C keeps what was printed.`);
  }

  const results = [];
  let stop = null;
  for (const [i, query] of queries.entries()) {
    if (i > 0) await sleep(opts.delay + Math.random() * opts.delay * 0.5);
    let suggestions;
    try {
      suggestions = await suggest(query, opts);
    } catch (err) {
      stop = { query, err };
      break;
    }
    const result = {
      query,
      selfCompletes: suggestions.some((s) => normalize(s) === normalize(query)),
      suggestions,
    };
    results.push(result);
    if (!opts.json) printResult(result);
  }

  if (opts.json) console.log(JSON.stringify(results, null, 2));
  else printSummary(results, queries.length);

  if (stop) {
    const { query, err } = stop;
    if (err instanceof RateLimited) {
      console.error(
        `\nStopped at "${query}": Google did not return JSON (${err.message}). You are probably rate limited.\n` +
          "Wait at least 15-30 minutes before running again, then send fewer queries or a longer --delay.\n" +
          "Do not retry in a loop: that extends the block.",
      );
      process.exit(2);
    }
    console.error(`\nStopped at "${query}": ${err.message}`);
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    if (proxy && !process.env.NODE_USE_ENV_PROXY) {
      console.error(
        "HTTPS_PROXY is set, but Node's fetch ignores it unless NODE_USE_ENV_PROXY=1 (Node 22.21+ or 24.5+):\n" +
          `  NODE_USE_ENV_PROXY=1 node ${process.argv.slice(1).map((a) => JSON.stringify(a)).join(" ")}`,
      );
    }
    process.exit(1);
  }
}

main();
