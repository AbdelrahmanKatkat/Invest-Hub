/* Labs for Investment Fundamentals (Module 0). Put module-specific labs in their own assets/labs-<module>.js file;
 * load it before shell.js. See curriculum/AUTHORING.md for the lab API and design rules. */
(function () {
  /* ---------- compounding race: simple vs compound interest, animated ---------- */
  IB.labs.compound = function (root) {
    const d = root.dataset;
    const { view, ctl } = IB.labShell(root, d.title || 'Simple vs. compound growth', 'watch interest start earning interest',
      '<canvas style="height:300px"></canvas><div class="readout" id="o" style="margin-top:10px"></div>',
      `<label>Principal P <span class="v" id="pv"></span><input type="range" id="p" min="100" max="20000" step="100" value="${d.p || 1000}"></label>
       <label>Annual rate r <span class="v" id="rv"></span><input type="range" id="r" min="0.01" max="0.20" step="0.005" value="${d.r || 0.08}"></label>
       <label>Years <span class="v" id="yv"></span><input type="range" id="y" min="1" max="40" step="1" value="${d.y || 20}"></label>
       <label>Speed <input type="range" id="sp" min="1" max="12" value="4"></label>
       <div class="row"><button class="btn small" id="pause">⏸ Pause</button><button class="btn small" id="step">Step ▸</button><button class="btn small" id="replay">↺ Replay</button></div>
       <div class="caption" id="cap">① year passes → ② interest is earned → ③ it is added to the balance → ④ next year's interest is computed on the new, larger balance</div>`);
    const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view)), tick = IB.ticker();
    let t = 0, paused = false, phase = 0;
    q('#pause').onclick = () => { paused = !paused; q('#pause').textContent = paused ? '▶ Resume' : '⏸ Pause'; };
    q('#step').onclick = () => { t = Math.min(+q('#y').value, t + 1); };
    q('#replay').onclick = () => { t = 0; };
    IB.loop(root, (dt) => {
      const P = +q('#p').value, r = +q('#r').value, Y = +q('#y').value;
      q('#pv').textContent = IB.money(P, 0); q('#rv').textContent = IB.pct(r); q('#yv').textContent = Y;
      if (t > Y) t = Y;
      if (!paused) { const n = tick(dt, +q('#sp').value / 4); if (n) { t = Math.min(Y, t + n); phase = (phase + n) % 4; } }
      const simple = P * (1 + r * t), compound = P * Math.pow(1 + r, t);
      const C = IB.col(), g = c.ctx, v = IB.view(c, 0, Y, 0, Math.max(simple, compound, P * 1.2) * 1.08);
      g.clearRect(0, 0, c.w, c.h); IB.axes(g, v);
      g.save(); g.beginPath(); g.rect(v.pad.l, v.pad.t, v.pw, v.ph); g.clip();
      const drawCurve = (fn, color) => { g.strokeStyle = color; g.lineWidth = 2.5; g.beginPath(); for (let k = 0; k <= 200; k++) { const x = (Y * k) / 200; if (x > t + 1e-9) break; const y = fn(x); k ? g.lineTo(v.X(x), v.Y(y)) : g.moveTo(v.X(x), v.Y(y)); } g.stroke(); };
      drawCurve((x) => P * (1 + r * x), C.orange);
      drawCurve((x) => P * Math.pow(1 + r, x), C.green);
      g.fillStyle = C.orange; g.beginPath(); g.arc(v.X(t), v.Y(simple), 5, 0, 7); g.fill();
      g.fillStyle = C.green; g.beginPath(); g.arc(v.X(t), v.Y(compound), 5, 0, 7); g.fill();
      g.restore();
      g.fillStyle = C.muted; g.font = '11px sans-serif'; g.textAlign = 'left';
      g.fillText('■ simple interest: P(1+rt)   ■ compound interest: P(1+r)ᵗ', v.pad.l + 4, 12);
      const extra = compound - simple;
      q('#o').innerHTML = `year t = ${IB.fmt(t, 1)}\n<span class="o">simple</span>   = ${IB.money(simple)}\n<span class="g">compound</span> = ${IB.money(compound)}\nextra from compounding = <b class="g">${IB.money(extra)}</b> (${IB.pct(extra / (simple || 1))} more)`;
    });
  };

  /* ---------- diversification: two return series blended by weight and correlation ---------- */
  IB.labs.diversify = function (root) {
    const { view, ctl } = IB.labShell(root, 'Diversification: why ρ matters', 'two assets with the same individual risk — change how they move together',
      '<canvas style="height:300px"></canvas><div class="readout" id="o" style="margin-top:10px"></div>',
      `<label>Weight in Asset A <span class="v" id="wv"></span><input type="range" id="w" min="0" max="1" step="0.02" value="0.5"></label>
       <label>Std. dev. of each asset σ <span class="v" id="sv"></span><input type="range" id="s" min="0.05" max="0.40" step="0.01" value="0.20"></label>
       <label>Correlation ρ(A,B) <span class="v" id="rv"></span><input type="range" id="r" min="-1" max="1" step="0.05" value="0.3"></label>
       <div class="caption">Both assets have the same volatility σ, so any drop in the portfolio's risk below σ is the diversification benefit, not a lucky pick.</div>`);
    const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view)), r = IB.rng(7);
    const seriesA = Array.from({ length: 24 }, () => IB.randn(r)), seriesZ = Array.from({ length: 24 }, () => IB.randn(r));
    IB.loop(root, () => {
      const w = +q('#w').value, s = +q('#s').value, rho = +q('#r').value;
      q('#wv').textContent = IB.fmt(w, 2); q('#sv').textContent = IB.pct(s); q('#rv').textContent = IB.fmt(rho, 2);
      const seriesB = seriesA.map((a, i) => rho * a + Math.sqrt(Math.max(0, 1 - rho * rho)) * seriesZ[i]);
      const retA = seriesA.map((z) => 0.08 + s * z), retB = seriesB.map((z) => 0.08 + s * z);
      const port = retA.map((a, i) => w * a + (1 - w) * retB[i]);
      const stdA = IB.stats(retA).std, stdB = IB.stats(retB).std, stdP = IB.stats(port).std;
      const formula = Math.sqrt(w * w * s * s + (1 - w) * (1 - w) * s * s + 2 * w * (1 - w) * rho * s * s);
      const C = IB.col(), g = c.ctx, v = IB.view(c, -0.5, 23.5, Math.min(-0.4, ...retA, ...retB, ...port) - 0.05, Math.max(0.4, ...retA, ...retB, ...port) + 0.05);
      g.clearRect(0, 0, c.w, c.h); IB.axes(g, v, { noGrid: true });
      const line = (arr, color, w2) => { g.strokeStyle = color; g.lineWidth = w2; g.beginPath(); arr.forEach((val, i) => (i ? g.lineTo(v.X(i), v.Y(val)) : g.moveTo(v.X(i), v.Y(val)))); g.stroke(); };
      g.globalAlpha = 0.55; line(retA, C.blue, 1.5); line(retB, C.orange, 1.5); g.globalAlpha = 1; line(port, C.green, 3);
      g.fillStyle = C.muted; g.font = '11px sans-serif'; g.textAlign = 'left';
      g.fillText('A (blue) · B (orange) · blended portfolio (green, bold)', v.pad.l + 4, 12);
      q('#o').innerHTML = `σ(A) = ${IB.pct(stdA)}   σ(B) = ${IB.pct(stdB)}\nσ(portfolio), simulated = <b class="g">${IB.pct(stdP)}</b>\nσ(portfolio), formula √(w²σ²+(1-w)²σ²+2w(1-w)ρσ²) = <b class="g">${IB.pct(formula)}</b>\n<span class="m">lower ρ → more cancellation → lower portfolio risk, for the same expected return</span>`;
    });
  };

  /* ---------- risk/return map: where asset classes sit, and a risk-tolerance line ---------- */
  IB.labs.riskreturn = function (root) {
    const ASSETS = [
      { n: 'Cash', risk: 0.01, ret: 0.02, c: 'muted' }, { n: 'Short bonds', risk: 0.04, ret: 0.035, c: 'teal' },
      { n: 'Long bonds', risk: 0.09, ret: 0.045, c: 'blue' }, { n: 'Diversified stocks', risk: 0.16, ret: 0.09, c: 'green' },
      { n: 'Single stock', risk: 0.30, ret: 0.10, c: 'orange' }, { n: 'Crypto', risk: 0.65, ret: 0.15, c: 'pink' },
    ];
    const { view, ctl } = IB.labShell(root, 'The risk–return map', 'drag the dashed line to your own risk tolerance',
      '<canvas style="height:320px;touch-action:none;cursor:ew-resize"></canvas>', '<div class="readout" id="o"></div><div class="caption">Risk is measured here as annual standard deviation of return; this is a simplified illustrative placement, not live market data.</div>');
    const q = (s) => IB.$(s, root), cv = IB.$('canvas', view), c = IB.canvas(cv);
    let tol = 0.20, drag = false;
    const v0 = () => IB.view(c, 0, 0.7, 0, 0.17);
    const setFromEvent = (e) => { const r = cv.getBoundingClientRect(); tol = IB.clamp(v0().ix(e.clientX - r.left), 0, 0.7); };
    cv.addEventListener('pointerdown', (e) => { drag = true; cv.setPointerCapture(e.pointerId); setFromEvent(e); });
    cv.addEventListener('pointermove', (e) => drag && setFromEvent(e));
    cv.addEventListener('pointerup', () => (drag = false));
    IB.loop(root, () => {
      const C = IB.col(), g = c.ctx, v = v0();
      g.clearRect(0, 0, c.w, c.h); IB.axes(g, v, { noGrid: true });
      g.strokeStyle = C.yellow || C.orange; g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(v.X(tol), v.pad.t); g.lineTo(v.X(tol), v.pad.t + v.ph); g.stroke(); g.setLineDash([]);
      ASSETS.forEach((a) => {
        g.fillStyle = C[a.c] || C.fg; g.beginPath(); g.arc(v.X(a.risk), v.Y(a.ret), 8, 0, 7); g.fill();
        g.font = '12px sans-serif'; g.textAlign = 'left'; g.fillText(a.n, v.X(a.risk) + 11, v.Y(a.ret) + 4);
      });
      g.fillStyle = C.muted; g.font = '11px sans-serif'; g.fillText('risk (σ) →', v.pad.l + v.pw - 60, v.pad.t + v.ph + 15);
      const within = ASSETS.filter((a) => a.risk <= tol).map((a) => a.n);
      q('#o').innerHTML = `your risk tolerance: σ ≤ <b>${IB.pct(tol)}</b>\nwithin tolerance: ${within.length ? within.join(', ') : '(none at this low a tolerance)'}\n<span class="m">higher expected return has historically required accepting higher risk — there is no dot in the top-left corner</span>`;
    });
  };

  /* ---------- portfolio allocation pie: drag weights, see blended expected return & risk ---------- */
  IB.labs.allocpie = function (root) {
    const CLASSES = [{ n: 'Stocks', ret: 0.09, risk: 0.16, c: 'green' }, { n: 'Bonds', ret: 0.045, risk: 0.07, c: 'blue' }, { n: 'Cash', ret: 0.02, risk: 0.01, c: 'muted' }, { n: 'Alternatives', ret: 0.07, risk: 0.22, c: 'purple' }];
    const { view, ctl } = IB.labShell(root, 'Build an allocation', 'set the weights — they always renormalise to 100%',
      '<canvas style="height:300px"></canvas><div class="readout" id="o" style="margin-top:10px"></div>',
      CLASSES.map((cl, i) => `<label>${cl.n} <span class="v" id="v${i}"></span><input type="range" id="w${i}" min="0" max="100" value="${[55, 30, 10, 5][i]}"></label>`).join(''));
    const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view));
    IB.loop(root, () => {
      const raw = CLASSES.map((_, i) => +q('#w' + i).value), sum = raw.reduce((a, b) => a + b, 0) || 1;
      const w = raw.map((x) => x / sum);
      CLASSES.forEach((cl, i) => (q('#v' + i).textContent = IB.pct(w[i], 0)));
      const C = IB.col(), g = c.ctx, cx = c.w * 0.32, cy = c.h / 2, R = Math.min(c.w * 0.26, c.h * 0.42);
      g.clearRect(0, 0, c.w, c.h);
      let a0 = -Math.PI / 2;
      CLASSES.forEach((cl, i) => { const a1 = a0 + w[i] * 2 * Math.PI; g.fillStyle = C[cl.c] || C.fg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fill(); a0 = a1; });
      g.font = '12px sans-serif'; g.textAlign = 'left'; let ly = cy - R;
      CLASSES.forEach((cl, i) => { g.fillStyle = C[cl.c] || C.fg; g.fillRect(cx + R + 20, ly, 10, 10); g.fillStyle = C.fg; g.fillText(`${cl.n}  ${IB.pct(w[i], 0)}`, cx + R + 36, ly + 9); ly += 20; });
      const expRet = w.reduce((s, wi, i) => s + wi * CLASSES[i].ret, 0);
      // simplified risk: assumes a flat 0.25 pairwise correlation between every pair of classes (illustrative, not a covariance estimate)
      let varP = 0;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) varP += w[i] * w[j] * CLASSES[i].risk * CLASSES[j].risk * (i === j ? 1 : 0.25);
      const riskP = Math.sqrt(varP);
      q('#o').innerHTML = `expected return (weighted average) = <b class="g">${IB.pct(expRet)}</b>\nexpected risk (σ, assuming ρ=0.25 between classes) = <b class="o">${IB.pct(riskP)}</b>\n<span class="m">move more weight into Stocks: return rises, but so does risk — there is no free lunch, only diversification's partial cancellation</span>`;
    });
  };
})();
