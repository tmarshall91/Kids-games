'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    // Stat decrease rates (per second)
    happinessDecay: 0.5,
    hungerDecay: 0.8,
    energyDecay: 0.3,

    // Action effects
    feedAmount: 25,
    playAmount: 15,
    sleepAmount: 30,

    // Cooldowns (milliseconds)
    feedCooldown: 2000,
    playCooldown: 3000,
    sleepCooldown: 5000,

    // Warning thresholds
    lowThreshold: 30,
    criticalThreshold: 15,

    // Tip interval (milliseconds)
    tipInterval: 30000,
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

let petState = {
    happiness: 100,
    hunger: 100,
    energy: 100,
    mood: 'happy', // happy, neutral, sad, sleeping
    isPlaying: true,
    lastUpdateTime: Date.now(),
};

let cooldowns = {
    feed: 0,
    play: 0,
    sleep: 0,
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    feedBtn: document.getElementById('feedBtn'),
    playBtn: document.getElementById('playBtn'),
    sleepBtn: document.getElementById('sleepBtn'),
    closeTipBtn: document.getElementById('closeTipBtn'),

    // Pet elements
    pet: document.getElementById('pet'),
    petMouth: document.getElementById('petMouth'),
    petStatus: document.getElementById('petStatus'),

    // Stats
    happiness: document.getElementById('happiness'),
    hunger: document.getElementById('hunger'),
    energy: document.getElementById('energy'),
    happinessBar: document.getElementById('happinessBar'),
    hungerBar: document.getElementById('hungerBar'),
    energyBar: document.getElementById('energyBar'),

    // Display elements
    gameMessage: document.getElementById('gameMessage'),
    particles: document.getElementById('particles'),
    tipOverlay: document.getElementById('tipOverlay'),
    tipTitle: document.getElementById('tipTitle'),
    tipMessage: document.getElementById('tipMessage'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Pet Care Game initialized');
    setupEventListeners();

    // Hide welcome message after 3 seconds
    setTimeout(() => {
        elements.gameMessage.style.display = 'none';
    }, 3000);

    // Start game loop
    gameLoop();

    // Start tip system
    startTipSystem();
}

function setupEventListeners() {
    // Feed button
    elements.feedBtn.addEventListener('touchstart', handleFeed);
    elements.feedBtn.addEventListener('click', handleFeed);

    // Play button
    elements.playBtn.addEventListener('touchstart', handlePlay);
    elements.playBtn.addEventListener('click', handlePlay);

    // Sleep button
    elements.sleepBtn.addEventListener('touchstart', handleSleep);
    elements.sleepBtn.addEventListener('click', handleSleep);

    // Pet interaction
    elements.pet.addEventListener('touchstart', handlePetClick);
    elements.pet.addEventListener('click', handlePetClick);

    // Close tip button
    elements.closeTipBtn.addEventListener('touchstart', closeTip);
    elements.closeTipBtn.addEventListener('click', closeTip);

    // Prevent default touch behavior
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.game-container')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - petState.lastUpdateTime) / 1000; // Convert to seconds
    petState.lastUpdateTime = currentTime;

    // Update pet stats (decay over time)
    if (petState.mood !== 'sleeping') {
        updateStats(deltaTime);
    }

    // Update UI
    updateUI();

    // Update cooldowns
    updateCooldowns();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

function updateStats(deltaTime) {
    // Decrease stats over time
    petState.happiness = Math.max(0, petState.happiness - CONFIG.happinessDecay * deltaTime);
    petState.hunger = Math.max(0, petState.hunger - CONFIG.hungerDecay * deltaTime);
    petState.energy = Math.max(0, petState.energy - CONFIG.energyDecay * deltaTime);

    // Update mood based on stats
    updateMood();
}

function updateMood() {
    if (petState.mood === 'sleeping') {
        return; // Don't change mood while sleeping
    }

    const avgStats = (petState.happiness + petState.hunger + petState.energy) / 3;

    if (avgStats >= 60) {
        petState.mood = 'happy';
    } else if (avgStats >= 30) {
        petState.mood = 'neutral';
    } else {
        petState.mood = 'sad';
    }
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateUI() {
    // Update stat values
    elements.happiness.textContent = Math.round(petState.happiness);
    elements.hunger.textContent = Math.round(petState.hunger);
    elements.energy.textContent = Math.round(petState.energy);

    // Update stat bars
    elements.happinessBar.style.width = petState.happiness + '%';
    elements.hungerBar.style.width = petState.hunger + '%';
    elements.energyBar.style.width = petState.energy + '%';

    // Update bar colors based on levels
    updateBarColor(elements.happinessBar, petState.happiness);
    updateBarColor(elements.hungerBar, petState.hunger);
    updateBarColor(elements.energyBar, petState.energy);

    // Update pet appearance
    updatePetAppearance();

    // Update pet status text
    updatePetStatus();
}

function updateBarColor(bar, value) {
    if (value <= CONFIG.criticalThreshold) {
        bar.style.filter = 'brightness(0.6)';
    } else if (value <= CONFIG.lowThreshold) {
        bar.style.filter = 'brightness(0.8)';
    } else {
        bar.style.filter = 'brightness(1)';
    }
}

function updatePetAppearance() {
    // Update mouth based on mood
    elements.petMouth.className = 'pet-mouth';

    if (petState.mood === 'happy') {
        elements.petMouth.classList.add('happy');
    } else if (petState.mood === 'sad') {
        elements.petMouth.classList.add('sad');
    }

    // Add sleeping class if sleeping
    if (petState.mood === 'sleeping') {
        elements.pet.classList.add('sleeping');
    } else {
        elements.pet.classList.remove('sleeping');
    }
}

function updatePetStatus() {
    const statusMessages = {
        happy: '😊 Happy',
        neutral: '😐 Okay',
        sad: '😢 Sad',
        sleeping: '😴 Sleeping',
    };

    elements.petStatus.textContent = statusMessages[petState.mood] || '😊 Happy';
}

function updateCooldowns() {
    const now = Date.now();

    // Update button states based on cooldowns
    elements.feedBtn.disabled = now < cooldowns.feed;
    elements.playBtn.disabled = now < cooldowns.play;
    elements.sleepBtn.disabled = now < cooldowns.sleep || petState.mood === 'sleeping';
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleFeed(e) {
    e.preventDefault();
    if (cooldowns.feed > Date.now()) return;

    // Increase hunger stat
    petState.hunger = Math.min(100, petState.hunger + CONFIG.feedAmount);
    petState.happiness = Math.min(100, petState.happiness + 5);

    // Set cooldown
    cooldowns.feed = Date.now() + CONFIG.feedCooldown;

    // Visual feedback
    playAnimation('eating');
    createParticles('🍎', 5);
    showFeedback('+' + CONFIG.feedAmount + ' Food!', '#e17055');

    console.log('Fed pet');
}

function handlePlay(e) {
    e.preventDefault();
    if (cooldowns.play > Date.now()) return;

    // Check if pet has enough energy
    if (petState.energy < 20) {
        showTip('Too Tired!', 'Your pet needs to sleep before playing more!');
        return;
    }

    // Increase happiness, decrease energy
    petState.happiness = Math.min(100, petState.happiness + CONFIG.playAmount);
    petState.energy = Math.max(0, petState.energy - 10);

    // Set cooldown
    cooldowns.play = Date.now() + CONFIG.playCooldown;

    // Visual feedback
    playAnimation('jumping');
    createParticles('🎾', 5);
    showFeedback('+' + CONFIG.playAmount + ' Happy!', '#74b9ff');

    console.log('Played with pet');
}

function handleSleep(e) {
    e.preventDefault();
    if (cooldowns.sleep > Date.now() || petState.mood === 'sleeping') return;

    // Set sleeping state
    petState.mood = 'sleeping';
    petState.energy = Math.min(100, petState.energy + CONFIG.sleepAmount);

    // Set cooldown
    cooldowns.sleep = Date.now() + CONFIG.sleepCooldown;

    // Visual feedback
    createParticles('💤', 3);
    showFeedback('Sleeping...', '#a29bfe');

    // Wake up after 3 seconds
    setTimeout(() => {
        petState.mood = 'happy';
        updateMood();
        showFeedback('+' + CONFIG.sleepAmount + ' Energy!', '#74b9ff');
    }, 3000);

    console.log('Pet is sleeping');
}

function handlePetClick(e) {
    e.preventDefault();

    // Create heart particles
    createParticles('💖', 3);

    // Small happiness boost
    petState.happiness = Math.min(100, petState.happiness + 2);

    // Play animation
    playAnimation('jumping');
}

// ==========================================
// VISUAL FEEDBACK FUNCTIONS
// ==========================================

function playAnimation(animationName) {
    elements.pet.classList.remove('jumping', 'eating', 'sleeping');

    // Force reflow to restart animation
    void elements.pet.offsetWidth;

    elements.pet.classList.add(animationName);

    // Remove animation class after it completes
    setTimeout(() => {
        elements.pet.classList.remove(animationName);
    }, 1000);
}

function createParticles(emoji, count) {
    const petRect = elements.pet.getBoundingClientRect();
    const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emoji;

        // Position near pet
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 50;

        particle.style.left = (petRect.left - gameAreaRect.left + petRect.width / 2 + offsetX) + 'px';
        particle.style.top = (petRect.top - gameAreaRect.top + petRect.height / 2 + offsetY) + 'px';

        elements.particles.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

function showFeedback(message, color) {
    const feedback = document.createElement('div');
    feedback.className = 'particle';
    feedback.textContent = message;
    feedback.style.color = color;
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '24px';

    const petRect = elements.pet.getBoundingClientRect();
    const gameAreaRect = document.getElementById('gameArea').getBoundingClientRect();

    feedback.style.left = (petRect.left - gameAreaRect.left + petRect.width / 2) + 'px';
    feedback.style.top = (petRect.top - gameAreaRect.top - 30) + 'px';
    feedback.style.transform = 'translateX(-50%)';

    elements.particles.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// ==========================================
// TIP SYSTEM
// ==========================================

let lastTipTime = Date.now();

function startTipSystem() {
    setInterval(() => {
        checkAndShowTips();
    }, 5000); // Check every 5 seconds
}

function checkAndShowTips() {
    // Check for low stats
    if (petState.hunger <= CONFIG.lowThreshold) {
        showTip('Hungry!', 'Your pet is getting hungry! Feed them some food.');
    } else if (petState.energy <= CONFIG.lowThreshold) {
        showTip('Tired!', 'Your pet needs to rest. Put them to sleep!');
    } else if (petState.happiness <= CONFIG.lowThreshold) {
        showTip('Bored!', 'Your pet wants to play! Make them happy!');
    } else if (Date.now() - lastTipTime > CONFIG.tipInterval) {
        // Random encouragement
        const tips = [
            { title: 'Great Job!', message: 'You\'re taking great care of your pet!' },
            { title: 'Keep it Up!', message: 'Your pet loves spending time with you!' },
            { title: 'Fun Fact!', message: 'Happy pets live longer and healthier lives!' },
        ];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        showTip(randomTip.title, randomTip.message);
    }
}

function showTip(title, message) {
    elements.tipTitle.textContent = title;
    elements.tipMessage.textContent = message;
    elements.tipOverlay.style.display = 'flex';
    lastTipTime = Date.now();
}

function closeTip(e) {
    if (e) e.preventDefault();
    elements.tipOverlay.style.display = 'none';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Clamp value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Game paused (tab hidden)');
    } else {
        // Reset last update time to avoid huge delta
        petState.lastUpdateTime = Date.now();
        console.log('Game resumed');
    }
});
