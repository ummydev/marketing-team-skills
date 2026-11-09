---
name: seo-page
description: When the user wants to write, rewrite or refresh one page for one search keyword (a guide, tutorial, explainer, comparison or blog post) so it ranks and gets quoted by AI search. Also use when the user says "write an SEO page", "SEO article", "blog post for <keyword>", "landing page for this keyword", "rewrite this page for SEO", "refresh this post", "on-page SEO", "title tag", "meta description", "add an FAQ", "HowTo schema", "quotable definition", or "why isn't this page ranking". To pick the keyword first, see keyword-research or trend-keywords; for vs/alternatives pages, see competitor-pages; for many templated pages, see programmatic-pages.
---

# SEO page

One URL, one main keyword, written so a reader gets the answer in the first sentence and a crawler or LLM can quote it.
The workflow: claim the keyword, collect facts from primary sources, write in a fixed shape, check the rendered HTML,
then hand the commit to whoever deploys. The agent writing the page never publishes it.

## Workflow

### 1. Claim the keyword
- Open the keyword map (one row per keyword: keyword → URL → status; e.g. `docs/seo/keywords.md`) and search it for
  the term and its variants: `grep -in "kanban" docs/seo/keywords.md`.
- If another URL already owns the term, improve that page instead, or move the term on purpose and say so in the map
  ("'claude code worktrees' moved from the multi-agent post to the new worktree post").
- Add the row before writing: main keyword, long tails, URL, status `planned`.
- Collect long tails from Google autocomplete and "People also ask", one query at a time. They become H2s and FAQ
  questions, in the searcher's own wording. Never script bulk requests against Reddit, X, YouTube or any site you are
  signed in to; open pages one by one and stop if a site rate-limits you.
- Look at the current top 10. All big sites with complete answers: pick a narrower tail. Small GitHub projects, forum
  threads, vendor self-promotion or no overview at all: that gap is the page.

### 2. Collect facts from primary sources only
- Sources that count: the product's own docs, changelog, release notes, README, pricing page, official announcement,
  the GitHub API, the paper. News articles, other blogs and AI answers are leads, not sources.
- Keep a source list while you work: URL, the fact it supports, date opened. It becomes the "Sources" block.
- Can't confirm it (pricing page returns 403, deal amount not disclosed, no API yet)? Write "not published" or leave
  it out. Leave out numbers that change daily (stars, downloads) unless you date them.
- When media and docs disagree, write what the docs say. The difference often makes a good FAQ answer.
- Re-open the source yourself before publishing anything surprising: an acquisition, a shutdown, a price change, a
  feature that "doesn't exist". Agents and fetch tools misread pages in both directions.

### 3. Write it in this order
1. **H1** containing the keyword: "Claude Code kanban board: from the task checklist to a real board".
2. **Definition first.** The first sentence of the lead is a standalone, quotable answer: "Claude Code doesn't ship a
   kanban board; it has a task list, a checklist Claude writes for multi-step work, toggled with Ctrl+T." Then one or
   two sentences on what the page covers.
3. **What it is / how it works**: short paragraphs and bullets carrying the facts from step 2.
4. **Steps (HowTo)**: numbered, one action each, with the exact command, setting or file copied from the docs.
5. **Comparison table**: options as rows, the attributes people choose on as columns, and a line above it such as
   "Facts from each project's own README on 7 November 2026."
6. **Which one fits**: "If you … → …" bullets that link to related pages.
7. **CTA matched to the topic**: a heading and button that name this reader's next step ("Set up a board",
   "Copy the SEO specialist brief") and link to the matching product, feature or template page. Not "Get started".
8. **FAQ, 5–7 questions** from autocomplete/PAA wording. The first sentence of each answer answers it outright.
9. **Sources** (linked) and a dated **checked line**: "Checked against the Claude Code docs (Interactive mode) and
   each tool's README on 7 November 2026."

Structured data: `FAQPage`, `HowTo` for the steps, `BlogPosting`/`Article` with `datePublished` and `dateModified`,
`BreadcrumbList`. Google now shows few FAQ/HowTo rich results; keep the markup because it describes the page to
crawlers and AI search, and don't promise anyone a rich snippet.

**Rewriting an existing page:** keep the URL and the heading ids, add what the new long tails ask for, update
`dateModified` and the checked line. Example: a remote-control guide's autocomplete turned out to be all
troubleshooting ("not working", "disconnects", "isn't available"), so it got four troubleshooting FAQ entries.

### 4. Title, description, links
- **Title ≤ 60 characters** (≈ 30 for Chinese, Japanese, Korean: each full-width character counts as two), search
  term first, brand suffix only if it still fits: `Claude Code Kanban Board: Tasks and Tools | Brand`. The title
  must not promise anything the body doesn't cover.
- **Meta description**, about 140–160 characters: the definition plus what the page lists or answers, with the term once.
- One H1. Title, H1 and first sentence all carry the main term.
- **Internal links: ≥ 3 out, ≥ 3 in.** Out: contextual links in the body to related guides, the hub, the product page.
  In: edit at least three existing pages (the hub, pages that already get impressions, a "latest posts" list or
  footer) in the same change. A page nothing links to can sit in the sitemap for days without Google knowing it.

### 5. Render locally and check
Render your commit, not the shared working tree: if other sessions have uncommitted work in the same folder, use a
scratch worktree with HEAD plus your files. Then:

```bash
BASE=http://localhost:3000; URL=$BASE/blog/claude-code-kanban
curl -s -o /dev/null -w '%{http_code}\n' "$URL"                       # 200
curl -s "$URL" | sed -n 's:.*<title>\(.*\)</title>.*:\1:p' | python3 -c 'import sys,html,unicodedata as u
t=html.unescape(sys.stdin.read().strip()); print(sum(2 if u.east_asian_width(c) in "WF" else 1 for c in t), t)'  # ≤ 60, CJK counts 2
curl -s "$URL" | grep -oE '<meta name="description"[^>]*>'
curl -s "$URL" | grep -oE '<link rel="canonical"[^>]*>'                # absolute production URL of this page
curl -s "$URL" | grep -ioE '<link[^>]*hreflang[^>]*>'                 # each locale + x-default (-i: React writes hrefLang)
curl -s "$URL" | grep -oE '"@type": ?"[A-Za-z]+"' | sort | uniq -c    # FAQPage, HowTo, BreadcrumbList…
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/blog/does-not-exist"  # 404, not 200
# every internal link on the page answers 200
curl -s "$URL" | grep -oE 'href="/[^"#?]*"' | cut -d'"' -f2 | sort -u | while read -r p; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")" "$p"; done | grep -v '^200'
```

Also run the project's type-check, lint and build, and look at the page at phone width (no sideways scroll; the
table scrolls inside its own box).

### 6. Hand off, don't publish
- Commit only your own files, with explicit paths. Don't push to the production branch and don't run a deploy CLI.
- Hand off to the deploy owner (an issue or ticket): commit SHA, the URLs, the checks you ran, anything that must ship
  with it.
- Add a line to the SEO log (e.g. `docs/seo/log.md`): date, URL, keyword, sources, commit.
- After it's live: re-run the step-5 checks against production, set the keyword map row to `live`, then submit the
  URLs (index-push).

## Pre-publish checklist
- [ ] Keyword registered in the map; no other URL owns it.
- [ ] First sentence is a standalone definition or answer.
- [ ] Steps, comparison table, 5–7 FAQ entries from real queries, sources linked, dated checked line.
- [ ] Every fact traced to a primary source; anything surprising re-opened by hand.
- [ ] Title ≤ 60 chars (≈ 30 CJK), term first; description ~150 chars; one H1.
- [ ] ≥ 3 contextual links out; ≥ 3 existing pages edited to link in.
- [ ] CTA heading, label and target match the topic.
- [ ] Local render: 200, title, canonical, hreflang, JSON-LD types, unknown slug 404, no broken internal links.
- [ ] Type-check, lint and build pass; committed; handed to the deploy owner.

## Pitfalls we hit
- **Titles cut off.** An audit found 49 English titles of 57–88 characters. All were rewritten term-first under 60,
  with the brand suffix dropped where it didn't fit.
- **Title promised more than the body.** A comparison page's title named two products the body never discussed.
  Cover them or take them out of the title.
- **Agents misread pages.** A research subagent reported that a vendor's site never mentioned its acquisition;
  re-opening the announcement and changelog showed it did. Another fetch returned a pricing page that looked swapped
  out; a real browser confirmed it was real. Surprising claims get checked by hand, in both directions.
- **Media vs docs.** Press said a launch was only on two plans; the official page listed a third. A launch story said
  an agent "fixes bugs without asking"; its docs said the default mode only observes. We wrote what the docs said and
  used the gap as an FAQ answer.
- **Stale official blog.** A year-old vendor blog still showed a shortcut the current docs had removed. Use the docs.
- **Orphan page.** A new guide sat at "URL is unknown to Google" until the homepage and footer linked to it.
- **Three pages, one keyword.** Three URLs competed for "ai employee". We split them: one owns "what is", another owns
  "best platforms / hire", and they link to each other.
- **Generic CTAs.** Every post ended in "Get started", and an audit flagged it. The fix is a topic CTA that links to
  the matching role or feature page.
- **Wrong render.** A local check picked up another session's uncommitted edits in the shared folder. We now render
  HEAD plus our own files in a scratch worktree.
- **Head terms on a new domain.** Ten evergreen tutorials on head terms (hooks, MCP, plan mode, X vs Y) didn't reach
  page one on a new domain. We switched to long tails where the current results are weak (small sites, GitHub repos).

## Related skills
- **keyword-research**, **trend-keywords**: choose the keyword before this skill starts.
- **competitor-pages**: vs and alternatives pages, which add rules for claims about competitors.
- **programmatic-pages**: when the same page shape repeats across many items.
- **multilingual-seo**: translating the finished page.
- **index-push**: IndexNow, Search Console and Bing submission after deploy.
- **ai-search**: llms.txt and making pages quotable by LLMs.
- **seo-daily-report**: logging what shipped and what moved.
