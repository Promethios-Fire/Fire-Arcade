
import { BEST_OF_ALL, BEST_OF_EXPERT, PLAYER_STATS, RANKS, MODES } from "../SnakeHole.js";

//import { BEST_OF_ALL} from "../SnakeHole.js"

export var checkRankGlobal = function(stageName, targetRank) {
    if (BEST_OF_ALL.get(stageName) != undefined ) {
                
        var resultRank = BEST_OF_ALL.get(stageName).stageRank()
        var bool = resultRank >= targetRank
        return  bool;
    } else {
        //debugger
        return false;
    }

}

export var checkRank = function(stageName, targetRank) {
    // Only unlock on expert if you unlocked in classic.
    // But progress Expert just like you progress classic.
    
    switch (this.scene.get("GameScene").mode) {
        case MODES.CLASSIC:
            if (BEST_OF_ALL.get(stageName) != undefined ) {
                
                var resultRank = BEST_OF_ALL.get(stageName).stageRank()
                var bool = resultRank >= targetRank
                return  bool;
            } else {
                //debugger
                return false;
            }
            break;

        case MODES.EXPERT:
            if (BEST_OF_ALL.get(stageName) != undefined && BEST_OF_EXPERT.get(stageName) != undefined) {
                var resultRank = BEST_OF_EXPERT.get(stageName).stageRank()
                var bool = resultRank >= targetRank
                return  bool;
            } else {
                //debugger
                return false;
            } 
            break;
    
        default:
            break;
    }
}

export var checkCanExtract = function(stageID) {
    var checkEnds = [];
    EXTRACT_CODES.forEach(path => {
        if (path.includes(stageID)) {
            
            var splitPath = path.split("|");
            checkEnds.push(splitPath[splitPath.length - 1]);
        }
    })

    var hasPath = checkEnds.some(endID => {
        return BEST_OF_ALL.has(STAGES.get(endID))
    });

    return hasPath;

}

export const STAGES = new Map([
    ["0-1", "World_0-1"],
    ["1-1", "World_1-1"],
    ["1-2", "World_1-2"],
    ["1-3", "World_1-3"],
    ["2-1", "World_2-1"],
    ["2-2", "World_2-2"],
    ["2-3", "World_2-3"],
    ["2-4", "World_2-4"],
    ["3-1", "World_3-1_Wrap"],
    ["3-2", "World_3-2_Wrap"],
    ["3-3", "World_3-3_Wrap"],
    ["4-1", "World_4-1"],
    ["4-2", "World_4-2"],
    ["4-3", "World_4-3"],
    ["4-4", "World_4-4"],
    ["4-5", "World_4-5"],
    ["5-1", "World_5-1_Racing"],
    ["5-2", "World_5-2_Racing"],
    ["5-3", "World_5-3_Racing"],
    ["5-4", "World_5-4_Racing"],
    ["8-1", "World_8-1_Adv_Portaling"],
    ["8-2", "World_8-2_Adv_Portaling"],
    ["8-3", "World_8-3_Adv_Portaling"],
    ["8-4", "World_8-4_Adv_Portaling"],
    ["8-5", "World_8-5_Adv_Portaling"],
    ["9-2", "World_9-2_Final_Exams"],
    ["9-3", "World_9-3_Final_Exams"],
    ["9-4", "World_9-4_Final_Exams"],
    ["10-2", "World_10-2"],
    ["10-3", "World_10-3"],
    ["10-4", "World_10-4"],

    ["G1-1", "Gauntlet_1-1"],
    ["G1-2", "Gauntlet_1-2"],
    ["G1-3", "Gauntlet_1-3"],
    ["G1-4", "Gauntlet_1-4"],
    ["G1-5", "Gauntlet_1-5"]
])

export const EXTRACT_CODES = [
    "0-1|1-1|1-2|1-3",
    "0-1|2-1|2-2|2-3",
    "0-1|2-1|2-2|2-4",
    "0-1|3-1|3-2|3-3",
    "0-1|4-1|4-2|4-3",
    "0-1|4-1|4-4|4-5",
    "0-1|5-1|5-2|5-3",
    "0-1|5-1|5-2|5-4",
    "0-1|8-1|8-2|8-4",
    "0-1|8-1|8-3|8-4",
    "0-1|8-1|8-2|8-5",
    "0-1|1-1|9-2|9-3|9-4",
    "0-1|2-1|10-2|10-3|10-4",
    
];

export const GAUNTLET_CODES = new Map([
    ["TRIAL I", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("2-4"), RANKS.WOOD);
        },
        stages: "G1-1|G1-2|G1-3|G1-4|G1-5", //"1-1|2-1|1-2|2-2|1-3|2-3|2-4"
        startingCoins: 8,
    }],
    /*["Easy Gauntlet", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("2-4"), RANKS.WOOD);
        },
        stages: "G1-1|2-1|1-2|2-2|1-3|2-3|2-4", //"1-1|2-1|1-2|2-2|1-3|2-3|2-4"
        startingCoins: 24,
    }],*/
    /*["Oops! All Ones", {
        checkUnlock: function () {
            var checkLevels = [
                STAGES.get("1-1"), STAGES.get("2-1"), STAGES.get("3-1"),
                STAGES.get("4-1"), STAGES.get("5-1"), STAGES.get("8-1"),
                STAGES.get("9-2"), STAGES.get("10-2"),
            ];
            var pass = checkLevels.every(stage => {
                return checkRankGlobal(stage, RANKS.WOOD);
            });
            return pass;
            //return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "1-1|2-1|3-1|4-1|5-1|8-1|9-2|10-2",
        startingCoins: 1,
    }],
    ["Tutorial Is Over -- Marathon", {
        checkUnlock: function () {
            return true;
            //return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "0-1|1-1|1-2|1-3|2-1|2-2|2-3|4-1|4-2|4-3|8-1|8-2|8-4|9-2|9-3|9-4|10-2|10-3|10-4",
        startingCoins: 36,
    }],
    ["Extra Worlds", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("5-4"), RANKS.WOOD);
        },
        stages: "5-1|3-1|5-2|3-2|5-3|3-3|5-4",
        startingCoins: 20,
    }],
    ["Hardest Only -- 0 Lives", {
        checkUnlock: function () {
            return checkRankGlobal(STAGES.get("4-5"), RANKS.WOOD);
        },
        stages: "4-5|9-4|10-4",
        startingCoins: 0,
    }],*/
]);

/* Template
        ['', function () { 
        return checkRank.call(this,"", RANKS.WOOD)}],
*/


export const STAGE_UNLOCKS = new Map([
    ['long-racer', function () { 
        return checkRank.call(this,STAGES.get("5-1"), RANKS.WOOD)}],
    ['tri-racer', function () { 
        return checkRank.call(this,STAGES.get("5-2"), RANKS.WOOD)}],
    ['hard-racer', function () { 
        var checkLevels = [
            STAGES.get("5-1"),
            STAGES.get("5-2"),
            STAGES.get("5-3"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.GOLD);
        });

        return pass}],
    ['you-portal-turn-now', function () { 
        var checkLevels = [
            STAGES.get("8-1"),
            STAGES.get("8-2"),
            STAGES.get("8-4"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.SILVER);
        });

        return pass}],
    ['dino-tess', function () { checkRank.bind(this);
        return checkRank.call(this,STAGES.get("4-3"), RANKS.WOOD)}],
    ['og-plus', function () { 
        var checkLevels = [
            STAGES.get("1-1"),
            STAGES.get("1-2"),
            STAGES.get("1-3"), 
            STAGES.get("2-1"), 
            STAGES.get("2-2"),
            STAGES.get("2-3"),
        ];
        var pass = checkLevels.every(stage => {
            return checkRank.call(this,stage, RANKS.GOLD);
        });
        return pass}],
        //return checkRank.call(this,["World_2-4", RANKS.GOLD)}],
    ['railgun', function () { 
        return checkRank.call(this,STAGES.get("4-3"), RANKS.WOOD)}],
    ['two-wide-corridors', function () {
        return checkRank.call(this,STAGES.get("8-4"), RANKS.WOOD);}],
    ['double-back-portals', function () {
        return checkRank.call(this,STAGES.get("10-4"), RANKS.WOOD);
    }],
    ['easy-wrap', function () {
        return PLAYER_STATS.wraps > 128;
    }],
    ['hard-wrap', function () {
        return checkRank.call(this,STAGES.get("3-2"), RANKS.WOOD);
    }],
    ['more-blocks', function () {
        return checkRank.call(this,STAGES.get("2-1"), RANKS.WOOD);
    }],
    ['wrap-and-warp', function () {
        return checkRank.call(this,STAGES.get("1-2"), RANKS.WOOD);
    }],
    ['learn-to-wrap', function () {
        return true;
    }],
    ['these-are-coins', function () {
        return true;
    }],
    ['welcome', function () {
        return true;
    }],
    ['unidirectional-portals', function () {
        return checkRank.call(this,STAGES.get("8-2"), RANKS.WOOD);
    }],
    ['hardest----for-now', function () {
        return checkRank.call(this,STAGES.get("10-3"), RANKS.WOOD);
    }],
    ['swirl-swirl', function () {
        return checkRank.call(this,STAGES.get("4-4"), RANKS.WOOD);
    }],
    ['eye', function () {
        return checkRank.call(this,STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['plus-plus', function () {
        return checkRank.call(this,STAGES.get("10-2"), RANKS.WOOD);
    }],
    ['col', function () {
        return checkRank.call(this,STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['its-a-snek', function () {
        return checkRank.call(this,STAGES.get("4-1"), RANKS.WOOD);
    }],
    ['now-a-fourth', function () {
        return checkRank.call(this,STAGES.get("8-4"), RANKS.WOOD);
    }],
    ['horizontal-uturns', function () {
        return checkRank.call(this,STAGES.get("9-3"), RANKS.WOOD);
    }],
    ['horizontal-gaps', function () {
        return checkRank.call(this,STAGES.get("9-2"), RANKS.WOOD); 
    }],
    ['first-medium', function () {
        return true;
    }],
    ['lights-out', function () {
        return false;
    }],
    ['easy-racer', function () {
        return checkRank.call(this,STAGES.get("0-1"), RANKS.PLATINUM);
    }],
    ['hello-ghosts', function () {
        return false;
    }],
    ['medium-happy', function () {
        return checkRank.call(this,STAGES.get("2-3"), RANKS.WOOD);
    }],
    ['bidirectional-portals', function () {
        return checkRank.call(this,STAGES.get("8-1"), RANKS.WOOD); 
    }],
    ['start', function ( ) { 
        return true
    }],
    ['babies-first-wall', function () {
        return checkRank.call(this,STAGES.get("0-1"), RANKS.WOOD);
    }],
    ['horz-rows', function () {
        return checkRank.call(this,STAGES.get("1-1"), RANKS.WOOD);
    }],
    ['first-blocks', function () {
        return checkRank.call(this,STAGES.get("1-3"), RANKS.WOOD);
    }],
    ['medium-wrap', function () {
        return checkRank.call(this,STAGES.get("3-1"), RANKS.WOOD)
    }],
]);