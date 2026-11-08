---
name: write-deep-lesson
description: Author one lesson or a whole module of Invest-Hub to the standard (question, intuition, worked example, formal definition, lab, traps, real-world link, self-check, takeaways), at basic or deep depth. Use whenever writing or upgrading lesson content such as investment-fundamentals-*.html.
---

# Write a lesson

Read first: `curriculum/AUTHORING.md` (standard + APIs) and the reference page `investment-fundamentals-0.html`. The lesson
ids and scope come from `curriculum/<path>.md`.

## Depth: basic vs. deep
Most of the site is currently a **basic pass**: every required part is present but prose is short (roughly 150–350 words),
one small worked example or none, one lab. A **deep pass** (700–1500 words, multiple worked examples, richer labs) is done
module by module later, on request. Check `CLAUDE.md` "where things stand" for which modules are which before writing.

## Process for each lesson
1. Find the concrete problem that makes the idea necessary → "The question".
2. Intuition before symbols: a plain-words analogy. A beginner must follow every sentence.
3. Build up in small steps; at least one hand-worked example with real numbers, computed and checked in the shell first.
4. Formal definition in KaTeX plus a `table.sym` explaining every symbol; state assumptions.
5. A lab (reuse `fplot`/`calc`/`compound`/`diversify`/`riskreturn`/`allocpie` before writing a new one — see AUTHORING.md), preceded by a "Try this" list.
6. Common traps, "where it shows up in real investing" (named instruments/indices/metrics), 3 self-check questions with answers, takeaways.

## HTML conventions
- `<section class="lesson" id="LESSON-ID" data-lesson>` with `lesson-head` (level badge `M.N`, `<h2>`, `<button class="btn small mark">`).
- Prose in `<div class="prose">`; labs sit *between* prose blocks (labs are full width).
- Equations: `<div class="eq">TeX</div>`, inline `<span class="tex">TeX</span>`; escape `&`→`&amp;`, `<`→`&lt;`.
- Body: `<body data-topic="fundamentals" data-module="N">`; scripts deferred, `shell.js` last.

## Parallel authoring
Give each module to its own agent. Brief = point at AUTHORING.md + curriculum md + reference page + depth (basic/deep) +
lab ideas for that module; restrict each agent to its own `investment-fundamentals-<module>.html` and
`assets/labs-<module>.js` if it needs a new lab; tell them not to touch shared files or run git. Review every module
yourself afterwards (skill `verify-site`), re-check numbers, then commit.

## Self-review checklist
- [ ] all required parts present in every lesson, ids match the curriculum
- [ ] every worked example/answer recomputed
- [ ] no lesson reads as a recommendation on a specific real security
- [ ] at least one editable lab per lesson; no console errors, readable on mobile width
