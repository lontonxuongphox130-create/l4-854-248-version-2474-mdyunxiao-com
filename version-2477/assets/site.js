(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('.hero-slider');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
      var prev = document.querySelector('.hero-arrow.prev');
      var next = document.querySelector('.hero-arrow.next');
      var index = 0;
      var timer;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }

      show(0);
      start();
    }

    var filterPanel = document.querySelector('.filter-panel');
    if (filterPanel) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      var input = filterPanel.querySelector('.filter-input');
      var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('.filter-select'));

      function matchCard(card) {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();

        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }

        return selects.every(function (select) {
          var value = select.value;
          var field = select.getAttribute('data-filter');
          if (!value || !field) {
            return true;
          }
          return (card.getAttribute('data-' + field) || '').indexOf(value) !== -1;
        });
      }

      function applyFilter() {
        cards.forEach(function (card) {
          card.classList.toggle('hidden-by-filter', !matchCard(card));
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', applyFilter);
      });
      applyFilter();
    }
  });
})();
