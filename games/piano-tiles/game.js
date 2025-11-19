'use strict';

// === Configuration ===
const CONFIG = {
    initialSpeed: 2, // pixels per frame
    speedIncrease: 0.1, // speed increase per 10 tiles
    tileHeight: 150,
    columns: 4,
    spawnInterval: 1000 // milliseconds between tile spawns
};

// === State Management ===
let gameState = {
    score: 0,
    speed: CONFIG.initialSpeed,
    isPlaying: false,
    tiles: [],
    lastSpawnTime: 0,
    animationFrameId: null,
    spawnIntervalId: null
};

// === DOM References ===
const elements = {
    gameArea: document.getElementById('gameArea'),
    columns: document.querySelectorAll('.column'),
    scoreDisplay: document.getElementById('score'),
    speedDisplay: document.getElementById('speed'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
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

    // Add touch/click listeners to columns
    elements.columns.forEach(column => {
        column.addEventListener('click', handleColumnTap);
        column.addEventListener('touchstart', handleColumnTap);
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
    gameState.speed = CONFIG.initialSpeed;
    gameState.isPlaying = true;
    gameState.tiles = [];

    updateScore();
    updateSpeed();

    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';

    // Clear any existing tiles
    elements.columns.forEach(column => {
        column.innerHTML = '';
    });

    // Start spawning tiles
    spawnTile();
    gameState.spawnIntervalId = setInterval(spawnTile, CONFIG.spawnInterval);

    // Start game loop
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    elements.startBtn.style.display = 'block';
    elements.gameMessage.classList.remove('hidden');
    startGame();
}

function gameOver() {
    gameState.isPlaying = false;

    // Stop spawning tiles
    clearInterval(gameState.spawnIntervalId);

    // Stop animation loop
    cancelAnimationFrame(gameState.animationFrameId);

    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Game Loop ===
function gameLoop() {
    if (!gameState.isPlaying) return;

    updateTiles();
    checkMissedTiles();

    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function updateTiles() {
    gameState.tiles.forEach((tile, index) => {
        if (!tile.tapped) {
            tile.position += gameState.speed;
            tile.element.style.top = tile.position + 'px';
        }
    });
}

function checkMissedTiles() {
    const gameAreaHeight = elements.gameArea.clientHeight;

    gameState.tiles.forEach((tile, index) => {
        if (!tile.tapped && tile.position + CONFIG.tileHeight > gameAreaHeight) {
            // Tile reached bottom without being tapped
            gameOver();
        }
    });
}

// === Tile Management ===
function spawnTile() {
    if (!gameState.isPlaying) return;

    const columnIndex = Math.floor(Math.random() * CONFIG.columns);
    const column = elements.columns[columnIndex];

    // Create tile element
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile');
    tileElement.style.top = '-' + CONFIG.tileHeight + 'px';

    // Create tile object
    const tile = {
        element: tileElement,
        column: columnIndex,
        position: -CONFIG.tileHeight,
        tapped: false
    };

    gameState.tiles.push(tile);
    column.appendChild(tileElement);
}

function handleColumnTap(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const columnIndex = parseInt(e.currentTarget.dataset.column);
    const clickY = e.clientY || e.touches[0].clientY;
    const gameAreaRect = elements.gameArea.getBoundingClientRect();
    const relativeY = clickY - gameAreaRect.top;

    // Find if there's a tile at this position
    let tileHit = false;
    gameState.tiles.forEach((tile, index) => {
        if (tile.column === columnIndex && !tile.tapped) {
            const tileTop = tile.position;
            const tileBottom = tile.position + CONFIG.tileHeight;

            if (relativeY >= tileTop && relativeY <= tileBottom) {
                // Tile was tapped!
                tile.tapped = true;
                tile.element.classList.add('tapped');
                tileHit = true;

                // Remove tile after animation
                setTimeout(() => {
                    if (tile.element.parentNode) {
                        tile.element.parentNode.removeChild(tile.element);
                    }
                    gameState.tiles = gameState.tiles.filter(t => t !== tile);
                }, 300);

                // Update score
                gameState.score++;
                updateScore();

                // Increase speed every 10 tiles
                if (gameState.score % 10 === 0) {
                    gameState.speed += CONFIG.speedIncrease;
                    updateSpeed();
                }
            }
        }
    });

    // If tapped on white area (no tile), game over
    if (!tileHit && gameState.isPlaying) {
        gameOver();
    }
}

// === UI Updates ===
function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateSpeed() {
    const speedMultiplier = (gameState.speed / CONFIG.initialSpeed).toFixed(1);
    elements.speedDisplay.textContent = speedMultiplier + 'x';
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
