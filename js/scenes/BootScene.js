class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load the loading screen assets
        this.load.image('loading_background', 'assets/images/loading_background.png');
        this.load.image('loading_bar', 'assets/images/loading_bar.png');
    }

    create() {
        // Proceed to the preload scene
        this.scene.start('PreloadScene');
    }
}
