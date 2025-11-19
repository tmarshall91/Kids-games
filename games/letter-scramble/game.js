'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalRounds: 10,
    pointsPerWord: 1,
};

// Kid-friendly word list
const WORD_LIST = [
    'apple',
    'happy',
    'sunny',
    'flower',
    'friend',
    'rainbow',
    'family',
    'smile',
    'animal',
    'garden',
    'music',
    'cookie'
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    currentRound: 0,
    isPlaying: false,
    currentWord: '',
    scrambledWord: '',
    userAnswer: [],
    usedWords: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    checkBtn: document.getElementById('checkBtn'),
    clearBtn: document.getElementById('clearBtn'),
    nextBtn: document.getElementById('nextBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    finalScoreDisplay: document.getElementById('finalScore'),
    performanceMessage: document.getElementById('performanceMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game elements
    scrambledLetters: document.getElementById('scrambledLetters'),
    answerBoxes: document.getElementById('answerBoxes'),
    tilesContainer: document.getElementById('tilesContainer'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Letter Scramble game initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Check button
    elements.checkBtn.addEventListener('touchstart', handleCheck);
    elements.checkBtn.addEventListener('click', handleCheck);

    // Clear button
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);

    // Next button
    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.currentRound = 0;
    gameState.usedWords = [];

    // Update UI
    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';
    elements.checkBtn.style.display = 'inline-block';
    elements.clearBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateRoundDisplay();

    // Start first round
    nextRound();

    console.log('Game started');
}

function nextRound() {
    if (gameState.currentRound >= CONFIG.totalRounds) {
        endGame();
        return;
    }

    gameState.currentRound++;
    gameState.userAnswer = [];

    // Select a random word that hasn't been used
    selectNewWord();

    // Scramble the word
    gameState.scrambledWord = scrambleWord(gameState.currentWord);

    // Display scrambled word (for reference)
    displayScrambledWord();

    // Create answer boxes
    createAnswerBoxes();

    // Create letter tiles
    createLetterTiles();

    updateRoundDisplay();

    console.log('Round', gameState.currentRound, 'Word:', gameState.currentWord);
}

function selectNewWord() {
    // Get available words (not used yet)
    let availableWords = WORD_LIST.filter(word => !gameState.usedWords.includes(word));

    // If all words used, reset the pool
    if (availableWords.length === 0) {
        gameState.usedWords = [];
        availableWords = [...WORD_LIST];
    }

    // Select random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    gameState.currentWord = availableWords[randomIndex];
    gameState.usedWords.push(gameState.currentWord);
}

function scrambleWord(word) {
    let letters = word.split('');
    let scrambled = word;

    // Keep scrambling until it's different from original
    let attempts = 0;
    while (scrambled === word && attempts < 50) {
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        scrambled = letters.join('');
        attempts++;
    }

    return scrambled;
}

function displayScrambledWord() {
    elements.scrambledLetters.innerHTML = '';

    const letters = gameState.scrambledWord.split('');
    letters.forEach((letter, index) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'scrambled-letter';
        letterSpan.textContent = letter.toUpperCase();
        letterSpan.style.setProperty('--index', index);
        elements.scrambledLetters.appendChild(letterSpan);
    });
}

function createAnswerBoxes() {
    elements.answerBoxes.innerHTML = '';

    for (let i = 0; i < gameState.currentWord.length; i++) {
        const box = document.createElement('div');
        box.className = 'answer-box';
        box.dataset.index = i;
        elements.answerBoxes.appendChild(box);
    }
}

function createLetterTiles() {
    elements.tilesContainer.innerHTML = '';

    const letters = gameState.scrambledWord.split('');
    letters.forEach((letter, index) => {
        const tile = document.createElement('button');
        tile.className = 'letter-tile';
        tile.textContent = letter.toUpperCase();
        tile.dataset.letter = letter;
        tile.dataset.index = index;

        tile.addEventListener('touchstart', handleTileClick);
        tile.addEventListener('click', handleTileClick);

        elements.tilesContainer.appendChild(tile);
    });
}

function handleTileClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const tile = e.currentTarget;
    if (tile.classList.contains('used')) return;

    const letter = tile.dataset.letter;

    // Add letter to answer
    if (gameState.userAnswer.length < gameState.currentWord.length) {
        gameState.userAnswer.push(letter);
        tile.classList.add('used');

        // Update answer boxes
        updateAnswerBoxes();

        // Add bounce animation
        tile.classList.add('bounce');
        setTimeout(() => tile.classList.remove('bounce'), 500);
    }
}

function updateAnswerBoxes() {
    const boxes = elements.answerBoxes.querySelectorAll('.answer-box');
    boxes.forEach((box, index) => {
        if (gameState.userAnswer[index]) {
            box.textContent = gameState.userAnswer[index].toUpperCase();
            box.classList.add('filled');
        } else {
            box.textContent = '';
            box.classList.remove('filled');
        }
    });
}

function checkAnswer() {
    const userWord = gameState.userAnswer.join('');
    const isCorrect = userWord.toLowerCase() === gameState.currentWord.toLowerCase();

    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    gameState.score += CONFIG.pointsPerWord;
    updateScoreDisplay();

    // Show feedback
    showFeedback('Correct!', 'correct');

    // Add correct animation to answer boxes
    elements.answerBoxes.classList.add('correct');
    setTimeout(() => elements.answerBoxes.classList.remove('correct'), 600);

    // Pulse score
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => elements.scoreDisplay.classList.remove('pulse'), 300);

    // Hide check and clear, show next
    elements.checkBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.nextBtn.style.display = 'inline-block';
}

function handleWrongAnswer() {
    // Show feedback
    showFeedback('Try Again!', 'wrong');

    // Add shake animation
    elements.answerBoxes.classList.add('shake');
    setTimeout(() => elements.answerBoxes.classList.remove('shake'), 500);
}

function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;

    elements.gameArea.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

function clearAnswer() {
    gameState.userAnswer = [];

    // Reset all tiles
    const tiles = elements.tilesContainer.querySelectorAll('.letter-tile');
    tiles.forEach(tile => {
        tile.classList.remove('used');
    });

    // Clear answer boxes
    updateAnswerBoxes();
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate performance message
    let performanceMsg = '';
    if (gameState.score === CONFIG.totalRounds) {
        performanceMsg = 'Perfect score! You\'re a word master!';
    } else if (gameState.score >= CONFIG.totalRounds * 0.8) {
        performanceMsg = 'Excellent work! Keep it up!';
    } else if (gameState.score >= CONFIG.totalRounds * 0.6) {
        performanceMsg = 'Good job! You\'re getting better!';
    } else {
        performanceMsg = 'Nice try! Practice makes perfect!';
    }

    elements.performanceMessage.textContent = performanceMsg;
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.currentRound = 0;
    gameState.isPlaying = false;
    gameState.userAnswer = [];
    gameState.usedWords = [];

    // Reset UI
    elements.gameMessage.classList.remove('hidden');
    elements.startBtn.style.display = 'inline-block';
    elements.checkBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.nextBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Clear game area
    elements.scrambledLetters.innerHTML = '';
    elements.answerBoxes.innerHTML = '';
    elements.tilesContainer.innerHTML = '';

    updateScoreDisplay();
    updateRoundDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

function handleCheck(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    // Check if answer is complete
    if (gameState.userAnswer.length === gameState.currentWord.length) {
        checkAnswer();
    } else {
        showFeedback('Complete the word!', 'wrong');
    }
}

function handleClear(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    clearAnswer();
}

function handleNext(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    // Reset for next round
    elements.checkBtn.style.display = 'inline-block';
    elements.clearBtn.style.display = 'inline-block';
    elements.nextBtn.style.display = 'none';

    nextRound();
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateRoundDisplay() {
    elements.roundDisplay.textContent = `${gameState.currentRound}/${CONFIG.totalRounds}`;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
