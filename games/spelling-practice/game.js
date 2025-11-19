'use strict';

const CONFIG = {
    words: [
        { emoji: '🐱', word: 'CAT' },
        { emoji: '🐶', word: 'DOG' },
        { emoji: '🐟', word: 'FISH' },
        { emoji: '🐻', word: 'BEAR' },
        { emoji: '🦁', word: 'LION' },
        { emoji: '🐘', word: 'ELEPHANT' },
        { emoji: '🦒', word: 'GIRAFFE' },
        { emoji: '🐵', word: 'MONKEY' },
        { emoji: '🦓', word: 'ZEBRA' },
        { emoji: '🐧', word: 'PENGUIN' }
    ]
};

let gameState = {
    currentWordIndex: 0,
    currentAnswer: [],
    score: 0,
    round: 1,
    isPlaying: false,
    usedWords: []
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    checkBtn: document.getElementById('checkBtn'),
    clearBtn: document.getElementById('clearBtn'),
    nextBtn: document.getElementById('nextBtn'),
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    picture: document.getElementById('picture'),
    hint: document.getElementById('hint'),
    letterBoxes: document.getElementById('letterBoxes'),
    keyboard: document.getElementById('keyboard'),
    gameMessage: document.getElementById('gameMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

function initGame() {
    setupEventListeners();
    createKeyboard();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.checkBtn.addEventListener('touchstart', checkAnswer);
    elements.checkBtn.addEventListener('click', checkAnswer);
    elements.clearBtn.addEventListener('touchstart', clearAnswer);
    elements.clearBtn.addEventListener('click', clearAnswer);
    elements.nextBtn.addEventListener('touchstart', nextWord);
    elements.nextBtn.addEventListener('click', nextWord);
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
        key.addEventListener('touchstart', (e) => handleLetterClick(e, letter));
        key.addEventListener('click', (e) => handleLetterClick(e, letter));
        elements.keyboard.appendChild(key);
    });
}

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    gameState = {
        currentWordIndex: 0,
        currentAnswer: [],
        score: 0,
        round: 1,
        isPlaying: false,
        usedWords: []
    };
    elements.scoreDisplay.textContent = '0';
    startGame();
}

function startGame() {
    gameState.isPlaying = true;
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.checkBtn.style.display = 'inline-block';
    elements.clearBtn.style.display = 'inline-block';
    elements.keyboard.style.display = 'grid';

    loadNewWord();
}

function loadNewWord() {
    let availableWords = CONFIG.words.filter((_, index) => !gameState.usedWords.includes(index));

    if (availableWords.length === 0) {
        gameState.usedWords = [];
        availableWords = CONFIG.words;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    gameState.currentWordIndex = CONFIG.words.findIndex(w => w === availableWords[randomIndex]);
    gameState.usedWords.push(gameState.currentWordIndex);
    gameState.currentAnswer = [];

    const currentWord = CONFIG.words[gameState.currentWordIndex];
    elements.picture.textContent = currentWord.emoji;
    elements.picture.style.animation = 'none';
    setTimeout(() => elements.picture.style.animation = 'bounce 1s ease', 10);

    createLetterBoxes(currentWord.word.length);
    resetKeyboard();

    elements.checkBtn.style.display = 'inline-block';
    elements.nextBtn.style.display = 'none';
    elements.roundDisplay.textContent = `${gameState.round}/10`;
}

function createLetterBoxes(count) {
    elements.letterBoxes.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const box = document.createElement('div');
        box.className = 'letter-box';
        elements.letterBoxes.appendChild(box);
    }
}

function handleLetterClick(e, letter) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const currentWord = CONFIG.words[gameState.currentWordIndex].word;
    if (gameState.currentAnswer.length < currentWord.length) {
        gameState.currentAnswer.push(letter);
        updateLetterBoxes();
    }
}

function updateLetterBoxes() {
    const boxes = elements.letterBoxes.querySelectorAll('.letter-box');
    boxes.forEach((box, index) => {
        if (index < gameState.currentAnswer.length) {
            box.textContent = gameState.currentAnswer[index];
            box.classList.add('filled');
        } else {
            box.textContent = '';
            box.classList.remove('filled');
        }
    });
}

function clearAnswer(e) {
    e.preventDefault();
    gameState.currentAnswer = [];
    updateLetterBoxes();
    const boxes = elements.letterBoxes.querySelectorAll('.letter-box');
    boxes.forEach(box => {
        box.classList.remove('correct', 'wrong');
    });
}

function checkAnswer(e) {
    e.preventDefault();
    const currentWord = CONFIG.words[gameState.currentWordIndex].word;
    const answer = gameState.currentAnswer.join('');
    const boxes = elements.letterBoxes.querySelectorAll('.letter-box');

    if (answer === currentWord) {
        gameState.score++;
        elements.scoreDisplay.textContent = gameState.score;
        boxes.forEach(box => box.classList.add('correct'));
    } else {
        boxes.forEach(box => box.classList.add('wrong'));
    }

    elements.checkBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.nextBtn.style.display = 'inline-block';
    disableKeyboard();

    if (gameState.round >= 10) {
        setTimeout(endGame, 1500);
    }
}

function nextWord(e) {
    e.preventDefault();
    gameState.round++;
    if (gameState.round <= 10) {
        loadNewWord();
        elements.clearBtn.style.display = 'inline-block';
    }
}

function resetKeyboard() {
    const keys = elements.keyboard.querySelectorAll('.key');
    keys.forEach(key => key.disabled = false);
}

function disableKeyboard() {
    const keys = elements.keyboard.querySelectorAll('.key');
    keys.forEach(key => key.disabled = true);
}

function endGame() {
    gameState.isPlaying = false;
    elements.finalScore.textContent = `${gameState.score}`;
    elements.gameOverOverlay.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', initGame);
