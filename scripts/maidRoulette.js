async function fetchRandomMaid() {
    try {
        const response = await fetch('/api/random-maid');
        if (!response.ok) {
            throw new Error('Ошибка загрузки: ' + response.status);
        }
        const maid = await response.json();
        return maid;
    } catch (error) {
        console.error('Ошибка при загрузке горничной:', error);
        return null;
    }
}


let lastMaidId = null;

async function updateMaidContent() {
    const maid = await fetchRandomMaid();
    if (!maid) return;

    if (maid.id === lastMaidId) {
        console.log('Та же горничная, запрашиваем ещё раз...');
        return updateMaidContent();
    }

    lastMaidId = maid.id;

    const maidImg = document.querySelector('.title_Maid-img');
    const welcomeText = document.querySelector('.titleWafle_text p');
    const maidContainer = document.querySelector('.title_Maid');

    if (!maidImg || !welcomeText) {
        console.error('Элементы на странице не найдены');
        return;
    }

    anime({
        targets: '.titleWafle_text, .title_Maid-img',
        opacity: 0,
        duration: 300,
        easing: 'easeOutQuad',
        complete: function () {
            maidImg.src = maid.imagePath;
            welcomeText.textContent = maid.welcomeText;

            maidContainer.classList.remove('title_Maid--left', 'title_Maid--right');
            maidContainer.classList.add(`title_Maid--${maid.position}`);

            anime({
                targets: '.titleWafle_text, .title_Maid-img',
                opacity: 1,
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    });
}


let rotationInterval = null;

function startRotation(intervalSeconds = 10) {
    updateMaidContent();

    if (rotationInterval) {
        clearInterval(rotationInterval);
    }

    rotationInterval = setInterval(updateMaidContent, intervalSeconds * 1000);
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    startRotation(10);
});