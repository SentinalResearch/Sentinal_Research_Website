(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  var ease = function (v) { v = clamp(v); return 1 - Math.pow(1 - v, 3); };

  // theme
  var btn = $('#themeBtn');
  function syncTheme() { btn.textContent = root.dataset.theme === 'light' ? 'Dark' : 'Light'; }
  if (btn) {
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('sr-theme', root.dataset.theme); } catch (e) {}
      syncTheme();
      requestTick();
    });
    syncTheme();
  }

  // mission words
  var mEl = $('#mission-text');
  var mWords = [];
  if (mEl) {
    var rawWords = mEl.textContent.trim().split(/\s+/);
    mEl.innerHTML = rawWords.map(function (w) { return '<span>' + w + ' </span>'; }).join('');
    var spans = mEl.querySelectorAll('span');
    mWords = Array.prototype.map.call(spans, function (s, i) {
      return {
        el: s,
        isKeyword: /deterministic|models/i.test(rawWords[i])
      };
    });
  }

  // research
  var AREAS = ['Small / efficient models', 'On-device & local inference', 'Training observability', 'Evaluation & benchmarks', 'Interpretability', 'Agents & tool use', 'Data & distillation'];
  var list = $('#rList'), stage = $('#rStage');
  if (list && stage) {
    AREAS.forEach(function (a, i) {
      var n = String(i + 1).padStart(2, '0');
      var it = document.createElement('span'); it.className = 'r-item'; it.innerHTML = '<i></i>' + a.replace('&', '&amp;'); list.appendChild(it);
      var sl = document.createElement('div'); sl.className = 'r-slide'; sl.innerHTML = '<span class="n mono">' + n + '</span><span class="t">' + a.replace('&', '&amp;') + '</span>'; stage.appendChild(sl);
    });
  }
  var items = list ? list.querySelectorAll('.r-item') : [];
  var slides = stage ? stage.querySelectorAll('.r-slide') : [];
  var rIdx = $('#rIdx');

  var nav = $('#nav'), cue = $('#cue'), heroInner = $('#heroInner'), bgDark = $('#bgDark');
  var pMark = $('#pMark'), pText = $('#pText');
  var secs = ['mission', 'research', 'projects', 'open-source'].map(function (id) { return document.getElementById(id); });
  var links = document.querySelectorAll('.nav-links a');

  var vh = window.innerHeight;
  var secOffsets = [];

  function measure() {
    vh = window.innerHeight;
    secOffsets = secs.map(function (s) {
      if (!s) return { top: 0, height: 1 };
      var r = s.getBoundingClientRect();
      var top = r.top + window.scrollY;
      return { top: top, height: s.offsetHeight };
    });
  }
  measure();

  function prog(idx) {
    var s = secOffsets[idx];
    if (!s) return 0;
    var maxScroll = Math.max(1, s.height - (vh - 60));
    return clamp((window.scrollY - s.top + 60) / maxScroll);
  }

  function update() {
    var y = window.scrollY;

    // Header nav scrolled state
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (cue) cue.style.opacity = y > 40 ? 0 : 1;

    // Hero inner animation
    if (heroInner && document.body.classList.contains('loaded')) {
      var hp = clamp(y / (vh * 0.5));
      heroInner.style.opacity = (1 - hp).toFixed(3);
      heroInner.style.transform = 'translate3d(0, ' + (-hp * 40).toFixed(1) + 'px, 0)';
    }

    // Mission scrub
    if (mWords.length && secs[0]) {
      var pm = reduce ? 1 : prog(0);
      var lit = pm * 1.15 * mWords.length;
      for (var i = 0; i < mWords.length; i++) {
        var item = mWords[i];
        var on = clamp(lit - i);
        item.el.style.opacity = (0.14 + 0.86 * on).toFixed(3);
        var needColor = item.isKeyword && on > 0.5;
        if (item.colored !== needColor) {
          item.colored = needColor;
          item.el.style.color = needColor ? 'var(--accent-fg)' : '';
        }
      }
    }

    // Research slides animation
    if (slides.length && secs[1]) {
      var N = AREAS.length;
      var pr = prog(1);
      var pos = pr * (N - 0.001) - 0.5;
      var cur = Math.min(N - 1, Math.max(0, Math.round(pos)));

      for (var j = 0; j < N; j++) {
        var sl = slides[j];
        var d = pos - j;
        var ad = Math.abs(d);
        sl.style.opacity = reduce ? (j === cur ? 1 : 0) : clamp(1 - ad * 1.6).toFixed(3);
        sl.style.transform = reduce ? 'none' : 'translate3d(0, ' + (-d * 60).toFixed(1) + 'px, 0) scale(' + (1 - Math.min(ad, 1) * 0.05).toFixed(3) + ')';
      }
      for (var k = 0; k < items.length; k++) {
        items[k].classList.toggle('on', k === cur);
      }
      if (rIdx) rIdx.textContent = String(cur + 1).padStart(2, '0');
    }

    // Projects section animation
    if (secs[2]) {
      var pp = prog(2);
      var light = root.dataset.theme === 'light';
      var dark = light ? clamp(pp * 6 - 0.2) : 0;
      if (bgDark) bgDark.style.opacity = dark.toFixed(2);
      if (nav) nav.classList.toggle('dark', !light || dark > 0.5);

      if (pMark) {
        pMark.style.transform = reduce ? 'none' : 'scale(' + (2.5 - 1.5 * ease(pp / 0.45)).toFixed(3) + ') translateZ(0)';
        pMark.style.opacity = reduce ? 1 : clamp(pp * 5).toFixed(3);
      }
      if (pText) {
        pText.style.opacity = reduce ? 1 : clamp((pp - 0.35) / 0.2).toFixed(3);
        pText.style.transform = reduce ? 'none' : 'translate3d(0, ' + ((1 - ease((pp - 0.35) / 0.3)) * 40).toFixed(1) + 'px, 0)';
      }
    }

    // Active nav indicator
    var active = '';
    for (var m = 0; m < secs.length; m++) {
      if (secs[m] && (secOffsets[m].top - y) < vh * 0.5) {
        active = secs[m].id;
      }
    }
    for (var nLink = 0; nLink < links.length; nLink++) {
      links[nLink].classList.toggle('active', links[nLink].dataset.sec === active);
    }
  }

  var ticking = false;
  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () {
    measure();
    requestTick();
  });

  // IntersectionObserver for reveals
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -15% 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    reduce ? el.classList.add('in') : io.observe(el);
  });

  requestAnimationFrame(function () {
    document.body.classList.add('loaded');
    measure();
    update();
  });
})();
