# Pac-Man

A classic Pac-Man maze game built with HTML5 Canvas and vanilla JavaScript. Navigate through the maze, collect all the dots, and avoid the ghosts!

## Features

- **Classic Maze Navigation**: Grid-based movement through a simplified Pac-Man maze
- **Player Character**: Animated yellow Pac-Man with mouth animation
- **Collectibles**:
  - Regular dots (10 points each)
  - Power pellets (50 points each)
- **Ghost Enemies**: Three colorful ghosts with AI behavior:
  - Blinky (Red)
  - Pinky (Pink)
  - Inky (Cyan)
- **Power-Up Mode**: Eat power pellets to temporarily turn the tables on ghosts (200 points per ghost)
- **Lives System**: Start with 3 lives, lose one when caught by a ghost
- **Score Tracking**: Real-time score updates with localStorage high score persistence
- **Responsive Controls**:
  - Keyboard arrow keys (or WASD)
  - Touch-friendly on-screen D-pad buttons
- **Mobile-First Design**: Fully responsive layout optimized for all screen sizes

## How to Play

### Objective
Collect all dots and power pellets in the maze while avoiding ghosts. Clear the entire maze to win!

### Controls

**Keyboard:**
- Arrow Keys or WASD to move Pac-Man
- Enter or Space to restart after game over

**Touch/Mobile:**
- Use the on-screen directional pad (D-pad) buttons
- Tap the "Play Again" button to restart

### Gameplay

1. **Movement**: Pac-Man moves in the direction you choose and continues until hitting a wall or changing direction
2. **Collecting Items**:
   - Small dots give 10 points
   - Large power pellets give 50 points and activate power-up mode
3. **Ghost AI**:
   - Ghosts chase Pac-Man using simple pathfinding
   - During power-up mode, ghosts flee from Pac-Man
4. **Power-Up Mode**:
   - Lasts 5 seconds after eating a power pellet
   - Ghosts turn blue and can be eaten for 200 points
   - Eaten ghosts respawn at the center
5. **Lives**:
   - Start with 3 lives
   - Lose a life when caught by a ghost (if not powered up)
   - Game over when all lives are lost
6. **Winning**: Collect all dots and power pellets to win the game

## Technical Details

### Architecture

- **HTML5 Canvas**: All game rendering is done using the Canvas API
- **Grid-Based System**: 19x21 tile grid with 20px tiles
- **Game Loop**: RequestAnimationFrame for smooth 60 FPS gameplay
- **State Management**: Simple state machine (ready, playing, gameover, won)

### File Structure

```
pac-man/
├── index.html      # Game HTML structure
├── style.css       # Responsive styling
├── game.js         # Game logic and rendering
└── README.md       # Documentation
```

### Key Classes

- **PacMan**: Player character with movement, collision, and collection logic
- **Ghost**: Enemy AI with chase behavior and scared mode
- **Dot**: Regular collectible items
- **PowerPellet**: Special collectibles that activate power-up mode

### Configuration

Game settings can be adjusted in `game.js` CONFIG object:

```javascript
const CONFIG = {
    tileSize: 20,              // Size of each grid tile in pixels
    gridWidth: 19,             // Number of tiles horizontally
    gridHeight: 21,            // Number of tiles vertically
    pacmanSpeed: 3,            // Pac-Man movement speed
    ghostSpeed: 2,             // Ghost movement speed
    dotScore: 10,              // Points per dot
    powerPelletScore: 50,      // Points per power pellet
    ghostScore: 200,           // Points per ghost eaten
    initialLives: 3,           // Starting lives
    powerUpDuration: 5000      // Power-up duration in milliseconds
};
```

## Browser Compatibility

- Chrome/Edge: ✓ Fully supported
- Firefox: ✓ Fully supported
- Safari: ✓ Fully supported
- Mobile browsers: ✓ Optimized for touch

## Performance

- Lightweight vanilla JavaScript (no frameworks)
- Efficient canvas rendering
- Optimized for mobile devices
- No external dependencies

## Future Enhancements

Possible improvements:
- Additional ghost AI patterns (scatter mode, personality types)
- Bonus fruit items
- Level progression with increasing difficulty
- Sound effects and background music
- Animated transitions
- Multiple maze layouts
- Leaderboard system

## Credits

Inspired by the classic Pac-Man arcade game created by Namco (1980).

## License

Part of the Kids Games Collection - Educational project for learning game development.
