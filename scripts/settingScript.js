// ========== ЛОГИКА НАСТРОЕК ==========
const defaultSettings = {
    username: '', email: '', theme: 'light',
    notifyEmail: false, notifyPromo: false, notifyOrder: false
};
function loadSettings() {
    const saved = localStorage.getItem('waffle_settings');
    const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    document.getElementById('username').value = settings.username;
    document.getElementById('email').value = settings.email;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('notifyEmail').checked = settings.notifyEmail;
    document.getElementById('notifyPromo').checked = settings.notifyPromo;
    document.getElementById('notifyOrder').checked = settings.notifyOrder;
    applyTheme(settings.theme);
}
function saveSettings() {
    const settings = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        theme: document.getElementById('theme').value,
        notifyEmail: document.getElementById('notifyEmail').checked,
        notifyPromo: document.getElementById('notifyPromo').checked,
        notifyOrder: document.getElementById('notifyOrder').checked
    };
    localStorage.setItem('waffle_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
    showMessage('Настройки сохранены!', 'success');
}
function resetSettings() {
    localStorage.removeItem('waffle_settings');
    loadSettings();
    showMessage('Настройки сброшены', 'success');
}
function applyTheme(theme) {
    const body = document.body;
    if (theme === 'dark') {
        body.style.backgroundColor = '#2c2c2c';
        body.style.color = '#f0f0f0';
        document.querySelectorAll('.settings-card, .header').forEach(el => {
            if (el) { el.style.backgroundColor = '#3a3a3a'; el.style.color = '#eee'; }
        });
    } else if (theme === 'waffle') {
        body.style.backgroundColor = '#fef2df';
        body.style.color = '#4a2e1a';
        document.querySelectorAll('.settings-card, .header').forEach(el => {
            if (el) { el.style.backgroundColor = '#fff1e0'; el.style.color = '#4a2e1a'; }
        });
    } else {
        body.style.backgroundColor = '';
        body.style.color = '';
        document.querySelectorAll('.settings-card, .header').forEach(el => {
            if (el) { el.style.backgroundColor = ''; el.style.color = ''; }
        });
    }
}
function showMessage(msg, type) {
    const area = document.getElementById('msgArea');
    area.innerHTML = `<div class="message ${type}">${msg}</div>`;
    setTimeout(() => area.innerHTML = '', 3000);
}
document.getElementById('saveBtn').onclick = saveSettings;
document.getElementById('resetBtn').onclick = resetSettings;
loadSettings();
