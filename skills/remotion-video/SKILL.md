---
name: remotion-video
description: When the user wants to make a vertical promo video of their own software product in code with Remotion, rebuilding the product's real UI instead of screen-recording it, with a TTS voice-over, captions timed to the voice and camera moves that zoom into details. Use when the user says "Remotion", "make a product video", "faceless demo video", "UI motion video", "programmatic video", "product reel", "animate our UI", "render the video", or wants a TikTok or Reels video about their app that an agent can re-render after every change.
---

# Product video in Remotion

A faceless product demo (format 3 in short-video-formats) built as code. The voice drives the timing: each
script line is spoken, the takes are laid end to end, and the video's scenes and captions follow those
timestamps. The UI is rebuilt in React from the product's own styles, so it is sharp at any zoom and re-renders
when the product or the script changes. Everything except the rendered MP4 lives in git, so any old version
is a checkout and a render away.

Inputs: Node 22, ffmpeg, a TTS (`edge-tts` for drafts; a licensed voice before publishing), the product's CSS
tokens and markup (a landing page's product demo is often the best source), and the script.

## Workflow

### 1. Set up
```bash
npx create-video@latest --blank reel && cd reel && npm i @remotion/google-fonts
```
Keep one `theme.ts` with the frame (1080×1920, 30 fps), the layout bands and the product's color tokens copied
from its CSS. Our bands: title strip centred at y=118, the white UI band from y=220 for 1250 px (65% of the
height, full width), captions centred at y=1640.

### 2. Write the script as data
`script.json`, one entry per caption line; `*stars*` mark the highlighted words:
```json
{ "voice": { "name": "en-US-AndrewMultilingualNeural", "rate": "+10%" }, "gap": 0.16,
  "lines": [
    { "scene": "wall", "text": "I stopped *prompting* Claude Code." },
    { "scene": "wall", "text": "I *hired* it.", "pause": 0.5 },
    { "scene": "end", "text": "Hire your first *AI employee*.", "say": "Crewmark. Hire your first AI employee." }
  ],
  "post": { "tiktok": { "caption": "…", "hashtags": [] }, "instagram": { "caption": "…", "hashtags": [] } } }
```
`say` is for when the voice differs from the caption; `pause` holds a scene longer after a line.

### 3. Voice → timeline
A small Node script speaks each line to its own WAV, trims the silence, lays them end to end with `gap`/`pause`
between them, mixes them into `public/voice.wav` (`adelay` + `amix`, then `loudnorm=I=-14` for social loudness),
and writes `public/timeline.json` with each line's `from`/`to` in frames:
```json
{ "durationInFrames": 959, "lines": [ { "scene": "wall", "text": "I stopped *prompting* Claude Code.", "from": 12, "to": 51 } ] }
```
Cache each take by its text and voice so editing one line doesn't re-speak the rest. The composition's
`durationInFrames` comes from this file.

### 4. Scenes follow the timeline
Group consecutive lines with the same `scene` into one `<Sequence>`; give each scene its line offsets ("beats") so
animations land on the words. Captions are one component reading the current line.

The key piece is a camera over the UI band: lay the UI out in real CSS pixels, then scale and pan it.
```tsx
export function Cam({ zoom, x = 0, y = 0, children }: { zoom: number; x?: number; y?: number; children: React.ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#fff" }}>
      <div style={{ position: "absolute", width: 1080 / zoom + x, height: STAGE_H / zoom + y,
        transform: `scale(${zoom}) translate(${-x}px, ${-y}px)`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
}
```
At `zoom = 1080 / 520` a 520-px-wide layout (two 248-px cards) fills the width exactly. Animate `zoom`, `x` and
`y` with eased interpolation between beats to push in on the button being clicked.

Scene ideas that read well: a marketplace of cards, a form filling itself in (typed text with a caret), a board
where a card moves columns, an activity thread, a chart drawing itself (labelled "Demo data"), a chat where the
agent asks and you approve, an end card in the landing hero's style.

### 5. Render and look at it
```bash
node voice.mjs && npx tsc --noEmit
npx remotion still src/index.ts Reel /tmp/f0.png --frame=0          # the cover
npx remotion render src/index.ts Reel out/reel.mp4
ffmpeg -v error -y -i out/reel.mp4 -vf fps=1,scale=200:-1,tile=8x5 -frames:v 1 out/sheet.jpg
```
Look at the contact sheet and at a still from each scene: the UI band full, nothing cut off at the bottom of the
band, captions inside the bottom strip, the right scene under each line, frame 0 not blank.

### 6. Version it
Commit the source, script and `voice.wav`/`timeline.json`; keep `out/` and downloads in `.gitignore`. To bring
back an old cut, check out its commit and render again.

## Checklist
- [ ] Colors, fonts and copy taken from the product's own CSS and text
- [ ] UI band ≥ 50% of the height, full width; strips only above and below
- [ ] Frame 0 rendered and checked as the cover
- [ ] Every scene shows a feature the product really has
- [ ] Demo numbers labelled
- [ ] Contact sheet reviewed after every render
- [ ] Source and voice committed; MP4 not

## Pitfalls we hit
- **Fade-in on the first scene** left frame 0, the cover, blank. Skip the enter animation for the first scene.
- **Content cut off by the camera.** A chart sized for one zoom level ran past the bottom of the band at the
  scene's zoom. Check a still at the end of each camera move, not just the start.
- **Sparse lower halves.** At low zoom, short scenes left the bottom of the white band empty. Zoom in further
  or anchor something to the bottom (a message input, a footer) so the band looks like a real screen.
- **A review script that needed an .srt.** Our old ffmpeg pipeline's review tool read subtitle timings that
  Remotion doesn't write. A contact sheet with `fps=1,tile` does the same job.
- **Duplicate `transform` in one style object** (a press animation plus an enter animation) fails type-checking.
  Wrap the element and put one transform on each layer.
- **Edge TTS for the final cut.** It's free and fine for drafts, but robotic next to anything human-looking, and
  it comes with no commercial licence. Swap the TTS function before publishing at scale.

## Related skills
- **short-video-formats**: layout rules and which format to build.
- **social-publish**: the post copy kept in `script.json`.
- **video-retro**: what to change in the next render.
