'use strict';

const EMOJIS = ['🌈', '⭐', '🌸', '🦋', '🐶', '🐱', '❤️', '🎈', '🌞', '🎨'];

let magicState = {
    isPainting: false,
    revealRadius: 30,
    totalPixels: 0,
    revealedPixels: 0
};

const elements = {
    hiddenCanvas: document.getElementById('hiddenCanvas'),
    scratchCanvas: document.getElementById('scratchCanvas'),
    newPictureBtn: document.getElementById('newPictureBtn'),
    revealBtn: document.getElementById('revealBtn'),
    percentRevealed: document.getElementById('percentRevealed'),
    revealProgress: document.getElementById('revealProgress')
};

let hiddenCtx, scratchCtx;

function initGame() {
    setupCanvas();
    setupEventListeners();
    generateNewPicture();
}

function setupCanvas() {
    const container = elements.hiddenCanvas.parentElement;
    const size = Math.min(container.clientWidth - 30, container.clientHeight - 30, 500);

    elements.hiddenCanvas.width = size;
    elements.hiddenCanvas.height = size;
    elements.scratchCanvas.width = size;
    elements.scratchCanvas.height = size;

    hiddenCtx = elements.hiddenCanvas.getContext('2d');
    scratchCtx = elements.scratchCanvas.getContext('2d');

    magicState.totalPixels = size * size;
}

function generateNewPicture() {
    // Clear hidden canvas
    hiddenCtx.fillStyle = '#FFD700';
    hiddenCtx.fillRect(0, 0, elements.hiddenCanvas.width, elements.hiddenCanvas.height);

    // Draw random emojis
    const numEmojis = 5 + Math.floor(Math.random() * 5);
    hiddenCtx.font = '60px Arial';
    hiddenCtx.textAlign = 'center';
    hiddenCtx.textBaseline = 'middle';

    for (let i = 0; i < numEmojis; i++) {
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const x = Math.random() * elements.hiddenCanvas.width;
        const y = Math.random() * elements.hiddenCanvas.height;
        hiddenCtx.fillText(emoji, x, y);
    }

    // Cover with scratch layer
    scratchCtx.fillStyle = '#888';
    scratchCtx.fillRect(0, 0, elements.scratchCanvas.width, elements.scratchCanvas.height);

    magicState.revealedPixels = 0;
    updateProgress();
}

function startPainting(e) {
    e.preventDefault();
    magicState.isPainting = true;
    reveal(e);
}

function reveal(e) {
    if (!magicState.isPainting) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(pos.x, pos.y, magicState.revealRadius, 0, Math.PI * 2);
    scratchCtx.fill();

    calculateRevealedArea();
}

function stopPainting(e) {
    if (magicState.isPainting) {
        e.preventDefault();
        magicState.isPainting = false;
    }
}

function calculateRevealedArea() {
    const imageData = scratchCtx.getImageData(0, 0, elements.scratchCanvas.width, elements.scratchCanvas.height);
    let transparent = 0;

    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) {
            transparent++;
        }
    }

    magicState.revealedPixels = transparent;
    const percent = Math.floor((transparent / magicState.totalPixels) * 100);

    updateProgress(percent);

    if (percent >= 80) {
        setTimeout(() => {
            revealAll();
            alert('🎉 You revealed the hidden picture!');
        }, 500);
    }
}

function updateProgress(percent = 0) {
    elements.percentRevealed.textContent = percent;
    elements.revealProgress.style.width = percent + '%';
}

function revealAll() {
    scratchCtx.clearRect(0, 0, elements.scratchCanvas.width, elements.scratchCanvas.height);
    updateProgress(100);
}

function getCanvasPosition(e) {
    const canvas = elements.scratchCanvas;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.type.includes('touch')) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function setupEventListeners() {
    const canvas = elements.scratchCanvas;

    canvas.addEventListener('touchstart', startPainting, { passive: false });
    canvas.addEventListener('touchmove', reveal, { passive: false });
    canvas.addEventListener('touchend', stopPainting, { passive: false });
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mousemove', reveal);
    canvas.addEventListener('mouseup', stopPainting);
    canvas.addEventListener('mouseleave', stopPainting);

    elements.newPictureBtn.addEventListener('click', generateNewPicture);
    elements.revealBtn.addEventListener('click', revealAll);

    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initGame);
