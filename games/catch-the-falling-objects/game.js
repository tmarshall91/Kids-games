'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    gameTime: 30, // seconds
    initialFallSpeed: 2, // pixels per frame
    spawnInterval: 1000, // milliseconds between object spawns
    difficultyIncrease: 0.1, // speed increase per 5 seconds
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    isPaused: false,
    fallSpeed: CONFIG.initialFallSpeed,
    spawnRate: CONFIG.spawnInterval,
};

// Falling objects array
let fallingObjects = [];
let spawnTimer = null;

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
    gameOverMessage: document.getElementById('gameOverMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game objects
    basket: document.getElementById('basket'),
};

// ==========================================
// BASKET CONTROL
// ==========================================

let basketPosition = {
    x: 0,
    isDragging: false,
    startX: 0,
};

function initBasket() {
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    // Center the basket initially
    basketPosition.x = (gameAreaRect.width - basketRect.width) / 2;
    updateBasketPosition();

    // Touch/mouse events for basket movement
    elements.basket.addEventListener('touchstart', handleBasketTouchStart);
    elements.basket.addEventListener('touchmove', handleBasketTouchMove);
    elements.basket.addEventListener('touchend', handleBasketTouchEnd);

    elements.basket.addEventListener('mousedown', handleBasketMouseDown);
    window.addEventListener('mousemove', handleBasketMouseMove);
    window.addEventListener('mouseup', handleBasketMouseUp);

    // Also allow tapping on game area to move basket
    elements.gameArea.addEventListener('touchstart', handleGameAreaTouch);
    elements.gameArea.addEventListener('click', handleGameAreaClick);
}

function handleBasketTouchStart(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    basketPosition.isDragging = true;
    const touch = e.touches[0];
    basketPosition.startX = touch.clientX - basketPosition.x;
}

function handleBasketTouchMove(e) {
    if (!gameState.isPlaying || !basketPosition.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    basketPosition.x = clamp(
        touch.clientX - basketPosition.startX - gameAreaRect.left,
        0,
        gameAreaRect.width - basketRect.width
    );

    updateBasketPosition();
}

function handleBasketTouchEnd(e) {
    e.preventDefault();
    basketPosition.isDragging = false;
}

function handleBasketMouseDown(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    basketPosition.isDragging = true;
    basketPosition.startX = e.clientX - basketPosition.x;
}

function handleBasketMouseMove(e) {
    if (!gameState.isPlaying || !basketPosition.isDragging) return;

    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    basketPosition.x = clamp(
        e.clientX - basketPosition.startX - gameAreaRect.left,
        0,
        gameAreaRect.width - basketRect.width
    );

    updateBasketPosition();
}

function handleBasketMouseUp(e) {
    basketPosition.isDragging = false;
}

function handleGameAreaTouch(e) {
    if (!gameState.isPlaying) return;
    if (e.target === elements.basket || e.target.parentElement === elements.basket) return;

    e.preventDefault();

    const touch = e.touches[0];
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    const targetX = touch.clientX - gameAreaRect.left - (basketRect.width / 2);

    basketPosition.x = clamp(
        targetX,
        0,
        gameAreaRect.width - basketRect.width
    );

    updateBasketPosition();
}

function handleGameAreaClick(e) {
    if (!gameState.isPlaying) return;
    if (e.target === elements.basket || e.target.parentElement === elements.basket) return;

    e.preventDefault();

    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    const targetX = e.clientX - gameAreaRect.left - (basketRect.width / 2);

    basketPosition.x = clamp(
        targetX,
        0,
        gameAreaRect.width - basketRect.width
    );

    updateBasketPosition();
}

function updateBasketPosition() {
    elements.basket.style.left = basketPosition.x + 'px';
}

// ==========================================
// FALLING OBJECTS
// ==========================================

const objectTypes = ['star', 'heart', 'diamond', 'coin'];

function spawnFallingObject() {
    if (!gameState.isPlaying) return;

    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const objectSize = 40;

    const object = {
        element: document.createElement('div'),
        x: randomInt(0, gameAreaRect.width - objectSize),
        y: -objectSize,
        type: objectTypes[randomInt(0, objectTypes.length - 1)],
        caught: false,
    };

    object.element.className = `falling-object ${object.type}`;
    object.element.style.left = object.x + 'px';
    object.element.style.top = object.y + 'px';

    elements.gameArea.appendChild(object.element);
    fallingObjects.push(object);
}

function startSpawning() {
    spawnTimer = setInterval(() => {
        spawnFallingObject();
    }, gameState.spawnRate);
}

function stopSpawning() {
    if (spawnTimer) {
        clearInterval(spawnTimer);
        spawnTimer = null;
    }
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Game initialized');
    setupEventListeners();
    initBasket();
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
        if (e.target.closest('.basket')) {
            e.preventDefault();
        }
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
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();

    // Update falling objects
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];

        if (obj.caught) continue;

        // Move object down
        obj.y += gameState.fallSpeed;

        // Check collision with basket
        const objRect = {
            x: obj.x,
            y: obj.y,
            width: 40,
            height: 40,
        };

        const basketBounds = {
            x: basketPosition.x,
            y: basketRect.top - gameAreaRect.top,
            width: basketRect.width,
            height: basketRect.height,
        };

        if (checkCollision(objRect, basketBounds)) {
            // Object caught!
            obj.caught = true;
            catchObject(obj);
            fallingObjects.splice(i, 1);
        } else if (obj.y > gameAreaRect.height) {
            // Object missed - remove it
            obj.element.remove();
            fallingObjects.splice(i, 1);
        }
    }
}

function renderGame() {
    // Update positions of falling objects
    fallingObjects.forEach(obj => {
        if (!obj.caught) {
            obj.element.style.top = obj.y + 'px';
        }
    });
}

function catchObject(obj) {
    // Increment score
    incrementScore(1);

    // Visual feedback
    showCatchEffect(obj.x, obj.y);

    // Remove object
    obj.element.remove();
}

function showCatchEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'catch-effect';
    effect.textContent = '+1';
    effect.style.left = (x + 20) + 'px';
    effect.style.top = y + 'px';

    elements.gameArea.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1000);
}

function startTimer() {
    let secondsPassed = 0;

    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        secondsPassed++;
        updateTimerDisplay();

        // Increase difficulty every 5 seconds
        if (secondsPassed % 5 === 0) {
            gameState.fallSpeed += CONFIG.difficultyIncrease;
            gameState.spawnRate = Math.max(500, gameState.spawnRate - 100);

            // Restart spawning with new rate
            stopSpawning();
            startSpawning();
        }

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
    gameState.fallSpeed = CONFIG.initialFallSpeed;
    gameState.spawnRate = CONFIG.spawnInterval;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Start game timer and spawning
    startTimer();
    startSpawning();

    // Start game loop
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    stopSpawning();

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;

    // Show message based on score
    let message = '';
    if (gameState.score >= 30) {
        message = 'Amazing! You are a star catcher!';
    } else if (gameState.score >= 20) {
        message = 'Great job! Keep practicing!';
    } else if (gameState.score >= 10) {
        message = 'Good effort! Try again!';
    } else {
        message = 'Keep trying! You can do it!';
    }
    elements.gameOverMessage.textContent = message;

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;
    gameState.fallSpeed = CONFIG.initialFallSpeed;
    gameState.spawnRate = CONFIG.spawnInterval;

    // Clear all falling objects
    fallingObjects.forEach(obj => obj.element.remove());
    fallingObjects = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateTimerDisplay();

    // Reset basket position
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const basketRect = elements.basket.getBoundingClientRect();
    basketPosition.x = (gameAreaRect.width - basketRect.width) / 2;
    updateBasketPosition();

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
    stopSpawning();
});
