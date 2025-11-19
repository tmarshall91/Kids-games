'use strict';

// === Configuration ===
const CONFIG = {
    colors: ['red', 'blue', 'green', 'yellow'],
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    initialHandSize: 7,
    computerThinkTime: 1000,
    messageDisplayTime: 2000
};

// === State Management ===
let gameState = {
    deck: [],
    playerHand: [],
    computerHand: [],
    currentCard: null,
    isPlaying: false,
    currentTurn: 'player',
    messageTimeout: null,
    isProcessing: false
};

// === DOM References ===
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameArea: document.getElementById('game-area'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    drawBtn: document.getElementById('draw-btn'),
    playerHand: document.getElementById('player-hand'),
    computerHand: document.getElementById('computer-hand'),
    currentCard: document.getElementById('current-card'),
    playerCards: document.getElementById('player-cards'),
    computerCards: document.getElementById('computer-cards'),
    deckCount: document.getElementById('deck-count'),
    messageBox: document.getElementById('message-box'),
    gameResult: document.getElementById('game-result'),
    gameSummary: document.getElementById('game-summary')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    // Restart button
    elements.restartBtn.addEventListener('click', restartGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        restartGame();
    });

    // Draw button
    elements.drawBtn.addEventListener('click', handleDrawCard);
    elements.drawBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleDrawCard();
    });

    // Prevent unwanted scrolling during gameplay
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    gameState = {
        deck: [],
        playerHand: [],
        computerHand: [],
        currentCard: null,
        isPlaying: true,
        currentTurn: 'player',
        messageTimeout: null,
        isProcessing: false
    };

    createDeck();
    shuffleDeck();
    dealInitialCards();

    // Set first card from deck
    gameState.currentCard = gameState.deck.pop();

    updateDisplay();

    elements.welcomeScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';

    showMessage("Your turn! Match the color or number.", 2000);
}

function restartGame() {
    elements.gameOverScreen.style.display = 'none';
    elements.welcomeScreen.style.display = 'block';
}

// === Deck Management ===
function createDeck() {
    gameState.deck = [];

    // Create 2 of each card (similar to Uno)
    for (let i = 0; i < 2; i++) {
        for (let color of CONFIG.colors) {
            for (let number of CONFIG.numbers) {
                gameState.deck.push({
                    color: color,
                    number: number
                });
            }
        }
    }
}

function shuffleDeck() {
    // Fisher-Yates shuffle algorithm
    for (let i = gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
}

function dealInitialCards() {
    // Deal cards to player
    for (let i = 0; i < CONFIG.initialHandSize; i++) {
        if (gameState.deck.length > 0) {
            gameState.playerHand.push(gameState.deck.pop());
        }
    }

    // Deal cards to computer
    for (let i = 0; i < CONFIG.initialHandSize; i++) {
        if (gameState.deck.length > 0) {
            gameState.computerHand.push(gameState.deck.pop());
        }
    }
}

function drawCard(player) {
    if (gameState.deck.length === 0) {
        // Reshuffle discard pile if deck is empty (keep current card)
        if (gameState.currentCard) {
            createDeck();
            shuffleDeck();
            showMessage("Deck reshuffled!", 1500);
        } else {
            return null;
        }
    }

    const card = gameState.deck.pop();
    if (player === 'player') {
        gameState.playerHand.push(card);
    } else {
        gameState.computerHand.push(card);
    }
    return card;
}

// === Card Logic ===
function canPlayCard(card, currentCard) {
    if (!currentCard) return true;
    return card.color === currentCard.color || card.number === currentCard.number;
}

function findPlayableCards(hand, currentCard) {
    return hand.filter(card => canPlayCard(card, currentCard));
}

// === Player Actions ===
function handleCardClick(card, index) {
    if (gameState.isProcessing || !gameState.isPlaying || gameState.currentTurn !== 'player') {
        return;
    }

    if (!canPlayCard(card, gameState.currentCard)) {
        showMessage("Can't play that card! Match color or number.", 2000);
        return;
    }

    // Play the card
    gameState.isProcessing = true;
    gameState.currentCard = card;
    gameState.playerHand.splice(index, 1);

    updateDisplay();

    // Check if player won
    if (gameState.playerHand.length === 0) {
        setTimeout(() => endGame('win'), 500);
        return;
    }

    showMessage(`You played ${card.color} ${card.number}!`, 1500);

    // Switch to computer's turn
    setTimeout(() => {
        gameState.currentTurn = 'computer';
        gameState.isProcessing = false;
        updateDisplay();
        computerTurn();
    }, 1000);
}

function handleDrawCard() {
    if (gameState.isProcessing || !gameState.isPlaying || gameState.currentTurn !== 'player') {
        return;
    }

    gameState.isProcessing = true;
    const drawnCard = drawCard('player');

    if (drawnCard) {
        updateDisplay();

        if (canPlayCard(drawnCard, gameState.currentCard)) {
            showMessage(`Drew ${drawnCard.color} ${drawnCard.number}. You can play it!`, 2000);
            setTimeout(() => {
                gameState.isProcessing = false;
                updateDisplay();
            }, 2000);
        } else {
            showMessage(`Drew ${drawnCard.color} ${drawnCard.number}. Can't play it!`, 2000);
            setTimeout(() => {
                gameState.currentTurn = 'computer';
                gameState.isProcessing = false;
                updateDisplay();
                computerTurn();
            }, 2000);
        }
    } else {
        showMessage("No cards to draw!", 1500);
        setTimeout(() => {
            gameState.isProcessing = false;
            updateDisplay();
        }, 1500);
    }
}

// === Computer AI ===
function computerTurn() {
    if (!gameState.isPlaying || gameState.currentTurn !== 'computer') {
        return;
    }

    gameState.isProcessing = true;
    showMessage("Computer's turn...", 1000);

    setTimeout(() => {
        const playableCards = findPlayableCards(gameState.computerHand, gameState.currentCard);

        if (playableCards.length > 0) {
            // Play a random playable card
            const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
            const cardIndex = gameState.computerHand.indexOf(cardToPlay);

            gameState.currentCard = cardToPlay;
            gameState.computerHand.splice(cardIndex, 1);

            updateDisplay();

            // Check if computer won
            if (gameState.computerHand.length === 0) {
                setTimeout(() => endGame('lose'), 500);
                return;
            }

            showMessage(`Computer played ${cardToPlay.color} ${cardToPlay.number}!`, 2000);

            setTimeout(() => {
                gameState.currentTurn = 'player';
                gameState.isProcessing = false;
                updateDisplay();
                showMessage("Your turn!", 1500);
            }, 2000);
        } else {
            // Computer draws a card
            const drawnCard = drawCard('computer');

            if (drawnCard) {
                updateDisplay();

                if (canPlayCard(drawnCard, gameState.currentCard)) {
                    showMessage(`Computer drew and played ${drawnCard.color} ${drawnCard.number}!`, 2000);

                    // Remove the card we just drew and play it
                    gameState.currentCard = drawnCard;
                    gameState.computerHand.pop();

                    updateDisplay();

                    setTimeout(() => {
                        gameState.currentTurn = 'player';
                        gameState.isProcessing = false;
                        updateDisplay();
                        showMessage("Your turn!", 1500);
                    }, 2000);
                } else {
                    showMessage("Computer drew a card and can't play!", 2000);

                    setTimeout(() => {
                        gameState.currentTurn = 'player';
                        gameState.isProcessing = false;
                        updateDisplay();
                        showMessage("Your turn!", 1500);
                    }, 2000);
                }
            } else {
                showMessage("Computer can't draw or play!", 1500);

                setTimeout(() => {
                    gameState.currentTurn = 'player';
                    gameState.isProcessing = false;
                    updateDisplay();
                }, 1500);
            }
        }
    }, CONFIG.computerThinkTime);
}

// === Display Updates ===
function updateDisplay() {
    updateCardCounts();
    updateHands();
    updateCurrentCard();
    updateDeckCount();
    updateDrawButton();
}

function updateCardCounts() {
    elements.playerCards.textContent = `Your Cards: ${gameState.playerHand.length}`;
    elements.computerCards.textContent = `Computer Cards: ${gameState.computerHand.length}`;
}

function updateHands() {
    // Update player hand
    elements.playerHand.innerHTML = '';
    gameState.playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card, index, true);
        elements.playerHand.appendChild(cardElement);
    });

    // Update computer hand (show card backs)
    elements.computerHand.innerHTML = '';
    gameState.computerHand.forEach(() => {
        const cardElement = createCardBack();
        elements.computerHand.appendChild(cardElement);
    });
}

function createCardElement(card, index, clickable) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.color}`;

    if (clickable && canPlayCard(card, gameState.currentCard) &&
        gameState.currentTurn === 'player' && !gameState.isProcessing) {
        cardDiv.classList.add('playable');
    }

    cardDiv.innerHTML = `<span class="card-number">${card.number}</span>`;

    if (clickable) {
        cardDiv.addEventListener('click', () => handleCardClick(card, index));
        cardDiv.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleCardClick(card, index);
        });
    }

    return cardDiv;
}

function createCardBack() {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card card-back';
    cardDiv.textContent = '🎴';
    return cardDiv;
}

function updateCurrentCard() {
    if (gameState.currentCard) {
        elements.currentCard.className = `card ${gameState.currentCard.color}`;
        elements.currentCard.innerHTML = `<span class="card-number">${gameState.currentCard.number}</span>`;
    }
}

function updateDeckCount() {
    elements.deckCount.textContent = `Deck: ${gameState.deck.length}`;
}

function updateDrawButton() {
    const hasPlayableCards = findPlayableCards(gameState.playerHand, gameState.currentCard).length > 0;

    if (gameState.currentTurn === 'player' && !gameState.isProcessing && !hasPlayableCards) {
        elements.drawBtn.disabled = false;
        elements.drawBtn.style.opacity = '1';
    } else {
        elements.drawBtn.disabled = true;
        elements.drawBtn.style.opacity = '0.5';
    }
}

// === Messages ===
function showMessage(message, duration = 2000) {
    // Clear existing timeout
    if (gameState.messageTimeout) {
        clearTimeout(gameState.messageTimeout);
    }

    elements.messageBox.textContent = message;
    elements.messageBox.style.display = 'block';

    gameState.messageTimeout = setTimeout(() => {
        elements.messageBox.style.display = 'none';
    }, duration);
}

// === Game End ===
function endGame(result) {
    gameState.isPlaying = false;

    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameOverScreen.style.display = 'block';

        if (result === 'win') {
            elements.gameResult.textContent = '🎉 You Win! 🎉';
            elements.gameResult.className = 'win';
            elements.gameSummary.textContent = `You played all your cards! Computer had ${gameState.computerHand.length} cards left.`;
        } else {
            elements.gameResult.textContent = '😔 Computer Wins! 😔';
            elements.gameResult.className = 'lose';
            elements.gameSummary.textContent = `Computer played all their cards! You had ${gameState.playerHand.length} cards left.`;
        }
    }, 500);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
