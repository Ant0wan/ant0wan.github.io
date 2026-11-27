/* Faint background for the Mathematics page, in the same spirit as the fish and
   the blown-away book pages elsewhere on the site.
   - Bottom left, Fourier epicycles: a chain of circles, each turning at a whole
     multiple of the base frequency, draws a closed curve with the tip of the last
     one (a pentagram, a trefoil, a Lissajous figure, a hypotrochoid, a lemniscate).
     The coefficients are the largest terms of the discrete Fourier transform of
     the curve, so the drawing is the curve's own Fourier series.
   - Top right, a wireframe surface turns slowly in 3D: a torus, a Möbius strip,
     a saddle (z = x² − y²), one after the other.
   - Classic formulas surface here and there, drift a little and fade away.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?math=debug to see it clearly. */
(function () {
  if (window.__mathBg) return;
  window.__mathBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]math=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', baseAlpha = 0.1;
  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";

  function rand(a, b) { return a + Math.random() * (b - a); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 0.75 : dark ? 0.085 : 0.1;
  }
  function stroke(a) { ctx.strokeStyle = ink; ctx.globalAlpha = Math.max(0, Math.min(1, a)); }
  function fill(a) { ctx.fillStyle = ink; ctx.globalAlpha = Math.max(0, Math.min(1, a)); }

  /* ---------------- Fourier epicycles ---------------- */

  var TAU = Math.PI * 2;
  var CURVES = [
    function (t) { // pentagram, its five straight edges drawn by circles
      var u = (t / TAU % 1 + 1) % 1 * 5, k = Math.floor(u), f = u - k;
      var a0 = -Math.PI / 2 + k * 4 * Math.PI / 5, a1 = a0 + 4 * Math.PI / 5;
      return [(1 - f) * Math.cos(a0) + f * Math.cos(a1), (1 - f) * Math.sin(a0) + f * Math.sin(a1)];
    },
    function (t) { return [Math.sin(t) + 2 * Math.sin(2 * t), Math.cos(t) - 2 * Math.cos(2 * t)]; },                                                  // trefoil
    function (t) { return [Math.sin(3 * t), Math.sin(2 * t)]; },                                                                                      // Lissajous 3:2
    function (t) { var R = 5, r = 3, d = 5; return [(R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t), (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t)]; }, // hypotrochoid
    function (t) { var c = Math.cos(t), s = Math.sin(t), q = 1 + s * s; return [c / q, s * c / q]; }                                                  // lemniscate of Bernoulli
  ];
  var PERIODS = [1, 1, 1, 3, 1]; // multiples of 2π needed to close each curve
  var epi = { idx: -1, terms: [], t0: 0, period: 14, trail: [] };

  function buildCurve(i) {
    var N = 256, pts = [], f = CURVES[i], span = TAU * PERIODS[i];
    for (var k = 0; k < N; k++) pts.push(f(k / N * span));
    // centre and scale to unit size
    var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= N; cy /= N;
    var m = 0; pts.forEach(function (p) { m = Math.max(m, Math.hypot(p[0] - cx, p[1] - cy)); });
    pts = pts.map(function (p) { return [(p[0] - cx) / m, (p[1] - cy) / m]; });
    // discrete Fourier transform
    var terms = [];
    for (var fq = -N / 2; fq < N / 2; fq++) {
      var re = 0, im = 0;
      for (var n = 0; n < N; n++) { var a = -TAU * fq * n / N; re += pts[n][0] * Math.cos(a) - pts[n][1] * Math.sin(a); im += pts[n][0] * Math.sin(a) + pts[n][1] * Math.cos(a); }
      re /= N; im /= N;
      terms.push({ f: fq, r: Math.hypot(re, im), ph: Math.atan2(im, re) });
    }
    terms.sort(function (a, b) { return b.r - a.r; });
    epi.terms = terms.slice(0, 26);
    epi.idx = i; epi.t0 = time; epi.trail = [];
  }

  function drawEpicycles(alpha) {
    if (!epi.terms.length) return;
    var u = (time - epi.t0) / epi.period;            // 0..1 draws the curve once
    if (u > 1.35) { buildCurve((epi.idx + 1) % CURVES.length); u = 0; }
    var S = Math.min(W, H) * 0.17, cx = W * 0.2, cy = H * 0.7;
    if (W < 700) { cx = W * 0.25; cy = H * 0.8; S = Math.min(W, H) * 0.2; }
    var x = cx, y = cy, ang = TAU * Math.min(u, 1);
    ctx.lineWidth = 1;
    epi.terms.forEach(function (c, i) {
      var r = c.r * S;
      if (r > 1.2) { stroke(alpha * 0.45); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
      var nx = x + r * Math.cos(c.f * ang + c.ph), ny = y + r * Math.sin(c.f * ang + c.ph);
      stroke(alpha * 0.7); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
      x = nx; y = ny;
    });
    if (u <= 1) epi.trail.push([x, y]);
    var fade = u > 1 ? 1 - (u - 1) / 0.35 : 1;
    stroke(alpha * 1.6 * fade); ctx.lineWidth = 1.6; ctx.beginPath();
    epi.trail.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); });
    ctx.stroke();
    if (u <= 1) { fill(alpha * 2); ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); }
  }

  /* ---------------- turning wireframe surface ---------------- */

  var SURFACES = [
    { u: [0, TAU], v: [0, TAU], nu: 28, nv: 14, f: function (u, v) { var R = 1, r = .42; return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)]; } }, // torus
    { u: [0, TAU], v: [-1, 1], nu: 40, nv: 6, f: function (u, v) { var w = 1 + v / 2 * Math.cos(u / 2); return [w * Math.cos(u), w * Math.sin(u), v / 2 * Math.sin(u / 2)]; } },             // Möbius strip
    { u: [-1, 1], v: [-1, 1], nu: 14, nv: 14, f: function (u, v) { return [u * 1.1, v * 1.1, (u * u - v * v) * .7]; } }                                                                      // saddle
  ];
  var SURF_TIME = 22;

  function project(p, rx, ry, cx, cy, S) {
    var x = p[0], y = p[1], z = p[2];
    var c = Math.cos(ry), s = Math.sin(ry), x1 = c * x + s * z, z1 = -s * x + c * z;   // turn about the vertical
    c = Math.cos(rx); s = Math.sin(rx); var y1 = c * y - s * z1, z2 = s * y + c * z1; // tilt towards the viewer
    var k = 3.2 / (3.2 + z2);
    return [cx + x1 * S * k, cy + y1 * S * k];
  }
  function drawSurface(sf, alpha) {
    var S = Math.min(W, H) * 0.16, cx = W * 0.8, cy = H * 0.28;
    if (W < 700) { cx = W * 0.75; cy = H * 0.18; S = Math.min(W, H) * 0.2; }
    var rx = -1.05 + Math.sin(time * 0.11) * 0.25, ry = time * 0.18;
    stroke(alpha); ctx.lineWidth = 1;
    function line(fixU, val, n) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var t = i / n, u = fixU ? val : sf.u[0] + (sf.u[1] - sf.u[0]) * t, v = fixU ? sf.v[0] + (sf.v[1] - sf.v[0]) * t : val;
        var q = project(sf.f(u, v), rx, ry, cx, cy, S);
        i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
      }
      ctx.stroke();
    }
    for (var i = 0; i <= sf.nu; i++) line(true, sf.u[0] + (sf.u[1] - sf.u[0]) * i / sf.nu, 48);
    for (var j = 0; j <= sf.nv; j++) line(false, sf.v[0] + (sf.v[1] - sf.v[0]) * j / sf.nv, 64);
  }
  function drawSurfaces(alpha) {
    var k = time / SURF_TIME, i = Math.floor(k) % SURFACES.length, f = k - Math.floor(k), xf = 0.08;
    if (f < xf) { drawSurface(SURFACES[(i + SURFACES.length - 1) % SURFACES.length], alpha * (1 - f / xf)); drawSurface(SURFACES[i], alpha * f / xf); }
    else drawSurface(SURFACES[i], alpha);
  }

  /* ---------------- drifting formulas ---------------- */

  var FORMULAS = [
    'e^{iπ} + 1 = 0', 'a^{2} + b^{2} = c^{2}', '∑_{n≥1} 1/n^{2} = π^{2}/6', '∫_{−∞}^{∞} e^{−x^{2}} dx = √π',
    'φ = (1 + √5) / 2', 'F_{n+1} = F_{n} + F_{n−1}', 'V − E + F = 2', 'ζ(s) = ∑ n^{−s}',
    'lim_{x→0} sin x / x = 1', 'd/dx e^{x} = e^{x}', 'x = (−b ± √(b^{2} − 4ac)) / 2a', 'Γ(n) = (n − 1)!',
    'i^{2} = −1', 'e^{iθ} = cos θ + i sin θ', '∮ f(z) dz = 2πi ∑ Res', 'n! ≈ √(2πn) (n/e)^{n}',
    'π = 4 ∑ (−1)^{k}/(2k + 1)', 'det(A − λI) = 0', '∂u/∂t = α ∇^{2}u', 'p ∧ ¬p ⇒ q'
  ];
  var floating = [], nextFormula = 0;

  // tiny layout for x^{...} and x_{...}, nested
  function parse(s) {
    var out = [], i = 0;
    function group(level) {
      var buf = '';
      while (i < s.length) {
        var c = s[i];
        if (c === '}') { i++; break; }
        if ((c === '^' || c === '_') && s[i + 1] === '{') {
          if (buf) { out.push({ t: buf, lv: level }); buf = ''; }
          i += 2; group(level.concat(c === '^' ? 1 : -1)); continue;
        }
        buf += c; i++;
      }
      if (buf) out.push({ t: buf, lv: level });
    }
    group([]);
    return out;
  }
  function drawFormula(fm, alpha) {
    var x = fm.x, size = fm.size;
    fill(alpha); ctx.textBaseline = 'alphabetic';
    fm.parts.forEach(function (p) {
      var sz = size * Math.pow(0.68, p.lv.length), dy = 0, s = size;
      p.lv.forEach(function (d) { dy -= d * s * 0.38; s *= 0.68; });
      ctx.font = 'italic ' + sz.toFixed(1) + 'px ' + FONT;
      ctx.fillText(p.t, x, fm.y + dy);
      x += ctx.measureText(p.t).width;
    });
  }
  function spawnFormula(initial) {
    var size = rand(15, 30), text = FORMULAS[Math.floor(Math.random() * FORMULAS.length)];
    if (floating.some(function (f) { return f.text === text; })) return;
    var w = text.length * size * 0.42, fm = null;
    for (var tries = 0; tries < 12 && !fm; tries++) {
      var x = rand(0.03, 0.97) * W - w * Math.random(), y = rand(0.08, 0.95) * H;
      x = Math.max(8, Math.min(W - w - 8, x));
      var clash = floating.some(function (f) { return x < f.x + f.w + 30 && f.x < x + w + 30 && Math.abs(y - f.y) < (size + f.size) * 1.4; });
      if (!clash) fm = { text: text, parts: parse(text), size: size, w: w, x: x, y: y,
                         vx: rand(-4, 4), vy: rand(-7, -2), t0: time - (initial ? rand(0, 8) : 0), life: rand(9, 15) };
    }
    if (fm) floating.push(fm);
  }
  function drawFormulas(alpha) {
    floating = floating.filter(function (f) { return time - f.t0 < f.life; });
    floating.forEach(function (f) {
      var a = time - f.t0, k = Math.min(1, a / 2, (f.life - a) / 2.5);
      f.x += f.vx * dtLast; f.y += f.vy * dtLast;
      drawFormula(f, alpha * 1.2 * Math.max(0, k));
    });
  }

  /* ---------------- frame ---------------- */

  var dtLast = 0;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = ctx.lineJoin = 'round';
    drawSurfaces(baseAlpha);
    drawEpicycles(baseAlpha);
    drawFormulas(baseAlpha);
    ctx.globalAlpha = 1;
  }
  function step(dt) {
    time += dt; dtLast = dt;
    if (time > nextFormula) { if (floating.length < (W < 700 ? 4 : 8)) spawnFormula(false); nextFormula = time + rand(1, 2.5); }
  }

  var last = 0;
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (dt > 0) step(dt); else dtLast = 0;
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'math-bg';
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    cv.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor();
    resize();
    buildCurve(Math.floor(Math.random() * CURVES.length));
    for (var i = 0; i < (W < 700 ? 3 : 6); i++) spawnFormula(true);
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    var skip = /[?&]math-t=(\d+)/.exec(location.search); // test: start n seconds in
    if (skip) for (var s = 0; s < +skip[1] * 30; s++) { step(1 / 30); drawEpicycles(0); }
    if (reduce) { epi.t0 = -epi.period; for (var k = 0; k < 400; k++) { time = epi.t0 + epi.period * k / 400; drawEpicyclesTrailOnly(); } time = 0; dtLast = 0; draw(); }
    else requestAnimationFrame(frame);
  }
  // reduced motion: build the full trail once without animating
  function drawEpicyclesTrailOnly() {
    var u = Math.min(1, (time - epi.t0) / epi.period), S = Math.min(W, H) * 0.17, cx = W * 0.2, cy = H * 0.7;
    if (W < 700) { cx = W * 0.25; cy = H * 0.8; S = Math.min(W, H) * 0.2; }
    var x = cx, y = cy, ang = TAU * u;
    epi.terms.forEach(function (c) { x += c.r * S * Math.cos(c.f * ang + c.ph); y += c.r * S * Math.sin(c.f * ang + c.ph); });
    epi.trail.push([x, y]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
