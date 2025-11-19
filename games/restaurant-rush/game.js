'use strict';

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
    gameTime: 60,
    customerInterval: 3000,
    customerTimeout: 10,
    foods: ['pizza', 'burger', 'fries', 'drink', 'salad', 'dessert'],
    foodEmojis: {
        pizza: '🍕',
        burger: '🍔',
        fries: '🍟',
        drink: '🥤',
        salad: '🥗',
        dessert: '🍰'
    },
    customerEmojis: ['👨', '👩', '👦', '👧', '🧑', '👴', '👵']
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    timeLeft: CONFIG.gameTime,
    isPlaying: false,
    customers: [],
    customersServed: 0,
    nextCustomerId: 0,
    gameTimer: null,
    customerTimer: null
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    customersContainer: document.getElementById('customersContainer'),
    foodGrid: document.getElementById('foodGrid'),
    gameInfo: document.getElementById('gameInfo'),
    finalScore: document.getElementById('finalScore'),
    totalScore: document.getElementById('totalScore'),

    // Buttons
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    foodItems: document.querySelectorAll('.food-item'),

    // Overlays
    gameOverOverlay: document.getElementById('gameOverOverlay')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Restaurant Rush initialized');
    setupEventListeners();
    updateScoreDisplay();
    updateTimerDisplay();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Restart buttons
    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);

    // Food items
    elements.foodItems.forEach(item => {
        item.addEventListener('touchstart', handleFoodClick);
        item.addEventListener('click', handleFoodClick);
    });
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    startGame();
}

function handleRestart(e) {
    e.preventDefault();
    elements.gameOverOverlay.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    startGame();
}

function startGame() {
    // Reset state
    gameState.score = 0;
    gameState.timeLeft = CONFIG.gameTime;
    gameState.isPlaying = true;
    gameState.customers = [];
    gameState.customersServed = 0;
    gameState.nextCustomerId = 0;

    // Clear customers
    elements.customersContainer.innerHTML = '';

    // Show game UI
    elements.gameInfo.style.display = 'none';
    elements.customersContainer.style.display = 'flex';
    elements.foodGrid.style.display = 'grid';

    // Update displays
    updateScoreDisplay();
    updateTimerDisplay();

    // Start spawning customers
    spawnCustomer(); // Spawn first customer immediately
    gameState.customerTimer = setInterval(spawnCustomer, CONFIG.customerInterval);

    // Start countdown timer
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Update customer timers
    setInterval(updateCustomerTimers, 1000);
}

function endGame() {
    gameState.isPlaying = false;

    // Clear timers
    clearInterval(gameState.customerTimer);
    clearInterval(gameState.gameTimer);

    // Show game over overlay
    elements.finalScore.textContent = gameState.customersServed;
    elements.totalScore.textContent = gameState.score;
    elements.gameOverOverlay.style.display = 'flex';

    // Show restart button
    elements.restartBtn.style.display = 'block';

    // Hide game UI
    elements.customersContainer.style.display = 'none';
    elements.foodGrid.style.display = 'none';
}

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

function spawnCustomer() {
    if (!gameState.isPlaying) return;

    const customer = {
        id: gameState.nextCustomerId++,
        emoji: CONFIG.customerEmojis[Math.floor(Math.random() * CONFIG.customerEmojis.length)],
        wants: CONFIG.foods[Math.floor(Math.random() * CONFIG.foods.length)],
        timeLeft: CONFIG.customerTimeout
    };

    gameState.customers.push(customer);
    renderCustomer(customer);
}

function renderCustomer(customer) {
    const customerDiv = document.createElement('div');
    customerDiv.className = 'customer';
    customerDiv.dataset.customerId = customer.id;

    customerDiv.innerHTML = `
        <div class="customer-avatar">${customer.emoji}</div>
        <div class="customer-order">
            <h4>Wants:</h4>
            <div class="customer-wants">${CONFIG.foodEmojis[customer.wants]}</div>
        </div>
        <div class="customer-timer" data-customer-id="${customer.id}">${customer.timeLeft}</div>
    `;

    elements.customersContainer.appendChild(customerDiv);
}

function updateCustomerTimers() {
    if (!gameState.isPlaying) return;

    gameState.customers = gameState.customers.filter(customer => {
        customer.timeLeft--;

        const timerElement = document.querySelector(`.customer-timer[data-customer-id="${customer.id}"]`);
        if (timerElement) {
            timerElement.textContent = customer.timeLeft;

            // Update timer color based on time left
            if (customer.timeLeft <= 3) {
                timerElement.classList.add('danger');
            } else if (customer.timeLeft <= 5) {
                timerElement.classList.add('warning');
            }
        }

        if (customer.timeLeft <= 0) {
            removeCustomer(customer.id, false);
            return false;
        }

        return true;
    });
}

function removeCustomer(customerId, served) {
    const customerDiv = document.querySelector(`.customer[data-customer-id="${customerId}"]`);
    if (customerDiv) {
        customerDiv.classList.add('leaving');
        setTimeout(() => {
            customerDiv.remove();
        }, 300);
    }

    if (served) {
        gameState.customersServed++;
        // Calculate points based on time left
        const customer = gameState.customers.find(c => c.id === customerId);
        const points = customer ? customer.timeLeft * 10 : 10;
        gameState.score += points;
        updateScoreDisplay();
    }

    gameState.customers = gameState.customers.filter(c => c.id !== customerId);
}

// ==========================================
// FOOD SELECTION
// ==========================================

function handleFoodClick(e) {
    e.preventDefault();

    if (!gameState.isPlaying) return;

    const food = e.currentTarget.dataset.food;

    // Find customer who wants this food
    const customer = gameState.customers.find(c => c.wants === food);

    if (customer) {
        removeCustomer(customer.id, true);

        // Visual feedback
        e.currentTarget.classList.add('pulse');
        setTimeout(() => {
            e.currentTarget.classList.remove('pulse');
        }, 300);
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;

    // Add warning color when time is low
    if (gameState.timeLeft <= 10) {
        elements.timerDisplay.style.color = '#ff4444';
    } else {
        elements.timerDisplay.style.color = 'white';
    }
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
