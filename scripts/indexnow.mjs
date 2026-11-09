#!/usr/bin/env node
// IndexNow submitter. Tells Bing, Yandex, Naver, Seznam and Yep that URLs were added or changed, so they recrawl them
// in hours instead of weeks. Google does not take part in IndexNow; use Search Console for Google.
// Node 18+, no dependencies.
//
//   INDEXNOW_KEY=<key> node scripts/indexnow.mjs --host example.com /blog/new-post /zh/blog/new-post
//   INDEXNOW_KEY=<key> node scripts/indexnow.mjs --host example.com --sitemap
//   node scripts/indexnow.mjs --host example.com --sitemap --dry-run     # list the URLs, send nothing
//
// The key is not a secret. IndexNow checks that you own the host by fetching https://<host>/<key>.txt, which must
// contain exactly the key, so deploy that file before the first submission. 200 and 202 both mean accepted.
// Protocol: https://www.indexnow.org/documentation

const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000; // protocol maximum per request
const TIMEOUT_MS = 30_000;
// Some CDNs answer 403 to Node's default User-Agent, so sitemap and key-file checks look like a browser.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const STATUS_HINTS = {
  200: "OK, URLs submitted",
  202: "Accepted, key validation pending (normal for the first submissions with a new key)",
  400: "Bad request: the request body is invalid",
  403: "Forbidden: key not valid. Is the key file live, and does it contain exactly the key?",
  422: "Unprocessable: a URL is not on this host, or the key does not match the protocol format",
  429: "Too many requests: the engine suspects spam. Submit less often",
};

const USAGE = `Submit URLs to IndexNow.

Usage:
  INDEXNOW_KEY=<key> node scripts/indexnow.mjs --host <host> <path or URL>...
  INDEXNOW_KEY=<key> node scripts/indexnow.mjs --host <host> --sitemap

Options:
  --host <host>          Site host without scheme, e.g. example.com (or set INDEXNOW_HOST)
  --key <key>            IndexNow key (or set INDEXNOW_KEY)
  --sitemap              Add every <loc> in https://<host>/sitemap.xml (sitemap indexes are followed)
  --sitemap-url <url>    Use a different sitemap, e.g. https://<host>/sitemap_index.xml (implies --sitemap)
  --key-location <url>   Where the key file lives (default https://<host>/<key>.txt)
  --skip-key-check       Don't check the key file before submitting
  --dry-run              Print the URLs that would be sent, one per line on stdout, and send nothing
  -h, --help             Show this help

Environment:
  INDEXNOW_ENDPOINT      Override the endpoint (default ${"https://api.indexnow.org/indexnow"})

Exit code 1 if any batch fails or the input is invalid.`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    host: process.env.INDEXNOW_HOST ?? "",
    key: process.env.INDEXNOW_KEY ?? "",
    keyLocation: "",
    sitemap: false,
    sitemapUrl: "",
    skipKeyCheck: false,
    dryRun: false,
    help: false,
    targets: [],
  };
  for (let i = 0; i < argv.length; i++) {
    let arg = argv[i];
    let inline;
    if (arg.startsWith("--") && arg.includes("=")) [arg, inline] = [arg.slice(0, arg.indexOf("=")), arg.slice(arg.indexOf("=") + 1)];
    const value = () => {
      const next = inline ?? argv[++i];
      if (next === undefined || (inline === undefined && next.startsWith("--"))) fail(`${arg} needs a value.\n\n${USAGE}`);
      return next;
    };
    switch (arg) {
      case "--host": opts.host = value(); break;
      case "--key": opts.key = value(); break;
      case "--key-location": opts.keyLocation = value(); break;
      case "--sitemap": opts.sitemap = true; break;
      case "--sitemap-url": opts.sitemapUrl = value(); opts.sitemap = true; break;
      case "--skip-key-check": opts.skipKeyCheck = true; break;
      case "--dry-run": opts.dryRun = true; break;
      case "-h":
      case "--help": opts.help = true; break;
      default:
        if (arg.startsWith("-")) fail(`Unknown option ${arg}.\n\n${USAGE}`);
        opts.targets.push(arg);
    }
  }
  return opts;
}

const normalizeHost = (host) => host.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").toLowerCase();

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { status: response.status, text: await response.text() };
}

const decodeXml = (text) =>
  text
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .trim()
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

// Returns every page URL in a sitemap. A sitemap index lists child sitemaps; those are fetched one at a time.
async function sitemapUrls(sitemapUrl, depth = 0) {
  const { status, text } = await fetchText(sitemapUrl);
  if (status !== 200) throw new Error(`${sitemapUrl} returned HTTP ${status}`);
  if (/^\s*<!doctype html|^\s*<html/i.test(text)) {
    throw new Error(`${sitemapUrl} returned an HTML page, not XML (a bot challenge or an error page?)`);
  }
  const locs = [...text.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeXml(match[1].trim()));
  if (!/<sitemapindex[\s>]/.test(text)) return locs;
  if (depth >= 2) throw new Error(`${sitemapUrl}: sitemap indexes nested too deep`);
  const pages = [];
  for (const child of locs) pages.push(...(await sitemapUrls(child, depth + 1)));
  return pages;
}

async function checkKeyFile(keyLocation, key) {
  try {
    const { status, text } = await fetchText(keyLocation);
    if (status !== 200) return `returned HTTP ${status}`;
    if (text.trim() !== key) return `does not contain the key (starts with "${text.trim().slice(0, 40)}")`;
    return "";
  } catch (error) {
    return `could not be fetched (${error.message})`;
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) return console.log(USAGE);
  if (typeof fetch !== "function") fail("Node 18 or newer is required (global fetch).");

  const host = normalizeHost(opts.host);
  if (!host) fail(`--host is required.\n\n${USAGE}`);
  if (!opts.sitemap && !opts.targets.length) fail(`Give paths or URLs, or --sitemap.\n\n${USAGE}`);
  const key = opts.key.trim();
  if (!key && !opts.dryRun) fail("Set INDEXNOW_KEY (or pass --key).");
  if (key && !/^[A-Za-z0-9-]{8,128}$/.test(key)) fail("An IndexNow key is 8-128 characters: letters, digits and dashes.");
  const origin = `https://${host}`;
  const keyLocation = opts.keyLocation || `${origin}/${key}.txt`;

  const candidates = [];
  for (const target of opts.targets) {
    try {
      candidates.push(new URL(target, origin).href);
    } catch {
      fail(`Not a path or URL: ${target}`);
    }
  }
  if (opts.sitemap) {
    const sitemap = opts.sitemapUrl || `${origin}/sitemap.xml`;
    const pages = await sitemapUrls(sitemap);
    console.error(`Sitemap ${sitemap}: ${pages.length} URLs`);
    candidates.push(...pages);
  }

  // IndexNow rejects the whole request (422) if one URL is on another host, e.g. www vs the bare domain.
  const seen = new Set();
  const urlList = [];
  let skipped = 0;
  for (const candidate of candidates) {
    let url;
    try {
      url = new URL(candidate);
    } catch {
      console.error(`Skipped, not a URL: ${candidate}`);
      skipped++;
      continue;
    }
    if (url.host.toLowerCase() !== host) {
      console.error(`Skipped, host is ${url.host}, not ${host}: ${candidate}`);
      skipped++;
      continue;
    }
    if (!seen.has(url.href)) {
      seen.add(url.href);
      urlList.push(url.href);
    }
  }
  if (!urlList.length) fail(`No URLs to submit${skipped ? ` (${skipped} skipped)` : ""}.`);

  const batches = [];
  for (let i = 0; i < urlList.length; i += BATCH_SIZE) batches.push(urlList.slice(i, i + BATCH_SIZE));

  if (opts.dryRun) {
    for (const url of urlList) console.log(url);
    console.error(`Dry run: ${urlList.length} URLs for ${host} in ${batches.length} batch(es); nothing sent.`);
    if (key) {
      const problem = await checkKeyFile(keyLocation, key);
      console.error(`Key file ${keyLocation}: ${problem || "OK"}`);
    }
    return;
  }

  if (!opts.skipKeyCheck) {
    const problem = await checkKeyFile(keyLocation, key);
    if (problem) fail(`Key file ${keyLocation} ${problem}. Deploy it (its content is exactly the key) and retry.`);
  }

  let failed = 0;
  for (const [index, batch] of batches.entries()) {
    const label = `Batch ${index + 1}/${batches.length} (${batch.length} URLs)`;
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host, key, keyLocation, urlList: batch }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const hint = STATUS_HINTS[response.status] ?? response.statusText;
      if (response.ok) {
        console.log(`${label}: ${response.status} ${hint}`);
      } else {
        const body = (await response.text()).trim().slice(0, 300);
        console.error(`${label}: ${response.status} ${hint}${body ? `\n  ${body}` : ""}`);
        failed++;
      }
    } catch (error) {
      console.error(`${label}: request failed (${error.message})`);
      failed++;
    }
  }
  if (skipped) console.error(`${skipped} URL(s) skipped.`);
  if (failed) {
    console.error(`${failed} of ${batches.length} batch(es) failed.`);
    process.exitCode = 1;
  }
}

main().catch((error) => fail(error.message));
