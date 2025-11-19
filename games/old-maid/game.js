'use strict';

// === Configuration ===
const CONFIG = {
    ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    suits: {
        hearts: { symbol: '♥', color: 'red' },
        diamonds: { symbol: '♦', color: 'red' },
        clubs: { symbol: '♣', color: 'black' },
        spades: { symbol: '♠', color: 'black' }
    }
};

// === State Management ===
let gameState = {
    playerHand: [],
    computerHand: [],
    isPlaying: false,
    currentTurn: 'player',
    waitingForDraw: false
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
    playerCards: document.getElementById('player-cards'),
    computerCards: document.getElementById('computer-cards'),
    messageBox: document.getElementById('message-box'),
    gameResult: document.getElementById('game-result'),
    resultMessage: document.getElementById('result-message'),
    turnText: document.getElementById('turn-text'),
    drawBtn: document.getElementById('draw-btn')
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
        playerHand: [],
        computerHand: [],
        isPlaying: true,
        currentTurn: 'player',
        waitingForDraw: false
    };

    createAndDealDeck();
    removePairs('player');
    removePairs('computer');
    updateDisplay();

    elements.welcomeScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';

    showMessage("Pick a card from the computer's hand!");
}

function restartGame() {
    elements.gameOverScreen.style.display = 'none';
    elements.welcomeScreen.style.display = 'block';
}

// === Deck Management ===
function createAndDealDeck() {
    const deck = [];

    // Create regular pairs
    for (let suit in CONFIG.suits) {
        for (let rank of CONFIG.ranks) {
            deck.push({
                rank: rank,
                suit: suit,
                suitSymbol: CONFIG.suits[suit].symbol,
                color: CONFIG.suits[suit].color,
                isOldMaid: false
            });
        }
    }

    // Remove one Queen and mark another as Old Maid
    const queenIndex = deck.findIndex(card => card.rank === 'Q');
    deck.splice(queenIndex, 1);

    const oldMaidIndex = deck.findIndex(card => card.rank === 'Q');
    deck[oldMaidIndex].isOldMaid = true;

    // Shuffle
    shuffleDeck(deck);

    // Deal alternately
    deck.forEach((card, index) => {
        if (index % 2 === 0) {
            gameState.playerHand.push(card);
        } else {
            gameState.computerHand.push(card);
        }
    });
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// === Game Logic ===
function removePairs(player) {
    const hand = player === 'player' ? gameState.playerHand : gameState.computerHand;
    const pairsToRemove = [];

    // Find pairs (same rank and color, but different suits)
    for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
            if (hand[i].rank === hand[j].rank &&
                hand[i].color === hand[j].color &&
                hand[i].suit !== hand[j].suit &&
                !hand[i].isOldMaid && !hand[j].isOldMaid) {
                pairsToRemove.push(i, j);
                break;
            }
        }
    }

    // Remove pairs (sort in reverse to maintain indices)
    const uniqueIndices = [...new Set(pairsToRemove)].sort((a, b) => b - a);
    uniqueIndices.forEach(index => {
        hand.splice(index, 1);
    });

    return uniqueIndices.length > 0;
}

function handleComputerCardClick(cardIndex) {
    if (!gameState.isPlaying || gameState.currentTurn !== 'player') {
        return;
    }

    // Player draws card from computer
    const drawnCard = gameState.computerHand.splice(cardIndex, 1)[0];
    gameState.playerHand.push(drawnCard);

    if (drawnCard.isOldMaid) {
        showMessage("Oh no! You drew the Old Maid! 👵");
    } else {
        showMessage(`You drew a ${drawnCard.rank}${drawnCard.suitSymbol}`);
    }

    setTimeout(() => {
        const hadPairs = removePairs('player');
        if (hadPairs) {
            showMessage("Pairs removed!");
        }
        updateDisplay();

        checkGameOver();

        if (gameState.isPlaying) {
            // Computer's turn
            gameState.currentTurn = 'computer';
            elements.turnText.textContent = "Computer is thinking...";
            setTimeout(computerTurn, 2000);
        }
    }, 1500);

    updateDisplay();
}

function computerTurn() {
    if (!gameState.isPlaying || gameState.playerHand.length === 0) {
        checkGameOver();
        return;
    }

    // Computer draws random card from player
    const randomIndex = Math.floor(Math.random() * gameState.playerHand.length);
    const drawnCard = gameState.playerHand.splice(randomIndex, 1)[0];
    gameState.computerHand.push(drawnCard);

    if (drawnCard.isOldMaid) {
        showMessage("Computer drew the Old Maid! 👵");
    } else {
        showMessage("Computer drew a card from you");
    }

    setTimeout(() => {
        const hadPairs = removePairs('computer');
        if (hadPairs) {
            showMessage("Computer discarded pairs!");
        }
        updateDisplay();

        checkGameOver();

        if (gameState.isPlaying) {
            // Back to player's turn
            gameState.currentTurn = 'player';
            elements.turnText.textContent = "Your turn! Pick a card from computer's hand";
            showMessage("Your turn!");
        }
    }, 1500);

    updateDisplay();
}

function checkGameOver() {
    if (gameState.playerHand.length === 0 && gameState.computerHand.length === 1) {
        // Computer has Old Maid
        endGame('player');
    } else if (gameState.computerHand.length === 0 && gameState.playerHand.length === 1) {
        // Player has Old Maid
        endGame('computer');
    } else if (gameState.playerHand.length === 0 || gameState.computerHand.length === 0) {
        // Check who has the Old Maid
        const playerHasOldMaid = gameState.playerHand.some(card => card.isOldMaid);
        const computerHasOldMaid = gameState.computerHand.some(card => card.isOldMaid);

        if (playerHasOldMaid) {
            endGame('computer');
        } else if (computerHasOldMaid) {
            endGame('player');
        }
    }
}

function endGame(winner) {
    gameState.isPlaying = false;

    if (winner === 'player') {
        elements.gameResult.textContent = "🎉 You Win! 🎉";
        elements.resultMessage.textContent = "The computer got stuck with the Old Maid!";
    } else {
        elements.gameResult.textContent = "Computer Wins!";
        elements.resultMessage.textContent = "You got stuck with the Old Maid! 👵";
    }

    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameOverScreen.style.display = 'block';
    }, 1500);
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
        const cardElement = createCardElement(card, false);
        elements.playerHand.appendChild(cardElement);
    });
}

function renderComputerHand() {
    elements.computerHand.innerHTML = '';

    gameState.computerHand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card card-back clickable';
        cardElement.textContent = '🎴';

        if (gameState.currentTurn === 'player') {
            cardElement.addEventListener('click', () => handleComputerCardClick(index));
            cardElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleComputerCardClick(index);
            });
        }

        elements.computerHand.appendChild(cardElement);
    });
}

function createCardElement(card, isClickable = false) {
    const cardElement = document.createElement('div');

    if (card.isOldMaid) {
        cardElement.className = 'card old-maid';
        cardElement.textContent = '👵';
    } else {
        cardElement.className = `card ${card.color}`;

        const rankSpan = document.createElement('div');
        rankSpan.className = 'rank';
        rankSpan.textContent = card.rank;

        const suitSpan = document.createElement('div');
        suitSpan.className = 'suit';
        suitSpan.textContent = card.suitSymbol;

        cardElement.appendChild(rankSpan);
        cardElement.appendChild(suitSpan);
    }

    if (isClickable) {
        cardElement.classList.add('clickable');
    }

    return cardElement;
}

function updateStats() {
    elements.playerCards.textContent = `Your Cards: ${gameState.playerHand.length}`;
    elements.computerCards.textContent = `Computer Cards: ${gameState.computerHand.length}`;
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
