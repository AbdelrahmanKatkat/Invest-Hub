/* Page shell: header, topbar, sidebar, outline, search, progress, theme, notes. Runs on every page. */
(async function () {
  const H = window.HUB, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.topic || 'home';
  const modIdx = document.body.dataset.module;
  // Topics with a module curriculum name their generated data file (topic.curriculum -> window.<ID>_MODULES).
  // Load any that this page did not include, then flatten lessons into sections so progress/search work for every topic.
  const loadScript = (src) => new Promise((ok) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = s.onerror = ok; document.head.appendChild(s); });
  await Promise.all(H.topics.filter((t) => t.curriculum).map((t) => loadScript(t.curriculum)));
  H.topics.forEach((t) => {
    const mods = window[t.id.toUpperCase() + '_MODULES'];
    if (mods) { t.modules = mods; t.sections = mods.flatMap((m) => m.lessons.map((l) => ({ ...l, href: m.href }))); }
  });
  const curT = H.topics.find((t) => t.id === page);
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('investhub:' + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('investhub:' + k, JSON.stringify(v)); } catch (e) { /* storage blocked: progress just won't persist */ } },
  };

  // theme
  const THEMES = ['dark', 'light', 'neon'], THEME_ICON = { dark: '🌙', light: '☀️', neon: '⚡' }, THEME_NAME = { dark: 'Dark', light: 'Light', neon: 'Neon' };
  const setTheme = (t) => { document.documentElement.dataset.theme = t; store.set('theme', t); window.dispatchEvent(new Event('themechange')); };
  const savedTheme = store.get('theme', 'dark');
  document.documentElement.dataset.theme = THEMES.includes(savedTheme) ? savedTheme : 'dark';

  // progress
  const progress = store.get('progress', {});
  const live = H.topics.filter((t) => t.status === 'live');
  const pct = (t) => { const s = t.sections || []; if (!s.length) return 0; const d = s.filter((x) => progress[t.id + ':' + x.id]).length; return Math.round((100 * d) / s.length); };
  const total = () => { const all = live.flatMap((t) => (t.sections || []).map((s) => t.id + ':' + s.id)); return all.length ? Math.round((100 * all.filter((k) => progress[k]).length) / all.length) : 0; };

  // header
  $('#hdr').innerHTML = `
    <button class="btn" id="menu-btn" aria-label="Menu">☰</button>
    <a class="brand" href="index.html">
      <svg viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#d29922"/><path d="M6 21l6-7 4 4 9-11" stroke="#10121f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 7h5v5" stroke="#10121f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span><b>Invest <span style="color:var(--yellow)">Buddy</span></b><small>Learn · Analyze · Invest · Grow</small></span></a>
    <div class="search"><input id="q" placeholder="Search paths, concepts, formulas…" autocomplete="off"><kbd>Ctrl K</kbd><div class="results" id="res"></div></div>
    <div class="hdr-actions">
      <a class="btn hide-sm" href="${H.repo}" target="_blank" rel="noopener">GitHub</a>
      <span class="btn" id="prog" title="Overall progress"></span>
      <button class="btn" id="theme" aria-label="Toggle theme"></button>
    </div>`;
  const themeBtn = $('#theme'), curTheme = () => document.documentElement.dataset.theme, nextTheme = () => THEMES[(THEMES.indexOf(curTheme()) + 1) % THEMES.length];
  const icon = () => { themeBtn.textContent = THEME_ICON[curTheme()]; themeBtn.title = `Theme: ${THEME_NAME[curTheme()]}. Click for ${THEME_NAME[nextTheme()]}.`; themeBtn.setAttribute('aria-label', themeBtn.title); };
  icon(); themeBtn.onclick = () => { setTheme(nextTheme()); icon(); };

  // topbar: the wide quick-nav row under the header (Paths is live; the rest are previews of planned areas)
  const TOPBAR = [
    { t: 'Paths', ico: '🎓', href: 'index.html#topics', on: true },
    { t: 'Markets', ico: '📈', href: 'index.html#markets-widget', on: true },
    { t: 'Portfolio', ico: '🧮', href: 'index.html#portfolio-widget', on: true },
    { t: 'Research', ico: '📄', on: false }, { t: 'News', ico: '🗞️', on: false }, { t: 'Tools', ico: '🛠️', on: false }, { t: 'Community', ico: '👥', on: false },
  ];
  const top = document.createElement('nav'); top.id = 'topbar';
  top.innerHTML = TOPBAR.map((b) => b.on ? `<a href="${b.href}"><i>${b.ico}</i>${b.t}</a>` : `<span class="soon" title="Planned — not built yet"><i>${b.ico}</i>${b.t}</span>`).join('');
  $('.app')?.prepend(top);

  // sidebar
  const side = $('#side');
  const subnav = (t) => {
    if (!t.modules) return `<div class="subnav">${(t.sections || []).map((s) => `<a href="#${s.id}">${s.t}</a>`).join('')}</div>`;
    return `<div class="subnav">${t.modules.map((m) => {
      const here = String(m.n) === modIdx, done = m.lessons.filter((l) => progress[t.id + ':' + l.id]).length;
      return `<a class="mod ${here ? 'here' : ''}" href="${m.href}">${m.n}. ${m.title} <small>${done}/${m.lessons.length}</small></a>`
        + (here ? m.lessons.map((l) => `<a class="les" href="#${l.id}">${l.t}</a>`).join('') : '');
    }).join('')}</div>`;
  };
  const renderSide = () => {
    side.innerHTML = `<div class="side-title">Investment learning paths</div>` + H.topics.map((t) => {
      const on = t.id === page, p = t.status === 'live' ? pct(t) : 0;
      const a = t.status === 'live'
        ? `<a class="topic ${on ? 'active' : ''} ${t.sub ? 'sub' : ''}" data-t="${t.id}" href="${t.href}">` : `<div class="topic soon" data-t="${t.id}">`;
      return `${a}<span class="ico" style="background:${t.color}26;color:${t.color}">${t.icon}</span><span class="nm">${t.title}</span>${t.status === 'live' ? `<span class="pct">${p}%</span>` : '<span class="tag">soon</span>'}${t.status === 'live' ? '</a>' : '</div>'}`
        + (on ? subnav(t) : '');
    }).join('') + `<div class="journey"><b>Your learning journey</b><div class="bar"><i style="width:${total()}%"></i></div><span style="color:var(--muted)">${total()}% of live paths complete</span></div>`;
    $('#prog').textContent = `Progress ${total()}%`;
  };
  renderSide();
  $('#menu-btn').onclick = () => side.classList.toggle('open');
  side.addEventListener('click', (e) => e.target.closest('a') && side.classList.remove('open'));

  // lessons: mark complete
  $$('section.lesson[id]').forEach((sec) => {
    const key = page + ':' + sec.id, btn = $('.mark', sec);
    if (!btn) return;
    const paint = () => { btn.textContent = progress[key] ? '✓ Completed' : 'Mark complete'; btn.classList.toggle('on', !!progress[key]); };
    paint();
    btn.onclick = () => { progress[key] = !progress[key]; store.set('progress', progress); paint(); renderSide(); updateHero(); };
  });

  // ---------- notes panel: Notes / Flashcards / Summary / Mind map ----------
  const NK = 'notes:' + location.pathname;
  let items = store.get(NK, []);
  const saveNotes = () => store.set(NK, items);
  const elm = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const pageTitle = () => document.title.replace(/ · Invest Buddy$/, '');
  const whereOf = (node) => {
    const el = node && (node.nodeType === 1 ? node : node.parentElement);
    const sec = el && el.closest('section[id]');
    const h = sec && sec.querySelector('h2, h3');
    return { id: sec ? sec.id : '', title: h ? h.textContent.trim().slice(0, 80) : '' };
  };
  const fab = elm('button', 'notes-fab'); fab.type = 'button';
  const drawer = elm('aside', 'notes-drawer'); drawer.hidden = true;
  drawer.innerHTML = '<div class="nd-head"><b>My notes</b><button type="button" class="nd-x" aria-label="Close notes">×</button></div>'
    + '<div class="nd-tabs"><button type="button" class="nd-tab on" data-tab="notes">Notes</button><button type="button" class="nd-tab" data-tab="flash">Flashcards</button><button type="button" class="nd-tab" data-tab="summary">Summary</button><button type="button" class="nd-tab" data-tab="mindmap">Mind Map</button></div>'
    + '<div class="nd-pane" data-pane="notes">'
    + '<div class="nd-add"><textarea rows="3" placeholder="Write a note…" aria-label="Write a note"></textarea><button type="button" class="btn small nd-add-btn">Add note</button></div>'
    + '<ul class="nd-list"></ul>'
    + '<div class="nd-foot"><small>Saved in this browser only</small><span><button type="button" class="btn-ghost nd-export">Export this page (.md)</button> <button type="button" class="btn-ghost nd-export-all">Export all pages</button></span></div>'
    + '</div>'
    + '<div class="nd-pane" data-pane="flash" hidden><div class="nd-flash-wrap"><div class="flashcard" id="fc"><div class="fc-face fc-front" id="fc-f"></div><div class="fc-face fc-back" id="fc-b" hidden></div></div></div>'
    + '<div class="nd-foot"><small id="fc-n">0 / 0</small><span><button type="button" class="btn-ghost" id="fc-prev">‹ Prev</button> <button type="button" class="btn-ghost" id="fc-flip">Flip</button> <button type="button" class="btn-ghost" id="fc-next">Next ›</button></span></div></div>'
    + '<div class="nd-pane" data-pane="summary" hidden><div class="nd-summary" id="summary-box"></div></div>'
    + '<div class="nd-pane" data-pane="mindmap" hidden><div class="nd-empty" style="padding:16px">🧩 Mind map view is planned but not built yet — it will lay out this page\'s lessons and takeaways as a graph.</div></div>';
  const selBtn = elm('button', 'notes-sel', '+ Note'); selBtn.type = 'button'; selBtn.hidden = true;
  document.body.append(fab, drawer, selBtn);
  const list = $('.nd-list', drawer), ta = $('textarea', drawer);

  // tabs
  $$('.nd-tab', drawer).forEach((tb) => tb.onclick = () => {
    $$('.nd-tab', drawer).forEach((x) => x.classList.toggle('on', x === tb));
    $$('.nd-pane', drawer).forEach((p) => (p.hidden = p.dataset.pane !== tb.dataset.tab));
    if (tb.dataset.tab === 'flash') renderFlash();
    if (tb.dataset.tab === 'summary') renderSummary();
  });

  const render = () => {
    fab.textContent = '📝 Notes' + (items.length ? ' (' + items.length + ')' : '');
    list.textContent = '';
    if (!items.length) list.append(elm('li', 'nd-empty', 'No notes yet. Type one below, or select text on the page and press “+ Note”.'));
    items.forEach((it, i) => {
      const li = elm('li', 'nd-item ' + it.t);
      const body = it.t === 'quote' ? elm('blockquote', '', it.text.replace(/</g, '&lt;')) : elm('p', '', it.text.replace(/</g, '&lt;'));
      li.append(body);
      const meta = elm('small', 'nd-meta');
      if (it.ref) { const a = document.createElement('a'); a.href = it.ref; a.textContent = it.title || 'Go to section'; meta.append(a, ' '); }
      const del = elm('button', 'nd-del', '✕'); del.type = 'button'; del.title = 'Delete'; del.dataset.i = i;
      meta.append(del); li.append(meta); list.append(li);
    });
  };
  const addItem = (it) => { items.push({ ...it, ts: Date.now() }); saveNotes(); render(); };
  const setOpen = (on) => { drawer.hidden = !on; if (on) { render(); ta.focus(); } };
  fab.onclick = () => setOpen(drawer.hidden);
  $('.nd-x', drawer).onclick = () => setOpen(false);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  $('.nd-add-btn', drawer).onclick = () => { const v = ta.value.trim(); if (!v) return; addItem({ t: 'note', text: v }); ta.value = ''; };
  list.onclick = (e) => { const b = e.target.closest('.nd-del'); if (!b) return; items.splice(+b.dataset.i, 1); saveNotes(); render(); };
  window.addEventListener('storage', (e) => { if (e.key === 'investhub:' + NK) { items = store.get(NK, []); render(); } });

  // selected text -> "+ Note" button
  const main = $('main') || document.body;
  let selText = '', selWhere = null;
  const hideSel = () => { selBtn.hidden = true; };
  document.addEventListener('mouseup', () => setTimeout(() => {
    const s = window.getSelection(), txt = s && s.toString().trim();
    if (!txt || txt.length < 3 || !s.rangeCount || drawer.contains(s.anchorNode) || !main.contains(s.anchorNode)) return hideSel();
    const r = s.getRangeAt(0).getBoundingClientRect();
    selText = txt.slice(0, 2000); selWhere = whereOf(s.anchorNode);
    selBtn.style.top = Math.max(8, r.top - 40) + 'px'; selBtn.style.left = Math.max(8, r.left) + 'px';
    selBtn.hidden = false;
  }, 0));
  window.addEventListener('scroll', hideSel, { passive: true });
  selBtn.addEventListener('mousedown', (e) => e.preventDefault());
  selBtn.onclick = () => {
    addItem({ t: 'quote', text: selText, title: selWhere.title, ref: selWhere.id ? location.pathname + '#' + selWhere.id : location.pathname });
    hideSel(); window.getSelection().removeAllRanges(); setOpen(true);
  };

  // export as Markdown
  const mdFor = (title, its) => `# Notes · ${title}\n\n` + (its.length
    ? its.map((it) => it.t === 'quote' ? `> ${it.text.replace(/\n/g, '\n> ')}` + (it.title ? `\n\n— ${it.title}` : '') : `- ${it.text.replace(/\n/g, '\n  ')}`).join('\n\n')
    : '_No notes yet._') + '\n';
  const download = (name, text) => {
    const a = elm('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('.nd-export', drawer).onclick = () => download(location.pathname.split('/').pop().replace(/\.html$/, '') + '-notes.md', mdFor(pageTitle(), items));
  $('.nd-export-all', drawer).onclick = () => {
    const all = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('investhub:notes:')) continue;
      try { const its = JSON.parse(localStorage.getItem(k)) || []; if (its.length) all.push(mdFor(k.slice('investhub:notes:'.length), its)); } catch (e) { /* skip unreadable entry */ }
    }
    download('invest-buddy-notes.md', all.length ? all.join('\n---\n\n') : '# Notes\n\n_No notes yet._\n');
  };

  // Flashcards: built from every <div class="takeaways"> li on the current page — real content, not invented
  let flashDeck = [], flashI = 0, flashShown = 'front';
  const buildDeck = () => {
    flashDeck = [];
    $$('section.lesson[id]').forEach((sec) => {
      const h2 = sec.querySelector('.lesson-head h2'), title = h2 ? h2.textContent.trim() : '';
      $$('.takeaways li', sec).forEach((li) => flashDeck.push({ front: title, back: li.textContent.trim() }));
    });
    flashI = 0;
  };
  const paintFlash = () => {
    const f = $('#fc-f', drawer), b = $('#fc-b', drawer), n = $('#fc-n', drawer);
    if (!flashDeck.length) { f.textContent = 'No takeaways on this page yet.'; b.textContent = ''; n.textContent = '0 / 0'; return; }
    const card = flashDeck[flashI];
    f.textContent = card.front || pageTitle(); b.textContent = card.back;
    f.hidden = flashShown !== 'front'; b.hidden = flashShown !== 'back';
    n.textContent = (flashI + 1) + ' / ' + flashDeck.length;
  };
  const renderFlash = () => { buildDeck(); flashShown = 'front'; paintFlash(); };
  $('#fc', drawer).onclick = () => { flashShown = flashShown === 'front' ? 'back' : 'front'; paintFlash(); };
  $('#fc-flip', drawer).onclick = () => { flashShown = flashShown === 'front' ? 'back' : 'front'; paintFlash(); };
  $('#fc-prev', drawer).onclick = () => { if (flashDeck.length) { flashI = (flashI - 1 + flashDeck.length) % flashDeck.length; flashShown = 'front'; paintFlash(); } };
  $('#fc-next', drawer).onclick = () => { if (flashDeck.length) { flashI = (flashI + 1) % flashDeck.length; flashShown = 'front'; paintFlash(); } };

  // Summary: a plain-text extractive summary built from this page's own "question" + "takeaways" blocks (no invented claims)
  const renderSummary = () => {
    const box = $('#summary-box', drawer);
    const parts = [];
    $$('section.lesson[id]').forEach((sec) => {
      const h2 = sec.querySelector('.lesson-head h2'), q = sec.querySelector('.question'), tk = $$('.takeaways li', sec).map((li) => li.textContent.trim());
      if (!h2) return;
      parts.push(`<h5>${h2.textContent.trim()}</h5>` + (q ? `<p>${q.textContent.replace(/^The question/, '').trim()}</p>` : '') + (tk.length ? `<ul>${tk.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''));
    });
    box.innerHTML = parts.length ? `<p class="caption">Built from this page's own question and takeaways — not a separate AI summary.</p>` + parts.join('') : '<div class="nd-empty">This page has no lesson sections to summarise yet.</div>';
  };
  render();

  const updateHero = () => {
    const t = H.topics.find((x) => x.id === page); if (!t || !t.sections) return;
    const el = $('#hero-pct'); if (el) { el.textContent = pct(t) + '% complete'; $('#hero-bar').style.width = pct(t) + '%'; }
  };
  updateHero();

  // outline (right)
  const out = $('#outline');
  if (out) {
    const hs = $$('main section.lesson[id] h2, main h3[id]'); hs.forEach((h) => { h.dataset.t = h.id || h.closest('section').id; });
    const t = H.topics.find((x) => x.id === page), nx = t && H.topics.find((x) => x.id === t.next);
    out.innerHTML = `<h4>On this page</h4>` + hs.map((h) => `<a class="${h.tagName === 'H3' ? 'l3' : ''}" href="#${h.dataset.t}">${h.textContent}</a>`).join('')
      + (nx && nx.href ? `<div class="next"><small>Next path</small><br><a href="${nx.href}"><b>${nx.title}</b></a><br><small>${nx.desc}</small></div>` : (nx ? `<div class="next"><small>Next path (coming soon)</small><br><b>${nx.title}</b><br><small>${nx.desc}</small></div>` : ''));
    const links = new Map($$('a', out).map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove('act')); links.get(e.target.dataset.t)?.classList.add('act'); } }), { rootMargin: '-80px 0px -70% 0px' });
    hs.forEach((h) => io.observe(h));
  }

  // previous / next module
  if (modIdx !== undefined && curT && curT.modules) {
    const i = +modIdx, ms = curT.modules, prev = ms[i - 1], next = ms[i + 1];
    const nav = document.createElement('nav'); nav.className = 'modnav';
    nav.innerHTML = (prev ? `<a class="card" href="${prev.href}"><small>← Previous module</small><h3>${prev.n}. ${prev.title}</h3></a>` : '<span></span>')
      + (next ? `<a class="card" href="${next.href}" style="text-align:right"><small>Next module →</small><h3>${next.n}. ${next.title}</h3></a>` : `<a class="card" href="${curT.href}" style="text-align:right"><small>Finished</small><h3>Back to the path</h3></a>`);
    $('main').appendChild(nav);
  }

  // search
  const idx = [];
  live.forEach((t) => { idx.push({ t: t.title, s: 'Path', h: t.href, k: t.desc + ' ' + (t.tags || []).join(' ') }); (t.sections || []).forEach((s) => idx.push({ t: s.t, s: t.title, h: (s.href || t.href) + '#' + s.id, k: s.k })); });
  H.topics.filter((t) => t.status !== 'live').forEach((t) => idx.push({ t: t.title, s: 'Coming soon', h: 'index.html#topics', k: t.desc }));
  const q = $('#q'), res = $('#res');
  q.addEventListener('input', () => {
    const w = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = w.length ? idx.filter((i) => w.every((x) => (i.t + ' ' + i.s + ' ' + i.k).toLowerCase().includes(x))).slice(0, 8) : [];
    res.innerHTML = hits.map((i) => `<a href="${i.h}">${i.t} <small>· ${i.s}</small></a>`).join('') || (w.length ? '<a>No matches yet</a>' : '');
    res.classList.toggle('open', !!w.length);
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('a[href]', res)?.click(); if (e.key === 'Escape') { q.blur(); res.classList.remove('open'); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) res.classList.remove('open'); });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); q.focus(); q.select(); } });

  // curriculum module cards (path hub pages)
  const ml = $('#mod-list');
  if (ml && curT && curT.modules) ml.innerHTML = curT.modules.map((m) => {
    const done = m.lessons.filter((l) => progress[curT.id + ':' + l.id]).length;
    return `<div class="modcard"><h3><a href="${m.href}">Module ${m.n} · ${m.title}</a></h3><small style="color:var(--muted)">${m.lessons.length} lessons · ${done} completed</small><ol>${m.lessons.map((l) => `<li><a href="${m.href}#${l.id}"><i>${progress[curT.id + ':' + l.id] ? '✓' : '○'}</i>${l.t}</a></li>`).join('')}</ol></div>`;
  }).join('');
  const pb = $('#pathbar');
  if (pb && curT && curT.modules) pb.innerHTML = curT.modules.map((m) => `<a href="${m.href}"><b>${m.n}</b>${m.title}</a>`).join('');

  // topic cards on home
  const grid = $('#topic-grid');
  if (grid) grid.innerHTML = H.topics.map((t) => {
    const inner = `<span class="ico" style="background:${t.color}26;color:${t.color}">${t.icon}</span><h3>${t.title}</h3><p>${t.desc}</p><div style="margin-top:10px" class="chips">${t.status === 'live' ? (t.tags || []).slice(0, 3).map((x) => `<span class="chip">${x}</span>`).join('') + `<span class="badge live">live · ${pct(t)}%</span>` : '<span class="badge">coming soon</span>'}</div>`;
    return t.status === 'live' ? `<a class="card" href="${t.href}">${inner}</a>` : `<div class="card soon">${inner}</div>`;
  }).join('');

  // ---------- dashboard widgets (home page): sample/illustrative data, clearly labelled, no live feed ----------
  const MARKETS = [
    { n: 'S&P 500', v: '6,812.65', ch: '+0.74%', up: true }, { n: 'NASDAQ', v: '23,389.14', ch: '+1.12%', up: true },
    { n: 'Gold', v: '2,418.30', ch: '+0.38%', up: true }, { n: 'Bitcoin', v: '68,642', ch: '−0.72%', up: false }, { n: 'Oil (Brent)', v: '84.21', ch: '−0.31%', up: false },
  ];
  const marketsEl = $('#markets-widget');
  if (marketsEl) marketsEl.innerHTML = `<div class="lab-head"><i class="live-dot" style="background:var(--muted);box-shadow:none"></i><b>Markets snapshot</b><span>sample figures for illustration — not a live feed</span></div>
    <table class="tbl" style="margin:0"><tbody>${MARKETS.map((m) => `<tr><td>${m.n}</td><td style="text-align:right">${m.v}</td><td style="text-align:right;color:${m.up ? 'var(--green)' : 'var(--red)'}">${m.ch}</td></tr>`).join('')}</tbody></table>`;

  const WATCH = [{ n: 'AAPL', v: '189.64', ch: '+1.20%' }, { n: 'TSLA', v: '267.41', ch: '+2.36%' }, { n: 'MSFT', v: '415.32', ch: '+0.88%' }];
  const watchEl = $('#watchlist-widget');
  if (watchEl) watchEl.innerHTML = `<div class="lab-head"><i class="live-dot" style="background:var(--muted);box-shadow:none"></i><b>Watchlist</b><span>sample tickers for illustration</span></div>
    <table class="tbl" style="margin:0"><tbody>${WATCH.map((m) => `<tr><td>${m.n}</td><td style="text-align:right">${m.v}</td><td style="text-align:right;color:var(--green)">${m.ch}</td></tr>`).join('')}</tbody></table>`;

  const NOTES_SAMPLE = ['A rising CPI print tends to raise expectations of higher interest rates, which usually pressures long-duration growth stocks more than value stocks.',
    'A weaker dollar tends to help commodity prices and the earnings of exporters, all else equal.', 'Earnings season concentrates volatility: a single company\'s report can move the whole sector it belongs to.'];
  const insightsEl = $('#insights-widget');
  if (insightsEl) insightsEl.innerHTML = `<div class="lab-head"><b>Things worth understanding</b><span>general, illustrative — not advice on any specific security</span></div>
    <ul style="margin:0;padding:14px 16px 14px 32px">${NOTES_SAMPLE.map((n) => `<li style="margin:6px 0">${n}</li>`).join('')}</ul>`;

  const ALERTS = ['CPI release tomorrow (sample date)', 'Earnings season begins in 3 days (sample date)'];
  const alertsEl = $('#alerts-widget');
  if (alertsEl) alertsEl.innerHTML = `<div class="lab-head"><b>Alerts</b><span>sample reminders for illustration</span></div>
    <ul style="margin:0;padding:14px 16px 14px 32px">${ALERTS.map((a) => `<li style="margin:6px 0">${a}</li>`).join('')}</ul>`;

  // equations + labs
  const ready = () => {
    $$('.eq,.tex').forEach((el) => { if (window.katex) { try { window.katex.render(el.textContent, el, { displayMode: el.classList.contains('eq'), throwOnError: false }); } catch (e) { /* leave raw TeX */ } } });
    const fitMath = () => {
      const els = $$('.tex'), flags = els.map((el) => { el.classList.remove('wide'); const b = el.closest('p,li,td,th,div,section'); return !!b && el.getBoundingClientRect().width > b.clientWidth + 1; });
      els.forEach((el, i) => { if (flags[i]) el.classList.add('wide'); });
    };
    fitMath(); window.addEventListener('resize', () => { clearTimeout(fitMath.t); fitMath.t = setTimeout(fitMath, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMath);
    $$('[data-lab]').forEach((el) => { try { IB.labs[el.dataset.lab](el); } catch (e) { el.textContent = 'Lab failed to load: ' + e.message; console.error(e); } });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();

  // neon theme: geometric heading font (loaded only while neon is active) and one highlighted word in the page title
  const ensureFont = () => {
    if (document.documentElement.dataset.theme !== 'neon' || document.getElementById('neon-font')) return;
    const l = document.createElement('link'); l.id = 'neon-font'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap'; document.head.appendChild(l);
  };
  ensureFont(); window.addEventListener('themechange', ensureFont);
  const h1 = $('.hero h1');
  if (h1 && !h1.children.length) {
    const t = h1.textContent, dot = t.indexOf(' · '), dash = t.indexOf(' — ');
    let a = '', b = t, c = '';
    if (dot >= 0) { a = t.slice(0, dot + 3); b = t.slice(dot + 3); }
    else if (dash >= 0) { b = t.slice(0, dash); c = t.slice(dash); }
    const m = /^(.*\s)?(\S+)$/.exec(b);
    if (m) { h1.textContent = ''; h1.append(a, m[1] || '', Object.assign(document.createElement('span'), { className: 'hl', textContent: m[2] }), c); }
  }
})();
