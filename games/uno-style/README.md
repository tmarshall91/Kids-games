# Color Match - Uno-Style Card Game

A colorful and fun Uno-style card matching game designed for kids! Match cards by color or number and be the first to play all your cards.

## How to Play

### Objective
Be the first player to play all your cards to win the game!

### Game Rules

1. **Starting the Game**
   - Each player (you and the computer) starts with 7 cards
   - Cards come in 4 colors: Red, Blue, Green, and Yellow
   - Each card has a number from 1 to 9
   - One card is placed face-up to start the discard pile

2. **Taking Your Turn**
   - You can play a card if it matches the current card's COLOR or NUMBER
   - Tap any playable card in your hand to play it
   - If you can't play a card, tap "Draw Card" to draw from the deck
   - If the drawn card is playable, you can play it or keep it for later
   - If you can't play, the turn passes to the computer

3. **Computer's Turn**
   - The computer will play a matching card if it has one
   - If not, it will draw from the deck
   - The computer plays automatically

4. **Winning**
   - The first player to play all their cards wins!
   - If the deck runs out, it will be reshuffled from played cards

### Controls

- **Tap a card** - Play that card (if it matches)
- **Tap "Draw Card"** - Draw a card from the deck when you can't play
- **Playable cards** - Will pulse/highlight to show you can play them

## Features

- 🎨 **Colorful Design** - Bright Uno-style colors (red, blue, green, yellow)
- 🤖 **Computer Opponent** - Play against a smart AI
- 📱 **Mobile-Friendly** - Fully optimized for touch screens
- ✨ **Visual Feedback** - Cards highlight when playable
- 💬 **Clear Messages** - Helpful messages guide you through the game
- 🔄 **Auto-Reshuffle** - Deck automatically reshuffles when empty
- 🎮 **Easy Controls** - Simple tap to play

## Technical Details

### Technologies Used
- HTML5 - Game structure
- CSS3 - Colorful styling with gradients and animations
- Vanilla JavaScript (ES6+) - Game logic and AI

### Browser Requirements
- Modern mobile browsers (iOS Safari 12+, Chrome 80+)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Touch screen support recommended
- No installation or build process required

### File Structure
```
uno-style/
├── index.html       # Game interface
├── style.css        # Uno-style colorful design
├── game.js          # Game logic and computer AI
└── README.md        # This file
```

## Game Mechanics

### Card Matching Rules
- **Color Match**: Any card of the same color can be played
- **Number Match**: Any card with the same number can be played
- **Both Match**: If both color and number match, it's a valid play!

### Computer AI Strategy
- Plays a random valid card from playable cards
- Draws a card if no playable cards available
- Automatically plays drawn card if it matches

### Deck Management
- 72 total cards (2 sets of 4 colors × 9 numbers)
- Deck automatically reshuffles when empty
- Current card remains on the discard pile during reshuffle

## Accessibility Features

- Large touch targets (minimum 48px × 48px)
- High contrast colors
- Clear visual feedback
- Simple, intuitive controls
- Mobile-first responsive design

## Tips for Kids

- 🎯 Look for the pulsing cards - those are playable!
- 🌈 Try to play cards that match the color first
- 🔢 If you don't have the color, look for matching numbers
- 🎲 Sometimes drawing a card can give you a better option
- 🏆 Keep track of how many cards the computer has left

## Development

- **Version**: 1.0.0
- **Created**: 2025
- **Follows**: Kids Games Collection Technical Standards
- **Mobile Optimized**: Yes
- **Offline Play**: Yes

## Known Features

- Smooth animations on card plays
- Responsive design for all screen sizes
- Touch and mouse input support
- Clear turn indicators
- Auto-disable draw button when cards are playable

Enjoy playing Color Match! 🎨🎉
