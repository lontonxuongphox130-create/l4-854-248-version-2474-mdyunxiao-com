(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-empty-state]");

            function apply() {
                var query = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var match = true;
                    var searchText = normalize(card.getAttribute("data-search"));
                    if (query && searchText.indexOf(query) === -1) {
                        match = false;
                    }
                    selects.forEach(function (select) {
                        var key = select.getAttribute("data-filter-select");
                        var value = normalize(select.value);
                        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                            match = false;
                        }
                    });
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-button");
            var src = player.getAttribute("data-src");
            var initialized = false;
            var hlsInstance = null;

            function playVideo() {
                if (!video || !src) {
                    return;
                }
                player.classList.add("is-playing");
                if (!initialized) {
                    initialized = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({ enableWorker: true });
                        hlsInstance.loadSource(src);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = src;
                        video.play().catch(function () {});
                    } else {
                        video.src = src;
                        video.play().catch(function () {});
                    }
                } else {
                    video.play().catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    playVideo();
                });
            }

            player.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                playVideo();
            });

            if (video) {
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        player.classList.remove("is-playing");
                    }
                });
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("ended", function () {
                    player.classList.remove("is-playing");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
