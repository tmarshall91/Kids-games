'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 20,           // Size of each grid cell in pixels
    initialSpeed: 150,      // Initial game speed (ms per move)
    speedIncrease: 5,       // Speed increase per food eaten
    minSpeed: 50,           // Minimum speed (maximum difficulty)
    initialLength: 3        // Initial snake length
};

// === State Management ===
let gameState = {
    snake: [],              // Array of {x, y} positions
    direction: { x: 1, y: 0 }, // Current direction
    nextDirection: { x: 1, y: 0 }, // Next direction (for input buffering)
    food: { x: 0, y: 0 },   // Food position
    score: 0,               // Current score
    bestScore: 0,           // High score from localStorage
    isPlaying: false,       // Game running state
    speed: CONFIG.initialSpeed,
    lastMoveTime: 0,        // Timestamp of last move
    gridWidth: 0,           // Grid width in cells
    gridHeight: 0           // Grid height in cells
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    ctx: null,
    scoreDisplay: document.getElementById('score'),
    bestScoreDisplay: document.getElementById('bestScore'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    finalScore: document.getElementById('finalScore'),
    finalBest: document.getElementById('finalBest'),
    controlsOverlay: document.querySelector('.controls-overlay'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn')
};

// === Initialization ===
function initGame() {
    elements.ctx = elements.canvas.getContext('2d');

    // Load high score from localStorage
    loadHighScore();

    // Setup canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup event listeners
    setupEventListeners();

    // Initial render
    renderGame();
}

function resizeCanvas() {
    const gameArea = document.getElementById('gameArea');
    const maxWidth = gameArea.clientWidth - 40;
    const maxHeight = gameArea.clientHeight - 40;

    // Calculate grid dimensions to fit the area
    const cols = Math.floor(maxWidth / CONFIG.gridSize);
    const rows = Math.floor(maxHeight / CONFIG.gridSize);

    // Set canvas size
    elements.canvas.width = cols * CONFIG.gridSize;
    elements.canvas.height = rows * CONFIG.gridSize;

    // Update grid dimensions in game state
    gameState.gridWidth = cols;
    gameState.gridHeight = rows;

    // Re-render if not playing
    if (!gameState.isPlaying) {
        renderGame();
    }
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('snakeHighScore');
        gameState.bestScore = saved ? parseInt(saved, 10) : 0;
        elements.bestScoreDisplay.textContent = gameState.bestScore;
    } catch (e) {
        console.log('localStorage not available');
        gameState.bestScore = 0;
    }
}

function saveHighScore() {
    try {
        localStorage.setItem('snakeHighScore', gameState.bestScore);
    } catch (e) {
        console.log('Could not save high score');
    }
}

// === Event Listeners ===
function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    // Play again button
    elements.playAgainBtn.addEventListener('click', restartGame);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        restartGame();
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Directional buttons
    elements.upBtn.addEventListener('click', () => changeDirection(0, -1));
    elements.upBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection(0, -1);
    });

    elements.downBtn.addEventListener('click', () => changeDirection(0, 1));
    elements.downBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection(0, 1);
    });

    elements.leftBtn.addEventListener('click', () => changeDirection(-1, 0));
    elements.leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection(-1, 0);
    });

    elements.rightBtn.addEventListener('click', () => changeDirection(1, 0));
    elements.rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection(1, 0);
    });

    // Swipe controls
    setupSwipeControls();

    // Prevent page scrolling during gameplay
    document.addEventListener('touchmove', (e) => {
        if (gameState.isPlaying && e.target.closest('.game-container')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleKeyPress(e) {
    if (!gameState.isPlaying) return;

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            changeDirection(1, 0);
            break;
    }
}

function setupSwipeControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30;

    elements.canvas.addEventListener('touchstart', (e) => {
        if (!gameState.isPlaying) return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    });

    elements.canvas.addEventListener('touchend', (e) => {
        if (!gameState.isPlaying) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                changeDirection(deltaX > 0 ? 1 : -1, 0);
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                changeDirection(0, deltaY > 0 ? 1 : -1);
            }
        }
    });
}

// === Game Logic ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.controlsOverlay.classList.add('active');
    gameState.lastMoveTime = Date.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    // Initialize snake in the middle
    const startX = Math.floor(gameState.gridWidth / 2);
    const startY = Math.floor(gameState.gridHeight / 2);

    gameState.snake = [];
    for (let i = 0; i < CONFIG.initialLength; i++) {
        gameState.snake.push({ x: startX - i, y: startY });
    }

    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.speed = CONFIG.initialSpeed;
    updateScore();

    spawnFood();
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function changeDirection(x, y) {
    // Prevent reversing into self
    if (x === -gameState.direction.x && y === -gameState.direction.y) {
        return;
    }

    // Buffer the next direction
    gameState.nextDirection = { x, y };
}

function spawnFood() {
    let validPosition = false;

    while (!validPosition) {
        gameState.food = {
            x: Math.floor(Math.random() * gameState.gridWidth),
            y: Math.floor(Math.random() * gameState.gridHeight)
        };

        // Check if food spawned on snake
        validPosition = !gameState.snake.some(segment =>
            segment.x === gameState.food.x && segment.y === gameState.food.y
        );
    }
}

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const elapsed = timestamp - gameState.lastMoveTime;

    if (elapsed >= gameState.speed) {
        gameState.lastMoveTime = timestamp;
        update();
        renderGame();
    }

    requestAnimationFrame(gameLoop);
}

function update() {
    // Update direction from buffered input
    gameState.direction = { ...gameState.nextDirection };

    // Calculate new head position
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= gameState.gridWidth ||
        newHead.y < 0 || newHead.y >= gameState.gridHeight) {
        gameOver();
        return;
    }

    // Check self collision
    if (gameState.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }

    // Add new head
    gameState.snake.unshift(newHead);

    // Check food collision
    if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        // Snake grows (don't remove tail)
        gameState.score++;
        updateScore();

        // Increase speed
        gameState.speed = Math.max(
            CONFIG.minSpeed,
            gameState.speed - CONFIG.speedIncrease
        );

        spawnFood();
    } else {
        // Remove tail (snake doesn't grow)
        gameState.snake.pop();
    }
}

function updateScore() {
    gameState.score = gameState.snake.length - CONFIG.initialLength;
    elements.scoreDisplay.textContent = gameState.score;

    // Update high score
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        elements.bestScoreDisplay.textContent = gameState.bestScore;
        saveHighScore();
    }
}

function gameOver() {
    gameState.isPlaying = false;
    elements.controlsOverlay.classList.remove('active');

    // Show game over overlay
    elements.finalScore.textContent = gameState.score;
    elements.finalBest.textContent = gameState.bestScore;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Rendering ===
function renderGame() {
    const ctx = elements.ctx;
    const canvas = elements.canvas;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    for (let x = 0; x <= gameState.gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CONFIG.gridSize, 0);
        ctx.lineTo(x * CONFIG.gridSize, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= gameState.gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CONFIG.gridSize);
        ctx.lineTo(canvas.width, y * CONFIG.gridSize);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * CONFIG.gridSize + CONFIG.gridSize / 2,
        gameState.food.y * CONFIG.gridSize + CONFIG.gridSize / 2,
        CONFIG.gridSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    gameState.snake.forEach((segment, index) => {
        const isHead = index === 0;

        // Gradient from head to tail
        const brightness = 1 - (index / gameState.snake.length) * 0.3;
        const green = Math.floor(197 * brightness);
        const lightGreen = Math.floor(222 * brightness);

        if (isHead) {
            // Head is brighter green
            ctx.fillStyle = '#4ade80';
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 15;
        } else {
            ctx.fillStyle = `rgb(74, ${lightGreen}, 128)`;
            ctx.shadowBlur = 0;
        }

        // Draw segment with rounded corners
        const x = segment.x * CONFIG.gridSize;
        const y = segment.y * CONFIG.gridSize;
        const size = CONFIG.gridSize - 2;
        const radius = 4;

        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, size, size, radius);
        ctx.fill();

        // Draw eyes on head
        if (isHead) {
            ctx.fillStyle = '#1a1a2e';
            ctx.shadowBlur = 0;

            const eyeSize = 3;
            const eyeOffset = CONFIG.gridSize / 3;

            if (gameState.direction.x !== 0) {
                // Moving horizontally - eyes on top
                const eyeY = y + eyeOffset;
                ctx.beginPath();
                ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + CONFIG.gridSize - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Moving vertically - eyes on side
                const eyeX = x + eyeOffset;
                ctx.beginPath();
                ctx.arc(eyeX, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX, y + CONFIG.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.shadowBlur = 0;
}

// === Utility Functions ===
// Canvas roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
    };
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
