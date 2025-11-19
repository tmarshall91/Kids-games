'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    minTime: 3,
    maxTime: 8,
    numberOfPlayers: 4,
    playerAvatars: ['😀', '😎', '🤖', '👾', '🦄', '🐱'],
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    round: 1,
    timeLeft: 5,
    isPlaying: false,
    currentPlayer: 0,
    eliminatedPlayers: [],
    activePlayers: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    quitBtn: document.getElementById('quitBtn'),

    // Display elements
    roundDisplay: document.getElementById('round'),
    timerDisplay: document.getElementById('timer'),
    finalRoundDisplay: document.getElementById('finalRound'),
    loserPlayerDisplay: document.getElementById('loserPlayer'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    playersGrid: document.getElementById('playersGrid'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Hot Potato initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart button
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handlePlayAgain);
    elements.playAgainBtn.addEventListener('click', handlePlayAgain);

    // Quit button
    elements.quitBtn.addEventListener('touchstart', handleQuit);
    elements.quitBtn.addEventListener('click', handleQuit);
}

// ==========================================
// GAME TIMER
// ==========================================

let timerInterval = null;

function startTimer() {
    // Random time between min and max
    gameState.timeLeft = randomInt(CONFIG.minTime, CONFIG.maxTime);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;

        gameState.timeLeft--;
        updateTimerDisplay();

        // Add intensity effects as time runs low
        if (gameState.timeLeft <= 2) {
            elements.timerDisplay.classList.add('pulse');
        }

        if (gameState.timeLeft <= 0) {
            explodePotato();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ==========================================
// PLAYER MANAGEMENT
// ==========================================

function createPlayers() {
    elements.playersGrid.innerHTML = '';
    gameState.activePlayers = [];

    for (let i = 0; i < CONFIG.numberOfPlayers; i++) {
        const player = document.createElement('div');
        player.className = 'player';
        player.dataset.playerId = i;

        const avatar = document.createElement('div');
        avatar.className = 'player-avatar';
        avatar.textContent = CONFIG.playerAvatars[i % CONFIG.playerAvatars.length];

        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = `Player ${i + 1}`;

        const status = document.createElement('div');
        status.className = 'player-status';
        status.textContent = 'Ready';

        player.appendChild(avatar);
        player.appendChild(name);
        player.appendChild(status);

        // Add click handler for passing potato
        player.addEventListener('touchstart', (e) => handlePlayerClick(e, i));
        player.addEventListener('click', (e) => handlePlayerClick(e, i));

        elements.playersGrid.appendChild(player);

        if (!gameState.eliminatedPlayers.includes(i)) {
            gameState.activePlayers.push(i);
        } else {
            player.classList.add('eliminated');
            status.textContent = 'Out';
        }
    }
}

function updatePlayerDisplay() {
    const players = elements.playersGrid.querySelectorAll('.player');

    players.forEach((player, index) => {
        const status = player.querySelector('.player-status');

        // Remove existing potato emoji
        const existingPotato = player.querySelector('.potato-emoji');
        if (existingPotato) {
            existingPotato.remove();
        }

        // Update current player with potato
        if (index === gameState.currentPlayer && gameState.isPlaying) {
            player.classList.add('has-potato');
            status.textContent = 'HOT! 🔥';

            // Add potato emoji
            const potatoEmoji = document.createElement('div');
            potatoEmoji.className = 'potato-emoji';
            potatoEmoji.textContent = '🥔';
            player.appendChild(potatoEmoji);
        } else {
            player.classList.remove('has-potato');
            if (!gameState.eliminatedPlayers.includes(index)) {
                status.textContent = 'Safe';
            }
        }
    });
}

function handlePlayerClick(e, playerId) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    // Can't pass to eliminated players
    if (gameState.eliminatedPlayers.includes(playerId)) return;

    // Can only pass if you have the potato
    if (gameState.currentPlayer !== playerId) {
        // Pass the potato
        passPotato(playerId);
    }
}

function passPotato(toPlayer) {
    gameState.currentPlayer = toPlayer;
    updatePlayerDisplay();

    // Play pass sound effect
    playSound('pass');
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.round = 1;
    gameState.eliminatedPlayers = [];

    // Hide message, show players grid
    elements.gameMessage.style.display = 'none';
    elements.playersGrid.style.display = 'grid';

    // Update UI
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    // Create players
    createPlayers();

    // Random starting player
    gameState.currentPlayer = randomInt(0, CONFIG.numberOfPlayers - 1);
    updatePlayerDisplay();

    updateRoundDisplay();

    // Start timer
    startTimer();

    console.log('Game started');
}

function startNewRound() {
    // Check if only one player left
    if (gameState.activePlayers.length <= 1) {
        endGame(true);
        return;
    }

    gameState.round++;
    updateRoundDisplay();

    // Choose random active player to start
    const activePlayerIndex = randomInt(0, gameState.activePlayers.length - 1);
    gameState.currentPlayer = gameState.activePlayers[activePlayerIndex];

    updatePlayerDisplay();
    startTimer();
}

function explodePotato() {
    gameState.isPlaying = false;
    stopTimer();

    // Eliminate current player
    gameState.eliminatedPlayers.push(gameState.currentPlayer);
    gameState.activePlayers = gameState.activePlayers.filter(p => p !== gameState.currentPlayer);

    // Update player display
    const players = elements.playersGrid.querySelectorAll('.player');
    players[gameState.currentPlayer].classList.add('eliminated');
    players[gameState.currentPlayer].querySelector('.player-status').textContent = 'Out';

    // Show round over overlay
    elements.loserPlayerDisplay.textContent = gameState.currentPlayer + 1;
    elements.finalRoundDisplay.textContent = gameState.round;

    if (gameState.activePlayers.length <= 1) {
        elements.overlayTitle.textContent = 'Game Over!';
        const winner = gameState.activePlayers[0];
        elements.loserPlayerDisplay.parentElement.textContent = `Player ${winner + 1} Wins!`;
        elements.playAgainBtn.textContent = 'Play Again';
    } else {
        elements.overlayTitle.textContent = 'Round Over!';
        elements.playAgainBtn.textContent = 'Next Round';
    }

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Potato exploded on player:', gameState.currentPlayer + 1);
}

function endGame(winner = false) {
    gameState.isPlaying = false;
    stopTimer();

    if (winner) {
        elements.overlayTitle.textContent = 'Winner!';
        const winnerPlayer = gameState.activePlayers[0];
        elements.loserPlayerDisplay.parentElement.textContent = `Player ${winnerPlayer + 1} Wins!`;
    }

    elements.finalRoundDisplay.textContent = gameState.round;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended');
}

function resetGame() {
    gameState.round = 1;
    gameState.timeLeft = 5;
    gameState.isPlaying = false;
    gameState.currentPlayer = 0;
    gameState.eliminatedPlayers = [];
    gameState.activePlayers = [];

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.playersGrid.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateRoundDisplay();
    updateTimerDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

function handlePlayAgain(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';

    if (gameState.activePlayers.length <= 1) {
        // Full reset
        resetGame();
        startGame();
    } else {
        // Next round
        gameState.isPlaying = true;
        startNewRound();
    }
}

function handleQuit(e) {
    e.preventDefault();
    resetGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateRoundDisplay() {
    elements.roundDisplay.textContent = gameState.round;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;

    if (gameState.timeLeft > 2) {
        elements.timerDisplay.classList.remove('pulse');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playSound(soundName) {
    // Sound effects can be added here
    console.log('Sound:', soundName);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopTimer();
});
