'use strict';

// === Configuration ===
const CONFIG = {
    saveInterval: 5000, // Auto-save every 5 seconds
    updateInterval: 100, // Update cookies per second display every 100ms
};

// === Upgrade Definitions ===
const UPGRADES = [
    {
        id: 'cursor',
        name: 'Cursor',
        icon: '👆',
        description: 'Clicks the cookie for you',
        baseCost: 15,
        cps: 0.1,
        costMultiplier: 1.15
    },
    {
        id: 'grandma',
        name: 'Grandma',
        icon: '👵',
        description: 'A nice grandma to bake cookies',
        baseCost: 100,
        cps: 1,
        costMultiplier: 1.15
    },
    {
        id: 'farm',
        name: 'Cookie Farm',
        icon: '🌾',
        description: 'Grows cookie plants',
        baseCost: 500,
        cps: 5,
        costMultiplier: 1.15
    },
    {
        id: 'factory',
        name: 'Cookie Factory',
        icon: '🏭',
        description: 'Mass produces cookies',
        baseCost: 3000,
        cps: 25,
        costMultiplier: 1.15
    },
    {
        id: 'mine',
        name: 'Cookie Mine',
        icon: '⛏️',
        description: 'Mines cookie ore from the ground',
        baseCost: 10000,
        cps: 100,
        costMultiplier: 1.15
    },
    {
        id: 'spaceship',
        name: 'Cookie Spaceship',
        icon: '🚀',
        description: 'Brings cookies from space',
        baseCost: 50000,
        cps: 500,
        costMultiplier: 1.15
    },
    {
        id: 'timemachine',
        name: 'Time Machine',
        icon: '⏰',
        description: 'Brings cookies from the past and future',
        baseCost: 250000,
        cps: 2500,
        costMultiplier: 1.15
    }
];

// === State Management ===
let gameState = {
    cookies: 0,
    totalCookies: 0,
    cookiesPerSecond: 0,
    upgrades: {},
    clickPower: 1,
    lastUpdate: Date.now()
};

// Initialize upgrade counts
UPGRADES.forEach(upgrade => {
    gameState.upgrades[upgrade.id] = 0;
});

// === DOM References ===
const elements = {
    cookie: document.getElementById('cookie'),
    cookieCount: document.getElementById('cookieCount'),
    cookiesPerSecond: document.getElementById('cookiesPerSecond'),
    shopItems: document.getElementById('shopItems'),
    clickFeedback: document.getElementById('clickFeedback'),
    instructionsOverlay: document.getElementById('instructionsOverlay'),
    closeInstructions: document.getElementById('closeInstructions'),
    infoBtn: document.getElementById('infoBtn'),
    resetBtn: document.getElementById('resetBtn')
};

// === Initialization ===
function initGame() {
    loadGame();
    setupEventListeners();
    renderShop();
    updateDisplay();
    startGameLoop();

    // Show instructions on first visit
    if (!localStorage.getItem('cookieClickerPlayed')) {
        showInstructions();
        localStorage.setItem('cookieClickerPlayed', 'true');
    }
}

// === Event Listeners ===
function setupEventListeners() {
    // Cookie click events (both touch and mouse)
    elements.cookie.addEventListener('touchstart', handleCookieClick);
    elements.cookie.addEventListener('click', handleCookieClick);

    // Prevent default touch behavior to avoid double-firing
    elements.cookie.addEventListener('touchend', (e) => {
        e.preventDefault();
    });

    // Instructions overlay
    elements.closeInstructions.addEventListener('touchstart', hideInstructions);
    elements.closeInstructions.addEventListener('click', hideInstructions);

    elements.infoBtn.addEventListener('touchstart', showInstructions);
    elements.infoBtn.addEventListener('click', showInstructions);

    // Reset button
    elements.resetBtn.addEventListener('touchstart', handleReset);
    elements.resetBtn.addEventListener('click', handleReset);

    // Prevent page scrolling on game container
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-container')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// === Cookie Click Handler ===
function handleCookieClick(e) {
    e.preventDefault();

    // Add cookies based on click power
    gameState.cookies += gameState.clickPower;
    gameState.totalCookies += gameState.clickPower;

    // Show click feedback animation
    showClickFeedback(e);

    // Update display
    updateDisplay();
}

// === Click Feedback Animation ===
function showClickFeedback(e) {
    const feedback = document.createElement('div');
    feedback.className = 'click-number';
    feedback.textContent = `+${gameState.clickPower}`;

    // Position the feedback near the click/touch location
    let x, y;
    if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }

    const rect = elements.clickFeedback.getBoundingClientRect();
    feedback.style.left = (x - rect.left) + 'px';
    feedback.style.top = (y - rect.top) + 'px';

    elements.clickFeedback.appendChild(feedback);

    // Remove after animation completes
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// === Shop Rendering ===
function renderShop() {
    elements.shopItems.innerHTML = '';

    UPGRADES.forEach(upgrade => {
        const cost = calculateUpgradeCost(upgrade);
        const owned = gameState.upgrades[upgrade.id];
        const canAfford = gameState.cookies >= cost;

        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? 'affordable' : ''} ${!canAfford ? 'disabled' : ''}`;
        item.dataset.upgradeId = upgrade.id;

        item.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">
                    <span class="shop-item-icon">${upgrade.icon}</span>
                    <span>${upgrade.name}</span>
                </div>
                <div class="shop-item-description">${upgrade.description}</div>
                <div class="shop-item-stats">+${upgrade.cps} cookies/sec</div>
            </div>
            <div class="shop-item-purchase">
                <div class="shop-item-cost">${formatNumber(cost)} 🍪</div>
                <div class="shop-item-owned">Owned: ${owned}</div>
            </div>
        `;

        // Add click handlers
        if (canAfford) {
            item.addEventListener('touchstart', () => purchaseUpgrade(upgrade.id));
            item.addEventListener('click', () => purchaseUpgrade(upgrade.id));
        }

        elements.shopItems.appendChild(item);
    });
}

// === Purchase Upgrade ===
function purchaseUpgrade(upgradeId) {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    const cost = calculateUpgradeCost(upgrade);

    if (gameState.cookies >= cost) {
        gameState.cookies -= cost;
        gameState.upgrades[upgradeId]++;

        // Recalculate cookies per second
        calculateCookiesPerSecond();

        // Update display and shop
        updateDisplay();
        renderShop();

        // Save game
        saveGame();
    }
}

// === Calculate Upgrade Cost ===
function calculateUpgradeCost(upgrade) {
    const owned = gameState.upgrades[upgrade.id];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
}

// === Calculate Cookies Per Second ===
function calculateCookiesPerSecond() {
    let cps = 0;

    UPGRADES.forEach(upgrade => {
        const owned = gameState.upgrades[upgrade.id];
        cps += upgrade.cps * owned;
    });

    gameState.cookiesPerSecond = cps;
}

// === Game Loop ===
function startGameLoop() {
    setInterval(() => {
        // Calculate time elapsed since last update
        const now = Date.now();
        const deltaTime = (now - gameState.lastUpdate) / 1000; // Convert to seconds
        gameState.lastUpdate = now;

        // Add cookies based on CPS
        if (gameState.cookiesPerSecond > 0) {
            const cookiesEarned = gameState.cookiesPerSecond * deltaTime;
            gameState.cookies += cookiesEarned;
            gameState.totalCookies += cookiesEarned;
            updateDisplay();
        }
    }, CONFIG.updateInterval);

    // Auto-save periodically
    setInterval(() => {
        saveGame();
    }, CONFIG.saveInterval);
}

// === Update Display ===
function updateDisplay() {
    elements.cookieCount.textContent = formatNumber(Math.floor(gameState.cookies));
    elements.cookiesPerSecond.textContent = formatNumber(gameState.cookiesPerSecond.toFixed(1));

    // Update shop affordability
    updateShopAffordability();
}

// === Update Shop Affordability ===
function updateShopAffordability() {
    const shopItems = elements.shopItems.querySelectorAll('.shop-item');

    shopItems.forEach(item => {
        const upgradeId = item.dataset.upgradeId;
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        const cost = calculateUpgradeCost(upgrade);
        const canAfford = gameState.cookies >= cost;

        if (canAfford) {
            item.classList.add('affordable');
            item.classList.remove('disabled');
        } else {
            item.classList.remove('affordable');
            item.classList.add('disabled');
        }
    });
}

// === Format Number ===
function formatNumber(num) {
    if (num < 1000) {
        return num.toString();
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num < 1000000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else {
        return (num / 1000000000000).toFixed(1) + 'T';
    }
}

// === Save Game ===
function saveGame() {
    try {
        const saveData = {
            cookies: gameState.cookies,
            totalCookies: gameState.totalCookies,
            upgrades: gameState.upgrades,
            clickPower: gameState.clickPower,
            lastSave: Date.now()
        };

        localStorage.setItem('cookieClickerSave', JSON.stringify(saveData));
    } catch (e) {
        console.log('Could not save game:', e);
    }
}

// === Load Game ===
function loadGame() {
    try {
        const saveData = localStorage.getItem('cookieClickerSave');

        if (saveData) {
            const data = JSON.parse(saveData);

            gameState.cookies = data.cookies || 0;
            gameState.totalCookies = data.totalCookies || 0;
            gameState.upgrades = data.upgrades || {};
            gameState.clickPower = data.clickPower || 1;

            // Calculate offline earnings
            if (data.lastSave) {
                const offlineTime = (Date.now() - data.lastSave) / 1000; // Seconds
                calculateCookiesPerSecond();

                if (gameState.cookiesPerSecond > 0 && offlineTime < 3600) { // Max 1 hour offline earnings
                    const offlineEarnings = gameState.cookiesPerSecond * offlineTime;
                    gameState.cookies += offlineEarnings;
                    gameState.totalCookies += offlineEarnings;

                    if (offlineEarnings > 0) {
                        setTimeout(() => {
                            alert(`Welcome back! You earned ${formatNumber(Math.floor(offlineEarnings))} cookies while you were away!`);
                        }, 500);
                    }
                }
            }

            calculateCookiesPerSecond();
        }
    } catch (e) {
        console.log('Could not load game:', e);
    }

    gameState.lastUpdate = Date.now();
}

// === Reset Game ===
function handleReset(e) {
    e.preventDefault();

    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
        localStorage.removeItem('cookieClickerSave');

        // Reset game state
        gameState.cookies = 0;
        gameState.totalCookies = 0;
        gameState.cookiesPerSecond = 0;
        gameState.clickPower = 1;

        UPGRADES.forEach(upgrade => {
            gameState.upgrades[upgrade.id] = 0;
        });

        // Update display and shop
        updateDisplay();
        renderShop();
    }
}

// === Instructions Overlay ===
function showInstructions(e) {
    if (e) e.preventDefault();
    elements.instructionsOverlay.classList.remove('hidden');
    elements.instructionsOverlay.style.display = 'flex';
}

function hideInstructions(e) {
    if (e) e.preventDefault();
    elements.instructionsOverlay.classList.add('hidden');
    elements.instructionsOverlay.style.display = 'none';
}

// === Start Game ===
document.addEventListener('DOMContentLoaded', initGame);
