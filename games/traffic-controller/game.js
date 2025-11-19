'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fps: 60,
    carSpeed: 2,
    spawnInterval: 2000, // milliseconds
    maxCrashes: 3,
    pointsPerCar: 10,
};

const DIRECTIONS = {
    NORTH: { emoji: '🚗', startX: 0.5, startY: 0, endY: 1, axis: 'y', lane: 0.45 },
    SOUTH: { emoji: '🚙', startX: 0.5, startY: 1, endY: 0, axis: 'y', lane: 0.55 },
    EAST: { emoji: '🚕', startX: 0, startY: 0.5, endX: 1, axis: 'x', lane: 0.45 },
    WEST: { emoji: '🚐', startX: 1, startY: 0.5, endX: 0, axis: 'x', lane: 0.55 },
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    carsServed: 0,
    crashes: 0,
    isPlaying: false,
    cars: [],
    lights: {
        north: 'red',
        south: 'red',
        east: 'red',
        west: 'red',
    },
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    carsServedDisplay: document.getElementById('carsServed'),
    crashesDisplay: document.getElementById('crashes'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalCarsDisplay: document.getElementById('finalCars'),
    finalCrashesDisplay: document.getElementById('finalCrashes'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    lightNorth: document.getElementById('lightNorth'),
    lightSouth: document.getElementById('lightSouth'),
    lightEast: document.getElementById('lightEast'),
    lightWest: document.getElementById('lightWest'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Traffic Controller initialized');
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

    // Traffic light controls
    setupLightControl('north');
    setupLightControl('south');
    setupLightControl('east');
    setupLightControl('west');

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

function setupLightControl(direction) {
    const lightElement = elements[`light${direction.charAt(0).toUpperCase() + direction.slice(1)}`];

    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (gameState.isPlaying) {
            toggleLight(direction);
        }
    };

    lightElement.addEventListener('touchstart', handler);
    lightElement.addEventListener('click', handler);
}

function toggleLight(direction) {
    const currentColor = gameState.lights[direction];
    const newColor = currentColor === 'red' ? 'green' : 'red';
    gameState.lights[direction] = newColor;

    updateLightDisplay(direction);
}

function updateLightDisplay(direction) {
    const lightElement = elements[`light${direction.charAt(0).toUpperCase() + direction.slice(1)}`];
    const redLight = lightElement.querySelector('.light.red');
    const greenLight = lightElement.querySelector('.light.green');

    if (gameState.lights[direction] === 'red') {
        redLight.classList.add('active');
        greenLight.classList.remove('active');
    } else {
        redLight.classList.remove('active');
        greenLight.classList.add('active');
    }
}

// ==========================================
// GAME LOOP
// ==========================================

let lastTimestamp = 0;
let spawnTimer = 0;
let animationFrameId = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    updateGame(deltaTime);
    renderGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    // Spawn new cars
    spawnTimer += deltaTime;
    if (spawnTimer >= CONFIG.spawnInterval) {
        spawnTimer = 0;
        spawnCar();
    }

    // Update car positions
    for (let i = gameState.cars.length - 1; i >= 0; i--) {
        const car = gameState.cars[i];
        updateCarPosition(car);

        // Check if car reached end
        if (isCarOffScreen(car)) {
            removeCar(car, i);
            gameState.carsServed++;
            gameState.score += CONFIG.pointsPerCar;
            updateScoreDisplay();
        }
    }

    // Check for crashes
    checkCrashes();
}

function renderGame() {
    // Cars are rendered via DOM updates in updateCarPosition
}

// ==========================================
// CAR MANAGEMENT
// ==========================================

function spawnCar() {
    const directions = Object.keys(DIRECTIONS);
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    const directionData = DIRECTIONS[randomDirection];

    const car = {
        element: createCarElement(directionData.emoji),
        direction: randomDirection,
        directionData: directionData,
        position: 0, // 0 to 1 (percentage along the path)
        stopped: false,
    };

    gameState.cars.push(car);
    elements.gameArea.appendChild(car.element);
    positionCar(car);
}

function createCarElement(emoji) {
    const car = document.createElement('div');
    car.className = 'car';
    car.textContent = emoji;
    return car;
}

function updateCarPosition(car) {
    const light = gameState.lights[car.direction];
    const isInIntersection = car.position >= 0.35 && car.position <= 0.65;

    // Stop at red light before intersection
    if (light === 'red' && car.position >= 0.3 && car.position < 0.35) {
        car.stopped = true;
        return;
    } else {
        car.stopped = false;
    }

    // Move car
    if (!car.stopped) {
        const gameAreaHeight = elements.gameArea.clientHeight;
        const gameAreaWidth = elements.gameArea.clientWidth;
        const maxDimension = Math.max(gameAreaHeight, gameAreaWidth);
        car.position += CONFIG.carSpeed / maxDimension;
    }

    positionCar(car);
}

function positionCar(car) {
    const gameAreaHeight = elements.gameArea.clientHeight;
    const gameAreaWidth = elements.gameArea.clientWidth;
    const data = car.directionData;

    if (data.axis === 'y') {
        const startY = data.startY === 0 ? -30 : gameAreaHeight + 30;
        const endY = data.endY === 0 ? -30 : gameAreaHeight + 30;
        const currentY = startY + (endY - startY) * car.position;
        const currentX = gameAreaWidth * data.lane;

        car.element.style.left = `${currentX - 20}px`;
        car.element.style.top = `${currentY - 30}px`;
    } else {
        const startX = data.startX === 0 ? -30 : gameAreaWidth + 30;
        const endX = data.endX === 0 ? -30 : gameAreaWidth + 30;
        const currentX = startX + (endX - startX) * car.position;
        const currentY = gameAreaHeight * data.lane;

        car.element.style.left = `${currentX - 20}px`;
        car.element.style.top = `${currentY - 30}px`;
    }
}

function isCarOffScreen(car) {
    return car.position >= 1.2;
}

function removeCar(car, index) {
    car.element.remove();
    gameState.cars.splice(index, 1);
}

// ==========================================
// COLLISION DETECTION
// ==========================================

function checkCrashes() {
    for (let i = 0; i < gameState.cars.length; i++) {
        for (let j = i + 1; j < gameState.cars.length; j++) {
            const car1 = gameState.cars[i];
            const car2 = gameState.cars[j];

            if (areCarsColliding(car1, car2)) {
                handleCrash(car1, car2);
                return; // Handle one crash at a time
            }
        }
    }
}

function areCarsColliding(car1, car2) {
    const rect1 = car1.element.getBoundingClientRect();
    const rect2 = car2.element.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

function handleCrash(car1, car2) {
    car1.element.classList.add('crashed');
    car2.element.classList.add('crashed');

    gameState.crashes++;
    updateCrashesDisplay();

    // Remove crashed cars after animation
    setTimeout(() => {
        const index1 = gameState.cars.indexOf(car1);
        const index2 = gameState.cars.indexOf(car2);

        if (index1 > -1) removeCar(car1, index1);
        if (index2 > -1) removeCar(car2, gameState.cars.indexOf(car2));
    }, 500);

    // Check if game over
    if (gameState.crashes >= CONFIG.maxCrashes) {
        endGame();
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.carsServed = 0;
    gameState.crashes = 0;
    gameState.cars = [];
    gameState.lights = {
        north: 'red',
        south: 'red',
        east: 'red',
        west: 'red',
    };

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateCrashesDisplay();
    updateLightDisplay('north');
    updateLightDisplay('south');
    updateLightDisplay('east');
    updateLightDisplay('west');

    spawnTimer = 0;
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalCarsDisplay.textContent = gameState.carsServed;
    elements.finalCrashesDisplay.textContent = gameState.crashes;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState = {
        score: 0,
        carsServed: 0,
        crashes: 0,
        isPlaying: false,
        cars: [],
        lights: {
            north: 'red',
            south: 'red',
            east: 'red',
            west: 'red',
        },
    };

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateCrashesDisplay();

    // Remove all cars
    const cars = elements.gameArea.querySelectorAll('.car');
    cars.forEach(car => car.remove());

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
    elements.carsServedDisplay.textContent = gameState.carsServed;
}

function updateCrashesDisplay() {
    elements.crashesDisplay.textContent = gameState.crashes;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
