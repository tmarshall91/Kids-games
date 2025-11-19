'use strict';

// === Configuration ===
const CONFIG = {
    blockHeight: 30,
    initialWidth: 200,
    moveSpeed: 4,
    perfectThreshold: 10
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    blocks: [],
    currentBlock: null,
    direction: 1,
    gameSpeed: CONFIG.moveSpeed
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    startBtn: document.getElementById('startBtn'),
    gameMessage: document.getElementById('gameMessage'),
    scoreDisplay: document.getElementById('score'),
    bestScoreDisplay: document.getElementById('bestScore'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    finalScore: document.getElementById('finalScore'),
    finalBest: document.getElementById('finalBest'),
    gameArea: document.getElementById('gameArea')
};

const ctx = elements.canvas.getContext('2d');

// === Initialization ===
function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    gameState.bestScore = parseInt(localStorage.getItem('stackBestScore') || '0');
    elements.bestScoreDisplay.textContent = gameState.bestScore;

    setupEventListeners();
    drawBackground();
}

function resizeCanvas() {
    const container = elements.gameArea;
    elements.canvas.width = container.clientWidth;
    elements.canvas.height = container.clientHeight;
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', restartGame);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        restartGame();
    });

    elements.canvas.addEventListener('click', dropBlock);
    elements.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        dropBlock();
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    spawnBlock();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function resetGame() {
    gameState.score = 0;
    gameState.blocks = [];
    gameState.currentBlock = null;
    gameState.direction = 1;
    gameState.gameSpeed = CONFIG.moveSpeed;

    // Add base block
    gameState.blocks.push({
        x: elements.canvas.width / 2 - CONFIG.initialWidth / 2,
        y: elements.canvas.height - CONFIG.blockHeight,
        width: CONFIG.initialWidth,
        height: CONFIG.blockHeight,
        color: getRandomColor()
    });

    updateScore();
}

function spawnBlock() {
    const lastBlock = gameState.blocks[gameState.blocks.length - 1];

    gameState.currentBlock = {
        x: 0,
        y: lastBlock.y - CONFIG.blockHeight,
        width: lastBlock.width,
        height: CONFIG.blockHeight,
        color: getRandomColor()
    };

    gameState.direction = Math.random() < 0.5 ? 1 : -1;
}

function dropBlock() {
    if (!gameState.isPlaying || !gameState.currentBlock) return;

    const current = gameState.currentBlock;
    const last = gameState.blocks[gameState.blocks.length - 1];

    // Calculate overlap
    const leftEdge = Math.max(current.x, last.x);
    const rightEdge = Math.min(current.x + current.width, last.x + last.width);
    const overlap = rightEdge - leftEdge;

    if (overlap <= 0) {
        // No overlap - game over
        gameOver();
        return;
    }

    // Check if perfect drop
    const isPerfect = Math.abs(current.x - last.x) < CONFIG.perfectThreshold;

    if (isPerfect) {
        // Perfect drop - keep same width and bonus
        current.x = last.x;
        current.width = last.width;
    } else {
        // Cut off excess
        current.x = leftEdge;
        current.width = overlap;
    }

    // Add the block
    gameState.blocks.push({ ...current });
    gameState.score++;
    updateScore();

    // Slightly increase speed
    gameState.gameSpeed = Math.min(gameState.gameSpeed + 0.1, 8);

    // Check if block is too small to continue
    if (current.width < 30) {
        gameOver();
        return;
    }

    // Spawn next block
    gameState.currentBlock = null;
    setTimeout(() => {
        if (gameState.isPlaying) {
            spawnBlock();
        }
    }, 200);
}

function gameOver() {
    gameState.isPlaying = false;
    gameState.currentBlock = null;

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('stackBestScore', gameState.bestScore.toString());
        elements.bestScoreDisplay.textContent = gameState.bestScore;
    }

    elements.finalScore.textContent = gameState.score;
    elements.finalBest.textContent = gameState.bestScore;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Game Loop ===
function gameLoop() {
    if (!gameState.isPlaying) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.currentBlock) {
        const current = gameState.currentBlock;
        current.x += gameState.direction * gameState.gameSpeed;

        // Bounce off edges
        if (current.x <= 0) {
            current.x = 0;
            gameState.direction = 1;
        } else if (current.x + current.width >= elements.canvas.width) {
            current.x = elements.canvas.width - current.width;
            gameState.direction = -1;
        }
    }
}

function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

// === Drawing ===
function draw() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    drawBackground();
    drawBlocks();
    drawCurrentBlock();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function drawBlocks() {
    // Draw from bottom up, but only show top 10-15 blocks
    const startIndex = Math.max(0, gameState.blocks.length - 15);

    for (let i = startIndex; i < gameState.blocks.length; i++) {
        const block = gameState.blocks[i];
        const offset = gameState.blocks.length - 15;
        const adjustedY = block.y + (offset > 0 ? offset * CONFIG.blockHeight : 0);

        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, adjustedY, block.width, block.height);

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(block.x, adjustedY, block.width, block.height);
    }
}

function drawCurrentBlock() {
    if (!gameState.currentBlock) return;

    const block = gameState.currentBlock;
    const offset = Math.max(0, gameState.blocks.length - 15);
    const adjustedY = block.y + (offset > 0 ? offset * CONFIG.blockHeight : 0);

    ctx.fillStyle = block.color;
    ctx.fillRect(block.x, adjustedY, block.width, block.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(block.x, adjustedY, block.width, block.height);
}

// === Utility ===
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
