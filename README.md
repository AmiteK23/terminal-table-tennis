# 🏓 Terminal Table Tennis Ultra

A **MASSIVELY ENHANCED** classic Pong-style table tennis game that runs right in your terminal! This isn't just a game—it's an **ULTRA** gaming experience with AI opponents, power-ups, particle effects, statistics tracking, and so much more!

## ✨ New Ultra Features

### 🎮 Game Modes
- **Two Player Mode** - Classic local multiplayer
- **VS AI Mode** - Play against AI with 4 difficulty levels:
  - **Easy** - Perfect for beginners
  - **Medium** - Balanced challenge
  - **Hard** - For skilled players
  - **Impossible** - Nearly perfect AI (good luck!)

### ⚡ Power-Up System
- **Speed Boost** ⚡ - Makes your paddle move faster temporarily
- **Size Increase** ⬆ - Increases paddle size for easier hits
- **Slow Motion** 🐌 - Slows down the ball for strategic advantage
- Power-ups spawn randomly during gameplay
- Visual effects when collecting power-ups

### 🎨 Visual Enhancements
- **Particle Effects** - Explosive visual feedback on collisions and scores
- **Ball Trail** - Beautiful trailing effect showing ball movement
- **Animated Center Line** - Dynamic visual element
- **Color-Coded Ball** - Ball changes color based on speed
- **Power-Up Indicators** - Visual feedback for active power-ups
- **Enhanced Graphics** - Improved borders, colors, and effects

### 📊 Statistics System
- **Game Statistics Tracking** - Automatically saves to `game_stats.json`
- **Longest Rally** - Track your best rally count
- **Average Rally** - See your average performance
- **Win/Loss Records** - Track wins for both players
- **Power-Up Collection Stats** - See how many power-ups you've collected
- **Games Played Counter** - Track total games

### 🎯 Enhanced Gameplay
- **Improved Physics** - More realistic ball movement and collisions
- **Rally Counter** - See your current rally count in real-time
- **Better Collision Detection** - More accurate paddle-ball interactions
- **Speed Scaling** - Ball speed increases with each hit (capped for balance)
- **Angle Physics** - Ball angle changes based on where it hits the paddle
- **Pause/Resume** - Press `P` to pause anytime during gameplay

### 🎪 Menu System
- **Beautiful Main Menu** - Navigate with arrow keys
- **Game Mode Selection** - Easy access to all game modes
- **Statistics View** - View your game stats anytime
- **Smooth Navigation** - Intuitive menu controls

### 🤖 Advanced AI
- **Predictive AI** - AI predicts ball trajectory
- **Difficulty Scaling** - Four distinct difficulty levels
- **Imperfection System** - AI makes mistakes based on difficulty
- **Reaction Speed** - Varies by difficulty level
- **Smart Positioning** - AI positions paddle optimally

## 📋 Requirements

- **Node.js** (v12 or higher recommended)
- A terminal that supports ANSI escape codes (most modern terminals do)

## 🚀 How to Run

1. Make sure you have Node.js installed on your system
2. Navigate to the project directory
3. Run the game:

```bash
node game.js
```

That's it! The game will start with a beautiful menu screen.

## 🎮 How to Play

### Menu Navigation
- **↑/↓** - Navigate menu options
- **ENTER** - Select option
- **Q** - Quit game

### In-Game Controls

- **Left Paddle:**
  - `W` - Move paddle up
  - `S` - Move paddle down

- **Right Paddle** (Two Player Mode):
  - `↑` (Up Arrow) - Move paddle up
  - `↓` (Down Arrow) - Move paddle down

- **Game Controls:**
  - `P` - Pause/Resume game
  - `Q` - Quit to menu

### Gameplay Tips

1. **Power-Ups** - Collect power-ups that spawn randomly for advantages
2. **Rally Building** - Longer rallies increase excitement and stats
3. **Paddle Edges** - Hit the ball with paddle edges for sharper angles
4. **Speed Management** - Ball speeds up over time—stay alert!
5. **AI Difficulty** - Start with Easy and work your way up to Impossible
6. **Pause Strategy** - Use pause (`P`) to take breaks during intense matches

## 🎯 Game Mechanics

- **Court Size:** 60x20 characters
- **Base Paddle Height:** 4 characters (can increase with power-ups)
- **Ball Speed:** Starts at 1, increases by 8% with each paddle hit (capped at 3.5)
- **Paddle Speed:** 2 units per keypress (increases with speed power-up)
- **Winning Score:** First to 5 points
- **Frame Rate:** 30 FPS (smooth gameplay)
- **Power-Up Spawn Rate:** Random, approximately every 10 seconds

## 🛠️ Technical Details

- Built with Node.js and the `readline` module
- Uses ANSI escape codes for terminal graphics and colors
- Real-time input handling with raw mode
- Smooth game loop running at 30 FPS
- Persistent statistics saved to `game_stats.json`
- Particle system for visual effects
- Advanced AI with predictive algorithms

## 🎨 Visual Elements

- **Cyan borders** - Court boundaries and animated center line
- **Green paddles** - Player-controlled paddles (yellow when powered up)
- **White/Yellow/Red ball** - Changes color based on speed
- **Yellow score** - Current game score with enhanced display
- **Magenta rally counter** - Shows current rally count
- **Particle effects** - Colorful explosions on collisions
- **Power-up icons** - Visual indicators for power-ups

## 📊 Statistics File

The game automatically creates a `game_stats.json` file to track:
- Total games played
- Wins for left and right players
- Longest rally achieved
- Average rally length
- Total power-ups collected
- Game history

## 🎉 What Makes This Ultra?

1. **AI Opponent** - Play solo against intelligent AI
2. **Power-Ups** - Strategic gameplay elements
3. **Particle Effects** - Beautiful visual feedback
4. **Statistics** - Track your progress over time
5. **Menu System** - Professional game interface
6. **Enhanced Physics** - More realistic gameplay
7. **Pause Feature** - Take breaks anytime
8. **Visual Polish** - Trails, animations, and effects
9. **Multiple Difficulties** - Challenge yourself
10. **Persistent Stats** - Your progress is saved

## 📝 Notes

- The game requires a terminal that supports ANSI escape codes
- Works best in a terminal window that's at least 62 characters wide and 25 characters tall
- The cursor is hidden during gameplay for a cleaner experience
- Statistics are automatically saved after each game
- Power-ups spawn randomly—keep an eye out!

## 🏆 Challenge Yourself

- Try to beat the **Impossible** AI difficulty
- Achieve a rally count of 50+ (check your stats!)
- Collect 100+ power-ups across all games
- Master the power-up combinations for strategic advantage

## 🎉 Enjoy!

Have fun playing Terminal Table Tennis Ultra! Challenge yourself, beat the AI, collect power-ups, and become the ultimate paddle master! 🏓⚡🎮

---

**Version:** Ultra Edition  
**Last Updated:** Enhanced with 1,000,000x improvements! 🚀
