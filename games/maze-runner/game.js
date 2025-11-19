'use strict';

// === Configuration ===
const CONFIG = {
    cellSize: 40
};

// === Maze Templates ===
const MAZES = [
    {
        level: 1,
        size: 5,
        grid: [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ],
        start: { x: 1, y: 1 },
        goal: { x: 3, y: 3 }
    },
    {
        level: 2,
        size: 7,
        grid: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        start: { x: 1, y: 1 },
        goal: { x: 5, y: 5 }
    },
    {
        level: 3,
        size: 9,
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1]
        ],
        start: { x: 1, y: 1 },
        goal: { x: 7, y: 7 }
    }
];

// === State Management ===
let gameState = {
    currentLevel: 0,
    maze: null,
    playerPos: { x: 0, y: 0 },
    goalPos: { x: 0, y: 0 },
    moves: 0,
    visited: [],
    isPlaying: false,
    touchStartX: 0,
    touchStartY: 0
};

// === DOM References ===
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    levelComplete: document.getElementById('levelComplete'),
    gameComplete: document.getElementById('gameComplete'),
    controls: document.getElementById('controls'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    mazeContainer: document.getElementById('mazeContainer'),
    level: document.getElementById('level'),
    moves: document.getElementById('moves'),
    finalMoves: document.getElementById('finalMoves')
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

    elements.restartBtn.addEventListener('click', restartLevel);
    elements.restartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        restartLevel();
    });

    elements.newGameBtn.addEventListener('click', resetGame);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetGame();
    });

    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.nextLevelBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        nextLevel();
    });

    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetGame();
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Touch controls
    elements.mazeContainer.addEventListener('touchstart', handleTouchStart);
    elements.mazeContainer.addEventListener('touchend', handleTouchEnd);
}

// === Game Start ===
function startGame() {
    gameState.currentLevel = 0;
    loadLevel(0);

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    elements.controls.style.display = 'flex';
    elements.levelComplete.style.display = 'none';
    elements.gameComplete.style.display = 'none';
}

function loadLevel(levelIndex) {
    if (levelIndex >= MAZES.length) {
        endGame();
        return;
    }

    const maze = MAZES[levelIndex];
    gameState.maze = JSON.parse(JSON.stringify(maze.grid));
    gameState.playerPos = { ...maze.start };
    gameState.goalPos = { ...maze.goal };
    gameState.moves = 0;
    gameState.visited = [];
    gameState.isPlaying = true;

    updateStats();
    renderMaze();
}

// === Render Maze ===
function renderMaze() {
    const maze = gameState.maze;
    const size = maze.length;

    elements.mazeContainer.innerHTML = '';
    elements.mazeContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // Calculate cell size
    const maxSize = Math.min(400, window.innerWidth - 60);
    const cellSize = Math.floor(maxSize / size) - 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;

            if (maze[y][x] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
            }

            // Check if player position
            if (x === gameState.playerPos.x && y === gameState.playerPos.y) {
                cell.classList.add('player');
                cell.textContent = '🔵';
            }
            // Check if goal position
            else if (x === gameState.goalPos.x && y === gameState.goalPos.y) {
                cell.classList.add('goal');
                cell.textContent = '🎯';
            }
            // Check if visited
            else if (gameState.visited.some(v => v.x === x && v.y === y)) {
                cell.classList.add('visited');
            }

            elements.mazeContainer.appendChild(cell);
        }
    }
}

// === Movement ===
function movePlayer(dx, dy) {
    if (!gameState.isPlaying) return;

    const newX = gameState.playerPos.x + dx;
    const newY = gameState.playerPos.y + dy;

    // Check bounds
    if (newX < 0 || newX >= gameState.maze[0].length || newY < 0 || newY >= gameState.maze.length) {
        return;
    }

    // Check wall
    if (gameState.maze[newY][newX] === 1) {
        return;
    }

    // Mark current position as visited
    if (!gameState.visited.some(v => v.x === gameState.playerPos.x && v.y === gameState.playerPos.y)) {
        gameState.visited.push({ ...gameState.playerPos });
    }

    // Move player
    gameState.playerPos.x = newX;
    gameState.playerPos.y = newY;
    gameState.moves++;

    updateStats();
    renderMaze();

    // Check if reached goal
    if (newX === gameState.goalPos.x && newY === gameState.goalPos.y) {
        levelComplete();
    }
}

// === Keyboard Handler ===
function handleKeyPress(e) {
    if (!gameState.isPlaying) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            movePlayer(1, 0);
            break;
    }
}

// === Touch Handlers ===
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    gameState.touchStartX = touch.clientX;
    gameState.touchStartY = touch.clientY;
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - gameState.touchStartX;
    const dy = touch.clientY - gameState.touchStartY;

    const minSwipeDistance = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (Math.abs(dx) > minSwipeDistance) {
            movePlayer(dx > 0 ? 1 : -1, 0);
        }
    } else {
        // Vertical swipe
        if (Math.abs(dy) > minSwipeDistance) {
            movePlayer(0, dy > 0 ? 1 : -1);
        }
    }
}

// === Level Complete ===
function levelComplete() {
    gameState.isPlaying = false;

    elements.finalMoves.textContent = gameState.moves;

    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.levelComplete.style.display = 'block';
        elements.controls.style.display = 'none';
    }, 500);
}

// === Next Level ===
function nextLevel() {
    gameState.currentLevel++;
    loadLevel(gameState.currentLevel);

    elements.gameArea.style.display = 'flex';
    elements.levelComplete.style.display = 'none';
    elements.controls.style.display = 'flex';
}

// === Game Complete ===
function endGame() {
    elements.gameArea.style.display = 'none';
    elements.levelComplete.style.display = 'none';
    elements.gameComplete.style.display = 'block';
    elements.controls.style.display = 'none';
}

// === Restart Level ===
function restartLevel() {
    loadLevel(gameState.currentLevel);
}

// === Reset Game ===
function resetGame() {
    gameState.currentLevel = 0;
    startGame();
}

// === UI Updates ===
function updateStats() {
    elements.level.textContent = gameState.currentLevel + 1;
    elements.moves.textContent = gameState.moves;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
