'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    shapes: ['circle', 'square', 'triangle', 'star'],
    totalShapes: 12, // Total shapes to match in the game
    pointsPerMatch: 10,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    shapesMatched: 0,
    totalShapes: CONFIG.totalShapes,
    isPlaying: false,
    currentShapes: [],
    currentTargets: [],
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
    matchedDisplay: document.getElementById('timer'), // Using timer element for matched count
    finalScoreDisplay: document.getElementById('finalScore'),
    finalMessage: document.getElementById('finalMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Shape Sorter specific
    targetsContainer: document.getElementById('targetsContainer'),
    shapesContainer: document.getElementById('shapesContainer'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Shape Sorter initialized');
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

    // Prevent default touch behavior on game area
    elements.gameArea.addEventListener('touchmove', (e) => {
        if (e.target.closest('.shape')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.shapesMatched = 0;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.targetsContainer.style.display = 'flex';
    elements.shapesContainer.style.display = 'flex';

    updateScoreDisplay();
    updateMatchedDisplay();

    // Create initial round of shapes
    createRound();

    console.log('Shape Sorter game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.shapesMatched;

    // Show encouraging message based on performance
    const percentage = (gameState.shapesMatched / gameState.totalShapes) * 100;
    let message = 'Great job!';
    if (percentage === 100) {
        message = 'Perfect! You matched them all! 🌟';
    } else if (percentage >= 75) {
        message = 'Excellent work! 🎉';
    } else if (percentage >= 50) {
        message = 'Good job! Keep practicing! 👍';
    } else {
        message = 'Nice try! You can do better! 💪';
    }
    elements.finalMessage.textContent = message;

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Shapes matched:', gameState.shapesMatched);
}

function resetGame() {
    gameState.score = 0;
    gameState.shapesMatched = 0;
    gameState.isPlaying = false;
    gameState.currentShapes = [];
    gameState.currentTargets = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.targetsContainer.style.display = 'none';
    elements.shapesContainer.style.display = 'none';

    // Clear containers
    elements.targetsContainer.innerHTML = '';
    elements.shapesContainer.innerHTML = '';

    updateScoreDisplay();
    updateMatchedDisplay();

    console.log('Game reset');
}

// ==========================================
// SHAPE CREATION AND MANAGEMENT
// ==========================================

function createRound() {
    // Determine how many shapes to create in this round
    const shapesLeft = gameState.totalShapes - gameState.shapesMatched;
    const shapesInRound = Math.min(4, shapesLeft);

    // Clear existing shapes and targets
    elements.targetsContainer.innerHTML = '';
    elements.shapesContainer.innerHTML = '';
    gameState.currentShapes = [];
    gameState.currentTargets = [];

    // Get random shapes for this round
    const shapesForRound = [];
    for (let i = 0; i < shapesInRound; i++) {
        const randomShape = CONFIG.shapes[Math.floor(Math.random() * CONFIG.shapes.length)];
        shapesForRound.push(randomShape);
    }

    // Shuffle shapes for display
    const shuffledShapes = [...shapesForRound].sort(() => Math.random() - 0.5);

    // Create target holes
    shapesForRound.forEach((shapeType, index) => {
        createTarget(shapeType, index);
    });

    // Create draggable shapes
    shuffledShapes.forEach((shapeType, index) => {
        createShape(shapeType, index);
    });
}

function createTarget(shapeType, index) {
    const target = document.createElement('div');
    target.className = 'target';
    target.dataset.shape = shapeType;
    target.dataset.index = index;

    // Add icon or label to show what shape belongs here
    const label = document.createElement('div');
    label.style.cssText = 'font-size: 12px; color: #999; text-align: center;';
    label.textContent = getShapeIcon(shapeType);
    target.appendChild(label);

    // Drag and drop event listeners
    target.addEventListener('dragover', handleDragOver);
    target.addEventListener('drop', handleDrop);
    target.addEventListener('dragleave', handleDragLeave);

    // Touch events for mobile
    target.addEventListener('touchmove', handleTouchMove);
    target.addEventListener('touchend', handleTouchEnd);

    elements.targetsContainer.appendChild(target);
    gameState.currentTargets.push({ element: target, type: shapeType, filled: false });
}

function createShape(shapeType, index) {
    const shape = document.createElement('div');
    shape.className = `shape ${shapeType}`;
    shape.dataset.shape = shapeType;
    shape.dataset.index = index;
    shape.draggable = true;

    // Drag and drop event listeners
    shape.addEventListener('dragstart', handleDragStart);
    shape.addEventListener('dragend', handleDragEnd);

    // Touch events for mobile
    shape.addEventListener('touchstart', handleTouchStart);
    shape.addEventListener('touchmove', handleTouchMove);
    shape.addEventListener('touchend', handleTouchEnd);

    elements.shapesContainer.appendChild(shape);
    gameState.currentShapes.push({ element: shape, type: shapeType });
}

function getShapeIcon(shapeType) {
    const icons = {
        circle: '🔵',
        square: '🟨',
        triangle: '🔺',
        star: '⭐'
    };
    return icons[shapeType] || '';
}

// ==========================================
// DRAG AND DROP HANDLERS (Desktop)
// ==========================================

let draggedElement = null;

function handleDragStart(e) {
    if (!gameState.isPlaying) return;

    draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.dataset.shape);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    if (!gameState.isPlaying) return;
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (!gameState.isPlaying) return;
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    const target = e.currentTarget;
    target.classList.remove('drag-over');

    if (draggedElement) {
        const shapeType = draggedElement.dataset.shape;
        const targetType = target.dataset.shape;

        checkMatch(draggedElement, target, shapeType, targetType);
    }

    return false;
}

// ==========================================
// TOUCH HANDLERS (Mobile)
// ==========================================

let touchedElement = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let clone = null;

function handleTouchStart(e) {
    if (!gameState.isPlaying) return;
    if (!e.target.classList.contains('shape')) return;

    e.preventDefault();
    touchedElement = e.target;

    // Create a clone for dragging
    clone = touchedElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '1000';
    clone.style.opacity = '0.8';

    const touch = e.touches[0];
    const rect = touchedElement.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;

    clone.style.left = (touch.clientX - touchOffsetX) + 'px';
    clone.style.top = (touch.clientY - touchOffsetY) + 'px';

    document.body.appendChild(clone);
    touchedElement.style.opacity = '0.3';
}

function handleTouchMove(e) {
    if (!touchedElement || !clone) return;
    e.preventDefault();

    const touch = e.touches[0];
    clone.style.left = (touch.clientX - touchOffsetX) + 'px';
    clone.style.top = (touch.clientY - touchOffsetY) + 'px';

    // Highlight target if over it
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (targetElement && targetElement.classList.contains('target')) {
        targetElement.classList.add('drag-over');

        // Remove highlight from other targets
        document.querySelectorAll('.target').forEach(t => {
            if (t !== targetElement) {
                t.classList.remove('drag-over');
            }
        });
    } else {
        document.querySelectorAll('.target').forEach(t => {
            t.classList.remove('drag-over');
        });
    }
}

function handleTouchEnd(e) {
    if (!touchedElement) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    // Remove clone
    if (clone) {
        clone.remove();
        clone = null;
    }

    // Check if dropped on a target
    if (targetElement && targetElement.classList.contains('target')) {
        const shapeType = touchedElement.dataset.shape;
        const targetType = targetElement.dataset.shape;
        targetElement.classList.remove('drag-over');

        checkMatch(touchedElement, targetElement, shapeType, targetType);
    } else {
        // Return shape to original opacity if not dropped on target
        touchedElement.style.opacity = '1';
    }

    touchedElement = null;
}

// ==========================================
// MATCH CHECKING
// ==========================================

function checkMatch(shapeElement, targetElement, shapeType, targetType) {
    if (shapeType === targetType) {
        // Correct match!
        handleCorrectMatch(shapeElement, targetElement);
    } else {
        // Wrong match
        handleWrongMatch(shapeElement);
    }
}

function handleCorrectMatch(shapeElement, targetElement) {
    // Play success animation
    shapeElement.classList.add('success');
    targetElement.classList.add('filled', 'bounce');

    // Update score
    gameState.score += CONFIG.pointsPerMatch;
    gameState.shapesMatched++;
    updateScoreDisplay();
    updateMatchedDisplay();

    // Remove shape after animation
    setTimeout(() => {
        shapeElement.remove();

        // Check if all shapes in round are matched
        const remainingShapes = elements.shapesContainer.querySelectorAll('.shape:not(.matched)').length;

        if (remainingShapes === 0) {
            // Check if game is complete
            if (gameState.shapesMatched >= gameState.totalShapes) {
                setTimeout(() => endGame(), 500);
            } else {
                // Start next round
                setTimeout(() => createRound(), 500);
            }
        }
    }, 500);
}

function handleWrongMatch(shapeElement) {
    // Shake animation for wrong match
    shapeElement.style.animation = 'shake 0.5s';
    shapeElement.style.opacity = '1';

    setTimeout(() => {
        shapeElement.style.animation = '';
    }, 500);
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
}

function updateMatchedDisplay() {
    elements.matchedDisplay.textContent = `${gameState.shapesMatched}/${gameState.totalShapes}`;
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

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add shake animation for wrong matches
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
