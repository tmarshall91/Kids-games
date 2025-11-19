'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Configuration ===
const CONFIG = {
    notes: [
        { name: 'C', position: 100, frequency: 261.63 },
        { name: 'D', position: 87.5, frequency: 293.66 },
        { name: 'E', position: 75, frequency: 329.63 },
        { name: 'F', position: 62.5, frequency: 349.23 },
        { name: 'G', position: 50, frequency: 392.00 },
        { name: 'A', position: 37.5, frequency: 440.00 },
        { name: 'B', position: 25, frequency: 493.88 }
    ],
    roundsPerGame: 20
};

// === State Management ===
let gameState = {
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentNote: null,
    round: 0,
    isPlaying: false
};

// === DOM References ===
const elements = {
    musicalNote: document.getElementById('musicalNote'),
    noteButtons: document.querySelectorAll('.note-btn'),
    scoreDisplay: document.getElementById('score'),
    streakDisplay: document.getElementById('streak'),
    feedbackMessage: document.getElementById('feedbackMessage'),
    gameMessage: document.getElementById('gameMessage'),
    startBtn: document.getElementById('startBtn'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    maxStreak: document.getElementById('maxStreak'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.startBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        startGame();
    });

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverOverlay.style.display = 'none';
        startGame();
    });

    elements.noteButtons.forEach(btn => {
        btn.addEventListener('click', () => handleNoteGuess(btn.dataset.note));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleNoteGuess(btn.dataset.note);
        });
    });
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Game Control ===
function startGame() {
    gameState.score = 0;
    gameState.streak = 0;
    gameState.maxStreak = 0;
    gameState.round = 0;
    gameState.isPlaying = true;

    updateScore();
    updateStreak();

    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';

    nextRound();
}

function nextRound() {
    if (gameState.round >= CONFIG.roundsPerGame) {
        endGame();
        return;
    }

    gameState.round++;
    enableButtons();
    showRandomNote();
}

function showRandomNote() {
    const randomNote = CONFIG.notes[Math.floor(Math.random() * CONFIG.notes.length)];
    gameState.currentNote = randomNote;

    // Position note on staff
    elements.musicalNote.style.top = randomNote.position + '%';

    // Play the note sound
    setTimeout(() => playNote(randomNote.frequency), 300);
}

function playNote(frequency) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
}

// === Handle Guess ===
function handleNoteGuess(guessedNote) {
    if (!gameState.isPlaying) return;

    disableButtons();

    const correctNote = gameState.currentNote.name;
    const isCorrect = guessedNote === correctNote;

    // Visual feedback on button
    const btn = document.querySelector(`[data-note="${guessedNote}"]`);
    btn.classList.add(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
        // Correct answer
        gameState.score += 10;
        gameState.streak++;

        if (gameState.streak > gameState.maxStreak) {
            gameState.maxStreak = gameState.streak;
        }

        showFeedback('Correct!', 'correct-msg');
        playNote(gameState.currentNote.frequency);
    } else {
        // Wrong answer
        gameState.streak = 0;
        showFeedback(`${correctNote}`, 'wrong-msg');

        // Show correct answer
        const correctBtn = document.querySelector(`[data-note="${correctNote}"]`);
        correctBtn.classList.add('correct');
    }

    updateScore();
    updateStreak();

    // Continue to next round
    setTimeout(() => {
        elements.noteButtons.forEach(b => {
            b.classList.remove('correct', 'wrong');
        });
        nextRound();
    }, 1500);
}

// === UI Updates ===
function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateStreak() {
    elements.streakDisplay.textContent = gameState.streak;

    if (gameState.streak > 0) {
        elements.streakDisplay.style.color = '#51cf66';
    } else {
        elements.streakDisplay.style.color = 'white';
    }
}

function showFeedback(message, className) {
    elements.feedbackMessage.textContent = message;
    elements.feedbackMessage.className = 'feedback-message show ' + className;

    setTimeout(() => {
        elements.feedbackMessage.classList.remove('show');
    }, 800);
}

function enableButtons() {
    elements.noteButtons.forEach(btn => {
        btn.classList.remove('disabled');
    });
}

function disableButtons() {
    elements.noteButtons.forEach(btn => {
        btn.classList.add('disabled');
    });
}

function endGame() {
    gameState.isPlaying = false;

    elements.finalScore.textContent = gameState.score;
    elements.maxStreak.textContent = gameState.maxStreak;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
