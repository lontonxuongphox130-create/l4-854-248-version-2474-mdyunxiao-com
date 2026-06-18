(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (header) {
      var applyScrollState = function () {
        if (window.scrollY > 18) {
          header.classList.add("is-scrolled");
        } else {
          header.classList.remove("is-scrolled");
        }
      };
      applyScrollState();
      window.addEventListener("scroll", applyScrollState, { passive: true });
    }

    if (toggle && mobileMenu) {
      toggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var section = scope.parentElement || document;
      var input = scope.querySelector(".site-search-input");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-button"));
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));

      function activeFilter() {
        var active = scope.querySelector(".filter-button.active");
        return active ? active.getAttribute("data-filter") : "all";
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filter = activeFilter();
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesFilter = filter === "all" || text.indexOf(filter.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          apply();
        });
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var shell = document.querySelector("[data-player]");
    if (!shell || !streamUrl) {
      return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var hlsInstance = null;
    var attached = false;

    function attach() {
      if (!video || attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
  });
})();
