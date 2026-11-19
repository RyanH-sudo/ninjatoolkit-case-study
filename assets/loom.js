/* The loom: every question a run sets out to settle travels through the stations, cheapest first, and stops at the
   one that can prove its answer. Drawn by hand on canvas. It is the method drawn, not a measurement, and the page
   says so beside it. The picture is a pure function of time, so any moment can be drawn on its own.
   Loom(canvas, {density, from, to, labels, calm, seed}) -> {start, stop, draw(tMs), resize} */
(function () {
  'use strict';
  /* where evidence comes from: colour, share */
  var SRC = [['#D8D1C2', 0.46], ['#4FE3C1', 0.26], ['#7EA6FF', 0.14], ['#E8A06E', 0.09], ['#EDBE7F', 0.05]];
  /* who settles it: name, mark, colour, share of questions that stop here (drawn, not measured) */
  var STN = [['Code', 'square', '#A9B1BB', 0.60], ['GLiNER', 'bead', '#9BE7FF', 0.07], ['Decision model', 'diamond', '#FF5C83', 0.12],
             ['Opus', 'ring', '#EAFBF4', 0.17], ['You', 'knot', '#EDBE7F', 0.04]];
  function h(a, b, c) { var x = Math.imul(a + 1, 0x9E3779B1) ^ Math.imul(b + 7, 0x85EBCA6B) ^ Math.imul(c + 13, 0xC2B2AE35);
    x ^= x >>> 15; x = Math.imul(x, 0x2C1B3C6D); x ^= x >>> 12; x = Math.imul(x, 0x297A2D39); x ^= x >>> 15; return (x >>> 0) / 4294967296; }
  function pick(x, table, k) { var a = 0; for (var i = 0; i < table.length; i++) { a += table[i][k]; if (x < a) return i; } return table.length - 1; }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function mark(g, kind, x, y, s, col) {
    g.save(); g.translate(x, y); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.4;
    if (kind === 'square') { g.fillRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4); }
    else if (kind === 'bead') { g.beginPath(); g.arc(0, 0, s * 0.85, 0, 6.2832); g.stroke(); }
    else if (kind === 'diamond') { g.beginPath(); g.moveTo(0, -s); g.lineTo(s, 0); g.lineTo(0, s); g.lineTo(-s, 0); g.closePath(); g.fill(); }
    else if (kind === 'ring') { g.beginPath(); g.arc(0, 0, s * 0.95, 0, 6.2832); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.3, 0, 6.2832); g.fill(); }
    else { g.beginPath(); g.arc(0, 0, s * 1.05, 0, 6.2832); g.stroke(); g.beginPath(); g.arc(0, 0, s * 0.5, 0, 6.2832); g.fill(); }
    g.restore();
  }
  window.Loom = function (canvas, opt) {
    opt = opt || {};
    var g = canvas.getContext('2d'), W = 0, H = 0, dpr = 1, raf = 0, t0 = 0, running = false;
    var N = opt.density || 110, seed = opt.seed || 76, LINGER = opt.calm ? 9000 : 7000;
    function size() { dpr = Math.min(2, window.devicePixelRatio || 1); var b = canvas.getBoundingClientRect(), k = canvas.offsetWidth ? b.width / canvas.offsetWidth : 1;
      /* a canvas inside a scaled stage keeps its own layout size */
      W = Math.max(320, canvas.offsetWidth || b.width); H = Math.max(200, canvas.offsetHeight || b.height);
      var px = Math.min(2, dpr * Math.max(0.5, k)); canvas.width = Math.round(W * px); canvas.height = Math.round(H * px); dpr = px; }
    function sx(i) { var a = opt.from === undefined ? 0.30 : opt.from, b = opt.to === undefined ? 0.93 : opt.to; return W * (a + (b - a) * i / (STN.length - 1)); }
    function draw(now) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      var top = H * 0.12, bot = H * 0.9, i;
      for (i = 0; i < STN.length; i++) { var x = sx(i);
        var gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(58,58,66,0)'); gr.addColorStop(0.5, 'rgba(58,58,66,.9)'); gr.addColorStop(1, 'rgba(58,58,66,0)');
        g.strokeStyle = gr; g.lineWidth = 1; g.setLineDash([2, 5]); g.beginPath(); g.moveTo(x + 0.5, top); g.lineTo(x + 0.5, bot); g.stroke(); g.setLineDash([]);
        if (opt.labels !== false) { mark(g, STN[i][1], x - 34, top - 14, 4.2, STN[i][2]);
          g.font = '500 11px "Geist", sans-serif'; g.fillStyle = '#BEBAB1'; g.textAlign = 'left'; g.textBaseline = 'middle';
          try { g.letterSpacing = '1.4px'; } catch (e) {}
          g.fillText(STN[i][0].toUpperCase(), x - 24, top - 13.5); } }
      for (i = 0; i < N; i++) {
        var life = 2800 + 2600 * h(seed, i, 1), wait = 2600 * h(seed, i, 2), P = wait + life + LINGER;
        var tt = now + P * h(seed, i, 3) + 60000, n = Math.floor(tt / P), age = tt - n * P - wait;
        if (age < 0) continue;
        var end = pick(h(seed + n, i, 4), STN, 3), col = SRC[pick(h(seed + n, i, 5), SRC, 1)][0];
        life += end * 650;
        var y0 = H * (0.16 + 0.70 * h(seed + n, i, 6)), y1 = H * (0.5 + (y0 / H - 0.5) * (0.84 - end * 0.13)), xe = sx(end), x0 = -20;
        if (age <= life + 700) {
          var k = Math.min(1, age / life), head = x0 + (xe - x0) * ease(k), tail = Math.max(x0, head - W * 0.34), fade = k < 1 ? 1 : 1 - (age - life) / 700;
          var yh = y0 + (y1 - y0) * ease((head - x0) / (xe - x0)), yt = y0 + (y1 - y0) * ease(Math.max(0, (tail - x0) / (xe - x0)));
          var lg = g.createLinearGradient(tail, 0, head, 0); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, col);
          g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.9 * Math.max(0, fade); g.strokeStyle = lg; g.lineWidth = 1.1 + 0.9 * h(seed, i, 7);
          g.beginPath(); g.moveTo(tail, yt); g.bezierCurveTo(tail + (head - tail) * 0.5, yt, head - (head - tail) * 0.4, yh, head, yh); g.stroke();
          g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
        }
        if (age >= life) { var a = 1 - (age - life) / LINGER, pop = Math.max(0, 1 - (age - life) / 500);
          g.globalAlpha = Math.max(0, 0.25 + 0.75 * a) * Math.min(1, a * 4); mark(g, STN[end][1], xe, y1, 2.7 + 4 * pop, STN[end][2]); g.globalAlpha = 1; }
      }
    }
    function frame(ts) { if (!running) return; if (!t0) t0 = ts; draw(ts - t0); raf = requestAnimationFrame(frame); }
    size(); window.addEventListener('resize', function () { size(); if (!running) draw(4000); });
    return { start: function () { if (running) return; running = true; raf = requestAnimationFrame(frame); },
             stop: function () { running = false; cancelAnimationFrame(raf); },
             draw: function (t) { draw(t); }, resize: size };
  };
})();
