import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { Coin } from './classes/Coin.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';


import { PORTAL_COLORS, PORTAL_TILE_RULES } from './const.js';
import { STAGE_UNLOCKS, STAGES} from './data/UnlockCriteria.js';
import { STAGE_OVERRIDES } from './data/customLevels.js';
import { TUTORIAL_PANELS } from './data/tutorialScreens.js';
import { QUICK_MENUS } from './data/quickMenus.js';



//******************************************************************** */
//                              SnakeHole
//******************************************************************** */
// GameSettings 

const IS_DEV = false;
const ANALYTICS_VERS = "0.3.240802";
const DEV_BRANCH = "dev";

const ANALYTICS_ON = false;


const GAME_VERSION = 'v0.8.11.07.002';
export const GRID = 12;        //....................... Size of Sprites and GRID
//var FRUIT = 5;               //....................... Number of fruit to spawn
export const LENGTH_GOAL = 28; //28..................... Win Condition
const GAME_LENGTH = 4; //............................... 4 Worlds for the Demo

const DARK_MODE = false;
const GHOST_WALLS = true;
// #region DEBUG OPTIONS

export const DEBUG = false;
export const DEBUG_AREA_ALPHA = 0;   // Between 0,1 to make portal areas appear
const SCORE_SCENE_DEBUG = false;
const DEBUG_SHOW_LOCAL_STORAGE = false;

const NO_EXPERT_MODE = true;


// 1 frame is 16.666 milliseconds
// 83.33 - 99.996
export const SPEED_WALK = 99; // 99 In milliseconds  

// 16.66 33.32
export const SPEED_SPRINT = 33; // 24  // Also 16 is cool // 32 is the next

const PORTAL_SPAWN_DELAY = 66;


// Make into a ENUM
const SCORE_FLOOR = 1; // Floor of Fruit score as it counts down.
const BOOST_ADD_FLOOR = 100;
export const COMBO_ADD_FLOOR = 108;
const MAX_SCORE = 120;
export const X_OFFSET = 292 / 2;
export const Y_OFFSET = 72 / 2;


const RESET_WAIT_TIME = 500; // Amount of time space needs to be held to reset during recombinating.

const NO_BONK_BASE = 1200;

const STAGE_TOTAL = STAGES.size;



//debug stuff
export const PORTAL_PAUSE = 2; 


// Speed Multiplier Stats
const a = 1400; // Average Score
const lm = 28; // Minimum score
const lM = 3360 ; // Theoretical max score = 28 * MAX_SCORE

const RANK_NUM_1 = 412505;
/* Rank 1 History
412505 - James 11/9
*/
const RANK_AMOUNT = 1000;
const RANK_STEP = RANK_NUM_1 / RANK_AMOUNT;

// #region Utils Functions

var calcSumOfBestRank = function (sumOfBest) {
    var testVal = 0;
    var counter = 0;
    // Later use actual distribution data.
    // The best player is number one until we have more than 10,000 people playing.
    // We could do 1000 instead of 100 in the meantime.
    do {
        testVal += RANK_STEP;
        counter += 1;
    } while (testVal < sumOfBest);

    return Math.max(RANK_AMOUNT - counter, 1) 
}


var calcBonus = function (scoreInput) {
    
    var _speedBonus = Math.floor(-1* ((scoreInput-lm) / ((1/a) * ((scoreInput-lm) - (lM - lm)))));
    return _speedBonus
} 

var updateSumOfBest = function(scene) {
    /***
     *  This most important thing this function does is update the bestOfStageData object.
     *  That is used to check if a black hole should be spawned to a new level.
     */
    let entries = Object.entries(localStorage);
    scene.stagesComplete = 0;
    scene.sumOfBest = 0;
    BEST_OF_STAGE_DATA = new Map();

    var ignoreSet = new Set(STAGE_OVERRIDES.keys());

    scene.scene.get("StartScene").UUID_MAP.keys().forEach( uuid => {
        var tempJSON = JSON.parse(localStorage.getItem(`${uuid}-bestStageData`));

        if (tempJSON) { // False if not played stage before.
            var _stageData = new StageData(tempJSON);
            scene.stagesComplete += 1;

            BEST_OF_STAGE_DATA.set(_stageData.stage, _stageData);

            var _scoreTotal = _stageData.calcTotal();
            scene.sumOfBest += _scoreTotal;
        }
        else {
            var unplayed = scene.scene.get("StartScene").UUID_MAP.get(uuid);
            
        }
    })
}



// SHOULD BE READ ONLY
export var PLAYER_STATS = JSON.parse(localStorage.getItem("playerStats")); {
    if (!JSON.parse(localStorage.getItem("playerStats"))) {
        PLAYER_STATS = {}
    }
    
    var statsWithDefaults = new Map([
        ["bonks", PLAYER_STATS.bonks ?? 0],
        ["atomsEaten", PLAYER_STATS.atomsEaten ?? 0],
        ["turns", PLAYER_STATS.turns ?? 0],
        ["wraps", PLAYER_STATS.wraps ?? 0],
        ["portals", PLAYER_STATS.portals ?? 0],
        ["globalScore", PLAYER_STATS.globalScore ?? 0],
        ["comboHistory", PLAYER_STATS.comboHistory ?? Array(28).fill(0)],
    ]);

    // Add Saved Values
    statsWithDefaults.keys().forEach( key => {
        PLAYER_STATS[key] = statsWithDefaults.get(key);
    });

    // Calculate Values
    PLAYER_STATS.stagesFinished = Math.floor(PLAYER_STATS.atomsEaten / 28);
}

var updatePlayerStats = function (stageData) {

    
    PLAYER_STATS.bonks += stageData.bonks;
    PLAYER_STATS.atomsEaten += stageData.foodLog.length;
    PLAYER_STATS.turns += stageData.turns;
    PLAYER_STATS.stagesFinished = Math.floor(PLAYER_STATS.atomsEaten / 28);

    // This also saves changes not listed here that
    // are made directly to PLAYER_STATS object.
    // Like Wrapping and Portaling etc...
    localStorage.setItem("playerStats", JSON.stringify(PLAYER_STATS));

    // JSON.stringify(this.stageData)

}

var xpFromZeds = function(zeds) {
    return zeds * (zeds + 1) / 2
}

var rollZeds = function(score) {
    // Would be nice to have some tests in the doc string here using deno.
    
    var lowestNum = 4294967295; // Start at Max Int
    var rolls = score;
    var previousLowRolls = score;
    var mostZerosYet = 0;

    var rollHistorySorted = [];

    do {
        var _intToTest = Phaser.Math.RND.integer(); // Eventually this would be the result of a hash

        if (_intToTest < lowestNum) {
            lowestNum = _intToTest;

            var leadingZeros = intToBinHash(lowestNum).split('1').reverse().pop();
            var zedsToAdd = xpFromZeds(leadingZeros.length);

            if (leadingZeros.length > mostZerosYet) {
                mostZerosYet = leadingZeros.length;

                rollHistorySorted.push(
                    new Map([
                    ["zerosAchieved", mostZerosYet], 
                    ["numberOfRolls", previousLowRolls - rolls], 
                    ["numberRolled", lowestNum] 
                    ])
                );
                previousLowRolls = rolls;
            }
        }
    
    rolls-- ;
    } while (rolls > 0);

    var zedRollResultsMap = new Map([
        ["rollHistory", rollHistorySorted],
        ["rollsLeft", previousLowRolls - rolls],
        ["bestZeros", mostZerosYet],
        ["zedsEarned", xpFromZeds(mostZerosYet)] 
    ])

    return zedRollResultsMap;

}


export var BEST_OF_STAGE_DATA = new Map (); // STAGE DATA TYPE

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
    // Would be nice to put tests here.

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

const FADE_OUT_TILES = [104,17,18,19,20,49,50,51,52,81,82,83,84,
    113,114,115,116,145,146,147,148,177,178,179,180,209,210,211,241,242,243];
const NO_FOOD_TILE = 481;

//  Direction consts
const START_SPRINT = 5;
const STOP_SPRINT = 6;

export const DIRS = Object.freeze({ 
    UP: 1, 
    DOWN: 2, 
    LEFT: 3, 
    RIGHT: 4,
    STOP: 0, 
}); 

export const RANKS = Object.freeze({
    WOOD: 0,
    BRONZE: 1,
    SILVER: 2,
    GOLD: 3,
    PLATINUM: 4,
});

const RANK_BENCHMARKS = new Map([
    // Calibrated for use with SpeedBonus
    [RANKS.GOLD, 10000],
    [RANKS.SILVER, 5000],
    [RANKS.BRONZE, 2000],
    [RANKS.WOOD, 0],

]);


// #region GLOBAL STYLES 
export const STYLE_DEFAULT = {
    color: 'white',
    'font-size': '14px',
    'font-family': 'Oxanium',
    'font-weight': '200',
    'text-align': 'center',
    'letter-spacing': "1px",
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


/*var SOUND_ATOM = [ //@holden do we need this
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
var SOUND_RANK = [
    ['rankD', [ 'rankD.ogg', 'rankD.mp3' ]],
    ['rankC', [ 'rankD.ogg', 'rankD.mp3' ]],
    ['rankB', [ 'rankB.ogg', 'rankB.mp3' ]],
    ['rankA', [ 'rankB.ogg', 'rankB.mp3' ]],
    ['rankS', [ 'rankS.ogg', 'rankS.mp3' ]]
]

export const GState = Object.freeze({ 
    START_WAIT: 1, 
    PLAY: 2, 
    PORTAL: 3, 
    BONK: 4, 
    WAIT_FOR_INPUT: 5,
    TRANSITION: 6
}); 


// #region START STAGE
export const START_STAGE = 'World_0-1'; // Warning: Cap sensitive in the code but not in Tiled. Can lead to strang bugs.
const START_UUID = "723426f7-cfc5-452a-94d9-80341db73c7f";
var END_STAGE = 'Stage-06'; // Is var because it is set during debugging UI

const START_COINS = 4;


class WaveShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
    constructor(game) {
        super({
            game: game,
            renderer: game.renderer,
            vertShader: `
                precision mediump float;
                attribute vec2 inPosition;
                attribute vec2 inTexCoord;
                uniform mat4 uProjectionMatrix;
                varying vec2 vTexCoord;
                void main(void) {
                    vTexCoord = inTexCoord;
                    gl_Position = uProjectionMatrix * vec4(inPosition, 0.0, 1.0);
                }
            `,
            fragShader: `
                precision mediump float;
                uniform float uTime;
                uniform sampler2D uMainSampler;
                varying vec2 vTexCoord;
                void main(void) {
                    vec2 uv = vTexCoord;
                    // Apply noise translation over time
                    float noise = sin(uv.x * 5.0 + uTime) * 0.02;
                    uv.y += noise;
                    uv.x += noise;
                    vec4 color = texture2D(uMainSampler, uv);
                    gl_FragColor = vec4(color.rgb, color.a);
                }
            `
        });
    }
}

// #region SpaceBoyScene
class SpaceBoyScene extends Phaser.Scene {
    constructor () {
        super({key: 'SpaceBoyScene', active: true});
    }
    init() {
        this.stageHistory = [];
        this.globalFoodLog = [];
    }
    create() {
        this.spaceBoyBase = this.add.sprite(0,0, 'spaceBoyBase').setOrigin(0,0).setDepth(51);
        this.spaceBoyLight = this.add.sprite(X_OFFSET - GRID * 3.5 , GRID * 4 - 2, 'spaceBoyLight').
        setOrigin(0,0).setDepth(51).setAlpha(0);

        this.tweens.add({
            targets: this.spaceBoyLight,
            alpha: {from: 0, to: 1},
            duration: 600,
            ease: 'Sine.Out',
            delay: 500,
            });

    }
}

// #region TutorialScene
class TutorialScene extends Phaser.Scene {
    constructor () {
        super({key: 'TutorialScene', active: false});
    }
    create(tutorialPanels) {

        // AUDIO
        this.pop02 = this.sound.add('pop02');

        // delete this
        var tutStyle = {
            "fontSize":'24px',
        }

        var panelsArray = [];
        this.selectedPanel = 0;

        var hOffSet = 570;
        var fadeOut = 150;
        var fadeInDelay = 250;
        var fadeIn = 400;

        this.panelsContainer = this.make.container(0, 0).setDepth(200);
        var panelContents = [];

        for (let index = 0; index < tutorialPanels.length; index++) {

            var _map = TUTORIAL_PANELS.get(tutorialPanels[index]).call(this, index);

            // make different sections addressible later.
            panelsArray[index] = _map;
            
            panelContents.push(
                ..._map.get("text"), 
                ..._map.get("images"), 
                ..._map.get("panels") 
            );
            

        }

        this.panelsContainer.add(panelContents);

        
        this.panelsContainer.iterate( child=> {
            if (child.type === "NineSlice") {
                this.panelsContainer.sendToBack(child)
            }
        })

        panelsArray.forEach( map => {
            var growTarget = map.get("growPanelTo")
            this.tweens.add({
                targets: map.get("panels"),
                scale: 1,
                width: growTarget.w,
                height: growTarget.h,
                duration: 300,
                ease: 'sine.inout',
                yoyo: false,
                delay:200,
                repeat: 0,
            });
        })


        // Defaults everything to invisible so you don't need to remember to set in TUTORIAL_PANELS .
        panelContents.forEach( item => {
            item.alpha = 0;
        })

        


        
        // -james note. Start of create should be here.
        

        if (localStorage["version"] === undefined) {
            this.hasPlayedBefore = false;

        } else {
            this.hasPlayedBefore = true;
        }

        //this.continueText = this.add.text(SCREEN_WIDTH/2, GRID*24.5, '[PRESS SPACE TO CONTINUE]',{ font: '32px Oxanium'}).setOrigin(0.5,0).setInteractive().setScale(.5);
        
        this.continueText = this.add.dom(SCREEN_WIDTH/2, GRID*24.5, 'div',  Object.assign({}, STYLE_DEFAULT,{
            "fontSize":'32px',
            }), 
                '[PRESS SPACE TO CONTINUE]',
        ).setOrigin(0.5,0).setScale(.5).setInteractive(); // Sets the origin to the middle top.
        
        this.continueText.setVisible(false).setAlpha(0);

        if (tutorialPanels.length === 1) {
            // Change this to a tween. That works a bit like a loading bar.
            //this.continueText.setVisible(true);
            //if (!this.continueText.visible) {
                this.tweens.add({
                    targets: this.continueText,
                    alpha: { from: 0, to: 1 },
                    ease: 'Sine.InOut',
                    duration: 1000,
                    delay: 700,
                    repeat: -1,
                    yoyo: true,
                    onStart: () =>  {
                        this.continueText.setVisible(true);
                    }
                });   
            //}
        } else {
            this.panelArrowR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 11.5, SCREEN_HEIGHT/2).setDepth(103).setOrigin(0.5,0.5);
            this.panelArrowR.play('startArrowIdle');
            this.panelArrowR.angle = 90;
            this.panelArrowR.setAlpha(0);
            
            this.panelArrowL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 11.5, SCREEN_HEIGHT/2).setDepth(103).setOrigin(0.5,0.5);
            this.panelArrowL.play('startArrowIdle');
            this.panelArrowL.angle = 270;
            this.panelArrowL.setVisible(false).setAlpha(0);

            this.containorToX = 0;
            
            this.input.keyboard.on('keydown-RIGHT', e => {
                const ourPersist = this.scene.get('PersistScene');
                if (this.selectedPanel < tutorialPanels.length - 1) { // @holden this needs to be changed
                    
                    // Fade Out Old Text
                    this.tweens.add({
                        targets: panelsArray[this.selectedPanel].get("text"),
                        alpha: { from: 1, to: 0 },
                        ease: 'Sine.InOut',
                        //delay: 500,
                        duration: fadeOut,
                        
                    });
                    
                    this.pop02.play();
                    this.selectedPanel += 1;

                    panelsArray[this.selectedPanel].get("text").forEach( text => {
                        text.alpha = 0;
                    })
                    // Fade In New Text
                    this.tweens.add({
                        targets: panelsArray[this.selectedPanel].get("text"),
                        alpha: { from: 0, to: 1 },
                        ease: 'Sine.InOut',
                        delay: fadeInDelay,
                        duration: fadeIn,
                    });
                }

                var endX = - 1 * hOffSet * (tutorialPanels.length - 1);

                this.containorToX = Math.max(this.containorToX - hOffSet, endX);
                
                switch (this.containorToX) {
                    //case 0: // Start Panel
                    //    this.panelArrowL.setVisible(false);
                    //    ourPersist.bgCoords.x += 20;
                    //    break
                    case endX: // End Panel
                        this.panelArrowR.setVisible(false);
                        
                        if (!this.continueText.visible) {
                            this.tweens.add({
                                targets: this.continueText,
                                alpha: { from: 0, to: 1 },
                                ease: 'Sine.InOut',
                                duration: 1000,
                                repeat: -1,
                                yoyo: true
                            });   
                        }

                        this.continueText.setVisible(true);
                        
                        break
                    default: // Middle Panel
                        this.panelArrowL.setVisible(true);
                        this.panelArrowR.setVisible(true);
                        ourPersist.bgCoords.x += 20;
                        break
                }
                
                this.tweens.add({
                    targets: this.panelsContainer,
                    x: this.containorToX,
                    ease: 'Sine.InOut',
                    duration: 500,
                });   
            }, this);

            this.input.keyboard.on('keydown-LEFT', e => {
                const ourPersist = this.scene.get('PersistScene');
                if (this.selectedPanel > 0) {

                    // Fade Out Current Text
                    this.tweens.add({
                        targets: panelsArray[this.selectedPanel].get("text"),
                        alpha: { from: 1, to: 0 },
                        ease: 'Sine.InOut',
                        //delay: 500,
                        duration: fadeOut,
                        
                    });

                    this.selectedPanel -= 1
                    this.pop02.play();

                    // Fade In Current Text
                    panelsArray[this.selectedPanel].get("text").forEach( text => {
                        text.alpha = 0;
                    })
                    // Fade In New Text
                    this.tweens.add({
                        targets: panelsArray[this.selectedPanel].get("text"),
                        alpha: { from: 0, to: 1 },
                        ease: 'Sine.InOut',
                        delay: fadeInDelay,
                        duration: fadeIn,
                    });
                }

                this.containorToX = Math.min(this.containorToX + hOffSet, 0);

                // All the way left
                if (this.containorToX === 0) {
                    this.panelArrowL.setVisible(false); 

                } else { // Middle Pannel
                    this.panelArrowL.setVisible(true);
                    this.panelArrowR.setVisible(true);
                    ourPersist.bgCoords.x -= 20; 

                }
    
                
                this.tweens.add({
                    targets: this.panelsContainer,
                    x: this.containorToX,
                    ease: 'Sine.InOut',
                    duration: 500,
                    onComplete: function () {
                        
                        //if (ourTutorialScene.selectedPanel < 4) {
                            //debugger //@holden why are these debuggers here?
                            //ourTutorialScene.panelArrowR.setVisible(true);
                        //}
                        //else{
                            //debugger
                            //ourTutorialScene.panelArrowR.setVisible(false);
                        //}
                        
                    }
                }, this);   
            }, this)

        }

        // Fade Everything In

        this.tweens.add({
            targets: [...panelContents, this.panelArrowR, this.panelArrowL],
            alpha: {from: 0, to: 1},
            duration: 500,
            ease: 'sine.inout',
            yoyo: false,
            delay: 300,
            repeat: 0,
        });

        const onInput = function (scene) {
            if (scene.continueText.visible === true) {
                // @Holden add transition to nextScene here.
                scene.scene.start("GameScene", {
                    stage: START_STAGE,
                    score: 0,
                    startupAnim: true,
                });

                // Clear for reseting game
                scene.scene.get("SpaceBoyScene").stageHistory = [];
                scene.scene.get("PersistScene").coins = START_COINS;
                
            }

            else {
                                                

            }
            /* //@holden we need here or can move to reference?
            ourPersist.closingTween();
            scene.tweens.addCounter({
                from: 600,
                to: 0,
                ease: 'Sine.InOut',
                duration: 1000,
                onUpdate: tween =>
                    {   
                        graphics.clear();
                        var value = (tween.getValue());
                        scene.tweenValue = value
                        scene.shape1 = scene.make.graphics().fillCircle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * .5, value);
                        var geomask1 = scene.shape1.createGeometryMask();
                        
                        scene.cameras.main.setMask(geomask1,true)
                    },
                onComplete: () => {
                    scene.scene.setVisible(false);
                    //this.scene.get("UIScene").setVisible(false);
                    
                    //this.scene.launch('UIScene');
                    //scene.scene.launch('GameScene');
                    scene.scene.launch('MainMenuScene');
                    ourPersist.starterTween.stop();
                    ourPersist.openingTween(scene.tweenValue);
                    scene.openingTweenStart.stop();
                    scene.scene.stop();
                    
                    //var ourGameScene = this.scene.get("GameScene");
                }
            });
            */
        }
    
        
        this.continueText.on('pointerdown', e => {
            //console.log("I CLICK");
            if (this.continueText.visible === true) {
                //console.log("I click and continue");
                onInput(this);
            }
        });

        this.input.keyboard.on('keydown-SPACE', e => {
            onInput(this);

        });
    }
}

// #region StartScene
class StartScene extends Phaser.Scene {
    constructor () {
        super({key: 'StartScene', active: true});
    }
    init() {
        // #region StartScene()
        this.UUID_MAP = new Map();
        
        
        
    }

    preload() {
        //this.load.atlas({
        //    key: '',
        //    textureURL: '',
        //    atlasURL: ''
        //});
        //this.load.atlas('megaAtlas', 'assets/atlas/textureAtlas24_06_27.png', 'assets/atlas/atlasMeta24_06_27.json');
        this.load.atlas({
            key: 'megaAtlas',
            textureURL: 'assets/atlasMeta24_08_07.png',
            normalMap: 'assets/atlasMeta24_08_07_n.png',
            atlasURL: 'assets/atlasMeta24_08_07.json'
        });

        this.load.bitmapFont('mainFont', 'assets/Fonts/mainFont_0.png', 'assets/Fonts/mainFont.fnt');


        this.load.spritesheet('portals', 'assets/sprites/portalAnim.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('portalHighlights', 'assets/sprites/portalAnimHighlight.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('portalWalls', 'assets/sprites/portalWallAnim.png', { frameWidth: 12, frameHeight: 12 });
        this.load.spritesheet('stars', 'assets/sprites/starSheet.png', { frameWidth: 17, frameHeight: 17 });
        this.load.spritesheet('electronParticleFanfare', 'assets/sprites/electronParticleFanfare.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('menuIcons', 'assets/sprites/ui_menuButtonSheet.png', { frameWidth: 14, frameHeight: 14 });
        this.load.image('titleLogo','assets/sprites/UI_titleLogo.png')
        this.load.spritesheet('arrowMenu','assets/sprites/UI_ArrowMenu.png',{ frameWidth: 17, frameHeight: 15 });
        
        this.load.image('electronParticle','assets/sprites/electronParticle.png')
        this.load.image('spaceBoyBase','assets/sprites/spaceBoyBase.png')
        this.load.image('spaceBoyLight','assets/sprites/spaceBoyLight.png')
        this.load.image('UI_ScorePanel','assets/sprites/UI_ScorePanel.png')
        this.load.image('comboBG','assets/sprites/UI_comboBG.png')
        
        // Tilemap
        this.load.image('tileSheetx12', ['assets/Tiled/tileSheetx12.png','assets/Tiled/tileSheetx12_n.png']);

        // Load Tilemap as Sprite sheet to allow conversion to Sprites later.
        // Doesn't need to be GPU optimized unless we use it more regularly.
        this.load.spritesheet('tileSprites', ['assets/Tiled/tileSheetx12.png','assets/Tiled/tileSheetx12_n.png'], { frameWidth: GRID, frameHeight: GRID });


        this.load.spritesheet('blackholeAnim', '/assets/sprites/blackholeAnim.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('extractHole', '/assets/sprites/extractHole.png',{ frameWidth: 64, frameHeight: 64 });

        // GameUI
        //this.load.image('boostMeter', 'assets/sprites/boostMeter.png');
        this.load.atlas('uiGlassL', 'assets/sprites/UI_Glass_9SliceLEFT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiGlassR', 'assets/sprites/UI_Glass_9SliceRIGHT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiPanelL', 'assets/sprites/UI_Panel_9SliceLEFT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiPanelR', 'assets/sprites/UI_Panel_9SliceRIGHT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiMenu', 'assets/sprites/UI_MenuPanel_9Slice.png', 'assets/9slice/nine-sliceMenu.json');
        //this.load.spritesheet('boostMeterAnim', 'assets/sprites/UI_boostMeterAnim.png', { frameWidth: 256, frameHeight: 48 });
        this.load.image('boostMeterFrame', 'assets/sprites/UI_boostMeterFrame.png');
        this.load.image('boostMeterBG', 'assets/sprites/UI_boostMeterBG.png');
        this.load.image('atomScoreFrame', 'assets/sprites/UI_atomScoreFrame.png');
        this.load.image('fuseFrame', 'assets/sprites/UI_fuseHolder.png');
        //this.load.image('boostMask', "assets/sprites/boostMask.png");
        //this.load.image('scoreScreenBG', 'assets/sprites/UI_ScoreScreenBG01.png');
        this.load.image('scoreScreenBG2', 'assets/sprites/UI_ScoreScreenBG02.png');
        this.load.image('tutSnakeWASD', 'assets/HowToCards/tutorial_snake_WASD.png');
        this.load.image('tutSnakeSPACE', 'assets/HowToCards/tutorial_snake_SPACE.png');
        this.load.image('tutSnakePortal1', 'assets/HowToCards/tutorial_snake_portal1.png');
        this.load.image('tutSnakePortal2', 'assets/HowToCards/tutorial_snake_portal2.png');
        //this.load.spritesheet('ranksSheet', ['assets/sprites/ranksSpriteSheet.png','assets/sprites/ranksSpriteSheet_n.png'], { frameWidth: 48, frameHeight: 72 });
        //this.load.spritesheet('downArrowAnim', 'assets/sprites/UI_ArrowDownAnim.png',{ frameWidth: 32, frameHeight: 32 });
        //this.load.spritesheet('twinkle01Anim', 'assets/sprites/twinkle01Anim.png', { frameWidth: 16, frameHeight: 16 });
        //this.load.spritesheet('twinkle02Anim', 'assets/sprites/twinkle02Anim.png', { frameWidth: 16, frameHeight: 16 });
        //this.load.spritesheet('twinkle03Anim', 'assets/sprites/twinkle03Anim.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("comboLetters", "assets/sprites/comboLetters.png",{ frameWidth: 18, frameHeight: 24 });
        this.load.image('comboCover', 'assets/sprites/UI_comboCover.png');
        //this.load.image("snakeMask", "assets/sprites/snakeMask.png");
        //this.load.image("portalMask", "assets/sprites/portalMask.png");


        // Animations
        //this.load.spritesheet('electronCloudAnim', 'assets/sprites/electronCloudAnim.png', { frameWidth: 44, frameHeight: 36 });
        this.load.spritesheet('CapElectronDispersion', 'assets/sprites/UI_CapElectronDispersion.png', { frameWidth: 28, frameHeight: 18 });
        //this.load.spritesheet('atomicPickup01Anim', 'assets/sprites/atomicPickup01Anim.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('atomicPickupComet', 'assets/sprites/atomicPickupComet.png', { frameWidth: 12, frameHeight: 12 });
        this.load.spritesheet('atomicPickupScore', 'assets/sprites/atomicPickupScoreAnim.png', { frameWidth: 6, frameHeight: 6 });
        this.load.spritesheet('coinPickup01Anim', 'assets/sprites/coinPickup01Anim.png', { frameWidth: 10, frameHeight: 20 });
        this.load.spritesheet('uiExitPanel', 'assets/sprites/UI_exitPanel.png', { frameWidth: 45, frameHeight: 20 });
        this.load.spritesheet('startingArrowsAnim', 'assets/sprites/startingArrowsAnim.png', { frameWidth: 24, frameHeight: 24 });
        //this.load.spritesheet('fruitAppearSmokeAnim', 'assets/sprites/fruitAppearSmokeAnim.png', { frameWidth: 52, frameHeight: 52 }); //not used anymore, might come back for it -Holden    
        //this.load.spritesheet('dreamWallAnim', 'assets/sprites/wrapBlockAnimOLD.png', { frameWidth: GRID, frameHeight: GRID });
        //this.load.spritesheet('boostTrailX', 'assets/sprites/boostTrailX01Anim.png', { frameWidth: 24, frameHeight: 72 });
        this.load.spritesheet('UI_CapSpark', 'assets/sprites/UI_CapSpark.png', { frameWidth: 12, frameHeight: 24 });
        //this.load.spritesheet('snakeOutlineBoosting', 'assets/sprites/snakeOutlineAnim.png', { frameWidth: 28, frameHeight: 28 });
        //this.load.spritesheet('snakeOutlineBoostingSmall', 'assets/sprites/snakeOutlineSmallAnim.png', { frameWidth: 28, frameHeight: 28 });
        this.load.spritesheet('tutWASD', 'assets/HowToCards/tutorial_WASD.png', { frameWidth: 43, frameHeight: 29 });
        this.load.spritesheet('tutSPACE', 'assets/HowToCards/tutorial_SPACE.png', { frameWidth: 67, frameHeight: 31 });


        // Loads All Stage Properties
        STAGES.forEach( stageName => {
            /***
             * ${stageName}.properties is to avoid overloading the json object storage that already
             * has the Stage Name in it from loading the level. ${stageName}.properties
             * exclusivley loads the Tiled properties into the global cache.
             */
            var cacheName = `${stageName}.properties`;
            this.load.json(cacheName, `/assets/Tiled/${stageName}.json`, 'properties');
            //debugger

        });

        // Audio
        this.load.setPath('assets/audio');

        this.load.audio('snakeCrash', [ 'snakeCrash.ogg', 'snakeCrash.mp3']);
        this.load.audio('pop02', [ 'pop02.ogg', 'pop02.mp3']);
        this.load.audio('pop03', [ 'pop03.ogg', 'pop03.mp3']);
        this.load.audio('chime01',[ 'chime01.ogg', 'chime01.mp3'])
        //this.load.audio('capSpark', [ 'capSpark.ogg', 'capSpark.mp3']); //still need to find a good sound

        SOUND_ATOM.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
        SOUND_RANK.forEach(soundID =>
            {
                this.load.audio(soundID[0], soundID[1]);
            });
        this.load.audio({
            key: 'chargeUp',
            url: ['chargeUp.ogg', 'chargeUp.mp3']
        })
        this.load.audio({
            key: 'coinCollect',
            url: ['coinCollect.ogg', 'coinCollect.mp3']
        })
        
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

        const ourPersist = this.scene.get("PersistScene");
        const ourSpaceBoy = this.scene.get("SpaceBoyScene");
        const ourGame = this.scene.get("GamesScene");
        const ourStartScene = this.scene.get("StartScene");

        //pauses and resumes sound so queued sfx don't play all at once upon resuming
        window.addEventListener('focus', function () {
            game.sound.pauseAll();
            //console.log('All sounds paused:', game.sound.sounds);
        });
        
        window.addEventListener('blur', function () {
            game.sound.resumeAll();
            //console.log('All sounds resumed:', game.sound.sounds);
        });
        
        

        var gaVersion;
        if (IS_DEV) {
            gaVersion = DEV_BRANCH;
        } else {
            gaVersion = ANALYTICS_VERS;
        }
        gameanalytics.GameAnalytics.configureBuild(gaVersion);
        gameanalytics.GameAnalytics.configureAvailableResourceCurrencies(["zeds", "points"]);
        gameanalytics.GameAnalytics.configureAvailableResourceItemTypes(["Gameplay"]);
        gameanalytics.GameAnalytics.configureAvailableCustomDimensions01( //@james this doesn't work
            "00",
            "01",
            "02",
            "03",
            "04",
            "05-09",
            "10s",
            "20s",
            "30s",
            "40s",
            "50s",
            "60s",
            "70s",
            "80s",
            "90s",
            "100s",
            "110s",
            "120s",
            "130s"
        );
        if (ANALYTICS_ON) {
            gameanalytics.GameAnalytics.initialize("95237fa6c6112516519d921eaba4f125", "12b87cf9c4dc6d513e3f6fff4c62a8f4c9a63570");
        }
        
        gameanalytics.GameAnalytics.setEnabledInfoLog(true);
        //gameanalytics.GameAnalytics.setEnabledVerboseLog(true);
        
        

        /// Start Inital Game Settings
              
        

        // Load all animations once for the whole game.
        loadSpriteSheetsAndAnims(this);
        this.scene.launch('SpaceBoyScene');
        this.scene.launch('GalaxyMapScene');
        this.scene.launch('PersistScene');
        
        //temporarily removing HOW TO PLAY section from scene to move it elsewhere
        if (localStorage["version"] === undefined) {
            this.hasPlayedBefore = false;
            console.log("Testing LOCAL STORAGE => Has not played.", );

        } else {
            this.hasPlayedBefore = true;
            console.log("Testing LOCAL STORAGE => Has played.", );
        }


        // Get the Map of UUIDs

        STAGES.forEach( stageName => {
            
            var cacheName = `${stageName}.properties`;
            var stageCache = this.cache.json.get(cacheName);

            stageCache.forEach( probObj => {
                if (probObj.name === "UUID") {
                    this.UUID_MAP.set(probObj.value, stageName )
                }
            });
        });



        // Syncing UUIDs with real stage names
        // Keeps unlock chain working when we change stage names.
        // and lets users keep their high score.

        let entries = Object.entries(localStorage);

        entries.forEach(log => {
            var key = log[0].split("-");
            if (key[key.length - 1] === "bestStageData") {

                var uuidString = log[0].slice(0, -14);
                var correctStage = this.UUID_MAP.get(uuidString);
                var localJSON = JSON.parse(log[1]);

                if (correctStage === undefined) {
                    // Stage in History is not currently playable.
                    console.log(`Unused Stage: ${localJSON.stage} in Local Storage with UUID ${localJSON.uuid} is not in game.`)
                    
                } else {
                
                console.log();
                    if (localJSON.stage != correctStage) {
                        var logJSON = JSON.parse(localStorage.getItem(`${uuidString}-bestStageData`));
                        var stageDataLog = new StageData(logJSON);
                        
                        // Update Stage Name
                        stageDataLog.stage = correctStage;
                        
                        // Save New 
                        localStorage.setItem(`${uuidString}-bestStageData`, JSON.stringify(stageDataLog));
                    }
                }                       
            }
        });
    
    




        this.portalColors = PORTAL_COLORS.slice();
        // Select a random color
        let randomColor = this.portalColors[Math.floor(Math.random() * this.portalColors.length)];

        var hexToInt = function (hex) {
            return parseInt(hex.slice(1), 16);
        }

        let intColor = hexToInt(randomColor);
        //console.log(_portalColor)

        

        //title logo
        var titleLogo = this.add.sprite(SCREEN_WIDTH/2,SCREEN_HEIGHT/2 - GRID * 0,'titleLogo').setDepth(60);
        var titlePortal = this.add.sprite(X_OFFSET + GRID * 7.1,SCREEN_HEIGHT/2 - GRID * 0.0,);
        //titlePortal.setTint(_portalColor);
        titlePortal.setTint(intColor).setScale(1.25);
        titlePortal.play('portalIdle');

        this.pressToPlay = this.add.dom(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '24px',
            "fontWeight": 400,
            "color": "white",
            "textAlign": 'center'

        }),
                `Press Space`
        ).setOrigin(0.5,0.5).setScale(0.5);

        this.pressToPlayTween = this.tweens.add({
            targets: this.pressToPlay,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.scene.start('MainMenuScene', {
            portalTint: intColor,
            portalFrame: Phaser.Math.Wrap(
                titlePortal.anims.currentFrame.index + 1, 
                0, 
                titlePortal.anims.getTotalFrames() - 1
                )
        });


        const onInput = function (scene) { // @james - something is not right here
            if (scene.continueText.visible === true) {
                const ourPersist = scene.scene.get('PersistScene');
                //continueText.on('pointerdown', e =>
                //{
                //    this.onInput();
                //    //ourInput.moveUp(ourGame, "upUI")
            
                //});
            
            /** 
            else {
                                                

            }
            ourPersist.closingTween(); //@holden do we need to keep this?
            scene.tweens.addCounter({
                from: 600,
                to: 0,
                ease: 'Sine.InOut',
                duration: 1000,
                onUpdate: tween =>
                    {   
                        graphics.clear();
                        var value = (tween.getValue());
                        scene.tweenValue = value
                        scene.shape1 = scene.make.graphics().fillCircle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * .5, value);
                        var geomask1 = scene.shape1.createGeometryMask();
                        
                        scene.cameras.main.setMask(geomask1,true)
                    },
                onComplete: () => {
                    scene.scene.setVisible(false);
                    //this.scene.get("UIScene").setVisible(false);
                    
                    //this.scene.launch('UIScene');
                    //scene.scene.launch('GameScene');
                    scene.scene.launch('MainMenuScene');
                    ourPersist.starterTween.stop();
                    ourPersist.openingTween(scene.tweenValue);
                    scene.openingTweenStart.stop();
                    scene.scene.stop();
                    
                    //var ourGameScene = this.scene.get("GameScene");
                    //console.log(e)
                }
            });
            */
            }
        }
        
        // Shows Local Storage Sizes for Debugging.

        if (DEBUG_SHOW_LOCAL_STORAGE) {
            var _lsTotal=0,_xLen,_x;for(_x in localStorage){ if(!localStorage.hasOwnProperty(_x)){continue;} _xLen= ((localStorage[_x].length + _x.length)* 2);_lsTotal+=_xLen; console.log(_x.substr(0,50)+" = "+ (_xLen/1024).toFixed(2)+" KB")};console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");            
        }
        
        
    }

    onInput() {
        // #region SCORE DEBUG
        if (SCORE_SCENE_DEBUG) {
                

            var ourGame = this.scene.get("GameScene");
            var ourInput = this.scene.get("InputScene");
            this.scene.start('ScoreScene');
        }
        else {
                                            
            this.scene.setVisible(false);
            //this.scene.get("UIScene").setVisible(false);
            
            //this.scene.launch('UIScene');
            this.scene.launch('GameScene');
            //var ourGameScene = this.scene.get("GameScene");
            //console.log(e)
        }
        this.scene.stop();
    }
    end() {

    }
}


class QuickMenuScene extends Phaser.Scene {
    constructor () {
        super({key: 'QuickMenuScene', active: false});
    }
    preload(){

    }
    create(qMenuArgs){

        // #region Quick Menu
        this.menuOptions = qMenuArgs.menuOptions;

        var menuTop = SCREEN_HEIGHT/2 - GRID * 2.5;
        this.menuList = [...this.menuOptions.keys()];
        this.cursorIndex = qMenuArgs.cursorIndex;
        var _textStart = menuTop + GRID * 3;
        var _spacing = 20;
        this.menuElements = [];

        this.promptText = this.add.dom(SCREEN_WIDTH / 2, menuTop + GRID, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '20px',
            "fontWeight": 400,
            "color": "white",
        }),
            `${qMenuArgs.textPrompt}`
        ).setOrigin(0.5,0).setScale(0.5).setAlpha(1);

        var panelHeight = (2 * _spacing * (this.menuList.length - 1)) + _spacing * 0.75;

        //nineSlice
        this.qPanel = this.add.nineslice(SCREEN_WIDTH/2, menuTop, 
            'uiPanelL', 'Glass', 
            GRID * 19 + 1, panelHeight , 
            8, 8, 8, 8);
        this.qPanel.setDepth(60).setOrigin(0.5,0).setScrollFactor(0).setVisible(true);

        
        if (this.menuElements.length < 1) {
            for (let index = 0; index < this.menuList.length; index++) {   
                if (index === this.cursorIndex) {
                    console.log('adding');
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '20px',
                        "fontWeight": 400,
                        "color": "white",
                    }),
                        `${this.menuList[index].toUpperCase()}`
                    ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(1);
                }
                else{
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '20px',
                        "fontWeight": 400,
                        "color": "darkgrey",
                    }),
                            `${this.menuList[index].toUpperCase()}`
                    ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(1);
                }
    
                
                this.menuElements.push(textElement);
                
                
            } 
        }

        this.input.keyboard.on('keydown-SPACE', e => {
            var option = this.menuList[this.cursorIndex];
                this.menuOptions.get(option).call(this, qMenuArgs.fromScene);
        }, this);

        this.input.keyboard.on('keydown-DOWN', function() {
            // Reset all menu elements to dark grey
            //this.menuElements.forEach((element, index) => {
            //    element.node.style.color = "darkgrey";
            //});

            //var _selected = this.menuElements[this.cursorIndex];
            //_selected.node.style.color = "white";
        
            this.menuElements[this.cursorIndex].node.style.color = "darkgrey";
            this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex + 1, 0, this.menuElements.length)
            this.menuElements[this.cursorIndex].node.style.color = "white";
            

            
            // Set the selected element to white
        }, this);

        this.input.keyboard.on('keydown-UP', function() {
            this.menuElements[this.cursorIndex].node.style.color = "darkgrey";
            this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex - 1, 0, this.menuElements.length)
            this.menuElements[this.cursorIndex].node.style.color = "white";
        }, this);


        this.input.keyboard.on('keydown-TAB', function() {
            this.scene.sleep("QuickMenuScene");
        }, this);

        

        // #endregion


    }
}

// #region MainMenuScene
class MainMenuScene extends Phaser.Scene {
    constructor () {
        super({key: 'MainMenuScene', active: false});
    }
    preload(){
        this.load.spritesheet('coinPickup01Anim', 'assets/sprites/coinPickup01Anim.png', { frameWidth: 10, frameHeight:20 });
        this.load.spritesheet('uiExitPanel', 'assets/sprites/UI_exitPanel.png', { frameWidth: 45, frameHeight: 20 });

    }
    create(props) {

        var { startingAnimation = "default" } = props;

        var { portalTint = parseInt("0xFFFFFF", 16)} = props;
        var { portalFrame = 0 } = props;
        
        
        

        if (startingAnimation === "default") {
            var titleContainer = this.add.container().setDepth(51);

            var titleLogo = this.add.sprite(SCREEN_WIDTH/2,SCREEN_HEIGHT/2 - GRID * 0,'titleLogo').setDepth(60);
            var titlePortal = this.add.sprite(X_OFFSET + GRID * 7.1,SCREEN_HEIGHT/2 - GRID * 0.0,);
            
            titlePortal.setTint(portalTint).setScale(1.25);
            titlePortal.play('portalIdle', {startFrame: portalFrame} );


            titleContainer.add(titleLogo);
            titleContainer.add(titlePortal);
            
            var titleTween = this.tweens.add({
                targets: titleContainer,
                y: -GRID * 7,
                duration: 750,
                ease: 'Sine.InOut',
            });
            
        } else if (startinAnimation === "menuReturn") {

        }


        this.input.keyboard.addCapture('UP,DOWN,SPACE');
        const mainMenuScene = this.scene.get('MainMenuScene');
        const ourPersist = this.scene.get('PersistScene');
        const ourMap = this.scene.get('GalaxyMapScene');

        this.pressedSpace = false;




        //description panel
        this.descriptionDom = 'Travel to dozens of worlds and conquer their challenges. Unlock unique upgrades, items, cosmetics, and game modes.'
        this.descriptionPanel = this.add.nineslice(SCREEN_WIDTH/2 + GRID * 2.5, SCREEN_HEIGHT/2 - GRID * 2, 
            'uiPanelL', 'Glass', 
            GRID * 10, 75, 
            16, 16, 16, 16).setDepth(50).setOrigin(0,0).setAlpha(0);
        this.descriptionText = this.add.dom(SCREEN_WIDTH/2 + GRID * 3.25, SCREEN_HEIGHT/2 - GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '16px',
            "fontWeight": 200,
            "color": "white",
            "width": '210px',
            "height": '75px',
            "textAlign": 'left'

        }),
                `${this.descriptionDom}`
        ).setOrigin(0.0,0).setScale(0.5).setAlpha(0);


        this.graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff }, fillStyle: { color: 0xffffff } });
        this.descriptionPointer = new Phaser.Geom.Circle(SCREEN_WIDTH/2 - GRID * 1, SCREEN_HEIGHT/2 + 3, 3);
        this.graphics.fillCircleShape(this.descriptionPointer);
        this.graphics.lineBetween(this.descriptionPointer.x, this.descriptionPointer.y, this.descriptionPanel.x,this.descriptionPointer.y);
        this.graphics.setAlpha(0);

        this.graphics.setDepth(50)



        var menuOptions = new Map([
            ['practice', function () {
                console.log("Practice");
                return true;
            }],
            ['adventure', function () {
                // Check if played before here. Maybe check for world 0-1 level stage data?

                
                if (NO_EXPERT_MODE) {
                    const mainMenuScene = this.scene.get("MainMenuScene");

                    if (localStorage.hasOwnProperty(`${START_UUID}-bestStageData`)) {
                        var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);
                        mainMenuScene.scene.launch('TutorialScene', [randomHowTo]);
                    } else {
                        mainMenuScene.scene.launch('TutorialScene', ["move", "atoms", "portals" , "boost"]);
                    }

                    mainMenuScene.scene.bringToTop('SpaceBoyScene');//if not called, TutorialScene renders above
                    this.scene.stop();
        
                } else {
                    var qMenu = QUICK_MENUS.get("adventure-mode");

                    
                    mainMenuScene.scene.launch("QuickMenuScene", {
                        menuOptions: qMenu, 
                        textPrompt: "MODE SELECTOR",
                        fromScene: mainMenuScene,
                        cursorIndex: 0
                    });
                    mainMenuScene.scene.bringToTop("QuickMenuScene");

                    mainMenuScene.scene.sleep('MainMenuScene');

                }
                



                /*

                */
                return true;
            }],
            ['extraction', function () {
                return true;
            }],
            ['championship', function () {
                return true;
            }],
            ['gauntlet', function () {
                return true;
            }],
            ['endless', function () {
                return true;
            }],
            ['extras', function () {
                return true;
            }],
            ['options', function () {
                return true;
            }],
            ['exit', function () {
                return true;
            }]
        ]);

        var menuList = [...menuOptions.keys()];
        var cursorIndex = 1;
        var textStart = 152;
        var spacing = 24;

        
        var menuElements = []
        for (let index = 0; index < menuList.length; index++) {
            if (index == 2 || index == 3 || index == 5) {
                var textElement = this.add.dom(SCREEN_WIDTH / 2 - GRID * 8.5, textStart + index * spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                    "color": "darkgrey",
                    "text-decoration": 'line-through'
                }),
                        `${menuList[index].toUpperCase()}`
                ).setOrigin(0.0,0).setScale(0.5).setAlpha(0);
            }
            else if (index == 8) { //exit button
                var textElement = this.add.dom(X_OFFSET + GRID * 0.75, Y_OFFSET + 4, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                    "color": "#181818",
                }),
                        `${menuList[index].toUpperCase()}`
                ).setOrigin(0.0,0).setScale(0.5).setAlpha(0);
            }
            else{
                var textElement = this.add.dom(SCREEN_WIDTH / 2 - GRID * 8.5, textStart + index * spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                    "color": "#181818",
                }),
                        `${menuList[index].toUpperCase()}`
                ).setOrigin(0.0,0).setScale(0.5).setAlpha(0); 
            }
            menuElements.push(textElement);
            
        }
        //menuElements[1].setAlpha(0);

        //panels

        let _hOffset = SCREEN_WIDTH/2 - GRID * 10.5;
        let _vOffset = SCREEN_HEIGHT/2 - GRID * 1.75;

        this.practiceButton = this.add.nineslice(_hOffset,_vOffset, 'uiMenu', 'brown', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.practiceIcon = this.add.sprite(this.practiceButton.x + 2,this.practiceButton.y,"menuIcons", 0 ).setOrigin(0,0.5).setAlpha(0);
        
        this.adventureButton = this.add.nineslice(_hOffset,_vOffset + GRID * 2, 'uiMenu', 'purple', 104, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.adventureIcon = this.add.sprite(this.adventureButton.x + 2,this.adventureButton.y,"menuIcons", 9 ).setOrigin(0,0.5).setAlpha(0);
        
        this.extractionButton = this.add.nineslice(_hOffset,_vOffset + GRID * 4, 'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.extractionIcon = this.add.sprite(this.extractionButton.x + 2,this.extractionButton.y,"menuIcons", 2 ).setOrigin(0,0.5).setAlpha(0);

        this.championshipButton = this.add.nineslice(_hOffset,_vOffset + GRID * 6, 'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.championshipIcon = this.add.sprite(this.championshipButton.x + 2,this.championshipButton.y,"menuIcons", 3 ).setOrigin(0,0.5).setAlpha(0);

        this.gauntletButton = this.add.nineslice(_hOffset,_vOffset + GRID * 8, 'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.gauntletIcon = this.add.sprite(this.gauntletButton.x + 2,this.gauntletButton.y,"menuIcons", 4 ).setOrigin(0,0.5).setAlpha(0);

        this.endlessButton = this.add.nineslice(_hOffset,_vOffset + GRID * 10, 'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.endlessIcon = this.add.sprite(this.endlessButton.x + 2,this.endlessButton.y,"menuIcons", 5 ).setOrigin(0,0.5).setAlpha(0);

        this.extrasButton = this.add.nineslice(_hOffset,_vOffset + GRID * 12, 'uiMenu', 'blue', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.extrasIcon = this.add.sprite(this.extrasButton.x + 2,this.extrasButton.y,"menuIcons", 6 ).setOrigin(0,0.5).setAlpha(0);

        this.optionsButton = this.add.nineslice(_hOffset,_vOffset + GRID * 14, 'uiMenu', 'grey', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.optionsIcon = this.add.sprite(this.optionsButton.x + 2,this.optionsButton.y,"menuIcons", 7 ).setOrigin(0,0.5).setAlpha(0);

        this.exitButton = this.add.sprite(X_OFFSET,Y_OFFSET, 'uiExitPanel',0).setOrigin(0,0).setAlpha(0);
        
        var menuSelector = this.add.sprite(SCREEN_WIDTH / 2 - GRID * 11.5, SCREEN_HEIGHT/2 + GRID * 0.25,'snakeDefault').setAlpha(0)

        //menu arrows
        var arrowMenuR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
        arrowMenuR.play('arrowMenuIdle').setAlpha(0);
        var arrowMenuL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
        arrowMenuL.play('arrowMenuIdle').setFlipX(true).setAlpha(0);

        var selected = menuElements[cursorIndex];
        selected.node.style.color = "white";

        var mapEngaged = false;
        this.menuState = 0

        

        this.input.keyboard.on('keydown-SPACE', function() {
            if (this.menuState == 1) {
                
            }
        })



        this.input.keyboard.on('keydown-LEFT', e => {
            if (this.pressedSpace && this.menuState == 0) {
                this.cameras.main.scrollX -= SCREEN_WIDTH
                ourMap.cameras.main.scrollX -= SCREEN_WIDTH
                mainMenuScene.scene.sleep('MainMenuScene');
                this.menuState = 1;
            }
        });
        this.input.keyboard.on('keydown-RIGHT', e => {
            if (this.pressedSpace && this.menuState == 1) {
                this.cameras.main.scrollX += SCREEN_WIDTH
                ourMap.cameras.main.scrollX += SCREEN_WIDTH
                mainMenuScene.scene.wake('MainMenuScene');
                this.menuState = 0;
            }
        });
    

        this.input.keyboard.on('keydown-DOWN', function() {
            if (mainMenuScene.pressedSpace) {
                

                if (cursorIndex == 2 || cursorIndex == 3 || cursorIndex == 5) {
                    selected.node.style.color = 'darkgrey';
                }
                else{
                    selected.node.style.color = '#181818';
                }
                
                cursorIndex = Phaser.Math.Wrap(cursorIndex + 1, 0, menuElements.length);
                selected = menuElements[cursorIndex];
                if (cursorIndex == 8) {
                    menuSelector.x = menuSelector.x - GRID * 1.75
                    menuSelector.y = selected.y + GRID * 2.25
                    mainMenuScene.exitButton.setFrame(1);
                } else {
                    mainMenuScene.exitButton.setFrame(0);
                    menuSelector.x = SCREEN_WIDTH / 2 - GRID * 11.5
                    menuSelector.y = selected.y + 7
                }
                selected.setAlpha(1);
                

                

                if (cursorIndex >= 2 && cursorIndex <= 5) {
                    selected.node.style.color = "darkgrey";
                    selected.setAlpha(1)
                }
                else{
                    selected.node.style.color = "white";
                    selected.setAlpha(1)
                }
                
                ourPersist.bgCoords.y += 5;
                
                mainMenuScene.changeMenuSprite(cursorIndex);
                //upArrow.y = selected.y - 42;
                //downArrow.y = selected.y + 32;

                //continueTextUI.setText(`[GOTO ${selected[1]}]`);
            }
            
        }, [], this);

        this.input.keyboard.on('keydown-UP', function() {
            if (mainMenuScene.pressedSpace) {
                if (cursorIndex == 2 || cursorIndex == 3 || cursorIndex == 5) {
                    selected.node.style.color = 'darkgrey';
                }
                else{
                    selected.node.style.color = '#181818';

                }
                cursorIndex = Phaser.Math.Wrap(cursorIndex - 1, 0, menuElements.length);
                selected = menuElements[cursorIndex];
                if (cursorIndex == 8) {
                    menuSelector.x = menuSelector.x - GRID * 1.75
                    menuSelector.y = selected.y + GRID * 2.25
                    mainMenuScene.exitButton.setFrame(1);
                } else {
                    mainMenuScene.exitButton.setFrame(0);
                    menuSelector.x = SCREEN_WIDTH / 2 - GRID * 11.5
                    menuSelector.y = selected.y + 7
                }
                selected.setAlpha(1);
                
                selected = menuElements[cursorIndex];
                if (cursorIndex >= 2 && cursorIndex <= 5) {
                    selected.node.style.color = "darkgrey";
                    selected.setAlpha(1)

                }
                else{
                    selected.node.style.color = "white";
                    selected.setAlpha(1)
                }
    
                ourPersist.bgCoords.y -= 5;
    
                mainMenuScene.changeMenuSprite(cursorIndex);
            }
        }, [], this);


        
        
        var menuFadeTween = this.tweens.add({
            targets: [this.practiceButton,this.practiceIcon,this.adventureButton,this.adventureIcon,
                this.extractionButton,this.extractionIcon,this.championshipButton,
                this.championshipIcon,this.gauntletButton,this.gauntletIcon,
                this.endlessButton,this.endlessIcon,this.extrasButton,this.extrasIcon,
                this.optionsButton,this.optionsIcon,menuSelector,
                this.descriptionPanel,this.descriptionText,
                arrowMenuL,arrowMenuR,
                ...menuElements,
                this.exitButton,
                this.graphics
            ],
            alpha: 1,
            duration: 100,
            delay: 500,
            ease: 'linear',
        });
        titleTween.pause();
        menuFadeTween.pause();
        
        this.pressToPlay = this.add.dom(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '24px',
            "fontWeight": 400,
            "color": "white",
            "textAlign": 'center'

        }),
                `Press Space`
        ).setOrigin(0.5,0.5).setScale(0.5);

        this.pressToPlayTween = this.tweens.add({
            targets: this.pressToPlay,
            alpha: 0,
            duration: 1000,
            ease: 'Sine.InOut',
            yoyo: true,
            repeat: -1,
        });

        this.input.keyboard.on('keydown-SPACE', function() {
            if (!mainMenuScene.pressedSpace) {
                mainMenuScene.pressToPlayTween.stop();
                mainMenuScene.pressToPlay.setAlpha(0)
                mainMenuScene.pressedSpace = true;
                titleTween.resume();
                menuFadeTween.resume();            
            }
            else{
                menuOptions.get(menuList[cursorIndex]).call(this);
            }

        }, this);

        
        
    }
    update() {
        this.graphics.clear();
            if (this.pressedSpace) {
                this.graphics.fillCircleShape(this.descriptionPointer);
            
                //left horizontal line connecting left dot
                this.graphics.lineBetween(this.descriptionPointer.x, this.descriptionPointer.y - 0.5,
                    this.descriptionPanel.x - 8,this.descriptionPointer.y - 0.5);
                
                //vertical line
                this.graphics.lineBetween(this.descriptionPanel.x - 8, this.descriptionPointer.y,
                    this.descriptionPanel.x - 8,this.descriptionPanel.y + this.descriptionPanel.height/2);
        
                //second horizontal line from left
                this.graphics.lineBetween(this.descriptionPanel.x - 8, this.descriptionPanel.y + this.descriptionPanel.height/2,
                    this.descriptionPanel.x + 4,this.descriptionPanel.y + this.descriptionPanel.height/2);
            } 
        }

    // Function to convert hex color to RGB
    hexToInt(hex) {
        return parseInt(hex.slice(1), 16);
    }
    changeMenuSprite(cursorIndex){
        this.practiceIcon.setFrame(0);
        this.adventureIcon.setFrame(1);
        this.extractionIcon.setFrame(2);
        this.championshipIcon.setFrame(3);
        this.gauntletIcon.setFrame(4);
        this.endlessIcon.setFrame(5);
        this.extrasIcon.setFrame(6);
        this.optionsIcon.setFrame(7);
        

        this.tweens.add({
            targets: [this.practiceButton,this.adventureButton,this.extractionButton,this.championshipButton,
                this.gauntletButton,this.endlessButton,this.extrasButton,this.optionsButton],
            width: 136,
            duration: 100,
            ease: 'Sine.InOut',
        });

        let _xOffset = SCREEN_WIDTH/2;
        let _yOffset = SCREEN_HEIGHT/2+ 3;

        switch (cursorIndex) {
            case 0:
                this.descriptionDom = 'Build your skills and replay any level you have gotten to previously.';
                this.descriptionText.setText(this.descriptionDom)
                this.practiceIcon.setFrame(8)
                this.tweens.add({
                    targets: this.practiceButton,
                    width: 88,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 2.5,
                    y: _yOffset - GRID * 2,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                
                break;
            case 1:
                this.descriptionDom = 'Travel to dozens of worlds and conquer their challenges. Unlock unique upgrades, items, cosmetics, and game modes.';
                this.descriptionText.setText(this.descriptionDom)
                this.adventureIcon.setFrame(9)
                this.tweens.add({
                    targets: this.adventureButton,
                    width: 104,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 75,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 1,
                    y: _yOffset,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 2:
                this.descriptionDom = 'Playable in full game!';
                this.descriptionText.setText(this.descriptionDom)
                this.extractionIcon.setFrame(10)
                this.tweens.add({
                    targets: this.extractionButton,
                    width: 106,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 1,
                    y: _yOffset + GRID * 2,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 3:
                this.descriptionDom = 'Playable in full game!';
                this.descriptionText.setText(this.descriptionDom)
                this.championshipIcon.setFrame(11)
                this.tweens.add({
                    targets: this.championshipButton,
                    width: 124,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset + GRID * .5,
                    y: _yOffset + GRID * 4,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 4:
                this.descriptionDom = 'Beat adventure mode to unlock.';
                this.descriptionText.setText(this.descriptionDom)
                this.gauntletIcon.setFrame(12)
                this.tweens.add({
                    targets: this.gauntletButton,
                    width: 94,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 2,
                    y: _yOffset + GRID * 6,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 5:
                this.descriptionDom = 'Playable in full game!';
                this.descriptionText.setText(this.descriptionDom)
                this.endlessIcon.setFrame(13)
                this.tweens.add({
                    targets: this.endlessButton,
                    width: 84,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 2.75,
                    y: _yOffset + GRID * 8,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 6:
                this.descriptionDom = 'Spend coins, customize, play bonus games, and more!';
                this.descriptionText.setText(this.descriptionDom)
                this.extrasIcon.setFrame(14)
                this.tweens.add({
                    targets: this.extrasButton,
                    width: 76,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 3.5,
                    y: _yOffset + GRID * 10,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 7:
                this.descriptionDom = 'Configure game settings.';
                this.descriptionText.setText(this.descriptionDom)
                this.optionsIcon.setFrame(15)
                this.tweens.add({
                    targets: this.optionsButton,
                    width: 84,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 2.75,
                    y: _yOffset + GRID * 12,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;
            case 8:
                this.descriptionDom = 'Quit to desktop.';
                this.descriptionText.setText(this.descriptionDom) 
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: _xOffset - GRID * 10.5,
                    y: _yOffset - GRID * 10.25,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                break;

                
            default:
                //;    
                break;
        }
    }
}

// #region Galaxy Map
class GalaxyMapScene extends Phaser.Scene {
    constructor () {
        super({key: 'GalaxyMapScene', active: true});
    }
    create() {
        this.input.keyboard.on('keydown-TAB', function (event) {
            event.preventDefault();
        });
        this.cameras.main.scrollX += SCREEN_WIDTH
        
        const thisScene = this.scene.get('GalaxyMapScene');
        const ourMenuScene = this.scene.get('MainMenuScene');

        this.arrowR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
        this.arrowR.play('arrowMenuIdle').setAlpha(1);

        this.galaxyMapState = 0;
        
        
        this.input.keyboard.on('keydown-RIGHT', e => {
            if (ourMenuScene.menuState == 1 && this.galaxyMapState == 0){
                ourMenuScene.menuState = 0;
                thisScene.cameras.main.scrollX += SCREEN_WIDTH
                ourMenuScene.cameras.main.scrollX += SCREEN_WIDTH
                thisScene.scene.wake('MainMenuScene');
                thisScene.scene.sleep('GalaxMapScene');
            }
        })

        this.input.keyboard.on('keydown-SPACE', e => {
            this.galaxyMapState = 1;
            this.arrowR.setAlpha(0);
            
        })
        this.input.keyboard.on('keydown-TAB', e => {
            this.galaxyMapState = 0;
            this.arrowR.setAlpha(1);
        })
            
        this.add.rectangle(SCREEN_WIDTH/2, (Y_OFFSET + SCREEN_HEIGHT)/2, 294, 280, 0x8fd3ff).setAlpha(0.2);

        // Define the nodes

        let _centerX = SCREEN_WIDTH/2
        let _centeryY = (Y_OFFSET + SCREEN_HEIGHT)/2
        let _segment1 = 50

        this.nodes = [
            { name: 'World_1-1', x: _centerX, y: _centeryY, neighbors: { up: 4, right: 1, down: 3, left: 2 } }, // Center node
            
            { name: 'World_1-2', x: _centerX + _segment1, y: _centeryY, neighbors: { left: 0 , right: 5} }, // Ring 1
            { name: 'World_2-2', x: _centerX - _segment1, y: _centeryY, neighbors: { right: 0 } },
            { name: 'World_3-2', x: _centerX, y: _centeryY + _segment1, neighbors: { up: 0 } },
            { name: 'World_4-2', x: _centerX, y: _centeryY - _segment1, neighbors: { down: 0 } },

            { name: 'World_2-3', x: _centerX + _segment1 * 2, y: _centeryY, neighbors: { left: 1 } }, // Ring 2
       ];

        // Create graphics for nodes
        this.nodeGraphics = this.nodes.map(node => {
            let graphics = this.add.graphics();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(node.x, node.y, 3);
            return graphics;
        });

        // Current selected node index
        this.currentNodeIndex = 0;
        this.highlightNode(this.currentNodeIndex);

        // Input handling
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.galaxyMapState == 1) {
            if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.changeNode('left');
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.changeNode('right');
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
                this.changeNode('up');
            } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
                this.changeNode('down');
            }
        }
    }


    changeNode(direction) {
        let currentNode = this.nodes[this.currentNodeIndex];
        let nextNodeIndex = currentNode.neighbors[direction];

        if (nextNodeIndex !== undefined) {
            // Remove highlight from current node
            this.highlightNode(this.currentNodeIndex, false);

            // Update current node index
            this.currentNodeIndex = nextNodeIndex;

            // Highlight new node
            this.highlightNode(this.currentNodeIndex);
        }
    }

    highlightNode(index, highlight = true) {
        let node = this.nodes[index];
        let graphics = this.nodeGraphics[index];
        graphics.clear();
        graphics.fillStyle(highlight ? 0xff0000 : 0xffffff, 1);
        graphics.fillCircle(node.x, node.y, 3);
    }
}

class PersistScene extends Phaser.Scene {
    constructor () {
        super({key: 'PersistScene', active: false});
    }

    init() {
        this.zeds = 0;
        this.sumOfBest = 0;
        this.stagesComplete = 0;
        this.coins = START_COINS;
    }
    /*preload() {
        this.cache.shader.add(waveShader.key, waveShader);
    }*/
    
    create() {


    

    // #region Persist Scene

    this.cameras.main.setBackgroundColor(0x111111);
    this.add.image(SCREEN_WIDTH/2 - 1,GRID * 1.5,'boostMeterBG').setDepth(10).setOrigin(0.5,0.5);
    this.comboCover = this.add.sprite(GRID * 6.75, GRID * 0,'comboCover')
        .setOrigin(0.0,0.0).setDepth(11);
    this.comboCover.setScrollFactor(0);
    this.comboBG = this.add.sprite(GRID * 6.75, 0,'comboBG').setDepth(10).setOrigin(0.0,0.0);
    //this.comboBG.preFX.addBloom(0xffffff, 1, 1, 1.2, 1.2);

    

    this.UI_ScorePanel = this.add.sprite(X_OFFSET + GRID * 23.5,0, 'UI_ScorePanel').setOrigin(0,0).setDepth(51);

    //waveshader
    //this.game.renderer.pipelines.add('waveShader', new WaveShaderPipeline(this.game));;       
    this.wavePipeline = game.renderer.pipelines.get('WaveShaderPipeline');
    
    // # Backgrounds

    // for changing bg sprites
    this.bgTimer = 0;
    this.bgTick = 0;

    // Furthest BG Object
    this.bgFurthest = this.add.tileSprite(X_OFFSET, 36, 348, 324,'megaAtlas', 'background02_4.png').setDepth(-4).setOrigin(0,0); 
    //this.bgFurthest.tileScaleX = 2;
    //this.bgFurthest.tileScaleY = 2;

    
    // Scrolling BG1
    this.bgBack = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02.png').setDepth(-3).setOrigin(0,0);
    //this.bgBack.tileScaleX = 2;
    //this.bgBack.tileScaleY = 2;
    
    
    // Scrolling bgFront Planets
    this.bgFront = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02_2.png').setDepth(-1).setOrigin(0,0);
    
    // Scrolling bgScrollMid Stars (depth is behind planets)
    this.bgMid = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02_3.png').setDepth(-2).setOrigin(0,0);
    //this.bgMid.tileScaleX = 2;
    //this.bgMid.tileScaleY = 2;

    // Hue Shift

    this.fx = this.bgBack.preFX.addColorMatrix();
    this.fx2 = this.bgFurthest.postFX.addColorMatrix();

    //this.fx2.hue(90)
    this.bgFurthest.setPipeline('WaveShaderPipeline');
    //this.fx2 = this.bgFurthest.preFX.addColorMatrix();

    this.scrollFactorX = 0;
    this.scrollFactorY = 0;
    this.bgCoords = new Phaser.Math.Vector2(0,0);

    const graphics = this.add.graphics();
        
    /*this.starterTween = this.tweens.addCounter({ @holden do we still need this?
        from: 0,
        to: 600,
        ease: 'Sine.InOut',
        duration: 1000,
        onUpdate: tween =>
            {   
                graphics.clear();
                var value = (tween.getValue());
                this.shape1 = this.make.graphics().fillCircle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * .5, value);
                var geomask1 = this.shape1.createGeometryMask();
                
                this.bgBack.setMask(geomask1,true)
                this.bgFurthest.setMask(geomask1,true)
                this.bgFront.setMask(geomask1,true)
                this.bgMid.setMask(geomask1,true)
            }
    });*/
    
    
    
    // Is Zero if there is none.
    var rawZeds = localStorage.getItem(`zeds`);
    // Catch if any reason undefined gets saved to localstorage
    if (rawZeds === 'undefined') {
        rawZeds = 0;
    }
    
    this.zeds = Number(JSON.parse(rawZeds));
    var zedsObj = calcZedLevel(this.zeds);
    
    // This is an important step, don't leave it out.
    updateSumOfBest(this);

    const styleBottomText = {
        "font-size": '12px',
        "font-weight": 400,
        "text-align": 'right',
    }   

    
    this.zedsUI = this.add.dom(2, SCREEN_HEIGHT - 2, 'div', Object.assign({}, STYLE_DEFAULT, 
        styleBottomText
        )).setHTML(
            `<span style ="color: limegreen;
            font-size: 14px;
            border: limegreen solid 1px;
            border-radius: 5px;
            padding: 1px 4px;">L${zedsObj.level}</span> ZEDS : <span style ="color:${COLOR_BONUS}">${commaInt(zedsObj.zedsToNext)} to Next Level.</span>`
    ).setOrigin(0, 1).setScale(.5);


    this.gameVersionUI = this.add.dom(SCREEN_WIDTH, SCREEN_HEIGHT, 'div', Object.assign({}, STYLE_DEFAULT, {
        'font-size': '12px',
        'letter-spacing': '2px',
        'text-align': 'right',
        })).setText(
            `portalsnake.${GAME_VERSION}`
    ).setOrigin(1,1).setScale(.5);

    this.scene.moveBelow("StartScene", "PersistScene");

    this.graphics = this.add.graphics();
    }
    loseCoin(){ // 
        this.coinsUICopy = this.physics.add.sprite(X_OFFSET + GRID * 20 + 5, 2,'megaAtlas', 'coinPickup01Anim.png'
        ).play('coin01idle').setDepth(101).setOrigin(0,0).setScale(1);
        this.coinsUICopy.setVelocity(Phaser.Math.Between(-20, 100), Phaser.Math.Between(-100, -200));
        this.coinsUICopy.setGravity(0,400)
        //TODO add coin flip here
        //TODO trigger UI coin loader animation here
    }
    closingTween(){
        this.tweens.addCounter({
            from: 600,
            to: 0,
            ease: 'Sine.InOut',
            duration: 1000,
            onUpdate: tween =>
                {   
                    this.graphics.clear();
                    var value = (tween.getValue());
                    this.shape1 = this.make.graphics().fillCircle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * .5, value);
                    var geomask1 = this.shape1.createGeometryMask();
                    
                    this.bgBack.setMask(geomask1,true)
                    this.bgFurthest.setMask(geomask1,true)
                    this.bgFront.setMask(geomask1,true)
                    this.bgMid.setMask(geomask1,true)
                }
        });
    }

    
    update(time, delta) {

        //this.wavePipeline.setUniform('uTime', time / 1000);
        this.wavePipeline.set1f('uTime', time / 1000);
        this.renderer.gl.uniform1f(this.wavePipeline.uTimeLocation, time / 1000);


        this.bgFurthest.tilePositionX = (Phaser.Math.Linear(this.bgBack.tilePositionX, 
            (this.bgCoords.x + this.scrollFactorX), 0.025)) * 0.25;
        this.bgFurthest.tilePositionY = (Phaser.Math.Linear(this.bgBack.tilePositionY, 
            (this.bgCoords.y + this.scrollFactorY), 0.025)) * 0.25;

        this.bgBack.tilePositionX = (this.bgFurthest.tilePositionX ) * 4;
        this.bgBack.tilePositionY = (this.bgFurthest.tilePositionY ) * 4;
            
        this.bgFront.tilePositionX = (this.bgFurthest.tilePositionX ) * 8;
        this.bgFront.tilePositionY = (this.bgFurthest.tilePositionY ) * 8;

        this.bgMid.tilePositionX = (this.bgFurthest.tilePositionX ) * 2;
        this.bgMid.tilePositionY = (this.bgFurthest.tilePositionY ) * 2;

        this.bgTimer += delta;

        if(this.bgTimer >= 1000){ // TODO: not set this every Frame.
            if (this.bgTick === 0) {
                this.bgMid.setTexture('megaAtlas', 'background02_3_2.png'); 
                this.bgBack.setTexture('megaAtlas', 'background02_frame2.png'); 
                this.bgTick += 1;
            }

            if (this.bgTimer >= 2000) {
                if (this.bgTick === 1) {
                    this.bgMid.setTexture('megaAtlas', 'background02_3.png');
                    this.bgBack.setTexture('megaAtlas','background02.png'); 
                    this.bgTimer = 0;
                    this.bgTick -=1;
                }

            }   
        }

        const pipeline = this.bgBack.pipeline;
        if (pipeline && pipeline.setFloat1) {
            pipeline.setFloat1('uTime', this.time.now / 1000);
        }
    }

}

class GameScene extends Phaser.Scene {
    // #region GameScene

    constructor () {
        super({key: 'GameScene', active: false});
    }
    
    
    init(props) {
        
        // #region Init Vals

        // Game State Bools
        this.tutorialState = false;

        // Arrays for collision detection
        this.atoms = new Set();
        this.foodHistory = [];
        this.walls = [];
        this.portals = [];
        this.wallPortals = [];
        this.dreamWalls = [];
        this.nextStagePortals = [];
        this.extractHole = [];

        this.snakeLights = [];

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
        this.portalParticles = [];
        this.snakePortalingSprites = [];

        this.stageOver = false; // deprecated to be removed

        this.winned = false; // marked as true any time this.winCondition is met.
        this.canContinue = true; // used to check for a true game over

        const { stage = START_STAGE } = props 
        this.stage = stage;

        this.moveInterval = SPEED_WALK;
        this.boostCost = 6;
        this.speedWalk = SPEED_WALK;
        this.speedSprint = SPEED_SPRINT;

        // Flag used to keep player from accidentally reseting the stage by holding space into a bonk
        this.pressedSpaceDuringWait = false; 

        // Special flags
        this.ghosting = false;
        this.bonkable = true; // No longer bonks when you hit yourself or a wall
        this.stepMode = false; // Stops auto moving, only pressing moves.
        this.extractMenuOn = false; // set to true to enable extract menu functionality.
        this.spawnCoins = true;
        
        this.lightMasks = [];
        this.hasGhostTiles = false;
        this.wallVarient = ''; // Used for Fungible wall setups.
        this.varientIndex = 0;

        // from  the  UI
        //this.score = 0;
        var { score = 0 } = props;
        this.score = Math.trunc(score); //Math.trunc removes decimal. cleaner text but potentially not accurate for score -Holden
        this.stageStartScore = Math.trunc(score);

        this.length = 0;
        this.lengthGoal = LENGTH_GOAL;
        this.maxScore = MAX_SCORE;

        this.scoreMulti = 0;
        this.globalFruitCount = 0;
        this.bonks = 0;
        this.medals = {};
        this.zedLevel = 0;

        var {startupAnim = true } = props;
        this.startupAnim = startupAnim
        var {camDirection = new Phaser.Math.Vector2(0,0)} = props
        this.camDirection = camDirection
        this.scoreHistory = [];

        // BOOST METER
        this.boostEnergy = 600; // Value from 0-1000 which directly dictates ability to boost and the boost mask target.
        this.comboCounter = 0;


        this.coinSpawnCounter = 100;

          
    }
    
    
    preload () {
        const ourTutorialScene = this.scene.get('TutorialScene');
        if (!ourTutorialScene.hasPlayedBefore && this.stage === 'World_1-1') {
            
            this.stage = 'Tutorial_1';
            console.log('Tutorial Time!', this.stage);
            //this.tutorialState = true;
        }
        this.load.tilemapTiledJSON(this.stage, `assets/Tiled/${this.stage}.json`);

        //const ourGame = this.scene.get("GameScene");
        // would need to be custom for snake skins.
        //this.load.image('snakeDefaultNormal', 'assets/sprites/snakeSheetDefault_n.png');

    }

    create () {
        if (STAGE_OVERRIDES.has(this.stage)) {
            console.log("Running preFix Override on", this.stage);
            STAGE_OVERRIDES.get(this.stage).preFix(this);
        }

        const ourInputScene = this.scene.get('InputScene');
        const ourGameScene = this.scene.get('GameScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourPersist = this.scene.get('PersistScene');
        const ourSpaceBoyScene = this.scene.get("SpaceBoyScene");

        this.scene.moveBelow("SpaceBoyScene", "GameScene");



        ourPersist.comboCover.setVisible(false);


        if (this.stage == 'Tutorial_3') { // TODO @holden Move to customLevels.js
            this.time.delayedCall(5000, () => {
                this.tutorialPrompt(SCREEN_WIDTH - X_OFFSET - this.helpPanel.width/2 - GRID,
                    Y_OFFSET + this.helpPanel.height/2 + GRID,3,)
            })
        }


        
        this.snakeCritical = false;   /// Note; @holden this should move to the init scene?

        this.graphics = this.add.graphics();


        this.cameras.main.scrollX = -this.camDirection.y * 10
        this.cameras.main.scrollY = -this.camDirection.x * 10
        
        //ourPersist.bgCoords.x += this.camDirection.y/4;
        //ourPersist.bgCoords.y += this.camDirection.x/4;
        
        var cameraOpeningTween = this.tweens.add({
            targets: this.cameras.main,
            scrollX: 0,
            scrollY: 0,
            duration: 1000,
            ease: 'Sine.Out',
        });
        
        //test portal walls  @holden do we still need this?
        if (this.stage == 'testingFuturistic_x' ) {
            var portalWall = this.add.sprite(X_OFFSET + GRID * 9, GRID * 9).setOrigin(0,0);
            var portalWallL = this.add.sprite(X_OFFSET + GRID * 8, GRID * 9).setOrigin(0,0);
            var portalWallR = this.add.sprite(X_OFFSET + GRID * 10, GRID * 9).setOrigin(0,0);
            portalWall.play('pWallFlatMiddle')
            portalWallL.play('pWallFlatLeft')
            portalWallR.play('pWallFlatRight')
            portalWall.setTint(0xFF0000)
            portalWallL.setTint(0xFF0000)
            portalWallR.setTint(0xFF0000)
            var portalWall2 = this.add.sprite(X_OFFSET + GRID * 19, GRID * 23).setOrigin(0,0);
            var portalWallL2 = this.add.sprite(X_OFFSET + GRID * 18, GRID * 23).setOrigin(0,0);
            var portalWallR2 = this.add.sprite(X_OFFSET + GRID * 20, GRID * 23).setOrigin(0,0);
            //this.wallLight = this.lights.addLight(X_OFFSET + GRID * 19, GRID * 23, 66, 'lightColor').setIntensity(1.5);

            portalWall2.play('pWallFlatMiddle')
            portalWallL2.play('pWallFlatLeft')
            portalWallR2.play('pWallFlatRight')
            portalWall2.setTint(0xFF0000)
            portalWallL2.setTint(0xFF0000)
            portalWallR2.setTint(0xFF0000)
            this.lights.addLight(X_OFFSET + GRID * 19, GRID * 23, 128,  0xFF0000).setIntensity(2).setOrigin(0,0);
            this.lights.addLight(X_OFFSET + GRID * 9, GRID * 9, 128,  0xFF0000).setIntensity(2).setOrigin(0,0);
            var portalWallL3 = this.add.sprite(X_OFFSET + GRID * 12, GRID * 4).setOrigin(0,0);
            var portalWallR3 = this.add.sprite(X_OFFSET + GRID * 13, GRID * 4).setOrigin(0,0);
            portalWallL3.play('pWallFlatLeft')
            portalWallR3.play('pWallFlatRight')
            portalWallR3.setTint(0x9900FF)
            portalWallL3.setTint(0x9900FF)
            var portalWallL4 = this.add.sprite(X_OFFSET + GRID * 15, GRID * 28).setOrigin(0,0);
            var portalWallR4 = this.add.sprite(X_OFFSET + GRID * 16, GRID * 28).setOrigin(0,0);
            portalWallL4.play('pWallFlatLeft')
            portalWallR4.play('pWallFlatRight')
            portalWallL4.setTint(0x9900FF)
            portalWallR4.setTint(0x9900FF)
            this.lights.addLight(X_OFFSET + GRID * 16, GRID * 28, 128,  0x9900FF).setIntensity(2).setOrigin(0,0);
            this.lights.addLight(X_OFFSET + GRID * 12, GRID * 4, 128,  0x9900FF).setIntensity(2).setOrigin(0,0);
        }

        if (this.stage === "testingFuturistic") {
            ourPersist.fx.hue(330);
        }
        if (this.stage === "testingRacetrack") {
            ourPersist.fx.hue(300);
        }
        else{
            ourPersist.fx.hue(0)
        }

        /*if (this.startupAnim) { // @holden should we save this?
            var tween = this.tweens.addCounter({
                from: 0,
                to: 600,
                ease: 'Sine.InOut',
                duration: 1000,
                onUpdate: tween =>
                    {   
                        this.graphics.clear();
                        var value = (tween.getValue());
                        this.tweenValue = value
                        this.shape1 = this.make.graphics().fillCircle(this.snake.head.x + GRID * .5, this.snake.head.y + GRID * .5, value);
                        var geomask1 = this.shape1.createGeometryMask();
                        
                        this.cameras.main.setMask(geomask1,true)
                    }
            });
            tween.on('complete', ()=>{ //need this or else visual bugs occur
                this.cameras.main.setMask(false)
            });
        }*/
        //this.cameras.main.setAlpha(1)

        
        
        //loadAnimations(this);
        //this.load.spritesheet('portals', 'assets/sprites/portalAnim.png', { frameWidth: 64, frameHeight: 64 });


       


        // SOUND

        this.coinSound = this.sound.add('coinCollect');

        var _chargeUp = this.sound.add('chargeUp');
        this.pop03 = this.sound.add('pop03')
        this.chime01 = this.sound.add('chime01')

        //_chargeUp.play();

        this.spaceKey = this.input.keyboard.addKey("Space");
        console.log("FIRST INIT", this.stage );
          

        // Placeholder Solution; dark grey sprite behind UI components used to mask the lights created from the normal maps
        this.UIbackground = this.add.sprite(-GRID * 5.15625 , -GRID * 4.65, 'megaAtlas', 'UI_background.png'
            
        ).setDepth(40).setOrigin(0,0);
        this.UIbackground.setScale(32); 
        this.UIbackground.setVisible(false);

        // #region TileMap

        // Tilemap
        this.map = this.make.tilemap({ key: this.stage, tileWidth: GRID, tileHeight: GRID });
        this.mapShadow = this.make.tilemap({ key: this.stage, tileWidth: GRID, tileHeight: GRID });

        this.interactLayer = [];

        for (let x = 0; x < this.map.width; x++) {
            this.interactLayer[x] = [];
            for (let y = 0; y < this.map.height; y++) {
                this.interactLayer[x][y] = "empty";
            }
        }


        var spawnTile = this.map.findByIndex(9); // Snake Head Index
        this.startCoords = { x: spawnTile.pixelX + X_OFFSET, y: spawnTile.pixelY + Y_OFFSET};
        this.scene.get("InputScene").moveHistory.push(["START", spawnTile.x, spawnTile.y]);

        spawnTile.index = -1; // Set to empty tile
        this.snake = new Snake(this, this.startCoords.x, this.startCoords.y);
        this.snake.direction = DIRS.STOP;

        var startingBlackhole = this.add.sprite(this.snake.head.x + GRID * 0.5,this.snake.head.y + GRID * 0.5);
        startingBlackhole.play('blackholeForm');
        if (startingBlackhole.anims.getName() === 'blackholeForm')
            {
                startingBlackhole.playAfterRepeat('blackholeIdle');
            }
        
        this.tweens.add({
            targets: this.snake.head,
            alpha: 1,
            ease: 'Sine.easeOutIn',
            duration: 300,
            delay: 125
        });
        this.time.delayedCall(1500, event => {
            startingBlackhole.play('blackholeClose');
        });

       

       
        //this.shadowFX = this.snake.head.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1);

        // #region Next Layer
        this.nextStagePortalLayer = this.map.createLayer('Next', [this.tileset], X_OFFSET, Y_OFFSET);
        this.nextStagePortalLayer.visible = false;

        this.tiledProperties = new Map();

        this.map.properties.forEach(prop => {
            this.tiledProperties.set(prop.name, prop.value);
        });


        // Loading all Next Stage name to slug to grab from the cache later.

        // The first split and join santizes any spaces.
        this.nextStages = this.tiledProperties.get("next").split(" ").join("").split(",");
        


        // Should add a verifyer that makes sure each stage has the correctly formated json data for the stage properties.
        this.stageUUID = this.tiledProperties.get("UUID"); // Loads the UUID from the json file directly.
        this.stageDiffBonus = this.tiledProperties.get("diffBonus") ?? 100; // TODO: Get them by name and throw errors.
        this.atomToSpawn = this.tiledProperties.get("atoms") ?? 5;
        
        ourPersist.gameVersionUI.setText(`${this.stage}\n portalsnake.${GAME_VERSION}`);
        // Write helper function that checks all maps have the correct values. With a toggle to disable for the Live version.

        this.tileset = this.map.addTilesetImage('tileSheetx12');

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


        if (this.map.getLayer('Ground')) {
            this.groundLayer = this.map.createLayer("Ground", [this.tileset], X_OFFSET, Y_OFFSET)
            this.groundLayer.setPipeline('Light2D')
            //this.groundLayer.setTint(0xaba2d8)
        }

        this.wallLayerShadow = this.mapShadow.createLayer(this.wallVarient, [this.tileset], X_OFFSET, Y_OFFSET)
        this.wallLayer = this.map.createLayer(this.wallVarient, [this.tileset], X_OFFSET, Y_OFFSET)
        
        this.wallLayer.forEachTile(tile => {
            if (tile.index === NO_FOOD_TILE) { // No Food Spawn Tile
                tile.alpha = 0; // Set the alpha to 0 to make the tile invisible
            }
        });
        
        //var renderIndex = 9  @holden still need this?
        //this.noRenderTiles = [8,9,10,11];
        /*for (let index = 0; index < 256; index++) {
            //renderIndex = noRenderTiles[index];
            var noRenderTile = this.wallLayerShadow.findByIndex(renderIndex)
            noRenderTile.index = -1
            //noRenderTiles.push(noRenderTile)
        }*/

        //var noRenderTile = this.wallLayerShadow.findByIndex(9)
        //noRenderTile.index = -1
        
        this.wallLayerShadow.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);
        this.wallLayer.setPipeline('Light2D'); //setPostPipeline to get it to work with postFX.addshadow


        if (this.map.getLayer('Ghost-1')) {
            this.hasGhostTiles = true;
            this.ghostWallLayer = this.map.createLayer('Ghost-1', [this.tileset], X_OFFSET, Y_OFFSET).setTint(0xff00ff).setPipeline('Light2D');
            this.ghostWallLayer.setDepth(26);
        }
       

        if (this.map.getLayer('Food')) {
            this.foodLayer = this.map.createLayer('Food', [this.tileset], X_OFFSET, Y_OFFSET);
            this.foodLayer.visible = false;

            this.foodLayer.forEachTile(_tile => {

                switch (_tile.index) {
                    case 11:
                        var food = new Food(this, {
                            x: _tile.x*GRID + X_OFFSET, 
                            y:_tile.y*GRID + Y_OFFSET
                        });
                        break;
                    case NO_FOOD_TILE:
                        this.interactLayer[_tile.x][_tile.y] = _tile.index;
                
                    default:
                        break;
                }
            })
            this.foodLayer.destroy();
        }


        // end on the wall map
        this.map.getLayer(this.wallVarient);
    
        var noRenderTiles = [9,10,11,12,
            257,258,258,259,260,261,262,263,264,
            289,290,291,292,293,294,295,296,
            481,
            673,674,675,676,677,678,679,680,
            704,705,706,707,708,709,710,711,712] //need to populate with full list and move elsewhere;
        //var noRenderTilesList = [];
        
        for (let i = 0; i < noRenderTiles.length; i++) {
            this.mapShadow.forEachTile(tile =>{
                if (tile.index == noRenderTiles[i]) {
                    tile.index = -1;
                }
            })
            
        }
        //this.wallLayerShadow.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);
        //this.wallLayer.setPipeline('Light2D'); //setPostPipeline to get it to work with postFX.addshadow



        let _x = this.snake.head.x;
        let _y = this.snake.head.y;
        

        if (!this.map.hasTileAtWorldXY(_x, _y -1 * GRID)) {
            this.startingArrowsAnimN = this.add.sprite(_x + GRID/2, _y - GRID).setDepth(52).setOrigin(0.5,0.5);
            this.startingArrowsAnimN.play('startArrowIdle').setAlpha(0);
        }
        if (!this.map.hasTileAtWorldXY(_x, _y +1 * GRID)) {
            this.startingArrowsAnimS = this.add.sprite(_x + GRID/2, _y + GRID * 2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimS.flipY = true;
            this.startingArrowsAnimS.play('startArrowIdle').setAlpha(0);
        }
        if (!this.map.hasTileAtWorldXY(_x + 1 * GRID, _y)) {
            this.startingArrowsAnimE = this.add.sprite(_x + GRID * 2, _y + GRID /2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimE.angle = 90;
            this.startingArrowsAnimE.play('startArrowIdle').setAlpha(0);
        }
        if (!this.map.hasTileAtWorldXY(_x + 1 * GRID, _y)) {
            this.startingArrowsAnimW = this.add.sprite(_x - GRID, _y + GRID/2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimW.angle = 270;
            this.startingArrowsAnimW.play('startArrowIdle').setAlpha(0);
        }



        //var openingGoalText = this.add.text(-SCREEN_WIDTH, GRID * 10, 'GOAL: Collect 28 Atoms',{ font: '24px Oxanium'}).setOrigin(0.5,0);
        
        this.openingGoalText = this.add.dom(-SCREEN_WIDTH, GRID * 9, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)
        ).setText('GOAL : Collect 28 Atoms').setOrigin(0.5,0).setAlpha(0);

        this.stageText = this.add.dom(-SCREEN_WIDTH, GRID * 7.5, 'div', Object.assign({},STYLE_DEFAULT,{
            'color': '#272727',
            'font-size': '12px',
            'font-weight': '400',
            'padding': '0px 0px 0px 12px'
        })
        ).setText(`${this.stage}`).setOrigin(0,0).setAlpha(0);

        this.r2 = this.add.rectangle(this.stageText.x, this.stageText.y, this.stageText.width - 8, 16, 0xffffff
        ).setDepth(101).setOrigin(0,0).setAlpha(0);
        
        
        this.openingGoalPanel = this.add.nineslice(-SCREEN_WIDTH, GRID * 8.25, 
            'uiPanelL', 'Glass', 
            GRID * 18, GRID * 3, 
            8, 8, 8, 8);
        this.openingGoalPanel.setDepth(100).setOrigin(0.475,0).setAlpha(0);
        this.tweens.add({
            targets: [this.openingGoalText, this.openingGoalPanel],
            x: SCREEN_WIDTH/2,
            ease: 'Sine.easeOutIn',
            duration: 300,
            delay: 500,
            alpha: {from: 0, to: 1}
        });
        this.tweens.add({
            targets: this.stageText,
            x: X_OFFSET + GRID * 6,
            ease: 'Sine.easeOutIn',
            duration: 300,
            delay: 500,
            alpha: {from: 0, to: 1}
        });
        this.tweens.add({
            targets: this.r2,
            x: X_OFFSET + GRID * 6.75,
            ease: 'Sine.easeOutIn',
            duration: 300,
            delay: 500,
            alpha: {from: 0, to: 1}
        });
        

        this.tweens.add({
            targets: [this.openingGoalText, this.openingGoalPanel,this.stageText,this.r2],
            alpha: 0,
            ease: 'linear',
            duration: 500,
            delay: 5000,
        });
        
        this.time.delayedCall(3000, event => {
            if (this.gState != GState.PLAY && !this.winned) {
                ourGameScene.arrowTween =  this.tweens.add({
                    targets: [this.startingArrowsAnimN,this.startingArrowsAnimS,
                        this.startingArrowsAnimE,this.startingArrowsAnimW],
                    alpha: 1,
                    duration: 500,
                    ease: 'linear',
                    });
            }
        });

        // Extract Prompt Objects

        this.extractPromptText = this.add.dom(SCREEN_WIDTH / 2, SCREEN_HEIGHT/2 - GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '20px',
            "fontWeight": 400,
            "color": "white",
        }),
            `${'Where would you like to extract?'.toUpperCase()}`
        ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(0);

        //nineSlice
        this.extractPanel = this.add.nineslice(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - GRID * 1.5, 
            'uiPanelL', 'Glass', 
            GRID * 18.5, GRID * 8, 
            8, 8, 8, 8);
        this.extractPanel.setDepth(60).setOrigin(0.5,0.5).setScrollFactor(0).setAlpha(0);

        this.exMenuOptions = {
            'MAIN MENU': function () {
                // hide the extract prompt
                ourGameScene._menuElements.forEach(textElement =>{
                    textElement.setAlpha(0);
                });
                ourGameScene.extractPromptText.setAlpha(0);
                ourGameScene.extractPanel.setAlpha(0);
                console.log("YES");
                ourGameScene.extractMenuOn = false;
                ourGameScene.finalScore("MainMenuScene", {});
                return true;
            },
            'CANCEL': function () {  
                // stop vortex tween if it's playing
                if (ourGameScene.vortexTween.isPlaying()) {
                    ourGameScene.vortexTween.stop()
                }
                // reset snake body segments so it can move immediately
                ourGameScene.snake.body.forEach(segment => {
                    segment.x = ourGameScene.snake.head.x;
                    segment.y = ourGameScene.snake.head.y;
                });
                // hide the extract prompt
                ourGameScene._menuElements.forEach(textElement =>{
                    textElement.setAlpha(0);
                });
                ourGameScene.extractPromptText.setAlpha(0);
                ourGameScene.extractPanel.setAlpha(0);
                // show the level labels again
                ourGameScene.tweens.add({
                    targets: [...ourGameScene.blackholeLabels, ourGameScene.r3,ourGameScene.extractText],
                    yoyo: false,
                    duration: 500,
                    ease: 'Linear',
                    repeat: 0,
                    alpha: 1,
                });
                ourGameScene.tempStartingArrows();
                ourGameScene.gState = GState.WAIT_FOR_INPUT;
                ourGameScene.snake.direction = DIRS.STOP; 
                ourGameScene.extractMenuOn = false;
                console.log("NO");
            },
            'DIRECT TO ADVENTURE (WORLD 1-1)': function () {
                // TODO: send to origin
                ourGameScene._menuElements.forEach(textElement =>{
                    textElement.setAlpha(0);
                });
                ourGameScene.extractPromptText.setAlpha(0);
                ourGameScene.extractPanel.setAlpha(0);
                console.log("LOOP");
                ourGameScene.extractMenuOn = false;

                // Clear for reseting game   
                ourGameScene.finalScore("GameScene", {
                    stage: START_STAGE,
                    score: 0,
                    startupAnim: true,
                });
                return true;
            },
        }

        this.exMenuList = Object.keys(this.exMenuOptions);
        this.exCursorIndex = 1;
        var _textStart = 152;
        var _spacing = 20;
        this._menuElements = [];
        
        if (this._menuElements.length < 1) {
            for (let index = 0; index < this.exMenuList.length; index++) {   
                if (index == 1) {
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '20px',
                        "fontWeight": 400,
                        "color": "white",
                    }),
                        `${this.exMenuList[index].toUpperCase()}`
                    ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(0);
                }
                else{
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '20px',
                        "fontWeight": 400,
                        "color": "darkgrey",
                    }),
                            `${this.exMenuList[index].toUpperCase()}`
                    ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(0);
                }
    
                this._menuElements.push(textElement);
                
            } 
        }

        
        // TODO Move out of here
        // Reserves two rows in the tilesheet for making portal areas.
        const PORTAL_TILE_START = 256; // FYI: TILEs in phaser are 1 indexed, but in TILED are 0 indexed.
        const PORTAL_WALL_START = 672;
        const ROW_DELTA = 32;

        
        
        var basePortalSpawnPools = {};
        var wallPortalData = {};

        
        
        this.map.getLayer(this.wallVarient);
        this.map.forEachTile( tile => {

            // Make Portal Walls

            if ((tile.index > PORTAL_WALL_START && tile.index < PORTAL_WALL_START + 9) ||
                (tile.index > PORTAL_WALL_START + ROW_DELTA && tile.index < PORTAL_WALL_START + ROW_DELTA + 9)
            ) {
                if (wallPortalData[tile.index]) {
                    
                    wallPortalData[tile.index].push([tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]);
                }
                else {
                    wallPortalData[tile.index] = [[tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]];
                }
                tile.index = -1;
            }



            // Make Portal Spawning List based on the wall layer
            if ((tile.index > PORTAL_TILE_START && tile.index < PORTAL_TILE_START + 9) ||
                (tile.index > PORTAL_TILE_START + ROW_DELTA && tile.index < PORTAL_TILE_START + ROW_DELTA + 9)
            ) {

                if (basePortalSpawnPools[tile.index]) {
                    
                    basePortalSpawnPools[tile.index].push([tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]);
                }
                else {
                    basePortalSpawnPools[tile.index] = [[tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]];
                }
                tile.index = -1;
                
            }
            

            

            // Draw Dream walls from Tiled Layer
            switch (tile.index) {
                // Remember all of these are +1 then in Tiled because in phaser tiles are 1 index and in Tiled tiles are 0 index.
                case 550:
                    var wallShimmerTop = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET).setDepth(50).setOrigin(0,0);
                    wallShimmerTop.play('wrapBlock02');
                    this.dreamWalls.push(wallShimmerTop);
                    tile.index = -1;
                    break;

                case 614:
                    var wallShimmerBottom = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET).setDepth(50).setOrigin(0,0);
                    wallShimmerBottom.play('wrapBlock07');
                    this.dreamWalls.push(wallShimmerBottom);
                    tile.index = -1;
                    break;

                case 581:
                    var wallShimmerLeft = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET).setDepth(50).setOrigin(0,0);
                    wallShimmerLeft.play('wrapBlock04');
                    this.dreamWalls.push(wallShimmerLeft);
                    tile.index = -1;
                    break;

                case 583:
                    var wallShimmerRight = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET).setDepth(50).setOrigin(0,0);
                    wallShimmerRight.play('wrapBlock05');
                    this.dreamWalls.push(wallShimmerRight);
                    tile.index = -1;
                    break;

                case 549:
                    var wrapBlock01 = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET
                    ).play("wrapBlock01").setOrigin(0,0).setDepth(-10);

                    this.dreamWalls.push(wrapBlock01);
                    tile.index = -1;
                    break;

                case 551:
                    var wrapBlock03 = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET
                    ).play("wrapBlock03").setOrigin(0,0).setDepth(-10);

                    this.dreamWalls.push(wrapBlock03);
                    tile.index = -1;
                    break;
                
                case 613:
                    var wrapBlock06 = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET
                    ).play("wrapBlock06").setOrigin(0,0).setDepth(-10);

                    this.dreamWalls.push(wrapBlock06);
                    tile.index = -1;
                    break;

                case 615:
                    var wrapBlock08 = this.add.sprite(tile.pixelX + X_OFFSET , tile.pixelY + Y_OFFSET
                    ).play("wrapBlock08").setOrigin(0,0).setDepth(-10);

                    this.dreamWalls.push(wrapBlock08);
                    tile.index = -1;
                    break;
            
                default:
                    break;
            }
        });

        this.CapSpark = ourSpaceBoyScene.add.sprite(X_OFFSET + GRID * 9, GRID * 1.5).play(`CapSpark${Phaser.Math.Between(0,9)}`).setOrigin(.5,.5)
        .setDepth(100).setVisible(false);
        
        this.CapSpark.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
            this.setVisible(false)
        })

        this.lightMasksContainer = this.make.container(0, 0);
         
            this.lights.enable();
            if (!this.tiledProperties.has("dark")) { // this checks for false so that an ambient color is NOT created when DARK_MODE is applied
                this.lights.setAmbientColor(0xE4E4E4);
            }
        
        
        // Audio
        this.snakeCrash = this.sound.add('snakeCrash'); // Move somewhere
        //this.capSparkSFX = this.sound.add('capSpark');
        

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
                //this.panelTweenCollapse.resume();
                
                this.tweens.add({//SHOULD BE MOVED to not be added every input
                    targets: [this.openingGoalText, this.openingGoalPanel,this.stageText,this.r2],
                    x: + SCREEN_WIDTH * 2,
                    ease: 'Sine.easeOutIn',
                    duration: 300,
                    delay: 125,
                    alpha: 0,
                });
                
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

                
 
                if (this.currentScoreTimer() === this.maxScore) {
                    /**
                     * This code is duplicated here to make sure that the electron 
                     * animation is played as soon as you move from the start and wait state.
                     * Removes varience with slower machines.  It is after the move state to 
                     * have the input be more responsive.  - James
                     */
                    this.atoms.forEach( atom => {
                        atom.electrons.visible = true;
                    });
                }
            }
            

            if (gState === GState.PORTAL && this.snake.lastPortal.freeDir === true) {
                // Update snake facing direction but do not move the snake
                //console.log("Moving Freely");
                ourInputScene.updateDirection(this, e);  
            }

            if (gState === GState.WAIT_FOR_INPUT) {
                // For GState Bonk and  SceneTransition hold move inputs
                this.pressedSpaceDuringWait = true;
            }


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
            if (ourGameScene.extractMenuOn) {
                ourGameScene.exMenuOptions[ourGameScene.exMenuList[ourGameScene.exCursorIndex]].call();
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
                        ease: 'linear',
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

        this.input.keyboard.on('keydown-DOWN', function() {
            if (ourGameScene.extractMenuOn) {
                ourGameScene.exCursorIndex = Phaser.Math.Wrap(ourGameScene.exCursorIndex + 1, 0, ourGameScene._menuElements.length);
                this._selected = ourGameScene._menuElements[ourGameScene.exCursorIndex];
    
                // Reset all menu elements to dark grey
                ourGameScene._menuElements.forEach((element, index) => {
                    element.node.style.color = "darkgrey";
                });
                // Set the selected element to white
                this._selected = ourGameScene._menuElements[ourGameScene.exCursorIndex];
                this._selected.node.style.color = "white";
            }

        });

        this.input.keyboard.on('keydown-UP', function() {
            if (ourGameScene.extractMenuOn) {
                ourGameScene.exCursorIndex = Phaser.Math.Wrap(ourGameScene.exCursorIndex - 1, 0, ourGameScene._menuElements.length);
                this._selected = ourGameScene._menuElements[ourGameScene.exCursorIndex];
                //console.log(_selected.node)
    
                // Reset all menu elements to dark grey
                ourGameScene._menuElements.forEach((element, index) => {
                    element.node.style.color = "darkgrey";
                });
                // Set the selected element to white
                this._selected = ourGameScene._menuElements[ourGameScene.exCursorIndex];
                this._selected.node.style.color = "white";
            }

        });

        this.input.keyboard.on('keydown-TAB', function() {
            this.scene.launch("QuickMenuScene", {
                menuOptions: QUICK_MENUS.get("tab-menu"), 
                textPrompt: "Quick Menu",
                fromScene: this,
                cursorIndex: 1
            });
        }, this);

        
        this.blackholes = [];
        this.blackholeLabels = [];
        this.blackholesContainer = this.make.container(0, 0);

        this.events.on('spawnBlackholes', function (thingWePass) {
            console.log('SPAWNING BLACKHOLES')
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            

            // #region is unlocked?

            if (this.winned) {
                updateSumOfBest(ourPersist);


                
                
                
                
                const BLACK_HOLE_START_TILE_INDEX = 641;
                const EXTRACT_BLACK_HOLE_INDEX = 616;

                // #region Layer: Next
                if (this.map.getLayer('Next')) {
                    this.nextStagePortalLayer.visible = true;
                    
                    var blackholeTileIndex = 641; // Starting First column in the row.
                    this.extractLables = [];
                    var nextStagesCopy = this.nextStages.slice();
                    
                    //console.log('PORTAL LAYER',this.nextStagePortalLayer);

                    // Add one extract hole spawn here if it exists.
                    if (this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX)) {
                        var extractTile = this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX);
                        var extractImage = this.add.sprite(extractTile.pixelX + X_OFFSET, extractTile.pixelY + Y_OFFSET, 'extractHole.png' 
                        ).setDepth(10).setOrigin(0.4125,0.4125).play('extractHoleIdle');
                        extractTile.index = -1;

                        this.extractText = this.add.dom(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY + GRID * 2 + Y_OFFSET, 'div', Object.assign({}, STYLE_DEFAULT, {
                            "font-size": '8px',
                            "baselineX": 1.5,
                            })).setHTML(
                                'EXTRACT'
                        ).setDepth(50).setAlpha(0);
                        
                        this.r3 = this.add.rectangle(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY - 12 + GRID * 3 + Y_OFFSET, this.extractText.width + 8, 14, 0x1a1a1a  
                        ).setDepth(49).setAlpha(0);
                        //debugger
                        this.r3.postFX.addShine(1, .5, 5)
                        this.r3.setStrokeStyle(2, 0x4d9be6, 0.75);

                        this.extractHole.push(extractImage);
                        this.extractLables.push(this.extractText,this.r3);

                        this.tweens.add({
                            targets: [this.r3,this.extractText],
                            alpha: {from: 0, to: 1},
                            ease: 'Sine.easeOutIn',
                            duration: 50,
                            delay: this.tweens.stagger(150)
                        });
                        
                    }

                    for (let tileIndex = BLACK_HOLE_START_TILE_INDEX; tileIndex <= BLACK_HOLE_START_TILE_INDEX + 8; tileIndex++) {
                        
                        if (this.nextStagePortalLayer.findByIndex(tileIndex)) {
                            var tile = this.nextStagePortalLayer.findByIndex(tileIndex);

                            

                            var stageName = STAGES.get(nextStagesCopy.shift()); 
                            var dataName = `${stageName}.properties`;
                            var data = this.cache.json.get(dataName);
                        
                            data.forEach( propObj => {
                                
                                if (propObj.name === 'slug') {

                                    if (STAGE_UNLOCKS.get(propObj.value) != undefined) {
                                        tile.index = -1;
                                        // Only removes levels that have unlock slugs.
                                        // Easier to debug which levels don't have slugs formatted correctly.
                                    }

                                    
                                    // Easier to see when debugging with debugger in console.
                                    stageName;
                                    var temp = STAGE_UNLOCKS.get(propObj.value);
                                    var tempEval = STAGE_UNLOCKS.get(propObj.value).call(ourPersist);
                                    
                                   
                                    

                                    if (STAGE_UNLOCKS.get(propObj.value).call(ourPersist)) {
                                        // Now we know the Stage is unlocked, so make the black hole tile.
                                        
                                        //console.log("MAKING Black Hole TILE AT", tile.index, tile.pixelX + X_OFFSET, tile.pixelY + X_OFFSET , "For Stage", stageName);


                                        var stageText = this.add.dom(tile.pixelX + X_OFFSET + GRID * 0.5, tile.pixelY + GRID * 2 + Y_OFFSET, 'div', Object.assign({}, STYLE_DEFAULT, {
                                            "font-size": '8px',
                                            "baselineX": 1.5,
                                            })).setHTML(
                                                stageName
                                        ).setDepth(50).setAlpha(0);
                                        
                                        var r1 = this.add.rectangle(tile.pixelX + X_OFFSET + GRID * 0.5, tile.pixelY - 12 + GRID * 3 + Y_OFFSET, stageText.width + 8, 14, 0x1a1a1a  
                                        ).setDepth(49).setAlpha(0);

                                        r1.postFX.addShine(1, .5, 5)
                                        r1.setStrokeStyle(2, 0x4d9be6, 0.75);

                                        
                                        
                                        var blackholeImage = this.add.sprite(tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET, 'blackHoleAnim.png' 
                                        ).setDepth(10).setOrigin(0.4125,0.4125).play('blackholeForm');




                                        //extractImage.playAfterRepeat('extractHoleClose');
                                        
                                        
                                        //this.barrel = this.cameras.main.postFX.addBarrel([barrelAmount])
                                        //this.cameras.main.postFX.addBarrel(this,-0.5);
                                        //blackholeImage.postFX.addBarrel(this.cameras.main,[.5])
                                        /*this.blackholes.forEach(blackholeImage =>{
                                            this.cameras.main.postFX.addBarrel([.125]) 
                                        })*/
                                        
                                        this.blackholes.push(blackholeImage);
                                        
                                        
                                        this.blackholesContainer.add(this.blackholes);
                                    

                                        this.blackholeLabels.push(stageText,r1);
                                        if (blackholeImage.anims.getName() === 'blackholeForm')
                                            {
                                                blackholeImage.playAfterRepeat('blackholeIdle');
                                            }

                                        //line code doesn't work yet
                                        //this.graphics = this.add.graphics({ lineStyle: { width: 4, color: 0xaa00aa } });
                                        //this.line = new Phaser.Geom.Line(this,tile.x * GRID, tile.y * GRID, blackholeImage.x,blackholeImage.y, r1.x,r1.y[0x000000],1)
                                        
                                        if (BEST_OF_STAGE_DATA.get(stageName) != undefined) {
                                            switch (BEST_OF_STAGE_DATA.get(stageName).stageRank()) {
                                                case RANKS.WOOD:
                                                    blackholeImage.setTint(0xB87333);
                                                    break;
                                                case RANKS.BRONZE:
                                                    blackholeImage.setTint(0xCD7F32);
                                                    break;
                                                case RANKS.SILVER:
                                                    blackholeImage.setTint(0xC0C0C0);
                                                    break;
                                                case RANKS.GOLD:
                                                    blackholeImage.setTint(0xDAA520);
                                                    break;
                                                case RANKS.PLATINUM:
                                                    blackholeImage.setTint(0xE5E4E2);
                                                    break;
                                                default:
                                                    // here is if you have never played a level before
                                                    blackholeImage.setTint(0xFFFFFF);    
                                                    break;
                                            }
                                        } else {
                                            blackholeImage.setTint(0xFFFFFF);
                                        }
                                        
                                        this.nextStagePortals.push(blackholeImage);
                                        
                                        this.add.particles(blackholeImage.x, blackholeImage.y, 'megaAtlas', {
                                            frame: ['portalParticle01.png'],
                                            color: [ 0xFFFFFF,0x000000],
                                            colorEase: 'quad.out',
                                            x:{min: -9 - 12, max: 24 + 12},
                                            y:{min: -9 - 12, max: 24 + 12},
                                            scale: {start: 1, end: .25},
                                            speed: 1,
                                            moveToX: 7,
                                            moveToY: 7,
                                            alpha:{start: 1, end: 0 },
                                            ease: 'Sine.easeOutIn',
                                        }).setFrequency(667,[1]).setDepth(0);

                                    }
                                    else {
                                        // Push false portal so index is correct on warp to next
                                        this.nextStagePortals.push(undefined);
                                    }
                                     
                                    this.tweens.add({
                                        targets: this.blackholeLabels,
                                        alpha: {from: 0, to: 1},
                                        ease: 'Sine.easeOutIn',
                                        duration: 50,
                                        delay: this.tweens.stagger(150)
                                    });

                                    
                                }
                            });

                            blackholeTileIndex++;
                        }
                    }
                } 
            }
        }, this);

        

        // #region Coin Layer Logic
        this.coinsArray = [];

        var coinVarient = ''
        if (this.varientIndex) {
            coinVarient = `Coin_${this.varientIndex}`;
        } else {
            coinVarient = 'Coin';
        }

        if (this.map.getLayer(coinVarient)) {

            var coinLayer = this.map.createLayer(coinVarient, [this.tileset], X_OFFSET, Y_OFFSET);

            coinLayer.forEachTile(tile => {
                if(tile.index > 0) { // -1 = empty tile
                    var _coin = new Coin(this, this.coinsArray, tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET );
                    _coin.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);
                    this.interactLayer[tile.x][tile.y] = _coin;
                    
                }
            });
            coinLayer.destroy();
        } 
        
            
        // #region Stage Logic
        
        var makePair = function (scene, anim, to, from, colorHex, freeDir, spawnDelay) {

            var color = new Phaser.Display.Color.HexStringToColor(colorHex);
            
            var p1 = new Portal(scene, anim, color, to, from, freeDir, spawnDelay);
            var p2 = new Portal(scene, anim, color, from, to, freeDir, spawnDelay + 33);

            p1.targetObject = p2;
            p2.targetObject = p1;

            //p1.flipX = true;

            scene.interactLayer[(from[0] - X_OFFSET)/GRID][(from[1] - Y_OFFSET)/GRID] = p2;
            scene.interactLayer[(to[0] - X_OFFSET)/GRID][(to[1] - Y_OFFSET)/GRID] = p1;
            //var randomStart = Phaser.Math.Between(0,5);
            //p1.setFrame(randomStart)
            //p2.setFrame(randomStart)
        }




        var portalVarient = ""
        if (this.varientIndex) { // False if 0
            portalVarient = `Portal_${this.varientIndex}`
        } else {
            portalVarient = `Portal`
        }

        // #region Portals


        var portalSpawnDelay = PORTAL_SPAWN_DELAY;
        
        for (let index = PORTAL_WALL_START + 1; index < PORTAL_WALL_START + 9; index++) {
            
            if (wallPortalData[index]) {

                var wallDir = ""; // If we use this in more places it should be made an enum.

                if (wallPortalData[index][1][0] - wallPortalData[index][0][0] === GRID) {
                    wallDir = "Horz";
                } else if (wallPortalData[index][1][1] - wallPortalData[index][0][1] === GRID) {
                    wallDir = "Vert";
                }
                

                // Check for if vertical or horizontal here
            
                var colorHex = Phaser.Utils.Array.RemoveRandomElement(this.portalColors); // May Error if more portals than colors.
                
                var startFrom = wallPortalData[index].shift();
                var startTo = wallPortalData[index + ROW_DELTA].shift();

                if (wallDir === "Vert") {
                    //top
                    makePair(this, "pWallVertTop", startFrom, startTo, colorHex, false, portalSpawnDelay);

                    //bottom
                    var endFrom = wallPortalData[index].pop();
                    var endTo = wallPortalData[index + ROW_DELTA].pop();
                    makePair(this, "pWallVertBot", endFrom, endTo, colorHex, false, portalSpawnDelay);

                    //middle
                    wallPortalData[index].forEach(portalTo => {
                    var portalFrom = wallPortalData[index + ROW_DELTA].shift();
                    makePair(this, "pWallVertMiddle", portalTo, portalFrom, colorHex, false, portalSpawnDelay);
                    });
                    
                }
                if (wallDir === "Horz") {
                    //left
                    makePair(this, "pWallFlatLeft", startFrom, startTo, colorHex, false, portalSpawnDelay);

                    //right
                    var endFrom = wallPortalData[index].pop();
                    var endTo = wallPortalData[index + ROW_DELTA].pop();
                    makePair(this, "pWallFlatRight", endFrom, endTo, colorHex, false, portalSpawnDelay);

                    //middle
                    wallPortalData[index].forEach(portalTo => {
                    var portalFrom = wallPortalData[index + ROW_DELTA].shift();
                    makePair(this, "pWallFlatMiddle", portalTo, portalFrom, colorHex, false, portalSpawnDelay);
                    });
                    
                }
                
            }

            portalSpawnDelay += PORTAL_SPAWN_DELAY * 2;
        }

        for (let index = PORTAL_TILE_START + 1; index < PORTAL_TILE_START + 9; index++) {

            // basePortalSpawnPools X doesn't have to do with coordinates and is confusingly named.
            if (basePortalSpawnPools[index]) {
                var colorHex = Phaser.Utils.Array.RemoveRandomElement(this.portalColors); // May Error if more portals than colors.
                // consider throwing an error if a portal doesn't have a correctly defined _to or _from
                
                let _from = Phaser.Math.RND.pick(basePortalSpawnPools[index]);
                let _to = Phaser.Math.RND.pick(basePortalSpawnPools[index + ROW_DELTA]);
                //console.log("Portal Base Logic: FROM TO",_from, _to, index);
                makePair(this, "portalForm", _to, _from, colorHex, true, portalSpawnDelay);

                portalSpawnDelay += PORTAL_SPAWN_DELAY * 2;
            }
        }
        

        // #endregion

        // #region Portal-N

        
        // FYI: Layers refer to layers in Tiled.
        // Portal Layers in Tiled Must start at 1 and go up continuously to work correctly.
        // e.g. portal-1, portal-2. If out of sequence it won't find the higher numbered letters. 
        var layerIndex = 1   
        
        while (this.map.getLayer(`${portalVarient}-${layerIndex}`)) {

            //console.log(`Portal-${layerIndex} Logic`);
            var portalLayerN = this.map.createLayer(`${portalVarient}-${layerIndex}`, [this.tileset], X_OFFSET, Y_OFFSET);
            var portalArrayN = {};
            
            var toN = [];
            var fromN = [];

            portalLayerN.forEachTile(tile => {

                if (tile.index > 0) {
    
                    if (portalArrayN[tile.index]) {
                        portalArrayN[tile.index].push([tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]);
                    }
                    else {
                        portalArrayN[tile.index] = [[tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET]];
                    }
                } 
            });

            for (var [key, value] of Object.entries(portalArrayN)) {
                //console.log("Checking TileIndex", key, "has no more than", PORTAL_TILE_RULES[key], "portals")

                var count = 0;
                
                // Special Case Block. Put a from portal. 
                // Probably needs to recursively try when portal areas double up.
                if (PORTAL_TILE_RULES[key] == undefined) {
                    fromN = Phaser.Math.RND.pick(portalArrayN[key]);

                    delete portalArrayN[key];

                }
                else {
                    //
                    var count = 0;
                    value.forEach(tile => {
                        this.portals.some( portal => {
                            if(portal.x === tile[0] && portal.y === tile[1]){
                                count += 1;
                                //console.log("HELP THIS SPACE IS OCUPADO BY PORTAL",portal.x, portal.y);
                            }
                        });
                    });
                    

                    if (count >= PORTAL_TILE_RULES[key]) {
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


            var colorHex = Phaser.Utils.Array.RemoveRandomElement(this.portalColors);
            makePair(this, "portalForm", fromN, toN, colorHex, true, portalSpawnDelay);

            portalSpawnDelay += PORTAL_SPAWN_DELAY * 2;
    
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
            
            this.lights.addLight(portal.x +8, portal.y + 8, 128,  portalLightColor).setIntensity(1);

            var portalParticles = this.add.particles(portal.x, portal.y, 'megaAtlas', {
                frame: ['portalParticle01.png'],
                color: [ portal.tintTopLeft,0x000000, 0x000000],
                colorEase: 'quad.out',
                x:{steps: 2, min: -9, max: 24},
                y:{steps: 2, min: -9, max: 24},
                scale: {start: 1, end: .5},
                speed: 5,
                moveToX: 7,
                moveToY: 7,
                alpha:{start: 1, end: 0 },
            }).setFrequency(332,[1]).setDepth(20);

            this.portalParticles.push(portalParticles)
            
            if (!this.hasGhostTiles) {
                this.portalMask = this.make.image({
                    x: portal.x,
                    y: portal.y,
                    key: 'megaAtlas',
                    frame: 'portalMask.png',
                    add: false,
                });
                
                this.lightMasks.push(this.portalMask)
            }

        });

        // #region Portals Play
        if (this.portals.length > 0) {
            var sortedPortals = this.portals.toSorted(
                (a, b) => {
                    Phaser.Math.Distance.Between(this.snake.head.x, this.snake.head.y, a.x, a.y) 
                    - Phaser.Math.Distance.Between(this.snake.head.x, this.snake.head.y, b.x, b.y)
                }); 
    
            sortedPortals.forEach (portal => {
                portal.play(portal.anim);
                portal.portalHighlight.playAfterDelay("portalHighlights", 32);
                portal.portalHighlight.alpha = 0;
            });
            
        }
        



        //stagger portal spawns
        //this.time.delayedCall(600, event => {
        //    var interval = 33
        //    this.portals.forEach(function (portal, index) { 
        //       setTimeout(function () {
                    
        //            portal.playAfterRepeat('portalForm');
        //            portal.chain(['portalIdle'])
        //            portal.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
        //               ourGameScene.chime01.play({volume: 0.5});
        //            })
        //                
        //            //}
        //        },index * interval)
        //    })
        //    
        //});




        for (let index = 1; index <= this.atomToSpawn; index++) {
            var _atom = new Food(this, Phaser.Math.RND.pick(this.validSpawnLocations()));  
        }


        // #endregion



        // Calculate this locally (FYI: This is the part that needs to be loaded before it can be displayed)
        var bestLogJSON = JSON.parse(localStorage.getItem(`${this.stageUUID}-bestStageData`));       

        if (bestLogJSON) {
            // is false if best log has never existed
            var bestLog = new StageData(bestLogJSON);
            this.bestBase = bestLog.calcBase();
        }
        else {
            this.bestBase = 0;
        }

        
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
            key: 'megaAtlas',
            frame: 'snakeMask.png',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskN = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'megaAtlas',
            frame: 'snakeMask.png',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskE = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'megaAtlas',
            frame: 'snakeMask.png',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskS = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'megaAtlas',
            frame: 'snakeMask.png',
            add: false
        }).setOrigin(0.5,0.5);
        this.snakeMaskW = this.make.image({
            x: GRID * 0,
            y: GRID * 0,
            key: 'megaAtlas',
            frame: 'snakeMask.png',
            add: false
        }).setOrigin(0.5,0.5);

        this.snakeMask.setScale(1); //Note I'd like to be able to set the scale per level so I can fine tune this during level design. -- James


        this.lightMasks.push(this.snakeMask,this.snakeMaskN, this.snakeMaskE, this.snakeMaskS, this.snakeMaskW)

        this.lightMasksContainer.add(this.lightMasks);
        this.lightMasksContainer.setVisible(false);
        if (this.tiledProperties.has("dark")) {
            this.wallLayer.mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
            this.snake.body[0].mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
        }
        if (this.hasGhostTiles) {
            this.ghostWallLayer.mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);

        }


        

        
        // #endregion

        // #region UI HUD
        this.UIScoreContainer = this.make.container(0,0)
       if (this.startupAnim) {
        this.UIScoreContainer.setAlpha(0).setScrollFactor(0);
        }


       // UI Icons
       //this.add.sprite(GRID * 21.5, GRID * 1, 'snakeDefault', 0).setOrigin(0,0).setDepth(50);      // Snake Head


       // #region Boost Meter UI
       const ourSpaceBoy = this.scene.get("SpaceBoyScene");
       //ourSpaceBoy.scoreFrame is still added to use as a reference point for the electrons transform
        if (ourSpaceBoy.scoreFrame == undefined) {
            ourSpaceBoy.scoreFrame = ourSpaceBoy.add.image(X_OFFSET + GRID * 7 + 6,GRID * 1.5,'atomScoreFrame').setDepth(51).setOrigin(0.5,0.5).setAlpha(0);
        }
       

       this.boostMask = this.make.image({ // name is unclear.
           x: SCREEN_WIDTH/2,
           y: GRID * 1.5,
           key: 'megaAtlas',
           frame: 'boostMask.png',
           add: false
       }).setOrigin(0.5,0.5);
       this.boostMask.setScrollFactor(0);

       const keys = ['increasing'];

       
        this.boostBar = this.add.sprite(SCREEN_WIDTH/2 + 11 - GRID, GRID * 1.5)
            .setOrigin(0.5,0.5).setDepth(52);
        this.boostBar.setScrollFactor(0);
        this.boostBar.mask = new Phaser.Display.Masks.BitmapMask(this, this.boostMask);
        this.boostMask.scaleX = 0;

        
       
       
        this.boostBar.play('increasing');


       const ourGame = this.scene.get("GameScene");

       this.boostBarTween = this.tweens.add( {
        targets: this.boostMask,
        scaleX: this.boostEnergy/1000,
        ease: 'linear',
        duration: 2250, // Mariocart countdown timer is 750 milliseconds between beats.
        yoyo: false,
        repeat: -1,
        persist: true,
        onRepeat: function () {
            this.updateTo("scaleX", this.parent.scene.boostEnergy/1000, true);
        },
       })

       
       //const fx1 = boostBar.postFX.addGlow(0xF5FB0F, 0, 0, false, 0.1, 32);

       /*this.chargeUpTween = this.tweens.add({
            targets: fx1,
            outerStrength: 16,
            duration: 300,
            ease: 'sine.inout',
            yoyo: true,
            loop: 0 
        });
        this.chargeUpTween.pause();*/

       // Combo Sprites

       this.comboActive = false; //used to communicate when to activate combo tweens

       /*this.letterC = this.add.sprite(X_OFFSET + GRID * 0 - GRID * 4,GRID * 1.25,"comboLetters", 0).setDepth(51)//.setAlpha(0);
       this.letterO = this.add.sprite(X_OFFSET + GRID * 1.25 - GRID * 4,GRID * 1.25,"comboLetters", 1).setDepth(51)//.setAlpha(0);
       this.letterM = this.add.sprite(X_OFFSET + GRID * 2.75 - GRID * 4,GRID * 1.25,"comboLetters", 2).setDepth(51)//.setAlpha(0);
       this.letterB = this.add.sprite(X_OFFSET + GRID * 4 - GRID * 4,GRID * 1.25,"comboLetters", 3).setDepth(51)//.setAlpha(0);
       this.letterO2 = this.add.sprite(X_OFFSET + GRID * 5.25 - GRID * 4,GRID * 1.25,"comboLetters", 1).setDepth(51)//.setAlpha(0);
       this.letterExplanationPoint = this.add.sprite(X_OFFSET + GRID * 6 - GRID * 4,GRID * 1.25,"comboLetters", 4).setDepth(51)//.setAlpha(0);
       this.letterX = this.add.sprite(X_OFFSET + GRID * 7 - GRID * 4,GRID * 1.25,"comboLetters", 5).setDepth(51).setAlpha(0);
       */

       this.letterC = this.make.image({
        x: X_OFFSET + GRID * 0 - GRID * 4 -6,
        y:  GRID * 1.25,
        key: 'comboLetters',
        frame: 0,
        add: false,
        alpha: 0,
        });
        this.letterO = this.make.image({
            x: X_OFFSET + GRID * 1.25 - GRID * 4 -5,
            y:  GRID * 1.25,
            key: 'comboLetters',
            frame: 1,
            add: false,
            alpha: 0,
        });
        this.letterM = this.make.image({
            x: X_OFFSET + GRID * 2.75 - GRID * 4 -4,
            y:  GRID * 1.25,
            key: 'comboLetters',
            frame: 2,
            add: false,
            alpha: 0,
        });
        this.letterB = this.make.image({
            x: X_OFFSET + GRID * 4 - GRID * 4 -3,
            y:  GRID * 1.25,
            key: 'comboLetters',
            frame: 3,
            add: false,
            alpha: 0,
        });
        this.letterO2 = this.make.image({
            x: X_OFFSET + GRID * 5.25 - GRID * 4 -2,
            y:  GRID * 1.25,
            key: 'comboLetters',
            frame: 1,
            add: false,
            alpha: 0,
        });
        this.letterExplanationPoint = this.make.image({
            x: X_OFFSET + GRID * 6 - GRID * 4 -1,
            y:  GRID * 1.25,
            key: 'comboLetters',
            frame: 4,
            add: false,
            alpha: 0,
        });
        
        
        this.comboCover = this.add.sprite(GRID * 6.75, GRID * 0,'comboCover')
            .setOrigin(0.0,0.0).setDepth(52).setScrollFactor(0);

        this.comboMasks = []
        this.comboMasks.push(this.letterC,this.letterO,this.letterM,this.letterB,this.letterO2,this.letterExplanationPoint)

        this.comboMasksContainer = this.make.container(GRID * 6.75, GRID * 0);
        this.comboMasksContainer.add(this.comboMasks);

        this.comboMasksContainer.setVisible(false);


        this.comboCover.mask = new Phaser.Display.Masks.BitmapMask(this, this.comboMasksContainer);

        this.comboCover.mask.invertAlpha = true;
        

        //this.comboMasksContainer.setScrollFactor(0);
        
       // #endregion


   

        // Store the Current Version in Cookies
        localStorage.setItem('version', GAME_VERSION); // Can compare against this later to reset things.

        
        

        // Score Text SET INVISIBLE
        this.scoreUI = this.add.bitmapText(X_OFFSET + GRID * 24, GRID * 1.25, 'mainFont',`STAGE`,16)
            .setOrigin(0,0).setScale(.5).setAlpha(1).setScrollFactor(0).setTint(0x1f211b);
        this.scoreLabelUI = this.add.bitmapText(X_OFFSET + GRID * 26.75, GRID * 1.25, 'mainFont',`0`,16)
            .setOrigin(0,0).setScale(.5).setScrollFactor(0).setTint(0x1f211b);

        this.bestScoreUI = this.add.bitmapText(X_OFFSET + GRID * 24, GRID * 0.325 , 'mainFont',`BEST`,16)
            .setOrigin(0,0).setScale(.5).setAlpha(1).setScrollFactor(0).setTint(0x1f211b);
        this.bestScoreLabelUI = this.add.bitmapText(X_OFFSET + GRID * 26.75, GRID * 0.325 , 'mainFont',`${this.bestBase}`,16)
            .setOrigin(0,0).setScale(.5).setAlpha(1).setScrollFactor(0).setTint(0x1f211b);



   
        

        // this.add.image(GRID * 21.5, GRID * 1, 'ui', 0).setOrigin(0,0);
        //this.livesUI = this.add.dom(GRID * 22.5, GRID * 2 + 2, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)
        //).setText(`x ${this.lives}`).setOrigin(0,1);

        // Goal UI
        //this.add.image(GRID * 26.5, GRID * 1, 'ui', 1).setOrigin(0,0);
        const lengthGoalStyle = {
            "color":'0x1f211b',
            "font-size": '16px',
            "font-weight": 400,
            "text-align": 'right',
        }
        
                    //this.runningScoreLabelUI = this.add.bitmapText(X_OFFSET + GRID * 26.75, GRID * 3, 'mainFont', `${commaInt(this.score.toString())}`, 16)
            //.setOrigin(0,1).setScale(.5).setTint(0x1f211b).setScrollFactor(0);

        this.lengthGoalUI = this.add.bitmapText((X_OFFSET + GRID * 33.25), 4, 'mainFont', ``, 16).setScale(.5)
        .setAlpha(1).setScrollFactor(0).setTint(0x1f211b);
        this.lengthGoalUILabel = this.add.bitmapText(X_OFFSET + GRID * 30.25, 4, 'mainFont', ``, 16).setScale(.5)
        .setAlpha(1).setScrollFactor(0).setTint(0x1f211b);
        //var snakeBody = this.add.sprite(GRID * 29.75, GRID * 0.375, 'snakeDefault', 1).setOrigin(0,0).setDepth(101)//Snake Body
        //var flagGoal = this.add.sprite(GRID * 29.75, GRID * 1.375, 'ui-blocks', 3).setOrigin(0,0).setDepth(101); // Tried to center flag
 
        //snakeBody.scale = .667;
        //flagGoal.scale = .667;
        
        
        var length = `${this.length}`;
        if (this.lengthGoal != 0) {
            this.lengthGoalUI.setText(
                `${length.padStart(2, "0")}\n${this.lengthGoal.toString().padStart(2, "0")}`
            ).setOrigin(0,0).setAlpha(1);
            this.lengthGoalUILabel.setText(
            `LENGTH\nGOAL`
            ).setOrigin(0,0).setAlpha(1);
            this.lengthGoalUILabel.setLineSpacing(3)
            this.lengthGoalUI.setLineSpacing(3)
        }
        else {
            // Special Level
            this.lengthGoalUI.setText(`${length.padStart(2, "0")}`).setOrigin(0,0)
            .setAlpha(0);
            this.lengthGoalUI.x = GRID * 27
        }

        if (this.startupAnim) {
            this.lengthGoalUI.setAlpha(0);
            this.lengthGoalUILabel.setAlpha(0);
        }
        
        //this.add.image(SCREEN_WIDTH - 12, GRID * 1, 'ui', 3).setOrigin(1,0);

        // Start Fruit Score Timer
        if (DEBUG) { console.log("STARTING SCORE TIMER"); }

        this.scoreTimer = this.time.addEvent({
            delay: this.maxScore * 100,
            paused: true
         }, this);

        var countDown = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
        


         // Countdown Text
        this.countDown = this.add.dom(X_OFFSET + GRID * 8 + 4, GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
            'color': '#FCFFB2',
            'text-shadow': '0 0 4px #FF9405, 0 0 8px #F8FF05',
            'font-size': '22px',
            'font-weight': '400',
            'font-family': 'Oxanium',
            'padding': '2px 7px 0px 0px',
            })).setHTML(
                countDown.toString().padStart(3,"0")
        ).setOrigin(1,0.5).setAlpha(0).setScale(.5);
        this.countDown.setScrollFactor(0);

        

        //this.coinsUIIcon = this.physics.add.sprite(GRID*21.5 -7, 8,'megaAtlas', 'coinPickup01Anim.png'
        //).play('coin01idle').setDepth(101).setOrigin(0,0);

        if (this.coinsUIIcon == undefined) {
            this.coinsUIIcon = ourSpaceBoy.add.sprite(X_OFFSET + GRID * 20 + 5, 2 + GRID * .5, 'coinPickup01Anim.png'
            ).play('coin01idle').setDepth(101).setOrigin(0,0).setVisible(false);
        }

        if (this.scene.get("PersistScene").coins > 0) {
            this.coinsUIIcon.setVisible(true)
        }
        

        //this.coinsUIIcon.setScale(0.5);
        
        this.coinUIText = this.add.dom(X_OFFSET + GRID*21 + 9, 6 + GRID * .5, 'div', Object.assign({}, STYLE_DEFAULT, {
            color: COLOR_SCORE,
            'color': 'white',
            'font-weight': '400',
            //'text-shadow': '0 0 4px #FF9405, 0 0 12px #000000',
            'font-size': '22px',
            'font-family': 'Oxanium',
            'letter-spacing': '8px'
            //'padding': '3px 8px 0px 0px',
        })).setHTML(
                `${commaInt(this.scene.get("PersistScene").coins).padStart(2, '0')}`
        ).setOrigin(0,0).setAlpha(0).setScale(.5);
        this.coinUIText.setScrollFactor(0);

        this.time.delayedCall(1000, event => {
            const ourGameScene = this.scene.get('GameScene');
            this.tweens.add({
                targets: [ourGameScene.countDown,ourGameScene.coinUIText],
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 500,
              });
        });
        
        
        //this.deltaScoreUI = this.add.dom(GRID*21.1 - 3, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
        //    `LASTΔ :`
        //).setOrigin(0,1);
        //this.deltaScoreLabelUI = this.add.dom(GRID*24, GRID, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE)).setText(
        //    `0 `
        //).setOrigin(0,1);
        
        /*this.runningScoreUI = this.add.dom(X_OFFSET + GRID * 23.75, GRID * 3, 'div', Object.assign({}, STYLE_DEFAULT, UISTYLE, { color: '0x1f211b' })).setText(
            `Score`
        ).setOrigin(0,1).setScale(.5).setAlpha(1).setScrollFactor(0);*/
        this.runningScoreUI = this.add.bitmapText(X_OFFSET + GRID * 24, GRID * 3 - 2, 'mainFont', 'SCORE', 16)
            .setOrigin(0, 1)
            .setScale(0.5)
            .setAlpha(1)
            .setScrollFactor(0)
            .setTint(0x1f211b)
            .setDepth(100);
        this.runningScoreLabelUI = this.add.bitmapText(X_OFFSET + GRID * 26.75, GRID * 3 -2, 'mainFont', `${commaInt(this.score.toString())}`, 16)
            .setOrigin(0,1).setScale(.5).setTint(0x1f211b).setScrollFactor(0);

        
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

        
        //  #region @E: addScore
        this.events.on('addScore', function (fruit) {

            const ourGameScene = this.scene.get('GameScene');

            var scoreText = this.add.dom(fruit.x, fruit.y - GRID -  4, 'div', Object.assign({}, STYLE_DEFAULT, {
                color: COLOR_SCORE,
                'color': '#FCFFB2',
                'font-weight': '400',
                'text-shadow': '0 0 4px #FF9405, 0 0 12px #000000',
                'font-size': '22px',
                'font-family': 'Oxanium',
                'padding': '3px 8px 0px 0px',
            })).setOrigin(0,0).setScale(.5);
            
            // Remove score text after a time period.
            this.time.delayedCall(1000, event => {
                scoreText.removeElement();
            }, [], this);

            this.tweens.add({
                targets: scoreText,
                alpha: { from: 1, to: 0.0 },
                y: scoreText.y - 6,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10
            
            if (timeLeft > BOOST_ADD_FLOOR) {
                this.boostEnergy = Math.min(this.boostEnergy + 250, 1000);
     

                var electronToCapacitor = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                var electronToCapacitor2 = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                var electronToCapacitor3 = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                //electronToCapacitor.play("electronIdle");
                //electronToCapacitor.anims.msPerFrame = 66;

                var movingElectronTween = this.tweens.add( {
                    targets: electronToCapacitor,
                    x: ourSpaceBoy.scoreFrame.getCenter().x -3,
                    y: ourSpaceBoy.scoreFrame.getCenter().y,
                    duration:300,
                    delay: 0,
                    ease: 'Sine.in',
                    onComplete: () => {
                        electronToCapacitor.playAfterRepeat({ key: 'CapElectronDispersion' }, 0).setScale(1);
                        //electronToCapacitor.play({ key: 'electronDispersion01' })
                    }
                });
                var movingElectronTween2 = this.tweens.add( {
                    targets: electronToCapacitor2,
                    x: ourSpaceBoy.scoreFrame.getCenter().x -7,
                    y: ourSpaceBoy.scoreFrame.getCenter().y,
                    duration:300,
                    delay: 33.3,
                    ease: 'Sine.in',
                    onComplete: () => {
                        electronToCapacitor2.destroy();
                    }

                });
                var movingElectronTween3 = this.tweens.add( {
                    targets: electronToCapacitor3,
                    x: ourSpaceBoy.scoreFrame.getCenter().x -7,
                    y: ourSpaceBoy.scoreFrame.getCenter().y,
                    duration:300,
                    delay: 66.7,
                    ease: 'Sine.in',
                    onComplete: () => {
                        electronToCapacitor3.destroy();
                    }

                });
                
                //ourGameScene.capSparkSFX.play();
                ourGameScene.CapSpark.play(`CapSpark${Phaser.Math.Between(0,9)}`).setOrigin(.5,.5)
                .setDepth(100)
                ourGameScene.CapSpark.setVisible(true);
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
            console.log("Current Score:", this.score + calcBonus(baseScore), "+Δ" ,baseScore + calcBonus(baseScore) - lastScore, "Length:", this.length);

            this.runningScore = this.score + calcBonus(baseScore);
            var deltaScore = baseScore + calcBonus(baseScore) - lastScore;

            //this.deltaScoreUI.setText(
            //    `LASTΔ : +`
            //)
            //this.deltaScoreLabelUI.setText(
            //    `${deltaScore}`
            //)
            
            /*this.runningScoreUI.setText(
                `SCORE :`
            );*/
            this.runningScoreLabelUI.setText(
                `${commaInt(this.runningScore.toString())}`
            );
            
            


            // Update UI

            this.scoreUI.setText(`STAGE`);
            this.scoreLabelUI.setText(`${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            


            this.bestScoreUI.setText(`BEST`).setAlpha(1).setScrollFactor(0);
            this.bestScoreLabelUI.setText(this.bestBase).setAlpha(1).setScrollFactor(0);

            
             // Restart Score Timer
            if (this.length < this.lengthGoal || this.lengthGoal === 0) {
                this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                    delay: this.maxScore * 100,
                    paused: false
                 }, this);   
            }
            
        }, this);

        //  #region @E: saveScore
        this.events.on('saveScore', function () {
            const ourScoreScene = this.scene.get('ScoreScene');
            const ourStartScene = this.scene.get('StartScene');
            const ourSpaceboy = this.scene.get('StartScene');


            // Building StageData for Savin
            var stageData = ourScoreScene.stageData;
            

            //console.log(stageData.toString());

            var stageFound = false;
            
            var stage_score = this.scoreHistory.reduce((a,b) => a + b, 0);
            
            // #region Do Unlock Calculation of all Best Logs
            
            var historicalLog = [];
            if (ourSpaceboy.stageHistory.length > 1) {
                ourSpaceboy.stageHistory.forEach( _stage => {
                    var stageBestLog = JSON.parse(localStorage.getItem(`${_stage.uuid}-bestStageData`));
                    if (stageBestLog) {
                        historicalLog = [...historicalLog, ...stageBestLog];
                    }
                });
                
            }
        
        
            // #endregion


        }, this);

        this.lastTimeTick = 0;
        // 9-Slice Panels
        // We recalculate running score so it can be referenced for the 9-slice panel
        var baseScore = this.scoreHistory.reduce((a,b) => a + b, 0);
        this.runningScore = this.score + calcBonus(baseScore);
        this.scoreDigitLength = this.runningScore.toString().length;
        
        /*this.scorePanel = this.add.nineslice(X_OFFSET, 0, 
            'uiGlassL', 'Glass', 
            ((42) + (this.scoreDigitLength * 6)), 39, 40, 9, 9, 9);
        this.scorePanel.setDepth(100).setOrigin(0,0)


        this.progressPanel = this.add.nineslice((SCREEN_WIDTH - X_OFFSET), 0,
             'uiGlassR', 'Glass',
             57, 29, 9, 29, 9, 9);
        this.progressPanel.setDepth(100).setOrigin(1,0)*/
        
        

        this.UIScoreContainer.add([this.scoreUI,this.scoreLabelUI,
            this.bestScoreUI,this.bestScoreLabelUI,
            this.runningScoreUI, this.runningScoreLabelUI])

        /*if (this.startupAnim) {
            this.progressPanel.setAlpha(0)
            this.scorePanel.setAlpha(0)
        }*/

        const goalText = [
            'GOAL : COLLECT 28 ATOMS',
        ];

        /*const text = this.add.text(SCREEN_WIDTH/2, 192, goalText, { font: '32px Oxanium'});
        text.setOrigin(0.5, 0.5);
        text.setScale(0)
        text.setDepth(101)*/
        
        if (this.startupAnim) {
            
            this.time.delayedCall(400, event => {
                this.panelAppearTween = this.tweens.add({
                    targets: [this.scorePanel,this.progressPanel,this.UIScoreContainer,this.lengthGoalUI, this.lengthGoalUILabel],
                    alpha: 1,
                    duration: 300,
                    ease: 'sine.inout',
                    yoyo: false,
                    repeat: 0,
                });
            })
        }
        

        // dot matrix
        
        if (this.startupAnim){

            const hsv = Phaser.Display.Color.HSVColorWheel();

            const gw = 32;
            const gh = 32;
            const bs = 24;

            const group = this.add.group({
                key: "megaAtlas",
                frame: 'portalParticle01.png',
                quantity: gw * gh,
                gridAlign: {
                    width: gw,
                    height: gh,
                    cellWidth: bs,
                    cellHeight: bs,
                    x: (SCREEN_WIDTH - (bs * gw)) / 2 + 4,
                    y: (SCREEN_HEIGHT - (bs * gh) + bs / 2) / 2 -2
                },
            }).setDepth(103).setAlpha(0);

            const size = gw * gh;


            //  set alpha
            group.getChildren().forEach((child,) => {
                child = this.make.image({},
                    false);
                /*if (child.x <= this.scorePanel.x || child.x >= this.scorePanel.width
                    ||child.y <= this.scorePanel.y || child.y >= (this.scorePanel.y + this.scorePanel.height)
                ) {
                    child.setAlpha(1).setScale(1);
                }*/
            });

            this.variations = [
                [ 33.333, { grid: [ gw, gh ], from: 'center' } ],
            ];
            this.getStaggerTween(0, group);
        }

        this.tweens.add( {
            targets: this.coinsArray,
            originY: [0.1875 - .0466,0.1875 + .0466],
            ease: 'sine.inout',
            duration: 500, //
            yoyo: true,
            repeat: -1,
           })

        this.helpPanel = this.add.nineslice(0,0,
            'uiPanelL', 'Glass', 100, 56, 18,18,18,18).setDepth(100)
            .setOrigin(0.5,0.5).setScrollFactor(0).setAlpha(0);

        this.targetAlpha = 0; // Initialize target alpha
        this.currentAlpha = 0; // Initialize current alpha

        this.updatePanelAlpha = () => {
            const distance = Phaser.Math.Distance.Between(this.snake.head.x, this.snake.head.y, this.helpPanel.x, this.helpPanel.y);
            const maxDistance = 360;
            const normalizedDistance = Phaser.Math.Clamp(distance / maxDistance, 0, 1);
            this.targetAlpha = Math.sin(normalizedDistance * Math.PI / 2);
            
            const lerpFactor = 0.1; // Adjust this value for smoother or faster transitions
            this.currentAlpha = Phaser.Math.Interpolation.Linear(
                [this.currentAlpha, this.targetAlpha], lerpFactor);
            this.helpPanel.setAlpha(this.currentAlpha);
            this.helpText.setAlpha(this.currentAlpha);
        }
            this.helpText = this.add.dom(0, 0, 'div', {
                color: 'white',
                'font-size': '8px',
                'font-family': 'Oxanium',
                'font-weight': '200',
                'text-align': 'left',
                'letter-spacing': "1px",
                'width': '86px',
                'word-wrap': 'break-word'
            });
            this.helpText.setText(``).setOrigin(0.5,0.5).setScrollFactor(0);

            //console.log(this.interactLayer);

            if (STAGE_OVERRIDES.has(this.stage)) {
                console.log("Running postFix Override on", this.stage);
                STAGE_OVERRIDES.get(this.stage).postFix(this);
            }
        
    }

    tutorialPrompt(x,y,key){


        this.helpPanel.setAlpha(1);
        this.helpPanel.x = x;
        this.helpPanel.y = y;
        //print message based on key
        var _message = '';
        switch (key) {
            case 1:
                _message = 'Proceed through the blackhole to travel to a new stage.'
                break;
            case 2:
                _message = 'Cross the side of the screen to wrap around to the other side!'
                break;
            case 3:
                _message = 'Bonking will consume a coin. Collect coins to increase your lives!'
                this.helpPanel.height = 68
                break;
            default:
                _message = ''
        }
        this.helpText.x = x;
        this.helpText.y = y;
        this.helpText.setText(`${_message}`).setOrigin(0.5,0.5).setScrollFactor(0);
    }

    // #region .setWallsPermeable(
    setWallsPermeable() {
        //this.wallsPermeable = true;
        //this.snakeGlitch = true;

        //makes wall tiles partially transparent. both wall layers are printed and are adjusted
        this.wallLayer.culledTiles.forEach( tile => {
            tile.alpha = 0.5;
        });
        this.wallLayerShadow.forEachTile(tile => {
            tile.alpha = 0.0;
        });
    }

    // #region .screenShake(
    screenShake(){
        const ourSpaceBoy = this.scene.get("SpaceBoyScene");
        if (this.moveInterval === this.speedSprint) {
            this.cameras.main.shake(400, .01);
            ourSpaceBoy.cameras.main.shake(400, .01); //shakes differently than main when referencing different cameras
        }
        else if (this.moveInterval === this.speedWalk){
            this.cameras.main.shake(300, .00625);
            ourSpaceBoy.cameras.main.shake(300, .00625); //above note
        }    
    }

    // #region .snakeCriticalState(
    snakeCriticalState(){
        const coins = this.scene.get("PersistScene").coins
        if (coins === 0 && this.snakeCritical === false){
            this.snakeCriticalTween = this.tweens.addCounter({
                from: 255,
                to: 0,
                yoyo: true,
                duration: 500,
                ease: 'Linear',
                repeat: -1,
                onUpdate: tween =>{
                    const value = Math.floor(tween.getValue());
                    const color1 = Phaser.Display.Color.RGBToString(200, value, value);
                    this.coinUIText.node.style.color = color1;
                    this.snake.body.forEach((part) => {
                        part.setTint(Phaser.Display.Color.GetColor(200, value, value));
                    })
                }
            });
            this.snakeCritical = true

        }
        else if (coins > 0 && this.snakeCritical === true){ //null check
            if (this.snakeCriticalTween != null){
                this.snakeCriticalTween.destroy();
            }
            this.snakeCriticalTween = this.tweens.addCounter({
                from: this.snakeCriticalTween.getValue(),
                to: 255,
                yoyo: false,
                duration: 500,
                ease: 'Linear',
                repeat: 0,
                onUpdate: tween =>{
                    const value = Math.floor(tween.getValue());
                    const color1 = Phaser.Display.Color.RGBToString(255, value, value);
                    this.coinUIText.node.style.color = color1;
                    this.snake.body.forEach((part) => {
                        part.setTint(Phaser.Display.Color.GetColor(255, value, value));
                    })
                }
            });
            this.snakeCritical = false
        }
    }

    transitionVisual () {
        
    }

    // #region .validSpawnLocation(
    validSpawnLocations() {
        var testGrid = [];

        // Start with all safe points as true. This is important because Javascript treats 
        // non initallized values as undefined and so any comparison or look up throws an error.
        
        // 2. Make a viritual GRID space to minimise the size of the array.
        for (var _x = 0; _x < 29; _x++) {
            testGrid[_x] = [];
            for (var _y = 0; _y < 27; _y++) {
                testGrid[_x][_y] = 1; // Note: In the console the grid looks rotated.
            }
        }

        // No Spawning on the edges under the bezel.
        for (let row = 0; row < 27; row++) {
            testGrid[0][row] = 0;
            testGrid[28][row] = 0; 
        }

        for (let column = 0; column < 29; column++) {
            testGrid[column][0] = 0;
            testGrid[column][26] = 0;
        }
        
        
    
        // Set all the unsafe places unsafe

        this.map.getLayer(this.wallVarient); //if not set, Ghost Walls overwrite and break Black Hole code
        this.wallLayer.forEachTile(wall => {
        
    
            if (wall.index > 0) {                
                testGrid[wall.x][wall.y] = 0; // In TileSpace
            }
        });
        
        
        
        
        if (this.map.getLayer('Ghost-1')) {
            this.ghostWallLayer.forEachTile(wall => {
    
                if (wall.index > 0) {
                    
                    testGrid[wall.x][wall.y] = 0;
                }
            });
        }

        // Check all active things
        for (let x = 0; x < this.interactLayer.length; x++) {
            for (let y = 0; y < this.interactLayer[x].length; y++) {
                if (this.interactLayer[x][y] != "empty") {
                    testGrid[x][y] = 0;
                }        
            }
        }

        


        // Don't spawn on Dream Walls


        // THIS IS BROKE NOW. Also no dream walls now.
        //this.dreamWalls.forEach( dreamwall => {
        //    testGrid[dreamwall.x/GRID][dreamwall.y/GRID] = false;
        //});
        



        // This version for if we decide to build the wall index once and check against only wall values.
        //this.walls.forEach(wall => {
        //    if (wall.x < SCREEN_WIDTH) {
        //        // Hack to sanitize index undefined value
        //        // Current Tiled input script adds additional X values.
        //        testGrid[wall.x][wall.y] = false;
        //    }
        //});

        //this.atoms.forEach(_fruit => {

        //    var _x = Math.floor((_fruit.x - X_OFFSET ) / GRID);
        //    var _y = Math.floor((_fruit.y - Y_OFFSET) / GRID);
        //     testGrid[_x][_y] = "a";
            
        //});
        

        // TEMP
        //this.portals.forEach(_portal => {
        //    testGrid[Math.floor(_portal.x/GRID)][Math.floor(_portal.y/GRID)] = false;
        //});


        // THIS EXISTS TWICE????
        //this.dreamWalls.forEach( _dreamWall => {
        //    testGrid[_dreamWall.x/GRID][_dreamWall.y/GRID] = false;
        //});


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
                //testGrid[Math.round(_part.x/GRID)][Math.round(_part.y/GRID)] = false;
            }
            
        });


        

        
        var validLocations = [];

        for (var _x = 0; _x < 29; _x++) {
            for (var _y = 0; _y < 27; _y++) {
                if (testGrid[_x][_y] === 1) {
                    // Push only valid positions to an array.
                    validLocations.push({x: _x * GRID + X_OFFSET, y: _y * GRID + Y_OFFSET});     
                }
            }
        }


        return validLocations;

    }

    victoryFanfare(){
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourPersist = this.scene.get('PersistScene');
        const ourSpaceBoy= this.scene.get("SpaceBoyScene");

        
        // Store speed values
        let _walkSpeed = this.speedWalk
        let _sprintSpeed = this.speedSprint

        // Store initial camera position
        let initialCameraX = this.cameras.main.scrollX;
        let initialCameraY = this.cameras.main.scrollY

        // Start slowMoValCopy at 1 (default time scale). It's copied to preserve its value outside the tween
        var slowMoValCopy = 1;


        if (!this.nextStagePortalLayer.findByIndex(616)){ //check if we're on last stage -- using placeholder code, right now always defaults to true
            //normal ending
            // Slow Motion Tween -- slows down all tweens and anim timeScales withing scene
            this.slowMoTween = this.tweens.add({
                targets: { value: 1 },
                value: 0.2,
                duration: 500,
                yoyo: true,
                ease: 'Sine.easeInOut',
                repeat: 0,
                    onUpdate: (tween) => {
                        let slowMoValue = tween.getValue();
                        slowMoValCopy = slowMoValue;

                        // Apply the interpolated slowMoValue to all the timeScales
                        this.tweens.timeScale = slowMoValue;
                        this.anims.globalTimeScale = slowMoValue;
                        this.speedWalk = _walkSpeed  / slowMoValue;
                        this.speedSprint = _sprintSpeed / slowMoValue;
                        if (this.starEmitterFinal) {
                            this.starEmitterFinal.timeScale = slowMoValue;
                        }
                    },
                    onComplete: () => {
                        console.log('Slow motion effect completed');
                        this.tweens.timeScale = 1;
                        this.anims.globalTimeScale = 1;
                        this.speedWalk = _walkSpeed;
                        this.speedSprint = _sprintSpeed;
                        if (this.starEmitterFinal) {
                            this.starEmitterFinal.timeScale = 1;
                        }
                    }
                    
                });
                //this.gState = GState.PLAY;

            }
        else{
            //fanfare ending
            // Slow Motion Tween -- slows down all tweens and anim timeScales withing scene
            console.log('should rainbow right now fr')
            this.slowMoTween = this.tweens.add({
                targets: { value: 1 },
                value: 0.2,
                duration: 500,
                yoyo: true,
                ease: 'Sine.easeInOut',
                repeat: 0,
                    onUpdate: (tween) => {
                        // Camera Restraints/Bounds -- isn't needed if not zooming
                        //this.cameras.main.setBounds(0, 0, 240, 320);
                        //ourSpaceBoy.cameras.main.setBounds(0, 0, 240, 320);
                        //ourPersist.cameras.main.setBounds(0, 0, 240, 320);

                        let slowMoValue = tween.getValue();
                        slowMoValCopy = slowMoValue;

                        // Apply the interpolated slowMoValue to all the timeScales
                        this.tweens.timeScale = slowMoValue;
                        this.anims.globalTimeScale = slowMoValue;
                        this.speedWalk = _walkSpeed  / slowMoValue;
                        this.speedSprint = _sprintSpeed / slowMoValue;
                        if (this.starEmitterFinal) {
                            this.starEmitterFinal.timeScale = slowMoValue;
                        }
                        // Camera Zoom
                        //this.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                        //ourSpaceBoy.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                        //ourPersist.cameras.main.zoom = 1 + (1 / slowMoValue - 1) * 0.05
                        
                        // Continuously interpolate the camera's position to the snake's head -- not needed
                        //let targetX = this.snake.head.x - this.cameras.main.width / 2;
                        //let targetY = this.snake.head.y - this.cameras.main.height / 2;

                        /*if (slowMoValue <= 0.5) {
                            this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, this.electronFanfare.x - this.cameras.main.width / 2, 1);
                            this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, this.electronFanfare.y - this.cameras.main.height / 2, 1);

                            ourSpaceBoy.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, this.electronFanfare.x - this.cameras.main.width / 2, 1);
                            ourSpaceBoy.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, this.electronFanfare.y - this.cameras.main.height / 2, 1);

                            ourPersist.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, this.electronFanfare.x - this.cameras.main.width / 2, 1);
                            ourPersist.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, this.electronFanfare.y - this.cameras.main.height / 2, 1);
                        } 
                        else {
                            this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, 0, 0.01);
                            this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, 0, 0.01);

                            ourSpaceBoy.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, 0, 0.01);
                            ourSpaceBoy.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, 0, 0.01);
                            
                            ourPersist.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, 0, 0.01);
                            ourPersist.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, 0, 0.01);
                        }*/
                    // Set scrollFactor to 1 for all game objects if using zoom-in
                        // Get all game objects in the scene
                        /*this.children.list.forEach((child) => {
                            // Check if the child object has a scroll factor property set to 0
                            if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
                                child.setScrollFactor(1);
                                this.UIScoreContainer.setScrollFactor(1);
                                }
                            });
                            // Iterate over each child in the container and set the scroll factor to 1
                            this.UIScoreContainer.each((child) => {
                                child.setScrollFactor(1);
                        });*/
                    },
                    onComplete: () => {
                        console.log('Slow motion effect completed');
                        
                        this.tweens.timeScale = 1;
                        this.anims.globalTimeScale = 1;
                        this.speedWalk = _walkSpeed;
                        this.speedSprint = _sprintSpeed;
                        if (this.starEmitterFinal) {
                            this.starEmitterFinal.timeScale = 1;
                        }
                        
                        this.hsv = Phaser.Display.Color.HSVColorWheel();
                        const spectrum = Phaser.Display.Color.ColorSpectrum(360);
                        var colorIndex = 0;
                        var color = spectrum[colorIndex];

                        this.fxBoost = this.boostBar.preFX.addColorMatrix();

                        this.tweens.addCounter({
                            from: 0,
                            to: 360,
                            duration: 3000,
                            loop: -1,
                            onUpdate: (tween) => {
                                let hueValue = tween.getValue();
                                this.fxBoost.hue(hueValue);
                        
                                // Update each segment's tint with an offset and apply pastel effect
                                this.snake.body.forEach((part, index) => {
                                    // Add an offset to the hue for each segment
                                    let partHueValue = (hueValue + index * 12.41) % 360;
                        
                                    // Reduce saturation and increase lightness
                                    let color = Phaser.Display.Color.HSVToRGB(partHueValue / 360, 0.5, 1); // Adjusted to pastel
                        
                                    if (color) {// only update color when it's not null
                                        part.setTint(color.color);
                                    }
                                });
                            }
                        });
                        
                        /*this.electronFanfare = ourSpaceBoy.add.sprite(ourSpaceBoy.scoreFrame.getCenter().x -3,ourSpaceBoy.scoreFrame.getCenter().y)
                            .setDepth(100);
                        this.electronFanfare.play('electronFanfareIdle');*/

                        /*this.cameras.main.scrollX = 0;
                        this.cameras.main.scrollY = 0;

                        ourSpaceBoy.cameras.main.scrollX = 0;
                        ourSpaceBoy.cameras.main.scrollY = 0;

                        ourPersist.cameras.main.scrollX = 0;
                        ourPersist.cameras.main.scrollY = 0;*/
                        this.CapSparkFinale = ourSpaceBoy.add.sprite(X_OFFSET + GRID * 9, GRID * 1.5).play(`CapSparkFinale`).setOrigin(.5,.5)
                        .setDepth(100);
                        
                        this.gState = GState.PLAY;
                }
            });
            // atomic comet
            this.atomComet = ourSpaceBoy.add.sprite(this.snake.head.x + 6,this.snake.head.y + 6)
            .setDepth(100);
            this.atomComet.play('atomCometSpawn');
            this.atomComet.chain(['atomCometIdle']);


            // rainbow electronFanfare
            this.electronFanfare = ourSpaceBoy.add.sprite(this.snake.head.x + 6,this.snake.head.y + 6)
            .setDepth(100);
            this.electronFanfare.play('electronFanfareForm');
            

            // emit stars from electronFanfare
            this.starEmitterFinal = this.add.particles(6,6,"twinkle01", { 
                speed: { min: -20, max: 20 },
                angle: { min: 0, max: 360 },
                alpha: { start: 1, end: 0 },
                anim: 'starIdle',
                lifespan: 1000,
                follow: this.electronFanfare,
            }).setFrequency(150,[1]).setDepth(1);

            ourGame.countDown.setAlpha(0);
        }

        this.tweens.add({ //slower one-off snakeEating tween
            targets: this.snake.body, 
            scale: [1.25,1],
            yoyo: false,
            duration: 128,
            ease: 'Linear',
            repeat: 0,
            timeScale: slowMoValCopy,
            delay: this.tweens.stagger(this.speedSprint),
            onUpdate: (tween) => {
                this.timeScale = slowMoValCopy /2;
            }
        });

        // Atomic Comet and Electron Fanfare Tween
        if (this.electronFanfare) {
            this.electronFanfare.on('animationcomplete', (animation, frame) => {
                if (animation.key === 'electronFanfareForm') {
                    this.tweens.add({
                        targets: [this.electronFanfare,this.atomComet],
                        x: ourSpaceBoy.scoreFrame.getCenter().x -3,
                        y: ourSpaceBoy.scoreFrame.getCenter().y,
                        ease: 'Sine.easeIn',
                        duration: 1250,
                        onComplete: () => {
                            ourGame.countDown.setAlpha(1);
                            ourGame.countDown.x = X_OFFSET + GRID * 4 - 3;
                            ourGame.countDown.y = 3;
                            this.atomComet.destroy();
                        }
                    });
                            ourGame.countDown.setHTML('W1N');
                            ourGame.countDown.x += 4
                    }
                    
            });

            this.electronFanfare.chain(['electronFanfareIdle']);
        }

        

        /*this.starEmitter = this.add.particles(X_OFFSET, Y_OFFSET, "starIdle", { 
            x:{min: 0, max: SCREEN_WIDTH},
            y:{min: 0, max: SCREEN_HEIGHT},
            alpha: { start: 1, end: 0 },
            gravityX: -50,
            gravityY: 50,
            anim: 'starIdle',
            lifespan: 3000,
        }).setFrequency(300,[1]).setDepth(1);

        // check if stage next is empty -- means it's the final extraction point

        this.starEmitterFinal = this.add.particles(6,6,"starIdle", { 
            speed: { min: -20, max: 20 },
            angle: { min: 0, max: 360 },
            alpha: { start: 1, end: 0 },
            anim: 'starIdle',
            lifespan: 1000,
            follow:this.snake.head,
        }).setFrequency(150,[1]).setDepth(1);*/
    }


    gameOver(){
        const ourStartScene = this.scene.get('StartScene');

        //style
        const finalScoreStyle = {
            color: "white",
            //"text-shadow": "2px 2px 4px #000000",
            "font-size":'22px',
            "font-weight": 400,
            "text-align": 'right',
            "white-space": 'pre-line'
        }

        //GAME OVER
        this.add.dom(SCREEN_WIDTH/2, Y_OFFSET + GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
            "text-shadow": "4px 4px 0px #000000",
            "font-size":'32px',
            'font-weight': 400,
            'text-align': 'center',
            'text-transform': 'uppercase',
            "font-family": '"Press Start 2P", system-ui',
            })).setHTML(
                `GAME OVER`
        ).setOrigin(0.5, 0).setScale(.5).setScrollFactor(0);

        

        //PRESS SPACE TO CONTINUE TEXT
        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            const ourGameScene = this.scene.get('GameScene');
            var _continue_text = '[SPACE TO CONTINUE]';

            var _continueText = this.add.dom(SCREEN_WIDTH/2, GRID * 17,'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize":'32px',
                "font-family": '"Press Start 2P", system-ui',
                "text-shadow": "4px 4px 0px #000000",
                }
            )).setText(_continue_text).setOrigin(0.5,0).setScale(.5).setDepth(25).setInteractive();

 
            this.tweens.add({
                targets: _continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });

            const onContinue = function () {
                ourGameScene.scene.start('MainMenuScene');
            }
            this.input.keyboard.on('keydown-SPACE', function() { 
                onContinue();
            });

            _continueText.on('pointerdown', e => {
                onContinue();
            });
        }, [], this);



        
    }

    tempStartingArrows(){
        if (!this.map.hasTileAtWorldXY(this.snake.head.x, this.snake.head.y -1 * GRID)) {
            this.startingArrowsAnimN2 = this.add.sprite(this.snake.head.x + GRID/2, this.snake.head.y - GRID).setDepth(52).setOrigin(0.5,0.5);
            this.startingArrowsAnimN2.play('startArrowIdle');
        }
        if (!this.map.hasTileAtWorldXY(this.snake.head.x, this.snake.head.y +1 * GRID)) {
            this.startingArrowsAnimS2 = this.add.sprite(this.snake.head.x + GRID/2, this.snake.head.y + GRID * 2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimS2.flipY = true;
            this.startingArrowsAnimS2.play('startArrowIdle');
        }
        if (!this.map.hasTileAtWorldXY(this.snake.head.x + 1 * GRID, this.snake.head.y)) {
            this.startingArrowsAnimE2 = this.add.sprite(this.snake.head.x + GRID * 2, this.snake.head.y + GRID /2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimE2.angle = 90;
            this.startingArrowsAnimE2.play('startArrowIdle');
        }
        if (!this.map.hasTileAtWorldXY(this.snake.head.x + 1 * GRID, this.snake.head.y)) {
            this.startingArrowsAnimW2 = this.add.sprite(this.snake.head.x - GRID,this.snake.head.y + GRID/2).setDepth(103).setOrigin(0.5,0.5);
            this.startingArrowsAnimW2.angle = 270;
            this.startingArrowsAnimW2.play('startArrowIdle');
        }
    }

    extractPrompt(){
        const ourGameScene = this.scene.get('GameScene');
        ourGameScene.extractMenuOn = true;

        // set menu alpha back to 1
        ourGameScene._menuElements.forEach(textElement =>{
            textElement.setAlpha(1);
        });
        this.extractPromptText.setAlpha(1);
        this.extractPanel.setAlpha(1);

        this.gState = GState.TRANSITION;
        this.snake.head.setTexture('snakeDefault', 0);
        this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);

        // hide the level labels
        this.levelLabelHide = this.tweens.add({
            targets: [...this.blackholeLabels,ourGameScene.r3,ourGameScene.extractText],
            yoyo: false,
            duration: 500,
            ease: 'Linear',
            repeat: 0,
            alpha: 0,
        });
 
        this._selected = this._menuElements[this.exCursorIndex];
    }

    finalScore(nextScene, args){
        const ourStartScene = this.scene.get('StartScene');
        const spaceBoy = this.scene.get("SpaceBoyScene");


        //style
        const finalScoreStyle = {
            color: "white",
            //"text-shadow": "2px 2px 4px #000000",
            "font-size":'22px',
            "font-weight": 400,
            "text-align": 'right',
            "white-space": 'pre-line'
        }


        var scoreCount = 0;
        var extractCode = "";
        var extractRankSum = 0;
        var xOffset = 36;
        var extractHistory = [];

        for (let index = 0; index < spaceBoy.stageHistory.length; index++) {
            var id = spaceBoy.stageHistory[index].getID();
            var _rank = spaceBoy.stageHistory[index].stageRank();
            scoreCount += spaceBoy.stageHistory[index].calcTotal();
            extractRankSum += _rank;
            if (extractCode.length === 0) {
                extractCode = id
            } else {
                extractCode = extractCode + "_" + id;
            }

            var record = [
                _rank,
                id,
                Math.round(scoreCount)];

            extractHistory.push(record);

            var _x = SCREEN_WIDTH/2 - GRID * 6.5 + index * xOffset;

            const stageRank = this.add.sprite(_x ,GRID * 14.0, "ranksSpriteSheet", _rank
            ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');

            var stageID = this.add.dom(_x, GRID * 17, 'div', Object.assign({}, STYLE_DEFAULT,
                finalScoreStyle, {
                })).setHTML(
                    `${id}`
            ).setOrigin(0.5,0).setScale(0.5);
            
        }


        var _x = SCREEN_WIDTH/2 - GRID * 6.5 + (spaceBoy.stageHistory.length) * xOffset;

        var extractRank = extractRankSum / spaceBoy.stageHistory.length; 

        var finalRank = this.add.sprite(_x + GRID * .5,GRID * 14.0, "ranksSpriteSheet", Math.floor(extractRank)
        ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');

        var finalText = this.add.dom(_x + GRID * .5, GRID * 17, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `RANK`
        ).setOrigin(0.5,0).setScale(0.5);

        if (!localStorage.getItem("extractRanks")) {
            // if There is none
            var bestExtractions = new Map()
            bestExtractions.set(extractCode, [...extractHistory])

        } else {
            var bestExtractions = new Map(JSON.parse(localStorage.getItem("extractRanks")))

            if (bestExtractions.has(extractCode)) {
                var prevBest = bestExtractions.get(extractCode);
                var prevSum = 0;

                prevBest.forEach( record => {
                    prevSum += record[0];
                })

                if (prevSum < extractRankSum) {
                    debugger
                    console.log("NEW EXRACT RANKING");
                    
                    bestExtractions.set(extractCode, [...extractHistory]);  
                }

            } else {
                bestExtractions.set(extractCode, [...extractHistory]);
            }
        }

        const tempArray = Array.from(bestExtractions.entries());
        const jsonString = JSON.stringify(tempArray);

        // Stringify the array
        localStorage.setItem("extractRanks", jsonString);


        // Show Best Ranks
        var bestExtract = bestExtractions.get(extractCode);
        var bestSum = 0;

        for (let index = 0; index < bestExtract.length; index++) {

            bestSum += bestExtract[index][0];

            var _x = SCREEN_WIDTH/2 - GRID * 6.5 + index * xOffset;
            
            const bestRank = this.add.sprite(_x ,GRID * 18.0, "ranksSpriteSheet", bestExtract[index][0]
            ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');
            
        }
        var _x = SCREEN_WIDTH/2 - GRID * 6.5 + (bestExtract.length) * xOffset;

        var bestExtractRank = bestSum / bestExtract.length; 

        var finalRank = this.add.sprite(_x + GRID * .5,GRID * 18.0, "ranksSpriteSheet", Math.floor(bestExtractRank)
        ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');




        this.extractHole[0].play('extractHoleClose');

        this.tweens.add({
            targets: this.snake.body, 
            yoyo: false,
            duration: 500,
            ease: 'Linear',
            repeat: 0,
            alpha: 0,
            delay: this.tweens.stagger(30),
        });
        



        //EXTRACTION COMPLETE
        this.add.dom(SCREEN_WIDTH/2, Y_OFFSET + GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
            "text-shadow": "4px 4px 0px #000000",
            "font-size":'32px',
            'font-weight': 400,
            'text-align': 'center',
            'text-transform': 'uppercase',
            "font-family": '"Press Start 2P", system-ui',
            })).setHTML(
                `EXTRACTION COMPLETE`
        ).setOrigin(0.5, 0).setScale(.5).setScrollFactor(0);

        //nineSlice
        this.finalScorePanel = this.add.nineslice(SCREEN_WIDTH/2, Y_OFFSET + GRID * 8.5, 
            'uiPanelL', 'Glass', 
            GRID * 17, GRID * 12, 
            8, 8, 8, 8);
        this.finalScorePanel.setDepth(60).setOrigin(0.5,0).setScrollFactor(0);


        //FINAL SCORE LABEL
        const finalScoreLableUI = this.add.dom(SCREEN_WIDTH/2 - GRID * 0.5, GRID * 12.5, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `FINAL SCORE:`
        ).setOrigin(1,0).setScale(0.5);

        const bestRanksLableUI = this.add.dom(SCREEN_WIDTH/2 - GRID * 0.5, GRID * 21.5, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `BEST EXTRACTION`
        ).setOrigin(0.5,0).setScale(0.5);
        
        var _totalScore = 0

        this.scene.get("SpaceBoyScene").stageHistory.forEach( stageData => {
            _totalScore += stageData.calcTotal();
        });
        _totalScore = Math.floor(_totalScore); //rounds down to whole number
        const formattedScore = _totalScore.toLocaleString();

        //FINAL SCORE VALUE
        const finalScoreUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 0.5, GRID * 12.5, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `${formattedScore}`
        ).setOrigin(0,0).setScale(0.5);

        //PRESS SPACE TO CONTINUE TEXT
        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            const ourGameScene = this.scene.get('GameScene');
            var _continue_text = '[SPACE TO CONTINUE]';

            var _continueText = this.add.dom(SCREEN_WIDTH/2, SCREEN_HEIGHT - GRID * 6,'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize":'32px',
                "font-family": '"Press Start 2P", system-ui',
                "text-shadow": "4px 4px 0px #000000",
                }
            )).setText(_continue_text).setOrigin(0.5,0).setScale(.5).setDepth(25).setInteractive();

 
            this.tweens.add({
                targets: _continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });

            const onContinue = function () {
                if (ourGameScene.electronFanfare) {
                    ourGameScene.electronFanfare.setAlpha(0);
                }
                if (ourGameScene.CapSparkFinale) {
                    ourGameScene.CapSparkFinale.setAlpha(0);
                }
                ourGameScene.scene.get("SpaceBoyScene").stageHistory = [];
                ourGameScene.scene.get("PersistScene").coins = START_COINS;
                ourGameScene.scene.start(nextScene, args); 
            }
            this.input.keyboard.on('keydown-SPACE', function() { 
                onContinue();
            });

            _continueText.on('pointerdown', e => {
                onContinue();
            });
        }, [], this);



        
    }

    warpToMenu(){

        const ourPersist = this.scene.get('PersistScene');


        //dim UI
        this.time.delayedCall(1000, event => {
            const ourGameScene = this.scene.get('GameScene');
            this.tweens.add({
                targets: [ourGameScene.countDown,ourGameScene.coinUIText],
                alpha: { from: 1, to: 0},
                ease: 'Sine.InOut',
                duration: 500,
                });
        });

        this.tweens.add({
            targets: this.extractLables,
            alpha: 0,
            yoyo: false,
            duration: 50,
            ease: 'linear',
            repeat: 0,
        });

        //This tween doesn't playout yet, but it holds the onComplete to reset to main menu
        this.tweens.add({
            targets: this.cameras.main,
            duration: 3000,
            ease: 'Sine.In',
            delay: 1000,
            onComplete: () =>{
                //TODO: reset back to stage 1
                this.scene.start('MainMenuScene');//start shuts down this scene and runs the given one
            }
        });
        
        
    }
    
 
    warpToNext(nextStageIndex) {

        const ourPersist = this.scene.get('PersistScene');
        this.gState = GState.TRANSITION;

        ourPersist.comboCover.setVisible(true);
        this.scoreTweenShow();

        this.snake.head.setTexture('snakeDefault', 0);

        if (this.helpPanel) {
            this.tweens.add({
                targets: [this.helpPanel,this.helpText],
                alpha: { from: 1, to: 0},
                ease: 'Sine.InOut',
                duration: 500,
                });
        }



        //dim UI
        this.time.delayedCall(1000, event => {
            const ourGameScene = this.scene.get('GameScene');
            this.tweens.add({
                targets: [ourGameScene.countDown,ourGameScene.coinUIText],
                alpha: { from: 1, to: 0},
                ease: 'Sine.InOut',
                duration: 500,
                });
        });

        var wallSprites = [];
        var fadeOutSprites = []; 
        var groundSprites = [];

        // Camera Pan Logic

        var centerLocation = new Phaser.Math.Vector2(X_OFFSET + GRID * 14,Y_OFFSET + GRID * 13)
        var blackholeLocation = new Phaser.Math.Vector2(this.snake.head.x,this.snake.head.y)

        var camDirection = new Phaser.Math.Vector2((blackholeLocation.y - centerLocation.y),(blackholeLocation.x - centerLocation.x));

        this.wallLayer.culledTiles.forEach( tile => {

            var _sprite = this.add.sprite(tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET, 'tileSprites', tile.index - 1,
            ).setOrigin(0,0).setDepth(20);
            _sprite.setPipeline('Light2D')

            
            if (FADE_OUT_TILES.includes(tile.index)) {
                fadeOutSprites.push(_sprite);
            } else {
                wallSprites.push(_sprite);
            }               
            
        });
        if (this.groundLayer != undefined) {
            this.groundLayer.culledTiles.forEach( tile => {

                var _spriteGround = this.add.sprite(tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET, 'tileSprites', tile.index - 1,
                ).setOrigin(0,0).setDepth(20);
                //_spriteGround.setTint(0xaba2d8);
                _spriteGround.setPipeline('Light2D');
                
                if (FADE_OUT_TILES.includes(tile.index)) {
                    fadeOutSprites.push(_spriteGround);
                } else {
                    groundSprites.push(_spriteGround);
                }    
                Phaser.Actions.Shuffle(groundSprites)
            });
            this.groundLayer.visible = false;
        }
        

        this.wallLayer.visible = false;
        this.wallLayerShadow.visible = false;
        

        Phaser.Utils.Array.Shuffle(wallSprites);
        
        var allTheThings = [
            ...this.coinsArray,
            ...this.portals,
            ...this.atoms,
            ...wallSprites,
        ];

        //turn off portal particles and any portal sprites
        if (this.portalParticles != undefined) {
            this.portalParticles.forEach(portalParticles => { 
                portalParticles.stop();
            });
            this.snakePortalingSprites.forEach(snakePortalingSprite => { 
                snakePortalingSprite.visible = false;
            });
            
        }
        
        var snakeholeTween = this.tweens.add({
            targets: this.snake.body, 
            x: this.snake.head.x,
            y: this.snake.head.y,
            yoyo: false,
            duration: 500,
            ease: 'Sine.easeOutIn',
            repeat: 0,
            delay: this.tweens.stagger(30),
            alpha: 0
        });

        //this.barrel = this.cameras.main.postFX.addBarrel([barrelAmount])
        var popVolume = 1.0

        var fadeoutTween = this.tweens.add({
            targets: fadeOutSprites,
            alpha: 0,
            duration: 1000,
            ease: 'linear'
            }, this);

        var blackholeTween = this.tweens.add({
            targets: allTheThings, 
            x: this.snake.head.x - GRID * 1,
            y: this.snake.head.y + GRID * 1,
            //x: {from: this.snake.head.x + Phaser.Math.RND.integerInRange(-40,40),to: this.snake.head.x},
            //y: {from: this.snake.head.y + Phaser.Math.RND.integerInRange(-40,40),to: this.snake.head.y},
            yoyo: false,
            duration: 600,
            ease: 'Sine.in',
            repeat: 0,
            delay: this.tweens.stagger(60),
            alpha: {from: 5, to: 0},
            rotation: 5,
            onDelay: () =>{
                if (allTheThings.length > 150) {
                    blackholeTween.timeScale += .04;
                }
                else{
                    blackholeTween.timeScale += .02;
                }
                this.sound.play('pop03', { volume: popVolume });
                if (popVolume >= 0.00) {
                    popVolume -= .005
                }
            },
            onComplete: () =>{
                this.nextStagePortals.forEach( blackholeImage=> {
                    if (blackholeImage != undefined) {
                        blackholeImage.play('blackholeClose')
                        ourPersist.bgCoords.x += camDirection.y/2;
                        ourPersist.bgCoords.y += camDirection.x/2;
                    }
                });
                var cameraPanTween = this.tweens.add({
                    targets: this.cameras.main,
                    scrollX: camDirection.y * 10,
                    scrollY: camDirection.x * 10,
                    duration: 1000,
                    ease: 'Sine.In',
                    delay: 500,
                    onComplete: () =>{
                        this.nextStage(STAGES.get(this.nextStages[nextStageIndex]), camDirection);
                    }
                });
            }
        });

        var blackholeTweenGround = this.tweens.add({
            targets: groundSprites, 
            x: this.snake.head.x - GRID * 1,
            y: this.snake.head.y + GRID * 1,
            yoyo: false,
            duration: 600,
            ease: 'Sine.in',
            repeat: 0,
            delay: this.tweens.stagger(20),
            alpha: {from: 5, to: 0},
            rotation: 5,
            onDelay: () =>{
                if (groundSprites.length > 250) {
                    blackholeTweenGround.timeScale += .06;
                }
                if (groundSprites.length > 150) {
                    blackholeTweenGround.timeScale += .05;
                }
                else{
                    blackholeTweenGround.timeScale += .03;
                }
            }
        });

        var blackholeTweenGround = this.tweens.add({
            targets: this.blackholeLabels,
            alpha: 0,
            yoyo: false,
            duration: 50,
            ease: 'linear',
            repeat: 0,
            delay: this.tweens.stagger(150),
        });



        snakeholeTween.on('complete', () => {
            var cameraZoomTween = this.tweens.add({
                targets: this.map,
                alpha: {from: 1, to: 0},
                duration: 500,
                ease: 'Sine.InOut',
                zoom: 1 //switched to 1 from 10 to quickly remove it. nextStage() needs to run from somewhere else once removed.
                });
            cameraZoomTween.on('complete', ()=>{
            })
            
        });
                    
    }

    currentScoreTimer() {
        /**
         * Number between MAX_SCORE and MIN_SCORE.
         * Always an Integer
         */
        return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;
    }
    
    applyMask(){ // TODO: move the if statement out of this function also move to Snake.js
        if (this.tiledProperties.has("dark")) {
            this.snake.body[this.snake.body.length -1].mask = new Phaser.Display.Masks.BitmapMask(this, this.lightMasksContainer);
        }
    }

    vortexIn(target, x, y){

        this.vortexTween = this.tweens.add({
            targets: target, 
            x: x, //this.pathRegroup.vec.x,
            y: y, //this.pathRegroup.vec.y,
            yoyo: false,
            duration: 500,
            ease: 'Sine.easeOutIn',
            repeat: 0,
            delay: this.tweens.stagger(30)
        });

        return this.vortexTween
    }

    snakeEating(){
        this.snakeEatingTween = this.tweens.add({
            targets: this.snake.body, 
            scale: [1.25,1],
            yoyo: false,
            duration: 64,
            ease: 'Linear',
            repeat: 0,
            delay: this.tweens.stagger(this.speedSprint),
        });

        return this.snakeEating
    }
    onEat(food) {

        
        // Moves the eaten atom after a delay including the electron.
        

    }
    onBonk() {
        var ourPersist = this.scene.get("PersistScene");
        ourPersist.loseCoin();
        this.coinsUIIcon.setVisible(false);
        ourPersist.coins += -1;
        this.coinUIText.setHTML(
            `${commaInt(ourPersist.coins).padStart(2, '0')}`
        );
    }
    checkWinCon() { // Returns Bool
        if (this.lengthGoal > 0) { // Placeholder check for bonus level.
            return this.length >= this.lengthGoal
        }
        
    }

    checkLoseCon() {
        if (this.lengthGoal > 0) { // Placeholder check for bonus level.
            const ourPersist = this.scene.get("PersistScene");
            return ourPersist.coins < 0;
        } else {
            return this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 === 1; 
        }
        
    }

    nextStage(stageName,camDirection) {
        const ourInputScene = this.scene.get("InputScene");
        this.camDirection = camDirection

        
        //console.log(STAGE_UNLOCKS['start'].call());
        //console.log(STAGE_UNLOCKS['babies-first-wall'].call());

        // #region Check Unlocked
        //*
        
        var unlockedLevels = [];
        
        

        var nextStage = "";
        if (unlockedLevels.length > 0 ) {
            nextStage = Phaser.Math.RND.pick(unlockedLevels);
        } else {
            /**
             * If a slug is not set up properly it will try to load the next 
             * directly from the Tiled map properties.
             */
            nextStage = Phaser.Math.RND.pick(this.nextStages);
        }



        
    
        this.scene.restart( { 
            stage: stageName, 
            score: this.nextScore, 
            lives: this.lives, 
            startupAnim: false,
            camDirection: this.camDirection
        });
        ourInputScene.scene.restart();

        // Mainmenu Code @holden
        //ourMainMenuScene.scene.restart( {
        //    startingAnimation: "menuReturn"
        //});


    }

    scoreTweenShow(){
            this.tweens.add({
                targets: this.UIScoreContainer,
                y: (0),
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
                this.tweens.add({
                targets: this.scorePanel,
                height: 39,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
              this.tweens.add({
                targets: [this.bestScoreLabelUI, this.bestScoreUI],
                alpha: 1,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
    }
    scoreTweenHide(){
        if (this.UIScoreContainer.y === 0) {
            this.tweens.add({
                targets: this.UIScoreContainer,
                y: (-11),
                ease: 'Sine.InOut',
                duration: 800,
                repeat: 0,
                yoyo: false
              });
            this.tweens.add({
                targets: this.scorePanel,
                height: 28,
                ease: 'Sine.InOut',
                duration: 800,
                repeat: 0,
                yoyo: false
              });
            this.tweens.add({
                targets: [this.bestScoreLabelUI, this.bestScoreUI],
                alpha: 1,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
              });
        }
    }

    

    comboBounce(){
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            y: { from: GRID * 1.25, to: GRID * 0 },
            ease: 'Sine.InOut',
            duration: 200,
            repeat: 0,
            delay: this.tweens.stagger(60),
            yoyo: true
            });
    }
    comboAppear(){
        //console.log("appearing");
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 300,
            repeat: 0,
        });
        this.comboActive = true;
        }
    comboFade(){
        //console.log("fading")
        this.tweens.add({
            targets: [this.letterC,this.letterO, this.letterM, this.letterB, 
                this.letterO2, this.letterExplanationPoint], 
            alpha: { from: 1, to: 0 },
            ease: 'Sine.InOut',
            duration: 500,
            repeat: 0,
        });
        this.comboActive = false;
        this.comboCounter = 0;
    }

    getStaggerTween (i, group)
    {
        const stagger = this.variations[i];
        
        this.tweens.add({
            targets: group.getChildren(),
            scale: [2,0],
            alpha: [.5,0],
            ease: 'power2',
            duration: 800,
            delay: this.tweens.stagger(...stagger),
            completeDelay: 1000,
            repeat: 0,
            onComplete: () =>
            {
                group.getChildren().forEach(child => {

                    child.destroy();

                });
            }
        }); 
    }

    // #region Game Update
    update (time, delta) {


        const ourInputScene = this.scene.get('InputScene');
        // console.log("update -- time=" + time + " delta=" + delta);

        
        // Floating Electrons
        /*this.atoms.forEach(atom=> {
            atom.electrons.originY = atom.originY + .175
            
        });*/
        

        if (this.gState === GState.PORTAL || this.gState === GState.BONK) { 
            // ?: does this need to happen every frame? Probably because you can move mid frame and the light needs to follow you.
            
            this.snake.snakeLight.x = this.snake.head.x
            this.snake.snakeLight.y = this.snake.head.y

            this.snakeMask.x = this.snake.head.x
            this.snakeMask.y = this.snake.head.y

            this.staggerMagnitude -= 0.5
            //this.curveRegroup.x = GRID * 15
            //this.curveRegroup.y = GRID * 15
            
        }
        


        // #region Hold Reset
        if (this.spaceKey.getDuration() > RESET_WAIT_TIME 
            && this.pressedSpaceDuringWait 
            && this.gState === GState.WAIT_FOR_INPUT
            && !this.winned
        ) {
                console.log("SPACE LONG ENOUGH BRO");
 
                this.events.off('addScore');

 
                this.lives -= 1;
                this.scene.restart( { score: this.stageStartScore, lives: this.lives });
        }

        

        // #region Bonk and Regroup
        if (this.gState === GState.BONK) {
            /***  
             * Checks for Tween complete on each frame.
             * on. ("complete") is not run unless it is checked directly. It is not on an event listener
            ***/ 
            
            this.tweenRespawn.on('complete', () => {

                
                if (this.scene.get("PersistScene").coins > 0) {
                    this.coinsUIIcon.setVisible(true)
                }

                // Turn back on arrows
                //this.startingArrowState = true;
                if (this.startingArrowsAnimN != undefined){
                this.startingArrowsAnimN.setAlpha(1)
                }
                
                if (this.startingArrowsAnimS != undefined){
                this.startingArrowsAnimS.setAlpha(1);
                }
                if (this.startingArrowsAnimE != undefined){
                this.startingArrowsAnimE.setAlpha(1);
                }
                if (this.startingArrowsAnimW != undefined){
                this.startingArrowsAnimW.setAlpha(1);
                }
                
                this.gState = GState.WAIT_FOR_INPUT;
                this.scoreTimer.paused = true;
                //console.log(this.gState, "WAIT FOR INPUT");
            });
        }
        
        // #region Win State
        if (this.checkWinCon() && !this.winned) {

            console.log("YOU WIN" , this.stage);
            this.winned = true;
            this.atoms.forEach(atom => {
                // So you can't see them during free play.
                atom.electrons.visible = false;
            })

            //this.scoreUI.setText(`Stage: ${this.scoreHistory.reduce((a,b) => a + b, 0)}`); //commented out as it double prints
            this.gState = GState.TRANSITION;
            this.snake.direction = DIRS.STOP;
            //slowmo comment
            //this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);


            this.events.off('addScore');

            this.scene.launch('ScoreScene');
            this.setWallsPermeable();
        }

        // #region Lose State
        if (this.checkLoseCon() && this.canContinue) {
            this.canContinue = false;
            this.gState = GState.TRANSITION;
            this.snake.direction = DIRS.STOP;
            this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);
            this.events.off('addScore');
            this.events.off('spawnBlackholes');
            this.gameOver();

        }


        // #endregion


        /*if (this.gState === GState.START_WAIT) { // @holden we still need this?
            if (energyAmountX > 99 && !this.chargeUpTween.isDestroyed()) {
                this.chargeUpTween.resume();
            }
        }*/


        if(time >= this.lastMoveTime + this.moveInterval && this.gState === GState.PLAY) {
            this.lastMoveTime = time;

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

            /*if (this.starEmitterFinal) {
                this.starEmitterFinal.x = this.snake.head.x
                this.starEmitterFinal.y = this.snake.head.y
            }*/
 
            

            if (this.portals.length > 0) {
            
            // #region P HIGHLIGHT
            // Calculate Closest Portal to Snake Head
            let closestPortal = Phaser.Math.RND.pick(this.portals); // Start with a random portal
                
            
                closestPortal.fx.setActive(false);
                
                // Distance on an x y grid

                var closestPortalDist = Phaser.Math.Distance.Between(this.snake.head.x/GRID, this.snake.head.y/GRID, 
                                                                    closestPortal.x/GRID, closestPortal.y/GRID);

                this.portals.forEach( portal => {

                    // Add here a for loop that goes through the five lights and continues with the shortest distance
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
            
       
            if (DEBUG) {
                
                if (timeTick < SCORE_FLOOR ) {

                    
                } else {
                    this.atoms.forEach( fruit => {
                        fruit.fruitTimerText.setText(timeTick);
                    });
                }
                
            } 
            
            
            if (this.gState === GState.PLAY) {

                if (!this.winned) {
                    this.time.delayedCall(1000, event => {
                        this.scoreTweenHide(); 
                    }); 
                }
                

                // Move at last second
                this.snake.move(this);
                
                if (ourInputScene.moveHistory[ourInputScene.moveHistory.length - 1][0] === `s${this.moveInterval}` ) {
                    ourInputScene.moveHistory[ourInputScene.moveHistory.length - 1][1] += 1;
                } else {
                    ourInputScene.moveHistory.push([ `s${this.moveInterval}`, 1 ]);
                }
                //ourInputScene.moveHistory.push([(this.snake.head.x - X_OFFSET)/GRID, (this.snake.head.y - Y_OFFSET)/GRID , this.moveInterval]);
                ourInputScene.moveCount += 1;
                

                this.snakeCriticalState();
                

                if (this.boostEnergy < 1) {
                    // add the tail in.
                    this.boostOutlinesBody.push(this.boostOutlineTail);
    
                    this.boostOutlinesBody.forEach(boostOutline =>{
                        var fadeoutTween = this.tweens.add({
                            targets: boostOutline,
                            alpha: 0,
                            duration: 340,
                            ease: 'linear',
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
        

        var timeTick = this.currentScoreTimer()
      
        
        // #region Bonus Level Code @james TODO Move to custom Check Win Condition level. // @james do I even need this anymore?
        if (timeTick < SCORE_FLOOR && this.lengthGoal === 0){
            // Temp Code for bonus level
            console.log("YOU LOOSE, but here if your score", timeTick, SCORE_FLOOR);

            this.scoreUI.setText(`Stage ${this.scoreHistory.reduce((a,b) => a + b, 0)}`);
            this.bestScoreUI.setText(`Best  ${this.score}`);

            this.scene.pause();

            this.scene.start('ScoreScene');
        }
        // #endregion

        if (!this.checkWinCon() && !this.scoreTimer.paused) {
            /***
             * This is out of the Time Tick Loop because otherwise it won't pause 
             * correctly during portaling. After the timer pauses at the Score Floor
             *  the countdown timer will go to 0.  
             *  -Note: I could fix this with a Math.max() and put it back together again. It would be more efficient. 
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

                if (this.coinSpawnCounter < 1 && this.spawnCoins) {
                    console.log("COIN TIME YAY. SPAWN a new coin");

                    var validLocations = this.validSpawnLocations();
                    var pos = Phaser.Math.RND.pick(validLocations);

                    var _coin = new Coin(this, this.coinsArray, pos.x, pos.y);
                    this.interactLayer[(pos.x - X_OFFSET)/GRID][(pos.y - Y_OFFSET)/GRID] = _coin;
                    
                    _coin.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);


                    
                    this.coinsArray.push(_coin);

                    this.coinSpawnCounter = Phaser.Math.RND.integerInRange(80,140);
                }
            }

            // Update Atom Animation.
            if (GState.PLAY === this.gState && !this.winned) {
                switch (timeTick) {
                    case this.maxScore:  // 120 {}
                    this.atoms.forEach(atom => {
                        if (atom.anims.currentAnim.key !== 'atom01idle' ||atom.anims.currentAnim.key !== 'atom05spawn') {
                            atom.play("atom01idle");
                        }
                    
                        if (atom.electrons.anims.currentAnim.key !== 'electronIdle') {
                            atom.electrons.play("electronIdle");
                            atom.electrons.anims.msPerFrame = 66;
                        }
                    });
                        break;
                    
                    case 110: 
                        this.atoms.forEach( atom => {
                            atom.electrons.anims.msPerFrame = 112;
                        });
                        break;
                    

                    
    
                    case BOOST_ADD_FLOOR: // 100 - should be higher imo -James
                        this.atoms.forEach( atom => {
                            atom.play("atom02idle");
                            atom.electrons.play("electronDispersion01");
                        });
                        break;
    
                    case 60: // Not settled 
                        this.atoms.forEach( atom => {
                            atom.play("atom03idle");
                        });
                        break;
                    
                    case SCORE_FLOOR: // 1
                        this.atoms.forEach( atom => {
                            atom.play("atom04idle");
                        });
            
                    default:
                        break;
                }
                
            }
            
        }
        
        


        
        
        if (GState.PLAY === this.gState) {
            if (ourInputScene.spaceBar.isDown) {
                // Has Boost Logic, Then Boost
                //console.log(this.boostEnergy);
                if(this.boostEnergy > 0){
                    this.moveInterval = this.speedSprint;
                    
                    if (!this.winned) {
                        // Boost Stats
                        ourInputScene.boostTime += 6;
                        //this.boostMask.setScale(this.boostEnergy/1000,1);

                        this.boostEnergy = Math.max(this.boostEnergy - this.boostCost, 0);
                    } 
                } else{
                    // DISSIPATE LIVE ELECTRICITY
                    //console.log("walking now", this.boostMask.scaleX);
                    this.boostMask.scaleX = 0; // Counters fractional Mask scale values when you run out of boost. Gets rid of the phantom middle piece.
                    this.moveInterval = this.speedWalk;
                }
        
            } else {
                //console.log("spacebar not down");
                this.moveInterval = this.speedWalk; // Less is Faster
                //this.boostMask.setScale(this.boostEnergy/1000,1);
                this.boostEnergy = Math.min(this.boostEnergy + 1, 1000); // Recharge Boost Slowly
            }
            this.boostBarTween.updateTo("scaleX", this.boostEnergy/1000, true);
            this.boostBarTween.updateTo("duration", 30000, true);
        }


        if (this.comboCounter > 0 && !this.comboActive) {
            this.comboAppear();
        }
        else if (this.comboCounter == 0 && this.comboActive){
            this.comboFade();
        }
        if (this.scoreTimer.getRemainingSeconds().toFixed(1) * 10 < COMBO_ADD_FLOOR && this.comboActive) {
            this.comboFade();
        }

    }
    
}




// #region Stage Data
var StageData = new Phaser.Class({

    initialize:
    // ToDo: Add function for mocking stage data when testing the score screen.

    function StageData(props) {
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
        this.sRank = props.sRank;

        this.uuid = props.uuid;
        if (this.slug) { this.slug = props.slug }
        
        this.foodHistory = props.foodHistory;
        this.moveHistory = props.moveHistory;
        this.turnInputs = props.turnInputs;
        this.turns = props.turns;

        //this.medianSpeedBonus = 6000;

    },

    getID() {
        return this.stage.split("_")[1]; // Contents After World
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
            case bonusScore > this.sRank:
                rank = RANKS.PLATINUM;
                break;
            case bonusScore > RANK_BENCHMARKS.get(RANKS.GOLD):
                rank = RANKS.GOLD;
                break;
            case bonusScore > RANK_BENCHMARKS.get(RANKS.SILVER):
                rank = RANKS.SILVER;
                break;
            case bonusScore > RANK_BENCHMARKS.get(RANKS.BRONZE):
                rank = RANKS.BRONZE;
                break;
            default:
                rank = RANKS.WOOD;
        }
        return rank;
        

    },

    preAdditive() {
        return this.calcBase() + calcBonus(this.calcBase());
    },

    zedLevelBonus() {
        return Math.min(this.zedLevel / 1000, 0.099);
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
    comboBonus() {
        var bestCombo = 0;
        var comboCounter = 1;
        this.foodLog.forEach( score => {
            if (score > COMBO_ADD_FLOOR) {
                comboCounter += 1;
                if (comboCounter > bestCombo) {
                    bestCombo = comboCounter;
                }
            } else {
                comboCounter = 1;
            }
        });
    
        return bestCombo * 100;
    },
    boostBonus() {
        return Math.ceil(this.boostFrames / 10) * 5;
    },
    
    calcTotal() {
        var _postMult = this.postMult();
        var _bonkBonus = this.bonkBonus();
        return _postMult + _bonkBonus + this.comboBonus() + this.boostBonus();
    }
    
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
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');
        const ourScoreScene = this.scene.get('ScoreScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourPersist = this.scene.get('PersistScene');
        //bypass scorescene temporarily for slowmo
        //ourGame.events.emit('spawnBlackholes', ourGame.snake.direction);


     

        /*var style = {
            'color': '0x828213'
          };
        ourGame.countDown.style = style*/
        ourGame.countDown.setHTML('0FF');

        this.ScoreContainerL = this.make.container(0,0);
        this.ScoreContainerR = this.make.container(0,0);

        var stageDataJSON = {
            bonks: ourGame.bonks,
            boostFrames: ourInputScene.boostTime,
            cornerTime: Math.floor(ourInputScene.cornerTime),
            diffBonus: ourGame.stageDiffBonus,
            foodHistory: ourGame.foodHistory,
            foodLog: ourGame.scoreHistory,
            medals: ourGame.medals,
            moveCount: ourInputScene.moveCount,
            moveHistory: ourInputScene.moveHistory,
            turnInputs: ourInputScene.turnInputs,
            turns: ourInputScene.turns,
            stage:ourGame.stage,
            uuid:ourGame.stageUUID,
            zedLevel: calcZedLevel(ourPersist.zeds).level,
            zeds: ourPersist.zeds,
            sRank: parseInt(ourGame.tiledProperties.get("sRank")) // NaN if doesn't exist.
        }


        this.stageData = new StageData(stageDataJSON);

        // #region Save Stats
        var _comboCounter = 0;
        this.stageData.foodLog.forEach( score => {
            if (score > COMBO_ADD_FLOOR) {
                _comboCounter += 1;
            } else {
                // Convert from 1 index to zero index.

                if (_comboCounter > 0) {
                    // Signpost problem. You always start with zero combo before you get the first atom
                    PLAYER_STATS.comboHistory[_comboCounter - 1] += 1;
                }
                _comboCounter = 1;
            }
        });

        if (_comboCounter != 1) {
            // Not Triggered the save in the else clause above.
            // Happens when the last atom is part of a combo.
            PLAYER_STATS.comboHistory[_comboCounter - 1] += 1;
        }

        // Update Stage Data
        updatePlayerStats(this.stageData);

        // For properties that may not exist.
        if (ourGame.tiledProperties.has("slug")) {
            this.stageData.slug = ourGame.tiledProperties.get("slug");
        }
        
        console.log(JSON.stringify(this.stageData));

        this.scene.get("SpaceBoyScene").stageHistory.push(this.stageData);
    

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
            var bestScoreValue = this.stageData.calcBase()

            this.stageData.newBest = true;

            
            if (ourGame.stageUUID != "00000000-0000-0000-0000-000000000000") {
                localStorage.setItem(`${ourGame.stageUUID}-bestStageData`, JSON.stringify(this.stageData));
            }
            
        }
        else{
            bestScoreValue = 0;
        }

        // #endregion

        // SOUND
        this.rankSounds = [];

        SOUND_RANK.forEach(soundID => {
            this.rankSounds.push(this.sound.add(soundID[0]));
            });

        // Pre Calculate needed values
        var stageAve = this.stageData.calcBase() / this.stageData.foodLog.length;

        if (localStorage.getItem(`${ourGame.stageUUID}-bestStageData`)) {
            var bestLogJSON = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}-bestStageData`));

        } else {
            // If a test level. Use World 0_1 as a filler to not break UI stuff.
            var bestLogJSON = JSON.parse(localStorage.getItem(`${START_UUID}-bestStageData`))
        }

        var bestLog = new StageData(bestLogJSON);
    
        var bestLocal = bestLog.calcBase();
        var bestAve = bestLocal/bestLog.foodLog.length;

        // TODO: Don't do it a bonuse level? What do we do with the stage history on bonus levels?
        // Exclude from the Stage history?

        var bestrun = Number(JSON.parse(localStorage.getItem(`BestFinalScore`)));

        // #region StageAnalytics

        // Set Zed Dimension
        var dimensionSlug;

        if (this.stageData.zedLevel > 9) {
            dimensionSlug = `${Math.floor(this.stageData.zedLevel/10) * 10}s`;
        } else if ( this.stageData.zedLevel > 4) {
            dimensionSlug = "05-09";
        } else {
            dimensionSlug = `0${this.stageData.zedLevel}`;
        }
        

        

        // Panels

        this.scorePanelL = this.add.nineslice(X_OFFSET +GRID * 4.75, GRID * 7.75, 
            'uiPanelL', 'Glass', 
            GRID * 12, GRID * 11.5, 
            8, 8, 8, 8);
        this.scorePanelL.setDepth(10).setOrigin(0,0)

        this.scorePanelLRank = this.add.nineslice(-SCREEN_WIDTH/2, GRID * 17.5 +2, 
            'uiPanelL', 'Glass', 
            GRID * 3, GRID * 4, 
            8, 8, 8, 8);
        this.scorePanelLRank.setDepth(11).setOrigin(.5,.5);

        this.scorePanelR = this.add.nineslice(GRID * 17.25, GRID * 7.75, 
            'uiPanelR', 'Glass', 
            GRID * 11.25, GRID * 11.5, 
            8, 8, 8, 8);
        this.scorePanelR.setDepth(10).setOrigin(0,0)

        var scrollArrowDown = this.add.sprite(GRID * 22.25, GRID * 19 +4,'downArrowAnim').play('downArrowIdle').setDepth(21).setOrigin(0,0);

        //megaAtlas code reference
        //this.add.image(GRID * 2,GRID * 8,'megaAtlas', 'UI_ScoreScreenBG01.png').setDepth(20).setOrigin(0,0);
        //this.add.image(0,GRID * 26.5,'megaAtlas', 'UI_ScoreScreenBG02.png').setDepth(9).setOrigin(0,0);
        /*ourGame.continueBanner = ourGame.add.image(X_OFFSET,GRID * 26.5,'scoreScreenBG2').setDepth(49.5).setOrigin(0,0).setScale(1);

        // Scene Background Color
        ourGame.stageBackGround = ourGame.add.rectangle(X_OFFSET, Y_OFFSET, GRID * 29, GRID * 27, 0x323353, .75);
        ourGame.stageBackGround.setOrigin(0,0).setDepth(49);
        ourGame.stageBackGround.alpha = 0;

        ourGame.bgTween = ourGame.tweens.add({ // @holden Still need this?
            targets: [ourGame.stageBackGround, ourGame.continueBanner],
            alpha: 1,
            yoyo: false,
            loop: 0,
            duration: 200,
            ease: 'sine.inout'
        });*/

        this.scoreTimeScale = .25;

        //STAGE CLEAR
        this.time.delayedCall(100, () => {
            this.add.dom(SCREEN_WIDTH/2, GRID * 5, 'div', Object.assign({}, STYLE_DEFAULT, {
                "text-shadow": "4px 4px 0px #000000",
                "font-size": '32px',
                'font-weight': 400,
                'text-align': 'center',
                'text-transform': 'uppercase',
                "font-family": '"Press Start 2P", system-ui',
            })).setHTML(
                `${this.stageData.stage} CLEAR`
            ).setOrigin(0.5, 0).setScale(.5);
        });
        

        
        // #region Main Stats

        const scorePartsStyle = {
            color: "white",
            //"text-shadow": "2px 2px 4px #000000",
            "font-size":'16px',
            "font-weight": 400,
            "text-align": 'right',
            "white-space": 'pre-line'
        }
        
        const preAdditiveLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*2, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `BASE SCORE:
                SPEED BONUS:`
        ).setOrigin(1, 0).setScale(0.5);

        var preAdditiveBaseScoreUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML( //_baseScore, then _speedbonus, then _baseScore + _speedbonus
                `${commaInt(0)}</span>`
        ).setOrigin(1, 0).setScale(0.5);

        var preAdditiveSpeedScoreUI1 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML( //_baseScore
                `
                <span style="color:${COLOR_FOCUS};font-weight:600;">+${commaInt(0)}</span>
                `
        ).setOrigin(1, 0).setScale(0.5);

        var preAdditiveSpeedScoreUI2 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 10.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML( //_baseScore + _speedbonus
                `
                
                <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(0)}</span>`
        ).setOrigin(1, 0).setScale(0.5);

        var frameTime = 16.667

        var _baseScore = this.stageData.calcBase();
        var _speedbonus = calcBonus(this.stageData.calcBase());

        var atomList = this.stageData.foodLog.slice();
        
        var delayStart = 600;

        this.tweens.addCounter({
            from: 0,
            to: _baseScore,
            duration: atomList.length * (frameTime * 4) * this.scoreTimeScale, //66.7ms
            ease: 'Sine.InOut',
            delay: delayStart,
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                preAdditiveBaseScoreUI.setHTML(
                    `${commaInt(value)}</span>`
            ).setOrigin(1, 0).setScale(0.5);
            }
        });

        this.tweens.addCounter({
            from: 0,
            to:  _speedbonus,
            duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
            ease: 'Sine.InOut',
            delay: atomList.length * (frameTime * 4) * this.scoreTimeScale + delayStart, //66.7ms
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                preAdditiveSpeedScoreUI1.setHTML(
                    `
                <span style="color:${COLOR_FOCUS};font-weight:600;">+${commaInt(value)}</span>
                `
            ).setOrigin(1, 0).setScale(0.5);
            },
            onComplete: () => {
                //SFX
                this.tweens.add({ 
                    targets: preAdditiveSpeedScoreUI2,
                    alpha: 0,
                    ease: 'Linear',
                    duration: 250,
                    loop: 0,
                    yoyo: true,
                });
                preAdditiveSpeedScoreUI2.setHTML(
                    `
                
                <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(_baseScore + _speedbonus)}</span>`
            )}
        });

        /*this.tweens.addCounter({
            from: 0,
            to:  _speedbonus,
            duration: atomList.length * 66.7,
            ease: 'linear',
            delay:atomList.length * 100,
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                preAdditiveSpeedScoreUI2.setHTML(
                    `
                
                <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(_baseScore + value)}</span>`
            ).setOrigin(1, 0);
            }
        });*/
        

        var multLablesUI1 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 13.625, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                `DIFFICULTY +${0}%


                `
        ).setOrigin(1,0).setScale(0.5);
        var multLablesUI2 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 13.625, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                `
                ZED LVL +${0}%

                `
        ).setOrigin(1,0).setScale(0.5);
        var multLablesUI3 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 13.625, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                `

                MEDAL +${0}%
                `
        ).setOrigin(1,0).setScale(0.5);
        
        this.tweens.addCounter({
            from: 0,
            to:  ourScoreScene.stageData.diffBonus,
            duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
            ease: 'linear',
            delay: atomList.length * (frameTime * 8) * this.scoreTimeScale + delayStart, //133.3ms
            onUpdate: tween =>
            {
                const value1 = Math.round(tween.getValue());
                multLablesUI1.setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                    `DIFFICULTY +${value1}%

                    `
                
            ).setOrigin(1, 0).setScale(0.5);
            }
        });
        this.tweens.addCounter({
            from: 0,
            to:  Number(ourScoreScene.stageData.zedLevelBonus() * 100).toFixed(2),
            duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
            ease: 'linear',
            delay: atomList.length * (frameTime * 8) * this.scoreTimeScale + delayStart, //133.3ms
            onUpdate: tween =>
            {
                const value2 = tween.getValue().toFixed(1);
                multLablesUI2.setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                    `
                    ZED LVL +${value2}%

                    `
                
            ).setOrigin(1, 0).setScale(0.5);
            }
        });
        this.tweens.addCounter({
            from: 0,
            to:  ourScoreScene.stageData.medalBonus() * 100,
            duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
            ease: 'linear',
            delay: atomList.length * (frameTime * 8) * this.scoreTimeScale + delayStart, //133.3ms
            onUpdate: tween =>
            {
                const value3 = Math.round(tween.getValue());
                multLablesUI3.setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                    `

                    MEDAL +${value3}%
                    `
            ).setOrigin(1, 0).setScale(0.5);
            }
        });
        
        var _bonusMult = this.stageData.bonusMult();
        var _postMult = this.stageData.postMult();

        const multValuesUI1 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 13.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `x ${0}%
                `
        ).setOrigin(1, 0).setScale(0.5);

        const multValuesUI2 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 13.75, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `
                <hr style="font-size:3px"/><span style="font-size:16px">${0}</span>`
        ).setOrigin(1, 0).setScale(0.5);

        this.tweens.addCounter({
            from: 0,
            to:  Number(_bonusMult * 100).toFixed(1),
            duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
            ease: 'linear',
            delay: atomList.length * (frameTime * 12) * this.scoreTimeScale + delayStart, //?
            onUpdate: tween =>
            {
                const value = tween.getValue().toFixed(1);
                multValuesUI1.setHTML(
                    `x ${value}%
                    `
            ).setOrigin(1, 0).setScale(0.5);
            },
            onComplete: () => {
                multValuesUI2.setHTML(
                    `
                    <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(Math.ceil(_postMult))}</span>`)
                this.tweens.add({ 
                    targets: multValuesUI2,
                    alpha: 0,
                    ease: 'Linear',
                    duration: 250,
                    loop: 0,
                    yoyo: true,
                });
            }
        });

        /*this.tweens.addCounter({ //@holden move to reference?
            from: 0,
            to:  _postMult, //commaInt(Math.ceil(_postMult)) this code doesn't work here for whatever reason
            duration: atomList.length * 66.7,
            ease: 'linear',
            delay: atomList.length * 133.3,
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                multValuesUI2.setHTML(
                    `
                    <hr style="font-size:3px"/><span style="font-size:16px">${value}</span>`
            ).setOrigin(1, 0);
            },
        });*/

        const postAdditiveLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*2, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `COMBO BONUS:
                BOOST BONUS:
                NO-BONK BONUS:`
        ).setOrigin(1,0).setScale(0.5);

        const postAdditiveValuesUI1 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `${0}
                
                `
        ).setOrigin(1, 0).setScale(0.5);
        const postAdditiveValuesUI2 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `
                ${0}
                `
        ).setOrigin(1, 0).setScale(0.5);
        const postAdditiveValuesUI3 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `
                
                ${0}`
        ).setOrigin(1, 0);

        this.tweens.addCounter({
            from: 0,
            to:  this.stageData.comboBonus(),
            duration: 0,
            ease: 'linear',
            delay: atomList.length * (frameTime * 14) * this.scoreTimeScale + delayStart, //?
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                postAdditiveValuesUI1.setHTML(
                    `+${value}
                    
                    `
            ).setOrigin(1, 0).setScale(0.5);
            }
        });
        
        this.tweens.addCounter({
            from: 0,
            to:  this.stageData.boostBonus(),
            duration: 0,
            ease: 'linear',
            delay: atomList.length * (frameTime * 15) * this.scoreTimeScale + delayStart, //?
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                postAdditiveValuesUI2.setHTML(
                    `
                    +${value}
                    `
            ).setOrigin(1, 0).setScale(0.5);
            }
        });
        
        this.tweens.addCounter({
            from: 0,
            to:  this.stageData.bonkBonus(),
            duration: 0,
            ease: 'linear',
            delay: atomList.length * (frameTime * 16) * this.scoreTimeScale + delayStart, //?
            onComplete: () =>
                {
                letterRank.setAlpha(1)
                //stageScoreUI.setAlpha(1)
                //this.scorePanelLRank.setAlpha(1)
                this.sumOfBestUI.setAlpha(1);
                this.stagesCompleteUI.setAlpha(1);
                this.playerRankUI.setAlpha(1);
                },
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                postAdditiveValuesUI3.setHTML(
                    `
                    
                    +${value}`
                    
            ).setOrigin(1, 0).setScale(0.5);
            }
            
        });

        const stageScoreUI = this.add.dom(-SCREEN_WIDTH/2, GRID * 22.25, 'div', Object.assign({}, STYLE_DEFAULT,
            {
                "font-style": 'bold',
                "font-size": "28px",
                "font-weight": '400',
                "text-align": 'right',
                "text-shadow": '#000000 1px 0 6px',
            })).setHTML(
                //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                `STAGE SCORE: ${commaInt(Math.floor(this.stageData.calcTotal()))}`
        ).setOrigin(1, 0.5).setDepth(20).setScale(0.5);

        
        this.ScoreContainerL.add(
            [this.scorePanelL,
            this.scorePanelLRank,
            preAdditiveBaseScoreUI,
            preAdditiveSpeedScoreUI1,
            preAdditiveSpeedScoreUI2,
            preAdditiveLablesUI,
            multLablesUI1,
            multLablesUI2,
            multLablesUI3,
            multValuesUI1,
            multValuesUI2,
            postAdditiveLablesUI,
            postAdditiveValuesUI1,
            postAdditiveValuesUI2,
            postAdditiveValuesUI3,]
            )
        // #region Rank Sprites

        this.lights.enable();
        this.lights.setAmbientColor(0x3B3B3B);
        
        let rank = this.stageData.stageRank() + 1; // FileNames start at 01.png
        //rank = 4; // Temp override.
        
        var letterRank = this.add.sprite(X_OFFSET + GRID * 3.5,GRID * 16.0, "ranksSpriteSheet", rank -1
        ).setDepth(20).setOrigin(0,0).setPipeline('Light2D');

        this.ScoreContainerL.add(letterRank)
        
        this.letterRankCurve = new Phaser.Curves.Ellipse(letterRank.x - 12, letterRank.y + 16, 36);
        this.letterRankPath = { t: 0, vec: new Phaser.Math.Vector2() };
        this.letterRankPath2 = { t: .5, vec: new Phaser.Math.Vector2() };

        letterRank.x = -SCREEN_WIDTH/2
        
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
        //console.log("rank", rank)
        rank -= 1; //this needs to be set back to rank-1 from being +1'd earlier

        // region Particle Emitter
        if(rank >= RANKS.SILVER){
            lightColor = silverLightColor
            lightColor2 = goldLightColor
            var rankParticles = this.add.particles(X_OFFSET + GRID * 4.0,GRID * 16.0, "twinkle01Anim", { 
                x:{min: 0, max: 16},
                y:{min: 0, max: 34},
                anim: 'twinkle01',
                lifespan: 1000,
            }).setFrequency(500,[1]).setDepth(51);
            this.ScoreContainerL.add(rankParticles)
        }
        if(rank === RANKS.GOLD){
            lightColor = goldLightColor
            lightColor2 = goldLightColor
            var rankParticles = this.add.particles(X_OFFSET + GRID * 4.0,GRID * 16.0, "twinkle02Anim", {
                x:{min: 0, max: 16},
                y:{min: 0, max: 34},
                anim: 'twinkle02',
                lifespan: 1000,
            }).setFrequency(1332,[1]).setDepth(51);
            this.ScoreContainerL.add(rankParticles)
        }
        if(rank === RANKS.PLATINUM){
            
            lightColor = platLightColor
            lightColor2 = goldLightColor
            var rankParticles = this.add.particles(X_OFFSET + GRID * 3.5,GRID * 14.5, "twinkle0Anim", {
                x:{steps: 8, min: 0, max: 24},
                y:{steps: 8, min: 24.5, max: 65.5},
                anim: 'twinkle03',
                color: [0x8fd3ff,0xffffff,0x8ff8e2,0xeaaded], 
                colorEase: 'quad.out',
                alpha:{start: 1, end: 0 },
                lifespan: 3000,
                gravityY: -5,
            }).setFrequency(667,[1]).setDepth(51);
            this.ScoreContainerL.add(rankParticles)
        }

        this.spotlight = this.lights.addLight(0, 0, 66, lightColor).setIntensity(1.5); //
        this.spotlight2 = this.lights.addLight(0, 0, 66, lightColor2).setIntensity(1.5); //
        

        // #region Atomic Food List
       
        var scoreAtoms = [];
        var scoreCombos= [];
        var emptySprite = undefined;

        var count = 0;
        
        for (let i = 0; i < atomList.length; i++) {
            
            var logTime = atomList[i];
            let _x,_y;
            let anim;

            if (i < 14) {
                _x = X_OFFSET + (GRID * (7.2667 - .25)) + (i * 8);
                _y = GRID * 8.75
            }
            else {
                _x = X_OFFSET + (GRID * (7.2667 - .25)) + ((i - 14) * 8);
                _y = (GRID * 8.75) + 8;
            }

            switch (true) {
                case logTime > COMBO_ADD_FLOOR:
                    anim = "atomScore01";
                    if (i != 0) { // First Can't Connect
                        var rectangle = this.add.rectangle(_x - 6, _y, 6, 2, 0xFFFF00, 1
                        ).setOrigin(0,0.5).setDepth(20).setAlpha(0);
                        this.ScoreContainerL.add(rectangle)
                        scoreCombos.push(rectangle)
                    }
                    break
                case logTime > BOOST_ADD_FLOOR:
                    //console.log(logTime, "Boost", i);
                    anim = "atomScore02";
                    scoreCombos.push(emptySprite);
                    break
                case logTime > SCORE_FLOOR:
                    //console.log(logTime, "Boost", i);
                    anim = "atomScore03";
                    scoreCombos.push(emptySprite);
                    break
                default:
                    //console.log(logTime, "dud", i);
                    anim = "atomScore04";
                    scoreCombos.push(emptySprite);
                    break
            }

            this.atomScoreIcon = this.add.sprite(_x, _y,'atomicPickupScore'
            ).play(anim).setDepth(21).setScale(1).setAlpha(0);
            this.ScoreContainerL.add(this.atomScoreIcon)  
            scoreAtoms.push(this.atomScoreIcon)
        }
        var _frame = 0
        var __frame = 0

        var scoreAtomsTween = this.tweens.addCounter({
            from: 0,
            to:  atomList.length,
            delay: delayStart,
            duration: (frameTime * 4) * atomList.length,
            ease: 'Linear',
            
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                __frame += 1
                if (__frame % 4 === 0 && _frame <= scoreAtoms.length -1) {
                    _frame += 1
                    //var _index = Phaser.Math.RND.integerInRange(0, ourGame.atomSounds.length - 1)  
                    
                    scoreAtoms[_frame-1].setAlpha(1);
                    if (scoreCombos[_frame-1]) {
                        scoreCombos[_frame-1].setAlpha(1);
                    }

                    //ourGame.atomSounds[_index].play()
                    ourGame.sound.play(Phaser.Math.RND.pick(['bubbleBop01','bubbleBopHigh01','bubbleBopLow01']));
                }
                
                //ourGame.atomSounds[Phaser.Math.RND.integer(0, ourGame.atomSounds.length - 1)].play()
            }
        });

        //console.log(scoreAtomsTween.timeScale)
        //debugger;
        //scoreAtomsTween.timeScale = 8;


        /*this.tweens.add({ //shows score screen atoms one by one
            targets: scoreAtoms,
            alpha: 1,
            ease: 'Linear',
            duration: 0,
            delay: this.tweens.stagger(frameTime * 2),
        });*/

        this.ScoreContainerL.x -= SCREEN_WIDTH
        this.tweens.add({ //brings left score container into camera frame
            targets: this.ScoreContainerL,
            x: -GRID * 2,
            ease: 'Sine.InOut',
            duration: 500,
        });
        this.tweens.add({
            targets: stageScoreUI,
            x: SCREEN_WIDTH/2,
            ease: 'Sine.InOut',
            duration: 500,
            delay:2000,
        });
        this.tweens.add({
            targets: letterRank,
            x: X_OFFSET + GRID * 3.5,
            ease: 'Sine.InOut',
            duration: 500,
            delay:2500,
            onComplete: () =>
                {
                    this.rankSounds[rank].play();
                },
        });


        this.tweens.add({
            targets: this.scorePanelLRank,
            x: X_OFFSET + GRID * 4.5,
            ease: 'Sine.InOut',
            duration: 500,
            delay:2500,
        });
        

        // #region Stat Cards (Right Side)

        var cornerTimeSec = (ourInputScene.cornerTime/ 1000).toFixed(3)
        var boostTimeSec = (ourInputScene.boostTime * 0.01666).toFixed(3)
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
            "padding": '12px 22px 12px 12px',
            "text-align": 'left', 
            "word-wrap": 'break-word',
            "white-space": 'pre-line',
            'overflow-y': 'scroll',
            //'scroll-behavior': 'smooth', smooth scroll stutters when arrow key down/up is held
            //'mask-image': 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)'
            //'scrollbar-width': 'none', //Could potentially make a custom scroll bar to match the aesthetics
        }


        const stageStats = this.add.dom(SCREEN_WIDTH/2 - X_OFFSET + GRID * 3, (GRID * cardY) + 2, 'div',  Object.assign({}, STYLE_DEFAULT, 
            styleCard, {
            })).setHTML(
                //`----------- < <span style="color:${COLOR_TERTIARY};">● ○ ○</span> > -----------</br>
                //</br>
                //[${ourGame.scoreHistory.slice().sort().reverse()}]</br> individual food score printout array
                `<span style ="text-transform: uppercase"> ${ourGame.stage} STATS</span>
                <hr style="font-size:6px"/>ATTEMPTS: <span style = "float: right">xx</span>
                LENGTH: <span style = "float: right">${ourGame.length}</span>
                AVERAGE: <span style = "float: right">${stageAve.toFixed(2)}</span>
                BONKS: <span style = "float: right">${ourGame.bonks}</span>

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

                BASE SCORE: <span style = "float: right">${_baseScore}</span>
                SPEED BONUS: <span style = "float: right">${bestLog.calcBonus()}</span>
                </br>

                BEST SCORE: <span style = "float: right">${bestLog.calcTotal()}</span>
                </br>
                AVERAGE: <span style = "float: right">${bestAve.toFixed(2)}</span>
                [${bestLog.foodLog.slice().sort().reverse()}]

                STAGE FOOD LOG:
                [${ourGame.scoreHistory.slice().sort().reverse()}]
                </br>`
                    
        ).setOrigin(0,0).setScale(0.5).setVisible(true);


        

        // Stats Scroll Logic
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
        })
        this.input.keyboard.on('keydown-UP', function() {
            stageStats.node.scrollTop -= 36;
        })

        this.ScoreContainerR.add(
            [this.scorePanelR,
            scrollArrowDown,
            stageStats,]
        )
        this.ScoreContainerR.x += SCREEN_WIDTH//GRID * 1;
        this.tweens.add({
            targets: this.ScoreContainerR,
            x: X_OFFSET - GRID * 2,
            ease: 'Sine.InOut',
            duration: 500,
        });
        

        // #region Hash Display Code
        this.foodLogSeed = this.stageData.foodLog.slice();
        this.foodLogSeed.push((ourInputScene.time.now/1000 % ourInputScene.cornerTime).toFixed(0));
        this.foodLogSeed.push(Math.floor(this.stageData.calcTotal()));

        // Starts Best as Current Copy
        this.bestSeed = this.foodLogSeed.slice();

        var foodHash = calcHashInt(this.foodLogSeed.toString());
        this.bestHashInt = parseInt(foodHash);

        this.hashUI = this.add.dom(SCREEN_WIDTH/2, GRID * 23, 'div',  Object.assign({}, STYLE_DEFAULT, {
            width:'335px',
            "fontSize":'18px',
        })).setOrigin(.5, 0).setScale(0.5).setAlpha(0);


    
        updateSumOfBest(ourPersist);
        var totalLevels = Math.min(ourPersist.stagesComplete + Math.ceil(ourPersist.stagesComplete / 4), STAGE_TOTAL);


        this.stagesCompleteUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID *21.25, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize":'20px',
            "font-weight": '400',
            "text-shadow": '#000000 1px 0 6px',
            //"font-style": 'italic',
            //"font-weight": 'bold',
            })).setText(
                `STAGES COMPLETE : ${commaInt(ourPersist.stagesComplete)} / ${totalLevels}`
        ).setOrigin(0,0).setScale(0.5).setAlpha(0);
        
        this.sumOfBestUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID * 22.25, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize":'20px',
            "font-weight": '400',
            "text-shadow": '#000000 1px 0 6px',
            //"font-style": 'italic',
            //"font-weight": 'bold',
            })).setHTML(
                `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(ourPersist.sumOfBest.toFixed(0))}</span>`
        ).setOrigin(0,0).setScale(0.5).setAlpha(0);

        this.playerRankUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID * 23.25, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize":'20px',
            "font-weight": '400',
            "text-shadow": '#000000 1px 0 6px',
            //"font-style": 'italic',
            //"font-weight": 'bold',
            })).setHTML(
                `BEST OF RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${calcSumOfBestRank(ourPersist.sumOfBest)}</span>`
        ).setOrigin(0,0).setScale(0.5).setAlpha(0);

        // #region Help Card
        /*var card = this.add.image(SCREEN_WIDTH/2, 19*GRID, 'helpCard02').setDepth(10);
        card.setOrigin(0.5,0); 
        card.displayHeight = 108;*/

        var totalScore = 0;

        this.scene.get("SpaceBoyScene").stageHistory.forEach( stageData => {
            totalScore += stageData.calcTotal();
        });

        // #endregion
        /*const bestRunUI = this.add.dom(SCREEN_WIDTH/2, GRID*25, 'div', Object.assign({}, STYLE_DEFAULT, {
            width: '500px',
            'font-size':'22px',
            'font-weight': 400,
        })).setText(`Previous Best Run: ${commaInt(bestrun)}`).setOrigin(0.5,0).setDepth(60);*/


        this.prevZeds = this.scene.get("PersistScene").zeds;


        // #region Save Best Run
        var sumOfBase = 0;
        var _histLog = [];
        
        this.scene.get("SpaceBoyScene").stageHistory.forEach( _stage => {
            _histLog = [ ..._histLog, ..._stage.foodLog];
            sumOfBase += _stage.calcBase();
            ourGame.nextScore += _stage.calcTotal();

        });

        this.scene.get("SpaceBoyScene").globalFoodLog = _histLog;

        if (bestrun < ourGame.score + ourScoreScene.stageData.calcTotal()) {
            localStorage.setItem('BestFinalScore', ourGame.score + ourScoreScene.stageData.calcTotal());
        }
        // #endregion

        this.input.keyboard.on('keydown-SPACE', function() { 
            //ourScoreScene.scoreAtomsTween.setTimeScale(8); //doesn't do anything
            //scoreAtomsTween.timeScale = 8;
            //debugger
            this.scoreTimeScale= 0.25;
        });
        /*this.input.keyboard.on('keyup-SPACE', function(scoreAtomsTween) { 
            //scoreAtomsTween.timeScale = 1 //doesn't do anything
        });*/

        var extraFields = {
            startingScore: ourScoreScene.stageData.calcTotal(),
            rollsLeft: ourScoreScene.foodLogSeed.slice(-1).pop() 
        }

        localStorage.setItem("zeds", ourPersist.zeds);
        gameanalytics.GameAnalytics.addResourceEvent(
            gameanalytics.EGAResourceFlowType.Source,
            "zeds",
            ourScoreScene.difficulty,
            "Gameplay",
            "CompleteStage",
            extraFields.toString(),
            );
        
        // Event listeners need to be removed manually
        // Better if possible to do this as part of UIScene clean up
        // As the event is defined there, but this works and its' here. - James
        ourGame.events.off('addScore');
        //ourGame.events.off('spawnBlackholes');
        
        //this.scene.stop();




        // Give a few seconds before a player can hit continue
        this.time.delayedCall(900, function() {
            var continue_text = '[SPACE TO CONTINUE]';

            var gameOver = false;

            if (this.scene.get("SpaceBoyScene").stageHistory.length >= GAME_LENGTH) {
                //debugger
                //continue_text = '[RESTART AND FIND NEW WORLD PATHS]';
                //gameOver = true;
                // Should restart here, with a popup that shows your run score info.
                // Should be the same screen as the GameOver Screen.
            }
            
            var continueText = this.add.dom(SCREEN_WIDTH/2, GRID*27.25,'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize":'32px',
                "font-family": '"Press Start 2P", system-ui',
                "text-shadow": "4px 4px 0px #000000",
                //"text-shadow": '-2px 0 0 #fdff2a, -4px 0 0 #df4a42, 2px 0 0 #91fcfe, 4px 0 0 #4405fc',
                //"text-shadow": '4px 4px 0px #000000, -2px 0 0 limegreen, 2px 0 0 fuchsia, 2px 0 0 #4405fc'
                }
            )).setText(continue_text).setOrigin(0.5,0).setScale(.5).setDepth(25).setInteractive();

 
            this.tweens.add({
                targets: continueText,
                alpha: { from: 0, to: 1 },
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
              });

            const onContinue = function (scene) {
                console.log('pressing space inside score scene')

                if (ourGame.slowMoTween && ourGame.slowMoTween.isPlaying()){
                    ourGame.slowMoTween.complete(); //this returns timescale values to 1 so players don't need to wait
                    // reset snake body segments so it can move immediately
                    ourGame.snake.body.forEach(segment => {
                        segment.x = ourGame.snake.head.x;
                        segment.y = ourGame.snake.head.y;
                    });
                }

                

                if (ourGame.stage == 'Tutorial_1') {
                    ourGame.tutorialPrompt(SCREEN_WIDTH - X_OFFSET - ourGame.helpPanel.width/2 - GRID,
                         Y_OFFSET + ourGame.helpPanel.height/2 + GRID,1,)
                }
                //score screen starting arrows
                ourGame.events.emit('spawnBlackholes', ourGame.snake.direction);

                if (!ourGame.map.hasTileAtWorldXY(ourGame.snake.head.x, ourGame.snake.head.y -1 * GRID)) {
                    ourGame.startingArrowsAnimN2 = ourGame.add.sprite(ourGame.snake.head.x + GRID/2, ourGame.snake.head.y - GRID).setDepth(52).setOrigin(0.5,0.5);
                    ourGame.startingArrowsAnimN2.play('startArrowIdle');
                }
                if (!ourGame.map.hasTileAtWorldXY(ourGame.snake.head.x, ourGame.snake.head.y +1 * GRID)) {
                    ourGame.startingArrowsAnimS2 = ourGame.add.sprite(ourGame.snake.head.x + GRID/2, ourGame.snake.head.y + GRID * 2).setDepth(103).setOrigin(0.5,0.5);
                    ourGame.startingArrowsAnimS2.flipY = true;
                    ourGame.startingArrowsAnimS2.play('startArrowIdle');
                }
                if (!ourGame.map.hasTileAtWorldXY(ourGame.snake.head.x + 1 * GRID, ourGame.snake.head.y)) {
                    ourGame.startingArrowsAnimE2 = ourGame.add.sprite(ourGame.snake.head.x + GRID * 2, ourGame.snake.head.y + GRID /2).setDepth(103).setOrigin(0.5,0.5);
                    ourGame.startingArrowsAnimE2.angle = 90;
                    ourGame.startingArrowsAnimE2.play('startArrowIdle');
                }
                if (!ourGame.map.hasTileAtWorldXY(ourGame.snake.head.x + 1 * GRID, ourGame.snake.head.y)) {
                    ourGame.startingArrowsAnimW2 = ourGame.add.sprite(ourGame.snake.head.x - GRID,ourGame.snake.head.y + GRID/2).setDepth(103).setOrigin(0.5,0.5);
                    ourGame.startingArrowsAnimW2.angle = 270;
                    ourGame.startingArrowsAnimW2.play('startArrowIdle');
                }
                

                
                const zedObject = calcZedLevel(ourPersist.zeds)

                var extraFields = {
                    level: zedObject.level,
                    zedsToNext: zedObject.zedsToNext,
                    startingScore: ourScoreScene.stageData.calcTotal(),
                    rollsLeft: ourScoreScene.foodLogSeed.slice(-1).pop() 
                }

                localStorage.setItem("zeds", ourPersist.zeds);
                gameanalytics.GameAnalytics.addResourceEvent(
                    gameanalytics.EGAResourceFlowType.Source,
                    "zeds",
                    ourScoreScene.difficulty,
                    "Gameplay",
                    "CompleteStage",
                    extraFields.toString(),
                    );
                
                    // Event listeners need to be removed manually
                // Better if possible to do this as part of UIScene clean up
                // As the event is defined there, but this works and its' here. - James
                ourGame.events.off('addScore');
                ourGame.events.off('spawnBlackholes');


                
                ourScoreScene.scene.stop();

                    
                if (!gameOver) {
                    // Go Back Playing To Select New Stage
                    ourScoreScene.scene.stop();
                    ourGame.gState = GState.START_WAIT;
                    ourGame.bgTween = ourGame.tweens.add({
                        targets: [ourGame.stageBackGround, ourGame.continueBanner],
                        alpha: 0,
                        yoyo: false,
                        loop: 0,
                        duration: 200,
                        ease: 'sine.inout'
                    });

                    /*ourGame.add.dom(SCREEN_WIDTH / 2, SCREEN_HEIGHT/2, 'div',  Object.assign({}, STYLE_DEFAULT, {

                        })).setHTML(
                            
                            `Free Play </br>
                            Press "n" to warp to the next stage.`
                    ).setOrigin(0.5,0.5);*/
                } 
            }
            // #region Space to Continue
            this.input.keyboard.on('keydown-SPACE', function() { 
                onContinue(ourGame);
            });

            continueText.on('pointerdown', e => {
                onContinue(ourGame);
            });


        }, [], this);


    }

    // #region Score - Update
    update(time) {
        const ourPersist = this.scene.get('PersistScene');

        var scoreCountDown = this.foodLogSeed.slice(-1);

        this.letterRankCurve.getPoint(this.letterRankPath.t, this.letterRankPath.vec);
        this.letterRankCurve.getPoint(this.letterRankPath2.t, this.letterRankPath2.vec);

        this.spotlight.x = this.letterRankPath.vec.x;
        this.spotlight.y = this.letterRankPath.vec.y;

        this.spotlight2.x = this.letterRankPath2.vec.x;
        this.spotlight2.y = this.letterRankPath2.vec.y;

        /*this.graphics = this.add.graphics();
        this.graphics.clear(); //Used to debug where light is
        this.graphics.lineStyle(2, 0xffffff, 1);
        this.letterRankCurve.draw(this.graphics, 64);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillCircle(this.letterRankPath.vec.x, this.letterRankPath.vec.y, 8).setDepth(30);
        this.graphics.fillCircle(this.letterRankPath2.vec.x, this.letterRankPath2.vec.y, 8).setDepth(30);
        */

        if (time >= this.lastRollTime + this.rollSpeed && scoreCountDown > 0) {
            this.lastRollTime = time;
            
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


            var temp = 2**this.difficulty
            var innerRollNum = Math.ceil(2**this.difficulty/10)
            
            
            
            for (let index = innerRollNum; index > 0 ; index--) {
                
                

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

            this.rollSpeed = Math.max(1, 20 - this.difficulty);

            this.hashUI.setHTML(
                `Rolling for Zeds (${this.foodLogSeed.slice(-1)})<br/> 
                <span style="color:limegreen;text-decoration:underline;">${leadingZeros}</span><span style="color:limegreen">1</span>${intToBinHash(roll).slice(this.difficulty + 1)}<br/>
                You earned <span style ="color:${COLOR_BONUS};font-weight:600;text-decoration:underline;">${this.difficulty}</span> Zeds this Run`
            );

            
            if (this.prevZeds + this.difficulty > ourPersist.zeds) {
                ourPersist.zeds = this.prevZeds + this.difficulty;
                var zedsObj = calcZedLevel(ourPersist.zeds);

                ourPersist.zedsUI.setHTML(
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
        this.turnInputs = {
            w:0,
            a:0,
            s:0,
            d:0,
            up:0,
            down:0,
            left:0,
            right:0,
        }; // W A S D UP DOWN LEFT RIGHT
    }

    preload() {
        this.load.image('upWASD', 'assets/sprites/upWASD.png')
        this.load.image('downWASD', 'assets/sprites/downWASD.png');
        this.load.image('leftWASD', 'assets/sprites/leftWASD.png');
        this.load.image('rightWASD', 'assets/sprites/rightWASD.png');
        this.load.image('spaceWASD', 'assets/sprites/spaceWASD.png');

    }
    create() {
    const ourGame = this.scene.get("GameScene");
    const ourInput = this.scene.get("InputScene");

    var tempButtonScale = 10;
    var tempInOffSet = 8;
    var tempInputHeight = 35.5;

    this.input.addPointer(4);

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.upWASD = this.add.sprite(tempInOffSet * GRID, tempInputHeight * GRID - GRID*2.5, 'upWASD', 0
    ).setDepth(50).setOrigin(0,0).setScale(tempButtonScale).setInteractive();
    this.upWASD.on('pointerdown', function (pointer)
    {

        this.setTint(0xff0000);
        ourInput.moveUp(ourGame, "upUI")

    });
    this.upWASD.on('pointerout', function (pointer)
    {
        this.clearTint();
    });
    this.upWASD.on('pointerup', function (pointer)
    {
        this.clearTint();
    });


    this.downWASD = this.add.sprite(SCREEN_WIDTH - tempInOffSet * GRID, tempInputHeight * GRID - GRID*2.5, 'downWASD', 0
    ).setDepth(50).setOrigin(1,0).setScale(tempButtonScale).setInteractive();
    this.downWASD.on('pointerdown', function (pointer)
    {
        this.setTint(0xff0000);
        ourInput.moveDown(ourGame, "downUI")
    });

    this.downWASD.on('pointerout', function (pointer)
    {
        this.clearTint();
    });

    this.downWASD.on('pointerup', function (pointer)
    {
        this.clearTint();
    });


    this.leftWASD = this.add.sprite(10, tempInputHeight * GRID - 7, 'leftWASD', 0
    ).setDepth(50).setOrigin(0,0).setScale(tempButtonScale).setInteractive();
    this.leftWASD.on('pointerdown', function (pointer)
    {
        this.setTint(0xff0000);
        ourInput.moveLeft(ourGame, "leftUI")
    });

    this.leftWASD.on('pointerout', function (pointer)
    {
        this.clearTint();
    });

    this.leftWASD.on('pointerup', function (pointer)
    {
        this.clearTint();
    });


    this.rightWASD = this.add.sprite(SCREEN_WIDTH, tempInputHeight * GRID - 7, 'rightWASD', 0
    ).setDepth(50).setOrigin(1,0).setScale(tempButtonScale).setInteractive();
    this.rightWASD.on('pointerdown', function (pointer)
    {
        this.setTint(0xff0000);
        ourInput.moveRight(ourGame, "rightUI")
    });

    this.rightWASD.on('pointerout', function (pointer)
    {
        this.clearTint();
    });

    this.rightWASD.on('pointerup', function (pointer)
    {
        this.clearTint();
    });




    


    this.spaceWASD = this.add.sprite(SCREEN_WIDTH / 2, 41 * GRID, 'spaceWASD', 0
    ).setDepth(50).setOrigin(0.5,0).setScale(4).setInteractive();
    this.spaceWASD.on('pointerdown', function (pointer)
    {
        this.setTint(0xff0000);
        debugger  
        //ourGame.scale.setHeight(744);
        //ourGame.cameras.main.setViewport(0,0,744,744);
              
       
    });

    this.spaceWASD.on('pointerout', function (pointer)
    {
        this.clearTint();

    });

    this.spaceWASD.on('pointerup', function (pointer)
    {
        this.clearTint();

    });
    
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
                //console.log("I'm Facing Up");
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


    moveUp(gameScene, key) {
        if (gameScene.snake.direction === DIRS.LEFT  || gameScene.snake.direction  === DIRS.RIGHT || // Prevents backtracking to death
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 

            //console.log("I'm Moving Up");
            
            this.setPLAY(gameScene);
            
                // At anytime you can update the direction of the snake.
            gameScene.snake.head.setTexture('snakeDefault', 6);
            gameScene.snake.direction = DIRS.UP;
            
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);
            this.turns += 1;
            
            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;

            }
            gameScene.lastMoveTime = gameScene.time.now;

                
            gameScene.snake.move(gameScene);
            this.turnInputs[key] += 1;

            this.moveHistory.push([(gameScene.snake.head.x - X_OFFSET)/GRID, (gameScene.snake.head.y - Y_OFFSET)/GRID]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means technically you can go as fast as you turn.
            
            
        }
    }

    moveDown(gameScene, key) {
        if (gameScene.snake.direction  === DIRS.LEFT  || gameScene.snake.direction  === DIRS.RIGHT || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 
           

               this.setPLAY(gameScene);
               gameScene.snake.head.setTexture('snakeDefault', 7);
           gameScene.snake.direction = DIRS.DOWN;

           this.turns += 1;
           this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

           var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

           if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
               this.cornerTime += _cornerTime;
           }
           gameScene.lastMoveTime = gameScene.time.now;

           gameScene.snake.move(gameScene);
           this.turnInputs[key] += 1;

           this.moveHistory.push([(gameScene.snake.head.x - X_OFFSET)/GRID, (gameScene.snake.head.y - Y_OFFSET)/GRID]);
           gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.

           
       }

    }

    moveLeft(gameScene, key) {
        if (gameScene.snake.direction  === DIRS.UP   || gameScene.snake.direction  === DIRS.DOWN || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) {
            
                this.setPLAY(gameScene);

            gameScene.snake.head.setTexture('snakeDefault', 4);
            gameScene.snake.direction = DIRS.LEFT;

            this.turns += 1;
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;
            }
            gameScene.lastMoveTime = gameScene.time.now;

            gameScene.snake.move(gameScene);

            this.moveHistory.push([(gameScene.snake.head.x - X_OFFSET)/GRID, (gameScene.snake.head.y - Y_OFFSET)/GRID]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.

            this.turnInputs[key] += 1;
            
        }

    }

    moveRight(gameScene, key) {
        if (gameScene.snake.direction  === DIRS.UP   || gameScene.snake.direction  === DIRS.DOWN || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 2 || gameScene.stepMode)) { 
            
                this.setPLAY(gameScene);
                gameScene.snake.head.setTexture('snakeDefault', 5);
            gameScene.snake.direction = DIRS.RIGHT;

            this.turns += 1;
            this.inputSet.push([gameScene.snake.direction, gameScene.time.now]);

            var _cornerTime = Math.abs((gameScene.time.now - gameScene.lastMoveTime) - gameScene.moveInterval);

            if (_cornerTime < gameScene.moveInterval) { // Moving on the same frame means you saved 0 frames not 99
                this.cornerTime += _cornerTime;
            }
            gameScene.lastMoveTime = gameScene.time.now;
             
            gameScene.snake.move(gameScene);

            this.moveHistory.push([(gameScene.snake.head.x - X_OFFSET)/GRID, (gameScene.snake.head.y - Y_OFFSET)/GRID]);
            gameScene.lastMoveTime = gameScene.time.now; // next cycle for move. This means techincally you can go as fast as you turn.
            this.turnInputs[key] += 1;
        }

    }

    moveDirection(gameScene, event) {

        /***
         * All move up calls only move if it is safe to move
        ***/
        
        // #region MoveDirection
        switch (event.keyCode) {
            case 87: // w
                this.moveUp(gameScene, "w");
                break;

            case 65: // a
                this.moveLeft(gameScene, "a");
                break;

            case 83: // s
                this.moveDown(gameScene, "s");
                break;

            case 68: // d
                this.moveRight(gameScene, "d");
                break;

            case 38: // UP
                this.moveUp(gameScene, "up");
                break;

            case 37: // LEFT
                this.moveLeft(gameScene, "down");
                break;

            case 40: // DOWN
                this.moveDown(gameScene, "left");
                break;

            case 39: // RIGHT
                this.moveRight(gameScene, "right");
                break;

            case 32: // SPACE
              if (DEBUG) { console.log(event.code, gameScene.time.now); }
              this.inputSet.push([START_SPRINT, gameScene.time.now]);
              break;
        } 
    }
    setPLAY(gameScene) {

            // Starting Game State
            gameScene.gState = GState.PLAY;
            gameScene.scoreTimer.paused = false;
                
            // turn off arrows and move snake.
            
        if (gameScene.arrowTween != undefined) {
                gameScene.arrowTween.destroy();
        }
            
            gameScene.startingArrowsAnimN.setAlpha(0);
            gameScene.startingArrowsAnimS.setAlpha(0);
 
        if (gameScene.startingArrowsAnimE != undefined){
            gameScene.startingArrowsAnimE.setAlpha(0);
        }
        if (gameScene.startingArrowsAnimW != undefined){
            gameScene.startingArrowsAnimW.setAlpha(0);
        }
        if (gameScene.startingArrowsAnimN2) {
            gameScene.startingArrowsAnimN2.destroy();
        }
        if (gameScene.startingArrowsAnimE2) {
            gameScene.startingArrowsAnimE2.destroy();
        }
        if (gameScene.startingArrowsAnimS2) {
            gameScene.startingArrowsAnimS2.destroy();
        }
        if (gameScene.startingArrowsAnimW2) {
            gameScene.startingArrowsAnimW2.destroy();
        }
        
        


            //ourInputScene.moveDirection(this, e);
    }
}







 // #region Animations
function loadSpriteSheetsAndAnims(scene) {
    /**
     * Template *
    scene.textures.addSpriteSheetFromAtlas('', { atlas: 'megaAtlas', frameWidth:  ,frameHeight: ,
        frame: ''
    }); scene.anims.create({
     */

    
    /**
     * SpriteSheets don't support loading the normal map when loading from an Atlas. 
     * This adds it directly and somehow all of the data lines up. :thumbs-up: 
     * Work flow is to add the normal maps to the atlas with the same file name and the _n postfix.
     * 
     * Alternate Strategy:
     *   this.load.image('snakeDefaultNormal', 'assets/sprites/snakeSheetDefault_n.png');
     *   // Later … 
     *   const snakeDefaultNormal = scene.textures.get('snakeDefaultNormal');
     *   sakeSpriteSheet.setDataSource(snakeDefaultNormal.getSourceImage());
     * 
     *   Thank you samme from Phaser for both solutions!
     */

    const snakeSpriteSheet = scene.textures.addSpriteSheetFromAtlas('snakeDefault', { atlas: 'megaAtlas', frameWidth: 12 ,frameHeight: 12 ,
        frame: 'snakeSheetDefault.png'
    }); 
    snakeSpriteSheet.setDataSource(
        scene.textures.get('megaAtlas').getDataSourceImage()
    );


    


    // Sprite Sheets that don't have animations.
    /*scene.textures.addSpriteSheetFromAtlas('comboLetters', { atlas: 'megaAtlas', frameWidth: 18, frameHeight: 24,
        frame: 'comboLetters.png'
    });*/

    scene.textures.addSpriteSheetFromAtlas('ranksSpriteSheet', { atlas: 'megaAtlas', frameWidth: 24, frameHeight: 36,
        frame: 'ranksSpriteSheet.png'
    })


    // Sprite Sheets and add Animations
    // Mega Atlas code commented out
    //scene.textures.addSpriteSheetFromAtlas('startArrow', { atlas: 'megaAtlas', frameWidth: 24, frameHeight: 24,
    //    frame: 'startingArrowsAnim.png'});
    scene.anims.create({
        key: 'startArrowIdle',
        frames: scene.anims.generateFrameNumbers('startingArrowsAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7 ] }),
        frameRate: 16,
        repeat: -1
    });


    scene.anims.create({
        key: 'tutIdle',
        frames: scene.anims.generateFrameNumbers('tutWASD',{ frames: [ 0]}),
        frameRate: 1,
        repeat: 0
      });
    scene.anims.create({
    key: 'tutAll',
    frames: scene.anims.generateFrameNumbers('tutWASD',{ frames: [ 1,2,1,3,4,3,5,6,5,7,8,7]}),
    frameRate: 12,
    repeat: -1
    });
    scene.anims.create({
        key: 'tutSpace',
        frames: scene.anims.generateFrameNumbers('tutSPACE',{ frames: [ 0,0,0,0,1,2,2,2,2,1]}),
        frameRate: 12,
        repeat: -1
    });
    
    /*scene.textures.addSpriteSheetFromAtlas('portals', { atlas: 'megaAtlas', frameWidth: 32, frameHeight: 32,
        frame: 'portalAnim.png'
    }); scene.anims.create({
        key: 'portalIdle',
        frames: scene.anims.generateFrameNumbers('portals',{ frames: [ 0, 1, 2, 3, 4, 5]}),
        frameRate: 8,
        repeat: -1
    });*/
    scene.anims.create({
        key: 'portalFormHighlight',
        frames: scene.anims.generateFrameNumbers('portalHighlights',{ frames: [ 6,7,8,9]}),
        frameRate: 8,
        repeat: 0
    });
    scene.anims.create({
        key: 'portalHighlights',
        frames: scene.anims.generateFrameNumbers('portalHighlights',{ frames: [ 0, 1, 2, 3, 4, 5]}),
        frameRate: 8,
        repeat: -1
    });

    scene.anims.create({
        key: 'portalIdle',
        frames: scene.anims.generateFrameNumbers('portals',{ frames: [ 0, 1, 2, 3, 4, 5]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'portalForm',
        frames: scene.anims.generateFrameNumbers('portals',{ frames: [ 6,7,8,9]}),
        frameRate: 8,
        repeat: 0
    });
    scene.anims.create({
        key: 'starIdle',
        frames: scene.anims.generateFrameNumbers('stars',{ frames: [ 0,1,2,3,4,5,6,7,8]}),
        frameRate: 8,
        repeat: -1,
        randomFrame: true
    });
    scene.anims.create({
        key: 'electronFanfareForm',
        frames: scene.anims.generateFrameNumbers('electronParticleFanfare',{ frames: [ 0,1,2,3,4]}),
        frameRate: 8,
        repeat: 0,
        randomFrame: true
    });
    scene.anims.create({
        key: 'electronFanfareIdle',
        frames: scene.anims.generateFrameNumbers('electronParticleFanfare',{ frames: [ 5,6,7,8,9,10,11,12]}),
        frameRate: 8,
        repeat: -1,
        randomFrame: true
    });

    scene.anims.create({
        key: 'pWallFlatMiddle',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [6,7,8,9,10,11]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'pWallFlatLeft',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [0,1,2,3,4,5]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'pWallFlatRight',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [12,13,14,15,16,17]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'pWallVertBot',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [18,19,20,21,22,23]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'pWallVertMiddle',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [24,25,26,27,28,29]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'pWallVertTop',
        frames: scene.anims.generateFrameNumbers('portalWalls',{ frames: [30,31,32,33,34,35]}),
        frameRate: 8,
        repeat: -1
    });

    scene.anims.create({
        key: 'arrowMenuIdle',
        frames: scene.anims.generateFrameNumbers('arrowMenu',{ frames: [0,1,2,3,4,5,6,7,8,9]}),
        frameRate: 8,
        repeat: -1
    });
    
    scene.textures.addSpriteSheetFromAtlas('downArrowAnim', { atlas: 'megaAtlas', frameWidth: 16, frameHeight: 16,
        frame: 'UI_ArrowDownAnim.png'
    }); scene.anims.create({
        key: 'downArrowIdle',
        frames: scene.anims.generateFrameNumbers('downArrowAnim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7]}),
        frameRate: 8,
        repeat: -1
    });
    
    scene.textures.addSpriteSheetFromAtlas('twinkle01Anim', { atlas: 'megaAtlas', frameWidth: 8 ,frameHeight: 8,
        frame: 'twinkle01Anim.png'
    }); scene.anims.create({
        key: 'twinkle01',
        frames: scene.anims.generateFrameNumbers('twinkle01Anim',{ frames: [0, 1, 2, 1, 3]}),
        frameRate: 6,
        repeat: 0
    });
    
    scene.textures.addSpriteSheetFromAtlas('twinkle02Anim', { atlas: 'megaAtlas', frameWidth: 8 ,frameHeight: 8 ,
        frame: 'twinkle02Anim.png'
    }); scene.anims.create({
        key: 'twinkle02',
        frames: scene.anims.generateFrameNumbers('twinkle02Anim',{ frames: [0, 1, 2, 3 ,4 ,5 ,6]}),
        frameRate: 6,
        repeat: 0
    });

    scene.textures.addSpriteSheetFromAtlas('twinkle03Anim', { atlas: 'megaAtlas', frameWidth: 8 ,frameHeight: 8 ,
        frame: 'twinkle03Anim.png'
    }); scene.anims.create({
        key: 'twinkle03',
        frames: scene.anims.generateFrameNumbers('twinkle03Anim',{ frames: [0, 1, 2, 3, 2, 1,]}),
        frameRate: 6,
        repeat: -1
    });
    
    scene.textures.addSpriteSheetFromAtlas('snakeOutlineBoosting', { atlas: 'megaAtlas', frameWidth: 14,frameHeight: 14,
        frame: 'snakeOutlineAnim.png'
    }); scene.anims.create({
        key: 'snakeOutlineAnim',
        frames: scene.anims.generateFrameNumbers('snakeOutlineBoosting',{ frames: [ 0, 1, 2, 3]}),
        frameRate: 12,
        repeat: -1
    });

    scene.textures.addSpriteSheetFromAtlas('snakeOutlineBoostingSmall', { atlas: 'megaAtlas', frameWidth: 14,frameHeight: 14,
        frame: 'snakeOutlineSmallAnim.png'
    }); scene.anims.create({
        key: 'snakeOutlineSmallAnim',
        frames: scene.anims.generateFrameNumbers('snakeOutlineBoostingSmall',{ frames: [ 0, 1, 2, 3]}),
        frameRate: 12,
        repeat: -1
    })

    scene.textures.addSpriteSheetFromAtlas('atomicPickup01Anim', { atlas: 'megaAtlas', frameWidth: 12, frameHeight: 12,
        frame: 'atomicPickup01Anim.png'
    }); scene.anims.create({
      key: 'atom01idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}),
      frameRate: 12,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atom02idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}),
      frameRate: 8,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atom03idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]}),
      frameRate: 6,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atom04idle',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]}),
      frameRate: 4,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atom05spawn',
      frames: scene.anims.generateFrameNumbers('atomicPickup01Anim',{ frames: [ 48, 49, 50, 51, 52]}),
      frameRate: 12,
      delay: 200,
      repeat: 0, // How long is the duration of this animation in milliseconds @ hodlen?
    });

    scene.anims.create({
        key: 'atomCometSpawn',
        frames: scene.anims.generateFrameNumbers('atomicPickupComet',{ frames: [ 0,1,2,3,4,5,6,7,8,9]}),
        frameRate: 12,
        repeat: 0,
      });
    scene.anims.create({
        key: 'atomCometIdle',
        frames: scene.anims.generateFrameNumbers('atomicPickupComet',{ frames: [ 10,11]}),
        frameRate: 8,
        repeat: -1,
    });

    // score scene atoms
    scene.anims.create({
      key: 'atomScore01',
      frames: scene.anims.generateFrameNumbers('atomicPickupScore',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}),
      frameRate: 12,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atomScore02',
      frames: scene.anims.generateFrameNumbers('atomicPickupScore',{ frames: [ 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]}),
      frameRate: 8,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atomScore03',
      frames: scene.anims.generateFrameNumbers('atomicPickupScore',{ frames: [ 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]}),
      frameRate: 6,
      randomFrame: true,
      repeat: -1
    }); scene.anims.create({
      key: 'atomScore04',
      frames: scene.anims.generateFrameNumbers('atomicPickupScore',{ frames: [ 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]}),
      frameRate: 4,
      randomFrame: true,
      repeat: -1
    });




    /*scene.textures.addSpriteSheetFromAtlas('coinPickup01Anim', { atlas: 'megaAtlas', frameWidth: 16, frameHeight: 20,
        frame: 'coinPickup01Anim.png'
    }); scene.anims.create({
        key: 'coin01idle',
        frames: scene.anims.generateFrameNumbers('coinPickup01Anim',{ frames: [ 0,1,2,3,4,5,6]}),
        frameRate: 8,
        repeat: -1
    });*/
    scene.anims.create({
        key: 'coin01idle',
        frames: scene.anims.generateFrameNumbers('coinPickup01Anim',{ frames: [ 0,1,2,3,4,5,6,7]}),
        frameRate: 8,
        repeat: -1
      })
  
    scene.textures.addSpriteSheetFromAtlas('electronCloudAnim', { atlas: 'megaAtlas', frameWidth: 22 ,frameHeight: 18,
        frame: 'electronCloudAnim.png'
    }); scene.anims.create({
      key: 'electronIdle',
      frames: scene.anims.generateFrameNumbers('electronCloudAnim',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]}),
      frameRate: 16,
      repeat: -1
    }); scene.anims.create({
      key: 'electronDispersion01',
      frames: scene.anims.generateFrameNumbers('electronCloudAnim',{ frames: [ 20, 21, 22, 23, 24, 25]}),
      frameRate: 16,
      repeat: 0,
    });

    /*
    scene.textures.addSpriteSheetFromAtlas('electron2Test', { atlas: 'megaAtlas', frameWidth: 44 ,frameHeight: 36,
        frame: 'electronCloudAnim.png'
    });
    scene.anims.create({
        key: 'electronDispersion01',
        frames: scene.anims.generateFrameNumbers('electronCloudAnim',{ frames: [ 20, 21, 22, 23, 24, 25]}),
        frameRate: 16,
        repeat: 0,
      }); */

    scene.anims.create({
    key: 'blackholeForm',
    frames: scene.anims.generateFrameNumbers('blackholeAnim',{ frames: [ 0,1,2,3,4,5]}),
    frameRate: 8,
    repeat: 0,
    });

    scene.anims.create({
    key: 'blackholeIdle',
    frames: scene.anims.generateFrameNumbers('blackholeAnim',{ frames: [ 6,7,8,9,10,11]}),
    frameRate: 12,
    repeat: -1,
    });

    scene.anims.create({
        key: 'blackholeClose',
        frames: scene.anims.generateFrameNumbers('blackholeAnim',{ frames: [ 5,4,3,2,1]}),
        frameRate: 8,
        repeat: 0,
        hideOnComplete: true
    });

    scene.anims.create({
        key: 'extractHoleIdle',
        frames: scene.anims.generateFrameNumbers('extractHole',{ frames: [ 0,1,2,3,4,5,6,7]}),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: 'extractHoleClose',
        frames: scene.anims.generateFrameNumbers('extractHole',{ frames: [ 8,9,10,11,12,13,14,15]}),
        frameRate: 8,
        repeat: 0,
        hideOnComplete: true
    });

    scene.anims.create({
    key: 'CapElectronDispersion',
    frames: scene.anims.generateFrameNumbers('CapElectronDispersion',{ frames: [ 0,1,2,3,4,5,6,7,8,9]}),
    frameRate: 16,
    repeat: 0,
    hideOnComplete: true
    });
  
    scene.textures.addSpriteSheetFromAtlas('boostMeterAnim', { atlas: 'megaAtlas', frameWidth: 128 , frameHeight: 24,
        frame: 'UI_boostMeterAnim.png'
    }); scene.anims.create({
      key: 'increasing',
      frames: scene.anims.generateFrameNumbers('boostMeterAnim', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ] }),
      frameRate: 8,
      repeat: -1,
    });

    
  
    //WRAP_BLOCK_ANIMS
    /*scene.textures.addSpriteSheetFromAtlas('wrapBlockAnim', { atlas: 'megaAtlas', frameWidth: 12,frameHeight: 12,
        frame: 'wrapBlockAnim.png'
    }); scene.anims.create({
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
    })*/



    
    //scene.textures.addSpriteSheetFromAtlas('boostTrailX', { atlas: 'megaAtlas', frameWidth: 24,frameHeight:72,
        //frame: 'boostTrailX01Anim.png'
    scene.anims.create({
      key: 'CapSpark1',
      frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}),
      frameRate: 16,
      repeat: 0
    });
    scene.anims.create({
        key: 'CapSpark2',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ,0,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark3',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 2, 3, 4, 5, 6, 7, 8, 9 ,0 ,1,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark4',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 3, 4, 5, 6, 7, 8, 9, 0, 1, 2,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark5',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 4, 5, 6, 7, 8, 9, 0, 1, 2, 3,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark6',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 5, 6, 7, 8, 9, 0, 1, 2, 3, 4,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark7',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 6, 7, 8, 9, 0, 1, 2, 3, 4, 5,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark8',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 7, 8, 9, 0, 1, 2, 3, 4, 5, 6,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark9',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 8, 9, 0, 1, 2, 3, 4, 5, 6, 7,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSpark0',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 9, 0, 1, 2, 3, 4, 5, 6, 7, 8,10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
      scene.anims.create({
        key: 'CapSparkFinale',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}),
        frameRate: 16,
        repeat: -1
      });
    scene.anims.create({
        key: 'CapSparkDissipate',
        frames: scene.anims.generateFrameNumbers('UI_CapSpark',{ frames: [ 10,11,12,13,14]}),
        frameRate: 16,
        repeat: 0
      })
  }
// #endregion

var tempHeightDiff = 16;

// #region Config
var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    backgroundColor: '#bbbbbb', //'#4488aa'
    width: 640, 
    height: 360,// + tempHeightDiff * GRID,
    min: {
        width: 640,
        height: 360
    },
    snap: {
        width: 640,
        height: 360
    },
    pipeline: { WaveShaderPipeline },
    //renderer: Phaser.AUTO,
    parent: 'phaser-example',
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    //roundPixels: true,
    //pixelArt: false, // if not commented out and set to false, will still override scale settings.
    scale: {
        zoom: Phaser.Scale.MAX_ZOOM,
        mode: Phaser.Scale.FIT,
    },
    //parent: 'phaser-example',
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
    audio: 
        { 
            disableWebAudio: false // allows Phaser to use better Web Audio API
        }, 
    input: {
            pauseOnBlur: false // This prevents the game from pausing tabbing out
        },
    dom: {
        createContainer: true,
    },
    maxLights: 16, // prevents lights from flickering in and out -- don't know performance impact
    
    scene: [ StartScene, MainMenuScene, QuickMenuScene, GalaxyMapScene, PersistScene, SpaceBoyScene, GameScene, InputScene, ScoreScene, TutorialScene]
};

// #region Screen Settings
export const SCREEN_WIDTH = config.width;
export const SCREEN_HEIGHT = config.height;   // Probably should be named to GAME_SCREEN Height. 29 * GRID

// Edge locations for X and Y
export const END_X = SCREEN_WIDTH/GRID - 1;
export const END_Y = SCREEN_HEIGHT/GRID - 1;

// Collision only works if GRID is whole divisor of HEIGHT and WIDTH
if (SCREEN_HEIGHT % GRID != 0) {
    debugger
    throw "SCREEN HEIGHT DOESN'T DIVIDE INTO GRID EVENLY SILLY";
}

// region const Game


export const game = new Phaser.Game(config);





