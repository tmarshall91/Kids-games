'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    moveSpeed: 4,
    fuelDepletion: 0.15,
    hookSpeed: 300, // pixels per second
    rescueTargets: [
        { emoji: '🧑', points: 10, name: 'Person' },
        { emoji: '👨', points: 10, name: 'Man' },
        { emoji: '👩', points: 10, name: 'Woman' },
        { emoji: '👦', points: 15, name: 'Boy' },
        { emoji: '👧', points: 15, name: 'Girl' },
        { emoji: '🐕', points: 20, name: 'Dog' },
        { emoji: '🐈', points: 20, name: 'Cat' },
        { emoji: '🎒', points: 5, name: 'Backpack' },
    ],
    initialTargets: 8,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    rescued: 0,
    fuel: 100,
    isPlaying: false,
    helicopterX: 0,
    hookDeployed: false,
    hookLength: 0,
    targets: [],
    keys: {},
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    hookBtn: document.getElementById('hookBtn'),
    rescuedDisplay: document.getElementById('rescued'),
    fuelDisplay: document.getElementById('fuel'),
    scoreDisplay: document.getElementById('score'),
    finalRescuedDisplay: document.getElementById('finalRescued'),
    finalScoreDisplay: document.getElementById('finalScore'),
    missionRankDisplay: document.getElementById('missionRank'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameMessage: document.getElementById('gameMessage'),
    rescueMessage: document.getElementById('rescueMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    helicopter: document.getElementById('helicopter'),
    rescueHook: document.getElementById('rescueHook'),
    ground: document.getElementById('ground'),
    controlPad: document.getElementById('controlPad'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Helicopter Rescue initialized');
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

    // Control buttons
    setupControlButton(elements.leftBtn, 'left');
    setupControlButton(elements.rightBtn, 'right');

    // Hook button
    const hookPressHandler = (e) => {
        e.preventDefault();
        if (gameState.isPlaying) {
            toggleHook();
        }
    };
    elements.hookBtn.addEventListener('touchstart', hookPressHandler);
    elements.hookBtn.addEventListener('click', hookPressHandler);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
            if (e.key === ' ') {
                if (gameState.isPlaying) toggleHook();
            } else {
                gameState.keys[e.key] = true;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            gameState.keys[e.key] = false;
        }
    });

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function setupControlButton(button, direction) {
    const keyMap = {
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
    // Update helicopter position
    updateHelicopterPosition();

    // Deplete fuel
    gameState.fuel -= CONFIG.fuelDepletion * (deltaTime / 1000);
    if (gameState.fuel <= 0) {
        gameState.fuel = 0;
        endGame();
        return;
    }

    // Update hook
    if (gameState.hookDeployed) {
        updateHook(deltaTime);
    }

    // Check if all targets rescued
    if (gameState.targets.length === 0) {
        endGame();
    }

    updateDisplays();
}

function renderGame() {
    // Rendering is handled via DOM updates
}

// ==========================================
// HELICOPTER MOVEMENT
// ==========================================

function updateHelicopterPosition() {
    const gameAreaWidth = elements.gameArea.clientWidth;

    // Update position based on input
    if (gameState.keys['ArrowLeft']) {
        gameState.helicopterX -= CONFIG.moveSpeed;
    }
    if (gameState.keys['ArrowRight']) {
        gameState.helicopterX += CONFIG.moveSpeed;
    }

    // Clamp position
    const heliSize = 60;
    gameState.helicopterX = clamp(gameState.helicopterX, 0, gameAreaWidth - heliSize);

    // Update helicopter element position
    elements.helicopter.style.left = gameState.helicopterX + 'px';
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==========================================
// HOOK MECHANICS
// ==========================================

function toggleHook() {
    if (!gameState.hookDeployed) {
        deployHook();
    } else {
        retractHook();
    }
}

function deployHook() {
    gameState.hookDeployed = true;
    elements.rescueHook.style.display = 'block';
    updateHookPosition();
}

function retractHook() {
    gameState.hookDeployed = false;
    gameState.hookLength = 0;
    elements.rescueHook.style.display = 'none';
}

function updateHook(deltaTime) {
    const maxHookLength = elements.gameArea.clientHeight - 150; // Don't go past ground

    if (gameState.hookDeployed) {
        // Extend hook
        gameState.hookLength += (CONFIG.hookSpeed * deltaTime) / 1000;

        if (gameState.hookLength >= maxHookLength) {
            gameState.hookLength = maxHookLength;
        }

        updateHookPosition();
        checkHookCollision();
    }
}

function updateHookPosition() {
    const heliRect = elements.helicopter.getBoundingClientRect();
    const heliCenterX = gameState.helicopterX + 30; // Center of helicopter
    const heliBottomY = heliRect.top - elements.gameArea.getBoundingClientRect().top + 50;

    elements.rescueHook.style.left = heliCenterX + 'px';
    elements.rescueHook.style.top = heliBottomY + 'px';
    elements.rescueHook.style.height = gameState.hookLength + 'px';
}

function checkHookCollision() {
    const hookRect = elements.rescueHook.getBoundingClientRect();
    const hookBottom = hookRect.bottom;

    for (let i = gameState.targets.length - 1; i >= 0; i--) {
        const target = gameState.targets[i];
        const targetRect = target.element.getBoundingClientRect();

        // Check if hook tip touches target
        if (hookBottom >= targetRect.top &&
            hookBottom <= targetRect.bottom &&
            hookRect.left >= targetRect.left - 20 &&
            hookRect.right <= targetRect.right + 20) {
            rescueTarget(target, i);
            retractHook();
            break;
        }
    }
}

// ==========================================
// TARGET MANAGEMENT
// ==========================================

function spawnTargets() {
    const groundWidth = elements.ground.clientWidth;
    const spacing = groundWidth / (CONFIG.initialTargets + 1);

    for (let i = 0; i < CONFIG.initialTargets; i++) {
        const targetData = CONFIG.rescueTargets[Math.floor(Math.random() * CONFIG.rescueTargets.length)];
        const target = {
            data: targetData,
            element: createTargetElement(targetData.emoji),
        };

        gameState.targets.push(target);
        elements.ground.appendChild(target.element);

        // Position target
        const position = spacing * (i + 1);
        target.element.style.position = 'absolute';
        target.element.style.left = position + 'px';
    }
}

function createTargetElement(emoji) {
    const element = document.createElement('div');
    element.className = 'rescue-target';
    element.textContent = emoji;
    return element;
}

function rescueTarget(target, index) {
    gameState.rescued++;
    gameState.score += target.data.points;

    // Animate rescue
    target.element.classList.add('rescued');

    // Show rescue message
    showRescueMessage(target.data);

    // Remove after animation
    setTimeout(() => {
        target.element.remove();
        gameState.targets.splice(index, 1);
    }, 2000);
}

function showRescueMessage(targetData) {
    elements.rescueMessage.textContent = `${targetData.emoji} ${targetData.name} Rescued! +${targetData.points}`;
    elements.rescueMessage.classList.add('show');

    setTimeout(() => {
        elements.rescueMessage.classList.remove('show');
    }, 1500);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.rescued = 0;
    gameState.fuel = 100;
    gameState.hookDeployed = false;
    gameState.hookLength = 0;
    gameState.targets = [];
    gameState.keys = {};

    // Position helicopter
    const gameAreaWidth = elements.gameArea.clientWidth;
    gameState.helicopterX = gameAreaWidth / 2 - 30;
    elements.helicopter.style.left = gameState.helicopterX + 'px';
    elements.helicopter.classList.add('flying');

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.controlPad.style.display = 'flex';
    elements.restartBtn.style.display = 'inline-block';
    elements.rescueHook.style.display = 'none';

    // Spawn rescue targets
    spawnTargets();

    updateDisplays();

    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    console.log('Mission started');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.helicopter.classList.remove('flying');

    elements.finalRescuedDisplay.textContent = gameState.rescued;
    elements.finalScoreDisplay.textContent = gameState.score;

    // Determine rank
    const rank = getMissionRank(gameState.rescued);
    elements.missionRankDisplay.textContent = rank;

    if (gameState.rescued === CONFIG.initialTargets) {
        elements.gameOverTitle.textContent = 'Perfect Mission! 🎉🚁';
    } else if (gameState.fuel <= 0) {
        elements.gameOverTitle.textContent = 'Out of Fuel! ⛽';
    } else {
        elements.gameOverTitle.textContent = 'Mission Complete! 🚁';
    }

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Mission ended. Rescued:', gameState.rescued);
}

function getMissionRank(rescued) {
    if (rescued >= 8) return '🌟 Hero Pilot!';
    if (rescued >= 6) return '🏅 Expert Rescuer!';
    if (rescued >= 4) return '⭐ Skilled Pilot!';
    if (rescued >= 2) return '🎖️ Brave Rescuer!';
    return '🔰 Novice Pilot';
}

function resetGame() {
    gameState = {
        score: 0,
        rescued: 0,
        fuel: 100,
        isPlaying: false,
        helicopterX: 0,
        hookDeployed: false,
        hookLength: 0,
        targets: [],
        keys: {},
    };

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.controlPad.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.rescueHook.style.display = 'none';

    elements.helicopter.classList.remove('flying');

    updateDisplays();

    // Remove all targets
    const targets = elements.ground.querySelectorAll('.rescue-target');
    targets.forEach(target => target.remove());

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
    elements.rescuedDisplay.textContent = gameState.rescued;
    elements.fuelDisplay.textContent = Math.floor(gameState.fuel);
    elements.scoreDisplay.textContent = gameState.score;
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
