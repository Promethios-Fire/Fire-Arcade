import {GRID, INVENTORY, MODES,} from "../SnakeHole.js"; //
import { TUTORIAL_PANELS } from './tutorialScreens.js';


const INVENTORY_X = 499;
const INVENTORY_Y = 136;
const INVENTORY_GRID = 19;


export const ITEMS = new Map();

ITEMS.set("piggybank", {
    piggybank: null,
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
});

ITEMS.set("gearbox", {
    gearbox: null,
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
});

ITEMS.set("comboTrainer", {
    comboTrainer: null,
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
});

ITEMS.set("comboTrainerX", {
    comboTrainerX: null,
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
});