'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    fuelRate: 2, // percent per click
    fuelTarget: 100,
    countdownStart: 10,
    altitudeIncrement: 5,
    fuelConsumption: 0.5,
    milestones: [
        { altitude: 0, name: 'Launch Pad', planet: 'earth' },
        { altitude: 100, name: 'Atmosphere', planet: 'earth' },
        { altitude: 400, name: 'Orbit', planet: 'moon' },
        { altitude: 800, name: 'Deep Space', planet: 'mars' },
    ],
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    altitude: 0,
    fuel: 100,
    score: 0,
    isPlaying: false,
    phase: 'ready', // ready, fueling, checking, countdown, launched, flying
    fuelLevel: 0,
    systemsChecked: false,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    fuelBtn: document.getElementById('fuelBtn'),
    systemCheckBtn: document.getElementById('systemCheckBtn'),
    launchBtn: document.getElementById('launchBtn'),
    altitudeDisplay: document.getElementById('altitude'),
    fuelDisplay: document.getElementById('fuel'),
    scoreDisplay: document.getElementById('score'),
    finalAltitudeDisplay: document.getElementById('finalAltitude'),
    finalScoreDisplay: document.getElementById('finalScore'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    missionMessage: document.getElementById('missionMessage'),
    rocket: document.getElementById('rocket'),
    launchPad: document.getElementById('launchPad'),
    countdown: document.getElementById('countdown'),
    countdownNumber: document.getElementById('countdownNumber'),
    fuelProgress: document.getElementById('fuelProgress'),
    fuelFill: document.getElementById('fuelFill'),
    earth: document.getElementById('earth'),
    moon: document.getElementById('moon'),
    mars: document.getElementById('mars'),
    launchControls: document.getElementById('launchControls'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Rocket Launch initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);

    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Launch control buttons
    elements.fuelBtn.addEventListener('touchstart', handleFuel);
    elements.fuelBtn.addEventListener('click', handleFuel);

    elements.systemCheckBtn.addEventListener('touchstart', handleSystemCheck);
    elements.systemCheckBtn.addEventListener('click', handleSystemCheck);

    elements.launchBtn.addEventListener('touchstart', handleLaunch);
    elements.launchBtn.addEventListener('click', handleLaunch);

    // Prevent default touch behavior
    elements.gameArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

let animationFrameId = null;

function gameLoop() {
    if (!gameState.isPlaying || gameState.phase !== 'flying') return;

    updateGame();
    renderGame();

    animationFrameId = requestAnimationFrame(gameLoop);
}

function updateGame() {
    if (gameState.fuel > 0) {
        gameState.altitude += CONFIG.altitudeIncrement;
        gameState.fuel -= CONFIG.fuelConsumption;
        gameState.score += 10;

        if (gameState.fuel < 0) gameState.fuel = 0;

        updateDisplays();
        updateMilestones();
    } else {
        endGame();
    }
}

function renderGame() {
    // Visual updates are handled in updateDisplays and updateMilestones
}

// ==========================================
// LAUNCH SEQUENCE
// ==========================================

function handleFuel(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.phase !== 'fueling') return;

    gameState.fuelLevel += CONFIG.fuelRate;

    if (gameState.fuelLevel > CONFIG.fuelTarget) {
        gameState.fuelLevel = CONFIG.fuelTarget;
    }

    elements.fuelFill.style.width = gameState.fuelLevel + '%';

    if (gameState.fuelLevel >= CONFIG.fuelTarget) {
        gameState.phase = 'fueled';
        elements.fuelBtn.disabled = true;
        elements.systemCheckBtn.disabled = false;
        elements.fuelBtn.textContent = '✓ Fully Fueled';
    }
}

function handleSystemCheck(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.phase !== 'fueled') return;

    gameState.phase = 'checking';
    elements.systemCheckBtn.disabled = true;
    elements.systemCheckBtn.textContent = '⏳ Checking...';

    // Simulate system check
    setTimeout(() => {
        gameState.systemsChecked = true;
        gameState.phase = 'ready-to-launch';
        elements.systemCheckBtn.textContent = '✓ All Systems Go!';
        elements.launchBtn.disabled = false;
    }, 2000);
}

function handleLaunch(e) {
    e.preventDefault();
    if (!gameState.isPlaying || gameState.phase !== 'ready-to-launch') return;

    gameState.phase = 'countdown';
    elements.launchBtn.disabled = true;
    elements.launchBtn.textContent = '🚀 Launching...';

    startCountdown();
}

function startCountdown() {
    let count = CONFIG.countdownStart;
    elements.countdown.style.display = 'block';
    elements.countdownNumber.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;

        if (count > 0) {
            elements.countdownNumber.textContent = count;
            // Re-trigger animation
            const countdownNumber = elements.countdownNumber;
            countdownNumber.style.animation = 'none';
            setTimeout(() => {
                countdownNumber.style.animation = 'pulse 1s ease-in-out';
            }, 10);
        } else {
            clearInterval(countdownInterval);
            elements.countdownNumber.textContent = 'LIFTOFF!';

            setTimeout(() => {
                elements.countdown.style.display = 'none';
                launchRocket();
            }, 1000);
        }
    }, 1000);
}

function launchRocket() {
    gameState.phase = 'launched';
    elements.rocket.classList.add('launching');
    elements.launchPad.style.opacity = '0';

    // Hide launch controls during flight
    elements.launchControls.style.display = 'none';

    setTimeout(() => {
        gameState.phase = 'flying';
        elements.rocket.classList.remove('launching');
        elements.rocket.classList.add('flying');
        elements.rocket.style.bottom = '50%';
        elements.rocket.style.transform = 'translateX(-50%) translateY(50%)';
        elements.earth.classList.add('visible');

        animationFrameId = requestAnimationFrame(gameLoop);
    }, 3000);
}

// ==========================================
// MILESTONE TRACKING
// ==========================================

function updateMilestones() {
    const altitude = gameState.altitude;

    // Show moon
    if (altitude >= 400 && !elements.moon.classList.contains('visible')) {
        elements.moon.style.display = 'block';
        elements.moon.classList.add('visible');
    }

    // Show mars
    if (altitude >= 800 && !elements.mars.classList.contains('visible')) {
        elements.mars.style.display = 'block';
        elements.mars.classList.add('visible');
    }
}

function getMissionMessage(altitude) {
    if (altitude >= 800) {
        return '🌟 Amazing! You reached deep space!';
    } else if (altitude >= 400) {
        return '🌙 Great job! You reached orbit!';
    } else if (altitude >= 100) {
        return '☁️ Good flight! You escaped the atmosphere!';
    } else {
        return '🚀 Nice try! Keep practicing!';
    }
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.altitude = 0;
    gameState.fuel = 100;
    gameState.score = 0;
    gameState.phase = 'fueling';
    gameState.fuelLevel = 0;
    gameState.systemsChecked = false;

    elements.gameMessage.style.display = 'none';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';
    elements.launchControls.style.display = 'block';

    // Reset buttons
    elements.fuelBtn.disabled = false;
    elements.fuelBtn.textContent = '⛽ Fuel Rocket';
    elements.systemCheckBtn.disabled = true;
    elements.systemCheckBtn.textContent = '🔧 System Check';
    elements.launchBtn.disabled = true;
    elements.launchBtn.textContent = '🚀 LAUNCH!';

    // Reset rocket and pad
    elements.rocket.classList.remove('launching', 'flying');
    elements.rocket.style.bottom = '80px';
    elements.rocket.style.transform = 'translateX(-50%)';
    elements.launchPad.style.opacity = '1';

    // Reset progress
    elements.fuelFill.style.width = '0%';

    // Hide planets
    elements.earth.classList.remove('visible');
    elements.moon.classList.remove('visible');
    elements.mars.classList.remove('visible');
    elements.moon.style.display = 'none';
    elements.mars.style.display = 'none';

    updateDisplays();

    console.log('Mission started');
}

function endGame() {
    gameState.isPlaying = false;
    gameState.phase = 'ended';

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    elements.finalAltitudeDisplay.textContent = Math.floor(gameState.altitude);
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.missionMessage.textContent = getMissionMessage(gameState.altitude);

    if (gameState.altitude >= 800) {
        elements.gameOverTitle.textContent = 'Mission Success! 🎉🚀';
    } else {
        elements.gameOverTitle.textContent = 'Mission Complete! 🚀';
    }

    elements.gameOverOverlay.style.display = 'flex';

    console.log('Mission ended. Altitude:', gameState.altitude);
}

function resetGame() {
    gameState = {
        altitude: 0,
        fuel: 100,
        score: 0,
        isPlaying: false,
        phase: 'ready',
        fuelLevel: 0,
        systemsChecked: false,
    };

    elements.gameMessage.style.display = 'block';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';
    elements.launchControls.style.display = 'none';
    elements.countdown.style.display = 'none';

    // Reset rocket
    elements.rocket.classList.remove('launching', 'flying');
    elements.rocket.style.bottom = '80px';
    elements.rocket.style.transform = 'translateX(-50%)';
    elements.launchPad.style.opacity = '1';

    // Reset progress
    elements.fuelFill.style.width = '0%';

    // Hide planets
    elements.earth.classList.remove('visible');
    elements.moon.classList.remove('visible');
    elements.mars.classList.remove('visible');
    elements.moon.style.display = 'none';
    elements.mars.style.display = 'none';

    updateDisplays();

    console.log('Mission reset');
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

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateDisplays() {
    elements.altitudeDisplay.textContent = Math.floor(gameState.altitude);
    elements.fuelDisplay.textContent = Math.floor(gameState.fuel);
    elements.scoreDisplay.textContent = gameState.score;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
