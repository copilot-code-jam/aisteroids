import { Scene } from "phaser";

export class SpaceScene extends Scene {
  private astronaut!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private background!: Phaser.GameObjects.Image;
  private asteroids!: Phaser.Physics.Arcade.Group;
  private gameOverText!: Phaser.GameObjects.Text;
  private gameOverOverlay!: Phaser.GameObjects.Graphics;
  private restartButton!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private finalScoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private highScore: number = 0;
  private startTime!: number;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemySpeed: number = 0;

  constructor() {
    super({ key: "SpaceScene" });
  }

  preload() {
    // Load the astronaut sprite
    this.load.image("astronaut", "assets/astronaut.png");
    // Load the background image
    this.load.image("space-bg", "assets/space-bg.png");
    // Load the asteroid sprites
    this.load.image("big-meteor", "assets/meteor_big.png");
    this.load.image("small-meteor", "assets/meteor_small.png");
    // Load the enemy sprite
    this.load.image("enemy", "assets/enemy.png");
  }

  create() {
    // Create the background image and stretch it to cover the entire screen
    this.background = this.add.image(0, 0, "space-bg");
    this.background.setOrigin(0, 0);
    this.background.displayWidth = this.scale.width;
    this.background.displayHeight = this.scale.height;

    // Create the astronaut sprite and enable physics
    this.astronaut = this.physics.add.sprite(512, 384, "astronaut");
    this.astronaut.setCollideWorldBounds(true);
    this.astronaut.setScale(1.5); // Increase the size by 1.5 times

    // Create cursor keys for controlling the astronaut
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create a group for the asteroids
    this.asteroids = this.physics.add.group();

    // Spawn the initial asteroid
    this.spawnAsteroid();

    // Spawn asteroids at random intervals
    this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true,
    });

    // Add collision between astronaut and asteroids
    this.physics.add.collider(
      this.astronaut,
      this.asteroids,
      this.handleCollision,
      undefined,
      this
    );

    // Create game over overlay and text but make them invisible initially
    this.gameOverOverlay = this.add.graphics();
    this.gameOverOverlay.fillStyle(0x000000, 0.7);
    this.gameOverOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
    this.gameOverOverlay.setVisible(false);

    this.gameOverText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      "Game Over",
      {
        fontSize: "64px",
        color: "#ff0000",
      }
    );
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    this.finalScoreText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "",
      {
        fontSize: "32px",
        color: "#ffffff",
      }
    );
    this.finalScoreText.setOrigin(0.5);
    this.finalScoreText.setVisible(false);

    this.highScoreText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 50,
      "",
      {
        fontSize: "32px",
        color: "#ffffff",
      }
    );
    this.highScoreText.setOrigin(0.5);
    this.highScoreText.setVisible(false);

    this.restartButton = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      "Restart",
      {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#000000",
      }
    );
    this.restartButton.setOrigin(0.5);
    this.restartButton.setInteractive();
    this.restartButton.on("pointerdown", () => this.scene.restart());
    this.restartButton.setVisible(false);

    // Create score text
    this.scoreText = this.add.text(10, 10, "Score: 0", {
      fontSize: "32px",
      color: "#ffffff",
    });

    // Initialize start time
    this.startTime = this.time.now;

    // Create a group for the enemies
    this.enemies = this.physics.add.group();

    // Add collision between astronaut and enemies
    this.physics.add.collider(
      this.astronaut,
      this.enemies,
      this.handleCollision,
      undefined,
      this
    );

    // Spawn the first enemy after 20 seconds
    this.time.addEvent({
      delay: 20000, // 20 seconds
      callback: this.spawnEnemy,
      callbackScope: this,
    });

    // Spawn additional enemies at random intervals between 8 and 16 seconds
    this.time.addEvent({
      delay: Phaser.Math.Between(8000, 16000), // 8 to 16 seconds
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    // Reset velocity
    this.astronaut.setVelocity(0);

    // Move the astronaut based on arrow keys with progressive control
    if (this.cursors.left.isDown) {
      this.velocity.x = Phaser.Math.Clamp(this.velocity.x - 10, -300, 300);
    } else if (this.cursors.right.isDown) {
      this.velocity.x = Phaser.Math.Clamp(this.velocity.x + 10, -300, 300);
    } else {
      this.velocity.x *= 0.9; // Slow down gradually
    }

    if (this.cursors.up.isDown) {
      this.velocity.y = Phaser.Math.Clamp(this.velocity.y - 10, -300, 300);
    } else if (this.cursors.down.isDown) {
      this.velocity.y = Phaser.Math.Clamp(this.velocity.y + 10, -300, 300);
    } else {
      this.velocity.y *= 0.9; // Slow down gradually
    }

    this.astronaut.setVelocity(this.velocity.x, this.velocity.y);

    // Update score based on survival time
    this.score = Math.floor((this.time.now - this.startTime) / 1000);
    this.scoreText.setText("Score: " + this.score);

    // Update enemy movement to chase the astronaut
    this.enemies.children.iterate((enemy: Phaser.Physics.Arcade.Sprite) => {
      if (enemy.active) {
        this.physics.moveToObject(enemy, this.astronaut, this.enemySpeed);
      }
    });
  }

  private spawnAsteroid() {
    const positions = [
      { x: Phaser.Math.Between(0, this.scale.width), y: 0 }, // Top
      { x: Phaser.Math.Between(0, this.scale.width), y: this.scale.height }, // Bottom
      { x: 0, y: Phaser.Math.Between(0, this.scale.height) }, // Left
      { x: this.scale.width, y: Phaser.Math.Between(0, this.scale.height) }, // Right
    ];
    const position = Phaser.Math.RND.pick(positions);
    const key = Phaser.Math.RND.pick(["big-meteor", "small-meteor"]);
    const asteroid = this.asteroids.create(position.x, position.y, key);

    if (asteroid) {
      asteroid.setActive(true);
      asteroid.setVisible(true);
      asteroid.setScale(0.5); // Set the scale to half size

      // Calculate velocity towards the center of the screen
      const centerX = this.scale.width / 2;
      const centerY = this.scale.height / 2;
      const angle = Phaser.Math.Angle.Between(
        position.x,
        position.y,
        centerX,
        centerY
      );
      const speed = Phaser.Math.Between(100, 200);
      this.physics.velocityFromRotation(angle, speed, asteroid.body.velocity);
    }

    // Increase the number of asteroids based on the score, up to a maximum of 8
    if (
      this.asteroids.getLength() < Math.min(Math.floor(this.score / 10) + 1, 8)
    ) {
      this.spawnAsteroid();
    }
  }

  private spawnEnemy() {
    // Spawn the enemy at a random position
    const positions = [
      { x: Phaser.Math.Between(0, this.scale.width), y: 0 }, // Top
      { x: Phaser.Math.Between(0, this.scale.width), y: this.scale.height }, // Bottom
      { x: 0, y: Phaser.Math.Between(0, this.scale.height) }, // Left
      { x: this.scale.width, y: Phaser.Math.Between(0, this.scale.height) }, // Right
    ];
    const position = Phaser.Math.RND.pick(positions);
    const enemy = this.enemies.create(position.x, position.y, "enemy");

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);

      // Set the enemy speed to a random value up to ~70% of the astronaut's top speed
      this.enemySpeed = Phaser.Math.Between(100, 225);
    }
  }

  private handleCollision(
    astronaut: Phaser.Physics.Arcade.Sprite,
    object: Phaser.Physics.Arcade.Sprite
  ) {
    // Handle collision between astronaut and asteroid or enemy
    object.setActive(false);
    object.setVisible(false);

    // Show game over overlay and text
    this.gameOverOverlay.setVisible(true);
    this.gameOverText.setVisible(true);
    this.finalScoreText.setText("Final Score: " + this.score);
    this.finalScoreText.setVisible(true);

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.highScoreText.setText("High Score: " + this.highScore);
    this.highScoreText.setVisible(true);

    this.restartButton.setVisible(true);

    // Stop the game
    this.physics.pause();
    this.astronaut.setTint(0xff0000);
  }
}
