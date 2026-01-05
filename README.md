# 🏓 Terminal Table Tennis

A terminal-based table tennis game built with Node.js, featuring local multiplayer, AI opponents, power-ups, and statistics tracking.

## Features

### Game Modes

- **Two Player Mode** - Local multiplayer for two players
- **VS AI Mode** - Single player against AI with four difficulty levels:
  - Easy - Beginner-friendly
  - Medium - Balanced challenge
  - Hard - Skilled player difficulty
  - Impossible - Near-perfect AI

### Power-Up System

Power-ups spawn randomly during gameplay and provide temporary advantages:

- **Speed Boost** - Increases paddle movement speed
- **Size Increase** - Temporarily enlarges paddle size
- **Slow Motion** - Reduces ball speed for strategic advantage

### Visual Effects

- Particle effects on collisions and scoring
- Ball trail visualization
- Animated center line
- Color-coded ball (changes based on speed)
- Power-up indicators

### Statistics Tracking

Game statistics are automatically saved to `game_stats.json`:

- Total games played
- Win/loss records for both players
- Longest rally achieved
- Average rally length
- Total power-ups collected
- Game history

### Gameplay Features

- Realistic physics with angle-based ball deflection
- Rally counter displayed in real-time
- Ball speed scaling (increases with each hit, capped for balance)
- Pause/resume functionality
- Menu system with navigation

### AI System

The AI opponent uses predictive algorithms:

- Trajectory prediction
- Difficulty-based reaction speed and accuracy
- Imperfection system for realistic gameplay
- Optimal positioning

## Requirements

- Node.js v12 or higher
- Terminal with ANSI escape code support (most modern terminals)

## Installation

No installation required. Simply run:

```bash
node game.js
```

## Controls

### Menu Navigation

- **↑/↓** - Navigate menu options
- **ENTER** - Select option
- **Q** - Quit game

### In-Game Controls

**Left Paddle:**
- `W` - Move up
- `S` - Move down

**Right Paddle** (Two Player Mode only):
- `↑` - Move up
- `↓` - Move down

**Game Controls:**
- `P` - Pause/Resume
- `Q` - Quit to menu

## Game Mechanics

- **Court Size:** 60x20 characters
- **Paddle Height:** 4 characters (base), can increase with power-ups
- **Ball Speed:** Starts at 1, increases 8% per paddle hit (capped at 3.5)
- **Paddle Speed:** 2 units per keypress (increases with speed power-up)
- **Winning Score:** First to 5 points
- **Frame Rate:** 30 FPS
- **Power-Up Spawn Rate:** Random, approximately every 10 seconds

## Technical Details

- Built with Node.js using the `readline` module
- ANSI escape codes for terminal graphics and colors
- Real-time input handling with raw mode
- Frame buffer system for smooth rendering
- Particle system for visual effects
- Persistent statistics saved to JSON

## Visual Design

- Cyan borders and center line
- Green paddles (yellow when powered up)
- White/Yellow/Red ball (color indicates speed)
- Yellow score display
- Magenta rally counter
- Particle effects on collisions

## Statistics File

Statistics are automatically saved to `game_stats.json` in the project directory. The file tracks:

- Total games played
- Wins for left and right players
- Longest rally achieved
- Average rally length
- Total power-ups collected
- Complete game history

## Notes

- Requires a terminal that supports ANSI escape codes
- Recommended terminal size: at least 62 characters wide and 25 characters tall
- Cursor is hidden during gameplay
- Statistics are automatically saved after each game
- Power-ups spawn randomly during gameplay

## License

This project is provided as-is for educational and entertainment purposes.
