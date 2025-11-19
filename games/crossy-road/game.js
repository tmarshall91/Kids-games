'use strict';

const CONFIG = {
    cellSize: 40,
    playerSize: 35,
    carSpeed: 2,
    logSpeed: 1.5
};

let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    player: null,
    rows: [],
    cameraY: 0
};

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
    controlsOverlay: document.querySelector('.controls-overlay'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn')
};

const ctx = elements.canvas.getContext('2d');

function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    gameState.bestScore = parseInt(localStorage.getItem('crossyBestScore') || '0');
    elements.bestScoreDisplay.textContent = gameState.bestScore;

    setupEventListeners();
    drawBackground();
}

function resizeCanvas() {
    elements.canvas.width = elements.canvas.offsetWidth;
    elements.canvas.height = elements.canvas.offsetHeight;
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', restartGame);

    // Direction buttons
    elements.upBtn.addEventListener('click', () => movePlayer(0, -1));
    elements.downBtn.addEventListener('click', () => movePlayer(0, 1));
    elements.leftBtn.addEventListener('click', () => movePlayer(-1, 0));
    elements.rightBtn.addEventListener('click', () => movePlayer(1, 0));

    // Touch events
    elements.upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(0, -1); });
    elements.downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(0, 1); });
    elements.leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(-1, 0); });
    elements.rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); movePlayer(1, 0); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!gameState.isPlaying) return;
        if (e.key === 'ArrowUp') movePlayer(0, -1);
        if (e.key === 'ArrowDown') movePlayer(0, 1);
        if (e.key === 'ArrowLeft') movePlayer(-1, 0);
        if (e.key === 'ArrowRight') movePlayer(1, 0);
    });
}

function startGame() {
    resetGame();
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    elements.controlsOverlay.classList.add('active');
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

function resetGame() {
    gameState.score = 0;
    gameState.cameraY = 0;
    gameState.player = { x: 4, y: 12 };
    gameState.rows = [];

    for (let i = 0; i < 15; i++) {
        generateRow(i);
    }

    updateScore();
}

function generateRow(rowIndex) {
    const type = Math.random();
    let row;

    if (type < 0.3) {
        // Road with cars
        row = {
            type: 'road',
            items: [],
            speed: (Math.random() < 0.5 ? 1 : -1) * CONFIG.carSpeed
        };
        const carCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < carCount; i++) {
            row.items.push({ x: Math.random() * 10, width: 2 });
        }
    } else if (type < 0.5) {
        // River with logs
        row = {
            type: 'river',
            items: [],
            speed: (Math.random() < 0.5 ? 1 : -1) * CONFIG.logSpeed
        };
        const logCount = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < logCount; i++) {
            row.items.push({ x: Math.random() * 10, width: 2 + Math.random() * 2 });
        }
    } else {
        // Grass (safe)
        row = { type: 'grass', items: [] };
    }

    gameState.rows[rowIndex] = row;
}

function movePlayer(dx, dy) {
    if (!gameState.isPlaying) return;

    gameState.player.x += dx;
    gameState.player.y += dy;

    // Clamp X
    gameState.player.x = Math.max(0, Math.min(9, gameState.player.x));

    // Score for moving forward
    if (dy < 0) {
        gameState.score = Math.max(gameState.score, 12 - gameState.player.y);
        updateScore();

        // Generate new rows
        if (gameState.player.y < 5) {
            gameState.cameraY++;
            gameState.player.y++;
            gameState.rows.shift();
            generateRow(14);
        }
    }

    checkCollision();
}

function checkCollision() {
    const row = gameState.rows[gameState.player.y];
    if (!row) return;

    if (row.type === 'road') {
        for (const car of row.items) {
            if (gameState.player.x >= car.x && gameState.player.x < car.x + car.width) {
                gameOver();
                return;
            }
        }
    } else if (row.type === 'river') {
        let onLog = false;
        for (const log of row.items) {
            if (gameState.player.x >= log.x && gameState.player.x < log.x + log.width) {
                onLog = true;
                gameState.player.x += row.speed * 0.016;
                break;
            }
        }
        if (!onLog) {
            gameOver();
            return;
        }
    }

    // Check bounds after river movement
    if (gameState.player.x < 0 || gameState.player.x > 9) {
        gameOver();
    }
}

function gameOver() {
    gameState.isPlaying = false;
    elements.controlsOverlay.classList.remove('active');

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        localStorage.setItem('crossyBestScore', gameState.bestScore.toString());
        elements.bestScoreDisplay.textContent = gameState.bestScore;
    }

    elements.finalScore.textContent = gameState.score;
    elements.finalBest.textContent = gameState.bestScore;
    elements.gameOverOverlay.style.display = 'flex';
}

function gameLoop() {
    if (!gameState.isPlaying) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    for (const row of gameState.rows) {
        if (row.items) {
            for (const item of row.items) {
                item.x += row.speed * 0.016;
                if (item.x > 12) item.x = -item.width;
                if (item.x < -item.width) item.x = 12;
            }
        }
    }

    checkCollision();
}

function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

function draw() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    const cellSize = elements.canvas.width / 10;

    // Draw rows
    for (let i = 0; i < gameState.rows.length; i++) {
        const row = gameState.rows[i];
        const y = i * cellSize;

        if (row.type === 'grass') {
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(0, y, elements.canvas.width, cellSize);
        } else if (row.type === 'road') {
            ctx.fillStyle = '#555';
            ctx.fillRect(0, y, elements.canvas.width, cellSize);
            ctx.strokeStyle = '#FF0';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, y + cellSize / 2);
            ctx.lineTo(elements.canvas.width, y + cellSize / 2);
            ctx.stroke();

            // Cars
            ctx.fillStyle = '#FF0000';
            for (const car of row.items) {
                ctx.fillRect(car.x * cellSize, y + 5, car.width * cellSize, cellSize - 10);
            }
        } else if (row.type === 'river') {
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(0, y, elements.canvas.width, cellSize);

            // Logs
            ctx.fillStyle = '#8B4513';
            for (const log of row.items) {
                ctx.fillRect(log.x * cellSize, y + 5, log.width * cellSize, cellSize - 10);
            }
        }
    }

    // Draw player
    const playerX = gameState.player.x * cellSize + cellSize / 2;
    const playerY = gameState.player.y * cellSize + cellSize / 2;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(playerX, playerY, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF6347';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawBackground() {
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
}

document.addEventListener('DOMContentLoaded', initGame);
