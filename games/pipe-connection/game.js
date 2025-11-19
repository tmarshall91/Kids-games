'use strict';

// === Configuration ===
const CONFIG = {
    levels: [
        { size: 5, difficulty: 'easy' },
        { size: 5, difficulty: 'medium' },
        { size: 6, difficulty: 'medium' },
        { size: 6, difficulty: 'hard' },
        { size: 7, difficulty: 'hard' }
    ]
};

// === Pipe Types ===
const PIPE_TYPES = {
    EMPTY: 'empty',
    STRAIGHT: 'straight',
    CORNER: 'corner',
    SOURCE: 'source',
    DRAIN: 'drain'
};

// === State Management ===
let gameState = {
    currentLevel: 0,
    moves: 0,
    grid: [],
    gridSize: 5,
    source: { row: 0, col: 0 },
    drain: { row: 0, col: 0 },
    isFlowing: false
};

// === DOM References ===
const elements = {
    pipeGrid: document.getElementById('pipeGrid'),
    level: document.getElementById('level'),
    moves: document.getElementById('moves'),
    checkBtn: document.getElementById('checkBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    restartBtn: document.getElementById('restartBtn'),
    successOverlay: document.getElementById('successOverlay'),
    finalMoves: document.getElementById('finalMoves'),
    continueBtn: document.getElementById('continueBtn'),
    flowMessage: document.getElementById('flowMessage')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    startLevel(0);
}

function startLevel(levelIndex) {
    gameState.currentLevel = levelIndex;
    gameState.moves = 0;
    gameState.isFlowing = false;

    const levelConfig = CONFIG.levels[levelIndex] || CONFIG.levels[0];
    gameState.gridSize = levelConfig.size;

    elements.level.textContent = levelIndex + 1;
    elements.moves.textContent = 0;
    elements.nextLevelBtn.style.display = 'none';
    elements.flowMessage.style.display = 'none';

    generateLevel();
    renderGrid();
}

// === Level Generation ===
function generateLevel() {
    const size = gameState.gridSize;
    gameState.grid = [];

    // Initialize empty grid
    for (let i = 0; i < size; i++) {
        gameState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            gameState.grid[i][j] = {
                type: PIPE_TYPES.EMPTY,
                rotation: 0,
                connected: false
            };
        }
    }

    // Place source and drain
    gameState.source = { row: 0, col: Math.floor(Math.random() * size) };
    gameState.drain = { row: size - 1, col: Math.floor(Math.random() * size) };

    gameState.grid[gameState.source.row][gameState.source.col] = {
        type: PIPE_TYPES.SOURCE,
        rotation: 0,
        connected: false
    };

    gameState.grid[gameState.drain.row][gameState.drain.col] = {
        type: PIPE_TYPES.DRAIN,
        rotation: 0,
        connected: false
    };

    // Generate a valid path
    generatePath();

    // Add extra pipes and randomize rotations
    fillEmptyCells();
    randomizeRotations();
}

function generatePath() {
    const size = gameState.gridSize;
    let current = { ...gameState.source };
    const path = [current];

    while (current.row !== gameState.drain.row || current.col !== gameState.drain.col) {
        const possibleMoves = [];

        // Move toward drain
        if (current.row < gameState.drain.row) {
            possibleMoves.push({ row: current.row + 1, col: current.col, dir: 'down' });
        }
        if (current.col < gameState.drain.col) {
            possibleMoves.push({ row: current.row, col: current.col + 1, dir: 'right' });
        }
        if (current.col > gameState.drain.col) {
            possibleMoves.push({ row: current.row, col: current.col - 1, dir: 'left' });
        }

        // Add some randomness
        if (possibleMoves.length > 1 && Math.random() > 0.5) {
            possibleMoves.sort(() => Math.random() - 0.5);
        }

        const next = possibleMoves[0];
        if (!next) break;

        // Determine pipe type needed
        const prevCell = path[path.length - 1];
        const pipeType = determinePipeType(prevCell, next);

        if (gameState.grid[next.row][next.col].type === PIPE_TYPES.EMPTY) {
            gameState.grid[next.row][next.col] = {
                type: pipeType.type,
                rotation: pipeType.rotation,
                connected: false
            };
        }

        current = { row: next.row, col: next.col };
        path.push(current);
    }
}

function determinePipeType(from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Straight pipes
    if (rowDiff !== 0 && colDiff === 0) {
        return { type: PIPE_TYPES.STRAIGHT, rotation: 90 }; // vertical
    }
    if (rowDiff === 0 && colDiff !== 0) {
        return { type: PIPE_TYPES.STRAIGHT, rotation: 0 }; // horizontal
    }

    // Corner pipes
    return { type: PIPE_TYPES.CORNER, rotation: Math.floor(Math.random() * 4) * 90 };
}

function fillEmptyCells() {
    const size = gameState.gridSize;
    const pipeTypes = [PIPE_TYPES.STRAIGHT, PIPE_TYPES.CORNER];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (gameState.grid[i][j].type === PIPE_TYPES.EMPTY) {
                const randomType = pipeTypes[Math.floor(Math.random() * pipeTypes.length)];
                gameState.grid[i][j] = {
                    type: randomType,
                    rotation: 0,
                    connected: false
                };
            }
        }
    }
}

function randomizeRotations() {
    const size = gameState.gridSize;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = gameState.grid[i][j];
            if (cell.type !== PIPE_TYPES.SOURCE && cell.type !== PIPE_TYPES.DRAIN) {
                cell.rotation = Math.floor(Math.random() * 4) * 90;
            }
        }
    }
}

// === Grid Rendering ===
function renderGrid() {
    elements.pipeGrid.innerHTML = '';
    elements.pipeGrid.className = `pipe-grid size-${gameState.gridSize}`;

    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            const cell = createPipeCell(i, j);
            elements.pipeGrid.appendChild(cell);
        }
    }
}

function createPipeCell(row, col) {
    const cellData = gameState.grid[row][col];
    const cell = document.createElement('div');
    cell.className = 'pipe-cell';
    cell.dataset.row = row;
    cell.dataset.col = col;

    if (cellData.type === PIPE_TYPES.SOURCE) {
        cell.classList.add('source');
        cell.innerHTML = '<div class="source-icon">💧</div>';
    } else if (cellData.type === PIPE_TYPES.DRAIN) {
        cell.classList.add('drain');
        cell.innerHTML = '<div class="drain-icon">🎯</div>';
    } else {
        const pipe = document.createElement('div');
        pipe.className = 'pipe';

        if (cellData.type === PIPE_TYPES.STRAIGHT) {
            pipe.classList.add(cellData.rotation === 0 || cellData.rotation === 180 ? 'straight-h' : 'straight-v');
        } else if (cellData.type === PIPE_TYPES.CORNER) {
            const cornerClass = getCornerClass(cellData.rotation);
            pipe.classList.add(cornerClass);
        }

        pipe.style.transform = `rotate(${cellData.rotation}deg)`;
        cell.appendChild(pipe);
    }

    if (cellData.connected) {
        cell.classList.add('connected');
    }

    // Add click/touch handler
    if (cellData.type !== PIPE_TYPES.SOURCE && cellData.type !== PIPE_TYPES.DRAIN) {
        cell.addEventListener('click', () => rotatePipe(row, col));
        cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rotatePipe(row, col);
        });
    }

    return cell;
}

function getCornerClass(rotation) {
    const classes = ['corner-tr', 'corner-br', 'corner-bl', 'corner-tl'];
    return classes[(rotation / 90) % 4];
}

// === Pipe Rotation ===
function rotatePipe(row, col) {
    const cell = gameState.grid[row][col];
    cell.rotation = (cell.rotation + 90) % 360;
    gameState.moves++;
    elements.moves.textContent = gameState.moves;

    renderGrid();
}

// === Flow Check ===
function checkFlow() {
    // Reset connected state
    for (let i = 0; i < gameState.gridSize; i++) {
        for (let j = 0; j < gameState.gridSize; j++) {
            gameState.grid[i][j].connected = false;
        }
    }

    // BFS to find connected path
    const visited = new Set();
    const queue = [gameState.source];
    visited.add(`${gameState.source.row},${gameState.source.col}`);

    while (queue.length > 0) {
        const current = queue.shift();
        const cell = gameState.grid[current.row][current.col];
        cell.connected = true;

        // Get connections from current cell
        const connections = getConnections(current.row, current.col);

        for (const next of connections) {
            const key = `${next.row},${next.col}`;
            if (!visited.has(key) && isValidConnection(current, next)) {
                visited.add(key);
                queue.push(next);
            }
        }
    }

    renderGrid();

    // Check if drain is connected
    if (gameState.grid[gameState.drain.row][gameState.drain.col].connected) {
        levelComplete();
    } else {
        elements.flowMessage.textContent = 'Not connected yet!';
        elements.flowMessage.style.background = '#f44336';
        elements.flowMessage.style.display = 'block';
        setTimeout(() => {
            elements.flowMessage.style.display = 'none';
        }, 2000);
    }
}

function getConnections(row, col) {
    const cell = gameState.grid[row][col];
    const connections = [];

    // Determine which sides are open based on pipe type and rotation
    const openSides = getOpenSides(cell);

    for (const side of openSides) {
        const next = getNeighbor(row, col, side);
        if (next) {
            connections.push(next);
        }
    }

    return connections;
}

function getOpenSides(cell) {
    const sides = [];

    if (cell.type === PIPE_TYPES.SOURCE) {
        sides.push('down');
    } else if (cell.type === PIPE_TYPES.DRAIN) {
        sides.push('up');
    } else if (cell.type === PIPE_TYPES.STRAIGHT) {
        if (cell.rotation === 0 || cell.rotation === 180) {
            sides.push('left', 'right');
        } else {
            sides.push('up', 'down');
        }
    } else if (cell.type === PIPE_TYPES.CORNER) {
        const rotation = cell.rotation % 360;
        if (rotation === 0) sides.push('up', 'right');
        else if (rotation === 90) sides.push('right', 'down');
        else if (rotation === 180) sides.push('down', 'left');
        else if (rotation === 270) sides.push('left', 'up');
    }

    return sides;
}

function getNeighbor(row, col, direction) {
    const neighbors = {
        'up': { row: row - 1, col: col },
        'down': { row: row + 1, col: col },
        'left': { row: row, col: col - 1 },
        'right': { row: row, col: col + 1 }
    };

    const next = neighbors[direction];
    if (next && next.row >= 0 && next.row < gameState.gridSize &&
        next.col >= 0 && next.col < gameState.gridSize) {
        return next;
    }
    return null;
}

function isValidConnection(from, to) {
    const fromSides = getOpenSides(gameState.grid[from.row][from.col]);
    const toSides = getOpenSides(gameState.grid[to.row][to.col]);

    // Determine direction from 'from' to 'to'
    let direction;
    if (to.row < from.row) direction = 'up';
    else if (to.row > from.row) direction = 'down';
    else if (to.col < from.col) direction = 'left';
    else if (to.col > from.col) direction = 'right';

    const opposite = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };

    return fromSides.includes(direction) && toSides.includes(opposite[direction]);
}

// === Level Complete ===
function levelComplete() {
    gameState.isFlowing = true;
    elements.flowMessage.textContent = 'Water is flowing!';
    elements.flowMessage.style.background = '#4CAF50';
    elements.flowMessage.style.display = 'block';
    elements.nextLevelBtn.style.display = 'inline-block';

    elements.finalMoves.textContent = gameState.moves;
    setTimeout(() => {
        elements.successOverlay.style.display = 'flex';
    }, 1000);
}

function nextLevel() {
    elements.successOverlay.style.display = 'none';
    const nextLevelIndex = (gameState.currentLevel + 1) % CONFIG.levels.length;
    startLevel(nextLevelIndex);
}

// === Event Handlers ===
function setupEventListeners() {
    elements.checkBtn.addEventListener('click', checkFlow);
    elements.checkBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        checkFlow();
    });

    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.nextLevelBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        nextLevel();
    });

    elements.restartBtn.addEventListener('click', () => startLevel(gameState.currentLevel));
    elements.restartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startLevel(gameState.currentLevel);
    });

    elements.continueBtn.addEventListener('click', nextLevel);
    elements.continueBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        nextLevel();
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
