/ Получаем элементы
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// При клике на кнопку меню показываем/скрываем выпадающий список
menuBtn.addEventListener('click', function (event) {
    event.stopPropagation();  // чтобы клик не закрыл меню сразу
    dropdownMenu.classList.toggle('show');
});

// Закрываем меню при клике в любом месте страницы
document.addEventListener('click', function (event) {
    if (!menuBtn.contains(event.target)) {
        dropdownMenu.classList.remove('show');
    }
});