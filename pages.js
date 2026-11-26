/* Faint background for the Books page: an open book lies at the bottom left,
   and an irregular wind blows its pages off, one by one, away to the right.
   - The book is drawn in 3D through the same kind of perspective camera as the
     fish background: page blocks arching up from the gutter, the stacked page
     edges along the front, a hardcover under them, faint text on the open pages.
   - The wind is irregular: gusts arrive at random, each with its own rise,
     length and strength, now and then a strong burst, over a breeze that never
     stops, so there are always pages leaving the book. In a gust the air is turbulent: a drifting field of
     eddies (the curl of a stream function) loops and swirls, and short-lived
     whirlwinds spin up, often right at the book, drawing pages in and lifting
     them in rising spirals before they drift off with the wind and fade. A gust travels across the screen, so it
     reaches the book before the pages already flying further right.
   - In a gust, pages on the left riffle over the spine onto the right, and pages
     on the right lift from the spine, flutter and bend; if the gust holds they
     tear free and fly off with the wind, up and away to the right; in the air
     they move like leaves, gliding banked and rocking side to side, curling and
     showing their lines of text; if the gust dies first they fall back.
   - Loose pages never sink lower on screen than the top of the book (they skim
     along that height) and are gone once they leave the screen.
   - Nothing is in the air when the page opens: the first gust comes a moment later.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?pages=debug to see it clearly. */
(function () {
  if (window.__bookPages) return;
  window.__bookPages = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]pages=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, F = 1000, ZD = 1200, P0 = 100;
  var book = null, loose = [], lifting = [], time = 0, vortices = [], lastRelease = 0, floorSy = 0;
  var ph = [Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3, Math.random() * 6.3];
  var gusts = [], nextGust = 0, calm = false;
  var ink = '#1a1a1a', baseAlpha = 0.1;
  var C = 360; // speed at which a gust front crosses the screen, px/s

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function scaleAt(z) { return F / (F + z); }
  function proj(X, Y, Z) { var k = scaleAt(Z); return [W / 2 + (X - W / 2) * k, H / 2 + (Y - H / 2) * k]; }
  function unproject(sx, sy, z) { var k = scaleAt(z); return [W / 2 + (sx - W / 2) / k, H / 2 + (sy - H / 2) / k, z]; }

  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 0.7 : dark ? 0.085 : 0.1;
  }

  /* ---------------- wind ---------------- */

  function scheduleGust() {
    // after a calm, a gust; gusts come in bursts of one to a few, then another calm
    var strong = Math.random() < 0.25;
    gusts.push({ t0: time + (calm ? rand(3, 10) : rand(0.3, 2.5)), rise: rand(0.2, 1.5), hold: rand(0.5, 4), fall: rand(0.8, 3),
                 peak: strong ? rand(1.1, 1.6) : rand(0.4, 1) });
    calm = Math.random() < 0.4; // after this gust, a quieter spell with only the breeze
    nextGust = gusts[gusts.length - 1].t0 + 0.5;
    gusts = gusts.filter(function (g) { return g.t0 + g.rise + g.hold + g.fall + 30 > time; });
  }
  // gust strength at time t (each gust: smooth rise, hold, smooth fall)
  function gustAt(t) {
    var s = 0.36 + 0.1 * Math.sin(t * 0.13) + 0.06 * Math.sin(t * 0.41 + 1); // the breeze never stops
    for (var i = 0; i < gusts.length; i++) {
      var g = gusts[i], u = t - g.t0, e = 0;
      if (u <= 0) continue;
      if (u < g.rise) e = 0.5 - 0.5 * Math.cos(Math.PI * u / g.rise);
      else if (u < g.rise + g.hold) e = 1;
      else if (u < g.rise + g.hold + g.fall) e = 0.5 + 0.5 * Math.cos(Math.PI * (u - g.rise - g.hold) / g.fall);
      s += g.peak * e;
    }
    return 1.7 * Math.tanh(s / 1.7); // overlapping gusts saturate rather than add up
  }
  // the gust as felt at screen x: fronts move left to right, with turbulence on top
  function gustHere(x, y) {
    var g = gustAt(time - Math.max(0, x) / C);
    return g * (1 + 0.2 * Math.sin(time * 2.3 + x * 0.01) + 0.12 * Math.sin(time * 5.1 + y * 0.02));
  }
  // swirling turbulence: the curl of a drifting stream function, so the air loops and eddies
  // instead of pushing in straight lines (and never piles up or empties anywhere)
  function eddies(x, y, t) {
    var a1 = 0.006, b1 = 0.005, a2 = 0.013, b2 = 0.011;
    var s1 = a1 * x + 0.7 * t + ph[0], c1 = b1 * y - 0.45 * t + ph[1];
    var s2 = a2 * x - 1.1 * t + ph[2], c2 = b2 * y + 0.9 * t + ph[3];
    // psi = A1 sin(s1) cos(c1) + A2 sin(s2) sin(c2);  u = dpsi/dy, v = -dpsi/dx  (peak speeds ~230 and ~120 px/s)
    var A1 = 230 / b1, A2 = 120 / b2;
    var u = -A1 * b1 * Math.sin(s1) * Math.sin(c1) + A2 * b2 * Math.sin(s2) * Math.cos(c2);
    var v = -(A1 * a1 * Math.cos(s1) * Math.cos(c1) + A2 * a2 * Math.cos(s2) * Math.sin(c2));
    return [u, v];
  }
  function wind(x, y, z) {
    var k = scaleAt(z), sx = W / 2 + (x - W / 2) * k, sy = H / 2 + (y - H / 2) * k, g = gustHere(sx, sy);
    var e = eddies(sx, sy, time), m = Math.min(2, g * 1.6);
    // the gusts carry everything right and a little up; the eddies throw the pages about
    // the general drift is always to the right: the eddies swirl it, but sideways only gently
    var ux = 90 + 210 * g + 0.55 * e[0] * m, uy = -60 * g + e[1] * m, uz = 40 * Math.sin(x * 0.004 + y * 0.003 - time * 0.4) * m;
    // whirlwinds: each spins the air around its core and lifts it there, a rising spiral
    for (var i = 0; i < vortices.length; i++) {
      var V = vortices[i], dx = x - V.x, dy = y - V.y, dz = (z - V.z) / (2 * V.R), r = Math.hypot(dx, dy) || 1;
      var env = Math.sin(Math.PI * V.age / V.life) * Math.exp(-dz * dz);
      if (env <= 0) continue;
      var vt = V.G * (r < V.R ? r / V.R : V.R / r) * env;       // Rankine vortex: solid-body core, decaying outside
      var pull = 0.25 * Math.abs(V.G) * Math.exp(-(r * r) / (4 * V.R * V.R)) * env; // drawn in towards the core
      var lift = V.up * Math.exp(-(r * r) / (1.5 * V.R * V.R)) * env;               // and lifted in it
      ux += -dy / r * vt - dx / r * pull;
      uy += dx / r * vt - dy / r * pull - lift;
    }
    return [ux, uy, uz, g];
  }
  function spawnVortex(atBook, g) {
    var b = book, x, y, z;
    if (atBook) { x = b.bx + rand(-1, 1.5) * b.Wp; y = b.Yb - rand(0.5, 3) * b.Wp; z = (b.z0 + b.z1) / 2 + rand(-40, 40); }
    else { var q = unproject(rand(0.05, 0.75) * W, rand(0.2, 0.95) * H, rand(0, 0.7) * ZD); x = q[0]; y = q[1]; z = q[2]; }
    vortices.push({ x: x, y: y, z: z, R: rand(50, 160), G: (Math.random() < 0.5 ? -1 : 1) * rand(220, 450) * (0.6 + g),
                    up: rand(100, 220) * (0.6 + g), age: 0, life: rand(4, 9) });
  }

  /* ---------------- the book ---------------- */

  function buildBook() {
    var Wp = P0, Hp = P0 * 1.42, thick = P0 * 0.11, cover = P0 * 0.025;
    var z0 = 15, z1 = z0 + Hp;
    var Yb = unproject(0, H - Math.max(18, H * 0.035), z0)[1];      // the cover rests near the bottom of the screen
    var bx = unproject(Math.max(16, W * 0.03) + Wp * 1.08, 0, (z0 + z1) / 2)[0]; // spine, so the book sits at the left
    book = { Wp: Wp, Hp: Hp, thick: thick, cover: cover, z0: z0, z1: z1, Yb: Yb, bx: bx,
             left: layout(), right: layout() };
    var top = H;
    for (var f = 0; f <= 1; f += 0.05) top = Math.min(top, blockPt(-1, f, z0)[1], blockPt(1, f, z0)[1], blockPt(-1, f, z1)[1]);
    floorSy = top;
  }
  // height of an open page block above the floor at fraction f across it (0 at its outer edge, 1 at the spine)
  function blockH(f) { var b = book; return b.cover + b.thick * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, f * 1.15))) + b.Wp * 0.06 * Math.pow(Math.sin(Math.PI * f), 0.8) * (1 - 0.5 * f); }
  function blockPt(side, f, z) { // side -1 left, +1 right
    var b = book; return proj(b.bx + side * (1 - f) * b.Wp, b.Yb - blockH(f), z);
  }

  function drawBook(a) {
    var b = book, i, j, f, p, q, n = 14, m = b.Wp * 0.06;
    // hardcover
    var c = [proj(b.bx - b.Wp - m, b.Yb, b.z0 - m), proj(b.bx + b.Wp + m, b.Yb, b.z0 - m), proj(b.bx + b.Wp + m, b.Yb, b.z1 + m), proj(b.bx - b.Wp - m, b.Yb, b.z1 + m)];
    var cb = [proj(b.bx - b.Wp - m, b.Yb - b.cover, b.z0 - m), proj(b.bx + b.Wp + m, b.Yb - b.cover, b.z0 - m)];
    ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); for (i = 1; i < 4; i++) ctx.lineTo(c[i][0], c[i][1]); ctx.closePath();
    ctx.globalAlpha = a * 0.35; ctx.fill(); ctx.globalAlpha = a * 1.1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c[0][0], c[0][1]); ctx.lineTo(cb[0][0], cb[0][1]); ctx.lineTo(cb[1][0], cb[1][1]); ctx.lineTo(c[1][0], c[1][1]); ctx.stroke();

    [-1, 1].forEach(function (side) {
      // top surface of the page block
      ctx.beginPath();
      for (i = 0; i <= n; i++) { p = blockPt(side, i / n, b.z0); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
      for (i = n; i >= 0; i--) { p = blockPt(side, i / n, b.z1); ctx.lineTo(p[0], p[1]); }
      ctx.closePath();
      ctx.globalAlpha = a * 0.28; ctx.fill(); ctx.globalAlpha = a * 1.1; ctx.stroke();
      // front face: the stacked edges of the closed pages
      ctx.beginPath();
      for (i = 0; i <= n; i++) { p = blockPt(side, i / n, b.z0); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }
      p = proj(b.bx, b.Yb - b.cover, b.z0); ctx.lineTo(p[0], p[1]); p = proj(b.bx + side * b.Wp, b.Yb - b.cover, b.z0); ctx.lineTo(p[0], p[1]);
      ctx.closePath(); ctx.globalAlpha = a * 0.45; ctx.fill();
      ctx.globalAlpha = a * 0.6; ctx.beginPath();
      for (j = 1; j < 4; j++) {
        var fr = j / 4;
        for (i = 0; i <= n; i++) {
          f = i / n; var yTop = b.Yb - blockH(f), y = b.Yb - b.cover + (yTop - (b.Yb - b.cover)) * fr;
          q = proj(b.bx + side * (1 - f) * b.Wp, y, b.z0);
          if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
        }
      }
      ctx.stroke();
      // printed lines on the open page
      var lines = side < 0 ? b.left : b.right;
      ctx.globalAlpha = a * 0.8; ctx.beginPath();
      for (i = 0; i < lines.length; i++) {
        var L = lines[i], z = b.z1 - b.Hp * (0.1 + 0.74 * i / (lines.length - 1));
        for (j = 0; j <= 4; j++) {
          // reading left to right: from the outer edge on the left page, from the gutter on the right one
          var x = L.indent + (L.len - L.indent) * j / 4;
          f = side < 0 ? 0.12 + 0.76 * x : 1 - (0.12 + 0.76 * x);
          q = blockPt(side, f, z); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
        }
      }
      ctx.stroke();
    });
    // the gutter
    p = blockPt(1, 1, b.z0); q = blockPt(1, 1, b.z1);
    ctx.globalAlpha = a * 1.2; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
  }

  /* ---------------- pages ---------------- */

  // printed text: paragraphs of lines, the last line of each shorter
  function layout() {
    var lines = [], n = 9, para = 0;
    for (var i = 0; i < n; i++) {
      var end = Math.random() < 0.18 || i === n - 1;
      lines.push({ indent: para === 0 ? 0.08 : 0, len: end ? rand(0.25, 0.7) : rand(0.93, 1) });
      para = end ? 0 : para + 1;
    }
    return lines;
  }

  // a sheet: centre, orientation (axes U across, V along its height, N normal), shape
  function sheet() {
    return { x: 0, y: 0, z: 0, R: [1, 0, 0, 0, 0, 1, 0, -1, 0], w: book.Wp * 0.97, aspect: book.Hp / book.Wp * 0.97,
             curl: 0, twist: rand(-0.3, 0.3), pin: 1, fl: rand(0, 6.3), fs: rand(1.6, 2.8),
             lines: layout(), folio: Math.random() < 0.7 };
  }

  // a hinged page lifting from the right-hand block, rotating about the spine
  function startLift(flip) {
    var p = sheet();
    if (flip) { p.flip = true; p.th = Math.PI - 0.02; p.dth = -rand(0.5, 1.5); } // lying on the left, about to turn over
    else { p.th = 0.02; p.dth = rand(0.3, 1); }
    p.release = rand(1.1, 2); p.held = 0;
    lifting.push(p);
  }
  function hingePose(p) {
    var b = book, th = p.th, ux = Math.cos(th), uy = -Math.sin(th);
    // U across the page (from the spine), V along its height (+z), N = U x V
    p.R = [ux, uy, 0, 0, 0, 1, uy, -ux, 0];
    var hy = b.Yb - blockH(1) - 1;
    p.x = b.bx + ux * p.w / 2; p.y = hy + uy * p.w / 2; p.z = (b.z0 + b.z1) / 2;
  }

  function release(p) {
    // the page tears free, keeping the hinge's swing as its first motion
    var ux = p.R[0], uy = p.R[1], sw = p.dth * p.w / 2; // speed of the page's centre as it swings about the spine
    p.vx = sw * uy + 120; p.vy = -sw * ux - 80; p.vz = rand(-15, 15);
    lastRelease = time;
    leafInit(p);
    p.R0 = p.R.slice(); p.ease = 0; // ease from the torn-off pose into the glide
    p.age = 0;
    loose.push(p);
  }

  /* A loose page moves like a leaf: it glides banked (so its face stays turned
     towards us), turns slowly towards the way it is travelling, and rocks from
     side to side with its nose dipping and rising; the air lifting it tilts it
     up. The rocking grows a little in gusts, but the page never spins over. */
  function leafInit(p) {
    p.bank = (Math.random() < 0.5 ? -1 : 1) * rand(0.45, 0.85);
    p.yaw = Math.atan2(p.vz || 0, p.vx || 1) + rand(-0.4, 0.4);
    p.ph2 = rand(0, 6.3); p.roll = p.bank; p.pitch = 0;
  }
  function leafPose(p, g, dt) {
    var sp = Math.hypot(p.vx, p.vz);
    if (sp > 15) { var hd = Math.atan2(p.vz, p.vx), d = hd - p.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); p.yaw += d * Math.min(1, dt * 0.6); }
    p.yaw += Math.sin(p.fl * 0.31 + p.ph2) * 0.25 * dt;                       // a slow wandering turn
    var rock = (0.35 + 0.3 * Math.min(1, g)) * Math.sin(p.fl);              // side-to-side rocking
    var roll = p.bank + rock, pitch = 0.3 * Math.sin(p.fl * 0.5 + p.ph2) + clamp(-p.vy / 400, -0.45, 0.45);
    p.roll += (roll - p.roll) * Math.min(1, dt * 4); p.pitch += (pitch - p.pitch) * Math.min(1, dt * 3);
    // flat page (U across, V along its height, N up), rolled about the flight axis x, pitched about z, turned about y
    var cr = Math.cos(p.roll), sr = Math.sin(p.roll), cpt = Math.cos(p.pitch), spt = Math.sin(p.pitch), cy = Math.cos(p.yaw), sy = Math.sin(p.yaw);
    var base = [1, 0, 0, 0, 0, 1, 0, -1, 0], R = [];
    for (var c = 0; c < 3; c++) {
      var x = base[c * 3], y = base[c * 3 + 1], z = base[c * 3 + 2], t;
      t = y * cr - z * sr; z = y * sr + z * cr; y = t;          // roll about x
      t = x * cpt - y * spt; y = x * spt + y * cpt; x = t;      // pitch about z
      t = x * cy + z * sy; z = -x * sy + z * cy; x = t;         // yaw about y
      R.push(x, y, z);
    }
    if (p.R0 && p.ease < 1) { // blend from the pose it had when it tore off the book
      p.ease = Math.min(1, p.ease + dt * 1.1);
      var e = p.ease * p.ease * (3 - 2 * p.ease);
      for (var i = 0; i < 9; i++) R[i] = p.R0[i] * (1 - e) + R[i] * e;
      for (c = 0; c < 2; c++) { var l = Math.hypot(R[c * 3], R[c * 3 + 1], R[c * 3 + 2]) || 1; R[c * 3] /= l; R[c * 3 + 1] /= l; R[c * 3 + 2] /= l; }
      R[6] = R[1] * R[5] - R[2] * R[4]; R[7] = R[2] * R[3] - R[0] * R[5]; R[8] = R[0] * R[4] - R[1] * R[3];
    }
    p.R = R;
  }

  function step(dt) {
    time += dt;
    if (time >= nextGust) scheduleGust();
    var b = book, i, p;
    var gb = gustHere(proj(b.bx, b.Yb, b.z0)[0], H); // the wind at the book
    if (gb > 0.25 && vortices.length < 8 && Math.random() < dt * gb * 1.2) spawnVortex(Math.random() < 0.55, gb);
    for (i = vortices.length - 1; i >= 0; i--) {
      var V = vortices[i], gv = gustHere(proj(V.x, V.y, V.z)[0], H);
      V.age += dt;
      V.x += (30 + 110 * gv) * dt; V.y -= 30 * dt; // carried along with the wind, rising slowly
      if (V.age > V.life) vortices.splice(i, 1);
    }

    // a gust lifts pages from the right-hand side, and riffles pages over from the left to the right
    var nTear = 0, nFlip = 0;
    for (i = 0; i < lifting.length; i++) if (lifting[i].flip) nFlip++; else nTear++;
    if (nTear < (gb > 1 ? 3 : 2) && gb > 0.25 && Math.random() < dt * gb * 1.4) startLift(false);
    // never long without a page leaving: if a while has passed, the next lifting page is carried off
    var overdue = time - lastRelease > 1.5 || loose.length < 2;
    if (overdue && nTear === 0) startLift(false);
    if (nFlip < Math.round(2 + gb * 4) && gb > 0.25 && Math.random() < dt * gb * 4) startLift(true);
    for (i = lifting.length - 1; i >= 0; i--) {
      p = lifting[i];
      p.fl += p.fs * dt;
      if (p.flip) {
        // the wind gets under the left page and turns it over the spine onto the right
        p.dth += (-(1.5 + 7 * gb) * Math.sin(p.th) - 1.2 + 0.8 * Math.sin(p.fl) - 1.5 * p.dth) * dt;
        p.th += p.dth * dt;
        p.curl = clamp(0.2 + 0.3 * gb + 0.1 * Math.sin(p.fl * 1.7), 0, 0.7) * Math.min(1, Math.sin(p.th) * 3);
        hingePose(p);
        if (gb > 0.9 && p.th > 0.9 && p.th < 2.2 && Math.random() < dt * 0.25 * gb) { lifting.splice(i, 1); release(p); continue; } // torn away mid-turn
        if (p.th <= 0.01) lifting.splice(i, 1); // landed on the right-hand side
        continue;
      }
      var target = (overdue ? Math.max(gb * 2.3, 2.7) : gb * 2.3) + 0.25 * Math.sin(p.fl);
      p.dth += (7 * (target - p.th) - 2.2 * p.dth) * dt;
      p.th += p.dth * dt;
      if (p.th > 2.9) { p.th = 2.9; p.dth = 0; }
      p.curl = clamp(0.15 + gb * 0.45 + 0.12 * Math.sin(p.fl * 1.7), 0, 0.8) * (p.th > 0.3 ? 1 : p.th / 0.3);
      hingePose(p);
      if (p.th > p.release) p.held += dt;
      if (p.th > p.release && (gb > 0.45 || overdue) && (p.held > 0.3 || Math.random() < dt * 3)) { lifting.splice(i, 1); release(p); continue; }
      if (p.th <= 0.01 && p.dth < 0) lifting.splice(i, 1); // fell back onto the book
    }

    for (i = loose.length - 1; i >= 0; i--) {
      p = loose[i];
      p.age += dt;
      var u = wind(p.x, p.y, p.z), g = u[3];
      var follow = Math.min(1, dt * 2.5);
      p.vx += (u[0] - p.vx) * follow;
      p.vy += (u[1] + 22 - p.vy) * follow + Math.sin(p.fl) * 25 * dt;
      p.vz += (u[2] - p.vz) * follow;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z = clamp(p.z + p.vz * dt, -50, ZD);
      // never lower on screen than the top of the book: a page that sinks that far skims along it
      var floorY = H / 2 + (floorSy - H / 2) / scaleAt(p.z) - p.w * 0.95; // the world height at that line, at this depth, less the page's own size
      if (p.y > floorY) { p.y = floorY; if (p.vy > 0) p.vy = -p.vy * 0.15; }
      p.fl += p.fs * (0.6 + 0.6 * g) * dt;
      leafPose(p, g, dt); // gliding and rocking like a falling leaf, not tumbling
      p.pin = Math.max(0, p.pin - dt * 1.5);
      p.curl += (0.25 + 0.2 * Math.sin(p.fl) - p.curl) * Math.min(1, dt * 1.5);
      var s = proj(p.x, p.y, p.z);
      if (s[0] > W * 1.3 || s[1] > H * 1.35 || s[1] < -H * 0.6 || p.age > 150) loose.splice(i, 1);
    }
  }

  function drawSheet(p) {
    var w = p.w, h = w * p.aspect, hw = w / 2, hh = h / 2, R = p.R, pin = p.pin;
    function pt(u, v) {
      var nu = u / hw, nv = v / hh, hn = (nu + 1) / 2;
      var lz = p.curl * w * 0.28 * (pin * hn * hn * 1.3 + (1 - pin) * nu * nu) + p.twist * nu * nv * w * 0.12 * (1 - pin);
      return proj(p.x + R[0] * u + R[3] * v + R[6] * lz, p.y + R[1] * u + R[4] * v + R[7] * lz, p.z + R[2] * u + R[5] * v + R[8] * lz);
    }
    var fog = 0.3 + 0.7 * clamp(1 - p.z / ZD, 0, 1), facing = Math.abs(R[8]);
    var S = 6, i, q, o = [];
    for (i = 0; i <= S; i++) o.push(pt(-hw + w * i / S, -hh));
    for (i = 1; i <= 3; i++) o.push(pt(hw, -hh + h * i / 3));
    for (i = S - 1; i >= 0; i--) o.push(pt(-hw + w * i / S, hh));
    for (i = 2; i >= 1; i--) o.push(pt(-hw, -hh + h * i / 3));
    ctx.beginPath(); ctx.moveTo(o[0][0], o[0][1]);
    for (i = 1; i < o.length; i++) ctx.lineTo(o[i][0], o[i][1]);
    ctx.closePath();
    ctx.globalAlpha = Math.min(1, baseAlpha * fog * (0.25 + 0.45 * facing)); ctx.fill();
    ctx.globalAlpha = Math.min(1, baseAlpha * fog * 1.3); ctx.stroke();
    if (facing > 0.2) {
      ctx.globalAlpha = Math.min(1, baseAlpha * fog * 0.9 * facing);
      var top = -hh + h * 0.1, gap = h * 0.74 / (p.lines.length - 1);
      ctx.beginPath();
      for (i = 0; i < p.lines.length; i++) {
        var L = p.lines[i], v = top + i * gap, u0 = -hw * 0.78 + w * 0.78 * L.indent, u1 = -hw * 0.78 + w * 0.78 * L.len;
        for (var j = 0; j <= 3; j++) { q = pt(u0 + (u1 - u0) * j / 3, v); if (j) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      }
      if (p.folio) { q = pt(-w * 0.04, hh * 0.9); ctx.moveTo(q[0], q[1]); q = pt(w * 0.04, hh * 0.9); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
    }
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = ink; ctx.strokeStyle = ink;
    ctx.lineWidth = 0.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    var bz = (book.z0 + book.z1) / 2, i;
    loose.sort(function (a, b) { return b.z - a.z; });
    for (i = 0; i < loose.length; i++) if (loose[i].z > bz) drawSheet(loose[i]); // behind the book
    drawBook(Math.min(1, baseAlpha * 1.2));
    for (i = 0; i < lifting.length; i++) drawSheet(lifting[i]);
    for (i = 0; i < loose.length; i++) if (loose[i].z <= bz) drawSheet(loose[i]);
    ctx.globalAlpha = 1;
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    F = 1.1 * Math.max(W, H); ZD = 1.1 * Math.max(W, H);
    P0 = clamp(Math.min(W, H) / 24, 20, 40);
    buildBook();
    lifting = []; // hinged pages belong to the old book
  }

  function firstGust() {
    // the page opens on a still book; the first gust arrives a moment later
    gusts.push({ t0: rand(0.8, 1.6), rise: rand(0.6, 1.2), hold: rand(2, 4), fall: 2.5, peak: rand(0.8, 1.1) });
    nextGust = gusts[0].t0 + 1;
  }

  var last = 0;
  function frame(t) {
    var dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (dt > 0) step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    cv = document.createElement('canvas');
    cv.id = 'pages-bg';
    cv.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor();
    resize();
    firstGust();
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
