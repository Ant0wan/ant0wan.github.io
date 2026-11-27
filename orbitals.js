/* Faint background for the Chemistry page: hydrogen atomic orbitals, drawn as
   clouds of stippled points like the probability densities of a quantum
   mechanics textbook.
   - Each cloud is sampled from |ψ(n, ℓ, m)|², the probability density of the
     electron in a hydrogen orbital, picked at random among all 55 orbitals up to
     n = 5 (s, p, d, f, g, real forms; ψ built from Laguerre polynomials and
     spherical harmonics), by rejection sampling when the orbital appears. The
     density is raised to a small power (except for s) so the lobes stand out.
     Under each cloud, its name (2p_x, 3d_z², 4f_xyz…) and its quantum numbers. The two
     phases of the wavefunction are told apart by the tone of the points: the
     lobes where ψ > 0 are a little darker than those where ψ < 0.
   - One orbital at a time, turning slowly in 3D, and one chemical formula at a
     time, each in a margin beside the text, each coming and going on its own
     clock (an orbital stays 10 to 16 seconds, a formula 7 to 12). Each new one
     takes a random side, but never more than twice in a row the same side; when the
     other one is on that side, it takes the other half of the screen.
   - Each formula shows its kind (molecule, strong or weak acid or base, oxide,
     cation, anion, salt…), its name and its molar mass, as in a reference
     table, picked at random among the some 340 entries of compounds.js.
   - And one element of the periodic table at a time, among all 118: its cell
     (atomic number, symbol, name, standard atomic weight, or in brackets the
     mass number of its longest-lived isotope) and below it who discovered it,
     and when. It comes and goes on its own clock too, and never overlaps the
     orbital or the formula: the margins hold four places, one per half.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?orbitals=debug to see it clearly. */
(function () {
  if (window.__orbitalsBg) return;
  window.__orbitalsBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]orbitals=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', baseAlpha = 0.2;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 1 : dark ? 0.2 : 0.22;
  }

  /* ---------------- hydrogen orbitals, from hydrogen.js ---------------- */

  // every hydrogen orbital up to n = 5 (55 of them), real forms
  var HY = window.Hydrogen, ORBITALS = [];
  for (var n = 1; n <= 5; n++) for (var l = 0; l < n; l++) for (var m = -l; m <= l; m++) ORBITALS.push(HY.orbital(n, l, m));
  var N_POINTS = 4200, SHARP = 1.6;   // density raised to a power: the lobes stand out more clearly
  function sampler(o) { return HY.sampler(o, SHARP); }
  function grow(S, ms) { HY.grow(S, ms, N_POINTS); }

  /* ---------------- one orbital and one formula, each with its own life ---------------- */

  // one orbital and one formula at most, each coming and going on its own clock
  var FADE = 2.2, orb = null, form = null, elem = null;
  function pick(prev) {
    var o; do { o = ORBITALS[Math.floor(Math.random() * ORBITALS.length)]; } while (o === prev);
    return o;
  }
  // height: the upper or the lower half; if the other one is on the same side, the half it leaves free
  // a side at random, but never more than twice in a row the same side, and a free half on it;
  // false when the side it must take is full: the item then waits for a place to free up
  function settle(it, prev, others) {
    var taken = others.filter(function (o) { return o && !o.wait; }).map(function (o) { return o.side * 2 + o.slot; });
    function freeOn(sd) { return [0, 1].filter(function (sl) { return taken.indexOf(sd * 2 + sl) < 0; }); }
    var forced = prev && prev.run >= 2, side = forced ? 1 - prev.side : (Math.random() < .5 ? 0 : 1), free = freeOn(side);
    if (!free.length) { if (forced) return false; side = 1 - side; free = freeOn(side); if (!free.length) return false; }
    it.side = side; it.run = prev && prev.side === side ? prev.run + 1 : 1;
    it.slot = free[Math.floor(Math.random() * free.length)];
    it.y = it.slot ? rnd(.62, .68) : rnd(.25, .31);
    return true;
  }
  function place(it, prev, others) { it.prev = prev; it.others = others; it.wait = !settle(it, prev, others()); if (!it.wait) it.prev = null; return it; }
  function retry(it) { // a waiting item tries again; it fades in from the moment it finds its place
    if (!it.wait || time < it.t0) return;
    if (settle(it, it.prev, it.others())) { it.wait = false; it.prev = null; it.t0 = time; } else it.t0 = time + .5;
  }

  function newOrbital(t0) {
    var o = pick(orb && orb.o), S = sampler(o); grow(S, 25);
    var it = { kind: 'orb', o: o, S: S, pts: S.pts, t0: t0, life: rnd(10, 16), spin: rnd(.1, .22) * (Math.random() < .5 ? -1 : 1), tilt: rnd(.3, .9), ph: rnd(0, 6.283) };
    return place(it, orb, function () { return [form, elem]; });
  }
  function newElement(t0) {
    var e; do { e = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]; } while (elem && e === elem.e);
    var it = { kind: 'elem', e: e, t0: t0, life: rnd(8, 13) };
    return place(it, elem, function () { return [orb, form]; });
  }
  function newFormula(t0) {
    var it = { kind: 'form', cmp: pickCompound(form && form.cmp), t0: t0, life: rnd(7, 12) };
    return place(it, form, function () { return [orb, elem]; });
  }
  function places() { // the left margin and the right one; the height is chosen afresh for each appearance
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    var lw = r.left, rw = W - r.right, sz = function (w) { return Math.max(60, Math.min(w * .38, H * .2)); };
    return [
      { x: lw / 2, s: sz(lw), w: lw },
      { x: r.right + rw / 2, s: sz(rw), w: rw }
    ];
  }
  function at(p, yFrac) { return { x: p.x, y: H * yFrac, s: p.s, w: p.w }; }

  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";

  /* ---------------- the elements of the periodic table ---------------- */

  // the 118 elements (Z, symbol, name, atomic weight, discoverer…), from elements.js
  var ELEMENTS = window.PERIODIC_ELEMENTS || [];
  function wrap(text, maxW) { // lines no wider than maxW at the current font
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (line && ctx.measureText(t).width > maxW) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines;
  }
  function drawElement(e, p, a) { // a periodic-table cell, and below it who discovered the element
    var fs = Math.max(14, Math.min(20, p.w * .05)), B = fs * 4.2, x0 = p.x - B / 2, y0 = p.y - B / 2;
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.strokeStyle = ctx.fillStyle = ink; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, B, B);
    ctx.textBaseline = 'alphabetic';
    ctx.font = (fs * .62) + 'px ' + FONT; ctx.textAlign = 'left'; ctx.fillText(String(e.z), x0 + fs * .3, y0 + fs * .85);
    ctx.font = (fs * 1.9) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.fillText(e.sym, p.x, y0 + B * .6);
    ctx.font = (fs * .56) + 'px ' + FONT; ctx.fillText(e.name, p.x, y0 + B * .78);
    ctx.font = (fs * .5) + 'px ' + FONT; ctx.fillText(e.mass, p.x, y0 + B * .92);
    ctx.font = 'italic ' + (fs * .62) + 'px ' + FONT;
    var by = e.by === 'known since antiquity' ? ['known since antiquity'] : wrap('discovered by ' + e.by, Math.max(B * 2.2, 170));
    by.slice(0, 4).forEach(function (l, i) { ctx.fillText(l, p.x, y0 + B + fs * (1.05 + i * .85)); });
  }

  /* ---------------- chemical formulas, shown with each orbital in the other margin ---------------- */

  // the compounds (formula, name, kind) and their formulas and molar masses, from compounds.js
  var CP = window.Compounds, COMPOUNDS = CP.list.map(function (c) { return [c.f, c.name, c.kind]; });
  var tokens = CP.tokens, molarMass = CP.molarMass;
  function kind(c) { return c[2]; }
  function pickCompound(prev) { var c; do { c = COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)]; } while (c === prev || c[0] === (prev && prev[0])); return c; }
  function drawTokens(tk, cx, y, fs, italic) { // a line of normal / subscript / superscript pieces, centred on cx
    var w = 0, st = (italic ? 'italic ' : '');
    function font(m) { return st + (m ? fs * .66 : fs) + 'px ' + FONT; }
    tk.forEach(function (t) { ctx.font = font(t[1]); t.w = ctx.measureText(t[0]).width; w += t.w; });
    var x = cx - w / 2;
    tk.forEach(function (t) { ctx.font = font(t[1]); ctx.fillText(t[0], x, y + (t[1] === 1 ? fs * .24 : t[1] === 2 ? -fs * .4 : 0)); x += t.w; });
  }
  function drawFormula(cmp, p, a) { // as in a reference table: formula, name, molar mass
    var fs = Math.max(15, Math.min(22, p.w * .055)), y = p.y;
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = (fs * .46) + 'px ' + FONT; ctx.textAlign = 'center'; if ('letterSpacing' in ctx) ctx.letterSpacing = (fs * .12) + 'px';   // its kind, in small spaced capitals
    ctx.fillText(kind(cmp).toUpperCase(), p.x, y - fs * 1.05); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
    drawTokens(tokens(cmp[0]), p.x, y, fs, false);
    ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText(cmp[1], p.x, y + fs * 1.25);
    ctx.textAlign = 'left';
    drawTokens([['M = ' + molarMass(cmp[0]).toFixed(2) + ' g·mol', 0], ['−1', 2]], p.x, y + fs * 2.2, fs * .58, true);
  }

  function drawLabel(o, p, a) { // the name under the cloud, e.g. 3d with xz as a subscript, and its quantum numbers
    var fs = Math.max(12, Math.min(20, p.s * .16)), y = p.y + p.s * 1.12 + fs;
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic';
    ctx.font = fs + 'px ' + FONT; var w1 = ctx.measureText(o.label).width;
    ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; var w2 = o.sub ? ctx.measureText(o.sub).width + 2 : 0;
    var x = p.x - (w1 + w2) / 2;
    ctx.textAlign = 'left'; ctx.font = fs + 'px ' + FONT; ctx.fillText(o.label, x, y);
    if (o.sub) { ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; ctx.fillText(o.sub, x + w1 + 1, y + fs * .3); }
    ctx.font = 'italic ' + (fs * .62) + 'px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('n = ' + o.n + ',  ℓ = ' + o.l + ',  m = ' + (o.m < 0 ? '−' + (-o.m) : o.m), p.x, y + fs * 1.15);
  }
  function drawCloud(c, p, a) {
    var cy = Math.cos(c.ph + time * c.spin), sy = Math.sin(c.ph + time * c.spin), ct = Math.cos(c.tilt), st = Math.sin(c.tilt);
    var light = a * .55;
    ctx.fillStyle = ink;
    for (var k = 0; k < 2; k++) {                       // the two phases, in two passes
      ctx.globalAlpha = k ? a : light;
      for (var i = 0; i < c.pts.length; i++) {
        var q = c.pts[i]; if (q[3] !== k) continue;
        var x = q[0] * cy + q[1] * sy, y0 = -q[0] * sy + q[1] * cy, z = q[2];
        var y = z * ct - y0 * st, d = z * st + y0 * ct;   // tilt towards the viewer; d is depth
        var px = p.x + x * p.s, py = p.y - y * p.s, sz = .9 + .4 * d;
        ctx.fillRect(px, py, sz, sz);
      }
    }
    // the nucleus
    ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
    drawLabel(c.o, p, a);
  }

  /* ---------------- frame ---------------- */

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var P = places();
    if (orb.S.pts.length < N_POINTS) grow(orb.S, reduce ? 400 : 5);
    // when one is gone, its successor comes after a pause of its own
    if (!reduce && time > orb.t0 + orb.life) orb = newOrbital(time + rnd(1, 3.5));
    if (!reduce && time > form.t0 + form.life) form = newFormula(time + rnd(1, 4));
    if (!reduce && time > elem.t0 + elem.life) elem = newElement(time + rnd(1.5, 5));
    if (!reduce) { retry(orb); retry(form); retry(elem); }
    function fade(it) { var age = time - it.t0; return it.wait ? 0 : reduce ? 1 : Math.min(1, age / FADE, (it.life - age) / FADE); }
    var ko = fade(orb), kf = fade(form);
    if (ko > 0) drawCloud(orb, at(P[orb.side], orb.y), baseAlpha * ko);
    if (kf > 0) drawFormula(form.cmp, at(P[form.side], form.y), baseAlpha * kf);
    var ke = fade(elem); if (ke > 0) drawElement(elem.e, at(P[elem.side], elem.y), baseAlpha * ke);
    ctx.globalAlpha = 1;
  }

  var last = 0;
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t; time += dt;
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'orbitals-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize();
    // two different orbitals to start with, half a life apart so they never change together
    orb = newOrbital(-FADE); form = newFormula(rnd(.5, 3)); elem = newElement(rnd(3, 6));   // one of each, out of step
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
