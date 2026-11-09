# Marketing Team Skills

**Made by [Crewmark AI](https://crewmark.ai/?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills): the skills our own AI marketing team runs every day.**
Most marketing skills teach your agent marketing. These give it a marketing job: runnable steps, scripts and the
mistakes we made along the way.

```bash
npx skills add ummydev/marketing-team-skills
```

Works with Claude Code, Codex, Cursor and any agent that reads [Agent Skills](https://agentskills.io) (`SKILL.md`).
See every skill and our guides to the best Claude skills by job at
[crewmark.ai/skills](https://crewmark.ai/skills?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills).

## What's inside

v0.2 covers two jobs our AI employees do every working day: on-site SEO for crewmark.ai, and short videos for our
TikTok and Instagram accounts. Off-site SEO and social outreach are next.

### SEO

| Skill | What it does |
| --- | --- |
| [trend-keywords](skills/trend-keywords/) | Spot terms people just started searching (launches, shutdowns, acquisitions) and ship a page the same day |
| [keyword-research](skills/keyword-research/) | Pick keywords a new site can rank for: brand + modifier, tool + use, alternatives; keep a keyword map |
| [seo-page](skills/seo-page/) | Write one page for one keyword: definition first, steps, table, FAQ, sources, a title that fits |
| [competitor-pages](skills/competitor-pages/) | Alternatives and vs pages from each product's own docs and the GitHub API |
| [programmatic-pages](skills/programmatic-pages/) | Templated pages at scale (role libraries, agent × use case) without thin content |
| [multilingual-seo](skills/multilingual-seo/) | Ship every page in several languages with parallel subagents and hreflang |
| [index-push](skills/index-push/) | Get pages crawled: IndexNow, Search Console, Bing, sitemaps, and what each status means |
| [ai-search](skills/ai-search/) | Be quotable by ChatGPT, Claude and Perplexity: llms.txt, definitions, pricing as text, brand data |
| [seo-daily-report](skills/seo-daily-report/) | The end-of-day report: traffic, the gap to the goal, what shipped, what's queued |

### UGC short video

| Skill | What it does |
| --- | --- |
| [account-warmup](skills/account-warmup/) | Grow a new TikTok / Instagram account without getting it flagged: daily caps, cadence, browsing like a person |
| [trend-scouting](skills/trend-scouting/) | Find what is going viral in your niche on Xiaohongshu, X, TikTok and Instagram, and keep a topic pool |
| [viral-remake](skills/viral-remake/) | Remake a viral video's structure, hook and pacing with your own footage, credit the inspiration, add a link card |
| [short-video-formats](skills/short-video-formats/) | The four formats that carry software promo videos, layout rules, hooks, CTAs and an AI presenter |
| [remotion-video](skills/remotion-video/) | A product video in code: real UI rebuilt in React, a voice-driven timeline, camera zooms |
| [social-publish](skills/social-publish/) | Captions per platform, pinned comment, AI labels, posting time, and the upload steps |
| [video-retro](skills/video-retro/) | Read the numbers without scraping, log them, and decide what to change tomorrow |

Scripts the skills call:

- [`scripts/autocomplete.mjs`](scripts/autocomplete.mjs): Google autocomplete for many seeds and modifiers, politely paced, to prove a keyword has demand.
- [`scripts/indexnow.mjs`](scripts/indexnow.mjs): submit paths or a whole sitemap to IndexNow (Bing, Yandex and others).

## Roles

A role brief turns the skills into a job: who the agent is, its goal, what it does each day in which order, and
what it must ask a person first. Copy it into the repository the agent works in.

| Role | Brief |
| --- | --- |
| SEO specialist | [`roles/seo-specialist/CLAUDE.md`](roles/seo-specialist/CLAUDE.md) (Claude Code) or [`AGENTS.md`](roles/seo-specialist/AGENTS.md) (Codex) |
| UGC short-video creator | [`roles/ugc-creator/CLAUDE.md`](roles/ugc-creator/CLAUDE.md) (Claude Code) or [`AGENTS.md`](roles/ugc-creator/AGENTS.md) (Codex) |

**Skills vs roles.** A skill is a manual for one task, loaded only when the agent needs it. A role brief is read
at the start of every session and says which skill to use at each step of the day.

## Install

```bash
# All skills, into the agents you have installed
npx skills add ummydev/marketing-team-skills

# Just some of them
npx skills add ummydev/marketing-team-skills --skill trend-keywords index-push

# From inside a Claude Code session, name the agent so it lands in .claude/skills
npx skills add ummydev/marketing-team-skills -a claude-code
```

Or as a Claude Code plugin:

```
/plugin marketplace add ummydev/marketing-team-skills
/plugin install marketing-team-skills
```

Or copy a folder from `skills/` into `.claude/skills/` (Claude Code) or `.agents/skills/` (Codex and others).

## Run it every day

Skills do a task when asked. To have an agent do the job without being prompted, give it a schedule: `/loop` or
scheduled tasks in Claude Code, cron with `codex exec`, or run it as an AI employee on
[Crewmark AI](https://crewmark.ai/ai-employees/seo-specialist?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills),
which wakes Claude Code or Codex on a heartbeat during working hours, gives it the next issue from a board and
messages you when it needs a decision. Crewmark's own SEO and short videos are run that way, with these skills.

## Related

- [ummydev/ai-employee-roles](https://github.com/ummydev/ai-employee-roles): role briefs for six AI employees (SEO, marketing, social, engineering, UI, app design).
- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills): a broad library of marketing know-how skills (CRO, copywriting, ads and more). Ours is narrower and operational; they work well together.
- Comparisons of other skills worth installing, from each project's repo: [best Claude skills for SEO](https://crewmark.ai/skills/seo?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills), [for website and UI design](https://crewmark.ai/skills/website-design?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills) and [for mobile apps](https://crewmark.ai/skills/mobile-app-design?utm_source=github&utm_medium=readme&utm_campaign=marketing-team-skills).

## Contributing

Issues and pull requests are welcome, especially pitfalls you hit running these skills. Keep each `SKILL.md`
practical: steps you ran, commands that work, and what went wrong.

## License

MIT
