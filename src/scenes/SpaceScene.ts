import { Scene } from 'phaser';

export class SpaceScene extends Scene {
    private astronaut!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private background!: Phaser.GameObjects.Image;
    private asteroids!: Phaser.Physics.Arcade.Group;
    private gameOverText!: Phaser.GameObjects.Text;
    private gameOverOverlay!: Phaser.GameObjects.Graphics;
    private restartButton!: Phaser.GameObjects.Text;
    private velocity: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        super({ key: 'SpaceScene' });
    }

    preload() {
        // Load the astronaut sprite
        this.load.image('astronaut', 'assets/astronaut.png');
        // Load the background image
        this.load.image('space-bg', 'assets/space-bg.png');
        // Load the asteroid sprites
        this.load.image('big-meteor', 'assets/meteor_big.png');
        this.load.image('small-meteor', 'assets/meteor_small.png');
    }

    create() {
        // Create the background image and stretch it to cover the entire screen
        this.background = this.add.image(0, 0, 'space-bg');
        this.background.setOrigin(0, 0);
        this.background.displayWidth = this.scale.width;
        this.background.displayHeight = this.scale.height;

        // Create the astronaut sprite and enable physics
        this.astronaut = this.physics.add.sprite(512, 384, 'astronaut');
        this.astronaut.setCollideWorldBounds(true);
        this.astronaut.setScale(1.5); // Increase the size by 1.5 times

        // Create cursor keys for controlling the astronaut
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create a group for the asteroids
        this.asteroids = this.physics.add.group({
            maxSize: 10
        });

        // Spawn asteroids at random intervals
        this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.spawnAsteroid,
            callbackScope: this,
            loop: true
        });

        // Add collision between astronaut and asteroids
        this.physics.add.collider(this.astronaut, this.asteroids, this.handleCollision, undefined, this);

        // Create game over overlay and text but make them invisible initially
        this.gameOverOverlay = this.add.graphics();
        this.gameOverOverlay.fillStyle(0x000000, 0.7);
        this.gameOverOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
        this.gameOverOverlay.setVisible(false);

        this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'Game Over', {
            fontSize: '64px',
            color: '#ff0000'
        });
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setVisible(false);

        this.restartButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'Restart', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000'
        });
        this.restartButton.setOrigin(0.5);
        this.restartButton.setInteractive();
        this.restartButton.on('pointerdown', () => this.scene.restart());
        this.restartButton.setVisible(false);
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
    }

    private spawnAsteroid() {
        const positions = [
            { x: Phaser.Math.Between(0, this.scale.width), y: 0 }, // Top
            { x: Phaser.Math.Between(0, this.scale.width), y: this.scale.height }, // Bottom
            { x: 0, y: Phaser.Math.Between(0, this.scale.height) }, // Left
            { x: this.scale.width, y: Phaser.Math.Between(0, this.scale.height) } // Right
        ];
        const position = Phaser.Math.RND.pick(positions);
        const key = Phaser.Math.RND.pick(['big-meteor', 'small-meteor']);
        const asteroid = this.asteroids.create(position.x, position.y, key);

        if (asteroid) {
            asteroid.setActive(true);
            asteroid.setVisible(true);
            asteroid.setScale(0.5); // Set the scale to half size

            // Calculate velocity towards the center of the screen
            const centerX = this.scale.width / 2;
            const centerY = this.scale.height / 2;
            const angle = Phaser.Math.Angle.Between(position.x, position.y, centerX, centerY);
            const speed = Phaser.Math.Between(100, 200);
            this.physics.velocityFromRotation(angle, speed, asteroid.body.velocity);
        }
    }

    private handleCollision(astronaut: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite) {
        // Handle collision between astronaut and asteroid
        asteroid.setActive(false);
        asteroid.setVisible(false);

        // Show game over overlay and text
        this.gameOverOverlay.setVisible(true);
        this.gameOverText.setVisible(true);
        this.restartButton.setVisible(true);

        // Stop the game
        this.physics.pause();
        this.astronaut.setTint(0xff0000);
    }
}