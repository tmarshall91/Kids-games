'use strict';

// === Configuration ===
const CONFIG = {
    gravity: 0.5,
    jumpForce: -12,
    playerSize: 40,
    platformWidth: 80,
    platformHeight: 15,
    platformCount: 8,
    moveSpeed: 8
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    player: null,
    platforms: [],
    cameraY: 0,
    touchX: null
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

    gameState.bestScore = parseInt(localStorage.getItem('doodleBestScore') || '0');
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

    // Touch controls
    elements.canvas.addEventListener('touchstart', handleTouchStart);
    elements.canvas.addEventListener('touchmove', handleTouchMove);
    elements.canvas.addEventListener('touchend', handleTouchEnd);

    // Mouse controls for desktop
    elements.canvas.addEventListener('mousedown', (e) => {
        gameState.touchX = e.clientX;
    });
    elements.canvas.addEventListener('mousemove', (e) => {
        if (gameState.touchX !== null && gameState.isPlaying) {
            const rect = elements.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < elements.canvas.width / 2) {
                gameState.player.vx = -CONFIG.moveSpeed;
            } else {
                gameState.player.vx = CONFIG.moveSpeed;
            }
        }
    });
    elements.canvas.addEventListener('mouseup', () => {
        gameState.touchX = null;
        if (gameState.player) gameState.player.vx = 0;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    gameState.touchX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.touchX === null) return;

    const rect = elements.canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;

    if (x < elements.canvas.width / 2) {
        gameState.player.vx = -CONFIG.moveSpeed;
    } else {
        gameState.player.vx = CONFIG.moveSpeed;
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    gameState.touchX = null;
    if (gameState.player) gameState.player.vx = 0;
}

// === Game Control ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function resetGame() {
    gameState.score = 0;
    gameState.cameraY = 0;
    gameState.touchX = null;

    gameState.player = {
        x: elements.canvas.width / 2,
        y: elements.canvas.height - 200,
        vx: 0,
        vy: 0,
        width: CONFIG.playerSize,
        height: CONFIG.playerSize
    };

    gameState.platforms = [];

    // Create initial platforms
    for (let i = 0; i < CONFIG.platformCount; i++) {
        const y = elements.canvas.height - i * 80 - 50;
        gameState.platforms.push({
            x: Math.random() * (elements.canvas.width - CONFIG.platformWidth),
            y: y,
            width: CONFIG.platformWidth,
            height: CONFIG.platformHeight
        });
    }

    updateScore();
}

function gameOver() {
    gameState.isPlaying = false;

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('doodleBestScore', gameState.bestScore.toString());
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
    const player = gameState.player;

    // Apply gravity
    player.vy += CONFIG.gravity;
    player.y += player.vy;
    player.x += player.vx;

    // Wrap around screen edges
    if (player.x < -player.width) {
        player.x = elements.canvas.width;
    } else if (player.x > elements.canvas.width) {
        player.x = -player.width;
    }

    // Check platform collisions (only when falling)
    if (player.vy > 0) {
        for (const platform of gameState.platforms) {
            const platformScreenY = platform.y - gameState.cameraY;

            if (player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platformScreenY &&
                player.y + player.height < platformScreenY + platform.height + 10 &&
                player.vy > 0) {
                player.vy = CONFIG.jumpForce;
            }
        }
    }

    // Update camera to follow player
    if (player.y < elements.canvas.height / 2) {
        const offset = elements.canvas.height / 2 - player.y;
        gameState.cameraY += offset;
        player.y = elements.canvas.height / 2;

        // Update score based on height
        const newScore = Math.floor(gameState.cameraY / 10);
        if (newScore > gameState.score) {
            gameState.score = newScore;
            updateScore();
        }
    }

    // Generate new platforms as we go up
    const topPlatform = gameState.platforms.reduce((highest, p) =>
        p.y < highest.y ? p : highest, gameState.platforms[0]);

    while (topPlatform.y > gameState.cameraY - 100) {
        gameState.platforms.push({
            x: Math.random() * (elements.canvas.width - CONFIG.platformWidth),
            y: topPlatform.y - 80,
            width: CONFIG.platformWidth,
            height: CONFIG.platformHeight
        });
        gameState.platforms.sort((a, b) => a.y - b.y);
    }

    // Remove platforms that are too far below
    gameState.platforms = gameState.platforms.filter(p =>
        p.y < gameState.cameraY + elements.canvas.height + 100
    );

    // Check if player fell off screen
    if (player.y - gameState.cameraY > elements.canvas.height) {
        gameOver();
    }
}

function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

// === Drawing ===
function draw() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    drawBackground();
    drawPlatforms();
    drawPlayer();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
    gradient.addColorStop(0, '#e0f7fa');
    gradient.addColorStop(1, '#b2ebf2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

function drawPlatforms() {
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 2;

    for (const platform of gameState.platforms) {
        const screenY = platform.y - gameState.cameraY;

        // Only draw if on screen
        if (screenY > -50 && screenY < elements.canvas.height + 50) {
            ctx.fillRect(platform.x, screenY, platform.width, platform.height);
            ctx.strokeRect(platform.x, screenY, platform.width, platform.height);
        }
    }
}

function drawPlayer() {
    const player = gameState.player;

    // Player body
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2,
            player.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Player outline
    ctx.strokeStyle = '#C92A2A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 8, player.y + player.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 8, player.y + player.height / 2 - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 8, player.y + player.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 8, player.y + player.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2 + 5, 10, 0, Math.PI);
    ctx.stroke();
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
