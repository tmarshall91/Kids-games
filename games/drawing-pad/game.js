'use strict';

// === Configuration ===
const CONFIG = {
    defaultColor: '#FF0000',
    defaultSize: 5,
    eraserColor: '#FFFFFF'
};

// === State Management ===
let drawingState = {
    isDrawing: false,
    currentColor: CONFIG.defaultColor,
    brushSize: CONFIG.defaultSize,
    tool: 'brush',
    lastX: 0,
    lastY: 0
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('drawingCanvas'),
    colorBtns: document.querySelectorAll('.color-btn'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    brushTool: document.getElementById('brushTool'),
    eraserTool: document.getElementById('eraserTool'),
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

    // Set canvas size based on container
    const containerWidth = container.clientWidth - 30;
    const containerHeight = container.clientHeight - 30;

    // Set a reasonable aspect ratio
    const maxWidth = Math.min(containerWidth, 500);
    const maxHeight = Math.min(containerHeight, 500);

    canvas.width = maxWidth;
    canvas.height = maxHeight;

    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// === Drawing Functions ===
function startDrawing(e) {
    e.preventDefault();
    drawingState.isDrawing = true;

    const pos = getCanvasPosition(e);
    drawingState.lastX = pos.x;
    drawingState.lastY = pos.y;
}

function draw(e) {
    if (!drawingState.isDrawing) return;
    e.preventDefault();

    const pos = getCanvasPosition(e);

    ctx.strokeStyle = drawingState.tool === 'eraser' ? CONFIG.eraserColor : drawingState.currentColor;
    ctx.lineWidth = drawingState.tool === 'eraser' ? drawingState.brushSize * 3 : drawingState.brushSize;

    ctx.beginPath();
    ctx.moveTo(drawingState.lastX, drawingState.lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    drawingState.lastX = pos.x;
    drawingState.lastY = pos.y;
}

function stopDrawing(e) {
    if (drawingState.isDrawing) {
        e.preventDefault();
        drawingState.isDrawing = false;
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

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return { x, y };
}

// === Tool Functions ===
function selectColor(color) {
    drawingState.currentColor = color;
    if (drawingState.tool === 'eraser') {
        selectTool('brush');
    }

    // Update UI
    elements.colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

function selectBrushSize(size) {
    drawingState.brushSize = parseInt(size);

    // Update UI
    elements.sizeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

function selectTool(tool) {
    drawingState.tool = tool;

    // Update UI
    elements.brushTool.classList.toggle('active', tool === 'brush');
    elements.eraserTool.classList.toggle('active', tool === 'eraser');
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

// === Event Handlers ===
function setupEventListeners() {
    const canvas = elements.canvas;

    // Canvas drawing events - Touch
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    // Canvas drawing events - Mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Color selection
    elements.colorBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectColor(btn.dataset.color);
        });
        btn.addEventListener('click', () => {
            selectColor(btn.dataset.color);
        });
    });

    // Brush size selection
    elements.sizeBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectBrushSize(btn.dataset.size);
        });
        btn.addEventListener('click', () => {
            selectBrushSize(btn.dataset.size);
        });
    });

    // Tool selection
    elements.brushTool.addEventListener('touchstart', (e) => {
        e.preventDefault();
        selectTool('brush');
    });
    elements.brushTool.addEventListener('click', () => {
        selectTool('brush');
    });

    elements.eraserTool.addEventListener('touchstart', (e) => {
        e.preventDefault();
        selectTool('eraser');
    });
    elements.eraserTool.addEventListener('click', () => {
        selectTool('eraser');
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

    // Prevent scrolling on mobile when drawing
    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });

    // Handle window resize
    window.addEventListener('resize', () => {
        const imageData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
        setupCanvas();
        ctx.putImageData(imageData, 0, 0);
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
