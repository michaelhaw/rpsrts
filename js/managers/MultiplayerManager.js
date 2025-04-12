class MultiplayerManager {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.gameScene = null;
        this.connected = false;
        this.gameStarted = false;
        this.messageQueue = [];
        this.eventListeners = new Map();
    }

    connect() {
        // Connect to the WebSocket server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const port = isProduction ? '' : ':3000';
        const wsUrl = `${protocol}//${window.location.hostname}${port}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to server');
            this.connected = true;
            this.emit('connected');
            
            // Send any queued messages
            while (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.send(msg);
            }
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.emit('disconnected');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'init':
                this.playerId = data.playerId;
                this.emit('playerAssigned', data.playerId);
                break;

            case 'waiting':
                this.emit('waiting');
                break;

            case 'gameStart':
                this.gameStarted = true;
                window.resetGameState(); // Reset game state when starting new game
                this.emit('gameStart');
                break;

            case 'gameAction':
                const { action } = data;
                switch (action.type) {
                    case 'toggleBarrack':
                        this.emit('toggleBarrack', action.barrackId);
                        break;
                    case 'usePowerup':
                        this.emit('usePowerup', action.powerupType);
                        break;
                    case 'unitKilled':
                        this.emit('unitKilled', action.killedBy);
                        break;
                    case 'gameOver':
                        this.emit('gameOver', action.winner);
                        break;
                }
                break;

            case 'opponentDisconnected':
                this.emit('opponentDisconnected');
                this.gameStarted = false;
                break;

            case 'error':
                this.emit('error', data.message);
                break;
        }
    }

    send(data) {
        if (!this.connected) {
            this.messageQueue.push(data);
            return;
        }

        try {
            this.ws.send(JSON.stringify(data));
        } catch (e) {
            console.error('Error sending message:', e);
        }
    }

    // Game-specific action methods
    toggleBarrack(barrackId) {
        this.sendGameAction({
            type: 'toggleBarrack',
            barrackId
        });
    }

    usePowerup(powerupType) {
        this.sendGameAction({
            type: 'usePowerup',
            powerupType
        });
    }

    reportUnitKilled(killedBy) {
        this.sendGameAction({
            type: 'unitKilled',
            killedBy
        });
    }

    reportGameOver(winner) {
        this.sendGameAction({
            type: 'gameOver',
            winner
        });
    }

    sendGameAction(action) {
        this.send({
            type: 'gameAction',
            action
        });
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

    isPlayer1() {
        return this.playerId === 'player1';
    }

    isPlayer2() {
        return this.playerId === 'player2';
    }

    isMyTurn() {
        return this.gameStarted; // Both players can act simultaneously
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Create a singleton instance
const multiplayerManager = new MultiplayerManager();
