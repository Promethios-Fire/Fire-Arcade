
import { PLAYER_STATS, RANKS } from "../SnakeHole.js";

import { BEST_OF_STAGE_DATA} from "../SnakeHole.js"



var checkRank = function(stageName, targetRank) {
    
        if (BEST_OF_STAGE_DATA.get(stageName) != undefined ) {
            var resultRank = BEST_OF_STAGE_DATA.get(stageName).stageRank()
            var bool = resultRank >= targetRank
            return  bool;
        } else {
            //debugger
            return false;
        }
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
    ["8-1", "World_8-1_Adv_Portaling"],
    ["8-2", "World_8-2_Adv_Portaling"],
    ["8-3", "World_8-3_Adv_Portaling"],
    ["8-4", "World_8-4_Adv_Portaling"],
    ["9-2", "World_9-2_Final_Exams"],
    ["9-3", "World_9-3_Final_Exams"],
    ["9-4", "World_9-4_Final_Exams"],
    ["10-2", "World_10-2"],
    ["10-3", "World_10-3"],
    ["10-4", "World_10-4"],
])

/* Template
        ['', function () { 
        return checkRank("", RANKS.WOOD)}],
*/


export const STAGE_UNLOCKS = new Map([
    ['dino-tess', function () { 
        return checkRank(STAGES.get("4-3"), RANKS.WOOD)}],
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
            return checkRank(stage, RANKS.GOLD);
        });
        return pass}],
        //return checkRank("World_2-4", RANKS.GOLD)}],
    ['railgun', function () { 
        return checkRank(STAGES.get("4-3"), RANKS.WOOD)}],
    ['two-wide-corridors', function () { 
        return checkRank(STAGES.get("8-3"), RANKS.WOOD)}],
    ['babies-first-wall', function () {
        return checkRank(STAGES.get("0-1"), RANKS.WOOD)}],
    ['two-wide-corridors', function () {
        return checkRank(STAGES.get("8-3"), RANKS.WOOD);}],
    ['double-back-portals', function () {
        return checkRank(STAGES.get("10-4"), RANKS.WOOD);
    }],
    ['easy-wrap', function () {
        return PLAYER_STATS.wraps > 128;
    }],
    ['hard-wrap', function () {
        return checkRank(STAGES.get("3-2"), RANKS.WOOD);
    }],
    ['more-blocks', function () {
        return checkRank(STAGES.get("2-1"), RANKS.WOOD);
    }],
    ['wrap-and-warp', function () {
        return checkRank(STAGES.get("1-2"), RANKS.WOOD);
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
        return checkRank(STAGES.get("8-2"), RANKS.WOOD);
    }],
    ['hardest----for-now', function () {
        return checkRank(STAGES.get("10-3"), RANKS.WOOD);
    }],
    ['swirl-swirl', function () {
        return checkRank(STAGES.get("4-4"), RANKS.WOOD);
    }],
    ['eye', function () {
        return checkRank(STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['plus-plus', function () {
        return checkRank(STAGES.get("10-2"), RANKS.WOOD);
    }],
    ['col', function () {
        return checkRank(STAGES.get("4-2"), RANKS.WOOD);
    }],
    ['its-a-snek', function () {
        return checkRank(STAGES.get("4-1"), RANKS.WOOD);
    }],
    ['now-a-fourth', function () {
        return checkRank(STAGES.get("8-3"), RANKS.WOOD);
    }],
    ['horizontal-uturns', function () {
        return checkRank(STAGES.get("9-3"), RANKS.WOOD);
    }],
    ['horizontal-gaps', function () {
        return checkRank(STAGES.get("9-2"), RANKS.WOOD); 
    }],
    ['first-medium', function () {
        return true;
    }],
    ['lights-out', function () {
        return false;
    }],
    ['easy-racer', function () {
        return checkRank(STAGES.get("0-1"), RANKS.PLATINUM);
    }],
    ['hello-ghosts', function () {
        return false;
    }],
    ['medium-happy', function () {
        return checkRank(STAGES.get("2-3"), RANKS.WOOD);
    }],
    ['bidirectional-portals', function () {
        return checkRank(STAGES.get("8-1"), RANKS.WOOD); 
    }],
    ['start', function ( ) { 
        return true
    }],
    ['babies-first-wall', function () {
        return checkRank(STAGES.get("0-1"), RANKS.WOOD);
    }],
    ['horz-rows', function () {
        return checkRank(STAGES.get("1-1"), RANKS.WOOD);
    }],
    ['first-blocks', function () {
        return checkRank(STAGES.get("1-3"), RANKS.WOOD);
    }],
    ['medium-wrap', function () {
        return checkRank(STAGES.get("3-1"), RANKS.WOOD)
    }],
]);