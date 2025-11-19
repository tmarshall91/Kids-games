'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gameTime: 30, // seconds
    numOptions: 4, // number of color options to show
    pointsPerCorrect: 10,
};

// Available colors for the game
const COLORS = [
    { name: 'RED', color: '#E74C3C', textColor: '#fff' },
    { name: 'BLUE', color: '#3498DB', textColor: '#fff' },
    { name: 'GREEN', color: '#2ECC71', textColor: '#fff' },
    { name: 'YELLOW', color: '#F1C40F', textColor: '#333' },
    { name: 'ORANGE', color: '#E67E22', textColor: '#fff' },
    { name: 'PURPLE', color: '#9B59B6', textColor: '#fff' },
    { name: 'PINK', color: '#FF69B4', textColor: '#fff' },
    { name: 'BROWN', color: '#8B4513', textColor: '#fff' },
    { name: 'BLACK', color: '#2C3E50', textColor: '#fff' },
    { name: 'GRAY', color: '#95A5A6', textColor: '#fff' },
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    correctAnswers: 0,
    totalAttempts: 0,
    currentQuestion: null,
    correctColorIndex: null,
    waitingForNext: false,
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
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalScoreDisplay: document.getElementById('finalScore'),
    accuracyText: document.getElementById('accuracyText'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game-specific elements
    questionArea: document.getElementById('questionArea'),
    colorName: document.getElementById('colorName'),
    colorOptions: document.getElementById('colorOptions'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Color Match game initialized');
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

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// TIMER MANAGEMENT
// ==========================================

let timerInterval = null;

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
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.correctAnswers = 0;
    gameState.totalAttempts = 0;
    gameState.waitingForNext = false;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.questionArea.style.display = 'block';
    elements.colorOptions.style.display = 'grid';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Start game timer
    startTimer();

    // Show first question
    generateQuestion();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Calculate accuracy
    const accuracy = gameState.totalAttempts > 0
        ? Math.round((gameState.correctAnswers / gameState.totalAttempts) * 100)
        : 0;

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.accuracyText.textContent = `Correct: ${gameState.correctAnswers}/${gameState.totalAttempts} (${accuracy}%)`;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;
    gameState.correctAnswers = 0;
    gameState.totalAttempts = 0;
    gameState.waitingForNext = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.questionArea.style.display = 'none';
    elements.colorOptions.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Clear color options
    elements.colorOptions.innerHTML = '';

    updateScoreDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// GAME LOGIC
// ==========================================

/**
 * Generate a new color matching question
 */
function generateQuestion() {
    if (!gameState.isPlaying || gameState.waitingForNext) return;

    // Pick a random color as the correct answer
    const correctColor = COLORS[randomInt(0, COLORS.length - 1)];
    gameState.currentQuestion = correctColor;

    // Pick 3 other random colors for wrong answers
    const wrongColors = [];
    while (wrongColors.length < CONFIG.numOptions - 1) {
        const randomColor = COLORS[randomInt(0, COLORS.length - 1)];
        // Make sure it's not the correct color and not already in wrong colors
        if (randomColor.name !== correctColor.name &&
            !wrongColors.find(c => c.name === randomColor.name)) {
            wrongColors.push(randomColor);
        }
    }

    // Combine correct and wrong colors, then shuffle
    const allColors = [correctColor, ...wrongColors];
    shuffleArray(allColors);

    // Find the index of the correct color after shuffling
    gameState.correctColorIndex = allColors.findIndex(c => c.name === correctColor.name);

    // Display the color name (question)
    elements.colorName.textContent = correctColor.name;

    // Re-trigger animation by removing and re-adding the element
    elements.colorName.style.animation = 'none';
    setTimeout(() => {
        elements.colorName.style.animation = '';
    }, 10);

    // Create color option buttons
    displayColorOptions(allColors);
}

/**
 * Display the color option buttons
 */
function displayColorOptions(colors) {
    // Clear existing options
    elements.colorOptions.innerHTML = '';

    // Create a button for each color
    colors.forEach((colorData, index) => {
        const button = document.createElement('button');
        button.className = 'color-button';
        button.style.backgroundColor = colorData.color;
        button.style.color = colorData.textColor;
        button.dataset.colorIndex = index;

        // Add event listeners for both touch and mouse
        button.addEventListener('touchstart', handleColorChoice);
        button.addEventListener('click', handleColorChoice);

        elements.colorOptions.appendChild(button);
    });
}

/**
 * Handle when a player chooses a color
 */
function handleColorChoice(e) {
    e.preventDefault();

    if (!gameState.isPlaying || gameState.waitingForNext) return;

    const chosenIndex = parseInt(e.currentTarget.dataset.colorIndex);
    const isCorrect = chosenIndex === gameState.correctColorIndex;

    // Track attempt
    gameState.totalAttempts++;

    if (isCorrect) {
        gameState.correctAnswers++;
        incrementScore(CONFIG.pointsPerCorrect);

        // Visual feedback
        e.currentTarget.classList.add('correct');

        // Wait a bit then show next question
        gameState.waitingForNext = true;
        setTimeout(() => {
            gameState.waitingForNext = false;
            generateQuestion();
        }, 500);
    } else {
        // Visual feedback for wrong answer
        e.currentTarget.classList.add('wrong');

        // Also highlight the correct answer
        const colorButtons = elements.colorOptions.querySelectorAll('.color-button');
        colorButtons[gameState.correctColorIndex].classList.add('correct');

        // Wait a bit then show next question
        gameState.waitingForNext = true;
        setTimeout(() => {
            gameState.waitingForNext = false;
            generateQuestion();
        }, 800);
    }
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

function incrementScore(points) {
    gameState.score += points;
    updateScoreDisplay();

    // Add visual feedback
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
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
 * Shuffle an array in place using Fisher-Yates algorithm
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

// Cleanup when page is about to unload
window.addEventListener('beforeunload', () => {
    stopTimer();
});
