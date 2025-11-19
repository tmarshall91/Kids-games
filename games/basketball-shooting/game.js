'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gameTime: 30, // seconds
    points: {
        basket: 2,
        swish: 3
    },
    physics: {
        gravity: 0.6,
        minPower: 10,
        maxPower: 25
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
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
    isShooting: false
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
    timerDisplay: document.getElementById('timer'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game elements
    basketball: document.getElementById('basketball'),
    hoop: document.getElementById('hoop'),
    powerMeterContainer: document.getElementById('powerMeterContainer'),
    powerMeterFill: document.getElementById('powerMeterFill')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Basketball Shooting game initialized');
    setupEventListeners();
    resetBallPosition();
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

    // Basketball drag events
    elements.basketball.addEventListener('touchstart', handleDragStart);
    elements.basketball.addEventListener('mousedown', handleDragStart);

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

let timerInterval = null;
let animationFrame = null;

function gameLoop() {
    if (!gameState.isPlaying) return;

    if (ballState.isShooting) {
        updateBallPhysics();
        renderBall();
        checkBasketCollision();
    }

    animationFrame = requestAnimationFrame(gameLoop);
}

function updateBallPhysics() {
    // Apply gravity
    ballState.velocityY += CONFIG.physics.gravity;

    // Update position
    ballState.x += ballState.velocityX;
    ballState.y += ballState.velocityY;

    // Check if ball is out of bounds (below screen)
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    if (ballState.y > gameAreaRect.height + 100) {
        resetShot();
    }
}

function renderBall() {
    elements.basketball.style.left = ballState.x + 'px';
    elements.basketball.style.top = ballState.y + 'px';
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTimerDisplay();

    // Reset ball
    resetBallPosition();

    // Start game timer
    startTimer();

    // Start game loop
    gameLoop();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    // Show game over overlay with message
    elements.finalScoreDisplay.textContent = gameState.score;

    let message = 'Keep practicing!';
    if (gameState.score >= 30) {
        message = 'Amazing! You\'re a basketball star!';
    } else if (gameState.score >= 20) {
        message = 'Great job! You\'re getting good!';
    } else if (gameState.score >= 10) {
        message = 'Nice shooting!';
    }

    elements.finalMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = false;
    gameState.isDragging = false;
    gameState.power = 0;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.powerMeterContainer.style.display = 'none';

    updateScoreDisplay();
    updateTimerDisplay();

    resetBallPosition();

    console.log('Game reset');
}

function resetBallPosition() {
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    ballState.x = gameAreaRect.width / 2 - 24; // 24 is half the ball size
    ballState.y = gameAreaRect.height - 100;
    ballState.velocityX = 0;
    ballState.velocityY = 0;
    ballState.isShooting = false;

    elements.basketball.style.left = ballState.x + 'px';
    elements.basketball.style.top = ballState.y + 'px';
    elements.basketball.classList.remove('shooting');
}

function resetShot() {
    ballState.isShooting = false;
    resetBallPosition();
}

// ==========================================
// DRAG & SHOOT MECHANICS
// ==========================================

function handleDragStart(e) {
    if (!gameState.isPlaying || ballState.isShooting) return;

    e.preventDefault();
    gameState.isDragging = true;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    gameState.dragStartY = clientY;

    elements.basketball.classList.add('dragging');
    elements.powerMeterContainer.style.display = 'block';
    gameState.power = 0;
    updatePowerMeter();
}

function handleDragMove(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Calculate power based on drag distance
    const dragDistance = gameState.dragStartY - clientY;
    gameState.power = Math.max(0, Math.min(100, dragDistance * 0.5));

    updatePowerMeter();
}

function handleDragEnd(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    gameState.isDragging = false;

    elements.basketball.classList.remove('dragging');
    elements.basketball.classList.add('shooting');
    elements.powerMeterContainer.style.display = 'none';

    // Shoot the ball
    shootBall(gameState.power);
}

function shootBall(power) {
    if (power < 10) {
        // Not enough power, reset
        resetShot();
        return;
    }

    ballState.isShooting = true;

    // Calculate shot angle (slightly random for variety)
    const angle = -85 + (Math.random() - 0.5) * 10;
    const radians = angle * Math.PI / 180;

    // Calculate velocity based on power
    const speed = CONFIG.physics.minPower + (power / 100) * (CONFIG.physics.maxPower - CONFIG.physics.minPower);

    ballState.velocityX = Math.cos(radians) * speed * 0.3;
    ballState.velocityY = Math.sin(radians) * speed;
}

function updatePowerMeter() {
    elements.powerMeterFill.style.height = gameState.power + '%';
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkBasketCollision() {
    const ballRect = elements.basketball.getBoundingClientRect();
    const hoopRect = elements.hoop.getBoundingClientRect();

    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;

    // Check if ball is passing through hoop area
    const hoopCenterX = hoopRect.left + hoopRect.width / 2;
    const hoopY = hoopRect.top + 70; // Rim position

    const distanceX = Math.abs(ballCenterX - hoopCenterX);
    const distanceY = Math.abs(ballCenterY - hoopY);

    // Ball is at hoop height and within hoop width
    if (distanceY < 10 && distanceX < 35 && ballState.velocityY > 0) {
        // Scored!
        const isSwish = distanceX < 15; // Perfect shot
        const points = isSwish ? CONFIG.points.swish : CONFIG.points.basket;

        scoreBasket(points, isSwish);
    }
}

function scoreBasket(points, isSwish) {
    gameState.score += points;
    updateScoreDisplay();

    // Show score popup
    showScorePopup(points, isSwish);

    // Reset for next shot
    setTimeout(() => {
        resetShot();
    }, 500);
}

function showScorePopup(points, isSwish) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = isSwish ? `SWISH! +${points}` : `+${points}`;
    popup.style.left = '50%';
    popup.style.top = '150px';
    popup.style.transform = 'translateX(-50%)';

    elements.gameArea.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
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

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;
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
    stopTimer();
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
});
