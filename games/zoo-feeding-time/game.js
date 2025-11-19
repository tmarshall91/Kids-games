'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const ANIMALS_AND_FOODS = [
    {animal: '🦁', name: 'Lion', food: '🥩', request: 'I want meat!'},
    {animal: '🐘', name: 'Elephant', food: '🥜', request: 'I love peanuts!'},
    {animal: '🐵', name: 'Monkey', food: '🍌', request: 'Give me bananas!'},
    {animal: '🐼', name: 'Panda', food: '🎋', request: 'I need bamboo!'},
    {animal: '🦒', name: 'Giraffe', food: '🍃', request: 'I eat leaves!'},
    {animal: '🐻', name: 'Bear', food: '🍯', request: 'I want honey!'},
    {animal: '🦓', name: 'Zebra', food: '🌾', request: 'I like grass!'},
    {animal: '🦘', name: 'Kangaroo', food: '🥕', request: 'Carrots please!'}
];

const ALL_FOODS = ['🥩', '🥜', '🍌', '🎋', '🍃', '🍯', '🌾', '🥕', '🐟', '🍎'];

const CONFIG = {
    animalsPerLevel: 5
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    level: 1,
    currentAnimalIndex: 0,
    levelAnimals: [],
    isPlaying: false,
    canSelect: true
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    nextLevelBtn: document.getElementById('nextLevelBtn'),
    scoreDisplay: document.getElementById('score'),
    levelDisplay: document.getElementById('level'),
    levelScoreDisplay: document.getElementById('levelScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameScene: document.getElementById('gameScene'),
    currentAnimal: document.getElementById('currentAnimal'),
    animalRequest: document.getElementById('animalRequest'),
    foodOptions: document.getElementById('foodOptions'),
    feedback: document.getElementById('feedback'),
    levelCompleteOverlay: document.getElementById('levelCompleteOverlay'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Zoo Feeding Time initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.nextLevelBtn.addEventListener('touchstart', handleNextLevel);
    elements.nextLevelBtn.addEventListener('click', handleNextLevel);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.currentAnimalIndex = 0;

    // Select random animals for this level
    const shuffled = [...ANIMALS_AND_FOODS];
    shuffleArray(shuffled);
    gameState.levelAnimals = shuffled.slice(0, CONFIG.animalsPerLevel);

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.gameScene.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateLevelDisplay();

    // Show first animal
    showNextAnimal();

    console.log('Game started - Level', gameState.level);
}

function showNextAnimal() {
    if (gameState.currentAnimalIndex >= gameState.levelAnimals.length) {
        // Level complete
        levelComplete();
        return;
    }

    gameState.canSelect = true;
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';

    const currentAnimal = gameState.levelAnimals[gameState.currentAnimalIndex];

    // Display animal
    elements.currentAnimal.textContent = currentAnimal.animal;
    elements.animalRequest.textContent = currentAnimal.request;

    // Create food options (correct food + random foods)
    const foodOptions = [currentAnimal.food];
    const otherFoods = ALL_FOODS.filter(food => food !== currentAnimal.food);

    while (foodOptions.length < 6 && otherFoods.length > 0) {
        const randomFood = otherFoods.splice(Math.floor(Math.random() * otherFoods.length), 1)[0];
        if (!foodOptions.includes(randomFood)) {
            foodOptions.push(randomFood);
        }
    }

    // Shuffle food options
    shuffleArray(foodOptions);

    // Display food options
    elements.foodOptions.innerHTML = '';
    foodOptions.forEach(food => {
        const option = document.createElement('div');
        option.className = 'food-option';
        option.textContent = food;
        option.dataset.food = food;

        option.addEventListener('touchstart', (e) => handleFoodClick(e, food));
        option.addEventListener('click', (e) => handleFoodClick(e, food));

        elements.foodOptions.appendChild(option);
    });
}

function handleFoodClick(e, selectedFood) {
    e.preventDefault();
    if (!gameState.isPlaying || !gameState.canSelect) return;

    gameState.canSelect = false;

    const currentAnimal = gameState.levelAnimals[gameState.currentAnimalIndex];
    const option = e.currentTarget;

    if (selectedFood === currentAnimal.food) {
        // Correct!
        option.classList.add('correct');
        elements.feedback.textContent = '🎉 Yum! Thank you!';
        elements.feedback.className = 'feedback correct';

        gameState.score++;
        updateScoreDisplay();

        // Add pulse animation
        elements.scoreDisplay.classList.add('pulse');
        setTimeout(() => {
            elements.scoreDisplay.classList.remove('pulse');
        }, 300);

        // Move to next animal
        setTimeout(() => {
            gameState.currentAnimalIndex++;
            showNextAnimal();
        }, 1500);
    } else {
        // Wrong!
        option.classList.add('wrong');
        elements.feedback.textContent = '❌ Not my favorite!';
        elements.feedback.className = 'feedback wrong';

        // Allow another try
        setTimeout(() => {
            gameState.canSelect = true;
            elements.feedback.textContent = 'Try again!';
            option.classList.remove('wrong');
        }, 1000);
    }
}

function levelComplete() {
    gameState.isPlaying = false;

    // Show level complete overlay
    elements.levelScoreDisplay.textContent = gameState.score;
    elements.levelCompleteOverlay.style.display = 'flex';

    console.log('Level', gameState.level, 'complete! Score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.currentAnimalIndex = 0;
    gameState.isPlaying = false;
    gameState.canSelect = true;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.gameScene.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.levelCompleteOverlay.style.display = 'none';

    updateScoreDisplay();
    updateLevelDisplay();

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

function handleNextLevel(e) {
    e.preventDefault();
    gameState.level++;
    elements.levelCompleteOverlay.style.display = 'none';
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateLevelDisplay() {
    elements.levelDisplay.textContent = gameState.level;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
