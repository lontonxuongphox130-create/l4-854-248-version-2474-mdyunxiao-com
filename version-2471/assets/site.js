(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cardHtml(item, root) {
    return [
      '<a class="movie-card" href="' + escapeHtml(root + item.href) + '" data-title="' + escapeHtml(item.title) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + escapeHtml(root + item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" data-cover>',
      '    <span class="card-badge">' + escapeHtml(item.type) + '</span>',
      '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(item.title) + '</strong>',
      '    <span>' + escapeHtml(item.category) + ' · ' + escapeHtml(item.region) + '</span>',
      '    <em>' + escapeHtml(item.oneLine) + '</em>',
      '  </span>',
      '</a>'
    ].join("");
  }

  ready(function () {
    var root = document.body.getAttribute("data-root") || "";
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = root + "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    document.querySelectorAll("img[data-cover]").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      var keyword = area.querySelector("[data-filter-keyword]");
      var region = area.querySelector("[data-filter-region]");
      var type = area.querySelector("[data-filter-type]");
      var year = area.querySelector("[data-filter-year]");
      var empty = area.querySelector("[data-no-results]");

      function applyFilter() {
        var q = normalize(keyword && keyword.value);
        var r = region && region.value ? region.value : "";
        var t = type && type.value ? type.value : "";
        var y = year && year.value ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize((card.dataset.title || "") + " " + (card.dataset.text || ""));
          var ok = (!q || text.indexOf(q) !== -1) &&
            (!r || card.dataset.region === r) &&
            (!t || card.dataset.type === t) &&
            (!y || card.dataset.year === y);
          card.style.display = ok ? "flex" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [keyword, region, type, year].forEach(function (input) {
        if (input) {
          input.addEventListener(input.tagName === "SELECT" ? "change" : "input", applyFilter);
        }
      });
    });

    var searchResults = document.querySelector("[data-search-results]");
    if (searchResults && Array.isArray(window.MovieItems)) {
      var params = new URLSearchParams(window.location.search);
      var queryInput = document.querySelector("[data-search-page-input]");
      var regionSelect = document.querySelector("[data-search-region]");
      var typeSelect = document.querySelector("[data-search-type]");
      var yearSelect = document.querySelector("[data-search-year]");
      var q = params.get("q") || "";

      if (queryInput) {
        queryInput.value = q;
      }

      function renderSearch() {
        var keyword = normalize(queryInput && queryInput.value);
        var regionValue = regionSelect && regionSelect.value ? regionSelect.value : "";
        var typeValue = typeSelect && typeSelect.value ? typeSelect.value : "";
        var yearValue = yearSelect && yearSelect.value ? yearSelect.value : "";
        var list = window.MovieItems.filter(function (item) {
          var text = normalize(item.title + " " + item.category + " " + item.genre + " " + item.tags + " " + item.oneLine);
          return (!keyword || text.indexOf(keyword) !== -1) &&
            (!regionValue || item.region === regionValue) &&
            (!typeValue || item.type === typeValue) &&
            (!yearValue || item.year === yearValue);
        }).slice(0, 240);

        searchResults.innerHTML = list.map(function (item) {
          return cardHtml(item, root);
        }).join("");

        document.querySelectorAll("img[data-cover]").forEach(function (img) {
          img.addEventListener("error", function () {
            img.classList.add("image-missing");
          });
        });

        var empty = document.querySelector("[data-search-empty]");
        if (empty) {
          empty.classList.toggle("show", list.length === 0);
        }
      }

      [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (input) {
        if (input) {
          input.addEventListener(input.tagName === "SELECT" ? "change" : "input", renderSearch);
        }
      });
      renderSearch();
    }
  });
})();
