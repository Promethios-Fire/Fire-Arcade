import { X_OFFSET, Y_OFFSET, GRID } from "../SnakeHole.js";

export var STAGE_OVERRIDES = new Map([
    ["Tutorial_1", {
        preFix: function (scene) {
            
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {

        }
    }],
    ["Tutorial_2", {
        preFix: function (scene) {

            debugger
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

            scene.time.delayedCall(5000, () => {
                scene.tutorialPrompt(X_OFFSET + scene.helpPanel.width/2 + GRID,
                     Y_OFFSET + scene.helpPanel.height/2 + GRID,2,)
            })

        },
        postFix: function (scene) {
            

        }
    }],
    ["Tutorial_3", {
        preFix: function (scene) {

            debugger
            scene.scene.get('PersistScene').coins = 20

        },
        postFix: function (scene) {

        }
    }],
]);