# Contributing Guide for Game Development

This guide is specifically designed for multiple developers (including AI agents like Claude) to work in parallel building games for this collection.

## 🎯 Your Mission

Build a complete, working game that:
1. Follows the technical standards in `TECHNICAL_STANDARDS.md`
2. Works perfectly on mobile browsers
3. Is fun and appropriate for kids
4. Integrates seamlessly into the game catalog

## 📋 Step-by-Step Workflow

### Step 1: Choose Your Game

1. Open `GAME_IDEAS.md` and select a game that hasn't been built yet
2. OR propose your own game concept if given one by the user
3. Note the complexity level to estimate effort

**For Claude Instances**: The user will typically tell you which game to build.

### Step 2: Set Up Your Game Directory

1. Copy the entire `/template` directory to `/games/[game-name]`
   - Use lowercase, hyphenated names (e.g., `whack-a-mole`, `memory-match`)
   - Keep names short and descriptive

```bash
cp -r template games/your-game-name
```

2. Navigate to your new game directory:

```bash
cd games/your-game-name
```

### Step 3: Customize the Template

Edit the following files in your game directory:

#### `index.html`
- Update the `<title>` tag with your game name
- Update the `<h1>` in the header
- Modify the game container structure as needed
- Keep the mobile viewport meta tag
- Keep the responsive design principles

#### `style.css`
- Customize colors, fonts, and visual style
- Maintain mobile-first responsive design
- Ensure touch targets are at least 44px × 44px
- Keep good contrast ratios for readability

#### `game.js`
- Implement your game logic
- Follow the structure: initialization, game loop, event handlers, utility functions
- Add comments explaining complex logic
- Ensure touch and mouse events both work

#### `README.md`
- Describe your game
- List the rules and objectives
- Note any special features
- Include credits for assets if applicable

### Step 4: Build Your Game

Follow these principles:

**✅ DO:**
- Use vanilla JavaScript (ES6+ is fine)
- Make it responsive and mobile-friendly
- Test touch interactions
- Use semantic HTML
- Add appropriate ARIA labels for accessibility
- Keep all assets in the game's own directory
- Use relative paths for all resources
- Comment your code clearly
- Handle errors gracefully

**❌ DON'T:**
- Use external frameworks or libraries (no React, jQuery, etc.)
- Require a build process or compilation
- Link to external resources (CDNs, external images)
- Use features that don't work on mobile browsers
- Create files outside your game directory
- Modify files in other games' directories

### Step 5: Test Your Game

Before committing, verify:

- [ ] Game loads without errors
- [ ] All interactive elements work with touch
- [ ] Game is playable on a mobile screen size
- [ ] No console errors
- [ ] Game has a clear objective and win/lose conditions (if applicable)
- [ ] Graphics and text are visible and readable
- [ ] Game performs smoothly (60fps target)
- [ ] All assets load correctly

**Testing Checklist**:
1. Open the game in a browser
2. Use browser DevTools to simulate mobile device
3. Test all touch interactions
4. Verify responsive layout at different screen sizes
5. Check browser console for errors

### Step 6: Update the Game Catalog

Add your game to the main `/index.html` file:

1. Open `/index.html`
2. Find the game grid section
3. Add a new game card following the existing pattern:

```html
<div class="game-card">
    <h3>Your Game Name</h3>
    <p class="game-description">Brief description of your game</p>
    <p class="game-category">Category: Action | Complexity: Simple</p>
    <a href="games/your-game-name/index.html" class="play-button">Play Now</a>
</div>
```

4. Use appropriate category and complexity labels

### Step 7: Commit and Push

Use clear, descriptive commit messages:

```bash
git add games/your-game-name/
git add index.html
git commit -m "Add [Game Name] - [brief description]

- Implemented [key features]
- Mobile-optimized touch controls
- [Any other notable details]"

git push -u origin claude/[your-branch-name]
```

**Important**: Always push to your designated Claude branch (starts with `claude/` and ends with session ID).

## 🎮 Game Structure Best Practices

### File Organization

```
games/your-game-name/
├── index.html          # Entry point
├── style.css           # All styles
├── game.js             # All game logic
├── README.md           # Game documentation
└── assets/             # Optional: images, sounds
    ├── images/
    └── sounds/
```

### Code Structure (game.js)

Organize your JavaScript like this:

```javascript
// === Configuration & Constants ===
const GAME_CONFIG = {
    // Game settings
};

// === State Management ===
let gameState = {
    // Current game state
};

// === Initialization ===
function initGame() {
    // Set up the game
}

// === Game Loop ===
function gameLoop() {
    // Main game logic
}

// === Event Handlers ===
function handleTouch(e) {
    // Handle user input
}

// === Utility Functions ===
function randomInt(min, max) {
    // Helper functions
}

// === Start the Game ===
document.addEventListener('DOMContentLoaded', initGame);
```

### Mobile Considerations

**Touch Events**: Always support touch
```javascript
element.addEventListener('touchstart', handleTouch);
element.addEventListener('mousedown', handleTouch); // Fallback for desktop
```

**Prevent Scrolling**: Prevent page bounce
```javascript
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-container')) {
        e.preventDefault();
    }
}, { passive: false });
```

**Viewport**: Always include
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## 🚫 Common Pitfalls to Avoid

1. **Forgetting Mobile Testing**: Always test on mobile or simulate it
2. **Small Touch Targets**: Buttons should be at least 44px × 44px
3. **External Dependencies**: Keep everything self-contained
4. **Poor Performance**: Optimize animations and game loops
5. **No Error Handling**: Games should fail gracefully
6. **Modifying Other Games**: Stay in your own directory
7. **Complex File Structure**: Keep it simple - stick to the template

## 🤝 Working in Parallel

Multiple developers can work simultaneously because:
- Each game is in its own directory
- The only shared file is `index.html` (catalog)
- Use clear game names to avoid duplicates
- Pull before pushing to get latest catalog updates

**Workflow for Parallel Development**:
1. Pull latest changes: `git pull origin [branch]`
2. Create your game in a new directory
3. Update `index.html` to add your game
4. Commit and push your changes
5. If there's a merge conflict on `index.html`, it's easy to resolve (just add both games)

## 📊 Quality Standards

Every game should meet these criteria:

- **Functional**: Game works without bugs
- **Complete**: Has start, gameplay, and end states
- **Mobile-Optimized**: Fully playable on phone browsers
- **Kid-Appropriate**: Content suitable for children
- **Self-Contained**: No external dependencies
- **Documented**: README explains the game
- **Performant**: Runs smoothly on mobile devices

## 🎨 Visual Standards

- **Colorful and Engaging**: Kids love bright colors
- **Clear Feedback**: Visual/audio feedback for interactions
- **Readable Text**: Large enough fonts for kids to read
- **Simple UI**: Uncluttered, intuitive interface
- **Consistent Style**: While each game can have its own style, maintain professional quality

## 📱 Technical Requirements Summary

See `TECHNICAL_STANDARDS.md` for complete details, but key requirements:

- HTML5, CSS3, Vanilla JavaScript only
- Mobile-first responsive design
- Touch-optimized controls
- No build process required
- All assets self-contained
- Works offline
- Cross-browser compatible (modern browsers)

## 🆘 Getting Help

**For Claude Instances**:
1. Review `TECHNICAL_STANDARDS.md` for technical details
2. Look at the `/template` directory for structure
3. Examine existing games in `/games` for examples
4. Follow this guide step-by-step

**For Humans**:
- Same process! Documentation is comprehensive enough for anyone.

## ✅ Pre-Commit Checklist

Before committing your game, ensure:

- [ ] Game is in `/games/[game-name]/` directory
- [ ] All required files present (index.html, style.css, game.js, README.md)
- [ ] Game works on mobile (tested or simulated)
- [ ] No console errors
- [ ] Touch controls work properly
- [ ] Game is listed in main `/index.html`
- [ ] All assets are in game directory (no external links)
- [ ] Code is commented and readable
- [ ] README.md describes the game

## 🎯 Success Criteria

Your contribution is successful when:
1. ✅ The game runs without errors
2. ✅ It's playable and fun on a mobile browser
3. ✅ It appears in the main game catalog
4. ✅ It follows all technical standards
5. ✅ It's appropriate for kids
6. ✅ Code is clean and well-organized

---

**Ready to start?** Copy the template and begin building!
