'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Note Frequencies ===
const frequencies = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88,
    'C2': 523.25,
    'E2': 82.41,
    'A2': 110.00,
    'D3': 146.83,
    'G3': 196.00,
    'B3': 246.94,
    'E4': 329.63
};

// === Sound Functions ===
function playPianoNote(note) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[note], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);
}

function playGuitarNote(note) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequencies[note], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 2);
}

function playXylophoneNote(note) {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequencies[note], ctx.currentTime);

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
}

// === State Management ===
let gameState = {
    currentInstrument: 'piano'
};

// === DOM References ===
const elements = {
    instrumentTabs: document.querySelectorAll('.instrument-tab'),
    instrumentDisplays: document.querySelectorAll('.instrument-display'),
    pianoKeys: document.querySelectorAll('.piano-key'),
    guitarStrings: document.querySelectorAll('.guitar-string'),
    xyloBarsdocument.querySelectorAll('.xylo-bar')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
}

function setupEventListeners() {
    // Instrument tabs
    elements.instrumentTabs.forEach(tab => {
        tab.addEventListener('click', () => switchInstrument(tab.dataset.instrument));
        tab.addEventListener('touchstart', (e) => {
            e.preventDefault();
            switchInstrument(tab.dataset.instrument);
        });
    });

    // Piano keys
    elements.pianoKeys.forEach(key => {
        key.addEventListener('click', () => playPianoNote(key.dataset.note));
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playPianoNote(key.dataset.note);
        });
    });

    // Guitar strings
    elements.guitarStrings.forEach(string => {
        string.addEventListener('click', () => playGuitarNote(string.dataset.note));
        string.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playGuitarNote(string.dataset.note);
        });
    });

    // Xylophone bars
    elements.xyloBars.forEach(bar => {
        bar.addEventListener('click', () => playXylophoneNote(bar.dataset.note));
        bar.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playXylophoneNote(bar.dataset.note);
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

// === Instrument Switching ===
function switchInstrument(instrument) {
    gameState.currentInstrument = instrument;

    // Update tabs
    elements.instrumentTabs.forEach(tab => {
        if (tab.dataset.instrument === instrument) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update displays
    elements.instrumentDisplays.forEach(display => {
        if (display.dataset.instrument === instrument) {
            display.classList.add('active');
        } else {
            display.classList.remove('active');
        }
    });
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
