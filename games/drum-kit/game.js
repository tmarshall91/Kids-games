'use strict';

// === Audio Context Setup ===
let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// === Sound Synthesis Functions ===
const drumSounds = {
    'bass': function() {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    },

    'snare': function() {
        const ctx = initAudioContext();

        // White noise
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.2);

        // Tone component
        const oscillator = ctx.createOscillator();
        const oscGain = ctx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.connect(oscGain);
        oscGain.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    },

    'tom-high': function() {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
    },

    'tom-mid': function() {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(180, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    },

    'tom-low': function() {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(140, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.6);
    },

    'hihat': function() {
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
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.1);
    },

    'cymbal-left': function() {
        const ctx = initAudioContext();

        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 2);
    },

    'cymbal-right': function() {
        const ctx = initAudioContext();

        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 1.5);
    }
};

// === State Management ===
let gameState = {
    isRecording: false,
    recording: [],
    recordingStartTime: 0
};

// === DOM References ===
const elements = {
    drums: document.querySelectorAll('.drum'),
    recordBtn: document.getElementById('recordBtn'),
    playbackBtn: document.getElementById('playbackBtn')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
}

function setupEventListeners() {
    elements.drums.forEach(drum => {
        drum.addEventListener('touchstart', handleDrumHit);
        drum.addEventListener('mousedown', handleDrumHit);
    });

    elements.recordBtn.addEventListener('click', toggleRecording);
    elements.playbackBtn.addEventListener('click', playRecording);
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Drum Interaction ===
function handleDrumHit(e) {
    e.preventDefault();

    const drum = e.currentTarget;
    const sound = drum.dataset.sound;

    // Play sound
    playDrumSound(sound);

    // Visual feedback
    drum.classList.add('hit');
    setTimeout(() => {
        drum.classList.remove('hit');
    }, 300);

    // Record if recording is active
    if (gameState.isRecording) {
        const timestamp = Date.now() - gameState.recordingStartTime;
        gameState.recording.push({ sound, timestamp });
    }
}

function playDrumSound(soundName) {
    if (drumSounds[soundName]) {
        drumSounds[soundName]();
    }
}

// === Recording Functions ===
function toggleRecording() {
    if (!gameState.isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    gameState.isRecording = true;
    gameState.recording = [];
    gameState.recordingStartTime = Date.now();

    elements.recordBtn.textContent = 'Stop Recording';
    elements.recordBtn.classList.add('recording');
    elements.playbackBtn.disabled = true;
}

function stopRecording() {
    gameState.isRecording = false;

    elements.recordBtn.textContent = 'Record';
    elements.recordBtn.classList.remove('recording');

    if (gameState.recording.length > 0) {
        elements.playbackBtn.disabled = false;
    }
}

function playRecording() {
    if (gameState.recording.length === 0) return;

    elements.playbackBtn.disabled = true;
    elements.recordBtn.disabled = true;

    gameState.recording.forEach(hit => {
        setTimeout(() => {
            playDrumSound(hit.sound);

            // Visual feedback
            const drum = document.querySelector(`[data-sound="${hit.sound}"]`);
            if (drum) {
                drum.classList.add('hit');
                setTimeout(() => {
                    drum.classList.remove('hit');
                }, 300);
            }
        }, hit.timestamp);
    });

    // Re-enable buttons after playback
    const maxTimestamp = Math.max(...gameState.recording.map(h => h.timestamp));
    setTimeout(() => {
        elements.playbackBtn.disabled = false;
        elements.recordBtn.disabled = false;
    }, maxTimestamp + 500);
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
