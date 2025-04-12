class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Create UI elements
        this.createPlayerUI(CONSTANTS.PLAYER_1);
        this.createPlayerUI(CONSTANTS.PLAYER_2);
        
        // Listen for events from the game scene
        this.listenForEvents();
    }
    
    createPlayerUI(playerId) {
        const isPlayer1 = playerId === CONSTANTS.PLAYER_1;
        const x = isPlayer1 ? 150 : this.cameras.main.width - 150;
        const y = 50;
        
        // Create a panel for the player's UI
        const panel = this.add.container(x, y);
        
        // Add a background for the panel
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x000000, 0.5);
        panelBg.fillRect(-140, -40, 280, 80);
        panel.add(panelBg);
        
        // Add player label
        const playerLabel = this.add.text(0, -25, isPlayer1 ? 'Player 1' : 'Player 2', {
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            fontStyle: 'bold'
        });
        playerLabel.setOrigin(0.5);
        panel.add(playerLabel);
        
        // Add coin display
        const coinIcon = this.add.image(-100, 10, 'coin');
        coinIcon.setScale(0.5);
        panel.add(coinIcon);
        
        const coinText = this.add.text(-70, 10, '0', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffffff'
        });
        coinText.setOrigin(0, 0.5);
        panel.add(coinText);
        
        // Store the coin text for updating later
        this[`${playerId}CoinText`] = coinText;
        
        // Add powerup buttons
        this.createPowerupButton(panel, -20, 10, 'reverser_icon', playerId, 'reverser');
        this.createPowerupButton(panel, 60, 10, 'flooder_icon', playerId, 'flooder');
        
        // Store the panel for reference
        this[`${playerId}Panel`] = panel;
    }
    
    createPowerupButton(panel, x, y, iconKey, playerId, powerupType) {
        // Create a button container
        const button = this.add.container(x, y);
        panel.add(button);
        
        // Add button background
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x333333);
        buttonBg.fillRect(-30, -20, 60, 40);
        button.add(buttonBg);
        
        // Add powerup icon
        const icon = this.add.image(0, 0, iconKey);
        icon.setScale(0.4);
        button.add(icon);
        
        // Add cooldown overlay (initially invisible)
        const cooldownOverlay = this.add.graphics();
        cooldownOverlay.fillStyle(0x000000, 0.7);
        cooldownOverlay.fillRect(-30, -20, 60, 40);
        cooldownOverlay.setVisible(false);
        button.add(cooldownOverlay);
        
        // Add cooldown text
        const cooldownText = this.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff'
        });
        cooldownText.setOrigin(0.5);
        cooldownText.setVisible(false);
        button.add(cooldownText);
        
        // Store the cooldown elements for updating later
        this[`${playerId}${powerupType}CooldownOverlay`] = cooldownOverlay;
        this[`${playerId}${powerupType}CooldownText`] = cooldownText;
        
        // Make the button interactive
        buttonBg.setInteractive(new Phaser.Geom.Rectangle(-30, -20, 60, 40), Phaser.Geom.Rectangle.Contains);
        
        // Add hover effects
        buttonBg.on('pointerover', () => {
            if (!cooldownOverlay.visible) {
                buttonBg.clear();
                buttonBg.fillStyle(0x555555);
                buttonBg.fillRect(-30, -20, 60, 40);
            }
        });
        
        buttonBg.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x333333);
            buttonBg.fillRect(-30, -20, 60, 40);
        });
        
        // Add click handler
        buttonBg.on('pointerdown', () => {
            // Only proceed if not on cooldown
            if (!cooldownOverlay.visible) {
                // Get the game scene
                const gameScene = this.scene.get('GameScene');
                
                // Get the player
                const player = (playerId === CONSTANTS.PLAYER_1) ? gameScene.player1 : gameScene.player2;
                
                // Use the powerup
                let success = false;
                if (powerupType === 'reverser') {
                    success = player.useReverserPowerup();
                } else if (powerupType === 'flooder') {
                    success = player.useFlooderPowerup();
                }
                
                // If the powerup was used successfully, play a sound with error handling
                if (success) {
                    // Audio is disabled, so we don't play powerup activation sound
                }
            }
        });
        
        // Add cost label
        const cost = (powerupType === 'reverser') ? 
            CONSTANTS.POWERUPS.REVERSER.COST : 
            CONSTANTS.POWERUPS.FLOODER.COST;
            
        const costText = this.add.text(0, -30, `${cost}`, {
            fontFamily: 'Arial',
            fontSize: 12,
            color: '#ffff00'
        });
        costText.setOrigin(0.5);
        button.add(costText);
    }
    
    listenForEvents() {
        // Listen for coin updates
        this.scene.get('GameScene').events.on('updateCoins', this.updateCoins, this);
        
        // Listen for powerup cooldown updates
        this.scene.get('GameScene').events.on('updatePowerupCooldown', this.updatePowerupCooldown, this);
    }
    
    updateCoins(playerId, coins) {
        // Update the coin text
        this[`${playerId}CoinText`].setText(coins.toString());
    }
    
    updatePowerupCooldown(playerId, powerupType, cooldown) {
        const cooldownOverlay = this[`${playerId}${powerupType}CooldownOverlay`];
        const cooldownText = this[`${playerId}${powerupType}CooldownText`];
        
        if (cooldown > 0) {
            // Show the cooldown overlay and text
            cooldownOverlay.setVisible(true);
            cooldownText.setVisible(true);
            
            // Update the cooldown text (show seconds)
            cooldownText.setText(Math.ceil(cooldown / 1000).toString());
        } else {
            // Hide the cooldown overlay and text
            cooldownOverlay.setVisible(false);
            cooldownText.setVisible(false);
        }
    }
}
