---
name: programmatic-pages
description: When the user wants to build many pages from one template and a data set, one page per item, such as a role library, "<tool> × <use case>" pages, integration, glossary or directory pages. Also use when the user says "programmatic SEO", "pSEO", "template pages", "pages at scale", "one page per role/tool/integration", "role library", "agent pages", "<product> + <modifier> pages", "generate pages from data", "data-driven landing pages", "hub and spoke", or "why are my generated pages not indexed". For a single page, see seo-page; for translating the set, see multilingual-seo.
---

# Programmatic pages

A set of pages that share a template and differ by data: one per role, per agent × use case, per integration. They
rank when each row has its own search demand and its own facts. When the rows are one page with a noun swapped,
they don't get indexed and can drag the rest of the site down. Build a few, watch indexing, then add more.

## Two patterns we run
- **Role library**, `/ai-employees/<role>`: one page per job an AI agent can do ("ai seo specialist", "ai social
  media manager", "ai ui designer"). Sections: what the role does; a goals table (goal | how it's measured | a good
  first target); daily routine; a copyable `CLAUDE.md` / `AGENTS.md` role brief; tools and approvals it needs; setup
  steps; related guides; FAQ.
- **Agent × modifier**, e.g. `/<agent>-remote-control`, `/<agent>-scheduled-tasks`: one page per coding agent per
  job to be done. Sections: does the agent do this natively (yes/no, since which version, doc link); setup steps
  with exact commands; limits; workarounds and third-party tools; FAQ from that agent's own autocomplete.

## Workflow

### 1. Check demand for each row, not just the pattern
- Build a matrix: entities (every spelling people type) × modifiers. Check Google autocomplete for each cell and record
  the suggestions. Run lookups one after another with a pause between them, never as parallel bursts, and never point
  a loop at social sites or anything you're signed in to.
- Grade each cell: strong (many long tails), medium, weak (one suggestion), ambiguous (the name means something else).
- For the strongest ~20 cells, look at the top results. If the vendor has an official how-to, competition is high. If
  the results are small GitHub repos, forum threads or nothing that answers the query, build that page.
- Build only cells with demand. A modifier with no demand across most entities isn't a pattern, however well it
  fits your product.
- Each page says only what that entity can do. Don't imply your product supports an agent or tool it doesn't.
- Register every row in the keyword map, one main keyword per URL. Where an existing post covers the same ground,
  split the terms (post: "ai seo agent"; role page: "ai agent for seo", "ai seo specialist") and link both ways.

### 2. Write the data shape so every page needs its own content
Shared wording (section titles, CTA, disclaimer) goes in one template. The fields that make a page worth indexing are
required per item, so an empty or copied field shows up in review:

```ts
export type RoleData = {
  slug: string;                                     // URL segment
  name: string;                                     // as people search it: "AI SEO specialist"
  meta: { title: string; description: string };     // ≤ 60 chars, term first
  lead: string;                                     // opens with a one-sentence definition
  does: string[];                                   // duties specific to this role
  goals: [goal: string, measuredBy: string, firstTarget: string][];
  routine: string[];                                // its working day, in order
  brief: string;                                    // the role brief people copy
  tools: string; approvals: string;                 // access it needs; what it must ask a person first
  faq: { q: string; a: string }[];                  // from this role's own autocomplete
};
```

```
content/roles/
  template.ts               # shared wording
  build.ts                  # roleCopy(template, data) -> the page's full copy
  seo-specialist.ts         # one data file per item
  social-media-manager.ts
lib/roles.ts                # registry: slugs + locales only, small enough for middleware and sitemap to import
app/[locale]/ai-employees/[role]/page.tsx   # Next.js example; any static-generation route works
```

### 3. Fill each data file from real sources
- Facts per row come from that entity's own docs, README or changelog, with the date you checked. Leave out numbers
  that change daily (stars, prices you can't confirm).
- Anything readers copy (role brief, config, command) has to work. Run it once.
- If a row can't fill its required fields with facts specific to it, drop the row.
- Check how similar the rendered pages are (main content only):

```bash
BASE=http://localhost:3000
main_text() { curl -s "$1" | python3 -c 'import sys,re,html; s=sys.stdin.read(); m=re.search(r"(?s)<main\b.*?</main>",s); s=m.group(0) if m else s; print(" ".join(html.unescape(re.sub(r"<[^>]+>"," ",re.sub(r"(?s)<(script|style)\b.*?</\1>"," ",s))).split()))'; }
python3 - "$(main_text $BASE/ai-employees/seo-specialist)" "$(main_text $BASE/ai-employees/ui-designer)" <<'EOF'
import sys, difflib
a, b = (t.split() for t in sys.argv[1:3])
print(round(difflib.SequenceMatcher(None, a, b, autojunk=False).ratio(), 2))
EOF
```
Our role pages, each with its own goals, routine, brief and FAQ, score about 0.45 against each other. A page that only
swaps a noun scores above 0.9. Treat anything over ~0.7 as a near-duplicate: add row-specific content or merge rows.

### 4. Routing, sitemap, hreflang, 404
- Pre-render every slug in the registry (Next.js `generateStaticParams`, or your generator's equivalent).
- An unknown slug must return a real 404 status, in every locale, not a 200 "not found" page.
- Generate the sitemap, hreflang alternates (+ `x-default`) and the language switcher from the same registry, using
  each page's own locale list. Each page's canonical points to itself, never to the hub.
- Per row: title, description, `BreadcrumbList` (hub → item), `FAQPage`; an OG image if the template has one.

```bash
for s in seo-specialist marketing-agent social-media-manager; do for p in "" /zh; do
  u="$BASE$p/ai-employees/$s"
  echo "$(curl -s -o /dev/null -w '%{http_code}' "$u") $u $(curl -s "$u" | grep -o '<title>[^<]*</title>')"
done; done
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/ai-employees/nope"      # 404
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/zh/ai-employees/nope"   # 404
curl -s "$BASE/sitemap.xml" | grep -oE '<loc>[^<]*/ai-employees/[^<]+</loc>' | wc -l   # rows × locales
```

### 5. Link every page
- The hub lists every item with a one-line description, not just a name.
- Each item links to the hub (breadcrumb) and has ≥ 3 contextual links: 2–3 related items plus related guides.
- Posts on the same topic link to the item page, in every locale (e.g. the "AI SEO agent" post links to the SEO
  specialist role page).
- The hub is reachable from the nav or footer.

### 6. Launch 5–8 pages, watch, then add more
- First batch: the 5–8 rows with the strongest demand (we started with 6 roles). Multiply by locales before
  launching: 6 roles × 9 languages was already 54 URLs.
- After deploy: submit the URLs (index-push) and request indexing for the 2–3 strongest.
- Watch Search Console's Pages report for that URL group for 2–3 weeks. "Discovered – currently not indexed" on a new
  domain means Google hasn't spent crawl budget on the pages yet: link to them from indexed pages that get
  impressions, and don't add rows. "Crawled – currently not indexed" usually means Google judged them thin or
  duplicate: rework, merge or noindex them.
- Add rows only when most of the first batch is indexed and some get impressions.

### 7. Optional: reuse the data off-site
Generate a public repo (or download) from the same data files, e.g. every role brief as a `CLAUDE.md`, with a README
that links back to each page (`?utm_source=github`). Create it after the pages are live so its links don't 404.

## Pre-publish checklist
- [ ] Every row has demand of its own (autocomplete suggestions recorded) and a keyword-map entry.
- [ ] Required per-row fields filled with row-specific facts; similarity between rows under ~0.7.
- [ ] Copyable snippets tested; no claims of support the product doesn't have.
- [ ] Titles ≤ 60 chars (≈ 30 CJK), term first, unique per row.
- [ ] Every row × locale returns 200; unknown slugs return 404 in every locale.
- [ ] Sitemap, hreflang, x-default and canonical generated from the registry.
- [ ] Hub links every row; each row has ≥ 3 contextual links; related posts link in.
- [ ] First batch is 5–8 rows; a date is set to check indexing before adding more.

## Pitfalls we hit
- **Unknown slugs answered 200.** With on-demand rendering, the first visit to an unknown slug returned 200 before
  the page found out the item didn't exist. Fix: middleware checks the slug against the registry and rewrites unknown
  ones to a path no route matches, so every visit gets a plain 404.
- **Redirects to missing languages.** For a page that existed in only some locales, the browser-language redirect
  sent visitors to a locale that 404'd. Fix: if the page doesn't exist in that locale, serve the default language.
- **Too few links.** The first role pages had only 1–3 body links each, and an audit flagged them. The fix is links
  from posts on the same topic (the AI SEO agent post now links to the SEO specialist page in every language).
- **Thin matrix.** About 800 autocomplete lookups (22 agent spellings × 30 modifiers): two agents had 7–10 tails on
  nearly every modifier, five more were strong, two medium, eight had only "<agent> remote control", and three names
  were ambiguous (they also mean an unrelated tool or a model). The two modifiers that fit our product best had demand
  for three agents at most, so they stayed one-off pages instead of a pattern.
- **Template waiting on sign-off.** The new route counted as product code and needed the owner's OK. Meanwhile we
  shipped the strongest row as a normal post. When the role page came, we split the keywords between the two and
  linked them both ways.
- **Too many URLs too fast.** Templates plus translations took a new domain to 441 URLs in a week, about 392 of them
  translations, more than its authority got crawled. Count rows × locales before adding a pattern.

## Related skills
- **keyword-research**: the autocomplete matrix and the keyword map rows.
- **seo-page**: the rules each generated page still has to pass (definition first, FAQ, title, links).
- **competitor-pages**: "<product> alternative" and "X vs Y" sets.
- **multilingual-seo**: translating the set and deciding which locales to build.
- **index-push**: submitting the batch and requesting indexing.
- **ai-search**: listing the hub and rows in llms.txt.
- **seo-daily-report**: tracking indexed vs discovered counts for the URL group.
