'use strict';

// === Configuration ===
const CONFIG = {
    spawnInterval: 1500,
    fallDuration: 4000
};

// === Resources ===
const RESOURCES = {
    stone: { emoji: '🪨', weight: 40 },
    wood: { emoji: '🪵', weight: 40 },
    gold: { emoji: '🪙', weight: 20 }
};

// === Castle Parts ===
const PARTS = {
    towerLeft: {
        name: 'Left Tower',
        cost: { stone: 10, wood: 5, gold: 0 }
    },
    wall: {
        name: 'Wall',
        cost: { stone: 15, wood: 0, gold: 0 }
    },
    towerRight: {
        name: 'Right Tower',
        cost: { stone: 10, wood: 5, gold: 0 }
    },
    gate: {
        name: 'Gate',
        cost: { stone: 0, wood: 10, gold: 0 }
    },
    flag: {
        name: 'Flag',
        cost: { stone: 0, wood: 0, gold: 5 }
    }
};

// === State Management ===
let gameState = {
    resources: {
        stone: 0,
        wood: 0,
        gold: 0
    },
    builtParts: {
        towerLeft: false,
        wall: false,
        towerRight: false,
        gate: false,
        flag: false
    },
    isPlaying: false,
    spawnTimer: null
};

// === DOM References ===
const elements = {
    resourceField: document.getElementById('resourceField'),
    stoneCount: document.getElementById('stoneCount'),
    woodCount: document.getElementById('woodCount'),
    goldCount: document.getElementById('goldCount'),
    castleParts: document.getElementById('castleParts'),
    buildButtons: document.querySelectorAll('.build-btn'),
    startBtn: document.getElementById('startBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    victoryOverlay: document.getElementById('victoryOverlay')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    updateUI();
}

function setupEventListeners() {
    // Start buttons
    elements.startBtn.addEventListener('touchstart', startGame);
    elements.startBtn.addEventListener('click', startGame);

    elements.playBtn.addEventListener('touchstart', startGame);
    elements.playBtn.addEventListener('click', startGame);

    elements.playAgainBtn.addEventListener('touchstart', resetAndStart);
    elements.playAgainBtn.addEventListener('click', resetAndStart);

    // Build buttons
    elements.buildButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => handleBuild(e, btn));
        btn.addEventListener('click', (e) => handleBuild(e, btn));
    });
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    elements.welcomeOverlay.style.display = 'none';
    elements.victoryOverlay.style.display = 'none';
    elements.startBtn.style.display = 'none';

    gameState.isPlaying = true;
    startResourceSpawning();
}

function resetAndStart(e) {
    e.preventDefault();

    // Reset game state
    gameState.resources = { stone: 0, wood: 0, gold: 0 };
    gameState.builtParts = {
        towerLeft: false,
        wall: false,
        towerRight: false,
        gate: false,
        flag: false
    };

    // Reset visual
    const parts = elements.castleParts.querySelectorAll('.castle-part');
    parts.forEach(part => {
        part.classList.remove('built');
        const emoji = part.querySelector('.part-emoji');
        emoji.style.opacity = '0.2';
    });

    // Clear resources
    elements.resourceField.innerHTML = '';

    updateUI();
    startGame(e);
}

function startResourceSpawning() {
    gameState.spawnTimer = setInterval(() => {
        if (gameState.isPlaying) {
            spawnResource();
        }
    }, CONFIG.spawnInterval);

    // Spawn initial resources
    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnResource(), i * 500);
    }
}

function checkVictory() {
    const allBuilt = Object.values(gameState.builtParts).every(built => built);

    if (allBuilt) {
        gameState.isPlaying = false;

        if (gameState.spawnTimer) {
            clearInterval(gameState.spawnTimer);
        }

        setTimeout(() => {
            elements.victoryOverlay.style.display = 'flex';
        }, 1000);
    }
}

// === Resource Management ===
function spawnResource() {
    // Weighted random selection
    const random = Math.random() * 100;
    let resourceType;

    if (random < RESOURCES.stone.weight) {
        resourceType = 'stone';
    } else if (random < RESOURCES.stone.weight + RESOURCES.wood.weight) {
        resourceType = 'wood';
    } else {
        resourceType = 'gold';
    }

    const resource = document.createElement('div');
    resource.className = 'resource';
    resource.textContent = RESOURCES[resourceType].emoji;
    resource.dataset.type = resourceType;

    // Random horizontal position
    const randomX = Math.random() * 85;
    resource.style.left = randomX + '%';
    resource.style.animationDuration = CONFIG.fallDuration + 'ms';

    // Add event listeners
    resource.addEventListener('touchstart', collectResource);
    resource.addEventListener('click', collectResource);

    elements.resourceField.appendChild(resource);

    // Remove after falling
    setTimeout(() => {
        if (resource.parentNode) {
            resource.remove();
        }
    }, CONFIG.fallDuration);
}

function collectResource(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!gameState.isPlaying) return;

    const resourceType = e.currentTarget.dataset.type;

    // Add to inventory
    gameState.resources[resourceType]++;

    // Animate collection
    e.currentTarget.classList.add('collecting');

    setTimeout(() => {
        e.currentTarget.remove();
    }, 500);

    updateUI();
}

// === Building ===
function handleBuild(e, btn) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const partName = btn.dataset.part;
    const part = PARTS[partName];

    // Check if already built
    if (gameState.builtParts[partName]) return;

    // Check if can afford
    const canAfford =
        gameState.resources.stone >= part.cost.stone &&
        gameState.resources.wood >= part.cost.wood &&
        gameState.resources.gold >= part.cost.gold;

    if (!canAfford) return;

    // Deduct resources
    gameState.resources.stone -= part.cost.stone;
    gameState.resources.wood -= part.cost.wood;
    gameState.resources.gold -= part.cost.gold;

    // Mark as built
    gameState.builtParts[partName] = true;

    // Update castle visual
    const partElement = document.querySelector(`.castle-part[data-part="${partName}"]`);
    partElement.classList.add('built');

    updateUI();
    checkVictory();
}

// === UI Updates ===
function updateUI() {
    // Update resource counts
    elements.stoneCount.textContent = gameState.resources.stone;
    elements.woodCount.textContent = gameState.resources.wood;
    elements.goldCount.textContent = gameState.resources.gold;

    // Update build buttons
    elements.buildButtons.forEach(btn => {
        const partName = btn.dataset.part;
        const part = PARTS[partName];

        // Remove all classes
        btn.classList.remove('disabled', 'built');

        // Check if built
        if (gameState.builtParts[partName]) {
            btn.classList.add('built');
            return;
        }

        // Check if can afford
        const canAfford =
            gameState.resources.stone >= part.cost.stone &&
            gameState.resources.wood >= part.cost.wood &&
            gameState.resources.gold >= part.cost.gold;

        if (!canAfford) {
            btn.classList.add('disabled');
        }
    });
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.resource-field')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
