'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    sandwichesMade: 0,
    ingredients: [],
    usedOnce: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    sandwichContainer: document.getElementById('sandwichContainer'),

    // Buttons
    ingredientButtons: document.querySelectorAll('.ingredient-btn'),
    clearBtn: document.getElementById('clearBtn'),
    serveBtn: document.getElementById('serveBtn'),
    nextBtn: document.getElementById('nextBtn'),

    // Overlays
    successOverlay: document.getElementById('successOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Sandwich Stacker initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Ingredient buttons
    elements.ingredientButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleIngredientClick);
        btn.addEventListener('click', handleIngredientClick);
    });

    // Clear button
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);

    // Serve button
    elements.serveBtn.addEventListener('touchstart', handleServe);
    elements.serveBtn.addEventListener('click', handleServe);

    // Next button
    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);
}

// ==========================================
// INGREDIENT MANAGEMENT
// ==========================================

function handleIngredientClick(e) {
    e.preventDefault();
    const ingredientType = e.currentTarget.dataset.ingredient;
    const onceOnly = e.currentTarget.dataset.once === 'true';

    // Check if this is a once-only ingredient
    if (onceOnly && gameState.usedOnce.includes(ingredientType)) {
        return;
    }

    addIngredient(ingredientType);

    // If once-only, disable the button
    if (onceOnly) {
        gameState.usedOnce.push(ingredientType);
        e.currentTarget.disabled = true;
    }

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addIngredient(type) {
    const ingredient = document.createElement('div');
    ingredient.className = `ingredient ${type}`;

    // Insert before the plate
    const plate = elements.sandwichContainer.querySelector('.plate');
    elements.sandwichContainer.insertBefore(ingredient, plate);

    gameState.ingredients.push(type);
}

function clearSandwich() {
    // Remove all ingredients
    const ingredients = elements.sandwichContainer.querySelectorAll('.ingredient');
    ingredients.forEach(ingredient => ingredient.remove());

    gameState.ingredients = [];
    gameState.usedOnce = [];

    // Re-enable all buttons
    elements.ingredientButtons.forEach(btn => {
        btn.disabled = false;
    });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearSandwich();
}

function handleServe(e) {
    e.preventDefault();

    // Check if sandwich has ingredients
    if (gameState.ingredients.length === 0) {
        // Shake the container
        elements.sandwichContainer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.sandwichContainer.style.animation = '';
        }, 500);
        return;
    }

    // Increment score
    gameState.sandwichesMade++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearSandwich();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.sandwichesMade;

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
