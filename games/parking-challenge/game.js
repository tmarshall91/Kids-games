'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const LEVELS = [
    { time: 30, obstacles: [], spotPos: { x: 60, y: 60 }, carStart: { x: 20, y: 80 } },
    { time: 25, obstacles: [{ x: 50, y: 50, emoji: '🚧' }], spotPos: { x: 75, y: 30 }, carStart: { x: 10, y: 80 } },
    { time: 30, obstacles: [{ x: 40, y: 40, emoji: '🚧' }, { x: 70, y: 60, emoji: '🛢️' }], spotPos: { x: 80, y: 80 }, carStart: { x: 10, y: 10 } },
    { time: 25, obstacles: [{ x: 50, y: 30, emoji: '🚧' }, { x: 30, y: 70, emoji: '🛢️' }, { x: 70, y: 70, emoji: '🌳' }], spotPos: { x: 50, y: 50 }, carStart: { x: 10, y: 10 } },
    { time: 35, obstacles: [{ x: 30, y: 30, emoji: '🚧' }, { x: 70, y: 30, emoji: '🛢️' }, { x: 30, y: 70, emoji: '🌳' }, { x: 65, y: 65, emoji: '🚧' }], spotPos: { x: 85, y: 85 }, carStart: { x: 10, y: 10 } },
];

const CONFIG = {
    moveSpeed: 3,
    carSize: 48,
    spotSize: 80,
    parkingTolerance: 15,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentLevel: 0,
    timeLeft: 30,
    carX: 0,
    carY: 0,
    carRotation: 0,
    isPlaying: false,
    isParked: false,
    timerInterval: null,
    keysPressed: {},
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    nextBtn: document.getElementById('nextBtn'),
    continueBtn: document.getElementById('continueBtn'),
    retryBtn: document.getElementById('retryBtn'),
    levelDisplay: document.getElementById('level'),
    timerDisplay: document.getElementById('timer'),
    completedLevelDisplay: document.getElementById('completedLevel'),
    completedTimeDisplay: document.getElementById('completedTime'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    successOverlay: document.getElementById('successOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    car: document.getElementById('car'),
    parkingSpot: document.getElementById('parkingSpot'),
    parkingLot: document.getElementById('parkingLot'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    setupEventListeners();
    loadLevel(0);
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', restartLevel);
    elements.nextBtn.addEventListener('click', nextLevel);
    elements.continueBtn.addEventListener('click', nextLevel);
    elements.retryBtn.addEventListener('click', restartLevel);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Mobile controls
    elements.upBtn.addEventListener('touchstart', () => gameState.keysPressed['ArrowUp'] = true);
    elements.upBtn.addEventListener('touchend', () => gameState.keysPressed['ArrowUp'] = false);
    elements.upBtn.addEventListener('mousedown', () => gameState.keysPressed['ArrowUp'] = true);
    elements.upBtn.addEventListener('mouseup', () => gameState.keysPressed['ArrowUp'] = false);

    elements.downBtn.addEventListener('touchstart', () => gameState.keysPressed['ArrowDown'] = true);
    elements.downBtn.addEventListener('touchend', () => gameState.keysPressed['ArrowDown'] = false);
    elements.downBtn.addEventListener('mousedown', () => gameState.keysPressed['ArrowDown'] = true);
    elements.downBtn.addEventListener('mouseup', () => gameState.keysPressed['ArrowDown'] = false);

    elements.leftBtn.addEventListener('touchstart', () => gameState.keysPressed['ArrowLeft'] = true);
    elements.leftBtn.addEventListener('touchend', () => gameState.keysPressed['ArrowLeft'] = false);
    elements.leftBtn.addEventListener('mousedown', () => gameState.keysPressed['ArrowLeft'] = true);
    elements.leftBtn.addEventListener('mouseup', () => gameState.keysPressed['ArrowLeft'] = false);

    elements.rightBtn.addEventListener('touchstart', () => gameState.keysPressed['ArrowRight'] = true);
    elements.rightBtn.addEventListener('touchend', () => gameState.keysPressed['ArrowRight'] = false);
    elements.rightBtn.addEventListener('mousedown', () => gameState.keysPressed['ArrowRight'] = true);
    elements.rightBtn.addEventListener('mouseup', () => gameState.keysPressed['ArrowRight'] = false);
}

// ==========================================
// LEVEL MANAGEMENT
// ==========================================

function loadLevel(levelIndex) {
    if (levelIndex >= LEVELS.length) {
        showGameComplete();
        return;
    }

    gameState.currentLevel = levelIndex;
    const level = LEVELS[levelIndex];

    gameState.timeLeft = level.time;
    gameState.isParked = false;

    // Clear obstacles
    document.querySelectorAll('.obstacle').forEach(el => el.remove());

    // Position car
    const lotRect = elements.parkingLot.getBoundingClientRect();
    gameState.carX = (lotRect.width * level.carStart.x / 100);
    gameState.carY = (lotRect.height * level.carStart.y / 100);
    gameState.carRotation = 0;

    updateCarPosition();

    // Position parking spot
    elements.parkingSpot.style.left = level.spotPos.x + '%';
    elements.parkingSpot.style.top = level.spotPos.y + '%';

    // Add obstacles
    level.obstacles.forEach(obs => {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.textContent = obs.emoji;
        obstacle.style.left = obs.x + '%';
        obstacle.style.top = obs.y + '%';
        elements.parkingLot.appendChild(obstacle);
    });

    // Update UI
    elements.levelDisplay.textContent = levelIndex + 1;
    elements.timerDisplay.textContent = gameState.timeLeft;
    elements.gameMessage.style.display = 'block';
    elements.nextBtn.style.display = 'none';
    elements.restartBtn.style.display = 'none';
}

// ==========================================
// GAME LOOP
// ==========================================

let animationFrameId = null;

function gameLoop() {
    if (!gameState.isPlaying || gameState.isParked) return;

    handleCarMovement();
    checkParking();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleCarMovement() {
    const lotRect = elements.parkingLot.getBoundingClientRect();
    let moved = false;

    // Forward/Backward movement
    if (gameState.keysPressed['ArrowUp']) {
        const rad = (gameState.carRotation - 90) * Math.PI / 180;
        gameState.carX += Math.cos(rad) * CONFIG.moveSpeed;
        gameState.carY += Math.sin(rad) * CONFIG.moveSpeed;
        moved = true;
    }
    if (gameState.keysPressed['ArrowDown']) {
        const rad = (gameState.carRotation - 90) * Math.PI / 180;
        gameState.carX -= Math.cos(rad) * CONFIG.moveSpeed;
        gameState.carY -= Math.sin(rad) * CONFIG.moveSpeed;
        moved = true;
    }

    // Rotation
    if (gameState.keysPressed['ArrowLeft']) {
        gameState.carRotation -= 3;
        moved = true;
    }
    if (gameState.keysPressed['ArrowRight']) {
        gameState.carRotation += 3;
        moved = true;
    }

    // Keep car in bounds
    gameState.carX = Math.max(CONFIG.carSize / 2, Math.min(lotRect.width - CONFIG.carSize / 2, gameState.carX));
    gameState.carY = Math.max(CONFIG.carSize / 2, Math.min(lotRect.height - CONFIG.carSize / 2, gameState.carY));

    if (moved) {
        updateCarPosition();
    }
}

function updateCarPosition() {
    elements.car.style.left = gameState.carX + 'px';
    elements.car.style.top = gameState.carY + 'px';
    elements.car.style.transform = `translate(-50%, -50%) rotate(${gameState.carRotation}deg)`;
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        gameState.keysPressed[e.key] = true;
    }
}

function handleKeyUp(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        gameState.keysPressed[e.key] = false;
    }
}

// ==========================================
// PARKING VALIDATION
// ==========================================

function checkParking() {
    const spotRect = elements.parkingSpot.getBoundingClientRect();
    const lotRect = elements.parkingLot.getBoundingClientRect();

    const spotCenterX = spotRect.left - lotRect.left + spotRect.width / 2;
    const spotCenterY = spotRect.top - lotRect.top + spotRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(gameState.carX - spotCenterX, 2) +
        Math.pow(gameState.carY - spotCenterY, 2)
    );

    if (distance < CONFIG.parkingTolerance) {
        parkingSuccess();
    }
}

function parkingSuccess() {
    gameState.isParked = true;
    gameState.isPlaying = false;

    stopTimer();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    const level = LEVELS[gameState.currentLevel];
    const timeUsed = level.time - gameState.timeLeft;

    elements.completedLevelDisplay.textContent = gameState.currentLevel + 1;
    elements.completedTimeDisplay.textContent = timeUsed;
    elements.successOverlay.style.display = 'flex';
    elements.nextBtn.style.display = 'inline-block';
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.keysPressed = {};

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    startTimer();
    requestAnimationFrame(gameLoop);
}

function restartLevel() {
    stopTimer();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    gameState.isPlaying = false;
    gameState.keysPressed = {};

    elements.gameOverOverlay.style.display = 'none';
    elements.successOverlay.style.display = 'none';

    loadLevel(gameState.currentLevel);
    startGame();
}

function nextLevel() {
    stopTimer();
    elements.successOverlay.style.display = 'none';
    loadLevel(gameState.currentLevel + 1);
}

function showGameComplete() {
    elements.gameMessage.innerHTML = '<h2>🎉 All Levels Complete!</h2><p>You\'re a parking pro!</p>';
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'none';
    setControlsEnabled(false);
}

// ==========================================
// TIMER
// ==========================================

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        elements.timerDisplay.textContent = gameState.timeLeft;

        if (gameState.timeLeft <= 0) {
            timeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function timeUp() {
    gameState.isPlaying = false;
    stopTimer();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.gameOverOverlay.style.display = 'flex';
}

// ==========================================
// UI HELPERS
// ==========================================

function setControlsEnabled(enabled) {
    elements.upBtn.disabled = !enabled;
    elements.downBtn.disabled = !enabled;
    elements.leftBtn.disabled = !enabled;
    elements.rightBtn.disabled = !enabled;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Clear keys on blur
window.addEventListener('blur', () => {
    gameState.keysPressed = {};
});
