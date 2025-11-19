'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 4,
    winTile: 2048
};

// === State Management ===
let gameState = {
    grid: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    won: false,
    moved: false
};

// === DOM References ===
const elements = {
    gameBoard: document.getElementById('gameBoard'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    newGameBtn: document.getElementById('newGameBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    winOverlay: document.getElementById('winOverlay'),
    winScore: document.getElementById('winScore'),
    continueBtn: document.getElementById('continueBtn'),
    newGameWinBtn: document.getElementById('newGameWinBtn')
};

// === Initialization ===
function initGame() {
    loadBestScore();
    setupEventListeners();
    newGame();
}

function newGame() {
    gameState.grid = createEmptyGrid();
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.won = false;
    updateScore();
    hideOverlays();

    // Add two initial tiles
    addRandomTile();
    addRandomTile();
    renderGrid();
}

function createEmptyGrid() {
    const grid = [];
    for (let i = 0; i < CONFIG.gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < CONFIG.gridSize; j++) {
            grid[i][j] = 0;
        }
    }
    return grid;
}

// === Grid Rendering ===
function renderGrid() {
    elements.gameBoard.innerHTML = '';

    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';

            const value = gameState.grid[i][j];
            if (value > 0) {
                tile.textContent = value;
                tile.classList.add(`tile-${value}`);
            }

            elements.gameBoard.appendChild(tile);
        }
    }
}

// === Tile Management ===
function addRandomTile() {
    const emptyCells = [];

    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            if (gameState.grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        gameState.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        return true;
    }
    return false;
}

// === Movement Logic ===
function move(direction) {
    if (gameState.gameOver) return;

    gameState.moved = false;
    const previousGrid = JSON.parse(JSON.stringify(gameState.grid));

    switch (direction) {
        case 'left':
            moveLeft();
            break;
        case 'right':
            moveRight();
            break;
        case 'up':
            moveUp();
            break;
        case 'down':
            moveDown();
            break;
    }

    // Check if grid changed
    if (hasGridChanged(previousGrid, gameState.grid)) {
        addRandomTile();
        renderGrid();

        if (!canMove()) {
            gameOver();
        }
    }
}

function moveLeft() {
    for (let i = 0; i < CONFIG.gridSize; i++) {
        let row = gameState.grid[i].filter(val => val !== 0);

        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                row.splice(j + 1, 1);
                gameState.score += row[j];
                gameState.moved = true;
            }
        }

        while (row.length < CONFIG.gridSize) {
            row.push(0);
        }

        gameState.grid[i] = row;
    }
}

function moveRight() {
    for (let i = 0; i < CONFIG.gridSize; i++) {
        let row = gameState.grid[i].filter(val => val !== 0);

        for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
                row[j] *= 2;
                row.splice(j - 1, 1);
                gameState.score += row[j];
                gameState.moved = true;
                j--;
            }
        }

        while (row.length < CONFIG.gridSize) {
            row.unshift(0);
        }

        gameState.grid[i] = row;
    }
}

function moveUp() {
    for (let j = 0; j < CONFIG.gridSize; j++) {
        let col = [];
        for (let i = 0; i < CONFIG.gridSize; i++) {
            if (gameState.grid[i][j] !== 0) {
                col.push(gameState.grid[i][j]);
            }
        }

        for (let i = 0; i < col.length - 1; i++) {
            if (col[i] === col[i + 1]) {
                col[i] *= 2;
                col.splice(i + 1, 1);
                gameState.score += col[i];
                gameState.moved = true;
            }
        }

        while (col.length < CONFIG.gridSize) {
            col.push(0);
        }

        for (let i = 0; i < CONFIG.gridSize; i++) {
            gameState.grid[i][j] = col[i];
        }
    }
}

function moveDown() {
    for (let j = 0; j < CONFIG.gridSize; j++) {
        let col = [];
        for (let i = 0; i < CONFIG.gridSize; i++) {
            if (gameState.grid[i][j] !== 0) {
                col.push(gameState.grid[i][j]);
            }
        }

        for (let i = col.length - 1; i > 0; i--) {
            if (col[i] === col[i - 1]) {
                col[i] *= 2;
                col.splice(i - 1, 1);
                gameState.score += col[i];
                gameState.moved = true;
                i--;
            }
        }

        while (col.length < CONFIG.gridSize) {
            col.unshift(0);
        }

        for (let i = 0; i < CONFIG.gridSize; i++) {
            gameState.grid[i][j] = col[i];
        }
    }
}

// === Game State Checks ===
function hasGridChanged(grid1, grid2) {
    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            if (grid1[i][j] !== grid2[i][j]) {
                return true;
            }
        }
    }
    return false;
}

function canMove() {
    // Check for empty cells
    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            if (gameState.grid[i][j] === 0) return true;
        }
    }

    // Check for possible merges
    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            const current = gameState.grid[i][j];
            if (j < CONFIG.gridSize - 1 && current === gameState.grid[i][j + 1]) return true;
            if (i < CONFIG.gridSize - 1 && current === gameState.grid[i + 1][j]) return true;
        }
    }

    return false;
}

function checkWin() {
    if (gameState.won) return;

    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            if (gameState.grid[i][j] === CONFIG.winTile) {
                gameState.won = true;
                showWinOverlay();
                return;
            }
        }
    }
}

// === Score Management ===
function updateScore() {
    elements.score.textContent = gameState.score;

    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        elements.best.textContent = gameState.bestScore;
        saveBestScore();
    }

    checkWin();
}

function saveBestScore() {
    try {
        localStorage.setItem('2048-best-score', gameState.bestScore);
    } catch (e) {
        console.log('Could not save best score');
    }
}

function loadBestScore() {
    try {
        const saved = localStorage.getItem('2048-best-score');
        gameState.bestScore = saved ? parseInt(saved) : 0;
        elements.best.textContent = gameState.bestScore;
    } catch (e) {
        gameState.bestScore = 0;
    }
}

// === Game Over ===
function gameOver() {
    gameState.gameOver = true;
    elements.finalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';
}

function showWinOverlay() {
    elements.winScore.textContent = gameState.score;
    elements.winOverlay.style.display = 'flex';
}

function hideOverlays() {
    elements.gameOverOverlay.style.display = 'none';
    elements.winOverlay.style.display = 'none';
}

function continueGame() {
    elements.winOverlay.style.display = 'none';
}

// === Event Handlers ===
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleKeydown(e) {
    if (gameState.gameOver) return;

    const keyMap = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowUp': 'up',
        'ArrowDown': 'down'
    };

    if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
        updateScore();
    }
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        move(deltaX > 0 ? 'right' : 'left');
    } else {
        // Vertical swipe
        move(deltaY > 0 ? 'down' : 'up');
    }

    updateScore();
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeydown);
    elements.gameBoard.addEventListener('touchstart', handleTouchStart, { passive: true });
    elements.gameBoard.addEventListener('touchend', handleTouchEnd);

    elements.newGameBtn.addEventListener('click', newGame);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        newGame();
    });

    elements.playAgainBtn.addEventListener('click', newGame);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        newGame();
    });

    elements.continueBtn.addEventListener('click', continueGame);
    elements.continueBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        continueGame();
    });

    elements.newGameWinBtn.addEventListener('click', newGame);
    elements.newGameWinBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        newGame();
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
