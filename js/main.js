/* =========================================================
   main.js — header, navigation, theme, scroll reveals, contact form
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header background on scroll ---------- */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById('site-nav');
  var navToggle = document.querySelector('[data-nav-toggle]');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setNav(navToggle.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
      setNav(false);
      navToggle.focus();
    }
  });

  /* ---------- Active nav link while scrolling ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Theme toggle (dark default) ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function syncThemeButton() {
    if (!themeBtn) return;
    var isLight = root.dataset.theme === 'light';
    themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isLight ? '#f7f8fb' : '#0b1120');
  }
  syncThemeButton();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
      document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // Stagger siblings that share a parent (e.g. cards in a grid)
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains('reveal');
    });
    el.style.setProperty('--reveal-index', String(Math.min(siblings.indexOf(el), 6)));
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Résumé link: hide it until assets/resume.pdf exists ---------- */
  var resume = document.querySelector('[data-resume-link]');
  if (resume && window.fetch && location.protocol !== 'file:') {
    fetch(resume.getAttribute('href'), { method: 'HEAD' })
      .then(function (res) { if (!res.ok) resume.hidden = true; })
      .catch(function () { resume.hidden = true; });
  }

  /* ---------- Contact form ----------
     With data-endpoint set (e.g. Formspree), posts there via fetch.
     Otherwise opens the visitor's email app with the message pre-filled. */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var setStatus = function (msg, type) {
      status.textContent = msg;
      status.className = 'form-status' + (type ? ' is-' + type : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.willValidate) return;
        var ok = field.checkValidity();
        field.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        setStatus('Please fill in your name, a valid email and a message.', 'error');
        firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      var endpoint = form.dataset.endpoint;

      if (endpoint) {
        setStatus('Sending…');
        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            form.reset();
            setStatus('Thanks! Your message is on its way.', 'success');
          })
          .catch(function () {
            setStatus('Something went wrong. Please email me directly instead.', 'error');
          });
        return;
      }

      var subject = 'Website inquiry from ' + data.get('name');
      var body = data.get('message') + '\n\n— ' + data.get('name') + ' (' + data.get('email') + ')';
      window.location.href = 'mailto:' + form.dataset.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app…', 'success');
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }
})();
