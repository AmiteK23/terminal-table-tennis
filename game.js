const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ==================== GAME CONFIGURATION ====================
const CONFIG = {
  WIDTH: 60,
  HEIGHT: 20,
  BASE_PADDLE_HEIGHT: 4,
  BASE_BALL_SPEED: 1,
  PADDLE_SPEED: 2,
  WIN_SCORE: 5,
  FPS: 30,
  STATS_FILE: 'game_stats.json'
};

// ==================== ENHANCED COLORS ====================
const colors = {
  reset: '\x1B[0m',
  black: '\x1B[30m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  bright: '\x1B[1m',
  dim: '\x1B[2m',
  bgRed: '\x1B[41m',
  bgGreen: '\x1B[42m',
  bgYellow: '\x1B[43m',
  bgBlue: '\x1B[44m',
  bgMagenta: '\x1B[45m',
  bgCyan: '\x1B[46m'
};

// ==================== GAME STATE ====================
let gameState = {
  mode: 'menu', // 'menu', 'playing', 'paused', 'gameOver', 'stats'
  gameMode: 'twoPlayer', // 'twoPlayer', 'vsAI'
  aiDifficulty: 'medium', // 'easy', 'medium', 'hard', 'impossible'
  ball: { x: CONFIG.WIDTH / 2, y: CONFIG.HEIGHT / 2, vx: CONFIG.BASE_BALL_SPEED, vy: CONFIG.BASE_BALL_SPEED },
  leftPaddle: { y: CONFIG.HEIGHT / 2 - CONFIG.BASE_PADDLE_HEIGHT / 2, height: CONFIG.BASE_PADDLE_HEIGHT, powerUp: null },
  rightPaddle: { y: CONFIG.HEIGHT / 2 - CONFIG.BASE_PADDLE_HEIGHT / 2, height: CONFIG.BASE_PADDLE_HEIGHT, powerUp: null },
  score: { left: 0, right: 0 },
  gameRunning: false,
  paused: false,
  particles: [],
  powerUps: [],
  rallyCount: 0,
  lastHitBy: null,
  frameCount: 0,
  ballTrail: [],
  menuSelection: 0,
  stats: loadStats()
};

// ==================== STATISTICS SYSTEM ====================
function loadStats() {
  try {
    if (fs.existsSync(CONFIG.STATS_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.STATS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    gamesPlayed: 0,
    wins: { left: 0, right: 0 },
    longestRally: 0,
    totalRallies: 0,
    averageRally: 0,
    powerUpsCollected: 0,
    games: []
  };
}

function saveStats() {
  try {
    fs.writeFileSync(CONFIG.STATS_FILE, JSON.stringify(gameState.stats, null, 2));
  } catch (e) {}
}

function updateStats() {
  if (gameState.rallyCount > gameState.stats.longestRally) {
    gameState.stats.longestRally = gameState.rallyCount;
  }
  gameState.stats.totalRallies += gameState.rallyCount;
  gameState.stats.averageRally = Math.round(gameState.stats.totalRallies / gameState.stats.gamesPlayed);
}

// ==================== ANSI UTILITIES ====================
const clear = () => process.stdout.write('\x1B[2J\x1B[H');
const moveCursor = (x, y) => process.stdout.write(`\x1B[${y + 1};${x + 1}H`);
const hideCursor = () => process.stdout.write('\x1B[?25l');
const showCursor = () => process.stdout.write('\x1B[?25h');
const beep = () => process.stdout.write('\x07');

// ==================== FRAME BUFFER SYSTEM ====================
// This eliminates blinking by building frames in memory before outputting
let frameBuffer = [];
let lastMode = null;

function initFrameBuffer() {
  frameBuffer = [];
  for (let y = 0; y < CONFIG.HEIGHT + 10; y++) {
    frameBuffer[y] = [];
    for (let x = 0; x < CONFIG.WIDTH + 10; x++) {
      frameBuffer[y][x] = { char: ' ', color: colors.reset };
    }
  }
}

function setPixel(x, y, char, color = colors.reset) {
  const row = Math.floor(y);
  const col = Math.floor(x);
  if (row >= 0 && row < frameBuffer.length && col >= 0 && col < frameBuffer[0].length) {
    frameBuffer[row][col] = { char, color };
  }
}

function flushFrame() {
  // Only clear screen when mode changes
  if (lastMode !== gameState.mode) {
    clear();
    lastMode = gameState.mode;
  } else {
    // Just move cursor to top-left instead of clearing
    moveCursor(0, 0);
  }
  
  // Build output string efficiently with color optimization
  let output = '';
  let lastColor = colors.reset;
  
  for (let y = 0; y < frameBuffer.length; y++) {
    for (let x = 0; x < frameBuffer[y].length; x++) {
      const pixel = frameBuffer[y][x];
      if (pixel.color !== lastColor) {
        output += colors.reset + pixel.color;
        lastColor = pixel.color;
      }
      output += pixel.char;
    }
    if (y < frameBuffer.length - 1) {
      output += '\n';
    }
  }
  output += colors.reset;
  
  // Output entire frame at once
  process.stdout.write(output);
  
  // Reset buffer
  initFrameBuffer();
}

// ==================== PARTICLE SYSTEM ====================
class Particle {
  constructor(x, y, vx, vy, life, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.life--;
    return this.life > 0;
  }

  draw() {
    const alpha = Math.floor((this.life / this.maxLife) * 5);
    const chars = ['█', '▓', '▒', '░', '·'];
    setPixel(Math.floor(this.x), Math.floor(this.y) + 1, chars[alpha], this.color);
  }
}

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 0.5 + Math.random() * 1;
    gameState.particles.push(new Particle(
      x, y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      10 + Math.random() * 10,
      color
    ));
  }
}

// ==================== POWER-UP SYSTEM ====================
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'speed', 'size', 'slow', 'multiBall'
    this.life = 300; // frames
    this.pulse = 0;
  }

  update() {
    this.pulse += 0.2;
    this.life--;
    return this.life > 0;
  }

  draw() {
    const chars = {
      speed: '⚡',
      size: '⬆',
      slow: '🐌',
      multiBall: '⭐'
    };
    const pulse = Math.sin(this.pulse) * 0.3 + 0.7;
    setPixel(Math.floor(this.x), Math.floor(this.y) + 1, chars[this.type], colors.bright + colors.yellow);
  }
}

function spawnPowerUp() {
  if (Math.random() < 0.3 && gameState.powerUps.length === 0) {
    const x = CONFIG.WIDTH / 2 + (Math.random() - 0.5) * 20;
    const y = CONFIG.HEIGHT / 2 + (Math.random() - 0.5) * 10;
    const types = ['speed', 'size', 'slow'];
    gameState.powerUps.push(new PowerUp(x, y, types[Math.floor(Math.random() * types.length)]));
  }
}

function applyPowerUp(paddle, powerUp) {
  paddle.powerUp = powerUp.type;
  gameState.stats.powerUpsCollected++;
  
  switch (powerUp.type) {
    case 'speed':
      // Paddle moves faster temporarily
      break;
    case 'size':
      paddle.height = CONFIG.BASE_PADDLE_HEIGHT + 2;
      setTimeout(() => {
        paddle.height = CONFIG.BASE_PADDLE_HEIGHT;
        paddle.powerUp = null;
      }, 5000);
      break;
    case 'slow':
      // Ball slows down temporarily
      gameState.ball.vx *= 0.7;
      gameState.ball.vy *= 0.7;
      setTimeout(() => {
        gameState.ball.vx /= 0.7;
        gameState.ball.vy /= 0.7;
      }, 3000);
      break;
  }
}

// ==================== AI SYSTEM ====================
function updateAI() {
  if (gameState.gameMode !== 'vsAI') return;
  
  const paddle = gameState.rightPaddle;
  const ball = gameState.ball;
  const centerY = paddle.y + paddle.height / 2;
  const targetY = ball.y;
  
  let reactionSpeed = 0;
  let accuracy = 0;
  
  switch (gameState.aiDifficulty) {
    case 'easy':
      reactionSpeed = 0.08;
      accuracy = 0.3;
      break;
    case 'medium':
      reactionSpeed = 0.2;
      accuracy = 0.45;
      break;
    case 'hard':
      reactionSpeed = 0.5;
      accuracy = 0.7;
      break;
    case 'impossible':
      reactionSpeed = 0.7;
      accuracy = 0.85;
      break;
  }
  
  // Predict ball position
  let predictedY = targetY;
  if (ball.vx > 0) { // Ball coming towards AI
    const timeToReach = (CONFIG.WIDTH - ball.x) / Math.abs(ball.vx);
    predictedY = ball.y + ball.vy * timeToReach;
    
    // Bounce prediction
    while (predictedY < 0 || predictedY >= CONFIG.HEIGHT) {
      if (predictedY < 0) predictedY = -predictedY;
      if (predictedY >= CONFIG.HEIGHT) predictedY = 2 * CONFIG.HEIGHT - predictedY;
    }
  }
  
  // Add imperfection
  predictedY += (Math.random() - 0.5) * (1 - accuracy) * 3;
  
  const diff = predictedY - centerY;
  const speed = CONFIG.PADDLE_SPEED * reactionSpeed;
  
  if (Math.abs(diff) > 0.5) {
    if (diff > 0) {
      paddle.y = Math.min(CONFIG.HEIGHT - paddle.height, paddle.y + speed);
    } else {
      paddle.y = Math.max(0, paddle.y - speed);
    }
  }
}

// ==================== IMPROVED PHYSICS ====================
function updateBall() {
  // Add ball trail
  gameState.ballTrail.push({ x: gameState.ball.x, y: gameState.ball.y });
  if (gameState.ballTrail.length > 5) gameState.ballTrail.shift();
  
  // Move ball
  gameState.ball.x += gameState.ball.vx;
  gameState.ball.y += gameState.ball.vy;
  
  // Wall collision with better physics
  if (gameState.ball.y <= 0) {
    gameState.ball.vy = Math.abs(gameState.ball.vy);
    gameState.ball.y = 0;
  } else if (gameState.ball.y >= CONFIG.HEIGHT - 1) {
    gameState.ball.vy = -Math.abs(gameState.ball.vy);
    gameState.ball.y = CONFIG.HEIGHT - 1;
  }
  
  // Enhanced paddle collision
  const checkPaddleCollision = (paddle, isLeft) => {
    const paddleX = isLeft ? 1 : CONFIG.WIDTH - 1;
    const ballRadius = 0.5;
    
    if (Math.abs(gameState.ball.x - paddleX) < 1.5) {
      const paddleTop = paddle.y;
      const paddleBottom = paddle.y + paddle.height;
      
      if (gameState.ball.y >= paddleTop - ballRadius && gameState.ball.y <= paddleBottom + ballRadius) {
        // Hit!
        const hitPos = (gameState.ball.y - paddle.y) / paddle.height;
        const angle = (hitPos - 0.5) * 2; // -1 to 1
        
        gameState.ball.vx = (isLeft ? 1 : -1) * Math.abs(gameState.ball.vx) * 1.08;
        gameState.ball.vy = angle * 3;
        gameState.ball.x = paddleX + (isLeft ? 1 : -1) * 0.5;
        
        // Visual feedback
        beep();
        
        // Rally tracking
        gameState.rallyCount++;
        gameState.lastHitBy = isLeft ? 'left' : 'right';
        
        // Power-up collision
        gameState.powerUps = gameState.powerUps.filter(pu => {
          if (Math.abs(pu.x - gameState.ball.x) < 2 && Math.abs(pu.y - gameState.ball.y) < 2) {
            applyPowerUp(paddle, pu);
            createParticles(pu.x, pu.y, 15, colors.yellow);
            return false;
          }
          return true;
        });
        
        return true;
      }
    }
    return false;
  };
  
  checkPaddleCollision(gameState.leftPaddle, true);
  checkPaddleCollision(gameState.rightPaddle, false);
  
  // Scoring
  if (gameState.ball.x <= 0) {
    gameState.score.right++;
    updateStats();
    resetBall(-1);
    createParticles(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 20, colors.red);
  } else if (gameState.ball.x >= CONFIG.WIDTH) {
    gameState.score.left++;
    updateStats();
    resetBall(1);
    createParticles(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 20, colors.blue);
  }
  
  // Speed cap
  gameState.ball.vx = Math.sign(gameState.ball.vx) * Math.min(Math.abs(gameState.ball.vx), 3.5);
  gameState.ball.vy = Math.sign(gameState.ball.vy) * Math.min(Math.abs(gameState.ball.vy), 3);
}

function resetBall(direction) {
  gameState.ball.x = CONFIG.WIDTH / 2;
  gameState.ball.y = CONFIG.HEIGHT / 2;
  gameState.ball.vx = CONFIG.BASE_BALL_SPEED * direction;
  gameState.ball.vy = (Math.random() - 0.5) * 2;
  gameState.rallyCount = 0;
  gameState.ballTrail = [];
  gameState.powerUps = [];
}

// ==================== DRAWING FUNCTIONS ====================
function drawGame() {
  // Draw border with gradient effect
  for (let x = 0; x < CONFIG.WIDTH + 2; x++) {
    setPixel(x, 0, '═', colors.cyan);
    setPixel(x, CONFIG.HEIGHT + 1, '═', colors.cyan);
  }
  
  // Animated center line
  for (let y = 1; y <= CONFIG.HEIGHT; y++) {
    const pattern = (gameState.frameCount + y) % 4 < 2 ? '│' : ' ';
    setPixel(CONFIG.WIDTH / 2, y, pattern, colors.dim + colors.cyan);
  }
  
  // Enhanced score display
  const leftScore = String(gameState.score.left);
  const rightScore = String(gameState.score.right);
  const separator = ' │ ';
  
  // Draw left score
  for (let i = 0; i < leftScore.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 12 + i, 0, leftScore[i], colors.bright + colors.yellow);
  }
  // Draw separator
  for (let i = 0; i < separator.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 12 + leftScore.length + i, 0, separator[i], colors.cyan);
  }
  // Draw right score
  for (let i = 0; i < rightScore.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 12 + leftScore.length + separator.length + i, 0, rightScore[i], colors.bright + colors.yellow);
  }
  
  // Rally counter
  if (gameState.rallyCount > 0) {
    const rallyText = `Rally: ${gameState.rallyCount}`;
    for (let i = 0; i < rallyText.length; i++) {
      setPixel(CONFIG.WIDTH / 2 - 5 + i, CONFIG.HEIGHT + 2, rallyText[i], colors.magenta);
    }
  }
  
  // Draw ball trail
  gameState.ballTrail.forEach((point, i) => {
    const alpha = i / gameState.ballTrail.length;
    const chars = ['·', '○', '◉', '●'];
    const char = chars[Math.floor(alpha * chars.length)];
    setPixel(Math.floor(point.x), Math.floor(point.y) + 1, char, colors.dim + colors.white);
  });
  
  // Draw ball with glow effect
  const speed = Math.abs(gameState.ball.vx) + Math.abs(gameState.ball.vy);
  const ballColor = speed > 2 ? colors.red : speed > 1.5 ? colors.yellow : colors.white;
  setPixel(Math.floor(gameState.ball.x), Math.floor(gameState.ball.y) + 1, '●', colors.bright + ballColor);
  
  // Draw paddles with power-up effects
  const drawPaddle = (paddle, x, isLeft) => {
    const paddleColor = paddle.powerUp ? colors.yellow : colors.green;
    for (let i = 0; i < paddle.height; i++) {
      setPixel(x, Math.floor(paddle.y) + i + 1, '█', colors.bright + paddleColor);
    }
    if (paddle.powerUp) {
      setPixel(x + (isLeft ? 1 : -1), Math.floor(paddle.y + paddle.height / 2) + 1, '⚡', colors.bright + colors.yellow);
    }
  };
  
  drawPaddle(gameState.leftPaddle, 1, true);
  drawPaddle(gameState.rightPaddle, CONFIG.WIDTH, false);
  
  // Draw power-ups
  gameState.powerUps.forEach(pu => pu.draw());
  
  // Draw particles
  gameState.particles.forEach(p => p.draw());
  
  // Draw instructions
  const modeText = gameState.gameMode === 'vsAI' ? `AI: ${gameState.aiDifficulty.toUpperCase()}` : '2-Player';
  const instruction1 = `Mode: ${modeText} | W/S = Left | ↑/↓ = Right | P = Pause | Q = Quit`;
  for (let i = 0; i < instruction1.length; i++) {
    setPixel(i, CONFIG.HEIGHT + 3, instruction1[i], colors.cyan);
  }
  const instruction2 = `First to ${CONFIG.WIN_SCORE} wins!`;
  for (let i = 0; i < instruction2.length; i++) {
    setPixel(i, CONFIG.HEIGHT + 4, instruction2[i], colors.cyan);
  }
}

function drawMenu() {
  const title = [
    '╔═══════════════════════════════════════════════════════╗',
    '║                                                       ║',
    '║     🏓 TERMINAL TABLE TENNIS ULTRA 🏓      ║',
    '║                                                       ║',
    '╚═══════════════════════════════════════════════════════╝'
  ];
  
  // Draw title
  title.forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
      let color = colors.bright + colors.cyan;
      if (i === 2 && j >= 5 && j <= 45) {
        color = colors.yellow;
      }
      setPixel(10 + j, 2 + i, line[j], color);
    }
  });
  
  const menuItems = [
    '🎮 Two Player',
    '🤖 VS AI (Easy)',
    '🤖 VS AI (Medium)',
    '🤖 VS AI (Hard)',
    '🤖 VS AI (Impossible)',
    '📊 Statistics',
    '❌ Quit'
  ];
  
  menuItems.forEach((text, i) => {
    const selected = i === gameState.menuSelection;
    const prefix = selected ? '▶ ' : '  ';
    const color = selected ? colors.bright + colors.yellow : colors.white;
    
    // Draw prefix
    for (let j = 0; j < prefix.length; j++) {
      setPixel(20 + j, 8 + i, prefix[j], selected ? colors.bright + colors.green : colors.reset);
    }
    // Draw menu text
    for (let j = 0; j < text.length; j++) {
      setPixel(20 + prefix.length + j, 8 + i, text[j], color);
    }
  });
  
  const hint = 'Use ↑/↓ to navigate, ENTER to select';
  for (let i = 0; i < hint.length; i++) {
    setPixel(i, 20, hint[i], colors.dim + colors.cyan);
  }
}

function drawPause() {
  const pauseText = '⏸ PAUSED';
  for (let i = 0; i < pauseText.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 5 + i, CONFIG.HEIGHT / 2, pauseText[i], colors.bright + colors.yellow);
  }
  const resumeText = 'Press P to resume';
  for (let i = 0; i < resumeText.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 8 + i, CONFIG.HEIGHT / 2 + 2, resumeText[i], colors.cyan);
  }
}

function drawGameOver() {
  const winner = gameState.score.left >= CONFIG.WIN_SCORE ? 'LEFT PLAYER' : 'RIGHT PLAYER';
  const winnerColor = gameState.score.left >= CONFIG.WIN_SCORE ? colors.blue : colors.red;
  
  const winText = `🏆 ${winner} WINS! 🏆`;
  for (let i = 0; i < winText.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 12 + i, CONFIG.HEIGHT / 2 - 2, winText[i], colors.bright + winnerColor);
  }
  
  const scoreText = `Final Score: ${gameState.score.left} - ${gameState.score.right}`;
  for (let i = 0; i < scoreText.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 10 + i, CONFIG.HEIGHT / 2, scoreText[i], colors.cyan);
  }
  
  if (gameState.stats.longestRally > 0) {
    const rallyText = `Longest Rally: ${gameState.stats.longestRally}`;
    for (let i = 0; i < rallyText.length; i++) {
      setPixel(CONFIG.WIDTH / 2 - 12 + i, CONFIG.HEIGHT / 2 + 2, rallyText[i], colors.magenta);
    }
  }
  
  const menuText = 'Press ENTER for menu';
  for (let i = 0; i < menuText.length; i++) {
    setPixel(CONFIG.WIDTH / 2 - 10 + i, CONFIG.HEIGHT / 2 + 4, menuText[i], colors.white);
  }
}

function showStats() {
  const stats = gameState.stats;
  
  const title = '📊 GAME STATISTICS 📊';
  for (let i = 0; i < title.length; i++) {
    setPixel(20 + i, 2, title[i], colors.bright + colors.yellow);
  }
  
  const statLines = [
    `Games Played: ${stats.gamesPlayed}`,
    `Left Player Wins: ${stats.wins.left}`,
    `Right Player Wins: ${stats.wins.right}`,
    `Longest Rally: ${stats.longestRally}`,
    `Average Rally: ${stats.averageRally}`,
    `Power-ups Collected: ${stats.powerUpsCollected}`
  ];
  
  statLines.forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
      const isValue = j > line.indexOf(':') + 1;
      const color = isValue ? colors.white : colors.cyan;
      setPixel(15 + j, 5 + i, line[j], color);
    }
  });
  
  const hint = 'Press any key to return to menu';
  for (let i = 0; i < hint.length; i++) {
    setPixel(15 + i, 15, hint[i], colors.dim);
  }
  
  gameState.mode = 'stats';
}

// ==================== GAME LOGIC ====================
function update() {
  if (!gameState.gameRunning || gameState.paused) return;
  
  gameState.frameCount++;
  
  // Update AI
  updateAI();
  
  // Update ball
  updateBall();
  
  // Update particles
  gameState.particles = gameState.particles.filter(p => p.update());
  
  // Update power-ups
  gameState.powerUps = gameState.powerUps.filter(pu => pu.update());
  
  // Spawn power-ups occasionally
  if (gameState.frameCount % 300 === 0) {
    spawnPowerUp();
  }
  
  // Check for winner
  if (gameState.score.left >= CONFIG.WIN_SCORE || gameState.score.right >= CONFIG.WIN_SCORE) {
    gameState.gameRunning = false;
    gameState.mode = 'gameOver';
    gameState.stats.gamesPlayed++;
    if (gameState.score.left >= CONFIG.WIN_SCORE) {
      gameState.stats.wins.left++;
    } else {
      gameState.stats.wins.right++;
    }
    saveStats();
  }
}

function startGame(mode, aiDifficulty = 'medium') {
  gameState.gameMode = mode;
  gameState.aiDifficulty = aiDifficulty;
  gameState.score = { left: 0, right: 0 };
  gameState.gameRunning = true;
  gameState.paused = false;
  gameState.mode = 'playing';
  gameState.particles = [];
  gameState.powerUps = [];
  gameState.rallyCount = 0;
  gameState.frameCount = 0;
  gameState.ballTrail = [];
  gameState.leftPaddle.y = CONFIG.HEIGHT / 2 - CONFIG.BASE_PADDLE_HEIGHT / 2;
  gameState.rightPaddle.y = CONFIG.HEIGHT / 2 - CONFIG.BASE_PADDLE_HEIGHT / 2;
  gameState.leftPaddle.height = CONFIG.BASE_PADDLE_HEIGHT;
  gameState.rightPaddle.height = CONFIG.BASE_PADDLE_HEIGHT;
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

// ==================== INPUT HANDLING ====================
function setupInput() {
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  
  process.stdin.on('keypress', (str, key) => {
    if (gameState.mode === 'menu') {
      if (key.name === 'up') {
        gameState.menuSelection = Math.max(0, gameState.menuSelection - 1);
        drawMenu();
      } else if (key.name === 'down') {
        gameState.menuSelection = Math.min(6, gameState.menuSelection + 1);
        drawMenu();
      } else if (key.name === 'return') {
        const menuItems = [
          () => startGame('twoPlayer'),
          () => startGame('vsAI', 'easy'),
          () => startGame('vsAI', 'medium'),
          () => startGame('vsAI', 'hard'),
          () => startGame('vsAI', 'impossible'),
          () => showStats(),
          () => cleanup()
        ];
        menuItems[gameState.menuSelection]();
      } else if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        cleanup();
        process.exit(0);
      }
      return;
    }
    
    if (gameState.mode === 'stats') {
      gameState.mode = 'menu';
      drawMenu();
      return;
    }
    
    if (gameState.mode === 'gameOver') {
      if (key.name === 'return') {
        gameState.mode = 'menu';
        gameState.menuSelection = 0;
        drawMenu();
      } else if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        cleanup();
        process.exit(0);
      }
      return;
    }
    
    if (!gameState.gameRunning) {
      cleanup();
      process.exit(0);
    }
    
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      cleanup();
      process.exit(0);
    }
    
    if (key.name === 'p') {
      gameState.paused = !gameState.paused;
      return;
    }
    
    if (gameState.paused) return;
    
    // Left paddle controls
    if (key.name === 'w') {
      const speed = gameState.leftPaddle.powerUp === 'speed' ? CONFIG.PADDLE_SPEED * 1.5 : CONFIG.PADDLE_SPEED;
      gameState.leftPaddle.y = Math.max(0, gameState.leftPaddle.y - speed);
    }
    if (key.name === 's') {
      const speed = gameState.leftPaddle.powerUp === 'speed' ? CONFIG.PADDLE_SPEED * 1.5 : CONFIG.PADDLE_SPEED;
      gameState.leftPaddle.y = Math.min(CONFIG.HEIGHT - gameState.leftPaddle.height, gameState.leftPaddle.y + speed);
    }
    
    // Right paddle controls (only if not AI)
    if (gameState.gameMode === 'twoPlayer') {
      if (key.name === 'up') {
        const speed = gameState.rightPaddle.powerUp === 'speed' ? CONFIG.PADDLE_SPEED * 1.5 : CONFIG.PADDLE_SPEED;
        gameState.rightPaddle.y = Math.max(0, gameState.rightPaddle.y - speed);
      }
      if (key.name === 'down') {
        const speed = gameState.rightPaddle.powerUp === 'speed' ? CONFIG.PADDLE_SPEED * 1.5 : CONFIG.PADDLE_SPEED;
        gameState.rightPaddle.y = Math.min(CONFIG.HEIGHT - gameState.rightPaddle.height, gameState.rightPaddle.y + speed);
      }
    }
  });
}

// ==================== MAIN GAME LOOP ====================
function gameLoop() {
  update();
  
  // Initialize frame buffer
  initFrameBuffer();
  
  // Draw current screen
  if (gameState.mode === 'menu') {
    drawMenu();
  } else if (gameState.mode === 'playing') {
    drawGame();
    if (gameState.paused) {
      drawPause();
    }
  } else if (gameState.mode === 'gameOver') {
    drawGameOver();
  } else if (gameState.mode === 'stats') {
    showStats();
  }
  
  // Flush frame buffer (outputs everything at once)
  flushFrame();
  
  setTimeout(gameLoop, 1000 / CONFIG.FPS);
}

// ==================== INITIALIZATION ====================
function cleanup() {
  showCursor();
  clear();
  saveStats();
  process.stdout.write(`${colors.bright}${colors.cyan}Thanks for playing Terminal Table Tennis Ultra! 🏓\n${colors.reset}`);
}

console.log(`${colors.bright}${colors.cyan}Loading Terminal Table Tennis Ultra...${colors.reset}`);
hideCursor();
initFrameBuffer();
setupInput();
setTimeout(() => {
  drawMenu();
  gameLoop();
}, 100);

process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});
