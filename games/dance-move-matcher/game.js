'use strict';

// === Configuration ===
const CONFIG = {
    moveSpeed: 3, // pixels per frame
    spawnInterval: 800, // milliseconds
    hitZoneMargin: 50, // pixels from target zone
    directions: ['left', 'up', 'down', 'right'],
    arrows: ['←', '↑', '↓', '→'],
    perfectScore: 100,
    goodScore: 50,
    comboMultiplier: 1.2
};

// === State Management ===
let gameState = {
    score: 0,
    combo: 0,
    maxCombo: 0,
    isPlaying: false,
    moves: [],
    animationFrameId: null,
    spawnIntervalId: null,
    gameAreaHeight: 0
};

// === DOM References ===
const elements = {
    gameArea: document.getElementById('gameArea'),
    lanes: document.querySelectorAll('.lane'),
    targetArrows: document.querySelectorAll('.target-arrow'),
    scoreDisplay: document.getElementById('score'),
    comboDisplay: document.getElementById('combo'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    maxCombo: document.getElementById('maxCombo'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playHitSound() {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
}

function playMissSound() {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
}

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
    gameState.gameAreaHeight = elements.gameArea.clientHeight;
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', restartGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        restartGame();
    });

    // Add tap listeners to target arrows
    elements.targetArrows.forEach((arrow, index) => {
        arrow.addEventListener('click', () => handleArrowTap(index));
        arrow.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleArrowTap(index);
        });
    });
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.isPlaying = true;
    gameState.moves = [];

    updateScore();
    updateCombo();

    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';

    // Clear any existing arrows
    elements.lanes.forEach(lane => {
        lane.innerHTML = '';
    });

    // Start spawning moves
    spawnMove();
    gameState.spawnIntervalId = setInterval(spawnMove, CONFIG.spawnInterval);

    // Start game loop
    gameState.animationFrameId = requestAnimationFrame(gameLoop);

    // End game after 60 seconds
    setTimeout(() => {
        if (gameState.isPlaying) {
            endGame();
        }
    }, 60000);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function endGame() {
    gameState.isPlaying = false;

    // Stop spawning moves
    clearInterval(gameState.spawnIntervalId);

    // Stop animation loop
    cancelAnimationFrame(gameState.animationFrameId);

    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.maxCombo.textContent = gameState.maxCombo;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Game Loop ===
function gameLoop() {
    if (!gameState.isPlaying) return;

    updateMoves();
    checkMissedMoves();

    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function updateMoves() {
    gameState.moves.forEach(move => {
        if (!move.hit) {
            move.position += CONFIG.moveSpeed;
            move.element.style.top = move.position + 'px';
        }
    });
}

function checkMissedMoves() {
    const targetY = 20; // Target zone position
    const missThreshold = targetY + 100; // Below target zone

    gameState.moves = gameState.moves.filter(move => {
        if (!move.hit && move.position > missThreshold) {
            // Move was missed
            move.element.remove();
            resetCombo();
            return false;
        }
        return true;
    });
}

// === Move Management ===
function spawnMove() {
    if (!gameState.isPlaying) return;

    const direction = Math.floor(Math.random() * CONFIG.directions.length);
    const lane = elements.lanes[direction];

    // Create move element
    const moveElement = document.createElement('div');
    moveElement.classList.add('move-arrow', CONFIG.directions[direction]);
    moveElement.textContent = CONFIG.arrows[direction];
    moveElement.style.top = '-80px';

    // Create move object
    const move = {
        element: moveElement,
        direction: direction,
        position: -80,
        hit: false
    };

    gameState.moves.push(move);
    lane.appendChild(moveElement);
}

function handleArrowTap(direction) {
    if (!gameState.isPlaying) return;

    const targetY = 20;
    const hitZone = { min: targetY - CONFIG.hitZoneMargin, max: targetY + CONFIG.hitZoneMargin };

    // Find the closest move in this direction within hit zone
    let closestMove = null;
    let closestDistance = Infinity;

    gameState.moves.forEach(move => {
        if (move.direction === direction && !move.hit) {
            const distance = Math.abs(move.position - targetY);
            if (move.position >= hitZone.min && move.position <= hitZone.max && distance < closestDistance) {
                closestMove = move;
                closestDistance = distance;
            }
        }
    });

    if (closestMove) {
        // Hit!
        closestMove.hit = true;
        closestMove.element.classList.add('hit');

        // Visual feedback on target arrow
        elements.targetArrows[direction].classList.add('hit');
        setTimeout(() => {
            elements.targetArrows[direction].classList.remove('hit');
        }, 300);

        // Remove element after animation
        setTimeout(() => {
            if (closestMove.element.parentNode) {
                closestMove.element.parentNode.removeChild(closestMove.element);
            }
        }, 300);

        // Update score and combo
        gameState.combo++;
        updateCombo();

        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }

        const baseScore = closestDistance < 20 ? CONFIG.perfectScore : CONFIG.goodScore;
        const comboBonus = Math.floor(baseScore * (gameState.combo * 0.1));
        gameState.score += baseScore + comboBonus;
        updateScore();

        playHitSound();
    } else {
        // Miss - tapped wrong arrow or no arrow in zone
        resetCombo();
        playMissSound();
    }
}

function resetCombo() {
    gameState.combo = 0;
    updateCombo();
}

// === UI Updates ===
function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateCombo() {
    elements.comboDisplay.textContent = gameState.combo;

    if (gameState.combo > 0) {
        elements.comboDisplay.style.color = '#4CAF50';
        elements.comboDisplay.style.transform = 'scale(1.2)';
    } else {
        elements.comboDisplay.style.color = 'white';
        elements.comboDisplay.style.transform = 'scale(1)';
    }
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
