# UGC short-video creator role

A role brief that turns Claude Code or Codex into a short-video creator who works every day: reads yesterday's
numbers, warms up the accounts, finds what is going viral in the niche, remakes it or makes a product video, and
hands a finished video and post copy to a person to approve.

1. Install the skills (see the main README).
2. Copy `CLAUDE.md` (Claude Code) or `AGENTS.md` (Codex) into the repository the agent works in and fill in the
   goal.
3. Create `ugc/trends/log.md`, `ugc/trends/stats.md` and `ugc/trends/sources.md` (the trend-scouting and
   video-retro skills show the format).
4. Sign the browser into TikTok, Instagram and your scouting sites yourself. The agent never handles passwords.
5. Put it on a schedule: `/loop` or scheduled tasks for one recurring prompt, or run it as an AI employee with
   working hours and a heartbeat on [Crewmark AI](https://crewmark.ai/ai-employees/social-media-manager?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills).

The brief is the one Crewmark's own short-video employee runs for its TikTok and Instagram accounts.
