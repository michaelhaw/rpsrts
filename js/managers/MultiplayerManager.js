class MultiplayerManager {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.isInitialized = false;
        this.gameStarted = false;
        this.opponentDisconnected = false;
        this.side = null; // 'left' or 'right'
        this.opponentSide = null; // 'right' or 'left'

        // Set up event listeners for game actions
        this.setupEventListeners();
    }

    connect() {
        // Connect to the WebSocket server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const port = isProduction ? '' : ':3000';
        const wsUrl = `${protocol}//${window.location.hostname}${port}`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            this.isInitialized = true;
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
            this.opponentDisconnected = true;
            this.gameStarted = false;
            this.isInitialized = false;
            this.side = null;
            this.opponentSide = null;
            this.emit('disconnected');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    // Check if player can control a specific side
    canControl(side) {
        return this.side === side;
    }

    handleMessage(data) {
        if (!this.isInitialized) return;

        switch (data.type) {
            case 'init':
                this.playerId = data.playerId;
                // Assign sides based on player ID
                this.side = data.playerId === 'player1' ? 'left' : 'right';
                this.opponentSide = this.side === 'left' ? 'right' : 'left';
                this.emit('playerAssigned', {
                    playerId: this.playerId,
                    side: this.side,
                    opponentSide: this.opponentSide
                });
                break;

            case 'waiting':
                this.emit('waitingForPlayer');
                break;

            case 'gameStart':
                this.gameStarted = true;
                this.emit('gameStart');
                break;

            case 'gameAction':
                if (this.gameStarted) {
                    // Only process actions if they're from our side
                    if (data.action.side === this.side) {
                        this.emit('gameAction', data.action);
                    }
                }
                break;

            case 'opponentDisconnected':
                this.opponentDisconnected = true;
                this.gameStarted = false;
                this.emit('opponentDisconnected');
                break;

            default:
                console.log('Unknown message type:', data.type);
                break;
        }
    }

    // Game action methods
    toggleBarrack(barrackId) {
        if (!this.gameStarted || !this.canControl(this.side)) return;
        
        this.ws.send(JSON.stringify({
            type: 'gameAction',
            action: {
                type: 'toggleBarrack',
                side: this.side,
                barrackId
            }
        }));
    }

    usePowerup(powerupType) {
        if (!this.gameStarted || !this.canControl(this.side)) return;
        
        this.ws.send(JSON.stringify({
            type: 'gameAction',
            action: {
                type: 'usePowerup',
                side: this.side,
                powerupType
            }
        }));
    }

    reportUnitKilled(killedBy) {
        if (!this.gameStarted) return;
        
        this.ws.send(JSON.stringify({
            type: 'gameAction',
            action: {
                type: 'unitKilled',
                side: killedBy === this.side ? this.opponentSide : this.side
            }
        }));
    }

    reportGameOver(winner) {
        if (!this.gameStarted) return;
        
        this.ws.send(JSON.stringify({
            type: 'gameAction',
            action: {
                type: 'gameOver',
                winner
            }
        }));
    }

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }

    setupEventListeners() {
        this.eventListeners = new Map();
    }
}

// Create a singleton instance
const multiplayerManager = new MultiplayerManager();
