'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playBeat() {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
}

// === Configuration ===
const CONFIG = {
    bpm: 120,
    beatInterval: 500, // milliseconds (120 BPM)
    perfectWindow: 100, // ms tolerance for perfect
    goodWindow: 200, // ms tolerance for good
    gameDuration: 45000 // 45 seconds
};

// === State Management ===
let gameState = {
    isPlaying: false,
    beatCount: 0,
    tapCount: 0,
    perfectTaps: 0,
    goodTaps: 0,
    missedTaps: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastBeatTime: 0,
    hasTappedThisBeat: false,
    beatIntervalId: null
};

// === DOM References ===
const elements = {
    beatIndicator: document.getElementById('beatIndicator'),
    beatCircle: document.querySelector('.beat-circle'),
    pulseRing: document.querySelector('.pulse-ring'),
    tapZone: document.getElementById('tapZone'),
    tapCircle: document.querySelector('.tap-circle'),
    accuracyDisplay: document.getElementById('accuracy'),
    streakDisplay: document.getElementById('streak'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    maxStreak: document.getElementById('maxStreak'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', restartGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        restartGame();
    });

    elements.tapCircle.addEventListener('click', handleTap);
    elements.tapCircle.addEventListener('touchstart', handleTap);
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    gameState.isPlaying = true;
    gameState.beatCount = 0;
    gameState.tapCount = 0;
    gameState.perfectTaps = 0;
    gameState.goodTaps = 0;
    gameState.missedTaps = 0;
    gameState.currentStreak = 0;
    gameState.maxStreak = 0;
    gameState.hasTappedThisBeat = false;

    updateAccuracy();
    updateStreak();

    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';

    // Start the beat
    triggerBeat();
    gameState.beatIntervalId = setInterval(triggerBeat, CONFIG.beatInterval);

    // End game after duration
    setTimeout(() => {
        if (gameState.isPlaying) {
            endGame();
        }
    }, CONFIG.gameDuration);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function endGame() {
    gameState.isPlaying = false;

    clearInterval(gameState.beatIntervalId);

    const accuracy = calculateAccuracy();
    elements.finalAccuracy.textContent = accuracy;
    elements.maxStreak.textContent = gameState.maxStreak;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Beat System ===
function triggerBeat() {
    if (!gameState.isPlaying) return;

    gameState.beatCount++;
    gameState.lastBeatTime = Date.now();
    gameState.hasTappedThisBeat = false;

    // Visual feedback
    elements.beatCircle.classList.add('pulse');
    elements.pulseRing.classList.add('active');

    setTimeout(() => {
        elements.beatCircle.classList.remove('pulse');
        elements.pulseRing.classList.remove('active');
    }, 200);

    // Audio feedback
    playBeat();
}

// === Tap Handling ===
function handleTap(e) {
    e.preventDefault();

    if (!gameState.isPlaying || gameState.hasTappedThisBeat) return;

    gameState.tapCount++;
    gameState.hasTappedThisBeat = true;

    const now = Date.now();
    const timeSinceLastBeat = now - gameState.lastBeatTime;

    // Calculate timing accuracy
    let feedback = '';
    let isGood = false;

    if (timeSinceLastBeat <= CONFIG.perfectWindow) {
        // Perfect!
        feedback = 'Perfect!';
        gameState.perfectTaps++;
        gameState.currentStreak++;
        isGood = true;
        showFeedback(feedback, 'perfect');
    } else if (timeSinceLastBeat <= CONFIG.goodWindow) {
        // Good
        feedback = 'Good!';
        gameState.goodTaps++;
        gameState.currentStreak++;
        isGood = true;
        showFeedback(feedback, 'good');
    } else {
        // Missed
        feedback = 'Miss!';
        gameState.missedTaps++;
        gameState.currentStreak = 0;
        showFeedback(feedback, 'miss');
    }

    if (isGood && gameState.currentStreak > gameState.maxStreak) {
        gameState.maxStreak = gameState.currentStreak;
    }

    updateAccuracy();
    updateStreak();
}

// === UI Updates ===
function updateAccuracy() {
    const accuracy = calculateAccuracy();
    elements.accuracyDisplay.textContent = accuracy + '%';
}

function calculateAccuracy() {
    if (gameState.tapCount === 0) return 0;
    const goodTaps = gameState.perfectTaps + gameState.goodTaps;
    return Math.round((goodTaps / gameState.tapCount) * 100);
}

function updateStreak() {
    elements.streakDisplay.textContent = gameState.currentStreak;

    if (gameState.currentStreak > 0) {
        elements.streakDisplay.style.color = '#4CAF50';
    } else {
        elements.streakDisplay.style.color = 'white';
    }
}

function showFeedback(message, type) {
    elements.feedbackMessage.textContent = message;
    elements.feedbackMessage.className = 'feedback-message show ' + type;

    setTimeout(() => {
        elements.feedbackMessage.classList.remove('show');
    }, 800);
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
