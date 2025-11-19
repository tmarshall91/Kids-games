'use strict';

// === Configuration ===
const CONFIG = {
    styles: {
        rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
        fire: ['#FFFF00', '#FFD700', '#FFA500', '#FF6347', '#FF0000', '#8B0000'],
        ocean: ['#00CED1', '#1E90FF', '#0000FF', '#000080', '#4B0082'],
        sunset: ['#FFD700', '#FF8C00', '#FF6347', '#FF1493', '#9370DB'],
        neon: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF00FF']
    }
};

// === State Management ===
let drawState = {
    isDrawing: false,
    currentStyle: 'rainbow',
    brushSize: 10,
    colorIndex: 0,
    lastX: 0,
    lastY: 0,
    hue: 0
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('rainbowCanvas'),
    styleSelect: document.getElementById('styleSelect'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    clearBtn: document.getElementById('clearBtn')
};

let ctx;

// === Initialization ===
function initGame() {
    setupCanvas();
    setupEventListeners();
    clearCanvas();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;

    const containerWidth = container.clientWidth - 30;
    const containerHeight = container.clientHeight - 30;

    const size = Math.min(containerWidth, containerHeight, 500);

    canvas.width = size;
    canvas.height = size;

    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// === Drawing Functions ===
function startDrawing(e) {
    e.preventDefault();
    drawState.isDrawing = true;
    const pos = getCanvasPosition(e);
    drawState.lastX = pos.x;
    drawState.lastY = pos.y;
}

function draw(e) {
    if (!drawState.isDrawing) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);

    // Get current color from style
    const colors = CONFIG.styles[drawState.currentStyle];
    const color = colors[Math.floor(drawState.hue) % colors.length];

    ctx.strokeStyle = color;
    ctx.lineWidth = drawState.brushSize;

    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawState.lastX = pos.x;
    drawState.lastY = pos.y;
    drawState.hue += 0.5;
}

function stopDrawing(e) {
    if (drawState.isDrawing) {
        e.preventDefault();
        drawState.isDrawing = false;
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
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    drawState.hue = 0;
}

function selectStyle(style) {
    drawState.currentStyle = style;
    drawState.hue = 0;
}

function selectSize(size) {
    drawState.brushSize = parseInt(size);

    elements.sizeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

// === Event Handlers ===
function setupEventListeners() {
    const canvas = elements.canvas;

    // Canvas drawing events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Style selection
    elements.styleSelect.addEventListener('change', () => {
        selectStyle(elements.styleSelect.value);
    });

    // Size selection
    elements.sizeBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectSize(btn.dataset.size);
        });
        btn.addEventListener('click', () => {
            selectSize(btn.dataset.size);
        });
    });

    // Clear button
    elements.clearBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (confirm('Clear the canvas?')) {
            clearCanvas();
        }
    });
    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear the canvas?')) {
            clearCanvas();
        }
    });

    // Prevent scrolling
    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('resize', () => {
        const imageData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
        setupCanvas();
        ctx.putImageData(imageData, 0, 0);
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
