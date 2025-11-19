'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 8,
    candyTypes: ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'],
    matchMinimum: 3,
    pointsPerCandy: 10,
    comboMultiplier: 1.5,
    initialMoves: 20,
    targetScore: 1000
};

// === State Management ===
let gameState = {
    isPlaying: false,
    score: 0,
    moves: CONFIG.initialMoves,
    targetScore: CONFIG.targetScore,
    grid: [],
    selectedCandy: null,
    isProcessing: false,
    combo: 0
};

// === DOM References ===
const elements = {
    gameBoard: document.getElementById('gameBoard'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameMessage: document.getElementById('gameMessage'),
    score: document.getElementById('score'),
    moves: document.getElementById('moves'),
    target: document.getElementById('target'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    finalScore: document.getElementById('finalScore'),
    stars: document.getElementById('stars'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    gameArea: document.getElementById('gameArea')
};

// === Initialization ===
function initGame() {
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
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    createGrid();
    renderBoard();
    updateUI();
}

function createGrid() {
    gameState.grid = [];

    // Create initial grid
    for (let row = 0; row < CONFIG.gridSize; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < CONFIG.gridSize; col++) {
            gameState.grid[row][col] = getRandomCandy();
        }
    }

    // Ensure no initial matches
    removeInitialMatches();
}

function getRandomCandy() {
    return CONFIG.candyTypes[Math.floor(Math.random() * CONFIG.candyTypes.length)];
}

function removeInitialMatches() {
    let hasMatches = true;
    let attempts = 0;
    const maxAttempts = 100;

    while (hasMatches && attempts < maxAttempts) {
        hasMatches = false;
        attempts++;

        for (let row = 0; row < CONFIG.gridSize; row++) {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                const candy = gameState.grid[row][col];

                // Check horizontal
                if (col >= 2 &&
                    gameState.grid[row][col - 1] === candy &&
                    gameState.grid[row][col - 2] === candy) {
                    gameState.grid[row][col] = getRandomCandy();
                    hasMatches = true;
                }

                // Check vertical
                if (row >= 2 &&
                    gameState.grid[row - 1][col] === candy &&
                    gameState.grid[row - 2][col] === candy) {
                    gameState.grid[row][col] = getRandomCandy();
                    hasMatches = true;
                }
            }
        }
    }
}

// === Board Rendering ===
function renderBoard() {
    elements.gameBoard.innerHTML = '';

    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const candy = document.createElement('div');
            candy.className = 'candy';
            candy.textContent = gameState.grid[row][col];
            candy.dataset.row = row;
            candy.dataset.col = col;

            candy.addEventListener('click', () => handleCandyClick(row, col));
            candy.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleCandyClick(row, col);
            });

            elements.gameBoard.appendChild(candy);
        }
    }
}

// === Candy Selection & Swapping ===
function handleCandyClick(row, col) {
    if (!gameState.isPlaying || gameState.isProcessing) return;

    if (!gameState.selectedCandy) {
        // Select first candy
        gameState.selectedCandy = { row, col };
        highlightCandy(row, col, true);
    } else {
        // Check if clicking the same candy (deselect)
        if (gameState.selectedCandy.row === row && gameState.selectedCandy.col === col) {
            highlightCandy(row, col, false);
            gameState.selectedCandy = null;
            return;
        }

        // Check if adjacent
        const rowDiff = Math.abs(gameState.selectedCandy.row - row);
        const colDiff = Math.abs(gameState.selectedCandy.col - col);

        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // Adjacent - attempt swap
            attemptSwap(gameState.selectedCandy.row, gameState.selectedCandy.col, row, col);
        } else {
            // Not adjacent - select new candy
            highlightCandy(gameState.selectedCandy.row, gameState.selectedCandy.col, false);
            gameState.selectedCandy = { row, col };
            highlightCandy(row, col, true);
        }
    }
}

function highlightCandy(row, col, highlight) {
    const index = row * CONFIG.gridSize + col;
    const candy = elements.gameBoard.children[index];
    if (candy) {
        if (highlight) {
            candy.classList.add('selected');
        } else {
            candy.classList.remove('selected');
        }
    }
}

async function attemptSwap(row1, col1, row2, col2) {
    gameState.isProcessing = true;

    // Swap candies
    const temp = gameState.grid[row1][col1];
    gameState.grid[row1][col1] = gameState.grid[row2][col2];
    gameState.grid[row2][col2] = temp;

    renderBoard();

    // Check for matches
    const matches = findAllMatches();

    if (matches.length > 0) {
        // Valid move
        gameState.moves--;
        updateUI();

        highlightCandy(row1, col1, false);
        gameState.selectedCandy = null;

        // Process matches
        await processMatches();

        // Check game state
        checkGameOver();
    } else {
        // Invalid move - swap back
        gameState.grid[row2][col2] = gameState.grid[row1][col1];
        gameState.grid[row1][col1] = temp;

        renderBoard();
        highlightCandy(row1, col1, false);
        gameState.selectedCandy = null;
    }

    gameState.isProcessing = false;
}

// === Match Finding ===
function findAllMatches() {
    const matches = [];
    const matched = new Set();

    // Find horizontal matches
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize - 2; col++) {
            const candy = gameState.grid[row][col];
            let matchLength = 1;

            for (let i = 1; col + i < CONFIG.gridSize && gameState.grid[row][col + i] === candy; i++) {
                matchLength++;
            }

            if (matchLength >= CONFIG.matchMinimum) {
                for (let i = 0; i < matchLength; i++) {
                    matched.add(`${row},${col + i}`);
                }
            }
        }
    }

    // Find vertical matches
    for (let col = 0; col < CONFIG.gridSize; col++) {
        for (let row = 0; row < CONFIG.gridSize - 2; row++) {
            const candy = gameState.grid[row][col];
            let matchLength = 1;

            for (let i = 1; row + i < CONFIG.gridSize && gameState.grid[row + i][col] === candy; i++) {
                matchLength++;
            }

            if (matchLength >= CONFIG.matchMinimum) {
                for (let i = 0; i < matchLength; i++) {
                    matched.add(`${row + i},${col}`);
                }
            }
        }
    }

    // Convert set to array of coordinates
    matched.forEach(coord => {
        const [row, col] = coord.split(',').map(Number);
        matches.push({ row, col });
    });

    return matches;
}

// === Match Processing ===
async function processMatches() {
    let allMatches = findAllMatches();

    while (allMatches.length > 0) {
        gameState.combo++;

        // Animate matches
        allMatches.forEach(({ row, col }) => {
            const index = row * CONFIG.gridSize + col;
            const candy = elements.gameBoard.children[index];
            if (candy) {
                candy.classList.add('matching');
            }
        });

        await sleep(500);

        // Calculate and add score
        const points = allMatches.length * CONFIG.pointsPerCandy * Math.pow(CONFIG.comboMultiplier, gameState.combo - 1);
        gameState.score += Math.floor(points);

        // Show combo indicator
        if (gameState.combo > 1) {
            showComboIndicator(gameState.combo);
        }

        // Show points popup
        if (allMatches.length > 0) {
            const firstMatch = allMatches[0];
            showPointsPopup(firstMatch.row, firstMatch.col, Math.floor(points));
        }

        updateUI();

        // Remove matches
        allMatches.forEach(({ row, col }) => {
            gameState.grid[row][col] = null;
        });

        renderBoard();
        await sleep(200);

        // Drop candies
        dropCandies();
        renderBoard();
        await sleep(300);

        // Fill empty spaces
        fillEmptySpaces();
        renderBoard();
        await sleep(300);

        // Check for new matches
        allMatches = findAllMatches();
    }

    // Reset combo
    gameState.combo = 0;
}

function dropCandies() {
    for (let col = 0; col < CONFIG.gridSize; col++) {
        let emptyRow = CONFIG.gridSize - 1;

        // Start from bottom and move up
        for (let row = CONFIG.gridSize - 1; row >= 0; row--) {
            if (gameState.grid[row][col] !== null) {
                if (row !== emptyRow) {
                    gameState.grid[emptyRow][col] = gameState.grid[row][col];
                    gameState.grid[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
}

function fillEmptySpaces() {
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            if (gameState.grid[row][col] === null) {
                gameState.grid[row][col] = getRandomCandy();
            }
        }
    }
}

// === Visual Effects ===
function showComboIndicator(combo) {
    const existing = elements.gameArea.querySelector('.combo-indicator');
    if (existing) {
        existing.remove();
    }

    const indicator = document.createElement('div');
    indicator.className = 'combo-indicator';
    indicator.textContent = `🔥 COMBO x${combo}!`;
    elements.gameArea.appendChild(indicator);

    setTimeout(() => {
        indicator.remove();
    }, 1500);
}

function showPointsPopup(row, col, points) {
    const index = row * CONFIG.gridSize + col;
    const candy = elements.gameBoard.children[index];
    if (!candy) return;

    const rect = candy.getBoundingClientRect();
    const boardRect = elements.gameBoard.getBoundingClientRect();

    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    popup.style.left = `${rect.left - boardRect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top - boardRect.top}px`;

    elements.gameBoard.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// === Game State ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.moves.textContent = gameState.moves;
    elements.target.textContent = gameState.targetScore;
}

function checkGameOver() {
    if (gameState.moves <= 0) {
        gameOver();
    }
}

function gameOver() {
    gameState.isPlaying = false;
    elements.gameOverOverlay.style.display = 'flex';

    const won = gameState.score >= gameState.targetScore;
    elements.gameOverTitle.textContent = won ? '🎉 Level Complete!' : '😊 Good Try!';
    elements.finalScore.textContent = gameState.score;

    // Calculate stars
    let stars = '⭐';
    if (gameState.score >= gameState.targetScore) stars = '⭐⭐';
    if (gameState.score >= gameState.targetScore * 1.5) stars = '⭐⭐⭐';

    elements.stars.textContent = stars;
}

function resetGame() {
    gameState = {
        isPlaying: false,
        score: 0,
        moves: CONFIG.initialMoves,
        targetScore: CONFIG.targetScore,
        grid: [],
        selectedCandy: null,
        isProcessing: false,
        combo: 0
    };

    elements.gameOverOverlay.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameMessage.style.display = 'block';
    elements.gameBoard.innerHTML = '';

    updateUI();
}

// === Utility Functions ===
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
