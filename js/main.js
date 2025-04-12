// Main game configuration
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        UIScene
    ]
};

// Initialize multiplayer manager
window.multiplayerManager = new MultiplayerManager();

// Create the game instance
const game = new Phaser.Game(config);

// Global game state
let gameState = {
    advantageFlipped: false,
    playerData: {
        player1: {
            coins: 15, // Start with 15 coins
            activeBarracks: 0,
            powerupCooldowns: {
                reverser: 0,
                flooder: 0
            },
            flooderActive: false
        },
        player2: {
            coins: 15, // Start with 15 coins
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
window.resetGameState = () => {
    gameState.advantageFlipped = false;
    gameState.playerData.player1.coins = 15;
    gameState.playerData.player1.activeBarracks = 0;
    gameState.playerData.player1.powerupCooldowns.reverser = 0;
    gameState.playerData.player1.powerupCooldowns.flooder = 0;
    gameState.playerData.player1.flooderActive = false;
    
    gameState.playerData.player2.coins = 15;
    gameState.playerData.player2.activeBarracks = 0;
    gameState.playerData.player2.powerupCooldowns.reverser = 0;
    gameState.playerData.player2.powerupCooldowns.flooder = 0;
    gameState.playerData.player2.flooderActive = false;
};
