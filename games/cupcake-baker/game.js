'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    cupcakesBaked: 0,
    hasFrosting: false,
    toppings: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    frostingLayer: document.getElementById('frostingLayer'),
    toppingsLayer: document.getElementById('toppingsLayer'),

    // Buttons
    frostingButtons: document.querySelectorAll('.frosting-btn'),
    toppingButtons: document.querySelectorAll('.topping-btn'),
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
    console.log('Cupcake Baker initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Frosting buttons
    elements.frostingButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleFrostingClick);
        btn.addEventListener('click', handleFrostingClick);
    });

    // Topping buttons
    elements.toppingButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleToppingClick);
        btn.addEventListener('click', handleToppingClick);
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
// FROSTING AND TOPPING MANAGEMENT
// ==========================================

function handleFrostingClick(e) {
    e.preventDefault();
    const frosting = e.currentTarget.dataset.frosting;
    const color = e.currentTarget.dataset.color;
    addFrosting(color);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addFrosting(color) {
    elements.frostingLayer.style.background = `radial-gradient(circle at 40% 30%, ${color}, ${adjustColor(color, -30)})`;
    gameState.hasFrosting = true;
}

function handleToppingClick(e) {
    e.preventDefault();

    // Check if cupcake has frosting
    if (!gameState.hasFrosting) {
        // Shake to indicate need frosting first
        elements.frostingLayer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.frostingLayer.style.animation = '';
        }, 500);
        return;
    }

    const toppingType = e.currentTarget.dataset.topping;
    addTopping(toppingType);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addTopping(type) {
    const topping = document.createElement('div');
    topping.className = 'topping';

    // Set emoji based on type
    const emojis = {
        cherry: '🍒',
        sprinkles: '✨',
        stars: '⭐',
        hearts: '💗'
    };
    topping.textContent = emojis[type] || '🍒';

    // Random position on top of cupcake
    const x = 30 + Math.random() * 40;
    const y = 20 + Math.random() * 40;
    topping.style.left = `${x}%`;
    topping.style.top = `${y}%`;

    elements.toppingsLayer.appendChild(topping);
    gameState.toppings.push(type);
}

function clearCupcake() {
    elements.frostingLayer.style.background = '';
    elements.toppingsLayer.innerHTML = '';
    gameState.hasFrosting = false;
    gameState.toppings = [];
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearCupcake();
}

function handleServe(e) {
    e.preventDefault();

    // Check if cupcake has frosting
    if (!gameState.hasFrosting) {
        // Shake the cupcake
        elements.frostingLayer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.frostingLayer.style.animation = '';
        }, 500);
        return;
    }

    // Increment score
    gameState.cupcakesBaked++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearCupcake();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.cupcakesBaked;

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function adjustColor(color, amount) {
    // Simple color adjustment for gradient effect
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
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
