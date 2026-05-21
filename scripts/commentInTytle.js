(function () {
    const reviewsData = [
        { name: "Анна К.", text: "Потрясающий сервис! Всё очень удобно, а дизайн радует глаз. Обязательно вернусь ещё!", date: "12.05.2025" },
        { name: "Михаил П.", text: "Быстро, качественно, поддержка отвечает моментально. Ребята знают своё дело.", date: "03.04.2025" },
        { name: "Елена В.", text: "Очень понравилась концепция шахматного расположения — выглядит живо и не скучно. Спасибо разработчикам!", date: "28.03.2025" },
        { name: "Игорь С.", text: "Отличная работа! Все функции летают, адаптив идеальный. Рекомендую коллегам.", date: "15.02.2025" },
        { name: "Ольга Д.", text: "Листать отзывы таким ползунком необычно, но очень удобно. Сайт — огонь 🔥", date: "01.01.2025" },
        { name: "Дмитрий М.", text: "Надёжно и современно. Отдельное спасибо за flexbox вёрстку, всё ровно.", date: "19.12.2024" },
        { name: "Татьяна Р.", text: "Очень душевные комментарии. Приятно видеть такой подход к отзывам, не скучно.", date: "05.11.2024" },
        { name: "Алексей Н.", text: "Удобная навигация между отзывами, ползунок медленно листает — можно вчитываться.", date: "22.10.2024" },
        { name: "Мария З.", text: "Шахматка добавляет воздушности! И все блоки ровно выровнены. Класс!", date: "30.09.2024" },
        { name: "Виктор Л.", text: "Лучший сайт для поиска вдохновения. Реализация супер!", date: "14.08.2024" }
    ];

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function createCard(r) {
        const card = document.createElement('div');
        card.className = 'reviewsWidget__comment';
        card.innerHTML = `
        <div class="reviewsWidget__comment-content">
            <div class="reviewsWidget__commentName">${escapeHtml(r.name)}</div>
            <div class="reviewsWidget__commentText">${escapeHtml(r.text)}</div>
        </div>
        <div class="reviewsWidget__commentDate">${escapeHtml(r.date)}</div>
    `;
        return card;
    }

    const container = document.querySelector('.section_Three .reviewsWidget');
    if (!container) return;

    const topFeed = container.querySelector('.reviewsWidget__feed--top');
    const bottomFeed = container.querySelector('.reviewsWidget__feed--bottom');
    const range = container.querySelector('.reviewsWidget__range');
    const label = container.querySelector('.reviewsWidget__thumbLabel');
    const counter = container.querySelector('.reviewsWidget__counter');

    let maxTop = 0, maxBottom = 0;

    function updateMaxScroll() {
        if (topFeed) maxTop = Math.max(0, topFeed.scrollWidth - topFeed.clientWidth);
        if (bottomFeed) maxBottom = Math.max(0, bottomFeed.scrollWidth - bottomFeed.clientWidth);
        if (counter) counter.innerText = `0 / ${reviewsData.length}`;
    }

    function syncScroll(percent) {
        const p = Math.min(1, Math.max(0, percent / 100));
        if (topFeed && maxTop > 0) topFeed.scrollTo({ left: p * maxTop, behavior: 'smooth' });
        if (bottomFeed && maxBottom > 0) bottomFeed.scrollTo({ left: p * maxBottom, behavior: 'smooth' });
        if (counter) {
            let idx = Math.floor(p * reviewsData.length);
            idx = Math.min(reviewsData.length - 1, Math.max(0, idx));
            counter.innerText = `${idx + 1} / ${reviewsData.length}`;
        }
    }

    function updateLabelPos() {
        const percent = range.value / 100;
        const rect = range.getBoundingClientRect();
        const left = percent * rect.width;  // ← всё! просто ширина * процент
        label.style.left = left + 'px';
    }

    function build() {
        if (!topFeed || !bottomFeed) return;
        topFeed.innerHTML = '';
        bottomFeed.innerHTML = '';

        reviewsData.forEach((r, idx) => {
            // Верхний блок
            if (idx % 2 === 0) {
                // Видимый отзыв
                topFeed.appendChild(createCard(r));
            } else {
                // Пустая заглушка (сохраняет место, но без контента)
                const empty = document.createElement('div');
                empty.className = 'reviewsWidget__comment reviewsWidget__comment--empty';
                empty.style.cssText = 'opacity: 0; pointer-events: none;';
                topFeed.appendChild(empty);
            }

            // Нижний блок (инверсия)
            if (idx % 2 === 1) {
                // Видимый отзыв
                bottomFeed.appendChild(createCard(r));
            } else {
                // Пустая заглушка
                const empty = document.createElement('div');
                empty.className = 'reviewsWidget__comment reviewsWidget__comment--empty';
                empty.style.cssText = 'opacity: 0; pointer-events: none;';
                bottomFeed.appendChild(empty);
            }
        });

        updateMaxScroll();
    }

    if (range) {
        range.addEventListener('input', (e) => {
            syncScroll(parseInt(e.target.value, 10));
            updateLabelPos();
        });
    }

    function bindSync(a, b) {
        if (!a || !b) return;
        a.addEventListener('scroll', () => {
            const maxA = a.scrollWidth - a.clientWidth;
            if (maxA <= 0) return;
            const p = a.scrollLeft / maxA;
            if (range && document.activeElement !== range) {
                range.value = p * 100;
                updateLabelPos();
            }
            const maxB = b.scrollWidth - b.clientWidth;
            if (maxB > 0) b.scrollTo({ left: p * maxB, behavior: 'smooth' });
            if (counter) {
                let idx = Math.floor(p * reviewsData.length);
                idx = Math.min(reviewsData.length - 1, Math.max(0, idx));
                counter.innerText = `${idx + 1} / ${reviewsData.length}`;
            }
        });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateMaxScroll();
            if (range) syncScroll(range.value);
            updateLabelPos();
        }, 100);
    });

    build();
    setTimeout(() => {
        updateMaxScroll();
        if (range) {
            syncScroll(0);
            updateLabelPos();
            bindSync(topFeed, bottomFeed);
            bindSync(bottomFeed, topFeed);
        }
    }, 80);
})();
