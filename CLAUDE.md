# Invest Buddy — project guide for Claude

A static, GitHub-Pages-hosted investing education site — "Invest Buddy: Learn · Analyze · Invest · Grow" — with
**editable formulas and animated labs**. No build step: plain HTML/CSS/JS. Sibling project to **AI-Hub**, reusing its
architecture (themes, shell, lab engine, curriculum-first method, skills) rebuilt for investment education, following the
Invest Buddy dashboard mockup for layout/branding.

## Path order (sidebar, home grid) — do not reorder without being asked
Investment Fundamentals → Economics (Macro & Micro) → Financial Markets → Asset Classes → Fundamental Analysis →
Technical Analysis → Behavioral Finance → Investment Strategies → Portfolio Management → Risk & Derivatives →
Global & Current Events → Quant Investing.
Live now: **Investment Fundamentals** (5 modules / 33 lessons, a **basic pass** — concise, to be deepened module by
module later). Everything else is `status: 'soon'`.

## Layout
```
index.html                        home (pipeline + path grid + dashboard widget previews)
investment-fundamentals.html      hub page for Investment Fundamentals (map + module cards)
investment-fundamentals-N.html    one page per module (lessons are <section class="lesson" id="lesson-id">)
curriculum/investment-fundamentals.md   SOURCE OF TRUTH for what each lesson covers
curriculum/AUTHORING.md           the lesson standard (basic vs. deep pass), lab API, verification steps
tools/gen-curriculum.js           curriculum/<path>.md -> assets/curriculum-<slug>.js (run after editing a .md)
tools/make-frames.js              writes the panel frames + neon theme CSS into assets/style.css (generated block; run after editing it)
assets/topics.js                  path registry (order, status) + PIPELINES (animated stage definitions)
assets/curriculum-fundamentals.js GENERATED — never edit by hand
assets/lib.js                     expression parser, canvas/plot helpers, IB.loop/IB.ticker, IB.fmt/pct/money/stats/corr
assets/labs-core.js               generic reusable labs: fplot, calc, machine, sigma, vec2, decode
assets/labs-fundamentals.js       Module-0-born labs reused across the whole path: compound, diversify, riskreturn, allocpie
assets/labs-pipeline.js           the animated 6-stage "pipeline" lab used on every hub page
assets/shell.js                   header, topbar, sidebar tree, outline, search, progress (localStorage), theme, notes/flashcards/summary
assets/style.css                  dark/light/neon theme + lesson building blocks + generated frame CSS
.github/workflows/pages.yml       deploys every push to main (copies *.html + assets). No manual deploy step.
.claude/skills/                   project skills (see below)
```

## Hard rules
1. **Curriculum first.** Content is written *from* `curriculum/<path>.md`. To change scope, edit the md, regenerate
   (`node tools/gen-curriculum.js <slug>`), then write lessons.
2. **Depth: basic pass now, deep pass later, module by module.** Every lesson has all required parts (question,
   intuition, worked example, formal definition, lab, traps, real-world link, 3 self-checks, takeaways) but is kept
   concise (~150–350 words) while the site is young. Deepen one module at a time on request — see "where things stand".
3. **Numerically exact.** Compute every worked example and quiz answer (node/python) before writing it.
4. **Never advice.** No lesson, worked example or lab readout may read as a recommendation to buy, sell or hold a
   specific real security. Use illustrative numbers and named categories; label sample/historical data as such.
5. **Animations: slow, real-time, meaningful.** Use `dt`/`IB.ticker` (never per-frame stepping), slow defaults, a speed
   slider where relevant, captions that say what is happening.
6. Colours only via `IB.col()` / CSS variables so dark, light and neon themes all work (theme = `data-theme` on
   `<html>`; the header button cycles dark → light → neon, stored in localStorage).
7. Pages are flat files at repo root (no sub-folders) so relative links and the Pages workflow stay simple.
8. Shared files (`lib.js`, `labs-core.js`, `shell.js`, `style.css`, `topics.js`) are edited deliberately; parallel
   authors create only their own `investment-fundamentals-<module>.html` + `assets/labs-<module>.js`.

## Project skills (in .claude/skills) — same roles as AI-Hub's, smaller/adapted versions
- `plan-curriculum` — design a path's curriculum and generate its data file.
- `write-deep-lesson` — author a module/lesson at basic or deep depth.
- `add-lab` — build a new interactive, slow, editable animated lab.
- `add-topic` — register/launch a new path (registry, hub page, modules, sidebar).
- `verify-site` — headless Chrome check + screenshot review.

## Where things stand / next
- **Investment Fundamentals**: live. Hub `investment-fundamentals.html` + modules 0–4 (`investment-fundamentals-0.html`
  … `-4.html`, 33 lessons total: 10/6/7/5/5). All five modules are a **basic pass** — concise, same structural standard
  as a deep lesson, shorter prose and fewer worked examples. Deepen one module at a time next, starting wherever the
  user wants more depth first (Module 0 is the natural first candidate, being the most foundational).
- Shared labs: `assets/labs-core.js` (fplot, calc, machine, sigma, vec2, decode — ported from AI-Hub, domain-agnostic)
  and `assets/labs-fundamentals.js` (compound, diversify, riskreturn, allocpie — written for this path, reused across
  all 5 modules rather than one labs file per module, since the basic pass needed fewer bespoke visuals).
- Themes (dark, light, neon) and panel frames work exactly like AI-Hub: generated by `tools/make-frames.js` between
  `@@FRAMES-START`/`@@FRAMES-END` in `assets/style.css`. The neon background is `assets/neon-skyline.jpg` (converted
  from the user-supplied "Neon Cyberpunk Skyline at Twilight.png", NOT a generated image) and loads only in the neon
  theme. The design follows "Neon Invest Buddy Learning Dashboard.png" (both PNGs are reference mockups, excluded from
  git via `.git/info/exclude`, same convention as AI-Hub's `AI-Hub.jpg`).
- Notes feature (`assets/shell.js`): the floating Notes button now has four tabs — **Notes** (save/quote/export, same
  mechanics as AI-Hub), **Flashcards** (built live from every `.takeaways li` on the current page — real content, not
  invented), **Summary** (an extractive summary built from the page's own "question" + "takeaways" blocks, explicitly
  labelled as not a separate AI summary), and **Mind Map** (placeholder, explicitly labelled "planned, not built yet").
- Topbar (`#topbar`, under the header): **Paths**, **Markets** and **Portfolio** are live links to real sections;
  **Research**, **News**, **Tools**, **Community** are shown greyed out with a "planned — not built yet" tooltip,
  honestly matching the mockup's nav without faking functionality that doesn't exist.
- Dashboard widgets (home page `#markets-widget`, `#watchlist-widget`, `#insights-widget`, `#alerts-widget`, rendered by
  `assets/shell.js`): all sample/illustrative data, explicitly labelled "not a live feed" / "sample for illustration" —
  mirrors the mockup's Markets Overview, Watchlist, AI Market Insights (relabelled "Things worth understanding" — this
  is an investing site, not an AI product) and Alerts panels. Portfolio Simulator reuses the real `allocpie` lab.
- Authoring hazard (inherited from AI-Hub): never give a lab control `id="side"`, `id="hdr"` or `id="outline"` — the
  shell's CSS for those ids would apply to it.
- Next: deepen Investment Fundamentals module by module on request, or launch Economics as the next path (skill
  `add-topic`) once Investment Fundamentals is deep enough to be a confident prerequisite.
