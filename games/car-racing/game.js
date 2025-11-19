'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    lanes: 3,
    playerSpeed: 15,
    obstacleSpeed: 3,
    obstacleSpawnRate: 0.02,
    speedIncrease: 0.001,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    speed: 0,
    distance: 0,
    currentLane: 1,
    isPlaying: false,
    obstacles: [],
    baseSpeed: CONFIG.obstacleSpeed,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    speedDisplay: document.getElementById('speed'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalDistanceDisplay: document.getElementById('finalDistance'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    playerCar: document.getElementById('playerCar'),
    roadMarkings: document.getElementById('roadMarkings'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);

    // Touch controls
    let touchStartX = 0;
    elements.gameArea.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    elements.gameArea.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) > 30) {
            if (diff > 0) {
                movePlayer(1);
            } else {
                movePlayer(-1);
            }
        }
    });
}

// ==========================================
// GAME LOOP
// ==========================================

let animationFrameId = null;

function gameLoop() {
    if (!gameState.isPlaying) return;

    updateGame();
    renderGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame() {
    // Update distance and score
    gameState.distance += gameState.baseSpeed;
    gameState.score = Math.floor(gameState.distance / 10);
    gameState.speed = Math.floor(gameState.baseSpeed * 10);

    // Increase difficulty
    gameState.baseSpeed += CONFIG.speedIncrease;

    // Spawn obstacles
    if (Math.random() < CONFIG.obstacleSpawnRate) {
        spawnObstacle();
    }

    // Update obstacles
    gameState.obstacles.forEach((obstacle, index) => {
        obstacle.y += gameState.baseSpeed;

        // Remove obstacles that are off screen
        if (obstacle.y > elements.gameArea.offsetHeight + 50) {
            obstacle.element.remove();
            gameState.obstacles.splice(index, 1);
        }

        // Check collision
        if (checkCollision(obstacle)) {
            endGame();
        }
    });

    updateDisplays();
}

function renderGame() {
    // Update road scroll speed
    const duration = 1 / gameState.baseSpeed;
    elements.roadMarkings.style.animationDuration = duration + 's';

    // Update obstacle positions
    gameState.obstacles.forEach(obstacle => {
        obstacle.element.style.top = obstacle.y + 'px';
    });
}

// ==========================================
// PLAYER MOVEMENT
// ==========================================

function movePlayer(direction) {
    if (!gameState.isPlaying) return;

    gameState.currentLane += direction;
    gameState.currentLane = Math.max(0, Math.min(CONFIG.lanes - 1, gameState.currentLane));

    updatePlayerPosition();
}

function updatePlayerPosition() {
    const gameWidth = elements.gameArea.offsetWidth;
    const laneWidth = gameWidth / CONFIG.lanes;
    const newLeft = (laneWidth * gameState.currentLane) + (laneWidth / 2);

    elements.playerCar.style.left = newLeft + 'px';
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        movePlayer(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        movePlayer(1);
    }
}

// ==========================================
// OBSTACLES
// ==========================================

function spawnObstacle() {
    const cars = ['🚗', '🚙', '🚕', '🚓'];
    const lane = Math.floor(Math.random() * CONFIG.lanes);
    const gameWidth = elements.gameArea.offsetWidth;
    const laneWidth = gameWidth / CONFIG.lanes;

    const obstacleElement = document.createElement('div');
    obstacleElement.className = 'obstacle-car';
    obstacleElement.textContent = cars[Math.floor(Math.random() * cars.length)];
    obstacleElement.style.left = (laneWidth * lane) + (laneWidth / 2) - 20 + 'px';
    obstacleElement.style.top = '-50px';

    elements.gameArea.appendChild(obstacleElement);

    const obstacle = {
        element: obstacleElement,
        lane: lane,
        y: -50,
        width: 40,
        height: 40,
    };

    gameState.obstacles.push(obstacle);
}

function checkCollision(obstacle) {
    const playerBottom = elements.gameArea.offsetHeight - 80;
    const playerTop = playerBottom - 48;

    // Check if obstacle is at player's position
    if (obstacle.y > playerTop - 40 && obstacle.y < playerBottom + 40) {
        // Check if in same lane
        if (obstacle.lane === gameState.currentLane) {
            return true;
        }
    }

    return false;
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.distance = 0;
    gameState.speed = 0;
    gameState.currentLane = 1;
    gameState.baseSpeed = CONFIG.obstacleSpeed;
    gameState.obstacles = [];

    // Clear existing obstacles
    document.querySelectorAll('.obstacle-car').forEach(el => el.remove());

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updatePlayerPosition();
    updateDisplays();

    // Start game loop
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalDistanceDisplay.textContent = Math.floor(gameState.distance);
    elements.gameOverOverlay.style.display = 'flex';
}

function resetGame() {
    gameState.score = 0;
    gameState.distance = 0;
    gameState.speed = 0;
    gameState.isPlaying = false;
    gameState.currentLane = 1;
    gameState.baseSpeed = CONFIG.obstacleSpeed;
    gameState.obstacles = [];

    // Clear obstacles
    document.querySelectorAll('.obstacle-car').forEach(el => el.remove());

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updatePlayerPosition();
    updateDisplays();
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

function updateDisplays() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.speedDisplay.textContent = gameState.speed;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
