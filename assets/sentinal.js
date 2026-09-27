(function () {
  var root = document.documentElement, nav = document.getElementById('nav'), btn = document.getElementById('themeBtn');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sync() { if (btn) btn.textContent = root.dataset.theme === 'light' ? 'Dark' : 'Light'; }
  if (btn) {
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('sr-theme', root.dataset.theme); } catch (e) {}
      sync();
    });
    sync();
  }

  if (nav) {
    window.addEventListener('scroll', function () { nav.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
  }

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

  // 4 Steps Showcase Controller (Matching design_handoff 1-to-1)
  var STEPS = [
    { n: '01 / 04', q: 'What am I running?', a: 'Every session on every machine, in one list. Anything that needs you rises to the top.' },
    { n: '02 / 04', q: 'How is it going?', a: 'State, progress and resources, plus a health check that shows its evidence instead of a score.' },
    { n: '03 / 04', q: 'Can I reach it?', a: 'A real terminal one click away. Answer y / n, or send Ctrl‑C with a confirm step.' },
    { n: '04 / 04', q: 'How did I run this last time?', a: 'Searchable command history across machines and projects, and reusable recipes.' }
  ];

  var currentStep = 0;
  var stepNumber = document.getElementById('stepNumber');
  var stepTitle = document.getElementById('stepTitle');
  var stepDesc = document.getElementById('stepDesc');
  var stepCard = document.getElementById('stepCard');
  var dotEls = document.querySelectorAll('#stepIndicators .step-dot');
  var mockListArea = document.getElementById('mockListArea');
  var mockReachArea = document.getElementById('mockReachArea');
  var mockHistArea = document.getElementById('mockHistArea');
  var showcaseSection = document.getElementById('showcaseSection');
  var showcaseMock = document.getElementById('showcaseMock');

  function setStep(idx) {
    if (currentStep === idx) return;
    currentStep = idx;
    var s = STEPS[idx];
    if (!s) return;

    if (showcaseMock) {
      showcaseMock.classList.remove('step-0', 'step-1', 'step-2', 'step-3');
      showcaseMock.classList.add('step-' + idx);
    }

    if (stepCard) {
      stepCard.style.opacity = '0';
      stepCard.style.transform = 'translateY(10px)';
      setTimeout(function () {
        if (stepNumber) stepNumber.textContent = s.n;
        if (stepTitle) stepTitle.textContent = s.q;
        if (stepDesc) stepDesc.textContent = s.a;
        stepCard.style.opacity = '1';
        stepCard.style.transform = 'translateY(0)';
      }, 180);
    }

    dotEls.forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
      dot.style.width = i === idx ? '36px' : '12px';
      dot.style.background = i === idx ? 'var(--accent)' : 'var(--bg-2)';
    });

    if (mockListArea) mockListArea.style.opacity = (idx === 0 || idx === 1) ? '1' : '0.45';
    if (mockReachArea) mockReachArea.style.opacity = (idx === 2) ? '1' : '0.45';
    if (mockHistArea) mockHistArea.style.opacity = (idx === 3) ? '1' : '0.45';
  }

  dotEls.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(dot.dataset.step, 10);
      if (!isNaN(idx) && showcaseSection) {
        var r = showcaseSection.getBoundingClientRect();
        var scrollPos = window.scrollY + r.top + (showcaseSection.offsetHeight * (idx / STEPS.length));
        window.scrollTo({ top: scrollPos, behavior: 'smooth' });
      }
    });
  });

  // Scroll logic for showcase
  var ticking = false;
  function updateScroll() {
    if (showcaseSection) {
      var r = showcaseSection.getBoundingClientRect();
      var progress = -r.top / (showcaseSection.offsetHeight - window.innerHeight);
      progress = Math.max(0, Math.min(1, progress));
      
      var idx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setStep(idx);

      if (showcaseMock && !reduce) {
        if (window.innerWidth > 820) {
          var scale = 1 - Math.abs(progress - 0.5) * 0.05;
          showcaseMock.style.transform = 'scale(' + scale + ')';
        } else {
          showcaseMock.style.transform = 'none';
        }
      }
    }
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateScroll();

  requestAnimationFrame(function () {
    document.body.classList.add('loaded');
  });
})();
