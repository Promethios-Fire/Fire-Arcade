import {GRID, INVENTORY_DATA, MODES,} from "../SnakeHole.js"; //
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
            INVENTORY_DATA.get("savedCoins") ?? 0,
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
            'inventoryIcons',24)
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
            sprite.setFrame(24);
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
            INVENTORY_DATA.get("comboTrainerPB") ?? 0,
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
            INVENTORY_DATA.get("comboTrainerXPB") ?? 0,
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

ITEMS.set("skull", {
    skull: null,
    addToInventory: function (scene) {
        var item = scene.add.sprite(INVENTORY_X + INVENTORY_GRID * 0, INVENTORY_Y + INVENTORY_GRID * 4,
        'inventoryIcons',17).setOrigin(0, 0).setDepth(80);
        //item.setTint(0x880808);

        

        item.name = "skull";

        scene.invItems.set("skull", item);
        scene.invSettings.set("skullMult", 1);

        var target = item.getBottomRight();
        
        //scene.comboTrainerX_PB = scene.add.bitmapText(target.x + 1, target.y - 6, 'mainFont',
        //    INVENTORY.get("skull") ?? 0,
        //8).setOrigin(1,1).setDepth(81);

        return item;
    },
    interact: function (scene) {
        var sprite = scene.invItems.get("skull");

        if (scene.invSettings.get("skullMult") === 1) {
            scene.invSettings.set("skullMult", 5);
            sprite.setFrame(16);
            
        } else if (scene.invSettings.get("skullMult") === 5) {
            sprite.setFrame(17);
            scene.invSettings.set("skullMult", 1);
        }

        console.log("Skull On", scene.invSettings.get("skullMult"));
    }
})

ITEMS.set("classicCard", {
    template: null,
    addToInventory: function (scene) {
        var item = scene.add.sprite(INVENTORY_X + INVENTORY_GRID * 1, INVENTORY_Y + INVENTORY_GRID * 4,
        'inventoryIcons',14).setOrigin(0, 0).setDepth(80);
        //item.setTint(0x880808);

        item.name = "classicCard";

        scene.invItems.set("classicCard", item);

        var target = item.getBottomRight();
        
        item.invText = scene.add.bitmapText(target.x + 1, target.y - 6, 'mainFont',
            "",
        8).setOrigin(1,1).setDepth(81);

        if (INVENTORY_DATA.get("classicCardBank") > 0) {
            item.invText.setText(INVENTORY_DATA.get("classicCardBank"));
        }

        return item;
    },
    interact: function (scene) {

        if (INVENTORY_DATA.get("savedCoins") > 4) {

            let _invS = scene.invSettings;

            INVENTORY_DATA.set("classicCardBank", INVENTORY_DATA.get("classicCardBank") + 2);
            INVENTORY_DATA.set("savedCoins", INVENTORY_DATA.get("savedCoins") - 5);

            localStorage.setItem("inventory-data", JSON.stringify(Object.fromEntries(INVENTORY_DATA)));

            scene.invItems.get("classicCard").invText.setText(INVENTORY_DATA.get("classicCardBank"));

            scene.savedCoinsUI.setText(INVENTORY_DATA.get("savedCoins"));
        }
    }
});

ITEMS.set("sonicCoins", {
    sonicCoins: null,
    addToInventory: function (scene) {
        var item = scene.add.sprite(INVENTORY_X + INVENTORY_GRID * 2, INVENTORY_Y + INVENTORY_GRID * 4,
        'inventoryIcons',47).setOrigin(0, 0).setDepth(80);
        //item.setTint(0x880808);

        item.name = "sonicCoins";

        scene.invItems.set("sonicCoins", item);
        scene.invSettings.set("sonicCoins", false)
    },
    interact: function (scene) {
        var sprite = scene.invItems.get("sonicCoins");

        if (scene.invSettings.get("sonicCoins") === false) {
            scene.invSettings.set("sonicCoins", true);
            sprite.setFrame(46);
            
        } else if (scene.invSettings.get("sonicCoins") === true) {
            scene.invSettings.set("sonicCoins", false);
            sprite.setFrame(47);
        }

        console.log("Sonic On", scene.invSettings.get("sonicCoins"));
    }
})

ITEMS.set("slowPortals", {
    slowPortals: null,
    addToInventory: function (scene) {
        var item = scene.add.sprite(INVENTORY_X + INVENTORY_GRID * 0, INVENTORY_Y + INVENTORY_GRID * 3,
        'inventoryIcons',45).setOrigin(0, 0).setDepth(80);
        //item.setTint(0x880808);

        item.name = "slowPortals";

        scene.invItems.set("slowPortals", item);
        scene.invSettings.set("slowPortals", false)
    },
    interact: function (scene) {
        var sprite = scene.invItems.get("slowPortals");

        if (scene.invSettings.get("slowPortals") === false) {
            scene.invSettings.set("slowPortals", true);
            sprite.setFrame(44);
            
        } else if (scene.invSettings.get("slowPortals") === true) {
            scene.invSettings.set("slowPortals", false);
            sprite.setFrame(45);
        }

        console.log("SlowPortals", scene.invSettings.get("slowPortals"));
    }
})


ITEMS.set("template", {
    template: null,
    addToInventory: function (scene) {
    },
    interact: function (scene) {
    }
})