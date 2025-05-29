import { X_OFFSET, Y_OFFSET, GRID, SPEED_WALK, SPEED_SPRINT, MODES, GState, DIRS, commaInt } from "../SnakeHole.js";
import { PORTAL_COLORS } from '../const.js';

export var STAGE_OVERRIDES = new Map([
    ["Tutorial_1", {
        preFix: function (scene) {
            
            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99

        },
        postFix: function (scene) {
            
            // Override checkWinCon()
            scene.checkWinCon = function(){
                if (scene.length >= 7 && !scene.winned) {
                    
                    scene.winned = true;
                    scene.gState = GState.TRANSITION;
                    scene.snake.direction = DIRS.STOP;

                    var vTween = scene.vortexIn(scene.snake.body, scene.snake.head.x, scene.snake.head.y);

                    var timeDelay = vTween.totalDuration;

                    scene.time.delayedCall(timeDelay + 75, () => {

                        scene.gameSceneFullCleanup();

                        scene.scene.start('TutorialScene', {
                            cards: ["move","atoms"],
                            toStage: "Tutorial_2",
                        });
                    });

                    /* This also works
                    vTween.on("complete", () => {
                        scene.scene.start('TutorialScene', {
                            cards: ["move","atoms"],
                            toStage: "Tutorial_2",
                        });
                    });
                    */
                    
                    // Scene Clean Up needed?
    
                } else {
                    return false;
                }
            }
        }

    }],
    ["Tutorial_2", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;


        },
        postFix: function (scene) {


            let counter = 7;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }


            scene.checkWinCon = function(){
                if (scene.length >= 14) {
                    scene.gameSceneFullCleanup();

                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_3",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_3", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.spawnCoins = false;
            scene.scene.get('PersistScene').coins = 99;

        },
        postFix: function (scene) {

            let counter = 14;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = function(){
                if (scene.length >= 21) {

                    scene.gameSceneFullCleanup();

                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_4",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_4", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            scene.scene.get('PersistScene').coins = 20

        },
        postFix: function (scene) {

            let counter = 21;
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.checkWinCon = function(){
                if (scene.length >= 28) { //28

                    scene.winned = true;
                    scene.gState = GState.TRANSITION;
                    scene.snake.direction = DIRS.STOP;

                    scene.gameSceneFullCleanup();

                    var howToCard = "move";
                    
                    scene.scene.start('TutorialScene', {
                        cards: [howToCard],
                        toStage: "Tutorial_5",
                    });
    
                } else {
                    return false;
                }
            }

        }
    }],
    ["Tutorial_5", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20
            //scene.skipScoreScreen = true;

        },
        postFix: function (scene) {

            let counter = 28; //28
            while (counter > 0) {
                scene.snake.grow(scene);
                counter--;
            }

            scene.winned = true;


            scene.events.emit('spawnBlackholes', scene.snake.direction);

            //this.events.emit('spawnBlackholes', ourGame.snake.direction);

            scene.checkWinCon = function() { // Returns Bool
                if (scene.lengthGoal > 0) { // Placeholder check for bonus level.
                    return scene.length >= scene.lengthGoal + 1; // Should never reach here.
                }
                
            }
        }
    }],

    ["Tutorial_6", {
        preFix: function (scene) {

            scene.mode = MODES.TUTORIAL;
            //scene.scene.get('PersistScene').coins = 20
            //scene.skipScoreScreen = true;

            //window.location.reload();

        },
        postFix: function (scene) {
            scene.gameSceneFullCleanup();
            scene.scene.start('MainMenuScene');
        }
    }],

    ["Bonus-Stage-x1", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;

            

        },
        postFix: function (scene) {

            // Override
            scene.onBonk = this.onBonk

        },
        onBonk: function () { // .this = GameScene
            var ourPersist = this.scene.get("PersistScene");
            this.coinsUIIcon.setVisible(false);
            ourPersist.coins = Math.max(ourPersist.coins -1, 1);

            if (ourPersist.coins != 1) {
                ourPersist.loseCoin();
            }
            this.coinUIText.setHTML(
            `${commaInt(ourPersist.coins).padStart(2, '0')}`
            );

            this.maxScore = Math.max(this.maxScore - 10, 1);
            
        }
    }],
    ["Bonus-Stage-x2", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;
            scene.maxScore = 60;
            scene.boostCost = 0;
        },
        postFix: function (scene) {
    
        },
        
    }],
    ["Bonus-Stage-x3", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.maxScore = 60;
            scene.boostCost = 0;
        },
        postFix: function (scene) {

            scene.onEat = this.onEat;
    
        },
        onEat: function (food) {
            this.atoms.delete(food);
            food.delayTimer.destroy();
            food.electrons.destroy();
            food.destroy();
        }
        
    }],
    ["Bonus-Stage-x4", {
        preFix: function (scene) {
            scene.lengthGoal = 0;
            scene.stopOnBonk = true;
            scene.maxScore = 60;
            scene.speedWalk = SPEED_SPRINT;
            scene.speedSprint = SPEED_WALK;
            scene.boostCost = 3;
        },
        postFix: function (scene) {
    
        },
        
    }],
]);