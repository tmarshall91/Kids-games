'use strict';

// === Configuration ===
const CONFIG = {
    words: [
        { word: 'CAT', emoji: '🐱', letters: ['C', 'A', 'T'] },
        { word: 'DOG', emoji: '🐶', letters: ['D', 'O', 'G'] },
        { word: 'BAT', emoji: '🦇', letters: ['B', 'A', 'T'] },
        { word: 'HAT', emoji: '🎩', letters: ['H', 'A', 'T'] },
        { word: 'PIG', emoji: '🐷', letters: ['P', 'I', 'G'] },
        { word: 'HEN', emoji: '🐔', letters: ['H', 'E', 'N'] },
        { word: 'SUN', emoji: '☀️', letters: ['S', 'U', 'N'] },
        { word: 'CUP', emoji: '🥤', letters: ['C', 'U', 'P'] },
        { word: 'BUG', emoji: '🐛', letters: ['B', 'U', 'G'] },
        { word: 'RAT', emoji: '🐀', letters: ['R', 'A', 'T'] },
        { word: 'BED', emoji: '🛏️', letters: ['B', 'E', 'D'] },
        { word: 'NET', emoji: '🥅', letters: ['N', 'E', 'T'] },
        { word: 'PEN', emoji: '🖊️', letters: ['P', 'E', 'N'] },
        { word: 'BUS', emoji: '🚌', letters: ['B', 'U', 'S'] },
        { word: 'VAN', emoji: '🚐', letters: ['V', 'A', 'N'] },
        { word: 'FOX', emoji: '🦊', letters: ['F', 'O', 'X'] },
        { word: 'BOX', emoji: '📦', letters: ['B', 'O', 'X'] },
        { word: 'JAR', emoji: '🫙', letters: ['J', 'A', 'R'] },
        { word: 'MOP', emoji: '🧹', letters: ['M', 'O', 'P'] },
        { word: 'WIG', emoji: '👨‍🦰', letters: ['W', 'I', 'G'] }
    ],
    consonants: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'],
    vowels: ['A', 'E', 'I', 'O', 'U'],
    totalRounds: 10,
    optionsCount: 5, // Number of letter choices to show
    encouragement: {
        correct: [
            'Awesome!',
            'Perfect!',
            'Great job!',
            'You got it!',
            'Fantastic!',
            'Well done!',
            'Brilliant!',
            'Amazing!'
        ],
        wrong: [
            'Nice try!',
            'Almost!',
            'Keep trying!',
            'Good effort!',
            'Try again next time!'
        ]
    }
};

// === State Management ===
let gameState = {
    currentRound: 1,
    score: 0,
    isPlaying: false,
    currentWord: null,
    currentPosition: 0, // 0 = first consonant, 1 = vowel, 2 = last consonant
    selectedLetters: ['', '', ''], // User's selected letters for C-V-C
    usedWords: []
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    checkBtn: document.getElementById('checkBtn'),
    nextBtn: document.getElementById('nextBtn'),
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    clueEmoji: document.getElementById('clueEmoji'),
    letterOptions: document.getElementById('letterOptions'),
    optionsLabel: document.getElementById('optionsLabel'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    performanceMessage: document.getElementById('performanceMessage'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    slots: [
        document.getElementById('slot0'),
        document.getElementById('slot1'),
        document.getElementById('slot2')
    ]
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.checkBtn.addEventListener('touchstart', handleCheck);
    elements.checkBtn.addEventListener('click', handleCheck);
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

function handleCheck(e) {
    e.preventDefault();
    checkWord();
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
    if (!gameState.isPlaying) return;

    selectLetter(letter);
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
        currentWord: null,
        currentPosition: 0,
        selectedLetters: ['', '', ''],
        usedWords: []
    };
    elements.scoreDisplay.textContent = '0';
    elements.roundDisplay.textContent = '1/10';
    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
}

function loadNewRound() {
    // Reset position and selections
    gameState.currentPosition = 0;
    gameState.selectedLetters = ['', '', ''];

    elements.feedbackMessage.textContent = '';
    elements.feedbackMessage.className = 'feedback-message';
    elements.checkBtn.style.display = 'none';
    elements.nextBtn.style.display = 'none';

    // Get available words (not used yet)
    let availableWords = CONFIG.words.filter((_, index) => !gameState.usedWords.includes(index));

    // If all words used, reset the pool
    if (availableWords.length === 0) {
        gameState.usedWords = [];
        availableWords = CONFIG.words;
    }

    // Select random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];
    const wordIndex = CONFIG.words.findIndex(word => word === selectedWord);

    gameState.currentWord = selectedWord;
    gameState.usedWords.push(wordIndex);

    // Update UI
    elements.clueEmoji.textContent = selectedWord.emoji;
    elements.roundDisplay.textContent = `${gameState.currentRound}/${CONFIG.totalRounds}`;

    // Reset slots
    elements.slots.forEach((slot, index) => {
        slot.textContent = '?';
        slot.className = 'slot-letter';
    });

    // Animate emoji
    elements.clueEmoji.style.animation = 'none';
    setTimeout(() => {
        elements.clueEmoji.style.animation = 'bounce 0.5s ease';
    }, 10);

    // Generate options for first position
    updateOptionsForPosition(0);
}

function updateOptionsForPosition(position) {
    gameState.currentPosition = position;
    elements.letterOptions.innerHTML = '';

    // Update label
    const labels = [
        'Pick the first letter (consonant):',
        'Pick the middle letter (vowel):',
        'Pick the last letter (consonant):'
    ];
    elements.optionsLabel.textContent = labels[position];

    // Get correct letter for this position
    const correctLetter = gameState.currentWord.letters[position];

    // Get letter pool based on position
    let letterPool;
    if (position === 1) {
        // Vowel position
        letterPool = [...CONFIG.vowels];
    } else {
        // Consonant positions
        letterPool = [...CONFIG.consonants];
    }

    // Remove correct letter from pool
    letterPool = letterPool.filter(l => l !== correctLetter);

    // Randomly select wrong letters
    const selectedWrongLetters = [];
    while (selectedWrongLetters.length < CONFIG.optionsCount - 1 && letterPool.length > 0) {
        const randomIndex = Math.floor(Math.random() * letterPool.length);
        const letter = letterPool.splice(randomIndex, 1)[0];
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
        button.addEventListener('touchstart', (e) => handleLetterClick(e, letter));
        button.addEventListener('click', (e) => handleLetterClick(e, letter));
        elements.letterOptions.appendChild(button);
    });
}

function selectLetter(letter) {
    const position = gameState.currentPosition;

    // Store selected letter
    gameState.selectedLetters[position] = letter;

    // Update slot
    elements.slots[position].textContent = letter;
    elements.slots[position].classList.add('filled');

    // Animate selection
    const buttons = elements.letterOptions.querySelectorAll('.letter-btn');
    buttons.forEach(btn => {
        if (btn.textContent === letter) {
            btn.classList.add('selected');
        }
    });

    // Move to next position or show check button
    setTimeout(() => {
        if (position < 2) {
            // Move to next position
            updateOptionsForPosition(position + 1);
        } else {
            // All letters selected, show check button
            elements.letterOptions.innerHTML = '';
            elements.optionsLabel.textContent = 'Ready to check your word?';
            elements.checkBtn.style.display = 'inline-block';
        }
    }, 500);
}

function checkWord() {
    const userWord = gameState.selectedLetters.join('');
    const correctWord = gameState.currentWord.word;
    const isCorrect = userWord === correctWord;

    // Disable check button
    elements.checkBtn.disabled = true;

    // Mark each slot
    elements.slots.forEach((slot, index) => {
        if (gameState.selectedLetters[index] === gameState.currentWord.letters[index]) {
            slot.classList.add('correct');
        } else {
            slot.classList.add('wrong');
        }
    });

    // Update score and feedback
    if (isCorrect) {
        gameState.score++;
        elements.scoreDisplay.textContent = gameState.score;

        const encouragement = CONFIG.encouragement.correct[
            Math.floor(Math.random() * CONFIG.encouragement.correct.length)
        ];
        elements.feedbackMessage.textContent = `${encouragement} You spelled ${correctWord}!`;
        elements.feedbackMessage.className = 'feedback-message correct';
    } else {
        const encouragement = CONFIG.encouragement.wrong[
            Math.floor(Math.random() * CONFIG.encouragement.wrong.length)
        ];
        elements.feedbackMessage.textContent = `${encouragement} The word was ${correctWord}!`;
        elements.feedbackMessage.className = 'feedback-message wrong';
    }

    // Show next button or end game
    if (gameState.currentRound >= CONFIG.totalRounds) {
        setTimeout(endGame, 2500);
    } else {
        elements.nextBtn.style.display = 'inline-block';
    }
}

function nextRound() {
    gameState.currentRound++;
    elements.checkBtn.disabled = false;
    loadNewRound();
}

function endGame() {
    gameState.isPlaying = false;
    elements.finalScore.textContent = gameState.score;

    // Generate performance message
    const percentage = (gameState.score / CONFIG.totalRounds) * 100;
    let message = '';

    if (percentage === 100) {
        message = 'Perfect score! You\'re a CVC word champion!';
    } else if (percentage >= 80) {
        message = 'Excellent work! You\'re great at building words!';
    } else if (percentage >= 60) {
        message = 'Good job! Keep practicing your words!';
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
