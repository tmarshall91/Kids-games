'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    emojis: ['🌟', '🎈', '🍎', '🚗', '🐶', '🌸', '⚽', '🍕', '🎨', '🦋'],
    maxNumber: 10,
    minNumber: 1,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    level: 1,
    isPlaying: false,
    currentAnswer: 0,
    currentEmoji: '',
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    continueBtn: document.getElementById('continueBtn'),
    scoreDisplay: document.getElementById('score'),
    levelDisplay: document.getElementById('level'),
    gameMessage: document.getElementById('gameMessage'),
    objectsContainer: document.getElementById('objectsContainer'),
    questionContainer: document.getElementById('questionContainer'),
    answerButtons: document.getElementById('answerButtons'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Number Counting Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);

    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.level = 1;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';

    updateDisplay();
    showNewQuestion();

    console.log('Game started');
}

function showNewQuestion() {
    // Clear previous objects
    elements.objectsContainer.innerHTML = '';
    elements.answerButtons.innerHTML = '';

    // Determine number to count (increases with level)
    const maxForLevel = Math.min(CONFIG.maxNumber, Math.floor(gameState.level / 2) + 3);
    const count = randomInt(CONFIG.minNumber, maxForLevel);
    gameState.currentAnswer = count;

    // Pick random emoji
    gameState.currentEmoji = CONFIG.emojis[randomInt(0, CONFIG.emojis.length - 1)];

    // Display objects
    for (let i = 0; i < count; i++) {
        const obj = document.createElement('div');
        obj.className = 'counting-object';
        obj.textContent = gameState.currentEmoji;
        obj.style.animationDelay = `${i * 0.1}s`;
        elements.objectsContainer.appendChild(obj);
    }

    // Show question after a delay
    setTimeout(() => {
        elements.questionContainer.style.display = 'block';
        createAnswerButtons(count);
    }, 500 + count * 100);
}

function createAnswerButtons(correctAnswer) {
    const options = generateOptions(correctAnswer);

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option;
        btn.addEventListener('touchstart', (e) => handleAnswer(e, option));
        btn.addEventListener('click', (e) => handleAnswer(e, option));
        elements.answerButtons.appendChild(btn);
    });
}

function generateOptions(correctAnswer) {
    const options = new Set([correctAnswer]);

    // Generate wrong answers
    while (options.size < 6) {
        const wrong = randomInt(
            Math.max(1, correctAnswer - 3),
            Math.min(CONFIG.maxNumber, correctAnswer + 3)
        );
        options.add(wrong);
    }

    // Convert to array and shuffle
    return shuffleArray(Array.from(options));
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleNext(e) {
    e.preventDefault();
    elements.nextBtn.style.display = 'none';
    showNewQuestion();
}

function handleContinue(e) {
    e.preventDefault();
    elements.feedbackOverlay.style.display = 'none';
    showNewQuestion();
}

function handleAnswer(e, selectedAnswer) {
    e.preventDefault();

    const btn = e.target;
    const isCorrect = selectedAnswer === gameState.currentAnswer;

    // Disable all buttons
    const allButtons = elements.answerButtons.querySelectorAll('.answer-btn');
    allButtons.forEach(b => {
        b.style.pointerEvents = 'none';
        if (parseInt(b.textContent) === gameState.currentAnswer) {
            b.classList.add('correct');
        }
    });

    if (isCorrect) {
        btn.classList.add('correct');
        gameState.score += 10;
        gameState.level++;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎉 Correct!';
        elements.feedbackTitle.className = 'correct';
        elements.feedbackMessage.textContent = `Great job! There were ${gameState.currentAnswer} ${gameState.currentEmoji}`;
    } else {
        btn.classList.add('incorrect');

        elements.feedbackTitle.textContent = '😊 Try Again!';
        elements.feedbackTitle.className = 'incorrect';
        elements.feedbackMessage.textContent = `Not quite! There were ${gameState.currentAnswer} ${gameState.currentEmoji}`;
    }

    // Show feedback after a delay
    setTimeout(() => {
        elements.feedbackOverlay.style.display = 'flex';
    }, 1000);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.levelDisplay.textContent = gameState.level;

    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => {
        elements.scoreDisplay.classList.remove('pulse');
    }, 300);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
