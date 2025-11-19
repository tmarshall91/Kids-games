'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    sprint: {
        distance: 100, // meters
        aiSpeed: [0.8, 1.0], // AI runner speeds relative to player
        tapValue: 1.5, // meters per tap
        maxTime: 20, // seconds
    },
    longjump: {
        attempts: 3,
        runupTime: 2000, // ms to build speed
        maxDistance: 8.5,
        minDistance: 3.0,
    },
    javelin: {
        attempts: 3,
        minAngle: 20,
        maxAngle: 70,
        optimalAngle: 45,
        maxDistance: 90,
        chargeTime: 2000, // ms to full power
    },
    scoring: {
        gold: { min: 85, emoji: '🥇', message: 'Outstanding performance!' },
        silver: { min: 70, emoji: '🥈', message: 'Great job!' },
        bronze: { min: 50, emoji: '🥉', message: 'Good effort!' },
        none: { emoji: '🏅', message: 'Keep training!' },
    },
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    totalPoints: 0,
    eventsCompleted: 0,
    currentEvent: null,
    medals: { gold: 0, silver: 0, bronze: 0 },
    eventResults: {
        sprint: null,
        longjump: null,
        javelin: null,
    },
};

let sprintState = {
    distance: 0,
    time: 0,
    taps: 0,
    isRunning: false,
    startTime: 0,
    aiPositions: [0, 0],
};

let longjumpState = {
    attemptsLeft: CONFIG.longjump.attempts,
    bestDistance: 0,
    speed: 0,
    isRunning: false,
    hasJumped: false,
    runupStart: 0,
};

let javelinState = {
    attemptsLeft: CONFIG.javelin.attempts,
    bestDistance: 0,
    angle: 45,
    power: 0,
    isCharging: false,
    chargeStart: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    totalPoints: document.getElementById('totalPoints'),
    eventsCompleted: document.getElementById('eventsCompleted'),

    // Screens
    eventSelection: document.getElementById('eventSelection'),
    sprintEvent: document.getElementById('sprintEvent'),
    longjumpEvent: document.getElementById('longjumpEvent'),
    javelinEvent: document.getElementById('javelinEvent'),
    eventComplete: document.getElementById('eventComplete'),

    // Event cards
    eventCards: document.querySelectorAll('.event-card'),
    sprintStatus: document.getElementById('sprintStatus'),
    longjumpStatus: document.getElementById('longjumpStatus'),
    javelinStatus: document.getElementById('javelinStatus'),

    // Sprint elements
    playerRunner: document.getElementById('playerRunner'),
    aiRunner1: document.getElementById('aiRunner1'),
    aiRunner2: document.getElementById('aiRunner2'),
    sprintDistance: document.getElementById('sprintDistance'),
    sprintTime: document.getElementById('sprintTime'),
    tapCount: document.getElementById('tapCount'),
    tapArea: document.getElementById('tapArea'),

    // Long jump elements
    jumper: document.getElementById('jumper'),
    jumpSpeed: document.getElementById('jumpSpeed'),
    jumpDistance: document.getElementById('jumpDistance'),
    jumpAttempts: document.getElementById('jumpAttempts'),
    jumpButton: document.getElementById('jumpButton'),
    landingMark: document.getElementById('landingMark'),

    // Javelin elements
    thrower: document.getElementById('thrower'),
    javelin: document.getElementById('javelin'),
    throwAngle: document.getElementById('throwAngle'),
    throwPower: document.getElementById('throwPower'),
    throwDistance: document.getElementById('throwDistance'),
    throwAttempts: document.getElementById('throwAttempts'),
    angleSlider: document.getElementById('angleSlider'),
    angleValue: document.getElementById('angleValue'),
    throwButton: document.getElementById('throwButton'),

    // Event complete
    medalDisplay: document.getElementById('medalDisplay'),
    medalTitle: document.getElementById('medalTitle'),
    eventResult: document.getElementById('eventResult'),
    eventPerformance: document.getElementById('eventPerformance'),
    continueBtn: document.getElementById('continueBtn'),

    // Controls
    backBtn: document.getElementById('backBtn'),
    resetBtn: document.getElementById('resetBtn'),

    // Final results
    finalResultsOverlay: document.getElementById('finalResultsOverlay'),
    finalMedals: document.getElementById('finalMedals'),
    goldCount: document.getElementById('goldCount'),
    silverCount: document.getElementById('silverCount'),
    bronzeCount: document.getElementById('bronzeCount'),
    finalTotalPoints: document.getElementById('finalTotalPoints'),
    finalMessage: document.getElementById('finalMessage'),
    playAgainBtn: document.getElementById('playAgainBtn'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Track & Field Events initialized');
    setupEventListeners();
    resetAllEvents();
    showEventSelection();
}

function setupEventListeners() {
    // Event selection
    elements.eventCards.forEach(card => {
        card.addEventListener('click', handleEventSelection);
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleEventSelection(e);
        });
    });

    // Sprint event
    elements.tapArea.addEventListener('click', handleSprintTap);
    elements.tapArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleSprintTap();
    });

    // Long jump event
    elements.jumpButton.addEventListener('click', handleJumpClick);
    elements.jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleJumpClick();
    });

    // Javelin event
    elements.angleSlider.addEventListener('input', handleAngleChange);
    elements.throwButton.addEventListener('mousedown', handleThrowStart);
    elements.throwButton.addEventListener('mouseup', handleThrowRelease);
    elements.throwButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleThrowStart();
    });
    elements.throwButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleThrowRelease();
    });

    // Navigation
    elements.continueBtn.addEventListener('click', handleContinue);
    elements.continueBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleContinue();
    });

    elements.backBtn.addEventListener('click', handleBack);
    elements.backBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleBack();
    });

    elements.resetBtn.addEventListener('click', handleReset);
    elements.resetBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleReset();
    });

    elements.playAgainBtn.addEventListener('click', handleReset);
    elements.playAgainBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleReset();
    });
}

// ==========================================
// EVENT SELECTION
// ==========================================

function handleEventSelection(e) {
    const eventType = e.currentTarget.dataset.event;

    // Check if event already completed
    if (gameState.eventResults[eventType]) {
        return; // Already completed
    }

    gameState.currentEvent = eventType;
    hideAllScreens();
    elements.backBtn.style.display = 'inline-block';

    switch (eventType) {
        case 'sprint':
            showSprintEvent();
            break;
        case 'longjump':
            showLongjumpEvent();
            break;
        case 'javelin':
            showJavelinEvent();
            break;
    }
}

function showEventSelection() {
    hideAllScreens();
    elements.eventSelection.style.display = 'block';
    elements.backBtn.style.display = 'none';
    updateEventCards();
}

function updateEventCards() {
    // Update status icons for completed events
    if (gameState.eventResults.sprint) {
        elements.sprintStatus.textContent = gameState.eventResults.sprint.medal;
        document.querySelector('[data-event="sprint"]').classList.add('completed');
    }
    if (gameState.eventResults.longjump) {
        elements.longjumpStatus.textContent = gameState.eventResults.longjump.medal;
        document.querySelector('[data-event="longjump"]').classList.add('completed');
    }
    if (gameState.eventResults.javelin) {
        elements.javelinStatus.textContent = gameState.eventResults.javelin.medal;
        document.querySelector('[data-event="javelin"]').classList.add('completed');
    }
}

// ==========================================
// SPRINT EVENT
// ==========================================

function showSprintEvent() {
    resetSprintState();
    elements.sprintEvent.style.display = 'flex';
    setTimeout(startSprint, 500);
}

function resetSprintState() {
    sprintState = {
        distance: 0,
        time: 0,
        taps: 0,
        isRunning: false,
        startTime: 0,
        aiPositions: [0, 0],
    };
    updateSprintDisplay();
    elements.playerRunner.style.left = '10px';
    elements.aiRunner1.style.left = '10px';
    elements.aiRunner2.style.left = '10px';
}

function startSprint() {
    sprintState.isRunning = true;
    sprintState.startTime = Date.now();
    updateSprint();
}

function handleSprintTap() {
    if (!sprintState.isRunning) return;

    sprintState.taps++;
    sprintState.distance = Math.min(sprintState.distance + CONFIG.sprint.tapValue, CONFIG.sprint.distance);

    updateSprintDisplay();

    if (sprintState.distance >= CONFIG.sprint.distance) {
        finishSprint();
    }
}

function updateSprint() {
    if (!sprintState.isRunning) return;

    // Update time
    sprintState.time = (Date.now() - sprintState.startTime) / 1000;

    // Update AI runners
    sprintState.aiPositions[0] = Math.min(
        CONFIG.sprint.aiSpeed[0] * sprintState.time * 5,
        CONFIG.sprint.distance
    );
    sprintState.aiPositions[1] = Math.min(
        CONFIG.sprint.aiSpeed[1] * sprintState.time * 5,
        CONFIG.sprint.distance
    );

    updateSprintDisplay();

    // Check if time limit exceeded
    if (sprintState.time >= CONFIG.sprint.maxTime) {
        finishSprint();
        return;
    }

    requestAnimationFrame(updateSprint);
}

function updateSprintDisplay() {
    elements.sprintDistance.textContent = `${Math.floor(sprintState.distance)}m`;
    elements.sprintTime.textContent = `${sprintState.time.toFixed(2)}s`;
    elements.tapCount.textContent = sprintState.taps;

    // Update runner positions
    const maxWidth = elements.playerRunner.parentElement.clientWidth - 50;
    elements.playerRunner.style.left = `${(sprintState.distance / CONFIG.sprint.distance) * maxWidth}px`;
    elements.aiRunner1.style.left = `${(sprintState.aiPositions[0] / CONFIG.sprint.distance) * maxWidth}px`;
    elements.aiRunner2.style.left = `${(sprintState.aiPositions[1] / CONFIG.sprint.distance) * maxWidth}px`;
}

function finishSprint() {
    sprintState.isRunning = false;

    // Calculate score based on time (10-20 seconds)
    const timeScore = Math.max(0, 100 - (sprintState.time - 10) * 5);
    const score = Math.round(Math.max(0, Math.min(100, timeScore)));

    gameState.eventResults.sprint = {
        score: score,
        time: sprintState.time.toFixed(2),
        medal: getMedal(score),
    };

    updateMedalCount(getMedal(score));
    gameState.totalPoints += score;
    gameState.eventsCompleted++;
    updateHeader();

    setTimeout(() => showEventComplete('sprint', score), 500);
}

// ==========================================
// LONG JUMP EVENT
// ==========================================

function showLongjumpEvent() {
    resetLongjumpState();
    elements.longjumpEvent.style.display = 'flex';
}

function resetLongjumpState() {
    longjumpState = {
        attemptsLeft: CONFIG.longjump.attempts,
        bestDistance: 0,
        speed: 0,
        isRunning: false,
        hasJumped: false,
        runupStart: 0,
    };
    updateLongjumpDisplay();
    elements.jumper.style.left = '10px';
    elements.jumper.classList.remove('jumping');
    elements.landingMark.classList.remove('visible');
}

function handleJumpClick() {
    if (longjumpState.isRunning || longjumpState.hasJumped) return;
    if (longjumpState.attemptsLeft <= 0) return;

    longjumpState.isRunning = true;
    longjumpState.runupStart = Date.now();
    longjumpState.speed = 0;

    buildSpeed();
}

function buildSpeed() {
    if (!longjumpState.isRunning) return;

    const elapsed = Date.now() - longjumpState.runupStart;
    longjumpState.speed = Math.min(100, (elapsed / CONFIG.longjump.runupTime) * 100);

    // Move jumper along runway
    const runwayWidth = elements.jumper.parentElement.clientWidth - 80;
    elements.jumper.style.left = `${10 + (longjumpState.speed / 100) * runwayWidth}px`;

    updateLongjumpDisplay();

    if (elapsed < CONFIG.longjump.runupTime) {
        requestAnimationFrame(buildSpeed);
    } else {
        // Auto jump at end of runway
        performJump();
    }
}

function performJump() {
    longjumpState.isRunning = false;
    longjumpState.hasJumped = true;

    // Calculate jump distance based on speed and timing
    const speedFactor = longjumpState.speed / 100;
    const distance = CONFIG.longjump.minDistance +
        (CONFIG.longjump.maxDistance - CONFIG.longjump.minDistance) * speedFactor;

    const finalDistance = Math.min(distance, CONFIG.longjump.maxDistance);

    // Animate jump
    elements.jumper.classList.add('jumping');
    const jumpPixels = (finalDistance / CONFIG.longjump.maxDistance) * 200;
    elements.jumper.style.setProperty('--jump-distance', `${jumpPixels}px`);

    // Show landing mark
    setTimeout(() => {
        const sandPitWidth = elements.landingMark.parentElement.clientWidth;
        const markPosition = ((finalDistance - CONFIG.longjump.minDistance) /
            (CONFIG.longjump.maxDistance - CONFIG.longjump.minDistance)) * sandPitWidth;
        elements.landingMark.style.left = `${markPosition}px`;
        elements.landingMark.classList.add('visible');
    }, 600);

    // Update best distance
    if (finalDistance > longjumpState.bestDistance) {
        longjumpState.bestDistance = finalDistance;
    }

    longjumpState.attemptsLeft--;
    updateLongjumpDisplay();

    setTimeout(() => {
        if (longjumpState.attemptsLeft > 0) {
            resetJumpAttempt();
        } else {
            finishLongjump();
        }
    }, 2000);
}

function resetJumpAttempt() {
    longjumpState.isRunning = false;
    longjumpState.hasJumped = false;
    longjumpState.speed = 0;
    elements.jumper.style.left = '10px';
    elements.jumper.classList.remove('jumping');
    elements.landingMark.classList.remove('visible');
}

function updateLongjumpDisplay() {
    elements.jumpSpeed.textContent = `${Math.round(longjumpState.speed)}%`;
    elements.jumpDistance.textContent = `${longjumpState.bestDistance.toFixed(2)}m`;
    elements.jumpAttempts.textContent = longjumpState.attemptsLeft;
}

function finishLongjump() {
    // Calculate score based on distance (4-8.5m range)
    const distanceScore = ((longjumpState.bestDistance - 4) / 4.5) * 100;
    const score = Math.round(Math.max(0, Math.min(100, distanceScore)));

    gameState.eventResults.longjump = {
        score: score,
        distance: longjumpState.bestDistance.toFixed(2),
        medal: getMedal(score),
    };

    updateMedalCount(getMedal(score));
    gameState.totalPoints += score;
    gameState.eventsCompleted++;
    updateHeader();

    setTimeout(() => showEventComplete('longjump', score), 500);
}

// ==========================================
// JAVELIN EVENT
// ==========================================

function showJavelinEvent() {
    resetJavelinState();
    elements.javelinEvent.style.display = 'flex';
}

function resetJavelinState() {
    javelinState = {
        attemptsLeft: CONFIG.javelin.attempts,
        bestDistance: 0,
        angle: 45,
        power: 0,
        isCharging: false,
        chargeStart: 0,
    };
    updateJavelinDisplay();
    elements.angleSlider.value = 45;
    elements.javelin.classList.remove('throwing');
    resetJavelinPosition();
}

function resetJavelinPosition() {
    elements.javelin.style.transform = 'translate(0, 0) rotate(-45deg)';
}

function handleAngleChange() {
    javelinState.angle = parseInt(elements.angleSlider.value);
    elements.angleValue.textContent = javelinState.angle;
    elements.throwAngle.textContent = `${javelinState.angle}°`;
}

function handleThrowStart() {
    if (javelinState.isCharging || javelinState.attemptsLeft <= 0) return;

    javelinState.isCharging = true;
    javelinState.chargeStart = Date.now();
    javelinState.power = 0;

    elements.throwButton.classList.add('charging');
    chargePower();
}

function chargePower() {
    if (!javelinState.isCharging) return;

    const elapsed = Date.now() - javelinState.chargeStart;
    javelinState.power = Math.min(100, (elapsed / CONFIG.javelin.chargeTime) * 100);

    updateJavelinDisplay();

    if (elapsed < CONFIG.javelin.chargeTime) {
        requestAnimationFrame(chargePower);
    }
}

function handleThrowRelease() {
    if (!javelinState.isCharging) return;

    javelinState.isCharging = false;
    elements.throwButton.classList.remove('charging');

    performThrow();
}

function performThrow() {
    // Calculate distance based on angle and power
    const angleDiff = Math.abs(javelinState.angle - CONFIG.javelin.optimalAngle);
    const angleFactor = 1 - (angleDiff / 50); // Penalty for non-optimal angle
    const powerFactor = javelinState.power / 100;

    const distance = CONFIG.javelin.maxDistance * angleFactor * powerFactor;
    const finalDistance = Math.max(0, distance);

    // Update best distance
    if (finalDistance > javelinState.bestDistance) {
        javelinState.bestDistance = finalDistance;
    }

    // Animate throw
    elements.javelin.classList.add('throwing');
    const throwX = (finalDistance / CONFIG.javelin.maxDistance) * 200;
    const throwY = -50 - Math.sin((javelinState.angle * Math.PI) / 180) * 80;

    elements.javelin.style.setProperty('--throw-x', `${throwX}px`);
    elements.javelin.style.setProperty('--throw-y', `${throwY}px`);
    elements.javelin.style.setProperty('--throw-x-final', `${throwX}px`);
    elements.javelin.style.setProperty('--throw-angle', `${javelinState.angle}deg`);

    javelinState.attemptsLeft--;
    javelinState.power = 0;
    updateJavelinDisplay();

    setTimeout(() => {
        if (javelinState.attemptsLeft > 0) {
            resetThrowAttempt();
        } else {
            finishJavelin();
        }
    }, 2500);
}

function resetThrowAttempt() {
    elements.javelin.classList.remove('throwing');
    resetJavelinPosition();
    javelinState.power = 0;
    updateJavelinDisplay();
}

function updateJavelinDisplay() {
    elements.throwAngle.textContent = `${javelinState.angle}°`;
    elements.throwPower.textContent = `${Math.round(javelinState.power)}%`;
    elements.throwDistance.textContent = `${javelinState.bestDistance.toFixed(2)}m`;
    elements.throwAttempts.textContent = javelinState.attemptsLeft;
}

function finishJavelin() {
    // Calculate score based on distance (0-90m range)
    const distanceScore = (javelinState.bestDistance / CONFIG.javelin.maxDistance) * 100;
    const score = Math.round(Math.max(0, Math.min(100, distanceScore)));

    gameState.eventResults.javelin = {
        score: score,
        distance: javelinState.bestDistance.toFixed(2),
        medal: getMedal(score),
    };

    updateMedalCount(getMedal(score));
    gameState.totalPoints += score;
    gameState.eventsCompleted++;
    updateHeader();

    setTimeout(() => showEventComplete('javelin', score), 500);
}

// ==========================================
// EVENT COMPLETE
// ==========================================

function showEventComplete(eventType, score) {
    hideAllScreens();
    elements.eventComplete.style.display = 'flex';

    const medalInfo = getMedalInfo(score);
    const medalIcon = elements.eventComplete.querySelector('.medal-icon');
    medalIcon.textContent = medalInfo.emoji;

    elements.medalTitle.textContent = `${medalInfo.name} Medal!`;
    elements.eventResult.textContent = `Score: ${score} points`;
    elements.eventPerformance.textContent = medalInfo.message;

    // Show specific event stats
    const result = gameState.eventResults[eventType];
    if (eventType === 'sprint') {
        elements.eventPerformance.textContent += ` Time: ${result.time}s`;
    } else if (eventType === 'longjump') {
        elements.eventPerformance.textContent += ` Distance: ${result.distance}m`;
    } else if (eventType === 'javelin') {
        elements.eventPerformance.textContent += ` Distance: ${result.distance}m`;
    }
}

// ==========================================
// SCORING & MEDALS
// ==========================================

function getMedal(score) {
    if (score >= CONFIG.scoring.gold.min) return CONFIG.scoring.gold.emoji;
    if (score >= CONFIG.scoring.silver.min) return CONFIG.scoring.silver.emoji;
    if (score >= CONFIG.scoring.bronze.min) return CONFIG.scoring.bronze.emoji;
    return CONFIG.scoring.none.emoji;
}

function getMedalInfo(score) {
    if (score >= CONFIG.scoring.gold.min) {
        return { name: 'Gold', emoji: CONFIG.scoring.gold.emoji, message: CONFIG.scoring.gold.message };
    }
    if (score >= CONFIG.scoring.silver.min) {
        return { name: 'Silver', emoji: CONFIG.scoring.silver.emoji, message: CONFIG.scoring.silver.message };
    }
    if (score >= CONFIG.scoring.bronze.min) {
        return { name: 'Bronze', emoji: CONFIG.scoring.bronze.emoji, message: CONFIG.scoring.bronze.message };
    }
    return { name: 'Participation', emoji: CONFIG.scoring.none.emoji, message: CONFIG.scoring.none.message };
}

function updateMedalCount(medal) {
    if (medal === '🥇') gameState.medals.gold++;
    else if (medal === '🥈') gameState.medals.silver++;
    else if (medal === '🥉') gameState.medals.bronze++;
}

// ==========================================
// NAVIGATION
// ==========================================

function handleContinue() {
    if (gameState.eventsCompleted >= 3) {
        showFinalResults();
    } else {
        showEventSelection();
    }
}

function handleBack() {
    // Stop any running events
    sprintState.isRunning = false;
    longjumpState.isRunning = false;
    javelinState.isCharging = false;

    showEventSelection();
}

function handleReset() {
    resetAllEvents();
    elements.finalResultsOverlay.style.display = 'none';
    showEventSelection();
}

function resetAllEvents() {
    gameState = {
        totalPoints: 0,
        eventsCompleted: 0,
        currentEvent: null,
        medals: { gold: 0, silver: 0, bronze: 0 },
        eventResults: {
            sprint: null,
            longjump: null,
            javelin: null,
        },
    };

    // Remove completed class from event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.classList.remove('completed');
    });

    // Clear status icons
    elements.sprintStatus.textContent = '';
    elements.longjumpStatus.textContent = '';
    elements.javelinStatus.textContent = '';

    updateHeader();
}

// ==========================================
// FINAL RESULTS
// ==========================================

function showFinalResults() {
    elements.finalResultsOverlay.style.display = 'flex';

    elements.goldCount.textContent = gameState.medals.gold;
    elements.silverCount.textContent = gameState.medals.silver;
    elements.bronzeCount.textContent = gameState.medals.bronze;
    elements.finalTotalPoints.textContent = gameState.totalPoints;

    // Determine final message
    const avgScore = gameState.totalPoints / 3;
    let message = '';
    if (avgScore >= 85) {
        message = '🏆 Olympic Champion! You dominated all events!';
    } else if (avgScore >= 70) {
        message = '⭐ Incredible Athlete! Outstanding performance!';
    } else if (avgScore >= 50) {
        message = '💪 Great Effort! Keep up the good work!';
    } else {
        message = '🎯 Nice Try! Practice makes perfect!';
    }

    elements.finalMessage.textContent = message;
}

// ==========================================
// UI HELPERS
// ==========================================

function hideAllScreens() {
    elements.eventSelection.style.display = 'none';
    elements.sprintEvent.style.display = 'none';
    elements.longjumpEvent.style.display = 'none';
    elements.javelinEvent.style.display = 'none';
    elements.eventComplete.style.display = 'none';
}

function updateHeader() {
    elements.totalPoints.textContent = gameState.totalPoints;
    elements.eventsCompleted.textContent = `${gameState.eventsCompleted}/3`;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
