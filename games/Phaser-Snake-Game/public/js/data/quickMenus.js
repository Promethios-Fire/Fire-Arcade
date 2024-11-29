import { PLAYER_STATS, RANKS, START_STAGE, START_UUID, MODES} from "../SnakeHole.js";
import { TUTORIAL_PANELS } from "./tutorialScreens.js";
import { GAUNTLET_CODES, STAGES } from "./UnlockCriteria.js";

var qMenuCleanup = function () {
    this.scene.get("StageCodex").scene.stop();
    this.scene.get("ExtractTracker").scene.stop();
    this.scene.stop();
}

export const QUICK_MENUS = new Map([
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
            const ourGame = this.scene.get("GameScene");
            const ourPersist = this.scene.get("PersistScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");

            ourPersist.mode = MODES.CLASSIC;

            ourSpaceBoy.mapProgressPanelText.setText('ADVENTURE')

            this.scene.get("InputScene").scene.restart();

            if (localStorage.hasOwnProperty(`${START_UUID}_best-Classic`)) {
                var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);
                mainMenuScene.scene.launch('TutorialScene', [randomHowTo]);
            } else {
                mainMenuScene.scene.launch('TutorialScene', ["move", "atoms", "portals" , "boost"]);
            }

            mainMenuScene.scene.bringToTop('SpaceBoyScene');//if not called, TutorialScene renders above
            mainMenuScene.scene.stop();
            this.scene.stop();
        }],
        ["Expert", function () {
            const mainMenuScene = this.scene.get("MainMenuScene");
            const ourGame = this.scene.get("GameScene");
            const ourPersist = this.scene.get("PersistScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
           
            ourPersist.mode = MODES.EXPERT;

            ourSpaceBoy.mapProgressPanelText.setText('ADV. EXP')

            this.scene.get("InputScene").scene.restart();

            var randomHowTo = Phaser.Math.RND.pick([...TUTORIAL_PANELS.keys()]);
            mainMenuScene.scene.launch('TutorialScene', [randomHowTo]);
            mainMenuScene.scene.bringToTop('SpaceBoyScene');//if not called, TutorialScene renders above
            
            this.scene.stop();
            // Do Stuff
        }],
    ])],
    ["tab-menu-Classic", new Map([
        [`RETURN TO STAGE`, function () {  
            const ourGameScene = this.scene.get("GameScene");
            console.log("RETURN TO STAGE");
            ourGameScene.backgroundBlur(false);
            qMenuCleanup.call(this);  
        }],
        ['REDO STAGE (- 1 Coin)', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");


            if (ourPersist.coins > 0) {

                ourPersist.coins -= 1;
                ourPersist.loseCoin();
                
                // Clear for reseting game
                //ourGameScene.events.off('addScore');
                //ourGameScene.events.off('spawnBlackholes');
                //ourGameScene.scene.get("InputScene").scene.restart();

                /* Don't think I still need this.
                var previous = ourGameScene.scene.get("PersistScene").stageHistory.pop();
                if (previous != undefined) {
                    if (ourGameScene.stage != previous.stage) {
                        // Put It back
                        ourGameScene.scene.get("PersistScene").stageHistory.push(previous);
                    } else {
                        // Leave it out so you can run it again.
                    }
                } else {
                }
                */
                ourGameScene.backgroundBlur(false);
                ourGameScene.scene.restart( {
                    stage: ourGameScene.stage, 
                    score: ourGameScene.stageStartScore, 
                    mode: ourGameScene.mode
                    //lives: this.lives 
                });

                ourGameScene.gameSceneCleanup();
            }
            

            qMenuCleanup.call(this);   

        }],
        ['BACK TO MAIN MENU', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            
            console.log("BACK TO MAIN MENU");
            
            
            //ourPersist.comboCover.setVisible(true);
            ourGameScene.backgroundBlur(false);
            ourGameScene.gameSceneFullCleanup();

            ourGameScene.scene.start("MainMenuScene");
            

            qMenuCleanup.call(this); 
            return true;
        }],
        ['RESTART ADVENTURE', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            // TODO: send to origin


            // Clear for reseting game
            ourGameScene.gameSceneFullCleanup();
            ourPersist.stageHistory = [];
            
            ourGameScene.backgroundBlur(false);
            
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: START_STAGE,
                score: 0,
                startupAnim: true,
                mode: ourPersist.mode
            });

            qMenuCleanup.call(this); 
            return true;
        }],
    ])],
    ["tab-menu-Expert", new Map([
        [`RETURN TO STAGE`, function () {  
            const ourGameScene = this.scene.get("GameScene");
            console.log("RETURN TO STAGE");
            ourGameScene.backgroundBlur(false);
            qMenuCleanup.call(this);  
        }],
        ['REDO STAGE', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");

            ourGameScene.backgroundBlur(false);
            ourGameScene.scene.restart( {
                stage: ourGameScene.stage, 
                score: ourGameScene.stageStartScore, 
                mode: ourGameScene.mode
                //lives: this.lives 
            });

            ourGameScene.gameSceneCleanup();
            qMenuCleanup.call(this);   

        }],
        ['BACK TO MAIN MENU', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            
            console.log("BACK TO MAIN MENU");
            
            
            //ourPersist.comboCover.setVisible(true);
            ourGameScene.backgroundBlur(false);
            ourGameScene.gameSceneFullCleanup();

            ourGameScene.scene.start("MainMenuScene");
            

            qMenuCleanup.call(this); 
            return true;
        }],
        ['RESTART EXPERT ADVENTURE', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            // TODO: send to origin


            // Clear for reseting game
            ourGameScene.gameSceneFullCleanup();
            ourPersist.stageHistory = [];
            
            ourGameScene.backgroundBlur(false);
            
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: START_STAGE,
                score: 0,
                startupAnim: true,
                mode: ourPersist.mode
            });

            qMenuCleanup.call(this); 
            return true;
        }],
    ])],
    ["tab-menu-Practice", new Map([
        [`RETURN TO STAGE`, function () {  
            const ourGameScene = this.scene.get("GameScene");
            console.log("RETURN TO STAGE");
            ourGameScene.backgroundBlur(false);
            qMenuCleanup.call(this); 
        }],
        ['REDO STAGE', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");

            ourGameScene.backgroundBlur(false);
            ourGameScene.scene.restart( {
                stage: ourGameScene.stage, 
                score: ourGameScene.stageStartScore, 
                mode: ourGameScene.mode
                //lives: this.lives 
            });

            ourGameScene.gameSceneCleanup();
            
            qMenuCleanup.call(this);   

        }],
        ['BACK TO MAIN MENU', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            
            console.log("BACK TO MAIN MENU");
            
            ourGameScene.gameSceneFullCleanup();
            
            //ourPersist.comboCover.setVisible(true);
            ourGameScene.backgroundBlur(false);

            ourGameScene.scene.start("MainMenuScene");
            

            qMenuCleanup.call(this); 
            return true;
        }],
        ['PRACTICE SELECTION', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            // TODO: send to origin


            // Clear for reseting game
            ourGameScene.gameSceneFullCleanup();
            ourPersist.stageHistory = [];
            
            ourGameScene.backgroundBlur(false);
            
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: START_STAGE,
                score: 0,
                startupAnim: true,
                mode: ourPersist.mode
            });

            qMenuCleanup.call(this); 
            return true;
        }],
    ])],
    ["tab-menu-Gauntlet", new Map([
        [`RETURN TO STAGE`, function () {  
            const ourGameScene = this.scene.get("GameScene");
            console.log("RETURN TO STAGE");
            ourGameScene.backgroundBlur(false);
            qMenuCleanup.call(this);  
        }],
        ['REDO STAGE (- 1 Coin)', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");


            if (ourPersist.coins > 0) {

                ourPersist.coins -= 1;
                ourPersist.loseCoin();
                
                // Clear for reseting game
                //ourGameScene.events.off('addScore');
                //ourGameScene.events.off('spawnBlackholes');
                //ourGameScene.scene.get("InputScene").scene.restart();

                var previous = ourGameScene.scene.get("PersistScene").stageHistory.pop();
                if (previous != undefined) {
                    if (ourGameScene.stage != previous.stage) {
                        // Put It back
                        ourGameScene.scene.get("PersistScene").stageHistory.push(previous);
                    } else {
                        // Leave it out so you can run it again.
                    }
                } else {
                }
                ourGameScene.backgroundBlur(false);
                ourGameScene.scene.restart( {
                    stage: ourGameScene.stage, 
                    score: ourGameScene.stageStartScore, 
                    mode: ourGameScene.mode
                    //lives: this.lives 
                });

                ourGameScene.gameSceneCleanup();
            }
            

            qMenuCleanup.call(this);   

        }],
        ['BACK TO MAIN MENU', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            
            console.log("BACK TO MAIN MENU");
            
            ourGameScene.gameSceneFullCleanup();
            
            //ourPersist.comboCover.setVisible(true);
            ourGameScene.backgroundBlur(false);
            debugger

            ourGameScene.scene.start("MainMenuScene");
            qMenuCleanup.call(this); 
            return true;
        }],
        ['RESTART GAUNTLET', function () {
            const ourGameScene = this.scene.get("GameScene");
            const ourSpaceBoy = this.scene.get("SpaceBoyScene");
            const ourPersist = this.scene.get("PersistScene");
            // TODO: send to origin


            // Clear for reseting game
            ourGameScene.gameSceneFullCleanup();
            ourPersist.gauntlet = GAUNTLET_CODES.get(ourPersist.gauntletKey).stages.split("|");
            ourPersist.stageHistory = [];
            
            ourGameScene.backgroundBlur(false);

            var startID = ourPersist.gauntlet.shift();
            // Restart  
            ourGameScene.scene.start("GameScene", {
                stage: STAGES.get(startID),
                score: 0,
                startupAnim: true,
                mode: ourPersist.mode
            });

            qMenuCleanup.call(this); 
            return true;
        }],
    ])],
    
]);