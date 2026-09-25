/* =========================================================
   projects.js — accordion project cards + category filter
   Project content lives in index.html (good for SEO); this file
   only adds behavior. One card is open at a time.
   ========================================================= */
(function () {
  'use strict';

  var grid = document.querySelector('[data-accordion]');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Give each card a view-transition name so the layout change animates
  // smoothly in browsers that support the View Transitions API.
  cards.forEach(function (card, i) { card.style.viewTransitionName = 'project-' + i; });

  function withTransition(update) {
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  function setOpen(card, open) {
    var btn = card.querySelector('.project-summary');
    var panel = card.querySelector('.project-panel');
    card.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    // `inert` keeps collapsed links out of the tab order and screen readers
    if (panel) panel.inert = !open;
  }

  cards.forEach(function (card) { setOpen(card, false); });

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.project-summary');
    if (!btn) return;
    var card = btn.closest('.project-card');
    var willOpen = !card.classList.contains('is-open');

    withTransition(function () {
      cards.forEach(function (c) { if (c !== card) setOpen(c, false); });
      setOpen(card, willOpen);
    });

    if (willOpen) {
      // After the layout settles, make sure the opened card is in view
      setTimeout(function () {
        var rect = card.getBoundingClientRect();
        var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 68;
        if (rect.top < headerH || rect.top > window.innerHeight * 0.6) {
          card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }, 420);
    }
  });

  /* ---------- Category filter ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key = chip.dataset.filter;
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      withTransition(function () {
        cards.forEach(function (card) {
          var cats = (card.dataset.category || '').split(/\s+/);
          var show = key === 'all' || cats.indexOf(key) !== -1;
          card.hidden = !show;
          if (!show) setOpen(card, false);
          if (show) card.classList.add('is-visible');
        });
      });
    });
  });
})();
