'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gridSize: 3, // 3x3 puzzle
    emojis: [
        ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑'],
        ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'],
        ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓'],
        ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒'],
        ['🌟', '⭐', '✨', '💫', '🌙', '☀️', '🌈', '🌸', '🌺']
    ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    moves: 0,
    seconds: 0,
    isPlaying: false,
    selectedPiece: null,
    currentPuzzle: [],
    solvedPuzzle: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    hintBtn: document.getElementById('hintBtn'),

    // Display elements
    movesDisplay: document.getElementById('moves'),
    timerDisplay: document.getElementById('timer'),
    finalMovesDisplay: document.getElementById('finalMoves'),
    finalTimeDisplay: document.getElementById('finalTime'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    puzzleContainer: document.getElementById('puzzleContainer'),
    puzzleGrid: document.getElementById('puzzleGrid'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Collaborative Puzzle initialized');
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

    // Hint button
    elements.hintBtn.addEventListener('touchstart', handleHint);
    elements.hintBtn.addEventListener('click', handleHint);
}

// ==========================================
// PUZZLE GENERATION
// ==========================================

function generatePuzzle() {
    // Select random emoji set
    const emojiSet = CONFIG.emojis[randomInt(0, CONFIG.emojis.length - 1)];

    // Create solved puzzle (in order)
    gameState.solvedPuzzle = [...emojiSet];

    // Create shuffled puzzle
    gameState.currentPuzzle = [...emojiSet];

    // Shuffle until it's different from solved
    do {
        shuffleArray(gameState.currentPuzzle);
    } while (arraysEqual(gameState.currentPuzzle, gameState.solvedPuzzle));

    renderPuzzle();
}

function renderPuzzle() {
    elements.puzzleGrid.innerHTML = '';

    gameState.currentPuzzle.forEach((emoji, index) => {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.dataset.index = index;
        piece.textContent = emoji;

        // Add piece number for reference
        const pieceNumber = document.createElement('div');
        pieceNumber.className = 'piece-number';
        pieceNumber.textContent = index + 1;
        piece.appendChild(pieceNumber);

        // Check if piece is in correct position
        if (gameState.currentPuzzle[index] === gameState.solvedPuzzle[index]) {
            piece.classList.add('correct');
        }

        // Add click handler
        piece.addEventListener('touchstart', (e) => handlePieceClick(e, index));
        piece.addEventListener('click', (e) => handlePieceClick(e, index));

        elements.puzzleGrid.appendChild(piece);
    });
}

function handlePieceClick(e, index) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');

    // First selection
    if (gameState.selectedPiece === null) {
        gameState.selectedPiece = index;
        pieces[index].classList.add('selected');
    }
    // Second selection - swap
    else {
        // Swap pieces
        const temp = gameState.currentPuzzle[gameState.selectedPiece];
        gameState.currentPuzzle[gameState.selectedPiece] = gameState.currentPuzzle[index];
        gameState.currentPuzzle[index] = temp;

        // Remove selection
        pieces[gameState.selectedPiece].classList.remove('selected');
        gameState.selectedPiece = null;

        // Increment moves
        gameState.moves++;
        updateMovesDisplay();

        // Re-render puzzle
        renderPuzzle();

        // Check if solved
        if (arraysEqual(gameState.currentPuzzle, gameState.solvedPuzzle)) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    }
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
    gameState.selectedPiece = null;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.puzzleContainer.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.hintBtn.style.display = 'inline-block';

    updateMovesDisplay();
    updateTimerDisplay();

    // Generate and display puzzle
    generatePuzzle();

    // Start timer
    startTimer();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Show celebration
    const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
    pieces.forEach(piece => {
        piece.style.animation = 'celebration 0.5s ease';
    });

    // Show game over overlay
    elements.finalMovesDisplay.textContent = gameState.moves;
    elements.finalTimeDisplay.textContent = formatTime(gameState.seconds);
    setTimeout(() => {
        elements.gameOverOverlay.style.display = 'flex';
    }, 1000);

    console.log('Game ended. Moves:', gameState.moves, 'Time:', gameState.seconds);
}

function resetGame() {
    gameState.moves = 0;
    gameState.seconds = 0;
    gameState.isPlaying = false;
    gameState.selectedPiece = null;
    gameState.currentPuzzle = [];
    gameState.solvedPuzzle = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.puzzleContainer.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.hintBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateMovesDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// HINT SYSTEM
// ==========================================

function handleHint(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    // Find first misplaced piece
    for (let i = 0; i < gameState.currentPuzzle.length; i++) {
        if (gameState.currentPuzzle[i] !== gameState.solvedPuzzle[i]) {
            // Highlight the piece
            const pieces = elements.puzzleGrid.querySelectorAll('.puzzle-piece');
            pieces[i].classList.add('showing-hint');

            // Find where this piece should go
            const correctIndex = gameState.solvedPuzzle.indexOf(gameState.currentPuzzle[i]);
            pieces[correctIndex].classList.add('showing-hint');

            setTimeout(() => {
                pieces[i].classList.remove('showing-hint');
                pieces[correctIndex].classList.remove('showing-hint');
            }, 2000);

            break;
        }
    }
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
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
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
