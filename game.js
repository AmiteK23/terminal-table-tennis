const readline = require('readline');

// Game constants
const WIDTH = 60;
const HEIGHT = 20;
const PADDLE_HEIGHT = 4;
const BALL_SPEED = 1;
const PADDLE_SPEED = 2;

// Game state
let ball = { x: WIDTH / 2, y: HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED };
let leftPaddle = { y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
let rightPaddle = { y: HEIGHT / 2 - PADDLE_HEIGHT / 2 };
let score = { left: 0, right: 0 };
let gameRunning = true;

// ANSI escape codes
const clear = () => process.stdout.write('\x1B[2J\x1B[H');
const moveCursor = (x, y) => process.stdout.write(`\x1B[${y + 1};${x + 1}H`);
const hideCursor = () => process.stdout.write('\x1B[?25l');
const showCursor = () => process.stdout.write('\x1B[?25h');

// Colors
const colors = {
  reset: '\x1B[0m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  bright: '\x1B[1m'
};

// Draw the game
function draw() {
  clear();
  
  // Draw border
  for (let x = 0; x < WIDTH + 2; x++) {
    moveCursor(x, 0);
    process.stdout.write(colors.cyan + '═' + colors.reset);
    moveCursor(x, HEIGHT + 1);
    process.stdout.write(colors.cyan + '═' + colors.reset);
  }
  
  // Draw center line
  for (let y = 1; y <= HEIGHT; y++) {
    moveCursor(WIDTH / 2, y);
    process.stdout.write(colors.cyan + (y % 2 === 0 ? '│' : ' ') + colors.reset);
  }
  
  // Draw score
  moveCursor(WIDTH / 2 - 8, 0);
  process.stdout.write(`${colors.bright}${colors.yellow} ${score.left} ${colors.reset}`);
  moveCursor(WIDTH / 2 + 4, 0);
  process.stdout.write(`${colors.bright}${colors.yellow} ${score.right} ${colors.reset}`);
  
  // Draw paddles
  for (let i = 0; i < PADDLE_HEIGHT; i++) {
    moveCursor(1, Math.floor(leftPaddle.y) + i + 1);
    process.stdout.write(colors.green + '█' + colors.reset);
    moveCursor(WIDTH, Math.floor(rightPaddle.y) + i + 1);
    process.stdout.write(colors.green + '█' + colors.reset);
  }
  
  // Draw ball
  moveCursor(Math.floor(ball.x), Math.floor(ball.y) + 1);
  process.stdout.write(colors.bright + colors.white + '●' + colors.reset);
  
  // Draw instructions
  moveCursor(0, HEIGHT + 3);
  process.stdout.write(`${colors.cyan}Controls: W/S = Left Paddle | ↑/↓ = Right Paddle | Q = Quit${colors.reset}`);
  moveCursor(0, HEIGHT + 4);
  process.stdout.write(`${colors.cyan}First to 5 wins!${colors.reset}`);
}

// Update game state
function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;
  
  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y >= HEIGHT - 1) {
    ball.vy = -ball.vy;
    ball.y = Math.max(0, Math.min(HEIGHT - 1, ball.y));
  }
  
  // Ball collision with left paddle
  if (ball.x <= 2 && ball.x >= 1) {
    if (ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + PADDLE_HEIGHT) {
      ball.vx = Math.abs(ball.vx) * 1.05; // Speed up slightly
      ball.x = 2;
      // Add angle based on where ball hits paddle
      const hitPos = (ball.y - leftPaddle.y) / PADDLE_HEIGHT;
      ball.vy = (hitPos - 0.5) * 2;
    }
  }
  
  // Ball collision with right paddle
  if (ball.x >= WIDTH - 2 && ball.x <= WIDTH - 1) {
    if (ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + PADDLE_HEIGHT) {
      ball.vx = -Math.abs(ball.vx) * 1.05; // Speed up slightly
      ball.x = WIDTH - 2;
      // Add angle based on where ball hits paddle
      const hitPos = (ball.y - rightPaddle.y) / PADDLE_HEIGHT;
      ball.vy = (hitPos - 0.5) * 2;
    }
  }
  
  // Scoring
  if (ball.x <= 0) {
    score.right++;
    resetBall(-1);
  } else if (ball.x >= WIDTH) {
    score.left++;
    resetBall(1);
  }
  
  // Check for winner
  if (score.left >= 5 || score.right >= 5) {
    gameOver();
  }
  
  // Cap ball speed
  ball.vx = Math.sign(ball.vx) * Math.min(Math.abs(ball.vx), 2.5);
  ball.vy = Math.sign(ball.vy) * Math.min(Math.abs(ball.vy), 2);
}

function resetBall(direction) {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT / 2;
  ball.vx = BALL_SPEED * direction;
  ball.vy = (Math.random() - 0.5) * 2;
}

function gameOver() {
  gameRunning = false;
  clear();
  moveCursor(WIDTH / 2 - 10, HEIGHT / 2);
  const winner = score.left >= 5 ? 'LEFT PLAYER' : 'RIGHT PLAYER';
  process.stdout.write(`${colors.bright}${colors.yellow}🏆 ${winner} WINS! 🏆${colors.reset}`);
  moveCursor(WIDTH / 2 - 12, HEIGHT / 2 + 2);
  process.stdout.write(`${colors.cyan}Final Score: ${score.left} - ${score.right}${colors.reset}`);
  moveCursor(WIDTH / 2 - 10, HEIGHT / 2 + 4);
  process.stdout.write(`${colors.white}Press any key to exit${colors.reset}`);
  moveCursor(0, HEIGHT + 2);
}

// Input handling
function setupInput() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  
  process.stdin.on('keypress', (str, key) => {
    if (!gameRunning) {
      cleanup();
      process.exit(0);
    }
    
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      cleanup();
      process.exit(0);
    }
    
    // Left paddle (W/S)
    if (key.name === 'w') {
      leftPaddle.y = Math.max(0, leftPaddle.y - PADDLE_SPEED);
    }
    if (key.name === 's') {
      leftPaddle.y = Math.min(HEIGHT - PADDLE_HEIGHT, leftPaddle.y + PADDLE_SPEED);
    }
    
    // Right paddle (Arrow keys)
    if (key.name === 'up') {
      rightPaddle.y = Math.max(0, rightPaddle.y - PADDLE_SPEED);
    }
    if (key.name === 'down') {
      rightPaddle.y = Math.min(HEIGHT - PADDLE_HEIGHT, rightPaddle.y + PADDLE_SPEED);
    }
  });
}

function cleanup() {
  showCursor();
  clear();
  process.stdout.write('Thanks for playing! 🏓\n');
}

// Main game loop
function gameLoop() {
  if (!gameRunning) return;
  
  update();
  draw();
  
  setTimeout(gameLoop, 50); // ~20 FPS
}

// Start the game
console.log('Starting Table Tennis...');
hideCursor();
setupInput();
setTimeout(() => {
  gameLoop();
}, 100);

// Handle cleanup on exit
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});