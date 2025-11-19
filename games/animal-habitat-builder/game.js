'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const ANIMALS = [
    {emoji: '🦁', name: 'Lion'},
    {emoji: '🐘', name: 'Elephant'},
    {emoji: '🐻', name: 'Bear'},
    {emoji: '🦊', name: 'Fox'},
    {emoji: '🐼', name: 'Panda'},
    {emoji: '🦒', name: 'Giraffe'}
];

const HABITAT_ITEMS = {
    nature: ['🌳', '🌲', '🌴', '🌵', '🌿', '🍃', '🌺', '🌸', '🌻'],
    water: ['💧', '🌊', '💦'],
    structures: ['🏠', '🏡', '⛺', '🏔️', '🪨'],
    food: ['🍎', '🍌', '🥕', '🥜', '🍯', '🐟']
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentAnimal: ANIMALS[0],
    placedItems: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    animalDisplay: document.getElementById('animalDisplay'),
    habitatCanvas: document.getElementById('habitatCanvas'),
    animalPalette: document.getElementById('animalPalette'),
    itemsPalette: document.getElementById('itemsPalette'),
    clearBtn: document.getElementById('clearBtn'),
    saveBtn: document.getElementById('saveBtn'),
    newHabitatBtn: document.getElementById('newHabitatBtn'),
    savedHabitat: document.getElementById('savedHabitat'),
    saveOverlay: document.getElementById('saveOverlay'),
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Animal Habitat Builder initialized');
    setupEventListeners();
    createAnimalPalette();
    createItemsPalette();
    updateCurrentAnimal();

    // Hide instructions after a moment
    setTimeout(() => {
        elements.instructions.style.display = 'none';
    }, 3000);
}

function setupEventListeners() {
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);
    elements.saveBtn.addEventListener('touchstart', handleSave);
    elements.saveBtn.addEventListener('click', handleSave);
    elements.newHabitatBtn.addEventListener('touchstart', handleNewHabitat);
    elements.newHabitatBtn.addEventListener('click', handleNewHabitat);

    // Canvas click to place items
    elements.habitatCanvas.addEventListener('touchstart', handleCanvasClick);
    elements.habitatCanvas.addEventListener('click', handleCanvasClick);
}

// ==========================================
// PALETTE CREATION
// ==========================================

function createAnimalPalette() {
    elements.animalPalette.innerHTML = '';
    ANIMALS.forEach((animal, index) => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        if (index === 0) item.classList.add('selected');
        item.textContent = animal.emoji;
        item.dataset.animal = JSON.stringify(animal);

        item.addEventListener('touchstart', (e) => handleAnimalSelect(e, animal));
        item.addEventListener('click', (e) => handleAnimalSelect(e, animal));

        elements.animalPalette.appendChild(item);
    });
}

function createItemsPalette() {
    elements.itemsPalette.innerHTML = '';

    // Combine all items
    const allItems = [
        ...HABITAT_ITEMS.nature,
        ...HABITAT_ITEMS.water,
        ...HABITAT_ITEMS.structures,
        ...HABITAT_ITEMS.food
    ];

    allItems.forEach(item => {
        const paletteItem = document.createElement('div');
        paletteItem.className = 'palette-item';
        paletteItem.textContent = item;
        paletteItem.dataset.item = item;

        paletteItem.addEventListener('touchstart', (e) => handleItemSelect(e, item));
        paletteItem.addEventListener('click', (e) => handleItemSelect(e, item));

        elements.itemsPalette.appendChild(paletteItem);
    });
}

// ==========================================
// ANIMAL SELECTION
// ==========================================

function handleAnimalSelect(e, animal) {
    e.preventDefault();

    gameState.currentAnimal = animal;

    // Update UI
    document.querySelectorAll('#animalPalette .palette-item').forEach(item => {
        item.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');

    updateCurrentAnimal();
}

function updateCurrentAnimal() {
    elements.animalDisplay.textContent = gameState.currentAnimal.emoji;
}

// ==========================================
// HABITAT BUILDING
// ==========================================

let selectedItem = null;

function handleItemSelect(e, item) {
    e.preventDefault();
    selectedItem = item;

    // Visual feedback
    document.querySelectorAll('#itemsPalette .palette-item').forEach(el => {
        el.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');
}

function handleCanvasClick(e) {
    e.preventDefault();

    if (!selectedItem) return;

    const rect = elements.habitatCanvas.getBoundingClientRect();
    let x, y;

    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    placeItem(selectedItem, x, y);
}

function placeItem(item, x, y) {
    const itemEl = document.createElement('div');
    itemEl.className = 'habitat-item';
    itemEl.textContent = item;
    itemEl.style.left = (x - 20) + 'px';
    itemEl.style.top = (y - 20) + 'px';

    // Add long-press to remove
    let pressTimer;
    itemEl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pressTimer = setTimeout(() => {
            itemEl.remove();
            gameState.placedItems = gameState.placedItems.filter(i => i.element !== itemEl);
        }, 500);
    });

    itemEl.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
    });

    itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.shiftKey || e.ctrlKey) {
            itemEl.remove();
            gameState.placedItems = gameState.placedItems.filter(i => i.element !== itemEl);
        }
    });

    elements.habitatCanvas.appendChild(itemEl);

    gameState.placedItems.push({
        item: item,
        x: x,
        y: y,
        element: itemEl
    });
}

// ==========================================
// HABITAT MANAGEMENT
// ==========================================

function handleClear(e) {
    e.preventDefault();

    // Remove all items
    elements.habitatCanvas.innerHTML = '';
    gameState.placedItems = [];

    console.log('Habitat cleared');
}

function handleSave(e) {
    e.preventDefault();

    // Create a snapshot
    const snapshot = elements.habitatCanvas.cloneNode(true);
    snapshot.style.width = '250px';
    snapshot.style.height = '250px';

    // Scale down items
    snapshot.querySelectorAll('.habitat-item').forEach(item => {
        const currentLeft = parseFloat(item.style.left);
        const currentTop = parseFloat(item.style.top);
        const canvasWidth = elements.habitatCanvas.clientWidth;
        const canvasHeight = elements.habitatCanvas.clientHeight;

        // Scale positions
        item.style.left = (currentLeft / canvasWidth * 250) + 'px';
        item.style.top = (currentTop / canvasHeight * 250) + 'px';
    });

    // Show in overlay
    elements.savedHabitat.innerHTML = '';
    elements.savedHabitat.appendChild(snapshot);

    // Add animal to habitat
    const animalEl = document.createElement('div');
    animalEl.className = 'habitat-item';
    animalEl.textContent = gameState.currentAnimal.emoji;
    animalEl.style.left = '110px';
    animalEl.style.top = '110px';
    animalEl.style.fontSize = '40px';
    elements.savedHabitat.querySelector('.habitat-canvas').appendChild(animalEl);

    elements.saveOverlay.style.display = 'flex';

    console.log('Habitat saved!');
}

function handleNewHabitat(e) {
    e.preventDefault();
    elements.saveOverlay.style.display = 'none';
    handleClear(e);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
