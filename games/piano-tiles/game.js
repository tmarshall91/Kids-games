'use strict';

// === Configuration ===
const CONFIG = {
    lanes: 4,
    tileHeight: 120,
    initialSpeed: 2,
    speedIncrement: 0.2,
    speedIncreaseInterval: 10, // Increase speed every 10 tiles
    missedTileTimeout: 500 // Time before game over after missing a tile
};

// === State Management ===
let gameState = {
    score: 0,
    speed: CONFIG.initialSpeed,
    isPlaying: false,
    tilesCreated: 0,
    activeTiles: [],
    animationId: null,
    lastTileTime: 0,
    tileInterval: 1000,
    gameOverTriggered: false
};

// === DOM References ===
const elements = {
    gameArea: document.getElementById('gameArea'),
    gameMessage: document.getElementById('gameMessage'),
    pianoLanes: document.getElementById('pianoLanes'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    scoreDisplay: document.getElementById('score'),
    speedDisplay: document.getElementById('speed'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    createPianoLanes();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });
}

function createPianoLanes() {
    elements.pianoLanes.innerHTML = '';
    for (let i = 0; i < CONFIG.lanes; i++) {
        const lane = document.createElement('div');
        lane.className = 'piano-lane';
        lane.dataset.laneIndex = i;

        // Add touch and mouse event listeners
        lane.addEventListener('touchstart', handleLaneTouch);
        lane.addEventListener('mousedown', handleLaneTouch);

        elements.pianoLanes.appendChild(lane);
    }
}

// === Game Loop ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.pianoLanes.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    gameLoop();
}

function resetGame() {
    gameState = {
        score: 0,
        speed: CONFIG.initialSpeed,
        isPlaying: false,
        tilesCreated: 0,
        activeTiles: [],
        animationId: null,
        lastTileTime: 0,
        tileInterval: 1000,
        gameOverTriggered: false
    };

    updateDisplay();

    // Clear all tiles
    const lanes = elements.pianoLanes.querySelectorAll('.piano-lane');
    lanes.forEach(lane => {
        lane.querySelectorAll('.piano-tile').forEach(tile => tile.remove());
    });
}

function gameLoop(timestamp = 0) {
    if (!gameState.isPlaying) return;

    // Create new tile if enough time has passed
    if (timestamp - gameState.lastTileTime > gameState.tileInterval) {
        createTile();
        gameState.lastTileTime = timestamp;
    }

    // Update all active tiles
    updateTiles();

    // Check for missed tiles
    checkMissedTiles();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

function createTile() {
    const laneIndex = Math.floor(Math.random() * CONFIG.lanes);
    const lane = elements.pianoLanes.children[laneIndex];

    const tile = document.createElement('div');
    tile.className = 'piano-tile';
    tile.dataset.laneIndex = laneIndex;
    tile.dataset.tapped = 'false';
    tile.style.top = '0px';

    lane.appendChild(tile);

    gameState.activeTiles.push({
        element: tile,
        lane: laneIndex,
        position: 0,
        tapped: false
    });

    gameState.tilesCreated++;

    // Increase speed periodically
    if (gameState.tilesCreated % CONFIG.speedIncreaseInterval === 0) {
        gameState.speed += CONFIG.speedIncrement;
        updateDisplay();
    }
}

function updateTiles() {
    gameState.activeTiles.forEach(tile => {
        if (!tile.tapped) {
            tile.position += gameState.speed;
            tile.element.style.top = tile.position + 'px';
        }
    });
}

function checkMissedTiles() {
    const laneHeight = elements.pianoLanes.offsetHeight;

    gameState.activeTiles = gameState.activeTiles.filter(tile => {
        const tileBottom = tile.position + CONFIG.tileHeight;

        // If tile passed the bottom without being tapped
        if (!tile.tapped && tileBottom > laneHeight) {
            tile.element.classList.add('missed');
            setTimeout(() => gameOver(), CONFIG.missedTileTimeout);
            return false;
        }

        // Remove tiles that are off screen and tapped
        if (tile.tapped && tileBottom > laneHeight + 100) {
            tile.element.remove();
            return false;
        }

        return true;
    });
}

function handleLaneTouch(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const laneIndex = parseInt(e.currentTarget.dataset.laneIndex);
    const lane = e.currentTarget;

    // Flash the lane
    lane.classList.add('active');
    setTimeout(() => lane.classList.remove('active'), 100);

    // Find the lowest untapped tile in this lane
    let tappedTile = null;
    let lowestPosition = -1;

    gameState.activeTiles.forEach(tile => {
        if (tile.lane === laneIndex && !tile.tapped) {
            if (tile.position > lowestPosition) {
                lowestPosition = tile.position;
                tappedTile = tile;
            }
        }
    });

    if (tappedTile) {
        tappedTile.tapped = true;
        tappedTile.element.classList.add('tapped');
        tappedTile.element.dataset.tapped = 'true';

        gameState.score += 10;
        updateDisplay();

        // Play sound effect (if audio is added later)
        playTileSound();
    } else {
        // Tapped empty lane - game over
        gameOver();
    }
}

function playTileSound() {
    // Placeholder for sound effect
    // Can add Web Audio API here later
}

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.speedDisplay.textContent = gameState.speed.toFixed(1) + 'x';
}

function gameOver() {
    if (gameState.gameOverTriggered) return;
    gameState.gameOverTriggered = true;

    gameState.isPlaying = false;
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    elements.finalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);

// Prevent scrolling
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });
