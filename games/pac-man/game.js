// Game Configuration
const CONFIG = {
    tileSize: 20,
    gridWidth: 19,
    gridHeight: 21,
    pacmanSpeed: 3,
    ghostSpeed: 2,
    dotScore: 10,
    powerPelletScore: 50,
    ghostScore: 200,
    initialLives: 3,
    powerUpDuration: 5000
};

// Maze Layout (0 = wall, 1 = dot, 2 = power pellet, 3 = empty)
const MAZE = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,2,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,2,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
    [3,3,3,0,1,0,1,1,1,1,1,1,1,0,1,0,3,3,3],
    [0,0,0,0,1,0,1,0,0,3,0,0,1,0,1,0,0,0,0],
    [3,3,3,3,1,1,1,0,3,3,3,0,1,1,1,3,3,3,3],
    [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0],
    [3,3,3,0,1,0,1,1,1,1,1,1,1,0,1,0,3,3,3],
    [0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
    [0,2,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,2,0],
    [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
    [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
    [0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

// Game State
let canvas, ctx;
let gameState = 'ready'; // ready, playing, paused, gameover, won
let score = 0;
let highScore = 0;
let lives = CONFIG.initialLives;
let pacman;
let ghosts = [];
let dots = [];
let powerPellets = [];
let frameCount = 0;
let animationId;
let isPoweredUp = false;
let powerUpTimer = null;

// Direction vectors
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// Pac-Man Class
class PacMan {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * CONFIG.tileSize;
        this.y = y * CONFIG.tileSize;
        this.direction = DIRECTIONS.NONE;
        this.nextDirection = DIRECTIONS.NONE;
        this.speed = CONFIG.pacmanSpeed;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15;
    }

    update() {
        // Try to turn if next direction is set
        if (this.nextDirection !== DIRECTIONS.NONE) {
            const nextGridX = this.gridX + this.nextDirection.x;
            const nextGridY = this.gridY + this.nextDirection.y;

            if (this.canMove(nextGridX, nextGridY)) {
                this.direction = this.nextDirection;
            }
        }

        // Move in current direction
        const targetX = this.x + this.direction.x * this.speed;
        const targetY = this.y + this.direction.y * this.speed;

        const nextGridX = Math.round(targetX / CONFIG.tileSize);
        const nextGridY = Math.round(targetY / CONFIG.tileSize);

        if (this.canMove(nextGridX, nextGridY)) {
            this.x = targetX;
            this.y = targetY;
            this.gridX = Math.round(this.x / CONFIG.tileSize);
            this.gridY = Math.round(this.y / CONFIG.tileSize);
        } else {
            // Snap to grid if blocked
            this.x = this.gridX * CONFIG.tileSize;
            this.y = this.gridY * CONFIG.tileSize;
            this.direction = DIRECTIONS.NONE;
        }

        // Animate mouth
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 1 || this.mouthOpen < 0) {
            this.mouthSpeed *= -1;
        }

        // Collect dots and power pellets
        this.collectItems();
    }

    canMove(gridX, gridY) {
        if (gridX < 0 || gridX >= CONFIG.gridWidth || gridY < 0 || gridY >= CONFIG.gridHeight) {
            return false;
        }
        return MAZE[gridY][gridX] !== 0;
    }

    collectItems() {
        // Check dots
        for (let i = dots.length - 1; i >= 0; i--) {
            const dot = dots[i];
            if (dot.gridX === this.gridX && dot.gridY === this.gridY) {
                dots.splice(i, 1);
                score += CONFIG.dotScore;
                updateScore();

                // Check win condition
                if (dots.length === 0 && powerPellets.length === 0) {
                    winGame();
                }
            }
        }

        // Check power pellets
        for (let i = powerPellets.length - 1; i >= 0; i--) {
            const pellet = powerPellets[i];
            if (pellet.gridX === this.gridX && pellet.gridY === this.gridY) {
                powerPellets.splice(i, 1);
                score += CONFIG.powerPelletScore;
                updateScore();
                activatePowerUp();

                // Check win condition
                if (dots.length === 0 && powerPellets.length === 0) {
                    winGame();
                }
            }
        }
    }

    draw() {
        const centerX = this.x + CONFIG.tileSize / 2;
        const centerY = this.y + CONFIG.tileSize / 2;
        const radius = CONFIG.tileSize / 2 - 2;

        // Determine mouth direction
        let startAngle = 0.2;
        let endAngle = 2 * Math.PI - 0.2;
        const mouthAngle = this.mouthOpen * 0.3;

        if (this.direction === DIRECTIONS.RIGHT) {
            startAngle = mouthAngle;
            endAngle = 2 * Math.PI - mouthAngle;
        } else if (this.direction === DIRECTIONS.LEFT) {
            startAngle = Math.PI - mouthAngle;
            endAngle = Math.PI + mouthAngle;
        } else if (this.direction === DIRECTIONS.UP) {
            startAngle = Math.PI * 1.5 - mouthAngle;
            endAngle = Math.PI * 1.5 + mouthAngle;
        } else if (this.direction === DIRECTIONS.DOWN) {
            startAngle = Math.PI * 0.5 - mouthAngle;
            endAngle = Math.PI * 0.5 + mouthAngle;
        }

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        const eyeX = centerX + (this.direction === DIRECTIONS.LEFT ? -3 : 3);
        const eyeY = centerY - 3;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Ghost Class
class Ghost {
    constructor(x, y, color, name) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * CONFIG.tileSize;
        this.y = y * CONFIG.tileSize;
        this.color = color;
        this.name = name;
        this.direction = this.getRandomDirection();
        this.speed = CONFIG.ghostSpeed;
        this.moveCounter = 0;
        this.scaredMode = false;
    }

    update() {
        this.moveCounter++;

        // Change direction occasionally
        if (this.moveCounter % 30 === 0) {
            if (Math.random() < 0.3) {
                this.direction = this.getRandomDirection();
            } else {
                // Chase pac-man
                this.chasePlayer();
            }
        }

        // Move
        const targetX = this.x + this.direction.x * this.speed;
        const targetY = this.y + this.direction.y * this.speed;

        const nextGridX = Math.round(targetX / CONFIG.tileSize);
        const nextGridY = Math.round(targetY / CONFIG.tileSize);

        if (this.canMove(nextGridX, nextGridY)) {
            this.x = targetX;
            this.y = targetY;
            this.gridX = Math.round(this.x / CONFIG.tileSize);
            this.gridY = Math.round(this.y / CONFIG.tileSize);
        } else {
            // If blocked, choose new direction
            this.direction = this.getRandomDirection();
            this.x = this.gridX * CONFIG.tileSize;
            this.y = this.gridY * CONFIG.tileSize;
        }

        // Check collision with pac-man
        this.checkCollision();
    }

    canMove(gridX, gridY) {
        if (gridX < 0 || gridX >= CONFIG.gridWidth || gridY < 0 || gridY >= CONFIG.gridHeight) {
            return false;
        }
        return MAZE[gridY][gridX] !== 0;
    }

    getRandomDirection() {
        const directions = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    chasePlayer() {
        if (!pacman) return;

        const dx = pacman.gridX - this.gridX;
        const dy = pacman.gridY - this.gridY;

        if (isPoweredUp) {
            // Run away when powered up
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
            } else {
                this.direction = dy > 0 ? DIRECTIONS.UP : DIRECTIONS.DOWN;
            }
        } else {
            // Chase pac-man
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            } else {
                this.direction = dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            }
        }
    }

    checkCollision() {
        const distance = Math.sqrt(
            Math.pow(this.gridX - pacman.gridX, 2) +
            Math.pow(this.gridY - pacman.gridY, 2)
        );

        if (distance < 0.5) {
            if (isPoweredUp) {
                // Eat ghost
                score += CONFIG.ghostScore;
                updateScore();
                this.reset();
            } else {
                // Lose life
                loseLife();
            }
        }
    }

    reset() {
        this.gridX = 9;
        this.gridY = 10;
        this.x = this.gridX * CONFIG.tileSize;
        this.y = this.gridY * CONFIG.tileSize;
        this.direction = this.getRandomDirection();
    }

    draw() {
        const centerX = this.x + CONFIG.tileSize / 2;
        const centerY = this.y + CONFIG.tileSize / 2;
        const radius = CONFIG.tileSize / 2 - 2;

        // Body color
        ctx.fillStyle = isPoweredUp ? '#0000FF' : this.color;

        // Body (circle top, wavy bottom)
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);

        // Wavy bottom
        const waveOffset = Math.sin(frameCount * 0.2) * 2;
        ctx.lineTo(centerX + radius, centerY + radius);
        ctx.lineTo(centerX + radius - 4, centerY + radius - 4 + waveOffset);
        ctx.lineTo(centerX + 2, centerY + radius);
        ctx.lineTo(centerX - 2, centerY + radius - 4 - waveOffset);
        ctx.lineTo(centerX - radius + 4, centerY + radius);
        ctx.lineTo(centerX - radius, centerY + radius - 4 + waveOffset);
        ctx.lineTo(centerX - radius, centerY - 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 2, 3, 0, 2 * Math.PI);
        ctx.arc(centerX + 4, centerY - 2, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Pupils
        ctx.fillStyle = isPoweredUp ? '#FFF' : '#000';
        const pupilOffsetX = this.direction.x * 2;
        const pupilOffsetY = this.direction.y * 2;
        ctx.beginPath();
        ctx.arc(centerX - 4 + pupilOffsetX, centerY - 2 + pupilOffsetY, 1.5, 0, 2 * Math.PI);
        ctx.arc(centerX + 4 + pupilOffsetX, centerY - 2 + pupilOffsetY, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// Dot Class
class Dot {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
    }

    draw() {
        ctx.fillStyle = '#FFB8AE';
        ctx.beginPath();
        ctx.arc(
            this.gridX * CONFIG.tileSize + CONFIG.tileSize / 2,
            this.gridY * CONFIG.tileSize + CONFIG.tileSize / 2,
            2,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

// Power Pellet Class
class PowerPellet {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
    }

    draw() {
        const pulse = Math.sin(frameCount * 0.1) * 2 + 5;
        ctx.fillStyle = '#FFB8AE';
        ctx.beginPath();
        ctx.arc(
            this.gridX * CONFIG.tileSize + CONFIG.tileSize / 2,
            this.gridY * CONFIG.tileSize + CONFIG.tileSize / 2,
            pulse,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

// Initialize Game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = CONFIG.gridWidth * CONFIG.tileSize;
    canvas.height = CONFIG.gridHeight * CONFIG.tileSize;

    // Load high score
    highScore = parseInt(localStorage.getItem('pacmanHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;

    // Initialize game objects
    resetGame();

    // Set up controls
    setupControls();

    // Start game loop
    gameLoop();
}

function resetGame() {
    score = 0;
    lives = CONFIG.initialLives;
    isPoweredUp = false;
    dots = [];
    powerPellets = [];
    ghosts = [];

    // Create Pac-Man
    pacman = new PacMan(9, 15);

    // Create Ghosts
    ghosts.push(new Ghost(7, 9, '#FF0000', 'Blinky'));  // Red
    ghosts.push(new Ghost(9, 9, '#FFB8FF', 'Pinky'));   // Pink
    ghosts.push(new Ghost(11, 9, '#00FFFF', 'Inky'));   // Cyan

    // Create dots and power pellets from maze
    for (let y = 0; y < CONFIG.gridHeight; y++) {
        for (let x = 0; x < CONFIG.gridWidth; x++) {
            if (MAZE[y][x] === 1) {
                dots.push(new Dot(x, y));
            } else if (MAZE[y][x] === 2) {
                powerPellets.push(new PowerPellet(x, y));
            }
        }
    }

    updateScore();
    updateLives();
    hideOverlay();
    gameState = 'playing';
}

function setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing') {
            if (e.key === 'Enter' || e.key === ' ') {
                resetGame();
            }
            return;
        }

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                pacman.nextDirection = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                pacman.nextDirection = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                pacman.nextDirection = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                pacman.nextDirection = DIRECTIONS.RIGHT;
                break;
        }
    });

    // Touch controls
    document.getElementById('btnUp').addEventListener('click', () => {
        if (gameState === 'playing') pacman.nextDirection = DIRECTIONS.UP;
    });
    document.getElementById('btnDown').addEventListener('click', () => {
        if (gameState === 'playing') pacman.nextDirection = DIRECTIONS.DOWN;
    });
    document.getElementById('btnLeft').addEventListener('click', () => {
        if (gameState === 'playing') pacman.nextDirection = DIRECTIONS.LEFT;
    });
    document.getElementById('btnRight').addEventListener('click', () => {
        if (gameState === 'playing') pacman.nextDirection = DIRECTIONS.RIGHT;
    });

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        resetGame();
    });

    // Touch event handlers for buttons
    const buttons = [
        document.getElementById('btnUp'),
        document.getElementById('btnDown'),
        document.getElementById('btnLeft'),
        document.getElementById('btnRight')
    ];

    buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    });
}

function activatePowerUp() {
    isPoweredUp = true;

    if (powerUpTimer) {
        clearTimeout(powerUpTimer);
    }

    powerUpTimer = setTimeout(() => {
        isPoweredUp = false;
    }, CONFIG.powerUpDuration);
}

function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    } else {
        // Reset positions
        pacman.gridX = 9;
        pacman.gridY = 15;
        pacman.x = pacman.gridX * CONFIG.tileSize;
        pacman.y = pacman.gridY * CONFIG.tileSize;
        pacman.direction = DIRECTIONS.NONE;
        pacman.nextDirection = DIRECTIONS.NONE;

        ghosts.forEach(ghost => ghost.reset());

        gameState = 'playing';
    }
}

function gameOver() {
    gameState = 'gameover';

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('pacmanHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    showOverlay('Game Over!', `Your score: ${score}`);
}

function winGame() {
    gameState = 'won';

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('pacmanHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    showOverlay('You Win!', `Perfect! Score: ${score}`);
}

function showOverlay(title, message) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').innerHTML = message;
    document.getElementById('gameOverlay').classList.remove('hidden');
}

function hideOverlay() {
    document.getElementById('gameOverlay').classList.add('hidden');
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

function drawMaze() {
    for (let y = 0; y < CONFIG.gridHeight; y++) {
        for (let x = 0; x < CONFIG.gridWidth; x++) {
            const tile = MAZE[y][x];

            if (tile === 0) {
                // Wall
                ctx.fillStyle = '#1E3A8A';
                ctx.fillRect(
                    x * CONFIG.tileSize,
                    y * CONFIG.tileSize,
                    CONFIG.tileSize,
                    CONFIG.tileSize
                );

                // Wall border for depth
                ctx.strokeStyle = '#3B82F6';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    x * CONFIG.tileSize + 0.5,
                    y * CONFIG.tileSize + 0.5,
                    CONFIG.tileSize - 1,
                    CONFIG.tileSize - 1
                );
            } else {
                // Path
                ctx.fillStyle = '#000';
                ctx.fillRect(
                    x * CONFIG.tileSize,
                    y * CONFIG.tileSize,
                    CONFIG.tileSize,
                    CONFIG.tileSize
                );
            }
        }
    }
}

function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    drawMaze();

    // Draw dots
    dots.forEach(dot => dot.draw());

    // Draw power pellets
    powerPellets.forEach(pellet => pellet.draw());

    // Update and draw game objects
    if (gameState === 'playing') {
        pacman.update();
        ghosts.forEach(ghost => ghost.update());
    }

    pacman.draw();
    ghosts.forEach(ghost => ghost.draw());

    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

// Start game when page loads
window.addEventListener('load', initGame);
