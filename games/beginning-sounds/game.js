'use strict';

// === Configuration ===
const CONFIG = {
    items: [
        { emoji: '🍎', word: 'APPLE', letter: 'A' },
        { emoji: '⚽', word: 'BALL', letter: 'B' },
        { emoji: '🐱', word: 'CAT', letter: 'C' },
        { emoji: '🐶', word: 'DOG', letter: 'D' },
        { emoji: '🐘', word: 'ELEPHANT', letter: 'E' },
        { emoji: '🐟', word: 'FISH', letter: 'F' },
        { emoji: '🍇', word: 'GRAPES', letter: 'G' },
        { emoji: '🏠', word: 'HOUSE', letter: 'H' },
        { emoji: '🍦', word: 'ICE CREAM', letter: 'I' },
        { emoji: '🤹', word: 'JUGGLER', letter: 'J' },
        { emoji: '🔑', word: 'KEY', letter: 'K' },
        { emoji: '🦁', word: 'LION', letter: 'L' },
        { emoji: '🐵', word: 'MONKEY', letter: 'M' },
        { emoji: '🎵', word: 'NOTE', letter: 'N' },
        { emoji: '🐙', word: 'OCTOPUS', letter: 'O' },
        { emoji: '🍕', word: 'PIZZA', letter: 'P' },
        { emoji: '👸', word: 'QUEEN', letter: 'Q' },
        { emoji: '🌈', word: 'RAINBOW', letter: 'R' },
        { emoji: '⭐', word: 'STAR', letter: 'S' },
        { emoji: '🐯', word: 'TIGER', letter: 'T' },
        { emoji: '☂️', word: 'UMBRELLA', letter: 'U' },
        { emoji: '🎻', word: 'VIOLIN', letter: 'V' },
        { emoji: '🍉', word: 'WATERMELON', letter: 'W' },
        { emoji: '📦', word: 'BOX', letter: 'X' },
        { emoji: '🧶', word: 'YARN', letter: 'Y' },
        { emoji: '🦓', word: 'ZEBRA', letter: 'Z' }
    ],
    totalRounds: 10,
    optionsCount: 4, // Number of letter choices to show
    encouragement: {
        correct: [
            'Awesome!',
            'Great job!',
            'Perfect!',
            'You got it!',
            'Fantastic!',
            'Well done!',
            'Brilliant!',
            'Amazing!'
        ],
        wrong: [
            'Nice try!',
            'Almost!',
            'Keep going!',
            'Try again next time!',
            'Good effort!'
        ]
    }
};

// === State Management ===
let gameState = {
    currentRound: 1,
    score: 0,
    isPlaying: false,
    currentItem: null,
    usedItems: [],
    selectedAnswer: null
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    picture: document.getElementById('picture'),
    wordLabel: document.getElementById('wordLabel'),
    letterOptions: document.getElementById('letterOptions'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    performanceMessage: document.getElementById('performanceMessage'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// === Event Handlers ===
function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleNext(e) {
    e.preventDefault();
    nextRound();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    resetGame();
    startGame();
}

function handleLetterClick(e, letter) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.selectedAnswer !== null) return;

    gameState.selectedAnswer = letter;
    checkAnswer(letter, e.currentTarget);
}

// === Game Logic ===
function startGame() {
    gameState.isPlaying = true;
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.gameContent.style.display = 'flex';

    loadNewRound();
}

function resetGame() {
    gameState = {
        currentRound: 1,
        score: 0,
        isPlaying: false,
        currentItem: null,
        usedItems: [],
        selectedAnswer: null
    };
    elements.scoreDisplay.textContent = '0';
    elements.roundDisplay.textContent = '1/10';
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
}

function loadNewRound() {
    gameState.selectedAnswer = null;
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
    elements.nextBtn.style.display = 'none';

    // Get available items (not used yet)
    let availableItems = CONFIG.items.filter((_, index) => !gameState.usedItems.includes(index));

    // If all items used, reset the pool
    if (availableItems.length === 0) {
        gameState.usedItems = [];
        availableItems = CONFIG.items;
    }

    // Select random item
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const selectedItem = availableItems[randomIndex];
    const itemIndex = CONFIG.items.findIndex(item => item === selectedItem);

    gameState.currentItem = selectedItem;
    gameState.usedItems.push(itemIndex);

    // Update UI
    elements.picture.textContent = selectedItem.emoji;
    elements.wordLabel.textContent = selectedItem.word;
    elements.roundDisplay.textContent = `${gameState.currentRound}/${CONFIG.totalRounds}`;

    // Animate picture
    elements.picture.style.animation = 'none';
    setTimeout(() => {
        elements.picture.style.animation = 'bounce 0.5s ease';
    }, 10);

    // Generate letter options
    generateLetterOptions(selectedItem.letter);
}

function generateLetterOptions(correctLetter) {
    elements.letterOptions.innerHTML = '';

    // Get all letters except the correct one
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wrongLetters = allLetters.filter(l => l !== correctLetter);

    // Randomly select wrong letters
    const selectedWrongLetters = [];
    while (selectedWrongLetters.length < CONFIG.optionsCount - 1) {
        const randomIndex = Math.floor(Math.random() * wrongLetters.length);
        const letter = wrongLetters.splice(randomIndex, 1)[0];
        selectedWrongLetters.push(letter);
    }

    // Add correct letter and shuffle
    const options = [...selectedWrongLetters, correctLetter];
    shuffleArray(options);

    // Create buttons
    options.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-btn';
        button.textContent = letter;
        button.dataset.letter = letter;
        button.addEventListener('touchstart', (e) => handleLetterClick(e, letter));
        button.addEventListener('click', (e) => handleLetterClick(e, letter));
        elements.letterOptions.appendChild(button);
    });
}

function checkAnswer(selectedLetter, buttonElement) {
    const correctLetter = gameState.currentItem.letter;
    const isCorrect = selectedLetter === correctLetter;

    // Disable all buttons
    const allButtons = elements.letterOptions.querySelectorAll('.letter-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;

        // Highlight correct and wrong answers
        if (btn.dataset.letter === correctLetter) {
            btn.classList.add('correct');
        } else if (btn === buttonElement && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Update score and feedback
    if (isCorrect) {
        gameState.score++;
        elements.scoreDisplay.textContent = gameState.score;

        const encouragement = CONFIG.encouragement.correct[
            Math.floor(Math.random() * CONFIG.encouragement.correct.length)
        ];
        elements.feedbackMessage.textContent = encouragement;
        elements.feedbackMessage.className = 'feedback-message correct';
    } else {
        const encouragement = CONFIG.encouragement.wrong[
            Math.floor(Math.random() * CONFIG.encouragement.wrong.length)
        ];
        elements.feedbackMessage.textContent = `${encouragement} It's ${correctLetter}!`;
        elements.feedbackMessage.className = 'feedback-message wrong';
    }

    // Show next button or end game
    if (gameState.currentRound >= CONFIG.totalRounds) {
        setTimeout(endGame, 2000);
    } else {
        elements.nextBtn.style.display = 'inline-block';
    }
}

function nextRound() {
    gameState.currentRound++;
    loadNewRound();
}

function endGame() {
    gameState.isPlaying = false;
    elements.finalScore.textContent = gameState.score;

    // Generate performance message
    const percentage = (gameState.score / CONFIG.totalRounds) * 100;
    let message = '';

    if (percentage === 100) {
        message = 'Perfect score! You\'re a letter sound champion!';
    } else if (percentage >= 80) {
        message = 'Excellent work! You know your letter sounds!';
    } else if (percentage >= 60) {
        message = 'Good job! Keep practicing!';
    } else if (percentage >= 40) {
        message = 'Nice effort! You\'re learning!';
    } else {
        message = 'Keep trying! Practice makes perfect!';
    }

    elements.performanceMessage.textContent = message;
    elements.gameOverOverlay.style.display = 'flex';
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
