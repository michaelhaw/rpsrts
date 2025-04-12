class Barrack extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player, unitType) {
        // Select the correct texture based on unit type
        let textureKey;
        switch (unitType) {
            case CONSTANTS.UNIT_TYPES.ROCK:
                textureKey = 'barrack_rock';
                break;
            case CONSTANTS.UNIT_TYPES.PAPER:
                textureKey = 'barrack_paper';
                break;
            case CONSTANTS.UNIT_TYPES.SCISSORS:
                textureKey = 'barrack_scissors';
                break;
        }
        super(scene, x, y, textureKey);
        
        // Add this barrack to the scene
        scene.add.existing(this);
        
        // Set barrack properties
        this.player = player; // player1 or player2
        this.unitType = unitType; // rock, paper, or scissors
        this.active = false; // Whether the barrack is producing units
        this.cooldown = 0; // Cooldown timer for toggling
        this.unitTimer = null; // Timer for unit production
        
        // No need to set frame since we're using separate textures for each type
        
        // Flip the sprite if it's player 2's barrack
        if (player === CONSTANTS.PLAYER_2) {
            this.flipX = true;
        }
        
        // Create an interactive button for toggling the barrack
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', this.toggleBarrack, this);
        
        // Create separate status indicators for each state
        this.statusInactive = scene.add.sprite(x, y - 60, 'status_inactive');
        this.statusActive = scene.add.sprite(x, y - 60, 'status_active');
        this.statusCooldown = scene.add.sprite(x, y - 60, 'status_cooldown');
        
        // Set initial visibility (only inactive should be visible)
        this.statusInactive.setScale(1.5);
        this.statusActive.setScale(1.5).setVisible(false);
        this.statusCooldown.setScale(1.5).setVisible(false);
        
        // Add a text label to show the unit type
        let unitLabel = '';
        switch (unitType) {
            case CONSTANTS.UNIT_TYPES.ROCK: unitLabel = 'ROCK'; break;
            case CONSTANTS.UNIT_TYPES.PAPER: unitLabel = 'PAPER'; break;
            case CONSTANTS.UNIT_TYPES.SCISSORS: unitLabel = 'SCISSORS'; break;
        }
        
        // Create a text label for the barrack
        this.unitTypeText = scene.add.text(x, y + 50, unitLabel, {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        this.unitTypeText.setOrigin(0.5);
        
        // Add to the appropriate group in the scene
        if (player === CONSTANTS.PLAYER_1) {
            scene.player1Barracks.add(this);
        } else {
            scene.player2Barracks.add(this);
        }
    }
    
    getFrameForUnitType() {
        switch (this.unitType) {
            case CONSTANTS.UNIT_TYPES.ROCK:
                return 0;
            case CONSTANTS.UNIT_TYPES.PAPER:
                return 1;
            case CONSTANTS.UNIT_TYPES.SCISSORS:
                return 2;
            default:
                return 0;
        }
    }
    
    updateStatusIndicator() {
        // Hide all indicators first
        this.statusInactive.setVisible(false);
        this.statusActive.setVisible(false);
        this.statusCooldown.setVisible(false);
        
        // Show the appropriate indicator
        if (this.cooldown > 0) {
            this.statusCooldown.setVisible(true);
        } else if (this.active) {
            this.statusActive.setVisible(true);
        } else {
            this.statusInactive.setVisible(true);
        }
    }
    
    update(time, delta) {
        // Update cooldown timer
        if (this.cooldown > 0) {
            this.cooldown -= delta;
            if (this.cooldown <= 0) {
                this.cooldown = 0;
                this.updateStatusIndicator(); // Update status display
            }
        }
    }
    
    toggleBarrack() {
        // If on cooldown, can't toggle
        if (this.cooldown > 0) {
            return;
        }
        
        const playerData = gameState.playerData[this.player];
        
        if (this.active) {
            // Deactivate the barrack
            this.active = false;
            playerData.activeBarracks--;
            
            // Stop unit production
            if (this.unitTimer) {
                this.unitTimer.remove();
                this.unitTimer = null;
            }
            
            // Set cooldown
            this.cooldown = CONSTANTS.BARRACK_COOLDOWN;
            this.updateStatusIndicator(); // Update status display
        } else {
            // Can't activate if already at max active barracks
            if (playerData.activeBarracks >= CONSTANTS.MAX_ACTIVE_BARRACKS) {
                return;
            }
            
            // Activate the barrack
            this.active = true;
            playerData.activeBarracks++;
            this.updateStatusIndicator(); // Update status display
            
            // Start unit production
            this.startUnitProduction();
            
            // Set cooldown
            this.cooldown = CONSTANTS.BARRACK_COOLDOWN;
        }
    }
    
    startUnitProduction() {
        // Determine the unit generation rate based on whether Flooder is active
        const generationRate = gameState.playerData[this.player].flooderActive ? 
            CONSTANTS.FLOODER_GENERATION_RATE : 
            CONSTANTS.UNIT_GENERATION_RATE;
        
        // Create a timer to produce units
        this.unitTimer = this.scene.time.addEvent({
            delay: generationRate,
            callback: this.produceUnit,
            callbackScope: this,
            loop: true
        });
    }
    
    updateProductionRate() {
        // If the barrack is active, update the production rate
        if (this.active && this.unitTimer) {
            // Stop the current timer
            this.unitTimer.remove();
            
            // Start a new timer with the updated rate
            this.startUnitProduction();
        }
    }
    
    produceUnit() {
        // If the barrack is not active, don't produce a unit
        if (!this.active) {
            return;
        }
        
        // Determine the spawn position based on the player
        let spawnX, spawnY;
        
        if (this.player === CONSTANTS.PLAYER_1) {
            spawnX = this.x + 50;
            spawnY = this.y;
        } else {
            spawnX = this.x - 50;
            spawnY = this.y;
        }
        
        // Log unit creation details
        console.log(`Creating unit: type=${this.unitType}, player=${this.player}, position=(${spawnX}, ${spawnY})`);
        
        // Create a new unit
        new Unit(this.scene, spawnX, spawnY, this.unitType, this.player);
        
        // Audio is disabled, so we don't play unit spawn sound
    }
}
