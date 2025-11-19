'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    locations: [
        {
            id: 'beach',
            name: 'Beach',
            emoji: '🏖️',
            clue: 'Start your journey where the waves meet the sand, and ships arrive on land.',
            hint: 'Look for the beach or dock!'
        },
        {
            id: 'palm',
            name: 'Palm Tree',
            emoji: '🌴',
            clue: 'Where tall trees sway with coconuts high, birds nest and trade winds fly.',
            hint: 'Find a tree with coconuts!'
        },
        {
            id: 'cave',
            name: 'Dark Cave',
            emoji: '🦇',
            clue: 'In darkness deep where bats might dwell, echoes bounce and shadows swell.',
            hint: 'Look for a dark, spooky place!'
        },
        {
            id: 'waterfall',
            name: 'Waterfall',
            emoji: '💧',
            clue: 'Where water falls from way up high, creating rainbows in the sky.',
            hint: 'Find where water falls down!'
        },
        {
            id: 'mountain',
            name: 'Mountain',
            emoji: '⛰️',
            clue: 'The highest point where eagles soar, climb up high to explore some more.',
            hint: 'Look for the tallest peak!'
        },
        {
            id: 'ruins',
            name: 'Ancient Ruins',
            emoji: '🏛️',
            clue: 'Where ancient stones tell stories old, of treasure hunters brave and bold.',
            hint: 'Find old, broken buildings!'
        },
        {
            id: 'treasure',
            name: 'Treasure',
            emoji: '💰',
            clue: 'X marks the spot where gold is told, dig here to find the treasure of old!',
            hint: 'You found it!'
        }
    ]
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    currentLocationIndex: 0,
    isPlaying: false,
    startTime: 0,
    elapsedSeconds: 0,
    hintsUsed: 0,
    hintShownForCurrent: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    hintBtn: document.getElementById('hintBtn'),

    // Display elements
    cluesFoundDisplay: document.getElementById('cluesFound'),
    timerDisplay: document.getElementById('timer'),
    gameMessage: document.getElementById('gameMessage'),
    treasureMap: document.getElementById('treasureMap'),
    clueDisplay: document.getElementById('clueDisplay'),
    clueText: document.getElementById('clueText'),
    hintText: document.getElementById('hintText'),
    successOverlay: document.getElementById('successOverlay'),
    finalTime: document.getElementById('finalTime'),
    hintsUsedDisplay: document.getElementById('hintsUsed')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Treasure Hunt initialized');
    setupEventListeners();
    createMapLocations();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Hint button
    elements.hintBtn.addEventListener('touchstart', handleHint);
    elements.hintBtn.addEventListener('click', handleHint);
}

function createMapLocations() {
    elements.treasureMap.innerHTML = '';

    CONFIG.locations.forEach((location, index) => {
        const locationDiv = document.createElement('div');
        locationDiv.className = 'map-location locked';
        locationDiv.dataset.locationId = location.id;
        locationDiv.dataset.index = index;

        const emoji = document.createElement('div');
        emoji.className = 'location-emoji';
        emoji.textContent = location.emoji;

        const name = document.createElement('div');
        name.className = 'location-name';
        name.textContent = location.name;

        const status = document.createElement('div');
        status.className = 'location-status';
        status.textContent = '';

        locationDiv.appendChild(status);
        locationDiv.appendChild(emoji);
        locationDiv.appendChild(name);

        // Add click handler
        locationDiv.addEventListener('touchstart', handleLocationClick);
        locationDiv.addEventListener('click', handleLocationClick);

        elements.treasureMap.appendChild(locationDiv);
    });
}

// ==========================================
// GAME TIMER
// ==========================================

let timerInterval = null;

function startTimer() {
    gameState.startTime = Date.now();
    gameState.elapsedSeconds = 0;

    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        gameState.elapsedSeconds = elapsed;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.currentLocationIndex = 0;
    gameState.hintsUsed = 0;
    gameState.hintShownForCurrent = false;

    // Hide welcome message and show game
    elements.gameMessage.style.display = 'none';
    elements.treasureMap.style.display = 'grid';
    elements.clueDisplay.style.display = 'block';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Start timer
    startTimer();

    // Show first location as active
    updateMapState();
    showCurrentClue();
    updateCluesDisplay();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();

    // Show success overlay
    elements.finalTime.textContent = formatTime(gameState.elapsedSeconds);
    elements.hintsUsedDisplay.textContent = gameState.hintsUsed;
    elements.successOverlay.style.display = 'flex';

    console.log('Game completed! Time:', gameState.elapsedSeconds, 'Hints:', gameState.hintsUsed);
}

function resetGame() {
    gameState.currentLocationIndex = 0;
    gameState.isPlaying = false;
    gameState.elapsedSeconds = 0;
    gameState.hintsUsed = 0;
    gameState.hintShownForCurrent = false;

    stopTimer();

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.treasureMap.style.display = 'none';
    elements.clueDisplay.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.successOverlay.style.display = 'none';
    elements.hintText.style.display = 'none';

    // Reset map locations
    const locations = elements.treasureMap.querySelectorAll('.map-location');
    locations.forEach(loc => {
        loc.classList.remove('active', 'found');
        loc.classList.add('locked');
        const status = loc.querySelector('.location-status');
        status.textContent = '';
    });

    updateTimerDisplay();
    updateCluesDisplay();

    console.log('Game reset');
}

// ==========================================
// GAME LOGIC
// ==========================================

function updateMapState() {
    const locations = elements.treasureMap.querySelectorAll('.map-location');

    locations.forEach((loc, index) => {
        const status = loc.querySelector('.location-status');

        if (index < gameState.currentLocationIndex) {
            // Past locations - mark as found
            loc.classList.remove('active', 'locked');
            loc.classList.add('found');
            status.textContent = '✓';
        } else if (index === gameState.currentLocationIndex) {
            // Current location - mark as active
            loc.classList.remove('locked', 'found');
            loc.classList.add('active');
            status.textContent = '📍';
        } else {
            // Future locations - keep locked
            loc.classList.add('locked');
            loc.classList.remove('active', 'found');
            status.textContent = '🔒';
        }
    });
}

function showCurrentClue() {
    const currentLocation = CONFIG.locations[gameState.currentLocationIndex];
    elements.clueText.textContent = currentLocation.clue;
    elements.hintText.style.display = 'none';
    elements.hintBtn.disabled = false;
    gameState.hintShownForCurrent = false;
}

function handleLocationClick(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const clickedIndex = parseInt(e.currentTarget.dataset.index);

    // Check if this is the correct location
    if (clickedIndex === gameState.currentLocationIndex) {
        // Correct location!
        const locationElement = e.currentTarget;

        // Add animation
        locationElement.classList.add('fade-in');

        // Move to next location
        gameState.currentLocationIndex++;
        gameState.hintShownForCurrent = false;

        updateCluesDisplay();

        // Check if game is complete
        if (gameState.currentLocationIndex >= CONFIG.locations.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        } else {
            // Show next clue
            setTimeout(() => {
                updateMapState();
                showCurrentClue();
            }, 300);
        }
    } else if (clickedIndex < gameState.currentLocationIndex) {
        // Already found location - give feedback
        console.log('Already found this location');
    } else {
        // Wrong location - it's locked
        console.log('This location is locked');
    }
}

function handleHint(e) {
    e.preventDefault();

    if (!gameState.isPlaying || gameState.hintShownForCurrent) return;

    const currentLocation = CONFIG.locations[gameState.currentLocationIndex];
    elements.hintText.textContent = currentLocation.hint;
    elements.hintText.style.display = 'block';

    gameState.hintsUsed++;
    gameState.hintShownForCurrent = true;
    elements.hintBtn.disabled = true;
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
    setTimeout(() => {
        startGame();
    }, 100);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateCluesDisplay() {
    elements.cluesFoundDisplay.textContent = `${gameState.currentLocationIndex}/${CONFIG.locations.length}`;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = formatTime(gameState.elapsedSeconds);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopTimer();
});
