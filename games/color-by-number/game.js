'use strict';

// === Configuration ===
const CONFIG = {
    canvasSize: 400,
    colors: [
        { number: 1, color: '#FF6B6B', name: 'Red' },
        { number: 2, color: '#4ECDC4', name: 'Cyan' },
        { number: 3, color: '#FFE66D', name: 'Yellow' },
        { number: 4, color: '#95E1D3', name: 'Mint' },
        { number: 5, color: '#F38181', name: 'Pink' },
        { number: 6, color: '#AA96DA', name: 'Purple' }
    ]
};

// === Picture Templates ===
const PICTURES = [
    {
        name: 'Geometric',
        regions: [
            { number: 1, path: [[20, 20], [40, 20], [40, 40], [20, 40]] },
            { number: 2, path: [[45, 20], [65, 20], [65, 40], [45, 40]] },
            { number: 3, path: [[70, 20], [90, 20], [90, 40], [70, 40]] },
            { number: 4, path: [[20, 45], [40, 45], [40, 65], [20, 65]] },
            { number: 5, path: [[45, 45], [65, 45], [65, 65], [45, 65]] },
            { number: 6, path: [[70, 45], [90, 45], [90, 65], [70, 65]] },
            { number: 1, path: [[20, 70], [40, 70], [40, 90], [20, 90]] },
            { number: 2, path: [[45, 70], [65, 70], [65, 90], [45, 90]] },
            { number: 3, path: [[70, 70], [90, 70], [90, 90], [70, 90]] }
        ]
    },
    {
        name: 'Simple Flower',
        regions: [
            { number: 1, path: [[50, 30], [60, 40], [50, 50], [40, 40]] }, // top petal
            { number: 2, path: [[60, 50], [70, 60], [60, 70], [50, 60]] }, // right petal
            { number: 3, path: [[50, 70], [60, 80], [50, 90], [40, 80]] }, // bottom petal
            { number: 4, path: [[30, 50], [40, 60], [30, 70], [20, 60]] }, // left petal
            { number: 5, path: [[45, 50], [55, 50], [55, 60], [45, 60]] }, // center
            { number: 6, path: [[48, 62], [52, 62], [52, 90], [48, 90]] }  // stem
        ]
    }
];

// === State Management ===
let gameState = {
    currentPicture: null,
    regions: [],
    coloredRegions: [],
    selectedColor: null,
    isPlaying: false,
    canvas: null,
    ctx: null,
    resultCanvas: null,
    resultCtx: null
};

// === DOM References ===
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    gameMessage: document.getElementById('gameMessage'),
    controls: document.getElementById('controls'),
    startBtn: document.getElementById('startBtn'),
    clearBtn: document.getElementById('clearBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    colorPalette: document.getElementById('colorPalette'),
    colored: document.getElementById('colored'),
    total: document.getElementById('total'),
    progress: document.getElementById('progress'),
    gameCanvas: document.getElementById('gameCanvas'),
    resultCanvas: document.getElementById('resultCanvas')
};

// === Initialization ===
function initGame() {
    setupCanvas();
    setupEventListeners();
}

function setupCanvas() {
    // Main canvas
    gameState.canvas = elements.gameCanvas;
    gameState.ctx = gameState.canvas.getContext('2d');

    const size = Math.min(CONFIG.canvasSize, window.innerWidth - 60);
    gameState.canvas.width = size;
    gameState.canvas.height = size;

    // Result canvas
    gameState.resultCanvas = elements.resultCanvas;
    gameState.resultCtx = gameState.resultCanvas.getContext('2d');
    gameState.resultCanvas.width = size;
    gameState.resultCanvas.height = size;
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.clearBtn.addEventListener('click', clearAll);
    elements.clearBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clearAll();
    });

    elements.newGameBtn.addEventListener('click', startGame);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    // Canvas click
    gameState.canvas.addEventListener('click', handleCanvasClick);
    gameState.canvas.addEventListener('touchstart', handleCanvasTouch);
}

// === Game Start ===
function startGame() {
    gameState.coloredRegions = [];
    gameState.selectedColor = null;
    gameState.isPlaying = true;

    // Select random picture
    gameState.currentPicture = PICTURES[Math.floor(Math.random() * PICTURES.length)];

    // Scale regions to canvas size
    const size = gameState.canvas.width;
    gameState.regions = gameState.currentPicture.regions.map(region => ({
        number: region.number,
        path: region.path.map(point => [
            (point[0] / 100) * size,
            (point[1] / 100) * size
        ]),
        colored: false,
        color: null
    }));

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    elements.controls.style.display = 'flex';
    elements.gameMessage.style.display = 'none';

    createColorPalette();
    updateStats();
    render();
}

// === Create Color Palette ===
function createColorPalette() {
    elements.colorPalette.innerHTML = '';

    CONFIG.colors.forEach(colorInfo => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.backgroundColor = colorInfo.color;

        const numberSpan = document.createElement('div');
        numberSpan.className = 'color-number';
        numberSpan.textContent = colorInfo.number;

        const labelSpan = document.createElement('div');
        labelSpan.className = 'color-label';
        labelSpan.textContent = colorInfo.name;

        btn.appendChild(numberSpan);
        btn.appendChild(labelSpan);

        btn.addEventListener('click', () => selectColor(colorInfo));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectColor(colorInfo);
        });

        elements.colorPalette.appendChild(btn);
    });
}

// === Select Color ===
function selectColor(colorInfo) {
    gameState.selectedColor = colorInfo;

    // Update active state
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// === Canvas Click Handler ===
function handleCanvasClick(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleRegionClick(x, y);
}

function handleCanvasTouch(e) {
    e.preventDefault();
    const rect = gameState.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleRegionClick(x, y);
}

function handleRegionClick(x, y) {
    if (!gameState.isPlaying || !gameState.selectedColor) return;

    // Find clicked region
    const region = gameState.regions.find(r =>
        !r.colored && r.number === gameState.selectedColor.number && isPointInPolygon(x, y, r.path)
    );

    if (region) {
        region.colored = true;
        region.color = gameState.selectedColor.color;
        updateStats();
        render();

        // Check if complete
        if (gameState.regions.every(r => r.colored)) {
            endGame();
        }
    }
}

// === Point in Polygon Test ===
function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// === Rendering ===
function render() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw regions
    gameState.regions.forEach(region => {
        // Fill if colored
        if (region.colored) {
            ctx.fillStyle = region.color;
            ctx.beginPath();
            region.path.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point[0], point[1]);
                else ctx.lineTo(point[0], point[1]);
            });
            ctx.closePath();
            ctx.fill();
        }

        // Draw border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        region.path.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point[0], point[1]);
            else ctx.lineTo(point[0], point[1]);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw number if not colored
        if (!region.colored) {
            const centerX = region.path.reduce((sum, p) => sum + p[0], 0) / region.path.length;
            const centerY = region.path.reduce((sum, p) => sum + p[1], 0) / region.path.length;

            ctx.fillStyle = '#666';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(region.number, centerX, centerY);
        }
    });
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;

    // Draw final result on result canvas
    const ctx = gameState.resultCtx;
    const canvas = gameState.resultCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw colored regions
    gameState.regions.forEach(region => {
        ctx.fillStyle = region.color;
        ctx.beginPath();
        region.path.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point[0], point[1]);
            else ctx.lineTo(point[0], point[1]);
        });
        ctx.closePath();
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Show completion message
    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameMessage.style.display = 'block';
    }, 1000);
}

// === Clear All ===
function clearAll() {
    gameState.regions.forEach(region => {
        region.colored = false;
        region.color = null;
    });
    updateStats();
    render();
}

// === UI Updates ===
function updateStats() {
    const totalRegions = gameState.regions.length;
    const coloredCount = gameState.regions.filter(r => r.colored).length;
    const progress = Math.round((coloredCount / totalRegions) * 100);

    elements.colored.textContent = coloredCount;
    elements.total.textContent = totalRegions;
    elements.progress.textContent = `${progress}%`;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
