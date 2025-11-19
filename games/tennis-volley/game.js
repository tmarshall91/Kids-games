'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    ballSpeed: 1.5, // seconds for ball to travel from one side to other
    perfectTimingWindow: 0.15, // seconds
    goodTimingWindow: 0.3, // seconds
    speedIncrease: 0.05, // speed increase per successful hit
    minSpeed: 0.8, // minimum ball travel time (faster)
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    rally: 0,
    bestRally: 0,
    isPlaying: false,
    ballPosition: { x: 50, y: 50 }, // percentage
    ballDirection: 1, // 1 = moving to player, -1 = moving to opponent
    ballSpeed: CONFIG.ballSpeed,
    ballTravelProgress: 0, // 0 to 1
    canHit: false,
    gameAreaRect: null,
    lastTimestamp: 0,
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
    rallyDisplay: document.getElementById('rally'),
    bestRallyDisplay: document.getElementById('bestRally'),
    finalRallyDisplay: document.getElementById('finalRally'),
    finalBestRallyDisplay: document.getElementById('finalBestRally'),
    encouragementDisplay: document.getElementById('encouragement'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game objects
    ball: document.getElementById('ball'),
    playerRacket: document.getElementById('playerRacket'),
    opponentPlayer: document.getElementById('opponentPlayer'),
    timingIndicator: document.getElementById('timingIndicator'),
    court: document.querySelector('.tennis-court'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Tennis Volley initialized');
    setupEventListeners();
    resetGame();

    // Load best rally from localStorage
    const savedBest = localStorage.getItem('tennisVolleyBestRally');
    if (savedBest) {
        gameState.bestRally = parseInt(savedBest, 10);
        updateBestRallyDisplay();
    }
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

    // Game area tap/click for hitting
    elements.gameArea.addEventListener('touchstart', handleHitAttempt);
    elements.gameArea.addEventListener('click', handleHitAttempt);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

let animationId = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = (timestamp - gameState.lastTimestamp) / 1000; // Convert to seconds
    gameState.lastTimestamp = timestamp;

    // Update game logic
    updateGame(deltaTime);

    // Render game
    renderGame();

    // Continue loop
    animationId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    // Update ball position
    if (gameState.ballDirection !== 0) {
        gameState.ballTravelProgress += deltaTime / gameState.ballSpeed;

        // Check if ball reached the end
        if (gameState.ballTravelProgress >= 1) {
            if (gameState.ballDirection === 1) {
                // Ball reached player's side - check if player hit it
                if (!gameState.canHit) {
                    // Player didn't hit it in time - MISS!
                    handleMiss();
                }
            } else {
                // Ball reached opponent's side - opponent auto-hits
                opponentHit();
            }
        }

        // Update can hit status
        if (gameState.ballDirection === 1 && gameState.ballTravelProgress >= 0.7 && gameState.ballTravelProgress <= 1) {
            gameState.canHit = true;
        } else {
            gameState.canHit = false;
        }
    }
}

function renderGame() {
    // Calculate ball position based on travel progress
    const progress = gameState.ballTravelProgress;

    // Ball moves from top (opponent) to bottom (player) or vice versa
    let yPercent;
    if (gameState.ballDirection === 1) {
        // Moving to player (downward)
        yPercent = 15 + (progress * 70); // 15% to 85%
    } else {
        // Moving to opponent (upward)
        yPercent = 85 - (progress * 70); // 85% to 15%
    }

    // Add slight arc to ball movement (parabola)
    const arc = Math.sin(progress * Math.PI) * 30; // Arc offset in pixels

    elements.ball.style.left = '50%';
    elements.ball.style.top = `${yPercent}%`;
    elements.ball.style.transform = `translateX(-50%) translateY(${-arc}px)`;

    // Show timing indicator when ball is in player zone
    if (gameState.canHit) {
        elements.timingIndicator.classList.add('active');
    } else {
        elements.timingIndicator.classList.remove('active');
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.rally = 0;
    gameState.ballSpeed = CONFIG.ballSpeed;
    gameState.ballTravelProgress = 0;
    gameState.ballDirection = 1; // Start with ball moving to player
    gameState.canHit = false;

    // Update UI
    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.ball.classList.add('active', 'hit');

    updateRallyDisplay();
    updateBestRallyDisplay();

    // Get game area dimensions
    gameState.gameAreaRect = elements.gameArea.getBoundingClientRect();

    // Start game loop
    gameState.lastTimestamp = performance.now();
    animationId = requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Update best rally
    if (gameState.rally > gameState.bestRally) {
        gameState.bestRally = gameState.rally;
        localStorage.setItem('tennisVolleyBestRally', gameState.bestRally);
        updateBestRallyDisplay();
    }

    // Show game over overlay with encouragement
    elements.finalRallyDisplay.textContent = gameState.rally;
    elements.finalBestRallyDisplay.textContent = gameState.bestRally;
    elements.encouragementDisplay.textContent = getEncouragement(gameState.rally);
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final rally:', gameState.rally);
}

function resetGame() {
    gameState.rally = 0;
    gameState.isPlaying = false;
    gameState.ballTravelProgress = 0;
    gameState.ballDirection = 0;
    gameState.canHit = false;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Reset UI
    elements.gameMessage.classList.remove('hidden');
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.ball.classList.remove('active', 'hit');
    elements.timingIndicator.classList.remove('active');

    updateRallyDisplay();

    console.log('Game reset');
}

// ==========================================
// GAME MECHANICS
// ==========================================

function handleHitAttempt(e) {
    if (!gameState.isPlaying) return;
    if (gameState.ballDirection !== 1) return; // Only hit when ball coming to player

    e.preventDefault();

    if (gameState.canHit) {
        // Calculate timing quality
        const timingQuality = calculateTimingQuality();

        if (timingQuality !== 'miss') {
            // Successful hit!
            playerHit(timingQuality);
        } else {
            // Too early or too late
            handleMiss();
        }
    } else {
        // Ball not in hitting zone yet
        if (gameState.ballTravelProgress < 0.7) {
            showFeedback('Too early!', 'miss');
        } else {
            showFeedback('Too late!', 'miss');
        }
        handleMiss();
    }
}

function calculateTimingQuality() {
    // Perfect timing is around 85% progress (middle of hitting zone)
    const idealTiming = 0.85;
    const timingDiff = Math.abs(gameState.ballTravelProgress - idealTiming);

    if (timingDiff <= CONFIG.perfectTimingWindow) {
        return 'perfect';
    } else if (timingDiff <= CONFIG.goodTimingWindow) {
        return 'good';
    } else {
        return 'miss';
    }
}

function playerHit(quality) {
    // Increment rally
    gameState.rally++;
    updateRallyDisplay();

    // Swing animation
    elements.playerRacket.classList.add('swing');
    setTimeout(() => {
        elements.playerRacket.classList.remove('swing');
    }, 300);

    // Show feedback
    if (quality === 'perfect') {
        showFeedback('Perfect! 🌟', 'perfect');
        playHitSound();
    } else {
        showFeedback('Good! ✓', 'good');
        playHitSound();
    }

    // Reverse ball direction
    gameState.ballDirection = -1;
    gameState.ballTravelProgress = 0;
    gameState.canHit = false;

    // Increase speed slightly
    gameState.ballSpeed = Math.max(
        CONFIG.minSpeed,
        gameState.ballSpeed - CONFIG.speedIncrease
    );

    console.log(`Player hit! Quality: ${quality}, Rally: ${gameState.rally}`);
}

function opponentHit() {
    // Opponent always hits perfectly (auto)
    elements.opponentPlayer.classList.add('swing');
    setTimeout(() => {
        elements.opponentPlayer.classList.remove('swing');
    }, 300);

    // Reverse ball direction
    gameState.ballDirection = 1;
    gameState.ballTravelProgress = 0;
    gameState.canHit = false;

    playHitSound();

    console.log('Opponent hit!');
}

function handleMiss() {
    showFeedback('Miss! ✗', 'miss');
    playMissSound();

    // End game
    setTimeout(() => {
        endGame();
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

function updateRallyDisplay() {
    elements.rallyDisplay.textContent = gameState.rally;

    if (gameState.rally > 0) {
        elements.rallyDisplay.classList.add('pulse');
        setTimeout(() => {
            elements.rallyDisplay.classList.remove('pulse');
        }, 300);
    }
}

function updateBestRallyDisplay() {
    elements.bestRallyDisplay.textContent = gameState.bestRally;
}

function showFeedback(text, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = text;
    elements.court.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 600);
}

function getEncouragement(rally) {
    if (rally >= 50) return 'Incredible! You\'re a tennis champion! 🏆';
    if (rally >= 30) return 'Amazing skills! Keep it up! 🌟';
    if (rally >= 20) return 'Fantastic rally! You\'re getting good! 💪';
    if (rally >= 10) return 'Great job! Keep practicing! 👏';
    if (rally >= 5) return 'Nice effort! Try again! 😊';
    return 'Keep practicing! You\'ll get better! 🎾';
}

// ==========================================
// SOUND EFFECTS (Visual feedback)
// ==========================================

function playHitSound() {
    // Visual feedback for hit
    elements.ball.classList.remove('hit');
    void elements.ball.offsetWidth; // Force reflow
    elements.ball.classList.add('hit');
}

function playMissSound() {
    // Visual feedback for miss
    elements.ball.classList.add('bounce');
    setTimeout(() => {
        elements.ball.classList.remove('bounce');
    }, 500);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Clamp value between min and max
 */
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
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
