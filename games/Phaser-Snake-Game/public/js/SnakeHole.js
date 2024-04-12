import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';

import {PORTAL_COLORS} from './const.js';

//******************************************************************** */
//                              SnakeHole
//******************************************************************** */
// GameSettings 


const GAME_VERSION = 'v0.4.04.19.002';
export const GRID = 24;        //.................... Size of Sprites and GRID
var FRUIT = 5;                 //.................... Number of fruit to spawn
export const LENGTH_GOAL = 28; //28.. //32?................... Win Condition
const  STARTING_LIVES = 12;



// 1 frame is 16.666 milliseconds
// 83.33 - 99.996
export const SPEEDWALK = 99; // 99 In milliseconds  

// 16.66 33.32
var SPEEDSPRINT = 33; // 24


var SCORE_FLOOR = 1; // Floor of Fruit score as it counts down.
const BOOST_ADD_FLOOR = 80;
export const COMBO_ADD_FLOOR = 88;
const RESET_WAIT_TIME = 500; // Amount of time space needs to be held to reset during recombinating.

var comboCounter = 0;

// DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0;   // Between 0,1 to make portal areas appear

// Game Objects

//var atomSounds = [];
//var portalSounds = [];
//var pointSounds = [];


// #region calcBonus()


// Speed Multiplier Stats
const a = 1400; // Average Score
const lm = 28; // Minimum score
const lM = 2800; // Theoretical max score.

var calcBonus = function (scoreInput) {
    
    var _speedBonus = Math.floor(-1* ((scoreInput-lm) / ((1/a) * ((scoreInput-lm) - (lM - lm)))));
    return _speedBonus
}
console.log(calcBonus(2800));




// Tilemap variables
var map;  // Phaser.Tilemaps.Tilemap 
var tileset;
var tileset2;

//  Direction consts
export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
const START_SPRINT = 4;
const STOP_SPRINT = 5;
export const STOP = 10;



var SOUND_ATOM = [
    ['bubbleBop01', [ 'bubbleBop01.ogg', 'bubbleBop01.mp3' ]],
    ['bubbleBopHigh01', [ 'bubbleBopHigh01.ogg', 'bubbleBopHigh01.mp3' ]],
    ['bubbleBopLow01', [ 'bubbleBopLow01.ogg', 'bubbleBopLow01.mp3' ]]
]

/*var SOUND_ATOM = [
    ['atomAbsorb01', [ 'atomAbsorb01.ogg', 'atomAbsorb01.mp3' ]],
    ['atomAbsorb02', [ 'atomAbsorb02.ogg', 'atomAbsorb02.mp3' ]],
    ['atomAbsorb03', [ 'atomAbsorb03.ogg', 'atomAbsorb03.mp3' ]],
    ['atomAbsorb04', [ 'atomAbsorb04.ogg', 'atomAbsorb04.mp3' ]],
    ['atomAbsorb05', [ 'atomAbsorb05.ogg', 'atomAbsorb05.mp3' ]],
    ['atomAbsorb06', [ 'atomAbsorb06.ogg', 'atomAbsorb06.mp3' ]],
    ['atomAbsorb01', [ 'atomAbsorb01.ogg', 'atomAbsorb01.mp3' ]], //will make 07 and 08 here if we continue with this sound profile
    ['atomAbsorb02', [ 'atomAbsorb02.ogg', 'atomAbsorb02.mp3' ]]
];*/

var SOUND_POINT_COLLECT = [
    ['pointCollect01', [ 'pointCollect01.ogg', 'pointCollect01.mp3' ]],
    ['pointCollect02', [ 'pointCollect02.ogg', 'pointCollect02.mp3' ]],
    ['pointCollect03', [ 'pointCollect03.ogg', 'pointCollect03.mp3' ]],
    ['pointCollect04', [ 'pointCollect04.ogg', 'pointCollect04.mp3' ]],
    ['pointCollect05', [ 'pointCollect05.ogg', 'pointCollect05.mp3' ]],
    ['pointCollect06', [ 'pointCollect06.ogg', 'pointCollect06.mp3' ]],
    ['pointCollect07', [ 'pointCollect07.ogg', 'pointCollect07.mp3' ]],
    ['pointCollect08', [ 'pointCollect08.ogg', 'pointCollect08.mp3' ]],
]

var SOUND_PORTAL = [
    ['PortalEntry', [ 'PortalEntry.ogg', 'PortalEntry.mp3' ]]
]

const DREAMWALLSKIP = [0,1,2];

// #region STAGES_NEXT
const STAGES_NEXT = {
    'Stage-01': [['Stage-02a', 0],['Stage-02b', 99],['Stage-02c', 99],['Stage-02d', 99],['Stage-02e', 91]],
    'Stage-02a': [['Stage-03a', 0]],
    'Stage-02b': [['Stage-03a', 50]],
    'Stage-02c': [['Stage-03b', 50]],
    'Stage-02d': [['Stage-03b', 50]],
    'Stage-02e': [['Stage-03c', 85]],
    'Stage-03a': [['Stage-04', 88]],
    'Stage-03b': [['Stage-04', 99]],
    'Stage-03c': [['Stage-04', 85]],
    'Stage-04': [['Stage-05', 88]],
    'Stage-05': [['Stage-06', 84]],
    'Stage-06': [['Stage-07', 83]],
    'Stage-07': [['Stage-08', 82]],
    'Bonus-Stage-x1': [],
}

const START_STAGE = 'Stage-01';
const END_STAGE = 'Stage-08';

const UISTYLE = { color: 'lightyellow',
'font-size': '16px',
'font-family': ["Sono", 'sans-serif'],
'font-weight': '400',
'padding': '0px 0px 0px 12px'};

class StartScene extends Phaser.Scene {
    constructor () {
        super({key: 'StartScene', active: true});
    }

    preload() {
        this.load.image('howToCard', 'assets/howToCardNew.png');

        this.load.image('bg01', 'assets/sprites/background01.png');

        this.load.spritesheet('portals', 'assets/sprites/portalSheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('snakeDefault', 'assets/sprites/snakeSheetDefault.png', { frameWidth: GRID, frameHeight: GRID });

        // Tilemap
        this.load.image('tileSheetx24', 'assets/Tiled/tileSheetx24.png');




                //this.load.tilemapTiledJSON('map', 'assets/Tiled/Stage1.json');

        // GameUI
        //this.load.image('boostMeter', 'assets/sprites/boostMeter.png');
        this.load.spritesheet('boostMeterAnim', 'assets/sprites/boostMeterAnim.png', { frameWidth: 256, frameHeight: 48 });
        this.load.image('boostMeterFrame', 'assets/sprites/boostMeterFrame.png');
        this.load.image("mask", "assets/sprites/boostMask.png");

        // Animations
        this.load.spritesheet('electronCloudAnim', 'assets/sprites/electronCloudAnim.png', { frameWidth: 44, frameHeight: 36 });
        this.load.spritesheet('atomicPickup01Anim', 'assets/sprites/atomicPickup01Anim.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('startingArrowsAnim', 'assets/sprites/startingArrowsAnim.png', { frameWidth: 40, frameHeight: 44 });
        this.load.spritesheet('fruitAppearSmokeAnim', 'assets/sprites/fruitAppearSmokeAnim.png', { frameWidth: 52, frameHeight: 52 }); //not used anymore, might come back for it -Holden    
        this.load.spritesheet('dreamWallAnim', 'assets/sprites/wrapBlockAnimOLD.png', { frameWidth: GRID, frameHeight: GRID });


        //WRAP BLOCKS:
        this.load.spritesheet('wrapBlockAnim', 'assets/sprites/wrapBlockAnim.png', { frameWidth: 24, frameHeight: 24 });

        // Audio
        this.load.setPath('assets/audio');

        this.load.audio('snakeCrash', [ 'snakeCrash.ogg', 'snakeCrash.mp3'])

        SOUND_ATOM.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
        
        SOUND_PORTAL.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });

        SOUND_POINT_COLLECT.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });



        // #region Preloading Events
        this.load.on('progress', function (value) {
            //console.log(value);
        });
                    
        this.load.on('fileprogress', function (file) {
            //console.log(file.src);
        });
        
        this.load.on('complete', function () {
            console.log('start scene preload complete');
            
        });
        // #endregion
    }

    create() {
        /// Start Inital Game Settings

        var ourTimeAttack = this.scene.get('TimeAttackScene');
        ourTimeAttack.stageHistory = [];


        ///
        
        
        
        // Load all animations once.
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('startingArrowsAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7 ] }),
            frameRate: 16,
            repeat: -1
        }); 
        loadAnimations(this);


        this.add.text(SCREEN_WIDTH/2, GRID*3.5, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0); // Sets the origin to the middle top.
        
        var card = this.add.image(SCREEN_WIDTH/2, 6*GRID, 'howToCard').setDepth(10).setOrigin(0.5,0);
        //card.setOrigin(0,0);

        //card.setScale(1)
        var continueText = this.add.text(SCREEN_WIDTH/2, GRID*26, '[PRESS TO CONTINUE]',{"fontSize":'48px'}).setOrigin(0.5,0);
        
        this.tweens.add({
            targets: continueText,
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: -1,
            yoyo: true
          });

        this.input.keyboard.on('keydown', e => {
            this.scene.launch('UIScene');
            this.scene.launch('GameScene');
            //var ourGameScene = this.scene.get("GameScene");
            //console.log(e)
            
            this.scene.stop();
        })
    }

    end() {

    }


}



class GameScene extends Phaser.Scene {
    // #region GameScene

    constructor () {
        super({key: 'GameScene', active: false});
    }
    
    
    init(props) {
        
        // Arrays for collision detection
        this.atoms = [];
        this.walls = [];
        this.portals = [];
        this.dreamWalls = [];

        this.lastMoveTime = 0; // The last time we called move()

        this.comboCounter = comboCounter;

        // Sounds
        this.atomSounds = [];
        this.portalSounds = [];
        this.pointSounds = [];

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice();

        this.move_pause = true;
        this.startMoving = false;
        this.winnedYet = false;

        const { stage = START_STAGE } = props
        this.stage = stage;
        

        this.recombinate = true;
        this.startingArrowState = true;

        this.moveInterval = SPEEDWALK;

        this.spaceWhileReGrouping = false;
    

    }
    
    
    preload () {
        

        this.load.tilemapTiledJSON(this.stage, `assets/Tiled/${this.stage}.json`);

    }

    create () {

        var ourInputScene = this.scene.get('InputScene');
        var ourGameScene = this.scene.get('GameScene');
        const ourTimeAttack = this.scene.get('TimeAttackScene');

        this.spaceKey = this.input.keyboard.addKey("Space");
        console.log("FIRST INIT", this.stage, "timeattack=", ourTimeAttack.inTimeAttack);
        
        // a = Global average best score + minScore 
        //For a=1400, min=1, max=100, goal=28
        // Floor(score bonus)
        //
        // Bonus Values
        // 28 + 0
        // 100 + 37.77  = 137
        // 500 + 287.30 = 787
        // 1000 + 756   = 1756
        // **1400 + 1372** the "mid"point where x=y on the bonus curve = 2772
        // 1500 + 1585.231
        // 2000 + 3451
        // 2250 + 5656
        // 2500 + 11_536


        // Create the snake so it is addressable immediately 
        this.snake = new Snake(this, 15, 15);
    
        this.snake.direction = STOP;
        
        // Tilemap
        this.map = this.make.tilemap({ key: this.stage, tileWidth: GRID, tileHeight: GRID });
        this.stageUUID = this.map.properties[0].value; // Loads the UUID from the json file directly.


        this.tileset = this.map.addTilesetImage('tileSheetx24');

        this.layer = this.map.createLayer('Wall', [this.tileset,this.tileset2]);
        this.layer.setDepth(25);
    
        // add background
        this.add.image(0, GRID*2, 'bg01').setDepth(-1).setOrigin(0,0);



        let _x = this.snake.head.x;
        let _y = this.snake.head.y;
        
        this.startingArrowsAnimN = this.add.sprite(_x + 12, _y - 22).setDepth(15).setOrigin(0.5,0.5);
        this.startingArrowsAnimS = this.add.sprite(_x + 12, _y + 46).setDepth(15).setOrigin(0.5,0.5);
        this.startingArrowsAnimE = this.add.sprite(_x + 46, _y + 12).setDepth(15).setOrigin(0.5,0.5);
        this.startingArrowsAnimW = this.add.sprite(_x - 24, _y + 12).setDepth(15).setOrigin(0.5,0.5);
        
        this.startingArrowsAnimS.flipY = true;
        this.startingArrowsAnimE.angle = 90;
        this.startingArrowsAnimW.angle = 270;
        this.startingArrowsAnimN.play('idle');
        this.startingArrowsAnimS.play('idle');
        this.startingArrowsAnimE.play('idle');
        this.startingArrowsAnimW.play('idle');


        var wrapBlock01 = this.add.sprite(0, GRID * 2).play("wrapBlock01").setOrigin(0,0).setDepth(15);
        var wrapBlock03 = this.add.sprite(GRID * END_X, GRID * 2).play("wrapBlock03").setOrigin(0,0).setDepth(15);
        var wrapBlock06 = this.add.sprite(0, GRID * END_Y - GRID).play("wrapBlock06").setOrigin(0,0).setDepth(15);
        var wrapBlock08 = this.add.sprite(GRID * END_X, GRID * END_Y - GRID).play("wrapBlock08").setOrigin(0,0).setDepth(15);
        
    

        //wrapBlock03.play("wrapBlock03")
        //wrapBlock06.play("wrapBlock06")
        //wrapBlock08.play("wrapBlock08")
        //this.mask = shape.createBitmapMask();
        //boostMeter.setMask(this.mask); // image.mask = mask;
        //boostMeter.mask.invertAlpha = true;

        /*this.anims.create({ // will mostlikely remove later -Holden
            key: 'spawn',
            frames: this.anims.generateFrameNumbers('fruitAppearSmokeAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] }),
            frameRate: 16,
            repeat: 0
        });*/
        var smokePoof = this.add.sprite(0,0).setOrigin(0,0);
        //var smokePoofAnim = smokePoof.play("spawn")

        // Dream Wall Shimmer

        // Dream wall corners 
        
        // Dream walls for Horizontal Wrap
        for (let index = 2; index < END_Y - 1; index++) {
            if (!DREAMWALLSKIP.includes(index)) {
                var wallShimmerRight = this.add.sprite(GRID * END_X, GRID * index).setDepth(10).setOrigin(0,0);
                wallShimmerRight.play('wrapBlock05');
                this.dreamWalls.push(wallShimmerRight);
                
                var wallShimmerLeft = this.add.sprite(0, GRID * index).setDepth(10).setOrigin(0,0);
                wallShimmerLeft.play('wrapBlock04');
                this.dreamWalls.push(wallShimmerLeft);
            }
        }

        // Dream walls for Vertical Wrap
        for (let index = 1; index < END_X; index++) {
            var wallShimmerTop = this.add.sprite(GRID * index, GRID * 2).setDepth(10).setOrigin(0,0);
            wallShimmerTop.play('wrapBlock02');
            this.dreamWalls.push(wallShimmerTop);
                
            var wallShimmerBottom = this.add.sprite(GRID * index, GRID * END_Y - GRID).setDepth(10).setOrigin(0,0);
            wallShimmerBottom.play('wrapBlock07');
            this.dreamWalls.push(wallShimmerBottom);
        
        }
        
        // Audio
        this.snakeCrash = this.sound.add('snakeCrash');

        //this.pointCollect = this.sound.add('pointCollect01');
        //this.pointCollect.play();

        SOUND_ATOM.forEach(soundID => {
            this.atomSounds.push(this.sound.add(soundID[0]));
            });
        SOUND_PORTAL.forEach(soundID => {
            this.portalSounds.push(this.sound.add(soundID[0]));
            });
        SOUND_POINT_COLLECT.forEach(soundID => {
            this.pointSounds.push(this.sound.add(soundID[0], {volume: 0.5}));
            });

        // Define keys       

        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');

        
        
        // #region Keyboard Inputs
        this.input.keyboard.on('keydown', e => {
            // Separate if statements so the first will 
            // run with as small of a delay as possible
            // for input responsiveness
            this.snake.bonked = false;
            if (!this.move_pause || !this.startMoving) {
                this.startMoving = true;
                this.move_pause = false;
                ourInputScene.moveDirection(this, e);
                
            }

            if (this.move_pause) {
               // debugger
                ourInputScene.updateDirection(this, e);  
            }

            if (this.snake.regrouping) {
                this.spaceWhileReGrouping = true;
            }

        })

        this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
            if (DEBUG) { console.log(event.code+" unPress", this.time.now); }
            ourInputScene.inputSet.push([STOP_SPRINT, this.time.now]);

            this.spaceWhileReGrouping = false;
        })

        // #endregion
        

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

        
        groupA.areas.forEach( a => {
            console.log(a.name);
        });

        */
        
        
        // #region Stage Logic
        
        var makePair = function (scene, to, from) {
            
            var colorHex = Phaser.Utils.Array.RemoveRandomElement(scene.portalColors); // May Error if more portals than colors.
            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, color, to, from);
            var p2 = new Portal(scene, color, from, to);

            p1.targetObject = p2;
            p2.targetObject = p1;
        }
        
        // AREA NAME is [GROUP][ID]
        var areaAA = new SpawnArea(this, 2,5,6,4, "AA", 0x6666ff);
        var areaAB = new SpawnArea(this, 9,5,6,4, "AB", 0x6666ff);
        var areaAC = new SpawnArea(this, 16,5,6,4, "AC", 0x6666ff);
        var areaAD = new SpawnArea(this, 23,5,6,4, "AD", 0x6666ff);

        var areaBA = new SpawnArea(this, 2,14,6,4, "BA", 0x6666ff);
        var areaBB = new SpawnArea(this, 9,14,6,4, "BB", 0x6666ff);
        var areaBC = new SpawnArea(this, 16,14,6,4, "BC", 0x6666ff);
        var areaBD = new SpawnArea(this, 23,14,6,4, "BD", 0x6666ff);

        var areaCA = new SpawnArea(this, 2,23,6,4, "CA", 0x6666ff);
        var areaCB = new SpawnArea(this, 9,23,6,4, "CB", 0x6666ff);
        var areaCC = new SpawnArea(this, 16,23,6,4, "CC", 0x6666ff);
        var areaCD = new SpawnArea(this, 23,23,6,4, "CD", 0x6666ff);

        const groups = [

            [areaAA, areaAB, areaAC, areaAD],
            [areaBA, areaBB, areaBC, areaBD],
            [areaCA, areaCB, areaCC, areaCD]
        ]


        // Outside Lanes
        var nextArea = [
            [areaAA, areaAB, areaAC, areaAD],
            [areaCA, areaCB, areaCC, areaCD],
        ];

        // The first two pairs have some consistency to make sure we never have a disjointed map.
        
        // First Portal Cords
        var cordsPA_1 = areaBA.genChords(this);
        areaBA.portalCords = cordsPA_1;

        // Choose a Random Lane (Either top or bottom)
        var nextGroup = Phaser.Utils.Array.RemoveRandomElement(nextArea);

        // Choose random area from that lane and get chords
        var areaPA_2 = Phaser.Math.RND.pick(nextGroup);
        var cordsPA_2 = areaPA_2.genChords(this);
        areaPA_2.portalCords = cordsPA_2;

        makePair(this, cordsPA_1, cordsPA_2);

        // Second Portal Pair
        var cordsPB_1 = areaBD.genChords(this);
        areaBD.portalCords = cordsPB_1;

        // Other Lane gets the second portal
        var otherGroup = Phaser.Math.RND.pick(nextArea);
        var areaPB_2 = Phaser.Math.RND.pick(otherGroup);
        var cordsPB_2 = areaPB_2.genChords(this);
        areaPB_2.portalCords = cordsPB_2

        makePair(this, cordsPB_1, cordsPB_2);

        
        // Generate next to portals
        var pair3 = this.chooseAreaPair(this, groups);
        makePair(this, pair3[0].genChords(this), pair3[1].genChords(this));

        var pair4 = this.chooseAreaPair(this, groups);
        makePair(this, pair4[0].genChords(this), pair4[1].genChords(this));
        

        // Fair Fruit Spawn (5x)
        
        // Top Row
        this.setFruit(this,[areaAA,areaAB,areaAC,areaAD]);
        this.setFruit(this,[areaAA,areaAB,areaAC,areaAD]);

        
        // Middle Row        
        this.setFruit(this, [areaBB, areaBC]);
        this.setFruit(this, [areaBB, areaBC]);


        // Bottom Row
        this.setFruit(this,[areaCA,areaCB,areaCC,areaCD]);
        this.setFruit(this,[areaCA,areaCB,areaCC,areaCD]);


        // #endregion

        
        //////////// Add things to the UI that are loaded by the game scene.
        // This makes sure it is created in the correct order
        // #region GameScene UI Plug
        const ourUI = this.scene.get('UIScene'); 
        ourUI.bestScoreUI = ourUI.add.dom(0, 12 - 2 , 'div', UISTYLE);
        ourUI.bestScoreUI.setOrigin(0,0);

        // Calculate this locally
        var bestLog = JSON.parse(localStorage.getItem(`${this.stageUUID}-bestFruitLog`));

        if (bestLog) {
            // is false if best log has never existed
            var bestLocal = bestLog.reduce((a,b) => a + b, 0);
        }
        else {
            var bestLocal = 0;
        }

        


        ourUI.bestScoreUI.setText(`Best : ${bestLocal}`);
        /////////////////////////////////////////////////
        // Throw An event to start UI screen?

        ////////////////////////////////////////////

    }
    
    chooseAreaPair (scene, groups) {
        // Random group where there is less than 3 portals already.
        var groupPair = scene.chooseSpawnableLanes(scene, groups.slice(), 3)

        var area1 = scene.chooseAreaFromLane(scene, groupPair[0]);
        var area2 = scene.chooseAreaFromLane(scene, groupPair[1]);
        
        return [area1, area2]
    }
    
    chooseSpawnableLanes (scene, _areas, limit=3) {
        // Must have at least 2 free lanes to work.
        let lanes = [];
        
        // Start with Random Lane
        var lane1 = Phaser.Utils.Array.RemoveRandomElement(_areas);
        
        // Verify there is enough space. If not choose another lane.
        let _i = 0;
        lane1.forEach(area => {
            if (area.hasPortal()) {
                _i += 1;
                //console.log(_areas, "Portal Count=", _i);
            }
            if (_i >= 3) { // Don't let any lane have more than 3 portals
                console.log("This lane Is Full");
                lane1 = Phaser.Utils.Array.RemoveRandomElement(_areas);
            }
        });

        var lane2 = Phaser.Utils.Array.RemoveRandomElement(_areas);

        lanes = [lane1,lane2];

        return lanes;
    }
    
    
    chooseAreaFromLane (scene, lane) {

        var area = Phaser.Utils.Array.RemoveRandomElement(lane);

        if (area.hasPortal()) {
            area = scene.chooseAreaFromLane(scene, lane);
        }

        return area;
    }
    
    setFruit (scene, groups) {

        var area = Phaser.Math.RND.pick(groups);

        var pos = area.genChords(scene);

        var atom = new Food(scene);
        atom.setPosition(pos[0]*GRID, pos[1]*GRID);
        atom.electrons.setPosition(pos[0]*GRID, pos[1]*GRID);
        

    }

    update (time, delta) {
        const ourUI = this.scene.get('UIScene'); // Probably don't need to set this every loop. Consider adding to a larger context.
        const ourInputScene = this.scene.get('InputScene');

        // console.log("update -- time=" + time + " delta=" + delta);

        // #region Hold Reset
        if (this.spaceKey.getDuration() > RESET_WAIT_TIME && this.snake.regrouping && this.spaceWhileReGrouping) {
                console.log("SPACE LONG ENOUGH BRO");
 
                this.events.off('addScore');
                this.events.off('saveScore');

                const ourUI = this.scene.get('UIScene');
 
                ourUI.lives -= 1;
                ourUI.scene.restart( { score: ourUI.stageStartScore, lives: ourUI.lives });
                //ourUIScene.scene.restart();
                this.scene.restart();
        }

        

        // Lose State
        if (!this.snake.alive && !this.snake.regrouping) {
            //console.log("DEAD, Now Rregroup", this.snake.alive);
            this.snakeCrash.play();    
            // game.scene.scene.restart(); // This doesn't work correctly
            if (DEBUG) { console.log("DEAD"); }
            
            // DO THIS ON REAL RESET DEATH
            //this.events.emit('saveScore');
            
            ourUI.bonks += 1;
            //ourUI.livesUI.setText(`x ${ourUI.bonks}`);
            


            //game.destroy();
            //this.scene.restart();
            

            if (DEBUG) {
                const graphics = this.add.graphics();

                graphics.lineStyle(2, 0x00ff00, 1);
        
                this.snake.body.forEach( part => {
                graphics.beginPath();
                graphics.moveTo(part.x, part.y);
                graphics.lineTo(GRID * 15, GRID * 15);
                graphics.closePath();
                graphics.strokePath();
                });
            }
    
            this.snake.regrouping = true;
            this.move_pause = true;
            
            var tween = this.tweens.add({
                targets: this.snake.body, 
                x: GRID * 15,
                y: GRID * 15,
                yoyo: false,
                duration: 720,
                ease: 'Sine.easeOutIn',
                repeat: 0,
                delay: 500
            });

            tween.on('complete', test => {
                //console.log("COMPLETE AND SET ALIVE")
                this.snake.regrouping = false;
                this.snake.alive = true;
                
                this.startMoving = false;

                // Turn back on arrows
                this.startingArrowState = true;
                this.startingArrowsAnimN.setVisible(true);
                this.startingArrowsAnimS.setVisible(true);
                this.startingArrowsAnimE.setVisible(true);
                this.startingArrowsAnimW.setVisible(true);

                
            });
        }
        
        // #region Win State
        if (ourUI.length >= LENGTH_GOAL && LENGTH_GOAL != 0 && !this.winnedYet) {
            console.log("YOU WIN" , this.stage);
            this.winnedYet = true; // stops update loop from moving snake.
            this.move_pause = true; // Keeps snake from turning

            ourUI.scoreUI.setText(`Stage: ${ourUI.scoreHistory.reduce((a,b) => a + b, 0)}`);
            //ourUI.bestScoreUI.setText(`Best :  ${ourUI.score}`);
            this.events.emit('saveScore');
            

            ourUI.scene.pause();
            

            ourUI.scene.start('ScoreScene');
            
        }

        // #endregion

        // Only Calculate every move window

        // #region Check move
        if(time >= this.lastMoveTime + this.moveInterval && this.snake.alive) {
            

            this.lastMoveTime = time;
            
            // This code calibrates how many milliseconds per frame calculated.
            // console.log(Math.round(time - (this.lastMoveTime + this.moveInterval)));
 
            // PORTAL HIGHLIGHT LOGIC
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
                
                if (timeTick < SCORE_FLOOR ) {

                    
                } else {
                    this.atoms.forEach( fruit => {
                        fruit.fruitTimerText.setText(timeTick);
                    });
                }
                
            } 

            // Set Best Score UI element using local storage.
            
            
            // Move at last second
            if (!this.winnedYet) {
                this.snake.move(this);
            }
            
        }
        
        // Boost and Boost Multi Code
        //var timeLeft = this.scene.get('UIScene').scoreTimer.getRemainingSeconds().toFixed(1) * 10; // VERY INEFFICIENT WAY TO DO THIS


        /*
        if (timeLeft <= COMBO_ADD_FLOOR && timeLeft >= SCORE_FLOOR) { // Ask about this line later.
            this.comboCounter = 0;
        }
        */

        
    }
}


class ScoreScene extends Phaser.Scene
// #region ScoreScene
{
    constructor () {
        super({key: 'ScoreScene', active: false});
    }

    preload() {
    }

    create() {
        
        const ourUI = this.scene.get('UIScene');
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');
        const ourScoreScene = this.scene.get('ScoreScene');
        const ourTimeAttack = this.scene.get('TimeAttackScene');
        /////////

        // Pre Calculate needed values
        var stageScore = ourUI.scoreHistory.reduce((a,b) => a + b, 0);
        var stageAve = stageScore/ourUI.scoreHistory.length;

        var speedBonus = calcBonus(stageScore);

        var bestLog = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestFruitLog`));
        var bestLocal = bestLog.reduce((a,b) => a + b, 0);
        var bestAve = bestLocal/bestLog.length;


        var bestBonus = calcBonus(bestLocal);

        var bestrun = Number(JSON.parse(localStorage.getItem(`BestFinalScore`)));

        //var stageAverage = stageScore();

        /////////



        this.scoreCardBackground = this.add.rectangle(0, GRID * 2, GRID * 31, GRID * 28, 0x384048, .88);
        this.scoreCardBackground.setOrigin(0,0).setDepth(8);

        
        var wrapBlock01 = this.add.sprite(0, GRID * 2).play("wrapBlock01").setOrigin(0,0).setDepth(15);
        var wrapBlock03 = this.add.sprite(GRID * END_X, GRID * 2).play("wrapBlock03").setOrigin(0,0).setDepth(15);
        var wrapBlock06 = this.add.sprite(0, GRID * END_Y - GRID).play("wrapBlock06").setOrigin(0,0).setDepth(15);
        var wrapBlock08 = this.add.sprite(GRID * END_X, GRID * END_Y - GRID).play("wrapBlock08").setOrigin(0,0).setDepth(15);
        
        // Dream walls for Horizontal Wrap
        for (let index = 2; index < END_Y - 1; index++) {
            if (!DREAMWALLSKIP.includes(index)) {
                var wallShimmerRight = this.add.sprite(GRID * END_X, GRID * index).setDepth(10).setOrigin(0,0);
                wallShimmerRight.play('wrapBlock05');
                //this.dreamWalls.push(wallShimmerRight);
                
                var wallShimmerLeft = this.add.sprite(0, GRID * index).setDepth(10).setOrigin(0,0);
                wallShimmerLeft.play('wrapBlock04');
                //this.dreamWalls.push(wallShimmerLeft);
            }
        }

        // Dream walls for Vertical Wrap
        for (let index = 1; index < END_X; index++) {
            var wallShimmerTop = this.add.sprite(GRID * index, GRID * 2).setDepth(10).setOrigin(0,0);
            wallShimmerTop.play('wrapBlock02');
            //this.dreamWalls.push(wallShimmerTop);
                
            var wallShimmerBottom = this.add.sprite(GRID * index, GRID * END_Y - GRID).setDepth(10).setOrigin(0,0);
            wallShimmerBottom.play('wrapBlock07');
            //this.dreamWalls.push(wallShimmerBottom);
        
        }
        //////////////////////////////////////
        



        ///////
        this.add.text(SCREEN_WIDTH/2, GRID*3.5, 'SNAKEHOLE',{"fontSize":'48px'}).setOrigin(0.5,0).setDepth(25);
        
        //var card = this.add.image(5*GRID, 5*GRID, 'howToCard').setDepth(10);
        //card.setOrigin(0,0);

        const currentScoreUI = this.add.dom(SCREEN_WIDTH/2, GRID*18.5, 'div', {
            "fontSize":'34px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '600',
            color: 'white',
            'background-color': "#607d8b",
            padding: "4px 14px",
            'border-top-right-radius': '16px',
            'border-top-left-radius': '16px',
            
            //'text-decoration': 'underline'
        });
        
        currentScoreUI.setText(`Current Score: ${ourUI.score + speedBonus}`).setOrigin(0.5,0).setDepth(60);

        const bestRunUI = this.add.dom(SCREEN_WIDTH/2, GRID*20.5, 'div', {
            "fontSize":'34px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '600',
            color: 'white',
            'background-color': "#607d8b",
            padding: "4px 14px",
            'border-radius': '16px',
            //'text-decoration': 'underline'
        });


        bestRunUI.setText(`Previous Best Run: ${bestrun}`).setOrigin(0.5,0).setDepth(60);

        const stageUI = this.add.dom(SCREEN_WIDTH/2 - GRID, GRID * 6.5, 'div', {
            "fontSize":'26px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            color: 'white',
            'text-align': 'right',

        });
        stageUI.setText(ourGame.stage).setOrigin(1,0);

        const stageScoreUI = this.add.dom(SCREEN_WIDTH/2 - GRID, GRID * 8.5, 'div', {
            "fontSize":'20px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            color: 'white',
            'text-align': 'right',

        });
        
        
        stageScoreUI.setText(
            `Base: ${stageScore}
            Speed Bonus: +${speedBonus}
            Stage Score: ${stageScore+speedBonus}
            HighScore: ${bestLocal + bestBonus}
            `
        
        ).setOrigin(1, 0);

        
        const scoreScreenStyle = {
            width: '270px',
            //height: '22px',
            color: 'white',
            'font-size': '12px',
            'font-family': ["Sono", 'sans-serif'],
            'font-weight': '400',
            'padding': '12px 0px 12px 12px',
            //'font-weight': 'bold',
            'word-wrap': 'break-word',
            //'border-radius': '24px',
            outline: 'solid',
        }
        
        const scoreScreen = this.add.dom(SCREEN_WIDTH/2 + GRID, GRID * 7, 'div', scoreScreenStyle);
        scoreScreen.setOrigin(0,0);
        
        scoreScreen.setText(
        `STAGE STATS - ${ourGame.stage}
        ----------------------
        SCORE: ${ourUI.score}
        LENGTH: ${ourUI.length}
        FRUIT SCORE AVERAGE: ${stageAve}
        
        TURNS: ${ourInputScene.turns}
        CORNER TIME: ${ourInputScene.cornerTime} FRAMES
        
        BONUS Boost Time: ${ourInputScene.boostBonusTime} FRAMES
        BOOST TIME: ${ourInputScene.boostTime} FRAMES
        
        BETA: ${GAME_VERSION}

        BONK RESETS: ${ourUI.bonks}
        TOTAL TIME ELAPSED: ${Math.round(ourInputScene.time.now/1000)} Seconds
        `);

        const logScreenStyle = {
            width: '156px',
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

        
        
        

        if (bestLog) {
            var bestLogUI = this.add.dom(SCREEN_WIDTH/2 + GRID*.5, GRID * 13, 'div', logScreenStyle);
            bestLogUI.setText(
                `Best - ave(${bestAve.toFixed(1)})
                ---------------------
                [${bestLog.slice().sort().reverse()}]`
            ).setOrigin(1,0);    
        }
        

        var fruitLog = this.add.dom(SCREEN_WIDTH/2 - GRID * 7, GRID * 13, 'div', logScreenStyle);
        fruitLog.setText(
            `Current - ave(${stageAve.toFixed(1)})
            --------------------- 
            [${ourUI.scoreHistory.slice().sort().reverse()}]`
        ).setOrigin(1,0);  
        
            

        //card.setScale(0.7);

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continue_text = '[SPACE TO CONTINUE]';

            if (ourGame.stage === END_STAGE) {
                continue_text = '[SPACE TO WIN]';
            }
            
            var continueText = this.add.text(SCREEN_WIDTH/2, GRID*26,'', {"fontSize":'48px'});
            continueText.setText(continue_text).setOrigin(0.5,0).setDepth(25);


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
                // As the event is defined there, but this works and is why I did it. - James
                ourGame.events.off('addScore');
                ourGame.events.off('saveScore');

                ourInputScene.scene.restart();

                if (ourTimeAttack.inTimeAttack) {
                    
                    // Go back to time attack scene
                    ourGame.scene.stop();
                    ourScoreScene.scene.switch('TimeAttackScene');
                    
                }
                else {
                    if (ourGame.stage != END_STAGE) {
                
                        var nextScore = 0;
                        var currentBase = 0;
                        ourGame.scene.get("TimeAttackScene").stageHistory.forEach ( _stage => {
                            var baseScore = _stage.foodLog.reduce((a,b) => a + b, 0);
                            currentBase += baseScore
                            nextScore += baseScore + calcBonus(baseScore)
                        });
    
                        var nextStages = STAGES_NEXT[ourGame.stage];
                        var unlockedStages = [];
    
                        // #region Next Stage
                        console.log("CHECK NEXT STAGES");
                        nextStages.forEach( _stage => {
    
                            var goalSum = _stage[1] * ourTimeAttack.stageHistory.length * 28
                            console.log(
                                _stage[0], 
                                "histSum:", ourTimeAttack.histSum, 
                                "targetSum", goalSum, 
                                "unlocked=", ourTimeAttack.histSum > goalSum,
                                "currentBase=", currentBase,
                                "newUnlocked=", (currentBase > goalSum && ourTimeAttack.histSum < goalSum)
                            )
                            if (ourTimeAttack.histSum >= goalSum) {
                                unlockedStages.push(_stage);
                            }

                            if (currentBase > goalSum && ourTimeAttack.histSum < goalSum) {
                                if (ourTimeAttack.newUnlocked) {
                                    ourTimeAttack.newUnlocked.push(_stage);
                                }
                                else {
                                    var currentAve = currentBase / (ourTimeAttack.stageHistory.length * 28);
                                    ourTimeAttack.newUnlocked = [
                                        _stage[0], // Stage Namr
                                        _stage[1], // Requirement Average
                                        currentAve]; // Average now
                                }
                            }
                            
    
                        });
    
                        if (unlockedStages.length != 0) {
    
    
                            var nextStage = Phaser.Math.RND.pick(unlockedStages);
    
                            ourUI.scene.restart( { score: nextScore, lives: ourUI.lives } );
                            ourGame.scene.restart( { stage: nextStage[0] } );
    
                            ourScoreScene.scene.switch('GameScene'); // This doubles the game scene I think.
                            
                        }
                        else {
    
                            // go to Time Attack
    
                            
                            ourGame.scene.stop();
                            ourScoreScene.scene.switch('TimeAttackScene');
                        }
                        
                        
                    }
                    else {
                        // Start From The beginning. Must force reset values or it won't reset.
                        
                
                        
                        ourGame.scene.stop();
                        ourScoreScene.scene.switch('TimeAttackScene');
                        
                        // do in Win Screen After the very end.
                        //console.log("END STAGE", ourGame.stage, END_STAGE);
                        //ourUI.scene.restart( { score: 0 });
                        //ourGame.scene.restart({ stage: START_STAGE });
                    }

                }

                // Maybe should only have this in the TimeAttackScene
                if (bestrun < ourUI.score + speedBonus) {
                    localStorage.setItem('BestFinalScore', ourUI.score + speedBonus);
                }
                
                

            });
        }, [], this);
    }

    end() {

    }

}



// #region Stage Data
var StageData = new Phaser.Class({

    initialize:

    function StageData(stageID, foodLog, stageUUID, newBest = false)
    {
        this.stage = stageID;
        this.foodLog = foodLog;
        this.newBest = newBest;
        this.uuid = stageUUID;
    },
    
    toString(){
        return `${this.stage}`
    },

    calcScore() {
        var stageScore = this.foodLog.reduce((a,b) => a + b, 0);
        var bonusScore = calcBonus(stageScore);

        return stageScore + bonusScore;
    },

    calcBase() {
        var stageScore = this.foodLog.reduce((a,b) => a + b, 0);

        return stageScore;
    },
    
});
// #endregion

class TimeAttackScene extends Phaser.Scene{
    // #region TimeAttackScene
    constructor () {
        super({ key: 'TimeAttackScene', active: true });
    }

    init () {

        this.inTimeAttack = false;

    }
    preload () {

    }
    create() {
        // Sets first time as an empty list. After this it will not be set again
        // Remember to reset manually on full game restart.
        const ourGame = this.scene.get('GameScene');
        const ourUI = this.scene.get('UIScene');
        const ourTimeAttack = this.scene.get("TimeAttackScene");


        console.log("Time Attack Stage Manager is Live");
        

        // First Entry Y Coordinate
        var stageY = GRID *3;
        var allFoodLog = [];

        // Average Food
        var sumFood = allFoodLog.reduce((a,b) => a + b, 0);


        var playedStages = [];
        var index = 0;

        this.input.keyboard.addCapture('UP,DOWN,SPACE');

        

        
        var _i = 0;
        var lowestScore = 9999999999;
        
        // Only loads the UI to the scene if you have played a level. 
        // Allows this scene to start at the beginning without displaying anything, but when you restart the scene it plays correctly.
        

        if (this.stageHistory) {
            this.inTimeAttack = true;

            this.stageHistory.forEach(_stageData => {
                console.log(_stageData.stage,
                    "Base Score:", _stageData.calcBase(),
                    "SpeedBonus", calcBonus(_stageData.calcBase()), 
                    "FoodLog:", _stageData.foodLog
                );

                var baseScore = _stageData.calcBase();
                var realScore = _stageData.calcScore();
                var foodLogOrdered = _stageData.foodLog.slice().sort().reverse();

                

                allFoodLog.push(...foodLogOrdered);


                var logWrapLenth = 8;
                //var bestLog = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestFruitLog`));
                //var bestScore;
                var bestChar;

                if (_stageData.newBest) {
                    bestChar = "+";
                }
                else {
                    bestChar = "-";
                }


                //////
                var levelUI = this.add.dom(GRID * 9, stageY, 'div', {
                    color: 'white',
                    'font-size': '28px',
                    'font-family': ["Sono", 'sans-serif'],
                });


                if (realScore < lowestScore) {
                    index = _i;
                    lowestScore = realScore;
                };
                    

                levelUI.setText(`${bestChar}${_stageData.stage}`).setOrigin(1,0);

                playedStages.push([levelUI, _stageData.stage]);
                
            

                // Run Stats
                var scoreUI = this.add.dom( GRID * 10, stageY + 4 , 'div', {
                    color: 'white',
                    'font-size': '14px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                scoreUI.setText(`Score: ${realScore} SpeedBonus: ${calcBonus(baseScore)}`).setOrigin(0,0);


                // food Log
                var foodLogUITop = this.add.dom( scoreUI.x + scoreUI.width +  14, stageY + 4 , 'div', {
                    color: 'darkslategrey',
                    'font-size': '12px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                foodLogUITop.setText(foodLogOrdered.slice(0,logWrapLenth)).setOrigin(0,0);

                var foodLogUIBottom = this.add.dom( GRID * 10, stageY + GRID , 'div', {
                    color: 'darkslategrey',
                    'font-size': '12px',
                    'font-family': ["Sono", 'sans-serif'],
                });
                foodLogUIBottom.setText(foodLogOrdered.slice(logWrapLenth - foodLogOrdered.length)).setOrigin(0,0);

                _i += 1;
                stageY += GRID * 2;

            }); // End Level For Loop


            var selected = playedStages[index]

            selected[0].node.style.color = "red";



            // #region Stage Select Code
            // Default End Game
            var continue_text = '[SPACE TO END GAME]';
    
            if (ourUI.lives > 0) {
                continue_text = `[GOTO ${selected[1]}]`;
            }
            
            var continueTextUI = this.add.text(SCREEN_WIDTH/2, GRID*26,'', {"fontSize":'48px'}).setVisible(false);
            continueTextUI.setText(continue_text).setOrigin(0.5,0).setDepth(25);

            console.log("played Stages", playedStages);

            this.input.keyboard.on('keydown-DOWN', function() {
                selected[0].node.style.color = "white";
                index = Phaser.Math.Wrap(index + 1, -1, playedStages.length-1); // No idea why -1 works here. But it works so leave it until it doesn't/

                selected = playedStages[index];
                selected[0].node.style.color = "red";

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
                
            }, [], this);
    
            this.input.keyboard.on('keydown-UP', function() {
                selected[0].node.style.color = "white";
                index = Phaser.Math.Wrap(index - 1, 0, playedStages.length);
                
                selected = playedStages[index];
                selected[0].node.style.color = "red";

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
            }, [], this);

            
            
        
            


            ///////// Run Score

            var runScore = 0;
            var baseScore = 0;

            if (this.stageHistory) {
                this.stageHistory.forEach(_stageData => {
                
                    runScore += _stageData.calcScore();
                    baseScore += _stageData.calcBase();

                });

            };
            
            console.log("Runscore:", runScore);

            var runScoreUI = this.add.dom(GRID * 10, stageY  + 4, 'div', {
                color: 'yellow',
                'font-size': '28px',
                'font-family': ["Sono", 'sans-serif'],
                'text-decoration': 'overline dashed',


            });

            runScoreUI.setText(`Current Run Score ${runScore}`).setOrigin(0,0);

            // #region Unlock New Level?

            if (this.scene.get('GameScene').stage != END_STAGE) {

                
                var unlockStage;
                var goalSum;
                var foodToNow = this.stageHistory.length * 28;
                
                // Unlock Difficulty needs to be in order
                STAGES_NEXT[ourGame.stage].some( _stage => {

                    var _goalSum = _stage[1] * foodToNow;
                    unlockStage = _stage;
                    goalSum = unlockStage[1] * foodToNow;
                    if (this.histSum <= _goalSum && baseScore > _goalSum) {
                        return true;
                    }
                });

                // Calc score required up to this point
                // Add Stage History Sum Here
    
                console.log("New Unlocked this Run", this.newUnlocked);
                
                if (goalSum && baseScore > goalSum && this.histSum < goalSum) {
                    console.log("YOU UNLOCKED A NEW LEVEL!!" , unlockStage[0], "FoodAve:", baseScore / foodToNow, "FoodAveREQ:", goalSum / foodToNow);

                    lowestStage = unlockStage[0]; ////// BROKE
                    
                }
                else {
                    console.log(
                        "BETTER LUCK NEXT TIME!! You need", goalSum / foodToNow, 
                        "to unlock", unlockStage[0], 
                        "and you got", baseScore / foodToNow);
                }
    
            }
            // #endregion
            


            ////////// Run Average

            var sumFood = allFoodLog.reduce((a,b) => a + b, 0);

            var sumAveFood = sumFood / allFoodLog.length;

            //console.log ("sum:", sumFood, "Ave:", sumAveFood);
            this.time.delayedCall(900, function() {

                continueTextUI.setVisible(true);
    
    
                this.tweens.add({
                    targets: continueTextUI,
                    alpha: { from: 0, to: 1 },
                    ease: 'Sine.InOut',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true
                  });

                  /*
                  this.tweens.add({
                    targets: lowestStageUI,
                    alpha: { from: 0, to: 1 },
                    ease: 'Sine.InOut',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true
                  });*/

                var bestRun = Number(JSON.parse(localStorage.getItem(`BestFinalScore`)));
                if (bestRun < runScore) {
                    localStorage.setItem('BestFinalScore', runScore);
                }
                
    
                this.input.keyboard.on('keydown-SPACE', function() {

                if (ourUI.lives > 0) {

                    ourUI.lives -= 1; 

                    ourUI.scene.restart( { score: 0, lives: ourUI.lives } );
                    ourGame.scene.restart( { stage: playedStages[index][1] } );

                    ourTimeAttack.scene.stop();

                    //ourTimeAttack.scene.switch('GameScene');
                    
                }
                else {
                    // end run
                    // go to Time Attack
                    console.log("That's All Folks!" , runScore);
                    ourTimeAttack.scene.stop();
                    //ourScoreScene.scene.switch('TimeAttackScene');
                }
                        
                });
                /// END STUFF
                // Reset the unlocked stages after you load the scene.
                // So they only show up once per Time Attack Scene.
                this.newUnlocked = [];

            }, [], this);
   

        }


    }
    update() {

    }
}



class UIScene extends Phaser.Scene {
    // #region UIScene
    constructor () {
        super({ key: 'UIScene', active: false });
    }
    
    init(props) {
        //this.score = 0;
        var { score = 0 } = props
        this.score = score;
        this.stageStartScore = score;
        

        this.length = 0;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
        this.bonks = 0;

        var {lives = STARTING_LIVES } = props
        this.lives = lives;

        this.scoreHistory = [];

        // BOOST METER
        this.energyAmount = 0; // Value from 0-100 which directly dictates ability to boost and mask
    }

    preload () {
        //const ourGame = this.scene.get('GameScene');
        //this.load.json(`${this.stage}-json`, `assets/Tiled/${this.stage}.json`);

        this.load.spritesheet('ui-blocks', 'assets/sprites/hudIconsSheet.png', { frameWidth: GRID, frameHeight: GRID });
    }
    
    create() {
       const ourGame = this.scene.get('GameScene');

       // UI Icons
       this.add.sprite(GRID * 21.5, GRID * 1, 'snakeDefault', 0).setOrigin(0,0).setDepth(50);      // Snake Head
       this.add.sprite(GRID * 25.5, GRID * 1, 'snakeDefault', 1).setOrigin(0,0).setDepth(50);      // Snake Body
       this.add.sprite(GRID * 29.5 - 4, GRID * 1, 'ui-blocks', 3).setOrigin(0,0).setDepth(50); // Tried to center flag

       // #region Boost Meter UI
       this.add.image(SCREEN_WIDTH/2,GRID*.25,'boostMeterFrame').setDepth(51).setOrigin(0.5,0);

       this.mask = this.make.image({
           x: SCREEN_WIDTH/2,
           y: GRID*.25,
           key: 'mask',
           add: false
       }).setOrigin(0.5,0);

       const keys = [ 'increasing' ];
       const boostBar = this.add.sprite(SCREEN_WIDTH/2, GRID*.25).setOrigin(0.5,0);
       boostBar.setDepth(50);
       boostBar.play('increasing');

       boostBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.mask);
       // #endregion

        
        //this.load.json(`${ourGame.stage}-json`, `assets/Tiled/${ourGame.stage}.json`);
        //stageUUID = this.cache.json.get(`${this.stage}-json`);
   
        const gameVersionUI = this.add.dom(SCREEN_WIDTH - GRID * 2, SCREEN_HEIGHT, 'div', {
            color: 'white',
            'font-size': '10px',
            'font-family': ["Sono", 'sans-serif'],
        }).setOrigin(1,1);
      
        gameVersionUI.setText(`snakehole.${GAME_VERSION}`).setOrigin(1,1);

        // Store the Current Version in Cookies
        localStorage.setItem('version', GAME_VERSION); // Can compare against this later to reset things.

        
        
        // Score Text
        this.scoreUI = this.add.dom(0 , GRID*2 + 2, 'div', UISTYLE);
        this.scoreUI.setText(`Stage: 0`).setOrigin(0,1);
        

        // this.add.image(GRID * 21.5, GRID * 1, 'ui', 0).setOrigin(0,0);
        this.livesUI = this.add.dom(GRID * 22.5, GRID * 2 + 2, 'div', UISTYLE);
        this.livesUI.setText(`x ${this.lives}`).setOrigin(0,1);

        // Goal UI
        //this.add.image(GRID * 26.5, GRID * 1, 'ui', 1).setOrigin(0,0);
        this.lengthGoalUI = this.add.dom(GRID * 26.5, GRID * 2 + 2, 'div', UISTYLE);
        
        
        var length = `${this.length}`;
        if (LENGTH_GOAL != 0) {
            this.lengthGoalUI.setText(`${length.padStart(2, "0")}/${LENGTH_GOAL}`).setOrigin(0,1);
        }
        else {
            this.lengthGoalUI.setText(`${length.padStart(2, "0")}`).setOrigin(0,1);
            this.lengthGoalUI.x = GRID * 27
        }
        
        //this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'ui', 3).setOrigin(1,0);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: 10000,
            paused: false
         });


         // Countdown Text
        this.countDown = this.add.dom(GRID*9 + 9, 16, 'div', {
            color: 'white',
            'font-size': '22px',
            'font-family': ["Sono", 'sans-serif'],
            padding: '1px 5px',
            'border-radius': '4px',
            outline: 'solid'
        }).setOrigin(1,0);
        this.countDown.setText(this.scoreTimer.getRemainingSeconds().toFixed(1) * 10);

        
        if (DEBUG) {
            this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 27*GRID , 
            this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '30px Arial', 
              fill: '#FFFFFF',
              fontSize: "32px"
            });
        }
        
        //  Event: addScore
        ourGame.events.on('addScore', function (fruit) {

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
            
            
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            
            if (timeLeft > BOOST_ADD_FLOOR) {
                ourGame.energyAmount += 10;
            }
            
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

            this.scoreUI.setText(`Stage: ${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            
            this.length += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            var length = `${this.length}`;
            
            // Exception for Bonus Levels when the Length Goal = 0
            if (LENGTH_GOAL != 0) {
                this.lengthGoalUI.setText(`${length.padStart(2, "0")}/${LENGTH_GOAL}`);
            }
            else {
                this.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
            }
            
            
            

             // Restart Score Timer
            if (this.length < LENGTH_GOAL || LENGTH_GOAL === 0) {
                this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                    delay: 10000,
                    paused: false
                 });   
            }
            
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function () {
            const ourTimeAttack = ourGame.scene.get('TimeAttackScene');


            var stageData = new StageData(ourGame.stage, this.scoreHistory, ourGame.stageUUID);

            var stageFound = false;
            
            if (ourTimeAttack.inTimeAttack) {
                ourTimeAttack.stageHistory.some( _stageData => {

                    if (ourGame.stage === _stageData.stage) {
                        var oldScore = _stageData.foodLog.reduce((a,b) => a + b, 0);
                        var newScore = this.scoreHistory.reduce((a,b) => a + b, 0);

                        oldScore = oldScore + calcBonus(oldScore);
                        newScore = newScore + calcBonus(newScore);
                        
                        if (newScore > oldScore) {
                            console.log("YEAH YOU DID BETTER", "New=", newScore, "Old=", oldScore, "Lives Left=", this.lives);
                            _stageData.foodLog = this.scoreHistory; 
                        }
                        else {
                            console.log("SORRY TRY AGAIN", "New=", newScore, "Old=", oldScore, "Lives Left=", this.lives);
                        }

                        stageFound = true;
                    }


                })
                if (!stageFound) {
                    // Playing a new unlocked stage. Get one life back.
                    this.lives += 1;
                    ourTimeAttack.stageHistory.push(stageData);
                }
            }
            else {
                //// Push New Stage Data
                ourTimeAttack.stageHistory.push(stageData);

            }
            
            var stage_score = this.scoreHistory.reduce((a,b) => a + b, 0);
            
            // #region Do Unlock Calculation of all Best Logs
            
            var historicalLog = [];
            
            ourTimeAttack.stageHistory.forEach( _stage => {
                var stageBestLog = JSON.parse(localStorage.getItem(`${_stage.uuid}-bestFruitLog`));
                if (stageBestLog) {
                    historicalLog = [...historicalLog, ...stageBestLog];
                }
            });

            // make this an event?
            ourTimeAttack.histSum = historicalLog.reduce((a,b) => a + b, 0);
        
            // #endregion



            // #region Save Best To Local.
            var bestLog = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestFruitLog`));

            if (bestLog) {
                // is false if best log has never existed
                var bestLocal = bestLog.reduce((a,b) => a + b, 0);
            }
            else {
                var bestLocal = 0;
            }

            if (stage_score > bestLocal) {
                bestLocal = stage_score;
                this.bestScoreUI.setText(`Best : ${bestLocal}`);

                stageData.newBest = true;
                
                localStorage.setItem(`${ourGame.stageUUID}-bestFruitLog`, `[${this.scoreHistory}]`);
            }

            // #endregion
            

            
            

        }, this);

        
        
    }
    update() {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
        var ourInputScene = this.scene.get('InputScene');

        // #region Bonus Level Code
        if (timeTick < SCORE_FLOOR && LENGTH_GOAL === 0){
            // Temp Code for bonus level
            console.log("YOU LOOSE, but here if your score", timeTick, SCORE_FLOOR);

            this.scoreUI.setText(`Stage: ${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            this.bestScoreUI.setText(`Best :  ${this.score}`);
            this.scene.get("GameScene").events.emit('saveScore');

            this.scene.pause();

            this.scene.start('ScoreScene');
        }
        // #endregion

        
        
        if (this.length < LENGTH_GOAL || LENGTH_GOAL === 0) {
        
            if (timeTick < SCORE_FLOOR ) {
                this.countDown.setText(this.score + SCORE_FLOOR);
            } else {
                this.countDown.setText(this.score + (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10));
            }
        }
        else {
            this.countDown.setText(this.score);
        } 
        
        if (DEBUG) {
            if (timeTick < SCORE_FLOOR ) {
            
            } else {
                this.timerText.setText(timeTick);
            }  
        }

        // #region Boost Logic
        if (!ourInputScene.spaceBar.isDown) { // Base Speed
            this.scene.get('GameScene').moveInterval = SPEEDWALK; // Less is Faster
            this.mask.setScale(this.energyAmount/100,1);
            this.energyAmount += .25; // Recharge Boost Slowly
        }
        
        // Is Trying to Boost
        else {
        
            // Has Boost Logic
            if(this.energyAmount > 1){
                this.scene.get('GameScene').moveInterval = SPEEDSPRINT;
            }
            else{
                this.scene.get('GameScene').moveInterval = SPEEDWALK;
            }
            this.mask.setScale(this.energyAmount/100,1);
            this.energyAmount -= 1;
            
            // Boost Stats
            if (timeTick >= BOOST_ADD_FLOOR ) { 
                // Don't add boost time after 20 seconds
                ourInputScene.boostBonusTime += 1;
                ourInputScene.boostTime += 1;
            } else {
                ourInputScene.boostTime += 1;
            }
        }

        // Reset Energy if out of bounds.
        if (this.energyAmount >= 100) {
            this.energyAmount = 100;}
        else if(this.energyAmount <= 0) {
            this.energyAmount = 0;
        }

        //#endregion Boost Logic
        


    }
    

end() {

    }
    
}

// #region Input Scene
class InputScene extends Phaser.Scene {
    
    constructor () {
        super({key: 'InputScene', active: true});
    }

    init() {
        this.inputSet = [];
        this.turns = 0; // Total turns per live.
        this.boostTime = 0; // Sum of all boost pressed
        this.boostBonusTime = 0; // Sum of boost during boost bonuse time.
        this.cornerTime = 0; // Frames saved when cornering before the next Move Time.
    }

    preload() {

    }
    create() {

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    /*
    const ourGame = this.scene.get('GameScene');

    // Keyboard Inputs
    this.input.keyboard.on('keydown', e => {
        if (!ourGame.snake.pause_movement) {
            this.updateDirection(ourGame, e);
            
        }
        /*
        if (startingArrowState == true){
            startingArrowState = false;
            startingArrowsAnimN.setVisible(false)
            startingArrowsAnimS.setVisible(false)
            startingArrowsAnimE.setVisible(false)
            startingArrowsAnimW.setVisible(false)
        }
    })

    this.input.keyboard.on('keyup-SPACE', e => { // Capture for releasing sprint
        if (DEBUG) { console.log(e.code+" unPress", this.time.now); }
       this.inputSet.push([STOP_SPRINT, this.time.now]);
    
    }) 
    */
    
    }
    update() {
    }
    
    
    updateDirection(gameScene, event) {
        // Does not change the direction of the snake in code
        // Changes where the snake is looking with the sprite.
        
        
        // #region UpdateDirection
        switch (event.keyCode) {
            case 87: // w

            if (gameScene.snake.direction === LEFT  || gameScene.snake.direction  === RIGHT || // Prevents backtracking to death
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                // At anytime you can update the direction of the snake.
                gameScene.snake.head.setTexture('snakeDefault', 6);
 
                    
            }
            break;

            case 65: // a

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) {
                
                gameScene.snake.head.setTexture('snakeDefault', 4);


            }
            break;

            case 83: // s

            if (gameScene.snake.direction  === LEFT  || gameScene.snake.direction  === RIGHT || 
                 gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                gameScene.snake.head.setTexture('snakeDefault', 7);

            }
            break;

            case 68: // d

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                gameScene.snake.head.setTexture('snakeDefault', 5);

            }
            break;

            case 38: // UP

            if (gameScene.snake.direction  === LEFT || gameScene.snake.direction  === RIGHT || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) {

                gameScene.snake.head.setTexture('snakeDefault', 6);

            }
            break;

            case 37: // LEFT

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                gameScene.snake.head.setTexture('snakeDefault', 4);

            }
            break;

            case 40: // DOWN

            if (gameScene.snake.direction  === LEFT || gameScene.snake.direction  === RIGHT || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 

                gameScene.snake.head.setTexture('snakeDefault', 7);
                
            }
            break;

            case 39: // RIGHT

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 

                gameScene.snake.head.setTexture('snakeDefault', 5);
                
            }
            break;

            case 32: // SPACE
              if (DEBUG) { console.log(event.code, gameScene.time.now); }
              this.inputSet.push([START_SPRINT, gameScene.time.now]);
              break;
        } 
    }

    moveDirection(gameScene, event) {
        // console.log(event.keyCode, this.time.now); // all keys
        //console.profile("UpdateDirection");
        //console.time("UpdateDirection");
        //console.log(this.turns);
        
        // #region MoveDirection
        switch (event.keyCode) {
            case 87: // w

            if (gameScene.snake.direction === LEFT  || gameScene.snake.direction  === RIGHT || // Prevents backtracking to death
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                this.snakeStart(gameScene);
                
                    // At anytime you can update the direction of the snake.
                gameScene.snake.head.setTexture('snakeDefault', 6);
                gameScene.snake.direction = UP;
                
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
                this.turns += 1; 
                    
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                
            }
            break;

            case 65: // a

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) {
                
                    this.snakeStart(gameScene);

                gameScene.snake.head.setTexture('snakeDefault', 4);
                gameScene.snake.direction = LEFT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666)   
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
                
            }
            break;

            case 83: // s

            if (gameScene.snake.direction  === LEFT  || gameScene.snake.direction  === RIGHT || 
                 gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                

                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 7);
                gameScene.snake.direction = DOWN;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
 
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 68: // d

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 5);
                gameScene.snake.direction = RIGHT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
 
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 38: // UP

            if (gameScene.snake.direction  === LEFT || gameScene.snake.direction  === RIGHT || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) {

                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 6);
                gameScene.snake.direction = UP;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 37: // LEFT

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 
                
                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 4);
                gameScene.snake.direction = LEFT;

                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 40: // DOWN

            if (gameScene.snake.direction  === LEFT || gameScene.snake.direction  === RIGHT || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 

                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 7);
                gameScene.snake.direction = DOWN;
                
                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
                
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 39: // RIGHT

            if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
                gameScene.snake.direction  === STOP || gameScene.snake.body.length < 2) { 

                    this.snakeStart(gameScene);
                    gameScene.snake.head.setTexture('snakeDefault', 5);
                gameScene.snake.direction = RIGHT;
                
                this.turns += 1;
                this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
                
                this.cornerTime += Math.floor((gameScene.moveInterval - (gameScene.time.now - gameScene.lastMoveTime))/16.66666) 
                gameScene.snake.move(gameScene);
                gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            }
            break;

            case 32: // SPACE
              if (DEBUG) { console.log(event.code, gameScene.time.now); }
              this.inputSet.push([START_SPRINT, gameScene.time.now]);
              break;
        } 
    }
    snakeStart(gameScene) {
        gameScene.startMoving = true;
        gameScene.move_pause = false;

        if (gameScene.startingArrowState == true){
                
            // turn off arrows and move snake.
            gameScene.startingArrowState = false;
            gameScene.startingArrowsAnimN.setVisible(false);
            gameScene.startingArrowsAnimS.setVisible(false);
            gameScene.startingArrowsAnimE.setVisible(false);
            gameScene.startingArrowsAnimW.setVisible(false);
            gameScene.move_pause = false;
            
            //this.move_pause = false;
            //ourInputScene.moveDirection(this, e);
        }

    }
}






 // #region Animations
function loadAnimations(scene) {
    scene.anims.create({
      key: 'atom01idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}),
      frameRate: 12,
      repeat: -1
    })
    scene.anims.create({
      key: 'atom02idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'atom03idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]}),
      frameRate: 6,
      repeat: -1
    })
    scene.anims.create({
      key: 'atom04idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]}),
      frameRate: 4,
      repeat: -1
    })
  
    scene.anims.create({
      key: 'electronIdle',
      frames: scene.anims.generateFrameNumbers('electronCloudAnim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]}),
      frameRate: 16,
      repeat: -1
    })
    scene.anims.create({
      key: 'electronDispersion01',
      frames: scene.anims.generateFrameNumbers('electronCloudAnim',{ frames: [ 20, 21, 22, 23, 24, 25]}),
      frameRate: 16,
      repeat: 0
    })
  
    scene.anims.create({
      key: 'increasing',
      frames: scene.anims.generateFrameNumbers('boostMeterAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] }),
      frameRate: 8,
      repeat: -1
    });
  
    //WRAP_BLOCK_ANIMS
    scene.anims.create({
      key: 'wrapBlock01',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9, 10 ,11]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock02',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 12,13,14,15,16,17,18,19,20,21,22,23]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock03',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 24,25,26,27,28,29,30,31,32,33,34,35]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock04',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 36,37,38,39,40,41,42,43,44,45,46,47]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock05',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 48,49,50,51,52,53,54,55,56,57,58,59]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock06',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 60,61,62,63,64,65,66,67,68,69,70,71]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock07',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 72,73,74,75,76,77,78,79,80,81,82,83]}),
      frameRate: 8,
      repeat: -1
    })
    scene.anims.create({
      key: 'wrapBlock08',
      frames: scene.anims.generateFrameNumbers('wrapBlockAnim',{ frames: [ 84,85,86,87,88,89,90,91,92,93,94,95]}),
      frameRate: 8,
      repeat: -1
    })
  }
// #endregion

// #region Config
var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 744,
    height: 744,
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
    scene: [ StartScene, GameScene, UIScene, InputScene, ScoreScene, TimeAttackScene]

};

// #region Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height; 

// Edge locations for X and Y
export const END_X = SCREEN_WIDTH/GRID - 1;
export const END_Y = SCREEN_HEIGHT/GRID - 1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0 || SCREEN_WIDTH % GRID != 0 ) {
    throw "SCREEN DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

// region const Game
export const game = new Phaser.Game(config);




