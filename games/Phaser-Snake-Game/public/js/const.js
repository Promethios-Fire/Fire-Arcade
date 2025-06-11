


import {GRID, INVENTORY, MODES,} from "./SnakeHole.js";
import { TUTORIAL_PANELS } from './data/tutorialScreens.js';

export const PORTAL_COLORS = [
    // This color order will be respected. TODO add Slice
    //'#AABBCC',
    //'#fc0303',
    //'#06f202',
    //'#e2f202',
    //'#fc03f8',
    //'#AABBCC',
    //'#EEDDCC',
    '#FF0000',
    '#ff9900',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#4a86e8',
    '#9900ff',
    '#ff00ff',





];

export const TRACKS = new Map([
    [123, "let-123_11-10.m4a"],
    [124, "let-124_11-10.m4a"],
    //[126, "let-126_11-10.m4a"],
    [128, "let-128_11-10.m4a"],
    [132, "let-132_11-18.m4a"],
    [138, "let-138_11-10.m4a"],
    [143, "let-143_11-18-2.m4a"],
    [154, "let-154_11-10.m4a"],
    [155, "let-155_11-10.m4a"],
    [159, "let-159_11-10.m4a"],
    [161, "let-161_11-10.m4a"],
    [164, "let-164_11-10.m4a"],
    [172, "let-172_11-18.m4a"],
    [174, "let-174_11-10.m4a"],
    [176, "let-176_11-10.m4a"],
    [177, "let-177_11-10.m4a"],
    [182, "let-182_11-10.m4a"],
    [184, "let-184_11-10.m4a"],

])
// Game over [149, "let-149-game-over_11-10"],

// Low Health Music [175, "let-175_11-10.m4a"],

export const PORTAL_TILE_RULES = { // TODO Move out of here
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

const INVENTORY_X = 499;
const INVENTORY_Y = 136;
const INVENTORY_GRID = 19;


export const ITEMS = new Map([
    ["piggybank", {
        addToInventory: function (scene) {
            var piggy = scene.add.sprite(INVENTORY_X -2,
                 INVENTORY_Y + INVENTORY_GRID * 10.25,'inventoryIcons',2)
            .setOrigin(0, 0).setDepth(80);

            piggy.name = "piggybank";

            //scene.invItems.set("piggybank", piggy);

            var target = piggy.getBottomRight();
            
            scene.savedCoinsUI = scene.add.bitmapText(target.x + GRID * 3.25, target.y - 6, 'mainFont',
                INVENTORY.get("savedCoins") ?? 0,
            8).setOrigin(1,1).setDepth(81)

            return piggy;

        },
        interact: function (scene) {
            return
        }
    }],
    ["gearbox", {
        addToInventory: function (scene) {
            var gearbox = scene.add.sprite(INVENTORY_X, INVENTORY_Y,
                'inventoryIcons',26)
            .setOrigin(0, 0).setDepth(80).setTint(0xFfc0cb);

            gearbox.name = "gearbox";

            scene.invItems.set("gearbox", gearbox);
            scene.invSettings.set("gearbox", "fast");

            var target = gearbox.getBottomRight();
            
            /*gearbox.text = scene.add.bitmapText(target.x, target.y, 'mainFont',
                "FAST",
            8).setOrigin(1,1).setDepth(81)*/

            return gearbox;
        },
        interact: function (scene) {

            var sprite = scene.invItems.get("gearbox");

            if (scene.invSettings.get("gearbox") === "fast") {

                //sprite.setTint(0x606000);
                scene.invSettings.set("gearbox", "slow");
                sprite.setFrame(27);
                //sprite.text.setText("SLOW");
                scene.scene.get("PersistScene").speedSprint = 138
                
            } else if (scene.invSettings.get("gearbox") === "slow") {
                //sprite.setTint(0xFfc0cb);
                sprite.setFrame(26);
                scene.invSettings.set("gearbox", "fast");
                //sprite.text.setText("FAST");
                scene.scene.get("PersistScene").speedSprint = 33
                
            }

            console.log("Sprint_Speed now = ", scene.scene.get("PersistScene").speedSprint);

            return
        }
    }],
    ["comboTrainer", {
        addToInventory: function (scene) {
            var item = scene.add.sprite(INVENTORY_X, INVENTORY_Y + INVENTORY_GRID * 6,
            'inventoryIcons',42).setOrigin(0, 0).setDepth(80);
            

            item.name = "comboTrainer";

            scene.invItems.set("comboTrainer", item);

            var target = item.getBottomRight();
            
            scene.comboTrainertPB = scene.add.bitmapText(target.x + 1, target.y - 6, 'mainFont',
                INVENTORY.get("comboTrainerHS") ?? 0,
            8).setOrigin(1,1).setDepth(81)

            return item;

        },
        interact: function (scene) {

            var selected = scene.invArray[scene.invIndex];
                selected.outLine.destroy();

            scene.inInventory = false;
            //this.scene.resume("MainMenuScene");

            var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);

            scene.scene.get("PersistScene").mode = MODES.PRACTICE;
            scene.scene.get("MainMenuScene").scene.start('TutorialScene', {
                cards: [randomHowTo],
                toStage: "Bonus_X-13",
            });
            return
        }
    }],
    ["comboTrainerX", {
        addToInventory: function (scene) {
            var item = scene.add.sprite(INVENTORY_X + INVENTORY_GRID, INVENTORY_Y + INVENTORY_GRID * 6,
            'inventoryIcons',43).setOrigin(0, 0).setDepth(80);

            

            item.name = "comboTrainerX";

            scene.invItems.set("comboTrainerX", item);

            var target = item.getBottomRight();
            
            scene.comboTrainerX_PB = scene.add.bitmapText(target.x + 1, target.y - 6, 'mainFont',
                INVENTORY.get("comboTrainerXHS") ?? 0,
            8).setOrigin(1,1).setDepth(81);


            return item;

        },
        interact: function (scene) {

            var selected = scene.invArray[scene.invIndex];
                selected.outLine.destroy();

            scene.inInventory = false;
            //this.scene.resume("MainMenuScene");

            var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);

            scene.scene.get("PersistScene").mode = MODES.PRACTICE;
            scene.scene.get("MainMenuScene").scene.start('TutorialScene', {
                cards: [randomHowTo],
                toStage: "Bonus_X-5",
            });
            return
        }
    }],
]);