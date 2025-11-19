'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 36, // 6x6 grid
    fossilsPerSite: 12,
    completeBonus: 100,
    fossilPoints: 10
};

// === Dinosaurs ===
const DINOSAURS = {
    brachio: { emoji: '🦕', name: 'Brachiosaurus', pieces: 3 },
    trex: { emoji: '🦖', name: 'T-Rex', pieces: 3 },
    tri: { emoji: '🦴', name: 'Triceratops', pieces: 3 },
    ptero: { emoji: '🐊', name: 'Pterodactyl', pieces: 3 }
};

// === State Management ===
let gameState = {
    score: 0,
    fossilCount: 0,
    isPlaying: false,
    grid: [],
    discoveredFossils: {
        brachio: 0,
        trex: 0,
        tri: 0,
        ptero: 0
    }
};

// === DOM References ===
const elements = {
    gridContainer: document.getElementById('gridContainer'),
    score: document.getElementById('score'),
    fossilCount: document.getElementById('fossilCount'),
    fossilDisplay: document.getElementById('fossilDisplay'),
    startBtn: document.getElementById('startBtn'),
    newSiteBtn: document.getElementById('newSiteBtn'),
    playBtn: document.getElementById('playBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    discoveryModal: document.getElementById('discoveryModal'),
    discoveredDino: document.getElementById('discoveredDino'),
    bonusPoints: document.getElementById('bonusPoints'),
    continueBtn: document.getElementById('continueBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Start buttons
    elements.startBtn.addEventListener('touchstart', startGame);
    elements.startBtn.addEventListener('click', startGame);

    elements.playBtn.addEventListener('touchstart', startGame);
    elements.playBtn.addEventListener('click', startGame);

    // New site button
    elements.newSiteBtn.addEventListener('touchstart', newSite);
    elements.newSiteBtn.addEventListener('click', newSite);

    // Continue button
    elements.continueBtn.addEventListener('touchstart', closeDiscovery);
    elements.continueBtn.addEventListener('click', closeDiscovery);
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    // Hide welcome overlay
    elements.welcomeOverlay.style.display = 'none';

    // Show new site button
    elements.startBtn.style.display = 'none';
    elements.newSiteBtn.style.display = 'block';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Create dig site
    createDigSite();
}

function newSite(e) {
    e.preventDefault();

    // Keep score and discovered fossils, just create new site
    createDigSite();
}

function resetGame() {
    gameState.score = 0;
    gameState.fossilCount = 0;
    gameState.discoveredFossils = {
        brachio: 0,
        trex: 0,
        tri: 0,
        ptero: 0
    };

    elements.gridContainer.innerHTML = '';
    elements.fossilDisplay.innerHTML = '';

    updateUI();
}

function createDigSite() {
    // Clear grid
    elements.gridContainer.innerHTML = '';
    gameState.grid = [];

    // Create array of fossil positions
    const fossilPositions = [];
    const dinoTypes = Object.keys(DINOSAURS);

    // Distribute fossils evenly
    for (let i = 0; i < CONFIG.fossilsPerSite; i++) {
        const dinoType = dinoTypes[i % dinoTypes.length];
        fossilPositions.push(dinoType);
    }

    // Shuffle positions
    const shuffledPositions = Array(CONFIG.gridSize).fill(null);
    const availableIndices = Array.from({ length: CONFIG.gridSize }, (_, i) => i);

    fossilPositions.forEach(dinoType => {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const position = availableIndices.splice(randomIndex, 1)[0];
        shuffledPositions[position] = dinoType;
    });

    // Create grid tiles
    for (let i = 0; i < CONFIG.gridSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'dig-tile dirt';
        tile.dataset.index = i;

        // Add event listeners
        tile.addEventListener('touchstart', handleDig);
        tile.addEventListener('click', handleDig);

        elements.gridContainer.appendChild(tile);

        // Store grid state
        gameState.grid.push({
            hasFossil: shuffledPositions[i] !== null,
            dinoType: shuffledPositions[i],
            dug: false
        });
    }
}

// === Digging ===
function handleDig(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const tileIndex = parseInt(e.currentTarget.dataset.index);
    const tile = gameState.grid[tileIndex];
    const tileElement = e.currentTarget;

    // Already dug
    if (tile.dug) return;

    // Mark as dug
    tile.dug = true;

    // Animate digging
    tileElement.classList.add('digging');

    setTimeout(() => {
        tileElement.classList.remove('digging');

        if (tile.hasFossil) {
            // Found a fossil!
            discoverFossil(tile, tileElement);
        } else {
            // Just dirt
            tileElement.classList.remove('dirt');
            tileElement.classList.add('dug');
        }
    }, 300);
}

function discoverFossil(tile, tileElement) {
    const dinoType = tile.dinoType;
    const dino = DINOSAURS[dinoType];

    // Update tile
    tileElement.classList.remove('dirt');
    tileElement.classList.add('fossil');
    tileElement.textContent = dino.emoji;

    // Update score and count
    gameState.score += CONFIG.fossilPoints;
    gameState.fossilCount++;
    gameState.discoveredFossils[dinoType]++;

    updateUI();
    updateFossilDisplay();

    // Check if dinosaur is complete
    if (gameState.discoveredFossils[dinoType] >= dino.pieces) {
        setTimeout(() => {
            showDiscovery(dinoType);
        }, 500);
    }
}

function showDiscovery(dinoType) {
    const dino = DINOSAURS[dinoType];

    // Show modal
    elements.discoveredDino.textContent = dino.emoji;
    elements.bonusPoints.textContent = '+' + CONFIG.completeBonus;
    elements.discoveryModal.style.display = 'flex';

    // Add bonus points
    gameState.score += CONFIG.completeBonus;
    updateUI();

    // Mark as complete in display
    const fossilItems = elements.fossilDisplay.querySelectorAll('.fossil-item');
    fossilItems.forEach(item => {
        if (item.dataset.type === dinoType) {
            item.classList.add('complete');
        }
    });
}

function closeDiscovery(e) {
    e.preventDefault();
    elements.discoveryModal.style.display = 'none';
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.fossilCount.textContent = gameState.fossilCount;
}

function updateFossilDisplay() {
    // Clear display
    elements.fossilDisplay.innerHTML = '';

    // Add fossil items
    Object.entries(DINOSAURS).forEach(([type, dino]) => {
        const count = gameState.discoveredFossils[type];

        if (count > 0) {
            const item = document.createElement('div');
            item.className = 'fossil-item';
            item.dataset.type = type;
            item.textContent = dino.emoji;

            // Add count badge
            const countBadge = document.createElement('div');
            countBadge.className = 'count';
            countBadge.textContent = count + '/' + dino.pieces;
            item.appendChild(countBadge);

            // Mark complete if all pieces found
            if (count >= dino.pieces) {
                item.classList.add('complete');
            }

            elements.fossilDisplay.appendChild(item);
        }
    });

    // Show message if no fossils yet
    if (gameState.fossilCount === 0) {
        const message = document.createElement('div');
        message.style.color = '#999';
        message.style.fontSize = '14px';
        message.textContent = 'No fossils discovered yet...';
        elements.fossilDisplay.appendChild(message);
    }
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
