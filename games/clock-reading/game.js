'use strict';

let gameState = {
    score: 0,
    isPlaying: false,
    mode: 'quiz',
    currentHour: 3,
    currentMinute: 0,
    targetHour: 0,
    targetMinute: 0,
};

const elements = {
    practiceBtn: document.getElementById('practiceBtn'),
    quizBtn: document.getElementById('quizBtn'),
    backBtn: document.getElementById('backBtn'),
    continueBtn: document.getElementById('continueBtn'),
    checkBtn: document.getElementById('checkBtn'),
    hourUp: document.getElementById('hourUp'),
    hourDown: document.getElementById('hourDown'),
    minuteUp: document.getElementById('minuteUp'),
    minuteDown: document.getElementById('minuteDown'),
    scoreDisplay: document.getElementById('score'),
    gameMessage: document.getElementById('gameMessage'),
    gameContent: document.getElementById('gameContent'),
    timeText: document.getElementById('timeText'),
    quizSection: document.getElementById('quizSection'),
    practiceSection: document.getElementById('practiceSection'),
    answerOptions: document.getElementById('answerOptions'),
    targetTime: document.getElementById('targetTime'),
    hourHand: document.getElementById('hourHand'),
    minuteHand: document.getElementById('minuteHand'),
    feedbackOverlay: document.getElementById('feedbackOverlay'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackMessage: document.getElementById('feedbackMessage'),
};

function initGame() {
    console.log('Clock Reading Game initialized');
    setupEventListeners();
}

function setupEventListeners() {
    elements.practiceBtn.addEventListener('touchstart', (e) => handleModeSelect(e, 'practice'));
    elements.practiceBtn.addEventListener('click', (e) => handleModeSelect(e, 'practice'));
    elements.quizBtn.addEventListener('touchstart', (e) => handleModeSelect(e, 'quiz'));
    elements.quizBtn.addEventListener('click', (e) => handleModeSelect(e, 'quiz'));
    elements.backBtn.addEventListener('touchstart', handleBack);
    elements.backBtn.addEventListener('click', handleBack);
    elements.continueBtn.addEventListener('touchstart', handleContinue);
    elements.continueBtn.addEventListener('click', handleContinue);
    elements.checkBtn.addEventListener('touchstart', handleCheck);
    elements.checkBtn.addEventListener('click', handleCheck);

    elements.hourUp.addEventListener('touchstart', (e) => adjustTime(e, 'hour', 1));
    elements.hourUp.addEventListener('click', (e) => adjustTime(e, 'hour', 1));
    elements.hourDown.addEventListener('touchstart', (e) => adjustTime(e, 'hour', -1));
    elements.hourDown.addEventListener('click', (e) => adjustTime(e, 'hour', -1));
    elements.minuteUp.addEventListener('touchstart', (e) => adjustTime(e, 'minute', 15));
    elements.minuteUp.addEventListener('click', (e) => adjustTime(e, 'minute', 15));
    elements.minuteDown.addEventListener('touchstart', (e) => adjustTime(e, 'minute', -15));
    elements.minuteDown.addEventListener('click', (e) => adjustTime(e, 'minute', -15));
}

function handleModeSelect(e, mode) {
    e.preventDefault();
    gameState.mode = mode;
    gameState.score = 0;
    gameState.isPlaying = true;

    elements.gameMessage.style.display = 'none';
    elements.gameContent.style.display = 'flex';
    elements.backBtn.style.display = 'inline-block';

    if (mode === 'quiz') {
        startQuiz();
    } else {
        startPractice();
    }
}

function startQuiz() {
    elements.quizSection.style.display = 'block';
    elements.practiceSection.style.display = 'none';

    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = [0, 15, 30, 45];

    gameState.currentHour = hours[randomInt(0, hours.length - 1)];
    gameState.currentMinute = minutes[randomInt(0, minutes.length - 1)];

    updateClock();
    generateQuizOptions();
}

function generateQuizOptions() {
    const correctTime = formatTime(gameState.currentHour, gameState.currentMinute);
    const options = new Set([correctTime]);

    while (options.size < 4) {
        const h = randomInt(1, 12);
        const m = [0, 15, 30, 45][randomInt(0, 3)];
        options.add(formatTime(h, m));
    }

    const optionsArray = shuffleArray(Array.from(options));
    elements.answerOptions.innerHTML = '';

    optionsArray.forEach(time => {
        const btn = document.createElement('div');
        btn.className = 'answer-option';
        btn.textContent = time;
        btn.addEventListener('touchstart', (e) => handleQuizAnswer(e, time));
        btn.addEventListener('click', (e) => handleQuizAnswer(e, time));
        elements.answerOptions.appendChild(btn);
    });
}

function handleQuizAnswer(e, selectedTime) {
    e.preventDefault();
    const btn = e.currentTarget;
    const correctTime = formatTime(gameState.currentHour, gameState.currentMinute);
    const isCorrect = selectedTime === correctTime;

    const allOptions = elements.answerOptions.querySelectorAll('.answer-option');
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');

    if (isCorrect) {
        btn.classList.add('correct');
        gameState.score += 10;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎉 Correct!';
        elements.feedbackTitle.className = 'correct';
        elements.feedbackMessage.textContent = `Yes! It's ${correctTime}`;
    } else {
        btn.classList.add('incorrect');

        elements.feedbackTitle.textContent = '💡 Try Again!';
        elements.feedbackTitle.className = 'incorrect';
        elements.feedbackMessage.textContent = `The time is ${correctTime}`;
    }

    setTimeout(() => {
        elements.feedbackOverlay.style.display = 'flex';
    }, 600);
}

function startPractice() {
    elements.quizSection.style.display = 'none';
    elements.practiceSection.style.display = 'block';

    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = [0, 15, 30, 45];

    gameState.targetHour = hours[randomInt(0, hours.length - 1)];
    gameState.targetMinute = minutes[randomInt(0, minutes.length - 1)];

    gameState.currentHour = 12;
    gameState.currentMinute = 0;

    elements.targetTime.textContent = formatTime(gameState.targetHour, gameState.targetMinute);
    updateClock();
}

function adjustTime(e, type, delta) {
    e.preventDefault();

    if (type === 'hour') {
        gameState.currentHour += delta;
        if (gameState.currentHour > 12) gameState.currentHour = 1;
        if (gameState.currentHour < 1) gameState.currentHour = 12;
    } else {
        gameState.currentMinute += delta;
        if (gameState.currentMinute >= 60) gameState.currentMinute = 0;
        if (gameState.currentMinute < 0) gameState.currentMinute = 45;
    }

    updateClock();
}

function handleCheck(e) {
    e.preventDefault();

    const isCorrect = gameState.currentHour === gameState.targetHour &&
                     gameState.currentMinute === gameState.targetMinute;

    if (isCorrect) {
        gameState.score += 10;
        updateDisplay();

        elements.feedbackTitle.textContent = '🎉 Perfect!';
        elements.feedbackTitle.className = 'correct';
        elements.feedbackMessage.textContent = `You set the clock to ${formatTime(gameState.targetHour, gameState.targetMinute)}!`;
    } else {
        elements.feedbackTitle.textContent = '💡 Try Again!';
        elements.feedbackTitle.className = 'incorrect';
        elements.feedbackMessage.textContent = `Keep trying to set ${formatTime(gameState.targetHour, gameState.targetMinute)}`;

        setTimeout(() => {
            return;
        }, 2000);
    }

    if (isCorrect) {
        setTimeout(() => {
            elements.feedbackOverlay.style.display = 'flex';
        }, 300);
    }
}

function updateClock() {
    const hourAngle = (gameState.currentHour % 12) * 30 + gameState.currentMinute * 0.5;
    const minuteAngle = gameState.currentMinute * 6;

    elements.hourHand.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
    elements.minuteHand.setAttribute('transform', `rotate(${minuteAngle} 100 100)`);

    elements.timeText.textContent = formatTime(gameState.currentHour, gameState.currentMinute);
}

function formatTime(hour, minute) {
    const h = hour;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
}

function handleBack(e) {
    e.preventDefault();
    gameState.isPlaying = false;
    elements.gameMessage.style.display = 'block';
    elements.gameContent.style.display = 'none';
    elements.backBtn.style.display = 'none';
}

function handleContinue(e) {
    e.preventDefault();
    elements.feedbackOverlay.style.display = 'none';

    if (gameState.mode === 'quiz') {
        startQuiz();
    } else {
        startPractice();
    }
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
