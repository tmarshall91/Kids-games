'use strict';

// === Configuration ===
const CONFIG = {
    moves: [
        { direction: 'up', icon: '👆', name: 'Jump Up!', key: 'ArrowUp' },
        { direction: 'down', icon: '👇', name: 'Squat Down!', key: 'ArrowDown' },
        { direction: 'left', icon: '👈', name: 'Step Left!', key: 'ArrowLeft' },
        { direction: 'right', icon: '👉', name: 'Step Right!', key: 'ArrowRight' }
    ],
    initialDelay: 2000,
    moveDelay: 1500,
    speedIncrease: 50,
    minMoveDelay: 500,
    comboBonus: 5
};

// === State Management ===
let gameState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    isPlaying: false,
    currentMove: null,
    moveTimeout: null,
    moveDelay: CONFIG.moveDelay,
    audioContext: null
};

// === DOM References ===
const elements = {
    gameMessage: document.getElementById('gameMessage'),
    gameBoard: document.getElementById('gameBoard'),
    moveIcon: document.getElementById('moveIcon'),
    moveName: document.getElementById('moveName'),
    danceDisplay: document.getElementById('danceDisplay'),
    directionButtons: document.querySelectorAll('.direction-btn'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    scoreDisplay: document.getElementById('score'),
    comboDisplay: document.getElementById('combo'),
    countdown: document.getElementById('countdown'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    finalCombo: document.getElementById('finalCombo'),
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

    // Direction button listeners
    elements.directionButtons.forEach(button => {
        button.addEventListener('touchstart', handleDirectionPress);
        button.addEventListener('mousedown', handleDirectionPress);
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// === Game Functions ===
async function startGame() {
    resetGame();
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.gameBoard.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Countdown
    await showCountdown();

    // Start showing moves
    showNextMove();
}

function resetGame() {
    gameState = {
        score: 0,
        combo: 0,
        maxCombo: 0,
        isPlaying: false,
        currentMove: null,
        moveTimeout: null,
        moveDelay: CONFIG.moveDelay,
        audioContext: gameState.audioContext
    };

    updateDisplay();

    // Reset button styles
    elements.directionButtons.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
    });
}

async function showCountdown() {
    elements.countdown.style.display = 'block';

    for (let i = 3; i > 0; i--) {
        elements.countdown.textContent = i;
        playCountdownSound(i);
        await delay(1000);
    }

    elements.countdown.style.display = 'none';
}

function showNextMove() {
    if (!gameState.isPlaying) return;

    // Clear previous move timeout
    if (gameState.moveTimeout) {
        clearTimeout(gameState.moveTimeout);
    }

    // Select random move
    const move = CONFIG.moves[Math.floor(Math.random() * CONFIG.moves.length)];
    gameState.currentMove = move;

    // Display move
    elements.moveIcon.textContent = move.icon;
    elements.moveName.textContent = move.name;

    // Play sound
    playMoveSound();

    // Set timeout for next move (game over if not matched)
    gameState.moveTimeout = setTimeout(() => {
        if (gameState.isPlaying) {
            missMove();
        }
    }, gameState.moveDelay);
}

function handleDirectionPress(e) {
    e.preventDefault();
    if (!gameState.isPlaying || !gameState.currentMove) return;

    const button = e.currentTarget;
    const direction = button.dataset.direction;

    checkMove(direction, button);
}

function handleKeyPress(e) {
    if (!gameState.isPlaying || !gameState.currentMove) return;

    const key = e.key;
    const move = CONFIG.moves.find(m => m.key === key);

    if (move) {
        e.preventDefault();
        const button = document.querySelector(`[data-direction="${move.direction}"]`);
        checkMove(move.direction, button);
    }
}

function checkMove(direction, button) {
    if (direction === gameState.currentMove.direction) {
        // Correct move!
        correctMove(button);
    } else {
        // Wrong move!
        wrongMove(button);
    }
}

function correctMove(button) {
    // Clear timeout
    if (gameState.moveTimeout) {
        clearTimeout(gameState.moveTimeout);
    }

    // Visual feedback
    button.classList.add('correct');
    setTimeout(() => button.classList.remove('correct'), 300);

    // Update score and combo
    gameState.combo++;
    gameState.score += 10 + (gameState.combo * CONFIG.comboBonus);

    if (gameState.combo > gameState.maxCombo) {
        gameState.maxCombo = gameState.combo;
    }

    updateDisplay();

    // Play success sound
    playSuccessSound();

    // Increase difficulty
    if (gameState.moveDelay > CONFIG.minMoveDelay) {
        gameState.moveDelay -= CONFIG.speedIncrease;
    }

    // Show next move
    setTimeout(() => {
        showNextMove();
    }, 300);
}

function wrongMove(button) {
    // Visual feedback
    button.classList.add('wrong');
    setTimeout(() => button.classList.remove('wrong'), 300);

    // Play error sound
    playErrorSound();

    // Game over
    gameOver();
}

function missMove() {
    // Play error sound
    playErrorSound();

    // Game over
    gameOver();
}

function playCountdownSound(count) {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(count === 1 ? 800 : 400, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.2);
}

function playMoveSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, currentTime);

    gainNode.gain.setValueAtTime(0.2, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.15);
}

function playSuccessSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.2);
}

function playErrorSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.3);
}

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.comboDisplay.textContent = gameState.combo;
}

function gameOver() {
    gameState.isPlaying = false;

    if (gameState.moveTimeout) {
        clearTimeout(gameState.moveTimeout);
    }

    setTimeout(() => {
        elements.finalScore.textContent = gameState.score;
        elements.finalCombo.textContent = gameState.maxCombo;
        elements.gameOverOverlay.style.display = 'flex';
    }, 500);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
