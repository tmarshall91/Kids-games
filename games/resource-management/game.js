'use strict';

// === Configuration ===
const BUILDINGS = {
    lumberMill: {
        name: 'Lumber Mill',
        icon: '🏭',
        description: 'Produces wood over time',
        cost: { wood: 20, stone: 10, gold: 30 },
        produces: { wood: 5 },
        maxCount: 10
    },
    quarry: {
        name: 'Quarry',
        icon: '⛏️',
        description: 'Produces stone over time',
        cost: { wood: 15, stone: 15, gold: 40 },
        produces: { stone: 4 },
        maxCount: 10
    },
    farm: {
        name: 'Farm',
        icon: '🚜',
        description: 'Produces food over time',
        cost: { wood: 25, gold: 20 },
        produces: { food: 10 },
        maxCount: 15
    },
    goldMine: {
        name: 'Gold Mine',
        icon: '⚒️',
        description: 'Produces gold over time',
        cost: { wood: 30, stone: 40, gold: 50 },
        produces: { gold: 3 },
        maxCount: 5
    },
    house: {
        name: 'House',
        icon: '🏠',
        description: 'Increases population',
        cost: { wood: 40, stone: 30, gold: 20 },
        produces: {},
        population: 5,
        maxCount: 20
    },
    market: {
        name: 'Market',
        icon: '🏪',
        description: 'Boosts all production by 10%',
        cost: { wood: 50, stone: 50, gold: 100 },
        produces: {},
        bonus: 0.1,
        maxCount: 3
    }
};

const ACHIEVEMENTS = {
    firstBuilding: { name: 'First Builder', description: 'Build your first structure', unlocked: false },
    day10: { name: 'Survivor', description: 'Reach day 10', unlocked: false },
    day50: { name: 'Veteran', description: 'Reach day 50', unlocked: false },
    population100: { name: 'Metropolis', description: 'Reach 100 population', unlocked: false },
    goldRush: { name: 'Gold Rush', description: 'Accumulate 1000 gold', unlocked: false }
};

// === State Management ===
let gameState = {
    day: 1,
    population: 10,
    resources: {
        wood: 50,
        stone: 30,
        food: 100,
        gold: 100
    },
    buildings: {
        lumberMill: 0,
        quarry: 0,
        farm: 0,
        goldMine: 0,
        house: 0,
        market: 0
    },
    achievements: { ...ACHIEVEMENTS }
};

// === DOM References ===
const elements = {
    day: document.getElementById('day'),
    population: document.getElementById('population'),
    wood: document.getElementById('wood'),
    stone: document.getElementById('stone'),
    food: document.getElementById('food'),
    gold: document.getElementById('gold'),
    woodRate: document.getElementById('woodRate'),
    stoneRate: document.getElementById('stoneRate'),
    foodRate: document.getElementById('foodRate'),
    goldRate: document.getElementById('goldRate'),
    buildingsGrid: document.getElementById('buildingsGrid'),
    nextDayBtn: document.getElementById('nextDayBtn'),
    harvestBtn: document.getElementById('harvestBtn'),
    statusMessage: document.getElementById('statusMessage'),
    achievementOverlay: document.getElementById('achievementOverlay'),
    achievementText: document.getElementById('achievementText'),
    closeAchievementBtn: document.getElementById('closeAchievementBtn')
};

// === Initialization ===
function initGame() {
    loadGameState();
    setupEventListeners();
    renderBuildings();
    updateUI();
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('resource-management-save');
        if (saved) {
            const loaded = JSON.parse(saved);
            gameState = { ...gameState, ...loaded };
            // Merge achievements to include new ones
            gameState.achievements = { ...ACHIEVEMENTS, ...loaded.achievements };
        }
    } catch (e) {
        console.log('Could not load save');
    }
}

function saveGameState() {
    try {
        localStorage.setItem('resource-management-save', JSON.stringify(gameState));
    } catch (e) {
        console.log('Could not save game');
    }
}

// === Resource Calculations ===
function calculateProductionRates() {
    const rates = { wood: 0, stone: 0, food: 0, gold: 0 };
    let bonusMultiplier = 1;

    // Calculate market bonus
    if (gameState.buildings.market > 0) {
        bonusMultiplier = 1 + (BUILDINGS.market.bonus * gameState.buildings.market);
    }

    // Calculate production from each building
    Object.keys(gameState.buildings).forEach(buildingKey => {
        const count = gameState.buildings[buildingKey];
        const building = BUILDINGS[buildingKey];

        if (count > 0 && building.produces) {
            Object.keys(building.produces).forEach(resource => {
                rates[resource] += building.produces[resource] * count * bonusMultiplier;
            });
        }
    });

    return rates;
}

function calculatePopulation() {
    let pop = 10; // Base population
    pop += gameState.buildings.house * BUILDINGS.house.population;
    return pop;
}

// === UI Updates ===
function updateUI() {
    // Update day and population
    elements.day.textContent = gameState.day;
    gameState.population = calculatePopulation();
    elements.population.textContent = gameState.population;

    // Update resources
    elements.wood.textContent = Math.floor(gameState.resources.wood);
    elements.stone.textContent = Math.floor(gameState.resources.stone);
    elements.food.textContent = Math.floor(gameState.resources.food);
    elements.gold.textContent = Math.floor(gameState.resources.gold);

    // Update production rates
    const rates = calculateProductionRates();
    elements.woodRate.textContent = Math.floor(rates.wood);
    elements.stoneRate.textContent = Math.floor(rates.stone);
    elements.foodRate.textContent = Math.floor(rates.food);
    elements.goldRate.textContent = Math.floor(rates.gold);

    // Update building buttons
    updateBuildingButtons();
}

function renderBuildings() {
    elements.buildingsGrid.innerHTML = '';

    Object.keys(BUILDINGS).forEach(buildingKey => {
        const building = BUILDINGS[buildingKey];
        const count = gameState.buildings[buildingKey];

        const card = document.createElement('div');
        card.className = 'building-card';

        const info = document.createElement('div');
        info.className = 'building-info';

        const header = document.createElement('div');
        header.className = 'building-header';
        header.innerHTML = `
            <span class="building-icon">${building.icon}</span>
            <span class="building-name">${building.name}</span>
            <span class="building-count">x${count}</span>
        `;

        const description = document.createElement('div');
        description.className = 'building-description';
        description.textContent = building.description;

        const costDiv = document.createElement('div');
        costDiv.className = 'building-cost';
        const costItems = Object.keys(building.cost).map(resource => {
            const icon = { wood: '🪵', stone: '🪨', food: '🌾', gold: '💰' }[resource];
            return `<span class="cost-item">${icon} ${building.cost[resource]}</span>`;
        }).join('');
        costDiv.innerHTML = `Cost: ${costItems}`;

        info.appendChild(header);
        info.appendChild(description);
        info.appendChild(costDiv);

        const actions = document.createElement('div');
        actions.className = 'building-actions';

        const buildBtn = document.createElement('button');
        buildBtn.className = 'build-btn';
        buildBtn.textContent = 'Build';
        buildBtn.dataset.building = buildingKey;
        buildBtn.addEventListener('click', () => buildBuilding(buildingKey));

        actions.appendChild(buildBtn);

        card.appendChild(info);
        card.appendChild(actions);

        elements.buildingsGrid.appendChild(card);
    });
}

function updateBuildingButtons() {
    document.querySelectorAll('.build-btn').forEach(btn => {
        const buildingKey = btn.dataset.building;
        const building = BUILDINGS[buildingKey];
        const canAfford = canAffordBuilding(building);
        const atMax = gameState.buildings[buildingKey] >= building.maxCount;

        btn.disabled = !canAfford || atMax;

        if (atMax) {
            btn.textContent = 'Max';
        } else if (!canAfford) {
            btn.textContent = 'Build';
        } else {
            btn.textContent = 'Build';
        }
    });
}

// === Building System ===
function canAffordBuilding(building) {
    return Object.keys(building.cost).every(resource => {
        return gameState.resources[resource] >= building.cost[resource];
    });
}

function buildBuilding(buildingKey) {
    const building = BUILDINGS[buildingKey];

    if (gameState.buildings[buildingKey] >= building.maxCount) {
        showStatus('Maximum buildings reached!', 'error');
        return;
    }

    if (!canAffordBuilding(building)) {
        showStatus('Not enough resources!', 'error');
        return;
    }

    // Deduct costs
    Object.keys(building.cost).forEach(resource => {
        gameState.resources[resource] -= building.cost[resource];
    });

    // Add building
    gameState.buildings[buildingKey]++;

    // Check first building achievement
    const totalBuildings = Object.values(gameState.buildings).reduce((a, b) => a + b, 0);
    if (totalBuildings === 1) {
        unlockAchievement('firstBuilding');
    }

    showStatus(`${building.name} built!`, 'success');
    updateUI();
    saveGameState();
}

// === Day Cycle ===
function nextDay() {
    gameState.day++;

    // Calculate production
    const rates = calculateProductionRates();

    // Add resources
    Object.keys(rates).forEach(resource => {
        gameState.resources[resource] += rates[resource];
        if (rates[resource] > 0) {
            animateResource(resource);
        }
    });

    // Consume food for population
    const foodConsumption = gameState.population * 0.5;
    gameState.resources.food -= foodConsumption;

    // Check if out of food
    if (gameState.resources.food < 0) {
        gameState.resources.food = 0;
        showStatus('Warning: Out of food! Population is hungry!', 'error');
    }

    // Check achievements
    checkAchievements();

    updateUI();
    saveGameState();
    showStatus(`Day ${gameState.day} - Resources collected!`, 'info');
}

function manualHarvest() {
    // Give small resource boost
    gameState.resources.wood += 5;
    gameState.resources.stone += 3;
    gameState.resources.food += 10;

    showStatus('Manual harvest complete! +5 wood, +3 stone, +10 food', 'success');
    animateResource('wood');
    animateResource('stone');
    animateResource('food');
    updateUI();
    saveGameState();
}

// === Achievements ===
function checkAchievements() {
    if (gameState.day >= 10) unlockAchievement('day10');
    if (gameState.day >= 50) unlockAchievement('day50');
    if (gameState.population >= 100) unlockAchievement('population100');
    if (gameState.resources.gold >= 1000) unlockAchievement('goldRush');
}

function unlockAchievement(achievementKey) {
    const achievement = gameState.achievements[achievementKey];

    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    elements.achievementText.textContent = `${achievement.name}: ${achievement.description}`;
    elements.achievementOverlay.style.display = 'flex';
    saveGameState();
}

// === UI Helpers ===
function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;

    setTimeout(() => {
        elements.statusMessage.textContent = '';
        elements.statusMessage.className = 'status-message';
    }, 3000);
}

function animateResource(resource) {
    const elementId = { wood: 'wood', stone: 'stone', food: 'food', gold: 'gold' }[resource];
    const element = document.getElementById(elementId);

    if (element) {
        element.parentElement.classList.add('new-resource');
        setTimeout(() => {
            element.parentElement.classList.remove('new-resource');
        }, 500);
    }
}

// === Event Handlers ===
function setupEventListeners() {
    elements.nextDayBtn.addEventListener('click', nextDay);
    elements.nextDayBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        nextDay();
    });

    elements.harvestBtn.addEventListener('click', manualHarvest);
    elements.harvestBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        manualHarvest();
    });

    elements.closeAchievementBtn.addEventListener('click', () => {
        elements.achievementOverlay.style.display = 'none';
    });

    elements.closeAchievementBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        elements.achievementOverlay.style.display = 'none';
    });

    // Auto-save periodically
    setInterval(saveGameState, 30000); // Save every 30 seconds
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
