'use strict';

// === Configuration ===
const CONFIG = {
    sounds: {
        'cymbal-left': { frequency: 800, duration: 0.3 },
        'cymbal-right': { frequency: 1000, duration: 0.3 },
        'hihat': { frequency: 1200, duration: 0.1 },
        'snare': { frequency: 300, duration: 0.15 },
        'kick': { frequency: 80, duration: 0.2 },
        'tom-high': { frequency: 400, duration: 0.2 },
        'tom-mid': { frequency: 250, duration: 0.2 },
        'tom-low': { frequency: 150, duration: 0.2 }
    },
    keyMap: {
        'q': 'cymbal-left',
        'p': 'cymbal-right',
        'w': 'tom-high',
        'e': 'tom-mid',
        'r': 'tom-low',
        'a': 'hihat',
        's': 'snare',
        ' ': 'kick'
    }
};

// === State Management ===
let gameState = {
    isRecording: false,
    recording: [],
    recordStartTime: 0,
    audioContext: null
};

// === DOM References ===
const elements = {
    drums: document.querySelectorAll('.drum'),
    recordBtn: document.getElementById('recordBtn'),
    playbackBtn: document.getElementById('playbackBtn'),
    clearBtn: document.getElementById('clearBtn')
};

// === Initialization ===
function initGame() {
    setupAudioContext();
    setupEventListeners();
}

function setupAudioContext() {
    // Create audio context on first user interaction
    const createAudioContext = () => {
        if (!gameState.audioContext) {
            gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    };

    document.addEventListener('touchstart', createAudioContext, { once: true });
    document.addEventListener('click', createAudioContext, { once: true });
}

function setupEventListeners() {
    // Drum pad touch/click events
    elements.drums.forEach(drum => {
        drum.addEventListener('touchstart', handleDrumTouch);
        drum.addEventListener('mousedown', handleDrumTouch);
    });

    // Keyboard events
    document.addEventListener('keydown', handleKeyPress);

    // Recording controls
    elements.recordBtn.addEventListener('click', toggleRecording);
    elements.recordBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleRecording();
    });

    elements.playbackBtn.addEventListener('click', playRecording);
    elements.playbackBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        playRecording();
    });

    elements.clearBtn.addEventListener('click', clearRecording);
    elements.clearBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearRecording();
    });
}

// === Drum Playing ===
function handleDrumTouch(e) {
    e.preventDefault();
    const drum = e.currentTarget;
    const sound = drum.dataset.sound;
    playDrum(sound, drum);
}

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (CONFIG.keyMap[key]) {
        e.preventDefault();
        const sound = CONFIG.keyMap[key];
        const drum = document.querySelector(`[data-sound="${sound}"]`);
        if (drum) {
            playDrum(sound, drum);
        }
    }
}

function playDrum(sound, drumElement) {
    // Create audio context if not exists
    if (!gameState.audioContext) {
        gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Visual feedback
    drumElement.classList.add('playing');
    setTimeout(() => {
        drumElement.classList.remove('playing');
    }, 150);

    // Play sound
    playSound(sound);

    // Record if recording is active
    if (gameState.isRecording) {
        const timestamp = Date.now() - gameState.recordStartTime;
        gameState.recording.push({ sound, timestamp });
    }
}

function playSound(sound) {
    const config = CONFIG.sounds[sound];
    if (!config || !gameState.audioContext) return;

    const ctx = gameState.audioContext;
    const currentTime = ctx.currentTime;

    // Create oscillator for main sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure based on drum type
    if (sound.includes('cymbal') || sound === 'hihat') {
        // Metallic sounds - use white noise
        const bufferSize = ctx.sampleRate * config.duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = config.frequency;

        noise.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + config.duration);

        noise.start(currentTime);
        noise.stop(currentTime + config.duration);
    } else {
        // Drum sounds - use oscillator
        oscillator.type = sound === 'kick' ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(config.frequency, currentTime);

        if (sound === 'kick') {
            oscillator.frequency.exponentialRampToValueAtTime(40, currentTime + 0.05);
        }

        gainNode.gain.setValueAtTime(sound === 'kick' ? 0.8 : 0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + config.duration);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + config.duration);
    }
}

// === Recording ===
function toggleRecording() {
    if (gameState.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    gameState.isRecording = true;
    gameState.recording = [];
    gameState.recordStartTime = Date.now();

    elements.recordBtn.textContent = 'Stop Recording';
    elements.recordBtn.classList.add('recording');
    elements.playbackBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
}

function stopRecording() {
    gameState.isRecording = false;

    elements.recordBtn.textContent = 'Start Recording';
    elements.recordBtn.classList.remove('recording');

    if (gameState.recording.length > 0) {
        elements.playbackBtn.style.display = 'inline-block';
        elements.clearBtn.style.display = 'inline-block';
    }
}

function playRecording() {
    if (gameState.recording.length === 0) return;

    elements.playbackBtn.disabled = true;
    elements.playbackBtn.textContent = 'Playing...';

    gameState.recording.forEach(({ sound, timestamp }) => {
        setTimeout(() => {
            const drum = document.querySelector(`[data-sound="${sound}"]`);
            if (drum) {
                playDrum(sound, drum);
            }
        }, timestamp);
    });

    // Re-enable button after playback
    const lastTimestamp = gameState.recording[gameState.recording.length - 1].timestamp;
    setTimeout(() => {
        elements.playbackBtn.disabled = false;
        elements.playbackBtn.textContent = 'Play Recording';
    }, lastTimestamp + 1000);
}

function clearRecording() {
    gameState.recording = [];
    elements.playbackBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
