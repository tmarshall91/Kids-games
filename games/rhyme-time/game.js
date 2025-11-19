'use strict';

// Configuration with rhyming word pairs and non-rhyming distractors
const CONFIG = {
    rhymeSets: [
        {
            target: 'CAT',
            rhymes: 'HAT',
            distractors: ['DOG', 'SUN', 'TREE']
        },
        {
            target: 'DOG',
            rhymes: 'FROG',
            distractors: ['CAT', 'MOON', 'STAR']
        },
        {
            target: 'BEE',
            rhymes: 'TREE',
            distractors: ['BIRD', 'FISH', 'ROCK']
        },
        {
            target: 'MOON',
            rhymes: 'SPOON',
            distractors: ['SUN', 'CLOUD', 'RAIN']
        },
        {
            target: 'FISH',
            rhymes: 'DISH',
            distractors: ['BEAR', 'DUCK', 'GOAT']
        },
        {
            target: 'FOX',
            rhymes: 'BOX',
            distractors: ['WOLF', 'DEER', 'MICE']
        },
        {
            target: 'BEAR',
            rhymes: 'CHAIR',
            distractors: ['LION', 'SEAL', 'HAWK']
        },
        {
            target: 'STAR',
            rhymes: 'CAR',
            distractors: ['BIKE', 'SHIP', 'KITE']
        },
        {
            target: 'SNAKE',
            rhymes: 'CAKE',
            distractors: ['FROG', 'WORM', 'BIRD']
        },
        {
            target: 'KING',
            rhymes: 'RING',
            distractors: ['CROWN', 'SWORD', 'CAPE']
        },
        {
            target: 'BOAT',
            rhymes: 'COAT',
            distractors: ['SHIP', 'SAIL', 'WAVE']
        },
        {
            target: 'LIGHT',
            rhymes: 'KITE',
            distractors: ['LAMP', 'GLOW', 'BEAM']
        }
    ],
    roundsPerGame: 10,
    choicesPerRound: 4
};

// Game state
let gameState = {
    score: 0,
    round: 1,
    isPlaying: false,
    usedSets: [],
    currentSet: null,
    currentChoices: [],
    answerSelected: false
};

// DOM element references
const elements = {
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    targetWord: document.getElementById('targetWord'),
    choicesContainer: document.getElementById('choicesContainer'),
    feedback: document.getElementById('feedback'),
    gameMessage: document.getElementById('gameMessage'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    starRating: document.getElementById('starRating'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// Initialize game
function initGame() {
    setupEventListeners();
    hideGameElements();
}

// Setup event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
    elements.nextBtn.addEventListener('touchstart', handleNext);
    elements.nextBtn.addEventListener('click', handleNext);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// Handle start button
function handleStart(e) {
    e.preventDefault();
    startGame();
}

// Handle next button
function handleNext(e) {
    e.preventDefault();
    nextRound();
}

// Handle restart button
function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    resetGameState();
    startGame();
}

// Reset game state
function resetGameState() {
    gameState = {
        score: 0,
        round: 1,
        isPlaying: false,
        usedSets: [],
        currentSet: null,
        currentChoices: [],
        answerSelected: false
    };
    elements.scoreDisplay.textContent = '0';
    elements.roundDisplay.textContent = '1/10';
}

// Start game
function startGame() {
    gameState.isPlaying = true;
    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    showGameElements();
    loadNewRound();
}

// Show game elements
function showGameElements() {
    elements.targetWord.parentElement.style.display = 'block';
    elements.choicesContainer.style.display = 'grid';
}

// Hide game elements
function hideGameElements() {
    elements.targetWord.parentElement.style.display = 'none';
    elements.choicesContainer.style.display = 'none';
}

// Load new round
function loadNewRound() {
    gameState.answerSelected = false;
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.nextBtn.style.display = 'none';

    // Get available sets
    let availableSets = CONFIG.rhymeSets.filter((_, index) => !gameState.usedSets.includes(index));

    if (availableSets.length === 0) {
        gameState.usedSets = [];
        availableSets = CONFIG.rhymeSets;
    }

    // Select random set
    const randomIndex = Math.floor(Math.random() * availableSets.length);
    gameState.currentSet = availableSets[randomIndex];
    const setIndex = CONFIG.rhymeSets.findIndex(set => set === gameState.currentSet);
    gameState.usedSets.push(setIndex);

    // Display target word
    elements.targetWord.textContent = gameState.currentSet.target;
    elements.roundDisplay.textContent = `${gameState.round}/${CONFIG.roundsPerGame}`;

    // Generate and display choices
    generateChoices();
    displayChoices();
}

// Generate random choices (1 correct + 3 distractors)
function generateChoices() {
    const choices = [gameState.currentSet.rhymes];

    // Add random distractors
    const shuffledDistractors = [...gameState.currentSet.distractors].sort(() => Math.random() - 0.5);
    const numDistractors = Math.min(CONFIG.choicesPerRound - 1, shuffledDistractors.length);

    for (let i = 0; i < numDistractors; i++) {
        choices.push(shuffledDistractors[i]);
    }

    // Shuffle choices
    gameState.currentChoices = choices.sort(() => Math.random() - 0.5);
}

// Display choices as buttons
function displayChoices() {
    elements.choicesContainer.innerHTML = '';

    gameState.currentChoices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice;
        button.dataset.word = choice;

        // Add event listeners for both touch and click
        button.addEventListener('touchstart', (e) => handleChoiceClick(e, choice));
        button.addEventListener('click', (e) => handleChoiceClick(e, choice));

        elements.choicesContainer.appendChild(button);
    });
}

// Handle choice button click
function handleChoiceClick(e, choice) {
    e.preventDefault();

    if (!gameState.isPlaying || gameState.answerSelected) {
        return;
    }

    gameState.answerSelected = true;
    const isCorrect = choice === gameState.currentSet.rhymes;

    // Get all choice buttons
    const buttons = elements.choicesContainer.querySelectorAll('.choice-btn');

    // Mark the selected button and show correct answer
    buttons.forEach(button => {
        const buttonWord = button.dataset.word;

        if (buttonWord === choice) {
            // Mark selected button
            if (isCorrect) {
                button.classList.add('correct');
            } else {
                button.classList.add('wrong');
            }
        }

        // Always highlight the correct answer
        if (buttonWord === gameState.currentSet.rhymes) {
            button.classList.add('correct');
        }

        // Disable all buttons
        button.classList.add('disabled');
    });

    // Update score and feedback
    if (isCorrect) {
        gameState.score++;
        elements.scoreDisplay.textContent = gameState.score;
        elements.feedback.textContent = 'Great job! They rhyme!';
        elements.feedback.className = 'feedback correct';
    } else {
        elements.feedback.textContent = `Oops! ${gameState.currentSet.rhymes} rhymes with ${gameState.currentSet.target}`;
        elements.feedback.className = 'feedback wrong';
    }

    // Show next button or end game
    if (gameState.round >= CONFIG.roundsPerGame) {
        setTimeout(endGame, 2000);
    } else {
        elements.nextBtn.style.display = 'inline-block';
    }
}

// Next round
function nextRound() {
    gameState.round++;
    loadNewRound();
}

// End game
function endGame() {
    gameState.isPlaying = false;
    elements.finalScore.textContent = `${gameState.score}/${CONFIG.roundsPerGame}`;

    // Display star rating based on score
    const stars = getStarRating(gameState.score);
    elements.starRating.textContent = stars;

    elements.gameOverOverlay.style.display = 'flex';
}

// Get star rating based on score
function getStarRating(score) {
    const percentage = (score / CONFIG.roundsPerGame) * 100;

    if (percentage >= 90) {
        return '⭐⭐⭐';
    } else if (percentage >= 70) {
        return '⭐⭐';
    } else if (percentage >= 50) {
        return '⭐';
    } else {
        return '✨ Keep practicing!';
    }
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
