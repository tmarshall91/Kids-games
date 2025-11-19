'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const OBJECTS_TO_FIND = ['🐶', '🐱', '🦋', '🐝', '🦊', '🐰', '🐸', '🦆'];
const DECORATIONS = {
    trees: ['🌲', '🌳'],
    rocks: ['🪨'],
    flowers: ['🌸', '🌺', '🌻', '🌼'],
};

const CONFIG = {
    gameTime: 60, // seconds
    hintsAvailable: 3,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    objectsFound: 0,
    totalObjects: OBJECTS_TO_FIND.length,
    timeLeft: CONFIG.gameTime,
    timePassed: 0,
    isPlaying: false,
    hintsRemaining: CONFIG.hintsAvailable,
    foundObjects: new Set(),
    hiddenObjectPositions: [],
};

// Timer interval
let timerInterval;

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    hintBtn: document.getElementById('hintBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    foundDisplay: document.getElementById('found'),
    timerDisplay: document.getElementById('timer'),
    gameMessage: document.getElementById('gameMessage'),
    searchArea: document.getElementById('searchArea'),
    scene: document.getElementById('scene'),
    targets: document.getElementById('targets'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    finalFoundDisplay: document.getElementById('finalFound'),
    finalTimeDisplay: document.getElementById('finalTime'),
    finalMessage: document.getElementById('finalMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Hide and Seek initialized');
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStart);
    elements.startBtn.addEventListener('touchstart', handleStart);

    // Hint button
    elements.hintBtn.addEventListener('click', useHint);
    elements.hintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        useHint();
    });

    // Play again button
    elements.playAgainBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);

    // Scene click/touch
    elements.scene.addEventListener('click', handleSceneClick);
    elements.scene.addEventListener('touchstart', handleSceneTouch);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.objectsFound = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.timePassed = 0;
    gameState.hintsRemaining = CONFIG.hintsAvailable;
    gameState.foundObjects.clear();
    gameState.hiddenObjectPositions = [];

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.searchArea.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.hintBtn.style.display = 'inline-block';

    updateFoundDisplay();
    updateTimerDisplay();
    updateHintButton();

    // Setup scene
    setupScene();
    createTargetList();

    // Start timer
    startTimer();

    console.log('Game started');
}

function setupScene() {
    // Clear scene
    elements.scene.innerHTML = '';

    // Add grass
    const grass = document.createElement('div');
    grass.className = 'grass';
    elements.scene.appendChild(grass);

    // Add decorations
    addDecorations();

    // Hide objects
    hideObjects();
}

function addDecorations() {
    const sceneWidth = elements.scene.clientWidth;
    const sceneHeight = elements.scene.clientHeight;

    // Add trees
    for (let i = 0; i < 3; i++) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        tree.textContent = DECORATIONS.trees[Math.floor(Math.random() * DECORATIONS.trees.length)];
        tree.style.left = Math.random() * 80 + '%';
        tree.style.top = Math.random() * 40 + 20 + '%';
        elements.scene.appendChild(tree);
    }

    // Add rocks
    for (let i = 0; i < 2; i++) {
        const rock = document.createElement('div');
        rock.className = 'rock';
        rock.textContent = DECORATIONS.rocks[0];
        rock.style.left = Math.random() * 80 + '%';
        rock.style.bottom = Math.random() * 30 + 10 + '%';
        elements.scene.appendChild(rock);
    }

    // Add flowers
    for (let i = 0; i < 5; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = DECORATIONS.flowers[Math.floor(Math.random() * DECORATIONS.flowers.length)];
        flower.style.left = Math.random() * 90 + '%';
        flower.style.bottom = Math.random() * 25 + 5 + '%';
        elements.scene.appendChild(flower);
    }
}

function hideObjects() {
    const sceneWidth = elements.scene.clientWidth;
    const sceneHeight = elements.scene.clientHeight;

    OBJECTS_TO_FIND.forEach((emoji, index) => {
        const obj = document.createElement('div');
        obj.className = 'hidden-object';
        obj.textContent = emoji;
        obj.dataset.objectId = index;

        // Random position (avoiding top and bottom edges)
        const left = Math.random() * 85 + 5; // 5% to 90%
        const top = Math.random() * 70 + 15; // 15% to 85%

        obj.style.left = left + '%';
        obj.style.top = top + '%';

        elements.scene.appendChild(obj);

        // Store position for hints
        gameState.hiddenObjectPositions.push({
            element: obj,
            objectId: index,
            emoji: emoji,
        });
    });
}

function createTargetList() {
    elements.targets.innerHTML = '';

    OBJECTS_TO_FIND.forEach((emoji, index) => {
        const target = document.createElement('div');
        target.className = 'target-item';
        target.textContent = emoji;
        target.dataset.targetId = index;
        elements.targets.appendChild(target);
    });
}

function handleSceneClick(e) {
    if (!gameState.isPlaying) return;

    const rect = elements.scene.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    checkForObject(x, y, e.target);
    createClickEffect(x, y);
}

function handleSceneTouch(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    const rect = elements.scene.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    checkForObject(x, y, elementAtPoint);
    createClickEffect(x, y);
}

function checkForObject(x, y, target) {
    if (target.classList.contains('hidden-object')) {
        const objectId = parseInt(target.dataset.objectId);

        if (!gameState.foundObjects.has(objectId)) {
            foundObject(target, objectId);
        }
    }
}

function foundObject(element, objectId) {
    // Mark as found
    gameState.foundObjects.add(objectId);
    gameState.objectsFound++;

    // Reveal object
    element.classList.add('revealed');

    // Update target list
    const targetItem = elements.targets.querySelector(`[data-target-id="${objectId}"]`);
    if (targetItem) {
        targetItem.classList.add('found');
    }

    // Update display
    updateFoundDisplay();

    // Check if all found
    if (gameState.objectsFound === gameState.totalObjects) {
        setTimeout(() => {
            endGame(true);
        }, 500);
    }
}

function createClickEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = (x - 20) + 'px';
    effect.style.top = (y - 20) + 'px';

    elements.scene.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 600);
}

function useHint() {
    if (!gameState.isPlaying || gameState.hintsRemaining <= 0) return;

    // Find an unfound object
    const unfoundObjects = gameState.hiddenObjectPositions.filter(
        obj => !gameState.foundObjects.has(obj.objectId)
    );

    if (unfoundObjects.length > 0) {
        const randomObj = unfoundObjects[Math.floor(Math.random() * unfoundObjects.length)];

        // Temporarily show the object
        randomObj.element.classList.add('hint-active');

        setTimeout(() => {
            randomObj.element.classList.remove('hint-active');
        }, 1000);

        gameState.hintsRemaining--;
        updateHintButton();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        gameState.timePassed++;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function endGame(won) {
    gameState.isPlaying = false;
    stopTimer();

    // Reveal all objects
    gameState.hiddenObjectPositions.forEach(obj => {
        obj.element.classList.add('revealed');
    });

    // Update overlay
    elements.finalFoundDisplay.textContent = gameState.objectsFound;
    elements.finalTimeDisplay.textContent = gameState.timePassed;

    if (won) {
        elements.gameOverTitle.textContent = '🎉 All Found!';

        if (gameState.timePassed < 30) {
            elements.finalMessage.textContent = '⚡ Lightning fast! Amazing!';
        } else if (gameState.timePassed < 45) {
            elements.finalMessage.textContent = '🌟 Great job! Very quick!';
        } else {
            elements.finalMessage.textContent = '👍 Well done! You found them all!';
        }
    } else {
        elements.gameOverTitle.textContent = '⏰ Time\'s Up!';

        if (gameState.objectsFound >= 6) {
            elements.finalMessage.textContent = '👏 Almost there! Try again!';
        } else if (gameState.objectsFound >= 4) {
            elements.finalMessage.textContent = '😊 Good effort! Keep trying!';
        } else {
            elements.finalMessage.textContent = '💪 Don\'t give up! You can do it!';
        }
    }

    // Show overlay
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Found:', gameState.objectsFound);
}

function resetGame() {
    // Stop timer
    stopTimer();

    // Reset state
    gameState.objectsFound = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.timePassed = 0;
    gameState.isPlaying = false;
    gameState.hintsRemaining = CONFIG.hintsAvailable;
    gameState.foundObjects.clear();
    gameState.hiddenObjectPositions = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.searchArea.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.hintBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.scene.innerHTML = '';

    updateFoundDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateFoundDisplay() {
    elements.foundDisplay.textContent = `${gameState.objectsFound}/${gameState.totalObjects}`;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;
}

function updateHintButton() {
    if (gameState.hintsRemaining > 0) {
        elements.hintBtn.textContent = `💡 Hint (${gameState.hintsRemaining})`;
        elements.hintBtn.disabled = false;
    } else {
        elements.hintBtn.textContent = '💡 No Hints';
        elements.hintBtn.disabled = true;
        elements.hintBtn.style.opacity = '0.5';
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
