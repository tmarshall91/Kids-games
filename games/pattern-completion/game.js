'use strict';

// === Configuration ===
const CONFIG = {
    patternsPerGame: 10,
    feedbackDelay: 1500
};

// === Pattern Templates ===
const PATTERN_TYPES = [
    {
        type: 'shapes',
        items: ['⭐', '⚫', '🔷', '❤️', '🔺', '⬛']
    },
    {
        type: 'colors',
        items: ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠']
    },
    {
        type: 'animals',
        items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊']
    },
    {
        type: 'fruits',
        items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉']
    }
];

// === State Management ===
let gameState = {
    score: 0,
    level: 1,
    currentPattern: null,
    correctAnswer: null,
    isProcessing: false,
    patternsCompleted: 0
};

// === DOM References ===
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    gameComplete: document.getElementById('gameComplete'),
    controls: document.getElementById('controls'),
    startBtn: document.getElementById('startBtn'),
    skipBtn: document.getElementById('skipBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    patternDisplay: document.getElementById('patternDisplay'),
    choicesContainer: document.getElementById('choicesContainer'),
    feedback: document.getElementById('feedback'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    finalScore: document.getElementById('finalScore')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.skipBtn.addEventListener('click', skipPattern);
    elements.skipBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        skipPattern();
    });

    elements.playAgainBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startGame();
    });
}

// === Game Start ===
function startGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.patternsCompleted = 0;

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    elements.controls.style.display = 'flex';
    elements.gameComplete.style.display = 'none';

    updateStats();
    nextPattern();
}

// === Generate Pattern ===
function nextPattern() {
    if (gameState.patternsCompleted >= CONFIG.patternsPerGame) {
        endGame();
        return;
    }

    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    gameState.isProcessing = false;

    // Select random pattern type
    const patternType = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
    const items = [...patternType.items];

    // Generate pattern based on level
    let pattern = [];
    let patternLength = Math.min(4 + Math.floor(gameState.level / 2), 8);

    if (gameState.level <= 3) {
        // Simple repeating pattern (A, B, A, B, ...)
        const itemA = items[Math.floor(Math.random() * items.length)];
        const itemB = items.filter(i => i !== itemA)[Math.floor(Math.random() * (items.length - 1))];

        for (let i = 0; i < patternLength; i++) {
            pattern.push(i % 2 === 0 ? itemA : itemB);
        }
        gameState.correctAnswer = patternLength % 2 === 0 ? itemA : itemB;

    } else if (gameState.level <= 6) {
        // Three-item pattern (A, B, C, A, B, C, ...)
        const itemA = items[Math.floor(Math.random() * items.length)];
        const itemB = items.filter(i => i !== itemA)[Math.floor(Math.random() * (items.length - 1))];
        const remainingItems = items.filter(i => i !== itemA && i !== itemB);
        const itemC = remainingItems[Math.floor(Math.random() * remainingItems.length)];

        for (let i = 0; i < patternLength; i++) {
            pattern.push([itemA, itemB, itemC][i % 3]);
        }
        gameState.correctAnswer = [itemA, itemB, itemC][patternLength % 3];

    } else {
        // Complex pattern (A, A, B, A, A, B, ...)
        const itemA = items[Math.floor(Math.random() * items.length)];
        const itemB = items.filter(i => i !== itemA)[Math.floor(Math.random() * (items.length - 1))];

        for (let i = 0; i < patternLength; i++) {
            pattern.push((i % 3 === 2) ? itemB : itemA);
        }
        gameState.correctAnswer = ((patternLength % 3) === 2) ? itemB : itemA;
    }

    gameState.currentPattern = pattern;

    renderPattern();
    renderChoices(patternType.items);
}

// === Render Pattern ===
function renderPattern() {
    elements.patternDisplay.innerHTML = '';

    gameState.currentPattern.forEach(item => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        div.textContent = item;
        elements.patternDisplay.appendChild(div);
    });
}

// === Render Choices ===
function renderChoices(allItems) {
    elements.choicesContainer.innerHTML = '';

    // Create choices: correct answer + 2-3 random wrong answers
    const choices = [gameState.correctAnswer];
    const wrongItems = allItems.filter(item => item !== gameState.correctAnswer);

    // Add 2-3 random wrong answers
    const numWrong = Math.min(3, wrongItems.length);
    for (let i = 0; i < numWrong; i++) {
        const randomWrong = wrongItems[Math.floor(Math.random() * wrongItems.length)];
        if (!choices.includes(randomWrong)) {
            choices.push(randomWrong);
        }
    }

    // Shuffle choices
    shuffleArray(choices);

    // Render choice buttons
    choices.forEach(choice => {
        const btn = document.createElement('div');
        btn.className = 'choice-btn';
        btn.textContent = choice;

        btn.addEventListener('click', () => handleChoice(choice, btn));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleChoice(choice, btn);
        });

        elements.choicesContainer.appendChild(btn);
    });
}

// === Handle Choice ===
function handleChoice(choice, btn) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;

    const isCorrect = choice === gameState.correctAnswer;

    if (isCorrect) {
        btn.classList.add('correct');
        elements.feedback.textContent = '✓ Correct!';
        elements.feedback.className = 'feedback correct';
        gameState.score += 10;
        gameState.level = Math.floor(gameState.patternsCompleted / 2) + 1;
    } else {
        btn.classList.add('wrong');
        elements.feedback.textContent = '✗ Try Again!';
        elements.feedback.className = 'feedback wrong';

        // Highlight correct answer
        setTimeout(() => {
            const allBtns = elements.choicesContainer.querySelectorAll('.choice-btn');
            allBtns.forEach(b => {
                if (b.textContent === gameState.correctAnswer) {
                    b.classList.add('correct');
                }
            });
        }, 500);
    }

    updateStats();

    // Move to next pattern
    setTimeout(() => {
        gameState.patternsCompleted++;
        nextPattern();
    }, CONFIG.feedbackDelay);
}

// === Skip Pattern ===
function skipPattern() {
    if (gameState.isProcessing) return;

    gameState.patternsCompleted++;
    nextPattern();
}

// === Game End ===
function endGame() {
    elements.finalScore.textContent = gameState.score;

    elements.gameArea.style.display = 'none';
    elements.controls.style.display = 'none';
    elements.gameComplete.style.display = 'block';
}

// === UI Updates ===
function updateStats() {
    elements.score.textContent = gameState.score;
    elements.level.textContent = gameState.level;
}

// === Utility Functions ===
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
