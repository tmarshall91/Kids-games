'use strict';

// === Configuration ===
const CONFIG = {
    canvasSize: 400,
    dotRadius: 8,
    lineWidth: 3
};

// === Picture Templates ===
const PICTURES = [
    {
        name: 'Star',
        dots: [
            { x: 50, y: 35 }, { x: 55, y: 50 }, { x: 70, y: 50 },
            { x: 60, y: 60 }, { x: 65, y: 75 }, { x: 50, y: 65 },
            { x: 35, y: 75 }, { x: 40, y: 60 }, { x: 30, y: 50 },
            { x: 45, y: 50 }
        ]
    },
    {
        name: 'House',
        dots: [
            { x: 50, y: 25 }, { x: 70, y: 40 }, { x: 70, y: 75 },
            { x: 30, y: 75 }, { x: 30, y: 40 }
        ]
    },
    {
        name: 'Heart',
        dots: [
            { x: 50, y: 40 }, { x: 60, y: 30 }, { x: 70, y: 30 },
            { x: 75, y: 40 }, { x: 70, y: 50 }, { x: 50, y: 70 },
            { x: 30, y: 50 }, { x: 25, y: 40 }, { x: 30, y: 30 },
            { x: 40, y: 30 }
        ]
    },
    {
        name: 'Diamond',
        dots: [
            { x: 50, y: 20 }, { x: 70, y: 50 }, { x: 50, y: 80 },
            { x: 30, y: 50 }
        ]
    },
    {
        name: 'Tree',
        dots: [
            { x: 50, y: 20 }, { x: 60, y: 35 }, { x: 55, y: 35 },
            { x: 65, y: 50 }, { x: 55, y: 50 }, { x: 55, y: 80 },
            { x: 45, y: 80 }, { x: 45, y: 50 }, { x: 35, y: 50 },
            { x: 45, y: 35 }, { x: 40, y: 35 }
        ]
    },
    {
        name: 'Flower',
        dots: [
            { x: 50, y: 30 }, { x: 60, y: 35 }, { x: 65, y: 45 },
            { x: 60, y: 55 }, { x: 50, y: 60 }, { x: 40, y: 55 },
            { x: 35, y: 45 }, { x: 40, y: 35 }, { x: 50, y: 45 },
            { x: 50, y: 75 }
        ]
    }
];

// === State Management ===
let gameState = {
    currentPicture: null,
    dots: [],
    currentDotIndex: 0,
    connections: [],
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
    nextNumber: document.getElementById('nextNumber'),
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

    elements.clearBtn.addEventListener('click', clearAndRestart);
    elements.clearBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        clearAndRestart();
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
    gameState.currentDotIndex = 0;
    gameState.connections = [];
    gameState.isPlaying = true;

    // Select random picture
    gameState.currentPicture = PICTURES[Math.floor(Math.random() * PICTURES.length)];

    // Scale dots to canvas size
    const size = gameState.canvas.width;
    gameState.dots = gameState.currentPicture.dots.map(dot => ({
        x: (dot.x / 100) * size,
        y: (dot.y / 100) * size
    }));

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    elements.controls.style.display = 'flex';
    elements.gameMessage.style.display = 'none';

    updateStats();
    render();
}

// === Canvas Click Handler ===
function handleCanvasClick(e) {
    const rect = gameState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleDotClick(x, y);
}

function handleCanvasTouch(e) {
    e.preventDefault();
    const rect = gameState.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleDotClick(x, y);
}

function handleDotClick(x, y) {
    if (!gameState.isPlaying) return;

    const nextDot = gameState.dots[gameState.currentDotIndex];
    const distance = Math.sqrt((x - nextDot.x) ** 2 + (y - nextDot.y) ** 2);

    if (distance <= CONFIG.dotRadius * 2) {
        // Correct dot clicked
        if (gameState.currentDotIndex > 0) {
            const prevDot = gameState.dots[gameState.currentDotIndex - 1];
            gameState.connections.push({
                from: prevDot,
                to: nextDot
            });
        }

        gameState.currentDotIndex++;
        updateStats();
        render();

        // Check if complete
        if (gameState.currentDotIndex >= gameState.dots.length) {
            // Connect last to first to close the shape
            gameState.connections.push({
                from: gameState.dots[gameState.dots.length - 1],
                to: gameState.dots[0]
            });
            render();
            endGame();
        }
    }
}

// === Rendering ===
function render() {
    const ctx = gameState.ctx;
    const canvas = gameState.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    gameState.connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
    });

    // Draw dots
    gameState.dots.forEach((dot, index) => {
        const isNext = index === gameState.currentDotIndex;
        const isConnected = index < gameState.currentDotIndex;

        // Dot circle
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, CONFIG.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isConnected ? '#4CAF50' : (isNext ? '#FF9800' : '#667eea');
        ctx.fill();

        // Dot border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, dot.x, dot.y);

        // Pulse animation for next dot
        if (isNext) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, CONFIG.dotRadius + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 2;
            ctx.stroke();
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

    // Fill the shape
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.beginPath();
    gameState.dots.forEach((dot, index) => {
        if (index === 0) {
            ctx.moveTo(dot.x, dot.y);
        } else {
            ctx.lineTo(dot.x, dot.y);
        }
    });
    ctx.closePath();
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.stroke();

    // Draw dots
    gameState.dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, CONFIG.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#4CAF50';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Show completion message
    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameMessage.style.display = 'block';
    }, 1000);
}

// === Clear and Restart ===
function clearAndRestart() {
    gameState.currentDotIndex = 0;
    gameState.connections = [];
    updateStats();
    render();
}

// === UI Updates ===
function updateStats() {
    const totalDots = gameState.dots.length;
    const progress = Math.round((gameState.currentDotIndex / totalDots) * 100);

    elements.nextNumber.textContent = gameState.currentDotIndex + 1;
    elements.progress.textContent = `${progress}%`;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
