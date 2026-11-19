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
   draw: card({e: 'NinjaToolKit v9.0.1', h: BY[0] + '.', hAt: 500, p: BY[1], pAt: 2300,
               f: 'An AI harness for managed Windows Server estates and WatchGuard firewalls. The companies, servers and firewalls in this film are invented; every screen is the real released program.', fAt: 4300})},
  act('Act I', 'The whole machine.', 'One loop and every part of it moving, each with what it measured on the run filmed here.'),
  drawn('The whole machine', 'machine', 'Act I', []),

  act('Act II', 'An estate lands.', 'An empty install. Five invented clients, thirty-one servers, seven firewalls, and twenty-two agents speaking the real protocol.'),
  clip('A new install is empty', 'a-ingest', 0, 36, 'Act II', 'rec', [
    [.5, 9.5, 'A new install is empty.', 'It seeds nothing. Every screen reads only what is brought in.'],
    [10, 21, 'The office is named; the engineer names themselves.', 'Everything they do from here carries that name.'],
    [21.5, 35.5, 'The roster first, then one capture of thirty-one servers.', 'Each server lands under its client and its 47 sections are parsed as it arrives. The worst is put first.']]),
  clip('Seven firewalls', 'a-exports', 0, 25, 'Act II', 'rec', [
    [.5, 12, 'Seven firewall exports in one drop.', 'Each is read into one model of its Firebox and judged as it lands.'],
    [12.5, 24.5, 'Firewalls, the most exposed first.', 'A posture is the worst of its areas, so it always says why.']]),
  clip('Agents join', 'a-agents', 0, 46, 'Act II', 'rec', [
    [.5, 15, 'Agents join, through the real protocol.', 'Each makes its own key, spends a single-use code once, and is given a certificate by the office’s own authority.'],
    [15.5, 30, 'Twenty-two of them, at three clients.', 'Each calls out over TLS 1.3 and holds the line open. Nothing listens at a client.'],
    [30.5, 45.5, 'The estate fills in as they report.', 'Light runs from each server to whoever decided its reading.']]),
  drawn('The standing watch', 'funnel', 'Act II', []),
  clip('Jobs nobody opened', 'a-jobs', 0, 30, 'Act II', 'rec', [
    [.5, 11, 'Today: nothing needs the engineer yet.', 'Below it, the last hour of every client’s readings, already running through code.'],
    [11.5, 29.5, 'Work: eight Jobs nobody pressed for.', 'Rules in code opened them from the agents’ first readings: two clocks seven minutes ahead, a file server at 2.9% free with its shadow copies failing, servers waiting eight days for a reboot.']]),
  clip('The estate, live', 'g-wheel', 0, 20, 'Act II', 'rec', [
    [.5, 19.5, 'The estate, live.', 'Every reading travels from its server to whoever decided it. The agents’ count climbs as readings land; thirteen questions wait on the engineer.']]),

  act('Act III', 'What code knows, before any model.', '177 deterministic checks on every server and firewall, free, as each capture lands.'),
  clip('A client, as a dashboard', 'g-client', 0, 32, 'Act III', 'rec', [
    [.5, 10.5, 'A client opens as a dashboard.', 'Live or snapshot is one switch: each server’s last report, processor, memory and the least room on its disks.'],
    [11, 20, 'Above it, the newest run, told from its record.', 'A read the AI provider refused when the account reached its limit. The program said so in plain words and spent nothing.'],
    [20.5, 31.5, 'What leans on what.', 'The servers side by side, and the read’s sixteen findings stacked on BR-DC01, root at the bottom.']]),
  clip('A server, every field', 'g-server', 0, 34, 'Act III', 'rec', [
    [.5, 11, 'One server. Every fact says its source and its age.', 'From the capture, or live from its agent.'],
    [11.5, 33.5, 'What is wrong, by area, then every view.', 'Network, posture, identity, security, infrastructure, software, data and keys, and every field the collector captured.']]),

  act('Act IV', 'The firewall pillar.', 'Every way in, traced from the internet through NAT and policy to the process that answers.'),
  drawn('Exposure is a path', 'ways', 'Act IV', []),
  clip('Linked by an engineer', 'a-link', 0, 33, 'Act IV', 'rec', [
    [.5, 9, 'A firewall belongs to a client only when an engineer says so.', 'Never by a guess from its file name.'],
    [9.5, 20, 'Linked. Its routes now join that client’s servers.', 'An address on another client’s network is never this firewall’s path.'],
    [20.5, 32.5, 'Four ways in, every one open to any address.', 'Port 443 lands on HQ-APP01. Port 33890 lands on Remote Desktop on HQ-RDS01.']]),
  clip('A firewall Job', 'f3-job', 0, 28, 'Act IV', 'rec', [
    [.5, 12, 'A firewall Job: one issue per change.', 'From the clean run. Code settles 22 of its 44 questions at once; the other 22 wait for their proof.'],
    [12.5, 27.5, 'Its fixes are made by hand.', 'In Policy Manager or the Web UI, never pushed. The next export is the proof.']]),
  clip('The fix, proved by the next export', 'a-fix', 0, 30, 'Act IV', 'rec', [
    [.5, 11, 'The fix, made by hand, and the new export brought in.', 'The vendor’s Remote Desktop rule and its NAT are gone; remote access moves behind the SSL VPN.'],
    [11.5, 29.5, 'Read again from the export itself.', 'Three ways in now. Between the two exports: 4 opened, 5 went, 17 held, and each that went waits for a verdict on its cause.']]),
  clip('Every way in, drawn', 'g-firewall', 0, 26, 'Act IV', 'rec', [
    [.5, 25.5, 'Every way in, drawn.', 'The routes that remain, each from the internet to what it reaches, each burning where nothing gates it.']]),

  act('Act V', 'The read, whole.', 'A frontier model reads one server’s entire output in one call. Nothing acts on its words until code has checked them.'),
  drawn('One server, read whole', 'read', 'Act V', []),
  clip('Read this server whole', 'f5-read-press', 0, 48, 'Act V', 'real', [
    [.5, 12.5, 'BR-DC01, a branch domain controller.', 'Its clock is seven minutes off the app’s, and Kerberos is failing around it.'],
    [13, 26.5, 'What the checks found, by area.', 'Seven findings from code. They are context for the read, never a filter in front of it.'],
    [27, 47.5, 'Read this server whole.', 'Its raw output in one call, with what the office knows. The real model, recorded as it worked.']]),
  clip('Filed, and where each item went', 'f5-read-words', 26, 33, 'Act V', 'real', [
    [.5, 9, 'Filed into typed items.', 'Its findings, and its eighteen read-only checks, each waiting for a press.'],
    [9.5, 22, 'And what only people can answer.', 'Fifteen questions for the office: who owns an account, which DHCP scope hands out DNS.'],
    [22.5, 32.5, 'Where each item went.', '60 names proposed by GLiNER, 91 of 91 quotes found in the capture, 18 of 18 checks proved to only read.']]),

  act('Act VI', 'Held to the evidence.', 'Quotes found in the capture, checks proved to only read, and a gate that code decides.'),
  drawn('Held to the evidence', 'proof', 'Act VI', []),
  clip('Held for a press', 'f5-held-press', 0, 28, 'Act VI', 'real', [
    [.5, 12.5, 'The second opinion held the script for one press.', 'Any doubt asks the engineer. The gate is code, never a question put to a model.'],
    [13, 27.5, 'Run it. The script goes to BR-DC01’s own agent.', 'This press was a defect in v9.0.0, found by this run and fixed in v9.0.1.']]),

  act('Act VII', 'The engine.', 'Every question climbs, cheapest first: code, the reader of names, the decision model, a check on the server, Opus, the engineer.'),
  drawn('Cheapest first', 'engine', 'Act VII', []),
  clip('The engine, live', 'g-engine', 0, 21, 'Act VII', 'rec', [
    [.5, 20.5, 'The engine page, live.', 'This hour the watch is reading the fleet: code settles what it can, thirteen questions wait on the engineer, and nothing has needed Opus.']]),
  clip('Placement, replayed', 'g-place', 0, 27, 'Act VII', 'replay', [
    [.5, 26.5, 'Each finding placed into one fix.', 'Above the decision model’s fitted line it is placed; below it, Opus decides. On this run, 42 by the decision model and 6 by Opus.']]),

  act('Act VIII', 'The second look, and a fix through the gate.', 'From the rehearsal the same evening, where the checks came back in time.'),
  clip('The second look', 'f6-second-look', 0, 33, 'Act VIII', 'real', [
    [.5, 14.5, 'The second look, once the checks came back.', 'The same conversation picked up with what each check printed. $1.83.'],
    [15, 32.5, '“The PDC has no time reference (settled).”', 'The cause moved up the chain: the branch was not the problem; the domain’s own time source was.']]),
  clip('The second look, replayed', 'g-second', 0, 31, 'Act VIII', 'replay', [
    [.5, 11, 'The same run, told again from its record.', 'One question, settled by Opus.'],
    [11.5, 30.5, 'Where each finding came from.', 'The server’s output read line by line, each finding drawn from the lines it rests on.']]),
  drawn('A fix, written whole', 'fixgate', 'Act VIII', []),
  clip('At the gate', 'g-gate', 0, 26, 'Act VIII', 'rec', [
    [.5, 25.5, 'One fix at the gate.', 'Its test, its change, its proof and its way back, then its record: proposed, approved, sent to the agent, applied.']]),
  clip('The Job, as a rope', 'g-job', 0, 26, 'Act VIII', 'replay', [
    [.5, 25.5, 'The Job, as a rope.', 'Evidence taken apart into lines, read by code, GLiNER and the decision model, and braided into one rope per issue.']]),

  act('Act IX', 'Agents and the watch, live.', 'Twenty-two invented servers speaking the real agent’s protocol, reporting while this was filmed.'),
  drawn('The line', 'agentline', 'Act IX', []),
  clip('Five servers go quiet', 'a-silent', 0, 29, 'Act IX', 'rec', [
    [.5, 12, 'Five servers go quiet.', 'Halden Wray’s agents stopped reporting. After fifteen minutes the watch opened one Job for all five, not five Jobs.'],
    [12.5, 28.5, 'Its issue, and the way forward.', 'Found, checked, a fix written, approved, proved: each step waits where it should.']]),

  act('Act X', 'Both audits.', 'Client deliverables, rendered from the same record the pages show.'),
  drawn('Code checks every word', 'audits', 'Act X', []),
  clip('A site audit, made', 'a-site', 0, 25, 'Act X', 'rec', [
    [.5, 24.5, 'A site audit, made.', 'With the AI off it writes itself in code’s own words. With it on, the model writes and code checks every name and number.']]),
  clip('An audit put together', 'a-auditspage', 0, 15, 'Act X', 'rec', [
    [.5, 14.5, 'An audit put together from the record, chapter by chapter.', 'Above it, the audit’s run told again: each chapter tried by code first.']]),
  clip('The Comprehensive Site Audit', 'a-siteaudit', 0, 28, 'Act X', 'rec', [
    [.5, 27.5, 'The Comprehensive Site Audit.', 'Posture 56 of 100, set by Network. Every server once, every finding in full, each naming its servers.']]),
  clip('A firewall audit, at work', 'a-fwrun', 0, 24, 'Act X', 'rec', [
    [.5, 23.5, 'A firewall audit, at work.', 'Above the page, its run as it happens: each chapter tried by code, then by Opus; with the AI off, code’s words stand.']]),
  clip('The Comprehensive Firewall Audit', 'a-fwaudit', 0, 32, 'Act X', 'rec', [
    [.5, 31.5, 'The Comprehensive Firewall Audit.', 'Thirteen chapters, the network drawn from the export, a client’s copy, an engineer’s copy and a Brief.']]),

  act('Act XI', 'Talking to the work, and running it.', 'A fact the record holds is answered from the record. Office decides who does what, and what may run alone.'),
  clip('The console', 'g-console', 0, 30, 'Act XI', 'rec', [
    [.5, 29.5, 'The console on BR-DC01.', 'When did it last boot, which certificates have expired: answered from its capture, dated, without a model.']]),
  clip('Office', 'g-office', 0, 40, 'Act XI', 'rec', [
    [.5, 15, 'Office: the seats.', 'Everything the program reaches out to, and whether each is set up.'],
    [15.5, 26, 'The decision model’s lines, drawn.', 'Each typed question with its calibrated line.'],
    [26.5, 39.5, 'People, agents, keys, the record of every act, and the backups.', 'A checked copy every night, and a second folder on another disk or another machine.']]),

  act('Act XII', 'How it was proved.', 'And what the release found by being run for real.'),
  drawn('Measured, never recalled', 'proved', 'Act XII', []),
  {name: 'End', dur: 9000, kind: 'card', credit: true,
   draw: card({e: 'NinjaToolKit v9.0.1', h: BY[0] + '.', hAt: 380, p: BY[1], pAt: 1800,
               f: 'Invented data throughout. The program is private company software; this film shows its behaviour, not its source. The full technical case study is beside this film.', fAt: 3600})}
];

var idx = 0, t = 0, playing = false, lastTs = 0, capNow = -2, total = S.reduce(function (a, s) { return a + s.dur; }, 0), ready = false;
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
  var s = S[i], was = S[idx]; idx = i; t = at || 0; capNow = -2; cap.classList.remove('on'); stage.classList.remove('said');
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
  if (s.kind === 'clip' && !stage.classList.contains('cut') && v.readyState >= 2 && !v.paused) t = Math.max(t, (v.currentTime - s.at) * 1000);
  else if (s.kind !== 'clip' || v.ended) t += dt;           /* a clip shorter than its scene holds its last frame */
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
