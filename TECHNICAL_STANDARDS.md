# Technical Standards

This document defines the technical requirements and best practices for all games in this collection. **Every game must follow these standards.**

## 🎯 Core Requirements

### Technology Stack

**Required:**
- HTML5
- CSS3
- Vanilla JavaScript (ES6+ allowed)

**Not Allowed:**
- No frameworks (React, Vue, Angular, etc.)
- No libraries (jQuery, Lodash, etc.)
- No build tools required (Webpack, Babel, etc.)
- No server-side code
- No external API calls
- No CDN dependencies

**Why?** Games must run directly in a browser without any setup, installation, or build process.

### Browser Compatibility

**Target Browsers:**
- Chrome/Safari on iOS (primary)
- Chrome on Android (primary)
- Desktop browsers (secondary)

**Minimum Support:**
- iOS Safari 12+
- Chrome 80+
- Firefox 75+
- Edge 80+

**Testing:** Always test in mobile browser or using browser DevTools mobile simulation.

## 📱 Mobile-First Requirements

### Responsive Design

**Viewport Configuration:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**Layout Approach:**
- Design for mobile first (320px - 428px width)
- Use flexible layouts (flexbox, grid)
- Scale up for larger screens
- Avoid fixed pixel dimensions for layout
- Use relative units (%, em, rem, vh, vw)

**Orientation:**
- Support portrait orientation (primary)
- Landscape support is optional but encouraged

### Touch Optimization

**Touch Targets:**
- Minimum size: 44px × 44px
- Recommended: 48px × 48px or larger
- Adequate spacing between targets (8px minimum)

**Touch Events:**
Always support both touch and mouse:
```javascript
element.addEventListener('touchstart', handleStart);
element.addEventListener('mousedown', handleStart);

element.addEventListener('touchmove', handleMove);
element.addEventListener('mousemove', handleMove);

element.addEventListener('touchend', handleEnd);
element.addEventListener('mouseup', handleEnd);
```

**Prevent Unwanted Behavior:**
```javascript
// Prevent page scrolling during gameplay
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent double-tap zoom
element.addEventListener('touchend', (e) => {
    e.preventDefault();
});
```

**Gesture Support:**
- Tap: Primary interaction
- Swipe: For directional controls
- Drag: For moving objects
- Avoid complex gestures (pinch, rotate)

## 🎨 Visual Design Standards

### Color and Contrast

**Contrast Ratios (WCAG AA):**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

**Color Usage:**
- Use bright, engaging colors for kids
- Don't rely on color alone to convey information
- Ensure readability in different lighting conditions

### Typography

**Font Sizes:**
- Body text: 16px minimum (1rem)
- Buttons: 18px minimum
- Headings: 24px+ (1.5rem+)
- Small text: 14px minimum (0.875rem)

**Font Families:**
- Use web-safe fonts or system fonts
- Recommended: Arial, Helvetica, sans-serif
- For fun: Comic Sans MS, cursive (kids like it!)
- Always include fallback fonts

```css
font-family: 'Comic Sans MS', 'Arial', sans-serif;
```

### Layout and Spacing

**Spacing:**
- Use consistent spacing (multiples of 4px or 8px)
- Adequate padding around interactive elements
- Clear visual hierarchy

**Layout:**
- Center game content
- Use full width on mobile
- Max width on larger screens (optional)
- Avoid horizontal scrolling

## ⚡ Performance Standards

### Target Metrics

- **Frame Rate:** 60 FPS (16.67ms per frame)
- **Initial Load:** < 2 seconds
- **Asset Loading:** < 500ms per asset
- **Touch Response:** < 100ms

### Optimization Techniques

**JavaScript:**
```javascript
// Use requestAnimationFrame for animations
function gameLoop() {
    // Update game state
    requestAnimationFrame(gameLoop);
}

// Throttle event handlers
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}

// Efficient DOM manipulation
// Cache DOM references
const elements = {
    score: document.getElementById('score'),
    timer: document.getElementById('timer')
};

// Batch DOM updates
function updateUI() {
    elements.score.textContent = gameState.score;
    elements.timer.textContent = gameState.time;
}
```

**CSS:**
```css
/* Use CSS transforms for animations (GPU accelerated) */
.moving-element {
    transform: translateX(100px);
    transition: transform 0.3s ease;
}

/* Avoid expensive properties */
/* Good: transform, opacity */
/* Avoid: width, height, top, left */

/* Use will-change sparingly */
.animating-element {
    will-change: transform;
}
```

**Images:**
- Optimize file sizes (use tools like TinyPNG)
- Use appropriate formats (PNG for graphics, JPG for photos)
- Consider WebP with fallbacks
- Use CSS for simple shapes instead of images

**Audio:**
- Use compressed formats (MP3, OGG)
- Preload audio files
- Keep files small (< 100KB each)

### Memory Management

```javascript
// Clean up event listeners
function cleanup() {
    element.removeEventListener('touchstart', handleTouch);
}

// Clear intervals and timeouts
clearInterval(intervalId);
clearTimeout(timeoutId);

// Reset game state
function resetGame() {
    gameState = { ...initialState };
}
```

## 🏗️ Code Structure Standards

### File Organization

**Required Files:**
```
games/game-name/
├── index.html       # Entry point
├── style.css        # All styles
├── game.js          # All game logic
└── README.md        # Documentation
```

**Optional:**
```
games/game-name/
└── assets/          # Media files
    ├── images/
    └── sounds/
```

### HTML Structure

**Template:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Game Name</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <header>
            <h1>Game Name</h1>
            <div class="game-stats">
                <span id="score">Score: 0</span>
                <span id="timer">Time: 0</span>
            </div>
        </header>

        <main class="game-area">
            <!-- Game content here -->
        </main>

        <footer class="game-controls">
            <button id="start-btn">Start Game</button>
            <button id="restart-btn" style="display:none;">Restart</button>
        </footer>
    </div>

    <script src="game.js"></script>
</body>
</html>
```

**Best Practices:**
- Use semantic HTML (header, main, footer, section, etc.)
- Include proper meta tags
- Add ARIA labels for accessibility
- Keep HTML clean and readable

### CSS Structure

**Organization:**
```css
/* === Reset & Base Styles === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* === Layout === */
.game-container {
    /* Main container styles */
}

/* === Components === */
.game-card {
    /* Component styles */
}

/* === Game Elements === */
.player {
    /* Game-specific elements */
}

/* === Animations === */
@keyframes bounce {
    /* Animation definitions */
}

/* === Responsive === */
@media (min-width: 768px) {
    /* Tablet and desktop styles */
}
```

**Best Practices:**
- Use CSS custom properties for colors and repeated values
- Mobile-first media queries
- Avoid !important
- Use meaningful class names
- Group related styles

### JavaScript Structure

**Organization:**
```javascript
'use strict';

// === Configuration ===
const CONFIG = {
    fps: 60,
    gameWidth: 320,
    gameHeight: 480
};

// === State Management ===
let gameState = {
    score: 0,
    lives: 3,
    isPlaying: false
};

// === DOM References ===
const elements = {
    startBtn: document.getElementById('start-btn'),
    scoreDisplay: document.getElementById('score')
};

// === Initialization ===
function initGame() {
    setupEventListeners();
    resetGame();
}

// === Game Loop ===
function gameLoop(timestamp) {
    update(timestamp);
    render();
    if (gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

function update(timestamp) {
    // Update game logic
}

function render() {
    // Update DOM/Canvas
}

// === Event Handlers ===
function handleStart() {
    gameState.isPlaying = true;
    requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);
}

// === Game Logic ===
function checkCollision(obj1, obj2) {
    // Collision detection
}

function updateScore(points) {
    gameState.score += points;
    elements.scoreDisplay.textContent = gameState.score;
}

// === Utility Functions ===
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// === Start ===
document.addEventListener('DOMContentLoaded', initGame);
```

**Best Practices:**
- Use 'use strict'
- Declare all variables at appropriate scope
- Use const for constants, let for variables
- Comment complex logic
- Keep functions small and focused
- Use meaningful names

## 🎮 Game Design Standards

### User Experience

**Game States:**
Every game should have:
1. **Welcome/Menu**: Initial screen with instructions
2. **Playing**: Active gameplay
3. **Paused**: Ability to pause (optional)
4. **Game Over**: End state with score/results
5. **Restart**: Easy way to play again

**Feedback:**
- Visual feedback for all interactions
- Sound effects (optional but recommended)
- Score display
- Lives/health indicator (if applicable)
- Timer (if relevant)

**Instructions:**
- Clear, simple instructions
- Show before gameplay starts
- Option to view during gameplay
- Use icons/images when possible

### Controls

**Simple and Intuitive:**
- Minimize number of controls
- Use familiar gestures
- Show control hints
- Test with actual kids if possible

**Common Control Patterns:**
- Tap: Select, activate, shoot
- Swipe: Move, slice, navigate
- Drag: Move objects, draw
- Hold: Charge, aim

### Difficulty

**Progressive Difficulty:**
- Start easy
- Gradually increase challenge
- Consider multiple difficulty levels
- Fair and achievable goals

**Kid-Friendly:**
- Avoid frustration
- Celebrate successes
- Positive reinforcement
- No punishing mechanics

## 🔊 Audio Standards

### Audio Implementation

**Format Support:**
```html
<audio id="sound-effect">
    <source src="assets/sounds/effect.mp3" type="audio/mpeg">
    <source src="assets/sounds/effect.ogg" type="audio/ogg">
</audio>
```

**JavaScript Control:**
```javascript
const audio = {
    click: new Audio('assets/sounds/click.mp3'),
    success: new Audio('assets/sounds/success.mp3')
};

// Preload
audio.click.load();

// Play
function playSound(sound) {
    audio[sound].currentTime = 0; // Reset
    audio[sound].play().catch(e => console.log('Audio play failed:', e));
}
```

**Best Practices:**
- Always handle play() promise
- Respect autoplay policies (require user interaction)
- Provide mute option
- Keep volume reasonable
- Use short sound effects (< 2 seconds)

## ♿ Accessibility Standards

### Basic Accessibility

**Semantic HTML:**
```html
<button aria-label="Start Game">Start</button>
<div role="button" tabindex="0" aria-label="Play">▶</div>
```

**Keyboard Support:**
- Space/Enter for button activation
- Arrow keys for navigation (where applicable)
- Escape to pause/exit

**Visual:**
- Good contrast ratios
- Readable fonts
- Clear visual hierarchy
- Avoid flashing content (seizure risk)

## 🐛 Error Handling

**Graceful Degradation:**
```javascript
// Try-catch for critical operations
try {
    localStorage.setItem('highScore', score);
} catch (e) {
    console.log('Storage not available');
}

// Feature detection
if ('ontouchstart' in window) {
    // Touch supported
} else {
    // Fallback to mouse
}

// Audio error handling
audio.play().catch(e => {
    console.log('Could not play audio:', e);
});
```

## 📝 Documentation Standards

### README.md

Each game must include a README with:

```markdown
# Game Name

Brief description of the game.

## How to Play

1. Step-by-step instructions
2. Controls explanation
3. Objective/goal

## Features

- List of game features
- Special mechanics
- Difficulty levels

## Technical Details

- Technologies used
- Browser requirements
- Assets credits (if any)

## Development

- Build date
- Version
- Known issues (if any)
```

### Code Comments

**Good Comments:**
```javascript
// Calculate next position using velocity and delta time
const nextX = currentX + velocityX * deltaTime;

// Check if game object is within screen bounds
function isInBounds(x, y) {
    return x >= 0 && x <= CONFIG.width && y >= 0 && y <= CONFIG.height;
}
```

**Avoid Obvious Comments:**
```javascript
// Bad: commenting the obvious
let score = 0; // Set score to 0

// Good: explain why
let score = 0; // Score starts at 0 and increases by 10 per coin collected
```

## ✅ Quality Checklist

Before considering your game complete:

**Functionality:**
- [ ] Game loads without errors
- [ ] All features work as intended
- [ ] No console errors or warnings
- [ ] Proper error handling implemented

**Mobile Compatibility:**
- [ ] Touch controls work perfectly
- [ ] Responsive on all mobile screen sizes
- [ ] No unwanted scrolling or zooming
- [ ] Performs smoothly on mobile devices

**Code Quality:**
- [ ] Follows this technical standard
- [ ] Well-organized and readable
- [ ] Properly commented
- [ ] No unused code

**User Experience:**
- [ ] Clear instructions
- [ ] Intuitive controls
- [ ] Good visual feedback
- [ ] Fun and engaging

**Documentation:**
- [ ] README.md complete
- [ ] Code comments present
- [ ] Credits included (if applicable)

**Integration:**
- [ ] Listed in main catalog (index.html)
- [ ] All assets in game directory
- [ ] No dependencies on external resources

---

## 🎯 Summary

**Core Principles:**
1. **Simple**: Vanilla web technologies only
2. **Mobile-First**: Touch-optimized, responsive
3. **Self-Contained**: No external dependencies
4. **Performant**: Smooth 60fps gameplay
5. **Kid-Friendly**: Appropriate and engaging
6. **Well-Documented**: Clear code and README

Follow these standards, and your game will integrate seamlessly into the collection!
