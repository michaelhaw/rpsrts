class Castle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'castle');
        
        // Add this castle to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // true makes it a static body
        
        // Set castle properties
        this.player = player; // player1 or player2
        
        // Set collision properties
        this.body.setSize(this.width * 0.8, this.height * 0.8);
        
        // Flip the sprite if it's player 2's castle
        if (player === CONSTANTS.PLAYER_2) {
            this.flipX = true;
        }
        
        // Store the castle in the scene for easy access
        if (player === CONSTANTS.PLAYER_1) {
            scene.player1Castle = this;
        } else {
            scene.player2Castle = this;
        }
    }
    
    // Called when a unit reaches the castle
    onUnitReached(unit) {
        // If the unit belongs to the enemy, the game is over
        if (unit.player !== this.player) {
            // Determine the winner
            const winner = unit.player;
            
            // Trigger the game over event
            this.scene.events.emit('gameOver', winner);
        }
    }
}
