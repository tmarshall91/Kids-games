'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    cellSize: 50,
    gridSize: 7
};

// Maze layouts for different levels
const MAZES = [
    // Level 1 - Easy
    {
        walls: [
            {x: 1, y: 0, w: 1, h: 3}, {x: 3, y: 1, w: 1, h: 3}, {x: 5, y: 2, w: 1, h: 3},
            {x: 2, y: 4, w: 2, h: 1}, {x: 0, y: 5, w: 3, h: 1}
        ],
        start: {x: 0, y: 0},
        goal: {x: 6, y: 6}
    },
    // Level 2
    {
        walls: [
            {x: 1, y: 1, w: 2, h: 1}, {x: 4, y: 1, w: 2, h: 1}, {x: 2, y: 2, w: 1, h: 3},
            {x: 4, y: 3, w: 1, h: 2}, {x: 0, y: 4, w: 2, h: 1}, {x: 5, y: 4, w: 2, h: 1}
        ],
        start: {x: 0, y: 0},
        goal: {x: 6, y: 6}
    },
    // Level 3
    {
        walls: [
            {x: 1, y: 0, w: 1, h: 4}, {x: 3, y: 1, w: 1, h: 4}, {x: 5, y: 0, w: 1, h: 4},
            {x: 0, y: 5, w: 3, h: 1}, {x: 4, y: 5, w: 3, h: 1}
        ],
        start: {x: 0, y: 0},
        goal: {x: 6, y: 6}
    }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    level: 1,
    timeElapsed: 0,
    isPlaying: false,
    fishPos: {x: 0, y: 0},
    goalPos: {x: 6, y: 6},
    walls: []
};

let gameTimer = null;

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    levelDisplay: document.getElementById('level'),
    timerDisplay: document.getElementById('timer'),
    completedLevel: document.getElementById('completedLevel'),
    completedTime: document.getElementById('completedTime'),
    gameMessage: document.getElementById('gameMessage'),
    mazeCanvas: document.getElementById('mazeCanvas'),
    directionControls: document.getElementById('directionControls'),
    levelCompleteOverlay: document.getElementById('levelCompleteOverlay'),
    gameArea: document.getElementById('gameArea'),
    fish: document.getElementById('fish'),
    goal: document.getElementById('goal')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Fish Swimming Maze initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.nextLevelBtn.addEventListener('touchstart', handleNextLevel);
    elements.nextLevelBtn.addEventListener('click', handleNextLevel);

    // Direction controls
    const dirBtns = document.querySelectorAll('.dir-btn');
    dirBtns.forEach(btn => {
        btn.addEventListener('touchstart', handleDirectionClick);
        btn.addEventListener('click', handleDirectionClick);
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.timeElapsed = 0;

    // Load current level maze
    loadLevel(gameState.level);

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.mazeCanvas.style.display = 'block';
    elements.directionControls.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateLevelDisplay();
    updateTimerDisplay();

    // Start timer
    gameTimer = setInterval(() => {
        if (gameState.isPlaying) {
            gameState.timeElapsed++;
            updateTimerDisplay();
        }
    }, 1000);

    console.log('Game started - Level', gameState.level);
}

function loadLevel(level) {
    const mazeIndex = (level - 1) % MAZES.length;
    const maze = MAZES[mazeIndex];

    // Set start and goal positions
    gameState.fishPos = {...maze.start};
    gameState.goalPos = {...maze.goal};

    // Clear existing walls
    elements.mazeCanvas.querySelectorAll('.wall').forEach(wall => wall.remove());
    elements.mazeCanvas.querySelectorAll('.coral').forEach(coral => coral.remove());

    // Create walls
    gameState.walls = [];
    maze.walls.forEach(wallData => {
        const wall = document.createElement('div');
        wall.className = 'wall';
        wall.style.left = (wallData.x * CONFIG.cellSize) + 'px';
        wall.style.top = (wallData.y * CONFIG.cellSize) + 'px';
        wall.style.width = (wallData.w * CONFIG.cellSize) + 'px';
        wall.style.height = (wallData.h * CONFIG.cellSize) + 'px';
        elements.mazeCanvas.appendChild(wall);

        gameState.walls.push(wallData);
    });

    // Add decorative coral
    addCoral();

    // Position fish and goal
    updateFishPosition();
    updateGoalPosition();
}

function addCoral() {
    const corals = ['🌿', '🪸', '🐚'];
    for (let i = 0; i < 5; i++) {
        const coral = document.createElement('div');
        coral.className = 'coral';
        coral.textContent = corals[Math.floor(Math.random() * corals.length)];
        coral.style.left = `${Math.random() * 90}%`;
        coral.style.top = `${Math.random() * 90}%`;
        elements.mazeCanvas.appendChild(coral);
    }
}

function levelComplete() {
    gameState.isPlaying = false;

    // Stop timer
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }

    // Show level complete overlay
    elements.completedLevel.textContent = gameState.level;
    elements.completedTime.textContent = gameState.timeElapsed;
    elements.levelCompleteOverlay.style.display = 'flex';

    console.log('Level', gameState.level, 'complete! Time:', gameState.timeElapsed);
}

function resetGame() {
    gameState.level = 1;
    gameState.timeElapsed = 0;
    gameState.isPlaying = false;

    // Stop timer
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.mazeCanvas.style.display = 'none';
    elements.directionControls.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.levelCompleteOverlay.style.display = 'none';

    updateLevelDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// MOVEMENT FUNCTIONS
// ==========================================

function moveFish(direction) {
    if (!gameState.isPlaying) return;

    const newPos = {...gameState.fishPos};

    switch (direction) {
        case 'up':
            newPos.y = Math.max(0, newPos.y - 1);
            break;
        case 'down':
            newPos.y = Math.min(CONFIG.gridSize - 1, newPos.y + 1);
            break;
        case 'left':
            newPos.x = Math.max(0, newPos.x - 1);
            break;
        case 'right':
            newPos.x = Math.min(CONFIG.gridSize - 1, newPos.x + 1);
            break;
    }

    // Check collision with walls
    if (checkWallCollision(newPos)) {
        return; // Can't move there
    }

    // Update position
    gameState.fishPos = newPos;
    updateFishPosition();

    // Check if reached goal
    if (gameState.fishPos.x === gameState.goalPos.x &&
        gameState.fishPos.y === gameState.goalPos.y) {
        levelComplete();
    }
}

function checkWallCollision(pos) {
    for (const wall of gameState.walls) {
        if (pos.x >= wall.x && pos.x < wall.x + wall.w &&
            pos.y >= wall.y && pos.y < wall.y + wall.h) {
            return true;
        }
    }
    return false;
}

function updateFishPosition() {
    elements.fish.style.left = (gameState.fishPos.x * CONFIG.cellSize + 5) + 'px';
    elements.fish.style.top = (gameState.fishPos.y * CONFIG.cellSize + 5) + 'px';
}

function updateGoalPosition() {
    elements.goal.style.left = (gameState.goalPos.x * CONFIG.cellSize + 5) + 'px';
    elements.goal.style.top = (gameState.goalPos.y * CONFIG.cellSize + 5) + 'px';
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

function handleNextLevel(e) {
    e.preventDefault();
    gameState.level++;
    elements.levelCompleteOverlay.style.display = 'none';
    startGame();
}

function handleDirectionClick(e) {
    e.preventDefault();
    const direction = e.currentTarget.dataset.direction;
    moveFish(direction);
}

function handleKeyPress(e) {
    if (!gameState.isPlaying) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            moveFish('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            moveFish('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            moveFish('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            moveFish('right');
            break;
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateLevelDisplay() {
    elements.levelDisplay.textContent = gameState.level;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeElapsed;
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
    if (gameTimer) {
        clearInterval(gameTimer);
    }
});
