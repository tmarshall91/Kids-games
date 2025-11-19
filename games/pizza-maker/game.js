'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    pizzasMade: 0,
    currentToppings: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    toppingsLayer: document.getElementById('toppingsLayer'),

    // Buttons
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
    console.log('Pizza Maker initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
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
// TOPPING MANAGEMENT
// ==========================================

function handleToppingClick(e) {
    e.preventDefault();
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
    topping.className = `topping ${type}`;

    // Special positioning for sauce and cheese (full coverage)
    if (type === 'sauce' || type === 'cheese') {
        // These are already positioned via CSS
    } else {
        // Random position for individual toppings
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60 + 20; // 20-80px from center
        const centerX = 50;
        const centerY = 50;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        topping.style.left = `${x}%`;
        topping.style.top = `${y}%`;
        topping.style.transform = 'translate(-50%, -50%)';
    }

    elements.toppingsLayer.appendChild(topping);
    gameState.currentToppings.push(type);
}

function clearPizza() {
    elements.toppingsLayer.innerHTML = '';
    gameState.currentToppings = [];
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearPizza();
}

function handleServe(e) {
    e.preventDefault();

    // Check if pizza has toppings
    if (gameState.currentToppings.length === 0) {
        // Show a gentle reminder
        elements.toppingsLayer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.toppingsLayer.style.animation = '';
        }, 500);
        return;
    }

    // Increment score
    gameState.pizzasMade++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearPizza();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.pizzasMade;

    // Add pulse animation
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// ANIMATIONS
// ==========================================

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    .pulse {
        animation: pulse 0.3s ease;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
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
