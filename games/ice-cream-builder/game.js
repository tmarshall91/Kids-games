'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    conesMade: 0,
    scoops: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    iceCreamContainer: document.getElementById('iceCreamContainer'),

    // Buttons
    flavorButtons: document.querySelectorAll('.flavor-btn'),
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
    console.log('Ice Cream Builder initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Flavor buttons
    elements.flavorButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleFlavorClick);
        btn.addEventListener('click', handleFlavorClick);
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
// SCOOP MANAGEMENT
// ==========================================

function handleFlavorClick(e) {
    e.preventDefault();

    // Limit to 4 scoops
    if (gameState.scoops.length >= 4) {
        return;
    }

    const flavor = e.currentTarget.dataset.flavor;
    const color = e.currentTarget.dataset.color;
    addScoop(flavor, color);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addScoop(flavor, color) {
    const scoop = document.createElement('div');
    scoop.className = 'scoop';
    scoop.style.background = `radial-gradient(circle at 30% 30%, ${color}, ${adjustColor(color, -20)})`;
    scoop.dataset.flavor = flavor;

    // Insert before the cone
    const cone = elements.iceCreamContainer.querySelector('.cone');
    elements.iceCreamContainer.insertBefore(scoop, cone);

    gameState.scoops.push({ element: scoop, flavor, toppings: [] });
}

function handleToppingClick(e) {
    e.preventDefault();

    // Check if there are scoops
    if (gameState.scoops.length === 0) {
        return;
    }

    const toppingType = e.currentTarget.dataset.topping;

    // Add topping to the top scoop
    const topScoop = gameState.scoops[0];
    addTopping(topScoop.element, toppingType);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addTopping(scoopElement, type) {
    const topping = document.createElement('div');
    topping.className = `topping ${type}`;

    // Add random sprinkles
    if (type === 'sprinkles') {
        for (let i = 0; i < 8; i++) {
            const sprinkle = document.createElement('div');
            sprinkle.style.position = 'absolute';
            sprinkle.style.width = '3px';
            sprinkle.style.height = '8px';
            sprinkle.style.borderRadius = '2px';
            sprinkle.style.background = ['#ff69b4', '#4169e1', '#ffd700', '#ff4500'][Math.floor(Math.random() * 4)];
            sprinkle.style.left = `${20 + Math.random() * 60}%`;
            sprinkle.style.top = `${20 + Math.random() * 60}%`;
            sprinkle.style.transform = `rotate(${Math.random() * 360}deg)`;
            topping.appendChild(sprinkle);
        }
    }

    scoopElement.appendChild(topping);
}

function clearIceCream() {
    // Remove all scoops
    gameState.scoops.forEach(scoop => {
        scoop.element.remove();
    });
    gameState.scoops = [];
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearIceCream();
}

function handleServe(e) {
    e.preventDefault();

    // Check if ice cream has scoops
    if (gameState.scoops.length === 0) {
        // Shake the container
        elements.iceCreamContainer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.iceCreamContainer.style.animation = '';
        }, 500);
        return;
    }

    // Increment score
    gameState.conesMade++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearIceCream();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.conesMade;

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
