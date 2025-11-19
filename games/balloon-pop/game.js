'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gameTime: 30, // seconds
    spawnInterval: 800, // ms between balloon spawns
    floatDuration: { // seconds for balloon to float from bottom to top
        small: 6,
        medium: 7,
        large: 8
    },
    points: { // points awarded per balloon size
        small: 5,
        medium: 10,
        large: 15
    },
    balloonColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink'],
    balloonSizes: ['small', 'medium', 'large'],
    sizeWeights: [50, 35, 15] // probability weights for small, medium, large
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    balloonsPopped: 0,
    balloonsSpawned: 0,
    activeBalloons: new Set()
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalScoreDisplay: document.getElementById('finalScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    encouragingMessage: document.getElementById('encouragingMessage')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Balloon Pop Game initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

let timerInterval = null;
let spawnInterval = null;

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.balloonsPopped = 0;
    gameState.balloonsSpawned = 0;
    gameState.activeBalloons.clear();

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Clear any existing balloons
    clearAllBalloons();

    // Start game timer
    startTimer();

    // Start spawning balloons
    startSpawning();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    stopSpawning();

    // Calculate accuracy
    const accuracy = gameState.balloonsSpawned > 0
        ? Math.round((gameState.balloonsPopped / gameState.balloonsSpawned) * 100)
        : 0;

    // Show encouraging message
    const message = getEncouragingMessage(gameState.score, accuracy);
    elements.encouragingMessage.textContent = message;

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Score:', gameState.score, 'Popped:', gameState.balloonsPopped, 'Spawned:', gameState.balloonsSpawned);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;
    gameState.balloonsPopped = 0;
    gameState.balloonsSpawned = 0;
    gameState.activeBalloons.clear();

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateTimerDisplay();

    clearAllBalloons();

    console.log('Game reset');
}

// ==========================================
// TIMER MANAGEMENT
// ==========================================

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
// BALLOON SPAWNING
// ==========================================

function startSpawning() {
    // Spawn first balloon immediately
    spawnBalloon();

    // Continue spawning at intervals
    spawnInterval = setInterval(() => {
        if (!gameState.isPlaying) return;
        spawnBalloon();
    }, CONFIG.spawnInterval);
}

function stopSpawning() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
}

function spawnBalloon() {
    if (!gameState.isPlaying) return;

    // Random properties
    const color = randomChoice(CONFIG.balloonColors);
    const size = weightedRandomChoice(CONFIG.balloonSizes, CONFIG.sizeWeights);
    const floatDuration = CONFIG.floatDuration[size];

    // Random horizontal position (with margin for balloon width)
    const gameAreaWidth = elements.gameArea.offsetWidth;
    const balloonWidth = size === 'small' ? 50 : size === 'medium' ? 70 : 90;
    const maxX = gameAreaWidth - balloonWidth - 20;
    const x = randomInt(20, Math.max(20, maxX));

    // Random horizontal drift
    const drift = randomInt(-50, 50);

    // Create balloon
    const balloon = createBalloon(x, color, size, floatDuration, drift);

    gameState.balloonsSpawned++;
    gameState.activeBalloons.add(balloon);

    // Remove balloon after it floats away
    setTimeout(() => {
        if (gameState.activeBalloons.has(balloon)) {
            gameState.activeBalloons.delete(balloon);
            balloon.remove();
        }
    }, floatDuration * 1000 + 100);
}

function createBalloon(x, color, size, floatDuration, drift) {
    const balloon = document.createElement('div');
    balloon.className = `balloon ${color} ${size}`;

    // Create balloon body
    const body = document.createElement('div');
    body.className = 'balloon-body';
    balloon.appendChild(body);

    // Create balloon string
    const string = document.createElement('div');
    string.className = 'balloon-string';
    balloon.appendChild(string);

    // Position at bottom of screen
    const gameAreaHeight = elements.gameArea.offsetHeight;
    balloon.style.left = x + 'px';
    balloon.style.bottom = '-100px';
    balloon.style.setProperty('--drift', drift + 'px');
    balloon.style.animationDuration = floatDuration + 's';

    // Add click/touch handler
    balloon.addEventListener('touchstart', handleBalloonPop);
    balloon.addEventListener('click', handleBalloonPop);

    elements.gameArea.appendChild(balloon);

    return balloon;
}

// ==========================================
// BALLOON INTERACTION
// ==========================================

function handleBalloonPop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!gameState.isPlaying) return;

    const balloon = e.currentTarget;

    // Check if already popped
    if (balloon.classList.contains('popping')) return;

    // Get balloon size for points
    const size = balloon.classList.contains('small') ? 'small'
               : balloon.classList.contains('medium') ? 'medium'
               : 'large';

    const points = CONFIG.points[size];

    // Pop animation
    balloon.classList.add('popping');
    gameState.activeBalloons.delete(balloon);
    gameState.balloonsPopped++;

    // Show score popup
    showScorePopup(balloon, points);

    // Update score
    incrementScore(points);

    // Remove balloon after animation
    setTimeout(() => {
        balloon.remove();
    }, 300);
}

function showScorePopup(balloon, points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;

    const rect = balloon.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();

    popup.style.left = (rect.left - gameAreaRect.left + rect.width / 2 - 20) + 'px';
    popup.style.top = (rect.top - gameAreaRect.top) + 'px';

    elements.gameArea.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
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

function incrementScore(points) {
    gameState.score += points;
    updateScoreDisplay();

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
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
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }

    return items[items.length - 1];
}

function clearAllBalloons() {
    const balloons = elements.gameArea.querySelectorAll('.balloon');
    balloons.forEach(balloon => balloon.remove());
    gameState.activeBalloons.clear();
}

function getEncouragingMessage(score, accuracy) {
    if (score >= 200) {
        return "🌟 Amazing! You're a balloon popping master!";
    } else if (score >= 150) {
        return "🎉 Fantastic job! You popped so many balloons!";
    } else if (score >= 100) {
        return "😊 Great work! You're getting really good at this!";
    } else if (score >= 50) {
        return "👍 Nice job! Keep practicing to pop even more!";
    } else {
        return "🎈 Good try! Play again to beat your score!";
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopTimer();
    stopSpawning();
});
