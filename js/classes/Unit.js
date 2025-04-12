class Unit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, player) {
        super(scene, x, y, type);
        
        // Add this unit to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set unit properties
        this.type = type; // rock, paper, or scissors
        this.player = player; // player1 or player2
        console.log(`Unit created: type=${type}, player=${player}, position=(${x}, ${y})`);
        this.hp = CONSTANTS.UNIT_HP;
        this.setScale(0.5);
        
        // Set collision properties
        this.setCollideWorldBounds(true);
        this.body.setSize(this.width * 0.7, this.height * 0.7);
        
        // Set the unit's direction based on the player
        this.direction = (player === CONSTANTS.PLAYER_1) ? 1 : -1;
        
        // Set the unit's velocity
        this.setVelocityX(CONSTANTS.UNIT_SPEED * this.direction);
        
        // Add to the appropriate group in the scene
        if (player === CONSTANTS.PLAYER_1) {
            scene.player1Units.add(this);
        } else {
            scene.player2Units.add(this);
        }
        
        // Don't try to play animations since we're using simple shapes
        // Instead, we'll just set the frame directly if needed
        this.anims.isPlaying = false; // Prevent animation system from trying to update
        
        // Flip the sprite if it's player 2's unit
        if (player === CONSTANTS.PLAYER_2) {
            this.flipX = true;
        }
    }
    
    update() {
        // If the unit is dead, destroy it
        if (this.hp <= 0) {
            this.destroy();
            return;
        }
        
        // Get reference to the enemy barracks line position
        const enemyBarracksX = (this.player === CONSTANTS.PLAYER_1) ? 
            this.scene.cameras.main.width - 250 : // Player 2 barracks X position
            250; // Player 1 barracks X position
        
        // Check if the unit has passed the enemy barracks line
        const hasPassed = (this.player === CONSTANTS.PLAYER_1) ? 
            this.x > enemyBarracksX : 
            this.x < enemyBarracksX;
        
        // If the unit has passed the enemy barracks, go straight for the castle
        if (hasPassed) {
            this.targetEnemyCastle();
        } else {
            // If the unit hasn't passed the barracks yet, use the original targeting logic
            this.targetNearestEnemy();
        }
    }
    
    // Target the nearest enemy that is closest to our castle and hasn't passed our barracks
    targetNearestEnemy() {
        // Find the nearest enemy unit
        const enemyUnits = (this.player === CONSTANTS.PLAYER_1) ? 
            this.scene.player2Units.getChildren() : 
            this.scene.player1Units.getChildren();
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        // Get our barracks line position
        const ourBarracksX = (this.player === CONSTANTS.PLAYER_1) ? 
            250 : // Player 1 barracks X position
            this.scene.cameras.main.width - 250; // Player 2 barracks X position
        
        // Find the enemy unit that is closest to our castle AND hasn't passed our barracks
        const alliedCastle = (this.player === CONSTANTS.PLAYER_1) ? 
            this.scene.player1Castle : 
            this.scene.player2Castle;
            
        for (const enemy of enemyUnits) {
            // Check if the enemy has passed our barracks line
            const enemyPassedOurBarracks = (this.player === CONSTANTS.PLAYER_1) ? 
                enemy.x < ourBarracksX : // For player 1, enemy passed if they're to the left of our barracks
                enemy.x > ourBarracksX;  // For player 2, enemy passed if they're to the right of our barracks
            
            // Skip this enemy if they've already passed our barracks
            if (enemyPassedOurBarracks) {
                continue;
            }
            
            const distanceToAlliedCastle = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                alliedCastle.x, alliedCastle.y
            );
            
            if (distanceToAlliedCastle < nearestDistance) {
                nearestDistance = distanceToAlliedCastle;
                nearestEnemy = enemy;
            }
        }
        
        // If there's a nearest valid enemy, move towards it
        if (nearestEnemy) {
            this.moveTowards(nearestEnemy.x, nearestEnemy.y);
        } else {
            // If no valid enemies, move towards the enemy castle
            this.targetEnemyCastle();
        }
    }
    
    // Target the enemy castle directly
    targetEnemyCastle() {
        const enemyCastle = (this.player === CONSTANTS.PLAYER_1) ? 
            this.scene.player2Castle : 
            this.scene.player1Castle;
        
        this.moveTowards(enemyCastle.x, enemyCastle.y);
    }
    
    // Helper method to move towards a target position
    moveTowards(targetX, targetY) {
        // Calculate direction to the target
        const directionX = targetX - this.x;
        const directionY = targetY - this.y;
        
        // Normalize the direction vector
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / length;
        const normalizedY = directionY / length;
        
        // Set the velocity based on the direction
        this.setVelocity(
            normalizedX * CONSTANTS.UNIT_SPEED,
            normalizedY * CONSTANTS.UNIT_SPEED
        );
        
        // Flip the sprite based on movement direction
        if (this.player === CONSTANTS.PLAYER_1) {
            this.flipX = (normalizedX < 0);
        } else {
            this.flipX = (normalizedX > 0);
        }
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        
        // Flash the unit red when taking damage
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        // If the unit is dead, destroy it
        if (this.hp <= 0) {
            // Audio is disabled, so we don't play death sound
            this.destroy();
        }
    }
    
    // Check if this unit has an advantage over the target unit
    hasAdvantageOver(targetUnit) {
        const advantageMap = gameState.advantageFlipped ? 
            CONSTANTS.FLIPPED_ADVANTAGE : 
            CONSTANTS.ADVANTAGE;
            
        return advantageMap[this.type] === targetUnit.type;
    }
    
    // Calculate the damage this unit deals to the target unit
    calculateDamage(targetUnit) {
        return this.hasAdvantageOver(targetUnit) ? 
            CONSTANTS.UNIT_ADVANTAGE_DAMAGE : 
            CONSTANTS.UNIT_NORMAL_DAMAGE;
    }
}
