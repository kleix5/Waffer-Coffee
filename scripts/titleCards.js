async function fetchProducts() {
    try {
        const response = await fetch('/api/top-products');
        if (!response.ok) {
            throw new Error('Ошибка загрузки товаров: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return [];
    }
}
function getCardClass(index, total) {
    if (total === 5) {
        if (index === 0 || index === 4) return 'special_CardThird';
        if (index === 1 || index === 3) return 'special_CardSec';
        if (index === 2) return '';
    }
    return '';
}

function createProductCard(product, index, total) {
    const card = document.createElement('div');

    const positionClass = getCardClass(index, total);
    card.className = `special_Card ${positionClass}`.trim();

    card.innerHTML = `
        <div class="special_Card-imageHold">
            <img src="${product.imagePath}" alt="${product.name}" class="special_Card-imageHold-img">
        </div>
        <div class="special_Card-discription">
            <h2>${product.name}</h2>
            <p>${product.price} ₽</p>
        </div>
    `;

    card.addEventListener('click', function () {
        console.log(`Выбран товар: ${product.name} (ID: ${product.id})`);
        // ЗДЕСЬ БУДЕТ ПЕРЕХОД НА СТРАНИЦУ ТОВАРА
        // window.location.href = `/product/${product.id}`;
    });

    return card;
}

async function renderProducts() {
    const products = await fetchProducts();

    if (!products || products.length === 0) {
        console.warn('Нет товаров для отображения');
        return;
    }

    const container = document.getElementById('productContainer');
    if (!container) {
        console.error('Контейнер #productContainer не найден');
        return;
    }

    container.innerHTML = '';

    products.forEach((product, index) => {
        const card = createProductCard(product, index, products.length);
        container.appendChild(card);
    });

    console.log(`✅ Отображено ${products.length} товаров`);
}

document.addEventListener('DOMContentLoaded', renderProducts);