            let cart = [];

            function saveCart() {
            localStorage.setItem('waffle_cart', JSON.stringify(cart));
            }
            function loadCart() {
            const saved = localStorage.getItem('waffle_cart');
            if (saved) {
            try {
            cart = JSON.parse(saved);
            } catch(e) { cart = []; }
            } else cart = [];
            renderCart();
            updateCartBadge();
            }

            // Глобальная функция для добавления товара (используйте её в своих карточках)
            window.addToCart = function(id, name, price) {
            const existing = cart.find(item => item.id == id);
            if (existing) {
            existing.quantity++;
            } else {
            cart.push({ id: id, name: name, price: price, quantity: 1 });
            }
            saveCart();
            renderCart();
            updateCartBadge();
            };

            function changeQuantity(id, delta) {
            const idx = cart.findIndex(item => item.id == id);
            if (idx !== -1) {
            const newQty = cart[idx].quantity + delta;
            if (newQty <= 0) {
            cart.splice(idx, 1);
            } else {
            cart[idx].quantity = newQty;
            }
            saveCart();
            renderCart();
            updateCartBadge();
            }
            }

            function removeItem(id) {
            cart = cart.filter(item => item.id != id);
            saveCart();
            renderCart();
            updateCartBadge();
            }

            function clearCart() {
            cart = [];
            saveCart();
            renderCart();
            updateCartBadge();
            }

            function checkout() {
            if (cart.length === 0) {
            alert('Корзина пуста. Добавьте вафли!');
            return;
            }
            const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
            alert(`Спасибо за заказ!\nСумма: ${total} ₽\nВаши вафли скоро будут готовы.`);
            }

            function renderCart() {
            const container = document.getElementById('cartItemsList');
            const totalSpan = document.getElementById('cartTotalPrice');
            if (!container) return;

            if (cart.length === 0) {
            container.innerHTML = '<div class="cart-empty-msg">Ваша корзина пуста</div>';
            totalSpan.innerText = '0 ₽';
            return;
            }

            let total = 0;
            let html = '';
            cart.forEach(item => {
            total += item.price * item.quantity;
            html += `
            <div class="cart-item">
            <div class="cart-item-info">
            <div class="cart-item-title">${escapeHtml(item.name)}</div>
            <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
            <button class="cart-qty-btn cart-dec" data-id="${item.id}">−</button>
            <span style="min-width: 28px; text-align:center;">${item.quantity}</span>
            <button class="cart-qty-btn cart-inc" data-id="${item.id}">+</button>
            <button class="cart-remove-item" data-id="${item.id}">🗑️</button>
            </div>
            </div>
            `;
            });
            container.innerHTML = html;
            totalSpan.innerText = `${total} ₽`;

            document.querySelectorAll('.cart-dec').forEach(btn => {
            btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            changeQuantity(id, -1);
            });
            });
            document.querySelectorAll('.cart-inc').forEach(btn => {
            btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            changeQuantity(id, 1);
            });
            });
            document.querySelectorAll('.cart-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            removeItem(id);
            });
            });
            }

            function updateCartBadge() {
            const badge = document.getElementById('cartCountBadge');
            if (badge) {
            const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
            badge.innerText = totalQty;
            badge.style.display = totalQty > 0 ? 'flex' : 'none';
            }
            }

            function escapeHtml(str) {
            return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
            });
            }

            // Управление модальным окном
            const modal = document.getElementById('cartModal');
            function openCart() {
            renderCart();
            modal.classList.add('active');
            }
            function closeCart() {
            modal.classList.remove('active');
            }

            // Инициализация
            document.addEventListener('DOMContentLoaded', () => {
            loadCart();

            const cartBtn = document.getElementById('cartBtn');
            if (cartBtn) cartBtn.addEventListener('click', openCart);

            const closeBtn = document.getElementById('cartCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', closeCart);
            modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCart();
            });

            const clearBtn = document.getElementById('cartClearBtn');
            if (clearBtn) clearBtn.addEventListener('click', clearCart);
            const checkoutBtn = document.getElementById('cartCheckoutBtn');
            if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

            // Демо-кнопки (удалите этот блок после интеграции с реальными товарами)
            document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            window.addToCart(id, name, price);
            });
            });
            });
