(() => {
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const menuButton = $('.js-menu-toggle');
    const mobileMenu = $('.js-mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            menuButton.textContent = mobileMenu.classList.contains('hidden') ? '☰' : '×';
        });
    }

    const hero = $('[data-hero]');
    if (hero) {
        const slides = $$('[data-hero-slide]', hero);
        const dots = $$('[data-hero-dot]', hero);
        let index = 0;
        const show = (next) => {
            if (!slides.length) return;
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        };
        dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
        if (slides.length > 1) {
            setInterval(() => show(index + 1), 5200);
        }
    }

    $$('[data-filter-list]').forEach((list) => {
        const scope = list.closest('section') || document;
        const input = $('[data-filter-input]', scope);
        const selects = $$('[data-filter-select]', scope);
        const empty = $('[data-filter-empty]', scope);
        const cards = $$('.movie-card-item', list);
        const params = new URLSearchParams(window.location.search);
        if (input && input.dataset.queryParam) {
            const q = params.get(input.dataset.queryParam);
            if (q) input.value = q;
        }
        const normalize = (value) => String(value || '').trim().toLowerCase();
        const apply = () => {
            const query = normalize(input ? input.value : '');
            const rules = selects.map((select) => ({
                key: select.dataset.filterSelect,
                value: normalize(select.value)
            })).filter((rule) => rule.value);
            let visible = 0;
            cards.forEach((card) => {
                const haystack = normalize(card.dataset.search);
                const queryMatch = !query || haystack.includes(query);
                const ruleMatch = rules.every((rule) => normalize(card.dataset[rule.key]).includes(rule.value));
                const ok = queryMatch && ruleMatch;
                card.classList.toggle('hidden', !ok);
                if (ok) visible += 1;
            });
            if (empty) empty.classList.toggle('hidden', visible !== 0);
        };
        if (input) input.addEventListener('input', apply);
        selects.forEach((select) => select.addEventListener('change', apply));
        apply();
    });

    $$('[data-player]').forEach((player) => {
        const video = $('video[data-video]', player);
        const veil = $('[data-player-veil]', player);
        const button = $('[data-player-start]', player);
        const message = $('[data-player-message]', player);
        let hls = null;
        let started = false;

        const showMessage = () => {
            if (message) message.classList.remove('hidden');
        };

        const attach = () => {
            if (!video || started) return;
            const src = video.getAttribute('data-video');
            if (!src) return;
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data && data.fatal) showMessage();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else {
                showMessage();
            }
        };

        const play = () => {
            if (!video) return;
            attach();
            if (veil) veil.classList.add('hidden');
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    if (veil) veil.classList.remove('hidden');
                });
            }
        };

        if (button) button.addEventListener('click', play);
        if (veil) veil.addEventListener('click', play);
        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) play();
            });
            video.addEventListener('play', () => {
                if (veil) veil.classList.add('hidden');
            });
            video.addEventListener('error', showMessage);
        }
        window.addEventListener('beforeunload', () => {
            if (hls) hls.destroy();
        });
    });
})();
