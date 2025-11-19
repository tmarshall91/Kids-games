'use strict';

const CONFIG = {
    brushSize: 5
};

let patternState = {
    isDrawing: false,
    symmetry: 4,
    color: '#FF0000',
    lastX: 0,
    lastY: 0,
    centerX: 0,
    centerY: 0
};

const elements = {
    canvas: document.getElementById('patternCanvas'),
    symmetrySelect: document.getElementById('symmetrySelect'),
    colorBtns: document.querySelectorAll('.color-btn'),
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
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    patternState.centerX = size / 2;
    patternState.centerY = size / 2;
}

function startDrawing(e) {
    e.preventDefault();
    patternState.isDrawing = true;
    const pos = getCanvasPosition(e);
    patternState.lastX = pos.x;
    patternState.lastY = pos.y;
}

function draw(e) {
    if (!patternState.isDrawing) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);
    const centerX = patternState.centerX;
    const centerY = patternState.centerY;

    // Draw symmetrical patterns
    for (let i = 0; i < patternState.symmetry; i++) {
        const angle = (Math.PI * 2 / patternState.symmetry) * i;

        // Rotate coordinates around center
        const x1 = rotateX(patternState.lastX, patternState.lastY, centerX, centerY, angle);
        const y1 = rotateY(patternState.lastX, patternState.lastY, centerX, centerY, angle);
        const x2 = rotateX(pos.x, pos.y, centerX, centerY, angle);
        const y2 = rotateY(pos.x, pos.y, centerX, centerY, angle);

        ctx.strokeStyle = patternState.color;
        ctx.lineWidth = CONFIG.brushSize;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    patternState.lastX = pos.x;
    patternState.lastY = pos.y;
}

function stopDrawing(e) {
    if (patternState.isDrawing) {
        e.preventDefault();
        patternState.isDrawing = false;
    }
}

function rotateX(x, y, cx, cy, angle) {
    const dx = x - cx;
    const dy = y - cy;
    return cx + dx * Math.cos(angle) - dy * Math.sin(angle);
}

function rotateY(x, y, cx, cy, angle) {
    const dx = x - cx;
    const dy = y - cy;
    return cy + dx * Math.sin(angle) + dy * Math.cos(angle);
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Draw center guides
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(patternState.centerX, 0);
    ctx.lineTo(patternState.centerX, elements.canvas.height);
    ctx.moveTo(0, patternState.centerY);
    ctx.lineTo(elements.canvas.width, patternState.centerY);
    ctx.stroke();
}

function setupEventListeners() {
    const canvas = elements.canvas;

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    elements.symmetrySelect.addEventListener('change', () => {
        patternState.symmetry = parseInt(elements.symmetrySelect.value);
    });

    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            patternState.color = btn.dataset.color;
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear the canvas?')) clearCanvas();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initGame);
