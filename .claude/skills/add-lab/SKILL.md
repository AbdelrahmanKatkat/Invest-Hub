---
name: add-lab
description: Build a new interactive animated lab for Invest-Hub (editable numbers/formula, slow captioned animation, no lag) in the right assets/labs-*.js file. Use when a lesson needs a visual that existing labs (fplot, calc, compound, diversify, riskreturn, allocpie, …) do not provide.
---

# Add an interactive lab

Labs are functions registered as `IB.labs.name = function (root) {…}` and mounted with `<div data-lab="name"></div>` (config
via data-attributes). Put them in the labs file for the module (`assets/labs-<module>.js`); load it before `shell.js`.
First check `assets/labs-core.js` and `assets/labs-fundamentals.js` — reuse before writing.

## Design principles
1. **One idea per lab.** The learner changes one number or formula and sees one effect.
2. **Editable.** Expose a formula (`IB.exprInput`) or numbers (sliders) — not just a play button.
3. **Show the mechanism**, not only the result: captions, trails, highlighted quantities, a live `.readout` that matches the picture.
4. **Slow and smooth.** `IB.ticker()` for step-based processes, a speed slider where relevant, easing toward targets.
5. **Light on the CPU.** Skip redraw when a state key is unchanged; `{fps:30}` for heavy labs.
6. **Theme-safe.** Colours from `IB.col()`; canvases via `IB.canvas(cv)`.
7. **Fail softly** and **never imply a real-time feed or a recommendation** — label sample/illustrative numbers as such.

## Skeleton
```js
IB.labs.myLab = function (root) {
  const { view, ctl } = IB.labShell(root, 'Title', 'one-line instruction',
    '<canvas style="height:300px"></canvas>',
    '<label>Rate <input type="range" id="r" min="0" max="0.2" step="0.01" value="0.08"></label><div class="readout" id="o"></div>');
  const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view));
  IB.loop(root, (dt) => { /* read q('#r').value, draw with IB.view/axes, write q('#o').innerHTML */ });
};
```
Helpers: `IB.parse/compile/exprInput`, `IB.view/axes/arrow`, `IB.fmt/pct/money/clamp/lerp/smooth/mix`, `IB.stats/quantile/corr`, `IB.rng/randn`.

## In the lesson
Place a `<div class="try"><b>Try this</b><ol>…</ol></div>` before the lab telling the learner exactly what to do and notice.
Then verify with skill `verify-site`.
