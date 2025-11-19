'use strict';

// === Configuration ===
const CONFIG = {
    gravity: 0.8,
    jumpForce: -15,
    playerSize: 40,
    playerX: 100,
    groundHeight: 80,
    obstacleWidth: 30,
    obstacleMinGap: 180,
    obstacleMaxGap: 300,
    baseSpeed: 5,
    speedIncrease: 0.001,
    maxSpeed: 12
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    player: null,
    obstacles: [],
    speed: CONFIG.baseSpeed,
    frameCount: 0,
    nextObstacleDistance: 0
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

    gameState.bestScore = parseInt(localStorage.getItem('runnerBestScore') || '0');
    elements.bestScoreDisplay.textContent = gameState.bestScore;

    setupEventListeners();

    drawBackground();
    drawPlayer(CONFIG.playerX, elements.canvas.height - CONFIG.groundHeight - CONFIG.playerSize);
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

    // Touch/click controls for jump and duck
    elements.canvas.addEventListener('click', handleInput);
    elements.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleInput(e.touches[0]);
    });

    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleInput(e) {
    if (!gameState.isPlaying) return;

    const rect = elements.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midpoint = elements.canvas.height / 2;

    if (y < midpoint) {
        jump();
    } else {
        duck();
    }
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
    gameState.obstacles = [];
    gameState.speed = CONFIG.baseSpeed;
    gameState.nextObstacleDistance = 100;

    const groundY = elements.canvas.height - CONFIG.groundHeight;
    gameState.player = {
        x: CONFIG.playerX,
        y: groundY - CONFIG.playerSize,
        width: CONFIG.playerSize,
        height: CONFIG.playerSize,
        velocity: 0,
        isJumping: false,
        isDucking: false,
        duckTimer: 0
    };

    updateScore();
}

function jump() {
    if (!gameState.player.isJumping && !gameState.player.isDucking) {
        gameState.player.velocity = CONFIG.jumpForce;
        gameState.player.isJumping = true;
    }
}

function duck() {
    if (!gameState.player.isJumping && !gameState.player.isDucking) {
        gameState.player.isDucking = true;
        gameState.player.duckTimer = 20; // Duck for 20 frames
    }
}

function gameOver() {
    gameState.isPlaying = false;

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('runnerBestScore', gameState.bestScore.toString());
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
    gameState.frameCount++;
    gameState.score = Math.floor(gameState.frameCount / 10);
    updateScore();

    // Gradually increase speed
    gameState.speed = Math.min(
        CONFIG.baseSpeed + gameState.frameCount * CONFIG.speedIncrease,
        CONFIG.maxSpeed
    );

    updatePlayer();
    updateObstacles();
    checkCollisions();
}

function updatePlayer() {
    const player = gameState.player;
    const groundY = elements.canvas.height - CONFIG.groundHeight;

    // Handle ducking
    if (player.isDucking) {
        player.duckTimer--;
        if (player.duckTimer <= 0) {
            player.isDucking = false;
        }
    }

    // Apply gravity
    player.velocity += CONFIG.gravity;
    player.y += player.velocity;

    // Ground collision
    const playerGroundY = groundY - (player.isDucking ? CONFIG.playerSize / 2 : CONFIG.playerSize);
    if (player.y >= playerGroundY) {
        player.y = playerGroundY;
        player.velocity = 0;
        player.isJumping = false;
    }
}

function updateObstacles() {
    // Spawn obstacles
    if (gameState.frameCount > gameState.nextObstacleDistance) {
        spawnObstacle();
        const gap = CONFIG.obstacleMinGap + Math.random() * (CONFIG.obstacleMaxGap - CONFIG.obstacleMinGap);
        gameState.nextObstacleDistance = gameState.frameCount + gap / gameState.speed;
    }

    // Move and remove obstacles
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -= gameState.speed;

        if (obstacle.x + obstacle.width < 0) {
            gameState.obstacles.splice(i, 1);
        }
    }
}

function spawnObstacle() {
    const groundY = elements.canvas.height - CONFIG.groundHeight;
    const type = Math.random() < 0.5 ? 'ground' : 'air';

    if (type === 'ground') {
        gameState.obstacles.push({
            x: elements.canvas.width,
            y: groundY - 50,
            width: CONFIG.obstacleWidth,
            height: 50,
            type: 'ground'
        });
    } else {
        gameState.obstacles.push({
            x: elements.canvas.width,
            y: groundY - 120,
            width: CONFIG.obstacleWidth,
            height: 30,
            type: 'air'
        });
    }
}

function checkCollisions() {
    const player = gameState.player;
    const playerHeight = player.isDucking ? CONFIG.playerSize / 2 : CONFIG.playerSize;

    for (const obstacle of gameState.obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + playerHeight > obstacle.y) {
            gameOver();
            return;
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
    drawObstacles();
    drawPlayer();
}

function drawBackground() {
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E8F5E9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Ground
    const groundY = elements.canvas.height - CONFIG.groundHeight;
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, groundY, elements.canvas.width, CONFIG.groundHeight);

    // Ground detail
    ctx.fillStyle = '#6D4C41';
    for (let x = (gameState.frameCount * gameState.speed) % 40; x < elements.canvas.width; x += 40) {
        ctx.fillRect(x, groundY, 20, 5);
    }

    // Moving clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 3; i++) {
        const x = ((gameState.frameCount * 0.3 + i * 200) % (elements.canvas.width + 100)) - 50;
        drawCloud(x, 40 + i * 30);
    }
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.arc(x + 20, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 15, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    const player = gameState.player;
    const height = player.isDucking ? CONFIG.playerSize / 2 : CONFIG.playerSize;

    // Player body
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(player.x, player.y, player.width, height);

    // Player outline
    ctx.strokeStyle = '#C92A2A';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, height);

    // Player eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + player.width - 10, player.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + player.width - 10, player.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacles() {
    for (const obstacle of gameState.obstacles) {
        if (obstacle.type === 'ground') {
            // Cactus-like obstacle
            ctx.fillStyle = '#2E7D32';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.strokeStyle = '#1B5E20';
            ctx.lineWidth = 2;
            ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Spikes
            ctx.fillStyle = '#1B5E20';
            for (let i = 0; i < 3; i++) {
                const spikeX = obstacle.x + i * 10 + 5;
                ctx.beginPath();
                ctx.moveTo(spikeX, obstacle.y + 10);
                ctx.lineTo(spikeX - 5, obstacle.y + 20);
                ctx.lineTo(spikeX + 5, obstacle.y + 20);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            // Flying obstacle (bird)
            ctx.fillStyle = '#424242';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2,
                       obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            const wingOffset = Math.sin(gameState.frameCount * 0.3) * 5;
            ctx.fillStyle = '#616161';
            ctx.beginPath();
            ctx.ellipse(obstacle.x + 5, obstacle.y + obstacle.height / 2 + wingOffset,
                       8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(obstacle.x + obstacle.width - 5, obstacle.y + obstacle.height / 2 - wingOffset,
                       8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
