'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    rows: 10,
    cols: 6,
    totalBubbles: 60, // 10 x 6
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    popped: 0,
    remaining: CONFIG.totalBubbles,
    isPlaying: false,
    bubbles: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalScoreDisplay: document.getElementById('finalScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Game initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// BUBBLE CREATION
// ==========================================

function createBubbles() {
    // Clear existing bubbles
    elements.gameArea.innerHTML = '';
    gameState.bubbles = [];

    // Create grid of bubbles
    for (let i = 0; i < CONFIG.totalBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.dataset.index = i;
        bubble.dataset.popped = 'false';

        // Add event listeners
        bubble.addEventListener('touchstart', handleBubblePop);
        bubble.addEventListener('click', handleBubblePop);

        elements.gameArea.appendChild(bubble);
        gameState.bubbles.push(bubble);
    }
}

function handleBubblePop(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const bubble = e.target;

    // Check if already popped
    if (bubble.dataset.popped === 'true') return;

    // Mark as popped
    bubble.dataset.popped = 'true';
    bubble.classList.add('popped');

    // Update score
    gameState.popped++;
    gameState.remaining--;

    updateScoreDisplay();
    updateRemainingDisplay();

    // Play pop sound (optional - visual feedback is enough)

    // Check if all bubbles popped
    if (gameState.remaining <= 0) {
        setTimeout(endGame, 300); // Small delay for last pop animation
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.popped = 0;
    gameState.remaining = CONFIG.totalBubbles;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Create bubbles
    createBubbles();

    updateScoreDisplay();
    updateRemainingDisplay();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.popped;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Bubbles popped:', gameState.popped);
}

function resetGame() {
    gameState.popped = 0;
    gameState.remaining = CONFIG.totalBubbles;
    gameState.isPlaying = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Clear game area
    elements.gameArea.innerHTML = '<div class="game-message" id="gameMessage"><h2>Ready to Pop?</h2><p>Tap bubbles to pop them all!</p></div>';
    elements.gameMessage = document.getElementById('gameMessage');

    updateScoreDisplay();
    updateRemainingDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.popped;
}

function updateRemainingDisplay() {
    elements.timerDisplay.textContent = gameState.remaining;
}


// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
