'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    maxHP: 100,
    attackDamage: { min: 15, max: 25 },
    specialDamage: { min: 30, max: 40 },
    defendReduction: 0.5, // 50% damage reduction
    specialCooldown: 2, // Can use special every 2 turns
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    round: 1,
    currentTurn: 1, // 1 or 2
    isPlaying: false,
    player1: {
        hp: CONFIG.maxHP,
        maxHP: CONFIG.maxHP,
        defending: false,
        specialCooldown: 0,
    },
    player2: {
        hp: CONFIG.maxHP,
        maxHP: CONFIG.maxHP,
        defending: false,
        specialCooldown: 0,
    },
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    attackBtn: document.getElementById('attackBtn'),
    defendBtn: document.getElementById('defendBtn'),
    specialBtn: document.getElementById('specialBtn'),

    // Display elements
    roundDisplay: document.getElementById('round'),
    turnDisplay: document.getElementById('turn'),
    winnerText: document.getElementById('winnerText'),
    winnerName: document.getElementById('winnerName'),
    finalRoundDisplay: document.getElementById('finalRound'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    battleArena: document.getElementById('battleArena'),
    actionButtons: document.getElementById('actionButtons'),
    battleLog: document.getElementById('battleLog'),

    // Fighter elements
    fighter1: document.getElementById('fighter1'),
    fighter2: document.getElementById('fighter2'),
    hp1Display: document.getElementById('hp1'),
    hp2Display: document.getElementById('hp2'),
    health1: document.getElementById('health1'),
    health2: document.getElementById('health2'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Turn-Based Battle initialized');
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
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Action buttons
    elements.attackBtn.addEventListener('touchstart', (e) => handleAction(e, 'attack'));
    elements.attackBtn.addEventListener('click', (e) => handleAction(e, 'attack'));

    elements.defendBtn.addEventListener('touchstart', (e) => handleAction(e, 'defend'));
    elements.defendBtn.addEventListener('click', (e) => handleAction(e, 'defend'));

    elements.specialBtn.addEventListener('touchstart', (e) => handleAction(e, 'special'));
    elements.specialBtn.addEventListener('click', (e) => handleAction(e, 'special'));
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.round = 1;
    gameState.currentTurn = 1;
    gameState.player1.hp = CONFIG.maxHP;
    gameState.player2.hp = CONFIG.maxHP;
    gameState.player1.defending = false;
    gameState.player2.defending = false;
    gameState.player1.specialCooldown = 0;
    gameState.player2.specialCooldown = 0;

    // Update UI
    elements.gameMessage.style.display = 'none';
    elements.battleArena.style.display = 'flex';
    elements.actionButtons.style.display = 'flex';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'inline-block';

    updateDisplay();
    updateTurnIndicator();
    clearBattleLog();
    addBattleLog('Battle Start! Player 1 goes first!');

    console.log('Game started');
}

function endGame(winner) {
    gameState.isPlaying = false;

    // Show game over overlay
    elements.winnerName.textContent = `Player ${winner}`;
    elements.finalRoundDisplay.textContent = gameState.round;
    setTimeout(() => {
        elements.gameOverOverlay.style.display = 'flex';
    }, 1500);

    console.log('Game ended. Winner:', winner);
}

function resetGame() {
    gameState.round = 1;
    gameState.currentTurn = 1;
    gameState.isPlaying = false;
    gameState.player1.hp = CONFIG.maxHP;
    gameState.player2.hp = CONFIG.maxHP;
    gameState.player1.defending = false;
    gameState.player2.defending = false;
    gameState.player1.specialCooldown = 0;
    gameState.player2.specialCooldown = 0;

    // Reset UI
    elements.gameMessage.style.display = 'block';
    elements.battleArena.style.display = 'none';
    elements.actionButtons.style.display = 'none';
    elements.startBtn.style.display = 'inline-block';
    elements.restartBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    updateDisplay();
    clearBattleLog();

    console.log('Game reset');
}

// ==========================================
// ACTION HANDLERS
// ==========================================

function handleAction(e, action) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const attacker = gameState.currentTurn === 1 ? gameState.player1 : gameState.player2;
    const defender = gameState.currentTurn === 1 ? gameState.player2 : gameState.player1;
    const attackerElement = gameState.currentTurn === 1 ? elements.fighter1 : elements.fighter2;
    const defenderElement = gameState.currentTurn === 1 ? elements.fighter2 : elements.fighter1;

    // Clear defending status
    attacker.defending = false;
    defender.defending = false;

    if (action === 'attack') {
        performAttack(attacker, defender, attackerElement, defenderElement, false);
    } else if (action === 'defend') {
        performDefend(attacker);
    } else if (action === 'special') {
        if (attacker.specialCooldown > 0) {
            addBattleLog(`Player ${gameState.currentTurn} - Special not ready! (${attacker.specialCooldown} turns left)`);
            return;
        }
        performAttack(attacker, defender, attackerElement, defenderElement, true);
        attacker.specialCooldown = CONFIG.specialCooldown;
    }

    // Update cooldowns
    if (attacker.specialCooldown > 0 && action !== 'special') {
        attacker.specialCooldown--;
    }

    // Check for game over
    if (defender.hp <= 0) {
        defender.hp = 0;
        updateDisplay();
        endGame(gameState.currentTurn);
        return;
    }

    // Next turn
    nextTurn();
}

function performAttack(attacker, defender, attackerEl, defenderEl, isSpecial) {
    const damageRange = isSpecial ? CONFIG.specialDamage : CONFIG.attackDamage;
    let damage = randomInt(damageRange.min, damageRange.max);

    // Apply defense reduction
    if (defender.defending) {
        damage = Math.floor(damage * CONFIG.defendReduction);
        addBattleLog(`Player ${3 - gameState.currentTurn} is defending! Damage reduced!`, 'defend');
    }

    // Apply damage
    defender.hp = Math.max(0, defender.hp - damage);

    // Animations
    attackerEl.classList.add('attacking');
    setTimeout(() => attackerEl.classList.remove('attacking'), 500);

    defenderEl.classList.add('damaged');
    setTimeout(() => defenderEl.classList.remove('damaged'), 300);

    // Log
    const actionText = isSpecial ? 'Special Attack' : 'Attack';
    addBattleLog(`Player ${gameState.currentTurn} - ${actionText}! Deals ${damage} damage!`, isSpecial ? 'special' : 'attack');

    updateDisplay();
}

function performDefend(attacker) {
    attacker.defending = true;

    const attackerElement = gameState.currentTurn === 1 ? elements.fighter1 : elements.fighter2;
    attackerElement.classList.add('defending');
    setTimeout(() => attackerElement.classList.remove('defending'), 1000);

    addBattleLog(`Player ${gameState.currentTurn} takes a defensive stance!`, 'defend');
}

function nextTurn() {
    // Switch turns
    gameState.currentTurn = gameState.currentTurn === 1 ? 2 : 1;

    // New round if back to player 1
    if (gameState.currentTurn === 1) {
        gameState.round++;
        updateRoundDisplay();
    }

    updateTurnIndicator();
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

function updateDisplay() {
    // Update HP displays
    elements.hp1Display.textContent = gameState.player1.hp;
    elements.hp2Display.textContent = gameState.player2.hp;

    // Update health bars
    const hp1Percent = (gameState.player1.hp / gameState.player1.maxHP) * 100;
    const hp2Percent = (gameState.player2.hp / gameState.player2.maxHP) * 100;

    elements.health1.querySelector('.health-fill').style.width = hp1Percent + '%';
    elements.health2.querySelector('.health-fill').style.width = hp2Percent + '%';

    // Update health bar colors
    updateHealthBarColor(elements.health1, hp1Percent);
    updateHealthBarColor(elements.health2, hp2Percent);

    // Update special button state
    const currentPlayer = gameState.currentTurn === 1 ? gameState.player1 : gameState.player2;
    if (currentPlayer.specialCooldown > 0) {
        elements.specialBtn.disabled = true;
        elements.specialBtn.textContent = `✨ Special (${currentPlayer.specialCooldown})`;
    } else {
        elements.specialBtn.disabled = false;
        elements.specialBtn.textContent = '✨ Special';
    }
}

function updateHealthBarColor(healthBar, percent) {
    healthBar.classList.remove('low', 'medium');
    if (percent <= 25) {
        healthBar.classList.add('low');
    } else if (percent <= 50) {
        healthBar.classList.add('medium');
    }
}

function updateRoundDisplay() {
    elements.roundDisplay.textContent = gameState.round;
}

function updateTurnIndicator() {
    elements.turnDisplay.textContent = `Player ${gameState.currentTurn}`;

    // Update active fighter
    elements.fighter1.classList.toggle('active', gameState.currentTurn === 1);
    elements.fighter2.classList.toggle('active', gameState.currentTurn === 2);
}

function addBattleLog(message, type = '') {
    const logMessage = document.createElement('div');
    logMessage.className = `log-message ${type}`;
    logMessage.textContent = message;

    elements.battleLog.insertBefore(logMessage, elements.battleLog.firstChild);

    // Keep only last 5 messages
    while (elements.battleLog.children.length > 5) {
        elements.battleLog.removeChild(elements.battleLog.lastChild);
    }
}

function clearBattleLog() {
    elements.battleLog.innerHTML = '';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
