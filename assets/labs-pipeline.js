/* The animated "pipeline" lab used on the home page and every path hub page: <div data-lab="pipeline" data-id="hub"></div>.
 * Stage data comes from window.PIPELINES[data-id] (see assets/topics.js) — edit the text there, not here. */
(function () {
  IB.labs.pipeline = function (root) {
    const id = root.dataset.id || 'hub';
    const data = (window.PIPELINES && window.PIPELINES[id]) || { stages: [] };
    const stages = data.stages;
    const n = Math.max(1, stages.length);
    root.classList.add('pipe');
    root.style.setProperty('--n', n);
    root.innerHTML = `<div class="pipe-tools">
        <button type="button" class="btn small" id="play">▶ Animate Flow</button>
        <label>Speed <input type="range" id="sp" min="1" max="10" value="4" style="width:90px"></label>
        <span style="margin-left:auto">Click any stage for details</span>
      </div>
      <div class="pipe-scroll"><div class="pipe-track"><canvas></canvas>
        <div class="pipe-stages">${stages.map((s, i) => `<div class="stage" data-i="${i}" style="--c:${s.color}"><b>${s.name}</b><ul>${s.items.map((x) => `<li>${x}</li>`).join('')}</ul><code>→ ${s.out}</code></div>`).join('')}</div>
      </div></div>
      <div class="pipe-detail"><div id="desc"></div><div><h4>Compute</h4><div id="compute"></div></div><div><h4>Storage</h4><div id="storage"></div></div></div>`;
    if (!stages.length) return;
    const q = (s) => IB.$(s, root), c = IB.canvas(q('canvas')), cards = IB.$$('.stage', root);
    let playing = false, pos = 0, shown = 0;
    const showDetail = (i) => {
      const s = stages[i];
      q('#desc').innerHTML = `<b style="color:${s.color}">${s.name}</b><p style="margin:4px 0 0;color:var(--muted);font-size:13px">${s.desc}</p>`;
      q('#compute').textContent = s.compute; q('#storage').textContent = s.storage;
    };
    const paintActive = (i) => cards.forEach((card, k) => card.classList.toggle('active', k === i));
    cards.forEach((card) => card.onclick = () => {
      playing = false; q('#play').textContent = '▶ Animate Flow';
      shown = +card.dataset.i; pos = shown; paintActive(shown); showDetail(shown);
    });
    q('#play').onclick = () => { playing = !playing; q('#play').textContent = playing ? '⏸ Pause' : '▶ Animate Flow'; };
    showDetail(0); paintActive(0);
    IB.loop(root, (dt) => {
      const C = IB.col(), g = c.ctx;
      g.clearRect(0, 0, c.w, c.h);
      if (playing) {
        const speed = +q('#sp').value;
        pos = (pos + dt * speed * 0.12) % n;
        const i = Math.floor(pos);
        if (i !== shown) { shown = i; paintActive(i); showDetail(i); }
      }
      const slot = c.w / n;
      g.strokeStyle = C.border; g.lineWidth = 2; g.beginPath(); g.moveTo(slot / 2, c.h / 2); g.lineTo(c.w - slot / 2, c.h / 2); g.stroke();
      for (let i = 0; i < n; i++) { g.fillStyle = i <= pos ? stages[i].color : C.border; g.beginPath(); g.arc(slot / 2 + i * slot, c.h / 2, 5, 0, 7); g.fill(); }
      if (playing) { const x = slot / 2 + pos * slot; g.fillStyle = C.fg; g.beginPath(); g.arc(x, c.h / 2, 7, 0, 7); g.fill(); }
    });
  };
})();
