/* Page transitions: a curtain wipes up over the page, the next page loads
   underneath and the curtain keeps moving up and away. Pure CSS animation
   (see "Page transitions" in site.css); this file only drives the classes. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LEAVE_MS = 650, KEY = 'vt-label';

  function setLabel(t) { root.style.setProperty('--vt-label', JSON.stringify(t || '')); }

  // Arriving from another page of the site: start covered, then wipe away.
  var label = null;
  try { label = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch (e) {}
  if (label !== null && !reduce) {
    setLabel(label);
    root.classList.add('vt-enter');
    setTimeout(function () { root.classList.remove('vt-enter'); }, 1400);
  }

  // Back/forward cache restores the page mid-"leave": reset it.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('vt-leave', 'vt-enter');
  });

  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (x) { return; }
    if (url.origin !== location.origin || !/^https?:$|^file:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page / anchor
    e.preventDefault();
    var text = (a.getAttribute('data-vt-label') || a.textContent || '').replace(/\s+/g, ' ').trim();
    if (a.classList.contains('site-name')) text = 'Home';
    if (text.length > 28) text = '';
    setLabel(text);
    try { sessionStorage.setItem(KEY, text); } catch (x) {}
    root.classList.add('vt-leave');
    setTimeout(function () { location.href = url.href; }, LEAVE_MS);
  });
})();
