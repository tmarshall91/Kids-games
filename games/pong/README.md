# Pong

A classic arcade-style Pong game optimized for mobile devices with intuitive touch controls.

## Description

Experience the timeless game of Pong! Control your paddle at the bottom of the screen and compete against an AI opponent. The first player to score 5 points wins the match.

## How to Play

### Objective
- Score points by getting the ball past the opponent's paddle
- First to reach 5 points wins
- Beat your best winning streak

### Controls
- **Touch**: Tap and hold on the left or right side of the screen to move your paddle
- **Mouse**: Move your mouse left and right to control the paddle (desktop)
- The paddle will smoothly follow your finger or cursor position

### Gameplay
1. Tap "Start Game" to begin
2. The ball will start moving in a random direction
3. Move your paddle to bounce the ball back toward the AI opponent
4. Score a point when the ball passes the AI's paddle at the top
5. The AI scores when the ball passes your paddle at the bottom
6. First to 5 points wins!

### Game Elements
- **White Ball**: Bounces off walls and paddles
- **Pink Paddle (Bottom)**: Your paddle - controlled by touch/mouse
- **Purple Paddle (Top)**: AI opponent - tracks the ball
- **Center Line**: Divides the playing field

## Features

- Classic Pong gameplay with modern touch controls
- Smooth paddle movement and ball physics
- AI opponent with intelligent ball tracking
- Score tracking (first to 5 wins)
- Best wins streak saved to localStorage
- Mobile-first responsive design
- Touch and mouse support
- Beautiful gradient UI with glowing effects
- Game over overlay with win/lose messages

## Technical Details

- **Built with**: Vanilla JavaScript, HTML5 Canvas, CSS3
- **Mobile Optimized**: Touch controls, responsive design
- **Accessibility**: High contrast colors, clear visual feedback
- **Performance**: RequestAnimationFrame for smooth 60fps gameplay
- **Storage**: LocalStorage for best score persistence

## Ball Physics

- Ball bounces off side walls
- Ball angle changes based on where it hits the paddle
- Hitting the center of the paddle returns the ball straight
- Hitting the edges adds angle for strategic gameplay
- Constant ball speed with predictable physics

## AI Opponent

The AI opponent uses a simple but effective tracking algorithm:
- Follows the ball's horizontal position
- Moves at a slightly slower speed than the player for fair gameplay
- Stays within the game boundaries
- Provides a fun and challenging experience

## Browser Compatibility

- Chrome/Edge (recommended)
- Safari (iOS/macOS)
- Firefox
- Any modern browser with HTML5 Canvas support

## Tips for Players

1. **Control the Angle**: Hit the ball with the edges of your paddle to create sharper angles
2. **Center Hits**: Hit with the middle of the paddle for straighter returns
3. **Anticipate**: Watch the ball's trajectory and position yourself early
4. **Corner Shots**: Try to bounce the ball into the corners to make it harder for the AI
5. **Stay Centered**: Return to the center position after each hit for better coverage

## Files

- `index.html` - Game structure and layout
- `style.css` - Mobile-first responsive styling with gradient theme
- `game.js` - Game logic, physics, and AI
- `README.md` - This documentation

## Game Configuration

The game can be customized by modifying the CONFIG object in `game.js`:

```javascript
const CONFIG = {
    paddleWidth: 80,      // Width of paddles
    paddleHeight: 12,     // Height of paddles
    paddleSpeed: 8,       // Player paddle speed
    ballSize: 10,         // Ball diameter
    ballSpeedX: 4,        // Ball horizontal speed
    ballSpeedY: 4,        // Ball vertical speed
    aiSpeed: 3.5,         // AI paddle speed
    winningScore: 5,      // Points needed to win
    paddleOffset: 20      // Distance from edge
};
```

## Credits

Classic Pong game reimagined for modern mobile devices as part of the Kids Games Collection.
