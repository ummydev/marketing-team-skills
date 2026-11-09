---
name: viral-remake
description: When the user wants to remake a viral short video for their own account or product, for example bringing a Xiaohongshu or X hit to English TikTok and Instagram, or rebuilding a competitor's viral format around their own product. Covers studying the original (layout, hook, pacing, captions, sound), rebuilding it with your own footage, translating the idea naturally, asking the creator before using any of their footage, adding a link card, crediting the inspiration, and checking the render. Use when the user says "remake this video", "复刻爆款", "do a video like this one", "copy this format", "translate this video idea to English", or shares a link to a viral video.
---

# Viral remake

A video that went viral once has a proven hook, structure and pace. A remake keeps the structure, the hook, the
rhythm and the idea, and makes everything you see and hear yourself: your own screen recordings, your own
product UI, your own filming or animation. What you copy is the recipe, not the footage.

Two reasons this matters. Copyright: reusing someone's footage needs their permission, and a credit line is not
permission. Platforms: TikTok and Instagram demote reposted and watermark-stripped content, and a copyright
claim can remove the post and put a strike on the account.

The other common mistake is forcing every idea into one house template. Remakes work when they follow their own
original's layout: a full-screen clip with captions over it stays full-screen, a dark card layout stays a dark
card layout.

Inputs: the source post (from trend-scouting), `ffmpeg`, `yt-dlp`, a speech-to-text tool (`whisper-cli`), a TTS
voice, and your render pipeline (skill: remotion-video, or plain ffmpeg).

## Workflow

### 1. Study the original
Keep a local copy for reference only, to step through frame by frame. It never goes into your render.
- X, YouTube, TikTok and most sites: `yt-dlp -o "build/<id>/ref/%(id)s.%(ext)s" "<post url>"`.
- Xiaohongshu: open the note in the signed-in browser and read the stream URL from the page state,
  `window.__INITIAL_STATE__.note.noteDetailMap[<first key>].note.video.media.stream.h264[0].masterUrl`, then
  `curl -sL -A "Mozilla/5.0" -e "https://www.xiaohongshu.com/" "<url>" -o build/<id>/ref/source.mp4`.

One video, one download. Don't batch-download a creator's feed.

Contact sheet, one frame a second, and a transcript:
```bash
mkdir -p build/<id>/f && ffmpeg -i build/<id>/ref/source.mp4 -vf fps=1,scale=240:-1 build/<id>/f/%02d.jpg
ffmpeg -i build/<id>/f/%02d.jpg -vf tile=8x4 -frames:v 1 build/<id>/sheet.jpg
ffmpeg -i build/<id>/ref/source.mp4 -ar 16000 -ac 1 build/<id>/a.wav
whisper-cli -m ~/.cache/whisper/ggml-small.bin -l zh -f build/<id>/a.wav -np   # -l en for English sources
```
Write down, before writing anything new:
- **Layout:** full-screen vertical, or footage in a box on a solid background (which color), where the
  captions sit, how big, which word is highlighted.
- **Hook:** the first line and the first frame. This is most of the result.
- **Beats:** each sentence and the kind of shot under it, with timings.
- **Sound:** voice-over or not, music, ambient sound.
- **Ending:** the call to action ("comment X", "follow for part 2", a link card).

### 2. Gather your own footage
For each beat, decide what you will show instead:
- **The thing itself:** if the video is about a website, app or open-source tool, record it yourself (screen
  recording of the site, the tool running on your machine, its README scrolling).
- **Your product:** rebuild your product's real UI in the same layout and animate it (skill: remotion-video).
- **Footage only the creator has** (their filming, their edit): skip the idea, or ask them first (step 3).
- **Official material** from the product's maker (press kit, demo video, README GIFs) only where its licence or
  terms allow reuse; check before you use it.

### 3. If you want the original footage, ask first
Message the creator, say what you want to make and where it will be posted, and wait for a clear yes in writing.
With permission: keep their watermark and username visible, credit them in the caption, and don't crop or cover
their marks. Without a yes, don't use it.

### 4. Write the script
- Rewrite the idea in natural spoken English, beat for beat. Keep the hook's mechanism and the ending; swap
  culture-specific references for ones your audience gets.
- Keep the original's order and pace. Don't add an intro.
- Add one **link card** where the name first appears or at the end: the project name plus its URL or GitHub
  path, on screen, because links in TikTok captions aren't clickable.
- Record in the script: the inspiration post URL, the creator's name, and where each shot of yours came from
  (and the permission, if you used theirs).

### 5. Build it
- Lay your own shots on the original's timeline and layout; put the captions where the original had them.
- Voice: if the original had one, use a TTS voice of the same gender at +8% to +12% speed; if it had none,
  don't add one. Use your own or licensed music and sound.

### 6. Check, then caption
Render, then look at a frame from the middle of every caption line: the right shot under each sentence, no black
frames, captions not cut off, and nothing of the original's footage in the render unless you have permission.
Check that the first frame is a real picture, since it becomes the cover.

Post copy (skill: social-publish): your caption, your link, and the credit "inspired by <name>'s video on
Xiaohongshu" (or "video by <name>, used with permission"), in plain text, never as an @handle.

## Checklist
- [ ] Original kept for reference only, downloaded once
- [ ] Layout, hook, beats, sound and ending written down before scripting
- [ ] Every shot is your own recording, your rebuilt UI, or licensed material
- [ ] Any footage of the creator's used only with their written permission, watermark and username kept
- [ ] Link card on screen
- [ ] Inspiration credited by name in the caption and in the script
- [ ] Every caption checked against its frame; first frame not blank

## Pitfalls we hit
- **Reusing the original's footage.** Our first remakes cut the original video into clips, cropped out the
  watermark and burned-in subtitles, and credited the creator in the caption. Reviewing this skill before
  publishing it, we stopped: a credit isn't permission, and the platforms push down reposted, watermark-stripped
  videos. Remakes now use our own recordings and rebuilt UI, and original footage only with the creator's yes.
- **One template for every remake** flattened what made the originals work. Our first remakes all used a white
  background with the footage near the top. The AI design-skill video only worked once it went back to the
  original's black background with edge-to-edge footage; the "fun website" video needed full-screen footage with
  captions in the lower third. Now each remake follows its own original's layout.
- **Adding an angle the original didn't have.** We gave a viral "online temple" website video an AI angle it
  never had and loosely rewrote its copy. The redo followed the original's idea closely and dropped the AI angle.
- **A weak first line.** The design-skill remake opened on a description of the tool; we re-cut it to open on the
  viewer's problem ("Sick of ugly AI-coded UIs?"), as the original did.
- **Auto-tagged strangers.** Crediting "@creator" in the caption linked an unrelated account on the other
  platform. Use the name in plain text.

## Related skills
- **trend-scouting**: where the source comes from.
- **short-video-formats**: naming the original's format and the rules for each.
- **remotion-video**: rebuilding real product UI in the original's layout.
- **social-publish**: caption, credit and upload.
