'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    gravity: 0.5,
    spawnInterval: 1000, // ms between fruit spawns
    minSpawnInterval: 400,
    spawnIntervalDecrease: 50,
    fruitSpeed: { min: -18, max: -22 },
    bombChance: 0.15,
    sliceDistance: 40, // Distance for slice detection
};

const FRUITS = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥝', '🍑', '🥭'];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    lives: 3,
    isPlaying: false,
    fruits: [],
    sliceTrail: [],
    isSlicing: false,
    currentSpawnInterval: CONFIG.spawnInterval,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    livesDisplay: document.getElementById('lives'),
    finalScoreDisplay: document.getElementById('finalScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    sliceCanvas: document.getElementById('sliceCanvas'),
};

let ctx;
let spawnInterval = null;

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Fruit Ninja initialized');
    setupCanvas();
    setupEventListeners();
    resetGame();
}

function setupCanvas() {
    const canvas = elements.sliceCanvas;
    const rect = elements.gameArea.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx = canvas.getContext('2d');
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

    // Slice detection - touch
    elements.gameArea.addEventListener('touchstart', handleSliceStart);
    elements.gameArea.addEventListener('touchmove', handleSliceMove);
    elements.gameArea.addEventListener('touchend', handleSliceEnd);

    // Slice detection - mouse
    elements.gameArea.addEventListener('mousedown', handleSliceStart);
    elements.gameArea.addEventListener('mousemove', handleSliceMove);
    elements.gameArea.addEventListener('mouseup', handleSliceEnd);
    elements.gameArea.addEventListener('mouseleave', handleSliceEnd);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        if (gameState.isPlaying) {
            e.preventDefault();
        }
    }, { passive: false });

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        if (ctx) {
            setupCanvas();
        }
    });
}

// ==========================================
// GAME LOOP
// ==========================================

let lastTimestamp = 0;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = Math.min(timestamp - lastTimestamp, 50) / 16.67; // Normalize to 60fps
    lastTimestamp = timestamp;

    updateGame(deltaTime);
    renderGame();

    if (gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

function updateGame(deltaTime) {
    // Update fruits
    for (let i = gameState.fruits.length - 1; i >= 0; i--) {
        const fruit = gameState.fruits[i];

        // Apply physics
        fruit.velocityY += CONFIG.gravity * deltaTime;
        fruit.x += fruit.velocityX * deltaTime;
        fruit.y += fruit.velocityY * deltaTime;
        fruit.rotation += fruit.rotationSpeed * deltaTime;

        // Update element position
        fruit.element.style.left = fruit.x + 'px';
        fruit.element.style.top = fruit.y + 'px';
        fruit.element.style.transform = `rotate(${fruit.rotation}deg)`;

        // Remove if off screen (bottom or sides)
        const rect = elements.gameArea.getBoundingClientRect();
        if (fruit.y > rect.height + 100 || fruit.x < -100 || fruit.x > rect.width + 100) {
            // Lost a life if fruit fell off screen (not sliced and not a bomb)
            if (!fruit.sliced && !fruit.isBomb && fruit.y > rect.height + 100) {
                loseLife();
            }
            fruit.element.remove();
            gameState.fruits.splice(i, 1);
        }
    }

    // Fade slice trail
    if (gameState.sliceTrail.length > 0) {
        for (let i = 0; i < gameState.sliceTrail.length; i++) {
            gameState.sliceTrail[i].alpha -= 0.05;
        }
        gameState.sliceTrail = gameState.sliceTrail.filter(point => point.alpha > 0);
    }
}

function renderGame() {
    // Clear canvas
    ctx.clearRect(0, 0, elements.sliceCanvas.width, elements.sliceCanvas.height);

    // Draw slice trail
    if (gameState.sliceTrail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(gameState.sliceTrail[0].x, gameState.sliceTrail[0].y);

        for (let i = 1; i < gameState.sliceTrail.length; i++) {
            ctx.lineTo(gameState.sliceTrail[i].x, gameState.sliceTrail[i].y);
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(...gameState.sliceTrail.map(p => p.alpha))})`;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
}

// ==========================================
// FRUIT SPAWNING
// ==========================================

function startSpawning() {
    spawnFruit();
    spawnInterval = setInterval(() => {
        if (gameState.isPlaying) {
            spawnFruit();
        }
    }, gameState.currentSpawnInterval);
}

function stopSpawning() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
}

function spawnFruit() {
    const rect = elements.gameArea.getBoundingClientRect();
    const isBomb = Math.random() < CONFIG.bombChance;

    // Random spawn position along bottom
    const x = randomInt(50, rect.width - 100);
    const y = rect.height + 50;

    // Random upward velocity with slight horizontal variation
    const velocityY = randomInt(CONFIG.fruitSpeed.min, CONFIG.fruitSpeed.max);
    const velocityX = randomInt(-3, 3);

    const fruit = {
        x: x,
        y: y,
        velocityX: velocityX,
        velocityY: velocityY,
        rotation: randomInt(0, 360),
        rotationSpeed: randomInt(-5, 5),
        isBomb: isBomb,
        sliced: false,
        emoji: isBomb ? '💣' : FRUITS[randomInt(0, FRUITS.length - 1)],
        element: null,
    };

    // Create DOM element
    const element = document.createElement('div');
    element.className = isBomb ? 'bomb' : 'fruit';
    element.textContent = fruit.emoji;
    element.style.left = fruit.x + 'px';
    element.style.top = fruit.y + 'px';

    elements.gameArea.appendChild(element);
    fruit.element = element;

    gameState.fruits.push(fruit);
}

// ==========================================
// SLICING MECHANICS
// ==========================================

function handleSliceStart(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    gameState.isSlicing = true;
    gameState.sliceTrail = [];

    const point = getEventPoint(e);
    if (point) {
        gameState.sliceTrail.push({ ...point, alpha: 1 });
    }
}

function handleSliceMove(e) {
    if (!gameState.isPlaying || !gameState.isSlicing) return;
    e.preventDefault();

    const point = getEventPoint(e);
    if (point) {
        gameState.sliceTrail.push({ ...point, alpha: 1 });

        // Check for fruit collisions with slice trail
        checkSliceCollisions();
    }
}

function handleSliceEnd(e) {
    if (!gameState.isPlaying) return;
    e.preventDefault();

    gameState.isSlicing = false;
}

function getEventPoint(e) {
    const rect = elements.gameArea.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.type.startsWith('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        return null;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
    };
}

function checkSliceCollisions() {
    if (gameState.sliceTrail.length < 2) return;

    const lastPoint = gameState.sliceTrail[gameState.sliceTrail.length - 1];

    for (const fruit of gameState.fruits) {
        if (fruit.sliced) continue;

        // Check if slice point is near fruit center
        const fruitCenterX = fruit.x + 35; // Half of fruit width (70px)
        const fruitCenterY = fruit.y + 35;

        const distance = Math.sqrt(
            Math.pow(lastPoint.x - fruitCenterX, 2) +
            Math.pow(lastPoint.y - fruitCenterY, 2)
        );

        if (distance < CONFIG.sliceDistance) {
            sliceFruit(fruit);
        }
    }
}

function sliceFruit(fruit) {
    fruit.sliced = true;
    fruit.element.classList.add('sliced');

    if (fruit.isBomb) {
        // Hit a bomb - game over
        bombExplode(fruit);
        endGame();
    } else {
        // Slice the fruit
        createSliceEffect(fruit);
        incrementScore(10);

        // Increase difficulty
        if (gameState.score % 50 === 0 && gameState.currentSpawnInterval > CONFIG.minSpawnInterval) {
            gameState.currentSpawnInterval -= CONFIG.spawnIntervalDecrease;
            stopSpawning();
            startSpawning();
        }
    }

    // Remove fruit element after animation
    setTimeout(() => {
        fruit.element.remove();
    }, 500);
}

function createSliceEffect(fruit) {
    // Create fruit halves
    const half1 = document.createElement('div');
    half1.className = 'fruit-half';
    half1.textContent = fruit.emoji;
    half1.style.left = fruit.x + 'px';
    half1.style.top = fruit.y + 'px';

    const half2 = document.createElement('div');
    half2.className = 'fruit-half';
    half2.textContent = fruit.emoji;
    half2.style.left = fruit.x + 35 + 'px';
    half2.style.top = fruit.y + 'px';

    elements.gameArea.appendChild(half1);
    elements.gameArea.appendChild(half2);

    // Animate halves flying apart
    let startTime = null;
    function animateHalves(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 500, 1);

        const fall = progress * 200;
        const spread = progress * 50;

        half1.style.left = (fruit.x - spread) + 'px';
        half1.style.top = (fruit.y + fall) + 'px';
        half1.style.opacity = 1 - progress;

        half2.style.left = (fruit.x + 35 + spread) + 'px';
        half2.style.top = (fruit.y + fall) + 'px';
        half2.style.opacity = 1 - progress;

        if (progress < 1) {
            requestAnimationFrame(animateHalves);
        } else {
            half1.remove();
            half2.remove();
        }
    }
    requestAnimationFrame(animateHalves);

    // Create particles
    createParticles(fruit.x + 35, fruit.y + 35);

    // Show score popup
    showScorePopup(fruit.x + 35, fruit.y, '+10');
}

function createParticles(x, y) {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];

    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = colors[randomInt(0, colors.length - 1)];

        elements.gameArea.appendChild(particle);

        const angle = (Math.PI * 2 * i) / 8;
        const velocity = randomInt(3, 6);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let startTime = null;
        function animateParticle(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / 600, 1);

            const px = x + vx * elapsed / 10;
            const py = y + vy * elapsed / 10 + progress * 100;

            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        requestAnimationFrame(animateParticle);
    }
}

function bombExplode(bomb) {
    // Make bomb bigger and fade out
    bomb.element.style.transition = 'all 0.3s ease-out';
    bomb.element.style.transform = 'scale(3)';
    bomb.element.style.opacity = '0';

    // Create explosion effect
    const colors = ['#ff0000', '#ff6600', '#ffff00'];
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (bomb.x + 30) + 'px';
        particle.style.top = (bomb.y + 30) + 'px';
        particle.style.backgroundColor = colors[randomInt(0, colors.length - 1)];
        particle.style.width = '12px';
        particle.style.height = '12px';

        elements.gameArea.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = randomInt(5, 10);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let startTime = null;
        function animateExplosion(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / 500, 1);

            const px = (bomb.x + 30) + vx * elapsed / 8;
            const py = (bomb.y + 30) + vy * elapsed / 8;

            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - progress;

            if (progress < 1) {
                requestAnimationFrame(animateExplosion);
            } else {
                particle.remove();
            }
        }
        requestAnimationFrame(animateExplosion);
    }
}

function showScorePopup(x, y, text) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    elements.gameArea.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentSpawnInterval = CONFIG.spawnInterval;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateLivesDisplay();

    // Start spawning fruits
    startSpawning();

    // Start game loop
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopSpawning();

    // Clear all fruits
    for (const fruit of gameState.fruits) {
        fruit.element.remove();
    }
    gameState.fruits = [];

    // Show game over overlay
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isPlaying = false;
    gameState.fruits = [];
    gameState.sliceTrail = [];
    gameState.currentSpawnInterval = CONFIG.spawnInterval;

    // Clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, elements.sliceCanvas.width, elements.sliceCanvas.height);
    }

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateLivesDisplay();

    // Clear game area
    const fruitsInArea = elements.gameArea.querySelectorAll('.fruit, .bomb, .fruit-half, .particle, .score-popup');
    fruitsInArea.forEach(el => el.remove());

    console.log('Game reset');
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

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateLivesDisplay() {
    elements.livesDisplay.textContent = gameState.lives;
}

function incrementScore(points) {
    gameState.score += points;
    updateScoreDisplay();

    // Add visual feedback
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

function loseLife() {
    gameState.lives--;
    updateLivesDisplay();

    // Add shake animation
    elements.livesDisplay.classList.add('shake');
    setTimeout(() => {
        elements.livesDisplay.classList.remove('shake');
    }, 500);

    if (gameState.lives <= 0) {
        endGame();
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
