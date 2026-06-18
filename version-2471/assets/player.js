(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var source = video ? video.getAttribute("data-hls") : "";
      var hls = null;
      var loaded = false;

      function start() {
        if (!video || !source) {
          return;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!loaded) {
            start();
          }
        });
        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hls && typeof hls.destroy === "function") {
            hls.destroy();
          }
        });
      }
    });
  });
})();
