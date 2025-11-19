'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    spawnInterval: 1500,
    bugDuration: 3500,
    maxBugsOnScreen: 4
};

const BUGS = [
    {emoji: '🐛', name: 'Caterpillar'},
    {emoji: '🦋', name: 'Butterfly'},
    {emoji: '🐝', name: 'Bee'},
    {emoji: '🐞', name: 'Ladybug'},
    {emoji: '🦗', name: 'Cricket'},
    {emoji: '🕷️', name: 'Spider'},
    {emoji: '🦟', name: 'Mosquito'},
    {emoji: '🪲', name: 'Beetle'},
    {emoji: '🪰', name: 'Fly'},
    {emoji: '🦂', name: 'Scorpion'}
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    isPlaying: false,
    collection: {},
    activeBugs: 0
};

let gameTimers = {
    spawnTimer: null
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    viewCollectionBtn: document.getElementById('viewCollectionBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    typesDisplay: document.getElementById('types'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalTypesDisplay: document.getElementById('finalTypes'),
    gameMessage: document.getElementById('gameMessage'),
    gardenScene: document.getElementById('gardenScene'),
    collectionDisplay: document.getElementById('collectionDisplay'),
    collectionGrid: document.getElementById('collectionGrid'),
    completeCollection: document.getElementById('completeCollection'),
    completeOverlay: document.getElementById('completeOverlay'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Bug Collection Game initialized');

    // Initialize collection
    BUGS.forEach(bug => {
        gameState.collection[bug.emoji] = 0;
    });

    setupEventListeners();
    createCollectionDisplay();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.viewCollectionBtn.addEventListener('touchstart', toggleCollection);
    elements.viewCollectionBtn.addEventListener('click', toggleCollection);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function createCollectionDisplay() {
    elements.collectionGrid.innerHTML = '';
    BUGS.forEach(bug => {
        const item = document.createElement('div');
        item.className = 'collection-item locked';
        item.dataset.bug = bug.emoji;
        item.textContent = '?';
        elements.collectionGrid.appendChild(item);
    });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.activeBugs = 0;

    // Reset collection
    BUGS.forEach(bug => {
        gameState.collection[bug.emoji] = 0;
    });

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.gardenScene.style.display = 'block';
    elements.collectionDisplay.style.display = 'block';
    elements.startBtn.style.display = 'none';
    elements.viewCollectionBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateTypesDisplay();
    createCollectionDisplay();

    // Add garden decorations
    createGarden();

    // Start spawning bugs
    spawnBug();
    gameTimers.spawnTimer = setInterval(() => {
        if (gameState.activeBugs < CONFIG.maxBugsOnScreen) {
            spawnBug();
        }
    }, CONFIG.spawnInterval);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timers
    if (gameTimers.spawnTimer) {
        clearInterval(gameTimers.spawnTimer);
        gameTimers.spawnTimer = null;
    }

    // Remove all bugs
    const bugs = elements.gardenScene.querySelectorAll('.bug');
    bugs.forEach(bug => bug.remove());

    // Show complete overlay
    const typesCollected = Object.values(gameState.collection).filter(count => count > 0).length;
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalTypesDisplay.textContent = typesCollected;

    // Show collected bugs
    elements.completeCollection.innerHTML = '';
    BUGS.forEach(bug => {
        if (gameState.collection[bug.emoji] > 0) {
            const bugEl = document.createElement('div');
            bugEl.textContent = bug.emoji;
            elements.completeCollection.appendChild(bugEl);
        }
    });

    elements.completeOverlay.style.display = 'flex';

    console.log('Game ended. Score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.isPlaying = false;
    gameState.activeBugs = 0;

    // Clear any existing timers
    if (gameTimers.spawnTimer) clearInterval(gameTimers.spawnTimer);

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.gardenScene.style.display = 'none';
    elements.gardenScene.innerHTML = '';
    elements.collectionDisplay.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.viewCollectionBtn.style.display = 'none';
    elements.completeOverlay.style.display = 'none';

    updateScoreDisplay();
    updateTypesDisplay();

    // Reset collection
    BUGS.forEach(bug => {
        gameState.collection[bug.emoji] = 0;
    });
    createCollectionDisplay();

    console.log('Game reset');
}

// ==========================================
// GARDEN & BUG FUNCTIONS
// ==========================================

function createGarden() {
    // Add flowers
    const flowers = ['🌸', '🌺', '🌻', '🌷'];
    for (let i = 0; i < 6; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.left = `${Math.random() * 90}%`;
        flower.style.top = `${Math.random() * 80 + 10}%`;
        elements.gardenScene.appendChild(flower);
    }

    // Add grass layer
    const grass = document.createElement('div');
    grass.className = 'grass';
    elements.gardenScene.appendChild(grass);
}

function spawnBug() {
    if (!gameState.isPlaying) return;

    const bug = randomItem(BUGS);
    const bugEl = document.createElement('div');
    bugEl.className = 'bug';
    bugEl.textContent = bug.emoji;
    bugEl.dataset.bugType = bug.emoji;

    // Random position
    const maxX = elements.gardenScene.clientWidth - 50;
    const maxY = elements.gardenScene.clientHeight - 50;
    bugEl.style.left = `${Math.random() * maxX}px`;
    bugEl.style.top = `${Math.random() * maxY}px`;

    // Add click/touch handler
    bugEl.addEventListener('touchstart', handleBugClick);
    bugEl.addEventListener('click', handleBugClick);

    elements.gardenScene.appendChild(bugEl);
    gameState.activeBugs++;

    // Auto-remove after duration
    setTimeout(() => {
        if (bugEl.parentElement && !bugEl.classList.contains('caught')) {
            bugEl.remove();
            gameState.activeBugs--;
        }
    }, CONFIG.bugDuration);
}

function handleBugClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const bugEl = e.currentTarget;
    const bugType = bugEl.dataset.bugType;

    // Mark as caught
    bugEl.classList.add('caught');
    gameState.activeBugs--;

    // Update collection
    gameState.collection[bugType]++;
    gameState.score++;

    updateScoreDisplay();
    updateTypesDisplay();
    updateCollectionDisplay();

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);

    // Remove bug after animation
    setTimeout(() => {
        bugEl.remove();
    }, 500);

    // Check if all types collected
    const typesCollected = Object.values(gameState.collection).filter(count => count > 0).length;
    if (typesCollected === BUGS.length) {
        setTimeout(() => endGame(), 1000);
    }
}

// ==========================================
// COLLECTION DISPLAY
// ==========================================

function updateCollectionDisplay() {
    BUGS.forEach(bug => {
        const item = elements.collectionGrid.querySelector(`[data-bug="${bug.emoji}"]`);
        if (gameState.collection[bug.emoji] > 0) {
            item.classList.remove('locked');
            item.textContent = bug.emoji;

            // Add count badge
            let countEl = item.querySelector('.count');
            if (!countEl) {
                countEl = document.createElement('span');
                countEl.className = 'count';
                item.appendChild(countEl);
            }
            countEl.textContent = gameState.collection[bug.emoji];
        }
    });
}

function toggleCollection(e) {
    e.preventDefault();
    const isVisible = elements.collectionDisplay.style.display !== 'none';
    elements.collectionDisplay.style.display = isVisible ? 'none' : 'block';
    elements.viewCollectionBtn.textContent = isVisible ? 'View Collection' : 'Hide Collection';
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

function updateTypesDisplay() {
    const typesCollected = Object.values(gameState.collection).filter(count => count > 0).length;
    elements.typesDisplay.textContent = `${typesCollected}/${BUGS.length}`;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get random item from array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameTimers.spawnTimer) {
        clearInterval(gameTimers.spawnTimer);
    }
});
