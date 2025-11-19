'use strict';

// === Configuration ===
const SUITS = {
    hearts: { symbol: '❤️', color: 'red', name: 'hearts' },
    diamonds: { symbol: '💎', color: 'red', name: 'diamonds' },
    clubs: { symbol: '♣️', color: 'black', name: 'clubs' },
    spades: { symbol: '♠️', color: 'black', name: 'spades' }
};

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// === State Management ===
let gameState = {
    stock: [],
    waste: [],
    foundation: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    selectedCard: null,
    selectedPile: null,
    selectedIndex: null,
    moves: 0,
    startTime: null,
    timerInterval: null
};

// === DOM References ===
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameArea: document.getElementById('game-area'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    hintBtn: document.getElementById('hint-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    stock: document.getElementById('stock'),
    waste: document.getElementById('waste'),
    movesDisplay: document.getElementById('moves'),
    timerDisplay: document.getElementById('timer'),
    messageBox: document.getElementById('message-box')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', startNewGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startNewGame();
    });

    // Restart button
    elements.restartBtn.addEventListener('click', startNewGame);
    elements.restartBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startNewGame();
    });

    // Play again button
    elements.playAgainBtn.addEventListener('click', startNewGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startNewGame();
    });

    // Hint button
    elements.hintBtn.addEventListener('click', showHint);
    elements.hintBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        showHint();
    });

    // Stock pile
    elements.stock.addEventListener('click', drawCard);
    elements.stock.addEventListener('touchend', (e) => {
        e.preventDefault();
        drawCard();
    });

    // Prevent default touch behavior on game area
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startNewGame() {
    // Reset state
    gameState = {
        stock: [],
        waste: [],
        foundation: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        selectedCard: null,
        selectedPile: null,
        selectedIndex: null,
        moves: 0,
        startTime: Date.now(),
        timerInterval: null
    };

    // Create and shuffle deck
    const deck = createDeck();
    shuffleDeck(deck);

    // Deal cards to tableau
    dealTableau(deck);

    // Remaining cards go to stock
    gameState.stock = deck;

    // Start timer
    startTimer();

    // Update display
    updateDisplay();

    // Show game area
    elements.welcomeScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';
    elements.gameOverScreen.style.display = 'none';
}

function createDeck() {
    const deck = [];
    for (let suit in SUITS) {
        for (let i = 0; i < RANKS.length; i++) {
            deck.push({
                rank: RANKS[i],
                rankValue: i + 1,
                suit: suit,
                suitSymbol: SUITS[suit].symbol,
                color: SUITS[suit].color,
                faceUp: false
            });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealTableau(deck) {
    // Deal cards to tableau piles
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            // Last card in each pile is face up
            if (j === i) {
                card.faceUp = true;
            }
            gameState.tableau[i].push(card);
        }
    }
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// === Card Drawing ===
function drawCard() {
    if (gameState.stock.length > 0) {
        const card = gameState.stock.pop();
        card.faceUp = true;
        gameState.waste.push(card);
        gameState.moves++;
        updateDisplay();
    } else if (gameState.waste.length > 0) {
        // Reset stock from waste
        while (gameState.waste.length > 0) {
            const card = gameState.waste.pop();
            card.faceUp = false;
            gameState.stock.push(card);
        }
        gameState.moves++;
        updateDisplay();
    }
}

// === Card Movement ===
function selectCard(pile, index) {
    // If clicking same card, deselect
    if (gameState.selectedPile === pile && gameState.selectedIndex === index) {
        deselectCard();
        return;
    }

    // If a card is already selected, try to move it
    if (gameState.selectedCard !== null) {
        attemptMove(pile, index);
        return;
    }

    // Select the card
    const card = getCardFromPile(pile, index);
    if (!card || !card.faceUp) {
        return;
    }

    gameState.selectedCard = card;
    gameState.selectedPile = pile;
    gameState.selectedIndex = index;
    updateDisplay();
}

function deselectCard() {
    gameState.selectedCard = null;
    gameState.selectedPile = null;
    gameState.selectedIndex = null;
    updateDisplay();
}

function getCardFromPile(pile, index) {
    if (pile.startsWith('tableau-')) {
        const pileNum = parseInt(pile.split('-')[1]);
        return gameState.tableau[pileNum][index];
    } else if (pile === 'waste') {
        return gameState.waste[gameState.waste.length - 1];
    } else if (pile.startsWith('foundation-')) {
        const pileNum = parseInt(pile.split('-')[1]);
        return gameState.foundation[pileNum][index];
    }
    return null;
}

function attemptMove(targetPile, targetIndex) {
    const sourcePile = gameState.selectedPile;
    const sourceIndex = gameState.selectedIndex;

    if (targetPile.startsWith('foundation-')) {
        const foundationNum = parseInt(targetPile.split('-')[1]);
        if (canMoveToFoundation(gameState.selectedCard, foundationNum)) {
            moveToFoundation(foundationNum);
        } else {
            showMessage("Can't move there!");
            deselectCard();
        }
    } else if (targetPile.startsWith('tableau-')) {
        const tableauNum = parseInt(targetPile.split('-')[1]);
        if (canMoveToTableau(gameState.selectedCard, tableauNum, sourceIndex)) {
            moveToTableau(tableauNum);
        } else {
            showMessage("Can't move there!");
            deselectCard();
        }
    } else {
        deselectCard();
    }
}

// === Move Validation ===
function canMoveToFoundation(card, foundationNum) {
    const foundation = gameState.foundation[foundationNum];

    // Check if this foundation is for this suit
    const foundationSuit = ['hearts', 'diamonds', 'clubs', 'spades'][foundationNum];
    if (card.suit !== foundationSuit) {
        return false;
    }

    // Foundation must build up from Ace
    if (foundation.length === 0) {
        return card.rank === 'A';
    }

    const topCard = foundation[foundation.length - 1];
    return card.rankValue === topCard.rankValue + 1;
}

function canMoveToTableau(card, tableauNum, sourceIndex) {
    const tableau = gameState.tableau[tableauNum];

    // Empty tableau: any card can be placed (simplified rule for kids)
    if (tableau.length === 0) {
        return true;
    }

    const topCard = tableau[tableau.length - 1];

    // Must be face up
    if (!topCard.faceUp) {
        return false;
    }

    // Must be descending rank and alternating color
    return card.rankValue === topCard.rankValue - 1 && card.color !== topCard.color;
}

// === Move Execution ===
function moveToFoundation(foundationNum) {
    const sourcePile = gameState.selectedPile;
    const card = gameState.selectedCard;

    // Remove from source
    if (sourcePile === 'waste') {
        gameState.waste.pop();
    } else if (sourcePile.startsWith('tableau-')) {
        const tableauNum = parseInt(sourcePile.split('-')[1]);
        gameState.tableau[tableauNum].pop();

        // Flip top card if there is one
        if (gameState.tableau[tableauNum].length > 0) {
            gameState.tableau[tableauNum][gameState.tableau[tableauNum].length - 1].faceUp = true;
        }
    }

    // Add to foundation
    gameState.foundation[foundationNum].push(card);
    gameState.moves++;

    deselectCard();
    updateDisplay();

    // Check for win
    if (checkWin()) {
        setTimeout(endGame, 500);
    } else {
        showMessage("Great move! 🎉");
    }
}

function moveToTableau(tableauNum) {
    const sourcePile = gameState.selectedPile;
    const sourceIndex = gameState.selectedIndex;
    const cardsToMove = [];

    // Get cards to move
    if (sourcePile === 'waste') {
        cardsToMove.push(gameState.waste.pop());
    } else if (sourcePile.startsWith('tableau-')) {
        const sourceTableauNum = parseInt(sourcePile.split('-')[1]);
        const sourceTableau = gameState.tableau[sourceTableauNum];

        // Move selected card and all cards below it
        while (sourceTableau.length > sourceIndex) {
            cardsToMove.push(sourceTableau.pop());
        }
        cardsToMove.reverse();

        // Flip top card if there is one
        if (sourceTableau.length > 0) {
            sourceTableau[sourceTableau.length - 1].faceUp = true;
        }
    } else if (sourcePile.startsWith('foundation-')) {
        const foundationNum = parseInt(sourcePile.split('-')[1]);
        cardsToMove.push(gameState.foundation[foundationNum].pop());
    }

    // Add to target tableau
    gameState.tableau[tableauNum].push(...cardsToMove);
    gameState.moves++;

    deselectCard();
    updateDisplay();
    showMessage("Nice! ✨");
}

// === Rendering ===
function updateDisplay() {
    renderStock();
    renderWaste();
    renderFoundation();
    renderTableau();
    updateStats();
}

function renderStock() {
    const stockEl = elements.stock;
    stockEl.innerHTML = '';

    if (gameState.stock.length > 0) {
        const cardEl = createCardElement({ faceUp: false, rank: '🎴' }, 'stock', 0);
        stockEl.appendChild(cardEl);
    } else if (gameState.waste.length > 0) {
        // Show reset indicator
        const placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder';
        placeholder.style.cursor = 'pointer';
        placeholder.textContent = '🔄';
        stockEl.appendChild(placeholder);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder';
        placeholder.textContent = '🎴';
        stockEl.appendChild(placeholder);
    }
}

function renderWaste() {
    const wasteEl = elements.waste;
    wasteEl.innerHTML = '';

    if (gameState.waste.length > 0) {
        const topCard = gameState.waste[gameState.waste.length - 1];
        const cardEl = createCardElement(topCard, 'waste', gameState.waste.length - 1);
        wasteEl.appendChild(cardEl);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'card-placeholder';
        wasteEl.appendChild(placeholder);
    }
}

function renderFoundation() {
    for (let i = 0; i < 4; i++) {
        const foundationEl = document.getElementById(`foundation-${i}`);
        foundationEl.innerHTML = '';

        const foundation = gameState.foundation[i];
        if (foundation.length > 0) {
            const topCard = foundation[foundation.length - 1];
            const cardEl = createCardElement(topCard, `foundation-${i}`, foundation.length - 1);
            foundationEl.appendChild(cardEl);
        } else {
            const suit = ['hearts', 'diamonds', 'clubs', 'spades'][i];
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            placeholder.textContent = SUITS[suit].symbol;
            foundationEl.appendChild(placeholder);
        }

        // Make foundation clickable if card is selected
        if (gameState.selectedCard) {
            foundationEl.style.cursor = 'pointer';
            foundationEl.onclick = () => selectCard(`foundation-${i}`, 0);
        } else {
            foundationEl.style.cursor = 'default';
            foundationEl.onclick = null;
        }
    }
}

function renderTableau() {
    for (let i = 0; i < 7; i++) {
        const tableauEl = document.getElementById(`tableau-${i}`);
        tableauEl.innerHTML = '';

        const tableau = gameState.tableau[i];
        tableau.forEach((card, index) => {
            const cardEl = createCardElement(card, `tableau-${i}`, index);
            cardEl.setAttribute('data-position', index);
            tableauEl.appendChild(cardEl);
        });

        // Make empty tableau clickable if card is selected
        if (gameState.selectedCard && tableau.length === 0) {
            tableauEl.style.cursor = 'pointer';
            tableauEl.onclick = () => selectCard(`tableau-${i}`, 0);

            // Add visual indicator
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            tableauEl.appendChild(placeholder);
        } else if (tableau.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            tableauEl.appendChild(placeholder);
            tableauEl.style.cursor = 'default';
            tableauEl.onclick = null;
        }
    }
}

function createCardElement(card, pile, index) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.faceUp ? card.color : 'face-down'}`;

    if (gameState.selectedPile === pile && gameState.selectedIndex === index) {
        cardEl.classList.add('selected');
    }

    if (card.faceUp) {
        const content = document.createElement('div');
        content.className = 'card-content';

        const topRank = document.createElement('div');
        topRank.className = 'card-rank';
        topRank.textContent = card.rank;

        const suit = document.createElement('div');
        suit.className = 'card-suit';
        suit.textContent = card.suitSymbol;

        const bottomRank = document.createElement('div');
        bottomRank.className = 'card-rank';
        bottomRank.textContent = card.rank;

        content.appendChild(topRank);
        content.appendChild(suit);
        content.appendChild(bottomRank);
        cardEl.appendChild(content);

        // Add click handler
        cardEl.onclick = (e) => {
            e.stopPropagation();
            selectCard(pile, index);
        };
        cardEl.ontouchend = (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectCard(pile, index);
        };
    } else {
        const content = document.createElement('div');
        content.className = 'card-content';
        content.textContent = card.rank || '🎴';
        cardEl.appendChild(content);
    }

    return cardEl;
}

function updateStats() {
    elements.movesDisplay.textContent = `Moves: ${gameState.moves}`;
}

// === Game State ===
function checkWin() {
    return gameState.foundation.every(pile => pile.length === 13);
}

function endGame() {
    clearInterval(gameState.timerInterval);

    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('final-moves').textContent = gameState.moves;
    document.getElementById('final-time').textContent = timeStr;

    elements.gameArea.style.display = 'none';
    elements.gameOverScreen.style.display = 'block';

    // Add celebration animation
    celebrateWin();
}

function celebrateWin() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('celebrating');
        }, index * 50);
    });
}

// === Hints ===
function showHint() {
    // Look for possible moves to foundation
    for (let i = 0; i < 7; i++) {
        const tableau = gameState.tableau[i];
        if (tableau.length > 0) {
            const topCard = tableau[tableau.length - 1];
            if (topCard.faceUp) {
                for (let f = 0; f < 4; f++) {
                    if (canMoveToFoundation(topCard, f)) {
                        showMessage(`Try moving ${topCard.rank}${topCard.suitSymbol} to foundation! 💡`);
                        return;
                    }
                }
            }
        }
    }

    // Check waste
    if (gameState.waste.length > 0) {
        const topCard = gameState.waste[gameState.waste.length - 1];
        for (let f = 0; f < 4; f++) {
            if (canMoveToFoundation(topCard, f)) {
                showMessage(`Try moving ${topCard.rank}${topCard.suitSymbol} from waste to foundation! 💡`);
                return;
            }
        }
    }

    // Look for tableau to tableau moves
    for (let i = 0; i < 7; i++) {
        const tableau = gameState.tableau[i];
        if (tableau.length > 0) {
            const topCard = tableau[tableau.length - 1];
            if (topCard.faceUp) {
                for (let t = 0; t < 7; t++) {
                    if (t !== i && canMoveToTableau(topCard, t, tableau.length - 1)) {
                        showMessage(`Try moving ${topCard.rank}${topCard.suitSymbol} to another pile! 💡`);
                        return;
                    }
                }
            }
        }
    }

    // No obvious moves
    if (gameState.stock.length > 0 || gameState.waste.length > 0) {
        showMessage('Try drawing from the deck! 🎴');
    } else {
        showMessage('Look for hidden moves! 🤔');
    }
}

// === Messages ===
function showMessage(text) {
    elements.messageBox.textContent = text;
    elements.messageBox.classList.add('show');

    setTimeout(() => {
        elements.messageBox.classList.remove('show');
    }, 2000);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
