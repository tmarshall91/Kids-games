'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    moveSpeed: 5,
    oxygenDepletion: 0.1,
    spawnInterval: 1500,
    seaCreatures: [
        { emoji: '🐠', points: 10, name: 'Tropical Fish' },
        { emoji: '🐟', points: 10, name: 'Fish' },
        { emoji: '🐡', points: 20, name: 'Pufferfish' },
        { emoji: '🦈', points: 30, name: 'Shark' },
        { emoji: '🐙', points: 25, name: 'Octopus' },
        { emoji: '🦑', points: 25, name: 'Squid' },
        { emoji: '🐢', points: 30, name: 'Sea Turtle' },
        { emoji: '🦀', points: 15, name: 'Crab' },
        { emoji: '🦞', points: 20, name: 'Lobster' },
        { emoji: '🐚', points: 15, name: 'Shell' },
        { emoji: '⭐', points: 35, name: 'Starfish' },
    ],
    obstacles: [
        { emoji: '⚓', name: 'Anchor' },
        { emoji: '🪨', name: 'Rock' },
        { emoji: '🌿', name: 'Seaweed' },
    ],
    obstacleChance: 0.25, // 25% chance to spawn obstacle
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    depth: 0,
    discoveries: 0,
    oxygen: 100,
    isPlaying: false,
    submarineX: 0,
    submarineY: 0,
    entities: [],
    keys: {},
    discoveredCreatures: new Set(),
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    depthDisplay: document.getElementById('depth'),
    discoveriesDisplay: document.getElementById('discoveries'),
    oxygenDisplay: document.getElementById('oxygen'),
    finalDepthDisplay: document.getElementById('finalDepth'),
    finalDiscoveriesDisplay: document.getElementById('finalDiscoveries'),
    explorerRankDisplay: document.getElementById('explorerRank'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameMessage: document.getElementById('gameMessage'),
    discoveryMessage: document.getElementById('discoveryMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    submarine: document.getElementById('submarine'),
    controlPad: document.getElementById('controlPad'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Submarine Exploration initialized');
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

    // Arrow button controls
    setupArrowButton(elements.upBtn, 'up');
    setupArrowButton(elements.downBtn, 'down');
    setupArrowButton(elements.leftBtn, 'left');
    setupArrowButton(elements.rightBtn, 'right');

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            gameState.keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameState.keys[e.key] = false;
        }
    });

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function setupArrowButton(button, direction) {
    const keyMap = {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
    };

    const pressHandler = (e) => {
        e.preventDefault();
        gameState.keys[keyMap[direction]] = true;
    };

    const releaseHandler = (e) => {
        e.preventDefault();
        gameState.keys[keyMap[direction]] = false;
    };

    button.addEventListener('touchstart', pressHandler);
    button.addEventListener('mousedown', pressHandler);
    button.addEventListener('touchend', releaseHandler);
    button.addEventListener('mouseup', releaseHandler);
    button.addEventListener('mouseleave', releaseHandler);
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
    // Update submarine position
    updateSubmarinePosition();

    // Deplete oxygen
    gameState.oxygen -= CONFIG.oxygenDepletion * (deltaTime / 1000);
    if (gameState.oxygen <= 0) {
        gameState.oxygen = 0;
        endGame();
        return;
    }

    // Spawn entities
    spawnTimer += deltaTime;
    if (spawnTimer >= CONFIG.spawnInterval) {
        spawnTimer = 0;
        spawnEntity();
    }

    // Update entities
    for (let i = gameState.entities.length - 1; i >= 0; i--) {
        const entity = gameState.entities[i];

        // Move entity
        entity.lifetime += deltaTime;

        // Remove if old
        if (entity.lifetime > 10000) {
            removeEntity(entity, i);
            continue;
        }

        // Check collision with submarine
        if (checkCollision(entity)) {
            if (entity.type === 'creature') {
                collectCreature(entity, i);
            } else if (entity.type === 'obstacle') {
                hitObstacle(entity, i);
            }
        }
    }

    updateDisplays();
}

function renderGame() {
    // Rendering is handled via DOM updates
}

// ==========================================
// SUBMARINE MOVEMENT
// ==========================================

function updateSubmarinePosition() {
    const gameAreaWidth = elements.gameArea.clientWidth;
    const gameAreaHeight = elements.gameArea.clientHeight;

    // Update position based on input
    if (gameState.keys['ArrowUp']) {
        gameState.submarineY -= CONFIG.moveSpeed;
        gameState.depth += 1; // Going up decreases depth conceptually, but for score we track exploration
    }
    if (gameState.keys['ArrowDown']) {
        gameState.submarineY += CONFIG.moveSpeed;
        gameState.depth += 1;
    }
    if (gameState.keys['ArrowLeft']) {
        gameState.submarineX -= CONFIG.moveSpeed;
    }
    if (gameState.keys['ArrowRight']) {
        gameState.submarineX += CONFIG.moveSpeed;
    }

    // Clamp position
    const subSize = 50;
    gameState.submarineX = clamp(gameState.submarineX, 0, gameAreaWidth - subSize);
    gameState.submarineY = clamp(gameState.submarineY, 0, gameAreaHeight - subSize);

    // Update submarine element position
    elements.submarine.style.left = gameState.submarineX + 'px';
    elements.submarine.style.top = gameState.submarineY + 'px';
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==========================================
// ENTITY MANAGEMENT
// ==========================================

function spawnEntity() {
    const isObstacle = Math.random() < CONFIG.obstacleChance;
    const gameAreaWidth = elements.gameArea.clientWidth;
    const gameAreaHeight = elements.gameArea.clientHeight;

    let entity;

    if (isObstacle) {
        const obstacleData = CONFIG.obstacles[Math.floor(Math.random() * CONFIG.obstacles.length)];
        entity = {
            type: 'obstacle',
            data: obstacleData,
            x: Math.random() * (gameAreaWidth - 50),
            y: Math.random() * (gameAreaHeight - 50),
            element: createEntityElement(obstacleData.emoji, 'obstacle'),
            lifetime: 0,
        };
    } else {
        const creatureData = CONFIG.seaCreatures[Math.floor(Math.random() * CONFIG.seaCreatures.length)];
        entity = {
            type: 'creature',
            data: creatureData,
            x: Math.random() * (gameAreaWidth - 50),
            y: Math.random() * (gameAreaHeight - 50),
            element: createEntityElement(creatureData.emoji, 'sea-creature'),
            lifetime: 0,
        };
    }

    gameState.entities.push(entity);
    elements.gameArea.appendChild(entity.element);
    positionEntity(entity);
}

function createEntityElement(emoji, className) {
    const element = document.createElement('div');
    element.className = className;
    element.textContent = emoji;

    // Add click handler for creatures
    if (className === 'sea-creature') {
        const handler = (e) => {
            e.preventDefault();
            const entity = gameState.entities.find(ent => ent.element === element);
            if (entity) {
                const index = gameState.entities.indexOf(entity);
                collectCreature(entity, index);
            }
        };
        element.addEventListener('touchstart', handler);
        element.addEventListener('click', handler);
    }

    return element;
}

function positionEntity(entity) {
    entity.element.style.left = entity.x + 'px';
    entity.element.style.top = entity.y + 'px';
}

function removeEntity(entity, index) {
    entity.element.remove();
    gameState.entities.splice(index, 1);
}

// ==========================================
// COLLISION & COLLECTION
// ==========================================

function checkCollision(entity) {
    const subRect = elements.submarine.getBoundingClientRect();
    const entityRect = entity.element.getBoundingClientRect();

    return !(subRect.right < entityRect.left ||
             subRect.left > entityRect.right ||
             subRect.bottom < entityRect.top ||
             subRect.top > entityRect.bottom);
}

function collectCreature(creature, index) {
    gameState.discoveries++;
    gameState.depth += creature.data.points;

    // Add visual feedback
    showDiscoveryMessage(creature.data);

    removeEntity(creature, index);
}

function hitObstacle(obstacle, index) {
    // Lose oxygen
    gameState.oxygen -= 10;

    // Visual feedback
    elements.submarine.style.filter = 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.8))';
    setTimeout(() => {
        elements.submarine.style.filter = 'drop-shadow(0 0 10px rgba(78, 205, 196, 0.5))';
    }, 200);

    removeEntity(obstacle, index);

    if (gameState.oxygen <= 0) {
        endGame();
    }
}

function showDiscoveryMessage(creatureData) {
    elements.discoveryMessage.textContent = `${creatureData.emoji} ${creatureData.name}! +${creatureData.points}`;
    elements.discoveryMessage.classList.add('show');

    setTimeout(() => {
        elements.discoveryMessage.classList.remove('show');
    }, 1500);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.depth = 0;
    gameState.discoveries = 0;
    gameState.oxygen = 100;
    gameState.entities = [];
    gameState.discoveredCreatures = new Set();
    gameState.keys = {};

    // Center submarine
    const gameAreaWidth = elements.gameArea.clientWidth;
    const gameAreaHeight = elements.gameArea.clientHeight;
    gameState.submarineX = gameAreaWidth / 2 - 25;
    gameState.submarineY = gameAreaHeight / 2 - 25;

    elements.submarine.style.left = gameState.submarineX + 'px';
    elements.submarine.style.top = gameState.submarineY + 'px';

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.controlPad.style.display = 'grid';
    elements.restartBtn.style.display = 'inline-block';

    updateDisplays();

    spawnTimer = 0;
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    console.log('Exploration started');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.finalDepthDisplay.textContent = Math.floor(gameState.depth);
    elements.finalDiscoveriesDisplay.textContent = gameState.discoveries;

    // Determine rank
    const rank = getExplorerRank(gameState.depth);
    elements.explorerRankDisplay.textContent = `🏆 ${rank}`;

    if (gameState.oxygen <= 0) {
        elements.gameOverTitle.textContent = 'Out of Oxygen! 💨';
    } else {
        elements.gameOverTitle.textContent = 'Dive Complete! 🌊';
    }

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Exploration ended. Depth:', gameState.depth);
}

function getExplorerRank(depth) {
    if (depth >= 1000) return 'Master Explorer! 🌟';
    if (depth >= 500) return 'Expert Diver! 🏅';
    if (depth >= 250) return 'Skilled Navigator! ⭐';
    if (depth >= 100) return 'Brave Explorer! 🎖️';
    return 'Novice Diver! 🔰';
}

function resetGame() {
    gameState = {
        depth: 0,
        discoveries: 0,
        oxygen: 100,
        isPlaying: false,
        submarineX: 0,
        submarineY: 0,
        entities: [],
        keys: {},
        discoveredCreatures: new Set(),
    };

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.controlPad.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateDisplays();

    // Remove all entities
    const entities = elements.gameArea.querySelectorAll('.sea-creature, .obstacle');
    entities.forEach(entity => entity.remove());

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

function updateDisplays() {
    elements.depthDisplay.textContent = Math.floor(gameState.depth);
    elements.discoveriesDisplay.textContent = gameState.discoveries;
    elements.oxygenDisplay.textContent = Math.floor(gameState.oxygen);
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
