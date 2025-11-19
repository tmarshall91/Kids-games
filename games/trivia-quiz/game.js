'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const QUESTIONS = [
    {
        category: 'Animals',
        question: 'What sound does a cow make?',
        answers: ['Moo', 'Woof', 'Meow', 'Quack'],
        correct: 0
    },
    {
        category: 'Animals',
        question: 'How many legs does a spider have?',
        answers: ['6', '8', '10', '4'],
        correct: 1
    },
    {
        category: 'Colors',
        question: 'What color do you get when you mix red and blue?',
        answers: ['Green', 'Orange', 'Purple', 'Brown'],
        correct: 2
    },
    {
        category: 'Nature',
        question: 'What do bees make?',
        answers: ['Milk', 'Honey', 'Butter', 'Jam'],
        correct: 1
    },
    {
        category: 'Math',
        question: 'What is 5 + 3?',
        answers: ['7', '8', '9', '10'],
        correct: 1
    },
    {
        category: 'Animals',
        question: 'Which animal is known as the King of the Jungle?',
        answers: ['Tiger', 'Elephant', 'Lion', 'Bear'],
        correct: 2
    },
    {
        category: 'Science',
        question: 'What do plants need to grow?',
        answers: ['Candy', 'Sunlight', 'Toys', 'Books'],
        correct: 1
    },
    {
        category: 'Food',
        question: 'What fruit is yellow and monkeys love to eat?',
        answers: ['Apple', 'Orange', 'Banana', 'Grape'],
        correct: 2
    },
    {
        category: 'Space',
        question: 'What is the biggest planet in our solar system?',
        answers: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correct: 2
    },
    {
        category: 'Math',
        question: 'How many sides does a triangle have?',
        answers: ['2', '3', '4', '5'],
        correct: 1
    },
    {
        category: 'Nature',
        question: 'What comes after winter?',
        answers: ['Summer', 'Fall', 'Spring', 'Autumn'],
        correct: 2
    },
    {
        category: 'Animals',
        question: 'What is a baby dog called?',
        answers: ['Kitten', 'Puppy', 'Cub', 'Chick'],
        correct: 1
    },
    {
        category: 'Colors',
        question: 'What color is the sky on a sunny day?',
        answers: ['Green', 'Yellow', 'Blue', 'Red'],
        correct: 2
    },
    {
        category: 'Food',
        question: 'What do you call the meal you eat in the morning?',
        answers: ['Lunch', 'Dinner', 'Snack', 'Breakfast'],
        correct: 3
    },
    {
        category: 'Body',
        question: 'How many fingers do you have on both hands?',
        answers: ['5', '10', '15', '20'],
        correct: 1
    },
    {
        category: 'Animals',
        question: 'What is the fastest land animal?',
        answers: ['Lion', 'Cheetah', 'Horse', 'Dog'],
        correct: 1
    },
    {
        category: 'Nature',
        question: 'What do caterpillars turn into?',
        answers: ['Birds', 'Butterflies', 'Bees', 'Ants'],
        correct: 1
    },
    {
        category: 'Math',
        question: 'What is 10 - 4?',
        answers: ['5', '6', '7', '8'],
        correct: 1
    },
    {
        category: 'Space',
        question: 'What do we see in the sky at night?',
        answers: ['Sun', 'Moon', 'Clouds', 'Rainbow'],
        correct: 1
    },
    {
        category: 'Animals',
        question: 'Where do fish live?',
        answers: ['Trees', 'Water', 'Sky', 'Desert'],
        correct: 1
    }
];

const TOTAL_QUESTIONS = 10;

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    currentQuestionIndex: 0,
    questionsAsked: 0,
    isPlaying: false,
    selectedQuestions: [],
    answered: false,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    questionNumberDisplay: document.getElementById('questionNumber'),
    questionText: document.getElementById('questionText'),
    categoryBadge: document.getElementById('categoryBadge'),
    answersContainer: document.getElementById('answersContainer'),
    feedback: document.getElementById('feedback'),
    gameMessage: document.getElementById('gameMessage'),
    quizContainer: document.getElementById('quizContainer'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScoreDisplay: document.getElementById('finalScore'),
    percentageDisplay: document.getElementById('percentage'),
    finalMessage: document.getElementById('finalMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Trivia Quiz initialized');
    setupEventListeners();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', handleStart);

    // Next button
    elements.nextBtn.addEventListener('click', handleNext);

    // Play again button
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.questionsAsked = 0;
    gameState.answered = false;

    // Select random questions
    selectRandomQuestions();

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.quizContainer.style.display = 'flex';
    elements.startBtn.style.display = 'none';

    updateScoreDisplay();
    updateQuestionNumberDisplay();

    // Show first question
    showQuestion();

    console.log('Game started');
}

function selectRandomQuestions() {
    // Shuffle and select questions
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    gameState.selectedQuestions = shuffled.slice(0, TOTAL_QUESTIONS);
    gameState.currentQuestionIndex = 0;
}

function showQuestion() {
    const question = gameState.selectedQuestions[gameState.currentQuestionIndex];

    // Update question display
    elements.categoryBadge.textContent = question.category;
    elements.questionText.textContent = question.question;

    // Clear previous answers
    elements.answersContainer.innerHTML = '';
    elements.feedback.style.display = 'none';
    gameState.answered = false;

    // Create answer buttons
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => handleAnswerClick(index));
        elements.answersContainer.appendChild(button);
    });

    // Hide next button
    elements.nextBtn.style.display = 'none';
}

function handleAnswerClick(selectedIndex) {
    if (gameState.answered) return;

    gameState.answered = true;
    const question = gameState.selectedQuestions[gameState.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;

    // Get all answer buttons
    const answerButtons = elements.answersContainer.querySelectorAll('.answer-btn');

    // Mark correct and incorrect answers
    answerButtons.forEach((btn, index) => {
        btn.disabled = true;

        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // Update score if correct
    if (isCorrect) {
        gameState.score++;
        updateScoreDisplay();
        showFeedback('🎉 Correct! Great job!', true);
    } else {
        showFeedback(`❌ Oops! The correct answer was: ${question.answers[question.correct]}`, false);
    }

    // Increment questions asked
    gameState.questionsAsked++;
    updateQuestionNumberDisplay();

    // Show next button or end game
    if (gameState.questionsAsked < TOTAL_QUESTIONS) {
        elements.nextBtn.style.display = 'inline-block';
    } else {
        setTimeout(() => {
            endGame();
        }, 2000);
    }
}

function showFeedback(message, isCorrect) {
    elements.feedback.textContent = message;
    elements.feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
    elements.feedback.style.display = 'block';
}

function handleNext() {
    gameState.currentQuestionIndex++;
    showQuestion();
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate percentage
    const percentage = Math.round((gameState.score / TOTAL_QUESTIONS) * 100);

    // Determine message based on score
    let message = '';
    if (percentage === 100) {
        message = '🌟 Perfect Score! You\'re a genius!';
    } else if (percentage >= 80) {
        message = '🎉 Excellent! You did great!';
    } else if (percentage >= 60) {
        message = '👍 Good job! Keep it up!';
    } else if (percentage >= 40) {
        message = '😊 Not bad! Try again!';
    } else {
        message = '💪 Keep practicing! You\'ll do better!';
    }

    // Update overlay
    elements.finalScoreDisplay.textContent = `${gameState.score} / ${TOTAL_QUESTIONS}`;
    elements.percentageDisplay.textContent = `${percentage}%`;
    elements.finalMessage.textContent = message;

    // Show overlay
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score);
}

function resetGame() {
    gameState.score = 0;
    gameState.questionsAsked = 0;
    gameState.currentQuestionIndex = 0;
    gameState.isPlaying = false;
    gameState.answered = false;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.quizContainer.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.nextBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateScoreDisplay();
    updateQuestionNumberDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateQuestionNumberDisplay() {
    elements.questionNumberDisplay.textContent = `${gameState.questionsAsked}/${TOTAL_QUESTIONS}`;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
