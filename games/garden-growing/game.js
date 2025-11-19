'use strict';

// === Configuration ===
const CONFIG = {
    gridSize: 9, // 3x3 grid
    growTime: 3000, // Time for plant to grow (ms)
    gameTime: 60, // Game duration in seconds
    points: {
        tomato: 10,
        carrot: 15,
        corn: 20,
        flower: 25
    }
};

// === State Management ===
let gameState = {
    score: 0,
    harvested: 0,
    isPlaying: false,
    timeLeft: CONFIG.gameTime,
    selectedSeed: 'tomato',
    plots: [], // Array to track plot states
    timerInterval: null
};

// === DOM References ===
const elements = {
    gardenGrid: document.getElementById('gardenGrid'),
    score: document.getElementById('score'),
    harvested: document.getElementById('harvested'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playBtn: document.getElementById('playBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    welcomeOverlay: document.getElementById('welcomeOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    finalScore: document.getElementById('finalScore'),
    finalHarvested: document.getElementById('finalHarvested'),
    seedSelector: document.getElementById('seedSelector')
};

// === Plant Emoji Mapping ===
const PLANTS = {
    tomato: {
        stages: ['🌱', '🌿', '🍅'],
        points: CONFIG.points.tomato
    },
    carrot: {
        stages: ['🌱', '🌿', '🥕'],
        points: CONFIG.points.carrot
    },
    corn: {
        stages: ['🌱', '🌿', '🌽'],
        points: CONFIG.points.corn
    },
    flower: {
        stages: ['🌱', '🌿', '🌻'],
        points: CONFIG.points.flower
    }
};

// === Initialization ===
function initGame() {
    createGardenGrid();
    setupEventListeners();
    resetGame();
}

function createGardenGrid() {
    elements.gardenGrid.innerHTML = '';
    gameState.plots = [];

    for (let i = 0; i < CONFIG.gridSize; i++) {
        const plot = document.createElement('div');
        plot.className = 'plot empty';
        plot.dataset.index = i;

        // Add both touch and click events
        plot.addEventListener('touchstart', handlePlotInteraction);
        plot.addEventListener('click', handlePlotInteraction);

        elements.gardenGrid.appendChild(plot);

        // Initialize plot state
        gameState.plots.push({
            state: 'empty', // empty, planted, growing, ready
            plantType: null,
            stage: 0,
            growthTimer: null
        });
    }
}

function setupEventListeners() {
    // Start buttons
    elements.startBtn.addEventListener('touchstart', startGame);
    elements.startBtn.addEventListener('click', startGame);

    elements.playBtn.addEventListener('touchstart', startGame);
    elements.playBtn.addEventListener('click', startGame);

    // Restart buttons
    elements.restartBtn.addEventListener('touchstart', restartGame);
    elements.restartBtn.addEventListener('click', restartGame);

    elements.playAgainBtn.addEventListener('touchstart', restartGame);
    elements.playAgainBtn.addEventListener('click', restartGame);

    // Seed selector buttons
    const seedButtons = elements.seedSelector.querySelectorAll('.seed-btn');
    seedButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => handleSeedSelection(e, btn));
        btn.addEventListener('click', (e) => handleSeedSelection(e, btn));
    });
}

function handleSeedSelection(e, btn) {
    e.preventDefault();

    // Remove active class from all buttons
    const seedButtons = elements.seedSelector.querySelectorAll('.seed-btn');
    seedButtons.forEach(b => b.classList.remove('active'));

    // Add active class to clicked button
    btn.classList.add('active');

    // Update selected seed
    gameState.selectedSeed = btn.dataset.seed;
}

// === Game Control ===
function startGame(e) {
    e.preventDefault();

    // Hide overlays
    elements.welcomeOverlay.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Show restart button
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'block';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Start game timer
    startGameTimer();
}

function restartGame(e) {
    e.preventDefault();

    // Hide game over overlay
    elements.gameOverOverlay.style.display = 'none';

    // Reset and start
    resetGame();
    gameState.isPlaying = true;

    // Start game timer
    startGameTimer();
}

function resetGame() {
    gameState.score = 0;
    gameState.harvested = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.selectedSeed = 'tomato';

    // Clear all plot timers
    gameState.plots.forEach(plot => {
        if (plot.growthTimer) {
            clearTimeout(plot.growthTimer);
        }
    });

    // Reset all plots
    const plotElements = elements.gardenGrid.querySelectorAll('.plot');
    plotElements.forEach((plotEl, index) => {
        plotEl.className = 'plot empty';
        plotEl.textContent = '';
        gameState.plots[index] = {
            state: 'empty',
            plantType: null,
            stage: 0,
            growthTimer: null
        };
    });

    updateUI();
}

function startGameTimer() {
    // Clear existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    // Clear all growth timers
    gameState.plots.forEach(plot => {
        if (plot.growthTimer) {
            clearTimeout(plot.growthTimer);
        }
    });

    // Show game over screen
    elements.finalScore.textContent = gameState.score;
    elements.finalHarvested.textContent = gameState.harvested;
    elements.gameOverOverlay.style.display = 'flex';
}

// === Plot Interaction ===
function handlePlotInteraction(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const plotIndex = parseInt(e.currentTarget.dataset.index);
    const plot = gameState.plots[plotIndex];
    const plotElement = e.currentTarget;

    if (plot.state === 'empty') {
        // Plant a seed
        plantSeed(plotIndex, plotElement);
    } else if (plot.state === 'ready') {
        // Harvest the plant
        harvestPlant(plotIndex, plotElement);
    }
}

function plantSeed(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const plantType = gameState.selectedSeed;

    // Update plot state
    plot.state = 'planted';
    plot.plantType = plantType;
    plot.stage = 0;

    // Update visual
    plotElement.className = 'plot planted';
    plotElement.textContent = PLANTS[plantType].stages[0];

    // Start growth process
    growPlant(plotIndex, plotElement);
}

function growPlant(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const plantType = plot.plantType;
    const stages = PLANTS[plantType].stages;

    // Clear any existing timer
    if (plot.growthTimer) {
        clearTimeout(plot.growthTimer);
    }

    // Grow through stages
    const growthInterval = CONFIG.growTime / (stages.length - 1);

    function nextStage() {
        if (!gameState.isPlaying) return;

        plot.stage++;

        if (plot.stage < stages.length) {
            plotElement.textContent = stages[plot.stage];

            if (plot.stage === 1) {
                plotElement.className = 'plot growing';
            }

            if (plot.stage < stages.length - 1) {
                plot.growthTimer = setTimeout(nextStage, growthInterval);
            } else {
                // Fully grown
                plot.state = 'ready';
                plotElement.className = 'plot ready';
            }
        }
    }

    plot.growthTimer = setTimeout(nextStage, growthInterval);
}

function harvestPlant(plotIndex, plotElement) {
    const plot = gameState.plots[plotIndex];
    const plantType = plot.plantType;
    const points = PLANTS[plantType].points;

    // Add points
    gameState.score += points;
    gameState.harvested++;

    // Animate harvest
    plotElement.classList.add('harvesting');

    setTimeout(() => {
        // Reset plot
        plotElement.className = 'plot empty';
        plotElement.textContent = '';

        plot.state = 'empty';
        plot.plantType = null;
        plot.stage = 0;

        if (plot.growthTimer) {
            clearTimeout(plot.growthTimer);
        }

        updateUI();
    }, 500);

    updateUI();
}

// === UI Updates ===
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.harvested.textContent = gameState.harvested;
}

// === Prevent unwanted touch behavior ===
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
