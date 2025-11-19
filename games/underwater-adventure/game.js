'use strict';

// === Configuration ===
const CONFIG = {
    spawnInterval: 1200,
    oxygenDepletion: 0.5, // % per second
    initialOxygen: 100,
    points: {
        treasure: 50,
        pearl: 30,
        coin: 10
    },
    oxygen: {
        bubble: 20,
        jellyfish: -30
    }
};

// === Ocean Items ===
const ITEMS = {
    treasure: { emoji: '💎', type: 'collectible', points: CONFIG.points.treasure },
    pearl: { emoji: '🦪', type: 'collectible', points: CONFIG.points.pearl },
    coin: { emoji: '🪙', type: 'collectible', points: CONFIG.points.coin },
    airBubble: { emoji: '🫧', type: 'oxygen', value: CONFIG.oxygen.bubble },
    jellyfish: { emoji: '☠️', type: 'danger', value: CONFIG.oxygen.jellyfish }
};

// === State Management ===
let gameState = {
    score: 0,
    oxygen: CONFIG.initialOxygen,
    depth: 0,
    maxDepth: 0,
    isPlaying: false,
    diverX: 50,
    diverY: 50,
    spawnTimer: null,
    oxygenTimer: null,
    bubbleTimer: null,
    gameLoopId: null
};

// === DOM References ===
const elements = {
    ocean: document.getElementById('ocean'),
    diver: document.getElementById('diver'),
    itemsContainer: document.getElementById('itemsContainer'),
    bubblesContainer: document.getElementById('bubblesContainer'),
    score: document.getElementById('score'),
    oxygen: document.getElementById('oxygen'),
    depth: document.getElementById('depth'),
    oxygenBar: document.getElementById('oxygenBar'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    maxDepth: document.getElementById('maxDepth')
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

    // Ocean click/tap to swim
    elements.ocean.addEventListener('touchstart', handleSwim);
    elements.ocean.addEventListener('click', handleSwim);
}

function handleSwim(e) {
    if (!gameState.isPlaying) return;

    e.preventDefault();

    const oceanRect = elements.ocean.getBoundingClientRect();
    let clientX, clientY;

    if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const targetX = ((clientX - oceanRect.left) / oceanRect.width) * 100;
    const targetY = ((clientY - oceanRect.top) / oceanRect.height) * 100;

    moveDiver(targetX, targetY);
}

function moveDiver(targetX, targetY) {
    gameState.diverX = Math.max(0, Math.min(100, targetX));
    gameState.diverY = Math.max(0, Math.min(100, targetY));

    elements.diver.style.left = gameState.diverX + '%';
    elements.diver.style.top = gameState.diverY + '%';

    // Add swimming animation
    elements.diver.classList.add('swimming');
    setTimeout(() => {
        elements.diver.classList.remove('swimming');
    }, 300);

    // Update depth based on Y position
    gameState.depth = Math.floor(gameState.diverY * 2);
    if (gameState.depth > gameState.maxDepth) {
        gameState.maxDepth = gameState.depth;
    }

    updateUI();
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    elements.welcomeOverlay.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';

    resetGame();
    gameState.isPlaying = true;

    startSpawning();
    startOxygenDepletion();
    startBackgroundBubbles();
    gameLoop();
}

function restartGame(e) {
    e.preventDefault();

    elements.gameOverOverlay.style.display = 'none';

    resetGame();
    gameState.isPlaying = true;

    startSpawning();
    startOxygenDepletion();
    startBackgroundBubbles();
    gameLoop();
}

function resetGame() {
    gameState.score = 0;
    gameState.oxygen = CONFIG.initialOxygen;
    gameState.depth = 0;
    gameState.maxDepth = 0;
    gameState.diverX = 50;
    gameState.diverY = 50;

    // Clear timers
    if (gameState.spawnTimer) clearInterval(gameState.spawnTimer);
    if (gameState.oxygenTimer) clearInterval(gameState.oxygenTimer);
    if (gameState.bubbleTimer) clearInterval(gameState.bubbleTimer);
    if (gameState.gameLoopId) cancelAnimationFrame(gameState.gameLoopId);

    // Clear items
    elements.itemsContainer.innerHTML = '';
    elements.bubblesContainer.innerHTML = '';

    // Reset diver position
    elements.diver.style.left = '50%';
    elements.diver.style.top = '50%';

    updateUI();
}

function startSpawning() {
    gameState.spawnTimer = setInterval(() => {
        if (gameState.isPlaying) {
            spawnItem();
        }
    }, CONFIG.spawnInterval);
}

function startOxygenDepletion() {
    gameState.oxygenTimer = setInterval(() => {
        if (gameState.isPlaying) {
            gameState.oxygen -= CONFIG.oxygenDepletion;
            gameState.oxygen = Math.max(0, gameState.oxygen);
            updateUI();

            if (gameState.oxygen <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function startBackgroundBubbles() {
    gameState.bubbleTimer = setInterval(() => {
        if (gameState.isPlaying) {
            createBackgroundBubble();
        }
    }, 800);
}

function endGame() {
    gameState.isPlaying = false;

    if (gameState.spawnTimer) clearInterval(gameState.spawnTimer);
    if (gameState.oxygenTimer) clearInterval(gameState.oxygenTimer);
    if (gameState.bubbleTimer) clearInterval(gameState.bubbleTimer);
    if (gameState.gameLoopId) cancelAnimationFrame(gameState.gameLoopId);

    elements.finalScore.textContent = gameState.score;
    elements.maxDepth.textContent = gameState.maxDepth;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Item Spawning ===
function spawnItem() {
    const random = Math.random();
    let itemType;

    if (random < 0.3) {
        itemType = 'coin';
    } else if (random < 0.5) {
        itemType = 'pearl';
    } else if (random < 0.65) {
        itemType = 'treasure';
    } else if (random < 0.85) {
        itemType = 'airBubble';
    } else {
        itemType = 'jellyfish';
    }

    const itemData = ITEMS[itemType];
    const item = document.createElement('div');
    item.className = `ocean-item ${itemType}`;
    item.textContent = itemData.emoji;
    item.dataset.type = itemType;

    const randomX = Math.random() * 90;
    const randomY = Math.random() * 90;
    item.style.left = randomX + '%';
    item.style.top = randomY + '%';

    elements.itemsContainer.appendChild(item);

    // Remove air bubbles after animation
    if (itemType === 'airBubble') {
        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, 4000);
    }
}

function createBackgroundBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bg-bubble';

    const randomX = Math.random() * 100;
    bubble.style.left = randomX + '%';

    const size = 4 + Math.random() * 8;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';

    const duration = 3 + Math.random() * 4;
    bubble.style.animationDuration = duration + 's';

    elements.bubblesContainer.appendChild(bubble);

    setTimeout(() => bubble.remove(), duration * 1000);
}

// === Game Loop ===
function gameLoop() {
    if (!gameState.isPlaying) return;

    checkCollisions();
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    const diverRect = elements.diver.getBoundingClientRect();
    const items = elements.itemsContainer.querySelectorAll('.ocean-item');

    items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        if (isColliding(diverRect, itemRect)) {
            handleCollection(item);
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

function handleCollection(item) {
    const itemType = item.dataset.type;
    const itemData = ITEMS[itemType];

    createCollectEffect(item, itemData);
    item.remove();

    if (itemData.type === 'collectible') {
        gameState.score += itemData.points;
    } else if (itemData.type === 'oxygen') {
        gameState.oxygen = Math.min(100, gameState.oxygen + itemData.value);
    } else if (itemData.type === 'danger') {
        gameState.oxygen = Math.max(0, gameState.oxygen + itemData.value);
    }

    updateUI();
}

function createCollectEffect(item, itemData) {
    const effect = document.createElement('div');
    effect.className = 'collect-effect';

    if (itemData.type === 'collectible') {
        effect.textContent = '+' + itemData.points;
        effect.style.color = '#FFD700';
    } else if (itemData.type === 'oxygen') {
        effect.textContent = '+' + itemData.value + '%';
        effect.style.color = '#4CAF50';
    } else if (itemData.type === 'danger') {
        effect.textContent = itemData.value + '%';
        effect.style.color = '#f44336';
    }

    const itemRect = item.getBoundingClientRect();
    const oceanRect = elements.ocean.getBoundingClientRect();

    effect.style.left = (itemRect.left - oceanRect.left) + 'px';
    effect.style.top = (itemRect.top - oceanRect.top) + 'px';

    elements.ocean.appendChild(effect);
    setTimeout(() => effect.remove(), 1000);
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.oxygen.textContent = Math.floor(gameState.oxygen) + '%';
    elements.depth.textContent = gameState.depth + 'm';

    // Update oxygen bar
    elements.oxygenBar.style.width = gameState.oxygen + '%';

    // Update oxygen bar color
    elements.oxygenBar.classList.remove('low', 'critical');
    if (gameState.oxygen <= 30) {
        elements.oxygenBar.classList.add('critical');
    } else if (gameState.oxygen <= 50) {
        elements.oxygenBar.classList.add('low');
    }
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.ocean')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
