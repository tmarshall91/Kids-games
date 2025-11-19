'use strict';

// === Configuration ===
const CONFIG = {
    canvas: {
        width: 400,
        height: 600
    },
    paddle: {
        width: 80,
        height: 12,
        speed: 8,
        color: '#4CAF50'
    },
    ball: {
        radius: 8,
        initialSpeed: 4,
        maxSpeed: 10,
        speedIncrease: 0.3,
        color: '#ffffff'
    },
    brick: {
        rows: 6,
        cols: 8,
        width: 45,
        height: 20,
        padding: 5,
        offsetTop: 60,
        offsetLeft: 10,
        colors: ['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD']
    },
    game: {
        initialLives: 3,
        pointsPerBrick: 10
    }
};

// === State Management ===
let gameState = {
    score: 0,
    lives: CONFIG.game.initialLives,
    highScore: 0,
    isPlaying: false,
    isPaused: false,
    animationId: null,
    bricks: [],
    paddle: {
        x: 0,
        y: 0
    },
    ball: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        speed: CONFIG.ball.initialSpeed
    }
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('game-canvas'),
    scoreDisplay: document.getElementById('score'),
    livesDisplay: document.getElementById('lives'),
    highScoreDisplay: document.getElementById('high-score'),
    finalScore: document.getElementById('final-score'),
    winScore: document.getElementById('win-score'),
    welcomeScreen: document.getElementById('welcome-screen'),
    pauseScreen: document.getElementById('pause-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    winScreen: document.getElementById('win-screen'),
    highScoreMessage: document.getElementById('high-score-message'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resumeBtn: document.getElementById('resume-btn'),
    restartBtn: document.getElementById('restart-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    playAgainWinBtn: document.getElementById('play-again-win-btn'),
    touchHint: document.getElementById('touch-hint')
};

const ctx = elements.canvas.getContext('2d');

// === Initialization ===
function initGame() {
    setupCanvas();
    loadHighScore();
    setupEventListeners();
    updateUI();
}

function setupCanvas() {
    // Make canvas responsive
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = elements.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit canvas in container
    const scaleX = containerWidth / CONFIG.canvas.width;
    const scaleY = containerHeight / CONFIG.canvas.height;
    const scale = Math.min(scaleX, scaleY);

    elements.canvas.width = CONFIG.canvas.width;
    elements.canvas.height = CONFIG.canvas.height;
    elements.canvas.style.width = `${CONFIG.canvas.width * scale}px`;
    elements.canvas.style.height = `${CONFIG.canvas.height * scale}px`;
}

function loadHighScore() {
    try {
        const saved = localStorage.getItem('breakout-highscore');
        gameState.highScore = saved ? parseInt(saved, 10) : 0;
    } catch (e) {
        console.log('localStorage not available');
        gameState.highScore = 0;
    }
}

function saveHighScore() {
    try {
        localStorage.setItem('breakout-highscore', gameState.highScore);
    } catch (e) {
        console.log('Could not save high score');
    }
}

// === Game Setup ===
function resetGame() {
    gameState.score = 0;
    gameState.lives = CONFIG.game.initialLives;
    gameState.ball.speed = CONFIG.ball.initialSpeed;

    initBricks();
    initPaddle();
    initBall();

    updateUI();
}

function initBricks() {
    gameState.bricks = [];
    for (let row = 0; row < CONFIG.brick.rows; row++) {
        for (let col = 0; col < CONFIG.brick.cols; col++) {
            gameState.bricks.push({
                x: CONFIG.brick.offsetLeft + col * (CONFIG.brick.width + CONFIG.brick.padding),
                y: CONFIG.brick.offsetTop + row * (CONFIG.brick.height + CONFIG.brick.padding),
                width: CONFIG.brick.width,
                height: CONFIG.brick.height,
                color: CONFIG.brick.colors[row % CONFIG.brick.colors.length],
                visible: true
            });
        }
    }
}

function initPaddle() {
    gameState.paddle.x = (CONFIG.canvas.width - CONFIG.paddle.width) / 2;
    gameState.paddle.y = CONFIG.canvas.height - CONFIG.paddle.height - 20;
}

function initBall() {
    gameState.ball.x = CONFIG.canvas.width / 2;
    gameState.ball.y = gameState.paddle.y - CONFIG.ball.radius - 5;

    // Random angle between 45 and 135 degrees (upward)
    const angle = (Math.random() * 90 + 45) * (Math.PI / 180);
    gameState.ball.dx = Math.cos(angle) * gameState.ball.speed;
    gameState.ball.dy = -Math.sin(angle) * gameState.ball.speed;
}

// === Game Loop ===
function startGame() {
    gameState.isPlaying = true;
    gameState.isPaused = false;

    elements.welcomeScreen.style.display = 'none';
    elements.pauseBtn.style.display = 'block';
    elements.touchHint.style.display = 'block';

    gameLoop();
}

function gameLoop() {
    if (!gameState.isPlaying || gameState.isPaused) return;

    update();
    render();

    gameState.animationId = requestAnimationFrame(gameLoop);
}

function update() {
    // Update ball position
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;

    // Ball collision with walls
    if (gameState.ball.x + CONFIG.ball.radius > CONFIG.canvas.width ||
        gameState.ball.x - CONFIG.ball.radius < 0) {
        gameState.ball.dx = -gameState.ball.dx;
    }

    if (gameState.ball.y - CONFIG.ball.radius < 0) {
        gameState.ball.dy = -gameState.ball.dy;
    }

    // Ball falls below paddle - lose life
    if (gameState.ball.y + CONFIG.ball.radius > CONFIG.canvas.height) {
        loseLife();
        return;
    }

    // Ball collision with paddle
    if (checkPaddleCollision()) {
        handlePaddleCollision();
    }

    // Ball collision with bricks
    checkBrickCollisions();
}

function checkPaddleCollision() {
    return gameState.ball.y + CONFIG.ball.radius > gameState.paddle.y &&
           gameState.ball.y - CONFIG.ball.radius < gameState.paddle.y + CONFIG.paddle.height &&
           gameState.ball.x > gameState.paddle.x &&
           gameState.ball.x < gameState.paddle.x + CONFIG.paddle.width &&
           gameState.ball.dy > 0; // Only when ball is moving down
}

function handlePaddleCollision() {
    // Calculate hit position on paddle (-1 to 1)
    const hitPos = (gameState.ball.x - (gameState.paddle.x + CONFIG.paddle.width / 2)) / (CONFIG.paddle.width / 2);

    // Change ball angle based on hit position
    const angle = hitPos * (Math.PI / 3); // Max 60 degrees from vertical

    gameState.ball.dx = Math.sin(angle) * gameState.ball.speed;
    gameState.ball.dy = -Math.cos(angle) * gameState.ball.speed;

    // Ensure ball is above paddle
    gameState.ball.y = gameState.paddle.y - CONFIG.ball.radius;
}

function checkBrickCollisions() {
    for (let i = 0; i < gameState.bricks.length; i++) {
        const brick = gameState.bricks[i];

        if (!brick.visible) continue;

        if (gameState.ball.x + CONFIG.ball.radius > brick.x &&
            gameState.ball.x - CONFIG.ball.radius < brick.x + brick.width &&
            gameState.ball.y + CONFIG.ball.radius > brick.y &&
            gameState.ball.y - CONFIG.ball.radius < brick.y + brick.height) {

            // Determine which side of brick was hit
            const ballCenterX = gameState.ball.x;
            const ballCenterY = gameState.ball.y;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;

            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;

            // If hit from top or bottom, reverse dy
            if (Math.abs(dy) > Math.abs(dx)) {
                gameState.ball.dy = -gameState.ball.dy;
            } else {
                // Hit from left or right, reverse dx
                gameState.ball.dx = -gameState.ball.dx;
            }

            brick.visible = false;
            updateScore(CONFIG.game.pointsPerBrick);

            // Increase ball speed slightly
            increaseBallSpeed();

            // Check for win condition
            if (checkWinCondition()) {
                winGame();
            }

            break; // Only one brick per frame
        }
    }
}

function increaseBallSpeed() {
    if (gameState.ball.speed < CONFIG.ball.maxSpeed) {
        gameState.ball.speed += CONFIG.ball.speedIncrease;

        // Update ball velocity to maintain direction with new speed
        const angle = Math.atan2(gameState.ball.dy, gameState.ball.dx);
        gameState.ball.dx = Math.cos(angle) * gameState.ball.speed;
        gameState.ball.dy = Math.sin(angle) * gameState.ball.speed;
    }
}

function checkWinCondition() {
    return gameState.bricks.every(brick => !brick.visible);
}

function loseLife() {
    gameState.lives--;
    updateUI();

    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Reset ball and paddle
        initPaddle();
        initBall();
    }
}

function updateScore(points) {
    gameState.score += points;

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore();
    }

    updateUI();
}

// === Rendering ===
function render() {
    // Clear canvas
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    // Draw bricks
    gameState.bricks.forEach(brick => {
        if (brick.visible) {
            drawBrick(brick);
        }
    });

    // Draw paddle
    drawPaddle();

    // Draw ball
    drawBall();
}

function drawBrick(brick) {
    // Draw brick with gradient
    const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
    gradient.addColorStop(0, brick.color);
    gradient.addColorStop(1, shadeColor(brick.color, -20));

    ctx.fillStyle = gradient;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    // Draw border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

    // Draw highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(brick.x, brick.y, brick.width, 4);
}

function drawPaddle() {
    // Draw paddle with gradient
    const gradient = ctx.createLinearGradient(
        gameState.paddle.x,
        gameState.paddle.y,
        gameState.paddle.x,
        gameState.paddle.y + CONFIG.paddle.height
    );
    gradient.addColorStop(0, CONFIG.paddle.color);
    gradient.addColorStop(1, shadeColor(CONFIG.paddle.color, -20));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(
        gameState.paddle.x,
        gameState.paddle.y,
        CONFIG.paddle.width,
        CONFIG.paddle.height,
        6
    );
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawBall() {
    // Draw ball with gradient
    const gradient = ctx.createRadialGradient(
        gameState.ball.x - CONFIG.ball.radius / 3,
        gameState.ball.y - CONFIG.ball.radius / 3,
        0,
        gameState.ball.x,
        gameState.ball.y,
        CONFIG.ball.radius
    );
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#cccccc');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, CONFIG.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fill();
    ctx.shadowBlur = 0;
}

// === Paddle Control ===
function movePaddleTo(x) {
    // Convert screen coordinates to canvas coordinates
    const rect = elements.canvas.getBoundingClientRect();
    const scaleX = CONFIG.canvas.width / rect.width;
    const canvasX = (x - rect.left) * scaleX;

    // Center paddle on touch/mouse position
    gameState.paddle.x = canvasX - CONFIG.paddle.width / 2;

    // Keep paddle within bounds
    gameState.paddle.x = clamp(
        gameState.paddle.x,
        0,
        CONFIG.canvas.width - CONFIG.paddle.width
    );
}

// === Event Handlers ===
function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStart);
    elements.startBtn.addEventListener('touchend', handleStart);

    // Pause button
    elements.pauseBtn.addEventListener('click', pauseGame);
    elements.pauseBtn.addEventListener('touchend', pauseGame);

    // Resume button
    elements.resumeBtn.addEventListener('click', resumeGame);
    elements.resumeBtn.addEventListener('touchend', resumeGame);

    // Restart button
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.restartBtn.addEventListener('touchend', handleRestart);

    // Play again buttons
    elements.playAgainBtn.addEventListener('click', handlePlayAgain);
    elements.playAgainBtn.addEventListener('touchend', handlePlayAgain);
    elements.playAgainWinBtn.addEventListener('click', handlePlayAgain);
    elements.playAgainWinBtn.addEventListener('touchend', handlePlayAgain);

    // Canvas touch/mouse controls
    elements.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.canvas.addEventListener('mousemove', handleMouseMove);
    elements.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    // Prevent context menu on long press
    elements.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent page scrolling during gameplay
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleStart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.isPaused) return;

    const touch = e.touches[0];
    movePaddleTo(touch.clientX);
}

function handleMouseMove(e) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    movePaddleTo(e.clientX);
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.isPaused) return;

    const touch = e.touches[0];
    movePaddleTo(touch.clientX);
}

function pauseGame(e) {
    if (e) e.preventDefault();
    gameState.isPaused = true;
    elements.pauseScreen.style.display = 'flex';
    elements.pauseBtn.style.display = 'none';
}

function resumeGame(e) {
    if (e) e.preventDefault();
    gameState.isPaused = false;
    elements.pauseScreen.style.display = 'none';
    elements.pauseBtn.style.display = 'block';
    gameLoop();
}

function handleRestart(e) {
    if (e) e.preventDefault();
    elements.pauseScreen.style.display = 'none';
    resetGame();
    startGame();
}

function handlePlayAgain(e) {
    if (e) e.preventDefault();
    elements.gameOverScreen.style.display = 'none';
    elements.winScreen.style.display = 'none';
    elements.welcomeScreen.style.display = 'flex';
    gameState.isPlaying = false;
    elements.pauseBtn.style.display = 'none';
}

// === Game State Changes ===
function gameOver() {
    gameState.isPlaying = false;

    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    elements.finalScore.textContent = gameState.score;

    // Check if it's a new high score
    if (gameState.score === gameState.highScore && gameState.score > 0) {
        elements.highScoreMessage.style.display = 'block';
    } else {
        elements.highScoreMessage.style.display = 'none';
    }

    elements.gameOverScreen.style.display = 'flex';
    elements.pauseBtn.style.display = 'none';
    elements.touchHint.style.display = 'none';
}

function winGame() {
    gameState.isPlaying = false;

    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    // Bonus points for remaining lives
    const bonusPoints = gameState.lives * 100;
    updateScore(bonusPoints);

    elements.winScore.textContent = gameState.score;
    elements.winScreen.style.display = 'flex';
    elements.pauseBtn.style.display = 'none';
    elements.touchHint.style.display = 'none';
}

// === UI Updates ===
function updateUI() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.livesDisplay.textContent = gameState.lives;
    elements.highScoreDisplay.textContent = gameState.highScore;
}

// === Utility Functions ===
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function shadeColor(color, percent) {
    // Convert hex to RGB
    const num = parseInt(color.replace('#', ''), 16);
    const r = (num >> 16) + percent;
    const g = ((num >> 8) & 0x00FF) + percent;
    const b = (num & 0x0000FF) + percent;

    // Clamp values
    const newR = Math.min(255, Math.max(0, r));
    const newG = Math.min(255, Math.max(0, g));
    const newB = Math.min(255, Math.max(0, b));

    return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
