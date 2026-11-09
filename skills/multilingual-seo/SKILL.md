---
name: multilingual-seo
description: When the user wants to publish pages in more than one language, decide which languages to add, or fix how translated pages are indexed. Also use when the user says "translate this page", "multilingual SEO", "international SEO", "localize the blog", "hreflang", "x-default", "Chinese version", "/zh/ pages", "Japanese / Korean version", "which languages should we support", "translated pages not indexed", "language switcher SEO", or "translate with subagents". For writing the English master, see seo-page; for templated page sets, see programmatic-pages.
---

# Multilingual SEO

Take a finished English page and ship it in other languages with the same structure, facts and links, at a URL
search engines can pair with the original. An agent can translate quickly. A new domain's crawl budget and authority
grow slowly, so choose languages by demand before translating everything.

## Pick the languages first
- **Chinese first.** Chinese results for tool + use-case queries often have far less competition than English. A
  sister site gets about half its search visits from `/zh/`. On our own new site, the zh-TW homepage had the
  second-most Search Console impressions of any URL in the first month.
- **Then Japanese and Korean**, then European languages, once data shows demand from them.
- **Don't spread thin.** We shipped every page in 9 languages. Within a week about 392 of 441 URLs were
  translations, more than a new domain's authority gets crawled. On a brand-new domain, start with en + zh and add a
  locale when Search Console shows impressions from it or you have users there.
- If the Pages report shows most translations as "Discovered – currently not indexed", publish new pages in en + zh
  only until that clears.
- zh-TW is its own locale (traditional characters and Taiwan usage, e.g. 軟體 not 软件), not a character conversion of zh.

## Workflow

### 1. Freeze the English master
Translate only after the master has passed the seo-page checklist: facts re-checked, links working, title final. A
fix after translation has to be made once per locale.

### 2. Write the translation brief
- **Glossary per locale, from files you already have.** Product terms, feature names and recurring words must match
  what earlier pages and the UI already say. Count which version is used most:
  `grep -rhoi 'pulsation\|battement' content/i18n/fr | sort | uniq -c`. If posts and the UI strings disagree, use the UI's word.
- **One fixed CTA label per locale.** Look it up rather than letting each translator choose:
  `grep -rho 'button: "[^"]*"' content/i18n/ja | sort | uniq -c | sort -rn | head -3`. Ours:

  | en | zh | zh-TW | ja | ko | es | pt-BR | fr | de |
  |---|---|---|---|---|---|---|---|---|
  | Get started | 开始使用 | 開始使用 | 今すぐ始める | 시작하기 | Empezar | Começar | Commencer | Loslegen |

  Topic-specific CTA headings are translated like any other sentence. Only the button label is fixed.
- **Title per locale:** search term first, written the way people search in that language (Chinese titles usually
  keep the English product name: `Claude Code 看板：…`), ≤ 60 characters with each full-width character counted as
  two (≈ 30 CJK characters), brand suffix only if it fits.
- **Formats:** copy what existing pages in that locale do for prices (French pages write `20 $`), dates and
  punctuation (full-width in CJK).
- **Never translate:** code blocks, commands, env vars, file names, hrefs, ids/anchors, product names, numbers.

### 3. Translate with parallel subagents
Run two subagents at the same time, four locales each. Each writes one file per locale, e.g.
`content/i18n/<locale>/<page>.ts` (or `.md`/`.json`), with the same export shape as the master.
- Group A: zh, zh-TW, ja, ko. These share CJK title widths, full-width punctuation and Han terms.
- Group B: es, pt-BR, fr, de.

Prompt for each subagent:
```text
Translate the finished English page <master path> into <zh, zh-TW, ja, ko>. Write one file per locale at
<content/i18n/LOCALE/page.ts> with the same shape as the master, and write no other file.
Keep identical: structure and field order, ids and anchors, hrefs, code blocks, commands, env vars, product
names, numbers, the number of table rows and columns. Translate prose, headings, table cells, FAQ, link text.
Before writing, read <two existing files in each locale> and reuse their terms (<glossary>).
Button label per locale: <table>. Title: <title rule>. Formats: <format notes>.
Don't add, drop or soften any fact. If a sentence can't be translated without changing a fact, keep the fact
and list it in your report. Report the files written and any term you weren't sure about.
```
The subagents only write files. You review the diff and commit with explicit paths.

### 4. Wire URLs, hreflang and sitemap
- Locale-prefixed URLs: `/zh/blog/x`, `/ja/blog/x`, and the default language either unprefixed or `/en/`. Pick one
  scheme and keep it.
- On every locale version: a canonical pointing to itself (never to English), an `hreflang` link for every locale the
  page exists in plus `x-default` → the default language, `<html lang>`, `og:locale`.
- Keep one list of locales per page. Generate hreflang, the sitemap and the language switcher from it, so no
  alternate points to a 404.
- Browser-language redirects: only from the root, only to a locale that exists for that page, and every locale URL
  must load directly without a redirect (crawlers don't send your visitors' Accept-Language).
- Give each locale its own internal links: the locale's hub, footer or "latest posts" list.

### 5. Check every locale
Render locally (Next.js example: `next build && next start`; any static build works):

```bash
BASE=http://localhost:3000; P=/blog/claude-code-kanban; LOCALES=(zh zh-tw ja ko es pt-br fr de)
for l in "${LOCALES[@]}"; do                       # status, lang, hreflang count, canonical, title width
  u="$BASE/$l$P"; h=$(curl -s "$u")
  printf '%s %-6s lang=%s hreflang=%s canonical=%s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$l" \
    "$(grep -oE '<html[^>]* lang="[^"]*"' <<<"$h" | sed -E 's/.*lang="([^"]*)".*/\1/')" \
    "$(grep -ioE '<link[^>]*hreflang="[^"]*"' <<<"$h" | wc -l | tr -d ' ')" \
    "$(grep -oE '<link rel="canonical" href="[^"]*"' <<<"$h" | cut -d'"' -f4)"
  sed -n 's:.*<title>\(.*\)</title>.*:\1:p' <<<"$h" | python3 -c 'import sys,html,unicodedata as u
t=html.unescape(sys.stdin.read().strip()); print("   title", sum(2 if u.east_asian_width(c) in "WF" else 1 for c in t), t)'
done
```

Leftover English and changed numbers, using the visible text without code:
```bash
text() { curl -s "$1" | python3 -c 'import sys,re,html; s=sys.stdin.read(); m=re.search(r"(?s)<main\b.*?</main>",s); s=m.group(0) if m else s; s=re.sub(r"(?s)<(script|style|pre|code)\b.*?</\1>"," ",s); print(" ".join(html.unescape(re.sub(r"<[^>]+>"," ",s)).split()))'; }
nums() { text "$1" | grep -oE '[0-9]+([.,][0-9]+)*' | sort | uniq -c; }
for l in "${LOCALES[@]}"; do
  echo "== $l: $(text "$BASE/$l$P" | grep -oiwE 'the|and|with|your|you|this|that|from|which' | wc -l | tr -d ' ') English words"
  diff <(nums "$BASE$P") <(nums "$BASE/$l$P")
done
```
English words should be 0. To find a hit, grep the text for `[^.]*\b(the|with|your)\b[^.]*`. In the number diff,
expect only date and number formatting (a Chinese date adds "11" for 11月; 1,000 becomes 1.000). Any other
difference means a fact changed.

Same structure (ids, internal links, h2 count, table rows, code blocks) in the main content:
```bash
python3 - "$BASE" "$P" "${LOCALES[@]}" <<'EOF'
import sys, re, urllib.request
def shape(url, loc):
    s = urllib.request.urlopen(url).read().decode()
    m = re.search(r'(?s)<main\b.*?</main>', s); s = m.group(0) if m else s
    if loc: s = re.sub(r'href="/' + re.escape(loc) + r'(?=[/"#?])', 'href="', s, flags=re.I)
    s = s.replace('href=""', 'href="/"')
    return {"ids": re.findall(r'\bid="([^"]+)"', s), "hrefs": sorted(set(re.findall(r'href="([^"]+)"', s))),
            "h2": len(re.findall(r'<h2\b', s)), "rows": len(re.findall(r'<tr\b', s)),
            "code": re.findall(r'(?s)<pre\b.*?</pre>', s)}
base, path, locs = sys.argv[1], sys.argv[2], sys.argv[3:]
en = shape(base + path, "")
for loc in locs:
    t = shape(f"{base}/{loc}{path}", loc)
    print(loc, ", ".join(k for k in en if en[k] != t[k]) or "OK")
EOF
```
Also run the type-check, lint and build, plus any key/placeholder parity check for UI string files (`messages/*.json`).

### 6. Hand off and submit
Commit only your own files and hand the commit to the deploy owner. After it's live, submit every locale URL
(index-push). Daily quotas run out quickly with 8 locales per page: Bing's URL submission allowed us 100 a day, and
Search Console manual indexing requests about 10 (sometimes fewer). Spend them on en and zh first and carry the rest
to the next day.

## Pre-publish checklist
- [ ] Locales chosen by demand; brand-new domain: en + zh unless data says otherwise.
- [ ] Master passed seo-page before translation.
- [ ] Glossary and the fixed button label taken from existing locale files.
- [ ] One file per locale; the structure check prints OK for every locale.
- [ ] 0 leftover English words; the number diff shows only formatting.
- [ ] Every title ≤ 60 width (CJK counts 2), term first, in that language's search wording.
- [ ] Every locale: 200, own canonical, `lang`, hreflang for existing locales + x-default.
- [ ] Sitemap and switcher list only locales that exist; unknown locale paths 404.
- [ ] Each locale page linked from its locale's hub or footer.

## Pitfalls we hit
- **One word, several translations.** "Heartbeat" was translated inconsistently across French posts. We switched to
  the UI strings' word (`pulsation`) and fixed 7 articles. Build the glossary before translating.
- **CTA text in every file.** When sign-up opened, "Get early access" (and its translations) had to be changed in 294
  files across 9 languages. Keep the button label as one fixed value per locale, ideally in a shared strings file.
- **Translated titles too long.** The audit flagged English titles of 57–88 characters, and the fix touched titles in
  all nine languages, not just English. Measure CJK titles by width, not by character count.
- **Locale URL unknown to Google.** `/zh/remote-claude-code` stayed "URL is unknown to Google" after the English page
  was indexed. Each locale needs its own internal links and its own submission.
- **Redirect to a missing locale.** For a page that existed only in some languages, the browser-language redirect sent
  visitors to a locale that 404'd. It now serves the default language.
- **Too many translations for a new domain.** 9 locales for every page meant about 392 of 441 URLs were
  translations within a week. New pages now ship en + zh first if translations aren't getting indexed.
- **Quotas.** Bing allowed 100 URLs a day. With 9 locales per post, the backlog rolled over to the next day again
  and again. Submit in priority order: en, zh, zh-TW, ja, ko, then the rest.

## Related skills
- **seo-page**: the master page and the rules each translation keeps.
- **programmatic-pages**: templated sets, where locales multiply the URL count.
- **keyword-research**, **trend-keywords**: checking demand in a locale before adding it.
- **index-push**: submitting locale URLs within daily quotas.
- **ai-search**: llms.txt and localized pages LLMs can cite.
- **seo-daily-report**: impressions and indexing by locale.
- **competitor-pages**: localized vs/alternatives pages.
