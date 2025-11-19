'use strict';

// === Configuration ===
const CONFIG = {
    symbols: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉'],
    flipDelay: 1000
};

// === State Management ===
let gameState = {
    pairCount: 6,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isProcessing: false,
    isPlaying: false
};

// === DOM References ===
const elements = {
    difficultySelector: document.getElementById('difficultySelector'),
    cardsContainer: document.getElementById('cardsContainer'),
    gameMessage: document.getElementById('gameMessage'),
    resetBtn: document.getElementById('resetBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    pairs: document.getElementById('pairs'),
    moves: document.getElementById('moves'),
    timer: document.getElementById('timer'),
    finalMoves: document.getElementById('finalMoves'),
    finalTime: document.getElementById('finalTime')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', handleDifficultySelect);
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleDifficultySelect(e);
        });
    });

    // Control buttons
    elements.resetBtn.addEventListener('click', resetGame);
    elements.resetBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetGame();
    });

    elements.newGameBtn.addEventListener('click', resetToMenu);
    elements.newGameBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetToMenu();
    });
}

// === Difficulty Selection ===
function handleDifficultySelect(e) {
    const pairCount = parseInt(e.target.dataset.pairs);
    startGame(pairCount);
}

// === Game Start ===
function startGame(pairCount) {
    gameState.pairCount = pairCount;
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.isPlaying = true;
    gameState.isProcessing = false;

    // Hide difficulty selector, show cards
    elements.difficultySelector.style.display = 'none';
    elements.cardsContainer.style.display = 'grid';
    elements.resetBtn.style.display = 'inline-block';
    elements.newGameBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    createCards();
    startTimer();
    updateStats();
}

// === Card Creation ===
function createCards() {
    const pairCount = gameState.pairCount;
    const totalCards = pairCount * 2;

    // Select random symbols
    const selectedSymbols = CONFIG.symbols.slice(0, pairCount);

    // Create pairs and shuffle
    gameState.cards = [...selectedSymbols, ...selectedSymbols];
    shuffleArray(gameState.cards);

    // Set grid layout based on card count
    const columns = pairCount === 6 ? 3 : 4;
    elements.cardsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    // Render cards
    renderCards();
}

// === Card Rendering ===
function renderCards() {
    elements.cardsContainer.innerHTML = '';

    gameState.cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = '?';

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = symbol;

        card.appendChild(cardFront);
        card.appendChild(cardBack);

        card.addEventListener('click', () => handleCardClick(card, index));
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCardClick(card, index);
        });

        elements.cardsContainer.appendChild(card);
    });
}

// === Card Click Handler ===
function handleCardClick(card, index) {
    if (!gameState.isPlaying || gameState.isProcessing) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (gameState.flippedCards.length >= 2) return;

    // Flip the card
    card.classList.add('flipped');
    gameState.flippedCards.push({ card, index });

    // Check for match when two cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateStats();
        checkMatch();
    }
}

// === Match Checking ===
function checkMatch() {
    gameState.isProcessing = true;

    const [first, second] = gameState.flippedCards;
    const firstSymbol = first.card.dataset.symbol;
    const secondSymbol = second.card.dataset.symbol;

    if (firstSymbol === secondSymbol) {
        // Match found
        setTimeout(() => {
            first.card.classList.add('matched');
            second.card.classList.add('matched');
            gameState.matchedPairs++;
            updateStats();
            gameState.flippedCards = [];
            gameState.isProcessing = false;

            // Check for win
            if (gameState.matchedPairs === gameState.pairCount) {
                endGame();
            }
        }, 500);
    } else {
        // No match
        first.card.classList.add('wrong');
        second.card.classList.add('wrong');

        setTimeout(() => {
            first.card.classList.remove('flipped', 'wrong');
            second.card.classList.remove('flipped', 'wrong');
            gameState.flippedCards = [];
            gameState.isProcessing = false;
        }, CONFIG.flipDelay);
    }
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;

    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Show completion message
    setTimeout(() => {
        elements.finalMoves.textContent = gameState.moves;
        elements.finalTime.textContent = elements.timer.textContent;

        elements.cardsContainer.style.display = 'none';
        elements.gameMessage.style.display = 'block';
        elements.resetBtn.style.display = 'none';
    }, 1000);
}

// === Timer ===
function startTimer() {
    gameState.startTime = Date.now();

    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === UI Updates ===
function updateStats() {
    elements.pairs.textContent = gameState.matchedPairs;
    elements.moves.textContent = gameState.moves;
}

// === Reset ===
function resetGame() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Start new game with same difficulty
    startGame(gameState.pairCount);
}

function resetToMenu() {
    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Reset state
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.isPlaying = false;
    elements.pairs.textContent = '0';
    elements.moves.textContent = '0';
    elements.timer.textContent = '0:00';

    // Show difficulty selector
    elements.difficultySelector.style.display = 'block';
    elements.cardsContainer.style.display = 'none';
    elements.gameMessage.style.display = 'none';
    elements.resetBtn.style.display = 'none';
    elements.newGameBtn.style.display = 'none';
}

// === Utility Functions ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
