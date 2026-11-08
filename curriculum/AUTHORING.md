# Authoring guide — deep lessons

The reference implementation is **`investment-fundamentals-0.html`** (Module 0 · Fundamentals). Read it first: copy its page
skeleton, its lesson structure and its tone. The curriculum spec (what each lesson must cover) is
**`curriculum/investment-fundamentals.md`**.

## The standard (non-negotiable)
Each lesson is a `<section class="lesson" id="LESSON-ID" data-lesson>` using the id from the curriculum table, containing:

1. `lesson-head` with level badge (`0.1`, `0.2`…), `<h2>`, and `<button class="btn small mark"></button>`.
2. **The question** (`<div class="question"><b>The question</b>…`) — a concrete problem that makes the idea necessary.
3. **Intuition** (`<h3 class="sec">Intuition</h3>`) — analogy / mental picture in plain words. *No formula before the idea.*
4. **Build it up** — step by step. At least one `<div class="worked"><b>Worked example</b>…` with **real numbers computed by hand**.
5. **The formal definition** — equation(s) in `<div class="eq">…</div>` plus a `<table class="sym">` explaining *every symbol*.
6. **Lab(s)** — preceded by `<div class="try"><b>Try this</b><ol>…</ol></div>` with concrete things to do and what they should notice.
7. `<div class="trap"><b>Common traps</b>…`
8. `<div class="realhook"><b>Where it shows up in real investing</b>…` — concrete, named instruments/indices/metrics, not vague statements.
9. `<h3 class="sec">Check yourself</h3>` with 3 × `<details class="check"><summary>…</summary><div class="ans">…</div></details>`.
10. `<div class="takeaways"><h4>Takeaways</h4><ul>…</ul></div>`.

## Depth: basic pass vs. deep pass
The whole site is currently a **basic pass**: every lesson has every required part above, but prose is kept short and
to-the-point (roughly 150–350 words, one small worked example or none, one lab). This is deliberate — breadth across all
modules first, then a **deep pass** (700–1500 words, multiple worked examples, richer labs, patient-teacher tone) module by
module on request, the way Mathematics was deepened in the sibling AI-Hub project. Check `CLAUDE.md` "where things stand"
for which modules are still basic. Whichever depth you are writing: build from the simplest case to full understanding,
define terms on first use, give the "why" not only the "what", and never skip a step a beginner would stumble on.

**Numerical correctness is mandatory.** Every worked example and every "Check yourself" answer must be computed and
double-checked (use node/python in the shell) before it is written down. Every formula must state its assumptions
(e.g. "returns are annual and independent across years" for the Sharpe ratio; "no fees, taxes or reinvestment lag" for CAGR
examples). This project gives general, illustrative education — never a recommendation to buy, sell or hold any specific
security. Label any simulated market data as **illustrative** or **sample data, not live** wherever it appears.

## Page skeleton
Copy the `<head>`, header/aside/main/aside structure and footer from `investment-fundamentals-0.html`. Set
`<body data-topic="fundamentals" data-module="N">`. Load scripts in this order (all `defer`): KaTeX, `assets/topics.js`,
`assets/curriculum-fundamentals.js`, `assets/lib.js`, `assets/labs-core.js`, your own `assets/labs-<module>.js` (if any),
then `assets/shell.js` **last**. The shell builds the header, topbar, sidebar (module + lesson tree), outline, progress
buttons and prev/next module navigation automatically.
Add a hero (see Module 0) and finish with a short "Module complete" callout pointing to the next module.

## Equations
Use KaTeX. Display: `<div class="eq">\frac{a}{b}</div>`. Inline: `<span class="tex">x^2</span>`. The element's *text* is the TeX:
write `&amp;` for `&` and `&lt;`/`&gt;` for `<`/`>` inside TeX. Inside JS strings/JSON double the backslashes.

## Available CSS blocks
`.question .worked .realhook .try .trap .callout .callout.warn .takeaways details.check table.sym table.tbl pre>code .eq .tex
.chips .chip .grid .card .lab`. Do not edit `assets/style.css`; if you truly need a tiny extra style, use an inline `style=""`.

## Ready-made labs (mount with `<div data-lab="NAME" …></div>`)
From `assets/labs-core.js` (generic, reusable across any topic):
- `fplot` — function plotter with editable formulas and parameter sliders: `data-f="a*x+b; x^2" data-params="a=1:-3..3:0.1; b=0:-3..3:0.1" data-view="xmin,xmax,ymin,ymax" data-names="f;g" data-title data-roots data-diag data-readout="label = expr; …" data-height`. Good for compounding curves, time-value-of-money, payoff diagrams.
- `calc` — sliders + live computed rows: `data-params`, `data-rows="label = expr; …"`, `data-note`. Good for CAGR, Sharpe ratio, present/future value calculators.
- `machine` — a "function machine": numbers go in, a rule transforms them, numbers come out. Good for a discounting or payoff rule.
- `sigma` — animated Σ/Π: good for averaging returns, compounding as a product of (1+r) terms.
- `vec2` — draggable 2-D points/vectors with distance, dot product, angle. Reusable for simple two-asset geometry.
- `decode` — click-through pieces of an equation with a plain-language explanation of each piece.
From `assets/labs-fundamentals.js` (Module 0 specific, reuse where it fits):
- `compound` — animated race between simple and compound interest: `data-p` (principal), `data-r` (rate), `data-y` (years).
- `diversify` — two return series blended by weight and correlation; shows the diversification formula live.
- `riskreturn` — a draggable risk-tolerance line over a risk/return map of asset classes.
- `allocpie` — a draggable portfolio allocation pie with live expected return and (simplified) risk.
Expressions use the safe parser in `assets/lib.js` (`+ - * / ^`, implicit multiplication, `sin cos tan exp log sqrt abs tanh sigmoid relu atan max min`, constants `pi e`).

**Write new labs** whenever a lesson needs a visual that does not exist. Put them in **your own file** `assets/labs-<module>.js` as
`IB.labs.myLab = function (root) { … }` (use `IB.labShell(root, title, subtitle, viewHTML, controlsHTML)` for the standard layout).
Helpers in `assets/lib.js`: `IB.parse/compile/autodiff/exprInput`, `IB.canvas`, `IB.loop(el, fn, {fps})`, `IB.ticker`,
`IB.view/axes/arrow`, `IB.fmt/pct/money/clamp/lerp/smooth/mix/rgb/col`, `IB.stats/quantile/corr`, `IB.rng/randn`. See existing
labs for patterns.

## Animation rules (learners complained animations were too fast and laggy)
- Everything animates in **real time units** (`dt`), never "per frame". Use `IB.ticker()` for step-based processes (rates in steps/second or years/second).
- **Slow by default**: a new idea should take seconds to unfold. Typical: a 20-year compounding race should take 5–10 seconds to finish, not instantly.
- Make motion **meaningful**: show captions of what is happening, trails, labels, highlighted quantities, and smooth interpolation (ease toward targets) rather than jumps.
- Performance: only draw when needed (compare a state key and skip if unchanged), cap heavy labs with `{fps:30}`, keep per-frame work small, precompute images/heatmaps and throttle them. Never allocate large arrays per frame.
- Pause automatically when off-screen (`IB.loop` already does). Colours via `IB.col()` so dark, light and neon themes all work.

## Do / don't
- **Create only your own files** (`investment-fundamentals-<module>.html`, `assets/labs-<module>.js`). Do **not** edit shared files
  (`assets/lib.js`, `labs-core.js`, `topics.js`, `shell.js`, `style.css`, other modules) — other authors work in parallel.
- Never phrase a lesson, worked example or lab readout as a recommendation to buy, sell or hold a specific security. Use
  "illustrative", round numbers and named *categories* (large-cap stocks, a hypothetical index fund) rather than real current
  tickers with real current prices unless the number is explicitly historical and sourced.
- Do not git add/commit/push. The maintainer does that.

## Verify before finishing
1. `node --check assets/labs-<module>.js`.
2. Load the page headless and check for console errors, from the repo root, e.g.:
   `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu --enable-logging=stderr --v=0 --virtual-time-budget=9000 --window-size=1500,6000 --screenshot="<scratchpad>/x.png" "file:///E:/On%20Going%20Projects/Knowledge%20Growth/Invest-Hub/<page>.html" 2>&1 | grep CONSOLE`
   (no output = no errors) and look at the screenshot with the Read tool: labs must render, equations must typeset (no raw `\frac`), layout must not overflow.
3. Check every lesson id in your page matches `curriculum/investment-fundamentals.md` exactly and every lesson has all required parts.
4. Re-compute worked examples and answers numerically.
