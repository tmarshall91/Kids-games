'use strict';

// === Configuration ===
const CONFIG = {
    fishTypes: ['🐟', '🐠', '🐡', '🦈', '🐙', '🦑', '🦐', '🦀', '🐚', '⭐'],
    maxFish: 15,
    spawnInterval: 2000, // Time between new fish spawns
    bubbleInterval: 1000,
    points: {
        common: 10,
        rare: 20,
        special: 30
    }
};

// === State Management ===
let gameState = {
    score: 0,
    fishCount: 0,
    isPlaying: false,
    currentSpawnFish: null,
    spawnInterval: null,
    bubbleInterval: null,
    fishInTank: []
};

// === DOM References ===
const elements = {
    aquarium: document.getElementById('aquarium'),
    fishContainer: document.getElementById('fishContainer'),
    bubblesContainer: document.getElementById('bubblesContainer'),
    spawnerArea: document.getElementById('spawnerArea'),
    spawnFish: document.getElementById('spawnFish'),
    score: document.getElementById('score'),
    fishCount: document.getElementById('fishCount'),
    startBtn: document.getElementById('startBtn'),
    clearBtn: document.getElementById('clearBtn'),
    playBtn: document.getElementById('playBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay')
};

// === Fish Categories ===
const FISH_CATEGORIES = {
    common: ['🐟', '🐠'],
    rare: ['🐡', '🦈', '🦐', '🦀'],
    special: ['🐙', '🦑', '🐚', '⭐']
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

    // Clear button
    elements.clearBtn.addEventListener('touchstart', clearTank);
    elements.clearBtn.addEventListener('click', clearTank);

    // Spawn fish click
    elements.spawnFish.addEventListener('touchstart', catchFish);
    elements.spawnFish.addEventListener('click', catchFish);
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    // Hide welcome overlay
    elements.welcomeOverlay.style.display = 'none';

    // Show clear button, hide start
    elements.startBtn.style.display = 'none';
    elements.clearBtn.style.display = 'block';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Start spawning fish
    spawnNewFish();
    startSpawnInterval();

    // Start bubbles
    startBubbles();
}

function resetGame() {
    gameState.score = 0;
    gameState.fishCount = 0;
    gameState.fishInTank = [];

    // Clear intervals
    if (gameState.spawnInterval) {
        clearInterval(gameState.spawnInterval);
    }
    if (gameState.bubbleInterval) {
        clearInterval(gameState.bubbleInterval);
    }

    // Clear tank
    elements.fishContainer.innerHTML = '';
    elements.bubblesContainer.innerHTML = '';

    // Spawn first fish
    spawnNewFish();

    updateUI();
}

function clearTank(e) {
    e.preventDefault();

    if (!confirm('Clear all fish from the tank?')) return;

    // Clear all fish
    elements.fishContainer.innerHTML = '';
    gameState.fishInTank = [];
    gameState.fishCount = 0;
    gameState.score = 0;

    updateUI();
}

// === Fish Spawning ===
function startSpawnInterval() {
    gameState.spawnInterval = setInterval(() => {
        if (gameState.isPlaying && gameState.fishCount < CONFIG.maxFish) {
            spawnNewFish();
        }
    }, CONFIG.spawnInterval);
}

function spawnNewFish() {
    // Random fish selection
    const allFish = CONFIG.fishTypes;
    const randomFish = allFish[Math.floor(Math.random() * allFish.length)];

    gameState.currentSpawnFish = randomFish;
    elements.spawnFish.textContent = randomFish;

    // Reset animation
    elements.spawnFish.classList.remove('catching');
}

function catchFish(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;
    if (gameState.fishCount >= CONFIG.maxFish) {
        alert('Tank is full! Clear some fish first.');
        return;
    }

    const fishEmoji = gameState.currentSpawnFish;

    // Animate catch
    elements.spawnFish.classList.add('catching');

    setTimeout(() => {
        // Add fish to tank
        addFishToTank(fishEmoji);

        // Spawn next fish
        spawnNewFish();
    }, 500);
}

function addFishToTank(fishEmoji) {
    // Create fish element
    const fish = document.createElement('div');
    fish.className = 'fish';
    fish.textContent = fishEmoji;

    // Random position
    const aquariumRect = elements.aquarium.getBoundingClientRect();
    const randomX = Math.random() * (aquariumRect.width - 50);
    const randomY = Math.random() * (aquariumRect.height - 50);

    fish.style.left = randomX + 'px';
    fish.style.top = randomY + 'px';

    // Random animation duration
    const duration = 5 + Math.random() * 10;
    fish.style.animationDuration = duration + 's';

    // Random direction
    if (Math.random() > 0.5) {
        fish.style.transform = 'scaleX(-1)';
    }

    // Add to container
    elements.fishContainer.appendChild(fish);

    // Track fish
    gameState.fishInTank.push({
        element: fish,
        emoji: fishEmoji
    });

    // Update counts
    gameState.fishCount++;

    // Calculate points
    let points = CONFIG.points.common;
    if (FISH_CATEGORIES.rare.includes(fishEmoji)) {
        points = CONFIG.points.rare;
    } else if (FISH_CATEGORIES.special.includes(fishEmoji)) {
        points = CONFIG.points.special;
    }

    gameState.score += points;

    // Make fish draggable
    makeDraggable(fish);

    updateUI();
}

// === Draggable Fish ===
function makeDraggable(fish) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    function dragStart(e) {
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - fish.offsetLeft;
            initialY = e.touches[0].clientY - fish.offsetTop;
        } else {
            initialX = e.clientX - fish.offsetLeft;
            initialY = e.clientY - fish.offsetTop;
        }

        isDragging = true;
        fish.style.animation = 'none';
    }

    function drag(e) {
        if (!isDragging) return;

        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        // Keep within bounds
        const aquariumRect = elements.aquarium.getBoundingClientRect();
        const maxX = aquariumRect.width - fish.offsetWidth;
        const maxY = aquariumRect.height - fish.offsetHeight;

        currentX = Math.max(0, Math.min(currentX, maxX));
        currentY = Math.max(0, Math.min(currentY, maxY));

        fish.style.left = currentX + 'px';
        fish.style.top = currentY + 'px';
    }

    function dragEnd() {
        isDragging = false;

        // Resume animation
        const duration = 5 + Math.random() * 10;
        fish.style.animation = `swim ${duration}s ease-in-out infinite`;
    }

    fish.addEventListener('touchstart', dragStart);
    fish.addEventListener('mousedown', dragStart);

    document.addEventListener('touchmove', drag);
    document.addEventListener('mousemove', drag);

    fish.addEventListener('touchend', dragEnd);
    document.addEventListener('mouseup', dragEnd);
}

// === Bubbles ===
function startBubbles() {
    gameState.bubbleInterval = setInterval(() => {
        if (gameState.isPlaying) {
            createBubble();
        }
    }, CONFIG.bubbleInterval);

    // Create initial bubbles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createBubble(), i * 200);
    }
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Random horizontal position
    const aquariumRect = elements.aquarium.getBoundingClientRect();
    const randomX = Math.random() * aquariumRect.width;
    bubble.style.left = randomX + 'px';

    // Random size
    const size = 5 + Math.random() * 10;
    bubble.style.width = size + 'px';
    bubble.style.height = size + 'px';

    // Random duration
    const duration = 3 + Math.random() * 4;
    bubble.style.animationDuration = duration + 's';

    // Add to container
    elements.bubblesContainer.appendChild(bubble);

    // Remove after animation
    setTimeout(() => {
        bubble.remove();
    }, duration * 1000);
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.fishCount.textContent = gameState.fishCount;
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container') && !e.target.classList.contains('fish')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
