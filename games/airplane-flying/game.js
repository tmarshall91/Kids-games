'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gravity: 0.5,
    lift: -10,
    cloudSpeed: 3,
    cloudSpawnRate: 0.015,
    starSpawnRate: 0.03,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    cloudsPassed: 0,
    altitude: 0,
    isPlaying: false,
    airplaneY: 0,
    airplaneVelocity: 0,
    clouds: [],
    stars: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    altitudeDisplay: document.getElementById('altitude'),
    finalScoreDisplay: document.getElementById('finalScore'),
    cloudsPassedDisplay: document.getElementById('cloudsPassed'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    airplane: document.getElementById('airplane'),
    sky: document.getElementById('sky'),
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

    // Game area click/touch to fly up
    elements.gameArea.addEventListener('click', handleFly);
    elements.gameArea.addEventListener('touchstart', handleFly);
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
    // Update airplane physics
    gameState.airplaneVelocity += CONFIG.gravity;
    gameState.airplaneY += gameState.airplaneVelocity;

    // Keep airplane in bounds
    const maxY = elements.gameArea.offsetHeight - 60;
    if (gameState.airplaneY < 0) {
        gameState.airplaneY = 0;
        gameState.airplaneVelocity = 0;
    } else if (gameState.airplaneY > maxY) {
        endGame();
        return;
    }

    // Update altitude
    gameState.altitude = Math.max(0, Math.floor((maxY - gameState.airplaneY) / 10));

    // Spawn clouds
    if (Math.random() < CONFIG.cloudSpawnRate) {
        spawnCloud();
    }

    // Spawn stars
    if (Math.random() < CONFIG.starSpawnRate) {
        spawnStar();
    }

    // Update clouds
    gameState.clouds.forEach((cloud, index) => {
        cloud.x -= CONFIG.cloudSpeed;

        // Award points for passing clouds
        if (!cloud.passed && cloud.x < 60) {
            cloud.passed = true;
            gameState.cloudsPassed++;
            gameState.score += 10;
        }

        // Remove clouds that are off screen
        if (cloud.x < -100) {
            cloud.element.remove();
            gameState.clouds.splice(index, 1);
        }

        // Check collision
        if (checkCloudCollision(cloud)) {
            endGame();
        }
    });

    // Update stars (collectibles)
    gameState.stars.forEach((star, index) => {
        star.x -= CONFIG.cloudSpeed;

        // Remove stars that are off screen
        if (star.x < -50) {
            star.element.remove();
            gameState.stars.splice(index, 1);
        }

        // Check collection
        if (checkStarCollection(star)) {
            star.element.remove();
            gameState.stars.splice(index, 1);
            gameState.score += 5;
            elements.scoreDisplay.classList.add('pulse');
            setTimeout(() => elements.scoreDisplay.classList.remove('pulse'), 300);
        }
    });

    updateDisplays();
}

function renderGame() {
    // Update airplane position
    elements.airplane.style.top = gameState.airplaneY + 'px';

    // Rotate airplane based on velocity
    const rotation = Math.max(-30, Math.min(30, gameState.airplaneVelocity * 3));
    elements.airplane.style.transform = `rotate(${rotation}deg)`;

    // Update cloud positions
    gameState.clouds.forEach(cloud => {
        cloud.element.style.left = cloud.x + 'px';
    });

    // Update star positions
    gameState.stars.forEach(star => {
        star.element.style.left = star.x + 'px';
    });
}

// ==========================================
// AIRPLANE CONTROL
// ==========================================

function handleFly(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    gameState.airplaneVelocity = CONFIG.lift;
}

// ==========================================
// OBSTACLES & COLLECTIBLES
// ==========================================

function spawnCloud() {
    const cloudElement = document.createElement('div');
    cloudElement.className = 'cloud';
    cloudElement.textContent = '☁️';

    const gameHeight = elements.gameArea.offsetHeight;
    const y = Math.random() * (gameHeight - 100);
    const x = elements.gameArea.offsetWidth;

    cloudElement.style.left = x + 'px';
    cloudElement.style.top = y + 'px';

    elements.sky.appendChild(cloudElement);

    const cloud = {
        element: cloudElement,
        x: x,
        y: y,
        width: 60,
        height: 60,
        passed: false,
    };

    gameState.clouds.push(cloud);
}

function spawnStar() {
    const starElement = document.createElement('div');
    starElement.className = 'star';
    starElement.textContent = '⭐';

    const gameHeight = elements.gameArea.offsetHeight;
    const y = Math.random() * (gameHeight - 100);
    const x = elements.gameArea.offsetWidth;

    starElement.style.left = x + 'px';
    starElement.style.top = y + 'px';

    elements.sky.appendChild(starElement);

    const star = {
        element: starElement,
        x: x,
        y: y,
        width: 30,
        height: 30,
    };

    gameState.stars.push(star);
}

function checkCloudCollision(cloud) {
    const airplaneLeft = 60;
    const airplaneTop = gameState.airplaneY;
    const airplaneWidth = 48;
    const airplaneHeight = 48;

    return (
        airplaneLeft < cloud.x + cloud.width &&
        airplaneLeft + airplaneWidth > cloud.x &&
        airplaneTop < cloud.y + cloud.height &&
        airplaneTop + airplaneHeight > cloud.y
    );
}

function checkStarCollection(star) {
    const airplaneLeft = 60;
    const airplaneTop = gameState.airplaneY;
    const airplaneWidth = 48;
    const airplaneHeight = 48;

    return (
        airplaneLeft < star.x + star.width &&
        airplaneLeft + airplaneWidth > star.x &&
        airplaneTop < star.y + star.height &&
        airplaneTop + airplaneHeight > star.y
    );
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.cloudsPassed = 0;
    gameState.altitude = 0;
    gameState.airplaneY = elements.gameArea.offsetHeight / 2;
    gameState.airplaneVelocity = 0;
    gameState.clouds = [];
    gameState.stars = [];

    // Clear existing elements
    document.querySelectorAll('.cloud, .star').forEach(el => el.remove());

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
    elements.cloudsPassedDisplay.textContent = gameState.cloudsPassed;
    elements.gameOverOverlay.style.display = 'flex';
}

function resetGame() {
    gameState.score = 0;
    gameState.cloudsPassed = 0;
    gameState.altitude = 0;
    gameState.isPlaying = false;
    gameState.airplaneY = elements.gameArea.offsetHeight / 2;
    gameState.airplaneVelocity = 0;
    gameState.clouds = [];
    gameState.stars = [];

    // Clear elements
    document.querySelectorAll('.cloud, .star').forEach(el => el.remove());

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    elements.airplane.style.top = gameState.airplaneY + 'px';
    elements.airplane.style.transform = 'rotate(0deg)';

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
    elements.altitudeDisplay.textContent = gameState.altitude;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
