'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalRounds: 20,
    pointsPerCorrect: 10,
    bonusPointsForSpeed: 5, // Bonus if answered within 3 seconds
    speedBonusTime: 3000, // 3 seconds in milliseconds
};

// Dolch Sight Word List - Common words for quick recognition practice
const SIGHT_WORDS = [
    // Pre-Primer
    'a', 'and', 'away', 'big', 'blue', 'can', 'come', 'down', 'find', 'for',
    'funny', 'go', 'help', 'here', 'I', 'in', 'is', 'it', 'jump', 'little',
    'look', 'make', 'me', 'my', 'not', 'one', 'play', 'red', 'run', 'said',
    'see', 'the', 'three', 'to', 'two', 'up', 'we', 'where', 'yellow', 'you',

    // Primer
    'all', 'am', 'are', 'at', 'ate', 'be', 'black', 'brown', 'but', 'came',
    'did', 'do', 'eat', 'four', 'get', 'good', 'have', 'he', 'into', 'like',
    'must', 'new', 'no', 'now', 'on', 'our', 'out', 'please', 'pretty', 'ran',
    'ride', 'saw', 'say', 'she', 'so', 'soon', 'that', 'there', 'they', 'this',
    'too', 'under', 'want', 'was', 'well', 'went', 'what', 'white', 'who', 'will',

    // First Grade
    'after', 'again', 'an', 'any', 'as', 'ask', 'by', 'could', 'every', 'fly',
    'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
    'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
    'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were', 'when'
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    currentRound: 0,
    correctAnswers: 0,
    isPlaying: false,
    currentWord: '',
    correctAnswer: '',
    roundStartTime: 0,
    totalGameTime: 0,
    gameStartTime: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    timerDisplay: document.getElementById('timer'),
    progressBar: document.getElementById('progressBar'),

    // Game area
    gameMessage: document.getElementById('gameMessage'),
    wordDisplay: document.getElementById('wordDisplay'),
    questionText: document.getElementById('questionText'),
    wordCard: document.getElementById('wordCard'),
    displayWord: document.getElementById('displayWord'),
    answerButtons: document.getElementById('answerButtons'),
    feedback: document.getElementById('feedback'),

    // Game over
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalAccuracyDisplay: document.getElementById('finalAccuracy'),
    finalTimeDisplay: document.getElementById('finalTime'),
    performanceMessage: document.getElementById('performanceMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Sight Word Practice Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState = {
        score: 0,
        currentRound: 0,
        correctAnswers: 0,
        isPlaying: true,
        currentWord: '',
        correctAnswer: '',
        roundStartTime: 0,
        totalGameTime: 0,
        gameStartTime: Date.now(),
    };

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.wordDisplay.style.display = 'flex';
    elements.answerButtons.style.display = 'grid';

    updateScoreDisplay();
    updateRoundDisplay();
    updateProgressBar();

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
    gameState.roundStartTime = Date.now();

    updateRoundDisplay();
    updateProgressBar();

    // Clear previous feedback
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';

    // Generate new question
    generateQuestion();

    console.log(`Round ${gameState.currentRound}/${CONFIG.totalRounds}`);
}

function generateQuestion() {
    // Select a random word as the correct answer
    gameState.correctAnswer = SIGHT_WORDS[randomInt(0, SIGHT_WORDS.length - 1)];
    gameState.currentWord = gameState.correctAnswer;

    // Display the word
    elements.displayWord.textContent = gameState.currentWord;
    elements.questionText.textContent = 'What word is this?';

    // Animate the word card
    elements.wordCard.style.animation = 'none';
    setTimeout(() => {
        elements.wordCard.style.animation = 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }, 10);

    // Generate answer options (4 choices)
    const options = generateOptions(gameState.correctAnswer);

    // Create answer buttons
    createAnswerButtons(options);
}

function generateOptions(correctWord) {
    const options = [correctWord];
    const usedWords = new Set([correctWord]);

    // Add 3 wrong options
    while (options.length < 4) {
        const randomWord = SIGHT_WORDS[randomInt(0, SIGHT_WORDS.length - 1)];
        if (!usedWords.has(randomWord)) {
            options.push(randomWord);
            usedWords.add(randomWord);
        }
    }

    // Shuffle options
    return shuffleArray(options);
}

function createAnswerButtons(options) {
    // Clear existing buttons
    elements.answerButtons.innerHTML = '';

    // Create button for each option
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = option;
        button.dataset.answer = option;

        // Add event listeners
        button.addEventListener('touchstart', handleAnswerClick);
        button.addEventListener('click', handleAnswerClick);

        elements.answerButtons.appendChild(button);
    });
}

function handleAnswerClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const selectedAnswer = e.target.dataset.answer;
    const isCorrect = selectedAnswer === gameState.correctAnswer;

    // Calculate time taken
    const timeTaken = Date.now() - gameState.roundStartTime;
    const earnedSpeedBonus = timeTaken < CONFIG.speedBonusTime;

    // Disable all buttons
    const allButtons = elements.answerButtons.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;

        // Highlight correct and incorrect answers
        if (btn.dataset.answer === gameState.correctAnswer) {
            btn.classList.add('correct');
        } else if (btn === e.target && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Update score and feedback
    if (isCorrect) {
        let points = CONFIG.pointsPerCorrect;
        if (earnedSpeedBonus) {
            points += CONFIG.bonusPointsForSpeed;
            elements.feedback.textContent = `Correct! +${points} (Speed Bonus!)`;
        } else {
            elements.feedback.textContent = `Correct! +${points}`;
        }
        elements.feedback.className = 'feedback correct';

        gameState.score += points;
        gameState.correctAnswers++;
        updateScoreDisplay();

        // Play success animation
        elements.scoreDisplay.classList.add('pulse');
        setTimeout(() => {
            elements.scoreDisplay.classList.remove('pulse');
        }, 300);
    } else {
        elements.feedback.textContent = `Try again! The word is "${gameState.correctAnswer}"`;
        elements.feedback.className = 'feedback incorrect';
    }

    // Move to next round after delay
    setTimeout(() => {
        nextRound();
    }, 1500);
}

function endGame() {
    gameState.isPlaying = false;
    gameState.totalGameTime = ((Date.now() - gameState.gameStartTime) / 1000).toFixed(1);

    // Calculate accuracy
    const accuracy = Math.round((gameState.correctAnswers / CONFIG.totalRounds) * 100);

    // Show game over overlay with stats
    elements.finalScoreDisplay.textContent = gameState.correctAnswers;
    elements.finalAccuracyDisplay.textContent = accuracy;
    elements.finalTimeDisplay.textContent = gameState.totalGameTime;

    // Show performance message
    let message = '';
    if (accuracy === 100) {
        message = 'Perfect! You\'re a sight word master!';
    } else if (accuracy >= 80) {
        message = 'Excellent work! Keep practicing!';
    } else if (accuracy >= 60) {
        message = 'Good job! You\'re improving!';
    } else {
        message = 'Nice try! Practice makes perfect!';
    }
    elements.performanceMessage.textContent = message;

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Score:', gameState.correctAnswers, '/', CONFIG.totalRounds);
}

function resetGame() {
    gameState = {
        score: 0,
        currentRound: 0,
        correctAnswers: 0,
        isPlaying: false,
        currentWord: '',
        correctAnswer: '',
        roundStartTime: 0,
        totalGameTime: 0,
        gameStartTime: 0,
    };

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.wordDisplay.style.display = 'none';
    elements.answerButtons.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.feedback.textContent = '';

    updateScoreDisplay();
    updateRoundDisplay();
    updateProgressBar();

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

function updateProgressBar() {
    const progress = (gameState.currentRound / CONFIG.totalRounds) * 100;
    elements.progressBar.style.width = progress + '%';
}

// Timer display (shows time since game start)
let timerInterval = null;

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) {
            stopTimer();
            return;
        }

        const elapsed = ((Date.now() - gameState.gameStartTime) / 1000).toFixed(1);
        elements.timerDisplay.textContent = elapsed + 's';
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Override startGame to include timer
const originalStartGame = startGame;
startGame = function() {
    originalStartGame();
    startTimer();
};

// Override endGame to stop timer
const originalEndGame = endGame;
endGame = function() {
    stopTimer();
    originalEndGame();
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
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

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopTimer();
});
