'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Sound Synthesis ===
const sounds = {
    kick: function() {
        const ctx = initAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
    },

    snare: function() {
        const ctx = initAudioContext();
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.2);
    },

    hihat: function() {
        const ctx = initAudioContext();
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.05);
    },

    clap: function() {
        const ctx = initAudioContext();
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.1);
    }
};

// === Configuration ===
const CONFIG = {
    rows: 4,
    cols: 16,
    instruments: ['kick', 'snare', 'hihat', 'clap']
};

// === State Management ===
let gameState = {
    grid: [],
    isPlaying: false,
    currentStep: 0,
    tempo: 120,
    intervalId: null
};

// === DOM References ===
const elements = {
    beatGrid: document.getElementById('beatGrid'),
    beatPosition: document.getElementById('beatPosition'),
    playBtn: document.getElementById('playBtn'),
    stopBtn: document.getElementById('stopBtn'),
    clearBtn: document.getElementById('clearBtn'),
    tempoSlider: document.getElementById('tempoSlider'),
    tempoValue: document.getElementById('tempoValue')
};

// === Initialization ===
function initGame() {
    initGrid();
    createGridUI();
    setupEventListeners();
    preventTouchScroll();
}

function initGrid() {
    gameState.grid = [];
    for (let row = 0; row < CONFIG.rows; row++) {
        gameState.grid[row] = new Array(CONFIG.cols).fill(false);
    }
}

function createGridUI() {
    elements.beatGrid.innerHTML = '';

    for (let row = 0; row < CONFIG.rows; row++) {
        for (let col = 0; col < CONFIG.cols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('beat-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('touchstart', handleCellClick);

            elements.beatGrid.appendChild(cell);
        }
    }
}

function setupEventListeners() {
    elements.playBtn.addEventListener('click', togglePlay);
    elements.stopBtn.addEventListener('click', stop);
    elements.clearBtn.addEventListener('click', clearGrid);
    elements.tempoSlider.addEventListener('input', updateTempo);
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Grid Interaction ===
function handleCellClick(e) {
    e.preventDefault();

    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);

    gameState.grid[row][col] = !gameState.grid[row][col];
    e.currentTarget.classList.toggle('active');

    // Play sound preview
    sounds[CONFIG.instruments[row]]();
}

function clearGrid() {
    initGrid();
    const cells = document.querySelectorAll('.beat-cell');
    cells.forEach(cell => cell.classList.remove('active'));
}

// === Playback ===
function togglePlay() {
    if (gameState.isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    gameState.isPlaying = true;
    elements.playBtn.textContent = '⏸ Pause';
    elements.beatPosition.classList.add('playing');

    const beatDuration = (60 / gameState.tempo) * 1000 / 4; // 16th notes

    gameState.intervalId = setInterval(() => {
        playStep();
        gameState.currentStep = (gameState.currentStep + 1) % CONFIG.cols;
    }, beatDuration);
}

function pause() {
    gameState.isPlaying = false;
    elements.playBtn.textContent = '▶ Play';
    elements.beatPosition.classList.remove('playing');
    clearInterval(gameState.intervalId);
    clearHighlights();
}

function stop() {
    pause();
    gameState.currentStep = 0;
}

function playStep() {
    clearHighlights();

    // Highlight current column
    const cells = document.querySelectorAll(`.beat-cell[data-col="${gameState.currentStep}"]`);
    cells.forEach(cell => cell.classList.add('highlight'));

    // Play sounds in this column
    for (let row = 0; row < CONFIG.rows; row++) {
        if (gameState.grid[row][gameState.currentStep]) {
            sounds[CONFIG.instruments[row]]();
        }
    }
}

function clearHighlights() {
    const cells = document.querySelectorAll('.beat-cell.highlight');
    cells.forEach(cell => cell.classList.remove('highlight'));
}

// === Tempo Control ===
function updateTempo(e) {
    gameState.tempo = parseInt(e.target.value);
    elements.tempoValue.textContent = gameState.tempo;

    if (gameState.isPlaying) {
        pause();
        play();
    }
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
