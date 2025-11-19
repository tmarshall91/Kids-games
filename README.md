# Kids Games Collection 🎮

A collection of browser-based, mobile-friendly games designed for kids. This repository is structured to allow multiple developers (including AI agents) to work in parallel, each building independent games while following consistent standards.

## 🎯 Project Goals

- Build a comprehensive collection of fun, educational, and engaging games for kids
- All games must be playable in a mobile web browser
- Maintain consistent quality, structure, and user experience across all games
- Enable parallel development by multiple contributors

## 🏗️ Repository Structure

```
Kids-games/
├── games/                    # All game projects live here
│   ├── whack-a-mole/
│   ├── memory-match/
│   └── [game-name]/         # Each game in its own directory
├── template/                 # Game template to copy for new games
├── index.html               # Main catalog page listing all games
├── CONTRIBUTING.md          # How to add a new game (READ THIS FIRST!)
├── TECHNICAL_STANDARDS.md   # Technical requirements and best practices
└── GAME_IDEAS.md            # List of game concepts organized by complexity
```

## 🚀 Quick Start for New Game Development

If you're a Claude instance (or human developer) adding a new game:

1. **READ THE GUIDELINES**: Review `CONTRIBUTING.md` and `TECHNICAL_STANDARDS.md` first
2. **CHOOSE A GAME**: Select a game from `GAME_IDEAS.md` or propose a new concept
3. **COPY THE TEMPLATE**: Duplicate the `/template` directory to `/games/[your-game-name]`
4. **BUILD YOUR GAME**: Follow the technical standards and structure
5. **UPDATE THE CATALOG**: Add your game to `index.html`
6. **TEST ON MOBILE**: Ensure it works on mobile browsers
7. **COMMIT & PUSH**: Use clear commit messages describing your game

## 📱 Technical Requirements (Summary)

- **Pure web technologies**: HTML5, CSS3, Vanilla JavaScript (no frameworks required)
- **Mobile-first**: Touch-friendly, responsive design
- **No build step**: Games should run directly in the browser
- **Offline-capable**: All assets self-contained
- **Kid-friendly**: Appropriate content, simple controls

See `TECHNICAL_STANDARDS.md` for complete requirements.

## 🎮 Game Categories

Games are organized by complexity level:

- **Quick & Simple**: Whack-a-Mole, Simon Says, Color Match
- **Medium Complexity**: Flappy Bird clone, Memory games, Simple puzzles
- **More Complex**: Platformers, Tower Defense, Adventure games

Full list in `GAME_IDEAS.md`

## 📂 Game Directory Structure

Each game follows this structure:

```
games/[game-name]/
├── index.html          # Game entry point
├── style.css           # Game styles
├── game.js             # Game logic
├── README.md           # Game-specific documentation
└── assets/             # Images, sounds, etc. (optional)
```

## 🤝 Contributing

This repository is designed for parallel development. Multiple people can work on different games simultaneously without conflicts.

**For Claude Instances**: When you're assigned to build a game, check `CONTRIBUTING.md` for the complete workflow. You'll find everything you need to build a standards-compliant game.

**For Humans**: Same process! The documentation is clear enough for anyone to follow.

## 📋 Current Games

See `index.html` for the live catalog of all available games.

## 🎨 Design Philosophy

- **Simple and Fun**: Games should be intuitive and enjoyable
- **Educational Value**: When possible, incorporate learning opportunities
- **Performance**: Games must run smoothly on mobile devices
- **Accessibility**: Consider color contrast, font sizes, and touch target sizes
- **No Ads/Tracking**: Pure gaming experience for kids

## 📝 License

This is a personal project for educational and entertainment purposes.

## 🆘 Need Help?

Check these resources in order:
1. `CONTRIBUTING.md` - Workflow and guidelines
2. `TECHNICAL_STANDARDS.md` - Technical requirements
3. `/template` - Working example structure
4. Existing games in `/games` - Reference implementations

---

**Ready to build a game?** Start with `CONTRIBUTING.md`!
