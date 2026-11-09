---
name: index-push
description: When the user wants to get new or changed pages crawled and indexed by Google and Bing quickly, instead of waiting weeks for the sitemap to be read. Use after any deploy that adds or updates pages, and when the user says "get this indexed", "request indexing", "submit to Google", "submit URLs to Bing", "IndexNow", "ping search engines", "resubmit the sitemap", "why isn't my page indexed", "Discovered – currently not indexed", "URL is unknown to Google", "Quota Exceeded in Search Console" or "indexing queue". Covers IndexNow, Search Console URL Inspection and sitemaps, Bing Webmaster URL submission, a prioritized queue file, and diagnosing pages that stay out of the index.
---

# Index push

Shipping a page doesn't get it crawled. On a new domain, Google can sit on a URL it found in the sitemap for weeks. This skill is the routine for the day a page goes live and the follow-up until it's indexed. Use all four channels; they reach different engines and have different limits.

| Channel | Reaches | Daily limit | How |
|---|---|---|---|
| IndexNow (`scripts/indexnow.mjs`) | Bing, Yandex, Naver, Seznam, Yep. Not Google | 10,000 URLs per request | One command |
| Search Console URL Inspection → Request indexing | Google | About 10 URLs per property; resets around midnight US Pacific | Browser, one URL at a time |
| Search Console Sitemaps → resubmit | Google | None that matters | Browser, one field |
| Bing Webmaster Tools → Submit URLs | Bing | 100 URLs | Browser, paste a list |

Request indexing is the one that moved Google for us: eight URLs sitting at "unknown" or "Discovered" were all indexed about a day after we requested them. Sitemap and IndexNow alone left Google pages waiting.

**Browsing rule.** Search Console and Bing Webmaster are signed-in sites: work them one page at a time at a human pace and never script their UI. The same holds for any social site. If a site rate-limits or blocks you, stop and tell the user.

## One-time setup

1. **Search Console:** add a Domain property (verified by a DNS TXT record). Never delete that TXT record; verification lapses without it.
2. **Bing Webmaster Tools:** "Import from Google Search Console" is fastest. A GSC Domain property can't be imported; Bing creates a URL-prefix site (`https://example.com/`) instead, which works. Submit the sitemap there too.
3. **IndexNow key file**, deployed before the first submission:
   ```bash
   KEY=$(openssl rand -hex 16)
   printf '%s' "$KEY" > public/$KEY.txt          # any folder served at the site root
   # commit, deploy, then confirm it prints the key and nothing else:
   curl -s "https://example.com/$KEY.txt"
   ```
   The key is public by design (anyone can read the file), so it can live in `package.json`:
   `"seo:indexnow": "INDEXNOW_KEY=<key> node scripts/indexnow.mjs --host example.com"`
4. **Queue file** `docs/seo/index-queue.md` (template below), committed to the repo. Not in a temp or scratch folder.

## Workflow: the day pages ship

1. **Check the pages are live.** Own site, sequential requests:
   ```bash
   for p in /blog/new-post /zh/blog/new-post; do
     curl -s -o /dev/null -w "%{http_code} $p\n" "https://example.com$p"
   done
   curl -s https://example.com/blog/new-post | grep -o '<link rel="canonical"[^>]*>'
   ```
   Every URL must return 200 (not a redirect), carry a self-referencing canonical, appear in the sitemap and be linked from at least one page Google already crawls (home, blog index, a footer "latest posts" block, a related post). Don't submit anything that fails these.
2. **IndexNow.**
   ```bash
   npm run seo:indexnow -- /blog/new-post /zh/blog/new-post
   npm run seo:indexnow -- --sitemap        # after a big release, or when unsure what changed
   ```
   200 or 202 means accepted (202 is normal while a new key is being validated). 403: the key file isn't live or its content differs. 422: a URL is on another host, usually `www.` vs the bare domain.
3. **Update the queue.** Find what's new since the last run by diffing the live sitemap against a committed snapshot (on the first run, just save the snapshot; `--dry-run` needs no key):
   ```bash
   node scripts/indexnow.mjs --host example.com --sitemap --dry-run 2>/dev/null | sort > sitemap-now.txt
   comm -13 docs/seo/sitemap-snapshot.txt sitemap-now.txt     # URLs added since the snapshot
   mv sitemap-now.txt docs/seo/sitemap-snapshot.txt
   ```
   Order the queue by: (1) pages published today, newest first; (2) primary languages before translations, e.g. English then Chinese; (3) time-sensitive topics (a release, a shutdown) before evergreen ones; (4) existing pages whose content materially changed. Other locales go last.
4. **Resubmit the sitemap in Search Console** after adding many URLs or a new section: Sitemaps → enter `https://example.com/sitemap.xml` → Submit. Compare "Discovered pages" with your own count. It goes stale: ours showed 243 until we resubmitted, then 423.
5. **Request indexing in Search Console**, top of the queue down:
   - Open Search Console and check that the account in the URL (`/u/0/`, `/u/1/`, `/u/2/`) shows the property. The index changes between days; use whichever lists it.
   - Paste the URL into the inspection bar at the top, wait for the result, click **Request indexing**, wait for the live test (about a minute).
   - Count it only when the "Indexing requested" dialog appears. No dialog means it didn't go through, often because the account lacks permission.
   - "Something went wrong" on the first try: retry once. It usually works.
   - "Quota Exceeded": stop for the day; the quota resets around midnight US Pacific. Plan on about 10 per day.
   - Write the date into the queue row.
6. **Bing Submit URLs:** Bing Webmaster Tools → URL Submission → Submit URLs → paste the next URLs from the queue, one per line, up to the remaining quota the page shows (100 a day). Write the date into the queue rows.
7. **Record** one line per action in `docs/seo/log.md`, with the deploy or commit ref:
   `- main=abc1234 live. IndexNow 18 URLs → 200. GSC requested 10 (Quota Exceeded on the 11th). Bing 100 submitted, 44 left in queue.`

## Follow-up, 1 to 3 days later

Inspect the newest pages first in URL Inspection (Bing has its own URL Inspection with similar states):

| Status | What it means | Do |
|---|---|---|
| URL is on Google | Indexed | Mark indexed, drop from queue, log it |
| URL is unknown to Google | Not in a sitemap Google has read, no links found | Resubmit sitemap, add internal links, request indexing |
| Discovered – currently not indexed, Referring page: None detected | Google knows the URL only from the sitemap and hasn't crawled it | Add links from pages that already get crawled and visited; earn external links; request indexing |
| Crawled – currently not indexed | Fetched, judged not worth indexing yet | Check for thin or near-duplicate content (translations, templated pages); improve or merge. More requests won't help |
| Duplicate, Google chose different canonical | Canonical or hreflang confusion | Fix canonical tags; make sure locale versions aren't identical |
| Page with redirect / Not found (404) | Wrong URL in the sitemap | Fix the sitemap |

"Referring page: None detected" is the key clue: the fix is links, not more submissions. What worked for us: a footer block linking the five latest posts from the home page and top guides, cross-links between related posts, and a public GitHub repository whose README links to the pages.

Search Console performance data lags 2–3 days. Don't judge a page from yesterday's numbers.

## Queue file template

```markdown
# Index queue
Top = submit next. Order: newest first; English and Chinese before other locales.
Limits: Google Request indexing ~10/day per property (resets ~midnight US Pacific). Bing Submit URLs 100/day.

| URL | Added | Google requested | Bing submitted | Indexed |
|---|---|---|---|---|
| https://example.com/blog/new-post | 2026-11-07 | 11-08 | 11-07 | |
| https://example.com/zh/blog/new-post | 2026-11-07 | | 11-07 | |
```

## Checklist

- [ ] Each URL live: 200, self canonical, in the sitemap, linked from a crawled page
- [ ] IndexNow returned 200 or 202 for the new and changed URLs
- [ ] Queue updated and sorted by priority
- [ ] Sitemap resubmitted after a large addition; discovered count matches
- [ ] Search Console Request indexing up to the quota, each confirmed by the dialog
- [ ] Bing Submit URLs up to the quota
- [ ] Log lines written with commit or deploy refs; follow-up inspection date noted

## Pitfalls we hit

- **Request indexing did nothing for three days.** No confirmation dialog ever appeared. The browser's default Google account had no access to the property; opening Search Console under the account that owned it (a different `/u/N/`) fixed it immediately. Days later the property opened under yet another index.
- **"Invalid sitemap address".** On a Domain property, typing `sitemap.xml` fails; the full `https://example.com/sitemap.xml` works.
- **Stale sitemap counts.** Search Console kept showing 11 discovered pages after the site had 100, until we resubmitted; later 243 vs 423.
- **Unlinked pages stayed invisible.** Two guides published with no internal links were still "URL is unknown to Google" days later.
- **Quota guesswork.** We first assumed about 4 requests a day; it was about 10. The 11th returns "Quota Exceeded".
- **First request of the day failed** with "Something went wrong". The retry went through.
- **Lost queue.** A 115-URL Bing list kept in a temp folder vanished when the session restarted, and we rebuilt it from the sitemap. Keep the queue in the repo.
- **Queue longer than the quota.** After a busy day, 115 URLs were waiting for 100 Bing slots. Priority order decided what went first: new posts in English and Chinese, translations after.
- **No browser in a session.** Search Console and Bing need one; IndexNow doesn't. Run IndexNow, log the gap, catch up next session.
- **202, then 200.** IndexNow answered 202 for the first submissions with a new key and 200 afterwards. Both are success.
- **Translations swamp the quota.** About 392 of 441 sitemap URLs were translations. Submitting them all by hand burns days of quota on pages a new domain rarely gets indexed anyway.

## Related skills

- **seo-page**: builds the page this skill gets indexed.
- **programmatic-pages**: ships many URLs at once; queue priority matters most there.
- **multilingual-seo**: which locales to publish and submit first; hreflang.
- **competitor-pages**, **trend-keywords**: time-sensitive pages that go to the front of the queue.
- **keyword-research**: decides which pages exist in the first place.
- **ai-search**: llms.txt and robots.txt for AI crawlers; Bing's index also feeds Copilot.
- **seo-daily-report**: reports what got indexed and what's queued for tomorrow.
