// Space Invaders Game
class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('game-overlay');
        this.startButton = document.getElementById('start-button');

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.lives = 3;
        this.level = 1;

        // Canvas dimensions
        this.setupCanvas();

        // Game objects
        this.player = null;
        this.aliens = [];
        this.playerBullets = [];
        this.alienBullets = [];
        this.shields = [];

        // Game settings
        this.alienRows = 4;
        this.alienCols = 8;
        this.alienDirection = 1;
        this.alienSpeed = 1;
        this.alienDropDistance = 20;
        this.alienShootChance = 0.002;

        // Touch controls
        this.touchStartX = null;
        this.touchStartY = null;

        // Initialize
        this.setupEventListeners();
        this.updateDisplay();
        this.drawStartScreen();

        // Animation frame
        this.lastTime = 0;
        this.animationId = null;
    }

    setupCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(window.innerHeight * 0.65, containerWidth * 1.2);

        this.canvas.width = Math.min(600, containerWidth - 20);
        this.canvas.height = Math.min(800, containerHeight);

        // Scale factor for responsive sizing
        this.scale = this.canvas.width / 600;
    }

    setupEventListeners() {
        // Start button
        this.startButton.addEventListener('click', () => this.startGame());

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            if (!this.gameRunning) {
                this.drawStartScreen();
            }
        });

        // Keyboard controls
        this.keys = {};
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameRunning) {
                e.preventDefault();
                this.shootPlayerBullet();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // Mouse controls (for desktop)
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (!this.gameRunning) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchStartX = touch.clientX - rect.left;
        this.touchStartY = touch.clientY - rect.top;

        // If touch is in top third of screen, shoot
        if (this.touchStartY < this.canvas.height / 3) {
            this.shootPlayerBullet();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.gameRunning || !this.touchStartX) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;

        // Move player based on touch position
        if (touchX < this.canvas.width / 2) {
            this.player.moveLeft();
        } else {
            this.player.moveRight();
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touchStartX = null;
        this.touchStartY = null;
    }

    handleClick(e) {
        if (!this.gameRunning) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Shoot if clicking top area
        if (y < this.canvas.height / 3) {
            this.shootPlayerBullet();
        }
        // Move left or right based on click position
        else if (x < this.canvas.width / 2) {
            this.player.moveLeft();
        } else {
            this.player.moveRight();
        }
    }

    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.overlay.classList.add('hidden');
        this.initGame();
        this.updateDisplay();
        this.gameLoop();
    }

    initGame() {
        // Create player
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 60, this.canvas.width, this.scale);

        // Create aliens
        this.createAliens();

        // Create shields
        this.createShields();

        // Clear bullets
        this.playerBullets = [];
        this.alienBullets = [];

        // Set alien speed based on level
        this.alienSpeed = 1 + (this.level - 1) * 0.3;
        this.alienShootChance = 0.002 + (this.level - 1) * 0.001;
    }

    createAliens() {
        this.aliens = [];
        const alienWidth = 40 * this.scale;
        const alienHeight = 30 * this.scale;
        const spacingX = 60 * this.scale;
        const spacingY = 50 * this.scale;
        const startX = (this.canvas.width - (this.alienCols * spacingX)) / 2;
        const startY = 80 * this.scale;

        for (let row = 0; row < this.alienRows; row++) {
            for (let col = 0; col < this.alienCols; col++) {
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                const type = row < 1 ? 3 : row < 2 ? 2 : 1; // Different alien types
                this.aliens.push(new Alien(x, y, alienWidth, alienHeight, type));
            }
        }
    }

    createShields() {
        this.shields = [];
        const shieldWidth = 60 * this.scale;
        const shieldHeight = 40 * this.scale;
        const shieldY = this.canvas.height - 150 * this.scale;
        const numShields = 4;
        const spacing = this.canvas.width / (numShields + 1);

        for (let i = 0; i < numShields; i++) {
            const x = spacing * (i + 1) - shieldWidth / 2;
            this.shields.push(new Shield(x, shieldY, shieldWidth, shieldHeight));
        }
    }

    shootPlayerBullet() {
        if (!this.gameRunning || this.playerBullets.length >= 3) return;

        const bullet = new Bullet(
            this.player.x + this.player.width / 2,
            this.player.y,
            3 * this.scale,
            10 * this.scale,
            -8 * this.scale,
            '#00ff00'
        );
        this.playerBullets.push(bullet);
    }

    alienShoot(alien) {
        const bullet = new Bullet(
            alien.x + alien.width / 2,
            alien.y + alien.height,
            3 * this.scale,
            10 * this.scale,
            5 * this.scale,
            '#ff0000'
        );
        this.alienBullets.push(bullet);
    }

    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;

        // Update player
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.moveLeft();
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.moveRight();
        }

        // Update aliens
        this.updateAliens();

        // Update bullets
        this.updateBullets();

        // Check collisions
        this.checkCollisions();

        // Check win/lose conditions
        this.checkGameState();
    }

    updateAliens() {
        if (this.aliens.length === 0) return;

        let shouldDrop = false;

        // Check if aliens hit edge
        for (let alien of this.aliens) {
            alien.x += this.alienDirection * this.alienSpeed * this.scale;

            if (alien.x <= 0 || alien.x + alien.width >= this.canvas.width) {
                shouldDrop = true;
            }
        }

        // Drop aliens and reverse direction
        if (shouldDrop) {
            this.alienDirection *= -1;
            for (let alien of this.aliens) {
                alien.y += this.alienDropDistance * this.scale;
            }
        }

        // Aliens shoot randomly
        for (let alien of this.aliens) {
            if (Math.random() < this.alienShootChance) {
                this.alienShoot(alien);
            }
        }
    }

    updateBullets() {
        // Update player bullets
        this.playerBullets = this.playerBullets.filter(bullet => {
            bullet.update();
            return bullet.y > 0;
        });

        // Update alien bullets
        this.alienBullets = this.alienBullets.filter(bullet => {
            bullet.update();
            return bullet.y < this.canvas.height;
        });
    }

    checkCollisions() {
        // Player bullets hit aliens
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const bullet = this.playerBullets[i];

            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];

                if (this.checkCollision(bullet, alien)) {
                    this.aliens.splice(j, 1);
                    this.playerBullets.splice(i, 1);
                    this.score += alien.points;
                    this.updateDisplay();
                    break;
                }
            }
        }

        // Bullets hit shields
        this.checkBulletShieldCollisions();

        // Alien bullets hit player
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const bullet = this.alienBullets[i];

            if (this.checkCollision(bullet, this.player)) {
                this.alienBullets.splice(i, 1);
                this.loseLife();
            }
        }

        // Aliens hit player
        for (let alien of this.aliens) {
            if (this.checkCollision(alien, this.player)) {
                this.loseLife();
                break;
            }
        }
    }

    checkBulletShieldCollisions() {
        // Check all bullets against all shields
        const allBullets = [...this.playerBullets, ...this.alienBullets];

        for (let i = allBullets.length - 1; i >= 0; i--) {
            const bullet = allBullets[i];

            for (let shield of this.shields) {
                if (shield.health > 0 && this.checkCollision(bullet, shield)) {
                    shield.health -= 1;

                    // Remove bullet
                    const bulletIndex = this.playerBullets.indexOf(bullet);
                    if (bulletIndex > -1) {
                        this.playerBullets.splice(bulletIndex, 1);
                    } else {
                        const alienBulletIndex = this.alienBullets.indexOf(bullet);
                        if (alienBulletIndex > -1) {
                            this.alienBullets.splice(alienBulletIndex, 1);
                        }
                    }
                    break;
                }
            }
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    loseLife() {
        this.lives--;
        this.updateDisplay();

        if (this.lives <= 0) {
            this.gameOver(false);
        } else {
            // Reset player position
            this.player.x = this.canvas.width / 2;
            this.alienBullets = [];
        }
    }

    checkGameState() {
        // Win condition - all aliens destroyed
        if (this.aliens.length === 0) {
            this.levelComplete();
        }

        // Lose condition - aliens reach bottom
        for (let alien of this.aliens) {
            if (alien.y + alien.height >= this.canvas.height - 80 * this.scale) {
                this.gameOver(false);
                break;
            }
        }
    }

    levelComplete() {
        this.level++;
        this.lives = Math.min(this.lives + 1, 5); // Bonus life (max 5)
        this.updateDisplay();
        this.initGame();
    }

    gameOver(won) {
        this.gameRunning = false;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        const title = document.getElementById('overlay-title');
        const message = document.getElementById('overlay-message');

        if (won) {
            title.textContent = 'VICTORY!';
            message.textContent = `You defended Earth! Final Score: ${this.score}`;
        } else {
            title.textContent = 'GAME OVER';
            message.textContent = `Earth has been invaded! Score: ${this.score}`;
        }

        this.startButton.textContent = 'PLAY AGAIN';
        this.overlay.classList.remove('hidden');
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars background
        this.drawStars();

        // Draw shields
        for (let shield of this.shields) {
            if (shield.health > 0) {
                shield.draw(this.ctx);
            }
        }

        // Draw player
        this.player.draw(this.ctx);

        // Draw aliens
        for (let alien of this.aliens) {
            alien.draw(this.ctx);
        }

        // Draw bullets
        for (let bullet of this.playerBullets) {
            bullet.draw(this.ctx);
        }
        for (let bullet of this.alienBullets) {
            bullet.draw(this.ctx);
        }
    }

    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 53) % this.canvas.height;
            const size = (i % 3) * 0.5 + 0.5;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawStartScreen() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStars();
    }

    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    loadHighScore() {
        const saved = localStorage.getItem('spaceInvadersHighScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('spaceInvadersHighScore', this.highScore);
    }
}

// Player class
class Player {
    constructor(x, y, canvasWidth, scale) {
        this.x = x;
        this.y = y;
        this.width = 40 * scale;
        this.height = 30 * scale;
        this.speed = 5 * scale;
        this.canvasWidth = canvasWidth;
        this.scale = scale;
    }

    moveLeft() {
        this.x = Math.max(0, this.x - this.speed);
    }

    moveRight() {
        this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed);
    }

    draw(ctx) {
        // Draw spaceship
        ctx.fillStyle = '#00ff00';

        // Ship body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#00cccc';
        ctx.fillRect(this.x + this.width / 2 - 5 * this.scale, this.y + 5 * this.scale, 10 * this.scale, 8 * this.scale);
    }
}

// Alien class
class Alien {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.points = type * 10;
        this.animFrame = 0;
    }

    draw(ctx) {
        this.animFrame++;

        // Different colors for different types
        const colors = ['#ff00ff', '#ff8800', '#ff0000'];
        ctx.fillStyle = colors[this.type - 1];

        // Animate aliens
        const offset = Math.sin(this.animFrame * 0.1) * 2;

        // Draw alien body
        ctx.fillRect(this.x + 5, this.y + offset, this.width - 10, this.height - 8);

        // Draw eyes
        ctx.fillStyle = '#ffffff';
        const eyeSize = 4;
        ctx.fillRect(this.x + 10, this.y + 8 + offset, eyeSize, eyeSize);
        ctx.fillRect(this.x + this.width - 14, this.y + 8 + offset, eyeSize, eyeSize);

        // Draw tentacles
        ctx.fillStyle = colors[this.type - 1];
        for (let i = 0; i < 4; i++) {
            const tentacleX = this.x + 8 + i * 8;
            ctx.fillRect(tentacleX, this.y + this.height - 8 + offset, 3, 8);
        }
    }
}

// Bullet class
class Bullet {
    constructor(x, y, width, height, speed, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Shield class
class Shield {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.health = 10;
        this.maxHealth = 10;
    }

    draw(ctx) {
        const healthPercent = this.health / this.maxHealth;

        // Color changes based on health
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#00ff00';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#ffff00';
        } else {
            ctx.fillStyle = '#ff8800';
        }

        // Draw shield with damage effect
        ctx.globalAlpha = healthPercent;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;

        // Draw border
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new SpaceInvaders();
});
