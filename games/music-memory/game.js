'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Configuration ===
const CONFIG = {
    notes: [
        { frequency: 261.63, name: 'Do' },  // C4
        { frequency: 293.66, name: 'Re' },  // D4
        { frequency: 329.63, name: 'Mi' },  // E4
        { frequency: 349.23, name: 'Fa' }   // F4
    ],
    noteDuration: 500,
    pauseBetweenNotes: 100,
    pauseBeforePlayer: 500
};

// === State Management ===
let gameState = {
    sequence: [],
    playerSequence: [],
    level: 1,
    bestScore: 0,
    isPlaying: false,
    isPlayerTurn: false,
    canInteract: false
};

// === DOM References ===
const elements = {
    pads: document.querySelectorAll('.pad'),
    levelDisplay: document.getElementById('level'),
    bestDisplay: document.getElementById('best'),
    gameMessage: document.getElementById('gameMessage'),
    statusMessage: document.getElementById('statusMessage'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalLevel: document.getElementById('finalLevel'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    loadBestScore();
    setupEventListeners();
    preventTouchScroll();
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

    elements.pads.forEach(pad => {
        pad.addEventListener('click', handlePadClick);
        pad.addEventListener('touchstart', handlePadClick);
    });
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Sound Functions ===
function playNote(noteIndex) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(CONFIG.notes[noteIndex].frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + CONFIG.noteDuration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + CONFIG.noteDuration / 1000);
}

// === Game Control ===
function startGame() {
    gameState.sequence = [];
    gameState.playerSequence = [];
    gameState.level = 1;
    gameState.isPlaying = true;
    gameState.isPlayerTurn = false;
    gameState.canInteract = false;

    updateLevel();
    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'none';

    enablePads();
    nextLevel();
}

function nextLevel() {
    gameState.playerSequence = [];
    gameState.isPlayerTurn = false;
    gameState.canInteract = false;

    // Add new note to sequence
    const randomNote = Math.floor(Math.random() * CONFIG.notes.length);
    gameState.sequence.push(randomNote);

    showStatus('Watch and Listen!');
    disablePads();

    // Play sequence after a short delay
    setTimeout(() => {
        playSequence();
    }, 1000);
}

async function playSequence() {
    for (let i = 0; i < gameState.sequence.length; i++) {
        const noteIndex = gameState.sequence[i];
        await highlightPad(noteIndex);
        await sleep(CONFIG.pauseBetweenNotes);
    }

    // Player's turn
    await sleep(CONFIG.pauseBeforePlayer);
    gameState.isPlayerTurn = true;
    gameState.canInteract = true;
    enablePads();
    showStatus('Your Turn!');
}

function highlightPad(noteIndex) {
    return new Promise((resolve) => {
        const pad = document.querySelector(`[data-note="${noteIndex}"]`);
        pad.classList.add('active');
        playNote(noteIndex);

        setTimeout(() => {
            pad.classList.remove('active');
            resolve();
        }, CONFIG.noteDuration);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === Player Interaction ===
function handlePadClick(e) {
    e.preventDefault();

    if (!gameState.canInteract || !gameState.isPlayerTurn) return;

    const noteIndex = parseInt(e.currentTarget.dataset.note);

    // Visual and audio feedback
    e.currentTarget.classList.add('active');
    playNote(noteIndex);

    setTimeout(() => {
        e.currentTarget.classList.remove('active');
    }, CONFIG.noteDuration);

    // Add to player sequence
    gameState.playerSequence.push(noteIndex);

    // Check if correct
    const currentIndex = gameState.playerSequence.length - 1;
    if (gameState.playerSequence[currentIndex] !== gameState.sequence[currentIndex]) {
        // Wrong note!
        gameOver();
        return;
    }

    // Check if sequence is complete
    if (gameState.playerSequence.length === gameState.sequence.length) {
        // Correct! Move to next level
        gameState.canInteract = false;
        disablePads();
        showStatus('Correct! 🎉');

        setTimeout(() => {
            gameState.level++;
            updateLevel();
            updateBestScore();
            nextLevel();
        }, 1500);
    }
}

// === UI Updates ===
function updateLevel() {
    elements.levelDisplay.textContent = gameState.level;
}

function updateBestScore() {
    if (gameState.level > gameState.bestScore) {
        gameState.bestScore = gameState.level;
        elements.bestDisplay.textContent = gameState.bestScore;
        saveBestScore();
    }
}

function showStatus(message) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.add('show');

    setTimeout(() => {
        elements.statusMessage.classList.remove('show');
    }, 2000);
}

function enablePads() {
    elements.pads.forEach(pad => {
        pad.classList.remove('disabled');
    });
}

function disablePads() {
    elements.pads.forEach(pad => {
        pad.classList.add('disabled');
    });
}

// === Game Over ===
function gameOver() {
    gameState.isPlaying = false;
    gameState.isPlayerTurn = false;
    gameState.canInteract = false;

    disablePads();
    showStatus('Oops! Wrong note!');

    setTimeout(() => {
        elements.finalLevel.textContent = gameState.level;
        elements.gameOverOverlay.style.display = 'flex';
    }, 1500);
}

// === Local Storage ===
function saveBestScore() {
    try {
        localStorage.setItem('musicMemoryBest', gameState.bestScore.toString());
    } catch (e) {
        console.log('Could not save best score');
    }
}

function loadBestScore() {
    try {
        const saved = localStorage.getItem('musicMemoryBest');
        if (saved) {
            gameState.bestScore = parseInt(saved);
            elements.bestDisplay.textContent = gameState.bestScore;
        }
    } catch (e) {
        console.log('Could not load best score');
    }
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
