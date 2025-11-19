'use strict';

// === Configuration ===
const CONFIG = {
    canvasSize: 400,
    pieceColors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8'],
    snapThreshold: 20
};

// === State Management ===
let gameState = {
    isPlaying: false,
    currentPuzzle: 0,
    completed: 0,
    pieces: [],
    selectedPiece: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    rotateBtn: document.getElementById('rotateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    nextBtn: document.getElementById('nextBtn'),
    gameMessage: document.getElementById('gameMessage'),
    puzzleNum: document.getElementById('puzzleNum'),
    completed: document.getElementById('completed'),
    targetCanvas: document.getElementById('targetCanvas'),
    puzzleCanvas: document.getElementById('puzzleCanvas'),
    successOverlay: document.getElementById('successOverlay'),
    continueBtn: document.getElementById('continueBtn')
};

const targetCtx = elements.targetCanvas.getContext('2d');
const puzzleCtx = elements.puzzleCanvas.getContext('2d');

// === Tangram Puzzles ===
const puzzles = [
    {
        name: 'Square',
        pieces: [
            { type: 'triangle', size: 100, x: 100, y: 100, rotation: 0, targetRotation: 0 },
            { type: 'triangle', size: 100, x: 200, y: 100, rotation: 0, targetRotation: 90 },
            { type: 'triangle', size: 100, x: 100, y: 200, rotation: 0, targetRotation: 270 },
            { type: 'triangle', size: 100, x: 200, y: 200, rotation: 0, targetRotation: 180 }
        ],
        target: { x: 150, y: 150, size: 200 }
    },
    {
        name: 'House',
        pieces: [
            { type: 'triangle', size: 80, x: 150, y: 80, rotation: 0, targetRotation: 0 },
            { type: 'triangle', size: 80, x: 230, y: 80, rotation: 0, targetRotation: 90 },
            { type: 'square', size: 80, x: 150, y: 160, rotation: 0, targetRotation: 0 },
            { type: 'square', size: 80, x: 230, y: 160, rotation: 0, targetRotation: 0 }
        ],
        target: { x: 190, y: 130, size: 160 }
    },
    {
        name: 'Boat',
        pieces: [
            { type: 'triangle', size: 70, x: 120, y: 120, rotation: 0, targetRotation: 0 },
            { type: 'triangle', size: 70, x: 190, y: 120, rotation: 0, targetRotation: 90 },
            { type: 'triangle', size: 70, x: 155, y: 190, rotation: 0, targetRotation: 180 },
            { type: 'square', size: 50, x: 155, y: 150, rotation: 0, targetRotation: 45 }
        ],
        target: { x: 155, y: 155, size: 150 }
    }
];

// === Initialization ===
function initGame() {
    setupCanvas();
    setupEventListeners();
}

function setupCanvas() {
    const size = Math.min(CONFIG.canvasSize, window.innerWidth - 60);

    elements.targetCanvas.width = size * 0.6;
    elements.targetCanvas.height = size * 0.6;

    elements.puzzleCanvas.width = size;
    elements.puzzleCanvas.height = size;
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.rotateBtn.addEventListener('click', rotatePiece);
    elements.rotateBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        rotatePiece();
    });

    elements.resetBtn.addEventListener('click', resetPuzzle);
    elements.resetBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetPuzzle();
    });

    elements.nextBtn.addEventListener('click', nextPuzzle);
    elements.nextBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        nextPuzzle();
    });

    elements.continueBtn.addEventListener('click', () => {
        elements.successOverlay.style.display = 'none';
        nextPuzzle();
    });
    elements.continueBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.successOverlay.style.display = 'none';
        nextPuzzle();
    });

    // Mouse events
    elements.puzzleCanvas.addEventListener('mousedown', handlePointerDown);
    elements.puzzleCanvas.addEventListener('mousemove', handlePointerMove);
    elements.puzzleCanvas.addEventListener('mouseup', handlePointerUp);

    // Touch events
    elements.puzzleCanvas.addEventListener('touchstart', handleTouchStart);
    elements.puzzleCanvas.addEventListener('touchmove', handleTouchMove);
    elements.puzzleCanvas.addEventListener('touchend', handleTouchEnd);

    window.addEventListener('resize', () => {
        setupCanvas();
        if (gameState.isPlaying) {
            render();
        }
    });
}

// === Game Control ===
function startGame() {
    gameState.isPlaying = true;
    gameState.currentPuzzle = 0;
    gameState.completed = 0;

    elements.startBtn.style.display = 'none';
    elements.rotateBtn.style.display = 'inline-block';
    elements.resetBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    loadPuzzle();
    updateUI();
}

function loadPuzzle() {
    const puzzle = puzzles[gameState.currentPuzzle % puzzles.length];

    // Initialize pieces with random positions
    gameState.pieces = puzzle.pieces.map((p, i) => ({
        ...p,
        x: 50 + Math.random() * (elements.puzzleCanvas.width - 100),
        y: 50 + Math.random() * (elements.puzzleCanvas.height - 100),
        rotation: Math.floor(Math.random() * 4) * 90,
        color: CONFIG.pieceColors[i % CONFIG.pieceColors.length],
        id: i
    }));

    renderTarget(puzzle);
    render();
}

function renderTarget(puzzle) {
    const ctx = targetCtx;
    const canvas = elements.targetCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale to fit canvas
    const scale = Math.min(canvas.width, canvas.height) / 300;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);

    // Draw silhouette
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.3;

    puzzle.pieces.forEach(piece => {
        const targetX = piece.x - puzzle.target.x;
        const targetY = piece.y - puzzle.target.y;

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.rotate((piece.targetRotation * Math.PI) / 180);
        drawPieceShape(ctx, piece.type, piece.size, '#333');
        ctx.restore();
    });

    ctx.restore();
}

function render() {
    const ctx = puzzleCtx;
    const canvas = elements.puzzleCanvas;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all pieces
    gameState.pieces.forEach(piece => {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);

        // Highlight selected piece
        if (gameState.selectedPiece && gameState.selectedPiece.id === piece.id) {
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = 4;
            drawPieceShape(ctx, piece.type, piece.size + 4, null, true);
        }

        drawPieceShape(ctx, piece.type, piece.size, piece.color);
        ctx.restore();
    });
}

function drawPieceShape(ctx, type, size, color, strokeOnly = false) {
    ctx.beginPath();

    if (type === 'triangle') {
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
    } else if (type === 'square') {
        ctx.rect(-size / 2, -size / 2, size, size);
    }

    if (strokeOnly) {
        ctx.stroke();
    } else if (color) {
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// === Pointer Events ===
function handlePointerDown(e) {
    const pos = getCanvasPos(e);
    selectPieceAt(pos.x, pos.y);

    if (gameState.selectedPiece) {
        gameState.isDragging = true;
        gameState.dragOffset = {
            x: pos.x - gameState.selectedPiece.x,
            y: pos.y - gameState.selectedPiece.y
        };
    }
}

function handlePointerMove(e) {
    if (!gameState.isDragging || !gameState.selectedPiece) return;

    const pos = getCanvasPos(e);
    gameState.selectedPiece.x = pos.x - gameState.dragOffset.x;
    gameState.selectedPiece.y = pos.y - gameState.dragOffset.y;

    render();
}

function handlePointerUp(e) {
    gameState.isDragging = false;
    checkCompletion();
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerDown(touch);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    handlePointerUp(e);
}

function getCanvasPos(e) {
    const rect = elements.puzzleCanvas.getBoundingClientRect();
    const scaleX = elements.puzzleCanvas.width / rect.width;
    const scaleY = elements.puzzleCanvas.height / rect.height;

    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function selectPieceAt(x, y) {
    // Check pieces in reverse order (top to bottom)
    for (let i = gameState.pieces.length - 1; i >= 0; i--) {
        const piece = gameState.pieces[i];
        const dx = x - piece.x;
        const dy = y - piece.y;

        // Simple distance check
        if (Math.abs(dx) < piece.size / 2 && Math.abs(dy) < piece.size / 2) {
            gameState.selectedPiece = piece;

            // Move to top
            gameState.pieces.splice(i, 1);
            gameState.pieces.push(piece);

            render();
            return;
        }
    }

    gameState.selectedPiece = null;
    render();
}

// === Piece Operations ===
function rotatePiece() {
    if (!gameState.selectedPiece) {
        // Rotate the last placed piece
        if (gameState.pieces.length > 0) {
            gameState.selectedPiece = gameState.pieces[gameState.pieces.length - 1];
        }
    }

    if (gameState.selectedPiece) {
        gameState.selectedPiece.rotation = (gameState.selectedPiece.rotation + 90) % 360;
        render();
        checkCompletion();
    }
}

function resetPuzzle() {
    loadPuzzle();
}

function nextPuzzle() {
    gameState.currentPuzzle++;
    elements.nextBtn.style.display = 'none';

    if (gameState.currentPuzzle >= puzzles.length * 3) {
        // Game completed
        alert('Congratulations! You completed all puzzles!');
        showLevelSelection();
        return;
    }

    loadPuzzle();
    updateUI();
}

function checkCompletion() {
    const puzzle = puzzles[gameState.currentPuzzle % puzzles.length];

    // Simple completion check based on piece positions
    let correctPieces = 0;

    gameState.pieces.forEach(piece => {
        const originalPiece = puzzle.pieces.find(p => p.type === piece.type && p.size === piece.size);
        if (!originalPiece) return;

        const targetX = originalPiece.x;
        const targetY = originalPiece.y;
        const targetRotation = originalPiece.targetRotation;

        const distX = Math.abs(piece.x - targetX);
        const distY = Math.abs(piece.y - targetY);
        const rotationMatch = piece.rotation % 360 === targetRotation % 360;

        if (distX < CONFIG.snapThreshold && distY < CONFIG.snapThreshold && rotationMatch) {
            correctPieces++;

            // Snap to position
            piece.x = targetX;
            piece.y = targetY;
        }
    });

    if (correctPieces === gameState.pieces.length) {
        puzzleComplete();
    }

    render();
}

function puzzleComplete() {
    gameState.completed++;
    updateUI();

    elements.successOverlay.style.display = 'flex';
}

function updateUI() {
    elements.puzzleNum.textContent = gameState.currentPuzzle + 1;
    elements.completed.textContent = gameState.completed;
}

function showLevelSelection() {
    gameState.isPlaying = false;

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.rotateBtn.style.display = 'none';
    elements.resetBtn.style.display = 'none';
    elements.nextBtn.style.display = 'none';

    puzzleCtx.clearRect(0, 0, elements.puzzleCanvas.width, elements.puzzleCanvas.height);
    targetCtx.clearRect(0, 0, elements.targetCanvas.width, elements.targetCanvas.height);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
