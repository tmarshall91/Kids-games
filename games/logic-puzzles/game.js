'use strict';

// === Configuration ===
const CONFIG = {
    puzzleTypes: ['number', 'emoji', 'color', 'size', 'shape'],
    pointsPerPuzzle: 100,
    streakBonus: 50
};

// === State Management ===
let gameState = {
    isPlaying: false,
    level: 1,
    score: 0,
    streak: 0,
    currentPuzzle: null,
    totalCorrect: 0
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('startBtn'),
    skipBtn: document.getElementById('skipBtn'),
    nextBtn: document.getElementById('nextBtn'),
    gameMessage: document.getElementById('gameMessage'),
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    puzzleTitle: document.getElementById('puzzleTitle'),
    patternDisplay: document.getElementById('patternDisplay'),
    answerOptions: document.getElementById('answerOptions'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackIcon: document.getElementById('feedbackIcon'),
    feedbackText: document.getElementById('feedbackText'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    levelsCompleted: document.getElementById('levelsCompleted'),
    achievement: document.getElementById('achievement'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Puzzle Patterns ===
const puzzleGenerators = {
    number: () => {
        const patterns = [
            { type: 'increment', start: 1, step: 1 },
            { type: 'increment', start: 2, step: 2 },
            { type: 'increment', start: 5, step: 5 },
            { type: 'increment', start: 10, step: 10 },
            { type: 'increment', start: 1, step: 3 },
            { type: 'decrement', start: 10, step: 1 },
            { type: 'decrement', start: 20, step: 2 }
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const sequence = [];
        let current = pattern.start;

        for (let i = 0; i < 4; i++) {
            sequence.push(current);
            current += pattern.type === 'increment' ? pattern.step : -pattern.step;
        }

        const answer = current;
        const wrongAnswers = generateWrongNumbers(answer, pattern.step);

        return {
            title: 'What number comes next?',
            pattern: sequence.map(n => ({ display: n.toString(), value: n })),
            answer: answer.toString(),
            options: shuffleArray([answer.toString(), ...wrongAnswers])
        };
    },

    emoji: () => {
        const sequences = [
            { pattern: ['🍎', '🍊', '🍋'], repeating: true },
            { pattern: ['🐶', '🐱', '🐭'], repeating: true },
            { pattern: ['⭐', '💫', '✨'], repeating: true },
            { pattern: ['🌞', '🌙'], repeating: true },
            { pattern: ['🔴', '🔵', '🟢', '🟡'], repeating: true },
            { pattern: ['❤️', '💛', '💚', '💙'], repeating: true },
            { pattern: ['🌸', '🌺', '🌻'], repeating: true }
        ];

        const selected = sequences[Math.floor(Math.random() * sequences.length)];
        const pattern = selected.pattern;
        const length = pattern.length;

        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(pattern[i % length]);
        }

        const answer = pattern[4 % length];
        const allEmojis = sequences.flatMap(s => s.pattern);
        const wrongAnswers = [];

        while (wrongAnswers.length < 3) {
            const wrong = allEmojis[Math.floor(Math.random() * allEmojis.length)];
            if (wrong !== answer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
        }

        return {
            title: 'What comes next in the pattern?',
            pattern: sequence.map(e => ({ display: e, value: e })),
            answer: answer,
            options: shuffleArray([answer, ...wrongAnswers])
        };
    },

    color: () => {
        const colors = [
            { emoji: '🔴', name: 'red' },
            { emoji: '🔵', name: 'blue' },
            { emoji: '🟢', name: 'green' },
            { emoji: '🟡', name: 'yellow' },
            { emoji: '🟣', name: 'purple' },
            { emoji: '🟠', name: 'orange' }
        ];

        const patternLength = 2 + Math.floor(Math.random() * 2);
        const pattern = [];

        for (let i = 0; i < patternLength; i++) {
            pattern.push(colors[i % colors.length]);
        }

        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(pattern[i % patternLength].emoji);
        }

        const answer = pattern[4 % patternLength].emoji;
        const wrongAnswers = [];

        colors.forEach(c => {
            if (c.emoji !== answer && wrongAnswers.length < 3) {
                wrongAnswers.push(c.emoji);
            }
        });

        return {
            title: 'Which color comes next?',
            pattern: sequence.map(e => ({ display: e, value: e })),
            answer: answer,
            options: shuffleArray([answer, ...wrongAnswers])
        };
    },

    size: () => {
        const sizes = [
            { emoji: '⚫', size: 'small' },
            { emoji: '🔴', size: 'medium' },
            { emoji: '🟠', size: 'large' }
        ];

        const patterns = [
            [0, 1, 2, 0], // small, medium, large, small
            [0, 0, 1, 1], // small, small, medium, medium
            [2, 1, 0, 2]  // large, medium, small, large
        ];

        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const sequence = pattern.map(i => sizes[i].emoji);
        const nextIndex = pattern.length % 3;
        const answer = sizes[pattern[0]].emoji;

        // Determine next in sequence
        let answerEmoji;
        if (pattern[0] === 0 && pattern[1] === 1 && pattern[2] === 2) {
            answerEmoji = sizes[1].emoji; // medium
        } else if (pattern[0] === 0 && pattern[1] === 0) {
            answerEmoji = sizes[2].emoji; // large
        } else {
            answerEmoji = sizes[1].emoji; // medium
        }

        const wrongAnswers = sizes
            .filter(s => s.emoji !== answerEmoji)
            .map(s => s.emoji)
            .slice(0, 3);

        return {
            title: 'What size comes next?',
            pattern: sequence.map(e => ({ display: e, value: e })),
            answer: answerEmoji,
            options: shuffleArray([answerEmoji, ...wrongAnswers])
        };
    },

    shape: () => {
        const shapes = [
            { shape: '⬛', color: '#333' },
            { shape: '🔷', color: '#2196f3' },
            { shape: '🔶', color: '#ff9800' },
            { shape: '⭐', color: '#ffc107' }
        ];

        const patternLength = 3;
        const pattern = shapes.slice(0, patternLength);

        const sequence = [];
        for (let i = 0; i < 4; i++) {
            sequence.push(pattern[i % patternLength].shape);
        }

        const answer = pattern[4 % patternLength].shape;
        const wrongAnswers = shapes
            .filter(s => s.shape !== answer)
            .map(s => s.shape)
            .slice(0, 3);

        return {
            title: 'Which shape comes next?',
            pattern: sequence.map(s => ({ display: s, value: s })),
            answer: answer,
            options: shuffleArray([answer, ...wrongAnswers])
        };
    }
};

// === Initialization ===
function initGame() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.skipBtn.addEventListener('click', skipPuzzle);
    elements.skipBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        skipPuzzle();
    });

    elements.nextBtn.addEventListener('click', nextPuzzle);
    elements.nextBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        nextPuzzle();
    });

    elements.playAgainBtn.addEventListener('click', resetGame);
    elements.playAgainBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        resetGame();
    });
}

// === Game Control ===
function startGame() {
    gameState.isPlaying = true;
    gameState.level = 1;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.totalCorrect = 0;

    elements.startBtn.style.display = 'none';
    elements.skipBtn.style.display = 'inline-block';
    elements.gameMessage.style.display = 'none';

    updateUI();
    generatePuzzle();
}

function generatePuzzle() {
    // Select puzzle type based on level
    const availableTypes = CONFIG.puzzleTypes.slice(0, Math.min(2 + Math.floor(gameState.level / 3), CONFIG.puzzleTypes.length));
    const puzzleType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    gameState.currentPuzzle = puzzleGenerators[puzzleType]();
    renderPuzzle();
}

function renderPuzzle() {
    const puzzle = gameState.currentPuzzle;

    elements.puzzleTitle.textContent = puzzle.title;

    // Render pattern
    elements.patternDisplay.innerHTML = '';
    puzzle.pattern.forEach(item => {
        const div = document.createElement('div');
        div.className = 'pattern-item';
        div.textContent = item.display;
        elements.patternDisplay.appendChild(div);
    });

    // Render options
    elements.answerOptions.innerHTML = '';
    puzzle.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-option';
        btn.textContent = option;

        btn.addEventListener('click', () => checkAnswer(option, btn));
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            checkAnswer(option, btn);
        });

        elements.answerOptions.appendChild(btn);
    });
}

function checkAnswer(selected, button) {
    if (!gameState.isPlaying) return;

    const isCorrect = selected === gameState.currentPuzzle.answer;

    if (isCorrect) {
        button.classList.add('correct');
        gameState.streak++;
        gameState.totalCorrect++;
        const points = CONFIG.pointsPerPuzzle + (gameState.streak > 1 ? CONFIG.streakBonus : 0);
        gameState.score += points;

        showFeedback(true);

        setTimeout(() => {
            gameState.level++;
            updateUI();
            nextPuzzle();
        }, 1500);
    } else {
        button.classList.add('incorrect');
        gameState.streak = 0;

        showFeedback(false);

        // Show correct answer
        setTimeout(() => {
            const buttons = elements.answerOptions.querySelectorAll('.answer-option');
            buttons.forEach(btn => {
                if (btn.textContent === gameState.currentPuzzle.answer) {
                    btn.classList.add('correct');
                }
            });

            elements.nextBtn.style.display = 'inline-block';
            elements.skipBtn.style.display = 'none';
        }, 1000);
    }

    updateUI();

    // Disable all buttons
    const buttons = elements.answerOptions.querySelectorAll('.answer-option');
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });
}

function showFeedback(correct) {
    elements.feedbackIcon.textContent = correct ? '🎉' : '😊';
    elements.feedbackText.textContent = correct ? 'Correct!' : 'Try Again!';
    elements.feedbackOverlay.style.display = 'flex';

    setTimeout(() => {
        elements.feedbackOverlay.style.display = 'none';
    }, 1500);
}

function skipPuzzle() {
    gameState.streak = 0;
    nextPuzzle();
}

function nextPuzzle() {
    elements.nextBtn.style.display = 'none';
    elements.skipBtn.style.display = 'inline-block';
    generatePuzzle();
}

function updateUI() {
    elements.level.textContent = gameState.level;
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;
}

function resetGame() {
    elements.gameOverOverlay.style.display = 'none';
    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.skipBtn.style.display = 'none';
    elements.nextBtn.style.display = 'none';
    elements.patternDisplay.innerHTML = '';
    elements.answerOptions.innerHTML = '';

    gameState = {
        isPlaying: false,
        level: 1,
        score: 0,
        streak: 0,
        currentPuzzle: null,
        totalCorrect: 0
    };

    updateUI();
}

// === Utility Functions ===
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateWrongNumbers(correct, step) {
    const wrong = [];
    wrong.push((correct + step).toString());
    wrong.push((correct - step).toString());
    wrong.push((correct + step * 2).toString());
    return shuffleArray(wrong).slice(0, 3);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
