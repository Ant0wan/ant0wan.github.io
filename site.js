/* Theme handling shared by all pages. The inline snippet in <head> sets the
   initial theme (no flash); this wires up the toggle and notifies charts. */
(function () {
  var root = document.documentElement;
  var btn = null;

  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function label() { if (btn) btn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); }
  function apply(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist) {
      try { localStorage.setItem('theme', t); } catch (e) {}
      // fallback that survives page changes in the same tab (e.g. file:// where localStorage isn't shared)
      try { window.name = window.name.replace(/(?:^|;)theme=(dark|light)/, '') + ';theme=' + t; } catch (e) {}
    }
    label();
    window.dispatchEvent(new Event('themechange'));
  }
  document.addEventListener('DOMContentLoaded', function () {
    btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', function () { apply(current() === 'dark' ? 'light' : 'dark', true); });
    label();
  });

  // keep other open tabs/pages in sync when the theme is toggled
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) apply(e.newValue, false);
  });

  // follow the OS if the visitor never chose explicitly
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener && mq.addEventListener('change', function (e) {
    var saved = null; try { saved = localStorage.getItem('theme'); } catch (x) {}
    if (!saved && /(?:^|;)theme=/.test(window.name)) saved = 'x';
    if (!saved) apply(e.matches ? 'dark' : 'light', false);
  });

  // helper for canvas charts: read theme colours from CSS variables
  window.themeColors = function () {
    var s = getComputedStyle(root), g = function (n) { return s.getPropertyValue(n).trim(); };
    return {
      bg: g('--bg'), ink: g('--ink'), muted: g('--muted'), grid: g('--grid'), gridStrong: g('--grid-strong'),
      blue: g('--c-blue'), amber: g('--c-amber'), green: g('--c-green'), red: g('--c-red'),
      zHypoxic: g('--z-hypoxic'), zNormoxic: g('--z-normoxic'), zHyperoxic: g('--z-hyperoxic'),
      zCritical: g('--z-critical'), zToxic: g('--z-toxic'),
      dark: current() === 'dark'
    };
  };
  window.hexToRgb = function (h) {
    h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  window.withAlpha = function (hex, a) { var c = window.hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; };
})();
