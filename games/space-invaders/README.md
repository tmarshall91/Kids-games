# Space Invaders

A classic arcade shooter game where you defend Earth from waves of alien invaders! Use your spaceship to destroy all the aliens before they reach the ground.

## Game Description

Space Invaders is a timeless arcade game that challenges players to defend Earth from an alien invasion. Control your spaceship at the bottom of the screen, shoot down rows of aliens moving across the sky, and avoid their return fire. As you progress through levels, the aliens become faster and more aggressive!

## How to Play

### Objective
- Destroy all alien invaders before they reach the bottom of the screen
- Survive multiple waves with limited lives
- Achieve the highest score possible

### Controls

**Mobile/Touch Devices:**
- **Move Left:** Tap the left side of the screen
- **Move Right:** Tap the right side of the screen
- **Shoot:** Tap the top third of the screen

**Desktop/Keyboard:**
- **Move Left:** Arrow Left or 'A' key
- **Move Right:** Arrow Right or 'D' key
- **Shoot:** Spacebar or click top area

### Game Rules
1. You start with **3 lives**
2. Destroy aliens to earn points:
   - Top row (Red): 30 points each
   - Middle row (Orange): 20 points each
   - Bottom rows (Purple): 10 points each
3. Aliens move side-to-side and drop down when reaching the edge
4. Aliens shoot back randomly
5. Use shields for protection (they degrade with damage)
6. Complete a level to progress - aliens get faster each level
7. Earn bonus lives when completing levels
8. Game ends when:
   - You lose all lives
   - Aliens reach the bottom of the screen

## Features

### Core Gameplay
- Classic Space Invaders mechanics
- Multiple rows of alien enemies
- Player spaceship with shooting capabilities
- Alien return fire
- Destructible shields for protection
- Progressive difficulty across levels

### Game Systems
- **Lives System:** Start with 3 lives, earn more by completing levels
- **Score System:** Earn points for each alien destroyed
- **Level Progression:** Aliens get faster and shoot more frequently
- **High Score Tracking:** Local storage saves your best score
- **Shields:** Four protective barriers that degrade with damage

### Visual Features
- Retro arcade-style graphics
- Animated aliens with tentacles
- Glowing bullet effects
- Starfield background
- Color-coded alien types
- Health-based shield colors
- Smooth animations

### Responsive Design
- Mobile-first design
- Touch-friendly controls
- Adapts to different screen sizes
- Works on phones, tablets, and desktops
- Portrait and landscape support

## Technical Details

### Technologies
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** (no frameworks)
- **CSS3** for responsive layout
- **localStorage** for high score persistence

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires HTML5 Canvas support

### Performance
- Optimized game loop with requestAnimationFrame
- Efficient collision detection
- Responsive scaling for different devices
- Smooth 60 FPS gameplay

## Game Tips

1. **Use Cover:** Hide behind shields when aliens shoot
2. **Aim Carefully:** You can only have 3 bullets on screen at once
3. **Clear from the Sides:** Start by eliminating aliens on the edges
4. **Watch the Speed:** Aliens speed up as their numbers decrease
5. **Time Your Shots:** Move and shoot strategically
6. **Protect Your Shields:** They won't last forever!

## Installation

No installation required! Simply open `index.html` in a web browser.

For local development:
```bash
# Navigate to the game directory
cd games/space-invaders/

# Open with a local server (recommended)
python -m http.server 8000
# OR
npx serve

# Then open http://localhost:8000 in your browser
```

## File Structure

```
space-invaders/
├── index.html      # Main HTML file with game structure
├── style.css       # Responsive CSS styling
├── game.js         # Game logic and mechanics
└── README.md       # This file
```

## Customization

You can easily customize the game by modifying `game.js`:

```javascript
// In the SpaceInvaders constructor:
this.alienRows = 4;              // Number of alien rows
this.alienCols = 8;              // Number of alien columns
this.alienSpeed = 1;             // Initial alien speed
this.alienShootChance = 0.002;   // Chance of alien shooting per frame
```

## Credits

- **Game Design:** Based on the classic Space Invaders arcade game (1978)
- **Development:** Modern HTML5/JavaScript implementation
- **Graphics:** Retro-inspired pixel-style rendering

## License

This is an educational implementation of the classic Space Invaders game for learning purposes.

---

**Enjoy defending Earth from the alien invasion!**
