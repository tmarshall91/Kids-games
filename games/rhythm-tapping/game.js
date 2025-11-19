'use strict';

const CONFIG = {
    beatInterval: 2000,
    perfectWindow: 200,
    goodWindow: 400,
    maxMisses: 3,
    streakMultiplier: 2
};

let gameState = {
    score: 0,
    streak: 0,
    maxStreak: 0,
    misses: 0,
    isPlaying: false,
    beatStartTime: 0,
    beatInterval: null,
    audioContext: null
};

const elements = {
    gameMessage: document.getElementById('gameMessage'),
    gameBoard: document.getElementById('gameBoard'),
    pulseContainer: document.getElementById('pulseContainer'),
    centerCircle: document.getElementById('centerCircle'),
    pulseRings: document.querySelectorAll('.pulse-ring'),
    timingFeedback: document.getElementById('timingFeedback'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    scoreDisplay: document.getElementById('score'),
    streakDisplay: document.getElementById('streak'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    finalStreak: document.getElementById('finalStreak'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

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

    elements.pulseContainer.addEventListener('touchstart', handleTap);
    elements.pulseContainer.addEventListener('mousedown', handleTap);
}

function startGame() {
    resetGame();
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.gameBoard.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    startBeat();
}

function resetGame() {
    gameState = {
        score: 0,
        streak: 0,
        maxStreak: 0,
        misses: 0,
        isPlaying: false,
        beatStartTime: 0,
        beatInterval: null,
        audioContext: gameState.audioContext
    };

    updateDisplay();
    elements.timingFeedback.textContent = '';
    elements.timingFeedback.className = 'timing-feedback';
}

function startBeat() {
    elements.pulseRings.forEach(ring => ring.classList.add('active'));

    gameState.beatStartTime = Date.now();
    playBeatSound();

    gameState.beatInterval = setInterval(() => {
        gameState.beatStartTime = Date.now();
        playBeatSound();
    }, CONFIG.beatInterval);
}

function handleTap(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const tapTime = Date.now();
    const timeSinceBeat = tapTime - gameState.beatStartTime;
    const timeUntilBeat = CONFIG.beatInterval - timeSinceBeat;
    const timing = Math.min(timeSinceBeat, timeUntilBeat);

    if (timing <= CONFIG.perfectWindow) {
        perfectTap();
    } else if (timing <= CONFIG.goodWindow) {
        goodTap();
    } else {
        missTap();
    }
}

function perfectTap() {
    gameState.streak++;
    gameState.score += 20 + (gameState.streak * CONFIG.streakMultiplier);

    if (gameState.streak > gameState.maxStreak) {
        gameState.maxStreak = gameState.streak;
    }

    elements.timingFeedback.textContent = 'PERFECT! 🎯';
    elements.timingFeedback.className = 'timing-feedback perfect';

    playSuccessSound(1200);
    updateDisplay();

    setTimeout(() => {
        elements.timingFeedback.textContent = '';
    }, 1000);
}

function goodTap() {
    gameState.streak++;
    gameState.score += 10 + gameState.streak;

    if (gameState.streak > gameState.maxStreak) {
        gameState.maxStreak = gameState.streak;
    }

    elements.timingFeedback.textContent = 'Good! ✓';
    elements.timingFeedback.className = 'timing-feedback good';

    playSuccessSound(900);
    updateDisplay();

    setTimeout(() => {
        elements.timingFeedback.textContent = '';
    }, 1000);
}

function missTap() {
    gameState.streak = 0;
    gameState.misses++;

    elements.timingFeedback.textContent = 'Off Beat! ✗';
    elements.timingFeedback.className = 'timing-feedback miss';

    playErrorSound();
    updateDisplay();

    if (gameState.misses >= CONFIG.maxMisses) {
        gameOver();
    }

    setTimeout(() => {
        elements.timingFeedback.textContent = '';
    }, 1000);
}

function playBeatSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.1);
}

function playSuccessSound(freq) {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, currentTime);

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

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.2);
}

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.streakDisplay.textContent = gameState.streak;
}

function gameOver() {
    gameState.isPlaying = false;

    if (gameState.beatInterval) {
        clearInterval(gameState.beatInterval);
    }

    elements.pulseRings.forEach(ring => ring.classList.remove('active'));

    setTimeout(() => {
        elements.finalScore.textContent = gameState.score;
        elements.finalStreak.textContent = gameState.maxStreak;
        elements.gameOverOverlay.style.display = 'flex';
    }, 500);
}

document.addEventListener('DOMContentLoaded', initGame);
