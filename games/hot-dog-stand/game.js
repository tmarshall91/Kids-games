'use strict';

// ==========================================
// CONFIGURATION
// ==========================================

const POSSIBLE_TOPPINGS = [
    { id: 'bun-bottom', label: 'Bun' },
    { id: 'sausage', label: 'Hot Dog' },
    { id: 'ketchup', label: 'Ketchup' },
    { id: 'mustard', label: 'Mustard' },
    { id: 'onion', label: 'Onions' },
    { id: 'relish', label: 'Relish' }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    hotDogsMade: 0,
    currentOrder: [],
    currentHotDog: [],
    hasOrder: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    orderItems: document.getElementById('orderItems'),
    hotdogContainer: document.getElementById('hotdogContainer'),

    // Buttons
    toppingButtons: document.querySelectorAll('.topping-btn'),
    newOrderBtn: document.getElementById('newOrderBtn'),
    clearBtn: document.getElementById('clearBtn'),
    serveBtn: document.getElementById('serveBtn'),
    nextBtn: document.getElementById('nextBtn'),
    tryAgainBtn: document.getElementById('tryAgainBtn'),

    // Overlays
    successOverlay: document.getElementById('successOverlay'),
    wrongOverlay: document.getElementById('wrongOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Hot Dog Stand initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Topping buttons
    elements.toppingButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleToppingClick);
        btn.addEventListener('click', handleToppingClick);
    });

    // New order button
    elements.newOrderBtn.addEventListener('touchstart', handleNewOrder);
    elements.newOrderBtn.addEventListener('click', handleNewOrder);

    // Clear button
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);

    // Serve button
    elements.serveBtn.addEventListener('touchstart', handleServe);
    elements.serveBtn.addEventListener('click', handleServe);

    // Next button
    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);

    // Try again button
    elements.tryAgainBtn.addEventListener('touchstart', handleTryAgain);
    elements.tryAgainBtn.addEventListener('click', handleTryAgain);
}

// ==========================================
// ORDER MANAGEMENT
// ==========================================

function handleNewOrder(e) {
    e.preventDefault();
    generateOrder();
}

function generateOrder() {
    // Clear current hot dog and order
    clearHotDog();

    // Generate a random order (2-4 toppings, always including bun and sausage)
    const numToppings = Math.floor(Math.random() * 3) + 2; // 2-4 toppings
    const selectedToppings = ['bun-bottom', 'sausage']; // Always start with these

    // Add random additional toppings
    const additionalToppings = POSSIBLE_TOPPINGS.slice(2); // Skip bun and sausage
    const shuffled = additionalToppings.sort(() => Math.random() - 0.5);
    const numAdditional = Math.min(numToppings - 2, shuffled.length);

    for (let i = 0; i < numAdditional; i++) {
        selectedToppings.push(shuffled[i].id);
    }

    gameState.currentOrder = selectedToppings;
    gameState.hasOrder = true;
    displayOrder();
}

function displayOrder() {
    elements.orderItems.innerHTML = '';

    if (gameState.currentOrder.length === 0) {
        elements.orderItems.innerHTML = '<p>Click "New Order" to start!</p>';
        return;
    }

    const orderList = document.createElement('div');
    gameState.currentOrder.forEach(toppingId => {
        const topping = POSSIBLE_TOPPINGS.find(t => t.id === toppingId);
        const p = document.createElement('p');
        p.textContent = `✓ ${topping.label}`;
        p.style.margin = '5px 0';
        orderList.appendChild(p);
    });

    elements.orderItems.appendChild(orderList);
}

// ==========================================
// TOPPING MANAGEMENT
// ==========================================

function handleToppingClick(e) {
    e.preventDefault();

    if (!gameState.hasOrder) {
        // Shake to indicate need order first
        elements.orderItems.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.orderItems.style.animation = '';
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
    topping.className = `topping ${type}`;

    // Insert before the plate
    const plate = elements.hotdogContainer.querySelector('.plate');
    elements.hotdogContainer.insertBefore(topping, plate);

    gameState.currentHotDog.push(type);
}

function clearHotDog() {
    const toppings = elements.hotdogContainer.querySelectorAll('.topping');
    toppings.forEach(topping => topping.remove());
    gameState.currentHotDog = [];
}

// ==========================================
// ORDER CHECKING
// ==========================================

function checkOrder() {
    // Check if the current hot dog matches the order
    if (gameState.currentHotDog.length !== gameState.currentOrder.length) {
        return false;
    }

    // Check if all toppings match (order doesn't matter for simplicity)
    const orderSorted = [...gameState.currentOrder].sort();
    const hotdogSorted = [...gameState.currentHotDog].sort();

    return orderSorted.every((topping, index) => topping === hotdogSorted[index]);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearHotDog();
}

function handleServe(e) {
    e.preventDefault();

    if (!gameState.hasOrder) {
        return;
    }

    if (gameState.currentHotDog.length === 0) {
        // Shake the container
        elements.hotdogContainer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.hotdogContainer.style.animation = '';
        }, 500);
        return;
    }

    // Check if order is correct
    if (checkOrder()) {
        // Correct order!
        gameState.hotDogsMade++;
        updateScoreDisplay();
        elements.successOverlay.style.display = 'flex';
    } else {
        // Wrong order
        elements.wrongOverlay.style.display = 'flex';
    }
}

function handleNext(e) {
    e.preventDefault();
    elements.successOverlay.style.display = 'none';
    generateOrder(); // Generate new order automatically
}

function handleTryAgain(e) {
    e.preventDefault();
    elements.wrongOverlay.style.display = 'none';
    clearHotDog();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.hotDogsMade;

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
