/* Hydrogen atomic orbitals, shared by the Chemistry background (orbitals.js) and
   the element pages (element.js). Atomic units, unnormalised, real forms:
   ψ(n, ℓ, m) = R(n, ℓ) · Y(ℓ, m), R built from generalised Laguerre polynomials,
   Y from associated Legendre functions. Clouds are drawn as points sampled from
   |ψ|^(2·sharp) by rejection sampling (sharp > 1 makes the lobes stand out). */
window.Hydrogen = (function () {
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function laguerre(k, al, x) { // generalised Laguerre polynomial L_k^al(x)
    if (k === 0) return 1;
    var a = 1, b = 1 + al - x;
    for (var j = 1; j < k; j++) { var c = ((2 * j + 1 + al - x) * b - (j + al) * a) / (j + 1); a = b; b = c; }
    return b;
  }
  function legendre(l, m, x) { // associated Legendre P_l^m(x), m >= 0
    var pmm = 1, sx = Math.sqrt(Math.max(0, 1 - x * x));
    for (var i = 1; i <= m; i++) pmm *= (2 * i - 1) * sx;
    if (l === m) return pmm;
    var p1 = x * (2 * m + 1) * pmm;
    if (l === m + 1) return p1;
    for (var ll = m + 2; ll <= l; ll++) { var p2 = ((2 * ll - 1) * x * p1 - (ll + m - 1) * pmm) / (ll - m); pmm = p1; p1 = p2; }
    return p1;
  }
  var NAMES = {
    0: { 0: '' },
    1: { 0: 'z', 1: 'x', '-1': 'y' },
    2: { 0: 'z²', 1: 'xz', '-1': 'yz', 2: 'x²−y²', '-2': 'xy' },
    3: { 0: 'z³', 1: 'xz²', '-1': 'yz²', 2: 'z(x²−y²)', '-2': 'xyz', 3: 'x(x²−3y²)', '-3': 'y(3x²−y²)' }
  };
  function radial(n, l, r) { var rho = 2 * r / n; return Math.pow(rho, l) * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho); }
  function orbital(n, l, m) {
    var sub = NAMES[l] ? NAMES[l][m] : 'm=' + (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m);
    return { n: n, l: l, m: m, label: n + 'spdfg'[l], sub: sub, L: n * (2.2 * n + 2.5),
      R: function (r) { return radial(n, l, r); },
      f: function (x, y, z, r) {
        var ct = r > 0 ? z / r : 1, ph = Math.atan2(y, x), am = Math.abs(m);
        var Y = legendre(l, am, ct) * (m > 0 ? Math.cos(am * ph) : m < 0 ? Math.sin(am * ph) : 1);
        return radial(n, l, r) * Y;
      } };
  }
  function weight(o, v, sharp) { return Math.pow(v * v, o.l ? sharp : 1); }
  // a sampler: estimates the maximum density and the radius holding 90 % of it (the scale of the cloud)
  function sampler(o, sharp) {
    var L = o.L, max = 0, rw = [], i, x, y, z, r, d;
    for (i = 0; i < 12000; i++) {
      x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z);
      d = weight(o, o.f(x, y, z, r), sharp); max = Math.max(max, d); rw.push([r, d]);
    }
    rw.sort(function (a, b) { return a[0] - b[0]; });
    var tot = rw.reduce(function (s, q) { return s + q[1]; }, 0), acc = 0, scale = L;
    for (i = 0; i < rw.length; i++) { acc += rw[i][1]; if (acc >= tot * .9) { scale = rw[i][0]; break; } }
    return { o: o, sharp: sharp, max: max * 1.15, pts: [], scale: scale || L, tries: 0 };
  }
  // rejection sampling for at most ms milliseconds: a cloud condenses point by point and no frame is held up
  // points are [x, y, z, phase (1 where ψ > 0)], in units of the cloud's scale
  function grow(S, ms, nMax) {
    var o = S.o, L = o.L, t0 = performance.now(), x, y, z, r, v;
    while (S.pts.length < nMax && S.tries < 4e6 && performance.now() - t0 < ms) {
      for (var k = 0; k < 400; k++) {
        S.tries++;
        x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z); v = o.f(x, y, z, r);
        if (Math.random() * S.max < weight(o, v, S.sharp)) S.pts.push([x / S.scale, y / S.scale, z / S.scale, v >= 0 ? 1 : 0]);
      }
    }
    return S.pts.length >= nMax || S.tries >= 4e6;
  }
  return { orbital: orbital, radial: radial, sampler: sampler, grow: grow, NAMES: NAMES };
})();
