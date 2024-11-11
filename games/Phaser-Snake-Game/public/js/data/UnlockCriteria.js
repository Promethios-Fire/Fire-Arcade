
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

export const STAGE_FILE = new Map([
    ["1-1", "World_1-1"],
    ["1-2", "World_1-2"],
    ["1-3", "World_1-3"],
    ["1-4", "World_1-4"],
    ["2-2", "World_2-2"],
    ["2-3", "World_2-3"],
    ["2-4", "World_2-4"],
    ["2-5", "World_2-5"],
    ["3-2", "World_3-2_Wrap"],
    ["3-3", "World_3-3_Wrap"],
    ["3-4", "World_3-4_Wrap"],
    ["4-2", "World_4-2"],
    ["4-3", "World_4-3"],
    ["4-4", "World_4-4"],
    ["4-5", "World_4-5"],
    ["4-6", "World_4-6"],
    ["5-2", "World_5-2_Racing"],
    ["8-2", "World_8-2_Adv_Portaling"],
    ["8-3", "World_8-3_Adv_Portaling"],
    ["8-4", "World_8-4_Adv_Portaling"],
    ["8-5", "World_8-5_Adv_Portaling"],
    ["9-3", "World_9-3_Final_Exams"],
    ["9-4", "World_9-4_Final_Exams"],
    ["9-5", "World_9-5_Final_Exams"],
    ["10-3", "World_10-3"],
    ["10-4", "World_10-4"],
    ["10-5", "World_10-5"],
])

/* Template
        ['', function () { 
        return checkRank("", RANKS.WOOD)}],
*/


export const STAGE_UNLOCKS = new Map([
    ['dino-tess', function () { 
        return checkRank("World_4-4", RANKS.WOOD)}],
    ['og-plus', function () { 
        var checkLevels = [
            "World_1-2",
            "World_1-3",
            "World_1-4", 
            "World_2-2", 
            "World_2-3",
            "World_2-4",
        ];
        var pass = checkLevels.every(stage => {
            return checkRank(stage, RANKS.GOLD);
        });
        return pass}],
        //return checkRank("World_2-4", RANKS.GOLD)}],
    ['railgun', function () { 
        return checkRank("World_4-4", RANKS.WOOD)}],
    ['two-wide-corridors', function () { 
        return checkRank("World_8-4_Adv_Portaling", RANKS.WOOD)}],
    ['babies-first-wall', function () {
        return checkRank("World_1-1", RANKS.WOOD)}],
    ['two-wide-corridors', function () {
        return checkRank("World_8-4_Adv_Portaling", RANKS.WOOD);}],
    ['double-back-portals', function () {
        return checkRank("World_10-5", RANKS.WOOD);
    }],
    ['easy-wrap', function () {
        return PLAYER_STATS.wraps > 128;
    }],
    ['hard-wrap', function () {
        return checkRank("World_3-3_Wrap", RANKS.WOOD);
    }],
    ['more-blocks', function () {
        return checkRank("World_2-2", RANKS.WOOD);
    }],
    ['wrap-and-warp', function () {
        return checkRank("World_1-3", RANKS.WOOD);
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
        return checkRank("World_8-3_Adv_Portaling", RANKS.WOOD);
    }],
    ['hardest----for-now', function () {
        return checkRank("World_10-4", RANKS.WOOD);
    }],
    ['swirl-swirl', function () {
        return checkRank("World_4-5", RANKS.WOOD); // Should this one be harder to unlock?
    }],
    ['eye', function () {
        return checkRank("World_4-3", RANKS.WOOD);
    }],
    ['plus-plus', function () {
        return checkRank("World_10-3", RANKS.WOOD);
    }],
    ['col', function () {
        return checkRank("World_4-3", RANKS.WOOD);
    }],
    ['its-a-snek', function () {
        return checkRank("World_4-2", RANKS.WOOD);
    }],
    ['now-a-fourth', function () {
        return checkRank("World_8-4_Adv_Portaling", RANKS.WOOD);
    }],
    ['horizontal-uturns', function () {
        return checkRank("World_9-4_Final_Exams", RANKS.WOOD);
    }],
    ['horizontal-gaps', function () {
        return checkRank("World_9-3_Final_Exams", RANKS.WOOD); 
    }],
    ['first-medium', function () {
        return true;
    }],
    ['lights-out', function () {
        return false;
    }],
    ['easy-racer', function () {
        return checkRank("World_1-1", RANKS.PLATINUM);
    }],
    ['hello-ghosts', function () {
        return false;
    }],
    ['medium-happy', function () {
        return checkRank("World_2-4", RANKS.WOOD);
    }],
    ['bidirectional-portals', function () {
        return checkRank("World_8-2_Adv_Portaling", RANKS.WOOD); 
    }],
    ['start', function ( ) { 
        return true
    }],
    ['babies-first-wall', function () {
        return checkRank("World_1-1", RANKS.WOOD);
    }],
    ['horz-rows', function () {
        return checkRank("World_1-2", RANKS.WOOD);
    }],
    ['first-blocks', function () {
        return checkRank("World_1-4", RANKS.WOOD);
    }],
    ['medium-wrap', function () {
        return checkRank("World_3-2_Wrap", RANKS.WOOD)
    }],
]);