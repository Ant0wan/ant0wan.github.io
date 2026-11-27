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
   - One orbital at a time, in a margin beside the text, turning slowly in 3D.
     It condenses, stays about twenty seconds, fades away, and after a short
     pause the next one, picked at random, appears in the other margin.
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

  /* ---------------- hydrogen orbitals (atomic units, unnormalised) ---------------- */

  // every hydrogen orbital up to n = 5 (55 of them), real forms: ψ = R(n, l) · Y(l, m)
  function laguerre(k, al, x) { // generalised Laguerre polynomial L_k^al(x)
    if (k === 0) return 1;
    var a = 1, b = 1 + al - x;
    for (var j = 1; j < k; j++) { var c = ((2 * j + 1 + al - x) * b - (j + al) * a) / (j + 1); a = b; b = c; }
    return b;
  }
  function legendre(l, m, x) { // associated Legendre P_l^m(x), m >= 0
    var pmm = 1, sx = Math.sqrt(Math.max(0, 1 - x * x));
    for (var i = 1; i <= m; i++) pmm *= (2 * i - 1) * sx;
    if (l === m) return pmm;
    var p1 = x * (2 * m + 1) * pmm;
    if (l === m + 1) return p1;
    for (var ll = m + 2; ll <= l; ll++) { var p2 = ((2 * ll - 1) * x * p1 - (ll + m - 1) * pmm) / (ll - m); pmm = p1; p1 = p2; }
    return p1;
  }
  var NAMES = {
    0: { 0: '' },
    1: { 0: 'z', 1: 'x', '-1': 'y' },
    2: { 0: 'z²', 1: 'xz', '-1': 'yz', 2: 'x²−y²', '-2': 'xy' },
    3: { 0: 'z³', 1: 'xz²', '-1': 'yz²', 2: 'z(x²−y²)', '-2': 'xyz', 3: 'x(x²−3y²)', '-3': 'y(3x²−y²)' }
  };
  var ORBITALS = [];
  for (var n = 1; n <= 5; n++) for (var l = 0; l < n; l++) for (var m = -l; m <= l; m++) (function (n, l, m) {
    var sub = NAMES[l] ? NAMES[l][m] : 'm=' + (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m);
    ORBITALS.push({ n: n, l: l, m: m, label: n + 'spdfg'[l], sub: sub, L: n * (2.2 * n + 2.5),
      f: function (x, y, z, r) {
        var rho = 2 * r / n, R = Math.pow(rho, l) * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
        var ct = r > 0 ? z / r : 1, ph = Math.atan2(y, x), am = Math.abs(m);
        var Y = legendre(l, am, ct) * (m > 0 ? Math.cos(am * ph) : m < 0 ? Math.sin(am * ph) : 1);
        return R * Y;
      } });
  })(n, l, m);
  var N_POINTS = 4200, SHARP = 1.6;   // density raised to a power: the lobes stand out more clearly
  // rejection sampling of |ψ|² in a cube of half-side L, done a little at each frame so that a new
  // cloud condenses point by point and no frame is held up, even for the sparse n = 5 orbitals
  function sampler(o) {
    var L = o.L, max = 0, rw = [], i, x, y, z, r, v, d;
    for (i = 0; i < 12000; i++) {
      x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z); v = o.f(x, y, z, r);
      d = Math.pow(v * v, o.l ? SHARP : 1); max = Math.max(max, d); rw.push([r, d]);
    }
    // scale on the dense part of the cloud: the radius holding 90 % of the (weighted) density
    rw.sort(function (a, b) { return a[0] - b[0]; });
    var tot = rw.reduce(function (s, q) { return s + q[1]; }, 0), acc = 0, scale = L;
    for (i = 0; i < rw.length; i++) { acc += rw[i][1]; if (acc >= tot * .9) { scale = rw[i][0]; break; } }
    return { o: o, max: max * 1.15, pts: [], scale: scale || L, tries: 0 };
  }
  // rejection sampling, a little at each frame: a new cloud condenses point by point, and no frame is
  // held up, even for the sparse n = 5 orbitals
  function grow(S, ms) {
    var o = S.o, L = o.L, t0 = performance.now(), x, y, z, r, v;
    while (S.pts.length < N_POINTS && S.tries < 4e6 && performance.now() - t0 < ms) {
      for (var k = 0; k < 400; k++) {
        S.tries++;
        x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z); v = o.f(x, y, z, r);
        if (Math.random() * S.max < Math.pow(v * v, o.l ? SHARP : 1)) S.pts.push([x / S.scale, y / S.scale, z / S.scale, v >= 0 ? 1 : 0]);
      }
    }
  }

  /* ---------------- the three clouds ---------------- */

  var LIFE = 24, FADE = 3.5, GAP = 2.5, slots = [];
  function pick(exclude) {
    var o; do { o = ORBITALS[Math.floor(Math.random() * ORBITALS.length)]; } while (exclude.indexOf(o) >= 0);
    return o;
  }
  function newCloud(slot, t0) {
    var used = slots.map(function (s) { return s.cloud && s.cloud.o; });
    var o = pick(used);
    var S = sampler(o); grow(S, 25);
    return { o: o, S: S, pts: S.pts, t0: t0, life: LIFE + rnd(-4, 6), spin: rnd(.1, .22) * (Math.random() < .5 ? -1 : 1), tilt: rnd(.3, .9), ph: rnd(0, 6.283) };
  }
  function places() { // the two places an orbital can appear: the left margin or the right one
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    var lw = r.left, rw = W - r.right, sz = function (w) { return Math.max(60, Math.min(w * .38, H * .2)); };
    return [
      { x: lw / 2, y: H * .36, s: sz(lw) },
      { x: r.right + rw / 2, y: H * .56, s: sz(rw) }
    ];
  }

  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";
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
    slots.forEach(function (s) { if (s.cloud.S.pts.length < N_POINTS) grow(s.cloud.S, reduce ? 400 : 5); });
    slots.forEach(function (s) {
      var c = s.cloud, age = time - c.t0;
      if (!reduce && age > c.life) {             // gone: after a short empty pause, the next one, in the other margin
        s.side = 1 - s.side; s.cloud = newCloud(s, time + GAP); c = s.cloud; age = time - c.t0;
      }
      var k = Math.min(1, age / FADE, (c.life - age) / FADE);
      if (reduce) k = 1;
      if (k > 0) drawCloud(c, P[s.side], baseAlpha * k);
    });
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
    slots.push({ side: Math.random() < .5 ? 0 : 1 }); slots[0].cloud = newCloud(slots[0], 0); slots[0].cloud.t0 = -FADE;   // one orbital at a time
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
