'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    lanes: 3,
    initialSpeed: 3,
    maxSpeed: 8,
    speedIncrement: 0.002,
    obstacleFrequency: 1500, // ms
    coinFrequency: 800, // ms
    gameTime: 60, // seconds
};

const OBSTACLES = ['🚗', '🚙', '🚕', '🚌', '🚐', '🛻'];
const COIN = '🪙';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    speed: CONFIG.initialSpeed,
    currentLane: 1, // 0, 1, or 2
    isPlaying: false,
    timeLeft: CONFIG.gameTime,
    coinsCollected: 0,
    obstaclesAvoided: 0,
    gameObjects: [], // {element, lane, type}
};

// Timer intervals
let gameLoopInterval;
let obstacleInterval;
let coinInterval;
let timerInterval;

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    speedDisplay: document.getElementById('speed'),
    finalScoreDisplay: document.getElementById('finalScore'),
    coinsCollectedDisplay: document.getElementById('coinsCollected'),
    obstaclesAvoidedDisplay: document.getElementById('obstaclesAvoided'),
    gameMessage: document.getElementById('gameMessage'),
    raceTrack: document.getElementById('raceTrack'),
    playerCar: document.getElementById('playerCar'),
    obstaclesContainer: document.getElementById('obstaclesContainer'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Racing Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStart);
    elements.startBtn.addEventListener('touchstart', handleStart);

    // Control buttons
    elements.leftBtn.addEventListener('click', () => moveLeft());
    elements.leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveLeft();
    });

    elements.rightBtn.addEventListener('click', () => moveRight());
    elements.rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveRight();
    });

    // Play again button
    elements.playAgainBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Touch swipe controls on track
    let touchStartX = 0;
    elements.raceTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    elements.raceTrack.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
                moveLeft();
            } else {
                moveRight();
            }
        }
    });
}

function handleKeyPress(e) {
    if (!gameState.isPlaying) return;

    if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        moveRight();
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.speed = CONFIG.initialSpeed;
    gameState.currentLane = 1;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.coinsCollected = 0;
    gameState.obstaclesAvoided = 0;
    gameState.gameObjects = [];

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.raceTrack.style.display = 'block';
    elements.startBtn.style.display = 'none';
    elements.leftBtn.style.display = 'inline-block';
    elements.rightBtn.style.display = 'inline-block';

    // Clear obstacles container
    elements.obstaclesContainer.innerHTML = '';

    updateScoreDisplay();
    updateSpeedDisplay();
    updatePlayerPosition();

    // Start game loops
    startGameLoops();

    console.log('Race started');
}

function startGameLoops() {
    // Main game loop
    gameLoopInterval = setInterval(updateGame, 1000 / 60); // 60 FPS

    // Spawn obstacles
    obstacleInterval = setInterval(spawnObstacle, CONFIG.obstacleFrequency);

    // Spawn coins
    coinInterval = setInterval(spawnCoin, CONFIG.coinFrequency);

    // Timer
    timerInterval = setInterval(() => {
        gameState.timeLeft--;

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function updateGame() {
    if (!gameState.isPlaying) return;

    // Increase speed gradually
    if (gameState.speed < CONFIG.maxSpeed) {
        gameState.speed += CONFIG.speedIncrement;
        updateSpeedDisplay();
    }

    // Update all game objects
    gameState.gameObjects = gameState.gameObjects.filter(obj => {
        const currentTop = parseFloat(obj.element.style.top) || 0;
        const newTop = currentTop + gameState.speed;

        obj.element.style.top = newTop + 'px';

        // Check if object is still on screen
        if (newTop > elements.raceTrack.clientHeight) {
            // Object passed the screen
            if (obj.type === 'obstacle') {
                gameState.obstaclesAvoided++;
                gameState.score += 10;
                updateScoreDisplay();
            }
            obj.element.remove();
            return false;
        }

        // Check collision with player
        if (checkCollision(obj)) {
            if (obj.type === 'coin') {
                collectCoin(obj);
                return false;
            } else if (obj.type === 'obstacle') {
                crashOccurred();
                return false;
            }
        }

        return true;
    });
}

function spawnObstacle() {
    if (!gameState.isPlaying) return;

    const lane = getRandomLane();
    const obstacleEmoji = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];

    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.textContent = obstacleEmoji;
    obstacle.style.left = getLanePosition(lane);
    obstacle.style.top = '-60px';

    elements.obstaclesContainer.appendChild(obstacle);

    gameState.gameObjects.push({
        element: obstacle,
        lane: lane,
        type: 'obstacle'
    });
}

function spawnCoin() {
    if (!gameState.isPlaying) return;

    const lane = getRandomLane();

    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.textContent = COIN;
    coin.style.left = getLanePosition(lane);
    coin.style.top = '-60px';

    elements.obstaclesContainer.appendChild(coin);

    gameState.gameObjects.push({
        element: coin,
        lane: lane,
        type: 'coin'
    });
}

function getRandomLane() {
    return Math.floor(Math.random() * CONFIG.lanes);
}

function getLanePosition(lane) {
    const laneWidth = 100 / CONFIG.lanes;
    return (laneWidth * lane + laneWidth / 2) + '%';
}

function checkCollision(obj) {
    if (obj.lane !== gameState.currentLane) return false;

    const objTop = parseFloat(obj.element.style.top);
    const playerBottom = elements.raceTrack.clientHeight - 80;
    const playerTop = playerBottom - 60;

    return objTop >= playerTop && objTop <= playerBottom + 20;
}

function collectCoin(coinObj) {
    coinObj.element.remove();
    gameState.coinsCollected++;
    gameState.score += 50;
    updateScoreDisplay();

    // Visual feedback
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function crashOccurred() {
    console.log('Crash! Game Over');
    endGame();
}

function endGame() {
    gameState.isPlaying = false;

    // Clear intervals
    clearInterval(gameLoopInterval);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    clearInterval(timerInterval);

    // Update final stats
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.coinsCollectedDisplay.textContent = gameState.coinsCollected;
    elements.obstaclesAvoidedDisplay.textContent = gameState.obstaclesAvoided;

    // Show game over overlay
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Race ended. Final score:', gameState.score);
}

function resetGame() {
    // Clear all game objects
    gameState.gameObjects.forEach(obj => obj.element.remove());
    gameState.gameObjects = [];

    // Clear intervals
    clearInterval(gameLoopInterval);
    clearInterval(obstacleInterval);
    clearInterval(coinInterval);
    clearInterval(timerInterval);

    // Reset state
    gameState.score = 0;
    gameState.speed = CONFIG.initialSpeed;
    gameState.currentLane = 1;
    gameState.isPlaying = false;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.coinsCollected = 0;
    gameState.obstaclesAvoided = 0;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.raceTrack.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.leftBtn.style.display = 'none';
    elements.rightBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.obstaclesContainer.innerHTML = '';

    updateScoreDisplay();
    updateSpeedDisplay();
    updatePlayerPosition();

    console.log('Game reset');
}

// ==========================================
// PLAYER MOVEMENT
// ==========================================

function moveLeft() {
    if (!gameState.isPlaying) return;
    if (gameState.currentLane > 0) {
        gameState.currentLane--;
        updatePlayerPosition();
    }
}

function moveRight() {
    if (!gameState.isPlaying) return;
    if (gameState.currentLane < CONFIG.lanes - 1) {
        gameState.currentLane++;
        updatePlayerPosition();
    }
}

function updatePlayerPosition() {
    elements.playerCar.style.left = getLanePosition(gameState.currentLane);
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

function updateSpeedDisplay() {
    elements.speedDisplay.textContent = Math.floor(gameState.speed * 20);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
