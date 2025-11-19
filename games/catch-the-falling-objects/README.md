# Catch the Falling Objects

A fun, fast-paced arcade game where players move a basket to catch falling stars, hearts, diamonds, and coins!

## 🎮 How to Play

1. Tap **Start Game** to begin
2. **Move the basket** by:
   - Dragging the basket with your finger (touch)
   - Tapping where you want the basket to go
   - Clicking and dragging with a mouse (desktop)
3. **Catch falling objects** as they drop from the top
4. Each object caught earns **1 point**
5. Game lasts **30 seconds**
6. Try to get the highest score possible!

## ✨ Features

- **Multiple object types**: Stars, hearts, diamonds, and coins
- **Progressive difficulty**: Game gets faster every 5 seconds
- **Touch-optimized controls**: Easy drag-and-drop or tap-to-move
- **Visual feedback**: "+1" animation when catching objects
- **Score-based messages**: Encouraging feedback based on performance
- **Mobile-friendly**: Designed for touchscreen devices

## 🎯 Game Mechanics

### Controls
- **Touch**: Drag the basket left/right OR tap where you want it to go
- **Mouse**: Click and drag OR click to move

### Scoring
- Each caught object: **+1 point**
- 30+ points: "Amazing! You are a star catcher!"
- 20-29 points: "Great job! Keep practicing!"
- 10-19 points: "Good effort! Try again!"
- Under 10 points: "Keep trying! You can do it!"

### Difficulty Progression
- Starts with 1 object per second
- Every 5 seconds:
  - Objects fall faster
  - Objects spawn more frequently

## 🛠️ Technical Details

### Technologies
- Pure HTML5, CSS3, and Vanilla JavaScript
- No external dependencies
- Optimized for mobile browsers
- 60 FPS game loop using requestAnimationFrame

### Game Configuration
Located in `game.js`:
```javascript
const CONFIG = {
    fps: 60,
    gameTime: 30, // seconds
    initialFallSpeed: 2, // pixels per frame
    spawnInterval: 1000, // milliseconds
    difficultyIncrease: 0.1, // speed increase per 5 seconds
};
```

### Key Features
- Collision detection between basket and falling objects
- Smooth basket movement with clamping to game boundaries
- Dynamic object spawning with randomized positions
- Progressive difficulty scaling
- Visual feedback system

## 📱 Mobile Optimization

- Touch-friendly controls (drag or tap)
- Responsive design for various screen sizes
- Prevents unwanted scrolling during gameplay
- Large touch targets for easy interaction
- Optimized for performance on mobile devices

## 🎨 Customization

You can easily customize:
- Game duration (change `gameTime` in CONFIG)
- Fall speed (change `initialFallSpeed`)
- Spawn rate (change `spawnInterval`)
- Difficulty progression (change `difficultyIncrease`)
- Object types (edit `objectTypes` array)

## 🏆 Tips for High Scores

1. **Position strategically**: Place the basket where objects are likely to fall
2. **Quick reactions**: Tap to move the basket faster than dragging
3. **Stay centered**: Keep the basket in the middle when possible
4. **Watch patterns**: Objects spawn randomly but you can predict general areas
5. **Don't panic**: As the game speeds up, stay focused and calm

## 📝 License

Part of the Kids Games Collection - for educational and entertainment purposes.

---

**Ready to catch some stars?** [Play Now](index.html)
