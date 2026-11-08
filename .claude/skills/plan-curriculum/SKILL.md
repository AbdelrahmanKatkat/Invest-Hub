---
name: plan-curriculum
description: Design a curriculum for an Invest-Hub path (modules, ordered lessons, what must be understood, real-world link, lab idea) and generate the site data file. Use before writing lesson content for a new or deepened path.
---

# Plan a curriculum (curriculum-first)

This is how Investment Fundamentals was planned. Do this **before** writing lessons.

## Steps
1. **Define the end state** in one sentence: what can a graduate of this path do?
2. **List the prerequisite chain**, cut it into modules ordered so every lesson only uses earlier ideas. Aim for 4–10 modules, 4–10 lessons each.
3. **For each lesson decide**: `id` (kebab-case, unique), title, *Must understand*, *Real-world link* (named instruments/indices/metrics, never vague), and a lab idea.
4. **Write `curriculum/<path>.md`** using the table format of `curriculum/investment-fundamentals.md`: `## Module N · Title (\`page-file.html\`)` then `| id | Lesson | Must understand | Real-world link |`.
5. **Generate the data file**: `node tools/gen-curriculum.js <slug>` (add the slug to `FILES` in `tools/gen-curriculum.js` first) — emits `assets/curriculum-<slug>.js` (`window.<SLUG>_MODULES`).
6. Report module/lesson counts and scope decisions to the user before authoring.

## Depth decision
Say up front whether this pass is **basic** (short, to-the-point lessons — current standard across the whole site while it's young) or **deep** (the full ~700–1500 word standard, module by module, once a path is validated). Default to basic for a new path.

## Quality bar
- Every lesson has a real-world link and a lab idea; no pure-trivia lessons.
- Terminology introduced once, in the earliest lesson that needs it.
- Never implies a recommendation to buy, sell or hold a specific real security.
