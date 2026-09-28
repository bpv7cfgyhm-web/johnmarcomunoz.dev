/* =========================================================
   dither.js — ordered (Bayer) dither effects on <canvas>
   1. Hero field: a slow, faint pixel pattern behind the hero.
   2. Veil reveal: elements with [data-dither] start covered by a
      pixel veil that dissolves as they scroll into view.
   Tweak the CONFIG values to taste. Disabled for reduced motion.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = {
    heroCell: 5,          // px size of each hero dither pixel
    heroOpacity: 0.16,    // max alpha of hero pixels
    heroFps: 24,
    veilCell: 7,          // px size of each veil pixel
    veilDuration: 900,    // ms for a veil to fully dissolve
    veilSweep: 0.45       // 0 = pure dither, 1 = strong left-to-right sweep
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 8×8 Bayer matrix, normalised to 0–1 thresholds
  var BAYER = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  ].map(function (v) { return (v + 0.5) / 64; });

  function threshold(x, y) { return BAYER[(y & 7) * 8 + (x & 7)]; }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fitCanvas(canvas, cell) {
    var rect = canvas.getBoundingClientRect();
    var cols = Math.max(1, Math.ceil(rect.width / cell));
    var rows = Math.max(1, Math.ceil(rect.height / cell));
    // Draw one canvas pixel per cell; CSS scales it up with pixelated rendering
    canvas.width = cols;
    canvas.height = rows;
    return { cols: cols, rows: rows };
  }

  /* ---------- 1. Hero dither field ---------- */
  var hero = document.querySelector('[data-hero-dither]');
  if (hero) {
    hero.style.imageRendering = 'pixelated';
    var hctx = hero.getContext('2d');
    var hsize, himg, running = false, last = 0, t = 0, rgb;

    var readColor = function () {
      rgb = cssVar('--accent-rgb').split(',').map(function (n) { return parseInt(n, 10); });
    };
    var resizeHero = function () {
      hsize = fitCanvas(hero, CONFIG.heroCell);
      himg = hctx.createImageData(hsize.cols, hsize.rows);
    };

    var drawHero = function (now) {
      if (!running) return;
      requestAnimationFrame(drawHero);
      if (now - last < 1000 / CONFIG.heroFps) return;
      last = now;
      t += 0.012;

      var cols = hsize.cols, rows = hsize.rows, data = himg.data;
      for (var y = 0; y < rows; y++) {
        var ny = y / rows;
        for (var x = 0; x < cols; x++) {
          var nx = x / cols;
          // Soft moving waves, weighted toward the top-right corner
          var v =
            0.5 + 0.5 * Math.sin(nx * 6 + t * 1.3 + Math.sin(ny * 4 + t)) *
            Math.cos(ny * 5 - t * 0.9);
          v *= Math.max(0, 1.25 - Math.hypot(1 - nx, ny * 1.2) * 1.15);
          var on = v > threshold(x, y);
          var i = (y * cols + x) * 4;
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
          data[i + 3] = on ? 255 * CONFIG.heroOpacity : 0;
        }
      }
      hctx.putImageData(himg, 0, 0);
    };

    readColor();
    resizeHero();

    // Only animate while the hero is on screen
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(drawHero); }
      if (!visible) running = false;
    }).observe(hero);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeHero, 150);
    });
    document.addEventListener('themechange', readColor);
  }

  /* ---------- 2. Dither veil reveal ---------- */
  var targets = document.querySelectorAll('[data-dither]');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  // Find the solid background color behind an element so the veil blends in
  function backgroundBehind(el) {
    while (el && el !== document.documentElement) {
      var bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
      el = el.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  }

  function playVeil(el) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var canvas = document.createElement('canvas');
    canvas.className = 'dither-veil';
    canvas.setAttribute('aria-hidden', 'true');
    el.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var size = fitCanvas(canvas, CONFIG.veilCell);
    ctx.fillStyle = backgroundBehind(el.parentElement);
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / CONFIG.veilDuration);
      var eased = 1 - Math.pow(1 - p, 2);
      ctx.clearRect(0, 0, size.cols, size.rows);
      for (var y = 0; y < size.rows; y++) {
        for (var x = 0; x < size.cols; x++) {
          var sweep = (x / size.cols) * CONFIG.veilSweep;
          var local = eased * (1 + CONFIG.veilSweep) - sweep;
          if (threshold(x, y) >= local) ctx.fillRect(x, y, 1, 1);
        }
      }
      if (p < 1) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  var veilObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        obs.unobserve(entry.target);
        playVeil(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  Array.prototype.forEach.call(targets, function (el) { veilObserver.observe(el); });
})();
