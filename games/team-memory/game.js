'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    pairs: 8, // 8 pairs = 16 cards
    emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍', '🥭', '🍏', '🍐', '🥥', '🫐'],
    flipDelay: 1000, // Time to show mismatched cards
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    moves: 0,
    pairsFound: 0,
    isPlaying: false,
    flippedCards: [],
    canFlip: true,
    cards: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    pairsDisplay: document.getElementById('pairs'),
    movesDisplay: document.getElementById('moves'),
    finalMovesDisplay: document.getElementById('finalMoves'),
    performance: document.getElementById('performance'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    cardsContainer: document.getElementById('cardsContainer'),
    cardsGrid: document.getElementById('cardsGrid'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Team Memory Game initialized');
    setupEventListeners();
    resetGame();
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
}

// ==========================================
// CARD GENERATION
// ==========================================

function generateCards() {
    // Select random emojis
    const selectedEmojis = [];
    const availableEmojis = [...CONFIG.emojis];

    for (let i = 0; i < CONFIG.pairs; i++) {
        const randomIndex = Math.floor(Math.random() * availableEmojis.length);
        selectedEmojis.push(availableEmojis[randomIndex]);
        availableEmojis.splice(randomIndex, 1);
    }

    // Create pairs
    gameState.cards = [...selectedEmojis, ...selectedEmojis];

    // Shuffle cards
    shuffleArray(gameState.cards);

    renderCards();
}

function renderCards() {
    elements.cardsGrid.innerHTML = '';

    gameState.cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        const cardIcon = document.createElement('div');
        cardIcon.className = 'card-icon';
        cardIcon.textContent = '❓';
        cardFront.appendChild(cardIcon);

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = emoji;

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        // Add click handler
        card.addEventListener('touchstart', (e) => handleCardClick(e, index));
        card.addEventListener('click', (e) => handleCardClick(e, index));

        elements.cardsGrid.appendChild(card);
    });
}

function handleCardClick(e, index) {
    e.preventDefault();

    if (!gameState.isPlaying || !gameState.canFlip) return;

    const card = elements.cardsGrid.children[index];

    // Can't flip already flipped or matched cards
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    // Flip the card
    card.classList.add('flipped');
    gameState.flippedCards.push({ index, card, emoji: gameState.cards[index] });

    // Check if two cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateMovesDisplay();

        const [card1, card2] = gameState.flippedCards;

        // Check if they match
        if (card1.emoji === card2.emoji) {
            // Match found!
            setTimeout(() => {
                card1.card.classList.add('matched');
                card2.card.classList.add('matched');
                gameState.pairsFound++;
                updatePairsDisplay();

                gameState.flippedCards = [];
                gameState.canFlip = true;

                // Check if game is complete
                if (gameState.pairsFound === CONFIG.pairs) {
                    setTimeout(() => {
                        endGame();
                    }, 500);
                }
            }, 500);
        } else {
            // No match - flip back after delay
            setTimeout(() => {
                card1.card.classList.remove('flipped');
                card2.card.classList.remove('flipped');
                gameState.flippedCards = [];
                gameState.canFlip = true;
            }, CONFIG.flipDelay);
        }
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.moves = 0;
    gameState.pairsFound = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.cardsContainer.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateMovesDisplay();
    updatePairsDisplay();

    // Generate and display cards
    generateCards();

    console.log('Game started');
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate performance
    const perfectMoves = CONFIG.pairs; // Minimum moves to win
    const actualMoves = gameState.moves;
    let performanceText = '';

    if (actualMoves === perfectMoves) {
        performanceText = '🌟 Perfect! Amazing memory!';
    } else if (actualMoves <= perfectMoves + 5) {
        performanceText = '🎉 Excellent! Great teamwork!';
    } else if (actualMoves <= perfectMoves + 10) {
        performanceText = '👍 Good job! Keep practicing!';
    } else {
        performanceText = '💪 Nice effort! Try again!';
    }

    // Show game over overlay
    elements.finalMovesDisplay.textContent = actualMoves;
    elements.performance.textContent = performanceText;
    setTimeout(() => {
        elements.gameOverOverlay.style.display = 'flex';
    }, 1000);

    console.log('Game ended. Moves:', actualMoves);
}

function resetGame() {
    gameState.moves = 0;
    gameState.pairsFound = 0;
    gameState.isPlaying = false;
    gameState.flippedCards = [];
    gameState.canFlip = true;
    gameState.cards = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.cardsContainer.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateMovesDisplay();
    updatePairsDisplay();

    console.log('Game reset');
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

function updateMovesDisplay() {
    elements.movesDisplay.textContent = gameState.moves;
}

function updatePairsDisplay() {
    elements.pairsDisplay.textContent = `${gameState.pairsFound}/${CONFIG.pairs}`;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
