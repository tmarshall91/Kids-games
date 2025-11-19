'use strict';

// === Configuration ===
const WINNING_COMBINATIONS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal
    [2, 4, 6]  // Diagonal
];

// === State Management ===
let gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    isPlaying: true,
    mode: 'computer' // vs computer
};

// === DOM References ===
const elements = {
    cells: document.querySelectorAll('.cell'),
    currentPlayer: document.getElementById('current-player'),
    restartBtn: document.getElementById('restart-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameResult: document.getElementById('game-result')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    updateDisplay();
}

function setupEventListeners() {
    elements.cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('touchend', handleCellTouch);
    });

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

function handleCellTouch(e) {
    e.preventDefault();
    const index = parseInt(e.target.dataset.index);
    handleMove(index);
}

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);
    handleMove(index);
}

// === Game Logic ===
function handleMove(index) {
    if (!gameState.isPlaying || gameState.board[index] !== '' || gameState.currentPlayer === 'O') {
        return;
    }

    // Player move
    makeMove(index, 'X');
    updateDisplay();

    if (!gameState.isPlaying) return;

    // Check for winner or tie
    const winner = checkWinner();
    if (winner) {
        endGame(winner);
        return;
    }

    if (isBoardFull()) {
        endGame('tie');
        return;
    }

    // Computer's turn
    gameState.currentPlayer = 'O';
    updateDisplay();

    setTimeout(() => {
        computerMove();
    }, 500);
}

function makeMove(index, player) {
    gameState.board[index] = player;
    elements.cells[index].textContent = player;
    elements.cells[index].classList.add('taken', player.toLowerCase());
}

function computerMove() {
    if (!gameState.isPlaying) return;

    // Try to win
    let move = findWinningMove('O');

    // Block player from winning
    if (move === -1) {
        move = findWinningMove('X');
    }

    // Take center if available
    if (move === -1 && gameState.board[4] === '') {
        move = 4;
    }

    // Take a corner
    if (move === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => gameState.board[i] === '');
        if (availableCorners.length > 0) {
            move = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
    }

    // Take any available space
    if (move === -1) {
        const availableMoves = gameState.board
            .map((cell, index) => cell === '' ? index : -1)
            .filter(index => index !== -1);
        if (availableMoves.length > 0) {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }

    if (move !== -1) {
        makeMove(move, 'O');
        updateDisplay();

        const winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }

        if (isBoardFull()) {
            endGame('tie');
            return;
        }

        gameState.currentPlayer = 'X';
        updateDisplay();
    }
}

function findWinningMove(player) {
    for (let combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        const cells = [gameState.board[a], gameState.board[b], gameState.board[c]];

        // Check if two cells have the player's mark and one is empty
        const playerCells = cells.filter(cell => cell === player).length;
        const emptyCells = cells.filter(cell => cell === '').length;

        if (playerCells === 2 && emptyCells === 1) {
            if (gameState.board[a] === '') return a;
            if (gameState.board[b] === '') return b;
            if (gameState.board[c] === '') return c;
        }
    }
    return -1;
}

function checkWinner() {
    for (let combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        if (gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]) {
            // Highlight winning cells
            elements.cells[a].classList.add('winner');
            elements.cells[b].classList.add('winner');
            elements.cells[c].classList.add('winner');
            return gameState.board[a];
        }
    }
    return null;
}

function isBoardFull() {
    return gameState.board.every(cell => cell !== '');
}

function endGame(result) {
    gameState.isPlaying = false;

    let message;
    if (result === 'tie') {
        message = "It's a Tie! 🤝";
    } else if (result === 'X') {
        message = "🎉 You Win! 🎉";
    } else {
        message = "Computer Wins! 🤖";
    }

    elements.gameResult.textContent = message;
    setTimeout(() => {
        elements.gameOverModal.style.display = 'flex';
    }, 500);
}

function resetGame() {
    gameState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        isPlaying: true,
        mode: 'computer'
    };

    elements.cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    updateDisplay();
}

// === Display Updates ===
function updateDisplay() {
    if (gameState.currentPlayer === 'X') {
        elements.currentPlayer.textContent = 'Your Turn (X)';
    } else {
        elements.currentPlayer.textContent = 'Computer Turn (O)';
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
