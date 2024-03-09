import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';

//******************************************************************** */
// GameSettings           SnakeHole
//******************************************************************** */

const GAME_VERSION = 'snakehole.v0.1.03.08.002';
export const GRID = 24;  //.................. Size of Sprites and GRID
var FRUIT = 4;           //.................. Number of fruit to spawn
export const FRUITGOAL = 3; //24 //............................. Win Condition

var SPEEDWALK = 96; // 96 In milliseconds  
var SPEEDSPRINT = 24; // 24


var SCORE_FLOOR = 24; // Floor of Fruit score as it counts down.
var BOOST_FLOOR = 80;
var SCORE_MULTI_GROWTH = 0.01;

// DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0.0;   // Between 0,1 to make portal areas appear

// Game Objects

var crunchSounds = [];

// Tilemap variables
var map;  // Phaser.Tilemaps.Tilemap 
var tileset;

//  Direction consts
export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
const START_SPRINT = 4;
const STOP_SPRINT = 5;
const STOP = 10;

var PORTAL_COLORS = [
    // This color order will be respected. TODO add Slice
    '#fc0303',
    '#06f202',
    '#e2f202',
    '#fc03f8',
    //'#AABBCC'
];

var SOUND_CRUNCH = [
    ['crunch01', [ 'crunch01.ogg', 'crunch01.mp3' ]],
    ['crunch02', [ 'crunch02.ogg', 'crunch02.mp3' ]],
    ['crunch03', [ 'crunch03.ogg', 'crunch03.mp3' ]],
    ['crunch04', [ 'crunch04.ogg', 'crunch04.mp3' ]],
    ['crunch05', [ 'crunch05.ogg', 'crunch05.mp3' ]],
    ['crunch06', [ 'crunch06.ogg', 'crunch06.mp3' ]],
    ['crunch07', [ 'crunch07.ogg', 'crunch07.mp3' ]],
    ['crunch08', [ 'crunch08.ogg', 'crunch08.mp3' ]]
];

// TODOL: Need to truncate this list based on number of portals areas.
// DO this dynamically later based on the number of portal areas.


class StartScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'StartScene', active: true});
    }
    
    preload()
    {
        this.load.image('howToCard', 'assets/howToCard.webp');
    }

    create()
    {
        
        this.add.text(SCREEN_WIDTH/2, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0); // Sets the origin to the middle top.
        
        var card = this.add.image(SCREEN_WIDTH/2, 5.5*GRID, 'howToCard').setDepth(10).setOrigin(0.5,0);
        //card.setOrigin(0,0);

        card.setScale(0.55);

        
        var continueText = this.add.text(SCREEN_WIDTH/2, GRID*25, '[PRESS TO CONTINUE]',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
          });

        this.input.keyboard.on('keydown', e => {
            this.scene.start('GameScene');
            var ourGameScene = this.scene.get("GameScene");
            this.scene.start('UIScene');
            //console.log(e)
            this.scene.stop()
        })
    }

    end()
    {

    }


}


class GameScene extends Phaser.Scene
{

    constructor ()
    {
        super({key: 'GameScene', active: false});
    }
    
    
    init()
    {
        
        // Arrays for collision detection
        this.apples = [];
        this.walls = [];
        this.portals = [];

        this.lastMoveTime = 0; // The last time we called move()

        // Sounds
        this.crunchSounds = [];

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice(); 

    }
    
    
    preload ()
    {
        this.load.image('bg01', 'assets/sprites/background01.png');
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });
        this.load.spritesheet('portals', 'assets/sprites/portalSheet.png', { frameWidth: 32, frameHeight: 32 });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/tileSheetx24.png');
        this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

        // Audio
        this.load.setPath('assets/audio');

        SOUND_CRUNCH.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
    }

    create ()
    {
        var ourInputScene = this.scene.get('InputScene');
        /////////////////////////////////////////////////
        
        // Snake needs to render immediately 
        // Create the snake the  first time so it renders immediately
        this.snake = new Snake(this, SCREEN_WIDTH/GRID/2, 6);
        this.snake.heading = STOP;
        
        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: GRID, tileHeight: GRID });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
    
        // add background
        this.add.image(0, GRID*3, 'bg01').setDepth(-1).setOrigin(0,0);

        // Audio
        SOUND_CRUNCH.forEach(soundID =>
            {
                this.crunchSounds.push(this.sound.add(soundID[0]));
            });
            
        
            // Define keys       
        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Keyboard Inputs
        this.input.keyboard.on('keydown', e => {
            ourInputScene.updateDirection(this, e);
        })

        this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
            if (DEBUG) { console.log(event.code+" unPress", this.time.now); }
            ourInputScene.inputSet.push([STOP_SPRINT, this.time.now]);
        }) 

        var makePair = function (scene, to, from){
            
            var colorHex = Phaser.Utils.Array.RemoveRandomElement(scene.portalColors); // May Error if more portals than colors.
            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, color, to, from);
            var p2 = new Portal(scene, color, from, to);
        }

        // Add all tiles to walls for collision
        this.map.forEachTile( tile => {
            // Empty tiles are indexed at -1. 
            // Any tilemap object that is not empty will be considered a wall
            // Index is the sprite value, not the array index. Normal wall is Index 4
            if (tile.index > 0) {  
                var wall = new Phaser.Geom.Point(tile.x,tile.y);
                this.walls.push(wall);
            }

        });

        // Make Fruit
        for (let index = 0; index < FRUIT; index++) {
            var food = new Food(this);
        }


        var spawnAreaA = new SpawnArea(this, 2,3,6,5, 0x6666ff);
        var spawnAreaB = new SpawnArea(this, 10,3,6,5, 0x6666ff);
        var spawnAreaC = new SpawnArea(this, 24,3,6,5, 0x6666ff);
        var spawnAreaF = new SpawnArea(this, 2,23,6,5, 0x6666ff);

        var spawnAreaG = new SpawnArea(this, 10,13,6,5, 0x6666ff);
        var spawnAreaH = new SpawnArea(this, 24,23,6,5, 0x6666ff);

        var spawnAreaJ = new SpawnArea(this, 16,13,6,5, 0x6666ff);
        var spawnAreaI = new SpawnArea(this, 16,23,6,5, 0x6666ff);





        var A1 = spawnAreaA.genPortalChords(this);
        var H1 = spawnAreaH.genPortalChords(this);

        var B1 = spawnAreaB.genPortalChords(this);
        var G1 = spawnAreaG.genPortalChords(this);

        var C1 = spawnAreaC.genPortalChords(this);
        var F1 = spawnAreaF.genPortalChords(this);

        var J1 = spawnAreaJ.genPortalChords(this);
        var I1 = spawnAreaI.genPortalChords(this);

        makePair(this, A1, H1);
        makePair(this, B1, G1);
        makePair(this, C1, F1);
        makePair(this, J1, I1);

    }

    update (time, delta) 
    {
    // console.log("update -- time=" + time + " delta=" + delta);
        if (!this.snake.alive)
            {
                
                // game.scene.scene.restart(); // This doesn't work correctly
                if (DEBUG) { console.log("DEAD"); }
                
                this.events.emit('saveScore');
                
                ourUI = this.scene.get('UIScene');
                ourUI.lives += 1;
                ourUI.livesUI.setText(ourUI.lives);

                ourUI.fruitCount = 0;
                ourUI.fruitCountUI.setText(`${ourUI.fruitCount} / ${FRUITGOAL}`);

                //game.destroy();
                this.scene.restart();
                return;
            }

        
        // Only Calculate things when snake is moved.
        if(time >= this.lastMoveTime + this.moveInterval){
            //console.log(time, this.lastMoveTime, this.moveInterval);
            this.lastMoveTime = time;
 
            // Calculate Closest Portal to Snake Head
            let closestPortal = Phaser.Math.RND.pick(this.portals); // Start with a random portal
            closestPortal.fx.setActive(false);
            
            // Distance on an x y grid

            var closestPortalDist = Phaser.Math.Distance.Between(this.snake.head.x/GRID, this.snake.head.y/GRID, 
                                                                closestPortal.x/GRID, closestPortal.y/GRID);

            this.portals.forEach( portal => {
                var dist = Phaser.Math.Distance.Between(this.snake.head.x/GRID, this.snake.head.y/GRID, 
                                                    portal.x/GRID, portal.y/GRID);

                if (dist < closestPortalDist) { // Compare and choose closer portals
                    closestPortalDist = dist;
                    closestPortal = portal;
                }
            });


            // This is a bit eccessive because I only store the target portal coordinates
            // and I need to get the portal object to turn on the effect. Probably can be optimized.
            // Good enough for testing.
            if (closestPortalDist < 6) {
                this.portals.forEach(portal => {
                    if (portal.x/GRID === closestPortal.target.x && portal.y/GRID === closestPortal.target.y) {
                        portal.fx.setActive(true);
                        
                        //portal.fx.innerStrength = 6 - closestPortalDist*0.5;
                        portal.fx.outerStrength = 6 - closestPortalDist;

                        closestPortal.fx.setActive(true);
                        closestPortal.fx.innerStrength = 3 - closestPortalDist;
                        closestPortal.fx.outerStrength = 0;

                    }
                });
            };
            
            const ourUI = this.scene.get('UIScene');
            if (ourUI.fruitCount >= FRUITGOAL) { // not winning instantly
                console.log("YOU WIN");

                ourUI.currentScore.setText(`Score: ${ourUI.score}`);
                
                this.events.emit('saveScore');
                this.scene.pause();
                this.scene.start('WinScene');
            }
       
            if (DEBUG) {
                const ourUI = this.scene.get('UIScene');
                var timeTick = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
                if (timeTick < SCORE_FLOOR ) {
                    
                } else {
                    this.apples.forEach( fruit => {
                        fruit.fruitTimerText.setText(timeTick);
                    });
                }
                
            } 
            
            // Move at last second
            this.snake.move(this);
        }
        
        // Boost and Boot Multi Code
        var ourUI = this.scene.get('UIScene'); // Probably don't need to set this every loop. Consider adding to a larger context.
        var timeLeft = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10; // VERY INEFFICIENT WAY TO DO THIS

        if (!this.spaceBar.isDown){
            this.moveInterval = SPEEDWALK;} // Less is Faster
        else{
            this.moveInterval = SPEEDSPRINT; // Sprinting now 
            if (timeLeft >= BOOST_FLOOR ) { 
                // Don't add boost multi after 20 seconds
                ourUI.scoreMulti += SCORE_MULTI_GROWTH;
                //console.log(Math.sqrt(ourUI.scoreMulti));
            } else {
            }
        }
        if (timeLeft <= BOOST_FLOOR && timeLeft >= SCORE_FLOOR) {
            // Boost meter slowly drains after boost floor and before score floor
            ourUI.scoreMulti += SCORE_MULTI_GROWTH * -0.5;
            //console.log(ourUI.scoreMulti);
        }
    }
}

class WinScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'WinScene', active: false});
    }

    preload()
    {
    }

    create()
    {
        
        const ourUI = this.scene.get('UIScene');
        const ourInputScene = this.scene.get('InputScene');
        const ourWinScene = this.scene.get('WinScene');
        const ourGame = this.scene.get("GameScene");

        const scoreScreenStyle = {
            width: '440px',
            //height: '22px',
            color: 'white',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '2px 0px 2px 12px',
            'font-weight': 'bold',
            //'border-radius': '24px',
            outline: 'solid',
        }
        ///////
        
        this.add.text(SCREEN_WIDTH/2, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        //var card = this.add.image(5*GRID, 5*GRID, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);
        
        var scoreScreen = this.add.dom(SCREEN_WIDTH/2, GRID * 7.5, 'div', scoreScreenStyle);
        scoreScreen.setOrigin(0.5,0);

        
        
        scoreScreen.setText(
        ` 
        /************ WINNING SCORE **************/
        SCORE: ${ourUI.bestScore}
        TURNS: ${ourInputScene.turns}

        ................RUN STATS..................
        Lives: ${ourUI.lives}
        TOTAL TIME: ${Math.round(ourInputScene.time.now/1000)} Seconds
        TOTAL FRUIT COLLECTED:  ${ourUI.globalFruitCount}
        `);

        //card.setScale(0.7);

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continueText = this.add.text(SCREEN_WIDTH/2, GRID*25,'', {"fontSize":'48px'});
            continueText.setText('[PRESS TO CONTINUE]').setOrigin(0.5,0);

            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });
            
            this.input.keyboard.on('keydown', function() {

                // Event listeners need to be removed manually
                // Better if possible to do this as part of UIScene clean up
                // As the event is defined there
                ourGame.events.off('addScore');
                ourGame.events.off('saveScore');
            
                
                ourInputScene.scene.restart();
                ourUI.scene.restart();
                ourGame.scene.restart();

                ourWinScene.scene.switch('GameScene');

            });
        }, [], this);
    }

    end()
    {

    }

}

class UIScene extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'UIScene', active: false });
    }
    
    init()
    {
        this.score = 0;
        this.bestScore = 0;
        this.fruitCount = 0;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
        this.lives = 1;
    }

    create()
    {
        const ourGame = this.scene.get('GameScene');

        const UIStyle = {
            //width: '220px',
            //height: '22px',
            color: 'lightyellow',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '2px 9px 2px 9px',
            'font-weight': 'bold',
            //'border-radius': '24px',
            //outline: 'solid',
            'text-align': 'right',
        };
   
        const gameVersionUI = this.add.dom(SCREEN_WIDTH - GRID*3, SCREEN_HEIGHT - GRID, 'div', 
        {
            color: 'white',
            'font-size': '12px',
            'font-family': ["Sono", 'sans-serif'],
        });
        gameVersionUI.setText(`${GAME_VERSION} Phaser:${Phaser.VERSION}`).setOrigin(1,1);
        // gameVersionUI.postFX.addShine(.2, 1, 10);
        
        // UI TEXT DOM ELEMENTS
        this.currentScore = this.add.dom(GRID * 1, GRID * .5, 'div', UIStyle);
        this.currentScore.setText(`Score: ${this.score}`).setOrigin(0,0);
        
        const bestScore = this.add.dom(GRID * 7, GRID * .5, 'div', UIStyle);
        bestScore.setOrigin(0,0);

        this.livesUI = this.add.dom(SCREEN_WIDTH/2, GRID * .5, 'div', UIStyle);
        this.livesUI.setText(`${this.lives}`).setOrigin(0.5,0);

        this.fruitCountUI = this.add.dom(GRID * 28, GRID * .5, 'div', UIStyle);
        this.fruitCountUI.setText(`${this.fruitCount} / ${FRUITGOAL}`).setOrigin(0,0);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
         });
        
        if (DEBUG) {
            this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 27*GRID , 
            this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '30px Arial', 
              fill: '#FFFFFF',
              fontSize: "32px"
            });
        }
        
        //  Event: addScore
        ourGame.events.on('addScore', function (fruit)
        {

            const scoreStyle = {
                //width: '220px',
                //height: '22px',
                color: 'lightyellow',
                'font-size': '13px',
                'font-family': ["Sono", 'sans-serif'],
                'font-weight': '400',
                'padding': '2px 9px 2px 9px',
                'font-weight': 'bold',
                //'border-radius': '24px',
                //outline: 'solid',
                'text-align': 'right',
            };

            var scoreText = this.add.dom(fruit.x -10, fruit.y - GRID, 'div', scoreStyle);
            scoreText.setOrigin(0,0);
            
            // Remove score text after a time period.
            this.time.delayedCall(1000, event => {
                scoreText.removeElement();
            }, [], this);

            this.tweens.add({
                targets: scoreText,
                alpha: { from: 1, to: 0.1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
            //debugger
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            if (timeLeft > SCORE_FLOOR) {
                this.score += timeLeft;
                scoreText.setText(`+${timeLeft}`);
            } else {
                this.score += SCORE_FLOOR;
                scoreText.setText(`+${SCORE_FLOOR}`);
            }

            //this.score += this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
            this.currentScore.setText(`Score: ${this.score}`);
            
            this.fruitCount += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            this.fruitCountUI.setText(`${this.fruitCount} / ${FRUITGOAL}`);
            

             // Restart Score Timer
            this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
            });

            var multiScore = Math.sqrt(this.scoreMulti);
            
            console.log(
                //ourGame.fruitCount + 1,
                timeLeft,
                this.score, 
                multiScore.toFixed(2), 
                (this.score * multiScore).toFixed(2));
            //console.log(this.score, Math.sqrt(this.scoreMulti), this.score * (Math.sqrt(this.scoreMulti)));
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function ()
        {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                bestScore.setText(`Best: ${this.bestScore}`);
            }
            
            // Reset Score for new game
            this.score = 0;
            this.scoreMulti = 0;
            this.fruitCount = 0;

            this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                delay: 10000,
                paused: false
             });

        }, this);
        
    }
    update()
    {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
        
        if (DEBUG) {
            if (timeTick < SCORE_FLOOR) {
            
            } else {
                this.timerText.setText(timeTick);
            }  
        }
    }
    
    end()
    {

    }
    
}

class InputScene extends Phaser.Scene
{
    constructor ()
    {
        super({key: 'InputScene', active: true});
    }

    init()
    {
        this.inputSet = [];
        this.turns = 0;
    }
    
    preload()
    {

    }
    create()
    {

    }
    update()
    {
    }
    updateDirection(gameScene, event) 
    {
        // console.log(event.keyCode, this.time.now); // all keys
        //console.profile("UpdateDirection");
        //console.time("UpdateDirection");
        //console.log(this.turns);
        switch (event.keyCode) {
            case 87: // w

            if (gameScene.snake.heading === LEFT || gameScene.snake.heading  === RIGHT || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 6);
                gameScene.snake.heading = UP; // Prevents backtracking to death
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 65: // a

            if (gameScene.snake.heading  === UP || gameScene.snake.heading  === DOWN || gameScene.snake.body.length <= 2) {
                gameScene.snake.head.setTexture('blocks', 4);
                gameScene.snake.heading = LEFT;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 83: // s

            if (gameScene.snake.heading  === LEFT || gameScene.snake.heading  === RIGHT || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 7);
                gameScene.snake.heading = DOWN;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 68: // d

            if (gameScene.snake.heading  === UP || gameScene.snake.heading  === DOWN || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 5);
                gameScene.snake.heading = RIGHT;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 38: // UP

            if (gameScene.snake.heading  === LEFT || gameScene.snake.heading  === RIGHT || gameScene.snake.body.length <= 2) {
                gameScene.snake.head.setTexture('blocks', 6);
                gameScene.snake.heading = UP;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 37: // LEFT

            if (gameScene.snake.heading  === UP || gameScene.snake.heading  === DOWN || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 4);
                gameScene.snake.heading = LEFT;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 40: // DOWN

            if (gameScene.snake.heading  === LEFT || gameScene.snake.heading  === RIGHT || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 7);
                gameScene.snake.heading = DOWN;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 39: // RIGHT

            if (gameScene.snake.heading  === UP || gameScene.snake.heading  === DOWN || gameScene.snake.body.length <= 2) { 
                gameScene.snake.head.setTexture('blocks', 5);
                gameScene.snake.heading = RIGHT;
                gameScene.snake.move(gameScene);
                this.turns += 1;
                this.inputSet.push([gameScene.snake.heading, gameScene.time.now]);
                gameScene.lastMoveTime = gameScene.time.now;
            }
            break;

            case 32: // SPACE
            if (DEBUG) { console.log(event.code, gameScene.time.now); }
            this.inputSet.push([START_SPRINT, gameScene.time.now]);

        }
    }
}

var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 768,
    height: 720,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    fx: {
        glow: {
            distance: 32,
            quality: 0.1
        }
    },
    dom: {
        createContainer: true
    },
    //scene: [ StartScene, InputScene]
    scene: [ StartScene, UIScene, GameScene, InputScene, WinScene]

};

// Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
export const END_X = SCREEN_WIDTH/GRID -1;
export const END_Y = SCREEN_HEIGHT/GRID -1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

export const game = new Phaser.Game(config);



