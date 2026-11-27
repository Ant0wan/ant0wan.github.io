/* Faint background for the Geology page: the Alps in the manner of an ink-wash
   painting.
   - Four ranges, one behind the other, each a soft wash of ink that is darkest
     on the ridge and dissolves downwards into mist; the far ranges are paler,
     the near ones a little deeper. A Matterhorn-like pyramid rises somewhere at the back.
   - Banks of mist lie in the valleys between the ranges and drift slowly.
   - Now and then a pair of birds crosses the sky.
   The ranges are drawn at random, so every visit shows a new view. Very faint, no pointer events, paused in hidden tabs, a
   still frame for visitors who prefer reduced motion.
   Add ?alps=debug to see it clearly. */
(function () {
  if (window.__alpsBg) return;
  window.__alpsBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]alps=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', bg = '#fcfcf7', baseAlpha = 0.12;

  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || (dark ? '#0a0a07' : '#fcfcf7');
    baseAlpha = debug ? 0.8 : dark ? 0.14 : 0.16;
  }
  function seeded(seed) { // mulberry32
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }

  /* ---------------- the ranges ---------------- */

  // each range: height profile on x in [0, 1], as a fraction of the screen height above its base
  var N = 512;
  function profile(seed, rough, peaks) {
    var r = seeded(seed), h = new Float32Array(N + 1);
    h[0] = r(); h[N] = r();
    for (var step = N; step > 1; step /= 2) {           // midpoint displacement
      var amp = Math.pow(step / N, rough);
      for (var i = step / 2; i < N; i += step) h[i] = (h[i - step / 2] + h[i + step / 2]) / 2 + (r() - .5) * amp;
    }
    var lo = 1e9, hi = -1e9; for (var j = 0; j <= N; j++) { lo = Math.min(lo, h[j]); hi = Math.max(hi, h[j]); }
    for (j = 0; j <= N; j++) {
      var x = j / N, v = (h[j] - lo) / (hi - lo);
      peaks.forEach(function (p) {                       // named summits: sharp asymmetric pyramids
        var d = x - p.x, w = d < 0 ? p.wl : p.wr, f = Math.max(0, 1 - Math.abs(d) / w);
        v += p.h * Math.pow(f, 1.25);
      });
      h[j] = v;
    }
    return h;
  }
  // a new panorama at every visit: random seeds, and summits placed at random
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seed() { return Math.random() * 4294967296 | 0; }
  function summits(n, hMin, hMax, wMin, wMax) {
    var list = [];
    for (var i = 0; i < n; i++) list.push({ x: rnd(.05, .95), h: rnd(hMin, hMax), wl: rnd(wMin, wMax), wr: rnd(wMin, wMax) });
    return list;
  }
  var RANGES = [
    { base: .66, amp: .2, ink: .45, h: profile(seed(), rnd(.85, 1.05), [{ x: rnd(.15, .85), h: rnd(.7, 1), wl: rnd(.04, .06), wr: rnd(.05, .08) }].concat(summits(3, .25, .45, .05, .08))) },
    { base: .74, amp: .16, ink: .6, h: profile(seed(), rnd(1, 1.15), summits(2, .2, .35, .05, .09)) },
    { base: .84, amp: .1, ink: .8, h: profile(seed(), rnd(1.1, 1.3), []) },
    { base: .95, amp: .07, ink: 1, h: profile(seed(), rnd(1.2, 1.4), []) }
  ];
  function ridgeY(R, x) { // screen y of the ridge at screen x
    var u = Math.max(0, Math.min(N, x / W * N)), i = Math.floor(u), f = u - i, v = R.h[i] + (R.h[Math.min(N, i + 1)] - R.h[i]) * f;
    return H * (R.base - R.amp * v);
  }

  function rgbOf(hex) { var n = parseInt(hex.slice(1), 16); return (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255); }
  function drawRange(R, a) { // a wash of ink, strongest on the ridge, dissolving into the mist below
    var step = Math.max(2, W / 500), top = H, x;
    for (x = 0; x <= W; x += step) top = Math.min(top, ridgeY(R, x));
    var bottom = H * (R.base + .06), c = rgbOf(ink), g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, 'rgba(' + c + ',' + a * R.ink + ')');
    g.addColorStop(.55, 'rgba(' + c + ',' + a * R.ink * .55 + ')');
    g.addColorStop(1, 'rgba(' + c + ',0)');
    ctx.beginPath(); ctx.moveTo(-5, bottom);
    for (x = -5; x <= W + 5; x += step) ctx.lineTo(x, ridgeY(R, x));
    ctx.lineTo(W + 5, bottom); ctx.closePath();
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fill();
  }

  /* ---------------- mist and birds ---------------- */

  var mists = [], birds = [], nextBird = 5;
  function makeMists() { // banks of mist in the valleys, at the foot of each range
    var r = seeded(seed()); mists = [];
    RANGES.forEach(function (R, k) {
      for (var i = 0; i < 4; i++) mists.push({ layer: k, x: r(), y: R.base + .01 + r() * .03, w: .25 + r() * .3, h: .035 + r() * .03, v: (.003 + r() * .004) * (r() < .5 ? 1 : -1) });
    });
  }
  function drawMist(k, dt) {
    var c = rgbOf(bg);
    mists.forEach(function (m) {
      if (m.layer !== k) return;
      m.x += m.v * dt; if (m.x > 1 + m.w) m.x = -m.w; if (m.x < -m.w) m.x = 1 + m.w;
      var cx = m.x * W, cy = m.y * H, rx = m.w * W, ry = m.h * H;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(' + c + ',.85)'); g.addColorStop(.6, 'rgba(' + c + ',.45)'); g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.283); ctx.fill();
      ctx.restore();
    });
  }
  function drawBirds(a, dt) {
    if (time > nextBird) { var by = .14 + Math.random() * .2, bv = .025 + Math.random() * .015; birds.push({ x: -.05, y: by, v: bv, ph: Math.random() * 6 }, { x: -.08, y: by + .025, v: bv, ph: Math.random() * 6 }); nextBird = time + 18 + Math.random() * 20; }
    birds = birds.filter(function (b) { return b.x < 1.05; });
    birds.forEach(function (b) {
      b.x += b.v * dt; var x = b.x * W, y = b.y * H + Math.sin(time * .7 + b.ph) * 6, s = H * .006, f = Math.sin(time * 5 + b.ph) * .5;
      ctx.globalAlpha = a * .8; ctx.strokeStyle = ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - s, y - s * (.3 + f)); ctx.quadraticCurveTo(x - s * .4, y - s * .4, x, y); ctx.quadraticCurveTo(x + s * .4, y - s * .4, x + s, y - s * (.3 + f)); ctx.stroke();
    });
  }

  /* ---------------- frame ---------------- */

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  var dtLast = 0;
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = ctx.lineJoin = 'round';
    drawBirds(baseAlpha, dtLast);
    for (var i = 0; i < RANGES.length; i++) { drawRange(RANGES[i], baseAlpha); drawMist(i, dtLast); }
    ctx.globalAlpha = 1;
  }

  var last = 0;
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t; time += dt; dtLast = dt;
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'alps-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize(); makeMists();
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
