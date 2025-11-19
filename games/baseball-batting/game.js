'use strict';

const CONFIG = {
    totalPitches: 10,
    pitchDuration: 1200,
    perfectTiming: { start: 0.45, end: 0.55 },
    goodTiming: { start: 0.35, end: 0.65 }
};

let gameState = {
    score: 0,
    hits: 0,
    pitches: 0,
    isPlaying: false,
    isPitching: false,
    canSwing: false,
    pitchStartTime: 0
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    swingBtn: document.getElementById('swingBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    hitsDisplay: document.getElementById('hits'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalHitsDisplay: document.getElementById('finalHits'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    baseball: document.getElementById('baseball'),
    batter: document.getElementById('batter'),
    timingBarContainer: document.getElementById('timingBarContainer'),
    timingIndicator: document.getElementById('timingIndicator')
};

function initGame() {
    console.log('Baseball Batting game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.swingBtn.addEventListener('touchstart', handleSwing);
    elements.swingBtn.addEventListener('click', handleSwing);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.hits = 0;
    gameState.pitches = 0;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.swingBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateHitsDisplay();

    setTimeout(() => {
        pitch();
    }, 1000);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    elements.swingBtn.style.display = 'none';

    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalHitsDisplay.textContent = gameState.hits;

    let message = 'Keep practicing!';
    const hitRate = (gameState.hits / CONFIG.totalPitches) * 100;

    if (hitRate === 100) {
        message = 'Perfect game! You hit every pitch!';
    } else if (hitRate >= 80) {
        message = 'Amazing! You\'re a batting champion!';
    } else if (hitRate >= 60) {
        message = 'Great hitting!';
    } else if (hitRate >= 40) {
        message = 'Nice job! Keep it up!';
    }

    elements.finalMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.hits = 0;
    gameState.pitches = 0;
    gameState.isPlaying = false;
    gameState.isPitching = false;
    gameState.canSwing = false;

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.swingBtn.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.timingBarContainer.style.display = 'none';
    elements.baseball.classList.remove('pitching');

    updateScoreDisplay();
    updateHitsDisplay();

    console.log('Game reset');
}

function pitch() {
    if (!gameState.isPlaying) return;

    gameState.pitches++;
    gameState.isPitching = true;
    gameState.canSwing = true;
    gameState.pitchStartTime = Date.now();

    elements.baseball.classList.remove('pitching');
    void elements.baseball.offsetWidth; // Trigger reflow
    elements.baseball.classList.add('pitching');

    elements.timingBarContainer.style.display = 'block';
    elements.timingIndicator.style.animation = 'none';
    void elements.timingIndicator.offsetWidth;
    elements.timingIndicator.style.animation = `timingMove ${CONFIG.pitchDuration}ms linear`;

    setTimeout(() => {
        if (gameState.canSwing) {
            miss();
        }
    }, CONFIG.pitchDuration);
}

function handleSwing(e) {
    e.preventDefault();
    if (!gameState.canSwing || !gameState.isPitching) return;

    gameState.canSwing = false;
    gameState.isPitching = false;

    const swingTime = Date.now() - gameState.pitchStartTime;
    const timing = swingTime / CONFIG.pitchDuration;

    elements.batter.classList.add('swinging');
    setTimeout(() => {
        elements.batter.classList.remove('swinging');
    }, 300);

    if (timing >= CONFIG.perfectTiming.start && timing <= CONFIG.perfectTiming.end) {
        homeRun();
    } else if (timing >= CONFIG.goodTiming.start && timing <= CONFIG.goodTiming.end) {
        hit();
    } else {
        miss();
    }
}

function homeRun() {
    gameState.score += 10;
    gameState.hits++;
    updateScoreDisplay();
    updateHitsDisplay();
    showResultMessage('HOME RUN!', 'homerun');
    nextPitch();
}

function hit() {
    gameState.score += 5;
    gameState.hits++;
    updateScoreDisplay();
    updateHitsDisplay();
    showResultMessage('HIT!', 'hit');
    nextPitch();
}

function miss() {
    gameState.canSwing = false;
    gameState.isPitching = false;
    showResultMessage('MISS!', 'miss');
    nextPitch();
}

function nextPitch() {
    elements.timingBarContainer.style.display = 'none';
    elements.baseball.classList.remove('pitching');

    setTimeout(() => {
        if (gameState.pitches >= CONFIG.totalPitches) {
            endGame();
        } else {
            pitch();
        }
    }, 1500);
}

function showResultMessage(text, type) {
    const message = document.createElement('div');
    message.className = `result-message ${type}`;
    message.textContent = text;
    elements.gameArea.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1500);
}

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

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function updateHitsDisplay() {
    elements.hitsDisplay.textContent = gameState.hits;
}

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
