'use strict';

// === Configuration ===
const CONFIG = {
    paddleWidth: 80,
    paddleHeight: 12,
    paddleSpeed: 8,
    ballSize: 10,
    ballSpeedX: 4,
    ballSpeedY: 4,
    aiSpeed: 3.5,
    winningScore: 5,
    paddleOffset: 20
};

// === State Management ===
let gameState = {
    isPlaying: false,
    playerScore: 0,
    aiScore: 0,
    bestWins: 0,
    ball: null,
    playerPaddle: null,
    aiPaddle: null,
    canvas: null,
    touchX: null
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    startBtn: document.getElementById('startBtn'),
    gameMessage: document.getElementById('gameMessage'),
    playerScoreDisplay: document.getElementById('playerScore'),
    aiScoreDisplay: document.getElementById('aiScore'),
    bestScoreDisplay: document.getElementById('bestScore'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    finalScore: document.getElementById('finalScore'),
    finalBest: document.getElementById('finalBest'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameArea: document.getElementById('gameArea')
};

const ctx = elements.canvas.getContext('2d');

// === Initialization ===
function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load best wins from localStorage
    gameState.bestWins = parseInt(localStorage.getItem('pongBestWins') || '0');
    elements.bestScoreDisplay.textContent = gameState.bestWins;

    setupEventListeners();
    drawInitialState();
}

function resizeCanvas() {
    const container = elements.gameArea;
    elements.canvas.width = container.clientWidth;
    elements.canvas.height = container.clientHeight;
    gameState.canvas = {
        width: elements.canvas.width,
        height: elements.canvas.height
    };
}

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

    // Touch controls - tap left/right side to move paddle
    elements.canvas.addEventListener('touchstart', handleTouch);
    elements.canvas.addEventListener('touchmove', handleTouch);
    elements.canvas.addEventListener('touchend', () => {
        gameState.touchX = null;
    });

    // Mouse controls for desktop
    elements.canvas.addEventListener('mousemove', handleMouse);
    elements.canvas.addEventListener('mouseleave', () => {
        gameState.touchX = null;
    });

    // Prevent scrolling
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleTouch(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const touch = e.touches[0];
    const rect = elements.canvas.getBoundingClientRect();
    gameState.touchX = touch.clientX - rect.left;
}

function handleMouse(e) {
    if (!gameState.isPlaying) return;

    const rect = elements.canvas.getBoundingClientRect();
    gameState.touchX = e.clientX - rect.left;
}

// === Game Control ===
function startGame() {
    resetGame();
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    updateScoreDisplay();
    resetBall();
    resetPaddles();
}

function resetPaddles() {
    const canvasWidth = gameState.canvas.width;
    const canvasHeight = gameState.canvas.height;

    gameState.playerPaddle = {
        x: canvasWidth / 2 - CONFIG.paddleWidth / 2,
        y: canvasHeight - CONFIG.paddleOffset,
        width: CONFIG.paddleWidth,
        height: CONFIG.paddleHeight
    };

    gameState.aiPaddle = {
        x: canvasWidth / 2 - CONFIG.paddleWidth / 2,
        y: CONFIG.paddleOffset,
        width: CONFIG.paddleWidth,
        height: CONFIG.paddleHeight
    };
}

function resetBall() {
    const canvasWidth = gameState.canvas.width;
    const canvasHeight = gameState.canvas.height;

    gameState.ball = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        size: CONFIG.ballSize,
        speedX: CONFIG.ballSpeedX * (Math.random() > 0.5 ? 1 : -1),
        speedY: CONFIG.ballSpeedY * (Math.random() > 0.5 ? 1 : -1)
    };
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function endGame(playerWon) {
    gameState.isPlaying = false;

    if (playerWon) {
        const wins = 1;
        if (wins > gameState.bestWins) {
            gameState.bestWins = wins;
            localStorage.setItem('pongBestWins', gameState.bestWins.toString());
            elements.bestScoreDisplay.textContent = gameState.bestWins;
        }
        elements.gameOverTitle.textContent = 'You Win!';
        elements.gameOverTitle.style.color = '#4CAF50';
    } else {
        elements.gameOverTitle.textContent = 'Game Over!';
        elements.gameOverTitle.style.color = '#FF6B6B';
    }

    elements.finalScore.textContent = `${gameState.aiScore} - ${gameState.playerScore}`;
    elements.finalBest.textContent = gameState.bestWins;
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
    // Update ball position
    gameState.ball.x += gameState.ball.speedX;
    gameState.ball.y += gameState.ball.speedY;

    // Ball collision with left and right walls
    if (gameState.ball.x - gameState.ball.size / 2 <= 0 ||
        gameState.ball.x + gameState.ball.size / 2 >= gameState.canvas.width) {
        gameState.ball.speedX = -gameState.ball.speedX;
    }

    // Ball collision with top wall (AI scores)
    if (gameState.ball.y - gameState.ball.size / 2 <= 0) {
        gameState.playerScore++;
        updateScoreDisplay();
        if (gameState.playerScore >= CONFIG.winningScore) {
            endGame(true);
        } else {
            resetBall();
        }
    }

    // Ball collision with bottom wall (player misses)
    if (gameState.ball.y + gameState.ball.size / 2 >= gameState.canvas.height) {
        gameState.aiScore++;
        updateScoreDisplay();
        if (gameState.aiScore >= CONFIG.winningScore) {
            endGame(false);
        } else {
            resetBall();
        }
    }

    // Ball collision with paddles
    checkPaddleCollision(gameState.playerPaddle);
    checkPaddleCollision(gameState.aiPaddle);

    // Update player paddle position based on touch/mouse
    if (gameState.touchX !== null) {
        let targetX = gameState.touchX - CONFIG.paddleWidth / 2;
        targetX = Math.max(0, Math.min(targetX, gameState.canvas.width - CONFIG.paddleWidth));

        // Smooth movement
        const dx = targetX - gameState.playerPaddle.x;
        gameState.playerPaddle.x += dx * 0.3;
    }

    // Update AI paddle (simple tracking with some delay)
    updateAI();
}

function checkPaddleCollision(paddle) {
    const ball = gameState.ball;

    // Check if ball is in the horizontal range of the paddle
    if (ball.x + ball.size / 2 > paddle.x &&
        ball.x - ball.size / 2 < paddle.x + paddle.width) {

        // Check if ball is hitting the paddle
        if (ball.speedY > 0 &&
            ball.y + ball.size / 2 >= paddle.y &&
            ball.y - ball.size / 2 <= paddle.y + paddle.height) {
            // Bottom paddle hit
            ball.speedY = -ball.speedY;
            ball.y = paddle.y - ball.size / 2;

            // Add some angle based on where the ball hits the paddle
            const hitPos = (ball.x - paddle.x) / paddle.width;
            ball.speedX = (hitPos - 0.5) * 8;
        } else if (ball.speedY < 0 &&
                   ball.y - ball.size / 2 <= paddle.y + paddle.height &&
                   ball.y + ball.size / 2 >= paddle.y) {
            // Top paddle hit
            ball.speedY = -ball.speedY;
            ball.y = paddle.y + paddle.height + ball.size / 2;

            // Add some angle based on where the ball hits the paddle
            const hitPos = (ball.x - paddle.x) / paddle.width;
            ball.speedX = (hitPos - 0.5) * 8;
        }
    }
}

function updateAI() {
    const ai = gameState.aiPaddle;
    const ball = gameState.ball;

    // AI follows the ball with some delay
    const targetX = ball.x - CONFIG.paddleWidth / 2;
    const dx = targetX - ai.x;

    if (Math.abs(dx) > CONFIG.aiSpeed) {
        ai.x += Math.sign(dx) * CONFIG.aiSpeed;
    } else {
        ai.x += dx;
    }

    // Keep AI paddle within bounds
    ai.x = Math.max(0, Math.min(ai.x, gameState.canvas.width - CONFIG.paddleWidth));
}

function updateScoreDisplay() {
    elements.playerScoreDisplay.textContent = gameState.playerScore;
    elements.aiScoreDisplay.textContent = gameState.aiScore;
}

// === Drawing ===
function drawInitialState() {
    const canvasWidth = gameState.canvas.width;
    const canvasHeight = gameState.canvas.height;

    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    const canvasWidth = gameState.canvas.width;
    const canvasHeight = gameState.canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    drawPaddle(gameState.playerPaddle, '#f093fb');
    drawPaddle(gameState.aiPaddle, '#667eea');

    // Draw ball
    drawBall();
}

function drawPaddle(paddle, color) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    const ball = gameState.ball;

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// === Initialize on load ===
window.addEventListener('load', initGame);
