'use strict';

const CONFIG = {
    sounds: [
        { id: 1, emoji: '🎸', frequency: 330, name: 'Guitar' },
        { id: 2, emoji: '🎹', frequency: 440, name: 'Piano' },
        { id: 3, emoji: '🥁', frequency: 200, name: 'Drum' },
        { id: 4, emoji: '🎺', frequency: 550, name: 'Trumpet' },
        { id: 5, emoji: '🎻', frequency: 660, name: 'Violin' },
        { id: 6, emoji: '🎷', frequency: 370, name: 'Saxophone' }
    ],
    matchDelay: 1000,
    wrongDelay: 800
};

let gameState = {
    score: 0,
    matches: 0,
    cards: [],
    flippedCards: [],
    isProcessing: false,
    startTime: 0,
    audioContext: null
};

const elements = {
    gameMessage: document.getElementById('gameMessage'),
    gameBoard: document.getElementById('gameBoard'),
    soundCards: document.getElementById('soundCards'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    scoreDisplay: document.getElementById('score'),
    matchesDisplay: document.getElementById('matches'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    finalTime: document.getElementById('finalTime'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

function initGame() {
    setupAudioContext();
    setupEventListeners();
}

function setupAudioContext() {
    const createAudioContext = () => {
        if (!gameState.audioContext) {
            gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };
    document.addEventListener('touchstart', createAudioContext, { once: true });
    document.addEventListener('click', createAudioContext, { once: true });
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });
}

function startGame() {
    resetGame();
    createCards();
    gameState.startTime = Date.now();

    elements.gameMessage.style.display = 'none';
    elements.gameBoard.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
}

function resetGame() {
    gameState = {
        score: 0,
        matches: 0,
        cards: [],
        flippedCards: [],
        isProcessing: false,
        startTime: 0,
        audioContext: gameState.audioContext
    };

    updateDisplay();
    elements.soundCards.innerHTML = '';
}

function createCards() {
    const cards = [...CONFIG.sounds, ...CONFIG.sounds]
        .map((sound, index) => ({
            ...sound,
            cardId: index,
            matched: false
        }))
        .sort(() => Math.random() - 0.5);

    gameState.cards = cards;

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'sound-card';
        cardElement.dataset.cardId = card.cardId;
        cardElement.dataset.soundId = card.id;
        cardElement.textContent = '🔊';

        cardElement.addEventListener('click', () => handleCardClick(card.cardId));
        cardElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCardClick(card.cardId);
        });

        elements.soundCards.appendChild(cardElement);
    });
}

function handleCardClick(cardId) {
    if (gameState.isProcessing) return;

    const card = gameState.cards.find(c => c.cardId === cardId);
    if (!card || card.matched) return;

    if (gameState.flippedCards.find(c => c.cardId === cardId)) return;

    flipCard(cardId);
    playSound(card.frequency);

    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        gameState.isProcessing = true;
        checkMatch();
    }
}

function flipCard(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    const card = gameState.cards.find(c => c.cardId === cardId);

    cardElement.classList.add('flipped');
    cardElement.textContent = card.emoji;
}

function checkMatch() {
    const [card1, card2] = gameState.flippedCards;

    if (card1.id === card2.id) {
        matchFound();
    } else {
        noMatch();
    }
}

function matchFound() {
    const [card1, card2] = gameState.flippedCards;

    setTimeout(() => {
        const cardElement1 = document.querySelector(`[data-card-id="${card1.cardId}"]`);
        const cardElement2 = document.querySelector(`[data-card-id="${card2.cardId}"]`);

        cardElement1.classList.add('matched');
        cardElement2.classList.add('matched');

        card1.matched = true;
        card2.matched = true;

        gameState.matches++;
        gameState.score += 100;

        playSuccessSound();
        updateDisplay();

        gameState.flippedCards = [];
        gameState.isProcessing = false;

        if (gameState.matches === CONFIG.sounds.length) {
            gameWon();
        }
    }, CONFIG.matchDelay);
}

function noMatch() {
    const [card1, card2] = gameState.flippedCards;

    setTimeout(() => {
        const cardElement1 = document.querySelector(`[data-card-id="${card1.cardId}"]`);
        const cardElement2 = document.querySelector(`[data-card-id="${card2.cardId}"]`);

        cardElement1.classList.add('wrong');
        cardElement2.classList.add('wrong');

        playErrorSound();

        setTimeout(() => {
            cardElement1.classList.remove('flipped', 'wrong');
            cardElement2.classList.remove('flipped', 'wrong');
            cardElement1.textContent = '🔊';
            cardElement2.textContent = '🔊';

            gameState.flippedCards = [];
            gameState.isProcessing = false;
        }, CONFIG.wrongDelay);
    }, CONFIG.matchDelay);
}

function playSound(frequency) {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.3);
}

function playSuccessSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    [523.25, 659.25, 783.99].forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, currentTime + i * 0.1);

        gainNode.gain.setValueAtTime(0.2, currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + i * 0.1 + 0.2);

        oscillator.start(currentTime + i * 0.1);
        oscillator.stop(currentTime + i * 0.1 + 0.2);
    });
}

function playErrorSound() {
    if (!gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.3);
}

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.matchesDisplay.textContent = `${gameState.matches}/${CONFIG.sounds.length}`;
}

function gameWon() {
    const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);

    setTimeout(() => {
        elements.finalScore.textContent = gameState.score;
        elements.finalTime.textContent = timeElapsed;
        elements.gameOverOverlay.style.display = 'flex';
    }, 500);
}

document.addEventListener('DOMContentLoaded', initGame);
