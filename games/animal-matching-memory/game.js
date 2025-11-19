'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const ANIMALS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    isPlaying: false,
    canFlip: true
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    scoreDisplay: document.getElementById('score'),
    movesDisplay: document.getElementById('moves'),
    finalMatches: document.getElementById('finalMatches'),
    finalMoves: document.getElementById('finalMoves'),
    gameMessage: document.getElementById('gameMessage'),
    cardGrid: document.getElementById('cardGrid'),
    gameOverOverlay: document.getElementById('gameOverOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Animal Matching Memory initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.cardGrid.style.display = 'grid';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateMovesDisplay();

    // Create and shuffle cards
    createCards();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Show game over overlay
    elements.finalMatches.textContent = gameState.matchedPairs;
    elements.finalMoves.textContent = gameState.moves;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Matches:', gameState.matchedPairs, 'Moves:', gameState.moves);
}

function resetGame() {
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.isPlaying = false;
    gameState.flippedCards = [];
    gameState.canFlip = true;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.cardGrid.style.display = 'none';
    elements.cardGrid.innerHTML = '';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateMovesDisplay();

    console.log('Game reset');
}

// ==========================================
// CARD CREATION & MANAGEMENT
// ==========================================

function createCards() {
    // Create pairs of animals
    const cardValues = [...ANIMALS, ...ANIMALS];

    // Shuffle the cards
    shuffleArray(cardValues);

    // Clear existing cards
    elements.cardGrid.innerHTML = '';
    gameState.cards = [];

    // Create card elements
    cardValues.forEach((animal, index) => {
        const card = createCardElement(animal, index);
        elements.cardGrid.appendChild(card);
        gameState.cards.push({
            element: card,
            value: animal,
            isFlipped: false,
            isMatched: false
        });
    });
}

function createCardElement(animal, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.textContent = '🐾';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.textContent = animal;

    card.appendChild(cardBack);
    card.appendChild(cardFront);

    // Add event listeners
    card.addEventListener('touchstart', handleCardClick);
    card.addEventListener('click', handleCardClick);

    return card;
}

function handleCardClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying || !gameState.canFlip) return;

    const index = parseInt(e.currentTarget.dataset.index);
    const card = gameState.cards[index];

    // Don't flip if already flipped or matched
    if (card.isFlipped || card.isMatched) return;

    // Flip the card
    flipCard(card);

    // Add to flipped cards array
    gameState.flippedCards.push(card);

    // Check if we have two cards flipped
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateMovesDisplay();
        checkForMatch();
    }
}

function flipCard(card) {
    card.isFlipped = true;
    card.element.classList.add('flipped');
}

function unflipCard(card) {
    card.isFlipped = false;
    card.element.classList.remove('flipped');
}

function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;

    if (card1.value === card2.value) {
        // Match found!
        setTimeout(() => {
            card1.isMatched = true;
            card2.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');

            gameState.matchedPairs++;
            updateScoreDisplay();

            // Add pulse animation to score
            elements.scoreDisplay.classList.add('pulse');
            setTimeout(() => {
                elements.scoreDisplay.classList.remove('pulse');
            }, 300);

            gameState.flippedCards = [];
            gameState.canFlip = true;

            // Check if game is complete
            if (gameState.matchedPairs === ANIMALS.length) {
                setTimeout(() => endGame(), 500);
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            unflipCard(card1);
            unflipCard(card2);
            gameState.flippedCards = [];
            gameState.canFlip = true;
        }, 1000);
    }
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
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.matchedPairs;
}

function updateMovesDisplay() {
    elements.movesDisplay.textContent = gameState.moves;
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
