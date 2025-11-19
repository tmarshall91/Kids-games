'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    lettersInSoup: 15, // Number of letters floating in soup at once
    targetLettersCount: 3, // Number of target letters to include
    minAnimationDuration: 3, // Minimum float animation duration (seconds)
    maxAnimationDuration: 6, // Maximum float animation duration (seconds)
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentLetterIndex: 0, // Current letter in alphabet (0 = A, 1 = B, etc.)
    isPlaying: false,
    startTime: null,
    elapsedTime: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    progressDisplay: document.getElementById('progress'),
    timerDisplay: document.getElementById('timer'),
    finalTimeDisplay: document.getElementById('finalTime'),
    targetLetterDisplay: document.getElementById('targetLetter'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    targetContainer: document.getElementById('targetContainer'),
    soupBowl: document.getElementById('soupBowl'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Alphabet Soup initialized');
    setupEventListeners();
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
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.currentLetterIndex = 0;
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.targetContainer.style.display = 'block';
    elements.soupBowl.style.display = 'block';

    updateProgressDisplay();
    updateTargetLetter();
    createLetterSoup();

    // Start timer
    startTimer();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Show game over overlay
    const finalTime = formatTime(gameState.elapsedTime);
    elements.finalTimeDisplay.textContent = finalTime;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Time:', finalTime);
}

function resetGame() {
    gameState.currentLetterIndex = 0;
    gameState.isPlaying = false;
    gameState.startTime = null;
    gameState.elapsedTime = 0;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.targetContainer.style.display = 'none';
    elements.soupBowl.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Clear soup bowl
    elements.soupBowl.innerHTML = '';

    updateProgressDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// TIMER FUNCTIONS
// ==========================================

let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==========================================
// LETTER SOUP CREATION
// ==========================================

function createLetterSoup() {
    // Clear existing letters
    elements.soupBowl.innerHTML = '';

    const currentLetter = ALPHABET[gameState.currentLetterIndex];
    const letters = [];

    // Add target letters (the letter we're looking for)
    for (let i = 0; i < CONFIG.targetLettersCount; i++) {
        letters.push(currentLetter);
    }

    // Fill the rest with random letters (but not the current target letter)
    while (letters.length < CONFIG.lettersInSoup) {
        const randomLetter = ALPHABET[randomInt(0, ALPHABET.length - 1)];
        // Avoid adding the current target letter too many times
        if (randomLetter !== currentLetter || letters.filter(l => l === currentLetter).length < CONFIG.targetLettersCount) {
            letters.push(randomLetter);
        }
    }

    // Shuffle letters
    shuffleArray(letters);

    // Create letter tiles
    letters.forEach((letter, index) => {
        createLetterTile(letter, index);
    });
}

function createLetterTile(letter, index) {
    const tile = document.createElement('div');
    tile.className = 'letter-tile';
    tile.textContent = letter;
    tile.dataset.letter = letter;

    // Random position within the soup bowl
    const bowlRect = elements.soupBowl.getBoundingClientRect();
    const tileSize = 60; // Match CSS
    const maxX = bowlRect.width - tileSize - 10;
    const maxY = bowlRect.height - tileSize - 10;

    // Random position
    const x = randomInt(10, maxX);
    const y = randomInt(10, maxY);

    tile.style.left = x + 'px';
    tile.style.top = y + 'px';

    // Random animation duration for variety
    const duration = randomFloat(CONFIG.minAnimationDuration, CONFIG.maxAnimationDuration);
    tile.style.animationDuration = duration + 's';

    // Random animation delay for staggered effect
    const delay = index * 0.1;
    tile.style.animationDelay = delay + 's';

    // Add click handler
    tile.addEventListener('touchstart', handleLetterClick);
    tile.addEventListener('click', handleLetterClick);

    elements.soupBowl.appendChild(tile);
}

// ==========================================
// GAME INTERACTION
// ==========================================

function handleLetterClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const tile = e.currentTarget;
    const clickedLetter = tile.dataset.letter;
    const targetLetter = ALPHABET[gameState.currentLetterIndex];

    if (clickedLetter === targetLetter) {
        // Correct letter!
        handleCorrectLetter(tile);
    } else {
        // Wrong letter
        handleWrongLetter(tile);
    }
}

function handleCorrectLetter(tile) {
    // Add correct animation
    tile.classList.add('correct');

    // Play success feedback
    elements.targetLetterDisplay.classList.add('pulse');

    // Remove the tile after animation
    setTimeout(() => {
        tile.remove();

        // Move to next letter
        gameState.currentLetterIndex++;
        updateProgressDisplay();

        // Check if game is complete
        if (gameState.currentLetterIndex >= ALPHABET.length) {
            // Game complete!
            setTimeout(() => {
                endGame();
            }, 500);
        } else {
            // Update target letter and refresh soup
            updateTargetLetter();
            setTimeout(() => {
                createLetterSoup();
            }, 300);
        }

        // Remove pulse animation
        setTimeout(() => {
            elements.targetLetterDisplay.classList.remove('pulse');
        }, 300);
    }, 500);
}

function handleWrongLetter(tile) {
    // Add shake animation
    tile.classList.add('wrong');

    // Remove animation class after it completes
    setTimeout(() => {
        tile.classList.remove('wrong');
    }, 500);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateProgressDisplay() {
    elements.progressDisplay.textContent = `${gameState.currentLetterIndex}/26`;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = formatTime(gameState.elapsedTime);
}

function updateTargetLetter() {
    const currentLetter = ALPHABET[gameState.currentLetterIndex];
    elements.targetLetterDisplay.textContent = currentLetter;
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

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Shuffle array in place (Fisher-Yates algorithm)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    stopTimer();
});
