'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    // Phonetic sounds for each letter
    phonetics: {
        A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee',
        F: 'eff', G: 'jee', H: 'aych', I: 'eye', J: 'jay',
        K: 'kay', L: 'ell', M: 'emm', N: 'enn', O: 'oh',
        P: 'pee', Q: 'kyoo', R: 'arr', S: 'ess', T: 'tee',
        U: 'you', V: 'vee', W: 'double-you', X: 'ecks', Y: 'why', Z: 'zee'
    },
    sounds: {
        A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh',
        F: 'fuh', G: 'guh', H: 'huh', I: 'ih', J: 'juh',
        K: 'kuh', L: 'luh', M: 'muh', N: 'nuh', O: 'oh',
        P: 'puh', Q: 'kwuh', R: 'ruh', S: 'sss', T: 'tuh',
        U: 'uh', V: 'vuh', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz'
    }
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    learnedLetters: new Set(),
    currentMode: 'practice', // 'practice' or 'quiz'
    isPlaying: false,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    practiceModeBtn: document.getElementById('practiceModeBtn'),
    quizModeBtn: document.getElementById('quizModeBtn'),
    lettersLearnedDisplay: document.getElementById('lettersLearned'),
    gameMessage: document.getElementById('gameMessage'),
    alphabetGrid: document.getElementById('alphabetGrid'),
    soundBubble: document.getElementById('soundBubble'),
    quizOverlay: document.getElementById('quizOverlay'),
    quizQuestion: document.getElementById('quizQuestion'),
    quizOptions: document.getElementById('quizOptions'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Alphabet Learning Game initialized');
    setupEventListeners();
    createAlphabetGrid();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.practiceModeBtn.addEventListener('touchstart', (e) => handleModeSwitch(e, 'practice'));
    elements.practiceModeBtn.addEventListener('click', (e) => handleModeSwitch(e, 'practice'));

    elements.quizModeBtn.addEventListener('touchstart', (e) => handleModeSwitch(e, 'quiz'));
    elements.quizModeBtn.addEventListener('click', (e) => handleModeSwitch(e, 'quiz'));
}

function createAlphabetGrid() {
    CONFIG.alphabet.forEach(letter => {
        const card = document.createElement('div');
        card.className = 'letter-card';
        card.dataset.letter = letter;

        const letterSpan = document.createElement('div');
        letterSpan.className = 'letter';
        letterSpan.textContent = letter;

        const phoneticSpan = document.createElement('div');
        phoneticSpan.className = 'phonetic';
        phoneticSpan.textContent = CONFIG.sounds[letter];

        card.appendChild(letterSpan);
        card.appendChild(phoneticSpan);

        card.addEventListener('touchstart', (e) => handleLetterClick(e, letter));
        card.addEventListener('click', (e) => handleLetterClick(e, letter));

        elements.alphabetGrid.appendChild(card);
    });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.alphabetGrid.style.display = 'grid';
    elements.practiceModeBtn.style.display = 'inline-block';
    elements.quizModeBtn.style.display = 'inline-block';

    updateDisplay();

    console.log('Game started');
}

function handleLetterClick(e, letter) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    // Mark as learned
    gameState.learnedLetters.add(letter);

    // Update card appearance
    const card = e.currentTarget;
    card.classList.add('learned');

    // Show sound
    showSound(letter);

    // Update display
    updateDisplay();
}

function showSound(letter) {
    const bubble = elements.soundBubble;
    bubble.textContent = `${letter} says "${CONFIG.sounds[letter]}"`;
    bubble.classList.add('show');

    setTimeout(() => {
        bubble.classList.remove('show');
    }, 1500);
}

function handleModeSwitch(e, mode) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    if (mode === 'quiz') {
        startQuiz();
    } else {
        gameState.currentMode = 'practice';
    }
}

function startQuiz() {
    if (gameState.learnedLetters.size === 0) {
        showSound('Learn some letters first!');
        return;
    }

    gameState.currentMode = 'quiz';

    // Pick a random learned letter
    const learned = Array.from(gameState.learnedLetters);
    const targetLetter = learned[randomInt(0, learned.length - 1)];

    // Show quiz question
    elements.quizQuestion.textContent = `Find the letter that says "${CONFIG.sounds[targetLetter]}"`;

    // Create options (target + 5 random letters)
    const options = new Set([targetLetter]);
    while (options.size < 6) {
        options.add(CONFIG.alphabet[randomInt(0, CONFIG.alphabet.length - 1)]);
    }

    const optionsArray = shuffleArray(Array.from(options));

    // Clear previous options
    elements.quizOptions.innerHTML = '';

    // Create option buttons
    optionsArray.forEach(letter => {
        const btn = document.createElement('div');
        btn.className = 'quiz-option';
        btn.textContent = letter;
        btn.addEventListener('touchstart', (e) => handleQuizAnswer(e, letter, targetLetter));
        btn.addEventListener('click', (e) => handleQuizAnswer(e, letter, targetLetter));
        elements.quizOptions.appendChild(btn);
    });

    elements.quizOverlay.style.display = 'flex';
}

function handleQuizAnswer(e, selected, correct) {
    e.preventDefault();

    const btn = e.currentTarget;
    const isCorrect = selected === correct;

    if (isCorrect) {
        btn.classList.add('correct');
        setTimeout(() => {
            elements.quizOverlay.style.display = 'none';
            showSound(correct);
        }, 1000);
    } else {
        btn.classList.add('incorrect');
        // Show correct answer
        const allOptions = elements.quizOptions.querySelectorAll('.quiz-option');
        allOptions.forEach(option => {
            if (option.textContent === correct) {
                option.classList.add('correct');
            }
        });

        setTimeout(() => {
            elements.quizOverlay.style.display = 'none';
        }, 2000);
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplay() {
    elements.lettersLearnedDisplay.textContent = `${gameState.learnedLetters.size}/26`;
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
