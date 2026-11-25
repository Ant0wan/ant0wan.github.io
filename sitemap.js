/* 3D site map for the home page: canvas, no dependencies.
   Drag to rotate, hover to highlight, click a node to open the page. */
(function () {
  var cv = document.getElementById('sitemap');
  if (!cv) return;
  var ctx = cv.getContext('2d');

  // ---- graph ----------------------------------------------------------
  var N = [
    { id: 'home', label: 'Home', href: 'index.html', r: 9 },
    { id: 'cs', label: 'Computer Science', href: 'computer-science.html', r: 7, p: 'home' },
    { id: 'ph', label: 'Physics', href: 'physics.html', r: 7, p: 'home' },
    { id: 'bi', label: 'Biology', href: 'biology.html', r: 7, p: 'home' },
    { id: 'ch', label: 'Cheatsheets', href: 'cheatsheets.html', r: 5, p: 'cs' },
    { id: 'dv', label: 'Physics of Diving', href: 'diving.html', r: 5.5, p: 'ph' },
    { id: 'pp', label: 'pO₂ vs depth', href: 'ppo2.html', r: 4, p: 'dv' },
    { id: 'vo', label: 'Boyle volumes', href: 'volumes.html', r: 4, p: 'dv' },
    { id: 'ox', label: 'pO₂ isopleths', href: 'oxygen-chart.html', r: 4, p: 'dv' },
    { id: 'ms', label: 'Raup morphospace', href: 'morphospace.html', r: 5, p: 'bi' }
  ];
  var by = {}; N.forEach(function (n) { by[n.id] = n; });
  var pos = {
    home: [0, 0, 0],
    cs: [-150, 0, 0], ph: [75, 0, 130], bi: [75, 0, -130],
    ch: [-250, -70, 20],
    dv: [150, 40, 250],
    pp: [60, 130, 340], vo: [230, 120, 360], ox: [250, -30, 330],
    ms: [160, -60, -250]
  };
  // centre the cloud on the origin
  var c = [0, 0, 0]; N.forEach(function (n) { n.x = pos[n.id][0]; n.y = pos[n.id][1]; n.z = pos[n.id][2]; c[0] += n.x; c[1] += n.y; c[2] += n.z; });
  N.forEach(function (n) { n.x -= c[0] / N.length; n.y -= c[1] / N.length; n.z -= c[2] / N.length; });
  var edges = N.filter(function (n) { return n.p; }).map(function (n) { return [by[n.p], n]; });

  // starfield / floor grid points
  var stars = [];
  for (var i = 0; i < 140; i++) stars.push([(Math.random() - .5) * 900, (Math.random() - .5) * 600, (Math.random() - .5) * 900]);

  // ---- state ----------------------------------------------------------
  var W = 0, H = 0, dpr = 1;
  var yaw = -0.5, pitch = 0.35, vyaw = 0.003, zoom = 1;
  var drag = null, moved = 0, hover = null, t0 = performance.now(), visible = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) vyaw = 0;

  function resize() {
    var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(x, y, z) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    var y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    var d = 700, s = d / (d + z2) * zoom * Math.min(W / 640, 1.3);
    return { x: W / 2 + x1 * s, y: H / 2 + y1 * s, s: s, z: z2 };
  }

  function col() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return dark
      ? { line: '110,231,255', node: '110,231,255', hot: '255,196,90', ink: '#e8f6ff', halo: 'rgba(110,231,255,', bg: 'rgba(8,14,20,', grid: '110,231,255', gA: .22 }
      : { line: '20,110,170', node: '20,110,170', hot: '200,90,10', ink: '#0d2a40', halo: 'rgba(20,110,170,', bg: 'rgba(240,247,252,', grid: '20,110,170', gA: .2 };
  }

  function draw(now) {
    var C = col(), t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // background
    var g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * .7);
    g.addColorStop(0, C.bg + '0.0)'); g.addColorStop(1, C.bg + '0.9)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // floor grid
    ctx.lineWidth = 1;
    var gy = 150, step = 100, ext = 500;
    for (var k = -ext; k <= ext; k += step) {
      [[k, -ext, k, ext], [-ext, k, ext, k]].forEach(function (l) {
        var a = project(l[0], gy, l[1]), b = project(l[2], gy, l[3]);
        ctx.strokeStyle = 'rgba(' + C.grid + ',' + C.gA * .6 + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
    }
    // stars
    stars.forEach(function (s) {
      var p = project(s[0], s[1], s[2]), a = Math.max(0, Math.min(1, .5 - p.z / 1400));
      ctx.fillStyle = 'rgba(' + C.node + ',' + a * .5 + ')';
      ctx.fillRect(p.x, p.y, 1.4, 1.4);
    });

    // project nodes
    N.forEach(function (n) { n.q = project(n.x, n.y, n.z); });

    // edges with travelling pulses
    edges.forEach(function (e, i) {
      var a = e[0].q, b = e[1].q, hot = hover && (hover === e[0] || hover === e[1]);
      var fog = Math.max(.25, Math.min(1, 1 - (a.z + b.z) / 2 / 900));
      ctx.strokeStyle = 'rgba(' + (hot ? C.hot : C.line) + ',' + (hot ? .95 : .55 * fog) + ')';
      ctx.lineWidth = hot ? 2 : 1.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      var u = ((t * .35 + i * .21) % 1);
      ctx.fillStyle = 'rgba(' + (hot ? C.hot : C.node) + ',' + .9 * fog + ')';
      ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, 1.8, 0, 6.283); ctx.fill();
    });

    // nodes, far to near
    var order = N.slice().sort(function (p, q) { return q.q.z - p.q.z; });
    order.forEach(function (n) {
      var q = n.q, hot = hover === n, fog = Math.max(.35, Math.min(1, 1 - q.z / 1000));
      var R = n.r * q.s * (hot ? 1.35 : 1), rgb = hot ? C.hot : C.node;
      var pulse = 1 + .12 * Math.sin(t * 2 + n.x);
      // halo
      var h = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, R * 3.2 * pulse);
      h.addColorStop(0, 'rgba(' + rgb + ',' + (hot ? .55 : .3) * fog + ')'); h.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.fillStyle = h; ctx.beginPath(); ctx.arc(q.x, q.y, R * 3.2 * pulse, 0, 6.283); ctx.fill();
      // wireframe diamond (octahedron silhouette) + core
      ctx.strokeStyle = 'rgba(' + rgb + ',' + fog + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      var rot = t * .6 + n.z * .01, m = 5;
      for (var i = 0; i <= m; i++) { var an = rot + i / m * 6.283, rr = R * 1.5; ctx[i ? 'lineTo' : 'moveTo'](q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr * .6); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(' + rgb + ',' + fog + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, R * .7, 0, 6.283); ctx.fill();
      // label
      ctx.font = (hot ? '600 ' : '') + Math.round(11 + 3 * Math.min(q.s, 1.4)) + 'px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      ctx.textAlign = 'center'; ctx.fillStyle = hot ? 'rgb(' + C.hot + ')' : C.ink;
      ctx.globalAlpha = hot ? 1 : Math.max(.5, fog);
      ctx.fillText(n.label.toUpperCase(), q.x, q.y - R * 2.1 - 4);
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.font = '11px ' + getComputedStyle(document.body).getPropertyValue('--mono');
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(' + C.node + ',.75)';
    ctx.fillText('SITE//MAP  ' + N.length + ' NODES  YAW ' + ((yaw * 57.3) % 360).toFixed(0).padStart(4, ' ') + '°', 12, H - 12);
    ctx.textAlign = 'right';
    ctx.fillText(hover ? '▶ ' + hover.href : 'DRAG · SCROLL · CLICK', W - 12, H - 12);
  }

  function frame(now) {
    if (visible) {
      if (!drag) { yaw += vyaw * (hover ? .15 : 1); }
      draw(now);
    }
    requestAnimationFrame(frame);
  }

  // ---- interaction ----------------------------------------------------
  function pick(e) {
    var r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = null, bd = 1e9;
    N.forEach(function (n) {
      if (!n.q) return;
      var d = Math.hypot(n.q.x - mx, n.q.y - my), lim = Math.max(18, n.r * n.q.s * 2.2);
      if (d < lim && d < bd) { bd = d; best = n; }
    });
    return best;
  }
  cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) {
    if (drag) {
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
      yaw += dx * .008; pitch = Math.max(-1.2, Math.min(1.2, pitch + dy * .006)); vyaw = dx ? Math.sign(dx) * .003 : vyaw;
      drag.x = e.clientX; drag.y = e.clientY;
    } else { hover = pick(e); cv.style.cursor = hover ? 'pointer' : 'grab'; }
  });
  cv.addEventListener('pointerup', function (e) {
    var wasClick = moved < 6; drag = null;
    if (wasClick) { var n = pick(e); if (n) location.href = n.href; }
  });
  cv.addEventListener('pointerleave', function () { hover = null; });
  cv.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.shiftKey) return; // keep normal page scrolling
    e.preventDefault(); zoom = Math.max(.6, Math.min(2, zoom * (e.deltaY < 0 ? 1.08 : .92)));
  }, { passive: false });
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);

  resize(); requestAnimationFrame(frame);
})();
