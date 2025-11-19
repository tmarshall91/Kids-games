'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const PETS = [
    {emoji: '🐕', name: 'Dog', speed: 0},
    {emoji: '🐈', name: 'Cat', speed: 0},
    {emoji: '🐰', name: 'Rabbit', speed: 0},
    {emoji: '🐢', name: 'Turtle', speed: 0},
    {emoji: '🐎', name: 'Horse', speed: 0},
    {emoji: '🦘', name: 'Kangaroo', speed: 0}
];

const CONFIG = {
    raceDistance: 280, // pixels
    updateInterval: 50, // ms
    racerCount: 4
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    selectedPet: null,
    racers: [],
    raceInterval: null,
    isRacing: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    petSelection: document.getElementById('petSelection'),
    petsGrid: document.getElementById('petsGrid'),
    raceTrack: document.getElementById('raceTrack'),
    raceLanes: document.getElementById('raceLanes'),
    raceInfo: document.getElementById('raceInfo'),
    startRaceBtn: document.getElementById('startRaceBtn'),
    raceAgainBtn: document.getElementById('raceAgainBtn'),
    newRaceBtn: document.getElementById('newRaceBtn'),
    winnerOverlay: document.getElementById('winnerOverlay'),
    winnerTitle: document.getElementById('winnerTitle'),
    winnerPet: document.getElementById('winnerPet'),
    winnerText: document.getElementById('winnerText'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Pet Race initialized');
    setupEventListeners();
    createPetCards();
}

function setupEventListeners() {
    elements.startRaceBtn.addEventListener('touchstart', handleStartRace);
    elements.startRaceBtn.addEventListener('click', handleStartRace);
    elements.raceAgainBtn.addEventListener('touchstart', handleRaceAgain);
    elements.raceAgainBtn.addEventListener('click', handleRaceAgain);
    elements.newRaceBtn.addEventListener('touchstart', handleNewRace);
    elements.newRaceBtn.addEventListener('click', handleNewRace);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// PET SELECTION
// ==========================================

function createPetCards() {
    elements.petsGrid.innerHTML = '';
    PETS.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.dataset.pet = pet.emoji;

        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = pet.emoji;

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = pet.name;

        card.appendChild(emoji);
        card.appendChild(name);

        card.addEventListener('touchstart', (e) => handlePetSelect(e, pet));
        card.addEventListener('click', (e) => handlePetSelect(e, pet));

        elements.petsGrid.appendChild(card);
    });
}

function handlePetSelect(e, pet) {
    e.preventDefault();

    gameState.selectedPet = pet;

    // Update UI
    document.querySelectorAll('.pet-card').forEach(card => {
        card.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');

    // Show start button
    elements.startRaceBtn.style.display = 'inline-block';
}

// ==========================================
// RACE SETUP
// ==========================================

function setupRace() {
    // Select racers (player + random opponents)
    const opponents = PETS.filter(p => p !== gameState.selectedPet);
    shuffleArray(opponents);
    const selectedOpponents = opponents.slice(0, CONFIG.racerCount - 1);

    gameState.racers = [
        {pet: gameState.selectedPet, position: 0, isPlayer: true},
        ...selectedOpponents.map(pet => ({pet, position: 0, isPlayer: false}))
    ];

    // Randomize speeds
    gameState.racers.forEach(racer => {
        racer.speed = Math.random() * 3 + 2; // Random speed between 2-5
    });

    // Shuffle lane order
    shuffleArray(gameState.racers);

    // Create race lanes
    elements.raceLanes.innerHTML = '';
    gameState.racers.forEach((racer, index) => {
        const lane = document.createElement('div');
        lane.className = 'race-lane';

        const racerEl = document.createElement('div');
        racerEl.className = racer.isPlayer ? 'racer player' : 'racer';
        racerEl.textContent = racer.pet.emoji;
        racerEl.id = `racer-${index}`;

        lane.appendChild(racerEl);
        elements.raceLanes.appendChild(lane);

        racer.element = racerEl;
    });

    // Update UI
    elements.petSelection.style.display = 'none';
    elements.raceTrack.style.display = 'flex';
    elements.startRaceBtn.style.display = 'none';
    elements.raceAgainBtn.style.display = 'inline-block';

    // Countdown
    countdown();
}

function countdown() {
    let count = 3;
    elements.raceInfo.querySelector('p').textContent = count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            elements.raceInfo.querySelector('p').textContent = count;
        } else {
            clearInterval(countdownInterval);
            elements.raceInfo.querySelector('p').textContent = 'GO!';
            setTimeout(() => {
                startRace();
            }, 500);
        }
    }, 1000);
}

// ==========================================
// RACE EXECUTION
// ==========================================

function startRace() {
    gameState.isRacing = true;
    elements.raceInfo.style.display = 'none';

    gameState.raceInterval = setInterval(() => {
        let raceFinished = false;

        gameState.racers.forEach(racer => {
            // Move racer
            racer.position += racer.speed;
            racer.element.style.left = racer.position + 'px';

            // Check if finished
            if (racer.position >= CONFIG.raceDistance && !raceFinished) {
                raceFinished = true;
                finishRace(racer);
            }
        });
    }, CONFIG.updateInterval);

    console.log('Race started!');
}

function finishRace(winner) {
    gameState.isRacing = false;

    // Stop race
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
        gameState.raceInterval = null;
    }

    // Show winner
    const isPlayerWinner = winner.isPlayer;

    elements.winnerTitle.textContent = isPlayerWinner ? '🏆 You Won! 🏆' : '🏁 Race Over 🏁';
    elements.winnerPet.textContent = winner.pet.emoji;

    if (isPlayerWinner) {
        elements.winnerText.textContent = `Your ${winner.pet.name} won the race!`;
    } else {
        elements.winnerText.textContent = `The ${winner.pet.name} won! Better luck next time!`;
    }

    setTimeout(() => {
        elements.winnerOverlay.style.display = 'flex';
    }, 500);

    console.log('Race finished! Winner:', winner.pet.name);
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStartRace(e) {
    e.preventDefault();
    if (gameState.selectedPet) {
        setupRace();
    }
}

function handleRaceAgain(e) {
    e.preventDefault();
    if (!gameState.isRacing) {
        setupRace();
    }
}

function handleNewRace(e) {
    e.preventDefault();
    resetGame();
}

// ==========================================
// GAME RESET
// ==========================================

function resetGame() {
    gameState.selectedPet = null;
    gameState.racers = [];
    gameState.isRacing = false;

    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
        gameState.raceInterval = null;
    }

    // Reset UI
    elements.petSelection.style.display = 'block';
    elements.raceTrack.style.display = 'none';
    elements.raceInfo.style.display = 'block';
    elements.raceInfo.querySelector('p').textContent = 'Get ready...';
    elements.startRaceBtn.style.display = 'none';
    elements.raceAgainBtn.style.display = 'none';
    elements.winnerOverlay.style.display = 'none';

    // Clear selections
    document.querySelectorAll('.pet-card').forEach(card => {
        card.classList.remove('selected');
    });

    console.log('Game reset');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    if (gameState.raceInterval) {
        clearInterval(gameState.raceInterval);
    }
});
