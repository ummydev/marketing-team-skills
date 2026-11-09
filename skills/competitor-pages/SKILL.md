---
name: competitor-pages
description: "When the user wants to write an alternatives page, a 'your product vs competitor' page or an 'X vs Y' comparison, or to react to a competitor's shutdown, acquisition or pricing change. Also use when the user mentions 'alternatives page,' 'X alternative,' 'X alternatives,' 'X vs Y,' 'us vs them,' 'comparison page,' 'comparison table,' 'competitor shut down,' 'competitor got acquired,' 'competitor raised prices,' 'switch from X,' 'migrate from X,' 'is our comparison page accurate,' or 'update the comparison.' For finding which competitor terms have demand, see keyword-research. For same-day shutdown and launch terms, see trend-keywords."
---

# Competitor Pages

Alternatives and vs pages reach people who are already choosing a tool. They work only if someone who uses the competitor can't find a wrong fact on them. This skill decides when to write one, gathers facts from each product's own sources, and makes the title, table and recommendation say the same thing.

## When to write one

- **A competitor shuts down, is acquired, or changes pricing.** Its users have to move. Write within days and update on each deadline. (Conductor announced it was joining Meta on Nov 4; the alternatives page shipped Nov 6.)
- **Autocomplete has "X alternative(s)" or "X vs Y" and neither vendor has a page.** Two fast-growing competitors had no vs or alternatives pages of their own while "paperclip vs hermes / openclaw / n8n", "multica vs linear" and "multica alternatives" all autocompleted.
- **Two big brands get compared.** "X vs Y" between two well-known tools, with your product as a third option at the end. Bing showed "hermes agent" at ~289k and "openclaw" at ~181k impressions over 3 months, so "hermes agent vs openclaw" was worth a page.

Skip it when the results are held by big review sites and long-running listicles. We dropped "lindy ai alternatives" for that reason. See keyword-research step 5.

## Pick the format

| Format | Searcher | Example title | URL |
|---|---|---|---|
| Plural: "X alternatives" | Leaving X, wants options | "Vibe Kanban Alternatives After the Shutdown" | `/blog/x-alternatives` |
| Singular: "X alternative" (you vs X) | Comparing you with X | "Paperclip AI Alternative: <You> vs Paperclip" | `/alternatives/x` |
| "X vs Y" (other products) | Choosing between other tools | "Hermes Agent vs OpenClaw vs Claude Code (2026)" | `/blog/x-vs-y` |

The plural page compares 4–8 products, yours among them. The singular page compares exactly two: you and X. It also covers "<you> vs X". Don't title a two-product page "alternatives".

## Workflow

### 1. Confirm demand and the gap

```bash
node scripts/autocomplete.mjs "conductor alternative" "claude squad" "openclaw" \
  --modifiers "alternative,alternatives,vs,reddit,open source,for windows,shutdown"
```

Every "vs <name>" and "alternative for <platform>" suggestion is a candidate row or FAQ question. Then search the main term by hand: if the vendor already has a strong "alternatives" page, the plural version is harder, but "you vs X" may still be open.

### 2. Choose the products

- Plural pages: 4–8 products people mention in the autocomplete, Reddit threads and the vendor's own comparisons.
- Leave out projects that are archived, have had no release in about 12 months, or have been replaced (the README says "moved to" or "superseded by").
- Leave out anything you can't identify. If you can't find the product's site or repo, don't compare it.
- Leave out products whose basic facts you can't verify (no public pricing, site unreachable), or write "not published" for that cell.

### 3. Collect facts into one file per product

Only from the product's own README, site, docs, pricing page and changelog, plus the GitHub API. Reviews and news are for finding what to check.

```bash
R=smtg-ai/claude-squad
gh api repos/$R --jq '{stars: .stargazers_count, license: .license.spdx_id, archived, pushed_at, homepage}'
gh api repos/$R/releases/latest --jq '{tag: .tag_name, published: .published_at}'
# 404 = no releases: fall back to the newest tag and last commit
gh api repos/$R/tags --jq '.[0].name'; gh api repos/$R/commits --jq '.[0].commit.committer.date'
# Without gh (60 requests/hour): curl -s https://api.github.com/repos/$R
# Renamed or moved products: look for a redirect
curl -sI https://windsurf.com | grep -i '^location'
```

A license of `NOASSERTION` means GitHub couldn't detect it: read the LICENSE file. Keep the facts in a file the page reads from, so every page using them updates together:

```markdown
## Claude Squad (checked 2026-11-08)
- What it is: terminal app, one tmux session and git worktree per agent (README)
- Agents: Claude Code, Codex, Gemini, Aider and other local agents (README)
- Needs: tmux, gh (README prerequisites)
- License: AGPL-3.0 · Stars: 8.7k · Latest release: v1.0.20, 2026-08-20 (GitHub API)
- Pricing: free, open source
- Source: https://github.com/smtg-ai/claude-squad
```

### 4. Write the page in this order

1. **Opening paragraph**: what X is and, for a shutdown or acquisition, what happened with exact dates from the announcement.
2. **Checked line** directly under it: "Checked November 7, 2026 against each project's README, releases and site."
3. **What to do now** (shutdown pages only): how to export data and keep working, with commands.
4. **Comparison table**: one row per product, same columns for all (what it is, agents or integrations, platforms, pricing, license, status). Every cell traceable to the facts file. Unknown is "not published", never a guess and never "free".
5. **Short section per product**: what it's good at and where it falls short, in its own documented terms.
6. **Which one fits you**: "If you need …, pick …" bullets. At least one bullet should point away from your product.
7. **Your product**: what it does differently, and its limits in plain words (which integrations it lacks, what it needs installed, what costs money).
8. **FAQ** from the autocomplete long tails ("X alternative for windows", "X vs Y reddit"), then a sources list.

### 5. Write the title and meta last

Every product named in the title or meta description needs a row in the table and its own section. Plural in the title only if the page compares several products. Year in the title only if you'll update it.

### 6. Publish and keep it current

Register the main keyword in `keywords.md`, publish, run index-push. Put the next check in your calendar: each announced deadline (read-only date, shutdown date), each competitor release, and at least monthly. Update the checked line every time.

## Pre-publish checklist

- [ ] Format matches the title: plural lists several products, singular compares two
- [ ] Every product in the title and meta has a table row and a section
- [ ] Every fact traces to the product's own source or the GitHub API; stars, license and release dated
- [ ] Checked line with date and sources near the top
- [ ] No archived, superseded or unidentifiable products; renames and redirects checked
- [ ] Unknown values say "not published"; nothing estimated
- [ ] Self-claims attributed ("NanoClaw says…")
- [ ] "Which one fits you" includes cases where a competitor is the better choice
- [ ] Your product's limits stated; only integrations that exist today
- [ ] Recheck dates noted

## Pitfalls we hit

- **The title promised comparisons the body didn't make.** Our page "Paperclip AI Alternatives: <us> vs Paperclip, Hermes and OpenClaw" only compared two products. An audit flagged it as misleading. We cut it to "Paperclip AI Alternative: <us> vs Paperclip" to match the body.
- **Renamed between research and publishing.** windsurf.com redirected to devin.ai/desktop (now Devin Desktop), Superset became Paradev, Airtable's Superagent became Hyperagent (superagent.com redirects), Claude Flow became Ruflo, Claudia became opcode, and Crystal was replaced by Nimbalyst. Check redirects and the README header for every product.
- **Dead projects in a list.** For a Cursor alternatives page we left out Roo Code (repository archived), Aider (no release since August 2025) and Gemini CLI for individuals (its README sends them to another CLI). One API call per repo catches this.
- **A comparison we couldn't verify.** Autocomplete suggested "claude squad vs herder"; we couldn't identify a project called Herder, so the page doesn't mention it.
- **Dates the vendor didn't give.** Vibe Kanban's shutdown post said remote services would stay up "30 days" with no calendar date, so the page says 30 days rather than computing a date. Conductor's deal amount wasn't public; the page doesn't guess. Products with no public pricing get "not published".
- **"Not published" isn't "free".** Before our own pricing was public, our table said "not published". Writing "free" would have become a false claim on the day prices launched.
- **Status wording went stale.** Our tables and buttons said "early access". When sign-up opened, 294 files across nine languages had to change. Keep volatile facts (status, price, version) in one data file and use button text that doesn't describe status ("Get started").
- **Competitors' own claims.** NanoClaw compares its code size with OpenClaw's. That's its claim; the page attributes it instead of stating it as fact.
- **A surprising fact that was true.** A research subagent fetched Cursor's pricing page and reported it looked replaced (plans tied to X membership, Grok-only base tier). We opened it in a real browser before writing, and it was real. Check surprising facts at the source yourself, either way.
- **Comparing integrations you don't have.** Rows for agents your product doesn't support should say so. Pages about another agent can cover what that agent does, not imply your product works with it.

## Related skills

- **keyword-research**: find "alternative" and "vs" terms with demand and a weak results page
- **trend-keywords**: catch shutdowns and acquisitions the day they're announced
- **seo-page**: title length, headings, FAQ and schema for the finished page
- **programmatic-pages**: when you need one alternatives page per competitor from shared data
- **multilingual-seo**: translating comparison pages without breaking the facts
- **index-push**: get the page and each update recrawled
- **ai-search**: comparison tables and dated facts that AI answers can cite
