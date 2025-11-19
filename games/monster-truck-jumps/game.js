'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    scrollSpeed: 5,
    jumpDuration: 800, // milliseconds
    obstacleSpawnInterval: 2000,
    obstacleTypes: ['🪨', '🌵', '🏔️', '🛢️'],
    rampChance: 0.3, // 30% chance for ramp instead of obstacle
};

const STUNTS = {
    perfect: { name: 'Perfect Jump!', points: 100, emoji: '⭐' },
    good: { name: 'Good Jump!', points: 50, emoji: '👍' },
    regular: { name: 'Jump!', points: 20, emoji: '🚀' },
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    jumps: 0,
    speed: 0,
    isPlaying: false,
    isJumping: false,
    obstacles: [],
    bestStunt: 'Regular Jump',
    distance: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    jumpBtn: document.getElementById('jumpBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    jumpsDisplay: document.getElementById('jumps'),
    speedDisplay: document.getElementById('speed'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalJumpsDisplay: document.getElementById('finalJumps'),
    bestStuntDisplay: document.getElementById('bestStunt'),
    gameMessage: document.getElementById('gameMessage'),
    stuntMessage: document.getElementById('stuntMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    truck: document.getElementById('truck'),
    ground: document.getElementById('ground'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Monster Truck Jumps initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.jumpBtn.addEventListener('touchstart', handleJump);
    elements.jumpBtn.addEventListener('click', handleJump);

    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Allow spacebar for jump on desktop
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.isPlaying && !gameState.isJumping) {
            e.preventDefault();
            performJump();
        }
    });

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

let lastTimestamp = 0;
let spawnTimer = 0;
let animationFrameId = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    updateGame(deltaTime);
    renderGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    // Increase speed gradually
    gameState.speed = Math.min(10, 3 + gameState.distance / 1000);
    gameState.distance += CONFIG.scrollSpeed;

    // Spawn obstacles
    spawnTimer += deltaTime;
    if (spawnTimer >= CONFIG.obstacleSpawnInterval) {
        spawnTimer = 0;
        spawnObstacle();
    }

    // Update obstacles
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -= CONFIG.scrollSpeed;

        // Update position
        obstacle.element.style.left = obstacle.x + 'px';

        // Remove if off screen
        if (obstacle.x < -100) {
            removeObstacle(obstacle, i);
        }

        // Check collision
        if (!gameState.isJumping && checkCollision(obstacle)) {
            handleCrash();
            return;
        }

        // Check for successful jump over obstacle
        if (!obstacle.scored && obstacle.x < 50 && gameState.isJumping) {
            obstacle.scored = true;
            scoreJump(obstacle);
        }
    }

    updateSpeedDisplay();
}

function renderGame() {
    // Visual updates are handled via DOM manipulation in updateGame
}

// ==========================================
// OBSTACLE MANAGEMENT
// ==========================================

function spawnObstacle() {
    const isRamp = Math.random() < CONFIG.rampChance;
    const obstacle = {
        x: elements.gameArea.clientWidth,
        type: isRamp ? 'ramp' : 'obstacle',
        element: createObstacleElement(isRamp),
        scored: false,
    };

    gameState.obstacles.push(obstacle);
    elements.gameArea.appendChild(obstacle.element);
}

function createObstacleElement(isRamp) {
    const element = document.createElement('div');

    if (isRamp) {
        element.className = 'ramp';
    } else {
        element.className = 'obstacle';
        const randomObstacle = CONFIG.obstacleTypes[Math.floor(Math.random() * CONFIG.obstacleTypes.length)];
        element.textContent = randomObstacle;
    }

    return element;
}

function removeObstacle(obstacle, index) {
    obstacle.element.remove();
    gameState.obstacles.splice(index, 1);
}

// ==========================================
// JUMP MECHANICS
// ==========================================

function handleJump(e) {
    e.preventDefault();
    if (gameState.isPlaying && !gameState.isJumping) {
        performJump();
    }
}

function performJump() {
    gameState.isJumping = true;
    gameState.jumps++;
    updateJumpsDisplay();

    elements.truck.classList.add('jumping');

    setTimeout(() => {
        gameState.isJumping = false;
        elements.truck.classList.remove('jumping');
    }, CONFIG.jumpDuration);
}

function scoreJump(obstacle) {
    let stunt;

    // Determine stunt quality based on obstacle type and timing
    if (obstacle.type === 'ramp') {
        stunt = STUNTS.perfect;
        gameState.bestStunt = 'Perfect Jump!';
    } else if (obstacle.x > 40 && obstacle.x < 60) {
        stunt = STUNTS.good;
        if (gameState.bestStunt === 'Regular Jump') {
            gameState.bestStunt = 'Good Jump!';
        }
    } else {
        stunt = STUNTS.regular;
    }

    gameState.score += stunt.points;
    updateScoreDisplay();
    showStuntMessage(stunt);
}

function showStuntMessage(stunt) {
    elements.stuntMessage.textContent = `${stunt.emoji} ${stunt.name} +${stunt.points}`;
    elements.stuntMessage.classList.add('show');

    setTimeout(() => {
        elements.stuntMessage.classList.remove('show');
    }, 1000);
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkCollision(obstacle) {
    const truckRect = elements.truck.getBoundingClientRect();
    const obstacleRect = obstacle.element.getBoundingClientRect();

    // Simple collision detection
    return !(truckRect.right < obstacleRect.left ||
             truckRect.left > obstacleRect.right ||
             truckRect.bottom < obstacleRect.top ||
             truckRect.top > obstacleRect.bottom);
}

function handleCrash() {
    gameState.isPlaying = false;
    elements.truck.classList.add('crashed');

    setTimeout(() => {
        endGame();
    }, 500);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.jumps = 0;
    gameState.speed = 3;
    gameState.isJumping = false;
    gameState.obstacles = [];
    gameState.bestStunt = 'Regular Jump';
    gameState.distance = 0;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.jumpBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'inline-block';

    elements.truck.classList.remove('crashed', 'jumping');

    updateScoreDisplay();
    updateJumpsDisplay();
    updateSpeedDisplay();

    spawnTimer = 0;
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalJumpsDisplay.textContent = gameState.jumps;
    elements.bestStuntDisplay.textContent = gameState.bestStunt;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState = {
        score: 0,
        jumps: 0,
        speed: 0,
        isPlaying: false,
        isJumping: false,
        obstacles: [],
        bestStunt: 'Regular Jump',
        distance: 0,
    };

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.jumpBtn.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    elements.truck.classList.remove('crashed', 'jumping');

    updateScoreDisplay();
    updateJumpsDisplay();
    updateSpeedDisplay();

    // Remove all obstacles
    const obstacles = elements.gameArea.querySelectorAll('.obstacle, .ramp');
    obstacles.forEach(obstacle => obstacle.remove());

    console.log('Game reset');
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

function updateJumpsDisplay() {
    elements.jumpsDisplay.textContent = gameState.jumps;
}

function updateSpeedDisplay() {
    elements.speedDisplay.textContent = Math.floor(gameState.speed);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
