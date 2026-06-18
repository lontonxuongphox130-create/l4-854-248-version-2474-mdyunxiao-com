(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        if (slides.length) {
            showSlide(0);
            startHero();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartHero();
            });
        });

        var liveInput = document.querySelector("[data-live-search]");
        var searchGrid = document.querySelector("[data-search-grid]");
        var emptyState = document.querySelector("[data-empty-state]");

        if (liveInput && searchGrid) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            liveInput.value = query;

            function filterCards() {
                var value = liveInput.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var matched = !value || text.indexOf(value) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("visible", visible === 0);
                }
            }

            liveInput.addEventListener("input", filterCards);
            filterCards();
        }
    });
})();
