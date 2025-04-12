const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the current directory
app.use(express.static(__dirname));

// Keep track of connected players
const players = new Map();
let waitingPlayer = null;

// Game rooms to manage active games
const gameRooms = new Map();

wss.on('connection', (ws) => {
    console.log('New player connected');

    // If we already have 2 players, reject the connection
    if (players.size >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        ws.close();
        return;
    }

    // Assign player number (1 or 2)
    const playerId = players.size === 0 ? 'player1' : 'player2';
    players.set(ws, playerId);

    // Send player their assigned ID
    ws.send(JSON.stringify({ type: 'init', playerId }));

    // If this is player 1, wait for player 2
    if (playerId === 'player1') {
        waitingPlayer = ws;
        ws.send(JSON.stringify({ type: 'waiting' }));
    } else {
        // This is player 2, start the game
        const player1 = waitingPlayer;
        const player2 = ws;

        // Notify both players that the game is starting
        player1.send(JSON.stringify({ type: 'gameStart' }));
        player2.send(JSON.stringify({ type: 'gameStart' }));

        // Create a new game room
        const roomId = Date.now().toString();
        gameRooms.set(roomId, { player1, player2 });
    }

    // Handle messages from clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // Find the game room and opponent
            let gameRoom, opponent;
            for (const [roomId, room] of gameRooms) {
                if (room.player1 === ws) {
                    gameRoom = room;
                    opponent = room.player2;
                    break;
                } else if (room.player2 === ws) {
                    gameRoom = room;
                    opponent = room.player1;
                    break;
                }
            }

            if (!opponent) {
                console.log('No opponent found for player');
                return;
            }

            // Handle game actions
            if (data.type === 'gameAction') {
                const { action } = data;
                
                switch (action.type) {
                    case 'toggleBarrack':
                    case 'usePowerup':
                        // Forward these actions directly to opponent
                        opponent.send(JSON.stringify(data));
                        break;

                    case 'unitKilled':
                        // Award a coin to the killer
                        opponent.send(JSON.stringify(data));
                        break;

                    case 'gameOver':
                        // End the game and notify both players
                        const winMessage = JSON.stringify({
                            type: 'gameAction',
                            action: {
                                type: 'gameOver',
                                winner: players.get(ws)
                            }
                        });
                        ws.send(winMessage);
                        opponent.send(winMessage);
                        break;
                }
            } else {
                // Forward other message types directly
                opponent.send(JSON.stringify(data));
            }
        } catch (e) {
            console.error('Error handling message:', e);
        }
    });

    // Handle disconnections
    ws.on('close', () => {
        const playerId = players.get(ws);
        console.log(`Player ${playerId} disconnected`);

        // Remove player from our records
        players.delete(ws);

        // If this was the waiting player, clear the waiting state
        if (ws === waitingPlayer) {
            waitingPlayer = null;
        }

        // Find and clean up any game room this player was in
        for (const [roomId, room] of gameRooms) {
            if (room.player1 === ws || room.player2 === ws) {
                const opponent = room.player1 === ws ? room.player2 : room.player1;
                opponent.send(JSON.stringify({ type: 'opponentDisconnected' }));
                gameRooms.delete(roomId);
                break;
            }
        }
    });
});

// Set production mode
const isProduction = process.env.NODE_ENV === 'production';

// Set port and host
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || (isProduction ? '0.0.0.0' : 'localhost');

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
    console.log(`Mode: ${isProduction ? 'Production' : 'Development'}`);
});
