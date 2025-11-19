'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 8,
    words: ['CAT', 'DOG', 'BIRD', 'FISH', 'BEAR']
};

// === State Management ===
let gameState = {
    grid: [],
    wordsToFind: [],
    foundWords: [],
    isPlaying: false,
    startTime: 0,
    timerInterval: null,
    selectedCells: [],
    isSelecting: false
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    hintBtn: document.getElementById('hintBtn'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    gameMessage: document.getElementById('gameMessage'),
    wordList: document.getElementById('words'),
    gridContainer: document.getElementById('gridContainer'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalTime: document.getElementById('finalTime'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
    elements.hintBtn.addEventListener('touchstart', showHint);
    elements.hintBtn.addEventListener('click', showHint);
}

function resetGame() {
    gameState = {
        grid: [],
        wordsToFind: [...CONFIG.words],
        foundWords: [],
        isPlaying: false,
        startTime: 0,
        timerInterval: null,
        selectedCells: [],
        isSelecting: false
    };

    elements.scoreDisplay.textContent = `0/${CONFIG.words.length}`;
    elements.timerDisplay.textContent = '0:00';
}

// === Event Handlers ===
function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    resetGame();
    startGame();
}

function startGame() {
    gameState.isPlaying = true;
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.hintBtn.style.display = 'inline-block';

    createWordSearch();
    displayWordList();
    startTimer();
}

function showHint(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.foundWords.length === CONFIG.words.length) return;

    // Find first unfound word
    const unfoundWord = gameState.wordsToFind.find(w => !gameState.foundWords.includes(w));
    if (unfoundWord) {
        const wordElement = document.querySelector(`[data-word="${unfoundWord}"]`);
        if (wordElement) {
            wordElement.style.animation = 'highlight 1s ease';
            setTimeout(() => {
                wordElement.style.animation = '';
            }, 1000);
        }
    }
}

// === Timer ===
function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const elapsed = Date.now() - gameState.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    elements.timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
}

// === Word Search Generation ===
function createWordSearch() {
    // Initialize empty grid
    gameState.grid = Array(CONFIG.gridSize).fill(null).map(() =>
        Array(CONFIG.gridSize).fill('')
    );

    // Place words
    gameState.wordsToFind.forEach(word => {
        placeWord(word);
    });

    // Fill empty cells with random letters
    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            if (gameState.grid[i][j] === '') {
                gameState.grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    renderGrid();
}

function placeWord(word) {
    const directions = [
        { dx: 0, dy: 1 },  // horizontal
        { dx: 1, dy: 0 },  // vertical
        { dx: 1, dy: 1 },  // diagonal down-right
    ];

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const startRow = Math.floor(Math.random() * CONFIG.gridSize);
        const startCol = Math.floor(Math.random() * CONFIG.gridSize);

        if (canPlaceWord(word, startRow, startCol, dir.dx, dir.dy)) {
            for (let i = 0; i < word.length; i++) {
                gameState.grid[startRow + i * dir.dx][startCol + i * dir.dy] = word[i];
            }
            placed = true;
        }
        attempts++;
    }
}

function canPlaceWord(word, row, col, dx, dy) {
    if (row + (word.length - 1) * dx >= CONFIG.gridSize) return false;
    if (col + (word.length - 1) * dy >= CONFIG.gridSize) return false;
    if (row + (word.length - 1) * dx < 0) return false;
    if (col + (word.length - 1) * dy < 0) return false;

    for (let i = 0; i < word.length; i++) {
        const currentCell = gameState.grid[row + i * dx][col + i * dy];
        if (currentCell !== '' && currentCell !== word[i]) {
            return false;
        }
    }
    return true;
}

// === Rendering ===
function renderGrid() {
    elements.gridContainer.innerHTML = '';
    elements.gridContainer.style.gridTemplateColumns = `repeat(${CONFIG.gridSize}, 1fr)`;

    for (let i = 0; i < CONFIG.gridSize; i++) {
        for (let j = 0; j < CONFIG.gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = gameState.grid[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;

            // Touch and mouse events
            cell.addEventListener('touchstart', handleCellTouchStart);
            cell.addEventListener('mousedown', handleCellMouseDown);
            cell.addEventListener('touchmove', handleCellTouchMove);
            cell.addEventListener('mousemove', handleCellMouseMove);
            cell.addEventListener('touchend', handleSelectionEnd);
            cell.addEventListener('mouseup', handleSelectionEnd);

            elements.gridContainer.appendChild(cell);
        }
    }

    // Global event listeners for selection end
    document.addEventListener('touchend', handleSelectionEnd);
    document.addEventListener('mouseup', handleSelectionEnd);
}

function displayWordList() {
    elements.wordList.innerHTML = '';
    gameState.wordsToFind.forEach(word => {
        const wordElement = document.createElement('span');
        wordElement.className = 'word-item';
        wordElement.textContent = word;
        wordElement.dataset.word = word;
        elements.wordList.appendChild(wordElement);
    });
}

// === Cell Selection ===
function handleCellTouchStart(e) {
    e.preventDefault();
    startSelection(e.target);
}

function handleCellMouseDown(e) {
    e.preventDefault();
    startSelection(e.target);
}

function startSelection(cell) {
    if (!gameState.isPlaying) return;
    gameState.isSelecting = true;
    gameState.selectedCells = [cell];
    cell.classList.add('selected');
}

function handleCellTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('grid-cell')) {
        addToSelection(element);
    }
}

function handleCellMouseMove(e) {
    if (!gameState.isSelecting) return;
    addToSelection(e.target);
}

function addToSelection(cell) {
    if (!gameState.isSelecting || !cell.classList.contains('grid-cell')) return;

    if (!gameState.selectedCells.includes(cell)) {
        gameState.selectedCells.push(cell);
        cell.classList.add('selected');
    }
}

function handleSelectionEnd(e) {
    if (!gameState.isSelecting) return;
    e.preventDefault();

    gameState.isSelecting = false;
    checkSelectedWord();

    // Clear selection
    gameState.selectedCells.forEach(cell => {
        if (!cell.classList.contains('found')) {
            cell.classList.remove('selected');
        }
    });
    gameState.selectedCells = [];
}

function checkSelectedWord() {
    if (gameState.selectedCells.length < 2) return;

    const selectedWord = gameState.selectedCells.map(cell => cell.textContent).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    if (gameState.wordsToFind.includes(selectedWord) && !gameState.foundWords.includes(selectedWord)) {
        foundWord(selectedWord);
    } else if (gameState.wordsToFind.includes(reversedWord) && !gameState.foundWords.includes(reversedWord)) {
        foundWord(reversedWord);
    }
}

function foundWord(word) {
    gameState.foundWords.push(word);

    // Mark cells as found
    gameState.selectedCells.forEach(cell => {
        cell.classList.add('found');
        cell.classList.add('highlighted');
    });

    // Update word list
    const wordElement = document.querySelector(`[data-word="${word}"]`);
    if (wordElement) {
        wordElement.classList.add('found');
    }

    // Update score
    elements.scoreDisplay.textContent = `${gameState.foundWords.length}/${CONFIG.words.length}`;

    // Check for win
    if (gameState.foundWords.length === CONFIG.words.length) {
        setTimeout(gameWon, 500);
    }
}

function gameWon() {
    gameState.isPlaying = false;
    stopTimer();
    elements.finalTime.textContent = elements.timerDisplay.textContent;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
