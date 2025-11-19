'use strict';

const CONFIG = {
    colors: [
        { name: 'Red', hex: '#ff0000' },
        { name: 'Blue', hex: '#0000ff' },
        { name: 'Green', hex: '#00ff00' },
        { name: 'Yellow', hex: '#ffff00' },
        { name: 'Orange', hex: '#ff8800' },
        { name: 'Purple', hex: '#8800ff' },
        { name: 'Pink', hex: '#ff69b4' },
        { name: 'Brown', hex: '#8b4513' },
        { name: 'Black', hex: '#000000' },
        { name: 'White', hex: '#ffffff' }
    ]
};

let gameState = {
    score: 0,
    isPlaying: false,
    currentColor: null,
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    backBtn: document.getElementById('backBtn'),
    continueBtn: document.getElementById('continueBtn'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    questionText: document.getElementById('questionText'),
    colorsContainer: document.getElementById('colorsContainer'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackColor: document.getElementById('feedbackColor'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

function initGame() {
    console.log('Color Learning Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);
}

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    elements.gameMessage.style.display = 'none';
    elements.gameContent.style.display = 'flex';
    updateDisplay();
    generateQuestion();
}

function generateQuestion() {
    const targetColor = CONFIG.colors[randomInt(0, CONFIG.colors.length - 1)];
    gameState.currentColor = targetColor;
    elements.questionText.textContent = `Find the ${targetColor.name.toUpperCase()} color!`;

    const options = shuffleArray([...CONFIG.colors]).slice(0, 4);
    if (!options.find(c => c.name === targetColor.name)) {
        options[randomInt(0, 3)] = targetColor;
    }

    elements.colorsContainer.innerHTML = '';
    options.forEach(color => {
        const card = document.createElement('div');
        card.className = 'color-card';
        card.style.background = color.hex;

        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color.hex;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'color-name';
        nameDiv.textContent = color.name;

        card.appendChild(swatch);
        card.appendChild(nameDiv);

        card.addEventListener('touchstart', (e) => handleColorClick(e, color));
        card.addEventListener('click', (e) => handleColorClick(e, color));

        elements.colorsContainer.appendChild(card);
    });
}

function handleColorClick(e, selectedColor) {
    e.preventDefault();
    const card = e.currentTarget;
    const isCorrect = selectedColor.name === gameState.currentColor.name;

    const allCards = elements.colorsContainer.querySelectorAll('.color-card');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    if (isCorrect) {
        card.classList.add('correct');
        gameState.score += 10;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎨 Perfect!';
        elements.feedbackColor.innerHTML = `<div class="feedback-color-swatch" style="background: ${selectedColor.hex};"></div>`;
        elements.feedbackMessage.textContent = `You found ${selectedColor.name}!`;
    } else {
        card.classList.add('incorrect');
        elements.feedbackTitle.textContent = '💡 Try Again!';
        elements.feedbackColor.innerHTML = `<div class="feedback-color-swatch" style="background: ${gameState.currentColor.hex};"></div>`;
        elements.feedbackMessage.textContent = `This is ${gameState.currentColor.name}!`;
    }

    setTimeout(() => {
        elements.feedbackOverlay.style.display = 'flex';
    }, 600);
}

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleContinue(e) {
    e.preventDefault();
    elements.feedbackOverlay.style.display = 'none';
    generateQuestion();
}

function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

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

document.addEventListener('DOMContentLoaded', initGame);
window.addEventListener('contextmenu', (e) => e.preventDefault());
