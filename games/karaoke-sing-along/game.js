'use strict';

// === Songs Database ===
const songs = [
    {
        title: "Twinkle Twinkle Little Star",
        lyrics: [
            "Twinkle, twinkle, little star",
            "How I wonder what you are",
            "Up above the world so high",
            "Like a diamond in the sky",
            "Twinkle, twinkle, little star",
            "How I wonder what you are"
        ],
        duration: 24000 // milliseconds
    },
    {
        title: "Mary Had a Little Lamb",
        lyrics: [
            "Mary had a little lamb",
            "Little lamb, little lamb",
            "Mary had a little lamb",
            "Its fleece was white as snow",
            "Everywhere that Mary went",
            "Mary went, Mary went",
            "Everywhere that Mary went",
            "The lamb was sure to go"
        ],
        duration: 32000
    },
    {
        title: "Row Row Row Your Boat",
        lyrics: [
            "Row, row, row your boat",
            "Gently down the stream",
            "Merrily, merrily, merrily, merrily",
            "Life is but a dream",
            "Row, row, row your boat",
            "Gently down the stream",
            "If you see a crocodile",
            "Don't forget to scream!"
        ],
        duration: 32000
    },
    {
        title: "The Wheels on the Bus",
        lyrics: [
            "The wheels on the bus go round and round",
            "Round and round, round and round",
            "The wheels on the bus go round and round",
            "All through the town",
            "The wipers on the bus go swish swish swish",
            "Swish swish swish, swish swish swish",
            "The wipers on the bus go swish swish swish",
            "All through the town"
        ],
        duration: 40000
    },
    {
        title: "Old MacDonald Had a Farm",
        lyrics: [
            "Old MacDonald had a farm",
            "E-I-E-I-O",
            "And on that farm he had a cow",
            "E-I-E-I-O",
            "With a moo moo here",
            "And a moo moo there",
            "Here a moo, there a moo",
            "Everywhere a moo moo"
        ],
        duration: 40000
    }
];

// === State Management ===
let gameState = {
    currentSongIndex: 0,
    currentLineIndex: 0,
    isPlaying: false,
    startTime: 0,
    intervalId: null,
    progressIntervalId: null
};

// === DOM References ===
const elements = {
    songTitle: document.getElementById('songTitle'),
    currentLine: document.getElementById('currentLine'),
    nextLine: document.getElementById('nextLine'),
    progressBar: document.getElementById('progressBar'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    indicator: document.getElementById('indicator')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    preventTouchScroll();
    loadSong(0);
}

function setupEventListeners() {
    elements.playBtn.addEventListener('click', play);
    elements.pauseBtn.addEventListener('click', pause);
    elements.restartBtn.addEventListener('click', restart);
    elements.prevBtn.addEventListener('click', previousSong);
    elements.nextBtn.addEventListener('click', nextSong);

    // Touch events
    elements.playBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        play();
    });

    elements.pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        pause();
    });

    elements.restartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        restart();
    });

    elements.prevBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        previousSong();
    });

    elements.nextBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        nextSong();
    });
}

function preventTouchScroll() {
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-area')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Song Management ===
function loadSong(index) {
    gameState.currentSongIndex = index;
    gameState.currentLineIndex = 0;

    const song = songs[index];
    elements.songTitle.textContent = song.title;

    updateLyrics();
    elements.progressBar.style.width = '0%';
}

function updateLyrics() {
    const song = songs[gameState.currentSongIndex];
    const currentLine = song.lyrics[gameState.currentLineIndex] || '';
    const nextLine = song.lyrics[gameState.currentLineIndex + 1] || '';

    elements.currentLine.textContent = currentLine;
    elements.nextLine.textContent = nextLine;
}

function nextSong() {
    pause();
    const nextIndex = (gameState.currentSongIndex + 1) % songs.length;
    loadSong(nextIndex);
}

function previousSong() {
    pause();
    const prevIndex = (gameState.currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(prevIndex);
}

// === Playback Control ===
function play() {
    gameState.isPlaying = true;
    gameState.startTime = Date.now();

    elements.playBtn.style.display = 'none';
    elements.pauseBtn.style.display = 'block';
    elements.indicator.classList.add('active');

    const song = songs[gameState.currentSongIndex];
    const lineInterval = song.duration / song.lyrics.length;

    // Advance lyrics
    gameState.intervalId = setInterval(() => {
        gameState.currentLineIndex++;

        if (gameState.currentLineIndex >= song.lyrics.length) {
            // Song finished
            songComplete();
        } else {
            updateLyrics();
        }
    }, lineInterval);

    // Update progress bar
    gameState.progressIntervalId = setInterval(() => {
        const elapsed = Date.now() - gameState.startTime;
        const progress = Math.min((elapsed / song.duration) * 100, 100);
        elements.progressBar.style.width = progress + '%';
    }, 100);
}

function pause() {
    gameState.isPlaying = false;

    elements.playBtn.style.display = 'block';
    elements.pauseBtn.style.display = 'none';
    elements.indicator.classList.remove('active');

    clearInterval(gameState.intervalId);
    clearInterval(gameState.progressIntervalId);
}

function restart() {
    pause();
    gameState.currentLineIndex = 0;
    updateLyrics();
    elements.progressBar.style.width = '0%';
}

function songComplete() {
    pause();

    // Auto advance to next song
    setTimeout(() => {
        nextSong();
    }, 2000);
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
