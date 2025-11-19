'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const FARM_ANIMALS = [
    {emoji: '🐄', name: 'Cow', sound: 'Moo!'},
    {emoji: '🐷', name: 'Pig', sound: 'Oink!'},
    {emoji: '🐔', name: 'Chicken', sound: 'Cluck!'},
    {emoji: '🐴', name: 'Horse', sound: 'Neigh!'},
    {emoji: '🐑', name: 'Sheep', sound: 'Baa!'},
    {emoji: '🐐', name: 'Goat', sound: 'Meh!'},
    {emoji: '🦆', name: 'Duck', sound: 'Quack!'},
    {emoji: '🐕', name: 'Dog', sound: 'Woof!'},
    {emoji: '🐈', name: 'Cat', sound: 'Meow!'},
    {emoji: '🐓', name: 'Rooster', sound: 'Cock-a-doodle-doo!'}
];

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    mode: 'freePlay', // 'freePlay' or 'quiz'
    quizScore: 0,
    questionNumber: 0,
    currentQuestion: null,
    usedQuestions: []
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    animalsGrid: document.getElementById('animalsGrid'),
    soundBubble: document.getElementById('soundBubble'),
    freePlayBtn: document.getElementById('freePlayBtn'),
    quizModeBtn: document.getElementById('quizModeBtn'),
    quizSection: document.getElementById('quizSection'),
    quizSound: document.getElementById('quizSound'),
    quizOptions: document.getElementById('quizOptions'),
    quizScore: document.getElementById('quizScore'),
    questionNumber: document.getElementById('questionNumber'),
    resetBtn: document.getElementById('resetBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    finalScore: document.getElementById('finalScore'),
    percentage: document.getElementById('percentage'),
    quizCompleteOverlay: document.getElementById('quizCompleteOverlay'),
    gameArea: document.getElementById('gameArea')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Farm Animal Sounds initialized');
    setupEventListeners();
    createAnimalCards();
}

function setupEventListeners() {
    elements.freePlayBtn.addEventListener('touchstart', () => switchMode('freePlay'));
    elements.freePlayBtn.addEventListener('click', () => switchMode('freePlay'));
    elements.quizModeBtn.addEventListener('touchstart', () => switchMode('quiz'));
    elements.quizModeBtn.addEventListener('click', () => switchMode('quiz'));
    elements.resetBtn.addEventListener('touchstart', resetQuiz);
    elements.resetBtn.addEventListener('click', resetQuiz);
    elements.playAgainBtn.addEventListener('touchstart', resetQuiz);
    elements.playAgainBtn.addEventListener('click', resetQuiz);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// FREE PLAY MODE
// ==========================================

function createAnimalCards() {
    elements.animalsGrid.innerHTML = '';
    FARM_ANIMALS.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.dataset.sound = animal.sound;

        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = animal.emoji;

        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = animal.name;

        const sound = document.createElement('div');
        sound.className = 'sound';
        sound.textContent = animal.sound;

        card.appendChild(emoji);
        card.appendChild(name);
        card.appendChild(sound);

        card.addEventListener('touchstart', handleAnimalClick);
        card.addEventListener('click', handleAnimalClick);

        elements.animalsGrid.appendChild(card);
    });
}

function handleAnimalClick(e) {
    e.preventDefault();
    const card = e.currentTarget;
    const sound = card.dataset.sound;

    // Play animation
    card.classList.add('playing');
    setTimeout(() => {
        card.classList.remove('playing');
    }, 500);

    // Show sound bubble
    showSoundBubble(sound);
}

function showSoundBubble(sound) {
    elements.soundBubble.textContent = sound;
    elements.soundBubble.style.animation = 'none';
    setTimeout(() => {
        elements.soundBubble.style.animation = 'bubblePop 0.8s ease forwards';
    }, 10);
}

// ==========================================
// MODE SWITCHING
// ==========================================

function switchMode(mode) {
    gameState.mode = mode;

    if (mode === 'freePlay') {
        elements.freePlayBtn.classList.add('active');
        elements.quizModeBtn.classList.remove('active');
        elements.animalsGrid.style.display = 'grid';
        elements.quizSection.style.display = 'none';
        elements.resetBtn.style.display = 'none';
    } else {
        elements.quizModeBtn.classList.add('active');
        elements.freePlayBtn.classList.remove('active');
        elements.animalsGrid.style.display = 'none';
        elements.quizSection.style.display = 'block';
        elements.resetBtn.style.display = 'inline-block';
        startQuiz();
    }
}

// ==========================================
// QUIZ MODE
// ==========================================

function startQuiz() {
    gameState.quizScore = 0;
    gameState.questionNumber = 0;
    gameState.usedQuestions = [];
    updateQuizDisplay();
    nextQuestion();
}

function nextQuestion() {
    // Check if quiz is complete
    if (gameState.questionNumber >= 10) {
        endQuiz();
        return;
    }

    // Get available animals
    const availableAnimals = FARM_ANIMALS.filter(
        animal => !gameState.usedQuestions.includes(animal)
    );

    if (availableAnimals.length === 0) {
        // Reset if we've used all animals
        gameState.usedQuestions = [];
        return nextQuestion();
    }

    // Select random animal
    const correctAnimal = randomItem(availableAnimals);
    gameState.usedQuestions.push(correctAnimal);
    gameState.currentQuestion = correctAnimal;
    gameState.questionNumber++;

    // Display question
    elements.quizSound.textContent = correctAnimal.sound;

    // Create options (correct answer + 3 random wrong answers)
    const options = [correctAnimal];
    const otherAnimals = FARM_ANIMALS.filter(a => a !== correctAnimal);
    while (options.length < 4 && otherAnimals.length > 0) {
        const randomAnimal = otherAnimals.splice(Math.floor(Math.random() * otherAnimals.length), 1)[0];
        options.push(randomAnimal);
    }

    // Shuffle options
    shuffleArray(options);

    // Display options
    elements.quizOptions.innerHTML = '';
    options.forEach(animal => {
        const option = document.createElement('div');
        option.className = 'quiz-option';
        option.textContent = animal.emoji;
        option.dataset.animal = animal.name;

        option.addEventListener('touchstart', (e) => handleQuizAnswer(e, animal));
        option.addEventListener('click', (e) => handleQuizAnswer(e, animal));

        elements.quizOptions.appendChild(option);
    });

    updateQuizDisplay();
}

function handleQuizAnswer(e, selectedAnimal) {
    e.preventDefault();
    const option = e.currentTarget;

    // Disable all options
    const allOptions = elements.quizOptions.querySelectorAll('.quiz-option');
    allOptions.forEach(opt => {
        opt.style.pointerEvents = 'none';
    });

    // Check answer
    if (selectedAnimal === gameState.currentQuestion) {
        // Correct!
        option.classList.add('correct');
        gameState.quizScore++;
        updateQuizDisplay();
    } else {
        // Wrong
        option.classList.add('wrong');
        // Highlight correct answer
        allOptions.forEach(opt => {
            if (opt.dataset.animal === gameState.currentQuestion.name) {
                opt.classList.add('correct');
            }
        });
    }

    // Move to next question after delay
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function endQuiz() {
    const percentage = Math.round((gameState.quizScore / 10) * 100);

    elements.finalScore.textContent = gameState.quizScore;
    elements.percentage.textContent = `${percentage}% correct!`;

    if (percentage === 100) {
        elements.percentage.textContent += ' Perfect score! 🌟';
    } else if (percentage >= 70) {
        elements.percentage.textContent += ' Great job! 👏';
    } else {
        elements.percentage.textContent += ' Keep practicing! 💪';
    }

    elements.quizCompleteOverlay.style.display = 'flex';
}

function resetQuiz(e) {
    if (e) e.preventDefault();
    elements.quizCompleteOverlay.style.display = 'none';
    startQuiz();
}

function updateQuizDisplay() {
    elements.quizScore.textContent = gameState.quizScore;
    elements.questionNumber.textContent = gameState.questionNumber;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get random item from array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
