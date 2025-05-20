import { Food } from './classes/Food.js';
import { Portal } from './classes/Portal.js';
import { Coin } from './classes/Coin.js';
import { SpawnArea } from './classes/SpawnArea.js';
import { Snake } from './classes/Snake.js';


import { PORTAL_COLORS, PORTAL_TILE_RULES, TRACKS } from './const.js';
import { STAGE_UNLOCKS, STAGES, EXTRACT_CODES, checkRank, checkRankGlobal, checkCanExtract, GAUNTLET_CODES} from './data/UnlockCriteria.js';
import { STAGE_OVERRIDES } from './data/customLevels.js';
import { TUTORIAL_PANELS } from './data/tutorialScreens.js';
import { QUICK_MENUS } from './data/quickMenus.js';



//******************************************************************** */
//                              SnakeHole
//******************************************************************** */
// GameSettings 

const IS_DEV = false;
const ANALYTICS_VERS = "0.3.241018";
const DEV_BRANCH = "dev";

const ANALYTICS_ON = false;
const TUTORIAL_ON = false;


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
const DEBUG_SKIP_INTRO = true;
const SCORE_SCENE_DEBUG = false;
const DEBUG_SHOW_LOCAL_STORAGE = true;
const DEBUG_SKIP_TO_SCENE = false;
const DEBUG_SCENE = "GameScene"
//const DEBUG_ARGS = {
//    stage:"World_0-1"
//}

/* QuickMenuScene
const DEBUG_ARGS = {
    menuOptions: QUICK_MENUS.get("adventure-mode"), 
    textPrompt: "MODE SELECTOR",
    cursorIndex: 1,
    sideScenes: false
}*/
const DEBUG_ARGS = new Map ([

    ["ScoreScene", {
        bonks: 0,
        boostFrames: 5994,
        cornerTime: 7317,
        diffBonus: 100,
        foodLog: [120,113,115,112,113,110,114,116,117,113,113,111,119,113,111,114,114,118,112,111,114,111,117,110,112,109,119,111],
        //James 0-1 Best [120,113,115,112,113,110,114,116,117,113,113,111,119,113,111,114,114,118,112,111,114,111,117,110,112,109,119,111],
        medals: {},
        moveCount: 840,
        turns: 198,
        stage: "World_0-1",
        mode: 3, // MODES.CLASSIC
        uuid: "723426f7-cfc5-452a-94d9-80341db73c7f",
        zedLevel: 84,
        sRank: 31000
    }],
    ["GameScene", {
        stage:"World_0-1",
    }],
]);


const DEBUG_FORCE_EXPERT = false;
const EXPERT_CHOICE = true;

const START_RANDOM = true;

const DEBUG_FORCE_GAUNTLET = true;
const DEBUG_GAUNTLET_ID = "Easy_Gauntlet"


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

const NO_BONK_BASE = 2400;

const STAGE_TOTAL = STAGES.size;



//debug stuff
export const PORTAL_PAUSE = 2; 




const RANK_NUM_1 = 2000000; 
/* Rank 1 History
412505 - James 11/9
534,888 = James 11/12
617,749 = James 11/12
1,629,617 = James 12-13
*/


const RANK_AMOUNT = 100;
const RANK_STEP = RANK_NUM_1 / RANK_AMOUNT;

const EXPERT_RANK_HIGHEST = 256;
const EXPERT_RANK_STEP = EXPERT_RANK_HIGHEST / RANK_AMOUNT;


// #region Utils Functions

var calcPlayerRank = function (sumOfBest) {
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

var calcExpertRank = function (rankScore) {
    var testVal = 0;
    var counter = 0;

    do {
        testVal += EXPERT_RANK_STEP;
        counter += 1;
    } while (testVal < rankScore);

    return Math.max(RANK_AMOUNT - counter, 1)

}


// Speed Multiplier Stats
const a = 3660; // Average Score 
const lm = 28; // Minimum score
const lM = 3360 ; // Theoretical max score = 28 * MAX_SCORE

var calcStageScore = function (x) {
    /**
     * Would be great to put a JSDoc here
     */
    // 1 = 1
    // 50 = 51
    // 229 = 247
    // 1633 = 3229    Rank C
    // 2395 = 8588    Rank B
    // 2888 = 21855   Rank A
    // 3007 = 31087   World 0-1 Rank S 
    // 3119 = 80,816
    // 3183 = 71,558
    
    var result = -1 * (x / 
        ((1/a) * (x - (lM - lm)))
    ); 


    //var _speedBonus = Math.floor(-1* ((x-lm) / ((1/a) * ((x-lm) - (lM - lm)))));
    return Math.floor(result);
}

var calcRankScore = function() {

    var letterAccumulator = [0,0,0,0,0,0];
    var expertRank = 0;

    if (localStorage.getItem("extractRanks")) {
        var bestExtractions = new Map(JSON.parse(localStorage.getItem("extractRanks")));

        EXTRACT_CODES.forEach( extractKey => {
            if (bestExtractions.has(extractKey)) {
                var bestExtract = bestExtractions.get(extractKey);
                var cumulative = 0;
                
                if (bestExtract != "Classic Clear") {
                    
                    for (let index = 0; index < bestExtract.length; index++) {
                        var _rank = bestExtract[index][0];
                        cumulative += _rank;
                        letterAccumulator[_rank] += 1;
                    }

                    var bestExtractRank = cumulative / bestExtract.length; 
                    var extractRank = Math.floor(bestExtractRank);
                    letterAccumulator[extractRank] += 1;
                }
            }
        });
    }

    for (let index = 0; index < letterAccumulator.length; index++) {
        expertRank += letterAccumulator[index] * (2 ** index);
    }

    return expertRank;
}

var genHardcorePaths = function() {

    var parentToChild = new Map();
    var childToParent = new Map();
    
    var stageSet = new Set();
    var hardcorePaths = [];

    EXTRACT_CODES.forEach( code => {

        var stages = code.split("|");
        stages.forEach( stageID => {
            stageSet.add(stageID);
            parentToChild.set(stageID, []); // Empty are end nodes.
            childToParent.set(stageID, []); // Set them all as the parent node. Only one at the end should be left as empty.
        });  
    });

    // Don't need to sort stageSet as long as they start sorted like they are.
    var sorted = Phaser.Utils.Array.SortByDigits([...stageSet]);

    var navSlots = [];
    
    var first = Phaser.Math.RND.weightedPick(sorted);

    Phaser.Utils.Array.Remove(sorted, first);

    Phaser.Utils.Array.Add(navSlots, [first,first,first,first]);
    

    do {

        var _nextID = Phaser.Math.RND.weightedPick(sorted);
        Phaser.Utils.Array.Remove(sorted, _nextID);
        // find nav slot
        var _parentNode = Phaser.Utils.Array.GetRandom(navSlots);
        Phaser.Utils.Array.Remove(navSlots, _parentNode);

        // add to map
        parentToChild.get(_parentNode).push(_nextID);
        childToParent.get(_nextID).push(_parentNode);

        // add nav slots
        Phaser.Utils.Array.Add(navSlots, [_nextID, _nextID]); // Two possible paths per node.
        
    } while (sorted.length > 0);

    var addToPath = function(path, key) {
        
        var source = childToParent.get(key)[0];
        var nextPath;

        if (source) {
            if (path === "") {
                nextPath = source + "|" + key;
            } else {
                nextPath = source + "|" + path;
            }
            var nextPath = addToPath(nextPath, source);

        } else {
            nextPath = path;
        }
        return nextPath;
    }

    parentToChild.forEach( (value, key) => {
        if (value.length === 0 ) {
            var _path = "";
            var path = addToPath(_path, key);
            hardcorePaths.push(path);
        }
    });

    var sortedPaths = Phaser.Utils.Array.SortByDigits(hardcorePaths);

    return sortedPaths; 
}



var generateNavMap = function (codes) {
    var navMap = new Map();
    var pairSet = new Set();
    var stageSet = new Set();

    codes.forEach( code => {
    var codeArray = code.split("|");

    do {
        var _pair = codeArray.slice(0,2);
        stageSet.add(_pair[0]);
        stageSet.add(_pair[1]);
        navMap.set(_pair[0], []);

        var _pairCode = _pair.join("|");
        pairSet.add(_pairCode);

        codeArray.shift(); // Remove the first.

        
    } while (codeArray.length > 1); // Only look at pairs.

    });

    pairSet.forEach( pairCode => {
        var _pair = pairCode.split("|");
        navMap.get(_pair[0]).push(_pair[1]);
    })

    return navMap;
    
}

const NAV_MAP = generateNavMap(EXTRACT_CODES);



var updateSumOfBest = function(scene) {
    /***
     *  This most important thing this function does is update the bestOfStageData object.
     *  That is used to check if a black hole should be spawned to a new level.
     */
    let entries = Object.entries(localStorage);
    scene.stagesCompleteExpert = 0;
    scene.stagesCompleteAll = 0;
    scene.stagesCompleteTut = 0;

    scene.sumOfBestExpert = 0;
    scene.sumOfBestAll = 0;
    scene.sumOfBestTut = 0;

    BEST_OF_ALL = new Map();
    BEST_OF_EXPERT = new Map ();
    BEST_OF_TUTORIAL = new Map ();


    scene.scene.get("StartScene").UUID_MAP.keys().forEach( uuid => {
        var tempJSONClassic = JSON.parse(localStorage.getItem(`${uuid}_best-Classic`));
        var tempJSONExpert = JSON.parse(localStorage.getItem(`${uuid}_best-Expert`));

        // TODO: Check both and take the highest value.
        // TODO: Make Sure the codex pulls from this data, but score screen best and unlock best do not pull from here.
        var _scoreTotalClassic;
        if (tempJSONClassic) { // False if not played stage before.
            var _stageDataClassic = new StageData(tempJSONClassic);
            _stageDataClassic.zedLevel = calcZedObj(scene.zeds).level;
            _scoreTotalClassic = _stageDataClassic.calcTotal();
        }
        else {
            _scoreTotalClassic = 0;
            
        }

        var _scoreTotalExpert;
        if (tempJSONExpert) {
            var _stageDataExpert = new StageData(tempJSONExpert);
            _stageDataExpert.zedLevel = calcZedObj(scene.zeds).level;
            scene.stagesCompleteExpert += 1;

            BEST_OF_EXPERT.set(_stageDataExpert.stage, _stageDataExpert);

            _scoreTotalExpert = _stageDataExpert.calcTotal();
            scene.sumOfBestExpert += _scoreTotalExpert;
        } else {
            _scoreTotalExpert = 0
        }
        
        switch (true) {
            case _scoreTotalClassic - _scoreTotalExpert === 0:
                // Never played in both modes
                // Do Nothing
                break;
            case _scoreTotalExpert > _scoreTotalClassic:
                scene.sumOfBestAll += _scoreTotalExpert;
                scene.stagesCompleteAll += 1;
                BEST_OF_ALL.set(_stageDataExpert.stage, _stageDataExpert);
                break;
        
            default:
                scene.sumOfBestAll += _scoreTotalClassic;
                scene.stagesCompleteAll += 1;
                BEST_OF_ALL.set(_stageDataClassic.stage, _stageDataClassic);
                break;
        }

    })

    TUTORIAL_UUIDS.forEach( uuid => {
        var tempJSON = JSON.parse(localStorage.getItem(`${uuid}_best-Tutorial`));
        if (tempJSON != null) {
            var _stageDataTut = new StageData(tempJSON);
            _stageDataTut.zedLevel = calcZedObj(scene.zeds).level;
            scene.stagesCompleteTut += 1;

            BEST_OF_TUTORIAL.set(_stageDataTut.stage, _stageDataTut);

            scene.sumOfBestTut += _stageDataTut.calcTotal();  
        }
    });
}

var tempSumOfBest = function(scene, stageData) {
    // Dont think this logic works correctly. Should check if you want to use it.
    var sumOfBest = 0;

    scene.scene.get("StartScene").UUID_MAP.keys().forEach( uuid => {
        var tempJSONClassic = JSON.parse(localStorage.getItem(`${uuid}_best-Classic`));
        var tempJSONExpert = JSON.parse(localStorage.getItem(`${uuid}_best-Expert`));

        var _scoreTotalClassic;
        var _currentStageTotal;
        if (tempJSONClassic) { // False if not played stage before.
            var _stageDataClassic = new StageData(tempJSONClassic);
            _stageDataClassic.zedLevel = calcZedObj(scene.scene.get("PersistScene").zeds).level;

            _scoreTotalClassic = _stageDataClassic.calcTotal();

            if (_stageDataClassic.stage === stageData.stage) {
                _currentStageTotal = stageData.calcTotal();
            } else {
                _currentStageTotal = 0;
            }

        }
        else {
            _scoreTotalClassic = 0; 
            _currentStageTotal = 0;  
        }

        var _scoreTotalExpert
        if (tempJSONExpert) {
            var _stageDataExpert = new StageData(tempJSONExpert);
            _stageDataExpert.zedLevel = calcZedObj(scene.scene.get("PersistScene").zeds).level;

            _scoreTotalExpert = _stageDataExpert.calcTotal();
    
        } else {
            _scoreTotalExpert = 0;
        }

        

        var scoreToAdd = Math.max(_scoreTotalClassic, _scoreTotalExpert,  _currentStageTotal);

        sumOfBest += scoreToAdd;
        

    });

    return sumOfBest;
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
        ["totalCoinsCollected", PLAYER_STATS.totalCoinsCollected ?? 0],
        ["expertCoinsNotSpawned", PLAYER_STATS.expertCoinsNotSpawned ?? 0],
        ["atomsOverEaten", PLAYER_STATS.atomsOverEaten ?? 0],
        ["longestBody", PLAYER_STATS.longestBody ?? 0],
    ]);

    // Add Saved Values
    statsWithDefaults.keys().forEach( key => {
        PLAYER_STATS[key] = statsWithDefaults.get(key);
    });

    // Calculate Values
    PLAYER_STATS.stagesFinished = Math.floor(PLAYER_STATS.atomsEaten / 28);
}

export var updatePlayerStats = function (stageData) {
    var oldKeyList = ["atomsOverAte",
    "globalStore",
    "overEat"]

    oldKeyList.forEach( key => {
        if (key in PLAYER_STATS) {
            delete PLAYER_STATS[key];
        }
    });

    if (stageData) {
        PLAYER_STATS.bonks += stageData.bonks;
        PLAYER_STATS.atomsEaten += stageData.foodLog.length;
        PLAYER_STATS.turns += stageData.turns;
        PLAYER_STATS.stagesFinished = Math.floor(PLAYER_STATS.atomsEaten / 28);  
    }
    
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


export var BEST_OF_ALL = new Map (); // STAGE DATA TYPE
export var BEST_OF_EXPERT = new Map ();
var BEST_OF_TUTORIAL = new Map ();

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

const ZED_CONSTANT = 64;
const ZEDS_LEVEL_SCALAR = 0.015;
const ZEDS_OVERLEVEL_SCALAR = 0.15;
var calcZedObj = function (remainingZeds, reqZeds=0, level=0) {
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
        zedsLevel = calcZedObj(remainingZeds, nextLevelZeds, level);
    }
    else {
        remainingZeds = nextLevelZeds - remainingZeds;
        zedsLevel = {
            level:level, 
            zedsToNext: remainingZeds, 
            zedsRequired: nextLevelZeds, 
            zedsThisLevel: nextLevelZeds - remainingZeds}
    }

    return zedsLevel;
}


var zedtest = calcZedObj(114476);
var zedtest2 = calcZedObj(2306 * 120);

const FADE_OUT_TILES = [104,17,18,19,20,49,50,51,52,81,82,83,84,
    113,114,115,116,145,146,147,148,177,178,179,180,209,210,211,212,215,241,242,243,244,247];
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
    GRAND_MASTER: 5
});

const RANK_LETTERS = new Map([
    [RANKS.WOOD, "D"],
    [RANKS.BRONZE, "C"],
    [RANKS.SILVER, "B"],
    [RANKS.GOLD, "A"],
    [RANKS.PLATINUM, "S"],
    [RANKS.GRAND_MASTER, "PS"]
]);


// S rank on 0-1 Atom time :3008
const RANK_BENCHMARKS = new Map([
    // Calibrated for use with Stage Score
    [RANKS.GRAND_MASTER, COMBO_ADD_FLOOR], // Max Combo
    [RANKS.GOLD, 22000],  //  2888 ATOM TIME 
    [RANKS.SILVER, 8600], //  2395
    [RANKS.BRONZE, 3300], //  1633
    [RANKS.WOOD, 0],

]);

export const MODES = Object.freeze({
    TUTORIAL: 0,
    PRACTICE: 1,
    ADVENTURE: 2,
    CLASSIC: 3,
    EXPERT: 4,
    HARDCORE: 5,
    GAUNTLET: 6,
});

export const MODES_TEXT = new Map([
    [MODES.PRACTICE, "Practice"],
    [MODES.CLASSIC, "Classic"],
    [MODES.EXPERT, "Expert"],
    [MODES.GAUNTLET, "Gauntlet"],
    [MODES.TUTORIAL, "Classic"],

]);


const MODE_LOCAL = new Map([
    // Maps where a run should be saved in playing in different modes. Only Expert is tracked seperatly.
    // Meaning any stage played in any other mode and you get new highscore will be saved and tracked in the overall rankings.
    [MODES.CLASSIC, "Classic"],
    [MODES.GAUNTLET, "Classic"],
    [MODES.HARDCORE, "Classic"],
    [MODES.EXPERT, "Expert"],
    [MODES.TUTORIAL, "Tutorial"]
]);

const SAFE_MIN_WIDTH = "550px"
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
const COLOR_FOCUS_HEX = 0xFF00FF;
const COLOR_BONUS = "limegreen";
const COLOR_BONUS_HEX = 0x32CD32;
const COLOR_TERTIARY = "goldenrod";
const COLOR_TERTIARY_HEX = 0xdaa520;


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
    ['rankS', [ 'rankS.ogg', 'rankS.mp3' ]],
    ['rankGM', [ 'chime01.ogg', 'chime01.mp3']] // TO REPLACE
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
export const START_STAGE = 'World_0-1'; // World_0-1 Warning: Cap sensitive in the code but not in Tiled. Can lead to strang bugs.
export const START_UUID = "723426f7-cfc5-452a-94d9-80341db73c7f"; //"723426f7-cfc5-452a-94d9-80341db73c7f"
const TUTORIAL_UUID =     "e80aad2f-f24a-4619-b525-7dc3af65ed33";
var END_STAGE = 'Stage-06'; // Is var because it is set during debugging UI

const TUTORIAL_UUIDS = [
    "e80aad2f-f24a-4619-b525-7dc3af65ed33",
    "72cb50a1-6f72-4569-9bd5-ab3b23a87ea2",
    "4c577a41-07a0-4aea-923e-d33c36893027"
];

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

/** 
 Template Scene

class __Scene extends Phaser.Scene {
    constructor () {
        super({key: '__Scene', active: false});
    }
    init() {
    }
    create() {
    }
}

*/

// #region SpaceBoyScene
class SpaceBoyScene extends Phaser.Scene {
    constructor () {
        super({key: 'SpaceBoyScene', active: false});
    }
    init() {
        this.spaceBoyPowered = false;
        this.spaceBoyReady = false;
        this.navLog = [];
        this.maxBin = 0;
        this.prevZedLevel = 0;
        this.zedSegments = [];
        //this.zedBar = this.add.graphics();
    }
    create() {
        //this.sound.mute = true; //TEMP MUTE SOUND

        const spaceboyFontColorHex = 0x1f211b;
        const persist = this.scene.get("PersistScene");
        const ourGame = this.scene.get("GameScene");

        
        // Create the sprites and apply initial dark tint
        // Initial Setup
        this.UI_ScorePanel = this.add.sprite(X_OFFSET + GRID * 23.5, 0, 'UI_ScorePanel')
            .setOrigin(0, 0).setDepth(0).setTint(0x555555);
        this.UI_StagePanel = this.add.sprite(GRID * 6.5 - 1, GRID * 6.5 + 2, 'UI_StagePanel')
            .setOrigin(0, 0).setDepth(0).setTint(0x555555);
        this.UI_InventoryBG = this.add.sprite(X_OFFSET + GRID * 29 +1, GRID * 10, 'UI_InventoryBG')
        .setOrigin(0, 0).setDepth(0);
            
        //this.comboBG = this.add.sprite(GRID * 6.75, 0,'comboBG')
        //.setDepth(10).setOrigin(0.0,0.0).setTint(0x555555);

        this.UI_SpaceBoi = this.add.sprite(SCREEN_WIDTH/2,SCREEN_HEIGHT/2,
            'UI_SpaceBoi').setOrigin(0.5,0.5).setDepth(101);
        this.UI_SpaceBoi.setPipeline('Light2D');

        this.lights.enable().setAmbientColor(0x555555);
        
        this.light =  this.lights.addLight(0, 0, 200).setScrollFactor(0).setIntensity(1.5);

        // LOGIC
        this._scoreTweenShown = false;

        // AUDIO

        this.buttonHover01 = this.sound.add('buttonHover01', { allowMultiple: true });

        // Create an invisible interactive zone for volume dial and the music player zone

        this.powerButtonZone = this.add.zone(GRID * 2.25, GRID * 6.5,
            36, 36).setInteractive().setOrigin(0,0).setDepth(100); 
        // debugging bounding box for powerButtonZone
        //this.add.graphics().lineStyle(2, 0xff0000)
        //.strokeRectShape(this.powerButtonZone).setDepth(102);

        
        this.UI_PowerSwitch = this.add.sprite(GRID * 3.5, GRID * 6.5,
            'UI_PowerSwitch').setOrigin(0.0,0.0).setDepth(105);

        this.powerButtonZone.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');

        });
        this.powerButtonZone.on('pointerout', () => {
            this.input.setDefaultCursor('default');

        }); 

        this.powerButtonZone.on('pointerdown', () => {   
            if (this.spaceBoyPowered === false) {
                this.spaceBoyPowered = true;
                this.UI_PowerSwitch.y -= 24;
                this.powerButtonZone.y -= 24;
                
                this.tweens.add({
                    targets: this.spaceBoyLight,
                    alpha: {from: 0, to: 1},
                    duration: 600,
                    ease: 'Sine.Out',
                    delay: 0,
                });

                this.tweens.add({
                    targets: this.light,
                    x: SCREEN_WIDTH,
                    ease: 'Phaser.Math.Easing.Circular.InOut',
                    duration: 1800,
                    delay: 0,
                    onUpdate: function (tween, target) {
                        // Update the vertical position based on the parabolic path 
                        var t = target.x;
                        target.y = parabolicPath(t);
                        },
                    repeat: 0,
                    yoyo: false
                });
                this.tweens.add({
                    targets: this.spaceBoiMaskSprite,
                    scaleX: 0,
                    duration: 400,
                    ease: 'Sine.Out',
                    delay: 200,
                    onComplete: () =>{
                        const UI_SpaceBoiFX = this.UI_SpaceBoi.postFX.addShine(1.5, .5, 10);
                        this.tweens.add({
                            targets: this.UI_SpaceBoi,
                            alpha: 0,
                            duration: 1000,
                            ease: 'Sine.Out',
                            delay: 1400,
                            onComplete: () =>{
                                this.blankScreen.destroy();
                                this.blankScreenInventory.destroy();
                                this.blankScreenBoost.destroy();
                                this.spaceBoyReady = true;
                                this.scene.get("MainMenuScene").pressToPlayTween.play();
                                this.scene.get("PinballDisplayScene").pinballballPowerOn();
                                // Tween to remove the dark tint and transition back to default
                                this.tweens.add({
                                    targets: { value: 0 }, // Tween a dummy value
                                    value: 100, // End dummy value
                                    ease: 'Linear', // Easing function
                                    duration: 500, // Duration of the tween
                                    onUpdate: (tween) => {
                                        const progress = tween.getValue() / 100;

                                        const startTint = Phaser.Display.Color.ValueToColor(0x555555);
                                        const endTint = Phaser.Display.Color.ValueToColor(0xffffff);

                                        const r = Phaser.Math.Interpolation.Linear([startTint.red, endTint.red], progress);
                                        const g = Phaser.Math.Interpolation.Linear([startTint.green, endTint.green], progress);
                                        const b = Phaser.Math.Interpolation.Linear([startTint.blue, endTint.blue], progress);

                                        const tintValue = Phaser.Display.Color.GetColor(r, g, b);

                                        this.UI_ScorePanel.setTint(tintValue);
                                        this.UI_StagePanel.setTint(tintValue);
                                        //this.comboBG.setTint(tintValue);
                                    },
                                    //onUpdateScope: this // Ensure 'this' refers to the scene
                            });
                            }
                        });  
                        
                    },
                });
                this.tweens.addCounter({
                    from: 0,
                    to: 359, // 360 colors, index from 0 to 359
                    duration: 2000,
                    loop: 0,
                    onUpdate: (tween) => {
                        const i = Math.floor(tween.getValue());
                
                        // Update the light color
                        let color = hsv[i].color;
                        this.light.setColor(color);
                
                        // Calculate the progress of the tween
                        const progress = tween.progress;
                
                        // Calculate the ambient light color transition from 0x555555 to 0xFFFFFF
                        const startColor = Phaser.Display.Color.ValueToColor(0x161616);
                        const endColor = Phaser.Display.Color.ValueToColor(0xFFFFFF);
                        const r = Phaser.Math.Interpolation.Linear([startColor.red, endColor.red], progress);
                        const g = Phaser.Math.Interpolation.Linear([startColor.green, endColor.green], progress);
                        const b = Phaser.Math.Interpolation.Linear([startColor.blue, endColor.blue], progress);
                
                        const ambientColor = Phaser.Display.Color.GetColor(r, g, b);
                        this.lights.setAmbientColor(ambientColor);
                    }
                });
                if (DEBUG_SKIP_INTRO){
                    var tweens = this.tweens.getTweens();
                    tweens.forEach(tween => {
                         tween.complete();
                    });
                    this.blankScreen.destroy();
                    this.blankScreenInventory.destroy();
                    this.blankScreenBoost.destroy();
                    this.spaceBoyReady = true;
                }
            }
            else{
                //temporary solution for resetting the game -- doesn't preserve object permanence
                window.location.reload();
            }
        });
        

        
        

        
        // for black screen before game is presented
        this.blankScreen = this.add.graphics();
        this.blankScreen.fillStyle(0x161616, 1);
        this.blankScreen.fillRect(X_OFFSET, Y_OFFSET, 346, 324).setDepth(51);

        this.blankScreenInventory = this.add.graphics();
        this.blankScreenInventory.fillStyle(0x161616, 1);
        this.blankScreenInventory.fillRect(X_OFFSET + 346, Y_OFFSET + GRID * 6, GRID * 8,
             GRID * 21).setDepth(51);

        this.blankScreenBoost = this.add.graphics();
        this.blankScreenBoost.fillStyle(0x161616, 1);
        this.blankScreenBoost.fillRect(SCREEN_WIDTH/2 - 62,GRID * 1.5 - 8,
            124,16).setDepth(51);

        this.spaceBoiMaskSprite = this.add.sprite(SCREEN_WIDTH/2 + GRID * 10.5,
            SCREEN_HEIGHT/2, 'UI_goalLabelMask').setDepth(101).setOrigin(1,0.5);
        this.spaceBoiMaskSprite.scaleX = 4;

        const spaceBoiMask = new Phaser.Display.Masks.BitmapMask(this,this.spaceBoiMaskSprite);

        this.UI_SpaceBoi.setMask(spaceBoiMask)
        this.spaceBoiMaskSprite.visible = false;
        this.UI_SpaceBoi.mask.invertAlpha = true;


        

        // Define the parabolic path function 
        function parabolicPath(t) {
            var a = 0.002;
            var h = SCREEN_WIDTH / 4 ;
            var k = SCREEN_HEIGHT / 4.5;
            return a * Math.pow(t - h, 2) + k;
        }

        const hsv = Phaser.Display.Color.HSVColorWheel();
        
        this.spaceBoyBase = this.add.sprite(0,0, 'spaceBoyBase').setOrigin(0,0).setDepth(52);
        
        this.mapProgressPanelText = this.add.bitmapText(GRID * 11, GRID * 4.125 + Y_OFFSET, 'mainFont', 
            "", 
            8).setOrigin(1.0,0.0).setDepth(100).setAlpha(0).setTintFill(spaceboyFontColorHex);

        
        this.zedTitle = this.add.bitmapText(GRID * 7 - 1 , GRID * 27 + 8, 'mainFont', 
            'ZEDS', 
        8).setOrigin(0,0).setDepth(91).setTintFill(spaceboyFontColorHex);

        var zobj = calcZedObj(persist.zeds);

        this.zedLevel = this.add.bitmapText(GRID * 11 + 6, GRID * 27 + 8, 'mainFont',
            zobj.level,
        8).setOrigin(1,0).setDepth(91).setTintFill(0x869D54);

        this.prevZedLevel = zobj.level;
        this.zedBarGraphics = this.add.graphics().setDepth(90);

        this.updateZedSegments(zobj.zedsRequired);

        // Middle UI
        this.CapSpark = this.add.sprite(X_OFFSET + GRID * 9 -2, GRID * 1.5).play(`CapSpark${Phaser.Math.Between(0,9)}`).setOrigin(.5,.5)
        .setDepth(100).setVisible(false);
        this.CapSpark.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function (anim, frame, gameObject) {
            this.setVisible(false)
        });

        this.shiftLight1 = this.add.sprite(X_OFFSET + GRID * 9 + 6, GRID * 2 + 7,
             'shiftLight',0).setOrigin(0,0).setDepth(53).setAlpha(0);
        this.shiftLight2 = this.add.sprite(X_OFFSET + GRID * 9 + 6 + 24, GRID * 2 + 7,
             'shiftLight',1).setOrigin(0,0).setDepth(53).setAlpha(0);
        this.shiftLight3 = this.add.sprite(X_OFFSET + GRID * 9 + 6 + 48, GRID * 2 + 7,
             'shiftLight',2).setOrigin(0,0).setDepth(53).setAlpha(0);
        this.shiftLight4 = this.add.sprite(X_OFFSET + GRID * 9 + 6 + 72, GRID * 2 + 7,
        'shiftLight',1).setOrigin(0,0).setDepth(53).setAlpha(0);
        this.shiftLight5 = this.add.sprite(X_OFFSET + GRID * 9 + 6 + 96, GRID * 2 + 7,
            'shiftLight',0).setOrigin(0,0).setDepth(53).setAlpha(0);
                  
        
        this.spaceBoyLight = this.add.sprite(X_OFFSET - GRID * 3.5 , GRID * 4 - 2, 'spaceBoyLight').
        setOrigin(0,0).setDepth(102).setAlpha(0);


        switch (persist.mode) {
            case MODES.CLASSIC:
                this.mapProgressPanelText.setText("ADVENTURE");
                break;
            case MODES.EXPERT:
                this.mapProgressPanelText.setText("EXPERT");
                debugger
                break;
            case MODES.GAUNTLET:
                this.mapProgressPanelText.setText("GAUNTLET");
                debugger
                break;
            case MODES.PRACTICE:
                this.mapProgressPanelText.setText("PRACTICE");
                debugger
                break;
            default:
                this.mapProgressPanelText.setText("SHIP LOG");
                break;
        }

        // #region UI HUD
        this.UIScoreContainer = this.make.container(0,0)
        if (this.startupAnim) {
            this.UIScoreContainer.setAlpha(0).setScrollFactor(0);
        }

        // #region Top Right UI
        this.bestScoreLabel = this.add.bitmapText(X_OFFSET + GRID * 24 + -1, GRID * .7 - 1,
             'mainFontLarge',`BEST:`,13)
        .setOrigin(0,0).setAlpha(0).setScrollFactor(0).setTint(0x1f211b);
        this.bestScoreValue = this.add.bitmapText(X_OFFSET + GRID * 34 + 2, GRID * .7 - 1 ,
             'mainFontLarge',`0`,13)
            .setOrigin(1,0).setAlpha(0).setScrollFactor(0).setTint(0x1f211b);

        // Score Text SET INVISIBLE
        this.scoreLabel = this.add.bitmapText(X_OFFSET + GRID * 24, GRID * 2.7 - 1,
            'mainFontLarge',`SCORE:`,13)
        .setOrigin(0,0).setAlpha(0).setScrollFactor(0).setTint(0x1f211b);
        this.scoreValue = this.add.bitmapText(X_OFFSET + GRID * 34 + 2, GRID * 2.7 - 1,
            'mainFontLarge',`0`, 13)
            .setOrigin(1,0).setAlpha(0).setScrollFactor(0).setTint(0x1f211b);


        //var scoreHeight = this.scoreValue.x + GRID * 2.7 - 2;
        this.deltaScoreUI = this.add.bitmapText(X_OFFSET + GRID * 34 - 4,  GRID * 4 + 5 , 'mainFont',` +`,8)
        .setOrigin(1,1).setAlpha(0).setScrollFactor(0).setTint(0x1f211b);

        this.UIScoreContainer.add([this.scoreLabel,this.scoreValue,
            this.bestScoreLabel,this.bestScoreValue, this.deltaScoreUI ]);

        // Length/Goal UI

        this.lengthGoalUI = this.add.bitmapText((X_OFFSET + GRID * 32.25) + 3, GRID * 3 + 1, 'mainFontLarge', ``, 13)
        .setAlpha(0).setScrollFactor(0).setTint(0x1f211b);
        this.lengthGoalUILabel = this.add.sprite((X_OFFSET + GRID * 29.0 + 6), GRID * 3 + 2, 'UI_goalLabel'
        ).setAlpha(0).setDepth(101).setOrigin(0,0).setScrollFactor(0);
        
        this.lengthGoalUIMaskSprite = this.add.sprite(X_OFFSET + GRID * 24,
            27, 'UI_goalLabelMask').setDepth(101).setOrigin(0,0);

        const lengthGoalUIMask = new Phaser.Display.Masks.BitmapMask(this,this.lengthGoalUIMaskSprite );
    
        this.lengthGoalUILabel.setMask(lengthGoalUIMask)
        this.lengthGoalUIMaskSprite.visible = false;
        this.lengthGoalUILabel.mask.invertAlpha = true;
        this.updateZedDisplay(calcZedObj(persist.zeds));

        console.log('SPACE BOY SCENE',this.lights.lights);
    }

    loseCoin(){
        // Create the new coin with Matter physics
        this.coinsUICopy = this.matter.add.sprite(X_OFFSET + GRID * 20 + 5, 2, 'megaAtlas', 'coinPickup01Anim.png', {
            //frictionAir: 0.1, //frictionAir bugs when repeatedly bonking
        }).play('coin01idle').setDepth(101).setOrigin(0, 0);
    
        // Set the initial velocity for the new coin
        this.coinsUICopy.setVelocity(
            Phaser.Math.Between(-2, 1), // x velocity
            Phaser.Math.Between(-2, -4)  // y velocity
        );

        //this.coinsUICopy.setVelocity(Phaser.Math.Between(-20, 100), Phaser.Math.Between(-100, -200));
        //this.coinsUICopy.setGravity(0,400)
        //TODO add coin flip here
        //TODO trigger UI coin loader animation here
    }

    updateZedSegments(maxZeds) {

        if (this.zedSegments.length > 0) {
            this.zedSegments.forEach( seg => {
                seg.destroy();
            });
            this.zedSegments = [];
        } else {
            this.zedSegments = [];
        }
        this.zedSegments = [];
        this.zedBarGraphics.clear();

        var segments;
        //var deltaX = 4;
        var startX = GRID * 7 + 3;
        var barY = GRID * 28 + 8;
        
        switch (true) { // ALL NEED TO BE BALANCED  James Zeds = 127947 12/17
            case maxZeds < 750:
                segments = 7; // 127
                var xOffsets = [0, 8, 15, 22, 30, 37, 44];
                for (let index = 0; index < segments; index++) {

                    var zedSeg;
                    if (index === 0 || index === 3 || index === 6) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg7', 1
                        ).setDepth(91).setOrigin(0,0);
                        
                    } else {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg6', 1
                        ).setDepth(91).setOrigin(0,0); 
                    }
                    this.zedSegments.push(zedSeg);
                }
                
                break;

            case maxZeds < 1500:
                segments = 8; // 511
                var xOffsets = [0, 7, 14, 20, 26, 32, 38, 45];
                for (let index = 0; index < segments; index++) {
                    var zedSeg;
                    if (index === 0 || index === 1 || index === 6 || index === 7) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg6', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg5', 1
                        ).setDepth(91).setOrigin(0,0);
                    }
                    this.zedSegments.push(zedSeg);
                }
                break

            case maxZeds < 4000:
                segments = 9; // 2_047
                var xOffsets = [0, 6, 12, 18, 24, 29, 35, 41, 47];
                for (let index = 0; index < segments; index++) {
                    var zedSeg;
                    if (index === 4) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg3', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg4', 1
                        ).setDepth(91).setOrigin(0,0);
                    }
                    this.zedSegments.push(zedSeg);
                }
                break

            case maxZeds < 6000:
                segments = 10; // 2_047
                var xOffsets = [0, 6, 11, 16, 21, 26, 31, 36, 41, 46];
                for (let index = 0; index < segments; index++) {
                    var zedSeg;
                    if (index === 0 || index === 9) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg5', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg4', 1
                        ).setDepth(91).setOrigin(0,0);
                    }
                    this.zedSegments.push(zedSeg);
                }
                break

            case maxZeds < 14245:
                segments = 13 // 16_383
                var deltaX = 4;
                for (let index = 0; index < segments; index++) {
                    var zedSeg = this.add.sprite(startX + deltaX * index, barY, 'zedBarSeg3', 1
        
                    ).setDepth(91).setOrigin(0,0);
                    this.zedSegments.push(zedSeg); 
                }

                break

            case maxZeds > 14245: // Over leveled.
                segments = 15; // 131_071   
                var xOffsets = [1, 3, 6,9, 12, 15, 18, 21, 24, 27, 30, 33, 37, 42, 47];
                this.add.sprite(startX + 0, barY, 'zedBarSeg1', 1).setDepth(91).setOrigin(0,0);
                //this.add.sprite(startX + 50, barY, 'zedBarSeg1', 1).setDepth(91).setOrigin(0,0);
                for (let index = 0; index < segments; index++) {
                    var zedSeg;
                    if (index === 0) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg2', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else if (index === 11) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg3Cap', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else if (index === 12 || index === 13) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSegEnd', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else if (index === 14) {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSegEnd', 1
                        ).setDepth(91).setOrigin(0,0);
                    } else {
                        zedSeg = this.add.sprite(startX + xOffsets[index], barY, 'zedBarSeg3', 1
                        ).setDepth(91).setOrigin(0,0);
                    }
                    this.zedSegments.push(zedSeg);
                }
                break

            //case maxZeds < 20000: // Over leveled here?
            //    segments = 24; // 33_554_431
            //    break

            default:
                segments = 26 // 134_217_727
                break;
        }

        
        //var segments = 13;

        this.maxBin = (2 ** segments) - 1;

       
        this.zedBarGraphics.lineStyle(2, 0x1F211B, 1); // ave bar
        this.zedBarGraphics.strokeRect(startX - 2, barY - 1, 
            13 * 4 + 2 , 5
        );

        this.zedBarGraphics.fillStyle(0x869D54);
        this.zedBarGraphics.fillRect(startX - 1, barY - 2 + 1, 
            13 * 4 + 1, 5
        );
        

    }
    updateZedDisplay(zobj) {
    
        this.zedSegments.forEach( seg => {
            seg.setFrame(2);
        });

        var progress = parseInt(this.maxBin * ( 1 * (zobj.zedsThisLevel / zobj.zedsRequired)));

        if (progress < 0) {
            progress = this.maxBin;  
            //debugger        
        }
        
        var progBin = progress.toString(2);

        var reversed = progBin.split("").reverse().join("");

        for (let index = 0; index < reversed.length; index++) {
            switch (reversed[index]) {
                case "0":
                    this.zedSegments[index].setFrame(0);
                    break;
                case "1":
                    this.zedSegments[index].setFrame(1);
                    break;
            
                default:
                    debugger // safety switch
                    break;
            } 
        }

        progBin.length;
        //this.zedBar.clear();
        //this.zedBar.setDepth(200);

        //this.zedBar.lineStyle(1, 0xFFFFFF, 2);
        //this.zedBar.strokeRect(GRID * 5 , barY, 5, 5);
        //this.zedBar.lineStyle(2, 0xffffff, 1); // ave bar
        //this.zedBar.strokeRect(X_OFFSET + GRID * 1, barY, 
        //    5, 
        //5);


    }
    setLog(currentStage) {
        // #region Ship Log
        while (this.navLog.length > 0) {
            var log = this.navLog.pop();
            log.destroy();
            log = null;
        }

        // Do it from the history.
        const persist = this.scene.get("PersistScene");
        var offset = 12;
        var index = 0;

        if (persist.stageHistory.length > 0) {
            persist.stageHistory.forEach(stageData => {
                
                var _stageText = this.add.bitmapText(GRID * 11, Y_OFFSET + GRID * 5.125 + offset * index,
                'mainFont', 
                   `${stageData.stage.split("_")[1]} ${RANK_LETTERS.get(stageData.stageRank())}`, 
               8).setOrigin(1,0.0).setDepth(100).setTintFill(0x1f211b);

               this.navLog.push(_stageText);
               index++;
            }); 
        }

        var stageID = currentStage.split("_")[1];
        var stageText = this.add.bitmapText(GRID * 11, Y_OFFSET + GRID * (5.125) + offset * index,
         'mainFont', 
            `${stageID}`, 
        8).setOrigin(1,0.0).setDepth(100).setTintFill(0x1f211b);

        
        var stageOutLine = this.add.rectangle(GRID * 11 + 1.5, Y_OFFSET + GRID * (5.125) + offset * index, stageID.length * 5 + 3, 10,  
            ).setOrigin(1,0).setDepth(100).setAlpha(1);
        stageOutLine.setFillStyle(0x000000, 0);
        stageOutLine.setStrokeStyle(1, 0x1f211b, 1);
        this.navLog.push(stageText, stageOutLine);

    }
    shiftLightsDim(){
        this.tweens.add({
            targets: [this.shiftLight1,this.shiftLight2,this.shiftLight3,this.shiftLight4,this.shiftLight5],
            alpha: 0,
            ease: 'Sine.InOut',
            duration: 500,
        });
    }

    
    scoreTweenShow(){
        this._scoreTweenShown = true;
        this.tweens.add({
            targets: this.UIScoreContainer,
            y: (0),
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: 0,
            yoyo: false
          });
          this.tweens.add({
            targets: [this.scoreLabel, this.scoreValue],
            alpha:0,
            ease: 'Sine.InOut',
            delay: 500,
            duration: 500,
            repeat: 0,
            yoyo: false
        })
          this.tweens.add({
            targets: [this.bestScoreValue, this.bestScoreLabel],
            alpha: 1,
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: 0,
            yoyo: false
          });
          this.tweens.add({
            targets: [this.lengthGoalUI, this.lengthGoalUILabel],
            alpha: 1,
            ease: 'Sine.InOut',
            delay: 500,
            duration: 500,
            repeat: 0,
            yoyo: false
        });
    }
    scoreTweenHide(){
        this._scoreTweenShown = false;
        if (this.UIScoreContainer.y === 0) {
            this.tweens.add({
                targets: this.UIScoreContainer,
                y: (- GRID * 2),
                ease: 'Sine.InOut',
                duration: 800,
                repeat: 0,
                yoyo: false
            });
            this.tweens.add({
                targets: [this.bestScoreValue, this.bestScoreLabel],
                alpha: 0,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
            });

            this.tweens.add({
                targets: [this.scoreLabel, this.scoreValue],
                alpha:1,
                ease: 'Sine.InOut',
                delay: 500,
                duration: 500,
                repeat: 0,
                yoyo: false
            })
        }
    }
    scoreTweenVanish(){
        this.tweens.add({
            targets: this.UIScoreContainer,
            y: (- GRID * 2),
            ease: 'Sine.InOut',
            duration: 800,
            repeat: 0,
            yoyo: false
        });
        this.tweens.add({
            targets: [this.bestScoreValue, this.bestScoreLabel],
            alpha: 0,
            ease: 'Sine.InOut',
            duration: 1000,
            repeat: 0,
            yoyo: false
        });

        this.tweens.add({
            targets: [this.scoreLabel, this.scoreValue],
            alpha:0,
            ease: 'Sine.InOut',
            delay: 500,
            duration: 500,
            repeat: 0,
            yoyo: false
        })
        this.tweens.add({
            targets: [this.lengthGoalUI, this.lengthGoalUILabel],
            alpha: 0,
            ease: 'Sine.InOut',
            delay: 500,
            duration: 500,
            repeat: 0,
            yoyo: false
        });
    }
}

class MusicPlayerScene extends Phaser.Scene {
    constructor () {
        super({key: 'MusicPlayerScene', active: false});
    }
    init() {
        this.startedOnce = false;
        this.musicOpacity = 0;

        this.shuffledTracks = Phaser.Math.RND.shuffle([...TRACKS.keys()]);
        this.startTrack = this.shuffledTracks.pop();

        this.music = this.sound.add(`track_${this.startTrack}`,{
            volume: 0.33
        });

        // used to check if player intentionally pressed button,
        // not if the feature state is on or off
        this.playerPaused = false;
        this.playerLooped = false;
    }
    preload() {
        this.load.spritesheet('uiVolumeIcon', 'assets/sprites/ui_volumeIcon.png',{ frameWidth: 10, frameHeight: 8 });
        this.load.image('uiVolumeSlider', 'assets/sprites/ui_volumeSlider.png');
        this.load.image('uiVolumeSliderWidget', 'assets/sprites/ui_volumeSliderWidget.png');
        this.load.image('uiVolumeSliderWidgetRendered', 'assets/sprites/ui_VolumeSliderWidgetRendered.png');
        this.load.spritesheet('mediaButtons','assets/sprites/UI_MediaButtons.png',{ frameWidth: 18, frameHeight: 16 });

    }
    create() {
        const ourGame = this.scene.get("GameScene");

        this.soundManager = this.sound;

        // Start volume at 50%
        this.soundManager.volume = 0.5;

        // Create an invisible interactive zone for volume dial and the music player zone
        this.volumeControlZone = this.add.zone(X_OFFSET + GRID * 36, GRID * 1.5,
             24, 36).setInteractive().setOrigin(0,0).setDepth(1);
        this.musicPlayerZone = this.add.zone(X_OFFSET + GRID * 34, GRID * 0.5,
            64, 104).setInteractive().setOrigin(0,0).setDepth(0);;
        // debugging bounding box
        //this.add.graphics().lineStyle(2, 0xff0000).strokeRectShape(this.musicPlayerZone);

        // speaker icon above slider
        this.volumeIcon = this.add.sprite(X_OFFSET + GRID * 33.5 + 2,
            GRID * 7.5 + 8, 'uiVolumeIcon',0).setDepth(100).setAlpha(0);
        // volume slider icon
        this.volumeSlider = this.add.sprite(X_OFFSET + GRID * 33.5 + 2,
            GRID * 4.5  + 8, 'uiVolumeSlider').setDepth(100).setAlpha(0);
        // mask sprite
        this.volumeSliderWidgetMask = this.add.sprite(X_OFFSET + GRID * 33.5 + 2,
            GRID * 4.5  + 8, 'uiVolumeSliderWidget').setDepth(101);
        // rendered sprite
        this.volumeSliderWidgetReal = this.add.sprite(X_OFFSET + GRID * 33.5 + 2,
            GRID * 4.5  + 8, 'uiVolumeSliderWidgetRendered').setDepth(101).setAlpha(0);

        const volumeMask = new Phaser.Display.Masks.BitmapMask(this,this.volumeSliderWidgetMask);
        this.volumeSlider.setMask(volumeMask)
        this.volumeSliderWidgetMask.visible = false;
        this.volumeSlider.mask.invertAlpha = true;

        // is mouse hovering over volume wheel OR the entire music player area?
        this.isVolumeControlActive = false;

        this.volumeControlZone.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                this.isVolumeControlActive = true;
                this.musicOpacity = 1;
                var show = true;
                ourGame.musicPlayerDisplay(show);
            }
            
        });
        this.volumeControlZone.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.isVolumeControlActive = false
        }); 

        this.musicPlayerZone.on('pointerover', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                this.musicOpacity = 1;
                var show = true;
                ourGame.musicPlayerDisplay(show);
            }
            
        });
        this.musicPlayerZone.on('pointerout', () => {
            var show = false;
            ourGame.musicPlayerDisplay(show);
            if (this.isVolumeControlActive === false) {
                this.musicOpacity = 0;
            }
        });

        // Listen for mouse wheel events
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                if (this.isVolumeControlActive){
                    let volumeChange;
                    //checks for mouse scroll up or down
                    if (deltaY > 0) {
                        volumeChange = -0.125; 
                    } 
                    else {
                        volumeChange = 0.125; 
                    }
                    // clamp volume from 0-1
                    this.soundManager.volume = Phaser.Math.Clamp(this.soundManager.volume + volumeChange, 0, 1);
                    this.updatedVolume = this.soundManager.volume + volumeChange
                    
                    // y values for adjusting the volumeSliderWidget and Mask
                    const minY = this.volumeSlider.y - this.volumeSlider.height/2;
                    const maxY = this.volumeSlider.y + this.volumeSlider.height/2;
                    const newY = minY + (maxY - minY) * (1 - this.updatedVolume);
                    
                    // this console log is one event call behind hence this.updatedVolume
                    //console.log(`Volume: ${this.soundManager.volume}, Slider Y: ${newY}`);

                    // set volume icon based on volume level
                    if (newY >= minY && newY <= maxY) {
                        this.volumeSliderWidgetMask.y = newY;
                        this.volumeSliderWidgetReal.y = newY;

                        if (this.updatedVolume === 0) {
                            this.volumeIcon.setFrame(3);
                        }
                        else if (this.updatedVolume > 0 && this.updatedVolume <= 0.33) {
                            this.volumeIcon.setFrame(2);
                        }
                        else if (this.updatedVolume > 0.33 && this.updatedVolume <= 0.66) {
                            this.volumeIcon.setFrame(1);
                        }
                        else if (this.updatedVolume > 0.66)
                            this.volumeIcon.setFrame(0);
                        }
                    }
                }      
        });
        
        // Buttons
        var columnX = X_OFFSET + GRID * 36 + 1;

        this.trackIDLabel = this.add.bitmapText(columnX - GRID * 4 -5, GRID * 7.75 + 1, 'mainFont', `TRACK`, 8
        ).setOrigin(1,0).setScale(1).setAlpha(0).setScrollFactor(0).setTintFill(0x1f211b);
        this.trackID = this.add.bitmapText(columnX - GRID * 3, GRID * 7.75 + 1, 'mainFont', `000`, 8
        ).setOrigin(1,0).setScale(1).setAlpha(0).setScrollFactor(0).setTintFill(0x1f211b);
        this.trackID.setDepth(80);
        this.trackID.setText(this.startTrack);

        // Loop Button
        this.loopButton = this.add.sprite(columnX , GRID * 7.75, 'mediaButtons', 4
        ).setOrigin(0.5,0).setDepth(80).setScale(1).setInteractive();
        
        
        this.loopButton.on('pointerdown', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                if (!this.playerLooped) {
                    this.playerLooped = true;
                    this.loopButton.setFrame(5);
                }
                else{
                    this.playerLooped = false;
                    this.loopButton.setFrame(4);
                }
            }
        }, this);
        
    
        // Pause Button
        this.pauseButton = this.add.sprite(columnX , GRID * 4.75, 'mediaButtons', 0
        ).setOrigin(0.5,0).setDepth(80).setScale(1).setInteractive();
        

        this.pauseButton.on('pointerdown', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                // is music playing?
                if (this.music.isPlaying) {
                    this.pauseButton.setFrame(1);
                    this.music.pause();
                    this.playerPaused = true;
                }  
                // does music exist? and if so is it paused?
                else if (this.music.isPaused) {
                    this.pauseButton.setFrame(0);
                    this.playerPaused = false;
                    this.music.resume();
                } 
                // this will unpause the player and queue a new song if
                // entered game scene in a paused state
                else {
                    this.pauseButton.setFrame(0);
                    this.playerPaused = false;
                    this.nextSong();
                }   
            }
        }, this);

        // Next Button
        this.nextButton = this.add.sprite(columnX , GRID * 6.25, 'mediaButtons', 2
        ).setOrigin(0.5,0).setDepth(80).setScale(1).setInteractive();

        this.nextButton.on('pointerdown', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                // if looping enabled, disable
                if (this.playerLooped) {
                    this.playerLooped = false;
                    this.loopButton.setFrame(4);
                }
                this.nextButton.setFrame(3);
                this.music.stop();
                this.nextSong();
                if (this.pauseButton.frame.name === 1) {
                    console.log('working')
                    this.pauseButton.setFrame(0)
                }
            } 
        }, this);
        

        // on mouse click up, only nextButton resets to unpressed state
        this.input.on('pointerup', function(pointer){
            this.nextButton.setFrame(2);
        }, this);

        // when music pauses, button updates accordingly
        this.music.on('pause', () => {
            this.pauseButton.setFrame(1);
        }, this);

        // checks whether cursor is over any button and then changes cursor to hand
        function setupButtonCursor(button, scene) {
            button.on('pointerover', () => {
                scene.input.setDefaultCursor('pointer');
                scene.musicOpacity = 1;
                var show = true;
                ourGame.musicPlayerDisplay(show);
            });
            button.on('pointerout', () => {
                scene.input.setDefaultCursor('default');
                scene.musicOpacity = 0;
                var show = false;
                ourGame.musicPlayerDisplay(show);
            });
        }
        setupButtonCursor(this.loopButton, this);
        setupButtonCursor(this.nextButton, this);
        setupButtonCursor(this.pauseButton, this);
         
        //pauses and resumes sound so queued sfx don't play all at once upon resuming
        window.addEventListener('focus', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                this.sound.pauseAll(); // ensures all sounds do NOT play when clicking back into game (prevents unwanted noises)
                this.music.resume(); //resumes all music instances so old tracks need to be stopped properly
                if (this.playerPaused) {
                    this.music.pause(); //keeps music paused if player clicked pause button
                }
                else{
                    this.pauseButton.setFrame(0);
                }
            }
        });
        
        window.addEventListener('blur', () => {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                this.pauseButton.setFrame(1);
                this.sound.pauseAll(); // this prevents sound from being able to resume
            }
        });

    }
    update () {
        if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
            let targetOpacity = Phaser.Math.Interpolation.Linear(
                [this.volumeSlider.alpha, this.musicOpacity], 0.25);
            this.volumeSlider.alpha = targetOpacity;
            this.volumeSliderWidgetReal.alpha = targetOpacity;
        }
    }

    /*showPlayer() {
        this.tweens.add({
            targets: [this.volumeIcon,this.volumeSlider,this.volumeSliderWidgetReal],
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 300,
            repeat: 0,
            yoyo: false,
        });
    }
    
    hidePlayer() {
        this.tweens.add({
            targets: [this.volumeIcon,this.volumeSlider,this.volumeSliderWidgetReal],
            alpha: { from: 1, to: 0 },
            ease: 'Sine.InOut',
            duration: 300,
            repeat: 0,
            yoyo: false,
        });
    }*/

   showTrackID(){
    this.tweens.add({
        targets: [this.trackIDLabel,this.trackID, this.volumeIcon],
        alpha: 1,
        ease: 'Sine.InOut',
        duration: 750,
        repeat: 0,
        yoyo: false,
    });

   }

    stopMusic() {
        this.sound.sounds.forEach((sound) => {
            sound.stop();
        });
    }

    startMusic() {
        //if (!START_RANDOM) { //commenting out until functionality can return
             // check that a song isn't already playing so we don't add more than 1
            // when looping back to the main menu
            if (!this.music.isPlaying && !this.playerPaused) {
                this.startedOnce = true; // Place holder until I fix track 86
                if (!this.startedOnce) {
                    console.log('music playing from startMusic()')
                    this.music = this.sound.add(`track_86`,{
                        volume: 0.2
                    });
                    this.music.play();
                    
                } else {
                    this.nextSong();
                }
                
            }
        //}

    }
    nextSong (songID) {
        // we call stop here before calling next song to delete old instances of music
        // prevents songs from double playing
        this.stopMusic();
        switch (songID) {
            case `track_149`: // Game Over Song
                this.music.stop();
                this.music = this.sound.add(`track_149`,{
                    volume: 0.33
                });

                this.music.play();
                this.trackID.setText(149);
                
                break;

            case `track_175`: // Red Alert Song
                this.music.stop();
                this.music = this.sound.add(`track_175`,{
                    volume: 0.33
                });

                this.music.play();
                this.trackID.setText(175);

                this.music.play();
                this.music.on('complete', () => {
                    this.nextSong();
                }, this);
                
                break;

            default: // Everything else
                if (this.playerLooped) {
                    this.music.play();
                }
                else {
                    if (this.shuffledTracks.length != 0) {
                    } else {
                        this.shuffledTracks = Phaser.Math.RND.shuffle([...TRACKS.keys()]);
                    }

                    var track = this.shuffledTracks.pop();

                    this.music = this.sound.add(`track_${track}`,{
                        volume: 0.33
                    });

                    this.music.play();
                    this.music.on('complete', () => {
                        this.nextSong();
                    }, this); 
                    
                    this.trackID.setText(track);
                }

                break;
        }
    }
}

class PinballDisplayScene extends Phaser.Scene {
    constructor () {
        super({key: 'PinballDisplayScene', active: false});
    }
    init() {
    }
    preload(){
        this.load.image('comboBG','assets/sprites/UI_comboBG.png');
        this.load.image('comboCover', 'assets/sprites/UI_comboCover.png');
        this.load.image('UI_comboReady', 'assets/sprites/UI_comboCoverReady.png');
        this.load.spritesheet('UI_comboSnake','assets/sprites/UI_ComboSnake.png',{ frameWidth: 28, frameHeight: 28 });
        this.load.spritesheet("comboLetters", "assets/sprites/comboLetters.png",{ frameWidth: 18, frameHeight: 24 });
        this.load.image('UI_comboBONK','assets/sprites/UI_comboCoverBONK.png');
    }
    create() {
        //this.scene.bringToTop('PinballDisplayScene');

        //const ourGame = this.scene.get("GameScene");

        // pinball display/combo cover comboCover comboBG
        this.comboCover = this.add.sprite(GRID * 6.75, GRID * 0 + 2,'comboBG')
        .setOrigin(0.0,0.0).setDepth(52).setScrollFactor(0).setAlpha(1).setTint(0x555555);

        this.comboCoverFG = this.add.sprite(GRID * 6.75, GRID * 0 + 2,'comboCover')
        .setOrigin(0.0,0.0).setDepth(53).setScrollFactor(0).setAlpha(0);

        // 'READY?' text sprite
        this.comboCoverReady = this.add.sprite(GRID * 15, 2, 'UI_comboReady', 0
        ).setOrigin(1,0.0).setDepth(100).setScrollFactor(0).setAlpha(0);

        // pinball display snake face
        this.comboCoverSnake = this.add.sprite(GRID * 15.125, 1, 'UI_comboSnake', 0
        ).setOrigin(0.0,0.0).setDepth(101).setScrollFactor(0).setAlpha(0);

        // combo letters
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

        
        
        // 'BONK!!!' text sprite
        this.comboCoverBONK = this.add.sprite(GRID * 17.5, 2, 'UI_comboBONK', 0
        ).setOrigin(0.0,0.0).setDepth(100).setScrollFactor(0).setAlpha(0);

        // Pinball Display masks container
        this.comboMasks = []
        this.comboMasks.push(this.letterC,this.letterO,this.letterM,this.letterB,
            this.letterO2,this.letterExplanationPoint,this.comboCoverSnake,
             this.comboCoverBONK,this.comboCoverReady)

        this.comboMasksContainer = this.make.container(GRID * 6.75, GRID * 0);
        this.comboMasksContainer.add(this.comboMasks);

        this.comboMasksContainer.setVisible(false);


        this.comboCoverFG.mask = new Phaser.Display.Masks.BitmapMask(this, this.comboMasksContainer);

        this.comboCoverFG.mask.invertAlpha = true;
    }

    pinballballFGOn(){
        this.tweens.add({
            targets: this.comboCoverFG,
            alpha: 1,
            ease: 'Linear',
            duration: 500,
        })
    }
    pinballballFGOff(){
        this.tweens.add({
            targets: this.comboCoverFG,
            alpha: 0,
            ease: 'Linear',
            duration: 500,
        })
    }

    //power the screen on
    pinballballPowerOn(){
        this.tweens.add({
            targets: { value: 0 }, // Tween a dummy value
            value: 100, // End dummy value
            ease: 'Linear', // Easing function
            duration: 500, // Duration of the tween
            onUpdate: (tween) => {
                const progress = tween.getValue() / 100;

                const startTint = Phaser.Display.Color.ValueToColor(0x555555);
                const endTint = Phaser.Display.Color.ValueToColor(0xffffff);

                const r = Phaser.Math.Interpolation.Linear([startTint.red, endTint.red], progress);
                const g = Phaser.Math.Interpolation.Linear([startTint.green, endTint.green], progress);
                const b = Phaser.Math.Interpolation.Linear([startTint.blue, endTint.blue], progress);

                const tintValue = Phaser.Display.Color.GetColor(r, g, b);

                this.comboCover.setTint(tintValue);
            },
            onUpdateScope: this // Ensure 'this' refers to the scene
        });
    }

    resetPinball(){
        this.comboMasks.forEach((element) => {
            if (element !== this.comboCoverSnake) {
                element.setAlpha(0);
            }
        });
        
    }
    resetPinballFull(){
        this.comboMasks.forEach((element) => {
            element.setAlpha(0);
        });
    }
}

class PlinkoMachineScene extends Phaser.Scene {
    constructor () {
        super({key: 'PlinkoMachineScene', active: false});
    }
    init() {
        this.zedIndex = 1;
        this.zedsToAdd = 0;
        this.countDownTween = null;
        this.plinkoLightNum = 0;
    }
    create() {
        var matterJSON = this.cache.json.get('collisionData');

        this.lights.enable();
        this.lights.setAmbientColor(0x555555);

        this.plinkoBoard = this.add.sprite(GRID * 9.8, GRID * 24.25,
            'plinkoBoard').setOrigin(0,0).setDepth(52).setPipeline('Light2D');
        this.plinkoBoardMatterShape = this.matter.add.gameObject(this.plinkoBoard, { shape: matterJSON.plinkoBoard, isStatic: true });

        // Overhead Light (above the plinko board, and below the bezel)
        this.plinkoLight = this.lights.addLight(GRID * 9.8, GRID * 22.25, 100)
        .setColor(0xffffff).setIntensity(0);

        this.plinkoLightR = this.lights.addLight(GRID * 11.5, GRID * 21, 40)
        .setColor(0xff0000).setIntensity(0);

        this.plinkoLightO = this.lights.addLight(GRID * 11.5, GRID * 22, 40)
        .setColor(0xff8300).setIntensity(0);

        this.plinkoLightY = this.lights.addLight(GRID * 11.5, GRID * 23, 40)
        .setColor(0xfffb00).setIntensity(0);

        this.plinkoLightG = this.lights.addLight(GRID * 11.5, GRID * 24, 40)
        .setColor(0x32ff00).setIntensity(0);

        this.plinkoLightT = this.lights.addLight(GRID * 11.5, GRID * 25, 40)
        .setColor(0x00e7ff).setIntensity(0);

        this.plinkoLightB = this.lights.addLight(GRID * 11.5, GRID * 25.75, 40)
        .setColor(0x002cff).setIntensity(0);

        this.plinkoLightV = this.lights.addLight(GRID * 11.5, GRID * 26.25, 40)
        .setColor(0x9b00ff).setIntensity(0);

        this.plinkoLightP = this.lights.addLight(GRID * 11.5, GRID * 27, 40)
        .setColor(0xff00ef).setIntensity(0);


        this.plinkoBoardBG = this.add.sprite(GRID * 6 + 7, GRID * 21.5,
            'plinkoBoardBG').setOrigin(0,0).setDepth(40);
        
        

        var tubeData = [
            // Starting Top Tube
            // new tube{ x: GRID * 7, y: GRID * 10, width: 2, height: 255, angle: 0, originX: 0, originY:1 },
            //{ x: GRID * 7.8, y: GRID * 10, width: 2, height: 255, angle: 0, originX: 0, originY:1  },


            { x: GRID * 7.1, y: GRID * 13.8, width: 1, height: 184, angle: 0 },
            { x: GRID * 7.9, y: GRID * 13.8, width: 1, height: 184, angle: 0 },
            
            // Leftmost horizontal platforms
            //{ x: GRID * 8.5 - 2 , y: GRID * 22 + 2, width: 27, height: 0.5, angle: 1.25 },
            //{ x: GRID * 8.5 - 1, y: GRID * 22 + 18.5, width: 25, height: 0.5, angle: 1.25 },
            //{ x: GRID * 8.5 - 1, y: GRID * 22 + 34.5, width: 25, height: 0.5, angle: 1.25 },
            //{ x: GRID * 8.5 - 1, y: GRID * 22 + 50.5, width: 25, height: 0.5, angle: 1.25 },
            // Rightmost horizontal platforms
            //{ x: GRID * 9 , y: GRID * 22 - 5, width: 27, height: 0.5, angle: 3 },
            //{ x: GRID * 9 + 2, y: GRID * 22 + 10.5, width: 20, height: 0.5, angle: -1.25 },
            //{ x: GRID * 9 + 2, y: GRID * 22 + 26.5, width: 20, height: 0.5, angle: -1.25 },
            //{ x: GRID * 9 + 2, y: GRID * 22 + 42, width: 20, height: 0.5, angle: -1.25 },
            //{ x: GRID * 9 + 2, y: GRID * 22 + 59, width: 30, height: 0.5, angle: -2 },
            // Left wall
            //{ x: GRID * 7.5 + 2, y: GRID * 24 + 2, width: 2, height: 48, angle: 0 },
            // Right wall
            //{ x: GRID * 9.5 + 19, y: GRID * 24 + 2, width: 24, height: 80, angle: 0 },
            // Diagonol Wall
            // Outer Curve
            //{ x: GRID * 7 + 4, y: GRID * 17 + 60, width: 10, height: 2, angle: 22.5 },
            //{ x: GRID * 6.5 + 2, y: GRID * 17 + 54, width: 20, height: 2, angle: 45 },
            //{ x: GRID * 6 - 0, y: GRID * 17 + 46, width: 10, height: 2, angle: 67.5 },
            // Inner Curve
            //{ x: GRID * 7.5 - 2, y: GRID * 17 + 46, width: 20, height: 2, angle: 45 },

        ];

        
        for (var i = 0; i < tubeData.length; i++) {
            var data = tubeData[i];
            var tube = this.matter.add.rectangle(data.x, data.y, data.width, data.height, {
                 isStatic: true // Ensure the tube is immovable 
            });

            this.matter.body.setAngle(tube, Phaser.Math.DegToRad(data.angle)); // Apply the angle separately 
            
            tube.friction = 0; // Set the friction of the tube to 0 
        }

        this.plinkoSensor = this.matter.add.rectangle(GRID * 7 + 6,  GRID * 27 + 10, 5, 5, {
            isSensor: true ,
            isStatic: true
        });

        const spaceBoy = this.scene.get("SpaceBoyScene");
        //spaceBoy.zedTitle.setText('+0');
        //this.spawnPlinkos(1);
        //console.log('PLINK SCENE',this.lights.lights);

    }
    spawnPlinkos(number) {
        const spaceBoy = this.scene.get("SpaceBoyScene");
        const persist = this.scene.get("PersistScene");
    
        this.plinkoLightNum += 1;
        //console.log('PLINKOS',number,this.plinkoLightNum)
        // Array of all plinko lights
        const lights = [
            this.plinkoLightP, 
            this.plinkoLightV, 
            this.plinkoLightB,
            this.plinkoLightT,
            this.plinkoLightG,
            this.plinkoLightY,
            this.plinkoLightO,
            this.plinkoLightR
        ];
        

        // Determine which light to activate based on the number
        let lightToActivate;
        if (this.plinkoLightNum >= 4 && this.plinkoLightNum <= 8) {
            lightToActivate = this.plinkoLightP;
        } else if (this.plinkoLightNum >= 8 && this.plinkoLightNum <= 11) {
            lightToActivate = this.plinkoLightV;
        } else if (this.plinkoLightNum >= 12 && this.plinkoLightNum <= 15) {
            lightToActivate = this.plinkoLightB;
        } else if (this.plinkoLightNum >= 16 && this.plinkoLightNum <= 19) {
            lightToActivate = this.plinkoLightT;
        } else if (this.plinkoLightNum >= 20 && this.plinkoLightNum <= 23) {
            lightToActivate = this.plinkoLightG;
        } else if (this.plinkoLightNum >= 24 && this.plinkoLightNum <= 27) {
            lightToActivate = this.plinkoLightY;
        } else if (this.plinkoLightNum >= 28 && this.plinkoLightNum <= 31) {
            lightToActivate = this.plinkoLightO;
        } else if (this.plinkoLightNum === 32) {
            lightToActivate = this.plinkoLightR;
        }
    
        if (number > 0) {
            this.tweens.add({
                targets: this.plinkoLight,
                intensity: 1,
                ease: 'Sine.InOut',
                duration: 750,
                repeat: 0,
                yoyo: false,
            });
    
            var delay = 275;
    
            // TOP SPAWN
            var plinkoDisc = this.matter.add.sprite(GRID * 7.5, GRID * 18, 'plinkoDisc', null, {
                shape: {
                    type: 'polygon',
                    radius: 3.7,
                    sides: 4,
                }
            }).setDepth(40).setTint(0xb1b1b1); 
    
            plinkoDisc.setOnCollideWith(this.plinkoSensor, pair => {
                this.zedsToAdd += this.zedIndex;
    
            // Turn off all previous lights
            lights.forEach(light => {
                this.tweens.add({
                    targets: light,
                    intensity: 0,
                    ease: 'Sine.InOut',
                    duration: 200,
                    repeat: 0,
                    yoyo: false,
                });
            });
                
    
                // Add the tween for the selected light
                if (lightToActivate) {
                    this.tweens.add({
                        targets: lightToActivate,
                        intensity: 1.5,
                        ease: 'Sine.InOut',
                        duration: 200,
                        repeat: 0,
                        yoyo: false,
                    });
                }




                var zedText = this.add.dom(GRID * 15 , GRID * 27 + 6, 'div', Object.assign({}, STYLE_DEFAULT, {
                    color: COLOR_FOCUS,
                    //'color': '#FCFFB2',
                    'font-weight': '400',
                    'text-shadow': '0 0 4px #FF9405, 0 0 12px #000000',
                    'font-size': '22px',
                    'font-family': 'Oxanium',
                    'padding': '3px 8px 0px 0px',
                })).setOrigin(0,0).setScale(.5);
                
                this.tweens.add({
                    targets: zedText,
                    alpha: { from: 1, to: 0.0 },
                    y: zedText.y - 18,
                    ease: 'Sine.InOut',
                    duration: 750,
                    repeat: 0,
                    yoyo: false,
                    onComplete: () => {
                        zedText.removeElement();
                    }
                });


                zedText.setText(`+${this.zedIndex}`);
                spaceBoy.zedTitle.setText(`+${this.zedsToAdd}`);

                //console.log("Add", this.zedIndex, " Zeds for a total", this.zedsToAdd);
                this.zedIndex += 1;

                if (number === 0) {
                    this.plinkoLightNum = 0;
                    // On final plinko's collision
                    // Turn off all previous lights
                    lights.forEach(light => {
                        this.tweens.add({
                            targets: light,
                            intensity: 0,
                            ease: 'Sine.InOut',
                            duration: 200,
                            delay: 1000,
                            repeat: 0,
                            yoyo: false,
                        });
                    });
                    this.tweens.add({
                        targets: this.plinkoLight,
                        intensity: 0,
                        ease: 'Sine.InOut',
                        duration: 750,
                        delay:450,
                        repeat: 0,
                        yoyo: false,
                    });
                    var sineChain = this.tweens.chain({
                        targets: spaceBoy.zedTitle,
                        //paused: true,
                        tweens: [
                            {
                                alpha: { from: 0, to: 1 },
                                duration: 300,
                                delay: 300
                            },
                            {
                                alpha: { from: 1, to: 0 },
                                ease: 'Sine.InOut',
                                duration: 500, //600
                                loop: 1, // 3
                                yoyo: true
                            },
                            {
                                alpha: { from: 1, to: 1 },
                                ease: 'Sine.InOut',
                                duration: 300,
                                //delay: 100,
                                repeat: 0,
                                yoyo: false,
                            }
                        ]
                    });
                    
                    sineChain.on("complete", function() {

                        this.zedIndex = 1;

                        var zedsRequired = calcZedObj(persist.zeds).zedsRequired;
                        var zedsPerSegment = spaceBoy.maxBin / zedsRequired;

                        var zedCache = 0;
    

                        this.countDownTween = this.tweens.addCounter({
                            from: this.zedsToAdd,
                            to: 0,
                            duration: 66 * this.zedsToAdd * zedsPerSegment, // 50
                            ease: 'linear',
                            onUpdate: tween => {
                                this.zedsToAdd = parseInt(tween.getValue());
                                spaceBoy.zedTitle.setText(`+${Math.ceil(tween.getValue())}`);

                                var zeds = persist.zeds - tween.getValue();

                                if (zedCache != zeds) {
                                    var displayedZorb = calcZedObj(zeds);
                                    zedCache = zeds;
                                }

                                if (this.prevZedLevel != displayedZorb.level) {
                                    spaceBoy.zedLevel.setText(displayedZorb.level);
                                    spaceBoy.updateZedSegments(displayedZorb.zedsRequired);
                                    this.prevZedLevel = displayedZorb.level;
                                }

                                spaceBoy.updateZedDisplay(displayedZorb);
                            },
                            onComplete: tween => {
                                spaceBoy.zedTitle.setText('ZEDS');
                                spaceBoy.zedTitle.setAlpha(1);
                                spaceBoy.updateZedDisplay(calcZedObj(persist.zeds));
                                this.zedsToAdd = 0;
                            }  
                        });

                        

                        //spaceBoy.updateZedDisplay(persist.zeds);
                    }, this);
                    
                }
                // Do something
            }, this);
            


            //plinkoDisc.setCircle(3.33);
            var friction = Phaser.Math.FloatBetween(0.013, 0.005);
            var randomDelay = Phaser.Math.Between(0,34);
            plinkoDisc.setBounce(0.0);
            plinkoDisc.setFriction(0.000);
            plinkoDisc.setFrictionAir(friction);
            plinkoDisc.setFixedRotation();

            number--;
            this.time.delayedCall(delay - randomDelay, this.spawnPlinkos, [number], this);
        } else {
            console.log('Finished Visual Pinko Spawning');
            return
        }
    
    }
}

// #region TutorialScene
class TutorialScene extends Phaser.Scene {
    constructor () {
        super({key: 'TutorialScene', active: false});
    }
    create(tutorialPanels) {

        this.scene.bringToTop('MusicPlayerScene');

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
            const spaceBoy = scene.scene.get("SpaceBoyScene");
            const ourPersist = scene.scene.get("PersistScene");
            if (scene.continueText.visible === true) {
                // Clear for reseting game
                scene.scene.get("PersistScene").stageHistory = [];
                scene.scene.get("PersistScene").coins = START_COINS;

                //double check that player hasn't paused music so it isn't played again
                if (!scene.scene.get("MusicPlayerScene").playerPaused) {
                    console.log('music playing from TutorialScene onContinue')
                    scene.scene.get("MusicPlayerScene").music.pause();
                    scene.scene.get("MusicPlayerScene").nextSong();
                }

                var startStage;

                if (ourPersist.mode === MODES.HARDCORE) {
                    debugger
                    
                    var hardcoreStartID = ourPersist.hardcorePaths[0].split("|")[0];
                    startStage = STAGES.get(hardcoreStartID);
                    
                } else {
                    startStage = START_STAGE;
                }

                // @Holden add transition to nextScene here.
                scene.scene.start("GameScene", {
                    stage: startStage,
                    score: 0,
                    startupAnim: true,
                    mode: ourPersist.mode

                });   
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
        this.load.bitmapFont('mainFontLarge', 'assets/Fonts/mainFontLarge_0.png', 'assets/Fonts/mainFontLarge.fnt');

        this.load.spritesheet('portals', 'assets/sprites/portalAnim.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('portalHighlights', 'assets/sprites/portalAnimHighlight.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('portalWalls', 'assets/sprites/portalWallAnim.png', { frameWidth: 12, frameHeight: 12 });
        this.load.spritesheet('stars', 'assets/sprites/starSheet.png', { frameWidth: 17, frameHeight: 17 });
        this.load.spritesheet('electronParticleFanfare', 'assets/sprites/electronParticleFanfare.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('menuIcons', 'assets/sprites/ui_menuButtonSheet.png', { frameWidth: 14, frameHeight: 14 });
        this.load.image('titleLogo','assets/sprites/UI_TitleLogo.png')
        this.load.spritesheet('arrowMenu','assets/sprites/UI_ArrowMenu.png',{ frameWidth: 17, frameHeight: 15 });
        //this.load.spritesheet('mediaButtons','assets/sprites/UI_MediaButtons.png',{ frameWidth: 18, frameHeight: 16 });
        //this.load.spritesheet('UI_comboSnake','assets/sprites/UI_ComboSnake.png',{ frameWidth: 28, frameHeight: 28 });
        //this.load.image('UI_comboBONK','assets/sprites/UI_comboCoverBONK.png');
        //this.load.image('UI_comboReady', 'assets/sprites/UI_comboCoverReady.png');
        this.load.image('UI_comboGo', 'assets/sprites/UI_comboCoverGo.png');
        this.load.image('UI_goalLabel', 'assets/sprites/UI_goalLabel.png');
        this.load.image('UI_goalLabelMask', 'assets/sprites/UI_goalLabelMask.png');
        this.load.image('UI_SpaceBoi', ['assets/sprites/UI_SpaceBoi.png','assets/sprites/UI_SpaceBoi_n.png']);
        this.load.image('UI_PowerSwitch', 'assets/sprites/UI_PowerSwitch.png');
        this.load.image('UI_InventoryBG', 'assets/sprites/UI_InventoryBG.png');

        this.load.image('electronParticle','assets/sprites/electronParticle.png');
        this.load.image('spaceBoyBase','assets/sprites/spaceBoyBase.png');
        //this.load.spritesheet('zedBarSeg13', 'assets/sprites/zedbarSeg3.png', { frameWidth: 3, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg1', 'assets/sprites/zedbarSeg1.png', { frameWidth: 1, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg2', 'assets/sprites/zedbarSeg2.png', { frameWidth: 2, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg3', 'assets/sprites/zedbarSeg3.png', { frameWidth: 3, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg3Cap', 'assets/sprites/zedbarSeg3Cap.png', { frameWidth: 3, frameHeight: 3 });
        this.load.spritesheet('zedBarSegEnd', 'assets/sprites/zedbarSegEnd.png', { frameWidth: 4, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg4', 'assets/sprites/zedbarSeg4.png', { frameWidth: 4, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg5', 'assets/sprites/zedbarSeg5.png', { frameWidth: 5, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg6', 'assets/sprites/zedbarSeg6.png', { frameWidth: 6, frameHeight: 3 });
        this.load.spritesheet('zedBarSeg7', 'assets/sprites/zedbarSeg7.png', { frameWidth: 7, frameHeight: 3 });
        this.load.image('plinkoBoard',['assets/sprites/plinkoBoard.png','assets/sprites/plinkoBoard_n.png']);
        this.load.image('plinkoBoardBG','assets/sprites/plinkoBoardBG.png');
        this.load.image('spaceBoyLight','assets/sprites/spaceBoyLight.png');
        this.load.image('UI_ScorePanel','assets/sprites/UI_ScorePanel.png');
        this.load.image('UI_StagePanel','assets/sprites/UI_StagePanel.png');
        //this.load.image('comboBG','assets/sprites/UI_comboBG.png');
        this.load.spritesheet('wishlistButton1','assets/sprites/UI_WishlistButton1.png', { frameWidth: 101, frameHeight: 58 });
        
        // Tilemap
        this.load.image('tileSheetx12', ['assets/Tiled/tileSheetx12.png','assets/Tiled/tileSheetx12_n.png']);

        // Load Tilemap as Sprite sheet to allow conversion to Sprites later.
        // Doesn't need to be GPU optimized unless we use it more regularly.
        this.load.spritesheet('tileSprites', ['assets/Tiled/tileSheetx12.png','assets/Tiled/tileSheetx12_n.png'], { frameWidth: GRID, frameHeight: GRID });
        //this.load.image('tileSpritesImage', 'assets/Tiled/tileSheetx12.png');
        this.load.tilemapTiledJSON('tileMap', `assets/Tiled/World_4-1.json`);
        this.load.image('tiles', 'assets/Tiled/tileSheetx12.png');

        this.load.spritesheet('blackholeAnim', '/assets/sprites/blackHoleAnim.png',{ frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('extractHole', '/assets/sprites/extractHole.png',{ frameWidth: 64, frameHeight: 64 });

        //Background Art -- Pre Atlas
        this.load.image('background02','assets/sprites/background02.png')
        this.load.image('background03','assets/sprites/background03.png')
        this.load.image('background05','assets/sprites/background05.png')
        //this.load.image('background02_frame2','assets/sprites/background02.png')
        this.load.image('backgroundMiddleStars_f1','assets/sprites/backgroundMiddleStars_f1.png')
        this.load.image('backgroundMiddleStars_f2','assets/sprites/backgroundMiddleStars_f2.png')
        
        this.load.image('backgroundBackStars_f1','assets/sprites/backgroundBackStars_f1.png')
        this.load.image('backgroundBackStars_f2','assets/sprites/backgroundBackStars_f2.png')
        
        this.load.image('backgroundFar03','assets/sprites/backgroundFar03.png')
        this.load.image('backgroundFar02','assets/sprites/backgroundFar02.png')
        
        this.load.image('background02','assets/sprites/background02.png')
        //this.load.image('background03_frame2','assets/sprites/background03_frame2.png')
        
        //Background Container Sprites
        this.load.spritesheet('bgPlanets', 'assets/sprites/bg_spriteSheet_planets.png',{ frameWidth: 16, frameHeight: 16 });


        // GameUI
        //this.load.image('boostMeter', 'assets/sprites/boostMeter.png');
        this.load.atlas('uiGlassL', 'assets/sprites/UI_Glass_9SliceLEFT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiGlassR', 'assets/sprites/UI_Glass_9SliceRIGHT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiPanelL', 'assets/sprites/UI_Panel_9SliceLEFT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiPanelR', 'assets/sprites/UI_Panel_9SliceRIGHT.png', 'assets/9slice/nine-slice.json');
        this.load.atlas('uiMenu', 'assets/sprites/UI_MenuPanel_9Slice.png', 'assets/9slice/nine-sliceMenu.json');
        this.load.spritesheet('uiBackButton', 'assets/sprites/UI_backButton.png',{ frameWidth: 12, frameHeight: 12 });
        //this.load.spritesheet('uiVolumeIcon', 'assets/sprites/ui_volumeIcon.png',{ frameWidth: 10, frameHeight: 8 });
        //this.load.image('uiVolumeSlider', 'assets/sprites/ui_volumeSlider.png');
        //this.load.image('uiVolumeSliderWidget', 'assets/sprites/ui_volumeSliderWidget.png');
        //this.load.image('uiVolumeSliderWidgetRendered', 'assets/sprites/ui_VolumeSliderWidgetRendered.png');
        //this.load.spritesheet('plinkoDisc', 'assets/sprites/plinkoDisc.png',{ frameWidth: 6, frameHeight: 6 });
        this.load.spritesheet('plinkoDisc', 'assets/sprites/plinkoDisc.png',{ frameWidth: 6, frameHeight: 6});
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
        //this.load.spritesheet("comboLetters", "assets/sprites/comboLetters.png",{ frameWidth: 18, frameHeight: 24 });
        //this.load.image('comboCover', 'assets/sprites/UI_comboCover.png');
        //this.load.image("snakeMask", "assets/sprites/snakeMask.png");
        //this.load.image("portalMask", "assets/sprites/portalMask.png");
        this.load.image('UI_maskMenu', 'assets/sprites/UI_maskMenu.png');
        this.load.image('UI_CodexLabel', 'assets/sprites/UI_CodexLabel.png');
        this.load.image('UI_MainMenuLabel', 'assets/sprites/UI_MainMenuLabel.png');
        this.load.image('UI_StageTrackerLabel', 'assets/sprites/UI_StageTrackerLabel.png');

        // Animations
        //this.load.spritesheet('electronCloudAnim', 'assets/sprites/electronCloudAnim.png', { frameWidth: 44, frameHeight: 36 });
        this.load.spritesheet('CapElectronDispersion', 'assets/sprites/UI_CapElectronDispersion.png', { frameWidth: 28, frameHeight: 18 });
        //this.load.spritesheet('atomicPickup01Anim', 'assets/sprites/atomicPickup01Anim.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('atomicPickupUISmall', 'assets/sprites/atomicPickupUISmall.png', { frameWidth: 9, frameHeight: 9 });
        this.load.spritesheet('atomicPickupComet', 'assets/sprites/atomicPickupComet.png', { frameWidth: 12, frameHeight: 12 });
        this.load.spritesheet('atomicPickupScore', 'assets/sprites/atomicPickupScoreAnim.png', { frameWidth: 6, frameHeight: 6 });
        this.load.spritesheet('coinPickup01Anim', 'assets/sprites/coinPickup01Anim.png', { frameWidth: 10, frameHeight: 20 });
        this.load.spritesheet('uiExitPanel', 'assets/sprites/UI_exitPanel.png', { frameWidth: 45, frameHeight: 20 });
        this.load.spritesheet('startingArrowsAnim', 'assets/sprites/startingArrowsAnim.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('shiftLight', 'assets/sprites/spaceBoyShiftLight.png', { frameWidth: 23, frameHeight: 3 });
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

        // Load body shapes from JSON file generated using PhysicsEditor
        this.load.json('collisionData', 'assets/zedRollerCollision.json');

        // #region Load Audio
        this.load.setPath('assets/audio');

        this.load.audio('buttonHover01',[ 'buttonHover01.ogg', 'buttonHover01.mp3'])

        this.load.audio('snakeCrash', [ 'snakeCrash.ogg', 'snakeCrash.mp3']);
        this.load.audio('pop02', [ 'pop02.ogg', 'pop02.mp3']);
        this.load.audio('pop03', [ 'pop03.ogg', 'pop03.mp3']);
        this.load.audio('chime01',[ 'chime01.ogg', 'chime01.mp3'])

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

        // #region Load Music
        this.load.setPath('assets/music/project-files');

        TRACKS.keys().forEach( trackID => {
            var track = `track_${trackID}`;
            var path = TRACKS.get(trackID);
            this.load.audio(track, [path]);
        })

        // Game Over Song
        this.load.audio(`track_${86}`, "let-86_11_20-start.m4a");

        // Game Over Song
        this.load.audio(`track_${149}`, "let-149-game-over_11-10.m4a");

        // Red Alert Song
        this.load.audio(`track_${175}`, "let-175_11-10.m4a");

        

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
        const ourGame = this.scene.get("GameScene");
        const ourStartScene = this.scene.get("StartScene");
        
        

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
        this.scene.launch('PersistScene');
        this.scene.launch('SpaceBoyScene');
        this.scene.launch('PlinkoMachineScene');
        this.scene.launch('PinballDisplayScene');
        this.scene.launch('MusicPlayerScene');
        //this.scene.launch('GalaxyMapScene');
        this.scene.bringToTop('SpaceBoyScene');
        this.scene.bringToTop('MusicPlayerScene');
        
        
        
        //temporaily removing HOW TO PLAY section from scene to move it elsewhere
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
            var logKeySplit = log[0].split("_");
            var keyCheck = logKeySplit[1];
            if (keyCheck === "best-Classic" || keyCheck === "best-Expert") {

                var uuidString = logKeySplit[0];
                var correctStage = this.UUID_MAP.get(uuidString);
                var localJSON = JSON.parse(log[1]);

                if (correctStage === undefined) {
                    // Stage in History is not currently playable.
                    console.log(`Unused Stage: ${localJSON.stage} in Local Storage with UUID ${localJSON.uuid} is not in game.`)
                    
                } else {
                
                console.log();
                    if (localJSON.stage != correctStage) {
                        var logJSON = JSON.parse(localStorage.getItem(`${uuidString}_${keyCheck}`));
                        var stageDataLog = new StageData(logJSON);
                        stageDataLog.zedLevel = calcZedObj(ourPersist.zeds).level;
                        
                        // Update Stage Name
                        stageDataLog.stage = correctStage;
                        
                        // Save New 
                        localStorage.setItem(`${uuidString}_${keyCheck}`, JSON.stringify(stageDataLog));
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
        var titleLogo = this.add.sprite(SCREEN_WIDTH/2,SCREEN_HEIGHT/2 - GRID * 0,
            'titleLogo').setDepth(60);
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

        // SHORTCUT SCENE START HERE TO GO DIRECTLY
        //this.scene.start("StageCodex");

        if (DEBUG_SKIP_TO_SCENE) {
            if (DEBUG_SCENE === "ScoreScene") {

                var dataObj = DEBUG_ARGS.get(DEBUG_SCENE)

                this.scene.start("GameScene", {
                    stage: dataObj.stage,
                    mode: dataObj.mode,
                    startupAnim: false,
                });
                
            } else {
                this.scene.start(DEBUG_SCENE, DEBUG_ARGS.get(DEBUG_SCENE));
            }
        } else {
            this.scene.start('MainMenuScene', {
                portalTint: intColor,
                portalFrame: Phaser.Math.Wrap(
                    titlePortal.anims.currentFrame.index + 1, 
                    0, 
                    titlePortal.anims.getTotalFrames() - 1
                    )
            });
        }
        
        



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
        const ourPersist = this.scene.get('PersistScene');
        const ourGame = this.scene.get('GameScene');
        // #region Quick Menu
        this.menuOptions = qMenuArgs.menuOptions;

        this.menuList = [...this.menuOptions.keys()];
        var menuCenter = SCREEN_HEIGHT/2 - GRID * (this.menuList.length - 1);
        this.cursorIndex = qMenuArgs.cursorIndex;
        var _textStart = menuCenter + GRID * 3;
        var _spacing = 20;
        this.menuElements = [];



        this.promptText = this.add.dom(SCREEN_WIDTH / 2, menuCenter - GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize": '20px',
            "fontWeight": 400,
            "color": "white",
        }),
            `${qMenuArgs.textPrompt}`
        ).setOrigin(0.5,0).setScale(0.5).setAlpha(1);

        var panelHeight = 16 + (_spacing * (this.menuList.length - 1)) + _spacing * 0.75;

        //nineSlice
        this.qPanel = this.add.nineslice(SCREEN_WIDTH/2, menuCenter, 
            'uiPanelL', 'Glass', 
            GRID * 19 + 1, panelHeight , 
            8, 8, 8, 8);
        this.qPanel.setDepth(60).setOrigin(0.5,0).setScrollFactor(0).setVisible(true);

        
        if (this.menuElements.length < 1) {
            for (let index = 0; index < this.menuList.length; index++) {   
                if (index === 0) { //always make option 1 'tab to menu' and off-center
                    if (index === this.cursorIndex) {
                        console.log('adding');
                    var textElement = this.add.dom(SCREEN_WIDTH / 2 - GRID * 7.5, _textStart - GRID * 1.75, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '16px',
                        "fontWeight": 400,
                        "color": "white",
                    }),
                        `${this.menuList[index].toUpperCase()}`
                    ).setOrigin(0,0.5).setScale(0.5).setAlpha(1);
                    this.backButton = this.add.sprite(SCREEN_WIDTH / 2 - GRID * 8.25, _textStart - GRID * 1.75, 'uiBackButton',1).setDepth(100);
                    }
                    else{
                        var textElement = this.add.dom(SCREEN_WIDTH / 2 - GRID * 7.5, _textStart - GRID * 1.75, 'div', Object.assign({}, STYLE_DEFAULT, {
                            "fontSize": '16px',
                            "fontWeight": 400,
                            "color": "darkgrey",
                        }),
                            `${this.menuList[index].toUpperCase()}`
                        ).setOrigin(0,0.5).setScale(0.5).setAlpha(1);
                        this.backButton = this.add.sprite(SCREEN_WIDTH / 2 - GRID * 8.25, _textStart - GRID * 1.75, 'uiBackButton').setDepth(100);
                    }
                    
                }
                else if (index === this.cursorIndex) {
                    console.log('adding');
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing - GRID * 1.75, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '20px',
                        "fontWeight": 400,
                        "color": "white",
                    }),
                        `${this.menuList[index].toUpperCase()}`
                    ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(1);
                }
                else{
                    var textElement = this.add.dom(SCREEN_WIDTH / 2, _textStart + index * _spacing - GRID * 1.75, 'div', Object.assign({}, STYLE_DEFAULT, {
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
            this.scene.get("SpaceBoyScene").sound.play('buttonHover01');
            // Reset all menu elements to dark grey
            //this.menuElements.forEach((element, index) => {
            //    element.node.style.color = "darkgrey";
            //});

            //var _selected = this.menuElements[this.cursorIndex];
            //_selected.node.style.color = "white";
        
            this.menuElements[this.cursorIndex].node.style.color = "darkgrey";
            this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex + 1, 0, this.menuElements.length)
            this.menuElements[this.cursorIndex].node.style.color = "white";
            if (this.cursorIndex === 0) { //check if back button is selected
                if (this.backButton) {
                    this.backButton.setFrame(1)
                }   
            }
            else{
                if (this.backButton) {
                    this.backButton.setFrame(0)
                }
            }
            

            
            // Set the selected element to white
        }, this);

        this.input.keyboard.on('keydown-UP', function() {
            this.scene.get("SpaceBoyScene").sound.play('buttonHover01');
            this.menuElements[this.cursorIndex].node.style.color = "darkgrey";
            this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex - 1, 0, this.menuElements.length)
            this.menuElements[this.cursorIndex].node.style.color = "white";

            if (this.cursorIndex === 0) {
                if (this.backButton) {
                    this.backButton.setFrame(1)
                }   
            }
            else{
                if (this.backButton) {
                    this.backButton.setFrame(0)
                }
            }
        }, this);


        this.input.keyboard.on('keydown-TAB', function() {
            //this.scene.sleep("QuickMenuScene");
            var option = this.menuList[0]; //tab calls option 1 every time
            this.menuOptions.get(option).call(this, qMenuArgs.fromScene);
        }, this);


        // do NOT allow for left and right menus if in MODE SELECTOR or Gauntlet Mode menu
        // future menus will also require this
        if (qMenuArgs.textPrompt !== "MODE SELECTOR" &&
            qMenuArgs.textPrompt !== "Gauntlet Mode") {
            
            var arrowMenuR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
            arrowMenuR.play('arrowMenuIdle').setAlpha(1);
            var arrowMenuL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
            arrowMenuL.play('arrowMenuIdle').setFlipX(true).setAlpha(1);

            var codexLabel = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5 -1,
                SCREEN_HEIGHT/2 - GRID * 1 - 6,'UI_CodexLabel').setOrigin(0,0.5);
                codexLabel.angle = 90;
   
            var UI_StageTrackerLabel = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5 -1,
                SCREEN_HEIGHT/2 - GRID * 1 + 2,'UI_StageTrackerLabel').setOrigin(0,0.5);
                UI_StageTrackerLabel.angle = 90;

            this.input.keyboard.on('keydown-LEFT', e => {

                const ourGame = this.scene.get("GameScene");
                
                var displayList;
                switch (ourGame.mode) {
                    case MODES.CLASSIC:
                        displayList = ["Overall", "Expert"];
                        break;
                    case MODES.EXPERT:
                        displayList = ["Expert", "Overall"];
                        break;
                    case MODES.TUTORIAL:
                        displayList = ["Tutorial"];
                        break;
                    case MODES.GAUNTLET:
                        displayList = ["Overall", "Expert"];
                        break;
                    default:
                        break;
                }
    
                if (!this.scene.isSleeping("StageCodex")) {
                    this.scene.launch('StageCodex', {
                        stage: this.scene.get("GameScene").stage,
                        originScene: this.scene.get("GameScene"),
                        fromQuickMenu: true,
                        displayList: displayList,
                        displayIndex: 0
                        //category: this.scene.get("GameScene").mode
                    });
                    this.scene.sleep("QuickMenuScene");
                } else {
                    this.scene.wake("StageCodex");
                    this.scene.sleep("QuickMenuScene");
                }
    
                ourGame.scene.pause();
                //culprit bug code that keeps game scene invisible when it's not supposed to
                ourGame.scene.setVisible(false);
                
                /***
                 * SLEEP DOESN"T STOP TIMER EVENTS AND CAN ERROR
                 * DON't USE UNLESS YOU FIGURE THAT OUT
                 * //this.scene.sleep('GameScene');
                 */
            }, this);
    
            this.input.keyboard.on('keydown-RIGHT', e => {
    
                const ourGame = this.scene.get("GameScene");
    
                if (!this.scene.isSleeping('ExtractTracker')) {
                    this.scene.launch('ExtractTracker', {
                        stage: this.scene.get("GameScene").stage,
                        originScene: this.scene.get("GameScene"),
                        fromQuickMenu: true,
                    });
                    this.scene.sleep("QuickMenuScene");
                } else {
                    this.scene.wake('ExtractTracker');
                    this.scene.sleep("QuickMenuScene");
                }
    
                ourGame.scene.pause();
                //culprit bug code that keeps game scene invisible when it's not supposed to
                ourGame.scene.setVisible(false);
                
                /***
                 * SLEEP DOESN"T STOP TIMER EVENTS AND CAN ERROR
                 * DON't USE UNLESS YOU FIGURE THAT OUT
                 * //this.scene.sleep('GameScene');
                 */
            }, this);
        }
        // #endregion
    }
}
// #region Extract Tracker

class ExtractTracker extends Phaser.Scene {
    constructor () {
        super({key: 'ExtractTracker', active: false});
    }
    init() {
        this.yMap = new Map();
        this.selected = {};

    }
    create(codexArgs) {
        var _index = 0;
        var topLeft = X_OFFSET + GRID * 8;
        var rowY = Y_OFFSET + GRID * 1.5;
        var extractNumber = 0;
        var nextRow = 68;
        var letterOffset = 30;

        console.log(codexArgs)
        var originScene = codexArgs.originScene;
        console.log(originScene)

        this.trackerContainer = this.make.container(0, 0);
        this.maskContainerMenu = this.make.container(0, 0);


        var letterCounter = [0,0,0,0,0,0];

        
        if (localStorage.getItem("extractRanks")) {
            var bestExtractions = new Map(JSON.parse(localStorage.getItem("extractRanks")));

            var topPanel = this.add.nineslice(SCREEN_WIDTH / 2, rowY + GRID, 
                'uiPanelL', 'Glass', 
                GRID * 27.5, GRID * 4, 
                8, 8, 8, 8);
            topPanel.setDepth(50).setOrigin(0.5,0).setScrollFactor(0);

            var pathsDiscovered = this.add.dom(X_OFFSET + GRID * 27, Y_OFFSET + GRID * 5.5 + 5, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 200,
            }),
                `PATHS COMPLETE:${0}`
            ).setOrigin(1,1).setScale(0.5).setAlpha(1);



            var overallScore = 0;
            var rankSum = 0;
            var rankCount = 0;
            var worldCount = {};
            EXTRACT_CODES.forEach ( extractKey => {

                if (bestExtractions.has(extractKey)) {
                    var bestExtract = bestExtractions.get(extractKey);
                    var bestSum = 0;   
                    
                    if (bestExtract === "Classic Clear") {

                        
                        
                        var idArray = extractKey.split("|");
                        for (let index = 0; index < idArray.length; index++) {

                            var _x = topLeft + index * letterOffset;
                            
                            const stageID = this.add.bitmapText(_x, rowY + 19, 'mainFont',`${idArray[index]}`,
                            ).setOrigin(0.5,0);
                            this.trackerContainer.add([stageID]);

                        }

                        var _x = topLeft + idArray.length * letterOffset;

                        var extractWorld = idArray[idArray.length -1].split("-")[0];

    

                    } else {
                        for (let index = 0; index < bestExtract.length; index++) {

                            var _rank = bestExtract[index][0];
                            var _id = bestExtract[index][1];
                            var _scoreSnapshot = bestExtract[index][2]
    
                            bestSum += _rank;
        
                            var _x = topLeft + index * letterOffset;
                            
                            const bestRank = this.add.sprite(_x , rowY, "ranksSpriteSheet", _rank
                            ).setDepth(80).setOrigin(0.5,0).setScale(0.5);

                            letterCounter[_rank] += 1;
                            rankSum += 2 ** _rank; // Each rank is twice as hard to get as the previous.
                            rankCount += 1;
    
                            const stageID = this.add.bitmapText(_x, rowY + 19, 'mainFont',`${_id}`
                            ).setOrigin(0.5,0);
    
                            this.trackerContainer.add([bestRank, stageID]);
                            
                        }

                        var extractWorld = bestExtract[bestExtract.length -1][1].split("-")[0];         

                        var _x = topLeft + bestExtract.length * letterOffset;
    
                        var bestExtractRank = bestSum / bestExtract.length;
        
                        var finalRankValue = Math.floor(bestExtractRank);
                        const finalRank = this.add.sprite(_x + GRID * .5, rowY - 2, "ranksSpriteSheet", Math.floor(finalRankValue)
                        ).setDepth(80).setOrigin(0.5,0).setScale(1);
                        letterCounter[finalRankValue] += 1;
                        rankSum += 2 ** finalRankValue;
                        rankCount += 1;

                        this.trackerContainer.add([finalRank]);

                    }

                    if (!worldCount[extractWorld]) {
                        worldCount[extractWorld] = 1;
                    } else {
                        worldCount[extractWorld] += 1;
                    }

                    var pathVersion = String.fromCharCode(96 + worldCount[extractWorld]).toUpperCase();

                    const pathTitle = this.add.bitmapText(topLeft - GRID * 1 - 1, rowY + 15, 'mainFontLarge',
                        `PATH  ${extractWorld}-${pathVersion}`,13
                    ).setOrigin(1,0).setScale(1);

                    this.trackerContainer.add(pathTitle);

                    var bestScoreTitle = this.add.bitmapText(_x + GRID * 2, rowY, 'mainFont', "SCORE",
                    ).setOrigin(0,0);

                    
                    var scoreValue = bestExtract[bestExtract.length - 1][2];
                    
                    
                    var bestScore = this.add.bitmapText(_x + GRID * 2, rowY + 15, 'mainFontLarge',
                        commaInt(scoreValue),
                    13).setOrigin(0,0);

                    if (bestExtract === "Classic Clear") {
                        bestScoreTitle.x -= GRID * 2.5;
                        bestScore.x -= GRID * 2.5;
                        bestScoreTitle.setText("");
                        bestScore.setText("CLEAR");
                        
                    } else {
                        overallScore += scoreValue;
                    }

                    this.trackerContainer.add([bestScoreTitle, bestScore]);

                    
                    this.yMap.set(extractKey, {
                        extractCode:extractKey, 
                        x: topLeft,
                        conY: nextRow * _index,
                        index: extractNumber,
                        title: pathTitle,
                        scoreText: bestScore
                    })
                    extractNumber += 1;
                    
                    
                } else {
                    const pathTitle = this.add.bitmapText(topLeft - GRID * 5, rowY + 15, 'mainFontLarge',`PATH - UNDISCOVERED`,13
                    ).setOrigin(0,0).setScale(1).setTintFill(0x454545);

                    this.trackerContainer.add([pathTitle]);
                    //debugger
                }
                _index += 1;
                rowY += nextRow;
                

            });

            
            pathsDiscovered.setText(`PATHS DISCOVERED: ${this.yMap.size}`);

            var hasLetter = letterCounter.some(rank => rank != 0);

            if (hasLetter) {
                var sumOfExtracts = this.add.dom(X_OFFSET + GRID * 27, Y_OFFSET + GRID * 2.5 + 8, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                }),
                    `ALL PATHS: ${commaInt(overallScore)}`
                ).setOrigin(1,0).setScale(0.5).setAlpha(1);
                console.log(letterCounter);

                var _x = X_OFFSET + GRID * 1.5 + 6;
                var _offset = GRID + 8;

                for (let index = 0; index < letterCounter.length - 1; index++) {
                    const rankSprite = this.add.sprite(_x + _offset * index, Y_OFFSET + GRID * 2.5 + 8, "ranksSpriteSheet", index 
                    ).setDepth(80).setOrigin(0,0).setScale(0.5);

                    const rankCount = this.add.dom(_x + _offset * index + 2, Y_OFFSET + GRID * 4.5 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '24px',
                        "fontWeight": 400,
                    }),
                        letterCounter[index]
                    ).setDepth(80).setOrigin(0,0).setScale(0.5);
                     
                }

                var rankCount = this.add.dom(X_OFFSET + GRID * 3, Y_OFFSET + GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 200,
                }),
                    `MEDAL COUNT: ${rankCount} — RANK SCORE: ${rankSum} `
                ).setOrigin(0,0).setScale(0.5).setAlpha(1);

                if (checkExpertUnlocked()) {
                    var expertRank = this.add.dom(X_OFFSET + GRID * 28, Y_OFFSET + GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
                        "fontSize": '24px',
                        "fontWeight": 200,
                        "color": COLOR_BONUS,
                    }),
                        `TOP: ${calcExpertRank(rankSum)}%`
                    ).setOrigin(1,0).setScale(0.5).setAlpha(1);
                }
            }

            

            var selected = this.yMap.get([...this.yMap.keys()][0]);
           
            this.containerToY = selected.conY * -1 + nextRow ?? 0; // A bit cheeky. maybe too cheeky.

            ////////
            
            // mask for top of codexContainer
            var maskMenu = this.make.image({
                x: SCREEN_WIDTH/2,
                y: 0,
                key: 'UI_maskMenu',
                add: false
            }).setOrigin(0.5,0.0);

            maskMenu.scaleX = 24;
            
            // mask for bottom of codexContainer
            var maskMenu2 = this.make.image({
                x: SCREEN_WIDTH/2,
                y: SCREEN_HEIGHT - 42,
                key: 'UI_maskMenu',
                add: false
            }).setOrigin(0.5,1.0);
            maskMenu2.scaleX = 24;
            maskMenu2.scaleY = -1;


            this.maskContainerMenu.add([maskMenu, maskMenu2]);
            this.maskContainerMenu.setVisible(false);


            this.trackerContainer.mask = new Phaser.Display.Masks.BitmapMask(this, this.maskContainerMenu);
            this.trackerContainer.mask.invertAlpha = true;
            /////


            this.tweens.add({
                targets: this.trackerContainer,
                y: this.containerToY,
                ease: 'Sine.InOut',
                duration: 500,
                onComplete: () => {
                    selected.title.setTintFill(COLOR_FOCUS_HEX);
                    selected.scoreText.setTintFill(COLOR_FOCUS_HEX);
                }
            }, this);


            this.input.keyboard.on('keydown-UP', e => {

                selected.title.clearTint();
                selected.scoreText.clearTint();
                
                var safeIndex = Math.max(selected.index - 1, 0);
                
                var nextSelect = ([...this.yMap.keys()][safeIndex]);
                selected = this.yMap.get(nextSelect);
                
                this.containerToY = selected.conY * -1 + nextRow;

                selected.title.setTintFill(COLOR_FOCUS_HEX);
                selected.title.setTintFill(COLOR_FOCUS_HEX);
                selected.scoreText.setTintFill(COLOR_FOCUS_HEX);
                
                /*this.tweens.add({
                    targets: this.trackerContainer,
                    y: this.containerToY,
                    ease: 'Sine.InOut',
                    duration: 500,
                    onComplete: () => {
                        selected.title.setTintFill(COLOR_FOCUS_HEX);
                        selected.title.setTintFill(COLOR_FOCUS_HEX);
                        selected.scoreText.setTintFill(COLOR_FOCUS_HEX);
                    }
                }, this);*/
            }, this);

            this.input.keyboard.on('keydown-DOWN', e => {

                selected.title.clearTint();
                selected.scoreText.clearTint();

                var safeIndex = Math.min(selected.index + 1, this.yMap.size - 1);
                
                var nextSelect = ([...this.yMap.keys()][safeIndex]);
                selected = this.yMap.get(nextSelect);
                
                this.containerToY = selected.conY * -1 + nextRow;
                
                selected.title.setTintFill(COLOR_FOCUS_HEX);
                selected.title.setTintFill(COLOR_FOCUS_HEX);
                selected.scoreText.setTintFill(COLOR_FOCUS_HEX);
                
                /*this.tweens.add({
                    targets: this.trackerContainer,
                    y: this.containerToY,
                    ease: 'Sine.InOut',
                    duration: 500,
                    onComplete: () => {
                        selected.title.setTintFill(COLOR_FOCUS_HEX);
                        selected.title.setTintFill(COLOR_FOCUS_HEX);
                        selected.scoreText.setTintFill(COLOR_FOCUS_HEX);
                    }
                }, this);*/
            }, this);

        } else {
            const pathTitle = this.add.bitmapText(topLeft - GRID * 5, rowY + 15, 'mainFont',
                `COMPLETE 1 EXTRACTION\n\nBEFORE TRACKING IS ENABLED`
                ,16).setOrigin(0,0).setScale(1);
            // Display something if they have not yet done an extraction on
        }
        
        
        
        var arrowMenuL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
            arrowMenuL.play('arrowMenuIdle').setFlipX(true).setAlpha(1);
            

        this.input.keyboard.on('keydown-LEFT', e => {
            const ourMenuScene = this.scene.get('MainMenuScene');
            ourMenuScene.showExitButton('instant');
            this.tweens.add({
                targets: this.cameras.main,
                x: { from: 0, to: 160 },
                duration: 300,
                ease: 'Power2',
                onUpdate: (tween) => {
                    if (tween.progress >= 0.25) {
                        tween.complete();
                        if (originScene.scene.isPaused()) {
                            originScene.scene.resume();
                            originScene.scene.setVisible(true);
                        } 
                        if (originScene.scene.key == "MainMenuScene") {
                            this.scene.wake("MainMenuScene");
                        }
                        if (codexArgs.fromQuickMenu) {
                            this.scene.wake('QuickMenuScene');
                        }
                        this.cameras.main.x = 0;
                        this.scene.sleep('ExtractTracker');
                    }
                }
            });





            /*
            //this.cameras.main.scrollX += SCREEN_WIDTH;
            //this.cameras.main.scrollX += SCREEN_WIDTH;
            const game = this.scene.get("GameScene");
            game.scene.resume();
            game.scene.setVisible(true);

            this.scene.wake('QuickMenuScene');
            this.scene.sleep('ExtractTracker');*/
            
        }, this);

    }
    update() {
        this.tweens.add({
            targets: this.trackerContainer,
            y: this.containerToY,
            ease: 'Linear',
            duration: 100,
            repeat: 0,
            yoyo: true,
        });  
    }

}

// #region Stage Codex
class StageCodex extends Phaser.Scene {
    
    constructor () {
        super({key: 'StageCodex', active: false});
    }
    init () {
        this.yMap = new Map();
        this.selected = {};

    }
    create (codexArgs) {
        var ourPersist = this.scene.get("PersistScene");
        this.scene.moveAbove("StageCodex", "SpaceBoyScene");

        var disableArrows = codexArgs.disableArrows ?? false;
        var practiceMode = codexArgs.practiceMode ?? false;

        var displayList = codexArgs.displayList ?? ["Overall", "Expert"];
        var displayIndex = codexArgs.displayIndex ?? 0;

        var stageDisplay = codexArgs.stage ?? ourPersist.prevCodexStageMemory;

        var displayCategory = displayList[displayIndex];
        console.log(codexArgs)
        var originScene = codexArgs.originScene;
        console.log(originScene)

       
        this.scene.moveBelow( "SpaceBoyScene","StageCodex",);
        var topLeft = X_OFFSET + GRID * 1.5;
        var rowY = Y_OFFSET + GRID * 1.5;
        var stageNumber = 0;
        var nextRow = 56;

        this.codexContainer = this.make.container(0, 0);

        var bestOfDisplay;
        var sumOfBestDisplay;
        var stagesCompleteDisplay;
        var categoryText;

        updateSumOfBest(ourPersist);
        

        if (!checkExpertUnlocked.call(this)) {
            bestOfDisplay = BEST_OF_ALL;
            sumOfBestDisplay = ourPersist.sumOfBestAll;
            stagesCompleteDisplay = ourPersist.stagesCompleteAll;
            categoryText = "";
            
        } else {
            switch (displayCategory) {
                case "Tutorial":
                    bestOfDisplay = BEST_OF_TUTORIAL;
                    sumOfBestDisplay = ourPersist.sumOfBestTut;
                    stagesCompleteDisplay = ourPersist.stagesCompleteTut;
                    categoryText = "Tutorial";
                    break;
                case "Expert":
                    bestOfDisplay = BEST_OF_EXPERT;
                    sumOfBestDisplay = ourPersist.sumOfBestExpert;
                    stagesCompleteDisplay = ourPersist.stagesCompleteExpert;
                    categoryText = "Expert";
                    break;
                case "Overall":
                    bestOfDisplay = BEST_OF_ALL;
                    sumOfBestDisplay = ourPersist.sumOfBestAll;
                    stagesCompleteDisplay = ourPersist.stagesCompleteAll;
                    categoryText = "Overall";
                    break;
                default:
                    break;
            }
        } 
        // checking normal codex list
        if (!practiceMode) {

            var panelCard = this.make.container(0, 0);

            //was used to prevent list from moving, but bugs first time seeing menu
            //this.codexContainer.y = this.containerToY;


            var playerRank = this.add.dom(topLeft + GRID * 26, rowY + GRID * 2 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 200,
                "color": COLOR_BONUS, 
            }),
                `Player Rank: TOP ${calcPlayerRank(ourPersist.sumOfBestAll)}%`
            ).setOrigin(1,0.5).setScale(0.5).setAlpha(1);

            var topPanel = this.add.nineslice(SCREEN_WIDTH / 2 + GRID * 0.75, rowY + GRID, 
                'uiPanelL', 'Glass', 
                GRID * 26, GRID * 4, 
                8, 8, 8, 8);
            topPanel.setDepth(50).setOrigin(0.5,0).setScrollFactor(0);
    
            var bestText = `Sum of Best = ${commaInt(sumOfBestDisplay.toFixed(0))}`;
    
            var titleText = this.add.dom(topLeft + GRID * 1.5, rowY + GRID * 3.5 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 400,
            }),
                bestText
            ).setOrigin(0,0.5).setScale(0.5).setAlpha(1);
    


            var categoryDom = this.add.dom(topLeft + GRID * 1.5, rowY + GRID * 2 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 400,
            }),
                categoryText
            ).setOrigin(0,0.5).setScale(0.5).setAlpha(1);

            if (categoryText === "Expert") {
                categoryDom.node.style.color = "red";
            }
            if (categoryText === "Overall") {
                categoryDom.node.style.color = "#4d9be6";
            }


            var stages = this.add.dom(X_OFFSET + GRID * 27.5, rowY + GRID * 3.5 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 400,
            }),
                `Stages Complete: ${stagesCompleteDisplay}`
            ).setOrigin(1,0.5).setScale(0.5).setAlpha(1);

            panelCard.add([playerRank,topPanel,titleText,categoryDom,stages]);
            
            /*this.tweens.add({
                targets: this.cameras.main,
                x: { from: -160, to: 0 },
                duration: 300,
                ease: 'Power2',
            });*/
        }
        // checking for practice mode
        else{
            var topPanel = this.add.nineslice(SCREEN_WIDTH/2, rowY, 
                'uiPanelL', 'Glass', 
                GRID * 8.25, GRID * 2.25, 
                8, 8, 8, 8);
            topPanel.setDepth(50).setOrigin(0.5,0).setScrollFactor(0);

            var practiceText = this.add.dom(SCREEN_WIDTH/2, rowY + GRID * 1 + 2, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 400,
            }),
                `Practice Mode`
            ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(1);
    
            var exitButton = this.add.sprite(X_OFFSET + GRID * 1,Y_OFFSET + GRID * 1,
                 'uiBackButton',0).setScrollFactor(0);
            
            var exitText = this.add.dom(X_OFFSET + GRID * 4.5, Y_OFFSET + GRID * 1, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '10px',
                "fontWeight": 400,
                "color": "white",
            }),
                    `Tab to Menu`
            );
        }

        //codexContainer.add([titleText, playerRank, stages]);

        var _index = 0;

        if (bestOfDisplay.size > 0 ) {
        
            bestOfDisplay.values().forEach( bestOf => {
                //debugger
                var topY = rowY + nextRow * stageNumber + GRID * 1.5;
                const stageTitle = this.add.bitmapText(topLeft, topY + 4, 'mainFontLarge',
                    `${bestOf.stage.toUpperCase()}`,13
                ).setOrigin(0,0);

                const score = this.add.bitmapText(topLeft , topY + 21, 'mainFont',
                    `TOTAL SCORE: ${commaInt(bestOf.calcTotal().toFixed(0))}`,16
                ).setOrigin(0,0).setScale(0.5);

                const speedBonus = this.add.bitmapText(topLeft + GRID * 21.5 - 4, topY + 21, 'mainFont',
                    `STAGE SCORE: ${commaInt(bestOf.preAdditive())} =>`,16
                ).setOrigin(1,0).setScale(0.5);

                const rankTitle = this.add.bitmapText(topLeft + GRID * 24 - 6, topY + 21, 'mainFont',
                    `RANK:`,16
                ).setOrigin(1,0).setScale(0.5);

                var _rank = bestOf.stageRank();

                

                if (_rank != 5) {
                    var rankIcon = this.add.sprite(topLeft + GRID * 24 - 4 , topY - 4, "ranksSpriteSheet", bestOf.stageRank()
                    ).setDepth(80).setOrigin(0,0).setScale(1);
                    
                } else {
                    var rankIcon = this.add.sprite(topLeft + GRID * 24 - 4 , topY - 4, "ranksSpriteSheet", 4
                    ).setDepth(80).setOrigin(0,0).setScale(1);
                    rankIcon.setTintFill(COLOR_BONUS_HEX);
                }


                this.codexContainer.add([stageTitle,score, speedBonus, rankTitle, rankIcon])

                this.yMap.set(bestOf.stage, {
                    stageTitle:bestOf.stage, 
                    x: topLeft,
                    conY: nextRow * stageNumber,
                    index: _index,
                    title: stageTitle
                })


                var foodIndex = 0;
                var foodSpace = 11;
                bestOf.foodLog.forEach( foodScore => {
                    var _y;
                    if (foodIndex < 28 ) { // Wraps Food Under
                        _y = rowY + 34 + (nextRow * stageNumber);
                    } else {
                        _y = rowY + 34 + (nextRow * stageNumber);
                    }
                    var _atom = this.add.sprite((topLeft) + ((foodIndex % 28) * foodSpace), _y + GRID * 1.5
                    ).setOrigin(0,0).setDepth(50)

                    switch (true) {
                        case foodScore > BOOST_ADD_FLOOR:
                            _atom.play('atom01Small');
                            break;

                        case foodScore > 60:
                            _atom.play('atom02Small');
                            break;
                        
                        case foodScore > 1:
                            _atom.play('atom03Small');
                            break;
                        
                        case foodScore > 60:
                            break;
                    
                        default:
                            _atom.play("atom04Small");
                            break;
                    }

                    

                    if (foodIndex > 0 && foodScore > COMBO_ADD_FLOOR) {
                        var _comboConnect = this.add.rectangle((topLeft) + ((foodIndex % 28) * foodSpace) - 2,
                         _y + 3 + GRID * 1.5, 2, 3, 0xFFFF00, 1
                        ).setOrigin(0,0).setDepth(51).setAlpha(1);
                        this.codexContainer.add([_atom, _comboConnect]);
                    } else {
                        this.codexContainer.add(_atom);
                    }

                    
                    
                    
                    foodIndex += 1;
                })

                _index += 1;
                stageNumber += 1;
            })


            var selected = this.yMap.get(stageDisplay);

            
            if (selected === undefined) { // Haven't beaten level yet
                var selected = this.yMap.get(ourPersist.prevStage);
            }

            if (selected === undefined) { // Storage Level was not unlocked yet on a mode.
                var selected = this.yMap.get(START_STAGE);
            }

            selected.title.setTintFill(COLOR_FOCUS_HEX);

            this.containerToY = selected.conY * -1 + nextRow ?? 0; // A bit cheeky. maybe too cheeky.
            
            this.maskContainerMenu = this.make.container(0, 0);
            
            // mask for top of codexContainer
            var maskMenu = this.make.image({
                x: SCREEN_WIDTH/2,
                y: 0,
                key: 'UI_maskMenu',
                add: false
            }).setOrigin(0.5,0.0);

            maskMenu.scaleX = 24;
            
            // mask for bottom of codexContainer
            var maskMenu2 = this.make.image({
                x: SCREEN_WIDTH/2,
                y: SCREEN_HEIGHT - 42,
                key: 'UI_maskMenu',
                add: false
            }).setOrigin(0.5,1.0);
            maskMenu2.scaleX = 24;
            maskMenu2.scaleY = -1;


            this.maskContainerMenu.add([maskMenu, maskMenu2]);
            this.maskContainerMenu.setVisible(false);


            this.codexContainer.mask = new Phaser.Display.Masks.BitmapMask(this, this.maskContainerMenu);
            this.codexContainer.mask.invertAlpha = true;
            


            this.input.keyboard.on('keydown-UP', e => {

                selected.title.clearTint()

                if (practiceMode) {
                    var safeIndex = Math.max(selected.index - 1, -1);
                } else {
                    var safeIndex = Math.max(selected.index - 1, 0);
                }
                
                if (safeIndex != -1) {
                    var nextSelect = ([...this.yMap.keys()][safeIndex]);
                    selected = this.yMap.get(nextSelect);
                    ourPersist.prevCodexStageMemory = nextSelect;
                    
                    this.containerToY = selected.conY * -1 + nextRow;

                    selected.title.setTintFill(COLOR_FOCUS_HEX);
                    /*this.tweens.add({
                        targets: this.codexContainer,
                        y: this.containerToY,
                        ease: 'Sine.InOut',
                        duration: 0,
                        onComplete: () => {
                            if (exitButton.frame.name === 0) {
                                selected.title.setTintFill(COLOR_FOCUS_HEX);
                            }
                        }
                    }, this);*/
                    
                } else {
                    exitButton.setFrame(1);
                    exitText.node.style.color = "red";
                    var firstElement = this.yMap.get([...this.yMap.keys()][0]);
                    firstElement.title.clearTint();
                }
                
            }, this);

            this.input.keyboard.on('keydown-DOWN', e => {

                var dur = 500;
                if (exitButton && exitButton.frame.name === 1) {
                    exitButton.setFrame(0);
                    exitText.node.style.color = "white"
                    var safeIndex = 0;
                    dur = 0;
                    
                }
                else {
                    var safeIndex = Math.min(selected.index + 1, this.yMap.size - 1);
                }
                
                

                selected.title.clearTint()
     
                var nextSelect = ([...this.yMap.keys()][safeIndex]);
                selected = this.yMap.get(nextSelect);
                ourPersist.prevCodexStageMemory = nextSelect;
                
                this.containerToY = selected.conY * -1 + nextRow;
                selected.title.setTintFill(COLOR_FOCUS_HEX);
                /*this.tweens.add({
                    targets: this.codexContainer,
                    y: this.containerToY,
                    ease: 'Sine.InOut',
                    duration: 0,
                    onComplete: () => {
                        selected.title.setTintFill(COLOR_FOCUS_HEX);
                    }
                }, this);*/
            }, this);  
        }

        if (practiceMode) {
            this.input.keyboard.on('keydown-SPACE', e => {
                if (exitButton.frame.name === 1) {
                    console.log("Exiting!");
                    this.scene.wake('MainMenuScene');
                   this.scene.sleep('StageCodex');
                   this.scene.get("SpaceBoyScene").mapProgressPanelText.setText("SHIP LOG");

                } else {
                    console.log("Launch Practice!", selected.stageTitle);
                    
                    this.scene.start("GameScene", {
                        stage: selected.stageTitle,
                        score: 0,
                        startupAnim: true,
                        mode: MODES.PRACTICE
                    });   
                }
            }, this);
        }

        if (practiceMode) {
                this.input.keyboard.on('keydown-TAB', e => {
                    console.log("Exiting!");
                    this.scene.wake('MainMenuScene');
                    this.scene.stop('StageCodex');
                    this.scene.get("SpaceBoyScene").mapProgressPanelText.setText("SHIP LOG");
                });
        } 
        else {
            var arrowMenuR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
                arrowMenuR.play('arrowMenuIdle').setAlpha(1);
            var mainMenuLabel = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2 + 1,
                'UI_MainMenuLabel');
            mainMenuLabel.angle = 90;

            // Default
            this.input.keyboard.on('keydown-RIGHT', e => {
                const ourMenuScene = this.scene.get('MainMenuScene');
                ourMenuScene.showExitButton('instant');
                console.log("Exiting!");

                this.tweens.add({
                    targets: this.cameras.main,
                    x: { from: 0, to: -160 },
                    duration: 300,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        if (tween.progress >= 0.25) {
                            tween.complete();
                            if (originScene.scene.isPaused()) {
                                originScene.scene.resume();
                                originScene.scene.setVisible(true);
                            } 
                            if (originScene.scene.key == "MainMenuScene") {
                                //debugger
                                this.scene.wake("MainMenuScene");
                            }
                            if (codexArgs.fromQuickMenu) {
                                this.scene.wake('QuickMenuScene');
                            }
                            this.cameras.main.x = 0;
                            // might need to stop scene instead
                            this.scene.sleep('StageCodex');
                        }
                    }
                });
                }, this
            );

            if (!checkExpertUnlocked.call(this)) {
                // Haven't unlocked Expert Mode
                
            } else {
                var arrowMenuL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5, Y_OFFSET + GRID * 4.5)
                        arrowMenuL.play('arrowMenuIdle').setFlipX(true).setAlpha(1);

                this.input.keyboard.on('keydown-LEFT', e => {
                    var newIndex = Phaser.Math.Wrap(displayIndex + 1, 0, displayList.length);
                    
                    this.scene.restart({
                        stage: this.scene.get("GameScene").stage,
                        originScene: originScene,
                        fromQuickMenu: true, 
                        displayList: displayList,
                        displayIndex: newIndex
                    });

                    /*this.tweens.add({
                        targets: this.cameras.main,
                        x: { from: 0, to: 160 },
                        duration: 300,
                        ease: 'Power2',
                        onUpdate: (tween) => {
                            if (tween.progress >= 0.25) {
                                this.scene.restart({
                                    stage: this.scene.get("GameScene").stage,
                                    originScene: originScene,
                                    fromQuickMenu: true, 
                                    displayList: displayList,
                                    displayIndex: newIndex
                                });
                            }
                        }
                    });*/
                    
                    }, this
                );   
            }                               
        }
    }
    update() { 
        this.tweens.add({ // CLEAN UP: THis is adding a tween every frame.
            targets: this.codexContainer,
            y: this.containerToY,
            ease: 'Linear',
            duration: 100,
            repeat: 0,
            yoyo: true,
        });  
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
    init(props){
        var { startingAnimation = "default" } = props;
        this.startingAnimation = startingAnimation;
        // menuState is an int right now but could be made into an object 
        this.menuState = 0; // 0 is main menu, 1 is extras
        // used to make sure menu transitions are finished before switching
        this.inMotion = false;
    }
    create(props) {
        this.input.keyboard.addCapture('UP,DOWN,SPACE');
        const mainMenuScene = this.scene.get('MainMenuScene');
        const ourPersist = this.scene.get('PersistScene');
        //const ourMap = this.scene.get('GalaxyMapScene');


        /* FOR CHECKING IF PLAYER NEEDS TO BE ALERTED -- UNFINISHED
        // needs somewhere to reference/store if an alert has happened before
        // menu option unlock state
        const menuUnlockState = {
            LOCKED: 0, // is locked
            UNLOCKED_FIRST_TIME: 1, // just unlocked for the first time (should only happen once)
            UNLOCKED_PERM: 2, // option has been unlocked and doesn't display anything new
            UNLOCKED_NEW: 3, // for menus that need to show that something new updated but HAS been unlocked
        };
        
        const easyGauntlet = GAUNTLET_CODES.get("Easy Gauntlet");
        if (easyGauntlet) {
            const unlockStatus = easyGauntlet.checkUnlock();
            //console.log("Unlock status (returned rank):", unlockStatus);
            if (unlockStatus === true) {
                console.log("Unlocked");
            } else {
                console.log("Locked");
            }
        }
        else{
            console.log('Error: no gauntlet')
        }
        */

        // set a random color to the portal
        this.portalColors = PORTAL_COLORS.slice();
        let randomColor = this.portalColors[
            Math.floor(Math.random() * this.portalColors.length)];
        let intColor = this.hexToInt(randomColor);
        
        var { portalTint = intColor} = props;
        var { portalFrame = 0 } = props;

        // for exit button transition speed -- false is instant
        //this.isSmooth = true;

        // Snake cursor/selector
        var menuSelector = this.add.sprite(SCREEN_WIDTH / 2 - GRID * 11.5,
            SCREEN_HEIGHT/2 + GRID * 0.25,'snakeDefault').setAlpha(0);

        // title logo
        this.titleLogo = this.add.sprite(SCREEN_WIDTH/2,SCREEN_HEIGHT/2 - GRID * 0,
            'titleLogo').setDepth(60).setScrollFactor(0);
        this.titlePortal = this.add.sprite(X_OFFSET + GRID * 7.1,SCREEN_HEIGHT/2 - GRID * 0.0,)
        .setScrollFactor(0);

        var titleContainer = this.add.container().setDepth(51);

        this.titlePortal.setTint(portalTint).setScale(1.25);
        this.titlePortal.play('portalIdle', {startFrame: portalFrame} );

        titleContainer.add(this.titleLogo);
        titleContainer.add(this.titlePortal);

        // when starting from power off state
        if (this.startingAnimation === "default") {
            //console.log('playing intro animations')
            this.pressedSpace = false;

            var titleTween = this.tweens.add({
                targets: titleContainer,
                y: -GRID * 7,
                duration: 750,
                ease: 'Sine.InOut',
            });
            var fadeInDuration = 500;
        }
        // when returning to main menu and bypassing intro
        if (this.startingAnimation === "menuReturn") {
            //console.log('bypassing power-on intro');
            this.pressedSpace = true;

            titleContainer.y = -GRID * 6;

            var titleTween = this.tweens.add({
                targets: this.titleLogo,
                alpha: 1,
                duration: 300,
                ease: 'Sine.InOut',
            });
            this.tweens.add({
                targets: this.titlePortal,
                scale: 1.25,
                duration: 300,
                ease: 'Sine.InOut',
            });

            var fadeInDuration = 0;
        }

        // description panel (right side text in box)
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


        // for white line and circle that tracks menu option
        this.graphics = this.add.graphics({ lineStyle: { width: 1, color: 0xffffff }, fillStyle: { color: 0xffffff } });
        this.descriptionPointer = new Phaser.Geom.Circle(SCREEN_WIDTH/2 - GRID * 1, SCREEN_HEIGHT/2 + 3, 3);
        this.graphics.fillCircleShape(this.descriptionPointer);
        this.graphics.lineBetween(this.descriptionPointer.x, this.descriptionPointer.y, this.descriptionPanel.x,this.descriptionPointer.y);
        this.graphics.setAlpha(0);
        this.graphics.setDepth(50);

        // MAIN MENU
        // main menu selectable options with their corresponding functions
        var menuOptions = new Map([
            ['practice', function () {
                console.log("Practice");
                this.scene.launch("StageCodex", {
                    originScene: this,
                    fromQuickMenu: false,
                    disableArrows: true,
                    practiceMode: true, 
                });
                mainMenuScene.scene.get("SpaceBoyScene").mapProgressPanelText.setText("PRACTICE");
                mainMenuScene.scene.get("PersistScene").coins = 12;
                mainMenuScene.scene.sleep('MainMenuScene');
                return true;
            }],
            ['adventure', function () {
                this.scene.get("StartScene").UUID_MAP.size;

                mainMenuScene.scene.get("SpaceBoyScene").mapProgressPanelText.setText("ADVENTURE");
                
                if (EXPERT_CHOICE && checkExpertUnlocked.call(this)) { // EXPERT_CHOICE
                    var qMenu = QUICK_MENUS.get(`adventure-mode`);

                    if (checkHardcoreUnlocked()) {
                        qMenu.set("Hardcore", function () {
                            const ourPersist = this.scene.get("PersistScene");
                            const mainMenuScene = this.scene.get("MainMenuScene");
                            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
                            
                            ourPersist.mode = MODES.HARDCORE;
                            ourSpaceBoy.mapProgressPanelText.setText('HARDCORE');
                            this.scene.get("InputScene").scene.restart();

                            var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);
                            mainMenuScene.scene.launch('TutorialScene', [randomHowTo]);

                            mainMenuScene.scene.bringToTop('SpaceBoyScene'); // if not called, TutorialScene renders above
                            mainMenuScene.scene.stop();
                            this.scene.stop();

                        });
                    }

                    mainMenuScene.scene.launch("QuickMenuScene", {
                        menuOptions: qMenu, 
                        textPrompt: "MODE SELECTOR",
                        fromScene: mainMenuScene,
                        cursorIndex: 1
                    });
                    mainMenuScene.scene.bringToTop("QuickMenuScene");

                    mainMenuScene.scene.sleep('MainMenuScene');
                } else {
                    QUICK_MENUS.get("adventure-mode").get("Classic").call(this);
                }
                
                return true;
            }],
            //['extraction', function () {
            //    return true;
            //}],
            //['championship', function () {
            //    return true;
            //}],
            ['gauntlet', function () {
                const ourPersist = this.scene.get("PersistScene");
                const ourSpaceBoy = this.scene.get("SpaceBoyScene");
                //console.log(this.menuElements[cursorIndex].isLocked)
                if (this.menuElements[cursorIndex].isLocked) {
                    //console.log("IS LOCKED")
                    this.menuBonk(menuSelector);
                }
                else {
                    //console.log("not LOCKED")
                    {
                    var generateMenu = [
                        ["Tab to Menu", function () {
                            this.scene.wake('MainMenuScene');
                            this.scene.stop("QuickMenuScene");
                        }],
                    ];

                    GAUNTLET_CODES.forEach( (val, key, map) => {
                        
                        var menuKey;
                        var menuVal;
                        
                        if (val.checkUnlock.call()) {
                            menuKey = key;
                            menuVal = function () {
                                ourPersist.mode = MODES.GAUNTLET;
                                ourPersist.coins = val.startingCoins;
                                ourPersist.gauntletKey = key;
                                ourPersist.gauntlet = val.stages.split("|");
                                ourPersist.gauntletSize = ourPersist.gauntlet.length;
                                ourSpaceBoy.mapProgressPanelText.setText(key);

                                this.scene.get("InputScene").scene.restart();

                                this.scene.get("PersistScene").stageHistory = [];

                                // Launch Game Here
                                var startID = ourPersist.gauntlet.shift();
                                //debugger
                                this.scene.launch("GameScene", {
                                    stage: STAGES.get(startID),
                                    score: 0,
                                    startupAnim: true,
                                    mode: ourPersist.mode
                                });

                                mainMenuScene.scene.bringToTop('SpaceBoyScene');//if not called, TutorialScene renders above
                                mainMenuScene.scene.stop();
                                this.scene.stop();
                            }
                            generateMenu.push([menuKey, menuVal]);
                            
                        }
                    })


                    var qMenu = new Map(generateMenu);

                    mainMenuScene.scene.launch("QuickMenuScene", {
                        menuOptions: qMenu, 
                        textPrompt: "Gauntlet Mode",
                        fromScene: mainMenuScene,
                        cursorIndex: 1,
                        sideScenes: false
                    });
                    mainMenuScene.scene.bringToTop("QuickMenuScene");

                    mainMenuScene.scene.sleep('MainMenuScene');
                }
            }
                return true;
            }],
            //['endless', function () {
                // Check if selected option is locked or not
                //if (this.menuElements[cursorIndex].isLocked) {
                //    this.menuBonk(menuSelector);
                //    console.log('LOCKED ENDLESS');
                //} else {
                //    console.log('UNLOCKED ENDLESS');
                //}
                //return true;
            //}],
            ['extras', function () {
                const selectedElement = this.menuElements[cursorIndex];
                // Check if selected option is locked or not
                if (this.menuElements[cursorIndex].isLocked) {
                    this.menuBonk(menuSelector);
                } else {
                    console.log(`Selected option at index ${cursorIndex} is unlocked.`);
                    // Set menu state and collapse menu
                    this.collapseMenu(1);
        
                    subCursorIndex = 0; // Reset cursor position
                    this.subSelected = selectedElement; // Highlight the selected menu element
                    this.subMenuElements[0].node.style.color = "white";
                    
                    // Add tweens for logo hide
                    this.tweens.add({
                        targets: this.titleLogo,
                        alpha: 0,
                        duration: 300,
                        ease: 'Sine.InOut',
                    });
                    this.tweens.add({
                        targets: this.titlePortal,
                        scale: 0.01, // Prevent visual/camera bugs
                        duration: 300,
                        ease: 'Sine.InOut',
                    });
        
                    // Manually update tweens for buttons and pointer
                    this.tweens.add({
                        targets: this.extrasButton,
                        width: 62,
                        duration: 100,
                        ease: 'Sine.InOut',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: SCREEN_WIDTH / 2 - GRID * 4.575,
                        y: SCREEN_WIDTH / 2 + 3 - GRID * 7.5,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        delay: 300,
                        ease: 'Sine.Out',
                    });

                    // Fade out all main menu elements except extras
                    this.tweens.add({
                        targets: [
                            ...this.menuElements,
                            this.adventureButton,this.adventureIcon,
                            this.practiceButton,this.practiceIcon
                        ],
                        alpha: 0,
                        duration: 300,
                        delay: 60,
                        ease: 'linear',
                    });
        
                    // Fade in all submenu elements and related icons
                    this.tweens.add({
                        targets: [
                            ...this.subMenuElements,
                            this.shopButton, this.customizeButton,this.statsButton,
                            //.minigameButton, this.statsButton, this.awardButton,
                            this.shopIcon, this.customizeIcon, this.minigameIcon,
                            this.statsIcon //this.awardIcon,
                        ],
                        alpha: 1,
                        duration: 300,
                        delay: 60,
                        ease: 'linear',
                    });
                }
            }],
            ['options', function () {
                return true;
            }],
            ['exit', function () {
                return true;
            }]
        ]);

        // make a list of each option derrived from menuOptions
        var menuList = [...menuOptions.keys()];
        var cursorIndex = 1;
        var textStart = 152;
        var spacing = 24;

        // check if Gauntlet Mode can be played
        const targetUUID = "78dc0653-c6d4-4296-88c3-24f7f8415a68"; // UUID for level 1-4
        this.gauntletPlayable = false;

        var _lsTotal=0,_xLen,_x;for (_x in localStorage) {
            if (!localStorage.hasOwnProperty(_x)) {
                continue;
            }
            const _xLen = (localStorage[_x].length + _x.length) * 2;
            _lsTotal += _xLen;
    
            // Check if the target UUID is found
            if (_x.includes(targetUUID)) {
                this.gauntletPlayable = true;
                break; // Exit loop early since we found the UUID
            }
        }

        this.menuoptioncolors = {
            locked: 'darkgrey',
            unlocked: '#181818',
            selectedOption: 'white'
        };

        // list where the text elements are pushed to and handled
        this.menuElements = [];
        for (let index = 0; index < menuList.length; index++) {
            let isLocked = false;

            if (this.gauntletPlayable) {
                isLocked = false;
            } else {
                isLocked = (index === 2);
            }
        
            let isExitButton = (index === 5); // Special case for the exit button
        
            // create the text element
            let textElement = this.add.dom(
                isExitButton ? X_OFFSET + GRID * 0.75 : SCREEN_WIDTH / 2 - GRID * 8.5, // X position
                isExitButton ? Y_OFFSET + 4 : textStart + index * spacing, // Y position
                'div',
                Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                    "color": isLocked ? this.menuoptioncolors.locked : this.menuoptioncolors.unlocked,
                }),
                `${menuList[index].toUpperCase()}`
            ).setOrigin(0.0, 0).setScale(0.5).setAlpha(0);
        
            // apply specific settings for the exit button
            if (isExitButton) {
                textElement.setScrollFactor(0);
            }
        
            // assign if isLocked
            textElement.isLocked = isLocked; // Indicate if the option is locked
            //console.log(index,"locked = ",textElement.isLocked); //this console log will print multiple times
        
            this.menuElements.push(textElement);
        }
        
        // SUB MENU
        // sub menu selectable options with their corresponding functions
        var subMenuOptions = new Map([
            ['Back', function () {
                this.descriptionDom = 'Spend coins, customize, play bonus games, and more!.';
                this.descriptionText.setText(this.descriptionDom);
                this.expandMenu(cursorIndex);
                this.changeMenuSprite(6);
                this.extrasIcon.setFrame(14);
                this.tweens.add({
                    targets: [...this.subMenuElements,this.shopButton,this.customizeButton,
                        this.minigameButton, this.statsButton, this.awardButton,
                        this.shopIcon,this.customizeIcon,this.minigameIcon,
                        this.statsIcon,this.awardIcon],
                    alpha: 0,
                    duration: 300,
                    delay: 60,
                    ease: 'linear',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });

                this.tweens.add({
                    targets: this.titleLogo,
                    alpha: 1,
                    duration: 300,
                    ease: 'Sine.InOut',
                });
                this.tweens.add({
                    targets: this.titlePortal,
                    scale: 1.25,
                    duration: 300,
                    ease: 'Sine.InOut',
                });

                this.tweens.add({
                    targets: this.extrasButton, //back button is swapped to extras button here
                    width: 74,
                    duration: 100,
                    ease: 'Sine.Out',
                });

                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: SCREEN_WIDTH/2 - GRID * 3.5,
                    y: SCREEN_HEIGHT/2 + GRID * 4.25,
                    duration: 100,
                    ease: 'Sine.Out',
                });

                return true;
            }],
            ['Shop', function () {
                console.log("Shop");
                return true;
            }],
            ['Customize', function () {
                console.log("Customize");
                return true;
            }],
            /*['Minigames', function () {
                console.log("Minigames");
                return true;
            }],*/
            ['Stats', function () {
                console.log("Stats");
                return true;
            }],
            /*['Award Board', function () {
                console.log("Award Board");
                return true;
            }],*/
        ]);

        // make a list of each option
        var subMenuList = [...subMenuOptions.keys()];
        var subCursorIndex = 0;
        var textStart = 152 + 24 * 3;
        var spacing = 24;

        // list where the sub menu text elements are pushed to and handled
        this.subMenuElements = []
        // SUB MENU
        for (let index = 0; index < subMenuList.length; index++) {
            // index based for now
            let isLocked //= (index === 3 || index === 5);
            
            let subTextElement = this.add.dom(
                SCREEN_WIDTH / 2 - GRID * 8.5, 
                textStart + index * spacing, 
                'div', 
                Object.assign({}, STYLE_DEFAULT, {
                    "fontSize": '24px',
                    "fontWeight": 400,
                    "color": isLocked ? "darkgrey" : "#181818",
                }),
                `${subMenuList[index].toUpperCase()}`
            ).setOrigin(0.0, 0).setScale(0.5).setAlpha(0);
        
            // assign if isLocked
            subTextElement.isLocked = isLocked;
            //subTextElement.menuKey = subMenuList[index];
        
            this.subMenuElements.push(subTextElement);
        }

        // menu arrows
        this.arrowMenuR = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
        this.arrowMenuR.play('arrowMenuIdle').setAlpha(0).setScrollFactor(0);

        this.arrowMenuL = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5, SCREEN_HEIGHT/2 + GRID * 2)
        this.arrowMenuL.play('arrowMenuIdle').setFlipX(true).setAlpha(0).setScrollFactor(0);

        // side menu labels
        this.codexLabel = this.add.sprite(SCREEN_WIDTH/2 - GRID * 13.5 -1,
             SCREEN_HEIGHT/2 - GRID * 1 - 6,'UI_CodexLabel').setAlpha(0).setOrigin(0,0.5).setScrollFactor(0);
        this.codexLabel.angle = 90;

        this.stageTrackerLabel = this.add.sprite(SCREEN_WIDTH/2 + GRID * 13.5 -1,
             SCREEN_HEIGHT/2 - GRID * 1 + 2,'UI_StageTrackerLabel').setAlpha(0).setOrigin(0,0.5).setScrollFactor(0);
             this.stageTrackerLabel.angle = 90;
        
        // wishlist button
        this.wishlistButton1 = this.add.sprite(SCREEN_WIDTH/2 + GRID * 9.5,
            SCREEN_HEIGHT/2 + GRID * 12,'wishlistButton1',0)
            .setAlpha(0).setOrigin(0.5,0.5).setInteractive();
            this.wishlistButton1.setScrollFactor(0);

        this.wishlistButton1.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.wishlistButton1.play('wListOn');
        });
        this.wishlistButton1.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.wishlistButton1.play('wListOff');
        });

        // establish selected node from menuElements
        this.selected = this.menuElements[cursorIndex];
        this.selected.node.style.color = "white";

        this.subSelected = this.subMenuElements[subCursorIndex];
        this.subSelected.node.style.color = "white";

        var mapEngaged = false;

        // used to back out of sub menus
        this.input.keyboard.on('keydown-TAB', e => {
            // if we are in sub menu EXTRAS
            if (this.menuState === 1 && !this.inMotion) {
                subCursorIndex = 0;
                this.subSelected = this.subMenuElements[0];

                this.descriptionDom = 'Spend coins, customize, play bonus games, and more!';
                this.descriptionText.setText(this.descriptionDom);
                
                cursorIndex = 3;
                this.updateMenu(cursorIndex,subCursorIndex);
                this.expandMenu(cursorIndex);

                menuSelector.y = this.subSelected.y + 7
                this.changeMenuSprite(6);
                this.extrasIcon.setFrame(14);

                this.tweens.add({
                    targets: this.titleLogo,
                    alpha: 1,
                    duration: 300,
                    ease: 'Sine.InOut',
                });
                this.tweens.add({
                    targets: this.titlePortal,
                    scale: 1.25,
                    duration: 300,
                    ease: 'Sine.InOut',
                });

                this.tweens.add({
                    targets: [...this.subMenuElements,this.shopButton,this.customizeButton,
                        this.minigameButton, this.statsButton, this.awardButton,
                        this.shopIcon,this.customizeIcon,this.minigameIcon,
                        this.statsIcon,this.awardIcon],
                    alpha: 0,
                    duration: 300,
                    delay: 60,
                    ease: 'linear',
                });
                this.tweens.add({
                    targets: this.descriptionPanel,
                    height: 45,
                    duration: 100,
                    ease: 'Sine.Out',
                });
                
                this.tweens.add({
                    targets: this.extrasButton, //back button is swapped to extras button here
                    width: 74,
                    duration: 100,
                    ease: 'Sine.Out',
                });

                this.tweens.add({
                    targets: this.descriptionPointer,
                    x: SCREEN_WIDTH/2 - GRID * 3.5,
                    y: SCREEN_HEIGHT/2 + GRID * 4.25,
                    duration: 100,
                    ease: 'Sine.Out',
                });
            }
        })

        this.input.keyboard.on('keydown-LEFT', e => {
            if (this.pressedSpace && this.menuState === 0) {
                this.hideExitButton('instant');
                this.tweens.add({
                    targets: this.cameras.main,
                    x: { from: 0, to: 160 },
                    duration: 300,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        if (tween.progress >= 0.25) {
                            this.scene.launch("StageCodex", {
                                originScene: this,
                                fromQuickMenu: false,
                            });
                            tween.complete();
                            this.cameras.main.x = 0;
                            this.scene.sleep('MainMenuScene');
                        }
                    }
                });  
            }
        }, this);

        this.input.keyboard.on('keydown-RIGHT', e => {
            if (this.pressedSpace && this.menuState === 0) {

                this.hideExitButton('instant');

                this.tweens.add({
                    targets: this.cameras.main,
                    x: { from: 0, to: -160 },
                    duration: 300,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        if (tween.progress >= 0.25) {
                            this.scene.launch("ExtractTracker", {
                                originScene: this,
                                fromQuickMenu: false,
                            });
                            tween.complete();
                            this.cameras.main.x = 0;
                            this.scene.sleep('MainMenuScene');
                        }
                    }
                });  
            }
        });

        this.input.keyboard.on('keydown-DOWN', (event) => {
            // check if player has entered main menu yet.
            if (mainMenuScene.pressedSpace && this.menuState === 0) {
                this.scene.get("SpaceBoyScene").sound.play('buttonHover01');
                cursorIndex = Phaser.Math.Wrap(cursorIndex + 1, 0, this.menuElements.length);
                this.selected = this.menuElements[cursorIndex];
                mainMenuScene.changeMenuSprite(cursorIndex);

                // reiterate and set the unselected options' colors to the correct value
                this.updateMenu(cursorIndex,subCursorIndex);

                // change exit button to red sprite
                if (cursorIndex === 5) {
                    menuSelector.x = menuSelector.x - GRID * 1.75
                    menuSelector.y = this.selected.y + GRID * 2.25
                    mainMenuScene.exitButton.setFrame(1);

                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                } else { //change exit button back to default grey
                    menuSelector.x = SCREEN_WIDTH / 2 - GRID * 11.5;
                    menuSelector.y = this.selected.y + 7;
                    mainMenuScene.exitButton.setFrame(0);
                }
                // move background on option change
                ourPersist.bgCoords.y += 5;
            }
            else if (this.menuState === 1){
                subCursorIndex = Phaser.Math.Wrap(subCursorIndex + 1, 0, this.subMenuElements.length);
                this.subSelected = this.subMenuElements[subCursorIndex];
                menuSelector.y = this.subSelected.y + 7
                mainMenuScene.changeMenuSprite(subCursorIndex);
                this.updateMenu(cursorIndex,subCursorIndex);

                // move background on option change
                ourPersist.bgCoords.y += 5;
            }  
        }, [], this);

        this.input.keyboard.on('keydown-UP', (event) => {
            // check if player has entered main menu yet.
            if (mainMenuScene.pressedSpace && this.menuState == 0) {
                this.scene.get("SpaceBoyScene").sound.play('buttonHover01');
                cursorIndex = Phaser.Math.Wrap(cursorIndex - 1, 0, this.menuElements.length);
                this.selected = this.menuElements[cursorIndex];
                mainMenuScene.changeMenuSprite(cursorIndex);
                // set the unselected options' colors to the correct value
                this.updateMenu(cursorIndex,subCursorIndex);

                // change exit button to red sprite
                if (cursorIndex === 5) {
                    menuSelector.x = menuSelector.x - GRID * 1.75
                    menuSelector.y = this.selected.y + GRID * 2.25
                    mainMenuScene.exitButton.setFrame(1);

                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                } else { // exit button back to default grey
                    menuSelector.x = SCREEN_WIDTH / 2 - GRID * 11.5
                    menuSelector.y = this.selected.y + 7
                    mainMenuScene.exitButton.setFrame(0);
                }
                // move background on option change
                ourPersist.bgCoords.y -= 5;
            }
            else if (this.menuState == 1){
                subCursorIndex = Phaser.Math.Wrap(subCursorIndex - 1, 0, this.subMenuElements.length);
                this.subSelected = this.subMenuElements[subCursorIndex];
                menuSelector.y = this.subSelected.y + 7
                mainMenuScene.changeMenuSprite(subCursorIndex);
                this.updateMenu(cursorIndex,subCursorIndex);

                // move background on option change
                ourPersist.bgCoords.y -= 5;
            }
        }, [], this);

        
        this.input.keyboard.on('keydown-SPACE', function() {
            if (this.scene.get("SpaceBoyScene").spaceBoyReady) {
                this.scene.get("SpaceBoyScene").mapProgressPanelText.setAlpha(1);
                if (!mainMenuScene.pressedSpace) {

                    if (!this.scene.get("MusicPlayerScene").hasStarted) {
                        this.scene.get("MusicPlayerScene").startMusic();
                    } 
    
                    mainMenuScene.pressToPlayTween.stop();
                    mainMenuScene.pressToPlay.setAlpha(0);
                    mainMenuScene.pressedSpace = true;
                    if (this.startingAnimation === "default") {
                        titleTween.resume();
                        menuFadeTween.resume();
                    }
                    this.scene.get("MusicPlayerScene").showTrackID();   
                }
                else{
                    // call the main menu option
                    if (this.menuState == 0 && !this.inMotion) {
                        menuOptions.get(menuList[cursorIndex]).call(this);
                        //this.selected = this.menuElements[cursorIndex];
                        //this.updateMenu(cursorIndex,subCursorIndex,this.menuState);
                    }
                    // call the sub menu option       
                    else if (this.menuState == 1 && !this.inMotion) {
                        //this.updateMenu(cursorIndex,subCursorIndex);
                        subMenuOptions.get(subMenuList[subCursorIndex]).call(this);       
                    }                
                }
            }
        }, this);

        // panels (colored boxes behind text options)

        let _hOffset = SCREEN_WIDTH/2 - GRID * 10.5;
        let _vOffset = SCREEN_HEIGHT/2 - GRID * 1.75;

        this.practiceButton = this.add.nineslice(_hOffset,_vOffset,
                'uiMenu', 'brown', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.practiceIcon = this.add.sprite(this.practiceButton.x + 2,
            this.practiceButton.y,"menuIcons", 0 ).setOrigin(0,0.5).setAlpha(0);
        
        this.adventureButton = this.add.nineslice(_hOffset,_vOffset + GRID * 2,
                'uiMenu', 'purple', 104, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.adventureIcon = this.add.sprite(this.adventureButton.x + 2,
            this.adventureButton.y,"menuIcons", 9 ).setOrigin(0,0.5).setAlpha(0);
        
        /*this.extractionButton = this.add.nineslice(_hOffset,_vOffset + GRID * 4,
                'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.extractionIcon = this.add.sprite(this.extractionButton.x + 2,
            this.extractionButton.y,"menuIcons", 2 ).setOrigin(0,0.5).setAlpha(0);

        this.championshipButton = this.add.nineslice(_hOffset,_vOffset + GRID * 6,
                'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.championshipIcon = this.add.sprite(this.championshipButton.x + 2,
            this.championshipButton.y,"menuIcons", 3 ).setOrigin(0,0.5).setAlpha(0);
        */
        this.gauntletButton = this.add.nineslice(_hOffset,_vOffset + GRID * 4,
                'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.gauntletIcon = this.add.sprite(this.gauntletButton.x + 2,
            this.gauntletButton.y,"menuIcons", 4 ).setOrigin(0,0.5).setAlpha(0);

        /*this.endlessButton = this.add.nineslice(_hOffset,_vOffset + GRID * 10,
                'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setTint('0x8a8a8a').setAlpha(0);
        this.endlessIcon = this.add.sprite(this.endlessButton.x + 2,
            this.endlessButton.y,"menuIcons", 5 ).setOrigin(0,0.5).setAlpha(0);
        */
        this.extrasButton = this.add.nineslice(_hOffset,_vOffset + GRID * 6,
                'uiMenu', 'blue', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.extrasIcon = this.add.sprite(this.extrasButton.x + 2,
            this.extrasButton.y,"menuIcons", 6 ).setOrigin(0,0.5).setAlpha(0);

        this.optionsButton = this.add.nineslice(_hOffset,_vOffset + GRID * 8,
                'uiMenu', 'grey', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.optionsIcon = this.add.sprite(this.optionsButton.x + 2,
            this.optionsButton.y,"menuIcons", 7 ).setOrigin(0,0.5).setAlpha(0);

        this.exitButton = this.add.sprite(X_OFFSET,Y_OFFSET, 'uiExitPanel',0)
        .setOrigin(0,0).setAlpha(0).setScrollFactor(0);

        // sub menu option buttons
        this.shopButton = this.add.nineslice(_hOffset,_vOffset + GRID * 8,
            'uiMenu', 'gold', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.shopIcon = this.add.sprite(this.shopButton.x + 2,
            this.shopButton.y,"menuIcons", 17 ).setOrigin(0,0.5).setAlpha(0);

        this.customizeButton = this.add.nineslice(_hOffset,_vOffset + GRID * 10,
            'uiMenu', 'teal', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.customizeIcon = this.add.sprite(this.customizeButton.x + 2,
            this.customizeButton.y,"menuIcons", 18 ).setOrigin(0,0.5).setAlpha(0);

        /*this.minigameButton = this.add.nineslice(_hOffset,_vOffset + GRID * 18,
            'uiMenu', 'purple', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0).setTint('0x8a8a8a');
        this.minigameIcon = this.add.sprite(this.minigameButton.x + 2,
            this.minigameButton.y,"menuIcons", 19 ).setOrigin(0,0.5).setAlpha(0);
        */
        this.statsButton = this.add.nineslice(_hOffset,_vOffset + GRID * 12,
            'uiMenu', 'grey', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0);
        this.statsIcon = this.add.sprite(this.statsButton.x + 2,
            this.statsButton.y,"menuIcons", 20 ).setOrigin(0,0.5).setAlpha(0);
        /*
        this.awardButton = this.add.nineslice(_hOffset,_vOffset + GRID * 22,
            'uiMenu', 'pink', 136, 18, 9,9,9,9).setOrigin(0,0.5).setAlpha(0).setTint('0x8a8a8a');
        this.awardIcon = this.add.sprite(this.awardButton.x + 2,
            this.awardButton.y,"menuIcons", 21 ).setOrigin(0,0.5).setAlpha(0);
        */
        
        var menuFadeTween = this.tweens.add({
            targets: [this.practiceButton,this.practiceIcon,this.adventureButton,this.adventureIcon,
                this.extractionButton,this.extractionIcon,this.championshipButton,
                this.championshipIcon,this.gauntletButton,this.gauntletIcon,
                this.endlessButton,this.endlessIcon,this.extrasButton,this.extrasIcon,
                this.optionsButton,this.optionsIcon,menuSelector,
                this.descriptionPanel,this.descriptionText,
                this.arrowMenuL,this.arrowMenuR,
                ...this.menuElements,
                this.exitButton,
                this.graphics,
                this.codexLabel,this.stageTrackerLabel,
                this.wishlistButton1
            ],
            alpha: 1,
            duration: 300,
            delay: fadeInDuration,
            ease: 'linear',
        });

        // check if space boi needs to power on or not
        if (this.startingAnimation === "default") {
            titleTween.pause();
            menuFadeTween.pause();

            this.pressToPlay = this.add.dom(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + GRID * 4, 'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize": '24px',
                "fontWeight": 400,
                "color": "white",
                "textAlign": 'center'
    
            }),
                    `Press Space`
            ).setOrigin(0.5,0.5).setScale(0.5).setAlpha(0);
    
            this.pressToPlayTween = this.tweens.add({
                targets: this.pressToPlay,
                alpha: 1,
                duration: 1000,
                ease: 'Sine.InOut',
                yoyo: true,
                repeat: -1,
                paused: true
            });
        }

    }
    
    update() {
        this.graphics.clear(); 
        if (this.pressedSpace) { // CLEAN UP: Does this really need to be called every frame? Consider using an event listener.
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

        //console.log(`Object Scroll Factor: ${this.wishlistButton1.scrollFactorX}, ${this.wishlistButton1.scrollFactorY}`);
        //console.log(`Camera Scroll: ${this.cameras.main.scrollX}, ${this.cameras.main.scrollY}`);
        }  

    // Function to convert hex color to RGB
    hexToInt(hex) {
        return parseInt(hex.slice(1), 16);
    }

    menuBonk(menuSelector){
        // check if menuSelector has a tween currently playing
        if (!menuSelector.isTweening) {
            menuSelector.isTweening = true;
            const tween = this.tweens.add({
                targets: menuSelector,
                x: menuSelector.x + 10,
                yoyo: true,
                repeat: 1,
                duration: 67,
                ease: 'Sine.InOut',
                onComplete: () => {
                    menuSelector.isTweening = false;
                }
            });
        }
    }

    sideMenuPrompts(state){
        if (state === 'hide') {
            this.tweens.add({
                targets: [this.codexLabel, this.arrowMenuL],
                x: obj => obj.x - 20,
                duration: 300,
                ease: 'Sine.InOut',
            });
            this.tweens.add({
                targets: [this.stageTrackerLabel, this.arrowMenuR],
                x: obj => obj.x + 20,
                duration: 300,
                ease: 'Sine.InOut',
            });
        }
        else if (state === 'show'){
            this.tweens.add({
                targets: [this.codexLabel, this.arrowMenuL],
                x: obj => obj.x + 20,
                duration: 300,
                ease: 'Sine.InOut',
            });
            this.tweens.add({
                targets: [this.stageTrackerLabel, this.arrowMenuR],
                x: obj => obj.x - 20,
                duration: 300,
                ease: 'Sine.InOut',
            });
        }
        else{
            console.warn(`Unhandled state: ${state}`);
        }
    }

    updateMenu(cursorIndex,subCursorIndex){
        // for main menu
        if (this.menuState === 0) {
            //reset all menu option colors to their unselected state
            for (var i = 0; i < this.menuElements.length; i++) {
                var element = this.menuElements[i];
                if (i === 2) {
                    if (!this.gauntletPlayable) {
                        element.node.style.color = this.menuoptioncolors.locked; 
                    }
                    else{
                        element.node.style.color = this.menuoptioncolors.unlocked
                    }   
                }
                else{
                    element.node.style.color = this.menuoptioncolors.unlocked
                }
            }
            // apply the correct color for the selected node
            if (cursorIndex === 2) {
                if (!this.gauntletPlayable) {
                    this.selected.node.style.color = this.menuoptioncolors.locked;
                }
                else{
                    this.selected.node.style.color = this.menuoptioncolors.selectedOption;
                }       
            }
            else{
                this.selected.node.style.color = this.menuoptioncolors.selectedOption;
            }
    
        }
        // for sub menu
        else if (this.menuState === 1){
            for (var i = 0; i < this.subMenuElements.length; i++) {
                var element = this.subMenuElements[i];
                //if (i ===  || i === 5) {
                //    element.node.style.color = this.menuoptioncolors.locked; 
                //}
                //else{
                    element.node.style.color = this.menuoptioncolors.unlocked
                //}
            }
            // apply the correct color for the selected node
            //if (subCursorIndex == 3 || subCursorIndex == 5) {
            //    this.subSelected.node.style.color = this.menuoptioncolors.locked;
            //}
            //else{
                this.subSelected.node.style.color = this.menuoptioncolors.selectedOption;
            //}
        }
        
        
    }

    // collapse main menu, and bring extras tab to focus
    // could be made more dynamic by passing arguments for other menus in the future
    collapseMenu(menuOption) {
        this.menuState = 1;
        this.sideMenuPrompts('hide');
        const ourMenuScene = this.scene.get('MainMenuScene');
        this.inMotion = true;

        switch (menuOption) {
            case 0:
            console.log('placeholder menu state');
            break;

            case 1: // EXTRAS
                this.inMotion = true;

                this.tweens.add({
                    targets: this.cameras.main,
                    scrollY: 90,
                    duration: 300,
                    ease: 'Sine.InOut',
                    onComplete: () => {
                        this.inMotion = false;
                        this.extrasIcon.setFrame(24);
                        this.descriptionDom = 'Return back to main menu.';
                        this.descriptionText.setText(this.descriptionDom);
                        console.log('Camera collapseMenu() tween complete');
                    }
                });
        
                this.tweens.add({
                    targets: this.descriptionPanel,
                    y: this.descriptionPanel.y + 90,
                    duration: 300,
                    ease: 'Sine.InOut',
                });
                this.tweens.add({
                    targets: this.descriptionText,
                    y: this.descriptionText.y + 90,
                    duration: 300,
                    ease: 'Sine.InOut',
                });
                break;

            case 2:
                // Behavior for future menuState 2
                console.log('Handle menuState 2 here');
                break;

            case 3:
                // Behavior for future menuState 3 (if needed)
                console.log('Handle menuState 3 here');
                break;

            default:
                console.log('Unknown menuState:', menuState);
                break;
        }

        this.hideExitButton('smooth');
        
        // fade out main menu options to display sub menu
        const selectedElements = [
            this.menuElements[0],
            this.menuElements[1],
            this.menuElements[2],
            this.menuElements[3],
            this.menuElements[4],
            //this.menuElements[5],
            //this.menuElements[6],
            //this.menuElements[7]
        ];

        this.tweens.add({
            targets: [this.gauntletButton,this.gauntletIcon,this.gauntletKey,
                this.optionsButton,this.optionsIcon,
                this.endlessButton,this.endlessIcon,
                this.championshipButton,this.championshipIcon,
                this.extractionButton,this.extractionIcon,
                ...selectedElements],
            alpha: 0,
            duration: 300,
            ease: 'Sine.InOut',
        });
        console.log("collapsing...");
    }

    // brings back main menu and collapses previous menu
    expandMenu(cursorIndex){
        this.menuState = 0
        this.sideMenuPrompts('show');
        this.inMotion = true;

        this.tweens.add({
            targets: this.cameras.main,
            scrollY: 0,
            duration: 300,
            ease: 'Sine.InOut',
            onComplete: () => {
                this.inMotion = false;
                this.menuElements[5].setAlpha(1);
                console.log('Camera expand tween complete');
            }
        });

        this.tweens.add({
            targets: this.descriptionPanel,
            y: this.descriptionPanel.y - 90,
            duration: 300,
            ease: 'Sine.InOut',
        });
        this.tweens.add({
            targets: this.descriptionText,
            y: this.descriptionText.y - 90,
            duration: 300,
            ease: 'Sine.InOut',
        });

        this.showExitButton('smooth');
        
        const selectedElements = [
            this.menuElements[0],
            this.menuElements[1],
            this.menuElements[2],
            this.menuElements[3],
            this.menuElements[4],
            //this.menuElements[5],
            //this.menuElements[6],
            //this.menuElements[7]
        ];

        this.tweens.add({
            targets: [this.gauntletButton,this.gauntletIcon,this.gauntletKey,
                this.optionsButton,this.optionsIcon,
                this.endlessButton,this.endlessIcon,
                this.championshipButton,this.championshipIcon,
                this.extractionButton,this.extractionIcon,
                ...selectedElements],
            alpha: 1,
            duration: 300,
            ease: 'Sine.InOut',
        });

        // Fade in all main menu elements except extras
        this.tweens.add({
            targets: [
                ...this.menuElements,
                this.adventureButton,this.adventureIcon,
                this.practiceButton,this.practiceIcon
            ],
            alpha: 1,
            duration: 300,
            delay: 60,
            ease: 'linear',
        });
        console.log("expanding");
    }

    hideExitButton(ease){
        
        this.menuElements[5].setAlpha(0);
        
        if (ease === 'smooth') {
            //console.log("smooth")
            this.tweens.add({
                targets: this.exitButton,
                y: this.exitButton.y - 2 * GRID,
                duration: 300,
                ease: 'Sine.InOut',
            });
            this.tweens.add({
                targets: this.menuElements[5],
                y: this.menuElements[5].y - 2 * GRID,
                duration: 300,
                ease: 'Sine.InOut',
            });
        }
        else if (ease === 'instant'){
            this.exitButton.setAlpha(0);
            //console.log("instant")
        }  
    }

    showExitButton(ease){
        this.exitButton.setAlpha(1);
        
        if (ease === 'smooth') {
            //console.log("smooth")
            this.tweens.add({
                targets: this.exitButton,
                y: this.exitButton.y + 2 * GRID,
                duration: 300,
                ease: 'Sine.InOut',
            });
            this.tweens.add({
                targets: this.menuElements[5],
                y: this.menuElements[5].y + 2 * GRID,
                duration: 300,
                ease: 'Sine.InOut',
                onComplete: () => {
                    this.menuElements[5].setAlpha(1);
                }
            });
        }
        else if (ease === 'instant'){
            this.menuElements[5].setAlpha(1);
            //console.log("instant")
        }
    }

    changeMenuSprite(cursorIndex){
        // update all menu sprites to their default state
        this.practiceIcon.setFrame(0);
        this.adventureIcon.setFrame(1);
        //this.extractionIcon.setFrame(2);
        //this.championshipIcon.setFrame(3);
        this.gauntletIcon.setFrame(4);
        //this.endlessIcon.setFrame(5);
        if (this.menuState == 0) {
            this.extrasIcon.setFrame(6);
        }
        if (this.menuState == 1) {
            this.extrasIcon.setFrame(14);
        }
        this.optionsIcon.setFrame(7);
        // sub menu option icons
        this.shopIcon.setFrame(17);
        this.customizeIcon.setFrame(18);
        //this.minigameIcon.setFrame(19);
        this.statsIcon.setFrame(20);
        //this.awardIcon.setFrame(21);

        this.tweens.add({
            targets: [this.practiceButton,this.adventureButton,this.extractionButton,this.championshipButton,
                this.gauntletButton,this.endlessButton,this.extrasButton,this.optionsButton,
                this.shopButton, this.customizeButton, this.minigameButton, this.statsButton,
                this.awardButton],
            width: 136,
            duration: 100,
            ease: 'Sine.InOut',
        });

        let _xOffset = SCREEN_WIDTH/2;
        let _yOffset = SCREEN_HEIGHT/2+ 3;

        // update individual menu option based on cursor index
        if (this.menuState === 0) {// if we are in the main menu
            switch (cursorIndex) {
                case 0:// Practice
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
                case 1:// Adventure
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
                        y: _yOffset ,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                /*case 2:
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
                        height: 32.0625, // this value is a decimal; otherwise visual errors
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
                        height: 32.0625,
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
                    break;*/
                case 2:// Gauntlet
                    this.descriptionDom = 'Beat adventure mode to unlock.';
                    this.descriptionText.setText(this.descriptionDom);
                    this.gauntletIcon.setFrame(12);
                    this.tweens.add({
                        targets: this.gauntletButton,
                        width: 94,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 2,
                        y: _yOffset + GRID * 2,
                        duration: 100,
                        ease: 'Sine.Out',
                    });

                    /*
                    this.tweens.add({
                        targets: this.extractionButton,
                        width: 106,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625, // this value is a decimal; otherwise visual errors
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 1,
                        y: _yOffset + GRID * 2,
                        duration: 100,
                        ease: 'Sine.Out',
                    });*/
                    break;
                case 3: // Extras
                    this.descriptionDom = 'Spend coins, customize, play bonus games, and more!';;
                    this.descriptionText.setText(this.descriptionDom);
                    this.extrasIcon.setFrame(14);
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
                        y: _yOffset + GRID * 4,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                case 4:// Options
                    this.descriptionDom = 'Configure game settings.';
                    this.descriptionText.setText(this.descriptionDom)
                    this.optionsIcon.setFrame(15);
                    this.tweens.add({
                        targets: this.optionsButton,
                        width: 82,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 3,
                        y: _yOffset + GRID * 6,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                case 5:// Exit
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
                /*case 6:
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
                */
                    
                default:
                    //;    
                    break;
            }
        }
    
        else if (this.menuState === 1) {// if we are in the extras sub menu
            this.extrasIcon.setFrame(16);
            this.tweens.add({
                targets: [this.extrasButton,this.shopButton,this.customizeButton,
                    this.minigameButton,this.statsButton,this.awardButton
                ],
                width: 136,
                duration: 100,
                ease: 'Sine.Out',
            });
            switch (cursorIndex) {
                case 0:
                    this.descriptionDom = 'Return back to main menu.';
                    this.descriptionText.setText(this.descriptionDom);
                    this.extrasIcon.setFrame(24);
                    
                    this.tweens.add({
                        targets: this.extrasButton, //extras button is swapped to back button here
                        width: 62,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 4.575,
                        y: _yOffset + GRID * 4,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    
                    break;
                case 1:
                    this.descriptionDom = 'Spend coins to unlock new items, game modes, cosmetics, and more.';
                    this.descriptionText.setText(this.descriptionDom)
                    this.shopIcon.setFrame(25)
                    this.tweens.add({
                        targets: this.shopButton,
                        width: 64,
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
                        x: _xOffset - GRID * 4.5,
                        y: _yOffset + GRID * 6,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                case 2:
                    this.descriptionDom = 'Change how your snake looks with unlocked cosmetics.';
                    this.descriptionText.setText(this.descriptionDom);
                    this.customizeIcon.setFrame(26);
                    this.tweens.add({
                        targets: this.customizeButton,
                        width: 100,
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
                        x: _xOffset - GRID * 1.5,
                        y: _yOffset + GRID * 8,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                /*case 3:
                    this.descriptionDom = 'Playable in full game!';
                    this.descriptionText.setText(this.descriptionDom);
                    this.minigameIcon.setFrame(27);
                    this.tweens.add({
                        targets: this.minigameButton,
                        width: 100,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 1.5,
                        y: _yOffset + GRID * 16,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;*/
                case 3:
                    this.descriptionDom = 'View your statistics.';
                    this.descriptionText.setText(this.descriptionDom);
                    this.statsIcon.setFrame(28);
                    this.tweens.add({
                        targets: this.statsButton,
                        width: 66,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset - GRID * 4.25,
                        y: _yOffset + GRID * 10,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;
                /*case 5:
                    this.descriptionDom = 'View your challenges and claim your prizes.';
                    this.descriptionText.setText(this.descriptionDom);
                    this.awardIcon.setFrame(29);
                    this.tweens.add({
                        targets: this.awardButton,
                        width: 120,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPanel,
                        height: 32.0625,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    this.tweens.add({
                        targets: this.descriptionPointer,
                        x: _xOffset + 3,
                        y: _yOffset + GRID * 20,
                        duration: 100,
                        ease: 'Sine.Out',
                    });
                    break;*/ 


                default:
                    //;    
                    break;
            }
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
        this.coins = START_COINS;
        this.stageHistory = [];
        this.prevCodexStageMemory = START_STAGE;
        this.prevStage = START_STAGE;
        this.prevRank = 0;

        // List of Background Containers
        this.bgPlanets = this.add.container(X_OFFSET - 64, Y_OFFSET -64);
        this.bgEmpty = this.add.container(X_OFFSET - 64, Y_OFFSET -64);
        this.bgAsteroidsFar = this.add.container(X_OFFSET - 64, Y_OFFSET -64);
        this.bgAsteroidsClose = this.add.container(X_OFFSET - 64, Y_OFFSET -64);
        
        this.currentBackgroundFar = this.bgPlanets;
        this.currentBackgroundClose = this.bgEmpty;
        //this.currentBackgroundFar = this.bgAsteroidsFar;
        //this.currentBackgroundClose = this.bgAsteroidsClose;

        // Background Objects' Screen Wrapping Dimensions
        this.gameScreenRight =  342 + 128;
        this.gameScreenBottom =  320 + 128;

        this.spriteScrollX = 0;
        this.spriteScrollY = 0;
    }
    
    create() {

    this.hardcorePaths = genHardcorePaths();
    this.hardcoreNavMap = generateNavMap(this.hardcorePaths);
    console.log("hardcore Paths generated", this.hardcorePaths);
    // #region Persist Scene

    this.cameras.main.setBackgroundColor(0x111111);
    this.add.image(SCREEN_WIDTH/2 - 1, GRID * 1.5,'boostMeterBG').setDepth(10).setOrigin(0.5,0.5);
    
    //waveshader     
    this.wavePipeline = game.renderer.pipelines.get('WaveShaderPipeline');

    // #Backgrounds
    // for changing bg sprites
    this.bgTimer = 0;
    this.bgTick = 0;

    // Furthest BG Object
    //atlas code preserved
    //this.bgFurthest = this.add.tileSprite(X_OFFSET, 36, 348, 324,'megaAtlas', 'background02_4.png').setDepth(-4).setOrigin(0,0); 
    this.bgFurthest = this.add.sprite(X_OFFSET, Y_OFFSET, 'backgroundFar03').setDepth(-4).setOrigin(0,0); 
    
    // Scrolling BG1
    //atlas code preserved
    //this.bgBack = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02.png').setDepth(-3).setOrigin(0,0);
    this.bgBack = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'background02').setDepth(-3).setOrigin(0,0);
    this.bgBackStars = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'backgroundBackStars_f1').setDepth(-3).setOrigin(0,0);
    // Scrolling bgScrollMid Stars (depth is behind planets)
    //atlas code preserved
    //this.bgMid = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02_3.png').setDepth(-2).setOrigin(0,0);
    this.bgMid = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'backgroundMiddleStars_f1').setDepth(-2).setOrigin(0,0);
    // Scrolling/Wrapping Sprite Layers

    //atlas code preserved
    //this.bgFront = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'megaAtlas', 'background02_2.png').setDepth(-1).setOrigin(0,0);
    //this.bgFront = this.add.tileSprite(X_OFFSET, 36, 348, 324, 'background02_2').setDepth(-1).setOrigin(0,0);
    //Background Sprite Container
    //this.bgPlanet = this.add.sprite(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'bgPlanets',4).setDepth(100);

    const CENTER_X = SCREEN_WIDTH / 2;
    const CENTER_Y = SCREEN_HEIGHT / 2;

    const dist = 'far'

    // Planets
    // Composite Sprites -- use multiple sprites to make one larger sprite in its own container
    
    // Composite Planet 1
    const p1Quad1 = createImage(this, 0, 0, 'bgPlanets', 0); // Top Left
    const p1Quad2 = createImage(this, 16, 0, 'bgPlanets', 1); // Top Right
    const p1Quad3 = createImage(this, 0, 16, 'bgPlanets', 16); // Bottom Left
    const p1Quad4 = createImage(this, 16, 16, 'bgPlanets', 17); // Bottom Right
    const compSpritePlanet1 = createContainer(this, CENTER_X, 0,
         [p1Quad1, p1Quad2, p1Quad3, p1Quad4]);

    // Composite Planet 2
    const p2Quad1 = createImage(this, 0, 0, 'bgPlanets', 6);
    const p2Quad2 = createImage(this, 0, 16, 'bgPlanets', 22);
    const compSpritePlanet2 = createContainer(this, (CENTER_X) + GRID * 15, CENTER_Y - GRID * 3,
         [p2Quad1, p2Quad2]);

    // Normal Sprite Planets
    const spritePlanet1 = createImage(this, CENTER_X, CENTER_Y, 'bgPlanets', 5);
    const spritePlanet2 = createImage(this, CENTER_X - GRID * 4, CENTER_Y - GRID * 4, 'bgPlanets', 4);
    
    // Asteroids
    // Far Layer
    // Composite Sprites
    const a1Quad1 = createImage(this, 0, 0, 'bgPlanets', 12).setTint(0x8b6d8a);
    const a1Quad2 = createImage(this, 16, 0, 'bgPlanets', 13).setTint(0x8b6d8a);
    const compSpriteAsteroid1 = createContainer(this, CENTER_X - GRID * 30, CENTER_Y - GRID * 12,
         [a1Quad1,a1Quad2]);

    const a2Quad1 = createImage(this, 0, 0, 'bgPlanets', 14).setTint(0x8b6d8a);
    const a2Quad2 = createImage(this, 16, 0, 'bgPlanets', 15).setTint(0x8b6d8a);
    const a2Quad3 = createImage(this, 0, 16, 'bgPlanets', 30).setTint(0x8b6d8a);
    const a2Quad4 = createImage(this, 16, 16, 'bgPlanets', 31).setTint(0x8b6d8a);
    const compSpriteAsteroid2 = createContainer(this, CENTER_X - GRID * 45, CENTER_Y - GRID * 18,
         [a2Quad1,a2Quad2,a2Quad3,a2Quad4]);

    const a3Quad1 = createImage(this, 0, 0, 'bgPlanets', 9).setTint(0x8b6d8a);
    const a3Quad2 = createImage(this, 0, 16, 'bgPlanets', 25).setTint(0x8b6d8a);
    const a3Quad3 = createImage(this, 16, 16, 'bgPlanets', 26).setTint(0x8b6d8a);
    const compSpriteAsteroid3 = createContainer(this, CENTER_X - GRID * 70, CENTER_Y - GRID * 2,
         [a3Quad1,a3Quad2,a3Quad3]);

    const a4Quad1 = createImage(this, 0, 0, 'bgPlanets', 27).setTint(0x8b6d8a);
    const a4Quad2 = createImage(this, 16, 0, 'bgPlanets', 28).setTint(0x8b6d8a);
    const compSpriteAsteroid4 = createContainer(this, CENTER_X - GRID * 60, CENTER_Y - GRID * 86,
         [a4Quad1,a4Quad2]);


    // Create Asteroids
    function createAsteroid(scene, x, y, frame, dist) {
        const asteroid = scene.add.image(x, y, 'bgPlanets', frame);
        asteroid.originalX = x;
        asteroid.originalY = y;
        if (dist === 'far') {
            asteroid.setTint(0x514675); // Further Asteroids
        } else if (dist === 'close') {
            asteroid.setTint(0x8b6d8a); // Closer Asteroids
        }
        return asteroid;
    }

    // Asteroid Frames
    const medAsteroidFrames = [10,11,29,45,44,46,47];
    const smallAsteroidFrames = [8,24,40,41,42,43];

    // Generate Multiple Asteroids (medium)
    function generateMedAsteroids(scene, numAsteroids,dist) {
        const asteroids = [];
        for (let i = 0; i < numAsteroids; i++) {
            const x = CENTER_X - GRID * Phaser.Math.Between(1, 60);
            const y = CENTER_Y - GRID * Phaser.Math.Between(1, 60);
            const frame = Phaser.Math.RND.pick(medAsteroidFrames);
            asteroids.push(createAsteroid(scene, x, y, frame,dist));
        }
        return asteroids;
    }
    // Generate Multiple Asteroids (small)
    function generateSmallAsteroids(scene, baseX, baseY, numGroups, numPerGroup,dist) {
        const smallAsteroids = [];
        for (let i = 0; i < numGroups; i++) {
            const groupX = baseX + GRID * Phaser.Math.Between(1, 60);
            const groupY = baseY + GRID * Phaser.Math.Between(1, 60);
            for (let j = 0; j < numPerGroup; j++) {
                const x = groupX + GRID * (j % 3);
                const y = groupY + GRID * Math.floor(j / 3);
                const frame = Phaser.Math.RND.pick(smallAsteroidFrames);
                smallAsteroids.push(createAsteroid(scene, x, y, frame,dist));
            }
        }
        return smallAsteroids;
    }
    // Create medium asteroids
    const medAsteroids = generateMedAsteroids(this, 30,'far');
    const medAsteroidsClose = generateMedAsteroids(this, 15,'close');
    // Create small asteroids grouped together
    const smallAsteroidGroups = generateSmallAsteroids(this, CENTER_X, CENTER_Y, 10, 5,'far');
    const smallAsteroidsClose= generateSmallAsteroids(this,CENTER_X, CENTER_Y, 5, 3,'close');

    
    // World Background Containers

    // Background Layer Container for Planets (World 1)
    this.bgPlanets.add([compSpritePlanet1, compSpritePlanet2, spritePlanet1, spritePlanet2]);

    // Background Layers Container for Asteroids (World 2)
    this.bgAsteroidsFar.add([...medAsteroids,...smallAsteroidGroups,  
    ]);
    this.bgAsteroidsClose.add([...medAsteroidsClose, ...smallAsteroidsClose,
        compSpriteAsteroid1,compSpriteAsteroid2,compSpriteAsteroid3,compSpriteAsteroid4
    ]);
    this.bgAsteroidsFar.setAlpha(0);
    this.bgAsteroidsClose.setAlpha(0);

    // used by above functions to create an image and preserve its originalX/Y value
    function createImage(scene, x, y, key, frame) {
        const image = scene.add.image(x, y, key, frame);
        image.originalX = x;
        image.originalY = y;
        return image;
    }
    // used for composite sprites
    function createContainer(scene, x, y, children) {
        const container = scene.add.container(x, y, children);
        container.originalX = x;
        container.originalY = y;
        return container;
    }

    // Hue Shift
    this.fx = this.bgBack.preFX.addColorMatrix();
    this.fx2 = this.bgFurthest.postFX.addColorMatrix();
    this.fx3 = this.bgBackStars.postFX.addColorMatrix();

    //this.fx2.hue(90)
    //this.bgFurthest.setPipeline('WaveShaderPipeline');
    //this.fx2 = this.bgFurthest.preFX.addColorMatrix();

    this.bgCoords = new Phaser.Math.Vector2(0,0);

    // leave these values at 0
    this.spriteScrollX = 0.0;
    this.spriteScrollY = 0.0;

    // tune these to continuously scroll background elements
    this.scrollSpeedX = 0.00;
    this.scrollSpeedY = 0.00;

    // 1 to have normal panning ratio; 0 for no directional influence
    this.bgRatio = 1;

    const graphics = this.add.graphics();



    // Is Zero if there is none.
    var rawZeds = localStorage.getItem(`zeds`);
    // Catch if any reason undefined gets saved to localstorage
    if (rawZeds === 'undefined') {
        rawZeds = 0;
    }
    
    this.zeds = Number(JSON.parse(rawZeds));
    var zedsObj = calcZedObj(this.zeds);
    
    // This is an important step, don't leave it out.
    updateSumOfBest(this);

    this.prevSumOfBestAll = this.sumOfBestAll;
    this.prevStagesCompleteAll = this.stagesCompleteAll;
    this.prevPlayerRank = calcPlayerRank(this.sumOfBestAll);

    this.prevSumOfBestExpert = this.sumOfBestExpert;
    this.prevStagesCompleteExpert = this.stagesCompleteExpert;
    this.prevPlayerRankExpert = calcPlayerRank(this.sumOfBestExpert);

    this.prevSumOfBestTut = this.sumOfBestTut;
    this.prevStagesCompleteTut = this.stagesCompleteTut;
    this.prevPlayerRankTut = calcPlayerRank(this.sumOfBestTut);
 
    //this.mapProgressPanelText.setTint(0xffffff); // Set the tint to white to prepare for inversion
    //this.mapProgressPanelText.setBlendMode(Phaser.BlendModes.DIFFERENCE); // Use the difference blend mode to invert colors

    const styleBottomText = {
        "font-size": '12px',
        "font-weight": 400,
        "text-align": 'right',
    }   



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

    pixelateTransition(){
        // check here if entering new world theme
        const fxCamera = this.cameras.main.postFX.addPixelate(-1);
        this.add.tween({
            targets: fxCamera,
            duration: 1000,
            amount: 5,
            yoyo: true,
            delay: 600,
            onComplete: () => {
                this.cameras.main.postFX.remove(fxCamera);
            }
        });
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
                    //this.bgFront.setMask(geomask1,true)
                    this.bgMid.setMask(geomask1,true)
                }
        });
    }

    
    update(time, delta) {

        if (parseInt(time) % 1000 === 0) {
            var objMap = new Map();
            
            this.scene.manager.scenes.forEach( scene => {
                objMap.set(scene.scene.key, scene.children.list.length);
            })
            //console.log("Scene Game Objects", objMap);
    
        }

        //this.wavePipeline.setUniform('uTime', time / 1000);
        this.wavePipeline.set1f('uTime', time / 1000);
        this.renderer.gl.uniform1f(this.wavePipeline.uTimeLocation, time / 1000);


        this.spriteScrollX -= this.scrollSpeedX;
        this.spriteScrollY -= this.scrollSpeedY;


        //removed panning from furthest texture
        //this.bgFurthest.tilePositionX = (Phaser.Math.Linear(this.bgBack.tilePositionX, 
        //    (this.bgCoords.x + this.scrollFactorX), 0.025)) * 0.25;
        //this.bgFurthest.tilePositionY = (Phaser.Math.Linear(this.bgBack.tilePositionY, 
        //    (this.bgCoords.y + this.scrollFactorY), 0.025)) * 0.25;

        this.bgBack.tilePositionX = (Phaser.Math.Linear(this.bgBack.tilePositionX, 
            (this.bgCoords.x + this.spriteScrollX), 0.0125)) * 0.24;
        this.bgBack.tilePositionY = (Phaser.Math.Linear(this.bgBack.tilePositionY, 
            (this.bgCoords.y + this.spriteScrollY), 0.0125)) * 0.24;

        this.bgBack.tilePositionX = (this.bgBack.tilePositionX) * 4;
        this.bgBack.tilePositionY = (this.bgBack.tilePositionY) * 4;

        this.bgBackStars.tilePositionX = this.bgBack.tilePositionX;
        this.bgBackStars.tilePositionY = this.bgBack.tilePositionY;
        
        

        // Background Layer FAR    
        // Update the X and Y of each background container's child object.
        this.currentBackgroundFar.list.forEach(child => {
            child.x = -((this.bgBack.tilePositionX  + this.spriteScrollX)) * 8+ child.originalX;
            var remainderX = (child.x % this.gameScreenRight);
            if (child.x > 0) {
                child.x = remainderX;
            }
            else{
                remainderX += this.gameScreenRight;
                child.x = remainderX;
            }
            child.y = -((this.bgBack.tilePositionY + this.spriteScrollY)) * 8 + child.originalY;
            var remainderY = child.y % this.gameScreenBottom;
            if (child.y > 0) {
                child.y = remainderY;
            }
            else{
                remainderY += this.gameScreenRight;
                child.y = remainderY;
            }
        });
        // Background Layer CLOSE    
        // Update the X and Y of each background container's child object.
        this.currentBackgroundClose.list.forEach(child => {
            child.x = -((this.bgBack.tilePositionX + this.spriteScrollX * 1.5)) * 10 + child.originalX;
            var remainderX = (child.x % this.gameScreenRight);
            if (child.x > 0) {
                child.x = remainderX;
            }
            else{
                remainderX += (this.gameScreenRight);
                child.x = remainderX;
            }
            child.y = -((this.bgBack.tilePositionY + this.spriteScrollY * 1.5)) * 10 + child.originalY;
            var remainderY = child.y % this.gameScreenBottom;
            if (child.y > 0) {
                child.y = remainderY;
            }
            else{
                remainderY += this.gameScreenRight;
                child.y = remainderY;
            }
        });


        this.bgMid.tilePositionX = (this.bgBack.tilePositionX ) * 2;
        this.bgMid.tilePositionY = (this.bgBack.tilePositionY ) * 2;

        this.bgTimer += delta;

        if(this.bgTimer >= 1000){ // TODO: not set this every Frame.
            if (this.bgTick === 0) {
                //reference atlas code
                this.bgMid.setTexture('backgroundMiddleStars_f1'); 
                //this.bgBack.setTexture('megaAtlas', 'background02_frame2.png');
                this.bgBackStars.setTexture('backgroundBackStars_f1');  
                this.bgTick += 1;
            }

            if (this.bgTimer >= 2000) {
                if (this.bgTick === 1) {
                    //reference atlas code
                    this.bgMid.setTexture('backgroundMiddleStars_f2');
                    this.bgBackStars.setTexture('backgroundBackStars_f2');
                    //this.bgBack.setTexture('background02'); 
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

        if (!DEBUG_FORCE_EXPERT) {
            this.mode = props.mode; // Default Case
        } else {
            this.mode = MODES.EXPERT;
        }

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

        this.canPortal = true;
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

        this.goFadeOut = false;


        this.coinSpawnCounter = 100;
    }
    
    
    preload () {
        const ourTutorialScene = this.scene.get('TutorialScene');
        const ourPersist = this.scene.get('PersistScene');

        if (TUTORIAL_ON) {
            var tutorialData = localStorage.getItem(`${TUTORIAL_UUID}_best-Tutorial`);
            if (tutorialData === null && this.stage === 'World_0-1') {
                this.stage = 'Tutorial_1'; // Remeber Override!
                console.log('Tutorial Time!', this.stage);
            }
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
        const ourPinball = this.scene.get("PinballDisplayScene");

        this.scene.moveBelow("SpaceBoyScene", "GameScene");

        if (this.stage == 'Tutorial_3') { // TODO @holden Move to customLevels.js
            this.time.delayedCall(5000, () => {
                this.tutorialPrompt(SCREEN_WIDTH - X_OFFSET - this.helpPanel.width/2 - GRID,
                    Y_OFFSET + this.helpPanel.height/2 + GRID,3,)
            })
        }

        
        if (this.scene.get("PinballDisplayScene").comboCoverFG) {
            this.scene.get("PinballDisplayScene").pinballballFGOn();
        }

        this.graphics = this.add.graphics();


        this.cameras.main.scrollX = -this.camDirection.y * 10
        this.cameras.main.scrollY = -this.camDirection.x * 10
        
        
        var cameraOpeningTween = this.tweens.add({
            targets: this.cameras.main,
            scrollX: 0,
            scrollY: 0,
            duration: 1000,
            ease: 'Sine.Out',
        });
        

        ourSpaceBoyScene.setLog(this.stage);

        // #region World Style
        var worldID = this.stage.split("-")[0].split("_")[1];
        switch (worldID) {
            case "0": // Move to Origin
                ourPersist.bgBack.setTexture('background02');
                ourPersist.bgFurthest.setTexture('backgroundFar03');

                ourPersist.spriteScrollX = 0;
                ourPersist.spriteScrolly = 0;
                ourPersist.scrollSpeedX = 0.00;
                ourPersist.scrollSpeedY = 0.00;
                ourPersist.bgRatio = 1;

                ourPersist.fx.hue(0);
                ourPersist.fx2.hue(0);
                ourPersist.fx3.hue(0);

                ourPersist.bgAsteroidsFar.setAlpha(0);
                ourPersist.bgAsteroidsClose.setAlpha(0);
                ourPersist.bgPlanets.setAlpha(1);
                ourPersist.currentBackgroundFar = ourPersist.bgPlanets;
                ourPersist.currentBackgroundClose = ourPersist.bgEmpty;
                break;
            case "1":// Move to default planet levels
                ourPersist.bgBack.setTexture('background02');
                ourPersist.bgFurthest.setTexture('backgroundFar03');
                
                ourPersist.fx.hue(0);
                ourPersist.fx2.hue(0);
                ourPersist.fx3.hue(0); 
                break;
            case "2":// Move to Asteroid levels
                ourPersist.bgBack.setTexture('background03');
                ourPersist.bgFurthest.setTexture('backgroundFar03');
                
                ourPersist.scrollSpeedX = 0.01;
                ourPersist.scrollSpeedY = 0.00;
                ourPersist.bgRatio = 0;

                ourPersist.fx.hue(15); 
                ourPersist.fx2.hue(15);
                ourPersist.fx3.hue(15);

                ourPersist.bgPlanets.setAlpha(0);
                ourPersist.bgAsteroidsFar.setAlpha(1);
                ourPersist.bgAsteroidsClose.setAlpha(1);
                ourPersist.currentBackgroundFar = ourPersist.bgAsteroidsFar;
                ourPersist.currentBackgroundClose = ourPersist.bgAsteroidsClose;

                break;
            case "3": // Move to Wrap levels
                ourPersist.bgBack.setTexture('background03');
                ourPersist.bgFurthest.setTexture('backgroundFar03');

                ourPersist.fx.hue(0);
                ourPersist.fx2.hue(0);
                ourPersist.fx3.hue(60);
                break;
            case "4": // Move to Aztec levels
                ourPersist.bgBack.setTexture('background03');
                ourPersist.bgFurthest.setTexture('backgroundFar03');

                ourPersist.fx.hue(300); 
                ourPersist.fx2.hue(300);
                ourPersist.fx3.hue(300);
                break;
            case "5":  // Move to Racing levels
                ourPersist.bgBack.setTexture('background02');
                ourPersist.bgFurthest.setTexture('backgroundFar02');

                ourPersist.fx.hue(270);
                ourPersist.fx2.hue(270);
                ourPersist.fx3.hue(270);
                break;
            case "8":  // Move to Advanced Portaling levels
                ourPersist.bgBack.setTexture('background05');
                ourPersist.bgFurthest.setTexture('backgroundFar02');

                ourPersist.fx.hue(0);
                ourPersist.fx2.hue(0);
                ourPersist.fx3.hue(250);
                break;
            case "9":  // Move to Final Exams
                ourPersist.bgBack.setTexture('background03');
                ourPersist.bgFurthest.setTexture('backgroundFar03');

                ourPersist.fx.hue(60);
                ourPersist.fx2.hue(60);
                ourPersist.fx3.hue(60);
                break;
            case "10":  // Move to World 10
                ourPersist.bgBack.setTexture('background03');
                ourPersist.bgFurthest.setTexture('backgroundFar03');

                ourPersist.fx.hue(30);
                ourPersist.fx.hue(30);
                ourPersist.fx.hue(30);
                break;
            //if (this.stage === "testingFuturistic") {
            //    ourPersist.fx.hue(330);
            //}
            default:
                debugger
                break;
        }


        // SOUND

        this.coinSound = this.sound.add('coinCollect');

        var _chargeUp = this.sound.add('chargeUp');
        this.pop03 = this.sound.add('pop03',{ allowMultiple: true });
        this.chime01 = this.sound.add('chime01');
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

        //_chargeUp.play();

        this.spaceKey = this.input.keyboard.addKey("Space");
        console.log("FIRST INIT", this.stage );
          

        // Placeholder Solution; dark grey sprite behind UI components used to mask the lights created from the normal maps
        /*this.UIbackground = this.add.sprite(-GRID * 5.15625 , -GRID * 4.65, 'megaAtlas', 'UI_background.png'
            
        ).setDepth(40).setOrigin(0,0);
        this.UIbackground.setScale(32); 
        this.UIbackground.setVisible(false);*/

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

        // show snake pan across pinball display
        if (this.stage == START_STAGE) {
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            this.scene.get('SpaceBoyScene').scoreTweenShow();
            ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 1)
            this.tweens.add({
                targets: ourPinball.comboCoverSnake,
                x: {from: ourPinball.comboCoverSnake.x - 132,to:ourPinball.comboCoverSnake.x + 0},
                duration: 500,
                ease: 'sine.inout',
                yoyo: false,
                delay: 0,
                repeat: 0,
                onComplete: () => {
                    ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 0)
                },
                onStart: () =>{
                    ourPinball.comboCoverSnake.setAlpha(1);
                }
            });  
            this.tweens.add({
                targets: [ourSpaceBoy.lengthGoalUI, ourSpaceBoy.lengthGoalUILabel],
                alpha:  1,
                ease: 'Sine.InOut',
                duration: 1000,
                repeat: 0,
                yoyo: false
            });
        }
        else{
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            ourSpaceBoy.lengthGoalUI.setAlpha(1);
            ourSpaceBoy.lengthGoalUILabel.setAlpha(1);
        }
        // fade in 'READY?' for pinball display
        ourPinball.comboCoverReady.setOrigin(1.0,0)
        ourPinball.comboCoverReady.setTexture('UI_comboReady')

        this.tweens.add({
            targets: ourPinball.comboCoverReady,
            alpha: {from: 0, to: 1},
            duration: 500,
            ease: 'sine.inout',
            yoyo: false,
            delay: 0,
            repeat: 0,
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

        

        var splitID = this.stage.split("_");
        if (splitID[0] != "World") {
            // The first split and join santizes any spaces.
            this.nextStages = this.tiledProperties.get("next").split(" ").join("").split(",");   
        } else {
            this.stageID = splitID[1];

            if (this.mode === MODES.HARDCORE) {
                this.nextStages = ourPersist.hardcoreNavMap.get(this.stageID);
            } else {
                this.nextStages = NAV_MAP.get(this.stageID);
            }
            
        }

        
        
        

        // Loads tiled properties if not on the main path of levels. May not need the next part that loads all of the next ones, but needs testing before removing.
        if (STAGES.get(this.stage) === undefined) {
            this.load.json(`${this.stage}.properties`, `assets/Tiled/${this.stage}.json`, 'properties');
        }

        // This is kept in for loading the tutorial levels.
        if (this.nextStages != undefined) {
            this.nextStages.forEach( stageName => {
                /***
                 * ${stageName}data is to avoid overloading the json object storage that already
                 * has the Stage Name in it from loading the level. ${stageName}data
                 * exclusivley loads the Tiled properties into the global cache.
                 */
    
                // Only do for stages not loaded from STAGES on the first pass.
                if (STAGES.get(stageName) === undefined) {
                    this.load.json(`${stageName}.properties`, `assets/Tiled/${stageName}.json`, 'properties');
                }  
            });  
        }
        
        

        

        
        this.load.start(); // Loader doesn't start on its own outside of the preload function.
        this.load.on('complete', function () {
            console.log('Loaded all the json properties for NextStages');
        });
        


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
            this.groundLayer = this.map.createLayer("Ground", [this.tileset], X_OFFSET, Y_OFFSET);
            this.groundLayer.setPipeline('Light2D');
        
            const fadeInTiles = [];
        
            this.groundLayer.forEachTile(tile => {
                if (FADE_OUT_TILES.includes(tile.index)) {
                    tile.setAlpha(0.0);
                    fadeInTiles.push(tile);
                }
            });
        
            // Create tween for each tile to fade in
            fadeInTiles.forEach(tile => {
                this.tweens.add({
                    targets: tile,
                    alpha: { from: 0.0, to: 1.0 }, // Fade in to full opacity
                    duration: 1000, // Duration in milliseconds,
                    delay: 1000,
                    ease: 'Linear'
                });
            });
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

        this.startingArrowsAnimN = this.add.sprite(_x + GRID/2, _y - GRID).setDepth(52).setOrigin(0.5,0.5);
        this.startingArrowsAnimN.play('startArrowIdle').setAlpha(0);

        this.startingArrowsAnimS = this.add.sprite(_x + GRID/2, _y + GRID * 2).setDepth(103).setOrigin(0.5,0.5);
        this.startingArrowsAnimS.flipY = true;
        this.startingArrowsAnimS.play('startArrowIdle').setAlpha(0);

        this.startingArrowsAnimE = this.add.sprite(_x + GRID * 2, _y + GRID /2).setDepth(103).setOrigin(0.5,0.5);
        this.startingArrowsAnimE.angle = 90;
        this.startingArrowsAnimE.play('startArrowIdle').setAlpha(0);

        this.startingArrowsAnimW = this.add.sprite(_x - GRID, _y + GRID/2).setDepth(103).setOrigin(0.5,0.5);
        this.startingArrowsAnimW.angle = 270;
        this.startingArrowsAnimW.play('startArrowIdle').setAlpha(0);

        this.startArrows(this.snake.head);

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
        
        this.openingGoalTween = this.tweens.add({
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
            // Turns on Arrows after delay. Only on start.
            if (this.gState != GState.PLAY && !this.winned) {
                this.startArrows(this.snake.head);
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
                ourGameScene.finalScore("MainMenuScene", {
                    startingAnimation : "menuReturn"
                });
                // play small victory fanfare here perhaps
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
                ourGameScene.startArrows(ourGameScene.snake.head);
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
                    mode: ourGameScene.mode,
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

        

        this.lightMasksContainer = this.make.container(0, 0);
         
            this.lights.enable();
            if (!this.tiledProperties.has("dark")) { // this checks for false so that an ambient color is NOT created when DARK_MODE is applied
                this.lights.setAmbientColor(0xc9c9c9);
            }

        
        


        


        // Starting Game State
        this.gState = GState.START_WAIT;

        // Define keys       

        this.input.keyboard.addCapture('W,A,S,D,UP,LEFT,RIGHT,DOWN,SPACE');
        
        // #region Keyboard Inputs
        this.input.keyboard.on('keydown', e => {
            // run with as small of a delay as possible for input responsiveness
            // 
            
            let gState = this.gState;

            if (!this.scene.isActive("QuickMenuScene")) {


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

        this.tabDown = false;
        this.input.keyboard.on('keydown-TAB', function() {
            if (!this.tabDown) {
                this.tabDown = true;
                const ourQuickMenu = this.scene.get('QuickMenuScene');
                const ourScoreScene = this.scene.get('ScoreScene');
                
                // disable opening goal tween so it can't persist to other menus
                this.openingGoalTween.stop();
                this.openingGoalText.setAlpha(0);
                this.openingGoalPanel.setAlpha(0);
                this.r2.setAlpha(0);
                this.stageText.setAlpha(0);
                
                if (!this.scene.isActive(ourScoreScene) && !this.scene.isActive('StageCodex')){
                    this.scene.launch("QuickMenuScene", {
                        menuOptions: QUICK_MENUS.get(`tab-menu-${MODES_TEXT.get(this.mode)}`), 
                        textPrompt: `Quick Menu - ${MODES_TEXT.get(this.mode)}`,
                        fromScene: this,
                        cursorIndex: 0,
                        sideScene:true
                    });
                    this.scene.bringToTop("QuickMenuScene");
                    // make sure tab only blurs background if quick menu is NOT up
                    if (!this.scene.isActive(ourQuickMenu)) {
                        this.backgroundBlur(true);
                    }
                }
            }
        }, this);
        
        this.input.keyboard.on('keyup-TAB', e => {
            this.tabDown = false; 
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

                switch (true) {
                    case this.mode === MODES.CLASSIC || this.mode === MODES.EXPERT || this.mode === MODES.HARDCORE || this.mode === MODES.TUTORIAL:
                        if (this.map.getLayer('Next')) {
                            this.nextStagePortalLayer.visible = true;
                            
                            var blackholeTileIndex = 641; // Starting First column in the row.
                            this.extractLables = [];
                            var blackHoleTiles = [];

                            if (this.mode === MODES.HARDCORE) {

                                var tileIndexes = [641, 642, 643, 644];

                                this.nextStagePortalLayer.forEachTile( tile => {
                                    switch (true) {
                                        case tile.x === 6 && tile.y === 5:
                                            tile.index = Phaser.Utils.Array.GetRandom(tileIndexes);
                                            Phaser.Utils.Array.Remove(tileIndexes, tile.index);
                                            break
                                        case tile.x === 22 && tile.y === 5:
                                            tile.index = Phaser.Utils.Array.GetRandom(tileIndexes);
                                            Phaser.Utils.Array.Remove(tileIndexes, tile.index);
                                            break
                                        case tile.x === 6 && tile.y === 22:
                                            tile.index = Phaser.Utils.Array.GetRandom(tileIndexes);
                                            Phaser.Utils.Array.Remove(tileIndexes, tile.index);
                                            break
                                        case tile.x === 22 && tile.y === 22:
                                            tile.index = Phaser.Utils.Array.GetRandom(tileIndexes);
                                            Phaser.Utils.Array.Remove(tileIndexes, tile.index);
                                            break
                                        default:
                                            tile.index = -1;
                                            break;
                                    }
                                });  
                            } else {

                            }

                            // Add one extract hole spawn here if it exists.
                            if (this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX) && this.mode != MODES.HARDCORE) {
                                var extractTile = this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX);
                                var extractImage = this.add.sprite(extractTile.pixelX + X_OFFSET, extractTile.pixelY + Y_OFFSET, 'extractHole.png' 
                                ).setDepth(10).setOrigin(0.4125,0.4125).play('extractHoleIdle');
                                extractTile.index = -1;
        
                                this.extractText = this.add.bitmapText(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY + GRID * 2 + Y_OFFSET, 'mainFont', 
                                    "EXTRACT!", 
                                    16).setOrigin(0.5,0.5).setDepth(50).setAlpha(0).setScale(1);
                                
                                
                                this.r3 = this.add.rectangle(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY - 11 + GRID * 3 + Y_OFFSET, this.extractText.width + 8, 22, 0x1a1a1a  
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
                                
                            } else {
        
                                debugger
                                

                                for (let tileIndex = BLACK_HOLE_START_TILE_INDEX; tileIndex <= BLACK_HOLE_START_TILE_INDEX + 8; tileIndex++) {
                                    if (this.nextStagePortalLayer.findByIndex(tileIndex)) {
                                        blackHoleTiles.push(this.nextStagePortalLayer.findByIndex(tileIndex));
                                    }
                                }

                                if (this.nextStages === undefined) {
                                    var extractTile = blackHoleTiles[0];
                                    var extractImage = this.add.sprite(extractTile.pixelX + X_OFFSET, extractTile.pixelY + Y_OFFSET, 'extractHole.png' 
                                    ).setDepth(10).setOrigin(0.4125,0.4125).play('extractHoleIdle');
                                    extractTile.index = -1;
            
                                    this.extractText = this.add.bitmapText(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY + GRID * 2 + Y_OFFSET, 'mainFont', 
                                        "EXTRACT!", 
                                        16).setOrigin(0.5,0.5).setDepth(50).setAlpha(0).setScale(1);
                                    
                                    
                                    this.r3 = this.add.rectangle(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY - 11 + GRID * 3 + Y_OFFSET, this.extractText.width + 8, 22, 0x1a1a1a  
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
                                } else {
                                    var nextStagesCopy = this.nextStages.slice();
                                    nextStagesCopy.forEach( stageID => {

                                        var tile = blackHoleTiles.shift(); // Will error if note enough Black Hole Tiles.
                                        var stageName = STAGES.get(stageID);

                                        if (stageName === undefined) { // Catches levels that are not in STAGES.
                                            stageName = stageRaw;
                                        }
                                        
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
                                                //var tempEval = STAGE_UNLOCKS.get(propObj.value).call(ourPersist);
            
                                                var stageID = stageName.split("_")[1];
                                                var hasPath = checkCanExtract(stageID);
                                                
                                                
                                                var spawnOn;
                                                if (!hasPath && this.mode === MODES.EXPERT) {
                                                    spawnOn = false;
                                                } else {
                                                    spawnOn = true;
                                                }
            
        
                                                if ((STAGE_UNLOCKS.get(propObj.value).call(ourPersist) && spawnOn) || this.mode === MODES.HARDCORE) {
                                                    
                                                    // Now we know the Stage is unlocked, so make the black hole tile.
                                                    
                                                    //console.log("MAKING Black Hole TILE AT", tile.index, tile.pixelX + X_OFFSET, tile.pixelY + X_OFFSET , "For Stage", stageName);
            
            
                                                    //this.extractText = this.add.bitmapText(extractTile.pixelX + X_OFFSET + GRID * 0.5, extractTile.pixelY + GRID * 2 + Y_OFFSET, 'mainFont', 
                                                    //    "EXTRACT", 
                                                    //    16).setDepth(50).setAlpha(0);
            
                                                    var stageText = this.add.bitmapText(tile.pixelX + X_OFFSET + GRID * 0.5, tile.pixelY + GRID * 2 + Y_OFFSET, 'mainFont',
                                                        stageName.replaceAll("_", " ").toUpperCase(),
                                                        8).setOrigin(0.5,0.5).setDepth(50).setAlpha(0);
                                                
                                                    
                                                    var r1 = this.add.rectangle(tile.pixelX + X_OFFSET + GRID * 0.5, tile.pixelY - 11 + GRID * 3 + Y_OFFSET, stageText.width + 8, 14, 0x1a1a1a  
                                                    ).setDepth(49).setAlpha(0);
            
                                                    r1.postFX.addShine(1, .5, 5)
                                                    r1.setStrokeStyle(2, 0x4d9be6, 1);
            
                                                    
                                                    
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
                                                    
                                                    if (BEST_OF_ALL.get(stageName) != undefined) {
                                                        switch (BEST_OF_ALL.get(stageName).stageRank()) {
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
                                                            case RANKS.GRAND_MASTER:
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
            
                                                    if (this.stage === "World_0-1" && this.mode === MODES.CLASSIC) {
                                                        switch (true) {
                                                            case !checkRank.call(this, STAGES.get("1-3"), RANKS.WOOD):
                                                                if (stageName === STAGES.get("1-1")) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                    
                                                                }
                                                                break;
                                                            case !checkRank.call(this, STAGES.get("2-3"), RANKS.WOOD):
                                                                if (stageName === STAGES.get("2-1")) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                }
                                                                break;
                                                            case !checkRank.call(this, STAGES.get("4-3"), RANKS.WOOD):
                                                                if (stageName === STAGES.get("4-1")) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                }
                                                                break;
                                                            case !checkRank.call(this, STAGES.get("8-4"), RANKS.WOOD):
                                                                if (stageName === STAGES.get("8-1")) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                }
                                                                break;
                                                            case !checkRank.call(this, STAGES.get("9-4"), RANKS.WOOD) || !checkRank.call(this,STAGES.get("10-4"), RANKS.WOOD):
                                                                if (stageName === STAGES.get("1-1") && !checkRank.call(this, STAGES.get("9-4"), RANKS.WOOD)) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                }
                                                                if (stageName === STAGES.get("2-1") && !checkRank.call(this, STAGES.get("10-4"), RANKS.WOOD)) {
                                                                    blackholeImage.postFX.addShine(1, .5, 5);
                                                                    blackholeImage.setTint(COLOR_FOCUS_HEX);
                                                                }     
                                                            
                                                                break;
                                                        
                                                            default:
                                                                break;
                                                        }
                                                        
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
                                    })  
                                }

                                if (blackHoleTiles.length > 0  && this.mode != MODES.HARDCORE) {
                                    throw new Error(`Too many Black Hole Tiles on ${this.stage}. Need Exactly the right number. /n Next Stages on this stage. ${this.nextStages}`);
                                }
                            }

                            
                        }
                        break;
                
                    case this.mode === MODES.GAUNTLET:
                        var nextTile;
                        if (this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX)) {
                            nextTile = this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX);
                        } else { // There exists Stage Maps
                            var spawnPoints = [];
                            this.nextStagePortalLayer.forEachTile( tile => {
                                if (tile.index > 640 && tile.index < 640 + 9) {
                                    
                                    spawnPoints.push(tile);
                                }
                            });
                            var nextTile = Phaser.Utils.Array.RemoveRandomElement(spawnPoints)
                        }
                        
                        var extractImage = this.add.sprite(nextTile.pixelX + X_OFFSET, nextTile.pixelY + Y_OFFSET, 'extractHole.png' 
                        ).setDepth(10).setOrigin(0.4125,0.4125)
                        if (ourPersist.gauntlet.length === 0) {
                            extractImage.play('extractHoleIdle');
                            this.extractHole.push(extractImage);
                            
                        } else {
                            extractImage.play('blackholeForm');
                            extractImage.playAfterRepeat('blackholeIdle');
                            this.nextStagePortals.push(extractImage);
                        }

                        break;
                    case this.mode === MODES.PRACTICE:
                        
                        var nextTile;
                        if (this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX)) {
                            nextTile = this.nextStagePortalLayer.findByIndex(EXTRACT_BLACK_HOLE_INDEX);
                        } else { // There exists Stage Maps
                            var spawnPoints = [];
                            this.nextStagePortalLayer.forEachTile( tile => {
                                if (tile.index > 640 && tile.index < 640 + 9) {
                                    
                                    spawnPoints.push(tile);
                                }
                            });
                            var nextTile = Phaser.Utils.Array.RemoveRandomElement(spawnPoints)
                        }

                        var extractImage = this.add.sprite(nextTile.pixelX + X_OFFSET, nextTile.pixelY + Y_OFFSET, 'extractHole.png' 
                        ).setDepth(10).setOrigin(0.4125,0.4125);

                        extractImage.play('blackholeForm');
                        extractImage.playAfterRepeat('blackholeIdle');
                        this.nextStagePortals.push(extractImage);

                        break;
                    default:
                        debugger // Leave this in as a safety break
                        break;
                }

                // #region Layer: Next
                 
            }
        }, this);

        

        // #region Coin Layer Logic
        this.coinsArray = [];
        this.coinDiff = 0;

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
        this.portalLights = [];

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
            
            this.portalLight = this.lights.addLight(portal.x +8, portal.y + 8, 128,
                  portalLightColor).setIntensity(1.5);
            this.portalLights.push(this.portalLight);

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

        function adjustLightIntensityAndRadius(portalLights) {
            const maxIntensity = 1.5; // Maximum intensity for lights
            const baselineIntensity = 0.75; // Baseline intensity to ensure visibility
            const maxRadius = 128; // Maximum radius for lights
            const minRadius = 32; // Minimum radius to ensure visibility
            const thresholdDistance = 128; // Distance threshold for adjustment
        
            portalLights.forEach(light1 => {
                let additionalIntensity = 0;
                let newRadius = maxRadius; // Start with the maximum radius
        
                portalLights.forEach(light2 => {
                    if (light1 !== light2) {
                        let distance = Phaser.Math.Distance.Between(light1.x, light1.y, light2.x, light2.y);
                        if (distance < thresholdDistance) {
                            // Adjust additional intensity based on distance
                            additionalIntensity += Phaser.Math.Clamp((thresholdDistance - distance) / thresholdDistance, 0, maxIntensity - baselineIntensity);
                            // Adjust radius based on distance
                            newRadius = Math.max(newRadius * (distance / thresholdDistance), minRadius);
                        }
                    }
                });
        
                // Calculate the final intensity and radius
                const finalIntensity = Phaser.Math.Clamp(baselineIntensity + additionalIntensity, baselineIntensity, maxIntensity);
                light1.setIntensity(finalIntensity);
                //console.log(finalIntensity)
                light1.setRadius(newRadius); // Set the new radius
            });
        }

        
        // Adjust intensities and radii
        adjustLightIntensityAndRadius(this.portalLights);
        
        
        
        
        

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
        var bestLogJSON = JSON.parse(localStorage.getItem(`${this.stageUUID}_best-${MODE_LOCAL.get(this.mode)}`));       

        if (bestLogJSON) {
            // is false if best log has never existed
            var bestLog = new StageData(bestLogJSON);
            bestLog.zedLevel = calcZedObj(ourPersist.zeds).level;

            this.bestBase = bestLog.preAdditive();
        }
        else {
            this.bestBase = 0;
        }

        this.replenishScoreBest();
        //ourSpaceBoyScene.bestScoreValue.setText(`${commaInt(this.bestBase.toString())}`);
        // #placeholder - james

        
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

       
        
        
        

        

        


        
       // #endregion


   

        // Store the Current Version in Cookies
        localStorage.setItem('version', GAME_VERSION); // Can compare against this later to reset things.

        var length = 0;
        this.lengthGoal = LENGTH_GOAL;
        var length = `${ourGame.length}`;

        if (this.lengthGoal != 0) {
            ourSpaceBoy.lengthGoalUI.setText(
                `${length.padStart(2, "0")}\n${this.lengthGoal.toString().padStart(2, "0")}`
            ).setOrigin(0,0);
            ourSpaceBoy.lengthGoalUI.setLineSpacing(6)
            //ourSpaceBoy.lengthGoalUILabel.setAlpha(0);
        }
        else {
            // Special Level
            ourSpaceBoy.lengthGoalUI.setText(`${length.padStart(2, "0")}`).setOrigin(0,0);
            ourSpaceBoy.lengthGoalUI.x = GRID * 27
            //ourSpaceBoy.lengthGoalUILabel.setAlpha(0);
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
        this.countDown = this.add.dom(X_OFFSET + GRID * 8 + 1, GRID * 1.5, 'div', Object.assign({}, STYLE_DEFAULT, {
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


        if (this.coinsUIIcon == undefined) {
            this.coinsUIIcon = ourSpaceBoy.add.sprite(X_OFFSET + GRID * 20 + 5, 2 + GRID * .5, 'coinPickup01Anim.png'
            ).play('coin01idle').setDepth(101).setOrigin(0,0).setVisible(false);
        }

        if (this.scene.get("PersistScene").coins > 0) {
            this.coinsUIIcon.setVisible(true)
        }
        
        
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
        
        
        /*
        this.runningScoreUI = this.add.bitmapText(X_OFFSET + GRID * 24, GRID * 3 - 2, 'mainFont', 'SCORE', 8)
            .setOrigin(0, 1)
            .setAlpha(1)
            .setScrollFactor(0)
            .setTint(0x1f211b)
            .setDepth(100);
        this.runningScoreLabelUI = this.add.bitmapText(X_OFFSET + GRID * 26.75, GRID * 3 -2, 'mainFont', `${commaInt(this.score.toString())}`, 8)
            .setOrigin(0,1).setTint(0x1f211b).setScrollFactor(0);
            */

        
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

        this.electronGroup = this.add.group();
        
        //  #region @E: addScore
        this.events.on('addScore', function (fruit) {

            const ourGameScene = this.scene.get('GameScene');
            const ourScoreScene = this.scene.get('ScoreScene');

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
            
            
            var timeLeft = this.scoreTimer.getRemainingSeconds().toFixed(1) * 10;

            PLAYER_STATS.globalScore += timeLeft;
            
            if (timeLeft > BOOST_ADD_FLOOR) {
                this.boostEnergy = Math.min(this.boostEnergy + 250, 1000);

                var electronToCapacitor = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                this.electronGroup.add(electronToCapacitor);
                var electronToCapacitor2 = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                this.electronGroup.add(electronToCapacitor2);
                var electronToCapacitor3 = ourSpaceBoy.add.sprite(this.snake.head.x + Phaser.Math.RND.integerInRange(-24, 24), this.snake.head.y + Phaser.Math.RND.integerInRange(-12, 12),'electronParticle')
                .setOrigin(0.5,0.5).setDepth(80).setScale(1);
                this.electronGroup.add(electronToCapacitor3);
                //electronToCapacitor.play("electronIdle");
                //electronToCapacitor.anims.msPerFrame = 66;

                var movingElectronTween = this.tweens.add( {
                    targets: electronToCapacitor,
                    x: ourSpaceBoy.scoreFrame.getCenter().x -6,
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
                    x: ourSpaceBoy.scoreFrame.getCenter().x -10,
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
                    x: ourSpaceBoy.scoreFrame.getCenter().x -10,
                    y: ourSpaceBoy.scoreFrame.getCenter().y,
                    duration:300,
                    delay: 66.7,
                    ease: 'Sine.in',
                    onComplete: () => {
                        electronToCapacitor3.destroy();
                    }

                });
                
                //ourGameScene.capSparkSFX.play();
                ourSpaceBoyScene.CapSpark.play(`CapSpark${Phaser.Math.Between(0,9)}`).setOrigin(.5,.5);
                ourSpaceBoyScene.CapSpark.setVisible(true);
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
            var currentScore = calcStageScore(baseScore);

            var lastAtom = this.scoreHistory.slice(this.scoreHistory.length - 1);

            var lastHistory = this.scoreHistory.slice();
            lastHistory.pop();

            var prevBase = lastHistory.reduce((a,b) => a + b, 0)
            
            var lastScore = calcStageScore(prevBase);
            
            var deltaScore =  currentScore - lastScore;

            //console.log("Current Score:", currentScore, "+Δ" , deltaScore, "Length:", this.length);

            //this.runningScore = this.score + calcBonus(baseScore);

            //this.runningScoreLabelUI.setText(
            //    `${commaInt(this.runningScore.toString())}`
            //);
            
            


            // Update UI
            //var tempScore = `${this.scoreHistory.reduce((a,b) => a + b, 0)}`
            //set score to have a comma only when under 6 digits
            ourSpaceBoyScene.scoreValue.setText(
                `${currentScore.toString().length < 6 ? commaInt(currentScore.toString()) : currentScore}`
              );

            //this.deltaScoreUI.x = this.scoreValue.x - this.scoreValue.displayWidth - 1;
            
            ourSpaceBoyScene.deltaScoreUI.setText(
                `+${deltaScore}`
            )

            // checks if displaying deltaScore is in the way of other UI elements
            // before displaying.
            if (!ourSpaceBoyScene._scoreTweenShown) {
                this.tweens.add({
                    targets: ourSpaceBoyScene.deltaScoreUI,
                    alpha:{ from: 1, to: 0 },
                    ease: 'Expo.easeInOut',
                    duration: 2000,
                })
            }

             // Restart Score Timer
            if (this.length < this.lengthGoal || this.lengthGoal === 0) {
                this.scoreTimer = this.time.addEvent({  // This should probably be somewhere else, but works here for now.
                    delay: this.maxScore * 100,
                    paused: false
                 }, this);   
            }

            switch (this.length) {
                case this.lengthGoal - 3:
                    ourSpaceBoy.shiftLight1.setAlpha(1);
                    ourSpaceBoy.shiftLight1.setFrame(0);
                    ourSpaceBoy.shiftLight5.setAlpha(1);
                    ourSpaceBoy.shiftLight5.setFrame(0);
                    break;
                case this.lengthGoal - 2:
                    ourSpaceBoy.shiftLight2.setAlpha(1);
                    ourSpaceBoy.shiftLight1.setFrame(1);
                    ourSpaceBoy.shiftLight2.setFrame(1);
                    ourSpaceBoy.shiftLight4.setAlpha(1);
                    ourSpaceBoy.shiftLight4.setFrame(1);
                    ourSpaceBoy.shiftLight5.setFrame(1);
                    break;
                case this.lengthGoal - 1:
                    ourSpaceBoy.shiftLight3.setAlpha(2);
                    ourSpaceBoy.shiftLight1.setFrame(2);
                    ourSpaceBoy.shiftLight2.setFrame(2);
                    ourSpaceBoy.shiftLight4.setFrame(2);
                    ourSpaceBoy.shiftLight5.setFrame(2);
                    break;
                default:
                    break;
            }

            
        }, this);

        this.lastTimeTick = 0;
        // 9-Slice Panels
        // We recalculate running score so it can be referenced for the 9-slice panel
        var baseScore = this.scoreHistory.reduce((a,b) => a + b, 0);
        //this.runningScore = this.score + calcBonus(baseScore);
        //this.scoreDigitLength = this.runningScore.toString().length;
        

        const goalText = [
            'GOAL : COLLECT 28 ATOMS',
        ];

        
        if (this.startupAnim) {
            this.time.delayedCall(400, event => {
                this.panelAppearTween = this.tweens.add({
                    targets: [this.UIScoreContainer],
                    alpha: 1,
                    duration: 300,
                    ease: 'sine.inout',
                    yoyo: false,
                    repeat: 0,
                });
            })
        }
        

        // dot matrix
        
        // removing until it can be optimized
        /*if (this.startupAnim){

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
            });

            this.variations = [
                [ 33.333, { grid: [ gw, gh ], from: 'center' } ],
            ];
            this.getStaggerTween(0, group);
        }*/

        /*this.tweens.add( {
            targets: this.coinsArray,
            originY: [0.1875 - .0466,0.1875 + .0466],
            ease: 'sine.inout',
            duration: 500, //
            yoyo: true,
            repeat: -1,
           })*/

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

        if (DEBUG_SKIP_TO_SCENE && DEBUG_SCENE === "ScoreScene") {
            this.scene.start(DEBUG_SCENE, DEBUG_ARGS.get(DEBUG_SCENE))
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
            tile.alpha = 0.5;
        });
    }

    // #region .screenShake(
    screenShake(){
        if (this.moveInterval === this.speedSprint) {
            this.cameras.main.shake(400, .01);
        }
        else if (this.moveInterval === this.speedWalk){
            this.cameras.main.shake(300, .00625)
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

    backgroundBlur(isBlurring){
        const ourPersist = this.scene.get('PersistScene');
        
        if (isBlurring) {
            this.fxCamera = ourPersist.cameras.main.postFX.addPixelate(-1);
            this.fxCameraGame = this.cameras.main.postFX.addPixelate(-1);

            this.fxCamera.amount = 1;    
            this.fxCameraGame.amount = 0.5; 
        }
        else{  
            if (this.fxCamera) {
                this.fxCamera.amount = 0;
                this.fxCameraGame.amount = 0;

                ourPersist.cameras.main.postFX.remove(this.fxCamera);
                this.cameras.main.postFX.remove(this.fxCameraGame);
            }
        }
    }


    // #region .Fanfare(
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

        var finalFanfare = false;

        switch (true) {
            case this.mode === MODES.CLASSIC || this.mode === MODES.EXPERT || this.mode === MODES.TUTORIAL:
                if (this.nextStagePortalLayer.findByIndex(616)){
                    finalFanfare = true;
                }
                break;
            case this.mode === MODES.GAUNTLET:
                if (ourPersist.gauntlet.length === 0) {
                    finalFanfare = true;
                }
                break;
            case this.mode === MODES.PRACTICE:
                finalFanfare = false;
                break;
        
            default:
                debugger // Saftey Break. Don't remove.
                break;
        }


        if (!finalFanfare){
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
            this.snake.criticalStateTween.pause(); // stop flashing red if it exists
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
                        ourSpaceBoy.CapSparkFinale = ourSpaceBoy.add.sprite(X_OFFSET + GRID * 9 -3, GRID * 1.5).play(`CapSparkFinale`).setOrigin(.5,.5)
                        .setDepth(100);
                        
                        this.gState = GState.PLAY;
                }
            });

            // check for extractHole so it doesn't fanfare in gauntlet and other modes
            if (this.extractHole) {
                // atomic comet
                ourSpaceBoy.atomComet = ourSpaceBoy.add.sprite(this.snake.head.x + 6,this.snake.head.y + 6)
                .setDepth(100);
                ourSpaceBoy.atomComet.play('atomCometSpawn');
                ourSpaceBoy.atomComet.chain(['atomCometIdle']);


                // rainbow electronFanfare
                ourSpaceBoy.electronFanfare = ourSpaceBoy.add.sprite(this.snake.head.x + 6,this.snake.head.y + 6)
                .setDepth(100);
                ourSpaceBoy.electronFanfare.play('electronFanfareForm');
                

                // emit stars from electronFanfare
                this.starEmitterFinal = this.add.particles(6,6,"twinkle01", { 
                    speed: { min: -20, max: 20 },
                    angle: { min: 0, max: 360 },
                    alpha: { start: 1, end: 0 },
                    anim: 'starIdle',
                    lifespan: 1000,
                    follow: ourSpaceBoy.electronFanfare,
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
        if (ourSpaceBoy.electronFanfare) {
            ourSpaceBoy.electronFanfare.on('animationcomplete', (animation, frame) => {
                if (animation.key === 'electronFanfareForm') {
                    this.tweens.add({
                        targets: [ourSpaceBoy.electronFanfare,ourSpaceBoy.atomComet],
                        x: ourSpaceBoy.scoreFrame.getCenter().x -6,
                        y: ourSpaceBoy.scoreFrame.getCenter().y,
                        ease: 'Sine.easeIn',
                        duration: 1250,
                        onComplete: () => {
                            ourGame.countDown.setAlpha(1);
                            ourGame.countDown.x = X_OFFSET + GRID * 4 - 6;
                            ourGame.countDown.y = 3;
                            ourSpaceBoy.atomComet.destroy();
                        }
                    });
                            ourGame.countDown.setHTML('W1N');
                            ourGame.countDown.x += 3
                    }
                    
            });

            ourSpaceBoy.electronFanfare.chain(['electronFanfareIdle']);
            }
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


    // #region .gameOver(
    gameOver(){
        const ourStartScene = this.scene.get('StartScene');
        const sPersist = this.scene.get("PersistScene");
        const ourPinball = this.scene.get("PinballDisplayScene");
        this.scene.get('MusicPlayerScene').nextSong(`track_149`);
        var ourGame = this.scene.get("GameScene");

        if (this.mode === MODES.HARDCORE) {

            sPersist.hardcorePaths = genHardcorePaths();
            sPersist.hardcoreNavMap = generateNavMap(sPersist.hardcorePaths);
            console.log("New Hardcore Paths generated", sPersist.hardcorePaths);
        }
        
        ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 6)

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
            "min-width": "550px",
            'text-transform': 'uppercase',
            "font-family": '"Press Start 2P", system-ui',
            })).setHTML(
                `GAME OVER`
        ).setOrigin(0.5, 0).setScale(.5).setScrollFactor(0);

        

        //PRESS SPACE TO CONTINUE TEXT
        // Player waits for game over music to complete.
        this.time.delayedCall(14000, function() {
            const ourGameScene = this.scene.get('GameScene');
            var _continue_text = '[SPACE TO TRY AGAIN]';

            var _continueText = this.add.dom(SCREEN_WIDTH/2, GRID * 17,'div', Object.assign({}, STYLE_DEFAULT, {
                "fontSize":'32px',
                "font-family": '"Press Start 2P", system-ui',
                "text-shadow": "4px 4px 0px #000000",
                "min-width": SAFE_MIN_WIDTH ,
                "textAlign": 'center'
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
                //set to next song so it doesn't repeat gameOver song
                ourGameScene.scene.get("MusicPlayerScene").nextSong();
                ourGameScene.gameSceneFullCleanup();
                ourGameScene.scene.start('MainMenuScene');
            }
            onContinue.bind(this);

            this.input.keyboard.on('keydown-SPACE', function() { 
                
                onContinue();
            }, this);

            _continueText.on('pointerdown', e => {
                onContinue();
            }, this);
        }, [], this); 


        
    }
    startArrows(snakeHead){

        var _x = snakeHead.x;
        var _y = snakeHead.y;

        this.startingArrowsAnimN.setPosition(_x + GRID/2, _y - GRID);
        this.startingArrowsAnimS.setPosition(_x + GRID/2, _y + GRID * 2);
        this.startingArrowsAnimE.setPosition(_x + GRID * 2, _y + GRID /2);
        this.startingArrowsAnimW.setPosition(_x - GRID, _y + GRID/2); 

        this.activeArrows = new Set();

        this.map.getLayer(this.wallVarient);
        if (!this.map.hasTileAtWorldXY(_x, _y -1 * GRID)) {
            this.activeArrows.add(this.startingArrowsAnimN );
        }
        if (!this.map.hasTileAtWorldXY(_x, _y +1 * GRID)) {
            this.activeArrows.add(this.startingArrowsAnimS );
        }
        if (!this.map.hasTileAtWorldXY(_x + 1 * GRID, _y)) {
            this.activeArrows.add(this.startingArrowsAnimE );
        }
        if (!this.map.hasTileAtWorldXY(_x - 1 * GRID, _y)) {
            this.activeArrows.add(this.startingArrowsAnimW );
        }

        this.arrowStartupTween = this.tweens.add({
            targets: [...this.activeArrows],
            alpha: 1,
            duration: 500,
            ease: 'linear',
            });
    }

    // #region .extractPrompt(
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

    // #region .finalScore(
    finalScore(nextScene, args){
        const ourStartScene = this.scene.get('StartScene');
        const spaceBoy = this.scene.get("SpaceBoyScene");
        const persist = this.scene.get("PersistScene");


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
        var finalWindowTop = Y_OFFSET + GRID * 8.5;
        var windowCenterX = SCREEN_WIDTH/2;
        var extractHistory = [];

        for (let index = 0; index < persist.stageHistory.length; index++) {
            var id = persist.stageHistory[index].getID();
            var _rank = persist.stageHistory[index].stageRank();
            scoreCount += persist.stageHistory[index].calcTotal();
            extractRankSum += _rank;
            if (extractCode.length === 0) {
                extractCode = id
            } else {
                extractCode = extractCode + "|" + id;
            }

            var record = [
                _rank,
                id,
                Math.round(scoreCount)];

            extractHistory.push(record);

            var _x = windowCenterX - GRID * 6.5 + index * xOffset;

            const stageRank = this.add.sprite(_x ,GRID * 14.0, "ranksSpriteSheet", _rank
            ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');

            var stageID = this.add.dom(_x, GRID * 17, 'div', Object.assign({}, STYLE_DEFAULT,
                finalScoreStyle, {
                })).setHTML(
                    `${id}`
            ).setOrigin(0.5,0).setScale(0.5);
            
        }


        var _x = windowCenterX - GRID * 6.5 + (persist.stageHistory.length) * xOffset;

        var extractRank = extractRankSum / persist.stageHistory.length; 

        

        var finalRank = this.add.sprite(_x + GRID * .5,GRID * 14.0, "ranksSpriteSheet", Math.floor(extractRank)
        ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D');

        var finalText = this.add.dom(_x + GRID * .5, GRID * 17, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `RANK`
        ).setOrigin(0.5,0).setScale(0.5);
            
        if (!localStorage.getItem("extractRanks") && EXTRACT_CODES.includes(extractCode)) {
            // if There is none
            var bestExtractions = new Map();
            bestExtractions.set(extractCode, "Classic Clear");

        } else {
            var bestExtractions = new Map(JSON.parse(localStorage.getItem("extractRanks")))
                
            if (bestExtractions.has(extractCode)) {
                if (this.mode === MODES.EXPERT) {
                    if (bestExtractions.get(extractCode) != "Classic Clear") {
                        var prevBest = bestExtractions.get(extractCode);
                        var prevSum = 0;
                        prevBest.forEach( record => {
                            prevSum += record[0];
                        })
                        if (prevSum < extractRankSum) {
                            console.log("NEW EXRACT RANKING");   
                            bestExtractions.set(extractCode, [...extractHistory]);  
                        }
                    } else {
                        console.log("FIRST EXPERT RANKING CLEAR"); 
                        bestExtractions.set(extractCode, [...extractHistory]);
                    }
                }
            } else {
                switch (this.mode) {
                    case MODES.CLASSIC:
                        if (EXTRACT_CODES.includes(extractCode)) {
                            bestExtractions.set(extractCode, "Classic Clear");
                        }
                        break;
                    case MODES.EXPERT:
                        bestExtractions.set(extractCode, [...extractHistory]);
                        break;
                    default:
                        debugger // Safety Break. Do not remove.
                        break;
                }     
            }
            
        }

        if (bestExtractions.size > 0) {
            const tempArray = Array.from(bestExtractions.entries());
            const jsonString = JSON.stringify(tempArray);

            // Stringify the array
            localStorage.setItem("extractRanks", jsonString);    
        }
        


        if (bestExtractions.get(extractCode) != "Classic Clear" && EXTRACT_CODES.includes(extractCode)) {
            // Show Best Ranks
            var bestExtract = bestExtractions.get(extractCode);
            var bestSum = 0;

            for (let index = 0; index < bestExtract.length; index++) {

                bestSum += bestExtract[index][0];

                var _x = windowCenterX - GRID * 6.5 + index * xOffset;
                
                const bestRank = this.add.sprite(_x ,GRID * 18.5, "ranksSpriteSheet", bestExtract[index][0]
                ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D').setScale(0.5);
                
            }

            var _x = windowCenterX - GRID * 6.5 + (bestExtract.length) * xOffset;

            var bestExtractRank = bestSum / bestExtract.length; 

            var finalRank = this.add.sprite(_x + GRID * .5,GRID * 18.5, "ranksSpriteSheet", Math.floor(bestExtractRank)
            ).setDepth(80).setOrigin(0.5,0).setPipeline('Light2D').setScale(0.5);
            
        }
            
        


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
        this.finalScorePanel = this.add.nineslice(windowCenterX, finalWindowTop, 
            'uiPanelL', 'Glass', 
            GRID * 17, GRID * 12, 
            8, 8, 8, 8);
        this.finalScorePanel.setDepth(60).setOrigin(0.5,0).setScrollFactor(0);


        //FINAL SCORE LABEL
        const finalScoreLableUI = this.add.dom(windowCenterX - GRID * 0.5, finalWindowTop + GRID * 1, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `FINAL SCORE:`
        ).setOrigin(1,0).setScale(0.5);

        if (bestExtractions.get(extractCode) != "Classic Clear" && bestExtractions.size > 0) {
            const bestRanksLableUI = this.add.dom(windowCenterX - GRID * 0.5, finalWindowTop + GRID * 9, 'div', Object.assign({}, STYLE_DEFAULT,
                finalScoreStyle, {
                })).setHTML(
                    `BEST EXTRACTION TRACKER
                     ONLY ON EXPERT`
            ).setOrigin(0.5,0).setScale(0.5);
        }

        
        
        var _totalScore = 0

        this.scene.get("PersistScene").stageHistory.forEach( stageData => {
            _totalScore += stageData.calcTotal();
        });
        _totalScore = Math.floor(_totalScore); //rounds down to whole number
        const formattedScore = _totalScore.toLocaleString();

        //FINAL SCORE VALUE
        const finalScoreUI = this.add.dom(windowCenterX + GRID * 0.5, finalWindowTop + GRID * 1, 'div', Object.assign({}, STYLE_DEFAULT,
            finalScoreStyle, {
            })).setHTML(
                `${formattedScore}`
        ).setOrigin(0,0).setScale(0.5);

        persist.stageHistory = []; // Empty Now

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
                // Important: clear electronFanfare WITH destroy and setting to null.
                // when restarting, if any instance of electronFanfare exists, it will error on level clear
                // also called fron gameSceneCleanup() function, but imperative here too

              
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
        this.gameSceneFullCleanup()

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
                this.scene.start('MainMenuScene', {
                    startingAnimation : "menuReturn"
                });//start shuts down this scene and runs the given one
                
            }
        });
        
        
    }
    drainScore() {
        const ourSpaceBoy = this.scene.get('SpaceBoyScene');
    
        let scoreObj = { score: parseInt(this.bestBase, 10) }; // Ensure it's a number
        
        let lengthValue = LENGTH_GOAL
        let lengthGoalObj = { value: lengthValue };

        // Tween to reduce bestScoreValue to 0
        ourSpaceBoy.tweens.add({
            targets: scoreObj,
            score: 0,
            duration: 1000,
            ease: 'Linear',
            onUpdate: () => {
                const wholeNumberBest = Math.floor(scoreObj.score); // Rounds down to nearest whole number
                ourSpaceBoy.bestScoreValue.setText(`${commaInt(wholeNumberBest.toString())}`);
            }
        });

        // Tween to reduce lengthGoalUI to 0
        ourSpaceBoy.tweens.add({
            targets: lengthGoalObj,
            value: 0,
            duration: 1000,
            ease: 'Linear',
            onUpdate: function(tween) {        
                const wholeNumberGoal = Math.round(lengthGoalObj.value);
                //console.log(`Tweening whole number: ${wholeNumberValue}`);
                ourSpaceBoy.lengthGoalUI.setText(
                    `${String(wholeNumberGoal).padStart(2, "0")}\n${LENGTH_GOAL.toString().padStart(2, "0")}`
                ).setOrigin(0, 0);
                
            }
        });
    }
    replenishScoreBest() {
        const ourSpaceBoy = this.scene.get('SpaceBoyScene');
    
        let scoreObj = { score: 0 };

        ourSpaceBoy.tweens.add({
            targets: scoreObj,
            score: parseInt(this.bestBase, 10),
            duration: 1000,
            ease: 'Linear',
            onUpdate: () => {
                const wholeNumber = Math.floor(scoreObj.score); // Rounds down to nearest whole number
                ourSpaceBoy.bestScoreValue.setText(`${commaInt(wholeNumber.toString())}`);
            }
        });
    }

    // for scenes outside of gameScene
    gameSceneExternalCleanup(){
        console.log('cleaning up spaceboy scene')
        const ourSpaceBoy = this.scene.get('SpaceBoyScene');
        if (ourSpaceBoy.electronFanfare) {
            ourSpaceBoy.electronFanfare.destroy();
        }
        if (ourSpaceBoy.CapSparkFinale) {
            ourSpaceBoy.CapSparkFinale.destroy();
        }
        if (this.electronGroup && this.electronGroup.getLength() > 0) {
            this.electronGroup.children.each(electron => {
                if (electron.electronToCapacitor) electron.electronFanfare.destroy();
                if (electron.electronToCapacitor2) electron.electronFanfare.destroy();
                if (electron.electronToCapacitor3) electron.electronFanfare.destroy();
            });
        }
        else {
            console.log("Electron group is empty or undefined.");
        }   
    }

    gameSceneCleanup(){
        // TODO: finish event listener cleanup here
        // scene blur removal
        const ourSpaceBoy = this.scene.get('SpaceBoyScene');
        const ourGameScene = this.scene.get('GameScene');


        ourSpaceBoy.deltaScoreUI.alpha = 0;
        // Clear for reseting game
        ourGameScene.events.off('addScore');
        ourGameScene.events.off('spawnBlackholes');
        ourGameScene.scene.get("InputScene").scene.restart();

        this.gameSceneExternalCleanup();

        while (ourSpaceBoy.navLog.length > 0) {
            var log = ourSpaceBoy.navLog.pop();
            log.destroy();
            log = null;
        }



        this.scene.get("PinballDisplayScene").resetPinball()

        ourSpaceBoy.shiftLightsDim();
    }
    gameSceneFullCleanup() {
        // Put end of run clean up loop.
        //while (ourSpaceBoy.navLog.length > 0) {
        //    var log = ourSpaceBoy.navLog.pop();
        //    log.destroy();
        //    log = null;
        //}
        this.gameSceneCleanup();
        this.scene.get("PinballDisplayScene").pinballballFGOff();

        this.scene.get("PersistScene").prevRank = 0;

        // reset music player
        if (!this.scene.get("MusicPlayerScene").playerPaused) {
            this.scene.get("MusicPlayerScene").pauseButton.setFrame(0);
        }
        if (!this.scene.get("MusicPlayerScene").playerLooped) {
            this.scene.get("MusicPlayerScene").loopButton.setFrame(4);
        }
        this.scene.get("MusicPlayerScene").nextButton.setFrame(2);

        this.scene.get("PinballDisplayScene").resetPinballFull();

        this.scene.get("SpaceBoyScene").scoreTweenVanish();
        this.scene.get("SpaceBoyScene").mapProgressPanelText.setText("SHIP LOG");
    }
    
 
    warpToNext(nextStageIndex) {

        const ourPersist = this.scene.get('PersistScene');
        const ourSpaceboy = this.scene.get('SpaceBoyScene');
        const ourPinball = this.scene.get("PinballDisplayScene");
        this.gState = GState.TRANSITION;

        ourSpaceboy.scoreTweenShow();
        this.drainScore();
        this.snake.head.setTexture('snakeDefault', 0);
        this.goFadeOut = false;

        console.log('COIN COUNT',this.coinsArray)
        this.addCoins(0);

        // drain boost bar so it's ready for next round
        this.boostEnergy = Math.min(this.boostEnergy - 1000, 100);

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
            const ourPersist = this.scene.get('PersistScene');
            this.tweens.add({
                targets: [ourGameScene.countDown,ourGameScene.coinUIText,
                    ourSpaceboy.shiftLight1,ourSpaceboy.shiftLight2,ourSpaceboy.shiftLight3,
                    ourSpaceboy.shiftLight4,ourSpaceboy.shiftLight5],
                alpha: { from: 1, to: 0},
                ease: 'Sine.InOut',
                duration: 500,
            });
            // check if the next stage is a new world
            var nextStageRaw = this.nextStages[nextStageIndex];
            console.log(nextStageRaw)
            if (nextStageRaw === '2-1' || nextStageRaw === '3-1' || nextStageRaw === '4-1' ||
                nextStageRaw === '5-1' || nextStageRaw === '8-1' || nextStageRaw === '9-2') {
                ourPersist.pixelateTransition();
            };
        });

        var wallSprites = [];
        var fadeOutSprites = []; 
        var groundSprites = [];

        // Camera Pan Logic

        var centerLocation = new Phaser.Math.Vector2(X_OFFSET + GRID * 14,Y_OFFSET + GRID * 13)
        var blackholeLocation = new Phaser.Math.Vector2(this.snake.head.x,this.snake.head.y)

        var camDirection = new Phaser.Math.Vector2((blackholeLocation.y - centerLocation.y),(blackholeLocation.x - centerLocation.x));

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

        //const debugGraphics = this.add.graphics();
        //debugGraphics.lineStyle(2, 0xff0000, 1);
        
        this.wallLayer.culledTiles.forEach( tile => {

            var _sprite = this.add.sprite(tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET, 'tileSprites', tile.index - 1,
            ).setOrigin(0,0).setDepth(20);
            _sprite.setPipeline('Light2D');

            const dx = tile.pixelX + X_OFFSET - this.snake.head.x;
            const dy = tile.pixelY + Y_OFFSET - this.snake.head.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
        
            //debugGraphics.strokeLineShape(new Phaser.Geom.Line(
            //    this.snake.head.x, this.snake.head.y,
            //   tile.pixelX + X_OFFSET, tile.pixelY + Y_OFFSET
            //));
            
            if (FADE_OUT_TILES.includes(tile.index)) {
                fadeOutSprites.push(_sprite);
            } else {
                wallSprites.push({ sprite: _sprite, distance });
            }               
            
        });
        wallSprites.sort((a, b) => a.distance - b.distance);
        const sortedWallSprites = wallSprites.map(obj => obj.sprite);

        this.wallLayer.visible = false;
        this.wallLayerShadow.visible = false;
        
        //Phaser.Utils.Array.Shuffle(wallSprites);
        
        var allTheThings = [
            ...this.coinsArray,
            //...this.portals,
            ...this.atoms,
            ...sortedWallSprites,
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

        var popCounter = 1;
        var numberOfThings = allTheThings.length;

        //ourPersist.bgRatio = 1;


        var blackholeTween = this.tweens.add({
            targets: allTheThings, 
            x: this.snake.head.x - 6,
            y: this.snake.head.y + 18,
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
                if (numberOfThings > 100) {
                    if (popCounter % 2 === 1) {
                        this.sound.play('pop03', { volume: popVolume });
                        if (popVolume >= 0.00) {
                            popVolume -= .005
                        }
                    }
                } else {
                    this.sound.play('pop03', { volume: popVolume });
                    if (popVolume >= 0.00) {
                        popVolume -= .005
                    }
                }

                popCounter += 1;
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
                        switch (true) {
                            case this.mode === MODES.CLASSIC || this.mode === MODES.EXPERT || this.mode === MODES.HARDCORE || this.mode === MODES.TUTORIAL:
                                var nextStageRaw = this.nextStages[nextStageIndex];
                                if (STAGES.get(this.nextStages[nextStageIndex]) === undefined) {
            
                                    this.nextStage(this.nextStages[nextStageIndex], camDirection);
                                    
                                } else {
                                    this.nextStage(STAGES.get(this.nextStages[nextStageIndex]), camDirection);
                                }
                                //setting this to visible is less noticible than leaving it blank for a frame
                                //.comboCover.setVisible(true);
                                break;
                            case this.mode === MODES.GAUNTLET:
                                var nextStageID = ourPersist.gauntlet.shift();
                                this.nextStage(STAGES.get(nextStageID), camDirection);
                                // TODO Save best Gauntlet score to localData also SAVE on GAMEOVER
                                // TODO HANDLE GAUNTLET IN SCORE SCREEN
                            
                                break;
                            case this.mode === MODES.PRACTICE:
                                this.nextStage(this.stage, camDirection);
                                break;
                            default:
                                debugger // Leave for safety break
                                break;
                        }
                        this.gameSceneCleanup();
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

    addCoins(index){
        const ourPersist = this.scene.get('PersistScene');
        
        if (index >= this.coinsArray.length - this.coinDiff) return;
        
        const element = this.coinsArray[index];

        this.time.delayedCall(120, () => {
            ourPersist.coins += 1;
            console.log('adding coin +1')
            this.coinSound.play();
            this.coinUIText.setHTML(`${commaInt(ourPersist.coins).padStart(2, '0')}`);

            // Call the function recursively with the next index
            this.addCoins(index + 1);
        }, [], this);

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
        const ourSpaceboy = this.scene.get('SpaceBoyScene');

        const ourGame = this.scene.get("GameScene");
        const ourPinball = this.scene.get("PinballDisplayScene");
        ourSpaceboy.loseCoin();
        this.coinsUIIcon.setVisible(false);
        ourPersist.coins += -1;
        this.coinUIText.setHTML(
            `${commaInt(ourPersist.coins).padStart(2, '0')}`
        );
        
        ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 5)
        
        ourPinball.comboCoverBONK.setAlpha(1);
        
        this.UI_bonkTween = this.tweens.add({
            targets: ourPinball.comboCoverBONK, 
            x: {from: ourPinball.comboCoverBONK.x ,to:ourPinball.comboCoverBONK.x - 240},
            yoyo: false,
            duration: 1600,
            ease: 'Linear',
            delay: 0,
            onComplete: () =>{
                ourPinball.comboCoverBONK.x = GRID * 17.5
                ourPinball.comboCoverBONK.setAlpha(0);
            },
            onStart: () => {
                if (ourGame.comboFadeTween) {
                    ourGame.comboFadeTween.destroy();
                    ourGame.comboHide();
                }
                
            }
        }); 

        //if (this.UI_bonkTween.isPlaying()) {
        //    this.UI_bonkTween.restart();
        //}
        

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

    nextStage(stageName, camDirection) {
        const ourInputScene = this.scene.get("InputScene");
        this.camDirection = camDirection;
        this.scene.get("PersistScene").prevStage = this.stage;

        this.scene.restart( { 
            stage: stageName, 
            score: this.nextScore, 
            lives: this.lives, 
            startupAnim: false,
            camDirection: this.camDirection,
            mode: this.mode,
        });
    }


    comboBounce(){
        const ourPinball = this.scene.get('PinballDisplayScene');
        this.tweens.add({
            targets: [ourPinball.letterC,ourPinball.letterO,
                ourPinball.letterM, ourPinball.letterB, 
                ourPinball.letterO2, ourPinball.letterExplanationPoint], 
            y: { from: GRID * 1.25, to: GRID * 0 },
            ease: 'Sine.InOut',
            duration: 200,
            repeat: 0,
            delay: this.tweens.stagger(60),
            yoyo: true
            });
    }

    comboAppear(){
        const ourPinball = this.scene.get('PinballDisplayScene');
        console.log('appearing')
        this.tweens.add({
            targets: [ourPinball.letterC,ourPinball.letterO,
                ourPinball.letterM, ourPinball.letterB, 
                ourPinball.letterO2, ourPinball.letterExplanationPoint], 
            alpha: { from: 0, to: 1 },
            ease: 'Sine.InOut',
            duration: 300,
            repeat: 0,
        });
        this.comboActive = true;
    }

    comboFade(){
        const ourPinball = this.scene.get('PinballDisplayScene');
        this.comboFadeTween = this.tweens.add({
            targets: [ourPinball.letterC,ourPinball.letterO,
                ourPinball.letterM, ourPinball.letterB, 
                ourPinball.letterO2, ourPinball.letterExplanationPoint], 
            alpha: { from: 1, to: 0 },
            ease: 'Sine.InOut',
            duration: 500,
            repeat: 0,
        });
        this.comboActive = false;
        this.comboCounter = 0;
    }
    
    // Used when another element needs to take precedence such as bonking
    comboHide(){
        const ourPinball = this.scene.get('PinballDisplayScene');
        ourPinball.letterC.setAlpha(0);
        ourPinball.letterO.setAlpha(0);
        ourPinball.letterM.setAlpha(0);
        ourPinball.letterB.setAlpha(0);
        ourPinball.letterO2.setAlpha(0);
        ourPinball.letterExplanationPoint.setAlpha(0);

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

    musicPlayerDisplay(show){
        const ourSpaceboy = this.scene.get('SpaceBoyScene');
        let _offset = 36;
        if (show === true) {
            this.tweens.add({
                targets: ourSpaceboy.lengthGoalUI,
                x: X_OFFSET + GRID * 32.25 + 3 - _offset,
                ease: 'power2',
                duration: 800,
                completeDelay: 1000,
                repeat: 0,
            }); 
            this.tweens.add({
                targets: ourSpaceboy.lengthGoalUILabel,
                x: X_OFFSET + GRID * 29.0 + 6 - _offset,
                ease: 'power2',
                duration: 800,
                completeDelay: 1000,
                repeat: 0,
            }); 
        }
        else if (show === false) {
            this.tweens.add({
                targets: ourSpaceboy.lengthGoalUI,
                x: X_OFFSET + GRID * 32.25 + 3,
                ease: 'power2',
                duration: 800,
                completeDelay: 1000,
                repeat: 0,
            }); 
            this.tweens.add({
                targets: ourSpaceboy.lengthGoalUILabel,
                x: X_OFFSET + GRID * 29.0 + 6,
                ease: 'power2',
                duration: 800,
                completeDelay: 1000,
                repeat: 0,
            }); 
        }
            
        
        this.lengthGoalUI
        this.lengthGoalUILabel
    }

    collapsePortals(){
        this.portals.forEach(portal => {
            portal.play('portalClose');
            portal.on('animationcomplete', (animation) => {
                if (animation.key === 'portalClose') {
                    portal.alpha = 0;
                }
            });
            portal.portalHighlight.alpha = 0;
        })

        this.portalLights.forEach(portalLight => {
            this.lights.removeLight(portalLight);
        });

        this.portalParticles.forEach(portalParticles => { 
            portalParticles.stop();
        });
    }

    // #region Game Update
    update(time, delta) {


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
        // TODO SHOULD BE CHANGED TO UNDOING BLACK HOLE TWEENS
        if (this.spaceKey.getDuration() > RESET_WAIT_TIME 
            && this.pressedSpaceDuringWait 
            && this.gState === GState.WAIT_FOR_INPUT
            && !this.winned
        ) {
                console.log("SPACE LONG ENOUGH BRO");
        }

        
        // #region Win State
        if (this.checkWinCon() && !this.winned) {

            console.log("YOU WIN" , this.stage);
            this.winned = true;
            this.canPortal = false;
            this.atoms.forEach(atom => {
                // So you can't see them during free play.
                atom.electrons.visible = false;
            })

            var checkList = [...this.portals, ...this.wallPortals];
            checkList.forEach(portal => {
                portal.snakePortalingSprite.visible = false;
            })


            //this.scoreLabel.setText(`Stage: ${this.scoreHistory.reduce((a,b) => a + b, 0)}`); //commented out as it double prints
            this.gState = GState.TRANSITION;
            this.snake.direction = DIRS.STOP;
            //slowmo comment
            //this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);


            this.events.off('addScore');

            const ourInputScene = this.scene.get("InputScene");
            const ourPersist = this.scene.get("PersistScene");

            var stageDataJSON = {
                bonks: this.bonks,
                boostFrames: ourInputScene.boostTime,
                cornerTime: Math.floor(ourInputScene.cornerTime),
                diffBonus: this.stageDiffBonus,
                foodHistory: this.foodHistory,
                foodLog: this.scoreHistory,
                medals: this.medals,
                moveCount: ourInputScene.moveCount,
                moveHistory: ourInputScene.moveHistory,
                turnInputs: ourInputScene.turnInputs,
                turns: ourInputScene.turns,
                stage:this.stage,
                mode:this.mode,
                uuid:this.stageUUID,
                zedLevel: calcZedObj(ourPersist.zeds).level,
                zeds: ourPersist.zeds,
                sRank: parseInt(this.tiledProperties.get("sRank")) // NaN if doesn't exist.
            }

            //this.backgroundBlur(true);
            this.collapsePortals();
            this.scene.launch('ScoreScene', stageDataJSON);
            

            const ourQuickMenu = this.scene.get('QuickMenuScene');
            console.log(ourQuickMenu);


            // for handling if quick menu is active or not
            if (this.scene.isActive(ourQuickMenu)) {
                console.log('its open!!!!')
                ourQuickMenu.scene.stop();
            }
            else{
                this.backgroundBlur(true);
            }
            this.setWallsPermeable();
        }

        // #region Lose State
        if (this.checkLoseCon() && this.canContinue) {
            this.canContinue = false;
            this.gState = GState.TRANSITION;
            this.snake.direction = DIRS.STOP;
            this.vortexIn(this.snake.body, this.snake.head.x, this.snake.head.y);
            this.gameSceneCleanup();
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
            
            
            if (this.gState === GState.PLAY) {
                var ourGame = this.scene.get("GameScene");
                const ourPinball = this.scene.get("PinballDisplayScene");
                const ourSpaceBoy = this.scene.get("SpaceBoyScene");

                // Move at last second
                this.snake.move(this);
                
                if (ourInputScene.moveHistory[ourInputScene.moveHistory.length - 1][0] === `s${this.moveInterval}` ) {
                    ourInputScene.moveHistory[ourInputScene.moveHistory.length - 1][1] += 1;
                } else {
                    ourInputScene.moveHistory.push([ `s${this.moveInterval}`, 1 ]);
                }
                //ourInputScene.moveHistory.push([(this.snake.head.x - X_OFFSET)/GRID, (this.snake.head.y - Y_OFFSET)/GRID , this.moveInterval]);
                ourInputScene.moveCount += 1;


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
                if (!this.winned) {
                    this.coinSpawnCounter -= 1;
                }

                if (this.coinSpawnCounter < 1) {
                    if (this.spawnCoins) {
                        switch (this.mode) {
                            case MODES.CLASSIC:
                                console.log("COIN TIME YAY. SPAWN a new coin");
                                var validLocations = this.validSpawnLocations();
                                var pos = Phaser.Math.RND.pick(validLocations);
        
                                var _coin = new Coin(this, this.coinsArray, pos.x, pos.y);
                                this.interactLayer[(pos.x - X_OFFSET)/GRID][(pos.y - Y_OFFSET)/GRID] = _coin;
                                
                                _coin.postFX.addShadow(-2, 6, 0.007, 1.2, 0x111111, 6, 1.5);
        
                                //this.coinsArray.push(_coin);
                                
                                break;
                            case MODES.EXPERT:
                                console.log("Coins Skipped On Expert");
                                PLAYER_STATS.expertCoinsNotSpawned += 1;
                                
                                break;
                        
                            default:
                                break;
                        }
                    }
                    this.coinSpawnCounter = Phaser.Math.RND.integerInRange(80,140);
                }
            }

            // Update Atom Animation.
            if (GState.PLAY === this.gState && !this.winned) {
                switch (timeTick) {
                    case this.maxScore:  // 120 {}
                    this.atoms.forEach(atom => {
                        if (atom.anims.currentAnim.key !== 'atom01idle'||atom.anims.currentAnim.key !== 'atom05spawn') {
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
        this.mode = props.mode;

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

    atomTime() {
        var stageScore = this.foodLog.reduce((a,b) => a + b, 0);
        return stageScore;
    },
    
    stageScore() {
        var base = this.atomTime()
        return calcStageScore(base);
    },

    stageRank() {
        let rank;
        let stageScore = this.preAdditive();

        
        switch (true) {
            case Math.min(...this.foodLog.slice(1,-1)) > RANK_BENCHMARKS.get(RANKS.GRAND_MASTER):
                if (this.foodLog.length === 28) {
                    rank = RANKS.GRAND_MASTER
                } else {
                    // Nice for testing and not accidentally getting FULL COMBO
                    rank = RANKS.BRONZE;
                }
                break
            case this.sRank != null && stageScore > this.sRank:
                rank = RANKS.PLATINUM;
                break;
            case stageScore > RANK_BENCHMARKS.get(RANKS.GOLD):
                rank = RANKS.GOLD;
                break;
            case stageScore > RANK_BENCHMARKS.get(RANKS.SILVER):
                rank = RANKS.SILVER;
                break;
            case stageScore > RANK_BENCHMARKS.get(RANKS.BRONZE):
                rank = RANKS.BRONZE;
                break;
            default:
                rank = RANKS.WOOD;
        }
        return rank;
        

    },

    preAdditive() {
        var val = calcStageScore(this.atomTime());
        return val;
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

        var val = Number(this.diffBonus/100 + zedLevelBonus + medalBonus);
        return val;
        
    },

    postMult() {
        var pre = this.preAdditive();
        var bonusMult = this.bonusMult()
        var val = Math.floor(pre * bonusMult);
        return val
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
        
        if (comboCounter > 27) { // Sometimes it can be 29 if you get the first one fast enough.
            bestCombo = 100; // Full combo = + 10,000
        }
    
        return bestCombo * 100;
    },
    boostBonus() {
        return Math.ceil(this.boostFrames / 10) * 6;
    },
    
    calcTotal() {
        var _postMult = this.postMult();
        var _bonkBonus = this.bonkBonus();

        var val = _postMult + _bonkBonus + this.comboBonus(); //+ this.boostBonus();
        return val;
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

    create(stageDataJSON) {
        const ourInputScene = this.scene.get('InputScene');
        const ourGame = this.scene.get('GameScene');
        const ourScoreScene = this.scene.get('ScoreScene');
        const ourStartScene = this.scene.get('StartScene');
        const ourPersist = this.scene.get('PersistScene');
        const ourSpaceBoy = this.scene.get("SpaceBoyScene");
        const plinkoMachine = this.scene.get("PlinkoMachineScene");
        //bypass scorescene temporarily for slowmo
        //ourGame.events.emit('spawnBlackholes', ourGame.snake.direction);
     

        /*var style = {
            'color': '0x828213'
          };
        ourGame.countDown.style = style*/
        ourGame.countDown.setHTML('0FF');

        this.ScoreContainerL = this.make.container(0,0);
        this.ScoreContainerR = this.make.container(0,0);


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
        //ourPersist.prevStage = this.stageData.stage;

        // For properties that may not exist.
        if (ourGame.tiledProperties.has("slug")) {
            this.stageData.slug = ourGame.tiledProperties.get("slug");
        }
        
        console.log(JSON.stringify(this.stageData));



        var tempStageHistory = [...this.scene.get("PersistScene").stageHistory, this.stageData];
        console.log("STAGE HISTORY: MID SCORE SCREEN.", this.scene.get("PersistScene").stageHistory, this.stageData);
    

        // #region Save Best To Local.

        var bestLogRaw = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}_best-${MODE_LOCAL.get(ourGame.mode)}`));
        if (bestLogRaw) {
            // is false if best log has never existed
            var bestLog = new StageData(bestLogRaw);
            bestLog.zedLevel = calcZedObj(ourPersist.zeds).level;

            var bestLocal = bestLog.calcTotal();
        }
        else {
            var bestLocal = 0;
        }

        var currentLocal = this.stageData.calcTotal()
        if (currentLocal > bestLocal) {
            console.log(`NEW BEST YAY! ${currentLocal} (needs more screen juice)`);
            bestLocal = currentLocal;

            this.stageData.newBest = true;

            
            if (ourGame.stageUUID != "00000000-0000-0000-0000-000000000000" && ourGame.mode != MODES.PRACTICE) {
                localStorage.setItem(`${ourGame.stageUUID}_best-${MODE_LOCAL.get(ourGame.mode)}`, JSON.stringify(this.stageData));
                updateSumOfBest(ourPersist); // Updates BEST_OF_ALL.
            } else {
                // Doesn't Save Score to local Storage
            }
            
        }

        // Update Average Score 
        
        var globalStageStats = JSON.parse(localStorage.getItem("stageStats"));
        if (globalStageStats === null) {
            globalStageStats = {};
        }

        if (!globalStageStats[this.stageData.uuid]) {
            globalStageStats[this.stageData.uuid] = {
                plays: 1,
                sum: this.stageData.calcTotal()
            }
        } else {
            globalStageStats[this.stageData.uuid].plays += 1;
            globalStageStats[this.stageData.uuid].sum += this.stageData.calcTotal();
        }

        localStorage.setItem("stageStats", JSON.stringify(globalStageStats));
        

        // #endregion

        // SOUND
        this.rankSounds = [];

        SOUND_RANK.forEach(soundID => {
            this.rankSounds.push(this.sound.add(soundID[0]));
            });

        // Pre Calculate needed values
        var stageAve = this.stageData.atomTime() / this.stageData.foodLog.length;

        if (localStorage.getItem(`${ourGame.stageUUID}_best-${MODE_LOCAL.get(ourGame.mode)}`)) {
            var bestLogJSON = JSON.parse(localStorage.getItem(`${ourGame.stageUUID}_best-${MODE_LOCAL.get(ourGame.mode)}`));

        } else {
            // If a test level. Use World 0_1 as a filler to not break UI stuff.
            var bestLogJSON = JSON.parse(localStorage.getItem(`${START_UUID}_best-Classic`))
        }

        var bestLog = new StageData(bestLogJSON);
        bestLog.zedLevel = calcZedObj(ourPersist.zeds).level;
    
        var bestLocal = bestLog.atomTime();
        var bestAve = bestLocal/bestLog.foodLog.length;

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

        var rankY = GRID * 9 - 0;

        this.scorePanelLRank = this.add.nineslice(-SCREEN_WIDTH/2, rankY + GRID * 1.5, 
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

        //STAGE CLEAR X_OFFSET + GRID * 2
        /*this.add.dom(SCREEN_WIDTH / 2, GRID * 5.8, 'div', Object.assign({}, STYLE_DEFAULT, {
            
            "text-shadow": "4px 4px 0px #000000",
            "font-size": '32px',
            'font-weight': 400,
            'text-transform': 'uppercase',
            "line-height": '125%',
            "font-family": '"Press Start 2P", system-ui',
            "min-width": SAFE_MIN_WIDTH,
            "textAlign": 'center',
            "white-space": 'pre-line'
        })).setHTML(
            (this.stageData.stage.replaceAll("_", " ") + " CLEAR")
        ).setOrigin(0.5, 0.5).setScale(.5);*/

        let formattedText = (this.stageData.stage.replaceAll("_", " ") + " CLEAR").toUpperCase(); // still need space font space to replace '_'

        this.add.bitmapText(SCREEN_WIDTH / 2, GRID * 5.8, 'mainFontLarge', formattedText, 13)
        .setOrigin(0.5,0.5);



        // #region Main Stats

        const scorePartsStyle = {
            color: "white",
            //"text-shadow": "2px 2px 4px #000000",
            "font-size":'16px',
            "font-weight": 400,
            "text-align": 'right',
            "white-space": 'pre-line'
        }
        
        const atomTimeLabel = this.add.dom(SCREEN_WIDTH/2 - GRID*2, GRID * 10 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `ATOM TIME:`
        ).setOrigin(1, 0).setScale(0.5);

        var atomTimeValue = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 10 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML( //_baseScore, then _speedbonus, then _baseScore + _speedbonus
                `${commaInt(0)}`
        ).setOrigin(1, 0).setScale(0.5);

        const stageScoreUILabel = this.add.dom(SCREEN_WIDTH/2 - GRID*2, GRID * 11 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `STAGE SCORE`
        ).setOrigin(1, 0).setScale(0.5);

        var stageScoreUIValue = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 11 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML( //_baseScore + _speedbonus
                `${commaInt(0)}`
        ).setOrigin(1, 0).setScale(0.5);


        // #region Atomic Food List

        var atomList = this.stageData.foodLog.slice();
        var scoreAtoms = [];
        var scoreCombos= [];
        var frameTime = 16.667;
        var delayStart = 600;
        
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
                        //this.ScoreContainerL.add(rectangle)
                        scoreCombos.push(rectangle)
                    }
                    break
                case logTime > BOOST_ADD_FLOOR:
                    //console.log(logTime, "Boost", i);
                    anim = "atomScore02";
                    scoreCombos.push(undefined);
                    break
                case logTime > SCORE_FLOOR:
                    //console.log(logTime, "Boost", i);
                    anim = "atomScore03";
                    scoreCombos.push(undefined);
                    break
                default:
                    //console.log(logTime, "dud", i);
                    anim = "atomScore04";
                    scoreCombos.push(undefined);
                    break
            }

            this.atomScoreIcon = this.add.sprite(_x, _y,'atomicPickupScore'
            ).play(anim).setDepth(21).setScale(1).setAlpha(0);
            //this.ScoreContainerL.add(this.atomScoreIcon);
            scoreAtoms.push(this.atomScoreIcon);
        }

        

        const rankProgressBar = this.add.graphics();

        var rankBarY = Y_OFFSET + GRID * 10 + 2;
        var rankBarX = X_OFFSET + GRID * 6 + 2;

        //const currentRankLetter = this.add.dom(X_OFFSET + GRID * 6 - 2, rankBarY - 2, 'div', Object.assign({}, STYLE_DEFAULT,
        //    scorePartsStyle, {
        //    })).setHTML(
        //        ` `
        //).setOrigin(1, 0.5).setScale(0.5);

        const nextRankLetter = this.add.dom(X_OFFSET + GRID * 16 - 6, rankBarY - 8, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `C`
        ).setOrigin(0.5, 0).setScale(0.5).setAlpha(0);

        var atomTime = 0;
        var stageScore;
        var cursorIndex = -1; // Plays sound at 0;
        
        var atomTimeTotal = atomList.reduce((a,b) => a + b, 0);
        var stageCache = this.cache.json.get(`${this.stageData.stage}.properties`);

        var sRankValue = undefined;
        // Could use .some here.
        stageCache.forEach( probObj => {
            if (probObj.name === "sRank") {
                sRankValue = Number(probObj.value);
            }
        });
        
        var scoreAtomsTween = this.tweens.addCounter({
            from: 0,
            to:  atomList.length - 1,
            delay: delayStart,
            duration: (frameTime * 4.5) * atomList.length,
            ease: 'Linear',
            onUpdate: _tween =>
            {    
                const index = Math.floor(_tween.getValue());

                if (index > cursorIndex) {
                    scoreAtoms[index].setAlpha(1);
                    if (scoreCombos[index]) {
                        scoreCombos[index].setAlpha(1);
                    }

                    ourGame.sound.play(Phaser.Math.RND.pick(['bubbleBop01','bubbleBopHigh01','bubbleBopLow01']));

                    atomTime += atomList[index];
                    atomTimeValue.setHTML(`${commaInt(atomTime)}`);

                    stageScore = calcStageScore(atomTime);
                    stageScoreUIValue.setHTML(
                        `<span style="font-size:16px;color:${COLOR_FOCUS};font-weight:600;">${commaInt(stageScore)}</span>`
                    );

                    cursorIndex = index;

                    const size = 106;
                    rankProgressBar.clear();

                    // Back Fill
                    rankProgressBar.fillStyle(0x2d2d2d);
                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size, 3);

                    //C0C0C0
                    //CD7F32

                    

                    
                    switch (true) {
                        case stageScore < RANK_BENCHMARKS.get(RANKS.BRONZE): // In Wood

                            var filled = (stageScore/RANK_BENCHMARKS.get(RANKS.BRONZE));
                        
                            rankProgressBar.fillStyle(0xA1662F);
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * filled, 3);
                            break;

                        case stageScore < RANK_BENCHMARKS.get(RANKS.SILVER): // In Bronze

                            //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.BRONZE);
                            var goal =  RANK_BENCHMARKS.get(RANKS.SILVER);

                            //currentRankLetter.setHTML(" ");
                            nextRankLetter.setHTML("B");
                            rankProgressBar.fillStyle(0xCD7F32);
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);

                            rankProgressBar.fillStyle(0xA1662F); // Wood
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);
                            break;
                        
                        case stageScore < RANK_BENCHMARKS.get(RANKS.GOLD): // In Silver
   
                            //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.SILVER);
                            var goal =  RANK_BENCHMARKS.get(RANKS.GOLD);

                            //currentRankLetter.setHTML(" ");
                            nextRankLetter.setHTML("A");
                            rankProgressBar.fillStyle(0xC0C0C0);
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);

                            rankProgressBar.fillStyle(0xCD7F32); // Bronze
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / goal), 3);
                            
                            rankProgressBar.fillStyle(0xA1662F); // Wood
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);

                            break;

                        case stageScore > RANK_BENCHMARKS.get(RANKS.GOLD): // In GOLD     
                            if (sRankValue != undefined) {
                                switch (true) {
                                    case stageScore < sRankValue:
                                        //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.GOLD);
                                        var goal =  sRankValue;
                                        //currentRankLetter.setHTML(" ");
                                        nextRankLetter.setHTML("S");
                                        
                                        rankProgressBar.fillStyle(0xd4af37);
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);
                                        
                                        rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / goal), 3);

                                        rankProgressBar.fillStyle(0xCD7F32); // Bronze
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / goal), 3);
                                        
                                        rankProgressBar.fillStyle(0xA1662F); // Wood
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);
                                        break;
                                    default:
                                        //currentRankLetter.setHTML(" ");

                                        var sRankDelta = sRankValue - RANK_BENCHMARKS.get(RANKS.GOLD);
                                        var postGold = stageScore - RANK_BENCHMARKS.get(RANKS.GOLD);

                                        var sX = Math.trunc(postGold / sRankDelta);
                                        console.log("MAX SCORE = ", sRankDelta * 10 + RANK_BENCHMARKS.get(RANKS.GOLD) - 1, "sDelta", sRankDelta, "10x - 1 + GOLD RANK");
                                        console.log("MAX SCORE = ", sRankDelta * 9 + RANK_BENCHMARKS.get(RANKS.GOLD) - 1, "sDelta", sRankDelta, "9x - 1 + GOLD RANK");

                                        if (sX > 1 ) {
                                            nextRankLetter.setHTML(`x${sX}`);
                                        } else {
                                            nextRankLetter.setHTML(`+`);
                                        }
                                        

                                        rankProgressBar.fillStyle(0xE5E4E2); // Platinum
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / stageScore), 3);

                                        rankProgressBar.fillStyle(0xd4af37); // Gold
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (sRankValue / stageScore), 3);
                                        
                                        rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / stageScore), 3);

                                        rankProgressBar.fillStyle(0xCD7F32); // Bronze
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / stageScore), 3);
                                        
                                        rankProgressBar.fillStyle(0xA1662F); // Wood
                                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / stageScore), 3);
                                        
                                        break;
                                }
                                
                            } else {
                                //currentRankLetter.setHTML(" ");
                                nextRankLetter.setHTML(`+`);
                                
                                rankProgressBar.fillStyle(0xd4af37); // Gold
                                rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / stageScore), 3);
                                
                                rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                                rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / stageScore), 3);

                                rankProgressBar.fillStyle(0xCD7F32); // Bronze
                                rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / stageScore), 3);
                                
                                rankProgressBar.fillStyle(0xA1662F); // Wood
                                rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / stageScore), 3);
                            }
                        
                            
                            break
                    
                        default:
                            debugger // Safety debugger
                            break;
                    }
                    
                }
            },
            onComplete: tween => {
                //debugger

                var atomTime = 0;

                for (let _index = 0; _index < scoreAtoms.length; _index++) {
                    scoreAtoms[_index].setAlpha(1);
                    if (scoreCombos[_index]) {
                        scoreCombos[_index].setAlpha(1);
                    }
                    atomTime += atomList[_index];
                }


                atomTimeValue.setHTML(`${commaInt(atomTime)}`);


                this.tweens.add({ 
                    targets: stageScoreUIValue,
                    alpha: 0,
                    ease: 'Linear',
                    duration: 250,
                    loop: 0,
                    yoyo: true,
                });
                stageScoreUIValue.setHTML(
                    `<span style="font-size:16px;color:${COLOR_FOCUS};font-weight:600;">${commaInt(calcStageScore(atomTime))}</span>`
                );

                stageScore = calcStageScore(atomTime);

                const size = 106;
                // #region rankBar
                switch (true) {
                    case stageScore <  RANK_BENCHMARKS.get(RANKS.BRONZE): // In Wood

                        var filled = (stageScore/RANK_BENCHMARKS.get(RANKS.BRONZE));
                    
                        rankProgressBar.fillStyle(0xA1662F);
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * filled, 3);
                        break;

                    case stageScore <  RANK_BENCHMARKS.get(RANKS.SILVER): // In Bronze

                        //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.BRONZE);
                        var goal =  RANK_BENCHMARKS.get(RANKS.SILVER);

                        //currentRankLetter.setHTML("C");
                        nextRankLetter.setHTML("B");
                        rankProgressBar.fillStyle(0xCD7F32);
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);

                        rankProgressBar.fillStyle(0xA1662F); // Wood
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);
                        break;
                    
                    case stageScore < RANK_BENCHMARKS.get(RANKS.GOLD): // In Silver

                        //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.SILVER);
                        var goal =  RANK_BENCHMARKS.get(RANKS.GOLD);

                        //currentRankLetter.setHTML("B");
                        nextRankLetter.setHTML("A");
                        rankProgressBar.fillStyle(0xC0C0C0);
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);

                        rankProgressBar.fillStyle(0xCD7F32); // Bronze
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / goal), 3);
                        
                        rankProgressBar.fillStyle(0xA1662F); // Wood
                        rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);

                        break;

                    case stageScore > RANK_BENCHMARKS.get(RANKS.GOLD): // In GOLD     
                        if (sRankValue != undefined) {
                            switch (true) {
                                case stageScore < sRankValue:
                                    //var remainder = stageScore % RANK_BENCHMARKS.get(RANKS.GOLD);
                                    var goal =  sRankValue;
                                    //currentRankLetter.setHTML("A");
                                    nextRankLetter.setHTML("S");
                                    
                                    rankProgressBar.fillStyle(0xd4af37);
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / goal), 3);
                                    
                                    rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / goal), 3);

                                    rankProgressBar.fillStyle(0xCD7F32); // Bronze
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / goal), 3);
                                    
                                    rankProgressBar.fillStyle(0xA1662F); // Wood
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / goal), 3);
                                    break;
                                default:
                                    //currentRankLetter.setHTML("S");

                                    var sRankDelta = sRankValue - RANK_BENCHMARKS.get(RANKS.GOLD);
                                    var postGold = stageScore - RANK_BENCHMARKS.get(RANKS.GOLD);

                                    var sX = Math.trunc(postGold / sRankDelta);

                                    if (sX > 1 ) {
                                        nextRankLetter.x  = nextRankLetter.x - 3;
                                        nextRankLetter.setHTML(`x${sX}`);
                                    } else {
                                        nextRankLetter.setHTML(`+`);
                                    }
                                    

                                    rankProgressBar.fillStyle(0xE5E4E2); // Platinum
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / stageScore), 3);

                                    rankProgressBar.fillStyle(0xd4af37); // Gold
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (sRankValue / stageScore), 3);
                                    
                                    rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / stageScore), 3);

                                    rankProgressBar.fillStyle(0xCD7F32); // Bronze
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / stageScore), 3);
                                    
                                    rankProgressBar.fillStyle(0xA1662F); // Wood
                                    rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / stageScore), 3);
                                    
                                    break;
                            }
                            
                        } else {
                            //currentRankLetter.setHTML("A");
                            nextRankLetter.setHTML(`+`);
                            
                            rankProgressBar.fillStyle(0xd4af37); // Gold
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (stageScore / stageScore), 3);
                            
                            rankProgressBar.fillStyle(0xC0C0C0); // SILVER
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.GOLD) / stageScore), 3);

                            rankProgressBar.fillStyle(0xCD7F32); // Bronze
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.SILVER) / stageScore), 3);
                            
                            rankProgressBar.fillStyle(0xA1662F); // Wood
                            rankProgressBar.fillRect(rankBarX, rankBarY - 4, size * (RANK_BENCHMARKS.get(RANKS.BRONZE) / stageScore), 3);
                        }     
                        break
                
                    default:
                        debugger // Safety debugger
                        break;
                }
            }
        });
        
        
        // #endregion

        var _baseScore = this.stageData.atomTime();
        

        var multLablesUI1 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 14 + 1, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                `DIFFICULTY +${0}%

                `
        ).setOrigin(1,0).setScale(0.5);
        var multLablesUI2 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 14 + 1, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                "font-size":'12px'
            })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                `
                ZED LVL +${0}%
                `
        ).setOrigin(1,0).setScale(0.5);
       
        //var multLablesUI3 = this.add.dom(SCREEN_WIDTH/2 - GRID*2.75, GRID * 13.625, 'div', Object.assign({}, STYLE_DEFAULT,
        //    scorePartsStyle, {
        //        "font-size":'12px'
        //    })).setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
        //        `
        //
        //        MEDAL +${0}%
        //        `
        //).setOrigin(1,0).setScale(0.5);

        var multDuration = 1000;

        var diffMult;
        var zedMult;
        var sumMult;

        var postMult = 0;
        var comboBo = 0;
        var bonkBo = 0;

        
        var preMult = this.stageData.preAdditive();
        var _bonusMult = this.stageData.bonusMult();
        var _postMult = this.stageData.postMult();

        const multValuesUI1 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 14 - 3, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `x ${0}%
                `
        ).setOrigin(1, 0).setScale(0.5);

        const multValuesUI2 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 14 - 3, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
            })).setHTML(
                `
                <hr style="font-size:3px"/><span style="font-size:16px">${0}</span>`
        ).setOrigin(1, 0).setScale(0.5);

        const postAdditiveLablesUI = this.add.dom(SCREEN_WIDTH/2 - GRID*2, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
        })).setOrigin(1,0).setScale(0.5);
        
        postAdditiveLablesUI.setHTML(
            `COMBO BONUS:
            NO-BONK BONUS:`
        );
        

        const comboBonusUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `${0}
                
                `
        ).setOrigin(1, 0).setScale(0.5);
        
        /*
        const postAdditiveValuesUI2 = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `
                `
        ).setOrigin(1, 0).setScale(0.5);
        */

        const noBonkBonusUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1.5, GRID * 16, 'div', Object.assign({}, STYLE_DEFAULT,
            scorePartsStyle, {
                //"font-size": '18px',
            })).setHTML(
                `
                ${0}`
        ).setOrigin(1, 0).setScale(0.5);
        
        scoreAtomsTween.on("complete", () => {
            this.tweens.addCounter({
                from: 0,
                to:  ourScoreScene.stageData.diffBonus,
                duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
                ease: 'linear',
                delay: 0, //133.3ms
                onUpdate: tween =>
                {
                    diffMult = Math.round(tween.getValue());
                    multLablesUI1.setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                        `DIFFICULTY +${diffMult}%
    
                        `
                    );
                }
            });
            
            var toZed = Number(ourScoreScene.stageData.zedLevelBonus() * 100).toFixed(2);
            this.tweens.addCounter({
                from: 0,
                to:  toZed,
                duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
                ease: 'linear',
                delay: 0, //133.3ms
                onUpdate: tween =>
                {
                    zedMult = tween.getValue().toFixed(1);
                    multLablesUI2.setHTML( //this.stageData.diffBonus,Number(this.stageData.zedLevelBonus() * 100.toFixed(1),this.stageData.medalBonus() * 100
                        `
                        ZED LVL +${zedMult}%
    
                        `  
                    );
                }
            });

            this.tweens.addCounter({
                from: 0,
                to:  1, //Number(_bonusMult * 100).toFixed(1),
                duration: atomList.length * (frameTime * 2) * this.scoreTimeScale, //33.3ms
                ease: 'linear',
                delay: 0, //?
                onUpdate: tween =>
                {
                    sumMult = diffMult + Number(zedMult);
                    postMult = Math.ceil(preMult * (sumMult / 100));
                    multValuesUI1.setHTML(
                        `x ${sumMult}%
                        `
                ).setOrigin(1, 0).setScale(0.5);
                },
                onComplete: () => {
                    multValuesUI2.setHTML(
                        `
                        <hr style="font-size:3px"/><span style="font-size:16px">${commaInt(Math.ceil(_postMult))}</span>`)
                    this.tweens.add({ 
                        targets: multValuesUI2,
                        alpha: [1,0],
                        ease: 'Linear',
                        duration: 250,
                        loop: 1,
                        yoyo: true,
                    });
                }
            });

            // TODO - Still needed?
            this.time.delayedCall(atomList.length * (frameTime * 2) * this.scoreTimeScale + 200, () => {
                comboBo = this.stageData.comboBonus();
                comboBonusUI.setHTML(
                    `+${comboBo}
                    
                    `
                ).setOrigin(1, 0).setScale(0.5);

                if (this.stageData.comboBonus() > 9000) {
                    postAdditiveLablesUI.setHTML(
                        `FULL COMBO:
                        NO-BONK BONUS:`
                    );
                    
                }
            }, [], this);

            this.time.delayedCall(atomList.length * (frameTime * 2) * this.scoreTimeScale + 400, () => {
                bonkBo = this.stageData.bonkBonus();
                
                noBonkBonusUI.setHTML(
                    `
                    +${bonkBo}`
                ).setOrigin(1, 0).setScale(0.5);


                if(ourGame.mode === MODES.EXPERT || ourGame.mode === MODES.HARDCORE) {

                    var currentRank = this.stageData.stageRank();

                    var rankDiff = currentRank - this.scene.get("PersistScene").prevRank;

                    debugger // leave this until expert mode is debugged.
                    if (rankDiff > 0) {
                        ourPersist.coins += rankDiff;
                        // TO DO. Better Visual this is happening would be nice. Like tween up the value.
                        ourGame.coinUIText.setHTML(
                            `${commaInt(ourPersist.coins).padStart(2, '0')}`
                        )
                        this.scene.get("PersistScene").prevRank = currentRank; 
                    }
                    
                }
            }, [], this);


            // This tween needs to end last.
            
            this.tweens.addCounter({
                from: 0,
                to:  1,
                duration: atomList.length * (frameTime * 2) * this.scoreTimeScale + 500,
                ease: 'linear',
                delay: 0, //?
                onUpdate: tween => {
    
                    // #region bestBar
                    prevBestBar.clear();
                    
                    var value = postMult + bonkBo + comboBo;

                    finalScoreUI.setHTML(`FINAL SCORE: ${commaInt(value)}`);
                    
    
                    if (value < bestScore) {
                        prevBestBar.fillStyle(0x2d2d2d);
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY, barSize, 10);
                        
                        prevBestBar.fillStyle(COLOR_BONUS_HEX); // above average
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY, 
                            barSize * (value / bestScore), 
                        10);
                        
                        prevBestBar.fillStyle(COLOR_TERTIARY_HEX); // below average
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY, 
                            barSize * (Math.min(value, overallAverage) / bestScore), 
                        10);
    
                        prevBestBar.lineStyle(1, 0xffffff, 2.0); // ave bar
                        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY, 
                            barSize * (overallAverage / bestScore), 
                        10);
    
                        prevBestBar.lineStyle(1, 0xffffff, 2.0); // bar outline
                        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY, 
                            barSize, 
                        10);
    
                        
                    } else {
                        
                        prevBestUI.setHTML(`<span style="color:${COLOR_FOCUS}">NEW BEST ↑</span>`)
    
    
                        prevBestBar.fillStyle(COLOR_FOCUS_HEX); // new best
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY , 
                            barSize, 
                        11);
    
                        prevBestBar.fillStyle(COLOR_BONUS_HEX); // All green
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY , 
                            barSize * (bestScore / value), 
                        10);
                        
                        prevBestBar.fillStyle(COLOR_TERTIARY_HEX);
                        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY , 
                            barSize * (overallAverage / value), 
                        10);
    
                        prevBestBar.lineStyle(1, 0xffffff, 1.0); // ave bar
                        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY , 
                            barSize * (overallAverage / value), 
                        10);
                        ave.x = X_OFFSET + GRID * 3 + barSize * (overallAverage / value);
    
                        prevBestBar.lineStyle(1, 0xffffff, 1.0);
                        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY , 
                            barSize * (bestScore / value), 
                        10);
                        
                    }
                    
                },
                onComplete: tween => {

                    var value = postMult + bonkBo + comboBo;
                    finalScoreUI.setHTML(`FINAL SCORE: ${commaInt(value)}`);

                    // make Continue Visible Here
                    
                    continueText.setVisible(true);
                    this.tweens.add({
                        targets: continueText,
                        alpha: { from: 0, to: 1 },
                        ease: 'Sine.InOut',
                        duration: 1000,
                        repeat: -1,
                        yoyo: true
                    });


                    modeScoreContainer.each( item => {
                        item.setAlpha(1);
                    });

                },
            
            });
            



        }, this);

        const finalScoreUI = this.add.dom(X_OFFSET + GRID * 2, Y_OFFSET + GRID * 17.5 + 4, 'div', Object.assign({}, STYLE_DEFAULT,
            {
                "font-style": 'bold',
                "font-size": "28px",
                "font-weight": '400',
                "text-align": 'right',
                "text-shadow": '#000000 1px 0 6px',
            })).setHTML(
                //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                ` `
        ).setOrigin(0, 0.5).setDepth(20).setScale(0.5);

        const prevBestBar = this.add.graphics();

        var barSize = 138;
        var barY = Y_OFFSET + GRID * 18.5 + 8;

        var bestScore;
        if (BEST_OF_ALL.get(this.stageData.stage)) {
            bestScore = BEST_OF_ALL.get(this.stageData.stage).calcTotal();
        } else {
            debugger
            var tempJSONClassic = JSON.parse(localStorage.getItem(`${ourGame.uuid}_best-Classic`));
            if (tempJSONClassic != null) {

                var _stageDataClassic = new StageData(tempJSONClassic);
                bestScore = _stageDataClassic.calcTotal();

            } else {
                bestScore = this.stageData.calcTotal(); 
            }
        }
            
        
        var overallAverage = globalStageStats[this.stageData.uuid].sum / globalStageStats[this.stageData.uuid].plays;

        prevBestBar.fillStyle(0x2d2d2d);
        prevBestBar.fillRect(X_OFFSET + GRID * 3, barY , barSize, 10);

        prevBestBar.lineStyle(1, 0xffffff, 1.0); // ave bar
        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY , 
            barSize * (overallAverage / bestScore), 
        10);

        const ave = this.add.dom(X_OFFSET + GRID * 3 + barSize * (overallAverage / bestScore) - 2, barY + 6, 'div', Object.assign({}, STYLE_DEFAULT,
            {
                "font-style": 'bold',
                "font-weight": '400',
                "font-size": "14px",
                "text-align": 'center',
            })).setHTML(
                //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                `AVE`
        ).setOrigin(1, 0.5).setDepth(20).setScale(0.5);
        
        prevBestBar.lineStyle(1, 0xffffff, 1.0); // bar outline
        prevBestBar.strokeRect(X_OFFSET + GRID * 3, barY, barSize, 10);

        const prevBestUI = this.add.dom(X_OFFSET + GRID * 3 + barSize + 2, barY + GRID * 1 + 3, 'div', Object.assign({}, STYLE_DEFAULT,
            {
                "font-style": 'bold',
                "font-weight": '400',
                "font-size": "16px",
                "text-align": 'right',
            })).setHTML(
                //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                `BEST ↑`
        ).setOrigin(1, 0).setDepth(20).setScale(0.5);

        this.tweens.add({
            targets: [prevBestBar, prevBestUI, ave],
            alpha: [0, 1],
            ease: 'Sine.InOut',
            duration: 1000,
        }, this);

        

        if (ourGame.mode === MODES.PRACTICE) {
            // Show difference in best run to this run.

            var current = Math.floor(this.stageData.calcTotal());
            var bestScore = Math.floor(BEST_OF_ALL.get(this.stageData.stage).calcTotal())

            var deltaColor;
            var prefix;
            if (current > bestScore) {
                deltaColor = COLOR_BONUS;
                prefix = "+";
            } else {
                deltaColor = COLOR_FOCUS;
                prefix = "";
            }
            


            const historicalBest = this.add.dom(SCREEN_WIDTH/2, GRID * 23.35, 'div', Object.assign({}, STYLE_DEFAULT,
                {
                    "font-size": "16px",
                    "font-weight": '400',
                    "text-align": 'right',
                    "text-shadow": '#000000 1px 0 6px',
                })).setHTML(
                    //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                    `Saved Best*: ${commaInt(bestScore)}`
            ).setOrigin(1, 0.5).setDepth(20).setScale(0.5);
            
            const historicalDiff = this.add.dom(SCREEN_WIDTH/2, GRID * 24.10, 'div', Object.assign({}, STYLE_DEFAULT,
                {
                    "color": deltaColor,
                    "font-size": "16px",
                    "font-weight": '400',
                    "text-align": 'right',
                    "text-shadow": '#000000 1px 0 6px',
                })).setHTML(
                    //`STAGE SCORE: <span style="animation:glow 1s ease-in-out infinite alternate;">${commaInt(Math.floor(this.stageData.calcTotal()))}</span>`
                    `${prefix}${commaInt(current - bestScore)}`
            ).setOrigin(1, 0.5).setDepth(20).setScale(0.5);
        }

        
        this.ScoreContainerL.add(
            [this.scorePanelL,
            this.scorePanelLRank,
            atomTimeValue,
            //preAdditiveSpeedScoreUI1,
            stageScoreUILabel,
            stageScoreUIValue,
            atomTimeLabel,
            multLablesUI1,
            multLablesUI2,
            //multLablesUI3,
            multValuesUI1,
            multValuesUI2,
            postAdditiveLablesUI,
            comboBonusUI,
            //postAdditiveValuesUI2,
            noBonkBonusUI,
            rankProgressBar,
            //currentRankLetter,
            nextRankLetter,
         ]
        )

        for (let index = 0; index < scoreAtoms.length; index++) {
            if (scoreCombos[index]) {
                this.ScoreContainerL.add(scoreCombos[index]);
            }

            this.ScoreContainerL.add(scoreAtoms[index]); 
        }
        
        // #region Rank Sprites

        this.lights.enable();
        this.lights.setAmbientColor(0x3B3B3B);
        
        let rank = this.stageData.stageRank(); // FileNames start at 01.png
        
        //rank = 4; // Temp override.
        if (rank != 5) {
            var letterRank = this.add.sprite(X_OFFSET + GRID * 3.5, rankY , "ranksSpriteSheet", rank
            ).setDepth(20).setOrigin(0,0).setPipeline('Light2D');

        } else {
            debugger
            var letterRank = this.add.sprite(X_OFFSET + GRID * 3.5, rankY , "ranksSpriteSheet", 4
            ).setDepth(20).setOrigin(0,0).setPipeline('Light2D');
            letterRank.setTintFill(COLOR_BONUS_HEX);
        }
        
    

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
            var rankParticles = this.add.particles(X_OFFSET + GRID * 4.0, rankY, "twinkle01Anim", { 
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
            var rankParticles = this.add.particles(X_OFFSET + GRID * 4.0, rankY, "twinkle02Anim", {
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
            var rankParticles = this.add.particles(X_OFFSET + GRID * 3.5, rankY - GRID * 1.5, "twinkle0Anim", {
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
        if (rank === RANKS.GRAND_MASTER) {
            //
        }

        this.spotlight = this.lights.addLight(0, 0, 66, lightColor).setIntensity(1.5); //
        this.spotlight2 = this.lights.addLight(0, 0, 66, lightColor2).setIntensity(1.5); //

        this.ScoreContainerL.x -= SCREEN_WIDTH
        this.tweens.add({ //brings left score container into camera frame
            targets: this.ScoreContainerL,
            x: -GRID * 2,
            ease: 'Sine.InOut',
            duration: 500,
        });

        //var finalScoreTween = this.tweens.add({
        //    targets: finalScoreUI,
        //    x: SCREEN_WIDTH/2,
        //    ease: 'Sine.InOut',
        //    duration: 500,
        //    delay:2000,
        //});

        scoreAtomsTween.on("complete", () => {
            this.tweens.add({
                targets: letterRank,
                x: X_OFFSET + GRID * 3.5,
                ease: 'Sine.InOut',
                duration: 250,
                delay:0,
                onComplete: () =>
                    {
                        this.rankSounds[rank].play();
                        nextRankLetter.setAlpha(1);
                    },
            });
    
    
            this.tweens.add({
                targets: this.scorePanelLRank,
                x: X_OFFSET + GRID * 4.5,
                ease: 'Sine.InOut',
                duration: 200,
                delay:0,
            });
        }, this);

        
        
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

                MODE: <span style = "float: right">${bestLog.mode}</span>
                BASE SCORE: <span style = "float: right">${_baseScore}</span>
                STAGE SCORE: <span style = "float: right">${bestLog.stageScore()}</span>
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

    
        // important updates interal variables 
        updateSumOfBest(ourPersist);

        var modeScoreContainer = this.add.container();

        switch (true) {
            case ourGame.mode === MODES.CLASSIC 
                || ourGame.mode === MODES.EXPERT
                || ourGame.mode === MODES.TUTORIAL
                || ourGame.mode === MODES.PRACTICE:

                // #region Adventure
                var prevStagesComplete;
                var prevSumOfBest;
                var prevPlayerRank;

                var totalLevels;
                var newRank;
                var stagesComplete;
                var sumOfBest;

                switch (ourGame.mode) {
                    case MODES.CLASSIC:
                        prevStagesComplete = ourPersist.prevStagesCompleteAll;
                        prevSumOfBest = ourPersist.prevSumOfBestAll;
                        prevPlayerRank = ourPersist.prevPlayerRank;

                        totalLevels = Math.min(ourPersist.stagesCompleteAll + Math.ceil(ourPersist.stagesCompleteAll / 4), STAGE_TOTAL);
                        newRank = calcPlayerRank(ourPersist.sumOfBestAll);
                        stagesComplete = ourPersist.stagesCompleteAll;
                        sumOfBest = ourPersist.sumOfBestAll;

                        if (checkExpertUnlocked()) {
                            bestOfTitle = `Classic`
                        } else {
                            bestOfTitle = ``;
                        }

                        if (prevSumOfBest < sumOfBest) {
                            var bestIncrease = sumOfBest - prevSumOfBest;
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;"> + ${commaInt(bestIncrease.toFixed(0))}</span>`
                        } else {
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span>`
                        }
        
                        if (prevPlayerRank > newRank) {
        
                            var rankIncrease = prevPlayerRank - newRank;
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;">+ ${rankIncrease}</span>`
                        } else {
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span>`
                        }
                        
                        break;
                    case MODES.EXPERT:
                        prevStagesComplete = ourPersist.prevStagesCompleteExpert;

                        var rankScore = calcRankScore();
                        var expertRank = calcExpertRank(rankScore);

                        totalLevels = BEST_OF_ALL.size;
                        stagesComplete = ourPersist.stagesCompleteExpert;

                        bestOfTitle = `Expert`;

                        var goalContent = `CUMULATIVE RANKS : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(rankScore)}</span>`
                        var rankContent = `EXPERT RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${expertRank}%</span>`
                        
                        break;
                    
                    case MODES.TUTORIAL:
                        prevStagesComplete = ourPersist.prevStagesCompleteTut;
                        prevSumOfBest = ourPersist.prevSumOfBestTut;
                        prevPlayerRank = ourPersist.prevPlayerRankTut;

                        totalLevels = Math.min(ourPersist.stagesCompleteTut + Math.ceil(ourPersist.stagesCompleteTut / 4), STAGE_TOTAL);
                        newRank = calcPlayerRank(ourPersist.sumOfBestTut);
                        stagesComplete = ourPersist.stagesCompleteTut;
                        sumOfBest = ourPersist.sumOfBestTut;

                        if (prevSumOfBest < sumOfBest) {
                            var bestIncrease = sumOfBest - prevSumOfBest;
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;"> + ${commaInt(bestIncrease.toFixed(0))}</span>`
                        } else {
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span>`
                        }
        
                        if (prevPlayerRank > newRank) {
        
                            var rankIncrease = prevPlayerRank - newRank;
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;">+ ${rankIncrease}</span>`
                        } else {
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span>`
                        }
                        break

                    case MODES.PRACTICE:
                        prevStagesComplete = ourPersist.prevStagesCompleteAll;
                        prevSumOfBest = ourPersist.prevSumOfBestAll;
                        prevPlayerRank = ourPersist.prevPlayerRank;

                        // Show temporary + if you had done it in Classic or Expert.
                        totalLevels = Math.min(ourPersist.stagesCompleteAll + Math.ceil(ourPersist.stagesCompleteAll / 4), STAGE_TOTAL);
                        newRank = calcPlayerRank(ourPersist.sumOfBestAll);
                        stagesComplete = ourPersist.stagesCompleteAll;
                        sumOfBest = ourPersist.prevSumOfBestAll;

                        bestOfTitle = `Practice (Score Not Saved)`;

                        if (prevSumOfBest < sumOfBest) {
                            var bestIncrease = sumOfBest - prevSumOfBest;
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;"> + ${commaInt(bestIncrease.toFixed(0))}</span>`
                        } else {
                            var goalContent = `SUM OF BEST : <span style="color:goldenrod;font-style:italic;font-weight:bold;">${commaInt(sumOfBest.toFixed(0))}</span>`
                        }
        
                        if (prevPlayerRank > newRank) {
        
                            var rankIncrease = prevPlayerRank - newRank;
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span> <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;">+ ${rankIncrease}</span>`
                        } else {
                            var rankContent = `PLAYER RANK : <span style="color:goldenrod;font-style:italic;font-weight:bold;"> TOP ${newRank}%</span>`
                        }
                        break
                    
                    default:
                        // Leave this one as a safety trigger
                        debugger 
                        break;
                }

                
                var bestOfTitle;

                switch (ourGame.mode) {
                    case MODES.EXPERT:
                        bestOfTitle = `Expert`
                        break;
                    case MODES.PRACTICE:
                        bestOfTitle = `Practice (Score Not Saved)`
                        break;
                    default:
                        if (checkExpertUnlocked()) {
                            bestOfTitle = `Classic`
                        } else {
                            bestOfTitle = ``;
                        }
                        break;
                }
                
                if (prevStagesComplete < stagesComplete) {
                    var stageCompleteContents = `STAGES COMPLETE : ${commaInt(stagesComplete)} / ${totalLevels} + <span style="color:${COLOR_BONUS};font-style:italic;font-weight:bold;">1</span>`
                } else {
                    var stageCompleteContents = `STAGES COMPLETE : ${commaInt(stagesComplete)} / ${totalLevels}`
                }


                this.bestOfModeUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID *20.25, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize":'20px',
                    //"font-weight": '400',
                    "text-shadow": '#000000 1px 0 6px',
                    "font-style": 'italic',
                    //"font-weight": 'bold',
                    })).setHTML(
                        bestOfTitle
                ).setOrigin(0,0).setScale(0.5).setAlpha(0);
                
                this.stagesCompleteUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID *21.25, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize":'20px',
                    "font-weight": '400',
                    "text-shadow": '#000000 1px 0 6px',
                    //"font-style": 'italic',
                    //"font-weight": 'bold',
                    })).setHTML(
                        stageCompleteContents
                ).setOrigin(0,0).setScale(0.5).setAlpha(0);
                
                this.rankTargetUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID * 22.25, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize":'20px',
                    "font-weight": '400',
                    "text-shadow": '#000000 1px 0 6px',
                    //"font-style": 'italic',
                    //"font-weight": 'bold',
                    })).setHTML(
                        goalContent
                ).setOrigin(0,0).setScale(0.5).setAlpha(0);

                this.rankUI = this.add.dom(SCREEN_WIDTH/2 + GRID * 1, GRID * 23.25, 'div', Object.assign({}, STYLE_DEFAULT, {
                    "fontSize":'20px',
                    "font-weight": '400',
                    "text-shadow": '#000000 1px 0 6px',
                    //"font-style": 'italic',
                    //"font-weight": 'bold',
                    })).setHTML( // % ‰ ‱
                        rankContent
                ).setOrigin(0,0).setScale(0.5).setAlpha(0);
                // #endregion

                modeScoreContainer.add([
                    this.bestOfModeUI, this.rankTargetUI, this.stagesCompleteUI, this.rankUI
                ]);
                
                break;
            case ourGame.mode === MODES.GAUNTLET:
                break;
        
            default:
                debugger // Safety break. Keep this
                break;
        }



        
        // #region TOTAL SCORE
        var totalScore = 0;


        tempStageHistory.forEach( stageData => {
            totalScore += stageData.calcTotal();
        });

        this.prevZeds = this.scene.get("PersistScene").zeds;

        // #region Save Best Run
        var sumOfBase = 0;
        var _histLog = [];
        
        tempStageHistory.forEach( _stage => {
            _histLog = [ ..._histLog, ..._stage.foodLog];
            sumOfBase += _stage.atomTime();
            ourGame.nextScore += _stage.calcTotal();

        });


        if (bestrun < ourGame.score + ourScoreScene.stageData.calcTotal()) {
            localStorage.setItem('BestFinalScore', ourGame.score + ourScoreScene.stageData.calcTotal());
        }
        // #endregion   

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

        // END
        // #region prev tracker

        ourPersist.prevSumOfBestAll = ourPersist.sumOfBestAll;
        ourPersist.prevStagesCompleteAll = ourPersist.stagesCompleteAll;
        ourPersist.prevPlayerRank = calcPlayerRank(ourPersist.sumOfBestAll);

        ourPersist.prevSumOfBestExpert = ourPersist.sumOfBestExpert;
        ourPersist.prevStagesCompleteExpert = ourPersist.stagesCompleteExpert;
        ourPersist.prevPlayerRankExpert = calcPlayerRank(ourPersist.sumOfBestExpert);

        ourPersist.prevSumOfBestTut = ourPersist.sumOfBestTut;
        ourPersist.prevStagesCompleteTut = ourPersist.stagesCompleteTut;
        ourPersist.prevPlayerRankTut = calcPlayerRank(ourPersist.sumOfBestTut);

        var continue_text = '[SPACE TO CONTINUE]';
        
        var continueText = this.add.bitmapText(SCREEN_WIDTH/2, GRID*26, 'mainFontLarge', `SPACE TO CONTINUE`, 13)
        .setOrigin(0.5,0.5);

        /*var continueText = this.add.dom(SCREEN_WIDTH/2, GRID*27 + 0,'div', Object.assign({}, STYLE_DEFAULT, {
            "fontSize":'32px',
            "font-family": '"Press Start 2P", system-ui',
            "text-shadow": "4px 4px 0px #000000",
            //"text-shadow": '-2px 0 0 #fdff2a, -4px 0 0 #df4a42, 2px 0 0 #91fcfe, 4px 0 0 #4405fc',
            //"text-shadow": '4px 4px 0px #000000, -2px 0 0 limegreen, 2px 0 0 fuchsia, 2px 0 0 #4405fc'
            }
        )).setText(continue_text).setOrigin(0.5,0).setScale(.5).setDepth(25).setInteractive();
*/
        
        continueText.setVisible(false); 
        

        const onContinue = function (scene) {
            
            ourGame.backgroundBlur(false);

            console.log('pressing space inside score scene');

            var gameOver = false;

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

            ourGame.startArrows(ourGame.snake.head);
            

            
            if (ourGame.mode != MODES.PRACTICE) {
                console.log("ZedRolling");
                var rollResults = rollZeds(currentLocal);

                console.log("RollResults:", rollResults);
                console.log("RollsLeft:", rollResults.get("rollsLeft") ); // Rolls after the last zero best zero

                if (!DEBUG_SKIP_TO_SCENE) {
                    ourPersist.zeds += rollResults.get("zedsEarned");
                }

                ourSpaceBoy.zedTitle.setText(`+${plinkoMachine.zedsToAdd}`);
                if (plinkoMachine.countDownTween != null && plinkoMachine.countDownTween.isPlaying()) {
                    debugger
                    plinkoMachine.zedIndex = 1;
                    plinkoMachine.countDownTween.pause();
                }
                //plinkoMachine.spawnPlinkos(rollResults.get("bestZeros"));
                //ourSpaceBoy.spawnPlinkos(rollResults.get("bestZeros"));

                const zedObject = calcZedObj(ourPersist.zeds);
                console.log("ZedsToNext after rolling = ", zedObject.zedsToNext, ". Used to Tune 'maxZeds'");
4
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

            }
            
            
            // Turns off score post score screen.
            ourGame.events.off('addScore');


            
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
        this.time.delayedCall(250, function() {
            // Bit of time to not hold space and skip on accident.
            this.input.keyboard.on('keydown-SPACE', function() {
                if (continueText.visible) {
    
                    if (DEBUG_SKIP_TO_SCENE && DEBUG_SCENE === "ScoreScene") {
                        this.scene.start(DEBUG_SCENE, DEBUG_ARGS.get(DEBUG_SCENE));
                    } else {
                        onContinue(ourGame);
                    }
                    
                } else {
                    console.log("Not Visible Yet", continueText.visible);
                    // Early Complete
                    ourGame.sound.play(Phaser.Math.RND.pick(['bubbleBop01','bubbleBopHigh01','bubbleBopLow01']));
                    scoreAtomsTween.complete();
                }
            }, this);

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
        //this.load.image('upWASD', 'assets/sprites/upWASD.png')
        //this.load.image('downWASD', 'assets/sprites/downWASD.png');
        //this.load.image('leftWASD', 'assets/sprites/leftWASD.png');
        //this.load.image('rightWASD', 'assets/sprites/rightWASD.png');
        //this.load.image('spaceWASD', 'assets/sprites/spaceWASD.png');

    }
    create() {
    const ourGame = this.scene.get("GameScene");
    const ourInput = this.scene.get("InputScene");

    // disable camera for scenes with no rendered objects
    this.cameras.remove(this.cameras.main);


    var tempButtonScale = 10;
    var tempInOffSet = 8;
    var tempInputHeight = 35.5;

    this.input.addPointer(4);

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //this.upWASD = this.add.sprite(tempInOffSet * GRID, tempInputHeight * GRID - GRID*2.5, 'upWASD', 0
    //).setDepth(50).setOrigin(0,0).setScale(tempButtonScale).setInteractive();
    /*this.upWASD.on('pointerdown', function (pointer)
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

    });*/
    
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
        const ourPinball = this.scene.get("PinballDisplayScene");
        if (gameScene.snake.direction === DIRS.LEFT  || gameScene.snake.direction  === DIRS.RIGHT || // Prevents backtracking to death
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 1 || gameScene.stepMode)) { 

            //console.log("I'm Moving Up");
            
            this.setPLAY(gameScene);
            
                // At anytime you can update the direction of the snake.
            gameScene.snake.head.setTexture('snakeDefault', 6);
            gameScene.snake.direction = DIRS.UP;
            ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 4)
            
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
        const ourPinball = this.scene.get("PinballDisplayScene");
        if (gameScene.snake.direction  === DIRS.LEFT  || gameScene.snake.direction  === DIRS.RIGHT || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 1 || gameScene.stepMode)) { 
           

            this.setPLAY(gameScene);
            gameScene.snake.head.setTexture('snakeDefault', 7);
            gameScene.snake.direction = DIRS.DOWN;
            ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 3)

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
        const ourPinball = this.scene.get("PinballDisplayScene");
        if (gameScene.snake.direction  === DIRS.UP   || gameScene.snake.direction  === DIRS.DOWN || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 1 || gameScene.stepMode)) {
            
            this.setPLAY(gameScene);

            gameScene.snake.head.setTexture('snakeDefault', 4);
            gameScene.snake.direction = DIRS.LEFT;
            ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 2)

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
        const ourPinball = this.scene.get("PinballDisplayScene");
        if (gameScene.snake.direction  === DIRS.UP   || gameScene.snake.direction  === DIRS.DOWN || 
            gameScene.snake.direction  === DIRS.STOP || (gameScene.snake.body.length < 1 || gameScene.stepMode)) { 
            
            this.setPLAY(gameScene);
            gameScene.snake.head.setTexture('snakeDefault', 5);
            gameScene.snake.direction = DIRS.RIGHT;
            ourPinball.comboCoverSnake.setTexture('UI_comboSnake', 1)

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
        if (gameScene.gState === GState.START_WAIT) {
            const spaceBoy = this.scene.get("SpaceBoyScene");
            const ourPinball = this.scene.get("PinballDisplayScene");
            this.time.delayedCall(1000, spaceBoy.scoreTweenHide, [], spaceBoy); 

            // #cleanup - can move to only running when you actively move when game is paused.
            // fade out 'GO!'
            if (!gameScene.goFadeOut) { // this is called ever move state
                ourPinball.comboCoverReady.setTexture('UI_comboGo');
                ourPinball.comboCoverReady.setOrigin(1.5,0)
                gameScene.goFadeOut = true;
                this.tweens.add({
                    targets: ourPinball.comboCoverReady,
                    alpha: 0,
                    duration: 500,
                    ease: 'sine.inout',
                });
            }
        }
        
        if (gameScene.gState === GState.START_WAIT || gameScene.gState === GState.WAIT_FOR_INPUT || gameScene.gState === GState.PLAY) {
            // Temp - Should not check while playing, but needs to be robust enough to not have the extra check here.
            
            // Starting Game State
            gameScene.gState = GState.PLAY;
            gameScene.scoreTimer.paused = false;

            gameScene.activeArrows.forEach ( arrow => {
                gameScene.arrowStartupTween.stop();
                arrow.setAlpha(0);
            });
        }

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
        key: 'portalClose',
        frames: scene.anims.generateFrameNumbers('portals',{ frames: [ 9,8,7,6]}),
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

    scene.anims.create({
        key: 'wListOn',
        frames: scene.anims.generateFrameNumbers('wishlistButton1',{ frames: [0,1,2]}),
        frameRate: 32,
        repeat: 0
    });
    scene.anims.create({
        key: 'wListOff',
        frames: scene.anims.generateFrameNumbers('wishlistButton1',{ frames: [2,1,0]}),
        frameRate: 12,
        repeat: 0
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

    scene.anims.create({
        key: 'atom01Small',
        frames: scene.anims.generateFrameNumbers('atomicPickupUISmall',{ frames: [0,1,2,3,4,5,6,7,8,9]}),
        frameRate: 12,
        repeat: -1
    });
    scene.anims.create({
        key: 'atom02Small',
        frames: scene.anims.generateFrameNumbers('atomicPickupUISmall',{ frames: [10,11,12,13,14,15,16,17,18,19]}),
        frameRate: 8,
        repeat: -1
    });
    scene.anims.create({
        key: 'atom03Small',
        frames: scene.anims.generateFrameNumbers('atomicPickupUISmall',{ frames: [20,21,22,23,24,25,26,22,28,29]}),
        frameRate: 6,
        repeat: -1
    });
    scene.anims.create({
        key: 'atom04Small',
        frames: scene.anims.generateFrameNumbers('atomicPickupUISmall',{ frames: [30,31,32,33,34,35,36,37,38,39,40,41,42]}),
        frameRate: 4,
        repeat: -1
    });
    

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
      delay: 0,
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




// #region Utils
// move Utils to here

// Only use the following after BEST_OF_ALL is calibrated.
var checkExpertUnlocked = function () {

    return (
        checkRankGlobal(STAGES.get("9-4"), RANKS.WOOD)
        && checkRankGlobal(STAGES.get("10-4"), RANKS.WOOD)
    );
}

var checkHardcoreUnlocked = function () {

    var hasFalse = [...STAGES.values()].every( function(stage) {
        var passed = checkRankGlobal(stage, RANKS.WOOD)
        return passed == true;
    });
    return hasFalse;
}



// #endregion

var tempHeightDiff = 16;

// #region Config
var config = {
    type: Phaser.AUTO,  //Phaser.WEBGL breaks CSS TEXT in THE UI
    multiTexture: true,
    //seed: 100, fixes randomness
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
    physics: 
        { default: 'matter',
             matter: { 
                debug: false,
                gravity: { y: 1 },
                positionIterations: 6, //6
                velocityIterations: 4, //4
                constraintIterations: 2, //2
                timing: {
                    timestamp: 0,
                    timeScale: 1, //1
                },
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
    
    scene: [ StartScene, 
        MainMenuScene, PlinkoMachineScene,QuickMenuScene, //GalaxyMapScene, 
        PersistScene, TutorialScene,
        GameScene, InputScene, ScoreScene, 
        StageCodex, ExtractTracker,
        SpaceBoyScene, PinballDisplayScene,  MusicPlayerScene]
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

