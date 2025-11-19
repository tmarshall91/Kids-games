'use strict';

// === Configuration ===
const CONFIG = {
    boardSize: 8
};

// === State Management ===
let gameState = {
    board: [],
    currentPlayer: 'red',
    selectedPiece: null,
    validMoves: [],
    redCaptured: 0,
    whiteCaptured: 0,
    isPlaying: true
};

// === DOM References ===
const elements = {
    board: document.getElementById('game-board'),
    currentPlayer: document.getElementById('current-player'),
    captured: document.getElementById('captured'),
    restartBtn: document.getElementById('restart-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameResult: document.getElementById('game-result'),
    resultDetails: document.getElementById('result-details')
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

    for (let row = 0; row < CONFIG.boardSize; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < CONFIG.boardSize; col++) {
            const square = document.createElement('div');
            const isDark = (row + col) % 2 === 1;
            square.className = `square ${isDark ? 'dark' : 'light'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            if (isDark) {
                square.classList.add('playable');
            }

            elements.board.appendChild(square);
            gameState.board[row][col] = { piece: null, square: square };
        }
    }
}

function setupEventListeners() {
    elements.board.addEventListener('click', handleSquareClick);
    elements.board.addEventListener('touchend', handleSquareTouch);

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

function handleSquareTouch(e) {
    e.preventDefault();
    const target = e.target.closest('.square');
    if (target) {
        const row = parseInt(target.dataset.row);
        const col = parseInt(target.dataset.col);
        handleSquareClick({ target });
    }
}

function handleSquareClick(e) {
    const target = e.target.closest('.square');
    if (!target || !gameState.isPlaying || gameState.currentPlayer !== 'red') return;

    const row = parseInt(target.dataset.row);
    const col = parseInt(target.dataset.col);

    if (gameState.selectedPiece) {
        // Try to move selected piece
        if (isValidMove(row, col)) {
            movePiece(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col);
            clearSelection();
            checkGameOver();

            if (gameState.isPlaying) {
                gameState.currentPlayer = 'white';
                updateDisplay();
                setTimeout(computerMove, 500);
            }
        } else {
            clearSelection();
        }
    } else {
        // Select piece
        const piece = gameState.board[row][col].piece;
        if (piece && piece.color === 'red') {
            selectPiece(row, col);
        }
    }
}

// === Game Logic ===
function resetGame() {
    gameState = {
        board: gameState.board,
        currentPlayer: 'red',
        selectedPiece: null,
        validMoves: [],
        redCaptured: 0,
        whiteCaptured: 0,
        isPlaying: true
    };

    // Place pieces
    for (let row = 0; row < CONFIG.boardSize; row++) {
        for (let col = 0; col < CONFIG.boardSize; col++) {
            gameState.board[row][col].piece = null;

            // Place red pieces (bottom)
            if (row >= 5 && (row + col) % 2 === 1) {
                gameState.board[row][col].piece = { color: 'red', isKing: false };
            }

            // Place white pieces (top)
            if (row <= 2 && (row + col) % 2 === 1) {
                gameState.board[row][col].piece = { color: 'white', isKing: false };
            }
        }
    }

    updateDisplay();
}

function selectPiece(row, col) {
    gameState.selectedPiece = { row, col };
    gameState.validMoves = getValidMoves(row, col);

    // Highlight selected square
    gameState.board[row][col].square.classList.add('selected');

    // Highlight valid moves
    gameState.validMoves.forEach(move => {
        gameState.board[move.row][move.col].square.classList.add('valid-move');
    });
}

function clearSelection() {
    if (gameState.selectedPiece) {
        const { row, col } = gameState.selectedPiece;
        gameState.board[row][col].square.classList.remove('selected');
    }

    gameState.validMoves.forEach(move => {
        gameState.board[move.row][move.col].square.classList.remove('valid-move');
    });

    gameState.selectedPiece = null;
    gameState.validMoves = [];
}

function getValidMoves(row, col) {
    const moves = [];
    const piece = gameState.board[row][col].piece;
    if (!piece) return moves;

    const directions = [];
    if (piece.color === 'red' || piece.isKing) {
        directions.push([-1, -1], [-1, 1]); // Up-left, up-right
    }
    if (piece.color === 'white' || piece.isKing) {
        directions.push([1, -1], [1, 1]); // Down-left, down-right
    }

    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;

        // Regular move
        if (isInBounds(newRow, newCol) && !gameState.board[newRow][newCol].piece) {
            moves.push({ row: newRow, col: newCol, isCapture: false });
        }

        // Capture move
        const jumpRow = row + dRow * 2;
        const jumpCol = col + dCol * 2;
        if (isInBounds(jumpRow, jumpCol) &&
            gameState.board[newRow][newCol].piece &&
            gameState.board[newRow][newCol].piece.color !== piece.color &&
            !gameState.board[jumpRow][jumpCol].piece) {
            moves.push({ row: jumpRow, col: jumpCol, isCapture: true, captureRow: newRow, captureCol: newCol });
        }
    });

    return moves;
}

function isValidMove(row, col) {
    return gameState.validMoves.some(move => move.row === row && move.col === col);
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol].piece;
    const move = gameState.validMoves.find(m => m.row === toRow && m.col === toCol);

    // Handle capture
    if (move && move.isCapture) {
        gameState.board[move.captureRow][move.captureCol].piece = null;
        if (piece.color === 'red') {
            gameState.whiteCaptured++;
        } else {
            gameState.redCaptured++;
        }
    }

    // Move piece
    gameState.board[toRow][toCol].piece = piece;
    gameState.board[fromRow][fromCol].piece = null;

    // Check for king promotion
    if (piece.color === 'red' && toRow === 0) {
        piece.isKing = true;
    } else if (piece.color === 'white' && toRow === CONFIG.boardSize - 1) {
        piece.isKing = true;
    }

    updateDisplay();
}

function computerMove() {
    if (!gameState.isPlaying) return;

    const whitePieces = [];
    for (let row = 0; row < CONFIG.boardSize; row++) {
        for (let col = 0; col < CONFIG.boardSize; col++) {
            const piece = gameState.board[row][col].piece;
            if (piece && piece.color === 'white') {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) {
                    whitePieces.push({ row, col, moves });
                }
            }
        }
    }

    if (whitePieces.length === 0) {
        endGame('red');
        return;
    }

    // Prioritize captures
    let selectedPiece = whitePieces.find(p => p.moves.some(m => m.isCapture));
    if (!selectedPiece) {
        selectedPiece = whitePieces[Math.floor(Math.random() * whitePieces.length)];
    }

    const captureMoves = selectedPiece.moves.filter(m => m.isCapture);
    const move = captureMoves.length > 0 ?
        captureMoves[Math.floor(Math.random() * captureMoves.length)] :
        selectedPiece.moves[Math.floor(Math.random() * selectedPiece.moves.length)];

    gameState.validMoves = [move];
    movePiece(selectedPiece.row, selectedPiece.col, move.row, move.col);
    checkGameOver();

    if (gameState.isPlaying) {
        gameState.currentPlayer = 'red';
        updateDisplay();
    }
}

function isInBounds(row, col) {
    return row >= 0 && row < CONFIG.boardSize && col >= 0 && col < CONFIG.boardSize;
}

function checkGameOver() {
    const redPieces = countPieces('red');
    const whitePieces = countPieces('white');

    if (redPieces === 0) {
        endGame('white');
    } else if (whitePieces === 0) {
        endGame('red');
    }
}

function countPieces(color) {
    let count = 0;
    for (let row = 0; row < CONFIG.boardSize; row++) {
        for (let col = 0; col < CONFIG.boardSize; col++) {
            const piece = gameState.board[row][col].piece;
            if (piece && piece.color === color) {
                count++;
            }
        }
    }
    return count;
}

function endGame(winner) {
    gameState.isPlaying = false;

    if (winner === 'red') {
        elements.gameResult.textContent = '🎉 You Win! 🎉';
        elements.resultDetails.textContent = 'You captured all opponent pieces!';
    } else {
        elements.gameResult.textContent = 'Computer Wins!';
        elements.resultDetails.textContent = 'Computer captured all your pieces!';
    }

    setTimeout(() => {
        elements.gameOverModal.style.display = 'flex';
    }, 500);
}

// === Display Updates ===
function updateDisplay() {
    // Update board
    for (let row = 0; row < CONFIG.boardSize; row++) {
        for (let col = 0; col < CONFIG.boardSize; col++) {
            const square = gameState.board[row][col].square;
            const piece = gameState.board[row][col].piece;

            // Remove old piece
            const oldPiece = square.querySelector('.piece');
            if (oldPiece) {
                oldPiece.remove();
            }

            // Add new piece
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece ${piece.color}${piece.isKing ? ' king' : ''}`;
                square.appendChild(pieceElement);
            }
        }
    }

    // Update stats
    elements.currentPlayer.textContent = gameState.currentPlayer === 'red' ?
        'Your Turn (Red)' : 'Computer Turn (White)';
    elements.captured.textContent = `Red: ${gameState.whiteCaptured} | White: ${gameState.redCaptured}`;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
