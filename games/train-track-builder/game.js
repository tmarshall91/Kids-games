'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const LEVELS = [
    { gridSize: 5, startPos: [0, 2], endPos: [4, 2] },
    { gridSize: 6, startPos: [0, 0], endPos: [5, 5] },
    { gridSize: 7, startPos: [0, 3], endPos: [6, 3] },
    { gridSize: 6, startPos: [0, 1], endPos: [5, 4] },
    { gridSize: 7, startPos: [0, 0], endPos: [6, 6] },
];

const TRACK_CONNECTIONS = {
    'straight-h': { symbol: '─', connects: ['left', 'right'] },
    'straight-v': { symbol: '│', connects: ['top', 'bottom'] },
    'corner-tl': { symbol: '┐', connects: ['top', 'left'] },
    'corner-tr': { symbol: '┌', connects: ['top', 'right'] },
    'corner-bl': { symbol: '┘', connects: ['bottom', 'left'] },
    'corner-br': { symbol: '└', connects: ['bottom', 'right'] },
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentLevel: 0,
    trackCount: 0,
    selectedTrack: null,
    grid: [],
    startPos: null,
    endPos: null,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    clearBtn: document.getElementById('clearBtn'),
    testBtn: document.getElementById('testBtn'),
    nextBtn: document.getElementById('nextBtn'),
    continueBtn: document.getElementById('continueBtn'),
    trackCountDisplay: document.getElementById('trackCount'),
    levelDisplay: document.getElementById('level'),
    completedLevelDisplay: document.getElementById('completedLevel'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    successOverlay: document.getElementById('successOverlay'),
    grid: document.getElementById('grid'),
    train: document.getElementById('train'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    setupEventListeners();
    loadLevel(0);
}

function setupEventListeners() {
    elements.clearBtn.addEventListener('click', clearTracks);
    elements.testBtn.addEventListener('click', testTrack);
    elements.nextBtn.addEventListener('click', nextLevel);
    elements.continueBtn.addEventListener('click', nextLevel);

    // Track selector
    document.querySelectorAll('.track-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTrack(btn));
    });

    // Select first track by default
    selectTrack(document.querySelector('.track-btn'));
}

// ==========================================
// LEVEL MANAGEMENT
// ==========================================

function loadLevel(levelIndex) {
    if (levelIndex >= LEVELS.length) {
        // Game complete!
        showGameComplete();
        return;
    }

    gameState.currentLevel = levelIndex;
    const level = LEVELS[levelIndex];

    gameState.grid = [];
    gameState.trackCount = 0;
    gameState.startPos = level.startPos;
    gameState.endPos = level.endPos;

    // Create grid
    elements.grid.innerHTML = '';
    elements.grid.style.gridTemplateColumns = `repeat(${level.gridSize}, 1fr)`;

    for (let row = 0; row < level.gridSize; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < level.gridSize; col++) {
            const cell = createCell(row, col);
            elements.grid.appendChild(cell);
            gameState.grid[row][col] = { element: cell, track: null };
        }
    }

    // Mark start and end
    markSpecialCell(level.startPos[0], level.startPos[1], 'start', '🟢');
    markSpecialCell(level.endPos[0], level.endPos[1], 'end', '🔴');

    // Update UI
    elements.levelDisplay.textContent = levelIndex + 1;
    elements.gameMessage.style.display = 'block';
    elements.nextBtn.style.display = 'none';
    elements.train.style.display = 'none';

    updateTrackCount();
}

function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.row = row;
    cell.dataset.col = col;

    cell.addEventListener('click', () => placeTr ack(row, col));

    return cell;
}

function markSpecialCell(row, col, className, symbol) {
    const cell = gameState.grid[row][col];
    cell.element.classList.add(className);
    cell.element.textContent = symbol;
    cell.special = className;
}

// ==========================================
// TRACK PLACEMENT
// ==========================================

function selectTrack(btn) {
    document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    gameState.selectedTrack = btn.dataset.track;
}

function placeTrack(row, col) {
    const cell = gameState.grid[row][col];

    // Can't place on start or end
    if (cell.special) return;

    if (!gameState.selectedTrack) return;

    // If cell has track, remove it
    if (cell.track) {
        cell.track = null;
        cell.element.textContent = '';
        cell.element.classList.remove('has-track');
        gameState.trackCount--;
    } else {
        // Place new track
        const trackType = TRACK_CONNECTIONS[gameState.selectedTrack];
        cell.track = gameState.selectedTrack;
        cell.element.textContent = trackType.symbol;
        cell.element.classList.add('has-track');
        gameState.trackCount++;
    }

    updateTrackCount();
}

function clearTracks() {
    gameState.grid.forEach(row => {
        row.forEach(cell => {
            if (!cell.special) {
                cell.track = null;
                cell.element.textContent = '';
                cell.element.classList.remove('has-track', 'validated');
            }
        });
    });

    gameState.trackCount = 0;
    updateTrackCount();
    elements.train.style.display = 'none';
    elements.gameMessage.style.display = 'block';
    elements.nextBtn.style.display = 'none';
}

// ==========================================
// TRACK VALIDATION
// ==========================================

function testTrack() {
    elements.gameMessage.style.display = 'none';

    // Clear previous validation
    gameState.grid.forEach(row => {
        row.forEach(cell => cell.element.classList.remove('validated'));
    });

    // Validate path from start to end
    const path = findPath(gameState.startPos, gameState.endPos);

    if (path) {
        // Valid path found!
        animateTrain(path);
    } else {
        // Invalid path
        showMessage('Track incomplete! Try again.', 'error');
        setTimeout(() => {
            elements.gameMessage.style.display = 'block';
        }, 2000);
    }
}

function findPath(start, end) {
    const visited = new Set();
    const queue = [[start, [start]]];
    const [endRow, endCol] = end;

    while (queue.length > 0) {
        const [[row, col], path] = queue.shift();
        const key = `${row},${col}`;

        if (visited.has(key)) continue;
        visited.add(key);

        // Check if we reached the end
        if (row === endRow && col === endCol) {
            return path;
        }

        // Get valid neighbors
        const neighbors = getConnectedNeighbors(row, col);
        neighbors.forEach(([nRow, nCol]) => {
            if (!visited.has(`${nRow},${nCol}`)) {
                queue.push([[nRow, nCol], [...path, [nRow, nCol]]]);
            }
        });
    }

    return null; // No path found
}

function getConnectedNeighbors(row, col) {
    const cell = gameState.grid[row][col];
    const neighbors = [];
    const directions = {
        top: [-1, 0],
        bottom: [1, 0],
        left: [0, -1],
        right: [0, 1],
    };

    // Determine which directions this cell connects to
    let connections = [];
    if (cell.special === 'start' || cell.special === 'end') {
        // Start and end connect in all directions
        connections = ['top', 'bottom', 'left', 'right'];
    } else if (cell.track) {
        connections = TRACK_CONNECTIONS[cell.track].connects;
    } else {
        return neighbors; // No track, no connections
    }

    // Check each connection
    connections.forEach(dir => {
        const [dRow, dCol] = directions[dir];
        const nRow = row + dRow;
        const nCol = col + dCol;

        // Check bounds
        if (nRow < 0 || nRow >= gameState.grid.length ||
            nCol < 0 || nCol >= gameState.grid[0].length) {
            return;
        }

        const neighborCell = gameState.grid[nRow][nCol];

        // Check if neighbor connects back
        const oppositeDir = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[dir];

        let neighborConnections = [];
        if (neighborCell.special) {
            neighborConnections = ['top', 'bottom', 'left', 'right'];
        } else if (neighborCell.track) {
            neighborConnections = TRACK_CONNECTIONS[neighborCell.track].connects;
        }

        if (neighborConnections.includes(oppositeDir)) {
            neighbors.push([nRow, nCol]);
        }
    });

    return neighbors;
}

// ==========================================
// TRAIN ANIMATION
// ==========================================

function animateTrain(path) {
    elements.train.style.display = 'block';

    let index = 0;

    function moveToNext() {
        if (index >= path.length) {
            // Animation complete!
            elements.train.style.display = 'none';
            levelComplete();
            return;
        }

        const [row, col] = path[index];
        const cell = gameState.grid[row][col].element;
        const rect = cell.getBoundingClientRect();
        const gameRect = elements.gameArea.getBoundingClientRect();

        cell.classList.add('validated');

        elements.train.style.left = (rect.left - gameRect.left + rect.width / 2 - 20) + 'px';
        elements.train.style.top = (rect.top - gameRect.top + rect.height / 2 - 20) + 'px';

        index++;
        setTimeout(moveToNext, 300);
    }

    moveToNext();
}

// ==========================================
// GAME PROGRESSION
// ==========================================

function levelComplete() {
    elements.completedLevelDisplay.textContent = gameState.currentLevel + 1;
    elements.successOverlay.style.display = 'flex';
    elements.nextBtn.style.display = 'inline-block';
}

function nextLevel() {
    elements.successOverlay.style.display = 'none';
    loadLevel(gameState.currentLevel + 1);
}

function showGameComplete() {
    elements.gameMessage.innerHTML = '<h2>🎉 All Levels Complete!</h2><p>You\'re a master builder!</p>';
    elements.gameMessage.style.display = 'block';
    elements.testBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
}

// ==========================================
// UI HELPERS
// ==========================================

function updateTrackCount() {
    elements.trackCountDisplay.textContent = gameState.trackCount;
}

function showMessage(text, type) {
    elements.gameMessage.innerHTML = `<p style="font-size: 20px;">${text}</p>`;
    elements.gameMessage.style.display = 'block';
    elements.gameMessage.style.background = type === 'error' ?
        'rgba(244, 67, 54, 0.9)' : 'rgba(76, 175, 80, 0.9)';
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
