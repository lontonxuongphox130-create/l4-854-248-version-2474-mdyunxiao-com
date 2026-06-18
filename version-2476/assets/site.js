(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-list]').forEach(function (list) {
    var scope = list.closest('section') || document;
    var input = scope.querySelector('.local-filter-input');
    var year = scope.querySelector('.year-filter');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var keyword = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags'));
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear));
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    apply();
  });

  var video = document.getElementById('movie-video');
  var overlay = document.querySelector('.player-overlay');
  if (video && overlay && window.mediaUrl) {
    var ready = false;
    function attach() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = window.mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(window.mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = window.mediaUrl;
      }
    }
    function start() {
      attach();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
})();
