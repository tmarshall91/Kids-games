'use strict';

// === Configuration ===
const CONFIG = {
    roundsPerGame: 10,
    feedbackDelay: 1500,
    hintCooldown: 10000
};

// === Scene Templates ===
const SCENE_THEMES = [
    {
        name: 'Farm Animals',
        items: ['🐄', '🐷', '🐑', '🐔', '🐴', '🦆']
    },
    {
        name: 'Fruits',
        items: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍉']
    },
    {
        name: 'Vehicles',
        items: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️']
    },
    {
        name: 'Ocean',
        items: ['🐠', '🐟', '🐡', '🦈', '🐙', '🦀']
    },
    {
        name: 'Weather',
        items: ['☀️', '🌙', '⭐', '☁️', '🌈', '⚡']
    },
    {
        name: 'Sports',
        items: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐']
    }
];

// === State Management ===
let gameState = {
    score: 0,
    round: 1,
    completeScene: [],
    missingItem: null,
    isProcessing: false,
    lastHintTime: 0
};

// === DOM References ===
const elements = {
    instructions: document.getElementById('instructions'),
    gameArea: document.getElementById('gameArea'),
    gameComplete: document.getElementById('gameComplete'),
    controls: document.getElementById('controls'),
    startBtn: document.getElementById('startBtn'),
    hintBtn: document.getElementById('hintBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    completeScene: document.getElementById('completeScene'),
    incompleteScene: document.getElementById('incompleteScene'),
    choicesContainer: document.getElementById('choicesContainer'),
    feedback: document.getElementById('feedback'),
    score: document.getElementById('score'),
    round: document.getElementById('round'),
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

    elements.hintBtn.addEventListener('click', showHint);
    elements.hintBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showHint();
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
    gameState.round = 1;
    gameState.lastHintTime = 0;

    // Hide instructions, show game
    elements.instructions.style.display = 'none';
    elements.gameArea.style.display = 'flex';
    elements.controls.style.display = 'flex';
    elements.gameComplete.style.display = 'none';

    updateStats();
    nextRound();
}

// === Next Round ===
function nextRound() {
    if (gameState.round > CONFIG.roundsPerGame) {
        endGame();
        return;
    }

    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    gameState.isProcessing = false;

    // Select random theme
    const theme = SCENE_THEMES[Math.floor(Math.random() * SCENE_THEMES.length)];

    // Select 4-5 items for the scene
    const numItems = 4 + Math.floor(Math.random() * 2);
    const selectedItems = [...theme.items].sort(() => Math.random() - 0.5).slice(0, numItems);

    // Select one item to be missing
    const missingIndex = Math.floor(Math.random() * selectedItems.length);
    gameState.missingItem = selectedItems[missingIndex];

    // Create complete scene
    gameState.completeScene = selectedItems;

    // Create incomplete scene (without the missing item)
    const incompleteScene = selectedItems.filter((_, i) => i !== missingIndex);

    renderScenes(gameState.completeScene, incompleteScene);
    renderChoices(theme.items);
    updateStats();
}

// === Render Scenes ===
function renderScenes(completeScene, incompleteScene) {
    // Render complete scene
    elements.completeScene.innerHTML = '';
    completeScene.forEach(item => {
        const div = document.createElement('div');
        div.className = 'scene-item';
        div.textContent = item;
        elements.completeScene.appendChild(div);
    });

    // Render incomplete scene
    elements.incompleteScene.innerHTML = '';
    incompleteScene.forEach(item => {
        const div = document.createElement('div');
        div.className = 'scene-item';
        div.textContent = item;
        elements.incompleteScene.appendChild(div);
    });
}

// === Render Choices ===
function renderChoices(allItems) {
    elements.choicesContainer.innerHTML = '';

    // Create choices: missing item + 2-3 random wrong answers
    const choices = [gameState.missingItem];
    const wrongItems = allItems.filter(item => !gameState.completeScene.includes(item));

    // Add random wrong answers
    const numWrong = Math.min(3, wrongItems.length);
    for (let i = 0; i < numWrong; i++) {
        if (wrongItems[i]) {
            choices.push(wrongItems[i]);
        }
    }

    // Shuffle choices
    shuffleArray(choices);

    // Render choice buttons
    choices.forEach(choice => {
        const btn = document.createElement('div');
        btn.className = 'choice-btn';
        btn.textContent = choice;
        btn.dataset.item = choice;

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

    const isCorrect = choice === gameState.missingItem;

    if (isCorrect) {
        btn.classList.add('correct');
        elements.feedback.textContent = '✓ Correct!';
        elements.feedback.className = 'feedback correct';
        gameState.score++;
    } else {
        btn.classList.add('wrong');
        elements.feedback.textContent = '✗ Wrong! Look again.';
        elements.feedback.className = 'feedback wrong';

        // Highlight correct answer
        setTimeout(() => {
            const allBtns = elements.choicesContainer.querySelectorAll('.choice-btn');
            allBtns.forEach(b => {
                if (b.dataset.item === gameState.missingItem) {
                    b.classList.add('correct');
                }
            });
        }, 500);
    }

    updateStats();

    // Move to next round
    setTimeout(() => {
        gameState.round++;
        nextRound();
    }, CONFIG.feedbackDelay);
}

// === Hint System ===
function showHint() {
    const now = Date.now();
    if (now - gameState.lastHintTime < CONFIG.hintCooldown) {
        const remaining = Math.ceil((CONFIG.hintCooldown - (now - gameState.lastHintTime)) / 1000);
        elements.hintBtn.textContent = `Wait ${remaining}s`;
        return;
    }

    // Highlight the missing item briefly
    const allBtns = elements.choicesContainer.querySelectorAll('.choice-btn');
    allBtns.forEach(btn => {
        if (btn.dataset.item === gameState.missingItem) {
            btn.style.background = 'rgba(255, 235, 59, 0.5)';
            btn.style.borderColor = '#FFC107';

            setTimeout(() => {
                btn.style.background = '';
                btn.style.borderColor = '';
            }, 1500);
        }
    });

    gameState.lastHintTime = now;
    elements.hintBtn.textContent = '💡 Hint';
}

// === Game End ===
function endGame() {
    elements.finalScore.textContent = `${gameState.score}/${CONFIG.roundsPerGame}`;

    elements.gameArea.style.display = 'none';
    elements.controls.style.display = 'none';
    elements.gameComplete.style.display = 'block';
}

// === UI Updates ===
function updateStats() {
    elements.score.textContent = gameState.score;
    elements.round.textContent = gameState.round;
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
