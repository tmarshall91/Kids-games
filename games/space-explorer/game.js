'use strict';

// === Configuration ===
const CONFIG = {
    spawnInterval: 800, // Initial spawn interval (gets faster)
    minSpawnInterval: 300, // Minimum spawn interval
    speedIncrease: 50, // Decrease interval by this much every 10 seconds
    fallSpeed: 3000, // Initial fall duration
    minFallSpeed: 1500, // Minimum fall duration
    points: {
        star: 10,
        planet: 25
    },
    initialLives: 3
};

// === Space Objects ===
const OBJECTS = {
    star: {
        emoji: '⭐',
        type: 'collectible',
        points: CONFIG.points.star
    },
    asteroid: {
        emoji: '☄️',
        type: 'danger',
        damage: 1
    },
    planet: {
        emoji: '🪐',
        type: 'collectible',
        points: CONFIG.points.planet
    }
};

// === State Management ===
let gameState = {
    score: 0,
    lives: CONFIG.initialLives,
    isPlaying: false,
    startTime: 0,
    survivalTime: 0,
    spawnInterval: CONFIG.spawnInterval,
    fallSpeed: CONFIG.fallSpeed,
    spawnTimer: null,
    difficultyTimer: null,
    gameLoopId: null,
    spaceshipX: 50 // Percentage from left
};

// === DOM References ===
const elements = {
    spaceField: document.getElementById('spaceField'),
    spaceship: document.getElementById('spaceship'),
    objectsContainer: document.getElementById('objectsContainer'),
    score: document.getElementById('score'),
    lives: document.getElementById('lives'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    survivalTime: document.getElementById('survivalTime')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start buttons
    elements.startBtn.addEventListener('touchstart', startGame);
    elements.startBtn.addEventListener('click', startGame);

    elements.playBtn.addEventListener('touchstart', startGame);
    elements.playBtn.addEventListener('click', startGame);

    // Restart buttons
    elements.restartBtn.addEventListener('touchstart', restartGame);
    elements.restartBtn.addEventListener('click', restartGame);

    elements.playAgainBtn.addEventListener('touchstart', restartGame);
    elements.playAgainBtn.addEventListener('click', restartGame);

    // Spaceship controls - touch
    let isDragging = false;

    elements.spaceField.addEventListener('touchstart', (e) => {
        if (!gameState.isPlaying) return;
        isDragging = true;
        moveSpaceship(e.touches[0].clientX);
    });

    elements.spaceField.addEventListener('touchmove', (e) => {
        if (!gameState.isPlaying || !isDragging) return;
        e.preventDefault();
        moveSpaceship(e.touches[0].clientX);
    });

    elements.spaceField.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Spaceship controls - mouse
    elements.spaceField.addEventListener('mousedown', (e) => {
        if (!gameState.isPlaying) return;
        isDragging = true;
        moveSpaceship(e.clientX);
    });

    elements.spaceField.addEventListener('mousemove', (e) => {
        if (!gameState.isPlaying || !isDragging) return;
        moveSpaceship(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function moveSpaceship(clientX) {
    const fieldRect = elements.spaceField.getBoundingClientRect();
    const relativeX = clientX - fieldRect.left;
    const percentage = (relativeX / fieldRect.width) * 100;

    // Clamp between 0 and 100
    gameState.spaceshipX = Math.max(0, Math.min(100, percentage));

    elements.spaceship.style.left = gameState.spaceshipX + '%';
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    // Hide overlays
    elements.welcomeOverlay.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Show restart button
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;
    gameState.startTime = Date.now();

    // Start game loops
    startSpawning();
    startDifficultyIncrease();
    gameLoop();
}

function restartGame(e) {
    e.preventDefault();

    // Hide game over overlay
    elements.gameOverOverlay.style.display = 'none';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;
    gameState.startTime = Date.now();

    // Start game loops
    startSpawning();
    startDifficultyIncrease();
    gameLoop();
}

function resetGame() {
    gameState.score = 0;
    gameState.lives = CONFIG.initialLives;
    gameState.survivalTime = 0;
    gameState.spawnInterval = CONFIG.spawnInterval;
    gameState.fallSpeed = CONFIG.fallSpeed;
    gameState.spaceshipX = 50;

    // Clear timers
    if (gameState.spawnTimer) {
        clearInterval(gameState.spawnTimer);
    }
    if (gameState.difficultyTimer) {
        clearInterval(gameState.difficultyTimer);
    }
    if (gameState.gameLoopId) {
        cancelAnimationFrame(gameState.gameLoopId);
    }

    // Clear all objects
    elements.objectsContainer.innerHTML = '';

    // Reset spaceship position
    elements.spaceship.style.left = '50%';

    updateUI();
}

function startSpawning() {
    function spawn() {
        if (gameState.isPlaying) {
            spawnObject();
        }
    }

    gameState.spawnTimer = setInterval(spawn, gameState.spawnInterval);
}

function startDifficultyIncrease() {
    gameState.difficultyTimer = setInterval(() => {
        if (!gameState.isPlaying) return;

        // Increase spawn rate
        gameState.spawnInterval = Math.max(
            CONFIG.minSpawnInterval,
            gameState.spawnInterval - CONFIG.speedIncrease
        );

        // Increase fall speed
        gameState.fallSpeed = Math.max(
            CONFIG.minFallSpeed,
            gameState.fallSpeed - 100
        );

        // Restart spawn timer with new interval
        clearInterval(gameState.spawnTimer);
        startSpawning();

    }, 10000); // Every 10 seconds
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate survival time
    gameState.survivalTime = Math.floor((Date.now() - gameState.startTime) / 1000);

    // Clear timers
    if (gameState.spawnTimer) {
        clearInterval(gameState.spawnTimer);
    }
    if (gameState.difficultyTimer) {
        clearInterval(gameState.difficultyTimer);
    }
    if (gameState.gameLoopId) {
        cancelAnimationFrame(gameState.gameLoopId);
    }

    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.survivalTime.textContent = gameState.survivalTime;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Object Spawning ===
function spawnObject() {
    // Random object selection with weighted probabilities
    const random = Math.random();
    let objectType;

    if (random < 0.5) {
        objectType = 'star'; // 50%
    } else if (random < 0.85) {
        objectType = 'asteroid'; // 35%
    } else {
        objectType = 'planet'; // 15%
    }

    const objectData = OBJECTS[objectType];
    const object = document.createElement('div');
    object.className = `space-object ${objectType}`;
    object.textContent = objectData.emoji;
    object.dataset.type = objectType;

    // Random horizontal position
    const randomX = Math.random() * 90; // 0-90% to keep objects on screen
    object.style.left = randomX + '%';

    // Set animation duration
    object.style.animationDuration = gameState.fallSpeed + 'ms';

    // Add to container
    elements.objectsContainer.appendChild(object);

    // Remove after animation completes
    setTimeout(() => {
        if (object.parentNode) {
            object.remove();
        }
    }, gameState.fallSpeed);
}

// === Game Loop ===
function gameLoop() {
    if (!gameState.isPlaying) return;

    // Check collisions
    checkCollisions();

    // Continue loop
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    const spaceshipRect = elements.spaceship.getBoundingClientRect();
    const objects = elements.objectsContainer.querySelectorAll('.space-object');

    objects.forEach(object => {
        const objectRect = object.getBoundingClientRect();

        // Simple collision detection
        if (isColliding(spaceshipRect, objectRect)) {
            handleCollision(object);
        }
    });
}

function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

function handleCollision(object) {
    const objectType = object.dataset.type;
    const objectData = OBJECTS[objectType];

    // Create collision effect
    createCollisionEffect(object, objectData.emoji);

    // Remove object
    object.remove();

    if (objectData.type === 'collectible') {
        // Collect points
        gameState.score += objectData.points;
        updateUI();
    } else if (objectData.type === 'danger') {
        // Take damage
        gameState.lives -= objectData.damage;
        updateUI();

        // Check if game over
        if (gameState.lives <= 0) {
            endGame();
        }
    }
}

function createCollisionEffect(object, emoji) {
    const effect = document.createElement('div');
    effect.className = 'collision-effect';
    effect.textContent = emoji === '☄️' ? '💥' : '✨';

    const objectRect = object.getBoundingClientRect();
    const fieldRect = elements.spaceField.getBoundingClientRect();

    effect.style.left = (objectRect.left - fieldRect.left) + 'px';
    effect.style.top = (objectRect.top - fieldRect.top) + 'px';

    elements.spaceField.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 500);
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;

    // Update lives display
    const hearts = '❤️'.repeat(gameState.lives);
    elements.lives.textContent = hearts || '💔';
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.space-field')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
