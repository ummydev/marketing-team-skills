---
name: short-video-formats
description: When the user wants to choose or plan the format of a promo short video for TikTok, Instagram Reels, YouTube Shorts or Xiaohongshu, especially for a software product, dev tool or AI agent. Covers the four formats that carry this category (talking head over a demo, phone filming the screen, faceless UI demo, talking-head open into full-screen demo), screen layout rules, hooks and endings like "comment X and I'll send it", and how to make an AI presenter. Use when the user says "what kind of video should we make", "video format", "talking head", "faceless video", "AI presenter", "AI avatar", "UGC style", "hook ideas", "how should the first frame look", "comment to get the link", or "视频形式".
---

# Short-video formats for software products

Before scripting anything, pick the format. We took apart the most-viewed TikTok and Instagram videos about two
open-source AI-agent products (Paperclip and Multica) in November 2026. Almost all the reach came from
independent creators, not the official accounts, and almost all of it used one of four formats.

## The four formats

| # | Format | What's on screen | Example (views) | Cost to make |
|---|---|---|---|---|
| 1 | **Talking head + demo on top** | Presenter in the bottom half, chest up, talking to camera; UI animation, GitHub page and site scroll in the top half | [@rahuliyer.ai](https://www.instagram.com/reel/DfJW6URh_rv/) (1.05M) | Needs a presenter (real or AI) |
| 2 | **Phone filming the screen** | A phone films the laptop screen; a finger points at the GitHub page while the creator talks and scrolls | [@making_in_time_](https://www.instagram.com/reel/DWhDQdSkiTV/) (115k) | Needs a person with a phone; an agent can't do it |
| 3 | **Faceless demo** | Product UI fills the frame with big captions, the occasional motion graphic | [@techwith.ram](https://www.instagram.com/reel/DWByPGViWRg/) (264k) | Lowest; fully automatable (skill: remotion-video) |
| 4 | **Talking-head open, then full-screen demo** | ~5 s of format 1 for the hook, then full-screen UI with zoom-ins on details, cutting back to the presenter mid-way and at the end | [@dr_cintas](https://www.tiktok.com/@dr_cintas/video/7651632167063260429) | Same presenter as format 1 |

An agent can make formats 3, 1 and 4 end to end. Start with 3, add a presenter for 1 and 4.

## Layout rules (9:16, 1080×1920)

- **The product UI gets at least half the frame height, edge to edge.** If your product has a light UI, that band
  is white. Thin cards floating on black look like a slideshow.
- **The first frame is the cover and the hook.** It can't be mostly black, and it can't be a fade-in from
  nothing. Show the UI from frame 0.
- **Keep the first screen sparse.** Two complete cards and the top of the next row, not a full dashboard. Hide
  sidebars and chrome that aren't the point. A wall of small text in the first second gets swiped away.
- **Black only for the strips:** a title or hook strip on top, captions in the strip below. Captions never sit
  over the middle of the UI.
- **Rebuild the real UI.** Same layout, fonts, colors, buttons and labels as the product. No simplified
  diagrams, and no features the product doesn't have. You don't need a screen recording; a rebuilt UI is
  sharper and can zoom (skill: remotion-video).
- **Label demo data** ("Demo data" in a chart corner). Never show invented results as real.

## Hooks and endings

- **Hooks that carried the category:** "0 employees. Full company." · "Someone just open sourced a tool that lets you
  run an entire company with AI agents" · "I stopped prompting Claude Code. I hired it." · "What if you could…".
- **Proof:** GitHub stars, a real number from the product, a before/after.
- **Ending:** "Comment <WORD> and I'll send you the setup guide." The word is the product name or a verb from the
  hook. These posts often had more comments than likes (one: 10,735 comments vs 5,395 likes), which feeds the
  algorithm. Only use it if someone (or an auto-DM tool connected through the platform's official API, like
  ManyChat on Instagram) actually sends the thing. A promised link that never arrives earns angry comments.
- Write for the viewer's words: "goal" rather than "KPI", "hire" rather than "configure".

## Making an AI presenter (formats 1 and 4)

1. **Face:** generate one fictional presenter with an image model. Prompt for a front-camera selfie video frame,
   9:16, top of the head to mid-chest, looking into the lens, mouth closed, nothing in front of the mouth,
   natural skin texture with no beauty filter, a lived-in home-office background. Make 4 candidates, pick one,
   and reuse that one face in every video so the account has a recognisable host. If the account has a mascot,
   base the presenter on it (same hair, clothes, colours).
2. **Voice:** one fixed voice for that presenter. Free browser TTS sounds robotic next to a realistic face; use a
   voice with a commercial licence (CapCut's built-in voices, ElevenLabs or similar). Render the whole script,
   then cut it per sentence.
3. **Lip-sync:** use an image + audio → talking video model (OmniHuman, Kling Avatar, Hedra, HeyGen Avatar) so
   your script and timing drive the mouth, not a text-to-video model that improvises its own lines. Generate in
   5–10 s segments and redo only the ones that fail.
4. **Assemble** in your video tool: format 1 puts the UI in the top ~55% and the presenter below, captions on the
   seam; format 4 opens full-screen on the presenter for 4–5 s.
5. **Disclose:** turn on TikTok's "AI-generated content" label and Instagram's AI info. The presenter is
   fictional; never have them claim personal experience ("I've used this for three months").

## Checklist
- [ ] Format chosen and named in the script
- [ ] UI band ≥ 50% of the height, full width
- [ ] First frame shows real UI, sparse, not black
- [ ] Only real features shown; demo data labelled
- [ ] Hook in the first line and the first frame
- [ ] Ending CTA you can actually fulfil
- [ ] AI presenter: one fixed face and voice, AI label on

## Pitfalls we hit
- **Diagram cards on black.** Our first product video showed simplified cards floating on a black background.
  It looked like slides and nothing like the product. The redo rebuilt the real UI on a white band filling two
  thirds of the frame.
- **A blank first frame.** Each scene faded in, so frame 0, which is the cover, was empty. The first scene
  now starts fully visible.
- **A dense first screen.** The opening showed the marketplace page with its sidebar and six cards. Too much text
  for the first second; cutting it to two full cards and a peek of the next row made it read at a glance.
- **A feature the product doesn't have.** The script ended on a "crew group chat" that only existed in the
  video. We swapped it for the product's real direct messages and rewrote the voice line.
- **Hair that read as fake.** The first AI presenter's huge curly hair gave it away. Ask for a recent, ordinary
  haircut with normal volume.

## Related skills
- **remotion-video**: building formats 1, 3 and 4.
- **viral-remake**: when the format comes from a specific viral original.
- **social-publish**: the caption, the CTA and the AI label at upload.
