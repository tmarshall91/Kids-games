'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 8,
    pointsPerBlock: 10,
    pointsPerLine: 100,
    pieces: [
        [[1]],
        [[1, 1]],
        [[1], [1]],
        [[1, 1, 1]],
        [[1], [1], [1]],
        [[1, 1], [1, 0]],
        [[1, 1], [0, 1]],
        [[1, 0], [1, 1]],
        [[0, 1], [1, 1]],
        [[1, 1], [1, 1]],
        [[1, 1, 1], [0, 1, 0]]
    ]
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    bestScore: 0,
    board: [],
    availablePieces: [],
    draggedPiece: null,
    previewPosition: null
};

// === DOM References ===
const elements = {
    gameBoard: document.getElementById('gameBoard'),
    availablePieces: document.getElementById('availablePieces'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameMessage: document.getElementById('gameMessage'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    newBestMessage: document.getElementById('newBestMessage'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    loadBestScore();
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', resetGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetGame();
    });

    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetGame();
    });
}

// === Game Setup ===
function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.board = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(0));
    gameState.availablePieces = [];

    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    createBoard();
    generateNewPieces();
    updateUI();
}

function createBoard() {
    elements.gameBoard.innerHTML = '';

    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            elements.gameBoard.appendChild(cell);
        }
    }

    // Add drag over and drop listeners
    elements.gameBoard.addEventListener('dragover', handleDragOver);
    elements.gameBoard.addEventListener('drop', handleDrop);
    elements.gameBoard.addEventListener('dragleave', clearPreview);

    // Touch events for board
    elements.gameBoard.addEventListener('touchmove', handleTouchMove);
    elements.gameBoard.addEventListener('touchend', handleTouchEnd);
}

function generateNewPieces() {
    gameState.availablePieces = [];

    for (let i = 0; i < 3; i++) {
        const shape = CONFIG.pieces[Math.floor(Math.random() * CONFIG.pieces.length)];
        gameState.availablePieces.push({
            shape: JSON.parse(JSON.stringify(shape)),
            id: Date.now() + i,
            used: false
        });
    }

    renderPieces();
}

function renderPieces() {
    elements.availablePieces.innerHTML = '';

    gameState.availablePieces.forEach(piece => {
        if (piece.used) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'piece-wrapper';

        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece';
        pieceDiv.draggable = true;
        pieceDiv.dataset.pieceId = piece.id;

        // Set up grid
        const rows = piece.shape.length;
        const cols = piece.shape[0].length;
        pieceDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Create cells
        piece.shape.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('div');
                if (cell === 1) {
                    cellDiv.className = 'piece-cell';
                }
                pieceDiv.appendChild(cellDiv);
            });
        });

        // Drag events
        pieceDiv.addEventListener('dragstart', handleDragStart);
        pieceDiv.addEventListener('dragend', handleDragEnd);

        // Touch events
        pieceDiv.addEventListener('touchstart', handleTouchStart);

        wrapper.appendChild(pieceDiv);
        elements.availablePieces.appendChild(wrapper);
    });

    // Check if game over
    if (!canPlaceAnyPiece()) {
        gameOver();
    }
}

// === Drag and Drop ===
function handleDragStart(e) {
    const pieceId = parseInt(e.target.dataset.pieceId);
    gameState.draggedPiece = gameState.availablePieces.find(p => p.id === pieceId);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    gameState.draggedPiece = null;
    clearPreview();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!gameState.draggedPiece) return;

    const cell = e.target.closest('.board-cell');
    if (!cell) {
        clearPreview();
        return;
    }

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    showPreview(row, col, gameState.draggedPiece.shape);
}

function handleDrop(e) {
    e.preventDefault();

    if (!gameState.draggedPiece || !gameState.previewPosition) return;

    const { row, col } = gameState.previewPosition;

    if (canPlacePiece(row, col, gameState.draggedPiece.shape)) {
        placePiece(row, col, gameState.draggedPiece);
        gameState.draggedPiece.used = true;
        checkAndClearLines();
        renderBoard();
        renderPieces();

        // Check if all pieces used
        if (gameState.availablePieces.every(p => p.used)) {
            generateNewPieces();
        }
    }

    clearPreview();
}

// === Touch Events ===
let touchPiece = null;
let touchClone = null;

function handleTouchStart(e) {
    e.preventDefault();
    const pieceId = parseInt(e.target.dataset.pieceId);
    touchPiece = gameState.availablePieces.find(p => p.id === pieceId);
    gameState.draggedPiece = touchPiece;

    // Create a visual clone for dragging
    touchClone = e.target.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.opacity = '0.7';
    touchClone.style.zIndex = '1000';
    document.body.appendChild(touchClone);

    updateTouchClonePosition(e.touches[0]);
}

function handleTouchMove(e) {
    e.preventDefault();

    if (!touchClone || !touchPiece) return;

    updateTouchClonePosition(e.touches[0]);

    // Find cell under touch
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = element?.closest('.board-cell');

    if (cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        showPreview(row, col, touchPiece.shape);
    } else {
        clearPreview();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();

    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }

    if (!touchPiece || !gameState.previewPosition) {
        touchPiece = null;
        gameState.draggedPiece = null;
        clearPreview();
        return;
    }

    const { row, col } = gameState.previewPosition;

    if (canPlacePiece(row, col, touchPiece.shape)) {
        placePiece(row, col, touchPiece);
        touchPiece.used = true;
        checkAndClearLines();
        renderBoard();
        renderPieces();

        // Check if all pieces used
        if (gameState.availablePieces.every(p => p.used)) {
            generateNewPieces();
        }
    }

    touchPiece = null;
    gameState.draggedPiece = null;
    clearPreview();
}

function updateTouchClonePosition(touch) {
    if (!touchClone) return;
    touchClone.style.left = `${touch.clientX - 30}px`;
    touchClone.style.top = `${touch.clientY - 30}px`;
}

// === Preview ===
function showPreview(row, col, shape) {
    clearPreview();

    if (!canPlacePiece(row, col, shape)) return;

    gameState.previewPosition = { row, col };

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const cell = getBoardCell(row + r, col + c);
                if (cell) {
                    cell.classList.add('preview');
                }
            }
        }
    }
}

function clearPreview() {
    gameState.previewPosition = null;
    const cells = elements.gameBoard.querySelectorAll('.board-cell.preview');
    cells.forEach(cell => cell.classList.remove('preview'));
}

// === Piece Placement ===
function canPlacePiece(row, col, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const boardRow = row + r;
                const boardCol = col + c;

                if (boardRow < 0 || boardRow >= CONFIG.gridSize ||
                    boardCol < 0 || boardCol >= CONFIG.gridSize ||
                    gameState.board[boardRow][boardCol] === 1) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(row, col, piece) {
    let blocksPlaced = 0;

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c] === 1) {
                gameState.board[row + r][col + c] = 1;
                blocksPlaced++;
            }
        }
    }

    gameState.score += blocksPlaced * CONFIG.pointsPerBlock;
    updateUI();
}

function canPlaceAnyPiece() {
    for (const piece of gameState.availablePieces) {
        if (piece.used) continue;

        for (let row = 0; row < CONFIG.gridSize; row++) {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                if (canPlacePiece(row, col, piece.shape)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// === Line Clearing ===
function checkAndClearLines() {
    const linesToClear = [];

    // Check rows
    for (let row = 0; row < CONFIG.gridSize; row++) {
        if (gameState.board[row].every(cell => cell === 1)) {
            linesToClear.push({ type: 'row', index: row });
        }
    }

    // Check columns
    for (let col = 0; col < CONFIG.gridSize; col++) {
        let full = true;
        for (let row = 0; row < CONFIG.gridSize; row++) {
            if (gameState.board[row][col] !== 1) {
                full = false;
                break;
            }
        }
        if (full) {
            linesToClear.push({ type: 'col', index: col });
        }
    }

    if (linesToClear.length > 0) {
        // Animate clearing
        animateClearing(linesToClear);

        // Clear lines
        linesToClear.forEach(line => {
            if (line.type === 'row') {
                gameState.board[line.index].fill(0);
            } else {
                for (let row = 0; row < CONFIG.gridSize; row++) {
                    gameState.board[row][line.index] = 0;
                }
            }
        });

        gameState.score += linesToClear.length * CONFIG.pointsPerLine;
        updateUI();
    }
}

function animateClearing(lines) {
    lines.forEach(line => {
        if (line.type === 'row') {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                const cell = getBoardCell(line.index, col);
                if (cell) cell.classList.add('clearing');
            }
        } else {
            for (let row = 0; row < CONFIG.gridSize; row++) {
                const cell = getBoardCell(row, line.index);
                if (cell) cell.classList.add('clearing');
            }
        }
    });

    setTimeout(() => {
        const cells = elements.gameBoard.querySelectorAll('.board-cell.clearing');
        cells.forEach(cell => cell.classList.remove('clearing'));
        renderBoard();
    }, 500);
}

// === Board Rendering ===
function renderBoard() {
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const cell = getBoardCell(row, col);
            if (cell) {
                if (gameState.board[row][col] === 1) {
                    cell.classList.add('filled');
                } else {
                    cell.classList.remove('filled');
                }
            }
        }
    }
}

function getBoardCell(row, col) {
    const index = row * CONFIG.gridSize + col;
    return elements.gameBoard.children[index];
}

// === Game State ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.best.textContent = gameState.bestScore;
}

function gameOver() {
    gameState.isPlaying = false;

    // Update best score
    if (gameState.score > gameState.bestScore) {
        gameState.bestScore = gameState.score;
        saveBestScore();
        elements.newBestMessage.style.display = 'block';
    } else {
        elements.newBestMessage.style.display = 'none';
    }

    elements.gameOverOverlay.style.display = 'flex';
    elements.finalScore.textContent = gameState.score;
    updateUI();
}

function resetGame() {
    elements.gameOverOverlay.style.display = 'none';
    startGame();
}

// === Local Storage ===
function saveBestScore() {
    try {
        localStorage.setItem('blockPuzzleBest', gameState.bestScore.toString());
    } catch (e) {
        console.log('Could not save best score');
    }
}

function loadBestScore() {
    try {
        const saved = localStorage.getItem('blockPuzzleBest');
        if (saved) {
            gameState.bestScore = parseInt(saved);
            updateUI();
        }
    } catch (e) {
        console.log('Could not load best score');
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
