'use strict';

// ==========================================
// CONFIGURATION
// ==========================================

const CONFIG = {
    startingMoney: 50,
    items: {
        burger: { cost: 5, sellPrice: 10, emoji: '🍔' },
        hotdog: { cost: 4, sellPrice: 8, emoji: '🌭' },
        taco: { cost: 6, sellPrice: 12, emoji: '🌮' },
        drink: { cost: 2, sellPrice: 4, emoji: '🥤' }
    },
    customerEmojis: ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🧔', '👱'],
    customersPerDay: 5
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    money: CONFIG.startingMoney,
    day: 1,
    inventory: {
        burger: 0,
        hotdog: 0,
        taco: 0,
        drink: 0
    },
    currentCustomer: null,
    customersServedToday: 0,
    moneyEarnedToday: 0,
    customersRemainingToday: 0,
    isDayActive: false
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Displays
    moneyDisplay: document.getElementById('money'),
    dayDisplay: document.getElementById('day'),
    burgerCount: document.getElementById('burger-count'),
    hotdogCount: document.getElementById('hotdog-count'),
    tacoCount: document.getElementById('taco-count'),
    drinkCount: document.getElementById('drink-count'),

    // Customer
    customerPanel: document.getElementById('customerPanel'),
    customerAvatar: document.getElementById('customerAvatar'),
    requestItem: document.getElementById('requestItem'),
    requestPay: document.getElementById('requestPay'),

    // Buttons
    shopItems: document.querySelectorAll('.shop-item'),
    startDayBtn: document.getElementById('startDayBtn'),
    serveBtn: document.getElementById('serveBtn'),
    skipBtn: document.getElementById('skipBtn'),
    endDayBtn: document.getElementById('endDayBtn'),
    nextDayBtn: document.getElementById('nextDayBtn'),
    restartBtn: document.getElementById('restartBtn'),

    // Overlays
    summaryOverlay: document.getElementById('summaryOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    customersServed: document.getElementById('customersServed'),
    moneyEarned: document.getElementById('moneyEarned'),
    totalMoney: document.getElementById('totalMoney'),
    daysLasted: document.getElementById('daysLasted')
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Food Truck Manager initialized');
    setupEventListeners();
    updateAllDisplays();
}

function setupEventListeners() {
    // Shop items
    elements.shopItems.forEach(item => {
        item.addEventListener('touchstart', handleShopClick);
        item.addEventListener('click', handleShopClick);
    });

    // Control buttons
    elements.startDayBtn.addEventListener('touchstart', handleStartDay);
    elements.startDayBtn.addEventListener('click', handleStartDay);

    elements.serveBtn.addEventListener('touchstart', handleServe);
    elements.serveBtn.addEventListener('click', handleServe);

    elements.skipBtn.addEventListener('touchstart', handleSkip);
    elements.skipBtn.addEventListener('click', handleSkip);

    elements.endDayBtn.addEventListener('touchstart', handleEndDay);
    elements.endDayBtn.addEventListener('click', handleEndDay);

    elements.nextDayBtn.addEventListener('touchstart', handleNextDay);
    elements.nextDayBtn.addEventListener('click', handleNextDay);

    elements.restartBtn.addEventListener('touchstart', handleRestart);
    elements.restartBtn.addEventListener('click', handleRestart);
}

// ==========================================
// SHOP MANAGEMENT
// ==========================================

function handleShopClick(e) {
    e.preventDefault();

    if (gameState.isDayActive) {
        return; // Can't buy during day
    }

    const item = e.currentTarget.dataset.item;
    const cost = parseInt(e.currentTarget.dataset.cost);

    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.inventory[item]++;
        updateAllDisplays();

        // Visual feedback
        e.currentTarget.classList.add('pulse');
        setTimeout(() => {
            e.currentTarget.classList.remove('pulse');
        }, 300);
    } else {
        // Shake money display
        elements.moneyDisplay.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.moneyDisplay.style.animation = '';
        }, 500);
    }
}

// ==========================================
// DAY MANAGEMENT
// ==========================================

function handleStartDay(e) {
    e.preventDefault();

    gameState.isDayActive = true;
    gameState.customersServedToday = 0;
    gameState.moneyEarnedToday = 0;
    gameState.customersRemainingToday = CONFIG.customersPerDay;

    // Hide start button, show end day button
    elements.startDayBtn.style.display = 'none';
    elements.endDayBtn.style.display = 'block';

    // Spawn first customer
    spawnCustomer();
}

function handleEndDay(e) {
    e.preventDefault();
    endDay();
}

function endDay() {
    gameState.isDayActive = false;

    // Hide customer and controls
    elements.customerPanel.style.display = 'none';
    elements.serveBtn.style.display = 'none';
    elements.skipBtn.style.display = 'none';
    elements.endDayBtn.style.display = 'none';

    // Show summary
    elements.customersServed.textContent = gameState.customersServedToday;
    elements.moneyEarned.textContent = gameState.moneyEarnedToday;
    elements.totalMoney.textContent = gameState.money;
    elements.summaryOverlay.style.display = 'flex';
}

function handleNextDay(e) {
    e.preventDefault();

    elements.summaryOverlay.style.display = 'none';

    // Check if player has enough money to continue
    if (gameState.money <= 0) {
        gameOver();
        return;
    }

    gameState.day++;
    updateAllDisplays();

    // Show start button
    elements.startDayBtn.style.display = 'block';
}

function gameOver() {
    elements.daysLasted.textContent = gameState.day;
    elements.gameOverOverlay.style.display = 'flex';
}

function handleRestart(e) {
    e.preventDefault();

    // Reset game state
    gameState.money = CONFIG.startingMoney;
    gameState.day = 1;
    gameState.inventory = {
        burger: 0,
        hotdog: 0,
        taco: 0,
        drink: 0
    };
    gameState.currentCustomer = null;
    gameState.customersServedToday = 0;
    gameState.moneyEarnedToday = 0;
    gameState.customersRemainingToday = 0;
    gameState.isDayActive = false;

    // Hide overlays
    elements.gameOverOverlay.style.display = 'none';
    elements.summaryOverlay.style.display = 'none';

    // Reset UI
    elements.customerPanel.style.display = 'none';
    elements.startDayBtn.style.display = 'block';
    elements.serveBtn.style.display = 'none';
    elements.skipBtn.style.display = 'none';
    elements.endDayBtn.style.display = 'none';

    updateAllDisplays();
}

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

function spawnCustomer() {
    if (!gameState.isDayActive || gameState.customersRemainingToday <= 0) {
        return;
    }

    // Pick random item
    const items = Object.keys(CONFIG.items);
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const itemConfig = CONFIG.items[randomItem];

    gameState.currentCustomer = {
        item: randomItem,
        emoji: CONFIG.customerEmojis[Math.floor(Math.random() * CONFIG.customerEmojis.length)],
        pay: itemConfig.sellPrice
    };

    // Display customer
    elements.customerAvatar.textContent = gameState.currentCustomer.emoji;
    elements.requestItem.textContent = itemConfig.emoji;
    elements.requestPay.textContent = `Pays: $${gameState.currentCustomer.pay}`;

    elements.customerPanel.style.display = 'block';
    elements.serveBtn.style.display = 'block';
    elements.skipBtn.style.display = 'block';

    gameState.customersRemainingToday--;
}

function handleServe(e) {
    e.preventDefault();

    if (!gameState.currentCustomer) return;

    const item = gameState.currentCustomer.item;

    // Check if we have the item
    if (gameState.inventory[item] > 0) {
        // Serve the customer
        gameState.inventory[item]--;
        gameState.money += gameState.currentCustomer.pay;
        gameState.moneyEarnedToday += gameState.currentCustomer.pay;
        gameState.customersServedToday++;

        updateAllDisplays();

        // Visual feedback
        elements.serveBtn.classList.add('pulse');
        setTimeout(() => {
            elements.serveBtn.classList.remove('pulse');
        }, 300);

        // Next customer or end day
        if (gameState.customersRemainingToday > 0) {
            setTimeout(spawnCustomer, 500);
        } else {
            setTimeout(endDay, 500);
        }
    } else {
        // Don't have the item
        elements.requestItem.style.animation = 'shake 0.5s';
        setTimeout(() => {
            elements.requestItem.style.animation = '';
        }, 500);
    }
}

function handleSkip(e) {
    e.preventDefault();

    // Skip customer (no penalty)
    if (gameState.customersRemainingToday > 0) {
        spawnCustomer();
    } else {
        endDay();
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateAllDisplays() {
    elements.moneyDisplay.textContent = `$${gameState.money}`;
    elements.dayDisplay.textContent = gameState.day;
    elements.burgerCount.textContent = gameState.inventory.burger;
    elements.hotdogCount.textContent = gameState.inventory.hotdog;
    elements.tacoCount.textContent = gameState.inventory.taco;
    elements.drinkCount.textContent = gameState.inventory.drink;
}

// ==========================================
// ANIMATIONS
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
