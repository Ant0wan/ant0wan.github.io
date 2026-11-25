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
    { id: 'ch', label: 'Cheatsheets', href: 'cheatsheets.html', r: 6.5, p: 'cs' },
    { id: 'dv', label: 'Physics of Diving', href: 'diving.html', r: 7, p: 'ph' },
    { id: 'pp', label: 'pO₂ vs depth', href: 'ppo2.html', r: 6, p: 'dv' },
    { id: 'vo', label: 'Boyle volumes', href: 'volumes.html', r: 6, p: 'dv' },
    { id: 'ox', label: 'pO₂ isopleths', href: 'oxygen-chart.html', r: 6, p: 'dv' },
    { id: 'ms', label: 'Raup morphospace', href: 'morphospace.html', r: 7, p: 'bi' }
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

  // faint starfield
  var stars = [];
  for (var i = 0; i < 140; i++) stars.push([(Math.random() - .5) * 900, (Math.random() - .5) * 600, (Math.random() - .5) * 900]);


  // ---- icons (drawn centred on 0,0, half-size S) -----------------------
  function soft(rgb, fog, a) { return 'rgba(' + rgb + ',' + a * fog + ')'; }
  function circ(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); fill ? ctx.fill() : ctx.stroke(); }
  function poly(pts, close) { ctx.beginPath(); pts.forEach(function (p, i) { ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); if (close) ctx.closePath(); ctx.stroke(); }
  var icons = {
    home: function (S) { circ(0, 0, S * .45, true); },
    cs: function (S, t, rgb, fog) { // chip
      var r = S * .62; ctx.fillStyle = soft(rgb, fog, .18); ctx.fillRect(-r, -r, 2 * r, 2 * r); ctx.strokeRect(-r, -r, 2 * r, 2 * r);
      for (var i = -1; i <= 1; i++) { var p = i * r * .55;
        poly([[p, -r], [p, -S]]); poly([[p, r], [p, S]]); poly([[-r, p], [-S, p]]); poly([[r, p], [S, p]]); }
      ctx.strokeRect(-r * .4, -r * .4, r * .8, r * .8);
    },
    ch: function (S) { // terminal prompt
      ctx.strokeRect(-S, -.75 * S, 2 * S, 1.5 * S);
      poly([[-.6 * S, -.3 * S], [-.25 * S, 0], [-.6 * S, .3 * S]]); poly([[0, .3 * S], [.55 * S, .3 * S]]);
    },
    ph: function (S, t, rgb, fog) { // atom
      for (var k = 0; k < 3; k++) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, 0, S, S * .38, 0, 0, 6.283); ctx.stroke(); ctx.restore(); }
      circ(0, 0, S * .2, true);
      for (var e = 0; e < 3; e++) { var a = t * 2 + e * 2.1; ctx.save(); ctx.rotate(e * Math.PI / 3); circ(Math.cos(a) * S, Math.sin(a) * S * .38, S * .1, true); ctx.restore(); }
    },
    dv: function (S, t) { // rising bubbles
      var bs = [[-.35, .45, .32], [.3, 0, .24], [-.1, -.55, .17], [.4, -.7, .11]];
      bs.forEach(function (b, i) { var w = Math.sin(t * 2 + i) * .06; circ((b[0] + w) * S, b[1] * S, b[2] * S); circ((b[0] + w - b[2] * .3) * S, (b[1] - b[2] * .3) * S, b[2] * S * .15, true); });
    },
    pp: function (S, t, rgb, fog) { // O2 molecule
      ctx.fillStyle = soft(rgb, fog, .2); circ(-.45 * S, 0, .55 * S, true); circ(.45 * S, 0, .55 * S, true);
      circ(-.45 * S, 0, .55 * S); circ(.45 * S, 0, .55 * S);
      poly([[-.1 * S, -.12 * S], [.1 * S, -.12 * S]]); poly([[-.1 * S, .12 * S], [.1 * S, .12 * S]]);
    },
    vo: function (S, t) { // piston: gas volume compressing
      var py = -.1 * S + Math.sin(t * 1.5) * .3 * S;
      poly([[-.7 * S, -S], [-.7 * S, S], [.7 * S, S], [.7 * S, -S]]);
      poly([[-.7 * S, py], [.7 * S, py]]); poly([[0, py], [0, -S * 1.15]]); poly([[-.3 * S, -S * 1.15], [.3 * S, -S * 1.15]]);
      for (var i = 0; i < 4; i++) circ(Math.sin(t * 3 + i * 2) * .45 * S, py + (S - py) * (.25 + .18 * i), S * .06, true);
    },
    ox: function (S) { // contour lines
      for (var k = 1; k <= 3; k++) { var r = S * (1.05 - k * .27); ctx.beginPath();
        for (var i = 0; i <= 40; i++) { var a = i / 40 * 6.283, w = 1 + .22 * Math.sin(a * 3 + k) ; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * w * 1.1, Math.sin(a) * r * w * .85); }
        ctx.closePath(); ctx.stroke(); }
    },
    bi: function (S, t, rgb, fog) { // living cell
      ctx.fillStyle = soft(rgb, fog, .14); ctx.beginPath();
      for (var i = 0; i <= 48; i++) { var a = i / 48 * 6.283, r = S * (1 + .05 * Math.sin(a * 5 + t * 1.5)); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r * .88); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = soft(rgb, fog, .45); circ(-.15 * S, -.05 * S, .36 * S, true); ctx.fillStyle = 'rgba(' + rgb + ',' + fog + ')';
      circ(-.15 * S, -.05 * S, .36 * S); circ(-.1 * S, -.1 * S, .1 * S, true);
      circ(.5 * S, -.35 * S, .1 * S, true); circ(.45 * S, .4 * S, .12 * S); circ(-.6 * S, .4 * S, .08 * S, true);
      ctx.beginPath(); ctx.ellipse(.45 * S, .05 * S, .2 * S, .08 * S, .6, 0, 6.283); ctx.stroke();
    },
    ms: function (S) { // shell: logarithmic spiral in a coiled outline
      ctx.beginPath(); ctx.fillStyle = soft(arguments[2], arguments[3], .16);
      ctx.moveTo(-S, S * .6); ctx.quadraticCurveTo(-S * .9, -S * .9, S * .3, -S * .85); ctx.quadraticCurveTo(S * 1.05, -S * .5, S * .85, S * .35); ctx.quadraticCurveTo(S * .5, S * .8, -S, S * .6);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      for (var i = 0; i <= 90; i++) { var a = i / 90 * 4 * Math.PI, r = S * .08 * Math.exp(.19 * a); ctx[i ? 'lineTo' : 'moveTo'](.1 * S + Math.cos(a) * r, -.05 * S + Math.sin(a) * r * .9); }
      ctx.stroke();
    }
  };

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
    var C = col(), t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // background
    
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
      var S = R * 2;
      ctx.save(); ctx.translate(q.x, q.y);
      ctx.lineWidth = Math.max(1.2, S * .07); ctx.lineCap = ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(' + rgb + ',' + fog + ')'; ctx.fillStyle = 'rgba(' + rgb + ',' + fog + ')';
      icons[n.id](S, t, rgb, fog);
      ctx.restore();
      // label
      ctx.font = (hot ? '600 ' : '') + Math.round(11 + 3 * Math.min(q.s, 1.4)) + 'px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      ctx.textAlign = 'center'; ctx.fillStyle = hot ? 'rgb(' + C.hot + ')' : C.ink;
      ctx.globalAlpha = hot ? 1 : Math.max(.5, fog);
      var lab = n.label.toUpperCase(), hw = ctx.measureText(lab).width / 2 + 8;
      ctx.fillText(lab, Math.max(hw, Math.min(W - hw, q.x)), q.y - R * 2.2 - 6);
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
      var d = Math.hypot(n.q.x - mx, n.q.y - my), lim = Math.max(20, n.r * n.q.s * 2.6);
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
