/* Faint background for the Paleontology page: a tree of life growing through
   time, in a margin beside the text.
   - One tree at a time: vertebrates, arthropods, land plants, mammals or
     cephalopods. Time runs from left to right, from the root, hundreds of
     millions of years ago, to today. The tree grows as time passes: branches
     split at their divergence dates, living groups reach the present, extinct
     ones stop at their extinction, marked †. The five great mass extinctions
     are drawn as dotted lines, with their names, when the present passes them. Each branch carries its name at
     its growing tip from the moment it appears, and a scale under the tree gives the time in millions of years.
   - When it is grown, the tree stays a while, fades away, and after a pause
     another one grows, on a random side but never more than twice in a row on
     the same side.
   Dates are rounded, from the usual fossil and molecular estimates.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?tree=debug to see it clearly. */
(function () {
  if (window.__treeBg) return;
  window.__treeBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]tree=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', baseAlpha = 0.22;
  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 1 : dark ? 0.22 : 0.25;
  }

  /* ---------------- the trees: N(node age in Ma, children), L(name, end in Ma; 0 = living) ---------------- */

  function N(t, c) { return { t: t, c: c }; }
  function L(n, end) { return { n: n, end: end }; }
  var TREES = [
    ['Vertebrates', N(530, [L('jawless fish', 0), N(460, [L('placoderms', 359), N(450, [L('sharks and rays', 0), N(425, [L('ray-finned fish', 0),
      N(415, [L('coelacanths', 0), N(375, [L('amphibians', 0), N(320, [L('mammals', 0), N(290, [L('ichthyosaurs', 90), N(270, [L('lizards and snakes', 0),
      N(250, [L('crocodiles', 0), N(235, [L('pterosaurs', 66), N(232, [L('non-avian dinosaurs', 66), L('birds', 0)])])])])])])])])])])])])],
    ['Arthropods', N(540, [L('trilobites', 252), N(530, [N(480, [L('sea scorpions', 252), L('horseshoe crabs', 0), L('spiders and scorpions', 0)]),
      N(520, [L('centipedes and millipedes', 0), N(480, [L('crustaceans', 0), L('insects', 0)])])])])],
    ['Land plants', N(470, [L('liverworts', 0), N(450, [L('mosses', 0), N(430, [L('lycophytes', 0), N(410, [L('ferns and horsetails', 0),
      N(360, [L('seed ferns', 66), N(310, [N(300, [L('cycads', 0), L('ginkgo', 0), L('conifers', 0)]), L('flowering plants', 0)])])])])])])],
    ['Mammals', N(210, [L('monotremes', 0), N(170, [L('multituberculates', 34), N(160, [L('marsupials', 0), N(100, [L('elephants and kin', 0),
      L('sloths and armadillos', 0), N(90, [N(85, [L('whales and hoofed mammals', 0), L('bats', 0), L('carnivorans', 0)]), N(85, [L('rodents and rabbits', 0), L('primates', 0)])])])])])])],
    ['Cephalopods', N(500, [L('nautiloids', 0), N(410, [L('ammonoids', 66), N(320, [L('belemnites', 66), L('squids and cuttlefish', 0), L('octopuses', 0)])])])]
  ];

  // lay a tree out: leaves evenly spaced, each node at the mean height of its children
  function layout(root) {
    var leaves = [], edges = [];
    (function walk(nd) { if (nd.c) nd.c.forEach(walk); else { nd.y = leaves.length; leaves.push(nd); } })(root);
    (function place(nd) { if (nd.c) { nd.c.forEach(place); nd.y = nd.c.reduce(function (s, c) { return s + c.y; }, 0) / nd.c.length; } })(root);
    (function link(nd) { if (nd.c) nd.c.forEach(function (c) { edges.push([nd, c]); link(c); }); })(root);
    return { root: root, leaves: leaves, edges: edges, age: root.t };
  }

  /* ---------------- one tree at a time ---------------- */

  var GROW = 13, HOLD = 8, FADE = 2.2, cur = null;
  function places() {
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    return [{ x0: 0, x1: r.left }, { x0: r.right, x1: W }];
  }
  function next(t0) {
    var k; do { k = Math.floor(Math.random() * TREES.length); } while (cur && k === cur.k);
    var side = Math.random() < .5 ? 0 : 1;
    if (cur && cur.run >= 2 && side === cur.side) side = 1 - side;   // never more than twice in a row on the same side
    return { k: k, name: TREES[k][0], tr: layout(TREES[k][1]), t0: t0, side: side, run: cur && cur.side === side ? cur.run + 1 : 1 };
  }

  function drawTree(c, a, grown) {
    var p = places()[c.side], mw = p.x1 - p.x0;
    if (mw < 230) return;                                       // no room in the margin (a phone): nothing
    var tr = c.tr, n = tr.leaves.length;
    var fs = Math.max(10, Math.min(13, mw * .032)), pad = mw * .07;
    var lab = Math.min(mw * .42, fs * 10.5), x0 = p.x0 + pad, x1 = p.x1 - pad - lab;
    var rowH = Math.min(30, H * .62 / n), h = rowH * (n - 1), y0 = H * .5 - h / 2 - fs;
    var X = function (t) { return x0 + (tr.age - t) / tr.age * (x1 - x0); }, Y = function (v) { return y0 + v * rowH; };
    var T = tr.age * (1 - grown);                               // the present of the growing tree, in Ma
    ctx.strokeStyle = ctx.fillStyle = ink; ctx.lineCap = ctx.lineJoin = 'round';
    // branches: from the parent's split, a soft bend to the child's height, then on through time
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.lineWidth = 1.2;
    tr.edges.forEach(function (e) {
      var par = e[0], ch = e[1], tEnd = ch.c ? ch.t : ch.end;
      if (T >= par.t) return;
      var xa = X(par.t), xb = X(Math.max(tEnd, T)), ya = Y(par.y), yb = Y(ch.y), bend = Math.max(6, Math.min(26, (X(tEnd) - xa) * .6));
      ctx.beginPath(); ctx.moveTo(xa, ya);
      for (var x = xa; x <= xb + .01; x += 2) {
        var u = Math.min(1, (x - xa) / bend), sm = u * u * (3 - 2 * u);
        ctx.lineTo(Math.min(x, xb), ya + (yb - ya) * sm);
      }
      ctx.stroke();
      if (!ch.c && ch.end > 0 && T <= ch.end) { L2(X(ch.end), yb - 4, X(ch.end), yb + 4); }   // extinction: a short bar
    });
    // the root's stem, from just before it
    ctx.beginPath(); ctx.moveTo(x0 - pad * .4, Y(tr.root.y)); ctx.lineTo(x0, Y(tr.root.y)); ctx.stroke();
    // the five great mass extinctions, once the present has passed them: a dotted line and their name
    var sy0 = Y(n - 1) + fs * 2.2;
    [[445, 'end-Ordovician'], [372, 'Late Devonian'], [252, 'end-Permian'], [201, 'end-Triassic'], [66, 'end-Cretaceous']].forEach(function (ex) {
      if (ex[0] > tr.age || T > ex[0]) return;
      var x = X(ex[0]), k = Math.min(1, (ex[0] - T) / (tr.age * .03) + (grown >= 1 ? 1 : 0));
      ctx.globalAlpha = Math.min(1, a * 1.5 * k); ctx.lineWidth = .9; ctx.setLineDash([1.5, 3]);
      L2(x, y0 - fs * .9, x, sy0 - 4); ctx.setLineDash([]);
      ctx.save(); ctx.translate(x - 3, y0 - fs * 1.1); ctx.rotate(-Math.PI / 2);
      ctx.globalAlpha = Math.min(1, a * 2 * k); ctx.font = 'italic ' + (fs * .78) + 'px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText(ex[1] + ' extinction', 0, 0);
      ctx.restore();
    });
    // each name rides on the tip of its branch from the moment the branch appears, and stops with it
    var parentOf = new Map(); tr.edges.forEach(function (e) { parentOf.set(e[1], e[0]); });
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = 'italic ' + fs + 'px ' + FONT;
    tr.leaves.forEach(function (lf) {
      var born = parentOf.get(lf).t;
      if (T >= born) return;
      var k = Math.min(1, (born - T) / (tr.age * .04) + (grown >= 1 ? 1 : 0));
      var stopped = T <= lf.end, x = X(Math.max(lf.end, T));
      ctx.globalAlpha = Math.min(1, a * (stopped ? 2.4 : 1.8) * k);
      ctx.fillText((lf.end > 0 && stopped ? '† ' : '') + lf.n, x + 6, Y(lf.y));
    });
    // the scale of time, and the name of the tree
    var sy = Y(n - 1) + fs * 2.2;
    ctx.globalAlpha = Math.min(1, a * 1.8); ctx.lineWidth = .8;
    L2(x0, sy, x1, sy);
    var step = tr.age > 300 ? 100 : 50;
    ctx.font = (fs * .8) + 'px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var top = Math.floor(tr.age / step) * step;
    for (var t = 0; t <= tr.age; t += step) { L2(X(t), sy - 3, X(t), sy + 3); ctx.fillText(t === 0 ? 'today' : t === top ? t + ' Ma' : String(t), X(t), sy + 5); }
    ctx.globalAlpha = Math.min(1, a * 2.4); ctx.font = (fs * 1.15) + 'px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(c.name, x0, sy + fs * 2.9);   // under the time scale, clear of the extinction names above
    if (T > 0) { ctx.globalAlpha = Math.min(1, a * 1.6); ctx.setLineDash([2, 3]); L2(X(T), y0 - fs * .6, X(T), sy - 4); ctx.setLineDash([]); }   // the moving present
  }
  function L2(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var life = GROW + HOLD + FADE;
    if (!reduce && time > cur.t0 + life) cur = next(time + rnd(1.5, 3.5));
    var age = time - cur.t0;
    if (reduce) { drawTree(cur, baseAlpha, 1); return; }
    if (age < 0) return;
    var g = Math.min(1, age / GROW), eased = 1 - Math.pow(1 - g, 1.6);
    var k = Math.min(1, age / 1, (life - age) / FADE);
    drawTree(cur, baseAlpha * Math.max(0, k), eased);
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
    cv.id = 'tree-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize();
    cur = next(0);
    var skip = /[?&]tree-t=(\d+)/.exec(location.search); if (skip) time = +skip[1];          // test: start n seconds in
    var pick = /[?&]tree-k=(\d+)/.exec(location.search); if (pick) { cur.k = +pick[1] % TREES.length; cur.name = TREES[cur.k][0]; cur.tr = layout(TREES[cur.k][1]); }
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
