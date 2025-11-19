'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    mazeSize: 9, // 9x9 grid
    wallDensity: 0.25, // 25% walls
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    moves: 0,
    seconds: 0,
    isPlaying: false,
    currentPlayer: 1, // 1 or 2
    player1Pos: { x: 0, y: 0 },
    player2Pos: { x: 0, y: 0 },
    goalPos: { x: 0, y: 0 },
    maze: [],
    visitedCells: new Set(),
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    upBtn: document.getElementById('upBtn'),
    downBtn: document.getElementById('downBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),

    // Display elements
    movesDisplay: document.getElementById('moves'),
    timerDisplay: document.getElementById('timer'),
    finalMovesDisplay: document.getElementById('finalMoves'),
    finalTimeDisplay: document.getElementById('finalTime'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    mazeContainer: document.getElementById('mazeContainer'),
    mazeGrid: document.getElementById('mazeGrid'),
    directionPad: document.getElementById('directionPad'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Cooperative Maze initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Direction buttons
    elements.upBtn.addEventListener('touchstart', (e) => handleMove(e, 'up'));
    elements.upBtn.addEventListener('click', (e) => handleMove(e, 'up'));

    elements.downBtn.addEventListener('touchstart', (e) => handleMove(e, 'down'));
    elements.downBtn.addEventListener('click', (e) => handleMove(e, 'down'));

    elements.leftBtn.addEventListener('touchstart', (e) => handleMove(e, 'left'));
    elements.leftBtn.addEventListener('click', (e) => handleMove(e, 'left'));

    elements.rightBtn.addEventListener('touchstart', (e) => handleMove(e, 'right'));
    elements.rightBtn.addEventListener('click', (e) => handleMove(e, 'right'));

    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);

    // Touch swipe controls
    let touchStartX = 0;
    let touchStartY = 0;

    elements.mazeGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    elements.mazeGrid.addEventListener('touchend', (e) => {
        if (!gameState.isPlaying) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 30) {
                handleMove(e, 'right');
            } else if (deltaX < -30) {
                handleMove(e, 'left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 30) {
                handleMove(e, 'down');
            } else if (deltaY < -30) {
                handleMove(e, 'up');
            }
        }
    });
}

// ==========================================
// MAZE GENERATION
// ==========================================

function generateMaze() {
    const size = CONFIG.mazeSize;
    gameState.maze = [];

    // Initialize maze with paths
    for (let y = 0; y < size; y++) {
        gameState.maze[y] = [];
        for (let x = 0; x < size; x++) {
            gameState.maze[y][x] = 'path';
        }
    }

    // Add random walls
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (Math.random() < CONFIG.wallDensity) {
                gameState.maze[y][x] = 'wall';
            }
        }
    }

    // Ensure start positions are clear
    gameState.player1Pos = { x: 0, y: 0 };
    gameState.player2Pos = { x: 1, y: 0 };
    gameState.maze[0][0] = 'path';
    gameState.maze[0][1] = 'path';

    // Set goal in bottom right area
    gameState.goalPos = { x: size - 1, y: size - 1 };
    gameState.maze[size - 1][size - 1] = 'path';

    // Clear some paths to goal
    for (let i = 0; i < 3; i++) {
        const x = size - 1 - i;
        const y = size - 1 - i;
        if (x >= 0) gameState.maze[size - 1][x] = 'path';
        if (y >= 0) gameState.maze[y][size - 1] = 'path';
    }

    gameState.visitedCells.clear();
    gameState.visitedCells.add(`0,0`);
    gameState.visitedCells.add(`1,0`);

    renderMaze();
}

function renderMaze() {
    elements.mazeGrid.innerHTML = '';
    elements.mazeGrid.style.gridTemplateColumns = `repeat(${CONFIG.mazeSize}, 1fr)`;

    for (let y = 0; y < CONFIG.mazeSize; y++) {
        for (let x = 0; x < CONFIG.mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Check cell type
            if (gameState.maze[y][x] === 'wall') {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');

                // Mark visited cells
                if (gameState.visitedCells.has(`${x},${y}`)) {
                    cell.classList.add('visited');
                }
            }

            // Check if goal
            if (x === gameState.goalPos.x && y === gameState.goalPos.y) {
                cell.classList.add('goal');
                cell.textContent = '🎯';
            }

            // Check if player 1
            if (x === gameState.player1Pos.x && y === gameState.player1Pos.y) {
                cell.classList.add('player1');
                cell.textContent = '🔵';
            }

            // Check if player 2
            if (x === gameState.player2Pos.x && y === gameState.player2Pos.y) {
                cell.classList.add('player2');
                cell.textContent = '🔴';
            }

            elements.mazeGrid.appendChild(cell);
        }
    }
}

// ==========================================
// MOVEMENT HANDLING
// ==========================================

function handleMove(e, direction) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const player = gameState.currentPlayer === 1 ? gameState.player1Pos : gameState.player2Pos;
    let newX = player.x;
    let newY = player.y;

    // Calculate new position
    switch (direction) {
        case 'up':
            newY = Math.max(0, player.y - 1);
            break;
        case 'down':
            newY = Math.min(CONFIG.mazeSize - 1, player.y + 1);
            break;
        case 'left':
            newX = Math.max(0, player.x - 1);
            break;
        case 'right':
            newX = Math.min(CONFIG.mazeSize - 1, player.x + 1);
            break;
    }

    // Check if move is valid (not a wall)
    if (gameState.maze[newY][newX] === 'wall') {
        return; // Invalid move
    }

    // Update player position
    player.x = newX;
    player.y = newY;

    // Mark cell as visited
    gameState.visitedCells.add(`${newX},${newY}`);

    // Increment moves
    gameState.moves++;
    updateMovesDisplay();

    // Switch player for next turn
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;

    // Re-render maze
    renderMaze();

    // Check if both players reached goal
    if (checkWinCondition()) {
        setTimeout(() => {
            endGame();
        }, 500);
    }
}

function handleKeyPress(e) {
    if (!gameState.isPlaying) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            handleMove(e, 'up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            handleMove(e, 'down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            handleMove(e, 'left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            handleMove(e, 'right');
            break;
    }
}

function checkWinCondition() {
    return (
        gameState.player1Pos.x === gameState.goalPos.x &&
        gameState.player1Pos.y === gameState.goalPos.y &&
        gameState.player2Pos.x === gameState.goalPos.x &&
        gameState.player2Pos.y === gameState.goalPos.y
    );
}

// ==========================================
// GAME TIMER
// ==========================================

let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.moves = 0;
    gameState.seconds = 0;
    gameState.currentPlayer = 1;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.mazeContainer.style.display = 'flex';
    elements.directionPad.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateMovesDisplay();
    updateTimerDisplay();

    // Generate and display maze
    generateMaze();

    // Start timer
    startTimer();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Show game over overlay
    elements.finalMovesDisplay.textContent = gameState.moves;
    elements.finalTimeDisplay.textContent = formatTime(gameState.seconds);
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Moves:', gameState.moves, 'Time:', gameState.seconds);
}

function resetGame() {
    gameState.moves = 0;
    gameState.seconds = 0;
    gameState.isPlaying = false;
    gameState.currentPlayer = 1;
    gameState.maze = [];
    gameState.visitedCells.clear();

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.mazeContainer.style.display = 'none';
    elements.directionPad.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateMovesDisplay();
    updateTimerDisplay();

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

function updateMovesDisplay() {
    elements.movesDisplay.textContent = gameState.moves;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = formatTime(gameState.seconds);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    stopTimer();
});
