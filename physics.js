/* Faint background for the Physics page, in the margins beside the text. Three
   kinds of things come and go, each on its own clock, at most one of each at a
   time, never overlapping, and never more than twice in a row on the same side:
   - An experiment at work: the double-slit experiment building its fringes
     particle by particle, tracks spiralling in a bubble chamber, a chaotic double
     pendulum, a planet sweeping equal areas on its Kepler ellipse, a quantum wave
     packet bouncing in a box, a standing wave on a string. Each with its law, and
     who found it and when.
   - A founding equation, with its name, author and year.
   - A fundamental constant, with its symbol, name, value and unit (marked exact
     when the SI fixes it), and who first measured or introduced it.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?physics=debug to see it clearly. */
(function () {
  if (window.__physicsBg) return;
  window.__physicsBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]physics=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0, dt = 0;
  var ink = '#3a3833', baseAlpha = 0.2;
  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";
  var TAU = Math.PI * 2;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ri(n) { return Math.floor(Math.random() * n); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 1 : dark ? 0.2 : 0.22;
  }
  function A(k) { ctx.globalAlpha = Math.max(0, Math.min(1, k)); }
  function L(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  /* ---------------- text with superscripts and subscripts: x^{2}, T_{μν} ---------------- */

  function parse(s) {
    var out = [], i = 0;
    (function group(level) {
      var buf = '';
      while (i < s.length) {
        var c = s[i];
        if (c === '}') { i++; break; }
        if ((c === '^' || c === '_') && s[i + 1] === '{') { if (buf) { out.push({ t: buf, lv: level }); buf = ''; } i += 2; group(level.concat(c === '^' ? 1 : -1)); continue; }
        buf += c; i++;
      }
      if (buf) out.push({ t: buf, lv: level });
    })([]);
    return out;
  }
  function richW(s, fs, style) { var w = 0; parse(s).forEach(function (p) { ctx.font = (style || '') + fs * Math.pow(.7, p.lv.length) + 'px ' + FONT; w += ctx.measureText(p.t).width; }); return w; }
  function fit(s, fs, style, maxW) { var w = richW(s, fs, style); return w > maxW ? fs * maxW / w : fs; }   // smaller when too wide for the margin
  function rich(s, cx, y, fs, style) { // a line centred on cx
    var parts = parse(s), w = 0;
    parts.forEach(function (p) { p.fs = fs * Math.pow(.7, p.lv.length); ctx.font = (style || '') + p.fs + 'px ' + FONT; p.w = ctx.measureText(p.t).width; w += p.w; });
    var x = cx - w / 2;
    parts.forEach(function (p) {
      var dy = 0, sz = fs; p.lv.forEach(function (d) { dy -= d * sz * (d > 0 ? .38 : -.22) * (d > 0 ? 1 : -1); sz *= .7; });
      ctx.font = (style || '') + p.fs + 'px ' + FONT; ctx.fillText(p.t, x, y + dy); x += p.w;
    });
    return w;
  }

  /* ---------------- places: two margins, upper and lower half ---------------- */

  function places() {
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    return [{ x: r.left / 2, w: r.left }, { x: r.right + (W - r.right) / 2, w: W - r.right }];
  }
  // a side at random, but never more than twice in a row the same side, and a free half on it;
  // false when the side it must take is full: the item then waits for a place to free up
  function settle(it, prev, others) {
    var taken = others.filter(function (o) { return o && !o.wait; }).map(function (o) { return o.side * 2 + o.slot; });
    function freeOn(sd) { return [0, 1].filter(function (sl) { return taken.indexOf(sd * 2 + sl) < 0; }); }
    var forced = prev && prev.run >= 2, side = forced ? 1 - prev.side : ri(2), free = freeOn(side);
    if (!free.length) { if (forced) return false; side = 1 - side; free = freeOn(side); if (!free.length) return false; }
    it.side = side; it.run = prev && prev.side === side ? prev.run + 1 : 1;
    it.slot = free[ri(free.length)];
    return true;
  }
  function place(it, prev, others) { it.prev = prev; it.others = others; it.wait = !settle(it, prev, others()); if (!it.wait) it.prev = null; return it; }
  function retry(it) {
    if (!it.wait || time < it.t0) return;
    if (settle(it, it.prev, it.others())) { it.wait = false; it.prev = null; it.t0 = time; } else it.t0 = time + .5;
  }
  function geo(it, P) {
    var p = P[it.side], bw = Math.max(150, Math.min(280, p.w * .72));
    return { x: p.x, y: H * (it.slot ? .68 : .3), bw: bw, bh: bw * .56, w: p.w };
  }
  function caption(lines, x, y, fs, a) {
    A(Math.min(1, a * 2.2)); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach(function (l, i) { rich(l, x, y + (i ? fs * (.35 + i * .95) : 0), i ? fs * .72 : fs, i ? 'italic ' : ''); });
  }

  /* ---------------- experiments ---------------- */

  var SIMS = [
    { title: 'Double-slit experiment', law: 'fringes build up one particle at a time', who: 'Thomas Young (1801); single electrons: Tonomura (1989)',
      init: function () { return { hits: [] }; },
      draw: function (st, g, age, a) {
        var x0 = g.x - g.bw / 2, y0 = g.y - g.bh / 2, bx = x0 + g.bw * .2, sx = x0 + g.bw * .9, cy = g.y, d = g.bh * .12;
        A(a * 1.6); ctx.lineWidth = 1.2;
        L(bx, y0, bx, cy - d - 3); L(bx, cy - d + 3, bx, cy - 3); L(bx, cy + 3, bx, cy + d - 3); L(bx, cy + d + 3, bx, y0 + g.bh);   // barrier, two slits
        L(sx, y0, sx, y0 + g.bh);                                                                                                // screen
        ctx.beginPath(); ctx.arc(x0 + 4, cy, 2.5, 0, TAU); ctx.fill();                                                           // source
        ctx.lineWidth = .7; A(a * .7);                                                                                           // waves leaving the slits
        for (var k = 0; k < 5; k++) { var r = ((age * 30 + k * 18) % 90) * g.bw / 280; [-d, d].forEach(function (o) { ctx.beginPath(); ctx.arc(bx, cy + o, r, -1.1, 1.1); ctx.stroke(); }); }
        var rate = reduce ? 0 : Math.min(140, 6 + age * 14), n = Math.round(rate * dt + Math.random() * .5);
        for (var i = 0; i < n && st.hits.length < 1800; i++) {   // the intensity of two slits: cos² fringes under a single-slit envelope
          for (;;) { var u = rnd(-1, 1), s = 3.2 * u, env = s ? Math.pow(Math.sin(s) / s, 2) : 1, I = Math.pow(Math.cos(9 * u), 2) * env; if (Math.random() < I) { st.hits.push([rnd(0, 1), u]); break; } }
        }
        if (reduce && !st.hits.length) for (var j = 0; j < 1500; j++) for (;;) { var u2 = rnd(-1, 1), s2 = 3.2 * u2, I2 = Math.pow(Math.cos(9 * u2), 2) * (s2 ? Math.pow(Math.sin(s2) / s2, 2) : 1); if (Math.random() < I2) { st.hits.push([rnd(0, 1), u2]); break; } }
        A(a * 2.4); st.hits.forEach(function (h) { ctx.fillRect(sx - 4 - h[0] * g.bw * .1, cy + h[1] * g.bh * .5, 1.2, 1.2); });
      } },
    { title: 'Bubble chamber', law: 'charged particles curl in a magnetic field: r = p / qB', who: 'Donald Glaser (1952)',
      init: function (g) { return { tracks: [] }; },
      draw: function (st, g, age, a) {
        var x0 = g.x - g.bw / 2, y0 = g.y - g.bh / 2;
        A(a * 1.2); ctx.lineWidth = .8; ctx.strokeRect(x0, y0, g.bw, g.bh);
        if (!st.tracks.length || (!reduce && age > st.next)) {   // a new particle enters from the left
          var R0 = rnd(.25, 1.2) * g.bh, sg = Math.random() < .5 ? 1 : -1, pts = [], x = x0, y = y0 + rnd(.2, .8) * g.bh, dir = rnd(-.3, .3), R = R0;
          for (var i = 0; i < 900 && R > 2; i++) { x += Math.cos(dir) * 1.5; y += Math.sin(dir) * 1.5; dir += sg * 1.5 / R; R *= .9965; if (x < x0 || x > x0 + g.bw || y < y0 || y > y0 + g.bh) break; pts.push([x, y]); }
          st.tracks.push({ pts: pts, t0: age }); st.next = age + rnd(.6, 1.6);
          if (st.tracks.length > 9) st.tracks.shift();
        }
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, g.bw, g.bh); ctx.clip();
        ctx.setLineDash([1, 2.2]); ctx.lineWidth = 1.1;
        st.tracks.forEach(function (tk, k) {
          var shown = reduce ? tk.pts.length : Math.min(tk.pts.length, Math.floor((age - tk.t0) * 260));
          A(a * 2.2 * (k + 1) / st.tracks.length); ctx.beginPath(); for (var i = 0; i < shown; i++) i ? ctx.lineTo(tk.pts[i][0], tk.pts[i][1]) : ctx.moveTo(tk.pts[i][0], tk.pts[i][1]); ctx.stroke();
        });
        ctx.setLineDash([]); ctx.restore();
      } },
    { title: 'Double pendulum', law: 'deterministic, yet chaotic', who: 'chaos in mechanics: Henri Poincaré (1890)',
      init: function () { return { s: [rnd(1.8, 2.6), rnd(1.8, 2.8), 0, 0], trail: [] }; },
      draw: function (st, g, age, a) {
        function f(s) { // equal masses and lengths
          var t1 = s[0], t2 = s[1], w1 = s[2], w2 = s[3], d = t1 - t2, den = 3 - Math.cos(2 * d), G = 9.81;
          return [w1, w2,
            (-3 * G * Math.sin(t1) - G * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) / den,
            (2 * Math.sin(d) * (2 * w1 * w1 + 2 * G * Math.cos(t1) + w2 * w2 * Math.cos(d))) / den];
        }
        var steps = reduce ? 0 : Math.ceil(dt / .004), h = dt / Math.max(1, steps);
        for (var k = 0; k < steps; k++) {   // fourth-order Runge–Kutta
          var s = st.s, k1 = f(s), k2 = f(s.map(function (v, i) { return v + h / 2 * k1[i]; })), k3 = f(s.map(function (v, i) { return v + h / 2 * k2[i]; })), k4 = f(s.map(function (v, i) { return v + h * k3[i]; }));
          st.s = s.map(function (v, i) { return v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); });
        }
        var l = g.bh * .3, px = g.x, py = g.y - g.bh * .05;   // the pivot near the middle: both arms reach at most 0.6 of the box height either way
        var x1 = px + l * Math.sin(st.s[0]), y1 = py + l * Math.cos(st.s[0]), x2 = x1 + l * Math.sin(st.s[1]), y2 = y1 + l * Math.cos(st.s[1]);
        st.trail.push([x2, y2]); if (st.trail.length > 420) st.trail.shift();
        ctx.lineWidth = .8;
        for (var i = 1; i < st.trail.length; i++) { A(a * 1.6 * i / st.trail.length); L(st.trail[i - 1][0], st.trail[i - 1][1], st.trail[i][0], st.trail[i][1]); }
        A(a * 2.4); ctx.lineWidth = 1.3; L(px - 12, py, px + 12, py); L(px, py, x1, y1); L(x1, y1, x2, y2);
        ctx.beginPath(); ctx.arc(x1, y1, 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(x2, y2, 4, 0, TAU); ctx.fill();
      } },
    { title: "Kepler's second law", law: 'equal areas in equal times', who: 'Johannes Kepler (1609)',
      init: function () { return { e: rnd(.55, .7), T: rnd(7, 9) }; },
      draw: function (st, g, age, a) {
        var aa = g.bw * .42, e = st.e, b = aa * Math.sqrt(1 - e * e), fx = g.x + aa * e, cx = fx - aa * e, cy = g.y;
        function pos(M) { var E = M; for (var k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return [cx + aa * Math.cos(E), cy + b * Math.sin(E)]; }
        A(a * 1.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy, aa, b, 0, 0, TAU); ctx.stroke();
        for (var s = 0; s < 8; s += 2) {   // four of the eight equal-time sectors, shaded: all of the same area
          A(a * .9); ctx.beginPath(); ctx.moveTo(fx, cy);
          for (var m = s / 8 * TAU; m <= (s + 1) / 8 * TAU + 1e-6; m += TAU / 160) { var q = pos(m); ctx.lineTo(q[0], q[1]); }
          ctx.closePath(); ctx.fill();
        }
        A(a * 2.6); ctx.beginPath(); ctx.arc(fx, cy, 5, 0, TAU); ctx.fill();                                         // the Sun, at a focus
        var p = pos(TAU * (reduce ? .3 : (age / st.T) % 1)); ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, TAU); ctx.fill();   // the planet
        A(a * 1.4); L(fx, cy, p[0], p[1]);
      } },
    { title: 'Particle in a box', law: 'a wave packet spreads, bounces and comes back', who: 'Schrödinger equation (1926)',
      init: function () {   // expand a Gaussian packet on the box's eigenstates sin(nπx)
        var N = 48, M = 240, x0 = rnd(.25, .4), sg = .08, k0 = rnd(12, 20), re = [], im = [];
        for (var n = 1; n <= N; n++) {
          var cr = 0, ci = 0;
          for (var i = 1; i < M; i++) { var x = i / M, env = Math.exp(-Math.pow((x - x0) / sg, 2) / 2), sn = Math.sin(n * Math.PI * x); cr += env * Math.cos(k0 * x) * sn; ci += env * Math.sin(k0 * x) * sn; }
          re.push(cr / M * 2); im.push(ci / M * 2);
        }
        return { re: re, im: im };
      },
      draw: function (st, g, age, a) {
        var x0 = g.x - g.bw / 2, y0 = g.y - g.bh / 2, t = reduce ? .01 : age * .01, pts = [], mx = 0, M = 160;
        for (var i = 0; i <= M; i++) {
          var x = i / M, pr = 0, pi = 0;
          for (var n = 1; n <= st.re.length; n++) { var E = n * n * Math.PI * Math.PI / 2, c = Math.cos(E * t), s = -Math.sin(E * t), sn = Math.sin(n * Math.PI * x), r = st.re[n - 1], q = st.im[n - 1]; pr += (r * c - q * s) * sn; pi += (r * s + q * c) * sn; }
          var p2 = pr * pr + pi * pi; pts.push(p2); mx = Math.max(mx, p2);
        }
        st.mx = Math.max(st.mx || 0, mx);
        A(a * 1.6); ctx.lineWidth = 1.4; L(x0, y0, x0, y0 + g.bh); L(x0 + g.bw, y0, x0 + g.bw, y0 + g.bh); L(x0, y0 + g.bh, x0 + g.bw, y0 + g.bh);   // the walls
        ctx.beginPath(); ctx.moveTo(x0, y0 + g.bh);
        pts.forEach(function (p, i) { ctx.lineTo(x0 + i / M * g.bw, y0 + g.bh - p / st.mx * g.bh * .9); });
        ctx.lineTo(x0 + g.bw, y0 + g.bh); A(a * .9); ctx.fill(); A(a * 2.2); ctx.lineWidth = 1; ctx.stroke();
        A(a * 2); ctx.font = 'italic 11px ' + FONT; ctx.textAlign = 'right'; ctx.fillText('|ψ|²', x0 + g.bw - 4, y0 + 10);
      } },
    { title: 'Standing wave', law: 'f_{n} = n v / 2L', who: 'Daniel Bernoulli (1753)',
      init: function () { return { n: 2 + ri(4) }; },
      draw: function (st, g, age, a) {
        var x0 = g.x - g.bw / 2, amp = g.bh * .38, c = Math.cos(reduce ? 0 : age * 3.2), n = st.n;
        A(a * .9); ctx.lineWidth = .8; ctx.setLineDash([3, 3]);
        [-1, 1].forEach(function (sg) { ctx.beginPath(); for (var i = 0; i <= 120; i++) { var x = i / 120; ctx.lineTo(x0 + x * g.bw, g.y + sg * amp * Math.sin(n * Math.PI * x)); } ctx.stroke(); });   // envelope
        ctx.setLineDash([]); A(a * 2.4); ctx.lineWidth = 1.4;
        ctx.beginPath(); for (var i = 0; i <= 160; i++) { var x = i / 160; ctx.lineTo(x0 + x * g.bw, g.y + amp * c * Math.sin(n * Math.PI * x)); } ctx.stroke();
        for (var k = 0; k <= n; k++) { ctx.beginPath(); ctx.arc(x0 + k / n * g.bw, g.y, 2.6, 0, TAU); ctx.fill(); }   // nodes
        L(x0, g.y - 10, x0, g.y + 10); L(x0 + g.bw, g.y - 10, x0 + g.bw, g.y + 10);
      } }
  ];

  /* ---------------- equations and constants ---------------- */

  var EQUATIONS = [
    ['F = ma', "Newton's second law", 'Isaac Newton, 1687'],
    ['F = G m_{1}m_{2} / r^{2}', 'universal gravitation', 'Isaac Newton, 1687'],
    ['n_{1} sin θ_{1} = n_{2} sin θ_{2}', 'law of refraction', 'Snell, 1621; Descartes, 1637'],
    ['L = T − V', 'the Lagrangian', 'Joseph-Louis Lagrange, 1788'],
    ['∂u/∂t = α ∇^{2}u', 'heat equation', 'Joseph Fourier, 1822'],
    ['U = R I', "Ohm's law", 'Georg Ohm, 1827'],
    ['∇ × E = −∂B/∂t', "Faraday's law of induction", 'Michael Faraday, 1831'],
    ['PV = nRT', 'ideal gas law', 'Émile Clapeyron, 1834'],
    ['∇ · E = ρ / ε_{0}', "Gauss's law", 'Carl Friedrich Gauss, 1835'],
    ['∇ × B = μ_{0}J + μ_{0}ε_{0} ∂E/∂t', 'Ampère–Maxwell law', 'James Clerk Maxwell, 1865'],
    ['c = 1 / √(ε_{0}μ_{0})', 'light is an electromagnetic wave', 'James Clerk Maxwell, 1865'],
    ['dS ≥ δQ / T', 'second law of thermodynamics', 'Rudolf Clausius, 1865'],
    ['S = k_{B} ln W', 'entropy', 'Ludwig Boltzmann, 1877'],
    ['F = q(E + v × B)', 'Lorentz force', 'Hendrik Lorentz, 1895'],
    ['E = hν', 'energy of a light quantum', 'Max Planck, 1900'],
    ['E = mc^{2}', 'mass–energy equivalence', 'Albert Einstein, 1905'],
    ['E_{n} = −13.6 eV / n^{2}', 'energy levels of hydrogen', 'Niels Bohr, 1913'],
    ['G_{μν} + Λg_{μν} = (8πG/c^{4}) T_{μν}', 'Einstein field equations', 'Albert Einstein, 1915'],
    ['λ = h / p', 'matter waves', 'Louis de Broglie, 1924'],
    ['iħ ∂ψ/∂t = Ĥψ', 'Schrödinger equation', 'Erwin Schrödinger, 1926'],
    ['Δx Δp ≥ ħ / 2', 'uncertainty principle', 'Werner Heisenberg, 1927'],
    ['(iγ^{μ}∂_{μ} − m)ψ = 0', 'Dirac equation', 'Paul Dirac, 1928']
  ];
  // symbol, name, value (^{…} for powers), exact in the SI or not, who first measured or introduced it
  var CONSTANTS = [
    ['c', 'speed of light in vacuum', '299 792 458 m·s^{−1}', true, 'first measured by Ole Rømer, 1676'],
    ['h', 'Planck constant', '6.626 070 15 × 10^{−34} J·s', true, 'Max Planck, 1900'],
    ['ħ', 'reduced Planck constant', '1.054 571 817 × 10^{−34} J·s', true, 'h / 2π, Paul Dirac, 1930'],
    ['G', 'gravitational constant', '6.674 30 × 10^{−11} m^{3}·kg^{−1}·s^{−2}', false, 'first measured by Henry Cavendish, 1798'],
    ['e', 'elementary charge', '1.602 176 634 × 10^{−19} C', true, 'measured by Robert Millikan, 1909'],
    ['k_{B}', 'Boltzmann constant', '1.380 649 × 10^{−23} J·K^{−1}', true, 'Ludwig Boltzmann; Max Planck, 1900'],
    ['N_{A}', 'Avogadro constant', '6.022 140 76 × 10^{23} mol^{−1}', true, 'measured by Jean Perrin, 1909'],
    ['α', 'fine-structure constant', '7.297 352 5643 × 10^{−3}  ≈ 1/137.036', false, 'Arnold Sommerfeld, 1916'],
    ['m_{e}', 'electron mass', '9.109 383 7139 × 10^{−31} kg', false, 'electron discovered by J. J. Thomson, 1897'],
    ['m_{p}', 'proton mass', '1.672 621 925 95 × 10^{−27} kg', false, 'proton identified by Ernest Rutherford, 1919'],
    ['ε_{0}', 'vacuum permittivity', '8.854 187 8188 × 10^{−12} F·m^{−1}', false, 'from Coulomb’s law, 1785'],
    ['σ', 'Stefan–Boltzmann constant', '5.670 374 419 × 10^{−8} W·m^{−2}·K^{−4}', true, 'Josef Stefan, 1879'],
    ['R_{∞}', 'Rydberg constant', '10 973 731.568 157 m^{−1}', false, 'Johannes Rydberg, 1888'],
    ['a_{0}', 'Bohr radius', '5.291 772 105 44 × 10^{−11} m', false, 'Niels Bohr, 1913']
  ];
  function drawEquation(it, g, a) {
    var e = it.e, fs = Math.max(15, Math.min(22, g.w * .055));
    A(Math.min(1, a * 2.4)); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    rich(e[0], g.x, g.y, fit(e[0], fs, 'italic ', g.w * .9), 'italic ');
    A(Math.min(1, a * 2.2)); ctx.textAlign = 'center';
    ctx.font = (fs * .66) + 'px ' + FONT; ctx.fillText(e[1], g.x, g.y + fs * 1.3);
    ctx.font = 'italic ' + (fs * .6) + 'px ' + FONT; ctx.fillText(e[2], g.x, g.y + fs * 2.1);
  }
  function drawConstant(it, g, a) {
    var k = it.k, fs = Math.max(13, Math.min(18, g.w * .045));
    A(Math.min(1, a * 2.4)); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    rich(k[0], g.x, g.y, fs * 2, 'italic ');
    A(Math.min(1, a * 2.2)); ctx.textAlign = 'center'; ctx.font = (fs * .8) + 'px ' + FONT; ctx.fillText(k[1], g.x, g.y + fs * 1.3);
    ctx.textAlign = 'left'; rich(k[2], g.x, g.y + fs * 2.4, fit(k[2], fs * .8, '', g.w * .9), '');
    ctx.textAlign = 'center'; ctx.font = 'italic ' + (fs * .66) + 'px ' + FONT;
    ctx.fillText((k[3] ? 'exact in the SI  ·  ' : '') + k[4], g.x, g.y + fs * 3.4);
  }

  /* ---------------- the three items, each on its own clock ---------------- */

  var FADE = 2, sim = null, eq = null, cst = null;
  function newSim(t0) {
    var s; do { s = SIMS[ri(SIMS.length)]; } while (sim && s === sim.s);
    var force = /[?&]physics-sim=(\d+)/.exec(location.search); if (force && !sim) s = SIMS[+force[1] % SIMS.length];   // test: a given experiment
    return place({ s: s, st: s.init(), t0: t0, life: rnd(14, 19) }, sim, function () { return [eq, cst]; });
  }
  function newEq(t0) {
    var e; do { e = EQUATIONS[ri(EQUATIONS.length)]; } while (eq && e === eq.e);
    return place({ e: e, t0: t0, life: rnd(8, 12) }, eq, function () { return [sim, cst]; });
  }
  function newCst(t0) {
    var k; do { k = CONSTANTS[ri(CONSTANTS.length)]; } while (cst && k === cst.k);
    return place({ k: k, t0: t0, life: rnd(8, 12) }, cst, function () { return [sim, eq]; });
  }
  function fade(it) { var age = time - it.t0; return it.wait ? 0 : reduce ? 1 : Math.max(0, Math.min(1, age / FADE, (it.life - age) / FADE)); }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = ctx.fillStyle = ink;
    if (!reduce) {
      if (time > sim.t0 + sim.life) sim = newSim(time + rnd(1, 3.5));
      if (time > eq.t0 + eq.life) eq = newEq(time + rnd(1, 4));
      if (time > cst.t0 + cst.life) cst = newCst(time + rnd(1, 4));
      retry(sim); retry(eq); retry(cst);
    }
    var P = places(), k;
    function room(it) { return P[it.side].w >= 150; }   // too narrow a margin (a phone): nothing, rather than under the text
    if ((k = fade(sim)) > 0 && room(sim)) {
      var g = geo(sim, P), a = baseAlpha * k; ctx.strokeStyle = ctx.fillStyle = ink;
      sim.s.draw(sim.st, g, Math.max(0, time - sim.t0), a);
      var fs = Math.max(12, Math.min(17, g.w * .04));
      caption([sim.s.title, sim.s.law, sim.s.who], g.x, g.y + g.bh / 2 + fs * 1.4, fs, a);
    }
    if ((k = fade(eq)) > 0 && room(eq)) drawEquation(eq, geo(eq, P), baseAlpha * k);
    if ((k = fade(cst)) > 0 && room(cst)) drawConstant(cst, geo(cst, P), baseAlpha * k);
    ctx.globalAlpha = 1;
  }

  var last = 0;
  function frame(t) {
    dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t; time += dt;
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'physics-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize();
    var now = /[?&]physics-now/.test(location.search);   // test: all three at once
    sim = newSim(-FADE); eq = newEq(now ? -FADE : rnd(1, 3)); cst = newCst(now ? -FADE : rnd(3, 6));
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
