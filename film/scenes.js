/* The film's drawn scenes: how NinjaToolKit works inside, drawn by hand on canvas in the program's own visual language.
   Thread colours say where evidence came from (snapshot, telemetry, a live check, a firewall export, the engineer's
   words); marks say who acted (code a square, GLiNER a hollow bead, the decision model a diamond, Opus a ring, the
   engineer a gold knot). Every figure written in a scene is measured (the case study's facts); the flow of threads is
   the method drawn, and each scene says so. Each scene is a pure function of time, so any moment can be drawn alone.
   FilmScenes[name](g, t) draws scene `name` at t milliseconds on a 1920x1080 context. */
(function () {
'use strict';
var W = 1920, H = 1080, TAU = Math.PI * 2;
var C = {bg: '#08080A', ink: '#EAE6DE', ink2: '#BEBAB1', ink3: '#938E85', ink4: '#757068', line: '#1B1B1F', line2: '#292930',
  line3: '#3A3A42', gate: '#EDBE7F', live: '#57CBD7', snap: '#D8D1C2', tele: '#4FE3C1', check: '#7EA6FF', other: '#B49CFF',
  fw: '#E8A06E', words: '#EDBE7F', code: '#A9B1BB', gl: '#9BE7FF', jev: '#FF5C83', opus: '#EAFBF4',
  crit: '#E55050', high: '#E6803A', med: '#D0AD54', ok: '#5BB38A'};
var SANS = '"Geist", ui-sans-serif, system-ui, "Segoe UI", sans-serif', MONO = '"Geist Mono", ui-monospace, Consolas, monospace';
/* where evidence comes from, with the share a drawn thread is given (the method drawn, not a measurement) */
var SRC = [[C.snap, 0.46], [C.tele, 0.26], [C.check, 0.14], [C.fw, 0.09], [C.words, 0.05]];

/* ── the kit ──────────────────────────────────────────────────────────────────────────────────────────────────── */
function hash(a, b, c) { var x = Math.imul(a + 1, 0x9E3779B1) ^ Math.imul(b + 7, 0x85EBCA6B) ^ Math.imul((c || 0) + 13, 0xC2B2AE35);
  x ^= x >>> 15; x = Math.imul(x, 0x2C1B3C6D); x ^= x >>> 12; x = Math.imul(x, 0x297A2D39); x ^= x >>> 15; return (x >>> 0) / 4294967296; }
function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
function lerp(a, b, k) { return a + (b - a) * k; }
function k01(t, from, dur) { return clamp((t - from) / dur, 0, 1); }
function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
function eout(k) { return 1 - Math.pow(1 - k, 3); }
function pick(x, table) { var a = 0; for (var i = 0; i < table.length; i++) { a += table[i][1]; if (x < a) return i; } return table.length - 1; }
function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }
/* words typed at a steady pace, never faded in for show */
function typed(s, t, from, per) { return t < from ? '' : s.slice(0, Math.floor((t - from) / (per || 24))); }
/* a figure counted up as it is reached, then held */
function counted(n, t, from, dur, fmt) { var v = n * eout(k01(t, from, dur || 900)); return (fmt || fmtInt)(v, n); }
function fmtInt(v) { return Math.round(v).toLocaleString('en-US'); }
function text(g, s, x, y, o) {
  o = o || {}; if (!s) return 0;
  g.save(); g.font = (o.w || 400) + ' ' + (o.s || 16) + 'px ' + (o.mono ? MONO : SANS);
  g.fillStyle = o.c || C.ink; g.globalAlpha *= o.a == null ? 1 : clamp(o.a, 0, 1); g.textAlign = o.al || 'left'; g.textBaseline = o.b || 'alphabetic';
  if ('letterSpacing' in g) g.letterSpacing = (o.tr || 0) + 'px';
  if (o.up) s = s.toUpperCase();
  g.fillText(s, x, y); var wd = g.measureText(s).width; g.restore(); return wd;
}
/* a paragraph wrapped to a width; returns the height used */
function para(g, s, x, y, wd, o) {
  o = o || {}; g.save(); g.font = (o.w || 400) + ' ' + (o.s || 16) + 'px ' + (o.mono ? MONO : SANS);
  var words = String(s).split(' '), line = '', lh = o.lh || (o.s || 16) * 1.4, yy = y, n = 0;
  for (var i = 0; i < words.length; i++) { var test = line ? line + ' ' + words[i] : words[i];
    if (g.measureText(test).width > wd && line) { text(g, line, x, yy, o); yy += lh; line = words[i]; n++; } else line = test; }
  if (line) { text(g, line, x, yy, o); n++; }
  g.restore(); return n * lh;
}
function mark(g, kind, x, y, s, col, a) {
  g.save(); g.translate(x, y); g.globalAlpha *= a == null ? 1 : a; g.strokeStyle = col; g.fillStyle = col; g.lineWidth = Math.max(1.4, s * 0.16);
  if (kind === 'square') g.fillRect(-s * 0.62, -s * 0.62, s * 1.24, s * 1.24);
  else if (kind === 'bead') { g.beginPath(); g.arc(0, 0, s * 0.8, 0, TAU); g.stroke(); }
  else if (kind === 'diamond') { g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.86, 0); g.lineTo(0, s); g.lineTo(-s * 0.86, 0); g.closePath(); g.fill(); }
  else if (kind === 'ring') { g.beginPath(); g.arc(0, 0, s * 0.92, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.3, 0, TAU); g.fill(); }
  else if (kind === 'knot') { g.beginPath(); g.arc(0, 0, s, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.5, 0, TAU); g.fill(); }
  else if (kind === 'dot') { g.beginPath(); g.arc(0, 0, s * 0.5, 0, TAU); g.fill(); }
  g.restore();
}
function glow(g, x, y, r, col, a) { var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
function hair(g, x0, y0, x1, y1, col, a, wd, dash) { g.save(); g.strokeStyle = rgba(col, a); g.lineWidth = wd || 1; if (dash) g.setLineDash(dash);
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore(); }
/* the ground every drawn scene stands on: the void, a faint field of points, the corners of a frame */
function ground(g, t) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  g.fillStyle = rgba(C.ink, 0.045);
  for (var y = 60; y < H; y += 40) for (var x = 40 + (y / 40 % 2) * 20; x < W; x += 40) g.fillRect(x, y, 1, 1);
  var v = g.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H / 2, H * 0.95); v.addColorStop(0, 'rgba(8,8,10,0)'); v.addColorStop(1, 'rgba(4,4,5,0.85)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
}
function heading(g, t, eyebrow, title, o) {
  o = o || {}; var x = o.x || 96, y = o.y || 150;
  text(g, typed(eyebrow, t, 200, 20), x, y, {s: 16, w: 500, tr: 4, c: C.gate, up: true});
  text(g, typed(title, t, 600, 26), x, y + 62, {s: o.size || 50, w: 300, tr: -1, c: C.ink});
}
/* a path through points, corners rounded, measured by length: at(s) gives the point, its direction and its normal */
function Path(pts, r) {
  var P = [], i;
  function arcPts(a, b, c, rad) { var v1x = a[0] - b[0], v1y = a[1] - b[1], v2x = c[0] - b[0], v2y = c[1] - b[1];
    var l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y), rr = Math.min(rad, l1 / 2, l2 / 2), out = [];
    var p1 = [b[0] + v1x / l1 * rr, b[1] + v1y / l1 * rr], p2 = [b[0] + v2x / l2 * rr, b[1] + v2y / l2 * rr];
    for (var k = 0; k <= 12; k++) { var u = k / 12, q = 1 - u; out.push([q * q * p1[0] + 2 * q * u * b[0] + u * u * p2[0], q * q * p1[1] + 2 * q * u * b[1] + u * u * p2[1]]); }
    return out; }
  P.push(pts[0]);
  for (i = 1; i < pts.length - 1; i++) P = P.concat(arcPts(pts[i - 1], pts[i], pts[i + 1], r || 60));
  P.push(pts[pts.length - 1]);
  var S = [], L = 0, X = [], Y = [];               /* resampled every 2 px */
  for (i = 0; i < P.length - 1; i++) { var dx = P[i + 1][0] - P[i][0], dy = P[i + 1][1] - P[i][1], d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / 2));
    for (var j = 0; j < n; j++) { X.push(P[i][0] + dx * j / n); Y.push(P[i][1] + dy * j / n); S.push(L + d * j / n); } L += d; }
  X.push(P[P.length - 1][0]); Y.push(P[P.length - 1][1]); S.push(L);
  function at(s) { s = clamp(s, 0, L); var i0 = Math.min(X.length - 2, Math.floor(s / L * (X.length - 1)));
    while (i0 > 0 && S[i0] > s) i0--; while (i0 < X.length - 2 && S[i0 + 1] < s) i0++;
    var k = (s - S[i0]) / Math.max(1e-6, S[i0 + 1] - S[i0]), x = lerp(X[i0], X[i0 + 1], k), y = lerp(Y[i0], Y[i0 + 1], k);
    var dx = X[i0 + 1] - X[i0], dy = Y[i0 + 1] - Y[i0], dl = Math.hypot(dx, dy) || 1; return {x: x, y: y, dx: dx / dl, dy: dy / dl, nx: -dy / dl, ny: dx / dl}; }
  function near(x, y) { var best = 0, bd = 1e18; for (var i = 0; i < X.length; i += 2) { var d = (X[i] - x) * (X[i] - x) + (Y[i] - y) * (Y[i] - y); if (d < bd) { bd = d; best = S[i]; } } return best; }
  function stroke(g, s0, s1, col, a, wd, dash) { g.save(); g.strokeStyle = rgba(col, a); g.lineWidth = wd || 1; if (dash) g.setLineDash(dash); g.beginPath();
    var first = true; for (var i = 0; i < X.length; i++) { if (S[i] < s0 || S[i] > s1) continue; if (first) { g.moveTo(X[i], Y[i]); first = false; } else g.lineTo(X[i], Y[i]); }
    g.stroke(); g.restore(); }
  return {L: L, at: at, near: near, stroke: stroke};
}
/* threads along a path: deterministic particles that each stop at one station, braided round the line they follow.
   o: {path, stops: [arc length ...], weights: [share ...], from, every, speed, frontier(t), seed, colours} */
function threads(g, t, o) {
  var P = o.path, every = o.every || 60, first = Math.max(0, Math.floor((t - o.from - 26000) / every)), last = Math.floor((t - o.from) / every);
  var fr = o.frontier ? o.frontier(t) : P.L, landed = [];
  for (var i = first; i <= last; i++) {
    var ti = o.from + i * every + hash(i, o.seed, 1) * every * 0.8;
    if (t < ti) continue;
    var sp = (o.speed || 0.34) * (0.82 + hash(i, o.seed, 2) * 0.36), stop = pick(hash(i, o.seed, 3), o.weights.map(function (w, k) { return [k, w]; }));
    var sEnd = o.stops[stop], s = (t - ti) * sp, col = (o.colours || SRC)[pick(hash(i, o.seed, 4), o.colours || SRC)][0];
    var amp = 2 + hash(i, o.seed, 5) * 8, ph = hash(i, o.seed, 6) * TAU;
    if (s > sEnd) { var since = (s - sEnd) / sp; if (since < 900) landed.push([stop, since, col, i]); continue; }
    var head = Math.min(s, fr - (i % 9) * 3);
    if (head < 0) continue;
    g.beginPath(); var hx = 0, hy = 0;
    for (var k = 0; k < 8; k++) { var ss = head - k * 8; if (ss < 0) break; var p = P.at(ss), off = Math.sin(ss * 0.018 + ph) * amp;
      var x = p.x + p.nx * off, y = p.y + p.ny * off; if (k === 0) { g.moveTo(x, y); hx = x; hy = y; } else g.lineTo(x, y); }
    g.strokeStyle = rgba(col, 0.55); g.lineWidth = 1.4; g.stroke();
    g.fillStyle = rgba(col, 0.95); g.fillRect(hx - 1.6, hy - 1.6, 3.2, 3.2);
  }
  return landed;
}
/* strands braided round a path from s0 to s1, turning as the work flows */
function braid(g, P, s0, s1, t, o) {
  var n = o.n || 4, amp = o.amp || 7, step = o.step || 5;
  if (s1 - s0 < 4) return;
  for (var k = 0; k < n; k++) {
    g.beginPath();
    for (var s = s0, first = true; s <= s1; s += step) {
      var p = P.at(s), env = Math.min(1, (s - s0) / 90, (s1 - s) / 90 + 0.15);
      var off = Math.sin(s * (o.f || 0.011) - t * (o.v || 0.0026) + k * TAU / n) * amp * env;
      if (first) { g.moveTo(p.x + p.nx * off, p.y + p.ny * off); first = false; } else g.lineTo(p.x + p.nx * off, p.y + p.ny * off);
    }
    g.strokeStyle = rgba(o.cols[k % o.cols.length], o.a || 0.42); g.lineWidth = o.w || 1.1; g.stroke();
  }
}
/* an expanding ring where something has just happened */
function burst(g, x, y, t, at, col, r) { var k = k01(t, at, 1100); if (k <= 0 || k >= 1) return;
  g.save(); g.strokeStyle = rgba(col, 0.7 * (1 - k)); g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 10 + (r || 70) * eout(k), 0, TAU); g.stroke(); g.restore(); }
/* the run's own record, rolling: the newest line at the bottom */
var LAYER = {code: ['CODE', C.code], watch: ['WATCH', C.tele], opus: ['OPUS', C.opus], gliner: ['GLINER', C.gl], jev: ['DECISION', C.jev], you: ['YOU', C.gate]};
function ticker(g, t, from, x, y, o) {
  var E = (window.FilmEvents && window.FilmEvents.ticker) || [], per = (o && o.per) || 520, rows = (o && o.rows) || 4;
  if (!E.length || t < from) return;
  var n = Math.floor((t - from) / per), fade = ((t - from) % per) / per;
  for (var r = 0; r < rows; r++) {
    var i = n - (rows - 1 - r); if (i < 0) continue; var e = E[i % E.length], L = LAYER[e[1]] || [e[1], C.ink3];
    var a = r === rows - 1 ? Math.min(1, fade * 4) : 0.35 + 0.45 * r / (rows - 1), yy = y + r * 24;
    text(g, e[0], x, yy, {s: 14, mono: true, c: C.ink4, a: a});
    text(g, L[0], x + 84, yy, {s: 13, w: 500, tr: 2, c: L[1], a: a});
    text(g, e[2].length > 118 ? e[2].slice(0, 117) + '…' : e[2], x + 190, yy, {s: 14, mono: true, c: C.ink2, a: a});
  }
}

/* ── I. The whole machine ─────────────────────────────────────────────────────────────────────────────────────── */
var M = (function () {
  var R1 = 340, R2 = 572, R3 = 804, XL = 104, XR = 1810;
  var st = [
    {x: 230, y: R1, n: 'Evidence in', fig: 'Demo: 31 servers, 7 firewalls', sub: 'Kept small to follow; built on a real 189 servers and 54 exports', who: 'dot', col: C.snap},
    {x: 650, y: R1, n: 'Taken apart', fig: '47 sections a server', sub: 'Every field kept, to the page and the audit', who: 'square', col: C.code},
    {x: 1070, y: R1, n: 'Code judges first', fig: '179 checks', sub: '117 for servers, 52 in the firewall engine, 10 on a Firebox. Free.', who: 'square', col: C.code},
    {x: 1490, y: R1, n: 'The whole read', fig: '59,404 characters', sub: 'One server’s entire output to Opus in one call. Nothing narrows it.', who: 'ring', col: C.opus},
    {x: 1490, y: R2, n: 'Filed', fig: '16 findings, 18 checks', sub: '15 questions and 60 names. GLiNER proposes the names, on this machine.', who: 'bead', col: C.gl},
    {x: 1070, y: R2, n: 'Held to the evidence', fig: 'Every quote found', sub: 'Matched four ways in the capture. Every check parsed by PowerShell’s own parser.', who: 'square', col: C.code},
    {x: 650, y: R2, n: 'Cheapest first', fig: '4 layers', sub: 'Code, GLiNER, the decision model, Opus. Each settles what it can.', who: 'diamond', col: C.jev},
    {x: 230, y: R2, n: 'One script a server', fig: '17,008 characters', sub: 'Eighteen read-only checks, joined, proved to change nothing', who: 'square', col: C.code},
    {x: 230, y: R3, n: 'Through its agent', fig: 'TLS 1.3, outbound', sub: 'Nothing listens at a client. The answer comes back on the same line.', who: 'dot', col: C.live},
    {x: 610, y: R3, n: 'The second look', fig: 'The cause, one link up', sub: 'Opus reads what the checks printed, with its own last write-up', who: 'ring', col: C.opus},
    {x: 990, y: R3, n: 'A fix, written whole', fig: 'Test, change, proof, way back', sub: 'It stops and says where, if Group Policy owns the setting', who: 'ring', col: C.opus},
    {x: 1370, y: R3, n: 'Your gate', fig: 'Every change waits here', sub: 'A table in code decides who is asked. Never a model.', who: 'knot', col: C.gate},
    {x: 1750, y: R3, n: 'Proved', fig: 'Waves, a canary first', sub: 'Proved against untouched servers, or taken back', who: 'dot', col: C.tele}
  ];
  var pts = [[XL - 40, R1]].concat([[st[0].x, R1], [XR, R1], [XR, R2], [XL, R2], [XL, R3], [st[12].x + 70, R3]]);
  var path = Path(pts, 70), stops = st.map(function (s) { return path.near(s.x, s.y); });
  var T0 = 2400, STEP = 2700;
  st.forEach(function (s, i) { s.at = T0 + i * STEP; s.s = stops[i]; });
  /* where questions stop, drawn: most at code, fewer climbing, a few reaching the engineer (the method, not a count) */
  var weights = [0.02, 0.05, 0.30, 0.08, 0.10, 0.12, 0.10, 0.04, 0.03, 0.05, 0.04, 0.05, 0.02];
  var back = Path([[st[12].x + 70, R3], [XR + 40, R3], [XR + 40, 248], [st[0].x, 248], [st[0].x, R1 - 26]], 50);
  function frontier(t) { if (t < T0) return lerp(0, stops[0], k01(t, 900, T0 - 900));
    var k = (t - T0) / STEP, i = Math.floor(k); if (i >= st.length - 1) return path.L; return lerp(stops[i], stops[i + 1], ease(k - i)); }
  return {st: st, path: path, back: back, weights: weights, frontier: frontier, stops: stops, END: T0 + 12 * STEP};
})();

function machine(g, t) {
  ground(g, t);
  heading(g, t, 'The whole machine', 'One loop, from the first read to a proved fix.');
  var P = M.path, fr = M.frontier(t);
  P.stroke(g, 0, P.L, C.line2, 1, 1);                                   /* the whole route, faint */
  g.save(); g.globalCompositeOperation = 'lighter';
  braid(g, P, 0, fr, t, {n: 5, amp: 9, cols: [C.snap, C.tele, C.check, C.fw, C.words], a: 0.30, w: 1});
  g.restore();
  var hp = P.at(fr), live = t < M.END;
  glow(g, hp.x, hp.y, live ? 90 : 40, C.gate, live ? 0.30 : 0.12); glow(g, hp.x, hp.y, 18, C.ink, live ? 0.5 : 0.15);
  /* proof returns as telemetry: the loop closes */
  var kb = k01(t, M.END + 600, 2600);
  if (kb > 0) { M.back.stroke(g, 0, M.back.L * eout(kb), C.tele, 0.45, 1, [3, 7]);
    for (var j = 0; j < 14 && kb >= 1; j++) { var s = ((t * 0.22 + j * M.back.L / 14) % M.back.L), p = M.back.at(s); mark(g, 'dot', p.x, p.y, 4, C.tele, 0.8); }
    text(g, 'Proof returns as telemetry, and the next look starts from it', 1010, 236, {s: 15, c: C.tele, a: kb, al: 'center', tr: 0.3}); }
  g.save(); g.globalCompositeOperation = 'lighter';
  var landed = threads(g, t, {path: P, stops: M.stops, weights: M.weights, from: 600, every: 30, speed: 0.36, frontier: M.frontier, seed: 11});
  /* a question settled: a brief spark at its station, in the colour of its thread */
  landed.forEach(function (l) { var p = P.at(M.stops[l[0]]), k = l[1] / 900; glow(g, p.x, p.y, 10 + 26 * k, l[2], 0.30 * (1 - k)); });
  g.restore();
  ticker(g, t, M.st[0].at, 96, 958, {rows: 4, per: 560});
  M.st.forEach(function (s, i) {
    var on = t >= s.at, k = k01(t, s.at, 700), live = on && (i === M.st.length - 1 || t < M.st[i + 1].at);
    var x = s.x, y = s.y;
    burst(g, x, y, t, s.at, s.col, 80); burst(g, x, y, t, s.at + 260, s.col, 46);
    hair(g, x, y - 16, x, y + 16, on ? C.ink2 : C.line3, on ? 0.9 : 1, 1);
    if (on) { glow(g, x, y, live ? 64 : 34, s.col, live ? 0.30 : 0.10); mark(g, s.who, x, y, 9 + 3 * eout(k), s.col, 0.35 + 0.65 * eout(k)); }
    else mark(g, s.who, x, y, 7, C.line3);
    var lx = x - 18, ly = y - 44;
    text(g, String(i + 1).padStart(2, '0'), lx, ly, {s: 14, mono: true, c: on ? C.gate : C.ink4, a: on ? 1 : 0.6});
    text(g, s.n, lx + 34, ly, {s: 15, w: 500, tr: 2.4, up: true, c: on ? C.ink : C.ink4});
    if (on) {
      text(g, typed(s.fig, t, s.at + 150, 22), lx, y + 46, {s: 25, mono: true, c: C.ink, tr: -0.3});
      para(g, typed(s.sub, t, s.at + 500, 9), lx, y + 76, 340, {s: 15, c: C.ink2, lh: 21});
    }
  });
  /* the ledger, from the run's own record */
  if (t > M.st[3].at + 800) { var a = k01(t, M.st[3].at + 800, 800);
    text(g, 'AI on this run', 1824, 120, {s: 14, w: 500, tr: 2.4, up: true, c: C.ink3, al: 'right', a: a});
    text(g, '$1.76', 1824, 162, {s: 38, mono: true, c: C.ink, al: 'right', a: a});
    text(g, 'every check, proof, page and audit: $0', 1824, 190, {s: 15, c: C.ink3, al: 'right', a: a}); }
  text(g, 'The threads are the method drawn. Every figure written is measured on the run filmed here; the lines below are its record.', 1824, 1056, {s: 13, c: C.ink4, al: 'right'});
}
machine.dur = M.END + 9000;

/* ── IV. The firewall: exposure is a path ─────────────────────────────────────────────────────────────────────── */
var WCOL = [['Internet', 168], ['Translated from', 430], ['Policy', 690], ['Gate', 940], ['Lands on', 1170], ['Server', 1410], ['Listener', 1610]];
var WROUTES = [
  {y: 418, at: 2200, cells: [['VPC-HQ-FBX :443', 'static NAT'], ['ERP-Web-In', 'allow'], ['any address', 'no gate'], ['10.40.10.31:443', ''], ['HQ-APP01', 'antivirus off'], ['443 HTTPS', 'listening']], state: 'live'},
  {y: 528, at: 6600, cells: [['VPC-HQ-FBX :33890', 'static NAT'], ['RDS-Vendor-In', 'vendor access, added 2023'], ['any address', 'no gate'], ['10.40.10.41:3389', ''], ['HQ-RDS01', 'session host'], ['3389 Remote Desktop', 'listening']], state: 'live', fixed: true},
  {y: 638, at: 11000, cells: [['NLF-DEPOT-FBX :21', 'static NAT'], ['EDI-FTP-In', 'allow'], ['any address', 'no gate'], ['10.70.10.21:21', ''], ['no audited server', ''], ['', '']], state: 'nohost'}
];
var WSTATES = [['live', 'Live', 'A server at that address listens on that port', C.crit],
  ['quiet', 'Not listening', 'The server is there and nothing answers: an orphan to remove', C.med],
  ['nolist', 'Listeners not collected', 'The server is there; its capture holds no listener table', C.ink3],
  ['amb', 'Ambiguous', 'Two of the client’s servers hold the address. Never a guess.', C.ink3],
  ['nohost', 'No host', 'None of the client’s audited servers holds it', C.ink2],
  ['else', 'Elsewhere', 'Only another client’s server holds it. A real false alarm made this state.', C.check]];
var FIX_AT = 30500;
function ways(g, t) {
  ground(g, t);
  heading(g, t, 'The firewall pillar', 'Exposure is a path, not a port.');
  var a0 = k01(t, 1200, 900);
  text(g, typed('A port scan says a port is open. An engineer needs to know what it reaches.', t, 1700, 18), 1830, 196, {s: 20, c: C.ink2, al: 'right'});
  WCOL.forEach(function (c, i) { text(g, c[0], c[1], 318, {s: 14, w: 500, tr: 2.6, up: true, c: i === 3 ? C.gate : C.ink3, a: a0, al: i ? 'left' : 'center'});
    if (i) hair(g, c[1] - 6, 340, c[1] - 6, 690, C.line2, a0 * 0.8, 1); });
  /* any address: the internet as a field of drifting points */
  for (var i = 0; i < 220; i++) { var px = 168 + (hash(i, 3) - 0.5) * 150 + Math.sin(t * 0.0004 + i) * 6, py = 360 + hash(i, 4) * 320 + Math.cos(t * 0.0005 + i * 1.7) * 5;
    g.fillStyle = rgba(i % 7 === 0 ? C.fw : C.ink3, a0 * (0.25 + 0.5 * hash(i, 5))); g.fillRect(px, py, 1.6, 1.6); }
  var fixK = k01(t, FIX_AT + 2600, 2600);
  WROUTES.forEach(function (r, ri) {
    var x0 = 250, x1 = 1780, k = ease(k01(t, r.at, 3600)), head = lerp(x0, x1, k), gone = r.fixed ? fixK : 0;
    if (k <= 0) return;
    var col = r.state === 'live' ? C.crit : C.ink3, alive = 1 - gone;
    /* the line from the internet, then its packets */
    g.save(); g.globalAlpha = alive; hair(g, x0, r.y, head, r.y, col, 0.55, 1.2);
    for (var q = 0; q < 22; q++) { var u = ((t * 0.00018 + q / 22 + ri * 0.13) % 1), x = lerp(x0, head, u);
      g.fillStyle = rgba(r.state === 'live' ? C.crit : C.ink2, 0.85); g.fillRect(x - 2, r.y - 1, 4, 2); }
    var fade = 1;
    r.cells.forEach(function (c, ci) {
      var x = WCOL[ci + 1][1], reached = head >= x - 4, at = r.at + 3600 * ((x - x0) / (x1 - x0));
      if (!reached) return;
      burst(g, x, r.y, t, at, ci === 2 ? C.crit : C.ink2, ci === 2 ? 60 : 26);
      if (ci === 2 && r.state !== 'none') { glow(g, x, r.y, 44 + 8 * Math.sin(t * 0.006), C.crit, 0.22); }
      mark(g, ci === 2 ? 'ring' : 'dot', x, r.y, ci === 2 ? 8 : 7, ci === 2 ? C.crit : C.ink, 0.9);
      text(g, typed(c[0], t, at, 16), x - 6, r.y - 18, {s: 16, mono: true, c: ci === 2 ? C.crit : C.ink});
      if (c[1]) text(g, c[1], x - 6, r.y + 28, {s: 13, c: C.ink3});
    });
    if (k >= 1) { var st = WSTATES.filter(function (s) { return s[0] === r.state; })[0];
      text(g, st[1], 1830, r.y + 6, {s: 15, w: 500, tr: 2.4, up: true, c: st[3], al: 'right', a: k01(t, r.at + 3600, 500)}); }
    g.restore();
    /* the fix, made by hand: the engineer removes the rule and its NAT in Policy Manager; the next export proves it */
    if (r.fixed && t > FIX_AT) { var kf = k01(t, FIX_AT, 900);
      mark(g, 'knot', WCOL[1][1], r.y, 10, C.gate, kf); glow(g, WCOL[1][1], r.y, 50, C.gate, 0.25 * kf);
      text(g, typed('Removed by hand in Policy Manager: the rule and its NAT. Remote access moves behind the SSL VPN.', t, FIX_AT + 300, 14), WCOL[1][1] - 6, r.y + 52, {s: 15, c: C.gate});
      if (t > FIX_AT + 2600) text(g, gone >= 1 ? 'gone in the next export' : '', 1830, r.y + 6, {s: 15, w: 500, tr: 2.4, up: true, c: C.ok, al: 'right'}); }
  });
  /* the next export arrives: the proof is the firewall's own file, read again */
  if (t > FIX_AT + 1600) { var ke = k01(t, FIX_AT + 1600, 2200);
    for (var e = 0; e < 40; e++) { var u2 = clamp(ke * 1.6 - e / 40 * 0.6, 0, 1), ex = lerp(80, 1780, eout(u2)); if (u2 <= 0 || u2 >= 1) continue;
      g.fillStyle = rgba(C.fw, 0.9 * (1 - u2)); g.fillRect(ex, 700 + (e % 5) * 3, 6, 1.5); }
    text(g, 'VPC-HQ-FBX-after-fix.xml', 96, 712, {s: 15, mono: true, c: C.fw, a: ke});
    text(g, typed('What changed: 5 findings gone, each by its cause, and 4 new. Proved by the export, never by a model.', t, FIX_AT + 3400, 16), 420, 712, {s: 17, c: C.ink, a: 1}); }
  /* the six ends of a path */
  var k6 = k01(t, 15500, 900);
  if (k6 > 0) {
    text(g, 'Every path ends in one of six states', 96, 786, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: k6});
    WSTATES.forEach(function (s, i) { var x = 96 + i * 292, y = 830, ks = k01(t, 15700 + i * 520, 600), hit = s[0] === 'live' || s[0] === 'nohost';
      hair(g, x, y - 18, x + 250, y - 18, hit ? s[3] : C.line3, ks * (hit ? 0.9 : 0.6), hit ? 2 : 1);
      text(g, s[1], x, y + 10, {s: 20, c: hit ? C.ink : C.ink2, a: ks});
      para(g, s[2], x, y + 40, 250, {s: 15, c: C.ink3, a: ks, lh: 21});
      if (s[0] === 'live') text(g, t > FIX_AT + 5200 ? '1 route' : '2 routes', x + 250, y + 10, {s: 15, mono: true, c: C.crit, al: 'right', a: ks});
      if (s[0] === 'nohost') text(g, '1 route', x + 250, y + 10, {s: 15, mono: true, c: C.ink2, al: 'right', a: ks}); });
  }
  var kn = k01(t, 44000, 900);
  if (kn > 0) { text(g, typed('A policy’s number is Policy Manager’s own: on the real exports, 1,428 of 1,505 policies sit elsewhere in the file.', t, 44000, 12), 96, 1000, {s: 16, c: C.ink2});
    text(g, typed('Rule-base anomalies are computed on the address space each rule resolves to, never on alias names.', t, 46500, 12), 96, 1030, {s: 16, c: C.ink2}); }
}
ways.dur = 56000;

/* ── VII. The engine: every question climbs, cheapest first ───────────────────────────────────────────────────── */
var RUNGS = [['Code', 'exact shapes, known names, the record', 'free', 'square', C.code],
  ['The reader of names', 'GLiNER, on this machine', 'free', 'bead', C.gl],
  ['The decision model', 'a typed question, a fitted line', 'pennies', 'diamond', C.jev],
  ['Consistency probes', 'the same question asked another way', 'same request', 'diamond', C.jev],
  ['A read-only check', 'run on the server through its agent', 'free', 'square', C.check],
  ['Opus', 'reads whole, reasons, writes', 'the only real cost', 'ring', C.opus],
  ['The engineer', 'decides what no rung can', 'decides', 'knot', C.gate]];
/* where a drawn question stops (the method, not a count): most at code */
var RUNG_W = [0.42, 0.08, 0.18, 0.04, 0.08, 0.15, 0.05];
function engine(g, t) {
  ground(g, t);
  heading(g, t, 'The engine', 'Every question climbs, cheapest first.');
  var X0 = 96, Y0 = 300, DY = 92, XS = 560, a0 = k01(t, 1000, 800);
  RUNGS.forEach(function (r, i) { var y = Y0 + i * DY, k = k01(t, 1200 + i * 350, 600);
    hair(g, X0, y + 30, 940, y + 30, C.line2, k, 1);
    mark(g, r[3], X0 + 10, y - 6, 9, r[4], k);
    text(g, r[0], X0 + 40, y, {s: 22, c: C.ink, a: k});
    text(g, r[1], X0 + 40, y + 22, {s: 14, c: C.ink3, a: k});
    text(g, r[2], 940, y, {s: 15, mono: true, c: i === 5 ? C.ink : C.ink3, al: 'right', a: k}); });
  /* questions: each enters at the top and falls to the rung that settles it, then goes right, into the run's graph */
  var every = 64, last = Math.floor((t - 2600) / every);
  for (var i = Math.max(0, last - 110); i <= last; i++) {
    var ti = 2600 + i * every; if (t < ti) continue;
    var stop = pick(hash(i, 21), RUNG_W.map(function (w, k) { return [k, w]; })), age = t - ti;
    var xl = 470 + hash(i, 22) * 420, fallMs = (520 + stop * 300) * (0.85 + hash(i, 24) * 0.3), yStop = Y0 + stop * DY - 6;
    var col = SRC[pick(hash(i, 23), SRC)][0];
    if (age < fallMs) { var y = lerp(Y0 - 80, yStop, eout(age / fallMs));
      hair(g, xl, Math.max(Y0 - 80, y - 46), xl, y, col, 0.45, 1.2); g.fillStyle = rgba(col, 0.95); g.fillRect(xl - 1.6, y - 1.6, 3.2, 3.2); }
    else { var u = (age - fallMs) / 900; if (u > 1) continue;
      var x = lerp(xl, 850, eout(u)); burst(g, xl, yStop, t, ti + fallMs, RUNGS[stop][4], 16); glow(g, xl, yStop, 14, RUNGS[stop][4], 0.25 * (1 - u));
      mark(g, RUNGS[stop][3], x, yStop, 4, RUNGS[stop][4], 1 - u * 0.6); }
  }
  text(g, 'Settled, climb or hold: every try is kept in the run’s graph with its proof, its confidence and its cost.', X0, 990, {s: 16, c: C.ink3, a: a0});
  /* placement on this run: the decision model's seat */
  var P0 = 16000, RX = 1110;
  if (t > P0) {
    var kp = k01(t, P0, 800);
    text(g, 'Placement, on the run filmed here', RX, 312, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kp});
    para(g, typed('48 findings, each offered the fixes nearest its words. The decision model takes those it can stand behind.', t, P0 + 200, 14), RX, 344, 700, {s: 17, c: C.ink2, lh: 24});
    for (var f = 0; f < 48; f++) { var at = P0 + 1400 + f * 120, kf = k01(t, at, 400); if (kf <= 0) continue;
      var jev = f % 8 !== 3, cx = RX + 12 + (f % 16) * 44, cy = 424 + Math.floor(f / 16) * 44;
      burst(g, cx, cy, t, at, jev ? C.jev : C.opus, 18);
      mark(g, jev ? 'diamond' : 'ring', cx, cy, 9, jev ? C.jev : C.opus, kf); }
    var kc = k01(t, P0 + 7400, 700);
    text(g, '42', RX, 576, {s: 44, mono: true, c: C.jev, a: kc}); text(g, 'placed by the decision model, above its fitted line', RX + 70, 568, {s: 16, c: C.ink2, a: kc});
    text(g, '6', RX, 626, {s: 44, mono: true, c: C.opus, a: kc}); text(g, 'climbed to Opus', RX + 70, 618, {s: 16, c: C.ink2, a: kc});
    para(g, typed('The record’s own words for each: “calibrated 0.86 or over: wrong in at most 2.8% of such answers (95% sure)”', t, P0 + 8400, 12), RX, 668, 700, {s: 15, mono: true, c: C.ink3, lh: 22});
  }
  /* why its confidence is never used raw */
  var C0 = 33000;
  if (t > C0) {
    var kk = k01(t, C0, 800), bx = RX, by = 760, bw = 700;
    text(g, 'Its confidence is never used raw', bx, by - 26, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kk});
    hair(g, bx, by + 40, bx + bw, by + 40, C.line3, kk, 1);
    [0.5, 0.6, 0.7, 0.8, 0.9, 1].forEach(function (v) { var x = bx + (v - 0.5) / 0.5 * bw; hair(g, x, by + 36, x, by + 44, C.line3, kk, 1);
      text(g, Math.round(v * 100) + '%', x, by + 64, {s: 13, mono: true, c: C.ink4, al: 'center', a: kk}); });
    var xs = bx + (0.914 - 0.5) / 0.5 * bw, xr = bx + (0.761 - 0.5) / 0.5 * bw, kg = ease(k01(t, C0 + 900, 1400));
    mark(g, 'diamond', xs, by + 40, 8, C.jev, kk); text(g, 'it said 91.4% sure', xs, by + 10, {s: 15, c: C.jev, al: 'center', a: kk});
    if (kg > 0) { hair(g, xs, by + 40, lerp(xs, xr, kg), by + 40, C.crit, 0.9, 3);
      mark(g, 'dot', lerp(xs, xr, kg), by + 40, 9, C.crit, 1); text(g, 'it was right 76.1%', xr, by + 10, {s: 15, c: C.crit, al: 'center', a: kg}); }
    para(g, typed('So each answer is recalibrated by isotonic regression on labelled answers, and accepted only where an exact binomial bound on its error stays under the action’s limit. With none wrong, 59 labels bound the error at 5%; 149 at 2%.', t, C0 + 2600, 9),
      bx, by + 108, bw, {s: 16, c: C.ink2, lh: 23});
  }
}
engine.dur = 54000;

/* ── V. The read, whole ───────────────────────────────────────────────────────────────────────────────────────── */
var READ_F = ['The clock of this DC is set wrong: it takes time from an outside source instead of the domain, and Kerberos is failing on skew',
  'Talking to HQ-DC01 fails intermittently: SYSVOL replication errors, Netlogon secure-session failures',
  'VPC-DC03 is a dead domain controller still registered in AD and DNS', 'The company DNS zone accepts unauthenticated dynamic updates',
  'Service accounts with SPNs and very old, non-expiring passwords', 'LDAP signing and channel binding not enforced on the DC',
  'A physical branch DC with an unencrypted disk', 'Backups of this DC are unproven', 'RDP open from any source on all profiles; Windows Firewall logs nothing',
  'LLMNR and NetBIOS over TCP/IP enabled', 'Protocol defaults left at OS default: TLS 1.0/1.1 on, SMB client signing not required',
  'Patching source and reboot control unclear; November update not yet in', 'DNS client settings on the DC: loopback first, and only one DNS server at Riverside',
  'Hardware visibility gaps: RAID level and disk health unseen', 'Thin audit trail on a DC', 'Directory hygiene: stale users, privileged membership, anonymous access'];
function read(g, t) {
  ground(g, t);
  heading(g, t, 'The read, whole', 'One server, read whole, in one call.');
  var a0 = k01(t, 900, 700), RX = 742, RY = 560;
  text(g, 'BR-DC01', 96, 300, {s: 30, mono: true, c: C.ink, a: a0});
  text(g, 'a branch domain controller, 7 minutes ahead', 96, 330, {s: 15, c: C.ink3, a: a0});
  /* the capture: 47 sections, read top to bottom */
  var scan = (t - 1600) / 7000;
  for (var i = 0; i < 47; i++) { var y = 362 + i * 11, w = 60 + hash(i, 31) * 320, k = k01(t, 1200 + i * 30, 300), lit = scan * 47 > i;
    g.fillStyle = rgba(lit ? C.snap : C.line3, k * (lit ? 0.55 : 0.7)); g.fillRect(96, y, w, 5); }
  if (scan > 0 && scan < 1.2) { var sy = 362 + Math.min(1, scan) * 47 * 11; hair(g, 90, sy, 500, sy, C.snap, 0.8, 1.5); glow(g, 300, sy, 120, C.snap, 0.08); }
  text(g, counted(64368, t, 1600, 7000) + ' characters given', 96, 900, {s: 18, mono: true, c: C.ink, a: a0});
  para(g, 'The whole collector output as it came, what the office has said, and what the checks raise. Nothing narrows it.', 96, 930, 420, {s: 15, c: C.ink3, a: a0, lh: 21});
  /* into one call */
  var spin = t * 0.0006;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (var j = 0; j < 90; j++) { var u = ((t * 0.00032 + hash(j, 32)) % 1), sx = 500, sy2 = 362 + hash(j, 33) * 517;
    var x = lerp(sx, RX, eout(u)), y2 = lerp(sy2, RY, eout(u)); if (t < 1600) continue;
    g.fillStyle = rgba(C.snap, 0.7 * (1 - u)); g.fillRect(x, y2, 2.2, 1.4); }
  glow(g, RX, RY, 170, C.opus, 0.10 + 0.04 * Math.sin(t * 0.003));
  g.restore();
  g.save(); g.translate(RX, RY);
  for (var r = 0; r < 4; r++) { g.strokeStyle = rgba(C.opus, 0.18 + r * 0.12); g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, 54 + r * 22, spin * (r % 2 ? -1 : 1) + r, spin * (r % 2 ? -1 : 1) + r + 1.6 + r * 0.5); g.stroke(); }
  g.restore();
  mark(g, 'ring', RX, RY, 22, C.opus, a0);
  text(g, 'Opus', RX, RY + 120, {s: 18, c: C.ink, al: 'center', a: a0}); text(g, 'one call, in plain words, no form', RX, RY + 144, {s: 14, c: C.ink3, al: 'center', a: a0});
  /* what it wrote: sixteen findings, the root first */
  var W0 = 9000, FX = 960;
  text(g, 'What it wrote, root first', FX, 300, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: k01(t, W0, 600)});
  READ_F.forEach(function (f, i) { var at = W0 + 400 + i * 900, k = k01(t, at, 300); if (k <= 0) return; var y = 344 + i * 31;
    if (i === 0) { hair(g, FX - 14, y - 16, FX - 14, y + 6, C.crit, 1, 2); }
    text(g, 'F' + (i + 1), FX, y, {s: 15, mono: true, c: i === 0 ? C.crit : C.ink4});
    var s = f.length > 92 ? f.slice(0, 91) + '…' : f;
    text(g, typed(s, t, at, 6), FX + 44, y, {s: 17, c: i === 0 ? C.ink : C.ink2});
    if (i === 0 && t > at + 700) text(g, 'ROOT', 1830, y, {s: 13, w: 500, tr: 2.4, c: C.crit, al: 'right'}); });
  var kd = k01(t, W0 + 15500, 700);
  text(g, '8.5 minutes, $1.23. Nothing acts on a word of it until code has checked it.', FX, 864, {s: 18, c: C.ink, a: kd});
  /* the measurement that chose this design */
  var M0 = 30500, km = k01(t, M0, 800);
  if (km > 0) { var bx = FX, by = 930, bw = 620;
    text(g, 'Why whole: 50 past cases replayed', bx, by - 22, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: km});
    var k1 = ease(k01(t, M0 + 500, 1200)), k2 = ease(k01(t, M0 + 1500, 1400));
    g.fillStyle = rgba(C.ink4, 0.9); g.fillRect(bx, by, bw * 24 / 50 * k1, 10); text(g, '24 of 50  speaking only when sure', bx + bw * 24 / 50 * k1 + 14, by + 10, {s: 15, c: C.ink3, a: k1});
    g.fillStyle = rgba(C.tele, 0.9); g.fillRect(bx, by + 30, bw * 40 / 50 * k2, 10); text(g, '40 of 50  a best read every turn', bx + bw * 40 / 50 * k2 + 14, by + 40, {s: 15, c: C.ink, a: k2});
    text(g, typed('And one read of a whole server named a root that 176 checks and twenty reads of its parts had not.', t, M0 + 3200, 13), bx, by + 82, {s: 15, c: C.ink2}); }
}
read.dur = 50000;

/* ── VI. Held to the evidence ─────────────────────────────────────────────────────────────────────────────────── */
/* lines of BR-DC01's capture as the read's quotes name them (line, words), from the record */
var CAPLINES = {710: 'Microsoft-Windows-Security-Kerberos: 19 events', 720: '[2026-11-17 21:01] Source: Microsoft-Windows-Time-Service | EventID: 37 | The time provider NtpClient is currently receiving valid time data from time.windows.com',
  721: '[2026-11-17 15:41] Source: Microsoft-Windows-Security-Kerberos | EventID: 3 | A Kerberos Error Message was received:', 724: 'Server Time: 20:34:18.0000 11/17/2026 Z',
  725: 'Error Code: 0x25 KRB_AP_ERR_SKEW', 726: 'Server Name: ldap/HQ-DC02.vantorre.local'};
var QUOTE = 'Error Code: 0x25 KRB_AP_ERR_SKEW', QWAYS = ['Word for word, in a line of the capture as it came', 'As the row itself: its names and values equal a record’s',
  'By its names and values: every name in one record, most of its numbers', 'Across one set of records of the same section and kind'];
var SCRIPT = ["'--- Policy (GPO) keys ---'", "Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\W32Time\\Parameters' |", "    Format-List NtpServer, Type",
  "'--- Local service keys ---'", "Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\W32Time\\Parameters' |", "    Format-List NtpServer, Type"];
function proof(g, t) {
  ground(g, t);
  heading(g, t, 'Held to the evidence', 'Nothing it writes is used until code has checked it.');
  var a0 = k01(t, 1000, 700), LX = 96, RXX = 1010;
  /* quotes */
  text(g, 'Every quote, found in the capture', LX, 300, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: a0});
  text(g, 'F1 quotes:', LX, 344, {s: 15, c: C.ink3, a: a0});
  text(g, typed('“' + QUOTE + '”', t, 1500, 30), LX + 90, 344, {s: 18, mono: true, c: C.ink});
  /* the capture, scrolling past until the line is found */
  var found = 4200, sc = Math.min(1, k01(t, 2400, found - 2400));
  g.save(); g.beginPath(); g.rect(LX, 370, 820, 210); g.clip();
  for (var i = 0; i < 40; i++) { var y = 390 + i * 22 - eout(sc) * 460, line = 700 + i, hit = line === 725, said = CAPLINES[line];
    text(g, String(line), LX, y, {s: 13, mono: true, c: hit && t > found ? C.ok : C.ink4});
    if (said) text(g, said.length > 88 ? said.slice(0, 87) + '…' : said, LX + 52, y, {s: 13, mono: true, c: hit && t > found ? C.ok : C.ink3});
    else { g.fillStyle = rgba(C.ink4, 0.35); g.fillRect(LX + 52, y - 9, 120 + hash(i, 41) * 600, 6); } }
  g.restore();
  if (t > found) { var kf = k01(t, found, 500); glow(g, LX + 200, 480, 140, C.ok, 0.06 * kf);
    text(g, 'found word for word, line 725, on exactly 1 record', LX, 610, {s: 16, c: C.ok, a: kf}); }
  var kw = k01(t, 6500, 600);
  text(g, 'Four ways, strictest first', LX, 668, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kw});
  QWAYS.forEach(function (w, i) { var k = k01(t, 7000 + i * 700, 500); text(g, String(i + 1), LX, 706 + i * 32, {s: 15, mono: true, c: i === 0 ? C.ok : C.ink4, a: k});
    text(g, w, LX + 30, 706 + i * 32, {s: 17, c: i === 0 ? C.ink : C.ink2, a: k}); });
  var kq = k01(t, 10500, 700);
  para(g, typed('On this read: 91 quotes, all 91 found, word for word; 80 pin exactly one record. Across the build an exact search alone found only 191 of 376 true quotes, which is why there are four ways, and why each says on how many records it fits.', t, 10500, 9),
    LX, 862, 820, {s: 16, c: C.ink2, lh: 23});
  /* scripts */
  text(g, 'Every check, parsed before it may run', RXX, 300, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: a0});
  text(g, 'C1: where the time configuration lives', RXX, 344, {s: 17, c: C.ink, a: a0});
  var P0 = 14000;
  SCRIPT.forEach(function (ln, i) { var y = 394 + i * 28, k = k01(t, 2000 + i * 300, 300); if (k <= 0) return;
    var cmd = /^(Get-[A-Za-z]+|\s+Format-[A-Za-z]+)/.exec(ln), parsed = t > P0 + i * 450;
    text(g, ln, RXX, y, {s: 14, mono: true, c: C.ink2, a: k});
    if (cmd && parsed) { var wd = cmd[0].trim(), pre = ln.indexOf(wd); g.save(); g.font = '400 14px ' + MONO; var x0 = RXX + g.measureText(ln.slice(0, pre)).width, ww = g.measureText(wd).width; g.restore();
      g.fillStyle = rgba(C.ok, 0.16); g.fillRect(x0 - 3, y - 15, ww + 6, 20); text(g, wd, x0, y, {s: 14, mono: true, c: C.ok}); } });
  if (t > P0) { var kp = k01(t, P0, 400), ps = Math.min(1, (t - P0) / 2800); hair(g, RXX - 10, 374 + ps * 170, 1830, 374 + ps * 170, C.ok, 0.5 * (1 - ps * 0.6), 1);
    text(g, 'PowerShell’s own parser: every command, argument, method, property set, type, exit and redirection, against allow lists', RXX, 580, {s: 14, c: C.ink3, a: kp}); }
  var kr = k01(t, P0 + 3400, 600);
  if (kr > 0) { text(g, 'reads and changes nothing', RXX, 624, {s: 20, c: C.ok, a: kr}); text(g, '18 of 18 on this read', 1830, 624, {s: 16, mono: true, c: C.ink, al: 'right', a: kr}); }
  var kx = k01(t, P0 + 5200, 700);
  if (kx > 0) { text(g, 'What is refused, and why', RXX, 692, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kx});
    [['Set-ItemProperty', 'changes the machine'], ['Invoke-WebRequest', 'fetches from the network'], ['.\\vendor-tool.exe', 'a vendor’s own executable']].forEach(function (r, i) {
      var k = k01(t, P0 + 5600 + i * 600, 400), y = 730 + i * 30; text(g, r[0], RXX, y, {s: 15, mono: true, c: C.crit, a: k}); text(g, r[1], RXX + 260, y, {s: 15, c: C.ink2, a: k}); });
    para(g, typed('About one check in ten the model writes is refused. It is shown its reasons once and writes it again; proven, the new one takes its place. Otherwise it waits for an engineer.', t, P0 + 7600, 9), RXX, 862, 820, {s: 16, c: C.ink2, lh: 23}); }
}
proof.dur = 46000;

/* ── II. The watch's funnel ───────────────────────────────────────────────────────────────────────────────────── */
function funnel(g, t) {
  ground(g, t);
  heading(g, t, 'The standing watch', 'Between two looks, code drops what moves by itself.');
  var a0 = k01(t, 900, 700), X0 = 120, XG = 860, X1 = 1500, Y = 560;
  text(g, 'Every record of a server, compared with its last look', X0, 330, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: a0});
  /* records stream in; at code's gate 92 in 100 peel away as moving by themselves, none lost: they stay in the record */
  g.save(); g.globalCompositeOperation = 'lighter';
  var every = 5, last = Math.floor((t - 1500) / every);
  for (var i = Math.max(0, last - 900); i <= last; i++) {
    var ti = 1500 + i * every, age = t - ti; if (age < 0) continue;
    var y0 = 380 + hash(i, 51) * 360, keep = hash(i, 52) < 0.08, x = X0 + age * 0.62, col = SRC[pick(hash(i, 53), SRC)][0];
    if (x < XG) { var y = lerp(y0, lerp(y0, Y, 0.5), clamp((x - X0) / (XG - X0), 0, 1)); g.fillStyle = rgba(col, 0.42); g.fillRect(x, y, 12, 1.2); }
    else if (keep) { var u = (x - XG) / (X1 - XG); if (u > 1.1) continue; var yk = lerp(lerp(y0, Y, 0.5), Y, eout(clamp(u, 0, 1)));
      g.fillStyle = rgba(C.ink, 0.95); g.fillRect(x, yk, 8, 1.6); }
    else { var u2 = (x - XG) / 500; if (u2 > 1) continue; var yd = lerp(y0, Y, 0.5) + u2 * u2 * 260 * (hash(i, 54) < 0.5 ? 1 : 1.25);
      g.fillStyle = rgba(C.ink4, 0.5 * (1 - u2)); g.fillRect(x, yd, 5, 1); }
  }
  g.restore();
  hair(g, XG, 360, XG, 760, C.code, a0 * 0.9, 1.5); mark(g, 'square', XG, 344, 7, C.code, a0);
  text(g, 'Code', XG + 16, 350, {s: 16, c: C.ink, a: a0});
  text(g, 'what moves by itself, measured from pairs of captures; no hand-written ignore list', XG + 16, 374, {s: 14, c: C.ink3, a: a0});
  var kc = k01(t, 6000, 900);
  text(g, counted(92, t, 6000, 1400) + '%', XG + 40, 860, {s: 56, mono: true, c: C.ink4, a: kc}); text(g, 'dropped between two looks, and kept in the record', XG + 40, 892, {s: 16, c: C.ink3, a: kc});
  text(g, counted(8, t, 6600, 1400) + '%', X1 - 40, 500, {s: 56, mono: true, c: C.ink, a: kc}); text(g, 'go on: deviates, changed, new, or gone', X1 - 40, 528, {s: 16, c: C.ink2, a: kc});
  var kj = k01(t, 11000, 900);
  if (kj > 0) {
    text(g, 'What goes on', X1 - 40, 600, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kj});
    ['Rules raise alerts in a server’s own figures', 'Servers silent together become one Job', 'The decision model grades each line, in shadow at first', 'Opus reads what climbs, whole'].forEach(function (s, i) {
      var k = k01(t, 11400 + i * 800, 500); mark(g, ['square', 'dot', 'diamond', 'ring'][i], X1 - 30, 636 + i * 34, 6, [C.code, C.tele, C.jev, C.opus][i], k);
      text(g, s, X1 - 10, 642 + i * 34, {s: 16, c: C.ink2, a: k}); });
  }
  ticker(g, t, 3000, 96, 958, {rows: 4, per: 620});
}
funnel.dur = 30000;

/* ── IX. The agent and its line ───────────────────────────────────────────────────────────────────────────────── */
var LINE_STEPS = [['Its own key', 'made on the server; the private key never leaves it', C.ink],
  ['A single-use code', 'one line to run; it works once and expires in a day', C.gate],
  ['Its certificate', 'signed by the office’s own authority', C.ink],
  ['TLS 1.3, outbound', 'it calls the office and holds the line open; nothing listens at a client', C.live],
  ['Checks come back on the line', 'each with its script’s digest; run only if the digest matches', C.check]];
var CADENCE = [['health', 5, 'every 5 minutes'], ['events', 10, 'each log, every 10'], ['network', 60, 'hourly'], ['inventory', 1440, 'daily']];
function agentline(g, t) {
  ground(g, t);
  heading(g, t, 'Agents', 'An agent calls out. Nothing listens at a client.');
  var a0 = k01(t, 900, 700), SX = 260, OX = 1660, LY = 470;
  /* the server and the office, and the line between them */
  [[SX, 'BR-DC01', 'the server'], [OX, 'The office', 'the listener']].forEach(function (n) {
    hair(g, n[0] - 70, LY - 70, n[0] + 70, LY - 70, C.line3, a0, 1); hair(g, n[0] - 70, LY + 70, n[0] + 70, LY + 70, C.line3, a0, 1);
    text(g, n[1], n[0], LY + 6, {s: n[1] === 'BR-DC01' ? 22 : 20, mono: n[1] === 'BR-DC01', c: C.ink, al: 'center', a: a0});
    text(g, n[2], n[0], LY + 34, {s: 14, c: C.ink3, al: 'center', a: a0}); });
  /* enrolment, once: the key stays on the server; the code goes out; the certificate comes back */
  var kk = k01(t, 1800, 800); if (kk > 0 && t < 9600) glow(g, SX, LY - 100, 40, C.ink, 0.25 * kk);
  if (kk > 0) { mark(g, 'square', SX, LY - 100, 6, C.ink, kk); text(g, 'private key, kept here', SX, LY - 124, {s: 14, c: C.ink3, al: 'center', a: kk}); }
  [[3700, SX + 90, OX - 90, C.gate, 'single-use code, and a certificate request'], [5600, OX - 90, SX + 90, C.ink, 'the agent’s certificate and the office’s authority']].forEach(function (h) {
    var u = k01(t, h[0], 1700); if (u <= 0) return; var x = lerp(h[1], h[2], eout(u)), y = LY - 60 - Math.sin(u * Math.PI) * 70;
    if (u < 1) { glow(g, x, y, 26, h[3], 0.4); mark(g, 'dot', x, y, 9, h[3], 1); }
    text(g, h[4], (SX + OX) / 2, h[3] === C.gate ? LY - 170 : LY - 140, {s: 15, c: h[3], al: 'center', a: Math.min(1, u * 3) * (t < 9300 ? 1 : 0.35)}); });
  var kl = ease(k01(t, 9000, 1600));
  if (kl > 0) { hair(g, SX + 90, LY, lerp(SX + 90, OX - 90, kl), LY, C.live, 0.8, 1.6);
    if (kl >= 1) { for (var p = 0; p < 18; p++) { var u = (t * 0.00025 + p / 18) % 1, x = lerp(SX + 90, OX - 90, u);
        g.fillStyle = rgba(C.tele, 0.9); g.fillRect(x, LY - 6, 6, 2); }
      for (var q = 0; q < 4; q++) { var u2 = (t * 0.00012 + q / 4) % 1, x2 = lerp(OX - 90, SX + 90, u2); mark(g, 'square', x2, LY + 10, 4, C.check, 0.9); } } }
  text(g, 'readings out', (SX + OX) / 2, LY - 20, {s: 14, c: C.tele, al: 'center', a: kl >= 1 ? 1 : 0});
  text(g, 'checks back, on the same line', (SX + OX) / 2, LY + 34, {s: 14, c: C.check, al: 'center', a: kl >= 1 ? 1 : 0});
  LINE_STEPS.forEach(function (s, i) { var at = 1800 + i * 1900, k = k01(t, at, 500), x = 120 + i * 350, y = 650;
    burst(g, x + 6, y - 6, t, at, s[2], 24); mark(g, 'dot', x + 6, y - 6, 8, s[2], k);
    text(g, String(i + 1).padStart(2, '0') + '  ' + s[0], x + 24, y, {s: 18, c: C.ink, a: k});
    para(g, s[1], x + 24, y + 28, 300, {s: 15, c: C.ink3, a: k, lh: 21}); });
  var kc = k01(t, 13500, 800);
  if (kc > 0) {
    text(g, 'What it reads, through the Windows API, starting no other process', 120, 830, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kc});
    CADENCE.forEach(function (c, i) { var x = 120 + i * 300, k = k01(t, 13800 + i * 400, 500), ph = (t / (c[1] * 260)) % 1;
      text(g, c[0], x, 876, {s: 18, c: C.ink, a: k}); text(g, c[2], x, 902, {s: 15, c: C.ink3, a: k});
      hair(g, x, 924, x + 240, 924, C.line3, k, 1); mark(g, 'dot', x + 240 * ph, 924, 6, C.tele, k); });
    text(g, '30 further reads the text collector cannot take', 1320, 876, {s: 18, c: C.ink, a: kc});
    text(g, 'a batch limit of 120 a minute an address at the listener', 1320, 902, {s: 15, c: C.ink3, a: kc});
  }
}
agentline.dur = 32000;

/* ── VIII. A fix, written whole, and the gate ─────────────────────────────────────────────────────────────────── */
var FIXPARTS = [['The pre-check', 'A read-only test, true while the problem exists: the problem’s fingerprint', C.check],
  ['The change', 'What to change and where, with its guards; a dry run by default', C.opus],
  ['The proof', 'The fingerprint run again: what shows it worked', C.ok],
  ['The way back', 'The exact state before, kept, to undo it', C.ink2]];
function fixgate(g, t) {
  ground(g, t);
  heading(g, t, 'A fix, written whole', 'Four parts, a person’s gate, then proof from outside.');
  var a0 = k01(t, 900, 700);
  text(g, 'On BR-FS01, from the rehearsal: take the public resolver 8.8.8.8 off the adapter, keep the domain controllers. Written by the watch for $0.12.', 96, 300, {s: 17, c: C.ink2, a: a0});
  FIXPARTS.forEach(function (p, i) { var at = 2000 + i * 1500, k = k01(t, at, 600), x = 96 + i * 440, y = 380;
    hair(g, x, y, x + 400, y, p[2], k, 2); text(g, p[0], x, y + 34, {s: 22, c: C.ink, a: k}); para(g, p[1], x, y + 64, 390, {s: 15, c: C.ink3, a: k, lh: 21}); });
  var kr = k01(t, 8600, 700);
  text(g, typed('It refuses to guess: if Group Policy or DHCP owns the setting, it stops and says where the real fix belongs.', t, 8600, 12), 96, 520, {s: 18, c: C.gate});
  /* the gate */
  var G0 = 12500, kg = k01(t, G0, 700), GX = 96, GY = 600;
  if (kg > 0) {
    mark(g, 'knot', GX + 12, GY + 8, 12, C.gate, kg); glow(g, GX + 12, GY + 8, 60, C.gate, 0.2 * kg);
    text(g, 'The gate is a person', GX + 44, GY + 16, {s: 24, c: C.ink, a: kg});
    [['Approve, or Not now', 'two engineers where the office asks for it'], ['Changes to servers off (the default)', 'the approved script is handed to the engineer to run'],
     ['Changes to servers on', 'it goes to that server’s agent, which runs it only if the digest matches'], ['A table in code decides who is asked', 'never a question put to a model']].forEach(function (r, i) {
      var k = k01(t, G0 + 600 + i * 700, 500), y = GY + 64 + i * 46; text(g, r[0], GX + 44, y, {s: 17, c: C.ink, a: k}); text(g, r[1], GX + 470, y, {s: 16, c: C.ink3, a: k}); });
  }
  /* waves: the canary first, each next server only after the one before came back healthy */
  var V0 = 17500, kv = k01(t, V0, 700), VX = 1180, VY = 630;
  if (kv > 0) {
    text(g, 'Out in waves', VX, VY - 30, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: kv});
    for (var s = 0; s < 6; s++) { var at = V0 + 800 + s * 1300, k = k01(t, at, 900), y = VY + s * 40;
      text(g, s === 0 ? 'canary' : 'server ' + (s + 1), VX, y + 5, {s: 14, mono: true, c: s === 0 ? C.gate : C.ink3, a: kv});
      hair(g, VX + 110, y, VX + 600, y, C.line2, kv, 1);
      if (k > 0) { hair(g, VX + 110, y, lerp(VX + 110, VX + 600, ease(k)), y, C.ok, 0.9, 2); if (k >= 1) mark(g, 'dot', VX + 600, y, 8, C.ok, 1); } }
    text(g, typed('An unhealthy result stops that client’s wave until an engineer takes it up.', t, V0 + 1200, 12), VX, VY + 262, {s: 15, c: C.ink3});
  }
  var P0 = 27500, kp = k01(t, P0, 800);
  if (kp > 0) { para(g, typed('Proved later, from outside the change: the fingerprint run again through the agent, and the finding watched against untouched servers that hold it. Both hold, or the way back is sent.', t, P0, 10), 96, 930, 1000, {s: 18, c: C.ink, lh: 26});
    text(g, typed('Replayed on 72 past diagnoses, the model wrote the engineer’s own fix, or part of it, 86% of the time.', t, P0 + 4800, 12), 1180, 952, {s: 15, c: C.ink3}); }
  var kd = k01(t, 36000, 800);
  if (kd > 0) { g.fillStyle = 'rgba(8,8,10,' + (0.86 * kd).toFixed(3) + ')'; g.fillRect(0, 0, W, H);
    text(g, 'And then it declined.', W / 2, 470, {s: 54, w: 300, c: C.ink, al: 'center', a: kd});
    text(g, typed('The watch’s next round would not write the next fix on the line, secure-only DNS updates: done before the time fault is repaired, it would cause an outage.', t, 37000, 12), W / 2, 540, {s: 21, c: C.ink2, al: 'center'});
    text(g, 'A system that can decline is a system you can leave running.', W / 2, 600, {s: 21, c: C.gate, al: 'center', a: k01(t, 42500, 900)}); }
}
fixgate.dur = 48000;

/* ── X. The audits: the model writes the words, code checks every name and number ─────────────────────────────── */
function audits(g, t) {
  ground(g, t);
  heading(g, t, 'Both audits', 'The model writes the words. Code checks every name and number.');
  var a0 = k01(t, 900, 700), GX = 96, GY = 340, cols = 30, cell = 26;
  text(g, 'Every field the model wrote on the release candidate, checked against the audit’s own facts', GX, 312, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: a0});
  var bad = {41: 1, 157: 1, 263: 1};
  for (var i = 0; i < 318; i++) { var at = 1800 + i * 34, k = k01(t, at, 300); if (k <= 0) continue;
    var x = GX + (i % cols) * cell, y = GY + Math.floor(i / cols) * cell, b = bad[i], fixedAt = at + 2200, col = b ? (t < fixedAt ? C.crit : C.ok) : C.ok;
    g.fillStyle = rgba(col, (b && t < fixedAt ? 0.95 : 0.55) * k); g.fillRect(x, y, cell - 6, cell - 6);
    if (b && t > at && t < fixedAt) { glow(g, x + 10, y + 10, 30, C.crit, 0.35); }
    if (b) burst(g, x + 10, y + 10, t, fixedAt, C.ok, 30); }
  var kc = k01(t, 13000, 800), RX = 1000;
  text(g, counted(318, t, 1800, 10800) + ' of 318', RX, 400, {s: 64, mono: true, c: C.ink, a: a0});
  text(g, 'fields kept by code’s check of what the model wrote', RX, 436, {s: 18, c: C.ink2, a: a0});
  text(g, '3', RX, 540, {s: 64, mono: true, c: C.crit, a: kc}); text(g, 'numbers the model invented, refused and written again', RX + 60, 528, {s: 18, c: C.ink2, a: kc});
  var kd = k01(t, 15500, 800);
  if (kd > 0) { [['The site audit', '11 of 11 areas, 136 of 136 fields'], ['The firewall audit', '13 of 13 areas, 182 of 182 fields']].forEach(function (r, i) {
      text(g, r[0], RX, 640 + i * 60, {s: 22, c: C.ink, a: kd}); text(g, r[1], RX + 300, 640 + i * 60, {s: 18, mono: true, c: C.ink2, a: kd}); });
    para(g, typed('The model is given an audit’s facts and nothing else. With the AI off, both audits still render complete, in code’s own words.', t, 17500, 12), RX, 790, 800, {s: 18, c: C.ink3, lh: 26}); }
}
audits.dur = 28000;

/* ── XII. How it was proved ───────────────────────────────────────────────────────────────────────────────────── */
var LAYERS = [['web', 35989], ['judge', 29911], ['ingest', 17653], ['ai', 14669], ['store', 11422], ['operate', 11085], ['audits', 7472], ['remediate', 4182], ['domain', 2658], ['agent', 2440], ['core', 1968]];
function proved(g, t) {
  ground(g, t);
  heading(g, t, 'How it was proved', 'Measured, never recalled.');
  var a0 = k01(t, 900, 700), LX = 96, LY = 330;
  text(g, 'v9.0.2: 139,481 lines of Python in eleven layers, imports one way', LX, LY - 22, {s: 14, w: 500, tr: 2.6, up: true, c: C.ink3, a: a0});
  LAYERS.forEach(function (l, i) { var k = ease(k01(t, 1500 + i * 220, 900)), y = LY + 14 + i * 40, w = l[1] / 35989 * 560;
    text(g, l[0], LX, y + 12, {s: 16, mono: true, c: C.ink2, a: k});
    g.fillStyle = rgba('#3987e5', 0.85); g.fillRect(LX + 120, y, w * k, 14);
    text(g, l[1].toLocaleString('en-US'), LX + 130 + w * k, y + 12, {s: 14, mono: true, c: C.ink3, a: k}); });
  var F = [['6,145', 'tests passing, in 670 files'], ['17', 'standing verification harnesses'], ['5 of 5', 'release gates'],
           ['80,161', 'requests in a 2 h 40 min soak, no error'], ['50', 'agents for an hour, no batch lost'], ['2 of 2', 'kills mid-write, recovered']];
  F.forEach(function (f, i) { var k = k01(t, 4500 + i * 900, 600), x = 960 + (i % 2) * 450, y = 360 + Math.floor(i / 2) * 120;
    text(g, f[0], x, y, {s: 50, mono: true, c: C.ink, a: k}); text(g, f[1], x, y + 34, {s: 16, c: C.ink3, a: k}); });
  var kd = k01(t, 12500, 900);
  if (kd > 0) { hair(g, 960, 760, 1830, 760, C.gate, kd, 2);
    text(g, 'Three releases in three days', 960, 800, {s: 24, c: C.ink, a: kd});
    para(g, typed('v9.0.0, v9.0.1 and v9.0.2, 18 to 20 November. Each built from a clean export of its release commit and walked from an empty folder in the built program, its suite, 17 harnesses and five-part gate green. v9.0.2 completed the firewall pillar: every one of 1,923 value-carrying export paths accounted for.', t, 13300, 10), 960, 840, 870, {s: 18, c: C.ink2, lh: 26}); }
  text(g, '6,546 commits since March 2026; 111 numbered design decisions', LX, 1000, {s: 16, c: C.ink3, a: k01(t, 3500, 800)});
}
proved.dur = 30000;

window.FilmScenes = {machine: machine, ways: ways, engine: engine, read: read, proof: proof, funnel: funnel, agentline: agentline, fixgate: fixgate, audits: audits, proved: proved};
window.FilmKit = {C: C, W: W, H: H, hash: hash, clamp: clamp, lerp: lerp, k01: k01, ease: ease, eout: eout, rgba: rgba, typed: typed,
  counted: counted, text: text, para: para, mark: mark, glow: glow, hair: hair, ground: ground, heading: heading, Path: Path, threads: threads, SRC: SRC};
})();
