/* NinjaToolKit v9 case study: the animated figures. Each figure is drawn into its <div class="viz" id="viz-...">
   when it first scrolls into view, loops while visible, and shows its final state still when the reader prefers
   reduced motion. Every name is from the fictional Vantorre Precision estate; every count marked illustrative. */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#999'; }
  function el(tag, at, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in at) if (at[k] != null) e.setAttribute(k, at[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function frame(box) {
    var cap = box.getAttribute('data-caption');
    var stage = h('div', 'viz-stage', null, box);
    if (cap) h('p', 'viz-cap', cap, box);
    return stage;
  }
  function onView(node, start) {
    if (!('IntersectionObserver' in window)) { start(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); start(); } });
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(node);
  }
  function visible(node) {
    var r = node.getBoundingClientRect();
    return r.bottom > 0 && r.top < (window.innerHeight || 800);
  }
  var RUNG = [
    { id: 'R0', who: 'Code', what: 'parse, judges, signature index, benign rules, root-cause gate', col: 'oklch(0.72 0.12 162)', share: 0.40, unit: 0 },
    { id: 'R1', who: 'GLiNER 2.5', what: 'free text into typed spans and relations', col: 'oklch(0.70 0.13 300)', share: 0.06, unit: 0 },
    { id: 'R2', who: 'Decision model', what: 'typed questions, calibrated, conformal acceptance', col: 'oklch(0.70 0.12 250)', share: 0.28, unit: 0.00002 },
    { id: 'R3', who: 'Consistency probes', what: 'reversed options, negation, paraphrase', col: 'oklch(0.74 0.10 210)', share: 0.03, unit: 0.00002 },
    { id: 'R4', who: 'Opus 5.5, low effort', what: 'one narrow typed question, verified', col: 'oklch(0.78 0.12 85)', share: 0.15, unit: 0.02 },
    { id: 'R5', who: 'Opus 5.5, high / three seats', what: 'flagged claims, new patterns, probes and fixes', col: 'oklch(0.70 0.15 52)', share: 0.06, unit: 0.25 },
    { id: 'R6', who: 'The engineer', what: 'the gate; the answer becomes a gold label', col: 'oklch(0.90 0.02 80)', share: 0.02, unit: 0 }
  ];

  /* ── 1 · the burn-down ladder ─────────────────────────────────────────────────────────────────────────── */
  function ladder(box) {
    var stage = frame(box);
    var cv = h('canvas', 'viz-canvas', null, stage);
    var legend = h('div', 'viz-legend', null, stage);
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = Math.max(1, window.devicePixelRatio || 1);
    var parts = [], settled = RUNG.map(function () { return 0; }), spent = 0, made = 0, t0 = 0, last = 0;
    var TOTAL = 1000;
    function size() {
      W = stage.clientWidth; H = Math.max(420, Math.min(520, W * 0.66));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function band(i) { var top = 18, bot = H - 30, bh = (bot - top) / RUNG.length; return { y: bot - (i + 1) * bh, h: bh }; }
    function target() {
      var r = Math.random(), acc = 0;
      for (var i = 0; i < RUNG.length; i++) { acc += RUNG[i].share; if (r <= acc) return i; }
      return RUNG.length - 1;
    }
    function spawn() {
      var lane = W * (W < 560 ? 0.46 : 0.54);
      parts.push({ x: lane + (Math.random() - 0.5) * 70, y: H - 16, tgt: target(), state: 'rise', vx: 0, vy: -(1.1 + Math.random() * 0.9), a: 1 });
      made++;
    }
    function draw(ts) {
      if (!t0) t0 = ts;
      var dt = Math.min(48, ts - (last || ts)); last = ts;
      ctx.clearRect(0, 0, W, H);
      var ink = css('--ink'), ink3 = css('--ink-3'), rule = css('--rule'), ink2 = css('--ink-2');
      var narrow = W < 560, labW = narrow ? 0 : W * 0.40, settleX = W * (narrow ? 0.74 : 0.72);
      for (var i = 0; i < RUNG.length; i++) {
        var b = band(i);
        ctx.fillStyle = i % 2 ? 'rgba(127,127,127,0.035)' : 'rgba(127,127,127,0.07)';
        ctx.fillRect(0, b.y, W, b.h);
        ctx.strokeStyle = rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, b.y + 0.5); ctx.lineTo(W, b.y + 0.5); ctx.stroke();
        ctx.fillStyle = RUNG[i].col; ctx.fillRect(0, b.y + 6, 3, b.h - 12);
        ctx.font = '600 12px Geist, system-ui, sans-serif'; ctx.fillStyle = ink;
        ctx.fillText(RUNG[i].id + '  ' + RUNG[i].who, 12, b.y + b.h / 2 - (narrow ? 0 : 4));
        if (!narrow) { ctx.font = '11px Geist, system-ui, sans-serif'; ctx.fillStyle = ink3; ctx.fillText(RUNG[i].what, 12, b.y + b.h / 2 + 12, labW); }
        ctx.font = '13px "JetBrains Mono", ui-monospace, monospace'; ctx.fillStyle = ink2; ctx.textAlign = 'right';
        ctx.fillText(String(settled[i]), W - 10, b.y + b.h / 2 + 4); ctx.textAlign = 'left';
      }
      ctx.font = '11px Geist, system-ui, sans-serif'; ctx.fillStyle = ink3;
      ctx.textAlign = 'center'; ctx.fillText('decisions enter here', W * (narrow ? 0.46 : 0.54), H - 8); ctx.textAlign = 'left';
      ctx.textAlign = 'right'; ctx.fillText('settled', W - 10, 12); ctx.textAlign = 'left';
      if (made < TOTAL && !REDUCED) { var n = Math.round(dt / 16 * 3.2); for (var k = 0; k < n && made < TOTAL; k++) spawn(); }
      for (var p = parts.length - 1; p >= 0; p--) {
        var q = parts[p], tb = band(q.tgt);
        if (q.state === 'rise') {
          q.y += q.vy * dt / 16 * 2.2;
          if (q.y <= tb.y + tb.h / 2) { q.state = 'settle'; q.y = tb.y + tb.h / 2 + (Math.random() - 0.5) * (tb.h * 0.5); }
        } else if (q.state === 'settle') {
          q.x += (settleX + Math.random() * (W - settleX - 40) - q.x) * 0.05 * dt / 16 + 1.4 * dt / 16;
          if (q.x >= settleX) { q.state = 'done'; settled[q.tgt]++; spent += RUNG[q.tgt].unit; }
        } else { q.a -= 0.02 * dt / 16; if (q.a <= 0) { parts.splice(p, 1); continue; } }
        ctx.globalAlpha = Math.max(0, q.a);
        ctx.fillStyle = q.state === 'rise' ? ink2 : RUNG[q.tgt].col;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.state === 'rise' ? 1.8 : 2.4, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
      var low = settled[0] + settled[1] + settled[2], tot = settled.reduce(function (a, b) { return a + b; }, 0);
      legend.innerHTML = '<span><b>' + tot + '</b> of ' + TOTAL + ' settled</span>' +
        '<span><b>' + (tot ? Math.round(low / tot * 100) : 0) + '%</b> at R0 to R2</span>' +
        '<span><b>$' + spent.toFixed(2) + '</b> for these decisions</span>' +
        '<span><b>$' + (tot * 0.25).toFixed(0) + '</b> if each had gone to the top</span>' +
        '<span class="viz-tag">illustrative counts</span>';
      if (made >= TOTAL && parts.length === 0) {
        if (!REDUCED) setTimeout(function () { reset(); requestAnimationFrame(draw); }, 2600);
        return;
      }
      if (visible(box) || made < 60) requestAnimationFrame(draw); else setTimeout(function () { requestAnimationFrame(draw); }, 400);
    }
    function reset() { parts = []; settled = RUNG.map(function () { return 0; }); spent = 0; made = 0; t0 = 0; last = 0; }
    function still() {
      reset();
      for (var i = 0; i < TOTAL; i++) { var t = target(); settled[t]++; spent += RUNG[t].unit; }
      made = TOTAL; draw(performance.now());
    }
    size(); window.addEventListener('resize', function () { size(); if (REDUCED) still(); });
    onView(box, function () { if (REDUCED) still(); else requestAnimationFrame(draw); });
  }

  /* ── 2 · GLiNER 2.5 reading text ───────────────────────────────────────────────────────────────────────── */
  function gliner(box) {
    var stage = frame(box);
    var LINES = [
      { src: 'Event 1058 · Microsoft-Windows-GroupPolicy · HQ-RDS01', text: 'The processing of Group Policy failed. Windows attempted to read the file \\\\vantorre.local\\SysVol\\vantorre.local\\Policies\\{6AC1786C-016F-11D2-945F-00C04FB984F9}\\gpt.ini from a domain controller and was not successful. Access is denied.',
        spans: [['\\\\vantorre.local\\SysVol\\vantorre.local\\Policies\\{6AC1786C-016F-11D2-945F-00C04FB984F9}\\gpt.ini', 'unc path', 'known'],
                ['{6AC1786C-016F-11D2-945F-00C04FB984F9}', 'gpo id', 'known'], ['Access is denied', 'error', 'known']] },
      { src: 'NETLOGON\\logon.bat · line 7', text: 'net use S: \\\\HQ-FS01\\Shipping /persistent:yes',
        spans: [['S:', 'drive', 'known'], ['\\\\HQ-FS01\\Shipping', 'share', 'known'], ['HQ-FS01', 'host', 'known']] },
      { src: 'NETLOGON\\logon.bat · line 9', text: 'net use T: \\\\VPC-DC03\\Transfer',
        spans: [['T:', 'drive', 'known'], ['\\\\VPC-DC03\\Transfer', 'share', 'known'], ['VPC-DC03', 'host', 'held']] }
    ];
    var list = h('div', 'gl-lines', null, stage);
    var rel = h('div', 'gl-rel', null, stage);
    var rows = LINES.map(function (L) {
      var row = h('div', 'gl-row', null, list);
      h('div', 'gl-src', L.src, row);
      var t = h('div', 'gl-text', null, row);
      var text = L.text, marks = [];
      L.spans.forEach(function (s) { var i = text.indexOf(s[0]); if (i >= 0) marks.push({ i: i, j: i + s[0].length, lab: s[1], st: s[2] }); });
      marks.sort(function (a, b) { return a.i - b.i || b.j - a.j; });
      var flat = [], pos = 0;
      marks.forEach(function (m) { if (m.i >= pos) { flat.push(m); pos = m.j; } });
      var inner = [];
      marks.forEach(function (m) { if (flat.indexOf(m) < 0) inner.push(m); });
      pos = 0; var html = '';
      function tag(m) { return '<span class="gl-tag" data-st="' + m.st + '">' + (m.st === 'held' ? m.lab + ' · held' : m.lab) + '</span>'; }
      flat.forEach(function (m) {
        html += esc(text.slice(pos, m.i));
        var seg = text.slice(m.i, m.j), segHtml = esc(seg), tags = '';
        inner.forEach(function (n) {
          if (n.i >= m.i && n.j <= m.j) {
            var a = n.i - m.i, b = n.j - m.i;
            segHtml = esc(seg.slice(0, a)) + '<span class="gl-span gl-in" data-st="' + n.st + '">' + esc(seg.slice(a, b)) + '</span>' + esc(seg.slice(b));
            tags += tag(n);
          }
        });
        html += '<span class="gl-span" data-st="' + m.st + '">' + segHtml + '</span>' + tag(m) + tags;
        pos = m.j;
      });
      html += esc(text.slice(pos));
      t.innerHTML = html;
      return row;
    });
    rel.innerHTML =
      '<div class="gl-graph">' +
      '<span class="gl-node">S:</span><i>maps</i><span class="gl-node">\\\\HQ-FS01\\Shipping</span><i>on</i><span class="gl-node ok">HQ-FS01 · a captured server</span></div>' +
      '<div class="gl-graph">' +
      '<span class="gl-node">T:</span><i>maps</i><span class="gl-node">\\\\VPC-DC03\\Transfer</span><i>on</i><span class="gl-node held">VPC-DC03 · held: retired, no longer resolves</span></div>';
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
    var spans = [].slice.call(stage.querySelectorAll('.gl-span, .gl-tag')), graphs = [].slice.call(rel.children);
    function play() {
      spans.forEach(function (s) { s.classList.remove('on'); }); graphs.forEach(function (g) { g.classList.remove('on'); });
      if (REDUCED) { spans.forEach(function (s) { s.classList.add('on'); }); graphs.forEach(function (g) { g.classList.add('on'); }); return; }
      spans.forEach(function (s, k) { setTimeout(function () { s.classList.add('on'); }, 500 + k * 420); });
      graphs.forEach(function (g, k) { setTimeout(function () { g.classList.add('on'); }, 600 + spans.length * 420 + k * 700); });
      setTimeout(function () { if (visible(box)) play(); else onView(box, play); }, 600 + spans.length * 420 + 6000);
    }
    onView(box, play);
  }

  /* ── 3 · calibration: a reliability diagram before and after isotonic recalibration ──────────────────── */
  function calibration(box) {
    var stage = frame(box);
    var W = 560, H = 360, L = 56, R = 20, T = 20, B = 46;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'viz-svg', role: 'img', 'aria-label': 'Reliability diagram' }, stage);
    var ink3 = 'var(--ink-3)', rule = 'var(--rule-2)';
    function X(v) { return L + (v - 0.5) / 0.5 * (W - L - R); }
    function Y(v) { return H - B - (v - 0.5) / 0.5 * (H - T - B); }
    for (var g = 0.5; g <= 1.0001; g += 0.1) {
      el('line', { x1: X(g), y1: Y(0.5), x2: X(g), y2: Y(1), stroke: rule, 'stroke-width': 0.6 }, svg);
      el('line', { x1: X(0.5), y1: Y(g), x2: X(1), y2: Y(g), stroke: rule, 'stroke-width': 0.6 }, svg);
      el('text', { x: X(g), y: H - B + 18, 'text-anchor': 'middle', class: 'viz-axis' }, svg, g.toFixed(1));
      el('text', { x: L - 10, y: Y(g) + 4, 'text-anchor': 'end', class: 'viz-axis' }, svg, g.toFixed(1));
    }
    el('text', { x: (L + W - R) / 2, y: H - 8, 'text-anchor': 'middle', class: 'viz-axis' }, svg, 'stated confidence');
    el('text', { x: 14, y: (T + H - B) / 2, 'text-anchor': 'middle', class: 'viz-axis', transform: 'rotate(-90 14 ' + (T + H - B) / 2 + ')' }, svg, 'observed accuracy');
    el('line', { x1: X(0.5), y1: Y(0.5), x2: X(1), y2: Y(1), stroke: ink3, 'stroke-dasharray': '4 4', 'stroke-width': 1 }, svg);
    var raw = [[0.55, 0.47], [0.65, 0.53], [0.75, 0.60], [0.85, 0.68], [0.95, 0.79]];
    var fit = [[0.55, 0.545], [0.65, 0.655], [0.75, 0.742], [0.85, 0.856], [0.95, 0.947]];
    var line = el('polyline', { fill: 'none', stroke: 'oklch(0.70 0.12 250)', 'stroke-width': 2.4 }, svg);
    var dots = raw.map(function () { return el('circle', { r: 5, fill: 'oklch(0.70 0.12 250)' }, svg); });
    var lab = el('text', { x: X(0.52), y: Y(0.96), class: 'viz-big' }, svg, '');
    var sub = el('text', { x: X(0.52), y: Y(0.96) + 20, class: 'viz-axis' }, svg, '');
    function setP(p) {
      var pts = raw.map(function (r, i) { return [r[0], r[1] + (fit[i][1] - r[1]) * p]; });
      line.setAttribute('points', pts.map(function (q) { return X(q[0]) + ',' + Y(q[1]); }).join(' '));
      dots.forEach(function (d, i) { d.setAttribute('cx', X(pts[i][0])); d.setAttribute('cy', Y(pts[i][1])); });
      var ece = 0.117 + (0.008 - 0.117) * p;
      lab.textContent = 'calibration error ' + ece.toFixed(3);
      sub.textContent = p < 0.5 ? 'raw: overconfident' : 'after isotonic recalibration';
    }
    function play() {
      if (REDUCED) { setP(1); return; }
      setP(0); var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts; var k = (ts - t0) / 1000;
        var p = k < 1.6 ? 0 : k < 3.6 ? (1 - Math.cos(Math.PI * (k - 1.6) / 2)) / 2 : 1;
        setP(p);
        if (k < 8) requestAnimationFrame(step); else setTimeout(function () { if (visible(box)) play(); else onView(box, play); }, 400);
      }
      requestAnimationFrame(step);
    }
    onView(box, play);
  }

  /* ── 4 · conformal acceptance for one decision ──────────────────────────────────────────────────────────── */
  function conformal(box) {
    var stage = frame(box);
    var CASES = [
      { host: 'HQ-FS01', finding: 'SMB signing not required', p: [0.97, 0.02, 0.01], out: 'accepted at R2 · recorded with its receipt' },
      { host: 'HQ-APP01', finding: 'SMB signing not required', p: [0.58, 0.37, 0.05], out: 'two options in the set · climbs to R3, then R4' }
    ];
    var OPTS = ['holds', 'does not hold', 'cannot tell'];
    var grid = h('div', 'cf-grid', null, stage);
    var cards = CASES.map(function (c) {
      var card = h('div', 'cf-card', null, grid);
      h('div', 'cf-q', '<span>D2</span> Does <b>' + c.finding + '</b> hold on <b>' + c.host + '</b>?', card);
      var bars = OPTS.map(function (o, i) {
        var row = h('div', 'cf-row', null, card);
        h('span', 'cf-lab', o, row);
        var track = h('span', 'cf-track', null, row);
        var fill = h('span', 'cf-fill', null, track);
        var v = h('span', 'cf-val', '0.00', row);
        return { fill: fill, v: v, p: c.p[i], row: row };
      });
      h('div', 'cf-thr', 'set at α = 0.05: options above the conformal threshold (0.20)', card);
      var out = h('div', 'cf-out', '', card);
      return { c: c, bars: bars, out: out };
    });
    function show(k) {
      cards.forEach(function (cd) {
        cd.bars.forEach(function (b) {
          var p = b.p * k; b.fill.style.width = (p * 100) + '%'; b.v.textContent = p.toFixed(2);
          b.row.classList.toggle('in', k >= 1 && b.p >= 0.2);
        });
        var inSet = cd.bars.filter(function (b) { return b.p >= 0.2; }).length;
        cd.out.textContent = k >= 1 ? cd.c.out : '';
        cd.out.className = 'cf-out ' + (k >= 1 ? (inSet === 1 ? 'ok' : 'up') : '');
      });
    }
    function play() {
      if (REDUCED) { show(1); return; }
      show(0); var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400);
        show(1 - Math.pow(1 - k, 3));
        if (k < 1) requestAnimationFrame(step);
        else setTimeout(function () { if (visible(box)) play(); else onView(box, play); }, 6500);
      }
      requestAnimationFrame(step);
    }
    onView(box, play);
  }

  /* ── 5 · inside a Job: beliefs, evidence and the next best check ───────────────────────────────────────── */
  function job(box) {
    var stage = frame(box);
    var HYP = ['Endpoint agent crashing on HQ-RDS01', 'Profile share slow on HQ-FS01', 'Kerberos time skew from HQ-DC01', 'Network path on host HQ-HV01'];
    var STEPS = [
      { ev: 'The complaint: "remote users keep getting kicked off" · family: RDP sessions dropping', b: [0.22, 0.30, 0.20, 0.28], next: ['Disconnect events on HQ-RDS01 and its peers', 0.61], gate: '' },
      { ev: 'Peers on the same pattern show no drops: the shared-dependency test is negative', b: [0.55, 0.14, 0.10, 0.21], next: ['Application log on HQ-RDS01, 24 h', 0.48], gate: '' },
      { ev: 'Application log: the endpoint agent service crashes 31 times in 24 h, on HQ-RDS01 only', b: [0.86, 0.05, 0.03, 0.06], next: ['Correlate crash times with disconnects', 0.40], gate: '' },
      { ev: 'Code: each crash precedes a disconnect by about 14 s (31 of 31)', b: [0.97, 0.01, 0.01, 0.01], next: ['none needed', 0], gate: 'root-cause gate: correlation in time ✓ · conformal singleton ✓ · confirmed' }
    ];
    var ev = h('div', 'jb-ev', '', stage);
    var bars = h('div', 'jb-bars', null, stage);
    var rows = HYP.map(function (t) {
      var r = h('div', 'jb-row', null, bars);
      h('span', 'jb-lab', t, r);
      var tr = h('span', 'jb-track', null, r);
      var f = h('span', 'jb-fill', null, tr);
      var v = h('span', 'jb-val', '', r);
      return { f: f, v: v, r: r };
    });
    var nx = h('div', 'jb-next', '', stage);
    var gate = h('div', 'jb-gate', '', stage);
    function set(i) {
      var s = STEPS[i];
      ev.innerHTML = '<span>Evidence ' + (i + 1) + ' of ' + STEPS.length + '</span> ' + s.ev;
      rows.forEach(function (r, k) { r.f.style.width = (s.b[k] * 100) + '%'; r.v.textContent = s.b[k].toFixed(2); r.r.classList.toggle('top', k === 0 && s.b[0] > 0.5); });
      nx.innerHTML = s.next[1] ? 'Next check, by expected information per unit of cost: <b>' + s.next[0] + '</b> <i>' + s.next[1].toFixed(2) + ' bits</i>' : 'No further check is worth its cost.';
      gate.textContent = s.gate; gate.classList.toggle('on', !!s.gate);
    }
    function play() {
      if (REDUCED) { set(STEPS.length - 1); return; }
      var i = 0; set(0);
      var timer = setInterval(function () {
        i++;
        if (i >= STEPS.length) { clearInterval(timer); setTimeout(function () { if (visible(box)) play(); else onView(box, play); }, 4200); return; }
        set(i);
      }, 2600);
    }
    onView(box, play);
  }

  var MAP = { 'viz-ladder': ladder, 'viz-gliner': gliner, 'viz-calibration': calibration, 'viz-conformal': conformal, 'viz-job': job };
  function boot() {
    [].slice.call(document.querySelectorAll('.viz[id]')).forEach(function (b) {
      var f = MAP[b.id];
      if (f && !b.getAttribute('data-ready')) { b.setAttribute('data-ready', '1'); try { f(b); } catch (e) { b.textContent = ''; } }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
