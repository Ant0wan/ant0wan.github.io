/* The periodic table page: the 118 elements laid out in the eighteen-column
   form, each cell drawn like the element cells of the Chemistry background
   (a thin square, atomic number at the top left, the symbol, the name, the
   atomic weight), plus the electronegativity and the outer electron
   configuration. The empty gap above the d block holds a large cell and every
   property of the element under the pointer; a click opens the element's page. The table can
   be shaded by a property, and rolled back to the elements known in a year.
   Data: elements.js. */
(function () {
  var E = window.PERIODIC_ELEMENTS, grid = document.getElementById('pt');
  if (!E || !grid) return;

  var P = window.Periodic, sup = P.sup;
  function outer(conf) { // the configuration outside the noble-gas core, short enough for a cell
    var parts = conf.replace(/^\[\w+\] /, '').split(' ');
    if (parts.length > 2 && /f14$/.test(parts[0])) parts.shift();
    return parts.join(' ');
  }
  var CAT_VAR = { 'alkali metal': 'alkali', 'alkaline earth metal': 'alkaline', 'transition metal': 'transition',
    'post-transition metal': 'post', 'metalloid': 'metalloid', 'nonmetal': 'nonmetal', 'halogen': 'halogen',
    'noble gas': 'noble', 'lanthanide': 'lanthanide', 'actinide': 'actinide' };
  var CATS = Object.keys(CAT_VAR);
  function tint(v, pc) { return 'color-mix(in srgb, var(' + v + ') ' + pc + '%, transparent)'; }

  /* ---------------- building the table ---------------- */

  function div(cls, html, style) { var d = document.createElement('div'); d.className = cls; if (html != null) d.innerHTML = html; if (style) d.setAttribute('style', style); return d; }
  for (var g = 1; g <= 18; g++) grid.appendChild(div('gh', String(g), 'grid-row:1;grid-column:' + (g + 1)));
  for (var p = 1; p <= 7; p++) grid.appendChild(div('ph', String(p), 'grid-row:' + (p + 1) + ';grid-column:1'));
  grid.appendChild(div('ref', '57–71', 'grid-row:7;grid-column:4'));
  grid.appendChild(div('ref', '89–103', 'grid-row:8;grid-column:4'));
  grid.appendChild(div('fl', 'Lanthanides', 'grid-row:10'));
  grid.appendChild(div('fl', 'Actinides', 'grid-row:11'));
  var panel = div('pt-panel'); grid.appendChild(panel);

  E.forEach(function (e) {
    var b = document.createElement('a');
    b.href = 'element.html?z=' + e.z; b.className = 'el';
    b.style.gridRow = e.row; b.style.gridColumn = e.col;
    b.setAttribute('aria-label', e.name + ', atomic number ' + e.z);
    b.innerHTML = '<span class="z">' + e.z + '</span><span class="en">' + (e.en || '') + '</span><span class="sym">' + e.sym +
      '</span><span class="nm">' + e.name + '</span><span class="ms">' + e.mass + '</span><span class="cf">' + sup(outer(e.conf)) + '</span>';
    b.addEventListener('mouseenter', function () { show(e); });
    b.addEventListener('focus', function () { show(e); });
    e.btn = b; grid.appendChild(b);
  });
  grid.addEventListener('mouseleave', function () { show(pinned); });

  /* ---------------- the detail panel ---------------- */

  var pinned = null, shown;
  function mark() { E.forEach(function (e) { e.btn.classList.toggle('pin', e === pinned); }); }
  var bigCell = P.bigCell;
  function show(e) {
    if (e === shown) return;
    shown = e;
    E.forEach(function (x) { x.btn.classList.toggle('on', x === e); });
    if (!e) {
      panel.innerHTML = '<div class="big key">' + bigCell('<i>Z</i>', 'X', 'name', 'atomic weight') + '</div>' +
        '<div class="key-notes"><b>Top left</b>, the atomic number <i>Z</i>; <b>top right</b>, the Pauling electronegativity. ' +
        'In the middle, the <b>symbol</b>, the <b>name</b> and the standard <b>atomic weight</b> (in brackets, the mass number of the longest-lived isotope). ' +
        '<b>At the bottom</b>, the outer electron configuration, beyond the noble-gas core.<br><br>' +
        'Hover an element to see all its properties and who discovered it; click it to open its page and explore its orbitals.</div>';
      return;
    }
    panel.innerHTML = '<div class="big">' + bigCell(e.z, e.sym, e.name, e.mass, fill(e)) + '<div class="by">' + P.discovered(e) + '</div></div>' +
      '<dl class="props">' + P.props(e) + '</dl>';
  }

  /* ---------------- shading, isolating a category, rolling back time ---------------- */

  var shadeSel = document.getElementById('shade'), yearIn = document.getElementById('year'),
      yearOut = document.getElementById('year-out'), legend = document.getElementById('legend'), iso = null;
  var NUM = { en: ['Electronegativity', ''], ie: ['First ionisation energy', ' kJ/mol'], mp: ['Melting point', ' K'],
              bp: ['Boiling point', ' K'], rho: ['Density', ' g/cm³'], year: ['Year of discovery', ''] };
  var range = {};
  Object.keys(NUM).forEach(function (k) {
    var vs = E.map(function (e) { return e.v[k]; }).filter(function (v) { return v !== null; });
    if (k === 'year') vs = vs.filter(function (v) { return v > 0; });
    range[k] = [Math.min.apply(null, vs), Math.max.apply(null, vs)];
  });
  function fill(e) {
    var m = shadeSel.value;
    if (m === 'cat') return tint('--k-' + CAT_VAR[e.cat], 30);
    if (m === 'block') return tint('--b-' + e.block, 26);
    if (m === 'state') return e.state === 'unknown' ? '' : tint('--st-' + e.state, 30);
    if (NUM[m]) {
      var v = e.v[m]; if (v === null) return '';
      var r = range[m], t = m === 'year' ? (v === 0 ? 1 : 1 - (v - r[0]) / (r[1] - r[0])) : (v - r[0]) / (r[1] - r[0]);
      return 'color-mix(in srgb, var(--ink) ' + (3 + 45 * Math.max(0, Math.min(1, t))).toFixed(1) + '%, transparent)';
    }
    return '';
  }
  function drawLegend() {
    var m = shadeSel.value, h = '';
    function sw(v, label, cls, data) { return '<button type="button" class="' + (cls || '') + '"' + (data ? ' data-cat="' + data + '"' : '') + '><span class="sw" style="background:' + tint(v, 30) + '"></span>' + label + '</button>'; }
    if (m === 'cat') h = CATS.map(function (c) { return sw('--k-' + CAT_VAR[c], c, iso && iso !== c ? 'off' : '', c); }).join('');
    else if (m === 'block') h = ['s', 'p', 'd', 'f'].map(function (b) { return sw('--b-' + b, b + ' block'); }).join('');
    else if (m === 'state') h = ['solid', 'liquid', 'gas'].map(function (s) { return sw('--st-' + s, s); }).join('') + '<span>blank: not known</span>';
    else if (NUM[m]) {
      var r = range[m], lo = r[0], hi = r[1];
      if (m === 'year') h = '<span>antiquity</span><span class="ramp" style="transform:scaleX(-1)"></span><span>' + hi + '</span>';
      else h = '<span>' + lo + NUM[m][1] + '</span><span class="ramp"></span><span>' + hi + NUM[m][1] + '</span><span>blank: not known</span>';
    } else h = '<span>Choose a property under <i>Shade by</i> to colour the table.</span>';
    legend.innerHTML = h;
  }
  legend.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-cat]'); if (!b) return;
    iso = iso === b.dataset.cat ? null : b.dataset.cat; apply();
  });
  function apply() {
    var y = +yearIn.value;
    yearOut.textContent = y >= 2026 ? 'today' : y <= 1200 ? 'antiquity' : y;
    var m = shadeSel.value; if (m !== 'cat') iso = null;
    E.forEach(function (e) {
      var f = fill(e); e.btn.style.setProperty('--fill', f || 'transparent');
      e.btn.classList.toggle('future', y < 2026 && (e.year === null || e.year > y));
      e.btn.classList.toggle('dim', !!iso && e.cat !== iso);
    });
    var known = E.filter(function (e) { return e.year !== null && e.year <= y; }).length;
    if (y < 2026) yearOut.textContent += ' · ' + known + ' elements';
    drawLegend();
    var s = shown; shown = false; show(s || null);
  }
  shadeSel.addEventListener('change', apply);
  yearIn.addEventListener('input', apply);
  // ?el=Fe (or ?el=26) pins an element, ?shade=cat shades the table on arrival
  var qs = new URLSearchParams(location.search), qe = qs.get('el'), qm = qs.get('shade');
  if (qm && shadeSel.querySelector('option[value="' + qm.replace(/\W/g, '') + '"]')) shadeSel.value = qm;
  if (qe) pinned = E.filter(function (e) { return e.sym.toLowerCase() === qe.toLowerCase() || String(e.z) === qe; })[0] || null;
  mark();
  apply();
  if (pinned) show(pinned);
})();
