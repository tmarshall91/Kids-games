'use strict';

// === Configuration ===
const CONFIG = {
    differencesCount: 5,
    hintCooldown: 10000 // 10 seconds
};

// === Scene Templates ===
const SCENES = [
    {
        name: 'Geometric Shapes',
        elements: [
            { type: 'circle', color: '#FF6B6B', size: 60, x: 20, y: 20 },
            { type: 'square', color: '#4ECDC4', size: 50, x: 70, y: 30 },
            { type: 'circle', color: '#FFE66D', size: 40, x: 30, y: 70 },
            { type: 'triangle', color: '#95E1D3', size: 50, x: 60, y: 65 },
            { type: 'circle', color: '#F38181', size: 35, x: 15, y: 50 },
            { type: 'square', color: '#AA96DA', size: 45, x: 45, y: 15 },
            { type: 'circle', color: '#FCBAD3', size: 30, x: 80, y: 75 }
        ]
    },
    {
        name: 'Colorful Garden',
        elements: [
            { type: 'circle', color: '#FF6B9D', size: 50, x: 25, y: 25 },
            { type: 'circle', color: '#C44569', size: 40, x: 65, y: 20 },
            { type: 'square', color: '#FFA502', size: 45, x: 15, y: 60 },
            { type: 'circle', color: '#26de81', size: 55, x: 75, y: 70 },
            { type: 'triangle', color: '#4b7bec', size: 40, x: 50, y: 50 },
            { type: 'circle', color: '#fed330', size: 35, x: 40, y: 75 },
            { type: 'square', color: '#fc5c65', size: 38, x: 82, y: 40 }
        ]
    }
];

// === State Management ===
let gameState = {
    currentScene: null,
    differences: [],
    foundDifferences: [],
    startTime: null,
    timerInterval: null,
    lastHintTime: 0,
    isPlaying: false
};

// === DOM References ===
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    gameMessage: document.getElementById('gameMessage'),
    controls: document.getElementById('controls'),
    startBtn: document.getElementById('startBtn'),
    hintBtn: document.getElementById('hintBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    image1: document.getElementById('image1'),
    image2: document.getElementById('image2'),
    found: document.getElementById('found'),
    total: document.getElementById('total'),
    timer: document.getElementById('timer'),
    finalTime: document.getElementById('finalTime')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.hintBtn.addEventListener('click', showHint);
    elements.hintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showHint();
    });

    elements.newGameBtn.addEventListener('click', startGame);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });
}

// === Game Start ===
function startGame() {
    gameState.foundDifferences = [];
    gameState.isPlaying = true;
    gameState.lastHintTime = 0;

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'block';
    elements.controls.style.display = 'flex';
    elements.gameMessage.style.display = 'none';

    // Create scene
    createScene();
    startTimer();
    updateStats();
}

// === Scene Creation ===
function createScene() {
    // Select random scene
    const sceneTemplate = SCENES[Math.floor(Math.random() * SCENES.length)];
    gameState.currentScene = JSON.parse(JSON.stringify(sceneTemplate));

    // Create differences
    createDifferences();

    // Render both images
    renderImage(elements.image1, false);
    renderImage(elements.image2, true);

    // Update total
    elements.total.textContent = CONFIG.differencesCount;
}

// === Create Differences ===
function createDifferences() {
    const scene = gameState.currentScene;
    gameState.differences = [];

    // Select random elements to modify
    const availableIndices = [...Array(scene.elements.length).keys()];
    shuffleArray(availableIndices);

    for (let i = 0; i < CONFIG.differencesCount && i < availableIndices.length; i++) {
        const index = availableIndices[i];
        const element = scene.elements[index];

        // Create difference data
        const difference = {
            index: index,
            x: element.x,
            y: element.y,
            size: element.size,
            type: ['color', 'size', 'missing'][Math.floor(Math.random() * 3)]
        };

        gameState.differences.push(difference);
    }
}

// === Render Image ===
function renderImage(container, applyDifferences) {
    container.innerHTML = '';
    const scene = gameState.currentScene;
    const imageSize = container.offsetWidth;

    scene.elements.forEach((element, index) => {
        // Check if this element has a difference
        const diff = gameState.differences.find(d => d.index === index);
        const hasDifference = diff && applyDifferences;

        // Apply difference
        let el = { ...element };
        if (hasDifference) {
            if (diff.type === 'color') {
                // Change color
                const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
                el.color = colors.find(c => c !== element.color) || colors[0];
            } else if (diff.type === 'size') {
                // Change size
                el.size = element.size * 1.4;
            } else if (diff.type === 'missing') {
                // Skip this element (make it invisible)
                el.color = 'transparent';
            }
        }

        // Create element
        const div = document.createElement('div');
        div.className = `element ${el.type}`;
        div.style.backgroundColor = el.color;
        div.style.width = `${el.size}px`;
        div.style.height = `${el.size}px`;
        div.style.left = `${(el.x / 100) * imageSize}px`;
        div.style.top = `${(el.y / 100) * imageSize}px`;

        container.appendChild(div);

        // Add clickable difference area (only on image2)
        if (applyDifferences && diff) {
            const clickArea = document.createElement('div');
            clickArea.className = 'difference';
            clickArea.dataset.index = index;
            clickArea.style.width = `${el.size + 20}px`;
            clickArea.style.height = `${el.size + 20}px`;
            clickArea.style.left = `${(el.x / 100) * imageSize - 10}px`;
            clickArea.style.top = `${(el.y / 100) * imageSize - 10}px`;

            clickArea.addEventListener('click', () => handleDifferenceClick(index));
            clickArea.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleDifferenceClick(index);
            });

            container.appendChild(clickArea);
        }
    });
}

// === Difference Click Handler ===
function handleDifferenceClick(index) {
    if (!gameState.isPlaying) return;
    if (gameState.foundDifferences.includes(index)) return;

    // Mark as found
    gameState.foundDifferences.push(index);
    updateStats();

    // Visual feedback
    markDifferenceAsFound(index);

    // Check win
    if (gameState.foundDifferences.length === CONFIG.differencesCount) {
        endGame();
    }
}

// === Mark Difference as Found ===
function markDifferenceAsFound(index) {
    const difference = gameState.differences.find(d => d.index === index);
    if (!difference) return;

    // Add markers to both images
    [elements.image1, elements.image2].forEach(container => {
        const imageSize = container.offsetWidth;
        const marker = document.createElement('div');
        marker.className = 'found-marker';
        marker.style.left = `${(difference.x / 100) * imageSize - 17}px`;
        marker.style.top = `${(difference.y / 100) * imageSize - 17}px`;
        container.appendChild(marker);
    });

    // Update clickable area
    const clickArea = elements.image2.querySelector(`.difference[data-index="${index}"]`);
    if (clickArea) {
        clickArea.classList.add('found');
    }
}

// === Hint System ===
function showHint() {
    const now = Date.now();
    if (now - gameState.lastHintTime < CONFIG.hintCooldown) {
        const remaining = Math.ceil((CONFIG.hintCooldown - (now - gameState.lastHintTime)) / 1000);
        elements.hintBtn.textContent = `Wait ${remaining}s`;
        return;
    }

    // Find unfound difference
    const unfound = gameState.differences.find(d => !gameState.foundDifferences.includes(d.index));
    if (!unfound) return;

    // Highlight briefly
    const clickArea = elements.image2.querySelector(`.difference[data-index="${unfound.index}"]`);
    if (clickArea) {
        clickArea.style.background = 'rgba(255, 235, 59, 0.5)';
        clickArea.style.borderColor = '#FFC107';

        setTimeout(() => {
            clickArea.style.background = '';
            clickArea.style.borderColor = '';
        }, 1500);
    }

    gameState.lastHintTime = now;
    elements.hintBtn.textContent = '💡 Hint';
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;

    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Show completion message
    setTimeout(() => {
        elements.finalTime.textContent = elements.timer.textContent;
        elements.gameArea.style.display = 'none';
        elements.gameMessage.style.display = 'block';
    }, 1000);
}

// === Timer ===
function startTimer() {
    gameState.startTime = Date.now();

    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === UI Updates ===
function updateStats() {
    elements.found.textContent = `${gameState.foundDifferences.length}/${CONFIG.differencesCount}`;
}

// === Utility Functions ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
