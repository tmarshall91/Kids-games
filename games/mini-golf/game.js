'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    ballRadius: 8,
    holeRadius: 12,
    friction: 0.98,
    maxPower: 15,
    minPower: 0.5,
    wallBounceDamping: 0.7,
};

// ==========================================
// HOLE DEFINITIONS
// ==========================================

const HOLES = [
    {
        name: "Hole 1: The Beginning",
        par: 3,
        ballStart: { x: 50, y: 450 },
        hole: { x: 350, y: 100 },
        obstacles: [
            { type: 'rect', x: 150, y: 250, width: 100, height: 20, color: '#8B4513' },
        ]
    },
    {
        name: "Hole 2: The Windmill ⚡",
        par: 4,
        ballStart: { x: 50, y: 450 },
        hole: { x: 350, y: 100 },
        obstacles: [
            { type: 'rect', x: 180, y: 200, width: 15, height: 80, color: '#8B4513', rotating: true, speed: 0.02 },
            { type: 'rect', x: 180, y: 280, width: 80, height: 15, color: '#8B4513', rotating: true, speed: 0.02, offsetAngle: Math.PI/2 },
        ]
    },
    {
        name: "Hole 3: The Zigzag 〰️",
        par: 4,
        ballStart: { x: 50, y: 450 },
        hole: { x: 350, y: 50 },
        obstacles: [
            { type: 'rect', x: 100, y: 350, width: 150, height: 20, color: '#8B4513' },
            { type: 'rect', x: 200, y: 250, width: 150, height: 20, color: '#8B4513' },
            { type: 'rect', x: 100, y: 150, width: 150, height: 20, color: '#8B4513' },
        ]
    },
    {
        name: "Hole 4: The U-Turn 🔄",
        par: 4,
        ballStart: { x: 50, y: 250 },
        hole: { x: 350, y: 250 },
        obstacles: [
            { type: 'rect', x: 150, y: 100, width: 20, height: 200, color: '#8B4513' },
            { type: 'rect', x: 150, y: 300, width: 150, height: 20, color: '#8B4513' },
            { type: 'rect', x: 280, y: 100, width: 20, height: 200, color: '#8B4513' },
        ]
    },
    {
        name: "Hole 5: The Maze 🌀",
        par: 5,
        ballStart: { x: 50, y: 450 },
        hole: { x: 350, y: 50 },
        obstacles: [
            { type: 'rect', x: 120, y: 380, width: 100, height: 15, color: '#8B4513' },
            { type: 'rect', x: 180, y: 300, width: 15, height: 100, color: '#8B4513' },
            { type: 'rect', x: 180, y: 200, width: 120, height: 15, color: '#8B4513' },
            { type: 'rect', x: 120, y: 120, width: 15, height: 100, color: '#8B4513' },
            { type: 'rect', x: 120, y: 120, width: 100, height: 15, color: '#8B4513' },
        ]
    },
    {
        name: "Hole 6: The Final Challenge 🏆",
        par: 5,
        ballStart: { x: 200, y: 450 },
        hole: { x: 200, y: 50 },
        obstacles: [
            { type: 'circle', x: 200, y: 250, radius: 40, color: '#8B4513' },
            { type: 'rect', x: 100, y: 150, width: 80, height: 15, color: '#8B4513' },
            { type: 'rect', x: 220, y: 150, width: 80, height: 15, color: '#8B4513' },
            { type: 'rect', x: 100, y: 350, width: 80, height: 15, color: '#8B4513' },
            { type: 'rect', x: 220, y: 350, width: 80, height: 15, color: '#8B4513' },
        ]
    }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentHole: 0,
    totalStrokes: 0,
    currentStrokes: 0,
    scores: [],
    isPlaying: false,
    ball: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        isMoving: false
    },
    dragStart: null,
    isDragging: false,
    canvasWidth: 0,
    canvasHeight: 0,
    obstacles: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    nextHoleBtn: document.getElementById('nextHoleBtn'),

    currentHoleDisplay: document.getElementById('currentHole'),
    strokesDisplay: document.getElementById('strokes'),
    parDisplay: document.getElementById('par'),
    holeNameDisplay: document.getElementById('holeName'),
    holeParValueDisplay: document.getElementById('holeParValue'),

    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    holeCompleteMessage: document.getElementById('holeCompleteMessage'),

    canvas: document.getElementById('golfCanvas'),
    powerMeter: document.getElementById('powerMeter'),
    powerFill: document.getElementById('powerFill'),

    finalStrokesDisplay: document.getElementById('finalStrokes'),
    totalParDisplay: document.getElementById('totalPar'),
    scoreDiffDisplay: document.getElementById('scoreDiff'),
    scorecardDisplay: document.getElementById('scorecard'),
    holeCompleteTitle: document.getElementById('holeCompleteTitle'),
    holeCompletePar: document.getElementById('holeCompletePar'),
};

let ctx = null;

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Mini Golf initialized');

    // Setup canvas
    setupCanvas();

    // Setup event listeners
    setupEventListeners();

    // Initial render
    drawWelcomeScreen();
}

function setupCanvas() {
    const canvas = elements.canvas;
    const container = elements.gameArea;

    // Set canvas size to match container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    gameState.canvasWidth = canvas.width;
    gameState.canvasHeight = canvas.height;

    ctx = canvas.getContext('2d');

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        gameState.canvasWidth = canvas.width;
        gameState.canvasHeight = canvas.height;
        if (!gameState.ball.isMoving && gameState.isPlaying) {
            drawGame();
        }
    });
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestartHole);
    elements.restartBtn.addEventListener('click', handleRestartHole);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handlePlayAgain);
    elements.playAgainBtn.addEventListener('click', handlePlayAgain);

    // Next hole button
    elements.nextHoleBtn.addEventListener('touchstart', handleNextHole);
    elements.nextHoleBtn.addEventListener('click', handleNextHole);

    // Canvas drag events
    elements.canvas.addEventListener('mousedown', handleDragStart);
    elements.canvas.addEventListener('mousemove', handleDragMove);
    elements.canvas.addEventListener('mouseup', handleDragEnd);

    elements.canvas.addEventListener('touchstart', handleDragStart);
    elements.canvas.addEventListener('touchmove', handleDragMove);
    elements.canvas.addEventListener('touchend', handleDragEnd);
}

// ==========================================
// GAME LOOP
// ==========================================

let animationFrameId = null;

function gameLoop() {
    if (!gameState.isPlaying) return;

    updateGame();
    drawGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (!gameState.ball.isMoving) return;

    const ball = gameState.ball;

    // Apply velocity
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Apply friction
    ball.vx *= CONFIG.friction;
    ball.vy *= CONFIG.friction;

    // Check wall collisions
    checkWallCollisions();

    // Check obstacle collisions
    checkObstacleCollisions();

    // Stop if velocity is very low
    if (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1) {
        ball.vx = 0;
        ball.vy = 0;
        ball.isMoving = false;

        // Check if ball reached hole
        checkHoleCompletion();
    }
}

function checkWallCollisions() {
    const ball = gameState.ball;
    const margin = 10; // Wall margin

    // Left wall
    if (ball.x - CONFIG.ballRadius < margin) {
        ball.x = margin + CONFIG.ballRadius;
        ball.vx *= -CONFIG.wallBounceDamping;
    }

    // Right wall
    if (ball.x + CONFIG.ballRadius > gameState.canvasWidth - margin) {
        ball.x = gameState.canvasWidth - margin - CONFIG.ballRadius;
        ball.vx *= -CONFIG.wallBounceDamping;
    }

    // Top wall
    if (ball.y - CONFIG.ballRadius < margin) {
        ball.y = margin + CONFIG.ballRadius;
        ball.vy *= -CONFIG.wallBounceDamping;
    }

    // Bottom wall
    if (ball.y + CONFIG.ballRadius > gameState.canvasHeight - margin) {
        ball.y = gameState.canvasHeight - margin - CONFIG.ballRadius;
        ball.vy *= -CONFIG.wallBounceDamping;
    }
}

function checkObstacleCollisions() {
    const ball = gameState.ball;

    gameState.obstacles.forEach(obstacle => {
        if (obstacle.type === 'rect') {
            checkRectCollision(ball, obstacle);
        } else if (obstacle.type === 'circle') {
            checkCircleCollision(ball, obstacle);
        }
    });
}

function checkRectCollision(ball, rect) {
    const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.height));

    const distanceX = ball.x - closestX;
    const distanceY = ball.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < CONFIG.ballRadius) {
        // Collision detected
        const overlap = CONFIG.ballRadius - distance;

        if (distance === 0) {
            // Ball is inside obstacle, push it out
            ball.x += overlap;
            ball.y += overlap;
        } else {
            // Normalize and push ball out
            const nx = distanceX / distance;
            const ny = distanceY / distance;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Bounce
            const dotProduct = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dotProduct * nx;
            ball.vy -= 2 * dotProduct * ny;

            ball.vx *= CONFIG.wallBounceDamping;
            ball.vy *= CONFIG.wallBounceDamping;
        }
    }
}

function checkCircleCollision(ball, circle) {
    const dx = ball.x - circle.x;
    const dy = ball.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = CONFIG.ballRadius + circle.radius;

    if (distance < minDistance) {
        // Collision detected
        const overlap = minDistance - distance;

        if (distance === 0) {
            // Ball is at center, push it out randomly
            ball.x += overlap;
        } else {
            // Normalize and push ball out
            const nx = dx / distance;
            const ny = dy / distance;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Bounce
            const dotProduct = ball.vx * nx + ball.vy * ny;
            ball.vx -= 2 * dotProduct * nx;
            ball.vy -= 2 * dotProduct * ny;

            ball.vx *= CONFIG.wallBounceDamping;
            ball.vy *= CONFIG.wallBounceDamping;
        }
    }
}

function checkHoleCompletion() {
    const hole = HOLES[gameState.currentHole].hole;
    const ball = gameState.ball;

    const dx = ball.x - hole.x;
    const dy = ball.y - hole.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CONFIG.holeRadius) {
        // Hole completed!
        completeHole();
    }
}

// ==========================================
// DRAWING FUNCTIONS
// ==========================================

function drawGame() {
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2d5016'; // Green grass
    ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

    // Draw grass pattern
    drawGrassPattern();

    // Draw walls
    drawWalls();

    // Draw hole
    drawHole();

    // Draw obstacles
    drawObstacles();

    // Draw ball
    drawBall();

    // Draw drag line
    if (gameState.isDragging && gameState.dragStart) {
        drawDragLine();
    }
}

function drawGrassPattern() {
    ctx.fillStyle = 'rgba(61, 88, 33, 0.3)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * gameState.canvasWidth;
        const y = Math.random() * gameState.canvasHeight;
        ctx.fillRect(x, y, 3, 3);
    }
}

function drawWalls() {
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, gameState.canvasWidth - 10, gameState.canvasHeight - 10);
}

function drawHole() {
    const hole = HOLES[gameState.currentHole].hole;

    // Draw hole shadow
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, CONFIG.holeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw flag
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y);
    ctx.lineTo(hole.x, hole.y - 25);
    ctx.stroke();

    // Draw flag triangle
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(hole.x, hole.y - 25);
    ctx.lineTo(hole.x + 15, hole.y - 18);
    ctx.lineTo(hole.x, hole.y - 11);
    ctx.fill();

    // Draw hole emoji
    ctx.font = '20px Arial';
    ctx.fillText('⛳', hole.x - 10, hole.y + 5);
}

function drawObstacles() {
    gameState.obstacles.forEach(obstacle => {
        if (obstacle.type === 'rect') {
            ctx.fillStyle = obstacle.color;
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            // Add texture
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 3);
        } else if (obstacle.type === 'circle') {
            ctx.fillStyle = obstacle.color;
            ctx.beginPath();
            ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
            ctx.fill();

            // Add texture
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(obstacle.x, obstacle.y - obstacle.radius * 0.3, obstacle.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawBall() {
    const ball = gameState.ball;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(ball.x + 2, ball.y + 2, CONFIG.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, CONFIG.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(ball.x - 2, ball.y - 2, CONFIG.ballRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw ball emoji
    ctx.font = '16px Arial';
    ctx.fillText('⚪', ball.x - 8, ball.y + 5);
}

function drawDragLine() {
    const ball = gameState.ball;
    const drag = gameState.dragStart;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(drag.x, drag.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw power indicator
    const dx = drag.x - ball.x;
    const dy = drag.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const power = Math.min(distance / 50, 1);

    elements.powerFill.style.width = (power * 100) + '%';
}

function drawWelcomeScreen() {
    if (!ctx) return;

    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

    ctx.fillStyle = '#fff';
    ctx.font = '30px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillText('⛳ Mini Golf 🏌️', gameState.canvasWidth / 2, gameState.canvasHeight / 2);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.currentHole = 0;
    gameState.totalStrokes = 0;
    gameState.scores = [];

    loadHole();

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    gameLoop();

    console.log('Game started');
}

function loadHole() {
    const hole = HOLES[gameState.currentHole];

    // Reset stroke count for this hole
    gameState.currentStrokes = 0;

    // Load obstacles
    gameState.obstacles = JSON.parse(JSON.stringify(hole.obstacles));

    // Position ball
    gameState.ball.x = hole.ballStart.x;
    gameState.ball.y = hole.ballStart.y;
    gameState.ball.vx = 0;
    gameState.ball.vy = 0;
    gameState.ball.isMoving = false;

    // Update UI
    updateHoleDisplay();

    drawGame();
}

function completeHole() {
    const hole = HOLES[gameState.currentHole];
    const strokes = gameState.currentStrokes;
    const par = hole.par;
    const diff = strokes - par;

    // Save score
    gameState.scores.push({
        hole: gameState.currentHole + 1,
        strokes: strokes,
        par: par,
        diff: diff
    });

    // Show completion message
    let message = '';
    if (diff === -2) message = '🦅 Eagle!';
    else if (diff === -1) message = '🐦 Birdie!';
    else if (diff === 0) message = '✅ Par!';
    else if (diff === 1) message = '👍 Bogey';
    else if (diff === 2) message = '😅 Double Bogey';
    else if (diff > 2) message = '😬 Over Par';

    elements.holeCompleteTitle.textContent = `⛳ Hole ${gameState.currentHole + 1} Complete!`;
    elements.holeCompletePar.textContent = `${message} - ${strokes} strokes (Par ${par})`;
    elements.holeCompleteMessage.style.display = 'block';

    console.log(`Hole ${gameState.currentHole + 1} completed in ${strokes} strokes`);
}

function handleNextHole(e) {
    e.preventDefault();

    elements.holeCompleteMessage.style.display = 'none';

    gameState.currentHole++;

    if (gameState.currentHole >= HOLES.length) {
        // Game complete!
        endGame();
    } else {
        // Load next hole
        loadHole();
    }
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Calculate total par
    const totalPar = HOLES.reduce((sum, hole) => sum + hole.par, 0);
    const diff = gameState.totalStrokes - totalPar;

    // Update final score display
    elements.finalStrokesDisplay.textContent = gameState.totalStrokes;
    elements.totalParDisplay.textContent = totalPar;

    // Score difference
    let diffText = '';
    let diffClass = '';
    if (diff < 0) {
        diffText = `${Math.abs(diff)} Under Par! 🎉`;
        diffClass = 'under-par';
    } else if (diff === 0) {
        diffText = 'Even Par! 👏';
        diffClass = 'even';
    } else {
        diffText = `${diff} Over Par`;
        diffClass = 'over-par';
    }

    elements.scoreDiffDisplay.textContent = diffText;
    elements.scoreDiffDisplay.className = `score-diff ${diffClass}`;

    // Generate scorecard
    let scorecardHTML = '';
    gameState.scores.forEach(score => {
        let resultClass = '';
        if (score.diff === -1) resultClass = 'birdie';
        else if (score.diff === 0) resultClass = 'par';
        else if (score.diff === 1) resultClass = 'bogey';
        else if (score.diff >= 2) resultClass = 'double-bogey';

        scorecardHTML += `
            <div class="scorecard-row">
                <span class="scorecard-hole">Hole ${score.hole}</span>
                <span class="scorecard-result ${resultClass}">${score.strokes} / Par ${score.par}</span>
            </div>
        `;
    });

    elements.scorecardDisplay.innerHTML = scorecardHTML;

    // Show game over overlay
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Total strokes:', gameState.totalStrokes);
}

function handleRestartHole(e) {
    e.preventDefault();
    loadHole();
}

function handlePlayAgain(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

// ==========================================
// DRAG HANDLERS
// ==========================================

function handleDragStart(e) {
    if (!gameState.isPlaying || gameState.ball.isMoving) return;

    e.preventDefault();

    const rect = elements.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    // Check if clicking/touching near ball
    const dx = x - gameState.ball.x;
    const dy = y - gameState.ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CONFIG.ballRadius * 3) {
        gameState.isDragging = true;
        gameState.dragStart = { x, y };
        elements.powerMeter.style.display = 'block';
    }
}

function handleDragMove(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();

    const rect = elements.canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

    gameState.dragStart = { x, y };

    drawGame();
}

function handleDragEnd(e) {
    if (!gameState.isDragging) return;

    e.preventDefault();

    gameState.isDragging = false;
    elements.powerMeter.style.display = 'none';

    const dx = gameState.dragStart.x - gameState.ball.x;
    const dy = gameState.dragStart.y - gameState.ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        // Apply power to ball
        const power = Math.min(distance / 50, 1);
        const angle = Math.atan2(dy, dx);

        const speed = CONFIG.minPower + (CONFIG.maxPower - CONFIG.minPower) * power;

        gameState.ball.vx = -Math.cos(angle) * speed;
        gameState.ball.vy = -Math.sin(angle) * speed;
        gameState.ball.isMoving = true;

        // Increment stroke count
        gameState.currentStrokes++;
        gameState.totalStrokes++;
        updateStrokesDisplay();
    }

    gameState.dragStart = null;
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

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateHoleDisplay() {
    const hole = HOLES[gameState.currentHole];

    elements.currentHoleDisplay.textContent = `${gameState.currentHole + 1}/6`;
    elements.parDisplay.textContent = hole.par;
    elements.holeNameDisplay.textContent = hole.name;
    elements.holeParValueDisplay.textContent = hole.par;
}

function updateStrokesDisplay() {
    elements.strokesDisplay.textContent = gameState.currentStrokes;

    // Add pulse animation
    elements.strokesDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.strokesDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
