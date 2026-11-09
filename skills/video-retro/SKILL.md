---
name: video-retro
description: When the user wants to review how their short videos performed on TikTok, Instagram Reels or other platforms and decide what to make next. Covers reading views, likes, comments, saves and follows without scraping, the stats log, 24-hour and 72-hour checks, comparing topics, formats and hooks, the daily report and recording what to change. Use when the user says "how did the video do", "video stats", "复盘", "retro", "which videos worked", "why did this flop", "weekly video report", "update the stats", or at the start or end of a short-video working day.
---

# Video retro

Numbers decide tomorrow's topic and format. Every day, read the last week's videos, write the numbers into one
file, and turn them into one or two concrete changes. The file matters more than any single reading: after two
weeks it tells you which topics, formats and hooks your audience actually rewards.

Inputs: TikTok Studio and the Instagram profile in the signed-in browser, `ugc/trends/stats.md`, `log.md`.

**Browsing rule.** Read the numbers the pages already show, one page at a time. Never loop over post URLs or the
platform's internal API to collect stats; that is exactly how we got TikTok's "Access Denied".

## Workflow

### 1. Collect
- **TikTok:** open `tiktok.com/tiktokstudio/content` and read the page text: views, likes and comments for each
  video. Open a single post's analytics for watch time, average percentage watched and traffic sources when a
  video stands out either way.
- **Instagram:** the profile's Reels tab shows plays on each tile. For likes, comments, saves and shares, open the
  reel (or its Insights) one at a time, only for the videos you're analysing today.
- Check new videos at about **24 hours** and again at **72 hours**; most short videos get most of their views in that
  window.

### 2. Log
Append one row per video per check to `stats.md`, never overwrite:
```markdown
| Checked | Video | Posted (local) | TikTok views | TikTok likes | TikTok comments | IG plays | Notes |
|---|---|---|---|---|---|---|---|
| 2026-11-07 | sansa-temple | 11-07 03:38 | 317 | 19 | 0 | 129 | best on TikTok; fun website + office-worker humor |
| 2026-11-07 | unslop | 11-07 14:10 | 108 | 0 | 0 | 151 | best on IG; a skill explainer, got saves and shares on IG |
```
Tag each video with its topic type (fun website, AI tool, news, own product) and format (skill:
short-video-formats) in the notes, so you can compare like with like.

### 3. Read it
- Compare videos of the same age only (a 2-hour-old video against a 2-day-old one tells you nothing).
- Look for the pattern across several videos, not the single outlier: which topic type, which format, which
  hook, which platform.
- Low views and good completion → the hook or cover failed to stop the scroll; rework the first second.
  Good views and low completion → the middle drags; cut it shorter.
  Comments ≫ likes → the CTA worked; keep it.
- On a young account everything is small. Say so, and don't report "+200%" from 3 to 9.

### 4. Decide and record
Write one or two changes into today's `log.md`, specific enough to act on tomorrow:
```markdown
- Retro: fun websites beat AI tools on TikTok 3:1; skill explainers do better on IG. Tomorrow: a fun-website remake for TikTok first.
- Retro: own-product videos ~100 views on both. Next one opens on a problem, not the product name; try the talking-head format.
```
Feed the visual lessons into short-video-formats (layout rules) and the topic lessons into trend-scouting.

### 5. Report
At the end of the day, one message to the person: videos posted, the latest numbers for the last 7 days against
the weekly goal, the change you're making, and anything waiting on them (approvals, sign-ins, decisions).

## Checklist
- [ ] Numbers read from the pages, one page at a time
- [ ] One row per video per check in stats.md, with topic and format tags
- [ ] 24 h and 72 h checks done for new videos
- [ ] Same-age comparisons only; small numbers called small
- [ ] One or two concrete changes in log.md
- [ ] Report sent with the gap to the weekly goal

## Pitfalls we hit
- **"Access Denied" from collecting stats in parallel.** Fetching 25 TikTok video pages at once got the signed-in
  browser blocked. Studio's content page already lists every video's numbers.
- **Comparing a 2-hour-old video with 2-day-old ones** made a new video look like a flop. Note the post time and
  compare at equal ages.
- **One platform's winner isn't the other's.** A fun-website clip did best on TikTok while an AI-skill explainer
  did best on Instagram, the same day. Track the platforms in separate columns.
- **Instagram's grid only shows plays.** Likes and comments need the post itself, so read them only for the
  videos you're actually analysing.

## Related skills
- **trend-scouting**: where the topic lessons go.
- **short-video-formats**: where the format and layout lessons go.
- **social-publish**: post times and links that the stats rows start from.
