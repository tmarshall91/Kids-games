# Shape Sorter

A fun and educational drag-and-drop game where kids match shapes to their corresponding holes. Perfect for teaching shape recognition and developing fine motor skills!

## 🎯 How to Play

1. **Tap "Start Game"** to begin
2. **Look at the target holes** at the top - each shows which shape belongs there (🔵🟨🔺⭐)
3. **Drag a shape** from the bottom to its matching hole at the top
4. **Match correctly** and score points!
5. **Complete all 12 shapes** to finish the game

## 🎮 Controls

- **Desktop**: Click and drag shapes with your mouse
- **Mobile**: Touch and drag shapes with your finger

## ✨ Features

- 4 different shapes to match:
  - 🔵 **Circle** - Blue round shape
  - 🟨 **Square** - Yellow square shape
  - 🔺 **Triangle** - Red triangular shape
  - ⭐ **Star** - Purple star shape

- Progressive gameplay with 3 rounds of 4 shapes each
- Score tracking (10 points per correct match)
- Visual feedback for correct and incorrect matches
- Encouraging messages based on performance
- Touch-optimized for mobile devices
- Smooth drag-and-drop animations

## 🎨 Educational Value

This game helps children:
- Learn to recognize basic geometric shapes
- Develop hand-eye coordination
- Practice problem-solving skills
- Build confidence through positive reinforcement

## 🛠️ Technical Details

**Technologies Used:**
- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)

**Browser Requirements:**
- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile-friendly and touch-enabled
- No external dependencies

**Performance:**
- 60fps smooth animations
- Optimized for mobile devices
- GPU-accelerated transforms

## 📐 Game Structure

```
shape-sorter/
├── index.html          # Game structure
├── style.css           # Styles for shapes and animations
├── game.js             # Drag-and-drop logic and game mechanics
├── README.md           # This file
└── assets/             # (No assets needed - pure CSS shapes!)
```

## 🎯 Scoring System

- Each correct match: **10 points**
- Total possible score: **120 points** (12 shapes × 10 points)
- Performance messages:
  - 100%: "Perfect! You matched them all! 🌟"
  - 75-99%: "Excellent work! 🎉"
  - 50-74%: "Good job! Keep practicing! 👍"
  - 0-49%: "Nice try! You can do better! 💪"

## 🚀 Game Flow

1. **Start Screen**: Shows instructions and shape preview
2. **Round 1-3**: 4 random shapes to match in each round
3. **Game Over**: Shows final score and encouraging message
4. **Play Again**: Restart to try for a perfect score!

## 🎨 Design Features

- Bright, kid-friendly colors
- Smooth drag animations
- Visual feedback (shake for wrong, bounce for correct)
- Responsive layout for all screen sizes
- Touch-friendly large targets (70px × 70px)

## 🧩 Shape Implementations

All shapes are created using pure CSS:
- **Circle**: `border-radius: 50%`
- **Square**: Solid rectangle with rounded corners
- **Triangle**: CSS border trick
- **Star**: CSS `clip-path` polygon

## 📱 Mobile Optimization

- Touch events with visual clone during drag
- Prevents scrolling during gameplay
- Large touch targets
- Optimized animations
- Works in any orientation

## 🎓 For Developers

**Key Functions:**
- `createRound()`: Generates shapes and targets for each round
- `handleTouchStart/Move/End()`: Mobile touch handling
- `handleDragStart/Drop()`: Desktop drag-and-drop
- `checkMatch()`: Validates shape-to-target matching
- `handleCorrectMatch()`: Success animation and progression
- `handleWrongMatch()`: Error feedback animation

**State Management:**
The game tracks:
- Current score
- Shapes matched (out of 12)
- Playing state
- Current shapes and targets arrays

## 🐛 Known Issues

None! The game has been thoroughly tested for both desktop and mobile.

## 🔄 Version History

- **v1.0.0** (2025-11-19): Initial release
  - 4 shapes (circle, square, triangle, star)
  - 3 rounds of 4 shapes each
  - Full mobile and desktop support
  - Scoring and feedback system

## 👏 Credits

Developed for the Kids Games Collection project following the technical standards and best practices outlined in the repository guidelines.

## 📝 License

Part of the Kids Games Collection - for educational and entertainment purposes.

---

**Have fun matching shapes! 🎨✨**
