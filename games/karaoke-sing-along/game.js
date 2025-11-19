'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    gameTime: 30, // seconds
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    isPaused: false,
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

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

let lastTimestamp = 0;
let timerInterval = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying || gameState.isPaused) return;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Update game logic
    updateGame(deltaTime);

    // Render game
    renderGame();

    // Continue loop
    if (gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGame(deltaTime) {
    // Add your game update logic here
    // This is called every frame (60fps target)
}

function renderGame() {
    // Add your game rendering logic here
    // Update DOM elements to reflect current game state
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Start game timer
    startTimer();

    // Start game loop
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateTimerDisplay();

    // Clear game area (add your cleanup logic here)

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

// Example: Game area touch/click handler
function handleGameAreaClick(e) {
    if (!gameState.isPlaying) return;

    e.preventDefault();

    // Get touch/click coordinates
    const rect = elements.gameArea.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Add your game interaction logic here
    console.log('Clicked at:', x, y);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;
}

function incrementScore(points = 1) {
    gameState.score += points;
    updateScoreDisplay();

    // Add visual feedback
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Check collision between two rectangular objects
 */
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

/**
 * Create a game object element
 */
function createGameObject(x, y) {
    const obj = document.createElement('div');
    obj.className = 'game-object';
    obj.style.left = x + 'px';
    obj.style.top = y + 'px';

    // Add touch/click handler
    obj.addEventListener('touchstart', handleObjectClick);
    obj.addEventListener('click', handleObjectClick);

    elements.gameArea.appendChild(obj);
    return obj;
}

/**
 * Example object click handler
 */
function handleObjectClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    // Remove the clicked object
    e.target.remove();

    // Increment score
    incrementScore(10);
}

/**
 * Play sound effect (if you add audio files)
 */
function playSound(soundName) {
    // Example implementation:
    // const audio = new Audio(`assets/sounds/${soundName}.mp3`);
    // audio.play().catch(e => console.log('Audio play failed:', e));
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Log when page is about to unload (for cleanup if needed)
window.addEventListener('beforeunload', () => {
    stopTimer();
});
