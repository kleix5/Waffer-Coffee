// accScript.js - работа с аккаунтом (регистрация и вход через сервер)

const API_BASE = 'http://localhost:5000/api';
const CURRENT_USER_KEY = 'waffle_current_user';

// ============================================
// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}

function setCurrentUser(user) {
    if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CURRENT_USER_KEY);
    updateUIForAuth();
}

// ============================================
// === РЕГИСТРАЦИЯ ===
// ============================================
async function registerUser(name, email, password, confirm) {
    const msgDiv = document.getElementById('registerMessage');
    
    // Валидация
    if (!name.trim()) { 
        msgDiv.innerText = '❌ Введите имя'; 
        msgDiv.className = 'auth-message error';
        return false; 
    }
    if (!email.trim() || !email.includes('@')) { 
        msgDiv.innerText = '❌ Введите корректный email'; 
        msgDiv.className = 'auth-message error';
        return false; 
    }
    if (password.length < 6) { 
        msgDiv.innerText = '❌ Пароль должен быть не менее 6 символов'; 
        msgDiv.className = 'auth-message error';
        return false; 
    }
    if (password !== confirm) { 
        msgDiv.innerText = '❌ Пароли не совпадают'; 
        msgDiv.className = 'auth-message error';
        return false; 
    }

    try {
        console.log('📤 Отправка запроса регистрации...', { login: name, email });

        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                login: name,
                email: email,
                password: password,
                phone: '',
                address: ''
            })
        });

        const data = await response.json();
        console.log('📥 Ответ сервера:', data);

        if (response.ok && data.success) {
            setCurrentUser(data.user);
            msgDiv.innerText = '✅ ' + data.message;
            msgDiv.className = 'auth-message success';
            
            setTimeout(() => { 
                closeAuthModal(); 
                msgDiv.innerText = ''; 
                msgDiv.className = 'auth-message';
                document.getElementById('regName').value = '';
                document.getElementById('regEmail').value = '';
                document.getElementById('regPassword').value = '';
                document.getElementById('regConfirm').value = '';
            }, 1200);
            return true;
        } else {
            msgDiv.innerText = '❌ ' + (data.message || 'Ошибка регистрации');
            msgDiv.className = 'auth-message error';
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        msgDiv.innerText = '❌ Ошибка соединения с сервером. Проверьте, запущен ли сервер.';
        msgDiv.className = 'auth-message error';
        return false;
    }
}

// ============================================
// === ВХОД ===
// ============================================
async function loginUser(email, password) {
    const msgDiv = document.getElementById('loginMessage');
    if (!email.trim() || !password) { 
        msgDiv.innerText = '❌ Заполните поля'; 
        msgDiv.className = 'auth-message error';
        return false; 
    }

    try {
        console.log('📤 Отправка запроса входа...', { login: email });

        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: email, password: password })
        });

        const data = await response.json();
        console.log('📥 Ответ сервера:', data);

        if (response.ok && data.success) {
            setCurrentUser(data.user);
            msgDiv.innerText = '✅ ' + data.message;
            msgDiv.className = 'auth-message success';
            
            setTimeout(() => { 
                closeAuthModal(); 
                msgDiv.innerText = ''; 
                msgDiv.className = 'auth-message';
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
            }, 1000);
            return true;
        } else {
            msgDiv.innerText = '❌ ' + (data.message || 'Неверный email или пароль');
            msgDiv.className = 'auth-message error';
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        msgDiv.innerText = '❌ Ошибка соединения с сервером. Проверьте, запущен ли сервер.';
        msgDiv.className = 'auth-message error';
        return false;
    }
}

// ============================================
// === ВЫХОД ===
// ============================================
function logoutUser() { 
    setCurrentUser(null); 
    alert('👋 Вы вышли из аккаунта'); 
    closeAuthModal(); 
}

// ============================================
// === ОБНОВЛЕНИЕ UI ===
// ============================================
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
            if (dropdownMenu) {
                dropdownMenu.insertBefore(greetingItem, dropdownMenu.firstChild);
            }
        }
        const displayName = user.login || user.name || user.email?.split('@')[0] || 'Пользователь';
        greetingItem.innerHTML = `🍯 Привет, ${escapeHtml(displayName)}!`;
        if (logoutLink) logoutLink.style.display = 'block';
        if (accountLink) accountLink.innerHTML = '👤 Мой профиль';
    } else {
        if (greetingItem) greetingItem.remove();
        if (logoutLink) logoutLink.style.display = 'none';
        if (accountLink) accountLink.innerHTML = '👤 Аккаунт';
    }
}

// ============================================
// === ОТКРЫТИЕ / ЗАКРЫТИЕ МОДАЛКИ ===
// ============================================
const authModalOverlay = document.getElementById('authModal');

function openAuthModal() {
    if (getCurrentUser()) { 
        alert(`Вы уже вошли как ${getCurrentUser().login || getCurrentUser().name}. Чтобы сменить аккаунт, выйдите.`); 
        return; 
    }
    
    // Очищаем поля
    document.getElementById('registerMessage').innerText = '';
    document.getElementById('registerMessage').className = 'auth-message';
    document.getElementById('loginMessage').innerText = '';
    document.getElementById('loginMessage').className = 'auth-message';
    document.getElementById('regName').value = ''; 
    document.getElementById('regEmail').value = ''; 
    document.getElementById('regPassword').value = ''; 
    document.getElementById('regConfirm').value = '';
    document.getElementById('loginEmail').value = ''; 
    document.getElementById('loginPassword').value = '';
    
    // Показываем таб регистрации по умолчанию
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    if (registerTab) registerTab.classList.add('active');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    
    if (authModalOverlay) authModalOverlay.classList.add('active');
}

function closeAuthModal() { 
    if (authModalOverlay) authModalOverlay.classList.remove('active'); 
}

// ============================================
// === ПЕРЕКЛЮЧЕНИЕ ТАБОВ ===
// ============================================
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    } else {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }
    
    document.getElementById('registerMessage').innerText = '';
    document.getElementById('registerMessage').className = 'auth-message';
    document.getElementById('loginMessage').innerText = '';
    document.getElementById('loginMessage').className = 'auth-message';
}

// ============================================
// === ИНИЦИАЛИЗАЦИЯ ===
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию при загрузке
    const user = getCurrentUser();
    if (user) {
        console.log('✅ Пользователь авторизован:', user.login || user.email);
        updateUIForAuth();
    } else {
        updateUIForAuth();
        console.log('👤 Пользователь не авторизован');
    }

    // --- Обработчики для аккаунта ---
    const accountLink = document.getElementById('accountLink');
    if (accountLink) {
        accountLink.addEventListener('click', function(e) { 
            e.preventDefault(); 
            openAuthModal(); 
        });
    }
    
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) { 
            e.preventDefault(); 
            logoutUser(); 
        });
    }
    
    // Закрытие модалки
    const closeAuth = document.getElementById('closeAuthBtn');
    if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
    
    if (authModalOverlay) {
        authModalOverlay.addEventListener('click', function(e) { 
            if (e.target === authModalOverlay) closeAuthModal(); 
        });
    }

    // --- Переключение табов ---
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchAuthTab(this.dataset.tab);
        });
    });

    // --- Кнопка регистрации ---
    const regBtn = document.getElementById('doRegisterBtn');
    if (regBtn) {
        regBtn.addEventListener('click', function() {
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirm = document.getElementById('regConfirm').value;
            registerUser(name, email, password, confirm);
        });
    }

    // --- Кнопка входа ---
    const loginBtn = document.getElementById('doLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }

    // --- Enter для форм ---
    document.getElementById('regPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('doRegisterBtn').click();
        }
    });
    
    document.getElementById('regConfirm')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('doRegisterBtn').click();
        }
    });
    
    document.getElementById('loginPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('doLoginBtn').click();
        }
    });
});