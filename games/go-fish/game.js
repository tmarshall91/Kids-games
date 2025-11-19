'use strict';

// === Configuration ===
const CONFIG = {
    initialHandSize: 7,
    ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    suits: {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    }
};

// === State Management ===
let gameState = {
    deck: [],
    playerHand: [],
    computerHand: [],
    playerPairs: 0,
    computerPairs: 0,
    isPlaying: false,
    currentTurn: 'player'
};

// === DOM References ===
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameArea: document.getElementById('game-area'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    playerHand: document.getElementById('player-hand'),
    computerHand: document.getElementById('computer-hand'),
    playerPairs: document.getElementById('player-pairs'),
    computerPairs: document.getElementById('computer-pairs'),
    deckCount: document.getElementById('deck-count'),
    messageBox: document.getElementById('message-box'),
    gameResult: document.getElementById('game-result'),
    finalPlayerPairs: document.getElementById('final-player-pairs'),
    finalComputerPairs: document.getElementById('final-computer-pairs')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.restartBtn.addEventListener('click', restartGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        restartGame();
    });
}

// === Game Control ===
function startGame() {
    gameState = {
        deck: [],
        playerHand: [],
        computerHand: [],
        playerPairs: 0,
        computerPairs: 0,
        isPlaying: true,
        currentTurn: 'player'
    };

    createDeck();
    shuffleDeck();
    dealInitialCards();
    checkForPairs('player');
    checkForPairs('computer');
    updateDisplay();

    elements.welcomeScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';

    showMessage("Your turn! Tap a card to ask for its rank.");
}

function restartGame() {
    elements.gameOverScreen.style.display = 'none';
    elements.welcomeScreen.style.display = 'block';
}

// === Deck Management ===
function createDeck() {
    gameState.deck = [];
    for (let suit in CONFIG.suits) {
        for (let rank of CONFIG.ranks) {
            gameState.deck.push({
                rank: rank,
                suit: suit,
                suitSymbol: CONFIG.suits[suit]
            });
        }
    }
}

function shuffleDeck() {
    for (let i = gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
}

function dealInitialCards() {
    for (let i = 0; i < CONFIG.initialHandSize; i++) {
        gameState.playerHand.push(gameState.deck.pop());
        gameState.computerHand.push(gameState.deck.pop());
    }
}

function drawCard(player) {
    if (gameState.deck.length === 0) {
        return null;
    }
    const card = gameState.deck.pop();
    if (player === 'player') {
        gameState.playerHand.push(card);
    } else {
        gameState.computerHand.push(card);
    }
    return card;
}

// === Game Logic ===
function handlePlayerCardClick(rank) {
    if (!gameState.isPlaying || gameState.currentTurn !== 'player') {
        return;
    }

    // Check if computer has this rank
    const matchingCards = gameState.computerHand.filter(card => card.rank === rank);

    if (matchingCards.length > 0) {
        // Computer has the rank - transfer cards to player
        showMessage(`Yes! Computer had ${matchingCards.length} ${rank}(s)!`);
        matchingCards.forEach(card => {
            const index = gameState.computerHand.indexOf(card);
            gameState.computerHand.splice(index, 1);
            gameState.playerHand.push(card);
        });

        checkForPairs('player');
        updateDisplay();

        // Player gets another turn
        if (gameState.playerHand.length === 0 && gameState.deck.length > 0) {
            drawCard('player');
        }

        checkGameOver();
    } else {
        // Go Fish!
        showMessage("Go Fish! 🐟");
        setTimeout(() => {
            const drawnCard = drawCard('player');
            if (drawnCard) {
                showMessage(`You drew a ${drawnCard.rank}${drawnCard.suitSymbol}`);
            } else {
                showMessage("No more cards in deck!");
            }
            checkForPairs('player');
            updateDisplay();

            // Switch to computer's turn
            gameState.currentTurn = 'computer';
            setTimeout(computerTurn, 1500);
        }, 1000);
    }

    updateDisplay();
}

function computerTurn() {
    if (!gameState.isPlaying || gameState.computerHand.length === 0) {
        checkGameOver();
        return;
    }

    // Computer picks a random rank from its hand
    const randomCard = gameState.computerHand[Math.floor(Math.random() * gameState.computerHand.length)];
    const askRank = randomCard.rank;

    showMessage(`Computer asks: Do you have any ${askRank}s?`);

    setTimeout(() => {
        const matchingCards = gameState.playerHand.filter(card => card.rank === askRank);

        if (matchingCards.length > 0) {
            showMessage(`You had ${matchingCards.length} ${askRank}(s)!`);
            matchingCards.forEach(card => {
                const index = gameState.playerHand.indexOf(card);
                gameState.playerHand.splice(index, 1);
                gameState.computerHand.push(card);
            });

            checkForPairs('computer');
            updateDisplay();

            // Computer gets another turn
            if (gameState.computerHand.length === 0 && gameState.deck.length > 0) {
                drawCard('computer');
            }

            setTimeout(computerTurn, 1500);
        } else {
            showMessage("You said: Go Fish! 🐟");
            setTimeout(() => {
                const drawnCard = drawCard('computer');
                if (drawnCard) {
                    showMessage(`Computer drew a card`);
                } else {
                    showMessage("No more cards in deck!");
                }
                checkForPairs('computer');
                updateDisplay();

                // Switch back to player's turn
                gameState.currentTurn = 'player';
                showMessage("Your turn! Tap a card to ask.");
            }, 1000);
        }

        checkGameOver();
    }, 1500);
}

function checkForPairs(player) {
    const hand = player === 'player' ? gameState.playerHand : gameState.computerHand;
    const rankCounts = {};

    // Count cards of each rank
    hand.forEach(card => {
        rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    });

    // Remove pairs (4 of a kind)
    for (let rank in rankCounts) {
        if (rankCounts[rank] === 4) {
            // Remove all 4 cards
            const cardsToRemove = hand.filter(card => card.rank === rank);
            cardsToRemove.forEach(card => {
                const index = hand.indexOf(card);
                hand.splice(index, 1);
            });

            // Increment pair count
            if (player === 'player') {
                gameState.playerPairs++;
            } else {
                gameState.computerPairs++;
            }
        }
    }
}

function checkGameOver() {
    const bothHandsEmpty = gameState.playerHand.length === 0 && gameState.computerHand.length === 0;
    const deckEmpty = gameState.deck.length === 0;

    if (bothHandsEmpty || (deckEmpty && (gameState.playerHand.length === 0 || gameState.computerHand.length === 0))) {
        endGame();
    }
}

function endGame() {
    gameState.isPlaying = false;

    elements.finalPlayerPairs.textContent = gameState.playerPairs;
    elements.finalComputerPairs.textContent = gameState.computerPairs;

    if (gameState.playerPairs > gameState.computerPairs) {
        elements.gameResult.textContent = "🎉 You Win! 🎉";
    } else if (gameState.playerPairs < gameState.computerPairs) {
        elements.gameResult.textContent = "Computer Wins!";
    } else {
        elements.gameResult.textContent = "It's a Tie!";
    }

    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameOverScreen.style.display = 'block';
    }, 1000);
}

// === Display Updates ===
function updateDisplay() {
    renderPlayerHand();
    renderComputerHand();
    updateStats();
}

function renderPlayerHand() {
    elements.playerHand.innerHTML = '';

    gameState.playerHand.forEach(card => {
        const cardElement = createCardElement(card, true);
        cardElement.addEventListener('click', () => handlePlayerCardClick(card.rank));
        cardElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            handlePlayerCardClick(card.rank);
        });
        elements.playerHand.appendChild(cardElement);
    });
}

function renderComputerHand() {
    elements.computerHand.innerHTML = '';

    gameState.computerHand.forEach(() => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card card-back';
        cardElement.textContent = '🎴';
        elements.computerHand.appendChild(cardElement);
    });
}

function createCardElement(card, isPlayerCard = false) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.suit}`;
    if (isPlayerCard) {
        cardElement.classList.add('player-card');
    }

    const rankSpan = document.createElement('div');
    rankSpan.className = 'rank';
    rankSpan.textContent = card.rank;

    const suitSpan = document.createElement('div');
    suitSpan.className = 'suit';
    suitSpan.textContent = card.suitSymbol;

    cardElement.appendChild(rankSpan);
    cardElement.appendChild(suitSpan);

    return cardElement;
}

function updateStats() {
    elements.playerPairs.textContent = `Your Pairs: ${gameState.playerPairs}`;
    elements.computerPairs.textContent = `Computer Pairs: ${gameState.computerPairs}`;
    elements.deckCount.textContent = `Cards: ${gameState.deck.length}`;
}

function showMessage(message) {
    elements.messageBox.textContent = message;
    elements.messageBox.classList.add('show');

    setTimeout(() => {
        elements.messageBox.classList.remove('show');
    }, 2000);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
