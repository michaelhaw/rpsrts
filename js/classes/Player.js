class Player {
    constructor(scene, playerId) {
        this.scene = scene;
        this.playerId = playerId; // player1 or player2
        this.coins = 0;
        
        // Reference to the player data in the global game state
        this.data = gameState.playerData[playerId];
        
        // Power-up cooldown timers
        this.reverserCooldownTimer = null;
        this.flooderCooldownTimer = null;
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.data.coins = this.coins;
        
        // Update the UI
        this.scene.events.emit('updateCoins', this.playerId, this.coins);
    }
    
    useReverserPowerup() {
        // Check if the player has enough coins and the powerup is not on cooldown
        if (this.coins >= CONSTANTS.POWERUPS.REVERSER.COST && 
            this.data.powerupCooldowns.reverser <= 0) {
            
            // Deduct the cost
            this.coins -= CONSTANTS.POWERUPS.REVERSER.COST;
            this.data.coins = this.coins;
            
            // Update the UI
            this.scene.events.emit('updateCoins', this.playerId, this.coins);
            
            // Activate the powerup
            gameState.advantageFlipped = true;
            
            // Set the duration timer
            this.scene.time.delayedCall(CONSTANTS.POWERUPS.REVERSER.DURATION, () => {
                gameState.advantageFlipped = false;
            });
            
            // Set the cooldown
            this.data.powerupCooldowns.reverser = CONSTANTS.POWERUPS.REVERSER.COOLDOWN;
            
            // Update the UI
            this.scene.events.emit('updatePowerupCooldown', this.playerId, 'reverser', this.data.powerupCooldowns.reverser);
            
            // Start the cooldown timer
            if (this.reverserCooldownTimer) {
                this.reverserCooldownTimer.remove();
            }
            
            this.reverserCooldownTimer = this.scene.time.addEvent({
                delay: 1000, // Update every second
                callback: () => {
                    this.data.powerupCooldowns.reverser -= 1000;
                    if (this.data.powerupCooldowns.reverser <= 0) {
                        this.data.powerupCooldowns.reverser = 0;
                        this.reverserCooldownTimer.remove();
                        this.reverserCooldownTimer = null;
                    }
                    
                    // Update the UI
                    this.scene.events.emit('updatePowerupCooldown', this.playerId, 'reverser', this.data.powerupCooldowns.reverser);
                },
                callbackScope: this,
                repeat: CONSTANTS.POWERUPS.REVERSER.COOLDOWN / 1000 - 1
            });
            
            return true;
        }
        
        return false;
    }
    
    useFlooderPowerup() {
        // Check if the player has enough coins and the powerup is not on cooldown
        if (this.coins >= CONSTANTS.POWERUPS.FLOODER.COST && 
            this.data.powerupCooldowns.flooder <= 0) {
            
            // Deduct the cost
            this.coins -= CONSTANTS.POWERUPS.FLOODER.COST;
            this.data.coins = this.coins;
            
            // Update the UI
            this.scene.events.emit('updateCoins', this.playerId, this.coins);
            
            // Activate the powerup
            this.data.flooderActive = true;
            
            // Update production rates for all active barracks
            const barracks = (this.playerId === CONSTANTS.PLAYER_1) ? 
                this.scene.player1Barracks.getChildren() : 
                this.scene.player2Barracks.getChildren();
                
            barracks.forEach(barrack => {
                barrack.updateProductionRate();
            });
            
            // Set the duration timer
            this.scene.time.delayedCall(CONSTANTS.POWERUPS.FLOODER.DURATION, () => {
                this.data.flooderActive = false;
                
                // Update production rates for all active barracks
                barracks.forEach(barrack => {
                    barrack.updateProductionRate();
                });
            });
            
            // Set the cooldown
            this.data.powerupCooldowns.flooder = CONSTANTS.POWERUPS.FLOODER.COOLDOWN;
            
            // Update the UI
            this.scene.events.emit('updatePowerupCooldown', this.playerId, 'flooder', this.data.powerupCooldowns.flooder);
            
            // Start the cooldown timer
            if (this.flooderCooldownTimer) {
                this.flooderCooldownTimer.remove();
            }
            
            this.flooderCooldownTimer = this.scene.time.addEvent({
                delay: 1000, // Update every second
                callback: () => {
                    this.data.powerupCooldowns.flooder -= 1000;
                    if (this.data.powerupCooldowns.flooder <= 0) {
                        this.data.powerupCooldowns.flooder = 0;
                        this.flooderCooldownTimer.remove();
                        this.flooderCooldownTimer = null;
                    }
                    
                    // Update the UI
                    this.scene.events.emit('updatePowerupCooldown', this.playerId, 'flooder', this.data.powerupCooldowns.flooder);
                },
                callbackScope: this,
                repeat: CONSTANTS.POWERUPS.FLOODER.COOLDOWN / 1000 - 1
            });
            
            return true;
        }
        
        return false;
    }
}
