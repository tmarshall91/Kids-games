'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gravity: 0.5,
    jumpStrength: -10,
    obstacleSpeed: 3,
    obstacleGap: 180,
    obstacleWidth: 60,
    obstacleSpawnInterval: 1800,
    birdSize: 50
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    highScore: 0,
    isPlaying: false,
    bird: {
        x: 80,
        y: 250,
        velocity: 0
    },
    obstacles: [],
    lastObstacleTime: 0
};

let animationFrame = null;

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    highScoreDisplay: document.getElementById('highScore'),
    finalScoreDisplay: document.getElementById('finalScore'),
    highScoreMessage: document.getElementById('highScoreMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameCanvas: document.getElementById('gameCanvas'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameArea: document.getElementById('gameArea'),
    bird: document.getElementById('bird')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Bird Flying Game initialized');

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('birdFlyingHighScore');
    if (savedHighScore) {
        gameState.highScore = parseInt(savedHighScore);
        elements.highScoreDisplay.textContent = gameState.highScore;
    }

    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Game area tap/click to flap
    elements.gameCanvas.addEventListener('touchstart', handleFlap);
    elements.gameCanvas.addEventListener('click', handleFlap);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.bird = {
        x: 80,
        y: 250,
        velocity: 0
    };
    gameState.obstacles = [];
    gameState.lastObstacleTime = Date.now();

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.gameCanvas.style.display = 'block';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();

    // Position bird
    updateBirdPosition();

    // Add clouds
    createClouds();

    // Start game loop
    animationFrame = requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Cancel animation frame
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    // Update high score
    let isNewHighScore = false;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        elements.highScoreDisplay.textContent = gameState.highScore;
        localStorage.setItem('birdFlyingHighScore', gameState.highScore);
        isNewHighScore = true;
    }

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.highScoreMessage.textContent = isNewHighScore ? '🎉 New High Score! 🎉' : `Best: ${gameState.highScore}`;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.obstacles = [];

    // Cancel any running animation
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.gameCanvas.style.display = 'none';
    elements.gameCanvas.innerHTML = '<div id="bird" class="bird">🐦</div>';
    elements.bird = document.getElementById('bird');
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();

    console.log('Game reset');
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
    if (!gameState.isPlaying) return;

    // Update bird physics
    updateBird();

    // Update obstacles
    updateObstacles();

    // Spawn new obstacles
    const now = Date.now();
    if (now - gameState.lastObstacleTime > CONFIG.obstacleSpawnInterval) {
        spawnObstacle();
        gameState.lastObstacleTime = now;
    }

    // Check collisions
    if (checkCollisions()) {
        endGame();
        return;
    }

    // Continue loop
    animationFrame = requestAnimationFrame(gameLoop);
}

// ==========================================
// BIRD FUNCTIONS
// ==========================================

function updateBird() {
    // Apply gravity
    gameState.bird.velocity += CONFIG.gravity;
    gameState.bird.y += gameState.bird.velocity;

    // Check bounds
    const maxY = elements.gameCanvas.clientHeight - CONFIG.birdSize;
    if (gameState.bird.y < 0) {
        gameState.bird.y = 0;
        gameState.bird.velocity = 0;
    }
    if (gameState.bird.y > maxY) {
        gameState.bird.y = maxY;
        endGame();
        return;
    }

    updateBirdPosition();
}

function updateBirdPosition() {
    elements.bird.style.left = gameState.bird.x + 'px';
    elements.bird.style.top = gameState.bird.y + 'px';

    // Rotate bird based on velocity
    const rotation = Math.max(-30, Math.min(30, gameState.bird.velocity * 3));
    elements.bird.style.transform = `rotate(${rotation}deg)`;
}

function handleFlap(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    gameState.bird.velocity = CONFIG.jumpStrength;
}

// ==========================================
// OBSTACLE FUNCTIONS
// ==========================================

function spawnObstacle() {
    const canvasHeight = elements.gameCanvas.clientHeight;
    const minHeight = 80;
    const maxHeight = canvasHeight - CONFIG.obstacleGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    const obstacleTop = document.createElement('div');
    obstacleTop.className = 'obstacle obstacle-top';
    obstacleTop.style.height = topHeight + 'px';
    obstacleTop.style.width = CONFIG.obstacleWidth + 'px';
    obstacleTop.style.left = elements.gameCanvas.clientWidth + 'px';

    const obstacleBottom = document.createElement('div');
    obstacleBottom.className = 'obstacle obstacle-bottom';
    obstacleBottom.style.height = (canvasHeight - topHeight - CONFIG.obstacleGap) + 'px';
    obstacleBottom.style.width = CONFIG.obstacleWidth + 'px';
    obstacleBottom.style.left = elements.gameCanvas.clientWidth + 'px';

    elements.gameCanvas.appendChild(obstacleTop);
    elements.gameCanvas.appendChild(obstacleBottom);

    gameState.obstacles.push({
        x: elements.gameCanvas.clientWidth,
        topHeight: topHeight,
        bottomHeight: canvasHeight - topHeight - CONFIG.obstacleGap,
        topElement: obstacleTop,
        bottomElement: obstacleBottom,
        scored: false
    });
}

function updateObstacles() {
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -= CONFIG.obstacleSpeed;

        // Update positions
        obstacle.topElement.style.left = obstacle.x + 'px';
        obstacle.bottomElement.style.left = obstacle.x + 'px';

        // Check if passed bird (score point)
        if (!obstacle.scored && obstacle.x + CONFIG.obstacleWidth < gameState.bird.x) {
            obstacle.scored = true;
            gameState.score++;
            updateScoreDisplay();
            showScorePoint();

            // Pulse animation
            elements.scoreDisplay.classList.add('pulse');
            setTimeout(() => {
                elements.scoreDisplay.classList.remove('pulse');
            }, 300);
        }

        // Remove if off screen
        if (obstacle.x + CONFIG.obstacleWidth < 0) {
            obstacle.topElement.remove();
            obstacle.bottomElement.remove();
            gameState.obstacles.splice(i, 1);
        }
    }
}

function showScorePoint() {
    const scorePoint = document.createElement('div');
    scorePoint.className = 'score-point';
    scorePoint.textContent = '+1';
    scorePoint.style.left = gameState.bird.x + 'px';
    scorePoint.style.top = gameState.bird.y + 'px';
    elements.gameCanvas.appendChild(scorePoint);

    setTimeout(() => {
        scorePoint.remove();
    }, 1000);
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkCollisions() {
    const birdBox = {
        x: gameState.bird.x + 10,
        y: gameState.bird.y + 10,
        width: CONFIG.birdSize - 20,
        height: CONFIG.birdSize - 20
    };

    for (const obstacle of gameState.obstacles) {
        const obstacleBox = {
            x: obstacle.x,
            width: CONFIG.obstacleWidth
        };

        // Check top obstacle
        if (birdBox.x + birdBox.width > obstacleBox.x &&
            birdBox.x < obstacleBox.x + obstacleBox.width) {
            if (birdBox.y < obstacle.topHeight) {
                return true;
            }
            const bottomY = obstacle.topHeight + CONFIG.obstacleGap;
            if (birdBox.y + birdBox.height > bottomY) {
                return true;
            }
        }
    }

    return false;
}

// ==========================================
// SCENERY
// ==========================================

function createClouds() {
    const clouds = ['☁️', '☁️', '☁️'];
    clouds.forEach((cloud, i) => {
        const cloudEl = document.createElement('div');
        cloudEl.className = 'cloud';
        cloudEl.textContent = cloud;
        cloudEl.style.left = `${30 + i * 35}%`;
        cloudEl.style.top = `${20 + i * 25}%`;
        elements.gameCanvas.appendChild(cloudEl);
    });
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
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
});
