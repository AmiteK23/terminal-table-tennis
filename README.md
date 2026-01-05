# 🏓 Terminal Table Tennis

A classic Pong-style table tennis game that runs right in your terminal! Play against a friend in this retro-style two-player game with smooth animations and colorful graphics.

## ✨ Features

- **Two-player gameplay** - Perfect for local multiplayer fun
- **Smooth animations** - Runs at ~20 FPS for fluid gameplay
- **Colorful terminal graphics** - Uses ANSI escape codes for a vibrant display
- **Physics-based ball movement** - Ball speed increases with each hit and angle changes based on paddle contact point
- **Score tracking** - First to 5 points wins!
- **Clean game over screen** - Celebrate the winner with a victory message

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

That's it! The game will start immediately.

## 🎮 How to Play

### Controls

- **Left Paddle:**
  - `W` - Move paddle up
  - `S` - Move paddle down

- **Right Paddle:**
  - `↑` (Up Arrow) - Move paddle up
  - `↓` (Down Arrow) - Move paddle down

- **Quit:**
  - `Q` - Exit the game
  - `Ctrl+C` - Exit the game

### Gameplay

1. The ball starts in the center of the court
2. Use your paddle to hit the ball back and forth
3. Score a point when your opponent misses the ball
4. The ball speeds up slightly with each paddle hit
5. The ball's angle changes based on where it hits your paddle
6. **First player to reach 5 points wins!**

### Tips

- Hit the ball with the edges of your paddle to create sharper angles
- The ball speeds up over time, so stay alert!
- Try to predict where the ball will bounce off the walls

## 🎯 Game Mechanics

- **Court Size:** 60x20 characters
- **Paddle Height:** 4 characters
- **Ball Speed:** Starts at 1, increases by 5% with each paddle hit (capped at 2.5)
- **Paddle Speed:** 2 units per keypress
- **Winning Score:** First to 5 points

## 🛠️ Technical Details

- Built with Node.js and the `readline` module
- Uses ANSI escape codes for terminal graphics and colors
- Real-time input handling with raw mode
- Smooth game loop running at ~20 FPS

## 🎨 Visual Elements

- **Cyan borders** - Court boundaries and center line
- **Green paddles** - Player-controlled paddles
- **White ball** - The game ball
- **Yellow score** - Current game score

## 📝 Notes

- The game requires a terminal that supports ANSI escape codes
- Works best in a terminal window that's at least 62 characters wide and 25 characters tall
- The cursor is hidden during gameplay for a cleaner experience

## 🎉 Enjoy!

Have fun playing Terminal Table Tennis! Challenge your friends and see who's the ultimate paddle master! 🏓

