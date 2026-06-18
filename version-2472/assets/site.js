(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      mobile.hidden = expanded;
      toggle.textContent = expanded ? "☰" : "×";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
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

  function initGlobalSearch() {
    var panel = document.querySelector(".search-panel");
    var input = document.querySelector(".global-search-input");
    var results = document.querySelector(".search-results");
    var openButtons = document.querySelectorAll(".search-open");
    var closeButton = document.querySelector(".search-close");
    var movies = window.SITE_MOVIES || [];

    if (!panel || !input || !results) {
      return;
    }

    function render(query) {
      var keyword = text(query).trim();
      if (!keyword) {
        results.innerHTML = '<p class="search-empty">输入关键词后显示匹配影片。</p>';
        return;
      }
      var matches = movies.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine]
          .map(text)
          .join(" ")
          .indexOf(keyword) !== -1;
      }).slice(0, 24);

      if (!matches.length) {
        results.innerHTML = '<p class="search-empty">没有找到匹配影片。</p>';
        return;
      }

      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">'
          + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
          + '<span><strong>' + escapeHtml(movie.title) + '</strong>'
          + '<span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span></span>'
          + '</a>';
      }).join("");
    }

    function openSearch() {
      panel.hidden = false;
      input.focus();
      render(input.value);
    }

    function closeSearch() {
      panel.hidden = true;
    }

    openButtons.forEach(function (button) {
      button.addEventListener("click", openSearch);
    });
    if (closeButton) {
      closeButton.addEventListener("click", closeSearch);
    }
    panel.addEventListener("click", function (event) {
      if (event.target === panel) {
        closeSearch();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeSearch();
      }
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  function initLocalFilter() {
    var roots = document.querySelectorAll("[data-filter-root]");
    roots.forEach(function (root) {
      var input = root.querySelector("[data-local-filter]");
      var chips = Array.prototype.slice.call(root.querySelectorAll("[data-chip-filter]"));
      var grid = root.nextElementSibling ? root.nextElementSibling.querySelector(".movie-grid") : null;
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]")) : [];
      var chipValue = "";

      function apply() {
        var keyword = text(input ? input.value : "").trim();
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type")
          ].join(" "));
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var chipMatch = !chipValue || haystack.indexOf(text(chipValue)) !== -1;
          card.classList.toggle("is-card-hidden", !(keywordMatch && chipMatch));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          chipValue = chip.getAttribute("data-chip-filter") || "";
          apply();
        });
      });
      apply();
    });
  }

  window.initPlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initLocalFilter();
  });
})();
