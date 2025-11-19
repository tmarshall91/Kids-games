'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    buttonFlashDuration: 400, // milliseconds
    delayBetweenButtons: 150, // milliseconds
    delayBeforePlayerTurn: 500, // milliseconds
    colors: ['green', 'red', 'yellow', 'blue'],
    frequencies: [329.63, 261.63, 392.00, 493.88], // E4, C4, G4, B4
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    sequence: [],
    playerSequence: [],
    level: 1,
    score: 0,
    isPlaying: false,
    isComputerTurn: false,
    isPlayerTurn: false,
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
    levelDisplay: document.getElementById('level'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalLevelDisplay: document.getElementById('finalLevel'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    simonBoard: document.getElementById('simonBoard'),

    // Simon buttons
    buttons: [
        document.getElementById('btn-0'),
        document.getElementById('btn-1'),
        document.getElementById('btn-2'),
        document.getElementById('btn-3'),
    ],
};

// ==========================================
// AUDIO SYSTEM
// ==========================================

let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playTone(frequency, duration = 400) {
    if (!audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Error playing tone:', e);
    }
}

function playButtonSound(buttonIndex) {
    const frequency = CONFIG.frequencies[buttonIndex];
    playTone(frequency, CONFIG.buttonFlashDuration);
}

function playErrorSound() {
    if (!audioContext) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Descending "error" tone
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Error playing error sound:', e);
    }
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Game initialized');
    initAudio();
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

    // Simon buttons
    elements.buttons.forEach((button, index) => {
        button.addEventListener('touchstart', (e) => handleButtonPress(e, index));
        button.addEventListener('mousedown', (e) => handleButtonPress(e, index));
    });

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
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.level = 1;
    gameState.score = 0;

    // Initialize audio context on user interaction
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateLevelDisplay();

    console.log('Game started');

    // Start first round
    setTimeout(() => nextRound(), 500);
}

function nextRound() {
    if (!gameState.isPlaying) return;

    gameState.level = gameState.sequence.length + 1;
    gameState.playerSequence = [];
    updateLevelDisplay();

    // Add new random color to sequence
    const randomButton = Math.floor(Math.random() * 4);
    gameState.sequence.push(randomButton);

    console.log('Round', gameState.level, 'Sequence:', gameState.sequence);

    // Play the sequence
    setTimeout(() => playSequence(), 500);
}

async function playSequence() {
    gameState.isComputerTurn = true;
    disableButtons();

    for (let i = 0; i < gameState.sequence.length; i++) {
        const buttonIndex = gameState.sequence[i];
        await flashButton(buttonIndex);
        await wait(CONFIG.delayBetweenButtons);
    }

    gameState.isComputerTurn = false;
    gameState.isPlayerTurn = true;
    enableButtons();
}

function flashButton(buttonIndex) {
    return new Promise((resolve) => {
        const button = elements.buttons[buttonIndex];

        // Light up button
        button.classList.add('lit');
        playButtonSound(buttonIndex);

        setTimeout(() => {
            // Turn off button
            button.classList.remove('lit');
            resolve();
        }, CONFIG.buttonFlashDuration);
    });
}

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function disableButtons() {
    elements.buttons.forEach(button => {
        button.disabled = true;
    });
}

function enableButtons() {
    elements.buttons.forEach(button => {
        button.disabled = false;
    });
}

function endGame() {
    gameState.isPlaying = false;
    gameState.isPlayerTurn = false;
    disableButtons();

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalLevelDisplay.textContent = gameState.level;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final level:', gameState.level, 'Final score:', gameState.score);
}

function resetGame() {
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.level = 1;
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.isComputerTurn = false;
    gameState.isPlayerTurn = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    disableButtons();
    updateScoreDisplay();
    updateLevelDisplay();

    console.log('Game reset');
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

function handleButtonPress(e, buttonIndex) {
    e.preventDefault();

    if (!gameState.isPlayerTurn || !gameState.isPlaying) return;

    // Visual and audio feedback
    const button = elements.buttons[buttonIndex];
    button.classList.add('active');
    playButtonSound(buttonIndex);

    setTimeout(() => {
        button.classList.remove('active');
    }, CONFIG.buttonFlashDuration);

    // Add to player's sequence
    gameState.playerSequence.push(buttonIndex);

    // Check if correct
    const currentStep = gameState.playerSequence.length - 1;
    const expectedButton = gameState.sequence[currentStep];

    if (buttonIndex !== expectedButton) {
        // Wrong button - game over
        console.log('Wrong! Expected:', expectedButton, 'Got:', buttonIndex);
        playErrorSound();
        setTimeout(() => endGame(), 500);
        return;
    }

    // Correct button
    console.log('Correct! Step', currentStep + 1, 'of', gameState.sequence.length);

    // Check if player completed the sequence
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // Player completed the round successfully
        gameState.isPlayerTurn = false;
        gameState.score += gameState.level * 10; // Score increases with level
        updateScoreDisplay();

        // Animate score
        elements.scoreDisplay.classList.add('pulse');
        setTimeout(() => {
            elements.scoreDisplay.classList.remove('pulse');
        }, 300);

        console.log('Round complete! Score:', gameState.score);

        // Start next round
        setTimeout(() => nextRound(), 1000);
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateLevelDisplay() {
    elements.levelDisplay.textContent = gameState.level;
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

// Handle page visibility to pause audio context
document.addEventListener('visibilitychange', () => {
    if (document.hidden && audioContext) {
        audioContext.suspend();
    } else if (!document.hidden && audioContext && gameState.isPlaying) {
        audioContext.resume();
    }
});
