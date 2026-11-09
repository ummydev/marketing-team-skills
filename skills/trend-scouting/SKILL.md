---
name: trend-scouting
description: When the user wants to find short videos and posts that are going viral in their niche right now, on Xiaohongshu (RedNote), X, TikTok or Instagram, and keep a topic pool to remake or react to. Covers search keywords, freshness and like thresholds, reading numbers off the page without scraping, picking one topic a day, and logging candidates. Use when the user says "find viral videos", "what's trending", "找爆款", "选题", "topic pool", "content ideas for TikTok", "what should we post today", "competitor videos", or "find the top videos about X".
---

# Trend scouting

Every day, find the posts in your niche that are taking off right now, log them with their numbers, and pick the
one to remake. Two kinds of gap make this work: **time** (a tool launched three days ago that English TikTok hasn't
covered yet) and **language** (a Xiaohongshu hit that nobody has brought to English). The topic pool also
tells you which hooks and formats your audience rewards.

Inputs: a browser signed in by a person, `ugc/trends/log.md` (past candidates), `ugc/trends/sources.md` (creators
worth checking), `ugc/trends/stats.md` (what did well for you).

**Browsing rule.** One page at a time, at a human pace; read what the page shows. Running one short script in the
page you already have open to read its cards is fine; firing requests at other URLs from it is not. Stop at the
first block or captcha (see account-warmup). The whole session, warm-up included, stays under an hour.

## Workflow

### 1. Check what worked for you
Read the last week of `stats.md`. If "fun website" posts beat "AI tool" posts last week, lean toward those today.

### 2. Xiaohongshu (RedNote)
Search with the default sort; the "most liked" and "past week" filters are unreliable. Rotate 5–8 keywords a day:

> AI新闻 · AI工具 · 开源项目 · github · claude code · codex · skill · agent · 黑科技 · 效率神器 · 宝藏网站 · 独立游戏 · vibe coding · Mac技巧

Read every card on the results page at once in the browser console:
```js
[...document.querySelectorAll('section.note-item')].map(s => ({
  video: !!s.querySelector('.play-icon, [class*=play]'),
  text: s.innerText.split('\n').map(x => x.trim()).filter(Boolean).join(' | ')
}))
```
Selectors change; if it returns nothing, read the page text instead.

Threshold: posted in the last 3 days with 1,000+ likes, or in the last day with 500+. Prefer posts with more saves
than likes ("useful" content) and video posts.

### 3. X
Skip it if the browser isn't signed in, and ask the person to sign in. Advanced search, with the date set to
three days ago:
```
(AI OR "Claude Code" OR Codex OR "open source" OR launch) filter:native_video min_faves:1000 since:2026-11-05
"just launched" OR "introducing" min_faves:500 filter:native_video since:2026-11-05
```
Then glance at Explore → Trending / News. Threshold: 1,000+ likes or 100k+ views in 3 days.

### 4. TikTok and Instagram (competitors and your own niche)
Search the product or topic name (for example a competitor's name) and open the top results **one at a time**.
Read views, likes and comments off each post page; on Instagram, reel pages show plays. Note who posted
(official account or a third-party creator), the hook (first line on screen), the format (skill:
short-video-formats) and the call to action at the end.

What we found doing this for an AI-agent product: the official accounts barely got views; all the reach came
from third-party creators with hooks like "0 employees, a whole company run by AI agents" and an ending like
"Comment PAPERCLIP and I'll send you the setup guide". Some of those posts had more comments than likes.

### 5. Log and pick
Write every candidate into today's section of `log.md` before choosing:
```markdown
## 2026-11-07
- ✅ "把苹果手表变成AI录音笔", 君潇AI掘金, Xiaohongshu, 1 day ago, 906 likes, video. https://… Apple Watch as an AI voice recorder; works in English.
- "全平台通用！一招让agent节省80%token", 3 days ago, 127 likes. Rejected: below threshold.
- Second: … Third: …
```
Search `log.md` first; skip anything done or rejected before.

Pick in this order:
1. New and useful to an English audience: a new AI product or feature, a new open-source tool or skill, tech
   news, a fun website or game, a practical hack.
2. You can make every shot yourself: the site, tool or product can be screen-recorded or rebuilt, so the remake
   doesn't depend on the creator's footage.
3. It fits in 40 seconds or can be cut to.
4. Not yet widespread in English. Skip products only usable in one country unless the story itself is universal.
5. Not the same topic as anything you posted in the last 7 days.

News must trace back to an official source (company blog, official account, GitHub, release notes). Drop rumors
and leaks. No politics, medical or investment content.

## Checklist
- [ ] Last week's stats read before choosing
- [ ] Each platform searched with rotated keywords, one page at a time
- [ ] Candidates logged with link, author, age, likes/saves and one line on what it is
- [ ] Past log searched; nothing repeated
- [ ] Facts traced to an official source
- [ ] First, second and third picks named

## Pitfalls we hit
- **A parallel fetch loop got TikTok blocked.** We wanted view counts for 25 competitor videos and fetched them
  all at once. "Access Denied" within seconds. Read numbers off each page instead, slowly, and take fewer posts.
- **An Instagram internal API call timed out** after 45 seconds and looked like a failure; the data had arrived
  anyway. Even so, we stopped calling internal APIs on signed-in accounts; the page shows enough.
- **Filters returned old posts.** Xiaohongshu's "past week" filter mixed in posts from months ago. Always read the
  date on the card.
- **Official accounts are the wrong benchmark.** For a competitor, the viral videos were all by independent
  creators. Search the topic, not just the brand's account.
- **Candidates nobody wrote down** got re-evaluated the next day. Log rejected ones too, with the reason.

## Related skills
- **account-warmup**: the same browsing session, and the caps on likes and follows.
- **viral-remake**: turning the pick into your video.
- **short-video-formats**: naming the format of each candidate.
- **video-retro**: the stats that steer the pick.
