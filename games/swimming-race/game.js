'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    maxDistance: 50, // Will be changed based on user selection
    tapPower: 0.8, // How much distance each tap gives
    cpuSpeed: 0.35, // CPU swimmer speed (slightly slower than perfect tapping)
    cpuVariation: 0.15, // CPU speed variation for realism
    friction: 0.95, // Velocity decay per frame
    splashInterval: 200, // ms between splash effects
};

// Target times for medals (seconds)
const TARGET_TIMES = {
    50: {
        gold: 15,
        silver: 20,
        bronze: 25
    },
    100: {
        gold: 30,
        silver: 40,
        bronze: 50
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    distance: 0,
    cpuDistance: 0,
    velocity: 0,
    timeElapsed: 0,
    tapCount: 0,
    isPlaying: false,
    selectedDistance: 50,
    lastTapTime: 0,
    lastSplashTime: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    distance50Btn: document.getElementById('distance50'),
    distance100Btn: document.getElementById('distance100'),

    // Display elements
    distanceDisplay: document.getElementById('distance'),
    timerDisplay: document.getElementById('timer'),
    speedDisplay: document.getElementById('speed'),
    tapCounter: document.getElementById('tapCounter'),

    // Game elements
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    playerSwimmer: document.getElementById('playerSwimmer'),
    cpuSwimmer: document.getElementById('cpuSwimmer'),
    progressBar: document.getElementById('progressBar'),
    tapArea: document.getElementById('tapArea'),
    waterEffects: document.getElementById('waterEffects'),

    // Results
    finalDistance: document.getElementById('finalDistance'),
    finalTime: document.getElementById('finalTime'),
    finalSpeed: document.getElementById('finalSpeed'),
    finalTaps: document.getElementById('finalTaps'),
    resultTitle: document.getElementById('resultTitle'),
    medalDisplay: document.getElementById('medalDisplay'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Swimming Race initialized');
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

    // Distance selection
    elements.distance50Btn.addEventListener('click', () => selectDistance(50));
    elements.distance100Btn.addEventListener('click', () => selectDistance(100));

    // Tap area for swimming
    elements.tapArea.addEventListener('touchstart', handleTap);
    elements.tapArea.addEventListener('click', handleTap);

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function selectDistance(distance) {
    if (gameState.isPlaying) return;

    gameState.selectedDistance = distance;
    CONFIG.maxDistance = distance;

    // Update button states
    elements.distance50Btn.classList.toggle('selected', distance === 50);
    elements.distance100Btn.classList.toggle('selected', distance === 100);
}

// ==========================================
// GAME LOOP
// ==========================================

let lastTimestamp = 0;
let animationId = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert to seconds
    lastTimestamp = timestamp;

    // Update game logic
    updateGame(deltaTime);

    // Render game
    renderGame();

    // Check win condition
    if (gameState.distance >= CONFIG.maxDistance || gameState.cpuDistance >= CONFIG.maxDistance) {
        endGame();
        return;
    }

    // Continue loop
    animationId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    // Update timer
    gameState.timeElapsed += deltaTime;

    // Apply friction to velocity
    gameState.velocity *= CONFIG.friction;

    // Update player distance
    gameState.distance += gameState.velocity * deltaTime;
    gameState.distance = Math.min(gameState.distance, CONFIG.maxDistance);

    // Update CPU swimmer with variation
    const cpuSpeedThisFrame = CONFIG.cpuSpeed + (Math.random() - 0.5) * CONFIG.cpuVariation;
    gameState.cpuDistance += cpuSpeedThisFrame * deltaTime;
    gameState.cpuDistance = Math.min(gameState.cpuDistance, CONFIG.maxDistance);
}

function renderGame() {
    // Update time display
    elements.timerDisplay.textContent = gameState.timeElapsed.toFixed(1) + 's';

    // Update distance display
    elements.distanceDisplay.textContent = Math.floor(gameState.distance) + 'm';

    // Update speed display (taps per second approximation)
    const speedValue = Math.floor(gameState.velocity * 2);
    elements.speedDisplay.textContent = speedValue;

    // Update progress bar
    const progress = (gameState.distance / CONFIG.maxDistance) * 100;
    elements.progressBar.style.width = progress + '%';

    // Update swimmer positions
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const playerPos = (gameState.distance / CONFIG.maxDistance) * (gameAreaWidth - 80);
    const cpuPos = (gameState.cpuDistance / CONFIG.maxDistance) * (gameAreaWidth - 80);

    elements.playerSwimmer.style.left = playerPos + 'px';
    elements.cpuSwimmer.style.left = cpuPos + 'px';

    // Add swimming animation when moving
    if (gameState.velocity > 0.1) {
        elements.playerSwimmer.classList.add('swimming');
    } else {
        elements.playerSwimmer.classList.remove('swimming');
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.distance = 0;
    gameState.cpuDistance = 0;
    gameState.velocity = 0;
    gameState.timeElapsed = 0;
    gameState.tapCount = 0;
    gameState.lastTapTime = 0;
    gameState.lastSplashTime = 0;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.tapArea.classList.remove('disabled');

    updateDisplays();

    // Start game loop
    lastTimestamp = performance.now();
    animationId = requestAnimationFrame(gameLoop);

    console.log('Race started! Distance:', CONFIG.maxDistance + 'm');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    elements.tapArea.classList.add('disabled');

    // Determine result
    const playerWon = gameState.distance >= gameState.cpuDistance;
    const medal = getMedal(gameState.timeElapsed, CONFIG.maxDistance);

    // Update results display
    elements.resultTitle.textContent = playerWon ? 'You Won! 🎉' : 'CPU Won! 😅';
    elements.finalDistance.textContent = Math.floor(gameState.distance) + 'm';
    elements.finalTime.textContent = gameState.timeElapsed.toFixed(2) + 's';

    const avgSpeed = CONFIG.maxDistance / gameState.timeElapsed;
    elements.finalSpeed.textContent = avgSpeed.toFixed(1) + ' m/s';
    elements.finalTaps.textContent = gameState.tapCount;
    elements.medalDisplay.textContent = medal;

    // Show game over overlay
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Race ended. Player:', gameState.distance.toFixed(1), 'CPU:', gameState.cpuDistance.toFixed(1));
}

function resetGame() {
    gameState.distance = 0;
    gameState.cpuDistance = 0;
    gameState.velocity = 0;
    gameState.timeElapsed = 0;
    gameState.tapCount = 0;
    gameState.isPlaying = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.tapArea.classList.add('disabled');

    // Reset swimmer positions
    elements.playerSwimmer.style.left = '10px';
    elements.cpuSwimmer.style.left = '10px';
    elements.progressBar.style.width = '0%';

    // Clear water effects
    elements.waterEffects.innerHTML = '';

    updateDisplays();

    console.log('Game reset');
}

function getMedal(time, distance) {
    const targets = TARGET_TIMES[distance];
    if (time <= targets.gold) return '🥇';
    if (time <= targets.silver) return '🥈';
    if (time <= targets.bronze) return '🥉';
    return '🏊';
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

function handleTap(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const now = Date.now();

    // Increment tap count
    gameState.tapCount++;
    elements.tapCounter.textContent = gameState.tapCount;

    // Add velocity boost
    gameState.velocity += CONFIG.tapPower;

    // Limit max velocity
    gameState.velocity = Math.min(gameState.velocity, 5);

    // Visual feedback
    elements.tapArea.classList.add('pulse');
    setTimeout(() => {
        elements.tapArea.classList.remove('pulse');
    }, 100);

    // Create splash effect
    if (now - gameState.lastSplashTime > CONFIG.splashInterval) {
        createSplash();
        gameState.lastSplashTime = now;
    }

    gameState.lastTapTime = now;
}

// ==========================================
// VISUAL EFFECTS
// ==========================================

function createSplash() {
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.textContent = '🌊';

    // Position splash near swimmer
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const playerPos = (gameState.distance / CONFIG.maxDistance) * (gameAreaWidth - 80);

    splash.style.left = (playerPos + 40) + 'px';
    splash.style.top = '80px';

    elements.waterEffects.appendChild(splash);

    // Remove after animation
    setTimeout(() => {
        splash.remove();
    }, 500);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplays() {
    elements.distanceDisplay.textContent = Math.floor(gameState.distance) + 'm';
    elements.timerDisplay.textContent = gameState.timeElapsed.toFixed(1) + 's';
    elements.speedDisplay.textContent = '0';
    elements.tapCounter.textContent = gameState.tapCount;
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

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
