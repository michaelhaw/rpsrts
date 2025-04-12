# Rock Paper Scissors RTS Game

A real-time strategy game based on the classic Rock-Paper-Scissors mechanic.

## Game Overview

- 1v1 RTS game with 2 sides
- Each player has a base with a castle and 3 barracks
- Units: Rock, Paper, Scissors (RPS)
- Combat: Rock beats Scissors, Scissors beats Paper, Paper beats Rock
- Units have 2 HP, deal 1 damage normally, 2 damage when advantageous
- Units target nearest enemy unit closest to allied castle
- Barracks toggle on/off (1 unit/sec), 3-sec cooldown, max 2 active barracks
- Win condition: unit reaches enemy castle
- Economy: 1 coin/sec auto-increment
- Power-ups:
  1. Reverser: flips advantage logic for 5 sec, costs 10 coins, 20-sec cooldown
  2. Flooder: increases unit gen to 2 units/sec for 5 sec, costs 15 coins, 10-sec cooldown

## How to Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:8080`

## Controls

- Click on barracks to toggle unit production
- Click on power-up buttons to activate special abilities

## Technologies Used

- Phaser 3 - HTML5 Game Framework
- JavaScript
