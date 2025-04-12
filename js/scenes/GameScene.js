class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize multiplayer
        this.multiplayer = window.multiplayerManager;
        this.multiplayer.on('playerAssigned', this.handlePlayerAssigned.bind(this));
        this.multiplayer.on('gameStart', this.handleGameStart.bind(this));
        this.multiplayer.on('gameAction', this.handleGameAction.bind(this));
        this.multiplayer.on('opponentDisconnected', this.handleOpponentDisconnected.bind(this));

        // Initialize game state
        this.gameState = {
            advantageFlipped: false,
            playerData: {
                player1: {
                    coins: 15,
                    activeBarracks: 0,
                    powerupCooldowns: {
                        reverser: 0,
                        flooder: 0
                    },
                    flooderActive: false
                },
                player2: {
                    coins: 15,
                    activeBarracks: 0,
                    powerupCooldowns: {
                        reverser: 0,
                        flooder: 0
                    },
                    flooderActive: false
                }
            }
        };

        // Reset game state
        this.resetGameState();
        
        // Add background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        
        // Create groups for units and buildings
        this.createGroups();
        
        // Set up the game world
        this.setupWorld();
        
        // Set up physics
        this.setupPhysics();
        
        // Create players
        this.player1 = new Player(this, CONSTANTS.PLAYER_1);
        this.player2 = new Player(this, CONSTANTS.PLAYER_2);
        
        // Add game over event listener
        this.events.on('gameOver', this.onGameOver, this);
        
        // Use dummy sound for background music since audio is disabled
        this.backgroundMusic = window.dummySound;
    }
    
    resetGameState() {
        // Reset the global game state
        this.gameState.advantageFlipped = false;
        this.gameState.playerData = {
            player1: {
                coins: 15,
                activeBarracks: 0,
                powerupCooldowns: {
                    reverser: 0,
                    flooder: 0
                },
                flooderActive: false
            },
            player2: {
                coins: 15,
                activeBarracks: 0,
                powerupCooldowns: {
                    reverser: 0,
                    flooder: 0
                },
                flooderActive: false
            }
        };
    }
    
    createGroups() {
        // Create groups for units
        this.player1Units = this.physics.add.group();
        this.player2Units = this.physics.add.group();
        
        // Create groups for buildings
        this.player1Barracks = this.add.group();
        this.player2Barracks = this.add.group();
    }
    
    setupWorld() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        // Create castles with clear player identification
        console.log(`Creating castles: Player1 at x=100, Player2 at x=${gameWidth - 100}`);
        this.player1Castle = new Castle(this, 100, gameHeight / 2, CONSTANTS.PLAYER_1);
        this.player2Castle = new Castle(this, gameWidth - 100, gameHeight / 2, CONSTANTS.PLAYER_2);
        
        // Create barracks for player 1 with more spacing between them
        // Each row only gets one barrack of its specific type
        const p1BarrackX = 250;
        new Barrack(this, p1BarrackX, gameHeight / 2 - 200, CONSTANTS.PLAYER_1, CONSTANTS.UNIT_TYPES.ROCK);
        new Barrack(this, p1BarrackX, gameHeight / 2, CONSTANTS.PLAYER_1, CONSTANTS.UNIT_TYPES.PAPER);
        new Barrack(this, p1BarrackX, gameHeight / 2 + 200, CONSTANTS.PLAYER_1, CONSTANTS.UNIT_TYPES.SCISSORS);
        
        // Create barracks for player 2 with more spacing between them
        const p2BarrackX = gameWidth - 250;
        new Barrack(this, p2BarrackX, gameHeight / 2 - 200, CONSTANTS.PLAYER_2, CONSTANTS.UNIT_TYPES.ROCK);
        new Barrack(this, p2BarrackX, gameHeight / 2, CONSTANTS.PLAYER_2, CONSTANTS.UNIT_TYPES.PAPER);
        new Barrack(this, p2BarrackX, gameHeight / 2 + 200, CONSTANTS.PLAYER_2, CONSTANTS.UNIT_TYPES.SCISSORS);
    }
    
    setupPhysics() {
        // Set up collisions between units
        this.physics.add.collider(this.player1Units, this.player2Units, this.handleUnitCollision, null, this);
        
        // Set up collisions between units and castles
        this.physics.add.collider(this.player1Units, this.player2Castle, this.handleCastleCollision, null, this);
        this.physics.add.collider(this.player2Units, this.player1Castle, this.handleCastleCollision, null, this);
    }
    
    handleUnitCollision(unit1, unit2) {
        // Instead of playing animations, just flash the units
        unit1.setTint(0xffff00); // Yellow flash for attack
        unit2.setTint(0xffff00);
        
        // Clear the tint after a short delay
        this.time.delayedCall(200, () => {
            if (unit1.active) unit1.clearTint();
            if (unit2.active) unit2.clearTint();
        });
        
        // Audio is disabled, so we don't play attack sound
        
        // Calculate damage
        const damage1 = unit1.calculateDamage(unit2);
        const damage2 = unit2.calculateDamage(unit1);
        
        // Apply damage and check for defeated units
        unit1.takeDamage(damage2);
        unit2.takeDamage(damage1);
        
        // If a unit is defeated, reward the opposing player with a coin
        if (!unit1.active) {
            // Unit 1 was defeated, reward player 2
            const player2 = this.players.find(p => p.playerId === CONSTANTS.PLAYER_2);
            player2.addCoins(1);
        }
        if (!unit2.active) {
            // Unit 2 was defeated, reward player 1
            const player1 = this.players.find(p => p.playerId === CONSTANTS.PLAYER_1);
            player1.addCoins(1);
        }
        
        // Separate the units slightly to prevent continuous collisions
        const angle = Phaser.Math.Angle.Between(unit1.x, unit1.y, unit2.x, unit2.y);
        unit1.x -= Math.cos(angle) * 10;
        unit1.y -= Math.sin(angle) * 10;
        unit2.x += Math.cos(angle) * 10;
        unit2.y += Math.sin(angle) * 10;
    }
    
    handleCastleCollision(unit, castle) {
        // If the unit belongs to the enemy, the game is over
        if (unit.player !== castle.player) {
            // Log detailed information about the collision
            console.log(`Unit collision with castle: Unit player=${unit.player}, Castle player=${castle.player}`);
            
            // Determine which side of the screen the castle is on
            const castleOnLeft = castle.x < this.cameras.main.width / 2;
            
            // The winner is determined by which castle was reached
            // If left castle (Player 1's) was reached, Player 2 wins
            // If right castle (Player 2's) was reached, Player 1 wins
            const winner = castleOnLeft ? CONSTANTS.PLAYER_2 : CONSTANTS.PLAYER_1;
            
            // Log the winner for debugging
            console.log(`Game over! Castle on ${castleOnLeft ? 'left' : 'right'} side was reached. Winner: ${winner}`);
            
            // Trigger the game over event directly
            this.events.emit('gameOver', winner);
        }
    }
    
    handlePlayerAssigned(data) {
        this.playerSide = data.side;
        this.opponentSide = data.opponentSide;
        console.log(`Assigned to ${this.playerSide} side`);
    }

    handleGameStart() {
        this.gameStarted = true;
        console.log('Game started');
    }

    handleGameAction(action) {
        if (!this.gameStarted) return;

        switch (action.type) {
            case 'toggleBarrack':
                this.toggleBarrack(action.barrackId);
                break;

            case 'usePowerup':
                this.usePowerup(action.powerupType);
                break;

            case 'unitKilled':
                this.handleUnitKilled(action.side);
                break;

            case 'gameOver':
                this.gameOver(action.winner);
                break;
        }
    }

    handleOpponentDisconnected() {
        this.gameStarted = false;
        this.gameState = null;
        this.multiplayer = null;
        console.log('Opponent disconnected');
    }

    toggleBarrack(barrackId) {
        const barrack = this.barracks[barrackId];
        if (barrack) {
            barrack.toggle();
            // Send toggle action to server
            this.multiplayer.toggleBarrack(barrackId);
        }
    }

    usePowerup(powerupType) {
        const playerData = this.gameState.playerData;
        const powerupCosts = {
            reverser: 10,
            flooder: 15
        };

        // Check if player has enough coins
        if (playerData[this.playerSide].coins >= powerupCosts[powerupType]) {
            // Apply powerup effect
            switch (powerupType) {
                case 'reverser':
                    this.gameState.advantageFlipped = !this.gameState.advantageFlipped;
                    break;
                case 'flooder':
                    // Increase unit generation rate for 5 seconds
                    this.flooderActive = true;
                    this.time.delayedCall(5000, () => {
                        this.flooderActive = false;
                    });
                    break;
            }

            // Deduct coins and update cooldown
            playerData[this.playerSide].coins -= powerupCosts[powerupType];
            playerData[this.playerSide].powerupCooldowns[powerupType] = 10; // 10-second cooldown

            // Send powerup usage to server
            this.multiplayer.usePowerup(powerupType);
        }
    }

    handleUnitKilled(side) {
        // Award coin to the player who killed the unit
        this.gameState.playerData[side].coins += 1;
        // Send kill report to server
        this.multiplayer.reportUnitKilled(side);
    }

    gameOver(winner) {
        this.gameStarted = false;
        this.scene.pause();
        this.scene.launch('GameOverScene', { winner });
    }

    onGameOver(winner) {
        // Audio is disabled, so we don't play game over sound
        
        // Stop the background music
        this.backgroundMusic.stop();
        
        // Create a game over panel
        const gameOverPanel = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.8);
        panelBg.fillRect(-200, -100, 400, 200);
        gameOverPanel.add(panelBg);
        
        const gameOverText = this.add.text(0, -50, 'Game Over', {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        gameOverText.setOrigin(0.5);
        gameOverPanel.add(gameOverText);
        
        // Display the correct winner (the player whose unit reached the enemy castle)
        const winnerText = this.add.text(0, 0, `${winner === CONSTANTS.PLAYER_1 ? 'Player 1' : 'Player 2'} Wins!`, {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#ffffff'
        });
        winnerText.setOrigin(0.5);
        gameOverPanel.add(winnerText);
        
        const restartButton = this.add.image(0, 60, 'button');
        restartButton.setInteractive({ useHandCursor: true });
        gameOverPanel.add(restartButton);
        
        const restartText = this.add.text(0, 60, 'Restart', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#ffffff'
        });
        restartText.setOrigin(0.5);
        gameOverPanel.add(restartText);
        
        restartButton.on('pointerover', () => restartButton.setTint(0xcccccc));
        restartButton.on('pointerout', () => restartButton.clearTint());
        restartButton.on('pointerdown', () => restartButton.setTexture('button_pressed'));
        restartButton.on('pointerup', () => {
            restartButton.setTexture('button');
            this.scene.restart();
            this.scene.get('UIScene').scene.restart();
        });
    }
    
    update(time, delta) {
        // Update all units
        this.player1Units.getChildren().forEach(unit => unit.update());
        this.player2Units.getChildren().forEach(unit => unit.update());
        
        // Update all barracks
        this.player1Barracks.getChildren().forEach(barrack => barrack.update(time, delta));
        this.player2Barracks.getChildren().forEach(barrack => barrack.update(time, delta));
    }
}
