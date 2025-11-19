'use strict';

// === Configuration ===
const CONFIG = {
    canvasWidth: 760,
    canvasHeight: 400,
    beamCost: 10,
    cableCost: 5,
    carSpeed: 2,
    gravity: 0.5,
    maxStress: 100,
    levels: [
        { gap: 150, budget: 100, carWeight: 50 },
        { gap: 200, budget: 120, carWeight: 60 },
        { gap: 250, budget: 150, carWeight: 70 },
        { gap: 300, budget: 180, carWeight: 80 },
        { gap: 350, budget: 200, carWeight: 90 }
    ]
};

// === State Management ===
let gameState = {
    currentLevel: 0,
    budget: 100,
    budgetUsed: 0,
    building: true,
    testing: false,
    currentTool: 'beam',
    structures: [],
    anchors: [],
    car: null,
    leftCliff: { x: 0, y: 0, width: 0 },
    rightCliff: { x: 0, y: 0, width: 0 },
    gap: 150
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    level: document.getElementById('level'),
    budget: document.getElementById('budget'),
    beamTool: document.getElementById('beamTool'),
    cableTool: document.getElementById('cableTool'),
    clearBtn: document.getElementById('clearBtn'),
    testBtn: document.getElementById('testBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    statusMessage: document.getElementById('statusMessage'),
    successOverlay: document.getElementById('successOverlay'),
    failureOverlay: document.getElementById('failureOverlay'),
    budgetUsed: document.getElementById('budgetUsed'),
    continueBtn: document.getElementById('continueBtn'),
    retryBtn: document.getElementById('retryBtn')
};

let ctx;
let startPoint = null;
let tempLine = null;

// === Initialization ===
function initGame() {
    ctx = elements.canvas.getContext('2d');
    setupCanvas();
    setupEventListeners();
    startLevel(0);
}

function setupCanvas() {
    const container = elements.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const scale = Math.min(rect.width / CONFIG.canvasWidth, 1);

    elements.canvas.width = CONFIG.canvasWidth;
    elements.canvas.height = CONFIG.canvasHeight;
    elements.canvas.style.width = (CONFIG.canvasWidth * scale) + 'px';
    elements.canvas.style.height = (CONFIG.canvasHeight * scale) + 'px';
}

function startLevel(levelIndex) {
    gameState.currentLevel = levelIndex;
    const levelConfig = CONFIG.levels[levelIndex] || CONFIG.levels[0];

    gameState.budget = levelConfig.budget;
    gameState.budgetUsed = 0;
    gameState.gap = levelConfig.gap;
    gameState.building = true;
    gameState.testing = false;
    gameState.structures = [];
    gameState.anchors = [];
    startPoint = null;
    tempLine = null;

    elements.level.textContent = levelIndex + 1;
    updateBudgetDisplay();
    elements.nextLevelBtn.style.display = 'none';
    elements.statusMessage.textContent = 'Build your bridge!';
    elements.statusMessage.className = 'status-message';

    setupLevel();
    render();
}

function setupLevel() {
    const cliffWidth = 150;
    const cliffHeight = 200;
    const groundY = CONFIG.canvasHeight - 50;

    gameState.leftCliff = {
        x: 0,
        y: groundY - cliffHeight,
        width: cliffWidth,
        height: cliffHeight
    };

    gameState.rightCliff = {
        x: CONFIG.canvasWidth - cliffWidth,
        y: groundY - cliffHeight,
        width: cliffWidth,
        height: cliffHeight
    };

    // Create anchor points
    gameState.anchors = [];
    const anchorSpacing = 30;

    // Left cliff anchors
    for (let y = groundY - cliffHeight; y <= groundY; y += anchorSpacing) {
        gameState.anchors.push({ x: cliffWidth, y: y, fixed: true });
    }

    // Right cliff anchors
    for (let y = groundY - cliffHeight; y <= groundY; y += anchorSpacing) {
        gameState.anchors.push({ x: CONFIG.canvasWidth - cliffWidth, y: y, fixed: true });
    }
}

// === Rendering ===
function render() {
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Draw sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    // Draw ground
    const groundY = CONFIG.canvasHeight - 50;
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, groundY, CONFIG.canvasWidth, CONFIG.canvasHeight - groundY);

    // Draw grass
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, groundY - 5, CONFIG.canvasWidth, 5);

    // Draw cliffs
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(gameState.leftCliff.x, gameState.leftCliff.y,
        gameState.leftCliff.width, gameState.leftCliff.height);
    ctx.fillRect(gameState.rightCliff.x, gameState.rightCliff.y,
        gameState.rightCliff.width, gameState.rightCliff.height);

    // Draw anchors (in build mode)
    if (gameState.building) {
        gameState.anchors.forEach(anchor => {
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(anchor.x, anchor.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Draw structures
    gameState.structures.forEach(structure => {
        drawStructure(structure);
    });

    // Draw temporary line
    if (tempLine) {
        ctx.strokeStyle = gameState.currentTool === 'beam' ? '#8B4513' : '#888';
        ctx.lineWidth = gameState.currentTool === 'beam' ? 6 : 2;
        ctx.setLineDash(gameState.currentTool === 'cable' ? [5, 5] : []);
        ctx.beginPath();
        ctx.moveTo(tempLine.x1, tempLine.y1);
        ctx.lineTo(tempLine.x2, tempLine.y2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw car
    if (gameState.car) {
        drawCar(gameState.car);
    }
}

function drawStructure(structure) {
    ctx.strokeStyle = structure.type === 'beam' ? '#8B4513' : '#888';
    ctx.lineWidth = structure.type === 'beam' ? 6 : 2;

    if (structure.type === 'cable') {
        ctx.setLineDash([5, 5]);
    }

    ctx.beginPath();
    ctx.moveTo(structure.x1, structure.y1);
    ctx.lineTo(structure.x2, structure.y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Show stress if testing
    if (gameState.testing && structure.stress > CONFIG.maxStress * 0.7) {
        ctx.strokeStyle = structure.stress > CONFIG.maxStress ? '#f44336' : '#ff9800';
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(structure.x1, structure.y1);
        ctx.lineTo(structure.x2, structure.y2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

function drawCar(car) {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(car.x - 15, car.y - 10, 30, 15);

    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(car.x - 8, car.y + 5, 5, 0, Math.PI * 2);
    ctx.arc(car.x + 8, car.y + 5, 5, 0, Math.PI * 2);
    ctx.fill();

    // Window
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(car.x - 8, car.y - 8, 16, 8);
}

// === Drawing Interaction ===
function getCanvasCoordinates(e) {
    const rect = elements.canvas.getBoundingClientRect();
    const scaleX = CONFIG.canvasWidth / rect.width;
    const scaleY = CONFIG.canvasHeight / rect.height;

    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function findNearestAnchor(x, y, maxDistance = 20) {
    let nearest = null;
    let minDist = maxDistance;

    gameState.anchors.forEach(anchor => {
        const dist = Math.sqrt((x - anchor.x) ** 2 + (y - anchor.y) ** 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = anchor;
        }
    });

    // Also check existing structure endpoints
    gameState.structures.forEach(structure => {
        const dist1 = Math.sqrt((x - structure.x1) ** 2 + (y - structure.y1) ** 2);
        const dist2 = Math.sqrt((x - structure.x2) ** 2 + (y - structure.y2) ** 2);

        if (dist1 < minDist) {
            minDist = dist1;
            nearest = { x: structure.x1, y: structure.y1 };
        }
        if (dist2 < minDist) {
            minDist = dist2;
            nearest = { x: structure.x2, y: structure.y2 };
        }
    });

    return nearest;
}

function handleCanvasStart(e) {
    if (!gameState.building) return;
    e.preventDefault();

    const coords = getCanvasCoordinates(e);
    const anchor = findNearestAnchor(coords.x, coords.y);

    if (anchor) {
        startPoint = anchor;
    }
}

function handleCanvasMove(e) {
    if (!gameState.building || !startPoint) return;
    e.preventDefault();

    const coords = getCanvasCoordinates(e);
    tempLine = {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: coords.x,
        y2: coords.y
    };

    render();
}

function handleCanvasEnd(e) {
    if (!gameState.building || !startPoint) return;
    e.preventDefault();

    const coords = getCanvasCoordinates(e);
    const endAnchor = findNearestAnchor(coords.x, coords.y);

    if (endAnchor && endAnchor !== startPoint) {
        const cost = gameState.currentTool === 'beam' ? CONFIG.beamCost : CONFIG.cableCost;

        if (gameState.budgetUsed + cost <= gameState.budget) {
            gameState.structures.push({
                type: gameState.currentTool,
                x1: startPoint.x,
                y1: startPoint.y,
                x2: endAnchor.x,
                y2: endAnchor.y,
                stress: 0
            });

            gameState.budgetUsed += cost;
            updateBudgetDisplay();

            // Add new anchor points at endpoints
            if (!gameState.anchors.some(a => a.x === startPoint.x && a.y === startPoint.y && !a.fixed)) {
                gameState.anchors.push({ x: startPoint.x, y: startPoint.y, fixed: false });
            }
            if (!gameState.anchors.some(a => a.x === endAnchor.x && a.y === endAnchor.y && !a.fixed)) {
                gameState.anchors.push({ x: endAnchor.x, y: endAnchor.y, fixed: false });
            }
        } else {
            elements.statusMessage.textContent = 'Not enough budget!';
            elements.statusMessage.className = 'status-message error';
        }
    }

    startPoint = null;
    tempLine = null;
    render();
}

// === Budget Management ===
function updateBudgetDisplay() {
    const remaining = gameState.budget - gameState.budgetUsed;
    elements.budget.textContent = `$${remaining}`;

    // Update tool buttons
    if (remaining < CONFIG.beamCost) {
        elements.beamTool.classList.add('disabled');
    } else {
        elements.beamTool.classList.remove('disabled');
    }

    if (remaining < CONFIG.cableCost) {
        elements.cableTool.classList.add('disabled');
    } else {
        elements.cableTool.classList.remove('disabled');
    }
}

// === Bridge Testing ===
function testBridge() {
    if (gameState.structures.length === 0) {
        elements.statusMessage.textContent = 'Build something first!';
        elements.statusMessage.className = 'status-message error';
        return;
    }

    gameState.building = false;
    gameState.testing = true;
    elements.testBtn.style.display = 'none';
    elements.statusMessage.textContent = 'Testing bridge...';
    elements.statusMessage.className = 'status-message';

    // Create car
    const groundY = CONFIG.canvasHeight - 50;
    gameState.car = {
        x: gameState.leftCliff.width - 20,
        y: groundY - gameState.leftCliff.height - 15,
        vx: CONFIG.carSpeed,
        vy: 0,
        onBridge: false
    };

    animateCar();
}

function animateCar() {
    if (!gameState.testing) return;

    const car = gameState.car;

    // Apply gravity
    car.vy += CONFIG.gravity;
    car.y += car.vy;
    car.x += car.vx;

    // Check if car is on a beam
    let onBeam = false;
    const carBottom = car.y + 10;

    gameState.structures.forEach(structure => {
        if (structure.type !== 'beam') return;

        // Simple collision detection for horizontal beams
        const minX = Math.min(structure.x1, structure.x2);
        const maxX = Math.max(structure.x1, structure.x2);
        const minY = Math.min(structure.y1, structure.y2);
        const maxY = Math.max(structure.y1, structure.y2);

        if (car.x >= minX && car.x <= maxX &&
            carBottom >= minY - 5 && carBottom <= maxY + 5) {
            car.y = Math.min(structure.y1, structure.y2) - 15;
            car.vy = 0;
            onBeam = true;
            car.onBridge = true;

            // Add stress
            structure.stress += 10;
        }
    });

    // Check if car reached the right cliff
    if (car.x >= gameState.rightCliff.x) {
        levelComplete();
        return;
    }

    // Check if car fell
    const groundY = CONFIG.canvasHeight - 50;
    if (car.y > groundY) {
        bridgeFailed();
        return;
    }

    // Check for structural failure
    const failed = gameState.structures.some(s => s.stress > CONFIG.maxStress);
    if (failed) {
        bridgeFailed();
        return;
    }

    render();
    requestAnimationFrame(animateCar);
}

// === Level Complete/Fail ===
function levelComplete() {
    gameState.testing = false;
    elements.statusMessage.textContent = 'Success!';
    elements.statusMessage.className = 'status-message success';
    elements.budgetUsed.textContent = `$${gameState.budgetUsed}`;
    elements.nextLevelBtn.style.display = 'inline-block';

    setTimeout(() => {
        elements.successOverlay.style.display = 'flex';
    }, 1000);
}

function bridgeFailed() {
    gameState.testing = false;
    elements.statusMessage.textContent = 'Bridge collapsed!';
    elements.statusMessage.className = 'status-message error';

    setTimeout(() => {
        elements.failureOverlay.style.display = 'flex';
    }, 1000);
}

function clearBridge() {
    gameState.structures = [];
    gameState.budgetUsed = 0;
    updateBudgetDisplay();
    elements.statusMessage.textContent = 'Bridge cleared!';
    elements.statusMessage.className = 'status-message';
    setupLevel();
    render();
}

function nextLevel() {
    elements.successOverlay.style.display = 'none';
    const nextLevelIndex = (gameState.currentLevel + 1) % CONFIG.levels.length;
    startLevel(nextLevelIndex);
}

function retryLevel() {
    elements.failureOverlay.style.display = 'none';
    elements.testBtn.style.display = 'inline-block';
    gameState.building = true;
    gameState.testing = false;
    gameState.car = null;
    gameState.structures.forEach(s => s.stress = 0);
    elements.statusMessage.textContent = 'Try again!';
    elements.statusMessage.className = 'status-message';
    render();
}

// === Event Handlers ===
function setupEventListeners() {
    // Canvas events
    elements.canvas.addEventListener('mousedown', handleCanvasStart);
    elements.canvas.addEventListener('mousemove', handleCanvasMove);
    elements.canvas.addEventListener('mouseup', handleCanvasEnd);
    elements.canvas.addEventListener('touchstart', handleCanvasStart, { passive: false });
    elements.canvas.addEventListener('touchmove', handleCanvasMove, { passive: false });
    elements.canvas.addEventListener('touchend', handleCanvasEnd, { passive: false });

    // Tool selection
    elements.beamTool.addEventListener('click', () => {
        if (!elements.beamTool.classList.contains('disabled')) {
            gameState.currentTool = 'beam';
            elements.beamTool.classList.add('active');
            elements.cableTool.classList.remove('active');
        }
    });

    elements.cableTool.addEventListener('click', () => {
        if (!elements.cableTool.classList.contains('disabled')) {
            gameState.currentTool = 'cable';
            elements.cableTool.classList.add('active');
            elements.beamTool.classList.remove('active');
        }
    });

    // Action buttons
    elements.clearBtn.addEventListener('click', clearBridge);
    elements.testBtn.addEventListener('click', testBridge);
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    elements.continueBtn.addEventListener('click', nextLevel);
    elements.retryBtn.addEventListener('click', retryLevel);

    // Window resize
    window.addEventListener('resize', () => {
        setupCanvas();
        render();
    });
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
