var hlsLoadPromise = null;

function loadHls() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    if (hlsLoadPromise) {
        return hlsLoadPromise;
    }

    hlsLoadPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            if (window.Hls) {
                resolve(window.Hls);
            } else {
                reject(new Error("HLS unavailable"));
            }
        };
        script.onerror = function () {
            reject(new Error("HLS unavailable"));
        };
        document.head.appendChild(script);
    });

    return hlsLoadPromise;
}

function mountPlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var overlay = document.getElementById(options.overlayId);
    var errorBox = document.getElementById(options.errorId);
    var hlsInstance = null;
    var started = false;

    if (!video || !button || !overlay) {
        return;
    }

    video.poster = options.poster;
    video.controls = false;
    video.playsInline = true;

    function showError() {
        if (errorBox) {
            errorBox.textContent = "视频暂时无法播放，请稍后再试。";
            errorBox.classList.add("visible");
        }
    }

    function attachSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
            return Promise.resolve();
        }

        return loadHls().then(function (Hls) {
            if (!Hls.isSupported()) {
                throw new Error("HLS unsupported");
            }

            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(options.source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showError();
                }
            });
        });
    }

    var ready = attachSource().catch(function () {
        showError();
    });

    function playVideo() {
        overlay.classList.add("hidden");
        video.controls = true;
        started = true;

        ready.then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    overlay.classList.remove("hidden");
                });
            }
        });
    }

    button.addEventListener("click", playVideo);
    overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
            playVideo();
        }
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("hidden");
    });
    video.addEventListener("pause", function () {
        if (started && !video.ended) {
            overlay.classList.remove("hidden");
        }
    });
    video.addEventListener("ended", function () {
        overlay.classList.remove("hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

window.MoviePlayer = {
    mount: mountPlayer
};
