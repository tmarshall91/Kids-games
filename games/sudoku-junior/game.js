'use strict';

// === Configuration ===
const CONFIG = {
    maxMistakes: 3,
    hintsAvailable: 3
};

// === State Management ===
let gameState = {
    isPlaying: false,
    gridSize: 4,
    grid: [],
    solution: [],
    givenCells: [],
    selectedCell: null,
    mistakes: 0,
    hintsUsed: 0,
    startTime: null,
    timerInterval: null,
    elapsedTime: 0
};

// === DOM References ===
const elements = {
    sudokuGrid: document.getElementById('sudokuGrid'),
    numberPad: document.getElementById('numberPad'),
    gameMessage: document.getElementById('gameMessage'),
    timer: document.getElementById('timer'),
    mistakes: document.getElementById('mistakes'),
    hintBtn: document.getElementById('hintBtn'),
    checkBtn: document.getElementById('checkBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    finalTime: document.getElementById('finalTime'),
    finalMistakes: document.getElementById('finalMistakes'),
    rating: document.getElementById('rating'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Level selection
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(btn => {
        const selectLevel = (e) => {
            e.preventDefault();
            const size = parseInt(btn.dataset.size);
            startGame(size);
        };

        btn.addEventListener('click', selectLevel);
        btn.addEventListener('touchend', selectLevel);
    });

    // Control buttons
    elements.hintBtn.addEventListener('click', useHint);
    elements.hintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        useHint();
    });

    elements.checkBtn.addEventListener('click', checkSolution);
    elements.checkBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        checkSolution();
    });

    elements.newGameBtn.addEventListener('click', showLevelSelection);
    elements.newGameBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showLevelSelection();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        showLevelSelection();
    });
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.gameOverOverlay.style.display = 'none';
        showLevelSelection();
    });
}

// === Game Setup ===
function startGame(size) {
    gameState.gridSize = size;
    gameState.isPlaying = true;
    gameState.mistakes = 0;
    gameState.hintsUsed = 0;
    gameState.selectedCell = null;
    gameState.startTime = Date.now();
    gameState.elapsedTime = 0;

    elements.gameMessage.style.display = 'none';
    elements.hintBtn.style.display = 'inline-block';
    elements.checkBtn.style.display = 'inline-block';
    elements.newGameBtn.style.display = 'inline-block';

    generatePuzzle();
    renderGrid();
    renderNumberPad();
    startTimer();
    updateUI();
}

function showLevelSelection() {
    gameState.isPlaying = false;
    stopTimer();

    elements.gameMessage.style.display = 'block';
    elements.hintBtn.style.display = 'none';
    elements.checkBtn.style.display = 'none';
    elements.newGameBtn.style.display = 'none';
    elements.numberPad.style.display = 'none';
    elements.sudokuGrid.innerHTML = '';

    gameState.selectedCell = null;
}

// === Puzzle Generation ===
function generatePuzzle() {
    const size = gameState.gridSize;

    // Generate a complete valid solution
    gameState.solution = generateCompleteSudoku(size);

    // Create puzzle by removing some numbers
    gameState.grid = JSON.parse(JSON.stringify(gameState.solution));
    gameState.givenCells = [];

    const cellsToRemove = size === 4 ? 8 : 20; // Remove more cells for larger grid

    const allCells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            allCells.push({ row, col });
        }
    }

    // Shuffle and remove cells
    shuffleArray(allCells);
    for (let i = 0; i < cellsToRemove && i < allCells.length; i++) {
        const { row, col } = allCells[i];
        gameState.grid[row][col] = 0;
    }

    // Mark given cells
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (gameState.grid[row][col] !== 0) {
                gameState.givenCells.push(`${row},${col}`);
            }
        }
    }
}

function generateCompleteSudoku(size) {
    const grid = Array(size).fill(0).map(() => Array(size).fill(0));

    // Fill diagonal boxes first (they don't affect each other)
    const boxSize = size === 4 ? 2 : size === 6 ? 3 : 3;
    for (let box = 0; box < size; box += boxSize) {
        fillBox(grid, box, box, size, boxSize);
    }

    // Solve the rest
    solveSudoku(grid, size, boxSize);

    return grid;
}

function fillBox(grid, row, col, size, boxSize) {
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    shuffleArray(numbers);

    let num = 0;
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            grid[row + i][col + j] = numbers[num++];
        }
    }
}

function solveSudoku(grid, size, boxSize) {
    const emptyCell = findEmptyCell(grid, size);
    if (!emptyCell) return true; // Solved

    const [row, col] = emptyCell;
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    shuffleArray(numbers);

    for (const num of numbers) {
        if (isValidMove(grid, row, col, num, size, boxSize)) {
            grid[row][col] = num;

            if (solveSudoku(grid, size, boxSize)) {
                return true;
            }

            grid[row][col] = 0;
        }
    }

    return false;
}

function findEmptyCell(grid, size) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

function isValidMove(grid, row, col, num, size, boxSize) {
    // Check row
    for (let c = 0; c < size; c++) {
        if (grid[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < size; r++) {
        if (grid[r][col] === num) return false;
    }

    // Check box
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;

    for (let r = boxRow; r < boxRow + boxSize; r++) {
        for (let c = boxCol; c < boxCol + boxSize; c++) {
            if (grid[r][c] === num) return false;
        }
    }

    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === Grid Rendering ===
function renderGrid() {
    elements.sudokuGrid.innerHTML = '';
    elements.sudokuGrid.className = `sudoku-grid size-${gameState.gridSize}`;

    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            const value = gameState.grid[row][col];
            cell.textContent = value !== 0 ? value : '';

            if (gameState.givenCells.includes(`${row},${col}`)) {
                cell.classList.add('given');
            }

            cell.addEventListener('click', () => handleCellClick(row, col));
            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleCellClick(row, col);
            });

            elements.sudokuGrid.appendChild(cell);
        }
    }
}

function renderNumberPad() {
    elements.numberPad.innerHTML = '';
    elements.numberPad.style.display = 'grid';

    // Add number buttons
    for (let i = 1; i <= gameState.gridSize; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = i;

        btn.addEventListener('click', () => placeNumber(i));
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            placeNumber(i);
        });

        elements.numberPad.appendChild(btn);
    }

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'number-btn clear';
    clearBtn.textContent = '✖';

    clearBtn.addEventListener('click', () => placeNumber(0));
    clearBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        placeNumber(0);
    });

    elements.numberPad.appendChild(clearBtn);
}

// === Cell Interaction ===
function handleCellClick(row, col) {
    if (!gameState.isPlaying) return;
    if (gameState.givenCells.includes(`${row},${col}`)) return;

    // Update selection
    gameState.selectedCell = { row, col };

    // Update visual highlights
    const cells = elements.sudokuGrid.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
        cell.classList.remove('selected', 'highlighted');

        const cellRow = parseInt(cell.dataset.row);
        const cellCol = parseInt(cell.dataset.col);

        if (cellRow === row && cellCol === col) {
            cell.classList.add('selected');
        } else if (cellRow === row || cellCol === col) {
            cell.classList.add('highlighted');
        }
    });
}

function placeNumber(num) {
    if (!gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    if (gameState.givenCells.includes(`${row},${col}`)) return;

    gameState.grid[row][col] = num;

    // Check if correct
    const cell = getCellElement(row, col);
    cell.classList.remove('correct', 'incorrect');

    if (num !== 0) {
        if (num === gameState.solution[row][col]) {
            cell.classList.add('correct');
            // Check if puzzle completed
            setTimeout(checkCompletion, 300);
        } else {
            cell.classList.add('incorrect');
            gameState.mistakes++;
            updateUI();

            if (gameState.mistakes >= CONFIG.maxMistakes) {
                gameOver(false);
            }
        }
    }

    renderGrid();

    // Re-select the cell
    handleCellClick(row, col);
}

function getCellElement(row, col) {
    const index = row * gameState.gridSize + col;
    return elements.sudokuGrid.children[index];
}

// === Game Features ===
function useHint() {
    if (!gameState.isPlaying) return;
    if (gameState.hintsUsed >= CONFIG.hintsAvailable) {
        alert('No more hints available!');
        return;
    }

    // Find an empty cell and fill it
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            if (gameState.grid[row][col] === 0 ||
                gameState.grid[row][col] !== gameState.solution[row][col]) {
                gameState.grid[row][col] = gameState.solution[row][col];
                gameState.givenCells.push(`${row},${col}`);
                gameState.hintsUsed++;
                renderGrid();
                return;
            }
        }
    }
}

function checkSolution() {
    if (!gameState.isPlaying) return;

    let hasEmpty = false;
    let hasIncorrect = false;

    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            if (gameState.grid[row][col] === 0) {
                hasEmpty = true;
            } else if (gameState.grid[row][col] !== gameState.solution[row][col]) {
                hasIncorrect = true;
            }
        }
    }

    if (hasEmpty) {
        alert('Puzzle not complete yet!');
    } else if (hasIncorrect) {
        alert('Some numbers are incorrect. Keep trying!');
        gameState.mistakes++;
        updateUI();
    } else {
        gameOver(true);
    }
}

function checkCompletion() {
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            if (gameState.grid[row][col] !== gameState.solution[row][col]) {
                return;
            }
        }
    }

    // Puzzle completed!
    gameOver(true);
}

// === Timer ===
function startTimer() {
    stopTimer();
    gameState.timerInterval = setInterval(() => {
        gameState.elapsedTime = Date.now() - gameState.startTime;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    const seconds = Math.floor(gameState.elapsedTime / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    elements.timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// === UI Updates ===
function updateUI() {
    elements.mistakes.textContent = `${gameState.mistakes}/${CONFIG.maxMistakes}`;
    updateTimer();
}

// === Game Over ===
function gameOver(won) {
    gameState.isPlaying = false;
    stopTimer();

    elements.gameOverOverlay.style.display = 'flex';
    elements.gameOverTitle.textContent = won ? '🎉 Puzzle Complete!' : '😊 Try Again!';
    elements.finalTime.textContent = formatTime(gameState.elapsedTime);
    elements.finalMistakes.textContent = gameState.mistakes;

    // Calculate rating
    let stars = '⭐';
    if (won) {
        if (gameState.mistakes === 0 && gameState.hintsUsed === 0) {
            stars = '⭐⭐⭐';
        } else if (gameState.mistakes <= 1) {
            stars = '⭐⭐';
        }
    }

    elements.rating.textContent = stars;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
