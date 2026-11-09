---
name: social-publish
description: When the user wants to publish or schedule a short video on TikTok, Instagram Reels, YouTube Shorts or Xiaohongshu, or write the post copy for it. Covers per-platform captions, hashtags, crediting creators, the pinned comment, comment-to-DM calls to action, AI-content labels, posting times, the upload steps in the browser and logging the links. Use when the user says "post this video", "schedule the post", "write the caption", "TikTok caption", "Reels caption", "hashtags", "when should we post", "publish to TikTok and Instagram", "发布", or "pinned comment".
---

# Publish a short video

Publishing is the one step a person approves every time. The agent prepares everything (final MP4, a caption per
platform, hashtags, a pinned comment, a proposed time) and asks for a clear yes. After the yes it uploads in the
signed-in browser, at a human pace, and logs the links.

Inputs: the rendered MP4 (not a re-download from another platform), the script's `post` block, the browser signed
in by the person.

## Workflow

### 1. Write the copy
Per platform, kept in the script file next to the video:
- **TikTok:** short. The first line is the hook (often the video's first line), one line on what it is, the site
  name in plain text. 3–5 hashtags.
- **Instagram:** can be longer: the hook, 3–4 lines with "→" bullets on what it does, the site "(link in bio)", and
  a question to answer in the comments. 5–8 hashtags.
- **Credit** the original creator for remakes and third-party projects by name: "original video by <name> on
  Xiaohongshu", "by <name> on X". Never write @handles; they auto-link to whoever owns that handle on this
  platform.
- **No clickable links** exist in TikTok or Instagram captions for most accounts, so the URL also goes on screen
  (a link card) and in the bio.
- **Pinned comment:** a disclosure plus a question, e.g. "The chart is demo data, the screens are the real app.
  Which role would you hire first?" It answers the obvious challenge and starts the comment thread.
- **Comment-to-DM CTA** ("Comment HIRE and I'll send you the guide"): only if the thing will really be sent. On
  Instagram an auto-DM tool on Meta's official API (ManyChat and similar) can do it; on TikTok, reply by hand
  while volume is small. Never script DMs through the browser.

### 2. Pick the time
Default for an English-speaking work audience: Tuesday to Thursday, 09:00 US Pacific (noon Eastern). Early hours
decide distribution, so post when the audience is awake, and skip weekends for work tools. Post to both
platforms at the same time. If the person is in another timezone, schedule instead of staying up: both TikTok
(web, up to 10 days ahead) and Instagram support scheduled posts.

### 3. Ask
Send the person the MP4 and, in one message: the caption for each platform, the hashtags, the pinned comment, the
proposed time and whether an AI label applies. End with what reply means go. Wait for a clear yes; silence or a
comment on something else is not approval.

### 4. Upload (after the yes)
**TikTok:** `tiktok.com/tiktokstudio/upload` → upload the MP4 → paste the caption → cover: frame 0 or pick one →
under more options, turn on "AI-generated content" if the video shows an AI person or voice → Post, or Schedule
with the agreed time.

**Instagram:** Create → Post → upload the same MP4 → **crop: Original** (the default is 1:1 and cuts off the title
and captions) → caption → Advanced settings → AI label if it applies → Share, or schedule.

Then pin the comment on each post. One platform at a time, a few seconds between steps.

Browser uploads: Claude in Chrome's file upload handled files up to about 10 MB for us; keep reels under that
(our 20–40 s 1080×1920 H.264 reels come out at 2–7 MB) or upload through the platform's own picker by hand.

### 5. Log
Add the post links and the time to today's section of `ugc/trends/log.md`, and a row per post to `stats.md` so the
retro picks it up (skill: video-retro).

## Checklist
- [ ] Original render uploaded, not a download from another platform
- [ ] Caption per platform; hook first; site in plain text; 3–8 hashtags
- [ ] Creators credited by name, no @handles
- [ ] Link on screen and in bio
- [ ] Pinned comment drafted; CTA only if it will be fulfilled
- [ ] AI label on when an AI person or voice appears
- [ ] Clear yes from the person before posting
- [ ] Instagram crop set to Original
- [ ] Links logged in log.md and stats.md

## Pitfalls we hit
- **@handles in credits** linked unrelated accounts on the other platform. Names only.
- **Instagram's 1:1 default crop** would cut the title strip and captions off a 9:16 reel. Choose Original.
- **Weekend posting.** A product video was finished on a Saturday. We held it for Tuesday morning US time instead
  of posting into the weekend lull.
- **Bulk-reading stats after posting** is how we got TikTok's "Access Denied" (see account-warmup). Check each
  post's numbers by opening it, one at a time.

## Related skills
- **video-retro**: reading the numbers 24 and 72 hours later.
- **account-warmup**: posting cadence and account safety.
- **short-video-formats**: the hook and the ending CTA.
