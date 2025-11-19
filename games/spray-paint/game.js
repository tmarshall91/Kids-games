'use strict';

let sprayState = {
    isDrawing: false,
    currentColor: '#FF0000',
    spraySize: 40,
    density: 50
};

const elements = {
    canvas: document.getElementById('sprayCanvas'),
    colorBtns: document.querySelectorAll('.color-btn'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    clearBtn: document.getElementById('clearBtn')
};

let ctx;

function initGame() {
    setupCanvas();
    setupEventListeners();
    clearCanvas();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 30, container.clientHeight - 30, 500);
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
}

function startDrawing(e) {
    e.preventDefault();
    sprayState.isDrawing = true;
    spray(e);
}

function spray(e) {
    if (!sprayState.isDrawing) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);

    // Create spray effect with multiple small dots
    for (let i = 0; i < sprayState.density; i++) {
        const offsetX = (Math.random() - 0.5) * sprayState.spraySize;
        const offsetY = (Math.random() - 0.5) * sprayState.spraySize;
        const x = pos.x + offsetX;
        const y = pos.y + offsetY;

        // Random size for each particle
        const size = Math.random() * 2 + 1;

        ctx.fillStyle = sprayState.currentColor;
        ctx.globalAlpha = Math.random() * 0.5 + 0.3;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function stopDrawing(e) {
    if (sprayState.isDrawing) {
        e.preventDefault();
        sprayState.isDrawing = false;
    }
}

function getCanvasPosition(e) {
    const canvas = elements.canvas;
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

function clearCanvas() {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function setupEventListeners() {
    const canvas = elements.canvas;

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', spray, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', spray);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sprayState.currentColor = btn.dataset.color;
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    elements.sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sprayState.spraySize = parseInt(btn.dataset.size);
            elements.sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear the wall?')) clearCanvas();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initGame);
