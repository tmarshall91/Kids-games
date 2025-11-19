'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalShots: 10,
    keeperSaveChance: 0.5, // 50% chance keeper saves
};

const POSITIONS = {
    'top-left': { x: '-80px', y: '-240px', diveX: '-100px', rotate: '-30deg' },
    'top-right': { x: '80px', y: '-240px', diveX: '100px', rotate: '30deg' },
    'middle-left': { x: '-60px', y: '-180px', diveX: '-80px', rotate: '-20deg' },
    'middle-right': { x: '60px', y: '-180px', diveX: '80px', rotate: '20deg' },
    'bottom-left': { x: '-40px', y: '-120px', diveX: '-60px', rotate: '-15deg' },
    'bottom-right': { x: '40px', y: '-120px', diveX: '60px', rotate: '15deg' }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    shotsTaken: 0,
    totalShots: CONFIG.totalShots,
    isPlaying: false,
    canShoot: true,
    selectedTarget: null
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
    shotsDisplay: document.getElementById('shots'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game elements
    soccerBall: document.getElementById('soccerBall'),
    goalkeeper: document.getElementById('goalkeeper'),
    targets: document.querySelectorAll('.target')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Soccer Penalty Kicks game initialized');
    setupEventListeners();
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

    // Target click events
    elements.targets.forEach(target => {
        target.addEventListener('touchstart', handleTargetClick);
        target.addEventListener('click', handleTargetClick);
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
    gameState.score = 0;
    gameState.shotsTaken = 0;
    gameState.canShoot = true;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Show targets
    elements.targets.forEach(target => {
        target.style.display = 'block';
    });

    updateScoreDisplay();
    updateShotsDisplay();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Hide targets
    elements.targets.forEach(target => {
        target.style.display = 'none';
    });

    // Show game over overlay with message
    elements.finalScoreDisplay.textContent = gameState.score;

    let message = 'Keep practicing!';
    const percentage = (gameState.score / gameState.totalShots) * 100;

    if (percentage === 100) {
        message = 'Perfect score! You\'re a penalty kick master!';
    } else if (percentage >= 80) {
        message = 'Amazing! You\'re a soccer superstar!';
    } else if (percentage >= 60) {
        message = 'Great job! Nice shooting!';
    } else if (percentage >= 40) {
        message = 'Good effort! Keep practicing!';
    }

    elements.finalMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.shotsTaken = 0;
    gameState.isPlaying = false;
    gameState.canShoot = true;
    gameState.selectedTarget = null;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Reset ball and keeper positions
    resetBallPosition();
    resetKeeperPosition();

    // Hide targets
    elements.targets.forEach(target => {
        target.style.display = 'none';
        target.classList.remove('active');
    });

    updateScoreDisplay();
    updateShotsDisplay();

    console.log('Game reset');
}

function resetBallPosition() {
    elements.soccerBall.classList.remove('shooting');
    elements.soccerBall.style.cssText = '';
}

function resetKeeperPosition() {
    elements.goalkeeper.classList.remove('diving');
    elements.goalkeeper.style.cssText = '';
}

// ==========================================
// SHOOTING MECHANICS
// ==========================================

function handleTargetClick(e) {
    if (!gameState.isPlaying || !gameState.canShoot) return;

    e.preventDefault();

    const target = e.target;
    const position = target.dataset.position;

    // Highlight selected target
    elements.targets.forEach(t => t.classList.remove('active'));
    target.classList.add('active');

    gameState.selectedTarget = position;

    // Shoot after a short delay
    setTimeout(() => {
        shootBall(position);
    }, 300);
}

function shootBall(position) {
    if (!gameState.isPlaying || !gameState.canShoot) return;

    gameState.canShoot = false;
    gameState.shotsTaken++;
    updateShotsDisplay();

    // Get position data
    const posData = POSITIONS[position];

    // Determine if keeper saves (random chance)
    const keeperSaves = Math.random() < CONFIG.keeperSaveChance;

    // Animate ball
    elements.soccerBall.style.setProperty('--ball-x', posData.x);
    elements.soccerBall.style.setProperty('--ball-y', posData.y);
    elements.soccerBall.classList.add('shooting');

    // Animate keeper dive
    if (keeperSaves) {
        elements.goalkeeper.style.setProperty('--dive-x', posData.diveX);
        elements.goalkeeper.style.setProperty('--dive-rotate', posData.rotate);
        elements.goalkeeper.classList.add('diving');
    }

    // Check result after animation
    setTimeout(() => {
        const scored = !keeperSaves;
        showResult(scored);

        // Reset for next shot or end game
        setTimeout(() => {
            resetBallPosition();
            resetKeeperPosition();

            // Clear target selection
            elements.targets.forEach(t => t.classList.remove('active'));

            if (gameState.shotsTaken >= gameState.totalShots) {
                endGame();
            } else {
                gameState.canShoot = true;
            }
        }, 1500);
    }, 600);
}

function showResult(scored) {
    if (scored) {
        gameState.score++;
        updateScoreDisplay();
        showResultMessage('GOAL!', 'goal');
    } else {
        showResultMessage('SAVED!', 'miss');
    }
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
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function updateShotsDisplay() {
    elements.shotsDisplay.textContent = `${gameState.shotsTaken}/${gameState.totalShots}`;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
