'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    smoothiesMade: 0,
    ingredients: [],
    isBlended: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    smoothieLiquid: document.getElementById('smoothieLiquid'),
    ingredientsDisplay: document.getElementById('ingredientsDisplay'),

    // Buttons
    ingredientButtons: document.querySelectorAll('.ingredient-btn'),
    clearBtn: document.getElementById('clearBtn'),
    blendBtn: document.getElementById('blendBtn'),
    serveBtn: document.getElementById('serveBtn'),
    nextBtn: document.getElementById('nextBtn'),

    // Overlays
    successOverlay: document.getElementById('successOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Smoothie Mixer initialized');
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

    // Blend button
    elements.blendBtn.addEventListener('touchstart', handleBlend);
    elements.blendBtn.addEventListener('click', handleBlend);

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

    // Don't add if already blended
    if (gameState.isBlended) {
        return;
    }

    // Limit to 4 ingredients
    if (gameState.ingredients.length >= 4) {
        return;
    }

    const ingredient = e.currentTarget.dataset.ingredient;
    const color = e.currentTarget.dataset.color;
    addIngredient(ingredient, color);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addIngredient(ingredient, color) {
    const icon = document.createElement('div');
    icon.className = 'ingredient-icon';

    // Set emoji based on ingredient
    const emojis = {
        banana: '🍌',
        strawberry: '🍓',
        blueberry: '🫐',
        mango: '🥭',
        kiwi: '🥝',
        orange: '🍊'
    };
    icon.textContent = emojis[ingredient] || '🍓';

    elements.ingredientsDisplay.appendChild(icon);
    gameState.ingredients.push({ ingredient, color });
}

function clearSmoothie() {
    elements.ingredientsDisplay.innerHTML = '';
    elements.smoothieLiquid.style.height = '0%';
    elements.smoothieLiquid.style.background = '#ddd';
    elements.smoothieLiquid.classList.remove('blending');
    gameState.ingredients = [];
    gameState.isBlended = false;

    // Show blend button, hide serve button
    elements.blendBtn.style.display = 'block';
    elements.serveBtn.style.display = 'none';
}

// ==========================================
// BLENDING LOGIC
// ==========================================

function handleBlend(e) {
    e.preventDefault();

    // Check if there are ingredients
    if (gameState.ingredients.length === 0) {
        // Shake the blender
        elements.ingredientsDisplay.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.ingredientsDisplay.style.animation = '';
        }, 500);
        return;
    }

    blendSmoothie();
}

function blendSmoothie() {
    // Hide ingredient icons
    elements.ingredientsDisplay.innerHTML = '';

    // Calculate blended color (average of all ingredient colors)
    const blendedColor = mixColors(gameState.ingredients.map(i => i.color));

    // Animate blending
    elements.smoothieLiquid.classList.add('blending');

    setTimeout(() => {
        elements.smoothieLiquid.style.height = '80%';
        elements.smoothieLiquid.style.background = blendedColor;
        elements.smoothieLiquid.classList.remove('blending');
        gameState.isBlended = true;

        // Show serve button, hide blend button
        elements.blendBtn.style.display = 'none';
        elements.serveBtn.style.display = 'block';
    }, 1000);
}

function mixColors(colors) {
    // Simple color mixing by averaging RGB values
    let r = 0, g = 0, b = 0;

    colors.forEach(color => {
        const hex = color.replace('#', '');
        r += parseInt(hex.substr(0, 2), 16);
        g += parseInt(hex.substr(2, 2), 16);
        b += parseInt(hex.substr(4, 2), 16);
    });

    r = Math.floor(r / colors.length);
    g = Math.floor(g / colors.length);
    b = Math.floor(b / colors.length);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearSmoothie();
}

function handleServe(e) {
    e.preventDefault();

    // Check if smoothie is blended
    if (!gameState.isBlended) {
        return;
    }

    // Increment score
    gameState.smoothiesMade++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearSmoothie();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.smoothiesMade;

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// ANIMATIONS
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
