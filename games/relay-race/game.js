'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    numberOfPlayers: 2,
    roundsToWin: 5,
    challengeTime: 10, // seconds per challenge
};

const CHALLENGES = [
    {
        icon: '👆',
        title: 'Tap Challenge',
        description: 'Tap the target as many times as you can!',
        type: 'tap',
        target: 15,
    },
    {
        icon: '🎯',
        title: 'Speed Tap',
        description: 'Tap 10 times as fast as possible!',
        type: 'speed',
        target: 10,
    },
    {
        icon: '⏱️',
        title: 'Hold Challenge',
        description: 'Hold the target for 5 seconds!',
        type: 'hold',
        target: 5,
    },
    {
        icon: '🔢',
        title: 'Count Challenge',
        description: 'Tap exactly 7 times!',
        type: 'exact',
        target: 7,
    },
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    round: 1,
    score: 0,
    currentPlayer: 1,
    isPlaying: false,
    challengeActive: false,
    currentChallenge: null,
    challengeProgress: 0,
    timeLeft: CONFIG.challengeTime,
    holdStartTime: null,
    tapCount: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    readyBtn: document.getElementById('readyBtn'),
    passBtn: document.getElementById('passBtn'),

    // Display elements
    roundDisplay: document.getElementById('round'),
    scoreDisplay: document.getElementById('score'),
    currentPlayerDisplay: document.getElementById('currentPlayer'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalRoundDisplay: document.getElementById('finalRound'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    challengeContainer: document.getElementById('challengeContainer'),
    challengeControls: document.getElementById('challengeControls'),
    playerIndicator: document.getElementById('playerIndicator'),

    // Challenge elements
    challengeIcon: document.getElementById('challengeIcon'),
    challengeTitle: document.getElementById('challengeTitle'),
    challengeDescription: document.getElementById('challengeDescription'),
    challengeGame: document.getElementById('challengeGame'),
    timerValue: document.getElementById('timerValue'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Relay Race initialized');
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

    // Ready button
    elements.readyBtn.addEventListener('touchstart', handleReady);
    elements.readyBtn.addEventListener('click', handleReady);

    // Pass button
    elements.passBtn.addEventListener('touchstart', handlePass);
    elements.passBtn.addEventListener('click', handlePass);
}

// ==========================================
// CHALLENGE SYSTEM
// ==========================================

function startChallenge() {
    // Select random challenge
    gameState.currentChallenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    gameState.challengeActive = true;
    gameState.challengeProgress = 0;
    gameState.timeLeft = CONFIG.challengeTime;
    gameState.tapCount = 0;
    gameState.holdStartTime = null;

    // Update UI
    elements.challengeIcon.textContent = gameState.currentChallenge.icon;
    elements.challengeTitle.textContent = gameState.currentChallenge.title;
    elements.challengeDescription.textContent = gameState.currentChallenge.description;

    // Hide ready button, show pass button
    elements.readyBtn.style.display = 'none';
    elements.passBtn.style.display = 'inline-block';

    // Render challenge based on type
    renderChallenge();

    // Start timer
    startChallengeTimer();

    console.log('Challenge started:', gameState.currentChallenge.title);
}

function renderChallenge() {
    elements.challengeGame.innerHTML = '';

    const challenge = gameState.currentChallenge;

    if (challenge.type === 'tap' || challenge.type === 'speed' || challenge.type === 'exact') {
        // Tap-based challenges
        const tapTarget = document.createElement('div');
        tapTarget.className = 'tap-target';
        tapTarget.textContent = '👆';

        const tapCounter = document.createElement('div');
        tapCounter.className = 'tap-counter';
        tapCounter.id = 'tapCounter';
        tapCounter.textContent = `Taps: 0 / ${challenge.target}`;

        tapTarget.addEventListener('touchstart', handleTap);
        tapTarget.addEventListener('click', handleTap);

        elements.challengeGame.appendChild(tapTarget);
        elements.challengeGame.appendChild(tapCounter);

    } else if (challenge.type === 'hold') {
        // Hold challenge
        const holdTarget = document.createElement('div');
        holdTarget.className = 'tap-target';
        holdTarget.textContent = '✋';

        const holdCounter = document.createElement('div');
        holdCounter.className = 'tap-counter';
        holdCounter.id = 'holdCounter';
        holdCounter.textContent = 'Hold: 0s';

        holdTarget.addEventListener('touchstart', handleHoldStart);
        holdTarget.addEventListener('mousedown', handleHoldStart);
        holdTarget.addEventListener('touchend', handleHoldEnd);
        holdTarget.addEventListener('mouseup', handleHoldEnd);

        elements.challengeGame.appendChild(holdTarget);
        elements.challengeGame.appendChild(holdCounter);
    }
}

function handleTap(e) {
    e.preventDefault();

    if (!gameState.challengeActive) return;

    gameState.tapCount++;
    gameState.challengeProgress = gameState.tapCount;

    // Update counter
    const counter = document.getElementById('tapCounter');
    if (counter) {
        counter.textContent = `Taps: ${gameState.tapCount} / ${gameState.currentChallenge.target}`;
    }

    // Check if challenge complete
    const challenge = gameState.currentChallenge;
    if (challenge.type === 'speed' || challenge.type === 'exact') {
        if (gameState.tapCount >= challenge.target) {
            completeChallenge(true);
        }
    }
}

function handleHoldStart(e) {
    e.preventDefault();

    if (!gameState.challengeActive || gameState.holdStartTime) return;

    gameState.holdStartTime = Date.now();

    const holdInterval = setInterval(() => {
        if (!gameState.holdStartTime) {
            clearInterval(holdInterval);
            return;
        }

        const holdTime = (Date.now() - gameState.holdStartTime) / 1000;
        gameState.challengeProgress = holdTime;

        // Update counter
        const counter = document.getElementById('holdCounter');
        if (counter) {
            counter.textContent = `Hold: ${holdTime.toFixed(1)}s`;
        }

        // Check if challenge complete
        if (holdTime >= gameState.currentChallenge.target) {
            clearInterval(holdInterval);
            completeChallenge(true);
        }
    }, 100);
}

function handleHoldEnd(e) {
    e.preventDefault();

    if (gameState.holdStartTime) {
        gameState.holdStartTime = null;
    }
}

function completeChallenge(success) {
    gameState.challengeActive = false;
    stopChallengeTimer();

    if (success) {
        // Award points
        const pointsEarned = Math.ceil(gameState.timeLeft * 10);
        gameState.score += pointsEarned;
        updateScoreDisplay();

        // Show success message
        elements.challengeGame.innerHTML = `
            <div style="font-size: 64px; animation: celebration 0.5s ease;">🎉</div>
            <div style="font-size: 24px; color: #4CAF50; font-weight: bold;">Success!</div>
            <div style="font-size: 18px; color: #666;">+${pointsEarned} points</div>
        `;
    } else {
        // Show fail message
        elements.challengeGame.innerHTML = `
            <div style="font-size: 64px;">😕</div>
            <div style="font-size: 24px; color: #FF6B6B; font-weight: bold;">Time's Up!</div>
            <div style="font-size: 18px; color: #666;">Better luck next time!</div>
        `;
    }

    // Hide pass button
    elements.passBtn.style.display = 'none';

    // Move to next player after delay
    setTimeout(() => {
        nextTurn();
    }, 2000);
}

// ==========================================
// CHALLENGE TIMER
// ==========================================

let challengeTimerInterval = null;

function startChallengeTimer() {
    challengeTimerInterval = setInterval(() => {
        if (!gameState.challengeActive) return;

        gameState.timeLeft--;
        updateTimerDisplay();

        // Add warning style
        if (gameState.timeLeft <= 3) {
            elements.timerValue.classList.add('warning');
        }

        if (gameState.timeLeft <= 0) {
            // Check if tap challenge was successful
            if (gameState.currentChallenge.type === 'tap') {
                const success = gameState.tapCount >= gameState.currentChallenge.target;
                completeChallenge(success);
            } else {
                completeChallenge(false);
            }
        }
    }, 1000);
}

function stopChallengeTimer() {
    if (challengeTimerInterval) {
        clearInterval(challengeTimerInterval);
        challengeTimerInterval = null;
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.round = 1;
    gameState.score = 0;
    gameState.currentPlayer = 1;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.challengeContainer.style.display = 'flex';
    elements.challengeControls.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateRoundDisplay();
    updateScoreDisplay();
    updatePlayerDisplay();

    console.log('Game started');
}

function nextTurn() {
    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;

    // New round if back to player 1
    if (gameState.currentPlayer === 1) {
        gameState.round++;
        updateRoundDisplay();

        // Check if game is over
        if (gameState.round > CONFIG.roundsToWin) {
            endGame();
            return;
        }
    }

    updatePlayerDisplay();

    // Show ready button
    elements.readyBtn.style.display = 'inline-block';
    elements.passBtn.style.display = 'none';

    // Clear challenge area
    elements.challengeGame.innerHTML = `
        <div style="font-size: 48px;">🏃</div>
        <div style="font-size: 20px; color: #666;">Get ready for your challenge!</div>
    `;
}

function handlePass(e) {
    e.preventDefault();

    if (gameState.challengeActive) {
        completeChallenge(false);
    }
}

function endGame() {
    gameState.isPlaying = false;
    stopChallengeTimer();

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalRoundDisplay.textContent = gameState.round - 1;
    setTimeout(() => {
        elements.gameOverOverlay.style.display = 'flex';
    }, 500);

    console.log('Game ended. Score:', gameState.score);
}

function resetGame() {
    gameState.round = 1;
    gameState.score = 0;
    gameState.currentPlayer = 1;
    gameState.isPlaying = false;
    gameState.challengeActive = false;
    gameState.currentChallenge = null;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.challengeContainer.style.display = 'none';
    elements.challengeControls.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateRoundDisplay();
    updateScoreDisplay();

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

function handleReady(e) {
    e.preventDefault();
    startChallenge();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateRoundDisplay() {
    elements.roundDisplay.textContent = gameState.round;
}

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updatePlayerDisplay() {
    elements.currentPlayerDisplay.textContent = gameState.currentPlayer;
}

function updateTimerDisplay() {
    elements.timerValue.textContent = gameState.timeLeft;

    if (gameState.timeLeft > 3) {
        elements.timerValue.classList.remove('warning');
    }
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
    stopChallengeTimer();
});
