'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    difficulty: {
        easy: { min: 1, max: 5 },
        medium: { min: 1, max: 10 },
        hard: { min: 1, max: 20 }
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    streak: 0,
    isPlaying: false,
    currentDifficulty: 'easy',
    currentOperation: 'addition',
    currentProblem: null,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    easyBtn: document.getElementById('easyBtn'),
    mediumBtn: document.getElementById('mediumBtn'),
    hardBtn: document.getElementById('hardBtn'),
    backBtn: document.getElementById('backBtn'),
    continueBtn: document.getElementById('continueBtn'),
    additionBtn: document.getElementById('additionBtn'),
    subtractionBtn: document.getElementById('subtractionBtn'),
    scoreDisplay: document.getElementById('score'),
    streakDisplay: document.getElementById('streak'),
    gameMessage: document.getElementById('gameMessage'),
    mathContainer: document.getElementById('mathContainer'),
    number1: document.getElementById('number1'),
    operator: document.getElementById('operator'),
    number2: document.getElementById('number2'),
    answerButtons: document.getElementById('answerButtons'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Math Facts Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.easyBtn.addEventListener('touchstart', (e) => handleDifficultySelect(e, 'easy'));
    elements.easyBtn.addEventListener('click', (e) => handleDifficultySelect(e, 'easy'));

    elements.mediumBtn.addEventListener('touchstart', (e) => handleDifficultySelect(e, 'medium'));
    elements.mediumBtn.addEventListener('click', (e) => handleDifficultySelect(e, 'medium'));

    elements.hardBtn.addEventListener('touchstart', (e) => handleDifficultySelect(e, 'hard'));
    elements.hardBtn.addEventListener('click', (e) => handleDifficultySelect(e, 'hard'));

    elements.backBtn.addEventListener('touchstart', handleBack);
    elements.backBtn.addEventListener('click', handleBack);

    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);

    elements.additionBtn.addEventListener('touchstart', (e) => handleOperationChange(e, 'addition'));
    elements.additionBtn.addEventListener('click', (e) => handleOperationChange(e, 'addition'));

    elements.subtractionBtn.addEventListener('touchstart', (e) => handleOperationChange(e, 'subtraction'));
    elements.subtractionBtn.addEventListener('click', (e) => handleOperationChange(e, 'subtraction'));
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame(difficulty) {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.currentDifficulty = difficulty;

    elements.gameMessage.style.display = 'none';
    elements.mathContainer.style.display = 'flex';
    elements.backBtn.style.display = 'inline-block';

    updateDisplay();
    generateProblem();

    console.log('Game started with difficulty:', difficulty);
}

function generateProblem() {
    const diff = CONFIG.difficulty[gameState.currentDifficulty];
    let num1, num2, answer;

    if (gameState.currentOperation === 'addition') {
        num1 = randomInt(diff.min, diff.max);
        num2 = randomInt(diff.min, diff.max);
        answer = num1 + num2;
        elements.operator.textContent = '+';
    } else {
        // Subtraction - ensure positive result
        num1 = randomInt(diff.min, diff.max);
        num2 = randomInt(diff.min, num1);
        answer = num1 - num2;
        elements.operator.textContent = '−';
    }

    gameState.currentProblem = { num1, num2, answer };

    // Display problem
    elements.number1.textContent = num1;
    elements.number2.textContent = num2;

    // Generate answer options
    createAnswerButtons(answer);
}

function createAnswerButtons(correctAnswer) {
    const options = new Set([correctAnswer]);

    // Generate wrong answers
    const range = gameState.currentDifficulty === 'hard' ? 10 : 5;
    while (options.size < 6) {
        const wrong = randomInt(
            Math.max(0, correctAnswer - range),
            correctAnswer + range
        );
        if (wrong >= 0) options.add(wrong);
    }

    const optionsArray = shuffleArray(Array.from(options));

    // Clear previous buttons
    elements.answerButtons.innerHTML = '';

    // Create buttons
    optionsArray.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option;
        btn.addEventListener('touchstart', (e) => handleAnswer(e, option));
        btn.addEventListener('click', (e) => handleAnswer(e, option));
        elements.answerButtons.appendChild(btn);
    });
}

function handleOperationChange(e, operation) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    gameState.currentOperation = operation;

    // Update button states
    elements.additionBtn.classList.toggle('active', operation === 'addition');
    elements.subtractionBtn.classList.toggle('active', operation === 'subtraction');

    // Generate new problem
    generateProblem();
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleDifficultySelect(e, difficulty) {
    e.preventDefault();
    startGame(difficulty);
}

function handleBack(e) {
    e.preventDefault();
    gameState.isPlaying = false;

    elements.gameMessage.style.display = 'block';
    elements.mathContainer.style.display = 'none';
    elements.backBtn.style.display = 'none';
}

function handleContinue(e) {
    e.preventDefault();
    elements.feedbackOverlay.style.display = 'none';
    generateProblem();
}

function handleAnswer(e, selectedAnswer) {
    e.preventDefault();

    const btn = e.target;
    const isCorrect = selectedAnswer === gameState.currentProblem.answer;

    // Disable all buttons
    const allButtons = elements.answerButtons.querySelectorAll('.answer-btn');
    allButtons.forEach(b => {
        b.style.pointerEvents = 'none';
        if (parseInt(b.textContent) === gameState.currentProblem.answer) {
            b.classList.add('correct');
        }
    });

    if (isCorrect) {
        btn.classList.add('correct');
        gameState.score += 10;
        gameState.streak++;

        elements.feedbackTitle.textContent = '🎉 Correct!';
        elements.feedbackTitle.className = 'correct';
        elements.feedbackMessage.textContent = `${gameState.currentProblem.num1} ${elements.operator.textContent} ${gameState.currentProblem.num2} = ${gameState.currentProblem.answer}`;
    } else {
        btn.classList.add('incorrect');
        gameState.streak = 0;

        elements.feedbackTitle.textContent = '💡 Not Quite!';
        elements.feedbackTitle.className = 'incorrect';
        elements.feedbackMessage.textContent = `${gameState.currentProblem.num1} ${elements.operator.textContent} ${gameState.currentProblem.num2} = ${gameState.currentProblem.answer}`;
    }

    updateDisplay();

    setTimeout(() => {
        elements.feedbackOverlay.style.display = 'flex';
    }, 800);
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.streakDisplay.textContent = gameState.streak;

    if (gameState.streak > 0) {
        elements.streakDisplay.classList.add('pulse');
        setTimeout(() => {
            elements.streakDisplay.classList.remove('pulse');
        }, 300);
    }
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
