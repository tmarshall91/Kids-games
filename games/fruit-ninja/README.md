# Fruit Ninja 🍉

A fun and engaging fruit-slicing game for kids! Swipe your finger across the screen to slice fruits and avoid bombs in this mobile-optimized browser game.

## 🎮 How to Play

1. Tap the **Start Game** button to begin
2. **Swipe** your finger (or mouse) across fruits to slice them
3. Slice as many fruits as you can to increase your score
4. **Avoid bombs!** Hitting a bomb ends the game immediately
5. You have **3 lives** - lose a life when a fruit falls off the screen without being sliced
6. The game gets faster as your score increases

## 🎯 Game Features

- **Touch-Optimized**: Smooth swipe detection with visual trail effects
- **Physics-Based**: Fruits launch with realistic arc trajectories and gravity
- **Progressive Difficulty**: Fruits spawn faster as you score more points
- **Visual Effects**:
  - Slice trail that follows your swipe
  - Fruit halves that split and fly apart when sliced
  - Colorful particle explosions
  - Score popups showing points earned
  - Bomb explosion effects
- **Lives System**: Start with 3 lives, lose one for each missed fruit
- **Mobile-Friendly**: Designed specifically for touch screens
- **Responsive**: Works on all screen sizes

## 🍎 Game Mechanics

### Fruits
- 10 different fruit emojis: 🍎 🍊 🍋 🍌 🍉 🍇 🍓 🥝 🍑 🥭
- Each fruit is worth **10 points** when sliced
- Fruits spawn from the bottom and arc upward
- Miss a fruit = lose 1 life

### Bombs
- Bombs (💣) appear randomly with a 15% chance
- **Avoid slicing bombs!** Hitting one ends the game
- Bombs won't make you lose a life if they fall off screen

### Difficulty
- Game starts at moderate difficulty
- Every 50 points, fruits spawn more frequently
- Maximum spawn rate prevents impossible difficulty

### Lives
- Start with **3 lives**
- Lose a life when a fruit falls off screen without being sliced
- Game ends when you run out of lives OR hit a bomb

## 🎨 Visual Design

- **Bright colors**: Kid-friendly gradient backgrounds
- **Emoji graphics**: No images needed, uses native fruit emojis
- **Smooth animations**: 60fps gameplay with GPU-accelerated effects
- **Clear feedback**: Visual cues for all interactions

## 🕹️ Controls

### Touch (Mobile)
- **Swipe anywhere** on the game area to slice fruits
- Continuous swiping creates a slicing trail
- Touch and drag to slice multiple fruits in one motion

### Mouse (Desktop)
- **Click and drag** to slice fruits
- Works the same as touch controls

## 📱 Technical Details

### Technologies
- Pure HTML5, CSS3, and Vanilla JavaScript
- Canvas API for slice trail rendering
- RequestAnimationFrame for smooth 60fps gameplay
- CSS transforms for hardware-accelerated animations

### Browser Requirements
- Modern browsers (Chrome 80+, Safari 12+, Firefox 75+)
- Touch events support for mobile
- Canvas 2D context support

### Performance
- Optimized for mobile devices
- Efficient DOM manipulation
- Particle system with automatic cleanup
- No memory leaks

## 🎯 Scoring

- Each fruit sliced: **+10 points**
- No combo system (keeps it simple for kids)
- High score shown at game over

## 🏆 Tips for High Scores

1. **Practice your swipes**: Quick, fluid motions work best
2. **Slice multiple fruits**: Wait for clusters, then swipe through them
3. **Watch for bombs**: Take your time, accuracy matters
4. **Don't panic**: Missing one fruit is okay, you have 3 lives
5. **Stay calm at high speeds**: The game gets faster, but patterns remain predictable

## 🔧 Game Configuration

The game can be customized by editing `game.js`:

```javascript
const CONFIG = {
    gravity: 0.5,              // Gravity strength
    spawnInterval: 1000,       // Initial spawn rate (ms)
    minSpawnInterval: 400,     // Fastest spawn rate
    fruitSpeed: { min: -18, max: -22 }, // Launch velocity
    bombChance: 0.15,          // 15% bomb spawn rate
    sliceDistance: 40,         // Slice detection radius
};
```

## 📐 Game Structure

```
fruit-ninja/
├── index.html          # Game HTML structure
├── style.css           # Styling and animations
├── game.js             # Game logic and physics
└── README.md           # This file
```

## 🎨 Code Highlights

### Physics Engine
Fruits follow realistic parabolic trajectories with:
- Gravity acceleration
- Initial velocity (vertical and horizontal)
- Rotation animation

### Collision Detection
- Distance-based detection between slice trail and fruit centers
- Efficient algorithm runs every frame
- No false positives

### Particle System
- Dynamic particle creation on slice
- Individual animation loops
- Automatic cleanup

## 🐛 Known Limitations

- No sound effects (can be added in future updates)
- No combo system
- No different game modes
- Score doesn't persist between sessions

## 🚀 Future Enhancements

Possible improvements:
- Add sound effects for slices and bombs
- Implement combo multipliers
- Add different fruit types with varying point values
- Include power-ups (slow motion, double points, etc.)
- Save high scores to localStorage
- Add different game modes (time attack, survival, etc.)

## 🎮 Gameplay Stats

- **Average game length**: 1-3 minutes
- **Skill level**: Easy to learn, hard to master
- **Replay value**: High (score-chasing)
- **Age range**: 5+ years old

## 📝 Development

- **Built with**: Vanilla JavaScript (ES6+)
- **Development time**: Part of Kids Games Collection
- **Code style**: Well-commented, organized by functionality
- **Tested on**: Chrome, Safari, Firefox (mobile and desktop)

## 🎉 Credits

- Game concept inspired by the original Fruit Ninja
- Built as part of the Kids Games Collection
- Uses emoji for graphics (no external assets)

---

**Ready to slice some fruit? Hit that Start Game button!** 🍉🥷
