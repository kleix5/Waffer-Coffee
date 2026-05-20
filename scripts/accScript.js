
// ---------- СИСТЕМА РЕГИСТРАЦИИ/АККАУНТА ----------
const USERS_KEY = 'waffle_users';
const CURRENT_USER_KEY = 'waffle_current_user';

function loadUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    try { return stored ? JSON.parse(stored) : []; } catch (e) { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function setCurrentUser(user) {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
    updateUIForAuth();
}
function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function updateUIForAuth() {
    const user = getCurrentUser();
    const logoutLink = document.getElementById('logoutLink');
    const accountLink = document.getElementById('accountLink');
    const dropdownMenu = document.getElementById('dropdownMenu');
    let greetingItem = document.getElementById('greetingMenuItem');
    if (user) {
        if (!greetingItem) {
            greetingItem = document.createElement('div');
            greetingItem.id = 'greetingMenuItem';
            greetingItem.style.cssText = 'padding: 8px 16px; font-size: 0.85rem; background: #ffefdb; border-radius: 30px; margin: 6px 12px; text-align: center; color: #9b5a2c;';
            dropdownMenu.insertBefore(greetingItem, dropdownMenu.firstChild);
        }
        greetingItem.innerHTML = `🍯 Привет, ${escapeHtml(user.name || user.email.split('@')[0])}!`;
        if (logoutLink) logoutLink.style.display = 'block';
        if (accountLink) accountLink.innerHTML = '👤 Мой профиль';
    } else {
        if (greetingItem) greetingItem.remove();
        if (logoutLink) logoutLink.style.display = 'none';
        if (accountLink) accountLink.innerHTML = '👤 Аккаунт';
    }
}
function registerUser(name, email, password, confirm) {
    const msgDiv = document.getElementById('registerMessage');
    if (!name.trim()) { msgDiv.innerText = '❌ Введите имя'; return false; }
    if (!email.trim() || !email.includes('@')) { msgDiv.innerText = '❌ Введите корректный email'; return false; }
    if (password.length < 6) { msgDiv.innerText = '❌ Пароль должен быть не менее 6 символов'; return false; }
    if (password !== confirm) { msgDiv.innerText = '❌ Пароли не совпадают'; return false; }
    const users = loadUsers();
    if (users.find(u => u.email === email)) { msgDiv.innerText = '❌ Пользователь с таким email уже существует'; return false; }
    const newUser = { id: Date.now(), name: name.trim(), email: email.trim(), password: password };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    msgDiv.innerText = '✅ Регистрация успешна!';
    setTimeout(() => { closeAuthModal(); msgDiv.innerText = ''; document.getElementById('regName').value = ''; document.getElementById('regEmail').value = ''; document.getElementById('regPassword').value = ''; document.getElementById('regConfirm').value = ''; }, 1200);
    return true;
}
function loginUser(email, password) {
    const msgDiv = document.getElementById('loginMessage');
    if (!email.trim() || !password) { msgDiv.innerText = '❌ Заполните поля'; return false; }
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { msgDiv.innerText = '❌ Неверный email или пароль'; return false; }
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    msgDiv.innerText = '✅ Вход выполнен!';
    setTimeout(() => { closeAuthModal(); msgDiv.innerText = ''; document.getElementById('loginEmail').value = ''; document.getElementById('loginPassword').value = ''; }, 1000);
    return true;
}
function logoutUser() { setCurrentUser(null); alert('👋 Вы вышли из аккаунта'); closeAuthModal(); }

const authModalOverlay = document.getElementById('authModal');
function openAuthModal() {
    if (getCurrentUser()) { alert(`Вы уже вошли как ${getCurrentUser().name}. Чтобы сменить аккаунт, выйдите.`); return; }
    document.getElementById('registerMessage').innerText = '';
    document.getElementById('loginMessage').innerText = '';
    document.getElementById('regName').value = ''; document.getElementById('regEmail').value = ''; document.getElementById('regPassword').value = ''; document.getElementById('regConfirm').value = '';
    document.getElementById('loginEmail').value = ''; document.getElementById('loginPassword').value = '';
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.auth-tab[data-tab="register"]').classList.add('active');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    authModalOverlay.classList.add('active');
}
function closeAuthModal() { authModalOverlay.classList.remove('active'); }

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

    // Аккаунт
    const accountLink = document.getElementById('accountLink');
    if (accountLink) accountLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal(); });
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });
    const closeAuth = document.getElementById('closeAuthBtn');
    if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
    authModalOverlay.addEventListener('click', (e) => { if (e.target === authModalOverlay) closeAuthModal(); });
    const regBtn = document.getElementById('doRegisterBtn');
    if (regBtn) regBtn.addEventListener('click', () => {
        const name = document.getElementById('regName').value, email = document.getElementById('regEmail').value, pwd = document.getElementById('regPassword').value, conf = document.getElementById('regConfirm').value;
        registerUser(name, email, pwd, conf);
    });
    const loginBtn = document.getElementById('doLoginBtn');
    if (loginBtn) loginBtn.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value, pwd = document.getElementById('loginPassword').value;
        loginUser(email, pwd);
    });
    // Переключение табов
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            if (target === 'login') {
                document.getElementById('registerForm').classList.add('hidden');
                document.getElementById('loginForm').classList.remove('hidden');
            } else {
                document.getElementById('loginForm').classList.add('hidden');
                document.getElementById('registerForm').classList.remove('hidden');
            }
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('registerMessage').innerText = '';
            document.getElementById('loginMessage').innerText = '';
        });
    });
    updateUIForAuth();

    // Демо-кнопки (если будут добавлены)
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price);
            window.addToCart(id, name, price);
        });
    });
});
