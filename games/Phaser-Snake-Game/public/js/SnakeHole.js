import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';

//******************************************************************** */
//                              SnakeHole
//******************************************************************** */
// GameSettings 

const GAME_VERSION = 'v0.2.03.15.006';
export const GRID = 24;  //.................... Size of Sprites and GRID
var FRUIT = 5;           //.................... Number of fruit to spawn
export const LENGTH_GOAL = 32; //24 //32?................... Win Condition


// 1 frame is 16.666 milliseconds
// 83.33 - 99.996
var SPEEDWALK = 99; // 96 In milliseconds  

// 16.66 33.32
var SPEEDSPRINT = 33; // 24


var SCORE_FLOOR = 24; // Floor of Fruit score as it counts down.
var BOOST_BONUS_FLOOR = 80;
var SCORE_MULTI_GROWTH = 0.01;

// DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0.0;   // Between 0,1 to make portal areas appear

// Game Objects

var crunchSounds = [];
var portalSounds = [];

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

var SOUND_PORTAL = [
    ['PortalEntry', [ 'PortalEntry.ogg', 'PortalEntry.mp3' ]]
]

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
        this.portalSounds = [];

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice();

        this.move_pause = false;
        this.started = false;
    

    }
    
    
    preload ()
    {
        this.load.image('bg01', 'assets/sprites/background01.png');
        this.load.spritesheet('blocks', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });
        this.load.spritesheet('portals', 'assets/sprites/portalSheet.png', { frameWidth: 32, frameHeight: 32 });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/tileSheetx24.png');
        this.load.tilemapTiledJSON('map', 'assets/Tiled/snakeMap.json');

        // GameUI
        //this.load.image('boostMeter', 'assets/sprites/boostMeter.png');
        this.load.spritesheet('boostMeterAnim', 'assets/sprites/boostMeterAnim.png', { frameWidth: 256, frameHeight: 48 });
        this.load.image('boostMeterFrame', 'assets/sprites/boostMeterFrame.png');
        this.load.image("mask", "assets/sprites/boostMask.png");

        this.load.spritesheet('startingArrowsAnim', 'assets/sprites/startingArrowsAnim.png', { frameWidth: 40, frameHeight: 44 });
        this.load.spritesheet('fruitAppearSmokeAnim', 'assets/sprites/fruitAppearSmokeAnim.png', { frameWidth: 52, frameHeight: 52 });
        // Audio
        this.load.setPath('assets/audio');

        SOUND_CRUNCH.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
        
        SOUND_PORTAL.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
    }

    create ()
    {
        var ourInputScene = this.scene.get('InputScene');
        var ourGameScene = this.scene.get('GameScene');

        /////////////////////////////////////////////////
        // UI BLOCKS
        this.add.image(GRID * 22.5, GRID * 1, 'blocks', 0).setOrigin(0,0).setDepth(10);
        this.add.image(GRID * 27, GRID * 1, 'blocks', 1).setOrigin(0,0).setDepth(10);
        this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'blocks', 12).setOrigin(1,0).setDepth(10);
        ////////////////////////////////////////////
        
        // Snake needs to render immediately 
        // Create the snake the  first time so it renders immediately
        this.snake = new Snake(this, SCREEN_WIDTH/GRID/2, SCREEN_HEIGHT/GRID/2);
        this.snake.heading = STOP;
        
        // Tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: GRID, tileHeight: GRID });
        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', this.tileset);
    
        // add background
        this.add.image(0, GRID*3, 'bg01').setDepth(-1).setOrigin(0,0);

        // BOOST METER
        this.energyAmount = 0; // Value from 0-100 which directly dictates ability to boost and mask

        this.add.image(SCREEN_WIDTH/2,GRID*.25,'boostMeterFrame').setDepth(10).setOrigin(0.5,0);

        this.mask = this.make.image({
            x: GRID * 16,
            y: GRID*.25,
            key: 'mask',
            add: false
        }).setOrigin(0.5,0);
        

        // Animation set
        this.anims.create({
            key: 'increasing',
            frames: this.anims.generateFrameNumbers('boostMeterAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] }),
            frameRate: 8,
            repeat: -1
        });

        const keys = [ 'increasing' ];
        const energyBar = this.add.sprite(SCREEN_WIDTH/2, GRID*.25).setOrigin(0.5,0);
        energyBar.play('increasing');

        energyBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.mask);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('startingArrowsAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7 ] }),
            frameRate: 16,
            repeat: -1
        });


        var startingArrowState = true;

        let _x = this.snake.head.x;
        let _y = this.snake.head.y;
        
        const startingArrowsAnimN = this.add.sprite(_x + 12, _y - 22).setDepth(5).setOrigin(0.5,0.5);
        const startingArrowsAnimS = this.add.sprite(_x + 12, _y + 46).setDepth(5).setOrigin(0.5,0.5);
        const startingArrowsAnimE = this.add.sprite(_x + 46, _y + 12).setDepth(5).setOrigin(0.5,0.5);
        const startingArrowsAnimW = this.add.sprite(_x - 24, _y + 12).setDepth(5).setOrigin(0.5,0.5);
        startingArrowsAnimS.flipY=true;
        startingArrowsAnimE.angle = 90;
        startingArrowsAnimW.angle = 270;
        startingArrowsAnimN.play('idle');
        startingArrowsAnimS.play('idle');
        startingArrowsAnimE.play('idle');
        startingArrowsAnimW.play('idle');
        //this.mask = shape.createBitmapMask();
        //boostMeter.setMask(this.mask); // image.mask = mask;
        //boostMeter.mask.invertAlpha = true;

        this.anims.create({
            key: 'spawn',
            frames: this.anims.generateFrameNumbers('fruitAppearSmokeAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] }),
            frameRate: 16,
            repeat: 0
        });
        var smokePoof = this.add.sprite(0,0).setOrigin(0,0);
        //var smokePoofAnim = smokePoof.play("spawn")
        // Audio
        SOUND_CRUNCH.forEach(soundID =>
            {
                this.crunchSounds.push(this.sound.add(soundID[0]));
            });
        SOUND_PORTAL.forEach(soundID =>{
            this.portalSounds.push(this.sound.add(soundID[0]));
        });

        // Define keys       

        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Keyboard Inputs
        this.input.keyboard.on('keydown', e => {
            this.started = true;
            ourInputScene.updateDirection(this, e);
            if (startingArrowState == true){
                startingArrowState = false;
                startingArrowsAnimN.setVisible(false)
                startingArrowsAnimS.setVisible(false)
                startingArrowsAnimE.setVisible(false)
                startingArrowsAnimW.setVisible(false)
            }
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
        //for (let index = 0; index < FRUIT; index++) {
        //    var food = new Food(this);
        //}
        /*
        var SpawnGroup = new Phaser.Class({
            Extends: Phaser.GameObjects.Rectangle,
        
            initialize:
        
            function SpawnGroup(scene, areas, name)
            {
                this.name = name;
                this.areas = [];

                for (let index = 0; index < areas.length; index++) {
                    var spawnArea = new SpawnArea(scene, 
                        areas[index][0],  // x
                        areas[index][1],  // y
                        areas[index][2],  // width
                        areas[index][3],  // height
                        `${name}${index+1}`,
                        0x6666ff
                    );
                    
                    this.areas.push(spawnArea);
                    
                }
            }
        });
        
        // Define Spawn Areas
        
        
        var _group1 = [
            [1,5,6,4],
            [9,5,6,4],
            [17,5,6,4],
            [25,5,6,4]
        ]

        var groupA = new SpawnGroup(this, _group1, "A");

        console.log(groupA.name);
        groupA.areas.forEach( a => {
            console.log(a.name);
        });

        */
        
        
        // AREA NAME is [GROUP][ID]
        var areaAA = new SpawnArea(this, 1,5,6,4, "AA", 0x6666ff);
        var areaAB = new SpawnArea(this, 9,5,6,4, "AB", 0x6666ff);
        var areaAC = new SpawnArea(this, 17,5,6,4, "AC", 0x6666ff);
        var areaAD = new SpawnArea(this, 25,5,6,4, "AD", 0x6666ff);

        var areaBA = new SpawnArea(this, 1,14,6,4, "BA", 0x6666ff);
        var areaBB = new SpawnArea(this, 9,14,6,4, "BB", 0x6666ff);
        var areaBC = new SpawnArea(this, 17,14,6,4, "BC", 0x6666ff);
        var areaBD = new SpawnArea(this, 25,14,6,4, "BD", 0x6666ff);

        var areaCA = new SpawnArea(this, 1,23,6,4, "CA", 0x6666ff);
        var areaCB = new SpawnArea(this, 9,23,6,4, "CB", 0x6666ff);
        var areaCC = new SpawnArea(this, 17,23,6,4, "CC", 0x6666ff);
        var areaCD = new SpawnArea(this, 25,23,6,4, "CD", 0x6666ff);

        var groups = [

            [areaAA, areaAB, areaAC, areaAD],
            [areaBA, areaBB, areaBC, areaBD],
            [areaCA, areaCB, areaCC, areaCD]
        ]


        var cordsP1 = areaBA.genChords(this);

        areaBA.portalCords = cordsP1;
        
        var cordsP2 = areaBD.genChords(this);
        areaBD.portalCords = cordsP2;

        console.log(areaBA.name, areaBA.hasPortal());
        console.log(areaBD.name, areaBD.hasPortal());


        var nextArea = [
            [areaAA, areaAB, areaAC, areaAD],
            [areaCA, areaCB, areaCC, areaCD],
        ];


        // Choose a Random Lane
        var nextGroup = Phaser.Utils.Array.RemoveRandomElement(nextArea);
        
        // Choose random area from that lane and get chords
        var areaP3 = Phaser.Math.RND.pick(nextGroup);
        var cordsP3 = areaP3.genChords(this);
        areaP3.portalCords = cordsP3;


        // Other Lane gets the second portal
        var areaP4 = Phaser.Math.RND.pick(nextArea[0]);
        var cordsP4 = areaP4.genChords(this);
        areaP4.portalCords = cordsP4


        // Choose a Random Lane
        var nextLane = Phaser.Utils.Array.RemoveRandomElement(nextArea);
        
        // Choose random area from that lane and get chords
        var areaP3 = Phaser.Math.RND.pick(nextLane);
        var cordsP3 = areaP3.genChords(this);
        areaP3.portalCords = cordsP3;


        // Make first 2 portals
        makePair(this, cordsP1, cordsP3);
        makePair(this, cordsP2, cordsP4);


        // Generate next to portals
        var pair3 = this.chooseAreaPair(this, groups);
        makePair(this, pair3[0].genChords(this), pair3[1].genChords(this));

        var pair4 = this.chooseAreaPair(this, groups);
        makePair(this, pair4[0].genChords(this), pair4[1].genChords(this));


        var J1 = areaBC.genChords(this);
        var I1 = areaCC.genChords(this);

        // Fair Fruit Spawn (5x)
        
        // Top Row
        this.setFruit(this,[areaAA,areaAB,areaAC,areaAD]);
        this.setFruit(this,[areaAA,areaAB,areaAC,areaAD]);
        
        // Middle Row        
        this.setFruit(this, [areaBB, areaBC]);

        // Bottom Row
        this.setFruit(this,[areaCA,areaCB,areaCC,areaCD]);
        this.setFruit(this,[areaCA,areaCB,areaCC,areaCD]);
        
    }
    
    chooseAreaPair (scene, groups) {
        // Random group where there is less than 3 portals already.
        var groupPair = scene.chooseSpawnableLanes(scene, groups.slice(), 3)

        var area1 = scene.chooseAreaFromLane(scene, groupPair[0]);
        var area2 = scene.chooseAreaFromLane(scene, groupPair[1]);
        
        return [area1, area2]
    }
    
    chooseAreaFromLane (scene, lane) {
        
        var area = Phaser.Utils.Array.RemoveRandomElement(lane);

        if (area.hasPortal()) {
            area = scene.chooseAreaFromLane(scene, lane);
        }

        return area;
    }
    
    chooseSpawnableLanes (scene, _areas, limit=3) {
        // Must have at least 2 free lanes to work.
        let lanes = [];
        
        // Start with Random Lane
        var lane1 = Phaser.Utils.Array.RemoveRandomElement(_areas);
        //console.log(returnArea);
        
        // Verify there is enough space. If not choose another lane.
        let _i = 0;
        lane1.forEach(area => {
            if (area.portalChords) {
                _i += 1;
            }
            if (_i >= 3) { // Don't let any lane have more than 3 portals
                console.log("ONE LAYER DEEPER");
                lane1 = Phaser.Utils.Array.RemoveRandomElement(_areas);
            }
        });

        var lane2 = Phaser.Utils.Array.RemoveRandomElement(_areas);

        lanes = [lane1,lane2];

        return lanes;
    }
    
    setFruit (scene, groups) {

        var area = Phaser.Math.RND.pick(groups);

        var pos = area.genChords(scene);

        var food = new Food(scene);
        food.setPosition(pos[0]*GRID, pos[1]*GRID);
        //console.log(scene.portals);

    }

    update (time, delta) 
    {
        const ourUI = this.scene.get('UIScene'); // Probably don't need to set this every loop. Consider adding to a larger context.
        const ourInputScene = this.scene.get('InputScene');

        // console.log("update -- time=" + time + " delta=" + delta);

        // Lose State
        if (!this.snake.alive && !this.snake.regrouping) {
                
            // game.scene.scene.restart(); // This doesn't work correctly
            if (DEBUG) { console.log("DEAD"); }
            
            // DO THIS ON REAL RESET DEATH
            //this.events.emit('saveScore');
            
            ourUI.lives += 1;
            ourUI.livesUI.setText(`x ${ourUI.lives}`);

            //ourUI.length = 0;
            ourUI.fruitCountUI.setText(`${ourUI.length}/${LENGTH_GOAL}`);


            //game.destroy();
            //this.scene.restart();
            

            if (DEBUG) {
                const graphics = this.add.graphics();

                graphics.lineStyle(2, 0x00ff00, 1);
        
                this.snake.body.forEach( part => {
                graphics.beginPath();
                graphics.moveTo(part.x, part.y);
                graphics.lineTo(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
                graphics.closePath();
                graphics.strokePath();
                });
            }
    
            this.snake.regrouping = true;
            this.move_pause = true;
            
            var tween = this.tweens.add({
                targets: this.snake.body, // Start removing the tail.
                x: SCREEN_WIDTH/2,
                y: SCREEN_HEIGHT/2,
                yoyo: false,
                duration: 350,
                ease: 'Sine.easeOutIn',
                repeat: 0,
                delay: this.tweens.stagger(75)
            });

            tween.on('complete', test => {
                //debugger
                //this.snake.body.reverse() // Head back at front
                this.snake.regrouping = false;
                this.snake.alive = true;
                this.started = false;
                this.snake.heading = 0;
                //this.scene.restart();
                //this.fruitCount = 0; // ON FOR TESTING
            });
        }
        
        // Win State
        if (ourUI.length >= LENGTH_GOAL) { // not winning instantly
            console.log("YOU WIN");

            ourUI.scoreUI.setText(`Score: ${ourUI.score}`);
            ourUI.bestScoreUI.setText(`Best :  ${ourUI.score}`);


            this.scene.pause();


            this.scene.start('WinScene');
            //this.events.emit('saveScore');
        }

        // Only Calculate things when snake is moved.
        if(time >= this.lastMoveTime + this.moveInterval && this.snake.alive){
            this.lastMoveTime = time;
            
            // This code calibrates how many milliseconds per frame calculated.
            // console.log(Math.round(time - (this.lastMoveTime + this.moveInterval)));
 
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
                        //closestPortal.fx.innerStrength = 3 - closestPortalDist;
                        closestPortal.fx.outerStrength = 0;

                    }
                });
            };
            const ourUI = this.scene.get('UIScene');
       
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
        
        // Boost and Boost Multi Code

        var timeLeft = ourUI.scoreTimer.getRemainingSeconds().toFixed(1) * 10; // VERY INEFFICIENT WAY TO DO THIS

        // Boost Logic
        if (!this.spaceBar.isDown){ // Base Speed
            this.moveInterval = SPEEDWALK; // Less is Faster
            this.mask.setScale(this.energyAmount/100,1);
            this.energyAmount += .25; // Recharge Boost Slowly
        }
        else{
            // Has Boost Logic
            if(this.energyAmount > 1){
                this.moveInterval = SPEEDSPRINT;
            }
            else{
                this.moveInterval = SPEEDWALK;
            }
            this.mask.setScale(this.energyAmount/100,1);
            this.energyAmount -= 1;
            
            // Boost Stats
            if (timeLeft >= BOOST_BONUS_FLOOR ) { 
                // Don't add boost time after 20 seconds
                ourInputScene.boostBonusTime += 1;
                ourInputScene.boostTime += 1;
            } else {
                ourInputScene.boostTime += 1;
            }
        }
        if (timeLeft <= BOOST_BONUS_FLOOR && timeLeft >= SCORE_FLOOR) {
        }
        
        // Reset Energy if out of bounds.
        if (this.energyAmount >= 100){
            this.energyAmount = 100;}
        else if(this.energyAmount <= 0){
            this.energyAmount = 0;
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
        const ourGame = this.scene.get('GameScene');
        const ourWinScene = this.scene.get('WinScene');


        const scoreScreenStyle = {
            width: '450px',
            //height: '22px',
            color: 'white',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '2px 0px 2px 12px',
            //'font-weight': 'bold',
            'word-wrap': 'break-word',
            //'border-radius': '24px',
            outline: 'solid',
        }
        ///////
        
        this.add.text(SCREEN_WIDTH/2, GRID*3, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        //var card = this.add.image(5*GRID, 5*GRID, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);
        
        const scoreScreen = this.add.dom(SCREEN_WIDTH/2, GRID * 6.5, 'div', scoreScreenStyle);

        scoreScreen.setOrigin(0.5,0);

        
        
        scoreScreen.setText(
        ` 
        /************ WINNING SCORE *************/
        SCORE: ${ourUI.score}
        FRUIT SCORE AVERAGE: ${Math.round(ourUI.score / LENGTH_GOAL)}
        
        TURNS: ${ourInputScene.turns}
        CORNER TIME: ${ourInputScene.cornerTime} FRAMES
        
        BONUS Boost Time: ${ourInputScene.boostBonusTime} FRAMES
        BOOST TIME: ${ourInputScene.boostTime} FRAMES
        
        BETA: ${GAME_VERSION}
        ................RUN STATS.................

        ATTEMPTS: ${ourUI.lives}
        TOTAL TIME ELAPSED: ${Math.round(ourInputScene.time.now/1000)} Seconds
        FRUIT COLLECTED OVER ALL ATTEMPTS:  ${ourUI.globalFruitCount}
        `);

        const logScreenStyle = {
            width: '432px',
            //height: '22px',
            color: 'white',
            'font-size': '12px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '200',
            'padding': '2px 12px 2px 12px',
            //'font-weight': 'bold',
            'word-wrap': 'break-word',
            //'border-radius': '24px',
            //outline: 'solid',
        }

        var fruitLog = this.add.dom(SCREEN_WIDTH/2, GRID * 22, 'div', logScreenStyle);
        fruitLog.setText(`[${ourUI.scoreHistory.sort().reverse()}]`).setOrigin(0.5,1);

        //card.setScale(0.7);

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continueText = this.add.text(SCREEN_WIDTH/2, GRID*25,'', {"fontSize":'48px'});
            continueText.setText('[SPACE TO CONTINUE]').setOrigin(0.5,0);


            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });
            

                this.input.keyboard.on('keydown-SPACE', function() {


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
        this.length = 0;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
        this.lives = 1;

        this.scoreHistory = [];
    }

    preload () {
        //this.load.spritesheet('ui', 'assets/Tiled/tileSheetx24.png', { frameWidth: GRID, frameHeight: GRID });
    }
    
    create() {
        const ourGame = this.scene.get('GameScene');

        const UIStyle = {
            //width: '220px',
            //height: '22px',
            color: 'lightyellow',
            'font-size': '16px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '0px 0px 0px 12px',
            //'font-weight': 'bold',
            //'border-radius': '24px',
            //outline: 'solid',
            'text-align': 'right',
        };
   
        const gameVersionUI = this.add.dom(SCREEN_WIDTH - GRID*2, SCREEN_HEIGHT, 'div', {
            color: 'white',
            'font-size': '10px',
            'font-family': ["Sono", 'sans-serif'],
        }).setOrigin(0,1);
      
        gameVersionUI.setText(`snakehole.${GAME_VERSION}`).setOrigin(1,1);
        
        // Score Text
        this.scoreUI = this.add.dom(0 , GRID*2 + 2, 'div', UIStyle);
        this.scoreUI.setText(`Score: 0`).setOrigin(0,1);
        //this.scoreUI.setText(`Score: ${this.score}`).setOrigin(0,0);
        
        // Best Score
        this.bestScoreUI = this.add.dom(0, 12 - 2 , 'div', UIStyle);
        this.bestScoreUI.setOrigin(0,0);
        //this.bestScoreUI.setText(""); // Hide until you get a score to put here.
        
        // Lives
        // this.add.image(GRID * 21.5, GRID * 1, 'ui', 0).setOrigin(0,0);
        this.livesUI = this.add.dom(GRID * 23.5, GRID * 2 + 2, 'div', UIStyle);
        this.livesUI.setText(`x ${this.lives}`).setOrigin(0,1);

        // Goal UI
        //this.add.image(GRID * 26.5, GRID * 1, 'ui', 1).setOrigin(0,0);
        this.fruitCountUI = this.add.dom(GRID * 28, GRID * 2 + 2, 'div', UIStyle);
        this.fruitCountUI.setText(`${this.length}/${LENGTH_GOAL}`).setOrigin(0,1);
        //this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'ui', 3).setOrigin(1,0);

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

                // Record Score for Stats
                this.scoreHistory.push(timeLeft);
            } else {
                this.score += SCORE_FLOOR;
                scoreText.setText(`+${SCORE_FLOOR}`);

                // Record Score for Stats
                this.scoreHistory.push(SCORE_FLOOR);
            }

            // Update UI

            this.scoreUI.setText(`Score: ${this.score}`);
            
            this.length += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            this.fruitCountUI.setText(`${this.length}/${LENGTH_GOAL}`);
            

             // Restart Score Timer
            this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
            });
            
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function ()
        {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestScoreUI.setText(`Best : ${this.bestScore}`);
            }
            
            // Reset Score for new game
            //this.score = 0;
            //this.scoreMulti = 0;
            //this.fruitCount = 0;
            //this.scoreHistory = [];

            this.scoreUI.setText(`Score: ${this.score}`);

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
        this.turns = 0; // Total turns per live.
        this.boostTime = 0; // Sum of all boost pressed
        this.boostBonusTime = 0; // Sum of boost during boost bonuse time.
        this.cornerTime = 0; // Frames saved when cornering before the next Move Time.
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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)
                
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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)


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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)


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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)
                
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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)

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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)

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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666);

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
                
                // Calculate Corner Time
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666);

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
              break;
        } 
    }
}

var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 768,
    height: 720,
    //seed: 1,
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




