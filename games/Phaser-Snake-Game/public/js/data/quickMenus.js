import { PLAYER_STATS, RANKS, START_STAGE } from "../SnakeHole.js";
import { TUTORIAL_PANELS } from "./tutorialScreens.js";

export var QUICK_MENUS = new Map([
    /*
    ["adventure-mode", new Map([
        ["Normal", function () {
        }],
    ])]
    */
    ["adventure-mode", new Map([
        ["Tab to Menu", function () {
            this.scene.wake('MainMenuScene');
            this.scene.stop("QuickMenuScene");

        }],
        ["Classic", function () {
            const mainMenuScene = this.scene.get("MainMenuScene");
            ourGameScene.scene.get("InputScene").restart();

            if (localStorage.hasOwnProperty(`3026c8f1-2b04-479c-b474-ab4c05039999_best-Classic`)) {
                var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);
                mainMenuScene.scene.launch('TutorialScene', [randomHowTo]);
            } else {
                mainMenuScene.scene.launch('TutorialScene', ["move", "atoms", "portals" , "boost"]);
            }

            mainMenuScene.scene.bringToTop('SpaceBoyScene');//if not called, TutorialScene renders above
            this.scene.stop();
        }],
        ["Expert", function () {
            // Do Stuff
        }],
    ])],
    ["tab-menu", new Map([
        [`RETURN TO STAGE`, function () {  
            const ourGameScene = this.scene.get("GameScene");
            console.log("RETURN TO STAGE");
            ourGameScene.backgroundBlur(false);
            this.scene.stop(); 
        }],
        ['REDO STAGE (- 1 Coin)', function () {
            const ourGameScene = this.scene.get("GameScene");


            if (ourGameScene.scene.get("PersistScene").coins > 0) {

                ourGameScene.scene.get("PersistScene").coins -= 1;
                ourGameScene.scene.get("PersistScene").loseCoin();
                
                // Clear for reseting game
                ourGameScene.events.off('addScore');
                ourGameScene.events.off('spawnBlackholes');
                ourGameScene.scene.get("InputScene").scene.restart();

                var previous = ourGameScene.scene.get("SpaceBoyScene").stageHistory.pop();
                if (previous != undefined) {
                    if (ourGameScene.stage != previous.stage) {
                        // Put It back
                        ourGameScene.scene.get("SpaceBoyScene").stageHistory.push(previous);
                    } else {
                        // Leave it out so you can run it again.
                    }
                } else {
                }
                ourGameScene.backgroundBlur(false);
                ourGameScene.scene.restart( {
                    stage: ourGameScene.stage, 
                    score: ourGameScene.stageStartScore, 
                    //lives: this.lives 
                });
            }
            this.scene.stop();  

        }],
        ['BACK TO MAIN MENU', function () {
            const ourGameScene = this.scene.get("GameScene");
            
            console.log("BACK TO MAIN MENU");
            // Clear for reseting game

            ourGameScene.events.off('addScore');
            ourGameScene.events.off('spawnBlackholes');
            ourGameScene.scene.get("InputScene").scene.restart();
            
            ourGameScene.scene.start("MainMenuScene");
            ourGameScene.backgroundBlur(false);
            this.scene.stop(); 
            return true;
        }],
        ['RESTART ADVENTURE', function () {
            const ourGameScene = this.scene.get("GameScene");
            // TODO: send to origin


            // Clear for reseting game
            ourGameScene.events.off('addScore');
            ourGameScene.events.off('spawnBlackholes');
            ourGameScene.scene.get("InputScene").scene.restart();
            
            ourGameScene.backgroundBlur(false);
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: START_STAGE,
                score: 0,
                startupAnim: true,
            });

            this.scene.stop(); 
            return true;
        }],
    ])],
]);