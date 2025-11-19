'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalHoles: 9,
    physics: {
        friction: 0.98,
        minPower: 2,
        maxPower: 15,
        stopVelocity: 0.1
    },
    holes: [
        { distance: 10, par: 2, x: 0.5, y: 0.2 },
        { distance: 15, par: 2, x: 0.3, y: 0.25 },
        { distance: 12, par: 2, x: 0.7, y: 0.2 },
        { distance: 20, par: 3, x: 0.5, y: 0.15 },
        { distance: 8, par: 2, x: 0.4, y: 0.3 },
        { distance: 18, par: 3, x: 0.6, y: 0.18 },
        { distance: 25, par: 3, x: 0.5, y: 0.12 },
        { distance: 14, par: 2, x: 0.35, y: 0.22 },
        { distance: 22, par: 3, x: 0.65, y: 0.15 }
    ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentHole: 0,
    totalPutts: 0,
    holePutts: 0,
    totalScore: 0,
    isPlaying: false,
    isDragging: false,
    dragStartY: 0,
    power: 0
};

let ballState = {
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    isPutting: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    nextHoleBtn: document.getElementById('nextHoleBtn'),

    // Display elements
    holeDisplay: document.getElementById('hole'),
    puttsDisplay: document.getElementById('putts'),
    scoreDisplay: document.getElementById('score'),
    finalScoreDisplay: document.getElementById('finalScore'),
    totalPuttsDisplay: document.getElementById('totalPutts'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    holeCompleteOverlay: document.getElementById('holeCompleteOverlay'),
    holeCompleteTitle: document.getElementById('holeCompleteTitle'),
    holeScoreText: document.getElementById('holeScoreText'),
    holePuttsDisplay: document.getElementById('holePutts'),

    // Game elements
    golfBall: document.getElementById('golfBall'),
    holeContainer: document.getElementById('holeContainer'),
    green: document.getElementById('green'),
    powerMeterContainer: document.getElementById('powerMeterContainer'),
    powerMeterFill: document.getElementById('powerMeterFill'),
    powerIndicator: document.getElementById('powerIndicator'),
    holeInfo: document.getElementById('holeInfo'),
    distanceValue: document.getElementById('distanceValue'),
    parValue: document.getElementById('parValue')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Golf Putting game initialized');
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

    // Next hole button
    elements.nextHoleBtn.addEventListener('touchstart', handleNextHole);
    elements.nextHoleBtn.addEventListener('click', handleNextHole);

    // Golf ball drag events
    elements.golfBall.addEventListener('touchstart', handleDragStart);
    elements.golfBall.addEventListener('mousedown', handleDragStart);

    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mousemove', handleDragMove);

    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('mouseup', handleDragEnd);

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

let animationFrame = null;

function gameLoop() {
    if (!gameState.isPlaying) return;

    if (ballState.isPutting) {
        updateBallPhysics();
        renderBall();
        checkHoleCollision();
    }

    animationFrame = requestAnimationFrame(gameLoop);
}

function updateBallPhysics() {
    // Apply friction
    ballState.velocityX *= CONFIG.physics.friction;
    ballState.velocityY *= CONFIG.physics.friction;

    // Update position
    ballState.x += ballState.velocityX;
    ballState.y += ballState.velocityY;

    // Stop ball if velocity is too low
    const speed = Math.sqrt(ballState.velocityX ** 2 + ballState.velocityY ** 2);
    if (speed < CONFIG.physics.stopVelocity) {
        stopBall();
    }

    // Keep ball within green bounds
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const ballSize = 40;

    if (ballState.x < 0) {
        ballState.x = 0;
        ballState.velocityX *= -0.5;
    }
    if (ballState.x > gameAreaRect.width - ballSize) {
        ballState.x = gameAreaRect.width - ballSize;
        ballState.velocityX *= -0.5;
    }
    if (ballState.y < 0) {
        ballState.y = 0;
        ballState.velocityY *= -0.5;
    }
    if (ballState.y > gameAreaRect.height - ballSize) {
        ballState.y = gameAreaRect.height - ballSize;
        ballState.velocityY *= -0.5;
    }
}

function renderBall() {
    elements.golfBall.style.left = ballState.x + 'px';
    elements.golfBall.style.top = ballState.y + 'px';

    // Create ball trail effect (occasionally)
    if (Math.random() > 0.7) {
        createBallTrail();
    }
}

function createBallTrail() {
    const trail = document.createElement('div');
    trail.className = 'ball-trail';
    trail.style.left = ballState.x + 10 + 'px';
    trail.style.top = ballState.y + 10 + 'px';
    elements.green.appendChild(trail);

    setTimeout(() => trail.remove(), 500);
}

function stopBall() {
    ballState.velocityX = 0;
    ballState.velocityY = 0;
    ballState.isPutting = false;
    elements.golfBall.classList.remove('putting');
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.currentHole = 0;
    gameState.totalPutts = 0;
    gameState.totalScore = 0;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.holeInfo.style.display = 'flex';

    // Setup first hole
    setupHole(0);

    // Start game loop
    gameLoop();

    console.log('Game started');
}

function setupHole(holeIndex) {
    const hole = CONFIG.holes[holeIndex];
    gameState.holePutts = 0;

    // Update displays
    elements.holeDisplay.textContent = `${holeIndex + 1}/${CONFIG.totalHoles}`;
    elements.distanceValue.textContent = `${hole.distance}ft`;
    elements.parValue.textContent = hole.par;
    updatePuttsDisplay();
    updateScoreDisplay();

    // Position hole
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const holeX = gameAreaRect.width * hole.x;
    const holeY = gameAreaRect.height * hole.y;

    elements.holeContainer.style.left = holeX + 'px';
    elements.holeContainer.style.top = holeY + 'px';
    elements.holeContainer.style.transform = 'none';

    // Reset ball position
    resetBallPosition();
}

function resetBallPosition() {
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    ballState.x = gameAreaRect.width / 2 - 20;
    ballState.y = gameAreaRect.height - 100;
    ballState.velocityX = 0;
    ballState.velocityY = 0;
    ballState.isPutting = false;

    elements.golfBall.style.left = ballState.x + 'px';
    elements.golfBall.style.top = ballState.y + 'px';
    elements.golfBall.classList.remove('putting', 'hole-in');
}

function completeHole() {
    ballState.isPutting = false;

    // Calculate score relative to par
    const hole = CONFIG.holes[gameState.currentHole];
    const scoreDiff = gameState.holePutts - hole.par;
    gameState.totalScore += scoreDiff;

    // Determine score name
    let scoreText = '';
    let titleText = '';

    if (gameState.holePutts === 1) {
        scoreText = '⛳ HOLE IN ONE! ⛳';
        titleText = 'Amazing!';
    } else if (scoreDiff <= -2) {
        scoreText = '🦅 Eagle!';
        titleText = 'Incredible!';
    } else if (scoreDiff === -1) {
        scoreText = '🐦 Birdie!';
        titleText = 'Great putt!';
    } else if (scoreDiff === 0) {
        scoreText = '✓ Par';
        titleText = 'Nice job!';
    } else if (scoreDiff === 1) {
        scoreText = '+1 Bogey';
        titleText = 'Keep trying!';
    } else {
        scoreText = `+${scoreDiff}`;
        titleText = 'Hole Complete';
    }

    // Show hole complete overlay
    elements.holeCompleteTitle.textContent = titleText;
    elements.holeScoreText.textContent = scoreText;
    elements.holePuttsDisplay.textContent = gameState.holePutts;
    elements.holeCompleteOverlay.style.display = 'flex';
}

function nextHole() {
    elements.holeCompleteOverlay.style.display = 'none';

    gameState.currentHole++;

    if (gameState.currentHole >= CONFIG.totalHoles) {
        endGame();
    } else {
        setupHole(gameState.currentHole);
    }
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    // Calculate final message
    let message = '';
    if (gameState.totalScore <= -10) {
        message = '🏆 Outstanding! You\'re a golf pro!';
    } else if (gameState.totalScore <= -5) {
        message = '⭐ Excellent golfing!';
    } else if (gameState.totalScore <= 0) {
        message = '👏 Great round!';
    } else if (gameState.totalScore <= 5) {
        message = '👍 Good job! Keep practicing!';
    } else {
        message = '⛳ Nice effort! Try again!';
    }

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.totalScore >= 0 ? `+${gameState.totalScore}` : gameState.totalScore;
    elements.totalPuttsDisplay.textContent = gameState.totalPutts;
    elements.finalMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.totalScore);
}

function resetGame() {
    gameState.currentHole = 0;
    gameState.totalPutts = 0;
    gameState.holePutts = 0;
    gameState.totalScore = 0;
    gameState.isPlaying = false;
    gameState.isDragging = false;
    gameState.power = 0;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.holeCompleteOverlay.style.display = 'none';
    elements.powerMeterContainer.style.display = 'none';
    elements.holeInfo.style.display = 'none';

    updatePuttsDisplay();
    updateScoreDisplay();
    updateHoleDisplay();

    console.log('Game reset');
}

// ==========================================
// DRAG & PUTT MECHANICS
// ==========================================

function handleDragStart(e) {
    if (!gameState.isPlaying || ballState.isPutting) return;

    e.preventDefault();
    gameState.isDragging = true;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    gameState.dragStartY = clientY;

    elements.golfBall.classList.add('dragging');
    elements.powerMeterContainer.style.display = 'block';
    gameState.power = 0;
    updatePowerMeter();
}

function handleDragMove(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate power based on drag distance (drag down to power up)
    const dragDistance = clientY - gameState.dragStartY;
    gameState.power = Math.max(0, Math.min(100, dragDistance * 0.5));

    updatePowerMeter();
}

function handleDragEnd(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    gameState.isDragging = false;

    elements.golfBall.classList.remove('dragging');
    elements.golfBall.classList.add('putting');
    elements.powerMeterContainer.style.display = 'none';

    // Putt the ball
    puttBall(gameState.power);
}

function puttBall(power) {
    if (power < 5) {
        // Not enough power, reset
        elements.golfBall.classList.remove('putting');
        return;
    }

    ballState.isPutting = true;
    gameState.holePutts++;
    gameState.totalPutts++;
    updatePuttsDisplay();

    // Calculate direction toward hole
    const ballRect = elements.golfBall.getBoundingClientRect();
    const holeRect = elements.holeContainer.getBoundingClientRect();

    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    const holeCenterX = holeRect.left + holeRect.width / 2;
    const holeCenterY = holeRect.top + holeRect.height / 2;

    const dx = holeCenterX - ballCenterX;
    const dy = holeCenterY - ballCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction and apply power
    const speed = CONFIG.physics.minPower + (power / 100) * (CONFIG.physics.maxPower - CONFIG.physics.minPower);
    ballState.velocityX = (dx / distance) * speed;
    ballState.velocityY = (dy / distance) * speed;
}

function updatePowerMeter() {
    elements.powerMeterFill.style.height = gameState.power + '%';
    elements.powerIndicator.textContent = Math.round(gameState.power) + '%';
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkHoleCollision() {
    const ballRect = elements.golfBall.getBoundingClientRect();
    const holeRect = document.getElementById('hole').getBoundingClientRect();

    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    const holeCenterX = holeRect.left + holeRect.width / 2;
    const holeCenterY = holeRect.top + holeRect.height / 2;

    const distance = Math.sqrt(
        (ballCenterX - holeCenterX) ** 2 +
        (ballCenterY - holeCenterY) ** 2
    );

    // Check if ball is in the hole (within hole radius)
    if (distance < 20 && ballState.isPutting) {
        // Ball is in the hole!
        holeInOne();
    }
}

function holeInOne() {
    ballState.isPutting = false;
    elements.golfBall.classList.add('hole-in');

    // Show score popup
    showScorePopup('IN!');

    // Wait for animation then show hole complete
    setTimeout(() => {
        completeHole();
    }, 800);
}

function showScorePopup(text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;

    const holeRect = elements.holeContainer.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();

    popup.style.left = (holeRect.left - gameAreaRect.left + holeRect.width / 2) + 'px';
    popup.style.top = (holeRect.top - gameAreaRect.top) + 'px';

    elements.green.appendChild(popup);

    setTimeout(() => {
        popup.remove();
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

function handleNextHole(e) {
    e.preventDefault();
    nextHole();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updatePuttsDisplay() {
    elements.puttsDisplay.textContent = gameState.totalPutts;
}

function updateScoreDisplay() {
    const scoreText = gameState.totalScore === 0 ? 'E' :
                     (gameState.totalScore > 0 ? `+${gameState.totalScore}` : gameState.totalScore);
    elements.scoreDisplay.textContent = scoreText;
}

function updateHoleDisplay() {
    elements.holeDisplay.textContent = `${gameState.currentHole + 1}/${CONFIG.totalHoles}`;
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
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
});
