import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';

import {PORTAL_COLORS} from './const.js';

//******************************************************************** */
//                              SnakeHole
//******************************************************************** */
// GameSettings 


const GAME_VERSION = 'v0.7.06.21.001';
export const GRID = 24;        //.................... Size of Sprites and GRID
//var FRUIT = 5;                 //.................... Number of fruit to spawn
export const LENGTH_GOAL = 28; //28..................... Win Condition
const  STARTING_ATTEMPTS = 25;
const DARK_MODE = false;
const GHOST_WALLS = true;
// #region DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0;   // Between 0,1 to make portal areas appear
const SCORE_SCENE_DEBUG = false;


// 1 frame is 16.666 milliseconds
// 83.33 - 99.996
export const SPEED_WALK = 99; // 99 In milliseconds  

// 16.66 33.32
export const SPEED_SPRINT = 33; // 24  // Also 16 is cool // 32 is the next


const SCORE_FLOOR = 1; // Floor of Fruit score as it counts down.
const BOOST_ADD_FLOOR = 100;
export const COMBO_ADD_FLOOR = 108;
const RESET_WAIT_TIME = 500; // Amount of time space needs to be held to reset during recombinating.
const MAX_SCORE = 120;
const NO_BONK_BASE = 1000;


//debug stuff
const PORTAL_PAUSE = 2; 


// Speed Multiplier Stats
const a = 1400; // Average Score
const lm = 28; // Minimum score
const lM = 3360 ; // Theoretical max score = 28 * MAX_SCORE


// #region Utils Functions

var calcBonus = function (scoreInput) {
    
    var _speedBonus = Math.floor(-1* ((scoreInput-lm) / ((1/a) * ((scoreInput-lm) - (lM - lm)))));
    return _speedBonus
}

var calcSumOfBest = function(scene) {
    let entries = Object.entries(localStorage);
    scene.stagesComplete = 0;
    scene.sumOfBest = 0;

    entries.forEach(entry => {
        
        var key = entry[0].split("-");
        if (key[key.length - 1] === "bestStageData") {
            scene.stagesComplete += 1

            var levelLog = new StageData(JSON.parse(entry[1]));
            var _scoreTotal = levelLog.calcTotal();
            scene.sumOfBest += _scoreTotal;
        }

    })
}

export var commaInt = function(int) {
    return `${int}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var calcHashInt = function (str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
    }
    // Return a 32bit base 10 number
    return (hash >>> 0).toString(10);
}

var intToBinHash = function (input) {
    return (input >>> 0).toString(2).padStart(32, '0');
}

const ZED_CONSTANT = 16;
const ZEDS_LEVEL_SCALAR = 0.02;
const ZEDS_OVERLEVEL_SCALAR = 0.8;
var calcZedLevel = function (remainingZeds, reqZeds=0, level=0) {

    let nextLevelZeds;
    let zedsLevel;

    if (level < 99) {
        nextLevelZeds = reqZeds + ZED_CONSTANT + Math.floor(reqZeds*ZEDS_LEVEL_SCALAR);
    }
    else {
        nextLevelZeds = reqZeds + ZED_CONSTANT + Math.floor(reqZeds*ZEDS_OVERLEVEL_SCALAR);
    }

    if (remainingZeds > nextLevelZeds - 1) {
        level += 1;
        remainingZeds = remainingZeds - nextLevelZeds;
        zedsLevel = calcZedLevel(remainingZeds, nextLevelZeds, level);
    }
    else {
        remainingZeds = nextLevelZeds - remainingZeds
        zedsLevel = {level:level, zedsToNext: remainingZeds}
    }

    return zedsLevel;
}

//console.log("5 Zeds =", calcZedLevel(5));
//console.log("20 Zeds = ",calcZedLevel(20));
//console.log("1000 Zeds =", calcZedLevel(500));
//console.log("5952", calcZedLevel(5952));
//console.log("164583", calcZedLevel(164583));
//console.log("1000000", calcZedLevel(1000000));

// 5 => {0,11}
// 20 => {1,14}
// 5952 => {25,522}
// 164_583 => {99,8535}
// 1_000_000 => {levelCurrent: 106, zedsToNext: 332151}
// #endregion



// Tilemap variables
var map;  // Phaser.Tilemaps.Tilemap 
var tileset;
var tileset2;

//  Direction consts
export const LEFT = 3;
export const RIGHT = 4;
export const UP = 1;
export const DOWN = 2;
const START_SPRINT = 5;
const STOP_SPRINT = 6;
export const STOP = 0;

const DIRS = Object.freeze({ 
    UP: 1, 
    DOWN: 2, 
    LEFT: 3, 
    RIGHT: 4,
    STOP: 0, 
}); 


// #region GLOBAL STYLES 
const STYLE_DEFAULT = {
    color: 'white',
    'font-size': '14px',
    'font-family': 'Oxanium',
    'font-weight': '200',
    'text-align': 'center',
    //'text-shadow': ' #FF8FEE 1px 0 2px'
}

const UISTYLE = { 
    color: 'white',
   'font-size': '16px',
   'font-weight': '400',
   'padding': '0px 0px 0px 12px'
   };

const COLOR_SCORE = "yellow";
const COLOR_FOCUS = "fuchsia";
const COLOR_BONUS = "limegreen";
const COLOR_TERTIARY = "goldenrod";


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

export const GState = Object.freeze({ 
    START_WAIT: 1, 
    PLAY: 2, 
    PORTAL: 3, 
    BONK: 4, 
    WAIT_FOR_INPUT: 5,
    TRANSITION: 6
}); 


const DREAMWALLSKIP = [0,1,2];

// #region STAGES_NEXT
const STAGES_NEXT = {
    'Stage-01': ['Stage-02a'], // ['Stage-02a', 'Stage-02b', 'Stage-02c', 'Stage-02d', 'Stage-02e'],
    
    'Stage-02a': ['Stage-03a'],
    'Stage-02b': ['Stage-03a'],
    //'Stage-02c': ['Stage-03b'],
    //'Stage-02d': ['Stage-03b'],
    'Stage-02e': ['Stage-03c'],
    
    'Stage-03a': ['Stage-04'],
    'Stage-03b': ['Stage-04'],
    'Stage-03c': ['Stage-04'],
    
    'Stage-04': ['Stage-05'],
    'Stage-05': ['Stage-06'],
    'Stage-06': ['Stage-07'],
    'Stage-07': ['Stage-08'],
    'Stage-08': ['Stage-09'],
    'Stage-09': ['Stage-10'],
    'Stage-10': ['Stage-11'],
    'Stage-11': ['Stage-12'],
    'Bonus-Stage-x1': [],
    'testing04': ['Stage-02a','Stage-02b','Stage-02c','Stage-02d','Stage-02e'],
    'testing-05': ['Stage-03a'],

    'testing02': ['testing03-1'],
    'testing03-1': ['testing05-1'],
    'testing05-1': ['testing05-2'],
    'testing05-2': ['testing06'],
    'testing06': ['testing06-2'],
    'testing06-2': ['testing03-2'],
    'testing03-2': ['testing08'],
    'testing08': ['testing'],
}
// #region START STAGE
const START_STAGE = 'Stage-01'; // Warning: Cap sensitive in the code but not in Tiled. Can lead to strang bugs.
var END_STAGE = 'Stage-12'; // Is var because it is set during debugging UI






class StartScene extends Phaser.Scene {
    constructor () {
        super({key: 'StartScene', active: true});
    }
    init() {
        // #region StartScene()
        this.attempts = 1;
        this.stageHistory = [];
        this.globalFoodLog = [];
    }

    preload() {
        this.load.image('howToCard', 'assets/howToCardNew.png');
        this.load.image('helpCard02', 'assets/HowToCards/howToCard02.png');

        this.load.image('UIbg', 'assets/sprites/UI_background.png');
        this.load.image('bg01', 'assets/sprites/background01.png');
        this.load.image('bg02', 'assets/sprites/background02.png');
        this.load.image('bg02mask', 'assets/sprites/background02_mask.png');
        this.load.image('bg02frame2', 'assets/sprites/background02_frame2.png');
        this.load.image('bg02_2', 'assets/sprites/background02_2.png');
        this.load.image('bg02_3', 'assets/sprites/background02_3.png');
        this.load.image('bg02_3_2', 'assets/sprites/background02_3_2.png');
        this.load.image('bg02_4', 'assets/sprites/background02_4.png');

        this.load.spritesheet('portals', 'assets/sprites/portalAnim.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('snakeDefault', ['assets/sprites/snakeSheetDefault.png','assets/sprites/snakeSheetDefault_n.png'], { frameWidth: GRID, frameHeight: GRID });

        this.load.image('portalParticle01','assets/sprites/portalParticle01.png')
        // Tilemap
        this.load.image('tileSheetx24', ['assets/Tiled/tileSheetx24.png','assets/Tiled/tileSheetx24_n.png']);

        // Load Tilemap as Sprite sheet to allow conversion to Sprites later.
        this.load.spritesheet('tileSprites', ['assets/Tiled/tileSheetx24.png','assets/Tiled/tileSheetx24_n.png'], { frameWidth: GRID, frameHeight: GRID });




                //this.load.tilemapTiledJSON('map', 'assets/Tiled/Stage1.json');

        // GameUI
        //this.load.image('boostMeter', 'assets/sprites/boostMeter.png');
        this.load.spritesheet('boostMeterAnim', 'assets/sprites/UI_boostMeterAnim.png', { frameWidth: 256, frameHeight: 48 });
        this.load.image('boostMeterFrame', 'assets/sprites/UI_boostMeterFrame.png');
        this.load.image('atomScoreFrame', 'assets/sprites/UI_atomScoreFrame.png');
        this.load.image("mask", "assets/sprites/boostMask.png");
        this.load.image('scoreScreenBG', 'assets/sprites/UI_ScoreScreenBG01.png');
        this.load.image('scoreScreenBG2', 'assets/sprites/UI_ScoreScreenBG02.png');
        this.load.spritesheet('ranksSheet', ['assets/sprites/ranksSpriteSheet.png','assets/sprites/ranksSpriteSheet_n.png'], { frameWidth: 48, frameHeight: 72 });
        this.load.spritesheet('downArrowAnim', 'assets/sprites/UI_ArrowDownAnim.png',{ frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('twinkle01Anim', 'assets/sprites/twinkle01Anim.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('twinkle02Anim', 'assets/sprites/twinkle02Anim.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('twinkle03Anim', 'assets/sprites/twinkle03Anim.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("comboLetters", "assets/sprites/comboLetters.png",{ frameWidth: 36, frameHeight: 48 });

        this.load.image("snakeMask", "assets/sprites/snakeMask.png");
        this.load.image("portalMask", "assets/sprites/portalMask.png");

        // Animations
        this.load.spritesheet('electronCloudAnim', 'assets/sprites/electronCloudAnim.png', { frameWidth: 44, frameHeight: 36 });
        this.load.spritesheet('atomicPickup01Anim', 'assets/sprites/atomicPickup01Anim.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('coinPickup01Anim', 'assets/sprites/coinPickup01Anim.png', { frameWidth: 32, frameHeight:32 });
        this.load.spritesheet('startingArrowsAnim', 'assets/sprites/startingArrowsAnim.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('fruitAppearSmokeAnim', 'assets/sprites/fruitAppearSmokeAnim.png', { frameWidth: 52, frameHeight: 52 }); //not used anymore, might come back for it -Holden    
        this.load.spritesheet('dreamWallAnim', 'assets/sprites/wrapBlockAnimOLD.png', { frameWidth: GRID, frameHeight: GRID });
        this.load.spritesheet('boostTrailX', 'assets/sprites/boostTrailX01Anim.png', { frameWidth: 24, frameHeight: 72 });
        this.load.spritesheet('snakeOutlineBoosting', 'assets/sprites/snakeOutlineAnim.png', { frameWidth: 28, frameHeight: 28 });
        this.load.spritesheet('snakeOutlineBoostingSmall', 'assets/sprites/snakeOutlineSmallAnim.png', { frameWidth: 28, frameHeight: 28 });


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

        const ourTimeAttack = this.scene.get('TimeAttackScene');


        ///
        

        // Load all animations once for the whole game.
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

            // #region SCORE DEBUG
            if (SCORE_SCENE_DEBUG) {
                
                var ourUI = this.scene.get("UIScene");
                var ourGame = this.scene.get("GameScene");
                var ourInput = this.scene.get("InputScene");
            

                ourGame.stageUUID = "3026c8f1-2b04-479c-b474-ab4c05039999";
                ourGame.stageDiffBonus = 140;
                ourGame.stage = END_STAGE;
                //END_STAGE = "Stage-01";

                ourUI.score = 12345;
                ourUI.bonks = 3;
                ourUI.length = 28;
                ourUI.scoreHistory = [87,98,82,92,94,91,85,86,95,95,83,93,86,96,91,92,95,75,90,98,92,96,93,66,86,91,80,90];
                ourUI.zedLevel = 77;
                ourUI.medals = {
                    "fast":'silver',
                    "Rank":'gold'
                }

                ourInput.turns = 79;
                ourInput.cornerTime = 190;
                ourInput.boostTime = 400;

                var stage01 = new StageData("Stage-01", [82, 98, 95, 89, 85, 96, 98, 85, 91, 91, 87, 88, 89, 93, 90, 97, 95, 81, 88, 80, 90, 97, 82, 91, 97, 88, 89, 85], "3026c8f1-2b04-479c-b474-ab4c05039999", false);
                var stage02 = new StageData("Stage-02a", [92, 90, 87, 90, 78, 88, 95, 99, 97, 80, 96, 87, 91, 87, 85, 91, 90, 94, 66, 84, 87, 70, 85, 92, 90, 86, 99, 94], "2a704e17-f70e-45f9-8007-708100e9f592", true);
                var stage03 = new StageData("Stage-03a", [88, 87, 90, 84, 97, 93, 79, 77, 95, 92, 96, 99, 89, 86, 80, 97, 97, 83, 96, 79, 89, 97, 63, 83, 97, 98, 91, 97], "51cf859f-21b1-44b3-8664-11e9fd80b307", true);

                this.stageHistory = [stage01, stage02, stage03];
                this.scene.start('ScoreScene');
            }
            else {
                this.scene.launch('UIScene');
                this.scene.launch('GameScene');
                //var ourGameScene = this.scene.get("GameScene");
                //console.log(e)
            }
            this.scene.stop();
        })
    }

    end() {

    }
}

class PersistentScene extends Phaser.Scene {
    constructor () {
        super({key: 'PersistentScene', active: true});
    }

    init() {
        this.zeds = 0;
        this.sumOfBest = 0;
        this.stagesComplete = 0;
        this.coins = 24;
    }
    
    preload(){
        this.load.spritesheet('coinPickup01Anim', 'assets/sprites/coinPickup01Anim.png', { frameWidth: 32, frameHeight:32 });


    }
    
    create() {

    // #region Bottom Bar

    this.anims.create({
        key: 'coin01idle',
        frames: this.anims.generateFrameNumbers('coinPickup01Anim',{ frames: [ 0,1,2,3,4,5,6]}),
        frameRate: 8,
        repeat: -1
      })

    // Is Zero if there is none.

    var rawZeds = localStorage.getItem(`zeds`);
    // Catch if any reason undefined gets saved to localstorage
    if (rawZeds === 'undefined') {
        rawZeds = 0;
    }
    
    this.zeds = Number(JSON.parse(rawZeds));
    var zedsObj = calcZedLevel(this.zeds);
    
    calcSumOfBest(this);

    const styleBottomText = {
        "font-size": '12px',
        "font-weight": 400,
        "text-align": 'right',
    }   

    this.zedsUI = this.add.dom(GRID * 0.5, SCREEN_HEIGHT - 12, 'div', Object.assign({}, STYLE_DEFAULT, 
        styleBottomText
        )).setHTML(
            `<span style ="color: limegreen;
            font-size: 16px;
            border: limegreen solid 1px;
            border-radius: 5px;
            padding: 1px 4px;">L${zedsObj.level}</span> ZEDS : <span style ="color:${COLOR_BONUS}">${commaInt(zedsObj.zedsToNext)} to Next Level.</span>`
    ).setOrigin(0,0.5);


    /*this.sumOfBestUI = this.add.dom(GRID * 7, SCREEN_HEIGHT - 12, 'div', Object.assign({}, STYLE_DEFAULT,
        styleBottomText    
        )).setHTML(
            `SUM OF BEST : <span style="color:goldenrod">${commaInt(this.sumOfBest)}</span>`
    ).setOrigin(0,0.5);*/

    /*this.stagesCompleteUI = this.add.dom(GRID * 16, SCREEN_HEIGHT - 12, 'div', Object.assign({}, STYLE_DEFAULT,
        styleBottomText    
        )).setText(
            `STAGES COMPLETE : ${commaInt(this.stagesComplete)}`
    ).setOrigin(0,0.5);*/

    this.gameVersionUI = this.add.dom(SCREEN_WIDTH - 4, SCREEN_HEIGHT, 'div', Object.assign({}, STYLE_DEFAULT, {
        'font-size': '12px',
        })).setText(
            `snakehole.${GAME_VERSION}`
    ).setOrigin(1,1);


    }
    update() {

    }

}

class GameScene extends Phaser.Scene {
    // #region GameScene

    constructor () {
        super({key: 'GameScene', active: false});
    }
    
    
    init(props) {
        
        // #region Init Vals
        // Arrays for collision detection
        this.atoms = [];
        this.foodHistory = [];
        this.walls = [];
        this.portals = [];
        this.dreamWalls = [];

        this.lastMoveTime = 0; // The last time we called move()
        this.nextScore = 0; // Calculated and stored after score screen finishes.


        // Boost Array
        this.boostOutlinesBody = [];
        //this.boostOutlines.length = 0; //this needs to be set to 1 on init or else a lingering outline persists on space-down
        this.boostOutlinesSmall;
        this.boostGhosts = [];

        // Sounds
        this.atomSounds = [];
        this.portalSounds = [];
        this.pointSounds = [];

        // Make a copy of Portal Colors.
        // You need Slice to make a copy. Otherwise it updates the pointer only and errors on scene.restart()
        this.portalColors = PORTAL_COLORS.slice();

        this.stageOver = false; // deprecated to be removed

        this.winned = false; // marked as true any time this.winCondition is met.

        const { stage = START_STAGE } = props 
        this.stage = stage;
        
        this.startingArrowState = true; // Deprecate

        this.moveInterval = SPEED_WALK;

        // Flag used to keep player from accidentally reseting the stage by holding space into a bonk
        this.pressedSpaceDuringWait = false; 

        // Special flags
        this.ghosting = false;
        this.bonkable = true; // No longer bonks when you hit yourself or a wall
        this.stepMode = false; // Stops auto moving, only pressing moves.
        
        this.DARK_MODE = DARK_MODE;
        this.lightMasks = [];
        this.hasGhostTiles = false;
        this.wallVarient = ''; // Used for Fungible wall setups.
        this.varientIndex = 0;
         
    }
    
    
    preload () {
        

        this.load.tilemapTiledJSON(this.stage, `assets/Tiled/${this.stage}.json`);

    }

    create () {

        const ourInputScene = this.scene.get('InputScene');
        const ourGameScene = this.scene.get('GameScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourTimeAttack = this.scene.get('TimeAttackScene');
        const ourPersistent = this.scene.get('PersistentScene');

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

        // #region TileMap

        // Tilemap
        this.map = this.make.tilemap({ key: this.stage, tileWidth: GRID, tileHeight: GRID });
        this.stageUUID = this.map.properties[0].value; // Loads the UUID from the json file directly.
        this.stageDiffBonus = this.map.properties[1].value; // TODO: Get them by name and throw errors.

        ourPersistent.gameVersionUI.setText(`snakehole.${GAME_VERSION} -- ${this.stage}`);
        // Write helper function that checks all maps have the correct values. With a toggle to disable for the Live version.

        this.tileset = this.map.addTilesetImage('tileSheetx24');

        // #region Wall Varients
        if (this.map.getLayer('Wall_1')) {
            /***
             * Check if there are Fungible wall varients.
             */

            var wallIndex = 1;
            var wallVarients = [];

            while (this.map.getLayer(`Wall_${wallIndex}`)) {
                wallVarients.push(wallIndex);
                wallIndex++;
            }

            this.varientIndex = Phaser.Math.RND.pick(wallVarients)
            this.wallVarient = "Wall_" + this.varientIndex;
        } else {
            this.wallVarient = "Wall";
        }

        this.wallLayer = this.map.createLayer(this.wallVarient, [this.tileset]).setPipeline('Light2D');
        this.wallLayer.setDepth(25);

        if (this.map.getLayer('Ghost-1')) {
            this.hasGhostTiles = true;
            this.ghostWallLayer = this.map.createLayer('Ghost-1', [this.tileset]).setTint(0xff00ff).setPipeline('Light2D');
            this.ghostWallLayer.setDepth(26);
        }

        if (this.map.getLayer('Food')) {
            this.foodLayer = this.map.createLayer('Food', [this.tileset]);
            this.foodLayer.visible = false;

            this.foodLayer.forEachTile(_tile => {
                if(11 === _tile.index) {
                    var food = new Food(this);
                    food.x = _tile.x*GRID;
                    food.y = _tile.y*GRID;

                    food.electrons.x = _tile.x*GRID;
                    food.electrons.y = _tile.y*GRID;
                }
            })
        }
        

        // Add ghost wall layer here. @holden
        
        
    
        // add background

        // for changing bg sprites
        this.bgTimer = 0;

        // Placeholder Solution; dark grey sprite behind UI components used to mask the lights created from the normal maps
        this.UIbackground = this.add.sprite(0, 0,'UIbg').setDepth(40).setOrigin(0,0);
        this.UIbackground.setScale(4) 

        // Furthest BG Object
        this.bg0 = this.add.tileSprite(0, GRID*2, 744, 744,'bg02_4').setDepth(-4).setOrigin(0,0); 
        this.bg0.tileScaleX = 3
        this.bg0.tileScaleY = 3

        // Scrolling BG1
        this.bg = this.add.tileSprite(0, GRID*2, 744, 744, 'bg02').setDepth(-3).setOrigin(0,0);
        this.bg.tileScaleX = 3;
        this.bg.tileScaleY = 3;
        
        // BG Mask
        this.mask = this.make.tileSprite({  //@holden name that says more what this mask is would be nice. I can't tell just by reading it.
            x: SCREEN_WIDTH/2,
            y: SCREEN_HEIGHT/2,
            key: 'bg02mask',
            add: false
        }).setOrigin(.5,.5);
        
        const mask = this.mask
        mask.scale = 3
        this.bg.mask = new Phaser.Display.Masks.BitmapMask(this, mask); 
        
        // Scrolling BG2 Planets
        this.bg2 = this.add.tileSprite(0, GRID*2, 768, 768, 'bg02_2').setDepth(-1).setOrigin(0,0);
        this.bg2.tileScaleX = 3;
        this.bg2.tileScaleY = 3;
        
        // Scrolling BG3 Stars (depth is behind planets)
        this.bg3 = this.add.tileSprite(0, GRID*2, 768, 768, 'bg02_3').setDepth(-2).setOrigin(0,0);
        this.bg3.tileScaleX = 3;
        this.bg3.tileScaleY = 3;

        // Hue Shift
        this.fx = this.bg.preFX.addColorMatrix();
        this.fx2 = this.bg0.preFX.addColorMatrix();


        if (this.stage === "Stage-04") {
            this.fx.hue(330);
        }
        //this.fx.hue(0);
        //this.fx2.hue(0);

        /*const tween = this.tweens.addCounter({
            from: 0,
            to: 360,
            duration: 15000,
            loop: -1,
            onUpdate: () => {
                fx.hue(tween.getValue()),
                fx2.hue(tween.getValue());
            }
        });*/


        let _x = this.snake.head.x;
        let _y = this.snake.head.y;
        

        if (!this.map.hasTileAtWorldXY(GRID * 15, GRID * 14)) {
            this.startingArrowsAnimN = this.add.sprite(_x + 12, _y - 24).setDepth(51).setOrigin(0.5,0.5);
            this.startingArrowsAnimN.play('idle');
        }
        if (!this.map.hasTileAtWorldXY(GRID * 15, GRID * 16)) {
            this.startingArrowsAnimS = this.add.sprite(_x + 12, _y + 48).setDepth(51).setOrigin(0.5,0.5);
            this.startingArrowsAnimS.flipY = true;
            this.startingArrowsAnimS.play('idle');
        }
        if (!this.map.hasTileAtWorldXY(GRID * 16, GRID * 15)) {
            this.startingArrowsAnimE = this.add.sprite(_x + 48, _y + 12).setDepth(51).setOrigin(0.5,0.5);
            this.startingArrowsAnimE.angle = 90;
            this.startingArrowsAnimE.play('idle');
        }
        if (!this.map.hasTileAtWorldXY(GRID * 14, GRID * 15)) {
            this.startingArrowsAnimW = this.add.sprite(_x - 24, _y + 12).setDepth(51).setOrigin(0.5,0.5);
            this.startingArrowsAnimW.angle = 270;
            this.startingArrowsAnimW.play('idle');
        }
        

        var wrapBlock01 = this.add.sprite(0, GRID * 2).play("wrapBlock01").setOrigin(0,0).setDepth(15);
        var wrapBlock03 = this.add.sprite(GRID * END_X, GRID * 2).play("wrapBlock03").setOrigin(0,0).setDepth(15);
        var wrapBlock06 = this.add.sprite(0, GRID * END_Y - GRID).play("wrapBlock06").setOrigin(0,0).setDepth(15);
        var wrapBlock08 = this.add.sprite(GRID * END_X, GRID * END_Y - GRID).play("wrapBlock08").setOrigin(0,0).setDepth(15);

        this.dreamWalls = [wrapBlock01, wrapBlock03, wrapBlock06, wrapBlock08];

        //var boostTrailX = this.add.sprite(24, 72).play("boostTrailX01").setOrigin(0,0)
        
        this.lightMasksContainer = this.make.container(0, 0);
         
            this.lights.enable();
            if (!DARK_MODE) { // this checks for false so that an ambient color is NOT created when DARK_MODE is applied
                this.lights.setAmbientColor(0xE4E4E4);
            }
        

        this.scrollFactorX = 0
        this.scrollFactorY = 0
        this.bgCoords = new Phaser.Math.Vector2(0,0)

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
        this.snakeCrash = this.sound.add('snakeCrash'); // Move somewhere

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

        // Starting Game State
        this.gState = GState.START_WAIT;
        console.log("GSTATE === START_WAIT", this.gState === GState.START_WAIT);

        // Define keys       

        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');
        
        // #region Keyboard Inputs
        this.input.keyboard.on('keydown', e => {
            // run with as small of a delay as possible for input responsiveness
            // 
            
            let gState = this.gState;

            if (gState === GState.START_WAIT || gState === GState.PLAY || gState === GState.WAIT_FOR_INPUT) {
                if(gState === GState.START_WAIT || gState === GState.WAIT_FOR_INPUT){
                    this.lastMoveTime = this.time.now;
                }
                ourInputScene.moveDirection(this, e);
                
                
                if (this.boostOutlinesBody.length > 0 && e.code != "Space") {
                    
                    var lastElement = this.boostOutlinesBody.shift();
                    lastElement.destroy();
    
                    // Make the new one
                    var boostOutline = this.add.sprite(
                        this.snake.head.x, 
                        this.snake.head.y
                    ).setOrigin(.083333,.083333).setDepth(8);
                    
                    boostOutline.play("snakeOutlineAnim");
                    this.boostOutlinesBody.push(boostOutline);

                    this.boostOutlineTail.x = this.snake.body[this.snake.body.length -1].x;
                    this.boostOutlineTail.y = this.snake.body[this.snake.body.length -1].y;
                }
            }

            if (gState === GState.PORTAL) {
                // Update snake facing direction but do not move the snake
                ourInputScene.updateDirection(this, e);  
            }

            if (gState === GState.WAIT_FOR_INPUT) {
                this.pressedSpaceDuringWait = true;
            }

            // For GState Bonk and  SceneTransition hold move inputs


        })
        this.input.keyboard.on('keydown-SPACE', e => {
            
            if (this.gState != GState.BONK && this.gState != GState.TRANSITION) {
            // #region Boost Outlines
                this.boostOutlinesBody = [];
                for (let index = 0; index < this.snake.body.length; index++) {
                
                    var boostOutline = this.add.sprite(
                        this.snake.body[index].x, 
                        this.snake.body[index].y
                    ).setOrigin(.083333,.083333).setDepth(8);
                    boostOutline.alpha = 0;
                    var fadeinTween = this.tweens.add({
                        targets: boostOutline,
                        alpha: 100,
                        duration: 200,
                        ease: 'linear'
                        }, this);

                    if (index < this.snake.body.length -1) {
                        // For all the body segments
                        boostOutline.play("snakeOutlineAnim");
                        this.boostOutlinesBody.unshift(boostOutline);
                    }
                    else{
                        // on taill
                        boostOutline.play("snakeOutlineSmallAnim");
                        this.boostOutlineTail = boostOutline;
                    }
                }
            }
        });

        this.input.keyboard.on('keyup-SPACE', e => { 
            if (this.boostOutlinesBody.length > 0 || this.boostOutlineTail){
                ////debugger

                // add the tail in.
                this.boostOutlinesBody.push(this.boostOutlineTail);

                this.boostOutlinesBody.forEach(boostOutline =>{ //TODO - Do this in a wave with delay?
                    var fadeoutTween = this.tweens.add({
                        targets: boostOutline,
                        alpha: 0,
                        duration: 340,
                        ease: 'linear'
                      }, this);
    
                    fadeoutTween.on('complete', e => {
                        boostOutline.destroy()
                    });
                });
                this.boostOutlinesBody = [];

            }

            if (DEBUG) { console.log(event.code+" unPress", this.time.now); }
            ourInputScene.inputSet.push([STOP_SPRINT, this.time.now]);

            this.pressedSpaceDuringWait = false;
        });

        this.input.keyboard.on('keydown-M', e => {
            this.bg3.setTexture('bg02_3_2')
        });

        const FADE_OUT_TILES = [104];

        // #region Transition Visual
        this.input.keyboard.on('keydown-N', e => {
            if (this.winned) {

                this.gState = GState.TRANSITION;

                this.snake.head.setTexture('snakeDefault', 0);

                var wallSprites = [];
                var fadeOutSprites = []; 

                this.wallLayer.culledTiles.forEach( tile => {

                    if (tile.y > 1 && tile.y < 30) {
                        
                        var _sprite = this.add.sprite(tile.x*GRID, tile.y*GRID, 'tileSprites', tile.index - 1,
                        ).setOrigin(0,0).setDepth(50);
                        
                        if (FADE_OUT_TILES.includes(tile.index)) {
                            fadeOutSprites.push(_sprite);
                        } else {
                            wallSprites.push(_sprite);
                        }               
                    }
                    
                });
                this.wallLayer.visible = false;

                Phaser.Utils.Array.Shuffle(wallSprites);
                
                var allTheThings = [
                    ...this.coins,
                    ...this.portals,
                    ...this.atoms,
                    ...wallSprites
                ];

                var snakeholeTween = this.tweens.add({
                    targets: this.snake.body, 
                    x: 15 * GRID, //this.pathRegroup.vec.x,
                    y: 15 * GRID, //this.pathRegroup.vec.y,
                    yoyo: false,
                    duration: 500,
                    ease: 'Sine.easeOutIn',
                    repeat: 0,
                    delay: this.tweens.stagger(30)
                });

                

                var blackholeTween = this.tweens.add({
                    targets: allTheThings, 
                    x: 15 * GRID, //this.pathRegroup.vec.x,
                    y: 15 * GRID, //this.pathRegroup.vec.y,
                    yoyo: false,
                    duration: 500,
                    ease: 'Sine.easeOutIn',
                    repeat: 0,
                    delay: this.tweens.stagger(30)
                });

                var fadeoutTween = this.tweens.add({
                    targets: fadeOutSprites,
                    alpha: 0,
                    duration: 1000,
                    ease: 'linear'
                  }, this);


                blackholeTween.on('complete', () => {
                    this.nextStage();
                });
                    
                
            }

        });

        // #endregion

        // Map only contains Walls at this point
        //this.map.forEachTile( tile => {

            // Empty tiles are indexed at -1. 
            // Any tilemap object that is not empty will be considered a wall
            // Index is the sprite value, not the array index.
            //if (tile.index > 0) {  
            //    var wall = new Phaser.Geom.Point(tile.x,tile.y);
            //    this.walls.push(wall);
            //}

        //});
        

        // Make Fruit TODO: USE THE MAP.JSON CUSTOM ATTRIBUTES
        //for (let index = 0; index < FRUIT; index++) {
        //    var food = new Food(this);
        //}

        // #region Coin Logic

        this.coins = []

        var coinVarient = ''
        if (this.varientIndex) {
            coinVarient = `Coin_${this.varientIndex}`;
        } else {
            coinVarient = 'Coin';
        }

        if (this.map.getLayer(coinVarient)) {

            var coinLayer = this.map.createLayer(coinVarient, [this.tileset]);

            coinLayer.forEachTile(tile => {
                if(tile.index > 0) { // -1 = empty tile
                    var _coin = this.add.sprite(tile.x * GRID, tile.y * GRID,'coinPickup01Anim'
                    ).play('coin01idle').setDepth(21).setOrigin(.125,.125);

                    this.coins.push(_coin);
                }
            });
            coinLayer.visible = false;       
        }

        
        
        
        // #region Stage Logic
        
        var makePair = function (scene, to, from) {
            
            var colorHex = Phaser.Utils.Array.RemoveRandomElement(scene.portalColors); // May Error if more portals than colors.
            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, color, to, from);
            var p2 = new Portal(scene, color, from, to);

            p1.targetObject = p2;
            p2.targetObject = p1;

            p1.flipX = true;
            //var randomStart = Phaser.Math.Between(0,5);
            //p1.setFrame(randomStart)
            //p2.setFrame(randomStart)
        }

        // TODO Move out of here
        const PORTAL_X_START = 256; // FYI: TILEs in phaser are 1 indexed, but in TILED are 0 indexed.
        const PORTAL_N_DIFF = 32;


        var portalVarient = ""
        if (this.varientIndex) { // False if 0
            portalVarient = `Portal_${this.varientIndex}`
        } else {
            portalVarient = `Portal`
        }

        // #region Portal-X
        if (this.map.getLayer(`${portalVarient}-X`)) {
            var portalLayerX = this.map.createLayer(`${portalVarient}-X`, [this.tileset]);
            var portalArrayX = [];

            portalLayerX.forEachTile(tile => {

                if (tile.index > 0) {
    
                    if (portalArrayX[tile.index]) {
                        portalArrayX[tile.index].push([tile.x, tile.y]);
                    }
                    else {
                        portalArrayX[tile.index] = [[tile.x, tile.y]];
                    }
                } 
            });

            let toIndex;

            for (let index = PORTAL_X_START + 1; index < PORTAL_X_START + 1 + PORTAL_N_DIFF; index++) {
    
                if (portalArrayX[index]) {
                    // consider throwing an error if a portal doesn't have a correctly defined _to or _from
                    
                    toIndex = index + PORTAL_N_DIFF
                    let _from = Phaser.Math.RND.pick(portalArrayX[index]);
                    let _to = Phaser.Math.RND.pick(portalArrayX[toIndex]);
                    //console.log("Portal X Logic: FROM TO",_from, _to);
                    makePair(this, _to, _from);
                }
            }

            portalLayerX.visible = false;
        }
        // #endregion

        // #region Portal-N

        const portalTileRules = { // TODO Move out of here
            321:99,
            353:1,
            354:1,
            355:1,
            356:1,
            357:1,
            358:1,
            359:1,
            360:1,
            385:2,
            386:2,
            387:2,
            388:2,
            389:2,
            390:2,
            417:3,
            418:3,
            419:3,
            420:3,
            421:3,
            422:3,
            423:3,
            424:3
        };
        
        // FYI: Layers refer to layers in Tiled.
        // Must start at 1 and go up continuously to work correctly. 
        var layerIndex = 1   
        
        while (this.map.getLayer(`${portalVarient}-${layerIndex}`)) {

            //console.log(`Portal-${layerIndex} Logic`);
            var portalLayerN = this.map.createLayer(`${portalVarient}-${layerIndex}`, [this.tileset]);
            var portalArrayN = {};
            
            var toN = [];
            var fromN = [];

            portalLayerN.forEachTile(tile => {

                if (tile.index > 0) {
    
                    if (portalArrayN[tile.index]) {
                        portalArrayN[tile.index].push([tile.x, tile.y]);
                    }
                    else {
                        portalArrayN[tile.index] = [[tile.x, tile.y]];
                    }
                } 
            });

            for (var [key, value] of Object.entries(portalArrayN)) {
                //console.log("Checking TileIndex", key, "has no more than", portalTileRules[key], "portals")

                var count = 0;
                
                // Special Case Block. Put a from portal. 
                // Probably needs to recursively try when portal areas double up.
                if (portalTileRules[key] == undefined) {
                    fromN = Phaser.Math.RND.pick(portalArrayN[key]);

                    delete portalArrayN[key];

                }
                else {
                    //
                    var count = 0;
                    value.forEach(tile => {
                        this.portals.some( portal => {
                            if(portal.x === tile[0]*GRID && portal.y === tile[1]*GRID){
                                count += 1;
                                //console.log("HELP THIS SPACE IS OCUPADO BY PORTAL",portal.x, portal.y);
                            }
                        });
                    });
                    

                    if (count >= portalTileRules[key]) {
                        delete portalArrayN[key];
                        //console.log("DELETING CAUSE PORTAL HERE", key);   
                    }

                }

            }

            // Define From Portal if not yet defined above.
            if (fromN.length < 1) {
                var fromAreaKey = Phaser.Math.RND.pick(Object.keys(portalArrayN));
                var fromArea = portalArrayN[fromAreaKey];
                var fromN = Phaser.Math.RND.pick(fromArea);
                
                delete portalArrayN[fromAreaKey];     
            }

            // Define To Portal Randomly from avalible tiles.
            var toAreaKey = Phaser.Math.RND.pick(Object.keys(portalArrayN));
            var toArea = portalArrayN[toAreaKey];

            toN = Phaser.Math.RND.pick(toArea);
            delete portalArrayN[toAreaKey];

            makePair(this, fromN, toN);
    
            portalLayerN.visible = false;
            layerIndex ++; 
 
        }
        
        // #endregion

        this.portals.forEach(portal => { // each portal adds a light, portal light color, particle emitter, and mask
            var portalLightColor = 0xFFFFFF;
            switch (portal.tintTopLeft) { // checks each portal color and changes its light color
                case 0xFF0000: // RED
                    portalLightColor = 0xFF0000;
                    break;
                case 0xff9900: // ORANGE
                    portalLightColor = 0xC05D00;
                    break;
                case 0xffff00: // YELLOW
                    portalLightColor = 0xACAC04;
                    break;
                case 0x00ff00: // GREEN
                    portalLightColor = 0x00B000;
                    break;
                case 0x00ffff: // CYAN
                    portalLightColor = 0x00FFFF;
                    break;   
                case 0x4a86e8: // BLUE
                    portalLightColor = 0x074FEA;
                    break;        
                case 0x9900ff: // VIOLET
                    portalLightColor = 0x9900FF;
                    break;
                case 0xff00ff: //FUCHSIA
                    portalLightColor = 0xFF00FF;
                    break; 
                default:
                    console.log("default portal color break")
                    break;
            }
            
            this.lights.addLight(portal.x +16, portal.y + 16, 128,  portalLightColor).setIntensity(1.25);
            
            this.add.particles(portal.x, portal.y, "portalParticle01", {
                color: [ portal.tintTopLeft,0x000000, 0x000000],
                colorEase: 'quad.out',
                x:{steps: 2, min: -18, max: 48},
                y:{steps: 2, min: -18, max: 48},
                scale: {start: 1, end: .5},
                speed: 5,
                moveToX: 14,
                moveToY: 14,
                alpha:{start: 1, end: 0 },
            }).setFrequency(332,[1]).setDepth(20);
            
            if (!this.hasGhostTiles) {
                this.portalMask = this.make.image({
                    x: portal.x,
                    y: portal.y,
                    key: 'portalMask',
                    add: false,
                });
                
                this.lightMasks.push(this.portalMask)
            }

        });

        

        //this.add.sprite(GRID * 7, GRID * 8,'coinPickup01Anim'
        //    ).play('coin01idle').setDepth(21).setOrigin(.125,.125);
        //    this.add.sprite(GRID * 5, GRID * 5,'coinPickup01Anim'
        //    ).play('coin01idle').setDepth(21).setOrigin(.125,.125);

        //Phaser.Math.RND.pick(nextGroup)
       

        
        //makePair(this, _to, _from);


        //this.p2Layer = this.map.createLayer('Portal-2', [this.tileset]);


  


        var atom1 = new Food(this);
        var atom2 = new Food(this);
        var atom3 = new Food(this);
        var atom4 = new Food(this);
        var atom5 = new Food(this);


        this.tweens.add({
            targets: this.atoms,
            originY: .125,
            yoyo: true,
            ease: 'Sine.easeOutIn',
            duration: 1000,
            repeat: -1
        });



        // #endregion

        
        //////////// Add things to the UI that are loaded by the game scene.
        // This makes sure it is created in the correct order
        // #region GameScene UI Plug
        const ourUI = this.scene.get('UIScene'); 
        ourUI.bestScoreUI = ourUI.add.dom(10, GRID , 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE));
        ourUI.bestScoreUI.setOrigin(0,1);
        ourUI.bestScoreLabelUI = ourUI.add.dom(GRID * 3, GRID , 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE));
        ourUI.bestScoreLabelUI.setOrigin(0,1);

        // Calculate this locally (FYI: This is the part that needs to be loaded before it can be displayed)
        var bestLogJSON = JSON.parse(localStorage.getItem(`${this.stageUUID}-bestStageData`));       

        if (bestLogJSON) {
            // is false if best log has never existed
            var bestLog = new StageData(bestLogJSON);
            var bestBase = bestLog.calcBase();
        }
        else {
            var bestBase = 0;
        }

        ourUI.bestScoreUI.setText(`BEST :`);
        ourUI.bestScoreLabelUI.setText(bestBase);
        
        // #region Snake Masks
        /***  
         * An additional mask is added for each cardinal direction
         * a screen distance away so screen wraps look cleaner.
         * Used for dark levels and to reveal Ghost Walls
        **/

        // TODO move to snake object?
        this.snakeMask = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'snakeMask',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskN = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'snakeMask',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskE = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'snakeMask',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskS = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'snakeMask',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskW = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'snakeMask',
            add: false
        }).setOrigin(0.5,0.5);

        this.snakeMask.setScale(1); //Note I'd like to be able to set the scale per level so I can fine tune this during level design.


        this.lightMasks.push(this.snakeMask,this.snakeMaskN, this.snakeMaskE, this.snakeMaskS, this.snakeMaskW)

        this.lightMasksContainer.add(this.lightMasks);
        this.lightMasksContainer.setVisible(false);
        if (DARK_MODE) {
            this.wallLayer.mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
            this.snake.body[0].mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
        }
        if (this.hasGhostTiles) {
            this.ghostWallLayer.mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);

        }
        
        // #endregion
        
    }
    screenShake(){
        if (this.moveInterval === SPEED_SPRINT) {
            this.cameras.main.shake(400, .01);
        }
        else if (this.moveInterval === SPEED_WALK){
            this.cameras.main.shake(300, .00625);
        }    
    }
    transitionVisual () {
        
    }

    validSpawnLocations() {
        var testGrid = {};

        // Start with all safe points as true. This is important because Javascript treats 
        // non initallized values as undefined and so any comparison or look up throws an error.
        for (var x1 = 0; x1 <= END_X; x1++) {
            testGrid[x1] = {};
    
            for (var y1 = 2; y1 < END_Y; y1++)
            {
                testGrid[x1][y1] = true;
            }
        }
    
        
        // Make all the unsafe places unsafe

        
        console.log("CHECKING ALL TILES IN THE WALL LAYER");
        this.map.getLayer(this.wallVarient); //if not set, Ghost Walls overwrite and break Black Hole code
        this.wallLayer.forEachTile(wall => {
    
            if (wall.index > 0) {
                
                testGrid[wall.x][wall.y] = false;
            }
        });
        
        if (this.map.getLayer('Ghost-1')) {
            this.ghostWallLayer.forEachTile(wall => {
    
                if (wall.index > 0) {
                    
                    testGrid[wall.x][wall.y] = false;
                }
            });
        }

        if (this.map.getLayer('Food')) {
            this.foodLayer.forEachTile(foodTile => {
    
                if (foodTile.index > 0) {
                    
                    testGrid[foodTile.x][foodTile.y] = false;
                }
            });

        }


        // Don't spawn on Dream Walls


        this.dreamWalls.forEach( dreamwall => {
            testGrid[dreamwall.x/GRID][dreamwall.y/GRID] = false;
        });
        




        // This version for if we decide to build the wall index once and check against only wall values.
        //this.walls.forEach(wall => {
        //    if (wall.x < SCREEN_WIDTH) {
        //        // Hack to sanitize index undefined value
        //        // Current Tiled input script adds additional X values.
        //        testGrid[wall.x][wall.y] = false;
        //    }
        //});

        this.atoms.forEach(_fruit => {
            testGrid[_fruit.x/GRID][_fruit.y/GRID] = false;
        });

        this.portals.forEach(_portal => {
            testGrid[_portal.x/GRID][_portal.y/GRID] = false;
        });

        this.dreamWalls.forEach( _dreamWall => {
            testGrid[_dreamWall.x/GRID][_dreamWall.y/GRID] = false;
        });

        // Don't let fruit spawn on dreamwall blocks
        //scene.dreamWalls.forEach(_dreamWall => {
        //    testGrid[_dreamWall.x/GRID][_dreamWall.y/GRID] = false;
        //});
        
        this.snake.body.forEach(_part => {
            //testGrid[_part.x/GRID][_part.y/GRID] = false;
            //debugger
            if (!isNaN(_part.x) && !isNaN(_part.x) ) { 
                // This goes nan sometimes. Ignore if that happens.
                // Round maths for the case when adding a fruit while the head interpolates across the screen
                testGrid[Math.round(_part.x/GRID)][Math.round(_part.y/GRID)] = false;
            }
            
        });
        

        
        var validLocations = [];
    
        for (var x2 = 0; x2 <= END_X; x2++)
        {
            for (var y2 = 0; y2 <= END_Y; y2++)
            {
                if (testGrid[x2][y2] === true)
                {
                    // Push only valid positions to an array.
                    validLocations.push({x: x2, y: y2});
                }
            }
        }

        return validLocations;

    }

    checkPortalAndMove() {
        let snake = this.snake;

        this.portals.forEach(portal => { 
            if(snake.head.x === portal.x && snake.head.y === portal.y){
                this.gState = GState.PORTAL;
                this.scene.get('UIScene').scoreTimer.paused = true;

                console.log("PORTALING", this.gState);

                if (DEBUG) { console.log("PORTAL"); }

                // Show portal snake body after head arrives.
                if (this.snake.body.length > 2) {
                    portal.snakePortalingSprite.visible = true;   
                }


                var _x = portal.target.x*GRID;
                var _y = portal.target.y*GRID;
    
                var portalSound = this.portalSounds[0]
                portalSound.play();

                var _tween = this.tweens.add({
                    targets: snake.head, 
                    x: _x,
                    y: _y,
                    yoyo: false,
                    duration: SPEED_WALK * PORTAL_PAUSE,
                    ease: 'Linear',
                    repeat: 0,
                    //delay: 500
                });
                
                _tween.on('complete',()=>{
                    this.gState = GState.PLAY;
                    this.scene.get('UIScene').scoreTimer.paused = false;
                    console.log("Game State === PLAY", this.gState === GState.PLAY); // Will be set to PLAY

                    // Show portal snake body after head arrives.
                    if (this.snake.body.length > 2) {
                        portal.targetObject.snakePortalingSprite.visible = true;   
                    }

                    // Set last move to now. Fixes Corner Time.
                    this.lastMoveTime = this.time.now;
                });
                                    
                return ;  //Don't know why this is here but I left it -James
            }
        });
    }
    
    applyMask(){ // TODO: move the if statement out of this function also move to Snake.js
        if (DARK_MODE) {
            this.snake.body[this.snake.body.length -1].mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
        }
    }

    vortexIn(target, x, y){

        var vortexTween = this.tweens.add({
            targets: target, 
            x: x * GRID, //this.pathRegroup.vec.x,
            y: y * GRID, //this.pathRegroup.vec.y,
            yoyo: false,
            duration: 500,
            ease: 'Sine.easeOutIn',
            repeat: 0,
            delay: this.tweens.stagger(30)
        });

        return vortexTween
    }

    snakeEating(){
        
        var snakeEating = this.tweens.add({
            targets: this.snake.body, 
            scale: [1.25,1],
            yoyo: false,
            duration: 64,
            ease: 'Linear',
            repeat: 0,
            delay: this.tweens.stagger(SPEED_SPRINT)
        });

        return snakeEating
    }

    checkWinCon() { // Returns Bool
        const ourUI = this.scene.get('UIScene');
        return ourUI.length >= LENGTH_GOAL
    }

    checkLoseCon() {
        const ourPersistent = this.scene.get("PersistentScene");
        return ourPersistent.coins < 0;
    }

    nextStage() {
        const ourUI = this.scene.get('UIScene');
        const ourInputScene = this.scene.get("InputScene");

        var nextStages = STAGES_NEXT[this.stage]
        var nextStage = Phaser.Math.RND.pick(nextStages); // TODO Add Check for unlocks on each stage.

        ourUI.scene.restart( { score: this.nextScore, lives: ourUI.lives } );
        this.scene.restart( { stage: nextStage } );
        ourInputScene.scene.restart();

        // Add if time attack code here
        //ourGame.scene.stop();
        //ourScoreScene.scene.switch('TimeAttackScene');

    }

    // #region Game Update
    update (time, delta) {

        const ourUI = this.scene.get('UIScene'); // Probably don't need to set this every loop. Consider adding to a larger context.
        const ourInputScene = this.scene.get('InputScene');
        // console.log("update -- time=" + time + " delta=" + delta);
        var energyAmountX = ourUI.energyAmount; // ourUI.energyAmount can't be called further down so it's defined here. Additionally, due to scene crashing, the function can't be called without crashing

        var spawnPoint = new Phaser.Geom.Point(GRID * 15, GRID * 15)
        
        // Floating Electrons
        this.atoms.forEach(atom=> {
            atom.electrons.originY = atom.originY + .175
            
        });
        

        if (this.gState === GState.PORTAL || this.gState === GState.BONK) { 
            
            this.snake.snakeLight.x = this.snake.head.x
            this.snake.snakeLight.y = this.snake.head.y

            this.snakeMask.x = this.snake.head.x
            this.snakeMask.y = this.snake.head.y

            this.staggerMagnitude -= 0.5
            //this.curveRegroup.x = GRID * 15
            //this.curveRegroup.y = GRID * 15
            
        }
        
        //this.scrollFactorX += .025;
        //this.scrollFactorY += .025;

        //this.bgCoords.x = (this.snake.head.x /40) + this.scrollFactorX;
        //this.bgCoords.y = (this.snake.head.y /40) + this.scrollFactorY;

        // not all of these need to be interpolated; wastes processing

        this.mask.tilePositionX = (Phaser.Math.Linear(this.bg.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * -4;
        this.mask.tilePositionY = (Phaser.Math.Linear(this.bg.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * -4;

        this.bg0.tilePositionX = (Phaser.Math.Linear(this.bg.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * 0.25;
        this.bg0.tilePositionY = (Phaser.Math.Linear(this.bg.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * 0.25;

        this.bg.tilePositionX = (Phaser.Math.Linear(this.bg.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * 1;
        this.bg.tilePositionY = (Phaser.Math.Linear(this.bg.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * 1;
            
        this.bg2.tilePositionX = (Phaser.Math.Linear(this.bg.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * 2;
        this.bg2.tilePositionY = (Phaser.Math.Linear(this.bg.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * 2;

        this.bg3.tilePositionX = (Phaser.Math.Linear(this.bg.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * 0.5;
        this.bg3.tilePositionY = (Phaser.Math.Linear(this.bg.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * 0.5;

        // #region Hold Reset
        if (this.spaceKey.getDuration() > RESET_WAIT_TIME 
            && this.pressedSpaceDuringWait 
            && this.gState === GState.WAIT_FOR_INPUT
            && !this.winned
        ) {
                console.log("SPACE LONG ENOUGH BRO");
 
                this.events.off('addScore');

                const ourUI = this.scene.get('UIScene');
 
                ourUI.lives -= 1;
                ourUI.scene.restart( { score: ourUI.stageStartScore, lives: ourUI.lives });
                //ourUIScene.scene.restart();
                this.scene.restart();
        }

        

        // #region Bonk and Regroup
        if (this.gState === GState.BONK) {
            /***  
             * Checks for Tween complete on each frame.
             * on. ("complete") is not run unless it is checked directly. It is not on an event listener
            ***/ 
            this.tweenRespawn.on('complete', () => {
    
                // Turn back on arrows
                this.startingArrowState = true;
                this.startingArrowsAnimN.setVisible(true);
                this.startingArrowsAnimS.setVisible(true);
                this.startingArrowsAnimE.setVisible(true);
                this.startingArrowsAnimW.setVisible(true);
                
                this.gState = GState.WAIT_FOR_INPUT;
                this.scene.get('UIScene').scoreTimer.paused = true;
                console.log(this.gState, "WAIT FOR INPUT");
            });
        }
        
        // #region Win State
        if (this.checkWinCon() && !this.winned) {

            console.log("YOU WIN" , this.stage);
            this.winned = true;

            ourUI.scoreUI.setText(`Stage: ${ourUI.scoreHistory.reduce((a,b) => a + b, 0)}`);

            this.gState = GState.TRANSITION;
            
            this.events.off('addScore');
            
            ourUI.scene.launch('ScoreScene');
        }

        // #region Lose State
        if (this.checkLoseCon()) {
            var coinUIText = this.add.dom(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'div', Object.assign({}, STYLE_DEFAULT,
                {
                    "font-size": '32px',
                    "text-align": 'center',
                    "text-shadow": '2px 2px 4px #000000',
                    "white-space": 'pre-line'
                }
                )).setHTML(
                `\u{1F480} 
                GAMEOVER
                ON
                ${this.stage}
                Better Luck Next Time...` 
            ).setOrigin(0.5,0.5);

            this.scene.get("UIScene").coinUIText.setHTML(
                ` \u{1F480}`
            )



            this.scene.pause("GameScene");
            
        }


        // #endregion
        this.bgTimer += delta;

        if(this.bgTimer >= 1000){ // TODO: not set this every Frame.
            this.bg3.setTexture('bg02_3_2') 
            this.bg.setTexture('bg02frame2') 
            if (this.bgTimer >= 2000) {
                this.bg3.setTexture('bg02_3')
                this.bg.setTexture('bg02') 
                this.bgTimer = 0
            }   
        }


        if(time >= this.lastMoveTime + this.moveInterval && this.gState === GState.PLAY) {
            this.lastMoveTime = time;
            // #region Check Update

            // could we move this into snake.move()
            this.snakeMask.x = this.snake.head.x
            this.snakeMask.y = this.snake.head.y

            this.snakeMaskN.x = this.snake.head.x
            this.snakeMaskN.y = this.snake.head.y + SCREEN_HEIGHT

            this.snakeMaskE.x = this.snake.head.x + SCREEN_WIDTH
            this.snakeMaskE.y = this.snake.head.y

            this.snakeMaskS.x = this.snake.head.x
            this.snakeMaskS.y = this.snake.head.y - SCREEN_HEIGHT

            this.snakeMaskW.x = this.snake.head.x - SCREEN_WIDTH
            this.snakeMaskW.y = this.snake.head.y
            //Phaser.Math.Between(0, 9);

            
            //let snakeTail = this.snake.body.length-1; //original tail reference wasn't working --bandaid fix -Holden
            
            
            // This code calibrates how many milliseconds per frame calculated.
            // console.log(Math.round(time - (this.lastMoveTime + this.moveInterval)));
 
            

            if (this.portals.length > 0) {
            
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
                }
            } // End Closest Portal
            
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
            /*if(this.spaceKey.isDown && energyAmountX > 0) {
                var boostGhost = this.add.sprite(
                    this.snake.body[this.snake.body.length -1].x, 
                    this.snake.body[this.snake.body.length -1].y, 
                    'snakeDefault', 3);
                boostGhost.setOrigin(0,0).setDepth(0);


                this.boostGhosts.push(boostGhost);
            }*/
            if (this.boostOutlinesBody.length > 0) {

                
            }
            
            
            if (this.gState === GState.PLAY) {
                // Move at last second
                this.snake.move(this);
                ourInputScene.moveHistory.push([this.snake.head.x/GRID, this.snake.head.y/GRID , this.moveInterval]);
                ourInputScene.moveCount += 1;

                this.checkPortalAndMove()


                if (energyAmountX < 1) {
                    // add the tail in.
                    this.boostOutlinesBody.push(this.boostOutlineTail);
    
                    this.boostOutlinesBody.forEach(boostOutline =>{
                        var fadeoutTween = this.tweens.add({
                            targets: boostOutline,
                            alpha: 0,
                            duration: 340,
                            ease: 'linear'
                            }, this);
    
                        fadeoutTween.on('complete', e => {
                            boostOutline.destroy()
                        });
                    });
                    this.boostOutlinesBody = [];
                    
                } 
            }

            //var boosting
                   
            //this.spaceKey.isDown


            if(this.boostOutlinesBody.length > 0){ //needs to only happen when boost bar has energy, will abstract later
                // Get ride of the old one
                if (this.boostOutlinesBody.length > 0) {
                    var toDelete = this.boostOutlinesBody.shift();
                    toDelete.destroy();
    
                    // Make the new one
                    var boostOutline = this.add.sprite(
                        this.snake.head.x, 
                        this.snake.head.y
                    ).setOrigin(.083333,.083333).setDepth(8);
                    
                    boostOutline.play("snakeOutlineAnim");
                    this.boostOutlinesBody.push(boostOutline);
                    
                }
                    this.boostOutlineTail.x = this.snake.body[this.snake.body.length -1].x;
                    this.boostOutlineTail.y = this.snake.body[this.snake.body.length -1].y;

            }
            



            // #region boost update
 
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

const COPPER = 0;
const BRONZE = 1;
const SILVER = 2;
const GOLD = 3;
const PLATINUM = 4;

// #region Stage Data
var StageData = new Phaser.Class({

    initialize:

    function StageData(props)
    {
        // this is the order you'll see printed in the console.
        this.stage = props.stage;

        this.bonks = props.bonks;
        this.boostFrames = props.boostFrames;
        this.cornerTime = props.cornerTime;
        this.diffBonus = props.diffBonus;
        this.foodLog = props.foodLog;
        this.medals = props.medals;
        this.moveCount = props.moveCount;
        this.zedLevel = props.zedLevel;

        this.uuid = props.uuid;
        this.foodHistory = props.foodHistory;
        this.moveHistory = props.moveHistory;

        this.medianSpeedBonus = 6000;

    },

    toString(){
        return `${this.stage}`;
    },

    calcBase() {
        var stageScore = this.foodLog.reduce((a,b) => a + b, 0);
        return stageScore;
    },
    
    calcBonus() {
        var base = this.calcBase()
        return calcBonus(base);
    },

    stageRank() {
        let rank;
        let bonusScore = this.calcBonus();

        switch (true) {
            case bonusScore > this.medianSpeedBonus * 2:
                rank = PLATINUM;
                break;
            case bonusScore > this.medianSpeedBonus * 1.5:
                rank = GOLD;
                break;
            case bonusScore > this.medianSpeedBonus:
                rank = SILVER;
                break;
            case bonusScore > this.medianSpeedBonus * .5:
                rank = BRONZE;
                break;
            default:
                rank = COPPER;
        }

        return rank;

    },

    preAdditive() {
        return this.calcBase() + calcBonus(this.calcBase());
    },

    zedLevelBonus() {
        return this.zedLevel / 200;
    },

    medalBonus() {
        return Object.values(this.medals).length / 1000;
    },

    bonusMult() {
        var zedLevelBonus = this.zedLevelBonus();
        var medalBonus = this.medalBonus();
        return Number(this.diffBonus/100 + zedLevelBonus + medalBonus);
        
    },

    postMult() {
        return this.preAdditive() * this.bonusMult();
    },
    
    bonkBonus(){
        var _bonkBonus = Math.floor(NO_BONK_BASE / (this.bonks+1))

        if (_bonkBonus > 49) {
            return _bonkBonus;
        }
        else {
            return 0;
        }
    },
    
    cornerBonus() {
        return Math.ceil(this.cornerTime / 100) * 10;
    },

    boostBonus() {
        return Math.ceil(this.boostFrames / 10) * 5;
    },
    
    calcTotal() {
        var _postMult = this.postMult();
        var _bonkBonus = this.bonkBonus();
        return _postMult + _bonkBonus + this.cornerBonus() + this.boostBonus();
    },
    
});
// #endregion


class ScoreScene extends Phaser.Scene {
// #region ScoreScene
    constructor () {
        super({key: 'ScoreScene', active: false});
    }

    init() {
        this.rollSpeed = 250;
        this.lastRollTime = 0;
        this.difficulty = 0;
        this.stageData = {};
    }

    preload() {
    }

    create() {
        const ourUI = this.scene.get('UIScene');
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');
        const ourScoreScene = this.scene.get('ScoreScene');
        const ourTimeAttack = this.scene.get('TimeAttackScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourPersistent = this.scene.get('PersistentScene');

        var stageDataJSON = {
            bonks: ourUI.bonks,
            boostFrames: ourInputScene.boostTime,
            cornerTime: Math.floor(ourInputScene.cornerTime),
            diffBonus: ourGame.stageDiffBonus,
            foodHistory: ourGame.foodHistory,
            foodLog: ourUI.scoreHistory,
            medals: ourUI.medals,
            moveCount: ourInputScene.moveCount,
            moveHistory: ourInputScene.moveHistory,
            stage:ourGame.stage,
            uuid:ourGame.stageUUID,
            zedLevel: calcZedLevel(ourTimeAttack.zeds).level,
        }

        this.stageData = new StageData(stageDataJSON);
        
        console.log(JSON.stringify(this.stageData));

        // #region Time Attack Compare
        if (ourTimeAttack.inTimeAttack) {
            ourStartScene.stageHistory.some( _stageData => {

                if (ourGame.stage === _stageData.stage) {
                    var oldScore = _stageData.calcTotal();
                    var newScore = this.stageData.calcTotal();
                    
                    if (newScore > oldScore) {
                        console.log("YEAH YOU DID BETTER", "New=", newScore, "Old=", oldScore, "Lives Left=", this.lives);
                        _stageData = this.stageData; 
                    }
                    else {
                        console.log("SORRY TRY AGAIN", "New=", newScore, "Old=", oldScore, "Lives Left=", this.lives);
                    }
                }
            })
        }
        else {
            //// Push New Stage Data
            ourStartScene.stageHistory.push(this.stageData);
        }

        // #region Save Best To Local.

        
        var bestLogRaw = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestStageData`));
        if (bestLogRaw) {
            // is false if best log has never existed
            var bestLog = new StageData(bestLogRaw);
            var bestLocal = bestLog.calcTotal();
        }
        else {
            var bestLocal = 0;
        }

        var currentLocal = this.stageData.calcTotal()
        if (currentLocal > bestLocal) {
            console.log(`NEW BEST YAY! ${currentLocal} (needs more screen juice)`);
            bestLocal = currentLocal;
            ourUI.bestScoreUI.setText(`Best : ${this.stageData.calcBase()}`);

            this.stageData.newBest = true;
            
            localStorage.setItem(`${ourGame.stageUUID}-bestStageData`, JSON.stringify(this.stageData));
            
            //calcSumOfBest(ourStartScene); // Note: This really should be an event.
            //this.scene.get("PersistentScene").sumOfBestUI.setHTML(`SUM OF BEST : <span style="color:goldenrod">${commaInt(ourStartScene.sumOfBest)}`);
            //this.scene.get("PersistentScene").stagesCompleteUI.setText(`STAGES COMPLETE : ${ourStartScene.stagesComplete}`);
        }

        // #endregion

        


        
        // #region
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

        var wrapBlock01 = this.add.sprite(0, GRID * 2).play("wrapBlock01").setOrigin(0,0).setDepth(15);
        var wrapBlock03 = this.add.sprite(GRID * END_X, GRID * 2).play("wrapBlock03").setOrigin(0,0).setDepth(15);
        var wrapBlock06 = this.add.sprite(0, GRID * END_Y - GRID).play("wrapBlock06").setOrigin(0,0).setDepth(15);
        var wrapBlock08 = this.add.sprite(GRID * END_X, GRID * END_Y - GRID).play("wrapBlock08").setOrigin(0,0).setDepth(15);
        // #endregion

        this.add.image(GRID * 2,GRID * 8,'scoreScreenBG').setDepth(20).setOrigin(0,0);
        this.add.image(0,GRID * 26.5,'scoreScreenBG2').setDepth(9).setOrigin(0,0);
        var scrollArrowDown = this.add.sprite(GRID * 22.5, GRID * 19,'downArrowAnim').play('downArrowIdle').setDepth(21).setOrigin(0,0);
        

        // Pre Calculate needed values
        var stageAve = this.stageData.baseScore/this.stageData.foodLog.length;

        var bestLogJSON = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestStageData`));
        var bestLog = new StageData(bestLogJSON);

        var bestLocal = bestLog.calcBase();
        var bestAve = bestLocal/bestLog.foodLog.length;


        var bestrun = Number(JSON.parse(localStorage.getItem(`BestFinalScore`)));


        //var stageAverage = stageScore();
        
        // Scene Background Color
        this.stageBackGround = this.add.rectangle(0, GRID * 2, GRID * 31, GRID * 28, 0x384048, .88);
        this.stageBackGround.setOrigin(0,0).setDepth(8);


        // #region Atomic Food List
        var atomList = this.stageData.foodLog.slice();
        // dead atom = 1 
        //const BOOST_ADD_FLOOR = 100;
        //const COMBO_ADD_FLOOR = 108;
        //console.log(atomList)
        var count = 0;

        
        for (let i = 0; i < atomList.length; i++) {
            
            var logTime = atomList[i];
            let _x,_y;
            let anim;

            if (i < 14) {
                _x = (GRID * (7.2667)) + (i * 16);
                _y = GRID * 8.75
            }
            else {
                _x = (-GRID * 2.0667) + (i * 16);
                _y = (GRID * 8.75) + 16;
            }

            switch (true) {
                case logTime > COMBO_ADD_FLOOR:
                    anim = "atom01idle";
                    if (i != 0) { // First Can't Connect
                        this.add.rectangle(_x - 12, _y, 12, 3, 0xFFFF00, 1
                        ).setOrigin(0,0.5).setDepth(20);
                    }
                    break
                case logTime > BOOST_ADD_FLOOR:
                    console.log(logTime, "Boost", i);
                    anim = "atom02idle";
                    break
                case logTime > SCORE_FLOOR:
                    console.log(logTime, "Boost", i);
                    anim = "atom03idle";
                    break
                default:
                    console.log(logTime, "dud", i);
                    anim = "atom04idle";
                    break
            }

            this.add.sprite(_x, _y,'atomicPickup01Anim'
            ).play(anim).setDepth(21).setScale(.5);
            
        }

        /*atomList.forEach(element => {
            this.add.sprite((GRID * 4), GRID * 10, 'atomicPickup01Anim').play('atom01idle').setDepth(20).setScale(.5)
        });*/
        ///////

        this.add.dom(SCREEN_WIDTH/2, GRID * 4.5, 'div', Object.assign({}, STYLE_DEFAULT, {
            "text-shadow": "4px 4px 0px #000000",
            "font-size":'32px',
            'font-weight': 400,
            'text-align': 'center',
            'text-transform': 'uppercase',
            "font-family": '"Press Start 2P", system-ui',
            })).setHTML(
                `${this.stageData.stage} CLEAR`
        ).setOrigin(0.5, 0);

        

        // #region Main Stats

        var bonkBonus = NO_BONK_BASE/(ourUI.bonks+1);
        let diffBonus = ourGame.stageDiffBonus * .01;

        const scorePartsStyle = {
            color: "white",
            //"text-shadow": "2px 2px 4px #000000",
            "font-size":'16px',
            "font-weight": 400,
            "text-align": 'right',
            "white-space": 'pre-line'
        }
        
        const preAdditiveLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*3, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            
            })).setHTML(
                `BASE SCORE:
                SPEED BONUS:`
        ).setOrigin(1, 0);


        var _baseScore = this.stageData.calcBase();
        var _speedbonus = calcBonus(this.stageData.calcBase());
        const preAdditiveValuesUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 0.5, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `${commaInt(_baseScore)}</span>
                <span style="color:${COLOR_FOCUS};font-weight:600;">+${commaInt(_speedbonus)}</span>
                <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(_baseScore + _speedbonus)}</span>`
        ).setOrigin(1, 0);
        

        const multLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*3.75, GRID * 13.625, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML(
                `DIFFICULTY +${this.stageData.diffBonus}%
                ZED LVL +${Number(this.stageData.zedLevelBonus() * 100).toFixed(1)}%
                MEDAL +${this.stageData.medalBonus() * 100}%
                `
        ).setOrigin(1,0);
        
        var _bonusMult = this.stageData.bonusMult();
        var _postMult = this.stageData.postMult();
        const multValuesUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 0.5, GRID * 13.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `x ${Number(_bonusMult * 100).toFixed(1)}%
                <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(Math.ceil(_postMult))}</span>`
        ).setOrigin(1, 0);

        const postAdditiveLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*3, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `CORNER TIME:
                BOOST BONUS:
                NO-BONK BONUS:`
        ).setOrigin(1,0);

        const postAdditiveValuesUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 0.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `+${this.stageData.cornerBonus()}
                +${this.stageData.boostBonus()}
                +${this.stageData.bonkBonus()}`
        ).setOrigin(1, 0);

        const stageScoreUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID * 20 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            {
                "font-style": 'bold',
                "font-size": "28px",
                "text-align": 'right',
            })).setHTML(
                `STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
        ).setOrigin(1, 0.5).setDepth(20);
        
        //const stageScore = this.add.text(SCREEN_WIDTH/2 - GRID * .825, GRID * 18.125, Math.floor(this.stageData.calcTotal()),
        //{ fontFamily: "Sono", fontStyle: 'bold',
        //fontSize: 28, color: '#ffff00', align: 'right' })
        //.setOrigin(0.5, 0.5).setDepth(20);

        //const fx1 = stageScore.postFX.addGlow(0xffffff, 0, 0, false, 0.1, 24);
        /*this.tweens.add({
            targets: fx1,
            outerStrength: 2,
            yoyo: true,
            loop: -1,
            ease: 'sine.inout'
        });*/


        // #region Rank Sprites
        //var tilesprite = this.add.tileSprite(400, 300, 800, 600, 'brick').setPipeline('Light2D');

        this.lights.enable();
        this.lights.setAmbientColor(0x3B3B3B);
        
        let rank = this.stageData.stageRank()
        
        var letterRank = this.add.sprite(GRID * 3.5,GRID * 16.0,"ranksSheet",
            rank
        ).setDepth(20).setOrigin(0,0).setPipeline('Light2D');
        
        this.letterRankCurve = new Phaser.Curves.Ellipse(letterRank.x + 24, letterRank.y + 32, 96);
        this.letterRankPath = { t: 0, vec: new Phaser.Math.Vector2() };
        this.letterRankPath2 = { t: .5, vec: new Phaser.Math.Vector2() };


        var lightColor = 0xFFFFFF;
        var lightColor2 = 0xFFFFFF;
        const platLightColor = 0xEEA8EE;
        const platLightColor2 = 0x25DD19;
        const goldLightColor = 0xE7C1BB;
        const goldLightColor2 = 0xE9FF5E;
        const silverLightColor = 0xABCADA;
        const silverLightColor2 = 0xABDADA;
        const bronzeLightColor = 0xE8C350;
        const bronzeLightColor2 = 0xE8C350;
        const copperLightColor = 0xB59051;
        const copperLightColor2 = 0xB59051;

        this.tweens.add({
            targets: this.letterRankPath,
            t: 1,
            ease: 'Linear',
            duration: 4000,
            repeat: -1
        });
        
        this.tweens.add({
            targets: this.letterRankPath2,
            t: 1.5,
            ease: 'Linear',
            duration: 4000,
            repeat: -1
        });

        // region Particle Emitter
        if(rank >= SILVER){
            lightColor = silverLightColor
            lightColor2 = goldLightColor
            console.log(lightColor)
            this.add.particles(GRID * 4.0,GRID * 16.0, "twinkle01Anim", {
                x:{min: 0, max: 32},
                y:{min: 0, max: 68},
                anim: 'twinkle01',
                lifespan: 1000,
            }).setFrequency(500,[1]).setDepth(20);
        }
        if(rank === GOLD){
            lightColor = goldLightColor
            lightColor2 = goldLightColor
            console.log(lightColor)
            this.add.particles(GRID * 4.0,GRID * 16.0, "twinkle02Anim", {
                x:{min: 0, max: 32},
                y:{min: 0, max: 68},
                anim: 'twinkle02',
                lifespan: 1000,
            }).setFrequency(1332,[1]).setDepth(20);
        }
        if(rank === PLATINUM){
            lightColor = platLightColor
            lightColor2 = goldLightColor
            console.log(lightColor)
            this.add.particles(GRID * 4.0,GRID * 16.0, "twinkle03Anim", {
                x:{steps: 8, min: -8, max: 40},
                y:{steps: 8, min: 8, max: 74},
                anim: 'twinkle03',
                color: [0x8fd3ff,0xffffff,0x8ff8e2,0xeaaded], 
                colorEase: 'quad.out',
                alpha:{start: 1, end: 0 },
                lifespan: 3000,
                gravityY: -5,
            }).setFrequency(667,[1]).setDepth(20);
        }

        this.spotlight = this.lights.addLight(0, 0, 500, lightColor).setIntensity(1.5); //
        this.spotlight2 = this.lights.addLight(0, 0, 500, lightColor2).setIntensity(1.5); //
        // #region Stat Cards
        var cornerTimeSec = (ourInputScene.cornerTime/ 1000).toFixed(3)
        console.log(ourInputScene.cornerTime)
        var boostTimeSec = (ourInputScene.boostTime * 0.01666).toFixed(3)
        console.log(ourInputScene.boostTime)
        var dateObj = new Date(Math.round(ourInputScene.time.now));
        var hours = dateObj.getUTCHours();
        var minutes = dateObj.getUTCMinutes();
        var seconds = dateObj.getSeconds();
        var timeString = hours.toString().padStart(2, '0') + ':' + 
            minutes.toString().padStart(2, '0') + ':' + 
            seconds.toString().padStart(2, '0');

        var cardY = 8;
        var styleCard = {
            width: '246px',
            "font-size": '14px',
            "max-height": '236px',
            "font-weight": 300,
            "padding": '12px 12px 12px 12px',
            "text-align": 'left', 
            "word-wrap": 'break-word',
            "white-space": 'pre-line',
            'overflow-y': 'scroll',
            //'scroll-behavior': 'smooth', smooth scroll stutters when arrow key down/up is held
            'mask-image': 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)'
            //'scrollbar-width': 'none', //Could potentially make a custom scroll bar to match the aesthetics
        }

        const stageStats = this.add.dom(SCREEN_WIDTH/2 + GRID * 2, (GRID * cardY) + 4, 'div',  Object.assign({}, STYLE_DEFAULT, 
            styleCard, {
            })).setHTML(
                //`----------- < <span style="color:${COLOR_TERTIARY};">● ○ ○</span> > -----------</br>
                //</br>
                //[${ourUI.scoreHistory.slice().sort().reverse()}]</br> individual food score printout array
                `<span style ="text-transform: uppercase"> ${ourGame.stage} STATS</span>
                <hr style="font-size:6px"/>ATTEMPTS: <span style = "float: right">xx</span>
                LENGTH: <span style = "float: right">${ourUI.length}</span>
                AVERAGE: <span style = "float: right">${stageAve.toFixed(2)}</span>
                BONKS: <span style = "float: right">${ourUI.bonks}</span>

                MOVE COUNT: <span style="float: right">${ourInputScene.moveCount}</span>
                MOVE VERIFY: <span style="float: right">${ourInputScene.moveHistory.length}</span>
                TOTAL TURNS: <span style = "float: right">${ourInputScene.turns}</span>
                CORNER TIME: <span style = "float: right">${cornerTimeSec} SEC</span>

                BOOST TIME: <span style = "float: right">${boostTimeSec} SEC</span>

                ELAPSED TIME: <span style = "float: right">${timeString}</span>

                MEDALS
                <hr/>
                <span style ="text-transform: uppercase">${ourGame.stage} BEST STATS</span>
                <hr/>

                BASE SCORE: <span style = "float: right">${bestLog.calcBase()}</span>
                SPEED BONUS: <span style = "float: right">${bestLog.calcBonus()}</span>
                </br>

                BEST SCORE: <span style = "float: right">${bestLog.calcTotal()}</span>
                </br>
                AVERAGE: <span style = "float: right">${bestAve.toFixed(2)}</span>
                [${bestLog.foodLog.slice().sort().reverse()}]

                STAGE FOOD LOG:
                [${ourUI.scoreHistory.slice().sort().reverse()}]
                </br>`
                
                
        ).setOrigin(0,0).setVisible(true);

        stageStats.addListener('scroll');
        stageStats.on('scroll', () =>  {
            //console.log(stageStats.node.scrollTop)
            if(stageStats.node.scrollTop === (stageStats.node.scrollHeight 
                - stageStats.node.offsetHeight)){
                scrollArrowDown.setVisible(false);
            }
            else{
                scrollArrowDown.setVisible(true);
            }
        })
        this.input.keyboard.on('keydown-DOWN', function() {
            stageStats.node.scrollTop += 36;
            //debugger
        })
        this.input.keyboard.on('keydown-UP', function() {
            stageStats.node.scrollTop -= 36;
        })
        /*
        const extraStats = this.add.dom(SCREEN_WIDTH/2 + GRID * 2, GRID * cardY, 'div',  Object.assign({}, STYLE_DEFAULT, 
            styleCard, {

            })).setHTML(
                `----------- < <span style="color:${COLOR_TERTIARY};">○ ● ○</span> > -----------</br>
                </br>
                EXTRA STAGE STATS - ${ourGame.stage}</br>
                <hr/>
                TOTAL TURNS: ${ourInputScene.turns}</br>
                CORNER TIME: ${ourInputScene.cornerTime} FRAMES</br>
                </br>
                BOOST TIME: ${ourInputScene.boostTime} FRAMES</br>
                </br>
                BETA: ${GAME_VERSION}</br>
                </br>
                BONK RESETS: ${ourUI.bonks}</br>
                TOTAL TIME ELAPSED: ${Math.round(ourInputScene.time.now/1000)} Seconds</br>`
        ).setOrigin(0,0).setVisible(false);


        
        const bestStats = this.add.dom(SCREEN_WIDTH/2 +  GRID *2, GRID * cardY, 'div',  Object.assign({}, STYLE_DEFAULT, 
            styleCard, {

            })).setHTML(
                `----------- < <span style="color:${COLOR_TERTIARY};">○ ○ ●</span> > -----------</br>
                </br>
                BEST STATS - ${ourGame.stage}</br>
                <hr>
                BASE SCORE: ${bestLocal}</br>
                SPEED BONUS: ${bestBonus}</br>
                </br>
                BEST SCORE: ${bestLocal + bestBonus}</br>
                </br>
                BEST FOOD LOG ...... AVE: [${bestAve.toFixed(2)}]</br>
                [${bestLog.slice().sort().reverse()}]`
        ).setOrigin(0,0).setVisible(false);
        */

        var sIndex = 1 // Default Card
        var statsCards = [stageStats];

        //statsCards[sIndex].setVisible(true);
        //this.statCards.setMask(ourScoreScene.mask)
        /*var arrowsE = this.add.sprite(GRID * 29, GRID * 11).setDepth(15).setOrigin(0.5,0.5);
        arrowsE.angle = 90;
        arrowsE.play('idle');

        var arrowsW = this.add.sprite(GRID * 15, GRID * 11).setDepth(15).setOrigin(0.5,0.5);
        arrowsW.angle = 270;
        arrowsW.play('idle');*/
        

        /*this.input.keyboard.on('keydown-RIGHT', function() {
            statsCards[sIndex].setVisible(false);
            sIndex = Phaser.Math.Wrap(sIndex + 1, -1, statsCards.length-1); // No idea why -1 works here. But it works so leave it until it doesn't/

            statsCards[sIndex].setVisible(true);
        }, [], this);

        this.input.keyboard.on('keydown-LEFT', function() {
            statsCards[sIndex].setVisible(false);
            sIndex = Phaser.Math.Wrap(sIndex - 1, 0, statsCards.length); // No idea why -1 works here. But it works so leave it until it doesn't/

            statsCards[sIndex].setVisible(true);   
        }, [], this);*/


        

        // #region Hash Display Code
        this.foodLogSeed = this.stageData.foodLog.slice();
        this.foodLogSeed.push((ourInputScene.time.now/1000 % ourInputScene.cornerTime).toFixed(0));
        this.foodLogSeed.push(Math.floor(this.stageData.calcTotal()));

        // Starts Best as Current Copy
        this.bestSeed = this.foodLogSeed.slice();

        var foodHash = calcHashInt(this.foodLogSeed.toString());
        this.bestHashInt = parseInt(foodHash);

        this.hashUI = this.add.dom(SCREEN_WIDTH/2, GRID * 21.5, 'div',  Object.assign({}, STYLE_DEFAULT, {
            "fontSize":'18px',
            })).setOrigin(0.5, 0);

        // #region Help Card
        /*var card = this.add.image(SCREEN_WIDTH/2, 19*GRID, 'helpCard02').setDepth(10);
        card.setOrigin(0.5,0); 
        card.displayHeight = 108;*/

        var totalScore = 0;

        ourStartScene.stageHistory.forEach( stageData => {
            totalScore += stageData.calcTotal();
        });



        const currentScoreUI = this.add.dom(SCREEN_WIDTH/2, GRID*25, 'div', Object.assign({}, STYLE_DEFAULT, {
            width: '500px',
            color: COLOR_SCORE,
            "font-size":'28px',
            'font-weight': 500,
        })).setText(
            `TOTAL SCORE: ${commaInt(totalScore)}`
        ).setOrigin(0.5,0).setDepth(60);

        // #endregion
        /*const bestRunUI = this.add.dom(SCREEN_WIDTH/2, GRID*25, 'div', Object.assign({}, STYLE_DEFAULT, {
            width: '500px',
            'font-size':'22px',
            'font-weight': 400,
        })).setText(`Previous Best Run: ${commaInt(bestrun)}`).setOrigin(0.5,0).setDepth(60);*/


        this.prevZeds = this.scene.get("PersistentScene").zeds;

        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continue_text = '[SPACE TO CONTINUE]';

            if (ourGame.stage === END_STAGE) {
                continue_text = '[SPACE TO WIN]';
            }
            
            var continueText = this.add.dom(SCREEN_WIDTH/2, GRID*27.125,'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize":'32px',
                "font-family": '"Press Start 2P", system-ui',
                //"text-shadow": "4px 4px 0px #000000",
                //"text-shadow": '-2px 0 0 #fdff2a, -4px 0 0 #df4a42, 2px 0 0 #91fcfe, 4px 0 0 #4405fc',
                "text-shadow": '4px 4px 0px #000000, -2px 0 0 limegreen, 2px 0 0 fuchsia, 2px 0 0 #4405fc'
                }
            )).setText(continue_text).setOrigin(0.5,0).setDepth(25);


            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });
            
            // #region Space to Continue
            this.input.keyboard.on('keydown-SPACE', function() {     

                localStorage.setItem("zeds", ourPersistent.zeds);
                // Event listeners need to be removed manually
                // Better if possible to do this as part of UIScene clean up
                // As the event is defined there, but this works and its' here. - James
                ourGame.events.off('addScore');
                
                var sumOfBase = 0;
                var _histLog = [];
                
                ourStartScene.stageHistory.forEach( _stage => {
                    _histLog = [ ..._histLog, ..._stage.foodLog];
                    sumOfBase += _stage.calcBase();
                    ourGame.nextScore += _stage.calcTotal();

                });

                ourStartScene.globalFoodLog = _histLog;

                if (ourGame.stage != END_STAGE) {
                                    // Go Back Playing To Select New Stage
                    ourScoreScene.scene.stop();
                    ourGame.gState = GState.PLAY;

                    ourGame.add.dom(SCREEN_WIDTH / 2, SCREEN_HEIGHT/2, 'div',  Object.assign({}, STYLE_DEFAULT, {

                        })).setHTML(
                            
                            `Free Play </br>
                            Press "n" to warp to the next stage.`
                    ).setOrigin(0.5,0.5);
                  
                    
                }
          
                if (bestrun < ourUI.score + ourScoreScene.stageData.calcTotal()) {
                    localStorage.setItem('BestFinalScore', ourUI.score + ourScoreScene.stageData.calcTotal());
                }

            });
        }, [], this);
        //this.graphics = this.add.graphics();
    }

    // #region Score - Update
    update(time) {
        const ourPersistent = this.scene.get('PersistentScene');

        var scoreCountDown = this.foodLogSeed.slice(-1);

        this.letterRankCurve.getPoint(this.letterRankPath.t, this.letterRankPath.vec);
        this.letterRankCurve.getPoint(this.letterRankPath2.t, this.letterRankPath2.vec);

        this.spotlight.x = this.letterRankPath.vec.x;
        this.spotlight.y = this.letterRankPath.vec.y;

        this.spotlight2.x = this.letterRankPath2.vec.x;
        this.spotlight2.y = this.letterRankPath2.vec.y;

        /*this.graphics.clear(); //Used to debug where light is
        this.graphics.lineStyle(2, 0xffffff, 1);
        this.letterRankCurve.draw(this.graphics, 64);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillCircle(this.letterRankPath.vec.x, this.letterRankPath.vec.y, 8).setDepth(30);
        this.graphics.fillCircle(this.letterRankPath2.vec.x, this.letterRankPath2.vec.y, 8).setDepth(30);*/


        if (time >= this.lastRollTime + this.rollSpeed && scoreCountDown > 0) {
            this.lastRollTime = time;
            const ourTimeAttack = this.scene.get("TimeAttackScene");
            
            //this.foodLogSeed[this.foodLogSeed.length - 1] -= 1;

            //var i = 31;

            if (this.bestHashInt) {
                var leadingZeros = intToBinHash(this.bestHashInt).split('1').reverse().pop()
                 
                this.difficulty = leadingZeros.length;
            }
            else {
                var leadingZeros = "";
                this.difficulty = 1;
            }

            // The (+ 1) is so index doesn't equal 0 if it rolls the first number with the first bit being a 1
            // Which is a 50% chance.
            for (let index = (this.difficulty + 1) * 2; index > 0 ; index--) {
                var roll = Phaser.Math.RND.integer();
                if (roll < this.bestHashInt) {
                    this.bestHashInt = roll;
                }

                if (this.foodLogSeed.slice(-1) < 1) {
                    break;
                }

                this.foodLogSeed[this.foodLogSeed.length - 1] -= 1;
            }

            // #region HashUI Update

            this.rollSpeed = ROLL_SPEED[this.difficulty];

            //console.log(ROLL_SPEED[difficulty]);
            this.hashUI.setHTML(
                `Rolling for Zeds (${this.foodLogSeed.slice(-1)})<br/> 
                <span style="color:limegreen;text-decoration:underline;">${leadingZeros}</span><span style="color:limegreen">1</span>${intToBinHash(roll).slice(this.difficulty + 1)}<br/>
                You earned <span style ="color:${COLOR_BONUS};font-weight:600;text-decoration:underline;">${this.difficulty}</span> Zeds this Run`
            );

            if (this.prevZeds + this.difficulty > ourPersistent.zeds) {
                ourPersistent.zeds = this.prevZeds + this.difficulty;
                var zedsObj = calcZedLevel(ourPersistent.zeds);

                ourPersistent.zedsUI.setHTML(
                    `<span style ="color: limegreen;
                    font-size: 16px;
                    border: limegreen solid 1px;
                    border-radius: 5px;
                    padding: 1px 4px;">L${zedsObj.level}</span> ZEDS : <span style ="color:${COLOR_BONUS}">${commaInt(zedsObj.zedsToNext)} To Next Level.</span>`
                );
            }

            //console.log(scoreCountDown, this.bestHashInt, intToBinHash(this.bestHashInt), this.foodLogSeed);

            

        }
    }

    end() {

    }

}

const ROLL_SPEED = [
    100,100,
    100,100,
    50,50,
    25,25,
    20,20,
    10,10,
    5,5,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,
    1,1,1,1,1,1];

console.log("ROLL LENGTH", ROLL_SPEED.length);



class TimeAttackScene extends Phaser.Scene{
    // #region TimeAttackScene
    constructor () {
        super({ key: 'TimeAttackScene', active: false });
    }

    init () {

        this.inTimeAttack = false;
        this.zeds = 0;
        this.sumOfBest = 0;
        this.stagesComplete = 0;

    }
    preload () {

    }
    create() {
        // Sets first time as an empty list. After this it will not be set again
        // Remember to reset manually on full game restart.
        const ourGame = this.scene.get('GameScene');
        const ourUI = this.scene.get('UIScene');
        const ourTimeAttack = this.scene.get("TimeAttackScene");
        const ourStartScene = this.scene.get('StartScene');


        console.log("Time Attack Stage Manager is Live");
        

        // First Entry Y Coordinate
        var stageY = GRID *3;
        var allFoodLog = [];

        // Average Food
        var sumFood = allFoodLog.reduce((a,b) => a + b, 0);


        var playedStages = [];
        var index = 0;

        // Value passes by reference and so must pass the a value you don't want changed.
       

        this.input.keyboard.addCapture('UP,DOWN,SPACE');

        
        var _i = 0;
        var lowestScore = 9999999999;


        
    
        if (ourStartScene.stageHistory) {
            this.inTimeAttack = true;

            ourStartScene.stageHistory.forEach(_stageData => {

                var baseScore = _stageData.calcBase();
                var realScore = _stageData.calcTotal();
                var foodLogOrdered = _stageData.foodLog.slice().sort().reverse();

                

                allFoodLog.push(...foodLogOrdered);


                var logWrapLenth = 8;
                //var bestLog = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestStageData`));
                //var bestScore;
                var bestChar;

                if (_stageData.newBest) {
                    bestChar = "+";
                }
                else {
                    bestChar = "-";
                }


                //////
                var stageUI = this.add.dom(GRID * 9, stageY, 'div', {
                    color: 'white',
                    'font-size': '28px',
                    'font-family': ["Sono", 'sans-serif'],
                });


                if (realScore < lowestScore) {
                    index = _i;
                    lowestScore = realScore;
                };
                    

                stageUI.setText(`${bestChar}${_stageData.stage}`).setOrigin(1,0);

                playedStages.push([stageUI, _stageData.stage]);
                
            

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

            selected[0].node.style.color = COLOR_FOCUS;

            // Snake Head Code

            var selector = this.add.sprite(GRID, selected[0].y + 6, 'snakeDefault', 5);
            //this.head = scene.add.image(x * GRID, y * GRID, 'snakeDefault', 0);
            selector.setOrigin(0.5,0);

            var upArrow = this.add.sprite(GRID, selected[0].y - 42).setDepth(15).setOrigin(0.5,0);
            var downArrow = this.add.sprite(GRID, selected[0].y + 32).setDepth(15).setOrigin(0.5,0);

            upArrow.play('idle');
            downArrow.flipY = true;
            downArrow.play('idle');



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
                selected[0].node.style.color = COLOR_FOCUS;
                selector.y = selected[0].y + 6;
                
                upArrow.y = selected[0].y - 42;
                downArrow.y = selected[0].y + 32;

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
                
            }, [], this);
    
            this.input.keyboard.on('keydown-UP', function() {
                selected[0].node.style.color = "white";
                index = Phaser.Math.Wrap(index - 1, 0, playedStages.length);
                
                selected = playedStages[index];
                selected[0].node.style.color = COLOR_FOCUS;
                selector.y = selected[0].y + 6;
                
                upArrow.y = selected[0].y - 42;
                downArrow.y = selected[0].y + 32;

                continueTextUI.setText(`[GOTO ${selected[1]}]`);
            }, [], this);

            ///////// Run Score

            var runScore = 0;
            var baseScore = 0;

            if (ourStartScene.stageHistory) {
                ourStartScene.stageHistory.forEach(_stageData => {
                
                    runScore += _stageData.calcTotal();
                    baseScore += _stageData.calcBase();

                });

            };
            
            console.log("Runscore:", runScore);

            stageY = stageY + 4

            var runScoreUI = this.add.dom(GRID * 10, stageY, 'div', {
                color: COLOR_SCORE,
                'font-size': '28px',
                'font-family': ["Sono", 'sans-serif'],
                'text-decoration': 'overline dashed',


            });

            runScoreUI.setText(`Current Run Score ${runScore}`).setOrigin(0,0);

            // #region Unlock New Level?

            if (this.scene.get('GameScene').stage != END_STAGE) {

                
                var unlockStage;
                var goalSum; // Use sum instead of average to keep from unlocking stages early.
                var foodToNow = ourStartScene.stageHistory.length * 28; // Calculated value of how many total fruit collect by this stage
                stageY = stageY + GRID * 2;
                

                var lastStage = ourStartScene.stageHistory.slice(-1);

                // Allows levels with no stage afterwards.
                if (STAGES_NEXT[lastStage[0].stage]) {

                    // Unlock Difficulty needs to be in order
                    STAGES_NEXT[lastStage[0].stage].some( _stage => {

                        var _goalSum = _stage[1] * foodToNow;
                        unlockStage = _stage;
                        goalSum = unlockStage[1] * foodToNow;
                        if (this.histSum <= _goalSum && baseScore > _goalSum) {
                            return true;
                        }
                    });

        
                    // #region Unlock UI

                    var nextStageUI = this.add.dom(GRID * 9, stageY, 'div', {
                        color: 'grey',
                        'font-size': '20px',
                        'font-family': ["Sono", 'sans-serif'],
                        'text-decoration': 'underline',
                    });

                    nextStageUI.setText("Unlock Next Stage").setOrigin(1,0);

                    stageY += GRID;

                    var unlockStageUI = this.add.dom(GRID * 9, stageY, 'div', {
                        color: 'white',
                        'font-size': '28px',
                        'font-family': ["Sono", 'sans-serif'],
                    });
    
                    unlockStageUI.setText(unlockStage[0]).setOrigin(1,0);
                    

                    // Run Stats
                    var requiredAveUI = this.add.dom( GRID * 10, stageY + 4 , 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                    });
                    
                    var currentAveUI = this.add.dom( GRID * 10, stageY + GRID + 4, 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                    });

                    var currentAve = baseScore / foodToNow; 
                    var requiredAve = goalSum / foodToNow;


                    requiredAveUI.setText(`${requiredAve.toFixed(1)}: Required Food Score Average to Unlock  `).setOrigin(0,0);
                    currentAveUI.setText(`${currentAve.toFixed(1)}: Current Food Score Average`).setOrigin(0,0.5);

                    var unlockMessageUI = this.add.dom( GRID * 10, stageY - 18 , 'div', {
                        color: 'white',
                        'font-size': '14px',
                        'font-family': ["Sono", 'sans-serif'],
                        'font-style': 'italic',
                    });
                    
                    if (goalSum && baseScore > goalSum && this.histSum < goalSum) {
                        unlockMessageUI.setText("YOU UNLOCKED A NEW LEVEL!! Try now it out now!").setOrigin(0,0);
                        unlockMessageUI.node.style.color = "limegreen";
                        currentAveUI.node.style.color = "limegreen";

                        playedStages.push([unlockStageUI, unlockStage[0]]);
                        
                        //console.log(unlockStage[0], "FoodAve:", baseScore / foodToNow, "FoodAveREQ:", goalSum / foodToNow);

                        //lowestStage = unlockStage[0]; ////// BROKE
                        
                    }
                    else {
                        unlockMessageUI.setText("Redo a previous stage to increase your average.").setOrigin(0,0);
                        unlockMessageUI.node.style.color = COLOR_FOCUS;
                        currentAveUI.node.style.color = COLOR_SCORE;

                        //console.log(
                        //    "BETTER LUCK NEXT TIME!! You need", goalSum / foodToNow, 
                        //    "to unlock", unlockStage[0], 
                        //    "and you got", baseScore / foodToNow);
                    }
                }
                
                // Calc score required up to this point
                // Add Stage History Sum Here

                if (this.newUnlocked) {
                    console.log("New Unlocked this Run", this.newUnlocked); // Display mid run unlocks
                }
    
            }
            // #endregion
            


            ////////// Run Average

            var sumFood = allFoodLog.reduce((a,b) => a + b, 0);

            var sumAveFood = sumFood / allFoodLog.length;

            //console.log ("sum:", sumFood, "Ave:", sumAveFood);
             
            this.time.delayedCall(900, function() {

                // #region Continue Text 
                //continueTextUI.setVisible(true);
    
    
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
        this.medals = {};
        this.zedLevel = 0;

        var {lives = STARTING_ATTEMPTS } = props;
        this.lives = lives;

        this.scoreHistory = [];

        // BOOST METER
        this.energyAmount = 0; // Value from 0-100 which directly dictates ability to boost and mask
        this.comboCounter = 0;


        this.coinSpawnCounter = 100;
    }

    preload () {
        //const ourGame = this.scene.get('GameScene');
        //this.load.json(`${this.stage}-json`, `assets/Tiled/${this.stage}.json`);

        this.load.spritesheet('ui-blocks', 'assets/sprites/hudIconsSheet.png', { frameWidth: GRID, frameHeight: GRID });
    }
    
    create() {
       const ourGame = this.scene.get('GameScene');



       // UI Icons
       //this.add.sprite(GRID * 21.5, GRID * 1, 'snakeDefault', 0).setOrigin(0,0).setDepth(50);      // Snake Head


       // #region Boost Meter UI
       this.add.image(SCREEN_WIDTH/2,GRID,'boostMeterFrame').setDepth(51).setOrigin(0.5,0.5);
       this.add.image(GRID * 8.25,GRID,'atomScoreFrame').setDepth(51).setOrigin(0.5,0.5);


       this.mask = this.make.image({
           x: SCREEN_WIDTH/2,
           y: GRID,
           key: 'mask',
           add: false
       }).setOrigin(0.5,0.5);

       const keys = ['increasing'];
       const boostBar = this.add.sprite(SCREEN_WIDTH/2, GRID).setOrigin(0.5,0.5);
       boostBar.setDepth(50);
       boostBar.play('increasing');

       boostBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.mask);

       // Combo Sprites

       this.visible = false; // Not clear by name what this references here @holden Also should not double up on a common phaser name.

       this.letterC = this.add.sprite(GRID * 22,GRID * 4,"comboLetters", 0).setDepth(20).setAlpha(0);
       this.letterO = this.add.sprite(GRID * 23.25,GRID * 4,"comboLetters", 1).setDepth(20).setAlpha(0);
       this.letterM = this.add.sprite(GRID * 24.75,GRID * 4,"comboLetters", 2).setDepth(20).setAlpha(0);
       this.letterB = this.add.sprite(GRID * 26,GRID * 4,"comboLetters", 3).setDepth(20).setAlpha(0);
       this.letterO2 = this.add.sprite(GRID * 27.25,GRID * 4,"comboLetters", 1).setDepth(20).setAlpha(0);
       this.letterExplanationPoint = this.add.sprite(GRID * 28,GRID * 4,"comboLetters", 4).setDepth(20).setAlpha(0);
       this.letterX = this.add.sprite(GRID * 29,GRID * 4,"comboLetters", 5).setDepth(20).setAlpha(0);
      
       //this.add.sprite(GRID * 29,GRID * 4,"comboLetters", 6).setDepth(20);
       // #endregion

        
        //this.load.json(`${ourGame.stage}-json`, `assets/Tiled/${ourGame.stage}.json`);
        //stageUUID = this.cache.json.get(`${this.stage}-json`);
   

        // Store the Current Version in Cookies
        localStorage.setItem('version', GAME_VERSION); // Can compare against this later to reset things.

        
        
        // Score Text
        this.scoreUI = this.add.dom(0 , GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)
        ).setText(`STAGE :`).setOrigin(0,0);
        this.scoreLabelUI = this.add.dom(GRID * 3 , GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)
        ).setText(`0`).setOrigin(0,0);

        
        

        // this.add.image(GRID * 21.5, GRID * 1, 'ui', 0).setOrigin(0,0);
        //this.livesUI = this.add.dom(GRID * 22.5, GRID * 2 + 2, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)
        //).setText(`x ${this.lives}`).setOrigin(0,1);

        // Goal UI
        //this.add.image(GRID * 26.5, GRID * 1, 'ui', 1).setOrigin(0,0);
        this.lengthGoalUI = this.add.dom(GRID*28.0, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE));

        var snakeBody = this.add.sprite(GRID * 30.5, GRID - 4, 'snakeDefault', 1).setOrigin(1,1).setDepth(50).setPipeline('Light2D');      // Snake Body
        var flagGoal = this.add.sprite(GRID * 30.5, GRID + 4, 'ui-blocks', 3).setOrigin(1,0).setDepth(50); // Tried to center flag
 
        snakeBody.scale = .667;
        flagGoal.scale = .667;
        
        
        var length = `${this.length}`;
        if (LENGTH_GOAL != 0) {
            this.lengthGoalUI.setHTML(
                `${length.padStart(2, "0")}<br/>
                <hr style="font-size:3px"/>
                ${LENGTH_GOAL.toString().padStart(2, "0")}`
            ).setOrigin(0,0.5);
        }
        else {
            // Special Level
            this.lengthGoalUI.setText(`${length.padStart(2, "0")}`).setOrigin(0,1);
            this.lengthGoalUI.x = GRID * 27
        }
        
        //this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'ui', 3).setOrigin(1,0);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: MAX_SCORE *100,
            paused: true
         });

        var countDown = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;


         // Countdown Text
        this.countDown = this.add.dom(GRID*9 + 9, GRID, 'div', Object.assign({}, STYLE_DEFAULT, {
            'color': '#FCFFB2',
            'text-shadow': '0 0 4px #FF9405, 0 0 8px #F8FF05',
            'font-size': '22px',
            'font-weight': '400',
            'font-family': 'Oxanium',
            'padding': '2px 7px 0px 0px',
            })).setHTML(
                countDown.toString().padStart(3,"0")
        ).setOrigin(1,0.5);

        this.coinsUIIcon = this.add.sprite(GRID*21.5 - 7, GRID,'coinPickup01Anim'
        ).play('coin01idle').setDepth(101).setOrigin(0,0);

        this.coinsUIIcon.setScale(0.5);
        
        this.coinUIText = this.add.dom(GRID*22 - 9, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE
            )).setHTML(
                `${commaInt(this.scene.get("PersistentScene").coins)}`
        ).setOrigin(0,0);
        
        //this.deltaScoreUI = this.add.dom(GRID*21.1 - 3, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
        //    `LASTΔ :`
        //).setOrigin(0,1);
        //this.deltaScoreLabelUI = this.add.dom(GRID*24, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
        //    `0 `
        //).setOrigin(0,1);
        
        this.runningScoreUI = this.add.dom(GRID*21 - 3, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
            `SCORE :`
        ).setOrigin(0,1);
        this.runningScoreLabelUI = this.add.dom(GRID*24, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
            `${commaInt(this.score.toString())}`
        ).setOrigin(0,1);

        
        if (DEBUG) {
            this.timerText = this.add.text(SCREEN_WIDTH/2 - 1*GRID , 27*GRID , 
            this.scoreTimer.getRemainingSeconds().toFixed(1) * 10,
            { font: '30px Arial', 
              fill: '#FFFFFF',
              fontSize: "32px",
              width: '38px',
              "text-align": 'right',
            });
        }
        
        //  Event: addScore
        ourGame.events.on('addScore', function (fruit) {

            var scoreText = this.add.dom(fruit.x, fruit.y - GRID -  4, 'div', Object.assign({}, STYLE_DEFAULT, {
                color: COLOR_SCORE,
                'color': '#FCFFB2',
                'font-weight': '400',
                'text-shadow': '0 0 4px #FF9405, 0 0 12px #000000',
                'font-size': '22px',
                'font-family': 'Oxanium',
                'padding': '3px 8px 0px 0px',
                /*'font-size': '22px', //old settings
                'font-weight': '400',
                'font-weight': 'bold',
                'text-shadow': '-1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000' ,*/
            })).setOrigin(0,0);
            
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
                this.energyAmount += 25;
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

            // Calc Level Score
            var baseScore = this.scoreHistory.reduce((a,b) => a + b, 0);
            var lastHistory = this.scoreHistory.slice();
            lastHistory.pop();
            var lastScore = lastHistory.reduce((a,b) => a + b, 0) + calcBonus(lastHistory.reduce((a,b) => a + b, 0));
            console.log("Current Score:", this.score + calcBonus(baseScore), "+Δ" ,baseScore + calcBonus(baseScore) - lastScore);

            var runningScore = this.score + calcBonus(baseScore);
            var deltaScore = baseScore + calcBonus(baseScore) - lastScore;

            //this.deltaScoreUI.setText(
            //    `LASTΔ : +`
            //)
            //this.deltaScoreLabelUI.setText(
            //    `${deltaScore}`
            //)
            
            this.runningScoreUI.setText(
                `SCORE :`
            );
            this.runningScoreLabelUI.setText(
                `${commaInt(runningScore.toString())}`
            );
            


            // Update UI

            this.scoreUI.setText(`STAGE :`);
            this.scoreLabelUI.setText(`${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            
            this.length += 1;
            this.globalFruitCount += 1; // Run Wide Counter

            var length = `${this.length}`;
            
            // Exception for Bonus Levels when the Length Goal = 0
            if (LENGTH_GOAL != 0) {
                this.lengthGoalUI.setHTML(
                    `${length.padStart(2, "0")}<br/>
                    <hr style="font-size:3px"/>
                    ${LENGTH_GOAL.toString().padStart(2, "0")}`
                )
            }
            else {
                this.lengthGoalUI.setText(`${length.padStart(2, "0")}`);
            }
            
             // Restart Score Timer
            if (this.length < LENGTH_GOAL || LENGTH_GOAL === 0) {
                this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                    delay: MAX_SCORE * 100,
                    paused: false
                 });   
            }
            
        }, this);

        //  Event: saveScore
        ourGame.events.on('saveScore', function () {
            const ourTimeAttack = ourGame.scene.get('TimeAttackScene');
            const ourScoreScene = ourGame.scene.get('ScoreScene');
            const ourUIScene = ourGame.scene.get('UIScene');
            const ourStartScene = this.scene.get('StartScene');


            // Building StageData for Savin
            var stageData = ourScoreScene.stageData;
            

            //console.log(stageData.toString());

            var stageFound = false;
            
            var stage_score = this.scoreHistory.reduce((a,b) => a + b, 0);
            
            // #region Do Unlock Calculation of all Best Logs
            
            var historicalLog = [];
            if (ourStartScene.stageHistory.length > 1) {
                ourStartScene.stageHistory.forEach( _stage => {
                    var stageBestLog = JSON.parse(localStorage.getItem(`${_stage.uuid}-bestStageData`));
                    if (stageBestLog) {
                        historicalLog = [...historicalLog, ...stageBestLog];
                    }
                });
                
            }
        
            // make this an event?
            ourTimeAttack.histSum = historicalLog.reduce((a,b) => a + b, 0);
        
            // #endregion


        }, this);

        this.lastTimeTick = 0;

        
    }
    update(time) {
        var timeTick = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');

        // #region Bonus Level Code @james TODO Move to custom Check Win Condition level.
        if (timeTick < SCORE_FLOOR && LENGTH_GOAL === 0){
            // Temp Code for bonus level
            console.log("YOU LOOSE, but here if your score", timeTick, SCORE_FLOOR);

            this.scoreUI.setText(`Stage: ${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            this.bestScoreUI.setText(`Best :  ${this.score}`);

            this.scene.pause();

            this.scene.start('ScoreScene');
        }
        // #endregion

        if (!ourGame.checkWinCon() && !this.scoreTimer.paused) {
            /***
             * This is out of the Time Tick Loop because otherwise it won't pause 
             * correctly during portaling. After the timer pauses at the Score Floor
             *  the countdown timer will go to 0.
             */
            var countDown = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
    
            if (countDown === SCORE_FLOOR || countDown < SCORE_FLOOR) {
                this.scoreTimer.paused = true;
            }

            this.countDown.setText(countDown.toString().padStart(3,"0"));
        }

        if (timeTick != this.lastTimeTick) {
            this.lastTimeTick = timeTick;

            if(!this.scoreTimer.paused) {
                this.coinSpawnCounter -= 1;

                if (this.coinSpawnCounter < 1) {
                    console.log("COIN TIME YAY. SPAWN a new coin");

                    var validLocations = ourGame.validSpawnLocations();
                    var pos = Phaser.Math.RND.pick(validLocations)

                    var _coin = this.add.sprite(pos.x * GRID, pos.y * GRID,'coinPickup01Anim'
                    ).play('coin01idle').setDepth(21).setOrigin(.125,.125);
                    
                    ourGame.coins.push(_coin);

                    this.coinSpawnCounter = Phaser.Math.RND.integerInRange(60,120);
                }
            }
        }
        


        if (GState.PLAY === this.scene.get('GameScene').gState) {
            if (ourInputScene.spaceBar.isDown) {
                // Has Boost Logic, Then Boost
                if(this.energyAmount > 1){
                    this.scene.get('GameScene').moveInterval = SPEED_SPRINT;
                    
                    // Boost Stats
                    ourInputScene.boostTime += 6;
                    this.mask.setScale(this.energyAmount/100,1);
                    this.energyAmount -= 1;
                } else{
                    //DISSIPATE LIVE ELECTRICITY
                    this.scene.get('GameScene').moveInterval = SPEED_WALK;
                }
        
            } else {
                this.scene.get('GameScene').moveInterval = SPEED_WALK; // Less is Faster
                this.mask.setScale(this.energyAmount/100,1);
                this.energyAmount += .25; // Recharge Boost Slowly
            }
        } else if (GState.START_WAIT === this.scene.get('GameScene').gState) {
            this.mask.setScale(this.energyAmount/100,1);
            this.energyAmount += 1; // Recharge Boost Slowly

        }

        // Reset Energy if out of bounds.
        if (this.energyAmount >= 100) {
            this.energyAmount = 100;}
        else if(this.energyAmount <= 0) {
            this.energyAmount = 0;
        }

        //#endregion Boost Logic
        
        // #region Combo Logic

        if (this.comboCounter > 0 && !this.visible) {
            this.comboAppear();
        }
        else if (this.comboCounter == 0 && this.visible){
            this.comboFade();
        }
        if (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR && this.visible) {
            this.comboFade();
        }
    }
    
    comboBounce(){
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            y: { from: GRID * 4, to: GRID * 3 },
            ease: 'Sine.InOut',
            duration: 200,
            repeat: 0,
            delay: this.tweens.stagger(60),
            yoyo: true
            });
    }
    comboAppear(){
        console.log("appearing")
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 300,
            repeat: 0,
        });
        this.visible = true;
        }
    comboFade(){
        console.log("fading")
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            alpha: { from: 1, to: 0 },
            ease: 'Sine.InOut',
            duration: 500,
            repeat: 0,
        });
        this.visible = false;
        this.comboCounter = 0;
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
        this.cornerTime = 0; // Frames saved when cornering before the next Move Time.
        this.moveHistory = [];
        this.moveCount = 0;
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
        // preloads snake direction when portalling.

        // #region UpdateDirection
        var up = event.keyCode === 87 || event.keyCode === 38;
        var down = event.keyCode === 83 || event.keyCode === 40;
        var left = event.keyCode === 65 || event.keyCode === 37;
        var right = event.keyCode === 68 || event.keyCode === 39;

        switch (true) {
            case up:
                gameScene.snake.head.setTexture('snakeDefault', 6); 
                gameScene.snake.direction = DIRS.UP
                break;
            case down:
                gameScene.snake.head.setTexture('snakeDefault', 7);
                gameScene.snake.direction = DIRS.DOWN
                break;
            case left:
                gameScene.snake.head.setTexture('snakeDefault', 4);
                gameScene.snake.direction = DIRS.LEFT
                break;
            case right:
                gameScene.snake.head.setTexture('snakeDefault', 5);
                gameScene.snake.direction = DIRS.RIGHT
                break;
        }
    }


    moveUp(gameScene) {
        if (gameScene.snake.direction === LEFT  || gameScene.snake.direction  === RIGHT || // Prevents backtracking to death
            gameScene.snake.direction  === STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 
            
            this.setPLAY(gameScene);
            
                // At anytime you can update the direction of the snake.
            gameScene.snake.head.setTexture('snakeDefault', 6);
            gameScene.snake.direction = UP;
            
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
            this.turns += 1;
            
            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;

            }
            gameScene.lastMoveTime = gameScene.time.now;

                
            gameScene.snake.move(gameScene);
            gameScene.checkPortalAndMove();

            this.moveHistory.push([gameScene.snake.head.x, gameScene.snake.head.y]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means technically you can go as fast as you turn.
            
            
        }
    }

    moveDown(gameScene) {
        if (gameScene.snake.direction  === LEFT  || gameScene.snake.direction  === RIGHT || 
            gameScene.snake.direction  === STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 
           

               this.setPLAY(gameScene);
               gameScene.snake.head.setTexture('snakeDefault', 7);
           gameScene.snake.direction = DOWN;

           this.turns += 1;
           this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

           var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

           if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
               this.cornerTime += _cornerTime;
           }
           gameScene.lastMoveTime = gameScene.time.now;

           gameScene.snake.move(gameScene);
           gameScene.checkPortalAndMove();

           this.moveHistory.push([gameScene.snake.head.x, gameScene.snake.head.y]);
           gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.

           
       }

    }

    moveLeft(gameScene) {
        if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
            gameScene.snake.direction  === STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) {
            
                this.setPLAY(gameScene);

            gameScene.snake.head.setTexture('snakeDefault', 4);
            gameScene.snake.direction = LEFT;

            this.turns += 1;
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;
            }
            gameScene.lastMoveTime = gameScene.time.now;

            gameScene.snake.move(gameScene);

            this.moveHistory.push([gameScene.snake.head.x, gameScene.snake.head.y]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.

            gameScene.checkPortalAndMove();
            
        }

    }

    moveRight(gameScene) {
        if (gameScene.snake.direction  === UP   || gameScene.snake.direction  === DOWN || 
            gameScene.snake.direction  === STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 
            
                this.setPLAY(gameScene);
                gameScene.snake.head.setTexture('snakeDefault', 5);
            gameScene.snake.direction = RIGHT;

            this.turns += 1;
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;
            }
            gameScene.lastMoveTime = gameScene.time.now;
             
            gameScene.snake.move(gameScene);

            this.moveHistory.push([gameScene.snake.head.x/GRID, gameScene.snake.head.y/GRID]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            gameScene.checkPortalAndMove();
        }

    }

    moveDirection(gameScene, event) {

        /***
         * All move up calls only move if it is safe to move
        ***/
        
        // #region MoveDirection
        switch (event.keyCode) {
            case 87: // w
                this.moveUp(gameScene);
                break;

            case 65: // a
                this.moveLeft(gameScene);
                break;

            case 83: // s
                this.moveDown(gameScene);
                break;

            case 68: // d
                this.moveRight(gameScene);
                break;

            case 38: // UP
                this.moveUp(gameScene);
                break;

            case 37: // LEFT
                this.moveLeft(gameScene);
                break;

            case 40: // DOWN
                this.moveDown(gameScene);
                break;

            case 39: // RIGHT
                this.moveRight(gameScene);
                break;

            case 32: // SPACE
              if (DEBUG) { console.log(event.code, gameScene.time.now); }
              this.inputSet.push([START_SPRINT, gameScene.time.now]);
              break;
        } 
    }
    setPLAY(gameScene) {

        if (gameScene.startingArrowState == true){

            // Starting Game State
            gameScene.gState = GState.PLAY;
            console.log("GSTATE === PLAY", gameScene.gState === GState.PLAY);
            this.scene.get('UIScene').scoreTimer.paused = false;
                
            // turn off arrows and move snake.
            gameScene.startingArrowState = false;
            gameScene.startingArrowsAnimN.setVisible(false);
            gameScene.startingArrowsAnimS.setVisible(false);
            gameScene.startingArrowsAnimE.setVisible(false);
            gameScene.startingArrowsAnimW.setVisible(false);


            //ourInputScene.moveDirection(this, e);
        }

    }
}






 // #region Animations
function loadAnimations(scene) {
    scene.anims.create({
        key: 'idle',
        frames: scene.anims.generateFrameNumbers('startingArrowsAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7 ] }),
        frameRate: 16,
        repeat: -1
    }); 
    scene.anims.create({
        key: 'portalIdle',
        frames: scene.anims.generateFrameNumbers('portals',{ frames: [ 0, 1, 2, 3, 4, 5]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'downArrowIdle',
        frames: scene.anims.generateFrameNumbers('downArrowAnim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'twinkle01',
        frames: scene.anims.generateFrameNumbers('twinkle01Anim',{ frames: [0, 1, 2, 1, 3]}),
        frameRate: 6,
        repeat: 0
    })
    scene.anims.create({
        key: 'twinkle02',
        frames: scene.anims.generateFrameNumbers('twinkle02Anim',{ frames: [0, 1, 2, 3 ,4 ,5 ,6]}),
        frameRate: 6,
        repeat: 0
    })
    scene.anims.create({
        key: 'twinkle03',
        frames: scene.anims.generateFrameNumbers('twinkle03Anim',{ frames: [0, 1, 2, 3, 2, 1,]}),
        frameRate: 6,
        repeat: -1
    })
    scene.anims.create({
        key: 'snakeOutlineAnim',
        frames: scene.anims.generateFrameNumbers('snakeOutlineBoosting',{ frames: [ 0, 1, 2, 3]}),
        frameRate: 12,
        repeat: -1
    })
    scene.anims.create({
        key: 'snakeOutlineSmallAnim',
        frames: scene.anims.generateFrameNumbers('snakeOutlineBoostingSmall',{ frames: [ 0, 1, 2, 3]}),
        frameRate: 12,
        repeat: -1
    })
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
        key: 'coin01idle',
        frames: scene.anims.generateFrameNumbers('coinPickup01Anim',{ frames: [ 0,1,2,3,4,5,6]}),
        frameRate: 8,
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
    scene.anims.create({
      key: 'boostTrailX1',
      frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}),
      frameRate: 16,
      repeat: 0
    })
    scene.anims.create({
        key: 'boostTrailX2',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ,0]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX3',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 2, 3, 4, 5, 6, 7, 8, 9 ,0 ,1]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX4',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 3, 4, 5, 6, 7, 8, 9, 0, 1, 2]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX5',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 4, 5, 6, 7, 8, 9, 0, 1, 2, 3]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX6',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 5, 6, 7, 8, 9, 0, 1, 2, 3, 4]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX7',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 6, 7, 8, 9, 0, 1, 2, 3, 4, 5]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX8',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 7, 8, 9, 0, 1, 2, 3, 4, 5, 6]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX9',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 8, 9, 0, 1, 2, 3, 4, 5, 6, 7]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'boostTrailX0',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 9, 0, 1, 2, 3, 4, 5, 6, 7, 8]}),
        frameRate: 16,
        repeat: 0
      })
    scene.anims.create({
        key: 'boostTrailXdissipate',
        frames: scene.anims.generateFrameNumbers('boostTrailX',{ frames: [ 10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
  }
// #endregion

// #region Config
var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    width: 744,
    height: 744,
    //seed: 1,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    scale: {
        zoom: Phaser.Scale.MAX_ZOOM,
        //mode: Phaser.Scale.FIT,
    },
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0}
        }
    },
    fx: {
        glow: {
            distance: 36,
            quality: .1
        }
    },
    dom: {
        createContainer: true,
    },
    
    //scene: [ StartScene, InputScene]
    scene: [ StartScene, PersistentScene, GameScene, UIScene, InputScene, ScoreScene, TimeAttackScene]

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




