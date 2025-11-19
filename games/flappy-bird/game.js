'use strict';

// === Configuration ===
const CONFIG = {
    gravity: 0.6,
    jumpForce: -10,
    birdSize: 30,
    pipeWidth: 60,
    pipeGap: 150,
    pipeSpeed: 3,
    spawnInterval: 90
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    bird: null,
    pipes: [],
    frameCount: 0
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
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load best score from localStorage
    gameState.bestScore = parseInt(localStorage.getItem('flappyBestScore') || '0');
    elements.bestScoreDisplay.textContent = gameState.bestScore;

    // Setup event listeners
    setupEventListeners();

    // Draw initial state
    drawBackground();
    drawBird();
}

function resizeCanvas() {
    const container = elements.gameArea;
    elements.canvas.width = container.clientWidth;
    elements.canvas.height = container.clientHeight;
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

    // Game area tap/click for jump
    elements.canvas.addEventListener('click', jump);
    elements.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jump();
    });

    // Prevent scrolling on touch
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
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function resetGame() {
    gameState.score = 0;
    gameState.frameCount = 0;
    gameState.pipes = [];

    // Initialize bird
    gameState.bird = {
        x: elements.canvas.width / 4,
        y: elements.canvas.height / 2,
        velocity: 0,
        rotation: 0
    };

    updateScore();
}

function jump() {
    if (!gameState.isPlaying) return;
    gameState.bird.velocity = CONFIG.jumpForce;
}

function gameOver() {
    gameState.isPlaying = false;

    // Update best score
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('flappyBestScore', gameState.bestScore.toString());
        elements.bestScoreDisplay.textContent = gameState.bestScore;
    }

    // Show game over overlay
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
    gameState.frameCount++;

    // Update bird
    updateBird();

    // Spawn pipes
    if (gameState.frameCount % CONFIG.spawnInterval === 0) {
        spawnPipe();
    }

    // Update pipes
    updatePipes();

    // Check collisions
    checkCollisions();
}

function updateBird() {
    const bird = gameState.bird;

    // Apply gravity
    bird.velocity += CONFIG.gravity;
    bird.y += bird.velocity;

    // Update rotation based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90);

    // Check bounds
    if (bird.y + CONFIG.birdSize / 2 > elements.canvas.height) {
        gameOver();
    }
    if (bird.y - CONFIG.birdSize / 2 < 0) {
        bird.y = CONFIG.birdSize / 2;
        bird.velocity = 0;
    }
}

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = elements.canvas.height - CONFIG.pipeGap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    gameState.pipes.push({
        x: elements.canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + CONFIG.pipeGap,
        scored: false
    });
}

function updatePipes() {
    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        const pipe = gameState.pipes[i];
        pipe.x -= CONFIG.pipeSpeed;

        // Score point when bird passes pipe
        if (!pipe.scored && pipe.x + CONFIG.pipeWidth < gameState.bird.x) {
            pipe.scored = true;
            gameState.score++;
            updateScore();
        }

        // Remove off-screen pipes
        if (pipe.x + CONFIG.pipeWidth < 0) {
            gameState.pipes.splice(i, 1);
        }
    }
}

function checkCollisions() {
    const bird = gameState.bird;
    const birdLeft = bird.x - CONFIG.birdSize / 2;
    const birdRight = bird.x + CONFIG.birdSize / 2;
    const birdTop = bird.y - CONFIG.birdSize / 2;
    const birdBottom = bird.y + CONFIG.birdSize / 2;

    for (const pipe of gameState.pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + CONFIG.pipeWidth;

        // Check if bird is in pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check collision with top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                gameOver();
                return;
            }
        }
    }
}

function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

// === Drawing ===
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Draw background
    drawBackground();

    // Draw pipes
    drawPipes();

    // Draw bird
    drawBird();
}

function drawBackground() {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Clouds (simple decorations)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
        const x = (gameState.frameCount * 0.5 + i * 150) % (elements.canvas.width + 100);
        drawCloud(x, 50 + i * 50);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawBird() {
    const bird = gameState.bird;

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate((bird.rotation * Math.PI) / 180);

    // Bird body
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.birdSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Bird wing
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-5, 0, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.moveTo(CONFIG.birdSize / 2, 0);
    ctx.lineTo(CONFIG.birdSize / 2 + 10, -3);
    ctx.lineTo(CONFIG.birdSize / 2 + 10, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawPipes() {
    ctx.fillStyle = '#6BCF7F';
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;

    for (const pipe of gameState.pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, CONFIG.pipeWidth, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, CONFIG.pipeWidth, pipe.topHeight);

        // Top pipe cap
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, CONFIG.pipeWidth + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, CONFIG.pipeWidth + 10, 20);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, CONFIG.pipeWidth, elements.canvas.height - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, CONFIG.pipeWidth, elements.canvas.height - pipe.bottomY);

        // Bottom pipe cap
        ctx.fillRect(pipe.x - 5, pipe.bottomY, CONFIG.pipeWidth + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.bottomY, CONFIG.pipeWidth + 10, 20);
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
