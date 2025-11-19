'use strict';

// === Configuration ===
const THEMES = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍒', '🍑', '🍉'],
    emojis: ['😀', '😎', '🤩', '😍', '🥳', '😜', '🤗', '😇'],
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
};

// === State Management ===
let gameState = {
    theme: null,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// === DOM References ===
const elements = {
    themeSelector: document.getElementById('theme-selector'),
    gameArea: document.getElementById('game-area'),
    board: document.getElementById('game-board'),
    moves: document.getElementById('moves'),
    matches: document.getElementById('matches'),
    timer: document.getElementById('timer'),
    restartBtn: document.getElementById('restart-btn'),
    changeThemeBtn: document.getElementById('change-theme-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    gameOverModal: document.getElementById('game-over-modal'),
    finalStats: document.getElementById('final-stats')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.theme));
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            startGame(btn.dataset.theme);
        });
    });

    elements.restartBtn.addEventListener('click', () => startGame(gameState.theme));
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame(gameState.theme);
    });

    elements.changeThemeBtn.addEventListener('click', showThemeSelector);
    elements.changeThemeBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showThemeSelector();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverModal.style.display = 'none';
        startGame(gameState.theme);
    });
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        elements.gameOverModal.style.display = 'none';
        startGame(gameState.theme);
    });
}

function showThemeSelector() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    elements.gameArea.style.display = 'none';
    elements.themeSelector.style.display = 'block';
}

// === Game Control ===
function startGame(theme) {
    gameState = {
        theme: theme,
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        startTime: Date.now(),
        timerInterval: null,
        isProcessing: false
    };

    createCards();
    startTimer();
    updateDisplay();

    elements.themeSelector.style.display = 'none';
    elements.gameArea.style.display = 'block';
}

function createCards() {
    const symbols = THEMES[gameState.theme];
    const cardPairs = [...symbols, ...symbols];

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    elements.board.innerHTML = '';
    gameState.cards = [];

    cardPairs.forEach((symbol, index) => {
        const card = {
            id: index,
            symbol: symbol,
            isFlipped: false,
            isMatched: false,
            element: null
        };

        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = index;

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = '🎴';
        cardElement.appendChild(cardBack);

        cardElement.addEventListener('click', () => handleCardClick(card));
        cardElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCardClick(card);
        });

        card.element = cardElement;
        elements.board.appendChild(cardElement);
        gameState.cards.push(card);
    });
}

function startTimer() {
    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === Game Logic ===
function handleCardClick(card) {
    if (gameState.isProcessing || card.isFlipped || card.isMatched ||
        gameState.flippedCards.length >= 2) {
        return;
    }

    // Flip card
    card.isFlipped = true;
    card.element.classList.add('flipped');
    card.element.textContent = card.symbol;
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        gameState.isProcessing = true;
        updateDisplay();

        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

function checkMatch() {
    const [card1, card2] = gameState.flippedCards;

    if (card1.symbol === card2.symbol) {
        // Match!
        card1.isMatched = true;
        card2.isMatched = true;
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');

        gameState.matchedPairs++;
        updateDisplay();

        if (gameState.matchedPairs === 8) {
            endGame();
        }
    } else {
        // No match - flip back
        card1.isFlipped = false;
        card2.isFlipped = false;
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
        card1.element.textContent = '';
        card2.element.textContent = '';

        const cardBack1 = document.createElement('div');
        cardBack1.className = 'card-back';
        cardBack1.textContent = '🎴';
        card1.element.appendChild(cardBack1);

        const cardBack2 = document.createElement('div');
        cardBack2.className = 'card-back';
        cardBack2.textContent = '🎴';
        card2.element.appendChild(cardBack2);
    }

    gameState.flippedCards = [];
    gameState.isProcessing = false;
}

function endGame() {
    clearInterval(gameState.timerInterval);

    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    elements.finalStats.textContent =
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')} | Moves: ${gameState.moves}`;

    setTimeout(() => {
        elements.gameOverModal.style.display = 'flex';
    }, 500);
}

// === Display Updates ===
function updateDisplay() {
    elements.moves.textContent = `Moves: ${gameState.moves}`;
    elements.matches.textContent = `Matches: ${gameState.matchedPairs}/8`;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
