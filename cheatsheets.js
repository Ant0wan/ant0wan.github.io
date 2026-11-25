/* Loads the public gists of the author and renders them as sections. */
(function () {
  var USER = 'Ant0wan';

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

  function get(url, asJson) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 10000);
    return fetch(url, { signal: c.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return asJson ? r : r.text();
    });
  }

  function allGists() {
    var all = [];
    function page(n) {
      return get('https://api.github.com/users/' + USER + '/gists?per_page=100&page=' + n, true).then(function (r) {
        return r.json().then(function (g) {
          all = all.concat(g);
          var link = r.headers.get('Link');
          return link && link.indexOf('rel="next"') !== -1 ? page(n + 1) : all;
        });
      });
    }
    return page(1);
  }

  var EXT = { sh: 'bash', bash: 'bash', zsh: 'bash', py: 'python', js: 'javascript', ts: 'typescript', json: 'json',
    yml: 'yaml', yaml: 'yaml', go: 'go', rs: 'rust', c: 'c', h: 'c', cpp: 'cpp', java: 'java', rb: 'ruby', php: 'php',
    html: 'xml', xml: 'xml', css: 'css', sql: 'sql', toml: 'ini', ini: 'ini', conf: 'ini', md: 'markdown',
    dockerfile: 'dockerfile', tf: 'hcl', hcl: 'hcl', lua: 'lua', pl: 'perl', diff: 'diff' };

  function highlight(root, lang) {
    if (!window.hljs) return;
    root.querySelectorAll('pre code').forEach(function (el) {
      var m = /language-([\w+-]+)/.exec(el.className);
      var l = (m && m[1]) || lang;
      if (l === 'sh' || l === 'shell' || l === 'console') l = 'bash';
      try {
        if (l && hljs.getLanguage(l)) el.className = 'language-' + l;
        else el.className = '';
        hljs.highlightElement(el);
      } catch (e) {}
    });
  }

  function body(gist) {
    var f = Object.values(gist.files)[0];
    var name = f.filename.toLowerCase();
    var lang = (f.language && f.language.toLowerCase()) || EXT[name.split('.').pop()] || (name === 'dockerfile' ? 'dockerfile' : '');
    if (lang === 'shell') lang = 'bash';
    if (name.endsWith('.md') || lang === 'markdown') lang = '';
    if (name.endsWith('.svg')) return Promise.resolve({ html: '<img class="gist-img" src="' + esc(f.raw_url) + '" alt="' + esc(f.filename) + '">' });
    return get(f.raw_url).then(function (text) {
      if (name.endsWith('.md') && window.marked) return '<div class="gist-md">' + marked.parse(text) + '</div>';
      return '<pre class="gist-code"><code>' + esc(text) + '</code></pre>';
    }).then(function (html) { return { html: html, lang: lang }; }).catch(function () { return { html: '<p class="gist-err">Could not load this file.</p>' }; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toc = document.getElementById('gist-toc');
    var out = document.getElementById('gist-container');
    allGists().then(function (gists) {
      if (!gists.length) { out.textContent = 'No public gists found.'; toc.innerHTML = ''; return; }
      toc.innerHTML = '';
      out.innerHTML = '';
      var sections = gists.map(function (g, i) {
        var title = g.description || ('Gist ' + (i + 1));
        var id = 'g' + (i + 1);
        var li = document.createElement('li');
        li.innerHTML = '<span class="num">1.' + (i + 1) + '</span><span><a href="#' + id + '">' + esc(title) + '</a></span>';
        toc.appendChild(li);
        var sec = document.createElement('section');
        sec.className = 'gist';
        sec.id = id;
        sec.innerHTML = '<h3><span class="num">1.' + (i + 1) + '</span> <a href="' + esc(g.html_url) + '" target="_blank" rel="noopener">' + esc(title) + '</a><span class="gist-date">' + fmt(g.created_at) + '</span></h3><div class="gist-body"></div>';
        out.appendChild(sec);
        return sec;
      });
      gists.forEach(function (g, i) {
        body(g).then(function (r) {
          var el = sections[i].querySelector('.gist-body');
          el.innerHTML = r.html;
          highlight(el, r.lang);
        });
      });
    }).catch(function () {
      toc.innerHTML = '';
      out.innerHTML = '<p class="gist-err">Could not load the cheatsheets from GitHub (rate limit or network). Try again later, or browse them at <a href="https://gist.github.com/' + USER + '">gist.github.com/' + USER + '</a>.</p>';
    });
  });
})();
