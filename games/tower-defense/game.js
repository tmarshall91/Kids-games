'use strict';

// === Configuration ===
const CONFIG = {
    towerTypes: {
        basic: { cost: 50, damage: 10, range: 100, fireRate: 1000, color: '#4a90e2', emoji: '🗼' },
        fast: { cost: 75, damage: 5, range: 80, fireRate: 500, color: '#f5a623', emoji: '⚡' },
        strong: { cost: 100, damage: 25, range: 120, fireRate: 1500, color: '#e74c3c', emoji: '💪' }
    },
    gridSize: 40,
    pathColor: '#8b4513',
    projectileSpeed: 5
};

// === State Management ===
let gameState = {
    isPlaying: false,
    coins: 100,
    lives: 10,
    wave: 1,
    monstersDefeated: 0,
    towers: [],
    monsters: [],
    projectiles: [],
    selectedTowerType: 'basic',
    path: [],
    waveInProgress: false
};

// === DOM References ===
const elements = {
    canvas: document.getElementById('gameCanvas'),
    startBtn: document.getElementById('startBtn'),
    nextWaveBtn: document.getElementById('nextWaveBtn'),
    gameMessage: document.getElementById('gameMessage'),
    coins: document.getElementById('coins'),
    lives: document.getElementById('lives'),
    wave: document.getElementById('wave'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    finalWave: document.getElementById('finalWave'),
    monstersDefeated: document.getElementById('monstersDefeated'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    towerSelection: document.getElementById('towerSelection')
};

const ctx = elements.canvas.getContext('2d');

// === Initialization ===
function initGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEventListeners();
    createPath();
}

function resizeCanvas() {
    const container = elements.canvas.parentElement;
    elements.canvas.width = container.clientWidth;
    elements.canvas.height = Math.max(400, container.clientHeight);
    if (gameState.isPlaying) {
        render();
    }
}

function createPath() {
    // Create a simple winding path from left to right
    const w = elements.canvas.width;
    const h = elements.canvas.height;
    const cellSize = CONFIG.gridSize;

    gameState.path = [
        { x: -cellSize, y: h / 2 },
        { x: w * 0.2, y: h / 2 },
        { x: w * 0.2, y: h * 0.3 },
        { x: w * 0.5, y: h * 0.3 },
        { x: w * 0.5, y: h * 0.7 },
        { x: w * 0.8, y: h * 0.7 },
        { x: w * 0.8, y: h / 2 },
        { x: w + cellSize, y: h / 2 }
    ];
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.nextWaveBtn.addEventListener('click', startNextWave);
    elements.nextWaveBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startNextWave();
    });

    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetGame();
    });

    // Tower selection
    const towerOptions = elements.towerSelection.querySelectorAll('.tower-option');
    towerOptions.forEach(option => {
        const selectTower = (e) => {
            e.preventDefault();
            const type = option.dataset.type;
            const cost = parseInt(option.dataset.cost);

            if (gameState.coins >= cost) {
                towerOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                gameState.selectedTowerType = type;
            }
        };

        option.addEventListener('click', selectTower);
        option.addEventListener('touchend', selectTower);
    });

    // Canvas click for placing towers
    elements.canvas.addEventListener('click', handleCanvasClick);
    elements.canvas.addEventListener('touchend', handleCanvasTouch);
}

function handleCanvasClick(e) {
    if (!gameState.isPlaying) return;
    const rect = elements.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    placeTower(x, y);
}

function handleCanvasTouch(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();
    const rect = elements.canvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    placeTower(x, y);
}

function placeTower(x, y) {
    const type = gameState.selectedTowerType;
    const towerConfig = CONFIG.towerTypes[type];

    if (gameState.coins < towerConfig.cost) return;

    // Check if on path
    if (isOnPath(x, y)) return;

    // Check if too close to another tower
    const tooClose = gameState.towers.some(tower => {
        const dist = Math.hypot(tower.x - x, tower.y - y);
        return dist < CONFIG.gridSize;
    });

    if (tooClose) return;

    // Place tower
    gameState.towers.push({
        x, y,
        type,
        ...towerConfig,
        lastFire: 0
    });

    gameState.coins -= towerConfig.cost;
    updateUI();
}

function isOnPath(x, y) {
    const buffer = CONFIG.gridSize * 0.8;
    for (let i = 0; i < gameState.path.length - 1; i++) {
        const p1 = gameState.path[i];
        const p2 = gameState.path[i + 1];

        const dist = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < buffer) return true;
    }
    return false;
}

function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// === Game Loop ===
let lastTime = 0;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(timestamp, deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}

function update(timestamp, deltaTime) {
    // Update monsters
    for (let i = gameState.monsters.length - 1; i >= 0; i--) {
        const monster = gameState.monsters[i];
        moveMonster(monster, deltaTime);

        // Check if reached end
        if (monster.pathIndex >= gameState.path.length - 1) {
            gameState.monsters.splice(i, 1);
            gameState.lives--;
            updateUI();

            if (gameState.lives <= 0) {
                gameOver(false);
            }
        }
    }

    // Update towers (fire at monsters)
    gameState.towers.forEach(tower => {
        if (timestamp - tower.lastFire > tower.fireRate) {
            const target = findClosestMonster(tower);
            if (target) {
                fireTower(tower, target, timestamp);
            }
        }
    });

    // Update projectiles
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const proj = gameState.projectiles[i];

        // Move projectile
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dist = Math.hypot(dx, dy);

        if (dist < CONFIG.projectileSpeed) {
            // Hit target
            if (proj.target && gameState.monsters.includes(proj.target)) {
                proj.target.health -= proj.damage;
                if (proj.target.health <= 0) {
                    const idx = gameState.monsters.indexOf(proj.target);
                    if (idx > -1) {
                        gameState.monsters.splice(idx, 1);
                        gameState.monstersDefeated++;
                        gameState.coins += proj.target.reward;
                        updateUI();
                    }
                }
            }
            gameState.projectiles.splice(i, 1);
        } else {
            proj.x += (dx / dist) * CONFIG.projectileSpeed;
            proj.y += (dy / dist) * CONFIG.projectileSpeed;

            // Update target position if target moved
            if (proj.target && gameState.monsters.includes(proj.target)) {
                proj.targetX = proj.target.x;
                proj.targetY = proj.target.y;
            }
        }
    }

    // Check wave completion
    if (gameState.waveInProgress && gameState.monsters.length === 0) {
        gameState.waveInProgress = false;
        elements.nextWaveBtn.style.display = 'inline-block';
    }
}

function moveMonster(monster, deltaTime) {
    const speed = monster.speed * (deltaTime / 16.67); // Normalize to 60fps

    if (monster.pathIndex >= gameState.path.length - 1) return;

    const target = gameState.path[monster.pathIndex + 1];
    const dx = target.x - monster.x;
    const dy = target.y - monster.y;
    const dist = Math.hypot(dx, dy);

    if (dist < speed) {
        monster.pathIndex++;
        if (monster.pathIndex < gameState.path.length - 1) {
            moveMonster(monster, deltaTime * (1 - dist / speed));
        }
    } else {
        monster.x += (dx / dist) * speed;
        monster.y += (dy / dist) * speed;
    }
}

function findClosestMonster(tower) {
    let closest = null;
    let minDist = tower.range;

    gameState.monsters.forEach(monster => {
        const dist = Math.hypot(monster.x - tower.x, monster.y - tower.y);
        if (dist < minDist) {
            minDist = dist;
            closest = monster;
        }
    });

    return closest;
}

function fireTower(tower, target, timestamp) {
    tower.lastFire = timestamp;
    gameState.projectiles.push({
        x: tower.x,
        y: tower.y,
        targetX: target.x,
        targetY: target.y,
        target: target,
        damage: tower.damage,
        color: tower.color
    });
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Draw path
    ctx.strokeStyle = CONFIG.pathColor;
    ctx.lineWidth = CONFIG.gridSize * 1.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    gameState.path.forEach((point, i) => {
        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.stroke();

    // Draw towers
    gameState.towers.forEach(tower => {
        // Tower base
        ctx.fillStyle = tower.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Tower range (semi-transparent)
        ctx.fillStyle = tower.color + '20';
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.fill();

        // Emoji
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tower.emoji, tower.x, tower.y);
    });

    // Draw monsters
    gameState.monsters.forEach(monster => {
        // Monster body
        ctx.fillStyle = monster.color;
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, monster.size, 0, Math.PI * 2);
        ctx.fill();

        // Monster emoji
        ctx.font = `${monster.size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(monster.emoji, monster.x, monster.y);

        // Health bar
        const barWidth = monster.size * 2;
        const barHeight = 4;
        const healthPercent = monster.health / monster.maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(monster.x - barWidth / 2, monster.y - monster.size - 10, barWidth, barHeight);

        ctx.fillStyle = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
        ctx.fillRect(monster.x - barWidth / 2, monster.y - monster.size - 10, barWidth * healthPercent, barHeight);
    });

    // Draw projectiles
    gameState.projectiles.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// === Game Control ===
function startGame() {
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    elements.nextWaveBtn.style.display = 'inline-block';

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function startNextWave() {
    elements.nextWaveBtn.style.display = 'none';
    gameState.waveInProgress = true;

    // Spawn monsters
    const monsterCount = 5 + gameState.wave * 2;
    const monsterTypes = [
        { emoji: '👾', color: '#9c27b0', health: 30, speed: 1, reward: 15, size: 15 },
        { emoji: '👻', color: '#2196f3', health: 50, speed: 0.7, reward: 25, size: 18 },
        { emoji: '🦇', color: '#f44336', health: 20, speed: 1.5, reward: 10, size: 12 }
    ];

    for (let i = 0; i < monsterCount; i++) {
        setTimeout(() => {
            const typeIndex = Math.floor(Math.random() * Math.min(monsterTypes.length, Math.ceil(gameState.wave / 2)));
            const type = monsterTypes[typeIndex];
            const healthMultiplier = 1 + (gameState.wave - 1) * 0.3;

            gameState.monsters.push({
                x: gameState.path[0].x,
                y: gameState.path[0].y,
                pathIndex: 0,
                ...type,
                health: type.health * healthMultiplier,
                maxHealth: type.health * healthMultiplier
            });
        }, i * 1000);
    }

    gameState.wave++;
    updateUI();
}

function updateUI() {
    elements.coins.textContent = gameState.coins;
    elements.lives.textContent = gameState.lives;
    elements.wave.textContent = gameState.wave;

    // Update tower options
    const towerOptions = elements.towerSelection.querySelectorAll('.tower-option');
    towerOptions.forEach(option => {
        const cost = parseInt(option.dataset.cost);
        if (gameState.coins < cost) {
            option.classList.add('disabled');
        } else {
            option.classList.remove('disabled');
        }
    });
}

function gameOver(won) {
    gameState.isPlaying = false;
    elements.gameOverOverlay.style.display = 'flex';
    elements.gameOverTitle.textContent = won ? '🎉 Victory!' : '💔 Game Over';
    elements.finalWave.textContent = gameState.wave - 1;
    elements.monstersDefeated.textContent = gameState.monstersDefeated;
}

function resetGame() {
    gameState = {
        isPlaying: false,
        coins: 100,
        lives: 10,
        wave: 1,
        monstersDefeated: 0,
        towers: [],
        monsters: [],
        projectiles: [],
        selectedTowerType: 'basic',
        path: gameState.path,
        waveInProgress: false
    };

    elements.gameOverOverlay.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.nextWaveBtn.style.display = 'none';
    elements.gameMessage.style.display = 'block';

    const towerOptions = elements.towerSelection.querySelectorAll('.tower-option');
    towerOptions.forEach(opt => opt.classList.remove('selected'));
    towerOptions[0].classList.add('selected');

    updateUI();
    render();
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
