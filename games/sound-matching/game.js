'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Sound Generation ===
const sounds = [
    { freq: 261.63, icon: '🎵', name: 'Do' },
    { freq: 293.66, icon: '🎶', name: 'Re' },
    { freq: 329.63, icon: '🎼', name: 'Mi' },
    { freq: 349.23, icon: '🎹', name: 'Fa' },
    { freq: 392.00, icon: '🎸', name: 'Sol' },
    { freq: 440.00, icon: '🎺', name: 'La' },
    { freq: 493.88, icon: '🎻', name: 'Ti' },
    { freq: 523.25, icon: '🥁', name: 'Do2' }
];

function playSound(frequency) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
}

// === State Management ===
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    tries: 0,
    canFlip: true,
    isPlaying: false
};

// === DOM References ===
const elements = {
    cardsGrid: document.getElementById('cardsGrid'),
    pairsDisplay: document.getElementById('pairs'),
    triesDisplay: document.getElementById('tries'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalTries: document.getElementById('finalTries'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    gameState.matchedPairs = 0;
    gameState.tries = 0;
    gameState.flippedCards = [];
    gameState.canFlip = true;
    gameState.isPlaying = true;

    updatePairs();
    updateTries();

    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';

    createCards();
}

function createCards() {
    // Create pairs of cards
    gameState.cards = [];
    sounds.forEach(sound => {
        gameState.cards.push({ ...sound, id: Math.random() });
        gameState.cards.push({ ...sound, id: Math.random() });
    });

    // Shuffle cards
    gameState.cards.sort(() => Math.random() - 0.5);

    // Render cards
    elements.cardsGrid.innerHTML = '';
    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('sound-card');
        cardElement.dataset.index = index;

        const iconElement = document.createElement('div');
        iconElement.classList.add('card-icon');
        iconElement.textContent = card.icon;

        cardElement.appendChild(iconElement);

        cardElement.addEventListener('click', () => handleCardClick(index));
        cardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCardClick(index);
        });

        elements.cardsGrid.appendChild(cardElement);
    });
}

// === Card Interaction ===
function handleCardClick(index) {
    if (!gameState.canFlip || !gameState.isPlaying) return;

    const cardElement = document.querySelector(`[data-index="${index}"]`);
    const card = gameState.cards[index];

    // Prevent clicking the same card twice
    if (gameState.flippedCards.some(c => c.index === index)) return;
    if (cardElement.classList.contains('matched')) return;

    // Flip card
    cardElement.classList.add('flipped');
    playSound(card.freq);

    gameState.flippedCards.push({ index, card });

    // Check for match when 2 cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.tries++;
        updateTries();
        checkMatch();
    }
}

function checkMatch() {
    gameState.canFlip = false;

    const [first, second] = gameState.flippedCards;
    const firstElement = document.querySelector(`[data-index="${first.index}"]`);
    const secondElement = document.querySelector(`[data-index="${second.index}"]`);

    if (first.card.freq === second.card.freq) {
        // Match!
        setTimeout(() => {
            firstElement.classList.add('matched');
            secondElement.classList.add('matched');

            gameState.matchedPairs++;
            updatePairs();

            gameState.flippedCards = [];
            gameState.canFlip = true;

            // Check for win
            if (gameState.matchedPairs === sounds.length) {
                setTimeout(winGame, 500);
            }
        }, 500);
    } else {
        // No match
        firstElement.classList.add('wrong');
        secondElement.classList.add('wrong');

        setTimeout(() => {
            firstElement.classList.remove('flipped', 'wrong');
            secondElement.classList.remove('flipped', 'wrong');

            gameState.flippedCards = [];
            gameState.canFlip = true;
        }, 1000);
    }
}

// === UI Updates ===
function updatePairs() {
    elements.pairsDisplay.textContent = `${gameState.matchedPairs}/${sounds.length}`;
}

function updateTries() {
    elements.triesDisplay.textContent = gameState.tries;
}

function winGame() {
    gameState.isPlaying = false;
    elements.finalTries.textContent = gameState.tries;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
