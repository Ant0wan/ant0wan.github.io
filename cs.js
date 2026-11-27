/* Faint background for the Computer Science page, in the margins beside the
   text. Three kinds of things come and go, each on its own clock, at most one of
   each at a time, never overlapping, and never more than twice in a row on the same
   side:
   - An algorithm at work: a sort on bars (bubble, insertion, selection, Shell,
     quicksort, merge sort, heapsort), a binary search, a graph search (breadth-
     first, depth-first, Dijkstra) or the Tower of Hanoi, run step by step, with
     its name, its complexity, and who devised it and when.
   - A logic circuit: a single gate, a half adder, a full adder or a multiplexer.
     The inputs run through every combination; wires carrying a 1 are drawn
     heavier, and the current row of the truth table is marked.
   - A small lesson in bash, Python, Go or Rust: a comment saying what it shows,
     and a few lines of code typed out as you watch.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?cs=debug to see it clearly. */
(function () {
  if (window.__csBg) return;
  window.__csBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]cs=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', baseAlpha = 0.2;
  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";
  var MONO = "'Latin Modern Mono', 'CMU Typewriter Text', 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ri(n) { return Math.floor(Math.random() * n); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 1 : dark ? 0.2 : 0.22;
  }
  function A(k) { ctx.globalAlpha = Math.max(0, Math.min(1, k)); }

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
    var forced = prev && prev.run >= 2, side = forced ? 1 - prev.side : (Math.random() < .5 ? 0 : 1), free = freeOn(side);
    if (!free.length) { if (forced) return false; side = 1 - side; free = freeOn(side); if (!free.length) return false; }
    it.side = side; it.run = prev && prev.side === side ? prev.run + 1 : 1;
    it.slot = free[ri(free.length)];
    return true;
  }
  function place(it, prev, others) { it.prev = prev; it.others = others; it.wait = !settle(it, prev, others()); if (!it.wait) it.prev = null; return it; }
  function retry(it) { // a waiting item tries again; it fades in from the moment it finds its place
    if (!it.wait || time < it.t0) return;
    if (settle(it, it.prev, it.others())) { it.wait = false; it.prev = null; it.t0 = time; } else it.t0 = time + .5;
  }

  function geo(it, P) { // centre and box width for an item, from its place
    var p = P[it.side], bw = Math.max(140, Math.min(290, p.w * .74));
    return { x: p.x, y: H * (it.slot ? .68 : .3), bw: bw, bh: bw * .56, w: p.w };
  }
  function caption(lines, x, y, fs, a) { // name, then smaller italic lines
    A(Math.min(1, a * 2.2)); ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    lines.forEach(function (l, i) { ctx.font = (i ? 'italic ' + fs * .72 : fs) + 'px ' + FONT; ctx.fillText(l, x, y + (i ? fs * (.35 + i * .95) : 0)); });
  }

  /* ---------------- algorithms ---------------- */

  function bars(n) { var a = []; for (var i = 0; i < n; i++) a.push(1 + ri(20)); return a; }
  function recorder(arr) { // run a sort on a copy, recording every comparison, swap and write
    var a = arr.slice(), ops = [];
    return {
      a: a, ops: ops,
      cmp: function (i, j) { ops.push(['c', i, j]); return a[i] - a[j]; },
      swap: function (i, j) { ops.push(['s', i, j]); var t = a[i]; a[i] = a[j]; a[j] = t; },
      set: function (i, v) { ops.push(['w', i, v]); a[i] = v; }
    };
  }
  var SORTS = {
    'Bubble sort': function (R) { var a = R.a, n = a.length; for (var i = 0; i < n; i++) for (var j = 0; j < n - 1 - i; j++) if (R.cmp(j, j + 1) > 0) R.swap(j, j + 1); },
    'Insertion sort': function (R) { var a = R.a; for (var i = 1; i < a.length; i++) for (var j = i; j > 0 && R.cmp(j - 1, j) > 0; j--) R.swap(j - 1, j); },
    'Selection sort': function (R) { var a = R.a, n = a.length; for (var i = 0; i < n - 1; i++) { var m = i; for (var j = i + 1; j < n; j++) if (R.cmp(j, m) < 0) m = j; if (m !== i) R.swap(i, m); } },
    'Shell sort': function (R) { var a = R.a, n = a.length; for (var g = n >> 1; g > 0; g >>= 1) for (var i = g; i < n; i++) for (var j = i; j >= g && R.cmp(j - g, j) > 0; j -= g) R.swap(j - g, j); },
    'Quicksort': function (R) {
      (function qs(lo, hi) {
        if (lo >= hi) return;
        var p = lo;
        for (var i = lo; i < hi; i++) if (R.cmp(i, hi) < 0) { R.swap(i, p); p++; }
        R.swap(p, hi); qs(lo, p - 1); qs(p + 1, hi);
      })(0, R.a.length - 1);
    },
    'Merge sort': function (R) {
      var a = R.a;
      (function ms(lo, hi) {
        if (hi - lo < 1) return;
        var mid = (lo + hi) >> 1; ms(lo, mid); ms(mid + 1, hi);
        var tmp = [], i = lo, j = mid + 1;
        while (i <= mid && j <= hi) tmp.push(R.cmp(i, j) <= 0 ? a[i++] : a[j++]);
        while (i <= mid) tmp.push(a[i++]); while (j <= hi) tmp.push(a[j++]);
        for (var k = 0; k < tmp.length; k++) R.set(lo + k, tmp[k]);
      })(0, a.length - 1);
    },
    'Heapsort': function (R) {
      var n = R.a.length;
      function sift(i, m) { for (;;) { var l = 2 * i + 1, r = l + 1, b = i; if (l < m && R.cmp(l, b) > 0) b = l; if (r < m && R.cmp(r, b) > 0) b = r; if (b === i) return; R.swap(i, b); i = b; } }
      for (var i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
      for (var e = n - 1; e > 0; e--) { R.swap(0, e); sift(0, e); }
    }
  };
  var SORT_INFO = {
    'Bubble sort': ['O(n²)', 'analysed by Edward H. Friend (1956)'],
    'Insertion sort': ['O(n²)', 'described by John Mauchly (1946)'],
    'Selection sort': ['O(n²)', 'one of the oldest sorting methods'],
    'Shell sort': ['about O(n^1.5) with these gaps', 'Donald Shell (1959)'],
    'Quicksort': ['O(n log n) on average', 'Tony Hoare (1959)'],
    'Merge sort': ['O(n log n)', 'John von Neumann (1945)'],
    'Heapsort': ['O(n log n)', 'J. W. J. Williams (1964)']
  };
  function makeSort(name) {
    var start = bars(16), R = recorder(start); SORTS[name](R);
    var info = SORT_INFO[name];
    return { type: 'sort', title: name, info: info, arr: start.slice(), ops: R.ops, rate: Math.max(8, R.ops.length / 11), done: 0, hl: [] };
  }
  function makeBinary() {
    var a = bars(16).sort(function (x, y) { return x - y; }), target = a[ri(a.length)], lo = 0, hi = a.length - 1, steps = [];
    while (lo <= hi) { var mid = (lo + hi) >> 1; steps.push([lo, hi, mid]); if (a[mid] === target) break; if (a[mid] < target) lo = mid + 1; else hi = mid - 1; }
    return { type: 'bsearch', title: 'Binary search', info: ['O(log n)', 'described by John Mauchly (1946)'], arr: a, target: target, steps: steps, rate: 1.2 };
  }
  function makeGraph(kind) {
    // nine nodes jittered on a 3 × 3 grid; grid neighbours joined, a few left out but the graph stays connected
    var nodes = [], edges = [], k;
    for (k = 0; k < 9; k++) nodes.push({ x: (k % 3 + .5) / 3 + rnd(-.07, .07), y: (Math.floor(k / 3) + .5) / 3 + rnd(-.07, .07) });
    var cand = [];
    for (k = 0; k < 9; k++) { if (k % 3 < 2) cand.push([k, k + 1]); if (k < 6) cand.push([k, k + 3]); if (k % 3 < 2 && k < 6 && Math.random() < .35) cand.push([k, k + 4]); }
    cand.sort(function () { return Math.random() - .5; });
    var parent = [0, 1, 2, 3, 4, 5, 6, 7, 8]; function find(x) { while (parent[x] !== x) x = parent[x]; return x; }
    cand.forEach(function (e) { var a = find(e[0]), b = find(e[1]); if (a !== b) { parent[a] = b; edges.push(e); } else if (Math.random() < .5) edges.push(e); });
    edges.forEach(function (e) { e.w = Math.round(Math.hypot(nodes[e[0]].x - nodes[e[1]].x, nodes[e[0]].y - nodes[e[1]].y) * 9) + 1; });
    function adj(v) { var out = []; edges.forEach(function (e) { if (e[0] === v) out.push([e[1], e]); else if (e[1] === v) out.push([e[0], e]); }); return out; }
    var order = [], tree = [], dist = [], src = ri(9);
    if (kind === 'BFS') { var seen = [src], q = [src]; while (q.length) { var v = q.shift(); order.push(v); adj(v).forEach(function (n) { if (seen.indexOf(n[0]) < 0) { seen.push(n[0]); q.push(n[0]); tree.push(n[1]); } }); } }
    if (kind === 'DFS') { var vis = []; (function dfs(v) { vis.push(v); order.push(v); adj(v).forEach(function (n) { if (vis.indexOf(n[0]) < 0) { tree.push(n[1]); dfs(n[0]); } }); })(src); }
    if (kind === 'Dijkstra') {
      for (k = 0; k < 9; k++) dist.push(Infinity); dist[src] = 0; var via = [], done = [];
      for (var it = 0; it < 9; it++) {
        var u = -1; for (k = 0; k < 9; k++) if (done.indexOf(k) < 0 && (u < 0 || dist[k] < dist[u])) u = k;
        if (dist[u] === Infinity) break; done.push(u); order.push(u); if (via[u]) tree.push(via[u]);
        adj(u).forEach(function (n) { if (dist[u] + n[1].w < dist[n[0]]) { dist[n[0]] = dist[u] + n[1].w; via[n[0]] = n[1]; } });
      }
    }
    // in BFS and DFS, show each tree edge when the node it leads to is reached
    var reach = order.map(function (v, i) { if (kind === 'Dijkstra') return tree[i - 1]; return tree.filter(function (e) { return (e[0] === v || e[1] === v); }).filter(function (e) { var o = e[0] === v ? e[1] : e[0]; return order.indexOf(o) < i; })[0]; });
    var info = { BFS: ['Breadth-first search', 'O(V + E)', 'Konrad Zuse (1945), Edward F. Moore (1959)'],
                 DFS: ['Depth-first search', 'O(V + E)', 'Charles Pierre Trémaux (19th century)'],
                 Dijkstra: ["Dijkstra's shortest paths", 'O((V + E) log V) with a heap', 'Edsger W. Dijkstra (1956)'] }[kind];
    return { type: 'graph', kind: kind, title: info[0], info: [info[1], info[2]], nodes: nodes, edges: edges, order: order, reach: reach, dist: dist, src: src, rate: 1.3 };
  }
  function makeHanoi() {
    var moves = []; (function h(n, a, b, c) { if (!n) return; h(n - 1, a, c, b); moves.push([a, c]); h(n - 1, b, a, c); })(4, 0, 1, 2);
    return { type: 'hanoi', title: 'Tower of Hanoi', info: ['2ⁿ − 1 moves: O(2ⁿ)', 'Édouard Lucas (1883)'], moves: moves, rate: 1.6 };
  }
  var ALGOS = Object.keys(SORTS).map(function (n) { return function () { return makeSort(n); }; })
    .concat([makeBinary, function () { return makeGraph('BFS'); }, function () { return makeGraph('DFS'); }, function () { return makeGraph('Dijkstra'); }, makeHanoi]);

  function stepsOf(al) { return al.type === 'sort' ? al.ops.length : al.type === 'bsearch' ? al.steps.length : al.type === 'graph' ? al.order.length : al.moves.length; }
  function drawAlgo(it, g, a) {
    var al = it.al, x0 = g.x - g.bw / 2, y0 = g.y - g.bh / 2, n = Math.floor(Math.max(0, time - it.t0) * al.rate);
    if (reduce) n = stepsOf(al);
    ctx.strokeStyle = ctx.fillStyle = ink; ctx.lineWidth = 1;
    if (al.type === 'sort') {
      while (al.done < Math.min(n, al.ops.length)) { // apply the operations up to now
        var op = al.ops[al.done++];
        if (op[0] === 's') { var t = al.arr[op[1]]; al.arr[op[1]] = al.arr[op[2]]; al.arr[op[2]] = t; }
        if (op[0] === 'w') al.arr[op[1]] = op[2];
        al.hl = op[0] === 'w' ? [op[1]] : [op[1], op[2]];
      }
      if (al.done >= al.ops.length) al.hl = [];
      var bw = g.bw / al.arr.length;
      al.arr.forEach(function (v, i) {
        var h = v / 21 * g.bh, hot = al.hl.indexOf(i) >= 0;
        A(a * (hot ? 2.4 : 1)); ctx.fillRect(x0 + i * bw + 1, y0 + g.bh - h, bw - 2, h);
      });
    } else if (al.type === 'bsearch') {
      var st = al.steps[Math.min(al.steps.length - 1, n)], bw2 = g.bw / al.arr.length, found = n >= al.steps.length - 1;
      al.arr.forEach(function (v, i) {
        var h = v / 21 * g.bh, inside = i >= st[0] && i <= st[1], mid = i === st[2];
        A(a * (mid ? (found ? 3 : 2.4) : inside ? 1.1 : .35)); ctx.fillRect(x0 + i * bw2 + 1, y0 + g.bh - h, bw2 - 2, h);
      });
      A(a * 1.6); var ty = y0 + g.bh - al.target / 21 * g.bh; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x0 + g.bw, ty); ctx.stroke(); ctx.setLineDash([]);
    } else if (al.type === 'graph') {
      var reached = al.order.slice(0, Math.min(n + 1, al.order.length));
      function P(k) { return [x0 + al.nodes[k].x * g.bw, y0 + al.nodes[k].y * g.bh]; }
      al.edges.forEach(function (e) {
        var inTree = al.reach.slice(0, reached.length).indexOf(e) >= 0, p = P(e[0]), q = P(e[1]);
        A(a * (inTree ? 2.4 : .9)); ctx.lineWidth = inTree ? 2 : 1; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        if (al.kind === 'Dijkstra') { A(a * 1.6); ctx.font = '9px ' + FONT; ctx.textAlign = 'center'; ctx.fillText(String(e.w), (p[0] + q[0]) / 2 + 5, (p[1] + q[1]) / 2 - 3); }
      });
      ctx.lineWidth = 1;
      al.nodes.forEach(function (nd, k) {
        var p = P(k), i = reached.indexOf(k);
        A(a * (i >= 0 ? 2.6 : 1.2)); ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 6.283);
        if (i >= 0) ctx.fill(); else ctx.stroke();
        if (i >= 0) { A(a * 2.2); ctx.font = '10px ' + FONT; ctx.textAlign = 'left'; ctx.fillText(al.kind === 'Dijkstra' ? String(al.dist[k]) : String(i + 1), p[0] + 8, p[1] - 6); }
      });
    } else if (al.type === 'hanoi') {
      var pegs = [[4, 3, 2, 1], [], []];
      al.moves.slice(0, Math.min(n, al.moves.length)).forEach(function (m) { pegs[m[1]].push(pegs[m[0]].pop()); });
      A(a * 1.4);
      ctx.beginPath(); ctx.moveTo(x0, y0 + g.bh); ctx.lineTo(x0 + g.bw, y0 + g.bh); ctx.stroke();
      for (var pg = 0; pg < 3; pg++) {
        var px = x0 + g.bw * (pg + .5) / 3; ctx.beginPath(); ctx.moveTo(px, y0 + g.bh); ctx.lineTo(px, y0 + g.bh * .2); ctx.stroke();
        pegs[pg].forEach(function (d, i) { var dw = g.bw / 3 * (.3 + d * .16), dh = g.bh * .14; A(a * 1.8); ctx.fillRect(px - dw / 2, y0 + g.bh - (i + 1) * dh - 1, dw, dh - 2); });
      }
    }
    var fs = Math.max(12, Math.min(17, g.w * .04));
    caption([al.title, al.info[0], al.info[1]], g.x, y0 + g.bh + fs * 1.4, fs, a);
  }

  /* ---------------- logic circuits ---------------- */

  // gates: id, type, inputs (input names or gate ids), position in a unit box (x, y)
  var CIRCUITS = [
    { name: 'AND gate', expr: 'Q = A · B', ins: ['A', 'B'], gates: [{ id: 'Q', t: 'AND', i: ['A', 'B'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'OR gate', expr: 'Q = A + B', ins: ['A', 'B'], gates: [{ id: 'Q', t: 'OR', i: ['A', 'B'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'XOR gate', expr: 'Q = A ⊕ B', ins: ['A', 'B'], gates: [{ id: 'Q', t: 'XOR', i: ['A', 'B'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'NAND gate', expr: 'Q = ¬(A · B)', ins: ['A', 'B'], gates: [{ id: 'Q', t: 'NAND', i: ['A', 'B'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'NOR gate', expr: 'Q = ¬(A + B)', ins: ['A', 'B'], gates: [{ id: 'Q', t: 'NOR', i: ['A', 'B'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'NOT gate', expr: 'Q = ¬A', ins: ['A'], gates: [{ id: 'Q', t: 'NOT', i: ['A'], x: .45, y: .5 }], outs: ['Q'] },
    { name: 'Half adder', expr: 'S = A ⊕ B,  C = A · B', ins: ['A', 'B'],
      gates: [{ id: 'S', t: 'XOR', i: ['A', 'B'], x: .48, y: .28 }, { id: 'C', t: 'AND', i: ['A', 'B'], x: .48, y: .74 }], outs: ['S', 'C'] },
    { name: 'Full adder', expr: 'S = A ⊕ B ⊕ Cᵢ,  Cₒ = A·B + Cᵢ·(A ⊕ B)', ins: ['A', 'B', 'Cᵢ'],
      gates: [{ id: 'X', t: 'XOR', i: ['A', 'B'], x: .3, y: .2 }, { id: 'S', t: 'XOR', i: ['X', 'Cᵢ'], x: .58, y: .25 },
              { id: 'N1', t: 'AND', i: ['A', 'B'], x: .3, y: .62 }, { id: 'N2', t: 'AND', i: ['X', 'Cᵢ'], x: .58, y: .58 },
              { id: 'Cₒ', t: 'OR', i: ['N2', 'N1'], x: .8, y: .72 }], outs: ['S', 'Cₒ'] },
    { name: '2-to-1 multiplexer', expr: 'Q = A·¬S + B·S', ins: ['A', 'B', 'S'],
      gates: [{ id: 'nS', t: 'NOT', i: ['S'], x: .26, y: .84 }, { id: 'G1', t: 'AND', i: ['A', 'nS'], x: .52, y: .26 },
              { id: 'G2', t: 'AND', i: ['B', 'S'], x: .52, y: .62 }, { id: 'Q', t: 'OR', i: ['G1', 'G2'], x: .78, y: .45 }], outs: ['Q'] }
  ];
  var FN = { AND: function (v) { return v[0] & v[1]; }, OR: function (v) { return v[0] | v[1]; }, XOR: function (v) { return v[0] ^ v[1]; },
             NAND: function (v) { return 1 - (v[0] & v[1]); }, NOR: function (v) { return 1 - (v[0] | v[1]); }, NOT: function (v) { return 1 - v[0]; } };
  function evaluate(c, bits) {
    var val = {}; c.ins.forEach(function (n, i) { val[n] = bits[i]; });
    for (var pass = 0; pass < 4; pass++) c.gates.forEach(function (gt) { var v = gt.i.map(function (s) { return val[s] || 0; }); val[gt.id] = FN[gt.t](v); });
    return val;
  }
  function gateShape(t, x, y, w, h) { // body of a gate, inputs on the left, output on the right
    ctx.beginPath();
    if (t === 'NOT') { ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x + w / 2 - 5, y); ctx.lineTo(x - w / 2, y + h / 2); ctx.closePath(); ctx.stroke(); }
    else if (t === 'AND' || t === 'NAND') { ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x, y - h / 2); ctx.arc(x, y, h / 2, -Math.PI / 2, Math.PI / 2); ctx.lineTo(x - w / 2, y + h / 2); ctx.closePath(); ctx.stroke(); }
    else {
      ctx.moveTo(x - w / 2, y - h / 2); ctx.quadraticCurveTo(x + w * .1, y - h / 2, x + w / 2 - 5, y); ctx.quadraticCurveTo(x + w * .1, y + h / 2, x - w / 2, y + h / 2);
      ctx.quadraticCurveTo(x - w / 4, y, x - w / 2, y - h / 2); ctx.stroke();
      if (t === 'XOR') { ctx.beginPath(); ctx.moveTo(x - w / 2 - 5, y - h / 2); ctx.quadraticCurveTo(x - w / 4 - 5, y, x - w / 2 - 5, y + h / 2); ctx.stroke(); }
    }
    if (t === 'NOT' || t === 'NAND' || t === 'NOR') { ctx.beginPath(); ctx.arc(x + w / 2 - 2, y, 3, 0, 6.283); ctx.stroke(); }
  }
  function drawCircuit(it, g, a) {
    var c = it.c, rows = 1 << c.ins.length, row = reduce ? rows - 1 : Math.floor(Math.max(0, time - it.t0) / 1.4) % rows;
    var bits = c.ins.map(function (_, i) { return (row >> (c.ins.length - 1 - i)) & 1; }), val = evaluate(c, bits);
    var cw = g.bw * .62, x0 = g.x - g.bw / 2, y0 = g.y - g.bh / 2, gw = Math.max(24, cw * .22), gh = gw * .8;
    var pos = {}, outX = x0 + cw;
    c.ins.forEach(function (n, i) { pos[n] = [x0 + 10, y0 + g.bh * (i + .5) / c.ins.length]; });
    c.gates.forEach(function (gt) { pos[gt.id] = [x0 + gt.x * cw + gw / 2, y0 + gt.y * g.bh]; });
    ctx.strokeStyle = ctx.fillStyle = ink;
    function wire(p, q, on) { A(a * (on ? 2.6 : 1)); ctx.lineWidth = on ? 1.8 : 1; var mx = (p[0] + q[0]) / 2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(mx, p[1]); ctx.lineTo(mx, q[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    c.gates.forEach(function (gt) {
      var gx = x0 + gt.x * cw, gy = y0 + gt.y * g.bh, n = gt.i.length;
      gt.i.forEach(function (s, k) { var src = pos[s], py = n === 1 ? gy : gy + (k ? 1 : -1) * gh / 4; wire(src, [gx - gw / 2, py], val[s]); });
      A(a * 1.8); ctx.lineWidth = 1.2; gateShape(gt.t, gx, gy, gw, gh);
    });
    c.outs.forEach(function (o, k) {
      var p = pos[o], q = [outX, p[1]]; wire(p, q, val[o]);
      A(a * 2.4); ctx.font = '11px ' + FONT; ctx.textAlign = 'left'; ctx.fillText(o + ' = ' + val[o], outX + 4, p[1] + 4);
    });
    ctx.lineWidth = 1;
    c.ins.forEach(function (n) { var p = pos[n]; A(a * 2.4); ctx.font = '11px ' + FONT; ctx.textAlign = 'right'; ctx.fillText(n + ' = ' + val[n], p[0] - 3, p[1] + 4); });
    // truth table on the right, current row marked
    var cols = c.ins.concat(c.outs), tx = x0 + cw + g.bw * .14, rh = Math.min(13, g.bh / (rows + 1.5)), cwid = (g.bw - cw - g.bw * .14) / cols.length;
    ctx.font = 'italic 10px ' + FONT; ctx.textAlign = 'center'; A(a * 2);
    cols.forEach(function (n, i) { ctx.fillText(n, tx + cwid * (i + .5), y0 + rh); });
    for (var r = 0; r < rows; r++) {
      var b = c.ins.map(function (_, i) { return (r >> (c.ins.length - 1 - i)) & 1; }), v = evaluate(c, b), y = y0 + rh * (r + 2);
      A(a * (r === row ? 3 : 1.1)); ctx.font = (r === row ? 'bold ' : '') + '10px ' + FONT;
      cols.forEach(function (n, i) { ctx.fillText(String(i < c.ins.length ? b[i] : v[n]), tx + cwid * (i + .5), y); });
    }
    var fs = Math.max(12, Math.min(17, g.w * .04));
    caption([c.name, c.expr], g.x, y0 + g.bh + fs * 1.4, fs, a);
  }

  /* ---------------- small lessons in code ---------------- */

  var LESSONS = [
    ['bash', '# count the lines of every .txt file', 'wc -l *.txt'],
    ['bash', '# search a word in every file, with line numbers', 'grep -rn "TODO" .'],
    ['bash', '# loop over files', 'for f in *.jpg; do', '  echo "$f"', 'done'],
    ['bash', '# variables and command substitution', 'name="world"', 'echo "hello, $name"', 'today=$(date +%F)'],
    ['bash', '# pipes: the five biggest files', 'du -ah . | sort -rh | head -5'],
    ['bash', '# test whether a file exists', 'if [ -f notes.md ]; then', '  cat notes.md', 'fi'],
    ['bash', '# make a script executable and run it', 'chmod +x run.sh', './run.sh'],
    ['python', '# a list comprehension', 'squares = [n * n for n in range(10)]'],
    ['python', '# a function with a default argument', 'def greet(name="world"):', '    return f"hello, {name}"'],
    ['python', '# count words with a dictionary', 'counts = {}', 'for w in text.split():', '    counts[w] = counts.get(w, 0) + 1'],
    ['python', '# read a file, closed automatically', 'with open("data.txt") as f:', '    lines = f.readlines()'],
    ['python', '# a small class', 'class Point:', '    def __init__(self, x, y):', '        self.x, self.y = x, y'],
    ['python', '# handle an error', 'try:', '    n = int(s)', 'except ValueError:', '    n = 0'],
    ['go', '// hello, world', 'package main', 'import "fmt"', 'func main() {', '    fmt.Println("hello")', '}'],
    ['go', '// slices grow with append', 'nums := []int{1, 2}', 'nums = append(nums, 3)'],
    ['go', '// maps', 'ages := map[string]int{}', 'ages["ada"] = 36'],
    ['go', '// errors are ordinary values', 'f, err := os.Open("x.txt")', 'if err != nil {', '    return err', '}'],
    ['go', '// a goroutine and a channel', 'ch := make(chan int)', 'go func() { ch <- 42 }()', 'fmt.Println(<-ch)'],
    ['go', '// a struct and a method', 'type Point struct{ X, Y int }', 'func (p Point) Sum() int {', '    return p.X + p.Y', '}'],
    ['rust', '// variables are immutable by default', 'let x = 5;', 'let mut y = 6;', 'y += x;'],
    ['rust', '// match on an Option', 'match v.get(0) {', '    Some(n) => println!("{n}"),', '    None => println!("empty"),', '}'],
    ['rust', '// borrow a value instead of moving it', 'fn len(s: &String) -> usize {', '    s.len()', '}'],
    ['rust', '// a struct with a method', 'struct Point { x: i32, y: i32 }', 'impl Point {', '    fn sum(&self) -> i32 {', '        self.x + self.y', '    }', '}'],
    ['rust', '// iterators', 'let total: i32 = (1..=10).sum();'],
    ['rust', '// Result and the ? operator', 'let n: i32 = s.parse()?;']
  ];
  var CPS = 22;   // characters typed per second
  function drawLesson(it, g, a) {
    var L = it.l, lang = L[0], lines = L.slice(1), longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    var fs = Math.max(8, Math.min(13, g.w * .85 / (longest * .6))), lh = fs * 1.45, n = reduce ? 1e9 : Math.floor(Math.max(0, time - it.t0 - .6) * CPS);
    var w = longest * fs * .6, x0 = g.x - w / 2, y0 = g.y - lines.length * lh / 2;
    ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    A(Math.min(1, a * 1.8)); ctx.font = (fs * .8) + 'px ' + FONT; if ('letterSpacing' in ctx) ctx.letterSpacing = (fs * .1) + 'px';
    ctx.fillText(lang.toUpperCase(), x0, y0 - lh * .7); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    var left = n;
    lines.forEach(function (l, i) {
      if (left <= 0) return;
      var shown = l.slice(0, left); left -= l.length + 1;
      A(Math.min(1, a * (i ? 2.4 : 1.6))); ctx.font = (i === 0 ? 'italic ' : '') + fs + 'px ' + MONO; ctx.fillText(shown, x0, y0 + i * lh + lh * .5);
      if (left <= 0 && Math.floor(time * 2) % 2 === 0) { var cx = x0 + ctx.measureText(shown).width + 1; A(a * 2); ctx.fillRect(cx, y0 + i * lh + lh * .5 - fs * .8, fs * .55, fs); }   // cursor
    });
  }
  function lessonTime(L) { return L.slice(1).join(' ').length / CPS + .6; }

  /* ---------------- the three items, each on its own clock ---------------- */

  var FADE = 2, algo = null, circ = null, less = null;
  function newAlgo(t0) {
    var al, force = /[?&]cs-algo=(\d+)/.exec(location.search);   // test: a given algorithm
    if (force && !algo) al = ALGOS[+force[1] % ALGOS.length]();
    else do { al = ALGOS[ri(ALGOS.length)](); } while (algo && al.title === algo.al.title);
    var it = { al: al, t0: t0, life: stepsOf(al) / al.rate + 4 };
    return place(it, algo, function () { return [circ, less]; });
  }
  function newCirc(t0) {
    var c; do { c = CIRCUITS[ri(CIRCUITS.length)]; } while (circ && c === circ.c);
    var it = { c: c, t0: t0, life: Math.max(9, (1 << c.ins.length) * 1.4 * 1.5) };
    return place(it, circ, function () { return [algo, less]; });
  }
  function newLess(t0) {
    var l; do { l = LESSONS[ri(LESSONS.length)]; } while (less && l === less.l);
    var it = { l: l, t0: t0, life: lessonTime(l) + 6 };
    return place(it, less, function () { return [algo, circ]; });
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
    ctx.lineCap = ctx.lineJoin = 'round';
    if (!reduce) {
      if (time > algo.t0 + algo.life) algo = newAlgo(time + rnd(1, 3.5));
      if (time > circ.t0 + circ.life) circ = newCirc(time + rnd(1, 4));
      if (time > less.t0 + less.life) less = newLess(time + rnd(1, 4));
      retry(algo); retry(circ); retry(less);
    }
    var P = places(), k;
    function room(it) { return P[it.side].w >= 150; }   // too narrow a margin (a phone): nothing, rather than under the text
    if ((k = fade(algo)) > 0 && room(algo)) drawAlgo(algo, geo(algo, P), baseAlpha * k);
    if ((k = fade(circ)) > 0 && room(circ)) drawCircuit(circ, geo(circ, P), baseAlpha * k);
    if ((k = fade(less)) > 0 && room(less)) drawLesson(less, geo(less, P), baseAlpha * k);
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
    cv.id = 'cs-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize();
    var now = /[?&]cs-now/.test(location.search);   // test: show all three at once
    algo = newAlgo(-FADE); circ = newCirc(now ? -FADE : rnd(1, 3)); less = newLess(now ? -FADE - 2 : rnd(3, 6));
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
