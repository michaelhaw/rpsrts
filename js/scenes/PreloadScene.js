class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();

        // Load game assets
        this.loadAssets();
    }

    createLoadingBar() {
        // Add loading background
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'loading_background');

        // Create loading bar container
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 - 25, 320, 50);

        // Loading text
        const loadingText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Percentage text
        const percentText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Loading event handlers
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    loadAssets() {
        // Create placeholder graphics instead of loading external assets
        this.createPlaceholderGraphics();
        
        // Set up a global audio disabled flag
        window.AUDIO_DISABLED = true;
    }
    
    createPlaceholderGraphics() {
        // Create background
        const bgTexture = this.generateTexture('background', 1280, 720, (ctx) => {
            ctx.fillStyle = '#4a6d8c';
            ctx.fillRect(0, 0, 1280, 720);
            
            // Add some simple decorations
            ctx.fillStyle = '#3c5a75';
            for (let i = 0; i < 50; i++) {
                const x = Math.random() * 1280;
                const y = Math.random() * 720;
                const size = 5 + Math.random() * 15;
                ctx.fillRect(x, y, size, size);
            }
        });
        
        // Create castle
        const castleTexture = this.generateTexture('castle', 128, 128, (ctx) => {
            // Main castle body
            ctx.fillStyle = '#555555';
            ctx.fillRect(24, 48, 80, 80);
            
            // Castle towers
            ctx.fillStyle = '#333333';
            ctx.fillRect(14, 38, 20, 30);
            ctx.fillRect(94, 38, 20, 30);
            
            // Castle door
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(54, 88, 20, 40);
            
            // Castle windows
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(34, 68, 10, 10);
            ctx.fillRect(84, 68, 10, 10);
            
            // Castle flags
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(14, 18, 15, 10);
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(94, 18, 15, 10);
        });
        
        // Create individual barrack sprites for each type
        // Rock barrack (red)
        this.generateTexture('barrack_rock', 128, 128, (ctx) => {
            ctx.fillStyle = '#8B0000';
            ctx.fillRect(24, 48, 80, 60);
            ctx.fillStyle = '#A52A2A';
            ctx.fillRect(44, 108, 40, 20);
            ctx.fillStyle = '#D2691E';
            ctx.fillRect(54, 78, 20, 30);
        });
        
        // Paper barrack (green)
        this.generateTexture('barrack_paper', 128, 128, (ctx) => {
            ctx.fillStyle = '#006400';
            ctx.fillRect(24, 48, 80, 60);
            ctx.fillStyle = '#228B22';
            ctx.fillRect(44, 108, 40, 20);
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(54, 78, 20, 30);
        });
        
        // Scissors barrack (blue)
        this.generateTexture('barrack_scissors', 128, 128, (ctx) => {
            ctx.fillStyle = '#00008B';
            ctx.fillRect(24, 48, 80, 60);
            ctx.fillStyle = '#0000CD';
            ctx.fillRect(44, 108, 40, 20);
            ctx.fillStyle = '#1E90FF';
            ctx.fillRect(54, 78, 20, 30);
        });
        
        // Create separate status indicator sprites for each state
        // Inactive state (gray)
        this.generateTexture('status_inactive', 32, 32, (ctx) => {
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Active state (green)
        this.generateTexture('status_active', 32, 32, (ctx) => {
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Cooldown state (red)
        this.generateTexture('status_cooldown', 32, 32, (ctx) => {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(16 + 64, 16, 12, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Create unit spritesheets
        this.createUnitSpritesheet('rock', '#FF0000'); // Red for rock
        this.createUnitSpritesheet('paper', '#00FF00'); // Green for paper
        this.createUnitSpritesheet('scissors', '#0000FF'); // Blue for scissors
        
        // Create UI elements
        this.generateTexture('button', 100, 40, (ctx) => {
            ctx.fillStyle = '#444444';
            ctx.fillRect(0, 0, 100, 40);
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, 96, 36);
        });
        
        this.generateTexture('button_pressed', 100, 40, (ctx) => {
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, 100, 40);
            ctx.strokeStyle = '#666666';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, 96, 36);
        });
        
        this.generateTexture('coin', 32, 32, (ctx) => {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        this.generateTexture('reverser_icon', 32, 32, (ctx) => {
            ctx.fillStyle = '#9932CC';
            ctx.beginPath();
            ctx.moveTo(16, 4);
            ctx.lineTo(28, 16);
            ctx.lineTo(16, 28);
            ctx.lineTo(4, 16);
            ctx.closePath();
            ctx.fill();
            
            // Add arrows to indicate reversal
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(10, 12);
            ctx.lineTo(22, 12);
            ctx.lineTo(18, 8);
            ctx.moveTo(22, 20);
            ctx.lineTo(10, 20);
            ctx.lineTo(14, 24);
            ctx.stroke();
        });
        
        this.generateTexture('flooder_icon', 32, 32, (ctx) => {
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.arc(16, 16, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Add wave pattern to indicate flooding
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(8, 16);
            ctx.quadraticCurveTo(12, 12, 16, 16);
            ctx.quadraticCurveTo(20, 20, 24, 16);
            ctx.stroke();
        });
        
        // Create loading screen assets
        this.generateTexture('loading_background', 800, 600, (ctx) => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 800, 600);
        });
        
        this.generateTexture('loading_bar', 400, 40, (ctx) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 400, 40);
        });
        
        // Create dummy audio files
        this.createDummyAudio();
    }
    
    createUnitSpritesheet(type, color) {
        // Instead of creating a complex spritesheet with multiple frames,
        // we'll create a simple texture with just one frame
        this.generateTexture(type, 64, 64, (ctx) => {
            // Base shape
            ctx.fillStyle = color;
            
            if (type === 'rock') {
                // Draw a circle for rock
                ctx.beginPath();
                ctx.arc(32, 32, 20, 0, Math.PI * 2);
                ctx.fill();
                
                // Add some texture
                ctx.fillStyle = this.shadeColor(color, -20);
                ctx.beginPath();
                ctx.arc(28, 28, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(38, 36, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'paper') {
                // Draw a square for paper
                ctx.fillRect(12, 12, 40, 40);
                
                // Add some texture
                ctx.fillStyle = this.shadeColor(color, -20);
                ctx.fillRect(18, 18, 28, 4);
                ctx.fillRect(18, 26, 28, 4);
                ctx.fillRect(18, 34, 28, 4);
            } else if (type === 'scissors') {
                // Draw scissors shape
                ctx.beginPath();
                ctx.moveTo(22, 12);
                ctx.lineTo(42, 32);
                ctx.lineTo(22, 52);
                ctx.lineTo(22, 12);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(42, 12);
                ctx.lineTo(22, 32);
                ctx.lineTo(42, 52);
                ctx.lineTo(42, 12);
                ctx.fill();
            }
            
            // Add a border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            if (type === 'rock') {
                ctx.beginPath();
                ctx.arc(32, 32, 22, 0, Math.PI * 2);
                ctx.stroke();
            } else if (type === 'paper') {
                ctx.strokeRect(10, 10, 44, 44);
            } else if (type === 'scissors') {
                ctx.beginPath();
                ctx.moveTo(22, 12);
                ctx.lineTo(42, 32);
                ctx.lineTo(22, 52);
                ctx.lineTo(22, 12);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(42, 12);
                ctx.lineTo(22, 32);
                ctx.lineTo(42, 52);
                ctx.lineTo(42, 12);
                ctx.stroke();
            }
        });
        
        // Tell Phaser this texture has a single frame (for animation purposes)
        this.textures.get(type).add(0, 0, 0, 0, 64, 64);
        console.log(`Created single-frame texture for ${type}`);
    }
    
    createDummyAudio() {
        // Instead of trying to load audio, we'll just set up dummy functions
        // that will be used throughout the game
        console.log('Audio disabled for this game version');
        
        // Create dummy sound object that can be used throughout the game
        window.dummySound = {
            play: () => {},
            stop: () => {},
            isPlaying: false
        };
    }
    
    // Helper function to generate textures
    generateTexture(key, width, height, renderFunction) {
        const graphics = this.add.graphics();
        const renderTexture = this.textures.createCanvas(key, width, height);
        const canvas = renderTexture.getSourceImage();
        const ctx = canvas.getContext('2d');
        
        renderFunction(ctx);
        renderTexture.refresh();
        
        graphics.destroy();
        return renderTexture;
    }
    
    // Helper function to shade a color
    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;  
        G = (G < 255) ? G : 255;  
        B = (B < 255) ? B : 255;  

        const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));

        return '#' + RR + GG + BB;
    }

    create() {
        // Create animations
        this.createAnimations();
        
        // Proceed to the main menu scene
        this.scene.start('MainMenuScene');
    }
    
    createAnimations() {
        // Since we're using simple shapes instead of proper spritesheets,
        // we'll create minimal animations with just a single frame
        // This prevents errors when trying to play animations
        
        // Create a single frame for each unit type
        const createSingleFrameAnim = (type) => {
            // Create a simple animation with just one frame
            this.anims.create({
                key: `${type}_idle`,
                frames: [{ key: type, frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
            
            this.anims.create({
                key: `${type}_walk`,
                frames: [{ key: type, frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
            
            this.anims.create({
                key: `${type}_attack`,
                frames: [{ key: type, frame: 0 }],
                frameRate: 1,
                repeat: 0
            });
        };
        
        // Create animations for each unit type
        createSingleFrameAnim('rock');
        createSingleFrameAnim('paper');
        createSingleFrameAnim('scissors');
        
        console.log('Simple animations created for unit types');
    }
}
