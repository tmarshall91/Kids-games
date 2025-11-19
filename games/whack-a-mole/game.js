'use strict';

// === Configuration ===
const CONFIG = {
    gameDuration: 30000, // 30 seconds in milliseconds
    minMoleTime: 400,     // Minimum time mole stays up
    maxMoleTime: 1000,    // Maximum time mole stays up
    minDelay: 500,        // Minimum delay between moles
    maxDelay: 1500,       // Maximum delay between moles
    pointsPerHit: 10,     // Points for hitting a mole
    maxActiveMoles: 2     // Maximum number of moles up at once
};

// === State Management ===
let gameState = {
    score: 0,
    timeRemaining: 30,
    isPlaying: false,
    gameTimer: null,
    countdownInterval: null,
    activeMoles: new Set(),
    moleTimeouts: new Map()
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalScore: document.getElementById('finalScore'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    moleGrid: document.getElementById('moleGrid'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    holes: document.querySelectorAll('.hole')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    resetGame();
}

// === Event Listeners ===
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

    // Mole holes - support both touch and click
    elements.holes.forEach(hole => {
        hole.addEventListener('touchstart', handleMoleHit);
        hole.addEventListener('click', handleMoleHit);
    });

    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
        if (gameState.isPlaying) {
            e.preventDefault();
        }
    });

    // Prevent touch scrolling during gameplay
    document.addEventListener('touchmove', (e) => {
        if (gameState.isPlaying && e.target.closest('.game-container')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control Functions ===
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

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeRemaining = CONFIG.gameDuration / 1000;

    // Update UI
    updateScore(0);
    updateTimer(gameState.timeRemaining);
    elements.gameMessage.style.display = 'none';
    elements.moleGrid.classList.add('active');
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';
    elements.gameOverOverlay.style.display = 'none';

    // Start countdown
    startCountdown();

    // Start mole spawning
    spawnMole();

    // Set game timer
    gameState.gameTimer = setTimeout(() => {
        endGame();
    }, CONFIG.gameDuration);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear all timeouts and intervals
    clearTimeout(gameState.gameTimer);
    clearInterval(gameState.countdownInterval);
    gameState.moleTimeouts.forEach(timeout => clearTimeout(timeout));
    gameState.moleTimeouts.clear();

    // Hide all moles
    elements.holes.forEach(hole => {
        hole.classList.remove('up', 'whacked');
    });

    gameState.activeMoles.clear();
    elements.moleGrid.classList.remove('active');

    // Show game over screen
    showGameOver();
}

function resetGame() {
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.timeRemaining = CONFIG.gameDuration / 1000;
    gameState.activeMoles.clear();

    // Clear all timeouts
    clearTimeout(gameState.gameTimer);
    clearInterval(gameState.countdownInterval);
    gameState.moleTimeouts.forEach(timeout => clearTimeout(timeout));
    gameState.moleTimeouts.clear();

    // Reset UI
    updateScore(0);
    updateTimer(gameState.timeRemaining);
    elements.gameMessage.style.display = 'block';
    elements.moleGrid.classList.remove('active');
    elements.startBtn.style.display = 'block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Hide all moles
    elements.holes.forEach(hole => {
        hole.classList.remove('up', 'whacked');
    });
}

// === Mole Logic ===
function spawnMole() {
    if (!gameState.isPlaying) return;

    // Get available holes (not currently active)
    const availableHoles = Array.from(elements.holes).filter(hole => {
        return !hole.classList.contains('up');
    });

    // Only spawn if we have available holes and haven't reached max active moles
    if (availableHoles.length > 0 && gameState.activeMoles.size < CONFIG.maxActiveMoles) {
        // Pick a random hole
        const randomHole = availableHoles[randomInt(0, availableHoles.length - 1)];
        const holeIndex = randomHole.dataset.hole;

        // Show the mole
        randomHole.classList.add('up');
        gameState.activeMoles.add(holeIndex);

        // Set timeout to hide the mole
        const hideTime = randomInt(CONFIG.minMoleTime, CONFIG.maxMoleTime);
        const hideTimeout = setTimeout(() => {
            hideMole(randomHole, holeIndex);
        }, hideTime);

        gameState.moleTimeouts.set(holeIndex, hideTimeout);
    }

    // Schedule next mole spawn
    const nextSpawnDelay = randomInt(CONFIG.minDelay, CONFIG.maxDelay);
    setTimeout(() => spawnMole(), nextSpawnDelay);
}

function hideMole(hole, holeIndex) {
    if (hole.classList.contains('up') && !hole.classList.contains('whacked')) {
        hole.classList.remove('up');
        gameState.activeMoles.delete(holeIndex);
        gameState.moleTimeouts.delete(holeIndex);
    }
}

function handleMoleHit(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const hole = e.currentTarget;
    const holeIndex = hole.dataset.hole;

    // Check if mole is up and not already whacked
    if (hole.classList.contains('up') && !hole.classList.contains('whacked')) {
        // Mark as whacked
        hole.classList.add('whacked');
        hole.classList.remove('up');

        // Clear the hide timeout
        const timeout = gameState.moleTimeouts.get(holeIndex);
        if (timeout) {
            clearTimeout(timeout);
            gameState.moleTimeouts.delete(holeIndex);
        }

        // Remove from active moles
        gameState.activeMoles.delete(holeIndex);

        // Update score
        updateScore(gameState.score + CONFIG.pointsPerHit);

        // Show score popup
        showScorePopup(hole);

        // Remove whacked class after animation
        setTimeout(() => {
            hole.classList.remove('whacked');
        }, 300);
    }
}

// === UI Update Functions ===
function updateScore(newScore) {
    gameState.score = newScore;
    elements.scoreDisplay.textContent = gameState.score;
}

function updateTimer(seconds) {
    elements.timerDisplay.textContent = seconds;
}

function startCountdown() {
    let startTime = Date.now();
    let endTime = startTime + CONFIG.gameDuration;

    gameState.countdownInterval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
        updateTimer(remaining);

        if (remaining === 0) {
            clearInterval(gameState.countdownInterval);
        }
    }, 100);
}

function showScorePopup(hole) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${CONFIG.pointsPerHit}`;

    // Position popup over the hole
    const rect = hole.getBoundingClientRect();
    const gameAreaRect = elements.moleGrid.getBoundingClientRect();

    popup.style.left = `${rect.left - gameAreaRect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - gameAreaRect.top + rect.height / 2}px`;

    elements.moleGrid.appendChild(popup);

    // Remove popup after animation
    setTimeout(() => {
        popup.remove();
    }, 800);
}

function showGameOver() {
    elements.finalScore.textContent = gameState.score;

    // Set message based on score
    let message = '';
    if (gameState.score >= 300) {
        message = 'Amazing! You\'re a Mole Master!';
    } else if (gameState.score >= 200) {
        message = 'Awesome! Great reflexes!';
    } else if (gameState.score >= 100) {
        message = 'Well done! Keep practicing!';
    } else if (gameState.score >= 50) {
        message = 'Good effort! Try again!';
    } else {
        message = 'Nice try! You\'ll get better!';
    }

    elements.finalMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Utility Functions ===
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
