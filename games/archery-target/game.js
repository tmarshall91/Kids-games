'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalArrows: 10,
    targetRadius: 100, // pixels (for 200px width target)
    windEnabled: true,
    windChangeInterval: 3000, // ms
    scoringRings: [
        { radius: 20, points: 10, name: 'Bullseye!' },
        { radius: 40, points: 8, name: 'Excellent!' },
        { radius: 60, points: 6, name: 'Good!' },
        { radius: 80, points: 4, name: 'Nice!' },
        { radius: 100, points: 2, name: 'Hit!' }
    ],
    arrowSpeed: 800, // ms for arrow flight animation
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    arrowsLeft: CONFIG.totalArrows,
    isPlaying: false,
    isDragging: false,
    canShoot: true,
    wind: { x: 0, y: 0 },
    shots: [], // Track all shots for statistics
    dragStart: { x: 0, y: 0 },
    currentAim: { x: 0, y: 0 },
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
    arrowsDisplay: document.getElementById('arrows'),
    finalScoreDisplay: document.getElementById('finalScore'),
    accuracyStats: document.getElementById('accuracyStats'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game objects
    target: document.getElementById('target'),
    bowContainer: document.getElementById('bowContainer'),
    arrow: document.getElementById('arrow'),
    aimGuide: document.getElementById('aimGuide'),
    windIndicator: document.getElementById('windIndicator'),
    windValue: document.getElementById('windValue'),
    windArrow: document.getElementById('windArrow'),
    shotFeedback: document.getElementById('shotFeedback'),
    shotPoints: document.getElementById('shotPoints'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Archery game initialized');
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

    // Bow/Arrow drag controls
    elements.bowContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    elements.bowContainer.addEventListener('mousedown', handleDragStart);

    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('mousemove', handleDragMove);

    document.addEventListener('touchend', handleDragEnd);
    document.addEventListener('mouseup', handleDragEnd);
}

// ==========================================
// WIND SYSTEM
// ==========================================

let windInterval = null;

function updateWind() {
    if (!CONFIG.windEnabled) {
        gameState.wind = { x: 0, y: 0 };
        return;
    }

    // Generate random wind (-1 to 1 for both x and y)
    const windStrength = 0.7;
    gameState.wind.x = (Math.random() * 2 - 1) * windStrength;
    gameState.wind.y = (Math.random() * 2 - 1) * windStrength;

    updateWindDisplay();
}

function updateWindDisplay() {
    const strength = Math.sqrt(gameState.wind.x ** 2 + gameState.wind.y ** 2);

    if (strength < 0.2) {
        elements.windValue.textContent = 'Light';
        elements.windArrow.textContent = '→';
    } else if (strength < 0.5) {
        elements.windValue.textContent = 'Medium';
        elements.windArrow.textContent = '⇒';
    } else {
        elements.windValue.textContent = 'Strong';
        elements.windArrow.textContent = '⇛';
    }

    // Calculate wind direction angle
    const angle = Math.atan2(gameState.wind.y, gameState.wind.x) * (180 / Math.PI);
    elements.windArrow.style.transform = `rotate(${angle}deg)`;
}

function startWindUpdates() {
    updateWind();
    windInterval = setInterval(updateWind, CONFIG.windChangeInterval);
}

function stopWindUpdates() {
    if (windInterval) {
        clearInterval(windInterval);
        windInterval = null;
    }
}

// ==========================================
// DRAG & AIM MECHANICS
// ==========================================

function handleDragStart(e) {
    if (!gameState.isPlaying || !gameState.canShoot || gameState.arrowsLeft <= 0) return;

    e.preventDefault();
    gameState.isDragging = true;

    const rect = elements.gameArea.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    gameState.dragStart.x = clientX - rect.left;
    gameState.dragStart.y = clientY - rect.top;

    elements.aimGuide.classList.add('visible');
}

function handleDragMove(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();

    const rect = elements.gameArea.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    // Calculate aim direction (from bow to drag point)
    const deltaX = currentX - gameState.dragStart.x;
    const deltaY = currentY - gameState.dragStart.y;

    // Limit pull distance
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const maxPull = 100;
    const pullRatio = Math.min(distance / maxPull, 1);

    // Update aim guide
    const angle = Math.atan2(deltaY, deltaX);
    const guideLength = pullRatio * 150;

    elements.aimGuide.style.height = guideLength + 'px';
    elements.aimGuide.style.transform = `rotate(${angle}rad)`;

    // Rotate arrow to aim direction
    elements.arrow.style.transform = `rotate(${angle}rad)`;

    // Store current aim for shooting
    gameState.currentAim = { x: deltaX, y: deltaY, pullRatio };
}

function handleDragEnd(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();
    gameState.isDragging = false;
    elements.aimGuide.classList.remove('visible');

    // Shoot arrow if there was a pull
    const pullDistance = Math.sqrt(
        gameState.currentAim.x ** 2 + gameState.currentAim.y ** 2
    );

    if (pullDistance > 10) {
        shootArrow();
    }

    // Reset arrow rotation
    setTimeout(() => {
        elements.arrow.style.transform = 'rotate(0)';
    }, 100);
}

// ==========================================
// SHOOTING MECHANICS
// ==========================================

function shootArrow() {
    if (!gameState.canShoot || gameState.arrowsLeft <= 0) return;

    gameState.canShoot = false;
    gameState.arrowsLeft--;
    updateArrowsDisplay();

    // Calculate target position
    const targetRect = elements.target.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();

    const targetCenterX = targetRect.left + targetRect.width / 2 - gameAreaRect.left;
    const targetCenterY = targetRect.top + targetRect.height / 2 - gameAreaRect.top;

    // Calculate arrow landing position with aim and wind effect
    const aimInfluence = 2.5;
    const windInfluence = 50;

    const landX = targetCenterX + (gameState.currentAim.x * aimInfluence) + (gameState.wind.x * windInfluence);
    const landY = targetCenterY + (gameState.currentAim.y * aimInfluence) + (gameState.wind.y * windInfluence);

    // Create flying arrow animation
    animateFlyingArrow(landX, landY);

    // Calculate score after arrow lands
    setTimeout(() => {
        const score = calculateScore(landX, landY, targetCenterX, targetCenterY);
        handleScore(score, landX, landY);

        // Check if game over
        if (gameState.arrowsLeft <= 0) {
            setTimeout(endGame, 1500);
        } else {
            gameState.canShoot = true;
        }
    }, CONFIG.arrowSpeed);
}

function animateFlyingArrow(targetX, targetY) {
    const arrow = document.createElement('div');
    arrow.className = 'flying-arrow';
    arrow.innerHTML = elements.arrow.innerHTML;

    // Start position (bow position)
    const bowRect = elements.bowContainer.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();

    const startX = bowRect.left + bowRect.width / 2 - gameAreaRect.left;
    const startY = bowRect.top + 40 - gameAreaRect.top;

    arrow.style.left = startX + 'px';
    arrow.style.top = startY + 'px';

    // Calculate angle to target
    const angle = Math.atan2(targetY - startY, targetX - startX);
    arrow.style.transform = `rotate(${angle}rad)`;

    elements.gameArea.appendChild(arrow);

    // Animate to target
    setTimeout(() => {
        arrow.style.transition = `all ${CONFIG.arrowSpeed}ms ease-out`;
        arrow.style.left = targetX + 'px';
        arrow.style.top = targetY + 'px';
    }, 10);

    // Remove flying arrow after animation
    setTimeout(() => {
        arrow.remove();
    }, CONFIG.arrowSpeed + 100);
}

function calculateScore(landX, landY, targetX, targetY) {
    const distance = Math.sqrt((landX - targetX) ** 2 + (landY - targetY) ** 2);

    // Check each ring from inside out
    for (let ring of CONFIG.scoringRings) {
        if (distance <= ring.radius) {
            return { points: ring.points, name: ring.name, distance };
        }
    }

    return { points: 0, name: 'Miss!', distance };
}

function handleScore(score, landX, landY) {
    // Update score
    gameState.score += score.points;
    updateScoreDisplay();

    // Record shot
    gameState.shots.push({
        points: score.points,
        distance: score.distance,
        hit: score.points > 0
    });

    // Show feedback
    showShotFeedback(score);

    // Add stuck arrow to target if it hit
    if (score.points > 0) {
        addStuckArrow(landX, landY);
    }
}

function showShotFeedback(score) {
    elements.shotPoints.textContent = score.name + ' +' + score.points;
    elements.shotFeedback.style.display = 'block';
    elements.shotFeedback.style.color = score.points >= 8 ? '#2ecc71' :
                                        score.points >= 4 ? '#f1c40f' :
                                        score.points > 0 ? '#e67e22' : '#e74c3c';

    // Remove feedback after animation
    setTimeout(() => {
        elements.shotFeedback.style.display = 'none';
    }, 1000);
}

function addStuckArrow(x, y) {
    const stuckArrow = document.createElement('div');
    stuckArrow.className = 'stuck-arrow';
    stuckArrow.style.left = x + 'px';
    stuckArrow.style.top = y + 'px';

    // Calculate angle to target center
    const targetRect = elements.target.getBoundingClientRect();
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2 - gameAreaRect.left;
    const targetCenterY = targetRect.top + targetRect.height / 2 - gameAreaRect.top;

    const angle = Math.atan2(targetCenterY - y, targetCenterX - x);
    stuckArrow.style.transform = `rotate(${angle}rad)`;

    elements.gameArea.appendChild(stuckArrow);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.arrowsLeft = CONFIG.totalArrows;
    gameState.canShoot = true;
    gameState.shots = [];

    // Clear any stuck arrows
    document.querySelectorAll('.stuck-arrow').forEach(arrow => arrow.remove());

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.target.classList.add('active');
    elements.bowContainer.classList.add('active');
    elements.windIndicator.classList.add('active');
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateArrowsDisplay();

    // Start wind updates
    startWindUpdates();

    console.log('Archery game started');
}

function endGame() {
    gameState.isPlaying = false;
    gameState.canShoot = false;
    stopWindUpdates();

    // Calculate statistics
    const totalShots = gameState.shots.length;
    const hits = gameState.shots.filter(s => s.hit).length;
    const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;
    const bullseyes = gameState.shots.filter(s => s.points === 10).length;

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.accuracyStats.innerHTML = `
        🎯 Accuracy: ${accuracy}%<br>
        🏹 Hits: ${hits}/${totalShots}<br>
        ⭐ Bullseyes: ${bullseyes}
    `;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.arrowsLeft = CONFIG.totalArrows;
    gameState.isPlaying = false;
    gameState.canShoot = false;
    gameState.isDragging = false;
    gameState.shots = [];

    stopWindUpdates();

    // Clear stuck arrows
    document.querySelectorAll('.stuck-arrow').forEach(arrow => arrow.remove());

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.target.classList.remove('active');
    elements.bowContainer.classList.remove('active');
    elements.windIndicator.classList.remove('active');
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.aimGuide.classList.remove('visible');

    updateScoreDisplay();
    updateArrowsDisplay();

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

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function updateArrowsDisplay() {
    elements.arrowsDisplay.textContent = gameState.arrowsLeft;

    // Change color based on arrows left
    if (gameState.arrowsLeft <= 3) {
        elements.arrowsDisplay.style.color = '#e74c3c';
    } else if (gameState.arrowsLeft <= 5) {
        elements.arrowsDisplay.style.color = '#f1c40f';
    } else {
        elements.arrowsDisplay.style.color = 'white';
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    stopWindUpdates();
});
