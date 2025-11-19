'use strict';

// === Configuration ===
const CONFIG = {
    dotRadius: 8,
    dotColor: '#4FACFE',
    dotActiveColor: '#00F2FE',
    lineColor: '#666',
    completedLineColor: '#4FACFE',
    numberColor: '#333',
    difficulty: {
        easy: 10,
        medium: 20,
        hard: 30
    }
};

// === State Management ===
let gameState = {
    dots: [],
    currentDot: 0,
    lines: [],
    difficulty: 'medium',
    completed: false,
    showingHint: false
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    progress: document.getElementById('progress'),
    newGameBtn: document.getElementById('newGameBtn'),
    hintBtn: document.getElementById('hintBtn'),
    difficultySelect: document.getElementById('difficultySelect'),
    successMessage: document.getElementById('successMessage')
};

let ctx;

// === Initialization ===
function initGame() {
    setupCanvas();
    setupEventListeners();
    startNewGame();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = canvas.parentElement;

    // Set canvas size based on container
    const containerWidth = container.clientWidth - 30;
    const containerHeight = container.clientHeight - 80;

    // Set a reasonable size
    const size = Math.min(containerWidth, containerHeight, 500);

    canvas.width = size;
    canvas.height = size;

    ctx = canvas.getContext('2d');
}

// === Game Logic ===
function startNewGame() {
    gameState.completed = false;
    gameState.currentDot = 0;
    gameState.lines = [];
    gameState.showingHint = false;
    elements.successMessage.classList.remove('show');

    generateDots();
    updateProgress();
    render();
}

function generateDots() {
    const numDots = CONFIG.difficulty[gameState.difficulty];
    gameState.dots = [];

    // Generate dots in a shape pattern
    const centerX = elements.canvas.width / 2;
    const centerY = elements.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;

    // Choose random shape
    const shapes = ['circle', 'star', 'heart', 'spiral'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    for (let i = 0; i < numDots; i++) {
        const t = i / numDots;
        let x, y;

        switch (shape) {
            case 'circle':
                const angle = t * Math.PI * 2;
                x = centerX + Math.cos(angle) * radius;
                y = centerY + Math.sin(angle) * radius;
                break;

            case 'star':
                const starAngle = t * Math.PI * 2;
                const starRadius = (i % 2 === 0) ? radius : radius * 0.5;
                x = centerX + Math.cos(starAngle) * starRadius;
                y = centerY + Math.sin(starAngle) * starRadius;
                break;

            case 'heart':
                const heartT = t * Math.PI * 2;
                x = centerX + radius * 0.8 * (16 * Math.pow(Math.sin(heartT), 3));
                y = centerY - radius * 0.8 * (13 * Math.cos(heartT) - 5 * Math.cos(2 * heartT) - 2 * Math.cos(3 * heartT) - Math.cos(4 * heartT)) / 16;
                break;

            case 'spiral':
                const spiralAngle = t * Math.PI * 4;
                const spiralRadius = radius * t;
                x = centerX + Math.cos(spiralAngle) * spiralRadius;
                y = centerY + Math.sin(spiralAngle) * spiralRadius;
                break;

            default:
                x = centerX;
                y = centerY;
        }

        // Add small random offset for variety
        x += (Math.random() - 0.5) * 20;
        y += (Math.random() - 0.5) * 20;

        gameState.dots.push({
            x: Math.max(40, Math.min(x, elements.canvas.width - 40)),
            y: Math.max(40, Math.min(y, elements.canvas.height - 40)),
            number: i + 1
        });
    }
}

function handleCanvasClick(e) {
    if (gameState.completed) return;

    const pos = getCanvasPosition(e);
    const clickedDot = findDotAtPosition(pos.x, pos.y);

    if (clickedDot) {
        const expectedNumber = gameState.currentDot + 1;

        if (clickedDot.number === expectedNumber) {
            // Correct dot clicked
            if (gameState.currentDot > 0) {
                const prevDot = gameState.dots[gameState.currentDot - 1];
                gameState.lines.push({
                    from: prevDot,
                    to: clickedDot
                });
            }

            gameState.currentDot++;
            updateProgress();
            render();

            // Check if completed
            if (gameState.currentDot === gameState.dots.length) {
                completeGame();
            }
        } else {
            // Wrong dot - give feedback
            shakeDot(clickedDot);
        }
    }
}

function findDotAtPosition(x, y) {
    const hitRadius = 25; // Larger hit area for easier tapping

    for (let dot of gameState.dots) {
        const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2));
        if (distance <= hitRadius) {
            return dot;
        }
    }
    return null;
}

function shakeDot(dot) {
    // Visual feedback for wrong dot - implemented through rendering
    render();
}

function completeGame() {
    gameState.completed = true;

    // Connect last dot to first for closed shape
    const lastDot = gameState.dots[gameState.dots.length - 1];
    const firstDot = gameState.dots[0];
    gameState.lines.push({
        from: lastDot,
        to: firstDot
    });

    render();
    elements.successMessage.classList.add('show');

    setTimeout(() => {
        elements.successMessage.classList.remove('show');
    }, 3000);
}

function showHint() {
    if (gameState.completed || gameState.currentDot >= gameState.dots.length) return;

    gameState.showingHint = true;
    render();

    setTimeout(() => {
        gameState.showingHint = false;
        render();
    }, 2000);
}

// === Rendering ===
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Draw completed lines
    ctx.strokeStyle = CONFIG.completedLineColor;
    ctx.lineWidth = 3;
    gameState.lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.stroke();
    });

    // Draw hint line if showing
    if (gameState.showingHint && gameState.currentDot < gameState.dots.length - 1) {
        const currentDotObj = gameState.dots[gameState.currentDot];
        const nextDotObj = gameState.dots[gameState.currentDot + 1];

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(currentDotObj.x, currentDotObj.y);
        ctx.lineTo(nextDotObj.x, nextDotObj.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw dots and numbers
    gameState.dots.forEach((dot, index) => {
        const isNext = index === gameState.currentDot;
        const isCompleted = index < gameState.currentDot;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, CONFIG.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isNext ? CONFIG.dotActiveColor : (isCompleted ? '#aaa' : CONFIG.dotColor);
        ctx.fill();

        // Draw number
        ctx.fillStyle = isCompleted ? '#ccc' : CONFIG.numberColor;
        ctx.font = isNext ? 'bold 20px Arial' : 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dot.number, dot.x, dot.y);
    });
}

function updateProgress() {
    elements.progress.textContent = `${gameState.currentDot}/${gameState.dots.length}`;
}

// === Utility Functions ===
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

// === Event Handlers ===
function setupEventListeners() {
    // Canvas events
    elements.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleCanvasClick(e);
    }, { passive: false });

    elements.canvas.addEventListener('click', handleCanvasClick);

    // New game button
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startNewGame();
    });
    elements.newGameBtn.addEventListener('click', startNewGame);

    // Hint button
    elements.hintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showHint();
    });
    elements.hintBtn.addEventListener('click', showHint);

    // Difficulty selector
    elements.difficultySelect.addEventListener('change', () => {
        gameState.difficulty = elements.difficultySelect.value;
        startNewGame();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        setupCanvas();
        startNewGame();
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
