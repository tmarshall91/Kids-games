'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const OPTIONS = {
    pets: ['🐕', '🐈', '🐰', '🐹', '🐻', '🦊', '🐼', '🐨'],
    hats: ['👑', '🎩', '🧢', '👒', '🎀', '⭐'],
    accessories: ['🎀', '💎', '🌸', '🦴', '🐾', '❤️'],
    backgrounds: [
        { emoji: '🌈', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { emoji: '🌸', style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
        { emoji: '🌊', style: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { emoji: '🌟', style: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)' },
        { emoji: '🌺', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { emoji: '🍃', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
    ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    selectedPet: '🐕',
    selectedHat: null,
    selectedAccessory: null,
    selectedBackground: null
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    clearBtn: document.getElementById('clearBtn'),
    randomBtn: document.getElementById('randomBtn'),
    petBase: document.getElementById('petBase'),
    petHat: document.getElementById('petHat'),
    petAccessory: document.getElementById('petAccessory'),
    petBackground: document.getElementById('petBackground'),
    petContainer: document.getElementById('petContainer'),
    petOptions: document.getElementById('petOptions'),
    hatOptions: document.getElementById('hatOptions'),
    accessoryOptions: document.getElementById('accessoryOptions'),
    backgroundOptions: document.getElementById('backgroundOptions')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Pet Dress-Up initialized');
    setupEventListeners();
    createOptionButtons();
    updatePetDisplay();
}

function setupEventListeners() {
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);
    elements.randomBtn.addEventListener('touchstart', handleRandom);
    elements.randomBtn.addEventListener('click', handleRandom);
}

function createOptionButtons() {
    // Create pet options
    OPTIONS.pets.forEach(pet => {
        const btn = createOptionButton(pet, 'pet');
        if (pet === gameState.selectedPet) {
            btn.classList.add('selected');
        }
        elements.petOptions.appendChild(btn);
    });

    // Create hat options with "None" option
    const noneHatBtn = createOptionButton('None', 'hat', true);
    noneHatBtn.classList.add('selected');
    elements.hatOptions.appendChild(noneHatBtn);
    OPTIONS.hats.forEach(hat => {
        const btn = createOptionButton(hat, 'hat');
        elements.hatOptions.appendChild(btn);
    });

    // Create accessory options with "None" option
    const noneAccessoryBtn = createOptionButton('None', 'accessory', true);
    noneAccessoryBtn.classList.add('selected');
    elements.accessoryOptions.appendChild(noneAccessoryBtn);
    OPTIONS.accessories.forEach(accessory => {
        const btn = createOptionButton(accessory, 'accessory');
        elements.accessoryOptions.appendChild(btn);
    });

    // Create background options with "None" option
    const noneBackgroundBtn = createOptionButton('None', 'background', true);
    noneBackgroundBtn.classList.add('selected');
    elements.backgroundOptions.appendChild(noneBackgroundBtn);
    OPTIONS.backgrounds.forEach((bg, index) => {
        const btn = createOptionButton(bg.emoji, 'background');
        btn.dataset.bgIndex = index;
        elements.backgroundOptions.appendChild(btn);
    });
}

function createOptionButton(value, type, isNone = false) {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (isNone) {
        btn.classList.add('none');
    }
    btn.textContent = value;
    btn.dataset.value = value;
    btn.dataset.type = type;

    btn.addEventListener('touchstart', handleOptionClick);
    btn.addEventListener('click', handleOptionClick);

    return btn;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleOptionClick(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const type = btn.dataset.type;
    const value = btn.dataset.value;

    // Remove selected class from siblings
    const siblings = btn.parentElement.querySelectorAll('.option-btn');
    siblings.forEach(sibling => sibling.classList.remove('selected'));

    // Add selected class to clicked button
    btn.classList.add('selected');

    // Update game state
    if (value === 'None') {
        if (type === 'hat') gameState.selectedHat = null;
        else if (type === 'accessory') gameState.selectedAccessory = null;
        else if (type === 'background') gameState.selectedBackground = null;
    } else {
        if (type === 'pet') gameState.selectedPet = value;
        else if (type === 'hat') gameState.selectedHat = value;
        else if (type === 'accessory') gameState.selectedAccessory = value;
        else if (type === 'background') {
            const bgIndex = parseInt(btn.dataset.bgIndex);
            gameState.selectedBackground = OPTIONS.backgrounds[bgIndex];
        }
    }

    // Add bounce animation
    elements.petContainer.classList.add('bounce');
    setTimeout(() => {
        elements.petContainer.classList.remove('bounce');
    }, 300);

    updatePetDisplay();
}

function handleClear(e) {
    e.preventDefault();

    // Reset to defaults
    gameState.selectedPet = '🐕';
    gameState.selectedHat = null;
    gameState.selectedAccessory = null;
    gameState.selectedBackground = null;

    // Reset all selections
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Select default pet
    elements.petOptions.querySelector(`[data-value="🐕"]`).classList.add('selected');

    // Select "None" options
    elements.hatOptions.querySelector('.none').classList.add('selected');
    elements.accessoryOptions.querySelector('.none').classList.add('selected');
    elements.backgroundOptions.querySelector('.none').classList.add('selected');

    updatePetDisplay();
}

function handleRandom(e) {
    e.preventDefault();

    // Randomize selections
    gameState.selectedPet = randomItem(OPTIONS.pets);
    gameState.selectedHat = Math.random() > 0.3 ? randomItem(OPTIONS.hats) : null;
    gameState.selectedAccessory = Math.random() > 0.3 ? randomItem(OPTIONS.accessories) : null;
    gameState.selectedBackground = Math.random() > 0.3 ? randomItem(OPTIONS.backgrounds) : null;

    // Update button selections
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Select appropriate buttons
    elements.petOptions.querySelector(`[data-value="${gameState.selectedPet}"]`).classList.add('selected');

    if (gameState.selectedHat) {
        elements.hatOptions.querySelector(`[data-value="${gameState.selectedHat}"]`).classList.add('selected');
    } else {
        elements.hatOptions.querySelector('.none').classList.add('selected');
    }

    if (gameState.selectedAccessory) {
        elements.accessoryOptions.querySelector(`[data-value="${gameState.selectedAccessory}"]`).classList.add('selected');
    } else {
        elements.accessoryOptions.querySelector('.none').classList.add('selected');
    }

    if (gameState.selectedBackground) {
        const bgIndex = OPTIONS.backgrounds.indexOf(gameState.selectedBackground);
        elements.backgroundOptions.querySelector(`[data-bg-index="${bgIndex}"]`).classList.add('selected');
    } else {
        elements.backgroundOptions.querySelector('.none').classList.add('selected');
    }

    // Add bounce animation
    elements.petContainer.classList.add('bounce');
    setTimeout(() => {
        elements.petContainer.classList.remove('bounce');
    }, 300);

    updatePetDisplay();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updatePetDisplay() {
    // Update pet
    elements.petBase.textContent = gameState.selectedPet;

    // Update hat
    elements.petHat.textContent = gameState.selectedHat || '';

    // Update accessory
    elements.petAccessory.textContent = gameState.selectedAccessory || '';

    // Update background
    if (gameState.selectedBackground) {
        elements.petBackground.style.background = gameState.selectedBackground.style;
    } else {
        elements.petBackground.style.background = 'white';
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get random item from array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
