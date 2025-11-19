# Dance Move Matcher

A rhythm-based dance game where players tap arrow buttons to match dance moves scrolling down the screen. Similar to Dance Dance Revolution!

## How to Play

1. Tap "Start Dancing" to begin
2. Watch arrows scroll down from the top in four lanes
3. Tap the matching arrow button at the bottom when an arrow reaches the target zone (lit area)
4. Build combos by hitting arrows consecutively
5. The game lasts 60 seconds - get the highest score possible!

## Game Features

- **Four Directions**: Left (←), Up (↑), Down (↓), Right (→)
- **Combo System**: Hit arrows consecutively to build combos and earn bonus points
- **Timing-Based Scoring**:
  - Perfect hit (close to center): 100 points
  - Good hit: 50 points
  - Combo bonus: Additional points based on combo length
- **60-Second Challenge**: Score as many points as you can in one minute
- **Visual Feedback**: Arrows light up when hit correctly

## Scoring System

**Base Points:**
- Perfect Hit: 100 points (within 20px of target center)
- Good Hit: 50 points

**Combo Bonus:**
- Each consecutive hit adds 10% bonus per combo count
- Example: 5-combo gives 50% extra points per hit
- Missing an arrow resets your combo to 0

## Game Mechanics

- Arrows spawn randomly in one of four lanes
- Arrows scroll down at constant speed
- Hit zone is the illuminated area at the top
- Missing arrows or tapping wrong directions breaks combo
- Max combo and final score shown at game end

## Technical Details

- **Technologies**: HTML5, CSS3, Vanilla JavaScript, Web Audio API
- **Mobile Optimized**: Touch-friendly responsive design
- **Browser Requirements**: Modern browsers with Web Audio API support
- **No Dependencies**: Pure web technologies, synthesized audio
- **Self-Contained**: No external resources needed

## Learning Benefits

- **Rhythm and Timing**: Develop sense of rhythm and precise timing
- **Reaction Speed**: Improve quick reaction times
- **Hand-Eye Coordination**: Enhance coordination between seeing and tapping
- **Pattern Recognition**: Anticipate and prepare for upcoming moves
- **Focus and Concentration**: Maintain attention through the challenge

## Tips for High Scores

- Focus on timing rather than speed
- Watch the upcoming arrows to prepare
- Perfect hits are worth double - aim for the center
- Build and maintain combos for bonus points
- Don't panic if you miss - reset and keep going
- Practice makes perfect!

## Difficulty Elements

The game gradually becomes more challenging as you:
- Get used to the arrow speed
- Build longer combos (more pressure not to miss)
- Deal with varying arrow patterns

## Development

- **Category**: Music & Rhythm
- **Complexity**: Medium
- **Target Age**: 7+
- **Version**: 1.0
- **Audio**: Synthesized using Web Audio API
- **Game Duration**: 60 seconds per round
