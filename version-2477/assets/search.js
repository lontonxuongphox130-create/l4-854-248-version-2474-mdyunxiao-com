(function () {
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function formatViews(value) {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万';
    }
    return String(value);
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="movie-cover" href="' + escapeHtml(movie.file) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<b class="card-badge">' + escapeHtml(movie.year) + '</b>' +
      '<span class="play-float">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h3><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.duration) + '</span></p>' +
      '<p class="movie-desc">' + escapeHtml(movie.description) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="card-stats"><span>★ ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(formatViews(movie.views)) + '播放</span></div>' +
      '</div>' +
      '</article>';
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function runSearch(keyword) {
    var q = keyword.trim().toLowerCase();
    var results = q ? movieIndex.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.year, movie.description, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    }).slice(0, 96) : movieIndex.slice(0, 24);

    var container = document.getElementById('search-results');
    var status = document.getElementById('search-status');
    if (container) {
      container.innerHTML = results.map(card).join('');
    }
    if (status) {
      status.textContent = q ? '与“' + keyword.trim() + '”相关的影片' : '热门影片推荐';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('site-search-input');
    var keyword = getQuery();
    if (input) {
      input.value = keyword;
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }
    runSearch(keyword);
  });
})();
