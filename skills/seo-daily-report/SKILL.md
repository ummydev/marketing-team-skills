---
name: seo-daily-report
description: When the user wants to write the end-of-day SEO report, with traffic, Search Console numbers, progress against weekly KPIs, what was done, what's queued for tomorrow and what needs a human, and to keep the SEO log and keyword map current. Use when the user says "daily SEO report", "end-of-day report", "SEO standup", "how did SEO do today", "KPI check", "are we on track", "update the SEO log", "what did we ship for SEO today", or at the end of any SEO working day.
---

# SEO daily report

One honest message at the end of each working day that tells a human where traffic stands against the weekly KPI, what shipped, what's queued, and what only they can unblock. Writing it is also what keeps `docs/seo/log.md` and `docs/seo/keywords.md` current; skip the report and those files rot.

Inputs: web analytics (PostHog, Plausible, GA4…), Google Search Console, optionally Bing Webmaster Tools, `docs/seo/log.md`, `docs/seo/keywords.md`, `docs/seo/index-queue.md` and `git log`.

**Browsing rule.** Read Search Console and Bing one page at a time, at a human pace; never script their UI or fire bulk requests at any signed-in site, social sites above all. If a site rate-limits you, stop and say so in the report.

## Workflow

### 1. Web analytics: yesterday and week to date
Collect unique visitors and pageviews on marketing pages, the channel breakdown (organic search, AI assistants, referral, social, direct), and the top landing pages from search. Exclude internal traffic first (team accounts, office IPs, test users).

PostHog web analytics via the query API (`posthog-cli` works too, if installed):
```bash
curl -s -X POST "https://us.posthog.com/api/projects/$POSTHOG_PROJECT_ID/query/" \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" -H "Content-Type: application/json" \
  -d '{"query": {"kind": "WebStatsTableQuery", "breakdownBy": "InitialChannelType",
       "dateRange": {"date_from": "-7d"}, "properties": [], "filterTestAccounts": true}}'
```
Use `"breakdownBy": "InitialPage"` for landing pages and `"kind": "WebOverviewQuery"` for visitor, pageview and session totals. In GA4 the equivalent is Reports → Acquisition → Traffic acquisition (session default channel group); in Plausible, Top Sources → Channels.

**Separate direct from search.** On a young site, Direct is mostly the team, testers and links shared in chat. Report it on its own line and never count it toward SEO.

### 2. Search Console
In the browser: Performance → Search results, last 7 days, then compare with the previous 7. Note the "Last updated" date; data lags 2–3 days, so the report says "data through <date>". Record total impressions, clicks and average position; open the Queries tab sorted by impressions, and the Pages tab. Then check Indexing → Pages (indexed vs not indexed) and Sitemaps (last read date, discovered count).

**New queries:** compare today's query list with the one in the last report, and list each new query with its landing page, impressions and position. A query landing on the wrong page is a keyword map problem; fix it in step 6.

Account gotcha: the `/u/N/` account index in Search Console URLs can change between days. Use whichever index shows the property.

API alternative (a service account added as a user on the property, token with the `webmasters.readonly` scope):
```bash
curl -s -X POST "https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Aexample.com/searchAnalytics/query" \
  -H "Authorization: Bearer $GSC_TOKEN" -H "Content-Type: application/json" \
  -d '{"startDate": "2026-10-29", "endDate": "2026-11-04", "dimensions": ["query", "page"], "rowLimit": 250}'
```

### 3. Compare to the weekly KPI
Example targets: 10,000 impressions, 500 clicks and 2,000 unique visitors a week. For analytics, compare week to date with the target pro-rated to today (target × days elapsed ÷ 7). For Search Console, use the latest 7 complete days available and state the range. Give the gap as a number.

Be honest when numbers are flat: say flat, give the likely reason (indexing lag, a new domain without authority, topic choice) and what changes because of it. Don't dress up tiny numbers ("+200%" from 1 to 3). A higher average position number arriving together with more impressions usually means new queries at low positions, which is progress.

### 4. What was done, against the checklist
Pull from today's entries in `log.md` and `git log --since=midnight --oneline -- <content paths>`, and sort them under the five steps:
- **Find:** topics or keywords considered; which one was chosen and why; what was rejected and why.
- **Verify:** demand evidence (autocomplete, Search Console queries, trends); facts taken from official sources.
- **Publish:** URLs and locale count, commit, deploy ref, live 200 check.
- **Index:** IndexNow URLs and status; Google requests used of ~10; Bing submissions used of 100; sitemap count.
- **Record:** `log.md` and `keywords.md` updated.

A step that didn't happen gets an unchecked box and the reason.

### 5. Queued for tomorrow
From `index-queue.md`: the next 10 URLs for Google Request indexing and the next Bing batch. Add the indexing re-checks that fall due and the pages planned next.

### 6. Update the log and keyword map, then post
- `log.md`: newest date first, one line per action, with URLs, counts, commit or deploy refs and the result.
- `keywords.md`: one main keyword maps to exactly one URL; register a keyword before writing its page; status goes planned → live → ranking → refresh. When Search Console shows a query landing on a different URL than planned, reassign it or merge the pages.

Post the report where the team reads it (an issue comment, Slack, email) and commit the docs.

### 7. Blockers that need a human
List only what the agent can't do itself: approvals (pricing, product code deploys, DNS), access (a Search Console permission, a browser login), decisions (which languages to publish). Each one says what is being asked and what it blocks. If there are none, write "None".

## log.md entry

```markdown
## 2026-11-07
- Published /blog/x-alternatives in 9 locales (3f5ced6); deployed main=c15281a; all 9 URLs return 200.
- IndexNow: 10 URLs → 200. GSC: requested 10 (Quota Exceeded on the 11th). Bing: 100 submitted, 44 left in queue.
- GSC (data through 11-04): 28-day impressions 35, clicks 0, avg position 49.7. New query "x remote control" → /remote-x.
- Decision: stop writing head-term tutorials; focus on same-day releases and niche alternatives (new domain can't reach the top 10).
```

## keywords.md row

Same format as the keyword-research skill. On report days, move pages that got impressions to `ranking` and note the real query and position:

```markdown
| Main keyword | Long tails (autocomplete, date) | URL | Status | Notes |
|---|---|---|---|---|
| vibe kanban alternative | reddit, open source (2026-11-07) | /blog/vibe-kanban-alternatives | ranking | GSC 11-10: pos 18, 40 impr. |
```

## Report template

```markdown
## SEO daily report, {YYYY-MM-DD}

**Bottom line:** {one sentence: up, flat or down, and the main reason}

### Traffic ({analytics tool}, internal traffic excluded)
| | Yesterday | Week to date | Weekly KPI | On pace? |
|---|---|---|---|---|
| Unique visitors | | | 2,000 | |
| Pageviews | | | — | |
| Organic search visitors | | | — | |
| AI assistant visitors | | | — | |
| Direct (mostly team) | | | — | |
Top search landing pages: {page (visitors), …}

### Search Console (data through {date}; 2–3 day lag)
| | Last 7 days | Previous 7 days | Weekly KPI |
|---|---|---|---|
| Impressions | | | 10,000 |
| Clicks | | | 500 |
| Average position | | | — |
| Indexed / in sitemap | | | — |
New queries: `{query}` → {page} ({impressions} impr., pos. {n})

### Done today
- [x] Find: {chosen topic, and why; rejected candidates}
- [x] Verify: {demand evidence; sources}
- [x] Publish: {URLs, locales, commit, deploy}
- [x] Index: IndexNow {n} URLs ({status}) · Google {n}/10 · Bing {n}/100
- [x] Record: log.md, keywords.md
- [ ] {step not done}: {why}

### Queued for tomorrow
- Google Request indexing: {next URLs}
- Bing: {n} URLs, starting with {…}
- Re-inspect: {URLs requested 1–3 days ago}
- Next pages: {…}

### Needs a human
- {ask}: blocks {what}. (Or "None".)
```

## Checklist
- [ ] Internal traffic excluded; direct reported separately from search
- [ ] Search Console numbers labeled with "data through" date
- [ ] Week to date compared with the pro-rated KPI; gap stated as a number
- [ ] New queries listed with landing pages
- [ ] Each of find, verify, publish, index and record marked done or not done, with reasons
- [ ] Tomorrow's queue taken from index-queue.md
- [ ] Blockers name the person's action and what it unblocks
- [ ] log.md and keywords.md updated and committed

## Pitfalls we hit
- **Reading lagged data as today's.** On Nov 6 the Performance report only went through Nov 3. Every Search Console number now carries its "data through" date.
- **Average position "got worse" from 2.7 to 46.5** the week real queries arrived. The 2.7 came from 3 brand impressions; the 46.5 meant we were appearing for generic terms.
- **Direct was us.** The first 30 days had 29 sessions, all Direct, mostly the team. Internal traffic is filtered out now and Direct is its own line.
- **A gap too big to soften.** 35 impressions in 28 days against a 10,000-a-week target. We reported it plainly, with the causes (a new domain, head-term topics it couldn't rank for) and the change of plan.
- **Zero vs not tracked.** A signup funnel read 63 → 3 → 2 → 0 → 0; the last two steps were zero because the button had no tracking. Report "not tracked" apart from real zeros.
- **Copying yesterday's numbers.** In a session without a browser, Search Console couldn't be read. The report says "not checked (no browser)" instead.
- **A queue in a temp folder** disappeared when the session restarted, so tomorrow's list had to be rebuilt from the sitemap. It lives in the repo now.
- **Wrong Google account.** The Search Console URL needed a different `/u/N/` from one day to the next.

## Related skills
- **index-push**: produces the indexing numbers and the queue the report reads.
- **keyword-research**, **trend-keywords**: the "find" and "verify" steps.
- **seo-page**, **competitor-pages**, **programmatic-pages**: the "publish" step.
- **multilingual-seo**: per-locale traffic and which languages to prioritize.
- **ai-search**: AI-assistant visits and the monthly answer check.
