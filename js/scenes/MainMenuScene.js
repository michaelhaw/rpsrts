class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.waitingForPlayer = false;
    }

    create() {
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');

        // Add title text
        const titleText = this.add.text(this.cameras.main.width / 2, 150, 'Rock Paper Scissors RTS', {
            fontFamily: 'Arial',
            fontSize: 48,
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);

        // Add play button
        const playButton = this.add.image(this.cameras.main.width / 2, 300, 'button');
        playButton.setScale(2);
        playButton.setInteractive({ useHandCursor: true });

        this.playText = this.add.text(playButton.x, playButton.y, 'Play Game', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff'
        });
        this.playText.setOrigin(0.5);

        // Create status text
        this.statusText = this.add.text(this.cameras.main.width / 2, 400, '', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.statusText.setOrigin(0.5);

        // Button hover and click effects
        playButton.on('pointerover', () => {
            playButton.setTint(0xcccccc);
        });

        playButton.on('pointerout', () => {
            playButton.clearTint();
        });

        playButton.on('pointerdown', () => {
            playButton.setTexture('button_pressed');
        });

        playButton.on('pointerup', () => {
            if (!this.waitingForPlayer) {
                playButton.setTexture('button');
                this.connectToServer();
            }
        });

        // Set up multiplayer event handlers
        if (window.multiplayerManager) {
            this.setupMultiplayerEvents();
        } else {
            console.error('MultiplayerManager not initialized');
            this.statusText.setText('Error: Multiplayer not available');
        }

        // Add instructions
        this.addInstructions();
    }

    setupMultiplayerEvents() {
        multiplayerManager.on('connected', () => {
            console.log('Connected to server');
        });

        multiplayerManager.on('playerAssigned', (playerId) => {
            console.log('Assigned player ID:', playerId);
            this.statusText.setText(`You are ${playerId === 'player1' ? 'Player 1 (Left)' : 'Player 2 (Right)'}`);
        });

        multiplayerManager.on('waiting', () => {
            this.waitingForPlayer = true;
            this.statusText.setText('Waiting for another player to join...');
            this.playText.setText('Waiting...');
        });

        multiplayerManager.on('gameStart', () => {
            this.waitingForPlayer = false;
            this.statusText.setText('Game starting...');
            this.scene.start('GameScene');
        });

        multiplayerManager.on('error', (error) => {
            this.statusText.setText(`Error: ${error}`);
            this.waitingForPlayer = false;
            this.playText.setText('Play Game');
        });

        multiplayerManager.on('disconnected', () => {
            this.statusText.setText('Disconnected from server');
            this.waitingForPlayer = false;
            this.playText.setText('Play Game');
        });
    }

    addInstructions() {
        // Add instructions text
        const instructionsTitle = this.add.text(this.cameras.main.width / 2, 500, 'How to Play:', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        instructionsTitle.setOrigin(0.5);

        const instructions = [
            'Each player has a castle and 3 barracks (Rock, Paper, Scissors)',
            'Units automatically move towards the enemy castle',
            'Rock beats Scissors, Scissors beats Paper, Paper beats Rock',
            'Units have 2 HP and deal 1-2 damage based on type advantage',
            'Max 2 active barracks at a time, 3-second cooldown when toggling',
            'Get 1 coin for each enemy unit defeated'
        ];

        let yOffset = 540;
        instructions.forEach(text => {
            const instructionText = this.add.text(this.cameras.main.width / 2, yOffset, text, {
                fontFamily: 'Arial',
                fontSize: 16,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            });
            instructionText.setOrigin(0.5);
            yOffset += 25;
        });
    }

    connectToServer() {
        this.statusText.setText('Connecting to server...');
        this.waitingForPlayer = true;
        this.playText.setText('Connecting...');
        multiplayerManager.connect();
    }
}
