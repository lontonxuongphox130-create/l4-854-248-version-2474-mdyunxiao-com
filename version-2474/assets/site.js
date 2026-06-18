(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initLocalSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    panels.forEach(function (panel) {
      var section = panel.closest('section') || document;
      var input = panel.querySelector('[data-search-input]');
      var count = panel.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));

      function filter() {
        var value = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        if (query && !input.value) {
          input.value = query;
        }
        input.addEventListener('input', filter);
      }
      filter();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('[data-player-overlay]');
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function attachSource() {
        var source = video.getAttribute('data-src');
        if (!source || video.getAttribute('data-ready') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          video.setAttribute('data-ready', 'true');
          return;
        }

        video.src = source;
        video.setAttribute('data-ready', 'true');
      }

      function startPlayback() {
        attachSource();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      player.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
          attachSource();
          return;
        }
        startPlayback();
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      video.addEventListener('emptied', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalSearch();
    initPlayers();
  });
})();
