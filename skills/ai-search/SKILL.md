---
name: ai-search
description: When the user wants to make a site readable, accurate and quotable for AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot, Google AI Overviews) so they describe the product correctly and cite it. Use when the user says "llms.txt", "llms-full.txt", "AI search", "GEO", "AEO", "get cited by ChatGPT", "show up in Perplexity answers", "allow AI crawlers", "GPTBot in robots.txt", "AI gets our pricing wrong", "AI confuses us with another product", "brand name collision", "Organization schema sameAs" or "make the site agent-readable". Covers llms.txt, robots.txt for AI crawlers, definition sentences, comparison tables and FAQ, public pricing, Organization and WebSite structured data, and brand naming.
---

# AI search

An assistant answering "what is X", "X pricing" or "best tool for Y" fetches a handful of pages, lifts sentences and table rows, and cites them. If a fact isn't on the page as plain text, the assistant guesses, or quotes whoever did write it down. The job: make the product easy to describe correctly from a single fetch.

One principle runs through every step: **write each fact once and render it everywhere.** The definition, status (beta, open for sign-up, generally available), pricing, supported platforms and key URLs live in one source file; pages, llms.txt and structured data read from it. Facts copied by hand drift apart.

## Workflow

### 1. Write the fact sheet
Create `content/facts.ts` (or JSON/YAML) with: name and alternate names, the one-sentence definition, who it's for, status, plans and prices, platforms or integrations, key page URLs, and official profiles (GitHub, X, LinkedIn, Product Hunt). Check each item against the live product before writing it.

### 2. Publish /llms.txt
Follow llmstxt.org: an H1 with the name, a blockquote summary, a few plain facts, then H2 sections of links written `- [Title](url): what it covers`. A section titled `Optional` marks links an assistant can skip.

```markdown
# Acme AI

> Acme AI is an invoice-matching tool that reconciles Stripe payouts with bank deposits for small finance teams. It runs in the browser and connects to Stripe and Plaid.

- Who it's for: finance leads at companies with 1–50 people who reconcile payouts by hand.
- Status: open for sign-up (since 2026-11).
- Pricing (https://acme.example/pricing): Free, $0, up to 50 invoices a month; Pro, $29/month, unlimited invoices; Team, $79/month, up to 10 seats. Prices in USD.
- Not to be confused with: Acme Anvil, an unrelated hardware company.

## Key pages
- [Pricing](https://acme.example/pricing): plans, limits and what's included.
- [Acme AI vs Rival](https://acme.example/vs/rival): feature and price comparison, checked 2026-11-06.

## FAQ
- Is Acme AI free? Yes, up to 50 invoices a month. Pro and Team are paid.

## Optional
- [Blog](https://acme.example/blog): product updates and guides.
```

Generate it from the fact sheet and page metadata (a route handler or build script) so a new page appears without hand edits. Serve it with status 200, as `text/plain` or `text/markdown; charset=utf-8`, with no login, redirect or JavaScript. Check:
```bash
curl -sI https://acme.example/llms.txt | head -5        # 200 and a text content type
curl -s  https://acme.example/llms.txt | head -30
```

### 3. Optionally add /llms-full.txt
The full Markdown text of the pages you most want quoted (product, pricing, comparisons, docs), each under its own `# Title` with a `Source: <url>` line. Generate at build time. Leave out the blog archive and anything stale.

### 4. Link to it
Put a plain `llms.txt` link in the footer, and optionally `<link rel="alternate" type="text/markdown" href="/llms.txt">` in `<head>`. A file nothing links to is found only by crawlers that guess the path.

### 5. Let AI crawlers in (robots.txt and the CDN)
| User-agent | Owner | Used for |
|---|---|---|
| OAI-SearchBot | OpenAI | ChatGPT search index |
| ChatGPT-User | OpenAI | Fetching a page a user asked about |
| GPTBot | OpenAI | Model training |
| Claude-SearchBot / Claude-User / ClaudeBot | Anthropic | Search index / user fetches / training |
| PerplexityBot / Perplexity-User | Perplexity | Search index / user fetches |
| Google-Extended | Google | Token for Gemini training and grounding; doesn't affect Google Search or AI Overviews |
| Bingbot | Microsoft | Bing index, which Copilot answers from |

The search and user-fetch agents decide whether you can be cited. Training agents are a business choice; a product that wants to be recommended usually allows them too.

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /app/

User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: GPTBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
Allow: /
Disallow: /api/
Disallow: /app/

Sitemap: https://acme.example/sitemap.xml
```

A crawler obeys only the group that names it, so a named group must repeat every `Disallow`, or it opens your private paths. robots.txt also can't override the CDN: some offer a "block AI bots" switch that returns 403 whatever robots.txt says. Spot-check, then confirm real crawler hits in the CDN's bot report or server logs (CDNs that verify bot IPs may treat a spoofed User-Agent differently):
```bash
curl -s -o /dev/null -w '%{http_code}\n' -A 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)' https://acme.example/pricing
```

### 6. Put a one-sentence definition at the top of each key page
Right under the H1, in server-rendered HTML: "**<Name> is a <category> that <does what> for <whom>.**" The second sentence gives the differentiator. Reuse the same sentence on the home page, in llms.txt, in `Organization.description`, in directory listings and in social bios. A slogan ("Finance, reimagined") gives an assistant nothing to quote. Many AI fetchers don't run JavaScript, so check the raw HTML:
```bash
curl -s https://acme.example/ | grep -c "is an invoice-matching tool"     # expect 1 or more
```

### 7. Comparison tables and FAQ
- **Tables:** a real HTML `<table>`, one row per product, columns buyers ask about (price, platforms, open source, main limit). Date it ("Checked 2026-11-06"). Take each fact from the vendor's own site, docs, pricing page or the GitHub API. Write "Not published" when a vendor doesn't publish something; never estimate.
- **FAQ:** the question as a heading, in the searcher's words; an answer of 2–4 sentences that stands alone, with the first sentence answering it. Cover the questions assistants get wrong: price, "is it free", "does it work with X", "is it the same as <namesake>". FAQPage markup is optional; the visible Q&A is what gets quoted.

### 8. Make pricing public
A `/pricing` page with plan names, prices, currency, billing period and limits as text, not only in an image or calculator. Mirror it in llms.txt and in `SoftwareApplication.offers`. Answers and directory listings need a price or a pricing model (free, freemium, paid); without one they guess or skip you. If paid plans aren't live, say so ("Pro: coming soon; everything is free until then").
```json
{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Acme AI",
  "applicationCategory": "BusinessApplication", "operatingSystem": "Web",
  "offers": [ { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD" },
              { "@type": "Offer", "name": "Pro", "price": "29", "priceCurrency": "USD" } ] }
```

### 9. Organization and WebSite data when the name collides
If searching your bare brand name returns another product first, pick a distinct form ("Acme AI") and use it everywhere, with structured data that ties the variants to one entity:
```json
{ "@context": "https://schema.org", "@type": "Organization",
  "name": "Acme AI", "alternateName": ["Acme", "acme.example"],
  "url": "https://acme.example/", "logo": "https://acme.example/logo.png",
  "description": "Acme AI is an invoice-matching tool that reconciles Stripe payouts with bank deposits for small finance teams.",
  "sameAs": ["https://github.com/acme-ai", "https://x.com/acmeai", "https://www.linkedin.com/company/acme-ai"] }
```
Add a `WebSite` object with the same `name` and `alternateName`; Google uses it for the site name in results. List in `sameAs` only profiles you control that link back to the site.

### 10. Keep the brand suffix consistent
One suffix everywhere: `| Acme AI` in titles, the same string in `og:site_name`, the llms.txt H1, social bios and the GitHub org. Keep titles within 60 characters (about 30 for Chinese, Japanese and Korean), keyword first; add the suffix only when it fits.

### 11. Check what assistants actually say
Monthly, and after big changes, ask 5–10 prompts by hand in ChatGPT (search on), Perplexity, Claude, Gemini and Copilot: "What is Acme AI?", "Acme AI pricing", "best <category> for <audience>", "<competitor> alternatives", "Acme AI vs <competitor>". One prompt at a time in the normal interface; don't script chat UIs. Log date, assistant, prompt, whether you're mentioned, which URL is cited and any wrong fact in `docs/seo/ai-answers.md`. Fix the source page behind each wrong fact, then recheck. For traffic, segment analytics by referrer: chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com.

## Checklist
- [ ] Fact sheet exists; pages, llms.txt and JSON-LD read from it
- [ ] /llms.txt returns 200 as text, is generated, and is linked from the footer
- [ ] robots.txt allows the AI agents and repeats the disallows; CDN doesn't block them
- [ ] Each key page opens with a one-sentence definition in the raw HTML
- [ ] Comparison tables are dated and sourced; unknowns say "Not published"
- [ ] FAQ answers stand alone and cover price, "is it free" and name confusion
- [ ] /pricing is public; llms.txt and `offers` match it
- [ ] Organization and WebSite carry name, alternateName, description and sameAs
- [ ] One brand suffix everywhere; titles within 60 characters
- [ ] Assistant answers logged; wrong facts traced to a page and fixed

## Pitfalls we hit
- **No public pricing.** /pricing returned 404, llms.txt and `SoftwareApplication` had no offers, and our own comparison table had to say "Not published" for us. A /pricing page with three plans in text, mirrored into llms.txt and `offers`, fixed it; paid tiers are marked "coming soon".
- **Status drift.** After sign-ups opened, about 300 files across 9 languages, llms.txt included, still said "early access". Status now comes from one constant.
- **A file nobody links to.** An audit found no page linking to llms.txt, no llms-full.txt and no `lastmod` in the sitemap.
- **robots.txt group override.** Giving AI crawlers their own group without repeating the disallows would have opened the API and sign-in paths to them.
- **Brand collision.** Searching our bare brand name returned a same-named crew-scheduling app first. We switched to "<Name> AI" in titles, alternateName and sameAs.
- **Truncated, inconsistent titles.** 49 English titles were 57–88 characters with mixed suffixes. We cut them to 60 or less, keyword first, suffix only when it fits.
- **Unreliable fetches of competitor pages.** A research subagent's fetch of a competitor's pricing page returned something that looked tampered with; we confirmed it in a real browser before publishing. Another vendor's pricing page returned 403 to the fetcher, so we took the prices from their docs and said where they came from.
- **Writing "free" too early.** Until pricing was published we wrote "not published", not "free". An assistant repeats whatever the page says.

## Related skills
- **seo-page**: the page template where the definition, table and FAQ live.
- **competitor-pages**: comparison and alternatives pages, which assistants quote heavily.
- **programmatic-pages**: generating llms.txt sections and structured data at scale.
- **multilingual-seo**: localized definitions, titles and suffix length per language.
- **keyword-research**, **trend-keywords**: the questions to answer and the prompts to test.
- **index-push**: get the pages crawled; Bing's index feeds Copilot.
- **seo-daily-report**: AI-referred visits as their own line in the report.
