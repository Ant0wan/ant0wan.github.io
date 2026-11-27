/* The page of one element (element.html?z=26, or ?el=Fe): its cell and
   properties, its electron configuration as orbital boxes, and its occupied
   orbitals in 3D, drawn as clouds of points sampled from |ψ|² like the orbitals
   of the Chemistry background, which can be turned, zoomed and taken apart:
   one orbital, a whole subshell, or the whole atom with every orbital to scale.
   Shapes are hydrogen-like; each subshell is drawn in by its effective nuclear
   charge, estimated with Slater's rules. Beside the cloud, the radial
   probability distribution r²R(r)² of every occupied subshell. */
(function () {
  var E = window.PERIODIC_ELEMENTS, P = window.Periodic, HY = window.Hydrogen;
  if (!E || !P || !HY) return;
  var qs = new URLSearchParams(location.search), q = (qs.get('z') || qs.get('el') || '').trim();
  var el = E.filter(function (x) { return String(x.z) === q || x.sym.toLowerCase() === q.toLowerCase(); })[0];
  if (!el) { location.replace('periodic-table.html'); return; }
  var Z = el.z, A0_PM = 52.9177;

  /* ---------------- the page around the figure ---------------- */

  document.title = el.name + ' — Antoine Barthelemy';
  document.getElementById('title').textContent = el.name;
  document.getElementById('byline').textContent = 'Element ' + Z + ' · ' + el.sym + ' · ' + el.cat;
  document.getElementById('head').innerHTML = '<div class="big">' + P.bigCell(Z, el.sym, el.name, el.mass) + '<div class="by">' + P.discovered(el) + '</div></div>' +
    '<dl class="props">' + P.props(el) + '</dl>';
  document.getElementById('conf').innerHTML = P.sup(el.conf) + (Z >= 109 ? ' <i style="font-size:.8em;color:var(--muted)">(predicted)</i>' : '');
  function link(x, arrow) { return x ? '<a href="element.html?z=' + x.z + '">' + (arrow < 0 ? '&larr; ' : '') + x.z + ' · ' + x.name + (arrow > 0 ? ' &rarr;' : '') + '</a>' : '<span></span>'; }
  document.getElementById('nav').innerHTML = link(E[Z - 2], -1) + link(E[Z], 1);

  /* ---------------- subshells, electrons, effective nuclear charge ---------------- */

  function expand(conf) { // "[Ar] 3d6 4s2" → [{n, l, e}] for every occupied subshell, core included
    var out = [], core = /^\[(\w+)\]\s*/.exec(conf);
    if (core) { out = expand(E.filter(function (x) { return x.sym === core[1]; })[0].conf); conf = conf.slice(core[0].length); }
    conf.replace(/(\d)([spdf])(\d+)/g, function (_, n, l, k) { out.push({ n: +n, l: 'spdf'.indexOf(l), e: +k }); });
    return out;
  }
  var SUBS = expand(el.conf).filter(function (s) { return s.e > 0; });
  SUBS.sort(function (a, b) { return a.n - b.n || a.l - b.l; });
  // Slater's groups: (1s)(2s,2p)(3s,3p)(3d)(4s,4p)(4d)(4f)(5s,5p)…, in this order
  function grp(s) { return s.n * 3 + (s.l < 2 ? 0 : s.l - 1); }
  SUBS.forEach(function (s) {
    var S = 0, g = grp(s);
    SUBS.forEach(function (t) {
      var same = grp(t) === g, k = t.e - (t === s ? 1 : 0);
      if (same) S += k * (s.n === 1 ? .30 : .35);
      else if (s.l < 2) { if (t.n === s.n - 1) S += k * .85; else if (t.n < s.n - 1) S += k; }
      else if (grp(t) < g) S += k;
    });
    s.zeff = Math.max(.1, Z - S);
    // Slater's effective principal quantum number, and the size of the orbital against hydrogen's:
    // distances scale as n*² / (n² Z_eff)
    s.nstar = s.n <= 3 ? s.n : s.n === 4 ? 3.7 : s.n === 5 ? 4.0 : 4.2;
    s.k = s.nstar * s.nstar / (s.n * s.n * s.zeff);
  });
  // the orbitals of each subshell, filled by Hund's rule: one electron in each, then pairs
  var M_ORDER = [0, 1, -1, 2, -2, 3, -3], ORBS = [];
  SUBS.forEach(function (s, si) {
    var k = 2 * s.l + 1; s.orbs = [];
    M_ORDER.slice(0, k).forEach(function (m, i) {
      var o = { sub: s, si: si, m: m, h: HY.orbital(s.n, s.l, m), e: (i < s.e ? 1 : 0) + (i < s.e - k ? 1 : 0) };
      s.orbs.push(o); ORBS.push(o);
    });
  });
  // the subshell being filled: last in the Madelung order (n + ℓ, then n)
  var last = SUBS.reduce(function (a, b) { return (b.n + b.l > a.n + a.l || (b.n + b.l === a.n + a.l && b.n > a.n)) ? b : a; });

  /* ---------------- orbital boxes ---------------- */

  var boxes = document.getElementById('boxes');
  function subName(s) { return s.n + 'spdf'[s.l]; }
  boxes.innerHTML = SUBS.map(function (s, si) {
    return '<div class="sub"><button type="button" class="lab" data-s="' + si + '">' + subName(s) + '<sup>' + s.e + '</sup></button><div class="row">' +
      s.orbs.map(function (o) {
        var arrows = o.e === 2 ? '↑↓' : o.e === 1 ? '↑' : '';
        return '<button type="button" class="box' + (o.e ? '' : ' empty') + '" data-o="' + ORBS.indexOf(o) + '" title="' + subName(s) + (o.h.sub ? ' ' + o.h.sub : '') + ', ' + o.e + ' electron' + (o.e === 1 ? '' : 's') + '">' + arrows + '</button>';
      }).join('') + '</div>' +
      (s.l && s.l < 3 ? '<div class="names">' + s.orbs.map(function (o) { return '<span>' + o.h.sub + '</span>'; }).join('') + '</div>' : '') +
      '<span class="zeff">Z<sub>eff</sub> ' + s.zeff.toFixed(2) + '</span></div>';
  }).join('');
  boxes.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.o != null) select(ORBS[+b.dataset.o], 'orb');
    else select(SUBS[+b.dataset.s].orbs[0], 'sub');
  });

  /* ---------------- state and controls ---------------- */

  var cur = last.orbs[0], mode = 'orb', nPts = 10000, sharp = 1.6;
  var cPhase = document.getElementById('cPhase'), cAxes = document.getElementById('cAxes'), cScale = document.getElementById('cScale'), cSpin = document.getElementById('cSpin');
  var modeBar = document.getElementById('mode');
  modeBar.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) select(cur, b.dataset.m); });
  var sN = document.getElementById('sN'), sK = document.getElementById('sK');
  sN.addEventListener('input', function () { nPts = +sN.value; document.getElementById('vN').textContent = nPts.toLocaleString('en'); });
  sK.addEventListener('input', function () { sharp = +sK.value; document.getElementById('vK').textContent = sharp.toFixed(1); cache = {}; });
  [cPhase, cAxes, cScale, cSpin].forEach(function (c) { c.addEventListener('change', function () { drawRadial(); }); });
  sN.dispatchEvent(new Event('input')); sK.dispatchEvent(new Event('input'));

  function select(o, m) {
    cur = o; mode = m || mode;
    [].forEach.call(boxes.querySelectorAll('.box'), function (b) {
      var x = ORBS[+b.dataset.o]; b.classList.toggle('sel', mode === 'orb' ? x === cur : mode === 'sub' ? x.sub === cur.sub : x.e > 0);
    });
    [].forEach.call(boxes.querySelectorAll('.lab'), function (b) { b.classList.toggle('sel', mode !== 'orb' && (mode === 'atom' || SUBS[+b.dataset.s] === cur.sub)); });
    [].forEach.call(modeBar.children, function (b) { b.classList.toggle('on', b.dataset.m === mode); });
    readout(); drawRadial(); growAll(60);   // a first cloud at once, the rest condenses frame by frame
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.target.closest && ev.target.closest('input, select')) return;
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    var i = ORBS.indexOf(cur) + (ev.key === 'ArrowRight' ? 1 : -1);
    select(ORBS[(i + ORBS.length) % ORBS.length], 'orb'); ev.preventDefault();
  });

  /* ---------------- samples ---------------- */

  var cache = {};
  function samp(o) { // one sampler per orbital (and contrast), grown as needed
    var k = o.sub.n + ',' + o.sub.l + ',' + o.m;
    return cache[k] || (cache[k] = HY.sampler(o.h, sharp));
  }
  var extentCache = {};
  function extent(s) { // radius in a₀ holding 90 % of the subshell's (weighted) density
    var k = s.n + ',' + s.l + ',' + sharp;
    if (!extentCache[k]) extentCache[k] = HY.sampler(HY.orbital(s.n, s.l, 0), sharp).scale;
    return extentCache[k] * s.k;
  }
  function shown() { // [{o, count}] for what is on screen
    if (mode === 'orb') return [{ o: cur, count: nPts }];
    if (mode === 'sub') return cur.sub.orbs.map(function (o) { return { o: o, count: Math.round(nPts / cur.sub.orbs.length) }; });
    return ORBS.filter(function (o) { return o.e; }).map(function (o) { return { o: o, count: Math.max(120, Math.round(nPts * o.e / Z)) }; });
  }

  /* ---------------- the 3D cloud ---------------- */

  var cv = document.getElementById('cloud'), ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1;
  var yaw = -.6, pitch = .35, zoom = 1, col = {};
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    ['--ink', '--muted', '--faint', '--c-red', '--c-blue', '--grid-strong'].forEach(function (v) { col[v] = cs.getPropertyValue(v).trim(); });
  }
  function resize() {
    dpr = window.devicePixelRatio || 1;
    var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var rr = rad.getBoundingClientRect(); rad.width = Math.round(rr.width * dpr); rad.height = Math.round(rr.height * dpr);
    drawRadial();
  }
  var drag = null;
  cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return;
    yaw -= (e.clientX - drag.x) * .01; pitch = Math.max(-1.55, Math.min(1.55, pitch + (e.clientY - drag.y) * .01));
    drag = { x: e.clientX, y: e.clientY };
  });
  cv.addEventListener('pointerup', function () { drag = null; });
  cv.addEventListener('pointercancel', function () { drag = null; });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoom = Math.max(.25, Math.min(60, zoom * Math.exp(-e.deltaY * .0015))); }, { passive: false });
  cv.addEventListener('dblclick', function () { yaw = -.6; pitch = .35; zoom = 1; });

  function niceLen(x) { var p = Math.pow(10, Math.floor(Math.log10(x))), f = x / p; return (f >= 5 ? 5 : f >= 2 ? 2 : 1) * p; }
  function drawCloud() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var items = shown(), R = Math.min(W, H) * .32 * zoom, cx = W / 2, cy = H / 2;
    // pixels per a₀: everything to scale against the outermost subshell, or the cloud fitted to the frame
    var toScale = mode === 'atom' || cScale.checked;
    var outer = Math.max.apply(null, SUBS.map(extent));
    var cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    function proj(x, y, z) { var x1 = x * cyw - y * syw, y1 = x * syw + y * cyw; return [cx + x1, cy - (z * cp - y1 * sp), z * sp + y1 * cp]; }
    var pxPerA0 = toScale ? R / outer : R / extent(cur.sub);

    if (cAxes.checked) { // axes, behind the cloud
      var aL = R * 1.15;
      ctx.strokeStyle = col['--grid-strong']; ctx.fillStyle = col['--muted']; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.font = 'italic 15px ' + getComputedStyle(document.body).fontFamily; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      [['x', aL, 0, 0], ['y', 0, aL, 0], ['z', 0, 0, aL]].forEach(function (a) {
        var p0 = proj(-a[1], -a[2], -a[3]), p1 = proj(a[1], a[2], a[3]);
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
        var pl = proj(a[1] * 1.07, a[2] * 1.07, a[3] * 1.07); ctx.fillText(a[0], pl[0], pl[1]);
      });
      ctx.setLineDash([]);
    }
    var phase = cPhase.checked, mono = col['--ink'];
    items.forEach(function (it) {
      var S = samp(it.o), k = S.scale * it.o.sub.k * pxPerA0, n = Math.min(it.count, S.pts.length);
      for (var ph = 0; ph < 2; ph++) {
        ctx.fillStyle = phase ? (ph ? col['--c-red'] : col['--c-blue']) : mono;
        ctx.globalAlpha = phase ? .62 : ph ? .72 : .3;
        for (var i = 0; i < n; i++) {
          var q = S.pts[i]; if (q[3] !== ph) continue;
          var p = proj(q[0] * k, q[1] * k, q[2] * k), sz = 1.15 + .5 * Math.max(-1, Math.min(1, p[2] / R));
          ctx.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
        }
      }
    });
    ctx.globalAlpha = 1; ctx.fillStyle = mono;
    ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, 6.283); ctx.fill();   // the nucleus
    // scale bar, bottom left
    var a0 = niceLen((W * .18) / pxPerA0), bw = a0 * pxPerA0, bx = 16, by = H - 18;
    ctx.strokeStyle = mono; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by - 4); ctx.stroke();
    ctx.font = '13px ' + getComputedStyle(document.body).fontFamily; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom'; ctx.fillStyle = col['--muted'];
    var pm = a0 * A0_PM;
    ctx.fillText(a0 + ' a₀ = ' + (pm >= 10 ? Math.round(pm) : pm.toPrecision(2)) + ' pm', bx, by - 6);
    // still condensing?
    var done = items.every(function (it) { return samp(it.o).pts.length >= it.count || samp(it.o).tries >= 4e6; });
    if (!done) { ctx.textAlign = 'right'; ctx.fillText('sampling…', W - 14, by); }
  }
  function growAll(ms) {
    var items = shown(), t0 = performance.now();
    for (var i = 0; i < items.length && performance.now() - t0 < ms; i++) {
      var S = samp(items[i].o); if (S.pts.length < items[i].count) HY.grow(S, Math.max(1, ms - (performance.now() - t0)), items[i].count);
    }
  }

  /* ---------------- the readout ---------------- */

  function sub(s) { return s ? '<sub>' + s + '</sub>' : ''; }
  function meanR(s) { return (3 * s.n * s.n - s.l * (s.l + 1)) / 2 * s.k; }
  function readout() {
    var s = cur.sub, h = '', rows = [], cap;
    if (mode === 'atom') {
      var occ = ORBS.filter(function (o) { return o.e; }).length;
      h = '<div class="nm">' + el.name + '</div>';
      var far = SUBS.reduce(function (a, b) { return meanR(b) > meanR(a) ? b : a; });
      rows = [['Electrons', Z], ['Occupied orbitals', occ], ['Subshells', SUBS.map(function (x) { return subName(x) + '<sup>' + x.e + '</sup>'; }).join(' ')],
              ['Outermost', subName(far) + ', ⟨r⟩ ≈ ' + meanR(far).toFixed(2) + ' a₀ = ' + Math.round(meanR(far) * A0_PM) + ' pm'],
              ['Innermost', '1s, ⟨r⟩ ≈ ' + meanR(SUBS[0]).toFixed(3) + ' a₀ = ' + (meanR(SUBS[0]) * A0_PM).toPrecision(3) + ' pm']];
      cap = 'Every occupied orbital of ' + el.name.toLowerCase() + ' at once, to scale, with as many points for each as it holds electrons: the electron cloud of the whole atom, its inner shells packed tight around the nucleus.';
    } else {
      var one = mode === 'orb';
      h = '<div class="nm">' + subName(s) + (one ? sub(cur.h.sub) : '') + '</div>';
      rows = [['n, ℓ', s.n + ', ' + s.l], ['m', one ? (cur.m < 0 ? '−' + (-cur.m) : cur.m) : (s.l ? '−' + s.l + ' … +' + s.l : '0')],
              ['Electrons', one ? cur.e + ' of 2' : s.e + ' of ' + 2 * (2 * s.l + 1)],
              ['Z<sub>eff</sub>', s.zeff.toFixed(2) + (s.nstar !== s.n ? ', <i>n</i>* = ' + s.nstar : '') + ' (Slater)'],
              ['Radial nodes', s.n - s.l - 1], ['Angular nodes', s.l],
              ['⟨r⟩', meanR(s).toFixed(3) + ' a₀ = ' + (meanR(s) * A0_PM).toFixed(1) + ' pm']];
      cap = one ? 'The ' + subName(s) + (cur.h.sub ? '<sub><i>' + cur.h.sub + '</i></sub>' : '') + ' orbital of ' + el.name.toLowerCase() + ', holding ' + cur.e + ' electron' + (cur.e === 1 ? '' : 's') + '.'
                : 'The ' + subName(s) + ' subshell of ' + el.name.toLowerCase() + ': its ' + s.orbs.length + ' orbital' + (s.orbs.length > 1 ? 's' : '') + ' together, holding ' + s.e + ' electron' + (s.e === 1 ? '' : 's') + '.';
    }
    document.getElementById('readout').innerHTML = h + '<dl>' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
    document.getElementById('cap').innerHTML = cap;
  }

  /* ---------------- radial distributions ---------------- */

  var rad = document.getElementById('radial'), rctx = rad.getContext('2d');
  var curves = {};
  function curve(s) { // P(r) = r² R(Z_eff r)², normalised, and the radius holding 99.5 % of it
    var k = s.n + ',' + s.l;
    if (curves[k]) return curves[k];
    var top = s.n * (2.2 * s.n + 2.5) * 1.6 * s.k, N = 3000, dr = top / N, acc = 0, cum = [], i;
    function raw(r) { var v = HY.radial(s.n, s.l, r / s.k); return r * r * v * v; }
    for (i = 0; i <= N; i++) { acc += raw(i * dr) * dr; cum.push(acc); }
    var r995 = top; for (i = 0; i <= N; i++) if (cum[i] >= acc * .995) { r995 = i * dr; break; }
    return (curves[k] = { f: function (r) { return raw(r) / acc; }, r995: r995 });
  }
  function drawRadial() {
    if (!rad.width) return;
    var w = rad.width / dpr, h = rad.height / dpr, L = 14, B = 40, T = 24, Rt = 10;
    rctx.setTransform(dpr, 0, 0, dpr, 0, 0); rctx.clearRect(0, 0, w, h);
    var atom = mode === 'atom', s = cur.sub;
    // the whole atom on a logarithmic r axis (density per unit of ln r, r·D(r), so areas stay true): every shell shows
    var rmax = atom ? Math.max.apply(null, SUBS.map(function (x) { return curve(x).r995; })) : curve(s).r995 * 1.05;
    var rmin = atom ? Math.min.apply(null, SUBS.map(function (x) { return curve(x).r995; })) / 30 : 0;
    var NS = 360, xs = [], i;
    for (i = 0; i <= NS; i++) xs.push(atom ? rmin * Math.pow(rmax / rmin, i / NS) : rmax * i / NS);
    function dens(x, r) { return (atom ? x.e * r : 1) * curve(x).f(r); }
    var total = xs.map(function (r) { return SUBS.reduce(function (t, x) { return t + dens(x, r); }, 0); });
    var main = atom ? total : xs.map(curve(s).f);
    var ymax = Math.max.apply(null, main) * 1.1 || 1;
    var X = atom ? function (r) { return L + (w - L - Rt) * Math.log(r / rmin) / Math.log(rmax / rmin); }
                 : function (r) { return L + (w - L - Rt) * r / rmax; }, Y = function (v) { return h - B - (h - B - T) * Math.min(1.08, v / ymax); };
    var font = getComputedStyle(document.body).fontFamily;
    // axes and ticks
    rctx.strokeStyle = col['--grid-strong']; rctx.lineWidth = 1;
    rctx.beginPath(); rctx.moveTo(L, T - 6); rctx.lineTo(L, h - B); rctx.lineTo(w - Rt, h - B); rctx.stroke();
    rctx.fillStyle = col['--muted']; rctx.font = '11px ' + font; rctx.textAlign = 'center'; rctx.textBaseline = 'top';
    var ticks = [];
    if (atom) { for (var d = Math.ceil(Math.log10(rmin)); d <= Math.floor(Math.log10(rmax)); d++) ticks.push(Math.pow(10, d)); }
    else { var step = niceLen(rmax / 4); for (var t = 0; t <= rmax + 1e-9; t += step) ticks.push(t); }
    ticks.forEach(function (t) { rctx.beginPath(); rctx.moveTo(X(t), h - B); rctx.lineTo(X(t), h - B + 4); rctx.stroke(); rctx.fillText(+t.toPrecision(3), X(t), h - B + 6); });
    rctx.textBaseline = 'alphabetic'; rctx.font = 'italic 12px ' + font; rctx.textAlign = 'center';
    rctx.fillText(atom ? 'r / a₀ (logarithmic)' : 'r / a₀', (L + w - Rt) / 2, h - 4);
    rctx.textAlign = 'left'; rctx.fillText(atom ? 'radial electron density, all subshells' : 'r²R(r)², radial probability', L, T - 10);
    function line(vals, color, width, alpha) {
      rctx.strokeStyle = color; rctx.lineWidth = width; rctx.globalAlpha = alpha; rctx.beginPath();
      vals.forEach(function (v, j) { var x = X(xs[j]), y = Y(v); if (j) rctx.lineTo(x, y); else rctx.moveTo(x, y); });
      rctx.stroke(); rctx.globalAlpha = 1;
    }
    // every occupied subshell, faint (weighted by its electrons in the whole-atom view)
    rctx.save(); rctx.beginPath(); rctx.rect(L, T - 2, w - L - Rt, h - B - T + 2); rctx.clip();   // curves stay inside the plot
    SUBS.forEach(function (x) { if (atom || x !== s) line(xs.map(function (r) { return dens(x, r); }), col['--ink'], 1, .22); });
    line(main, col['--ink'], 1.8, 1);
    rctx.restore();
    if (!atom) { // ⟨r⟩ and the radial nodes
      var mr = meanR(s);
      if (mr < rmax) {
        rctx.setLineDash([3, 3]); rctx.strokeStyle = col['--muted']; rctx.lineWidth = 1;
        rctx.beginPath(); rctx.moveTo(X(mr), T); rctx.lineTo(X(mr), h - B); rctx.stroke(); rctx.setLineDash([]);
        rctx.fillStyle = col['--muted']; rctx.font = 'italic 11px ' + font; rctx.textAlign = 'left'; rctx.fillText('⟨r⟩', X(mr) + 3, T + 10);
      }
      rctx.fillStyle = col['--ink'];
      for (i = 1; i < NS; i++) {
        var a = HY.radial(s.n, s.l, xs[i] / s.k), b = HY.radial(s.n, s.l, xs[i + 1] / s.k);
        if (a * b < 0) { rctx.beginPath(); rctx.arc(X(xs[i]), h - B, 2.6, 0, 6.283); rctx.fill(); }
      }
    }
  }

  /* ---------------- loop ---------------- */

  var lastT = 0;
  function frame(t) {
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 0; lastT = t;
    if (cSpin.checked && !drag) yaw += dt * .22;
    growAll(9);
    drawCloud();
    requestAnimationFrame(frame);
  }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) cSpin.checked = false;
  readColors();
  window.addEventListener('resize', resize);
  window.addEventListener('themechange', function () { readColors(); drawRadial(); });
  document.addEventListener('visibilitychange', function () { lastT = 0; });
  resize();
  select(cur, qs.get('show') === 'atom' ? 'atom' : qs.get('show') === 'sub' ? 'sub' : 'orb');
  requestAnimationFrame(frame);
})();
