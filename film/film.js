/* The film's player. Three kinds of scene: a card (typed words over the loom), a drawn scene (scenes.js, a pure
   function of time on its own canvas), and a clip (the real program, recorded, played still). Each clip and drawn
   scene says what it is above its caption. A clip is its own clock, so the words never drift from the picture.
   ?s=<scene>&t=<seconds> opens on that moment, paused; ?play=1 starts at once (for recording the film itself). */
(function () {
'use strict';
var W = 1920, H = 1080, $ = function (id) { return document.getElementById(id); };
var stage = $('stage'), v = $('v'), dc = $('dc'), cap = $('cap'), rail = $('rail'), g = dc.getContext('2d');
var loom = Loom($('loomc'), {density: 130, from: 0.615, to: 0.955, calm: true});
var SRC = {rec: 'Recorded as it happened', replay: 'Replayed from the run’s own record', drawn: 'Drawn for this film from measured figures',
           real: 'Recorded as it happened, the real model working'};
var BY = ['Designed and built by eMazzanti Technologies', 'Ryan Haig, Forward Deployed Engineer'];

function typed(el, text, t, from, per) { var n = Math.max(0, Math.floor((t - from) / (per || 26))); el.textContent = t < from ? '' : text.slice(0, n); }
function card(o) { return function (t) {
  typed($('tE'), o.e || '', t, 250, 22); typed($('tH'), o.h || '', t, o.hAt || 700, 30); typed($('tP'), o.p || '', t, o.pAt || 2400, 17);
  var b = $('tB'); b.textContent = '';
  if (o.by && t > (o.byAt || 2600)) { b.appendChild(document.createTextNode(o.by[0])); }
  $('tF').textContent = o.f || ''; $('tF').classList.toggle('on', !!o.f && t > (o.fAt || 5200)); }; }
function act(n, h, p) { return {name: n, dur: 6200, kind: 'card', draw: card({e: n, h: h, hAt: 380, p: p, pAt: 1500})}; }
function clip(name, file, at, d, act, src, say) { return {name: name, dur: d * 1000, kind: 'clip', clip: 'clips/' + file + '.mp4', at: at, act: act, src: src, say: say}; }
function drawn(name, scene, act, say) { var f = window.FilmScenes[scene]; return {name: name, dur: f.dur, kind: 'draw', scene: f, act: act, src: 'drawn', say: say || []}; }

/* ── the scenes, in order ─────────────────────────────────────────────────────────────────────────────────────── */
var S = [
  {name: 'Opening', dur: 9500, kind: 'card', credit: true,
   draw: card({e: 'NinjaToolKit v9', h: BY[0] + '.', hAt: 500, p: BY[1], pAt: 2300,
               f: 'An AI harness for managed Windows Server estates and WatchGuard firewalls, from ingestion to the deliverable. The estate is invented and kept small so every step can be followed; every screen is the real released program, built against a real estate of 189 captured servers under 48 clients and 54 exports of 37 Fireboxes.', fAt: 4300})},
  act('Act I', 'The whole machine.', 'Script and telemetry in, one record, 179 deterministic checks, a frontier model reading every server whole, code holding every word to the evidence, and an engineer at every gate.'),
  drawn('The whole machine', 'machine', 'Act I', []),

  act('Act II', 'Ingestion, by script.', 'An empty install and the demo estate: a roster, then one capture of its thirty-one servers, 47 sections each, filed under their clients as they land. A drop takes files of up to 200 MB, as many as there are; the real 189-server capture is one 34 MB file.'),
  clip('The roster, then the capture', 'i-intake', 0, 27, 'Act II', 'rec', [
    [.5, 7, 'Drop it anywhere. It files itself.', 'The roster goes first: five invented clients, every device placed under its client and site.'],
    [7.5, 17, 'One capture, every server in it.', 'Split by machine, cut into 47 sections, each section parsed by its own reader. Each server lands in its own short write, so nobody waits behind the drop.'],
    [17.5, 26.5, 'Every server filed cleanly under its client.', 'Who is who is decided from evidence, rung by rung. An address never places anything.']]),
  clip('The estate fills in', 'i-estate', 0, 35, 'Act II', 'rec', [
    [.5, 6.5, 'Every client, every server, as it is right now.', 'Each server is a column on the wheel; rings run from noticed on the rim to proved at the centre.'],
    [7, 17, 'Clients, worst first.', 'Critical and high findings counted per client the moment the capture lands.'],
    [17.5, 34.5, 'Topology: where the outside reaches in.', 'Every firewall that publishes inward, every route it publishes, and what it lands on.']]),

  act('Act III', 'Ingestion, firewalls.', 'The demo’s seven WatchGuard exports in one drop; a drop takes as many as there are. Each is read by two independent readers into one firewall model and judged by 62 checks as it lands, the same readers that read all 54 real exports of 37 Fireboxes.'),
  clip('The exports, taken apart', 'i-exports', 0, 34, 'Act III', 'rec', [
    [.5, 20, 'Every export audited as it lands.', 'Findings counted, elements new to the program named, each waiting for an engineer to say whose it is.'],
    [20.5, 27.5, 'The newest export, taken apart.', 'The XML as it came, by device, by part, into objects: every policy, alias, service and tunnel the export holds.'],
    [28, 33.5, 'Every element accounted for.', 'Across the 54 real exports it was built against, 1,923 value-carrying paths: 1,531 read and stated, 23 secrets never shown, 369 out of scope with a reason each.']]),
  clip('A firewall, opened', 'i-firewall', 0, 12, 'Act III', 'rec', [
    [.5, 11.5, 'One Firebox: posture, ways in, rules, tunnels.', 'Every count on the opening opens the named rows behind it. Every policy carries Policy Manager’s own number.']]),
  drawn('Exposure is a path', 'ways', 'Act III', []),
  clip('Linked by an engineer', 'a-link-b', 0, 24, 'Act III', 'rec', [
    [.5, 11, 'Linked to its client by an engineer.', 'Its routes now join that client’s servers, joined within the client only.'],
    [11.5, 23.5, 'Port 443 lands on the ERP web server; port 33890 on Remote Desktop.', 'The exposure is the translation, not the port number on the policy.']]),

  act('Act IV', 'Ingestion, by telemetry.', 'The demo’s twenty-two invented servers speaking the real agent’s protocol: mutual TLS 1.3, a private certificate authority, outbound only. The listener was load-tested with fifty agents for an hour without losing a batch.'),
  clip('Agents join', 'a-agents', 0, 46, 'Act IV', 'rec', [
    [.5, 15, 'Each agent makes its own key.', 'It checks the listener’s pinned fingerprint, spends a single-use code once, and is signed by the office’s own authority.'],
    [15.5, 30, 'Health every 5 minutes, each event log every 10, the network hourly, the inventory daily.', 'Read through the Windows API. No child process, no event text, nothing listening at a client.'],
    [30.5, 45.5, 'The estate fills in as they report.', 'Light runs from each server to whoever decided its reading.']]),
  drawn('The standing watch', 'funnel', 'Act IV', []),
  clip('Jobs nobody opened', 'a-jobs-b', 0, 19, 'Act IV', 'rec', [
    [.5, 18.5, 'Eight Jobs, opened by the watch on its own.', 'Two clocks seven minutes ahead, a file server at 2.9% free with its shadow copies failing, servers waiting eight days for a reboot.']]),
  clip('Five servers go quiet', 'a-silent', 0, 29, 'Act IV', 'rec', [
    [.5, 12, 'Five servers go quiet together.', 'The watch opens one Job for all five: servers silent in the same minute are one problem.'],
    [12.5, 28.5, 'Its issue, and the way forward.', 'Found, checked, a fix written, approved, proved: each step waits where it should.']]),

  act('Act V', 'The record, as dashboards.', 'One SQLite schema, 101 tables, one writer. Every screen is pushed over one socket the moment a write lands.'),
  clip('Today', 'r-today', 0, 17, 'Act V', 'replay', [
    [.5, 6.5, 'Today: what needs the engineer, in working order.', 'Above every page, the newest run told from its record: each layer, what it settled, what it cost.'],
    [7, 16.5, 'A check waiting for one press, and the questions only people can answer.', 'The check was written by the model and proved read-only by PowerShell’s own parser; each question is asked once and its answer kept as a fact.']]),
  clip('A client', 'r-client', 0, 23, 'Act V', 'replay', [
    [.5, 10, 'The Reactor, replayed.', 'Every question a run set out to settle falls inward to the cheapest layer that could settle it: code, GLiNER, the decision model, a check, Opus, the engineer.'],
    [10.5, 22.5, 'A client’s dashboard: every server live from its agent.', 'Then what the reads found on each server, and where each finding stands: settled, likely, or waiting on a named check.']]),
  clip('A server, every field', 'r-server-tabs', 0, 17, 'Act V', 'replay', [
    [.5, 6, 'What is wrong, by area, with its evidence.', 'Identity, network, operating system: each finding named, scored and placed.'],
    [6.5, 11.5, 'Microsoft on its events.', '166 of Microsoft’s articles on documented causes, joined to the events this server counted.'],
    [12, 16.5, 'Every field the collector captured.', '478 of them for this server. Absence is said, never drawn as a zero.']]),

  act('Act VI', 'Diagnostics.', 'A frontier model reads one server’s entire output in one call. Nothing acts on its words until code has checked them.'),
  drawn('One server, read whole', 'read', 'Act VI', []),
  clip('Read this server whole', 'f5-read-press-b', 0, 21, 'Act VI', 'real', [
    [.5, 20.5, 'Read this server whole.', 'Its raw output in one call, with what the office knows and what the checks raise beside it. The real model, recorded as it worked.']]),
  clip('The whole read, drawn', 'r-server', 0, 36, 'Act VI', 'replay', [
    [.5, 12, 'One server, read whole.', '37,601 characters of BR-DC01’s output read and 10,644 written, its findings numbered from the root.'],
    [12.5, 24, 'Every finding stands on the lines it quotes.', 'Each quote is found in the capture four ways, strictest first, and the number of records it fits is kept.'],
    [24.5, 35.5, 'What it found, most important first.', 'The root, then what follows from it, then what only a person can answer, then what is fine.']]),
  clip('Filed, and where each item went', 'f5-read-words-b', 0, 33, 'Act VI', 'real', [
    [.5, 9, 'Filed into typed items.', 'Findings, eighteen read-only checks, questions for the office: prose turned into records code can verify.'],
    [9.5, 22, 'GLiNER proposes, Opus confirms.', 'Sixty names proposed by the local model; each confirmation becomes a label that fits next week’s line.'],
    [22.5, 32.5, 'Proved before it touches a server.', '91 of 91 quotes found in the capture, 18 of 18 checks proved to only read.']]),
  drawn('Held to the evidence', 'proof', 'Act VI', []),
  clip('The engine', 'r-engine', 0, 34, 'Act VI', 'replay', [
    [.5, 14, 'Every layer at work.', 'Seventeen questions entered. Of those settled, code took half for nothing and Opus half for $1.77; twelve wait on the engineer.'],
    [14.5, 33.5, 'Follow one finding.', 'One finding told layer by layer in its own words, from the line it came from to the gate.']]),
  clip('The second look', 'f6-second-look', 0, 33, 'Act VI', 'real', [
    [.5, 14.5, 'The second look, once the checks came back.', 'The same conversation picked up with what each check printed. $1.83.'],
    [15, 32.5, '“The PDC has no time reference (settled).”', 'The cause moved up the chain: from a branch server seven minutes off to the whole domain’s unanchored time.']]),
  clip('The Job, as a rope', 'r-job', 0, 31, 'Act VI', 'replay', [
    [.5, 15, 'How this Job was worked out.', 'Evidence taken apart into lines by source, read by code, GLiNER and the decision model, braided into one rope per issue.'],
    [15.5, 30.5, 'Each pass of the loop pulls it tighter.', 'Ruled-out causes peel away; a cause is confirmed only on a real proof, weighed by Bayes’ rule in code.']]),

  act('Act VII', 'Remediation.', 'Every finding placed into one fix. Fixes in the order an engineer works them. Each written whole, gated, run, and proved from outside the change.'),
  clip('Placed, and put in order', 'r-fixes', 0, 27, 'Act VII', 'replay', [
    [.5, 13, 'Each finding placed into one fix.', 'The decision model places it above its fitted line, recalibrated by isotonic regression and bounded by Clopper-Pearson; below the line, Opus decides.'],
    [13.5, 26.5, 'The line of work.', 'The root before its symptoms; time, then DNS, then Kerberos, then logons; the first server a canary.']]),
  drawn('A fix, written whole', 'fixgate', 'Act VII', []),
  clip('At the gate', 'r-gate', 0, 21.5, 'Act VII', 'replay', [
    [.5, 5, 'One fix at the gate, in four parts.', 'A test that is true while the problem exists, the change with its guards, the proof, and the way back.'],
    [5.5, 15, 'The change refuses to guess.', 'If the setting comes from Group Policy or DHCP it stops and says where the real fix belongs; it saves the exact state for its way back.'],
    [15.5, 21, 'Approved by a named engineer, then applied.', 'Sent to BR-FS01’s agent with its digest and run only if the digest is the script’s own; proved later against servers nobody touched.']]),
  clip('The firewall fix, proved by the next export', 'a-fix', 0, 30, 'Act VII', 'rec', [
    [.5, 11, 'Firewall fixes are made by hand.', 'In Policy Manager or the Web UI, never pushed. Remote Desktop moves behind the SSL VPN.'],
    [11.5, 29.5, 'The next export is the proof.', 'Read again from the export itself: three ways in where there were four.']]),
  clip('The same Firebox, after the fix', 'r-fwafter', 0, 25, 'Act VII', 'replay', [
    [.5, 6, 'The same Firebox, read from its new export.', 'Three ways in where there were four.'],
    [6.5, 11, 'Every way in, drawn again.', 'Each path from the internet to what it reaches, with its gate.'],
    [11.5, 24.5, 'What changed since the last export.', '4 opened, 5 went, 17 held: each that went waits for a verdict on its cause, and is never called fixed without a recorded change.']]),

  act('Act VIII', 'The audits.', 'Two client deliverables from the same record the screens show. The model writes the words; code checks every name and number.'),
  drawn('Code checks every word', 'audits', 'Act VIII', []),
  clip('An audit put together, then opened', 'r-audits', 0, 38, 'Act VIII', 'replay', [
    [.5, 14, 'An audit assembled from the record.', 'Servers captured, sections read, findings held, poured into its chapters as facts.'],
    [14.5, 27, 'The Comprehensive Site Audit.', 'Its cover: posture 56 of 100, set by Network. Every action numbered, with its chapter, its severity and its first step; the findings at a glance.'],
    [27.5, 37.5, 'Every server, and its load.', 'The servers audited, then each server’s processor, memory, disk and uptime drawn from the capture’s own rows.']]),
  clip('The Comprehensive Firewall Audit', 'r-fwaudit-b', 0, 44, 'Act VIII', 'replay', [
    [.5, 12, 'The Comprehensive Firewall Audit.', 'Its cover: posture 41 of 100, set by Operations. Then the executive summary, the dominant risk and the immediate actions.'],
    [12.5, 16.5, 'What is right, and what changed since the last audit.', 'Four new findings, five gone, seventeen still standing; then the scope and the method.'],
    [17, 27, 'Every way in, and who may reach it.', 'Each rule the internet can use, what stands in its way, and the host it lands on.'],
    [27.5, 33, 'Attack paths, step by step.', 'Each chain a sequence of rules in the export, ending on the change that breaks it.'],
    [33.5, 38, 'Tunnels graded part by part.', 'Every IKE policy and its proposals, against the standards the finding cites.'],
    [38.5, 43.5, 'Every finding, whole.', 'Its NIST control and ATT&CK technique, the evidence from the export, and the fix by hand, step by step.']]),

  act('Act IX', 'Talking to the work, and running it.', 'A fact the record holds is answered from the record. Office decides who does what, and what may run alone.'),
  clip('The console', 'g-console', 0, 30, 'Act IX', 'rec', [
    [.5, 29.5, 'The console on BR-DC01.', 'When did it last boot, which certificates have expired: answered from its capture, dated, without a model.']]),
  clip('Office', 'r-office', 0, 10, 'Act IX', 'rec', [
    [.5, 9.5, 'Office: everything the program speaks to.', 'The model provider, the decision model, GLiNER, the agents, the firewall vendor’s cloud, sign-in: each with what it may do alone.']]),

  act('Act X', 'The machinery, and the proof.', 'Cheapest first, held to the evidence, and measured, never recalled.'),
  drawn('Cheapest first', 'engine', 'Act X', []),
  drawn('The line', 'agentline', 'Act X', []),
  drawn('Measured, never recalled', 'proved', 'Act X', []),
  {name: 'End', dur: 9000, kind: 'card', credit: true,
   draw: card({e: 'NinjaToolKit v9', h: BY[0] + '.', hAt: 380, p: BY[1], pAt: 1800,
               f: 'Invented data throughout. The program is private company software; this film shows its behaviour, not its source. The full technical case study is beside this film.', fAt: 3600})}
];

var stall = 0, idx = 0, t = 0, playing = false, lastTs = 0, capNow = -2, total = S.reduce(function (a, s) { return a + s.dur; }, 0), ready = false;
var Q = 1;
function fit() { var b = $('wrap').getBoundingClientRect(), k = Math.min(b.width / W, b.height / H); stage.style.transform = 'scale(' + k + ')';
  Q = Math.max(1, Math.min(1.5, k * (window.devicePixelRatio || 1))); dc.width = Math.round(W * Q); dc.height = Math.round(H * Q);
  loom.resize(); if (ready) paint(); }
window.addEventListener('resize', fit);
S.forEach(function (s, i) { var a = document.createElement('a'); a.style.flex = s.dur + ' 1 0'; a.title = s.name; a.appendChild(document.createElement('i'));
  a.addEventListener('click', function (e) { var r = a.getBoundingClientRect(); enter(i, s.dur * Math.min(.98, Math.max(0, (e.clientX - r.left) / r.width))); if (!playing) play(); });
  rail.appendChild(a); });
function fmt(ms) { var s = Math.floor(ms / 1000); return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + s % 60).slice(-2); }
function elapsed() { var a = 0; for (var i = 0; i < idx; i++) a += S[i].dur; return a + t; }

function enter(i, at) {
  var s = S[i], was = S[idx]; idx = i; t = at || 0; stall = 0; capNow = -2; cap.classList.remove('on'); stage.classList.remove('said');
  stage.classList.toggle('card', s.kind === 'card'); stage.classList.toggle('draw', s.kind === 'draw'); stage.classList.toggle('clip', s.kind === 'clip');
  $('tB').textContent = '';
  if (s.kind === 'clip') {
    var same = v.getAttribute('data-src') === s.clip && was && was.clip === s.clip && Math.abs(v.currentTime - (s.at + t / 1000)) < .25;
    if (!same) { stage.classList.add('cut');
      var seek = function () { v.currentTime = s.at + t / 1000; };
      if (v.getAttribute('data-src') !== s.clip) { v.setAttribute('data-src', s.clip); v.src = s.clip; v.addEventListener('loadedmetadata', seek, {once: true}); } else seek();
      v.addEventListener('seeked', function () { stage.classList.remove('cut'); if (playing) v.play().catch(function () {}); }, {once: true}); }
    else if (playing) v.play().catch(function () {});
  } else v.pause();
  [].forEach.call(rail.children, function (a, k) { a.classList.toggle('past', k < i); a.classList.toggle('now', k === i); });
  $('name').textContent = s.name;
  paint();
}
function caption(s, sec) {
  var now = -1; (s.say || []).forEach(function (q, i) { if (sec >= q[0] && sec <= q[1]) now = i; });
  if (now === capNow) return; capNow = now;
  if (now < 0) { cap.classList.remove('on'); stage.classList.remove('said'); return; }
  var q = s.say[now]; $('cS').innerHTML = ''; var b = document.createElement('b'); b.textContent = s.act || ''; $('cS').appendChild(b);
  $('cS').appendChild(document.createTextNode(SRC[s.src] || ''));
  $('cL').textContent = q[2]; if (q[3]) { var sm = document.createElement('small'); sm.textContent = q[3]; $('cL').appendChild(sm); }
  cap.classList.add('on'); stage.classList.add('said');
}
function paint() {
  var s = S[idx], sec = t / 1000;
  if (s.kind === 'card') { s.draw(t); if (s.credit) { var b = $('tB'); b.textContent = ''; } loom.draw(elapsed() * .9 + 3000); }
  if (s.kind === 'draw') { g.setTransform(Q, 0, 0, Q, 0, 0); s.scene(g, t); }
  caption(s, sec);
  var here = rail.children[idx]; if (here) here.firstChild.style.width = Math.min(100, 100 * t / s.dur) + '%';
  $('name').textContent = s.name + '   ' + fmt(elapsed()) + ' / ' + fmt(total);
}
function tick(ts) {
  if (!playing) return;
  var s = S[idx], dt = Math.min(100, ts - (lastTs || ts)); lastTs = ts;
  if (s.kind === 'clip' && !stage.classList.contains('cut') && v.readyState >= 2 && !v.paused) { t = Math.max(t, (v.currentTime - s.at) * 1000); stall = 0; }
  else if (s.kind !== 'clip' || v.ended) t += dt;           /* a clip shorter than its scene holds its last frame */
  else {                                                    /* a clip that has not started: after 2.5 s the film goes on by the clock */
    stall += dt;
    if (stall > 2500) { stage.classList.remove('cut'); if (v.paused) v.play().catch(function () {}); t += dt; }
  }
  if (t >= s.dur) { if (idx + 1 < S.length) enter(idx + 1, 0); else { pause(); t = s.dur; } }
  paint(); requestAnimationFrame(tick);
}
function play() { if (playing) return; if (idx === S.length - 1 && t >= S[idx].dur) enter(0, 0); playing = true; lastTs = 0; $('pp').textContent = 'Pause'; $('start').classList.add('off');
  if (S[idx].kind === 'clip') v.play().catch(function () {}); requestAnimationFrame(tick); }
function pause() { playing = false; v.pause(); $('pp').textContent = 'Play'; }
$('pp').addEventListener('click', function () { playing ? pause() : play(); });
$('start').addEventListener('click', play);
document.addEventListener('keydown', function (e) {
  if (e.key === ' ') { e.preventDefault(); playing ? pause() : play(); }
  if (e.key === 'ArrowRight' && idx + 1 < S.length) enter(idx + 1, 0);
  if (e.key === 'ArrowLeft') enter(t > 1500 || idx === 0 ? idx : idx - 1, 0);
  if (e.key === 'f' && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
});
var acts = S.filter(function (s) { return /^Act /.test(s.act || '') ; }).map(function (s) { return s.act; }).filter(function (a, i, A) { return A.indexOf(a) === i; }).length;
$('startNote').innerHTML = 'About ' + Math.round(total / 60000) + ' minutes. No sound: the words are on screen.<br>Space pauses, the arrow keys move between scenes, the rail jumps to any scene.';
window.FILM = {seek: function (i, sec) { $('start').classList.add('off'); enter(i, (sec || 0) * 1000); }, scenes: S, play: play};
fit(); enter(0, 0); ready = true;
var q = new URLSearchParams(location.search);
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
  if (q.get('s')) window.FILM.seek(+q.get('s'), +(q.get('t') || 0));
  if (q.get('play')) { $('start').classList.add('off'); play(); }
});
})();
