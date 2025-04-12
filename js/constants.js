// Game constants
const CONSTANTS = {
    // Game dimensions
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,
    
    // Unit types
    UNIT_TYPES: {
        ROCK: 'rock',
        PAPER: 'paper',
        SCISSORS: 'scissors'
    },
    
    // Unit properties
    UNIT_HP: 2,
    UNIT_NORMAL_DAMAGE: 1,
    UNIT_ADVANTAGE_DAMAGE: 2,
    UNIT_SPEED: 100,
    
    // Players
    PLAYER_1: 'player1',
    PLAYER_2: 'player2',
    
    // Building properties
    BARRACK_COOLDOWN: 3000, // 3 seconds in ms
    MAX_ACTIVE_BARRACKS: 2,
    UNIT_GENERATION_RATE: 1000, // 1 unit per second
    FLOODER_GENERATION_RATE: 500, // 2 units per second
    
    // Economy
    COIN_GENERATION_RATE: 1000, // 1 coin per second
    
    // Power-ups
    POWERUPS: {
        REVERSER: {
            COST: 10,
            DURATION: 5000, // 5 seconds
            COOLDOWN: 20000 // 20 seconds
        },
        FLOODER: {
            COST: 15,
            DURATION: 5000, // 5 seconds
            COOLDOWN: 10000 // 10 seconds
        }
    },
    
    // Advantage relationships (who beats whom)
    ADVANTAGE: {
        'rock': 'scissors',
        'scissors': 'paper',
        'paper': 'rock'
    },
    
    // Flipped advantage relationships
    FLIPPED_ADVANTAGE: {
        'rock': 'paper',
        'paper': 'scissors',
        'scissors': 'rock'
    }
};
