'use strict';

// === Configuration ===
const CONFIG = {
    animationDuration: 200
};

// === State Management ===
let gameState = {
    size: 3,
    tiles: [],
    emptyIndex: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isPlaying: false
};

// === DOM References ===
const elements = {
    difficultySelector: document.getElementById('difficultySelector'),
    puzzleContainer: document.getElementById('puzzleContainer'),
    gameMessage: document.getElementById('gameMessage'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    moves: document.getElementById('moves'),
    timer: document.getElementById('timer'),
    finalMoves: document.getElementById('finalMoves'),
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
        btn.addEventListener('touchstart', handleDifficultySelect);
    });

    // Control buttons
    elements.shuffleBtn.addEventListener('click', shufflePuzzle);
    elements.shuffleBtn.addEventListener('touchstart', shufflePuzzle);

    elements.newGameBtn.addEventListener('click', resetToMenu);
    elements.newGameBtn.addEventListener('touchstart', resetToMenu);
}

// === Difficulty Selection ===
function handleDifficultySelect(e) {
    e.preventDefault();
    const size = parseInt(e.target.dataset.size);
    startGame(size);
}

// === Game Start ===
function startGame(size) {
    gameState.size = size;
    gameState.moves = 0;
    gameState.isPlaying = true;

    // Hide difficulty selector, show puzzle
    elements.difficultySelector.style.display = 'none';
    elements.puzzleContainer.style.display = 'grid';
    elements.shuffleBtn.style.display = 'inline-block';
    elements.newGameBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    createPuzzle();
    shufflePuzzle();
    startTimer();
}

// === Puzzle Creation ===
function createPuzzle() {
    const size = gameState.size;
    const totalTiles = size * size;

    // Initialize tiles array
    gameState.tiles = Array.from({ length: totalTiles }, (_, i) => i);
    gameState.emptyIndex = totalTiles - 1;

    // Set grid layout
    elements.puzzleContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // Calculate tile size based on container
    const containerWidth = Math.min(400, window.innerWidth - 60);
    elements.puzzleContainer.style.width = `${containerWidth}px`;
    elements.puzzleContainer.style.height = `${containerWidth}px`;

    renderPuzzle();
}

// === Puzzle Rendering ===
function renderPuzzle() {
    elements.puzzleContainer.innerHTML = '';

    gameState.tiles.forEach((tileValue, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = index;

        if (index === gameState.emptyIndex) {
            tile.classList.add('empty');
        } else {
            tile.textContent = tileValue + 1;
            tile.addEventListener('click', () => handleTileClick(index));
            tile.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleTileClick(index);
            });
        }

        elements.puzzleContainer.appendChild(tile);
    });
}

// === Tile Click Handler ===
function handleTileClick(clickedIndex) {
    if (!gameState.isPlaying) return;

    if (canMove(clickedIndex)) {
        moveTile(clickedIndex);
        gameState.moves++;
        updateMoves();

        if (checkWin()) {
            endGame();
        }
    }
}

// === Movement Logic ===
function canMove(index) {
    const size = gameState.size;
    const emptyIndex = gameState.emptyIndex;

    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    // Check if adjacent (same row or column and distance of 1)
    const sameRow = row === emptyRow && Math.abs(col - emptyCol) === 1;
    const sameCol = col === emptyCol && Math.abs(row - emptyRow) === 1;

    return sameRow || sameCol;
}

function moveTile(index) {
    // Swap tile with empty space
    const temp = gameState.tiles[index];
    gameState.tiles[index] = gameState.tiles[gameState.emptyIndex];
    gameState.tiles[gameState.emptyIndex] = temp;

    gameState.emptyIndex = index;

    renderPuzzle();
}

// === Shuffle ===
function shufflePuzzle() {
    // Reset moves and timer
    gameState.moves = 0;
    updateMoves();

    // Perform random valid moves to ensure solvability
    const shuffleMoves = gameState.size * gameState.size * 10;

    for (let i = 0; i < shuffleMoves; i++) {
        const validMoves = getValidMoves();
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

        // Swap without animation
        const temp = gameState.tiles[randomMove];
        gameState.tiles[randomMove] = gameState.tiles[gameState.emptyIndex];
        gameState.tiles[gameState.emptyIndex] = temp;
        gameState.emptyIndex = randomMove;
    }

    renderPuzzle();

    // Reset and start timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    startTimer();
}

function getValidMoves() {
    const size = gameState.size;
    const emptyIndex = gameState.emptyIndex;
    const row = Math.floor(emptyIndex / size);
    const col = emptyIndex % size;

    const validMoves = [];

    // Up
    if (row > 0) validMoves.push(emptyIndex - size);
    // Down
    if (row < size - 1) validMoves.push(emptyIndex + size);
    // Left
    if (col > 0) validMoves.push(emptyIndex - 1);
    // Right
    if (col < size - 1) validMoves.push(emptyIndex + 1);

    return validMoves;
}

// === Win Condition ===
function checkWin() {
    const totalTiles = gameState.size * gameState.size;

    // Check if all tiles are in order
    for (let i = 0; i < totalTiles - 1; i++) {
        if (gameState.tiles[i] !== i) {
            return false;
        }
    }

    return true;
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;

    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Show completion message
    elements.finalMoves.textContent = gameState.moves;
    elements.finalTime.textContent = elements.timer.textContent;

    elements.puzzleContainer.style.display = 'none';
    elements.gameMessage.style.display = 'block';
    elements.shuffleBtn.style.display = 'none';
}

// === Timer ===
function startTimer() {
    gameState.startTime = Date.now();

    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === UI Updates ===
function updateMoves() {
    elements.moves.textContent = gameState.moves;
}

// === Reset ===
function resetToMenu() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Reset state
    gameState.moves = 0;
    gameState.isPlaying = false;
    elements.moves.textContent = '0';
    elements.timer.textContent = '0:00';

    // Show difficulty selector
    elements.difficultySelector.style.display = 'block';
    elements.puzzleContainer.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    elements.shuffleBtn.style.display = 'none';
    elements.newGameBtn.style.display = 'none';
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
