'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gameTime: 30,
    spawnInterval: 1200,
    animalDuration: 2500
};

const ANIMALS = ['🦁', '🐘', '🦒', '🦓', '🦏', '🐆', '🦘', '🦍', '🐊', '🦜'];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    animalsCaptured: new Set()
};

let gameTimers = {
    mainTimer: null,
    spawnTimer: null
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
    animalsListDisplay: document.getElementById('animalsList'),
    gameMessage: document.getElementById('gameMessage'),
    safariScene: document.getElementById('safariScene'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Wildlife Safari Photo Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.animalsCaptured = new Set();

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.safariScene.style.display = 'block';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Add decorative elements
    createScenery();

    // Start game timer
    startTimer();

    // Start spawning animals
    spawnAnimal();
    gameTimers.spawnTimer = setInterval(spawnAnimal, CONFIG.spawnInterval);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timers
    if (gameTimers.mainTimer) {
        clearInterval(gameTimers.mainTimer);
        gameTimers.mainTimer = null;
    }
    if (gameTimers.spawnTimer) {
        clearInterval(gameTimers.spawnTimer);
        gameTimers.spawnTimer = null;
    }

    // Remove all animals
    const animals = elements.safariScene.querySelectorAll('.animal');
    animals.forEach(animal => animal.remove());

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    const animalsList = Array.from(gameState.animalsCaptured).join(' ');
    elements.animalsListDisplay.textContent = animalsList || 'None';
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;
    gameState.animalsCaptured = new Set();

    // Clear any existing timers
    if (gameTimers.mainTimer) clearInterval(gameTimers.mainTimer);
    if (gameTimers.spawnTimer) clearInterval(gameTimers.spawnTimer);

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.safariScene.style.display = 'none';
    elements.safariScene.innerHTML = '';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// TIMER FUNCTIONS
// ==========================================

function startTimer() {
    gameTimers.mainTimer = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ==========================================
// SCENERY & ANIMALS
// ==========================================

function createScenery() {
    // Add trees
    const trees = ['🌳', '🌴', '🌲'];
    for (let i = 0; i < 4; i++) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.textContent = trees[Math.floor(Math.random() * trees.length)];
        tree.style.left = `${Math.random() * 80 + 10}%`;
        tree.style.top = `${Math.random() * 60 + 20}%`;
        elements.safariScene.appendChild(tree);
    }

    // Add grass layer
    const grass = document.createElement('div');
    grass.className = 'grass';
    elements.safariScene.appendChild(grass);
}

function spawnAnimal() {
    if (!gameState.isPlaying) return;

    const animal = document.createElement('div');
    animal.className = 'animal';
    animal.textContent = randomItem(ANIMALS);

    // Random position
    const maxX = elements.safariScene.clientWidth - 60;
    const maxY = elements.safariScene.clientHeight - 60;
    animal.style.left = `${Math.random() * maxX}px`;
    animal.style.top = `${Math.random() * maxY}px`;

    // Add click/touch handler
    animal.addEventListener('touchstart', handleAnimalClick);
    animal.addEventListener('click', handleAnimalClick);

    elements.safariScene.appendChild(animal);

    // Auto-remove after duration
    setTimeout(() => {
        if (animal.parentElement && !animal.classList.contains('captured')) {
            animal.remove();
        }
    }, CONFIG.animalDuration);
}

function handleAnimalClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const animal = e.currentTarget;
    const animalType = animal.textContent;

    // Mark as captured
    animal.classList.add('captured');
    gameState.animalsCaptured.add(animalType);

    // Increment score
    gameState.score++;
    updateScoreDisplay();

    // Add pulse animation to score
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);

    // Remove animal after animation
    setTimeout(() => {
        animal.remove();
    }, 500);
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

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get random item from array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
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
    if (gameTimers.mainTimer) clearInterval(gameTimers.mainTimer);
    if (gameTimers.spawnTimer) clearInterval(gameTimers.spawnTimer);
});
