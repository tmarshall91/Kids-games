'use strict';

const CONFIG = {
    shapes: [
        { name: 'Circle', class: 'circle' },
        { name: 'Square', class: 'square' },
        { name: 'Triangle', class: 'triangle' },
        { name: 'Rectangle', class: 'rectangle' },
        { name: 'Star', class: 'star' },
        { name: 'Heart', class: 'heart' }
    ]
};

let gameState = {
    score: 0,
    isPlaying: false,
    currentShape: null,
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    exploreBtn: document.getElementById('exploreBtn'),
    continueBtn: document.getElementById('continueBtn'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    questionText: document.getElementById('questionText'),
    shapesContainer: document.getElementById('shapesContainer'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackShape: document.getElementById('feedbackShape'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

function initGame() {
    console.log('Shape Recognition Game initialized');
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
    const targetShape = CONFIG.shapes[randomInt(0, CONFIG.shapes.length - 1)];
    gameState.currentShape = targetShape;
    elements.questionText.textContent = `Find the ${targetShape.name}!`;

    const options = shuffleArray([...CONFIG.shapes]).slice(0, 4);
    if (!options.find(s => s.name === targetShape.name)) {
        options[randomInt(0, 3)] = targetShape;
    }

    elements.shapesContainer.innerHTML = '';
    options.forEach(shape => {
        const card = document.createElement('div');
        card.className = 'shape-card';

        const shapeDiv = document.createElement('div');
        shapeDiv.className = `shape ${shape.class}`;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'shape-name';
        nameDiv.textContent = shape.name;

        card.appendChild(shapeDiv);
        card.appendChild(nameDiv);

        card.addEventListener('touchstart', (e) => handleShapeClick(e, shape));
        card.addEventListener('click', (e) => handleShapeClick(e, shape));

        elements.shapesContainer.appendChild(card);
    });
}

function handleShapeClick(e, selectedShape) {
    e.preventDefault();
    const card = e.currentTarget;
    const isCorrect = selectedShape.name === gameState.currentShape.name;

    const allCards = elements.shapesContainer.querySelectorAll('.shape-card');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    if (isCorrect) {
        card.classList.add('correct');
        gameState.score += 10;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎉 Perfect!';
        elements.feedbackShape.innerHTML = `<div class="shape ${selectedShape.class}" style="transform: scale(1.5);"></div>`;
        elements.feedbackMessage.textContent = `You found the ${selectedShape.name}!`;
    } else {
        card.classList.add('incorrect');
        elements.feedbackTitle.textContent = '💡 Try Again!';
        elements.feedbackShape.innerHTML = `<div class="shape ${gameState.currentShape.class}" style="transform: scale(1.5);"></div>`;
        elements.feedbackMessage.textContent = `This is a ${gameState.currentShape.name}!`;
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
