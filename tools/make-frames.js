// Generates the panel frames and the neon theme CSS and writes them into assets/style.css between the markers
//   /* @@FRAMES-START */ ... /* @@FRAMES-END */
// Frames are nine-slice SVG border images: chamfered (cut) corners, a diagonal gradient outline and a baked-in glow, so they
// work on scrolling panels and cost nothing while labs animate. One set per theme (dark, light, neon).
// Run from the repo root:   node tools/make-frames.js
const fs = require('fs');

// frame image: G = glow margin, cuts = [top-left, top-right, bottom-right, bottom-left] chamfer sizes, sw = outline width
function frame({ G, cuts, sw, fill, stops, glow, blur, glowW }) {
  const maxCut = Math.max(...cuts), slice = G + maxCut + 2, size = slice * 2 + 16, L = G, R = size - G, T = G, B = size - G;
  const [a, b, c, d] = cuts;
  const pts = [[L + a, T], [R - b, T], [R, T + b], [R, B - c], [R - c, B], [L + d, B], [L, B - d], [L, T + a]].map((p) => p.join(',')).join(' ');
  const gradient = `<linearGradient id='g' gradientUnits='userSpaceOnUse' x1='${L}' y1='${T}' x2='${R}' y2='${B}'>${stops.map(([o, col]) => `<stop offset='${o}' stop-color='${col}'/>`).join('')}</linearGradient>`;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><defs>${gradient}<filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='${blur}'/></filter></defs>`
    + `<polygon points='${pts}' fill='${fill}'/>`
    + (glow ? `<polygon points='${pts}' fill='none' stroke='url(#g)' stroke-width='${glowW}' opacity='${glow}' filter='url(#b)'/>` : '')
    + `<polygon points='${pts}' fill='none' stroke='url(#g)' stroke-width='${sw}' stroke-linejoin='miter'/></svg>`;
  return { url: `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}")`, slice, G };
}

const NEON = { fill: 'rgba(3,8,28,0.88)', cyan: '#00e5ff', mag: '#ff2bd6', yel: '#ffe600', ora: '#ffb000' };
const themes = {
  dark: {
    panel: { G: 5, cuts: [14, 6, 14, 6], sw: 1.4, fill: '#10151d', stops: [[0, '#d29922'], [0.16, '#39c5cf'], [0.46, '#2f81f7'], [0.7, '#a371f7'], [1, '#a371f7']], glow: 0.3, blur: 2, glowW: 3 },
    hot: { G: 5, cuts: [14, 6, 14, 6], sw: 1.6, fill: '#10151d', stops: [[0, '#d29922'], [1, '#2f81f7']], glow: 0.35, blur: 2, glowW: 3 },
    act: { G: 4, cuts: [9, 9, 9, 9], sw: 1.4, fill: '#1b2230', stops: [[0, '#2f81f7'], [1, '#39c5cf']], glow: 0.35, blur: 2, glowW: 3 },
    sm: { G: 2, cuts: [5, 3, 5, 3], sw: 1.1, fill: '#161b22', stops: [[0, '#39c5cf'], [0.5, '#30363d'], [1, '#a371f7']], glow: 0, blur: 1, glowW: 2 },
  },
  light: {
    panel: { G: 5, cuts: [14, 6, 14, 6], sw: 1.4, fill: '#ffffff', stops: [[0, '#9a6700'], [0.16, '#1b7c83'], [0.46, '#0969da'], [0.7, '#8250df'], [1, '#8250df']], glow: 0.18, blur: 2, glowW: 3 },
    hot: { G: 5, cuts: [14, 6, 14, 6], sw: 1.6, fill: '#ffffff', stops: [[0, '#bf8700'], [1, '#0969da']], glow: 0.22, blur: 2, glowW: 3 },
    act: { G: 4, cuts: [9, 9, 9, 9], sw: 1.4, fill: '#eaf2ff', stops: [[0, '#0969da'], [1, '#1b7c83']], glow: 0.22, blur: 2, glowW: 3 },
    sm: { G: 2, cuts: [5, 3, 5, 3], sw: 1.1, fill: '#f6f8fa', stops: [[0, '#1b7c83'], [0.5, '#d0d7de'], [1, '#8250df']], glow: 0, blur: 1, glowW: 2 },
  },
  neon: {
    panel: { G: 11, cuts: [16, 8, 16, 8], sw: 2, fill: NEON.fill, stops: [[0, NEON.yel], [0.16, NEON.cyan], [0.46, NEON.cyan], [0.64, NEON.mag], [1, NEON.mag]], glow: 0.95, blur: 3.2, glowW: 5 },
    hot: { G: 11, cuts: [16, 8, 16, 8], sw: 2.2, fill: NEON.fill, stops: [[0, NEON.yel], [0.5, NEON.yel], [1, NEON.ora]], glow: 0.95, blur: 3.2, glowW: 5 },
    act: { G: 7, cuts: [11, 11, 11, 11], sw: 2, fill: 'rgba(3,8,28,0.92)', stops: [[0, NEON.yel], [1, NEON.yel]], glow: 1, blur: 2.6, glowW: 4.5 },
    sm: { G: 4, cuts: [6, 3, 6, 3], sw: 1.3, fill: 'rgba(3,8,28,0.62)', stops: [[0, NEON.cyan], [0.55, '#1a8fc0'], [1, NEON.mag]], glow: 0.7, blur: 1.6, glowW: 3 },
  },
};

const sel = {
  panel: '#side,#outline,.lab,.pipe,.modcard,.card,.journey,.notes-drawer',
  hot: '.hero',
  sm: '.question,.takeaways,.eq,.try,.callout,.worked,.realhook,.trap',
};
const vars = (name) => Object.entries(themes[name]).map(([k, v]) => `--fr-${k}:${frame(v).url};`).join('\n  ');
const sizes = Object.fromEntries(Object.keys(themes).map((t) => [t, Object.fromEntries(Object.keys(themes[t]).map((k) => [k, frame(themes[t][k])]))]));
const sizeVars = (t) => Object.keys(sizes[t]).map((k) => `--fr-${k}-s:${sizes[t][k].slice};--fr-${k}-g:${sizes[t][k].G}px;`).join('');

// line-icon outlines for the neon sidebar (one per live topic id in assets/topics.js)
const ICONS = {
  fundamentals: "<path d='M12 3l2.5 5.5L20 10l-5 4 1.3 6-4.3-3-4.3 3L8.8 14l-5-4 5.6-1.5z'/>",
  economics: "<circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18'/>",
  markets: "<path d='M4 21V10M9 21V4M14 21v-8M19 21v-5M3 21h18'/>",
  assets: "<rect x='3.5' y='9.5' width='7' height='7'/><rect x='13.5' y='9.5' width='7' height='7'/><rect x='8.5' y='3.5' width='7' height='7'/>",
  fundamental: "<circle cx='10.5' cy='10.5' r='6.5'/><path d='M15.3 15.3L21 21'/>",
  technical: "<path d='M4 17l5-6 4 3 7-9'/><path d='M14 5h6v6'/>",
  behavioral: "<path d='M9 3a4 4 0 00-4 4v2a4 4 0 00-2 3.5A3.5 3.5 0 006 16a4 4 0 004 4h4a4 4 0 004-4 3.5 3.5 0 00-2-3.5V7a4 4 0 00-4-4z'/><path d='M9 10v4M15 10v4'/>",
  strategies: "<path d='M12 3v4M8 7h8l-2 4 2 4H8l2-4z'/><path d='M8 21h8M12 15v6'/>",
  portfolio: "<path d='M3.5 7.5L12 3l8.5 4.5L12 12z'/><path d='M3.5 7.5V16L12 20.5 20.5 16V7.5M12 12v8.5'/>",
  risk: "<path d='M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'/>",
  global: "<path d='M4 6h16v11H9.5L4 20z'/><path d='M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01'/>",
  quant: "<rect x='3' y='4' width='18' height='16' rx='1.5'/><path d='M3 9h18M8 4v16'/><path d='M12 13h4M12 16h4M5 13h.01M5 16h.01'/>",
};
const iconCss = Object.entries(ICONS).map(([id, d]) => `:root[data-theme="neon"] .topic[data-t="${id}"] .ico{--icn:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'>${d}</svg>`)}")}`).join('\n');

const css = `/* @@FRAMES-START (generated by tools/make-frames.js: do not edit by hand) */
:root{
  ${vars('dark')}
  ${sizeVars('dark')}
  --stage-fill:#0d1117;
}
:root[data-theme="light"]{
  ${vars('light')}
  ${sizeVars('light')}
  --stage-fill:#ffffff;
}
:root[data-theme="neon"]{
  --bg:#050914;--bg2:#0a1030;--bg3:#141a46;--border:#1b6a8f;--fg:#f2f8ff;--muted:#9db9d8;
  --blue:#00e5ff;--green:#35ffa5;--purple:#b266ff;--orange:#ff9a1f;--yellow:#ffe600;--red:#ff4d73;--pink:#ff2bd6;--teal:#00f0e0;
  --link:#35e0ff;--btn-green:#ffe600;--shadow:0 10px 30px rgba(0,0,0,.75);
  ${vars('neon')}
  ${sizeVars('neon')}
  --stage-fill:rgba(3,8,28,.93);
}

/* panel frames: chamfered corners, gradient outline, glow (images above; borders are drawn by the image, not by CSS) */
${sel.panel}{border:2px solid transparent;border-radius:0;background:none;border-image:var(--fr-panel) var(--fr-panel-s) fill / calc(var(--fr-panel-s) * 1px) / var(--fr-panel-g) stretch}
${sel.hot}{border:2px solid transparent;border-radius:0;background:none;border-image:var(--fr-hot) var(--fr-hot-s) fill / calc(var(--fr-hot-s) * 1px) / var(--fr-hot-g) stretch;padding:20px 26px;margin-left:var(--fr-hot-g);margin-right:var(--fr-hot-g)}
${sel.sm}{border:1.5px solid transparent;border-radius:0;border-image:var(--fr-sm) var(--fr-sm-s) fill / calc(var(--fr-sm-s) * 1px) / var(--fr-sm-g) stretch;background-color:transparent}
.worked{box-shadow:inset 3px 0 0 var(--green)}.realhook{box-shadow:inset 3px 0 0 var(--purple)}.trap{box-shadow:inset 3px 0 0 var(--red)}.callout{box-shadow:inset 3px 0 0 var(--blue)}.callout.warn{box-shadow:inset 3px 0 0 var(--yellow)}
.question{background-color:color-mix(in srgb,var(--blue) 7%,transparent)}
.topic.active{border:2px solid transparent;border-radius:0;background:none;border-image:var(--fr-act) var(--fr-act-s) fill / calc(var(--fr-act-s) * 1px) / var(--fr-act-g) stretch}
/* the sidebar and outline keep their mobile behaviour (overlay) below 861px */
/* sidebar and outline are floating framed panels on wide screens, offset below the header + topbar */
@media(min-width:861px){
  #side,#outline{top:110px;height:calc(100vh - 122px);margin:12px 0 12px 12px}
  #outline{margin:12px 12px 12px 0}
}
/* every lesson section is a framed panel; the page art shows in the gaps (inline styles on hub sections are overridden) */
.lesson{border-width:2px!important;border-style:solid!important;border-color:transparent!important;border-radius:0;background:none!important;border-image:var(--fr-panel) var(--fr-panel-s) fill / calc(var(--fr-panel-s) * 1px) / var(--fr-panel-g) stretch!important;padding:22px 28px!important;margin:26px var(--fr-panel-g)!important}
.lesson.lesson .lesson-head{margin-top:0}
/* pipeline stage cards: each has its own colour, chamfered outline and glow */
.stage{position:relative;isolation:isolate;background:none;border:0;border-radius:0;padding:12px 14px;filter:drop-shadow(0 0 4px color-mix(in srgb,var(--c) 55%,transparent));transition:filter .25s,transform .25s}
.stage::before{content:"";position:absolute;inset:0;z-index:-2;background:var(--c);clip-path:polygon(11px 0,calc(100% - 5px) 0,100% 5px,100% calc(100% - 11px),calc(100% - 11px) 100%,5px 100%,0 calc(100% - 5px),0 11px)}
.stage::after{content:"";position:absolute;inset:2px;z-index:-1;background:var(--stage-fill);clip-path:polygon(10px 0,calc(100% - 4px) 0,100% 4px,100% calc(100% - 10px),calc(100% - 10px) 100%,4px 100%,0 calc(100% - 4px),0 10px)}
.stage:hover{filter:drop-shadow(0 0 7px color-mix(in srgb,var(--c) 80%,transparent))}
.stage.active{box-shadow:none;filter:drop-shadow(0 0 11px var(--c));transform:translateY(-2px)}
.stage.pinned{border-color:transparent}

/* header: a gradient line under the bar */
#hdr{border-bottom:2px solid transparent;border-image:linear-gradient(90deg,var(--yellow),var(--teal) 16%,var(--blue) 60%,var(--pink)) 1;box-shadow:0 6px 18px -10px color-mix(in srgb,var(--teal) 60%,transparent)}
#topbar{border-bottom-color:rgba(0,229,255,.18)}

/* ===== neon theme ===== */
:root[data-theme="neon"] body{background:#050914}
:root[data-theme="neon"] body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(rgba(4,6,20,.30),rgba(4,6,20,.30)),url(neon-skyline.jpg) center/cover no-repeat}
:root[data-theme="neon"] .app,:root[data-theme="neon"] footer{position:relative;z-index:1}
:root[data-theme="neon"] #hdr{background:rgba(3,8,28,.9);box-shadow:0 8px 26px -10px rgba(0,229,255,.8)}
:root[data-theme="neon"] #topbar{background:rgba(3,8,28,.78)}
:root[data-theme="neon"] h1,:root[data-theme="neon"] h2{text-shadow:0 0 16px rgba(0,229,255,.35)}
:root[data-theme="neon"] .hero h1 .hl,:root[data-theme="neon"] .lesson-head h2 .hl{color:var(--yellow);font-style:italic;text-shadow:0 0 14px rgba(255,230,0,.5)}
:root[data-theme="neon"] .chip{background:rgba(3,8,28,.72);border-color:rgba(0,229,255,.6);box-shadow:0 0 8px rgba(0,229,255,.25)}
:root[data-theme="neon"] .btn{background:rgba(3,8,28,.8);border-color:rgba(0,229,255,.55)}
:root[data-theme="neon"] .btn:hover{border-color:var(--yellow);box-shadow:0 0 10px rgba(255,230,0,.45)}
:root[data-theme="neon"] .btn.primary{color:#10121f!important;border-color:transparent;background:var(--yellow);box-shadow:0 0 14px rgba(255,230,0,.55);clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,9px 100%,0 50%);padding-left:18px;padding-right:18px}
:root[data-theme="neon"] .btn.on{border-color:var(--yellow);color:var(--yellow)!important}
:root[data-theme="neon"] .topic .ico{box-shadow:0 0 9px currentColor}
:root[data-theme="neon"] .topic.active .nm{color:#fff;font-weight:600}
:root[data-theme="neon"] .bar i{background:linear-gradient(90deg,var(--teal),var(--pink));box-shadow:0 0 8px var(--pink)}
:root[data-theme="neon"] .lesson{border-top-color:rgba(0,229,255,.35)}
:root[data-theme="neon"] .tbl td,:root[data-theme="neon"] .tbl th{background:rgba(3,8,28,.7)}
:root[data-theme="neon"] .notes-fab{background:rgba(3,8,28,.9);border-color:var(--yellow);box-shadow:0 0 12px rgba(255,230,0,.5);color:var(--yellow)}

:root[data-theme="neon"] h1,:root[data-theme="neon"] h2,:root[data-theme="neon"] h3,:root[data-theme="neon"] .topic .nm,:root[data-theme="neon"] .btn,:root[data-theme="neon"] .chip,:root[data-theme="neon"] .brand b,:root[data-theme="neon"] .side-title,:root[data-theme="neon"] .lesson h3.sec{font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
:root[data-theme="neon"] .topic.active .ico{background:var(--yellow)!important;color:#10121f!important;box-shadow:0 0 10px rgba(255,230,0,.6)}
:root[data-theme="neon"] .topic[data-t] .ico{font-size:0;border-radius:0;background:currentColor!important;-webkit-mask:var(--icn) center/64% no-repeat;mask:var(--icn) center/64% no-repeat;box-shadow:none}
:root[data-theme="neon"] .topic.active[data-t] .ico{background:var(--yellow)!important;color:#10121f}
:root[data-theme="neon"] .hero .big{position:relative;background:none!important;border:0;color:var(--pink);filter:drop-shadow(0 0 8px var(--pink))}
:root[data-theme="neon"] .hero .big::before{content:"";position:absolute;inset:-7px;pointer-events:none;background:
  linear-gradient(var(--yellow),var(--yellow)) 0 0/18px 3px no-repeat,linear-gradient(var(--yellow),var(--yellow)) 0 0/3px 18px no-repeat,
  linear-gradient(var(--yellow),var(--yellow)) 100% 0/18px 3px no-repeat,linear-gradient(var(--yellow),var(--yellow)) 100% 0/3px 18px no-repeat,
  linear-gradient(var(--yellow),var(--yellow)) 0 100%/18px 3px no-repeat,linear-gradient(var(--yellow),var(--yellow)) 0 100%/3px 18px no-repeat,
  linear-gradient(var(--yellow),var(--yellow)) 100% 100%/18px 3px no-repeat,linear-gradient(var(--yellow),var(--yellow)) 100% 100%/3px 18px no-repeat}
${iconCss}

/* phone: the framed hero should not eat the width */
@media(max-width:600px){.hero{padding:14px 16px;gap:12px;margin-left:0;margin-right:0}.hero .big{width:46px;height:46px;font-size:22px;border-radius:12px}.hero h1{font-size:22px}}
/* @@FRAMES-END */`;

let s = fs.readFileSync('assets/style.css', 'utf8');
const a = s.indexOf('/* @@FRAMES-START'), b = s.indexOf('/* @@FRAMES-END */');
if (a >= 0 && b > a) s = s.slice(0, a).replace(/\s+$/, '\n') + s.slice(b + '/* @@FRAMES-END */'.length);
fs.writeFileSync('assets/style.css', s.replace(/\s+$/, '\n') + '\n' + css + '\n');
console.log('frames written; style.css', (fs.statSync('assets/style.css').size / 1024).toFixed(1) + ' KB');
