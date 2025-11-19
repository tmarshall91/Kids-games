'use strict';

// === Configuration ===
const CONFIG = {
    words: [
        'ELEPHANT', 'GIRAFFE', 'MONKEY', 'TIGER', 'RABBIT',
        'DOLPHIN', 'PENGUIN', 'LION', 'ZEBRA', 'KANGAROO',
        'BUTTERFLY', 'SQUIRREL', 'TURTLE', 'FLAMINGO', 'PANDA'
    ],
    maxWrong: 6,
    bodyParts: ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg']
};

// === State Management ===
let gameState = {
    word: '',
    guessedLetters: [],
    wrongGuesses: 0,
    score: 0,
    isPlaying: false
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    livesDisplay: document.getElementById('lives'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    wordDisplay: document.getElementById('wordDisplay'),
    category: document.getElementById('category'),
    keyboard: document.getElementById('keyboard'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalWord: document.getElementById('finalWord'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    resultTitle: document.getElementById('resultTitle')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    createKeyboard();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

function createKeyboard() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    elements.keyboard.innerHTML = '';

    letters.forEach(letter => {
        const key = document.createElement('button');
        key.className = 'key';
        key.textContent = letter;
        key.dataset.letter = letter;
        key.addEventListener('touchstart', (e) => handleGuess(e, letter));
        key.addEventListener('click', (e) => handleGuess(e, letter));
        elements.keyboard.appendChild(key);
    });
}

// === Event Handlers ===
function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    resetGame();
    startGame();
}

function handleGuess(e, letter) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.guessedLetters.includes(letter)) return;

    gameState.guessedLetters.push(letter);
    const key = e.currentTarget;

    if (gameState.word.includes(letter)) {
        // Correct guess
        key.classList.add('correct');
        key.disabled = true;
        updateWordDisplay();
        checkWin();
    } else {
        // Wrong guess
        key.classList.add('wrong');
        key.disabled = true;
        gameState.wrongGuesses++;
        updateHangman();
        updateLives();
        checkLose();
    }
}

// === Game Logic ===
function startGame() {
    gameState.isPlaying = true;
    gameState.word = CONFIG.words[Math.floor(Math.random() * CONFIG.words.length)];
    gameState.guessedLetters = [];
    gameState.wrongGuesses = 0;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.keyboard.style.display = 'grid';
    elements.wordDisplay.style.display = 'flex';
    elements.category.style.display = 'block';

    updateWordDisplay();
    updateLives();
    resetHangman();
    resetKeyboard();
}

function resetGame() {
    gameState.wrongGuesses = 0;
    gameState.guessedLetters = [];
    resetHangman();
    resetKeyboard();
}

function resetKeyboard() {
    const keys = elements.keyboard.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct', 'wrong');
        key.disabled = false;
    });
}

function resetHangman() {
    CONFIG.bodyParts.forEach(part => {
        document.getElementById(part).style.display = 'none';
    });
}

function updateWordDisplay() {
    elements.wordDisplay.innerHTML = '';
    for (let letter of gameState.word) {
        const box = document.createElement('div');
        box.className = 'letter-box';
        box.textContent = gameState.guessedLetters.includes(letter) ? letter : '';
        elements.wordDisplay.appendChild(box);
    }
}

function updateLives() {
    elements.livesDisplay.textContent = CONFIG.maxWrong - gameState.wrongGuesses;
}

function updateHangman() {
    if (gameState.wrongGuesses > 0 && gameState.wrongGuesses <= CONFIG.bodyParts.length) {
        const part = CONFIG.bodyParts[gameState.wrongGuesses - 1];
        document.getElementById(part).style.display = 'block';
    }
}

function checkWin() {
    const allLettersGuessed = gameState.word.split('').every(letter =>
        gameState.guessedLetters.includes(letter)
    );

    if (allLettersGuessed) {
        setTimeout(() => gameWon(), 500);
    }
}

function checkLose() {
    if (gameState.wrongGuesses >= CONFIG.maxWrong) {
        setTimeout(() => gameLost(), 500);
    }
}

function gameWon() {
    gameState.isPlaying = false;
    gameState.score += 10;
    elements.scoreDisplay.textContent = gameState.score;
    showGameOver(true);
}

function gameLost() {
    gameState.isPlaying = false;
    showGameOver(false);
}

function showGameOver(won) {
    elements.resultTitle.textContent = won ? 'You Won!' : 'Game Over!';
    elements.resultTitle.className = won ? 'won' : 'lost';
    elements.finalWord.textContent = gameState.word;
    elements.finalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
