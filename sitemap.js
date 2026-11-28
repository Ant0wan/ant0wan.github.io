/* 3D site map for the home page: canvas, no dependencies.
   Drag to rotate, hover to highlight, click a node to open the page. */
(function () {
  var cv = document.getElementById('sitemap');
  if (!cv) return;
  var ctx = cv.getContext('2d');

  // ---- graph ----------------------------------------------------------
  var N = [
    { id: 'ex', label: 'Explore', href: 'explore.html', r: 8 },
    { id: 'dv', label: 'Diving', href: 'diving.html', r: 7, p: 'ex' },
    { id: 'cv', label: 'Caving', href: 'caving.html', r: 7, p: 'ex' },
    { id: 'un', label: 'Understand', href: 'understand.html', r: 8 },
    { id: 'mt', label: 'Mathematics', href: 'mathematics.html', r: 7, p: 'un' },
    // { id: 'py', label: 'Physics', href: 'physics.html', r: 7, p: 'un' },   // hidden for now
    { id: 'cm', label: 'Chemistry', href: 'chemistry.html', r: 7, p: 'un' },
    { id: 'bi', label: 'Biology', href: 'biology.html', r: 7, p: 'un' },
    { id: 'ge', label: 'Geology', href: 'geology.html', r: 7, p: 'un' },
    { id: 'pa', label: 'Paleontology', href: 'paleontology.html', r: 7, p: 'un' },
    { id: 'cs', label: 'Computer Science', href: 'computer-science.html', r: 7, p: 'un' },
    { id: 'ph', label: 'Physics of Diving', href: 'diving-physics.html', r: 7, p: 'dv' },
    { id: 'pp', label: 'pO₂ vs depth', href: 'ppo2.html', r: 6, p: 'ph' },
    { id: 'vo', label: 'Boyle volumes', href: 'volumes.html', r: 6, p: 'ph' },
    { id: 'ox', label: 'pO₂ isopleths', href: 'oxygen-chart.html', r: 6, p: 'ph' },
    { id: 'pd', label: 'GUE', href: 'plan-a-dive.html', r: 7, p: 'dv' },
    { id: 'sg', label: 'Standard gases', href: 'standard-gases.html', r: 6.5, p: 'pd' },
    { id: 'gc', label: 'Gas cost', href: 'gas-cost.html', r: 6.5, p: 'pd' },
    { id: 'cc', label: 'Course cost', href: 'course-cost.html', r: 6.5, p: 'pd' },
    { id: 'pt', label: 'Periodic table', href: 'periodic-table.html', r: 7, p: 'cm' },
    { id: 'cp', label: 'Ions & molecules', href: 'compounds.html', r: 7, p: 'cm' },
    { id: 'mn', label: 'Minerals', href: 'minerals.html', r: 7, p: 'ge' },
    { id: 'sf', label: 'Significant figures', href: 'sigfigs.html', r: 7, p: 'mt' },
    { id: 'ms', label: 'Raup morphospace', href: 'morphospace.html', r: 7, p: 'pa' },
    { id: 'ch', label: 'Cheatsheets', href: 'cheatsheets.html', r: 6.5, p: 'cs' },
    { id: 'lt', label: 'Literature', href: 'literature.html', r: 7, p: 'un' },
    { id: 'bk', label: 'Books', href: 'books.html', r: 6.5, p: 'lt' }
  ];
  var by = {}; N.forEach(function (n) { by[n.id] = n; });
  var pos = {
    mt: [175, 115, -25],
    ex: [20, 60, 120], cv: [-60, 120, 150], un: [0, -30, -60], dv: [75, 0, 130], py: [-40, -150, -120], cm: [150, -115, -45], bi: [100, 35, -150],
    ge: [-175, 95, 95], pa: [-80, 30, -150], cs: [-170, -20, 10],
    ph: [150, 40, 250], pp: [60, 130, 340], vo: [230, 120, 360], ox: [250, -30, 330],
    pd: [-20, -85, 240], gc: [-125, -125, 300], cc: [-95, -15, 345], sg: [60, -150, 300], pf: [20, -195, 320],
    pt: [235, -175, -175],
    cp: [110, -230, -110],
    ms: [-105, -45, -235],
    sf: [275, 175, -75],
    mn: [-270, 160, 175],
    ch: [-275, -40, 90],
    ab: [-235, -150, 30],
    lt: [215, -185, 40], bk: [285, -225, 20]
  };
  // centre the cloud on the origin
  var c = [0, 0, 0]; N.forEach(function (n) { n.x = pos[n.id][0]; n.y = pos[n.id][1]; n.z = pos[n.id][2]; c[0] += n.x; c[1] += n.y; c[2] += n.z; });
  N.forEach(function (n) { n.x -= c[0] / N.length; n.y -= c[1] / N.length; n.z -= c[2] / N.length; });
  var edges = N.filter(function (n) { return n.p; }).map(function (n) { return [by[n.p], n]; });
  edges.push([by.ex, by.un]);   // the two parts, joined directly
  // branches for the running light: the path from Explore or Understand to a page with no sub-pages
  var leaves = N.filter(function (n) { return !N.some(function (m) { return m.p === n.id; }); });
  function branch() {
    var n = leaves[Math.floor(Math.random() * leaves.length)], path = [n];
    while (n.p) { n = by[n.p]; path.unshift(n); }
    return path;
  }
  var lights = [], nextLight = .6, LIGHT_SPEED = 1.1, LIGHT_LEN = .55; // edges per second, streak length in edges

  // ---- state ----------------------------------------------------------
  var W = 0, H = 0, dpr = 1;
  var yaw = -0.5, pitch = 0.35, vyaw = 0.003, zoom = .72;
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
      ? { line: '232,230,221', node: '232,230,221', hot: '255,196,90', ink: '#e8e6dd' }
      : { line: '26,26,26', node: '26,26,26', hot: '200,90,10', ink: '#1a1a1a' };
  }

  function draw(now) {
    var C = col(), t = Math.max(0, (now - t0) / 1000); // the first frame's timestamp can precede t0
    ctx.clearRect(0, 0, W, H);

    // project nodes
    N.forEach(function (n) { n.q = project(n.x, n.y, n.z); });

    // edges
    edges.forEach(function (e) {
      var a = e[0].q, b = e[1].q, hot = hover && (hover === e[0] || hover === e[1]);
      var fog = Math.max(.25, Math.min(1, 1 - (a.z + b.z) / 2 / 900));
      ctx.strokeStyle = 'rgba(' + (hot ? C.hot : C.line) + ',' + (hot ? .95 : .55 * fog) + ')';
      ctx.lineWidth = hot ? 2 : 1.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    // light running from Explore or Understand out along one branch to its tip
    if (!reduce && !lights.length && t >= nextLight) { // one light at a time, a short pause after it reaches the tip
      var path = branch(); lights.push({ path: path, t0: t }); nextLight = t + (path.length - 1 + LIGHT_LEN) / LIGHT_SPEED + .4 + Math.random() * .8;
    }
    lights = lights.filter(function (L) { return (t - L.t0) * LIGHT_SPEED < L.path.length - 1 + LIGHT_LEN; });
    ctx.save(); ctx.lineCap = 'round';
    lights.forEach(function (L) {
      var head = (t - L.t0) * LIGHT_SPEED, tail = head - LIGHT_LEN;
      for (var k = 0; k < L.path.length - 1; k++) {
        var s0 = Math.max(tail, k), s1 = Math.min(head, k + 1);
        if (s1 <= s0) continue;
        var a = L.path[k].q, b = L.path[k + 1].q;
        var p0 = [a.x + (b.x - a.x) * (s0 - k), a.y + (b.y - a.y) * (s0 - k)], p1 = [a.x + (b.x - a.x) * (s1 - k), a.y + (b.y - a.y) * (s1 - k)];
        var fog = Math.max(.3, Math.min(1, 1 - (a.z + b.z) / 2 / 900));
        var g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);   // dim at the tail, bright at the head
        g.addColorStop(0, 'rgba(' + C.line + ',' + (.45 * fog * (s0 - tail) / LIGHT_LEN) + ')');
        g.addColorStop(1, 'rgba(' + C.line + ',' + (.45 * fog * (s1 - tail) / LIGHT_LEN) + ')');
        ctx.strokeStyle = g; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      }
    });
    ctx.restore();

    // nodes, far to near
    var order = N.slice().sort(function (p, q) { return q.q.z - p.q.z; });
    order.forEach(function (n) {
      var q = n.q, hot = hover === n, fog = Math.max(.35, Math.min(1, 1 - q.z / 1000));
      var R = n.r * 0.3 * q.s * (hot ? 1.35 : 1), rgb = hot ? C.hot : C.node;
      ctx.fillStyle = 'rgba(' + rgb + ',' + fog + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.5, R * .9), 0, 6.283); ctx.fill();
      // label
      ctx.font = (hot ? '600 ' : '') + Math.round(11 + 3 * Math.min(q.s, 1.4)) + 'px ' + getComputedStyle(document.body).getPropertyValue('--font');
      ctx.textAlign = 'center'; ctx.fillStyle = hot ? 'rgb(' + C.hot + ')' : C.ink;
      ctx.globalAlpha = hot ? 1 : Math.max(.5, fog);
      var lab = n.label, hw = ctx.measureText(lab).width / 2 + 8;
      ctx.fillText(lab, Math.max(hw, Math.min(W - hw, q.x)), q.y - R * 2.2 - 6);
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.font = '11px ' + getComputedStyle(document.body).getPropertyValue('--font');
    ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(' + C.node + ',.75)';
    ctx.fillText('Site map  ' + N.length + ' nodes  yaw ' + ((yaw * 57.3) % 360).toFixed(0).padStart(4, ' ') + '°', 12, H - 12);
    ctx.textAlign = 'right';
    ctx.fillText(hover ? '▶ ' + hover.href : 'Drag · scroll · click', W - 12, H - 12);
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
      var d = Math.hypot(n.q.x - mx, n.q.y - my), lim = Math.max(20, n.r * 0.3 * n.q.s * 2.6);
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
    if (wasClick) { var n = pick(e); if (n) location.href = window.themeUrl ? window.themeUrl(n.href) : n.href; }
  });
  cv.addEventListener('pointerleave', function () { hover = null; });
  cv.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.shiftKey) return; // keep normal page scrolling
    e.preventDefault(); zoom = Math.max(.45, Math.min(2, zoom * (e.deltaY < 0 ? 1.08 : .92)));
  }, { passive: false });
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);

  resize(); requestAnimationFrame(frame);
})();
