/* =========================================================
   logo-loop.js — seamless infinite marquee
   Usage: <div class="logo-loop" data-logo-loop data-speed="40">
            <ul class="logo-loop-track"> <li>…</li> </ul>
          </div>
   data-speed is pixels per second (higher = faster).
   Add class "logo-loop-reverse" to scroll the other way.
   ========================================================= */
(function () {
  'use strict';

  var loops = document.querySelectorAll('[data-logo-loop]');

  Array.prototype.forEach.call(loops, function (loop) {
    var track = loop.querySelector('.logo-loop-track');
    if (!track) return;

    // Duplicate the track so the loop has no visible seam.
    // The copy is hidden from assistive tech to avoid reading items twice.
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    loop.appendChild(clone);

    function setDuration() {
      var speed = parseFloat(loop.dataset.speed) || 40;
      var width = track.getBoundingClientRect().width;
      // Fill wide screens: add more copies if one track is narrower than the loop
      while (loop.querySelectorAll('.logo-loop-track').length * width < loop.clientWidth * 2 && width > 0) {
        var extra = track.cloneNode(true);
        extra.setAttribute('aria-hidden', 'true');
        loop.appendChild(extra);
      }
      loop.style.setProperty('--loop-duration', (width / speed).toFixed(2) + 's');
    }

    setDuration();
    loop.classList.add('is-ready');

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setDuration);
  });
})();
