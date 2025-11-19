'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    boatSpeed: 15,
    obstacleSpeed: 4,
    obstacleSpawnRate: 0.018,
    fishSpawnRate: 0.025,
    speedIncrease: 0.0005,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    distance: 0,
    boatX: 0,
    targetBoatX: 0,
    isPlaying: false,
    obstacles: [],
    fish: [],
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
    distanceDisplay: document.getElementById('distance'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalDistanceDisplay: document.getElementById('finalDistance'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    boat: document.getElementById('boat'),
    water: document.getElementById('water'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    setupEventListeners();
    resetGame();
    createWaves();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);

    // Touch/mouse controls
    let touchStartX = 0;
    let isDragging = false;

    elements.gameArea.addEventListener('touchstart', (e) => {
        if (!gameState.isPlaying) return;
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    });

    elements.gameArea.addEventListener('touchmove', (e) => {
        if (!gameState.isPlaying || !isDragging) return;
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        updateBoatPosition(touchX);
    });

    elements.gameArea.addEventListener('touchend', () => {
        isDragging = false;
    });

    elements.gameArea.addEventListener('mousemove', (e) => {
        if (!gameState.isPlaying) return;
        updateBoatPosition(e.clientX);
    });
}

function createWaves() {
    for (let i = 0; i < 3; i++) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        wave.style.top = (i * 200) + 'px';
        wave.style.animationDelay = (i * 1.3) + 's';
        elements.water.appendChild(wave);
    }
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

    // Increase difficulty
    gameState.baseSpeed += CONFIG.speedIncrease;

    // Smooth boat movement
    const diff = gameState.targetBoatX - gameState.boatX;
    gameState.boatX += diff * 0.2;

    // Spawn obstacles
    if (Math.random() < CONFIG.obstacleSpawnRate) {
        spawnObstacle();
    }

    // Spawn fish (collectibles)
    if (Math.random() < CONFIG.fishSpawnRate) {
        spawnFish();
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
        if (checkObstacleCollision(obstacle)) {
            endGame();
        }
    });

    // Update fish
    gameState.fish.forEach((fishItem, index) => {
        fishItem.y += gameState.baseSpeed;

        // Remove fish that are off screen
        if (fishItem.y > elements.gameArea.offsetHeight + 50) {
            fishItem.element.remove();
            gameState.fish.splice(index, 1);
        }

        // Check collection
        if (checkFishCollection(fishItem)) {
            fishItem.element.remove();
            gameState.fish.splice(index, 1);
            gameState.score += 5;
            elements.scoreDisplay.classList.add('pulse');
            setTimeout(() => elements.scoreDisplay.classList.remove('pulse'), 300);
        }
    });

    updateDisplays();
}

function renderGame() {
    // Update boat position
    elements.boat.style.left = gameState.boatX + 'px';

    // Update obstacle positions
    gameState.obstacles.forEach(obstacle => {
        obstacle.element.style.top = obstacle.y + 'px';
    });

    // Update fish positions
    gameState.fish.forEach(fishItem => {
        fishItem.element.style.top = fishItem.y + 'px';
    });
}

// ==========================================
// BOAT CONTROL
// ==========================================

function updateBoatPosition(clientX) {
    const gameRect = elements.gameArea.getBoundingClientRect();
    const relativeX = clientX - gameRect.left;
    const gameWidth = elements.gameArea.offsetWidth;

    // Keep boat within bounds (with margins)
    gameState.targetBoatX = Math.max(40, Math.min(gameWidth - 40, relativeX));
}

function handleKeyDown(e) {
    if (!gameState.isPlaying) return;

    const gameWidth = elements.gameArea.offsetWidth;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        gameState.targetBoatX = Math.max(40, gameState.targetBoatX - CONFIG.boatSpeed);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        gameState.targetBoatX = Math.min(gameWidth - 40, gameState.targetBoatX + CONFIG.boatSpeed);
    }
}

// ==========================================
// OBSTACLES & COLLECTIBLES
// ==========================================

function spawnObstacle() {
    const obstacles = ['🪨', '⚓', '🌊', '🪵'];
    const gameWidth = elements.gameArea.offsetWidth;
    const x = Math.random() * (gameWidth - 80) + 40;

    const obstacleElement = document.createElement('div');
    obstacleElement.className = 'obstacle';
    obstacleElement.textContent = obstacles[Math.floor(Math.random() * obstacles.length)];
    obstacleElement.style.left = x + 'px';
    obstacleElement.style.top = '-50px';

    elements.water.appendChild(obstacleElement);

    const obstacle = {
        element: obstacleElement,
        x: x,
        y: -50,
        width: 48,
        height: 48,
    };

    gameState.obstacles.push(obstacle);
}

function spawnFish() {
    const fishes = ['🐟', '🐠', '🐡'];
    const gameWidth = elements.gameArea.offsetWidth;
    const x = Math.random() * (gameWidth - 80) + 40;

    const fishElement = document.createElement('div');
    fishElement.className = 'fish';
    fishElement.textContent = fishes[Math.floor(Math.random() * fishes.length)];
    fishElement.style.left = x + 'px';
    fishElement.style.top = '-50px';

    elements.water.appendChild(fishElement);

    const fishItem = {
        element: fishElement,
        x: x,
        y: -50,
        width: 32,
        height: 32,
    };

    gameState.fish.push(fishItem);
}

function checkObstacleCollision(obstacle) {
    const boatTop = elements.gameArea.offsetHeight - 80 - 28;
    const boatBottom = boatTop + 56;
    const boatLeft = gameState.boatX - 28;
    const boatRight = boatLeft + 56;

    return (
        obstacle.y < boatBottom &&
        obstacle.y + obstacle.height > boatTop &&
        obstacle.x < boatRight &&
        obstacle.x + obstacle.width > boatLeft
    );
}

function checkFishCollection(fishItem) {
    const boatTop = elements.gameArea.offsetHeight - 80 - 28;
    const boatBottom = boatTop + 56;
    const boatLeft = gameState.boatX - 28;
    const boatRight = boatLeft + 56;

    return (
        fishItem.y < boatBottom &&
        fishItem.y + fishItem.height > boatTop &&
        fishItem.x < boatRight &&
        fishItem.x + fishItem.width > boatLeft
    );
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.distance = 0;
    gameState.boatX = elements.gameArea.offsetWidth / 2;
    gameState.targetBoatX = gameState.boatX;
    gameState.baseSpeed = CONFIG.obstacleSpeed;
    gameState.obstacles = [];
    gameState.fish = [];

    // Clear existing elements
    document.querySelectorAll('.obstacle, .fish').forEach(el => el.remove());

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

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
    gameState.isPlaying = false;
    gameState.boatX = elements.gameArea.offsetWidth / 2;
    gameState.targetBoatX = gameState.boatX;
    gameState.baseSpeed = CONFIG.obstacleSpeed;
    gameState.obstacles = [];
    gameState.fish = [];

    // Clear elements
    document.querySelectorAll('.obstacle, .fish').forEach(el => el.remove());

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

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
    elements.distanceDisplay.textContent = Math.floor(gameState.distance);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
