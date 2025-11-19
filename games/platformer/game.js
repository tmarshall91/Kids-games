'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gravity: 0.5,
    playerSpeed: 5,
    jumpStrength: 12,
    maxFallSpeed: 15,
};

// ==========================================
// CANVAS SETUP
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = document.getElementById('gameArea');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==========================================
// LEVEL DEFINITIONS
// ==========================================

const LEVELS = [
    {
        name: "Level 1",
        platforms: [
            { x: 0, y: 350, width: 200, height: 20 },
            { x: 250, y: 300, width: 150, height: 20 },
            { x: 450, y: 250, width: 150, height: 20 },
            { x: 650, y: 200, width: 200, height: 20 },
            { x: 0, y: 380, width: canvas.width, height: 20 }, // Ground
        ],
        stars: [
            { x: 100, y: 300, collected: false },
            { x: 320, y: 250, collected: false },
            { x: 520, y: 200, collected: false },
            { x: 720, y: 150, collected: false },
        ],
        flag: { x: 750, y: 140 },
        startPos: { x: 50, y: 300 }
    },
    {
        name: "Level 2",
        platforms: [
            { x: 0, y: 350, width: 150, height: 20 },
            { x: 200, y: 320, width: 100, height: 20 },
            { x: 350, y: 280, width: 100, height: 20 },
            { x: 500, y: 240, width: 100, height: 20 },
            { x: 650, y: 200, width: 100, height: 20 },
            { x: 600, y: 320, width: 150, height: 20 },
            { x: 0, y: 380, width: canvas.width, height: 20 }, // Ground
        ],
        stars: [
            { x: 75, y: 300, collected: false },
            { x: 240, y: 270, collected: false },
            { x: 390, y: 230, collected: false },
            { x: 540, y: 190, collected: false },
            { x: 690, y: 150, collected: false },
        ],
        flag: { x: 680, y: 140 },
        startPos: { x: 50, y: 300 }
    },
    {
        name: "Level 3",
        platforms: [
            { x: 0, y: 350, width: 120, height: 20 },
            { x: 150, y: 300, width: 80, height: 20 },
            { x: 270, y: 250, width: 80, height: 20 },
            { x: 390, y: 200, width: 80, height: 20 },
            { x: 510, y: 250, width: 80, height: 20 },
            { x: 630, y: 200, width: 100, height: 20 },
            { x: 300, y: 320, width: 200, height: 20 },
            { x: 0, y: 380, width: canvas.width, height: 20 }, // Ground
        ],
        stars: [
            { x: 60, y: 300, collected: false },
            { x: 180, y: 250, collected: false },
            { x: 310, y: 200, collected: false },
            { x: 420, y: 150, collected: false },
            { x: 550, y: 200, collected: false },
            { x: 670, y: 150, collected: false },
        ],
        flag: { x: 680, y: 140 },
        startPos: { x: 50, y: 300 }
    }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    lives: 3,
    currentLevel: 0,
    isPlaying: false,
    isPaused: false,
};

// ==========================================
// PLAYER OBJECT
// ==========================================

let player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    onGround: false,
    color: '#FF6B6B',
};

// ==========================================
// INPUT HANDLING
// ==========================================

const keys = {
    left: false,
    right: false,
    jump: false,
};

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.jump = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keys.jump = false;
    }
});

// Touch controls for mobile
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

function handleTouchStart(key) {
    return (e) => {
        e.preventDefault();
        keys[key] = true;
    };
}

function handleTouchEnd(key) {
    return (e) => {
        e.preventDefault();
        keys[key] = false;
    };
}

leftBtn.addEventListener('touchstart', handleTouchStart('left'));
leftBtn.addEventListener('touchend', handleTouchEnd('left'));
leftBtn.addEventListener('mousedown', handleTouchStart('left'));
leftBtn.addEventListener('mouseup', handleTouchEnd('left'));

rightBtn.addEventListener('touchstart', handleTouchStart('right'));
rightBtn.addEventListener('touchend', handleTouchEnd('right'));
rightBtn.addEventListener('mousedown', handleTouchStart('right'));
rightBtn.addEventListener('mouseup', handleTouchEnd('right'));

jumpBtn.addEventListener('touchstart', handleTouchStart('jump'));
jumpBtn.addEventListener('touchend', handleTouchEnd('jump'));
jumpBtn.addEventListener('mousedown', handleTouchStart('jump'));
jumpBtn.addEventListener('mouseup', handleTouchEnd('jump'));

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    scoreDisplay: document.getElementById('score'),
    levelDisplay: document.getElementById('level'),
    livesDisplay: document.getElementById('lives'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalLevelDisplay: document.getElementById('finalLevel'),
    levelScoreDisplay: document.getElementById('levelScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    levelCompleteOverlay: document.getElementById('levelCompleteOverlay'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Platformer game initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    elements.nextLevelBtn.addEventListener('touchstart', handleNextLevel);
    elements.nextLevelBtn.addEventListener('click', handleNextLevel);
}

// ==========================================
// LEVEL MANAGEMENT
// ==========================================

function getCurrentLevel() {
    return LEVELS[gameState.currentLevel];
}

function loadLevel() {
    const level = getCurrentLevel();
    player.x = level.startPos.x;
    player.y = level.startPos.y;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.onGround = false;

    // Reset star collection
    level.stars.forEach(star => star.collected = false);

    updateLevelDisplay();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    updateGame();
    renderGame();

    requestAnimationFrame(gameLoop);
}

function updateGame() {
    const level = getCurrentLevel();

    // Apply horizontal movement
    player.velocityX = 0;
    if (keys.left) {
        player.velocityX = -CONFIG.playerSpeed;
    }
    if (keys.right) {
        player.velocityX = CONFIG.playerSpeed;
    }

    // Apply gravity
    player.velocityY += CONFIG.gravity;
    if (player.velocityY > CONFIG.maxFallSpeed) {
        player.velocityY = CONFIG.maxFallSpeed;
    }

    // Jump
    if (keys.jump && player.onGround && !player.isJumping) {
        player.velocityY = -CONFIG.jumpStrength;
        player.isJumping = true;
        player.onGround = false;
    }

    if (!keys.jump) {
        player.isJumping = false;
    }

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Keep player in bounds (horizontal)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Platform collision
    player.onGround = false;
    level.platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Coming from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Coming from below
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Coming from sides
            else {
                if (player.velocityX > 0) {
                    player.x = platform.x - player.width;
                } else if (player.velocityX < 0) {
                    player.x = platform.x + platform.width;
                }
            }
        }
    });

    // Star collection
    level.stars.forEach(star => {
        if (!star.collected && checkStarCollision(player, star)) {
            star.collected = true;
            gameState.score += 10;
            updateScoreDisplay();
        }
    });

    // Flag (level complete) collision
    if (checkFlagCollision(player, level.flag)) {
        levelComplete();
    }

    // Fall off the map
    if (player.y > canvas.height) {
        loseLife();
    }
}

function renderGame() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const level = getCurrentLevel();

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    level.platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Add grass on top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y - 3, platform.width, 3);
        ctx.fillStyle = '#8B4513';
    });

    // Draw stars
    level.stars.forEach(star => {
        if (!star.collected) {
            drawStar(star.x, star.y, 12, '#FFD700');
        }
    });

    // Draw flag
    drawFlag(level.flag.x, level.flag.y);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw player eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 8, player.y + 8, 6, 6);
    ctx.fillRect(player.x + 16, player.y + 8, 6, 6);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 10, player.y + 10, 3, 3);
    ctx.fillRect(player.x + 18, player.y + 10, 3, 3);
}

// ==========================================
// DRAWING HELPERS
// ==========================================

function drawStar(x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFB900';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x1 = x + size * Math.cos(angle);
        const y1 = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawFlag(x, y) {
    // Flag pole
    ctx.fillStyle = '#654321';
    ctx.fillRect(x, y, 4, 60);

    // Flag
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 34, y + 10);
    ctx.lineTo(x + 4, y + 20);
    ctx.closePath();
    ctx.fill();

    // Flag pattern
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x + 8, y + 5, 8, 8);
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function checkStarCollision(player, star) {
    const starSize = 12;
    return player.x < star.x + starSize &&
           player.x + player.width > star.x - starSize &&
           player.y < star.y + starSize &&
           player.y + player.height > star.y - starSize;
}

function checkFlagCollision(player, flag) {
    return player.x < flag.x + 34 &&
           player.x + player.width > flag.x &&
           player.y < flag.y + 60 &&
           player.y + player.height > flag.y;
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    loadLevel();
    updateScoreDisplay();
    updateLevelDisplay();
    updateLivesDisplay();

    requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalLevelDisplay.textContent = gameState.currentLevel + 1;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function levelComplete() {
    gameState.isPlaying = false;

    elements.levelScoreDisplay.textContent = gameState.score;
    elements.levelCompleteOverlay.style.display = 'flex';

    console.log('Level complete!');
}

function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentLevel = 0;
    gameState.isPlaying = false;

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.levelCompleteOverlay.style.display = 'none';

    updateScoreDisplay();
    updateLevelDisplay();
    updateLivesDisplay();

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log('Game reset');
}

function loseLife() {
    gameState.lives--;
    updateLivesDisplay();

    if (gameState.lives <= 0) {
        endGame();
    } else {
        // Restart current level
        loadLevel();
    }
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

function handleNextLevel(e) {
    e.preventDefault();
    elements.levelCompleteOverlay.style.display = 'none';

    gameState.currentLevel++;

    if (gameState.currentLevel >= LEVELS.length) {
        // Game completed!
        alert('Congratulations! You completed all levels! Final Score: ' + gameState.score);
        resetGame();
    } else {
        gameState.isPlaying = true;
        loadLevel();
        requestAnimationFrame(gameLoop);
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateLevelDisplay() {
    elements.levelDisplay.textContent = gameState.currentLevel + 1;
}

function updateLivesDisplay() {
    elements.livesDisplay.textContent = gameState.lives;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
