'use strict';

const CONFIG = {
    animals: [
        { name: 'Dog', emoji: '🐕', sound: 'Woof!' },
        { name: 'Cat', emoji: '🐈', sound: 'Meow!' },
        { name: 'Cow', emoji: '🐄', sound: 'Moo!' },
        { name: 'Pig', emoji: '🐷', sound: 'Oink!' },
        { name: 'Duck', emoji: '🦆', sound: 'Quack!' },
        { name: 'Sheep', emoji: '🐑', sound: 'Baa!' },
        { name: 'Horse', emoji: '🐴', sound: 'Neigh!' },
        { name: 'Lion', emoji: '🦁', sound: 'Roar!' },
        { name: 'Chicken', emoji: '🐔', sound: 'Cluck!' },
        { name: 'Frog', emoji: '🐸', sound: 'Ribbit!' },
        { name: 'Bee', emoji: '🐝', sound: 'Buzz!' },
        { name: 'Bird', emoji: '🐦', sound: 'Tweet!' }
    ]
};

let gameState = {
    score: 0,
    isPlaying: false,
    mode: 'explore',
    currentAnimal: null,
};

const elements = {
    startBtn: document.getElementById('startBtn'),
    exploreBtn: document.getElementById('exploreBtn'),
    quizBtn: document.getElementById('quizBtn'),
    continueBtn: document.getElementById('continueBtn'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    animalGrid: document.getElementById('animalGrid'),
    soundDisplay: document.getElementById('soundDisplay'),
    quizMode: document.getElementById('quizMode'),
    soundQuestion: document.getElementById('soundQuestion'),
    quizAnimals: document.getElementById('quizAnimals'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackAnimal: document.getElementById('feedbackAnimal'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

function initGame() {
    console.log('Animal Sounds Game initialized');
    setupEventListeners();
    createAnimalGrid();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.exploreBtn.addEventListener('touchstart', (e) => handleModeSwitch(e, 'explore'));
    elements.exploreBtn.addEventListener('click', (e) => handleModeSwitch(e, 'explore'));
    elements.quizBtn.addEventListener('touchstart', (e) => handleModeSwitch(e, 'quiz'));
    elements.quizBtn.addEventListener('click', (e) => handleModeSwitch(e, 'quiz'));
    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);
}

function createAnimalGrid() {
    CONFIG.animals.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'animal-card';

        const emoji = document.createElement('div');
        emoji.className = 'animal-emoji';
        emoji.textContent = animal.emoji;

        const name = document.createElement('div');
        name.className = 'animal-name';
        name.textContent = animal.name;

        const sound = document.createElement('div');
        sound.className = 'animal-sound-text';
        sound.textContent = animal.sound;

        card.appendChild(emoji);
        card.appendChild(name);
        card.appendChild(sound);

        card.addEventListener('touchstart', (e) => handleAnimalClick(e, animal));
        card.addEventListener('click', (e) => handleAnimalClick(e, animal));

        elements.animalGrid.appendChild(card);
    });
}

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    elements.gameMessage.style.display = 'none';
    elements.gameContent.style.display = 'block';
    elements.exploreBtn.style.display = 'inline-block';
    elements.quizBtn.style.display = 'inline-block';
    updateDisplay();
}

function handleAnimalClick(e, animal) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.mode !== 'explore') return;

    showAnimalSound(animal);
}

function showAnimalSound(animal) {
    elements.soundDisplay.innerHTML = `
        <div class="sound-emoji">${animal.emoji}</div>
        <div class="sound-text">${animal.sound}</div>
        <div class="sound-name">${animal.name}</div>
    `;
    elements.soundDisplay.classList.add('show');

    setTimeout(() => {
        elements.soundDisplay.classList.remove('show');
    }, 2000);
}

function handleModeSwitch(e, mode) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    gameState.mode = mode;

    if (mode === 'explore') {
        elements.gameContent.style.display = 'block';
        elements.quizMode.style.display = 'none';
    } else {
        startQuiz();
    }
}

function startQuiz() {
    elements.gameContent.style.display = 'none';
    elements.quizMode.style.display = 'block';

    const targetAnimal = CONFIG.animals[randomInt(0, CONFIG.animals.length - 1)];
    gameState.currentAnimal = targetAnimal;

    elements.soundQuestion.textContent = `"${targetAnimal.sound}"`;

    const options = shuffleArray([...CONFIG.animals]).slice(0, 4);
    if (!options.find(a => a.name === targetAnimal.name)) {
        options[randomInt(0, 3)] = targetAnimal;
    }

    elements.quizAnimals.innerHTML = '';
    options.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'quiz-animal-card';

        const emoji = document.createElement('div');
        emoji.className = 'animal-emoji';
        emoji.textContent = animal.emoji;

        const name = document.createElement('div');
        name.className = 'animal-name';
        name.textContent = animal.name;

        card.appendChild(emoji);
        card.appendChild(name);

        card.addEventListener('touchstart', (e) => handleQuizAnswer(e, animal));
        card.addEventListener('click', (e) => handleQuizAnswer(e, animal));

        elements.quizAnimals.appendChild(card);
    });
}

function handleQuizAnswer(e, selectedAnimal) {
    e.preventDefault();
    const card = e.currentTarget;
    const isCorrect = selectedAnimal.name === gameState.currentAnimal.name;

    const allCards = elements.quizAnimals.querySelectorAll('.quiz-animal-card');
    allCards.forEach(c => c.style.pointerEvents = 'none');

    if (isCorrect) {
        card.classList.add('correct');
        gameState.score += 10;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎉 Correct!';
        elements.feedbackAnimal.textContent = selectedAnimal.emoji;
        elements.feedbackMessage.textContent = `Yes! The ${selectedAnimal.name} says "${selectedAnimal.sound}"`;
    } else {
        card.classList.add('incorrect');
        elements.feedbackTitle.textContent = '💡 Try Again!';
        elements.feedbackAnimal.textContent = gameState.currentAnimal.emoji;
        elements.feedbackMessage.textContent = `The ${gameState.currentAnimal.name} says "${gameState.currentAnimal.sound}"`;
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
    startQuiz();
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
