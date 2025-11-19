# 🐍 Snake Game

A classic Snake game built with HTML5 Canvas and vanilla JavaScript. Control a growing snake, eat food, and try to beat your high score without hitting the walls or yourself!

## How to Play

1. **Start the Game**: Click or tap the "Start Game" button
2. **Control the Snake**:
   - **Touch Controls**: Use the directional buttons (↑ ← → ↓) in the bottom-right corner
   - **Swipe**: Swipe in any direction on the game canvas to move the snake
   - **Keyboard**: Use arrow keys or WASD keys on desktop
3. **Objective**: Eat the red food to grow longer and increase your score
4. **Avoid**:
   - Don't hit the walls
   - Don't run into your own body
5. **Score**: Your score equals the length of your snake minus the starting length

## Features

- **Classic Snake Mechanics**: Grid-based movement with smooth animations
- **Progressive Difficulty**: Snake speed increases gradually as you eat more food
- **Multiple Control Options**:
  - Touch-friendly directional buttons
  - Swipe gestures for intuitive mobile control
  - Keyboard support for desktop play
- **High Score Tracking**: Best score saved in browser localStorage
- **Responsive Design**: Adapts to any screen size and orientation
- **Visual Feedback**:
  - Glowing effects on snake head and food
  - Gradient coloring from head to tail
  - Snake eyes that face the direction of movement
- **Mobile-First**: Optimized for touch devices with 60 FPS performance

## Game Mechanics

- **Starting Length**: 3 segments
- **Initial Speed**: 150ms per move
- **Speed Increase**: Gets 5ms faster with each food eaten
- **Maximum Speed**: 50ms per move (fastest difficulty)
- **Grid Size**: Dynamic based on screen size
- **Food Spawning**: Random positions, never on the snake

## Controls Summary

| Action | Touch | Keyboard |
|--------|-------|----------|
| Move Up | ↑ button or swipe up | ↑ or W |
| Move Down | ↓ button or swipe down | ↓ or S |
| Move Left | ← button or swipe left | ← or A |
| Move Right | → button or swipe right | → or D |
| Start Game | Tap "Start Game" | Click "Start Game" |
| Restart | Tap "Play Again" | Click "Play Again" |

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Vanilla JS, no frameworks or libraries
- **Canvas API**: Hardware-accelerated rendering
- **LocalStorage API**: Persistent high score storage

### Browser Requirements
- Chrome/Safari on iOS 12+
- Chrome 80+ on Android
- Firefox 75+
- Edge 80+
- Any modern browser with HTML5 Canvas support

### Performance
- **Frame Rate**: 60 FPS
- **Touch Response**: < 100ms
- **Canvas Rendering**: Optimized with requestAnimationFrame
- **No External Dependencies**: Runs entirely offline

### File Structure
```
snake/
├── index.html    # Game structure and layout
├── style.css     # Responsive styles and animations
├── game.js       # Game logic and rendering
└── README.md     # This file
```

## Code Highlights

- **Input Buffering**: Direction changes are buffered to prevent missed inputs
- **Collision Detection**: Efficient grid-based collision checking
- **Responsive Canvas**: Automatically scales to fit available space
- **Touch Optimization**: Prevents scrolling and zoom during gameplay
- **Polyfills**: Includes roundRect polyfill for older browsers

## Game States

1. **Welcome**: Initial screen with instructions
2. **Playing**: Active gameplay with controls visible
3. **Game Over**: Shows final score and best score

## Development

- **Version**: 1.0.0
- **Build Date**: 2025-11-19
- **Standards**: Follows Kids Games Collection Technical Standards
- **Testing**: Tested on mobile devices and desktop browsers

## Tips for High Scores

1. Plan your path - don't trap yourself in corners
2. Use the center of the board when starting
3. Create circular patterns to buy time as you grow
4. Remember: you can't reverse direction instantly
5. Stay calm as the speed increases!

## Accessibility

- Touch targets meet minimum size requirements (60px × 60px)
- Keyboard navigation fully supported
- ARIA labels on directional buttons
- High contrast colors for visibility
- No flashing content (seizure-safe)

## Known Limitations

- Snake cannot pass through walls (classic mode)
- Speed caps at 50ms per move
- Grid size adjusts to screen but maintains square cells

---

**Enjoy the game! Try to beat your high score!** 🐍🎮
