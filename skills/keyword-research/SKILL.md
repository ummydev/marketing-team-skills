---
name: keyword-research
description: "When the user wants to choose evergreen keywords a small or new site can actually rank for, decide which pages to write next, or keep track of which page targets which term. Also use when the user mentions 'keyword research,' 'find keywords,' 'what should we rank for,' 'long-tail keywords,' 'low-competition keywords,' 'keyword map,' 'keyword cannibalization,' 'two pages competing,' 'is this keyword worth it,' 'autocomplete research,' 'Search Console queries,' 'Bing keyword tool,' or 'we don't have Ahrefs or Semrush.' For terms created by this week's launches and news, see trend-keywords. For alternatives and vs pages, see competitor-pages."
---

# Keyword Research for a Small Site

A new domain won't reach the top 10 for terms that official docs and big sites own, however good the page. This skill finds terms it can win, proves demand without paid tools, and keeps one keyword map so your own pages don't compete with each other.

## What to target, in order

| Type | Examples | Why it works |
|---|---|---|
| Brand + modifier | "codex remote control", "opencode scheduled tasks", "codex telegram bot" | A specific need the vendor's docs often skip; results are GitHub repos and forum threads |
| Tool + use | "claude code kanban", "ai agent for seo" | The searcher has a job to do; few pages answer that exact job |
| Alternative / vs with no vendor page | "claude squad alternative", "paperclip vs hermes" | Neither vendor wrote it; results are directories and small blogs (see competitor-pages) |
| Head term: skip for now | "claude code hooks", "claude code mcp", "claude code vs cursor" | Official docs and large sites hold the top 10 |

## Workflow

### 1. Start from Search Console

GSC → Performance → Search results → last 28 days → Queries, then Pages.

- A query with impressions at position 8–50: the page is close. Run autocomplete on it and add the long tails as sections or FAQ entries. When "claude code remote control" showed impressions, its autocomplete was mostly troubleshooting ("not working", "disconnects", "isn't available"), so we added four troubleshooting answers to that page.
- A query landing on the wrong page: reassign it in the map (step 6) and fix internal links.
- A new site gets only a handful of queries in its first weeks. Read them anyway: they are the only real data you have.

### 2. Generate candidates with autocomplete

Cross the brands in your niche (integrations, competitors, platforms) with the jobs people do with them. `scripts/autocomplete.mjs` sits at the root of this repo (Node 18+, no dependencies); it sends one request at a time about a second apart. Behind a proxy, prefix the command with `NODE_USE_ENV_PROXY=1`.

```bash
node scripts/autocomplete.mjs "codex" "opencode" "gemini cli" "cursor cli" \
  --modifiers "remote control,from phone,scheduled tasks,cron,headless,background,24/7,telegram,slack,discord" \
  --json > research/autocomplete-2026-11-07.json
```

- `self-completes` on "<brand> <modifier>": people search that exact phrase.
- Count self-completing modifiers per brand to rank brands. In one run of 22 agent-name spellings × 30 modifiers (about 800 lookups), Claude Code and Codex had 7–10 long tails on nearly every modifier, while eight smaller agents had at most one phrase, "<agent> remote control".
- A modifier that works across many brands is a page template (see programmatic-pages): "remote control / from phone", "scheduled tasks / cron / headless", "telegram / slack / discord".
- Other languages: run with `--hl zh-CN`, `--hl ja`. Phrasing differs, so research each language rather than translating the English term.
- If the script stops on a non-JSON response, you're rate limited. Wait 15–30 minutes; don't loop.

Autocomplete proves demand exists. It says nothing about volume: two terms that both self-complete can differ 100×.

### 3. Size it with Google Trends

Compare up to 5 terms per view: `https://trends.google.com/trends/explore?date=today%203-m&q=codex%20remote%20control,opencode%20remote%20control`

- Numbers are relative to the biggest term in the view. Keep one anchor term (one your GSC already shows) in every comparison so batches can be compared.
- A long tail that shows 0 is below Trends' threshold, not dead. Autocomplete plus a weak results page is enough to write it.
- Use Trends to choose between near-synonyms ("claude worktree" vs "claude code worktrees") and put the bigger one in the title.

### 4. Check Bing Webmaster keyword research

Bing Webmaster Tools → Keyword Research gives Bing impressions for a term and related terms. It is useful for brand-sized terms (3-month Bing impressions we saw: "hermes agent" ~289k, "openclaw" ~181k, "multica" ~24k, "paperclip ai" ~5.2k) and usually returns no data for niche long tails. No data there means small, not zero.

### 5. Check the results page by hand

Search each finalist in a normal browser, one query at a time; don't scrape results pages. Write it if at least 4 of the top 10 are forums, GitHub repos, small blogs or vendor self-promotion and nothing fully answers the query. Skip it if official docs and established sites hold the top 5. Also check that the results are about your meaning of the name.

### 6. Record it in the keyword map

One main keyword per URL. Register a page here before writing it. A minimal `keywords.md`:

```markdown
| Main keyword | Long tails (autocomplete, date) | URL | Status | Notes |
|---|---|---|---|---|
| codex remote control | from phone, cli, linux, windows, vscode, not working (2026-11-08) | /codex-remote-control | planned | results page checked <date>: <what holds the top 10> |
| claude code worktree | cleanup, location, base ref, vs branch (2026-11-06) | /blog/claude-code-worktree | live | took "worktrees" from /blog/multiple-claude-code-agents |
```

Status flow: `planned` → `live` → `ranking` (has impressions in GSC) → `refresh` (position slipping or facts out of date). When a new page takes a term from an old one, edit both rows and link the old page to the new one.

### 7. Review every month

Replace guesses with GSC data: add the real queries each page gets, mark pages with impressions as `ranking`, and plan the next batch from step 1's near-misses before new research.

## Pre-publish checklist

- [ ] Main keyword self-completes; long tails saved with the date
- [ ] Not a head term owned by official docs or big sites (checked by hand)
- [ ] Brand name in the keyword is unambiguous in the results
- [ ] Main keyword isn't already assigned to another URL in `keywords.md`
- [ ] Main keyword in the title (under 60 characters; about 30 for CJK), H1, slug and first paragraph
- [ ] The page only claims integrations and features your product has today
- [ ] Row added to `keywords.md` with status `planned`, updated to `live` on publish

## Pitfalls we hit

- **Head tutorials don't rank on a new domain.** In two days we wrote about ten tutorials on head terms (claude code hooks, mcp, plan mode, claude code vs cursor), picked because autocomplete was full of long tails. Then we looked at the results pages: official docs and large sites held the top 10. A peer site in the same niche told us its search traffic came from brand terms, templated pages and "tool + use" long tails, and the queries our own GSC showed were niche ones ("ai employee", "claude code remote control"). We stopped writing head tutorials and now check the results page before writing.
- **Autocomplete isn't volume, or rankability.** Those head terms self-completed with up to ten long tails each. That shows people search them, not that a new site can rank for them. Always do step 5.
- **Ambiguous names.** Goose, Cline and DeepSeek returned mixed or off-topic results, so their brand + modifier data was unreliable. Our own brand ranked behind an unrelated app with the same name, so titles use the longer form ("Crewmark AI" in our case).
- **Three pages, one keyword.** Three of our pages targeted "ai employee". We split them by intent: the definition guide keeps "what is an ai employee", the platform roundup takes "best ai employee platforms" and "hire", each role page takes "ai <role> agent". Likewise "claude code worktrees" moved from a parallel-agents overview to a dedicated page, and "vs cursor" moved from a Codex comparison to its own page.
- **Demand for things you don't support.** "<agent> remote control" had demand for agents our product doesn't integrate with. Those pages may describe what the agent itself can do; they must not imply your product supports it.
- **Terms that never showed up.** "agent teams alternative" barely autocompleted, so we paused that page instead of writing on a guess.
- **Titles cut off.** 49 of our English titles were 57–88 characters and truncated in results. Main keyword first, under 60 characters, brand suffix only if it fits.
- **Translating everything too early.** About 90% of our URLs were translations on a domain with no authority yet. See multilingual-seo before multiplying pages.

## Related skills

- **trend-keywords**: terms that appear this week because of a launch or shutdown
- **competitor-pages**: alternative and vs terms once you've found them
- **programmatic-pages**: when a modifier works across many brands, build a template
- **seo-page**: on-page work for the page you write next
- **multilingual-seo**: per-language research and which languages to ship
- **index-push**: getting new pages crawled once they're live
- **seo-daily-report**: tracking impressions, positions and the keyword map's status
