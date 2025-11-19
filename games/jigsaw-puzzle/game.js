'use strict';

// === Configuration ===
const CONFIG = {
    colors: [
        ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
        ['#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'],
        ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94'],
        ['#C7CEEA', '#FFDAC1', '#FF9AA2', '#B5EAD7'],
        ['#E2F0CB', '#FFDFD3', '#C1FBA4', '#7FCDCD'],
        ['#98DDCA', '#D5AAFF', '#FEC8D8', '#FFDFD3'],
        ['#83AF9B', '#FE4A49', '#FED766', '#E6F9AF'],
        ['#FC9D9A', '#F9CDAD', '#C8C8A9', '#83AF9B']
    ]
};

// === State Management ===
let gameState = {
    gridSize: 2,
    totalPieces: 4,
    pieces: [],
    board: [],
    placedCount: 0,
    startTime: null,
    timerInterval: null,
    isPlaying: false,
    draggedPiece: null,
    colors: []
};

// === DOM References ===
const elements = {
    difficultySelector: document.getElementById('difficultySelector'),
    puzzleArea: document.getElementById('puzzleArea'),
    puzzleBoard: document.getElementById('puzzleBoard'),
    piecesContainer: document.getElementById('piecesContainer'),
    gameMessage: document.getElementById('gameMessage'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    placed: document.getElementById('placed'),
    total: document.getElementById('total'),
    timer: document.getElementById('timer'),
    finalTime: document.getElementById('finalTime')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', handleDifficultySelect);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDifficultySelect(e);
        });
    });

    // Control buttons
    elements.shuffleBtn.addEventListener('click', shufflePieces);
    elements.shuffleBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shufflePieces();
    });

    elements.newGameBtn.addEventListener('click', resetToMenu);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetToMenu();
    });
}

// === Difficulty Selection ===
function handleDifficultySelect(e) {
    const pieces = parseInt(e.target.dataset.pieces);
    startGame(pieces);
}

// === Game Start ===
function startGame(totalPieces) {
    gameState.totalPieces = totalPieces;
    gameState.gridSize = Math.sqrt(totalPieces);
    gameState.placedCount = 0;
    gameState.isPlaying = true;

    // Select random color palette
    gameState.colors = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];

    // Hide difficulty selector, show puzzle
    elements.difficultySelector.style.display = 'none';
    elements.puzzleArea.style.display = 'block';
    elements.shuffleBtn.style.display = 'inline-block';
    elements.newGameBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    createPuzzle();
    startTimer();
    updateStats();
}

// === Puzzle Creation ===
function createPuzzle() {
    const gridSize = gameState.gridSize;

    // Create puzzle data
    gameState.pieces = [];
    gameState.board = Array(gameState.totalPieces).fill(null);

    for (let i = 0; i < gameState.totalPieces; i++) {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const colorIndex = (row + col) % gameState.colors.length;

        gameState.pieces.push({
            id: i,
            correctPosition: i,
            color: gameState.colors[colorIndex],
            number: i + 1
        });
    }

    // Shuffle pieces
    shuffleArray(gameState.pieces);

    renderPuzzle();
}

// === Render Puzzle ===
function renderPuzzle() {
    renderBoard();
    renderPieces();
}

function renderBoard() {
    const gridSize = gameState.gridSize;
    elements.puzzleBoard.innerHTML = '';
    elements.puzzleBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    // Calculate slot size
    const maxBoardSize = Math.min(400, window.innerWidth - 60);
    const slotSize = Math.floor(maxBoardSize / gridSize) - 4;

    for (let i = 0; i < gameState.totalPieces; i++) {
        const slot = document.createElement('div');
        slot.className = 'board-slot';
        slot.dataset.position = i;
        slot.style.width = `${slotSize}px`;
        slot.style.height = `${slotSize}px`;

        // Add drop handlers
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', (e) => handleDrop(e, i));

        // Touch events
        slot.addEventListener('touchmove', handleTouchMove);
        slot.addEventListener('touchend', handleTouchEnd);

        elements.puzzleBoard.appendChild(slot);
    }
}

function renderPieces() {
    elements.piecesContainer.innerHTML = '';

    const gridSize = gameState.gridSize;
    const maxBoardSize = Math.min(400, window.innerWidth - 60);
    const pieceSize = Math.floor(maxBoardSize / gridSize) - 4;

    gameState.pieces.forEach((piece, index) => {
        if (gameState.board[piece.correctPosition] === piece.id) {
            return; // Already placed
        }

        const pieceEl = document.createElement('div');
        pieceEl.className = 'puzzle-piece';
        pieceEl.dataset.id = piece.id;
        pieceEl.draggable = true;
        pieceEl.style.width = `${pieceSize}px`;
        pieceEl.style.height = `${pieceSize}px`;
        pieceEl.style.background = piece.color;
        pieceEl.textContent = piece.number;

        // Drag events
        pieceEl.addEventListener('dragstart', (e) => handleDragStart(e, piece));
        pieceEl.addEventListener('dragend', handleDragEnd);

        // Touch events
        pieceEl.addEventListener('touchstart', (e) => handleTouchStart(e, piece));

        elements.piecesContainer.appendChild(pieceEl);
    });
}

// === Drag and Drop Handlers ===
function handleDragStart(e, piece) {
    gameState.draggedPiece = piece;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    gameState.draggedPiece = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e, position) {
    e.preventDefault();
    if (!gameState.draggedPiece) return;

    placePiece(gameState.draggedPiece, position);
}

// === Touch Handlers ===
let touchStartPos = { x: 0, y: 0 };
let touchPiece = null;

function handleTouchStart(e, piece) {
    e.preventDefault();
    touchPiece = piece;
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    e.target.classList.add('dragging');
}

function handleTouchMove(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (!touchPiece) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    // Remove dragging class from all pieces
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('dragging'));

    if (element && element.classList.contains('board-slot')) {
        const position = parseInt(element.dataset.position);
        placePiece(touchPiece, position);
    }

    touchPiece = null;
}

// === Place Piece ===
function placePiece(piece, position) {
    if (!gameState.isPlaying) return;

    // Check if correct position
    if (piece.correctPosition === position) {
        gameState.board[position] = piece.id;
        gameState.placedCount++;
        updateStats();

        // Update board slot
        const slot = elements.puzzleBoard.querySelector(`[data-position="${position}"]`);
        if (slot) {
            slot.classList.add('filled');
            slot.style.background = piece.color;
            slot.textContent = piece.number;
            slot.style.fontSize = '24px';
            slot.style.fontWeight = 'bold';
            slot.style.color = 'white';
            slot.style.display = 'flex';
            slot.style.justifyContent = 'center';
            slot.style.alignItems = 'center';
            slot.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
        }

        // Re-render pieces
        renderPieces();

        // Check win
        if (gameState.placedCount === gameState.totalPieces) {
            endGame();
        }
    }
}

// === Shuffle Pieces ===
function shufflePieces() {
    shuffleArray(gameState.pieces);
    renderPieces();
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;

    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Show completion message
    setTimeout(() => {
        elements.finalTime.textContent = elements.timer.textContent;

        elements.puzzleArea.style.display = 'none';
        elements.gameMessage.style.display = 'block';
        elements.shuffleBtn.style.display = 'none';
    }, 1000);
}

// === Timer ===
function startTimer() {
    gameState.startTime = Date.now();

    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === UI Updates ===
function updateStats() {
    elements.placed.textContent = `${gameState.placedCount}/${gameState.totalPieces}`;
    elements.total.textContent = gameState.totalPieces;
}

// === Reset ===
function resetToMenu() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Reset state
    gameState.placedCount = 0;
    gameState.isPlaying = false;
    elements.placed.textContent = '0';
    elements.timer.textContent = '0:00';

    // Show difficulty selector
    elements.difficultySelector.style.display = 'block';
    elements.puzzleArea.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    elements.shuffleBtn.style.display = 'none';
    elements.newGameBtn.style.display = 'none';
}

// === Utility Functions ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
