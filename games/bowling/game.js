'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalFrames: 10,
    pinsPerFrame: 10,
    physics: {
        ballSpeed: 8,
        pinKnockRadius: 40,
        ballSize: 48
    },
    scoring: {
        strikeBonus: 10,
        spareBonus: 5
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    currentFrame: 1,
    currentBall: 1,
    isPlaying: false,
    isDragging: false,
    isRolling: false,
    aimX: 0,
    dragStartX: 0,
    dragStartY: 0,
    frames: []
};

let ballState = {
    x: 0,
    y: 0,
    targetX: 0,
    isMoving: false
};

let pins = [];

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
    frameDisplay: document.getElementById('frame'),
    ballDisplay: document.getElementById('ball'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalMessage: document.getElementById('finalMessage'),
    scoreBreakdown: document.getElementById('scoreBreakdown'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game elements
    bowlingLane: document.getElementById('bowlingLane'),
    bowlingBall: document.getElementById('bowlingBall'),
    pinsContainer: document.getElementById('pinsContainer'),
    aimingGuide: document.getElementById('aimingGuide'),
    resultPopup: document.getElementById('resultPopup')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Bowling game initialized');
    setupEventListeners();
    initializeFrames();
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

    // Ball drag events for aiming
    elements.bowlingBall.addEventListener('touchstart', handleDragStart);
    elements.bowlingBall.addEventListener('mousedown', handleDragStart);

    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mousemove', handleDragMove);

    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('mouseup', handleDragEnd);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function initializeFrames() {
    gameState.frames = [];
    for (let i = 0; i < CONFIG.totalFrames; i++) {
        gameState.frames.push({
            rolls: [],
            score: 0,
            isStrike: false,
            isSpare: false
        });
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.currentFrame = 1;
    gameState.currentBall = 1;
    gameState.isRolling = false;

    // Reset frames
    initializeFrames();

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.bowlingBall.style.display = 'block';
    elements.aimingGuide.style.display = 'block';

    updateScoreDisplay();
    updateFrameDisplay();

    // Setup pins
    setupPins();
    resetBallPosition();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate final score
    calculateFinalScore();

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;

    let message = 'Keep practicing!';
    if (gameState.score >= 200) {
        message = 'Perfect game! You\'re a bowling champion! 🏆';
    } else if (gameState.score >= 150) {
        message = 'Excellent game! Strike master! 🎳';
    } else if (gameState.score >= 100) {
        message = 'Great job! You\'re getting good! 👍';
    } else if (gameState.score >= 50) {
        message = 'Nice bowling! Keep it up! 😊';
    }

    elements.finalMessage.textContent = message;

    // Show score breakdown
    displayScoreBreakdown();

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.currentFrame = 1;
    gameState.currentBall = 1;
    gameState.isPlaying = false;
    gameState.isRolling = false;

    initializeFrames();

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.bowlingBall.style.display = 'none';
    elements.aimingGuide.style.display = 'none';
    elements.resultPopup.style.display = 'none';

    updateScoreDisplay();
    updateFrameDisplay();

    // Clear pins
    elements.pinsContainer.innerHTML = '';
    pins = [];

    console.log('Game reset');
}

// ==========================================
// PIN MANAGEMENT
// ==========================================

function setupPins() {
    elements.pinsContainer.innerHTML = '';
    pins = [];

    for (let i = 0; i < CONFIG.pinsPerFrame; i++) {
        const pin = document.createElement('div');
        pin.className = `pin pin-${i}`;
        pin.textContent = '📍';
        pin.dataset.index = i;
        pin.dataset.knocked = 'false';

        elements.pinsContainer.appendChild(pin);
        pins.push({
            element: pin,
            knocked: false,
            index: i
        });
    }
}

function resetPinsForNewFrame() {
    setupPins();
}

function resetStandingPins() {
    // Keep knocked pins, reset standing pins for second ball
    pins.forEach(pin => {
        if (!pin.knocked) {
            pin.element.classList.remove('knocked');
        }
    });
}

function knockDownPin(index) {
    if (index >= 0 && index < pins.length && !pins[index].knocked) {
        pins[index].knocked = true;
        pins[index].element.classList.add('knocked');
        pins[index].element.dataset.knocked = 'true';
        return true;
    }
    return false;
}

function getKnockedPinsCount() {
    return pins.filter(pin => pin.knocked).length;
}

function getStandingPinsCount() {
    return pins.filter(pin => !pin.knocked).length;
}

// ==========================================
// BALL MECHANICS
// ==========================================

function resetBallPosition() {
    const laneRect = elements.bowlingLane.getBoundingClientRect();
    ballState.x = laneRect.width / 2;
    ballState.y = laneRect.height - 100;
    ballState.isMoving = false;

    elements.bowlingBall.style.left = ballState.x + 'px';
    elements.bowlingBall.style.bottom = '50px';
    elements.bowlingBall.style.top = 'auto';
    elements.bowlingBall.classList.remove('rolling');

    // Reset aim
    gameState.aimX = laneRect.width / 2;
    updateAimingGuide();
}

function updateAimingGuide() {
    elements.aimingGuide.style.left = gameState.aimX + 'px';
}

// ==========================================
// DRAG & AIM MECHANICS
// ==========================================

function handleDragStart(e) {
    if (!gameState.isPlaying || ballState.isMoving) return;

    e.preventDefault();
    gameState.isDragging = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    gameState.dragStartX = clientX;
    gameState.dragStartY = clientY;

    elements.bowlingBall.classList.add('dragging');
}

function handleDragMove(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;

    const laneRect = elements.bowlingLane.getBoundingClientRect();

    // Update aim position based on horizontal drag
    const deltaX = clientX - gameState.dragStartX;
    gameState.aimX = clamp(
        ballState.x + deltaX,
        laneRect.width * 0.2,
        laneRect.width * 0.8
    );

    updateAimingGuide();
}

function handleDragEnd(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    gameState.isDragging = false;

    const clientY = e.touches ? e.changedTouches[0].clientY : e.clientY;
    const deltaY = gameState.dragStartY - clientY;

    elements.bowlingBall.classList.remove('dragging');

    // If swiped up enough, roll the ball
    if (deltaY > 30) {
        rollBall();
    } else {
        // Not enough swipe, reset
        resetBallPosition();
    }
}

// ==========================================
// BALL ROLLING & PHYSICS
// ==========================================

let rollInterval = null;

function rollBall() {
    if (ballState.isMoving) return;

    ballState.isMoving = true;
    elements.bowlingBall.classList.add('rolling');
    elements.aimingGuide.style.display = 'none';

    ballState.targetX = gameState.aimX;

    const laneRect = elements.bowlingLane.getBoundingClientRect();
    const startY = laneRect.height - 100;
    const endY = 80; // Near the pins
    const totalDistance = startY - endY;
    let currentDistance = 0;

    rollInterval = setInterval(() => {
        currentDistance += CONFIG.physics.ballSpeed;

        // Calculate progress (0 to 1)
        const progress = currentDistance / totalDistance;

        if (progress >= 1) {
            // Ball reached the pins
            clearInterval(rollInterval);
            checkPinCollisions();
            completeBallRoll();
            return;
        }

        // Update ball position
        const currentY = startY - currentDistance;
        const currentX = ballState.x + (ballState.targetX - ballState.x) * progress;

        elements.bowlingBall.style.top = currentY + 'px';
        elements.bowlingBall.style.bottom = 'auto';
        elements.bowlingBall.style.left = currentX + 'px';

        ballState.x = currentX;
        ballState.y = currentY;
    }, 16); // ~60fps
}

function checkPinCollisions() {
    const ballRect = elements.bowlingBall.getBoundingClientRect();
    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;

    let knockedCount = 0;

    pins.forEach(pin => {
        if (pin.knocked) return;

        const pinRect = pin.element.getBoundingClientRect();
        const pinCenterX = pinRect.left + pinRect.width / 2;
        const pinCenterY = pinRect.top + pinRect.height / 2;

        const distance = Math.sqrt(
            Math.pow(ballCenterX - pinCenterX, 2) +
            Math.pow(ballCenterY - pinCenterY, 2)
        );

        if (distance < CONFIG.physics.pinKnockRadius) {
            if (knockDownPin(pin.index)) {
                knockedCount++;
                // Chain reaction: knocked pins can knock others
                setTimeout(() => checkChainReaction(pin.index), 100);
            }
        }
    });
}

function checkChainReaction(knockedPinIndex) {
    // Simple chain reaction simulation
    const adjacentPins = getAdjacentPins(knockedPinIndex);

    adjacentPins.forEach(adjacentIndex => {
        if (Math.random() > 0.6) { // 40% chance of chain knock
            knockDownPin(adjacentIndex);
        }
    });
}

function getAdjacentPins(index) {
    // Define which pins are adjacent to each pin
    const adjacencyMap = {
        0: [1, 2],
        1: [0, 3, 4],
        2: [0, 4, 5],
        3: [1, 6, 7],
        4: [1, 2, 7, 8],
        5: [2, 8, 9],
        6: [3, 7],
        7: [3, 4, 6, 8],
        8: [4, 5, 7, 9],
        9: [5, 8]
    };

    return adjacencyMap[index] || [];
}

function completeBallRoll() {
    setTimeout(() => {
        ballState.isMoving = false;
        elements.bowlingBall.classList.remove('rolling');

        const knockedCount = getKnockedPinsCount();
        updateFrameScore(knockedCount);
    }, 300);
}

// ==========================================
// SCORING SYSTEM
// ==========================================

function updateFrameScore(pinsKnocked) {
    const frameIndex = gameState.currentFrame - 1;
    const frame = gameState.frames[frameIndex];

    // Record the roll
    frame.rolls.push(pinsKnocked);

    let isStrike = false;
    let isSpare = false;
    let frameComplete = false;

    // Check for strike (first ball knocks all pins)
    if (gameState.currentBall === 1 && pinsKnocked === CONFIG.pinsPerFrame) {
        isStrike = true;
        frame.isStrike = true;
        frameComplete = true;
        showResultPopup('STRIKE! 🎳');
    }
    // Check for spare (two balls knock all pins)
    else if (gameState.currentBall === 2) {
        const totalPins = frame.rolls.reduce((sum, pins) => sum + pins, 0);
        if (totalPins === CONFIG.pinsPerFrame) {
            isSpare = true;
            frame.isSpare = true;
            showResultPopup('SPARE! 🎯');
        } else {
            showResultPopup(`+${pinsKnocked} pins`);
        }
        frameComplete = true;
    } else {
        showResultPopup(`+${pinsKnocked} pins`);
    }

    // Move to next ball or frame
    setTimeout(() => {
        if (frameComplete) {
            advanceFrame();
        } else {
            gameState.currentBall = 2;
            updateFrameDisplay();
            resetBallPosition();
            elements.aimingGuide.style.display = 'block';
        }
    }, 2000);
}

function advanceFrame() {
    if (gameState.currentFrame >= CONFIG.totalFrames) {
        // Game over
        endGame();
    } else {
        // Next frame
        gameState.currentFrame++;
        gameState.currentBall = 1;
        updateFrameDisplay();
        resetPinsForNewFrame();
        resetBallPosition();
        elements.aimingGuide.style.display = 'block';
    }
}

function calculateFinalScore() {
    let totalScore = 0;

    for (let i = 0; i < gameState.frames.length; i++) {
        const frame = gameState.frames[i];
        const rolls = frame.rolls;

        if (rolls.length === 0) continue;

        if (frame.isStrike) {
            // Strike: 10 + next two rolls
            totalScore += 10;
            if (i < gameState.frames.length - 1) {
                const nextFrame = gameState.frames[i + 1];
                if (nextFrame.rolls.length >= 1) {
                    totalScore += nextFrame.rolls[0];
                }
                if (nextFrame.rolls.length >= 2) {
                    totalScore += nextFrame.rolls[1];
                } else if (nextFrame.isStrike && i < gameState.frames.length - 2) {
                    const nextNextFrame = gameState.frames[i + 2];
                    if (nextNextFrame.rolls.length >= 1) {
                        totalScore += nextNextFrame.rolls[0];
                    }
                }
            }
        } else if (frame.isSpare) {
            // Spare: 10 + next one roll
            totalScore += 10;
            if (i < gameState.frames.length - 1) {
                const nextFrame = gameState.frames[i + 1];
                if (nextFrame.rolls.length >= 1) {
                    totalScore += nextFrame.rolls[0];
                }
            }
        } else {
            // Regular: sum of rolls
            totalScore += rolls.reduce((sum, pins) => sum + pins, 0);
        }

        frame.score = totalScore;
    }

    gameState.score = totalScore;
    updateScoreDisplay();
}

function displayScoreBreakdown() {
    elements.scoreBreakdown.innerHTML = '';

    gameState.frames.forEach((frame, index) => {
        if (frame.rolls.length === 0) return;

        const frameDiv = document.createElement('div');
        frameDiv.className = 'frame-score';

        if (frame.isStrike) {
            frameDiv.classList.add('strike');
        } else if (frame.isSpare) {
            frameDiv.classList.add('spare');
        }

        const frameLabel = document.createElement('span');
        frameLabel.textContent = `Frame ${index + 1}:`;

        const frameValue = document.createElement('span');
        let rollsText = frame.rolls.join(', ');
        if (frame.isStrike) {
            rollsText += ' (STRIKE)';
        } else if (frame.isSpare) {
            rollsText += ' (SPARE)';
        }
        frameValue.textContent = rollsText;

        frameDiv.appendChild(frameLabel);
        frameDiv.appendChild(frameValue);
        elements.scoreBreakdown.appendChild(frameDiv);
    });
}

function showResultPopup(message) {
    elements.resultPopup.textContent = message;
    elements.resultPopup.style.display = 'block';

    setTimeout(() => {
        elements.resultPopup.style.display = 'none';
    }, 2000);
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

function updateFrameDisplay() {
    elements.frameDisplay.textContent = gameState.currentFrame;
    elements.ballDisplay.textContent = gameState.currentBall;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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
    if (rollInterval) {
        clearInterval(rollInterval);
    }
});
