/* Faint background for the Chemistry page: hydrogen atomic orbitals, drawn as
   clouds of stippled points like the probability densities of a quantum
   mechanics textbook.
   - Each cloud is sampled from |ψ(n, ℓ, m)|², the probability density of the
     electron in a hydrogen orbital, picked at random among all 55 orbitals up to
     n = 5 (s, p, d, f, g, real forms; ψ built from Laguerre polynomials and
     spherical harmonics), by rejection sampling when the orbital appears. The
     density is raised to a small power (except for s) so the lobes stand out.
     Under each cloud, its name (2p_x, 3d_z², 4f_xyz…) and its quantum numbers. The two
     phases of the wavefunction are told apart by the tone of the points: the
     lobes where ψ > 0 are a little darker than those where ψ < 0.
   - One orbital at a time, in a margin beside the text, turning slowly in 3D.
     It condenses, stays about twenty seconds, fades away, and after a short
     pause the next one, picked at random, appears in the other margin.
   - At the same time, in the opposite margin, a chemical formula appears with
     its kind (element, molecule, strong or weak acid or base, oxide, cation,
     anion, salt…),
     name and molar mass, as in a reference table (NH₄⁺ ammonium,
     CaCO₃ calcium carbonate, C₆H₁₂O₆ glucose…), picked
     at random among some 160 elements, molecules, acids, bases, ions and salts, and fades away with the orbital.
   Very faint, no pointer events, paused in hidden tabs, a still frame for
   visitors who prefer reduced motion. Add ?orbitals=debug to see it clearly. */
(function () {
  if (window.__orbitalsBg) return;
  window.__orbitalsBg = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var debug = /[?&]orbitals=debug/.test(location.search);
  var cv, ctx, W = 0, H = 0, dpr = 1, time = 0;
  var ink = '#3a3833', baseAlpha = 0.2;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function readColor() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ink = dark ? '#d8d5ca' : '#3a3833';
    baseAlpha = debug ? 1 : dark ? 0.2 : 0.22;
  }

  /* ---------------- hydrogen orbitals (atomic units, unnormalised) ---------------- */

  // every hydrogen orbital up to n = 5 (55 of them), real forms: ψ = R(n, l) · Y(l, m)
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
  var ORBITALS = [];
  for (var n = 1; n <= 5; n++) for (var l = 0; l < n; l++) for (var m = -l; m <= l; m++) (function (n, l, m) {
    var sub = NAMES[l] ? NAMES[l][m] : 'm=' + (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m);
    ORBITALS.push({ n: n, l: l, m: m, label: n + 'spdfg'[l], sub: sub, L: n * (2.2 * n + 2.5),
      f: function (x, y, z, r) {
        var rho = 2 * r / n, R = Math.pow(rho, l) * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho);
        var ct = r > 0 ? z / r : 1, ph = Math.atan2(y, x), am = Math.abs(m);
        var Y = legendre(l, am, ct) * (m > 0 ? Math.cos(am * ph) : m < 0 ? Math.sin(am * ph) : 1);
        return R * Y;
      } });
  })(n, l, m);
  var N_POINTS = 4200, SHARP = 1.6;   // density raised to a power: the lobes stand out more clearly
  // rejection sampling of |ψ|² in a cube of half-side L, done a little at each frame so that a new
  // cloud condenses point by point and no frame is held up, even for the sparse n = 5 orbitals
  function sampler(o) {
    var L = o.L, max = 0, rw = [], i, x, y, z, r, v, d;
    for (i = 0; i < 12000; i++) {
      x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z); v = o.f(x, y, z, r);
      d = Math.pow(v * v, o.l ? SHARP : 1); max = Math.max(max, d); rw.push([r, d]);
    }
    // scale on the dense part of the cloud: the radius holding 90 % of the (weighted) density
    rw.sort(function (a, b) { return a[0] - b[0]; });
    var tot = rw.reduce(function (s, q) { return s + q[1]; }, 0), acc = 0, scale = L;
    for (i = 0; i < rw.length; i++) { acc += rw[i][1]; if (acc >= tot * .9) { scale = rw[i][0]; break; } }
    return { o: o, max: max * 1.15, pts: [], scale: scale || L, tries: 0 };
  }
  // rejection sampling, a little at each frame: a new cloud condenses point by point, and no frame is
  // held up, even for the sparse n = 5 orbitals
  function grow(S, ms) {
    var o = S.o, L = o.L, t0 = performance.now(), x, y, z, r, v;
    while (S.pts.length < N_POINTS && S.tries < 4e6 && performance.now() - t0 < ms) {
      for (var k = 0; k < 400; k++) {
        S.tries++;
        x = rnd(-L, L); y = rnd(-L, L); z = rnd(-L, L); r = Math.hypot(x, y, z); v = o.f(x, y, z, r);
        if (Math.random() * S.max < Math.pow(v * v, o.l ? SHARP : 1)) S.pts.push([x / S.scale, y / S.scale, z / S.scale, v >= 0 ? 1 : 0]);
      }
    }
  }

  /* ---------------- the three clouds ---------------- */

  var LIFE = 24, FADE = 3.5, GAP = 2.5, slots = [];
  function pick(exclude) {
    var o; do { o = ORBITALS[Math.floor(Math.random() * ORBITALS.length)]; } while (exclude.indexOf(o) >= 0);
    return o;
  }
  function newCloud(slot, t0) {
    var used = slots.map(function (s) { return s.cloud && s.cloud.o; });
    var o = pick(used);
    var S = sampler(o); grow(S, 25);
    var prevC = slots[0] && slots[0].cloud ? slots[0].cloud.cmp : null;
    return { o: o, cmp: pickCompound(prevC), S: S, pts: S.pts, t0: t0, life: LIFE + rnd(-4, 6), spin: rnd(.1, .22) * (Math.random() < .5 ? -1 : 1), tilt: rnd(.3, .9), ph: rnd(0, 6.283) };
  }
  function places() { // the two places an orbital can appear: the left margin or the right one
    var m = document.querySelector('main'), r = m ? m.getBoundingClientRect() : { left: W * .25, right: W * .75 };
    var lw = r.left, rw = W - r.right, sz = function (w) { return Math.max(60, Math.min(w * .38, H * .2)); };
    return [
      { x: lw / 2, y: H * .36, s: sz(lw), w: lw },
      { x: r.right + rw / 2, y: H * .56, s: sz(rw), w: rw }
    ];
  }

  var FONT = "'Latin Modern Roman', 'CMU Serif', 'STIX Two Text', Georgia, serif";

  /* ---------------- chemical formulas, shown with each orbital in the other margin ---------------- */

  // formula: digits after a symbol or a bracket become subscripts, ^… is the charge
  var COMPOUNDS = [
    ['H2O', 'water'], ['CO2', 'carbon dioxide'], ['CH4', 'methane'], ['NH3', 'ammonia'], ['NH4^+', 'ammonium'],
    ['CaCO3', 'calcium carbonate'], ['NaCl', 'sodium chloride'], ['H2SO4', 'sulfuric acid'], ['HNO3', 'nitric acid'],
    ['HCl', 'hydrochloric acid'], ['NaOH', 'sodium hydroxide'], ['C6H12O6', 'glucose'], ['C2H5OH', 'ethanol'],
    ['CH3COOH', 'acetic acid'], ['C6H6', 'benzene'], ['O3', 'ozone'], ['H2O2', 'hydrogen peroxide'],
    ['NaHCO3', 'sodium bicarbonate'], ['KMnO4', 'potassium permanganate'], ['CuSO4·5H2O', 'copper sulfate pentahydrate'],
    ['Fe2O3', 'iron(III) oxide'], ['Fe3O4', 'magnetite'], ['SiO2', 'silicon dioxide'], ['CaSO4·2H2O', 'gypsum'],
    ['PO4^3-', 'phosphate'], ['SO4^2-', 'sulfate'], ['NO3^-', 'nitrate'], ['CO3^2-', 'carbonate'], ['OH^-', 'hydroxide'],
    ['H3O^+', 'hydronium'], ['SO2', 'sulfur dioxide'], ['N2O', 'nitrous oxide'], ['NO2', 'nitrogen dioxide'],
    ['CO', 'carbon monoxide'], ['CH3OH', 'methanol'], ['(CH3)2CO', 'acetone'], ['CO(NH2)2', 'urea'],
    ['C8H10N4O2', 'caffeine'], ['C9H8O4', 'aspirin'], ['C12H22O11', 'sucrose'], ['C2H4', 'ethylene'],
    ['C2H2', 'acetylene'], ['C3H8', 'propane'], ['C8H18', 'octane'], ['CH2O', 'formaldehyde'],
    ['NH4NO3', 'ammonium nitrate'], ['Ca(OH)2', 'calcium hydroxide'], ['CaO', 'quicklime'], ['MgSO4', 'magnesium sulfate'],
    ['KNO3', 'potassium nitrate'], ['Na2CO3', 'sodium carbonate'], ['AgNO3', 'silver nitrate'], ['H3PO4', 'phosphoric acid'],
    ['HF', 'hydrofluoric acid'], ['CHCl3', 'chloroform'], ['N2', 'nitrogen'], ['O2', 'oxygen'], ['Al2O3', 'alumina'],
    ['TiO2', 'titanium dioxide'], ['NaClO', 'sodium hypochlorite'], ['C10H8', 'naphthalene'], ['C6H5OH', 'phenol'],
    ['HCOOH', 'formic acid'], ['C3H5(OH)3', 'glycerol'], ['Mg(OH)2', 'magnesium hydroxide'], ['BaSO4', 'barium sulfate'],
    // acids
    ['HBr', 'hydrobromic acid'], ['HI', 'hydroiodic acid'], ['HClO4', 'perchloric acid'], ['HClO', 'hypochlorous acid'],
    ['H2CO3', 'carbonic acid'], ['H2SO3', 'sulfurous acid'], ['HNO2', 'nitrous acid'], ['HCN', 'hydrocyanic acid'],
    ['H3BO3', 'boric acid'], ['H2C2O4', 'oxalic acid'], ['C6H8O7', 'citric acid'], ['C3H6O3', 'lactic acid'],
    ['C6H5COOH', 'benzoic acid'], ['C6H8O6', 'ascorbic acid (vitamin C)'],
    // bases
    ['KOH', 'potassium hydroxide'], ['LiOH', 'lithium hydroxide'], ['Ba(OH)2', 'barium hydroxide'], ['CsOH', 'caesium hydroxide'],
    ['Al(OH)3', 'aluminium hydroxide'], ['Fe(OH)3', 'iron(III) hydroxide'], ['Cu(OH)2', 'copper(II) hydroxide'],
    ['Zn(OH)2', 'zinc hydroxide'], ['CH3NH2', 'methylamine'], ['C5H5N', 'pyridine'], ['C6H5NH2', 'aniline'],
    // cations
    ['H^+', 'hydrogen ion (proton)'], ['Li^+', 'lithium ion'], ['Na^+', 'sodium ion'], ['K^+', 'potassium ion'], ['Ag^+', 'silver ion'],
    ['Mg^2+', 'magnesium ion'], ['Ca^2+', 'calcium ion'], ['Ba^2+', 'barium ion'], ['Zn^2+', 'zinc ion'], ['Cu^2+', 'copper(II) ion'],
    ['Fe^2+', 'iron(II) ion'], ['Fe^3+', 'iron(III) ion'], ['Al^3+', 'aluminium ion'], ['Pb^2+', 'lead(II) ion'],
    // anions
    ['F^-', 'fluoride'], ['Cl^-', 'chloride'], ['Br^-', 'bromide'], ['I^-', 'iodide'], ['O^2-', 'oxide'], ['S^2-', 'sulfide'],
    ['O2^2-', 'peroxide'], ['CN^-', 'cyanide'], ['SCN^-', 'thiocyanate'], ['HCO3^-', 'hydrogen carbonate'], ['HSO4^-', 'hydrogen sulfate'],
    ['SO3^2-', 'sulfite'], ['S2O3^2-', 'thiosulfate'], ['NO2^-', 'nitrite'], ['ClO^-', 'hypochlorite'], ['ClO3^-', 'chlorate'],
    ['ClO4^-', 'perchlorate'], ['MnO4^-', 'permanganate'], ['CrO4^2-', 'chromate'], ['Cr2O7^2-', 'dichromate'],
    ['CH3COO^-', 'acetate'], ['C2O4^2-', 'oxalate'], ['HPO4^2-', 'hydrogen phosphate'], ['H2PO4^-', 'dihydrogen phosphate'],
    ['SiO3^2-', 'silicate'],
    // salts
    ['KCl', 'potassium chloride'], ['CaCl2', 'calcium chloride'], ['MgCl2', 'magnesium chloride'], ['BaCl2', 'barium chloride'],
    ['NaBr', 'sodium bromide'], ['KI', 'potassium iodide'], ['NaF', 'sodium fluoride'], ['CaF2', 'calcium fluoride (fluorite)'],
    ['Na2SO4', 'sodium sulfate'], ['K2SO4', 'potassium sulfate'], ['(NH4)2SO4', 'ammonium sulfate'], ['NH4Cl', 'ammonium chloride'],
    ['Na3PO4', 'trisodium phosphate'], ['Ca3(PO4)2', 'calcium phosphate'], ['FeSO4', 'iron(II) sulfate'], ['FeCl3', 'iron(III) chloride'],
    ['ZnSO4', 'zinc sulfate'], ['ZnCl2', 'zinc chloride'], ['CuCl2', 'copper(II) chloride'], ['AgCl', 'silver chloride'],
    ['PbI2', 'lead(II) iodide'], ['K2Cr2O7', 'potassium dichromate'], ['KClO3', 'potassium chlorate'], ['NaNO2', 'sodium nitrite'],
    ['Na2S2O3', 'sodium thiosulfate'], ['CH3COONa', 'sodium acetate'], ['Li2CO3', 'lithium carbonate'], ['MgCO3', 'magnesium carbonate'],
    ['KAl(SO4)2·12H2O', 'potassium alum'], ['CaC2O4', 'calcium oxalate'], ['NaCN', 'sodium cyanide'], ['KSCN', 'potassium thiocyanate'],
    ['Na2SiO3', 'sodium silicate'], ['FeS2', 'iron disulfide (pyrite)']
  ];
  function tokens(f) { // [[text, 0 normal | 1 subscript | 2 superscript]]
    var out = [], i = 0, buf = '', mode = 0;
    function flush() { if (buf) out.push([buf, mode]); buf = ''; }
    while (i < f.length) {
      var ch = f[i];
      if (ch === '^') { flush(); mode = 2; i++; continue; }
      if (mode === 2) { buf += ch === '-' ? '−' : ch; i++; continue; }
      var isDigit = ch >= '0' && ch <= '9', prev = f[i - 1] || '';
      var sub = isDigit && (/[A-Za-z)]/.test(prev) || (mode === 1));
      if (sub && mode !== 1) { flush(); mode = 1; }
      if (!sub && mode === 1) { flush(); mode = 0; }
      buf += ch; i++;
    }
    flush();
    return out;
  }
  // what kind of species it is, shown above the formula
  var KIND = {
    'N2': 'element', 'O2': 'element', 'O3': 'element · allotrope of oxygen',
    'NH3': 'weak base', 'CH3NH2': 'organic base · weak', 'C5H5N': 'organic base · weak', 'C6H5NH2': 'organic base · weak',
    'Al(OH)3': 'amphoteric hydroxide', 'Zn(OH)2': 'amphoteric hydroxide',
    'Fe2O3': 'oxide', 'Fe3O4': 'oxide · mineral', 'SiO2': 'oxide', 'CaO': 'oxide', 'Al2O3': 'oxide', 'TiO2': 'oxide',
    'CaCO3': 'salt', 'NaCl': 'salt', 'NaHCO3': 'salt', 'KMnO4': 'salt', 'NH4NO3': 'salt', 'MgSO4': 'salt', 'KNO3': 'salt',
    'Na2CO3': 'salt', 'AgNO3': 'salt', 'BaSO4': 'salt', 'NaClO': 'salt', 'FeS2': 'mineral'
  };
  var STRONG_ACIDS = ['HCl', 'HBr', 'HI', 'HNO3', 'H2SO4', 'HClO4'], STRONG_BASES = ['NaOH', 'KOH', 'LiOH', 'CsOH', 'Ba(OH)2', 'Ca(OH)2'];
  var SALTS_FROM = 'KCl';   // every entry from here to the end of the list is a salt
  function carbon(f) { return /C(?![a-z])/.test(f); }   // C, but not Cl, Ca, Cu, Cr, Cs
  function kind(c) {
    var f = c[0];
    if (KIND[f]) return KIND[f];
    if (/\^.*\+/.test(f)) return /^[A-Z][a-z]?\^/.test(f) ? 'cation' : 'polyatomic cation';
    if (/\^.*-/.test(f)) return /^[A-Z][a-z]?\^/.test(f) ? 'anion' : 'polyatomic anion';
    if (COMPOUNDS.indexOf(c) >= COMPOUNDS.findIndex(function (q) { return q[0] === SALTS_FROM; })) return f.indexOf('·') > 0 ? 'salt · hydrate' : 'salt';
    if (f.indexOf('·') > 0) return 'salt · hydrate';
    if (/acid/.test(c[1])) return STRONG_ACIDS.indexOf(f) >= 0 ? 'strong acid' : carbon(f) && f !== 'HCN' && f !== 'H2CO3' ? 'organic acid · weak' : 'weak acid';
    if (/hydroxide/.test(c[1])) return STRONG_BASES.indexOf(f) >= 0 ? 'strong base' : 'weak base';
    if (carbon(f) && /H/.test(f)) return 'organic molecule';
    return 'molecule';
  }
  function pickCompound(prev) { var c; do { c = COMPOUNDS[Math.floor(Math.random() * COMPOUNDS.length)]; } while (c === prev); return c; }
  // molar mass from the formula: brackets, hydrates (·5H2O), the charge ignored
  var MASS = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974,
               S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Ti: 47.867, Mn: 54.938, Fe: 55.845, Cu: 63.546, Ag: 107.868, Ba: 137.327,
               Li: 6.94, B: 10.81, Cs: 132.905, Cr: 51.996, Zn: 65.38, Br: 79.904, I: 126.904, Pb: 207.2 };
  function molarMass(f) {
    f = f.split('^')[0];
    return f.split('·').reduce(function (sum, part) {
      var coef = 1, m = /^(\d+)(.*)$/.exec(part); if (m) { coef = +m[1]; part = m[2]; }
      var i = 0;
      function group() {
        var t = 0;
        while (i < part.length && part[i] !== ')') {
          var v;
          if (part[i] === '(') { i++; v = group(); i++; }
          else { var e = /^[A-Z][a-z]?/.exec(part.slice(i))[0]; i += e.length; v = MASS[e] || 0; }
          var n = /^\d+/.exec(part.slice(i)); if (n) { i += n[0].length; v *= +n[0]; }
          t += v;
        }
        return t;
      }
      return sum + coef * group();
    }, 0);
  }
  function drawTokens(tk, cx, y, fs, italic) { // a line of normal / subscript / superscript pieces, centred on cx
    var w = 0, st = (italic ? 'italic ' : '');
    function font(m) { return st + (m ? fs * .66 : fs) + 'px ' + FONT; }
    tk.forEach(function (t) { ctx.font = font(t[1]); t.w = ctx.measureText(t[0]).width; w += t.w; });
    var x = cx - w / 2;
    tk.forEach(function (t) { ctx.font = font(t[1]); ctx.fillText(t[0], x, y + (t[1] === 1 ? fs * .24 : t[1] === 2 ? -fs * .4 : 0)); x += t.w; });
  }
  function drawFormula(cmp, p, a) { // as in a reference table: formula, name, molar mass
    var fs = Math.max(15, Math.min(22, p.w * .055)), y = p.y;
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = (fs * .46) + 'px ' + FONT; ctx.textAlign = 'center'; if ('letterSpacing' in ctx) ctx.letterSpacing = (fs * .12) + 'px';
    ctx.fillText(kind(cmp).toUpperCase(), p.x, y - fs * 1.05); if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
    drawTokens(tokens(cmp[0]), p.x, y, fs, false);
    ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText(cmp[1], p.x, y + fs * 1.25);
    ctx.textAlign = 'left';
    drawTokens([['M = ' + molarMass(cmp[0]).toFixed(2) + ' g·mol', 0], ['−1', 2]], p.x, y + fs * 2.2, fs * .58, true);
  }

  function drawLabel(o, p, a) { // the name under the cloud, e.g. 3d with xz as a subscript, and its quantum numbers
    var fs = Math.max(12, Math.min(20, p.s * .16)), y = p.y + p.s * 1.12 + fs;
    ctx.globalAlpha = Math.min(1, a * 2.2); ctx.fillStyle = ink; ctx.textBaseline = 'alphabetic';
    ctx.font = fs + 'px ' + FONT; var w1 = ctx.measureText(o.label).width;
    ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; var w2 = o.sub ? ctx.measureText(o.sub).width + 2 : 0;
    var x = p.x - (w1 + w2) / 2;
    ctx.textAlign = 'left'; ctx.font = fs + 'px ' + FONT; ctx.fillText(o.label, x, y);
    if (o.sub) { ctx.font = 'italic ' + (fs * .7) + 'px ' + FONT; ctx.fillText(o.sub, x + w1 + 1, y + fs * .3); }
    ctx.font = 'italic ' + (fs * .62) + 'px ' + FONT; ctx.textAlign = 'center';
    ctx.fillText('n = ' + o.n + ',  ℓ = ' + o.l + ',  m = ' + (o.m < 0 ? '−' + (-o.m) : o.m), p.x, y + fs * 1.15);
  }
  function drawCloud(c, p, a) {
    var cy = Math.cos(c.ph + time * c.spin), sy = Math.sin(c.ph + time * c.spin), ct = Math.cos(c.tilt), st = Math.sin(c.tilt);
    var light = a * .55;
    ctx.fillStyle = ink;
    for (var k = 0; k < 2; k++) {                       // the two phases, in two passes
      ctx.globalAlpha = k ? a : light;
      for (var i = 0; i < c.pts.length; i++) {
        var q = c.pts[i]; if (q[3] !== k) continue;
        var x = q[0] * cy + q[1] * sy, y0 = -q[0] * sy + q[1] * cy, z = q[2];
        var y = z * ct - y0 * st, d = z * st + y0 * ct;   // tilt towards the viewer; d is depth
        var px = p.x + x * p.s, py = p.y - y * p.s, sz = .9 + .4 * d;
        ctx.fillRect(px, py, sz, sz);
      }
    }
    // the nucleus
    ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
    drawLabel(c.o, p, a);
  }

  /* ---------------- frame ---------------- */

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var P = places();
    slots.forEach(function (s) { if (s.cloud.S.pts.length < N_POINTS) grow(s.cloud.S, reduce ? 400 : 5); });
    slots.forEach(function (s) {
      var c = s.cloud, age = time - c.t0;
      if (!reduce && age > c.life) {             // gone: after a short empty pause, the next one, in the other margin
        s.side = 1 - s.side; s.cloud = newCloud(s, time + GAP); c = s.cloud; age = time - c.t0;
      }
      var k = Math.min(1, age / FADE, (c.life - age) / FADE);
      if (reduce) k = 1;
      if (k > 0) { drawCloud(c, P[s.side], baseAlpha * k); drawFormula(c.cmp, P[1 - s.side], baseAlpha * k); }
    });
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
    cv.id = 'orbitals-bg';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
    document.body.insertBefore(cv, document.body.firstChild);
    ctx = cv.getContext('2d');
    if (!ctx) return;
    readColor(); resize();
    // two different orbitals to start with, half a life apart so they never change together
    slots.push({ side: Math.random() < .5 ? 0 : 1 }); slots[0].cloud = newCloud(slots[0], 0); slots[0].cloud.t0 = -FADE;   // one orbital at a time
    window.addEventListener('resize', function () { resize(); if (reduce) draw(); });
    window.addEventListener('themechange', function () { readColor(); if (reduce) draw(); });
    document.addEventListener('visibilitychange', function () { last = 0; });
    if (reduce) draw();
    else requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
