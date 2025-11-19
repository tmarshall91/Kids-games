'use strict';

// === Configuration ===
const CONFIG = {
    notes: [
        { frequency: 261.63, color: 'red' },     // C4
        { frequency: 293.66, color: 'yellow' },  // D4
        { frequency: 329.63, color: 'green' },   // E4
        { frequency: 392.00, color: 'blue' },    // G4
        { frequency: 440.00, color: 'purple' },  // A4
        { frequency: 523.25, color: 'orange' }   // C5
    ],
    noteDuration: 500,
    delayBetweenNotes: 200,
    delayBeforePlayerTurn: 500
};

// === State Management ===
let gameState = {
    level: 1,
    score: 0,
    sequence: [],
    playerSequence: [],
    isPlaying: false,
    isPlayerTurn: false,
    audioContext: null
};

// === DOM References ===
const elements = {
    gameMessage: document.getElementById('gameMessage'),
    gameBoard: document.getElementById('gameBoard'),
    colorButtons: document.querySelectorAll('.color-button'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    levelDisplay: document.getElementById('level'),
    scoreDisplay: document.getElementById('score'),
    statusMessage: document.getElementById('statusMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalLevel: document.getElementById('finalLevel'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupAudioContext();
    setupEventListeners();
}

function setupAudioContext() {
    const createAudioContext = () => {
        if (!gameState.audioContext) {
            gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    document.addEventListener('touchstart', createAudioContext, { once: true });
    document.addEventListener('click', createAudioContext, { once: true });
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });

    // Color button listeners
    elements.colorButtons.forEach(button => {
        button.addEventListener('touchstart', handleButtonPress);
        button.addEventListener('mousedown', handleButtonPress);
    });
}

// === Game Functions ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.gameBoard.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    nextRound();
}

function resetGame() {
    gameState = {
        level: 1,
        score: 0,
        sequence: [],
        playerSequence: [],
        isPlaying: false,
        isPlayerTurn: false,
        audioContext: gameState.audioContext
    };

    updateDisplay();
}

function nextRound() {
    gameState.playerSequence = [];
    gameState.isPlayerTurn = false;

    // Add new note to sequence
    const randomNote = Math.floor(Math.random() * CONFIG.notes.length);
    gameState.sequence.push(randomNote);

    updateDisplay();
    elements.statusMessage.textContent = 'Watch carefully...';

    // Disable buttons during playback
    setButtonsEnabled(false);

    // Play sequence
    setTimeout(() => {
        playSequence();
    }, 500);
}

async function playSequence() {
    for (let i = 0; i < gameState.sequence.length; i++) {
        const noteIndex = gameState.sequence[i];
        await playNote(noteIndex);
        await delay(CONFIG.delayBetweenNotes);
    }

    // Enable player turn
    await delay(CONFIG.delayBeforePlayerTurn);
    gameState.isPlayerTurn = true;
    elements.statusMessage.textContent = 'Your turn!';
    setButtonsEnabled(true);
}

function playNote(noteIndex) {
    return new Promise((resolve) => {
        const button = document.querySelector(`[data-note="${noteIndex}"]`);
        const note = CONFIG.notes[noteIndex];

        // Visual feedback
        button.classList.add('active');

        // Play sound
        playSound(note.frequency, CONFIG.noteDuration);

        setTimeout(() => {
            button.classList.remove('active');
            resolve();
        }, CONFIG.noteDuration);
    });
}

function playSound(frequency, duration) {
    if (!gameState.audioContext) {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration / 1000);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration / 1000);
}

function handleButtonPress(e) {
    e.preventDefault();
    if (!gameState.isPlayerTurn || !gameState.isPlaying) return;

    const button = e.currentTarget;
    const noteIndex = parseInt(button.dataset.note);

    // Add to player sequence
    gameState.playerSequence.push(noteIndex);

    // Play note
    const note = CONFIG.notes[noteIndex];
    button.classList.add('active');
    playSound(note.frequency, CONFIG.noteDuration);

    setTimeout(() => {
        button.classList.remove('active');
    }, CONFIG.noteDuration);

    // Check if correct
    checkPlayerInput();
}

function checkPlayerInput() {
    const currentIndex = gameState.playerSequence.length - 1;
    const correctNote = gameState.sequence[currentIndex];
    const playerNote = gameState.playerSequence[currentIndex];

    if (playerNote !== correctNote) {
        // Wrong note - game over
        gameOver();
        return;
    }

    // Check if sequence complete
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // Correct sequence!
        gameState.isPlayerTurn = false;
        setButtonsEnabled(false);

        gameState.score += gameState.level * 10;
        gameState.level++;

        elements.statusMessage.textContent = 'Great job! 🎉';

        setTimeout(() => {
            nextRound();
        }, 1500);
    }
}

function setButtonsEnabled(enabled) {
    elements.colorButtons.forEach(button => {
        if (enabled) {
            button.classList.remove('disabled');
        } else {
            button.classList.add('disabled');
        }
    });
}

function updateDisplay() {
    elements.levelDisplay.textContent = gameState.level;
    elements.scoreDisplay.textContent = gameState.score;
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.isPlayerTurn = false;

    elements.statusMessage.textContent = 'Wrong note!';
    setButtonsEnabled(false);

    setTimeout(() => {
        elements.finalLevel.textContent = gameState.level;
        elements.finalScore.textContent = gameState.score;
        elements.gameOverOverlay.style.display = 'flex';
    }, 1000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
