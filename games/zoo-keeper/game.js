'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 12, // 3x4 grid
    gameTime: 60, // Game duration in seconds
    hungerInterval: 2000, // How often animals get hungry
    points: {
        correct: 10,
        wrong: -5
    }
};

// === Animal Food Preferences ===
const ANIMALS = {
    carnivores: {
        food: '🍖',
        animals: ['🦁', '🐯', '🐻', '🦅'],
        name: 'Carnivores'
    },
    herbivores: {
        food: '🥬',
        animals: ['🦒', '🐘', '🦏', '🐼'],
        name: 'Herbivores'
    },
    fish_eaters: {
        food: '🐟',
        animals: ['🐧', '🦭'],
        name: 'Fish Eaters'
    },
    fruit_eaters: {
        food: '🍌',
        animals: ['🐵', '🦍'],
        name: 'Fruit Eaters'
    }
};

// === State Management ===
let gameState = {
    score: 0,
    fedCount: 0,
    isPlaying: false,
    timeLeft: CONFIG.gameTime,
    selectedFood: '🍖',
    enclosures: [], // Array to track enclosure states
    timerInterval: null,
    hungerInterval: null
};

// === DOM References ===
const elements = {
    zooGrid: document.getElementById('zooGrid'),
    score: document.getElementById('score'),
    fedCount: document.getElementById('fedCount'),
    timer: document.getElementById('timer'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    finalFed: document.getElementById('finalFed'),
    foodSelector: document.getElementById('foodSelector')
};

// === Initialization ===
function initGame() {
    createZooGrid();
    setupEventListeners();
    resetGame();
}

function createZooGrid() {
    elements.zooGrid.innerHTML = '';
    gameState.enclosures = [];

    // Create array of all animals
    const allAnimals = [];
    Object.values(ANIMALS).forEach(category => {
        allAnimals.push(...category.animals);
    });

    // Shuffle and select animals for grid
    const shuffled = allAnimals.sort(() => Math.random() - 0.5);
    const selectedAnimals = shuffled.slice(0, CONFIG.gridSize);

    for (let i = 0; i < CONFIG.gridSize; i++) {
        const enclosure = document.createElement('div');
        enclosure.className = 'enclosure happy';
        enclosure.dataset.index = i;

        const animal = selectedAnimals[i];
        enclosure.textContent = animal;

        // Add touch and click events
        enclosure.addEventListener('touchstart', handleEnclosureClick);
        enclosure.addEventListener('click', handleEnclosureClick);

        elements.zooGrid.appendChild(enclosure);

        // Find animal's food preference
        let preferredFood = '🍖';
        for (const category of Object.values(ANIMALS)) {
            if (category.animals.includes(animal)) {
                preferredFood = category.food;
                break;
            }
        }

        // Initialize enclosure state
        gameState.enclosures.push({
            animal: animal,
            state: 'happy', // happy, hungry
            preferredFood: preferredFood,
            hungerTimer: null
        });
    }
}

function setupEventListeners() {
    // Start buttons
    elements.startBtn.addEventListener('touchstart', startGame);
    elements.startBtn.addEventListener('click', startGame);

    elements.playBtn.addEventListener('touchstart', startGame);
    elements.playBtn.addEventListener('click', startGame);

    // Restart buttons
    elements.restartBtn.addEventListener('touchstart', restartGame);
    elements.restartBtn.addEventListener('click', restartGame);

    elements.playAgainBtn.addEventListener('touchstart', restartGame);
    elements.playAgainBtn.addEventListener('click', restartGame);

    // Food selector buttons
    const foodButtons = elements.foodSelector.querySelectorAll('.food-btn');
    foodButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => handleFoodSelection(e, btn));
        btn.addEventListener('click', (e) => handleFoodSelection(e, btn));
    });
}

function handleFoodSelection(e, btn) {
    e.preventDefault();

    // Remove active class from all buttons
    const foodButtons = elements.foodSelector.querySelectorAll('.food-btn');
    foodButtons.forEach(b => b.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Update selected food
    gameState.selectedFood = btn.dataset.food;
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    // Hide overlays
    elements.welcomeOverlay.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Show restart button
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Start timers
    startGameTimer();
    startHungerCycle();
}

function restartGame(e) {
    e.preventDefault();

    // Hide game over overlay
    elements.gameOverOverlay.style.display = 'none';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Start timers
    startGameTimer();
    startHungerCycle();
}

function resetGame() {
    gameState.score = 0;
    gameState.fedCount = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.selectedFood = '🍖';

    // Clear intervals
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    if (gameState.hungerInterval) {
        clearInterval(gameState.hungerInterval);
    }

    // Clear all hunger timers
    gameState.enclosures.forEach(enc => {
        if (enc.hungerTimer) {
            clearTimeout(enc.hungerTimer);
        }
    });

    // Reset all enclosures
    const enclosureElements = elements.zooGrid.querySelectorAll('.enclosure');
    enclosureElements.forEach((encEl, index) => {
        encEl.className = 'enclosure happy';
        const indicator = encEl.querySelector('.hungry-indicator');
        if (indicator) {
            indicator.remove();
        }

        gameState.enclosures[index].state = 'happy';
    });

    updateUI();
}

function startGameTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateUI();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function startHungerCycle() {
    // Make some animals hungry immediately
    makeRandomAnimalsHungry(3);

    // Continue making animals hungry periodically
    gameState.hungerInterval = setInterval(() => {
        if (gameState.isPlaying) {
            makeRandomAnimalsHungry(2);
        }
    }, CONFIG.hungerInterval);
}

function makeRandomAnimalsHungry(count) {
    const happyEnclosures = gameState.enclosures
        .map((enc, index) => ({ enc, index }))
        .filter(({ enc }) => enc.state === 'happy');

    if (happyEnclosures.length === 0) return;

    // Randomly select animals to make hungry
    const shuffled = happyEnclosures.sort(() => Math.random() - 0.5);
    const toMakeHungry = shuffled.slice(0, Math.min(count, shuffled.length));

    toMakeHungry.forEach(({ enc, index }) => {
        makeAnimalHungry(index);
    });
}

function makeAnimalHungry(index) {
    const enclosure = gameState.enclosures[index];
    const enclosureEl = elements.zooGrid.children[index];

    if (enclosure.state === 'hungry') return;

    enclosure.state = 'hungry';
    enclosureEl.classList.remove('happy');
    enclosureEl.classList.add('hungry');

    // Add hungry indicator
    const indicator = document.createElement('div');
    indicator.className = 'hungry-indicator';
    indicator.textContent = '❗';
    enclosureEl.appendChild(indicator);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timers
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    if (gameState.hungerInterval) {
        clearInterval(gameState.hungerInterval);
    }

    // Clear all hunger timers
    gameState.enclosures.forEach(enc => {
        if (enc.hungerTimer) {
            clearTimeout(enc.hungerTimer);
        }
    });

    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.finalFed.textContent = gameState.fedCount;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Enclosure Interaction ===
function handleEnclosureClick(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const enclosureIndex = parseInt(e.currentTarget.dataset.index);
    const enclosure = gameState.enclosures[enclosureIndex];
    const enclosureEl = e.currentTarget;

    if (enclosure.state === 'hungry') {
        feedAnimal(enclosureIndex, enclosureEl);
    }
}

function feedAnimal(index, enclosureEl) {
    const enclosure = gameState.enclosures[index];
    const selectedFood = gameState.selectedFood;

    // Check if correct food
    if (selectedFood === enclosure.preferredFood) {
        // Correct food!
        gameState.score += CONFIG.points.correct;
        gameState.fedCount++;

        // Update enclosure state
        enclosure.state = 'happy';
        enclosureEl.classList.remove('hungry');
        enclosureEl.classList.add('happy', 'feeding-animation');

        // Remove hungry indicator
        const indicator = enclosureEl.querySelector('.hungry-indicator');
        if (indicator) {
            indicator.remove();
        }

        // Remove animation class after animation
        setTimeout(() => {
            enclosureEl.classList.remove('feeding-animation');
        }, 500);

    } else {
        // Wrong food!
        gameState.score += CONFIG.points.wrong;

        // Shake animation
        enclosureEl.classList.add('wrong-food');

        setTimeout(() => {
            enclosureEl.classList.remove('wrong-food');
        }, 500);
    }

    updateUI();
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.fedCount.textContent = gameState.fedCount;
    elements.timer.textContent = gameState.timeLeft;
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
