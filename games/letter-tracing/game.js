'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    lineWidth: 30,
    guideColor: '#e0e0e0',
    traceColor: '#4facfe',
    completionThreshold: 0.5, // 50% coverage needed
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentLetterIndex: 0,
    score: 0,
    isPlaying: false,
    isDrawing: false,
    coverageData: null,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    clearBtn: document.getElementById('clearBtn'),
    nextBtn: document.getElementById('nextBtn'),
    continueBtn: document.getElementById('continueBtn'),
    currentLetterDisplay: document.getElementById('currentLetter'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    celebrationOverlay: document.getElementById('celebrationOverlay'),
    canvas: document.getElementById('tracingCanvas'),
};

let ctx = null;

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Letter Tracing Game initialized');
    setupCanvas();
    setupEventListeners();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const gameArea = document.getElementById('gameArea');

    // Set canvas size to fit game area
    const size = Math.min(gameArea.clientWidth - 40, gameArea.clientHeight - 40, 400);
    canvas.width = size;
    canvas.height = size;

    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupEventListeners() {
    // Buttons
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);

    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);

    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);

    // Canvas drawing events
    elements.canvas.addEventListener('touchstart', startDrawing);
    elements.canvas.addEventListener('touchmove', draw);
    elements.canvas.addEventListener('touchend', stopDrawing);

    elements.canvas.addEventListener('mousedown', startDrawing);
    elements.canvas.addEventListener('mousemove', draw);
    elements.canvas.addEventListener('mouseup', stopDrawing);
    elements.canvas.addEventListener('mouseleave', stopDrawing);

    // Resize handler
    window.addEventListener('resize', () => {
        if (gameState.isPlaying) {
            setupCanvas();
            drawLetter();
        }
    });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.currentLetterIndex = 0;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.clearBtn.style.display = 'inline-block';
    elements.nextBtn.style.display = 'inline-block';

    updateDisplay();
    drawLetter();

    console.log('Game started');
}

function nextLetter() {
    gameState.currentLetterIndex = (gameState.currentLetterIndex + 1) % CONFIG.letters.length;
    updateDisplay();
    clearCanvas();
    drawLetter();
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawLetter() {
    const letter = CONFIG.letters[gameState.currentLetterIndex];
    const canvas = elements.canvas;

    clearCanvas();

    // Draw letter outline as a guide
    ctx.save();
    ctx.font = `bold ${canvas.width * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = CONFIG.guideColor;
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
    ctx.restore();

    // Initialize coverage tracking
    gameState.coverageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function clearCanvas() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function startDrawing(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();
    gameState.isDrawing = true;

    const pos = getPointerPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!gameState.isDrawing || !gameState.isPlaying) return;
    e.preventDefault();

    const pos = getPointerPosition(e);

    // Draw the trace
    ctx.strokeStyle = CONFIG.traceColor;
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Check if letter is well-traced
    checkCompletion();
}

function stopDrawing(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();
    gameState.isDrawing = false;
    ctx.beginPath();
}

function getPointerPosition(e) {
    const rect = elements.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// ==========================================
// GAME LOGIC
// ==========================================

function checkCompletion() {
    // Simple completion check based on amount drawn
    const currentData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
    let tracedPixels = 0;
    let totalGuidePixels = 0;

    // Count pixels that have been traced
    for (let i = 0; i < currentData.data.length; i += 4) {
        const alpha = currentData.data[i + 3];
        if (alpha > 0) {
            tracedPixels++;
            // Check if this overlaps with original guide
            if (gameState.coverageData.data[i + 3] > 0) {
                totalGuidePixels++;
            }
        }
    }

    // If user has traced enough, celebrate
    if (tracedPixels > 1000 && !gameState.hasCompleted) {
        gameState.hasCompleted = true;
        celebrate();
    }
}

function celebrate() {
    gameState.score += 10;
    updateDisplay();

    elements.celebrationOverlay.style.display = 'flex';

    // Add visual feedback
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleClear(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    drawLetter();
    gameState.hasCompleted = false;
}

function handleNext(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    nextLetter();
    gameState.hasCompleted = false;
}

function handleContinue(e) {
    e.preventDefault();
    elements.celebrationOverlay.style.display = 'none';
    nextLetter();
    gameState.hasCompleted = false;
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplay() {
    elements.currentLetterDisplay.textContent = CONFIG.letters[gameState.currentLetterIndex];
    elements.scoreDisplay.textContent = gameState.score;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
