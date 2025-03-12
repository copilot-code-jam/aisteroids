import { Scene } from 'phaser';

export class SpaceScene extends Scene {
    private astronaut!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private background!: Phaser.GameObjects.Image;

    constructor() {
        super({ key: 'SpaceScene' });
    }

    preload() {
        // Load the astronaut sprite
        this.load.image('astronaut', 'assets/astronaut.png');
        // Load the background image
        this.load.image('space-bg', 'assets/space-bg.png');
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
    }

    update() {
        // Apply thrust when the up arrow key is pressed
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.astronaut.rotation, 200, this.astronaut.body.acceleration);
        } else {
            this.astronaut.setAcceleration(0);
        }

        // Rotate the astronaut based on left/right arrow keys
        if (this.cursors.left.isDown) {
            this.astronaut.setAngularVelocity(-300); // Increase rotation speed
        } else if (this.cursors.right.isDown) {
            this.astronaut.setAngularVelocity(300); // Increase rotation speed
        } else {
            this.astronaut.setAngularVelocity(0);
        }

        // Apply drag to simulate space friction
        this.astronaut.setDamping(true);
        this.astronaut.setDrag(0.99);
    }
}