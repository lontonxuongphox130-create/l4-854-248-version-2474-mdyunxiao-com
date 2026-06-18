(function () {
  function initializePlayer(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('.player-overlay');
    var message = container.querySelector('.player-message');
    var streamUrl = container.getAttribute('data-stream-url');
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add('is-visible');
      }
    }

    function prepare() {
      if (!video || !streamUrl) {
        showMessage('视频暂时无法加载');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        showMessage('视频暂时无法加载');
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    prepare();

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(initializePlayer);
  });
})();
