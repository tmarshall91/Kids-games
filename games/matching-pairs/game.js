'use strict';

// === Configuration ===
const CONFIG = {
    difficulties: {
        easy: { time: 60, pairs: 6, name: 'Easy' },
        medium: { time: 45, pairs: 8, name: 'Medium' },
        hard: { time: 30, pairs: 10, name: 'Hard' }
    },
    themes: {
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
        fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍒', '🍑', '🍉', '🍍', '🥝'],
        emojis: ['😀', '😎', '🤩', '😍', '🥳', '😜', '🤗', '😇', '🥰', '😋'],
        sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥏', '🎱']
    },
    pointsBase: 100,
    pointsSpeedBonus: 50,
    comboMultiplier: 1.5
};

// === State Management ===
let gameState = {
    difficulty: 'medium',
    theme: 'animals',
    cards: [],
    selectedCard: null,
    matchedPairs: 0,
    totalPairs: 0,
    score: 0,
    timeRemaining: 0,
    timerInterval: null,
    isPaused: false,
    isPlaying: false,
    combo: 0,
    matchStartTime: null
};

// === DOM References ===
const elements = {
    menuScreen: document.getElementById('menu-screen'),
    gameArea: document.getElementById('game-area'),
    board: document.getElementById('game-board'),
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    combo: document.getElementById('combo'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    quitBtn: document.getElementById('quit-btn'),
    resumeBtn: document.getElementById('resume-btn'),
    restartBtn: document.getElementById('restart-btn'),
    menuBtn: document.getElementById('menu-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    changeSettingsBtn: document.getElementById('change-settings-btn'),
    pauseModal: document.getElementById('pause-modal'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameOverTitle: document.getElementById('game-over-title'),
    finalStats: document.getElementById('final-stats')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    selectDefaultOptions();
}

function setupEventListeners() {
    // Difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        const handler = () => {
            gameState.difficulty = btn.dataset.difficulty;
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handler();
        });
    });

    // Theme selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const handler = () => {
            gameState.theme = btn.dataset.theme;
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        };
        btn.addEventListener('click', handler);
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handler();
        });
    });

    // Game controls
    setupButton(elements.startBtn, startGame);
    setupButton(elements.pauseBtn, pauseGame);
    setupButton(elements.quitBtn, quitGame);
    setupButton(elements.resumeBtn, resumeGame);
    setupButton(elements.restartBtn, () => {
        elements.pauseModal.style.display = 'none';
        startGame();
    });
    setupButton(elements.menuBtn, () => {
        elements.pauseModal.style.display = 'none';
        showMenu();
    });
    setupButton(elements.playAgainBtn, () => {
        elements.gameOverModal.style.display = 'none';
        startGame();
    });
    setupButton(elements.changeSettingsBtn, () => {
        elements.gameOverModal.style.display = 'none';
        showMenu();
    });

    // Prevent unwanted scrolling during gameplay
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

function setupButton(button, handler) {
    button.addEventListener('click', handler);
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        handler();
    });
}

function selectDefaultOptions() {
    // Select default difficulty (medium)
    const mediumBtn = document.querySelector('[data-difficulty="medium"]');
    if (mediumBtn) {
        mediumBtn.classList.add('selected');
    }

    // Select default theme (animals)
    const animalsBtn = document.querySelector('[data-theme="animals"]');
    if (animalsBtn) {
        animalsBtn.classList.add('selected');
    }
}

// === Game Control ===
function startGame() {
    const config = CONFIG.difficulties[gameState.difficulty];

    gameState = {
        difficulty: gameState.difficulty,
        theme: gameState.theme,
        cards: [],
        selectedCard: null,
        matchedPairs: 0,
        totalPairs: config.pairs,
        score: 0,
        timeRemaining: config.time,
        timerInterval: null,
        isPaused: false,
        isPlaying: true,
        combo: 0,
        matchStartTime: Date.now()
    };

    createCards();
    startTimer();
    updateDisplay();

    elements.menuScreen.style.display = 'none';
    elements.gameArea.style.display = 'block';
}

function createCards() {
    const config = CONFIG.difficulties[gameState.difficulty];
    const symbols = CONFIG.themes[gameState.theme];
    const selectedSymbols = symbols.slice(0, config.pairs);
    const cardPairs = [...selectedSymbols, ...selectedSymbols];

    // Shuffle cards using Fisher-Yates algorithm
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    elements.board.innerHTML = '';
    elements.board.className = `board ${gameState.difficulty}`;
    gameState.cards = [];

    cardPairs.forEach((symbol, index) => {
        const card = {
            id: index,
            symbol: symbol,
            isMatched: false,
            element: null
        };

        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = index;
        cardElement.textContent = symbol;

        const handler = () => handleCardClick(card);
        cardElement.addEventListener('click', handler);
        cardElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            handler();
        });

        card.element = cardElement;
        elements.board.appendChild(cardElement);
        gameState.cards.push(card);
    });
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.timeRemaining--;
            updateTimerDisplay();

            if (gameState.timeRemaining <= 0) {
                endGame(false);
            }
        }
    }, 1000);
}

function pauseGame() {
    gameState.isPaused = true;
    elements.pauseModal.style.display = 'flex';
}

function resumeGame() {
    gameState.isPaused = false;
    elements.pauseModal.style.display = 'none';
}

function quitGame() {
    endGame(false);
}

function showMenu() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    gameState.isPlaying = false;
    elements.gameArea.style.display = 'none';
    elements.menuScreen.style.display = 'block';
}

// === Game Logic ===
function handleCardClick(card) {
    if (!gameState.isPlaying || gameState.isPaused || card.isMatched) {
        return;
    }

    // If no card selected, select this one
    if (!gameState.selectedCard) {
        gameState.selectedCard = card;
        card.element.classList.add('selected');
        return;
    }

    // If clicking the same card, deselect it
    if (gameState.selectedCard.id === card.id) {
        gameState.selectedCard.element.classList.remove('selected');
        gameState.selectedCard = null;
        return;
    }

    // Check for match
    if (gameState.selectedCard.symbol === card.symbol) {
        // Match found!
        handleMatch(gameState.selectedCard, card);
    } else {
        // No match
        handleNoMatch(gameState.selectedCard, card);
    }

    gameState.selectedCard = null;
}

function handleMatch(card1, card2) {
    // Mark as matched
    card1.isMatched = true;
    card2.isMatched = true;
    card1.element.classList.remove('selected');
    card1.element.classList.add('matched');
    card2.element.classList.add('matched');

    // Update combo
    gameState.combo++;

    // Calculate points with speed bonus and combo multiplier
    const timeSinceLastMatch = (Date.now() - gameState.matchStartTime) / 1000;
    let points = CONFIG.pointsBase;

    // Speed bonus (faster = more points)
    if (timeSinceLastMatch < 2) {
        points += CONFIG.pointsSpeedBonus;
    }

    // Combo multiplier
    if (gameState.combo > 1) {
        points = Math.floor(points * Math.pow(CONFIG.comboMultiplier, gameState.combo - 1));
    }

    gameState.score += points;
    gameState.matchedPairs++;
    gameState.matchStartTime = Date.now();

    updateDisplay();

    // Check if game won
    if (gameState.matchedPairs === gameState.totalPairs) {
        setTimeout(() => endGame(true), 500);
    }
}

function handleNoMatch(card1, card2) {
    // Wrong match - show feedback
    card1.element.classList.add('wrong');
    card2.element.classList.add('wrong');

    // Reset combo
    gameState.combo = 0;
    gameState.matchStartTime = Date.now();

    setTimeout(() => {
        card1.element.classList.remove('selected', 'wrong');
        card2.element.classList.remove('wrong');
    }, 500);

    updateDisplay();
}

function endGame(won) {
    gameState.isPlaying = false;

    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Prepare final stats
    const config = CONFIG.difficulties[gameState.difficulty];
    const timeUsed = config.time - gameState.timeRemaining;

    if (won) {
        elements.gameOverTitle.textContent = '🎉 You Won! 🎉';

        // Bonus points for remaining time
        const timeBonus = gameState.timeRemaining * 10;
        gameState.score += timeBonus;

        elements.finalStats.innerHTML = `
            <div class="stat-line">
                <span class="stat-label">Difficulty:</span>
                <span class="stat-value">${config.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Score:</span>
                <span class="stat-value">${gameState.score}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Time Used:</span>
                <span class="stat-value">${timeUsed}s</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Time Bonus:</span>
                <span class="stat-value">+${timeBonus}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Matches:</span>
                <span class="stat-value">${gameState.matchedPairs}/${gameState.totalPairs}</span>
            </div>
        `;
    } else {
        elements.gameOverTitle.textContent = '⏰ Time\'s Up!';

        elements.finalStats.innerHTML = `
            <div class="stat-line">
                <span class="stat-label">Difficulty:</span>
                <span class="stat-value">${config.name}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Score:</span>
                <span class="stat-value">${gameState.score}</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Time Used:</span>
                <span class="stat-value">${timeUsed}s</span>
            </div>
            <div class="stat-line">
                <span class="stat-label">Matches:</span>
                <span class="stat-value">${gameState.matchedPairs}/${gameState.totalPairs}</span>
            </div>
        `;
    }

    setTimeout(() => {
        elements.gameOverModal.style.display = 'flex';
    }, 500);
}

// === Display Updates ===
function updateDisplay() {
    elements.score.textContent = `Score: ${gameState.score}`;

    // Update combo display
    if (gameState.combo > 1) {
        elements.combo.textContent = `Combo x${gameState.combo}`;
        elements.combo.style.display = 'inline-block';
    } else {
        elements.combo.style.display = 'none';
    }
}

function updateTimerDisplay() {
    elements.timer.textContent = `Time: ${gameState.timeRemaining}`;

    // Add warning class when time is low
    if (gameState.timeRemaining <= 10) {
        elements.timer.classList.add('warning');
    } else {
        elements.timer.classList.remove('warning');
    }
}

// === Utility Functions ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
