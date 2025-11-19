'use strict';

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    cookiesMade: 0,
    currentFrosting: null
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    cookie: document.getElementById('cookie'),
    decorations: document.getElementById('decorations'),

    // Buttons
    colorButtons: document.querySelectorAll('.color-btn'),
    decorationButtons: document.querySelectorAll('.decoration-btn'),
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
    console.log('Cookie Decorator initialized');
    setupEventListeners();
    updateScoreDisplay();
}

function setupEventListeners() {
    // Color buttons
    elements.colorButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleColorClick);
        btn.addEventListener('click', handleColorClick);
    });

    // Decoration buttons
    elements.decorationButtons.forEach(btn => {
        btn.addEventListener('touchstart', handleDecorationClick);
        btn.addEventListener('click', handleDecorationClick);
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
// DECORATION MANAGEMENT
// ==========================================

function handleColorClick(e) {
    e.preventDefault();
    const color = e.currentTarget.dataset.color;
    applyFrosting(color);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function applyFrosting(color) {
    gameState.currentFrosting = color;
    elements.cookie.style.background = `radial-gradient(circle, ${color} 0%, ${adjustColor(color, -30)} 100%)`;
}

function handleDecorationClick(e) {
    e.preventDefault();
    const decorationType = e.currentTarget.dataset.decoration;
    addDecoration(decorationType);

    // Visual feedback
    e.currentTarget.classList.add('pulse');
    setTimeout(() => {
        e.currentTarget.classList.remove('pulse');
    }, 300);
}

function addDecoration(type) {
    const decoration = document.createElement('div');
    decoration.className = `decoration ${type}`;

    // Random position
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 70 + 10; // 10-80px from center
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;

    decoration.style.left = `${x}%`;
    decoration.style.top = `${y}%`;
    decoration.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

    // Random colors for sprinkles and candies
    if (type === 'sprinkle') {
        const colors = ['#ff69b4', '#4169e1', '#ffd700', '#ff4500', '#9370db'];
        decoration.style.background = colors[Math.floor(Math.random() * colors.length)];
    } else if (type === 'candy') {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf'];
        decoration.style.background = colors[Math.floor(Math.random() * colors.length)];
    }

    elements.decorations.appendChild(decoration);
}

function clearCookie() {
    elements.decorations.innerHTML = '';
    elements.cookie.style.background = 'radial-gradient(circle, #f4a460 0%, #d2691e 100%)';
    gameState.currentFrosting = null;
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleClear(e) {
    e.preventDefault();
    clearCookie();
}

function handleServe(e) {
    e.preventDefault();

    // Increment score
    gameState.cookiesMade++;
    updateScoreDisplay();

    // Show success overlay
    elements.successOverlay.style.display = 'flex';
}

function handleNext(e) {
    e.preventDefault();
    clearCookie();
    elements.successOverlay.style.display = 'none';
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.cookiesMade;

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
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
