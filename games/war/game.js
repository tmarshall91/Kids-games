'use strict';

// === Configuration ===
const CONFIG = {
    ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    suits: {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    },
    rankValues: {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    },
    warCards: 3 // Number of cards to place down during war
};

// === State Management ===
let gameState = {
    playerDeck: [],
    computerDeck: [],
    isPlaying: false,
    isBattling: false,
    warPile: [] // Cards currently in play
};

// === DOM References ===
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameArea: document.getElementById('game-area'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    battleBtn: document.getElementById('battle-btn'),
    playerPlayArea: document.getElementById('player-play-area'),
    computerPlayArea: document.getElementById('computer-play-area'),
    playerCards: document.getElementById('player-cards'),
    computerCards: document.getElementById('computer-cards'),
    battleResult: document.getElementById('battle-result'),
    messageBox: document.getElementById('message-box'),
    gameResult: document.getElementById('game-result'),
    finalPlayerCards: document.getElementById('final-player-cards'),
    finalComputerCards: document.getElementById('final-computer-cards')
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

    elements.battleBtn.addEventListener('click', playBattle);
    elements.battleBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        playBattle();
    });
}

// === Game Control ===
function startGame() {
    gameState = {
        playerDeck: [],
        computerDeck: [],
        isPlaying: true,
        isBattling: false,
        warPile: []
    };

    createAndDealDeck();
    updateDisplay();

    elements.welcomeScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';
    elements.battleResult.textContent = 'Ready for battle!';
}

function restartGame() {
    elements.gameOverScreen.style.display = 'none';
    elements.welcomeScreen.style.display = 'block';
    elements.playerPlayArea.innerHTML = '';
    elements.computerPlayArea.innerHTML = '';
    elements.battleResult.textContent = '';
}

// === Deck Management ===
function createAndDealDeck() {
    const deck = [];

    // Create full deck
    for (let suit in CONFIG.suits) {
        for (let rank of CONFIG.ranks) {
            deck.push({
                rank: rank,
                suit: suit,
                suitSymbol: CONFIG.suits[suit],
                value: CONFIG.rankValues[rank]
            });
        }
    }

    // Shuffle deck
    shuffleDeck(deck);

    // Deal cards - alternate between players
    for (let i = 0; i < deck.length; i++) {
        if (i % 2 === 0) {
            gameState.playerDeck.push(deck[i]);
        } else {
            gameState.computerDeck.push(deck[i]);
        }
    }
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// === Battle Logic ===
function playBattle() {
    if (!gameState.isPlaying || gameState.isBattling) {
        return;
    }

    // Check if either player is out of cards
    if (gameState.playerDeck.length === 0 || gameState.computerDeck.length === 0) {
        endGame();
        return;
    }

    gameState.isBattling = true;
    elements.battleBtn.disabled = true;
    elements.battleResult.textContent = '';

    // Clear play areas
    elements.playerPlayArea.innerHTML = '';
    elements.computerPlayArea.innerHTML = '';

    // Draw one card from each deck
    const playerCard = gameState.playerDeck.shift();
    const computerCard = gameState.computerDeck.shift();

    // Add to war pile
    gameState.warPile.push(playerCard, computerCard);

    // Display cards with animation
    setTimeout(() => {
        displayCard(playerCard, elements.playerPlayArea, true);
        displayCard(computerCard, elements.computerPlayArea, true);

        // Compare cards after animation
        setTimeout(() => {
            compareCards(playerCard, computerCard);
        }, 600);
    }, 300);
}

function compareCards(playerCard, computerCard) {
    const playerValue = playerCard.value;
    const computerValue = computerCard.value;

    if (playerValue > computerValue) {
        // Player wins
        elements.battleResult.textContent = 'You Win This Battle!';
        highlightWinner(elements.playerPlayArea);

        setTimeout(() => {
            showMessage(`Your ${playerCard.rank} beats ${computerCard.rank}!`);
            collectCards('player');
        }, 1000);
    } else if (computerValue > playerValue) {
        // Computer wins
        elements.battleResult.textContent = 'Computer Wins This Battle!';
        highlightWinner(elements.computerPlayArea);

        setTimeout(() => {
            showMessage(`Computer's ${computerCard.rank} beats your ${playerCard.rank}!`);
            collectCards('computer');
        }, 1000);
    } else {
        // War!
        elements.battleResult.textContent = 'WAR!!!';
        showMessage('IT\'S WAR!!!', 2000);

        setTimeout(() => {
            handleWar();
        }, 2000);
    }
}

function handleWar() {
    // Check if both players have enough cards for war
    const cardsNeeded = CONFIG.warCards + 1; // 3 face down + 1 face up

    if (gameState.playerDeck.length < cardsNeeded || gameState.computerDeck.length < cardsNeeded) {
        // Not enough cards - player with more cards wins
        if (gameState.playerDeck.length > gameState.computerDeck.length) {
            showMessage('Not enough cards for war! You win!');
            collectCards('player');
        } else if (gameState.computerDeck.length > gameState.playerDeck.length) {
            showMessage('Not enough cards for war! Computer wins!');
            collectCards('computer');
        } else {
            endGame();
        }
        return;
    }

    // Place face-down cards
    for (let i = 0; i < CONFIG.warCards; i++) {
        const playerWarCard = gameState.playerDeck.shift();
        const computerWarCard = gameState.computerDeck.shift();
        gameState.warPile.push(playerWarCard, computerWarCard);

        // Display face-down cards
        displayCardBack(elements.playerPlayArea);
        displayCardBack(elements.computerPlayArea);
    }

    // Draw final battle cards
    setTimeout(() => {
        const playerCard = gameState.playerDeck.shift();
        const computerCard = gameState.computerDeck.shift();
        gameState.warPile.push(playerCard, computerCard);

        displayCard(playerCard, elements.playerPlayArea, true);
        displayCard(computerCard, elements.computerPlayArea, true);

        setTimeout(() => {
            compareCards(playerCard, computerCard);
        }, 600);
    }, 800);
}

function collectCards(winner) {
    // Shuffle war pile before adding to winner's deck
    shuffleDeck(gameState.warPile);

    if (winner === 'player') {
        gameState.playerDeck.push(...gameState.warPile);
    } else {
        gameState.computerDeck.push(...gameState.warPile);
    }

    gameState.warPile = [];

    setTimeout(() => {
        elements.playerPlayArea.innerHTML = '';
        elements.computerPlayArea.innerHTML = '';
        elements.battleResult.textContent = 'Ready for next battle!';

        updateDisplay();
        gameState.isBattling = false;
        elements.battleBtn.disabled = false;

        // Check for game over
        if (gameState.playerDeck.length === 0 || gameState.computerDeck.length === 0) {
            setTimeout(endGame, 1000);
        }
    }, 1500);
}

// === Display Functions ===
function displayCard(card, container, animated = false) {
    const cardElement = createCardElement(card);
    if (animated) {
        cardElement.classList.add('played');
    }
    container.appendChild(cardElement);
}

function displayCardBack(container) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card card-back';
    cardElement.textContent = 'WAR';
    container.appendChild(cardElement);
}

function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${card.suit}`;

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

function highlightWinner(container) {
    const cards = container.querySelectorAll('.card');
    cards.forEach(card => {
        if (!card.classList.contains('card-back')) {
            card.classList.add('winner');
        }
    });
}

function updateDisplay() {
    elements.playerCards.textContent = `Your Cards: ${gameState.playerDeck.length}`;
    elements.computerCards.textContent = `Computer Cards: ${gameState.computerDeck.length}`;
}

function showMessage(message, duration = 2000) {
    elements.messageBox.textContent = message;
    elements.messageBox.classList.add('show');

    setTimeout(() => {
        elements.messageBox.classList.remove('show');
    }, duration);
}

// === Game End ===
function endGame() {
    gameState.isPlaying = false;
    elements.battleBtn.disabled = true;

    elements.finalPlayerCards.textContent = gameState.playerDeck.length;
    elements.finalComputerCards.textContent = gameState.computerDeck.length;

    if (gameState.playerDeck.length > gameState.computerDeck.length) {
        elements.gameResult.textContent = 'YOU WIN THE WAR!';
    } else if (gameState.computerDeck.length > gameState.playerDeck.length) {
        elements.gameResult.textContent = 'COMPUTER WINS THE WAR!';
    } else {
        elements.gameResult.textContent = 'IT\'S A TIE!';
    }

    setTimeout(() => {
        elements.gameArea.style.display = 'none';
        elements.gameOverScreen.style.display = 'block';
    }, 1500);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
