'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalRounds: 10,
    yellowDuration: 1000, // 1 second yellow warning
    minRedDuration: 1500, // Minimum time on red
    maxRedDuration: 3500, // Maximum time on red
    maxGreenWaitTime: 5000, // Maximum time to wait for green tap
};

// Light color constants
const COLORS = {
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green',
    NONE: 'none'
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    currentRound: 0,
    isPlaying: false,
    currentColor: COLORS.NONE,
    greenStartTime: null,
    bestReactionTime: null,
    canTap: false,
    penalties: 0,
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
    bestTimeDisplay: document.getElementById('bestTime'),
    finalScoreDisplay: document.getElementById('finalScore'),
    bestReactionDisplay: document.getElementById('bestReaction'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Traffic light elements
    trafficLight: document.getElementById('trafficLight'),
    redLight: document.getElementById('redLight'),
    yellowLight: document.getElementById('yellowLight'),
    greenLight: document.getElementById('greenLight'),
    instructionText: document.getElementById('instructionText'),
    reactionTime: document.getElementById('reactionTime'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Traffic Light Game initialized');
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

    // Traffic light tap handler
    elements.trafficLight.addEventListener('touchstart', handleTrafficLightTap);
    elements.trafficLight.addEventListener('click', handleTrafficLightTap);

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
    gameState.currentRound = 0;
    gameState.penalties = 0;
    gameState.bestReactionTime = null;
    gameState.canTap = false;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.trafficLight.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateBestTimeDisplay();

    console.log('Game started');

    // Start first round after a short delay
    setTimeout(() => {
        nextRound();
    }, 500);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear all lights
    setLight(COLORS.NONE);

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    const bestTimeText = gameState.bestReactionTime
        ? `${gameState.bestReactionTime} ms`
        : 'N/A';
    elements.bestReactionDisplay.textContent = bestTimeText;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.currentRound = 0;
    gameState.isPlaying = false;
    gameState.currentColor = COLORS.NONE;
    gameState.bestReactionTime = null;
    gameState.canTap = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.trafficLight.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.reactionTime.textContent = '';

    updateScoreDisplay();
    updateBestTimeDisplay();
    setLight(COLORS.NONE);

    console.log('Game reset');
}

// ==========================================
// GAME LOGIC
// ==========================================

function nextRound() {
    if (!gameState.isPlaying) return;

    gameState.currentRound++;

    // Check if game is complete
    if (gameState.currentRound > CONFIG.totalRounds) {
        endGame();
        return;
    }

    // Reset reaction time display
    elements.reactionTime.textContent = '';
    gameState.canTap = false;

    // Start with yellow light (warning)
    setLight(COLORS.YELLOW);
    updateInstructionText('Get Ready!', COLORS.YELLOW);

    setTimeout(() => {
        // Then red light (random duration)
        setLight(COLORS.RED);
        updateInstructionText("DON'T Tap!", COLORS.RED);

        const redDuration = randomInt(CONFIG.minRedDuration, CONFIG.maxRedDuration);

        setTimeout(() => {
            // Finally green light (GO!)
            setLight(COLORS.GREEN);
            updateInstructionText('TAP NOW!', COLORS.GREEN);
            gameState.greenStartTime = performance.now();
            gameState.canTap = true;

            // Auto-advance if player doesn't tap within timeout
            setTimeout(() => {
                if (gameState.currentColor === COLORS.GREEN && gameState.canTap) {
                    // Player didn't tap in time - penalty
                    gameState.canTap = false;
                    elements.reactionTime.textContent = 'Too slow!';
                    gameState.score = Math.max(0, gameState.score - 50);
                    updateScoreDisplay();

                    setTimeout(() => {
                        nextRound();
                    }, 1000);
                }
            }, CONFIG.maxGreenWaitTime);

        }, redDuration);
    }, CONFIG.yellowDuration);
}

function handleTrafficLightTap(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const currentColor = gameState.currentColor;

    if (currentColor === COLORS.GREEN && gameState.canTap) {
        // Correct tap on green!
        gameState.canTap = false;

        const reactionTime = Math.round(performance.now() - gameState.greenStartTime);

        // Calculate score based on reaction time (faster = more points)
        let points = Math.max(100 - reactionTime / 10, 10);
        points = Math.round(points);

        gameState.score += points;
        updateScoreDisplay();

        // Update best reaction time
        if (gameState.bestReactionTime === null || reactionTime < gameState.bestReactionTime) {
            gameState.bestReactionTime = reactionTime;
            updateBestTimeDisplay();
        }

        // Display reaction time
        elements.reactionTime.textContent = `${reactionTime} ms (+${points} pts)`;
        elements.reactionTime.style.color = '#28a745';

        // Move to next round after showing feedback
        setTimeout(() => {
            nextRound();
        }, 1200);

    } else if (currentColor === COLORS.RED) {
        // Penalty for tapping on red!
        elements.reactionTime.textContent = 'STOP! -100 pts';
        elements.reactionTime.style.color = '#cc0000';

        gameState.score = Math.max(0, gameState.score - 100);
        gameState.penalties++;
        updateScoreDisplay();

        // Shake animation for the traffic light
        elements.trafficLight.classList.add('bounce');
        setTimeout(() => {
            elements.trafficLight.classList.remove('bounce');
        }, 500);

    } else if (currentColor === COLORS.YELLOW) {
        // Tapping on yellow - just a warning, no penalty
        elements.reactionTime.textContent = 'Wait for green!';
        elements.reactionTime.style.color = '#f6c23e';
    }
}

function setLight(color) {
    gameState.currentColor = color;

    // Turn off all lights
    elements.redLight.classList.remove('active');
    elements.yellowLight.classList.remove('active');
    elements.greenLight.classList.remove('active');

    // Turn on the specified light
    if (color === COLORS.RED) {
        elements.redLight.classList.add('active');
    } else if (color === COLORS.YELLOW) {
        elements.yellowLight.classList.add('active');
    } else if (color === COLORS.GREEN) {
        elements.greenLight.classList.add('active');
    }
}

function updateInstructionText(text, colorClass) {
    elements.instructionText.textContent = text;

    // Remove all color classes
    elements.instructionText.classList.remove(COLORS.RED, COLORS.YELLOW, COLORS.GREEN);

    // Add the new color class
    if (colorClass) {
        elements.instructionText.classList.add(colorClass);
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

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function updateBestTimeDisplay() {
    if (gameState.bestReactionTime === null) {
        elements.bestTimeDisplay.textContent = '-';
    } else {
        elements.bestTimeDisplay.textContent = `${gameState.bestReactionTime}ms`;
    }
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

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
