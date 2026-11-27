/* Faint background for the Mathematics page, in the same spirit as the fish and
   the blown-away book pages elsewhere on the site.
   - In the left margin, the graph of a basic function traced from left to right
     on its axes (x, x², x³, 1/x, √x, |x|, eˣ, ln x, sin, cos, tan, arctan, the
     Gaussian, floor, sinc…), or a function of two variables drawn as a surface
     over the plane (convex, concave, saddle, plane, cone, ripples…), with its
     formula and name; then another one.
   - In the right margin, a shape, a new one picked at random every so often:
     surfaces turning in 3D (torus, sphere, trefoil knot, saddle, helicoid,
     catenoid, hyperboloid, Enneper and Dini surfaces), solids (cube, cuboid,
     tetrahedron, octahedron, icosahedron, pyramid, prism, cylinder, cone) and
     plane figures with the marks of geometry drawings (every kind of triangle,
     square, rectangle, rhombus, parallelogram, trapezoid, regular polygons,
     circle, ellipse), each with its name and a property.
   - One classic formula at a time, with its name, at the top of the left margin
     or at the bottom of the right one; it fades away and the next one appears.
   - Nothing is drawn behind the text: the graph keeps to the left margin, the
     surface to the right one, and the formulas to either, where they fit whole.
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

  /* ---------------- graphs of the basic functions ---------------- */

  var TAU = Math.PI * 2;
  // formula (^{…} for powers), name, the function, the window [x0, x1, y0, y1]
  var FUNCS = [
    ['y = x', 'identity', function (x) { return x; }, [-3, 3, -3, 3]],
    ['y = x^{2}', 'square', function (x) { return x * x; }, [-3, 3, -1, 5]],
    ['y = x^{3}', 'cube', function (x) { return x * x * x; }, [-2, 2, -4, 4]],
    ['y = \\f{1}{x}', 'reciprocal', function (x) { return 1 / x; }, [-4, 4, -4, 4]],
    ['y = \\f{1}{x^{2}}', 'inverse square', function (x) { return 1 / (x * x); }, [-4, 4, -1, 5]],
    ['y = \\sqrt{x}', 'square root', function (x) { return x < 0 ? NaN : Math.sqrt(x); }, [-1, 6, -1, 3]],
    ['y = |x|', 'absolute value', function (x) { return Math.abs(x); }, [-3, 3, -1, 3]],
    ['y = e^{x}', 'exponential', function (x) { return Math.exp(x); }, [-3, 2, -1, 6]],
    ['y = ln x', 'natural logarithm', function (x) { return x <= 0 ? NaN : Math.log(x); }, [-1, 6, -3, 2]],
    ['y = sin x', 'sine', function (x) { return Math.sin(x); }, [-7, 7, -2, 2]],
    ['y = cos x', 'cosine', function (x) { return Math.cos(x); }, [-7, 7, -2, 2]],
    ['y = tan x', 'tangent', function (x) { return Math.tan(x); }, [-4.7, 4.7, -4, 4]],
    ['y = arctan x', 'arctangent', function (x) { return Math.atan(x); }, [-6, 6, -2, 2]],
    ['y = e^{−x^{2}}', 'Gaussian', function (x) { return Math.exp(-x * x); }, [-3, 3, -.5, 1.5]],
    ['y = ⌊x⌋', 'floor', function (x) { return Math.floor(x); }, [-3, 3, -3, 3]],
    ['y = \\f{sin x}{x}', 'sinc', function (x) { return x ? Math.sin(x) / x : 1; }, [-12, 12, -.5, 1.2]],
    // functions of two variables, z = f(x, y), drawn as a surface over the plane: [formula, name, null, null, f, half-width of the domain]
    ['z = x^{2} + y^{2}', 'paraboloid: convex, a minimum', null, null, function (x, y) { return x * x + y * y; }, 1],
    ['z = −(x^{2} + y^{2})', 'concave, a maximum', null, null, function (x, y) { return -(x * x + y * y); }, 1],
    ['z = x^{2} − y^{2}', 'saddle: neither convex nor concave', null, null, function (x, y) { return x * x - y * y; }, 1],
    ['z = x y', 'saddle, turned by 45°', null, null, function (x, y) { return x * y; }, 1],
    ['z = \\f{x}{2} + \\f{y}{3}', 'a plane: both convex and concave', null, null, function (x, y) { return x / 2 + y / 3; }, 1],
    ['z = \\sqrt{x^{2} + y^{2}}', 'cone: convex, not smooth at the origin', null, null, function (x, y) { return Math.sqrt(x * x + y * y); }, 1],
    ['z = e^{−(x^{2} + y^{2})}', 'Gaussian bump', null, null, function (x, y) { return Math.exp(-(x * x + y * y)); }, 2],
    ['z = sin x cos y', 'egg crate: maxima and minima in turn', null, null, function (x, y) { return Math.sin(x) * Math.cos(y); }, Math.PI],
    ['z = x^{3} − 3x y^{2}', 'monkey saddle', null, null, function (x, y) { return x * x * x - 3 * x * y * y; }, 1],
    ['z = \\f{sin r}{r}', 'ripples, with r = √(x² + y²)', null, null, function (x, y) { var r = Math.hypot(x, y); return r ? Math.sin(r) / r : 1; }, 10]
  ];
  var graph = { k: Math.floor(Math.random() * FUNCS.length), t0: 0 }, TRACE = 4.5, HOLDG = 4, FADEG = 1.2;
  var pickF = /[?&]math-f=(\d+)/.exec(location.search); if (pickF) graph.k = +pickF[1] % FUNCS.length;   // test: a given function

  function drawGraph(alpha) {
    var G = geo().e;
    if (!G.on) return;                                  // no margin wide enough (a phone): nothing
    var life = TRACE + HOLDG + FADEG, age = time - graph.t0;
    if (!reduce && age > life + .8) { var n; do { n = Math.floor(Math.random() * FUNCS.length); } while (n === graph.k); graph.k = n; graph.t0 = time; age = 0; }
    var F = FUNCS[graph.k];
    if (F[4]) return drawSurfaceGraph(F, G, age, life, alpha);
    var v = F[3], S = G.S, x0 = G.cx - S * 1.15, x1 = G.cx + S * 1.15, y0 = G.cy - S * .95, y1 = G.cy + S * .95;
    var X = function (x) { return x0 + (x - v[0]) / (v[1] - v[0]) * (x1 - x0); }, Y = function (y) { return y1 - (y - v[2]) / (v[3] - v[2]) * (y1 - y0); };
    var k = reduce ? 1 : Math.max(0, Math.min(1, age / .8, (life - age) / FADEG)), drawn = reduce ? 1 : Math.min(1, age / TRACE);
    ctx.lineWidth = 1;
    // axes, with a tick at each unit
    stroke(alpha * 1.1 * k);
    if (v[2] < 0 && v[3] > 0) { L(x0, Y(0), x1, Y(0)); for (var t = Math.ceil(v[0]); t <= v[1]; t++) if (t) L(X(t), Y(0) - 3, X(t), Y(0) + 3); }
    if (v[0] < 0 && v[1] > 0) { L(X(0), y0, X(0), y1); for (t = Math.ceil(v[2]); t <= v[3]; t++) if (t) L(X(0) - 3, Y(t), X(0) + 3, Y(t)); }
    // the curve, traced from left to right; broken where the function jumps or leaves the window
    stroke(alpha * 2.4 * k); ctx.lineWidth = 1.6;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    ctx.beginPath();
    var N = 400, pen = false, prev = null;
    for (var i = 0; i <= N * drawn; i++) {
      var x = v[0] + (v[1] - v[0]) * i / N, y = F[2](x);
      if (!isFinite(y) || Math.abs(y) > 1e3 || (prev !== null && Math.abs(y - prev) > (v[3] - v[2]) * .5)) { pen = false; prev = isFinite(y) ? y : null; continue; }
      pen ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)); pen = true; prev = y;
    }
    ctx.stroke(); ctx.restore();
    // the formula and the name of the function
    label([F[0], F[1]], G.cx, y1 + S * .35, alpha * 2.2 * k, G.w - 16);
  }
  function L(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  // z = f(x, y): a wireframe over the plane, turning slowly; its lines appear one after another
  function drawSurfaceGraph(F, G, age, life, alpha) {
    var S = Math.min(G.S * .75, G.w * .27), cx = G.cx, cy = G.cy, d = F[5], n = 16, f = F[4];
    var k = reduce ? 1 : Math.max(0, Math.min(1, age / .8, (life - age) / FADEG)), drawn = reduce ? 1 : Math.min(1, age / TRACE);
    if (!F.zmax) { var zm = 0; for (var i = 0; i <= 20; i++) for (var j = 0; j <= 20; j++) zm = Math.max(zm, Math.abs(f(d * (i / 10 - 1), d * (j / 10 - 1)))); F.zmax = zm || 1; }
    var rx = -.5, ry = .6 + time * .2;
    function P(u, w) { var z = f(d * u, d * w) / F.zmax * .55; return project([u, -z, w], rx, ry, cx, cy, S); }
    // the axes through the origin
    stroke(alpha * 1.1 * k); ctx.lineWidth = .8;
    [[[-1.25, 0, 0], [1.25, 0, 0]], [[0, 0, -1.25], [0, 0, 1.25]], [[0, .8, 0], [0, -.9, 0]]].forEach(function (ax) { var a = project(ax[0], rx, ry, cx, cy, S), b = project(ax[1], rx, ry, cx, cy, S); L(a[0], a[1], b[0], b[1]); });
    stroke(alpha * 1.9 * k); ctx.lineWidth = 1;
    var lines = 2 * (n + 1), shown = Math.ceil(lines * drawn);
    for (var q = 0; q < shown; q++) {
      var along = q % 2, c = Math.floor(q / 2) / n * 2 - 1;
      ctx.beginPath();
      for (var t = 0; t <= 40; t++) { var u = t / 20 - 1, p = along ? P(u, c) : P(c, u); t ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.stroke();
    }
    label([F[0], F[1]], cx, cy + G.S * 1.15, alpha * 2.2 * k, G.w - 16);
  }

  // everything stays in the margins beside the text: the curve on the left, the surface on the right
  function geo() {
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    var Lm = [12, r.left - 16], Rm = [r.right + 16, W - 12], lw = Lm[1] - Lm[0], rw = Rm[1] - Rm[0];
    return { L: Lm, R: Rm,
             e: { on: lw >= 170, cx: (Lm[0] + Lm[1]) / 2, cy: H * .66, S: Math.min(H * .15, lw * .36), w: lw },
             s: { on: rw >= 170, cx: (Rm[0] + Rm[1]) / 2, cy: H * .3, S: Math.min(H * .16, rw * .32), w: rw } };
  }
  /* ---------------- a small typesetter: powers, indices, fractions with a bar, square roots ----------------
     x^{2}  x_{n}  \f{numerator}{denominator}  \b{n}{k} (binomial)  \sqrt{radicand} */
  function mparse(s) {
    var i = 0;
    function group(closing) {
      var out = [], buf = '';
      function flush() { if (buf) { out.push({ t: 'tx', s: buf }); buf = ''; } }
      while (i < s.length) {
        var c = s[i];
        if (c === '}' && closing) { i++; break; }
        if ((c === '^' || c === '_') && s[i + 1] === '{') { flush(); i += 2; out.push({ t: c === '^' ? 'sup' : 'sub', b: group(true) }); continue; }
        if (s.substr(i, 3) === '\\f{') { flush(); i += 3; var num = group(true); i++; out.push({ t: 'frac', n: num, d: group(true) }); continue; }
        if (s.substr(i, 3) === '\\b{') { flush(); i += 3; var top = group(true); i++; out.push({ t: 'frac', n: top, d: group(true), nobar: true }); continue; }   // binomial: no bar
        if (s.substr(i, 6) === '\\sqrt{') { flush(); i += 6; out.push({ t: 'sqrt', b: group(true) }); continue; }
        buf += c; i++;
      }
      flush(); return out;
    }
    return group(false);
  }
  function mbox(nodes, size, style) { // a box: width, height above and below the baseline, and how to draw it
    var items = [], w = 0, asc = size * .72, desc = size * .22;
    nodes.forEach(function (n) {
      var b;
      if (n.t === 'tx') {
        ctx.font = style + size + 'px ' + FONT;
        b = { w: ctx.measureText(n.s).width, asc: size * .72, desc: size * .22, draw: function (x, y) { ctx.font = style + size + 'px ' + FONT; ctx.fillText(n.s, x, y); } };
      } else if (n.t === 'sup') {
        var bp = mbox(n.b, size * .7, style), up = size * .42;
        b = { w: bp.w + size * .04, asc: bp.asc + up, desc: Math.max(0, bp.desc - up), draw: function (x, y) { bp.draw(x, y - up); } };
      } else if (n.t === 'sub') {
        var bs = mbox(n.b, size * .7, style), dn = size * .24;
        b = { w: bs.w + size * .04, asc: Math.max(0, bs.asc - dn), desc: bs.desc + dn, draw: function (x, y) { bs.draw(x, y + dn); } };
      } else if (n.t === 'frac') {   // numerator over denominator, centred, with a horizontal bar on the maths axis
        var nb = mbox(n.n, size * .8, style), db = mbox(n.d, size * .8, style), fw = Math.max(nb.w, db.w) + size * .25, axis = size * .27, gap = size * .13, side = size * .08;
        b = { w: fw + 2 * side, asc: axis + gap + nb.desc + nb.asc, desc: Math.max(0, db.asc + db.desc + gap - axis),
              draw: function (x, y) {
                var by = y - axis;
                nb.draw(x + side + (fw - nb.w) / 2, by - gap - nb.desc); db.draw(x + side + (fw - db.w) / 2, by + gap + db.asc);
                if (!n.nobar) ctx.fillRect(x + side, by - size * .028, fw, Math.max(1, size * .055));
              } };
      } else if (n.t === 'sqrt') {   // the radical sign and its bar over the radicand
        var rb = mbox(n.b, size, style), rw = size * .5, top = rb.asc + size * .1;
        b = { w: rw + rb.w + size * .12, asc: top + size * .06, desc: rb.desc + size * .04,
              draw: function (x, y) {
                ctx.save(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = Math.max(1, size * .055); ctx.lineJoin = 'miter';
                ctx.beginPath(); ctx.moveTo(x, y - size * .28); ctx.lineTo(x + rw * .28, y - size * .36); ctx.lineTo(x + rw * .62, y + rb.desc * .6); ctx.lineTo(x + rw, y - top); ctx.lineTo(x + rw + rb.w + size * .08, y - top); ctx.stroke();
                ctx.restore(); rb.draw(x + rw + size * .04, y);
              } };
      }
      items.push(b); w += b.w; asc = Math.max(asc, b.asc); desc = Math.max(desc, b.desc);
    });
    return { w: w, asc: asc, desc: desc, draw: function (x, y) { items.forEach(function (b) { b.draw(x, y); x += b.w; }); } };
  }
  function typeset(str, size, style) { return mbox(mparse(str), size, style || ''); }

  function label(lines, x, y, a, maxW) { // a name, and a line under it, small and centred, never wider than maxW
    var fs = Math.max(12, Math.min(17, Math.min(W, H) * .02));
    fill(a); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    lines.forEach(function (l, i) {
      var f = i ? fs * .72 : fs, st = i ? 'italic ' : '';
      if (!i && /[{\\]/.test(l)) {                     // a formula: typeset, italic
        var bx = typeset(l, f * 1.1, 'italic '); if (maxW && bx.w > maxW) bx = typeset(l, f * 1.1 * maxW / bx.w, 'italic ');
        ctx.textAlign = 'left'; bx.draw(x - bx.w / 2, y); ctx.textAlign = 'center'; return;
      }
      if (!i) st = 'italic ';
      ctx.font = st + f + 'px ' + FONT;
      var w = ctx.measureText(l).width; if (maxW && w > maxW) { f *= maxW / w; ctx.font = st + f + 'px ' + FONT; }
      ctx.fillText(l, x, y + i * fs * 1.05);
    });
    ctx.textAlign = 'left';
  }

  /* ---------------- turning wireframe surface ---------------- */

  function trefoil(u) { return [Math.sin(u) + 2 * Math.sin(2 * u), Math.cos(u) - 2 * Math.cos(2 * u), -Math.sin(3 * u)]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function unit(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function tube(curve, r) { // a tube of radius r around a closed space curve
    return function (u, v) {
      var h = 1e-3, c = curve(u), T = unit(sub(curve(u + h), curve(u - h)));
      var N = unit(sub(sub(curve(u + h), c), sub(c, curve(u - h)))), B = cross(T, N);
      return [c[0] + r * (Math.cos(v) * N[0] + Math.sin(v) * B[0]), c[1] + r * (Math.cos(v) * N[1] + Math.sin(v) * B[1]), c[2] + r * (Math.cos(v) * N[2] + Math.sin(v) * B[2])];
    };
  }
  var cosh = Math.cosh || function (x) { return (Math.exp(x) + Math.exp(-x)) / 2; };
  var sinh = Math.sinh || function (x) { return (Math.exp(x) - Math.exp(-x)) / 2; };
  // orientable surfaces only; each is centred and scaled to unit size when it is first shown
  var SURFACES = [
    { name: 'torus', what: 'a surface with one hole, genus 1', u: [0, TAU], v: [0, TAU], nu: 28, nv: 14, f: function (u, v) { var R = 1, r = .42; return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v)]; } },
    { name: 'sphere', what: 'the simplest closed surface, genus 0', u: [0, TAU], v: [0, Math.PI], nu: 24, nv: 12, f: function (u, v) { return [Math.cos(u) * Math.sin(v), Math.sin(u) * Math.sin(v), Math.cos(v)]; } },
    { name: 'trefoil knot', what: 'the simplest true knot, as a tube', u: [0, TAU], v: [0, TAU], nu: 64, nv: 6, f: tube(trefoil, .38) },
    { name: 'saddle', what: 'z = x² − y², curved two ways at once', u: [-1, 1], v: [-1, 1], nu: 14, nv: 14, f: function (u, v) { return [u, v, (u * u - v * v) * .65]; } },
    { name: 'helicoid', what: 'a minimal surface, like a spiral staircase', u: [-Math.PI, Math.PI], v: [-1, 1], nu: 36, nv: 8, f: function (u, v) { return [v * Math.cos(u), v * Math.sin(u), u * .32]; } },
    { name: 'catenoid', what: 'a minimal surface, a soap film between two rings', u: [0, TAU], v: [-1.1, 1.1], nu: 28, nv: 12, f: function (u, v) { return [cosh(v) * Math.cos(u), cosh(v) * Math.sin(u), v]; } },
    { name: 'hyperboloid', what: 'one sheet, ruled by straight lines', u: [0, TAU], v: [-1, 1], nu: 28, nv: 10, f: function (u, v) { return [cosh(v) * Math.cos(u), cosh(v) * Math.sin(u), sinh(v)]; } },
    { name: 'Enneper surface', what: 'a minimal surface that crosses itself', u: [0, TAU], v: [0, 1.25], nu: 32, nv: 10, f: function (t, r) { return [r * Math.cos(t) - r * r * r * Math.cos(3 * t) / 3, -r * Math.sin(t) - r * r * r * Math.sin(3 * t) / 3, r * r * Math.cos(2 * t)]; } },
    { name: 'Dini surface', what: 'constant negative curvature, twisted', u: [0, 4 * Math.PI], v: [.12, 2], nu: 48, nv: 10, f: function (u, v) { return [Math.cos(u) * Math.sin(v), Math.sin(u) * Math.sin(v), Math.cos(v) + Math.log(Math.tan(v / 2)) + .2 * u]; } }
  ];
  /* ---------------- basic geometry: polygons and solids ---------------- */

  function solid(name, what, verts, edgeLen) { // a polyhedron from its vertices; edges join the vertices at the shortest distance
    var edges = [], d = edgeLen;
    if (!d) { d = 1e9; for (var i = 0; i < verts.length; i++) for (var j = i + 1; j < verts.length; j++) d = Math.min(d, dist(verts[i], verts[j])); }
    for (i = 0; i < verts.length; i++) for (j = i + 1; j < verts.length; j++) if (Math.abs(dist(verts[i], verts[j]) - d) < d * .02) edges.push([i, j]);
    return { name: name, what: what, verts: verts, edges: edges };
  }
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
  function box(a, b, c) { var v = []; for (var i = 0; i < 8; i++) v.push([i & 1 ? a : -a, i & 2 ? b : -b, i & 4 ? c : -c]); return v; }
  function regular(n, r, rot) { var p = []; for (var i = 0; i < n; i++) { var t = rot + i * TAU / n; p.push([r * Math.cos(t), r * Math.sin(t)]); } return p; }
  var PHI = (1 + Math.sqrt(5)) / 2, ICO = [];
  [-1, 1].forEach(function (a) { [-PHI, PHI].forEach(function (b) { ICO.push([0, a, b], [a, b, 0], [b, 0, a]); }); });
  var cubeV = box(1, 1, 1), cuboidV = box(1.4, .8, .6);
  function boxSolid(name, what, v) { var s0 = { name: name, what: what, verts: v, edges: [] }; for (var i = 0; i < 8; i++) for (var b = 0; b < 3; b++) if (!(i & (1 << b))) s0.edges.push([i, i | (1 << b)]); return s0; }
  var GEOMETRY = [
    boxSolid('cube', '6 square faces, 12 edges, 8 vertices', cubeV),
    boxSolid('rectangular cuboid', 'volume = length × width × height', cuboidV),
    solid('tetrahedron', '4 triangular faces', [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]),
    solid('octahedron', '8 triangular faces', [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]),
    solid('icosahedron', '20 triangular faces', ICO, 2),
    { name: 'square pyramid', what: 'volume = ⅓ × base × height', verts: [[-1, -1, -.7], [1, -1, -.7], [1, 1, -.7], [-1, 1, -.7], [0, 0, 1.1]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]] },
    { name: 'triangular prism', what: 'volume = base × height', verts: [[1, 0, -1], [-.5, .87, -1], [-.5, -.87, -1], [1, 0, 1], [-.5, .87, 1], [-.5, -.87, 1]], edges: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]] },
    { name: 'cylinder', what: 'volume = πr²h', u: [0, TAU], v: [-1, 1], nu: 24, nv: 3, f: function (u, v) { return [Math.cos(u), Math.sin(u), v * 1.1]; } },
    { name: 'cone', what: 'volume = ⅓πr²h', u: [0, TAU], v: [0, 1], nu: 24, nv: 4, f: function (u, v) { return [(1 - v) * Math.cos(u), (1 - v) * Math.sin(u), v * 2 - 1]; } },
    // flat shapes: outline, and the marks of geometry drawings (equal sides, right angles)
    { name: 'equilateral triangle', what: 'three equal sides, three angles of 60°', flat: regular(3, 1, -Math.PI / 2), ticks: [[0, 1], [1, 1], [2, 1]] },
    { name: 'isosceles triangle', what: 'two equal sides', flat: [[0, -1.1], [.6, .8], [-.6, .8]], ticks: [[0, 1], [2, 1]] },
    { name: 'right triangle', what: 'a² + b² = c²', flat: [[-.9, .8], [.9, .8], [-.9, -.9]], right: [0] },
    { name: 'scalene triangle', what: 'three different sides', flat: [[-1, .7], [1, .8], [.3, -.9]] },
    { name: 'obtuse triangle', what: 'one angle wider than 90°', flat: [[-1.2, .5], [1.2, .5], [-.6, -.15]] },
    { name: 'square', what: 'four equal sides, four right angles', flat: [[-.9, -.9], [.9, -.9], [.9, .9], [-.9, .9]], ticks: [[0, 1], [1, 1], [2, 1], [3, 1]], right: [0, 1, 2, 3] },
    { name: 'rectangle', what: 'four right angles', flat: [[-1.2, -.7], [1.2, -.7], [1.2, .7], [-1.2, .7]], ticks: [[0, 1], [1, 2], [2, 1], [3, 2]], right: [0, 1, 2, 3] },
    { name: 'rhombus', what: 'four equal sides', flat: [[0, -1.1], [.75, 0], [0, 1.1], [-.75, 0]], ticks: [[0, 1], [1, 1], [2, 1], [3, 1]] },
    { name: 'parallelogram', what: 'opposite sides parallel and equal', flat: [[-1.2, .7], [.6, .7], [1.2, -.7], [-.6, -.7]] },
    { name: 'trapezoid', what: 'one pair of parallel sides', flat: [[-1.2, .7], [1.2, .7], [.6, -.7], [-.6, -.7]] },
    { name: 'regular pentagon', what: 'interior angles of 108°', flat: regular(5, 1.05, -Math.PI / 2) },
    { name: 'regular hexagon', what: 'interior angles of 120°', flat: regular(6, 1.05, 0) },
    { name: 'circle', what: 'circumference 2πr, area πr²', flat: regular(120, 1, 0), radius: true },
    { name: 'ellipse', what: 'x²/a² + y²/b² = 1', flat: regular(120, 1, 0).map(function (p) { return [p[0] * 1.3, p[1] * .7]; }) }
  ];
  GEOMETRY.forEach(function (g) { SURFACES.push(g); });

  function normalise(sf) {
    if (sf.k) return;
    if (sf.flat) { sf.k = 1; sf.c = [0, 0, 0]; return; }
    if (sf.verts) {
      var lo0 = [1e9, 1e9, 1e9], hi0 = [-1e9, -1e9, -1e9];
      sf.verts.forEach(function (p) { for (var a = 0; a < 3; a++) { lo0[a] = Math.min(lo0[a], p[a]); hi0[a] = Math.max(hi0[a], p[a]); } });
      sf.c = [(lo0[0] + hi0[0]) / 2, (lo0[1] + hi0[1]) / 2, (lo0[2] + hi0[2]) / 2];
      var m0 = 0; sf.verts.forEach(function (p) { m0 = Math.max(m0, dist(p, sf.c)); });
      sf.k = 1.15 / m0; return;
    }
    var pts = [];
    for (var i = 0; i <= 20; i++) for (var j = 0; j <= 20; j++) pts.push(sf.f(sf.u[0] + (sf.u[1] - sf.u[0]) * i / 20, sf.v[0] + (sf.v[1] - sf.v[0]) * j / 20));
    var lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    pts.forEach(function (p) { for (var a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], p[a]); hi[a] = Math.max(hi[a], p[a]); } });
    sf.c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
    var m = 0; pts.forEach(function (p) { m = Math.max(m, Math.hypot(p[0] - sf.c[0], p[1] - sf.c[1], p[2] - sf.c[2])); });
    sf.k = 1.25 / m;
  }
  var surf = { cur: Math.floor(Math.random() * SURFACES.length), prev: -1, since: 0 };
  var pick = /[?&]math-s=(\d+)/.exec(location.search); if (pick) surf.cur = +pick[1] % SURFACES.length; // test: start on a given surface
  var SURF_TIME = 13;

  function project(p, rx, ry, cx, cy, S) {
    var x = p[0], y = p[1], z = p[2];
    var c = Math.cos(ry), s = Math.sin(ry), x1 = c * x + s * z, z1 = -s * x + c * z;   // turn about the vertical
    c = Math.cos(rx); s = Math.sin(rx); var y1 = c * y - s * z1, z2 = s * y + c * z1; // tilt towards the viewer
    var k = 3.2 / (3.2 + z2);
    return [cx + x1 * S * k, cy + y1 * S * k];
  }
  function drawSurface(sf, alpha) {
    normalise(sf);
    var G = geo().s, S = G.S, cx = G.cx, cy = G.cy;
    if (!G.on) return;
    var rx = -1.05 + Math.sin(time * 0.11) * 0.25, ry = time * 0.18;
    stroke(alpha); ctx.lineWidth = 1;
    var title = [sf.name[0].toUpperCase() + sf.name.slice(1), sf.what];
    if (sf.flat) {   // a plane figure, turning slowly in its own plane, with its marks
      var rot = Math.sin(time * .15) * .35, cr = Math.cos(rot), sr = Math.sin(rot), sc = S * .9;
      var P = sf.flat.map(function (p) { return [cx + (p[0] * cr - p[1] * sr) * sc, cy + (p[0] * sr + p[1] * cr) * sc]; }), n = P.length;
      stroke(alpha * 2.2); ctx.lineWidth = 1.4; ctx.beginPath(); P.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.stroke();
      ctx.lineWidth = 1;
      (sf.ticks || []).forEach(function (t) {   // equal sides: one or two small strokes across the middle
        var a = P[t[0]], b = P[(t[0] + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * 5, ny = dx / l * 5;
        for (var q = 0; q < t[1]; q++) { var o = (q - (t[1] - 1) / 2) * 4, ox = dx / l * o, oy = dy / l * o; L(mx + ox - nx, my + oy - ny, mx + ox + nx, my + oy + ny); }
      });
      (sf.right || []).forEach(function (i) {   // right angles: a small square in the corner
        var c0 = P[i], a = P[(i + 1) % n], b = P[(i + n - 1) % n], m = 9;
        var ua = [(a[0] - c0[0]) / Math.hypot(a[0] - c0[0], a[1] - c0[1]) * m, (a[1] - c0[1]) / Math.hypot(a[0] - c0[0], a[1] - c0[1]) * m];
        var ub = [(b[0] - c0[0]) / Math.hypot(b[0] - c0[0], b[1] - c0[1]) * m, (b[1] - c0[1]) / Math.hypot(b[0] - c0[0], b[1] - c0[1]) * m];
        ctx.beginPath(); ctx.moveTo(c0[0] + ua[0], c0[1] + ua[1]); ctx.lineTo(c0[0] + ua[0] + ub[0], c0[1] + ua[1] + ub[1]); ctx.lineTo(c0[0] + ub[0], c0[1] + ub[1]); ctx.stroke();
      });
      if (sf.radius) { L(cx, cy, P[0][0], P[0][1]); fill(alpha * 2.2); ctx.beginPath(); ctx.arc(cx, cy, 1.8, 0, TAU); ctx.fill(); }
      label(title, cx, cy + S * 1.45, alpha * 2.2, G.w - 16);
      return;
    }
    if (sf.verts) {   // a polyhedron: its edges, turning in 3D
      var Q = sf.verts.map(function (p) { return project([(p[0] - sf.c[0]) * sf.k, (p[1] - sf.c[1]) * sf.k, (p[2] - sf.c[2]) * sf.k], rx, ry, cx, cy, S); });
      stroke(alpha * 2); ctx.lineWidth = 1.3;
      sf.edges.forEach(function (e) { L(Q[e[0]][0], Q[e[0]][1], Q[e[1]][0], Q[e[1]][1]); });
      label(title, cx, cy + S * 1.45, alpha * 2.2, G.w - 16);
      return;
    }
    function line(fixU, val, n) {
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var t = i / n, u = fixU ? val : sf.u[0] + (sf.u[1] - sf.u[0]) * t, v = fixU ? sf.v[0] + (sf.v[1] - sf.v[0]) * t : val;
        var p = sf.f(u, v), q = project([(p[0] - sf.c[0]) * sf.k, (p[1] - sf.c[1]) * sf.k, (p[2] - sf.c[2]) * sf.k], rx, ry, cx, cy, S);
        i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]);
      }
      ctx.stroke();
    }
    for (var i = 0; i <= sf.nu; i++) line(true, sf.u[0] + (sf.u[1] - sf.u[0]) * i / sf.nu, 48);
    for (var j = 0; j <= sf.nv; j++) line(false, sf.v[0] + (sf.v[1] - sf.v[0]) * j / sf.nv, 64);
    label([sf.name[0].toUpperCase() + sf.name.slice(1), sf.what], cx, cy + S * 1.45, alpha * 2.2, G.w - 16);
  }
  function drawSurfaces(alpha) {
    if (time - surf.since > SURF_TIME) { // next structure, chosen at random
      var n; do { n = Math.floor(Math.random() * SURFACES.length); } while (n === surf.cur);
      surf.prev = surf.cur; surf.cur = n; surf.since = time;
    }
    var f = (time - surf.since) / 1.8;
    if (f < 1 && surf.prev >= 0) { drawSurface(SURFACES[surf.prev], alpha * (1 - f)); drawSurface(SURFACES[surf.cur], alpha * f); }
    else drawSurface(SURFACES[surf.cur], alpha);
  }

  /* ---------------- drifting formulas ---------------- */

  // each formula with its name, written under it
  var FORMULAS = [
    ['e^{iπ} + 1 = 0', "Euler's identity"], ['a^{2} + b^{2} = c^{2}', 'Pythagorean theorem'],
    ['∑_{n≥1} \\f{1}{n^{2}} = \\f{π^{2}}{6}', 'Basel problem (Euler, 1734)'], ['∫_{−∞}^{∞} e^{−x^{2}} dx = \\sqrt{π}', 'Gaussian integral'],
    ['φ = \\f{1 + \\sqrt{5}}{2}', 'golden ratio'], ['F_{n+1} = F_{n} + F_{n−1}', 'Fibonacci sequence'],
    ['V − E + F = 2', "Euler's polyhedron formula"], ['ζ(s) = ∑ n^{−s}', 'Riemann zeta function'],
    ['lim_{x→0} \\f{sin x}{x} = 1', 'a fundamental limit'], ['\\f{d}{dx} e^{x} = e^{x}', 'the exponential is its own derivative'],
    ['x = \\f{−b ± \\sqrt{b^{2} − 4ac}}{2a}', 'quadratic formula'], ['Γ(n) = (n − 1)!', 'gamma function'],
    ['i^{2} = −1', 'imaginary unit'], ['e^{iθ} = cos θ + i sin θ', "Euler's formula"],
    ['∮ f(z) dz = 2πi ∑ Res', 'residue theorem'], ['n! ≈ \\sqrt{2πn} (\\f{n}{e})^{n}', "Stirling's approximation"],
    ['π = 4 ∑ \\f{(−1)^{k}}{2k + 1}', 'Leibniz formula for π'], ['det(A − λI) = 0', 'characteristic equation'],
    ['\\f{∂u}{∂t} = α ∇^{2}u', 'heat equation'], ['p ∧ ¬p ⇒ q', 'principle of explosion'],
    // derivatives, from the basics to the less obvious
    ['f′(x) = lim_{h→0} \\f{f(x + h) − f(x)}{h}', 'definition of the derivative'],
    ['\\f{d}{dx} c = 0', 'derivative of a constant'], ['\\f{d}{dx} x^{n} = n x^{n−1}', 'power rule'],
    ['(f + g)′ = f′ + g′', 'sum rule'], ['(f g)′ = f′g + f g′', 'product rule'],
    ['(\\f{f}{g})′ = \\f{f′g − f g′}{g^{2}}', 'quotient rule'], ['(f ∘ g)′ = (f′ ∘ g) · g′', 'chain rule'],
    ['\\f{d}{dx} sin x = cos x', 'derivative of the sine'], ['\\f{d}{dx} cos x = −sin x', 'derivative of the cosine'],
    ['\\f{d}{dx} tan x = \\f{1}{cos^{2} x}', 'derivative of the tangent'], ['\\f{d}{dx} ln x = \\f{1}{x}', 'derivative of the logarithm'],
    ['\\f{d}{dx} a^{x} = a^{x} ln a', 'derivative of an exponential'], ['\\f{d}{dx} arcsin x = \\f{1}{\\sqrt{1 − x^{2}}}', 'derivative of the arcsine'],
    ['\\f{d}{dx} arctan x = \\f{1}{1 + x^{2}}', 'derivative of the arctangent'], ['(f^{−1})′(y) = \\f{1}{f′(f^{−1}(y))}', 'derivative of an inverse function'],
    ['\\f{d}{dx} x^{x} = x^{x} (ln x + 1)', 'derivative of x to the power x'], ['(f g)^{(n)} = ∑_{k} (\\b{n}{k}) f^{(k)} g^{(n−k)}', 'general Leibniz rule'],
    ['\\f{d}{dx} ∫_{a}^{x} f(t) dt = f(x)', 'fundamental theorem of calculus'], ['f(x) = ∑ \\f{f^{(n)}(a)}{n!} (x − a)^{n}', 'Taylor series'],
    ['∇f = (\\f{∂f}{∂x}, \\f{∂f}{∂y}, \\f{∂f}{∂z})', 'gradient'],
    // logic: connectives, laws and rules of inference
    ['(p ⇒ q) ⇔ (¬p ∨ q)', 'material implication'], ['(p ⇒ q) ⇔ (¬q ⇒ ¬p)', 'contraposition'],
    ['(p ⇔ q) ⇔ ((p ⇒ q) ∧ (q ⇒ p))', 'equivalence'], ['(p ∧ (p ⇒ q)) ⇒ q', 'modus ponens'],
    ['(¬q ∧ (p ⇒ q)) ⇒ ¬p', 'modus tollens'], ['((p ⇒ q) ∧ (q ⇒ r)) ⇒ (p ⇒ r)', 'hypothetical syllogism'],
    ['((p ∨ q) ∧ ¬p) ⇒ q', 'disjunctive syllogism'], ['¬(p ∧ q) ⇔ (¬p ∨ ¬q)', "De Morgan's law"],
    ['¬(p ∨ q) ⇔ (¬p ∧ ¬q)', "De Morgan's law"], ['¬¬p ⇔ p', 'double negation'],
    ['p ∨ ¬p', 'law of excluded middle'], ['¬(p ∧ ¬p)', 'law of non-contradiction'],
    ['p ∧ (q ∨ r) ⇔ (p ∧ q) ∨ (p ∧ r)', 'distributivity'], ['((p ∧ q) ⇒ r) ⇔ (p ⇒ (q ⇒ r))', 'exportation'],
    ['p ⊕ q ⇔ (p ∨ q) ∧ ¬(p ∧ q)', 'exclusive or'], ['((p ⇒ q) ⇒ p) ⇒ p', "Peirce's law"],
    ['¬∀x P(x) ⇔ ∃x ¬P(x)', 'negating “for all”'], ['¬∃x P(x) ⇔ ∀x ¬P(x)', 'negating “there exists”']
  ];

  function drawFormula(fm, alpha) {
    fill(alpha); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    fm.box.draw(fm.x, fm.y);
    ctx.font = (fm.size * .5).toFixed(1) + 'px ' + FONT; ctx.textAlign = 'center';   // its name, small, under it
    ctx.fillText(fm.name, fm.x + fm.box.w / 2, fm.y + fm.box.desc + fm.size * .6);
    ctx.textAlign = 'left';
  }
  // one formula at a time, either at the top of the left margin or at the bottom of the right one,
  // fitted to its margin, staying still while it shows, then the next one elsewhere
  var shown = null, nextAt = .5;
  function spawnFormula() {
    var pick; do { pick = FORMULAS[Math.floor(Math.random() * FORMULAS.length)]; } while (shown && pick[0] === shown.text);
    var force = /[?&]math-q=(\d+)/.exec(location.search); if (force && !shown) pick = FORMULAS[+force[1] % FORMULAS.length];   // test: a given formula first
    var G = geo(), corner = Math.random() < .5 ? 0 : 1, M = corner ? G.R : G.L, mw = M[1] - M[0];
    if (mw < 170) { corner = 1 - corner; M = corner ? G.R : G.L; mw = M[1] - M[0]; }
    if (mw < 170) { shown = null; return; }                                       // no margin (a phone): nothing
    var size = 26, box = typeset(pick[0], size, 'italic ');
    if (box.w > mw - 40) { size *= (mw - 40) / box.w; box = typeset(pick[0], size, 'italic '); }
    shown = { text: pick[0], name: pick[1], box: box, size: size, w: box.w, corner: corner,
              x: (M[0] + M[1]) / 2 - box.w / 2, y: corner ? H * .86 : H * .14, t0: time, life: rand(8, 11) };
  }
  function drawFormulas(alpha) {
    if (!shown || time - shown.t0 > shown.life) { if (time > nextAt) { spawnFormula(); nextAt = time + (shown ? shown.life : 0) + rand(1, 2); } else if (shown && time - shown.t0 > shown.life) shown = null; }
    if (!shown) return;
    var a = time - shown.t0, k = reduce ? 1 : Math.min(1, a / 1.5, (shown.life - a) / 1.5);
    drawFormula(shown, alpha * 1.3 * Math.max(0, k));
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
    drawGraph(baseAlpha);
    drawFormulas(baseAlpha);
    ctx.globalAlpha = 1;
  }
  function step(dt) {
    time += dt; dtLast = dt;
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
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    var skip = /[?&]math-t=(\d+)/.exec(location.search); // test: start n seconds in
    if (skip) for (var s = 0; s < +skip[1] * 30; s++) step(1 / 30);
    if (/[?&]math-q=/.test(location.search)) { nextAt = -1; draw(); if (shown) shown.t0 = -3; }   // test: shown at once
    if (reduce) { nextAt = -1; dtLast = 0; draw(); }
    else requestAnimationFrame(frame);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
