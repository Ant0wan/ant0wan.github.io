/* Faint background for the Geology page: a geological section in the manner of
   the engraved plates of nineteenth-century geology books, across the whole
   lower part of the screen.
   - The land surface with its hills, a cover of loose deposits, and under it
     folded strata, each with its own conventional pattern: stipple for sandstone,
     brickwork for limestone, ruled lines for shale, pebbles for conglomerate,
     dashes for clay, crosses for the granite beneath. Faults shift the beds,
     marked by bold lines with half-arrows, and a dyke of granite cuts up through
     them.
   A still drawing, different at every visit, engraved off-screen once and redrawn on resize and theme
   change. Very faint, no pointer events. Add ?section=debug to see it clearly. */
(function () {
  if (window.__sectionBg) return;
  window.__sectionBg = true;

  var debug = /[?&]section=debug/.test(location.search);
  var cv, ctx, strip, sx, W = 0, H = 0, dpr = 1;
  var ink = '#3a3833', baseAlpha = 0.14;
  var P = 2400, hb = 0, bandTop = 0, HEAD = 10, BOT = 0;   // HEAD: a little room above the land

  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 0.85 : dark ? 0.13 : 0.15;
  }
  function seeded(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---------------- the section, in strip coordinates (x along the section, y down) ---------------- */

  var TAU = Math.PI * 2;
  function S(x, n, ph) { return Math.sin(TAU * x / P * n + ph); }
  // a new section at every visit: everything below is drawn at random once, when the page loads
  function rnd(a, b) { return a + Math.random() * (b - a); }
  var R = { s1: rnd(0, TAU), s2: rnd(0, TAU), s3: rnd(0, TAU), n1: rnd(2, 4), n2: rnd(5, 9), hills: rnd(.05, .09),
            f1: rnd(0, TAU), f2: rnd(0, TAU), fn1: rnd(1.2, 2.6), fn2: rnd(4, 6.5), fa1: rnd(.06, .16), fa2: rnd(.02, .055), seed: Math.random() * 1e9 | 0 };
  function surface(x) { return HEAD + hb * (.12 + R.hills * S(x, R.n1, R.s1) + .035 * S(x, R.n2, R.s2) + .012 * S(x, 19, R.s3)); }
  var FAULTS = [];                                                   // one to three faults, anywhere
  for (var fi = 0, nf = 1 + Math.floor(Math.random() * 3); fi < nf; fi++) FAULTS.push({ x: rnd(.08, .92), throw: rnd(.04, .09) * (Math.random() < .5 ? 1 : -1) });
  function shift(x, depth) {
    var d = 0;
    FAULTS.forEach(function (f) { if (x > f.x * W + depth * .35) d += f.throw * hb; });
    return d;
  }
  var THICK = [], PATTERNS = ['dots', 'brick', 'lines', 'pebbles', 'dashes', 'brick2'];   // beds, from the top down, shuffled
  for (var ti = 0; ti < 6; ti++) THICK.push(rnd(.06, .13));
  for (ti = PATTERNS.length - 1; ti > 0; ti--) { var tj = Math.floor(Math.random() * (ti + 1)), tt = PATTERNS[ti]; PATTERNS[ti] = PATTERNS[tj]; PATTERNS[tj] = tt; }
  function bed(k, x) { // depth of the k-th bedding surface below the top of the band
    var d = HEAD + hb * .16; for (var i = 0; i < k; i++) d += hb * THICK[i];
    var fold = hb * (R.fa1 * S(x, R.fn1, R.f1) + R.fa2 * S(x, R.fn2, R.f2));
    return d + fold + shift(x, d - HEAD);
  }
  var DYKE = { x: rnd(.1, .9), w: rnd(12, 22), on: Math.random() < .75 };
  function dykeX(x0, y) { return x0 - ((y - HEAD) / hb) * 30; }

  function engrave() {
    var g = sx, w = strip.width / dpr, r = seeded(R.seed);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, BOT);
    g.strokeStyle = g.fillStyle = '#000'; g.lineCap = g.lineJoin = 'round';
    var step = 4;
    function path(fA, fB) { g.beginPath(); g.moveTo(0, fA(0)); for (var x = 0; x <= w; x += step) g.lineTo(x, fA(x)); for (x = w; x >= 0; x -= step) g.lineTo(x, fB(x)); g.closePath(); }
    function underGround() { g.beginPath(); g.moveTo(0, surface(0)); for (var x = 0; x <= w; x += step) g.lineTo(x, surface(x)); g.lineTo(w, BOT); g.lineTo(0, BOT); g.closePath(); }
    function parallel(fA, fB, n, dash) {
      if (dash) g.setLineDash(dash);
      for (var i = 1; i < n; i++) { var t = i / n; g.beginPath(); for (var x = 0; x <= w; x += step) { var y = fA(x) + (fB(x) - fA(x)) * t; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      g.setLineDash([]);
    }
    var bounds = [];
    for (var k = 0; k <= THICK.length; k++) (function (k) { bounds.push(function (x) { return bed(k, x); }); })(k);
    g.save(); underGround(); g.clip();
    // beds and their patterns
    for (k = 0; k < THICK.length; k++) {
      var fA = bounds[k], fB = bounds[k + 1], pat = PATTERNS[k];
      g.save(); path(fA, fB); g.clip(); g.lineWidth = .8;
      if (pat === 'dots') { for (var i = 0; i < w * hb * THICK[k] / 30; i++) { var x = r() * w, y = fA(x) + r() * (fB(x) - fA(x)); g.fillRect(x, y, 1.1, 1.1); } }
      if (pat === 'lines') parallel(fA, fB, 9);
      if (pat === 'dashes') parallel(fA, fB, 5, [6, 5]);
      if (pat === 'brick' || pat === 'brick2') {
        var rows = pat === 'brick' ? 5 : 6; parallel(fA, fB, rows);
        for (var j = 0; j < rows; j++) for (x = (j % 2) * 9; x <= w; x += 18) {
          var y0 = fA(x) + (fB(x) - fA(x)) * j / rows, y1 = fA(x) + (fB(x) - fA(x)) * (j + 1) / rows;
          g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
        }
      }
      if (pat === 'pebbles') { for (i = 0; i < w * hb * THICK[k] / 160; i++) { x = r() * w; y = fA(x) + r() * (fB(x) - fA(x)); g.beginPath(); g.ellipse(x, y, 1.5 + r() * 2.2, 1.2 + r() * 1.4, r() * 3, 0, TAU); g.stroke(); } }
      g.restore();
    }
    // superficial deposits between the land surface and the first bed: scattered dashes and grains
    g.save(); path(surface, bounds[0]); g.clip(); g.lineWidth = .7;
    for (i = 0; i < w * hb / 220; i++) { x = r() * w; y = surface(x) + r() * (bed(0, x) - surface(x)); if (r() < .5) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + r() * 4, y + (r() - .5)); g.stroke(); } else g.fillRect(x, y, 1, 1); }
    g.restore();
    // granite basement: crosses
    g.save(); path(bounds[THICK.length], function () { return BOT; }); g.clip(); g.lineWidth = .8;
    for (y = 0; y < BOT; y += 9) for (x = (y / 9 % 2) * 6; x < w; x += 12) { g.beginPath(); g.moveTo(x - 2.2, y); g.lineTo(x + 2.2, y); g.moveTo(x, y - 2.2); g.lineTo(x, y + 2.2); g.stroke(); }
    g.restore();
    // bedding surfaces
    g.lineWidth = 1.1; bounds.forEach(function (f) { g.beginPath(); for (var x = 0; x <= w; x += step) x ? g.lineTo(x, f(x)) : g.moveTo(x, f(x)); g.stroke(); });
    // the dyke, once per period (and again past the loop), filled with granite crosses
    [DYKE.x * W].forEach(function (x0) {
      if (!DYKE.on) return;
      g.save(); g.beginPath(); g.moveTo(dykeX(x0, 0), 0); g.lineTo(dykeX(x0, BOT), BOT); g.lineTo(dykeX(x0, BOT) + DYKE.w, BOT); g.lineTo(dykeX(x0, 0) + DYKE.w, 0); g.closePath();
      g.globalCompositeOperation = 'destination-out'; g.fill(); g.globalCompositeOperation = 'source-over'; g.clip();
      g.lineWidth = .8; for (var y = 0; y < hb; y += 7) for (var x = dykeX(x0, y) + 3; x < dykeX(x0, y) + DYKE.w; x += 7) { g.beginPath(); g.moveTo(x - 1.8, y); g.lineTo(x + 1.8, y); g.moveTo(x, y - 1.8); g.lineTo(x, y + 1.8); g.stroke(); }
      g.restore();
      g.lineWidth = 1.2; g.beginPath(); g.moveTo(dykeX(x0, 0), 0); g.lineTo(dykeX(x0, BOT), BOT); g.moveTo(dykeX(x0, 0) + DYKE.w, 0); g.lineTo(dykeX(x0, BOT) + DYKE.w, BOT); g.stroke();
    });
    // faults: bold lines, with half-arrows showing the movement
    FAULTS.forEach(function (f) {
      var x0 = f.x * W;
      g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + (surface(x0) - HEAD) * .35, surface(x0)); g.lineTo(x0 + (BOT - HEAD) * .35, BOT); g.stroke();
      var ym = HEAD + hb * .55, xm = x0 + hb * .55 * .35, sgn = f.throw > 0 ? 1 : -1;
      g.lineWidth = 1; [[-8, -sgn], [8, sgn]].forEach(function (a) {
        g.beginPath(); g.moveTo(xm + a[0], ym - 12 * a[1]); g.lineTo(xm + a[0], ym + 12 * a[1]); g.lineTo(xm + a[0] + (a[0] > 0 ? 4 : -4), ym + 7 * a[1]); g.stroke();
      });
    });
    g.restore();
    // land surface
    g.lineWidth = 1.8; g.beginPath(); for (x = 0; x <= w; x += step) x ? g.lineTo(x, surface(x)) : g.moveTo(x, surface(x)); g.stroke();
    // engraved in black, then inked in the colour of the theme
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = ink; g.fillRect(0, 0, strip.width, strip.height); g.globalCompositeOperation = 'source-over';
  }

  /* ---------------- drawing (once; again on resize and theme change) ---------------- */

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    bandTop = H * .36; hb = H - bandTop; BOT = HEAD + hb + 4;
    P = Math.max(2400, Math.ceil(W * 1.6 / 100) * 100);
    strip.width = Math.ceil(W * dpr); strip.height = Math.ceil(BOT * dpr);
    engrave();
  }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.globalAlpha = baseAlpha;
    ctx.drawImage(strip, 0, Math.round((bandTop - HEAD) * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'section-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d'); strip = document.createElement('canvas'); sx = strip.getContext('2d');
    if (!ctx || !sx) return;
    readColor(); resize(); draw();
    window.addEventListener('resize', function () { resize(); draw(); });
    window.addEventListener('themechange', function () { readColor(); engrave(); draw(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
