# Invest Buddy

Interactive, animated lessons that take you from the basics to confident investing. Static site — no build step.
Sibling project to **AI-Hub**, reusing its architecture (curriculum-first authoring, dark/light/neon themes, animated
labs, notes) rebuilt for investment education.

**Live:** all 12 paths, and **every module on the site is a full deep pass** — rich worked examples, extended labs,
no basic-pass content left. Investment Fundamentals has 5 modules / 33 lessons; the other 11 paths each have one
"Foundations" module / 5 lessons.

**General education only — nothing on this site is investment advice** or a recommendation to buy, sell or hold any
specific security. Market data shown in dashboard widgets is sample/illustrative, not a live feed.

## Run locally
```
python -m http.server 8000   # then open http://localhost:8000
```

## Deploy on GitHub Pages
Deployment is automatic: `.github/workflows/pages.yml` publishes on every push to `main`.

## Structure
- `index.html`, `investment-fundamentals.html` — home and the Investment Fundamentals hub page
- `investment-fundamentals-<module>.html` — one page per module (0–4)
- `curriculum/investment-fundamentals.md` — source of truth for every lesson's scope
- `assets/topics.js` — path registry (sidebar, search, home cards) and pipeline stage definitions
- `assets/lib.js` — expression parser, canvas/plot helpers, `IB.loop`/`IB.ticker`
- `assets/labs-*.js` — interactive labs, mounted by `<div data-lab="name">`
- `assets/shell.js` — header, topbar, sidebar, outline, search, progress, theme, notes/flashcards/summary
- `.claude/skills/` — project skills for planning curricula, writing lessons, building labs, launching new paths, and verifying the site

## Adding a path
See `.claude/skills/add-topic/SKILL.md` and `curriculum/AUTHORING.md`.
