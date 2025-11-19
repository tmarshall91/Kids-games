'use strict';

let sceneState = {
    stickers: [],
    draggedSticker: null,
    dragOffset: { x: 0, y: 0 }
};

const elements = {
    sceneCanvas: document.getElementById('sceneCanvas'),
    stickerBtns: document.querySelectorAll('.sticker-btn'),
    clearBtn: document.getElementById('clearBtn')
};

function initGame() {
    setupEventListeners();
}

function addSticker(emoji) {
    const stickerDiv = document.createElement('div');
    stickerDiv.className = 'placed-sticker';
    stickerDiv.textContent = emoji;

    // Random initial position
    const canvasRect = elements.sceneCanvas.getBoundingClientRect();
    const x = Math.random() * (canvasRect.width - 60);
    const y = Math.random() * (canvasRect.height - 60);

    stickerDiv.style.left = x + 'px';
    stickerDiv.style.top = y + 'px';

    // Add drag events
    stickerDiv.addEventListener('touchstart', startDrag, { passive: false });
    stickerDiv.addEventListener('mousedown', startDrag);

    // Add double-tap/click to remove
    let tapCount = 0;
    let tapTimer = null;
    stickerDiv.addEventListener('touchend', (e) => {
        if (!stickerDiv.classList.contains('dragging')) {
            tapCount++;
            if (tapCount === 2) {
                stickerDiv.remove();
                tapCount = 0;
            }
            clearTimeout(tapTimer);
            tapTimer = setTimeout(() => tapCount = 0, 300);
        }
    });

    stickerDiv.addEventListener('dblclick', () => {
        stickerDiv.remove();
    });

    elements.sceneCanvas.appendChild(stickerDiv);
}

function startDrag(e) {
    e.preventDefault();
    sceneState.draggedSticker = e.currentTarget;
    sceneState.draggedSticker.classList.add('dragging');

    const stickerRect = sceneState.draggedSticker.getBoundingClientRect();
    const canvasRect = elements.sceneCanvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    sceneState.dragOffset = {
        x: clientX - stickerRect.left,
        y: clientY - stickerRect.top
    };

    // Add move and end listeners
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!sceneState.draggedSticker) return;
    e.preventDefault();

    const canvasRect = elements.sceneCanvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    let x = clientX - canvasRect.left - sceneState.dragOffset.x;
    let y = clientY - canvasRect.top - sceneState.dragOffset.y;

    // Keep within bounds
    x = Math.max(0, Math.min(x, canvasRect.width - 60));
    y = Math.max(0, Math.min(y, canvasRect.height - 60));

    sceneState.draggedSticker.style.left = x + 'px';
    sceneState.draggedSticker.style.top = y + 'px';
}

function stopDrag() {
    if (sceneState.draggedSticker) {
        sceneState.draggedSticker.classList.remove('dragging');
        sceneState.draggedSticker = null;
    }

    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

function clearScene() {
    elements.sceneCanvas.innerHTML = '';
}

function setupEventListeners() {
    elements.stickerBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            addSticker(btn.dataset.sticker);
        });
        btn.addEventListener('click', () => {
            addSticker(btn.dataset.sticker);
        });
    });

    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear all stickers?')) clearScene();
    });
}

document.addEventListener('DOMContentLoaded', initGame);
