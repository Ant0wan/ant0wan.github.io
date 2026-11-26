/* Faint background school of silvery-blue fish, simulated in 3D and seen
   from the side through a perspective camera, with an occasional shark.

   Behaviour, loosely after field and model studies of schooling fish:
   - each fish swims "burst-and-glide": a few quick tail beats, then a coast
     that slows under drag (how most reef fish save energy);
   - fish follow three local rules in 3D (keep apart, align, stay close), so
     the school's shape comes from neighbours, not from a script;
   - the school switches between collective states seen in real schools
     (Couzin et al. 2002): loose hovering (resting), milling in a slow
     horizontal torus, a polarised transit, and now and then a tight
     spiralling "bait ball";
   - a burst spreads to close neighbours, so ripples run through the school;
   - fish keep near-level swimming: pitch is limited and relaxes back to flat.

   Predator: a shark shows up at random, cruises in from off-screen towards
   the school and lunges when it gets close, sometimes catching a fish.
   Fish that sense it pull the school together (compaction); fish close to it
   startle with a fast turn and burst away from its path (flash expansion and
   the "fountain effect": the school splits around the shark and closes up
   behind it). After the shark leaves, the school often balls up for a while.

   Rendering: bodies are projected from their 3D orientation, so they
   foreshorten when they turn towards or away from you, shrink and fade with
   distance, and flash faintly when a silver flank faces the viewer.
   Drawn very faintly behind the page, no pointer events, paused in hidden
   tabs, and a still frame only for visitors who prefer reduced motion.
   Add ?fish=debug to a page URL to see it all clearly, shark arriving early. */
(function () {
  if (window.__fishSchool) return;
  window.__fishSchool = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]fish=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, fish = [], school, shark, hammer;
  var L = 18, R0 = 120, RB = 60, F = 1000, ZD = 900, SP = 30; // fish length, school radius loose/balled, focal length, depth, spacing
  var fishFill = '#4f6f8f', sharkFill = '#56636f', baseAlpha = 0.1;

  var MODES = {
    //       separation align cohesion anchor wander  thrust (u/s^2)  burst s       glide s
    hover:  { sep: 1.6, ali: 0.25, coh: 0.45, anc: 0.9, wan: 0.6,  thrust: 16, burst: [0.12, 0.25], glide: [2.0, 5.0] },
    mill:   { sep: 1.6, ali: 0.9,  coh: 0.3,  anc: 0,   wan: 0.3,  thrust: 38, burst: [0.15, 0.3],  glide: [0.7, 1.6] },
    ball:   { sep: 1.6, ali: 1.0,  coh: 0.6,  anc: 0,   wan: 0.2,  thrust: 44, burst: [0.15, 0.3],  glide: [0.5, 1.2] },
    travel: { sep: 1.6, ali: 1.3,  coh: 0.5,  anc: 0.6, wan: 0.25, thrust: 58, burst: [0.2, 0.35],  glide: [0.4, 0.9] }
  };
  var DRAG = 1.0;       // 1/s: a gliding fish loses ~63% of its speed per second
  var MAX_PITCH = 0.45; // rad: fish climb and dive gently

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function wrapAngle(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function scaleAt(z) { return F / (F + z); }
  function project(X, Y, Z) { var k = scaleAt(Z); return [W / 2 + (X - W / 2) * k, H / 2 + (Y - H / 2) * k]; }
  // the world point whose projection lands on screen point (sx, sy) at depth z
  function unproject(sx, sy, z) { var k = scaleAt(z); return [W / 2 + (sx - W / 2) / k, H / 2 + (sy - H / 2) / k, z]; }

  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    fishFill = dark ? '#a9c3d8' : '#4f6f8f';
    sharkFill = dark ? '#8e9ba7' : '#56636f';
    baseAlpha = debug ? 0.6 : dark ? 0.07 : 0.09;
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    if (W && H && fish.length) {
      var sx = w / W, sy = h / H;
      fish.forEach(function (f) { f.x *= sx; f.y *= sy; });
      school.x *= sx; school.y *= sy; school.hx *= sx; school.hy *= sy;
      if (school.tx !== undefined) { school.tx *= sx; school.ty *= sy; }
      if (shark.active) { shark.x *= sx; shark.y *= sy; }
      if (hammer.active) { hammer.x *= sx; hammer.y *= sy; }
    }
    W = w; H = h;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    L = clamp(Math.min(W, H) / 24, 18, 40);
    F = 1.1 * Math.max(W, H);
    ZD = 0.9 * Math.max(W, H);
  }

  /* ---------------- school ---------------- */

  function pickTarget() {
    var best = null, bd = -1;
    for (var n = 0; n < 12; n++) {
      var p = unproject(rand(0.3, 0.7) * W, rand(0.35, 0.65) * H, rand(0.25, 0.65) * ZD);
      var d = Math.hypot(p[0] - school.x, p[1] - school.y, p[2] - school.z);
      if (d > 0.2 * Math.max(W, H)) return p;
      if (d > bd) { bd = d; best = p; }
    }
    return best;
  }

  function setMode(m) {
    school.mode = m;
    if (m === 'hover') { school.t = rand(14, 38); school.hx = school.x; school.hy = school.y; school.hz = school.z; }
    else if (m === 'mill') { school.t = rand(10, 24); school.dir = Math.random() < 0.5 ? 1 : -1; }
    else if (m === 'ball') {
      school.t = rand(18, 35); school.dir = Math.random() < 0.5 ? 1 : -1;
      var p = unproject(rand(0.35, 0.65) * W, rand(0.4, 0.6) * H, rand(0.3, 0.6) * ZD);
      school.x = p[0]; school.y = p[1]; school.z = p[2];
    }
    else { var q = pickTarget(); school.tx = q[0]; school.ty = q[1]; school.tz = q[2]; school.t = 60; }
  }

  function nextMode() {
    var m = school.mode, r = Math.random();
    if (m === 'hover') setMode(r < 0.5 ? 'travel' : r < 0.8 ? 'mill' : 'ball');
    else if (m === 'mill') setMode(r < 0.6 ? 'travel' : r < 0.85 ? 'hover' : 'ball');
    else if (m === 'ball') setMode(r < 0.6 ? 'hover' : 'travel');
    else setMode(r < 0.75 ? 'hover' : 'mill');
  }

  function edgeSpawn(f) {
    // a straggler arriving from just outside the view
    var side = Math.floor(rand(0, 4)), z = rand(0.1, 0.9) * ZD;
    var sx = side === 0 ? -0.08 * W : side === 1 ? 1.08 * W : rand(0, 1) * W;
    var sy = side === 2 ? -0.08 * H : side === 3 ? 1.08 * H : rand(0, 1) * H;
    var p = unproject(sx, sy, z);
    f.x = p[0]; f.y = p[1]; f.z = p[2];
    f.yaw = Math.atan2(school.z - f.z, school.x - f.x); f.pitch = 0; f.s = 0; f.gt = 0;
  }

  function init() {
    var n = Math.round(clamp(W * H / 7000, 60, 220));
    R0 = 0.45 * Math.max(W, H);            // the loose school is as wide as the screen
    RB = L * Math.cbrt(n) * 1.1;           // a packed bait ball
    // spacing that spreads n fish evenly through the visible volume (frustum: width grows by 1 + z/F)
    var g = ZD / F, vol = W * H * ZD * (1 + g + g * g / 3);
    SP = Math.max(1.4 * L, 0.8 * Math.cbrt(vol / n));
    var p0 = unproject(W / 2, H / 2, 0.45 * ZD);
    school = { x: p0[0], y: p0[1], z: p0[2], vx: 0, vy: 0, vz: 0, time: rand(0, 1000), tight: 0, alarm: 0, fear: 0,
               p1: rand(0, 6.3), p2: rand(0, 6.3), p3: rand(0, 6.3) };
    setMode('hover');
    var yaw0 = rand(-Math.PI, Math.PI);
    fish = [];
    for (var i = 0; i < n; i++) {
      var p = unproject(rand(-0.05, 1.05) * W, rand(-0.05, 1.05) * H, rand(0, 1) * ZD); // fill the whole view
      fish.push({
        x: p[0], y: p[1], z: p[2],
        yaw: yaw0 + rand(-0.5, 0.5), pitch: rand(-0.1, 0.1), s: rand(0, 6), size: rand(0.85, 1.15),
        bt: 0, gt: rand(0, 3), thrust: 0, burst: false, panic: 0, panicAge: 9, calm: 0, dead: false, respawn: 0,
        wa: rand(0, 6.3), wp: rand(0, 6.3), ph: rand(0, 6.3)
      });
    }
    shark = { active: false, next: 5, ph: 0 };
    hammer = { active: false, next: debug ? 20 : rand(30, 55), ph: 0 };
  }

  function stepSchool(dt) {
    school.time += dt;
    school.t -= dt;
    if (school.mode === 'hover') {
      // the resting spot drifts a little, like a school holding station in surge
      school.x = school.hx + 25 * Math.sin(school.time * 0.07 + school.p1);
      school.y = school.hy + 12 * Math.sin(school.time * 0.05 + school.p2);
      school.z = school.hz + 40 * Math.sin(school.time * 0.04 + school.p3);
      school.vx = school.vy = school.vz = 0;
    } else if (school.mode === 'travel') {
      var dx = school.tx - school.x, dy = school.ty - school.y, dz = school.tz - school.z;
      var d = Math.hypot(dx, dy, dz) || 1;
      var v = Math.min(1.4 * L, d * 0.4); // eases in near the target
      var e = Math.min(1, dt * 0.6);
      school.vx += (dx / d * v - school.vx) * e;
      school.vy += (dy / d * v - school.vy) * e;
      school.vz += (dz / d * v - school.vz) * e;
      school.x += school.vx * dt; school.y += school.vy * dt; school.z += school.vz * dt;
      if (d < L * 1.5) school.t = 0;
    } else {
      school.vx = school.vy = school.vz = 0;
    }
    if (school.t <= 0) nextMode();
    // the school packs together in a bait ball or while a predator is about, and loosens slowly afterwards
    var want = school.mode === 'ball' || school.alarm > 0 ? 1 : 0;
    school.tight += (want - school.tight) * Math.min(1, dt * (want ? 0.35 : 0.12));
    school.alarm = Math.max(0, school.alarm - dt);
  }

  function stepFish(dt) {
    var P = MODES[school.mode], n = fish.length;
    var T = school.tight, spacing = lerp(SP, 1.5 * L, T), Rs = lerp(R0, RB, T);
    var R = Math.max(5 * L, 1.8 * spacing), R2 = R * R;
    var Ls = shark.active ? shark.len : 0, fear = school.fear;
    var i, j, f, g;
    for (i = 0; i < n; i++) {
      f = fish[i];
      if (f.dead) {
        f.respawn -= dt;
        if (f.respawn <= 0) { f.dead = false; edgeSpawn(f); }
        continue;
      }
      var sepX = 0, sepY = 0, sepZ = 0, aliX = 0, aliY = 0, aliZ = 0, cx = 0, cy = 0, cz = 0, cnt = 0, catching = false;
      var sepR = spacing * f.size;
      for (j = 0; j < n; j++) {
        if (j === i) continue;
        g = fish[j];
        if (g.dead) continue;
        var dx = g.x - f.x, dy = g.y - f.y, dz = g.z - f.z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > R2) continue;
        var d = Math.sqrt(d2) || 0.01;
        cnt++; cx += g.x; cy += g.y; cz += g.z;
        var cp = Math.cos(g.pitch);
        aliX += cp * Math.cos(g.yaw); aliY += Math.sin(g.pitch); aliZ += cp * Math.sin(g.yaw);
        if (d < sepR) { var k = (sepR - d) / sepR / d; sepX -= dx * k; sepY -= dy * k; sepZ -= dz * k; }
        // a neighbour's burst cuts this fish's glide short: ripples through the school
        if (g.burst && d < Math.max(3 * L, R * 0.6) && f.bt <= 0 && f.gt > 0.25) f.gt = rand(0.05, 0.25);
        // panic is contagious, more so the more frightened the school is
        // (only a fresh startle is catching, so fear sweeps through as a wave rather than lingering)
        if (g.panicAge < 0.35 && f.panic <= 0 && f.calm <= 0 && d < 2 * L * (1 + fear) && Math.random() < dt * (2 + 10 * fear)) catching = true;
      }
      var wx = 0, wy = 0, wz = 0;
      if (cnt) {
        var al = Math.hypot(aliX, aliY, aliZ) || 1;
        wx += aliX / al * P.ali; wy += aliY / al * P.ali; wz += aliZ / al * P.ali;
        var tx = cx / cnt - f.x, ty = cy / cnt - f.y, tz = cz / cnt - f.z, tl = Math.hypot(tx, ty, tz) || 1;
        var cw = (P.coh + T * 0.6) * clamp(tl / R, 0, 1);
        wx += tx / tl * cw; wy += ty / tl * cw; wz += tz / tl * cw;
      }
      wx += sepX * P.sep; wy += sepY * P.sep; wz += sepZ * P.sep;

      // pull of the school's goal
      var ox = school.x - f.x, oy = school.y - f.y, oz = school.z - f.z, od = Math.hypot(ox, oy, oz) || 1;
      if (school.mode === 'mill' || school.mode === 'ball') {
        // torus around a vertical axis through the anchor; in a ball, tighter and spiralling up and down
        var rh = Math.hypot(ox, oz) || 1, rm = Rs * (school.mode === 'ball' ? 0.5 : 0.6), rr = clamp((rh - rm) / rm, -1, 1.5);
        var tan = school.mode === 'ball' ? 1.4 : 1.2;
        wx += (-oz / rh) * school.dir * tan + (ox / rh) * rr;
        wz += (ox / rh) * school.dir * tan + (oz / rh) * rr;
        var yGoal = school.y;
        if (school.mode === 'ball') yGoal += Math.sin(Math.atan2(-oz, -ox) * school.dir - school.time * 0.5) * Rs * 0.6;
        wy += clamp((yGoal - f.y) / Rs, -1, 1) * 0.8;
      } else {
        var aw = P.anc * clamp((od - Rs * 0.8) / Rs * 2, 0, 2) + T * clamp(od / Rs - 0.5, 0, 2);
        wx += ox / od * aw; wy += oy / od * aw; wz += oz / od * aw;
        if (school.mode === 'travel') {
          var sv = Math.hypot(school.vx, school.vy, school.vz);
          if (sv > 1) { wx += school.vx / sv; wy += school.vy / sv; wz += school.vz / sv; }
        }
      }

      // individual wandering, mostly in the horizontal plane
      f.wa += rand(-1, 1) * dt * 2.5;
      f.wp += rand(-1, 1) * dt * 1.5;
      wx += Math.cos(f.wa) * P.wan; wz += Math.sin(f.wa) * P.wan; wy += Math.sin(f.wp) * P.wan * 0.3;

      // predator: flee away from it and sideways off its path; startle when it is close or lunging.
      // The more the school fears it (a hunting shark), the further they sense it and the faster panic spreads.
      var startle = catching;
      if (Ls) {
        var px0 = f.x - shark.x, py0 = f.y - shark.y, pz0 = f.z - shark.z, pd = Math.hypot(px0, py0, pz0) || 1;
        var fearR = (1.8 + 1.6 * fear) * Ls;
        if (pd < fearR) {
          var hx = shark.fx, hy = shark.fy, hz = shark.fz, along = (px0 * hx + py0 * hy + pz0 * hz) / pd;
          var lx = px0 / pd - hx * along, ly = py0 / pd - hy * along, lz = pz0 / pd - hz * along, ll = Math.hypot(lx, ly, lz) || 1;
          var fw = (fearR - pd) / fearR * (5 + 5 * fear);
          wx += (px0 / pd * 0.5 + lx / ll) * fw; wy += (py0 / pd * 0.5 + ly / ll) * fw * 0.6; wz += (pz0 / pd * 0.5 + lz / ll) * fw;
          if (pd < (0.7 + 0.9 * fear) * Ls || (shark.lunge > 0 && pd < (1.2 + 0.8 * fear) * Ls)) startle = true;
        }
      }
      if (startle && f.panic <= 0 && (f.calm <= 0 || !catching)) {
        f.panic = rand(0.8, 1.5) * (1 + fear); f.panicAge = 0;
        f.bt = rand(0.25, 0.4);
        f.thrust = MODES.travel.thrust * rand(2.5, 3.5) * (L / 18) * f.size;
        f.burst = true;
      }
      f.panicAge += dt;
      if (f.calm > 0) f.calm -= dt;
      if (f.panic > 0) {
        f.panic -= dt;
        if (f.panic <= 0) f.calm = rand(1, 2.5) * (1.5 - fear); // a moment before a neighbour can set it off again
        // erratic zig-zag escape
        f.wa += rand(-1, 1) * dt * 14;
        wx += Math.cos(f.wa) * 1.2; wz += Math.sin(f.wa) * 1.2;
      }

      // keep the fish in a margin around what the camera sees, and within the depth of the volume
      var ks = scaleAt(f.z), sx = W / 2 + (f.x - W / 2) * ks, sy = H / 2 + (f.y - H / 2) * ks;
      var mx = 0.06 * W, my = 0.06 * H;
      if (sx < -mx) wx += (-mx - sx) / ks / L; else if (sx > W + mx) wx -= (sx - W - mx) / ks / L;
      if (sy < -my) wy += (-my - sy) / ks / L; else if (sy > H + my) wy -= (sy - H - my) / ks / L;
      if (f.z < 0) wz += -f.z / L; else if (f.z > ZD) wz -= (f.z - ZD) / L;

      // turn towards the wanted direction, rate-limited; a startled fish whips round (C-start)
      var wh = Math.hypot(wx, wz), rate = f.panic > 0 ? 7 : f.bt > 0 ? 2.6 : 0.9;
      if (wh > 0.08) {
        var diff = wrapAngle(Math.atan2(wz, wx) - f.yaw);
        f.yaw = wrapAngle(f.yaw + clamp(diff * (f.panic > 0 ? 8 : 1.6) * dt, -rate * dt, rate * dt));
      }
      var wantPitch = Math.hypot(wx, wy, wz) > 0.08 ? clamp(Math.atan2(wy, Math.max(wh, 0.6)) * 0.7, -MAX_PITCH, MAX_PITCH) : 0;
      f.pitch += clamp((wantPitch - f.pitch) * 1.2 * dt, -rate * 0.5 * dt, rate * 0.5 * dt);

      // burst-and-glide
      if (f.bt > 0) {
        if (!f.burst) f.bt -= dt;
        if (f.bt <= 0) f.gt = f.panic > 0 ? rand(0.1, 0.3) : rand(P.glide[0], P.glide[1]);
      } else {
        f.gt -= dt;
        if (f.gt <= 0) {
          var lag = clamp(od / Rs - 1.1, 0, 1.5); // stragglers swim harder to catch up
          f.bt = rand(P.burst[0], P.burst[1]);
          f.thrust = (f.panic > 0 ? MODES.travel.thrust * 2.2 : P.thrust * (1 + lag)) * rand(0.7, 1.3) * (L / 18) * f.size;
          f.burst = true;
        }
      }
    }
    // second pass: move (bursts flagged this step have already spread to neighbours above)
    for (i = 0; i < n; i++) {
      f = fish[i];
      if (f.dead) continue;
      if (f.burst) { f.burst = false; f.bt -= dt; }
      f.s += ((f.bt > 0 ? f.thrust : 0) - DRAG * f.s) * dt;
      if (f.s < 0) f.s = 0;
      var c = Math.cos(f.pitch);
      f.x += c * Math.cos(f.yaw) * f.s * dt;
      f.y += Math.sin(f.pitch) * f.s * dt;
      f.z += c * Math.sin(f.yaw) * f.s * dt;
      // tail: quick beats while bursting, slow finning while gliding
      f.ph += dt * (f.bt > 0 ? 16 : 2 + f.s / L * 2);
    }
  }

  /* ---------------- shark ---------------- */

  function spawnShark() {
    var side = Math.random() < 0.5 ? -1 : 1; // -1: enters from the left
    var z = rand(0.15, 0.7) * ZD, p = unproject(side < 0 ? -0.25 * W : 1.25 * W, rand(0.3, 0.7) * H, z);
    shark.active = true; shark.side = side; shark.len = 6 * L;
    shark.x = p[0]; shark.y = p[1]; shark.z = p[2];
    shark.yaw = side < 0 ? rand(-0.3, 0.3) : Math.PI + rand(-0.3, 0.3); shark.pitch = 0;
    shark.s = 0.3 * shark.len; shark.age = 0; shark.lunge = 0; shark.cool = 2; shark.lunges = 0; shark.hunting = true;
    // some passes are cruises with an opportunistic snap or two; others are a real hunt:
    // the shark circles the school, then makes repeated high-speed charges at single fish
    shark.aggressive = Math.random() < 0.5; shark.fleeing = false;
    shark.maxLunges = shark.aggressive ? 3 + Math.floor(rand(0, 3)) : 2;
    shark.phase = 'approach'; shark.phaseT = 0; shark.dir = Math.random() < 0.5 ? 1 : -1; shark.prey = null;
  }

  function stepShark(dt) {
    if (!shark.active) {
      shark.next -= dt;
      // great hammerheads eat other sharks: none comes in while one is about
      if (hammer.active) shark.next = Math.max(shark.next, 5);
      if (shark.next <= 0) spawnShark();
      school.fear = Math.max(0, school.fear - dt * 0.25);
      return;
    }
    var S = shark, Ls = S.len, i, f;
    S.age += dt; S.cool -= dt;
    if (S.age > (S.aggressive ? 55 : 30) || (S.lunges >= S.maxLunges && S.lunge <= 0)) S.hunting = false;
    // a hammerhead has appeared: drop the hunt and get away, ahead of it towards the far side
    if (hammer.active && !S.fleeing) {
      S.fleeing = true; S.hunting = false; S.lunge = 0;
      S.side = hammer.side; // leave on the side the hammerhead is heading to, staying ahead of it
    }

    var cp = Math.cos(S.pitch);
    S.fx = cp * Math.cos(S.yaw); S.fy = Math.sin(S.pitch); S.fz = cp * Math.sin(S.yaw);

    // the school: centre, typical radius, nearest fish and nearest fish ahead
    var cx = 0, cy = 0, cz = 0, cnt = 0, best = null, bd = Infinity, ahead = null, ad = Infinity;
    for (i = 0; i < fish.length; i++) {
      f = fish[i];
      if (f.dead) continue;
      cx += f.x; cy += f.y; cz += f.z; cnt++;
      var ddx = f.x - S.x, ddy = f.y - S.y, ddz = f.z - S.z, d = Math.hypot(ddx, ddy, ddz) || 1;
      if (d < bd) { bd = d; best = f; }
      if (d < ad && (ddx * S.fx + ddy * S.fy + ddz * S.fz) / d > 0.5) { ad = d; ahead = f; }
    }
    if (cnt) { cx /= cnt; cy /= cnt; cz /= cnt; }
    var spread = 0;
    for (i = 0; i < fish.length; i++) if (!fish[i].dead) spread += Math.hypot(fish[i].x - cx, fish[i].z - cz);
    spread = cnt ? spread / cnt : 0;
    var dc = Math.hypot(cx - S.x, cy - S.y, cz - S.z);

    var tx, ty, tz, speed, rate, tailRate;
    if (!S.hunting || !cnt) {
      // leave past the far side
      var e = unproject(S.side < 0 ? 1.6 * W : -0.6 * W, H / 2, S.z);
      tx = e[0]; ty = S.y; tz = S.z;
      if (S.fleeing) { speed = 0.95; rate = 1.1; tailRate = 11; } else { speed = 0.35; rate = 0.5; tailRate = 3.2; }
    } else if (!S.aggressive) {
      // cruise: drift towards the school, snap at a fish that comes close ahead
      if (bd < 2.5 * Ls) { tx = best.x; ty = best.y; tz = best.z; } else { tx = cx; ty = cy; tz = cz; }
      var dl0 = Math.hypot(tx - S.x, ty - S.y, tz - S.z) || 1;
      if (S.lunge <= 0 && S.cool <= 0 && bd < 1.3 * Ls && ((tx - S.x) * S.fx + (ty - S.y) * S.fy + (tz - S.z) * S.fz) / dl0 > 0.8) {
        S.lunge = 1.1; S.cool = 5; S.lunges++; S.ate = false;
      }
      speed = S.lunge > 0 ? 1.1 : 0.32; rate = S.lunge > 0 ? 1.2 : 0.5; tailRate = S.lunge > 0 ? 9 : 3.2;
      if (dc < 3 * Ls) school.alarm = 3;
    } else {
      // hunt: approach, circle the school, charge a single fish, recover, circle again
      school.alarm = 3;
      S.phaseT -= dt;
      if (S.phase === 'approach' && dc < Math.max(2.5 * Ls, spread * 1.3)) { S.phase = 'circle'; S.phaseT = rand(2.5, 5); }
      if (S.phase === 'circle' && S.phaseT <= 0 && S.cool <= 0) {
        S.phase = 'charge'; S.prey = ahead || best; S.lunge = rand(1.3, 1.8); S.lunges++; S.ate = false; S.cool = 1;
      }
      if (S.phase === 'charge' && S.lunge <= 0) { S.phase = 'recover'; S.phaseT = rand(0.8, 1.6); S.dir = Math.random() < 0.5 ? 1 : -1; }
      if (S.phase === 'recover' && S.phaseT <= 0) { S.phase = 'circle'; S.phaseT = rand(1.5, 3.5); }

      if (S.phase === 'approach') {
        tx = cx; ty = cy; tz = cz; speed = 0.5; rate = 0.8; tailRate = 5;
      } else if (S.phase === 'charge' && S.prey && !S.prey.dead) {
        // lead the prey a little
        var pr = S.prey, pc = Math.cos(pr.pitch), lead = 0.3;
        tx = pr.x + pc * Math.cos(pr.yaw) * pr.s * lead; ty = pr.y + Math.sin(pr.pitch) * pr.s * lead; tz = pr.z + pc * Math.sin(pr.yaw) * pr.s * lead;
        speed = 1.6; rate = 2.2; tailRate = 13;
      } else if (S.phase === 'charge') {
        tx = S.x + S.fx * Ls; ty = S.y + S.fy * Ls; tz = S.z + S.fz * Ls; speed = 1.6; rate = 1; tailRate = 13;
      } else {
        // circle (or swing wide after a charge) around the school, rising and falling a little
        var rc = clamp(spread * 1.15, 1.3 * Ls, 3.5 * Ls) * (S.phase === 'recover' ? 1.3 : 1);
        var ang = Math.atan2(S.z - cz, S.x - cx) + S.dir * 0.7;
        tx = cx + Math.cos(ang) * rc; tz = cz + Math.sin(ang) * rc; ty = cy + Math.sin(S.age * 0.7) * 0.3 * Ls;
        speed = S.phase === 'recover' ? 0.45 : 0.6; rate = 1.2; tailRate = 6;
      }
    }

    // how frightened the school is: high while a shark is hunting, lower while one cruises by
    var fearWant = !S.hunting ? 0.1 : S.aggressive ? (S.phase === 'approach' ? 0.6 : 1) : (dc < 3 * Ls ? 0.45 : 0.15);
    school.fear += (fearWant - school.fear) * Math.min(1, dt * (fearWant > school.fear ? 1.5 : 0.25));

    var dx = tx - S.x, dy = ty - S.y, dz = tz - S.z;
    S.yaw = wrapAngle(S.yaw + clamp(wrapAngle(Math.atan2(dz, dx) - S.yaw) * dt * 2, -rate * dt, rate * dt));
    var wantPitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)) * 0.7, -0.35, 0.35);
    S.pitch += clamp((wantPitch - S.pitch) * dt * 1.5, -0.5 * dt, 0.5 * dt);
    S.s += (speed * Ls - S.s) * Math.min(1, dt * (S.lunge > 0 ? 3.5 : 0.8));
    S.x += S.fx * S.s * dt; S.y += S.fy * S.s * dt; S.z += S.fz * S.s * dt;
    S.ph += dt * tailRate;
    S.amp = S.lunge > 0 || S.fleeing ? 0.55 : S.aggressive && S.hunting ? 0.4 : 0.3;

    if (S.lunge > 0) {
      S.lunge -= dt;
      // a catch: one fish right at the mouth during the lunge
      if (!S.ate) {
        var mx = S.x + S.fx * 0.5 * Ls, my = S.y + S.fy * 0.5 * Ls, mz = S.z + S.fz * 0.5 * Ls;
        for (i = 0; i < fish.length; i++) {
          f = fish[i];
          if (!f.dead && Math.hypot(f.x - mx, f.y - my, f.z - mz) < 0.18 * Ls) {
            f.dead = true; f.respawn = rand(15, 30); S.ate = true; break;
          }
        }
      }
    }

    // gone once it has left the view on the far side
    var p = project(S.x, S.y, S.z);
    if (!S.hunting && (p[0] < -0.35 * W || p[0] > 1.35 * W || S.age > 75)) {
      S.active = false;
      S.next = 10; // was: debug ? rand(10, 20) : rand(60, 150)
      if (Math.random() < 0.5) setMode('ball'); // the school regroups into a tight ball
    }
  }

  /* ---------------- hammerhead ---------------- */
  // A great hammerhead cruising past far behind the school. It always stays
  // deeper than the deepest fish, so it is never close, and it ignores the
  // school. It crosses on a gentle horizontal arc at a constant height, so the
  // curve shows only as it comes a little nearer and goes away again, and it
  // sweeps its head from side to side, as hammerheads do when scanning.
  function spawnHammer() {
    var H0 = hammer, side = Math.random() < 0.5 ? -1 : 1;
    H0.len = 9 * L;
    H0.zMin = 1.35 * ZD; H0.zMax = 2.1 * ZD;
    H0.s = 0.9 * H0.len;
    // the arc: heading starts at a0 off the crossing line and turns steadily to -a0,
    // so the chord across the view (D) is spanned with a sagitta of R(1 - cos a0)
    var a0 = rand(0.3, 0.45), zMid = (H0.zMin + H0.zMax) / 2;
    var D = 1.7 * W / scaleAt(zMid), R = D / (2 * Math.sin(a0)), sag = R * (1 - Math.cos(a0));
    var nearFirst = Math.random() < 0.5; // curve towards us then away, or the reverse
    var z = nearFirst ? H0.zMin + sag + 0.05 * ZD : H0.zMax - sag - 0.05 * ZD;
    z = clamp(z, H0.zMin, H0.zMax);
    // above or below the middle of the view, so the hammer is seen a little from above or below
    var sy = Math.random() < 0.5 ? rand(0.2, 0.38) : rand(0.62, 0.8);
    var p = unproject(side < 0 ? -0.35 * W : 1.35 * W, sy * H, z);
    H0.active = true; H0.side = side;
    H0.x = p[0]; H0.y = p[1]; H0.z = p[2];
    var s0 = nearFirst ? -1 : 1; // sign of the initial drift in depth
    H0.course = side < 0 ? s0 * a0 : Math.PI - s0 * a0;
    H0.turn = (side < 0 ? -s0 : s0) * H0.s / R; // rad/s, constant: a circular arc
    H0.yaw = H0.course; H0.pitch = 0; H0.age = 0; H0.sweep = rand(0, 6.3);
    // great hammerheads often cruise rolled 50-75 degrees onto one side, using the tall dorsal
    // fin for lift (Payne et al. 2016); it also turns the hammer-shaped head towards the viewer
    H0.rollSide = Math.random() < 0.5 ? 1 : -1; H0.roll = 0; H0.rollT = rand(4, 10);
  }

  function stepHammer(dt) {
    var h = hammer;
    if (!h.active) {
      h.next -= dt;
      if (h.next <= 0) spawnHammer();
      return;
    }
    h.age += dt;
    // follow the arc in the horizontal plane (no climbing or diving); the head sweeps around it
    h.course = wrapAngle(h.course + h.turn * dt);
    h.yaw = wrapAngle(h.course + 0.1 * Math.sin(h.age * 1.6 + h.sweep));
    h.x += Math.cos(h.course) * h.s * dt;
    h.z += Math.sin(h.course) * h.s * dt;
    h.z = Math.max(h.z, 1.2 * ZD); // never closer than this, whatever happens
    h.ph += dt * 6;
    // spend most of the time rolled on one side, now and then level out and roll over
    h.rollT -= dt;
    if (h.rollT <= 0) { h.rollSide = h.rollSide ? 0 : (Math.random() < 0.5 ? 1 : -1); h.rollT = h.rollSide ? rand(12, 25) : rand(3, 6); }
    var wantRoll = h.rollSide * 1.05;
    h.roll += clamp(wantRoll - h.roll, -0.3 * dt, 0.3 * dt);
    var p = project(h.x, h.y, h.z);
    if (h.age > 5 && (p[0] < -0.4 * W || p[0] > 1.4 * W || h.age > 240)) {
      h.active = false;
      h.next = debug ? rand(20, 30) : rand(20, 35); // with a ~20 s crossing: one at least every minute
    }
  }

  /* ---------------- drawing ---------------- */

  // body profile along its length, t = 0 at the snout, 1 at the tail base
  function makeProfile(n, peak, hmax, hmin, widthRatio, power) {
    var out = [];
    for (var q = 0; q < n; q++) {
      var t = q / (n - 1);
      var u = t < peak ? t / peak * 0.5 : 0.5 + (t - peak) / (1 - peak) * 0.5;
      var h = hmax * Math.pow(Math.sin(Math.PI * clamp(u, 0, 1)), power) + hmin;
      out.push({ t: t, h: h, w: h * widthRatio });
    }
    return out;
  }
  // a laterally compressed, deep-bodied snapper
  var FISH = {
    profile: makeProfile(9, 0.35, 0.12, 0.02, 0.45, 0.7),
    caudal: [[0.2, 0.15], [0.12, 0], [0.2, -0.15], [0, -0.03], [0, 0.03]], // forked tail: [back, up]
    fins: []
  };
  // a great hammerhead: the wide flat head (cephalofoil), a very tall sickle-shaped first dorsal,
  // a long upper tail lobe, small pectorals
  var HAMMER = {
    profile: makeProfile(12, 0.38, 0.07, 0.012, 0.8, 0.75),
    caudal: [[0, 0.03], [0.22, 0.2], [0.26, 0.18], [0.1, 0.01], [0.12, -0.08], [0.09, -0.09], [0, -0.03]],
    fins: [ // [along, up, side] in body lengths
      [[0.12, 0.05, 0], [0.04, 0.26, 0], [-0.02, 0.27, 0], [-0.01, 0.23, 0], [-0.03, 0.05, 0]], // first dorsal
      [[-0.17, 0.03, 0], [-0.2, 0.07, 0], [-0.23, 0.025, 0]],                                 // second dorsal
      [[0.25, -0.04, 0.03], [0.1, -0.1, 0.13], [0.14, -0.045, 0.035]],                        // pectoral fins
      [[0.25, -0.04, -0.03], [0.1, -0.1, -0.13], [0.14, -0.045, -0.035]],
      [[-0.14, -0.04, 0], [-0.18, -0.085, 0], [-0.2, -0.035, 0]],                             // anal fin
      // cephalofoil: a flat blade across the front of the head, and its front edge
      [[0.51, 0, -0.13], [0.515, 0, 0], [0.51, 0, 0.13], [0.47, 0, 0.135], [0.455, 0, 0.05], [0.44, 0, 0],
       [0.455, 0, -0.05], [0.47, 0, -0.135]],
      [[0.51, 0.02, -0.135], [0.515, 0.02, 0.135], [0.5, -0.022, 0.135], [0.495, -0.022, -0.135]]
    ]
  };
  // a slender requiem shark: round body, pointed snout, tall first dorsal, long upper tail lobe
  var SHARK = {
    profile: makeProfile(11, 0.36, 0.078, 0.008, 0.85, 0.8),
    caudal: [[0, 0.03], [0.2, 0.19], [0.24, 0.17], [0.1, 0.01], [0.13, -0.09], [0.1, -0.1], [0, -0.03]],
    fins: [ // [along, up, side] in body lengths
      [[0.13, 0.06, 0], [-0.01, 0.2, 0], [-0.05, 0.18, 0], [-0.03, 0.06, 0]],        // first dorsal
      [[-0.17, 0.035, 0], [-0.21, 0.08, 0], [-0.23, 0.03, 0]],                       // second dorsal
      [[0.22, -0.04, 0.035], [0.04, -0.12, 0.18], [0.09, -0.05, 0.04]],              // pectoral fins
      [[0.22, -0.04, -0.035], [0.04, -0.12, -0.18], [0.09, -0.05, -0.04]],
      [[-0.12, -0.05, 0], [-0.17, -0.1, 0], [-0.18, -0.045, 0]]                      // pelvic / anal
    ]
  };

  function signedArea(pts) {
    var a = 0;
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a;
  }
  function addPoly(pts, area) {
    if ((signedArea(pts) > 0) !== (area > 0)) pts.reverse(); // same winding as the body so overlaps fill once
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  var top = [], bot = [];
  function drawBody(e, l, spec, amp, alpha) {
    var prof = spec.profile, n = prof.length;
    var cp = Math.cos(e.pitch), sp = Math.sin(e.pitch);
    // forward (f), dorsal (u: world up, -y, made perpendicular to f) and side (s) axes
    var fx = cp * Math.cos(e.yaw), fy = sp, fz = cp * Math.sin(e.yaw);
    var ux = fx * fy, uy = -1 + fy * fy, uz = fz * fy;
    var ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul; uz /= ul;
    var sx = fy * uz - fz * uy, sy = fz * ux - fx * uz, sz = fx * uy - fy * ux;
    if (e.roll) { // rotate the dorsal and side axes about the body axis
      var cr = Math.cos(e.roll), sr = Math.sin(e.roll);
      var ux2 = ux * cr + sx * sr, uy2 = uy * cr + sy * sr, uz2 = uz * cr + sz * sr;
      sx = sx * cr - ux * sr; sy = sy * cr - uy * sr; sz = sz * cr - uz * sr;
      ux = ux2; uy = uy2; uz = uz2;
    }
    // normal to the projected body axis
    var an = Math.hypot(fx, fy);
    var nx = an > 1e-4 ? -fy / an : 0, ny = an > 1e-4 ? fx / an : 1;

    var i, maxE = 0, cU = null, tail = null;
    for (i = 0; i < n; i++) {
      var P = prof[i];
      var along = (0.5 - 0.8 * P.t) * l;
      var wave = Math.sin(e.ph - 2.5 * P.t) * amp * 0.12 * P.t * P.t * l; // body flexes towards the tail
      var cx = e.x + fx * along + sx * wave, cy = e.y + fy * along + sy * wave, cz = e.z + fz * along + sz * wave;
      var k = scaleAt(cz);
      var scx = W / 2 + (cx - W / 2) * k, scy = H / 2 + (cy - H / 2) * k;
      // projected cross-section ellipse axes; its extreme point across the body axis
      var Ux = ux * P.h * l * k, Uy = uy * P.h * l * k, Sx = sx * P.w * l * k, Sy = sy * P.w * l * k;
      var un = Ux * nx + Uy * ny, sn = Sx * nx + Sy * ny, ee = Math.sqrt(un * un + sn * sn) || 1e-6;
      var ex = (Ux * un + Sx * sn) / ee, ey = (Uy * un + Sy * sn) / ee;
      top[i] = [scx + ex, scy + ey]; bot[i] = [scx - ex, scy - ey];
      if (ee > maxE) { maxE = ee; cU = [Ux, Uy, Sx, Sy, scx, scy]; }
      if (i === n - 1) tail = [cx, cy, cz];
    }

    var body = top.slice(0, n).concat(bot.slice(0, n).reverse());
    var area = signedArea(body);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.beginPath();
    addPoly(body, area);

    // caudal fin: vertical, swinging side to side around the tail base
    var bend = Math.sin(e.ph - 2.5) * amp;
    var cb = Math.cos(bend), sb = Math.sin(bend);
    var dxv = -fx * cb + sx * sb, dyv = -fy * cb + sy * sb, dzv = -fz * cb + sz * sb;
    addPoly(spec.caudal.map(function (p) {
      return project(tail[0] + (dxv * p[0] + ux * p[1]) * l, tail[1] + (dyv * p[0] + uy * p[1]) * l, tail[2] + (dzv * p[0] + uz * p[1]) * l);
    }), area);
    // other fins, fixed to the body
    spec.fins.forEach(function (fin) {
      addPoly(fin.map(function (p) {
        return project(e.x + (fx * p[0] + ux * p[1] + sx * p[2]) * l, e.y + (fy * p[0] + uy * p[1] + sy * p[2]) * l, e.z + (fz * p[0] + uz * p[1] + sz * p[2]) * l);
      }), area);
    });

    // deepest cross-section, so a body seen head-on is still a full oval
    var det = cU[0] * cU[3] - cU[1] * cU[2];
    if (Math.abs(det) > 1e-3) {
      ctx.setTransform(dpr * cU[0], dpr * cU[1], dpr * cU[2], dpr * cU[3], dpr * cU[4], dpr * cU[5]);
      ctx.moveTo(1, 0);
      ctx.arc(0, 0, 1, 0, 2 * Math.PI, (det > 0) !== (area > 0));
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // fainter with distance; a faint flash when the flank faces the viewer
    var depth = clamp(1 - e.z / ZD, 0, 1);
    ctx.globalAlpha = Math.min(1, alpha * (0.35 + 0.65 * depth) * (0.75 + 0.45 * Math.abs(sz)));
    ctx.fill();
  }

  var list = [];
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    list.length = 0;
    for (var i = 0; i < fish.length; i++) if (!fish[i].dead) list.push(fish[i]);
    if (shark.active) list.push(shark);
    if (hammer.active) list.push(hammer);
    list.sort(function (a, b) { return b.z - a.z; }); // far first
    for (i = 0; i < list.length; i++) {
      var e = list[i];
      if (e === hammer) {
        ctx.fillStyle = sharkFill;
        drawBody(e, e.len, HAMMER, 0.25, baseAlpha);
      } else if (e === shark) {
        ctx.fillStyle = sharkFill;
        drawBody(e, e.len, SHARK, e.amp || 0.3, baseAlpha * 1.15);
      } else {
        ctx.fillStyle = fishFill;
        drawBody(e, L * e.size, FISH, e.bt > 0 ? 0.45 : 0.1 + 0.15 * Math.min(1, e.s / (2 * L)), baseAlpha);
      }
    }
    ctx.globalAlpha = 1;
  }

  function step(dt) { stepSchool(dt); stepShark(dt); stepHammer(dt); stepFish(dt); }

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
    cv.id = 'fish-bg';
    cv.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor();
    resize();
    init();
    // let the school settle before it is first seen
    for (var k = 0; k < 150; k++) { stepSchool(1 / 30); stepFish(1 / 30); }
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
