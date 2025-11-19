'use strict';

// === Configuration ===
const CONFIG = {
    sizes: {
        small: 30,
        medium: 50,
        large: 80
    }
};

// === State Management ===
let stampState = {
    currentStamp: '😀',
    currentSize: 'medium',
    stamps: []
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('stampCanvas'),
    stampBtns: document.querySelectorAll('.stamp-btn'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    clearBtn: document.getElementById('clearBtn')
};

let ctx;

// === Initialization ===
function initGame() {
    setupCanvas();
    setupEventListeners();
    render();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;

    // Set canvas size based on container
    const containerWidth = container.clientWidth - 30;
    const containerHeight = container.clientHeight - 30;

    // Set a reasonable size
    const size = Math.min(containerWidth, containerHeight, 500);

    canvas.width = size;
    canvas.height = size;

    ctx = canvas.getContext('2d');
}

// === Stamp Functions ===
function placeStamp(x, y) {
    const size = CONFIG.sizes[stampState.currentSize];

    stampState.stamps.push({
        emoji: stampState.currentStamp,
        x: x,
        y: y,
        size: size
    });

    render();
}

function clearCanvas() {
    stampState.stamps = [];
    render();
}

// === Rendering ===
function render() {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Draw all stamps
    stampState.stamps.forEach(stamp => {
        ctx.font = `${stamp.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stamp.emoji, stamp.x, stamp.y);
    });
}

// === Event Handlers ===
function handleCanvasClick(e) {
    e.preventDefault();
    const pos = getCanvasPosition(e);
    placeStamp(pos.x, pos.y);
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

function selectStamp(emoji) {
    stampState.currentStamp = emoji;

    // Update UI
    elements.stampBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.stamp === emoji);
    });
}

function selectSize(size) {
    stampState.currentSize = size;

    // Update UI
    elements.sizeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

function setupEventListeners() {
    const canvas = elements.canvas;

    // Canvas click events
    canvas.addEventListener('touchstart', handleCanvasClick, { passive: false });
    canvas.addEventListener('click', handleCanvasClick);

    // Stamp selection
    elements.stampBtns.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectStamp(btn.dataset.stamp);
        });
        btn.addEventListener('click', () => {
            selectStamp(btn.dataset.stamp);
        });
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
        if (confirm('Clear all stamps?')) {
            clearCanvas();
        }
    });
    elements.clearBtn.addEventListener('click', () => {
        if (confirm('Clear all stamps?')) {
            clearCanvas();
        }
    });

    // Prevent scrolling on canvas
    document.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });

    // Handle window resize
    window.addEventListener('resize', () => {
        const oldStamps = [...stampState.stamps];
        setupCanvas();
        stampState.stamps = oldStamps;
        render();
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
