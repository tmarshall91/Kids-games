'use strict';

// === Configuration ===
const CONFIG = {
    rows: 6,
    cols: 7,
    connectLength: 4
};

// === State Management ===
let gameState = {
    board: [],
    currentPlayer: 'red',
    isPlaying: true,
    playerColor: 'red',
    computerColor: 'yellow'
};

// === DOM References ===
const elements = {
    board: document.getElementById('game-board'),
    currentPlayer: document.getElementById('current-player'),
    restartBtn: document.getElementById('restart-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameResult: document.getElementById('game-result')
};

// === Initialization ===
function initGame() {
    createBoard();
    setupEventListeners();
    resetGame();
}

function createBoard() {
    elements.board.innerHTML = '';
    gameState.board = [];

    for (let row = 0; row < CONFIG.rows; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < CONFIG.cols; col++) {
            gameState.board[row][col] = null;

            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            elements.board.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    elements.board.addEventListener('click', handleBoardClick);
    elements.board.addEventListener('touchend', handleBoardTouch);

    elements.restartBtn.addEventListener('click', resetGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetGame();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverModal.style.display = 'none';
        resetGame();
    });
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.gameOverModal.style.display = 'none';
        resetGame();
    });
}

function handleBoardTouch(e) {
    e.preventDefault();
    if (e.target.classList.contains('cell')) {
        const col = parseInt(e.target.dataset.col);
        handleMove(col);
    }
}

function handleBoardClick(e) {
    if (e.target.classList.contains('cell')) {
        const col = parseInt(e.target.dataset.col);
        handleMove(col);
    }
}

// === Game Logic ===
function handleMove(col) {
    if (!gameState.isPlaying || gameState.currentPlayer !== 'red') {
        return;
    }

    const row = dropPiece(col, 'red');
    if (row === -1) return; // Column full

    updateCell(row, col, 'red');

    if (checkWinner(row, col, 'red')) {
        endGame('red');
        return;
    }

    if (isBoardFull()) {
        endGame('tie');
        return;
    }

    // Computer's turn
    gameState.currentPlayer = 'yellow';
    updateDisplay();

    setTimeout(() => {
        computerMove();
    }, 500);
}

function dropPiece(col, color) {
    // Find the lowest empty row in the column
    for (let row = CONFIG.rows - 1; row >= 0; row--) {
        if (gameState.board[row][col] === null) {
            gameState.board[row][col] = color;
            return row;
        }
    }
    return -1; // Column is full
}

function computerMove() {
    if (!gameState.isPlaying) return;

    // Try to win
    let col = findWinningMove('yellow');

    // Block player from winning
    if (col === -1) {
        col = findWinningMove('red');
    }

    // Take center column if available
    if (col === -1 && canDropInColumn(3)) {
        col = 3;
    }

    // Random move
    if (col === -1) {
        const availableCols = [];
        for (let c = 0; c < CONFIG.cols; c++) {
            if (canDropInColumn(c)) {
                availableCols.push(c);
            }
        }
        if (availableCols.length > 0) {
            col = availableCols[Math.floor(Math.random() * availableCols.length)];
        }
    }

    if (col !== -1) {
        const row = dropPiece(col, 'yellow');
        if (row !== -1) {
            updateCell(row, col, 'yellow');

            if (checkWinner(row, col, 'yellow')) {
                endGame('yellow');
                return;
            }

            if (isBoardFull()) {
                endGame('tie');
                return;
            }

            gameState.currentPlayer = 'red';
            updateDisplay();
        }
    }
}

function canDropInColumn(col) {
    return gameState.board[0][col] === null;
}

function findWinningMove(color) {
    for (let col = 0; col < CONFIG.cols; col++) {
        if (!canDropInColumn(col)) continue;

        // Simulate drop
        const row = getNextRow(col);
        if (row === -1) continue;

        gameState.board[row][col] = color;

        if (checkWinner(row, col, color)) {
            gameState.board[row][col] = null; // Undo
            return col;
        }

        gameState.board[row][col] = null; // Undo
    }
    return -1;
}

function getNextRow(col) {
    for (let row = CONFIG.rows - 1; row >= 0; row--) {
        if (gameState.board[row][col] === null) {
            return row;
        }
    }
    return -1;
}

function checkWinner(row, col, color) {
    // Check horizontal
    if (checkDirection(row, col, 0, 1, color)) return true;
    // Check vertical
    if (checkDirection(row, col, 1, 0, color)) return true;
    // Check diagonal (down-right)
    if (checkDirection(row, col, 1, 1, color)) return true;
    // Check diagonal (down-left)
    if (checkDirection(row, col, 1, -1, color)) return true;

    return false;
}

function checkDirection(row, col, deltaRow, deltaCol, color) {
    let count = 1;
    const winningCells = [[row, col]];

    // Check forward
    let r = row + deltaRow;
    let c = col + deltaCol;
    while (r >= 0 && r < CONFIG.rows && c >= 0 && c < CONFIG.cols &&
           gameState.board[r][c] === color) {
        count++;
        winningCells.push([r, c]);
        r += deltaRow;
        c += deltaCol;
    }

    // Check backward
    r = row - deltaRow;
    c = col - deltaCol;
    while (r >= 0 && r < CONFIG.rows && c >= 0 && c < CONFIG.cols &&
           gameState.board[r][c] === color) {
        count++;
        winningCells.push([r, c]);
        r -= deltaRow;
        c -= deltaCol;
    }

    if (count >= CONFIG.connectLength) {
        // Highlight winning cells
        winningCells.forEach(([r, c]) => {
            const cell = getCellElement(r, c);
            cell.classList.add('winner');
        });
        return true;
    }

    return false;
}

function isBoardFull() {
    return gameState.board[0].every(cell => cell !== null);
}

function endGame(result) {
    gameState.isPlaying = false;

    let message;
    if (result === 'tie') {
        message = "It's a Tie! 🤝";
    } else if (result === 'red') {
        message = "🎉 You Win! 🎉";
    } else {
        message = "Computer Wins! 🤖";
    }

    elements.gameResult.textContent = message;
    setTimeout(() => {
        elements.gameOverModal.style.display = 'flex';
    }, 1000);
}

function resetGame() {
    gameState = {
        board: [],
        currentPlayer: 'red',
        isPlaying: true,
        playerColor: 'red',
        computerColor: 'yellow'
    };

    createBoard();
    updateDisplay();
}

// === Display Updates ===
function updateCell(row, col, color) {
    const cell = getCellElement(row, col);
    cell.classList.add(color, 'dropping');
}

function getCellElement(row, col) {
    return elements.board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function updateDisplay() {
    if (gameState.currentPlayer === 'red') {
        elements.currentPlayer.textContent = 'Your Turn (Red)';
    } else {
        elements.currentPlayer.textContent = 'Computer Turn (Yellow)';
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
