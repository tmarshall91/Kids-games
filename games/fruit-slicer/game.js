'use strict';

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
    gameTime: 30,
    spawnInterval: 1000,
    fruits: [
        { type: 'apple', emoji: '🍎' },
        { type: 'orange', emoji: '🍊' },
        { type: 'banana', emoji: '🍌' },
        { type: 'grape', emoji: '🍇' },
        { type: 'watermelon', emoji: '🍉' },
        { type: 'strawberry', emoji: '🍓' }
    ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    spawnTimer: null,
    gameTimer: null
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    fruitsContainer: document.getElementById('fruitsContainer'),
    gameInfo: document.getElementById('gameInfo'),
    finalScore: document.getElementById('finalScore'),

    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Overlays
    gameOverOverlay: document.getElementById('gameOverOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Fruit Slicer initialized');
    setupEventListeners();
    updateScoreDisplay();
    updateTimerDisplay();
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
// GAME CONTROL FUNCTIONS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    startGame();
}

function startGame() {
    // Reset state
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = true;

    // Clear any existing fruits
    elements.fruitsContainer.innerHTML = '';

    // Hide game info
    elements.gameInfo.style.display = 'none';

    // Update displays
    updateScoreDisplay();
    updateTimerDisplay();

    // Start spawning fruits
    gameState.spawnTimer = setInterval(spawnFruit, CONFIG.spawnInterval);

    // Start countdown timer
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timers
    clearInterval(gameState.spawnTimer);
    clearInterval(gameState.gameTimer);

    // Show game over overlay
    elements.finalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    // Show restart button
    elements.restartBtn.style.display = 'block';
}

// ==========================================
// FRUIT SPAWNING AND SLICING
// ==========================================

function spawnFruit() {
    if (!gameState.isPlaying) return;

    const randomFruit = CONFIG.fruits[Math.floor(Math.random() * CONFIG.fruits.length)];
    const fruit = document.createElement('div');

    fruit.className = `fruit ${randomFruit.type}`;
    fruit.textContent = randomFruit.emoji;
    fruit.style.left = `${Math.random() * 80 + 10}%`;

    // Add click/touch handler
    fruit.addEventListener('touchstart', handleFruitSlice);
    fruit.addEventListener('click', handleFruitSlice);

    elements.fruitsContainer.appendChild(fruit);

    // Remove fruit after animation
    setTimeout(() => {
        if (fruit.parentNode) {
            fruit.remove();
        }
    }, 3000);
}

function handleFruitSlice(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const fruit = e.currentTarget;

    // Add sliced animation
    fruit.classList.add('sliced');

    // Remove event listeners
    fruit.removeEventListener('touchstart', handleFruitSlice);
    fruit.removeEventListener('click', handleFruitSlice);

    // Increment score
    gameState.score++;
    updateScoreDisplay();

    // Remove fruit after animation
    setTimeout(() => {
        fruit.remove();
    }, 500);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;

    // Add warning color when time is low
    if (gameState.timeLeft <= 10) {
        elements.timerDisplay.style.color = '#ff4444';
    } else {
        elements.timerDisplay.style.color = 'white';
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
