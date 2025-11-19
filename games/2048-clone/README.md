# 2048 Clone

A mobile-friendly implementation of the classic 2048 puzzle game where you merge numbered tiles to reach 2048!

## How to Play

1. **Start**: Tap "New Game" to begin
2. **Move**: Swipe in any direction (up, down, left, right) or use arrow keys on desktop
3. **Merge**: When two tiles with the same number touch, they merge into one!
4. **Goal**: Reach the 2048 tile to win!
5. **Game Over**: The game ends when you can't make any more moves

## Game Rules

- Each swipe moves all tiles in that direction
- When two tiles with the same number collide, they merge into one tile with double the value
- After each move, a new tile (2 or 4) appears in a random empty spot
- Your score increases by the value of merged tiles
- Try to beat your best score!

## Features

- Touch-optimized controls for mobile devices
- Keyboard support for desktop (arrow keys)
- Score tracking with best score saved locally
- Smooth animations and visual feedback
- Responsive design works on all screen sizes
- Win detection when you reach 2048
- Option to continue playing after winning

## Controls

**Mobile:**
- Swipe up/down/left/right to move tiles

**Desktop:**
- Arrow keys (↑ ↓ ← →) to move tiles

## Technical Details

- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **Browser Support**: Modern mobile and desktop browsers
- **Storage**: LocalStorage for best score persistence
- **Performance**: Optimized for smooth 60fps gameplay

## Strategy Tips

- Keep your highest value tile in a corner
- Build tiles in a sequential pattern
- Don't fill up the board too quickly
- Plan ahead before each move
- Try to keep options open for movement

## Development

- **Version**: 1.0
- **Build Date**: 2025
- **Complexity**: Medium
- **Category**: Puzzle
