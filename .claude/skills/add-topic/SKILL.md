---
name: add-topic
description: Launch a new Invest-Hub path (Economics, Financial Markets, Asset Classes, Fundamental Analysis, Technical Analysis, Behavioral Finance, Investment Strategies, Portfolio Management, Risk & Derivatives, Global & Current Events, Quant Investing, or deepening Investment Fundamentals) end-to-end - curriculum, registry, hub page, module pages, labs.
---

# Add or upgrade a path

Order of work (the same path Investment Fundamentals followed):

1. **Plan** — skill `plan-curriculum` → `curriculum/<path>.md` + generated data file. Confirm scope (and basic vs. deep depth) with the user.
2. **Registry** — edit `assets/topics.js`: set the path's `status: 'live'`, `href`, `curriculum`, `tags`, `next`, and a `PIPELINES.<id>` entry (6 stages matching the Understand → Analyze → Strategy → Build → Manage → Grow shape, made concrete for the path). Keep the global path order (see `CLAUDE.md`) — do not reorder without being asked.
3. **Hub page** `<path>.html` — copy `investment-fundamentals.html`: hero, how-to-learn, map (path bar + pipeline lab), module cards.
4. **Module pages** `<path>-<module>.html` with `<body data-topic="<id>" data-module="N">`.
5. **Author lessons** — skill `write-deep-lesson` (parallelise per module). Labs via skill `add-lab`; reuse the shared labs first.
6. **Verify** — skill `verify-site`; check sidebar order, progress counts, search results, prev/next navigation, mobile width.
7. **Ship** — only when the user asks: commit, push to `main` (Pages workflow deploys automatically).

## Checklist
- [ ] path order unchanged except for the new path going live
- [ ] hub shows module cards and % progress; sidebar tree expands for the current module
- [ ] search finds lessons
- [ ] `CLAUDE.md` "where things stand" updated
