# Game Template

This is a template for creating new games in the Kids Games Collection. Copy this directory to `/games/[your-game-name]` and customize it for your specific game.

## 📁 Template Structure

```
template/
├── index.html          # HTML structure and layout
├── style.css           # Styles and visual design
├── game.js             # Game logic and interactivity
├── README.md           # This file (update for your game)
└── assets/             # Optional: images, sounds, etc.
    ├── images/
    └── sounds/
```

## 🎯 How to Use This Template

1. **Copy the template**:
   ```bash
   cp -r template games/your-game-name
   cd games/your-game-name
   ```

2. **Customize index.html**:
   - Update `<title>` tag
   - Change the `<h1>` game title
   - Modify the game area structure as needed
   - Keep the viewport meta tag

3. **Customize style.css**:
   - Change colors and gradients
   - Adjust fonts and sizes
   - Add game-specific styles
   - Maintain mobile-first responsive design

4. **Customize game.js**:
   - Implement your game logic in `updateGame()`
   - Add rendering code in `renderGame()`
   - Create game-specific event handlers
   - Utilize provided utility functions

5. **Update this README**:
   - Replace this content with your game description
   - Explain how to play
   - List features and controls
   - Add any credits or attributions

## 🎮 Template Features

This template includes:

### HTML Structure
- ✅ Mobile viewport configuration
- ✅ Responsive container layout
- ✅ Header with score and timer display
- ✅ Main game area
- ✅ Control buttons (Start, Restart)
- ✅ Game over overlay

### CSS Styling
- ✅ Mobile-first responsive design
- ✅ Attractive gradient backgrounds
- ✅ Kid-friendly fonts and colors
- ✅ Button styles with touch feedback
- ✅ Smooth animations (bounce, pulse)
- ✅ Overlay for game over screen

### JavaScript Functionality
- ✅ Game state management
- ✅ Game loop with requestAnimationFrame
- ✅ Timer countdown
- ✅ Score tracking
- ✅ Touch and mouse event handling
- ✅ Utility functions (randomInt, collision detection, etc.)
- ✅ Start/restart game flow

## 🔧 Key Functions to Customize

### `updateGame(deltaTime)`
Add your game logic here. Called every frame (60fps target).

```javascript
function updateGame(deltaTime) {
    // Update enemy positions
    // Check for collisions
    // Update game objects
}
```

### `renderGame()`
Update the DOM to reflect the current game state.

```javascript
function renderGame() {
    // Move player
    // Update enemy positions
    // Refresh UI elements
}
```

### Event Handlers
Add game-specific interactions:

```javascript
elements.gameArea.addEventListener('touchstart', (e) => {
    // Handle tap/click on game area
});
```

## 🎨 Customization Tips

**Colors**: Update CSS custom properties at the top of style.css
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
}
```

**Game Objects**: Use the `createGameObject()` function or create your own
```javascript
const enemy = createGameObject(x, y);
enemy.classList.add('enemy');
```

**Animations**: Add CSS animations for visual feedback
```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

## ✅ Testing Checklist

Before considering your game complete:

- [ ] Game starts and runs without errors
- [ ] Touch controls work on mobile simulation
- [ ] Score updates correctly
- [ ] Timer counts down properly
- [ ] Game over triggers at right time
- [ ] Restart functionality works
- [ ] Responsive on different screen sizes
- [ ] No console errors
- [ ] Smooth 60fps performance

## 📱 Mobile Optimization

This template includes:
- Touch event support
- Prevent default scrolling/zooming
- Large touch targets (44px+)
- Responsive layout
- GPU-accelerated animations

## 🆘 Need Help?

- Check `TECHNICAL_STANDARDS.md` for requirements
- Review `CONTRIBUTING.md` for workflow
- Look at existing games in `/games` for examples
- Test frequently on mobile or using browser DevTools

## 🎯 Next Steps

1. Implement your game logic
2. Test thoroughly
3. Update this README with game description
4. Add your game to main `/index.html` catalog
5. Commit and push your changes

**Happy coding! 🚀**
