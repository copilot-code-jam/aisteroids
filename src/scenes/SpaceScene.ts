import { Scene } from 'phaser';

export class SpaceScene extends Scene {
    private astronaut!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super({ key: 'SpaceScene' });
    }

    preload() {
        // Load the astronaut sprite
        this.load.image('astronaut', 'assets/astronaut.png');
    }

    create() {
        // Create the astronaut sprite and enable physics
        this.astronaut = this.physics.add.sprite(512, 384, 'astronaut');
        this.astronaut.setCollideWorldBounds(true);

        // Create cursor keys for controlling the astronaut
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        // Reset the velocity
        this.astronaut.setVelocity(0);

        // Update the astronaut's velocity based on the arrow keys
        if (this.cursors.left.isDown) {
            this.astronaut.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.astronaut.setVelocityX(200);
        }

        if (this.cursors.up.isDown) {
            this.astronaut.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.astronaut.setVelocityY(200);
        }
    }
}