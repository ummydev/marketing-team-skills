---
name: account-warmup
description: When the user wants to warm up or grow a new short-video account on TikTok, Instagram Reels, YouTube Shorts or Xiaohongshu without getting it rate-limited, shadow-banned or banned. Covers the cold start, daily browsing and engagement caps, posting cadence, profile setup, and what to do when a platform blocks you. Use when the user says "warm up the account", "new TikTok account", "养号", "cold start", "why is my account getting no views", "shadowban", "rate limited", "Access Denied", "how often should I post", or before any agent browses a signed-in social site.
---

# Account warm-up

A new account has no history, so the platform doesn't know whom to show its videos to. Warm-up teaches it: the
account watches and likes posts in its niche the way a real person would, posts on a steady schedule, and never
does anything that looks like a bot. The second job of this skill is protecting the account. An agent with a
browser can do in seconds what gets an account flagged, and one bad afternoon can cost months of history.

Inputs: a browser signed in by a person (Claude in Chrome or similar, using the person's real profile), the
niche keywords, and `ugc/trends/log.md` for the day's tally.

## The rule that matters most

**Browse like a person, never scrape.** On any site where the person is signed in, and on social sites above all:
- Open one page at a time and wait several seconds between pages. Read what the page already shows.
- No `fetch` loops over post or video pages, no `Promise.all` over URLs, no calling the site's internal API in a
  loop, no rapid page-after-page crawling.
- If numbers you need aren't on the page you're on, open the post itself. For many posts, take fewer of them
  rather than speeding up.
- If a site shows "Access Denied", a captcha, "Try again later" or empty results that used to load, **stop
  using that site for the day**, tell the person, and don't retry without asking.

Pass this rule on, word for word, to any subagent you hand a browsing task.

## Workflow

### 1. Profile first (once, done by the person)
The person sets the name, bio, avatar and link; the agent may draft them. A profile that says what the account
posts ("Claude Code and AI agent tricks, daily") converts the visits a video brings. Put the website in the bio:
TikTok captions can't hold clickable links, and Instagram captions never can.

### 2. Daily browsing session (under 1 hour, in one go)
Record the start time (`date`) and check it as you go. Then, on each platform:
1. Scroll the For You / home feed for a few screens. Open posts that are in the niche (AI, dev tools, startups,
   whatever yours is) and watch at least 10 seconds of a video before acting. Scroll past everything off-niche
   without opening it.
2. Like the best of them, **at most 10 likes per platform per day**, with a few seconds between actions.
3. Follow creators who post good niche content consistently, **at most 3 follows per platform per day**. Log
   them in `ugc/trends/sources.md`.
4. Don't comment, save, repost or DM during warm-up unless the person asked for it. Brand comments are the
   person's call.

Scouting for the day's video (skill: trend-scouting) happens in the same session and counts toward the hour.

### 3. Posting cadence
- New account: 1 video a day for the first two weeks, at roughly the same time. Consistency matters more than
  volume; three videos one day and none for four days reads as abandoned.
- Post when your audience is awake. For an English-speaking developer audience, Tuesday to Thursday around
  09:00 US Pacific (noon Eastern) is a good default; weekends are weaker for work tools.
- Upload the original MP4 natively to each platform. Never upload a file downloaded from another platform with
  its watermark; both TikTok and Instagram push those down.
- Turn on the platform's AI-generated content label whenever the video shows an AI-generated person or voice.

### 4. Log it
Append to today's section of `ugc/trends/log.md`:
```markdown
- Warm-up: 38 min. Xiaohongshu 7 likes, 1 follow. X skipped (not signed in). TikTok 5 likes.
```

### 5. When reach collapses
If several videos in a row stay near zero views:
- Check the platform's own account status page (TikTok Studio → account status; Instagram → Settings → Account
  status) for violations, and report what it says.
- Look at what changed: a burst of automated activity, a reposted watermarked video, a link in the caption, a
  copyrighted song.
- Keep posting on schedule. Don't delete and re-upload the same video; duplicates get suppressed.

## Checklist
- [ ] Session under 1 hour, start time noted
- [ ] Likes ≤ 10 and follows ≤ 3 per platform
- [ ] Only niche posts opened; videos watched 10 s+ before liking
- [ ] No scripted requests against any signed-in site
- [ ] Any block or captcha reported, and the site left alone for the day
- [ ] Today's tally in log.md

## Pitfalls we hit
- **"Access Denied" on TikTok from 25 parallel fetches.** To collect view counts we fetched about 25 video pages
  in parallel with the account signed in. Akamai blocked the browser within seconds. Since then: one page at a
  time, read the number off the page, and stop at the first block.
- **Xiaohongshu search filters lie.** "Most liked" and "past week" returned nothing, or mixed in posts from months
  ago. We use the default sort and read the date and like count off each card.
- **X wasn't signed in.** The agent can't sign in, so it skips X and asks the person instead of trying.
- **Instagram's upload crop defaults to 1:1**, which cuts the top and bottom off a 9:16 video, where the title
  and captions sit. Pick "Original" in the crop step every time.
- **@handles in captions** got auto-linked to unrelated accounts. Credit people by name in plain text.

## Related skills
- **trend-scouting**: the scouting half of the daily session.
- **social-publish**: posting times, captions and the per-platform upload steps.
- **video-retro**: reading the numbers that tell you whether warm-up is working.
