/* Reusable teaching labs configured from HTML data-attributes.
 *
 * fplot       <div data-lab="fplot" data-f="a*x+b; x^2" data-params="a=1:-3..3:0.1; b=0:-3..3:0.1" data-view="-5,5,-5,5" data-roots data-diag data-title="..."></div>
 * calc        <div data-lab="calc" data-params="..." data-rows="label = expr; label = expr"></div>
 * machine     <div data-lab="machine" data-f="2*x+1"></div>
 * sigma       <div data-lab="sigma" data-term="i^2"></div>
 * rn          <div data-lab="rn"></div>
 * unitcircle  <div data-lab="unitcircle"></div>
 * vec2        <div data-lab="vec2" data-show="dot,proj,angle"></div>
 * highdim     <div data-lab="highdim"></div>
 * halfplane   <div data-lab="halfplane"></div>
 * decode      <div data-lab="decode"><script type="application/json">{...}</script></div>
 */
(function () {
  const COLORS = ['blue', 'orange', 'green', 'purple', 'pink', 'teal'];
  const parseParams = (s) => (s || '').split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = /^(\w+)\s*=\s*(-?[\d.]+)\s*:\s*(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)(?:\s*:\s*([\d.]+))?$/.exec(p);
    if (!m) throw new Error('Bad data-params entry: ' + p);
    return { n: m[1], v: +m[2], min: +m[3], max: +m[4], step: +(m[5] || 0.1) };
  });
  const paramControls = (ctl, params, scope) => {
    params.forEach((p) => {
      scope[p.n] = p.v;
      const l = document.createElement('label');
      l.innerHTML = `<span>${p.n} <span class="v"></span></span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.v}">`;
      const inp = l.querySelector('input'), val = l.querySelector('.v');
      const upd = () => { scope[p.n] = +inp.value; val.textContent = IB.fmt(+inp.value, 3); };
      inp.oninput = upd; upd(); ctl.appendChild(l);
    });
  };

  /* ---------- function plotter ---------- */
  IB.labs.fplot = function (root) {
    const d = root.dataset, src = (d.f || 'x').split(';').map((s) => s.trim()).filter(Boolean), params = parseParams(d.params);
    const [x0, x1, y0, y1] = (d.view || '-5,5,-5,5').split(',').map(Number);
    const { view, ctl } = IB.labShell(root, d.title || 'Function plotter', d.sub || 'edit the formulas, drag the sliders', `<canvas style="height:${d.height || 340}px"></canvas>`, '');
    const c = IB.canvas(IB.$('canvas', view)), scope = {}, names = ['x', ...params.map((p) => p.n)];
    const fns = src.map(() => null), err = document.createElement('div'); err.className = 'err';
    src.forEach((s, i) => {
      const l = document.createElement('label'); l.innerHTML = `<span style="color:var(--${COLORS[i % 6]})">${d.names ? d.names.split(';')[i] : 'f' + (i + 1) + '(x)'} =</span><input type="text" spellcheck="false" value="${s.replace(/"/g, '&quot;')}">`;
      const inp = l.querySelector('input'); ctl.appendChild(l);
      IB.exprInput(inp, err, { allowed: names, onChange: (f) => (fns[i] = f) }).run();
    });
    ctl.appendChild(err);
    paramControls(ctl, params, scope);
    const out = document.createElement('div'); out.className = 'readout'; ctl.appendChild(out);
    if (!d.roots && !d.readout) out.remove();
    let lastKey = '';
    IB.loop(root, () => {
      const key = JSON.stringify(scope) + IB.$$('input[type=text]', ctl).map((i) => i.value).join('|') + c.w + 'x' + c.h + document.documentElement.dataset.theme;
      if (key === lastKey) return;
      lastKey = key;
      const C = IB.col(), g = c.ctx, v = IB.view(c, x0, x1, y0, y1);
      g.clearRect(0, 0, c.w, c.h); IB.axes(g, v);
      const ev = (i, x) => (fns[i] ? fns[i]({ ...scope, x }) : NaN);
      if (d.diag !== undefined) { g.strokeStyle = C.muted; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(v.X(Math.min(x0, y0)), v.Y(Math.min(x0, y0))); g.lineTo(v.X(Math.max(x1, y1)), v.Y(Math.max(x1, y1))); g.stroke(); g.setLineDash([]); }
      g.save(); g.beginPath(); g.rect(v.pad.l, v.pad.t, v.pw, v.ph); g.clip();
      fns.forEach((f, i) => {
        if (!f) return;
        g.strokeStyle = C[COLORS[i % 6]]; g.lineWidth = 2.5; g.beginPath(); let pen = false, py = 0;
        for (let k = 0; k <= 500; k++) {
          const x = x0 + ((x1 - x0) * k) / 500, y = ev(i, x);
          if (!Number.isFinite(y) || (pen && Math.abs(y - py) > (y1 - y0) * 3)) { pen = false; py = y; continue; }
          pen ? g.lineTo(v.X(x), v.Y(y)) : g.moveTo(v.X(x), v.Y(y)); pen = true; py = y;
        }
        g.stroke();
      });
      let txt = '';
      if (d.roots !== undefined) {
        const h = (x) => ev(0, x) - (fns[1] ? ev(1, x) : 0), pts = [];
        let a = x0, ha = h(a);
        for (let k = 1; k <= 800; k++) {
          const b = x0 + ((x1 - x0) * k) / 800, hb = h(b);
          if (Number.isFinite(ha) && Number.isFinite(hb) && ha * hb <= 0 && ha !== hb) {
            let lo = a, hi = b; for (let j = 0; j < 40; j++) { const m = (lo + hi) / 2; (h(lo) * h(m) <= 0) ? (hi = m) : (lo = m); }
            const r = (lo + hi) / 2; if (!pts.length || Math.abs(pts[pts.length - 1] - r) > 1e-3) pts.push(r);
          }
          a = b; ha = hb;
        }
        g.fillStyle = C.fg;
        pts.forEach((r) => { g.beginPath(); g.arc(v.X(r), v.Y(ev(0, r)), 6, 0, 7); g.fill(); });
        txt = pts.length ? 'where the curves meet (f1 = f2):\n' + pts.map((r) => `  x = ${IB.fmt(r, 4)}   y = ${IB.fmt(ev(0, r), 4)}`).join('\n') : 'the curves do not meet in this window';
      }
      g.restore();
      if (d.readout) txt += (txt ? '\n' : '') + d.readout.split(';').map((s) => { const [lab, e] = s.split('='); try { return `${lab.trim()} = ${IB.fmt(IB.compile(IB.parse(e), [...names])({ ...scope, x: 0 }), 4)}`; } catch (e2) { return ''; } }).join('\n');
      out.textContent = txt;
    });
  };

  /* ---------- calc: sliders + live results ---------- */
  IB.labs.calc = function (root) {
    const d = root.dataset, params = parseParams(d.params), scope = {};
    const { view, ctl } = IB.labShell(root, d.title || 'Try it', d.sub || 'drag the sliders, watch the numbers', '<div class="readout" style="font-size:13px"></div>' + (d.note ? `<div class="caption">${d.note}</div>` : ''), '');
    paramControls(ctl, params, scope);
    const rows = d.rows.split(';').map((r) => { const i = r.indexOf('='); return { l: r.slice(0, i).trim(), f: IB.compile(IB.parse(r.slice(i + 1)), params.map((p) => p.n)) }; });
    const out = IB.$('.readout', view);
    const upd = () => (out.innerHTML = rows.map((r) => `<span class="m">${r.l}</span> = <b>${IB.fmt(r.f(scope), 5)}</b>`).join('\n'));
    ctl.addEventListener('input', upd); upd();
  };

  /* ---------- function machine ---------- */
  IB.labs.machine = function (root) {
    const d = root.dataset;
    const { view, ctl } = IB.labShell(root, d.title || 'Function machine', 'numbers go in, the rule transforms them, numbers come out',
      '<canvas style="height:190px"></canvas><div class="readout" id="hist" style="margin-top:10px"></div>',
      `<label>Rule &nbsp;f(x) = <input type="text" id="e" value="${d.f || '2*x+1'}" spellcheck="false"></label><div class="err" id="er"></div>
       <label>Feed your own x <input type="number" id="inx" value="3" step="0.5"></label>
       <div class="row"><button class="btn primary" id="feed">Feed it in</button><label style="flex-direction:row;gap:6px;align-items:center"><input type="checkbox" id="auto" checked> auto-feed</label></div>`);
    const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view));
    let fn = null, items = [], timer = 0, log = [];
    const ei = IB.exprInput(q('#e'), q('#er'), { allowed: ['x'], onChange: (f) => { fn = f; items = []; log = []; } }); ei.run();
    const feed = (x) => { const y = fn({ x }); if (Number.isFinite(y)) items.push({ x, y, t: 0 }); };
    q('#feed').onclick = () => feed(+q('#inx').value);
    IB.loop(root, (dt) => {
      timer -= dt; if (q('#auto').checked && timer <= 0) { feed(Math.round((Math.random() * 8 - 4) * 2) / 2); timer = 3.6; }
      const C = IB.col(), g = c.ctx, w = c.w, y = c.h / 2, bx = w / 2, bw = Math.min(190, w * 0.34);
      g.clearRect(0, 0, w, c.h);
      g.strokeStyle = C.border; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(14, y + 26); g.lineTo(w - 14, y + 26); g.stroke();
      g.fillStyle = C.bg2; g.strokeStyle = C.purple; g.lineWidth = 3; g.beginPath(); g.roundRect(bx - bw / 2, y - 50, bw, 100, 14); g.fill(); g.stroke();
      g.fillStyle = C.fg; g.font = '600 15px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.fillText('f(x) = ' + q('#e').value, bx, y + 5);
      for (const it of items) {
        it.t += dt * 0.19;
        const p = it.t, px = 30 + p * (w - 60), passed = px > bx;
        g.fillStyle = passed ? C.orange : C.blue; g.beginPath(); g.arc(px, y, 17, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.font = '600 12px ui-monospace,Menlo,monospace'; g.fillText(IB.fmt(passed ? it.y : it.x, 2), px, y + 4);
        if (passed && !it.logged) { it.logged = true; log.unshift(`f(${IB.fmt(it.x, 2)}) = ${IB.fmt(it.y, 3)}`); log = log.slice(0, 6); }
      }
      items = items.filter((it) => it.t < 1.05);
      q('#hist').innerHTML = log.length ? log.map((l) => `<span class="o">${l}</span>`).join('\n') : '<span class="m">outputs appear here</span>';
    });
  };

  /* ---------- sigma / pi ---------- */
  IB.labs.sigma = function (root) {
    const d = root.dataset;
    const { view, ctl } = IB.labShell(root, 'Σ and Π machine', 'a loop written as a symbol',
      '<canvas style="height:260px"></canvas><div class="readout" id="o" style="margin-top:10px;white-space:pre-wrap"></div>',
      `<label>Operation <select id="op"><option value="S">Σ  add up the terms</option><option value="P">Π  multiply the terms</option></select></label>
       <label>Term t(i) = <input type="text" id="e" value="${d.term || 'i^2'}" spellcheck="false"></label><div class="err" id="er"></div>
       <label>Start i = <input type="number" id="lo" value="1" min="-5" max="10"></label>
       <label>End n <span class="v" id="nv"></span><input type="range" id="n" min="1" max="12" value="5"></label>
       <div class="row"><button class="btn primary" id="rep">▶ Replay</button></div>`);
    const q = (s) => IB.$(s, root), c = IB.canvas(IB.$('canvas', view));
    let fn = null, p = 0;
    const ei = IB.exprInput(q('#e'), q('#er'), { allowed: ['i', 'n'], onChange: (f) => { fn = f; p = 0; } }); ei.run();
    ['#op', '#lo', '#n'].forEach((s) => q(s).addEventListener('input', () => (p = 0))); q('#rep').onclick = () => (p = 0);
    IB.loop(root, (dt) => {
      const lo = Math.round(+q('#lo').value), n = Math.max(lo, +q('#n').value), prod = q('#op').value === 'P'; q('#nv').textContent = n;
      p = Math.min(n - lo + 1, p + dt * 1.1);
      const terms = [], run = []; let acc = prod ? 1 : 0;
      for (let i = lo; i <= n; i++) { const t = fn({ i, n }); terms.push(t); acc = prod ? acc * t : acc + t; run.push(acc); }
      const C = IB.col(), g = c.ctx, L = terms.length, pad = { l: 40, r: 10, t: 14, b: 24 };
      g.clearRect(0, 0, c.w, c.h);
      const show = Math.floor(p);
      const vals = [...terms, ...run].filter(Number.isFinite), hi = Math.max(1, ...vals.map(Math.abs)), lw = Math.min(0, ...vals);
      const v = IB.view(c, lo - 0.7, n + 0.7, lw * 1.1, hi * 1.1, pad); IB.axes(g, v, { noGrid: false });
      const bw = Math.min(30, v.pw / L * 0.6);
      for (let k = 0; k < L; k++) {
        if (k > show) break; const s = k < show ? 1 : IB.smooth(p - show), i = lo + k;
        g.fillStyle = C.blue; g.globalAlpha = 0.85; const h = (terms[k] - 0) * s; g.fillRect(v.X(i) - bw / 2, Math.min(v.Y(0), v.Y(h)), bw, Math.abs(v.Y(h) - v.Y(0)));
        g.globalAlpha = 1;
      }
      g.strokeStyle = C.orange; g.lineWidth = 3; g.beginPath();
      for (let k = 0; k <= Math.min(show, L - 1); k++) { const i = lo + k; k ? g.lineTo(v.X(i), v.Y(run[k])) : g.moveTo(v.X(i), v.Y(run[k])); } g.stroke();
      for (let k = 0; k <= Math.min(show, L - 1); k++) { g.fillStyle = C.orange; g.beginPath(); g.arc(v.X(lo + k), v.Y(run[k]), 4, 0, 7); g.fill(); }
      g.fillStyle = C.muted; g.font = '11px sans-serif'; g.textAlign = 'left'; g.fillText(`■ term t(i)   ● running ${prod ? 'product' : 'total'}`, v.pad.l + 6, 12);
      const sym = prod ? ' × ' : ' + ';
      q('#o').innerHTML = `<span class="m">${prod ? 'Π' : 'Σ'} from i=${lo} to ${n} of ${q('#e').value}</span>\n` + terms.slice(0, 12).map((t) => IB.fmt(t, 3)).join(sym) + ` = <b class="o">${IB.fmt(acc, 5)}</b>`;
    });
  };

  /* ---------- draggable 2-D vectors ---------- */
  IB.labs.vec2 = function (root) {
    const d = root.dataset, show = (d.show || 'dot,proj,angle').split(',');
    const { view, ctl } = IB.labShell(root, d.title || 'Drag the points', 'drag the two arrow tips',
      '<canvas style="height:380px;touch-action:none;cursor:grab"></canvas>', '<div class="readout" id="o" style="font-size:12.5px"></div><div class="caption">Drag the blue or orange arrow tip anywhere.</div>');
    const q = (s) => IB.$(s, root), cv = IB.$('canvas', view), c = IB.canvas(cv), R = 5;
    const A = { x: +(d.ax || 3), y: +(d.ay || 1.5) }, B = { x: +(d.bx || 1), y: +(d.by || 3) };
    let drag = null;
    const toW = (e) => { const r = cv.getBoundingClientRect(), s = Math.min(c.w, c.h) / (2 * R); return { x: (e.clientX - r.left - c.w / 2) / s, y: -(e.clientY - r.top - c.h / 2) / s }; };
    cv.addEventListener('pointerdown', (e) => { const p = toW(e), da = Math.hypot(p.x - A.x, p.y - A.y), db = Math.hypot(p.x - B.x, p.y - B.y); drag = da < db ? A : B; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; Object.assign(drag, p); });
    cv.addEventListener('pointermove', (e) => { if (drag) Object.assign(drag, toW(e)); });
    cv.addEventListener('pointerup', () => { drag = null; cv.style.cursor = 'grab'; });
    IB.loop(root, () => {
      const C = IB.col(), g = c.ctx, s = Math.min(c.w, c.h) / (2 * R), ox = c.w / 2, oy = c.h / 2, P = (x, y) => [ox + x * s, oy - y * s];
      g.clearRect(0, 0, c.w, c.h); g.lineWidth = 1; g.strokeStyle = C.border;
      for (let i = -R; i <= R; i++) { g.beginPath(); g.moveTo(...P(i, -R)); g.lineTo(...P(i, R)); g.moveTo(...P(-R, i)); g.lineTo(...P(R, i)); g.stroke(); }
      g.strokeStyle = C.muted; g.beginPath(); g.moveTo(...P(-R, 0)); g.lineTo(...P(R, 0)); g.moveTo(...P(0, -R)); g.lineTo(...P(0, R)); g.stroke();
      const dot = A.x * B.x + A.y * B.y, na = Math.hypot(A.x, A.y), nb = Math.hypot(B.x, B.y), cosv = dot / (na * nb || 1), ang = Math.acos(IB.clamp(cosv, -1, 1));
      const k = nb ? dot / (nb * nb) : 0, pr = { x: k * B.x, y: k * B.y };
      if (show.includes('proj')) { g.strokeStyle = C.muted; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(...P(A.x, A.y)); g.lineTo(...P(pr.x, pr.y)); g.stroke(); g.setLineDash([]); IB.arrow(g, ...P(0, 0), ...P(pr.x, pr.y), C.green, 4); }
      if (show.includes('dist')) { g.strokeStyle = C.red; g.lineWidth = 2; g.beginPath(); g.moveTo(...P(A.x, A.y)); g.lineTo(...P(B.x, B.y)); g.stroke(); }
      if (show.includes('angle')) { g.strokeStyle = C.purple; g.lineWidth = 2.5; g.beginPath(); const a0 = -Math.atan2(A.y, A.x), a1 = -Math.atan2(B.y, B.x); g.arc(ox, oy, 32, a0, a1, ((a1 - a0 + 4 * Math.PI) % (2 * Math.PI)) > Math.PI); g.stroke(); }
      IB.arrow(g, ...P(0, 0), ...P(A.x, A.y), C.blue, 3); IB.arrow(g, ...P(0, 0), ...P(B.x, B.y), C.orange, 3);
      g.fillStyle = C.blue; g.beginPath(); g.arc(...P(A.x, A.y), 8, 0, 7); g.fill(); g.fillStyle = C.orange; g.beginPath(); g.arc(...P(B.x, B.y), 8, 0, 7); g.fill();
      g.font = '600 13px sans-serif'; g.fillStyle = C.blue; g.fillText('a', ...P(A.x, A.y).map((v, i) => v + (i ? -12 : 12))); g.fillStyle = C.orange; g.fillText('b', ...P(B.x, B.y).map((v, i) => v + (i ? -12 : 12)));
      let t = `a = (${IB.fmt(A.x, 2)}, ${IB.fmt(A.y, 2)})   b = (${IB.fmt(B.x, 2)}, ${IB.fmt(B.y, 2)})\n`;
      if (show.includes('dot')) t += `a·b = ${IB.fmt(A.x, 2)}×${IB.fmt(B.x, 2)} + ${IB.fmt(A.y, 2)}×${IB.fmt(B.y, 2)} = <b class="o">${IB.fmt(dot, 3)}</b>\n`;
      if (show.includes('norm')) t += `|a| = ${IB.fmt(na, 3)}   |b| = ${IB.fmt(nb, 3)}\n`;
      if (show.includes('angle')) t += `cos θ = a·b / (|a||b|) = <b class="b">${IB.fmt(cosv, 3)}</b>\nθ = ${IB.fmt((ang * 180) / Math.PI, 1)}°\n`;
      if (show.includes('proj')) t += `projection of a on b = ${IB.fmt(k, 3)}·b = (${IB.fmt(pr.x, 2)}, ${IB.fmt(pr.y, 2)})  <span class="g">green</span>\n`;
      if (show.includes('dist')) t += `distance |a−b| = <b class="r">${IB.fmt(Math.hypot(A.x - B.x, A.y - B.y), 3)}</b>  <span class="m">(red segment)</span>\n`;
      q('#o').innerHTML = t;
    });
  };

  /* ---------- decode an equation, piece by piece ----------
   * <div data-lab="decode"><script type="application/json">{"title":"...","parts":[{"tex":"\frac1N","say":"..."}],"code":"..."}</script></div> */
  IB.labs.decode = function (root) {
    const cfg = JSON.parse(IB.$('script', root).textContent);
    root.classList.add('lab');
    root.innerHTML = `<div class="lab-head"><i class="live-dot"></i><b>${cfg.title || 'Decode the equation'}</b><span>click each piece</span></div>
      <div style="padding:16px"><div class="chips" id="parts" style="gap:10px;font-size:18px"></div>
      <div class="readout" id="say" style="margin-top:14px;white-space:pre-wrap;font-family:inherit;font-size:14px;min-height:3.5em"></div>
      ${cfg.code ? `<div class="caption" style="margin-top:12px">The same thing as code:</div><pre style="margin-top:4px"><code>${cfg.code.replace(/</g, '&lt;')}</code></pre>` : ''}</div>`;
    const box = IB.$('#parts', root), say = IB.$('#say', root);
    cfg.parts.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'chip'; b.style.fontSize = '18px'; b.style.padding = '4px 12px';
      if (window.katex) window.katex.render(p.tex, b, { throwOnError: false }); else b.textContent = p.tex;
      b.onclick = () => { IB.$$('.chip', box).forEach((x) => (x.style.borderColor = '')); b.style.borderColor = 'var(--blue)'; say.innerHTML = p.say; };
      box.appendChild(b); if (i === 0) b.click();
    });
  };
})();
