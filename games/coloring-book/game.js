'use strict';

const PICTURES = {
    flower: (ctx, cx, cy, size) => {
        // Draw flower petals
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = cx + Math.cos(angle) * size * 0.4;
            const y = cy + Math.sin(angle) * size * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Center
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
        ctx.stroke();
    },
    star: (ctx, cx, cy, size) => {
        const spikes = 5;
        const outerRadius = size * 0.5;
        const innerRadius = size * 0.2;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i - Math.PI / 2;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    },
    heart: (ctx, cx, cy, size) => {
        ctx.beginPath();
        const scale = size * 0.015;
        for (let t = 0; t <= Math.PI * 2; t += 0.1) {
            const x = cx + scale * 16 * Math.pow(Math.sin(t), 3);
            const y = cy - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    },
    sun: (ctx, cx, cy, size) => {
        // Center circle
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
        ctx.stroke();
        // Rays
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * size * 0.3, cy + Math.sin(angle) * size * 0.3);
            ctx.lineTo(cx + Math.cos(angle) * size * 0.5, cy + Math.sin(angle) * size * 0.5);
            ctx.stroke();
        }
    },
    butterfly: (ctx, cx, cy, size) => {
        // Body
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.3);
        ctx.lineTo(cx, cy + size * 0.3);
        ctx.stroke();
        // Left wings
        ctx.beginPath();
        ctx.arc(cx - size * 0.15, cy - size * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - size * 0.15, cy + size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.stroke();
        // Right wings
        ctx.beginPath();
        ctx.arc(cx + size * 0.15, cy - size * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + size * 0.15, cy + size * 0.15, size * 0.15, 0, Math.PI * 2);
        ctx.stroke();
    }
};

let coloringState = {
    currentColor: '#FF0000',
    currentPicture: 'flower',
    brushSize: 15
};

const elements = {
    canvas: document.getElementById('coloringCanvas'),
    pictureSelect: document.getElementById('pictureSelect'),
    colorBtns: document.querySelectorAll('.color-btn'),
    clearBtn: document.getElementById('clearBtn')
};

let ctx;

function initGame() {
    setupCanvas();
    setupEventListeners();
    drawPicture();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 30, container.clientHeight - 30, 500);
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
}

function drawPicture() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerX = elements.canvas.width / 2;
    const centerY = elements.canvas.height / 2;
    const size = Math.min(elements.canvas.width, elements.canvas.height) * 0.7;

    PICTURES[coloringState.currentPicture](ctx, centerX, centerY, size);
}

function handleCanvasClick(e) {
    e.preventDefault();
    const pos = getCanvasPosition(e);

    ctx.fillStyle = coloringState.currentColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, coloringState.brushSize, 0, Math.PI * 2);
    ctx.fill();
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

function setupEventListeners() {
    const canvas = elements.canvas;

    canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });
    canvas.addEventListener('touchmove', handleCanvasClick, { passive: false });
    canvas.addEventListener('mousedown', (e) => {
        canvas.isMouseDown = true;
        handleCanvasClick(e);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (canvas.isMouseDown) handleCanvasClick(e);
    });
    canvas.addEventListener('mouseup', () => canvas.isMouseDown = false);
    canvas.addEventListener('mouseleave', () => canvas.isMouseDown = false);

    elements.pictureSelect.addEventListener('change', () => {
        coloringState.currentPicture = elements.pictureSelect.value;
        drawPicture();
    });

    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            coloringState.currentColor = btn.dataset.color;
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    elements.clearBtn.addEventListener('click', () => {
        drawPicture();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) e.preventDefault();
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initGame);
