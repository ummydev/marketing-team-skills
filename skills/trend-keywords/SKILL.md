---
name: trend-keywords
description: "When the user wants to catch search terms that are only now appearing because of a release or news event (a new AI tool, a model launch, a shutdown, an acquisition, a feature going GA) and publish a page on it the same day. Also use when the user mentions 'trending keywords,' 'newsjacking for SEO,' 'what should we write about today,' 'daily trend page,' 'hot topic page,' 'X just launched,' 'X is shutting down,' 'X got acquired,' 'X alternative after the shutdown,' 'rising queries,' 'Google Trends breakout,' or 'same-day SEO.' For evergreen keyword picks, see keyword-research. For the alternatives page itself, see competitor-pages."
---

# Trend Keywords

A launch, shutdown or acquisition creates search terms nobody has written a proper page for yet. For a few days the results are forum threads, GitHub repos and the vendor's own post, so a small site can rank. This skill finds those terms, confirms demand and a weak results page, and ships one page the same day.

## Workflow

### 1. Collect 3–6 candidates from the last 1–3 days

Spend about 20 minutes. For each candidate note the event, its date and a link to the primary source.

| Source | Look for | How |
|---|---|---|
| Vendor changelogs and blogs | GA releases, new products, renames, sunset notices, pricing changes | Keep a `sources.md` of changelog/blog URLs for your niche and read the newest entries. For open-source tools: `gh release list -R owner/repo -L 5` |
| GitHub | New repos gaining stars fast | One search call (below), or open `github.com/trending?since=daily` |
| Hacker News | Launches and shutdowns with 100+ points | One Algolia call (below) |
| X | "We're launching", "we're joining X", "shutting down" | In your own browser, a few searches, one page at a time. Never script it |
| Tech news | Acquisitions, shutdowns, model launches | Headlines from the last 3 days in your niche's outlets and newsletters |

```bash
# New repos in your niche: replace "agent" with your niche's word (macOS date; on Linux: date -d '7 days ago' +%F)
gh api "search/repositories?q=agent+in:name,description+created:>$(date -v-7d +%F)+stars:>200&sort=stars&order=desc&per_page=15" \
  --jq '.items[] | "\(.stargazers_count)\t\(.full_name)\t\(.description // "" | .[0:70])"'

# HN stories from the last 2 days with 100+ points (add --data-urlencode "query=agent" to filter)
curl -s -G "https://hn.algolia.com/api/v1/search" --data-urlencode "tags=story" \
  --data-urlencode "numericFilters=created_at_i>$(date -v-2d +%s),points>100" --data-urlencode "hitsPerPage=30" \
  | jq -r '.hits[] | "\(.points)\t\(.title)\t\(.url)"'
```

Without a niche keyword the GitHub search is mostly spam repos. Social sites (X, Reddit, TikTok and the like): browse at a human pace in your signed-in browser, never fire scripted or parallel requests. If a site rate-limits you, stop and don't retry that day.

Events that reliably create queries:
- Launch of a named product or model: "<name>", "<name> github / pricing / how to use / vs <incumbent>"
- Shutdown, sunset, acquisition: "<name> alternative(s)", "<name> shutdown", "<name> <acquirer>"
- Integration going GA: "<tool> <platform>", "<tool> in <platform>", "<tool> <platform> integration"
- Rename: the old name keeps getting searched, plus "<new name>"

### 2. Check demand with autocomplete

`scripts/autocomplete.mjs` is at the root of this repo (Node 18+, no dependencies; usage in keyword-research).

```bash
node scripts/autocomplete.mjs "conductor alternative" "github copilot slack" "deepseek harness" \
  --modifiers "github,pricing,reddit,how to use,vs,alternative,shutdown,windows"
```

- Seed self-completes with 5+ long tails: real demand. The long tails become H2s and FAQ questions.
- Seed doesn't self-complete and modifiers return nothing: no demand yet. Drop it, or recheck tomorrow if the event is hours old.
- Suggestions are about something else with the same name: add a qualifier ("conductor ai", "conductor claude code").

Autocomplete shows that people search a term, not how many. Step 3 sizes it.

### 3. Compare candidates in Google Trends

Open one comparison of up to 5 terms in a browser:
`https://trends.google.com/trends/explore?date=now%207-d&q=deepseek%20harness,superagent,super%20agent`

- `date=now 1-d` or `now 7-d` for this week's news; `today 1-m` to see whether it is still climbing.
- Put the buzzword everyone is using next to the specific product names. The specific name often wins.
- Read Related queries → Rising. A "Breakout" query there is often tomorrow's page.
- Trends is relative. Keep one anchor term in every comparison if you want to compare across sessions.

### 4. Check that the results page is weak

Search the top 2–3 variants in a normal browser, one query at a time, and sort the top 10:

| Weak: you can get in | Strong: skip or go longer |
|---|---|
| Reddit, HN, forum threads | The vendor's docs page answering the exact query |
| GitHub repos and issues | Major news sites with the exact term in the title |
| Small blogs, Medium posts | Big review sites with a dedicated, current page |
| Vendor listicles that rank themselves first | Several established sites with complete, fresh pages |

Write it when at least 4 of the top 10 are weak and no result fully answers the query. If the head variant is taken, a long tail from step 2 ("<x> alternative for windows") may still be open.

### 5. Pick one and choose the page type

Rank candidates by: long tails, Trends interest, results-page weakness, closeness to your product, and whether the facts are settled. Pick one per workday. Log each rejected candidate in one line with the reason, so tomorrow you don't evaluate it again.

| Event | Page |
|---|---|
| Launch or model release | What it is, how to get it, published pricing and limits, how it compares to the incumbent, FAQ from long tails |
| Shutdown or acquisition | "<name> alternatives": what happened with dates, how to keep your data, comparison table (see competitor-pages) |
| Integration GA | How-to: setup steps, what it can and can't do, links to the official docs |

### 6. Write from primary sources, same day

- Facts only from the vendor's announcement, changelog, docs, README and the GitHub API. News articles are for finding the story; check every claim against the primary source.
- When the media and the official page disagree, follow the official page and say so in the FAQ.
- Near the top: "Checked <date> against <sources>."
- Anything unpublished (price, deal amount, shutdown date, billing) is "not announced". Never estimate it.
- Exact term in the title, H1, slug and first paragraph. Long tails map to H2s and FAQ questions.
- Link to the new page from 2+ related pages and from your blog index or footer.

### 7. Ship and get it indexed today

Add the term to `keywords.md` (see keyword-research), publish, then run index-push: IndexNow, GSC "Request indexing" for the main language versions, Bing URL submission. Pages we requested in GSC were indexed in about a day. Log the date, term, URL, sources and rejected candidates.

### 8. Follow up

- After 3–7 days: GSC → Performance → filter by the page. Add FAQ entries for queries the page doesn't answer.
- If the event has later dates (cloud goes read-only, final shutdown, waitlist opens), update the page that day and change the checked date.

## Pre-publish checklist

- [ ] Seed or main variant self-completes; at least 5 long tails collected
- [ ] Trends comparison done against the other candidates and the buzzword
- [ ] At least 4 of the top 10 results are weak
- [ ] Every fact traced to a primary source; checked date on the page
- [ ] Unpublished facts written as "not announced"
- [ ] Exact term in title (under 60 characters), H1, slug, first paragraph
- [ ] Linked from 2+ existing pages; added to `keywords.md`
- [ ] Index requests sent; log entry written, rejected candidates included

## Pitfalls we hit

- **The buzzword wasn't the biggest term.** After DeepSeek open-sourced its super-agent, everyone said "superagent" and we shipped a superagent overview first. Trends then showed "deepseek harness" averaging about 30× "superagent" (6× "super agent") over 30 days and still rising. We wrote that page next, and its Rising queries ("deepseek v4.1 flash 1017") gave us one more. Compare in Trends before writing.
- **Shutdown demand lasts for months.** Vibe Kanban's company shut down in April 2026. In November "vibe kanban alternative" still self-completed, with "reddit", "shutdown" and "open source" variants, and the results were small sites and vendor pages. Check older shutdowns too, not only this week's.
- **Acquisitions come with deadlines.** Conductor announced it was joining Meta on Nov 4: signups closed, cloud read-only Nov 13, shutdown Nov 20. Autocomplete already had "conductor alternative claude code", "... for windows / linux", "... reddit". The alternatives page shipped two days later from the announcement, changelog and docs. The deal amount wasn't public, so the page doesn't give one.
- **Pick the candidate with the most long tails.** On the day GitHub Copilot in Slack went GA we had five candidates; it had the most autocomplete variants (integration, bot, app, mcp, coding agent slack). GitHub's docs didn't cover billing, so the page says that instead of guessing.
- **No long tails, no page.** Android Studio's "bring your own agent" came up as a candidate three days in a row and had almost no autocomplete long tails each time. Once a candidate is rejected for that, leave it off the list unless something new happens.
- **Not new, unrelated, or still moving.** Microsoft Agent 365 looked like news but launched in 2025. Security incidents trending on HN had facts still changing and little to do with the product. Skip both.
- **The media got it wrong.** Coverage said DeepSeek's agent fixes bugs without asking; its docs say the default mode only observes and logs. Coverage said Claude Duet was limited to two plans; the official page listed a third. We followed the official pages, and the difference made a good FAQ entry.
- **A waitlist keeps a term alive.** Claude Duet was two weeks old but still waitlist-only, so "how to get access" searches were still growing. The 1–3 day window is a default, not a rule.
- **Research subagents are sometimes wrong.** One reported that Conductor's site didn't mention Meta; the announcement page did. Another fetched a pricing page that looked tampered with, and it turned out to be real. Check any claim that changes the page against the source yourself.
- **Index requests failing silently.** GSC "Request indexing" showed no confirmation for days because the browser's default Google account had no access to the property. Use the owning account and wait for the "Indexing requested" dialog. The daily quota is about 10 URLs, so request the trend page first.

## Related skills

- **keyword-research**: evergreen terms and the `keywords.md` map this skill writes into
- **competitor-pages**: page structure and fact rules for shutdown and acquisition pages
- **seo-page**: title, meta, headings, FAQ and schema for the page itself
- **index-push**: IndexNow, GSC and Bing submission right after publishing
- **multilingual-seo**: which languages to ship a trend page in on day one
- **ai-search**: making the page quotable in AI answers, where news questions often land
- **seo-daily-report**: record the day's pick, rejected candidates and results
